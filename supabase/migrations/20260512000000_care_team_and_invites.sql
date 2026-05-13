-- Phase 1 (continued): practitioner-initiated invite links + care team + audit log
-- Establishes the practitioner ↔ patient relationship that gates summary delivery.
--
-- Flow:
--   1. Practitioner generates an invite (QR or link encoding the token).
--   2. Patient lands on /care/:token, signs in or signs up, claims it.
--   3. care_team_members row is created. Practitioner can now record consults
--      under that patient; patient receives approved summaries on their dashboard.
--   4. Every read of a patient profile/visit by a practitioner is logged.

-- ============================================================================
-- 1. PRACTITIONER_INVITES
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

-- At most one active evergreen invite per practitioner — the one printed on cards
CREATE UNIQUE INDEX idx_practitioner_invites_one_evergreen
  ON public.practitioner_invites(practitioner_id)
  WHERE is_evergreen = true AND revoked_at IS NULL;

ALTER TABLE public.practitioner_invites ENABLE ROW LEVEL SECURITY;

-- Practitioner can manage their own invites
CREATE POLICY "Practitioners can view own invites"
  ON public.practitioner_invites FOR SELECT
  TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

CREATE POLICY "Practitioners can revoke own invites"
  ON public.practitioner_invites FOR UPDATE
  TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

-- Inserts go through the generate-practitioner-invite edge function (service role).
-- Token lookups for unauthenticated patients also go through an edge function
-- (lookup-practitioner-invite) so the table itself stays closed.

-- ============================================================================
-- 2. CARE_TEAM_MEMBERS
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

-- One active link per patient/practitioner pair
CREATE UNIQUE INDEX idx_care_team_unique_active
  ON public.care_team_members(patient_id, practitioner_id)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_care_team_patient ON public.care_team_members(patient_id);
CREATE INDEX idx_care_team_practitioner ON public.care_team_members(practitioner_id);

ALTER TABLE public.care_team_members ENABLE ROW LEVEL SECURITY;

-- Patient can see their own care team
CREATE POLICY "Patients can view own care team"
  ON public.care_team_members FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Patient can revoke (UPDATE setting revoked_at)
CREATE POLICY "Patients can revoke own care team members"
  ON public.care_team_members FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid());

-- Practitioner can see their own care-team rows
CREATE POLICY "Practitioners can view their care team rows"
  ON public.care_team_members FOR SELECT
  TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

-- Inserts handled by claim-practitioner-invite edge function (service role).

-- ============================================================================
-- 3. ACCESS_LOGS — mandatory audit (Privacy Act 1988)
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
    'care_team_revoke'
  )),
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'care_team' CHECK (source IN ('care_team', 'invite_link'))
);

CREATE INDEX idx_access_logs_patient ON public.access_logs(patient_id, accessed_at DESC);
CREATE INDEX idx_access_logs_practitioner ON public.access_logs(practitioner_id, accessed_at DESC);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Patient can see their own audit log
CREATE POLICY "Patients can view own access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Practitioner can see what they accessed
CREATE POLICY "Practitioners can view their access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (practitioner_id = public.current_practitioner_id());

-- Inserts only via service role.

-- ============================================================================
-- 4. CROSS-TABLE POLICIES — practitioners <-> profiles via care team
-- ============================================================================

-- Practitioner reads patient profile when on the care team
CREATE POLICY "Practitioners can view care-team patient profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.patient_id = profiles.id
        AND ctm.practitioner_id = public.current_practitioner_id()
        AND ctm.revoked_at IS NULL
    )
  );

-- Patient reads practitioner profile for anyone on their care team
-- (existing policy "Patients can view practitioners who treated them" only
-- covers practitioners with at least one created visit. Care-team membership
-- alone should be enough — they may not have recorded yet.)
CREATE POLICY "Patients can view care-team practitioners"
  ON public.practitioners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.practitioner_id = practitioners.id
        AND ctm.patient_id = auth.uid()
        AND ctm.revoked_at IS NULL
    )
  );

-- ============================================================================
-- 5. VISIT POLICIES — practitioners on care team can read approved visits
-- ============================================================================

-- The existing policy "Practitioners can view visits they created" stays.
-- This new policy lets care-team practitioners read APPROVED summaries
-- the patient has accumulated from other practitioners (continuity of care).
-- Raw transcripts remain gated by the transcript_access flag and are read
-- through a SECURITY DEFINER RPC in a future migration when allied-health
-- read-views are built.
CREATE POLICY "Care-team practitioners can view approved visits"
  ON public.visits FOR SELECT
  TO authenticated
  USING (
    approved_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.patient_id = visits.user_id
        AND ctm.practitioner_id = public.current_practitioner_id()
        AND ctm.revoked_at IS NULL
    )
  );
