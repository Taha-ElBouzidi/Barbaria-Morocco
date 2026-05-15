import { notFound } from "next/navigation";
import Link from "next/link";
import { getJournalCardForEdit } from "@/lib/admin/journal";
import JournalEditor from "../_components/JournalEditor";
import JournalStatusToggle from "../_components/JournalStatusToggle";
import JournalDeleteButton from "../_components/JournalDeleteButton";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditJournalCardPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;

  const card = await getJournalCardForEdit(id);
  if (!card) notFound();

  const enT = (card.translations as any[]).find((t: any) => t.locale === "en");

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/journal"
            className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            ← Journal
          </Link>
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
              Admin / Journal / Edit
            </p>
            <h1 className="font-serif text-[32px] leading-tight">
              {enT?.headline ?? card.slug}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <JournalStatusToggle id={id} currentStatus={card.status as "draft" | "published"} />
          <JournalDeleteButton id={id} slug={card.slug} />
        </div>
      </header>

      {saved === "1" && (
        <div className="border border-green-200 bg-green-50 px-4 py-3">
          <p className="font-sans text-[13px] text-green-800">Card saved successfully.</p>
        </div>
      )}

      <JournalEditor id={id} initialData={card as any} />
    </div>
  );
}
