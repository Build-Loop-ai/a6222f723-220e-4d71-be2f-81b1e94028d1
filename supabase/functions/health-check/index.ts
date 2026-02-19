import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationStatus {
  name: string;
  configured: boolean;
  connected: boolean | null;
  error: string | null;
  secrets: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results: IntegrationStatus[] = [];

    // Check Vapi
    const vapiApiKey = Deno.env.get("VAPI_API_KEY");
    const vapiStatus: IntegrationStatus = {
      name: "Vapi (Voice AI)",
      configured: !!vapiApiKey,
      connected: null,
      error: null,
      secrets: ["VAPI_API_KEY", "VAPI_PUBLIC_KEY"],
    };
    
    if (vapiApiKey) {
      try {
        const res = await fetch("https://api.vapi.ai/assistant", {
          method: "GET",
          headers: { Authorization: `Bearer ${vapiApiKey}` },
        });
        vapiStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          vapiStatus.error = data.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        vapiStatus.connected = false;
        vapiStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    results.push(vapiStatus);

    // Check Firecrawl
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const firecrawlStatus: IntegrationStatus = {
      name: "Firecrawl (Website Crawling)",
      configured: !!firecrawlKey,
      connected: null,
      error: null,
      secrets: ["FIRECRAWL_API_KEY"],
    };
    results.push(firecrawlStatus);

    // Check Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhook = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeStatus: IntegrationStatus = {
      name: "Stripe (Payments)",
      configured: !!stripeKey,
      connected: null,
      error: null,
      secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    };
    
    if (stripeKey) {
      try {
        const res = await fetch("https://api.stripe.com/v1/customers?limit=1", {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        stripeStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          stripeStatus.error = data.error?.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        stripeStatus.connected = false;
        stripeStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    
    if (!stripeWebhook) {
      stripeStatus.error = (stripeStatus.error || "") + 
        " Warning: STRIPE_WEBHOOK_SECRET not configured.";
    }
    results.push(stripeStatus);

    // Check Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendStatus: IntegrationStatus = {
      name: "Resend (Email)",
      configured: !!resendKey,
      connected: null,
      error: null,
      secrets: ["RESEND_API_KEY"],
    };
    
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendKey}` },
        });
        resendStatus.connected = res.ok;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          resendStatus.error = data.message || `HTTP ${res.status}`;
        }
      } catch (e) {
        resendStatus.connected = false;
        resendStatus.error = e instanceof Error ? e.message : "Connection failed";
      }
    }
    results.push(resendStatus);

    // Check Google OAuth
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const googleStatus: IntegrationStatus = {
      name: "Google (Calendar)",
      configured: !!(googleClientId && googleClientSecret),
      connected: null,
      error: null,
      secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    };
    results.push(googleStatus);

    // Summary
    const configured = results.filter(r => r.configured).length;
    const connected = results.filter(r => r.connected === true).length;
    const total = results.length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          configured: `${configured}/${total}`,
          connected: `${connected}/${total}`,
          allConfigured: configured === total,
          allConnected: connected === total,
        },
        integrations: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Health check failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
