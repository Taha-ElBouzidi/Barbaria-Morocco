import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

interface Props {
  products: Product[];
  lang: "en" | "fr";
}

export default function ProductGrid({ products, lang }: Props) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center text-bb-on-surface-variant">
        <p className="font-serif italic text-[20px]">No pieces match the current filters.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} lang={lang} />
      ))}
    </div>
  );
}
