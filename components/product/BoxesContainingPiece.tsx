import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import type { BoxContainingProduct } from "@/lib/data/products";

interface Props {
  boxes: BoxContainingProduct[];
  lang: "en" | "fr";
}

/**
 * Sprint 2.6 — Replaces the legacy "Complementary pieces" row. Products
 * are no longer purchasable individually; instead the PDP shows up to
 * three gift boxes that contain this piece so the visitor can shop the
 * commercial unit (the box) directly.
 */
export default async function BoxesContainingPiece({ boxes, lang: _lang }: Props) {
  if (boxes.length === 0) return null;
  const t = await getTranslations("product");
  return (
    <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-20 lg:py-28">
      <div className="space-y-3 mb-12">
        <Eyebrow tone="green">{t("boxes_containing_piece")}</Eyebrow>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
        {boxes.map((box) => (
          <Link
            key={box.slug}
            href={`/products/${box.categorySlug}/${box.slug}`}
            className="group block"
          >
            <div className="relative overflow-hidden aspect-[4/5] mb-5 bg-bb-bg-low">
              <Photo
                src={box.heroImage}
                alt={box.name}
                fill
                sizes="(min-width:1024px) 28vw, (min-width:768px) 45vw, 100vw"
                containerClassName="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="space-y-2">
              {box.tagline && (
                <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
                  {box.tagline}
                </p>
              )}
              <h3 className="font-display text-[22px] leading-tight text-bb-primary group-hover:text-bb-secondary-deep transition-colors">
                {box.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
