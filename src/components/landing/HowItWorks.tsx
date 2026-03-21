import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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

function StackingCard({
  step,
  index,
  total,
}: {
  step: (typeof steps)[0];
  index: number;
  total: number;
}) {
  // Progressively lighter green-tinted dark cards (matching Flomo pattern)
  const lightness = 8 + index * 6;

  return (
    <div
      className="sticky w-full flex justify-center"
      style={{
        top: `${120 + index * 24}px`,
        zIndex: index + 1,
        paddingBottom: "clamp(40px, 8vw, 100px)",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden w-full md:w-[85%]"
        style={{
          background: `hsl(148 40% ${lightness}%)`,
          color: "hsl(var(--foreground))",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 min-h-[320px] md:min-h-[540px]"
          style={{ gap: "var(--space-xl) var(--space-gap)", padding: "var(--space-card)" }}
        >
          {/* Left: text content */}
          <div className="flex flex-col justify-between" style={{ gap: "var(--space-m)" }}>
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "hsl(var(--foreground))",
                  color: "hsl(var(--background))",
                }}
              >
                {step.number}
              </span>
              <span
                className="font-medium uppercase tracking-widest opacity-70"
                style={{ fontSize: "var(--text-small)" }}
              >
                Step
              </span>
            </div>
            <div className="flex flex-col" style={{ gap: "var(--space-s)" }}>
              <h3
                className="font-bold leading-tight tracking-tight"
                style={{ fontSize: "var(--text-h2)" }}
              >
                {step.title}
              </h3>
              <p
                className="leading-relaxed opacity-60"
                style={{ fontSize: "var(--text-body-lg)", maxWidth: "var(--prose-max)" }}
              >
                {step.description}
              </p>
            </div>
          </div>

          {/* Right: decorative number */}
          <div className="hidden md:flex items-center justify-center">
            <span
              className="font-display font-[900] text-foreground/10"
              style={{ fontSize: "clamp(6rem, 12vw, 14rem)" }}
            >
              {step.number}
            </span>
          </div>
        </div>
      </div>
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
      {/* Dot grid background — sticky, clipped by clipPath on section */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(52,215,123,0.15) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Fade overlays — absolute so they scroll with section edges */}
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

      {/* Scroll marquee above cards */}
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

      <div className="h-[100px]" />

      {/* Stacking cards */}
      <div className="container-large" style={{ position: "relative", zIndex: 2 }}>
        {steps.map((step, i) => (
          <StackingCard key={step.number} step={step} index={i} total={steps.length} />
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
