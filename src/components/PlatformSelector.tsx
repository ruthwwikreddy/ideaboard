import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

const platforms = [
  {
    name: "Lovable",
    description: "AI-powered React builder with instant deployment",
    url: "https://lovable.dev?ref=ideaboard",
    color: "primary",
  },
  {
    name: "Bolt",
    description: "Full-stack web development with AI assistance",
    url: "https://bolt.new?ref=ideaboard",
    color: "accent",
  },
  {
    name: "Replit",
    description: "Collaborative browser-based IDE with AI",
    url: "https://replit.com?ref=ideaboard",
    color: "neon-green",
  },
  {
    name: "FlutterFlow",
    description: "Visual builder for mobile and web apps",
    url: "https://flutterflow.io?ref=ideaboard",
    color: "neon-purple",
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
            className="p-6 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => !loading && onSelect(platform.name)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{platform.name}</h3>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
