import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Conversations", href: "/dashboard/conversations" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: BookOpen, label: "Knowledge Base", href: "/dashboard/settings" },
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
  const displayName = user?.email?.split("@")[0] || "User";

  return (
    <aside className="hidden md:flex h-screen sticky top-0 transition-all duration-300 flex-col w-[272px] glass-sidebar">
      {/* Ambient glow from primary */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/[0.06] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/[0.04] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative p-6 pb-5">
        <Link to="/dashboard" className="flex items-center gap-3">
          {config.logoUrlDark ? (
            <img src={config.logoUrlDark} alt={config.name} className="h-9 w-auto object-contain" />
          ) : config.logoUrl ? (
            <img src={config.logoUrl} alt={config.name} className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-black tracking-tight bg-gradient-to-br from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Greet
            </span>
          )}
          {(config.logoUrl || config.logoUrlDark) && (
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-foreground leading-tight">
                {config.name}
              </span>
            </div>
          )}
          {!config.logoUrl && !config.logoUrlDark && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/35">
              Dashboard
            </span>
          )}
        </Link>
      </div>

      {/* Divider */}
      <div className="relative mx-5 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      {/* Navigation */}
      <nav className="relative flex-1 px-4 py-5 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-[13px] group",
                isActive
                  ? "text-foreground font-semibold bg-foreground/[0.05]"
                  : "text-foreground/55 hover:text-foreground hover:bg-foreground/[0.04]"
              )}
            >
              {/* Left accent bar for active item */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-primary to-emerald-500 shadow-sm shadow-primary/30" />
              )}
              
              <item.icon className={cn(
                "w-[18px] h-[18px] flex-shrink-0 transition-all duration-200",
                isActive ? "text-primary" : "group-hover:scale-110 group-hover:text-primary/70"
              )} />
              <span className="flex-1">{item.label}</span>
              
              {/* Hover dot for inactive */}
              {!isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary/40 transition-all duration-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA card – shimmer border */}
      <div className="relative px-4 pb-3">
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-teal-500/5 border border-primary/10 shimmer-border">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Upgrade to Pro</p>
              <p className="text-[11px] text-foreground/45 mt-0.5 leading-relaxed">Unlock advanced AI features & analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative mx-5 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      {/* User Card + Logout */}
      <div className="relative p-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.03] transition-colors cursor-default">
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-white/80">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Online status ring */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate capitalize">
              {displayName}
            </p>
            <p className="text-[11px] text-foreground/35 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-foreground/40 hover:bg-destructive/5 hover:text-destructive transition-all w-full text-[13px] group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
