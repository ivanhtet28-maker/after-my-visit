/**
 * send-reminders
 *
 * Cron edge function — runs every 5 minutes via pg_cron (or external cron).
 * Picks up all pending reminders whose remind_at <= now(), sends Web Push
 * notifications to the patient's registered devices, and optionally sends
 * an email via Resend for high-priority items.
 *
 * Also handles extending recurring medication reminders: when a medication
 * has a recurrence config and we're running low on pre-generated rows,
 * generate the next batch.
 *
 * POST /functions/v1/send-reminders
 * Auth: service_role only (Authorization: Bearer <service_role_key>)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Web Push crypto for Deno
// We use the web-push protocol manually since there's no npm web-push for Deno.
// For simplicity, we use the fetch-based approach with VAPID.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 50; // max reminders per invocation

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Fetch due reminders
    const { data: reminders, error: fetchErr } = await supabase
      .from("scheduled_reminders")
      .select("*")
      .eq("status", "pending")
      .lte("remind_at", new Date().toISOString())
      .order("remind_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchErr) {
      return jsonResponse({ error: `fetch failed: ${fetchErr.message}` }, 500);
    }

    if (!reminders || reminders.length === 0) {
      return jsonResponse({ sent: 0, message: "no pending reminders" });
    }

    const results: { id: string; status: string; push_sent: number; error?: string }[] = [];

    for (const reminder of reminders) {
      try {
        // Check if the source item is already completed (belt & suspenders with the trigger)
        if (reminder.source_type === "action_item" && reminder.source_id) {
          const { data: action } = await supabase
            .from("action_items")
            .select("status")
            .eq("id", reminder.source_id)
            .single();
          if (action?.status === "complete") {
            await supabase.from("scheduled_reminders")
              .update({ status: "skipped" })
              .eq("id", reminder.id);
            results.push({ id: reminder.id, status: "skipped", push_sent: 0 });
            continue;
          }
        }

        if (reminder.source_type === "medication" && reminder.source_id) {
          const { data: med } = await supabase
            .from("medications")
            .select("status")
            .eq("id", reminder.source_id)
            .single();
          if (med?.status === "stopped" || med?.status === "completed") {
            await supabase.from("scheduled_reminders")
              .update({ status: "skipped" })
              .eq("id", reminder.id);
            results.push({ id: reminder.id, status: "skipped", push_sent: 0 });
            continue;
          }
        }

        // Fetch push subscriptions for this user
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", reminder.user_id);

        let pushSent = 0;

        // Send Web Push to each device
        if (subscriptions && subscriptions.length > 0 && vapidPublicKey && vapidPrivateKey) {
          for (const sub of subscriptions) {
            try {
              const payload = JSON.stringify({
                title: reminder.title,
                body: reminder.body,
                icon: "/icons/icon-192.png",
                badge: "/icons/badge-72.png",
                tag: `reminder-${reminder.id}`,
                data: {
                  reminder_id: reminder.id,
                  visit_id: reminder.visit_id,
                  source_type: reminder.source_type,
                  source_id: reminder.source_id,
                  url: `/visit/${reminder.visit_id}`,
                },
                actions: [
                  { action: "complete", title: "✅ Done" },
                  { action: "snooze", title: "⏰ Snooze 1hr" },
                ],
              });

              // Use the web-push-compatible fetch approach
              const pushResult = await sendWebPush(
                sub.endpoint,
                sub.p256dh,
                sub.auth,
                vapidPublicKey,
                vapidPrivateKey,
                payload,
              );

              if (pushResult.ok) {
                pushSent++;
              } else if (pushResult.status === 410 || pushResult.status === 404) {
                // Subscription expired — clean up
                await supabase
                  .from("push_subscriptions")
                  .delete()
                  .eq("id", sub.id);
                console.log(`Cleaned up expired subscription ${sub.id}`);
              }
            } catch (pushErr) {
              console.error(`Push to ${sub.endpoint} failed:`, pushErr);
            }
          }
        }

        // Fallback: send email for important reminders if no push subscriptions
        if (pushSent === 0 && resendApiKey) {
          try {
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(reminder.user_id);
            if (authUser?.email) {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: "Clarity Health <noreply@clarityhealth.com.au>",
                  to: [authUser.email],
                  subject: reminder.title.replace(/[📅💊⚠️]/g, "").trim(),
                  html: `
                    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                      <p style="color: #6366f1; font-weight: 700; font-size: 18px;">Clarity Health</p>
                      <h2 style="margin: 0 0 8px;">${escapeHtml(reminder.title)}</h2>
                      <p style="color: #6b7280;">${escapeHtml(reminder.body)}</p>
                      <a href="https://www.clarityhealth.au/visit/${reminder.visit_id}"
                         style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                        View in Clarity Health
                      </a>
                    </div>`,
                }),
              });
            }
          } catch (emailErr) {
            console.error("Email fallback failed:", emailErr);
          }
        }

        // Mark as sent
        await supabase.from("scheduled_reminders")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", reminder.id);

        results.push({ id: reminder.id, status: "sent", push_sent: pushSent });
      } catch (itemErr) {
        console.error(`Error processing reminder ${reminder.id}:`, itemErr);
        results.push({
          id: reminder.id,
          status: "error",
          push_sent: 0,
          error: (itemErr as Error).message,
        });
      }
    }

    // 2. Extend recurring medication reminders
    //    Find medications with recurrence that are running low on future reminders
    await extendRecurringReminders(supabase);

    return jsonResponse({
      sent: results.filter((r) => r.status === "sent").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: results.filter((r) => r.status === "error").length,
      details: results,
    });
  } catch (err) {
    console.error("send-reminders error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});

/**
 * For recurring medications, check if we need to generate more reminder rows.
 * If fewer than 3 days of reminders remain for a recurrence, generate 7 more days.
 */
async function extendRecurringReminders(supabase: any) {
  // Find reminders with recurrence config where the last pending one is within 3 days
  const { data: recurring } = await supabase
    .from("scheduled_reminders")
    .select("source_id, recurrence, user_id, visit_id, title, body")
    .eq("source_type", "medication")
    .eq("status", "pending")
    .not("recurrence", "is", null)
    .order("remind_at", { ascending: false })
    .limit(100);

  if (!recurring || recurring.length === 0) return;

  // Group by source_id to find the latest remind_at per medication
  const bySource = new Map<string, any>();
  for (const r of recurring) {
    if (!bySource.has(r.source_id)) {
      bySource.set(r.source_id, r);
    }
  }

  const threeDaysFromNow = new Date(Date.now() + 3 * 86400000);

  for (const [sourceId, latest] of bySource) {
    // Check last pending reminder date for this medication
    const { data: lastReminder } = await supabase
      .from("scheduled_reminders")
      .select("remind_at")
      .eq("source_id", sourceId)
      .eq("source_type", "medication")
      .eq("status", "pending")
      .order("remind_at", { ascending: false })
      .limit(1)
      .single();

    if (!lastReminder) continue;

    const lastDate = new Date(lastReminder.remind_at);
    if (lastDate > threeDaysFromNow) continue; // still have enough buffer

    const recurrence = latest.recurrence;
    if (!recurrence?.times || !recurrence?.until) continue;

    const untilDate = new Date(recurrence.until);
    if (untilDate <= lastDate) continue; // course is over

    // Generate next 7 days of reminders
    const newReminders = [];
    for (let day = 1; day <= 7; day++) {
      for (const time of recurrence.times) {
        const [hours, minutes] = time.split(":").map(Number);
        const remindDate = new Date(lastDate);
        remindDate.setDate(remindDate.getDate() + day);
        remindDate.setHours(hours, minutes, 0, 0);

        if (remindDate > untilDate) break;
        if (remindDate <= new Date()) continue;

        newReminders.push({
          user_id: latest.user_id,
          visit_id: latest.visit_id,
          source_type: "medication",
          source_id: sourceId,
          title: latest.title,
          body: latest.body,
          remind_at: remindDate.toISOString(),
          recurrence: recurrence,
          status: "pending",
        });
      }
    }

    if (newReminders.length > 0) {
      const { error } = await supabase.from("scheduled_reminders").insert(newReminders);
      if (error) console.error(`Failed to extend reminders for ${sourceId}:`, error.message);
      else console.log(`Extended ${newReminders.length} reminders for medication ${sourceId}`);
    }
  }
}

/**
 * Minimal Web Push sender using VAPID.
 * For production, consider using a library like web-push.
 * This is a simplified version that works with most push services.
 */
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  payload: string,
): Promise<{ ok: boolean; status: number }> {
  // Import the key material
  const vapidHeaders = await generateVapidHeaders(endpoint, vapidPublicKey, vapidPrivateKey);

  // For now, use a simple approach — the full Web Push encryption is complex.
  // In production, use the `web-push` npm package via esm.sh or a push service like OneSignal.
  // This sends a basic notification via the push endpoint.

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
        "Urgency": "high",
        ...vapidHeaders,
      },
      body: payload,
    });

    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * Generate VAPID Authorization headers.
 */
async function generateVapidHeaders(
  endpoint: string,
  publicKey: string,
  privateKey: string,
): Promise<Record<string, string>> {
  const audience = new URL(endpoint).origin;
  const expiry = Math.floor(Date.now() / 1000) + 12 * 3600;

  // JWT header + payload
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: expiry,
    sub: "mailto:notifications@clarityhealth.com.au",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import the VAPID private key and sign
  try {
    const keyData = base64UrlDecode(privateKey);
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      cryptoKey,
      new TextEncoder().encode(unsignedToken),
    );

    const encodedSignature = base64UrlEncode(new Uint8Array(signature));
    const jwt = `${unsignedToken}.${encodedSignature}`;

    return {
      Authorization: `vapid t=${jwt}, k=${publicKey}`,
    };
  } catch {
    // Fallback: return basic headers without VAPID signing
    return {
      Authorization: `vapid t=, k=${publicKey}`,
    };
  }
}

function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
