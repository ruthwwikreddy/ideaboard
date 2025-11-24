import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Target,
  Users,
  TrendingUp,
  DollarSign,
  BarChart,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Sparkles
} from "lucide-react";

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
        <ul className="space-y-2 text-foreground/90 text-sm">
          {demographics.age && (
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">Age:</span> {demographics.age}</span>
            </li>
          )}
          {demographics.gender && (
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">Gender:</span> {demographics.gender}</span>
            </li>
          )}
          {demographics.location && (
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">Location:</span> {demographics.location}</span>
            </li>
          )}
          {demographics.income && (
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">Income:</span> {demographics.income}</span>
            </li>
          )}
        </ul>
      );
    };

    const renderPsychographics = (psychographics: any) => {
      if (typeof psychographics === 'string') {
        return <p className="text-foreground/90 text-sm">{psychographics}</p>;
      }
      return (
        <ul className="space-y-2 text-foreground/90 text-sm">
          {psychographics.values && (
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">Values:</span> {psychographics.values}</span>
            </li>
          )}
          {psychographics.lifestyle && (
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">Lifestyle:</span> {psychographics.lifestyle}</span>
            </li>
          )}
        </ul>
      );
    };

    const renderBehaviors = (behaviors: any) => {
      if (typeof behaviors === 'string') {
        return <p className="text-foreground/90 text-sm">{behaviors}</p>;
      }
      return (
        <ul className="space-y-2 text-foreground/90 text-sm">
          {Object.entries(behaviors).map(([key, value]) => (
            <li key={key} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {String(value)}</span>
            </li>
          ))}
        </ul>
      );
    };

    return (
      <div className="space-y-4">
        {audience.demographics && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Demographics</h4>
            {renderDemographics(audience.demographics)}
          </div>
        )}
        {audience.psychographics && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Psychographics</h4>
            {renderPsychographics(audience.psychographics)}
          </div>
        )}
        {audience.behaviors && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Behaviors</h4>
            {renderBehaviors(audience.behaviors)}
          </div>
        )}
        {audience['specific pain points'] && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Pain Points</h4>
            <p className="text-foreground/90 text-sm leading-relaxed">{audience['specific pain points']}</p>
          </div>
        )}
        {audience.motivations && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Motivations</h4>
            <p className="text-foreground/90 text-sm leading-relaxed">{audience.motivations}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCompetitor = (competitor: string | any) => {
    if (typeof competitor === 'string') {
      return <span className="font-medium">{competitor}</span>;
    }
    return (
      <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
        <p className="font-semibold text-foreground mb-2">{competitor.name}</p>
        {competitor.strengths && (
          <p className="text-sm text-foreground/70 mb-1 flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>{competitor.strengths}</span>
          </p>
        )}
        {competitor.weaknesses && (
          <p className="text-sm text-foreground/70 mb-1 flex items-start gap-2">
            <span className="text-red-500 font-bold">✗</span>
            <span>{competitor.weaknesses}</span>
          </p>
        )}
        {competitor.marketPositioning && (
          <p className="text-sm text-foreground/70 flex items-start gap-2">
            <span className="text-primary">⌖</span>
            <span>{competitor.marketPositioning}</span>
          </p>
        )}
      </div>
    );
  };

  const renderMonetization = (method: string | any) => {
    if (typeof method === 'string') {
      return <span className="font-medium">{method}</span>;
    }
    return (
      <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
        <p className="font-semibold text-foreground mb-2">{method.strategy}</p>
        {method.pros && (
          <p className="text-sm text-foreground/70 mb-1 flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>{method.pros}</span>
          </p>
        )}
        {method.cons && (
          <p className="text-sm text-foreground/70 flex items-start gap-2">
            <span className="text-red-500 font-bold">✗</span>
            <span>{method.cons}</span>
          </p>
        )}
      </div>
    );
  };

  const getDemandColor = () => {
    if (research.demandProbability >= 80) return "text-green-500";
    if (research.demandProbability >= 60) return "text-primary";
    if (research.demandProbability >= 40) return "text-yellow-500";
    return "text-orange-500";
  };

  const getDemandLabel = () => {
    if (research.demandProbability >= 80) return "Excellent";
    if (research.demandProbability >= 60) return "Good";
    if (research.demandProbability >= 40) return "Moderate";
    return "Low";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Demand Score */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Research Complete</h2>
                  <p className="text-muted-foreground">AI-powered market analysis</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-green-500/10 hover:text-green-500 transition-all"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Demand Score</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold ${getDemandColor()}`}>
                    {research.demandProbability}%
                  </p>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {getDemandLabel()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${getDemandColor().replace('text-', 'bg-')} rounded-full transition-all duration-1000`}
              style={{ width: `${research.demandProbability}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Problem Definition */}
        <Card className="relative overflow-hidden border-border hover:shadow-lg transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Problem Definition</h3>
                <p className="text-foreground/90 leading-relaxed">{research.problem}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Target Audience */}
        <Card className="relative overflow-hidden border-border hover:shadow-lg transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Target Audience</h3>
                {renderAudience(research.audience)}
              </div>
            </div>
          </div>
        </Card>

        {/* Market Gaps */}
        <Card className="relative overflow-hidden border-border hover:shadow-lg transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Market Opportunities</h3>
                <ul className="space-y-3">
                  {research.marketGaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/90 leading-relaxed">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Competitors and Monetization */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Competitors */}
          <Card className="relative overflow-hidden border-border hover:shadow-lg transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BarChart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Competitors</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {research.competitors.map((competitor, index) => (
                  <li key={index}>
                    {renderCompetitor(competitor)}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Monetization */}
          <Card className="relative overflow-hidden border-border hover:shadow-lg transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Monetization</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {research.monetization.map((method, index) => (
                  <li key={index}>
                    {renderMonetization(method)}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="border-border hover:bg-secondary/50"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all group"
        >
          Choose Build Platform
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
