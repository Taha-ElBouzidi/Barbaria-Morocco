import { requireAdmin } from "@/lib/admin/auth";
import { listGiftBoxesForAdmin } from "@/lib/admin/gift-boxes";
import GiftBoxesList from "./_components/GiftBoxesList";

export default async function GiftBoxesPage() {
  await requireAdmin();
  const boxes = await listGiftBoxesForAdmin();
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] leading-none text-bb-primary">Gift boxes</h1>
          <p className="font-sans text-[13px] text-bb-on-surface-variant mt-2">
            Curated and customizable boxes per category. Publish to surface on the public site.
          </p>
        </div>
        <a
          href="/admin/gift-boxes/new"
          className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          + New gift box
        </a>
      </header>
      <GiftBoxesList boxes={boxes} />
    </div>
  );
}
