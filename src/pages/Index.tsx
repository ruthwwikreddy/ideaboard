import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Wand, Loader2, ArrowRight, LogIn } from "lucide-react";
import { ResearchResults } from "@/components/ResearchResults";
import { PlatformSelector } from "@/components/PlatformSelector";
import { BuildPlan } from "@/components/BuildPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

interface Research {
  problem: string;
  audience: string;
  competitors: string[];
  marketGaps: string[];
  monetization: string[];
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      <Helmet>
        <title>IdeaBoard AI - Turn Your Idea into a Build-Ready Plan</title>
        <meta name="description" content="Validate your app idea, get in-depth market research, competitor analysis, and a step-by-step build plan with IdeaBoard AI. From concept to code, instantly." />
        <meta name="keywords" content="ai business plan, startup idea validation, market research, competitor analysis, app development plan" />
        <link rel="canonical" href="https://www.ideaboard.ai/" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ideaboard.ai/" />
        <meta property="og:title" content="IdeaBoard AI - Turn Your Idea into a Build-Ready Plan" />
        <meta property="og:description" content="Validate your app idea, get in-depth market research, competitor analysis, and a step-by-step build plan with IdeaBoard AI. From concept to code, instantly." />
        <meta property="og:image" content="https://www.ideaboard.ai/logo.png" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ideaboard.ai/" />
        <meta property="twitter:title" content="IdeaBoard AI - Turn Your Idea into a Build-Ready Plan" />
        <meta property="twitter:description" content="Validate your app idea, get in-depth market research, competitor analysis, and a step-by-step build plan with IdeaBoard AI. From concept to code, instantly." />
        <meta property="twitter:image" content="https://www.ideaboard.ai/logo.png" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://www.ideaboard.ai",
              "logo": "https://www.ideaboard.ai/logo.png",
              "name": "IdeaBoard AI",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "akkenapally.reddy@gmail.com",
                "contactType": "Customer Service"
              }
            }
          `}
        </script>
      </Helmet>
      {stage === "input" ? (
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-left">
              <div className="hero-eyebrow">DevPlan AI · From Concept to Code</div>
              <h1>What's your idea?</h1>
              <p className="hero-copy">
                Drop your concept and watch DevPlan AI spin up research, competitor analysis, demand scoring, and the
                prompts you need to ship faster than ever.
              </p>
              <div className="hero-pills">
                <span>Market intelligence</span>
                <span>Founder-grade prompts</span>
                <span>Affiliate-ready flows</span>
              </div>
              <div className="hero-cta">
                <button
                  className="primary"
                  onClick={() => document.getElementById("idea-panel")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Start mapping now
                </button>
                {user ? (
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="border-border hover:bg-secondary"
                  >
                    Profile
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
              <div className="hero-metrics">
                <div>
                  <span className="metric-label">Builders live</span>
                  <strong className="metric-value">4 partners</strong>
                </div>
                <div>
                  <span className="metric-label">Phases auto-generated</span>
                  <strong className="metric-value">3 per plan</strong>
                </div>
                <div>
                  <span className="metric-label">Ideas mapped</span>
                  <strong className="metric-value">Realtime</strong>
                </div>
              </div>
            </div>
            <div className="hero-right">
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
            </div>
          </div>
        </section>
      ) : (
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Wand className="w-8 h-8 text-primary" />
                    <div className="absolute inset-0 blur-lg bg-primary/30"></div>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">DevPlan AI</h1>
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
      )}

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

              <Textarea
                placeholder="Example: A mobile app that helps freelancers track time and generate invoices automatically..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
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
    </div>
  );
};

export default Index;
