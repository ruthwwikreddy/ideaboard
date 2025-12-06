import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, RotateCcw, Check, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BuildPlanProps {
  plan: {
    summary: string;
    features: string[];
    phases: Array<{
      phase: number;
      title: string;
      features: string[];
      prompt: string;
    }>;
  };
  platform: string;
  onReset: () => void;
}

const platformUrls: Record<string, string> = {
  Lovable: "https://lovable.dev/invite/E51RSFR",
  Bolt: "https://bolt.new/?rid=z600g1",
  Replit: "https://replit.com/refer/akkenapallyredd",
  v0: "https://v0.app/ref/38YXBK",
};

export const BuildPlan = ({ plan, platform, onReset }: BuildPlanProps) => {
  const [copiedPhase, setCopiedPhase] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());





  const markStepComplete = (step: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(step);
    setCompletedSteps(newCompleted);
  };

  const handlePlatformLinkClick = () => {
    markStepComplete(1);
    toast.success("Step 1 completed!");
  };

  const copyPrompt = (prompt: string, phaseIndex: number, stepNumber: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPhase(phaseIndex);
    markStepComplete(stepNumber);
    toast.success("Prompt copied and step marked complete!");
    setTimeout(() => setCopiedPhase(null), 2000);
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    onReset();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Build Plan</h2>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">Ready to execute with {platform}</p>
            {completedSteps.size > 0 && (
              <Badge className="bg-success/20 text-success border-success/30">
                {completedSteps.size} / {plan.phases.length + 1} Steps Complete
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={resetProgress} variant="outline" className="border-border hover:bg-secondary">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-3">App Summary</h3>
        <p className="text-foreground/90 leading-relaxed">{plan.summary}</p>
      </Card>

      {/* Step-by-Step Execution */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Execution Steps</h3>

        {/* Step 1: Visit Platform */}
        <Card className={`p-6 bg-card border-l-4 transition-all ${completedSteps.has(1)
          ? "border-l-success bg-success/5"
          : "border-l-primary"
          }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {completedSteps.has(1) ? (
                <Badge className="bg-success text-background">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Step 1
                </Badge>
              ) : (
                <Badge className="bg-primary text-primary-foreground">Step 1</Badge>
              )}
              <h4 className="text-lg font-semibold">Visit {platform}</h4>
            </div>
            <a
              href={platformUrls[platform]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePlatformLinkClick}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Open Platform
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Create a new project on {platform} and get ready to paste the prompts below.
            </p>
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Build Phases */}
        {plan.phases.map((phase) => {
          const stepNumber = phase.phase + 2; // phase 0 = step 2, phase 1 = step 3, etc.
          const isCompleted = completedSteps.has(stepNumber);

          return (
            <Card
              key={phase.phase}
              className={`p-6 bg-card border-l-4 transition-all ${isCompleted
                ? "border-l-success bg-success/5"
                : "border-l-accent"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <Badge className="bg-success text-background">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Step {stepNumber}
                    </Badge>
                  ) : (
                    <Badge className="bg-accent text-accent-foreground">Step {stepNumber}</Badge>
                  )}
                  <h4 className="text-lg font-semibold">{phase.title}</h4>
                </div>
                <Button
                  onClick={() => copyPrompt(phase.prompt, phase.phase, stepNumber)}
                  variant="outline"
                  size="sm"
                  className={`border-border hover:bg-secondary ${isCompleted ? "bg-success/10 border-success/30" : ""
                    }`}
                >
                  {copiedPhase === phase.phase ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-success" />
                      Copied
                    </>
                  ) : isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Features in this phase:</p>
                  <ul className="space-y-1">
                    {phase.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-secondary rounded-lg border border-border">
                  <p className="text-sm font-mono text-foreground/90 whitespace-pre-wrap">{phase.prompt}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Final Step */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Badge className="bg-success text-background">Final Step</Badge>
          <h4 className="text-lg font-semibold">Polish & Deploy</h4>
        </div>
        <p className="text-foreground/90">
          After completing all phases, test your app thoroughly, add any finishing touches, and deploy it to your users!
        </p>
      </Card>
    </div>
  );
};
