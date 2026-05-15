import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";

/**
 * POST /api/inquiry, phase 1 persistence endpoint.
 *
 * Accepts the box-level inquiry payload from the public contact form,
 * validates with Zod, writes one `inquiries` row plus one `inquiry_items`
 * row per box-line, returns the new inquiry id. Email/Resend integration
 * is deferred (TODO_LIST.md) — for now an inquiry lands in Supabase and
 * the maison reads it from /admin/inquiries.
 *
 * Auth: anonymous public submit. RLS is bypassed by the service-role
 * client; this route is the single trusted choke point.
 */

const InquiryLineSchema = z.object({
  giftBoxSlug: z.string().min(1).max(120),
  qty: z.number().int().min(1).max(10000),
  minQty: z.number().int().min(1).max(10000),
  isCustom: z.boolean().default(false),
  nameSnapshot: z.string().max(200).optional(),
  composition: z
    .object({
      categorySlug: z.enum(["cosmetiques", "epicerie_fine"]),
      productSlugs: z.array(z.string().max(120)).max(20),
    })
    .nullish(),
});

const InquirySchema = z.object({
  company: z.string().trim().min(1).max(200),
  contactName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().nullable(),
  occasion: z.string().trim().max(120).optional().nullable(),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .nullable()
    .or(z.literal("")),
  message: z.string().trim().max(2000).optional().nullable(),
  locale: z.enum(["en", "fr"]).default("fr"),
  honeypot: z.string().max(200).optional(),
  lines: z.array(InquiryLineSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = InquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Silent honeypot trap. Bots fill the hidden field; we pretend success.
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true, id: null });
  }

  const supabase = createServiceRoleClient();

  // Resolve gift_box slugs to ids in one round-trip. Slugs that don't
  // resolve (renamed boxes, typos) fall through as null; the row still
  // saves with the snapshot name so the concierge can reconcile.
  const slugs = Array.from(new Set(data.lines.map((l) => l.giftBoxSlug)));
  const { data: boxes } = await supabase
    .from("gift_boxes")
    .select("id, slug")
    .in("slug", slugs);
  const slugToId = new Map((boxes ?? []).map((b: { id: string; slug: string }) => [b.slug, b.id]));

  const sourceUrl = req.headers.get("referer") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const { data: inquiry, error: inqErr } = await supabase
    .from("inquiries")
    .insert({
      company: data.company,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone || null,
      event_date: data.eventDate || null,
      occasion: data.occasion || null,
      message: data.message || null,
      locale: data.locale,
      source_url: sourceUrl,
      user_agent: userAgent,
      status: "new",
    })
    .select("id")
    .single();

  if (inqErr || !inquiry) {
    console.error("[/api/inquiry] insert inquiries failed:", inqErr?.message);
    return NextResponse.json(
      { ok: false, error: "Could not save the inquiry. Please try again." },
      { status: 500 }
    );
  }

  const itemRows = data.lines.map((line, i) => ({
    inquiry_id: inquiry.id,
    gift_box_id: slugToId.get(line.giftBoxSlug) ?? null,
    is_custom: line.isCustom,
    composition: line.composition
      ? {
          categorySlug: line.composition.categorySlug,
          productSlugs: line.composition.productSlugs,
          nameSnapshot: line.nameSnapshot ?? null,
          minQty: line.minQty,
          giftBoxSlug: line.giftBoxSlug,
        }
      : { nameSnapshot: line.nameSnapshot ?? null, minQty: line.minQty, giftBoxSlug: line.giftBoxSlug },
    qty: line.qty,
    line_index: i,
  }));

  const { error: itemErr } = await supabase.from("inquiry_items").insert(itemRows);
  if (itemErr) {
    console.error("[/api/inquiry] insert inquiry_items failed:", itemErr.message);
    // Don't 500 here — the parent inquiry is saved; the concierge can
    // recover the line list from the email/snapshot.
  }

  return NextResponse.json({ ok: true, id: inquiry.id });
}
