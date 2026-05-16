import Link from "next/link";
import { getAllFacetsForAdmin } from "@/lib/admin/products";
import { getCategoryOptions } from "@/lib/admin/gift-boxes";
import ProductEditor from "../_components/ProductEditor";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const [facets, categories] = await Promise.all([
    getAllFacetsForAdmin(),
    getCategoryOptions(),
  ]);

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
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
            Admin / Products / New
          </p>
          <h1 className="font-serif text-[32px] leading-tight">New product</h1>
        </div>
      </header>

      <ProductEditor
        facets={facets as any}
        categories={categories}
      />
    </div>
  );
}
