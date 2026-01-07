import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  IndianRupee,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";
import { GenerationLimitWarning } from "@/components/GenerationLimitWarning";
import { CreditsIndicator } from "@/components/CreditsIndicator";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
          checkAdminRole(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
    }
  };

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
  const successRate = analyzedIdeas > 0 ? Math.round((analyzedIdeas / totalIdeas) * 100) : 0;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (p.idea || "").toLowerCase().includes(searchLower) ||
        (p.research?.name || "").toLowerCase().includes(searchLower)
      );
    });
  }, [projects, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Helmet>
        <title>Dashboard - IdeaBoard AI</title>
        <meta name="description" content="Manage your AI-powered projects and ideas." />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                IdeaBoard
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/payment-history")}>
                History
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/admin")}>
                  Admin
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <PushNotificationToggle />
            <CreditsIndicator />
            
            <Button
              onClick={handleNewIdea}
              size="sm"
              className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 border border-border/50 bg-secondary/50 hover:bg-secondary">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/payment-history")}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <GenerationLimitWarning />

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, <span className="text-muted-foreground">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>

          {selectedProjects.length >= 2 && (
            <Button
              onClick={handleCompare}
              variant="outline"
              className="animate-in fade-in zoom-in duration-300"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Compare Selected ({selectedProjects.length})
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/20 transition-all hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">Total</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">{totalIdeas}</h3>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/20 transition-all hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">Avg</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">{avgDemand}%</h3>
                <p className="text-sm text-muted-foreground">Demand Score</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/20 transition-all hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">Analyzed</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">{analyzedIdeas}</h3>
                <p className="text-sm text-muted-foreground">Projects Validated</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/20 transition-all hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">Rate</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">{successRate}%</h3>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Your Projects</h2>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64 bg-secondary/50 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="flex items-center border border-border/50 rounded-md bg-secondary/50 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-sm ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-sm ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first AI-powered project."}
                </p>
                <Button onClick={handleNewIdea}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }>
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 bg-card/50 backdrop-blur-sm ${selectedProjects.includes(project.id) ? "ring-2 ring-primary border-primary" : "border-border/50"
                    }`}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <CardHeader className="relative pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm text-[10px] uppercase tracking-wider font-medium text-muted-foreground border-border/50">
                            {project.platform || "Web App"}
                          </Badge>
                          {project.research?.demandProbability && project.research.demandProbability >= 80 && (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase tracking-wider font-medium">
                              High Potential
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                          {project.research?.name || project.idea}
                        </CardTitle>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedProjects([...selectedProjects, project.id]);
                            else setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/project/${project.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDeleteProject(project.id, e as any)}
                            >
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {project.research?.problem || "No description available."}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Demand Score</span>
                        <span className="font-medium">{project.research?.demandProbability || 0}%</span>
                      </div>
                      <Progress value={project.research?.demandProbability || 0} className="h-1.5" />
                    </div>
                  </CardContent>

                  <CardFooter className="relative pt-0 pb-4 text-xs text-muted-foreground flex items-center justify-between border-t border-border/30 mt-2 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(project.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      Open Project <ChevronRight className="w-3 h-3" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
