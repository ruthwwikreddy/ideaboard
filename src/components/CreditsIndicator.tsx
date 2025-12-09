import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PLAN_LIMITS: { [key: string]: number } = {
  free: 1,
  basic: 5,
  premium: 10,
};

export const CreditsIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();
      
      return data;
    },
    enabled: !!userId,
  });

  if (!profile || !userId) return null;

  const planId = subscription?.plan_id || "free";
  const limit = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
  const usage = profile.generation_count || 0;
  const remaining = Math.max(0, limit - usage);
  const isLow = remaining <= 2;
  const isEmpty = remaining === 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/pricing")}
            className={`gap-2 px-3 h-9 rounded-full border transition-all ${
              isEmpty
                ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
                : isLow
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
                : "border-border/50 bg-secondary/50 text-foreground hover:bg-secondary"
            }`}
          >
            <Zap className={`w-4 h-4 ${isEmpty ? "text-destructive" : isLow ? "text-yellow-500" : "text-primary"}`} />
            <span className="font-medium text-sm">
              {remaining}/{limit}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-sm">
            {isEmpty
              ? "No credits left! Click to upgrade."
              : isLow
              ? `Only ${remaining} credit${remaining === 1 ? "" : "s"} remaining. Click to get more.`
              : `${remaining} generation${remaining === 1 ? "" : "s"} remaining this month.`}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{planId} Plan</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
