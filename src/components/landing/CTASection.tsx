import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";

const CTASection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1.2, 1]);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.45,
    })),
  []);

  return (
    <section ref={ref} className="py-24 md:py-44 relative overflow-hidden">
      {/* Seamless dark-green atmosphere */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 120% 80% at 50% 50%, rgba(13,40,24,0.7) 0%, rgba(5,5,6,0) 70%)",
      }} />

      {/* Multiple aurora layers */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1800px] h-[1200px] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(52,215,123,0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 60%, rgba(0,194,224,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 80%, rgba(52,215,123,0.10) 0%, transparent 45%)
          `,
          scale: glowScale,
        }}
      />

      {/* Extra side glows */}
      <motion.div
        className="absolute top-0 left-[-300px] w-[700px] h-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(52,215,123,0.12) 0%, transparent 60%)" }}
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-[-300px] w-[700px] h-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(0,194,224,0.10) 0%, transparent 60%)" }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particles — dense */}
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
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(52,215,123,0.3) 30%, rgba(0,194,224,0.3) 70%, transparent 95%)" }} />

      <div className="max-w-[860px] relative z-10 mx-auto px-6 md:px-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="section-label justify-center mb-6">
          Ready to start?
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-[800] leading-[1.05] tracking-[-0.03em] text-foreground mb-6"
          style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
        >
          Give your website a voice.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-muted-foreground mb-12"
        >
          Join 200+ businesses that turned their website into a conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link to="/signup">
            <button
              className="px-12 py-5 rounded-[14px] text-lg font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)",
                boxShadow: "0 4px 40px hsla(148, 68%, 52%, 0.4), 0 0 80px hsla(148, 68%, 52%, 0.15)",
              }}
            >
              Start Free Trial →
            </button>
          </Link>
          <p className="text-sm text-muted-foreground mt-6">No credit card required. 14-day free trial.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
