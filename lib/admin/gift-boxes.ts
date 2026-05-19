import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const GiftBoxSaveSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  categoryId: z.string().uuid(),
  heroImagePath: z.string().nullable().default(null),
  defaultQuantityMin: z.coerce.number().int().min(1).default(5),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isCustomizable: z.boolean().default(false),
  translations: z.object({
    en: z.object({
      name: z.string().min(1),
      tagline: z.string().nullable().default(null),
      storyIntro: z.string().nullable().default(null),
    }),
    fr: z.object({
      name: z.string().min(1),
      tagline: z.string().nullable().default(null),
      storyIntro: z.string().nullable().default(null),
    }),
  }),
  /** Component product IDs in display order. Empty for customizable boxes. */
  itemProductIds: z.array(z.string().uuid()).default([]),
});

export type GiftBoxSaveInput = z.infer<typeof GiftBoxSaveSchema>;

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

export interface GiftBoxAdminRow {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  status: "draft" | "published";
  defaultQuantityMin: number;
  sortOrder: number;
  isCustomizable: boolean;
  heroImagePath: string | null;
  nameEn: string;
  itemCount: number;
}

export async function listGiftBoxesForAdmin(opts?: {
  category?: string;
  status?: "draft" | "published";
}): Promise<GiftBoxAdminRow[]> {
  const supabase = createServiceRoleClient();
  let q = supabase
    .from("gift_boxes")
    .select(`
      id, slug, category_id, status, default_quantity_min, sort_order,
      is_customizable, hero_image_path,
      category:categories ( slug ),
      translations:gift_box_translations ( locale, name ),
      items:gift_box_items ( product_id )
    `)
    .order("sort_order");
  if (opts?.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error || !data) return [];
  type Row = {
    id: string;
    slug: string;
    category_id: string;
    status: "draft" | "published";
    default_quantity_min: number;
    sort_order: number;
    is_customizable: boolean;
    hero_image_path: string | null;
    category: { slug: string } | Array<{ slug: string }> | null;
    translations: Array<{ locale: string; name: string }>;
    items: Array<{ product_id: string }>;
  };
  let rows = (data as unknown as Row[]).map((r) => {
    const en = r.translations.find((t) => t.locale === "en");
    // PostgREST returns a single object for many-to-one embedded FKs,
    // but the Supabase client types it as an array. Accept both, the
    // old code did r.category[0]?.slug which returned undefined on
    // object-shape responses and made the filter dead.
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return {
      id: r.id,
      slug: r.slug,
      categoryId: r.category_id,
      categorySlug: cat?.slug ?? "",
      status: r.status,
      defaultQuantityMin: r.default_quantity_min,
      sortOrder: r.sort_order,
      isCustomizable: r.is_customizable,
      heroImagePath: r.hero_image_path,
      nameEn: en?.name ?? r.slug,
      itemCount: r.items.length,
    } satisfies GiftBoxAdminRow;
  });
  if (opts?.category) rows = rows.filter((r) => r.categorySlug === opts.category);
  return rows;
}

export interface GiftBoxAdminDetail extends GiftBoxAdminRow {
  translations: {
    en: { name: string; tagline: string | null; storyIntro: string | null };
    fr: { name: string; tagline: string | null; storyIntro: string | null };
  };
  itemProductIds: string[];
}

export async function getGiftBoxForAdmin(id: string): Promise<GiftBoxAdminDetail | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("gift_boxes")
    .select(`
      id, slug, category_id, status, default_quantity_min, sort_order,
      is_customizable, hero_image_path,
      category:categories ( slug ),
      translations:gift_box_translations ( locale, name, tagline, story_intro ),
      items:gift_box_items ( product_id, sort_order )
    `)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  type Row = {
    id: string;
    slug: string;
    category_id: string;
    status: "draft" | "published";
    default_quantity_min: number;
    sort_order: number;
    is_customizable: boolean;
    hero_image_path: string | null;
    category: { slug: string } | Array<{ slug: string }> | null;
    translations: Array<{
      locale: string;
      name: string;
      tagline: string | null;
      story_intro: string | null;
    }>;
    items: Array<{ product_id: string; sort_order: number }>;
  };
  const r = data as unknown as Row;
  const en = r.translations.find((t) => t.locale === "en") ?? {
    name: r.slug,
    tagline: null,
    story_intro: null,
  };
  const fr = r.translations.find((t) => t.locale === "fr") ?? {
    name: r.slug,
    tagline: null,
    story_intro: null,
  };
  const sortedItems = [...r.items].sort((a, b) => a.sort_order - b.sort_order);
  const cat = Array.isArray(r.category) ? r.category[0] : r.category;
  return {
    id: r.id,
    slug: r.slug,
    categoryId: r.category_id,
    categorySlug: cat?.slug ?? "",
    status: r.status,
    defaultQuantityMin: r.default_quantity_min,
    sortOrder: r.sort_order,
    isCustomizable: r.is_customizable,
    heroImagePath: r.hero_image_path,
    nameEn: en.name,
    itemCount: sortedItems.length,
    translations: {
      en: { name: en.name, tagline: en.tagline, storyIntro: en.story_intro },
      fr: { name: fr.name, tagline: fr.tagline, storyIntro: fr.story_intro },
    },
    itemProductIds: sortedItems.map((i) => i.product_id),
  };
}

/**
 * For each category, returns the gift_box ID that currently owns the
 * customizable / "Compose your own" slot (or null). The editor uses
 * this to gray out the checkbox when another box already holds the
 * slot for the selected category, only one wizard entry per category.
 */
export async function getCustomizableOwnerByCategory(): Promise<Record<string, string | null>> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("gift_boxes")
    .select("id, category_id")
    .eq("is_customizable", true);
  const map: Record<string, string | null> = {};
  for (const r of (data ?? []) as Array<{ id: string; category_id: string }>) {
    map[r.category_id] = r.id;
  }
  return map;
}

/** Drop-down options for the category picker in the editor. */
export async function getCategoryOptions(): Promise<Array<{ id: string; slug: string; nameEn: string }>> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("categories")
    .select(`id, slug, sort_order, translations:category_translations ( locale, name )`)
    .order("sort_order");
  if (!data) return [];
  type Row = {
    id: string;
    slug: string;
    translations: Array<{ locale: string; name: string }>;
  };
  return (data as unknown as Row[]).map((r) => {
    const en = r.translations.find((t) => t.locale === "en");
    return { id: r.id, slug: r.slug, nameEn: en?.name ?? r.slug };
  });
}

/** Product options for the gift-box item picker. Returns products in the
 *  selected category, with name + thumb. */
export interface ProductOption {
  id: string;
  slug: string;
  nameEn: string;
  image: string | null;
  /** EN facet values. Used by the gift-box editor's filter panel so
   *  the house can narrow the picker by ingredient / use / format /
   *  packaging / certification, same UX as the public wizard. */
  tags: string[];
}

export async function getProductOptionsForCategory(
  categoryId: string
): Promise<ProductOption[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("products")
    .select(`
      id, slug,
      translations:product_translations ( locale, name ),
      images:product_images ( path, sort_order ),
      facet_links:product_facets ( facet:facets ( value_en ) )
    `)
    .eq("category_id", categoryId)
    .eq("status", "published");
  if (!data) return [];
  type FacetLink = { facet: { value_en: string } | Array<{ value_en: string }> | null };
  type Row = {
    id: string;
    slug: string;
    translations: Array<{ locale: string; name: string }>;
    images: Array<{ path: string; sort_order: number }>;
    facet_links: FacetLink[];
  };
  return (data as unknown as Row[]).map((r) => {
    const en = r.translations.find((t) => t.locale === "en");
    const sortedImages = [...r.images].sort((a, b) => a.sort_order - b.sort_order);
    const tags: string[] = [];
    for (const link of r.facet_links ?? []) {
      const f = Array.isArray(link.facet) ? link.facet[0] : link.facet;
      if (f?.value_en) tags.push(f.value_en);
    }
    return {
      id: r.id,
      slug: r.slug,
      nameEn: en?.name ?? r.slug,
      image: sortedImages[0]?.path ?? null,
      tags,
    };
  });
}
