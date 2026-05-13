"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Reveal from "@/components/primitives/Reveal";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Icon from "@/components/primitives/Icon";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";

export default function BentoRituals() {
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

      {/* Bento grid: Hammam (large, col 1 row-span-2) | Botanical (top right) | Heritage (bottom right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[1fr_1fr] gap-6 lg:gap-8">

        {/* Hammam, large, spans both rows on col 1 */}
        <Link
          href="/rituals/hammam"
          className="lg:row-span-2 group relative overflow-hidden"
        >
          <Photo
            src="/brand_photos/savon-noir-2.jpg"
            alt={t("bento.hammam_title")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            containerClassName="aspect-[4/5] lg:aspect-auto lg:h-full transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(44,24,16,0.85))]"
            aria-hidden
          />
          <SaharaPrestige count={30} />
          <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10 text-white space-y-2">
            <Eyebrow tone="gold">{t("bento.hammam_eyebrow")}</Eyebrow>
            <div className="flex items-end justify-between gap-4">
              <DisplayHeading size="md" className="text-white">
                {t("bento.hammam_title")}
              </DisplayHeading>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
                <Icon name="arrow-up-right" size={16} className="text-white" />
              </span>
            </div>
          </div>
        </Link>

        {/* Botanical, small, top right */}
        <Link href="/rituals/botanical" className="group relative overflow-hidden">
          <Photo
            src="/brand_photos/argan-oil-dropper.jpg"
            alt={t("bento.botanical_title")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            containerClassName="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(44,24,16,0.85))]"
            aria-hidden
          />
          <SaharaPrestige count={20} />
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 text-white space-y-2">
            <Eyebrow tone="gold">{t("bento.botanical_eyebrow")}</Eyebrow>
            <div className="flex items-end justify-between gap-4">
              <DisplayHeading size="md" className="text-white">
                {t("bento.botanical_title")}
              </DisplayHeading>
              <span className="inline-flex h-10 w-10 items-center justify-center border border-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
                <Icon name="arrow-up-right" size={16} className="text-white" />
              </span>
            </div>
          </div>
        </Link>

        {/* Heritage, medium, bottom right */}
        <Link href="/rituals/heritage" className="group relative overflow-hidden">
          <Photo
            src="/brand_photos/gift-box-open.jpg"
            alt={t("bento.heritage_title")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            containerClassName="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(44,24,16,0.85))]"
            aria-hidden
          />
          <SaharaPrestige count={20} />
          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 text-white space-y-2">
            <Eyebrow tone="gold">{t("bento.heritage_eyebrow")}</Eyebrow>
            <div className="flex items-end justify-between gap-4">
              <DisplayHeading size="md" className="text-white">
                {t("bento.heritage_title")}
              </DisplayHeading>
              <span className="inline-flex h-10 w-10 items-center justify-center border border-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
                <Icon name="arrow-up-right" size={16} className="text-white" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Compose text card, full-width row below the grid */}
      <Link
        href="/contact"
        className="mt-6 lg:mt-8 block bg-bb-primary text-white p-10 lg:p-12 group relative overflow-hidden"
      >
        <SaharaPrestige count={28} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-3 max-w-[640px]">
            <Eyebrow tone="gold">{t("bento.compose_eyebrow")}</Eyebrow>
            <DisplayHeading size="md" className="text-white">
              {t("bento.compose_title")}
            </DisplayHeading>
            <p className="text-white/70 leading-relaxed">{t("bento.compose_lede")}</p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center border border-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0">
            <Icon name="arrow-up-right" size={18} className="text-white" />
          </span>
        </div>
      </Link>
    </section>
  );
}
