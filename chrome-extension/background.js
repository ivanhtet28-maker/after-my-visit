// Clarity Health Chrome Extension — Background service worker
//
// Manages GP auth session via chrome.storage.local. The popup reads
// the session on open and uses the access_token to call edge functions.

const SUPABASE_URL = "https://pumdlueqoiyihpkpdjcd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bWRsdWVxb2l5aWhwa3BkamNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjcyMTUsImV4cCI6MjA5NDMwMzIxNX0.whuVBAg5YZU9Pv5k_T_dcw9_MU9O3wEuJrwyvkeC6mA";

// Sign in with email/password via Supabase REST auth
async function signIn(email, password) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || `HTTP ${resp.status}`);
  }

  const data = await resp.json();

  // Verify the user has a practitioner row
  const practResp = await fetch(
    `${SUPABASE_URL}/rest/v1/practitioners?user_id=eq.${data.user.id}&select=id,full_name,profession`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${data.access_token}`,
      },
    },
  );

  const practitioners = await practResp.json();
  if (!Array.isArray(practitioners) || practitioners.length === 0) {
    throw new Error(
      "No practitioner account found. Complete GP onboarding at clarityhealth.au/gp/onboarding first.",
    );
  }

  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
    practitioner: practitioners[0],
  };

  await chrome.storage.local.set({ clarity_session: session });
  return session;
}

// Refresh the access token
async function refreshSession() {
  const stored = await chrome.storage.local.get("clarity_session");
  const session = stored.clarity_session;
  if (!session?.refresh_token) return null;

  try {
    const resp = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      },
    );

    if (!resp.ok) {
      // Refresh failed — clear session
      await chrome.storage.local.remove("clarity_session");
      return null;
    }

    const data = await resp.json();
    const updated = {
      ...session,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    await chrome.storage.local.set({ clarity_session: updated });
    return updated;
  } catch {
    return null;
  }
}

// Get a valid session (refresh if expired)
async function getSession() {
  const stored = await chrome.storage.local.get("clarity_session");
  let session = stored.clarity_session;
  if (!session) return null;

  // Refresh 60s before expiry
  if (session.expires_at - Date.now() < 60_000) {
    session = await refreshSession();
  }

  return session;
}

async function signOut() {
  await chrome.storage.local.remove("clarity_session");
}

// Message handler — popup communicates via chrome.runtime.sendMessage
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SIGN_IN") {
    signIn(msg.email, msg.password)
      .then((session) => sendResponse({ ok: true, session }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true; // async response
  }

  if (msg.type === "GET_SESSION") {
    getSession()
      .then((session) => sendResponse({ ok: true, session }))
      .catch(() => sendResponse({ ok: true, session: null }));
    return true;
  }

  if (msg.type === "SIGN_OUT") {
    signOut()
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: true }));
    return true;
  }
});
