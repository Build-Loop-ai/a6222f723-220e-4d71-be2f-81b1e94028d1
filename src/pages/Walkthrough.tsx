import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import {
  PhoneOff, Clock, DollarSign, Globe, Paintbrush, Rocket,
  MessageSquare, Phone, BarChart3, CalendarCheck,
  BookOpen, Mic, Languages, ArrowRight, Zap
} from "lucide-react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const SlideSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section
    className={`relative flex items-center justify-center ${className}`}
    style={{ minHeight: "100vh", padding: "var(--space-section-y) 0" }}
  >
    <div className="container-large w-full">{children}</div>
  </section>
);

/* ─── Slide 1: Title ─── */
const TitleSlide = () => (
  <SlideSection>
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[600px] h-[600px] rounded-full animate-float" style={{ top: "-10%", left: "10%", background: "radial-gradient(circle, hsl(148 68% 52% / 0.12) 0%, transparent 70%)" }} />
      <div className="absolute w-[500px] h-[500px] rounded-full animate-float-reverse" style={{ bottom: "-5%", right: "5%", background: "radial-gradient(circle, hsl(190 100% 44% / 0.10) 0%, transparent 70%)" }} />
    </div>
    <motion.div
      className="relative z-10 flex flex-col items-center text-center"
      style={{ gap: "var(--space-l)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}
      variants={stagger}
    >
      <motion.p variants={fadeUp} className="section-label">WALKTHROUGH</motion.p>
      <motion.h1 variants={fadeUp} className="heading-1 font-display max-w-4xl">
        <span className="text-gradient">What We're Building</span>
      </motion.h1>
      <motion.p variants={fadeUp} className="body-text max-w-2xl" style={{ color: "hsl(var(--text-secondary))" }}>
        An AI receptionist that answers calls, chats with visitors, and books appointments&nbsp;—&nbsp;24/7.
      </motion.p>
      <motion.div variants={fadeUp} className="font-display text-xl font-[800] tracking-tight text-foreground">
        greet
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 2: The Problem ─── */
const problemCards = [
  { icon: PhoneOff, title: "Missed Calls After Hours", desc: "62% of calls to small businesses go unanswered. Each one is a lost customer." },
  { icon: Clock, title: "Slow Response Times", desc: "Customers expect instant answers. Long wait times drive them to competitors." },
  { icon: DollarSign, title: "Expensive Receptionists", desc: "Hiring full-time staff costs $35k–$50k/year. Most small businesses can't afford it." },
];

const ProblemSlide = () => (
  <SlideSection>
    <motion.div
      className="grid md:grid-cols-2 items-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <p className="section-label mb-4">THE PROBLEM</p>
        <h2 className="heading-1 font-display">
          Every missed call is a{" "}
          <span className="text-gradient">missed customer.</span>
        </h2>
      </motion.div>
      <motion.div className="flex flex-col" style={{ gap: "var(--space-m)" }} variants={stagger}>
        {problemCards.map((c) => (
          <motion.div
            key={c.title}
            variants={fadeUp}
            className="glass glass-sm flex items-start"
            style={{ padding: "var(--space-card)", gap: "var(--space-m)" }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--green-dim))" }}>
              <c.icon size={20} style={{ color: "hsl(var(--green))" }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1" style={{ fontSize: "var(--text-body)" }}>{c.title}</h3>
              <p style={{ fontSize: "var(--text-small)", color: "hsl(var(--text-secondary))" }}>{c.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 3: The Solution ─── */
const SolutionSlide = () => {
  const nodes = [
    { label: "Your Website", icon: Globe },
    { label: "Greet AI", icon: Zap, highlight: true },
    { label: "Chat + Voice + Bookings", icon: CalendarCheck },
  ];
  return (
    <SlideSection>
      <motion.div
        className="flex flex-col items-center text-center"
        style={{ gap: "var(--space-xl)" }}
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <p className="section-label justify-center mb-4">THE SOLUTION</p>
          <h2 className="heading-1 font-display">
            Meet <span className="text-gradient">Greet</span>
          </h2>
        </motion.div>
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center w-full"
          style={{ gap: "var(--space-l)" }}
          variants={stagger}
        >
          {nodes.map((n, i) => (
            <motion.div key={n.label} variants={fadeUp} className="flex items-center" style={{ gap: "var(--space-l)" }}>
              <div
                className={`glass glass-sm flex flex-col items-center justify-center text-center ${n.highlight ? "border-glow" : ""}`}
                style={{
                  width: "clamp(160px, 20vw, 220px)",
                  height: "clamp(140px, 18vw, 180px)",
                  padding: "var(--space-card)",
                  background: n.highlight
                    ? "linear-gradient(135deg, hsl(148 68% 52% / 0.12) 0%, hsl(190 100% 44% / 0.08) 100%)"
                    : undefined,
                }}
              >
                <n.icon size={28} style={{ color: n.highlight ? "hsl(var(--green))" : "hsl(var(--text-secondary))", marginBottom: 12 }} />
                <span className="font-semibold text-foreground" style={{ fontSize: "var(--text-small)" }}>{n.label}</span>
              </div>
              {i < nodes.length - 1 && (
                <ArrowRight size={24} className="hidden md:block" style={{ color: "hsl(var(--green))" }} />
              )}
            </motion.div>
          ))}
        </motion.div>
        <motion.p variants={fadeUp} className="body-text max-w-xl" style={{ color: "hsl(var(--text-secondary))" }}>
          Greet sits between your website and your customers, handling every interaction instantly&nbsp;—&nbsp;no human needed.
        </motion.p>
      </motion.div>
    </SlideSection>
  );
};

/* ─── Slide 4: How It Works ─── */
const setupSteps = [
  { num: "01", icon: Globe, title: "Connect Your Website", desc: "Greet crawls your site and learns everything about your business, services, and FAQ in minutes." },
  { num: "02", icon: Paintbrush, title: "Customize Your Widget", desc: "Pick colors, set the voice personality, adjust the language — make it yours." },
  { num: "03", icon: Rocket, title: "Go Live", desc: "Embed one script tag. Your AI receptionist is live on your site, answering calls and chats 24/7." },
];

const HowItWorksSlide = () => (
  <SlideSection>
    <motion.div
      className="flex flex-col items-center text-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <p className="section-label justify-center mb-4">HOW IT WORKS</p>
        <h2 className="heading-1 font-display">
          Live in <span className="text-gradient">3 steps</span>
        </h2>
      </motion.div>
      <motion.div
        className="grid md:grid-cols-3 w-full"
        style={{ gap: "var(--space-gap)" }}
        variants={stagger}
      >
        {setupSteps.map((s) => (
          <motion.div
            key={s.num}
            variants={fadeUp}
            className="glass glass-sm text-left"
            style={{ padding: "var(--space-card)" }}
          >
            <span className="mono-label text-gradient mb-4 block">{s.num}</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "hsl(var(--green-dim))" }}>
              <s.icon size={20} style={{ color: "hsl(var(--green))" }} />
            </div>
            <h3 className="font-semibold text-foreground mb-2" style={{ fontSize: "var(--text-body)" }}>{s.title}</h3>
            <p style={{ fontSize: "var(--text-small)", color: "hsl(var(--text-secondary))", lineHeight: "var(--leading-body)" }}>{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 5: Chat Widget Feature ─── */
const ChatFeatureSlide = () => (
  <SlideSection>
    <motion.div
      className="grid md:grid-cols-2 items-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <p className="section-label mb-4">CORE FEATURE</p>
        <h2 className="heading-2 font-display mb-4">
          <span className="text-gradient">AI Chat Widget</span>
        </h2>
        <div className="flex flex-col" style={{ gap: "var(--space-m)" }}>
          {[
            { icon: MessageSquare, text: "RAG-powered — answers from your actual website content" },
            { icon: Zap, text: "Streaming responses for a natural conversation feel" },
            { icon: BookOpen, text: "Knowledge base auto-built from your site crawl" },
          ].map((f) => (
            <div key={f.text} className="flex items-start" style={{ gap: "var(--space-s)" }}>
              <f.icon size={18} className="flex-shrink-0 mt-1" style={{ color: "hsl(var(--green))" }} />
              <p style={{ fontSize: "var(--text-small)", color: "hsl(var(--text-secondary))" }}>{f.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={fadeUp} className="glass glass-lg" style={{ padding: "var(--space-card)" }}>
        <div className="rounded-xl overflow-hidden" style={{ background: "hsl(var(--surface-2))" }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}>
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <span className="text-sm font-semibold text-white">Chat with us</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: "hsl(var(--green-dim))" }} />
              <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "hsl(var(--surface))", color: "hsl(var(--text-secondary))", maxWidth: "80%" }}>
                Hi! How can I help you today?
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="rounded-xl px-3 py-2 text-sm text-white" style={{ background: "hsl(var(--green))", maxWidth: "80%" }}>
                What services do you offer?
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: "hsl(var(--green-dim))" }} />
              <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "hsl(var(--surface))", color: "hsl(var(--text-secondary))", maxWidth: "80%" }}>
                We offer dental cleanings, whitening, orthodontics, and emergency care. Would you like to book an appointment?
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 6: Voice Agent Feature ─── */
const VoiceFeatureSlide = () => (
  <SlideSection>
    <motion.div
      className="grid md:grid-cols-2 items-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp} className="flex flex-col items-center justify-center order-2 md:order-1">
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <div className="absolute inset-0 rounded-full animate-breathe" style={{ border: "2px solid hsl(var(--green) / 0.15)" }} />
          <div className="absolute rounded-full animate-breathe" style={{ inset: 20, border: "2px solid hsl(var(--green) / 0.25)", animationDelay: "0.5s" }} />
          <div className="absolute rounded-full animate-breathe" style={{ inset: 40, border: "2px solid hsl(var(--green) / 0.4)", animationDelay: "1s" }} />
          <div className="w-20 h-20 rounded-full flex items-center justify-center glow-green" style={{ background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)" }}>
            <Phone size={32} className="text-white" />
          </div>
        </div>
      </motion.div>
      <motion.div variants={fadeUp} className="order-1 md:order-2">
        <p className="section-label mb-4">CORE FEATURE</p>
        <h2 className="heading-2 font-display mb-4">
          <span className="text-gradient">AI Voice Agent</span>
        </h2>
        <div className="flex flex-col" style={{ gap: "var(--space-m)" }}>
          {[
            { icon: Mic, text: "Natural-sounding AI voice powered by Vapi" },
            { icon: Languages, text: "22+ languages with automatic detection" },
            { icon: CalendarCheck, text: "Books appointments & transfers calls intelligently" },
          ].map((f) => (
            <div key={f.text} className="flex items-start" style={{ gap: "var(--space-s)" }}>
              <f.icon size={18} className="flex-shrink-0 mt-1" style={{ color: "hsl(var(--green))" }} />
              <p style={{ fontSize: "var(--text-small)", color: "hsl(var(--text-secondary))" }}>{f.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 7: Dashboard Feature ─── */
const dashMetrics = [
  { label: "Total Calls", value: "1,247", delta: "+12%" },
  { label: "Chat Sessions", value: "3,891", delta: "+24%" },
  { label: "Appointments", value: "482", delta: "+18%" },
  { label: "Avg Response", value: "1.2s", delta: "-40%" },
];

const DashboardSlide = () => (
  <SlideSection>
    <motion.div
      className="flex flex-col items-center text-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <p className="section-label justify-center mb-4">CORE FEATURE</p>
        <h2 className="heading-2 font-display mb-2">
          <span className="text-gradient">Analytics Dashboard</span>
        </h2>
        <p className="body-text max-w-xl" style={{ color: "hsl(var(--text-secondary))" }}>
          Track every call, conversation, and booking. Full transcripts, AI insights, and team management.
        </p>
      </motion.div>
      <motion.div className="grid grid-cols-2 md:grid-cols-4 w-full" style={{ gap: "var(--space-gap)" }} variants={stagger}>
        {dashMetrics.map((m) => (
          <motion.div key={m.label} variants={fadeUp} className="glass glass-sm text-center" style={{ padding: "var(--space-card)" }}>
            <p className="text-sm mb-1" style={{ color: "hsl(var(--text-tertiary))" }}>{m.label}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{m.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: "hsl(var(--green))" }}>{m.delta}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div className="grid md:grid-cols-3 w-full" style={{ gap: "var(--space-gap)" }} variants={stagger}>
        {[
          { icon: BarChart3, title: "Call Analytics", desc: "Duration, outcomes, and trends at a glance" },
          { icon: MessageSquare, title: "Conversation Logs", desc: "Full chat history with search and filters" },
          { icon: BookOpen, title: "Knowledge Base", desc: "Manage crawled pages and custom content" },
        ].map((c) => (
          <motion.div key={c.title} variants={fadeUp} className="glass glass-sm text-left" style={{ padding: "var(--space-card)" }}>
            <c.icon size={20} style={{ color: "hsl(var(--green))", marginBottom: 8 }} />
            <h3 className="font-semibold text-foreground mb-1" style={{ fontSize: "var(--text-body)" }}>{c.title}</h3>
            <p style={{ fontSize: "var(--text-small)", color: "hsl(var(--text-secondary))" }}>{c.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 8: Business Model ─── */
const plans = [
  { name: "Starter", price: "$29", features: ["500 conversations / mo", "1 website", "Chat + voice replies", "Email support"] },
  { name: "Pro", price: "$79", popular: true, features: ["3,000 conversations / mo", "Up to 3 websites", "Voice calls (Vapi)", "Lead capture", "Custom branding"] },
  { name: "Business", price: "$199", features: ["Unlimited conversations", "Up to 10 websites", "API access", "Remove branding", "Dedicated manager"] },
];

const BusinessModelSlide = () => (
  <SlideSection>
    <motion.div
      className="flex flex-col items-center text-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <p className="section-label justify-center mb-4">BUSINESS MODEL</p>
        <h2 className="heading-2 font-display">
          SaaS Subscription — <span className="text-gradient">3 tiers</span>
        </h2>
      </motion.div>
      <motion.div className="grid md:grid-cols-3 w-full" style={{ gap: "var(--space-gap)" }} variants={stagger}>
        {plans.map((p) => (
          <motion.div
            key={p.name}
            variants={fadeUp}
            className={`glass glass-sm text-left relative ${p.popular ? "border-glow" : ""}`}
            style={{ padding: "var(--space-card)" }}
          >
            {p.popular && (
              <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--green))", color: "hsl(var(--primary-foreground))" }}>
                Popular
              </span>
            )}
            <h3 className="font-bold text-foreground text-lg mb-1">{p.name}</h3>
            <p className="text-3xl font-bold text-foreground tabular-nums mb-1">{p.price}<span className="text-sm font-normal" style={{ color: "hsl(var(--text-tertiary))" }}>/mo</span></p>
            <ul className="mt-3 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2" style={{ color: "hsl(var(--text-secondary))" }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(var(--green))" }} />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 9: Tech Stack ─── */
const techStack = [
  "React", "Vite", "TypeScript", "Tailwind CSS",
  "Supabase", "Vapi.ai", "OpenAI", "Stripe",
  "Firecrawl", "Framer Motion", "Recharts", "Resend",
];

const TechStackSlide = () => (
  <SlideSection>
    <motion.div
      className="flex flex-col items-center text-center"
      style={{ gap: "var(--space-xl)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <p className="section-label justify-center mb-4">UNDER THE HOOD</p>
        <h2 className="heading-2 font-display">
          <span className="text-gradient">Tech Stack</span>
        </h2>
      </motion.div>
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full max-w-3xl" style={{ gap: "var(--space-gap)" }} variants={stagger}>
        {techStack.map((t) => (
          <motion.div
            key={t}
            variants={fadeUp}
            className="glass glass-sm flex items-center justify-center font-semibold text-foreground"
            style={{ padding: "var(--space-card)", fontSize: "var(--text-small)" }}
          >
            {t}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Slide 10: CTA ─── */
const CTASlide = () => (
  <SlideSection>
    <motion.div
      className="flex flex-col items-center text-center"
      style={{ gap: "var(--space-l)" }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}
      variants={stagger}
    >
      <motion.h2 variants={fadeUp} className="heading-1 font-display">
        <span className="text-gradient">Let's Build This</span>
      </motion.h2>
      <motion.p variants={fadeUp} className="body-text max-w-xl" style={{ color: "hsl(var(--text-secondary))" }}>
        Everything you've just seen is already built and working. Ready to see it live?
      </motion.p>
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/signup"
          className="inline-flex items-center justify-center font-semibold transition-transform duration-300 hover:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
            color: "hsl(var(--primary-foreground))",
            padding: "14px 32px",
            fontSize: "var(--text-body)",
            borderRadius: "10px",
          }}
        >
          Get Started <ArrowRight size={18} className="ml-2" />
        </Link>
        <Link
          to="/demo"
          className="inline-flex items-center justify-center font-semibold transition-all duration-300 hover:scale-[0.98]"
          style={{
            border: "1px solid hsl(var(--glass-border))",
            color: "hsl(var(--foreground))",
            padding: "14px 32px",
            fontSize: "var(--text-body)",
            borderRadius: "10px",
          }}
        >
          Try Demo
        </Link>
      </motion.div>
    </motion.div>
  </SlideSection>
);

/* ─── Page ─── */
const Walkthrough = () => (
  <div className="min-h-screen" style={{ background: "#050506", overflowX: "clip" }}>
    <Helmet>
      <title>Walkthrough – Greet AI Receptionist</title>
      <meta name="description" content="A visual walkthrough of Greet — the AI receptionist platform that answers calls, chats with visitors, and books appointments 24/7." />
    </Helmet>
    <Navbar />
    <div style={{ paddingTop: "80px" }}>
      <TitleSlide />
      <ProblemSlide />
      <SolutionSlide />
      <HowItWorksSlide />
      <ChatFeatureSlide />
      <VoiceFeatureSlide />
      <DashboardSlide />
      <BusinessModelSlide />
      <TechStackSlide />
      <CTASlide />
    </div>
  </div>
);

export default Walkthrough;
