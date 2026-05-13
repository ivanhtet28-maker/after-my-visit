// paste-visit
//
// Called by the Clarity GP Chrome extension. The GP pastes raw consult notes
// or a script, picks a patient by name, hits Submit. This function:
//   1. Resolves the patient via profiles.first_name + last_name (exact, case-insensitive).
//   2. Calls Gemini to summarise the raw text into the same structured shape
//      the dashboard already renders (mirrors `summarise-text`).
//   3. Inserts visit + action_items + medications rows under that patient's
//      user_id using the service-role key.
//   4. Returns the new visit_id so the extension can open the dashboard.
//
// CORS is wide open because Chrome extensions speak from a chrome-extension://
// origin that's hard to allowlist statically.
//
// POST /functions/v1/paste-visit
// { patient_name: "Jessica Mitchell",
//   raw_text:     "Doctor: Morning Jessica, your BP is...",
//   doctor_name?: "Dr Zhao",
//   visit_type?:  "gp",
//   dashboard_origin?: "https://app.clarityhealth.au"  // for the return URL only
// }
//
// Response: { ok: true, visit_id, dashboard_url } | { ok: false, error }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an Australian healthcare assistant that helps patients understand their doctor visits. You analyse visit transcripts and create structured, easy-to-understand summaries.

Rules:
- Use Australian English spelling (colour, organisation, specialise, etc.)
- Never provide medical advice or diagnoses
- Only summarise what was actually discussed in the transcript
- Explain medical terms in plain English using parentheses, e.g. "hypertension (high blood pressure)"
- Reference PBS (Pharmaceutical Benefits Scheme) for any medications mentioned
- Reference Medicare item numbers if mentioned
- Flag anything that sounds urgent with a ⚠️ prefix
- Be warm, clear, and reassuring in tone
- If something in the transcript is unclear or ambiguous, note it as "unclear from recording"

Respond ONLY with a JSON object (no markdown, no backticks) in this exact structure:
{
  "quick_summary": "1-2 sentence overview of the visit",
  "chief_complaint": "Why the patient visited",
  "key_discussion_points": ["point 1", "point 2"],
  "assessment": "What the doctor found or suspects, in plain English",
  "plan": ["plan item 1", "plan item 2"],
  "action_items": [{"description": "what to do", "category": "medication|follow_up|test|lifestyle|referral", "due_date_suggestion": "e.g. Within 1 week"}],
  "medications": [{"name": "medication name", "dosage": "dosage", "frequency": "how often", "explanation": "plain English what it does", "is_pbs": true}],
  "referrals": [{"to": "specialist type", "reason": "why", "next_steps": "what patient should do"}],
  "follow_up_questions": ["suggested question 1"],
  "medical_terms": [{"term": "medical term", "explanation": "plain English explanation"}],
  "urgency_flags": ["any urgent items"]
}`;

interface RequestBody {
  patient_name?: string;
  raw_text?: string;
  doctor_name?: string;
  visit_type?: string;
  dashboard_origin?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method not allowed" }, 405);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "bad json" }, 400);
  }

  const patientName = (body.patient_name ?? "").trim();
  const rawText = (body.raw_text ?? "").trim();
  if (!patientName) return jsonResponse({ ok: false, error: "patient_name is required" }, 400);
  if (rawText.length < 30) return jsonResponse({ ok: false, error: "raw_text must be at least 30 characters" }, 400);

  // Split "First Last" → first/last. We do an exact match (case-insensitive)
  // so an unfortunate filler name like "John Smith" doesn't accidentally hit a
  // real John Smith in the database.
  const nameParts = patientName.split(/\s+/);
  if (nameParts.length < 2) {
    return jsonResponse({ ok: false, error: "patient_name must be 'First Last'" }, 400);
  }
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !serviceRole) {
    return jsonResponse({ ok: false, error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set" }, 500);
  }
  if (!geminiApiKey) {
    return jsonResponse({ ok: false, error: "GEMINI_API_KEY not configured" }, 500);
  }

  const sb = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Resolve patient
  const { data: profile, error: profileErr } = await sb
    .from("profiles")
    .select("id, first_name, last_name")
    .ilike("first_name", firstName)
    .ilike("last_name", lastName)
    .limit(1)
    .maybeSingle();

  if (profileErr) {
    return jsonResponse({ ok: false, error: `profile lookup failed: ${profileErr.message}` }, 500);
  }
  if (!profile) {
    return jsonResponse({
      ok: false,
      error: `No patient named "${patientName}" found. For the demo, ensure Jessica Mitchell is registered as a patient in Supabase auth.`,
    }, 404);
  }

  // 2. Summarise via Gemini
  const userMessage = `Patient: ${profile.first_name} ${profile.last_name}
${body.doctor_name ? `Doctor: ${body.doctor_name}` : ""}
${body.visit_type ? `Visit type: ${body.visit_type}` : ""}

Visit transcript / notes:
${rawText}`;

  const aiResp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${geminiApiKey}`, "Content-Type": "application/json" },
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
    return jsonResponse({ ok: false, error: `AI gateway error: ${errText}` }, 502);
  }

  const aiResult = await aiResp.json();
  const content = aiResult.choices?.[0]?.message?.content || "";
  let summary: Record<string, unknown>;
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    summary = JSON.parse(cleaned);
  } catch {
    return jsonResponse({
      ok: false, error: "Failed to parse AI response as JSON", raw_response: content,
    }, 422);
  }

  // 3. Insert visit + child rows under the patient's user_id (service role bypasses RLS).
  const nowIso = new Date().toISOString();
  const visitInsert = {
    user_id: profile.id,
    doctor_name: body.doctor_name ?? "Dr Zhao",
    clinic_name: "Pasted via Chrome extension",
    visit_type: body.visit_type ?? "gp",
    visit_date: nowIso.slice(0, 10),
    transcript: rawText,
    summary,
    status: "complete",
    source: "chrome_extension_paste",
  };

  const { data: visitRow, error: visitErr } = await sb
    .from("visits")
    .insert(visitInsert)
    .select("id")
    .single();

  if (visitErr || !visitRow) {
    return jsonResponse({ ok: false, error: `visit insert failed: ${visitErr?.message ?? "unknown"}` }, 500);
  }
  const visitId = visitRow.id;

  // action_items
  const actionItems = Array.isArray(summary.action_items) ? summary.action_items as Array<Record<string, unknown>> : [];
  if (actionItems.length) {
    const inserts = actionItems.map((a) => ({
      user_id: profile.id,
      visit_id: visitId,
      description: a.description ?? "",
      category: a.category ?? null,
      status: "pending",
    }));
    const { error: actionErr } = await sb.from("action_items").insert(inserts);
    if (actionErr) console.error("action_items insert failed:", actionErr.message);
  }

  // medications
  const meds = Array.isArray(summary.medications) ? summary.medications as Array<Record<string, unknown>> : [];
  if (meds.length) {
    const inserts = meds.map((m) => ({
      user_id: profile.id,
      visit_id: visitId,
      name: m.name ?? "",
      dosage: m.dosage ?? null,
      frequency: m.frequency ?? null,
      explanation: m.explanation ?? null,
      is_pbs: typeof m.is_pbs === "boolean" ? m.is_pbs : null,
    }));
    const { error: medErr } = await sb.from("medications").insert(inserts);
    if (medErr) console.error("medications insert failed:", medErr.message);
  }

  const origin = body.dashboard_origin?.replace(/\/$/, "") ?? "";
  const dashboardUrl = origin
    ? `${origin}/visits/${visitId}`
    : `/visits/${visitId}`;

  return jsonResponse({
    ok: true,
    visit_id: visitId,
    patient: { first_name: profile.first_name, last_name: profile.last_name },
    dashboard_url: dashboardUrl,
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
