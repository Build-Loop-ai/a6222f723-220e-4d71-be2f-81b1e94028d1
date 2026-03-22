import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PerformanceCardProps {
  resolved: number;
  escalated: number;
  abandoned: number;
}

const COLORS = [
  "hsl(var(--green))",
  "hsl(var(--warning))",
  "hsl(225 12% 65%)",
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
    <div className="rounded-2xl glass-card gradient-border-top p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">AI Performance</h3>

      {hasData ? (
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            {/* Gradient ring behind the chart */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 via-green/10 to-cyan/15 blur-sm" />
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
                <span className="text-xl font-bold text-foreground">{resolutionRate}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 min-w-0">
            {[
              { label: "Resolved", value: resolved, color: "bg-success" },
              { label: "Escalated", value: escalated, color: "bg-warning" },
              { label: "Abandoned", value: abandoned, color: "bg-foreground/30" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-foreground/60 font-medium">{item.label}</span>
                </div>
                <span className="font-bold tabular-nums text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-10 text-center">
          {/* Pulsing placeholder ring */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/15 animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-primary/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground/25">0%</span>
            </div>
          </div>
          <p className="text-sm text-foreground/40 font-medium">No conversation data yet</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceCard;
