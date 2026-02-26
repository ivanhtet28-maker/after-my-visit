import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mic, Square, Pause, Play, CalendarIcon, Loader2, CheckCircle2, FileText, ClipboardCheck, Stethoscope, Pill, ArrowRight, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const visitTypes = [
  { value: "gp", label: "General GP" },
  { value: "specialist", label: "Specialist" },
  { value: "allied_health", label: "Allied Health" },
  { value: "telehealth", label: "Telehealth" },
  { value: "emergency", label: "Emergency" },
];

// Mock summary data for MVP
const mockSummary = {
  keyPoints: ["Discussed ongoing lower back pain", "Reviewed recent blood test results", "Discussed sleep quality and stress levels"],
  diagnosis: "Mild lumbar strain with associated muscle tension. Blood results within normal range.",
  medications: [
    { name: "Ibuprofen", dosage: "400mg", frequency: "Twice daily with food", explanation: "Anti-inflammatory to reduce pain and swelling in your lower back" },
    { name: "Paracetamol", dosage: "500mg", frequency: "As needed, up to 4 times daily", explanation: "Pain relief for when the ibuprofen isn't enough on its own" },
  ],
  actionItems: [
    { description: "Book physiotherapy appointment", due: "Within 2 weeks", category: "referral" },
    { description: "Fill ibuprofen script at pharmacy", due: "Today", category: "medication" },
    { description: "Schedule follow-up GP visit", due: "In 4 weeks", category: "follow_up" },
    { description: "Get blood test for iron levels", due: "In 2 weeks", category: "test" },
  ],
  referrals: [{ to: "PhysioWorks", type: "Physiotherapy", notes: "6 sessions, focus on core strengthening" }],
  suggestedQuestions: [
    "Should I avoid any specific exercises?",
    "Are there any side effects I should watch for with ibuprofen?",
    "When should I be concerned about the pain?",
  ],
};

const NewVisitPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctorName, setDoctorName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [visitType, setVisitType] = useState("");
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [consent, setConsent] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Processing state
  const [processingStep, setProcessingStep] = useState(0);
  const [visitId, setVisitId] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      toast.error("Unable to access microphone. Please grant permission.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
  };

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !user) return;
    clearInterval(timerRef.current);

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const fileName = `${user.id}/${Date.now()}.webm`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("visit-recordings")
          .upload(fileName, blob);

        const recordingUrl = uploadError ? null : fileName;

        // Create visit record
        const { data, error } = await supabase.from("visits").insert({
          user_id: user.id,
          doctor_name: doctorName,
          clinic_name: clinicName,
          visit_type: visitType,
          visit_date: format(visitDate, "yyyy-MM-dd"),
          recording_url: recordingUrl,
          recording_duration: duration,
          status: "processing",
        }).select().single();

        if (error) {
          toast.error("Failed to save visit");
        } else if (data) {
          setVisitId(data.id);
          setStep(3);
          simulateProcessing(data.id);
        }

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        resolve();
      };
      mediaRecorderRef.current!.stop();
    });
  }, [user, doctorName, clinicName, visitType, visitDate, duration]);

  const simulateProcessing = async (vId: string) => {
    if (!user) return;
    setProcessingStep(1);
    await new Promise((r) => setTimeout(r, 1200));
    setProcessingStep(2);
    await new Promise((r) => setTimeout(r, 1200));
    setProcessingStep(3);
    await new Promise((r) => setTimeout(r, 1000));

    // Save mock summary and action items
    await supabase.from("visits").update({
      summary: mockSummary as any,
      status: "complete",
    }).eq("id", vId);

    // Create action items
    const today = new Date();
    for (const item of mockSummary.actionItems) {
      const dueDate = new Date(today);
      if (item.due.includes("2 weeks")) dueDate.setDate(today.getDate() + 14);
      else if (item.due.includes("4 weeks")) dueDate.setDate(today.getDate() + 28);

      await supabase.from("action_items").insert({
        user_id: user.id,
        visit_id: vId,
        description: item.description,
        due_date: format(dueDate, "yyyy-MM-dd"),
        category: item.category,
      });
    }

    // Create medications
    for (const med of mockSummary.medications) {
      await supabase.from("medications").insert({
        user_id: user.id,
        visit_id: vId,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        prescribing_doctor: doctorName,
        date_prescribed: format(visitDate, "yyyy-MM-dd"),
        plain_explanation: med.explanation,
      });
    }

    setStep(4);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {["Details", "Record", "Processing", "Summary"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              {i < 3 && <div className={`h-0.5 w-8 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Visit Details */}
        {step === 1 && (
          <div className="space-y-6 rounded-xl border bg-card p-8 shadow-card">
            <h2 className="text-xl font-semibold text-card-foreground">Visit Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="doctor">Doctor's name</Label>
                <Input id="doctor" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Smith" />
              </div>
              <div>
                <Label htmlFor="clinic">Practice / Clinic</Label>
                <Input id="clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Main Street Medical" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Visit type</Label>
                <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {visitTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of visit</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !visitDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {visitDate ? format(visitDate, "dd/MM/yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={visitDate} onSelect={(d) => d && setVisitDate(d)} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(!!c)} />
              <Label htmlFor="consent" className="text-sm leading-5 text-muted-foreground">
                I confirm I have my doctor's consent to record this consultation
              </Label>
            </div>
            <Button className="w-full gap-2" disabled={!consent || !doctorName || !visitType} onClick={() => setStep(2)}>
              Continue to Recording <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Record */}
        {step === 2 && (
          <div className="flex flex-col items-center rounded-xl border bg-card p-12 shadow-card">
            <h2 className="mb-8 text-xl font-semibold text-card-foreground">
              {isRecording ? (isPaused ? "Paused" : "Recording...") : "Ready to Record"}
            </h2>
            <div className="relative mb-8">
              {isRecording && !isPaused && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
              )}
              <button
                onClick={isRecording ? undefined : startRecording}
                className={`relative flex h-28 w-28 items-center justify-center rounded-full transition-all ${
                  isRecording ? "bg-destructive" : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Mic className="h-10 w-10 text-primary-foreground" />
              </button>
            </div>
            {isRecording && (
              <p className="mb-6 text-3xl font-mono font-bold text-foreground">{formatDuration(duration)}</p>
            )}
            {/* Waveform */}
            {isRecording && !isPaused && (
              <div className="mb-8 flex items-end gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary"
                    style={{
                      height: `${8 + Math.random() * 24}px`,
                      animation: `waveform ${0.4 + Math.random() * 0.6}s ease-in-out ${Math.random() * 0.3}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-3">
              {isRecording && (
                <>
                  <Button variant="outline" size="lg" onClick={isPaused ? resumeRecording : pauseRecording} className="gap-2">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="destructive" size="lg" onClick={stopRecording} className="gap-2">
                    <Square className="h-4 w-4" /> Stop
                  </Button>
                </>
              )}
              {!isRecording && (
                <Button size="lg" onClick={startRecording} className="gap-2">
                  <Mic className="h-4 w-4" /> Start Recording
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <div className="flex flex-col items-center rounded-xl border bg-card p-12 shadow-card">
            <Loader2 className="mb-6 h-12 w-12 animate-spin text-primary" />
            <div className="space-y-3 text-center">
              {[
                { step: 1, text: "Transcribing your visit..." },
                { step: 2, text: "Generating summary..." },
                { step: 3, text: "Extracting action items..." },
              ].map((p) => (
                <p key={p.step} className={`text-sm ${processingStep >= p.step ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {processingStep > p.step ? "✓ " : ""}{p.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Visit Overview */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Visit Overview</h3>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Doctor:</span> {doctorName}</p>
                <p><span className="text-muted-foreground">Clinic:</span> {clinicName}</p>
                <p><span className="text-muted-foreground">Date:</span> {format(visitDate, "dd/MM/yyyy")}</p>
                <p><span className="text-muted-foreground">Duration:</span> {formatDuration(duration)}</p>
              </div>
            </div>

            {/* Key Discussion Points */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Key Discussion Points</h3>
              </div>
              <ul className="space-y-2">
                {mockSummary.keyPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Diagnosis */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Diagnosis / Assessment</h3>
              </div>
              <p className="text-sm text-muted-foreground">{mockSummary.diagnosis}</p>
            </div>

            {/* Medications */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Medications</h3>
              </div>
              <div className="space-y-4">
                {mockSummary.medications.map((m) => (
                  <div key={m.name} className="rounded-lg border p-4">
                    <p className="font-medium text-card-foreground">{m.name} — {m.dosage}</p>
                    <p className="text-sm text-muted-foreground">{m.frequency}</p>
                    <p className="mt-1 text-sm text-primary">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Action Items</h3>
              </div>
              <div className="space-y-2">
                {mockSummary.actionItems.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <p className="text-sm text-card-foreground">{a.description}</p>
                    <span className="text-xs text-muted-foreground">{a.due}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Questions for Next Visit</h3>
              </div>
              <ul className="space-y-2">
                {mockSummary.suggestedQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {q}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/visits")}>View All Visits</Button>
              <Button onClick={() => visitId && navigate(`/visit/${visitId}`)}>View Full Detail</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewVisitPage;
