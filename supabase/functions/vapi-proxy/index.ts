import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

/**
 * This edge function acts as a transparent proxy to api.vapi.ai.
 * The Vapi Web SDK is configured with this function's URL as `apiBaseUrl`,
 * so it sends requests like POST /functions/v1/vapi-proxy/call/web.
 * We strip the function prefix and forward to https://api.vapi.ai/call/web.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract the sub-path after /vapi-proxy
    const url = new URL(req.url);
    const fullPath = url.pathname;
    const proxyPrefix = "/vapi-proxy";
    const idx = fullPath.indexOf(proxyPrefix);
    const vapiPath = idx !== -1
      ? fullPath.slice(idx + proxyPrefix.length) || "/"
      : fullPath;

    // Only allow known Vapi endpoints
    const allowedPrefixes = ["/call"];
    const isAllowed = allowedPrefixes.some((p) => vapiPath.startsWith(p));
    if (!isAllowed) {
      console.log(`[vapi-proxy] Blocked path: ${vapiPath}`);
      return new Response(
        JSON.stringify({ error: "Endpoint not allowed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUrl = `https://api.vapi.ai${vapiPath}${url.search}`;

    // Forward the request body if present
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const vapiKey = Deno.env.get("VAPI_PUBLIC_KEY") || "";
    if (!vapiKey) {
      return new Response(
        JSON.stringify({ error: "VAPI_PUBLIC_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resp = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${vapiKey}`,
      },
      body,
    });

    const data = await resp.text();

    return new Response(data, {
      status: resp.status,
      headers: {
        ...corsHeaders,
        "Content-Type": resp.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[vapi-proxy] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
