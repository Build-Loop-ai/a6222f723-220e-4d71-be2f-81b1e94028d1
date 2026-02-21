import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { KnowledgeBaseSettings } from "@/components/settings/KnowledgeBaseSettings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

const DashboardKnowledgeBase = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();

      setOrganizationId(profile?.organization_id || null);
      setLoading(false);
    };
    fetchOrg();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Manage the content your AI uses to answer customer questions.
        </p>
      </div>

      {organizationId ? (
        <KnowledgeBaseSettings organizationId={organizationId} />
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Complete onboarding to set up your knowledge base.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardKnowledgeBase;
