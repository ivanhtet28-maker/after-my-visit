-- Allow authenticated users to create their own clinic during onboarding.
-- Risk is low: clinics are public-readable + the practitioner row links the
-- creator to the clinic, so spam clinics are traceable. Phase 2 will add
-- moderation if abuse becomes an issue.
CREATE POLICY "Authenticated users can create clinics"
  ON public.clinics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Practitioners need to update their own clinic record (e.g. add logo, edit
-- consent text). For v1, anyone authenticated can update a clinic they
-- belong to via their practitioner row.
CREATE POLICY "Practitioners can update their own clinic"
  ON public.clinics FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT clinic_id FROM public.practitioners
      WHERE user_id = auth.uid() AND clinic_id IS NOT NULL
    )
  );
