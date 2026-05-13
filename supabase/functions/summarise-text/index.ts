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

interface PatientContext {
  state?: string;
  ongoing_conditions?: string;
  current_medications?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const transcript: string = (body.transcript || "").toString();
    const doctor_name: string | undefined = body.doctor_name;
    const visit_type: string | undefined = body.visit_type;
    const patient_context: PatientContext = body.patient_context || {};

    if (!transcript || transcript.trim().length < 30) {
      return new Response(
        JSON.stringify({
          error:
            "transcript is required and must be at least 30 characters",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userMessage = `Patient context:
- State: ${patient_context.state || "Not specified"}
- Ongoing conditions: ${patient_context.ongoing_conditions || "None specified"}
- Current medications: ${patient_context.current_medications || "None specified"}
${doctor_name ? `- Doctor: ${doctor_name}` : ""}
${visit_type ? `- Visit type: ${visit_type}` : ""}

Visit transcript:
${transcript}`;

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
      return new Response(
        JSON.stringify({ error: "AI gateway error: " + errText }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let summary;
    try {
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      summary = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response as JSON",
          raw_response: content,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Internal error: " + (err as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
