import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_VISITS_V2, DEMO_ACTION_ITEMS_V2, DEMO_CHAT_MESSAGES_V2 } from "@/data/demoPatient";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Stethoscope, FileText, Pill, ClipboardCheck, MessageSquare, Send, ArrowLeft, ChevronDown, Sparkles, AlertCircle, Clipboard, AlertTriangle, BookOpen, HelpCircle, UserPlus, Clock, ShieldAlert,
} from "lucide-react";
import TrustedResourcesCard from "@/components/TrustedResourcesCard";
import { createTermHighlighter } from "@/lib/highlightTerms";
import { toast } from "sonner";

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
                className="gap-1 text-xs text-primary hover:text-primary"
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
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  // Ask AI modal state
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [askModalTitle, setAskModalTitle] = useState("");
  const [askModalMessages, setAskModalMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [askModalLoading, setAskModalLoading] = useState(false);
  const [askModalInput, setAskModalInput] = useState("");


  useEffect(() => {
    if (isDemoMode && id?.startsWith("demo-v2-")) {
      const demoVisit = DEMO_VISITS_V2.find((v) => v.id === id);
      const demoActions = DEMO_ACTION_ITEMS_V2.filter((a) => a.visit_id === id);
      const demoMessages = DEMO_CHAT_MESSAGES_V2.filter((m) => m.visit_id === id);
      setVisit(demoVisit || null);
      setActions(demoActions);
      setMessages(demoMessages);
      setLoading(false);
      return;
    }
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
  }, [user, id, isDemoMode]);

  const toggleAction = async (actionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "complete" : "pending";
    if (isDemoMode) {
      setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: newStatus } : a));
      toast.success(newStatus === "complete" ? "Action completed!" : "Action reopened");
      return;
    }
    await supabase.from("action_items").update({
      status: newStatus,
      completed_at: newStatus === "complete" ? new Date().toISOString() : null,
    }).eq("id", actionId);
    setActions((prev) => prev.map((a) => a.id === actionId ? { ...a, status: newStatus } : a));
    toast.success(newStatus === "complete" ? "Action completed!" : "Action reopened");
  };

  const sendQuestion = async (prefill?: string) => {
    const text = prefill || question;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text, created_at: new Date().toISOString() }]);
    if (!prefill) setQuestion("");
    setChatLoading(true);

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 1500));
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "This is a demo. In the full version, Clarity Health AI will answer based on your actual visit transcript and medical context.",
        created_at: new Date().toISOString(),
      }]);
      setChatLoading(false);
      return;
    }

    if (!user || !id) { setChatLoading(false); return; }

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { visit_id: id, user_id: user.id, message: text, context_type: "visit_summary" },
      });
      if (error) throw error;
      const reply = data?.response || "I'm sorry, I couldn't generate a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, created_at: new Date().toISOString() }]);
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to get AI response";
      if (errorMsg.includes("rate") || errorMsg.includes("limit")) {
        toast.error("You've reached the free tier message limit. Upgrade to Plus for unlimited AI chat.");
      } else {
        const fallback = "Based on your visit summary, that's a great question. I'd recommend discussing this with your doctor at your next follow-up.";
        setMessages((prev) => [...prev, { role: "assistant", content: fallback, created_at: new Date().toISOString() }]);
      }
    }
    setChatLoading(false);
  };

  const fetchAIReply = async (text: string): Promise<string> => {
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 1200));
      return "This is a demo response. In the full version, Clarity Health AI will answer based on your actual visit transcript — explaining medical terms simply, referencing relevant Medicare/PBS info where useful, and reminding you to verify important details with your doctor.";
    }
    if (!user || !id) return "Please sign in to ask questions.";
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { visit_id: id, user_id: user.id, message: text, context_type: "visit_summary" },
      });
      if (error) throw error;
      return data?.response || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (err: any) {
      const errorMsg = err?.message || "";
      if (errorMsg.includes("rate") || errorMsg.includes("limit")) {
        toast.error("You've reached the free tier message limit. Upgrade to Plus for unlimited AI chat.");
        return "You've reached the free tier limit. Upgrade to Plus for unlimited AI chat.";
      }
      return "Based on your visit summary, that's a great question. I'd recommend discussing this with your doctor at your next follow-up.";
    }
  };

  const askAI = async (sectionTitle: string, prompt: string) => {
    setAskModalTitle(sectionTitle);
    setAskModalMessages([{ role: "user", content: prompt }]);
    setAskModalInput("");
    setAskModalOpen(true);
    setAskModalLoading(true);
    const reply = await fetchAIReply(prompt);
    setAskModalMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setAskModalLoading(false);
  };

  const sendInModal = async () => {
    const text = askModalInput.trim();
    if (!text || askModalLoading) return;
    setAskModalMessages((prev) => [...prev, { role: "user", content: text }]);
    setAskModalInput("");
    setAskModalLoading(true);
    const reply = await fetchAIReply(text);
    setAskModalMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setAskModalLoading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></DashboardLayout>;
  if (!visit) return <DashboardLayout><p className="text-muted-foreground">Visit not found.</p></DashboardLayout>;

  const summary = visit.summary as any;
  const highlightTerms = createTermHighlighter(summary?.medical_terms);

  // GP-led visit awaiting practitioner approval — show waiting state
  // instead of the (still-empty) summary sections.
  const pendingApproval =
    !visit.approved_at &&
    (visit.source === "native_recording" || visit.source === "chrome_extension_paste");

  if (pendingApproval) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl space-y-4">
          <Button variant="ghost" onClick={() => navigate("/visits")} className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to visits
          </Button>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <h2 className="text-lg font-semibold text-amber-900">
              {visit.doctor_name || "Your doctor"} is finalising your summary
            </h2>
            <p className="mt-2 text-sm text-amber-800">
              We'll notify you the moment it's approved and ready to read.
            </p>
            <div className="mt-4 grid gap-1 text-xs text-amber-900/70">
              <p>{visit.clinic_name}</p>
              <p>{formatDate(visit.visit_date)}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const unverified = visit.source === "patient_recorded" && !visit.approved_at;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" onClick={() => navigate("/visits")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to visits
        </Button>

        {unverified && (
          <Alert className="border-amber-300 bg-amber-50">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            <AlertDescription className="text-sm text-amber-900">
              <strong>Unverified — not GP-approved.</strong> You recorded this
              visit yourself. The summary hasn't been reviewed by the doctor.
              Always confirm important details with your doctor before acting on
              them.
            </AlertDescription>
          </Alert>
        )}

        {/* 1. Urgency Flags — red alert banner, only if present */}
        {summary?.urgency_flags?.length > 0 && (
          <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <p className="mb-1 text-sm font-bold text-destructive">Urgent Items</p>
              {summary.urgency_flags.map((flag: string, i: number) => (
                <p key={i} className="text-sm font-medium text-destructive">{flag}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* 2. Quick Summary — hero card, teal left border */}
        <div className="rounded-xl border-l-4 border-l-primary border border-primary/20 bg-primary/5 p-6 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Quick Summary</h3>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Doctor:</span> {visit.doctor_name}</p>
            <p><span className="text-muted-foreground">Clinic:</span> {visit.clinic_name}</p>
            <p><span className="text-muted-foreground">Date:</span> {formatDate(visit.visit_date)}</p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Type:</span> <span className="capitalize">{(visit.visit_type || "").replace("_", " ")}</span>
              {visit.bulk_billed ? (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Bulk Billed</span>
              ) : visit.out_of_pocket ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">${visit.out_of_pocket} gap</span>
              ) : null}
            </p>
          </div>
          {summary?.quick_summary && (
            <p className="mt-3 text-base leading-relaxed text-foreground">{highlightTerms(summary.quick_summary)}</p>
          )}
        </div>

        {/* 3. Chief Complaint — own section, collapsible, default open */}
        {summary?.chief_complaint && (
          <CollapsibleSection icon={Stethoscope} title="Chief Complaint" defaultOpen onAskAI={() => askAI("Chief Complaint", `Explain the chief complaint: "${summary.chief_complaint}"`)}>
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.chief_complaint)}</p>
          </CollapsibleSection>
        )}

        {/* 4. Key Discussion Points */}
        {(summary?.key_discussion_points || summary?.keyPoints) && (
          <CollapsibleSection icon={FileText} title="Key Discussion Points" defaultOpen onAskAI={() => askAI("Key Discussion Points", "Explain the key discussion points from my visit")}>
            <ul className="space-y-2">
              {(summary.key_discussion_points || summary.keyPoints)?.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{highlightTerms(p)}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* 5. Assessment */}
        {summary?.assessment && (
          <CollapsibleSection icon={Stethoscope} title="Assessment" defaultOpen onAskAI={() => askAI("Assessment", `Explain this assessment in simple terms: "${summary.assessment}"`)}>
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.assessment)}</p>
          </CollapsibleSection>
        )}

        {/* 6. Plan */}
        {summary?.plan && (
          <CollapsibleSection icon={Clipboard} title="Plan" defaultOpen onAskAI={() => askAI("Plan", "Explain the treatment plan from my visit")}>
            {Array.isArray(summary.plan) ? (
              <ol className="space-y-3">
                {summary.plan.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span>{highlightTerms(item)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">{highlightTerms(summary.plan)}</p>
            )}
          </CollapsibleSection>
        )}

        {/* 8. Medications Prescribed — cards with PBS badge */}
        {summary?.medications?.length > 0 && (
          <CollapsibleSection icon={Pill} title="Medications Prescribed" defaultOpen onAskAI={() => askAI("Medications Prescribed", "Explain all the medications prescribed in this visit")}>
            <div className="space-y-3">
              {summary.medications.map((m: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-card-foreground">{highlightTerms(m.name)} — {m.dosage}</p>
                    {m.is_pbs ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">PBS ✓</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Non-PBS</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{m.frequency}</p>
                  <p className="mt-1 text-sm text-primary/80">{m.explanation}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 9. Referrals */}
        {summary?.referrals?.length > 0 && (
          <CollapsibleSection icon={UserPlus} title="Referrals" defaultOpen onAskAI={() => askAI("Referrals", "Tell me about the referrals from my visit")}>
            <div className="space-y-3">
              {summary.referrals.map((r: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <p className="font-medium text-card-foreground">To: {r.to}</p>
                  <p className="text-sm text-muted-foreground">Reason: {r.reason}</p>
                  <div className="mt-2 rounded-md bg-primary/5 border border-primary/10 p-3">
                    <p className="text-sm font-medium text-primary">Next steps: {r.next_steps}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 10. Next Actions — checklist */}
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
                  {a.category && (
                    <Badge variant="secondary" className="shrink-0 text-xs capitalize">{a.category.replace("_", " ")}</Badge>
                  )}
                  {a.due_date && <span className="shrink-0 text-xs text-muted-foreground">{formatDate(a.due_date)}</span>}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* 11. Suggested Follow-up Questions */}
        {summary?.follow_up_questions?.length > 0 && (
          <CollapsibleSection icon={HelpCircle} title="Suggested Follow-up Questions" defaultOpen>
            <div className="flex flex-wrap gap-2">
              {summary.follow_up_questions.map((q: string, i: number) => (
                <button
                  key={i}
                  onClick={() => sendQuestion(q)}
                  className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-left text-sm text-card-foreground transition-colors hover:bg-primary/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 12. Medical Terms Glossary — collapsed accordion */}
        {summary?.medical_terms?.length > 0 && (
          <CollapsibleSection icon={BookOpen} title="Medical Terms Glossary">
            <div className="space-y-2">
              {summary.medical_terms.map((t: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{t.term}</span>
                  <p className="text-sm text-muted-foreground">{t.explanation}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* AI Disclaimer */}
        <div className="rounded-lg bg-muted/50 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">AI-generated summary from your visit recording. May contain errors. Always verify with your healthcare provider.</p>
        </div>

        {/* Trusted Australian Resources */}
        {summary && <TrustedResourcesCard summary={summary} />}

        {/* Full Transcript */}
        {visit.transcript && (
          <CollapsibleSection icon={BookOpen} title="Full Transcript">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">{visit.transcript}</p>
            </div>
          </CollapsibleSection>
        )}

        {/* Ask a Question — chat */}
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
            {chatLoading && (
              <div className="mr-8 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your visit..." onKeyDown={(e) => e.key === "Enter" && sendQuestion()} />
            <Button size="icon" onClick={() => sendQuestion()} disabled={chatLoading}><Send className="h-4 w-4" /></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Clarity Health does not provide medical advice. Always consult your healthcare professional.</p>
        </div>
      </div>

      {/* Ask AI — side chatbot drawer */}
      <Sheet open={askModalOpen} onOpenChange={setAskModalOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b bg-primary/5 px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-left">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="flex flex-col">
                <span className="text-base">Clarity Health AI</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {askModalTitle}
                </span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {askModalMessages.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm ${
                  m.role === "user"
                    ? "ml-6 bg-primary/10 text-card-foreground"
                    : "mr-6 bg-muted text-muted-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {askModalLoading && (
              <div className="mr-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}
          </div>

          <div className="border-t bg-background px-5 py-3">
            <div className="flex gap-2">
              <Input
                value={askModalInput}
                onChange={(e) => setAskModalInput(e.target.value)}
                placeholder="Ask a follow-up..."
                onKeyDown={(e) => e.key === "Enter" && sendInModal()}
                disabled={askModalLoading}
              />
              <Button size="icon" onClick={sendInModal} disabled={askModalLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Clarity Health does not provide medical advice. Always verify with your doctor.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default VisitDetailPage;
