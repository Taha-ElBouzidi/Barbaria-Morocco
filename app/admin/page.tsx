import { createServerClient } from "@/lib/supabase/server";
import StatTile from "@/components/admin/StatTile";
import ActivityFeed from "@/components/admin/ActivityFeed";
import Link from "next/link";

export const dynamic = "force-dynamic"; // always fresh counts

async function getDashboardCounts() {
  const supabase = await createServerClient();
  const [publishedProducts, draftProducts, ateliers, journal] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("ateliers").select("id", { count: "exact", head: true }),
    supabase.from("journal_cards").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);
  return {
    publishedProducts: publishedProducts.count ?? 0,
    draftProducts: draftProducts.count ?? 0,
    ateliers: ateliers.count ?? 0,
    journal: journal.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const counts = await getDashboardCounts();
  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">Dashboard</p>
        <h1 className="font-serif text-[36px] leading-tight">Welcome back.</h1>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Published products" value={counts.publishedProducts} href="/admin/products" />
        <StatTile label="Drafts" value={counts.draftProducts} href="/admin/products?status=draft" />
        <StatTile label="Ateliers" value={counts.ateliers} href="/admin/ateliers" />
        <StatTile label="Journal entries" value={counts.journal} href="/admin/journal" />
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          Add product
        </Link>
        <Link
          href="/admin/journal/new"
          className="border border-bb-line text-bb-on-surface px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:border-bb-primary transition-colors"
        >
          Add journal entry
        </Link>
        <Link
          href="/admin/ateliers/new"
          className="border border-bb-line text-bb-on-surface px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:border-bb-primary transition-colors"
        >
          Add atelier
        </Link>
      </section>

      <ActivityFeed />
    </div>
  );
}
