import { Phone } from "lucide-react";
import { EMERGENCY_CONTACTS } from "@/data/australianHealthResources";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EmergencyContactsModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Phone className="h-5 w-5" /> Emergency Contacts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {EMERGENCY_CONTACTS.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number.replace(/\s/g, "")}`}
              className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted"
            >
              <span className="text-sm text-card-foreground">{c.label}</span>
              <span className="text-lg font-mono font-bold text-primary">{c.number}</span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
