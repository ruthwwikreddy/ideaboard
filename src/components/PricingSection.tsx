import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    description: "Get started",
    features: ["1 Free Generation", "Basic Analytics", "Community Support"],
    popular: false,
  },
  {
    id: "basic",
    name: "Basic Pack",
    price: "₹50",
    description: "One-time purchase",
    features: ["5 AI Generations", "Standard Analytics", "Email Support", "Export to PDF"],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium Pack",
    price: "₹75",
    description: "Best value",
    features: ["10 AI Generations", "Advanced Analytics", "Priority Support", "Export to PDF", "Compare Projects"],
    popular: true,
  },
];

export const PricingSection: React.FC = React.memo(() => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Purchase credits to generate AI-powered build plans. No subscriptions, no hidden fees. Credits never expire!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col relative ${
                plan.popular
                  ? "border-primary ring-2 ring-primary shadow-lg shadow-primary/20"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.id !== "free" && (
                    <span className="text-muted-foreground text-sm ml-1">one-time</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/pricing")}
                >
                  {plan.id === "free" ? "Get Started" : "Buy Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            All payments are processed securely via Razorpay. Credits are added instantly after purchase.
          </p>
        </div>
      </div>
    </section>
  );
});

PricingSection.displayName = "PricingSection";
