import { useState, useRef, useEffect } from "react";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly_cents: number;
  price_annual_cents: number | null;
  minutes_included: number | null;
  phone_numbers_limit: number | null;
  features: string[];
  is_popular: boolean | null;
}

const fallbackPlans: Plan[] = [
  {
    id: "starter", name: "Starter", description: "For getting started",
    price_monthly_cents: 0, price_annual_cents: 0, minutes_included: 100, phone_numbers_limit: 1,
    features: ["1 website", "100 conversations/month", "Chat widget", "Auto-sitemap learning", "Basic analytics"],
    is_popular: false,
  },
  {
    id: "pro", name: "Pro", description: "For growing businesses",
    price_monthly_cents: 4900, price_annual_cents: 39900, minutes_included: null, phone_numbers_limit: 5,
    features: ["5 websites", "Unlimited conversations", "Voice mode", "Custom documents", "Lead capture", "Priority support"],
    is_popular: true,
  },
  {
    id: "agency", name: "Agency", description: "For agencies & teams",
    price_monthly_cents: 14900, price_annual_cents: 119900, minutes_included: null, phone_numbers_limit: null,
    features: ["Unlimited websites", "White-label", "Multi-tenant dashboard", "Custom domain", "API access", "Dedicated support"],
    is_popular: false,
  },
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const glowY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        if (error) throw error;
        const transformed = (data || []).map((plan) => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features as string[] : typeof plan.features === "string" ? JSON.parse(plan.features) : [],
        }));
        setPlans(transformed.length > 0 ? transformed : fallbackPlans);
      } catch {
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const formatPrice = (cents: number) => Math.round(cents / 100);
  const getAnnualMonthlyPrice = (plan: Plan) => {
    if (plan.price_annual_cents) return Math.round(plan.price_annual_cents / 100 / 12);
    return Math.round(formatPrice(plan.price_monthly_cents) * (1 - siteConfig.annualDiscount / 100));
  };

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
        background: "#050506",
      }}
    >
      {/* Centered gradient orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(var(--primary) / 0.06) 0%, hsl(var(--cyan) / 0.03) 30%, transparent 60%)",
          y: glowY,
        }}
      />

      <div className="container-large relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-m)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
            Pricing
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6" style={{ marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
          <div>
            <h2
              className="text-foreground tracking-tight font-display"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 4rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "var(--space-s)",
              }}
            >
              Simple pricing
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: "var(--text-body-lg)" }}>
              Start free. Upgrade when you're ready.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-7 rounded-full p-0.5 transition-colors focus:outline-none"
              style={{ background: "hsl(var(--primary) / 0.2)" }}
            >
              <motion.span
                className="block w-6 h-6 rounded-full bg-primary shadow-md"
                animate={{ x: isAnnual ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider"
                style={{
                  background: "hsl(var(--green-dim))",
                  color: "hsl(var(--primary))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}
              >
                -{siteConfig.annualDiscount}%
              </span>
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-3 gap-0 max-w-5xl">
            {plans.map((plan, idx) => {
              const isPopular = !!plan.is_popular;
              const isHovered = hoveredIdx === idx;
              const price = isAnnual ? getAnnualMonthlyPrice(plan) : formatPrice(plan.price_monthly_cents);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative"
                  style={{ zIndex: isPopular || isHovered ? 10 : 1 }}
                >
                  <div
                    className="relative h-full flex flex-col transition-all duration-500"
                    style={{
                      padding: "clamp(1.5rem, 2.5vw, 2.5rem)",
                      background: isPopular
                        ? "linear-gradient(180deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card)) 40%)"
                        : "hsl(var(--card))",
                      borderRadius: idx === 0 ? "1.5rem 0 0 1.5rem" : idx === 2 ? "0 1.5rem 1.5rem 0" : "0",
                      borderTop: isPopular ? "2px solid hsl(var(--primary) / 0.5)" : "1px solid hsl(var(--border))",
                      borderBottom: "1px solid hsl(var(--border))",
                      borderLeft: idx === 0 ? "1px solid hsl(var(--border))" : isPopular ? "1px solid hsl(var(--primary) / 0.2)" : "1px solid hsl(var(--border))",
                      borderRight: idx === 2 ? "1px solid hsl(var(--border))" : isPopular ? "1px solid hsl(var(--primary) / 0.2)" : "none",
                      transform: isPopular ? "scale(1.03)" : undefined,
                      boxShadow: isPopular
                        ? "0 0 80px hsl(var(--primary) / 0.08), 0 20px 60px rgba(0,0,0,0.3)"
                        : "none",
                    }}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div
                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-mono tracking-[0.2em] uppercase rounded-full"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                          color: "hsl(var(--primary-foreground))",
                        }}
                      >
                        Most Popular
                      </div>
                    )}

                    {/* Plan name + desc */}
                    <div style={{ marginBottom: "var(--space-l)" }}>
                      <h3 className="font-display text-xl font-bold text-foreground tracking-tight mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div style={{ marginBottom: "var(--space-l)" }}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">€</span>
                        <motion.span
                          key={`${plan.id}-${isAnnual}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-display font-[900] tracking-tight"
                          style={{
                            fontSize: isPopular ? "3.5rem" : "2.75rem",
                            lineHeight: 1,
                            background: isPopular
                              ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))"
                              : undefined,
                            WebkitBackgroundClip: isPopular ? "text" : undefined,
                            WebkitTextFillColor: isPopular ? "transparent" : undefined,
                            color: isPopular ? undefined : "hsl(var(--foreground))",
                          }}
                        >
                          {price}
                        </motion.span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className="h-px w-full"
                      style={{
                        background: isPopular
                          ? "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)"
                          : "hsl(var(--border))",
                        marginBottom: "var(--space-m)",
                      }}
                    />

                    {/* "Includes" label for Pro/Agency */}
                    {(isPopular || plan.name === "Agency") && (
                      <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground mb-4">
                        Everything in {isPopular ? "Starter" : "Pro"}, plus:
                      </p>
                    )}

                    {/* Features */}
                    <ul className="space-y-3 flex-1" style={{ marginBottom: "var(--space-l)" }}>
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "hsl(var(--green-dim))" }}
                          >
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link to={plan.name === "Agency" ? "#" : "/signup"} className="block mt-auto">
                      <button
                        className="w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 group"
                        style={
                          isPopular
                            ? {
                                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                                color: "hsl(var(--primary-foreground))",
                                boxShadow: "0 4px 24px hsl(var(--green-glow))",
                              }
                            : {
                                background: "transparent",
                                color: "hsl(var(--foreground))",
                                border: "1px solid hsl(var(--border))",
                              }
                        }
                      >
                        {plan.price_monthly_cents === 0
                          ? "Get Started"
                          : plan.name === "Agency"
                          ? "Contact Us"
                          : "Start Free Trial"}
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p
          className="text-center font-mono tracking-wider mt-10"
          style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
        >
          All plans include a 14-day free trial · No credit card required
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
