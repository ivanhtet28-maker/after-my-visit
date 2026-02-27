import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Stethoscope, FileText, Pill, ClipboardCheck, MessageSquare, Send, ArrowLeft, ChevronDown, Sparkles, AlertCircle, ListOrdered, Clipboard,
} from "lucide-react";
import { toast } from "sonner";

// Mock medical terms dictionary
const medicalTerms: Record<string, string> = {
  "hypertension": "High blood pressure — when the force of blood against your artery walls is consistently too high.",
  "hyperlipidaemia": "High levels of fats (like cholesterol) in your blood, which can increase heart disease risk.",
  "metformin": "A medication used to control blood sugar levels in type 2 diabetes.",
  "HbA1c": "A blood test showing your average blood sugar over the past 2–3 months.",
  "CBC": "Complete Blood Count — a test that checks the levels of different cells in your blood.",
  "referral": "A recommendation from your doctor to see a specialist for further care.",
  "prognosis": "The likely course or outcome of a medical condition.",
  "pathology": "Laboratory testing of blood, tissue, or other body samples to diagnose disease.",
  "bilateral": "Affecting both sides of the body.",
  "chronic": "A condition that lasts for a long time or keeps coming back.",
  "acute": "A condition that comes on quickly and may be severe, but is usually short-lived.",
  "benign": "Not harmful or cancerous.",
  "inflammation": "Swelling, redness, and pain — your body's response to injury or infection.",
};

function highlightTerms(text: string) {
  if (!text) return text;
  const regex = new RegExp(`\\b(${Object.keys(medicalTerms).join("|")})\\b`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const lower = part.toLowerCase();
    if (medicalTerms[lower]) {
      return (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <span className="cursor-help border-b border-dashed border-primary text-primary font-medium">
              {part}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{medicalTerms[lower]}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return part;
  });
}

interface SectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAskAI?: () => void;
}

function CollapsibleSection({ icon: Icon, title, children, defaultOpen = false, onAskAI }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border bg-card shadow-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-5">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onAskAI && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-primary"
                onClick={(e) => { e.stopPropagation(); onAskAI(); }}
              >
                <Sparkles className="h-3 w-3" /> Ask AI
              </Button>
            )}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-5 pb-5 pt-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

const VisitDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetchVisit = async () => {
      const [vRes, aRes, mRes] = await Promise.all([
        supabase.from("visits").select("*").eq("id", id).single(),
        supabase.from("action_items").select("*").eq("visit_id", id).order("created_at"),
        supabase.from("chat_messages").select("*").eq("visit_id", id).order("created_at"),
      ]);
      if (vRes.data) setVisit(vRes.data);
      if (aRes.data) setActions(aRes.data);
      if (mRes.data) setMessages(mRes.data);
      setLoading(false);
    };
    fetchVisit();
  }, [user, id]);

  const toggleAction = async (actionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "complete" : "pending";
    await supabase.from("action_items").update({
      status: newStatus,
      completed_at: newStatus === "complete" ? new Date().toISOString() : null,
    }).eq("id", actionId);
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: newStatus } : a));
    toast.success(newStatus === "complete" ? "Action completed!" : "Action reopened");
  };

  const sendQuestion = async (prefill?: string) => {
    const text = prefill || question;
    if (!text.trim() || !user || !id) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, visit_id: id, role: "user", content: text });
    setMessages((prev) => [...prev, { role: "user", content: text, created_at: new Date().toISOString() }]);
    if (!prefill) setQuestion("");

    setTimeout(async () => {
      const reply = "Based on your visit summary, that's a great question. I'd recommend discussing this with your doctor at your next follow-up. In the meantime, make sure to follow the action items from your visit.";
      await supabase.from("chat_messages").insert({ user_id: user.id, visit_id: id, role: "assistant", content: reply });
      setMessages((prev) => [...prev, { role: "assistant", content: reply, created_at: new Date().toISOString() }]);
    }, 1000);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></DashboardLayout>;
  if (!visit) return <DashboardLayout><p className="text-muted-foreground">Visit not found.</p></DashboardLayout>;

  const summary = visit.summary as any;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" onClick={() => navigate("/visits")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to visits
        </Button>

        {/* Quick Summary — always visible */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Quick Summary</h3>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Doctor:</span> {visit.doctor_name}</p>
            <p><span className="text-muted-foreground">Clinic:</span> {visit.clinic_name}</p>
            <p><span className="text-muted-foreground">Date:</span> {formatDate(visit.visit_date)}</p>
            <p><span className="text-muted-foreground">Type:</span> {visit.visit_type}</p>
          </div>
          {summary?.diagnosis && (
            <p className="mt-3 text-sm text-muted-foreground">{highlightTerms(summary.diagnosis)}</p>
          )}
        </div>

        {/* Collapsible Clinical Sections */}
        {summary?.chiefComplaint && (
          <CollapsibleSection
            icon={Stethoscope}
            title="Chief Complaint"
            defaultOpen
            onAskAI={() => sendQuestion(`Explain the chief complaint: "${summary.chiefComplaint}"`)}
          >
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.chiefComplaint)}</p>
          </CollapsibleSection>
        )}

        {summary?.keyPoints && (
          <CollapsibleSection
            icon={FileText}
            title="Key Discussion Points"
            defaultOpen
            onAskAI={() => sendQuestion("Explain the key discussion points from my visit")}
          >
            <ul className="space-y-2">
              {summary.keyPoints.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{highlightTerms(p)}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {summary?.diagnosis && (
          <CollapsibleSection
            icon={Stethoscope}
            title="Assessment"
            onAskAI={() => sendQuestion(`Explain this diagnosis in simple terms: "${summary.diagnosis}"`)}
          >
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.diagnosis)}</p>
          </CollapsibleSection>
        )}

        {summary?.plan && (
          <CollapsibleSection
            icon={Clipboard}
            title="Plan"
            onAskAI={() => sendQuestion("Explain the treatment plan from my visit")}
          >
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.plan)}</p>
          </CollapsibleSection>
        )}

        {summary?.recommendations && (
          <CollapsibleSection
            icon={ListOrdered}
            title="Doctor's Recommendations"
            onAskAI={() => sendQuestion("Explain the doctor's recommendations")}
          >
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {summary.recommendations.map((r: string, i: number) => (
                <li key={i}>{highlightTerms(r)}</li>
              ))}
            </ol>
          </CollapsibleSection>
        )}

        {summary?.medications && (
          <CollapsibleSection
            icon={Pill}
            title="Medications Prescribed"
            onAskAI={() => sendQuestion("Explain all the medications prescribed in this visit")}
          >
            <div className="space-y-3">
              {summary.medications.map((m: any) => (
                <div key={m.name} className="rounded-lg border p-4">
                  <p className="font-medium text-card-foreground">{highlightTerms(m.name)} — {m.dosage}</p>
                  <p className="text-sm text-muted-foreground">{m.frequency}</p>
                  <p className="mt-1 text-sm text-primary">{m.explanation}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Action Items — collapsible with checkboxes */}
        <CollapsibleSection icon={ClipboardCheck} title="Next Actions" defaultOpen>
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No action items for this visit.</p>
          ) : (
            <div className="space-y-2">
              {actions.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Checkbox checked={a.status === "complete"} onCheckedChange={() => toggleAction(a.id, a.status)} />
                  <p className={`flex-1 text-sm ${a.status === "complete" ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                    {a.description}
                  </p>
                  {a.due_date && <span className="text-xs text-muted-foreground">{formatDate(a.due_date)}</span>}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Q&A Chat */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Ask a Question</h3>
          </div>
          <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`rounded-lg p-3 text-sm ${m.role === "user" ? "ml-8 bg-primary/10 text-card-foreground" : "mr-8 bg-muted text-muted-foreground"}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your visit..." onKeyDown={(e) => e.key === "Enter" && sendQuestion()} />
            <Button size="icon" onClick={() => sendQuestion()}><Send className="h-4 w-4" /></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">AfterVisit does not provide medical advice. Always consult your healthcare professional.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VisitDetailPage;
