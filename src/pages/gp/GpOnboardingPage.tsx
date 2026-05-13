import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePractitioner } from "@/hooks/usePractitioner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Loader2,
  Stethoscope,
  Activity,
  Brain,
  Apple,
  HandHeart,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProfessionValue = "gp" | "physio" | "psych" | "dietitian" | "ot" | "other";

interface Profession {
  value: ProfessionValue;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  blurb: string;
}

const PROFESSIONS: Profession[] = [
  {
    value: "gp",
    label: "General Practitioner",
    shortLabel: "GP",
    icon: Stethoscope,
    blurb:
      "Send patients a plain-English summary of every consult. Approve before it leaves your hands.",
  },
  {
    value: "physio",
    label: "Physiotherapist",
    shortLabel: "Physio",
    icon: Activity,
    blurb:
      "Capture your assessment notes once. Patients leave with a clear plan; their next provider sees their full picture.",
  },
  {
    value: "psych",
    label: "Psychologist / Psychiatrist",
    shortLabel: "Psych",
    icon: Brain,
    blurb:
      "Turn session notes into a structured summary patients can re-read between appointments. Privacy-first.",
  },
  {
    value: "dietitian",
    label: "Dietitian",
    shortLabel: "Dietitian",
    icon: Apple,
    blurb:
      "Document the plan once. Patients walk out with food guidance they actually remember.",
  },
  {
    value: "ot",
    label: "Occupational Therapist",
    shortLabel: "OT",
    icon: HandHeart,
    blurb:
      "Streamline goals and recommendations. Patients and other providers see a coherent plan across visits.",
  },
  {
    value: "other",
    label: "Other allied health",
    shortLabel: "Other",
    icon: Sparkles,
    blurb:
      "Exercise physiologists, social workers, podiatrists and others — all welcome.",
  },
];

type ClinicChoice = "solo" | "create";

const GpOnboardingPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { practitioner, loading, refetch } = usePractitioner();

  const [profession, setProfession] = useState<ProfessionValue | null>(null);
  const [fullName, setFullName] = useState("");
  const [ahpraNumber, setAhpraNumber] = useState("");
  const [clinicChoice, setClinicChoice] = useState<ClinicChoice>("solo");
  const [clinicName, setClinicName] = useState("");
  const [clinicSuburb, setClinicSuburb] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (practitioner) {
    navigate("/gp/dashboard", { replace: true });
    return null;
  }

  if (!user) {
    navigate("/gp/login", { replace: true });
    return null;
  }

  const selectedProfession = PROFESSIONS.find((p) => p.value === profession);

  const canSubmit =
    !!profession &&
    fullName.trim().length >= 3 &&
    ahpraNumber.trim().length >= 8 &&
    (clinicChoice === "solo" ||
      (clinicName.trim().length >= 2 && clinicSuburb.trim().length >= 2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user || !profession) return;
    setSubmitting(true);

    let clinicId: string | null = null;

    if (clinicChoice === "create") {
      const slug =
        clinicName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 50) +
        "-" +
        Math.random().toString(36).slice(2, 7);

      const { data: clinicRow, error: clinicError } = await supabase
        .from("clinics")
        .insert({
          name: clinicName.trim(),
          suburb: clinicSuburb.trim(),
          slug,
        })
        .select("id")
        .single();

      if (clinicError || !clinicRow) {
        setSubmitting(false);
        toast.error("Couldn't create clinic", {
          description: clinicError?.message || "Database error",
        });
        return;
      }
      clinicId = clinicRow.id;
    }

    const { error: practitionerError } = await supabase
      .from("practitioners")
      .insert({
        user_id: user.id,
        full_name: fullName.trim(),
        email: user.email || "",
        ahpra_number: ahpraNumber.trim(),
        profession,
        clinic_id: clinicId,
        verified: false,
      });

    if (practitionerError) {
      setSubmitting(false);
      if (practitionerError.code === "23505") {
        toast.error("AHPRA number already registered", {
          description:
            "That AHPRA number is linked to another account. Contact support if this looks wrong.",
        });
      } else {
        toast.error("Couldn't save your details", {
          description: practitionerError.message,
        });
      }
      return;
    }

    await refetch();
    toast.success("You're in", {
      description:
        "Verification of your AHPRA number is in progress. You can start sending summaries now.",
    });
    navigate("/gp/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Stethoscope className="h-7 w-7" />
            Clarity Health
          </Link>
          <p className="mt-2 text-muted-foreground">
            Welcome — let's set up your practitioner profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1 — Profession */}
          <section className="rounded-xl border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <h2 className="text-lg font-semibold">I am a…</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PROFESSIONS.map((p) => {
                const Icon = p.icon;
                const active = profession === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setProfession(p.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 text-left transition-all min-h-[60px]",
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                        : "hover:border-primary/40 hover:bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        active ? "bg-primary/15" : "bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">{p.label}</p>
                    </div>
                    {active && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedProfession && (
              <p className="mt-4 rounded-lg bg-primary/5 px-4 py-3 text-sm text-primary/90">
                {selectedProfession.blurb}
              </p>
            )}
          </section>

          {/* Step 2 — Identity */}
          <section
            className={cn(
              "rounded-xl border bg-card p-6 shadow-card transition-opacity",
              !profession && "pointer-events-none opacity-50",
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <h2 className="text-lg font-semibold">Your registration</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    profession === "gp"
                      ? "Dr Helen Zhao"
                      : profession === "psych"
                        ? "Dr Maya Patel"
                        : "Sam Williams"
                  }
                  minLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  This is how you'll appear to patients (e.g. "Approved by {fullName.trim() || "[your name]"}").
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ahpra">AHPRA registration number</Label>
                <Input
                  id="ahpra"
                  value={ahpraNumber}
                  onChange={(e) => setAhpraNumber(e.target.value)}
                  placeholder="MED0001234567"
                  minLength={8}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  We verify against the AHPRA register manually for v1.
                  Patients see a "verification pending" badge until your number
                  is confirmed (usually within 1 business day).
                </p>
              </div>
            </div>
          </section>

          {/* Step 3 — Clinic */}
          <section
            className={cn(
              "rounded-xl border bg-card p-6 shadow-card transition-opacity",
              !profession && "pointer-events-none opacity-50",
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <h2 className="text-lg font-semibold">Where do you practice?</h2>
            </div>

            <RadioGroup
              value={clinicChoice}
              onValueChange={(v) => setClinicChoice(v as ClinicChoice)}
              className="space-y-3"
            >
              <label
                htmlFor="solo"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all",
                  clinicChoice === "solo" &&
                    "border-primary bg-primary/5 ring-2 ring-primary/40",
                )}
              >
                <RadioGroupItem value="solo" id="solo" className="mt-1" />
                <div>
                  <p className="font-medium">I'm solo / no clinic affiliation</p>
                  <p className="text-sm text-muted-foreground">
                    Locum, sole trader, or contractor. Summaries are signed by
                    you only — no clinic branding.
                  </p>
                </div>
              </label>

              <label
                htmlFor="create"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all",
                  clinicChoice === "create" &&
                    "border-primary bg-primary/5 ring-2 ring-primary/40",
                )}
              >
                <RadioGroupItem value="create" id="create" className="mt-1" />
                <div className="flex-1">
                  <p className="font-medium">I want to add my clinic</p>
                  <p className="text-sm text-muted-foreground">
                    Summaries get clinic branding. You can invite colleagues
                    later.
                  </p>

                  {clinicChoice === "create" && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="clinicName" className="text-sm">
                          Clinic name
                        </Label>
                        <Input
                          id="clinicName"
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          placeholder="Werribee Plaza Medical Centre"
                          minLength={2}
                          required={clinicChoice === "create"}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="clinicSuburb" className="text-sm">
                          Suburb
                        </Label>
                        <Input
                          id="clinicSuburb"
                          value={clinicSuburb}
                          onChange={(e) => setClinicSuburb(e.target.value)}
                          placeholder="Werribee, VIC"
                          minLength={2}
                          required={clinicChoice === "create"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </RadioGroup>

            <p className="mt-4 text-xs text-muted-foreground">
              Joining an existing Clarity Health clinic via invite code is coming
              soon. For now, ask your clinic admin to add you manually.
            </p>
          </section>

          {/* Footer */}
          <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Signed in as {user.email}
            </p>
            <p className="mt-0.5">
              Wrong account?{" "}
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate("/gp/login");
                }}
                className="text-primary underline"
              >
                Sign out
              </button>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[48px]"
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up your account…</>
            ) : (
              "Continue to dashboard"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GpOnboardingPage;
