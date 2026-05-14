-- ============================================================================
-- CLARITY HEALTH — FULL DATABASE MIGRATION
-- ============================================================================
-- Run this in a FRESH Supabase project's SQL Editor.
-- Combines all 7 migrations + bug fixes into one idempotent script.
-- Generated: 2026-05-14
-- ============================================================================

-- ============================================================================
-- 0. HELPER FUNCTIONS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 1. PROFILES
-- ============================================================================

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,                                        -- added: needed by paste-visit patient lookup
  state text,
  age_range text,
  has_regular_gp boolean DEFAULT false,
  ongoing_conditions text,
  current_medications text,
  onboarding_complete boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  role text NOT NULL DEFAULT 'patient',                  -- from migration 4
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. CLINICS (Phase 1)
-- ============================================================================

CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  address text,
  suburb text,
  state text,
  postcode text,
  phone text,
  ahpra_practice_id text,
  consent_form_text text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read clinics"
  ON public.clinics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create clinics"
  ON public.clinics FOR INSERT TO authenticated WITH CHECK (true);

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 3. PRACTITIONERS (Phase 1)
-- ============================================================================

CREATE TABLE public.practitioners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  ahpra_number text UNIQUE NOT NULL,
  profession text NOT NULL CHECK (profession IN ('gp', 'physio', 'psych', 'dietitian', 'ot', 'other')),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_practitioners_user_id ON public.practitioners(user_id);
CREATE INDEX idx_practitioners_clinic_id ON public.practitioners(clinic_id);

ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view own record"
  ON public.practitioners FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can update own record"
  ON public.practitioners FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can insert own record"
  ON public.practitioners FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_practitioners_updated_at
  BEFORE UPDATE ON public.practitioners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: current practitioner id
CREATE OR REPLACE FUNCTION public.current_practitioner_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.practitioners WHERE user_id = auth.uid() LIMIT 1
$$;

-- ============================================================================
-- 4. VISITS (base + Phase 1 columns)
-- ============================================================================

CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_name text,
  clinic_name text,
  visit_type text,
  visit_date date DEFAULT current_date,
  recording_url text,
  recording_duration integer,
  transcript text,
  summary jsonb,
  status text DEFAULT 'draft',
  -- Phase 1 columns (GP-led recording + approval)
  gp_consent_given boolean DEFAULT false,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  created_by_practitioner_id uuid REFERENCES public.practitioners(id) ON DELETE SET NULL,
  approved_at timestamptz,
  approved_by uuid REFERENCES public.practitioners(id) ON DELETE SET NULL,
  source text DEFAULT 'patient_recorded'
    CHECK (source IN ('native_recording', 'chrome_extension_paste', 'patient_recorded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_visits_created_by_practitioner ON public.visits(created_by_practitioner_id);
CREATE INDEX idx_visits_clinic_id ON public.visits(clinic_id);
CREATE INDEX idx_visits_approved_at ON public.visits(approved_at);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Helper function: is_owner_of_visit
CREATE OR REPLACE FUNCTION public.is_owner_of_visit(_visit_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.visits
    WHERE id = _visit_id AND user_id = auth.uid()
  )
$$;

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Patient policies
CREATE POLICY "Users can view own visits" ON public.visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON public.visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visits" ON public.visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own visits" ON public.visits FOR DELETE USING (auth.uid() = user_id);

-- Practitioner policies
CREATE POLICY "Practitioners can view visits they created"
  ON public.visits FOR SELECT TO authenticated
  USING (
    created_by_practitioner_id IS NOT NULL
    AND created_by_practitioner_id = public.current_practitioner_id()
  );

CREATE POLICY "Practitioners can insert visits they create"
  ON public.visits FOR INSERT TO authenticated
  WITH CHECK (created_by_practitioner_id = public.current_practitioner_id());

CREATE POLICY "Practitioners can update visits they created"
  ON public.visits FOR UPDATE TO authenticated
  USING (created_by_practitioner_id = public.current_practitioner_id());

-- Cross-policy: patients can view practitioners who created their visits
CREATE POLICY "Patients can view practitioners who treated them"
  ON public.practitioners FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visits
      WHERE visits.created_by_practitioner_id = practitioners.id
        AND visits.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. ACTION_ITEMS
-- ============================================================================

CREATE TABLE public.action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  description text NOT NULL,
  due_date date,
  status text DEFAULT 'pending',
  category text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON public.action_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.action_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.action_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own actions" ON public.action_items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can view action_items for their visits"
  ON public.action_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visits
      WHERE visits.id = action_items.visit_id
        AND visits.created_by_practitioner_id = public.current_practitioner_id()
    )
  );

-- ============================================================================
-- 6. MEDICATIONS
-- ============================================================================

CREATE TABLE public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  name text NOT NULL,
  dosage text,
  frequency text,
  prescribing_doctor text,
  date_prescribed date,
  is_pbs boolean DEFAULT false,
  plain_explanation text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can view medications for their visits"
  ON public.medications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visits
      WHERE visits.id = medications.visit_id
        AND visits.created_by_practitioner_id = public.current_practitioner_id()
    )
  );

-- ============================================================================
-- 7. CHAT_MESSAGES
-- ============================================================================

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_id uuid REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. WAITLIST
-- ============================================================================

CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  user_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS integer
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.waitlist;
$$;

-- ============================================================================
-- 9. PRACTITIONER_INVITES (Phase 2)
-- ============================================================================

CREATE TABLE public.practitioner_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  label text,
  is_evergreen boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  max_uses integer,
  use_count integer NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_practitioner_invites_practitioner ON public.practitioner_invites(practitioner_id);
CREATE UNIQUE INDEX idx_practitioner_invites_one_evergreen
  ON public.practitioner_invites(practitioner_id)
  WHERE is_evergreen = true AND revoked_at IS NULL;

ALTER TABLE public.practitioner_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view own invites"
  ON public.practitioner_invites FOR SELECT TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

CREATE POLICY "Practitioners can revoke own invites"
  ON public.practitioner_invites FOR UPDATE TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

-- ============================================================================
-- 10. CARE_TEAM_MEMBERS (Phase 2)
-- ============================================================================

CREATE TABLE public.care_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  invite_id uuid REFERENCES public.practitioner_invites(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  transcript_access boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_care_team_unique_active
  ON public.care_team_members(patient_id, practitioner_id)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_care_team_patient ON public.care_team_members(patient_id);
CREATE INDEX idx_care_team_practitioner ON public.care_team_members(practitioner_id);

ALTER TABLE public.care_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own care team"
  ON public.care_team_members FOR SELECT TO authenticated USING (patient_id = auth.uid());

CREATE POLICY "Patients can revoke own care team members"
  ON public.care_team_members FOR UPDATE TO authenticated USING (patient_id = auth.uid());

CREATE POLICY "Practitioners can view their care team rows"
  ON public.care_team_members FOR SELECT TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

-- ============================================================================
-- 11. ACCESS_LOGS — mandatory audit (Privacy Act 1988)
-- ============================================================================

CREATE TABLE public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  access_type text NOT NULL CHECK (access_type IN (
    'care_team_join',
    'profile_summary',
    'visit_summary',
    'transcript',
    'created_visit',
    'care_team_revoke',
    'email_notification'
  )),
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'care_team' CHECK (source IN ('care_team', 'invite_link', 'system'))
);

CREATE INDEX idx_access_logs_patient ON public.access_logs(patient_id, accessed_at DESC);
CREATE INDEX idx_access_logs_practitioner ON public.access_logs(practitioner_id, accessed_at DESC);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own access logs"
  ON public.access_logs FOR SELECT TO authenticated USING (patient_id = auth.uid());

CREATE POLICY "Practitioners can view their access logs"
  ON public.access_logs FOR SELECT TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

-- ============================================================================
-- 12. CROSS-TABLE POLICIES — practitioners <-> profiles via care team
-- ============================================================================

-- Practitioner reads patient profile when on the care team
CREATE POLICY "Practitioners can view care-team patient profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.patient_id = profiles.id
        AND ctm.practitioner_id = public.current_practitioner_id()
        AND ctm.revoked_at IS NULL
    )
  );

-- Patient reads practitioner profile for anyone on their care team
CREATE POLICY "Patients can view care-team practitioners"
  ON public.practitioners FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.practitioner_id = practitioners.id
        AND ctm.patient_id = auth.uid()
        AND ctm.revoked_at IS NULL
    )
  );

-- Care-team practitioners can view approved visits
CREATE POLICY "Care-team practitioners can view approved visits"
  ON public.visits FOR SELECT TO authenticated
  USING (
    approved_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.patient_id = visits.user_id
        AND ctm.practitioner_id = public.current_practitioner_id()
        AND ctm.revoked_at IS NULL
    )
  );

-- Practitioners can update their own clinic
CREATE POLICY "Practitioners can update their own clinic"
  ON public.clinics FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT clinic_id FROM public.practitioners
      WHERE user_id = auth.uid() AND clinic_id IS NOT NULL
    )
  );

-- ============================================================================
-- 13. STORAGE — visit-recordings bucket + policies
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('visit-recordings', 'visit-recordings', false);

-- Patient uploads
CREATE POLICY "Users can upload own recordings" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'visit-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Patient reads
CREATE POLICY "Users can view own recordings" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'visit-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Patient deletes
CREATE POLICY "Users can delete own recordings" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'visit-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Practitioner uploads (GP records on behalf of patient)
CREATE POLICY "Practitioners can upload recordings" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'visit-recordings'
    AND public.current_practitioner_id() IS NOT NULL
  );

-- Practitioner reads recordings they uploaded
CREATE POLICY "Practitioners can read recordings they uploaded" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'visit-recordings'
    AND public.current_practitioner_id() IS NOT NULL
  );

-- ============================================================================
-- DONE ✅
-- ============================================================================
-- Next steps:
--   1. Deploy edge functions: supabase functions deploy
--   2. Set secrets:
--      supabase secrets set GEMINI_API_KEY=your_key
--      supabase secrets set DEEPGRAM_API_KEY=your_key
--      supabase secrets set RESEND_API_KEY=your_key
--      supabase secrets set APP_URL=https://app.clarityhealth.au
--   3. Connect repo to Vercel and deploy frontend
-- ============================================================================
