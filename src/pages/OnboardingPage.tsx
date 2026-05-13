import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Mic, FileText, ClipboardCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const states = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const ageRanges = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [state, setState] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [hasRegularGP, setHasRegularGP] = useState(false);
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const handleComplete = async () => {
    if (!disclaimer) {
      toast.error("Please acknowledge the disclaimer");
      return;
    }
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      first_name: firstName,
      state,
      age_range: ageRange,
      has_regular_gp: hasRegularGP,
      ongoing_conditions: conditions || null,
      current_medications: medications || null,
      onboarding_complete: true,
    }).eq("id", user.id);

    if (error) {
      setLoading(false);
      toast.error("Failed to save profile");
      return;
    }

    if (inviteToken) {
      const { data: claimData, error: claimError } =
        await supabase.functions.invoke("claim-practitioner-invite", {
          body: { token: inviteToken },
        });
      const claimErrMsg =
        (claimData as { error?: string } | null)?.error ?? claimError?.message;
      if (claimErrMsg) {
        setLoading(false);
        toast.error("Profile saved, but couldn't add practitioner", {
          description: claimErrMsg,
        });
        navigate("/dashboard");
        return;
      }
      setLoading(false);
      const claimed = claimData as { practitioner?: { full_name?: string } };
      toast.success(
        `${claimed?.practitioner?.full_name ?? "Practitioner"} added to your care team`,
      );
      navigate("/dashboard");
      return;
    }

    setLoading(false);
    toast.success("Welcome to Clarity Health!");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-primary">Clarity Health</span>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-card">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground">Tell us about you</h2>
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" />
              </div>
              <div>
                <Label>State / Territory</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
                  <SelectContent>
                    {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age range</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger><SelectValue placeholder="Select age range" /></SelectTrigger>
                  <SelectContent>
                    {ageRanges.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gap-2" onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground">Your health basics</h2>
              <p className="text-sm text-muted-foreground">All fields optional — you can update these later</p>
              <div className="flex items-center gap-3">
                <Checkbox id="gp" checked={hasRegularGP} onCheckedChange={(c) => setHasRegularGP(!!c)} />
                <Label htmlFor="gp">I have a regular GP</Label>
              </div>
              <div>
                <Label htmlFor="conditions">Ongoing conditions</Label>
                <Textarea id="conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="e.g. asthma, diabetes (optional)" />
              </div>
              <div>
                <Label htmlFor="meds">Current medications</Label>
                <Textarea id="meds" value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="e.g. Metformin 500mg (optional)" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground">How Clarity Health works</h2>
              <div className="grid gap-4">
                {[
                  { icon: Mic, title: "Record", desc: "Capture your consultation with consent" },
                  { icon: FileText, title: "Summarise", desc: "AI creates a structured, plain-English summary" },
                  { icon: ClipboardCheck, title: "Track", desc: "Follow up on actions, medications, and referrals" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="disclaimer" checked={disclaimer} onCheckedChange={(c) => setDisclaimer(!!c)} />
                <Label htmlFor="disclaimer" className="text-sm text-muted-foreground leading-5">
                  I understand Clarity Health does not provide medical advice. Always consult your healthcare professional.
                </Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button className="flex-1" onClick={handleComplete} disabled={loading || !disclaimer}>
                  {loading ? "Saving..." : "Get Started"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
