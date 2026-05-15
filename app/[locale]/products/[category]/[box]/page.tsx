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
import { getGiftBoxBySlug } from "@/lib/data/gift-boxes";
import type { CategorySlug } from "@/lib/data/types";

export const revalidate = 60;

const VALID_CATEGORIES: CategorySlug[] = ["cosmetiques", "epicerie_fine"];

interface PageProps {
  params: Promise<{ locale: string; category: string; box: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, box } = await params;
  const lang = locale === "fr" ? "fr" : "en";
  const detail = await getGiftBoxBySlug(box, lang);
  if (!detail) return {};
  return {
    title: `${detail.name} | Barbaria Morocco`,
    description: detail.storyIntro ?? detail.tagline ?? detail.name,
    openGraph: {
      images: detail.heroImage ? [{ url: detail.heroImage }] : undefined,
    },
  };
}

export default async function GiftBoxPage({ params }: PageProps) {
  const { locale, category, box } = await params;
  setRequestLocale(locale);
  if (!VALID_CATEGORIES.includes(category as CategorySlug)) notFound();

  const lang = locale === "fr" ? "fr" : "en";
  const [detail, t] = await Promise.all([
    getGiftBoxBySlug(box, lang),
    getTranslations({ locale, namespace: "products" }),
  ]);
  if (!detail || detail.categorySlug !== category) notFound();

  // Customizable boxes route to the wizard (Sprint 2.1 will mount it here).
  // Until the wizard ships, render a holding view that explains what's coming.
  const isWizard = detail.isCustomizable;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[440px] overflow-hidden">
        <Photo
          src={detail.heroImage}
          alt={detail.name}
          fill
          priority
          containerClassName="absolute inset-0"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,24,16,0.45),rgba(44,24,16,0.85))]"
          aria-hidden
        />
        <SaharaPrestige count={45} />
        <div className="relative z-10 flex h-full items-end pb-12 lg:pb-20">
          <div className="mx-auto w-full max-w-[1440px] px-[var(--bb-margin-edge)]">
            <div className="max-w-[820px] space-y-4">
              <Reveal>
                <Link
                  href={`/products/${category}`}
                  className="inline-flex items-center gap-2 text-bb-secondary text-[11px] uppercase tracking-[0.18em] hover:opacity-80"
                >
                  <Icon name="arrow-up-right" size={14} className="rotate-[225deg]" />
                  {t("back_to_category")}
                </Link>
              </Reveal>
              {detail.tagline && (
                <Reveal delayMs={80}>
                  <Eyebrow tone="gold">{detail.tagline}</Eyebrow>
                </Reveal>
              )}
              <Reveal delayMs={140}>
                <DisplayHeading size="xl" as="h1" className="text-bb-secondary">
                  {detail.name}
                </DisplayHeading>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20">
          <div className="space-y-10">
            {detail.storyIntro && (
              <Reveal>
                <p className="font-display italic text-bb-on-surface text-[clamp(18px,1.7vw,24px)] leading-relaxed">
                  {detail.storyIntro}
                </p>
              </Reveal>
            )}

            {isWizard ? (
              <Reveal delayMs={80}>
                <div className="border border-bb-line bg-bb-bg-low p-8 lg:p-10 space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
                    {t("wizard_pending_eyebrow")}
                  </p>
                  <h3 className="font-display text-[24px] text-bb-primary">
                    {t("wizard_pending_title")}
                  </h3>
                  <p className="text-bb-on-surface-variant leading-relaxed">
                    {t("wizard_pending_body")}
                  </p>
                </div>
              </Reveal>
            ) : (
              <Reveal delayMs={80}>
                <div className="space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
                    {t("items_eyebrow")}
                  </p>
                  <h3 className="font-display text-[24px] text-bb-primary">
                    {t("items_count", { count: detail.items.length })}
                  </h3>
                </div>
                <ul className="mt-6 space-y-px border-t border-bb-line">
                  {detail.items.map((item) => (
                    <li
                      key={item.slug}
                      className="grid grid-cols-[80px_1fr_auto] gap-4 items-center py-4 border-b border-bb-line"
                    >
                      <div className="relative aspect-square bg-bb-bg-low overflow-hidden">
                        <Photo
                          src={item.heroImage}
                          alt={item.name}
                          fill
                          sizes="80px"
                          containerClassName="absolute inset-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-display text-[18px] text-bb-primary hover:text-bb-secondary transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.short && (
                          <p className="text-[12px] text-bb-on-surface-variant truncate">
                            {item.short}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary hover:opacity-80 shrink-0"
                      >
                        {t("view_product")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Right rail: order details + CTA */}
          <Reveal delayMs={120}>
            <aside className="lg:sticky lg:top-28 border border-bb-line bg-bb-bg p-8 lg:p-10 space-y-6">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
                  {t("aside_eyebrow")}
                </p>
                <h3 className="font-display text-[24px] text-bb-primary leading-tight">
                  {t("aside_headline")}
                </h3>
              </div>
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between border-b border-bb-line pb-3">
                  <dt className="text-bb-on-surface-variant">{t("aside_min")}</dt>
                  <dd className="text-bb-primary font-medium">
                    {t("moq_pill", { n: detail.defaultQuantityMin })}
                  </dd>
                </div>
                {!isWizard && (
                  <div className="flex justify-between border-b border-bb-line pb-3">
                    <dt className="text-bb-on-surface-variant">{t("aside_items")}</dt>
                    <dd className="text-bb-primary font-medium">
                      {t("items_count", { count: detail.items.length })}
                    </dd>
                  </div>
                )}
              </dl>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 border border-bb-secondary bg-bb-secondary text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-secondary-fixed-dim transition-colors"
              >
                {t("send_request")}
                <Icon name="arrow-up-right" size={14} />
              </Link>
              <p className="text-[12px] text-bb-on-surface-variant text-center italic">
                {t("aside_note")}
              </p>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
