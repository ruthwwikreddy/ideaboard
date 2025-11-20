import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, research, platform } = await req.json();

    if (!idea || !research || !platform) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating build plan for platform:", platform);

    const systemPrompt = `You are an expert product manager and technical architect. Based on the app idea and research data, create a structured multi-phase build plan optimized for ${platform}.

Return a JSON response with:
- summary: A 2-3 sentence overview of what the app will do
- features: An array of 5-7 core features for the MVP
- phases: An array of 2-3 build phases, each containing:
  - phase: Phase number (0, 1, 2)
  - title: Phase name (e.g., "Phase 1: Core Features")
  - features: Array of 2-3 features to build in this phase
  - prompt: A detailed, copy-paste ready prompt for ${platform} that includes:
    * What to build in this phase
    * Technical requirements
    * UI/UX guidelines
    * Any specific platform best practices

Make the prompts specific, actionable, and optimized for ${platform}. Each prompt should be self-contained and ready to paste directly into the builder.`;

    const userPrompt = `
App Idea: ${idea}

Research Data:
- Problem: ${research.problem}
- Audience: ${research.audience}
- Market Gaps: ${research.marketGaps.join(", ")}
- Monetization: ${research.monetization.join(", ")}

Create a ${platform}-optimized build plan with detailed prompts for each phase.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
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
    console.log("Build plan generated");

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    const buildPlan = JSON.parse(content);

    return new Response(JSON.stringify(buildPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-build-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
