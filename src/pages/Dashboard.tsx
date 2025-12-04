import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  LogOut,
  User,
  Loader2,
  ArrowRightLeft,
  TrendingUp,
  Brain,
  Zap,
  Trash2,
  Home,
  Sparkles,
  ChevronRight,
  Calendar,
  Target,
  CreditCard,
  Receipt,
  IndianRupee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";
import { GenerationLimitWarning } from "@/components/GenerationLimitWarning";

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

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  razorpay_payment_id: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
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
        // Defer data fetching
        setTimeout(() => {
          fetchProjects();
          fetchPaymentHistory();
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

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPaymentHistory((data as unknown as PaymentHistory[]) || []);
    } catch (error: unknown) {
      console.error("Failed to load payment history:", error);
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

  // Calculate stats
  const totalIdeas = projects.length;
  const avgDemand = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.research?.demandProbability || 0), 0) / projects.length)
    : 0;
  const analyzedIdeas = projects.filter(p => p.research).length;
  const recentProjects = projects.slice(0, 3);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
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

      {/* Modern Glassmorphic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  onClick={handleNewIdea}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Idea
                </Button>
              </nav>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
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

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Generation Limit Warning */}
        <GenerationLimitWarning />

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                  Welcome back
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {totalIdeas === 0
                  ? "Ready to bring your ideas to life?"
                  : `You have ${totalIdeas} ${totalIdeas === 1 ? 'project' : 'projects'} in progress`
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedProjects.length >= 2 && (
                <Button
                  onClick={handleCompare}
                  variant="outline"
                  size="lg"
                  className="border-border hover:bg-secondary hover:border-primary/50 transition-all"
                >
                  <ArrowRightLeft className="mr-2 h-5 w-5" />
                  Compare ({selectedProjects.length})
                </Button>
              )}
              <Button
                onClick={handleNewIdea}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group"
              >
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                New Idea
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          {projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Total Ideas</p>
                    <p className="text-3xl font-bold">{totalIdeas}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Avg. Demand</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{avgDemand}%</p>
                      {avgDemand >= 70 && (
                        <span className="text-xs text-green-500 font-semibold">High</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Analyzed</p>
                    <p className="text-3xl font-bold">{analyzedIdeas}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Success Rate</p>
                    <p className="text-3xl font-bold">
                      {analyzedIdeas > 0 ? Math.round((analyzedIdeas / totalIdeas) * 100) : 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Your Projects</h2>
            {projects.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </div>
            )}
          </div>
        </div>

        {/* Payment History Section */}
        {paymentHistory.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Receipt className="w-6 h-6 text-primary" />
                Payment History
              </h2>
            </div>
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" />
                            {(payment.amount / 100).toFixed(0)}
                            <Badge
                              variant={payment.status === "captured" ? "default" : payment.status === "failed" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-mono">
                          {payment.razorpay_payment_id.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="relative overflow-hidden border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
            <div className="relative p-16 text-center">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold">Start Building Something Amazing</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Transform your ideas into reality with AI-powered validation,
                    market research, and build plans tailored to your vision.
                  </p>
                </div>
                <Button
                  onClick={handleNewIdea}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all mt-2 group"
                >
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
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
                className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-border ${selectedProjects.includes(project.id)
                    ? "ring-2 ring-primary shadow-lg border-primary"
                    : "hover:border-primary/30"
                  }`}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Selection checkbox */}
                <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedProjects([...selectedProjects, project.id]);
                      else setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                    }}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                  onClick={(e) => handleDeleteProject(project.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <CardHeader className="pt-12 pb-3 relative">
                  <CardTitle className="line-clamp-2 pr-10 text-xl group-hover:text-primary transition-colors">
                    {project.research?.name || project.idea}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 relative">
                  {project.research?.demandProbability !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Demand Score</span>
                        <span className="font-bold text-primary text-lg">{project.research.demandProbability}%</span>
                      </div>
                      <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${project.research.demandProbability}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {project.platform && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Platform:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                        {project.platform}
                      </span>
                    </div>
                  )}

                  {project.research?.problem && (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.research.problem}
                      </p>
                    </div>
                  )}

                  {/* View details indicator */}
                  <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-medium">View details</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
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
