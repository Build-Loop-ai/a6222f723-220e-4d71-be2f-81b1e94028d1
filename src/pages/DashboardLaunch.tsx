import { LaunchChecklist } from "@/components/launch/LaunchChecklist";

const DashboardLaunch = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Go Live</h1>
        <p className="text-muted-foreground mt-1">
          Everything between your remix and a working widget — checked for you.
        </p>
      </div>
      <LaunchChecklist />
    </div>
  );
};

export default DashboardLaunch;
