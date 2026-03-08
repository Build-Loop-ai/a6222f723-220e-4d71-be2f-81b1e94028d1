import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, MessageSquare, Mic, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import EmptyState from "@/components/dashboard/EmptyState";
import { toast } from "sonner";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  visitor_id: string;
  channel: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  page_url: string | null;
  message_count?: number;
}

const DashboardConversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

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

        const { data, error } = await supabase
          .from("conversations")
          .select("id, visitor_id, channel, started_at, ended_at, status, page_url")
          .eq("organization_id", profile.organization_id)
          .order("started_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        // Get message counts per conversation
        const convIds = (data || []).map((c) => c.id);
        if (convIds.length > 0) {
          // Fetch message counts per conversation individually to avoid 1000-row limit
          const countMap: Record<string, number> = {};
          await Promise.all(
            convIds.map(async (id) => {
              const { count } = await supabase
                .from("chat_messages")
                .select("id", { count: "exact", head: true })
                .eq("conversation_id", id);
              countMap[id] = count || 0;
            })
          );

          const countMap: Record<string, number> = {};
          (msgCounts || []).forEach((m) => {
            countMap[m.conversation_id] = (countMap[m.conversation_id] || 0) + 1;
          });

          setConversations(
            (data || []).map((c) => ({ ...c, message_count: countMap[c.id] || 0 }))
          );
        } else {
          setConversations(data || []);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const filtered = conversations.filter((conv) => {
    const matchesSearch = searchQuery
      ? conv.visitor_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.page_url?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesChannel = channelFilter === "all" ? true : conv.channel === channelFilter;
    const matchesStatus = statusFilter === "all" ? true : conv.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No conversations to export");
      return;
    }
    const headers = ["Date", "Visitor", "Channel", "Status", "Messages", "Page URL"];
    const csvRows = [headers.join(",")];
    filtered.forEach((c) => {
      csvRows.push([
        c.started_at ? format(parseISO(c.started_at), "yyyy-MM-dd HH:mm") : "-",
        c.visitor_id.slice(0, 8),
        c.channel,
        c.status,
        c.message_count || 0,
        c.page_url || "-",
      ].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversations exported");
  };

  const getDuration = (conv: Conversation) => {
    if (!conv.ended_at) return conv.status === "active" ? "Ongoing" : "-";
    const start = new Date(conv.started_at).getTime();
    const end = new Date(conv.ended_at).getTime();
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Conversations</h1>
          <p className="text-muted-foreground text-sm">
            View all chat conversations from your AI widget.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by visitor or page URL..."
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-card border-border">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversation Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Conversations will appear here once visitors start chatting with your AI widget"
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/dashboard/conversations/${conv.id}`)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-card cursor-pointer hover:border-primary/30 transition-colors"
            >
              {/* Channel icon */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                conv.channel === "voice" ? "bg-primary/10" : "bg-muted"
              )}>
                {conv.channel === "voice" ? (
                  <Mic className="w-5 h-5 text-primary" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">
                    Visitor {conv.visitor_id.slice(0, 8)}
                  </span>
                  <Badge variant="secondary" className={cn(
                    "text-xs",
                    conv.status === "active" ? "bg-success/10 text-success" : ""
                  )}>
                    {conv.status === "active" ? "Active" : "Ended"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{formatDistanceToNow(parseISO(conv.started_at), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{getDuration(conv)}</span>
                  {conv.message_count ? (
                    <>
                      <span>•</span>
                      <span>{conv.message_count} messages</span>
                    </>
                  ) : null}
                  {conv.page_url && (
                    <>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline truncate max-w-[200px]">
                        <Globe className="w-3 h-3 inline mr-1" />
                        {conv.page_url}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardConversations;
