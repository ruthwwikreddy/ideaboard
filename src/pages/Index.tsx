import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wand, Loader2, ArrowRight, LogIn } from "lucide-react";
import { ResearchResults } from "@/components/ResearchResults";
import { PlatformSelector } from "@/components/PlatformSelector";
import { BuildPlan } from "@/components/BuildPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";
import { CheckCircle } from "lucide-react";
import Lovable from "@/assets/lovable.svg";
import Bolt from "@/assets/bolt.svg";
import V0 from "@/assets/v0.svg";
import Replit from "@/assets/replit.svg";

import { FloatingNavBar } from "@/components/FloatingNavBar";

// Lazy load heavy marketing components to improve INP
const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const FeaturesSection = lazy(() => import("@/components/Features").then(m => ({ default: m.Features })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const WhyIdeaBoard = lazy(() => import("@/components/WhyIdeaBoard").then(m => ({ default: m.WhyIdeaBoard })));
const SocialProof = lazy(() => import("@/components/SocialProof").then(m => ({ default: m.SocialProof })));
const CTABanner = lazy(() => import("@/components/CTABanner").then(m => ({ default: m.CTABanner })));

interface Research {
  problem: string;
  audience: string | any;
  competitors: Array<string | any>;
  marketGaps: string[];
  monetization: Array<string | any>;
  demandProbability: number;
}

interface BuildPhase {
  phase: number;
  title: string;
  features: string[];
  prompt: string;
}

interface BuildPlan {
  summary: string;
  features: string[];
  phases: BuildPhase[];
}

type Stage = "input" | "research" | "platform" | "plan";

const caseStudies = [
  {
    title: "SaaS for Photographers",
    description:
      "A solo founder used IdeaBoard to identify a niche market for a SaaS platform that helps photographers manage their client workflows. The AI-generated build plan saved them weeks of research and development time.",
    results: [
      "Identified a profitable niche in a crowded market.",
      "Saved over 40 hours of manual research.",
      "Launched a successful MVP in under 3 months.",
    ],
  },
  {
    title: "Mobile App for Local Farmers",
    description:
      "A small team of developers wanted to build an app to connect local farmers with consumers. IdeaBoard helped them validate their idea, understand their target audience, and create a feature roadmap.",
    results: [
      "Validated the demand for their app with a high demand score.",
      "Gained insights into the needs of their target audience.",
      "Secured seed funding with a solid business and development plan.",
    ],
  },
] as const;

const CaseStudies = React.memo(() => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Case Studies</h2>
        <p className="text-muted-foreground mt-2">
          See how others have used IdeaBoard to bring their ideas to life.
        </p>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        {caseStudies.map((study) => (
          <Card key={study.title}>
            <CardHeader>
              <CardTitle>{study.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{study.description}</p>
              <ul className="space-y-2">
                {study.results.map((result) => (
                  <li key={result} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
));
CaseStudies.displayName = 'CaseStudies';

const Affiliates = React.memo(() => (
  <section className="bg-black py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Trusted Platform Partners
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We're affiliated with the industry's leading AI development platforms to help you build faster and smarter
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto">
        <div className="group flex flex-col items-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
              src={Lovable}
              alt="Lovable"
              className="h-16 w-auto relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Lovable</p>
        </div>
        <div className="group flex flex-col items-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
              src={Bolt}
              alt="Bolt"
              className="h-16 w-auto relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Bolt</p>
        </div>
        <div className="group flex flex-col items-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
              src={V0}
              alt="V0"
              className="h-16 w-auto relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">V0</p>
        </div>
        <div className="group flex flex-col items-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
              src={Replit}
              alt="Replit"
              className="h-16 w-auto relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Replit</p>
        </div>
      </div>
    </div>
  </section>
));
Affiliates.displayName = 'Affiliates';

const Index = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("input");
  const [idea, setIdea] = useState("");
  const [research, setResearch] = useState<Research | null>(null);
  const [platform, setPlatform] = useState("");
  const [buildPlan, setBuildPlan] = useState<BuildPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // If user just signed in and has saved idea, restore it
      if (session?.user) {
        const savedIdea = localStorage.getItem('pendingIdea');
        if (savedIdea) {
          setIdea(savedIdea);
          localStorage.removeItem('pendingIdea');
          toast.success("Welcome back! Your idea has been restored.");
        }
      }
    });

    // Defer session check to not block initial render
    setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
    }, 0);

    return () => subscription.unsubscribe();
  }, []);

  // Check authentication when user tries to interact with textarea
  const handleTextareaFocus = () => {
    if (!user) {
      setShowAuthPrompt(true);
      // Save any existing input
      if (idea.trim()) {
        localStorage.setItem('pendingIdea', idea);
      }
      toast.info("Please sign in to use IdeaBoard", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth")
        },
        duration: 5000
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!user) {
      // Save to localStorage in case they sign in later
      localStorage.setItem('pendingIdea', e.target.value);
      setIdea(e.target.value);

      // Show auth prompt after a few characters
      if (e.target.value.length > 10 && !showAuthPrompt) {
        setShowAuthPrompt(true);
        toast.info("Sign in to analyze your idea", {
          action: {
            label: "Sign In",
            onClick: () => navigate("/auth")
          },
          duration: 5000
        });
      }
    } else {
      setIdea(e.target.value);
    }
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea");
      return;
    }

    if (!user) {
      toast.info("Please sign in or sign up to generate ideas.");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: { idea },
      });

      if (error) throw error;

      setResearch(data as Research);
      setStage("research");

      // Save project if user is logged in
      if (user) {
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            idea,
            research: data,
          })
          .select()
          .single();

        if (!projectError && projectData) {
          setCurrentProjectId((projectData as { id: string }).id);
        }
      }

      toast.success("Research completed!");
    } catch (error: unknown) {
      console.error("Error analyzing idea:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to analyze idea");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSelect = async (selectedPlatform: string) => {
    setPlatform(selectedPlatform);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-build-plan", {
        body: { idea, research, platform: selectedPlatform },
      });

      if (error) throw error;

      setBuildPlan(data as BuildPlan);
      setStage("plan");

      // Update project if user is logged in
      if (user && currentProjectId) {
        await supabase
          .from("projects")
          .update({
            platform: selectedPlatform,
            build_plan: data,
          })
          .eq("id", currentProjectId);
      }

      toast.success("Build plan generated!");
    } catch (error: unknown) {
      console.error("Error generating plan:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate build plan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage("input");
    setIdea("");
    setResearch(null);
    setPlatform("");
    setBuildPlan(null);
    setCurrentProjectId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingNavBar />
      <Helmet>
        <title>IdeaBoard - AI Idea Validation & Build Planning</title>
        <meta name="description" content="Transform your app idea into a build plan in minutes. Get AI-powered market research, competitor analysis, and platform-specific development plans." />
        <meta name="keywords" content="ai business plan generator, startup idea validation, market research automation, competitor analysis tool, app development plan, MVP builder, build plan generator" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ideaboard.live/" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ideaboard.live/" />
        <meta property="og:title" content="IdeaBoard - AI Idea Validation & Build Plans" />
        <meta property="og:description" content="Get AI-powered market research, competitor analysis & platform-specific build plans in minutes. Save 40+ hours of validation." />
        <meta property="og:image" content="https://ideaboard.live/logo.png" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ideaboard.live/" />
        <meta property="twitter:title" content="IdeaBoard - AI Idea Validation & Build Plans" />
        <meta property="twitter:description" content="AI-powered market research, competitor analysis, and build plans - all in minutes. Stop wasting weeks on validation." />
        <meta property="twitter:image" content="https://ideaboard.live/logo.png" />
        <meta name="twitter:site" content="@ideaboard_ai" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "IdeaBoard",
              "applicationCategory": "BusinessApplication",
              "url": "https://ideaboard.live",
              "description": "AI-powered platform for validating app ideas and generating comprehensive build plans with market research and competitor analysis.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              },
              "publisher": {
                "@type": "Organization",
                "name": "IdeaBoard",
                "logo": "https://ideaboard.live/logo.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "akkenapally.reddy@gmail.com",
                  "contactType": "Customer Service"
                }
              }
            }
          `}
        </script>
      </Helmet>
      {stage === "input" ? (
        <>
          <header className="absolute top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="IdeaBoard Logo" className="w-8 h-8" />
                <span className="font-bold text-xl tracking-tight">IdeaBoard</span>
              </div>
              <div className="flex items-center gap-4">
                {user ? (
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="ghost"
                    className="hover:bg-white/10"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate("/auth")}
                      variant="ghost"
                      className="hover:bg-white/10"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => navigate("/auth")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          <section className="hero pt-32">
            <div className="hero-grid">
              <div className="hero-left">
                <div className="hero-eyebrow">IdeaBoard · From Concept to Code in Minutes</div>
                <h1>Turn Your Idea Into a Build-Ready Plan</h1>
                <p className="hero-copy">
                  Stop wasting weeks on market research. IdeaBoard instantly validates your app idea, analyzes competitors,
                  scores market demand, and generates platform-specific build plans for Lovable, Bolt, V0, and Replit.
                </p>
                <div className="hero-pills">
                  <span>AI Market Research</span>
                  <span>Competitor Analysis</span>
                  <span>Demand Scoring</span>
                  <span>Build Blueprints</span>
                </div>
                <div className="hero-cta">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-full"
                    onClick={() => document.getElementById("idea-panel")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Start Building
                  </Button>
                  <div className="mt-6">
                    <a
                      href="https://www.producthunt.com/products/ideaboard?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ideaboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block hover:opacity-90 transition-opacity"
                    >
                      <img
                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1042389&theme=dark&t=1764089243094"
                        alt="IdeaBoard - Turn any idea into a build-ready plan in minutes. | Product Hunt"
                        style={{ width: '250px', height: '54px' }}
                        width="250"
                        height="54"
                      />
                    </a>
                  </div>
                </div>

              </div>
              <div className="hero-right space-y-6">
                <div className="hero-visual">
                  <div className="hero-visual-header">
                    <span>Execution radar</span>
                    <strong>Live</strong>
                  </div>
                  <ul className="hero-visual-list">
                    <li>
                      <span>Problem clarity</span>
                      <div className="hero-bar">
                        <div style={{ width: "92%" }} />
                      </div>
                      <span className="hero-score">92%</span>
                    </li>
                    <li>
                      <span>Demand probability</span>
                      <div className="hero-bar">
                        <div style={{ width: "84%" }} />
                      </div>
                      <span className="hero-score">84%</span>
                    </li>
                    <li>
                      <span>Prompt coverage</span>
                      <div className="hero-bar">
                        <div style={{ width: "100%" }} />
                      </div>
                      <span className="hero-score">3 phases</span>
                    </li>
                  </ul>
                  <div className="hero-visual-footer">
                    <p>IdeaBoard stitches research + tooling + prompts into a single move.</p>
                  </div>
                </div>

                <div className="hero-metrics">
                  <div>
                    <span className="metric-label">Average Time Saved</span>
                    <strong className="metric-value">40+ hours</strong>
                  </div>
                  <div>
                    <span className="metric-label">Success Rate</span>
                    <strong className="metric-value">92%</strong>
                  </div>
                  <div>
                    <span className="metric-label">Ideas Validated</span>
                    <strong className="metric-value">1,200+</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Affiliates />
        </>
      ) : (
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src="/logo.png" alt="IdeaBoard Logo" className="w-10 h-10" />
                    <div className="absolute inset-0 blur-lg bg-primary/30"></div>
                  </div>
                  <span className="text-3xl font-bold tracking-tight">IdeaBoard</span>
                </div>
                <p className="text-muted-foreground mt-2">From concept to code, instantly.</p>
              </div>
              {user ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="border-border hover:bg-secondary"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="border-border hover:bg-secondary"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </header>
      )
      }

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {stage === "input" && (
          <Card id="idea-panel" className="p-8 bg-card border-border shadow-lg scroll-mt-28">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">What's your idea?</h2>
                <p className="text-muted-foreground">
                  Describe your app idea and let AI research the market, competitors, and create a build-ready plan.
                </p>
              </div>

              {!user && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                  <LogIn className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-primary mb-1">Sign in required</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Please sign in or create an account to analyze your idea and generate a build plan.
                    </p>
                    <Button
                      onClick={() => {
                        // Save current idea if any
                        if (idea.trim()) {
                          localStorage.setItem('pendingIdea', idea);
                        }
                        navigate("/auth");
                      }}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In / Sign Up
                    </Button>
                  </div>
                </div>
              )}

              <Textarea
                placeholder="Example: A mobile app that helps freelancers track time and generate invoices automatically..."
                value={idea}
                onChange={handleTextareaChange}
                onFocus={handleTextareaFocus}
                className="min-h-[200px] text-lg bg-secondary border-border focus:border-primary transition-colors resize-none"
              />

              <Button
                onClick={handleAnalyze}
                disabled={loading || !idea.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg shadow-neon-cyan transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Idea
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {stage === "research" && research && (
          <ResearchResults research={research} onNext={() => setStage("platform")} onBack={handleReset} />
        )}

        {stage === "platform" && (
          <PlatformSelector onSelect={handlePlatformSelect} loading={loading} onBack={() => setStage("research")} />
        )}

        {stage === "plan" && buildPlan && (
          <BuildPlan plan={buildPlan} platform={platform} onReset={handleReset} />
        )}
      </main>

      {/* Additional sections */}
      {
        stage === "input" && (
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <SocialProof />
            <WhyIdeaBoard />
            <HowItWorks />
            <FeaturesSection />
            <CaseStudies />
            <Testimonials />
            <CTABanner />
          </Suspense>
        )
      }

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <Footer />
      </Suspense>
    </div >
  );
};

export default Index;