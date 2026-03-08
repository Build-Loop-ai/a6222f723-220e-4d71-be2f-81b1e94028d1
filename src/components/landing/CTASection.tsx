import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-44 relative overflow-hidden">
      {/* Single static radial glow — no movement, no layers */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52,215,123,0.12) 0%, transparent 70%)",
      }} />

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
