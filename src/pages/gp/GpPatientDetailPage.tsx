import { useNavigate, useParams } from "react-router-dom";
import GpLayout from "@/components/gp/GpLayout";
import { Button } from "@/components/ui/button";
import { getGpPatient } from "@/data/gpDemoData";
import { ArrowLeft, AlertTriangle, Pill, FlaskConical, ClipboardCheck, FileText, CalendarDays, Phone, Mail, Download, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const riskBadge = (r: string) => {
  if (r === "high") return "bg-destructive/10 text-destructive";
  if (r === "moderate") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
};

const labStatus = (s: string) => {
  if (s === "high") return "text-destructive";
  if (s === "low") return "text-amber-600 dark:text-amber-400";
  if (s === "borderline") return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
};

const GpPatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = id ? getGpPatient(id) : undefined;

  if (!p) {
    return (
      <GpLayout>
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">Patient not found.</p>
          <Button onClick={() => navigate("/gp/patients")} className="mt-4">Back to patients</Button>
        </div>
      </GpLayout>
    );
  }

  return (
    <GpLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Patient header */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${p.avatar_color}`}>
                {p.first_name[0]}{p.last_name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{p.first_name} {p.last_name}</h1>
                <p className="text-sm text-muted-foreground">{p.age} years · {p.gender} · {p.state}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase ${riskBadge(p.risk_level)}`}>{p.risk_level} risk</span>
                  {p.alerts.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                      <AlertTriangle className="h-3 w-3" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Demo mode — message would be sent to patient")}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("PDF summary downloaded (demo)")}>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>

          {p.next_appointment && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-card-foreground">
                Next appointment: <span className="font-medium">{new Date(p.next_appointment.date).toLocaleDateString("en-AU")}</span> at {p.next_appointment.time} — {p.next_appointment.reason}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conditions */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4" /> Active conditions
            </h3>
            <ul className="space-y-2 text-sm">
              {p.conditions.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-card-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Medications */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Pill className="h-4 w-4" /> Current medications
            </h3>
            <ul className="space-y-3 text-sm">
              {p.medications.map((m) => (
                <li key={m.name}>
                  <p className="font-medium text-card-foreground">{m.name} {m.dosage}</p>
                  <p className="text-xs text-muted-foreground">{m.frequency} {m.is_pbs && <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">PBS</span>}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Labs */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FlaskConical className="h-4 w-4" /> Recent labs
            </h3>
            {p.labs && p.labs.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {p.labs.map((l) => (
                  <li key={l.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-card-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString("en-AU")}</p>
                    </div>
                    <p className={`font-mono text-sm font-semibold ${labStatus(l.status)}`}>
                      {l.value} <span className="text-xs font-normal text-muted-foreground">{l.unit}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No recent results.</p>
            )}
          </div>
        </div>

        {/* Visit history */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Shared visit history
          </h2>
          <div className="space-y-3">
            {p.visits.map((v) => (
              <div key={v.id} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{new Date(v.visit_date).toLocaleDateString("en-AU", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}</p>
                    <p className="font-semibold text-card-foreground">{v.doctor_name} · {v.clinic_name}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">{v.visit_type.replace("_", " ")}</span>
                </div>
                <p className="mt-3 text-sm text-card-foreground">{v.quick_summary}</p>

                {v.urgency_flags && v.urgency_flags.length > 0 && (
                  <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <strong>Flag:</strong> {v.urgency_flags.join(" · ")}
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment</p>
                    <p className="mt-1 text-sm text-card-foreground">{v.assessment}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</p>
                    <ul className="mt-1 space-y-1 text-sm text-card-foreground">
                      {v.plan.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpPatientDetailPage;
