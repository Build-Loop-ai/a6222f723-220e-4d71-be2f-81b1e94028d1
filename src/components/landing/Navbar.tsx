import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "shadow-lg" : ""}`}
        style={{
          background: "rgba(5,5,6,0.22)",
          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0))",
          WebkitBackdropFilter: "blur(26px)",
          backdropFilter: "blur(26px)",
          boxShadow: scrolled ? "0 10px 30px rgba(0, 0, 0, 0.30)" : "none",
          borderRadius: "0 0 1.75rem 1.75rem",
        }}
      >
        <div className="w-full" style={{ paddingLeft: "clamp(1rem, 3vw, 2.5rem)", paddingRight: "clamp(1rem, 3vw, 2.5rem)" }}>
          <div className="flex items-center justify-between w-full" style={{ padding: "16px 0" }}>
            {/* Logo */}
            <Link to="/" className="font-display text-xl font-[800] tracking-tight text-white">
              greet
            </Link>

            {/* Center links — desktop */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="font-semibold transition-colors duration-200 text-foreground/70 hover:text-foreground"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/demo"
                className="font-semibold text-primary hover:text-green-light transition-colors duration-200"
                style={{ fontSize: "var(--text-body)" }}
              >
                Try Demo
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden md:inline-flex">
                <button className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
                  Sign in
                </button>
              </Link>
              <Link to="/signup" className="hidden md:inline-flex">
                <button
                  className="px-5 py-2.5 text-sm font-medium rounded-[10px] transition-all duration-500 hover:scale-[0.98]"
                  style={{
                    background: pastHero
                      ? "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)"
                      : "rgba(255,255,255,0.95)",
                    color: pastHero ? "white" : "hsl(168 80% 28%)",
                    boxShadow: pastHero
                      ? "0 2px 12px hsl(var(--green-glow))"
                      : "0 2px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  Get Started
                </button>
              </Link>

              {/* Hamburger — mobile */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10"
                aria-label="Open menu"
              >
                <Menu size={24} className="text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: "#050506" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <div className="flex items-center justify-between w-full" style={{ padding: "16px clamp(1.5rem, 5vw, 2.5rem)" }}>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                <span className="font-display text-xl font-[800] text-gradient">greet</span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)" }}
                aria-label="Close menu"
              >
                <X size={20} className="text-foreground" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-start pt-8" style={{ gap: "0.5rem", paddingLeft: "clamp(1.5rem, 5vw, 2.5rem)", paddingRight: "clamp(1.5rem, 5vw, 2.5rem)" }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: easeOut }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block font-black tracking-tight text-foreground"
                    style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", lineHeight: 1.2, padding: "0.25rem 0" }}
                  >
                    {link.name}
                  </a>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28, duration: 0.4, ease: easeOut }}
              >
                <Link
                  to="/demo"
                  onClick={() => setMenuOpen(false)}
                  className="block font-black tracking-tight text-primary"
                  style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", lineHeight: 1.2, padding: "0.25rem 0" }}
                >
                  Try Demo
                </Link>
              </motion.div>
            </div>

            <div className="pb-10" style={{ paddingLeft: "clamp(1.5rem, 5vw, 2.5rem)", paddingRight: "clamp(1.5rem, 5vw, 2.5rem)" }}>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center justify-center font-semibold transition-transform duration-300 hover:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--green)) 0%, hsl(var(--cyan)) 100%)",
                  color: "hsl(var(--primary-foreground))",
                  padding: "16px 24px",
                  fontSize: "var(--text-body)",
                  borderRadius: "10px",
                }}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
