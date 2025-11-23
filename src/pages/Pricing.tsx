import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Wand, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

const PLAN_DETAILS = {
  "free": { name: "Free", price: "₹0", generations: 1, features: ["1 Free Generation", "Basic Analytics"] },
  "basic": { name: "Basic Pack", price: "₹50", generations: 5, features: ["5 AI Generations", "Standard Analytics", "Email Support"] },
  "premium": { name: "Premium Pack", price: "₹75", generations: 10, features: ["10 AI Generations", "Advanced Analytics", "Priority Support"] },
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
      setSubscriptionDetails((subscription as any as SubscriptionDetails) || { plan_id: "free", status: "active" } as SubscriptionDetails);

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

  // Show low credit warning
  useEffect(() => {
    if (profileDetails && subscriptionDetails) {
      const currentPlanId = subscriptionDetails.plan_id || "free";
      const generationsUsed = profileDetails.generation_count || 0;
      const generationsLimit = getPlanLimit(currentPlanId);
      const remaining = generationsLimit - generationsUsed;

      if (remaining === 2) {
        toast.warning("⚠️ Only 2 credits remaining! Consider purchasing more credits to continue.", {
          duration: 5000,
        });
      } else if (remaining === 1) {
        toast.warning("⚠️ Only 1 credit remaining! Purchase credits now to avoid interruption.", {
          duration: 5000,
        });
      }
    }
  }, [profileDetails, subscriptionDetails]);

  const handlePlanSelection = async (planId: PlanId) => {
    if (!user) {
      toast.info("Please sign in to manage subscriptions.");
      navigate("/auth");
      return;
    }

    if (planId === "free") {
      toast.info("You already have 1 free generation. Purchase a pack for more!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planId, userId: user.id }
      });

      if (error) throw error;

      // Load Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "IdeaBoard",
        description: `${PLAN_DETAILS[planId].name} - ${PLAN_DETAILS[planId].generations} Credits`,
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#000000"
        },
        handler: async function(response: any) {
          toast.success("Payment successful! Credits added to your account.");
          // Wait a bit for webhook to process, then refetch
          await new Promise(resolve => setTimeout(resolve, 2000));
          await fetchUserDetails(user);
          window.location.reload();
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      // @ts-ignore - Razorpay is loaded via script
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      console.error("Payment error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to process payment. Please try again.");
      }
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
      <Helmet>
        <title>Buy Credits - IdeaBoard</title>
        <meta name="description" content="Purchase credit packs for AI-powered build plans. Choose from Basic (5 credits) or Premium (10 credits) packs. Credits never expire!" />
        <link rel="canonical" href="https://www.devplan.ai/pricing" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ideaboard.ai/pricing" />
        <meta property="og:title" content="Pricing Plans - IdeaBoard AI" />
        <meta property="og:description" content="Choose the perfect plan for your needs. From a free trial to premium features with advanced analytics, IdeaBoard AI has a plan for you." />
        <meta property="og:image" content="https://www.ideaboard.ai/logo.png" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ideaboard.ai/pricing" />
        <meta property="twitter:title" content="Pricing Plans - IdeaBoard AI" />
        <meta property="twitter:description" content="Choose the perfect plan for your needs. From a free trial to premium features with advanced analytics, IdeaBoard AI has a plan for you." />
        <meta property="twitter:image" content="https://www.ideaboard.ai/logo.png" />
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">Buy Credits</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline">Back to Dashboard</Button>
        </div>
        <p className="text-muted-foreground mb-6">Purchase credit packs to generate more AI-powered build plans. Credits never expire!</p>

        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(PLAN_DETAILS) as PlanId[]).map((planId) => (
            <Card key={planId} className={`flex flex-col ${currentPlanId === planId ? "border-primary ring-2 ring-primary" : ""}`}>
              <CardHeader>
                <CardTitle className="capitalize">{PLAN_DETAILS[planId].name}</CardTitle>
                <CardDescription>{PLAN_DETAILS[planId].price} {planId !== 'free' && '(one-time)'}</CardDescription>
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
                  disabled={isSubmitting || planId === 'free'}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : planId === 'free' ? (
                    "Free"
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {user && (
          <Card className="mt-8 p-6">
            <CardTitle>Your Credits</CardTitle>
            <CardContent className="mt-4 space-y-2">
              <p>Last Pack Purchased: <span className="font-semibold capitalize">{PLAN_DETAILS[currentPlanId].name}</span></p>
              <p>Credits Used: <span className="font-semibold">{generationsUsed}</span> out of <span className="font-semibold">{generationsLimit}</span></p>
              <p>Remaining Credits: <span className="font-semibold">{remainingGenerations}</span></p>
              {remainingGenerations === 0 && (
                <p className="text-destructive mt-2">⚠️ Out of credits! Purchase a pack above to continue.</p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Pricing;
