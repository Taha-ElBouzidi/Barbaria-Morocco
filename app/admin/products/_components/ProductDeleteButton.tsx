"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/products/[id]/actions";

interface ProductDeleteButtonProps {
  id: string;
  slug: string;
}

export default function ProductDeleteButton({ id, slug }: ProductDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${slug}"?\n\nThis will permanently remove the product and all its translations, images, facets, and steps. This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.ok) {
        router.push("/admin/products");
      } else {
        alert(`Delete failed: ${result.error}`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.18em] border border-bb-tertiary text-bb-tertiary hover:bg-bb-tertiary hover:text-bb-bg transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
