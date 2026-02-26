import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, FileText, Pill, ClipboardCheck, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
    const fetch = async () => {
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
    fetch();
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

  const sendQuestion = async () => {
    if (!question.trim() || !user || !id) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, visit_id: id, role: "user", content: question });
    setMessages((prev) => [...prev, { role: "user", content: question, created_at: new Date().toISOString() }]);
    setQuestion("");

    // Mock AI response
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
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => navigate("/visits")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to visits
        </Button>

        {/* Visit Overview */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Visit Overview</h3>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Doctor:</span> {visit.doctor_name}</p>
            <p><span className="text-muted-foreground">Clinic:</span> {visit.clinic_name}</p>
            <p><span className="text-muted-foreground">Date:</span> {formatDate(visit.visit_date)}</p>
            <p><span className="text-muted-foreground">Type:</span> {visit.visit_type}</p>
          </div>
        </div>

        {summary && (
          <>
            {/* Key Points */}
            {summary.keyPoints && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">Key Discussion Points</h3>
                </div>
                <ul className="space-y-2">
                  {summary.keyPoints.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Diagnosis */}
            {summary.diagnosis && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-3 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">Diagnosis / Assessment</h3>
                </div>
                <p className="text-sm text-muted-foreground">{summary.diagnosis}</p>
              </div>
            )}

            {/* Medications */}
            {summary.medications && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-3 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">Medications</h3>
                </div>
                <div className="space-y-3">
                  {summary.medications.map((m: any) => (
                    <div key={m.name} className="rounded-lg border p-4">
                      <p className="font-medium text-card-foreground">{m.name} — {m.dosage}</p>
                      <p className="text-sm text-muted-foreground">{m.frequency}</p>
                      <p className="mt-1 text-sm text-primary">{m.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Items */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Action Items</h3>
          </div>
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
        </div>

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
            <Button size="icon" onClick={sendQuestion}><Send className="h-4 w-4" /></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">AfterVisit does not provide medical advice. Always consult your healthcare professional.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VisitDetailPage;
