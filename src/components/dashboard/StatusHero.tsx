import { MessageSquare, Users, Send, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusHeroProps {
  isLive: boolean;
  totalConversations: number;
  activeVisitors: number;
  messagesSent: number;
  pagesRecommended: number;
  userName?: string;
}

const StatusHero = ({
  isLive,
  totalConversations,
  activeVisitors,
  messagesSent,
  pagesRecommended,
  userName,
}: StatusHeroProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const metrics = [
    {
      label: "Conversations today",
      value: totalConversations,
      icon: MessageSquare,
      color: "text-foreground",
    },
    {
      label: "Active visitors",
      value: activeVisitors,
      icon: Users,
      color: "text-success",
    },
    {
      label: "Messages sent",
      value: messagesSent,
      icon: Send,
      color: "text-foreground",
    },
    {
      label: "Pages recommended",
      value: pagesRecommended,
      icon: FileText,
      color: "text-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {getGreeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here's how your AI assistant is performing today
        </p>
      </div>

      {/* Status Card */}
      <div className="relative overflow-hidden rounded-2xl glass-light p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative space-y-6">
          {/* Live Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                isLive 
                  ? "bg-success/10 text-success" 
                  : "bg-muted text-muted-foreground"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isLive ? "bg-success pulse-live" : "bg-muted-foreground"
                )} />
                {isLive ? "Widget Live" : "Offline"}
              </div>
            </div>
            
            {isLive && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-warning" />
                <span>AI Active</span>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {metrics.map((metric, index) => (
              <div 
                key={metric.label}
                className="space-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <metric.icon className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {metric.label}
                  </span>
                </div>
                <p className={cn(
                  "text-3xl md:text-4xl font-semibold tabular-nums tracking-tight",
                  metric.color
                )}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusHero;
