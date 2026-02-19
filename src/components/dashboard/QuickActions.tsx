import { ExternalLink, UserPlus, BarChart3, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: ExternalLink,
    label: "Test Widget",
    href: "/dashboard/settings",
    description: "Preview your AI chat",
  },
  {
    icon: UserPlus,
    label: "Invite Team",
    href: "/dashboard/settings",
    description: "Add team members",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    description: "View detailed stats",
  },
  {
    icon: BookOpen,
    label: "Knowledge Base",
    href: "/dashboard/settings",
    description: "Train your AI",
  },
];

const QuickActions = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg",
              "border border-border hover:border-primary/30 hover:bg-primary/5",
              "transition-all duration-200 text-center group"
            )}
          >
            <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
              <p className="text-xs font-medium">{action.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
