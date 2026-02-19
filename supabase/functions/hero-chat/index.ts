const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the AI assistant for Greet.ai — a platform that turns any website into an intelligent AI chat & voice assistant in under 5 minutes.

About Greet.ai:
- Paste your website URL → Greet crawls every page and learns your business
- Deploys an AI-powered chat widget visitors can talk to (text + voice)
- Answers questions about the business using real website content
- Smart page routing: suggests relevant pages to visitors
- Supports 22+ languages automatically
- 14-day free trial, setup in under 5 minutes
- Plans: Starter (€49/mo, 100 mins), Growth (€99/mo, 500 mins), Enterprise (custom)
- Works for dental clinics, medical practices, salons, restaurants, and more
- Features: Knowledge base from website crawling, voice AI, chat widget, Google Calendar integration, team management, analytics dashboard
- The widget is fully customizable (colors, position, welcome message, branding)

RULES:
- Keep responses concise and enthusiastic (2-3 sentences max)
- Be conversational and helpful — this is a live demo on the homepage
- If asked about pricing, features, or how it works, answer directly
- Encourage visitors to try the free trial
- You ARE the product demo — show how smart and helpful an AI assistant can be
- Respond in the same language the visitor uses`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit conversation length for demo
    const recentMessages = messages.slice(-10);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentMessages,
          ],
          stream: true,
        }),
      }
    );

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests, please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "Demo temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("hero-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
