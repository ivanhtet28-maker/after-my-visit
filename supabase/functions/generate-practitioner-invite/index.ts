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

// 12-char URL-safe random token. ~71 bits of entropy — plenty for invite codes.
function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

interface RequestBody {
  label?: string | null;
  is_evergreen?: boolean;
  expires_at?: string | null;
  max_uses?: number | null;
}

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

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: practitioner, error: practitionerError } = await admin
      .from("practitioners")
      .select("id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (practitionerError || !practitioner) {
      return json(
        { error: "No practitioner record. Complete onboarding first." },
        403,
      );
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const isEvergreen = body.is_evergreen ?? true;
    const label = body.label ?? null;
    const expiresAt = body.expires_at ?? null;
    const maxUses = body.max_uses ?? null;

    if (isEvergreen) {
      const { data: existing } = await admin
        .from("practitioner_invites")
        .select("id, token")
        .eq("practitioner_id", practitioner.id)
        .eq("is_evergreen", true)
        .is("revoked_at", null)
        .maybeSingle();

      if (existing) {
        return json({
          token: existing.token,
          invite_id: existing.id,
          reused: true,
        });
      }
    }

    let token = generateToken();
    let attempts = 0;
    while (attempts < 5) {
      const { data: collision } = await admin
        .from("practitioner_invites")
        .select("id")
        .eq("token", token)
        .maybeSingle();
      if (!collision) break;
      token = generateToken();
      attempts++;
    }

    const { data: inserted, error: insertError } = await admin
      .from("practitioner_invites")
      .insert({
        practitioner_id: practitioner.id,
        token,
        label,
        is_evergreen: isEvergreen,
        expires_at: expiresAt,
        max_uses: maxUses,
      })
      .select("id, token")
      .single();

    if (insertError || !inserted) {
      return json({ error: insertError?.message ?? "Insert failed" }, 500);
    }

    return json({
      token: inserted.token,
      invite_id: inserted.id,
      reused: false,
    });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unexpected error" }, 500);
  }
});
