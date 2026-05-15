import { notFound } from "next/navigation";
import Link from "next/link";
import { getAtelierForEdit } from "@/lib/admin/ateliers";
import AtelierEditor from "../_components/AtelierEditor";
import AtelierDeleteButton from "../_components/AtelierDeleteButton";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditAtelierPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;

  const atelier = await getAtelierForEdit(id);
  if (!atelier) notFound();

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ateliers"
            className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
          >
            ← Ateliers
          </Link>
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
              Admin / Ateliers / Edit
            </p>
            <h1 className="font-serif text-[32px] leading-tight">{atelier.name}</h1>
          </div>
        </div>

        <AtelierDeleteButton id={id} name={atelier.name} />
      </header>

      {saved === "1" && (
        <div className="border border-green-200 bg-green-50 px-4 py-3">
          <p className="font-sans text-[13px] text-green-800">Atelier saved successfully.</p>
        </div>
      )}

      <AtelierEditor id={id} initialData={atelier as any} />
    </div>
  );
}
