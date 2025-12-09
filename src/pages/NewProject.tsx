import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  ArrowRight,
  LogOut,
  User,
  Home,
  Sparkles,
  Lightbulb,
  Zap,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreditsIndicator } from "@/components/CreditsIndicator";
import { toast } from "sonner";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

const NewProject = () => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea");
      return;
    }

    if (!session) {
      toast.error("Please log in to analyze your idea");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        toast.error("Session expired. Please log in again.");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: { idea },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) throw error;

      // Save project if user is logged in
      if (user) {
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            idea,
            research: data,
          })
          .select()
          .single();

        if (projectError) throw projectError;

        if (projectData) {
          navigate(`/project/${(projectData as { id: string }).id}`);
        }
      }

      toast.success("Research completed!");
    } catch (error: unknown) {
      console.error("Error analyzing idea:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to analyze idea");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>New Project - IdeaBoard AI</title>
        <meta name="description" content="Start a new project and get your idea analyzed." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Modern Glassmorphic Header - Same as Dashboard */}
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
                  className="text-foreground bg-secondary/50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Idea
                </Button>
              </nav>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              <CreditsIndicator />
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

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Idea Validation</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              What's your idea?
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your vision and let AI analyze the market, identify competitors,
            and create a comprehensive build plan for your project.
          </p>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm">Market Research</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm">Competitor Analysis</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Build Plans</span>
          </div>
        </div>

        {/* Main Input Card */}
        <Card className="relative overflow-hidden border-border shadow-xl">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative p-8 md:p-12 space-y-6">
            <div className="space-y-3">
              <label className="text-lg font-semibold block">
                Describe your idea
              </label>
              <p className="text-muted-foreground">
                Be as detailed as possible. Include what problem you're solving,
                who it's for, and any unique features you have in mind.
              </p>
            </div>

            <Textarea
              placeholder="Example: A mobile app that helps freelancers track time and generate invoices automatically. It would integrate with popular payment processors and provide real-time analytics on earnings and project profitability..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-[240px] text-lg bg-secondary/30 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                {idea.length > 0 && (
                  <span className={idea.length < 50 ? "text-yellow-500" : "text-green-500"}>
                    {idea.length} characters
                    {idea.length < 50 && " - Add more details for better results"}
                  </span>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || !idea.trim()}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all group min-w-[180px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Idea
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips Section */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Card className="p-6 border-border bg-card/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Be Specific</h3>
            <p className="text-sm text-muted-foreground">
              Detailed descriptions help our AI provide more accurate market insights and recommendations.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Instant Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get comprehensive market research and competitor analysis in seconds, not weeks.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Build Ready</h3>
            <p className="text-sm text-muted-foreground">
              Receive platform-specific prompts and phased development plans to start building immediately.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NewProject;
