import { ShieldCheck, ExternalLink, Phone } from "lucide-react";
import { AU_RESOURCES, EMERGENCY_CONTACTS, detectConditionResources } from "@/data/australianHealthResources";

interface TrustedResourcesCardProps {
  summary: any;
}

export default function TrustedResourcesCard({ summary }: TrustedResourcesCardProps) {
  // Build searchable text blob from summary
  const textParts: string[] = [];
  if (summary?.quick_summary) textParts.push(summary.quick_summary);
  if (summary?.chief_complaint) textParts.push(summary.chief_complaint);
  if (summary?.assessment) textParts.push(summary.assessment);
  if (summary?.key_discussion_points) textParts.push(summary.key_discussion_points.join(" "));
  if (summary?.medications) {
    for (const m of summary.medications) {
      textParts.push(m.name || "");
      textParts.push(m.explanation || "");
    }
  }
  if (summary?.plan) {
    if (Array.isArray(summary.plan)) textParts.push(summary.plan.join(" "));
    else textParts.push(summary.plan);
  }
  const blob = textParts.join(" ");

  const conditionLinks = detectConditionResources(blob);
  const hasMedications = summary?.medications?.length > 0;

  if (conditionLinks.length === 0 && !hasMedications) return null;

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-card-foreground">Trusted Australian Resources</h3>
      </div>
      <div className="space-y-5 px-5 py-4">
        {/* Condition Info */}
        {conditionLinks.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Condition Information</p>
            <div className="space-y-1.5">
              {conditionLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Medication Info */}
        {hasMedications && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Medication Information</p>
            <div className="space-y-1.5">
              <a href={AU_RESOURCES.pbs.search} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                PBS — Check if your medication is subsidised
              </a>
              <a href={AU_RESOURCES.nps.finder} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                NPS MedicineWise — Side effects &amp; interactions
              </a>
              <a href={AU_RESOURCES.tga.cmi} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                TGA — Consumer Medicine Information
              </a>
            </div>
          </div>
        )}

        {/* General Help */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">General Help</p>
          <div className="space-y-1.5">
            <a href={AU_RESOURCES.healthdirect.services} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Find a health service near you
            </a>
            <a href={AU_RESOURCES.myHealthRecord.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              My Health Record
            </a>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-destructive">
            <Phone className="h-3.5 w-3.5" /> Emergency Contacts
          </p>
          <div className="space-y-1">
            {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
              <a key={c.number} href={`tel:${c.number.replace(/\s/g, "")}`} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{c.label}</span>
                <span className="font-mono font-medium text-card-foreground">{c.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
