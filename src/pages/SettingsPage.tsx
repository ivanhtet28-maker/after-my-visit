import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { NotificationToggle } from "@/components/notifications/NotificationBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { seedDemoData, clearDemoData } from "@/lib/seedDemoData";
import { Loader2 } from "lucide-react";

const states = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
const ageRanges = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];

const SettingsPage = () => {
  const { user } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [clearingDemo, setClearingDemo] = useState(false);

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
      last_name: profile.last_name,
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

  const handleSeedDemo = async () => {
    if (!user) return;
    setSeedingDemo(true);
    try {
      await seedDemoData(user.id);
      toast.success("Demo data loaded! Visit your dashboard to see it.");
    } catch (err: any) {
      toast.error("Failed to seed demo data: " + err.message);
    }
    setSeedingDemo(false);
  };

  const handleClearDemo = async () => {
    if (!user) return;
    setClearingDemo(true);
    try {
      await clearDemoData(user.id);
      toast.success("All visit data cleared.");
    } catch (err: any) {
      toast.error("Failed to clear data: " + err.message);
    }
    setClearingDemo(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {/* Demo Mode Toggle */}
        <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-card-foreground">Demo Mode</h2>
              <Badge variant="secondary" className="text-xs">For demos</Badge>
            </div>
            <Switch checked={isDemoMode} onCheckedChange={toggleDemoMode} />
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {isDemoMode
              ? "Demo mode is ON — all pages show hardcoded sample data. No database calls are made."
              : "Enable demo mode to showcase Clarity Health with realistic Australian sample data. No database required."}
          </p>
          {isDemoMode && (
            <p className="text-xs text-accent">Share this link to show anyone the demo: <span className="font-mono">?demo=true</span></p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Profile</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>First name</Label><Input value={profile?.first_name ?? ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></div>
              <div><Label>Last name</Label><Input value={profile?.last_name ?? ""} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} /></div>
            </div>
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

        {/* Database Seed */}
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">Database Seed</h2>
            <Badge variant="secondary" className="text-xs">Advanced</Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Load sample data directly into the database (for testing real API calls). Use Demo Mode above for instant, no-database demos.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleSeedDemo} disabled={seedingDemo} className="gap-2">
              {seedingDemo && <Loader2 className="h-4 w-4 animate-spin" />}
              {seedingDemo ? "Loading..." : "Seed Database"}
            </Button>
            <Button variant="outline" onClick={handleClearDemo} disabled={clearingDemo} className="gap-2">
              {clearingDemo && <Loader2 className="h-4 w-4 animate-spin" />}
              {clearingDemo ? "Clearing..." : "Clear All Data"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Notifications</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage medication and appointment reminders on this device.
          </p>
          <NotificationToggle />
        </div>

        <Separator />

        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
