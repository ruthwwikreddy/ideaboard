
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Target, Rocket } from "lucide-react";

const steps = [
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "1. Share Your Idea",
    description:
      "Describe your app or business concept. The more detail, the better the analysis.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "2. Get AI-Powered Research",
    description:
      "Our AI analyzes the market, identifies competitors, and scores demand for your idea.",
  },
  {
    icon: <Rocket className="w-8 h-8 text-primary" />,
    title: "3. Generate Your Build Plan",
    description:
      "Receive a step-by-step plan with features, prompts, and a clear path to launch.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Turn your idea into a reality in three simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card border-border text-center">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
