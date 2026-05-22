// Auto-reply sent to the buyer confirming we received their inquiry.
// Locale-aware (FR default, EN if the form was submitted in /en).
// Short, warm acknowledgement + 24h SLA + full house contact footer.

import { CLIENT_DATA } from "@/lib/legal/client-data";

export interface BuyerEmailPayload {
  contactName: string;
  company: string;
  locale: "fr" | "en";
}

const COPY = {
  fr: {
    subject: "Nous avons bien reçu votre demande",
    greeting: (name: string) => `Bonjour ${name},`,
    body: (company: string) =>
      `Nous vous remercions de l'intérêt que vous portez à Barbaria Morocco. Votre demande pour ${company} a bien été reçue et sera étudiée avec soin par notre équipe.`,
    sla: "Notre conciergerie vous reviendra sous 24 heures ouvrées avec une proposition détaillée et un devis adapté à votre projet.",
    closing: "Dans l'attente du plaisir de vous compter parmi nos partenaires,",
    signature: "L'équipe Barbaria Morocco",
    tagline:
      "Maison de cosmétiques et d'épicerie fine d'exception, Casablanca.",
  },
  en: {
    subject: "We have received your request",
    greeting: (name: string) => `Dear ${name},`,
    body: (company: string) =>
      `Thank you for your interest in Barbaria Morocco. Your request on behalf of ${company} has been received and will be reviewed with care by our team.`,
    sla: "Our concierge will get back to you within 24 working hours with a tailored proposal and quote.",
    closing: "We look forward to welcoming you among our partners,",
    signature: "The Barbaria Morocco Team",
    tagline:
      "A Casablanca house of exceptional cosmetics and fine épicerie.",
  },
} as const;

// Public-facing contact info rendered in every transactional email footer.
// Phones must match the contact page (gérante + commercial line).
const FOOTER_CONTACT = {
  email: "contact@barbariamorocco.com",
  phone1: "+212 6 59 65 88 63",
  phone2: "+212 6 17 83 04 10",
  website: "barbariamorocco.com",
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Split the bilingual address into two visual lines: street/building, then
// district/city/country. The source string has commas; we cut on the
// "Quartier" segment which is the consistent split point.
function splitAddress(full: string): [string, string] {
  const idx = full.indexOf(", Quartier ");
  if (idx === -1) return [full, ""];
  return [full.slice(0, idx), full.slice(idx + 2)];
}

export function buyerEmailSubject(payload: BuyerEmailPayload): string {
  return COPY[payload.locale].subject;
}

export function buyerEmailHtml(payload: BuyerEmailPayload): string {
  const c = COPY[payload.locale];
  const [addrLine1, addrLine2] = splitAddress(
    CLIENT_DATA.fullAddress[payload.locale]
  );

  return `<!DOCTYPE html><html><body style="font-family:Georgia,'Cormorant Garamond',serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:32px 24px;line-height:1.6;background:#fff;">
<p style="font-size:16px;margin:0 0 16px 0;">${c.greeting(escapeHtml(payload.contactName))}</p>
<p style="font-size:15px;margin:0 0 16px 0;">${c.body(escapeHtml(payload.company))}</p>
<p style="font-size:15px;margin:0 0 24px 0;">${c.sla}</p>
<p style="font-size:15px;margin:0 0 8px 0;font-style:italic;">${c.closing}</p>
<p style="font-size:15px;margin:0 0 32px 0;font-weight:bold;color:#7a5230;">${c.signature}</p>
<hr style="border:none;border-top:1px solid #e8dfd0;margin:24px 0;">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#888;text-align:center;line-height:1.7;">
<div style="font-family:Georgia,serif;font-weight:600;font-size:13px;color:#5a3a1f;letter-spacing:0.04em;">Barbaria Morocco</div>
<div style="margin-bottom:12px;">${escapeHtml(c.tagline)}</div>
<div style="margin:2px 0;"><a href="mailto:${FOOTER_CONTACT.email}" style="color:#7a5230;text-decoration:none;">${FOOTER_CONTACT.email}</a></div>
<div style="margin:2px 0;">${FOOTER_CONTACT.phone1} &nbsp;&middot;&nbsp; ${FOOTER_CONTACT.phone2}</div>
<div style="margin:2px 0;">${escapeHtml(addrLine1)}</div>
<div style="margin:2px 0;">${escapeHtml(addrLine2)}</div>
<div style="margin:2px 0;"><a href="https://${FOOTER_CONTACT.website}" style="color:#7a5230;text-decoration:none;">${FOOTER_CONTACT.website}</a></div>
</div>
</body></html>`;
}

export function buyerEmailText(payload: BuyerEmailPayload): string {
  const c = COPY[payload.locale];
  const [addrLine1, addrLine2] = splitAddress(
    CLIENT_DATA.fullAddress[payload.locale]
  );

  return [
    c.greeting(payload.contactName),
    "",
    c.body(payload.company),
    "",
    c.sla,
    "",
    c.closing,
    c.signature,
    "",
    "Barbaria Morocco",
    c.tagline,
    "",
    FOOTER_CONTACT.email,
    `${FOOTER_CONTACT.phone1}  ${FOOTER_CONTACT.phone2}`,
    addrLine1,
    addrLine2,
    `https://${FOOTER_CONTACT.website}`,
  ].join("\n");
}
