/**
 * SLICE 12 NOTE: This file returns locale-resolved flat shapes.
 * `name`, `short`, and `lede` are plain strings for the requested locale —
 * NOT the `{ en: string; fr: string }` objects that lib/products.ts provides.
 * Every consumer that destructures `product.name.en` or `product.name.fr`
 * must be updated to use `product.name` directly (already resolved).
 */

import { createServerClient } from "@/lib/supabase/server";
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
      ritual_id,
      subcategory:ritual_subcategories ( slug ),
      moq,
      formats,
      lead,
      origin,
      ritual_label,
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
 * Fetch all published products in a ritual world, locale-resolved, sorted
 * by hero-first then by slug.
 */
export async function getProductsByRitual(
  ritualId: "hammam" | "botanical" | "heritage",
  locale: LocaleCode
): Promise<ProductSummary[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      slug,
      ritual_id,
      subcategory:ritual_subcategories ( slug ),
      moq,
      formats,
      lead,
      origin,
      ritual_label,
      hero,
      translations:product_translations!inner ( locale, name, short, lede ),
      images:product_images ( path, sort_order ),
      facet_links:product_facets ( facet:facets ( type, value_en, value_fr ) )
    `)
    .eq("ritual_id", ritualId)
    .eq("status", "published")
    .eq("translations.locale", locale)
    .order("hero", { ascending: false })
    .order("slug");

  if (error || !data) return [];
  return data.map((row) => shapeProductSummary(row, locale));
}

/**
 * Pre-render helper: list every published product slug for generateStaticParams.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "published");
  if (error || !data) return [];
  return data.map((p) => p.slug);
}

/**
 * Minimal lookup used by the inquiry drawer / sidebar to render products
 * a user has added to their inquiry list. Returns a map keyed by slug
 * (which is what gets stored in localStorage as the productId).
 */
export async function getMinimalProductMap(
  locale: LocaleCode
): Promise<Map<string, { name: string; image: string | null }>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      slug,
      translations:product_translations!inner ( locale, name ),
      images:product_images ( path, sort_order )
    `)
    .eq("status", "published")
    .eq("translations.locale", locale);

  const map = new Map<string, { name: string; image: string | null }>();
  if (error || !data) return map;
  for (const row of data) {
    const name = (row.translations as any)[0]?.name ?? row.slug;
    const sortedImages = [...((row.images as any[]) ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    map.set(row.slug, { name, image: sortedImages[0]?.path ?? null });
  }
  return map;
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
    ritualId: row.ritual_id,
    subcategorySlug: row.subcategory?.slug ?? null,
    moq: row.moq,
    formats: row.formats ?? [],
    lead: row.lead,
    origin: row.origin,
    ritualLabel: row.ritual_label,
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
