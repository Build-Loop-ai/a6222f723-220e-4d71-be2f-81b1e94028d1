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

  const { data: widget, error } = await supabaseAdmin
    .from("widget_configs")
    .select("accent_color, welcome_message, placeholder_text, widget_title, avatar_url, voice_enabled, voice_call_enabled, position")
    .eq("api_key", widgetKey)
    .single();

  if (error || !widget) {
    return new Response(
      JSON.stringify({ error: "Invalid widget key" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      accentColor: widget.accent_color,
      welcomeMessage: widget.welcome_message,
      placeholderText: widget.placeholder_text,
      widgetTitle: widget.widget_title,
      avatarUrl: widget.avatar_url,
      voiceEnabled: widget.voice_enabled,
      voiceCallEnabled: widget.voice_call_enabled,
      position: widget.position,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    }
  );
});
