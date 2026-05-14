/**
 * usePushNotifications — React hook for Web Push notification management.
 *
 * Handles:
 * - Service worker registration
 * - Push subscription (subscribe/unsubscribe)
 * - Storing subscription in Supabase push_subscriptions table
 * - Listening for SW messages (complete, snooze actions)
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// This key comes from VAPID keypair — set as env var at build time
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

interface PushState {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  loading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "unsupported",
    subscribed: false,
    loading: true,
  });

  // Check support & current status on mount
  useEffect(() => {
    const check = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) {
        setState({ supported: false, permission: "unsupported", subscribed: false, loading: false });
        return;
      }

      const permission = Notification.permission;

      // Check if already subscribed
      let subscribed = false;
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        subscribed = !!subscription;
      } catch {
        // ignore
      }

      setState({ supported: true, permission, subscribed, loading: false });
    };

    check();
  }, []);

  // Register service worker on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  // Listen for messages from the service worker (complete, snooze actions)
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !user) return;

    const handler = async (event: MessageEvent) => {
      const { type, action, reminder_id, source_type, source_id, snooze_minutes } = event.data || {};
      if (type !== "REMINDER_ACTION") return;

      if (action === "complete") {
        // Mark the reminder as completed
        await supabase.from("scheduled_reminders").update({ status: "completed" }).eq("id", reminder_id);

        // Also mark the source item as complete
        if (source_type === "action_item" && source_id) {
          await supabase.from("action_items").update({
            status: "complete",
            completed_at: new Date().toISOString(),
          }).eq("id", source_id);
        }
      }

      if (action === "snooze" && reminder_id) {
        // Create a new reminder 1 hour from now
        const { data: original } = await supabase
          .from("scheduled_reminders")
          .select("*")
          .eq("id", reminder_id)
          .single();

        if (original) {
          const snoozeUntil = new Date(Date.now() + (snooze_minutes || 60) * 60000);
          await supabase.from("scheduled_reminders").insert({
            user_id: original.user_id,
            visit_id: original.visit_id,
            source_type: original.source_type,
            source_id: original.source_id,
            title: original.title,
            body: original.body,
            remind_at: snoozeUntil.toISOString(),
            recurrence: null,
            status: "pending",
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user || !VAPID_PUBLIC_KEY) return false;

    setState((s) => ({ ...s, loading: true }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((s) => ({ ...s, permission, loading: false }));
        return false;
      }

      // Get push subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = subscription.toJSON();

      // Store in Supabase
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
        user_agent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }, {
        onConflict: "user_id,endpoint",
      });

      if (error) {
        console.error("Failed to save push subscription:", error);
        setState((s) => ({ ...s, loading: false }));
        return false;
      }

      setState({ supported: true, permission: "granted", subscribed: true, loading: false });
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setState((s) => ({ ...s, loading: false }));
      return false;
    }
  }, [user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user) return;

    setState((s) => ({ ...s, loading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remove from Supabase
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", endpoint);
      }

      setState((s) => ({ ...s, subscribed: false, loading: false }));
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setState((s) => ({ ...s, loading: false }));
    }
  }, [user]);

  return { ...state, subscribe, unsubscribe };
}

// Helper: convert VAPID key from base64url to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}
