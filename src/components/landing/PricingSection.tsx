import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
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

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        if (error) throw error;
        const transformedPlans = (data || []).map((plan) => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features as string[] : typeof plan.features === "string" ? JSON.parse(plan.features) : [],
        }));
        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
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
    <section id="pricing" ref={ref} className="relative py-32 md:py-40 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
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
            className="font-display font-700 leading-[1.1] tracking-[-0.02em] text-foreground mb-5"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Simple, honest <span className="text-gradient">pricing</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-[17px] text-muted-foreground max-w-[640px] leading-relaxed">
            No hidden fees. No contracts. Cancel anytime.
          </motion.p>
        </div>

        {/* Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-3 mb-16">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button onClick={() => setIsAnnual(!isAnnual)} className="relative w-12 h-7 rounded-full bg-primary/20 p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <motion.span className="block w-6 h-6 rounded-full bg-primary shadow-md" animate={{ x: isAnnual ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
          <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider" style={{ background: "hsl(148 68% 52% / 0.10)", color: "hsl(148 68% 52%)", border: "1px solid hsl(148 68% 52% / 0.15)" }}>
              -{siteConfig.annualDiscount}%
            </span>
          </span>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div className="flex md:grid md:grid-cols-3 gap-5 max-w-5xl overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x-mandatory scrollbar-hide px-4 md:px-0">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                className={`flex-shrink-0 w-[85%] md:w-auto snap-center ${plan.is_popular ? "md:-my-4" : ""}`}
              >
                <div className={`relative h-full rounded-[28px] p-8 transition-all duration-500 ${plan.is_popular ? "glass border-primary/20" : "glass"}`}
                  style={plan.is_popular ? { boxShadow: "0 0 80px hsl(148 68% 52% / 0.08)" } : undefined}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-[10px] font-mono tracking-wider uppercase rounded-full text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)" }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-display font-700 mb-1 text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">{siteConfig.currencySymbol}</span>
                      <motion.span key={isAnnual ? "annual" : "monthly"} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-display font-800 text-gradient" style={{ fontSize: "48px" }}>
                        {isAnnual ? getAnnualMonthlyPrice(plan) : formatPrice(plan.price_monthly_cents)}
                      </motion.span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.minutes_included && (
                      <li className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"><Check className="w-3 h-3 text-primary" /></div>
                        <span className="text-sm text-muted-foreground">{plan.minutes_included} conversations/month</span>
                      </li>
                    )}
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"><Check className="w-3 h-3 text-primary" /></div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/signup" className="block">
                    <button
                      className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 ${plan.is_popular ? "text-primary-foreground" : "text-foreground border border-foreground/10 hover:border-foreground/20"}`}
                      style={plan.is_popular ? { background: "linear-gradient(135deg, hsl(148 68% 52%) 0%, hsl(190 100% 44%) 100%)", boxShadow: "0 2px 12px hsla(148, 68%, 52%, 0.3)" } : undefined}
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="text-center py-20"><p className="text-muted-foreground">Pricing plans coming soon.</p></div>
        )}

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm text-muted-foreground mt-12 font-mono text-[11px] tracking-wider">
          All plans include a {siteConfig.trialDays}-day free trial • No credit card required
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
