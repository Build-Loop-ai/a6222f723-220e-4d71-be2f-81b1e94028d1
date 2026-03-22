import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, MessageSquare, Mic, Globe, FileText, Languages } from "lucide-react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { ChatWidget } from "@/components/embed/ChatWidget";

const DEMO_BLOBS = [
  { cx: 0.2, cy: 0.3, color: [52, 215, 123], speed: 0.45, phase: 0, drift: 0.3 },
  { cx: 0.8, cy: 0.6, color: [0, 194, 224], speed: 0.40, phase: 1.5, drift: 0.32 },
  { cx: 0.5, cy: 0.8, color: [52, 215, 123], speed: 0.50, phase: 3.0, drift: 0.26 },
  { cx: 0.7, cy: 0.2, color: [0, 180, 200], speed: 0.42, phase: 4.5, drift: 0.34 },
];

const DemoBlobCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = Math.random() * 100;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
      }
    };

    const draw = () => {
      t += 0.055;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const blob of DEMO_BLOBS) {
        const cx = w * (blob.cx + Math.sin(t * blob.speed + blob.phase) * blob.drift
          + Math.sin(t * blob.speed * 2.1 + blob.phase * 0.7) * blob.drift * 0.3);
        const cy = h * (blob.cy + Math.cos(t * blob.speed * 0.8 + blob.phase + 1) * blob.drift
          + Math.cos(t * blob.speed * 1.7 + blob.phase * 1.3) * blob.drift * 0.25);
        const r = Math.min(w, h) * (0.85 + Math.sin(t * 0.5 + blob.phase) * 0.1);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 1)`);
        grad.addColorStop(0.4, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.9)`);
        grad.addColorStop(0.7, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.5)`);
        grad.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0.1)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.07 }}
    />
  );
};

const capabilities = [
  { icon: MessageSquare, label: "Natural conversation" },
  { icon: Mic, label: "Voice mode" },
  { icon: Globe, label: "22+ languages" },
  { icon: FileText, label: "Page routing" },
];

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

      <div className="min-h-screen relative overflow-hidden" style={{ background: "#050506" }}>
        {/* Animated blob background */}
        <div className="fixed inset-0 pointer-events-none">
          <DemoBlobCanvas />
        </div>

        {/* Dot grid */}
        <div
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1.5px)",
            backgroundSize: "2rem 2rem",
          }}
        />

        {/* Grain */}
        <div
          className="fixed inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Floating nav */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 md:top-6 left-0 right-0 mx-auto z-50 w-[90%] max-w-xl"
        >
          <div
            className="rounded-2xl"
            style={{
              background: "rgba(5, 5, 6, 0.85)",
              backdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <span
                className="font-display text-lg font-bold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {config.name.toLowerCase()}
              </span>
              <Link
                to="/signup"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-green-light transition-colors"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Main content */}
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-28">
          <div className="w-full max-w-3xl mx-auto text-center">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2.5 mb-8"
            >
              <span className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                background: "hsl(var(--green-dim))",
                border: "1px solid hsl(var(--primary) / 0.25)",
              }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary">Live Demo</span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-foreground tracking-tight"
              style={{
                fontSize: "clamp(2rem, 6vw, 5rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "var(--space-m)",
              }}
            >
              Chat with our
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI assistant.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground leading-relaxed mx-auto"
              style={{
                fontSize: "var(--text-body-lg)",
                maxWidth: "var(--prose-max)",
                marginBottom: "var(--space-xl)",
              }}
            >
              Click the chat bubble in the bottom-right corner to start a conversation. Ask anything!
            </motion.p>

            {/* Capability pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
              style={{ marginBottom: "var(--space-xl)" }}
            >
              {capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <cap.icon size={16} className="text-primary" strokeWidth={2.2} />
                  <span className="text-sm text-muted-foreground font-medium">{cap.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/signup">
                <button
                  className="group inline-flex items-center gap-3 font-medium transition-all duration-300 hover:scale-[0.98] active:scale-[0.965]"
                  style={{
                    padding: "14px 28px",
                    fontSize: "var(--text-body)",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 30px hsl(var(--green-glow))",
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  Start Free Trial
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </motion.div>
          </div>
        </main>

        {/* Chat widget */}
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
