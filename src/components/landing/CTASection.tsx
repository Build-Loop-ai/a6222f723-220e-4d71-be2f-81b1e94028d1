import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import ContactDialog from "./ContactDialog";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CTASection = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section style={{ paddingTop: "var(--space-section-y)", paddingBottom: "var(--space-section-y)", background: "#050506" }}>
      <div className="container-large">
        <div
          className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] overflow-hidden"
          style={{ minHeight: "auto", background: "hsl(var(--card))", borderRadius: "1rem", boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)" }}
        >
          {/* Left: Dark card */}
          <motion.div
            className="relative flex flex-col"
            style={{
              background: "hsl(148 50% 8%)",
              padding: "var(--space-xl)",
              borderRadius: "1rem",
              zIndex: 1,
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            {/* Icon */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)" }}
              >
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            <div className="flex flex-col" style={{ gap: "var(--space-s)" }}>
              <h2 className="font-bold tracking-tight" style={{ fontSize: "var(--text-h3)", lineHeight: 1.15, color: "hsl(var(--foreground))" }}>
                Give your website a voice.
              </h2>
              <p className="leading-relaxed" style={{ fontSize: "var(--text-body)", color: "hsl(var(--muted-foreground))", maxWidth: "var(--prose-max)", marginBottom: "1rem" }}>
                Join 200+ businesses that turned their website into a conversation. Start your free trial today.
              </p>
            </div>

            {/* Contact details */}
            <div className="flex-col mt-auto mb-8 flex items-start gap-3" style={{ gap: "var(--space-xs)" }}>
              <button
                onClick={() => setContactOpen(true)}
                className="group/link relative inline-flex items-center gap-2 pb-0.5 text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: "var(--text-body-lg)" }}
              >
                <Mail size={16} /> <span>Contact us</span>
              </button>
            </div>

            {/* CTA button */}
            <Link
              to="/signup"
              className="group inline-flex items-center justify-between gap-5 w-full font-medium transition-transform duration-300 hover:scale-[0.98] active:scale-[0.965]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
                color: "hsl(var(--primary-foreground))",
                padding: "14px 24px",
                fontSize: "var(--text-body)",
                borderRadius: "8px",
              }}
            >
              Start Free Trial
              <span
                className="w-9 h-9 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
                style={{ background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}
              >
                <ArrowRight size={16} className="text-primary-foreground" />
              </span>
            </Link>
          </motion.div>

          {/* Right: Stats / info */}
          <motion.div
            className="flex flex-col justify-center"
            style={{ padding: "var(--space-xl)", gap: "var(--space-l)" }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
          >
            <div style={{ marginBottom: "var(--space-s)" }}>
              <h3 className="font-bold tracking-tight text-foreground" style={{ fontSize: "var(--text-h3)" }}>
                Ready in 5 minutes
              </h3>
              <p className="text-muted-foreground mt-2" style={{ fontSize: "var(--text-body)" }}>
                No credit card required. 14-day free trial. Cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "var(--space-m)" }}>
              {[
                { value: "5 min", label: "Setup time" },
                { value: "22+", label: "Languages" },
                { value: "24/7", label: "Always online" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg" style={{ padding: "var(--space-card)", background: "rgba(255,255,255,0.03)" }}>
                  <span className="block font-display font-[800] text-primary" style={{ fontSize: "var(--text-h3)" }}>
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "var(--text-small)" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap" style={{ gap: "var(--space-s)", marginTop: "var(--space-m)" }}>
              {["Auto-learns your site", "Voice + Chat", "Lead capture", "Custom branding"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-primary px-3 py-1.5 rounded-full"
                  style={{ background: "hsl(var(--green-dim))", border: "1px solid hsl(var(--green) / 0.15)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
};

export default CTASection;
