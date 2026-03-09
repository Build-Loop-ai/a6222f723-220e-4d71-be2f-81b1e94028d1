import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-widget-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STOP_WORDS = new Set([
  "the", "is", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "it", "its", "this", "that", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "can", "what", "how",
  "when", "where", "who", "which", "why", "not", "no", "yes", "all", "any",
  "each", "every", "some", "such", "than", "too", "very", "just", "about",
  "into", "over", "after", "before", "between", "under", "again", "then",
  "here", "there", "if", "so", "up", "out", "more", "also", "your", "my",
  "me", "i", "you", "we", "they", "he", "she", "them", "our", "us",
]);

function extractSearchTerms(message: string): { unigrams: string[]; bigrams: string[] } {
  const words = message.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const unigrams = words.filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) || !STOP_WORDS.has(words[i + 1])) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
  }
  return { unigrams, bigrams };
}

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(term, pos)) !== -1) {
    count++;
    pos += term.length;
  }
  return count;
}

function scorePage(page: any, unigrams: string[], bigrams: string[]): number {
  const title = (page.title || "").toLowerCase();
  const summary = (page.summary || "").toLowerCase();
  const body = (page.content_markdown || "").toLowerCase();
  let score = 0;

  for (const term of unigrams) {
    score += countOccurrences(title, term) * 3;
    score += countOccurrences(summary, term) * 2;
    score += countOccurrences(body, term);
  }
  for (const bg of bigrams) {
    score += countOccurrences(title, bg) * 5;
    score += countOccurrences(summary, bg) * 3;
    score += countOccurrences(body, bg) * 2;
  }
  return score;
}

function formatBusinessHours(hours: any): string {
  if (!hours || Object.keys(hours).length === 0) return "";
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days
    .map((day) => {
      const h = hours[day] || hours[day.toLowerCase()];
      if (!h || !h.isOpen) return `${day}: Closed`;
      return `${day}: ${h.open} - ${h.close}`;
    })
    .join("\n");
}

function formatServices(services: any): string {
  if (!services || !Array.isArray(services) || services.length === 0) return "";
  return services
    .map((s: any) => {
      let line = `- ${s.name}`;
      if (s.duration) line += ` (${s.duration} min)`;
      if (s.description) line += `: ${s.description}`;
      return line;
    })
    .join("\n");
}

// Simple in-memory rate limiter (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, visitorId, pageUrl } = await req.json();

    // Rate limit by visitor ID and IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = visitorId || clientIp;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please wait a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Fetch business context in parallel with conversation setup
    const [settingsResult, sitePagesResult] = await Promise.all([
      supabaseAdmin
        .from("organization_settings")
        .select("business_hours, services, extracted_business_data")
        .eq("organization_id", orgId)
        .single(),
      supabaseAdmin
        .from("site_pages")
        .select("url, title, summary, content_markdown")
        .eq("organization_id", orgId)
        .limit(100),
    ]);

    const orgSettings = settingsResult.data;
    const sitePages = sitePagesResult.data;

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

    // Improved search: weighted scoring with bigrams
    const { unigrams, bigrams } = extractSearchTerms(message);

    let relevantPages: any[] = [];
    if (sitePages && sitePages.length > 0) {
      relevantPages = sitePages
        .map((page: any) => ({ ...page, score: scorePage(page, unigrams, bigrams) }))
        .filter((p: any) => p.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 8);

      // Fallback: include top pages if no keyword matches
      if (relevantPages.length === 0) {
        relevantPages = sitePages.slice(0, 5).map((p: any) => ({ ...p, score: 0 }));
      }
    }

    // Build context for AI
    const org = (widgetConfig as any).organizations;
    const pageContext = relevantPages
      .map(
        (p: any) =>
          `Page: ${p.title}\nURL: ${p.url}\nSummary: ${p.summary || "No summary"}\nContent:\n${(p.content_markdown || "").substring(0, 3000)}`
      )
      .join("\n\n---\n\n");

    // Build structured business context
    let businessContext = "";
    if (orgSettings) {
      const hours = formatBusinessHours(orgSettings.business_hours);
      if (hours) businessContext += `\nBUSINESS HOURS:\n${hours}\n`;

      const services = formatServices(orgSettings.services as any);
      if (services) businessContext += `\nSERVICES OFFERED:\n${services}\n`;

      const extracted = orgSettings.extracted_business_data as any;
      if (extracted) {
        if (extracted.phone) businessContext += `\nPhone: ${extracted.phone}`;
        if (extracted.address) {
          const addr = extracted.address;
          const parts = [addr.street, addr.city, addr.postal_code].filter(Boolean);
          if (parts.length) businessContext += `\nAddress: ${parts.join(", ")}`;
        }
      }
    }

    const systemPrompt = `You are a helpful AI assistant for ${org?.name || "this business"}. ${org?.description || ""}

Your job is to help website visitors by answering their questions accurately and in detail using the information below.

IMPORTANT RULES:
- Answer based on the business information and website content provided. Give specific, detailed answers — don't just point to a URL.
- When relevant, mention the specific page URL the visitor can visit for more details.
- Keep responses concise and friendly (2-4 sentences unless more detail is genuinely needed).
- For greetings, thanks, and small talk, respond naturally and warmly.
- If asked about hours, services, pricing, or contact info, use the structured data below for an immediate, accurate answer.
- If you truly don't have the information, say so politely and suggest contacting the business directly.
${org?.special_instructions ? `- Business-specific instructions: ${org.special_instructions}` : ""}
${businessContext ? `\nBUSINESS DETAILS:${businessContext}` : ""}

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

    // Stream response from AI
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

    // Stream and capture response
    let fullResponse = "";
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
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
      async flush(controller) {
        // Fallback: if streaming returned empty, retry non-streaming
        if (!fullResponse.trim()) {
          console.warn("Streaming returned empty response, retrying non-streaming...");
          try {
            const retryRes = await fetch(
              "https://ai.gateway.lovable.dev/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages,
                  stream: false,
                }),
              }
            );
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              const retryContent = retryData.choices?.[0]?.message?.content;
              if (retryContent) {
                fullResponse = retryContent;
                // Emit as SSE so the client receives it
                const sseChunk = `data: ${JSON.stringify({ choices: [{ delta: { content: retryContent } }] })}\n\ndata: [DONE]\n\n`;
                controller.enqueue(new TextEncoder().encode(sseChunk));
              }
            }
          } catch (retryErr) {
            console.error("Non-streaming fallback failed:", retryErr);
          }
        }

        if (fullResponse) {
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
