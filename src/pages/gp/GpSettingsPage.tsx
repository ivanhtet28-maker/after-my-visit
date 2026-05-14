import { useEffect, useState } from "react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { usePractitioner } from "@/hooks/usePractitioner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import GpLayout from "@/components/GpLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Settings,
  User,
  Building2,
  Shield,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";

interface ClinicRow {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
}

const GpSettingsPage = () => {
  const { isDemoMode } = useDemoMode();
  const { practitioner, loading: practLoading, refetch } = usePractitioner();
  const { user } = useAuth();

  // Practitioner fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [ahpra, setAhpra] = useState("");
  const [profession, setProfession] = useState("");

  // Clinic
  const [clinic, setClinic] = useState<ClinicRow | null>(null);
  const [clinicLoading, setClinicLoading] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load practitioner data into form
  useEffect(() => {
    if (practitioner) {
      setFullName(practitioner.full_name ?? "");
      setEmail(practitioner.email ?? "");
      setAhpra(practitioner.ahpra_number ?? "");
      setProfession(practitioner.profession ?? "");
    }
  }, [practitioner]);

  // Load clinic info
  useEffect(() => {
    if (!practitioner?.clinic_id) return;
    setClinicLoading(true);
    supabase
      .from("clinics")
      .select("id, name, address, phone, suburb, state, postcode")
      .eq("id", practitioner.clinic_id)
      .maybeSingle()
      .then(({ data }) => {
        setClinic(data as ClinicRow | null);
        setClinicLoading(false);
      });
  }, [practitioner?.clinic_id]);

  const handleSave = async () => {
    if (!practitioner) return;
    setSaving(true);
    const { error } = await supabase
      .from("practitioners")
      .update({
        full_name: fullName.trim(),
        email: email.trim(),
        profession: profession.trim(),
      })
      .eq("id", practitioner.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Settings saved");
      setDirty(false);
      await refetch();
    }
    setSaving(false);
  };

  const markDirty = () => setDirty(true);

  if (practLoading) {
    return (
      <GpLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </GpLayout>
    );
  }

  if (isDemoMode && !practitioner) {
    return (
      <GpLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Settings className="h-6 w-6 text-primary" /> Settings
          </h1>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
            <p className="font-semibold">Demo Mode</p>
            <p className="mt-1 text-muted-foreground">
              Sign in to view and edit your practitioner settings.
            </p>
          </div>
        </div>
      </GpLayout>
    );
  }

  return (
    <GpLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Settings className="h-6 w-6 text-primary" /> Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your practitioner profile and clinic details.
          </p>
        </div>

        {/* Practitioner profile card */}
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Practitioner Profile
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  markDirty();
                }}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  markDirty();
                }}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={profession}
                onChange={(e) => {
                  setProfession(e.target.value);
                  markDirty();
                }}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="ahpra">AHPRA number</Label>
              <Input
                id="ahpra"
                value={ahpra}
                disabled
                className="mt-1 min-h-[44px] bg-muted"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Cannot be changed — contact support if incorrect.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="gap-2 min-h-[44px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : dirty ? (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Up to date
              </>
            )}
          </Button>
        </div>

        {/* Clinic info card */}
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Clinic
            </h2>
          </div>

          {clinicLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : clinic ? (
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium text-card-foreground">
                  {clinic.name}
                </dd>
              </div>
              {clinic.address && (
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="font-medium text-card-foreground">
                    {clinic.address}
                  </dd>
                </div>
              )}
              {(clinic.suburb || clinic.state || clinic.postcode) && (
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium text-card-foreground">
                    {[clinic.suburb, clinic.state, clinic.postcode]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              )}
              {clinic.phone && (
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium text-card-foreground">
                    {clinic.phone}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              No clinic linked to your account yet. Clinic details will appear
              here once configured.
            </p>
          )}
        </div>

        {/* Account info card */}
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Account
            </h2>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Auth email</dt>
              <dd className="font-medium text-card-foreground">
                {user?.email ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Account ID</dt>
              <dd className="font-mono text-xs text-muted-foreground">
                {user?.id ?? "—"}
              </dd>
            </div>
            {practitioner?.verified !== null && (
              <div>
                <dt className="text-muted-foreground">Verification</dt>
                <dd className="font-medium text-card-foreground">
                  {practitioner?.verified ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpSettingsPage;
