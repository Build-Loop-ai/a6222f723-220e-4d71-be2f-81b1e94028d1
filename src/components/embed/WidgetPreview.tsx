import { ChatWidget } from "./ChatWidget";

interface WidgetPreviewProps {
  apiKey: string;
  accentColor: string;
  position: "bottom-right" | "bottom-left";
  welcomeMessage: string;
  placeholderText: string;
  widgetTitle: string;
  avatarUrl?: string | null;
  voiceEnabled: boolean;
}

/**
 * In-dashboard preview of the widget.
 * Renders the widget inside a phone-like frame.
 */
export function WidgetPreview({
  apiKey,
  accentColor,
  position,
  welcomeMessage,
  placeholderText,
  widgetTitle,
  avatarUrl,
  voiceEnabled,
}: WidgetPreviewProps) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="relative mx-auto h-[600px] w-[400px] overflow-hidden rounded-3xl border-4 border-border bg-gray-50 shadow-xl">
      {/* Simulated browser bar */}
      <div className="flex h-8 items-center gap-1.5 bg-muted px-3">
        <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
        <div className="h-2.5 w-2.5 rounded-full bg-warning/40" />
        <div className="h-2.5 w-2.5 rounded-full bg-success/40" />
        <div className="ml-2 h-4 flex-1 rounded bg-background" />
      </div>
      {/* Page content placeholder */}
      <div className="relative h-[calc(100%-2rem)] overflow-hidden">
        <div className="space-y-4 p-6">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted/60" />
          <div className="h-4 w-5/6 rounded bg-muted/60" />
          <div className="h-32 w-full rounded-lg bg-muted/40" />
          <div className="h-4 w-full rounded bg-muted/60" />
          <div className="h-4 w-2/3 rounded bg-muted/60" />
        </div>
        {/* Render actual widget inside the preview frame */}
        <ChatWidget
          apiKey={apiKey}
          supabaseUrl={supabaseUrl}
          accentColor={accentColor}
          position={position}
          welcomeMessage={welcomeMessage}
          placeholderText={placeholderText}
          widgetTitle={widgetTitle}
          avatarUrl={avatarUrl}
          voiceEnabled={voiceEnabled}
        />
      </div>
    </div>
  );
}
