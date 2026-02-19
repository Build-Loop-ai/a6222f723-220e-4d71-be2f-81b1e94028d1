import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatWidget } from "@/components/embed/ChatWidget";

/**
 * Iframe-embeddable widget page.
 * Usage: /widget?key=YOUR_WIDGET_API_KEY
 */
export default function WidgetEmbed() {
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get("key") || "";
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError("Missing widget key");
      return;
    }

    // Fetch config from edge function (via the widget-chat endpoint we validate key there)
    // For iframe mode, we just use defaults + the key. Config could also be fetched separately.
    // For now, use sensible defaults since the widget-chat function validates the key.
    setConfig({
      accentColor: "#0d9488",
      welcomeMessage: "Hi! How can I help you today?",
      placeholderText: "Type your message...",
      widgetTitle: "Chat with us",
      avatarUrl: null,
      voiceEnabled: false,
      position: "bottom-right" as const,
    });
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
      />
    </div>
  );
}
