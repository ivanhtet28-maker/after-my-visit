import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = Deno.env.get("APP_URL") ?? "https://app.clarityhealth.au";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Clarity Health <noreply@clarityhealth.com.au>";

/**
 * notify-patient
 *
 * Called after a GP approves a visit summary. Sends the patient an email
 * notification so they know their summary is ready to read.
 *
 * Body: { visit_id: string }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { visit_id } = await req.json();
    if (!visit_id) {
      return new Response(
        JSON.stringify({ error: "visit_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch the visit with summary
    const { data: visit, error: visitError } = await supabase
      .from("visits")
      .select("id, user_id, doctor_name, visit_date, clinic_name, summary, status, approved_at, created_by_practitioner_id")
      .eq("id", visit_id)
      .single();

    if (visitError || !visit) {
      return new Response(
        JSON.stringify({ error: "Visit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Only notify for approved visits (GP-led visits go pending_approval → complete on approval)
    if (visit.status !== "complete" && !visit.approved_at) {
      return new Response(
        JSON.stringify({ error: "Visit not yet approved", status: visit.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get the patient's profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", visit.user_id)
      .single();

    // Get email from auth.users via admin API (service role)
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(visit.user_id);

    const patientEmail = authUser?.email;
    if (!patientEmail) {
      return new Response(
        JSON.stringify({ error: "Patient has no email on file" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const patientName = profile?.first_name || "there";
    const doctorName = visit.doctor_name || "your doctor";
    const visitDate = visit.visit_date
      ? new Date(visit.visit_date).toLocaleDateString("en-AU", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : "your recent visit";

    const quickSummary =
      typeof visit.summary === "object" && visit.summary?.quick_summary
        ? visit.summary.quick_summary
        : null;

    const actionCount =
      typeof visit.summary === "object" && Array.isArray(visit.summary?.action_items)
        ? visit.summary.action_items.length
        : 0;

    const visitUrl = `${APP_URL}/visit/${visit_id}`;

    // Build the email HTML
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
    .subtitle { font-size: 15px; color: #6b7280; margin: 0 0 24px 0; }
    .summary-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 0 0 24px 0; }
    .summary-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 0 0 6px 0; }
    .summary-text { font-size: 14px; line-height: 1.5; color: #374151; margin: 0; }
    .actions-note { font-size: 14px; color: #6b7280; margin: 0 0 24px 0; }
    .cta { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af; }
    .footer a { color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Clarity Health</div>
      <h1>Hi ${escapeHtml(patientName)}, your visit summary is ready</h1>
      <p class="subtitle">
        Dr ${escapeHtml(doctorName)} has approved your summary from ${escapeHtml(visitDate)}.
      </p>

      ${quickSummary ? `
      <div class="summary-box">
        <p class="summary-label">Quick Summary</p>
        <p class="summary-text">${escapeHtml(quickSummary)}</p>
      </div>
      ` : ""}

      ${actionCount > 0 ? `
      <p class="actions-note">
        You have <strong>${actionCount} action item${actionCount === 1 ? "" : "s"}</strong> to follow up on.
      </p>
      ` : ""}

      <a href="${visitUrl}" class="cta">View Full Summary</a>
    </div>

    <div class="footer">
      <p>Clarity Health is not a medical device and does not provide medical advice.</p>
      <p>🇦🇺 Data stored in Australia</p>
    </div>
  </div>
</body>
</html>`;

    // Send via Resend if key is available, otherwise log
    if (RESEND_API_KEY) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [patientEmail],
          subject: `Your visit summary from Dr ${doctorName} is ready`,
          html,
        }),
      });

      if (!resendRes.ok) {
        const errBody = await resendRes.text();
        console.error("Resend API error:", errBody);
        return new Response(
          JSON.stringify({ error: "Failed to send email", detail: errBody }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const resendData = await resendRes.json();

      // Log the notification in the audit trail
      // Note: access_logs requires a practitioner_id. If the visit was created
      // by a practitioner, log under them. Otherwise skip the log (patient-led).
      // Wrapped in try/catch — audit log failure should not block the email.
      if (visit.created_by_practitioner_id) {
        try {
          await supabase.from("access_logs").insert({
            patient_id: visit.user_id,
            practitioner_id: visit.created_by_practitioner_id,
            visit_id: visit.id,
            access_type: "visit_summary",
            source: "care_team",
          });
        } catch (_) {
          // Non-critical — email still sent successfully
        }
      }

      return new Response(
        JSON.stringify({ success: true, email_id: resendData.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // No Resend key — log but don't fail
    console.log(`[notify-patient] Would send email to ${patientEmail} for visit ${visit_id}`);
    return new Response(
      JSON.stringify({ success: true, simulated: true, to: patientEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("notify-patient error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
