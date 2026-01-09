import { motion } from "framer-motion";
import { Check, Lightbulb, Search, Layout, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "input" | "research" | "platform" | "plan";

interface ProgressStepperProps {
  currentStage: Stage;
  className?: string;
}

const stages: { id: Stage; label: string; icon: React.ElementType }[] = [
  { id: "input", label: "Idea", icon: Lightbulb },
  { id: "research", label: "Research", icon: Search },
  { id: "platform", label: "Platform", icon: Layout },
  { id: "plan", label: "Build Plan", icon: FileCode2 },
];

export const ProgressStepper = ({ currentStage, className }: ProgressStepperProps) => {
  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.id} className="relative flex flex-col items-center z-10">
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-background border-primary text-primary",
                  isPending && "bg-background border-border text-muted-foreground"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <motion.span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent && "text-primary",
                  !isCurrent && "text-muted-foreground"
                )}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
              >
                {stage.label}
              </motion.span>
              
              {isCurrent && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
