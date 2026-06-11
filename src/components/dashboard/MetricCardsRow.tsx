import { MessageSquare, Users, Send, Clock, FileText, ThumbsUp } from "lucide-react";
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
    {
      label: "Conversations",
      value: conversationsToday,
      icon: MessageSquare,
      iconColor: "text-primary",
      gradient: "from-primary/12 to-cyan/5",
    },
    {
      label: "Live Visitors",
      value: activeVisitors,
      icon: Users,
      iconColor: "text-green",
      gradient: "from-green/15 to-primary/5",
      pulse: true,
    },
    {
      label: "Messages Sent",
      value: messagesSent,
      icon: Send,
      iconColor: "text-cyan",
      gradient: "from-cyan/12 to-primary/5",
    },
    {
      label: "Avg Response",
      value: avgResponseTime,
      icon: Clock,
      iconColor: "text-green-light",
      gradient: "from-green-light/12 to-cyan/5",
    },
    {
      label: "Pages Shared",
      value: pagesRecommended,
      icon: FileText,
      iconColor: "text-cyan",
      gradient: "from-cyan/12 to-green/5",
    },
    {
      label: "Satisfaction",
      value: `${satisfactionScore}%`,
      icon: ThumbsUp,
      iconColor: "text-primary",
      gradient: "from-primary/10 to-green-light/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, i) => {
        const live = m.pulse && activeVisitors > 0;
        return (
          <div
            key={m.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl glass-light p-4 animate-fade-in cursor-default",
              "transition-transform duration-300 hover:-translate-y-0.5"
            )}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Per-metric gradient tint */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-70 pointer-events-none rounded-2xl",
                m.gradient
              )}
            />

            <div className="relative">
              {/* Icon + live indicator */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 shadow-sm ring-1 ring-white/60",
                    m.iconColor
                  )}
                >
                  <m.icon className="h-4 w-4" />
                </div>
                {live && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                  </span>
                )}
              </div>

              {/* Value */}
              <div
                className={cn(
                  "mt-4 text-3xl font-bold tabular-nums leading-none tracking-tight",
                  live ? "text-success" : "text-foreground"
                )}
              >
                {m.value}
              </div>

              {/* Label — full width below the value, never clipped */}
              <div className="mt-1.5 truncate text-xs font-medium text-foreground/55">
                {m.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCardsRow;
