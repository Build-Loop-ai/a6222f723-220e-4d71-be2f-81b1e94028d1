import { MessageSquare, Users, Send, FileText, Clock, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardsRowProps {
  conversationsToday: number;
  activeVisitors: number;
  messagesSent: number;
  avgResponseTime: string;
  pagesRecommended: number;
  satisfactionScore: number;
}

const MetricCardsRow = ({
  conversationsToday,
  activeVisitors,
  messagesSent,
  avgResponseTime,
  pagesRecommended,
  satisfactionScore,
}: MetricCardsRowProps) => {
  const metrics = [
    { label: "Conversations", value: conversationsToday, icon: MessageSquare, accent: false },
    { label: "Live Visitors", value: activeVisitors, icon: Users, accent: true },
    { label: "Messages Sent", value: messagesSent, icon: Send, accent: false },
    { label: "Avg Response", value: avgResponseTime, icon: Clock, accent: false },
    { label: "Pages Shared", value: pagesRecommended, icon: FileText, accent: false },
    { label: "Satisfaction", value: `${satisfactionScore}%`, icon: ThumbsUp, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={cn(
            "rounded-xl border border-border bg-card p-4 space-y-2 animate-fade-in",
            m.accent && "border-success/20 bg-success/5"
          )}
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <m.icon className={cn("w-4 h-4", m.accent && "text-success")} />
            <span className="text-xs font-medium truncate">{m.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-semibold tabular-nums tracking-tight",
              m.accent && "text-success"
            )}>
              {m.value}
            </span>
            {m.accent && activeVisitors > 0 && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCardsRow;
