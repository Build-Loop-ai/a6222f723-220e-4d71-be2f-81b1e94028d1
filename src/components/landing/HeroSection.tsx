import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquare, Send, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const HeroSection = () => {
  const { config } = useSiteConfigTransformed();

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient orbs */}
      <motion.div
        className="absolute -top-[200px] -right-[100px] w-[700px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(148 68% 52% / 0.06) 0%, transparent 65%)" }}
        animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[300px] -left-[200px] w-[800px] h-[800px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(190 100% 44% / 0.04) 0%, transparent 65%)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left – Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10"
              style={{
                background: "hsl(148 68% 52% / 0.10)",
                border: "1px solid hsl(148 68% 52% / 0.15)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              <span className="font-mono text-[10px] tracking-[2.5px] uppercase text-primary">
                Now in public beta
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-800 leading-[0.95] tracking-[-0.03em] mb-8"
              style={{ fontSize: "clamp(64px, 9vw, 120px)" }}
            >
              <span className="text-gradient-white">Your</span>
              <br />
              <span className="text-gradient-white">website,</span>
              <br />
              <span className="text-gradient">speaking.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-[520px] mx-auto lg:mx-0 mb-12 leading-relaxed"
            >
              Paste a URL. Greet crawls every page, learns your business, and deploys an AI chat widget visitors can talk to. Text and voice, one&nbsp;experience.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  <span>Start Free Trial</span>
                  <motion.span className="inline-block" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="glass" size="xl" className="w-full sm:w-auto gap-2 group">
                  <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Try Demo
                </Button>
              </Link>
            </motion.div>

            {/* Meta strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex gap-12 pt-12 border-t border-foreground/8 max-w-[520px] mx-auto lg:mx-0 flex-wrap"
            >
              {[
                { label: "Setup", value: "5 min" },
                { label: "Languages", value: "22+" },
                { label: "Free trial", value: `${config.trialDays} days` },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] tracking-[2.5px] uppercase text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right – Widget mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center lg:pr-8"
          >
            <Link to="/demo" className="relative block cursor-pointer">
              <motion.div
                className="relative"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Chat widget */}
                <div
                  className="relative w-[320px] md:w-[380px] rounded-[28px] overflow-hidden"
                  style={{
                    background: "hsl(var(--surface))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Header */}
                  <div
                    className="px-7 py-5 flex items-center gap-3.5 border-b"
                    style={{
                      background: "linear-gradient(135deg, hsl(148 68% 52% / 0.15) 0%, hsl(190 100% 44% / 0.15) 100%)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-800 text-base text-primary-foreground"
                      style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}
                    >
                      G
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display text-sm font-700 text-foreground">Van der Molen</h4>
                      <div className="flex items-center gap-1.5 text-xs text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                        Online
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="px-7 py-6 space-y-3" style={{ background: "linear-gradient(180deg, hsl(240 7% 4%) 0%, hsl(240 7% 3%) 100%)" }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                      <div className="max-w-[85%] px-[18px] py-[14px] rounded-[18px] rounded-bl-[6px] text-sm leading-relaxed text-foreground" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        Hi! Hoe kan ik je helpen? 👋
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex justify-end">
                      <div className="max-w-[85%] px-[18px] py-[14px] rounded-[18px] rounded-br-[6px] text-sm leading-relaxed text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}>
                        Wat kost een kroon?
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
                      <div className="max-w-[85%] px-[18px] py-[14px] rounded-[18px] rounded-bl-[6px] text-sm leading-relaxed text-foreground" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        Een kroon kost tussen €350 en €750. Zal ik een afspraak inplannen?
                      </div>
                    </motion.div>
                  </div>

                  {/* Input */}
                  <div className="px-5 py-4 flex items-center gap-3 border-t" style={{ background: "hsl(var(--surface))", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex-1 px-4 py-3 rounded-xl text-xs text-muted-foreground" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      Stel een vraag...
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(148 68% 52% / 0.10)", border: "1px solid hsl(148 68% 52% / 0.15)" }}>
                      <Send className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating card left */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -left-8 md:-left-24 top-1/4 hidden sm:block"
              >
                <div className="glass rounded-2xl p-4 max-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">Booked</p>
                      <p className="text-xs text-muted-foreground truncate">Thu, 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating card right */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="absolute -right-12 md:-right-28 bottom-1/3 hidden sm:block"
              >
                <div className="glass rounded-2xl p-4 max-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">Visitor helped</p>
                      <p className="text-xs text-muted-foreground truncate">Just now</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
