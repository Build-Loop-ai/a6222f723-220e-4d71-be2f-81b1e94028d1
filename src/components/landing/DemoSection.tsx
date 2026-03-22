import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Check, Loader2 } from "lucide-react";

const DEMO_BLOBS = [
  { cx: 0.15, cy: 0.25, color: [52, 215, 123], speed: 0.45, phase: 0, drift: 0.3 },
  { cx: 0.85, cy: 0.65, color: [0, 194, 224], speed: 0.40, phase: 1.5, drift: 0.32 },
  { cx: 0.5, cy: 0.85, color: [52, 215, 123], speed: 0.50, phase: 3.0, drift: 0.26 },
  { cx: 0.7, cy: 0.2, color: [0, 180, 200], speed: 0.42, phase: 4.5, drift: 0.34 },
  { cx: 0.35, cy: 0.5, color: [80, 200, 180], speed: 0.48, phase: 5.8, drift: 0.28 },
];


function useCanvasBlobs(blobs: typeof DEMO_BLOBS) {
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

      for (const blob of blobs) {
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
  }, [blobs]);

  return canvasRef;
}

const pages = [
  "Home", "Services", "Pricing", "Contact", "About", "FAQ", "Team", "Blog",
  "Testimonials", "Careers", "Locations", "Gallery", "Appointments", "Insurance",
  "Emergency", "Hygiene", "Implants", "Orthodontics", "Whitening", "Pediatric",
  "Cosmetic", "Crowns", "Root Canal", "Dentures",
];

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DemoSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const bgCanvasRef = useCanvasBlobs(DEMO_BLOBS);
  
  const [crawlPhase, setCrawlPhase] = useState<"idle" | "crawling" | "done">("idle");
  const [visiblePages, setVisiblePages] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    setCrawlPhase("crawling");
    const interval = setInterval(() => {
      setVisiblePages((prev) => {
        if (prev >= pages.length) {
          clearInterval(interval);
          setCrawlPhase("done");
          return prev;
        }
        return prev + 1;
      });
    }, 140);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        background: "#050506",
      }}
    >
      {/* Background canvas blobs */}
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.08 }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <div className="container-large relative z-10">
        {/* Two-column layout: left heading, right demo */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] items-start"
          style={{ gap: "var(--space-xl)" }}
        >
          {/* Left column — heading + context */}
          <div className="flex flex-col justify-center lg:sticky lg:top-32">
            <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-m)" }}>
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
                Live Demo
              </span>
            </div>

            <h2
              className="text-foreground tracking-tight"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 4rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "var(--space-m)",
              }}
            >
              Watch it
              <br />
              <span className="relative inline-block overflow-hidden" style={{ isolation: "isolate" }}>
                <canvas
                  ref={useCanvasBlobs(BUTTON_BLOBS)}
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
                  learn.
                </span>
              </span>
            </h2>

            <p
              className="text-muted-foreground leading-relaxed"
              style={{
                fontSize: "var(--text-body-lg)",
                maxWidth: "380px",
                marginBottom: "var(--space-l)",
              }}
            >
              Greet crawls your entire website in seconds — every page, every service, every FAQ — and deploys a ready agent.
            </p>

            {/* Stats row */}
            <div className="flex gap-6" style={{ marginBottom: "var(--space-l)" }}>
              {[
                { value: "24", unit: "pages", label: "learned" },
                { value: "<5s", unit: "", label: "crawl time" },
                { value: "100%", unit: "", label: "accuracy" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="font-black text-foreground"
                    style={{ fontSize: "clamp(1.5rem, 2vw, 2rem)", lineHeight: 1 }}
                  >
                    {stat.value}
                    {stat.unit && (
                      <span className="text-primary font-medium" style={{ fontSize: "0.5em" }}>
                        {" "}{stat.unit}
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "var(--text-small)" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link to="/signup" className="self-start">
              <button
                className="group inline-flex items-center gap-3 font-medium transition-all duration-300 hover:scale-[0.98] active:scale-[0.965]"
                style={{
                  padding: "14px 28px",
                  fontSize: "var(--text-body)",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
                  color: "hsl(var(--primary-foreground))",
                  boxShadow: "0 4px 30px hsl(var(--green-glow))",
                }}
              >
                Try with your website
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Right column — the crawl visualization */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2 px-5 py-3.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>
                <div
                  className="ml-3 flex-1 flex items-center gap-2 px-3 py-1 rounded-md font-mono"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "11px",
                    color: "rgba(248,246,240,0.4)",
                  }}
                >
                  <Globe size={11} className="opacity-40" />
                  vandermolen-tandartsen.nl
                </div>
              </div>

              {/* Terminal-style crawl output */}
              <div className="p-6 md:p-8" style={{ minHeight: "420px" }}>
                {/* URL input row */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex-1 px-4 py-2.5 rounded-lg font-mono text-sm text-foreground/70"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    https://vandermolen.nl
                  </div>
                  <motion.div
                    className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
                    style={{
                      background: crawlPhase === "done"
                        ? "rgba(52, 215, 123, 0.15)"
                        : "rgba(52, 215, 123, 0.1)",
                      color: "hsl(var(--primary))",
                      border: "1px solid rgba(52, 215, 123, 0.2)",
                    }}
                    animate={crawlPhase === "crawling" ? { opacity: [1, 0.6, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {crawlPhase === "crawling" && <Loader2 size={13} className="animate-spin" />}
                    {crawlPhase === "done" && <Check size={13} />}
                    {crawlPhase === "idle" ? "Start" : crawlPhase === "crawling" ? "Crawling…" : "Done"}
                  </motion.div>
                </div>

                {/* Page list — staggered reveal */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-6">
                  {pages.slice(0, visiblePages).map((page, idx) => (
                    <motion.div
                      key={page}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: "hsl(var(--primary))" }}
                      />
                      <span
                        className="font-mono truncate"
                        style={{ fontSize: "11px", color: "rgba(248,246,240,0.5)" }}
                      >
                        /{page.toLowerCase().replace(/\s/g, "-")}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--cyan)))",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${(visiblePages / pages.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <div
                    className="flex justify-between mt-2 font-mono"
                    style={{ fontSize: "10px", color: "rgba(248,246,240,0.3)" }}
                  >
                    <span>{visiblePages} / {pages.length} pages</span>
                    <span>{crawlPhase === "done" ? "Complete" : "Scanning…"}</span>
                  </div>
                </div>

                {/* Completion message */}
                {crawlPhase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(52, 215, 123, 0.08)",
                      border: "1px solid rgba(52, 215, 123, 0.15)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(52, 215, 123, 0.2)" }}
                    >
                      <Check size={12} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>
                      {pages.length} pages learned — your agent is ready to go live.
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;