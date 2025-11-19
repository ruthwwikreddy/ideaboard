import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Wand, Loader2, ArrowRight } from "lucide-react";
import { ResearchResults } from "@/components/ResearchResults";
import { PlatformSelector } from "@/components/PlatformSelector";
import { BuildPlan } from "@/components/BuildPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Stage = "input" | "research" | "platform" | "plan";

const Index = () => {
  const [stage, setStage] = useState<Stage>("input");
  const [idea, setIdea] = useState("");
  const [research, setResearch] = useState<any>(null);
  const [platform, setPlatform] = useState("");
  const [buildPlan, setBuildPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: { idea },
      });

      if (error) throw error;

      setResearch(data);
      setStage("research");
      toast.success("Research completed!");
    } catch (error: any) {
      console.error("Error analyzing idea:", error);
      toast.error(error.message || "Failed to analyze idea");
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

      setBuildPlan(data);
      setStage("plan");
      toast.success("Build plan generated!");
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast.error(error.message || "Failed to generate build plan");
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
  };

  return (
    <div className="min-h-screen bg-background">
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
                <span>Avg. time-to-plan: 38 seconds</span>
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
            <div className="flex items-center gap-3">
              <div className="relative">
                <Wand className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/30"></div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">DevPlan AI</h1>
            </div>
            <p className="text-muted-foreground mt-2">From concept to code, instantly.</p>
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
