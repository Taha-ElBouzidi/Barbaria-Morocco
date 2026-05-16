import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listGiftBoxesForAdmin } from "@/lib/admin/gift-boxes";
import GiftBoxesList from "./_components/GiftBoxesList";
import Icon from "@/components/primitives/Icon";

export const dynamic = "force-dynamic";

export default async function GiftBoxesPage() {
  await requireAdmin();
  const boxes = await listGiftBoxesForAdmin();
  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[24px] sm:text-[28px] leading-none text-bb-primary">Gift boxes</h1>
          <p className="font-sans text-[12px] sm:text-[13px] text-bb-on-surface-variant mt-2 max-w-[640px]">
            Curated and customizable boxes per category. Publish to surface on the public site.
          </p>
        </div>
        <Link
          href="/admin/gift-boxes/new"
          className="shrink-0 inline-flex items-center justify-center gap-2 h-[44px] w-[44px] sm:w-auto sm:px-4 bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
          aria-label="New gift box"
        >
          <Icon name="plus" size={16} />
          <span className="hidden sm:inline">New</span>
        </Link>
      </header>
      <GiftBoxesList boxes={boxes} />
    </div>
  );
}
