import { useState, useMemo } from "react";
import { useDemoMode } from "@/hooks/useDemoMode";
import GpLayout from "@/components/GpLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PatientRow {
  id: string;
  initial: string;
  lastVisit: string;
  doctor: string;
  duration: string;
  visitType: string;
}

const DEMO_PATIENTS: PatientRow[] = [
  { id: "p1", initial: "K", lastVisit: "2026-04-07", doctor: "Dr. Helen Zhao", duration: "18 min", visitType: "GP" },
  { id: "p2", initial: "M", lastVisit: "2026-04-07", doctor: "Dr. James Patel", duration: "12 min", visitType: "Telehealth" },
  { id: "p3", initial: "R", lastVisit: "2026-04-07", doctor: "Dr. Helen Zhao", duration: "25 min", visitType: "GP" },
  { id: "p4", initial: "J", lastVisit: "2026-04-06", doctor: "Dr. James Patel", duration: "15 min", visitType: "GP" },
  { id: "p5", initial: "A", lastVisit: "2026-04-06", doctor: "Dr. Helen Zhao", duration: "10 min", visitType: "Telehealth" },
  { id: "p6", initial: "S", lastVisit: "2026-04-05", doctor: "Dr. Sarah Kim", duration: "20 min", visitType: "GP" },
  { id: "p7", initial: "T", lastVisit: "2026-04-05", doctor: "Dr. Helen Zhao", duration: "14 min", visitType: "GP" },
  { id: "p8", initial: "L", lastVisit: "2026-04-04", doctor: "Dr. James Patel", duration: "22 min", visitType: "Specialist" },
  { id: "p9", initial: "D", lastVisit: "2026-04-04", doctor: "Dr. Helen Zhao", duration: "8 min", visitType: "Telehealth" },
  { id: "p10", initial: "B", lastVisit: "2026-04-03", doctor: "Dr. James Patel", duration: "16 min", visitType: "GP" },
  { id: "p11", initial: "N", lastVisit: "2026-04-03", doctor: "Dr. Sarah Kim", duration: "30 min", visitType: "GP" },
  { id: "p12", initial: "P", lastVisit: "2026-04-02", doctor: "Dr. Helen Zhao", duration: "11 min", visitType: "GP" },
  { id: "p13", initial: "W", lastVisit: "2026-04-01", doctor: "Dr. James Patel", duration: "19 min", visitType: "Telehealth" },
];

const visitTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    GP: "bg-primary/10 text-primary",
    Specialist: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Telehealth: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  };
  return map[type] || "bg-muted text-muted-foreground";
};

const GpClinicPatientsPage = () => {
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");

  const patients = isDemoMode ? DEMO_PATIENTS : [];

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => p.doctor.toLowerCase().includes(q));
  }, [patients, search]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <GpLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">
            Metadata only — GPs do not have access to summaries, transcripts, or
            health data.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>

        {/* Patient list */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center shadow-card">
            <p className="text-muted-foreground">
              {search.trim()
                ? "No patients match your search"
                : "No patient records yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Last Visit
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {p.initial}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {formatDate(p.lastVisit)}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {p.doctor}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {p.duration}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${visitTypeBadge(p.visitType)}`}
                        >
                          {p.visitType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border bg-card p-4 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {p.initial}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          Patient {p.initial}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(p.lastVisit)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${visitTypeBadge(p.visitType)}`}
                    >
                      {p.visitType}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.doctor}</span>
                    <span>{p.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GpLayout>
  );
};

export default GpClinicPatientsPage;
