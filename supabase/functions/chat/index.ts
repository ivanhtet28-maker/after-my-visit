import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are AfterVisit AI, a friendly Australian healthcare assistant. You help patients understand their doctor visits, medications, and health information.

Rules:
- Use Australian English spelling
- NEVER provide medical advice, diagnoses, or treatment recommendations
- ONLY answer based on the visit data and context provided
- If asked something not covered in the visit data, say "That wasn't discussed in your visit. I'd recommend asking your doctor about this at your next appointment."
- Explain medical terms simply when they come up
- Reference Medicare and PBS when relevant
- Be warm, empathetic, and reassuring
- Keep responses concise (2-4 paragraphs max)
- If the patient seems distressed or describes emergency symptoms, always recommend calling 000 or visiting their nearest emergency department
- End responses with a helpful follow-up suggestion when appropriate

You are NOT a doctor. Always remind patients to verify important information with their healthcare provider.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visit_id, user_id, message, context_type } = await req.json();

    if (!user_id || !message) {
      return new Response(JSON.stringify({ error: "user_id and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Rate limiting check
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user_id)
      .single();

    const tier = profile?.subscription_tier || "free";

    if (tier === "free") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("role", "user")
        .gte("created_at", oneHourAgo);

      if ((count || 0) >= 10) {
        return new Response(JSON.stringify({
          error: "You've reached the free tier limit of 10 messages per hour. Upgrade to Plus for unlimited AI chat.",
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Build context
    let contextContent = "";

    if (context_type === "visit_summary" && visit_id) {
      const { data: visit } = await supabase
        .from("visits")
        .select("*")
        .eq("id", visit_id)
        .single();

      if (visit) {
        contextContent = `Visit context:
Doctor: ${visit.doctor_name || "Unknown"}
Date: ${visit.visit_date}
Type: ${visit.visit_type}
Summary: ${JSON.stringify(visit.summary)}
Transcript: ${visit.transcript || "Not available"}`;
      }
    } else if (context_type === "patient_record") {
      const [visitsRes, medsRes, actionsRes] = await Promise.all([
        supabase.from("visits").select("doctor_name, visit_date, visit_type, summary").eq("user_id", user_id).order("visit_date", { ascending: false }).limit(5),
        supabase.from("medications").select("name, dosage, frequency, status").eq("user_id", user_id),
        supabase.from("action_items").select("description, status, due_date, category").eq("user_id", user_id).eq("status", "pending"),
      ]);

      contextContent = `Patient record:
Recent visits: ${JSON.stringify(visitsRes.data || [])}
Current medications: ${JSON.stringify(medsRes.data || [])}
Pending actions: ${JSON.stringify(actionsRes.data || [])}`;
    } else {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, state, ongoing_conditions, current_medications")
        .eq("id", user_id)
        .single();

      contextContent = `Patient profile: ${JSON.stringify(profileData || {})}`;
    }

    // Fetch recent chat history
    const historyQuery = supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (visit_id) {
      historyQuery.eq("visit_id", visit_id);
    }

    const { data: history } = await historyQuery;
    const chatHistory = (history || []).reverse().map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    // Build messages array
    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextContent },
      ...chatHistory,
      { role: "user", content: message },
    ];

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return new Response(JSON.stringify({ error: "AI error: " + errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const reply = aiResult.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Save messages — need a visit_id for chat_messages
    if (visit_id) {
      await supabase.from("chat_messages").insert([
        { user_id, visit_id, role: "user", content: message },
        { user_id, visit_id, role: "assistant", content: reply },
      ]);
    }

    return new Response(JSON.stringify({ success: true, response: reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error: " + (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
