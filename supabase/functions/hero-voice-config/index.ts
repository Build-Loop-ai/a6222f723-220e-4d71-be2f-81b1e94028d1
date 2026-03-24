import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const vapiPublicKey = Deno.env.get("VAPI_PUBLIC_KEY") || null;
  if (!vapiPublicKey) {
    return new Response(
      JSON.stringify({ error: "Voice not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find a demo assistant ID from the first org that has one configured
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: settings } = await supabaseAdmin
    .from("organization_settings")
    .select("vapi_assistant_id")
    .not("vapi_assistant_id", "is", null)
    .limit(1)
    .single();

  const vapiAssistantId = settings?.vapi_assistant_id || null;

  return new Response(
    JSON.stringify({ vapiPublicKey, vapiAssistantId }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    }
  );
});
