import Link from "next/link";
import { listProductsForAdmin } from "@/lib/admin/products";
import ProductsList from "./_components/ProductsList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            Admin / Products
          </p>
          <h1 className="font-serif text-[36px] leading-tight">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          + New product
        </Link>
      </header>

      <ProductsList products={products as any} supabaseUrl={supabaseUrl} />
    </div>
  );
}
