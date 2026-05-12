import Link from "next/link";
import JournalEditor from "../_components/JournalEditor";

export const dynamic = "force-dynamic";

export default async function NewJournalCardPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/journal"
          className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
        >
          ← Journal
        </Link>
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Journal / New
          </p>
          <h1 className="font-serif text-[32px] leading-tight">New card</h1>
        </div>
      </header>

      <JournalEditor />
    </div>
  );
}
