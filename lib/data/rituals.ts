/**
 * SLICE 12 NOTE: Returns locale-resolved flat shapes.
 * `name`, `eyebrow`, `tagline`, and `lede` are plain strings for the
 * requested locale — NOT the nested `{ en, fr }` objects from lib/rituals.ts.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { LocaleCode, RitualWorld, SubCategory } from "./types";

export async function getAllWorlds(locale: LocaleCode): Promise<RitualWorld[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(`
      id,
      hero_image_path,
      sort_order,
      translations:ritual_translations!inner ( locale, eyebrow, name, tagline, lede )
    `)
    .eq("translations.locale", locale)
    .order("sort_order");

  if (error || !data) return [];
  return data.map((row: any) => {
    const t = row.translations[0] ?? {};
    return {
      id: row.id,
      heroImage: row.hero_image_path,
      eyebrow: t.eyebrow ?? "",
      name: t.name ?? row.id,
      tagline: t.tagline ?? "",
      lede: t.lede ?? "",
    };
  });
}

export async function getWorld(
  id: string,
  locale: LocaleCode
): Promise<RitualWorld | null> {
  const all = await getAllWorlds(locale);
  return all.find((w) => w.id === id) ?? null;
}

export async function getSubcatsForWorld(
  ritualId: string,
  locale: LocaleCode
): Promise<SubCategory[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("ritual_subcategories")
    .select(`
      id,
      slug,
      sort_order,
      translations:ritual_subcategory_translations!inner ( locale, name )
    `)
    .eq("ritual_id", ritualId)
    .eq("translations.locale", locale)
    .order("sort_order");

  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.translations[0]?.name ?? row.slug,
  }));
}
