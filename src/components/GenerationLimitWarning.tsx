import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GenerationLimitWarningProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPlan: "free" | "basic" | "premium";
    generationsUsed: number;
    generationsLimit: number;
    isAtLimit: boolean;
}

export const GenerationLimitWarning = ({
    open,
    onOpenChange,
    currentPlan,
    generationsUsed,
    generationsLimit,
    isAtLimit,
}: GenerationLimitWarningProps) => {
    const navigate = useNavigate();

    const getWarningContent = () => {
        if (isAtLimit) {
            return {
                title: "Generation Limit Reached! 🚫",
                description: `You've used all ${generationsLimit} generations for your ${currentPlan} plan this month. Upgrade to continue generating ideas and unlock more features.`,
                icon: <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />,
                variant: "destructive" as const,
            };
        } else {
            const remaining = generationsLimit - generationsUsed;
            return {
                title: "Running Low on Generations ⚠️",
                description: `You have ${remaining} generation${remaining !== 1 ? "s" : ""} remaining out of ${generationsLimit} for your ${currentPlan} plan this month. Consider upgrading for more generations!`,
                icon: <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />,
                variant: "warning" as const,
            };
        }
    };

    const { title, description, icon, variant } = getWarningContent();

    const handleUpgrade = () => {
        onOpenChange(false);
        navigate("/pricing");
    };

    const handleViewProfile = () => {
        onOpenChange(false);
        navigate("/profile");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {icon}
                    <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/50 p-4 rounded-lg my-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Plan:</span>
                        <span className="font-semibold capitalize">{currentPlan}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Generations Used:</span>
                        <span className="font-semibold">
                            {generationsUsed} / {generationsLimit}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Remaining:</span>
                        <span
                            className={`font-semibold ${isAtLimit ? "text-destructive" : "text-primary"
                                }`}
                        >
                            {Math.max(0, generationsLimit - generationsUsed)}
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    {isAtLimit ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleUpgrade}
                                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                            >
                                <Crown className="mr-2 h-4 w-4" />
                                Upgrade Now
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleViewProfile}
                                className="flex-1"
                            >
                                View Usage
                            </Button>
                            <Button
                                onClick={handleUpgrade}
                                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                            >
                                <Crown className="mr-2 h-4 w-4" />
                                Upgrade Plan
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
