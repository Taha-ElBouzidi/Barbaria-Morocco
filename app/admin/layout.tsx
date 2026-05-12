import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin · Barbaria",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin(); // redirects to /admin/login if not signed in
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
