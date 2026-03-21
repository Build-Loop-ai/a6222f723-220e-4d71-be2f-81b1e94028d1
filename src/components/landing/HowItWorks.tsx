import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  {
    number: "01",
    title: "Paste your URL",
    description:
      "Enter any website URL. Greet crawls the entire sitemap and reads every page, product, service, and FAQ automatically.",
  },
  {
    number: "02",
    title: "Customize your agent",
    description:
      "Set the tone, add custom documents, configure lead capture. Your agent matches your brand perfectly.",
  },
  {
    number: "03",
    title: "Go live in minutes",
    description:
      "Copy one line of code or use our plugin. The chat widget appears on your site, ready to help every visitor.",
  },
];

const MARQUEE_TEXT = "How it works";
const MARQUEE_REPEAT = 20;

function StackingCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const lightness = 8 + index * 6;

  return (
    <div
      className="sticky w-full flex justify-center"
      style={{
        top: `${110 + index * 28}px`,
        zIndex: index + 1,
        paddingBottom: "clamp(36px, 7vw, 80px)",
      }}
    >
      <motion.div
        className="rounded-3xl overflow-hidden w-full md:w-[88%]"
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.05 * index, ease: easeOut }}
        style={{
          background: `hsl(220 20% ${lightness}%)`,
          color: "#F8F6F0",
          boxShadow: "0 -2px 40px rgba(0,0,0,0.35), 0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] min-h-[300px] md:min-h-[480px]"
          style={{ padding: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          {/* Left content */}
          <div className="flex flex-col justify-between gap-8">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center font-mono text-sm font-bold"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.08)",
                  color: "hsl(var(--primary))",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {step.number}
              </div>
              <span
                className="font-medium uppercase tracking-widest"
                style={{ fontSize: "var(--text-small, 0.75rem)", color: "rgba(248,246,240,0.5)" }}
              >
                Step
              </span>
              <div
                className="h-px flex-1 hidden md:block"
                style={{ background: "linear-gradient(to right, rgba(255,255,255,0.12), transparent)" }}
              />
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
              <h3
                className="font-bold tracking-tight"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                  lineHeight: 1.1,
                  color: "#F8F6F0",
                }}
              >
                {step.title}
              </h3>
              <p
                className="leading-relaxed"
                style={{
                  fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)",
                  color: "rgba(248, 246, 240, 0.5)",
                  maxWidth: "420px",
                  lineHeight: 1.65,
                }}
              >
                {step.description}
              </p>
            </div>
          </div>

          {/* Right — large number */}
          <div className="hidden md:flex items-center justify-center">
            <span
              className="font-display font-[900] text-foreground/10"
              style={{ fontSize: "clamp(6rem, 12vw, 14rem)" }}
            >
              {step.number}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["-30%", "10%"]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        clipPath: "inset(0 0 0 0)",
      }}
    >
      {/* Dot grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--border)) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            opacity: 0.55,
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "300px",
          zIndex: 1,
          background: "linear-gradient(to bottom, hsl(var(--background)), transparent)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "300px",
          zIndex: 1,
          background: "linear-gradient(to top, hsl(var(--background)), transparent)",
        }}
      />

      {/* Scroll-driven marquee */}
      <div
        className="overflow-hidden relative"
        style={{ paddingTop: "var(--space-l)", paddingBottom: "var(--space-l)", zIndex: 2 }}
      >
        <motion.div
          className="flex items-center whitespace-nowrap gap-0"
          style={{ x: marqueeX }}
        >
          {Array.from({ length: MARQUEE_REPEAT }).map((_, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span
                className="tracking-tight leading-none font-black text-foreground"
                style={{
                  fontSize: "clamp(1.75rem, 7vw, 6rem)",
                  paddingLeft: "var(--space-m)",
                  paddingRight: "var(--space-m)",
                }}
              >
                {MARQUEE_TEXT}
              </span>
              <span
                className="w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0 bg-primary"
                style={{ transform: "translateY(6px)" }}
              />
            </span>
          ))}
        </motion.div>
      </div>

      <div className="h-[80px]" />

      {/* Stacking cards */}
      <div className="container-large" style={{ position: "relative", zIndex: 2 }}>
        {steps.map((step, i) => (
          <StackingCard key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
