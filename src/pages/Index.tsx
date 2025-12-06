import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  PlayCircle,
  ArrowRight,
  LogIn,
  Triangle,
  Zap,
  Box,
  Github,
  BrainCircuit,
  Target,
  CheckCircle,
  FileCode2,
  Check,
  X
} from "lucide-react";
import { ResearchResults } from "@/components/ResearchResults";
import { PlatformSelector } from "@/components/PlatformSelector";
import { BuildPlan } from "@/components/BuildPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Session, User } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";

interface Research {
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

interface BuildPlanType {
  summary: string;
  features: string[];
  phases: BuildPhase[];
}

type Stage = "input" | "research" | "platform" | "plan";

const Index = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("input");
  const [idea, setIdea] = useState("");
  const [research, setResearch] = useState<Research | null>(null);
  const [platform, setPlatform] = useState("");
  const [buildPlan, setBuildPlan] = useState<BuildPlanType | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const savedIdea = localStorage.getItem('pendingIdea');
        if (savedIdea) {
          setIdea(savedIdea);
          localStorage.removeItem('pendingIdea');
          toast.success("Welcome back! Your idea has been restored.");
        }
      }
    });

    setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
    }, 0);

    return () => subscription.unsubscribe();
  }, []);

  const handleTextareaFocus = () => {
    if (!user) {
      setShowAuthDialog(true);
      if (idea.trim()) {
        localStorage.setItem('pendingIdea', idea);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!user) {
      setShowAuthDialog(true);
      localStorage.setItem('pendingIdea', e.target.value);
      return;
    }
    setIdea(e.target.value);
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      toast.error("Please enter your idea");
      return;
    }

    if (!user) {
      toast.info("Please sign in or sign up to generate ideas.");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-idea", {
        body: { idea },
      });

      if (error) throw error;

      setResearch(data as Research);
      setStage("research");

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

        if (!projectError && projectData) {
          setCurrentProjectId((projectData as { id: string }).id);
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

  const handlePlatformSelect = async (selectedPlatform: string) => {
    setPlatform(selectedPlatform);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-build-plan", {
        body: { idea, research, platform: selectedPlatform },
      });

      if (error) throw error;

      setBuildPlan(data as BuildPlanType);
      setStage("plan");

      if (user && currentProjectId) {
        await supabase
          .from("projects")
          .update({
            platform: selectedPlatform,
            build_plan: data,
          })
          .eq("id", currentProjectId);
      }

      toast.success("Build plan generated!");
    } catch (error: unknown) {
      console.error("Error generating plan:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate build plan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage("input");
    setIdea("");
    setResearch(null);
    setPlatform("");
    setBuildPlan(null);
    setCurrentProjectId(null);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#A1A1AA] overflow-x-hidden relative">
      <Helmet>
        <title>IdeaBoard - Intelligent Build Planning</title>
        <meta name="description" content="Validate, plan, and build your next big idea with AI assistance." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ideaboard.live/" />
      </Helmet>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: '50px 50px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}
        />

        {/* Animated Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-indigo-900/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-blue-900/5 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-[#0A0A0A] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white flex items-center gap-2">
              <LogIn className="w-6 h-6 text-indigo-400" />
              Sign in required
            </DialogTitle>
            <DialogDescription className="text-[#888888] text-base mt-2">
              Create a free account to validate your ideas with AI-powered market research and build plans.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#888888]">
                <Check className="w-4 h-4 text-green-400" />
                <span>1 free generation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#888888]">
                <Check className="w-4 h-4 text-green-400" />
                <span>AI market research & competitor analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#888888]">
                <Check className="w-4 h-4 text-green-400" />
                <span>Platform-specific build plans</span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  if (idea.trim()) {
                    localStorage.setItem('pendingIdea', idea);
                  }
                  navigate("/auth");
                }}
                className="flex-1 bg-white hover:bg-gray-100 text-black font-semibold"
              >
                Sign Up Free
              </Button>
              <Button
                onClick={() => {
                  if (idea.trim()) {
                    localStorage.setItem('pendingIdea', idea);
                  }
                  navigate("/auth");
                }}
                variant="outline"
                className="flex-1 border-white/20 hover:bg-white/5 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navbar */}
      {stage === "input" && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 w-full pointer-events-none">
          <nav className="pointer-events-auto backdrop-blur-[20px] bg-[rgba(5,5,5,0.6)] rounded-full pl-5 pr-2 py-2 flex items-center justify-between gap-8 border border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="IdeaBoard Logo" className="w-6 h-6" />
              <span className="text-white font-medium tracking-tight text-sm hidden sm:block">IdeaBoard</span>
            </a>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 rounded-full text-xs font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all">Features</a>
              <a href="#how-it-works" className="px-4 py-2 rounded-full text-xs font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all">How it works</a>
              <a href="#pricing" className="px-4 py-2 rounded-full text-xs font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all">Pricing</a>
            </div>

            {/* Right CTAs */}
            <div className="flex items-center gap-2">
              {user ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="ghost"
                  className="hidden sm:block text-xs font-medium text-[#888888] hover:text-white transition-colors px-3"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  variant="ghost"
                  className="hidden sm:block text-xs font-medium text-[#888888] hover:text-white transition-colors px-3"
                >
                  Login
                </Button>
              )}
              <Button
                onClick={() => {
                  if (user) {
                    navigate("/dashboard");
                  } else {
                    navigate("/auth");
                  }
                }}
                className="relative group/btn overflow-hidden rounded-full bg-white text-black px-5 py-2 text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-3 h-3 opacity-60 relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {stage === "input" && (
          <>
            {/* Hero Section */}
            <section className="relative pt-28 pb-24 lg:pt-36 lg:pb-32 overflow-hidden">
              <div className="max-w-6xl mx-auto px-6 text-center relative">

                {/* Spotlight Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Badge */}
                <a
                  href="https://www.producthunt.com/products/ideaboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-normal text-[#888888] hover:border-white/20 hover:text-white transition-all mb-8 group"
                >
                  <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  <span>Live on Product Hunt</span>
                  <ArrowRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 leading-[0.95]">
                  <span className="bg-gradient-to-br from-white to-[#999999] bg-clip-text text-transparent">From abstract</span>
                  <br />
                  <span className="text-white/40">to </span>
                  <span className="bg-gradient-to-br from-white to-[#CCCCCC] bg-clip-text text-transparent relative inline-block">
                    concrete
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-white/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-[#888888]/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                  Stop guessing. Start building. AI-powered market validation and build blueprints designed for the modern founder.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                  <Button
                    onClick={() => document.getElementById("idea-panel")?.scrollIntoView({ behavior: "smooth" })}
                    className="relative h-12 px-8 rounded-full bg-white text-black text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-transform duration-300"
                  >
                    Validate Idea
                  </Button>
                  <Button
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                    variant="outline"
                    className="h-12 px-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[#888888] text-sm font-medium flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
                  >
                    View Demo
                    <PlayCircle className="w-4 h-4" />
                  </Button>
                </div>

                {/* Dashboard Preview */}
                <div className="relative mx-auto max-w-5xl" style={{ perspective: '2000px' }}>
                  {/* Glowing Backlight */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50" />

                  <div className="relative rounded-xl border border-white/10 bg-[#080808]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {/* Fake Browser Header */}
                    <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-white/[0.02]">
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      </div>
                      <div className="text-[10px] text-white/20 font-mono">ideaboard.app/dashboard</div>
                      <div className="w-10" />
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                      {/* Left Panel */}
                      <div className="md:col-span-8 space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-2xl font-normal text-white tracking-tight">AI Content Generator SaaS</h3>
                            <p className="text-sm text-[#888888] mt-1">Validation Status: <span className="text-green-400">Strong Demand</span></p>
                          </div>
                          <div className="hidden md:block">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">v0.1.2</span>
                          </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 rounded-lg bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-xs text-[#888888] uppercase tracking-wider mb-2">Market Size</div>
                            <div className="text-2xl text-white font-medium">$4.2B</div>
                            <div className="mt-4 h-12 flex items-end gap-1">
                              <div className="w-full bg-indigo-500/20 h-[40%] rounded-sm" />
                              <div className="w-full bg-indigo-500/40 h-[60%] rounded-sm" />
                              <div className="w-full bg-indigo-500/60 h-[50%] rounded-sm" />
                              <div className="w-full bg-indigo-500/80 h-[80%] rounded-sm" />
                              <div className="w-full bg-indigo-500 h-[70%] rounded-sm" />
                            </div>
                          </div>
                          <div className="p-5 rounded-lg bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-xs text-[#888888] uppercase tracking-wider mb-2">Success Probability</div>
                            <div className="text-2xl text-white font-medium">89%</div>
                            <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[89%] relative">
                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                              </div>
                            </div>
                            <p className="text-[10px] text-[#888888] mt-2">Based on 12 competitor data points</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="p-5 rounded-lg bg-white/[0.03] border border-white/5 h-full">
                          <div className="text-xs text-[#888888] uppercase tracking-wider mb-4">Recommended Stack</div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                              <div className="w-8 h-8 rounded bg-black flex items-center justify-center border border-white/10 text-white">
                                <Box className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-white">Next.js</div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                              <div className="w-8 h-8 rounded bg-black flex items-center justify-center border border-white/10 text-white">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-white">Supabase</div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                              <div className="w-8 h-8 rounded bg-black flex items-center justify-center border border-white/10 text-white">
                                <Triangle className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-white">Tailwind</div>
                            </div>
                          </div>
                          <button className="mt-6 w-full py-2 rounded bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors">
                            Generate Blueprint
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Partners Section */}
            <section className="border-y border-white/5 bg-white/[0.01] py-10 overflow-hidden relative">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-[10px] text-[#888888]/60 mb-6 uppercase tracking-[0.2em] font-medium">Integration Partners</p>
                <div className="flex justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="flex items-center gap-2 text-white font-medium text-lg tracking-tight hover:text-white transition-colors">
                    <Triangle className="w-5 h-5" /> Vercel
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium text-lg tracking-tight hover:text-white transition-colors">
                    <Zap className="w-5 h-5" /> Supabase
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium text-lg tracking-tight hover:text-white transition-colors">
                    <Box className="w-5 h-5" /> Replit
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium text-lg tracking-tight hover:text-white transition-colors">
                    <Github className="w-5 h-5" /> GitHub
                  </div>
                </div>
              </div>
            </section>

            {/* Idea Input Panel */}
            <section className="py-20 relative">
              <div className="max-w-3xl mx-auto px-6">
                <Card
                  id="idea-panel"
                  className="p-8 bg-[rgba(10,10,10,0.4)] backdrop-blur-[16px] border border-white/5 shadow-lg scroll-mt-28"
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-white">What's your idea?</h2>
                      <p className="text-[#888888]">
                        Describe your app idea and let AI research the market, competitors, and create a build-ready plan.
                      </p>
                    </div>

                    <Textarea
                      placeholder="Example: A mobile app that helps freelancers track time and generate invoices automatically..."
                      value={idea}
                      onChange={handleTextareaChange}
                      onFocus={handleTextareaFocus}
                      className="min-h-[200px] text-lg bg-[#0A0A0A] border-white/5 focus:border-primary transition-colors resize-none text-white placeholder:text-[#888888]/50"
                    />

                    <Button
                      onClick={handleAnalyze}
                      disabled={loading || !idea.trim()}
                      className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-6 text-lg rounded-full transition-all"
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
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
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 md:text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-6">Build smarter, not harder.</h2>
                  <p className="text-[#888888] text-lg font-light leading-relaxed">
                    Every feature you need to go from "what if" to "hello world". We handle the research so you can focus on execution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                  {/* Feature 1 (Large) */}
                  <div className="md:col-span-2 bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-white/6 rounded-3xl p-8 relative overflow-hidden group hover:border-white/15 transition-all duration-400">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-medium text-white mb-2">Deep Market Intelligence</h3>
                        <p className="text-[#888888] font-light max-w-md">Our AI analyzes thousands of data points to give you a realistic view of your idea's potential before you write a single line of code.</p>
                      </div>
                      {/* Decorative Graph */}
                      <div className="w-full h-32 mt-6 border border-white/5 rounded-lg bg-black/40 p-4 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-4 pb-0 opacity-50">
                          <div className="w-8 bg-indigo-500/40 h-[30%] rounded-t" />
                          <div className="w-8 bg-indigo-500/60 h-[50%] rounded-t" />
                          <div className="w-8 bg-indigo-500/80 h-[40%] rounded-t" />
                          <div className="w-8 bg-indigo-500 h-[75%] rounded-t shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                          <div className="w-8 bg-indigo-500/50 h-[60%] rounded-t" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-white/6 rounded-3xl p-8 relative overflow-hidden group hover:border-white/15 transition-all duration-400">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 mb-6 border border-pink-500/20">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Competitor Analysis</h3>
                    <p className="text-sm text-[#888888] font-light leading-relaxed">Instantly spot gaps in the market by analyzing what existing solutions are missing.</p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-white/6 rounded-3xl p-8 relative overflow-hidden group hover:border-white/15 transition-all duration-400">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Demand Scoring</h3>
                    <p className="text-sm text-[#888888] font-light leading-relaxed">Get a 0-100% viability score based on search volume trends and social sentiment.</p>
                  </div>

                  {/* Feature 4 (Large) */}
                  <div className="md:col-span-2 bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-white/6 rounded-3xl p-8 relative overflow-hidden group hover:border-white/15 transition-all duration-400 flex items-center">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500" />
                    <div className="relative z-10 w-1/2 pr-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-medium text-white mb-2">Detailed Blueprints</h3>
                      <p className="text-[#888888] font-light">Export comprehensive technical specs compatible with V0, Bolt, and Lovable.</p>
                    </div>
                    <div className="w-1/2 h-full bg-[#050505] border border-white/5 rounded-xl p-4 font-mono text-[10px] text-gray-400 overflow-hidden shadow-inner">
                      <div className="flex gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                      </div>
                      <p><span className="text-blue-400">const</span> <span className="text-yellow-300">stack</span> = {'{'}</p>
                      <p className="pl-4">frontend: <span className="text-green-400">"Next.js 14"</span>,</p>
                      <p className="pl-4">styling: <span className="text-green-400">"Tailwind"</span>,</p>
                      <p className="pl-4">db: <span className="text-green-400">"Postgres"</span>,</p>
                      <p className="pl-4">auth: <span className="text-green-400">"Supabase"</span></p>
                      <p>{'}'}</p>
                      <p className="mt-2 text-gray-600">// Ready to deploy</p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-32 relative border-t border-white/5">
              <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-24">
                  <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-6">How it works</h2>
                </div>

                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                  {/* Step 1 */}
                  <div className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center mb-16 group">
                    <div className="md:w-1/2 md:pr-12 text-left md:text-right">
                      <h3 className="text-xl font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">1. Describe Idea</h3>
                      <p className="text-sm text-[#888888]">Input a simple sentence about your concept. No complex forms.</p>
                    </div>
                    <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-[18px] h-[18px] rounded-full bg-[#020202] border-2 border-white/20 z-10 group-hover:border-indigo-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_black]" />
                    <div className="md:w-1/2 md:pl-12 pl-12" />
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center mb-16 group">
                    <div className="md:w-1/2 md:pr-12 text-left md:text-right order-1 md:order-none hidden md:block" />
                    <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-[18px] h-[18px] rounded-full bg-[#020202] border-2 border-white/20 z-10 group-hover:border-indigo-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_black]" />
                    <div className="md:w-1/2 md:pl-12 pl-12">
                      <h3 className="text-xl font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">2. AI Analysis</h3>
                      <p className="text-sm text-[#888888]">Our engine scrapes the web, checks competitors, and scores demand.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center mb-16 group">
                    <div className="md:w-1/2 md:pr-12 text-left md:text-right">
                      <h3 className="text-xl font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">3. Blueprint Generation</h3>
                      <p className="text-sm text-[#888888]">Receive a step-by-step tech spec tailored to your preferred stack.</p>
                    </div>
                    <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-[18px] h-[18px] rounded-full bg-[#020202] border-2 border-white/20 z-10 group-hover:border-indigo-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_black]" />
                    <div className="md:w-1/2 md:pl-12 pl-12" />
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center group">
                    <div className="md:w-1/2 md:pr-12 text-left md:text-right hidden md:block" />
                    <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-[18px] h-[18px] rounded-full bg-[#020202] border-2 border-white/20 z-10 group-hover:border-indigo-500 group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_black]" />
                    <div className="md:w-1/2 md:pl-12 pl-12">
                      <h3 className="text-xl font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">4. Start Building</h3>
                      <p className="text-sm text-[#888888]">Copy prompts into V0 or Lovable and watch your app come to life.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 relative">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                  <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-6">Simple pricing</h2>
                  <p className="text-[#888888] text-lg font-light">Pay only for what you need. No subscriptions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {/* Free Tier */}
                  <div className="bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-white/6 rounded-2xl p-8 flex flex-col hover:border-white/10 transition-all">
                    <div className="mb-4">
                      <span className="text-sm font-medium text-[#888888] border border-white/10 px-3 py-1 rounded-full">Free</span>
                    </div>
                    <div className="text-4xl font-medium text-white tracking-tight mb-2">₹0</div>
                    <p className="text-sm text-[#888888] mb-8">Try it out for free.</p>

                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-3 text-sm text-[#888888]">
                        <Check className="text-white w-4 h-4" /> 1 Free Generation
                      </li>
                      <li className="flex items-center gap-3 text-sm text-[#888888]">
                        <Check className="text-white w-4 h-4" /> Basic Analytics
                      </li>
                      <li className="flex items-center gap-3 text-sm text-[#888888]">
                        <Check className="text-white w-4 h-4" /> Standard Blueprints
                      </li>
                    </ul>
                    <Button
                      onClick={() => navigate("/auth")}
                      variant="outline"
                      className="w-full py-3 rounded-lg border border-white/10 text-center text-sm font-medium text-white hover:bg-white/5 transition-colors"
                    >
                      Get Started
                    </Button>
                  </div>

                  {/* Basic Pack */}
                  <div className="bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-white/6 rounded-2xl p-8 flex flex-col hover:border-white/10 transition-all">
                    <div className="mb-4 flex justify-between items-center">
                      <span className="text-sm font-medium text-[#888888] border border-white/10 px-3 py-1 rounded-full">Basic Pack</span>
                      <span className="text-xs text-green-400 font-medium">Save 87%</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-4xl font-medium text-white tracking-tight">₹10</div>
                      <span className="text-lg text-[#888888] line-through">₹75</span>
                    </div>
                    <p className="text-sm text-[#888888] mb-8">5 AI Generations</p>

                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="text-white w-4 h-4" /> 5 AI Generations
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="text-white w-4 h-4" /> Standard Analytics
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="text-white w-4 h-4" /> Email Support
                      </li>
                    </ul>
                    <Button
                      onClick={() => navigate("/pricing")}
                      variant="outline"
                      className="w-full py-3 rounded-lg border border-white/10 text-center text-sm font-medium text-white hover:bg-white/5 transition-colors"
                    >
                      Buy Basic Pack
                    </Button>
                  </div>

                  {/* Premium Pack */}
                  <div className="bg-gradient-to-b from-[rgba(20,20,20,0.6)] to-[rgba(10,10,10,0.4)] backdrop-blur-[12px] border border-indigo-500/30 rounded-2xl p-8 flex flex-col relative">
                    <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                    <div className="mb-4 flex justify-between items-center">
                      <span className="text-sm font-medium text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 rounded-full">Premium Pack</span>
                      <span className="text-xs text-indigo-300 font-medium">Save 85%</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-4xl font-medium text-white tracking-tight">₹15</div>
                      <span className="text-lg text-[#888888] line-through">₹100</span>
                    </div>
                    <p className="text-sm text-[#888888] mb-8">10 AI Generations</p>

                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="text-indigo-400 w-4 h-4" /> 10 AI Generations
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="text-indigo-400 w-4 h-4" /> Advanced Analytics
                      </li>
                      <li className="flex items-center gap-3 text-sm text-white">
                        <Check className="text-indigo-400 w-4 h-4" /> Priority Support
                      </li>
                    </ul>
                    <Button
                      onClick={() => navigate("/pricing")}
                      className="w-full py-3 rounded-lg bg-white text-center text-sm font-semibold text-black hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    >
                      Buy Premium Pack
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#020202] pt-20 pb-10 relative">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                        <span className="text-black font-semibold text-[10px]">IB</span>
                      </div>
                      <span className="text-white font-medium">IdeaBoard</span>
                    </div>
                    <p className="text-sm text-[#888888] font-light">Accelerating the journey from idea to product.</p>
                  </div>
                  <div className="flex gap-16">
                    <div>
                      <h4 className="text-white font-medium text-sm mb-4">Product</h4>
                      <ul className="space-y-3 text-sm text-[#888888] font-light">
                        <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="/about-us" className="hover:text-white transition-colors">About</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm mb-4">Legal</h4>
                      <ul className="space-y-3 text-sm text-[#888888] font-light">
                        <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a></li>
                        <li><a href="/terms-and-conditions" className="hover:text-white transition-colors">Terms</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-[#888888]/60">© 2024 IdeaBoard Inc. All rights reserved.</p>
                  <div className="flex gap-4">
                    <a href="https://twitter.com/ideaboard_ai" className="text-[#888888] hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    <a href="https://github.com" className="text-[#888888] hover:text-white transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}

        {stage === "research" && research && (
          <div className="min-h-screen pt-24">
            <ResearchResults research={research} onNext={() => setStage("platform")} onBack={handleReset} />
          </div>
        )}

        {stage === "platform" && (
          <div className="min-h-screen pt-24">
            <PlatformSelector onSelect={handlePlatformSelect} loading={loading} onBack={() => setStage("research")} />
          </div>
        )}

        {stage === "plan" && buildPlan && (
          <div className="min-h-screen pt-24">
            <BuildPlan plan={buildPlan} platform={platform} onReset={handleReset} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;