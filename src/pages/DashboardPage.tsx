import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_PATIENT, DEMO_VISITS_V2, DEMO_ACTION_ITEMS_V2, DEMO_MEDICATIONS_V2 } from "@/data/demoPatient";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, ClipboardCheck, Clock, Pill, Mic, FileText, ListChecks, Hospital, Phone, Search, ClipboardList, ExternalLink } from "lucide-react";

const visitTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    gp: "bg-primary/10 text-primary",
    specialist: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    telehealth: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    allied_health: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    emergency: "bg-destructive/10 text-destructive",
  };
  return map[type] || "bg-muted text-muted-foreground";
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVisits: 0, pendingActions: 0, upcomingFollowups: 0, activeMeds: 0 });
  const [usingDemoFallback, setUsingDemoFallback] = useState(false);

  const loadDemo = () => {
    setProfile(DEMO_PATIENT);
    setVisits(DEMO_VISITS_V2.slice(0, 3));
    const pendingActions = DEMO_ACTION_ITEMS_V2.filter((a) => a.status === "pending");
    setActions(pendingActions.slice(0, 3));
    setStats({
      totalVisits: DEMO_VISITS_V2.length,
      pendingActions: pendingActions.length,
      upcomingFollowups: pendingActions.filter((a) => a.category === "follow_up").length,
      activeMeds: DEMO_MEDICATIONS_V2.filter((m) => m.status === "active").length,
    });
  };

  useEffect(() => {
    if (isDemoMode) {
      setUsingDemoFallback(false);
      loadDemo();
      return;
    }
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, visitsRes, actionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("visits").select("*").eq("user_id", user.id).order("visit_date", { ascending: false }).limit(3),
        supabase.from("action_items").select("*").eq("user_id", user.id).eq("status", "pending").order("due_date", { ascending: true }).limit(3),
      ]);
      if (profileRes.data) setProfile(profileRes.data);

      const [allVisits, pendingActions, followUps, activeMeds] = await Promise.all([
        supabase.from("visits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("action_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
        supabase.from("action_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending").eq("category", "follow_up"),
        supabase.from("medications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
      ]);

      const totalVisits = allVisits.count ?? 0;
      // Auto-load demo data when account is completely empty so the dashboard isn't blank
      if (totalVisits === 0 && (pendingActions.count ?? 0) === 0 && (activeMeds.count ?? 0) === 0) {
        setUsingDemoFallback(true);
        loadDemo();
        return;
      }

      if (visitsRes.data) setVisits(visitsRes.data);
      if (actionsRes.data) setActions(actionsRes.data);
      setStats({
        totalVisits,
        pendingActions: pendingActions.count ?? 0,
        upcomingFollowups: followUps.count ?? 0,
        activeMeds: activeMeds.count ?? 0,
      });
    };
    fetchData();
  }, [user, isDemoMode]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const today = new Date().toISOString().split("T")[0];
  const hasVisits = visits.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero area */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero-subtle p-8">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""} 👋
              </h1>
              <p className="text-muted-foreground">Here's your health overview</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={() => navigate("/visit/new")} className="relative gap-2 shadow-lg">
                <span className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse-ring" />
                <PlusCircle className="h-4 w-4" /> Record New Visit
              </Button>
              <Link to="#" onClick={() => document.getElementById("how-it-works-dash")?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-primary hover:underline">
                How it works →
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-accent/5" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Visits", value: stats.totalVisits, icon: Calendar },
            { label: "Pending Actions", value: stats.pendingActions, icon: ClipboardCheck },
            { label: "Upcoming Follow-ups", value: stats.upcomingFollowups, icon: Clock },
            { label: "Active Medications", value: stats.activeMeds, icon: Pill },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Visits */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Visits</h2>
          {!hasVisits ? (
            <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Mic className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">Ready to get started?</h3>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Record your first doctor's visit and let Clarity Health help you understand and track everything.
              </p>
              <div id="how-it-works-dash" className="mx-auto mb-8 grid max-w-lg gap-4 text-left sm:grid-cols-3">
                {[
                  { step: "1", icon: Mic, title: "Record your visit", desc: "With your doctor's consent" },
                  { step: "2", icon: FileText, title: "Get a summary", desc: "Plain-English breakdown" },
                  { step: "3", icon: ListChecks, title: "Track actions", desc: "Never forget follow-ups" },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center rounded-xl border bg-background p-4 text-center">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.step}</div>
                    <s.icon className="mb-1 h-5 w-5 text-primary" />
                    <p className="text-sm font-medium text-card-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate("/visit/new")} size="lg" className="relative gap-2 shadow-lg">
                <span className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse-ring" />
                <PlusCircle className="h-5 w-5" /> Record Your First Visit
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover"
                  onClick={() => navigate(`/visit/${v.id}`)}
                >
                  <div>
                    <p className="font-medium text-card-foreground">{v.doctor_name || "Unknown Doctor"}</p>
                    <p className="text-sm text-muted-foreground">{v.clinic_name} • {formatDate(v.visit_date)}</p>
                    {(v.summary as any)?.quick_summary && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{(v.summary as any).quick_summary}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${visitTypeBadge(v.visit_type)}`}>
                      {(v.visit_type || "").replace("_", " ")}
                    </span>
                    {v.bulk_billed ? (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Bulk Billed</span>
                    ) : v.out_of_pocket ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">${v.out_of_pocket} gap</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Actions */}
        {actions.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming Actions</h2>
            <div className="grid gap-3">
              {actions.map((a) => {
                const isOverdue = a.status === "pending" && a.due_date && a.due_date < today;
                const isDueToday = a.due_date === today;
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card">
                    <p className="text-sm text-card-foreground">{a.description}</p>
                    {a.due_date && (
                      <span className={`text-xs font-medium ${
                        isOverdue ? "text-destructive" : isDueToday ? "text-warning" : "text-primary"
                      }`}>
                        {isOverdue ? "Overdue" : isDueToday ? "Due today" : formatDate(a.due_date)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Helpful Links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Helpful Links</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Hospital, title: "Find a GP", desc: "Locate health services near you", url: "https://www.healthdirect.gov.au/australian-health-services", external: true },
              { icon: Search, title: "Check your medication", desc: "Side effects & interactions", url: "https://www.nps.org.au/medicine-finder", external: true },
              { icon: Phone, title: "24/7 Health Advice", desc: "healthdirect — free call", url: "tel:1800022222", external: false },
              { icon: ClipboardList, title: "My Health Record", desc: "Claims, scripts & records", url: "https://www.myhealthrecord.gov.au", external: true },
            ].map((link) => (
              <a
                key={link.title}
                href={link.url}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <link.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{link.title}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
