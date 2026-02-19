import { motion, useScroll, useTransform } from "framer-motion";
import { Globe, Mic, ArrowUpRight, UserPlus, FileText, Languages } from "lucide-react";
import { useRef } from "react";

const features = [
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training." },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed." },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page. Navigation built into conversation." },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion." },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge." },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more." },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const leftOrbX = useTransform(scrollYProgress, [0, 1], ["-10%", "5%"]);
  const rightOrbX = useTransform(scrollYProgress, [0, 1], ["10%", "-5%"]);

  return (
    <section ref={sectionRef} id="features" className="relative py-32 md:py-44 overflow-hidden">
      {/* BOLD SPLIT-TONE BACKGROUND — cyan left, green right */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, #070810 0%, #070D12 30%, #080F14 50%, #070D12 70%, #070810 100%)",
      }} />

      {/* Cyan aurora — left */}
      <motion.div
        className="absolute top-[10%] left-[-200px] w-[800px] h-[800px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,194,224,0.15) 0%, rgba(0,194,224,0.03) 40%, transparent 65%)",
          x: leftOrbX,
        }}
      />

      {/* Green aurora — right */}
      <motion.div
        className="absolute bottom-[10%] right-[-200px] w-[800px] h-[800px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(52,215,123,0.12) 0%, rgba(52,215,123,0.02) 40%, transparent 65%)",
          x: rightOrbX,
        }}
      />

      {/* Horizontal glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(0,194,224,0.2) 50%, transparent 90%)" }} />

      <div className="max-w-[1140px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-5">
            Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-[700] leading-[1.1] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            Everything your website needs to talk
          </motion.h2>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                y: -6,
                boxShadow: "0 0 60px rgba(0,194,224,0.08), 0 20px 60px rgba(0,0,0,0.3)",
                borderColor: "rgba(255,255,255,0.14)",
              }}
              className="glass rounded-[20px] p-9 group transition-all duration-500 cursor-default"
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6"
                style={{ background: "rgba(0,194,224,0.10)", border: "1px solid rgba(0,194,224,0.12)" }}
              >
                <f.icon className="w-5 h-5 text-cyan" />
              </div>
              <h3 className="font-display text-lg font-[700] text-foreground mb-2 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
