import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";

const stats = [
  { number: "200+", label: "BUSINESSES USING GREET" },
  { number: "5 min", label: "SETUP TIME" },
  { number: "24/7", label: "ALWAYS ONLINE" },
];

const introText =
  "Greet crawls your entire website, learns your business, and deploys a smart AI chat and voice widget that turns every visitor into a conversation.";
const introWords = introText.split(" ");

// Canvas blob configurations for stat cards — adapted to green/cyan palette
const CARD_BLOBS = [
  [
    { cx: 0.2, cy: 0.3, color: [52, 215, 123], speed: 0.45, phase: 0, drift: 0.3 },
    { cx: 0.8, cy: 0.6, color: [0, 194, 224], speed: 0.4, phase: 1.5, drift: 0.32 },
    { cx: 0.5, cy: 0.8, color: [52, 215, 123], speed: 0.5, phase: 3.0, drift: 0.26 },
    { cx: 0.3, cy: 0.5, color: [0, 180, 200], speed: 0.42, phase: 4.5, drift: 0.34 },
  ],
  [
    { cx: 0.7, cy: 0.2, color: [0, 194, 224], speed: 0.42, phase: 0.5, drift: 0.32 },
    { cx: 0.3, cy: 0.7, color: [52, 215, 123], speed: 0.48, phase: 2.0, drift: 0.3 },
    { cx: 0.6, cy: 0.5, color: [80, 200, 180], speed: 0.38, phase: 3.5, drift: 0.35 },
    { cx: 0.4, cy: 0.3, color: [0, 194, 224], speed: 0.45, phase: 5.0, drift: 0.28 },
  ],
  [
    { cx: 0.5, cy: 0.4, color: [52, 215, 123], speed: 0.45, phase: 1.0, drift: 0.3 },
    { cx: 0.2, cy: 0.7, color: [0, 194, 224], speed: 0.4, phase: 2.5, drift: 0.28 },
    { cx: 0.8, cy: 0.3, color: [52, 215, 123], speed: 0.5, phase: 4.0, drift: 0.26 },
    { cx: 0.4, cy: 0.6, color: [80, 220, 160], speed: 0.42, phase: 0.3, drift: 0.34 },
  ],
];

const StatCard = ({
  stat,
  index,
}: {
  stat: { number: string; label: string };
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const hovered = useRef(false);
  const hoverStrength = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;
    const blobs = CARD_BLOBS[index % CARD_BLOBS.length];

    const draw = () => {
      t += 0.055;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const lerpSpeed = 0.06;
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * lerpSpeed;
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * lerpSpeed;

      const targetStrength = hovered.current ? 1 : 0;
      hoverStrength.current += (targetStrength - hoverStrength.current) * 0.04;

      for (const blob of blobs) {
        const waveCx =
          Math.sin(t * blob.speed + blob.phase) * blob.drift +
          Math.sin(t * blob.speed * 2.3 + blob.phase * 0.7) * blob.drift * 0.3;
        const waveCy =
          Math.cos(t * blob.speed * 0.8 + blob.phase + 1) * blob.drift +
          Math.cos(t * blob.speed * 1.9 + blob.phase * 1.3) * blob.drift * 0.25;

        let repelX = 0;
        let repelY = 0;
        if (hoverStrength.current > 0.001) {
          const blobWorldX = blob.cx + waveCx;
          const blobWorldY = blob.cy + waveCy;
          const dx = blobWorldX - smoothMouse.current.x;
          const dy = blobWorldY - smoothMouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const strength = (0.15 / (dist + 0.3)) * hoverStrength.current;
          repelX = (dx / dist) * strength;
          repelY = (dy / dist) * strength;
        }

        const cx = w * (blob.cx + waveCx + repelX);
        const cy = h * (blob.cy + waveCy + repelY);
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

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
      }
    };
    resize();
    draw();

    return () => cancelAnimationFrame(raf);
  }, [index]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouse.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      mouse.current = { x: nx, y: ny };
      smoothMouse.current = { x: nx, y: ny };
    }
    setIsHovered(true);
    hovered.current = true;
    hoverStrength.current = 0;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    hovered.current = false;
    mouse.current = { x: 0.5, y: 0.5 };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className="relative aspect-square"
      style={{ minHeight: "180px" }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative aspect-square flex flex-col justify-between overflow-hidden"
        style={{
          padding: "var(--space-card)",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: isHovered
            ? "0 14px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
          transition: "box-shadow 0.4s ease-out",
        }}
      >
        {/* Animated blob behind glass */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ borderRadius: "12px" }}
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            borderRadius: "12px",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        <span
          className="relative z-10 font-black tracking-tight leading-none text-foreground"
          style={{ fontSize: "clamp(3.5rem, 3rem + 5vw, 4.5rem)" }}
        >
          {stat.number}
        </span>
        <span
          className="relative z-10 self-end text-right font-medium text-foreground/80"
          style={{ fontSize: "var(--text-small)" }}
        >
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
};

const ScrollRevealWord = ({
  word,
  progress,
}: {
  word: string;
  progress: any;
}) => {
  const opacity = useTransform(progress, [0, 1], [0.12, 1]);
  return (
    <motion.span className="inline-block mr-[0.3em]" style={{ opacity }}>
      {word}
    </motion.span>
  );
};

const IntroSection = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.85", "start 0.2"],
  });
  const overlap = 3;

  return (
    <section
      className="relative z-10"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        background: "#050506",
      }}
    >
      <div className="container-large flex flex-col" style={{ gap: "var(--space-xl)" }}>
        {/* Top row: label + text in 2-col grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_3fr]"
          style={{ gap: "var(--space-xl)" }}
        >
          {/* Left: Section label */}
          <div className="flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
              What we do
            </span>
          </div>

          {/* Right: Text — scroll-driven reveal */}
          <div
            ref={textRef}
            style={{
              fontSize: "var(--text-h2)",
              lineHeight: "1.2",
              letterSpacing: "-0.02em",
              marginBottom: "75px",
            }}
            className="font-black tracking-tight text-foreground"
          >
            {introWords.map((word, i) => {
              const start = Math.max(0, (i - overlap) / introWords.length);
              const end = Math.min(1, (i + overlap) / introWords.length);
              const progress = useTransform(scrollYProgress, [start, end], [0, 1]);
              return <ScrollRevealWord key={`${word}-${i}`} word={word} progress={progress} />;
            })}
          </div>
        </div>

        {/* Stats cards — full width row */}
        <div className="w-full md:w-[80%] md:ml-auto grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
