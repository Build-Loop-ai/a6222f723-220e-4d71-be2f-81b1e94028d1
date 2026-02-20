import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: MessageSquare, label: "Chats", href: "/dashboard/conversations" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const BottomNav = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-light-strong border-t border-white/40 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                active ? "text-primary" : "text-foreground/40"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                active && "scale-110"
              )} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {active && (
                <span className="absolute bottom-1.5 w-4 h-[2px] rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default BottomNav;
