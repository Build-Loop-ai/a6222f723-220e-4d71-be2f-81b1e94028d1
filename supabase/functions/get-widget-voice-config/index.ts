import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-widget-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const widgetKey = req.headers.get("x-widget-key");
  if (!widgetKey) {
    return new Response(
      JSON.stringify({ error: "Widget key required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up widget config -> org -> org settings
  const { data: widget, error: wErr } = await supabaseAdmin
    .from("widget_configs")
    .select("organization_id, voice_call_enabled")
    .eq("api_key", widgetKey)
    .single();

  if (wErr || !widget) {
    return new Response(
      JSON.stringify({ error: "Invalid widget key" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!widget.voice_call_enabled) {
    return new Response(
      JSON.stringify({ vapiPublicKey: null, vapiAssistantId: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get assistant ID from org settings
  const { data: settings } = await supabaseAdmin
    .from("organization_settings")
    .select("vapi_assistant_id")
    .eq("organization_id", widget.organization_id)
    .single();

  const vapiPublicKey = Deno.env.get("VAPI_PUBLIC_KEY") || null;
  const vapiAssistantId = settings?.vapi_assistant_id || null;

  return new Response(
    JSON.stringify({ vapiPublicKey, vapiAssistantId }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    }
  );
});
