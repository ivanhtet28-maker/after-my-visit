# AfterVisit — CLAUDE.md
> Project brief for Claude Code. Read this entire file before touching any code.

## What we're building

AfterVisit is an Australian patient-side health companion app. A patient records their GP consultation, the audio is transcribed, and an AI generates a plain-English summary — action items, medications, referrals, medical term explanations. Think "Heidi Health but for the patient, not the GP."

**Distribution model:** Clinic-led B2B2C. GP clinics offer the app to patients at intake. Patient signs digital consent in the app. Clinic gets branded experience; patient gets the summary. Revenue = patient subscription ($29.99/mo).

**Today's build focus:** Patient recording flow — AI summary. The core loop. GP portal as secondary.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Routing | React Router v6 |
| State / Data | TanStack Query (react-query) |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Storage | Supabase Storage (bucket: `visit-recordings`) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Transcription | Deepgram nova-2-medical, en-AU, diarize=true |
| AI Summarisation | Gemini 2.5 Flash via Lovable AI Gateway |
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
    NewVisitPage.tsx          # — CORE: recording flow
    VisitsPage.tsx
    VisitDetailPage.tsx       # — CORE: summary display
    ActionsPage.tsx
    MedicationsPage.tsx
    LabResultsPage.tsx
    SettingsPage.tsx
  components/
    AppSidebar.tsx            # Nav sidebar (collapsible icon mode)
    DashboardLayout.tsx       # Page wrapper with sidebar
    ProtectedRoute.tsx
    EmergencyContactsModal.tsx
    ui/                       # shadcn components
  hooks/
    useAuth.tsx
    useDemoMode.tsx
  data/
    demoData.ts               # Demo visit/chat data
    demoPatient.ts            # Demo patient (Karen Chen)
  integrations/supabase/
    client.ts
    types.ts                  # Generated DB types

supabase/functions/
  transcribe/index.ts         # Deepgram transcription edge function
  summarise/index.ts          # Gemini AI summary edge function
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
```

### `visits`
```
id uuid, user_id uuid (FK — profiles)
doctor_name, clinic_name
visit_type          # 'gp' | 'specialist' | 'allied_health' | 'telehealth' | 'emergency'
visit_date, recording_url, recording_duration (seconds)
status              # 'processing' | 'transcribed' | 'complete' | 'error'
transcript          # raw Deepgram output
summary             # JSONB (see Summary Shape below)
gp_consent_given bool   # NEW — was GP informed before recording?
clinic_id uuid          # NEW — FK to clinics table (if clinic-referred)
```

### `action_items`
```
id, user_id, visit_id, description, category, due_date_suggestion, status, completed_at
```

### `medications`
```
id, user_id, visit_id, name, dosage, frequency, explanation, is_pbs bool, active bool
```

### `clinics` (NEW — for GP portal)
```
id uuid, name, address, suburb, state, postcode, phone
ahpra_practice_id (optional), consent_form_text (custom wording), logo_url
created_at
```

### `clinic_gps` (NEW)
```
id, clinic_id, gp_name, ahpra_number, email, is_active bool
```

---

## Summary JSON Shape

The `summary` JSONB column on `visits` stores this structure:

```json
{
  "quick_summary": "1-2 sentence plain-English overview",
  "chief_complaint": "why the patient came in",
  "key_discussion_points": ["point 1", "point 2"],
  "assessment": "what the doctor found, plain English",
  "plan": ["plan item 1", "plan item 2"],
  "doctors_recommendations": [{ "number": 1, "text": "recommendation" }],
  "action_items": [{
    "description": "what to do",
    "category": "medication|follow_up|test|lifestyle|referral",
    "due_date_suggestion": "Within 1 week"
  }],
  "medications": [{
    "name": "Atorvastatin", "dosage": "40mg", "frequency": "Once daily at night",
    "explanation": "plain English what it does", "is_pbs": true
  }],
  "referrals": [{ "to": "specialist name", "reason": "why", "next_steps": "what patient does" }],
  "follow_up_questions": ["question to ask next time"],
  "medical_terms": [{ "term": "HbA1c", "explanation": "plain English" }],
  "urgency_flags": ["urgent item if any"]
}
```

---

## Existing Patient Recording Flow (NewVisitPage.tsx)

**Step 1 — Visit details form**
- Fields: doctor name, clinic name, visit type (select), visit date (calendar picker)
- Consent checkbox: "I confirm I have informed my doctor this visit will be recorded"
- All fields required + consent must be checked to proceed

**Step 2 — Recording**
- `navigator.mediaDevices.getUserMedia({ audio: true })`
- MediaRecorder: `audio/webm;codecs=opus`
- Start / Pause / Resume / Stop controls
- Live duration timer

**Step 3 — Processing pipeline (sequential)**
1. Upload blob — Supabase Storage `visit-recordings/{userId}/{timestamp}.webm`
2. Insert visit row (`status: 'processing'`)
3. Invoke `transcribe` edge function — Deepgram
4. Invoke `summarise` edge function — Gemini
5. Navigate to `/visit/{id}`

---

## TODAY'S BUILD TASKS

### Task 1 — Harden the recording flow (NewVisitPage.tsx)

**1A — Consent step (LEGAL REQUIREMENT)**

Before the Start Recording button is enabled, show a proper two-checkbox consent:
- Box 1: "I confirm that [Dr {doctorName}] has been informed this consultation will be recorded and transcribed by AfterVisit."
- Box 2: "I understand the audio will be processed on AfterVisit's secure Australian servers and deleted after transcription is complete."
- If a `clinic_id` is linked, show that clinic's `consent_form_text` instead of the defaults.
- Start Recording button is disabled until BOTH are checked.
- Save `gp_consent_given: true` on the visit row.

**1B — Audio level visualiser**

During recording, show a live waveform using Web Audio API `AnalyserNode`:
- 20-30 bars, animated, teal colour matching app palette
- Warning toast if amplitude is consistently low for 10+ seconds: "Move closer to the speaker for better transcription quality"

**1C — Error recovery**

Current behaviour on pipeline failure: dead end. Fix:
- Show specific error message from edge function
- "Retry" button that re-invokes the failed step without re-uploading
- Never delete the recording file on error

---

### Task 2 — Summary display (VisitDetailPage.tsx)

Ensure all 9 sections render. Order matters:

1. **Quick Summary** — hero card, large text, teal left border accent
2. **Urgency Flags** — red alert banner, only if `urgency_flags.length > 0`, appears at top
3. **Action Items** — checklist, category badges (pill/follow_up/test/lifestyle/referral), mark complete inline without page reload
4. **Doctor's Recommendations** — numbered list, prominent card
5. **Medications** — cards with PBS badge (green), plain-English explanation below name
6. **Referrals** — cards with "Next steps" highlighted box
7. **Key Discussion Points** — clean bullet list
8. **Medical Terms Glossary** — collapsed accordion by default, expand to see all terms
9. **Questions for Next Time** — "Questions to ask your doctor" section

**Ask AI chat (floating button):**
- Fixed bottom-right button: "Ask about this visit"
- Opens a slide-up drawer with chat interface
- System prompt scoped to this visit's transcript + summary
- Must include disclaimer: "This is based on your recorded visit only and is not medical advice."
- Use existing chat pattern from demoData.ts for UI reference

---

### Task 3 — GP Portal (NEW routes — adapt existing UI patterns)

Add these routes to App.tsx:
```
/gp/login             # clinic staff login (separate from patient auth)
/gp/dashboard         # clinic overview stats
/gp/patients          # metadata list only — NO access to patient summaries
/gp/consent-settings  # edit clinic consent form text
/gp/qr-code           # QR code for waiting room
```

**GP Dashboard:**
- Header: clinic name + logo
- Stat cards: Patients this month / Consults recorded today / Total active patients
- Recent activity: "[Patient first name initial] recorded a consult with Dr [X] — 2 hrs ago"
- GPs never see patient summary content — metadata only (date, duration, doctor name)
- "Download QR Code" button — PNG

**Clinic QR Code:**
- Each clinic gets unique onboarding URL: `aftervisit.app/join/{clinicSlug}`
- Patient scans — lands on branded signup with clinic pre-selected
- On signup, `clinic_id` saved to profile
- Future visits at that clinic auto-populate clinic name

**GP Consent Settings:**
- Textarea for custom consent wording
- Live preview of how it appears in patient app
- Toggle: require explicit GP acknowledgement per recording (default: on)

---

## Edge Functions (do not break existing ones)

### `transcribe` (existing)
- Input: `{ visit_id, recording_url }`
- Deepgram: `nova-2-medical, language=en-AU, smart_format=true, punctuate=true, diarize=true`
- Output: updates visit `{ transcript, status: 'transcribed' }`

### `summarise` (existing)
- Input: `{ visit_id }`
- Fetches visit + patient profile for context (state, conditions, medications)
- Gemini 2.5 Flash via `https://ai.gateway.lovable.dev/v1/chat/completions`
- Output: updates visit `{ summary (JSON), status: 'complete' }`, inserts action_items + medications rows

### `generate-clinic-qr` (NEW)
- Input: `{ clinic_id }`
- Returns base64 PNG of QR code linking to `aftervisit.app/join/{clinicSlug}`

---

## Rules — Read These

**Australian English only.** Colour, organisation, specialise, practitioner, authorise. No Americanisms anywhere — not in copy, comments, or variable names that surface as text.

**Consent before recording — always.** The Start Recording button must be disabled until both consent boxes are checked. This is a legal requirement in SA and WA under the Surveillance Devices Acts. Non-negotiable.

**Privacy.** Patient transcripts are sensitive health information under the Australian Privacy Act 1988. Never log transcript content. Storage paths must be user-scoped (`{userId}/filename`). Audio blobs must not be returned to the client after upload.

**Never give medical advice.** Any AI chat response must end with: "This is based on your recorded visit only and is not medical advice. Always follow your doctor's instructions."

**Use existing patterns.** shadcn/ui components only. No new libraries unless essential. Match the teal/primary palette. Use `DashboardLayout` as the wrapper for all authenticated patient pages. GP portal gets its own `GpLayout` wrapper with a different sidebar.

**Demo mode on every page.** `useDemoMode()` hook returns `isDemoMode: boolean`. All data fetching must short-circuit with demo data from `src/data/demoPatient.ts`. New GP pages use a hardcoded `DEMO_CLINIC` object.

**Error, loading, and empty states are required** on every async operation. No blank screens.

**Mobile-first.** Patients use this on their phone. All recording UI: minimum 44px tap targets, thumb-zone friendly layout. Test at 390px viewport width.

---

## Environment Variables

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # edge functions only
DEEPGRAM_API_KEY              # edge functions only
LOVABLE_API_KEY               # edge functions only (Gemini gateway)
```

---

## Do NOT Build Today

- Stripe / subscription billing
- Family sharing (pricing tier exists, feature is not built)
- Lab results upload improvements
- Push notifications
- Multi-language support
- Government or PHN integrations

---

## Definition of Done

- [ ] Patient can enter visit details, check two-part consent, start recording
- [ ] Audio level visualiser shows during recording
- [ ] Stop recording — upload — transcribe — summarise pipeline completes
- [ ] Error recovery: retry button appears on failure, recording is preserved
- [ ] VisitDetailPage renders all 9 summary sections in correct order
- [ ] Urgency flags display as red alert banner
- [ ] Action items can be marked complete inline
- [ ] Ask AI chat drawer opens, scoped to visit context, disclaimer present
- [ ] GP portal routes exist: dashboard, patient list (metadata only), consent settings, QR code
- [ ] Demo mode works on all new pages
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Layouts work at 390px mobile width
