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
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training." },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed." },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page." },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion." },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge." },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more." },
];

// Positions around a circle (6 items, evenly spaced starting from top)
const orbitPositions = [
  { angle: -90, radius: 36 },   // top
  { angle: -30, radius: 36 },   // top-right
  { angle: 30, radius: 36 },    // bottom-right
  { angle: 90, radius: 36 },    // bottom
  { angle: 150, radius: 36 },   // bottom-left
  { angle: 210, radius: 36 },   // top-left
];

function getOrbitXY(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

const FeaturesSection = () => {
  const [active, setActive] = useState<number | null>(null);

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

        {/* === ORBIT LAYOUT (desktop) === */}
        <div className="hidden lg:flex items-center justify-center" style={{ minHeight: "700px" }}>
          <div className="relative" style={{ width: "700px", height: "700px" }}>

            {/* Orbit ring */}
            <div
              className="absolute rounded-full border border-border/30"
              style={{
                inset: "8%",
                opacity: 0.4,
              }}
            />
            <div
              className="absolute rounded-full border border-border/20"
              style={{
                inset: "20%",
                opacity: 0.25,
              }}
            />

            {/* Connecting lines from active node to center */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {features.map((_, i) => {
                const { x, y } = getOrbitXY(orbitPositions[i].angle, orbitPositions[i].radius);
                const isActive = active === i;
                return (
                  <motion.line
                    key={i}
                    x1="50%" y1="50%"
                    x2={`${50 + x}%`} y2={`${50 + y}%`}
                    stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    strokeDasharray={isActive ? "0" : "4 4"}
                    animate={{ opacity: isActive ? 0.8 : 0.15 }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </svg>

            {/* Center hub */}
            <div
              className="absolute flex flex-col items-center justify-center text-center"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <motion.div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "120px",
                  height: "120px",
                  background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)",
                  border: "1px solid hsl(var(--primary) / 0.3)",
                }}
                animate={{
                  boxShadow: active !== null
                    ? "0 0 60px hsl(var(--primary) / 0.2)"
                    : "0 0 30px hsl(var(--primary) / 0.1)",
                }}
              >
                <span
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "1.5rem",
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Greet
                </span>
              </motion.div>

              {/* Active feature description in center */}
              <AnimatePresence mode="wait">
                {active !== null && (
                  <motion.p
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-muted-foreground text-center leading-relaxed"
                    style={{
                      fontSize: "var(--text-body)",
                      maxWidth: "220px",
                      marginTop: "var(--space-s)",
                    }}
                  >
                    {features[active].desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Orbit nodes */}
            {features.map((f, i) => {
              const { x, y } = getOrbitXY(orbitPositions[i].angle, orbitPositions[i].radius);
              const isActive = active === i;

              return (
                <motion.div
                  key={f.title}
                  className="absolute flex flex-col items-center gap-3 cursor-pointer"
                  style={{
                    left: `${50 + x}%`,
                    top: `${50 + y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 3,
                  }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                >
                  {/* Icon circle */}
                  <motion.div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: isActive ? "72px" : "64px",
                      height: isActive ? "72px" : "64px",
                      background: isActive
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--cyan) / 0.15))"
                        : "hsl(var(--card))",
                      border: isActive
                        ? "1.5px solid hsl(var(--primary) / 0.5)"
                        : "1px solid hsl(var(--border) / 0.4)",
                      transition: "all 0.3s ease",
                    }}
                    animate={{
                      boxShadow: isActive
                        ? "0 0 40px hsl(var(--primary) / 0.25)"
                        : "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <f.icon
                      size={isActive ? 26 : 22}
                      className={isActive ? "text-primary" : "text-muted-foreground"}
                      strokeWidth={2}
                      style={{ transition: "all 0.3s ease" }}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className="text-center font-semibold whitespace-nowrap"
                    style={{
                      fontSize: "0.85rem",
                      color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      transition: "color 0.3s ease",
                      maxWidth: "130px",
                      whiteSpace: "normal",
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

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
