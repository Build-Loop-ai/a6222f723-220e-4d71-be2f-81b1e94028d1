import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import CommandPalette from "@/components/CommandPalette";

const DashboardLayout = () => {
  return (
    <>
      <CommandPalette />
      <div className="light-theme min-h-screen flex w-full gradient-mesh relative">
        {/* Top gradient accent line */}
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-emerald-500 to-cyan-500 z-50 opacity-70" />
        
        {/* Desktop sidebar */}
        <DashboardSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-5 md:p-10 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
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
