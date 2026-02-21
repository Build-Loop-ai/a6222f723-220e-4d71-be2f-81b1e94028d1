import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetSettings } from "@/components/settings/WidgetSettings";
import { GoogleCalendarIntegration } from "@/components/settings/GoogleCalendarIntegration";
import { Separator } from "@/components/ui/separator";

const DashboardWidget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgId = async () => {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.organization_id) {
          setOrganizationId(profile.organization_id);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgId();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No organization found. Please complete onboarding first.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Widget Builder</h1>
        <p className="text-muted-foreground">
          Configure your chat widget appearance, behavior, and connected integrations.
        </p>
      </div>

      <WidgetSettings organizationId={organizationId} />

      <Separator />

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Connected Integrations</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Services that power your widget's capabilities.
        </p>
        <GoogleCalendarIntegration organizationId={organizationId} />
      </div>
    </div>
  );
};

export default DashboardWidget;
