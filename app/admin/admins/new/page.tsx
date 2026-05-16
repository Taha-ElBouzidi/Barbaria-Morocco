import Link from "next/link";
import { requireSuperadmin } from "@/lib/admin/auth";
import NewAdminForm from "../_components/NewAdminForm";

export const dynamic = "force-dynamic";

export default async function NewAdminPage() {
  await requireSuperadmin();
  return (
    <div className="space-y-6 lg:space-y-8 max-w-3xl">
      <nav
        aria-label="Breadcrumb"
        className="font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant flex items-center gap-2"
      >
        <Link href="/admin/admins" className="hover:text-bb-primary transition-colors">
          Admins
        </Link>
        <span aria-hidden="true">→</span>
        <span className="text-bb-on-surface">New</span>
      </nav>
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Admin / Admins / New
        </p>
        <h1 className="font-serif text-[28px] sm:text-[36px] leading-tight">
          Add an admin
        </h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-prose">
          The house creates an auth user with a generated password we show once.
          Share it privately. The new admin can change it via the Supabase dashboard.
        </p>
      </header>
      <NewAdminForm />
    </div>
  );
}
