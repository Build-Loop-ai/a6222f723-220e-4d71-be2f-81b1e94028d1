import { ExternalLink } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  suggestedUrl?: string | null;
  accentColor: string;
}

export function ChatMessage({ role, content, suggestedUrl, accentColor }: ChatMessageProps) {
  const isUser = role === "user";

  // Simple markdown-like link detection for display
  const renderContent = (text: string) => {
    // Convert URLs in text to clickable links
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md text-white"
            : "rounded-bl-md bg-gray-100 text-gray-900"
        }`}
        style={isUser ? { backgroundColor: accentColor } : undefined}
      >
        <p className="whitespace-pre-wrap">{renderContent(content)}</p>
        {suggestedUrl && !isUser && (
          <a
            href={suggestedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-white"
          >
            <ExternalLink className="h-3 w-3" />
            Visit page
          </a>
        )}
      </div>
    </div>
  );
}
