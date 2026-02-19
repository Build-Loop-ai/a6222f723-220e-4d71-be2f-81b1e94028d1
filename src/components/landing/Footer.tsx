import { useState } from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram } from "lucide-react";
import ContactDialog from "./ContactDialog";

const Footer = () => {
  const [contactOpen, setContactOpen] = useState(false);

  const columns = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Demo", href: "/demo" },
        { name: "Changelog", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Support", href: "#", onClick: () => setContactOpen(true) },
        { name: "API", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Contact", href: "#", onClick: () => setContactOpen(true) },
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#050506", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1140px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Logo */}
          <div className="col-span-2">
            <Link to="/" className="font-display text-2xl font-[800] text-gradient inline-block mb-4">
              greet
            </Link>
            <p className="text-sm text-[hsl(240,4%,45%)] max-w-xs leading-relaxed mb-6">
              AI chat and voice for every website.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[hsl(240,4%,45%)] hover:text-foreground transition-colors duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[10px] tracking-[2.5px] uppercase text-[hsl(240,4%,45%)] mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    {"onClick" in link && link.onClick ? (
                      <button onClick={link.onClick} className="text-sm text-[hsl(240,4%,45%)] hover:text-foreground transition-colors duration-200">
                        {link.name}
                      </button>
                    ) : (
                      <a href={link.href} className="text-sm text-[hsl(240,4%,45%)] hover:text-foreground transition-colors duration-200">
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm text-[hsl(240,4%,45%)]">© {new Date().getFullYear()} Greet. All rights reserved.</p>
          <div className="flex gap-4">
            {[Twitter, Linkedin, Instagram].map((Icon, idx) => (
              <a key={idx} href="#" className="text-[hsl(240,4%,45%)] hover:text-foreground transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
};

export default Footer;
