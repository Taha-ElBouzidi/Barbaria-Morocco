/**
 * SLICE 12 NOTE: `value` is resolved per locale (value_en or value_fr).
 * The legacy lib/products.ts exposes raw facets without locale resolution.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { LocaleCode, FacetEntry } from "./types";

export async function getAllFacets(
  locale: LocaleCode
): Promise<Record<FacetEntry["type"], FacetEntry[]>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("facets")
    .select("id, type, value_en, value_fr, sort_order")
    .order("type")
    .order("sort_order");

  const grouped: Record<FacetEntry["type"], FacetEntry[]> = {
    ingredient: [],
    use: [],
    format: [],
    packaging: [],
    certification: [],
  };
  if (error || !data) return grouped;
  for (const row of data) {
    const type = row.type as FacetEntry["type"];
    if (!grouped[type]) continue;
    grouped[type].push({
      id: row.id,
      type,
      value: locale === "fr" ? row.value_fr : row.value_en,
    });
  }
  return grouped;
}
