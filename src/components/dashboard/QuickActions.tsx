import { ExternalLink, UserPlus, BarChart3, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: ExternalLink,
    label: "Test Widget",
    href: "/dashboard/settings",
    description: "Preview your AI chat",
    gradient: "from-primary/12 to-cyan/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: UserPlus,
    label: "Invite Team",
    href: "/dashboard/settings",
    description: "Add team members",
    gradient: "from-cyan/12 to-primary/5",
    iconBg: "bg-cyan/10",
    iconColor: "text-cyan",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    description: "View detailed stats",
    gradient: "from-green-light/12 to-primary/5",
    iconBg: "bg-green-light/10",
    iconColor: "text-green-light",
  },
  {
    icon: BookOpen,
    label: "Knowledge Base",
    href: "/dashboard/settings",
    description: "Train your AI",
    gradient: "from-green/12 to-cyan/5",
    iconBg: "bg-green/10",
    iconColor: "text-green",
  },
];

const QuickActions = () => {
  return (
    <div className="rounded-2xl glass-card p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "relative overflow-hidden flex flex-col items-center gap-2.5 p-5 rounded-xl",
              "border border-white/50 hover:border-primary/30",
              "transition-all duration-300 text-center group",
              "hover:shadow-lg hover:-translate-y-0.5"
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", action.gradient)} />
            {/* Gradient top border */}
            <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary/40 transition-all" />
            <div className="relative">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", action.iconBg, "group-hover:scale-110 transition-transform duration-300")}>
                <action.icon className={cn("w-4.5 h-4.5", action.iconColor)} />
              </div>
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
