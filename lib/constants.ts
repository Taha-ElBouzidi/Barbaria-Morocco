// Production origin. Set NEXT_PUBLIC_BASE_URL in Vercel when the real
// domain is wired up; until then the Vercel preview URL is the fallback
// so every canonical, sitemap entry, OG meta, and JSON-LD URL stays
// consistent across dev/preview without manual edits.
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://barbaria-morocco.vercel.app";
export const CONTACT_EMAIL = "Contact@barbariamorocco.com";
export const CONTACT_PHONE = "+212659658863";
export const CONTACT_PHONE_TEL = "tel:+212659658863";
export const WHATSAPP_NUMBER = "212659658863";

// Social handles. Real values to be confirmed by the house; current set
// is the placeholder mix in use across the site so the UI has somewhere
// to point. See .project/TODO_LIST.md "Real contact data" for the swap.
export const INSTAGRAM_HANDLE = "barbaria_00";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const LINKEDIN_URL = "https://www.linkedin.com/company/barbaria-morocco";
export const X_HANDLE = "barbariamorocco";
export const X_URL = `https://x.com/${X_HANDLE}`;
