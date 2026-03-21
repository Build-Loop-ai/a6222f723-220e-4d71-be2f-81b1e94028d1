import { motion } from "framer-motion";
import { Globe, Mic, ArrowUpRight, UserPlus, FileText, Languages } from "lucide-react";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training." },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed." },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page. Navigation built into conversation." },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion." },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge." },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.55, ease: easeOut },
  }),
};

const FeaturesSection = () => {
  return (
    <section
      id="features"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        background: "#050506",
      }}
    >
      <div className="container-large">
        {/* Tag */}
        <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-m)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
            Features
          </span>
        </div>

        {/* Large heading */}
        <h2
          className="text-foreground tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 7vw, 6rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            maxWidth: "100%",
            marginBottom: "clamp(1.75rem, 3vw, 5rem)",
          }}
        >
          Everything your website
          <br />
          needs to <span className="text-primary">talk</span>
          <span className="text-cyan">.</span>
        </h2>

        {/* Features grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:ml-auto md:max-w-[70%] md:mt-32"
          style={{ gap: "calc(var(--space-xl) * 0.6) calc(var(--space-gap) * 0.6)" }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="flex flex-col rounded-lg"
              style={{
                gap: "var(--space-s)",
                padding: "var(--space-card)",
                background: "hsl(var(--card))",
                boxShadow: "0 2px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--green-dim))" }}
              >
                <f.icon size={22} className="text-primary" strokeWidth={2.2} />
              </div>
              <h3
                className="font-bold text-foreground tracking-tight"
                style={{ fontSize: "var(--text-body-lg)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-muted-foreground leading-relaxed"
                style={{ fontSize: "var(--text-body)", maxWidth: "360px" }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
