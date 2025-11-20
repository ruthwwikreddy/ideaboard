import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define plan limits
const PLAN_LIMITS: { [key: string]: number } = {
  "free": 5,
  "basic": 5, // 50rs/month
  "premium": 10, // 75rs/month
};

// Helper function to get the limit for a given plan
function getPlanLimit(planId: string | null): number {
  return planId && PLAN_LIMITS[planId] !== undefined ? PLAN_LIMITS[planId] : PLAN_LIMITS["free"];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea) {
      throw new Error("Idea is required");
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      throw new Error("Authorization header is missing.");
    }
    const supabaseAccessToken = authorization.split(" ")[1];
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${supabaseAccessToken}` } },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated.");
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("generation_count, last_generation_reset")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found.");
    }

    // Fetch user subscription
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    let userPlanId: string | null = null;
    if (subscription && !subscriptionError) {
      userPlanId = subscription.plan_id;
    }

    const currentGenerationLimit = getPlanLimit(userPlanId);

    let { generation_count, last_generation_reset } = profile;
    const now = new Date();
    const lastResetDate = new Date(last_generation_reset);

    // Check if a new month has started or if the user downgraded their plan and exceeded new limit
    if (
      now.getMonth() !== lastResetDate.getMonth() ||
      now.getFullYear() !== lastResetDate.getFullYear() ||
      generation_count > currentGenerationLimit // If plan downgraded and already exceeded, reset
    ) {
      generation_count = 0;
      last_generation_reset = now.toISOString();
    }

    // Enforce generation limit
    if (generation_count >= currentGenerationLimit) {
      return new Response(
        JSON.stringify({ error: `You have reached your limit of ${currentGenerationLimit} idea generations per month. Please upgrade your plan.` }),
        {
          status: 403, // Forbidden
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Analyzing idea:", idea);

    const systemPrompt = `You are an expert business analyst and market researcher. Analyze the provided app idea and return a structured JSON response with the following fields:

- problem: A clear 2-3 sentence description of the core problem this app solves
- audience: Describe the target audience in 2-3 sentences (demographics, behaviors, pain points)
- competitors: An array of 3-5 existing competitors or similar solutions
- marketGaps: An array of 3-4 specific market gaps or opportunities this app could fill
- monetization: An array of 3-4 potential monetization strategies
- demandProbability: A number between 0-100 representing the likelihood of real market demand

Be specific, actionable, and realistic. Focus on what makes this idea unique and viable.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this app idea: ${idea}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    const research = JSON.parse(content);

    // Increment generation count and update reset timestamp
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        generation_count: generation_count + 1,
        last_generation_reset: last_generation_reset,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating generation count:", updateError);
      throw new Error("Failed to update generation count.");
    }

    return new Response(JSON.stringify(research), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in analyze-idea:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
