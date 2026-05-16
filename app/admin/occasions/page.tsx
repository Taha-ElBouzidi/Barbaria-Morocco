import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listOccasionsForAdmin } from "@/lib/admin/occasions";
import OccasionsList from "./_components/OccasionsList";
import Icon from "@/components/primitives/Icon";

export default async function OccasionsPage() {
  await requireAdmin();
  const occasions = await listOccasionsForAdmin();
  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[24px] sm:text-[28px] leading-none text-bb-primary">Occasions</h1>
          <p className="font-sans text-[12px] sm:text-[13px] text-bb-on-surface-variant mt-2 max-w-[640px]">
            Events the house surfaces in the contact form dropdown. Add seasonal moments (Mother&apos;s Day, Eid, Christmas) to keep the list relevant.
          </p>
        </div>
        <Link
          href="/admin/occasions/new"
          className="shrink-0 inline-flex items-center justify-center gap-2 h-[44px] w-[44px] sm:w-auto sm:px-4 bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
          aria-label="New occasion"
        >
          <Icon name="plus" size={16} />
          <span className="hidden sm:inline">New</span>
        </Link>
      </header>
      <OccasionsList occasions={occasions} />
    </div>
  );
}
