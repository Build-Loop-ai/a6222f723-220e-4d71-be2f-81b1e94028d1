import { motion } from "framer-motion";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const features = [
  { num: "01", title: "Sitemap Crawling", desc: "Paste URL, Greet reads every page. Knowledge base built automatically. Updates when content changes." },
  { num: "02", title: "Custom Documents", desc: "Upload PDFs, docs, spreadsheets. Internal pricing, FAQs, policies. Greet learns it all." },
  { num: "03", title: "Smart Page Routing", desc: "Visitor asks about pricing? Greet answers AND links to the pricing page. Contextual navigation built in." },
  { num: "04", title: "Voice Mode", desc: "Toggle from text to voice inside the chat widget. Same brain, spoken conversation. No phone number needed." },
  { num: "05", title: "Lead Capture", desc: "Collect name, email, phone during conversations. Push to CRM. Every chat is a potential conversion." },
  { num: "06", title: "Multi-tenant Dashboard", desc: "Manage all client websites from one dashboard. Usage analytics, conversation logs, knowledge management." },
];

const FeaturesSection = () => {
  const { config } = useSiteConfigTransformed();

  return (
    <section id="features" className="relative py-32 md:py-40 overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-5">
            Product Definition
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-700 leading-[1.1] tracking-[-0.02em] text-foreground mb-5"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Core features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[17px] text-muted-foreground max-w-[640px] leading-relaxed"
          >
            What {config.name} does out of the box. Every feature should feel native, instant, and zero-effort for both the owner and the visitor.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className="glass rounded-[20px] p-9 group"
            >
              <span className="font-mono text-[10px] tracking-[2px] text-muted-foreground mb-5 block">{f.num}</span>
              <h3 className="font-display text-[17px] font-700 tracking-[-0.01em] text-foreground mb-2.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-5"
        >
          <div className="glass rounded-[28px] p-10 md:p-14">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                { metric: "2,847", label: "Conversations this month" },
                { metric: "1.2s", label: "Avg response time" },
                { metric: "94%", label: "Visitors rated helpful" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display font-800 text-gradient mb-2" style={{ fontSize: "36px" }}>
                    {stat.metric}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
