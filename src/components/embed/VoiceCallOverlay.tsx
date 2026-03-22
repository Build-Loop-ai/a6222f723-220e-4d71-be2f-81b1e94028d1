import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, ExternalLink, X } from "lucide-react";
import { stopVapiCall, resetVapiClient } from "@/lib/vapi-client";
import type Vapi from "@vapi-ai/web";

type CallStatus = "connecting" | "listening" | "speaking" | "ended";

interface SharedLink {
  url: string;
  title: string;
  id: string;
}

interface VoiceCallOverlayProps {
  vapiInstance: Vapi;
  accentColor: string;
  onEnd: () => void;
}

export function VoiceCallOverlay({
  vapiInstance,
  accentColor,
  onEnd,
}: VoiceCallOverlayProps) {
  const [status, setStatus] = useState<CallStatus>("connecting");
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingRef = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const maxDuration = 300;

  const doEnd = (reason?: string) => {
    if (endingRef.current) return;
    endingRef.current = true;
    console.log("[VoiceCall] Ending call, reason:", reason || "user hangup");

    setStatus("ended");
    if (reason) setErrorMsg(reason);

    try { stopVapiCall(); } catch {}
    resetVapiClient();
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => onEndRef.current(), reason ? 1500 : 600);
  };

  const doEndRef = useRef(doEnd);
  doEndRef.current = doEnd;

  const dismissLink = (id: string) => {
    setSharedLinks((prev) => prev.filter((l) => l.id !== id));
  };

  useEffect(() => {
    console.log("[VoiceCall] Mounting – attaching event listeners to running Vapi instance");
    const vapi = vapiInstance;

    const onCallStart = () => {
      console.log("[VoiceCall] Event: call-start");
      setStatus("listening");
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxDuration) {
            doEndRef.current("Max duration reached");
            return s;
          }
          return s + 1;
        });
      }, 1000);
    };

    const onCallEnd = () => {
      console.log("[VoiceCall] Event: call-end");
      doEndRef.current();
    };

    const onSpeechStart = () => {
      console.log("[VoiceCall] Event: speech-start");
      setStatus("speaking");
    };

    const onSpeechEnd = () => {
      console.log("[VoiceCall] Event: speech-end");
      setStatus("listening");
    };

    const onError = (err: unknown) => {
      console.error("[VoiceCall] Event: error", JSON.stringify(err, null, 2));
      let msg = "Connection failed";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, any>;
        msg = e.error?.errorMsg || e.error?.message || e.errorMsg || e.message || "Call ended unexpectedly";
      }
      doEndRef.current(msg);
    };

    const onMessage = (msg: any) => {
      // Detect navigateToPage tool calls from the assistant
      if (msg?.type === "tool-calls" || msg?.toolCalls) {
        const toolCalls = msg.toolCalls || msg.toolCallList || [];
        for (const tc of toolCalls) {
          if (tc?.function?.name === "navigateToPage") {
            const args = typeof tc.function.arguments === "string"
              ? JSON.parse(tc.function.arguments || "{}")
              : tc.function.arguments || {};
            if (args.url) {
              console.log("[VoiceCall] Navigate link received:", args.url, args.title);
              const link: SharedLink = {
                url: args.url,
                title: args.title || args.url,
                id: `${Date.now()}-${Math.random()}`,
              };
              setSharedLinks((prev) => [...prev, link]);
              // Auto-dismiss after 15 seconds
              setTimeout(() => {
                setSharedLinks((prev) => prev.filter((l) => l.id !== link.id));
              }, 15000);
            }
          }
        }
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      console.log("[VoiceCall] Unmounting – cleaning up listeners");
      if (timerRef.current) clearInterval(timerRef.current);
      try { (vapi as any).removeListener("call-start", onCallStart); } catch {}
      try { (vapi as any).removeListener("call-end", onCallEnd); } catch {}
      try { (vapi as any).removeListener("speech-start", onSpeechStart); } catch {}
      try { (vapi as any).removeListener("speech-end", onSpeechEnd); } catch {}
      try { (vapi as any).removeListener("error", onError); } catch {}
      try { (vapi as any).removeListener("message", onMessage); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const statusLabel =
    status === "connecting"
      ? "Connecting…"
      : status === "speaking"
      ? "Speaking…"
      : status === "listening"
      ? "Listening…"
      : errorMsg
      ? errorMsg
      : "Call ended";

  const isActive = status !== "ended" && status !== "connecting";

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Pulsing rings */}
      <div className="relative mb-8">
        {[80, 120, 160].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: `calc(50% - ${size / 2}px)`,
              left: `calc(50% - ${size / 2}px)`,
              border: `2px solid ${accentColor}`,
              opacity: isActive ? 0.15 - i * 0.04 : 0.06,
              animation: isActive
                ? `pulse ${1.5 + i * 0.3}s ease-in-out infinite`
                : "none",
            }}
          />
        ))}
        {/* Center icon */}
        <div
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg"
          style={{
            backgroundColor: status === "ended" && errorMsg ? "#ef4444" : accentColor,
            boxShadow: `0 8px 32px -4px ${accentColor}50`,
          }}
        >
          {status === "ended" && errorMsg ? (
            <PhoneOff className="h-7 w-7" />
          ) : (
            <Phone className="h-7 w-7" />
          )}
        </div>
      </div>

      {/* Status */}
      <p className={`text-sm font-medium mb-1 ${status === "ended" && errorMsg ? "text-red-600" : "text-gray-700"}`}>
        {statusLabel}
      </p>
      {(isActive || status === "ended") && (
        <p className="text-xs text-gray-400 font-mono mb-8">{formatTime(seconds)}</p>
      )}
      {status === "connecting" && <div className="mb-8" />}

      {/* End Call button */}
      {status !== "ended" && (
        <button
          onClick={() => doEnd()}
          className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl active:scale-95"
        >
          <PhoneOff className="h-4 w-4" />
          End Call
        </button>
      )}

      {/* Shared links */}
      {sharedLinks.length > 0 && (
        <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-2">
          {sharedLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 shadow-sm animate-in slide-in-from-bottom-2 duration-300"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-gray-500" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-medium truncate hover:underline"
                style={{ color: accentColor }}
              >
                {link.title}
              </a>
              <button
                onClick={() => dismissLink(link.id)}
                className="shrink-0 rounded-full p-1 hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.08); opacity: 0.08; }
        }
      `}</style>
    </div>
  );
}
