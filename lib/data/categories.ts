/**
 * Sprint 2 — Category data fetchers. Returns locale-resolved flat shapes
 * matching the pattern in lib/data/rituals.ts and lib/data/products.ts.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { Category, CategorySlug, LocaleCode } from "./types";

export async function getAllCategories(locale: LocaleCode): Promise<Category[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id,
      slug,
      hero_image_path,
      story_theme_key,
      sort_order,
      translations:category_translations!inner ( locale, name, tagline, lede )
    `
    )
    .eq("translations.locale", locale)
    .order("sort_order");

  if (error || !data) return [];

  return data.map((row: {
    id: string;
    slug: string;
    hero_image_path: string | null;
    story_theme_key: string;
    translations: Array<{ name: string; tagline: string | null; lede: string | null }>;
  }) => {
    const t = row.translations[0] ?? { name: row.slug, tagline: null, lede: null };
    return {
      id: row.id,
      slug: row.slug as CategorySlug,
      heroImage: row.hero_image_path,
      storyThemeKey: row.story_theme_key as Category["storyThemeKey"],
      name: t.name ?? row.slug,
      tagline: t.tagline ?? "",
      lede: t.lede ?? "",
    };
  });
}

export async function getCategoryBySlug(
  slug: string,
  locale: LocaleCode
): Promise<Category | null> {
  const all = await getAllCategories(locale);
  return all.find((c) => c.slug === slug) ?? null;
}
