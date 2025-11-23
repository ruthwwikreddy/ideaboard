import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Wand, ArrowLeft, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { ResearchResults } from "@/components/ResearchResults";
import { PlatformSelector } from "@/components/PlatformSelector";
import { BuildPlan } from "@/components/BuildPlan";
import { Helmet } from "react-helmet-async";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Research {
  name: string;
  problem: string;
  audience: string | any;
  competitors: string[];
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

type ViewMode = "research" | "platform" | "plan";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("research");
  const [generatingPlan, setGeneratingPlan] = useState(false);

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

        // Determine initial view mode
        if (projectData.platform && projectData.build_plan) {
          setViewMode("plan");
        } else if (projectData.research && !projectData.platform) {
          setViewMode("research");
        } else if (projectData.research && projectData.platform && !projectData.build_plan) {
          setViewMode("platform");
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

  const handlePlatformSelect = async (selectedPlatform: string) => {
    if (!project || !project.research) return;

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

      setViewMode("plan");
      toast.success("Build plan generated!");
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
    const element = document.getElementById("project-content");
    if (!element) return;

    setExporting(true);
    toast.info("Generating PDF...");

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${project?.research?.name || "project"}-plan.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <title>{project ? `${project.idea} - IdeaBoard AI` : 'Project Details - IdeaBoard AI'}</title>
        <meta name="description" content={`Details for the project: ${project?.idea}. View the research, analysis, and build plan.`} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://www.ideaboard.ai/project/${id}`} />
      </Helmet>
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wand className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">IdeaBoard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-border hover:bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          {(project.research || project.build_plan) && (
            <Button onClick={handleExportPDF} disabled={exporting}>
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export PDF
            </Button>
          )}
        </div>

        <div id="project-content" className="bg-background p-4 rounded-lg">
          <h2 className="text-4xl font-bold mb-4">{project.research?.name || "Untitled Project"}</h2>
          <p className="text-muted-foreground text-lg mb-4">{project.idea}</p>
          <p className="text-muted-foreground text-lg mb-8">
            Created on: {new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          {viewMode === "research" && project.research && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Research Analysis</h3>
              <ResearchResults
                research={project.research}
                onNext={() => setViewMode("platform")}
                onBack={() => navigate("/dashboard")}
              />
            </div>
          )}

          {viewMode === "platform" && (
            <div className="mb-8">
              <PlatformSelector
                onSelect={handlePlatformSelect}
                loading={generatingPlan}
                onBack={() => setViewMode("research")}
              />
            </div>
          )}

          {viewMode === "plan" && project.platform && project.build_plan && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Build Plan for {project.platform}</h3>
              <BuildPlan
                plan={project.build_plan}
                platform={project.platform}
                onReset={() => navigate("/dashboard")}
              />
            </div>
          )}

          {!project.research && !project.build_plan && (
            <Card className="p-8 text-center">
              <CardTitle className="text-2xl">No Details Available</CardTitle>
              <CardDescription className="mt-2">
                This project does not yet have research or a build plan.
              </CardDescription>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
