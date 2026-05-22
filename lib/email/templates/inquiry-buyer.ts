// Auto-reply sent to the buyer confirming we received their inquiry.
// Locale-aware (FR default, EN if the form was submitted in /en).
// Intentionally short: warm acknowledgement + 24h SLA + signature.

export interface BuyerEmailPayload {
  contactName: string;
  company: string;
  locale: "fr" | "en";
}

const COPY = {
  fr: {
    subject: "Nous avons bien reçu votre demande — Barbaria",
    greeting: (name: string) => `Bonjour ${name},`,
    body: (company: string) =>
      `Nous vous remercions de l'intérêt que vous portez à Barbaria. Votre demande pour ${company} a bien été reçue et sera étudiée avec soin par notre équipe.`,
    sla: "Notre conciergerie vous reviendra sous 24 heures ouvrées avec une proposition détaillée et un devis adapté à votre projet.",
    closing: "Dans l'attente du plaisir de vous compter parmi nos partenaires,",
    signature: "L'équipe Barbaria",
    footer:
      "Barbaria Morocco — Maison de cosmétiques et d'épicerie fine d'exception, Casablanca.",
  },
  en: {
    subject: "We have received your request — Barbaria",
    greeting: (name: string) => `Dear ${name},`,
    body: (company: string) =>
      `Thank you for your interest in Barbaria. Your request on behalf of ${company} has been received and will be reviewed with care by our team.`,
    sla: "Our concierge will get back to you within 24 working hours with a tailored proposal and quote.",
    closing: "We look forward to welcoming you among our partners,",
    signature: "The Barbaria Team",
    footer:
      "Barbaria Morocco — A Casablanca house of exceptional cosmetics and fine épicerie.",
  },
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buyerEmailSubject(payload: BuyerEmailPayload): string {
  return COPY[payload.locale].subject;
}

export function buyerEmailHtml(payload: BuyerEmailPayload): string {
  const c = COPY[payload.locale];
  return `<!DOCTYPE html><html><body style="font-family:Georgia,'Cormorant Garamond',serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:32px 24px;line-height:1.6;">
<p style="font-size:16px;margin:0 0 16px 0;">${c.greeting(escapeHtml(payload.contactName))}</p>
<p style="font-size:15px;margin:0 0 16px 0;">${c.body(escapeHtml(payload.company))}</p>
<p style="font-size:15px;margin:0 0 24px 0;">${c.sla}</p>
<p style="font-size:15px;margin:0 0 8px 0;font-style:italic;">${c.closing}</p>
<p style="font-size:15px;margin:0 0 32px 0;font-weight:bold;color:#7a5230;">${c.signature}</p>
<hr style="border:none;border-top:1px solid #e8dfd0;margin:24px 0;">
<p style="font-size:12px;color:#888;margin:0;text-align:center;">${c.footer}</p>
</body></html>`;
}

export function buyerEmailText(payload: BuyerEmailPayload): string {
  const c = COPY[payload.locale];
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
    "---",
    c.footer,
  ].join("\n");
}
