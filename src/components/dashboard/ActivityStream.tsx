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
      <div className="rounded-2xl glass-light p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-foreground/5 animate-pulse rounded-lg" />
          <div className="h-4 w-16 bg-foreground/5 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-foreground/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-foreground/5 animate-pulse rounded-lg" />
                <div className="h-3 w-32 bg-foreground/5 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-light p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Conversations</h2>
        <Link to="/dashboard/conversations">
          <Button variant="ghost" size="sm" className="text-foreground/50 hover:text-foreground hover:bg-white/50">
            See all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-foreground/70 text-sm font-medium">No conversations yet today</p>
          <p className="text-foreground/40 text-xs mt-1">
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
                  "flex items-center gap-4 p-3 -mx-3 rounded-xl transition-all",
                  "hover:bg-white/60 cursor-pointer group",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Status indicator */}
                <div className="relative">
                  <span className={cn(
                    "block w-2.5 h-2.5 rounded-full",
                    isActive ? "bg-success" : "bg-foreground/15"
                  )} />
                  {isActive && (
                    <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping" />
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-foreground/40 w-20 shrink-0 font-medium">
                  {formatTime(conv.started_at)}
                </span>

                {/* Visitor */}
                <span className="font-mono text-sm text-foreground/70 w-24 shrink-0 truncate">
                  {conv.visitor_id.slice(0, 8)}
                </span>

                {/* Channel */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ChannelIcon className="w-4 h-4 shrink-0 text-foreground/40" />
                  <span className="text-sm text-foreground/50 truncate">
                    {conv.channel === "voice" ? "Voice" : "Text chat"}
                  </span>
                  {conv.page_url && (
                    <span className="text-xs text-foreground/30 truncate hidden md:inline">
                      • {new URL(conv.page_url).pathname}
                    </span>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-foreground/0 group-hover:text-foreground/40 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityStream;
