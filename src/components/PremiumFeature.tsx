import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumFeatureProps {
    isPremium: boolean;
    children: React.ReactNode;
    title: string;
    description: string;
}

export const PremiumFeature = ({ isPremium, children, title, description }: PremiumFeatureProps) => {
    const navigate = useNavigate();

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-border/50">
            <div className="filter blur-md pointer-events-none select-none opacity-50">
                {children}
            </div>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground max-w-md mb-6">{description}</p>
                <Button
                    onClick={() => navigate("/pricing")}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25"
                >
                    Upgrade to Premium
                </Button>
            </div>
        </div>
    );
};
