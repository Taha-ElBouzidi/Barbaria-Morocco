import Link from "next/link";
import { listJournalCardsForAdmin } from "@/lib/admin/journal";
import JournalList from "./_components/JournalList";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const cards = await listJournalCardsForAdmin();

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Journal
          </p>
          <h1 className="font-serif text-[36px] leading-tight">Journal</h1>
        </div>
        <Link
          href="/admin/journal/new"
          className="bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          + New card
        </Link>
      </header>

      <JournalList cards={cards as any} />
    </div>
  );
}
