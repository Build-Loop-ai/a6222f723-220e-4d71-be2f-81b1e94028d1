import { MessageCircle, X } from "lucide-react";

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  accentColor: string;
  position: "bottom-right" | "bottom-left";
  unreadCount?: number;
}

export function ChatBubble({ isOpen, onClick, accentColor, position, unreadCount = 0 }: ChatBubbleProps) {
  const positionClasses = position === "bottom-right" ? "right-5 bottom-5" : "left-5 bottom-5";

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses} z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl`}
      style={{ backgroundColor: accentColor }}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
