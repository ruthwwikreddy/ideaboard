import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Wand, Loader2, ArrowRight, LogIn, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>New Project - IdeaBoard AI</title>
        <meta name="description" content="Start a new project and get your idea analyzed." />
        <meta name="robots" content="noindex, nofollow" />
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
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                Dashboard
              </Button>
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
                <LogIn className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <Card id="idea-panel" className="p-8 bg-card border-border shadow-lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">What's your idea?</h2>
              <p className="text-muted-foreground">
                Describe your app idea and let AI research the market, competitors, and create a build-ready plan.
              </p>
            </div>

            <Textarea
              placeholder="Example: A mobile app that helps freelancers track time and generate invoices automatically..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-[200px] text-lg bg-secondary border-border focus:border-primary transition-colors resize-none"
            />

            <Button
              onClick={handleAnalyze}
              disabled={loading || !idea.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg shadow-neon-cyan transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Idea
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default NewProject;
