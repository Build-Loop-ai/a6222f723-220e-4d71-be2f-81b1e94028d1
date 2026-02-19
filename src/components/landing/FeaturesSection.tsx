import { motion } from "framer-motion";
import { Globe, Mic, ArrowUpRight, UserPlus, FileText, Languages } from "lucide-react";

const features = [
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training." },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed." },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page. Navigation built into conversation." },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion." },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge." },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 md:py-40 overflow-hidden">
      {/* Split-tone ambient orbs */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 600px 600px at 15% 40%, rgba(52,215,123,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 600px 600px at 85% 60%, rgba(0,194,224,0.05) 0%, transparent 70%),
          #050506
        `,
      }} />

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
            transition={{ delay: 0.1 }}
            className="font-display font-[700] leading-[1.1] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(36px, 5vw, 44px)" }}
          >
            Everything your website needs to talk
          </motion.h2>
        </div>

        {/* Feature grid: 2 cols, 3 rows */}
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="glass rounded-[20px] p-9 group transition-all duration-300 hover:border-[rgba(255,255,255,0.14)]"
              style={{ cursor: "default" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(52,215,123,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6"
                style={{ background: "rgba(52,215,123,0.10)", border: "1px solid rgba(52,215,123,0.12)" }}
              >
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-[700] text-foreground mb-2 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[15px] text-[hsl(240,4%,65%)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
