import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ContactDialog from "./ContactDialog";

const FOOTER_BLOBS = [
  { cx: 0.2, cy: 0.3, color: [52, 215, 123], speed: 0.45, phase: 0, drift: 0.3 },
  { cx: 0.8, cy: 0.6, color: [0, 194, 224], speed: 0.40, phase: 1.5, drift: 0.32 },
  { cx: 0.5, cy: 0.8, color: [52, 215, 123], speed: 0.50, phase: 3.0, drift: 0.26 },
  { cx: 0.3, cy: 0.5, color: [0, 180, 200], speed: 0.42, phase: 4.5, drift: 0.34 },
  { cx: 0.7, cy: 0.2, color: [80, 200, 180], speed: 0.48, phase: 5.8, drift: 0.28 },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Demo", href: "/demo" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Support", href: "#", isContact: true },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#", isContact: true },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const Footer = () => {
  const [contactOpen, setContactOpen] = useState(false);
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
      t += 0.018;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const blob of FOOTER_BLOBS) {
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
    <footer
      className="relative text-foreground rounded-t-[1rem] md:rounded-t-[3.5rem] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(4, 8, 9, 0.82) 0%, rgba(5, 5, 6, 0.9) 100%)",
      }}
    >
      {/* Animated gradient canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.78 }}
      />

      {/* Hero-like glow wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, rgba(12, 64, 58, 0.22) 0%, rgba(5,5,6,0.12) 42%, rgba(5,5,6,0.68) 100%)",
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
      {/* CTA Band */}
      <div className="container-large relative z-10" style={{ paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-2xl)" }}>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between" style={{ gap: "var(--space-xl)" }}>
          <div style={{ maxWidth: "var(--prose-max)" }}>
            <p
              className="font-semibold uppercase tracking-widest text-foreground/55"
              style={{ fontSize: "var(--text-small)", marginBottom: "var(--space-s)" }}
            >
              Ready to start?
            </p>
            <h2 className="heading-2 text-foreground">
              Give your website
              <br />
              <span className="font-black text-primary" style={{ fontWeight: 900 }}>
                a voice.
              </span>
            </h2>
          </div>
          <Link
            to="/signup"
            className="group flex items-center gap-3 font-semibold rounded transition-transform duration-300 hover:scale-[0.97] active:scale-95 shrink-0 w-full md:w-auto justify-between md:justify-start"
            style={{
              background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
              color: "hsl(var(--primary-foreground))",
              padding: "var(--space-s) var(--space-l)",
              fontSize: "var(--text-body)",
              boxShadow: "0 10px 36px hsl(var(--green-glow) / 0.35)",
            }}
          >
            Start Free Trial
            <span
              className="w-9 h-9 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
              style={{ background: "rgba(0,0,0,0.16)", borderRadius: "4px" }}
            >
              <ArrowRight size={16} className="text-primary-foreground" />
            </span>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="container-large relative z-10">
        <div className="h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
      </div>

      {/* Bottom section */}
      <div className="container-large relative z-10" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <div className="grid grid-cols-2 md:grid-cols-12" style={{ gap: "var(--space-l)" }}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="font-display text-2xl font-[800] text-gradient inline-block" style={{ marginBottom: "var(--space-s)" }}>
              greet
            </Link>
            <p className="leading-relaxed text-foreground/58" style={{ fontSize: "var(--text-small)", maxWidth: "20rem" }}>
              AI chat and voice for every website. Turn visitors into conversations.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title} className="col-span-1 md:col-span-2">
              <p className="font-semibold uppercase tracking-widest text-foreground/48" style={{ fontSize: "var(--text-small)", marginBottom: "var(--space-s)" }}>
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"isContact" in link && link.isContact ? (
                      <button
                        onClick={() => setContactOpen(true)}
                        className="text-foreground/68 hover:text-foreground transition-opacity duration-200"
                        style={{ fontSize: "var(--text-small)" }}
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="text-foreground/68 hover:text-foreground transition-opacity duration-200"
                        style={{ fontSize: "var(--text-small)" }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-foreground/68 hover:text-foreground transition-opacity duration-200"
                        style={{ fontSize: "var(--text-small)" }}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
          style={{ marginTop: "var(--space-xl)", paddingTop: "var(--space-m)", borderTop: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p className="text-foreground/42" style={{ fontSize: "var(--text-small)" }}>
            © {new Date().getFullYear()} Greet. All rights reserved.
          </p>
        </div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
};

export default Footer;
