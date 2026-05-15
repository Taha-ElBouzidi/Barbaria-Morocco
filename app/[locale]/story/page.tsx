import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import AmazighProverb from "@/components/primitives/AmazighProverb";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "story" });
  return {
    title: `${t("hero_headline")} | Barbaria Morocco`,
    description: t("hero_lede"),
  };
}

// Six Tifinagh symbols. Glyphs and transliterations are constants (not
// localised); only meanings and descriptions vary by locale via i18n keys.
// Letter names follow the standard Tifinagh convention (Yaz for ⵣ, etc.),
// not the Arabic letter names used in some informal sources.
const SYMBOLS = [
  { key: "yaz", glyph: "ⵣ", name: "Yaz" },
  { key: "yay", glyph: "ⵢ", name: "Yay" },
  { key: "yak", glyph: "ⴽ", name: "Yak" },
  { key: "yam", glyph: "ⵎ", name: "Yam" },
  { key: "yan", glyph: "ⵏ", name: "Yan" },
  { key: "yar", glyph: "ⵔ", name: "Yar" },
] as const;

export default async function StoryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "story" });

  const chapters = [
    {
      era: t("ch1_era"),
      years: t("ch1_years"),
      title: t("ch1_title"),
      p1: t("ch1_p1"),
      p2: t("ch1_p2"),
      image: "/brand_photos/hero-atlas.jpg",
      reverse: false,
    },
    {
      era: t("ch2_era"),
      years: t("ch2_years"),
      title: t("ch2_title"),
      p1: t("ch2_p1"),
      p2: t("ch2_p2"),
      image: "/brand_photos/sugar-scrub-hammam.jpg",
      reverse: true,
    },
    {
      era: t("ch3_era"),
      years: t("ch3_years"),
      title: t("ch3_title"),
      p1: t("ch3_p1"),
      p2: t("ch3_p2"),
      image: "/brand_photos/argan-oil-dropper.jpg",
      reverse: false,
    },
    {
      era: t("ch4_era"),
      years: t("ch4_years"),
      title: t("ch4_title"),
      p1: t("ch4_p1"),
      p2: t("ch4_p2"),
      image: "/brand_photos/products-all-three.jpg",
      reverse: true,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <Photo
          src="/brand_photos/hero-atlas.jpg"
          alt={t("hero_headline")}
          fill
          priority
          containerClassName="absolute inset-0"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,24,16,0.4),rgba(44,24,16,0.8))]"
          aria-hidden
        />
        <SaharaPrestige count={50} />
        <div className="relative z-10 flex h-full items-end pb-16 lg:pb-24">
          <div className="mx-auto w-full max-w-[1440px] px-[var(--bb-margin-edge)]">
            <div className="text-white space-y-4 max-w-[820px]">
              <Reveal>
                <Eyebrow tone="gold">{t("hero_eyebrow")}</Eyebrow>
              </Reveal>
              <Reveal delayMs={120}>
                <DisplayHeading size="xl" as="h1" className="text-white">
                  {t("hero_headline")}
                </DisplayHeading>
              </Reveal>
              <Reveal delayMs={220}>
                <p className="font-display italic text-[clamp(18px,1.5vw,22px)] text-white/80 leading-relaxed max-w-[640px]">
                  {t("hero_lede")}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-20 lg:py-32 space-y-32 lg:space-y-48">
        {chapters.map((ch, idx) => (
          <section key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal className={ch.reverse ? "lg:order-2" : ""}>
              <Photo
                src={ch.image}
                alt={ch.title}
                width={1100}
                height={1380}
                sizes="(min-width:1024px) 50vw, 100vw"
                containerClassName="aspect-[4/5]"
              />
            </Reveal>
            <div className={`space-y-6 ${ch.reverse ? "lg:order-1 lg:pr-8" : "lg:pl-8"}`}>
              <Reveal>
                <Eyebrow tone="green">{ch.era}</Eyebrow>
              </Reveal>
              <Reveal delayMs={60}>
                <p className="font-display italic text-[13px] tracking-[0.18em] text-bb-secondary-deep uppercase">
                  {ch.years}
                </p>
              </Reveal>
              <Reveal delayMs={120}>
                <DisplayHeading size="lg" as="h2" className="font-display italic">{ch.title}</DisplayHeading>
              </Reveal>
              <Reveal delayMs={200} className="space-y-4 text-bb-on-surface-variant leading-relaxed max-w-[520px]">
                <p>{ch.p1}</p>
                <p>{ch.p2}</p>
              </Reveal>
            </div>
            {/* Pull quote between chapters 02 and 03 */}
            {idx === 1 && (
              <div className="col-span-1 lg:col-span-2 py-12 lg:py-16 text-center">
                <Reveal>
                  <blockquote className="max-w-[820px] mx-auto">
                    <p className="font-display italic text-[clamp(22px,3.5vw,40px)] leading-[1.3] text-bb-secondary-deep">
                      &ldquo;{t("pull_quote")}&rdquo;
                    </p>
                  </blockquote>
                </Reveal>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Amazigh Tifinagh, 6 symbols. Pure cream surface so the page reads
          uniformly. The previous gap-px + parent-background trick was
          leaving a 1px sandstone bar bleeding outside the grid; replaced
          with a single outer border + explicit per-cell borders that stop
          cleanly at the grid edges. All type sits in gold tones. */}
      <section className="bg-[var(--bb-bg)] py-20 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)]">
          <div className="text-center max-w-[720px] mx-auto mb-16 lg:mb-20 space-y-5">
            <Reveal>
              <Eyebrow tone="gold-deep">{t("amazigh_eyebrow")}</Eyebrow>
            </Reveal>
            <Reveal delayMs={80}>
              <DisplayHeading size="lg" as="h2" className="font-display italic text-bb-secondary-deep">
                {t("amazigh_headline")}
              </DisplayHeading>
            </Reveal>
            <Reveal delayMs={160}>
              <p className="font-display italic text-[clamp(16px,1.4vw,19px)] text-bb-on-surface-variant leading-relaxed">
                {t("amazigh_intro")}
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 border border-[var(--bb-line)] bg-[var(--bb-bg)] overflow-hidden">
            {SYMBOLS.map((sym, idx) => {
              const totalRows = Math.ceil(SYMBOLS.length / 3);
              const rowOnLg = Math.floor(idx / 3);
              const isLastRowOnLg = rowOnLg === totalRows - 1;
              const isLastColOnLg = (idx + 1) % 3 === 0;
              const isLastColOnSm = (idx + 1) % 2 === 0;
              return (
                <Reveal
                  key={sym.key}
                  className={[
                    "bg-[var(--bb-bg)]",
                    isLastColOnSm ? "border-r-0" : "border-r border-[var(--bb-line)]",
                    isLastColOnLg ? "lg:border-r-0" : "lg:border-r lg:border-[var(--bb-line)]",
                    isLastRowOnLg ? "lg:border-b-0" : "lg:border-b lg:border-[var(--bb-line)]",
                    idx >= SYMBOLS.length - 2 ? "sm:border-b-0" : "border-b border-[var(--bb-line)]",
                  ].join(" ")}
                >
                  <div className="p-5 sm:p-8 lg:p-12 text-center h-full flex flex-col items-center">
                    <span
                      className="font-display text-bb-secondary-deep leading-none mb-3 sm:mb-6 text-[56px] sm:text-[72px] lg:text-[84px]"
                      aria-hidden
                    >
                      {sym.glyph}
                    </span>
                    <p className="font-display italic text-[16px] sm:text-[20px] lg:text-[22px] text-bb-secondary-deep mb-1">
                      {sym.name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-bb-secondary-deep mb-2 sm:mb-4">
                      {t(`sym_${sym.key}_meaning`)}
                    </p>
                    <p className="text-[12px] sm:text-[14px] leading-relaxed text-bb-on-surface-variant max-w-[320px] line-clamp-5 sm:line-clamp-none">
                      {t(`sym_${sym.key}_desc`)}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing proverb */}
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)]">
        <AmazighProverb locale={locale} />
      </section>
    </>
  );
}
