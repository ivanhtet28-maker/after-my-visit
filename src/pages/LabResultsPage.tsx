import { useState } from "react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DEMO_LAB_RESULTS } from "@/data/demoPatient";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, TrendingUp, TrendingDown, Minus, FlaskConical } from "lucide-react";

const statusBadge = (status: string) => {
  switch (status) {
    case "high": return "bg-destructive/10 text-destructive border-destructive/20";
    case "low": return "bg-warning/10 text-warning border-warning/20";
    default: return "bg-success/10 text-success border-success/20";
  }
};

const trendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-destructive" />;
    case "improving": return <TrendingDown className="h-4 w-4 text-success" />;
    default: return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

function MiniSparkline({ history, current, status }: { history: Array<{ date: string; value: number }>; current: number; status: string }) {
  if (!history || history.length === 0) return null;

  const allValues = [...history.map(h => h.value), current].reverse();
  const min = Math.min(...allValues) * 0.9;
  const max = Math.max(...allValues) * 1.1;
  const range = max - min || 1;

  const width = 120;
  const height = 32;
  const padding = 4;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = allValues.map((v, i) => {
    const x = padding + (i / (allValues.length - 1)) * usableWidth;
    const y = padding + usableHeight - ((v - min) / range) * usableHeight;
    return `${x},${y}`;
  }).join(" ");

  const strokeColour = status === "normal" ? "hsl(var(--success))" : status === "high" ? "hsl(var(--destructive))" : "hsl(var(--warning))";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <svg width={width} height={height} className="cursor-help">
          <polyline
            points={points}
            fill="none"
            stroke={strokeColour}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Current value dot */}
          {(() => {
            const lastIdx = allValues.length - 1;
            const cx = padding + (lastIdx / (allValues.length - 1)) * usableWidth;
            const cy = padding + usableHeight - ((allValues[lastIdx] - min) / range) * usableHeight;
            return <circle cx={cx} cy={cy} r="3" fill={strokeColour} />;
          })()}
        </svg>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <p className="font-medium">History</p>
          {[...history].reverse().map((h, i) => (
            <p key={i}>{h.date}: {h.value}</p>
          ))}
          <p className="font-medium text-primary">Current: {current}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const LabResultsPage = () => {
  const { isDemoMode } = useDemoMode();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = isDemoMode ? DEMO_LAB_RESULTS : [];
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lab Results</h1>
            {results.length > 0 && (
              <p className="text-sm text-muted-foreground">Blood test from {formatDate(results[0].tested_date)}</p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-muted/50 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">Lab results are for reference only. Your doctor will interpret these results in the context of your overall health.</p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-card">
            <FlaskConical className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No lab results available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-card-hover cursor-pointer"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground">{r.name}</p>
                        <Badge className={`text-xs uppercase ${statusBadge(r.status)}`}>
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Normal range: {r.normal_range}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {r.history.length > 0 && (
                      <MiniSparkline history={r.history} current={r.value} status={r.status} />
                    )}
                    <div className="flex items-center gap-2">
                      {trendIcon(r.trend)}
                      <span className={`text-xl font-bold ${
                        r.status === "high" ? "text-destructive" :
                        r.status === "low" ? "text-warning" :
                        "text-success"
                      }`}>
                        {r.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{r.unit}</span>
                    </div>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <p className="text-sm text-muted-foreground">{r.explanation}</p>
                    {r.history.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-card-foreground mb-1">Previous results:</p>
                        <div className="flex flex-wrap gap-2">
                          {r.history.map((h, i) => (
                            <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                              {h.date}: <span className="font-medium">{h.value} {r.unit}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="gap-1 text-xs text-primary">
                      <Sparkles className="h-3 w-3" /> Ask AI about this result
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LabResultsPage;
