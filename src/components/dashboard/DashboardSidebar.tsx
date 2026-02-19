import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Conversations", href: "/dashboard/conversations" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: BookOpen, label: "Knowledge Base", href: "/dashboard/settings", match: "/dashboard/settings" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { config } = useSiteConfigTransformed();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <aside className="hidden md:flex glass-light-strong h-screen sticky top-0 transition-all duration-300 flex-col w-64 border-r border-white/40">
      {/* Logo */}
      <div className="p-5 border-b border-white/30">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          {config.logoUrlDark ? (
            <img src={config.logoUrlDark} alt={config.name} className="h-10 w-auto object-contain" />
          ) : config.logoUrl ? (
            <img src={config.logoUrl} alt={config.name} className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-serif text-xl font-semibold text-foreground">
            {config.name}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                isActive
                  ? "bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/25"
                  : "text-foreground/60 hover:bg-white/50 hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/30 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-foreground/50 truncate flex-1 font-medium">
            {user?.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-foreground/50 hover:bg-white/50 hover:text-foreground transition-all w-full text-sm"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
