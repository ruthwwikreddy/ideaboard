import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  ShoppingCart,
  Users,
  Briefcase,
  Heart,
  BookOpen,
  Gamepad2,
  Utensils,
  Plane,
  Music,
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  category: string;
  idea: string;
  icon: React.ElementType;
  color: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: "saas-dashboard",
    title: "SaaS Analytics Dashboard",
    category: "Business",
    idea: "A real-time analytics dashboard for SaaS companies that tracks user engagement, MRR, churn rate, and customer lifetime value. Features include customizable widgets, automated reports, and integrations with Stripe and popular CRMs.",
    icon: Briefcase,
    color: "from-blue-500/20 to-blue-600/5",
    tags: ["B2B", "Analytics", "SaaS"],
  },
  {
    id: "ecommerce-marketplace",
    title: "Niche Marketplace",
    category: "E-Commerce",
    idea: "A marketplace platform connecting local artisans with customers looking for handmade, sustainable products. Features include seller profiles, secure payments, order tracking, reviews, and a carbon footprint calculator for shipping.",
    icon: ShoppingCart,
    color: "from-green-500/20 to-green-600/5",
    tags: ["Marketplace", "Sustainability", "Local"],
  },
  {
    id: "community-platform",
    title: "Community Learning Platform",
    category: "Education",
    idea: "An online learning community where experts can create micro-courses and learners can access bite-sized lessons. Features include progress tracking, peer discussions, certificates, and a mentor matching system.",
    icon: BookOpen,
    color: "from-purple-500/20 to-purple-600/5",
    tags: ["EdTech", "Community", "Courses"],
  },
  {
    id: "health-tracker",
    title: "Holistic Health Tracker",
    category: "Health & Wellness",
    idea: "A comprehensive health app that tracks sleep, nutrition, exercise, and mental wellness. Uses AI to provide personalized recommendations and identify patterns. Integrates with wearables and includes guided meditation sessions.",
    icon: Heart,
    color: "from-rose-500/20 to-rose-600/5",
    tags: ["HealthTech", "AI", "Wellness"],
  },
  {
    id: "social-networking",
    title: "Interest-Based Social Network",
    category: "Social",
    idea: "A social platform that connects people based on shared hobbies and interests rather than existing relationships. Features include local event discovery, group challenges, skill-sharing sessions, and a reputation system.",
    icon: Users,
    color: "from-indigo-500/20 to-indigo-600/5",
    tags: ["Social", "Community", "Events"],
  },
  {
    id: "gaming-platform",
    title: "Casual Gaming Tournament Platform",
    category: "Gaming",
    idea: "A platform for organizing and participating in casual gaming tournaments. Features include matchmaking, leaderboards, prize pools, streaming integration, and social features for building gaming communities.",
    icon: Gamepad2,
    color: "from-orange-500/20 to-orange-600/5",
    tags: ["Gaming", "Esports", "Community"],
  },
  {
    id: "food-delivery",
    title: "Meal Prep Delivery Service",
    category: "Food",
    idea: "A subscription-based meal prep service that delivers ingredients with recipes tailored to dietary preferences and health goals. Features include nutritional tracking, family meal planning, and zero-waste packaging options.",
    icon: Utensils,
    color: "from-amber-500/20 to-amber-600/5",
    tags: ["Food Tech", "Subscription", "Health"],
  },
  {
    id: "travel-planner",
    title: "AI Travel Planner",
    category: "Travel",
    idea: "An AI-powered travel planning app that creates personalized itineraries based on interests, budget, and travel style. Features include real-time pricing, local recommendations, collaborative trip planning, and offline access.",
    icon: Plane,
    color: "from-cyan-500/20 to-cyan-600/5",
    tags: ["Travel", "AI", "Planning"],
  },
  {
    id: "music-collab",
    title: "Music Collaboration Platform",
    category: "Creative",
    idea: "A platform for musicians to collaborate remotely on tracks. Features include real-time audio/MIDI sharing, version control for projects, virtual jam sessions, royalty splitting, and AI-assisted mixing suggestions.",
    icon: Music,
    color: "from-pink-500/20 to-pink-600/5",
    tags: ["Music", "Collaboration", "Creative"],
  },
];

interface ProjectTemplatesProps {
  onSelectTemplate: (idea: string) => void;
}

export const ProjectTemplates = ({ onSelectTemplate }: ProjectTemplatesProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Need Inspiration?</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Start with a Template</h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Choose from curated app ideas to kickstart your validation journey
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card
                className={`relative overflow-hidden border-border hover:border-primary/50 transition-all cursor-pointer group h-full bg-gradient-to-br ${template.color}`}
                onClick={() => onSelectTemplate(template.idea)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {template.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {template.idea}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-background/60 hover:bg-background/80"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTemplates;