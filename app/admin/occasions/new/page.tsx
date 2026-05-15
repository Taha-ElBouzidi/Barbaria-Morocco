import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import OccasionEditor from "../_components/OccasionEditor";

export default async function NewOccasionPage() {
  await requireAdmin();
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/admin/occasions" className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary inline-flex items-center gap-1">
          ← Occasions
        </Link>
        <h1 className="font-serif text-[28px] leading-none text-bb-primary">New occasion</h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-[640px]">
          Creates a published occasion. Unpublish from the edit page if you need to hide it from the contact form.
        </p>
      </header>
      <OccasionEditor />
    </div>
  );
}
