import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, ClipboardCheck, Clock } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVisits: 0, pendingActions: 0, upcomingFollowups: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, visitsRes, actionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("visits").select("*").eq("user_id", user.id).order("visit_date", { ascending: false }).limit(3),
        supabase.from("action_items").select("*").eq("user_id", user.id).eq("status", "pending").order("due_date", { ascending: true }).limit(3),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (visitsRes.data) setVisits(visitsRes.data);
      if (actionsRes.data) setActions(actionsRes.data);

      // Get stats
      const [allVisits, pendingActions] = await Promise.all([
        supabase.from("visits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("action_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
      ]);
      setStats({
        totalVisits: allVisits.count ?? 0,
        pendingActions: pendingActions.count ?? 0,
        upcomingFollowups: actionsRes.data?.filter((a: any) => a.category === "follow_up").length ?? 0,
      });
    };
    fetchData();
  }, [user]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}
            </h1>
            <p className="text-muted-foreground">Here's your health overview</p>
          </div>
          <Button onClick={() => navigate("/visit/new")} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Record New Visit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Visits", value: stats.totalVisits, icon: Calendar },
            { label: "Pending Actions", value: stats.pendingActions, icon: ClipboardCheck },
            { label: "Upcoming Follow-ups", value: stats.upcomingFollowups, icon: Clock },
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
          {visits.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center shadow-card">
              <p className="text-muted-foreground">No visits yet. Record your first visit to get started!</p>
              <Button className="mt-4 gap-2" onClick={() => navigate("/visit/new")}>
                <PlusCircle className="h-4 w-4" /> Record First Visit
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
                    <p className="text-sm text-muted-foreground">{v.visit_type} • {formatDate(v.visit_date)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    v.status === "complete" ? "bg-success/10 text-success" :
                    v.status === "processing" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {v.status}
                  </span>
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
              {actions.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card">
                  <p className="text-sm text-card-foreground">{a.description}</p>
                  {a.due_date && (
                    <span className="text-xs text-muted-foreground">{formatDate(a.due_date)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
