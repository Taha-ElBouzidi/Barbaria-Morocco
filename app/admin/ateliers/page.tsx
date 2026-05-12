import Link from "next/link";
import { listAteliersForAdmin } from "@/lib/admin/ateliers";
import AteliersList from "./_components/AteliersList";

export const dynamic = "force-dynamic";

export default async function AdminAteliersPage() {
  const ateliers = await listAteliersForAdmin();

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Ateliers
          </p>
          <h1 className="font-serif text-[36px] leading-tight">Ateliers</h1>
        </div>
        <Link
          href="/admin/ateliers/new"
          className="bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          + New atelier
        </Link>
      </header>

      <AteliersList ateliers={ateliers as any} />
    </div>
  );
}
