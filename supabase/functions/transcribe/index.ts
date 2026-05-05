import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { visit_id, recording_url } = await req.json();
    if (!visit_id || !recording_url) {
      return new Response(JSON.stringify({ error: "visit_id and recording_url are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const deepgramKey = Deno.env.get("DEEPGRAM_API_KEY");

    if (!deepgramKey) {
      return new Response(JSON.stringify({ error: "DEEPGRAM_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Download audio from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("visit-recordings")
      .download(recording_url);

    if (downloadError || !fileData) {
      await supabase.from("visits").update({ status: "error" }).eq("id", visit_id);
      return new Response(JSON.stringify({ error: "Failed to download recording: " + downloadError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await fileData.arrayBuffer();

    // Send to Deepgram
    const dgResponse = await fetch("https://api.deepgram.com/v1/listen?language=en-AU&smart_format=true&punctuate=true&diarize=true&model=nova-3-medical", {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramKey}`,
        "Content-Type": "audio/webm",
      },
      body: audioBuffer,
    });

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      await supabase.from("visits").update({ status: "error" }).eq("id", visit_id);
      return new Response(JSON.stringify({ error: "Deepgram error: " + errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dgResult = await dgResponse.json();
    const transcript = dgResult.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    if (transcript.length < 20) {
      await supabase.from("visits").update({ status: "error" }).eq("id", visit_id);
      return new Response(JSON.stringify({ error: "Recording too short or unclear. Please try again." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update visit with transcript
    await supabase.from("visits").update({
      transcript,
      status: "transcribed",
    }).eq("id", visit_id);

    return new Response(JSON.stringify({ success: true, transcript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error: " + (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
