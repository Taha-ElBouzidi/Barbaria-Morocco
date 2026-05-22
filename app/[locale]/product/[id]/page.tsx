import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getProductBySlug, getBoxesContainingProduct } from "@/lib/data/products";
import ImageStack from "@/components/product/ImageStack";
import SpecColumn from "@/components/product/SpecColumn";
import ProofStrip from "@/components/product/ProofStrip";
import ApplicationRitual from "@/components/product/ApplicationRitual";
import CooperativeBand from "@/components/product/CooperativeBand";
import BoxesContainingPiece from "@/components/product/BoxesContainingPiece";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { BASE_URL } from "@/lib/constants";

export const revalidate = 60;

interface PageProps { params: Promise<{ locale: string; id: string }>; }

export async function generateStaticParams() {
  // generateStaticParams runs at build time without an HTTP request;
  // use a cookie-free anon client (no cookies() dependency).
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "published");
  const slugs = (data ?? []).map((p: { slug: string }) => p.slug);
  return slugs.flatMap((id) => ["en", "fr"].map((locale) => ({ locale, id })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const lang = locale === "fr" ? "fr" : "en";
  const p = await getProductBySlug(id, lang);
  if (!p) return {};
  return pageMetadata({
    locale,
    path: `/product/${id}`,
    title: p.name,
    description: p.short,
    ogImage: p.heroImage ?? undefined,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const lang = locale === "fr" ? "fr" : "en";
  const [p, t] = await Promise.all([
    getProductBySlug(id, lang),
    getTranslations({ locale, namespace: "products" }),
  ]);
  if (!p) notFound();

  const boxes = await getBoxesContainingProduct(p.slug, lang);

  // Product schema for the individual piece. Breadcrumb is two levels
  // (Home > piece name) because pieces do not belong to a single
  // category in the data model: each piece may appear in multiple
  // gift boxes across both cosmetics and epicerie. The piece's own
  // origin and formats are surfaced as additionalProperty so AI
  // engines and search results can cite the cooperative provenance.
  const pageUrl = `${BASE_URL}/${locale}/product/${id}`;
  const additionalProperty: Array<{ "@type": "PropertyValue"; name: string; value: string }> = [];
  if (p.origin) additionalProperty.push({ "@type": "PropertyValue", name: t("piece_origin_label"), value: p.origin });
  if (p.formats.length > 0) additionalProperty.push({ "@type": "PropertyValue", name: t("piece_format_label"), value: p.formats.join(", ") });
  if (p.lead) additionalProperty.push({ "@type": "PropertyValue", name: t("piece_lead_label"), value: p.lead });

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short,
    url: pageUrl,
    image: p.heroImage ? `${BASE_URL}${p.heroImage}` : undefined,
    brand: { "@type": "Brand", name: "Barbaria Morocco" },
    manufacturer: { "@type": "Organization", name: "Barbaria Morocco" },
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/MadeToOrder",
      businessFunction: "https://purl.org/goodrelations/v1#Sell",
      eligibleCustomerType: "https://purl.org/goodrelations/v1#Business",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: p.moq,
        unitCode: "C62",
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "MAD",
        description: t("price_on_request"),
      },
      url: pageUrl,
      seller: { "@type": "Organization", name: "Barbaria Morocco" },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: p.name, item: pageUrl },
    ],
  };

  return (
    <article className="pt-32 lg:pt-40">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 pb-20 lg:pb-28">
        <ImageStack product={p} lang={lang} />
        <SpecColumn product={p} worldEyebrow="" lang={lang} />
      </div>
      <ProofStrip product={p} lang={lang} />
      <ApplicationRitual product={p} lang={lang} />
      <CooperativeBand product={p} lang={lang} />
      <BoxesContainingPiece boxes={boxes} lang={lang} />
    </article>
  );
}
