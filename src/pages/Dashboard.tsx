import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Wand, Plus, LogOut, User, Loader2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

interface Research {
  name: string;
  problem: string;
  audience: string;
  competitors: string[];
  marketGaps: string[];
  monetization: string[];
  demandProbability: number;
}

interface Project {
  id: string;
  idea: string;
  platform: string | null;
  created_at: string;
  research: Research | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      } else {
        // Defer project fetching
        setTimeout(() => {
          fetchProjects();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects((data as unknown as Project[]) || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load projects");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));
      setSelectedProjects(selectedProjects.filter(pId => pId !== id));
      toast.success("Project deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  const handleNewIdea = () => {
    navigate("/new-project");
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedProjects.length < 2) {
      toast.error("Select at least 2 projects to compare");
      return;
    }
    navigate(`/compare?ids=${selectedProjects.join(",")}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Your Dashboard - IdeaBoard AI</title>
        <meta name="description" content="View and manage all your app idea projects, analyses, and build plans." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.ideaboard.ai/dashboard" />
      </Helmet>
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Wand className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/30"></div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">DevPlan AI</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">Your Projects</h2>
            <p className="text-muted-foreground">
              View and manage your idea analyses and build plans
            </p>
          </div>
          <div className="flex gap-3">
            {selectedProjects.length >= 2 && (
              <Button onClick={handleCompare} variant="secondary">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Compare ({selectedProjects.length})
              </Button>
            )}
            <Button
              onClick={handleNewIdea}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Idea
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Wand className="w-16 h-16 text-muted-foreground" />
              <div>
                <h3 className="text-2xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by analyzing your first idea
                </p>
                <Button
                  onClick={handleNewIdea}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Project
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`hover:border-primary/50 transition-colors cursor-pointer relative group ${selectedProjects.includes(project.id) ? "border-primary ring-1 ring-primary" : ""
                  }`}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedProjects([...selectedProjects, project.id]);
                      else setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => handleDeleteProject(project.id, e)}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <CardHeader className="pt-10">
                  <CardTitle className="line-clamp-2 pr-8">{project.research?.name || project.idea}</CardTitle>
                  <CardDescription>
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.platform && (
                    <div className="text-sm text-muted-foreground">
                      Platform: <span className="text-foreground font-medium">{project.platform}</span>
                    </div>
                  )}
                  {project.research?.demandProbability && (
                    <div className="mt-2 text-sm">
                      Demand: <span className="font-semibold text-primary">{project.research.demandProbability}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
