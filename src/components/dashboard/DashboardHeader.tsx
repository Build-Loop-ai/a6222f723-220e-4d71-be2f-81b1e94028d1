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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/40">
          {today}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {getGreeting()}
          {userName && (
            <>
              ,{" "}
              <span className="bg-gradient-to-r from-primary via-green to-cyan bg-clip-text text-transparent">
                {userName.split(" ")[0]}
              </span>
            </>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
            "backdrop-blur-md",
            isLive
              ? "bg-success/10 text-success border border-success/15 shadow-sm shadow-success/10"
              : "bg-foreground/5 text-muted-foreground border border-foreground/10"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              isLive ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            {isLive ? "Widget Live" : "Offline"}
          </div>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground/45 bg-warning/8 px-2.5 py-1 rounded-full border border-warning/10">
              <Zap className="w-3.5 h-3.5 text-warning" />
              AI Active
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {widgetId && (
          <Button variant="outline" size="sm" onClick={handleCopyEmbed} className="glass-light-subtle border-white/50 text-foreground hover:border-primary/30 hover:shadow-md transition-all">
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Embed</span>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild className="glass-light-subtle border-white/50 text-foreground hover:border-primary/30 hover:shadow-md transition-all">
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
