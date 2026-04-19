import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GpLayout from "@/components/gp/GpLayout";
import { Input } from "@/components/ui/input";
import { GP_DEMO_PATIENTS } from "@/data/gpDemoData";
import { Search, ChevronRight } from "lucide-react";

const riskBadge = (r: string) => {
  if (r === "high") return "bg-destructive/10 text-destructive";
  if (r === "moderate") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
};

const GpPatientsPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const filtered = GP_DEMO_PATIENTS.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.conditions.join(" ")}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <GpLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patients</h1>
            <p className="text-sm text-muted-foreground">{GP_DEMO_PATIENTS.length} patients have shared their records with you.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or condition…" className="pl-9" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3 hidden md:table-cell">Conditions</th>
                <th className="px-4 py-3 hidden lg:table-cell">Last visit</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3 hidden sm:table-cell">Pending</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className="cursor-pointer transition-colors hover:bg-muted/30" onClick={() => navigate(`/gp/patients/${p.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${p.avatar_color}`}>
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-muted-foreground">{p.age}{p.gender[0]} · {p.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.conditions.slice(0, 2).map((c) => (
                        <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{c}</span>
                      ))}
                      {p.conditions.length > 2 && <span className="text-xs text-muted-foreground">+{p.conditions.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {new Date(p.last_visit_date).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase ${riskBadge(p.risk_level)}`}>{p.risk_level}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.pending_actions > 0 ? (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">{p.pending_actions}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GpLayout>
  );
};

export default GpPatientsPage;
