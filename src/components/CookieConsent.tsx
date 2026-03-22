import { useState, useEffect } from "react";

const COOKIE_KEY = "greet_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/widget")) return;
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const respond = (choice: "accepted" | "declined") => {
    localStorage.setItem(COOKIE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[10000] mx-auto max-w-lg animate-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-border/40 bg-card/95 p-4 shadow-xl backdrop-blur-lg sm:bottom-6 sm:left-6 sm:right-auto sm:p-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        We use cookies to improve your experience. By continuing, you agree to our{" "}
        <a href="/privacy" className="underline text-foreground hover:text-primary transition-colors">
          Privacy Policy
        </a>.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => respond("accepted")}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Accept
        </button>
        <button
          onClick={() => respond("declined")}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
