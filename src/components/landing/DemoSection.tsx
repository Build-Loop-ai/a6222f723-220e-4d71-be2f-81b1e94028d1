import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BUTTON_BLOBS = [
  { cx: 0.2, cy: 0.4, color: [52, 215, 123], speed: 0.45, phase: 0, drift: 0.3 },
  { cx: 0.8, cy: 0.5, color: [0, 194, 224], speed: 0.40, phase: 1.5, drift: 0.32 },
  { cx: 0.5, cy: 0.6, color: [80, 200, 180], speed: 0.50, phase: 3.0, drift: 0.26 },
  { cx: 0.35, cy: 0.3, color: [0, 180, 200], speed: 0.42, phase: 4.5, drift: 0.34 },
];

function AnimatedGradientButton({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
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

      for (const blob of BUTTON_BLOBS) {
        const cx = w * (blob.cx + Math.sin(t * blob.speed + blob.phase) * blob.drift
          + Math.sin(t * blob.speed * 2.1 + blob.phase * 0.7) * blob.drift * 0.3);
        const cy = h * (blob.cy + Math.cos(t * blob.speed * 0.8 + blob.phase + 1) * blob.drift
          + Math.cos(t * blob.speed * 1.7 + blob.phase * 1.3) * blob.drift * 0.25);
        const r = Math.min(w, h) * (1.2 + Math.sin(t * 0.5 + blob.phase) * 0.1);

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
    <button
      className={className}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ borderRadius: "inherit" }}
      />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </button>
  );
}

const pages = [
  "Home", "Services", "Pricing", "Contact", "About", "FAQ", "Team", "Blog",
  "Testimonials", "Careers", "Locations", "Gallery", "Appointments", "Insurance",
  "Emergency", "Hygiene", "Implants", "Orthodontics", "Whitening", "Pediatric",
  "Cosmetic", "Crowns", "Root Canal", "Dentures",
];

const DemoSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        background: "#050506",
      }}
    >
      <div className="container-large">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center gap-2.5 justify-center" style={{ marginBottom: "var(--space-m)" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
              Live Demo
            </span>
          </div>
          <h2 className="heading-2 text-foreground mb-4">See it in action</h2>
          <p className="body-text text-muted-foreground">
            Watch Greet learn a real website in real-time.
          </p>
        </div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(52,215,123,0.12)",
              background: "hsl(var(--card))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Browser bar */}
            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
              <div
                className="ml-3 flex-1 px-4 py-1.5 rounded-lg font-mono text-[11px] text-muted-foreground"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                vandermolen-tandartsen.nl
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 px-4 py-3 rounded-xl text-sm text-foreground" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  vandermolen.nl
                </div>
                <div
                  className="px-5 py-3 rounded-xl text-sm font-medium text-primary-foreground"
                  style={{ background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)" }}
                >
                  Start
                </div>
              </div>

              <div className="space-y-2 mb-8 max-h-[300px] overflow-hidden">
                {pages.map((page, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + idx * 0.12, duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-primary text-xs">●</span>
                    <span className="text-sm text-muted-foreground">{page}...</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + pages.length * 0.12 + 0.5 }}
                className="text-primary text-sm font-medium"
              >
                ✓ {pages.length} pages learned. Your agent is ready.
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/signup">
            <button
              className="group inline-flex items-center gap-3 font-medium transition-transform duration-300 hover:scale-[0.98] active:scale-[0.965]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
                color: "hsl(var(--primary-foreground))",
                padding: "14px 28px",
                fontSize: "var(--text-body)",
                borderRadius: "10px",
                boxShadow: "0 4px 30px hsl(var(--green-glow))",
              }}
            >
              Try it with your own website
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
