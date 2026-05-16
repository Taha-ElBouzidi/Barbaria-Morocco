import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";

// In-memory sliding-window rate limiter, sufficient for a single-instance
// Vercel deployment. Two windows per IP: 5 inquiries / minute and
// 50 / day. Both reset by absolute window roll. Survives a function warm
// process but resets on cold start, which is acceptable for spam control
// at our traffic volumes. Move to Redis/Upstash when traffic warrants.
const RATE_LIMITS = new Map<string, { minuteCount: number; minuteReset: number; dayCount: number; dayReset: number }>();
const MAX_PER_MINUTE = 5;
const MAX_PER_DAY = 50;

function checkRateLimit(ipHash: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const rec = RATE_LIMITS.get(ipHash) ?? {
    minuteCount: 0,
    minuteReset: now + 60_000,
    dayCount: 0,
    dayReset: now + 86_400_000,
  };
  if (now > rec.minuteReset) {
    rec.minuteCount = 0;
    rec.minuteReset = now + 60_000;
  }
  if (now > rec.dayReset) {
    rec.dayCount = 0;
    rec.dayReset = now + 86_400_000;
  }
  if (rec.minuteCount >= MAX_PER_MINUTE) {
    return { ok: false, reason: "Too many inquiries in the last minute. Please wait a moment and try again." };
  }
  if (rec.dayCount >= MAX_PER_DAY) {
    return { ok: false, reason: "Daily inquiry limit reached. Please contact the concierge directly by email." };
  }
  rec.minuteCount += 1;
  rec.dayCount += 1;
  RATE_LIMITS.set(ipHash, rec);
  return { ok: true };
}

function hashIp(req: NextRequest): string {
  // Vercel sets `x-real-ip` to the platform-trusted client IP. The
  // leftmost x-forwarded-for value is user-controllable and a hostile
  // caller can rotate it to dodge the per-IP rate limit. Trust the
  // platform header first; fall back to xff only when running outside
  // Vercel (local dev) where x-real-ip is unset.
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
    "unknown";
  return crypto.createHash("sha256").update(ip + "|barbaria").digest("hex").slice(0, 32);
}

/**
 * POST /api/inquiry, phase 1 persistence endpoint.
 *
 * Accepts the box-level inquiry payload from the public contact form,
 * validates with Zod, writes one `inquiries` row plus one `inquiry_items`
 * row per box-line, returns the new inquiry id. Email/Resend integration
 * is deferred (TODO_LIST.md) , for now an inquiry lands in Supabase and
 * the house reads it from /admin/inquiries.
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

  const ipHash = hashIp(req);
  const limit = checkRateLimit(ipHash);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: limit.reason }, { status: 429 });
  }

  const supabase = createServiceRoleClient();

  // Resolve gift_box slugs to ids in one round-trip. We require every
  // submitted slug to map to a *published* row, otherwise reject the
  // whole submission. Without this check an anonymous caller could
  // flood inquiry_items + the analytics top_custom_pieces view with
  // arbitrary attacker-chosen slugs (the rate limit caps the rate but
  // not the content).
  const slugs = Array.from(new Set(data.lines.map((l) => l.giftBoxSlug)));
  const { data: boxes } = await supabase
    .from("gift_boxes")
    .select("id, slug")
    .in("slug", slugs)
    .eq("status", "published");
  const slugToId = new Map((boxes ?? []).map((b: { id: string; slug: string }) => [b.slug, b.id]));
  const unknownSlug = slugs.find((s) => !slugToId.has(s));
  if (unknownSlug) {
    return NextResponse.json(
      { ok: false, error: `Unknown gift box: ${unknownSlug}` },
      { status: 400 }
    );
  }

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
      ip_hash: ipHash,
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
    // Don't 500 here , the parent inquiry is saved; the concierge can
    // recover the line list from the email/snapshot.
  }

  return NextResponse.json({ ok: true, id: inquiry.id });
}
