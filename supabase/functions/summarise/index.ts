import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  "doctors_recommendations": [{"number": 1, "text": "recommendation text"}],
  "action_items": [{"description": "what to do", "category": "medication|follow_up|test|lifestyle|referral", "due_date_suggestion": "e.g. Within 1 week"}],
  "medications": [{"name": "medication name", "dosage": "dosage", "frequency": "how often", "explanation": "plain English what it does", "is_pbs": true}],
  "referrals": [{"to": "specialist type", "reason": "why", "next_steps": "what patient should do"}],
  "follow_up_questions": ["suggested question 1"],
  "medical_terms": [{"term": "medical term", "explanation": "plain English explanation"}],
  "urgency_flags": ["any urgent items"]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visit_id } = await req.json();
    if (!visit_id) {
      return new Response(JSON.stringify({ error: "visit_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch visit
    const { data: visit, error: visitError } = await supabase
      .from("visits")
      .select("*")
      .eq("id", visit_id)
      .single();

    if (visitError || !visit) {
      return new Response(JSON.stringify({ error: "Visit not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!visit.transcript) {
      return new Response(JSON.stringify({ error: "No transcript available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", visit.user_id)
      .single();

    const userMessage = `Patient context:
- State: ${profile?.state || "Not specified"}
- Ongoing conditions: ${profile?.ongoing_conditions || "None specified"}
- Current medications: ${profile?.current_medications || "None specified"}

Visit transcript:
${visit.transcript}`;

    // Call Google Gemini API (OpenAI-compatible endpoint)
    const aiResponse = await fetch(
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

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      await supabase.from("visits").update({ status: "error" }).eq("id", visit_id);
      return new Response(JSON.stringify({ error: "AI error: " + errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let summary;
    try {
      // Strip any markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      summary = JSON.parse(cleaned);
    } catch {
      await supabase.from("visits").update({ status: "error" }).eq("id", visit_id);
      return new Response(JSON.stringify({ error: "Failed to parse AI response as JSON" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Status depends on visit source:
    // - GP-led visits (native_recording, chrome_extension_paste) await GP approval before patient sees them
    // - patient_recorded fallback skips approval gate
    const isGpLed = visit.source === "native_recording" || visit.source === "chrome_extension_paste";
    const nextStatus = isGpLed ? "pending_approval" : "complete";
    const approvedAt = isGpLed ? null : new Date().toISOString();

    await supabase.from("visits").update({
      summary,
      status: nextStatus,
      approved_at: approvedAt,
    }).eq("id", visit_id);

    // Create action items
    if (summary.action_items?.length) {
      const actionInserts = summary.action_items.map((item: any) => ({
        user_id: visit.user_id,
        visit_id: visit_id,
        description: item.description,
        category: item.category,
        status: "pending",
      }));
      await supabase.from("action_items").insert(actionInserts);
    }

    // Create medications
    if (summary.medications?.length) {
      const medInserts = summary.medications.map((med: any) => ({
        user_id: visit.user_id,
        visit_id: visit_id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        plain_explanation: med.explanation,
        is_pbs: med.is_pbs || false,
        prescribing_doctor: visit.doctor_name,
        date_prescribed: visit.visit_date,
      }));
      await supabase.from("medications").insert(medInserts);
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error: " + (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
