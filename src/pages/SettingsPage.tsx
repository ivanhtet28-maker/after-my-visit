import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const states = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const ageRanges = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [user]);

  const save = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: profile.first_name,
      state: profile.state,
      age_range: profile.age_range,
      has_regular_gp: profile.has_regular_gp,
      ongoing_conditions: profile.ongoing_conditions,
      current_medications: profile.current_medications,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Settings saved");
  };

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Profile</h2>
          <div className="space-y-4">
            <div><Label>First name</Label><Input value={profile?.first_name ?? ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>State / Territory</Label>
                <Select value={profile?.state ?? ""} onValueChange={(v) => setProfile({ ...profile, state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age range</Label>
                <Select value={profile?.age_range ?? ""} onValueChange={(v) => setProfile({ ...profile, age_range: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ageRanges.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Health Basics</h2>
          <div className="space-y-4">
            <div><Label>Ongoing conditions</Label><Textarea value={profile?.ongoing_conditions ?? ""} onChange={(e) => setProfile({ ...profile, ongoing_conditions: e.target.value })} /></div>
            <div><Label>Current medications</Label><Textarea value={profile?.current_medications ?? ""} onChange={(e) => setProfile({ ...profile, current_medications: e.target.value })} /></div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Subscription</h2>
          <p className="text-sm text-muted-foreground">Current plan: <span className="font-medium capitalize text-card-foreground">{profile?.subscription_tier ?? "free"}</span></p>
        </div>

        <Separator />

        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
