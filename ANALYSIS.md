# AfterVisit — Deep Product Analysis

## 1. What AfterVisit Is

AfterVisit is an Australian, patient-side health companion app that records a GP or specialist consultation, transcribes it with a medical-grade speech engine, and uses AI to turn that transcript into a structured, plain-English summary the patient can actually use afterwards.

The tagline captures it: *"Never leave a doctor's visit confused again."*

It operates on a **clinic-led B2B2C** distribution model:

- GP clinics offer the app to patients at intake (waiting-room QR code, new-patient packs).
- Patient signs digital consent in the app before any recording.
- Clinic gets a branded experience and a simple admin portal.
- Patient pays the subscription ($0 free / $9.99 Plus / $19.99 Family per month).

The product is deliberately **Australian-first**: en-AU transcription, PBS medication awareness, Medicare and bulk-billing references, healthdirect and NPS MedicineWise integrations, Australian Privacy Act compliance, and Surveillance Devices Act consent enforcement baked into the recording flow.

---

## 2. How It Aims to Change the GP Business

The GP consultation today is a lossy event. The doctor speaks fast, the patient is anxious, the clinical summary stays inside the practice software (Best Practice / Medical Director), and the patient walks out with a script, a vague memory, and a referral letter. Most patients retain less than half of what was said.

AfterVisit attacks this from four angles:

### 2.1 Shifts the summary from clinic-side to patient-side

Tools like Heidi Health, Lyrebird, and Heuristic record the consult for the **GP's** benefit — faster notes, better compliance. AfterVisit records for the **patient's** benefit. The artefact lives in the patient's pocket, not the clinic's PMS.

### 2.2 Makes the GP "stickier" without costing the clinic anything

Clinics that hand out the app become the clinic-of-record in the patient's profile. Future visits auto-populate the clinic name, consent wording is clinic-branded, and the patient's action items reference the clinic's doctors by name. The app becomes a lightweight CRM the clinic didn't have to build — patient recall is now anchored to the clinic, not just the doctor.

### 2.3 Reduces non-clinical admin load

A large share of in-consult time is spent re-explaining last visit's plan, re-explaining medication names and dosages, and fielding "what did the doctor say again?" phone calls to reception. If the patient has a structured, searchable record of every prior visit, the friction of continuity care drops — reception gets fewer follow-up calls, the GP spends less of the next consult re-briefing the patient.

### 2.4 Gives the clinic admin a light-touch dashboard without giving them clinical data

The GP portal is privacy-by-design: it shows metadata (patient initial, visit date, doctor, duration, type) but **never** the transcript or summary. This sidesteps the data-governance headache that would kill clinic adoption. The clinic sees utilisation ("47 patients this month, 8 today") and gets QR codes + consent customisation — that's it.

### 2.5 Economic model

The clinic doesn't pay. The patient pays $9.99–$19.99/mo direct. That removes procurement friction — no clinic IT approval, no PMS integration project. A clinic can onboard in the time it takes to print a QR code.

**The strategic bet:** if patients genuinely feel more in control after a visit, they return more often, follow the plan more faithfully, and attribute the good experience to the clinic — which turns AfterVisit from "another app" into a **retention + trust layer** sitting on top of every consult.

---

## 3. Patient-Side Features (Every Feature, In Detail)

### 3.1 Landing Page — [src/pages/LandingPage.tsx](src/pages/LandingPage.tsx)

Marketing surface for unauthenticated visitors. Sections:

- **Hero:** Value prop ("Never leave a doctor's visit confused again") + dual CTA — "Try Live Demo" (enables demo mode, sends to dashboard) and "Get Early Access" (signup).
- **Three-step explainer:** Record → Understand → Track.
- **How It Works:** Visual process diagram showing recording → transcription → summary → action items.
- **Testimonials:** Three Australian patients with suburbs and star ratings (localised, not generic US testimonials).
- **Social proof strip:** Data in Australia, Privacy Act compliant, PBS-aware, TGA-compliant.
- **Pricing:** Free ($0, 3 visits/month, basic summary), Plus ($9.99/mo, unlimited visits, AI chat, medication tracking), Family ($19.99/mo, up to 5 members, shared emergency contacts).
- **FAQ accordion:** Five questions covering consent law, data safety, telehealth compatibility, language support, subscription cancellation.
- **Footer:** Privacy disclaimer, contact, social links.

### 3.2 Authentication — [src/pages/SignupPage.tsx](src/pages/SignupPage.tsx), [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)

- Email + password (6-char minimum) via Supabase Auth.
- Toast-based validation errors.
- Post-signup → onboarding wizard. Post-login → dashboard.
- If the signup came from a clinic QR code (`/join/{clinicSlug}`), `clinic_id` is attached to the profile.

### 3.3 Onboarding Wizard — [src/pages/OnboardingPage.tsx](src/pages/OnboardingPage.tsx)

Three-step wizard run once after signup:

**Step 1 — About you:** First name, state/territory (NSW/VIC/QLD/SA/WA/TAS/NT/ACT), age range (18-25 through 65+).

**Step 2 — Health basics:** "Do you have a regular GP?" checkbox, ongoing conditions (freeform textarea), current medications (freeform textarea). All optional but strongly encouraged — this context is fed to the summarisation model so Australian-specific and patient-specific advice is tailored.

**Step 3 — How it works:** Visual walkthrough + medical disclaimer checkbox (*required* — "AfterVisit is not a substitute for medical advice"). Completing this sets `onboarding_complete: true` on the profile.

### 3.4 Dashboard — [src/pages/DashboardPage.tsx](src/pages/DashboardPage.tsx)

The patient's home after login. Layout:

- **Personalised greeting** with first name.
- **Primary CTA:** Large "Record New Visit" button with pulsing animation — the most important action in the app.
- **Four stat cards:** Total visits, pending actions, upcoming follow-ups, active medications.
- **Recent visits (last 3):** Doctor, clinic, date, quick summary (line-clamped), visit type badge, bulk-billed/gap indicator.
- **Upcoming actions:** Pending action items with due dates, colour-coded (red = overdue, amber = due today, primary = future).
- **Four helpful-link cards:** Find a GP (healthdirect), Check your medication (NPS MedicineWise), 24/7 Health Advice (healthdirect `tel:1800022222`), My Health Record (myhealthrecord.gov.au).

Empty state routes a first-time user back to the "record new visit" flow.

### 3.5 Record a Visit — [src/pages/NewVisitPage.tsx](src/pages/NewVisitPage.tsx) — **CORE FEATURE**

Four sequential steps with explicit consent gating.

**Step 1 — Visit details:**
- Doctor's name, clinic/practice name, visit type (GP / Specialist / Allied Health / Telehealth / Emergency), date (calendar picker).
- **Consent block (amber warning panel):** Two mandatory checkboxes.
  - Box 1: Confirmation that the doctor has been informed recording is happening.
  - Box 2: Understanding that audio is processed on Australian servers and deleted after transcription.
- If the patient is linked to a clinic (`clinic_id`), the clinic's custom `consent_form_text` overrides the default wording.
- "Start Recording" stays disabled until both boxes are checked. This is a legal requirement under SA and WA Surveillance Devices Acts — non-negotiable.
- Progress bar across the top.

**Step 2 — Record:**
- Large circular mic button (red while recording, primary when idle), minimum 44px tap target.
- Live duration timer (`mm:ss`).
- **Live audio visualiser:** 25-bar frequency graph via Web Audio API `AnalyserNode`, animated in brand teal.
- Pause / Resume / Stop controls.
- **Low-amplitude warning:** If average amplitude stays low for 10+ seconds, a toast warns "Move closer to the speaker for better transcription quality".
- Audio is captured as `audio/webm;codecs=opus` via `MediaRecorder`.

**Step 3 — Processing:** A four-step status tracker:
1. Uploading recording to `visit-recordings/{user_id}/{timestamp}.webm` on Supabase Storage.
2. Transcribing (Deepgram edge function).
3. Generating summary (Gemini edge function).
4. Done → redirect.

If any step fails, the UI shows the specific error, a **"Retry"** button that re-invokes the failed step without re-uploading, and a "View Visit Anyway" escape hatch. The recording file is **never** deleted on error — the patient's audio is sacred.

**Step 4 — Summary:** Redirect to `/visit/{id}`.

### 3.6 Visits List — [src/pages/VisitsPage.tsx](src/pages/VisitsPage.tsx)

Scrollable history of every consult, most recent first. Each card: doctor, clinic, date, quick summary (two-line clamp), type badge, bulk-billing/gap indicator, status badge. Loading skeletons while fetching. Empty state directs to the recording flow.

### 3.7 Visit Detail — [src/pages/VisitDetailPage.tsx](src/pages/VisitDetailPage.tsx) — **FLAGSHIP FEATURE**

Where the AI-generated value actually lives. Rendered in a specific order because each section answers a different patient question.

**Top bar:**
- Back button + urgency-flags alert (red banner, only if `urgency_flags.length > 0`).
- **Quick summary hero:** 1–2 sentence overview in a card with a teal left-border accent. Shows doctor, clinic, date, visit type, and cost (bulk-billed/gap).

**Collapsible body sections (in order):**

1. **Chief complaint** — why the patient came in, one line.
2. **Key discussion points** — bulleted list. Medical terms render with a dashed underline; hover shows the plain-English explanation from `medical_terms`.
3. **Assessment** — the doctor's findings in plain English ("Your HbA1c has moved from 7.8 to 8.1% — slightly worse").
4. **Plan** — numbered list of what was decided.
5. **Doctor's recommendations** — numbered cards (1–7 typical), each with a circular badge.
6. **Medications prescribed** — cards with name, dosage, frequency, **PBS badge** (green if subsidised), plain-English explanation ("This lowers cholesterol by blocking an enzyme in the liver"), and outbound links to the PBS listing and NPS MedicineWise page.
7. **Referrals** — cards showing "To:", "Reason:", and a "Next steps:" highlighted box ("Book within 2 weeks — your GP will fax the referral").
8. **Next actions** — interactive checklist. Each row: checkbox (toggles `action_items.status` in real time), description (strike-through when complete), category pill (medication / test / follow_up / lifestyle / referral), due date (colour-coded overdue/due today/future).
9. **Suggested follow-up questions** — clickable pill buttons. Clicking one pre-populates the AI chat input ("What should I watch for if my blood pressure stays high?").
10. **Medical terms glossary** — collapsed accordion with every term the summary flagged.
11. **Full transcript** — collapsed pre-wrapped block, speaker-diarised by Deepgram.

**"Ask a question" AI chat panel** (embedded on the visit detail page):
- Scoped system prompt: this visit's transcript + summary + patient profile only.
- Chat history persisted to `chat_messages` table, keyed to visit_id.
- **Rate limiting:** Free tier 10 messages/hour; Plus unlimited.
- Mandatory disclaimer on every response: *"This is based on your recorded visit only and is not medical advice. Always follow your doctor's instructions."*

**Context-aware "Trusted Australian Resources" card** via [src/components/TrustedResourcesCard.tsx](src/components/TrustedResourcesCard.tsx):
- Auto-detects condition keywords in the summary (diabetes, hypertension, cholesterol, OA, mental health, etc.).
- Surfaces matching Australian resources (Diabetes Australia + NDSS, Heart Foundation, Arthritis Australia, Beyond Blue, etc.).
- Plus a permanent section with PBS listing lookup, NPS MedicineWise, TGA Consumer Medicine Info, My Health Record, and an Emergency Contacts quick-dial strip.

### 3.8 Action Items — [src/pages/ActionsPage.tsx](src/pages/ActionsPage.tsx)

Central to-do list across every visit.

- Freeform input to add a custom action (not demo mode).
- Filter chips: All / Pending / Complete / Overdue.
- **Grouped by prescribing doctor** — all Dr Zhao's actions together, all Dr Nguyen's actions together. This matters because patients mentally group tasks by practitioner, not by date.
- Each row: checkbox, description, category pill, due-date chip.
- Demo mode disables writes and shows a toast.

### 3.9 Medications — [src/pages/MedicationsPage.tsx](src/pages/MedicationsPage.tsx)

Complete medication inventory.

- "Add Medication" dialog: name, dosage, frequency, prescribing doctor, plain-English "what it does" field, PBS checkbox.
- Disclaimer nudges verification with the pharmacist.
- Each card: name + dosage + frequency, PBS badge (green) or Non-PBS badge, active/discontinued status, plain-English explanation, and outbound links to the **PBS listing**, **NPS MedicineWise**, and the current **PBS co-payment table** ("~$31.60 general, $7.70 concession").
- Empty state with pill icon.

### 3.10 Lab Results — [src/pages/LabResultsPage.tsx](src/pages/LabResultsPage.tsx)

Currently demo-only (no pathology integration yet), but the UI shape is built.

- Date of test banner.
- Each result card: name, status badge (normal/high/low), normal range, **mini sparkline** (SVG trend line over previous values), trend arrow icon, current value in large tabular numerals.
- Click to expand: plain-English explanation, previous values as date/value pills, "Ask AI about this result" button.

### 3.11 Settings — [src/pages/SettingsPage.tsx](src/pages/SettingsPage.tsx)

- **Demo Mode toggle** (accent-coloured box, shareable via `?demo=true`).
- Profile fields: first name, state/territory, age range.
- Health basics: ongoing conditions, current medications (fed to the summary model for context).
- Subscription tier indicator.
- Developer utilities: "Seed Database" (load demo data into the real DB for screenshotting) and "Clear All Data" (destructive, confirms loudly).
- Save button commits to `profiles`.

### 3.12 Emergency Contacts Modal — [src/components/EmergencyContactsModal.tsx](src/components/EmergencyContactsModal.tsx)

Always reachable from the sidebar. Lists Australian numbers as clickable `tel:` links:
- **000** (Ambulance / Fire / Police)
- **1800 022 222** (healthdirect, 24/7 nurse)
- **1300 60 60 24** (Nurse-on-Call Victoria)
- **13 11 26** (Poisons Information)
- **13 11 14** (Lifeline)
- **1800 177 055** (Diabetes Australia)

### 3.13 AI Chat Sidebar — [src/components/AIChatSidebar.tsx](src/components/AIChatSidebar.tsx)

A persistent AI assistant that lives alongside the patient app.

- **Desktop:** Collapsible right sidebar overlaying the main content.
- **Mobile:** Full-screen modal.
- Context is route-aware: asks different opening questions depending on where the patient is (dashboard, visit detail, medications, etc.).
- Suggested prompts on empty: *"What should I ask my doctor next time?"*, *"Explain my medications in simple terms"*, *"What are my upcoming action items?"*.
- Typing indicator (three-dot bounce), user messages in primary/10 bubble, assistant messages in muted bubble.
- Disclaimer footer.

---

## 4. GP-Side Features (Every Feature, In Detail)

The GP portal is intentionally narrow. It exists to help clinics **distribute** and **customise** AfterVisit — not to give clinic staff access to patient clinical data.

### 4.1 GP Login — [src/pages/gp/GpLoginPage.tsx](src/pages/gp/GpLoginPage.tsx)

- Separate login URL (`/gp/login`) from patient auth.
- Email + password via Supabase Auth.
- **Email allowlist** check via [src/lib/admins.ts](src/lib/admins.ts) — currently `GP_ADMIN_EMAILS` is a hardcoded list pending proper clinic RBAC.
- Non-allowlisted emails are rejected with *"This email is not authorised for the GP portal"*.
- "View Demo" button enables demo mode for the sales-demo path.

### 4.2 GP Dashboard — [src/pages/gp/GpDashboardPage.tsx](src/pages/gp/GpDashboardPage.tsx)

Clinic-level overview. No patient clinical data.

- **Header:** Clinic name + "GP Portal Dashboard".
- **Three stat cards:**
  - Patients this month
  - Consults recorded today
  - Total active patients
- **Recent activity feed:** *"K. recorded a consult with Dr Zhao — 2 hrs ago"* — always first-initial only, never full name. Shows clinic staff that the system is in use without exposing who.
- **Quick actions:** "View QR Code", "Download QR Code".

### 4.3 GP Patients — [src/pages/gp/GpPatientsPage.tsx](src/pages/gp/GpPatientsPage.tsx)

Metadata-only patient browser.

- **Privacy disclaimer at top:** *"Metadata only — GPs do not have access to summaries, transcripts, or health data"*.
- Search filter by doctor name.
- **Desktop table:** Patient (initial in avatar), last visit date, doctor, duration, visit-type badge.
- **Mobile cards:** Same data reformatted.
- This is the hard privacy line. A clinic can see "this many people came in and recorded" — they cannot see *what* was recorded. This is the single feature that makes clinic adoption viable without a long legal review.

### 4.4 Consent Settings — [src/pages/gp/GpConsentSettingsPage.tsx](src/pages/gp/GpConsentSettingsPage.tsx)

Clinic-branded consent customisation.

- **Consent wording textarea:** Edit the exact sentence the patient sees ("I confirm that Dr {doctorName} at {clinicName} has been informed…"). Clinic can match their existing consent paperwork.
- **GP acknowledgement toggle:** "Require explicit GP acknowledgement per recording" — when on, the patient must confirm the doctor personally agreed before each recording, not just at clinic sign-up.
- **Live preview pane:** Renders the exact consent UI the patient will see in the `NewVisitPage` flow. No guessing — the clinic sees the real thing.
- Save button (currently simulated in demo, wired to `clinics.consent_form_text` in production).

### 4.5 Clinic QR Code — [src/pages/gp/GpQrCodePage.tsx](src/pages/gp/GpQrCodePage.tsx)

The patient-acquisition mechanism.

- QR code rendered as SVG, pointing at `aftervisit.app/join/{clinicSlug}`.
- Co-branded with clinic name.
- "Download QR Code" (PNG for printing on reception signage, appointment cards, welcome packs).
- "Print" action.
- **How to use** instructions: waiting-room display, appointment reminder emails, new-patient packs.
- Any patient scanning this signs up with `clinic_id` already attached — future visits auto-populate the clinic name.

### 4.6 GP Layout & Navigation — [src/components/GpLayout.tsx](src/components/GpLayout.tsx), [src/components/GpProtectedRoute.tsx](src/components/GpProtectedRoute.tsx)

- Dedicated `GpSidebar` with four items: Dashboard, Patients, Consent Settings, QR Code. No access to any patient clinical page.
- `GpProtectedRoute` checks authentication *and* email allowlist before rendering any GP route; redirects unauthorised users to `/gp/login`.
- Demo mode bypasses the allowlist check for sales demos.

---

## 5. The Backend Pipeline (What Powers the Magic)

### 5.1 Transcribe Edge Function — [supabase/functions/transcribe/index.ts](supabase/functions/transcribe/index.ts)

1. Accepts `{ visit_id, recording_url }`.
2. Downloads the audio from `visit-recordings`.
3. Sends to **Deepgram `nova-2-medical`** with `language=en-AU`, `smart_format=true`, `punctuate=true`, `diarize=true` (speaker separation).
4. Rejects transcripts shorter than 20 characters (indicates a bad recording — triggers the retry UI).
5. Updates `visits.transcript` and `visits.status = 'transcribed'`.
6. Never logs transcript content (Privacy Act).

### 5.2 Summarise Edge Function — [supabase/functions/summarise/index.ts](supabase/functions/summarise/index.ts)

1. Fetches the visit + patient profile (state, conditions, medications — so advice is personalised).
2. Builds a system prompt enforcing:
   - Australian English spelling
   - Never provide medical advice
   - Explain every medical term in plain English
   - Reference PBS and Medicare where relevant
   - Flag urgent items into `urgency_flags`
3. Calls **Gemini 2.5 Flash** via the Lovable AI Gateway at `temperature: 0.3` for deterministic structure.
4. Parses structured JSON into the [Summary Shape](CLAUDE.md) — quick_summary, chief_complaint, key_discussion_points, assessment, plan, doctors_recommendations, action_items, medications, referrals, follow_up_questions, medical_terms, urgency_flags.
5. Writes `summary` JSON + `status: 'complete'` to visits, then inserts derived `action_items` and `medications` rows.
6. Fails fast if the JSON parse is invalid (front-end shows retry).

### 5.3 Chat Edge Function — `supabase/functions/chat/index.ts`

1. Rate-limits free-tier users (10 msgs/hour) by counting recent `chat_messages` entries.
2. Builds context depending on scope: visit-specific, full-patient, or general profile.
3. Pulls the last 10 turns from `chat_messages` for continuity.
4. Calls Gemini 2.5 Flash with the same Australian-healthcare system prompt.
5. Persists both the user turn and the assistant turn.
6. Always appends the mandatory non-medical-advice disclaimer.

---

## 6. Cross-Cutting Design Choices

- **Demo mode everywhere.** `useDemoMode()` short-circuits every data fetch to use [src/data/demoPatient.ts](src/data/demoPatient.ts) (Karen Mitchell, 58, VIC, diabetic). This is how sales demos work — no account, no real data, full fidelity UI.
- **Australian English only.** Colour, organisation, practitioner — never color, organization, practitioner. Enforced by code review rules in [CLAUDE.md](CLAUDE.md).
- **Mobile-first.** 44px tap targets, thumb-zone layout, tested at 390px viewport. Most recordings will happen on a phone in a car park after the appointment.
- **Consent is a hard gate, not a nice-to-have.** The "Start Recording" button is physically disabled until both consent checkboxes are ticked — the law requires it in SA and WA, and AfterVisit enforces it everywhere.
- **No medical advice, ever.** Every AI output — summary, chat, even tooltip explanations — carries the disclaimer and is tuned at low temperature to avoid hallucination.
- **Privacy by path.** Audio paths are user-scoped (`{userId}/filename`); blobs are not returned to the client after upload; transcripts are never logged.

---

## 7. The Change AfterVisit Is Betting On

A GP visit today produces two artefacts: clinical notes (for the doctor's liability) and a script/referral (for the pharmacy/specialist). Neither is patient-readable.

AfterVisit introduces a **third artefact** — a patient-readable, searchable, AI-explained record of what actually happened — and positions the clinic as the distributor rather than the data custodian. Clinics don't have to store anything, integrate anything, or train staff on anything beyond "here's our QR code". Patients get a tool that finally closes the loop between consult and behaviour.

If it works, the GP consultation stops being a 15-minute event the patient mostly forgets, and starts being the beginning of a structured plan the patient can actually follow. The clinic becomes the source of that plan — which is the strongest retention moat a general practice can have.
