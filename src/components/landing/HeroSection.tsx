import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquare, Send, Mic } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const widgetY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      {/* Layered immersive background */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ scale: bgScale }}>
        {/* Base gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #070810 0%, #060D0A 40%, #070810 100%)",
        }} />
        {/* Large green aurora — top right */}
        <motion.div
          className="absolute -top-[200px] right-[-100px] w-[900px] h-[900px]"
          style={{ background: "radial-gradient(circle, rgba(52,215,123,0.18) 0%, rgba(52,215,123,0.04) 40%, transparent 65%)" }}
          animate={{ x: [0, 40, 0], y: [0, -50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Cyan glow — center left */}
        <motion.div
          className="absolute top-[30%] left-[-200px] w-[700px] h-[700px]"
          style={{ background: "radial-gradient(circle, rgba(0,194,224,0.12) 0%, transparent 60%)" }}
          animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Warm accent — bottom */}
        <motion.div
          className="absolute bottom-[-100px] right-[20%] w-[600px] h-[600px]"
          style={{ background: "radial-gradient(circle, rgba(52,215,123,0.08) 0%, transparent 60%)" }}
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grain overlay */}
        <div className="absolute inset-0 grain-overlay" />
      </motion.div>

      {/* Particles */}
      <div className="particles-container">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${8 + Math.random() * 84}%`,
              bottom: "-10px",
              width: `${2 + Math.random() * 2}px`,
              height: `${2 + Math.random() * 2}px`,
              animationDuration: `${12 + Math.random() * 18}s`,
              animationDelay: `${Math.random() * 12}s`,
              opacity: 0.15 + Math.random() * 0.35,
            }}
          />
        ))}
      </div>

      <motion.div style={{ y: contentY, opacity: fadeOut }} className="max-w-[1140px] relative z-10 mx-auto px-6 md:px-12 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-7rem)]">
          {/* Left – Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10"
              style={{ background: "rgba(52,215,123,0.08)", border: "1px solid rgba(52,215,123,0.15)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-live" />
              <span className="font-mono text-[10px] tracking-[2.5px] uppercase text-primary">Now in public beta</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-[800] leading-[0.95] tracking-[-0.03em] mb-8"
              style={{ fontSize: "clamp(52px, 6vw, 80px)" }}
            >
              <span className="text-foreground">Your website,</span>
              <br />
              <span className="text-gradient">speaking.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-[480px] leading-relaxed mb-12"
            >
              Paste a URL. Greet crawls every page, learns your business, and deploys an AI chat widget visitors can talk to. Text and voice, one&nbsp;experience.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/signup">
                <button
                  className="px-8 py-4 rounded-[14px] text-base font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
                  style={{
                    background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)",
                    boxShadow: "0 4px 20px hsla(148, 68%, 52%, 0.3)",
                  }}
                >
                  Start Free Trial →
                </button>
              </Link>
              <Link to="/demo">
                <button className="px-8 py-4 rounded-[14px] text-base font-medium text-foreground transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto flex items-center justify-center gap-2 glass">
                  <MessageSquare className="w-5 h-5" />
                  Try Demo
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex gap-12 pt-12 max-w-[520px] flex-wrap"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[
                { label: "Setup", value: "5 min" },
                { label: "Languages", value: "22+" },
                { label: "Free trial", value: "14 days" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] tracking-[2.5px] uppercase text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right – Chat Widget Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center"
            style={{ y: widgetY }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transform: "rotate(2deg)" }}
            >
              {/* Chat widget */}
              <div
                className="relative w-[320px] md:w-[360px] rounded-[24px] overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 120px rgba(52,215,123,0.08)",
                }}
              >
                {/* Header */}
                <div
                  className="px-7 py-5 flex items-center gap-3.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(52,215,123,0.15) 0%, rgba(0,194,224,0.15) 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-[800] text-base"
                    style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)", color: "white" }}
                  >
                    G
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-[15px] font-[700] text-foreground">Van der Molen</h4>
                    <div className="flex items-center gap-1.5 text-xs text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-live" />
                      Online
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="px-7 py-6 space-y-3" style={{ background: "linear-gradient(180deg, #0D0D0F 0%, #111113 100%)" }}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                    <div className="max-w-[85%] px-[18px] py-[14px] rounded-[18px] rounded-bl-[6px] text-sm leading-relaxed text-foreground glass">
                      Hi! Hoe kan ik je helpen? 👋
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex justify-end">
                    <div className="max-w-[85%] px-[18px] py-[14px] rounded-[18px] rounded-br-[6px] text-sm leading-relaxed" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)", color: "white" }}>
                      Wat kost een kroon?
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
                    <div className="max-w-[85%] px-[18px] py-[14px] rounded-[18px] rounded-bl-[6px] text-sm leading-relaxed text-foreground glass">
                      Een kroon kost tussen €350 en €750. Zal ik een afspraak inplannen?
                    </div>
                  </motion.div>
                </div>

                {/* Input */}
                <div className="px-5 py-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex-1 px-4 py-3 rounded-xl text-[13px] text-muted-foreground glass">
                    Stel een vraag...
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,215,123,0.10)", border: "1px solid rgba(52,215,123,0.15)" }}>
                    <Mic className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}>
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating badge left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -left-8 md:-left-20 top-1/4 hidden sm:block"
            >
              <div className="glass rounded-2xl p-4 max-w-[180px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,215,123,0.15)" }}>
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Booked</p>
                    <p className="text-xs text-muted-foreground">Thu, 2:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating badge right */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="absolute -right-8 md:-right-24 bottom-1/3 hidden sm:block"
            >
              <div className="glass rounded-2xl p-4 max-w-[180px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,215,123,0.15)" }}>
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Visitor helped</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
