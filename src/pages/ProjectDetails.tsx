import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Download,
  Home,
  User,
  LogOut,
  FileText,
  FileDown,
  Calendar,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  BarChart,
  Sparkles,
  CheckCircle,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Research {
  name: string;
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

interface Project {
  id: string;
  idea: string;
  research: Research | null;
  platform: string | null;
  build_plan: BuildPlan | null;
  created_at: string;
}

const PLATFORMS = [
  { id: "lovable", name: "Lovable", icon: "💜", description: "Full-stack web apps with AI" },
  { id: "bolt", name: "Bolt", icon: "⚡", description: "Fast web development" },
  { id: "v0", name: "V0", icon: "🎨", description: "UI components with AI" },
  { id: "replit", name: "Replit", icon: "🔧", description: "Collaborative coding" },
];

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (!id) {
      toast.error("Project ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        const projectData = data as unknown as Project;
        setProject(projectData);

        // Set selected platform if already chosen
        if (projectData.platform) {
          setSelectedPlatform(projectData.platform);
        }
      } catch (error: unknown) {
        console.error("Error fetching project:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load project details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleGeneratePlan = async () => {
    if (!project || !project.research || !selectedPlatform) return;

    setGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-build-plan", {
        body: { idea: project.idea, research: project.research, platform: selectedPlatform },
      });

      if (error) throw error;

      // Update project in database
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          platform: selectedPlatform,
          build_plan: data,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Update local state
      setProject({
        ...project,
        platform: selectedPlatform,
        build_plan: data as BuildPlan,
      });

      toast.success("Build plan generated successfully!");

      // Scroll to build plan section
      setTimeout(() => {
        document.getElementById("build-plan")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: unknown) {
      console.error("Error generating plan:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate build plan");
      }
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleExportPDF = async () => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
    container.style.padding = '40px';

    const content = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">${project?.research?.name || "Project Research"}</h1>
        <p style="font-size: 14px; color: #666; margin-bottom: 10px;">${project?.idea}</p>
        <p style="font-size: 12px; color: #999; margin-bottom: 30px;">
          Created on: ${new Date(project?.created_at || "").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333;">Problem Definition</h2>
          <p style="font-size: 14px; line-height: 1.5;">${project?.research?.problem}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333;">Target Audience</h2>
          <div style="font-size: 14px; line-height: 1.5;">
            ${typeof project?.research?.audience === 'string' ? project?.research?.audience : JSON.stringify(project?.research?.audience, null, 2)}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333;">Market Gaps</h2>
          <ul style="font-size: 14px; line-height: 1.5; padding-left: 20px;">
            ${project?.research?.marketGaps.map(gap => `<li>${gap}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333;">Competitors</h2>
          <ul style="font-size: 14px; line-height: 1.5; padding-left: 20px;">
            ${project?.research?.competitors.map(comp => `<li>${typeof comp === 'string' ? comp : comp.name}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333;">Monetization</h2>
          <ul style="font-size: 14px; line-height: 1.5; padding-left: 20px;">
            ${project?.research?.monetization.map(mon => `<li>${typeof mon === 'string' ? mon : mon.strategy}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    container.innerHTML = content;
    document.body.appendChild(container);

    setExporting(true);
    toast.info("Generating PDF...");

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${project?.research?.name || "project"}-research.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export PDF");
    } finally {
      document.body.removeChild(container);
      setExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!project || !project.research) return;

    const { name, problem, audience, competitors, marketGaps, monetization } = project.research;

    const markdownContent = `
# ${name || "Project Research"}

**Idea:** ${project.idea}
**Date:** ${new Date(project.created_at).toLocaleDateString()}

## Problem Definition
${problem}

## Target Audience
${typeof audience === 'string' ? audience : JSON.stringify(audience, null, 2)}

## Market Gaps
${marketGaps.map(gap => `- ${gap}`).join('\n')}

## Competitors
${competitors.map(comp => `- ${typeof comp === 'string' ? comp : comp.name}`).join('\n')}

## Monetization
${monetization.map(mon => `- ${typeof mon === 'string' ? mon : mon.strategy}`).join('\n')}
    `.trim();

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || "project"}-research.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown downloaded successfully!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Helper functions for rendering research data
  const renderAudience = (audience: string | any) => {
    if (typeof audience === 'string') {
      return <p className="text-foreground/90 leading-relaxed">{audience}</p>;
    }

    return (
      <div className="space-y-4">
        {audience.demographics && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Demographics</h4>
            <ul className="space-y-2 text-foreground/90 text-sm">
              {audience.demographics.age && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><span className="font-medium">Age:</span> {audience.demographics.age}</span>
                </li>
              )}
              {audience.demographics.gender && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><span className="font-medium">Gender:</span> {audience.demographics.gender}</span>
                </li>
              )}
              {audience.demographics.location && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><span className="font-medium">Location:</span> {audience.demographics.location}</span>
                </li>
              )}
            </ul>
          </div>
        )}
        {audience['specific pain points'] && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-semibold text-sm mb-2 text-primary">Pain Points</h4>
            <p className="text-foreground/90 text-sm leading-relaxed">{audience['specific pain points']}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCompetitor = (competitor: string | any, index: number) => {
    if (typeof competitor === 'string') {
      return (
        <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
          <span className="font-medium">{competitor}</span>
        </div>
      );
    }
    return (
      <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
        <p className="font-semibold text-foreground mb-2">{competitor.name}</p>
        {competitor.strengths && (
          <p className="text-sm text-foreground/70 mb-1 flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>{competitor.strengths}</span>
          </p>
        )}
        {competitor.weaknesses && (
          <p className="text-sm text-foreground/70 flex items-start gap-2">
            <span className="text-red-500 font-bold">✗</span>
            <span>{competitor.weaknesses}</span>
          </p>
        )}
      </div>
    );
  };

  const renderMonetization = (method: string | any, index: number) => {
    if (typeof method === 'string') {
      return (
        <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
          <span className="font-medium">{method}</span>
        </div>
      );
    }
    return (
      <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
        <p className="font-semibold text-foreground mb-2">{method.strategy}</p>
        {method.pros && (
          <p className="text-sm text-foreground/70 mb-1 flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>{method.pros}</span>
          </p>
        )}
      </div>
    );
  };

  const getDemandColor = () => {
    if (!project?.research) return "text-primary";
    if (project.research.demandProbability >= 80) return "text-green-500";
    if (project.research.demandProbability >= 60) return "text-primary";
    if (project.research.demandProbability >= 40) return "text-yellow-500";
    return "text-orange-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
        <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{project.research?.name || project.idea} - IdeaBoard AI</title>
        <meta name="description" content={`Details for the project: ${project?.idea}. View the research, analysis, and build plan.`} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://www.ideaboard.ai/project/${id}`} />
      </Helmet>

      {/* Modern Glassmorphic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <div className="relative">
                  <img src="/logo.png" alt="IdeaBoard" className="w-8 h-8 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-all"></div>
                </div>
                <span className="text-xl font-bold tracking-tight">IdeaBoard</span>
              </div>

              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  onClick={() => navigate("/dashboard")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium line-clamp-1 max-w-[120px]">
                      {user?.email?.split('@')[0] || 'User'}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => navigate("/profile")}
                variant="ghost"
                size="sm"
                className="hidden sm:flex hover:bg-secondary/50"
              >
                <User className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-border hover:bg-secondary/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {project.research && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleExportMarkdown}
                variant="outline"
                className="border-border hover:bg-secondary/50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Markdown
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={exporting}
                className="bg-primary hover:bg-primary/90"
              >
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                {project.research?.name || "Untitled Project"}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {project.idea}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(project.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
              </div>
            </div>

            {project.research && (
              <Card className="border-border bg-gradient-to-br from-card to-primary/5 min-w-[200px]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Demand Score</p>
                      <p className={`text-2xl font-bold ${getDemandColor()}`}>
                        {project.research.demandProbability}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full ${getDemandColor().replace('text-', 'bg-')} rounded-full transition-all`}
                      style={{ width: `${project.research.demandProbability}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Research Results */}
        {project.research && (
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Research Analysis</h2>

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
                      <p className="text-foreground/90 leading-relaxed">{project.research.problem}</p>
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
                      {renderAudience(project.research.audience)}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Market Opportunities */}
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
                        {project.research.marketGaps.map((gap, index) => (
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
                    <div className="space-y-3">
                      {project.research.competitors.map((competitor, index) => renderCompetitor(competitor, index))}
                    </div>
                  </div>
                </Card>

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
                    <div className="space-y-3">
                      {project.research.monetization.map((method, index) => renderMonetization(method, index))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Build Plan Generation Section */}
        {project.research && (
          <div className="mt-12">
            <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Generate Build Plan</h2>
                    <p className="text-muted-foreground">
                      Choose your preferred platform to get AI-generated prompts and a phased development plan
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${selectedPlatform === platform.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50 bg-card"
                        }`}
                    >
                      <div className="text-3xl mb-2">{platform.icon}</div>
                      <div className="font-semibold mb-1">{platform.name}</div>
                      <div className="text-xs text-muted-foreground">{platform.description}</div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleGeneratePlan}
                  disabled={!selectedPlatform || generatingPlan}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group"
                >
                  {generatingPlan ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Build Plan...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Generate Build Plan for {selectedPlatform ? PLATFORMS.find(p => p.id === selectedPlatform)?.name : "Selected Platform"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Build Plan Display */}
        {project.build_plan && project.platform && (
          <div id="build-plan" className="mt-12 scroll-mt-20">
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Build Plan for {PLATFORMS.find(p => p.id === project.platform)?.name}
                    </h2>
                    <p className="text-muted-foreground">{project.build_plan.summary}</p>
                  </div>
                </div>

                {project.build_plan.phases.map((phase) => (
                  <Card key={phase.phase} className="mb-6 border-border bg-secondary/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3">
                        Phase {phase.phase}: {phase.title}
                      </h3>
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2 text-primary">Features:</h4>
                        <ul className="space-y-2">
                          {phase.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50 border border-border">
                        <h4 className="font-medium text-sm mb-2 text-primary">AI Prompt:</h4>
                        <p className="text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {phase.prompt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;
