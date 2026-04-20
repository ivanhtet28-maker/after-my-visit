import { useParams, Link } from "react-router-dom";
import DoctorLayout from "@/components/DoctorLayout";
import { getPatientById, getDoctorVisitsForPatient } from "@/data/demoDoctor";
import { ArrowLeft, ChevronRight, Calendar, User, Heart } from "lucide-react";
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

const DoctorPatientDetailPage = () => {
  const { patientId } = useParams();
  const patient = getPatientById(patientId || "");
  const visits = getDoctorVisitsForPatient(patientId || "");

  if (!patient) {
    return (
      <DoctorLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Patient not found</p>
          <Link to="/doctor/dashboard" className="mt-4 text-primary hover:underline">Back to dashboard</Link>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back */}
        <Link to="/doctor/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        {/* Patient Header */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-card-foreground">{patient.first_name} {patient.last_name}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {patient.age} years old</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {patient.total_visits} visits</span>
                <span>{patient.state}</span>
              </div>
            </div>
          </div>
          {/* Conditions */}
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> Conditions</p>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.split(", ").map((c: string) => (
                <span key={c} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Visit History */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-card-foreground">Visit History</h2>
          </div>
          <div className="divide-y">
            {visits.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground">No visits recorded yet</p>
            ) : (
              visits.map((visit) => (
                <Link
                  key={visit.id}
                  to={`/doctor/patient/${patientId}/visit/${visit.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-card-foreground">{visit.doctor_name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${visitTypeBadge(visit.visit_type)}`}>
                        {visitTypeLabel(visit.visit_type)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {visit.summary?.quick_summary?.slice(0, 100) || "No summary available"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(visit.visit_date), "dd MMM yyyy")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientDetailPage;
