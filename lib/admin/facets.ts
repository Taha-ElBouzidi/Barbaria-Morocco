import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const FACET_TYPES = [
  "ingredient",
  "use",
  "format",
  "packaging",
  "certification",
] as const;

export type FacetType = (typeof FACET_TYPES)[number];

export const FacetSaveSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(FACET_TYPES),
  valueEn: z.string().min(1),
  valueFr: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

export type FacetSaveInput = z.infer<typeof FacetSaveSchema>;

// ---------------------------------------------------------------------------
// Admin list helpers
// ---------------------------------------------------------------------------

export async function listFacetsForAdmin() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("facets")
    .select("id, type, value_en, value_fr, sort_order")
    .order("type")
    .order("sort_order");

  if (error) throw new Error(`listFacetsForAdmin: ${error.message}`);

  // Attach product-use counts
  const facetIds = (data ?? []).map((f) => f.id);
  const counts: Record<string, number> = {};

  if (facetIds.length > 0) {
    const { data: usageCounts } = await supabase
      .from("product_facets")
      .select("facet_id")
      .in("facet_id", facetIds);

    (usageCounts ?? []).forEach((row: { facet_id: string }) => {
      counts[row.facet_id] = (counts[row.facet_id] ?? 0) + 1;
    });
  }

  return (data ?? []).map((f) => ({
    ...f,
    productCount: counts[f.id] ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Group by type helper (used on the single-page editor)
// ---------------------------------------------------------------------------

export function groupFacetsByType(
  facets: Awaited<ReturnType<typeof listFacetsForAdmin>>
): Record<FacetType, typeof facets> {
  const grouped = {} as Record<FacetType, typeof facets>;
  for (const type of FACET_TYPES) {
    grouped[type] = facets.filter((f) => f.type === type);
  }
  return grouped;
}
