import { Link } from "react-router-dom";
import { Send, Mic, ArrowRight, Globe } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const ROTATING_WORDS = ["speaking.", "listening.", "converting.", "helping.", "greeting."];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.6]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const widgetScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const widgetY = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const [wordIndex, setWordIndex] = useState(0);
  const [urlValue, setUrlValue] = useState("");
  const [isTypingUrl, setIsTypingUrl] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

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
      const url = "vandermolen.nl";
      let i = 0;
      const typeInterval = setInterval(() => {
        setUrlValue(url.slice(0, i + 1));
        i++;
        if (i >= url.length) {
          clearInterval(typeInterval);
          setTimeout(() => setShowWidget(true), 600);
        }
      }, 80);
      return () => clearInterval(typeInterval);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

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

  return (
    <section ref={sectionRef} className="relative min-h-[110vh] overflow-hidden flex flex-col items-center justify-center">
      {/* === BACKGROUND === */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "#050508" }}>
        {/* Central orb — the "portal" */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ scale: orbScale, opacity: orbOpacity }}
        >
          <motion.div
            className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(52,215,123,0.2) 0%, rgba(0,194,224,0.1) 30%, rgba(52,215,123,0.03) 55%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Secondary orbs */}
        <motion.div
          className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,194,224,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(52,215,123,0.06) 0%, transparent 60%)", filter: "blur(40px)" }}
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid lines for depth */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            mask: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMask: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          }}
        />

        {/* Grain */}
        <div className="absolute inset-0 grain-overlay" />
      </div>

      {/* Particles */}
      <div className="particles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${5 + Math.random() * 90}%`,
              bottom: "-10px",
              width: `${1.5 + Math.random() * 2.5}px`,
              height: `${1.5 + Math.random() * 2.5}px`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: 0.1 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* === CONTENT === */}
      <motion.div style={{ y: contentY }} className="relative z-10 w-full max-w-[1100px] mx-auto px-6 text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10"
          style={{ background: "rgba(52,215,123,0.06)", border: "1px solid rgba(52,215,123,0.12)" }}
        >
          <span className="w-2 h-2 rounded-full bg-primary pulse-live" />
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-primary">Now in public beta</span>
        </motion.div>

        {/* Headline with letter stagger */}
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
                  className="inline-block text-foreground"
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
              className="font-display font-[800] tracking-[-0.04em] text-gradient"
              style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: "1" }}
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
          className="text-lg md:text-xl text-muted-foreground max-w-[560px] leading-relaxed mb-12"
        >
          Paste a URL. Greet crawls every page, learns your business, and deploys an AI chat widget visitors can talk&nbsp;to.
        </motion.p>

        {/* Interactive URL Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full max-w-[580px] mb-8"
        >
          <div
            className="relative flex items-center gap-3 p-2 rounded-2xl transition-all duration-500"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: showWidget ? "1px solid rgba(52,215,123,0.3)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: showWidget ? "0 0 40px rgba(52,215,123,0.1), 0 0 80px rgba(52,215,123,0.05)" : "0 8px 32px rgba(0,0,0,0.3)",
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
                  : "rgba(255,255,255,0.06)",
                color: showWidget ? "white" : "hsl(var(--muted-foreground))",
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
            <button className="px-8 py-4 rounded-[14px] text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              Watch Demo →
            </button>
          </Link>
        </motion.div>

        {/* Stats row */}
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
              <span className="font-mono text-[9px] tracking-[3px] uppercase text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* === FLOATING WIDGET (appears after URL typed) === */}
      <AnimatePresence>
        {showWidget && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute bottom-8 right-8 z-20 hidden lg:block"
            style={{ y: widgetY }}
          >
            <motion.div
              style={{ scale: widgetScale }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-[300px] rounded-[20px] overflow-hidden"
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
                    <h4 className="font-display text-[13px] font-[700] text-foreground">Van der Molen</h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-live" />
                      Online
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="px-5 py-5 space-y-2.5" style={{ background: "#0D0D0F" }}>
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md text-[13px] leading-relaxed text-foreground glass">
                      Hi! Hoe kan ik je helpen? 👋
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="flex justify-end">
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md text-[13px] leading-relaxed text-white" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))" }}>
                      Wat kost een kroon?
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 }}>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md text-[13px] leading-relaxed text-foreground glass">
                      Tussen €350–€750. Afspraak maken?
                    </div>
                  </motion.div>
                </div>

                {/* Input */}
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex-1 px-3 py-2.5 rounded-xl text-[12px] text-muted-foreground glass">Stel een vraag...</div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,215,123,0.1)" }}>
                    <Mic className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%), hsl(190 100% 44%))" }}>
                    <Send className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Glow ring under widget */}
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
        <span className="font-mono text-[9px] tracking-[3px] uppercase text-muted-foreground">Scroll</span>
        <motion.div
          className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1"
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
  );
};

export default HeroSection;