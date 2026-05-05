import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertCircle,
  AlertTriangle,
  Stethoscope,
  FileText,
  Clipboard,
  ListOrdered,
  Pill,
  UserPlus,
  HelpCircle,
  BookOpen,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { createTermHighlighter } from "@/lib/highlightTerms";

export interface ReviewVisitEnvelope {
  doctor_name?: string;
  clinic_name?: string;
  visit_date?: string;
  visit_type?: string;
  patient_name?: string;
  transcript?: string;
}

export interface ReviewSummary {
  quick_summary?: string;
  chief_complaint?: string;
  key_discussion_points?: string[];
  assessment?: string;
  plan?: string[] | string;
  doctors_recommendations?: Array<{ number?: number; text?: string } | string>;
  action_items?: Array<{
    description: string;
    category?: string;
    due_date_suggestion?: string;
  }>;
  medications?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    explanation?: string;
    is_pbs?: boolean;
  }>;
  referrals?: Array<{ to: string; reason?: string; next_steps?: string }>;
  follow_up_questions?: string[];
  medical_terms?: Array<{ term: string; explanation: string }>;
  urgency_flags?: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envelope: ReviewVisitEnvelope | null;
  summary: ReviewSummary | null;
  onConfirm?: () => void;
  onDiscard?: () => void;
  confirming?: boolean;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center gap-2 border-b p-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

const GpSummaryReviewDrawer = ({
  open,
  onOpenChange,
  envelope,
  summary,
  onConfirm,
  onDiscard,
  confirming,
}: Props) => {
  if (!envelope || !summary) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Summary preview</SheetTitle>
          </SheetHeader>
          <p className="text-sm text-muted-foreground">No summary loaded.</p>
        </SheetContent>
      </Sheet>
    );
  }

  const highlightTerms = createTermHighlighter(summary.medical_terms);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle>Review AI-generated summary</SheetTitle>
          <SheetDescription>
            Review the patient-readable summary our AI produced from the
            transcript. Confirm to send it to the patient's AfterVisit app, or
            discard if it doesn't capture the consult correctly.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Urgency flags first */}
          {summary.urgency_flags && summary.urgency_flags.length > 0 && (
            <Alert
              variant="destructive"
              className="border-2 border-destructive bg-destructive/10"
            >
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="ml-2">
                <p className="mb-1 text-sm font-bold text-destructive">
                  Urgent items
                </p>
                {summary.urgency_flags.map((flag, i) => (
                  <p
                    key={i}
                    className="text-sm font-medium text-destructive"
                  >
                    {flag}
                  </p>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Quick summary hero with envelope */}
          <div className="rounded-xl border-l-4 border-l-primary border border-primary/20 bg-primary/5 p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">
                Quick summary
              </h3>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {envelope.patient_name && (
                <p>
                  <span className="text-muted-foreground">Patient:</span>{" "}
                  {envelope.patient_name}
                </p>
              )}
              {envelope.doctor_name && (
                <p>
                  <span className="text-muted-foreground">Doctor:</span>{" "}
                  {envelope.doctor_name}
                </p>
              )}
              {envelope.clinic_name && (
                <p>
                  <span className="text-muted-foreground">Clinic:</span>{" "}
                  {envelope.clinic_name}
                </p>
              )}
              {envelope.visit_date && (
                <p>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {formatDate(envelope.visit_date)}
                </p>
              )}
              {envelope.visit_type && (
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="capitalize">
                    {envelope.visit_type.replace("_", " ")}
                  </span>
                </p>
              )}
            </div>
            {summary.quick_summary && (
              <p className="mt-3 text-base leading-relaxed text-foreground">
                {highlightTerms(summary.quick_summary)}
              </p>
            )}
          </div>

          {/* Chief complaint */}
          {summary.chief_complaint && (
            <Section icon={Stethoscope} title="Chief complaint">
              <p className="text-sm text-muted-foreground">
                {highlightTerms(summary.chief_complaint)}
              </p>
            </Section>
          )}

          {/* Key discussion points */}
          {summary.key_discussion_points &&
            summary.key_discussion_points.length > 0 && (
              <Section icon={FileText} title="Key discussion points">
                <ul className="space-y-2">
                  {summary.key_discussion_points.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {highlightTerms(p)}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

          {/* Assessment */}
          {summary.assessment && (
            <Section icon={Stethoscope} title="Assessment">
              <p className="text-sm text-muted-foreground">
                {highlightTerms(summary.assessment)}
              </p>
            </Section>
          )}

          {/* Plan */}
          {summary.plan && (
            <Section icon={Clipboard} title="Plan">
              {Array.isArray(summary.plan) ? (
                <ul className="space-y-2">
                  {summary.plan.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {highlightTerms(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {highlightTerms(summary.plan)}
                </p>
              )}
            </Section>
          )}

          {/* Doctor's recommendations */}
          {summary.doctors_recommendations &&
            summary.doctors_recommendations.length > 0 && (
              <Section icon={ListOrdered} title="Doctor's recommendations">
                <ol className="space-y-3">
                  {summary.doctors_recommendations.map((r: any, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {r.number || i + 1}
                      </span>
                      <span>{highlightTerms(r.text || r)}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

          {/* Action items */}
          {summary.action_items && summary.action_items.length > 0 && (
            <Section icon={Clipboard} title="Action items for the patient">
              <div className="space-y-2">
                {summary.action_items.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">
                        {a.description}
                      </p>
                      {a.due_date_suggestion && (
                        <p className="text-xs text-muted-foreground">
                          {a.due_date_suggestion}
                        </p>
                      )}
                    </div>
                    {a.category && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-xs capitalize"
                      >
                        {a.category.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Medications */}
          {summary.medications && summary.medications.length > 0 && (
            <Section icon={Pill} title="Medications">
              <div className="space-y-3">
                {summary.medications.map((m, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-card-foreground">
                        {highlightTerms(m.name)}
                        {m.dosage ? ` — ${m.dosage}` : ""}
                      </p>
                      {m.is_pbs ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          PBS ✓
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Non-PBS
                        </Badge>
                      )}
                    </div>
                    {m.frequency && (
                      <p className="text-sm text-muted-foreground">
                        {m.frequency}
                      </p>
                    )}
                    {m.explanation && (
                      <p className="mt-1 text-sm text-primary/80">
                        {m.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Referrals */}
          {summary.referrals && summary.referrals.length > 0 && (
            <Section icon={UserPlus} title="Referrals">
              <div className="space-y-3">
                {summary.referrals.map((r, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <p className="font-medium text-card-foreground">
                      To: {r.to}
                    </p>
                    {r.reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {r.reason}
                      </p>
                    )}
                    {r.next_steps && (
                      <div className="mt-2 rounded-md bg-primary/5 border border-primary/10 p-3">
                        <p className="text-sm font-medium text-primary">
                          Next steps: {r.next_steps}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Follow-up questions */}
          {summary.follow_up_questions &&
            summary.follow_up_questions.length > 0 && (
              <Section icon={HelpCircle} title="Suggested follow-up questions">
                <div className="flex flex-wrap gap-2">
                  {summary.follow_up_questions.map((q, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-card-foreground"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </Section>
            )}

          {/* Medical terms */}
          {summary.medical_terms && summary.medical_terms.length > 0 && (
            <Section icon={BookOpen} title="Medical terms glossary">
              <div className="space-y-2">
                {summary.medical_terms.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {t.term}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {t.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg bg-muted/50 px-4 py-2.5">
            <p className="text-xs text-muted-foreground">
              AI-generated summary from the pasted transcript. Review for
              accuracy before sending to the patient.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 mt-6 flex flex-col-reverse gap-3 border-t bg-background p-4 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={confirming}
            className="gap-2 min-h-[44px]"
          >
            <Trash2 className="h-4 w-4" /> Discard
          </Button>
          <Button
            onClick={onConfirm}
            disabled={confirming}
            className="gap-2 min-h-[44px]"
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Confirm & send to patient
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GpSummaryReviewDrawer;
