import { redirect } from "next/navigation";

/**
 * Sprint 2 IA pivot: /rituals/* is retired in favour of /products/[category].
 * All requests land on the cosmetics category. Old bookmarks and search
 * index entries still resolve. We keep the route file as a redirect so
 * Next.js handles the response server-side (308 permanent) rather than
 * a 404.
 */
interface PageProps {
  params: Promise<{ locale: string; world: string }>;
}

export default async function RetiredRitualPage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/products/cosmetiques`);
}
