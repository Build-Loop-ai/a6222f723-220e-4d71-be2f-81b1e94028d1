import { Link } from "react-router-dom";
import { Send, Mic, ArrowRight, Globe, MessageCircle, Phone, Loader2, X } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

const ROTATING_WORDS = ["speaking.", "listening.", "converting.", "helping.", "greeting."];
const HERO_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hero-chat`;

type ChatMsg = { role: "user" | "assistant"; content: string };

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.6]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [wordIndex, setWordIndex] = useState(0);
  const [urlValue, setUrlValue] = useState("");
  const [isTypingUrl, setIsTypingUrl] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [widgetTab, setWidgetTab] = useState<"chat" | "voice">("chat");
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  // Widget lifecycle: "building" → "ready"
  const [widgetPhase, setWidgetPhase] = useState<"building" | "ready">("building");
  // Whether the widget has settled into the fixed bottom-right position
  const [isFixed, setIsFixed] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! 👋 I'm the Greet.ai assistant. Ask me anything about how we turn websites into smart AI chatbots!" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [widgetDismissed, setWidgetDismissed] = useState(false);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Auto-type URL demo
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTypingUrl(true);
      const url = "greet.ai";
      let i = 0;
      const typeInterval = setInterval(() => {
        setUrlValue(url.slice(0, i + 1));
        i++;
        if (i >= url.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            setShowWidget(true);
            // After "building" phase, transition to ready and then fix
            setTimeout(() => setWidgetPhase("ready"), 2200);
            setTimeout(() => setIsFixed(true), 3400);
          }, 600);
        }
      }, 80);
      return () => clearInterval(typeInterval);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Auto-activate voice demo after tab switch
  useEffect(() => {
    if (widgetTab === "voice") {
      const t = setTimeout(() => setVoiceActive(true), 600);
      return () => clearTimeout(t);
    } else {
      setVoiceActive(false);
      setVoiceSeconds(0);
    }
  }, [widgetTab]);

  // Voice timer
  useEffect(() => {
    if (!voiceActive) return;
    const i = setInterval(() => setVoiceSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [voiceActive]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMsg = { role: "user", content: text };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setIsStreaming(true);

    if (widgetTab !== "chat") setWidgetTab("chat");

    let assistantContent = "";

    try {
      const resp = await fetch(HERO_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              const current = assistantContent;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length === newMessages.length + 1) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch {
            // partial JSON
          }
        }
      }
    } catch (err) {
      console.error("Hero chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, something went wrong. Try again!" },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [chatInput, chatMessages, isStreaming, widgetTab]);

  const letterVariants = {
    hidden: { opacity: 0, y: 80, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        delay: 0.3 + i * 0.05,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  const headlineWords = "Your website,".split("");

  // Building steps for the animation
  const buildingSteps = [
    "Crawling greet.ai…",
    "Analyzing pages…",
    "Training AI model…",
    "Deploying widget…",
  ];
  const [buildStep, setBuildStep] = useState(0);

  useEffect(() => {
    if (!showWidget || widgetPhase !== "building") return;
    const interval = setInterval(() => {
      setBuildStep((prev) => {
        if (prev >= buildingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [showWidget, widgetPhase]);

  // The chat widget content (shared between both positions)
  const widgetContent = (
    <div
      className="w-[320px] rounded-[20px] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(52,215,123,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(52,215,123,0.12) 0%, rgba(0,194,224,0.08) 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-[800] text-sm" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))", color: "white" }}>G</div>
        <div className="flex-1">
          <h4 className="font-display text-[13px] font-[700] text-foreground">Greet.ai</h4>
          <div className="flex items-center gap-1.5 text-[11px] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-live" />
            Live Demo
          </div>
        </div>
      </div>

      {widgetPhase === "building" ? (
        /* Building phase */
        <div className="px-4 py-8 flex flex-col items-center gap-4" style={{ background: "#0D0D0F", minHeight: "200px" }}>
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Globe className="w-5 h-5 text-white" />
          </motion.div>
          <div className="space-y-2 w-full">
            {buildingSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={idx <= buildStep ? { opacity: 1, x: 0 } : { opacity: 0.2, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-[12px]"
              >
                <motion.span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{
                    background: idx <= buildStep ? "hsl(148 68% 52%)" : "rgba(255,255,255,0.1)",
                    color: idx <= buildStep ? "white" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {idx < buildStep ? "✓" : idx === buildStep ? "…" : ""}
                </motion.span>
                <span className={idx <= buildStep ? "text-foreground" : "text-muted-foreground/40"}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Ready phase — tabs + chat/voice */
        <>
          {/* Tab toggle */}
          <div className="flex px-3 pt-2 gap-1" style={{ background: "#0D0D0F" }}>
            {(["chat", "voice"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setWidgetTab(tab)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: widgetTab === tab ? "rgba(52,215,123,0.1)" : "transparent",
                  color: widgetTab === tab ? "hsl(148 68% 52%)" : "rgba(255,255,255,0.35)",
                }}
              >
                {tab === "chat" ? <MessageCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {tab === "chat" ? "Chat" : "Voice"}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {widgetTab === "chat" ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-4 space-y-2.5 overflow-y-auto"
                style={{ background: "#0D0D0F", maxHeight: "260px", minHeight: "140px" }}
              >
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={msg.role === "user" ? "flex justify-end" : ""}
                  >
                    <div
                      className={`max-w-[88%] px-3.5 py-2.5 text-[12px] leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-2xl rounded-br-md text-white"
                          : "rounded-2xl rounded-bl-md text-foreground glass"
                      }`}
                      style={
                        msg.role === "user"
                          ? { background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))" }
                          : undefined
                      }
                    >
                      {msg.content}
                      {isStreaming && idx === chatMessages.length - 1 && msg.role === "assistant" && (
                        <motion.span
                          className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 align-middle"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </motion.div>
            ) : (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-8 gap-5"
                style={{ background: "#0D0D0F" }}
              >
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: voiceActive
                        ? "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))"
                        : "rgba(255,255,255,0.06)",
                    }}
                    animate={
                      voiceActive
                        ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(52,215,123,0.3)", "0 0 40px rgba(52,215,123,0.4)", "0 0 0px rgba(52,215,123,0.3)"] }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </motion.div>
                  {voiceActive && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border border-primary/30"
                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-primary/20"
                        animate={{ scale: [1, 2.6], opacity: [0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                      />
                    </>
                  )}
                </div>

                {voiceActive && (
                  <div className="flex items-center gap-[3px] h-8">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] rounded-full"
                        style={{ background: "linear-gradient(to top, hsl(148 68% 52%), hsl(190 100% 44%))" }}
                        animate={{ height: [4, 8 + Math.random() * 22, 4] }}
                        transition={{
                          duration: 0.4 + Math.random() * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="text-center">
                  <p className="text-[13px] font-medium text-foreground">
                    {voiceActive ? "AI is speaking…" : "Connecting…"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    {voiceActive ? `0:${voiceSeconds.toString().padStart(2, "0")}` : "Starting call"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {widgetTab === "chat" ? (
              <>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything about Greet.ai..."
                  className="flex-1 px-3 py-2 rounded-xl text-[12px] text-foreground placeholder:text-muted-foreground glass bg-transparent outline-none border-none"
                  disabled={isStreaming}
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
                <button
                  onClick={() => setWidgetTab("voice")}
                  className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 shrink-0"
                  style={{ background: "rgba(52,215,123,0.1)" }}
                >
                  <Mic className="w-3 h-3 text-primary" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={isStreaming || !chatInput.trim()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))",
                    opacity: isStreaming || !chatInput.trim() ? 0.5 : 1,
                  }}
                >
                  {isStreaming ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 text-white" />
                  )}
                </button>
              </>
            ) : (
              <button
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all"
                style={{
                  background: voiceActive ? "rgba(239,68,68,0.15)" : "rgba(52,215,123,0.1)",
                  color: voiceActive ? "#ef4444" : "hsl(148 68% 52%)",
                }}
                onClick={() => {
                  setVoiceActive(!voiceActive);
                  if (voiceActive) setVoiceSeconds(0);
                }}
              >
                {voiceActive ? "End Call" : "Start Call"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <section
        ref={sectionRef}
        className="relative min-h-[110vh] overflow-hidden flex flex-col items-center justify-center"
      >
        {/* === Vibrant teal-green animated gradient === */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(168 80% 38%) 0%, hsl(174 72% 46%) 20%, hsl(160 65% 50%) 40%, hsl(148 68% 52%) 60%, hsl(170 80% 42%) 80%, hsl(185 85% 40%) 100%)",
            backgroundSize: "400% 400%",
            animation: "hero-gradient-shift 12s ease-in-out infinite",
          }}
        />

        {/* Radial glow overlays for depth & dimension */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 20% 30%, hsla(190,100%,50%,0.3) 0%, transparent 60%)",
            animation: "hero-glow-drift 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 80% 70%, hsla(148,68%,40%,0.25) 0%, transparent 60%)",
            animation: "hero-glow-drift 10s ease-in-out infinite reverse",
          }}
        />

        {/* Bottom vignette for content readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)" }}
        />

        {/* Subtle grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* === CONTENT === */}
        <motion.div style={{ y: contentY }} className="relative z-10 w-full max-w-[1100px] mx-auto px-6 text-center flex flex-col items-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(12px)" }}
          >
            <span className="w-2 h-2 rounded-full bg-white pulse-live" />
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-white font-semibold">Now in public beta</span>
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden mb-2" style={{ perspective: "800px" }}>
            <h1
              className="font-display font-[800] leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
            >
              <span className="inline-block">
                {headlineWords.map((letter, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={letterVariants}
                    className="inline-block text-white"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </span>
            </h1>
          </div>

          {/* Rotating word */}
          <div className="overflow-hidden mb-10" style={{ height: "clamp(56px, 9vw, 110px)" }}>
            <AnimatePresence mode="wait">
              <motion.h2
                key={wordIndex}
                initial={{ y: 60, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -60, opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-[800] tracking-[-0.04em] text-white"
                style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: "1", textShadow: "0 2px 20px rgba(0,0,0,0.15)" }}
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg md:text-xl max-w-[560px] leading-relaxed mb-12 text-white/80"
          >
            Paste a URL. Greet crawls every page, learns your business, and deploys an AI chat widget visitors can talk&nbsp;to.
          </motion.p>

          {/* URL Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="w-full max-w-[580px] mb-8"
          >
            <div
              className="relative flex items-center gap-3 p-2 rounded-2xl transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: showWidget ? "1px solid rgba(52,215,123,0.3)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: showWidget ? "0 0 40px rgba(52,215,123,0.1), 0 0 80px rgba(52,215,123,0.05)" : "0 8px 32px rgba(0,0,0,0.3)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex items-center gap-2.5 flex-1 px-4 py-3.5">
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className={`text-base ${urlValue ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                  {urlValue || "yourwebsite.com"}
                </span>
                {isTypingUrl && !showWidget && (
                  <motion.span
                    className="w-0.5 h-5 bg-primary"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </div>
              <motion.button
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-all"
                style={{
                  background: showWidget
                    ? "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)"
                    : "rgba(255,255,255,0.08)",
                  color: showWidget ? "white" : "rgba(255,255,255,0.5)",
                }}
                animate={showWidget ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {showWidget ? "✓ Ready" : "Go"}
              </motion.button>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="flex flex-col sm:flex-row gap-4 items-center mb-14"
          >
            <Link to="/signup">
              <button
                className="group px-8 py-4 rounded-[14px] text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03] flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)",
                  boxShadow: "0 4px 24px hsla(148, 68%, 52%, 0.25)",
                }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link to="/demo">
              <button className="px-8 py-4 rounded-[14px] text-base font-medium transition-all duration-200" style={{ color: "rgba(255,255,255,0.55)" }}>
                Watch Demo →
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex gap-10 md:gap-16 flex-wrap justify-center"
          >
            {[
              { label: "Setup", value: "5 min" },
              { label: "Languages", value: "22+" },
              { label: "Free trial", value: "14 days" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1 items-center">
                <span className="text-base md:text-lg font-semibold text-foreground">{item.value}</span>
                <span className="font-mono text-[9px] tracking-[3px] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* === WIDGET — inline in hero (before it goes fixed) === */}
        <AnimatePresence>
          {showWidget && !isFixed && (
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="absolute bottom-8 right-8 z-20 hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                {widgetContent}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 rounded-full"
                  style={{ background: "radial-gradient(ellipse, rgba(52,215,123,0.15) 0%, transparent 70%)", filter: "blur(12px)" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] tracking-[3px] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Scroll</span>
          <motion.div
            className="w-5 h-8 rounded-full border flex items-start justify-center p-1"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 rounded-full bg-primary"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* === FIXED WIDGET — sticks to bottom-right after animation === */}
      <AnimatePresence>
        {isFixed && !widgetDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.85, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 hidden lg:block"
          >
            <button
              onClick={() => setWidgetDismissed(true)}
              className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
              style={{
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
              aria-label="Close chat widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {widgetContent}
          </motion.div>
        )}
        {isFixed && widgetDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 hidden lg:block"
          >
            <button
              onClick={() => setWidgetDismissed(false)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))",
                boxShadow: "0 4px 24px rgba(52,215,123,0.3)",
              }}
              aria-label="Open chat widget"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeroSection;
