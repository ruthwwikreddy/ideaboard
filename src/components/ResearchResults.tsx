import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Target, Users, TrendingUp, DollarSign, BarChart } from "lucide-react";

interface ResearchResultsProps {
  research: {
    problem: string;
    audience: string;
    competitors: string[];
    marketGaps: string[];
    monetization: string[];
    demandProbability: number;
  };
  onNext: () => void;
  onBack: () => void;
}

export const ResearchResults = ({ research, onNext, onBack }: ResearchResultsProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Research Results</h2>
          <p className="text-muted-foreground mt-1">AI-powered market analysis for your idea</p>
        </div>
        <Badge
          variant={research.demandProbability >= 70 ? "default" : "secondary"}
          className="text-lg px-4 py-2 bg-gray-200 text-black"
        >
          {research.demandProbability}% Demand Probability
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Problem Definition</h3>
              <p className="text-foreground/90 leading-relaxed">{research.problem}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Target Audience</h3>
              <p className="text-foreground/90 leading-relaxed">{research.audience}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-neon-green/10">
              <TrendingUp className="w-6 h-6 text-neon-green" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Market Gaps</h3>
              <ul className="space-y-2 mt-3">
                {research.marketGaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-neon-green mt-1">•</span>
                    <span className="text-foreground/90">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3">Competitors</h3>
                <ul className="space-y-1.5">
                  {research.competitors.map((competitor, index) => (
                    <li key={index} className="text-foreground/90 text-sm">
                      {competitor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3">Monetization</h3>
                <ul className="space-y-1.5">
                  {research.monetization.map((method, index) => (
                    <li key={index} className="text-foreground/90 text-sm">
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" className="border-border hover:bg-secondary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 shadow-neon-cyan"
        >
          Choose Build Platform
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
