// Clarity Health GP note sender.
//
// Pasted notes → paste-visit edge function → patient dashboard. Patient list is
// hardcoded (1 real "Jessica Mitchell" + 3 filler names) so the searchable
// dropdown looks realistic in a sales demo without needing a /patients API.

const SUPABASE_URL = "https://ttzjdzfvhjgckekvermr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0empkemZ2aGpnY2tla3Zlcm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjQ0OTEsImV4cCI6MjA5Mzk0MDQ5MX0.5OrAB2NT0N5-3lSNC4dEmhU1bkc-4Zl9s1WptYiWkD4";
const DASHBOARD_ORIGIN = "https://app.clarityhealth.au";
const DOCTOR_NAME = "Dr Helen Zhao";

// Demo patient list. Jessica is the only one that resolves on the server; the
// rest are visual filler so the dropdown feels real in a sales demo.
const DEMO_PATIENTS = [
  { name: "Jessica Mitchell",  dob: "1968-03-12", suburb: "Werribee",   primary: true  },
  { name: "Margaret Chen",     dob: "1955-08-22", suburb: "Point Cook", primary: false },
  { name: "David O'Brien",     dob: "1974-11-04", suburb: "Sunshine",   primary: false },
  { name: "Priya Anand",       dob: "1982-06-30", suburb: "Footscray",  primary: false },
];

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const patientInput = $("patient-input");
const patientList  = $("patient-list");
const noteInput    = $("note-input");
const charCount    = $("char-count");
const sendBtn      = $("send-btn");
const statusEl     = $("status");

let selectedPatient = null;
let highlightedIdx = -1;

// ---------- Patient combobox ----------
function filterPatients(q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return DEMO_PATIENTS;
  return DEMO_PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(needle) ||
    p.suburb.toLowerCase().includes(needle)
  );
}

function renderPatientList(items) {
  patientList.innerHTML = "";
  highlightedIdx = -1;
  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No patients match. Demo includes 4 names.";
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
                    <span class="sub">DOB ${escapeHtml(p.dob)} · ${escapeHtml(p.suburb)}</span>`;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault(); // keep input focus
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
  // Hide with a tick of delay so the mousedown handler on a list item can run.
  setTimeout(() => { patientList.hidden = true; }, 100);
});
patientInput.addEventListener("keydown", (e) => {
  const items = Array.from(patientList.querySelectorAll('li[role="option"]'));
  if (e.key === "ArrowDown") {
    e.preventDefault();
    highlightedIdx = Math.min(items.length - 1, highlightedIdx + 1);
    items.forEach((el, i) => el.setAttribute("aria-selected", i === highlightedIdx ? "true" : "false"));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlightedIdx = Math.max(0, highlightedIdx - 1);
    items.forEach((el, i) => el.setAttribute("aria-selected", i === highlightedIdx ? "true" : "false"));
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
  if (!selectedPatient.primary) {
    showStatus("info",
      `${selectedPatient.name} is a demo placeholder — only Jessica Mitchell is wired to a real Supabase profile. ` +
      `Pick Jessica to actually send.`);
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Summarising + saving…";

  try {
    const url = `${SUPABASE_URL}/functions/v1/paste-visit`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apikey": SUPABASE_KEY,
        "authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        patient_name: selectedPatient.name,
        raw_text: raw,
        doctor_name: DOCTOR_NAME,
        dashboard_origin: DASHBOARD_ORIGIN,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.ok !== true) {
      throw new Error(data.error || `HTTP ${resp.status}`);
    }

    showStatus("ok",
      `Sent to ${data.patient.first_name} ${data.patient.last_name}'s dashboard. ` +
      `<a href="${data.dashboard_url}" target="_blank" rel="noopener">Open visit →</a>`,
      true,
    );
    noteInput.value = "";
    charCount.textContent = "0 chars";
  } catch (err) {
    showStatus("err", `Send failed: ${err.message || err}`);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send to patient dashboard";
  }
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

// ---------- Misc ----------
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// On open, focus the patient field so the demoer can just start typing.
patientInput.focus();
