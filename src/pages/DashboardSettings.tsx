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
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
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
        <h1 className="text-3xl font-serif text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings and AI configuration.
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="business" className="gap-2">
            <Building className="w-4 h-4" />
            My Business
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          {organizationId && <BusinessSettings organizationId={organizationId} />}
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Invite and manage team members.</CardDescription>
              </div>
              <Button className="gap-2" onClick={() => setShowInviteDialog(true)}>
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
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
