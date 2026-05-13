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

// Public lookup. Given a token, returns sanitised practitioner info so the
// /care/:token landing page can render the practitioner card before the
// patient signs up. Does NOT log access — that happens on claim.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string") {
      return json({ error: "token is required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: invite, error: inviteError } = await supabase
      .from("practitioner_invites")
      .select("id, practitioner_id, expires_at, max_uses, use_count, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (inviteError || !invite) {
      return json({ error: "Invite not found" }, 404);
    }
    if (invite.revoked_at) {
      return json({ error: "Invite revoked" }, 410);
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return json({ error: "Invite expired" }, 410);
    }
    if (invite.max_uses != null && invite.use_count >= invite.max_uses) {
      return json({ error: "Invite no longer available" }, 410);
    }

    const { data: practitioner, error: practitionerError } = await supabase
      .from("practitioners")
      .select("id, full_name, profession, clinic_id")
      .eq("id", invite.practitioner_id)
      .maybeSingle();

    if (practitionerError || !practitioner) {
      return json({ error: "Practitioner not found" }, 404);
    }

    let clinicName: string | null = null;
    if (practitioner.clinic_id) {
      const { data: clinic } = await supabase
        .from("clinics")
        .select("name")
        .eq("id", practitioner.clinic_id)
        .maybeSingle();
      clinicName = clinic?.name ?? null;
    }

    return json({
      practitioner: {
        id: practitioner.id,
        full_name: practitioner.full_name,
        profession: practitioner.profession,
        clinic_name: clinicName,
      },
    });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unexpected error" }, 500);
  }
});
