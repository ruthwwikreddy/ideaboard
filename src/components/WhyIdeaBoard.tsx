import { Check, Zap, Target, TrendingUp, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
    {
        icon: Zap,
        title: "Save 40+ Hours",
        description: "Skip weeks of manual research. Get comprehensive market analysis in minutes, not days.",
    },
    {
        icon: Target,
        title: "92% Success Rate",
        description: "Our AI-validated ideas have a 92% success rate in finding product-market fit.",
    },
    {
        icon: TrendingUp,
        title: "Demand Scoring",
        description: "Know your market potential before you build. Get AI-powered demand probability scores.",
    },
    {
        icon: Shield,
        title: "Risk Reduction",
        description: "Identify market gaps and validate your idea before investing time and money.",
    },
    {
        icon: Users,
        title: "Competitor Insights",
        description: "Deep competitor analysis reveals what's working and where you can differentiate.",
    },
    {
        icon: Check,
        title: "Platform-Ready Plans",
        description: "Get build plans optimized for Lovable, Bolt, V0, and Replit - ready to execute.",
    },
];

export const WhyIdeaBoard = () => {
    return (
        <section className="py-20 bg-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Why Choose IdeaBoard?</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Stop guessing. Start building with confidence. IdeaBoard gives you the insights
                        and roadmap you need to turn your idea into reality.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;
                        return (
                            <Card key={benefit.title} className="bg-card border-border hover:border-primary/50 transition-all">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                                            <p className="text-muted-foreground">{benefit.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyIdeaBoard;
