import Link from "next/link";
import { listProductsForAdmin } from "@/lib/admin/products";
import ProductsList from "./_components/ProductsList";
import Icon from "@/components/primitives/Icon";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listProductsForAdmin();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Products
          </p>
          <h1 className="font-serif text-[24px] sm:text-[36px] leading-tight">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="shrink-0 inline-flex items-center justify-center gap-2 h-[44px] w-[44px] sm:w-auto sm:px-4 bg-bb-primary text-bb-bg font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
          aria-label="New product"
        >
          <Icon name="plus" size={16} />
          <span className="hidden sm:inline">New</span>
        </Link>
      </header>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProductsList products={products as any} supabaseUrl={supabaseUrl} />
    </div>
  );
}
