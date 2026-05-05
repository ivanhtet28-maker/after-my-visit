import { useState, useRef, useCallback, useEffect } from "react";
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
import { Mic, Square, Pause, Play, CalendarIcon, Loader2, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
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
  const [consentDoctor, setConsentDoctor] = useState(false);
  const [consentProcessing, setConsentProcessing] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Audio visualiser state
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(25).fill(4));
  const lowAmpStartRef = useRef<number | null>(null);
  const lowAmpWarnedRef = useRef(false);

  // Processing state
  const [processingStep, setProcessingStep] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [visitId, setVisitId] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [recordingFilePath, setRecordingFilePath] = useState<string | null>(null);

  const startAudioVisualiser = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    lowAmpStartRef.current = null;
    lowAmpWarnedRef.current = false;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars: number[] = [];
      const barCount = 25;
      const step = Math.floor(dataArray.length / barCount);
      let avgAmp = 0;
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        bars.push(Math.max(4, (val / 255) * 40));
        avgAmp += val;
      }
      avgAmp /= barCount;
      setAudioLevels(bars);

      // Low amplitude warning
      if (avgAmp < 8) {
        if (!lowAmpStartRef.current) lowAmpStartRef.current = Date.now();
        else if (Date.now() - lowAmpStartRef.current > 10000 && !lowAmpWarnedRef.current) {
          toast.warning("Move closer to the speaker for better transcription quality", { duration: 5000 });
          lowAmpWarnedRef.current = true;
        }
      } else {
        lowAmpStartRef.current = null;
      }

      animFrameRef.current = requestAnimationFrame(updateLevels);
    };
    updateLevels();
  };

  const stopAudioVisualiser = () => {
    cancelAnimationFrame(animFrameRef.current);
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setAudioLevels(new Array(25).fill(4));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioContextRef.current?.close();
      clearInterval(timerRef.current);
    };
  }, []);

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
      startAudioVisualiser(stream);
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

  const runTranscription = async (vId: string, filePath: string) => {
    setProcessingStep(2);
    setProcessingStatus("Transcribing your visit...");
    setProcessingError(null);

    const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke("transcribe", {
      body: { visit_id: vId, recording_url: filePath },
    });

    if (transcribeError || !transcribeData?.success) {
      const msg = transcribeData?.error || transcribeError?.message || "Transcription failed";
      setProcessingError(msg);
      setFailedStep(2);
      throw new Error(msg);
    }
  };

  const runSummarisation = async (vId: string) => {
    setProcessingStep(3);
    setProcessingStatus("Generating summary...");
    setProcessingError(null);

    const { data: summaryData, error: summaryError } = await supabase.functions.invoke("summarise", {
      body: { visit_id: vId },
    });

    if (summaryError || !summaryData?.success) {
      const msg = summaryData?.error || summaryError?.message || "Summary generation failed";
      setProcessingError(msg);
      setFailedStep(3);
      throw new Error(msg);
    }
  };

  const retryFailedStep = async () => {
    if (!visitId || !recordingFilePath) return;
    setProcessingError(null);

    try {
      if (failedStep === 2) {
        await runTranscription(visitId, recordingFilePath);
        await runSummarisation(visitId);
      } else if (failedStep === 3) {
        await runSummarisation(visitId);
      }
      setProcessingStep(4);
      setProcessingStatus("Done!");
      setTimeout(() => navigate(`/visit/${visitId}`), 1000);
    } catch {
      // Error state already set in runTranscription/runSummarisation
    }
  };

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !user) return;
    clearInterval(timerRef.current);
    stopAudioVisualiser();

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const filePath = `${user.id}/${Date.now()}.webm`;
        setRecordingFilePath(filePath);

        setStep(3);
        setProcessingStep(1);
        setProcessingStatus("Uploading recording...");
        setProcessingError(null);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("visit-recordings")
          .upload(filePath, blob);

        if (uploadError) {
          setProcessingError("Failed to upload recording: " + uploadError.message);
          setFailedStep(1);
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
          gp_consent_given: true,
        }).select().single();

        if (error || !data) {
          setProcessingError("Failed to save visit record");
          setFailedStep(1);
          resolve();
          return;
        }

        const vId = data.id;
        setVisitId(vId);

        try {
          await runTranscription(vId, filePath);
          await runSummarisation(vId);

          setProcessingStep(4);
          setProcessingStatus("Done!");
          setTimeout(() => navigate(`/visit/${vId}`), 1000);
        } catch {
          // Error state already set — user can retry
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
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-sm font-medium text-amber-900">Recording Consent (Required)</p>
              <div className="flex items-start gap-3">
                <Checkbox id="consent-doctor" checked={consentDoctor} onCheckedChange={(c) => setConsentDoctor(!!c)} className="mt-0.5" />
                <Label htmlFor="consent-doctor" className="text-sm leading-5 text-muted-foreground">
                  I confirm that {doctorName ? doctorName : "my doctor"} has been informed this consultation will be recorded and transcribed by AfterVisit.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="consent-processing" checked={consentProcessing} onCheckedChange={(c) => setConsentProcessing(!!c)} className="mt-0.5" />
                <Label htmlFor="consent-processing" className="text-sm leading-5 text-muted-foreground">
                  I understand the audio will be processed on AfterVisit's secure Australian servers and deleted after transcription is complete.
                </Label>
              </div>
            </div>
            <Button className="w-full gap-2" disabled={!consentDoctor || !consentProcessing || !doctorName || !visitType} onClick={() => setStep(2)}>
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
                aria-label={isRecording ? "Recording in progress" : "Start recording"}
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
              <div className="mb-8 flex items-end justify-center gap-[3px]">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className="w-[6px] rounded-full bg-primary transition-all duration-75"
                    style={{ height: `${level}px`, minHeight: "4px" }}
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
            {!processingError ? (
              <Loader2 className="mb-6 h-12 w-12 animate-spin text-primary" />
            ) : (
              <AlertTriangle className="mb-6 h-12 w-12 text-destructive" />
            )}
            <p className="mb-4 text-lg font-medium text-foreground">{processingError ? "Processing Error" : processingStatus}</p>
            <div className="space-y-3 text-center">
              {[
                { step: 1, text: "Uploading recording" },
                { step: 2, text: "Transcribing your visit" },
                { step: 3, text: "Generating summary" },
                { step: 4, text: "Done! Redirecting..." },
              ].map((p) => (
                <p key={p.step} className={`text-sm ${
                  failedStep === p.step && processingError
                    ? "font-medium text-destructive"
                    : processingStep >= p.step
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}>
                  {processingStep > p.step && !(failedStep === p.step && processingError) ? "✓ " : ""}
                  {failedStep === p.step && processingError ? "✗ " : ""}
                  {p.text}
                </p>
              ))}
            </div>
            {processingError && (
              <div className="mt-6 w-full space-y-3">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{processingError}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={retryFailedStep} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Retry
                  </Button>
                  {visitId && (
                    <Button variant="outline" onClick={() => navigate(`/visit/${visitId}`)}>
                      View Visit Anyway
                    </Button>
                  )}
                </div>
                <p className="text-center text-xs text-muted-foreground">Your recording has been saved and will not be deleted.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewVisitPage;
