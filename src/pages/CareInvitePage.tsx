import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvitePractitioner {
  id: string;
  full_name: string;
  profession: string;
  clinic_name: string | null;
}

const PROFESSION_LABELS: Record<string, string> = {
  gp: "GP",
  physio: "Physiotherapist",
  psych: "Psychologist",
  dietitian: "Dietitian",
  ot: "Occupational Therapist",
  other: "Practitioner",
};

const CareInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [practitioner, setPractitioner] = useState<InvitePractitioner | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!token) {
      setLookupError("No invite token in the URL.");
      setLookingUp(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke(
        "lookup-practitioner-invite",
        { body: { token } },
      );
      if (cancelled) return;
      if (error || !data?.practitioner) {
        setLookupError(
          (data as { error?: string } | null)?.error ??
            error?.message ??
            "This invite is no longer valid.",
        );
      } else {
        setPractitioner(data.practitioner as InvitePractitioner);
      }
      setLookingUp(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleClaim = async () => {
    if (!token) return;
    setClaiming(true);
    const { data, error } = await supabase.functions.invoke(
      "claim-practitioner-invite",
      { body: { token } },
    );
    setClaiming(false);
    if (error || (data as { error?: string } | null)?.error) {
      toast.error("Couldn't add to your care team", {
        description:
          (data as { error?: string } | null)?.error ??
          error?.message ??
          "Try again.",
      });
      return;
    }
    const claimed = data as {
      already_member?: boolean;
      practitioner?: InvitePractitioner;
    };
    toast.success(
      claimed.already_member
        ? `${claimed.practitioner?.full_name ?? "This practitioner"} is already on your care team`
        : `${claimed.practitioner?.full_name ?? "Practitioner"} added to your care team`,
    );
    navigate("/dashboard");
  };

  const goSignUp = () => {
    if (!token) return;
    navigate(`/signup?invite=${encodeURIComponent(token)}`);
  };

  const goLogIn = () => {
    if (!token) return;
    navigate(`/login?invite=${encodeURIComponent(token)}`);
  };

  if (authLoading || lookingUp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (lookupError || !practitioner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-card">
          <h1 className="text-xl font-semibold text-card-foreground">
            Invite unavailable
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {lookupError ?? "This invite link can't be used right now."}
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const professionLabel =
    PROFESSION_LABELS[practitioner.profession] ?? "Practitioner";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Clarity Health
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {practitioner.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                {professionLabel}
                {practitioner.clinic_name ? ` · ${practitioner.clinic_name}` : ""}
              </p>
              <h1 className="truncate text-xl font-semibold text-card-foreground">
                {practitioner.full_name}
              </h1>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-card-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">What this gives them</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
                  <li>View your AI health profile and approved visit summaries</li>
                  <li>Send you new approved consult summaries</li>
                  <li>You can revoke access anytime in Settings</li>
                </ul>
              </div>
            </div>
          </div>

          {user ? (
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full gap-2 min-h-[44px]"
            >
              {claiming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Add to my care team
            </Button>
          ) : (
            <div className="space-y-3">
              <Button onClick={goSignUp} className="w-full min-h-[44px]">
                Sign up to receive your summaries
              </Button>
              <Button
                onClick={goLogIn}
                variant="outline"
                className="w-full min-h-[44px]"
              >
                I already have an account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareInvitePage;
