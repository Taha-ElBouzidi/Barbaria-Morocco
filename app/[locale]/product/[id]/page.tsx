import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getProductBySlug, getProductsByRitual } from "@/lib/data/products";
import { getWorld } from "@/lib/data/rituals";
import ImageStack from "@/components/product/ImageStack";
import SpecColumn from "@/components/product/SpecColumn";
import ProofStrip from "@/components/product/ProofStrip";
import ApplicationRitual from "@/components/product/ApplicationRitual";
import CooperativeBand from "@/components/product/CooperativeBand";
import RelatedRow from "@/components/product/RelatedRow";

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
  return {
    title: `${p.name} | Barbaria Morocco`,
    description: p.short,
    openGraph: { images: p.heroImage ? [{ url: p.heroImage }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const lang = locale === "fr" ? "fr" : "en";
  const p = await getProductBySlug(id, lang);
  if (!p) notFound();

  // Fetch the ritual world for the eyebrow label in SpecColumn
  const world = await getWorld(p.ritualId, lang);

  // Related: products from other ritual worlds, limited to 3
  const otherWorldId = (["hammam", "botanical", "heritage"] as const).find(
    (w) => w !== p.ritualId
  ) ?? "botanical";
  const allRelated = await getProductsByRitual(otherWorldId, lang);
  const related = allRelated.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <article className="pt-32 lg:pt-40">
      <div className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 pb-20 lg:pb-28">
        <ImageStack product={p} lang={lang} />
        <SpecColumn product={p} worldEyebrow={world?.eyebrow ?? ""} lang={lang} />
      </div>
      <ProofStrip product={p} lang={lang} />
      <ApplicationRitual product={p} lang={lang} />
      <CooperativeBand product={p} lang={lang} />
      <RelatedRow products={related} lang={lang} />
    </article>
  );
}
