import { Helmet } from "react-helmet-async";
import { Brain, Zap, Target, Layers, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import BackToHome from "@/components/BackToHome";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Research",
    description: "Deep market analysis powered by advanced AI that identifies problems, audiences, competitors, and market gaps in seconds.",
    benefits: ["Problem definition", "Audience analysis", "Competitor mapping", "Market gap identification"],
  },
  {
    icon: Target,
    title: "Demand Validation",
    description: "Get a probability score for real market demand based on comprehensive analysis of your idea's potential.",
    benefits: ["Demand probability scoring", "Market size estimation", "Trend analysis", "Risk assessment"],
  },
  {
    icon: Layers,
    title: "Multi-Phase Build Plans",
    description: "Automatically generated phased development plans optimized for your chosen MVP-builder platform.",
    benefits: ["Phased feature rollout", "Platform-specific prompts", "Copy-paste ready", "Progress tracking"],
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "From idea to actionable build plan in minutes, not weeks. Save 40+ hours of manual research and planning.",
    benefits: ["Minutes, not weeks", "No manual research", "Structured output", "Ready to execute"],
  },
  {
    icon: Sparkles,
    title: "Platform Integration",
    description: "Optimized prompts for leading MVP-builder platforms like Lovable, Bolt, V0, Replit, and more.",
    benefits: ["Lovable integration", "Bolt support", "V0 compatibility", "Replit ready"],
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Features - IdeaBoard AI</title>
        <meta name="description" content="Explore IdeaBoard's powerful features: AI research, demand validation, multi-phase build plans, and platform integrations." />
        <link rel="canonical" href="https://www.ideaboard.ai/features" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ideaboard.ai/features" />
        <meta property="og:title" content="Features - IdeaBoard AI" />
        <meta property="og:description" content="Explore IdeaBoard's powerful features: AI research, demand validation, multi-phase build plans, and platform integrations." />
        <meta property="og:image" content="https://www.ideaboard.ai/logo.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <BackToHome />

          {/* Hero Section */}
          <header className="text-center mb-20 mt-8">
            <div className="inline-block mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-purple-500 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
              Powerful Features
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Everything you need to validate your idea and create a comprehensive build plan,
              powered by cutting-edge AI technology.
            </p>
          </header>

          {/* Features Grid */}
          <section className="mb-24">
            <div className="grid gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.benefits.map((benefit, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your idea into a build-ready plan in minutes. No credit card required.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Building
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Features;
