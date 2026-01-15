import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Target,
  Users,
  TrendingUp,
  DollarSign,
  BarChart,
  Sparkles,
  CheckCircle,
  XCircle,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface Research {
  name: string;
  problem: string;
  audience: string | any;
  competitors: Array<string | any>;
  marketGaps: string[];
  monetization: Array<string | any>;
  demandProbability: number;
}

interface Project {
  id: string;
  idea: string;
  platform: string | null;
  created_at: string;
  research: Research | null;
}

const CompareProjects = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || [];
    if (ids.length === 0) {
      toast.error("No projects selected for comparison");
      navigate("/dashboard");
      return;
    }
    fetchProjects(ids);
  }, [searchParams, navigate]);

  const fetchProjects = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .in("id", ids);

      if (error) throw error;
      const projectData = (data as unknown as Project[]) || [];
      setProjects(projectData);

      // Determine winner based on demand probability
      if (projectData.length > 1) {
        const sorted = [...projectData].sort(
          (a, b) => (b.research?.demandProbability || 0) - (a.research?.demandProbability || 0)
        );
        setWinner(sorted[0]?.id || null);
      }
    } catch (error: unknown) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects for comparison");
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (probability: number) => {
    if (probability >= 80) return "text-green-500";
    if (probability >= 60) return "text-primary";
    if (probability >= 40) return "text-yellow-500";
    return "text-orange-500";
  };

  const getDemandBg = (probability: number) => {
    if (probability >= 80) return "bg-green-500";
    if (probability >= 60) return "bg-primary";
    if (probability >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const renderCompetitors = (competitors: Array<string | any>) => {
    return (
      <ul className="space-y-2">
        {competitors.slice(0, 3).map((comp, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <BarChart className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>{typeof comp === "string" ? comp : comp.name}</span>
          </li>
        ))}
        {competitors.length > 3 && (
          <li className="text-xs text-muted-foreground">
            +{competitors.length - 3} more
          </li>
        )}
      </ul>
    );
  };

  const renderMonetization = (monetization: Array<string | any>) => {
    return (
      <ul className="space-y-2">
        {monetization.slice(0, 3).map((mon, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>{typeof mon === "string" ? mon : mon.strategy}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderMarketGaps = (gaps: string[]) => {
    return (
      <ul className="space-y-2">
        {gaps.slice(0, 3).map((gap, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{gap}</span>
          </li>
        ))}
        {gaps.length > 3 && (
          <li className="text-xs text-muted-foreground">
            +{gaps.length - 3} more opportunities
          </li>
        )}
      </ul>
    );
  };

  const renderAudienceSummary = (audience: string | any) => {
    if (typeof audience === "string") {
      return <p className="text-sm line-clamp-3">{audience}</p>;
    }
    if (audience.demographics) {
      return (
        <div className="space-y-1 text-sm">
          {audience.demographics.age && (
            <p><span className="text-muted-foreground">Age:</span> {audience.demographics.age}</p>
          )}
          {audience.demographics.location && (
            <p><span className="text-muted-foreground">Location:</span> {audience.demographics.location}</p>
          )}
        </div>
      );
    }
    return <p className="text-sm text-muted-foreground">Detailed analysis available</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Compare Projects - IdeaBoard AI</title>
        <meta name="description" content="Compare multiple app ideas side-by-side with AI-powered research results" />
      </Helmet>

      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Compare Ideas</h1>
                <p className="text-sm text-muted-foreground">
                  Comparing {projects.length} project{projects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {winner && (
              <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 border-yellow-500/30">
                <Trophy className="w-3 h-3 mr-1" />
                Winner Selected
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
          {projects.map((project) => {
            const isWinner = project.id === winner;
            const probability = project.research?.demandProbability || 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`relative overflow-hidden ${isWinner ? "ring-2 ring-yellow-500/50" : ""}`}>
                  {isWinner && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-500" />
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {project.research?.name || "Untitled Project"}
                      </CardTitle>
                      {isWinner && (
                        <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.idea}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Demand Score</span>
                          <span className={`text-2xl font-bold ${getDemandColor(probability)}`}>
                            {probability}%
                          </span>
                        </div>
                        <Progress 
                          value={probability} 
                          className="h-2"
                        />
                      </div>

                      {project.platform && (
                        <Badge variant="secondary" className="text-xs">
                          {project.platform}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Comparison Grid */}
        <div className="space-y-6">
          {/* Problem */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
                {projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-sm">{project.research?.problem || "No problem defined"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
                {projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    {project.research?.audience ? (
                      renderAudienceSummary(project.research.audience)
                    ) : (
                      <p className="text-sm text-muted-foreground">No audience data</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Opportunities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Market Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
                {projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    {project.research?.marketGaps && project.research.marketGaps.length > 0 ? (
                      renderMarketGaps(project.research.marketGaps)
                    ) : (
                      <p className="text-sm text-muted-foreground">No gaps identified</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Competitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
                {projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    {project.research?.competitors && project.research.competitors.length > 0 ? (
                      renderCompetitors(project.research.competitors)
                    ) : (
                      <p className="text-sm text-muted-foreground">No competitors listed</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monetization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Monetization Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
                {projects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    {project.research?.monetization && project.research.monetization.length > 0 ? (
                      renderMonetization(project.research.monetization)
                    ) : (
                      <p className="text-sm text-muted-foreground">No strategies defined</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
          {winner && (
            <Button onClick={() => navigate(`/project/${winner}`)}>
              <Sparkles className="mr-2 h-4 w-4" />
              View Winning Idea
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompareProjects;