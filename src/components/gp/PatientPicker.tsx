import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface CareTeamPatient {
  user_id: string;
  name: string;
  granted_at: string;
}

interface Props {
  practitionerId: string | null;
  selected: CareTeamPatient | null;
  onSelect: (patient: CareTeamPatient | null) => void;
  shareLink?: string;
}

const PatientPicker = ({
  practitionerId,
  selected,
  onSelect,
  shareLink,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<CareTeamPatient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!practitionerId) {
      setPatients([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from("care_team_members")
        .select(
          "id, granted_at, patient:profiles!care_team_members_patient_id_fkey(id, first_name)",
        )
        .eq("practitioner_id", practitionerId)
        .is("revoked_at", null)
        .order("granted_at", { ascending: false });

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      const rows: CareTeamPatient[] = (data ?? [])
        .map((row) => {
          const patient = (row as { patient: { id: string; first_name: string | null } | null }).patient;
          if (!patient) return null;
          return {
            user_id: patient.id,
            name: patient.first_name?.trim() || "Patient",
            granted_at: row.granted_at as string,
          };
        })
        .filter((row): row is CareTeamPatient => row !== null);

      setPatients(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [practitionerId]);

  const isEmpty = useMemo(
    () => !loading && !error && patients.length === 0,
    [loading, error, patients.length],
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[44px] font-normal"
            disabled={!practitionerId}
          >
            {selected ? (
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {selected.name.charAt(0)}
                </span>
                {selected.name}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {practitionerId
                  ? "Select a care-team patient…"
                  : "Complete practitioner onboarding first"}
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search by name…" />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading patients…
                </div>
              )}
              {error && (
                <div className="p-4 text-sm text-destructive">{error}</div>
              )}
              {isEmpty && (
                <CommandEmpty>
                  <div className="space-y-2 p-3 text-left text-sm">
                    <div className="flex items-center gap-2 font-medium text-card-foreground">
                      <Users className="h-4 w-4" />
                      No patients on your care team yet
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share your invite link or QR with patients. Once they
                      accept, they'll appear here.
                    </p>
                    {shareLink && (
                      <p className="break-all rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                        {shareLink}
                      </p>
                    )}
                  </div>
                </CommandEmpty>
              )}
              {!loading && patients.length > 0 && (
                <CommandGroup>
                  {patients.map((p) => (
                    <CommandItem
                      key={p.user_id}
                      value={p.name + p.user_id}
                      onSelect={() => {
                        onSelect(p);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {p.name.charAt(0)}
                        </span>
                        <p className="text-sm">{p.name}</p>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selected?.user_id === p.user_id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PatientPicker;
