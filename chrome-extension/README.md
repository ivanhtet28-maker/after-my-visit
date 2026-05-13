# Clarity GP Chrome Extension

A Chrome extension that lets a GP paste a consult note (or a script) and push it
straight into a patient's Clarity dashboard. The extension calls the
`paste-visit` edge function, which:

1. Resolves the patient via `profiles.first_name + last_name`.
2. Summarises the raw text with Gemini using the same prompt the existing
   `summarise-text` function uses.
3. Inserts a `visits` row plus child `action_items` and `medications` rows
   under that patient's `user_id` (service role bypasses RLS).
4. Returns a link to the new visit on the patient dashboard.

## Files

```
chrome-extension/
├── manifest.json   # MV3 manifest
├── popup.html      # 380px-wide popup
├── popup.css       # styles
├── popup.js        # combobox + submit logic
├── icons/          # 16/32/128 PNGs (placeholder teal squares)
└── README.md       # this file
```

## One-time backend setup

1. Deploy the `paste-visit` edge function:
   ```bash
   supabase functions deploy paste-visit
   ```
2. Make sure these env vars are set on the Supabase project:
   - `GEMINI_API_KEY` (same key `summarise-text` uses)
   - `SUPABASE_SERVICE_ROLE_KEY` (auto-injected, but verify)
3. Seed a real auth user called **Jessica Mitchell**. The function looks up by
   exact `first_name` + `last_name` (case-insensitive). The 4 filler names in
   the dropdown (Margaret Chen, David O'Brien, Priya Anand, Tom Kowalski) are
   visual placeholders — the extension shows them but blocks Submit with an
   info banner if you pick one.

## Install the extension

1. Open Chrome → `chrome://extensions`.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked**.
4. Select this `chrome-extension/` folder.
5. Pin the extension to the toolbar for the demo (puzzle-piece icon → pin).

## Configure (optional)

Defaults point at the staging Supabase project hardcoded in `popup.js`. To
override (production, custom Gemini key, etc.):

1. Click the extension icon → ⚙ Settings.
2. Fill in `Supabase URL`, `Supabase anon key`, `Dashboard origin`, Save.

Stored in `chrome.storage.sync`. Never leaves the browser.

## Demo script

1. Pin the extension. Click the icon.
2. Type "Jessica" → pick **Jessica Mitchell** from the dropdown.
3. Optional: type a doctor name (e.g. "Dr Zhao").
4. Paste a consult note. Anything over 30 chars works — a real example:

   > Doctor: Morning Jessica, your blood pressure today is 138/85, slightly
   > elevated. I want to bump your Perindopril to 10mg daily. Also recommend
   > we book a fasting blood test in 6 weeks to recheck HbA1c. Continue
   > physiotherapy for the knee — 4 more weeks. Flu vaccination administered
   > today.

5. Hit **Send to patient dashboard** (or Cmd/Ctrl+Enter).
6. Within ~5 seconds you'll get a success banner with an **Open visit →** link.
   Click it — the visit, structured Plan, medications, and action items all
   appear in Jessica's dashboard.

## Limitations

- Patient resolution is exact-match. If Jessica isn't seeded in `profiles`, the
  function 404s with a friendly message.
- The 4 filler names are visual only — the extension's client-side guard
  prevents them from being submitted.
- Anon key is embedded in the bundle. That's fine — the `paste-visit` function
  is intentionally callable from the extension origin. Production hardening
  (per-GP auth, audit logging, etc.) would replace the anon key with a real
  practitioner JWT.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "No patient named … found" | Seed Jessica Mitchell in `profiles` (auth user + matching profile row) |
| "AI gateway error" | `GEMINI_API_KEY` is missing or invalid on the Supabase project |
| Submit button disabled | Notes must be ≥ 30 characters and a patient must be picked |
| Extension won't load | Check `manifest_version: 3` and that all three icon files exist |
