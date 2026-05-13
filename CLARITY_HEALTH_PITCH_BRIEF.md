# Clarity Health — Pitch Brief

> A communication layer between GPs, patients, and allied health practitioners. Built in Australia.

---

## The one-liner

**Patients leave the GP confused. Allied health practitioners chase context they never get. Clarity Health bridges all three** — turning every consult into a plain-English summary the patient understands and the next practitioner can build on.

---

## The problem

- **75%** of medical information is forgotten by patients before they leave the room. **50%** of what they do remember is recalled incorrectly.
- The average **20-minute Medicare-rebated consult** is too short to explain conditions, medications, side-effects, and next steps in language patients absorb.
- When that patient sees a **physio, psych, dietitian, or OT** next, they re-tell their story from scratch. The allied health practitioner makes decisions without the GP's notes, medications, or referral context.
- The existing tools — **My Health Record, Heidi, Halo** — solve the doctor's note-taking problem. **Nobody is solving the patient-comprehension problem or the cross-practitioner continuity problem.**

---

## The solution

The core loop:

1. **GP records or pastes a consult transcript.** Either via the in-app voice recorder or by pasting from Heidi into our Chrome extension.
2. **AI summarises** the consult — plain English, action items, medications with PBS info, referrals, glossary of medical terms, urgency flags.
3. **GP reviews and clicks Approve.** Non-negotiable — nothing reaches the patient until the GP has signed off.
4. **Patient receives the approved summary** on their device. They can ask follow-up questions through an embedded medical AI scoped to that specific visit (with a hard "this is not medical advice" disclaimer on every reply).
5. **Allied health continuity.** When the patient sees their physio next, the practitioner opens the patient's profile and gets an AI-generated health-status summary — recent visits, conditions, current medications. The physio can record their own consult, which joins the chain. The GP doesn't need to be involved for the loop to keep going.

---

## The product — four surfaces

| Surface | User | What they do |
|---|---|---|
| **GP web app** | GPs, clinic staff | Record consult OR paste transcript → review AI summary → approve → patient receives |
| **GP Chrome extension** | GPs already using Heidi or other transcription | Paste raw transcript into extension popup → AI summarises → approve → patient receives. Slots into existing workflows. |
| **Patient app** | Patients | Receive approved summaries, chat with the embedded medical AI, manage their care team, share access with new practitioners |
| **Allied health portal** | Physios, psychs, dietitians, OTs | View patient profile (AI summary + recent visits), record their own consult under the patient |

---

## The join primitive — practitioner-initiated QR / link

The piece that makes the network grow:

- Every practitioner generates a personal QR code + invite link.
- Patient scans/clicks → "Add Dr X to my care team" → done. If new, signup carries the invite through onboarding.
- Practitioner now sees the patient on their dashboard. Can record consults. Patient receives approved summaries.
- Same primitive works in every channel — printed card at reception, email signature, SMS follow-up, allied-health business card.

**Why this matters for distribution.** A patient who lands on the app from a GP's QR becomes a viral node — they take Clarity Health with them when they see their physio, who joins the same network. **Cross-practitioner network effects without needing a top-down government rollout.**

---

## Consent + privacy (built in, not bolted on)

Three layers, each maps to a real-world consent moment:

1. **Care Team (whitelist)** — patient adds practitioner via QR; ongoing access until revoked.
2. **Practitioner-initiated invite link** — the join primitive above. Designed for the way clinics actually work — practitioners hand out cards, patients scan.
3. **Audit log (mandatory)** — every practitioner read of a patient's profile or visit is logged. Patient can see the full log. Required under the Privacy Act 1988.

Patient transcripts are sensitive health information under Australian privacy law. Storage is user-scoped, audio blobs aren't returned to the client after upload, raw transcripts are gated behind a separate per-practitioner toggle.

---

## Why Australia

- **Single-payer Medicare structure** — every GP consult has the same time pressure, same item numbers (23, 36, 44), same incentives. One product fits the whole market.
- **PBS (Pharmaceutical Benefits Scheme)** — medication explanations can reference PBS subsidy directly, which means more to Australians than generic drug info.
- **AHPRA** — every registered practitioner has a unique ID. Verification can be automated as we scale. No equivalent in the US.
- **Existing trust signal** — the "after-visit summary" concept is universal but never been done well for the patient side in Australia. Heidi has proven AU GPs will adopt AI tools fast.

---

## Tech stack (built for speed)

- **Frontend** — React + TypeScript + Vite, Tailwind, shadcn/ui
- **Auth + DB** — Supabase Postgres with row-level security
- **Transcription** — Deepgram nova-2-medical, en-AU, with speaker diarisation
- **AI summarisation** — Google Gemini 2.5 Flash (with structured JSON output)
- **Chrome extension** — Manifest v3, sits alongside Heidi without disrupting workflow

---

## What's built today (May 2026)

- GP web app — recording, paste-transcript, AI summarisation pipeline, approval flow
- Practitioner accounts with AHPRA registration + clinic linkage
- **Practitioner-initiated QR / care-team join flow** (just shipped) — the network primitive
- Patient app — dashboard, visit summaries with all nine sections (quick summary, urgency flags, action items, recommendations, medications, referrals, key points, glossary, follow-up questions)
- Patient-recorded fallback (clearly marked unverified) for patients whose GP isn't on the platform yet
- Audit log infrastructure
- Demo mode on every page for sales conversations

---

## What's next (roadmap)

| Phase | Scope |
|---|---|
| **Phase 1.5** | Push / SMS / email notifications when a summary is approved |
| **Phase 2** | Chrome extension public release + visit-attached claim link for un-onboarded walk-in patients |
| **Phase 3** | Patient-side Care Team management UI + audit log view + revoke |
| **Phase 4** | Full allied-health portal — patient list, profile view, record-under-patient |
| **Phase 5** | Automated AHPRA verification at signup |

**Deferred deliberately** — Stripe billing, family sharing, multi-language, government integrations, emergency break-glass override. None block the core loop.

---

## Business model

**Current posture** — under review post-pivot. Originally patient subscription. Now exploring clinic-side billing (per-practitioner SaaS, similar to Heidi's pricing) plus a free / freemium patient tier.

Why clinic-led is right:
- Clinics already pay for software (Best Practice, Medical Director, Heidi).
- A practice with 8 GPs paying $50/seat/month = $400 MRR. **150 clinics = $60k MRR**.
- Patient adoption is bundled with the clinic decision, not a separate sales motion.
- Allied health practitioners can be invited free initially to build the cross-practitioner network, then converted to paid as their patient volume grows.

---

## Why now

- **GPs are already adopting AI** — Heidi proved it. Halo, Patient Notes, Lyrebird are growing. The wedge for AI tools in Australian primary care is open.
- **Patient-facing AI is finally trustworthy enough.** Gemini 2.5 Flash + medical-grade Deepgram transcription means summaries are actually accurate. Two years ago this wasn't possible.
- **Allied health is digitised but disconnected.** Practitioners are on Cliniko, Halaxy, Power Diary — none of them talk to each other or to GPs.
- **Privacy Act 1988 reforms** are tightening — products built privacy-first now will be the ones standing in 18 months.

---

## Distribution wedge

**GP clinics, one at a time.** Land 5–10 anchor clinics in Melbourne, prove the loop (patients understand more, allied health gets context, GPs save time on follow-up calls), expand by referral. Allied health is invited free → upgraded once they're the ones recording.

The Chrome extension is the *trojan horse* — it sits next to Heidi, doesn't replace it, and gives GPs a "send to patient" button they don't have today.

---

## Team

- **Founder** — Ivan Htet. Building solo today, looking to bring on a clinical co-founder (GP advisor) and a sales/clinic-onboarding hire after first 5 paying clinics.

---

## What we need (the ask)

This brief is for you, Claude, to help build a pitch deck. The deck should hit:

1. **Hook slide** — one sentence + visual that captures "the gap between leaving the GP's office and understanding what just happened."
2. **The problem** — make it visceral. The 75% / 50% statistics, the allied-health continuity gap.
3. **The product** — the four surfaces, but presented as one connected loop, not four products.
4. **Demo** — screenshots of the patient-facing summary (the nine sections). This is the wow.
5. **The join primitive** — the QR/invite flow as the network-growth mechanism.
6. **Why Australia, why now** — Medicare structure + Heidi proof point + Privacy Act tailwind.
7. **Business model** — clinic-side SaaS, with the math.
8. **Roadmap** — what's built, what's next, what's deferred.
9. **Team** — founder + ask.
10. **Close** — vision: every Australian GP visit produces a summary the patient actually reads.
