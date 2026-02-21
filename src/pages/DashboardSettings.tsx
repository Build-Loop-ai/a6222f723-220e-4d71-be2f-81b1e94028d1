import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Users,
  CreditCard,
  Plus,
  Settings as SettingsIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessSettings } from "@/components/settings/BusinessSettings";
import { InviteMemberDialog } from "@/components/settings/InviteMemberDialog";
import { TeamMembersList } from "@/components/settings/TeamMembersList";
import { BillingCard } from "@/components/settings/BillingCard";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  id: string;
  plan: string | null;
  status: string | null;
  minutes_used: number | null;
  minutes_included: number | null;
  current_period_end: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
  profile: {
    full_name: string | null;
    email: string | null;
    created_at?: string;
  } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const DashboardSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const fetchTeamData = useCallback(async (orgId: string) => {
    try {
      const { data: rolesRes } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .eq("organization_id", orgId);

      if (rolesRes && rolesRes.length > 0) {
        const userIds = rolesRes.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .in("id", userIds);

        setTeamMembers(
          rolesRes.map((role) => ({
            ...role,
            profile: profiles?.find((p) => p.id === role.user_id) || null,
          }))
        );
      } else {
        setTeamMembers([]);
      }

      const { data: invitesRes } = await supabase
        .from("invitations")
        .select("id, email, role, status, created_at, expires_at")
        .eq("organization_id", orgId)
        .in("status", ["pending"]);

      setInvitations(invitesRes || []);
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.organization_id) {
          setLoading(false);
          return;
        }

        setOrganizationId(profile.organization_id);

        const { data: subRes } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .maybeSingle();

        if (subRes) setSubscription(subRes);

        await fetchTeamData(profile.organization_id);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, fetchTeamData]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-12 w-full max-w-lg rounded-2xl" />
        <div className="glass-card p-8">
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business profile, team, and subscription.
          </p>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-8">
        <TabsList className="glass-card !rounded-2xl p-1.5 h-auto gap-1 w-full sm:w-auto inline-flex flex-wrap">
          <TabsTrigger
            value="business"
            className="gap-2 rounded-xl px-5 py-2.5 text-[13px] font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Building className="w-4 h-4" />
            My Business
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="gap-2 rounded-xl px-5 py-2.5 text-[13px] font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-2 rounded-xl px-5 py-2.5 text-[13px] font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6 mt-0">
          {organizationId && <BusinessSettings organizationId={organizationId} />}
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-0">
          <div className="glass-card overflow-hidden">
            <div className="p-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50">
              <div>
                <h2 className="text-lg font-serif font-semibold text-foreground">Team Members</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Invite and manage your team.</p>
              </div>
              <Button
                className="gap-2 rounded-xl shadow-md"
                onClick={() => setShowInviteDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </div>
            <div className="p-6">
              {organizationId && user && (
                <TeamMembersList
                  members={teamMembers}
                  invitations={invitations}
                  currentUserId={user.id}
                  organizationId={organizationId}
                  onMemberRemoved={() => fetchTeamData(organizationId)}
                  onInvitationCancelled={() => fetchTeamData(organizationId)}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6 mt-0">
          {organizationId && (
            <BillingCard subscription={subscription} organizationId={organizationId} />
          )}
        </TabsContent>
      </Tabs>

      {organizationId && (
        <InviteMemberDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          organizationId={organizationId}
          onSuccess={() => fetchTeamData(organizationId)}
        />
      )}
    </div>
  );
};

export default DashboardSettings;
