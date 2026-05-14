// paste-visit
//
// Called by the Clarity GP Chrome extension (authenticated) or the GP portal.
// The GP picks a care-team patient, pastes raw consult notes, and submits.
//
// This function:
//   1. Authenticates the GP and validates their practitioner record.
//   2. Resolves the patient — prefers patient_user_id (secure), falls back to
//      name-based lookup for backwards compatibility.
//   3. Validates the GP has the patient on their care team.
//   4. Calls Gemini to summarise the raw text into structured JSON.
//   5. Inserts visit + action_items + medications + scheduled_reminders rows.
//   6. Returns the new visit_id.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SYSTEM_PROMPT } from "../_shared/ai-prompt.ts";
import { createReminders } from "../_shared/create-reminders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  patient_user_id?: string;
  patient_name?: string;
  raw_text?: string;
  doctor_name?: string;
  visit_type?: string;
  dashboard_origin?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method not allowed" }, 405);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "bad json" }, 400);
  }

  const rawText = (body.raw_text ?? "").trim();
  if (rawText.length < 30)
    return jsonResponse(
      { ok: false, error: "raw_text must be at least 30 characters" },
      400,
    );

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !serviceRole) {
    return jsonResponse(
      { ok: false, error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set" },
      500,
    );
  }
  if (!geminiApiKey) {
    return jsonResponse({ ok: false, error: "GEMINI_API_KEY not configured" }, 500);
  }

  const sb = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── 0. Authenticate the GP ──────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  let practitionerId: string | null = null;
  let gpUserId: string | null = null;

  if (authHeader && anonKey) {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (userData?.user) {
      gpUserId = userData.user.id;
      const { data: practitioner } = await sb
        .from("practitioners")
        .select("id, full_name")
        .eq("user_id", gpUserId)
        .maybeSingle();
      if (practitioner) {
        practitionerId = practitioner.id;
        // Use practitioner's registered name if no override
        if (!body.doctor_name) {
          body.doctor_name = practitioner.full_name;
        }
      }
    }
  }

  // ── 1. Resolve patient ──────────────────────────────────────────
  let profile: { id: string; first_name: string | null; last_name: string | null } | null =
    null;

  if (body.patient_user_id) {
    // Preferred path: direct user_id lookup (from authenticated extension)
    const { data, error: profileErr } = await sb
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("id", body.patient_user_id)
      .maybeSingle();

    if (profileErr) {
      return jsonResponse(
        { ok: false, error: `profile lookup failed: ${profileErr.message}` },
        500,
      );
    }
    profile = data;
  } else if (body.patient_name) {
    // Fallback: name-based lookup (backwards compat)
    const patientName = body.patient_name.trim();
    const nameParts = patientName.split(/\s+/);
    if (nameParts.length < 2) {
      return jsonResponse(
        { ok: false, error: "patient_name must be 'First Last'" },
        400,
      );
    }
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const { data, error: profileErr } = await sb
      .from("profiles")
      .select("id, first_name, last_name")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(1)
      .maybeSingle();

    if (profileErr) {
      return jsonResponse(
        { ok: false, error: `profile lookup failed: ${profileErr.message}` },
        500,
      );
    }
    profile = data;
  } else {
    return jsonResponse(
      { ok: false, error: "patient_user_id or patient_name is required" },
      400,
    );
  }

  if (!profile) {
    return jsonResponse(
      {
        ok: false,
        error: `No patient found. Ensure the patient is registered in Clarity Health.`,
      },
      404,
    );
  }

  // ── 2. Validate care-team membership (if GP is authenticated) ──
  if (practitionerId) {
    const { data: membership } = await sb
      .from("care_team_members")
      .select("id")
      .eq("practitioner_id", practitionerId)
      .eq("patient_id", profile.id)
      .is("revoked_at", null)
      .maybeSingle();

    if (!membership) {
      return jsonResponse(
        {
          ok: false,
          error: `This patient is not on your care team. Ask them to scan your QR code first.`,
        },
        403,
      );
    }
  }

  // ── 3. Summarise via Gemini ─────────────────────────────────────
  const userMessage = `Patient: ${profile.first_name || ""} ${profile.last_name || ""}
${body.doctor_name ? `Doctor: ${body.doctor_name}` : ""}
${body.visit_type ? `Visit type: ${body.visit_type}` : ""}

Visit transcript / notes:
${rawText}`;

  const aiResp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${geminiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    },
  );

  if (!aiResp.ok) {
    const errText = await aiResp.text();
    return jsonResponse(
      { ok: false, error: `AI gateway error: ${errText}` },
      502,
    );
  }

  const aiResult = await aiResp.json();
  const content = aiResult.choices?.[0]?.message?.content || "";
  let summary: Record<string, unknown>;
  try {
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    summary = JSON.parse(cleaned);
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Failed to parse AI response as JSON",
        raw_response: content,
      },
      422,
    );
  }

  // ── 4. Insert visit ─────────────────────────────────────────────
  const nowIso = new Date().toISOString();
  const visitDate = nowIso.slice(0, 10);
  const doctorName = body.doctor_name ?? "Your doctor";

  const visitInsert: Record<string, unknown> = {
    user_id: profile.id,
    doctor_name: doctorName,
    clinic_name: "Pasted via Chrome extension",
    visit_type: body.visit_type ?? "gp",
    visit_date: visitDate,
    transcript: rawText,
    summary,
    status: "pending_approval",
    source: "chrome_extension_paste",
  };

  // Link visit to the practitioner if authenticated
  if (practitionerId) {
    visitInsert.created_by_practitioner_id = practitionerId;
  }

  const { data: visitRow, error: visitErr } = await sb
    .from("visits")
    .insert(visitInsert)
    .select("id")
    .single();

  if (visitErr || !visitRow) {
    return jsonResponse(
      {
        ok: false,
        error: `visit insert failed: ${visitErr?.message ?? "unknown"}`,
      },
      500,
    );
  }
  const visitId = visitRow.id;

  // ── 5. Action items ─────────────────────────────────────────────
  const actionItemIds = new Map<string, string>();
  const actionItems = Array.isArray(summary.action_items)
    ? (summary.action_items as Array<Record<string, unknown>>)
    : [];
  if (actionItems.length) {
    const inserts = actionItems.map((a) => ({
      user_id: profile!.id,
      visit_id: visitId,
      description: (a.description as string) ?? "",
      category: (a.category as string) ?? null,
      status: "pending",
    }));
    const { data: insertedActions, error: actionErr } = await sb
      .from("action_items")
      .insert(inserts)
      .select("id, description");
    if (actionErr)
      console.error("action_items insert failed:", actionErr.message);
    if (insertedActions) {
      for (const row of insertedActions) {
        actionItemIds.set(row.description, row.id);
      }
    }
  }

  // ── 6. Medications ──────────────────────────────────────────────
  const medicationIds = new Map<string, string>();
  const meds = Array.isArray(summary.medications)
    ? (summary.medications as Array<Record<string, unknown>>)
    : [];
  if (meds.length) {
    const inserts = meds.map((m) => ({
      user_id: profile!.id,
      visit_id: visitId,
      name: (m.name as string) ?? "",
      dosage: (m.dosage as string) ?? null,
      frequency: (m.frequency as string) ?? null,
      plain_explanation: (m.explanation as string) ?? null,
      is_pbs: typeof m.is_pbs === "boolean" ? m.is_pbs : null,
      prescribing_doctor: doctorName,
      date_prescribed: visitDate,
    }));
    const { data: insertedMeds, error: medErr } = await sb
      .from("medications")
      .insert(inserts)
      .select("id, name");
    if (medErr) console.error("medications insert failed:", medErr.message);
    if (insertedMeds) {
      for (const row of insertedMeds) {
        medicationIds.set(row.name, row.id);
      }
    }
  }

  // ── 7. Smart reminders ──────────────────────────────────────────
  const reminderResult = await createReminders(
    sb,
    profile.id,
    visitId,
    visitDate,
    doctorName,
    actionItemIds,
    medicationIds,
    summary,
  );
  if (reminderResult.errors.length) {
    console.warn("Reminder creation warnings:", reminderResult.errors);
  }

  const origin = body.dashboard_origin?.replace(/\/$/, "") ?? "";
  const dashboardUrl = origin
    ? `${origin}/visits/${visitId}`
    : `/visits/${visitId}`;

  return jsonResponse({
    ok: true,
    visit_id: visitId,
    patient: {
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
    dashboard_url: dashboardUrl,
    reminders_created: reminderResult.created,
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
