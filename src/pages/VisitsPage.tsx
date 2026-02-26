import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const VisitsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("visits").select("*").eq("user_id", user.id).order("visit_date", { ascending: false })
      .then(({ data }) => { setVisits(data ?? []); setLoading(false); });
  }, [user]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Visits</h1>
          <Button onClick={() => navigate("/visit/new")} className="gap-2"><PlusCircle className="h-4 w-4" /> New Visit</Button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
        ) : visits.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center shadow-card">
            <p className="text-muted-foreground">No visits recorded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visits.map((v) => (
              <div key={v.id} className="cursor-pointer rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-card-hover" onClick={() => navigate(`/visit/${v.id}`)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{v.doctor_name || "Unknown Doctor"}</p>
                    <p className="text-sm text-muted-foreground">{v.clinic_name} • {v.visit_type} • {formatDate(v.visit_date)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    v.status === "complete" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>{v.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VisitsPage;
