import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { WidgetSettings } from "@/components/settings/WidgetSettings";

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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

  return <WidgetSettings organizationId={organizationId} />;
};

export default DashboardWidget;
