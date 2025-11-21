import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Wand, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ResearchResults } from "@/components/ResearchResults";
import { BuildPlan } from "@/components/BuildPlan";
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

interface Project {
  id: string;
  idea: string;
  research: Research | null;
  platform: string | null;
  build_plan: BuildPlan | null;
  created_at: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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
        setProject(data as unknown as Project);
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
      </Helmet>
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wand className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DevPlan AI</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="mb-6 border-border hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h2 className="text-4xl font-bold mb-4">{project.idea}</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Created on: {new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        {project.research && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Research Analysis</h3>
            <ResearchResults 
              research={project.research} 
              onNext={() => {}}
              onBack={() => {}}
            />
          </div>
        )}

        {project.platform && project.build_plan && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Build Plan for {project.platform}</h3>
            <BuildPlan 
              plan={project.build_plan} 
              platform={project.platform}
              onReset={() => {}}
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
      </main>
    </div>
  );
};

export default ProjectDetails;
