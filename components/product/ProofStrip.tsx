import Icon from "@/components/primitives/Icon";
import type { ProductDetail } from "@/lib/data/types";

interface Props { product: ProductDetail; lang: "en" | "fr"; }

export default function ProofStrip({ product, lang: _lang }: Props) {
  // New DB shape has no `proof` array; build proof points from available fields.
  const points: string[] = [
    product.origin ? `Sourced from ${product.origin}` : "Sourced in Morocco",
    "Made-to-order at the atelier",
    `Lead time: ${product.lead}`,
  ];
  const icons: Array<"leaf" | "concierge" | "diamond"> = ["leaf", "concierge", "diamond"];

  return (
    <section className="border-y border-bb-line bg-bb-bg-low">
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-bb-line">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-4 py-6 md:py-8 md:px-8">
            <Icon name={icons[i] ?? "diamond"} size={24} className="text-bb-secondary shrink-0" />
            <p className="text-[14px] text-bb-on-surface">{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
