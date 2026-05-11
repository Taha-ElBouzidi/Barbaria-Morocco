import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PRODUCTS, getProduct } from "@/lib/products";
import { WORLDS } from "@/lib/rituals";
import ImageStack from "@/components/product/ImageStack";
import SpecColumn from "@/components/product/SpecColumn";
import ProofStrip from "@/components/product/ProofStrip";
import ApplicationRitual from "@/components/product/ApplicationRitual";
import CooperativeBand from "@/components/product/CooperativeBand";
import RelatedRow from "@/components/product/RelatedRow";

interface PageProps { params: Promise<{ locale: string; id: string }>; }

export async function generateStaticParams() {
  return PRODUCTS.flatMap((p) => ["en", "fr"].map((locale) => ({ locale, id: p.id })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const p = getProduct(id);
  if (!p) return {};
  const lang = locale === "fr" ? "fr" : "en";
  return {
    title: `${p.name[lang]} | Barbaria Morocco`,
    description: p.short[lang],
    openGraph: { images: p.images[0] ? [{ url: p.images[0] }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const p = getProduct(id);
  if (!p) notFound();
  const world = WORLDS.find((w) => w.id === p.world)!;
  const lang = locale === "fr" ? "fr" : "en";
  // Related: 3 products from OTHER rituals (not same world).
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.world !== p.world).slice(0, 3);

  return (
    <article className="pt-32 lg:pt-40">
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 pb-20 lg:pb-28">
        <ImageStack product={p} lang={lang} />
        <SpecColumn product={p} world={world} lang={lang} />
      </div>
      <ProofStrip product={p} lang={lang} />
      <ApplicationRitual product={p} lang={lang} />
      <CooperativeBand product={p} lang={lang} />
      <RelatedRow products={related} lang={lang} />
    </article>
  );
}
