import GpLayout from "@/components/gp/GpLayout";
import { GP_DEMO_PATIENTS, GP_DEMO_STATS } from "@/data/gpDemoData";
import { TrendingUp, Users, AlertTriangle, ClipboardCheck } from "lucide-react";

const GpAnalyticsPage = () => {
  const conditionCounts = GP_DEMO_PATIENTS.flatMap((p) => p.conditions).reduce<Record<string, number>>((acc, c) => {
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const topConditions = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = Math.max(...topConditions.map(([, n]) => n), 1);

  const riskMix = {
    low: GP_DEMO_PATIENTS.filter((p) => p.risk_level === "low").length,
    moderate: GP_DEMO_PATIENTS.filter((p) => p.risk_level === "moderate").length,
    high: GP_DEMO_PATIENTS.filter((p) => p.risk_level === "high").length,
  };

  return (
    <GpLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <TrendingUp className="h-6 w-6 text-primary" /> Practice analytics
          </h1>
          <p className="text-sm text-muted-foreground">Snapshot of patients sharing visit data with you.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total shared", value: GP_DEMO_STATS.shared_patients, icon: Users },
            { label: "High risk", value: GP_DEMO_STATS.high_risk, icon: AlertTriangle },
            { label: "Pending actions", value: GP_DEMO_STATS.pending_actions_total, icon: ClipboardCheck },
            { label: "Unread visits", value: GP_DEMO_STATS.unread_visits, icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <s.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="text-3xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top conditions</h2>
            <div className="space-y-3">
              {topConditions.map(([cond, n]) => (
                <div key={cond}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-card-foreground">{cond}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(n / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Risk distribution</h2>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="bg-emerald-500" style={{ width: `${(riskMix.low / GP_DEMO_PATIENTS.length) * 100}%` }} />
              <div className="bg-amber-500" style={{ width: `${(riskMix.moderate / GP_DEMO_PATIENTS.length) * 100}%` }} />
              <div className="bg-destructive" style={{ width: `${(riskMix.high / GP_DEMO_PATIENTS.length) * 100}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{riskMix.low}</p><p className="text-xs text-muted-foreground">Low</p></div>
              <div><p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{riskMix.moderate}</p><p className="text-xs text-muted-foreground">Moderate</p></div>
              <div><p className="text-2xl font-bold text-destructive">{riskMix.high}</p><p className="text-xs text-muted-foreground">High</p></div>
            </div>
          </div>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpAnalyticsPage;
