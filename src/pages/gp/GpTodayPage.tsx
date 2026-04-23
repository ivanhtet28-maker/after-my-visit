import { useNavigate } from "react-router-dom";
import GpLayout from "@/components/gp/GpLayout";
import { GP_DEMO_DOCTOR, GP_DEMO_PATIENTS, GP_DEMO_STATS, GP_DEMO_TODAY_APPOINTMENTS, getGpPatient } from "@/data/gpDemoData";
import { Users, Inbox, AlertTriangle, ClipboardCheck, CalendarDays, ChevronRight } from "lucide-react";

const riskBadge = (r: string) => {
  if (r === "high") return "bg-destructive/10 text-destructive";
  if (r === "moderate") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
};

const GpTodayPage = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const stats = [
    { label: "Shared Patients", value: GP_DEMO_STATS.shared_patients, icon: Users },
    { label: "Unread Visits", value: GP_DEMO_STATS.unread_visits, icon: Inbox },
    { label: "High Risk", value: GP_DEMO_STATS.high_risk, icon: AlertTriangle },
    { label: "Today's Appts", value: GP_DEMO_STATS.appointments_today, icon: CalendarDays },
  ];

  return (
    <GpLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">
            Good morning, {GP_DEMO_DOCTOR.title} {GP_DEMO_DOCTOR.last_name}
          </h1>
          <p className="text-muted-foreground">{GP_DEMO_PATIENTS.filter((p) => p.unread).length} new visit summaries shared with you since yesterday.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's appointments</h2>
              <span className="text-xs text-muted-foreground">{GP_DEMO_TODAY_APPOINTMENTS.length} scheduled</span>
            </div>
            <div className="space-y-2">
              {GP_DEMO_TODAY_APPOINTMENTS.map((appt) => {
                const p = getGpPatient(appt.patient_id);
                if (!p) return null;
                return (
                  <button
                    key={appt.patient_id + appt.time}
                    onClick={() => navigate(`/gp/patients/${p.id}`)}
                    className="flex w-full items-center justify-between rounded-xl border bg-background p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium text-primary">{appt.time}</div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${p.avatar_color}`}>
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{p.first_name} {p.last_name} <span className="font-normal text-muted-foreground">· {p.age}{p.gender[0]}</span></p>
                        <p className="text-xs text-muted-foreground">{appt.reason} · {appt.duration} min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${riskBadge(p.risk_level)}`}>{p.risk_level}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Action queue
            </h2>
            <div className="space-y-3">
              {GP_DEMO_PATIENTS.filter((p) => p.pending_actions > 0).slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/gp/patients/${p.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border bg-background p-3 text-left text-sm hover:border-primary/40"
                >
                  <span className="font-medium text-card-foreground">{p.first_name} {p.last_name}</span>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    {p.pending_actions} pending
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpTodayPage;
