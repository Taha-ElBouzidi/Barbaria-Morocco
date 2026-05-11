import type { Product } from "./products";

export interface InquiryFormData {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  quantity: string;
  eventDate: string;
  occasion: string;
  message: string;
  locale: string;
}

const MAX_BODY = 1800;
const RECIPIENT = "concierge@barbariamorocco.com";

export interface MailtoItem { product: Product; qty: number; }

export function buildMailto(form: InquiryFormData, items: MailtoItem[]): string {
  const lang = form.locale === "fr" ? "fr" : "en";
  const subject = `B2B Inquiry: ${form.company || form.contactName || "Maison"} (${items.length} item(s))`;

  const lines: string[] = [];
  lines.push("BARBARIA · B2B Inquiry");
  lines.push("");
  lines.push("── Maison ──────────────");
  lines.push(`Company:      ${form.company}`);
  lines.push(`Contact:      ${form.contactName}`);
  lines.push(`Email:        ${form.email}`);
  lines.push(`Phone:        ${form.phone}`);
  lines.push("");
  lines.push("── Occasion ────────────");
  lines.push(`Quantity:     ${form.quantity}`);
  lines.push(`Event date:   ${form.eventDate}`);
  lines.push(`Occasion:     ${form.occasion}`);
  lines.push(`Locale:       ${form.locale}`);
  lines.push("");
  lines.push("── Message ─────────────");
  lines.push(form.message || "(none)");
  lines.push("");
  lines.push(`── Inquiry list (${items.length}) ──`);
  const trimmed = items.slice(0, 20);
  for (const { product, qty } of trimmed) {
    lines.push(`• ${product.name[lang]} x ${qty} (MOQ ${product.moq}, lead ${product.lead}) [${product.id}]`);
  }
  if (items.length > trimmed.length) {
    lines.push(`...and ${items.length - trimmed.length} more (full list available on request)`);
  }

  const body = lines.join("\n");
  const safeBody = body.length > MAX_BODY ? body.slice(0, MAX_BODY) + "\n[truncated]" : body;
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}
