import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Mic, ArrowUpRight, UserPlus, FileText, Languages } from "lucide-react";

const features = [
  { icon: Globe, title: "Auto-learns from your site", desc: "Greet reads every page on your sitemap. When you update content, the AI updates automatically. Zero manual training." },
  { icon: Mic, title: "Voice mode", desc: "Visitors switch from text to voice inside the same widget. Same AI, spoken conversation. No phone line needed." },
  { icon: ArrowUpRight, title: "Smart page routing", desc: "When a visitor asks about pricing, Greet answers AND links them directly to the right page." },
  { icon: UserPlus, title: "Lead capture", desc: "Collect names, emails, and phone numbers naturally during conversations. Every chat is a potential conversion." },
  { icon: FileText, title: "Custom documents", desc: "Upload PDFs, pricing sheets, FAQs, internal docs. Greet learns it all and answers from your proprietary knowledge." },
  { icon: Languages, title: "22+ languages", desc: "Visitors chat in their language, Greet responds fluently. Dutch, English, German, Spanish, and 18 more." },
];

// Positions around a circle (6 items, evenly spaced starting from top)
const orbitPositions = [
  { angle: -90, radius: 42 },   // top
  { angle: -30, radius: 42 },   // top-right
  { angle: 30, radius: 42 },    // bottom-right
  { angle: 90, radius: 42 },    // bottom
  { angle: 150, radius: 42 },   // bottom-left
  { angle: 210, radius: 42 },   // top-left
];

function getOrbitXY(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

const FeaturesSection = () => {
  const [active, setActive] = useState<number | null>(null);

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
            marginBottom: "clamp(3rem, 6vw, 8rem)",
          }}
        >
          Everything your website
          <br />
          needs to <span style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>talk.</span>
        </h2>

        {/* === ORBIT LAYOUT (desktop) === */}
        <div className="hidden lg:flex items-center justify-center" style={{ minHeight: "700px" }}>
          <div className="relative" style={{ width: "700px", height: "700px" }}>

            {/* Orbit ring */}
            <div
              className="absolute rounded-full border border-border/30"
              style={{
                inset: "8%",
                opacity: 0.4,
              }}
            />
            <div
              className="absolute rounded-full border border-border/20"
              style={{
                inset: "20%",
                opacity: 0.25,
              }}
            />

            {/* Connecting lines from active node to center */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {features.map((_, i) => {
                const { x, y } = getOrbitXY(orbitPositions[i].angle, orbitPositions[i].radius);
                const isActive = active === i;
                return (
                  <motion.line
                    key={i}
                    x1="50%" y1="50%"
                    x2={`${50 + x}%`} y2={`${50 + y}%`}
                    stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    strokeDasharray={isActive ? "0" : "4 4"}
                    animate={{ opacity: isActive ? 0.8 : 0.15 }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </svg>

            {/* Center hub */}
            <div
              className="absolute flex flex-col items-center justify-center text-center"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <motion.div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "120px",
                  height: "120px",
                  background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)",
                  border: "1px solid hsl(var(--primary) / 0.3)",
                }}
                animate={{
                  boxShadow: active !== null
                    ? "0 0 60px hsl(var(--primary) / 0.2)"
                    : "0 0 30px hsl(var(--primary) / 0.1)",
                }}
              >
                <span
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "1.5rem",
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Greet
                </span>
              </motion.div>

              {/* Active feature description in center */}
              <AnimatePresence mode="wait">
                {active !== null && (
                  <motion.p
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-muted-foreground text-center leading-relaxed"
                    style={{
                      fontSize: "var(--text-body)",
                      maxWidth: "220px",
                      marginTop: "var(--space-s)",
                    }}
                  >
                    {features[active].desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Orbit nodes */}
            {features.map((f, i) => {
              const { x, y } = getOrbitXY(orbitPositions[i].angle, orbitPositions[i].radius);
              const isActive = active === i;

              return (
                <motion.div
                  key={f.title}
                  className="absolute flex flex-col items-center gap-3 cursor-pointer"
                  style={{
                    left: `${50 + x}%`,
                    top: `${50 + y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 3,
                  }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                >
                  {/* Icon circle */}
                  <motion.div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: isActive ? "72px" : "64px",
                      height: isActive ? "72px" : "64px",
                      background: isActive
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--cyan) / 0.15))"
                        : "hsl(var(--card))",
                      border: isActive
                        ? "1.5px solid hsl(var(--primary) / 0.5)"
                        : "1px solid hsl(var(--border) / 0.4)",
                      transition: "all 0.3s ease",
                    }}
                    animate={{
                      boxShadow: isActive
                        ? "0 0 40px hsl(var(--primary) / 0.25)"
                        : "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <f.icon
                      size={isActive ? 26 : 22}
                      className={isActive ? "text-primary" : "text-muted-foreground"}
                      strokeWidth={2}
                      style={{ transition: "all 0.3s ease" }}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className="text-center font-semibold whitespace-nowrap"
                    style={{
                      fontSize: "0.85rem",
                      color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      transition: "color 0.3s ease",
                      maxWidth: "130px",
                      whiteSpace: "normal",
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* === MOBILE LAYOUT === */}
        <div className="lg:hidden flex flex-col" style={{ gap: "var(--space-m)" }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-start gap-4 rounded-xl"
              style={{
                padding: "var(--space-card)",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border) / 0.3)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}
              >
                <f.icon size={20} className="text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="font-bold text-foreground tracking-tight" style={{ fontSize: "var(--text-body-lg)", marginBottom: "4px" }}>
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
