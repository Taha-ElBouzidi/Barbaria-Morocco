/**
 * SLICE 12 NOTE: Returns locale-resolved flat shapes.
 * `description` is a plain string for the requested locale, NOT the nested
 * `{ en, fr }` object from lib/editorial.ts.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { LocaleCode, AtelierEntry } from "./types";

export async function getAllAteliers(locale: LocaleCode): Promise<AtelierEntry[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("ateliers")
    .select(`
      slug,
      name,
      region,
      since_year,
      image_path,
      sort_order,
      translations:atelier_translations!inner ( locale, description )
    `)
    .eq("translations.locale", locale)
    .order("sort_order");

  if (error || !data) return [];
  return data.map((row: any) => ({
    slug: row.slug,
    name: row.name,
    region: row.region,
    sinceYear: row.since_year,
    image: row.image_path,
    description: row.translations[0]?.description ?? "",
  }));
}
