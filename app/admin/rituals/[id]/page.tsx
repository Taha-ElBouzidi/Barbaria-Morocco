import { notFound } from "next/navigation";
import Link from "next/link";
import { getRitualForEdit } from "@/lib/admin/rituals";
import RitualEditor from "../_components/RitualEditor";
import SubcatList from "../_components/SubcatList";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRitualPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const ritual = await getRitualForEdit(id);
  if (!ritual) notFound();

  const enT = (ritual.translations as any[]).find((t: any) => t.locale === "en");

  return (
    <div className="space-y-12">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/rituals"
          className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
        >
          ← Rituals
        </Link>
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
            Admin / Rituals / {id}
          </p>
          <h1 className="font-serif text-[32px] leading-tight capitalize">
            {enT?.name ?? id}
          </h1>
        </div>
      </header>

      <RitualEditor id={id} initialData={ritual as any} />

      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Sub-categories
        </h2>
        <SubcatList
          ritualId={id}
          subcategories={(ritual.subcategories ?? []) as any}
        />
      </section>
    </div>
  );
}
