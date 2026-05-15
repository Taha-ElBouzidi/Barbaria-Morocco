/**
 * Sprint 2 , Gift box data fetchers. Public reads return only published
 * boxes. Items are joined to product_translations + first product image.
 */

import { createServerClient } from "@/lib/supabase/server";
import type {
  GiftBoxSummary,
  GiftBoxDetail,
  LocaleCode,
  CategorySlug,
  ProductSummary,
} from "./types";

// PostgREST + supabase-js can return embedded category as either a single
// object (`{slug}`) or an array (`[{slug}]`) or null, depending on the
// detected cardinality and on whether the join resolved. We normalise both
// shapes via firstOf().
type EmbeddedCategory = { slug: string } | Array<{ slug: string }> | null;
type GiftBoxRow = {
  id: string;
  slug: string;
  hero_image_path: string | null;
  default_quantity_min: number;
  is_customizable: boolean;
  sort_order: number;
  category: EmbeddedCategory;
  translations: Array<{ name: string; tagline: string | null; story_intro: string | null }>;
  items: Array<{ product_id: string }>;
};

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

const GIFT_BOX_SELECT = `
  id,
  slug,
  hero_image_path,
  default_quantity_min,
  is_customizable,
  sort_order,
  category:categories ( slug ),
  translations:gift_box_translations!inner ( locale, name, tagline, story_intro ),
  items:gift_box_items ( product_id )
`;

function rowToSummary(row: GiftBoxRow): GiftBoxSummary {
  const t = row.translations[0] ?? { name: row.slug, tagline: null, story_intro: null };
  const cat = firstOf(row.category);
  const catSlug = cat?.slug ?? "cosmetiques";
  return {
    id: row.id,
    slug: row.slug,
    categorySlug: catSlug as CategorySlug,
    heroImage: row.hero_image_path,
    defaultQuantityMin: row.default_quantity_min,
    isCustomizable: row.is_customizable,
    name: t.name ?? row.slug,
    tagline: t.tagline,
    storyIntro: t.story_intro,
    itemCount: row.items.length,
  };
}

export async function getGiftBoxesByCategory(
  categorySlug: CategorySlug,
  locale: LocaleCode
): Promise<GiftBoxSummary[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("gift_boxes")
    .select(GIFT_BOX_SELECT)
    .eq("status", "published")
    .eq("category.slug", categorySlug)
    .eq("translations.locale", locale)
    .order("sort_order");

  if (error || !data) return [];

  // The `category.slug = X` server-side filter is unreliable across PostgREST
  // versions, so we filter client-side using the normalised shape. Defensive
  // against the embedded category being null, an object, or an array.
  return (data as unknown as GiftBoxRow[])
    .filter((r) => firstOf(r.category)?.slug === categorySlug)
    .map(rowToSummary);
}

export async function getGiftBoxBySlug(
  slug: string,
  locale: LocaleCode
): Promise<GiftBoxDetail | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("gift_boxes")
    .select(GIFT_BOX_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as GiftBoxRow;
  const summary = rowToSummary(row);

  // Resolve item ProductSummary objects.
  const productIds = row.items.map((i) => i.product_id);
  if (productIds.length === 0) {
    return { ...summary, items: [] };
  }

  const { data: prodRows } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      ritual_id,
      moq,
      formats,
      lead,
      origin,
      ritual_label,
      hero,
      subcategory:ritual_subcategories ( slug ),
      translations:product_translations!inner ( locale, name, short, lede ),
      images:product_images ( path, alt_text, sort_order )
    `
    )
    .in("id", productIds)
    .eq("status", "published")
    .eq("translations.locale", locale);

  type ProdRow = {
    slug: string;
    ritual_id: string;
    moq: number;
    formats: string[];
    lead: string;
    origin: string | null;
    ritual_label: string | null;
    hero: boolean;
    subcategory: { slug: string } | Array<{ slug: string }> | null;
    translations: Array<{ name: string; short: string; lede: string | null }>;
    images: Array<{ path: string; alt_text: string | null; sort_order: number }>;
  };
  const items: ProductSummary[] = ((prodRows ?? []) as unknown as ProdRow[]).map((p) => {
    const t = p.translations[0] ?? { name: p.slug, short: "", lede: null };
    const sortedImages = [...p.images].sort((a, b) => a.sort_order - b.sort_order);
    return {
      slug: p.slug,
      ritualId: p.ritual_id as ProductSummary["ritualId"],
      subcategorySlug: firstOf(p.subcategory)?.slug ?? null,
      moq: p.moq,
      formats: p.formats,
      lead: p.lead,
      origin: p.origin,
      ritualLabel: p.ritual_label,
      hero: p.hero,
      name: t.name,
      short: t.short,
      lede: t.lede,
      heroImage: sortedImages[0]?.path ?? null,
      tags: [],
    };
  });

  return { ...summary, items };
}
