import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Lovable from "@/assets/lovable.svg";
import Bolt from "@/assets/bolt.svg";
import V0 from "@/assets/v0.svg";
import Replit from "@/assets/replit.svg";

const platforms = [
  {
    name: "Lovable",
    description: "AI-powered React builder with instant deployment",
    url: "https://lovable.dev/invite/E51RSFR",
    color: "primary",
    logo: Lovable,
  },
  {
    name: "Bolt",
    description: "Full-stack web development with AI assistance",
    url: "https://bolt.new/?rid=z600g1",
    color: "accent",
    logo: Bolt,
  },
  {
    name: "Replit",
    description: "Collaborative browser-based IDE with AI",
    url: "https://replit.com/refer/akkenapallyredd",
    color: "neon-green",
    logo: Replit,
  },
  {
    name: "v0",
    description: "AI-powered frontend components and UI generation",
    url: "https://v0.app/ref/38YXBK",
    color: "neon-purple",
    logo: V0,
  },
];

interface PlatformSelectorProps {
  onSelect: (platform: string) => void;
  loading: boolean;
  onBack: () => void;
}

export const PlatformSelector = ({ onSelect, loading, onBack }: PlatformSelectorProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold mb-2">Choose Your Build Platform</h2>
        <p className="text-muted-foreground">Select where you want to build your MVP</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.name}
            className="p-6 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg"
            onClick={() => !loading && onSelect(platform.name)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="h-12 w-auto relative z-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{platform.name}</h3>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{platform.description}</p>
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-sm text-primary font-medium group-hover:underline">
                Select Platform →
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button onClick={onBack} variant="outline" className="border-border hover:bg-secondary" disabled={loading}>
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Research
      </Button>
    </div>
  );
};
