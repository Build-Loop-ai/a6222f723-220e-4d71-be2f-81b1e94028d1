import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { config } = useSiteConfigTransformed();

  return (
    <section ref={ref} className="py-24 md:py-40 relative overflow-hidden bg-background">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div
          className="max-w-4xl mx-auto text-center rounded-[36px] p-12 md:p-20"
          style={{
            background: "linear-gradient(135deg, hsl(148 68% 52% / 0.15) 0%, hsl(190 100% 44% / 0.15) 100%)",
            border: "1px solid hsl(148 68% 52% / 0.12)",
          }}
        >
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="section-label justify-center mb-10">
            Start today
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-800 text-gradient leading-none mb-6"
            style={{ fontSize: "clamp(80px, 12vw, 140px)" }}
          >
            {config.name.toLowerCase()}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-muted-foreground italic mb-12"
          >
            "Every website on the internet deserves a voice."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2 group">
                Start Free Trial
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="glass" size="xl">
                Try Demo First
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { label: "GDPR Compliant", icon: "🔒" },
              { label: "99.9% Uptime", icon: "⚡" },
              { label: "24/7 Support", icon: "💬" },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
