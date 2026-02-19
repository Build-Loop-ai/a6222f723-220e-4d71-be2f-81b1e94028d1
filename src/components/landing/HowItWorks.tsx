import { motion, useScroll, useTransform } from "framer-motion";
import { Link as LinkIcon, SlidersHorizontal, Rocket } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Paste your URL",
    desc: "Enter any website URL. Greet crawls the entire sitemap and reads every page, product, service, and FAQ automatically.",
    icon: LinkIcon,
    visual: (
      <div className="space-y-3">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="flex-1 px-3 py-2 rounded-lg text-xs text-muted-foreground" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            vandermolen.nl
          </div>
          <div className="px-3 py-2 rounded-lg text-xs font-medium text-primary" style={{ background: "rgba(52,215,123,0.10)", border: "1px solid rgba(52,215,123,0.15)" }}>
            Crawling...
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Customize your agent",
    desc: "Set the tone, add custom documents, configure lead capture. Your agent matches your brand perfectly.",
    icon: SlidersHorizontal,
    visual: (
      <div className="space-y-2">
        {["Voice Mode", "Lead Capture", "Auto-Reply"].map((label, i) => (
          <div key={i} className="glass rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-xs text-foreground">{label}</span>
            <div className={`w-8 h-5 rounded-full relative ${i < 2 ? "bg-primary/30" : "bg-foreground/10"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${i < 2 ? "left-3.5 bg-primary" : "left-0.5 bg-foreground/30"}`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "03",
    title: "Go live in minutes",
    desc: "Copy one line of code or use our plugin. The chat widget appears on your site, ready to help every visitor.",
    icon: Rocket,
    visual: (
      <div className="glass rounded-xl p-3">
        <code className="font-mono text-[11px] text-primary leading-relaxed block">
          {'<script src="greet.js"></script>'}
        </code>
      </div>
    ),
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-44 overflow-hidden">
      {/* DRAMATIC IMMERSIVE BACKGROUND — green atmosphere */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, #070810 0%, #081A10 30%, #0D2A18 50%, #081A10 70%, #070810 100%)",
      }} />

      {/* Large breathing green glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1000px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(52,215,123,0.14) 0%, rgba(52,215,123,0.04) 40%, transparent 70%)",
          scale: glowScale,
          y: bgY,
        }}
      />

      {/* Cyan accent */}
      <motion.div
        className="absolute top-[20%] right-[-200px] w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,194,224,0.08) 0%, transparent 60%)" }}
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particles */}
      <div className="particles-container">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: "-10px",
              width: `${2 + Math.random() * 2}px`,
              height: `${2 + Math.random() * 2}px`,
              animationDuration: `${12 + Math.random() * 18}s`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1140px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-5">
            How It Works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-[700] leading-[1.1] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            Three steps, one result.
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 80, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-premium rounded-[28px] p-10 group hover:border-[rgba(52,215,123,0.2)] transition-all duration-500"
              style={{ transformStyle: "preserve-3d" }}
              whileHover={{ y: -8, boxShadow: "0 0 60px rgba(52,215,123,0.1), 0 20px 60px rgba(0,0,0,0.4)" }}
            >
              {/* Number */}
              <div className="font-display font-[800] text-gradient mb-6" style={{ fontSize: "48px" }}>
                {step.num}
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6"
                style={{ background: "rgba(52,215,123,0.10)", border: "1px solid rgba(52,215,123,0.12)" }}
              >
                <step.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="font-display text-xl font-[700] text-foreground mb-3 tracking-[-0.01em]">{step.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">{step.desc}</p>

              {/* Visual */}
              <div className="mt-auto">{step.visual}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
