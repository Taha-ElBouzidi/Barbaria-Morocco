import { getTranslations } from "next-intl/server";
import Eyebrow from "@/components/primitives/Eyebrow";
import ProductCard from "@/components/category/ProductCard";
import type { Product } from "@/lib/products";

interface Props { products: Product[]; lang: "en" | "fr"; }

export default async function RelatedRow({ products, lang }: Props) {
  if (products.length === 0) return null;
  const t = await getTranslations("product");
  return (
    <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-20 lg:py-28">
      <div className="space-y-3 mb-12">
        <Eyebrow tone="green">{t("related")}</Eyebrow>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} lang={lang} />
        ))}
      </div>
    </section>
  );
}
