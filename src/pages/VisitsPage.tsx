import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_VISITS_V2 } from "@/data/demoPatient";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, ShieldAlert } from "lucide-react";

// A GP-led visit is "pending approval" until the practitioner reviews + sends
// it. Until then, show a friendly waiting state instead of the summary.
const isPendingApproval = (v: any) =>
  !v.approved_at &&
  (v.source === "native_recording" || v.source === "chrome_extension_paste");

// Patient-led recordings are kept as a fallback but are flagged as unverified
// (no GP review). Surface this clearly so the patient knows the difference.
const isUnverified = (v: any) =>
  v.source === "patient_recorded" && !v.approved_at;

const visitTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    gp: "bg-primary/10 text-primary",
    specialist: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    telehealth: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    allied_health: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    emergency: "bg-destructive/10 text-destructive",
  };
  return map[type] || "bg-muted text-muted-foreground";
};

const VisitsPage = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setVisits(DEMO_VISITS_V2);
      setLoading(false);
      return;
    }
    if (!user) return;
    supabase.from("visits").select("*").eq("user_id", user.id).order("visit_date", { ascending: false })
      .then(({ data }) => { setVisits(data ?? []); setLoading(false); });
  }, [user, isDemoMode]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Visits</h1>
          <Button onClick={() => navigate("/visit/new")} className="gap-2"><PlusCircle className="h-4 w-4" /> New Visit</Button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
        ) : visits.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-card">
            <p className="text-muted-foreground">No visits recorded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visits.map((v) => {
              const pending = isPendingApproval(v);
              const unverified = isUnverified(v);
              return (
                <div
                  key={v.id}
                  className="cursor-pointer rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
                  onClick={() => navigate(`/visit/${v.id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">{v.doctor_name || "Unknown Doctor"}</p>
                      <p className="text-sm text-muted-foreground">{v.clinic_name} • {formatDate(v.visit_date)}</p>
                      {pending ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" /> {v.doctor_name || "Your doctor"} is finalising your summary
                        </p>
                      ) : unverified ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                          <ShieldAlert className="h-3 w-3" /> Unverified — not GP-approved
                        </p>
                      ) : (
                        (v.summary as any)?.quick_summary && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{(v.summary as any).quick_summary}</p>
                        )
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${visitTypeBadge(v.visit_type)}`}>
                        {(v.visit_type || "").replace("_", " ")}
                      </span>
                      {pending ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Pending</span>
                      ) : v.bulk_billed ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Bulk Billed</span>
                      ) : v.out_of_pocket ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">${v.out_of_pocket} gap</span>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          v.status === "complete" || v.status === "approved" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}>{v.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VisitsPage;
