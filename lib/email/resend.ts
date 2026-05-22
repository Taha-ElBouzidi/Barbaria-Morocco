import { Resend } from "resend";

// Singleton wrapper around the Resend client. Returns null if the
// RESEND_API_KEY env var is missing so the inquiry endpoint can fail
// open: the DB write succeeds, the admin still sees the inquiry from
// /admin/inquiries, only the email side-effect is skipped.
let cached: Resend | null = null;

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

// Where outbound transactional mail comes from. Default is Resend's
// onboarding sandbox sender (works without domain verification, fine
// for first-launch). Switch the env var to a verified address on
// mail.barbariamorocco.com once Resend reports the domain green.
export const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL ?? "Barbaria <onboarding@resend.dev>";

// Where the house notification lands. Defaults to the Zoho alias the
// contact aliases all funnel into; override via env if the house wants
// a dedicated inbox like inquiries@.
export const HOUSE_NOTIFY_TO =
  process.env.RESEND_NOTIFY_TO ?? "contact@barbariamorocco.com";
