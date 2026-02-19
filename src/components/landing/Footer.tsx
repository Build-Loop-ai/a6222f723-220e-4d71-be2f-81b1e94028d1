import { useState } from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import ContactDialog from "./ContactDialog";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const Footer = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const { config } = useSiteConfigTransformed();

  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "/demo" },
    ],
    Company: [
      { name: "Assessment", href: "/assessment" },
      { name: "Contact", href: "#", onClick: () => setContactOpen(true) },
    ],
    Account: [
      { name: "Login", href: "/login" },
      { name: "Sign Up", href: "/signup" },
    ],
  };

  return (
    <footer className="bg-background relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="container mx-auto px-4 md:px-6 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Logo */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <span className="font-display text-2xl font-800 text-gradient">{config.name.toLowerCase()}</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">{config.description}</p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <motion.a key={idx} href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-[10px] tracking-[2.5px] uppercase text-muted-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {"onClick" in link && link.onClick ? (
                      <button onClick={link.onClick} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group">
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-all duration-200" />
                      </button>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group">
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-all duration-200" />
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
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {config.name}. All rights reserved.</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">Made with <span className="text-destructive">❤</span> using Lovable</p>
        </div>
      </div>
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
};

export default Footer;
