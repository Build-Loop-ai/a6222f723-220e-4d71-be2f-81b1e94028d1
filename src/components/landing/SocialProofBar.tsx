const logos = [
  "Dental365",
  "VanderMolen",
  "KLM Cargo",
  "BrightSmile",
  "NextLevel Agency",
  "PureWellness",
  "TechFirst",
  "HealthHub",
];

const SocialProofBar = () => {
  const doubled = [...logos, ...logos];

  return (
    <div className="w-full overflow-hidden py-6 md:py-8">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((logo, i) => (
          <div key={i} className="mx-8 md:mx-12 flex-shrink-0 flex items-center">
            <span className="text-sm md:text-base font-semibold text-muted-foreground/40 tracking-wide uppercase">
              {logo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialProofBar;
