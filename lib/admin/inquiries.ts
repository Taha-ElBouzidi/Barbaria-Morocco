import { createServiceRoleClient } from "@/lib/supabase/service";

export async function listInquiries(params: {
  status?: string;
  page?: number;
  sort?: string;
}) {
  const supabase = createServiceRoleClient();
  const pageSize = 25;
  const page = Math.max(0, (params.page ?? 1) - 1);

  let q = supabase
    .from("inquiries")
    .select(
      `
      id, company, contact_name, email, status, created_at, locale,
      items:inquiry_items ( id )
    `,
      { count: "exact" }
    );

  if (params.status && params.status !== "all") {
    q = q.eq("status", params.status);
  }

  const ascending = params.sort === "oldest";
  q = q.order("created_at", { ascending });
  q = q.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, count, error } = await q;
  if (error) throw new Error(`listInquiries: ${error.message}`);

  return { data: data ?? [], count: count ?? 0, page: page + 1, pageSize };
}

/**
 * Sprint 2.6+ shape: inquiry_items now carries gift_box_id, is_custom,
 * composition (jsonb), qty, line_index. Legacy product_id remains nullable
 * for old rows that pre-date the migration; new rows leave it null.
 */
export interface AdminInquiryItem {
  id: string;
  qty: number;
  line_index: number;
  is_custom: boolean;
  /** Resolved box name (EN or FR snapshot). */
  boxName: string;
  /** Category slug if known. */
  categorySlug: string | null;
  /** For custom boxes: ordered piece names resolved from product slugs. */
  compositionNames: string[];
  /** For custom boxes: minimum qty stored in composition jsonb. */
  composition: {
    categorySlug?: string;
    productSlugs?: string[];
    nameSnapshot?: string | null;
    minQty?: number;
    giftBoxSlug?: string;
  } | null;
}

export interface AdminInquiry {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string | null;
  occasion: string | null;
  event_date: string | null;
  message: string | null;
  locale: "en" | "fr" | null;
  status: string;
  notes: string | null;
  created_at: string;
  items: AdminInquiryItem[];
}

export async function getInquiryById(id: string): Promise<AdminInquiry | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      `
      id, company, contact_name, email, phone, occasion, event_date, message,
      locale, status, notes, created_at,
      items:inquiry_items (
        id, qty, line_index, is_custom, gift_box_id, composition,
        gift_box:gift_boxes (
          slug,
          translations:gift_box_translations ( locale, name )
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Resolve every product slug found in custom-box compositions in one
  // round-trip so we can render readable names in the detail view.
  const rawItems = (data.items ?? []) as Array<{
    id: string;
    qty: number;
    line_index: number;
    is_custom: boolean;
    gift_box_id: string | null;
    composition: AdminInquiryItem["composition"];
    gift_box: { slug: string; translations: Array<{ locale: string; name: string }> } | Array<{ slug: string; translations: Array<{ locale: string; name: string }> }> | null;
  }>;

  const allSlugs = new Set<string>();
  for (const i of rawItems) {
    if (i.composition?.productSlugs) {
      for (const s of i.composition.productSlugs) allSlugs.add(s);
    }
  }
  const slugToName = new Map<string, string>();
  if (allSlugs.size > 0) {
    const locale = data.locale === "fr" ? "fr" : "en";
    const { data: prods } = await supabase
      .from("products")
      .select(`slug, translations:product_translations!inner ( locale, name )`)
      .in("slug", Array.from(allSlugs))
      .eq("translations.locale", locale);
    for (const p of (prods ?? []) as Array<{ slug: string; translations: Array<{ locale: string; name: string }> }>) {
      slugToName.set(p.slug, p.translations[0]?.name ?? p.slug);
    }
  }

  const items: AdminInquiryItem[] = rawItems
    .sort((a, b) => a.line_index - b.line_index)
    .map((i) => {
      const giftBox = Array.isArray(i.gift_box) ? i.gift_box[0] ?? null : i.gift_box;
      const boxNameFromGB = giftBox?.translations.find((t) => t.locale === (data.locale ?? "en"))?.name
        ?? giftBox?.translations[0]?.name
        ?? giftBox?.slug;
      const boxName =
        boxNameFromGB ?? i.composition?.nameSnapshot ?? i.composition?.giftBoxSlug ?? "(unknown box)";
      const compositionNames = (i.composition?.productSlugs ?? []).map((s) => slugToName.get(s) ?? s);
      return {
        id: i.id,
        qty: i.qty,
        line_index: i.line_index,
        is_custom: i.is_custom,
        boxName,
        categorySlug: i.composition?.categorySlug ?? null,
        compositionNames,
        composition: i.composition,
      };
    });

  return {
    id: data.id,
    company: data.company,
    contact_name: data.contact_name,
    email: data.email,
    phone: data.phone,
    occasion: data.occasion,
    event_date: data.event_date,
    message: data.message,
    locale: data.locale,
    status: data.status,
    notes: data.notes,
    created_at: data.created_at,
    items,
  };
}
