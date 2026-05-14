import { useState, useMemo, useEffect } from "react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { usePractitioner } from "@/hooks/usePractitioner";
import { supabase } from "@/integrations/supabase/client";
import GpLayout from "@/components/GpLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Loader2, Users, Mail, UserPlus, X } from "lucide-react";

interface PatientRow {
  id: string;
  name: string;
  initial: string;
  lastVisit: string | null;
  grantedAt: string;
  visitCount: number;
  visitType: string | null;
}

// Demo data for demo mode
const DEMO_PATIENTS: PatientRow[] = [
  { id: "p1", name: "K. Nguyen", initial: "K", lastVisit: "2026-04-07", grantedAt: "2026-03-01", visitCount: 3, visitType: "GP" },
  { id: "p2", name: "M. Chen", initial: "M", lastVisit: "2026-04-07", grantedAt: "2026-02-15", visitCount: 5, visitType: "Telehealth" },
  { id: "p3", name: "R. Thompson", initial: "R", lastVisit: "2026-04-07", grantedAt: "2026-03-10", visitCount: 2, visitType: "GP" },
  { id: "p4", name: "J. Mitchell", initial: "J", lastVisit: "2026-04-06", grantedAt: "2026-01-20", visitCount: 7, visitType: "GP" },
  { id: "p5", name: "A. Patel", initial: "A", lastVisit: "2026-04-06", grantedAt: "2026-03-22", visitCount: 1, visitType: "Telehealth" },
  { id: "p6", name: "S. Williams", initial: "S", lastVisit: "2026-04-05", grantedAt: "2026-02-01", visitCount: 4, visitType: "GP" },
];

const visitTypeBadge = (type: string | null) => {
  const map: Record<string, string> = {
    GP: "bg-primary/10 text-primary",
    gp: "bg-primary/10 text-primary",
    Specialist: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    specialist: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Telehealth: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    telehealth: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    allied_health: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };
  return map[type ?? ""] || "bg-muted text-muted-foreground";
};

const formatVisitType = (type: string | null) => {
  if (!type) return "—";
  const map: Record<string, string> = {
    gp: "GP",
    specialist: "Specialist",
    telehealth: "Telehealth",
    allied_health: "Allied Health",
  };
  return map[type] || type;
};

const GpClinicPatientsPage = () => {
  const { isDemoMode } = useDemoMode();
  const { practitioner } = usePractitioner();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(!isDemoMode);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteSending, setInviteSending] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setPatients(DEMO_PATIENTS);
      setLoading(false);
      return;
    }

    if (!practitioner?.id) return;

    const fetchPatients = async () => {
      setLoading(true);

      // Fetch care team members with patient profiles
      const { data: members, error: membersError } = await supabase
        .from("care_team_members")
        .select(
          "id, granted_at, patient_id, patient:profiles!care_team_members_patient_id_fkey(id, first_name, last_name)",
        )
        .eq("practitioner_id", practitioner.id)
        .is("revoked_at", null)
        .order("granted_at", { ascending: false });

      if (membersError) {
        console.error("Failed to load patients:", membersError);
        setLoading(false);
        return;
      }

      // For each patient, fetch their latest visit from this practitioner
      const patientRows: PatientRow[] = [];

      for (const member of members ?? []) {
        const patient = (
          member as {
            patient: {
              id: string;
              first_name: string | null;
              last_name: string | null;
            } | null;
          }
        ).patient;
        if (!patient) continue;

        const firstName = patient.first_name?.trim() || "";
        const lastName = patient.last_name?.trim() || "";
        const name = [firstName, lastName].filter(Boolean).join(" ") || "Patient";

        // Get latest visit info
        const { data: visits, count } = await supabase
          .from("visits")
          .select("visit_date, visit_type", { count: "exact" })
          .eq("user_id", patient.id)
          .order("visit_date", { ascending: false })
          .limit(1);

        const latestVisit = visits?.[0];

        patientRows.push({
          id: member.id,
          name,
          initial: (firstName || lastName || "P").charAt(0).toUpperCase(),
          lastVisit: latestVisit?.visit_date ?? null,
          grantedAt: member.granted_at as string,
          visitCount: count ?? 0,
          visitType: latestVisit?.visit_type ?? null,
        });
      }

      setPatients(patientRows);
      setLoading(false);
    };

    fetchPatients();
  }, [isDemoMode, practitioner?.id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, search]);

  const handleSendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setInviteSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "invite-patient-email",
        {
          body: {
            patient_email: email,
            patient_name: inviteName.trim() || undefined,
          },
        },
      );
      if (error || (data as { error?: string })?.error) {
        throw new Error(
          (data as { error?: string })?.error ?? error?.message ?? "Failed",
        );
      }
      if ((data as { already_on_care_team?: boolean })?.already_on_care_team) {
        toast.info("This patient is already on your care team.");
      } else {
        toast.success(`Invite sent to ${email}`);
        setInviteEmail("");
        setInviteName("");
        setShowInvite(false);
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to send invite");
    } finally {
      setInviteSending(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
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
            Patients who have joined your care team. Metadata only — GPs do not
            have access to summaries, transcripts, or health data.
          </p>
        </div>

        {/* Search + Invite button row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 min-h-[44px]"
            />
          </div>
          {!isDemoMode && (
            <Button
              onClick={() => setShowInvite(!showInvite)}
              variant={showInvite ? "outline" : "default"}
              className="gap-2 min-h-[44px]"
            >
              {showInvite ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Invite Patient
                </>
              )}
            </Button>
          )}
        </div>

        {/* Email invite form */}
        {showInvite && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">
                Invite Patient by Email
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Send an email invite to a patient who hasn't signed up yet. They'll
              be automatically added to your care team when they create their account.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-card-foreground">
                  Patient email *
                </label>
                <Input
                  type="email"
                  placeholder="patient@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground">
                  Patient name (optional)
                </label>
                <Input
                  type="text"
                  placeholder="First Last"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
              </div>
            </div>
            <Button
              onClick={handleSendInvite}
              disabled={inviteSending}
              className="gap-2 min-h-[44px]"
            >
              {inviteSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Send Invite
                </>
              )}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading patients…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center shadow-card">
            {search.trim() ? (
              <p className="text-muted-foreground">No patients match your search</p>
            ) : (
              <div className="space-y-3">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium text-card-foreground">No patients yet</p>
                <p className="text-sm text-muted-foreground">
                  Share your QR code or invite link with patients. Once they accept,
                  they'll appear here.
                </p>
              </div>
            )}
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
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Last Visit
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Visits
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Latest Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {p.initial}
                          </div>
                          <span className="text-sm font-medium text-card-foreground">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {formatDate(p.grantedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {formatDate(p.lastVisit)}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {p.visitCount}
                      </td>
                      <td className="px-4 py-3">
                        {p.visitType ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${visitTypeBadge(p.visitType)}`}
                          >
                            {formatVisitType(p.visitType)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
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
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDate(p.grantedAt)}
                        </p>
                      </div>
                    </div>
                    {p.visitType && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${visitTypeBadge(p.visitType)}`}
                      >
                        {formatVisitType(p.visitType)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Last visit: {p.lastVisit ? formatDate(p.lastVisit) : "None"}
                    </span>
                    <span>{p.visitCount} visit{p.visitCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <p className="text-xs text-muted-foreground text-center">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} on your care team
            </p>
          </>
        )}
      </div>
    </GpLayout>
  );
};

export default GpClinicPatientsPage;
