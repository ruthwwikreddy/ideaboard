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
- competitors: An array of 3-5 existing competitors or similar solutions, with their strengths, weaknesses, and market positioning.
- marketGaps: An array of 3-4 specific market gaps or opportunities this app could fill
- monetization: An array of 3-4 potential monetization strategies
- demandProbability: A number between 0-100 representing the likelihood of real market demand

Be specific, actionable, and realistic. Focus on what makes this idea unique and viable.`;

const advancedPrompt = `You are a world-class business strategist and market analyst. Provide a comprehensive analysis of the app idea, returning a structured JSON response with these fields:
- name: A catchy, one-word name for the app. It can be a compound word or a creative blend of words. For example, for an app that helps plan development projects, the name could be 'devplan' or 'ideaboard'. The name must be a single word and lowercase.
- problem: In-depth 3-4 sentence analysis of the core problem, including its nuances and importance.
- audience: Detailed target audience persona (demographics, psychographics, behaviors, specific pain points, and motivations).
- competitors: A detailed analysis of 5-7 competitors, including their strengths, weaknesses, market share, and market positioning.
- marketGaps: An array of 4-5 specific and less obvious market gaps or unique value propositions.
- monetization: A detailed list of 4-5 potential monetization strategies, including pros and cons for each.
- demandProbability: A number between 0-100 representing the likelihood of real market demand.
- potentialRisks: An array of 3-4 potential business or market risks.
- marketingStrategies: An array of 3-4 innovative marketing strategies to reach the target audience.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !openAiApiKey) {
      throw new Error("Missing environment variables");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Extract user ID from JWT token
    const token = authHeader.replace("Bearer ", "");
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.sub;

    if (!userId) {
      throw new Error("User ID not found in token");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    // Parse Request Body
    let idea;
    try {
      const body = await req.json();
      idea = body.idea;
    } catch {
      throw new Error("Invalid request body");
    }

    if (!idea) {
      throw new Error("Idea is required");
    }

    // Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      throw new Error("Profile not found");
    }

    // Fetch Subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const planId = subscription?.plan_id || "free";
    const limit = PLAN_LIMITS[planId] || PLAN_LIMITS["free"];

    // Check Limits
    let { generation_count, last_generation_reset } = profile;
    const now = new Date();
    const lastReset = new Date(last_generation_reset || 0);

    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
      generation_count = 0;
    }

    if (generation_count >= limit) {
      return new Response(
        JSON.stringify({ error: `Limit reached for ${planId} plan (${limit}/month). Upgrade for more.` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Select Prompt
    let systemPrompt = basicPrompt;
    if (planId === "premium") systemPrompt = advancedPrompt;
    else if (planId === "basic") systemPrompt = standardPrompt;

    console.log(`Analyzing idea for user ${userId} with plan ${planId}`);

    // Call OpenAI
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this app idea: ${idea}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!openAiResponse.ok) {
      const err = await openAiResponse.text();
      console.error("OpenAI Error:", err);
      throw new Error("Failed to analyze idea");
    }

    const aiData = await openAiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    if (!content) throw new Error("No analysis returned");

    const analysis = JSON.parse(content);

    // Update Usage
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        generation_count: isNewMonth ? 1 : generation_count + 1,
        last_generation_reset: isNewMonth ? now.toISOString() : last_generation_reset
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update usage:", updateError);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
