import { useState, useRef, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
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
    <section id="pricing" ref={sectionRef} className="relative py-32 md:py-44 overflow-hidden">
      {/* Background — subtle but distinct */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, #070810 0%, #080A10 50%, #070810 100%)",
      }} />

      {/* Centered gradient orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(52,215,123,0.08) 0%, rgba(0,194,224,0.03) 30%, transparent 60%)",
          y: glowY,
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.08) 50%, transparent 90%)" }} />

      <div className="max-w-[1140px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-5">
            Pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-[700] leading-[1.1] tracking-[-0.02em] text-foreground mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            Simple pricing
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-[17px] text-muted-foreground leading-relaxed">
            Start free. Upgrade when you're ready.
          </motion.p>
        </div>

        {/* Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-3 mb-16">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button onClick={() => setIsAnnual(!isAnnual)} className="relative w-12 h-7 rounded-full p-0.5 transition-colors focus:outline-none" style={{ background: "rgba(52,215,123,0.2)" }}>
            <motion.span className="block w-6 h-6 rounded-full bg-primary shadow-md" animate={{ x: isAnnual ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
          <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider" style={{ background: "rgba(52,215,123,0.10)", color: "hsl(148 68% 52%)", border: "1px solid rgba(52,215,123,0.15)" }}>
              -{siteConfig.annualDiscount}%
            </span>
          </span>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 80 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={plan.is_popular ? "md:-mt-4 md:-mb-4" : ""}
                whileHover={{ y: plan.is_popular ? -12 : -8 }}
              >
                <div
                  className={`relative h-full rounded-[28px] p-8 glass transition-all duration-500 ${plan.is_popular ? "border-primary/30" : ""}`}
                  style={plan.is_popular ? { boxShadow: "0 0 100px rgba(52,215,123,0.12), 0 0 40px rgba(52,215,123,0.06)" } : undefined}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-[10px] font-mono tracking-wider uppercase rounded-full" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)", color: "white" }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-display font-[700] mb-1 text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">€</span>
                      <motion.span
                        key={isAnnual ? "annual" : "monthly"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`font-display font-[800] ${plan.is_popular ? "text-gradient" : "text-foreground"}`}
                        style={{ fontSize: plan.is_popular ? "44px" : "36px" }}
                      >
                        {isAnnual ? getAnnualMonthlyPrice(plan) : formatPrice(plan.price_monthly_cents)}
                      </motion.span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>

                  {plan.is_popular && <p className="text-xs text-muted-foreground mb-4">Everything in Starter, plus:</p>}
                  {plan.name === "Agency" && <p className="text-xs text-muted-foreground mb-4">Everything in Pro, plus:</p>}

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(52,215,123,0.10)" }}>
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={plan.name === "Agency" ? "#" : "/signup"} className="block mt-auto">
                    <button
                      className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 ${plan.is_popular ? "" : "border border-foreground/10 text-foreground hover:border-foreground/20"}`}
                      style={plan.is_popular ? {
                        background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)",
                        boxShadow: "0 2px 12px hsla(148, 68%, 52%, 0.3)",
                        color: "white",
                      } : undefined}
                    >
                      {plan.price_monthly_cents === 0 ? "Get Started" : plan.name === "Agency" ? "Contact Us" : "Start Free Trial →"}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-[11px] text-muted-foreground mt-12 font-mono tracking-wider">
          All plans include a 14-day free trial • No credit card required
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
