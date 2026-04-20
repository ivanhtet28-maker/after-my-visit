-- Add role column to profiles for doctor/patient distinction
ALTER TABLE public.profiles ADD COLUMN role text NOT NULL DEFAULT 'patient';
