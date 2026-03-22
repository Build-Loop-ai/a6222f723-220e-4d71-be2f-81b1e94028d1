import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "@/components/embed/ChatWidget";

const DEFAULTS = {
  accentColor: "#0d9488",
  welcomeMessage: "Hi! How can I help you today?",
  placeholderText: "Type your message...",
  widgetTitle: "Chat with us",
  avatarUrl: null as string | null,
  voiceEnabled: false,
  position: "bottom-right" as "bottom-right" | "bottom-left",
};

/**
 * Iframe-embeddable widget page.
 * Usage: /widget?key=YOUR_WIDGET_API_KEY
 */
export default function WidgetEmbed() {
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get("key") || "";
  const [config, setConfig] = useState<typeof DEFAULTS | null>(null);
  const [voiceConfig, setVoiceConfig] = useState<{ vapiPublicKey?: string; vapiAssistantId?: string }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError("Missing widget key");
      return;
    }

    const fetchConfig = async () => {
      // Fetch visual config + voice config in parallel
      const [configRes, voiceRes] = await Promise.allSettled([
        supabase.functions.invoke("get-widget-config", {
          headers: { "x-widget-key": apiKey },
        }),
        supabase.functions.invoke("get-widget-voice-config", {
          headers: { "x-widget-key": apiKey },
        }),
      ]);

      // Visual config
      if (configRes.status === "fulfilled" && configRes.value.data && !configRes.value.error) {
        const d = configRes.value.data;
        setConfig({
          accentColor: d.accentColor || DEFAULTS.accentColor,
          welcomeMessage: d.welcomeMessage || DEFAULTS.welcomeMessage,
          placeholderText: d.placeholderText || DEFAULTS.placeholderText,
          widgetTitle: d.widgetTitle || DEFAULTS.widgetTitle,
          avatarUrl: d.avatarUrl ?? null,
          voiceEnabled: d.voiceEnabled ?? false,
          position: d.position === "bottom-left" ? "bottom-left" : "bottom-right",
        });
      } else {
        setConfig(DEFAULTS);
      }

      // Voice config
      if (voiceRes.status === "fulfilled" && voiceRes.value.data) {
        const v = voiceRes.value.data;
        setVoiceConfig({
          vapiPublicKey: v.vapiPublicKey ?? undefined,
          vapiAssistantId: v.vapiAssistantId ?? undefined,
        });
      }
    };

    fetchConfig();
  }, [apiKey]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen" style={{ background: "transparent" }}>
      <ChatWidget
        apiKey={apiKey}
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        {...config}
        vapiPublicKey={voiceConfig.vapiPublicKey}
        vapiAssistantId={voiceConfig.vapiAssistantId}
        embedded
      />
    </div>
  );
}
