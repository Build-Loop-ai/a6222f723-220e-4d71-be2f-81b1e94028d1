import { Settings, Copy, Zap } from "lucide-react";
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
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {getGreeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}
          <span className="inline-block ml-2 text-2xl md:text-3xl">👋</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
            isLive
              ? "bg-success/15 text-success border border-success/20"
              : "bg-muted text-muted-foreground border border-border"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              isLive ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            {isLive ? "Widget Live" : "Offline"}
          </div>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground/50">
              <Zap className="w-3.5 h-3.5 text-warning" />
              AI Active
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {widgetId && (
          <Button variant="outline" size="sm" onClick={handleCopyEmbed} className="bg-white/60 backdrop-blur-sm border-border text-foreground hover:bg-white/80">
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Embed</span>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild className="bg-white/60 backdrop-blur-sm border-border text-foreground hover:bg-white/80">
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
