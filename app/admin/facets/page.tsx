import { listFacetsForAdmin, groupFacetsByType } from "@/lib/admin/facets";
import FacetEditor from "./_components/FacetEditor";

export const dynamic = "force-dynamic";

export default async function AdminFacetsPage() {
  const facets = await listFacetsForAdmin();
  const facetsByType = groupFacetsByType(facets);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
          Admin / Facets
        </p>
        <h1 className="font-serif text-[36px] leading-tight">Filter Facets</h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant">
          5 filter axes: ingredient, use, format, packaging, certification. Add, rename, reorder, or
          delete values. Deletion is blocked if products reference the value.
        </p>
      </header>

      <FacetEditor facetsByType={facetsByType as any} />
    </div>
  );
}
