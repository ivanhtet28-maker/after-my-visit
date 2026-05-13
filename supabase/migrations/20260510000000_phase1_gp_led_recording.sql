-- Phase 1: GP-led recording with approval flow
-- Adds: clinics, practitioners tables; visit columns for approval + source tracking

-- ============================================================================
-- 1. CLINICS
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

-- Any authenticated user can read clinic info (needed for patient signup via clinic QR + practitioner clinic membership lookups)
CREATE POLICY "Authenticated users can read clinics"
  ON public.clinics FOR SELECT
  TO authenticated
  USING (true);

-- Writes restricted to service role for now (admin tools will manage clinics in Phase 1+)
-- No public INSERT/UPDATE/DELETE policy — service role bypasses RLS

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 2. PRACTITIONERS
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

-- Practitioner can view/update their own record
CREATE POLICY "Practitioners can view own record"
  ON public.practitioners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can update own record"
  ON public.practitioners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Practitioner can insert their own record at signup
CREATE POLICY "Practitioners can insert own record"
  ON public.practitioners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- "Patients can view practitioners who treated them" policy is created LATER —
-- it references visits.created_by_practitioner_id which doesn't exist until
-- the ALTER TABLE in section 3 runs.

CREATE TRIGGER update_practitioners_updated_at
  BEFORE UPDATE ON public.practitioners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: is the auth user a practitioner?
CREATE OR REPLACE FUNCTION public.current_practitioner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.practitioners WHERE user_id = auth.uid() LIMIT 1
$$;

-- ============================================================================
-- 3. VISITS — new columns
-- ============================================================================

ALTER TABLE public.visits
  ADD COLUMN gp_consent_given boolean DEFAULT false,
  ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  ADD COLUMN created_by_practitioner_id uuid REFERENCES public.practitioners(id) ON DELETE SET NULL,
  ADD COLUMN approved_at timestamptz,
  ADD COLUMN approved_by uuid REFERENCES public.practitioners(id) ON DELETE SET NULL,
  ADD COLUMN source text DEFAULT 'patient_recorded'
    CHECK (source IN ('native_recording', 'chrome_extension_paste', 'patient_recorded'));

CREATE INDEX idx_visits_created_by_practitioner ON public.visits(created_by_practitioner_id);
CREATE INDEX idx_visits_clinic_id ON public.visits(clinic_id);
CREATE INDEX idx_visits_approved_at ON public.visits(approved_at);

-- Status values now include 'pending_approval' and 'approved' alongside existing ones.
-- Existing rows have status values like 'draft', 'processing', 'transcribed', 'complete', 'error'.
-- Backfill: mark existing complete visits as approved (they were patient-led, treat as auto-approved fallback)
UPDATE public.visits
  SET source = 'patient_recorded',
      approved_at = updated_at
  WHERE status = 'complete' AND approved_at IS NULL;

-- ============================================================================
-- 4. VISITS — extended RLS for practitioner access
-- ============================================================================

-- Existing patient policies remain (auth.uid() = user_id).
-- Add practitioner-side policies so GPs/practitioners can manage visits they create.

CREATE POLICY "Practitioners can view visits they created"
  ON public.visits FOR SELECT
  TO authenticated
  USING (
    created_by_practitioner_id IS NOT NULL
    AND created_by_practitioner_id = public.current_practitioner_id()
  );

CREATE POLICY "Practitioners can insert visits they create"
  ON public.visits FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_practitioner_id = public.current_practitioner_id()
  );

CREATE POLICY "Practitioners can update visits they created"
  ON public.visits FOR UPDATE
  TO authenticated
  USING (
    created_by_practitioner_id = public.current_practitioner_id()
  );

-- Patients can read practitioner records (needed for visit display: "Dr Liu approved this")
-- Limited to practitioners who created visits for them. Phase 3 will broaden via care_team_members.
-- Defined here (not in section 2) because it references visits.created_by_practitioner_id, added above.
CREATE POLICY "Patients can view practitioners who treated them"
  ON public.practitioners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visits
      WHERE visits.created_by_practitioner_id = practitioners.id
        AND visits.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. ACTION_ITEMS + MEDICATIONS — practitioner read access for their visits
-- ============================================================================

-- Practitioners need to see action_items + medications generated for visits they created
-- so the review/approve UI can show the full summary.

CREATE POLICY "Practitioners can view action_items for their visits"
  ON public.action_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visits
      WHERE visits.id = action_items.visit_id
        AND visits.created_by_practitioner_id = public.current_practitioner_id()
    )
  );

CREATE POLICY "Practitioners can view medications for their visits"
  ON public.medications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.visits
      WHERE visits.id = medications.visit_id
        AND visits.created_by_practitioner_id = public.current_practitioner_id()
    )
  );

-- ============================================================================
-- 6. STORAGE — practitioner uploads to visit-recordings
-- ============================================================================

-- Existing storage policy is user-scoped: auth.uid()::text = (storage.foldername(name))[1]
-- That breaks for GP-led recordings where the file path is keyed by patient user_id but uploaded by the GP.
-- Add a new policy: practitioners can upload to ANY patient folder.

CREATE POLICY "Practitioners can upload recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'visit-recordings'
    AND public.current_practitioner_id() IS NOT NULL
  );

CREATE POLICY "Practitioners can read recordings they uploaded"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'visit-recordings'
    AND public.current_practitioner_id() IS NOT NULL
  );
