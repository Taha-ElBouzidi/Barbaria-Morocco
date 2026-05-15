import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getCategoryOptions, getProductOptionsForCategory } from "@/lib/admin/gift-boxes";
import GiftBoxEditor from "../_components/GiftBoxEditor";

export default async function NewGiftBoxPage() {
  await requireAdmin();
  const categoryOptions = await getCategoryOptions();
  const productOptionsByCategory: Record<string, Awaited<ReturnType<typeof getProductOptionsForCategory>>> = {};
  for (const c of categoryOptions) {
    productOptionsByCategory[c.id] = await getProductOptionsForCategory(c.id);
  }
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
      />
    </div>
  );
}
