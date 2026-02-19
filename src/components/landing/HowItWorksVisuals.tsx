import { motion } from "framer-motion";

export const ConnectVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4">
    <div className="relative flex items-center gap-3 md:gap-5">
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative"
      >
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}>
          <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        </div>
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap font-medium font-mono tracking-wider uppercase">Your Website</p>
      </motion.div>
      
      <div className="relative flex items-center">
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }} className="w-8 md:w-12 h-0.5 rounded-full origin-left" style={{ background: "linear-gradient(90deg, hsl(148 68% 52%), hsl(190 100% 44%))" }} />
        <motion.div animate={{ x: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-md shadow-primary/50" />
      </div>

      <motion.div
        initial={{ x: 30, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
        className="relative"
      >
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, hsl(190 100% 44%) 0%, hsl(148 68% 52%) 100%)" }}>
          <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap font-medium font-mono tracking-wider uppercase">AI Widget</p>
      </motion.div>
    </div>
  </div>
);

export const CustomizeVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden">
    <div className="w-full max-w-[220px] space-y-2">
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass rounded-xl p-2.5">
        <div className="text-[9px] text-muted-foreground mb-1.5 uppercase tracking-wider font-mono">Accent Color</div>
        <div className="flex items-center gap-2">
          {["hsl(148 68% 52%)", "hsl(190 100% 44%)", "hsl(270 70% 55%)", "hsl(350 80% 55%)"].map((c, i) => (
            <div key={i} className={`w-7 h-7 rounded-lg ${i === 0 ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`} style={{ background: c }} />
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="glass rounded-xl p-2.5">
        <div className="text-[9px] text-muted-foreground mb-1.5 uppercase tracking-wider font-mono">Welcome Message</div>
        <div className="text-xs text-foreground">Hi! Hoe kan ik je helpen? 👋</div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="glass rounded-xl p-2.5">
        <div className="text-[9px] text-muted-foreground mb-2 uppercase tracking-wider font-mono">Position</div>
        <div className="flex gap-2">
          {["Bottom Right", "Bottom Left"].map((pos, i) => (
            <div key={i} className={`flex-1 text-center text-[10px] py-1.5 rounded-lg transition-colors ${i === 0 ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground border border-foreground/8"}`}>
              {pos}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export const LaunchVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, type: "spring" }} className="relative w-full max-w-[220px]">
      {/* Live indicator */}
      <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-md shadow-primary/30">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-foreground"></span>
        </span>
        <span className="text-[9px] font-bold tracking-wider font-mono">LIVE</span>
      </motion.div>

      <div className="glass rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-foreground block">Conversations</span>
            <span className="text-[9px] text-muted-foreground font-mono">Real-time</span>
          </div>
          <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, type: "spring" }} className="text-xl font-bold text-foreground font-display">
            47
          </motion.span>
        </div>

        <div className="flex items-end gap-1 h-12">
          {[35, 55, 25, 75, 45, 85, 65, 40, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
              className="flex-1 rounded-sm"
              style={{ background: "linear-gradient(180deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-foreground/8">
          {[
            { label: "Leads", value: "12", color: "text-primary" },
            { label: "Resolved", value: "96%", color: "text-cyan" },
            { label: "Avg", value: "1.2s", color: "text-primary" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 + i * 0.1 }} className="text-center">
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-muted-foreground block font-mono">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);
