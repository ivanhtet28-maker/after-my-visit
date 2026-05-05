// GP Portal admin allowlist.
// Emails in this list can access the GP portal routes (/gp/*) after signing in via Supabase Auth.
// This is a temporary mechanism until proper clinic auth + RBAC is implemented with the `clinic_gps` table.

export const GP_ADMIN_EMAILS = [
  "ivan.htet28@gmail.com",
];

export const isGpAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return GP_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
};
