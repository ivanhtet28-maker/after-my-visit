// Clarity Health GP Chrome Extension — popup.js
//
// Authenticated GP flow:
//   1. On open, check for stored session via background.js
//   2. If no session → show login screen
//   3. If session → fetch care-team patients, show main UI
//   4. GP picks patient, pastes notes → paste-visit edge function

const SUPABASE_URL = "https://pumdlueqoiyihpkpdjcd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bWRsdWVxb2l5aWhwa3BkamNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjcyMTUsImV4cCI6MjA5NDMwMzIxNX0.whuVBAg5YZU9Pv5k_T_dcw9_MU9O3wEuJrwyvkeC6mA";
const DASHBOARD_ORIGIN = "https://clarityhealth.au";

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);

// Screens
const authScreen = $("auth-screen");
const mainScreen = $("main-screen");
const loadingScreen = $("loading-screen");

// Auth elements
const authEmail = $("auth-email");
const authPassword = $("auth-password");
const authBtn = $("auth-btn");
const authStatus = $("auth-status");

// Main elements
const gpNameEl = $("gp-name");
const logoutBtn = $("logout-btn");
const patientInput = $("patient-input");
const patientList = $("patient-list");
const noPatientsHint = $("no-patients-hint");
const visitTypeSelect = $("visit-type");
const noteInput = $("note-input");
const charCount = $("char-count");
const sendBtn = $("send-btn");
const statusEl = $("status");

// State
let currentSession = null;
let careTeamPatients = [];
let selectedPatient = null;
let highlightedIdx = -1;

// ---------- Screen switching ----------
function showScreen(name) {
  authScreen.hidden = name !== "auth";
  mainScreen.hidden = name !== "main";
  loadingScreen.hidden = name !== "loading";
}

// ---------- Init ----------
async function init() {
  showScreen("loading");

  const resp = await chrome.runtime.sendMessage({ type: "GET_SESSION" });
  if (resp?.ok && resp.session) {
    currentSession = resp.session;
    await enterMainScreen();
  } else {
    showScreen("auth");
    authEmail.focus();
  }
}

// ---------- Auth ----------
authBtn.addEventListener("click", handleSignIn);
authEmail.addEventListener("keydown", (e) => {
  if (e.key === "Enter") authPassword.focus();
});
authPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSignIn();
});

async function handleSignIn() {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || !password) {
    showAuthStatus("err", "Enter your email and password.");
    return;
  }

  authBtn.disabled = true;
  authBtn.textContent = "Signing in…";
  hideAuthStatus();

  const resp = await chrome.runtime.sendMessage({
    type: "SIGN_IN",
    email,
    password,
  });

  authBtn.disabled = false;
  authBtn.textContent = "Sign in";

  if (!resp?.ok) {
    showAuthStatus("err", resp?.error || "Sign-in failed.");
    return;
  }

  currentSession = resp.session;
  await enterMainScreen();
}

function showAuthStatus(tone, text) {
  authStatus.className = `status ${tone}`;
  authStatus.textContent = text;
  authStatus.hidden = false;
}
function hideAuthStatus() {
  authStatus.hidden = true;
}

// ---------- Main screen ----------
async function enterMainScreen() {
  gpNameEl.textContent = currentSession.practitioner.full_name;
  showScreen("main");

  // Load care-team patients
  await loadPatients();
  patientInput.focus();
}

async function loadPatients() {
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/extension-patients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({}),
      },
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      if (resp.status === 401) {
        // Session expired — sign out
        await chrome.runtime.sendMessage({ type: "SIGN_OUT" });
        showScreen("auth");
        showAuthStatus("info", "Session expired. Please sign in again.");
        return;
      }
      console.error("Failed to load patients:", err);
      careTeamPatients = [];
    } else {
      const data = await resp.json();
      careTeamPatients = data.patients || [];
    }
  } catch (err) {
    console.error("Load patients error:", err);
    careTeamPatients = [];
  }

  noPatientsHint.hidden = careTeamPatients.length > 0;
  sendBtn.disabled = false;
}

// ---------- Patient combobox ----------
function filterPatients(q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return careTeamPatients;
  return careTeamPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      (p.email && p.email.toLowerCase().includes(needle)),
  );
}

function renderPatientList(items) {
  patientList.innerHTML = "";
  highlightedIdx = -1;

  if (careTeamPatients.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No patients on your care team yet.";
    patientList.appendChild(li);
    patientList.hidden = false;
    patientInput.setAttribute("aria-expanded", "true");
    return;
  }

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No patients match your search.";
    patientList.appendChild(li);
    patientList.hidden = false;
    patientInput.setAttribute("aria-expanded", "true");
    return;
  }

  items.forEach((p, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.dataset.idx = String(i);
    li.innerHTML = `<span class="name">${escapeHtml(p.name)}</span>
                    <span class="sub">Joined ${escapeHtml(formatDate(p.granted_at))}</span>`;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      pick(p);
    });
    patientList.appendChild(li);
  });
  patientList.hidden = false;
  patientInput.setAttribute("aria-expanded", "true");
}

function pick(p) {
  selectedPatient = p;
  patientInput.value = p.name;
  patientList.hidden = true;
  patientInput.setAttribute("aria-expanded", "false");
}

patientInput.addEventListener("focus", () => {
  renderPatientList(filterPatients(patientInput.value));
});
patientInput.addEventListener("input", () => {
  selectedPatient = null;
  renderPatientList(filterPatients(patientInput.value));
});
patientInput.addEventListener("blur", () => {
  setTimeout(() => {
    patientList.hidden = true;
  }, 120);
});
patientInput.addEventListener("keydown", (e) => {
  const items = Array.from(patientList.querySelectorAll('li[role="option"]'));
  if (e.key === "ArrowDown") {
    e.preventDefault();
    highlightedIdx = Math.min(items.length - 1, highlightedIdx + 1);
    items.forEach((el, i) =>
      el.setAttribute("aria-selected", i === highlightedIdx ? "true" : "false"),
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlightedIdx = Math.max(0, highlightedIdx - 1);
    items.forEach((el, i) =>
      el.setAttribute("aria-selected", i === highlightedIdx ? "true" : "false"),
    );
  } else if (e.key === "Enter") {
    if (highlightedIdx >= 0 && items[highlightedIdx]) {
      e.preventDefault();
      const idx = Number(items[highlightedIdx].dataset.idx);
      pick(filterPatients(patientInput.value)[idx]);
    }
  } else if (e.key === "Escape") {
    patientList.hidden = true;
  }
});

// ---------- Note textarea ----------
noteInput.addEventListener("input", () => {
  const n = noteInput.value.length;
  charCount.textContent = `${n} char${n === 1 ? "" : "s"}`;
});
noteInput.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// ---------- Submit ----------
sendBtn.addEventListener("click", async () => {
  hideStatus();

  if (!selectedPatient) {
    showStatus("err", "Pick a patient from the dropdown first.");
    patientInput.focus();
    return;
  }
  const raw = noteInput.value.trim();
  if (raw.length < 30) {
    showStatus("err", "Notes must be at least 30 characters.");
    noteInput.focus();
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Summarising + saving…";

  try {
    const url = `${SUPABASE_URL}/functions/v1/paste-visit`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${currentSession.access_token}`,
      },
      body: JSON.stringify({
        patient_user_id: selectedPatient.user_id,
        patient_name: selectedPatient.name,
        raw_text: raw,
        doctor_name: currentSession.practitioner.full_name,
        visit_type: visitTypeSelect.value,
        dashboard_origin: DASHBOARD_ORIGIN,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.ok !== true) {
      throw new Error(data.error || `HTTP ${resp.status}`);
    }

    showStatus(
      "ok",
      `Sent to ${escapeHtml(data.patient.first_name || selectedPatient.name)}'s dashboard. ` +
        `<a href="${DASHBOARD_ORIGIN}/visit/${data.visit_id}" target="_blank" rel="noopener">Open visit →</a>`,
      true,
    );
    noteInput.value = "";
    charCount.textContent = "0 chars";
    selectedPatient = null;
    patientInput.value = "";
  } catch (err) {
    if (err.message && err.message.includes("401")) {
      showStatus("err", "Session expired. Please sign out and sign in again.");
    } else {
      showStatus("err", `Send failed: ${err.message || err}`);
    }
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send to patient dashboard";
  }
});

// ---------- Email invite ----------
const emailInviteToggle = $("email-invite-toggle");
const emailInviteSection = $("email-invite-section");
const inviteEmailInput = $("invite-email");
const inviteNameInput = $("invite-name");
const inviteSendBtn = $("invite-send-btn");
const inviteStatusEl = $("invite-status");

emailInviteToggle.addEventListener("click", () => {
  const wasHidden = emailInviteSection.hidden;
  emailInviteSection.hidden = !wasHidden;
  emailInviteToggle.textContent = wasHidden
    ? "Hide email invite ↑"
    : "Patient not signed up? Send email invite ↓";
  if (wasHidden) inviteEmailInput.focus();
});

inviteSendBtn.addEventListener("click", async () => {
  const email = inviteEmailInput.value.trim();
  const name = inviteNameInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showInviteStatus("err", "Enter a valid email address.");
    inviteEmailInput.focus();
    return;
  }

  inviteSendBtn.disabled = true;
  inviteSendBtn.textContent = "Sending…";
  hideInviteStatus();

  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/invite-patient-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({
          patient_email: email,
          patient_name: name || undefined,
        }),
      },
    );

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || (!data.success && !data.already_on_care_team)) {
      throw new Error(data.error || `HTTP ${resp.status}`);
    }

    if (data.already_on_care_team) {
      showInviteStatus(
        "info",
        "This patient is already on your care team. Select them from the dropdown above.",
      );
    } else {
      showInviteStatus(
        "ok",
        `Invite sent to ${escapeHtml(email)}! They'll appear in your patient list once they sign up.`,
      );
      inviteEmailInput.value = "";
      inviteNameInput.value = "";
    }
  } catch (err) {
    showInviteStatus("err", `Failed: ${err.message || err}`);
  } finally {
    inviteSendBtn.disabled = false;
    inviteSendBtn.textContent = "Send invite email";
  }
});

function showInviteStatus(tone, text) {
  inviteStatusEl.className = `status ${tone}`;
  inviteStatusEl.textContent = text;
  inviteStatusEl.hidden = false;
}
function hideInviteStatus() {
  inviteStatusEl.hidden = true;
}

// ---------- Logout ----------
logoutBtn.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "SIGN_OUT" });
  currentSession = null;
  careTeamPatients = [];
  selectedPatient = null;
  patientInput.value = "";
  noteInput.value = "";
  charCount.textContent = "0 chars";
  showScreen("auth");
  authEmail.value = "";
  authPassword.value = "";
  authEmail.focus();
});

// ---------- Status helpers ----------
function showStatus(tone, html, allowHtml = false) {
  statusEl.className = `status ${tone}`;
  if (allowHtml) statusEl.innerHTML = html;
  else statusEl.textContent = html;
  statusEl.hidden = false;
}
function hideStatus() {
  statusEl.hidden = true;
  statusEl.textContent = "";
  statusEl.className = "status";
}

// ---------- Helpers ----------
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------- Start ----------
init();
