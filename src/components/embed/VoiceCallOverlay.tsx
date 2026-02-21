import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { getVapiClient, stopVapiCall, resetVapiClient } from "@/lib/vapi-client";

type CallStatus = "connecting" | "listening" | "speaking" | "ended";

interface VoiceCallOverlayProps {
  vapiPublicKey: string;
  vapiAssistantId: string;
  accentColor: string;
  onEnd: () => void;
}

export function VoiceCallOverlay({
  vapiPublicKey,
  vapiAssistantId,
  accentColor,
  onEnd,
}: VoiceCallOverlayProps) {
  const [status, setStatus] = useState<CallStatus>("connecting");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const maxDuration = 300; // 5 minutes

  const endCall = useCallback(() => {
    if (status === "ended") return;
    setStatus("ended");
    try {
      stopVapiCall(vapiPublicKey);
    } catch {}
    resetVapiClient();
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(onEnd, 600);
  }, [status, vapiPublicKey, onEnd]);

  // Start the VAPI call on mount – getUserMedia was already granted in the click handler
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let mounted = true;
    const vapi = getVapiClient(vapiPublicKey);

    vapi.on("call-start", () => {
      if (!mounted) return;
      setStatus("listening");
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxDuration) {
            endCall();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    });

    vapi.on("call-end", () => {
      if (mounted) endCall();
    });

    vapi.on("speech-start", () => {
      if (mounted) setStatus("speaking");
    });

    vapi.on("speech-end", () => {
      if (mounted) setStatus("listening");
    });

    vapi.on("error", (err: unknown) => {
      console.error("Vapi error:", err);
      if (mounted) endCall();
    });

    vapi.start(vapiAssistantId).catch((err: unknown) => {
      console.error("Vapi start failed:", err);
      if (mounted) endCall();
    });

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
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
            backgroundColor: accentColor,
            boxShadow: `0 8px 32px -4px ${accentColor}50`,
          }}
        >
          <Phone className="h-7 w-7" />
        </div>
      </div>

      {/* Status */}
      <p className="text-sm font-medium text-gray-700 mb-1">{statusLabel}</p>
      {(isActive || status === "ended") && (
        <p className="text-xs text-gray-400 font-mono mb-8">{formatTime(seconds)}</p>
      )}
      {status === "connecting" && <div className="mb-8" />}

      {/* End Call button */}
      {status !== "ended" && (
        <button
          onClick={endCall}
          className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl active:scale-95"
        >
          <PhoneOff className="h-4 w-4" />
          End Call
        </button>
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
