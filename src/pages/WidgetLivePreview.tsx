import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ExternalLink, ArrowLeft, Loader2, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetConfigData {
  accent_color: string;
  welcome_message: string;
  placeholder_text: string;
  widget_title: string;
  avatar_url: string | null;
  voice_enabled: boolean;
  position: string;
  api_key: string;
  font_family: string;
  border_radius: string;
  header_text_color: string;
  header_subtitle: string;
  bot_name: string;
  bot_message_bg: string;
  bot_message_text_color: string;
  user_message_text_color: string;
  chat_bg_color: string;
  input_bg_color: string;
  input_text_color: string;
  input_border_color: string;
  show_branding: boolean;
}

export default function WidgetLivePreview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<WidgetConfigData | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      const [{ data: widgetConfig }, { data: org }] = await Promise.all([
        supabase
          .from("widget_configs")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .maybeSingle(),
        supabase
          .from("organizations")
          .select("website")
          .eq("id", profile.organization_id)
          .maybeSingle(),
      ]);

      if (widgetConfig) setConfig(widgetConfig);
      if (org?.website) {
        let url = org.website;
        if (!url.startsWith("http")) url = "https://" + url;
        setWebsite(url);
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          <span className="text-sm text-white/40">Loading preview…</span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Widget Configured</h2>
          <p className="text-sm text-white/50 mb-6">Set up your widget in the dashboard settings first.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard/settings")}>
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const widgetScriptUrl = `${supabaseUrl}/functions/v1/widget-loader?key=${config.api_key}`;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Top bar */}
      <div className="h-12 shrink-0 flex items-center justify-between px-4 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 gap-2 h-8"
            onClick={() => navigate("/dashboard/settings")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-white/40" />
            <span className="text-xs text-white/50 font-mono truncate max-w-[300px]">
              {website || "No website configured"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 rounded-full px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium">Widget Active</span>
          </div>
          {website && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 gap-2 h-8"
              onClick={() => window.open(website, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Site
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Simulated website — most real sites block iframe embedding */}
        <div className="absolute inset-0 bg-white overflow-auto">
            <div className="max-w-5xl mx-auto px-8 py-12">
              {/* Fake nav */}
              <div className="flex items-center justify-between mb-16">
                <div className="h-8 w-32 rounded-lg bg-gray-200" />
                <div className="flex gap-6">
                  <div className="h-4 w-16 rounded bg-gray-150" />
                  <div className="h-4 w-16 rounded bg-gray-150" />
                  <div className="h-4 w-16 rounded bg-gray-150" />
                  <div className="h-8 w-24 rounded-full bg-gray-200" />
                </div>
              </div>
              {/* Hero */}
              <div className="text-center mb-16">
                <div className="h-12 w-2/3 rounded-xl bg-gray-100 mx-auto mb-4" />
                <div className="h-5 w-1/2 rounded bg-gray-100 mx-auto mb-3" />
                <div className="h-5 w-1/3 rounded bg-gray-100 mx-auto mb-8" />
                <div className="h-10 w-40 rounded-full bg-gray-200 mx-auto" />
              </div>
              {/* Feature cards */}
              <div className="grid grid-cols-3 gap-6 mb-16">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 p-6">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 mb-4" />
                    <div className="h-5 w-2/3 rounded bg-gray-100 mb-3" />
                    <div className="h-3 w-full rounded bg-gray-50 mb-2" />
                    <div className="h-3 w-5/6 rounded bg-gray-50 mb-2" />
                    <div className="h-3 w-3/4 rounded bg-gray-50" />
                  </div>
                ))}
              </div>
              {/* Content section */}
              <div className="flex gap-12 mb-16">
                <div className="flex-1">
                  <div className="h-64 w-full rounded-2xl bg-gray-100" />
                </div>
                <div className="flex-1 space-y-4 pt-8">
                  <div className="h-8 w-3/4 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-50" />
                  <div className="h-4 w-5/6 rounded bg-gray-50" />
                  <div className="h-4 w-4/5 rounded bg-gray-50" />
                  <div className="h-10 w-32 rounded-full bg-gray-200 mt-4" />
                </div>
              </div>
              {/* Testimonials */}
              <div className="grid grid-cols-2 gap-6 mb-16">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-gray-50 p-8">
                    <div className="h-3 w-full rounded bg-gray-100 mb-2" />
                    <div className="h-3 w-4/5 rounded bg-gray-100 mb-2" />
                    <div className="h-3 w-2/3 rounded bg-gray-100 mb-6" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div>
                        <div className="h-3 w-24 rounded bg-gray-200 mb-1" />
                        <div className="h-2 w-16 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="border-t border-gray-100 pt-12 pb-8">
                <div className="flex justify-between">
                  <div className="h-6 w-28 rounded bg-gray-100" />
                  <div className="flex gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-3 w-14 rounded bg-gray-100" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Widget script injection */}
        <WidgetScriptInjector scriptUrl={widgetScriptUrl} />
      </div>
    </div>
  );
}

/** Injects the widget-loader script into the page */
function WidgetScriptInjector({ scriptUrl }: { scriptUrl: string }) {
  useEffect(() => {
    // Clean up any previous widget
    const existingRoot = document.getElementById("__chat-widget-root");
    if (existingRoot) existingRoot.remove();
    (window as any).__chatWidgetLoaded = false;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      const root = document.getElementById("__chat-widget-root");
      if (root) root.remove();
      (window as any).__chatWidgetLoaded = false;
    };
  }, [scriptUrl]);

  return null;
}
