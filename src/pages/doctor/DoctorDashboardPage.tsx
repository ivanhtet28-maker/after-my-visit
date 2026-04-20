import { Link } from "react-router-dom";
import DoctorLayout from "@/components/DoctorLayout";
import { DEMO_DOCTOR, DEMO_DOCTOR_PATIENTS, DEMO_ALL_DOCTOR_VISITS, DEMO_DOCTOR_STATS } from "@/data/demoDoctor";
import { Users, Calendar, ClipboardCheck, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

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

const visitTypeLabel = (type: string) => {
  const map: Record<string, string> = { gp: "GP", specialist: "Specialist", telehealth: "Telehealth", allied_health: "Allied Health", emergency: "Emergency" };
  return map[type] || type;
};

const DoctorDashboardPage = () => {
  return (
    <DoctorLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero */}
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold text-card-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {DEMO_DOCTOR.first_name}
          </h1>
          <p className="mt-1 text-muted-foreground">{DEMO_DOCTOR.clinic_name}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Patients", value: DEMO_DOCTOR_STATS.totalPatients, icon: Users, color: "text-primary" },
            { label: "Total Visits", value: DEMO_DOCTOR_STATS.totalVisits, icon: Calendar, color: "text-blue-600" },
            { label: "This Month", value: DEMO_DOCTOR_STATS.visitsThisMonth, icon: ClipboardCheck, color: "text-green-600" },
            { label: "Pending Follow-ups", value: DEMO_DOCTOR_STATS.pendingFollowUps, icon: Clock, color: "text-orange-600" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold text-card-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Patients */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-card-foreground">My Patients</h2>
            <Link to="/doctor/patients" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {DEMO_DOCTOR_PATIENTS.map((patient) => (
              <Link
                key={patient.id}
                to={`/doctor/patient/${patient.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {patient.first_name[0]}{patient.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{patient.first_name} {patient.last_name}</p>
                    <p className="text-sm text-muted-foreground">{patient.age}yo — {patient.conditions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{patient.total_visits} visits</p>
                    <p className="text-xs text-muted-foreground">Last: {format(new Date(patient.last_visit_date), "dd MMM yyyy")}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Visits</h2>
          </div>
          <div className="divide-y">
            {DEMO_ALL_DOCTOR_VISITS.slice(0, 5).map((visit) => (
              <Link
                key={visit.id}
                to={`/doctor/patient/${visit.user_id}/visit/${visit.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium text-card-foreground">{visit.patient_name}</p>
                  <p className="text-sm text-muted-foreground">{visit.summary?.quick_summary?.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${visitTypeBadge(visit.visit_type)}`}>
                    {visitTypeLabel(visit.visit_type)}
                  </span>
                  <span className="text-sm text-muted-foreground">{format(new Date(visit.visit_date), "dd MMM")}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboardPage;
