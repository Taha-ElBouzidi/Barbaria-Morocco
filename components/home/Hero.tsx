"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Reveal from "@/components/primitives/Reveal";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";

export default function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative h-[90vh] min-h-[640px] overflow-hidden">
      <Photo
        src="/brand_photos/hero-atlas.jpg"
        alt={t("hero.alt")}
        fill
        priority
        containerClassName="absolute inset-0"
      />

      {/* Dark wash overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,48,34,0.45),rgba(27,48,34,0.85))]"
        aria-hidden
      />

      {/* Centered content stack */}
      <div className="flex h-full items-center justify-center relative z-10">
        <div className="text-center max-w-[900px] px-[var(--bb-margin-edge)] space-y-6">
          <Reveal delayMs={0}>
            <Eyebrow tone="gold">{t("hero.eyebrow")}</Eyebrow>
          </Reveal>

          <Reveal delayMs={120}>
            {/*
             * TODO: italic-last-word polish — split headline into headline_a / headline_b
             * so the final word can be wrapped in <em className="font-serif italic">.
             * For now, rendered plain until i18n keys are split.
             */}
            <DisplayHeading size="xl" as="h1" className="text-white">
              {t("hero.headline")}
            </DisplayHeading>
          </Reveal>

          <Reveal delayMs={220}>
            <p className="text-white/80 leading-relaxed text-base max-w-[560px] mx-auto">
              {t("hero.lede")}
            </p>
          </Reveal>

          <Reveal delayMs={320}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/rituals/hammam"
                className="inline-flex items-center gap-2 px-8 py-4 bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
              >
                {t("hero.cta_primary")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/40 text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-white/10 transition-colors"
              >
                {t("hero.cta_secondary")}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
