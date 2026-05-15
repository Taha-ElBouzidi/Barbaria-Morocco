"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Reveal from "@/components/primitives/Reveal";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Icon from "@/components/primitives/Icon";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";

/**
 * BentoCategories — home page hero-grid surfacing the two product
 * categories (Cosmétiques + Épicerie Fine) as twin tall tiles, with
 * the "Send us a request" CTA tile beneath them.
 *
 * Replaces the former 3-ritual bento. Both tiles route into the new
 * /products/[category] pages where gift boxes are presented.
 */
export default function BentoCategories() {
  const t = useTranslations("home");

  return (
    <section>
      {/* Section heading */}
      <div className="space-y-3 mb-12 lg:mb-16">
        <Reveal>
          <Eyebrow tone="green">{t("bento.section_eyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delayMs={80}>
          <DisplayHeading size="lg">{t("bento.section_headline")}</DisplayHeading>
        </Reveal>
      </div>

      {/* Two equal tiles, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Link
          href="/products/cosmetiques"
          className="group relative overflow-hidden aspect-[4/5] lg:aspect-[5/6]"
        >
          <Photo
            src="/brand_photos/savon-noir-2.jpg"
            alt={t("bento.cosmetiques_title")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            containerClassName="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,24,16,0.25)_25%,rgba(44,24,16,0.92))]"
            aria-hidden
          />
          <SaharaPrestige count={35} />
          <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 text-white space-y-3">
            <Eyebrow tone="gold">{t("bento.cosmetiques_eyebrow")}</Eyebrow>
            <div className="flex items-end justify-between gap-4">
              <DisplayHeading size="lg" className="text-bb-secondary">
                {t("bento.cosmetiques_title")}
              </DisplayHeading>
              <span className="inline-flex h-12 w-12 items-center justify-center border border-bb-secondary/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
                <Icon name="arrow-up-right" size={18} className="text-bb-secondary" />
              </span>
            </div>
            <p className="text-white/70 leading-relaxed max-w-[480px] font-display italic text-[15px]">
              {t("bento.cosmetiques_lede")}
            </p>
          </div>
        </Link>

        <Link
          href="/products/epicerie_fine"
          className="group relative overflow-hidden aspect-[4/5] lg:aspect-[5/6]"
        >
          <Photo
            src="/brand_photos/products-all-three.jpg"
            alt={t("bento.epicerie_title")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            containerClassName="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,24,16,0.25)_25%,rgba(44,24,16,0.92))]"
            aria-hidden
          />
          <SaharaPrestige count={35} />
          <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 text-white space-y-3">
            <Eyebrow tone="gold">{t("bento.epicerie_eyebrow")}</Eyebrow>
            <div className="flex items-end justify-between gap-4">
              <DisplayHeading size="lg" className="text-bb-secondary">
                {t("bento.epicerie_title")}
              </DisplayHeading>
              <span className="inline-flex h-12 w-12 items-center justify-center border border-bb-secondary/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
                <Icon name="arrow-up-right" size={18} className="text-bb-secondary" />
              </span>
            </div>
            <p className="text-white/70 leading-relaxed max-w-[480px] font-display italic text-[15px]">
              {t("bento.epicerie_lede")}
            </p>
          </div>
        </Link>
      </div>

      {/* Send us a request — full-width brown CTA below the grid */}
      <Link
        href="/contact"
        className="mt-6 lg:mt-8 block bg-bb-primary text-white p-10 lg:p-12 group relative overflow-hidden"
      >
        <SaharaPrestige count={28} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-3 max-w-[640px]">
            <Eyebrow tone="gold">{t("bento.compose_eyebrow")}</Eyebrow>
            <DisplayHeading size="md" className="text-bb-secondary">
              {t("bento.compose_title")}
            </DisplayHeading>
            <p className="text-white/70 leading-relaxed">{t("bento.compose_lede")}</p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center border border-bb-secondary/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
            <Icon name="arrow-up-right" size={18} className="text-bb-secondary" />
          </span>
        </div>
      </Link>
    </section>
  );
}
