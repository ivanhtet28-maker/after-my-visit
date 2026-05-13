import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Practitioner = Tables<"practitioners">;

interface UsePractitionerResult {
  practitioner: Practitioner | null;
  loading: boolean;
  needsOnboarding: boolean;
  refetch: () => Promise<void>;
}

export function usePractitioner(): UsePractitionerResult {
  const { user, loading: authLoading } = useAuth();
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPractitioner = async () => {
    if (!user) {
      setPractitioner(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("practitioners")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setPractitioner(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    fetchPractitioner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  return {
    practitioner,
    loading: authLoading || loading,
    needsOnboarding: !!user && !loading && !practitioner,
    refetch: fetchPractitioner,
  };
}
