// invite-patient-email
//
// Called by the GP portal or Chrome extension after a GP generates a visit
// summary for a patient who hasn't signed up yet.
//
// Flow:
//   1. GP authenticates, passes patient_email (+ optional visit_id)
//   2. We create a one-time practitioner invite linked to that email
//   3. Send an email via Resend with a link → /care/:token
//   4. Patient clicks link → signs up → auto-claims invite → sees summary
//
// Body: { patient_email: string, patient_name?: string, visit_id?: string }

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

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const appUrl = Deno.env.get("APP_URL") ?? "https://clarityhealth.au";

    const authHeader = req.headers.get("Authorization") ?? "";

    // ── Authenticate GP ────────────────────────────────────────
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } =
      await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Authentication required" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: practitioner, error: practitionerError } = await admin
      .from("practitioners")
      .select("id, full_name, email, profession, clinic_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (practitionerError || !practitioner) {
      return json(
        { error: "No practitioner record. Complete onboarding first." },
        403,
      );
    }

    // ── Parse body ─────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const patientEmail = (body.patient_email ?? "").trim().toLowerCase();
    const patientName = (body.patient_name ?? "").trim();
    const visitId = body.visit_id ?? null;

    if (
      !patientEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)
    ) {
      return json({ error: "Valid patient_email is required" }, 400);
    }

    // ── Check if patient already has an account ─────────────────
    let existingPatientId: string | null = null;

    // Use admin.listUsers with a page scan. For small user bases this is fine.
    // Supabase admin API doesn't have a getUserByEmail, so we scan.
    try {
      const { data: listResult } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const match = listResult?.users?.find(
        (u: { email?: string }) =>
          u.email?.toLowerCase() === patientEmail,
      );
      if (match) {
        existingPatientId = match.id;
      }
    } catch (_) {
      // Non-critical — if we can't check, just send the invite
    }

    // If patient already exists and is already on care team, send a
    // "your summary is ready" email via notify-patient instead
    if (existingPatientId && visitId) {
      const { data: existingMember } = await admin
        .from("care_team_members")
        .select("id")
        .eq("patient_id", existingPatientId)
        .eq("practitioner_id", practitioner.id)
        .is("revoked_at", null)
        .maybeSingle();

      if (existingMember) {
        // Patient already on care team — just send the notify-patient email
        // by invoking that function internally
        return json({
          already_registered: true,
          already_on_care_team: true,
          message:
            "Patient is already on your care team. Use the 'notify patient' button to send them their summary.",
        });
      }
    }

    // ── Generate invite token ──────────────────────────────────
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

    // Insert a one-time invite tied to this email
    const { data: invite, error: insertError } = await admin
      .from("practitioner_invites")
      .insert({
        practitioner_id: practitioner.id,
        token,
        label: `Email invite: ${patientEmail}`,
        is_evergreen: false,
        max_uses: 1,
        invited_email: patientEmail,
      })
      .select("id, token")
      .single();

    if (insertError || !invite) {
      // If invited_email column doesn't exist, retry without it
      if (insertError?.message?.includes("invited_email")) {
        const { data: invite2, error: insertError2 } = await admin
          .from("practitioner_invites")
          .insert({
            practitioner_id: practitioner.id,
            token,
            label: `Email invite: ${patientEmail}`,
            is_evergreen: false,
            max_uses: 1,
          })
          .select("id, token")
          .single();

        if (insertError2 || !invite2) {
          return json(
            { error: insertError2?.message ?? "Insert failed" },
            500,
          );
        }
        // Use invite2 below
        Object.assign(invite ?? {}, invite2);
      } else {
        return json({ error: insertError?.message ?? "Insert failed" }, 500);
      }
    }

    // ── Build invite URL ───────────────────────────────────────
    const inviteUrl = `${appUrl}/care/${encodeURIComponent(token)}`;

    // If there's a visit_id, build a direct visit link for after sign-up
    const visitUrl = visitId ? `${appUrl}/visit/${visitId}` : null;

    // ── Get clinic name ────────────────────────────────────────
    let clinicName: string | null = null;
    if (practitioner.clinic_id) {
      const { data: clinic } = await admin
        .from("clinics")
        .select("name")
        .eq("id", practitioner.clinic_id)
        .maybeSingle();
      clinicName = clinic?.name ?? null;
    }

    const gpName = practitioner.full_name ?? "Your doctor";
    const displayPatientName = patientName || "there";

    // ── Build email HTML ───────────────────────────────────────
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
    .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; }
    .logo { font-size: 20px; font-weight: 700; color: #6366f1; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 600; margin: 0 0 8px 0; color: #111827; }
    .subtitle { font-size: 15px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.5; }
    .info-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 0 0 24px 0; }
    .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 0 0 6px 0; }
    .info-text { font-size: 14px; line-height: 1.5; color: #374151; margin: 0; }
    .cta { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; margin-bottom: 16px; }
    .secondary-link { font-size: 13px; color: #6b7280; }
    .secondary-link a { color: #6366f1; text-decoration: none; }
    .steps { margin: 0 0 24px 0; padding: 0; list-style: none; }
    .steps li { position: relative; padding: 0 0 16px 32px; font-size: 14px; color: #374151; line-height: 1.5; }
    .steps li:before { content: attr(data-step); position: absolute; left: 0; top: 0; width: 22px; height: 22px; background: #6366f1; color: #fff; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 600; }
    .steps li:last-child { padding-bottom: 0; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af; }
    .footer a { color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Clarity Health</div>
      <h1>Hi ${escapeHtml(displayPatientName)}, ${escapeHtml(gpName)} has shared your visit summary</h1>
      <p class="subtitle">
        ${escapeHtml(gpName)}${clinicName ? ` at ${escapeHtml(clinicName)}` : ""} is using Clarity Health to give you clear, easy-to-understand summaries of your visits — including action items, medication info, and follow-up reminders.
      </p>

      <div class="info-box">
        <p class="info-label">What is Clarity Health?</p>
        <p class="info-text">
          A free app that turns your doctor's notes into a plain-English summary with a personalised checklist. Your data stays in Australia and is fully encrypted.
        </p>
      </div>

      <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Here's how to view your summary:</p>
      <ol class="steps">
        <li data-step="1">Click the button below to create your free account</li>
        <li data-step="2">${escapeHtml(gpName)} will be added to your care team automatically</li>
        <li data-step="3">View your visit summary, action items, and medication info</li>
      </ol>

      <a href="${inviteUrl}" class="cta">View My Summary &rarr;</a>

      <p class="secondary-link">
        Or copy this link: <a href="${inviteUrl}">${inviteUrl}</a>
      </p>
    </div>

    <div class="footer">
      <p>Clarity Health is not a medical device and does not provide medical advice.</p>
      <p>🇦🇺 Data stored in Australia &middot; End-to-end encrypted</p>
      <p style="margin-top: 12px;">You received this because ${escapeHtml(gpName)} invited you via Clarity Health.</p>
    </div>
  </div>
</body>
</html>`;

    // ── Send via Resend ────────────────────────────────────────
    if (resendApiKey) {
      // Use the GP's name in the "from" display and their email as "reply-to"
      // so patients see who the email is from and can reply to the GP directly.
      const gpEmail = practitioner.email || userData.user.email || "";
      const fromName = gpName !== "Your doctor" ? `${gpName} via Clarity Health` : "Clarity Health";
      const replyTo = gpEmail || undefined;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${fromName} <noreply@clarityhealth.au>`,
          reply_to: replyTo,
          to: [patientEmail],
          subject: `${gpName} has shared your visit summary — Clarity Health`,
          html,
        }),
      });

      if (!resendRes.ok) {
        const errBody = await resendRes.text();
        console.error("Resend API error:", errBody);
        return json(
          { error: "Failed to send email", detail: errBody },
          500,
        );
      }

      const resendData = await resendRes.json();

      // Log the invite in access_logs (only if patient already exists — patient_id is required)
      if (existingPatientId) {
        try {
          await admin.from("access_logs").insert({
            practitioner_id: practitioner.id,
            access_type: "email_invite_sent",
            source: "gp_portal",
            patient_id: existingPatientId,
          });
        } catch (_) {
          // Non-critical
        }
      }

      return json({
        success: true,
        email_id: resendData.id,
        invite_token: token,
        invite_url: inviteUrl,
      });
    }

    // No Resend key — return the invite link (dev mode)
    console.log(
      `[invite-patient-email] Would send to ${patientEmail}. Invite: ${inviteUrl}`,
    );
    return json({
      success: true,
      simulated: true,
      invite_token: token,
      invite_url: inviteUrl,
      to: patientEmail,
    });
  } catch (err) {
    console.error("invite-patient-email error:", err);
    return json({ error: (err as Error).message ?? "Unexpected error" }, 500);
  }
});
