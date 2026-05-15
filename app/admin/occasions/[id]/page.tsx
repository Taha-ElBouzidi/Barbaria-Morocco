import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getOccasionForAdmin } from "@/lib/admin/occasions";
import OccasionEditor from "../_components/OccasionEditor";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditOccasionPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const detail = await getOccasionForAdmin(id);
  if (!detail) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/admin/occasions" className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary inline-flex items-center gap-1">
          ← Occasions
        </Link>
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="font-serif text-[28px] leading-none text-bb-primary">{detail.nameEn}</h1>
          <span
            className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
              detail.status === "published"
                ? "bg-bb-secondary/15 text-bb-secondary-deep"
                : "bg-bb-bg-mid text-bb-on-surface-variant"
            }`}
          >
            {detail.status}
          </span>
        </div>
        <p className="font-sans text-[13px] text-bb-on-surface-variant">
          <span className="font-mono">{detail.slug}</span>
        </p>
        {saved === "1" && (
          <p role="status" className="inline-block px-4 py-2 bg-bb-secondary/15 text-bb-secondary-deep text-[12px] uppercase tracking-[0.18em]">
            Saved
          </p>
        )}
      </header>
      <OccasionEditor initial={detail} />
    </div>
  );
}
