import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ConnectVisual, CustomizeVisual, LaunchVisual } from "./HowItWorksVisuals";

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    { number: "01", title: "Connect", headline: "Add your website in 2 minutes", description: "Enter your website URL and our AI crawls your content automatically. It learns everything about your business — no manual training needed.", visual: "connect" },
    { number: "02", title: "Customize", headline: "Make it match your brand", description: "Choose colors, set a welcome message, and configure the chat personality. Your widget blends seamlessly into your website design.", visual: "customize" },
    { number: "03", title: "Launch", headline: "Go live with one line of code", description: "Copy a single script tag and paste it into your website. Your AI assistant starts engaging visitors immediately.", visual: "launch" },
  ];

  return (
    <section ref={containerRef} className="relative py-32 md:py-40 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-5">
            How It Works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-700 leading-[1.1] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Three steps to <span className="text-gradient">engagement</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Progress line */}
          <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px bg-foreground/8 hidden md:block">
            <motion.div className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-cyan to-primary" style={{ height: lineHeight }} />
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`relative grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 md:mb-32 last:mb-0 ${idx % 2 === 1 ? "md:direction-rtl" : ""}`}
            >
              {/* Number */}
              <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 z-20`}>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-14 h-14 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-lg"
                >
                  <span className="text-lg font-display text-primary">{step.number}</span>
                </motion.div>
              </div>

              {/* Content */}
              <div className={`pl-20 md:pl-0 ${idx % 2 === 1 ? "md:text-right md:pr-16 md:order-2" : "md:pr-16"}`}>
                <span className="section-label mb-3 block">{step.title}</span>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-700 text-foreground mt-3 mb-4 leading-tight tracking-[-0.02em]">{step.headline}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
              </div>

              {/* Visual */}
              <div className={`pl-20 md:pl-0 ${idx % 2 === 1 ? "md:pl-16 md:order-1" : "md:pl-16"}`}>
                <div className="relative aspect-[4/3] glass rounded-[28px] overflow-hidden">
                  {step.visual === "connect" && <ConnectVisual />}
                  {step.visual === "customize" && <CustomizeVisual />}
                  {step.visual === "launch" && <LaunchVisual />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
