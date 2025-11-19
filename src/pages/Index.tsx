import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
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
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">IdeaBoard AI</h1>
          </div>
          <p className="text-muted-foreground mt-2">Transform ideas into execution-ready build plans</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {stage === "input" && (
          <Card className="p-8 bg-card border-border shadow-lg">
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
