/**
 * SLICE 12 NOTE: This file returns locale-resolved flat shapes.
 * `name`, `short`, and `lede` are plain strings for the requested locale ,
 * NOT the `{ en: string; fr: string }` objects that lib/products.ts provides.
 * Every consumer that destructures `product.name.en` or `product.name.fr`
 * must be updated to use `product.name` directly (already resolved).
 */

import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { LocaleCode, ProductSummary, ProductDetail } from "./types";

/**
 * Fetch a single product by slug, resolved for the requested locale.
 * Returns null if not found or unpublished.
 *
 * Replaces the legacy `getProduct(id)` from lib/products.ts but returns
 * a locale-resolved shape (flat name/short/lede strings rather than
 * { en, fr } objects).
 */
export async function getProductBySlug(
  slug: string,
  locale: LocaleCode
): Promise<ProductDetail | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      slug,
      moq,
      formats,
      lead,
      origin,
      hero,
      translations:product_translations!inner ( locale, name, short, lede ),
      images:product_images ( path, alt_text, sort_order ),
      steps:product_application_steps ( step_number, locale, title, body ),
      facet_links:product_facets ( facet:facets ( id, type, value_en, value_fr ) )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .single();

  if (error || !data) return null;
  return shapeProductDetail(data, locale);
}

/**
 * Sprint 2 , published products in a category, for the wizard product
 * pickers. Reads category by slug from the `categories` table.
 */
export async function getProductsByCategory(
  categorySlug: string,
  locale: LocaleCode
): Promise<ProductSummary[]> {
  const supabase = await createServerClient();

  // Resolve category id first to avoid embedding a nested filter on the
  // products query (which Postgrest cannot push through).
  const { data: catRow } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (!catRow) return [];

  const { data, error } = await supabase
    .from("products")
    .select(`
      slug,
      moq,
      formats,
      lead,
      origin,
      hero,
      translations:product_translations!inner ( locale, name, short, lede ),
      images:product_images ( path, sort_order ),
      facet_links:product_facets ( facet:facets ( type, value_en, value_fr ) )
    `)
    .eq("category_id", catRow.id)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .order("hero", { ascending: false })
    .order("slug");

  if (error || !data) return [];
  return data.map((row) => shapeProductSummary(row, locale));
}

/**
 * Sprint 2.6 , "Boxes containing this piece" for the PDP. Replaces the
 * legacy related-products row. Capped at 3 results, sorted by sort_order.
 */
export interface BoxContainingProduct {
  slug: string;
  categorySlug: "cosmetiques" | "epicerie_fine";
  heroImage: string | null;
  name: string;
  tagline: string | null;
}

export async function getBoxesContainingProduct(
  productSlug: string,
  locale: LocaleCode
): Promise<BoxContainingProduct[]> {
  const supabase = await createServerClient();
  const { data: prodRow } = await supabase
    .from("products")
    .select("id")
    .eq("slug", productSlug)
    .maybeSingle();
  if (!prodRow) return [];

  const { data, error } = await supabase
    .from("gift_box_items")
    .select(`
      gift_box:gift_boxes!inner (
        id, slug, hero_image_path, status, sort_order, is_customizable,
        category:categories!inner ( slug ),
        translations:gift_box_translations!inner ( locale, name, tagline )
      )
    `)
    .eq("product_id", prodRow.id);

  if (error || !data) return [];

  interface BoxInner {
    id: string;
    slug: string;
    hero_image_path: string | null;
    status: string;
    sort_order: number;
    is_customizable: boolean;
    category: { slug: string } | Array<{ slug: string }> | null;
    translations: Array<{ locale: string; name: string; tagline: string | null }>;
  }
  interface ItemRow {
    gift_box: BoxInner | BoxInner[] | null;
  }

  function firstOf<T>(value: T | T[] | null | undefined): T | null {
    if (value == null) return null;
    if (Array.isArray(value)) return value[0] ?? null;
    return value;
  }

  const result: BoxContainingProduct[] = [];
  for (const row of data as unknown as ItemRow[]) {
    const b = firstOf<BoxInner>(row.gift_box);
    if (!b || b.status !== "published" || b.is_customizable) continue;
    const t = b.translations.find((tr) => tr.locale === locale) ?? b.translations[0];
    const cat = firstOf<{ slug: string }>(b.category);
    result.push({
      slug: b.slug,
      categorySlug: (cat?.slug ?? "cosmetiques") as "cosmetiques" | "epicerie_fine",
      heroImage: b.hero_image_path,
      name: t?.name ?? b.slug,
      tagline: t?.tagline ?? null,
    });
  }
  return result.slice(0, 3);
}

/**
 * Minimal lookup used by the inquiry drawer / sidebar to render products
 * a user has added to their inquiry list. Returns a map keyed by slug
 * (which is what gets stored in localStorage as the productId).
 *
 * Wrapped in `unstable_cache`. This is called from `app/[locale]/layout.tsx`
 * on every public navigation, so the round-trip used to hit Supabase on
 * every page click. Cached for 10 min, tagged "products", admin product
 * mutations call `revalidateTag("products")`.
 */
const _getMinimalProductMap = unstable_cache(
  async (locale: LocaleCode) => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        slug,
        translations:product_translations!inner ( locale, name ),
        images:product_images ( path, sort_order )
      `)
      .eq("status", "published")
      .eq("translations.locale", locale);

    // Return an Array<[slug, entry]> rather than a Map. unstable_cache
    // serializes to JSON, and a Map round-trips to an empty object.
    const entries: Array<[string, { name: string; image: string | null }]> = [];
    if (error || !data) return entries;
    for (const row of data) {
      const name = (row.translations as any)[0]?.name ?? row.slug;
      const sortedImages = [...((row.images as any[]) ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      entries.push([row.slug, { name, image: sortedImages[0]?.path ?? null }]);
    }
    return entries;
  },
  ["minimal-product-map"],
  { tags: ["products"], revalidate: 600 }
);

export async function getMinimalProductMap(
  locale: LocaleCode
): Promise<Map<string, { name: string; image: string | null }>> {
  return new Map(await _getMinimalProductMap(locale));
}

// ---------- shaping helpers ----------

function shapeProductSummary(row: any, locale: LocaleCode): ProductSummary {
  const translation = row.translations?.[0] ?? {};
  const sortedImages = [...(row.images ?? [])].sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const tags: string[] = (row.facet_links ?? [])
    .map((link: any) => {
      const f = link.facet;
      if (!f) return null;
      return locale === "fr" ? f.value_fr : f.value_en;
    })
    .filter(Boolean);

  return {
    slug: row.slug,
    moq: row.moq,
    formats: row.formats ?? [],
    lead: row.lead,
    origin: row.origin,
    hero: !!row.hero,
    name: translation.name ?? row.slug,
    short: translation.short ?? "",
    lede: translation.lede ?? null,
    heroImage: sortedImages[0]?.path ?? null,
    tags,
  };
}

function shapeProductDetail(row: any, locale: LocaleCode): ProductDetail {
  const summary = shapeProductSummary(row, locale);
  const allImages = [...(row.images ?? [])]
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img: any) => ({ path: img.path, altText: img.alt_text ?? null }));
  const steps = (
    (row.steps ?? []) as Array<{
      step_number: number;
      locale: string;
      title: string;
      body: string;
    }>
  )
    .filter((s) => s.locale === locale)
    .sort((a, b) => a.step_number - b.step_number)
    .map((s) => ({ stepNumber: s.step_number, title: s.title, body: s.body }));

  return { ...summary, images: allImages, applicationSteps: steps };
}
