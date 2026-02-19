import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PerformanceCardProps {
  resolved: number;
  escalated: number;
  abandoned: number;
}

const COLORS = [
  "hsl(148 68% 52%)",  // success/resolved
  "hsl(38 92% 50%)",   // warning/escalated
  "hsl(240 4% 45%)",   // muted/abandoned
];

const PerformanceCard = ({ resolved, escalated, abandoned }: PerformanceCardProps) => {
  const total = resolved + escalated + abandoned;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const data = [
    { name: "Resolved", value: resolved },
    { name: "Escalated", value: escalated },
    { name: "Abandoned", value: abandoned },
  ].filter(d => d.value > 0);

  const hasData = total > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">AI Performance</h3>

      {hasData ? (
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-xl font-bold">{resolutionRate}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {[
              { label: "Resolved", value: resolved, color: "bg-success" },
              { label: "Escalated", value: escalated, color: "bg-warning" },
              { label: "Abandoned", value: abandoned, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-medium tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No conversation data yet
        </div>
      )}
    </div>
  );
};

export default PerformanceCard;
