import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, AlertTriangle, Rocket, Copy, RefreshCw,
  Database, Sparkles, PartyPopper,
} from "lucide-react";

interface Integration {
  name: string;
  configured: boolean;
  connected: boolean | null;
  error: string | null;
  secrets: string[];
}

interface HealthResponse {
  success: boolean;
  integrations: Integration[];
}

// What each optional integration unlocks, in buyer language (Greet-specific).
const UNLOCKS: Record<string, string> = {
  "Vapi (Voice AI)": "Live voice calls inside the widget",
  "Firecrawl (Website Crawling)": "Auto-learn answers from your website",
  "Stripe (Payments)": "Charge clients and take payments",
  "Resend (Email)": "Email notifications and lead alerts",
  "Google (Calendar)": "Let the AI book into your calendar",
};

function StatusDot({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
    : <XCircle className="h-5 w-5 text-muted-foreground/50 shrink-0" />;
}

export function LaunchChecklist() {
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);

  const run = async () => {
    setLoading(true);
    setDbError(null);

    // 1. Database probe — if a core table errors, migrations aren't applied
    //    or the (free-tier) Supabase project is paused.
    const { data, error } = await supabase
      .from("widget_configs")
      .select("id")
      .limit(1);

    if (error) {
      setDbReady(false);
      setDbError(error.message);
      setWidgetId(null);
    } else {
      setDbReady(true);
      setWidgetId(data?.[0]?.id ?? null);
    }

    // 2. Integration / secret status (best-effort — never blocks the page)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-check`,
        { headers: { Authorization: `Bearer ${session?.access_token ?? ""}` } },
      );
      if (res.ok) {
        const json: HealthResponse = await res.json();
        setIntegrations(json.integrations ?? []);
      }
    } catch {
      // health-check unreachable — leave integrations null, core checks still render
    }

    setLoading(false);
  };

  useEffect(() => { run(); }, []);

  const isLive = dbReady === true && !!widgetId;
  const embedSnippet = widgetId
    ? `<script src="${window.location.origin}/widget/${widgetId}"></script>`
    : "";

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    toast.success("Embed code copied");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero status */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${
        isLive ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isLive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {isLive ? <PartyPopper className="h-6 w-6" /> : <Rocket className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">
              {isLive ? "You're live" : "Let's get you live"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLive
                ? "Your widget is ready to embed. Add-ons below unlock extra features."
                : "Two quick checks stand between you and a working widget."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={run} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Re-check
          </Button>
        </div>
      </div>

      {/* Core steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required to go live</CardTitle>
          <CardDescription>These two make your widget work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* DB */}
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <StatusDot ok={dbReady === true} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <Database className="h-4 w-4 text-muted-foreground" /> Database connected
              </div>
              {dbReady === true ? (
                <p className="text-sm text-muted-foreground mt-0.5">Your tables are set up and reachable.</p>
              ) : (
                <p className="text-sm text-destructive mt-0.5">
                  Can't reach your database. Apply the migrations in <code className="font-mono">supabase/migrations</code>,
                  and if this is a free Supabase project, make sure it isn't paused.
                  {dbError && <span className="block text-xs text-muted-foreground mt-1">({dbError})</span>}
                </p>
              )}
            </div>
          </div>

          {/* Widget config */}
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <StatusDot ok={!!widgetId} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-muted-foreground" /> Widget configured
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {widgetId
                  ? "Your widget is set up. Customise it any time in the Widget builder."
                  : "Finish onboarding (or open the Widget builder) to create your widget."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Embed — only when live */}
      {isLive && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Embed on your site</CardTitle>
            <CardDescription>Paste this before <code className="font-mono">&lt;/body&gt;</code> on any page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
              <code className="flex-1 truncate text-xs font-mono">{embedSnippet}</code>
              <Button size="sm" variant="outline" onClick={copyEmbed} className="gap-1.5 shrink-0">
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Free-tier warning */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900">Putting this in front of a paying client?</p>
          <p className="text-amber-800 mt-0.5">
            Free Supabase projects pause after about a week of inactivity — your widget goes dark until it's woken.
            For anything client-facing, use a paid Supabase project so it never sleeps.
          </p>
        </div>
      </div>

      {/* Optional add-ons */}
      {integrations && integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unlock more (optional)</CardTitle>
            <CardDescription>
              Add a key in <span className="font-medium text-foreground">Settings → Backend → Secrets</span> to switch each on.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map((it) => {
              const ok = it.configured && it.connected !== false;
              return (
                <div key={it.name} className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <StatusDot ok={ok} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{it.name}</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {UNLOCKS[it.name] ?? "Optional integration"}
                    </p>
                    {it.configured && it.connected === false && (
                      <p className="text-xs text-amber-700 mt-1">
                        Key is set but the connection failed{it.error ? `: ${it.error}` : "."} Double-check the value.
                      </p>
                    )}
                    {!it.configured && (
                      <p className="text-xs text-muted-foreground/80 mt-1 font-mono">
                        Needs: {it.secrets.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LaunchChecklist;
