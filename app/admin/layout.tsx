import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Barbaria",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bb-bg-low text-bb-on-surface">{children}</div>;
}
