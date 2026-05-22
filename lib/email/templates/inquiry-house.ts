// Email sent to the house concierge when a B2B inquiry arrives.
// Intentionally plain HTML + inline styles so it renders well in
// Gmail, Outlook web, and Apple Mail. No external CSS, no images.

import { BASE_URL } from "@/lib/constants";

export interface HouseEmailPayload {
  inquiryId: string;
  company: string;
  contactName: string;
  email: string;
  phone: string | null;
  occasion: string | null;
  eventDate: string | null;
  message: string | null;
  locale: "fr" | "en";
  lines: Array<{
    giftBoxSlug: string;
    nameSnapshot?: string | null;
    qty: number;
    minQty: number;
    isCustom: boolean;
    composition?: {
      categorySlug: string;
      productSlugs: string[];
    } | null;
  }>;
}

export function houseEmailSubject(payload: HouseEmailPayload): string {
  const base = `[Inquiry] ${payload.company}`;
  return payload.occasion ? `${base} (${payload.occasion})` : base;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function houseEmailHtml(payload: HouseEmailPayload): string {
  const adminUrl = `${BASE_URL}/admin/inquiries/${payload.inquiryId}`;
  const linesHtml = payload.lines
    .map((l, i) => {
      const name = l.nameSnapshot ?? l.giftBoxSlug;
      const custom = l.isCustom ? " <em>(sur mesure)</em>" : "";
      const comp = l.composition
        ? `<br><span style="color:#666;font-size:13px;">${escapeHtml(l.composition.categorySlug)}: ${l.composition.productSlugs.map(escapeHtml).join(", ")}</span>`
        : "";
      return `<li style="margin-bottom:8px;"><strong>${escapeHtml(name)}</strong> × ${l.qty}${custom}${comp}</li>`;
    })
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;max-width:640px;margin:0 auto;padding:24px;">
<h2 style="color:#7a5230;margin-bottom:4px;">Barbaria Morocco, nouvelle demande B2B</h2>
<p style="color:#666;margin-top:0;">Reçue depuis barbariamorocco.com (${payload.locale.toUpperCase()})</p>

<h3 style="margin-bottom:4px;">Contact</h3>
<p style="margin:0 0 16px 0;line-height:1.6;">
<strong>${escapeHtml(payload.company)}</strong><br>
${escapeHtml(payload.contactName)}<br>
<a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>${payload.phone ? `<br>${escapeHtml(payload.phone)}` : ""}
</p>

${payload.occasion || payload.eventDate ? `<h3 style="margin-bottom:4px;">Occasion</h3>
<p style="margin:0 0 16px 0;">
${payload.occasion ? escapeHtml(payload.occasion) : ""}${payload.occasion && payload.eventDate ? " &middot; " : ""}${payload.eventDate ? `<em>${escapeHtml(payload.eventDate)}</em>` : ""}
</p>` : ""}

<h3 style="margin-bottom:4px;">Coffrets demandés</h3>
<ul style="margin:0 0 16px 0;padding-left:20px;line-height:1.5;">
${linesHtml}
</ul>

${payload.message ? `<h3 style="margin-bottom:4px;">Message</h3>
<blockquote style="border-left:3px solid #c9a059;margin:0 0 16px 0;padding:8px 16px;background:#faf6f0;color:#444;white-space:pre-wrap;">${escapeHtml(payload.message)}</blockquote>` : ""}

<p style="margin-top:24px;">
<a href="${adminUrl}" style="display:inline-block;background:#7a5230;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Ouvrir dans le tableau de bord</a>
</p>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0 12px 0;">
<p style="color:#999;font-size:12px;margin:0;">ID inquiry: ${payload.inquiryId}</p>
</body></html>`;
}

export function houseEmailText(payload: HouseEmailPayload): string {
  const adminUrl = `${BASE_URL}/admin/inquiries/${payload.inquiryId}`;
  const lines = payload.lines
    .map(
      (l) =>
        `  - ${l.nameSnapshot ?? l.giftBoxSlug} × ${l.qty}${l.isCustom ? " (sur mesure)" : ""}${
          l.composition
            ? `\n    ${l.composition.categorySlug}: ${l.composition.productSlugs.join(", ")}`
            : ""
        }`
    )
    .join("\n");

  return [
    "Nouvelle demande B2B reçue depuis barbariamorocco.com",
    `Locale: ${payload.locale.toUpperCase()}`,
    "",
    "CONTACT",
    `  ${payload.company}`,
    `  ${payload.contactName}`,
    `  ${payload.email}`,
    payload.phone ? `  ${payload.phone}` : null,
    "",
    payload.occasion || payload.eventDate ? "OCCASION" : null,
    payload.occasion ? `  ${payload.occasion}` : null,
    payload.eventDate ? `  Date: ${payload.eventDate}` : null,
    payload.occasion || payload.eventDate ? "" : null,
    "COFFRETS",
    lines,
    "",
    payload.message ? "MESSAGE" : null,
    payload.message ? payload.message : null,
    payload.message ? "" : null,
    `Ouvrir: ${adminUrl}`,
    "",
    `Inquiry ID: ${payload.inquiryId}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}
