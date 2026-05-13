import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useAuth } from "@/hooks/useAuth";
import { usePractitioner } from "@/hooks/usePractitioner";
import { supabase } from "@/integrations/supabase/client";
import {
  DEMO_CLINIC,
  DEMO_CLINIC_STATS,
  DEMO_CLINIC_ACTIVITY,
} from "@/data/demoClinic";
import GpLayout from "@/components/GpLayout";
import ConsultIntakeCard from "@/components/gp/ConsultIntakeCard";
import { Button } from "@/components/ui/button";
import { Users, Mic, UserCheck, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GpDashboardPage = () => {
  const { isDemoMode } = useDemoMode();
  const { user } = useAuth();
  const { practitioner, loading: practitionerLoading } = usePractitioner();
  const navigate = useNavigate();

  // ALL useState calls must come before any conditional return — Rules of Hooks.
  const [clinicNameReal, setClinicNameReal] = useState<string | null>(null);
  const [activity, setActivity] = useState(
    isDemoMode ? DEMO_CLINIC_ACTIVITY : [],
  );
  const [todayDelta, setTodayDelta] = useState(0);

  // Defence in depth: if a real (non-demo) user lands here without a
  // practitioner row, bounce them to onboarding. GpProtectedRoute already
  // does this, but this page-level check protects against stale browser
  // bundles where the route guard hasn't reloaded.
  useEffect(() => {
    if (!isDemoMode && !practitionerLoading && user && !practitioner) {
      navigate("/gp/onboarding", { replace: true });
    }
  }, [isDemoMode, practitionerLoading, user, practitioner, navigate]);

  // Pull the practitioner's clinic name (if attached) so the header shows
  // their actual clinic, not "Your Clinic".
  useEffect(() => {
    if (isDemoMode || !practitioner?.clinic_id) {
      setClinicNameReal(null);
      return;
    }
    supabase
      .from("clinics")
      .select("name")
      .eq("id", practitioner.clinic_id)
      .maybeSingle()
      .then(({ data }) => setClinicNameReal(data?.name ?? null));
  }, [isDemoMode, practitioner?.clinic_id]);

  if (!isDemoMode && (practitionerLoading || (user && !practitioner))) {
    return (
      <GpLayout>
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </GpLayout>
    );
  }

  const clinicName = isDemoMode
    ? DEMO_CLINIC.name
    : clinicNameReal ?? (practitioner?.full_name ? `${practitioner.full_name}'s practice` : "Your practice");
  const baseStats = isDemoMode
    ? DEMO_CLINIC_STATS
    : { patients_this_month: 0, consults_today: 0, total_active_patients: 0 };

  const stats = {
    ...baseStats,
    consults_today: baseStats.consults_today + todayDelta,
    patients_this_month: baseStats.patients_this_month + todayDelta,
  };

  const handleConsultGenerated = (entry: { initial: string; doctor: string }) => {
    setActivity((prev) => [
      { initial: entry.initial, doctor: entry.doctor, time: "Just now" },
      ...prev,
    ]);
    setTodayDelta((d) => d + 1);
  };

  const handleDownloadQr = () => {
    if (isDemoMode) {
      toast.success("QR code downloaded");
      return;
    }
  };

  return (
    <GpLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero-subtle p-8">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-foreground">{clinicName}</h1>
            <p className="text-muted-foreground">Practitioner Dashboard</p>
          </div>
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-accent/5" />
        </div>

        {/* Consult intake — voice or paste transcript */}
        <ConsultIntakeCard onConsultGenerated={handleConsultGenerated} />

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Patients this month",
              value: stats.patients_this_month,
              icon: Users,
            },
            {
              label: "Consults recorded today",
              value: stats.consults_today,
              icon: Mic,
            },
            {
              label: "Total active patients",
              value: stats.total_active_patients,
              icon: UserCheck,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          {activity.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center shadow-card">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {activity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {a.initial}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">
                      <span className="font-medium">{a.initial}</span> recorded
                      a consult with{" "}
                      <span className="font-medium">{a.doctor}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Download QR Code */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/gp/qr-code")}
            variant="outline"
            className="gap-2 min-h-[44px]"
          >
            <QrCode className="h-4 w-4" /> View QR Code
          </Button>
          <Button
            onClick={handleDownloadQr}
            className="gap-2 min-h-[44px]"
          >
            <QrCode className="h-4 w-4" /> Download QR Code
          </Button>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpDashboardPage;
