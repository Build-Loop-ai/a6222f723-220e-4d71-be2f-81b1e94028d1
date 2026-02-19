import { Lightbulb, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightsPanelProps {
  totalConversations: number;
  totalMessages: number;
  pagesRecommended: number;
  activeVisitors: number;
}

const InsightsPanel = ({ 
  totalConversations, 
  totalMessages, 
  pagesRecommended,
  activeVisitors,
}: InsightsPanelProps) => {
  const avgMessagesPerConversation = totalConversations > 0 
    ? Math.round(totalMessages / totalConversations) 
    : 0;

  const insights = [
    totalConversations > 0 && pagesRecommended > 0 && {
      icon: TrendingUp,
      text: `Your AI recommended ${pagesRecommended} pages to visitors today`,
      color: "text-success",
    },
    activeVisitors > 0 && {
      icon: Clock,
      text: `${activeVisitors} visitor${activeVisitors > 1 ? 's' : ''} currently chatting with your AI`,
      color: "text-info",
    },
    totalConversations === 0 && {
      icon: MessageSquare,
      text: "No conversations yet today. Your AI widget is ready!",
      color: "text-muted-foreground",
    },
    avgMessagesPerConversation > 4 && {
      icon: Lightbulb,
      text: `Average ${avgMessagesPerConversation} messages per conversation — great engagement!`,
      color: "text-warning",
    },
  ].filter(Boolean);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-warning" />
        <h2 className="text-lg font-semibold">Insights</h2>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 3).map((insight, index) => {
          if (!insight) return null;
          const Icon = insight.icon;
          return (
            <div 
              key={index}
              className={cn(
                "flex items-start gap-3 text-sm animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", insight.color)} />
              <p className="text-muted-foreground">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;
