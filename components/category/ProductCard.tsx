"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import Icon from "@/components/primitives/Icon";
import type { Product } from "@/lib/products";
import { getHeroImage } from "@/lib/products";
import { useInquiry } from "@/lib/inquiry-context";

interface Props {
  product: Product;
  lang: "en" | "fr";
}

export default function ProductCard({ product, lang }: Props) {
  const t = useTranslations("rituals");
  const { cart, toggle } = useInquiry();
  const isAdded = cart.has(product.id);
  const primaryTag = product.tags[0] ?? "";
  const specLine = [product.formats[0], product.origin ?? product.lead].filter(Boolean).join(" · ");

  return (
    <article className="group flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={`/product/${product.id}`} className="block overflow-hidden">
        <Photo
          src={getHeroImage(product)}
          alt={product.name[lang]}
          width={800}
          height={800}
          sizes="(min-width:1024px) 28vw, (min-width:768px) 45vw, 100vw"
          containerClassName="aspect-square transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="space-y-3">
        {primaryTag && <Eyebrow tone="gold">{primaryTag}</Eyebrow>}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-[22px] leading-[1.25] text-bb-on-surface group-hover:text-bb-primary transition-colors">
            {product.name[lang]}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
          <span className="inline-flex items-center px-2 py-1 border border-bb-line">
            {t("moq_pill", { n: product.moq })}
          </span>
          {specLine && <span className="font-sans">{specLine}</span>}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-bb-line/50">
          <Link
            href={`/product/${product.id}`}
            className="inline-flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary hover:text-bb-primary-container group/link"
          >
            {t("view")} <Icon name="arrow-right" size={14} className="transition-transform group-hover/link:translate-x-0.5" />
          </Link>
          <button
            onClick={() => toggle(product.id)}
            className={cn(
              "font-sans text-[12px] uppercase tracking-[0.18em] px-3 py-2 border transition-colors",
              isAdded
                ? "border-bb-secondary text-bb-secondary"
                : "border-bb-line text-bb-on-surface hover:border-bb-primary"
            )}
          >
            {isAdded ? t("added") : t("add_to_inquiry")}
          </button>
        </div>
      </div>
    </article>
  );
}
