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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Stethoscope, FileText, Pill, ClipboardCheck, MessageSquare, Send, ArrowLeft, ChevronDown, Sparkles, AlertCircle, ListOrdered, Clipboard, AlertTriangle, BookOpen, HelpCircle, UserPlus,
} from "lucide-react";
import TrustedResourcesCard from "@/components/TrustedResourcesCard";
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

function createTermHighlighter(termsArray?: Array<{ term: string; explanation: string }>) {
  const termsMap: Record<string, string> = {};
  const fallbackTerms: Record<string, string> = {
    hypertension: "High blood pressure — when the force of blood against your artery walls is consistently too high.",
    HbA1c: "A blood test showing your average blood sugar over the past 2–3 months.",
    eGFR: "Estimated Glomerular Filtration Rate — a blood test that measures how well your kidneys are filtering waste.",
    pathology: "Laboratory testing of blood, tissue, or other body samples to diagnose disease.",
    chronic: "A condition that lasts for a long time or keeps coming back.",
    inflammation: "Swelling, redness, and pain — your body's response to injury or infection.",
  };
  if (termsArray) {
    for (const t of termsArray) {
      termsMap[t.term.toLowerCase()] = t.explanation;
    }
  }
  const allTerms = { ...fallbackTerms, ...termsMap };

  return function highlightTerms(text: string) {
    if (!text || typeof text !== "string") return text;
    const keys = Object.keys(allTerms);
    if (keys.length === 0) return text;
    const regex = new RegExp(`\\b(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})\\b`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      if (allTerms[lower]) {
        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span className="cursor-help border-b border-dashed border-primary text-primary font-medium">
                {part}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border-l-4 border-l-primary">
              <p className="text-sm">{allTerms[lower]}</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      return part;
    });
  };
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" onClick={() => navigate("/visits")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to visits
        </Button>

        {/* Urgency Flags */}
        {summary?.urgency_flags?.length > 0 && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {summary.urgency_flags.map((flag: string, i: number) => (
                <p key={i} className="text-sm font-medium">{flag}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Summary */}
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
            <p className="mt-3 text-sm text-muted-foreground">{highlightTerms(summary.quick_summary)}</p>
          )}
        </div>

        {/* Chief Complaint */}
        {summary?.chief_complaint && (
          <CollapsibleSection icon={Stethoscope} title="Chief Complaint" defaultOpen onAskAI={() => askAI("Chief Complaint", `Explain the chief complaint: "${summary.chief_complaint}"`)}>
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.chief_complaint)}</p>
          </CollapsibleSection>
        )}

        {/* Key Discussion Points */}
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

        {/* Assessment */}
        {summary?.assessment && (
          <CollapsibleSection icon={Stethoscope} title="Assessment" onAskAI={() => sendQuestion(`Explain this assessment in simple terms: "${summary.assessment}"`)}>
            <p className="text-sm text-muted-foreground">{highlightTerms(summary.assessment)}</p>
          </CollapsibleSection>
        )}

        {/* Plan */}
        {summary?.plan && (
          <CollapsibleSection icon={Clipboard} title="Plan" onAskAI={() => sendQuestion("Explain the treatment plan from my visit")}>
            {Array.isArray(summary.plan) ? (
              <ul className="space-y-2">
                {summary.plan.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{highlightTerms(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{highlightTerms(summary.plan)}</p>
            )}
          </CollapsibleSection>
        )}

        {/* Doctor's Recommendations */}
        {summary?.doctors_recommendations && (
          <CollapsibleSection icon={ListOrdered} title="Doctor's Recommendations" onAskAI={() => sendQuestion("Explain the doctor's recommendations")}>
            <ol className="space-y-3">
              {summary.doctors_recommendations.map((r: any, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {r.number || i + 1}
                  </span>
                  <span>{highlightTerms(r.text || r)}</span>
                </li>
              ))}
            </ol>
          </CollapsibleSection>
        )}

        {/* Medications */}
        {summary?.medications && summary.medications.length > 0 && (
          <CollapsibleSection icon={Pill} title="Medications Prescribed" onAskAI={() => sendQuestion("Explain all the medications prescribed in this visit")}>
            <div className="space-y-3">
              {summary.medications.map((m: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-card-foreground">{highlightTerms(m.name)} — {m.dosage}</p>
                    {m.is_pbs ? (
                      <Badge className="bg-success/10 text-success border-success/20 text-xs">PBS ✓</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Non-PBS</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{m.frequency}</p>
                  <p className="mt-1 text-sm text-primary">{m.explanation}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Referrals */}
        {summary?.referrals?.length > 0 && (
          <CollapsibleSection icon={UserPlus} title="Referrals" onAskAI={() => sendQuestion("Tell me about the referrals from my visit")}>
            <div className="space-y-3">
              {summary.referrals.map((r: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <p className="font-medium text-card-foreground">To: {r.to}</p>
                  <p className="text-sm text-muted-foreground">Reason: {r.reason}</p>
                  <p className="mt-1 text-sm text-primary">Next steps: {r.next_steps}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Action Items */}
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
                    <Badge variant="secondary" className="text-xs capitalize">{a.category.replace("_", " ")}</Badge>
                  )}
                  {a.due_date && <span className="text-xs text-muted-foreground">{formatDate(a.due_date)}</span>}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Follow-up Questions */}
        {summary?.follow_up_questions?.length > 0 && (
          <CollapsibleSection icon={HelpCircle} title="Suggested Follow-up Questions">
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

        {/* AI Disclaimer */}
        <div className="rounded-lg bg-muted/50 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">AI-generated summary from your visit recording. May contain errors. Always verify with your healthcare provider.</p>
        </div>

        {/* Trusted Resources */}
        {summary && <TrustedResourcesCard summary={summary} />}

        {/* Full Transcript */}
        {visit.transcript && (
          <CollapsibleSection icon={BookOpen} title="Full Transcript">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">{visit.transcript}</p>
            </div>
          </CollapsibleSection>
        )}

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
    </DashboardLayout>
  );
};

export default VisitDetailPage;
