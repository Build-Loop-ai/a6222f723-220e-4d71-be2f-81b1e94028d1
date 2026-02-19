import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: isScrolled ? "rgba(5,5,6,0.9)" : "rgba(5,5,6,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transition: "background 0.3s ease",
      }}
    >
      <div className="max-w-[1140px] mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="font-display text-xl font-[800] tracking-tight text-gradient">
          greet
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-[hsl(240,4%,65%)] hover:text-foreground transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/demo"
            className="px-4 py-2 text-sm font-medium text-primary hover:text-green-light transition-colors duration-200"
          >
            Try Demo
          </Link>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <button className="px-4 py-2 text-sm font-medium text-[hsl(240,4%,65%)] hover:text-foreground transition-colors">
              Sign in
            </button>
          </Link>
          <Link to="/signup">
            <button
              className="px-4 py-2 text-sm font-medium rounded-[10px] text-primary-foreground transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)",
                boxShadow: "0 2px 12px hsla(148, 68%, 52%, 0.3)",
              }}
            >
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile */}
        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: "rgba(5,5,6,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="block py-3 text-foreground/80 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </a>
              ))}
              <Link to="/demo" className="block py-3 text-primary font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                Try Demo
              </Link>
              <div className="pt-3 mt-3 border-t border-foreground/10 space-y-2">
                <Link to="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-3 text-foreground/60 font-medium">Sign in</button>
                </Link>
                <Link to="/signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-3 font-medium rounded-xl text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}>
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
