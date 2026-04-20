import { useParams, Link } from "react-router-dom";
import DoctorLayout from "@/components/DoctorLayout";
import { getDoctorVisitById, getPatientById } from "@/data/demoDoctor";
import { ArrowLeft, ChevronDown, ChevronRight, AlertTriangle, Pill, FileText, ClipboardList, Stethoscope, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-6 py-4 text-left">
        <span className="flex items-center gap-2 font-semibold text-card-foreground">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t px-6 py-4">{children}</div>}
    </div>
  );
};

const DoctorVisitDetailPage = () => {
  const { patientId, visitId } = useParams();
  const visit = getDoctorVisitById(visitId || "");
  const patient = getPatientById(patientId || "");

  if (!visit || !patient) {
    return (
      <DoctorLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Visit not found</p>
          <Link to="/doctor/dashboard" className="mt-4 text-primary hover:underline">Back to dashboard</Link>
        </div>
      </DoctorLayout>
    );
  }

  const summary = visit.summary as any;

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back */}
        <Link to={`/doctor/patient/${patientId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {patient.first_name} {patient.last_name}
        </Link>

        {/* Visit Header */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <h1 className="text-xl font-bold text-card-foreground">{patient.first_name} {patient.last_name}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{visit.doctor_name}</p>
              <p className="text-sm font-medium text-card-foreground">{format(new Date(visit.visit_date), "dd MMMM yyyy")}</p>
            </div>
          </div>
          {summary?.quick_summary && (
            <div className="mt-4 rounded-lg bg-primary/5 p-4">
              <p className="text-sm font-medium text-card-foreground">{summary.quick_summary}</p>
            </div>
          )}
        </div>

        {/* Urgency Flags */}
        {summary?.urgency_flags?.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            {summary.urgency_flags.map((flag: string, i: number) => (
              <p key={i} className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" /> {flag}
              </p>
            ))}
          </div>
        )}

        {/* Key Discussion Points */}
        {summary?.key_discussion_points?.length > 0 && (
          <CollapsibleSection title="Key Discussion Points" icon={ClipboardList} defaultOpen>
            <ul className="space-y-2">
              {summary.key_discussion_points.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Assessment & Plan */}
        {(summary?.assessment || summary?.plan?.length > 0) && (
          <CollapsibleSection title="Assessment & Plan" icon={Stethoscope} defaultOpen>
            {summary.assessment && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment</p>
                <p className="text-sm text-card-foreground">{summary.assessment}</p>
              </div>
            )}
            {summary.plan?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</p>
                <ul className="space-y-1.5">
                  {summary.plan.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 font-medium text-primary">{i + 1}.</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Medications */}
        {summary?.medications?.length > 0 && (
          <CollapsibleSection title="Medications" icon={Pill} defaultOpen>
            <div className="space-y-3">
              {summary.medications.map((med: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-card-foreground">{med.name}</p>
                    {med.is_pbs && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">PBS</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{med.dosage} — {med.frequency}</p>
                  {med.explanation && <p className="mt-1 text-sm text-muted-foreground italic">{med.explanation}</p>}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Referrals */}
        {summary?.referrals?.length > 0 && (
          <CollapsibleSection title="Referrals" icon={FileText}>
            <div className="space-y-3">
              {summary.referrals.map((ref: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <p className="font-medium text-card-foreground">Referred to: {ref.to}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Reason: {ref.reason}</p>
                  {ref.next_steps && <p className="mt-1 text-sm text-muted-foreground">Next steps: {ref.next_steps}</p>}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Medical Terms */}
        {summary?.medical_terms?.length > 0 && (
          <CollapsibleSection title="Medical Terms Explained" icon={BookOpen}>
            <div className="space-y-2">
              {summary.medical_terms.map((term: any, i: number) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="font-medium text-card-foreground">{term.term}:</span>
                  <span className="text-muted-foreground">{term.explanation}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Transcript */}
        {visit.transcript && (
          <CollapsibleSection title="Full Transcript" icon={FileText}>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{visit.transcript}</pre>
          </CollapsibleSection>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground">
          AI-generated summary — always verify against the original consultation recording.
        </p>
      </div>
    </DoctorLayout>
  );
};

export default DoctorVisitDetailPage;
