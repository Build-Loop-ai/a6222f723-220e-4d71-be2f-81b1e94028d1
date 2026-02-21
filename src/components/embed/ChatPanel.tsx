import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedUrl?: string | null;
}

interface WidgetConfig {
  accentColor: string;
  welcomeMessage: string;
  placeholderText: string;
  widgetTitle: string;
  avatarUrl?: string | null;
  voiceEnabled: boolean;
  position: "bottom-right" | "bottom-left";
}

interface ChatPanelProps {
  config: WidgetConfig;
  apiKey: string;
  supabaseUrl: string;
  onClose: () => void;
  isClosing?: boolean;
}

export function ChatPanel({ config, apiKey, supabaseUrl, onClose, isClosing = false }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: config.welcomeMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId] = useState(() => {
    const stored = localStorage.getItem("__widget_visitor_id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("__widget_visitor_id", id);
    return id;
  });
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const positionClasses =
    config.position === "bottom-right" ? "right-5 bottom-24" : "left-5 bottom-24";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      // Add a placeholder for streaming
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/widget-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-widget-key": apiKey,
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationId,
            visitorId,
            pageUrl: window.location.href,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to send message");
        }

        // Capture conversation ID from header
        const convId = res.headers.get("X-Conversation-Id");
        if (convId) setConversationId(convId);

        // Stream SSE response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: fullText } : m
                    )
                  );
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }

        // If streaming returned no content, set a fallback
        if (!fullText.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "I'm sorry, I couldn't generate a response. Please try again." }
                : m
            )
          );
        } else {
          // Extract suggested URL
          const urlMatch = fullText.match(/https?:\/\/[^\s)>]+/);
          if (urlMatch) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, suggestedUrl: urlMatch[0] } : m
              )
            );
          }
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, conversationId, isLoading, supabaseUrl, visitorId]
  );

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (transcript) sendMessage(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className={`fixed ${positionClasses} z-[9999] flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-250 ease-out ${
        isClosing
          ? "translate-y-4 scale-95 opacity-0"
          : "animate-[widget-open_0.25s_ease-out_forwards]"
      }`}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: config.accentColor }}
      >
        {config.avatarUrl && (
          <img
            src={config.avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full border-2 border-white/30 object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{config.widgetTitle}</h3>
          <p className="text-[11px] text-white/70">Online</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e5e5 transparent" }}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            suggestedUrl={msg.suggestedUrl}
            accentColor={config.accentColor}
          />
        ))}
        {isLoading && (
          <div className="mb-3 flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 px-3 py-2.5">
        {config.voiceEnabled && (
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              isListening
                ? "bg-red-100 text-red-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config.placeholderText}
          disabled={isLoading}
          className="h-9 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-0 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: config.accentColor }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Branding */}
      <div className="border-t border-gray-50 py-1.5 text-center">
        <span className="text-[10px] text-gray-300">
          Powered by AI
        </span>
      </div>
    </div>
  );
}
