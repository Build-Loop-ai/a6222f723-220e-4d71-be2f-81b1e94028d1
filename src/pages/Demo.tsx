import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, MessageSquare, Bot } from "lucide-react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { ChatWidget } from "@/components/embed/ChatWidget";

const Demo = () => {
  const { config } = useSiteConfigTransformed();

  return (
    <>
      <Helmet>
        <title>Try the AI Assistant | {config.name} Demo</title>
        <meta
          name="description"
          content="Chat with our AI website assistant demo. See how it answers questions, recommends pages, and books appointments — all powered by your website content."
        />
      </Helmet>

      <div className="min-h-screen bg-[hsl(222,47%,6%)] overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(166,76%,36%,0.15) 0%, transparent 70%)",
              top: "-20%",
              right: "-10%",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(222,47%,40%,0.1) 0%, transparent 70%)",
              bottom: "-10%",
              left: "-10%",
            }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 md:top-6 left-0 right-0 mx-auto z-50 w-[90%] max-w-xl"
        >
          <div
            className="relative rounded-2xl bg-[hsl(222,47%,8%)]/90"
            style={{
              backdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <span className="font-serif text-lg text-white">{config.name.toLowerCase()}</span>
              <Link 
                to="/signup"
                className="flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-light transition-colors"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
          <div className="w-full max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: "linear-gradient(135deg, hsla(166,76%,36%,0.2) 0%, hsla(166,76%,36%,0.05) 100%)",
                border: "1px solid hsla(166,76%,36%,0.3)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              <span className="text-sm text-teal font-medium">Live Demo</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.1] mb-4 text-white"
            >
              Chat with our
              <br />
              <span className="text-gradient italic">AI assistant</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 mb-8 max-w-md mx-auto text-lg"
            >
              Click the chat bubble in the bottom-right corner to start a conversation. Ask anything!
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-12"
            >
              {[
                { icon: "💬", label: "Natural conversation" },
                { icon: "📋", label: "Page recommendations" },
                { icon: "📅", label: "Appointment booking" },
                { icon: "🌍", label: "22+ languages" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <span>{feature.icon}</span>
                  <span className="text-sm text-white/70">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup">
                <Button variant="hero" size="xl" className="gap-2 group">
                  <Sparkles className="w-5 h-5" />
                  Start Free Trial
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>

        {/* Embedded chat widget for demo */}
        <ChatWidget
          apiKey="demo"
          supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
          accentColor="#0d9488"
          position="bottom-right"
          welcomeMessage="Hi! 👋 I'm an AI assistant demo. Ask me anything about how I work, or try asking about services, pricing, or booking an appointment!"
          placeholderText="Ask me anything..."
          widgetTitle="AI Assistant Demo"
          voiceEnabled={false}
        />
      </div>
    </>
  );
};

export default Demo;
