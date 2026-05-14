# Clarity Health — Deployment Checklist

## Prerequisites
- [ ] New Supabase project created
- [ ] Gemini API key (https://aistudio.google.com/apikey)
- [ ] Deepgram API key (https://console.deepgram.com)
- [ ] Resend API key (https://resend.com/api-keys)
- [ ] Vercel account connected to GitHub

---

## Step 1: Database Setup

1. Go to your new Supabase project → **SQL Editor**
2. Paste the contents of `setup/001_full_migration.sql`
3. Click **Run**
4. Verify: Go to **Table Editor** — you should see these tables:
   - `profiles`, `visits`, `action_items`, `medications`, `chat_messages`
   - `clinics`, `practitioners`
   - `practitioner_invites`, `care_team_members`, `access_logs`
   - `waitlist`
5. Verify: Go to **Storage** — you should see `visit-recordings` bucket

---

## Step 2: Update Environment Variables in Codebase

Update `.env` (or Vercel env vars) with your new Supabase project details:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_new_anon_key
```

Also update `supabase/config.toml`:
```toml
project_id = "YOUR_NEW_PROJECT_ID"
```

---

## Step 3: Deploy Edge Functions

From the repo root, link to your new project and deploy:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Set secrets
supabase secrets set GEMINI_API_KEY=your_gemini_key
supabase secrets set DEEPGRAM_API_KEY=your_deepgram_key
supabase secrets set RESEND_API_KEY=your_resend_key
supabase secrets set APP_URL=https://app.clarityhealth.au

# Deploy all functions
supabase functions deploy transcribe
supabase functions deploy summarise
supabase functions deploy summarise-text
supabase functions deploy paste-visit
supabase functions deploy chat
supabase functions deploy generate-practitioner-invite
supabase functions deploy lookup-practitioner-invite
supabase functions deploy claim-practitioner-invite
supabase functions deploy notify-patient
```

---

## Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `after-my-visit` repo
3. Set environment variables:
   - `VITE_SUPABASE_URL` = `https://YOUR_PROJECT_ID.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your new anon key
4. Deploy

---

## Step 5: Custom Domain (optional for launch)

1. In Vercel → Settings → Domains → Add `app.clarityhealth.au`
2. Update DNS at your registrar with the CNAME Vercel provides
3. Set `APP_URL` secret in Supabase to match

---

## Step 6: Supabase Auth Settings

1. Go to Supabase → Authentication → URL Configuration
2. Set **Site URL** to your Vercel deployment URL (e.g. `https://app.clarityhealth.au`)
3. Add redirect URLs:
   - `https://app.clarityhealth.au/**`
   - `http://localhost:5173/**` (for local dev)

---

## Step 7: Smoke Test

Run through the full GP flow:
1. [ ] Go to `/gp/signup` → create GP account
2. [ ] Complete onboarding (AHPRA number, profession, clinic)
3. [ ] Go to GP dashboard → paste a test transcript
4. [ ] Review AI summary in the drawer → approve
5. [ ] Create patient account (separate browser/incognito)
6. [ ] Patient should see the visit on their dashboard
7. [ ] Test AI chat on a visit detail page
8. [ ] Test QR code generation at `/gp/qr-code`
9. [ ] Test care invite flow: scan QR → claim as patient

---

## Bug Fixes Applied (in this commit)

1. ✅ `notify-patient`: Fixed `accessor_id` → `practitioner_id`, `details` → `source` (schema match)
2. ✅ `notify-patient`: Fixed status check to also accept `approved_at IS NOT NULL`
3. ✅ `notify-patient`: Changed APP_URL default from `aftervisit.vercel.app` → `app.clarityhealth.au`
4. ✅ `paste-visit`: Changed status from `"complete"` → `"pending_approval"` (approval gate)
5. ✅ `.gitignore`: Added `.env` files
6. ✅ Migration: Added `last_name` column to profiles (required by paste-visit patient lookup)
7. ✅ Migration: Added `email_notification` to `access_logs.access_type` CHECK + `system` to `source` CHECK
