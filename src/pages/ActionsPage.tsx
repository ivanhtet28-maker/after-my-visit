import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ActionsPage = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "complete" | "overdue">("all");
  const [newAction, setNewAction] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("action_items").select("*, visits(doctor_name, visit_date)").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setActions(data ?? []); setLoading(false); });
  }, [user]);

  const toggleAction = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "complete" : "pending";
    await supabase.from("action_items").update({
      status: newStatus,
      completed_at: newStatus === "complete" ? new Date().toISOString() : null,
    }).eq("id", id);
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
  };

  const addAction = async () => {
    if (!newAction.trim() || !user) return;
    const { data, error } = await supabase.from("action_items").insert({
      user_id: user.id,
      description: newAction,
    }).select().single();
    if (error) { toast.error("Failed to add action"); return; }
    setActions((prev) => [data, ...prev]);
    setNewAction("");
    toast.success("Action added");
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = actions.filter((a) => {
    if (filter === "pending") return a.status === "pending";
    if (filter === "complete") return a.status === "complete";
    if (filter === "overdue") return a.status === "pending" && a.due_date && a.due_date < today;
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Action Items</h1>

        {/* Add new */}
        <div className="flex gap-2">
          <Input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Add a new action item..." onKeyDown={(e) => e.key === "Enter" && addAction()} />
          <Button onClick={addAction} className="gap-2"><Plus className="h-4 w-4" /> Add</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "pending", "complete", "overdue"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-card">
            <p className="text-muted-foreground">No action items found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-card">
                <Checkbox checked={a.status === "complete"} onCheckedChange={() => toggleAction(a.id, a.status)} />
                <div className="flex-1">
                  <p className={`text-sm ${a.status === "complete" ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                    {a.description}
                  </p>
                  {a.visits && (
                    <p className="text-xs text-muted-foreground">Dr. {a.visits.doctor_name} • {formatDate(a.visits.visit_date)}</p>
                  )}
                </div>
                {a.due_date && (
                  <span className={`text-xs ${a.status === "pending" && a.due_date < today ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                    {formatDate(a.due_date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActionsPage;
