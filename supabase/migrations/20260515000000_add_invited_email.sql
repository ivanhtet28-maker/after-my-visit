-- Add invited_email column to practitioner_invites
-- Stores the specific email an invite was sent to, so we can auto-link
-- when that patient signs up with the same email address.

ALTER TABLE public.practitioner_invites
  ADD COLUMN IF NOT EXISTS invited_email text;

CREATE INDEX IF NOT EXISTS idx_practitioner_invites_invited_email
  ON public.practitioner_invites(invited_email)
  WHERE invited_email IS NOT NULL AND revoked_at IS NULL;
