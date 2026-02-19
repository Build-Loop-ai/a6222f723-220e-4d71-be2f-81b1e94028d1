import { useState } from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatPanel } from "./ChatPanel";

export interface ChatWidgetProps {
  apiKey: string;
  supabaseUrl: string;
  accentColor?: string;
  position?: "bottom-right" | "bottom-left";
  welcomeMessage?: string;
  placeholderText?: string;
  widgetTitle?: string;
  avatarUrl?: string | null;
  voiceEnabled?: boolean;
}

export function ChatWidget({
  apiKey,
  supabaseUrl,
  accentColor = "#0d9488",
  position = "bottom-right",
  welcomeMessage = "Hi! How can I help you today?",
  placeholderText = "Type your message...",
  widgetTitle = "Chat with us",
  avatarUrl = null,
  voiceEnabled = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <ChatPanel
          config={{
            accentColor,
            welcomeMessage,
            placeholderText,
            widgetTitle,
            avatarUrl,
            voiceEnabled,
            position,
          }}
          apiKey={apiKey}
          supabaseUrl={supabaseUrl}
          onClose={() => setIsOpen(false)}
        />
      )}
      <ChatBubble
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        accentColor={accentColor}
        position={position}
      />
    </>
  );
}

export default ChatWidget;
