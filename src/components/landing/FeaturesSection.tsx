import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Mic, ArrowUpRight, UserPlus, FileText, Languages } from "lucide-react";

const TALK_BLOBS = [
  { cx: 0.25, cy: 0.35, color: [52, 215, 123], speed: 0.45, phase: 0, drift: 0.3 },
  { cx: 0.75, cy: 0.55, color: [0, 194, 224], speed: 0.40, phase: 1.5, drift: 0.32 },
  { cx: 0.5, cy: 0.75, color: [80, 200, 180], speed: 0.50, phase: 3.0, drift: 0.26 },
  { cx: 0.4, cy: 0.3, color: [0, 180, 200], speed: 0.42, phase: 4.5, drift: 0.34 },
];

function AnimatedGradientWord({ word }: { word: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = Math.random() * 100;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
      }
    };

    const draw = () => {
      t += 0.055;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const blob of TALK_BLOBS) {
        const cx = w * (blob.cx + Math.sin(t * blob.speed + blob.phase) * blob.drift
          + Math.sin(t * blob.speed * 2.1 + blob.phase * 0.7) * blob.drift * 0.3);
        const cy = h * (blob.cy + Math.cos(t * blob.speed * 0.8 + blob.phase + 1) * blob.drift
          + Math.cos(t * blob.speed * 1.7 + blob.phase * 1.3) * blob.drift * 0.25);
        const r = Math.min(w, h) * (0.85 + Math.sin(t * 0.5 + blob.phase) * 0.1);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 1)`);
        grad.addColorStop(0.4, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.9)`);
        grad.addColorStop(0.7, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.5)`);
        grad.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.1)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <span className="relative inline-block overflow-hidden" style={{ isolation: "isolate" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <span
        style={{
          position: "relative",
          background: "#050506",
          color: "white",
          mixBlendMode: "multiply",
        }}
      >
        {word}
      </span>
    </span>
  );
}

const features = [
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training.", num: "01" },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed.", num: "02" },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page.", num: "03" },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion.", num: "04" },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge.", num: "05" },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more.", num: "06" },
];

const FeaturesSection = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section
      id="features"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        background: "#050506",
      }}
    >
      <div className="container-large">
        {/* Tag */}
        <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-m)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
            Features
          </span>
        </div>

        {/* Large heading */}
        <h2
          className="text-foreground tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 7vw, 6rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            maxWidth: "100%",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          Everything your website
          <br />
          needs to <AnimatedGradientWord word="talk." />
        </h2>

        {/* Stacked accordion rows */}
        <div className="flex flex-col">
          {features.map((f, i) => {
            const isOpen = expanded === i;
            const Icon = f.icon;

            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full text-left group"
                  style={{
                    borderTop: "1px solid hsl(var(--border))",
                    padding: "clamp(1.25rem, 2vw, 2rem) 0",
                  }}
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    {/* Number */}
                    <span
                      className="font-mono shrink-0 transition-colors duration-300"
                      style={{
                        fontSize: "var(--text-small)",
                        color: isOpen ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                        width: "2rem",
                      }}
                    >
                      {f.num}
                    </span>

                    {/* Icon */}
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isOpen
                          ? "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--cyan) / 0.1))"
                          : "hsl(var(--card))",
                        border: isOpen
                          ? "1px solid hsl(var(--primary) / 0.3)"
                          : "1px solid hsl(var(--border))",
                      }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={2}
                        className="transition-colors duration-300"
                        style={{ color: isOpen ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className="flex-1 font-display font-bold tracking-tight transition-colors duration-300"
                      style={{
                        fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)",
                        color: isOpen ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {f.title}
                    </h3>

                    {/* Toggle indicator */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isOpen ? "hsl(var(--primary) / 0.12)" : "transparent",
                        border: isOpen ? "1px solid hsl(var(--primary) / 0.25)" : "1px solid hsl(var(--border))",
                      }}
                    >
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="block text-lg leading-none"
                        style={{
                          color: isOpen ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                        }}
                      >
                        +
                      </motion.span>
                    </div>
                  </div>
                </button>

                {/* Expandable description */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pb-6 md:pb-8"
                        style={{ paddingLeft: "calc(2rem + 1rem + 2.5rem + 1rem)" }}
                      >
                        <p
                          className="text-muted-foreground leading-relaxed"
                          style={{
                            fontSize: "var(--text-body-lg)",
                            maxWidth: "520px",
                          }}
                        >
                          {f.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Bottom border */}
          <div style={{ borderTop: "1px solid hsl(var(--border))" }} />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
