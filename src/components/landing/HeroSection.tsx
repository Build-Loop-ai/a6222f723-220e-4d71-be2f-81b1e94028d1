import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, CheckCircle2, Sparkles, MessageSquare, Send, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const HeroSection = () => {
  const { config } = useSiteConfigTransformed();
  
  return (
    <section className="relative min-h-screen overflow-x-clip" style={{ backgroundColor: 'hsl(220 60% 10%)' }}>
      {/* Turquoise ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 130% 70% at 50% 0%, rgba(45, 212, 191, 0.25) 0%, transparent 55%),
            radial-gradient(ellipse 90% 60% at 80% 5%, rgba(45, 212, 191, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 20% 15%, rgba(94, 234, 212, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse 100% 80% at 50% 40%, rgba(45, 212, 191, 0.06) 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              <span className="text-sm text-white/80 font-medium">Trusted by {config.socialProof.customerCount} {config.socialProof.customerLabel}</span>
              <Sparkles className="w-3.5 h-3.5 text-teal" />
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[1.1] mb-6"
            >
              <span className="text-gradient-white">Your AI Website</span>
              <br />
              <span className="text-gradient-white">Assistant </span>
              <span className="italic text-teal-light">Never Sleeps</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-white/60 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Engage every visitor. Answer every question. Book every appointment.
              24/7. An AI chat assistant trained on your website, ready in minutes.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  <span>Start Free Trial</span>
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  variant="glass"
                  size="xl"
                  className="w-full sm:w-auto gap-2 group"
                >
                  <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Try Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
            >
              {[
                "No credit card required",
                "Setup in 5 minutes",
                "Cancel anytime"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/50 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal/80" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Chat Widget Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-center lg:pr-8"
          >
            <Link to="/demo" className="relative block cursor-pointer">
              <motion.div 
                className="relative"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Chat widget mockup */}
                <div 
                  className="relative w-[320px] md:w-[380px] rounded-3xl overflow-hidden"
                  style={{
                    boxShadow: `
                      0 50px 100px -20px rgba(0,0,0,0.5),
                      0 30px 60px -15px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.1)
                    `,
                  }}
                >
                  {/* Chat header */}
                  <div 
                    className="px-6 py-4 flex items-center gap-3"
                    style={{ background: 'linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">AI Assistant</p>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        <span className="text-white/70 text-xs">Online now</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div 
                    className="px-5 py-6 space-y-4"
                    style={{ background: 'linear-gradient(180deg, hsl(220 20% 12%) 0%, hsl(220 25% 9%) 100%)' }}
                  >
                    {/* AI message */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-teal" />
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Hi! 👋 Welcome to Dr. Smith's Dental. How can I help you today?
                        </p>
                      </div>
                    </motion.div>

                    {/* User message */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="flex justify-end"
                    >
                      <div className="bg-teal/20 border border-teal/30 rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]">
                        <p className="text-white/90 text-sm">
                          I'd like to book a teeth cleaning appointment
                        </p>
                      </div>
                    </motion.div>

                    {/* AI response with typing */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 }}
                      className="flex gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-teal" />
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                        <p className="text-white/90 text-sm leading-relaxed">
                          I'd be happy to help! We have openings this Thursday at 2:00 PM and Friday at 10:00 AM. Which works better for you?
                        </p>
                      </div>
                    </motion.div>

                    {/* Suggested link */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.4 }}
                      className="ml-9"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal/10 border border-teal/20 text-xs text-teal">
                        <span>📋</span>
                        <span>View our services & pricing</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Chat input */}
                  <div 
                    className="px-4 py-3 flex items-center gap-2"
                    style={{ background: 'hsl(220 25% 8%)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 text-sm">
                      Type your message...
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating notification cards */}
              <motion.div 
                initial={{ opacity: 0, x: -40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -left-8 md:-left-24 top-1/4 hidden sm:block"
              >
                <div 
                  className="rounded-2xl p-4 max-w-[180px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">Booked</p>
                      <p className="text-xs text-white/50 truncate">Thu, 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 40, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="absolute -right-12 md:-right-28 bottom-1/3 hidden sm:block"
              >
                <div 
                  className="rounded-2xl p-4 max-w-[180px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-teal" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">Visitor helped</p>
                      <p className="text-xs text-white/50 truncate">Just now</p>
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
