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
import { Mic, Square, Pause, Play, CalendarIcon, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
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
  const [processingStatus, setProcessingStatus] = useState("");
  const [visitId, setVisitId] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
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
        const filePath = `${user.id}/${Date.now()}.webm`;

        setStep(3);
        setProcessingStep(1);
        setProcessingStatus("Uploading recording...");

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("visit-recordings")
          .upload(filePath, blob);

        if (uploadError) {
          toast.error("Failed to upload recording: " + uploadError.message);
          setStep(2);
          resolve();
          return;
        }

        // Create visit record
        const { data, error } = await supabase.from("visits").insert({
          user_id: user.id,
          doctor_name: doctorName,
          clinic_name: clinicName,
          visit_type: visitType,
          visit_date: format(visitDate, "yyyy-MM-dd"),
          recording_url: filePath,
          recording_duration: duration,
          status: "processing",
        }).select().single();

        if (error || !data) {
          toast.error("Failed to save visit");
          setStep(2);
          resolve();
          return;
        }

        const vId = data.id;
        setVisitId(vId);

        // Step 2: Transcribe
        setProcessingStep(2);
        setProcessingStatus("Transcribing your visit...");

        try {
          const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke("transcribe", {
            body: { visit_id: vId, recording_url: filePath },
          });

          if (transcribeError || !transcribeData?.success) {
            throw new Error(transcribeData?.error || transcribeError?.message || "Transcription failed");
          }

          // Step 3: Summarise
          setProcessingStep(3);
          setProcessingStatus("Generating summary...");

          const { data: summaryData, error: summaryError } = await supabase.functions.invoke("summarise", {
            body: { visit_id: vId },
          });

          if (summaryError || !summaryData?.success) {
            throw new Error(summaryData?.error || summaryError?.message || "Summary generation failed");
          }

          // Done!
          setProcessingStep(4);
          setProcessingStatus("Done!");
          
          setTimeout(() => navigate(`/visit/${vId}`), 1000);
        } catch (err: any) {
          toast.error(err.message || "Processing failed. You can view the visit later.");
          // Still redirect to visit page even on partial failure
          setTimeout(() => navigate(`/visit/${vId}`), 2000);
        }

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        resolve();
      };
      mediaRecorderRef.current!.stop();
    });
  }, [user, doctorName, clinicName, visitType, visitDate, duration, navigate]);

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
            <p className="mb-4 text-lg font-medium text-foreground">{processingStatus}</p>
            <div className="space-y-3 text-center">
              {[
                { step: 1, text: "Uploading recording..." },
                { step: 2, text: "Transcribing your visit..." },
                { step: 3, text: "Generating summary..." },
                { step: 4, text: "Done! Redirecting..." },
              ].map((p) => (
                <p key={p.step} className={`text-sm ${processingStep >= p.step ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {processingStep > p.step ? "✓ " : ""}{p.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewVisitPage;
