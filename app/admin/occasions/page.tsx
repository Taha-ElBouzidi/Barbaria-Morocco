import { requireAdmin } from "@/lib/admin/auth";
import { listOccasionsForAdmin } from "@/lib/admin/occasions";
import OccasionsList from "./_components/OccasionsList";

export default async function OccasionsPage() {
  await requireAdmin();
  const occasions = await listOccasionsForAdmin();
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] leading-none text-bb-primary">Occasions</h1>
          <p className="font-sans text-[13px] text-bb-on-surface-variant mt-2">
            Events the maison surfaces in the contact form dropdown. Add seasonal moments (Mother&apos;s Day, Eid, Christmas) to keep the list relevant.
          </p>
        </div>
        <a
          href="/admin/occasions/new"
          className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          + New occasion
        </a>
      </header>
      <OccasionsList occasions={occasions} />
    </div>
  );
}
