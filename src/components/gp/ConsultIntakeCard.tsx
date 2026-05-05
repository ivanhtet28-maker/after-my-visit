import { useState } from "react";
import { Mic, FileText, Check, ChevronsUpDown, Loader2, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DEMO_CLINIC,
  DEMO_CLINIC_PATIENTS,
  DEMO_CLINIC_GPS,
  type DemoClinicPatient,
} from "@/data/demoClinic";
import GpSummaryReviewDrawer, {
  type ReviewSummary,
  type ReviewVisitEnvelope,
} from "@/components/gp/GpSummaryReviewDrawer";

const VISIT_TYPES = [
  { value: "gp", label: "GP" },
  { value: "specialist", label: "Specialist" },
  { value: "allied_health", label: "Allied Health" },
  { value: "telehealth", label: "Telehealth" },
];

interface Props {
  onConsultGenerated?: (entry: { initial: string; doctor: string }) => void;
}

const ConsultIntakeCard = ({ onConsultGenerated }: Props) => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<DemoClinicPatient | null>(null);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [doctor, setDoctor] = useState<string>("");
  const [visitType, setVisitType] = useState<string>("gp");
  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewEnvelope, setReviewEnvelope] =
    useState<ReviewVisitEnvelope | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null,
  );
  const [rawAiResponse, setRawAiResponse] = useState<string | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);

  const activeGps = DEMO_CLINIC_GPS.filter((g) => g.is_active);

  const canSubmit =
    !!patient && !!doctor && !!visitType && transcript.trim().length >= 50;

  const transcriptCharCount = transcript.trim().length;
  const transcriptTooLongWarning = transcriptCharCount > 40000;

  const handleSubmit = async () => {
    if (!canSubmit || !patient) return;
    setSubmitting(true);
    setRawAiResponse(null);
    setShowRawResponse(false);

    const doctorName =
      DEMO_CLINIC_GPS.find((g) => g.id === doctor)?.gp_name ?? doctor;

    try {
      const { data, error } = await supabase.functions.invoke(
        "summarise-text",
        {
          body: {
            transcript,
            doctor_name: doctorName,
            visit_type: visitType,
            patient_context: {
              state: DEMO_CLINIC.state,
              ongoing_conditions: undefined,
              current_medications: undefined,
            },
          },
        },
      );

      if (error) {
        const fnError: any = error;
        const ctx = fnError?.context;
        let parsedBody: any = null;
        if (ctx && typeof ctx.json === "function") {
          try {
            parsedBody = await ctx.json();
          } catch {
            try {
              parsedBody = { error: await ctx.text() };
            } catch {
              parsedBody = null;
            }
          }
        }
        if (parsedBody?.raw_response) {
          setRawAiResponse(parsedBody.raw_response);
        }
        toast.error("Couldn't generate summary", {
          description:
            parsedBody?.error ||
            fnError?.message ||
            "AI gateway returned an error. Try again.",
        });
        setSubmitting(false);
        return;
      }

      if (!data?.summary) {
        toast.error("AI returned no summary", {
          description: "Try again or shorten the transcript.",
        });
        setSubmitting(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      setReviewEnvelope({
        doctor_name: doctorName,
        clinic_name: DEMO_CLINIC.name,
        visit_date: today,
        visit_type: visitType,
        patient_name: patient.name,
        transcript,
      });
      setReviewSummary(data.summary as ReviewSummary);
      setReviewOpen(true);
      onConsultGenerated?.({
        initial: patient.name.charAt(0),
        doctor: doctorName,
      });
    } catch (err: any) {
      toast.error("Network error", {
        description:
          err?.message || "Couldn't reach the summary service. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscardReview = () => {
    setReviewOpen(false);
    setReviewEnvelope(null);
    setReviewSummary(null);
    toast("Draft discarded");
  };

  const handleConfirmReview = () => {
    toast.success(`Summary ready for ${patient?.name ?? "patient"}`, {
      description:
        "Confirm-to-patient flow lands in stage 3. For now the summary stays in this preview.",
    });
    setReviewOpen(false);
    setReviewEnvelope(null);
    setReviewSummary(null);
    setPatient(null);
    setTranscript("");
    setDoctor("");
    setVisitType("gp");
  };

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Generate a consult summary
        </h2>
        <p className="text-sm text-muted-foreground">
          Two ways to turn a consult into a patient-readable summary.
        </p>
      </div>

      <Tabs defaultValue="paste" className="p-6">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" /> Voice recording
          </TabsTrigger>
          <TabsTrigger value="paste" className="gap-2">
            <FileText className="h-4 w-4" /> Paste transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="mt-6">
          <div className="rounded-lg border bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground">
              Patient records on their own device
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The patient opens AfterVisit on their phone, signs the in-app
              consent, and presses record. Audio is transcribed by our medical
              speech model and summarised automatically — you don't lift a
              finger.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/gp/qr-code")}
                variant="outline"
                className="gap-2 min-h-[44px]"
              >
                <QrCode className="h-4 w-4" /> View clinic QR code
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="paste" className="mt-6">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Popover
                  open={patientPickerOpen}
                  onOpenChange={setPatientPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={patientPickerOpen}
                      className="w-full justify-between min-h-[44px] font-normal"
                    >
                      {patient ? (
                        <span className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {patient.name.charAt(0)}
                          </span>
                          {patient.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Search patient…
                        </span>
                      )}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[var(--radix-popover-trigger-width)]"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search by name…" />
                      <CommandList>
                        <CommandEmpty>No patient found.</CommandEmpty>
                        <CommandGroup>
                          {DEMO_CLINIC_PATIENTS.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={p.name}
                              onSelect={() => {
                                setPatient(p);
                                setPatientPickerOpen(false);
                              }}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {p.name.charAt(0)}
                                </span>
                                <div>
                                  <p className="text-sm">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    DOB {p.dob} · Medicare …{p.medicare_last4}
                                  </p>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  patient?.id === p.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeGps.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.gp_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Visit type</Label>
                <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_TYPES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transcript</Label>
              <Textarea
                placeholder="Paste the consult transcript here. Include both speakers if possible — our AI will identify the doctor's findings, the plan, medications and follow-ups."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={9}
                className="resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {transcriptCharCount} characters
                {transcriptCharCount > 0 &&
                  transcriptCharCount < 50 &&
                  " · need at least 50 to generate a useful summary"}
                {transcriptTooLongWarning &&
                  " · this is very long — Gemini may truncate. Consider trimming to the consult itself."}
              </p>
            </div>

            {rawAiResponse && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-destructive">
                    AI returned an unparseable response
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRawResponse((v) => !v)}
                  >
                    {showRawResponse ? "Hide" : "Show"} raw output
                  </Button>
                </div>
                {showRawResponse && (
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-xs text-muted-foreground">
                    {rawAiResponse}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                You'll review the AI summary before it reaches the patient.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="gap-2 min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>Generate summary</>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <GpSummaryReviewDrawer
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        envelope={reviewEnvelope}
        summary={reviewSummary}
        onConfirm={handleConfirmReview}
        onDiscard={handleDiscardReview}
      />
    </div>
  );
};

export default ConsultIntakeCard;
