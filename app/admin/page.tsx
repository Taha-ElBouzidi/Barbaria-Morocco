import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import StatTile from "@/components/admin/StatTile";
import ActivityFeed from "@/components/admin/ActivityFeed";
import Icon from "@/components/primitives/Icon";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

async function getDashboardCounts() {
  const supabase = await createServerClient();
  const [
    publishedProducts,
    draftProducts,
    publishedGiftBoxes,
    draftGiftBoxes,
    ateliers,
    journal,
    inquiries,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("gift_boxes").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("gift_boxes").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("ateliers").select("id", { count: "exact", head: true }),
    supabase.from("journal_cards").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "contacted", "quoted"]),
  ]);
  return {
    publishedProducts: publishedProducts.count ?? 0,
    draftProducts: draftProducts.count ?? 0,
    publishedGiftBoxes: publishedGiftBoxes.count ?? 0,
    draftGiftBoxes: draftGiftBoxes.count ?? 0,
    ateliers: ateliers.count ?? 0,
    journal: journal.count ?? 0,
    inquiries: inquiries.count ?? 0,
  };
}

const QUICK_ACTIONS = [
  { href: "/admin/gift-boxes/new", label: "New gift box", primary: true },
  { href: "/admin/products/new", label: "New product", primary: false },
  { href: "/admin/occasions/new", label: "New occasion", primary: false },
  { href: "/admin/journal/new", label: "New journal entry", primary: false },
];

export default async function AdminDashboard() {
  await requireAdmin();
  const counts = await getDashboardCounts();
  return (
    <div className="space-y-8 lg:space-y-10">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">Dashboard</p>
        <h1 className="font-serif text-[28px] sm:text-[36px] leading-tight">Welcome back.</h1>
      </header>

      {/* Inquiries get top billing: the maison is here to read incoming
          requests first. Six stats below it, two columns on mobile, three
          at sm, six at xl. */}
      <section className="space-y-3">
        <StatTile
          label="Open inquiries"
          value={counts.inquiries}
          hint="New, contacted, quoted (Won/Lost excluded)"
          href="/admin/inquiries"
        />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatTile
          label="Gift boxes"
          value={counts.publishedGiftBoxes}
          href="/admin/gift-boxes"
        />
        <StatTile
          label="Gift box drafts"
          value={counts.draftGiftBoxes}
          href="/admin/gift-boxes"
        />
        <StatTile
          label="Products"
          value={counts.publishedProducts}
          href="/admin/products"
        />
        <StatTile
          label="Product drafts"
          value={counts.draftProducts}
          href="/admin/products?status=draft"
        />
        <StatTile label="Ateliers" value={counts.ateliers} href="/admin/ateliers" />
        <StatTile label="Journal" value={counts.journal} href="/admin/journal" />
      </section>

      <section className="space-y-3">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Quick actions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={
                "inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 min-h-[48px] font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.18em] transition-colors " +
                (a.primary
                  ? "bg-bb-primary text-bb-bg hover:bg-bb-primary-container"
                  : "border border-bb-line text-bb-on-surface hover:border-bb-primary")
              }
            >
              <Icon name="plus" size={14} />
              <span className="truncate">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <ActivityFeed />
    </div>
  );
}
