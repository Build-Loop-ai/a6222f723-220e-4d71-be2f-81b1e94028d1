import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Mic, ArrowUpRight, UserPlus, FileText, Languages } from "lucide-react";
import FeatureSignalMap from "@/components/landing/FeatureSignalMap";

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
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training." },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed." },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page." },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion." },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge." },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more." },
];

const FeaturesSection = () => {
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
            marginBottom: "clamp(3rem, 6vw, 8rem)",
          }}
        >
          Everything your website
          <br />
          needs to <AnimatedGradientWord word="talk." />
        </h2>

        <FeatureSignalMap features={features} />

        {/* === MOBILE LAYOUT === */}
        <div className="lg:hidden flex flex-col" style={{ gap: "var(--space-m)" }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-start gap-4 rounded-xl"
              style={{
                padding: "var(--space-card)",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border) / 0.3)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}
              >
                <f.icon size={20} className="text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="font-bold text-foreground tracking-tight" style={{ fontSize: "var(--text-body-lg)", marginBottom: "4px" }}>
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
