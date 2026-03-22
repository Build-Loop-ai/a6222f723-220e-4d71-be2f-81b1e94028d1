import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

type FeatureSignalMapProps = {
  features: FeatureItem[];
};

const desktopCards = [
  {
    position: "left-6 top-12",
    align: "left",
    line: "M 218 154 C 280 176, 338 220, 402 276",
    accentClass: "from-primary/18 via-primary/8 to-transparent",
  },
  {
    position: "right-6 top-16",
    align: "right",
    line: "M 718 172 C 648 190, 590 226, 512 284",
    accentClass: "from-cyan/18 via-cyan/8 to-transparent",
  },
  {
    position: "right-2 top-[244px]",
    align: "right",
    line: "M 748 322 C 658 322, 594 322, 522 322",
    accentClass: "from-primary/16 via-cyan/8 to-transparent",
  },
  {
    position: "right-10 bottom-12",
    align: "right",
    line: "M 700 486 C 632 466, 578 434, 512 366",
    accentClass: "from-cyan/18 via-primary/8 to-transparent",
  },
  {
    position: "left-8 bottom-14",
    align: "left",
    line: "M 216 474 C 282 456, 336 424, 402 366",
    accentClass: "from-primary/18 via-cyan/8 to-transparent",
  },
  {
    position: "left-0 top-[250px]",
    align: "left",
    line: "M 182 322 C 254 322, 312 322, 392 322",
    accentClass: "from-cyan/16 via-primary/8 to-transparent",
  },
] as const;

const FeatureSignalMap = ({ features }: FeatureSignalMapProps) => {
  const [active, setActive] = useState(0);

  const cards = useMemo(
    () => features.map((feature, index) => ({ ...feature, ...desktopCards[index] })),
    [features],
  );

  return (
    <div className="hidden lg:flex items-center justify-center" style={{ minHeight: "680px" }}>
      <div
        className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/40"
        style={{ width: "820px", height: "620px" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_46%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--card)/0.96))]" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle,hsl(var(--border))_1px,transparent_1.5px)] [background-size:2rem_2rem]" />
        <div className="absolute inset-[7%] rounded-[2rem] border border-border/30" />

        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 820 620" fill="none">
          <defs>
            <linearGradient id="signal-line" x1="130" y1="110" x2="676" y2="486" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0.2" />
              <stop offset="52%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--cyan))" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {cards.map((card, index) => (
            <motion.path
              key={card.title}
              d={card.line}
              stroke={active === index ? "hsl(var(--primary))" : "url(#signal-line)"}
              strokeWidth={active === index ? 2.2 : 1.1}
              strokeLinecap="round"
              strokeDasharray={active === index ? "0" : "5 9"}
              animate={{ opacity: active === index ? 0.95 : 0.34 }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </svg>

        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary/35 bg-background/90 text-center shadow-glow"
          style={{ width: "232px", height: "232px" }}
        >
          <div className="absolute inset-5 rounded-full border border-border/25" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.16),transparent_70%)]" />
          <motion.div
            key={cards[active]?.title}
            initial={{ opacity: 0.55, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24 }}
            className="relative z-10 flex flex-col items-center gap-4 px-8"
          >
            <span className="font-display text-4xl font-bold tracking-tight text-transparent bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--cyan)))] bg-clip-text">
              Greet
            </span>
            <div className="h-px w-16 bg-border/60" />
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-muted-foreground">
              Signal map
            </p>
          </motion.div>
        </div>

        <div className="absolute left-1/2 top-1/2 w-[284px] -translate-x-1/2 translate-y-[154px] rounded-[1.6rem] border border-border/50 bg-background/88 px-6 py-5 shadow-card backdrop-blur-sm">
          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Active capability
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={cards[active].title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-2"
            >
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {cards[active].title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {cards[active].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {cards.map((card, index) => {
          const isActive = active === index;
          const Icon = card.icon;

          return (
            <motion.button
              key={card.title}
              type="button"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={`absolute ${card.position} group flex w-[224px] flex-col rounded-[1.7rem] border px-5 py-5 text-left transition-all duration-300 ${
                isActive
                  ? "border-primary/45 bg-background/95 shadow-card-hover"
                  : "border-border/45 bg-background/78 hover:border-primary/30 hover:bg-background/88"
              }`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              aria-pressed={isActive}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${isActive ? "border-primary/35 bg-primary/12" : "border-border/45 bg-card/80"}`}>
                  <Icon className={isActive ? "text-primary" : "text-muted-foreground"} size={22} strokeWidth={2} />
                </div>
                <ArrowRight className={`mt-1 transition-transform duration-300 ${isActive ? "translate-x-0 text-primary" : "-translate-x-1 text-muted-foreground group-hover:translate-x-0"}`} size={16} />
              </div>

              <div className="mt-5 space-y-2">
                <h3 className="font-display text-[1.18rem] font-bold leading-tight tracking-tight text-foreground">
                  {card.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {card.desc}
                </p>
              </div>

              <div className={`mt-5 h-px w-full bg-gradient-to-r ${card.align === "left" ? `${card.accentClass} from-0% to-100%` : `${card.accentClass} rotate-180 from-0% to-100%`}`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSignalMap;
