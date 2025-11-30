import { Helmet } from "react-helmet-async";
import { Lightbulb, Target, Zap, Users, Linkedin } from "lucide-react";
import BackToHome from "@/components/BackToHome";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We leverage cutting-edge AI to transform how ideas are validated and brought to life.",
  },
  {
    icon: Target,
    title: "User-Centric",
    description: "Every feature is designed to save time and provide actionable insights for creators.",
  },
  {
    icon: Zap,
    title: "Speed & Efficiency",
    description: "From idea to execution in minutes, not weeks. We value your time.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built by founders, for founders. We understand your journey because we're on it too.",
  },
];

const team = [
  {
    name: "Ruthwik Reddy",
    role: "Founder & Builder",
    initials: "RR",
    bio: "Turning problems into working products. Handles the full stack — product thinking, development, systems, and rapid execution. Focused on building tech that actually gets used, not just demoed.",
    linkedin: "https://www.linkedin.com/in/ruthwwikreddy/",
  },
  {
    name: "Anup Medhi",
    role: "Co-Founder & Product/Brand Strategy",
    initials: "AM",
    bio: "Brings a decade of experience in design thinking, UX, MVP shipping, and brand systems. Sharp at refining raw ideas into clear, usable, market-ready products. Leads product experience, design direction, and early-market positioning.",
    linkedin: "https://www.linkedin.com/in/anup-medhi-67881188/",
  },
];

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us - IdeaBoard</title>
        <meta name="description" content="Learn about the team and mission behind IdeaBoard - AI-powered idea validation and build planning." />
        <link rel="canonical" href="https://www.ideaboard.ai/about-us" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ideaboard.ai/about-us" />
        <meta property="og:title" content="About Us - IdeaBoard" />
        <meta property="og:description" content="Learn about the team and mission behind IdeaBoard - AI-powered idea validation and build planning." />
        <meta property="og:image" content="https://www.ideaboard.ai/logo.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ideaboard.ai/about-us" />
        <meta property="twitter:title" content="About Us - IdeaBoard" />
        <meta property="twitter:description" content="Learn about the team and mission behind IdeaBoard - AI-powered idea validation and build planning." />
        <meta property="twitter:image" content="https://www.ideaboard.ai/logo.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <BackToHome />

          {/* Hero Section */}
          <header className="text-center mb-20 mt-8">
            <div className="inline-block mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-purple-500 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
              Building the Future of Idea Validation
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              We believe that every great product starts with a great idea and an even better plan.
              Our mission is to empower founders, developers, and creators to turn their visions into
              reality with AI-powered validation and planning tools.
            </p>
          </header>

          {/* Values Section */}
          <section className="mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Meet the Team</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A small, focused team dedicated to helping you validate and build better products.
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{member.initials}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                      <p className="text-primary text-sm font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{member.bio}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    Connect on LinkedIn
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Validate Your Idea?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of founders who are using IdeaBoard to turn their ideas into successful products.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </a>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
