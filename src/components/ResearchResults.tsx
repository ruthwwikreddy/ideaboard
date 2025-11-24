import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Target, Users, TrendingUp, DollarSign, BarChart, ThumbsUp, ThumbsDown } from "lucide-react";

interface ResearchResultsProps {
  research: {
    problem: string;
    audience: string | any;
    competitors: Array<string | any>;
    marketGaps: string[];
    monetization: Array<string | any>;
    demandProbability: number;
  };
  onNext: () => void;
  onBack: () => void;
}

export const ResearchResults = ({ research, onNext, onBack }: ResearchResultsProps) => {
  const renderAudience = (audience: string | any) => {
    if (typeof audience === 'string') {
      return <p className="text-foreground/90 leading-relaxed">{audience}</p>;
    }

    const renderDemographics = (demographics: any) => {
      if (typeof demographics === 'string') {
        return <p className="text-foreground/90 text-sm">{demographics}</p>;
      }
      return (
        <ul className="space-y-1 text-foreground/90 text-sm">
          {demographics.age && <li>Age: {demographics.age}</li>}
          {demographics.gender && <li>Gender: {demographics.gender}</li>}
          {demographics.location && <li>Location: {demographics.location}</li>}
          {demographics.income && <li>Income: {demographics.income}</li>}
        </ul>
      );
    };

    const renderPsychographics = (psychographics: any) => {
      if (typeof psychographics === 'string') {
        return <p className="text-foreground/90 text-sm">{psychographics}</p>;
      }
      return (
        <ul className="space-y-1 text-foreground/90 text-sm">
          {psychographics.values && <li>Values: {psychographics.values}</li>}
          {psychographics.lifestyle && <li>Lifestyle: {psychographics.lifestyle}</li>}
        </ul>
      );
    };
    const renderBehaviors = (behaviors: any) => {
      if (typeof behaviors === 'string') {
        return <p className="text-foreground/90 text-sm">{behaviors}</p>;
      }
      return (
        <ul className="space-y-1 text-foreground/90 text-sm">
          {Object.entries(behaviors).map(([key, value]) => (
            <li key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
            </li>
          ))}
        </ul>
      );
    };

    return (
      <div className="space-y-3">
        {audience.demographics && (
          <div>
            <h4 className="font-medium text-sm mb-1">Demographics</h4>
            {renderDemographics(audience.demographics)}
          </div>
        )}
        {audience.psychographics && (
          <div>
            <h4 className="font-medium text-sm mb-1">Psychographics</h4>
            {renderPsychographics(audience.psychographics)}
          </div>
        )}
        {audience.behaviors && (
          <div>
            <h4 className="font-medium text-sm mb-1">Behaviors</h4>
            {renderBehaviors(audience.behaviors)}
          </div>
        )}
        {audience['specific pain points'] && (
          <div>
            <h4 className="font-medium text-sm mb-1">Pain Points</h4>
            <p className="text-foreground/90 text-sm">{audience['specific pain points']}</p>
          </div>
        )}
        {audience.motivations && (
          <div>
            <h4 className="font-medium text-sm mb-1">Motivations</h4>
            <p className="text-foreground/90 text-sm">{audience.motivations}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCompetitor = (competitor: string | any) => {
    if (typeof competitor === 'string') {
      return competitor;
    }
    return (
      <div className="space-y-1">
        <p className="font-medium">{competitor.name}</p>
        {competitor.strengths && <p className="text-xs text-foreground/70">✓ {competitor.strengths}</p>}
        {competitor.weaknesses && <p className="text-xs text-foreground/70">✗ {competitor.weaknesses}</p>}
        {competitor.marketPositioning && <p className="text-xs text-foreground/70">⌖ {competitor.marketPositioning}</p>}
      </div>
    );
  };

  const renderMonetization = (method: string | any) => {
    if (typeof method === 'string') {
      return method;
    }
    return (
      <div className="space-y-1">
        <p className="font-medium">{method.strategy}</p>
        {method.pros && <p className="text-xs text-foreground/70">✓ {method.pros}</p>}
        {method.cons && <p className="text-xs text-foreground/70">✗ {method.cons}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Research Results</h2>
          <p className="text-muted-foreground mt-1">AI-powered market analysis for your idea</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          <Badge
            variant={research.demandProbability >= 70 ? "default" : "secondary"}
            className="text-lg px-4 py-2 bg-gray-200 text-black"
          >
            {research.demandProbability}% Demand Probability
          </Badge>
        </div>
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
              {renderAudience(research.audience)}
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
                <ul className="space-y-2">
                  {research.competitors.map((competitor, index) => (
                    <li key={index} className="text-foreground/90 text-sm">
                      {renderCompetitor(competitor)}
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
                <ul className="space-y-2">
                  {research.monetization.map((method, index) => (
                    <li key={index} className="text-foreground/90 text-sm">
                      {renderMonetization(method)}
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
