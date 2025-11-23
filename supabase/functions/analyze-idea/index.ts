import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define plan limits
const PLAN_LIMITS: { [key: string]: number } = {
  "free": 1,
  "basic": 5, // 50rs/month
  "premium": 10, // 75rs/month
};

// Helper function to get the limit for a given plan
function getPlanLimit(planId: string | null): number {
  return planId && PLAN_LIMITS[planId] !== undefined ? PLAN_LIMITS[planId] : PLAN_LIMITS["free"];
}

const basicPrompt = `You are a business analyst. Analyze the provided app idea and return a structured JSON response with the following fields:
- name: A catchy, one-word name for the app. It can be a compound word or a creative blend of words. For example, for an app that helps plan development projects, the name could be 'devplan' or 'ideaboard'. The name must be a single word and lowercase.
- problem: A clear 1-2 sentence description of the core problem this app solves.
- audience: Describe the target audience in 1-2 sentences.
- monetization: An array of 2 potential monetization strategies.
- demandProbability: A number between 0-100 representing the likelihood of real market demand.`;

const standardPrompt = `You are an expert business analyst and market researcher. Analyze the provided app idea and return a structured JSON response with the following fields:
- name: A catchy, one-word name for the app. It can be a compound word or a creative blend of words. For example, for an app that helps plan development projects, the name could be 'devplan' or 'ideaboard'. The name must be a single word and lowercase.
- problem: A clear 2-3 sentence description of the core problem this app solves
- audience: Describe the target audience in 2-3 sentences (demographics, behaviors, pain points)
- competitors: An array of 3-5 existing competitors or similar solutions
- marketGaps: An array of 3-4 specific market gaps or opportunities this app could fill
- monetization: An array of 3-4 potential monetization strategies
- demandProbability: A number between 0-100 representing the likelihood of real market demand

Be specific, actionable, and realistic. Focus on what makes this idea unique and viable.`;

const advancedPrompt = `You are a world-class business strategist and market analyst. Provide a comprehensive analysis of the app idea, returning a structured JSON response with these fields:
- name: A catchy, one-word name for the app. It can be a compound word or a creative blend of words. For example, for an app that helps plan development projects, the name could be 'devplan' or 'ideaboard'. The name must be a single word and lowercase.
- problem: In-depth 3-4 sentence analysis of the core problem, including its nuances and importance.
- audience: Detailed target audience persona (demographics, psychographics, behaviors, specific pain points, and motivations).
- competitors: A detailed analysis of 5-7 competitors, including their strengths, weaknesses, and market share.
- marketGaps: An array of 4-5 specific and less obvious market gaps or unique value propositions.
- monetization: A detailed list of 4-5 potential monetization strategies, including pros and cons for each.
- demandProbability: A number between 0-100 representing the likelihood of real market demand.
- potentialRisks: An array of 3-4 potential business or market risks.
- marketingStrategies: An array of 3-4 innovative marketing strategies to reach the target audience.`;

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

    const tokenParts = authorization.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new Error("Invalid Authorization header format. Expected 'Bearer <token>'.");
    }
    const supabaseAccessToken = tokenParts[1];

    if (!supabaseAccessToken) {
      throw new Error("Supabase access token is missing.");
    }
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${supabaseAccessToken}` } },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("User authentication error:", userError);
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

    let userPlanId: string | null = "free";
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

    console.log("Analyzing idea for plan:", userPlanId, "Idea:", idea);

    let systemPrompt;
    switch (userPlanId) {
      case "premium":
        systemPrompt = advancedPrompt;
        break;
      case "basic":
        systemPrompt = standardPrompt;
        break;
      default:
        systemPrompt = basicPrompt;
        break;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
