import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getAllWorlds, getWorld, getSubcatsForWorld } from "@/lib/data/rituals";
import { getProductsByRitual } from "@/lib/data/products";
import CategoryHero from "@/components/category/CategoryHero";
import CategoryContent from "@/components/category/CategoryContent";

export const revalidate = 60;

type RitualId = "hammam" | "botanical" | "heritage";
const VALID: RitualId[] = ["hammam", "botanical", "heritage"];

interface PageProps {
  params: Promise<{ locale: string; world: string }>;
}

export async function generateStaticParams() {
  return VALID.flatMap((world) =>
    ["en", "fr"].map((locale) => ({ locale, world }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, world } = await params;
  if (!VALID.includes(world as RitualId)) return {};
  const lang = locale === "fr" ? "fr" : "en";
  const w = await getWorld(world, lang);
  if (!w) return {};
  return {
    title: `${w.name} | Barbaria Morocco`,
    description: w.lede,
    openGraph: {
      images: w.heroImage ? [{ url: w.heroImage }] : [{ url: "/brand_photos/gift-box-open.jpg" }],
    },
  };
}

export default async function RitualPage({ params }: PageProps) {
  const { locale, world } = await params;
  setRequestLocale(locale);
  if (!VALID.includes(world as RitualId)) notFound();

  const lang = locale === "fr" ? "fr" : "en";
  const [w, subs, products] = await Promise.all([
    getWorld(world, lang),
    getSubcatsForWorld(world, lang),
    getProductsByRitual(world as RitualId, lang),
  ]);

  if (!w) notFound();

  return (
    <>
      <CategoryHero world={w} />
      <CategoryContent subs={subs} products={products} lang={lang} />
    </>
  );
}
