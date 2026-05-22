import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import Photo from "@/components/primitives/Photo";
import Eyebrow from "@/components/primitives/Eyebrow";
import DisplayHeading from "@/components/primitives/DisplayHeading";
import Reveal from "@/components/primitives/Reveal";
import SaharaPrestige from "@/components/primitives/SaharaPrestige";
import Icon from "@/components/primitives/Icon";
import ZoomLink from "@/components/primitives/ZoomLink";
import { getGiftBoxBySlug } from "@/lib/data/gift-boxes";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { getAllFacets } from "@/lib/data/facets";
// The wizard is a 1k+ LOC client component. Lazy-load so curated
// boxes (the majority) don't pay the JS cost; the import only fires
// for `detail.isCustomizable === true` rows. Types remain a static
// import, types erase at compile time, so they're free.
import type { WizardCopy, FacetTypeByValue } from "@/components/wizard/BoxComposer";
const BoxComposer = dynamic(() => import("@/components/wizard/BoxComposer"));
import BoxAddToInquiry from "@/components/product/BoxAddToInquiry";
import JsonLd from "@/components/JsonLd";
import type { CategorySlug, ProductSummary } from "@/lib/data/types";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { BASE_URL } from "@/lib/constants";

export const revalidate = 60;

const VALID_CATEGORIES: CategorySlug[] = ["cosmetiques", "epicerie_fine"];

interface PageProps {
  params: Promise<{ locale: string; category: string; box: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category, box } = await params;
  const lang = locale === "fr" ? "fr" : "en";
  const detail = await getGiftBoxBySlug(box, lang);
  if (!detail) return {};
  return pageMetadata({
    locale,
    path: `/products/${category}/${box}`,
    title: detail.name,
    description: detail.storyIntro ?? detail.tagline ?? detail.name,
    ogImage: detail.heroImage ?? undefined,
  });
}

export default async function GiftBoxPage({ params }: PageProps) {
  const { locale, category, box } = await params;
  setRequestLocale(locale);
  if (!VALID_CATEGORIES.includes(category as CategorySlug)) notFound();

  const lang = locale === "fr" ? "fr" : "en";
  const [detail, cat, t] = await Promise.all([
    getGiftBoxBySlug(box, lang),
    getCategoryBySlug(category, lang),
    getTranslations({ locale, namespace: "products" }),
  ]);
  if (!detail || !cat || detail.categorySlug !== category) notFound();

  const isWizard = detail.isCustomizable;

  // For customizable boxes we mount the BoxComposer client component.
  // The pool is the box's admin-assigned items if the house populated
  // them; otherwise we fall back to every published product in the
  // category. Same i18n bundle pattern as before.
  if (isWizard) {
    const [wizardT, facets] = await Promise.all([
      getTranslations({ locale, namespace: "wizard" }),
      getAllFacets(lang),
    ]);
    const products: ProductSummary[] =
      detail.items.length > 0
        ? detail.items
        : await getProductsByCategory(category, lang);
    // Flat value->type lookup so the wizard can group product tags by
    // facet axis without re-doing the join in client land.
    const facetTypeByValue: FacetTypeByValue = {};
    for (const type of ["ingredient", "use", "format", "packaging", "certification"] as const) {
      for (const f of facets[type]) {
        facetTypeByValue[f.value] = type;
      }
    }
    const copy: WizardCopy = {
      intro_eyebrow: wizardT("intro_eyebrow"),
      intro_begin: wizardT("intro_begin"),
      size_eyebrow: wizardT("size_eyebrow"),
      size_title: wizardT("size_title"),
      size_lede: wizardT("size_lede"),
      size_3_label: wizardT("size_3_label"),
      size_3_desc: wizardT("size_3_desc"),
      size_5_label: wizardT("size_5_label"),
      size_5_desc: wizardT("size_5_desc"),
      size_6_label: wizardT("size_6_label"),
      size_6_desc: wizardT("size_6_desc"),
      // Templates with {n}/{total} placeholders are passed as raw strings
      // so the client component (BoxComposer) can interpolate at render
      // time. Calling t() here would throw because the values aren't
      // known until the user picks a box size.
      step_eyebrow_progress: wizardT.raw("step_eyebrow_progress") as string,
      step_no_products: wizardT("step_no_products"),
      step_search_placeholder: wizardT("step_search_placeholder"),
      step_search_count: wizardT.raw("step_search_count") as string,
      step_filter_button: wizardT("step_filter_button"),
      step_filter_clear: wizardT("step_filter_clear"),
      filter_axis_ingredient: wizardT("filter_axis_ingredient"),
      filter_axis_use: wizardT("filter_axis_use"),
      filter_axis_format: wizardT("filter_axis_format"),
      filter_axis_packaging: wizardT("filter_axis_packaging"),
      filter_axis_certification: wizardT("filter_axis_certification"),
      filter_axis_other: wizardT("filter_axis_other"),
      step_back: wizardT("step_back"),
      step_next: wizardT("step_next"),
      step_picked: wizardT("step_picked"),
      step_more_details: wizardT("step_more_details"),
      step_view_details: wizardT("step_view_details"),
      step_choose_this: wizardT("step_choose_this"),
      step_currently_chosen: wizardT("step_currently_chosen"),
      detail_origin: wizardT("detail_origin"),
      detail_format: wizardT("detail_format"),
      detail_lead: wizardT("detail_lead"),
      detail_close: wizardT("detail_close"),
      review_eyebrow: wizardT("review_eyebrow"),
      review_title: wizardT("review_title"),
      review_lede: wizardT("review_lede"),
      review_slot_empty: wizardT("review_slot_empty"),
      review_continue: wizardT("review_continue"),
      review_edit: wizardT("review_edit"),
      quantity_eyebrow: wizardT("quantity_eyebrow"),
      quantity_title: wizardT("quantity_title"),
      quantity_lede: wizardT("quantity_lede"),
      quantity_min_label: wizardT.raw("quantity_min_label") as string,
      quantity_below_min_note: wizardT.raw("quantity_below_min_note") as string,
      quantity_submit: wizardT("quantity_submit"),
      done_eyebrow: wizardT("done_eyebrow"),
      done_title: wizardT("done_title"),
      done_lede: wizardT("done_lede"),
      done_cta: wizardT("done_cta"),
      done_compose_another: wizardT("done_compose_another"),
      exit_aria: wizardT("exit_aria"),
      exit_confirm: wizardT("exit_confirm"),
    };
    return (
      <BoxComposer
        box={detail}
        products={products}
        themeKey={cat.storyThemeKey}
        locale={lang}
        copy={copy}
        facetTypeByValue={facetTypeByValue}
      />
    );
  }

  // SEO structured data: Product schema for the gift box itself plus a
  // BreadcrumbList rooted at Home so search results render the full
  // path Home > Products > Category > Box. No price in the Product
  // payload, B2B inquiry pricing is negotiated and not public.
  const pageUrl = `${BASE_URL}/${locale}/products/${category}/${box}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: detail.name,
    description: detail.storyIntro ?? detail.tagline ?? detail.name,
    url: pageUrl,
    image: detail.heroImage ? `${BASE_URL}${detail.heroImage}` : undefined,
    category: cat.name,
    brand: {
      "@type": "Brand",
      name: "Barbaria Morocco",
    },
    offers: {
      "@type": "Offer",
      // Made-to-order B2B: no public price field. Per Google's 2026
      // guidance, omit `price` entirely rather than emit "0" (Search
      // Console flags zero-priced offers). The PriceSpecification
      // description carries the explanation; eligibleQuantity carries
      // the MOQ; businessFunction + eligibleCustomerType signal B2B
      // intent so AI engines can route procurement queries here.
      availability: "https://schema.org/MadeToOrder",
      businessFunction: "https://purl.org/goodrelations/v1#Sell",
      eligibleCustomerType: "https://purl.org/goodrelations/v1#Business",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: detail.defaultQuantityMin,
        unitCode: "C62",
      },
      // Production lead-time band, surfaced on the public page as
      // "X to Y weeks". schema.org allows min/max via QuantitativeValue
      // so search engines + AI engines can reason about urgency.
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        minValue: detail.leadTimeWeeksMin,
        maxValue: detail.leadTimeWeeksMax,
        unitCode: "WEE",
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "MAD",
        description: t("price_on_request"),
      },
      url: pageUrl,
      seller: {
        "@type": "Organization",
        name: "Barbaria Morocco",
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("breadcrumb_products"), item: `${BASE_URL}/${locale}/products` },
      { "@type": "ListItem", position: 3, name: cat.name, item: `${BASE_URL}/${locale}/products/${category}` },
      { "@type": "ListItem", position: 4, name: detail.name, item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
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

            {/* When isWizard is true the page above returns early with
                <BoxComposer/>, so this block only ever renders for curated
                gift boxes. The previous isWizard ternary here was dead code. */}
            <Reveal delayMs={80}>
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
                  {t("items_eyebrow")}
                </p>
                <h2 className="font-display text-[24px] text-bb-primary">
                  {t("items_count", { count: detail.items.length })}
                </h2>
              </div>
              <ul className="mt-6 space-y-px border-t border-bb-line">
                  {detail.items.map((item) => (
                    <li
                      key={item.slug}
                      className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[80px_1fr_auto] gap-3 sm:gap-4 items-start sm:items-center py-4 border-b border-bb-line"
                    >
                      {/* viewTransitionName must match the destination's name
                          on /product/[slug] so the browser animates the
                          thumbnail into the hero. ZoomLink wraps the click. */}
                      <div
                        className="relative aspect-square bg-bb-bg-low overflow-hidden"
                        style={{ viewTransitionName: `product-${item.slug}` }}
                      >
                        <Photo
                          src={item.heroImage}
                          alt={item.name}
                          fill
                          sizes="80px"
                          containerClassName="absolute inset-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <ZoomLink
                          href={`/product/${item.slug}`}
                          className="font-display text-[18px] text-bb-primary hover:text-bb-secondary-deep transition-colors"
                        >
                          {item.name}
                        </ZoomLink>
                        {item.short && (
                          <p className="text-[12px] text-bb-on-surface-variant truncate">
                            {item.short}
                          </p>
                        )}
                      </div>
                      <ZoomLink
                        href={`/product/${item.slug}`}
                        aria-label={`${t("view_product")}: ${item.name}`}
                        className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep hover:opacity-80 shrink-0"
                      >
                        {t("view_product")}
                      </ZoomLink>
                    </li>
                  ))}
              </ul>
            </Reveal>
          </div>

          {/* Right rail: order details + CTA */}
          <Reveal delayMs={120}>
            <aside className="lg:sticky lg:top-28 border border-bb-line bg-bb-bg p-8 lg:p-10 space-y-6">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
                  {t("aside_eyebrow")}
                </p>
                <h2 className="font-display text-[24px] text-bb-primary leading-tight">
                  {t("aside_headline")}
                </h2>
              </div>
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between border-b border-bb-line pb-3">
                  <dt className="text-bb-on-surface-variant">{t("aside_items")}</dt>
                  <dd className="text-bb-primary font-medium">
                    {t("items_count", { count: detail.items.length })}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-bb-line pb-3">
                  <dt className="text-bb-on-surface-variant">{t("aside_min_label")}</dt>
                  <dd className="text-bb-primary font-medium">
                    {t("aside_min_value", { n: detail.defaultQuantityMin })}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-bb-line pb-3">
                  <dt className="text-bb-on-surface-variant">{t("aside_lead_label")}</dt>
                  <dd className="text-bb-primary font-medium">
                    {detail.leadTimeWeeksMin === detail.leadTimeWeeksMax
                      ? t("aside_lead_single", { n: detail.leadTimeWeeksMin })
                      : t("aside_lead_range", {
                          min: detail.leadTimeWeeksMin,
                          max: detail.leadTimeWeeksMax,
                        })}
                  </dd>
                </div>
              </dl>
              <BoxAddToInquiry
                giftBoxSlug={detail.slug}
                name={detail.name}
                minQty={detail.defaultQuantityMin}
                categorySlug={category}
              />
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
