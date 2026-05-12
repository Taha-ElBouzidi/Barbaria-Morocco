"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAtelier } from "@/app/admin/ateliers/[id]/actions";

interface AtelierDeleteButtonProps {
  id: string;
  name: string;
}

export default function AtelierDeleteButton({ id, name }: AtelierDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${name}"?\n\nThis will permanently remove the atelier and all its translations. This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAtelier(id);
      if (result.ok) {
        router.push("/admin/ateliers");
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
