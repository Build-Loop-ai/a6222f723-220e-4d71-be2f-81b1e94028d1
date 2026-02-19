const logos = Array.from({ length: 8 }, (_, i) => `Client ${i + 1}`);

const SocialProofBar = () => {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-background">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

      <div className="max-w-[1140px] mx-auto px-6 md:px-12 mb-8">
        <p className="text-center text-sm font-medium text-[hsl(240,4%,45%)]">
          Trusted by 200+ businesses across Europe
        </p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((name, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 mx-4 px-8 py-3 rounded-full text-sm font-medium text-[hsl(240,4%,45%)]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {name}
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
};

export default SocialProofBar;
