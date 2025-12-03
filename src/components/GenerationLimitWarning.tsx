import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PLAN_LIMITS: { [key: string]: number } = {
  free: 1,
  basic: 5,
  premium: 10,
};

export const GenerationLimitWarning: React.FC = () => {
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
  const percentage = (usage / limit) * 100;

  // Only show warning at 80% or higher
  if (percentage < 80) return null;

  const getWarningLevel = () => {
    if (percentage >= 100) return "destructive";
    if (percentage >= 90) return "destructive";
    return "default";
  };

  const getWarningMessage = () => {
    if (percentage >= 100) {
      return `You've reached your ${planId} plan limit (${usage}/${limit} generations). Upgrade to continue.`;
    }
    if (percentage >= 90) {
      return `You're at ${usage}/${limit} generations (${Math.round(percentage)}%). Consider upgrading soon.`;
    }
    return `You've used ${usage}/${limit} generations (${Math.round(percentage)}%). Upgrade for more.`;
  };

  return (
    <Alert variant={getWarningLevel()} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Generation Limit Warning</AlertTitle>
      <AlertDescription className="space-y-3">
        <div className="flex items-center justify-between">
          <span>{getWarningMessage()}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/pricing")}
            className="ml-4"
          >
            Upgrade Plan
          </Button>
        </div>
        <div className="space-y-1">
          <Progress value={Math.min(percentage, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {usage} / {limit} generations used
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
