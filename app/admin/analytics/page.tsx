import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getAnalyticsSnapshot } from "@/lib/admin/analytics";
import StatTile from "@/components/admin/StatTile";
import Sparkline from "@/components/admin/Sparkline";
import HorizontalBar from "@/components/admin/HorizontalBar";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const snap = await getAnalyticsSnapshot("en");

  // Conversion rate among closed inquiries (won + lost). Soft-launch
  // safe: show "—" rather than NaN when there are no closed inquiries
  // yet.
  const closed = snap.lifetime.wonCount + snap.lifetime.lostCount;
  const winRate =
    closed > 0 ? `${Math.round((snap.lifetime.wonCount / closed) * 100)}%` : "—";

  return (
    <div className="space-y-8 lg:space-y-10">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Admin / Analytics
        </p>
        <h1 className="font-serif text-[28px] sm:text-[36px] leading-tight">
          Concierge analytics
        </h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-prose">
          A read of inquiry volume, the boxes the house fields most, and the
          pieces guests pick when they compose their own. Counts are live.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile label="Total inquiries" value={snap.lifetime.total} hint="Lifetime" />
        <StatTile
          label="Open"
          value={snap.lifetime.openCount}
          hint="New, contacted, quoted"
          href="/admin/inquiries"
        />
        <StatTile label="Last 7 days" value={snap.lifetime.last7d} hint="Volume" />
        <StatTile label="Last 30 days" value={snap.lifetime.last30d} hint="Volume" />
        <StatTile label="Win rate" value={winRate} hint={`${closed} closed`} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <section className="border border-bb-line p-4 lg:p-6 space-y-3">
          <header className="space-y-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Last 30 days
            </p>
            <h2 className="font-serif text-[20px] leading-none">Daily inquiry volume</h2>
          </header>
          <div className="text-bb-secondary-deep">
            <Sparkline
              points={snap.daily}
              ariaLabel="Daily inquiry counts, last 30 days"
            />
          </div>
          <div className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant">
            <span>{snap.daily[0]?.day ?? ""}</span>
            <span>{snap.daily[snap.daily.length - 1]?.day ?? ""}</span>
          </div>
        </section>

        <section className="border border-bb-line p-4 lg:p-6 space-y-4">
          <header className="space-y-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Last 30 days
            </p>
            <h2 className="font-serif text-[20px] leading-none">Status breakdown</h2>
          </header>
          <HorizontalBar
            rows={snap.statusBreakdown.map((s) => ({
              label: STATUS_LABELS[s.status] ?? s.status,
              value: s.cnt,
            }))}
            emptyMessage="No inquiries yet in the last 30 days."
          />
        </section>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <section className="border border-bb-line p-4 lg:p-6 space-y-4">
          <header className="space-y-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Lifetime
            </p>
            <h2 className="font-serif text-[20px] leading-none">Top inquired boxes</h2>
            <p className="font-sans text-[12px] text-bb-on-surface-variant">
              Curated boxes + the customizable ones. Sorted by total units requested.
            </p>
          </header>
          <HorizontalBar
            rows={snap.topBoxes.map((b) => ({
              label: b.name,
              value: b.totalQty,
              sublabel: `${b.inquiryCount}× inquir${b.inquiryCount === 1 ? "y" : "ies"}${b.isCustomizable ? ", custom" : ""}`,
            }))}
            emptyMessage="No boxes have been inquired about yet."
          />
        </section>

        <section className="border border-bb-line p-4 lg:p-6 space-y-4">
          <header className="space-y-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Lifetime
            </p>
            <h2 className="font-serif text-[20px] leading-none">
              Top pieces inside custom boxes
            </h2>
            <p className="font-sans text-[12px] text-bb-on-surface-variant">
              Products guests pick when they compose their own box. Proxy for
              best-sellers.
            </p>
          </header>
          <HorizontalBar
            rows={snap.topPieces.map((p) => ({
              label: p.name,
              value: p.pickCount,
              // pickCount is the number of inquiry lines containing this
              // piece. totalQty is the sum of those lines' box-level qty,
              // which is "box units carrying this piece" — not "units of
              // this piece sold." Naming the sublabel "in N boxes" keeps
              // it honest. Plural form fires for everything except 1.
              sublabel: `in ${p.totalQty} ${p.totalQty === 1 ? "box" : "boxes"}`,
            }))}
            emptyMessage="No custom compositions yet."
          />
        </section>
      </section>

      <section className="border border-bb-line p-4 lg:p-6 space-y-4">
        <header className="space-y-1">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
            Lifetime
          </p>
          <h2 className="font-serif text-[20px] leading-none">Top occasions</h2>
          <p className="font-sans text-[12px] text-bb-on-surface-variant">
            What the house's guests are buying for. Useful to plan editorial
            and seasonal pushes.
          </p>
        </header>
        <HorizontalBar
          rows={snap.topOccasions.map((o) => ({ label: o.occasion, value: o.cnt }))}
          emptyMessage="No occasions logged yet."
        />
      </section>

      <p className="font-sans text-[11px] text-bb-on-surface-variant italic">
        Need rows? See the inbox in{" "}
        <Link
          href="/admin/inquiries"
          className="text-bb-secondary-deep hover:underline"
        >
          /admin/inquiries
        </Link>
        .
      </p>
    </div>
  );
}
