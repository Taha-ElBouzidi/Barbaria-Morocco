import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";
import Icon from "@/components/primitives/Icon";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getGiftBoxesByCategory } from "@/lib/data/gift-boxes";
import type { CategorySlug } from "@/lib/data/types";

export const revalidate = 60;

const VALID_CATEGORIES: CategorySlug[] = ["cosmetiques", "epicerie_fine"];

interface PageProps {
  params: Promise<{ locale: string; category: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.flatMap((category) =>
    ["en", "fr"].map((locale) => ({ locale, category }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params;
  if (!VALID_CATEGORIES.includes(category as CategorySlug)) return {};
  const lang = locale === "fr" ? "fr" : "en";
  const cat = await getCategoryBySlug(category, lang);
  if (!cat) return {};
  return {
    title: `${cat.name} | Barbaria Morocco`,
    description: cat.lede,
    openGraph: {
      images: cat.heroImage ? [{ url: cat.heroImage }] : [{ url: "/brand_photos/gift-box-open.jpg" }],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  if (!VALID_CATEGORIES.includes(category as CategorySlug)) notFound();

  const lang = locale === "fr" ? "fr" : "en";
  const [cat, boxes, t] = await Promise.all([
    getCategoryBySlug(category, lang),
    getGiftBoxesByCategory(category as CategorySlug, lang),
    getTranslations({ locale, namespace: "products" }),
  ]);
  if (!cat) notFound();

  const customizable = boxes.find((b) => b.isCustomizable);
  const curated = boxes.filter((b) => !b.isCustomizable);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <Photo
          src={cat.heroImage}
          alt={cat.name}
          fill
          priority
          containerClassName="absolute inset-0"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,24,16,0.45),rgba(44,24,16,0.85))]"
          aria-hidden
        />
        <SaharaPrestige count={55} />
        <div className="relative z-10 flex h-full items-end pb-12 lg:pb-24">
          <div className="mx-auto w-full max-w-[1440px] px-[var(--bb-margin-edge)]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-[820px] space-y-4">
                <Reveal>
                  <Eyebrow tone="gold">{cat.tagline}</Eyebrow>
                </Reveal>
                <Reveal delayMs={120}>
                  <DisplayHeading size="xl" as="h1" className="text-bb-secondary">
                    {cat.name}
                  </DisplayHeading>
                </Reveal>
                <Reveal delayMs={220}>
                  <p className="font-display italic text-bb-secondary/90 leading-relaxed max-w-[640px] text-[clamp(16px,1.5vw,20px)]">
                    {cat.lede}
                  </p>
                </Reveal>
              </div>
              {customizable && (
                <Reveal delayMs={320}>
                  <Link
                    href={`/products/${category}/${customizable.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] border border-bb-secondary bg-transparent text-bb-secondary font-sans text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-bb-secondary hover:text-bb-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-2"
                  >
                    {t("compose_cta")}
                    <Icon name="arrow-up-right" size={14} />
                  </Link>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sprint 2.6: curated FIRST. The house's composed boxes are the
          primary commercial offer; the wizard CTA sits below as the
          "compose your own" alternative. */}
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] pt-16 lg:pt-20 pb-12 lg:pb-16">
        <div className="mb-10 lg:mb-14 space-y-3">
          <Reveal>
            <Eyebrow tone="green">{t("curated_eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delayMs={80}>
            <DisplayHeading size="md" as="h2">
              {t("curated_headline")}
            </DisplayHeading>
          </Reveal>
        </div>

        {curated.length === 0 ? (
          <p className="font-display italic text-bb-on-surface-variant text-center py-12">
            {t("curated_empty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:gap-10">
            {curated.map((box) => (
              <Reveal key={box.slug}>
                <Link
                  href={`/products/${category}/${box.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden aspect-[4/5] mb-3 sm:mb-5 bg-bb-bg-low">
                    <Photo
                      src={box.heroImage}
                      alt={box.name}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 50vw"
                      containerClassName="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {box.tagline && (
                      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-bb-secondary-deep">
                        {box.tagline}
                      </p>
                    )}
                    <h3 className="font-display text-[16px] sm:text-[20px] lg:text-[22px] leading-tight text-bb-primary">
                      {box.name}
                    </h3>
                    <p className="text-[11px] sm:text-[13px] text-bb-on-surface-variant">
                      {t("items_count", { count: box.itemCount })}
                      {" · "}
                      {t("moq_pill", { n: box.defaultQuantityMin })}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {customizable && (
        <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] pb-20 lg:pb-32">
          <Reveal>
            <Link
              href={`/products/${category}/${customizable.slug}`}
              className="group relative block overflow-hidden bg-bb-primary text-white"
            >
              <SaharaPrestige count={50} />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 lg:p-16">
                <div className="space-y-5">
                  <Eyebrow tone="gold">{t("compose_eyebrow")}</Eyebrow>
                  <DisplayHeading size="lg" as="h2" className="text-bb-secondary">
                    {customizable.name}
                  </DisplayHeading>
                  {customizable.tagline && (
                    <p className="font-display italic text-bb-secondary/80 text-[clamp(16px,1.4vw,20px)]">
                      {customizable.tagline}
                    </p>
                  )}
                  {customizable.storyIntro && (
                    <p className="text-white/75 leading-relaxed max-w-[540px]">
                      {customizable.storyIntro}
                    </p>
                  )}
                </div>
                <div className="flex items-center lg:items-end justify-start lg:justify-end">
                  <span className="inline-flex items-center gap-3 px-8 py-4 border border-bb-secondary bg-transparent text-bb-secondary font-sans text-[13px] uppercase tracking-[0.18em] transition-colors group-hover:bg-bb-secondary group-hover:text-bb-primary">
                    {t("start_composing")}
                    <Icon name="arrow-up-right" size={16} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}
    </>
  );
}
