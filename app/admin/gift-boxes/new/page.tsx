import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getCategoryOptions,
  getProductOptionsForCategory,
  getCustomizableOwnerByCategory,
} from "@/lib/admin/gift-boxes";
import { getAllFacetsForAdmin } from "@/lib/admin/products";
import GiftBoxEditor from "../_components/GiftBoxEditor";

export default async function NewGiftBoxPage() {
  await requireAdmin();
  const categoryOptions = await getCategoryOptions();
  const productOptionsByCategory: Record<string, Awaited<ReturnType<typeof getProductOptionsForCategory>>> = {};
  for (const c of categoryOptions) {
    productOptionsByCategory[c.id] = await getProductOptionsForCategory(c.id);
  }

  const facets = (await getAllFacetsForAdmin()) as Array<{
    type: string;
    value_en: string;
  }>;
  const facetTypeByValue: Record<string, string> = {};
  for (const f of facets) facetTypeByValue[f.value_en] = f.type;

  const customizableOwnerByCategory = await getCustomizableOwnerByCategory();
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/admin/gift-boxes" className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary inline-flex items-center gap-1">
          ← Gift boxes
        </Link>
        <h1 className="font-serif text-[28px] leading-none text-bb-primary">New gift box</h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-[640px]">
          Creates a draft. Publish from the edit page once translations and items are in place.
        </p>
      </header>
      <GiftBoxEditor
        categoryOptions={categoryOptions}
        productOptionsByCategory={productOptionsByCategory}
        facetTypeByValue={facetTypeByValue}
        customizableOwnerByCategory={customizableOwnerByCategory}
      />
    </div>
  );
}
