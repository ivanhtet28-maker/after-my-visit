import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_PROMPT } from "../_shared/ai-prompt.ts";
import { createReminders } from "../_shared/create-reminders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    let summary: Record<string, unknown>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      summary = JSON.parse(cleaned);
    } catch {
      await supabase.from("visits").update({ status: "error" }).eq("id", visit_id);
      return new Response(JSON.stringify({ error: "Failed to parse AI response as JSON" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Status depends on visit source
    const isGpLed = visit.source === "native_recording" || visit.source === "chrome_extension_paste";
    const nextStatus = isGpLed ? "pending_approval" : "complete";
    const approvedAt = isGpLed ? null : new Date().toISOString();

    await supabase.from("visits").update({
      summary,
      status: nextStatus,
      approved_at: approvedAt,
    }).eq("id", visit_id);

    // Create action items & collect IDs for reminder creation
    const actionItemIds = new Map<string, string>();
    if (Array.isArray(summary.action_items) && summary.action_items.length) {
      const actionInserts = (summary.action_items as any[]).map((item) => ({
        user_id: visit.user_id,
        visit_id: visit_id,
        description: item.description,
        category: item.category,
        status: "pending",
      }));
      const { data: insertedActions } = await supabase
        .from("action_items")
        .insert(actionInserts)
        .select("id, description");
      if (insertedActions) {
        for (const row of insertedActions) {
          actionItemIds.set(row.description, row.id);
        }
      }
    }

    // Create medications & collect IDs
    const medicationIds = new Map<string, string>();
    if (Array.isArray(summary.medications) && summary.medications.length) {
      const medInserts = (summary.medications as any[]).map((med) => ({
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
      const { data: insertedMeds } = await supabase
        .from("medications")
        .insert(medInserts)
        .select("id, name");
      if (insertedMeds) {
        for (const row of insertedMeds) {
          medicationIds.set(row.name, row.id);
        }
      }
    }

    // Create smart reminders from AI-extracted schedule data
    const reminderResult = await createReminders(
      supabase,
      visit.user_id,
      visit_id,
      visit.visit_date || new Date().toISOString(),
      visit.doctor_name || "your doctor",
      actionItemIds,
      medicationIds,
      summary,
    );
    if (reminderResult.errors.length) {
      console.warn("Reminder creation warnings:", reminderResult.errors);
    }

    // For patient-recorded visits (not GP-led), notify immediately
    if (!isGpLed) {
      try {
        await supabase.functions.invoke("notify-patient", {
          body: { visit_id },
        });
      } catch (notifyErr) {
        console.warn("notify-patient call failed:", notifyErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      summary,
      reminders_created: reminderResult.created,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error: " + (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
