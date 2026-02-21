import { useState, useCallback } from "react";
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
  vapiPublicKey?: string;
  vapiAssistantId?: string;
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
  vapiPublicKey,
  vapiAssistantId,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openWidget = useCallback(() => {
    setShowPanel(true);
    setIsOpen(true);
    setIsClosing(false);
  }, []);

  const closeWidget = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPanel(false);
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  const toggleWidget = useCallback(() => {
    if (isOpen) closeWidget();
    else openWidget();
  }, [isOpen, openWidget, closeWidget]);

  return (
    <>
      {showPanel && (
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
          onClose={closeWidget}
          isClosing={isClosing}
          vapiPublicKey={vapiPublicKey}
          vapiAssistantId={vapiAssistantId}
        />
      )}
      <ChatBubble
        isOpen={isOpen}
        onClick={toggleWidget}
        accentColor={accentColor}
        position={position}
      />
    </>
  );
}

export default ChatWidget;
