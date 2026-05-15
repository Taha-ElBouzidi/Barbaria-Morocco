import Link from "next/link";
import AtelierEditor from "../_components/AtelierEditor";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NewAtelierPage() {
  await requireAdmin();
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Link
          href="/admin/ateliers"
          className="font-sans text-[12px] text-bb-on-surface-variant hover:text-bb-primary transition-colors"
        >
          ← Ateliers
        </Link>
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Ateliers / New
          </p>
          <h1 className="font-serif text-[32px] leading-tight">New atelier</h1>
        </div>
      </header>

      <AtelierEditor />
    </div>
  );
}
