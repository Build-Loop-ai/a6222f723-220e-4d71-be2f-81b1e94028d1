import { MessageSquare, Users, Send, Clock, FileText, ThumbsUp, TrendingUp } from "lucide-react";
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
      iconColor: "text-emerald-600",
      glowColor: "hover:shadow-emerald-500/10",
      gradient: "from-emerald-500/12 to-teal-500/5",
      hero: true,
    },
    {
      label: "Live Visitors",
      value: activeVisitors,
      icon: Users,
      iconColor: "text-green-600",
      glowColor: "hover:shadow-green-500/10",
      gradient: "from-green-500/15 to-emerald-500/5",
      hero: true,
      pulse: true,
    },
    {
      label: "Messages Sent",
      value: messagesSent,
      icon: Send,
      iconColor: "text-blue-600",
      glowColor: "hover:shadow-blue-500/10",
      gradient: "from-blue-500/12 to-cyan-500/5",
    },
    {
      label: "Avg Response",
      value: avgResponseTime,
      icon: Clock,
      iconColor: "text-violet-600",
      glowColor: "hover:shadow-violet-500/10",
      gradient: "from-violet-500/12 to-purple-500/5",
    },
    {
      label: "Pages Shared",
      value: pagesRecommended,
      icon: FileText,
      iconColor: "text-amber-600",
      glowColor: "hover:shadow-amber-500/10",
      gradient: "from-amber-500/12 to-orange-500/5",
    },
    {
      label: "Satisfaction",
      value: `${satisfactionScore}%`,
      icon: ThumbsUp,
      iconColor: "text-rose-500",
      glowColor: "hover:shadow-rose-500/10",
      gradient: "from-rose-500/10 to-pink-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={cn(
            "relative overflow-hidden rounded-2xl glass-card p-4 space-y-3 animate-fade-in cursor-default group",
            m.hero && "lg:col-span-1",
            m.glowColor,
            "hover:shadow-lg"
          )}
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          {/* Gradient tint overlay */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none rounded-2xl", m.gradient)} />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-white/60 shadow-sm", m.iconColor)}>
                  <m.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">{m.label}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className={cn(
                "text-2xl font-bold tabular-nums tracking-tight text-foreground",
                m.pulse && activeVisitors > 0 && "text-success"
              )}>
                {m.value}
              </span>
              {m.pulse && activeVisitors > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
              )}
              {!m.pulse && (
                <TrendingUp className="w-3.5 h-3.5 text-foreground/20" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCardsRow;
