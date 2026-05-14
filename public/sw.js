/**
 * Clarity Health — Service Worker
 *
 * Handles:
 * 1. Push notification display
 * 2. Notification click actions (open visit, mark complete, snooze)
 * 3. Basic offline caching for the app shell
 */

const CACHE_NAME = "clarity-health-v1";
const APP_SHELL = ["/", "/index.html"];

// ── Install: cache app shell ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push: display notification ───────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "Clarity Health", body: event.data?.text() ?? "You have a reminder" };
  }

  const title = data.title || "Clarity Health";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/badge-72.png",
    tag: data.tag || "clarity-reminder",
    renotify: true,
    requireInteraction: true, // Stay visible until user interacts
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    data: data.data || {},
    actions: data.actions || [
      { action: "complete", title: "✅ Done" },
      { action: "snooze", title: "⏰ Snooze 1hr" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click: route to appropriate action ──────────────────
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  notification.close();

  if (action === "complete") {
    // Mark the action item / medication as complete via API
    event.waitUntil(markComplete(data));
    return;
  }

  if (action === "snooze") {
    // Snooze: re-show notification in 1 hour
    event.waitUntil(snoozeReminder(data));
    return;
  }

  // Default: open the visit page
  const url = data.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Try to focus an existing tab
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      return self.clients.openWindow(url);
    })
  );
});

// ── Mark reminder complete via Supabase ──────────────────────────────
async function markComplete(data) {
  if (!data.reminder_id) return;

  try {
    // Post message to any open client to handle the API call with auth
    const clients = await self.clients.matchAll({ type: "window" });
    for (const client of clients) {
      client.postMessage({
        type: "REMINDER_ACTION",
        action: "complete",
        reminder_id: data.reminder_id,
        source_type: data.source_type,
        source_id: data.source_id,
      });
    }
  } catch (err) {
    console.error("Failed to mark complete:", err);
  }
}

// ── Snooze: schedule notification to re-appear in 1 hour ─────────────
async function snoozeReminder(data) {
  // Show a confirmation
  await self.registration.showNotification("⏰ Snoozed", {
    body: "We'll remind you again in 1 hour.",
    icon: "/icons/icon-192.png",
    tag: "snooze-confirm",
    silent: true,
  });

  // Tell any open client to create a snooze
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({
      type: "REMINDER_ACTION",
      action: "snooze",
      reminder_id: data.reminder_id,
      snooze_minutes: 60,
    });
  }
}

// ── Fetch: network-first with cache fallback ─────────────────────────
self.addEventListener("fetch", (event) => {
  // Only cache GET requests for app shell
  if (event.request.method !== "GET") return;

  // Skip API calls and Supabase requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/rest/") || url.hostname.includes("supabase")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
