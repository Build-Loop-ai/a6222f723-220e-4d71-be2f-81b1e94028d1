import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import { Link } from "react-router-dom";

const pages = ["Home", "Services", "Pricing", "Contact", "About", "FAQ", "Team", "Blog", "Testimonials", "Careers", "Locations", "Gallery", "Appointments", "Insurance", "Emergency", "Hygiene", "Implants", "Orthodontics", "Whitening", "Pediatric", "Cosmetic", "Crowns", "Root Canal", "Dentures"];

const DemoSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.4,
    })),
  []);

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      {/* THE MOST IMMERSIVE SECTION — deep green underwater feel */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, #070810 0%, #082A16 25%, #0A3520 50%, #082A16 75%, #070810 100%)",
      }} />

      {/* Giant centered glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1000px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(52,215,123,0.20) 0%, rgba(0,194,224,0.06) 30%, transparent 65%)",
          y: bgY,
        }}
      />

      {/* Side accents */}
      <div className="absolute top-0 left-[-200px] w-[500px] h-full pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(0,194,224,0.08) 0%, transparent 70%)",
      }} />
      <div className="absolute top-0 right-[-200px] w-[500px] h-full pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(52,215,123,0.08) 0%, transparent 70%)",
      }} />

      {/* Floating particles — underwater effect */}
      <div className="particles-container">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Separator glow */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(52,215,123,0.4) 50%, transparent 95%)" }} />

      <div className="max-w-[1140px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label justify-center mb-5">
            Live Demo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-[700] leading-[1.1] tracking-[-0.02em] text-foreground mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            See it in action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Watch Greet learn a real website in real-time.
          </motion.p>
        </div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-[28px] overflow-hidden border-glow" style={{ border: "1px solid rgba(52,215,123,0.15)", background: "rgba(255,255,255,0.03)" }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-4" style={{ background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
              <div className="ml-3 flex-1 px-4 py-1.5 rounded-lg font-mono text-[11px] text-muted-foreground" style={{ background: "rgba(255,255,255,0.03)" }}>
                vandermolen-tandartsen.nl
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12" style={{ background: "linear-gradient(180deg, #0D0D0F 0%, #111113 100%)" }}>
              {/* URL input */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 px-4 py-3 rounded-xl text-sm text-foreground glass">
                  vandermolen.nl
                </div>
                <div className="px-5 py-3 rounded-xl text-sm font-medium" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)", color: "white" }}>
                  Start
                </div>
              </div>

              {/* Crawling visualization */}
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

              {/* Complete */}
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
              className="px-8 py-4 rounded-[14px] text-base font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)",
                boxShadow: "0 4px 30px hsla(148, 68%, 52%, 0.4)",
              }}
            >
              Try it with your own website →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
