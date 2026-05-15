import { useTranslations } from "next-intl";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Icon from "@/components/primitives/Icon";
import type { ProductDetail } from "@/lib/data/types";

interface Props {
  product: ProductDetail;
  worldEyebrow: string;
  lang: "en" | "fr";
}

/**
 * Sprint 2.6 , Products are no longer purchasable individually.
 * The spec column shows information and an email link to the concierge
 * for a spec sheet. The "Add to inquiry" button is gone; the box detail
 * page or wizard is where boxes get added to the inquiry.
 */
export default function SpecColumn({ product, worldEyebrow, lang: _lang }: Props) {
  const t = useTranslations("product");

  const specs: Array<{ key: string; value: string }> = [
    { key: t("moq"), value: String(product.moq) },
    { key: t("formats"), value: product.formats.join(", ") },
    { key: t("lead"), value: product.lead },
  ];
  if (product.origin) specs.push({ key: t("origin"), value: product.origin });
  const packagingTag = product.tags.find((x) =>
    ["Amber glass", "Porcelain", "Cedar", "Berber weave", "Recycled card", "Glass jar", "Ceramic jar", "Cedar box"].includes(x)
  );
  if (packagingTag) specs.push({ key: t("packaging"), value: packagingTag });
  const certifs = product.tags.filter((x) =>
    ["BIO certified", "Fair trade", "Cruelty free", "Vegan", "100% Natural", "Cold-pressed", "Cooperative-made", "Made in Morocco"].includes(x)
  );
  if (certifs.length) specs.push({ key: t("certification"), value: certifs.join(", ") });

  return (
    <div className="space-y-8 lg:pt-4">
      <Eyebrow tone="green">{worldEyebrow}{product.ritualLabel ? ` · ${product.ritualLabel}` : ""}</Eyebrow>
      <DisplayHeading size="lg" as="h1">{product.name}</DisplayHeading>
      <p className="font-display italic text-[clamp(20px,1.6vw,24px)] leading-[1.4] text-bb-on-surface-variant">
        {product.short}
      </p>
      {product.lede && (
        <p className="text-bb-on-surface-variant leading-relaxed max-w-[560px]">{product.lede}</p>
      )}
      <dl className="divide-y divide-bb-line border-y border-bb-line">
        {specs.map(({ key, value }) => (
          <div key={key} className="grid grid-cols-[1fr] sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 py-4 text-[14px]">
            <dt className="font-sans uppercase tracking-[0.12em] text-bb-on-surface-variant text-[11px]">{key}</dt>
            <dd className="text-bb-on-surface">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href={`mailto:concierge@barbariamorocco.com?subject=${encodeURIComponent(`Spec sheet request: ${product.name}`)}`}
          className="inline-flex items-center gap-2 px-8 py-4 min-h-[44px] border border-bb-line font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface hover:border-bb-primary transition-colors"
        >
          {t("download_spec")} <Icon name="arrow-up-right" size={14} />
        </a>
      </div>
    </div>
  );
}
