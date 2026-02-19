import { MessageSquare, Globe, ArrowRight, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Conversation {
  id: string;
  visitor_id: string;
  channel: string;
  started_at: string;
  status: string;
  page_url: string | null;
  message_count?: number;
}

interface ActivityStreamProps {
  conversations: Conversation[];
  isLoading?: boolean;
}

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
};

const ActivityStream = ({ conversations, isLoading }: ActivityStreamProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Conversations</h2>
        <Link to="/dashboard/conversations">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            See all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No conversations yet today</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Your AI widget is ready to chat
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.slice(0, 5).map((conv, index) => {
            const isActive = conv.status === "active";
            const ChannelIcon = conv.channel === "voice" ? Mic : MessageSquare;

            return (
              <Link
                key={conv.id}
                to={`/dashboard/conversations/${conv.id}`}
                className={cn(
                  "flex items-center gap-4 p-3 -mx-3 rounded-xl transition-colors",
                  "hover:bg-muted/50 cursor-pointer group",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Status indicator */}
                <div className="relative">
                  <span className={cn(
                    "block w-2 h-2 rounded-full",
                    isActive ? "bg-success" : "bg-border"
                  )} />
                  {isActive && (
                    <span className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping" />
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground w-20 shrink-0">
                  {formatTime(conv.started_at)}
                </span>

                {/* Visitor */}
                <span className="font-mono text-sm text-foreground/80 w-24 shrink-0 truncate">
                  {conv.visitor_id.slice(0, 8)}
                </span>

                {/* Channel */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ChannelIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {conv.channel === "voice" ? "Voice" : "Text chat"}
                  </span>
                  {conv.page_url && (
                    <span className="text-xs text-muted-foreground/60 truncate hidden md:inline">
                      • {new URL(conv.page_url).pathname}
                    </span>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityStream;
