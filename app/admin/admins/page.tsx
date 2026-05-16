import Link from "next/link";
import { requireSuperadmin } from "@/lib/admin/auth";
import { listAdminUsers } from "@/lib/admin/users";
import AdminsList from "./_components/AdminsList";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const me = await requireSuperadmin();
  const admins = await listAdminUsers();
  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
            Admin / Admins
          </p>
          <h1 className="font-serif text-[28px] sm:text-[36px] leading-tight">
            Admin accounts
          </h1>
          <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-prose">
            Add new admins, promote to superadmin, or revoke access. Only superadmins
            can open this page.
          </p>
        </div>
        <Link
          href="/admin/admins/new"
          className="shrink-0 inline-flex items-center justify-center px-4 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          New admin
        </Link>
      </header>
      <AdminsList admins={admins} currentUserId={me.id} />
    </div>
  );
}
