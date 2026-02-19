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
    { label: "Conversations", value: conversationsToday, icon: MessageSquare, accent: false, gradient: "from-emerald-500/10 to-teal-500/5" },
    { label: "Live Visitors", value: activeVisitors, icon: Users, accent: true, gradient: "from-emerald-500/15 to-green-500/5" },
    { label: "Messages Sent", value: messagesSent, icon: Send, accent: false, gradient: "from-blue-500/10 to-cyan-500/5" },
    { label: "Avg Response", value: avgResponseTime, icon: Clock, accent: false, gradient: "from-violet-500/10 to-purple-500/5" },
    { label: "Pages Shared", value: pagesRecommended, icon: FileText, accent: false, gradient: "from-amber-500/10 to-orange-500/5" },
    { label: "Satisfaction", value: `${satisfactionScore}%`, icon: ThumbsUp, accent: false, gradient: "from-rose-500/10 to-pink-500/5" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={cn(
            "relative overflow-hidden rounded-2xl glass-light p-4 space-y-3 animate-fade-in group cursor-default",
            m.accent && "glass-premium-light"
          )}
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          {/* Gradient tint overlay */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none rounded-2xl", m.gradient)} />
          
          <div className="relative">
            <div className="flex items-center gap-2 text-foreground/50">
              <m.icon className={cn("w-3.5 h-3.5", m.accent && "text-success")} />
              <span className="text-[11px] font-semibold uppercase tracking-wider truncate">{m.label}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className={cn(
                "text-2xl font-bold tabular-nums tracking-tight text-foreground",
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
        </div>
      ))}
    </div>
  );
};

export default MetricCardsRow;
