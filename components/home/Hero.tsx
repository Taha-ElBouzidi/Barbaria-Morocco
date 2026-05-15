"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Reveal from "@/components/primitives/Reveal";
import Eyebrow from "@/components/primitives/Eyebrow";
import Wordmark from "@/components/primitives/Wordmark";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";

export default function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative h-[90svh] min-h-[560px] overflow-hidden">
      <Photo
        src="/brand_photos/hero-atlas.jpg"
        alt={t("hero.alt")}
        fill
        priority
        containerClassName="absolute inset-0"
      />

      {/* Dark wash overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,24,16,0.45),rgba(44,24,16,0.85))]"
        aria-hidden
      />

      {/* Sahara prestige, drifting gold glow + twinkling pepitas on the dark wash */}
      <SaharaPrestige count={60} />

      {/* Centered content stack, Amazigh ornament + MAROC line + BARBARIA wordmark + MOROCCO + tagline + CTAs */}
      <div className="flex h-full items-center justify-center relative z-10">
        <div className="text-center max-w-[960px] px-[var(--bb-margin-edge)] flex flex-col items-center gap-8">
          <Reveal delayMs={0}>
            <Eyebrow tone="gold">{t("hero.eyebrow")}</Eyebrow>
          </Reveal>

          <Reveal delayMs={120}>
            <Wordmark variant="hero" tone="gold" />
          </Reveal>

          <Reveal delayMs={260}>
            <p className="font-display italic text-bb-secondary leading-relaxed text-[clamp(16px,1.6vw,20px)] max-w-[640px] mx-auto">
              {t("hero.lede")}
            </p>
          </Reveal>

          <Reveal delayMs={360}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                href="/products/cosmetiques"
                className="inline-flex items-center gap-2 px-8 py-[14px] min-h-[44px] border border-bb-secondary bg-transparent text-bb-secondary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary hover:text-bb-primary transition-colors"
              >
                {t("hero.cta_primary")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-[14px] min-h-[44px] border border-bb-secondary/40 bg-transparent text-bb-secondary font-sans text-[12px] uppercase tracking-[0.18em] hover:border-bb-secondary hover:bg-bb-secondary/10 transition-colors"
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
