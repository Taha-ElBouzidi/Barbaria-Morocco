import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getGiftBoxForAdmin,
  getCategoryOptions,
  getProductOptionsForCategory,
} from "@/lib/admin/gift-boxes";
import { getAllFacetsForAdmin } from "@/lib/admin/products";
import GiftBoxEditor from "../_components/GiftBoxEditor";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditGiftBoxPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const detail = await getGiftBoxForAdmin(id);
  if (!detail) notFound();

  const categoryOptions = await getCategoryOptions();
  const productOptionsByCategory: Record<string, Awaited<ReturnType<typeof getProductOptionsForCategory>>> = {};
  for (const c of categoryOptions) {
    productOptionsByCategory[c.id] = await getProductOptionsForCategory(c.id);
  }

  // EN-keyed facet axis map so the items picker can group filter chips
  // the way the public wizard does (ingredient / use / format /
  // packaging / certification).
  const facets = (await getAllFacetsForAdmin()) as Array<{
    type: string;
    value_en: string;
  }>;
  const facetTypeByValue: Record<string, string> = {};
  for (const f of facets) facetTypeByValue[f.value_en] = f.type;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/admin/gift-boxes" className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary inline-flex items-center gap-1">
          ← Gift boxes
        </Link>
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="font-serif text-[28px] leading-none text-bb-primary">{detail.nameEn}</h1>
          <span
            className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
              detail.status === "published"
                ? "bg-bb-secondary/15 text-bb-secondary-deep"
                : "bg-bb-bg-mid text-bb-on-surface-variant"
            }`}
          >
            {detail.status}
          </span>
        </div>
        <p className="font-sans text-[13px] text-bb-on-surface-variant">
          <span className="font-mono">{detail.slug}</span>
          {" · "}
          {detail.categorySlug}
          {detail.isCustomizable ? " · customizable" : " · curated"}
        </p>
        {saved === "1" && (
          <p role="status" className="inline-block px-4 py-2 bg-bb-secondary/15 text-bb-secondary-deep text-[12px] uppercase tracking-[0.18em]">
            Saved
          </p>
        )}
      </header>
      <GiftBoxEditor
        initial={detail}
        categoryOptions={categoryOptions}
        productOptionsByCategory={productOptionsByCategory}
        facetTypeByValue={facetTypeByValue}
      />
    </div>
  );
}
