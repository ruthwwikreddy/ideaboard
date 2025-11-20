import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Wand, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";

const PLAN_DETAILS = {
  "free": { name: "Free", price: "₹0", generations: 5, features: ["5 Idea Generations/month", "Basic Analytics"] },
  "basic": { name: "Basic", price: "₹50", generations: 5, features: ["5 Idea Generations/month", "Standard Analytics", "Email Support"] },
  "premium": { name: "Premium", price: "₹75", generations: 10, features: ["10 Idea Generations/month", "Advanced Analytics", "Priority Support"] },
};

type PlanId = "free" | "basic" | "premium";

interface ProfileDetails {
  generation_count: number;
  last_generation_reset: string;
}

interface SubscriptionDetails {
  plan_id: PlanId;
  status: string;
}

const getPlanLimit = (planId: PlanId): number => {
  return PLAN_DETAILS[planId]?.generations || 0;
};

const Pricing = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchUserDetails(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserDetails = async (currentUser: User) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("generation_count, last_generation_reset")
        .eq("id", currentUser.id)
        .single();

      if (profileError) throw profileError;
      setProfileDetails(profile);

      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.warn("No active subscription found for user:", currentUser.id);
      }
      setSubscriptionDetails(subscription || { plan_id: "free", status: "active" });

    } catch (error: unknown) {
      console.error("Error fetching user details:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load user details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (planId: PlanId) => {
    if (!user) {
      toast.info("Please sign in to manage subscriptions.");
      navigate("/auth");
      return;
    }
    setIsSubmitting(true);
    try {
      if (planId === "free") {
        // For free plan, delete any existing active subscription
        const { error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("status", "active");

        if (error) throw error;
        setSubscriptionDetails({ plan_id: "free", status: "active" });
        toast.success("Switched to Free plan!");
      } else {
        // For paid plans, upsert or update the subscription
        const { data, error } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            plan_id: planId,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
          }, { onConflict: "user_id" })
          .select()
          .single();

        if (error) throw error;
        setSubscriptionDetails(data as SubscriptionDetails);
        toast.success(`Subscribed to ${PLAN_DETAILS[planId].name} plan!`);
      }
      // Re-fetch profile to ensure generation count is reset if plan changes
      await fetchUserDetails(user);
    } catch (error: unknown) {
      console.error("Error updating subscription:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update subscription");
      }
    } finally {
      setIsSubmitting(false);
    }
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
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wand className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DevPlan AI</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">Pricing Plans</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline">Back to Dashboard</Button>
        </div>

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

        {user && (
          <Card className="mt-8 p-6">
            <CardTitle>Your Current Usage</CardTitle>
            <CardContent className="mt-4 space-y-2">
              <p>Plan: <span className="font-semibold capitalize">{currentPlanId}</span></p>
              <p>Generations Used: <span className="font-semibold">{generationsUsed}</span> out of <span className="font-semibold">{generationsLimit}</span></p>
              <p>Remaining: <span className="font-semibold">{remainingGenerations}</span></p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Pricing;
