import { motion } from "framer-motion";

const logos = Array.from({ length: 8 }, (_, i) => `Client ${i + 1}`);

const SocialProofBar = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Immersive transition from hero — green atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          linear-gradient(180deg, #070810 0%, #0A0F0D 50%, #070810 100%)
        `,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 1000px 400px at 50% 50%, rgba(52,215,123,0.06) 0%, transparent 70%)",
      }} />

      {/* Top separator glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(52,215,123,0.3) 50%, transparent 90%)" }} />

      <div className="max-w-[1140px] mx-auto px-6 md:px-12 mb-10 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-muted-foreground"
        >
          Trusted by 200+ businesses across Europe
        </motion.p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((name, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 mx-4 px-8 py-3 rounded-full text-sm font-medium text-muted-foreground glass"
            >
              {name}
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10" style={{ background: "linear-gradient(to right, #070810, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10" style={{ background: "linear-gradient(to left, #070810, transparent)" }} />
      </div>
    </section>
  );
};

export default SocialProofBar;
