import { useState, useRef, useEffect } from "react";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
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
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
      <div className="container-large relative z-10">
        {/* Tag */}
        <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-m)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span className="font-medium text-foreground" style={{ fontSize: "var(--text-small)" }}>
            Pricing
          </span>
        </div>

        {/* Heading row */}
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          style={{ marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          <h2
            className="text-foreground tracking-tight font-display"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            Start free.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Scale when ready.
            </span>
          </h2>

          {/* Toggle */}
          <div
            className="flex items-center gap-1 p-1 rounded-full self-start md:self-auto"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: !isAnnual ? "hsl(var(--foreground))" : "transparent",
                color: !isAnnual ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2"
              style={{
                background: isAnnual ? "hsl(var(--foreground))" : "transparent",
                color: isAnnual ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >
              Annual
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-mono"
                style={{
                  background: isAnnual ? "hsl(var(--primary))" : "hsl(var(--green-dim))",
                  color: isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))",
                }}
              >
                -{siteConfig.annualDiscount}%
              </span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            {plans.map((plan, idx) => {
              const isPopular = !!plan.is_popular;
              const price = isAnnual ? getAnnualMonthlyPrice(plan) : formatPrice(plan.price_monthly_cents);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.15 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative"
                >
                  {/* Gradient border for popular */}
                  {isPopular && (
                    <div
                      className="absolute -inset-px rounded-[1.6rem] pointer-events-none"
                      style={{
                        background: "linear-gradient(180deg, hsl(var(--primary) / 0.5), hsl(var(--cyan) / 0.2), transparent 70%)",
                      }}
                    />
                  )}

                  <div
                    className="relative h-full flex flex-col rounded-3xl overflow-hidden transition-shadow duration-500"
                    style={{
                      background: isPopular
                        ? "linear-gradient(180deg, hsl(var(--primary) / 0.04), hsl(var(--card)) 30%)"
                        : "hsl(var(--card))",
                      border: isPopular ? "none" : "1px solid hsl(var(--border))",
                      boxShadow: isPopular
                        ? "0 24px 80px hsl(var(--primary) / 0.1)"
                        : "none",
                    }}
                  >
                    {/* Top section with price */}
                    <div style={{ padding: "clamp(1.5rem, 2.5vw, 2.5rem)", paddingBottom: 0 }}>
                      {/* Plan name row */}
                      <div className="flex items-center justify-between mb-6">
                        <span
                          className="font-display font-bold tracking-tight text-foreground"
                          style={{ fontSize: "1.15rem" }}
                        >
                          {plan.name}
                        </span>
                        {isPopular && (
                          <span
                            className="px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.15em] uppercase"
                            style={{
                              background: "hsl(var(--green-dim))",
                              color: "hsl(var(--primary))",
                              border: "1px solid hsl(var(--primary) / 0.2)",
                            }}
                          >
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Price display */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-muted-foreground" style={{ fontSize: "1.1rem" }}>€</span>
                        <motion.span
                          key={`${plan.id}-${isAnnual}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-display font-[900] tracking-tighter text-foreground"
                          style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)", lineHeight: 1 }}
                        >
                          {price}
                        </motion.span>
                        <span className="text-muted-foreground text-sm ml-1">/mo</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                      {/* CTA */}
                      <Link to={plan.name === "Agency" ? "#" : "/signup"} className="block">
                        <button
                          className="w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                          style={
                            isPopular
                              ? {
                                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan)))",
                                  color: "hsl(var(--primary-foreground))",
                                  boxShadow: "0 4px 24px hsl(var(--green-glow))",
                                }
                              : {
                                  background: "hsl(var(--secondary))",
                                  color: "hsl(var(--foreground))",
                                  border: "1px solid hsl(var(--border))",
                                }
                          }
                        >
                          {plan.price_monthly_cents === 0
                            ? "Get Started Free"
                            : plan.name === "Agency"
                            ? "Contact Us"
                            : "Start Free Trial"}
                          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 my-6">
                      <div
                        className="h-px w-full"
                        style={{
                          background: isPopular
                            ? "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.25), transparent)"
                            : "hsl(var(--border))",
                        }}
                      />
                    </div>

                    {/* Features */}
                    <div style={{ padding: "0 clamp(1.5rem, 2.5vw, 2.5rem) clamp(1.5rem, 2.5vw, 2.5rem)" }}>
                      {(isPopular || plan.name === "Agency") && (
                        <p className="text-[11px] font-mono tracking-[0.12em] uppercase text-muted-foreground mb-4">
                          Everything in {isPopular ? "Starter" : "Pro"} +
                        </p>
                      )}
                      <ul className="space-y-3">
                        {plan.features.map((feature, fi) => (
                          <li key={fi} className="flex items-center gap-3">
                            <Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p
          className="text-center font-mono tracking-wider mt-12"
          style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
        >
          All plans include a 14-day free trial · No credit card required
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
