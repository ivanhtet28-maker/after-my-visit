import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Authentication required" }, 401);
    }
    const patientId = userData.user.id;

    const { token } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string") {
      return json({ error: "token is required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: invite, error: inviteError } = await admin
      .from("practitioner_invites")
      .select("id, practitioner_id, expires_at, max_uses, use_count, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (inviteError || !invite) {
      return json({ error: "Invite not found" }, 404);
    }
    if (invite.revoked_at) return json({ error: "Invite revoked" }, 410);
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return json({ error: "Invite expired" }, 410);
    }
    if (invite.max_uses != null && invite.use_count >= invite.max_uses) {
      return json({ error: "Invite no longer available" }, 410);
    }

    // The patient must have a profiles row. profiles is auto-created by the
    // handle_new_user trigger on auth.users insert, so this should always exist.
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", patientId)
      .maybeSingle();
    if (!profile) {
      return json(
        { error: "Patient profile not found. Sign up before claiming." },
        403,
      );
    }

    // Don't let practitioners claim their own invite as a patient
    const { data: callerPractitioner } = await admin
      .from("practitioners")
      .select("id")
      .eq("user_id", patientId)
      .maybeSingle();
    if (callerPractitioner && callerPractitioner.id === invite.practitioner_id) {
      return json({ error: "You can't add yourself to your own care team." }, 400);
    }

    // Idempotent: if an active row already exists, return it without incrementing
    const { data: existing } = await admin
      .from("care_team_members")
      .select("id")
      .eq("patient_id", patientId)
      .eq("practitioner_id", invite.practitioner_id)
      .is("revoked_at", null)
      .maybeSingle();

    let careTeamMemberId: string;

    if (existing) {
      careTeamMemberId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await admin
        .from("care_team_members")
        .insert({
          patient_id: patientId,
          practitioner_id: invite.practitioner_id,
          invite_id: invite.id,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        return json({ error: insertError?.message ?? "Insert failed" }, 500);
      }
      careTeamMemberId = inserted.id;

      await admin
        .from("practitioner_invites")
        .update({ use_count: invite.use_count + 1 })
        .eq("id", invite.id);

      await admin.from("access_logs").insert({
        patient_id: patientId,
        practitioner_id: invite.practitioner_id,
        access_type: "care_team_join",
        source: "invite_link",
      });
    }

    const { data: practitioner } = await admin
      .from("practitioners")
      .select("id, full_name, profession, clinic_id")
      .eq("id", invite.practitioner_id)
      .maybeSingle();

    let clinicName: string | null = null;
    if (practitioner?.clinic_id) {
      const { data: clinic } = await admin
        .from("clinics")
        .select("name")
        .eq("id", practitioner.clinic_id)
        .maybeSingle();
      clinicName = clinic?.name ?? null;
    }

    return json({
      care_team_member_id: careTeamMemberId,
      practitioner: practitioner
        ? {
            id: practitioner.id,
            full_name: practitioner.full_name,
            profession: practitioner.profession,
            clinic_name: clinicName,
          }
        : null,
      already_member: !!existing,
    });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unexpected error" }, 500);
  }
});
