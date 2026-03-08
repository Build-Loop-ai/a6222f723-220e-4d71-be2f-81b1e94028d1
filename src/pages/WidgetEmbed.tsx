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
  position: "bottom-right" as const,
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

    // Fetch real widget config from edge function that validates the key
    const fetchConfig = async () => {
      try {
        // Use the get-widget-voice-config edge function which already validates the key
        const { data: voiceData } = await supabase.functions.invoke("get-widget-voice-config", {
          headers: { "x-widget-key": apiKey },
        });
        if (voiceData) {
          setVoiceConfig({
            vapiPublicKey: voiceData.vapiPublicKey ?? undefined,
            vapiAssistantId: voiceData.vapiAssistantId ?? undefined,
          });
        }
      } catch {
        // Voice config is optional, fall through
      }

      // For the visual config, we'd need a public endpoint or anon access.
      // widget_configs requires org membership to SELECT, so use defaults for now.
      // The widget-chat function validates the key at message time.
      setConfig(DEFAULTS);
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
    <div className="h-screen w-screen overflow-hidden">
      <ChatWidget
        apiKey={apiKey}
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        {...config}
        vapiPublicKey={voiceConfig.vapiPublicKey}
        vapiAssistantId={voiceConfig.vapiAssistantId}
      />
    </div>
  );
}
