import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductForEdit, getAllFacetsForAdmin, getRitualOptions, getSubcatOptions } from "@/lib/admin/products";
import { getCategoryOptions } from "@/lib/admin/gift-boxes";
import ProductEditor from "../_components/ProductEditor";
import ProductStatusToggle from "../_components/ProductStatusToggle";
import ProductDeleteButton from "../_components/ProductDeleteButton";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProductPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;

  const [product, facets, rituals, categories] = await Promise.all([
    getProductForEdit(id),
    getAllFacetsForAdmin(),
    getRitualOptions(),
    getCategoryOptions(),
  ]);

  if (!product) notFound();

  // Load subcats for all rituals
  const subcatsByRitual: Record<string, Awaited<ReturnType<typeof getSubcatOptions>>> = {};
  await Promise.all(
    rituals.map(async (r) => {
      subcatsByRitual[r] = await getSubcatOptions(r);
    })
  );

  const enT = (product.translations as any[]).find((t: any) => t.locale === "en");

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            ← Products
          </Link>
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
              Admin / Products / Edit
            </p>
            <h1 className="font-serif text-[32px] leading-tight">
              {enT?.name ?? product.slug}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProductStatusToggle
            id={id}
            currentStatus={product.status as "draft" | "published"}
          />
          <ProductDeleteButton id={id} slug={product.slug} />
        </div>
      </header>

      {saved === "1" && (
        <div className="border border-green-200 bg-green-50 px-4 py-3">
          <p className="font-sans text-[13px] text-green-800">Product saved successfully.</p>
        </div>
      )}

      <ProductEditor
        id={id}
        initialData={product as any}
        facets={facets as any}
        rituals={rituals}
        subcatsByRitual={subcatsByRitual as any}
        categories={categories}
      />
    </div>
  );
}
