/**
 * Sprint 2.6 , Inquiry is box-level. The mailto body lists each box line
 * (curated or custom), its quantity, MOQ, and (for custom) the resolved
 * piece names so the concierge can price without opening the site.
 */

export interface InquiryFormData {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  eventDate: string;
  occasion: string;
  message: string;
  locale: string;
}

export interface MailtoLine {
  name: string;
  qty: number;
  minQty: number;
  isCustom: boolean;
  /** Resolved product names if the line is a custom composition, in order. */
  compositionNames?: string[];
}

const MAX_BODY = 1800;
const RECIPIENT = "concierge@barbariamorocco.com";

export function buildMailto(form: InquiryFormData, lines: MailtoLine[]): string {
  const totalUnits = lines.reduce((sum, l) => sum + l.qty, 0);
  const subject = `B2B Inquiry: ${form.company || form.contactName || "House"} (${lines.length} box${lines.length === 1 ? "" : "es"}, ${totalUnits} units)`;

  const out: string[] = [];
  out.push("BARBARIA · B2B Inquiry");
  out.push("");
  out.push("── House ───────────────");
  out.push(`Company:      ${form.company}`);
  out.push(`Contact:      ${form.contactName}`);
  out.push(`Email:        ${form.email}`);
  out.push(`Phone:        ${form.phone}`);
  out.push("");
  out.push("── Occasion ────────────");
  out.push(`Event date:   ${form.eventDate}`);
  out.push(`Occasion:     ${form.occasion}`);
  out.push(`Locale:       ${form.locale}`);
  out.push("");
  out.push("── Message ─────────────");
  out.push(form.message || "(none)");
  out.push("");
  out.push(`── Boxes (${lines.length}, ${totalUnits} units total) ──`);
  const trimmed = lines.slice(0, 20);
  for (const line of trimmed) {
    const tag = line.isCustom ? "Custom" : "Curated";
    out.push(`• [${tag}] ${line.name} × ${line.qty} (MOQ ${line.minQty})`);
    if (line.isCustom && line.compositionNames?.length) {
      for (const piece of line.compositionNames) {
        out.push(`    - ${piece}`);
      }
    }
  }
  if (lines.length > trimmed.length) {
    out.push(`...and ${lines.length - trimmed.length} more (full list available on request)`);
  }

  const body = out.join("\n");
  const safeBody = body.length > MAX_BODY ? body.slice(0, MAX_BODY) + "\n[truncated]" : body;
  return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}
