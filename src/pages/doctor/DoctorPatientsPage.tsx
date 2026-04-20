import { Link } from "react-router-dom";
import DoctorLayout from "@/components/DoctorLayout";
import { DEMO_DOCTOR_PATIENTS } from "@/data/demoDoctor";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";

const DoctorPatientsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = DEMO_DOCTOR_PATIENTS.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.conditions}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Patients</h1>
          <p className="mt-1 text-muted-foreground">View and manage your patient records</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-xl border bg-card shadow-card">
          <div className="divide-y">
            {filtered.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground">No patients found</p>
            ) : (
              filtered.map((patient) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientsPage;
