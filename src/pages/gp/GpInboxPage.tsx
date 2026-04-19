import { useNavigate } from "react-router-dom";
import GpLayout from "@/components/gp/GpLayout";
import { GP_DEMO_PATIENTS } from "@/data/gpDemoData";
import { Inbox, AlertTriangle, ChevronRight } from "lucide-react";

const riskBadge = (r: string) => {
  if (r === "high") return "bg-destructive/10 text-destructive";
  if (r === "moderate") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
};

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });

const GpInboxPage = () => {
  const navigate = useNavigate();
  const sorted = [...GP_DEMO_PATIENTS].sort((a, b) => (a.unread === b.unread ? 0 : a.unread ? -1 : 1));

  return (
    <GpLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Inbox className="h-6 w-6 text-primary" /> Inbox
          </h1>
          <p className="text-sm text-muted-foreground">New and recent visit summaries shared by your patients.</p>
        </div>

        <div className="space-y-3">
          {sorted.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/gp/patients/${p.id}`)}
              className={`flex w-full items-start justify-between gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md ${p.unread ? "border-primary/30 bg-primary/[0.02]" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${p.avatar_color}`}>
                  {p.first_name[0]}{p.last_name[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {p.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <p className="font-semibold text-card-foreground">{p.first_name} {p.last_name}</p>
                    <span className="text-xs text-muted-foreground">· {p.age}{p.gender[0]} · {p.state}</span>
                  </div>
                  <p className="text-sm text-card-foreground">{p.last_visit_summary}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">Visit {formatDate(p.last_visit_date)}</span>
                    {p.alerts.slice(0, 1).map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                        <AlertTriangle className="h-3 w-3" /> {a}
                      </span>
                    ))}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase ${riskBadge(p.risk_level)}`}>{p.risk_level} risk</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </GpLayout>
  );
};

export default GpInboxPage;
