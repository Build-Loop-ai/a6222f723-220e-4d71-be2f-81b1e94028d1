import { Settings, ExternalLink, Copy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface DashboardHeaderProps {
  userName: string;
  isLive: boolean;
  widgetId?: string;
}

const DashboardHeader = ({ userName, isLive, widgetId }: DashboardHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleCopyEmbed = () => {
    if (!widgetId) return;
    const snippet = `<script src="${window.location.origin}/widget/${widgetId}"></script>`;
    navigator.clipboard.writeText(snippet);
    toast.success("Embed code copied!");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {getGreeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
            isLive
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isLive ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            {isLive ? "Widget Live" : "Offline"}
          </div>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-warning" />
              AI Active
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {widgetId && (
          <Button variant="outline" size="sm" onClick={handleCopyEmbed}>
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Embed</span>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/settings">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
