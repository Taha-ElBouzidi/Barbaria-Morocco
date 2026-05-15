import { redirect } from "next/navigation";

/**
 * Sprint 2 IA pivot: /rituals/* is retired in favour of /products/[category].
 * All requests land on the cosmetics category. Old bookmarks and search
 * index entries still resolve. We keep the route file as a redirect so
 * Next.js handles the response server-side (308 permanent) rather than a 404.
 */
interface PageProps {
  params: Promise<{ locale: string; world: string }>;
}

// Pre-render the three known ritual slugs so the redirect ships as static
// at build time, not on a cold request.
export function generateStaticParams() {
  return (["hammam", "botanical", "heritage"] as const).flatMap((world) =>
    ["en", "fr"].map((locale) => ({ locale, world }))
  );
}

export default async function RetiredRitualPage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/products/cosmetiques`);
}
