import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ContactDialog from "./ContactDialog";

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

  return (
    <footer className="text-foreground rounded-t-[1rem] md:rounded-t-[3.5rem]" style={{ backgroundColor: "#0A0F0D" }}>
      {/* CTA Band */}
      <div className="container-large" style={{ paddingTop: "var(--space-2xl)", paddingBottom: "var(--space-2xl)" }}>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between" style={{ gap: "var(--space-xl)" }}>
          <div style={{ maxWidth: "var(--prose-max)" }}>
            <p
              className="font-semibold uppercase tracking-widest text-muted-foreground"
              style={{ fontSize: "var(--text-small)", marginBottom: "var(--space-s)" }}
            >
              Ready to start?
            </p>
            <h2 className="heading-2">
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
            }}
          >
            Start Free Trial
            <span
              className="w-9 h-9 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
              style={{ background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}
            >
              <ArrowRight size={16} className="text-primary-foreground" />
            </span>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="container-large">
        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Bottom section */}
      <div className="container-large" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-xl)" }}>
        <div className="grid grid-cols-2 md:grid-cols-12" style={{ gap: "var(--space-l)" }}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="font-display text-2xl font-[800] text-gradient inline-block" style={{ marginBottom: "var(--space-s)" }}>
              greet
            </Link>
            <p className="leading-relaxed text-muted-foreground" style={{ fontSize: "var(--text-small)", maxWidth: "20rem" }}>
              AI chat and voice for every website. Turn visitors into conversations.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title} className="col-span-1 md:col-span-2">
              <p className="font-semibold uppercase tracking-widest text-muted-foreground" style={{ fontSize: "var(--text-small)", marginBottom: "var(--space-s)" }}>
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"isContact" in link && link.isContact ? (
                      <button
                        onClick={() => setContactOpen(true)}
                        className="text-muted-foreground/70 hover:text-foreground transition-opacity duration-200"
                        style={{ fontSize: "var(--text-small)" }}
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="text-muted-foreground/70 hover:text-foreground transition-opacity duration-200"
                        style={{ fontSize: "var(--text-small)" }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-muted-foreground/70 hover:text-foreground transition-opacity duration-200"
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
          style={{ marginTop: "var(--space-xl)", paddingTop: "var(--space-m)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-muted-foreground/40" style={{ fontSize: "var(--text-small)" }}>
            © {new Date().getFullYear()} Greet. All rights reserved.
          </p>
        </div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
};

export default Footer;
