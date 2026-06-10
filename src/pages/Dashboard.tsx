import { useEffect, useState } from "react";
import { toast } from "sonner";
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

interface CallLogRow {
  id: string;
  caller_number: string | null;
  direction: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  created_at: string;
  summary: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogRow[]>([]);
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

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [convRes, callRes, widgetRes] = await Promise.all([
          supabase
            .from("conversations")
            .select("id, visitor_id, channel, started_at, ended_at, status, page_url")
            .eq("organization_id", profile.organization_id)
            .gte("started_at", todayStart.toISOString())
            .order("started_at", { ascending: false })
            .limit(200),
          supabase
            .from("call_logs")
            .select("id, caller_number, direction, started_at, ended_at, duration_seconds, outcome, created_at, summary")
            .eq("organization_id", profile.organization_id)
            .gte("created_at", todayStart.toISOString())
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("widget_configs")
            .select("id")
            .eq("organization_id", profile.organization_id)
            .maybeSingle(),
        ]);

        const allConvs = (convRes.data || []) as ConversationRow[];
        const allCalls = (callRes.data || []) as CallLogRow[];
        setConversations(allConvs);
        setCallLogs(allCalls);
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
        toast.error("Couldn't load your dashboard. Please refresh to try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const todayConversations = conversations.filter((c) => isToday(parseISO(c.started_at)));
  const todayCalls = callLogs.filter((c) => isToday(parseISO(c.created_at)));

  // Active visitors = unique active text conversation visitor_ids
  const activeVisitorIds = new Set(
    conversations.filter((c) => c.status === "active").map((c) => c.visitor_id)
  );
  const activeVisitors = activeVisitorIds.size;

  // Merge text conversations and voice calls into unified activity stream
  const mergedActivity: ConversationRow[] = [
    ...todayConversations,
    ...todayCalls.map((call) => ({
      id: call.id,
      visitor_id: call.caller_number || "Voice caller",
      channel: "voice" as string,
      started_at: call.started_at || call.created_at,
      ended_at: call.ended_at,
      status: call.outcome === "completed" || call.outcome === "info_provided" ? "ended" : (call.outcome || "ended"),
      page_url: null,
    })),
  ].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  // Total interactions = text + voice
  const totalInteractions = todayConversations.length + todayCalls.length;

  // Performance metrics combining text + voice
  const resolvedConvs = todayConversations.filter((c) => c.status === "ended" || c.status === "completed").length;
  const resolvedCalls = todayCalls.filter((c) => c.outcome === "completed" || c.outcome === "info_provided" || c.outcome === "appointment_booked").length;
  const resolved = resolvedConvs + resolvedCalls;

  const abandonedConvs = todayConversations.filter((c) => c.status === "abandoned").length;
  const missedCalls = todayCalls.filter((c) => c.outcome === "missed" || c.outcome === "voicemail").length;
  const abandoned = abandonedConvs + missedCalls;

  const escalatedConvs = todayConversations.filter((c) => c.status === "escalated" || c.status === "transferred").length;
  const transferredCalls = todayCalls.filter((c) => c.outcome === "transferred").length;
  const escalated = escalatedConvs + transferredCalls;

  const satisfactionScore = totalInteractions > 0
    ? Math.round((resolved / totalInteractions) * 100)
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
        conversationsToday={totalInteractions}
        activeVisitors={activeVisitors}
        messagesSent={messageCount}
        avgResponseTime={avgResponseTime}
        pagesRecommended={pagesRecommended}
        satisfactionScore={satisfactionScore}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ActivityStream
            conversations={mergedActivity.slice(0, 8)}
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
