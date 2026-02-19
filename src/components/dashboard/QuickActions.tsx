import { ExternalLink, UserPlus, BarChart3, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: ExternalLink,
    label: "Test Widget",
    href: "/dashboard/settings",
    description: "Preview your AI chat",
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    icon: UserPlus,
    label: "Invite Team",
    href: "/dashboard/settings",
    description: "Add team members",
    gradient: "from-blue-500/10 to-cyan-500/5",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    description: "View detailed stats",
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    icon: BookOpen,
    label: "Knowledge Base",
    href: "/dashboard/settings",
    description: "Train your AI",
    gradient: "from-amber-500/10 to-orange-500/5",
  },
];

const QuickActions = () => {
  return (
    <div className="rounded-2xl glass-light p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-xl",
              "border border-white/50 hover:border-primary/30",
              "transition-all duration-200 text-center group hover:shadow-md"
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", action.gradient)} />
            <div className="relative">
              <action.icon className="w-5 h-5 text-foreground/50 group-hover:text-primary transition-colors" />
            </div>
            <div className="relative">
              <p className="text-xs font-semibold text-foreground">{action.label}</p>
              <p className="text-[10px] text-foreground/40 leading-tight mt-0.5">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
