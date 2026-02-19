import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isToday, parseISO } from "date-fns";
import StatusHero from "@/components/dashboard/StatusHero";
import ActivityStream from "@/components/dashboard/ActivityStream";
import InsightsPanel from "@/components/dashboard/InsightsPanel";

interface ConversationRow {
  id: string;
  visitor_id: string;
  channel: string;
  started_at: string;
  status: string;
  page_url: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [pagesRecommended, setPagesRecommended] = useState(0);
  const [userName, setUserName] = useState("");
  const [hasWidget, setHasWidget] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id, full_name")
          .eq("id", user.id)
          .single();

        if (!profile?.organization_id) {
          setLoading(false);
          return;
        }

        setUserName(profile.full_name || user.email?.split("@")[0] || "");

        const [convRes, widgetRes] = await Promise.all([
          supabase
            .from("conversations")
            .select("id, visitor_id, channel, started_at, status, page_url")
            .eq("organization_id", profile.organization_id)
            .order("started_at", { ascending: false })
            .limit(50),
          supabase
            .from("widget_configs")
            .select("id")
            .eq("organization_id", profile.organization_id)
            .maybeSingle(),
        ]);

        const allConvs = convRes.data || [];
        setConversations(allConvs);
        setHasWidget(!!widgetRes.data);

        // Get today's conversation IDs
        const todayConvs = allConvs.filter(
          (c) => isToday(parseISO(c.started_at))
        );
        const todayIds = todayConvs.map((c) => c.id);

        if (todayIds.length > 0) {
          // Count messages and pages recommended for today's conversations
          const { count: msgCount } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", todayIds)
            .eq("role", "assistant");

          setMessageCount(msgCount || 0);

          const { count: pagesCount } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", todayIds)
            .not("suggested_url", "is", null);

          setPagesRecommended(pagesCount || 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const todayConversations = conversations.filter(
    (c) => isToday(parseISO(c.started_at))
  );
  const activeVisitors = conversations.filter((c) => c.status === "active").length;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <StatusHero
        isLive={hasWidget}
        totalConversations={todayConversations.length}
        activeVisitors={activeVisitors}
        messagesSent={messageCount}
        pagesRecommended={pagesRecommended}
        userName={userName}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <ActivityStream 
          conversations={todayConversations.slice(0, 5)}
          isLoading={loading}
        />
        
        <InsightsPanel
          totalConversations={todayConversations.length}
          totalMessages={messageCount}
          pagesRecommended={pagesRecommended}
          activeVisitors={activeVisitors}
        />
      </div>
    </div>
  );
};

export default Dashboard;
