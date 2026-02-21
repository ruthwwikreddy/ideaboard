import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  LogIn,
  Zap,
  BrainCircuit,
  Target,
  CheckCircle,
  FileCode2,
  Check,
  Sparkles,
  ChevronRight,
  BarChart3,
  Layers,
  Rocket,
  Github,
  Twitter,
} from "lucide-react";
import { ResearchResults } from "@/components/ResearchResults";
import { PlatformSelector } from "@/components/PlatformSelector";
import { BuildPlan } from "@/components/BuildPlan";
import { ProgressStepper } from "@/components/ProgressStepper";
import { OrganizationSchema, SoftwareApplicationSchema, HowToSchema } from "@/components/SEOJsonLd";
import { ProjectTemplates } from "@/components/ProjectTemplates";
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
      if (idea.trim()) localStorage.setItem('pendingIdea', idea);
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
    if (!idea.trim()) { toast.error("Please enter your idea"); return; }
    if (!user) { toast.info("Please sign in or sign up to generate ideas."); navigate("/auth"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-idea", { body: { idea } });
      if (error) throw error;
      setResearch(data as Research);
      setStage("research");
      if (user) {
        const { data: projectData, error: projectError } = await supabase
          .from("projects").insert({ user_id: user.id, idea, research: data }).select().single();
        if (!projectError && projectData) setCurrentProjectId((projectData as { id: string }).id);
      }
      toast.success("Research completed!");
    } catch (error: unknown) {
      console.error("Error analyzing idea:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze idea");
    } finally { setLoading(false); }
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
        await supabase.from("projects").update({ platform: selectedPlatform, build_plan: data }).eq("id", currentProjectId);
      }
      toast.success("Build plan generated!");
    } catch (error: unknown) {
      console.error("Error generating plan:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate build plan");
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setStage("input"); setIdea(""); setResearch(null); setPlatform(""); setBuildPlan(null); setCurrentProjectId(null);
  };

  const howToSteps = [
    { name: "Describe your idea", text: "Enter a simple description of your app concept" },
    { name: "AI Analysis", text: "Our AI analyzes market demand, competitors, and opportunities" },
    { name: "Choose platform", text: "Select your preferred development platform" },
    { name: "Get build plan", text: "Receive detailed, executable prompts for your chosen platform" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative noise-bg">
      <Helmet>
        <title>IdeaBoard - AI-Powered App Idea Validation & Build Planning</title>
        <meta name="description" content="Validate your app idea with AI-powered market research, competitor analysis, and get detailed build plans. Transform abstract ideas into concrete products." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ideaboard.live/" />
        <meta property="og:title" content="IdeaBoard - AI-Powered App Idea Validation" />
        <meta property="og:description" content="Transform your app idea into reality with AI-powered market validation and build planning." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ideaboard.live/" />
        <meta property="og:image" content="https://ideaboard.live/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="IdeaBoard - AI-Powered App Idea Validation" />
        <meta name="twitter:description" content="Transform your app idea into reality with AI-powered market validation and build planning." />
      </Helmet>
      
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <HowToSchema 
        name="How to Validate Your App Idea with IdeaBoard" 
        description="Use AI to validate your app idea and get a detailed build plan"
        steps={howToSteps}
      />

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="glass-card text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <LogIn className="w-6 h-6 text-accent" />
              Sign in required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base mt-2">
              Create a free account to validate your ideas with AI-powered market research and build plans.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-3">
              {["1 free generation", "AI market research & competitor analysis", "Platform-specific build plans"].map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[hsl(var(--neon-emerald))]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => { if (idea.trim()) localStorage.setItem('pendingIdea', idea); navigate("/auth"); }}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background font-semibold">
                Sign Up Free
              </Button>
              <Button onClick={() => { if (idea.trim()) localStorage.setItem('pendingIdea', idea); navigate("/auth"); }}
                variant="outline" className="flex-1 border-border hover:bg-secondary text-foreground">
                Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="relative z-10">
        {stage === "input" && (
          <>
            {/* ═══════════ NAVBAR ═══════════ */}
            <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
              <nav className="pointer-events-auto backdrop-blur-xl bg-background/50 rounded-full pl-5 pr-2 py-2 flex items-center justify-between gap-6 border border-border/60 shadow-[0_8px_32px_hsl(0_0%_0%/0.5)] transition-all duration-300 hover:border-border">
                <a href="/" className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="IdeaBoard Logo" className="w-6 h-6" />
                  <span className="text-foreground font-semibold tracking-tight text-sm hidden sm:block">IdeaBoard</span>
                </a>
                <div className="hidden md:flex items-center gap-0.5">
                  {[
                    { label: "Features", href: "#features" },
                    { label: "How it works", href: "#how-it-works" },
                    { label: "Pricing", href: "#pricing" },
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="px-4 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200">{link.label}</a>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {user ? (
                    <Button onClick={() => navigate("/dashboard")} variant="ghost" className="hidden sm:flex text-xs font-medium text-muted-foreground hover:text-foreground px-3">Dashboard</Button>
                  ) : (
                    <Button onClick={() => navigate("/auth")} variant="ghost" className="hidden sm:flex text-xs font-medium text-muted-foreground hover:text-foreground px-3">Login</Button>
                  )}
                  <Button onClick={() => navigate(user ? "/dashboard" : "/auth")}
                    className="rounded-full bg-foreground text-background px-5 py-2 text-xs font-semibold hover:bg-foreground/90 transition-colors flex items-center gap-1.5">
                    <span>Get Started</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </nav>
            </div>

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
              {/* Orbital background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[400px] h-[400px] md:w-[600px] md:h-[600px]">
                  {/* Rings */}
                  <div className="absolute inset-0 rounded-full border border-border/30 animate-[spin_60s_linear_infinite]" />
                  <div className="absolute inset-8 rounded-full border border-border/20 animate-[spin_45s_linear_infinite_reverse]" />
                  <div className="absolute inset-16 rounded-full border border-border/10" />
                  {/* Orbiting dots */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[hsl(var(--neon-indigo))] animate-orbit shadow-[0_0_12px_hsl(var(--neon-indigo))]" />
                  <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-violet))] animate-orbit-reverse shadow-[0_0_10px_hsl(var(--neon-violet))]" />
                  {/* Center glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[hsl(var(--neon-indigo)/0.08)] blur-[60px] animate-pulse-glow" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 max-w-5xl mx-auto text-center">
                {/* Badge */}
                <motion.a
                  href="https://www.producthunt.com/products/ideaboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary/40 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--neon-indigo)/0.4)] hover:text-foreground transition-all mb-10 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--neon-indigo))]" />
                  <span>Live on Product Hunt</span>
                  <ChevronRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </motion.a>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8"
                >
                  <span className="text-gradient-hero">Validate.</span>
                  <br />
                  <span className="text-gradient-accent">Blueprint.</span>
                  <br />
                  <span className="text-gradient-hero">Ship.</span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                >
                  AI-powered market validation that turns your raw idea into a detailed,
                  platform-ready build plan — in under 5 minutes.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                  <Button
                    onClick={() => document.getElementById("idea-panel")?.scrollIntoView({ behavior: "smooth" })}
                    className="h-13 px-8 rounded-full bg-foreground text-background text-sm font-semibold flex items-center gap-2 hover:scale-[1.03] transition-transform duration-300 glow-indigo"
                  >
                    Start Validating
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                    variant="outline"
                    className="h-13 px-8 rounded-full border-border text-muted-foreground text-sm font-medium hover:bg-secondary/60 hover:text-foreground transition-all"
                  >
                    See how it works
                  </Button>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm"
                >
                  {[
                    { value: "1,200+", label: "Ideas Validated" },
                    { value: "40hrs", label: "Avg. Time Saved" },
                    { value: "92%", label: "PMF Success Rate" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">{stat.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* ═══════════ LOGO BAR ═══════════ */}
            <section className="border-y border-border/40 py-8 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(2)].map((_, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-16 px-8 shrink-0">
                    {["Vercel", "Supabase", "Replit", "GitHub", "Lovable", "Bolt", "V0"].map((name) => (
                      <span key={`${setIdx}-${name}`} className="text-muted-foreground/40 text-sm font-medium tracking-wide uppercase">{name}</span>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════════ IDEA INPUT ═══════════ */}
            <section className="py-24 relative">
              <div className="max-w-3xl mx-auto px-6">
                <Card
                  id="idea-panel"
                  className="glass-card rounded-2xl p-8 md:p-10 scroll-mt-28"
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground tracking-tight">What's your idea?</h2>
                      <p className="text-muted-foreground text-sm">
                        Describe your app concept. Our AI will research the market, analyze competitors, and build your blueprint.
                      </p>
                    </div>

                    <Textarea
                      placeholder="Example: A mobile app that helps freelancers track time and generate invoices automatically..."
                      value={idea}
                      onChange={handleTextareaChange}
                      onFocus={handleTextareaFocus}
                      className="min-h-[180px] text-base bg-background/60 border-border focus:border-[hsl(var(--neon-indigo)/0.5)] focus:ring-1 focus:ring-[hsl(var(--neon-indigo)/0.2)] transition-all resize-none text-foreground placeholder:text-muted-foreground/50 rounded-xl"
                    />

                    <Button
                      onClick={handleAnalyze}
                      disabled={loading || !idea.trim()}
                      className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold py-6 text-base rounded-full transition-all"
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
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

                <div className="mt-14">
                  <ProjectTemplates 
                    onSelectTemplate={(templateIdea) => {
                      if (!user) {
                        localStorage.setItem('pendingIdea', templateIdea);
                        setShowAuthDialog(true);
                        return;
                      }
                      setIdea(templateIdea);
                      toast.success("Template loaded! Click 'Analyze Idea' to start.");
                    }} 
                  />
                </div>
              </div>
            </section>

            {/* ═══════════ FEATURES (BENTO) ═══════════ */}
            <section id="features" className="py-28 relative">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <p className="text-xs font-medium text-[hsl(var(--neon-indigo))] uppercase tracking-[0.2em] mb-4">Capabilities</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-5">
                      Everything you need to ship
                    </h2>
                    <p className="text-muted-foreground text-lg font-light">
                      From "what if" to "hello world" — we handle the research so you can focus on execution.
                    </p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">
                  {/* Feature 1 — large */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="md:col-span-2 glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group transition-all duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--neon-indigo)/0.08)] rounded-full blur-[80px] group-hover:bg-[hsl(var(--neon-indigo)/0.15)] transition-all duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--neon-indigo)/0.15)] flex items-center justify-center text-[hsl(var(--neon-indigo))] mb-5 border border-[hsl(var(--neon-indigo)/0.2)]">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Deep Market Intelligence</h3>
                        <p className="text-sm text-muted-foreground font-light max-w-md">Analyzes thousands of data points to give you a realistic view of your idea's potential before you write a single line of code.</p>
                      </div>
                      <div className="w-full h-20 mt-4 rounded-lg bg-background/40 border border-border/40 p-3 flex items-end gap-1.5">
                        {[30, 50, 40, 75, 60, 85, 70].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm bg-[hsl(var(--neon-indigo))]" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Feature 2 */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--neon-emerald)/0.15)] flex items-center justify-center text-[hsl(var(--neon-emerald))] mb-5 border border-[hsl(var(--neon-emerald)/0.2)]">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Competitor Analysis</h3>
                    <p className="text-sm text-muted-foreground font-light">Spot gaps in the market by analyzing what existing solutions are missing.</p>
                  </motion.div>

                  {/* Feature 3 */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                    className="glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--neon-violet)/0.15)] flex items-center justify-center text-[hsl(var(--neon-violet))] mb-5 border border-[hsl(var(--neon-violet)/0.2)]">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Demand Scoring</h3>
                    <p className="text-sm text-muted-foreground font-light">0–100% viability score based on real market signals and social sentiment.</p>
                  </motion.div>

                  {/* Feature 4 — large */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                    className="md:col-span-2 glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group transition-all duration-300 flex items-center gap-8">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-[hsl(var(--neon-cyan)/0.06)] rounded-full blur-[80px] group-hover:bg-[hsl(var(--neon-cyan)/0.12)] transition-all duration-500" />
                    <div className="relative z-10 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--neon-cyan)/0.15)] flex items-center justify-center text-[hsl(var(--neon-cyan))] mb-5 border border-[hsl(var(--neon-cyan)/0.2)]">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Build Blueprints</h3>
                      <p className="text-sm text-muted-foreground font-light">Export technical specs compatible with V0, Bolt, Lovable, and Replit.</p>
                    </div>
                    <div className="hidden md:block flex-1 h-full bg-background/60 border border-border/40 rounded-xl p-4 font-mono text-[11px] text-muted-foreground overflow-hidden">
                      <div className="flex gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-destructive/40" />
                        <div className="w-2 h-2 rounded-full bg-[hsl(40_80%_50%/0.4)]" />
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--neon-emerald)/0.4)]" />
                      </div>
                      <p><span className="text-[hsl(var(--neon-indigo))]">const</span> <span className="text-[hsl(40_80%_60%)]">stack</span> = {'{'}</p>
                      <p className="pl-4">frontend: <span className="text-[hsl(var(--neon-emerald))]">"Next.js 14"</span>,</p>
                      <p className="pl-4">styling: <span className="text-[hsl(var(--neon-emerald))]">"Tailwind"</span>,</p>
                      <p className="pl-4">db: <span className="text-[hsl(var(--neon-emerald))]">"Postgres"</span>,</p>
                      <p className="pl-4">auth: <span className="text-[hsl(var(--neon-emerald))]">"Supabase"</span></p>
                      <p>{'}'}</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how-it-works" className="py-28 relative">
              {/* Separator line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px glow-line" />
              
              <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-20">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <p className="text-xs font-medium text-[hsl(var(--neon-indigo))] uppercase tracking-[0.2em] mb-4">Process</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">How it works</h2>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { icon: Layers, title: "Describe", desc: "Share your raw app idea in plain language. No forms, no friction.", num: "01", color: "--neon-indigo" },
                    { icon: BrainCircuit, title: "Analyze", desc: "AI researches competitors, scores demand, and identifies market gaps.", num: "02", color: "--neon-violet" },
                    { icon: Target, title: "Select", desc: "Choose your preferred platform — Lovable, Bolt, V0, or Replit.", num: "03", color: "--neon-cyan" },
                    { icon: Rocket, title: "Build", desc: "Get a phased blueprint with copy-paste-ready prompts.", num: "04", color: "--neon-emerald" },
                  ].map((step, idx) => (
                    <motion.div
                      key={step.num}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card glass-card-hover rounded-2xl p-6 relative group transition-all duration-300"
                    >
                      <span className={`text-[80px] font-black absolute -top-2 -right-1 leading-none text-[hsl(var(${step.color})/0.06)] group-hover:text-[hsl(var(${step.color})/0.12)] transition-colors select-none`}>
                        {step.num}
                      </span>
                      <div className="relative z-10">
                        <div className={`w-10 h-10 rounded-xl bg-[hsl(var(${step.color})/0.15)] flex items-center justify-center text-[hsl(var(${step.color}))] mb-5 border border-[hsl(var(${step.color})/0.2)]`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════ PRICING ═══════════ */}
            <section id="pricing" className="py-28 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px glow-line" />
              
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <p className="text-xs font-medium text-[hsl(var(--neon-indigo))] uppercase tracking-[0.2em] mb-4">Pricing</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-5">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground text-lg font-light">Pay only for what you need. No subscriptions. Credits never expire.</p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Free */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="glass-card glass-card-hover rounded-2xl p-8 flex flex-col transition-all duration-300">
                    <span className="text-xs font-medium text-muted-foreground border border-border px-3 py-1 rounded-full w-fit mb-6">Free</span>
                    <div className="text-4xl font-bold text-foreground tracking-tight mb-1">₹0</div>
                    <p className="text-sm text-muted-foreground mb-8">Try it out, no strings attached.</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["1 Free Generation", "Basic Analytics", "Standard Blueprints"].map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Check className="text-foreground/60 w-4 h-4 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate("/auth")} variant="outline" className="w-full rounded-xl border-border text-foreground hover:bg-secondary/60">
                      Get Started
                    </Button>
                  </motion.div>

                  {/* Basic */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="glass-card glass-card-hover rounded-2xl p-8 flex flex-col transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-medium text-muted-foreground border border-border px-3 py-1 rounded-full">Basic Pack</span>
                      <span className="text-xs text-[hsl(var(--neon-emerald))] font-semibold">Save 87%</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-foreground tracking-tight">₹10</span>
                      <span className="text-lg text-muted-foreground line-through">₹75</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">5 AI Generations</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["5 AI Generations", "Standard Analytics", "Email Support", "PDF Export"].map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-foreground/80">
                          <Check className="text-foreground/60 w-4 h-4 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate("/pricing")} variant="outline" className="w-full rounded-xl border-border text-foreground hover:bg-secondary/60">
                      Buy Basic
                    </Button>
                  </motion.div>

                  {/* Premium */}
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-8 flex flex-col relative border-[hsl(var(--neon-indigo)/0.3)] transition-all duration-300 glow-indigo">
                    <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--neon-indigo))] to-transparent" />
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-medium text-[hsl(var(--neon-indigo))] border border-[hsl(var(--neon-indigo)/0.3)] bg-[hsl(var(--neon-indigo)/0.1)] px-3 py-1 rounded-full">Premium</span>
                      <span className="text-xs text-[hsl(var(--neon-indigo))] font-semibold">Save 85%</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold text-foreground tracking-tight">₹15</span>
                      <span className="text-lg text-muted-foreground line-through">₹100</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">10 AI Generations</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["10 AI Generations", "Advanced Analytics", "Priority Support", "Compare Projects"].map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                          <Check className="text-[hsl(var(--neon-indigo))] w-4 h-4 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => navigate("/pricing")}
                      className="w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 shadow-[0_0_20px_hsl(var(--neon-indigo)/0.2)]">
                      Buy Premium
                    </Button>
                  </motion.div>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-10">
                  All payments processed securely via Razorpay. Credits are added instantly.
                </p>
              </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-28 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px glow-line" />
              <div className="max-w-3xl mx-auto px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
                    Ready to validate<br />your next idea?
                  </h2>
                  <p className="text-muted-foreground text-lg font-light mb-10 max-w-xl mx-auto">
                    Join 1,200+ founders who save 40+ hours of research and launch with confidence.
                  </p>
                  <Button
                    onClick={() => document.getElementById("idea-panel")?.scrollIntoView({ behavior: "smooth" })}
                    className="h-14 px-10 rounded-full bg-foreground text-background text-sm font-semibold hover:scale-[1.03] transition-transform glow-indigo"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
                    {["No credit card required", "Results in 5 min", "Export to PDF"].map((t) => (
                      <span key={t} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--neon-emerald))]" /> {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-border/40 pt-16 pb-8">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <img src="/logo.png" alt="IdeaBoard" className="w-5 h-5" />
                      <span className="text-foreground font-semibold text-sm">IdeaBoard</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-light">Accelerating the journey from idea to product.</p>
                  </div>
                  <div className="flex gap-16">
                    <div>
                      <h4 className="text-foreground font-medium text-xs uppercase tracking-wider mb-4">Product</h4>
                      <ul className="space-y-2.5 text-sm text-muted-foreground">
                        <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                        <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                        <li><a href="/about-us" className="hover:text-foreground transition-colors">About</a></li>
                        <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-foreground font-medium text-xs uppercase tracking-wider mb-4">Legal</h4>
                      <ul className="space-y-2.5 text-sm text-muted-foreground">
                        <li><a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</a></li>
                        <li><a href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</a></li>
                        <li><a href="/cancellations-and-refunds" className="hover:text-foreground transition-colors">Refunds</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} IdeaBoard. All rights reserved.</p>
                  <div className="flex gap-4">
                    <a href="https://twitter.com/ideaboard_ai" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
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
            <BuildPlan plan={buildPlan} platform={platform} onReset={handleReset} idea={idea} research={research} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
