import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-widget-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, visitorId, pageUrl } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate via widget API key (passed as header or in body)
    const widgetKey =
      req.headers.get("x-widget-key") ||
      (await req.json().catch(() => ({}))).widgetKey;

    // Re-parse body since we already consumed it
    // Actually we already parsed it above, let's use a different approach
    const apiKeyHeader = req.headers.get("x-widget-key");

    if (!apiKeyHeader) {
      return new Response(
        JSON.stringify({ error: "Widget API key required (x-widget-key header)" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate widget key and get org config
    const { data: widgetConfig, error: configError } = await supabaseAdmin
      .from("widget_configs")
      .select("*, organizations(name, website, description, special_instructions)")
      .eq("api_key", apiKeyHeader)
      .single();

    if (configError || !widgetConfig) {
      return new Response(
        JSON.stringify({ error: "Invalid widget key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orgId = widgetConfig.organization_id;

    // Get or create conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const { data: conv, error: convError } = await supabaseAdmin
        .from("conversations")
        .insert({
          organization_id: orgId,
          visitor_id: visitorId || crypto.randomUUID(),
          channel: "text",
          status: "active",
          page_url: pageUrl || null,
        })
        .select("id")
        .single();

      if (convError) {
        console.error("Failed to create conversation:", convError);
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      activeConversationId = conv.id;
    }

    // Store user message
    await supabaseAdmin.from("chat_messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: message,
    });

    // Get conversation history
    const { data: history } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Search site_pages for relevant content
    const { data: sitePages } = await supabaseAdmin
      .from("site_pages")
      .select("url, title, summary, content_markdown")
      .eq("organization_id", orgId);

    // Simple keyword search to find relevant pages
    const searchTerms = message
      .toLowerCase()
      .split(/\s+/)
      .filter((t: string) => t.length > 3);

    let relevantPages =
      sitePages
        ?.map((page: any) => {
          const text =
            `${page.title} ${page.summary} ${page.content_markdown}`.toLowerCase();
          const score = searchTerms.reduce(
            (s: number, term: string) => s + (text.includes(term) ? 1 : 0),
            0
          );
          return { ...page, score };
        })
        .filter((p: any) => p.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5) || [];

    // If no keyword matches, include top pages by summary
    if (relevantPages.length === 0 && sitePages) {
      relevantPages = sitePages.slice(0, 3).map((p: any) => ({ ...p, score: 0 }));
    }

    // Build context for AI
    const org = (widgetConfig as any).organizations;
    const pageContext = relevantPages
      .map(
        (p: any) =>
          `Page: ${p.title}\nURL: ${p.url}\nSummary: ${p.summary || "No summary"}\nContent preview: ${(p.content_markdown || "").substring(0, 1000)}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `You are a helpful AI assistant for ${org?.name || "this business"}. ${org?.description || ""}

Your job is to help website visitors find what they need. You have access to the website's page content below.

IMPORTANT RULES:
- Answer based on the website content provided. If you don't have the info, say so politely.
- When relevant, suggest a specific page URL the visitor should visit. Include it naturally in your response.
- Keep responses concise and friendly (2-4 sentences max unless more detail is needed).
- If the visitor's question relates to a specific page, include the URL.
${org?.special_instructions ? `- Business-specific instructions: ${org.special_instructions}` : ""}

AVAILABLE WEBSITE PAGES:
${pageContext || "No pages crawled yet. Help the visitor as best you can."}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    // Stream response from Lovable AI
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
          messages,
          stream: true,
        }),
      }
    );

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
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

    // Create a TransformStream to capture the full response for DB storage
    let fullResponse = "";
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        // Decode to capture full response
        const text = new TextDecoder().decode(chunk);
        // Extract content from SSE chunks
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullResponse += content;
          } catch {
            // ignore
          }
        }
        controller.enqueue(chunk);
      },
      async flush() {
        // Store assistant message after stream completes
        if (fullResponse) {
          // Extract suggested URL from response
          const urlMatch = fullResponse.match(/https?:\/\/[^\s)>]+/);
          try {
            await supabaseAdmin.from("chat_messages").insert({
              conversation_id: activeConversationId,
              role: "assistant",
              content: fullResponse,
              suggested_url: urlMatch ? urlMatch[0] : null,
            });
          } catch (err) {
            console.error("Failed to save assistant message:", err);
          }
        }
      },
    });

    // Pipe AI response through our transform
    aiRes.body?.pipeTo(writable);

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": activeConversationId,
      },
    });
  } catch (error) {
    console.error("widget-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
