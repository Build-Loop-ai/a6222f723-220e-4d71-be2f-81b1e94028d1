import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import CommandPalette from "@/components/CommandPalette";

const FULL_BLEED_ROUTES = ["/dashboard/widget"];

const DashboardLayout = () => {
  const location = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      <CommandPalette />
      <div className="light-theme min-h-screen flex w-full gradient-mesh relative overflow-hidden">
        {/* Top gradient accent line – hidden on widget builder (it has its own toolbar) */}
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-emerald-500 to-cyan-500 z-50 opacity-70" />
        
        {/* Desktop sidebar */}
        <DashboardSidebar />
        
        {/* Main content – scrolls independently */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <main className={
            isFullBleed
              ? "flex-1 flex flex-col min-h-0"
              : "flex-1 p-5 md:p-10 pb-24 md:pb-10 max-w-6xl mx-auto w-full"
          }>
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </>
  );
};

export default DashboardLayout;
