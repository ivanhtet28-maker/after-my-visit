import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_MEDICATIONS_V2 } from "@/data/demoPatient";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pill } from "lucide-react";
import { toast } from "sonner";

const MedicationsPage = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", prescribing_doctor: "", is_pbs: false, plain_explanation: "" });

  useEffect(() => {
    if (isDemoMode) {
      setMeds(DEMO_MEDICATIONS_V2);
      setLoading(false);
      return;
    }
    if (!user) return;
    supabase.from("medications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setMeds(data ?? []); setLoading(false); });
  }, [user, isDemoMode]);

  const addMedication = async () => {
    if (!form.name.trim()) return;
    if (isDemoMode) { toast.info("Adding medications is disabled in demo mode"); return; }
    if (!user) return;
    const { data, error } = await supabase.from("medications").insert({
      user_id: user.id,
      ...form,
      date_prescribed: new Date().toISOString().split("T")[0],
    }).select().single();
    if (error) { toast.error("Failed to add medication"); return; }
    setMeds((prev) => [data, ...prev]);
    setForm({ name: "", dosage: "", frequency: "", prescribing_doctor: "", is_pbs: false, plain_explanation: "" });
    setOpen(false);
    toast.success("Medication added");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Medications</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Medication</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Metformin" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Dosage</Label><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 500mg" /></div>
                  <div><Label>Frequency</Label><Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="e.g. Twice daily" /></div>
                </div>
                <div><Label>Prescribing doctor</Label><Input value={form.prescribing_doctor} onChange={(e) => setForm({ ...form, prescribing_doctor: e.target.value })} placeholder="Dr. Smith" /></div>
                <div><Label>What it does (plain English)</Label><Input value={form.plain_explanation} onChange={(e) => setForm({ ...form, plain_explanation: e.target.value })} placeholder="Helps control blood sugar" /></div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.is_pbs} onCheckedChange={(c) => setForm({ ...form, is_pbs: !!c })} id="pbs" />
                  <Label htmlFor="pbs">Listed on the PBS</Label>
                </div>
                <Button className="w-full" onClick={addMedication}>Add Medication</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
        ) : meds.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-card">
            <Pill className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No medications tracked yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meds.map((m) => (
              <div key={m.id} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-card-foreground">{m.name}</p>
                      {m.is_pbs ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">PBS ✓</span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Non-PBS</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{m.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.dosage} • {m.frequency}</p>
                    {m.prescribing_doctor && <p className="text-xs text-muted-foreground">Prescribed by {m.prescribing_doctor}</p>}
                  </div>
                </div>
                {m.plain_explanation && (
                  <p className="mt-2 text-sm text-primary">{m.plain_explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicationsPage;
