import { requireAdmin } from "@/lib/admin/auth";
import { getSiteSettingsForAdmin } from "@/lib/admin/site-settings";
import SettingsEditor from "./SettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const initial = await getSiteSettingsForAdmin();
  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Admin / Settings
        </p>
        <h1 className="font-serif text-[24px] sm:text-[36px] leading-tight">Site settings</h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-[640px]">
          Social media handles + contact information for the public footer, mobile menu, and contact page. Updates show up on the public site within a minute.
        </p>
      </header>
      <SettingsEditor initial={initial} />
    </div>
  );
}
