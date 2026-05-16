"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Localised 404 for paths under /[locale]/*. Client Component so it
 * can read translations from the NextIntlClientProvider mounted in
 * the locale layout. Visual: minimal, brand-typographic, no full-
 * bleed photo (the photo overpowered the message); brand cream
 * background, Playfair display for the code, gold accent, primary
 * CTA + curated secondary links to the catalogue + contact.
 */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="min-h-screen bg-bb-bg text-bb-on-surface flex items-center justify-center px-[var(--bb-margin-edge)] py-24">
      <div className="w-full max-w-[640px] text-center space-y-10">
        <div
          className="flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <span className="h-px w-10 bg-bb-secondary-deep/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-bb-secondary-deep" />
          <span className="h-px w-10 bg-bb-secondary-deep/40" />
        </div>

        <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-bb-secondary-deep">
          {t("eyebrow")}
        </p>

        <h1
          aria-label={t("title")}
          className="font-display text-[clamp(96px,18vw,200px)] leading-[0.9] tracking-tight text-bb-primary"
        >
          {t("code")}
        </h1>

        <div className="space-y-3">
          <p className="font-display italic text-[clamp(20px,2.4vw,28px)] text-bb-primary leading-snug">
            {t("title")}
          </p>
          <p className="font-sans text-[14px] text-bb-on-surface/75 max-w-[460px] mx-auto leading-relaxed">
            {t("lede")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-[14px] min-h-[44px] border border-bb-secondary-deep bg-transparent text-bb-secondary-deep font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-deep hover:text-bb-on-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary-deep focus-visible:ring-offset-2 focus-visible:ring-offset-bb-bg"
          >
            {t("cta")}
          </Link>

          <nav
            aria-label="Site sections"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4"
          >
            <Link
              href="/products/cosmetiques"
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
            >
              {t("link_cosmetics")}
            </Link>
            <span aria-hidden="true" className="text-bb-line">·</span>
            <Link
              href="/products/epicerie_fine"
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
            >
              {t("link_epicerie")}
            </Link>
            <span aria-hidden="true" className="text-bb-line">·</span>
            <Link
              href="/story"
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
            >
              {t("link_story")}
            </Link>
            <span aria-hidden="true" className="text-bb-line">·</span>
            <Link
              href="/contact"
              className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
            >
              {t("link_contact")}
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
