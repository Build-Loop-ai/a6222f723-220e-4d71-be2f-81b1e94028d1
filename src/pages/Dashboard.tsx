import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isToday, parseISO, differenceInSeconds } from "date-fns";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCardsRow from "@/components/dashboard/MetricCardsRow";
import ActivityStream from "@/components/dashboard/ActivityStream";
import PerformanceCard from "@/components/dashboard/PerformanceCard";
import QuickActions from "@/components/dashboard/QuickActions";

interface ConversationRow {
  id: string;
  visitor_id: string;
  channel: string;
  started_at: string;
  ended_at: string | null;
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
  const [widgetId, setWidgetId] = useState<string>();
  const [avgResponseTime, setAvgResponseTime] = useState("—");

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

        // Fetch today's conversations + recent for activity stream
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [convRes, widgetRes] = await Promise.all([
          supabase
            .from("conversations")
            .select("id, visitor_id, channel, started_at, ended_at, status, page_url")
            .eq("organization_id", profile.organization_id)
            .gte("started_at", todayStart.toISOString())
            .order("started_at", { ascending: false })
            .limit(200),
          supabase
            .from("widget_configs")
            .select("id")
            .eq("organization_id", profile.organization_id)
            .maybeSingle(),
        ]);

        const allConvs = (convRes.data || []) as ConversationRow[];
        setConversations(allConvs);
        setHasWidget(!!widgetRes.data);
        if (widgetRes.data) setWidgetId(widgetRes.data.id);

        const todayConvs = allConvs.filter((c) => isToday(parseISO(c.started_at)));
        const todayIds = todayConvs.map((c) => c.id);

        if (todayIds.length > 0) {
          const [msgRes, pagesRes] = await Promise.all([
            supabase
              .from("chat_messages")
              .select("id", { count: "exact", head: true })
              .in("conversation_id", todayIds)
              .eq("role", "assistant"),
            supabase
              .from("chat_messages")
              .select("id", { count: "exact", head: true })
              .in("conversation_id", todayIds)
              .not("suggested_url", "is", null),
          ]);

          setMessageCount(msgRes.count || 0);
          setPagesRecommended(pagesRes.count || 0);

          // Compute avg response time from ended conversations
          const endedToday = todayConvs.filter((c) => c.ended_at);
          if (endedToday.length > 0) {
            const totalSec = endedToday.reduce((sum, c) => {
              return sum + differenceInSeconds(parseISO(c.ended_at!), parseISO(c.started_at));
            }, 0);
            const avgSec = Math.round(totalSec / endedToday.length);
            setAvgResponseTime(avgSec < 60 ? `${avgSec}s` : `${Math.round(avgSec / 60)}m`);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const todayConversations = conversations.filter((c) => isToday(parseISO(c.started_at)));
  const activeVisitors = conversations.filter((c) => c.status === "active").length;

  // Compute performance metrics
  const resolved = todayConversations.filter((c) => c.status === "ended" || c.status === "completed").length;
  const abandoned = todayConversations.filter((c) => c.status === "abandoned").length;
  const escalated = todayConversations.filter((c) => c.status === "escalated" || c.status === "transferred").length;
  const satisfactionScore = todayConversations.length > 0
    ? Math.round(((resolved) / todayConversations.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-3" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader
        userName={userName}
        isLive={hasWidget}
        widgetId={widgetId}
      />

      <MetricCardsRow
        conversationsToday={todayConversations.length}
        activeVisitors={activeVisitors}
        messagesSent={messageCount}
        avgResponseTime={avgResponseTime}
        pagesRecommended={pagesRecommended}
        satisfactionScore={satisfactionScore}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ActivityStream
            conversations={todayConversations.slice(0, 8)}
            isLoading={loading}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <PerformanceCard
            resolved={resolved}
            escalated={escalated}
            abandoned={abandoned}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
