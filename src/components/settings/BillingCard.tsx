import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreditCard, Check, ExternalLink, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly_cents: number;
  price_annual_cents: number | null;
  minutes_included: number;
  phone_numbers_limit: number;
  features: string[];
  is_popular: boolean;
}

interface Subscription {
  id: string;
  plan: string | null;
  status: string | null;
  minutes_used: number | null;
  minutes_included: number | null;
  current_period_end: string | null;
  stripe_customer_id?: string | null;
}

interface BillingCardProps {
  subscription: Subscription | null;
  organizationId: string;
}

export const BillingCard = ({ subscription, organizationId }: BillingCardProps) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [processing, setProcessing] = useState(false);

  const minutesUsed = subscription?.minutes_used || 0;
  const minutesIncluded = subscription?.minutes_included || 100;
  const usagePercentage = Math.min(Math.round((minutesUsed / minutesIncluded) * 100), 100);

  const planLabels: Record<string, string> = {
    starter: 'Starter Plan',
    growth: 'Growth Plan',
    enterprise: 'Enterprise Plan',
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      setPlans(data?.map(p => ({
        ...p,
        features: Array.isArray(p.features) ? (p.features as string[]) : []
      })) || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            planSlug: selectedPlan.slug,
            billingPeriod,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = result.url;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to open billing portal');
      }

      window.location.href = result.url;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(0)}`;

  const currentPlan = plans.find(p => p.slug === subscription?.plan);

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/50">
          <h2 className="text-lg font-serif font-semibold text-foreground">Current Plan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your subscription and billing.</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Current Plan Display */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/15">
            <div>
              <div className="text-lg font-serif font-semibold text-primary">
                {planLabels[subscription?.plan || 'starter'] || 'Starter Plan'}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {currentPlan ? formatPrice(currentPlan.price_monthly_cents) : '€97'}/month
                {subscription?.current_period_end && (
                  <>
                    {' · Renews on '}
                    {format(parseISO(subscription.current_period_end), 'MMMM d, yyyy')}
                  </>
                )}
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold capitalize",
                subscription?.status === 'active'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : subscription?.status === 'trialing'
                  ? 'bg-info/10 text-info border border-info/20'
                  : 'bg-warning/10 text-warning border border-warning/20'
              )}
            >
              {subscription?.status || 'trialing'}
            </Badge>
          </div>

          {/* Minutes Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Minutes Usage</div>
                <div className="text-sm text-muted-foreground">
                  {minutesUsed} of {minutesIncluded} minutes used
                </div>
              </div>
              <span className="text-sm font-bold tabular-nums">{usagePercentage}%</span>
            </div>
            <Progress value={usagePercentage} className={cn("h-2.5 rounded-full", usagePercentage > 90 ? 'bg-destructive/10' : '')} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => setShowUpgradeDialog(true)} className="rounded-xl shadow-md gap-2">
              <CreditCard className="w-4 h-4" />
              Change Plan
            </Button>
            {subscription?.stripe_customer_id && (
              <Button variant="outline" onClick={handleManageBilling} disabled={loading} className="rounded-xl gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Billing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
            <DialogDescription>
              Select the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>

          {/* Billing Period Toggle */}
          <div className="flex justify-center gap-4 py-4">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'outline'}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                Save 20%
              </Badge>
            </Button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {plans.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p className="font-medium">Plans coming soon</p>
                <p className="text-sm mt-1">Pricing plans are being configured. Check back later.</p>
              </div>
            )}
            {plans.map((plan) => {
              const isCurrentPlan = subscription?.plan === plan.slug;
              const price = billingPeriod === 'annual' && plan.price_annual_cents
                ? plan.price_annual_cents / 12
                : plan.price_monthly_cents;

              return (
                <div
                  key={plan.id}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${isCurrentPlan ? 'opacity-60' : ''}`}
                  onClick={() => !isCurrentPlan && setSelectedPlan(plan)}
                >
                  {plan.is_popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="font-serif font-medium text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold">{formatPrice(price)}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan && (
                    <Badge variant="secondary" className="w-full justify-center mt-4">
                      Current Plan
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={!selectedPlan || processing}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedPlan ? `Upgrade to ${selectedPlan.name}` : 'Select a Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
