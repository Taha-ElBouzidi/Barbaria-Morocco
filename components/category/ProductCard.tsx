"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import Icon from "@/components/primitives/Icon";
import type { ProductSummary } from "@/lib/data/types";

interface Props {
  product: ProductSummary;
  lang: "en" | "fr";
}

/**
 * Sprint 2.6 — Products are no longer purchasable individually, only as
 * components of boxes. The card no longer carries an "Add to inquiry"
 * action; it is purely a navigation tile into the product detail page.
 */
export default function ProductCard({ product, lang: _lang }: Props) {
  const t = useTranslations("rituals");
  const primaryTag = product.tags[0] ?? "";
  const specLine = [product.formats[0], product.origin ?? product.lead].filter(Boolean).join(" · ");

  return (
    <article className="group flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <Photo
          src={product.heroImage}
          alt={product.name}
          width={800}
          height={800}
          sizes="(min-width:1024px) 28vw, (min-width:768px) 45vw, 100vw"
          containerClassName="aspect-square transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="space-y-3">
        {primaryTag && <Eyebrow tone="green">{primaryTag}</Eyebrow>}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-[22px] leading-[1.25] text-bb-on-surface group-hover:text-bb-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
          <span className="inline-flex items-center px-2 py-1 border border-bb-line">
            {t("moq_pill", { n: product.moq })}
          </span>
          {specLine && <span className="font-sans">{specLine}</span>}
        </div>
        <div className="pt-2 border-t border-bb-line/50">
          <Link
            href={`/product/${product.slug}`}
            className="inline-flex items-center gap-2 py-3 min-h-[44px] font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary hover:text-bb-primary-container group/link"
          >
            {t("view")} <Icon name="arrow-right" size={14} className="transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
