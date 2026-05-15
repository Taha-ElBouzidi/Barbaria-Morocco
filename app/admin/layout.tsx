import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin · Barbaria",
  robots: { index: false, follow: false },
};

// This layout wraps all /admin/* routes, including the public (auth) group
// (login, auth/callback). We cannot call requireAdmin() here because that
// would create an infinite redirect loop for the login page itself.
// The middleware (proxy.ts) is the single auth gate for protected /admin/*
// routes. Authenticated routes get AdminShell; unauthenticated pages (login)
// fall through to their own (auth) layout.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  return (
    <html lang="en">
      <body>
        <a
          href="#admin-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-bb-primary focus:text-white focus:rounded-sm focus:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        >
          Skip to content
        </a>
        {admin ? <AdminShell admin={admin}>{children}</AdminShell> : children}
      </body>
    </html>
  );
}
