# ClarityHealth — CLAUDE.md
> Project brief for Claude Code. Read this entire file before touching any code.

## What we're building

ClarityHealth is an Australian **communication layer between GPs, patients, and allied health practitioners**. Patients leave the GP confused. Allied health practitioners chase context they never get. ClarityHealth bridges all three.

**The core loop:**
1. **GP records or pastes a transcript.** Either using our voice-to-transcript tool inside the GP app, or by pasting raw notes/transcript from their existing tool (Heidi, etc.) into our **Chrome extension**.
2. **AI summarises** the consult — plain English, action items, medications, referrals, term explanations.
3. **GP reviews and clicks Approve.** Nothing reaches the patient until the GP has signed off.
4. **Patient gets a notification** with the approved summary. They can ask follow-up questions through an embedded medical AI scoped to that visit.
5. **Allied health continuity.** When the patient sees a physio/psych/dietitian next, that practitioner opens the patient profile and our AI generates a full health-status summary (recent visits, conditions, meds). Eliminates "tell your story from scratch." The practitioner can also record their own consult, which joins the chain.

**Distribution model:** GP-clinic-led. Clinics adopt ClarityHealth → GPs use it on every consult → patients get summaries automatically → allied health benefits from the connected record. Revenue model is under review post-pivot (was patient subscription; clinic-side billing may be added).

**Today's posture:** the codebase was built around the old patient-records-their-own-visit model. We are pivoting to GP-led. The patient flow is **kept as a marked-unverified fallback** for patients whose GP isn't on ClarityHealth yet.

---

## The four surfaces

| Surface | User | Primary action |
|---|---|---|
| **GP web app** (`/gp/*` routes) | GPs / clinic staff | Record consult OR paste transcript → review AI summary → approve → patient receives |
| **GP Chrome extension** (new — to build) | GPs using Heidi or other transcription tools | Paste raw transcript into extension popup → AI summarises → approve → patient receives |
| **Patient app** (existing routes) | Patients | Receive approved summaries, chat with embedded medical AI, manage care team, share profile |
| **Allied health portal** (new — reuses GP scaffold) | Physios, psychs, dietitians, OTs | View patient profile (AI summary + recent visits), record their own consult |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (web + patient app) | React 18 + TypeScript + Vite |
| Chrome extension | Manifest v3, React + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Routing | React Router v6 |
| State / Data | TanStack Query (react-query) |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Storage | Supabase Storage (bucket: `visit-recordings`) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Transcription | Deepgram nova-2-medical, en-AU, diarize=true |
| AI Summarisation | Google Gemini 2.5 Flash (direct, OpenAI-compatible endpoint) |
| Icons | lucide-react |

---

## Repo Structure

```
src/
  App.tsx                    # Routes
  pages/
    LandingPage.tsx
    LoginPage.tsx / SignupPage.tsx / OnboardingPage.tsx
    DashboardPage.tsx
    NewVisitPage.tsx          # Patient-records fallback (kept, marked unverified)
    VisitsPage.tsx
    VisitDetailPage.tsx       # Summary display
    ActionsPage.tsx
    MedicationsPage.tsx
    LabResultsPage.tsx
    SettingsPage.tsx
    gp/                       # GP-led recording + approval flows (to build)
    practitioner/             # Allied health portal (to build)
  components/
    AppSidebar.tsx            # Patient nav sidebar
    DashboardLayout.tsx       # Patient page wrapper
    GpLayout.tsx              # GP / practitioner page wrapper
    GpProtectedRoute.tsx
    gp/GpSidebar.tsx
    ProtectedRoute.tsx
    EmergencyContactsModal.tsx
    ui/                       # shadcn components
  hooks/
    useAuth.tsx
    useDemoMode.tsx
  data/
    demoData.ts
    demoPatient.ts            # Demo patient (Karen Chen)
    gpDemoData.ts             # Demo GP / clinic
  integrations/supabase/
    client.ts
    types.ts                  # Generated DB types

supabase/functions/
  transcribe/index.ts         # Deepgram transcription
  summarise/index.ts          # Gemini AI summary (reused by GP app + Chrome extension)
  generate-access-qr/         # QR handoff token (to build)

extension/                    # Chrome extension (to build, separate package)
  manifest.json
  src/popup/
  src/background/
```

---

## Database Schema

### `profiles`
```
id uuid (FK — auth.users)
first_name, state, ongoing_conditions, current_medications
has_regular_gp bool, onboarding_complete bool
subscription_tier   # 'free' | 'plus' | 'family'
age_range
role               # 'patient' | 'practitioner' (existing — extend usage)
```

### `visits`
```
id uuid, user_id uuid (FK — profiles, the PATIENT)
doctor_name, clinic_name
visit_type          # 'gp' | 'specialist' | 'allied_health' | 'telehealth' | 'emergency'
visit_date, recording_url, recording_duration (seconds)
status              # 'processing' | 'transcribed' | 'pending_approval' | 'approved' | 'error'
transcript          # raw Deepgram or pasted transcript
summary             # JSONB (see Summary Shape below)
gp_consent_given bool          # GP informed at point of care
clinic_id uuid                  # FK to clinics (if clinic-referred)
created_by_practitioner_id      # NEW — FK to practitioners (null for patient-led fallback)
approved_at timestamptz         # NEW — null until GP/practitioner approves
approved_by uuid                # NEW — FK to practitioners
source text                     # NEW — 'native_recording' | 'chrome_extension_paste' | 'patient_recorded'
```

### `action_items`, `medications`
Unchanged from before — child rows of a visit, populated by the `summarise` edge function.

### `clinics`
```
id uuid, name, address, suburb, state, postcode, phone
ahpra_practice_id (optional), consent_form_text (custom wording), logo_url
```

### `clinic_gps` → renamed conceptually to `practitioners` (see below)

### `practitioners` (NEW — replaces clinic_gps, broader scope)
```
id uuid pk
user_id uuid FK auth.users
full_name, email
ahpra_number text unique
profession         # 'gp' | 'physio' | 'psych' | 'dietitian' | 'ot' | 'other'
clinic_id uuid (nullable — practitioners can be solo)
verified bool default false
created_at
```

### `practitioner_invites` (NEW — practitioner-initiated join links/QRs)
```
id uuid pk
practitioner_id uuid FK practitioners
token text unique                   # short URL-safe random ~12 chars
label text (nullable)               # e.g. "Reception desk QR", "Email signature"
is_evergreen boolean                # one active evergreen per practitioner
expires_at timestamptz (nullable)   # null = never expires (evergreen)
max_uses int (nullable)             # null = unlimited
use_count int default 0
revoked_at timestamptz (nullable)
created_at
```

### `care_team_members` (NEW — Layer 1 consent: whitelist)
```
id uuid pk
patient_id uuid FK profiles
practitioner_id uuid FK practitioners
invite_id uuid FK practitioner_invites (nullable)  # which invite established this link
granted_at, revoked_at (nullable)
transcript_access bool default false   # raw transcripts gated separately
unique(patient_id, practitioner_id) where revoked_at is null
```

### `access_logs` (NEW — Layer 3 consent: audit log, mandatory)
```
id uuid pk
patient_id uuid FK profiles
practitioner_id uuid FK practitioners
accessed_at, access_type           # 'care_team_join' | 'profile_summary' | 'visit_summary' | 'transcript' | 'created_visit' | 'care_team_revoke'
visit_id uuid FK visits (nullable)
source                              # 'care_team' | 'invite_link'
```

---

## Summary JSON Shape

The `summary` JSONB column on `visits` stores this structure (unchanged from previous spec):

```json
{
  "quick_summary": "1-2 sentence plain-English overview",
  "chief_complaint": "why the patient came in",
  "key_discussion_points": ["point 1", "point 2"],
  "assessment": "what the doctor found, plain English",
  "plan": ["plan item 1", "plan item 2"],
  "doctors_recommendations": [{ "number": 1, "text": "recommendation" }],
  "action_items": [{ "description": "...", "category": "medication|follow_up|test|lifestyle|referral", "due_date_suggestion": "Within 1 week" }],
  "medications": [{ "name": "Atorvastatin", "dosage": "40mg", "frequency": "Once daily at night", "explanation": "...", "is_pbs": true }],
  "referrals": [{ "to": "specialist name", "reason": "why", "next_steps": "..." }],
  "follow_up_questions": ["question to ask next time"],
  "medical_terms": [{ "term": "HbA1c", "explanation": "..." }],
  "urgency_flags": ["urgent item if any"]
}
```

---

## Consent Model (the hybrid — locked in)

Three layers, each maps to a real-world workflow.

### Layer 1 — Care Team (whitelist, permanent until revoked)
- Patient adds a practitioner via AHPRA number search or email invite
- Ongoing read access to AI profile summary + last 90 days of approved visit summaries
- Revoke any time, instant cutoff, audit-logged
- Mental model: *"these are my doctors"* — for regular GP, regular physio, regular psych

### Layer 2 — Practitioner-initiated invite link/QR (the join primitive)
- Practitioner generates a personal invite (QR + link, both encode the same `practitioner_invites.token`)
- Patient scans the QR or taps the link → lands on `/care/:token`
- Logged in: "Add Dr X to your care team" → inserts `care_team_members` row + `access_logs` row
- Not logged in: signup carries the token through onboarding → joins on completion
- The same primitive serves: GP cards in waiting rooms, allied-health follow-up SMS, email signatures
- One **evergreen** invite per practitioner (long expiry, unlimited uses) plus optional one-shot invites
- Visit-attached claim links for un-onboarded walk-in patients are a Phase 2 add-on layered on top of this same table

**(Removed: patient-generated one-time QR — flipping the direction is a strict UX upgrade because it's the practitioner who hands out cards in the real world. The visit-attached claim link covers the walk-in-without-account case better than a patient-generated QR ever did.)**

### Layer 3 — Audit Log (always on)
- Every access logged: who, when, what was viewed
- Patient sees full log in Settings → Privacy
- Required under Privacy Act 1988

### Default access scope
Practitioner sees: **AI profile summary + recent (last 90 days) approved visit summaries**. Raw transcripts are gated behind a separate explicit toggle per practitioner.

### Care-team access type
**Read + write** within the practitioner's own consults. A practitioner on a patient's care team can:
- Read the patient's AI profile summary + last 90 days of approved visit summaries
- Record/paste new consults under the patient (visit goes through the same approval flow — patient receives the approved copy)
- Cannot edit or delete visits created by another practitioner
- Cannot read raw transcripts unless the patient has explicitly enabled `transcript_access` for them

### Other rules
- **Practitioner verification:** AHPRA number required at signup. Manual verification flag for v1, automated AHPRA register check in v2.
- **Revocation UX:** one tap from care team list → confirm → audit log entry.
- **Emergency override (break-glass):** out of scope for v1. Future feature for paramedics/ED.

---

## GP-led Recording Flow (to build — Phase 1)

### Path A — Native recording (GP app)
1. GP opens **New Consult** in `/gp/*`, selects patient (must already be linked to clinic) or invites by phone/email
2. Two-checkbox consent at point of care:
   - Box 1: "I confirm the patient has consented to this consultation being recorded and transcribed by ClarityHealth."
   - Box 2: "I confirm the patient has agreed to receive a plain-English summary of this visit on their device."
3. Record (mirrors `NewVisitPage.tsx` pipeline: `getUserMedia` → MediaRecorder → upload → `transcribe` → `summarise`)
4. AI summary displayed. GP edits if needed.
5. **Approve** button → sets `approved_at` + `approved_by`, fires push notification to patient
6. Patient receives notification, opens app, sees the visit (now `status: 'approved'`)

### Path B — Chrome extension (paste transcript)
1. GP completes consult in Heidi (or other tool), copies the transcript
2. Opens ClarityHealth Chrome extension popup, selects patient, pastes transcript
3. Extension calls `summarise` edge function directly (skips `transcribe` — input is already text)
4. Summary appears in extension popup. GP reviews, edits if needed.
5. **Approve** button → same flow as Path A
6. Patient receives notification

### Path C — Patient-recorded fallback (existing, deprioritised)
- `NewVisitPage.tsx` flow remains operational
- UI clearly marked: *"Unverified — your GP has not approved this summary"*
- `approved_at` is null, `source: 'patient_recorded'`
- Allied health practitioners viewing the patient see this visit flagged as unverified

---

## Patient App — Receive + Chat + Share

### Inbox / Dashboard
- New approved visits arrive as cards: *"Dr Liu approved your summary — tap to view"*
- Pending state shows when GP has recorded but not yet approved: *"Dr Liu is finalising your summary"*

### VisitDetailPage — Summary display
All 9 sections in this order:
1. **Quick Summary** — hero card, large text, teal left border
2. **Urgency Flags** — red alert banner, top of page, only if `urgency_flags.length > 0`
3. **Action Items** — checklist, category badges, mark complete inline
4. **Doctor's Recommendations** — numbered list, prominent card
5. **Medications** — cards with PBS badge, plain-English explanation
6. **Referrals** — cards with "Next steps" highlighted box
7. **Key Discussion Points** — bullet list
8. **Medical Terms Glossary** — collapsed accordion
9. **Questions for Next Time** — "Questions to ask your doctor"

### Embedded medical AI chat (per visit)
- Floating bottom-right button: "Ask about this visit"
- Slide-up drawer with chat
- System prompt scoped to this visit's transcript + summary
- Mandatory disclaimer on every response: *"This is based on your recorded visit only and is not medical advice. Always follow your doctor's instructions."*

### Care Team management (Settings)
- Add practitioner (AHPRA search or email invite)
- List of active practitioners with revoke button
- Per-practitioner toggle: "Allow access to raw transcripts"
- Audit log accessible from Settings → Privacy

### QR Share (front desk flow)
- "Share with practitioner" button → generates one-time QR
- Shows expiry (24h) and copy of what the practitioner will see
- After visit, prompt: "Add Dr [Name] to your care team?"

---

## Allied Health Portal (to build — reuses GP scaffold)

### Routes (`/practitioner/*`)
- `/practitioner/login` — practitioner auth
- `/practitioner/dashboard` — patient list (only those with active grants)
- `/practitioner/patients/:id` — patient profile (AI summary + last 90 days of visits)
- `/practitioner/new-visit` — record or paste a consult under the patient (write access)
- `/practitioner/scan-qr` — claim a one-time QR access grant

### What practitioners CANNOT do
- View raw transcripts unless the patient has explicitly enabled it for them
- Access visits older than 90 days (unless on care team and patient has not restricted)
- Edit or delete visits created by another practitioner

---

## Edge Functions

### `transcribe` (existing)
- Input: `{ visit_id, recording_url }`
- Deepgram: nova-2-medical, en-AU, smart_format, punctuate, diarize
- Output: updates visit `{ transcript, status: 'transcribed' }`

### `summarise` (existing — now also called by Chrome extension)
- Input: `{ visit_id }` (extension calls with a freshly inserted visit row containing pasted transcript)
- Fetches visit + patient profile context (state, conditions, medications)
- Gemini 2.5 Flash via `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- Output: updates visit `{ summary, status: 'pending_approval' }`, inserts action_items + medications rows
- **Status note:** changed from `'complete'` → `'pending_approval'` post-pivot. Patient-facing UI must filter on `approved_at IS NOT NULL` (not status).

### `generate-practitioner-invite` (NEW — Phase 1)
- Auth required. Reads the calling practitioner from JWT.
- Body: `{ label?, is_evergreen?, expires_at?, max_uses? }`. Defaults to evergreen with no expiry.
- Inserts a `practitioner_invites` row, returns `{ token, url }`. The frontend renders the QR client-side.

### `lookup-practitioner-invite` (NEW — Phase 1)
- Public (no JWT). Body: `{ token }`. Returns sanitised practitioner info (name, profession, clinic name) so `/care/:token` can render the practitioner card before the patient signs up. Returns 404 for revoked / expired / exhausted tokens.

### `claim-practitioner-invite` (NEW — Phase 1)
- Auth required. Body: `{ token }`. Validates token, inserts `care_team_members` row (idempotent on the active-pair unique index), increments `use_count`, writes an `access_logs` row with `access_type='care_team_join'`.
- Returns `{ care_team_member_id, practitioner: { id, full_name, profession, clinic_name } }`.

### `notify-patient` (deferred — Phase 1.5)
- Triggered when `approved_at` is set on a visit. Push/SMS/email TBD. Not built in Phase 1; the in-app inbox carries the loop.

---

## Rules — Read These

**Australian English only.** Colour, organisation, specialise, practitioner, authorise. No Americanisms — not in copy, comments, or text-bearing variable names.

**GP approval before patient sees anything.** A visit is not visible to the patient until `approved_at IS NOT NULL`. Non-negotiable. The `summarise` function sets status to `'pending_approval'`, not `'approved'`.

**Consent at point of care.** GP-initiated recording requires the GP to confirm patient consent at the start of the consult (two-checkbox UI). Surveillance Devices Acts in SA and WA require this for all-party-consent jurisdictions.

**Patient-led fallback is clearly marked.** Any visit with `source: 'patient_recorded'` and `approved_at IS NULL` displays an "Unverified — not GP-approved" banner everywhere it appears (patient app, allied health view).

**Privacy.** Patient transcripts are sensitive health information under the Privacy Act 1988. Never log transcript content. Storage paths are user-scoped (`{patientId}/filename`). Audio blobs not returned to client after upload. All practitioner access is audit-logged in `access_logs`.

**Never give medical advice.** Any AI chat response must end with: *"This is based on your recorded visit only and is not medical advice. Always follow your doctor's instructions."*

**Use existing patterns.** shadcn/ui components only. No new libraries unless essential. Match the teal/primary palette. `DashboardLayout` for patient pages. `GpLayout` for GP and practitioner pages.

**Demo mode on every page.** `useDemoMode()` hook returns `isDemoMode: boolean`. All data fetching short-circuits with demo data — `src/data/demoPatient.ts` for patient pages, `src/data/gpDemoData.ts` for GP pages, new `src/data/practitionerDemoData.ts` for allied health pages.

**Error, loading, and empty states are required** on every async operation. No blank screens.

**Mobile-first for the patient app.** Min 44px tap targets, thumb-zone friendly. Test at 390px viewport.

**Desktop-first for GP + practitioner apps.** GPs use these on clinic workstations. Test at 1280px and up.

---

## Environment Variables

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # edge functions only
DEEPGRAM_API_KEY              # edge functions only (medical transcription)
GEMINI_API_KEY                # edge functions only (Google AI Studio key for Gemini 2.5 Flash)
PUSH_PROVIDER_KEY             # to be added Phase 1 (provider TBD)
```

---

## Phased Build Roadmap (high level)

| Phase | Scope | Status |
|---|---|---|
| **Phase 0** | Update CLAUDE.md to reflect pivot | ✅ This document |
| **Phase 1** | GP-led recording (built) + practitioner-initiated invite link/QR + care_team_members + audit log + in-app inbox delivery | In progress |
| **Phase 1.5** | Push / SMS / email notification provider (provider TBD) | Next |
| **Phase 2** | Chrome extension (paste transcript → AI summary → approve) + visit-attached claim link for un-onboarded walk-ins | Next + 1 |
| **Phase 3** | Patient settings — care team management UI + revoke + audit log view | Next + 2 |
| **Phase 4** | Allied-health portal UI (`/practitioner/*`) reusing the GP scaffold | Next + 3 |

Detailed plan: `/Users/ivanhtet/.claude/plans/give-me-the-best-expressive-platypus.md`

---

## Do NOT Build Yet

- Stripe / subscription billing
- Family sharing
- Lab results upload improvements
- Multi-language support
- Government / PHN integrations
- Emergency break-glass override
- Automated AHPRA register verification (manual flag for v1)

---

## Open Items (flagged for product decisions)

- **Push notification provider** — Expo / OneSignal / native web push. Decide before Phase 1.
- **Pricing model post-pivot** — patient subscription was original. Does the clinic now pay too? Hybrid?
- **Chrome extension distribution** — Web Store review takes time. Plan unpacked dev distribution to early GPs.
- **AHPRA verification automation** — manual for v1. Automate when volume warrants.
