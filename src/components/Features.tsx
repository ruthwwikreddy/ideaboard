
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  ClipboardList,
  Compass,
  DollarSign,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <BarChart className="w-8 h-8 text-primary" />,
    title: "In-depth market analysis",
    description:
      "Get a clear picture of your market size, target audience, and demand probability.",
  },
  {
    icon: <Compass className="w-8 h-8 text-primary" />,
    title: "Competitor intelligence",
    description:
      "Identify key competitors and uncover gaps in the market you can exploit.",
  },
  {
    icon: <DollarSign className="w-8 h-8 text-primary" />,
    title: "Monetization strategies",
    description:
      "Discover the most effective ways to generate revenue from your idea.",
  },
  {
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
    title: "Step-by-step build plan",
    description:
      "Receive a detailed roadmap with phased features to guide your development.",
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Founder-grade prompts",
    description:
      "Generate high-quality prompts to accelerate your marketing and development.",
  },
  {
    icon: <BarChart className="w-8 h-8 text-primary" />,
    title: "Real-time execution radar",
    description:
      "Track your progress and stay focused on the most important tasks.",
  },
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Everything you need to ship
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            From idea to launch, DevPlan AI has you covered.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
