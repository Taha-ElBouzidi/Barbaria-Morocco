import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { WORLDS, SUBCATS, type RitualId } from "@/lib/rituals";
import { productsByWorld } from "@/lib/products";
import CategoryHero from "@/components/category/CategoryHero";
import CategoryContent from "@/components/category/CategoryContent";

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
  const w = WORLDS.find((x) => x.id === world)!;
  const lang = locale === "fr" ? "fr" : "en";
  return {
    title: `${w.name[lang]} | Barbaria Morocco`,
    description: w.lede[lang],
    openGraph: {
      images: w.hero ? [{ url: w.hero }] : [{ url: "/brand_photos/gift-box-open.jpg" }],
    },
  };
}

export default async function RitualPage({ params }: PageProps) {
  const { locale, world } = await params;
  setRequestLocale(locale);
  if (!VALID.includes(world as RitualId)) notFound();

  const w = WORLDS.find((x) => x.id === world)!;
  const subs = SUBCATS[world as RitualId];
  const products = productsByWorld(world as RitualId);
  const lang = locale === "fr" ? "fr" : "en";

  return (
    <>
      <CategoryHero world={w} lang={lang} />
      <CategoryContent subs={subs} products={products} lang={lang} />
    </>
  );
}
