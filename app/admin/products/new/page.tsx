import Link from "next/link";
import { getAllFacetsForAdmin, getRitualOptions, getSubcatOptions } from "@/lib/admin/products";
import { getCategoryOptions } from "@/lib/admin/gift-boxes";
import ProductEditor from "../_components/ProductEditor";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const [facets, rituals, categories] = await Promise.all([
    getAllFacetsForAdmin(),
    getRitualOptions(),
    getCategoryOptions(),
  ]);

  // Pre-load subcats for all rituals so the client can switch without a round-trip
  const subcatsByRitual: Record<string, Awaited<ReturnType<typeof getSubcatOptions>>> = {};
  await Promise.all(
    rituals.map(async (r) => {
      subcatsByRitual[r] = await getSubcatOptions(r);
    })
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
        >
          ← Products
        </Link>
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Products / New
          </p>
          <h1 className="font-serif text-[32px] leading-tight">New product</h1>
        </div>
      </header>

      <ProductEditor
        facets={facets as any}
        rituals={rituals}
        subcatsByRitual={subcatsByRitual as any}
        categories={categories}
      />
    </div>
  );
}
