// extension-patients
//
// Returns the authenticated GP's care-team patients.
// Called by the Chrome extension to populate the patient picker.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Verify the caller is authenticated
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "Authentication required" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify caller is a practitioner
    const { data: practitioner, error: practError } = await admin
      .from("practitioners")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (practError || !practitioner) {
      return json(
        { error: "No practitioner account found. Complete GP onboarding first." },
        403,
      );
    }

    // Fetch care-team patients
    const { data: members, error: membersError } = await admin
      .from("care_team_members")
      .select(
        "id, granted_at, patient:profiles!care_team_members_patient_id_fkey(id, first_name, last_name)",
      )
      .eq("practitioner_id", practitioner.id)
      .is("revoked_at", null)
      .order("granted_at", { ascending: false });

    if (membersError) {
      return json({ error: membersError.message }, 500);
    }

    const patients = (members ?? [])
      .map((row) => {
        const patient = (
          row as {
            patient: {
              id: string;
              first_name: string | null;
              last_name: string | null;
            } | null;
          }
        ).patient;
        if (!patient) return null;

        const firstName = patient.first_name?.trim() || "";
        const lastName = patient.last_name?.trim() || "";
        const name = [firstName, lastName].filter(Boolean).join(" ") || "Patient";

        return {
          user_id: patient.id,
          name,
          first_name: firstName,
          last_name: lastName,
          granted_at: row.granted_at as string,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    return json({ patients, practitioner_id: practitioner.id });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unexpected error" }, 500);
  }
});
