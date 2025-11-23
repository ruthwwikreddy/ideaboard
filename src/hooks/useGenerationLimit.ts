import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseGenerationLimitReturn {
    generationsUsed: number;
    generationsLimit: number;
    currentPlan: "free" | "basic" | "premium";
    isAtLimit: boolean;
    isNearLimit: boolean;
    showWarning: boolean;
    setShowWarning: (show: boolean) => void;
    checkAndShowWarning: () => void;
    fetchLimits: () => Promise<void>;
}

const PLAN_LIMITS = {
    free: 1,
    basic: 5,
    premium: 10,
};

const WARNING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const NEAR_LIMIT_THRESHOLD = 0.8; // Show warning when 80% used
const LAST_WARNING_KEY = "generation-limit-last-warning";

export const useGenerationLimit = (): UseGenerationLimitReturn => {
    const [generationsUsed, setGenerationsUsed] = useState(0);
    const [currentPlan, setCurrentPlan] = useState<"free" | "basic" | "premium">("free");
    const [showWarning, setShowWarning] = useState(false);

    const generationsLimit = PLAN_LIMITS[currentPlan];
    const isAtLimit = generationsUsed >= generationsLimit;
    const isNearLimit = generationsUsed >= generationsLimit * NEAR_LIMIT_THRESHOLD;

    const fetchLimits = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch subscription
            const { data: subscription } = await supabase
                .from("subscriptions")
                .select("plan_id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .single();

            const planId = (subscription?.plan_id as "free" | "basic" | "premium") || "free";
            setCurrentPlan(planId);

            // Get current month's project count
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

            const { count: projectsCount } = await supabase
                .from("projects")
                .select("id", { count: 'exact' })
                .eq("user_id", user.id)
                .gte("created_at", startOfMonth)
                .lte("created_at", endOfMonth);

            setGenerationsUsed(projectsCount || 0);
        } catch (error) {
            console.error("Error fetching generation limits:", error);
        }
    }, []);

    const checkAndShowWarning = useCallback(() => {
        if (!isNearLimit && !isAtLimit) return;

        const lastWarningTime = localStorage.getItem(LAST_WARNING_KEY);
        const now = Date.now();

        // Always show if at limit, or if 5 minutes have passed since last warning
        if (isAtLimit || !lastWarningTime || now - parseInt(lastWarningTime) >= WARNING_INTERVAL_MS) {
            setShowWarning(true);
            localStorage.setItem(LAST_WARNING_KEY, now.toString());
        }
    }, [isAtLimit, isNearLimit]);

    // Periodic check every 5 minutes
    useEffect(() => {
        if (!isNearLimit && !isAtLimit) return;

        const intervalId = setInterval(() => {
            checkAndShowWarning();
        }, WARNING_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [isNearLimit, isAtLimit, checkAndShowWarning]);

    // Initial fetch
    useEffect(() => {
        fetchLimits();
    }, [fetchLimits]);

    return {
        generationsUsed,
        generationsLimit,
        currentPlan,
        isAtLimit,
        isNearLimit,
        showWarning,
        setShowWarning,
        checkAndShowWarning,
        fetchLimits,
    };
};
