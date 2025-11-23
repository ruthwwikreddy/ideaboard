import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Wand, ArrowLeft, Loader2, Save, Check, X, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  generation_count: number;
  last_generation_reset: string;
}

interface ProfileDetails {
  generation_count: number;
  last_generation_reset: string;
}

interface SubscriptionDetails {
  plan_id: PlanId;
  status: string;
}

const PLAN_DETAILS = {
  "free": { name: "Free", price: "₹0", generations: 5, features: ["5 Idea Generations/month", "Basic Analytics"] },
  "basic": { name: "Basic", price: "₹50", generations: 5, features: ["5 Idea Generations/month", "Standard Analytics", "Email Support"] },
  "premium": { name: "Premium", price: "₹75", generations: 10, features: ["10 Idea Generations/month", "Advanced Analytics", "Priority Support"] },
};

type PlanId = "free" | "basic" | "premium";

const getPlanLimit = (planId: PlanId): number => {
  return PLAN_DETAILS[planId]?.generations || 0;
};

const Profile = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserDetails = useCallback(async (currentUser: User) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, generation_count, last_generation_reset")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        toast.error(profileError.message);
        throw profileError; // Re-throw to be caught by the outer catch
      }
      
      setProfile(profileData);
      setFullName(profileData.full_name || "");

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { count: projectsCount, error: projectsCountError } = await supabase
        .from("projects")
        .select("id", { count: 'exact' })
        .eq("user_id", currentUser.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (projectsCountError) {
        toast.error(projectsCountError.message);
        throw projectsCountError; // Re-throw to be caught by the outer catch
      }

      setProfileDetails({
        generation_count: projectsCount || 0, // Use actual project count for generationsUsed
        last_generation_reset: profileData.last_generation_reset,
      });

      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 means no rows found
        toast.error(subscriptionError.message);
        throw subscriptionError; // Re-throw to be caught by the outer catch
      }
      setSubscriptionDetails((subscription as any as SubscriptionDetails) || { plan_id: "free", status: "active" } as SubscriptionDetails);

    } catch (error: unknown) {
      console.error("Error fetching user details:", error);
      if (error instanceof Error) {
        toast.error(error.message); // Display specific error message
      } else {
        toast.error("Failed to load user details");
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        await fetchUserDetails(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchUserDetails]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user?.id);

      if (error) {
        toast.error(error.message);
        throw error; // Re-throw to be caught by the outer catch
      }

      toast.success("Profile updated successfully!");
      setProfile((prev) => prev ? { ...prev, full_name: fullName } : null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message); // Display specific error message
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePlanSelection = async (planId: PlanId) => {
    if (!user) {
      toast.info("Please sign in to manage subscriptions.");
      navigate("/auth");
      return;
    }

    if (planId === "free") {
      // Cancel subscription via edge function
      setIsSubmitting(true);
      try {
        const { error } = await supabase.functions.invoke('cancel-subscription');
        
        if (error) throw error;

        toast.success("Subscription will be cancelled at the end of the current period.");
        await fetchUserDetails(user);
      } catch (error: unknown) {
        console.error("Error cancelling subscription:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to cancel subscription");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For paid plans, redirect to pricing page
    toast.info("Redirecting to pricing page...");
    navigate("/pricing");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlanId = subscriptionDetails?.plan_id || "free";
  const generationsUsed = profileDetails?.generation_count || 0;
  const generationsLimit = getPlanLimit(currentPlanId);
  const remainingGenerations = generationsLimit - generationsUsed;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Your Profile - IdeaBoard AI</title>
        <meta name="description" content="Manage your profile settings, subscription plan, and view your usage statistics on IdeaBoard AI." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.ideaboard.ai/profile" />
      </Helmet>
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wand className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">IdeaBoard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="mb-6 border-border hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8 mb-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-secondary border-border"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-secondary border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl">Subscription & Usage</CardTitle>
            <CardDescription className="mt-2">Manage your plan and view your idea generation usage.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="mb-6">
              <h4 className="text-xl font-semibold mb-2">Your Current Usage</h4>
              <p>Plan: <span className="font-semibold capitalize">{currentPlanId}</span></p>
              <p>Generations Used: <span className="font-semibold">{generationsUsed}</span> out of <span className="font-semibold">{generationsLimit}</span></p>
              <p>Remaining: <span className="font-semibold">{remainingGenerations}</span></p>
            </div>

            <h4 className="text-xl font-semibold mb-4">Choose a Plan</h4>
            <div className="grid gap-6 md:grid-cols-3">
              {(Object.keys(PLAN_DETAILS) as PlanId[]).map((planId) => (
                <Card key={planId} className={`flex flex-col ${currentPlanId === planId ? "border-primary ring-2 ring-primary" : ""}`}>
                  <CardHeader>
                    <CardTitle className="capitalize">{PLAN_DETAILS[planId].name} Plan</CardTitle>
                    <CardDescription>{PLAN_DETAILS[planId].price}/month</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2 text-muted-foreground">
                      {PLAN_DETAILS[planId].features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handlePlanSelection(planId)}
                      disabled={currentPlanId === planId || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : currentPlanId === planId ? (
                        "Current Plan"
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;