import Link from "next/link";
import { headers } from "next/headers";
import { Playfair_Display, Cormorant_Garamond, Montserrat } from "next/font/google";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

/**
 * Root not-found. Fires for any unmatched URL across the whole app
 * (Next 16 routes unmatched URLs directly here, bypassing the locale
 * layout entirely). That means we must load globals.css and brand
 * fonts on this file itself, set our own html/body, and not rely on
 * NextIntlClientProvider for copy. Locale comes from the
 * `x-next-intl-locale` header that next-intl middleware sets on
 * every public-site request; Accept-Language is the fallback for
 * paths that bypass intl (e.g., /admin/*).
 */
export default async function NotFound() {
  const h = await headers();
  const intlLocale = h.get("x-next-intl-locale");
  const accept = (h.get("accept-language") ?? "").toLowerCase();
  const lang: "fr" | "en" = intlLocale === "en"
    ? "en"
    : intlLocale === "fr"
      ? "fr"
      : accept.startsWith("fr") || accept.includes(",fr")
        ? "fr"
        : "en";
  const isEn = lang === "en";

  const copy = isEn
    ? {
        eyebrow: "Barbaria Morocco",
        title: "This page does not exist.",
        lede:
          "The address you followed is incorrect or the page has been moved. Head back home, or pick a thread below.",
        cta: "Return home",
        cosmetics: "Cosmetics",
        epicerie: "Fine Épicerie",
        story: "Our story",
        contact: "Contact",
      }
    : {
        eyebrow: "Barbaria Morocco",
        title: "Cette page n'existe pas.",
        lede:
          "L'adresse que vous avez suivie est incorrecte ou la page a été déplacée. Retournez à l'accueil ou choisissez une rubrique ci-dessous.",
        cta: "Retour à l'accueil",
        cosmetics: "Cosmétiques",
        epicerie: "Épicerie Fine",
        story: "Notre histoire",
        contact: "Contact",
      };

  const prefix = isEn ? "/en" : "/fr";

  return (
    <html
      lang={lang}
      className={`${playfair.variable} ${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bb-bg text-bb-on-surface font-sans antialiased">
        <main className="relative min-h-[100svh] overflow-hidden text-white wizard-theme wizard-theme--sahara flex items-center justify-center px-6 py-24">
          <SaharaPrestige count={60} />

          <div className="relative z-10 w-full max-w-[640px] text-center space-y-10">
            <div
              className="flex items-center justify-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px w-10 bg-bb-secondary/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-bb-secondary" />
              <span className="h-px w-10 bg-bb-secondary/40" />
            </div>

            <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-bb-secondary">
              {copy.eyebrow}
            </p>

            <h1
              aria-label={copy.title}
              className="font-display text-[clamp(96px,18vw,200px)] leading-[0.9] tracking-tight text-bb-secondary"
            >
              404
            </h1>

            <div className="space-y-3">
              <p className="font-display italic text-[clamp(20px,2.4vw,28px)] text-bb-secondary leading-snug">
                {copy.title}
              </p>
              <p className="font-sans text-[14px] text-white/75 max-w-[460px] mx-auto leading-relaxed">
                {copy.lede}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <Link
                href={prefix}
                className="inline-flex items-center gap-2 px-8 py-[14px] min-h-[44px] border border-bb-secondary bg-transparent text-bb-secondary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary hover:text-bb-primary transition-colors"
              >
                {copy.cta}
              </Link>

              <nav
                aria-label="Site sections"
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4"
              >
                <Link
                  href={`${prefix}/products/cosmetiques`}
                  className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary transition-colors"
                >
                  {copy.cosmetics}
                </Link>
                <span aria-hidden="true" className="text-bb-secondary/30">·</span>
                <Link
                  href={`${prefix}/products/epicerie_fine`}
                  className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary transition-colors"
                >
                  {copy.epicerie}
                </Link>
                <span aria-hidden="true" className="text-bb-secondary/30">·</span>
                <Link
                  href={`${prefix}/story`}
                  className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary transition-colors"
                >
                  {copy.story}
                </Link>
                <span aria-hidden="true" className="text-bb-secondary/30">·</span>
                <Link
                  href={`${prefix}/contact`}
                  className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary/70 hover:text-bb-secondary transition-colors"
                >
                  {copy.contact}
                </Link>
              </nav>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
