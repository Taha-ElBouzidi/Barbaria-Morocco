"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJournalCard } from "@/app/admin/journal/[id]/actions";

interface JournalDeleteButtonProps {
  id: string;
  slug: string;
}

export default function JournalDeleteButton({ id, slug }: JournalDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${slug}"?\n\nThis will permanently remove the journal card and all its translations. This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteJournalCard(id);
      if (result.ok) {
        router.push("/admin/journal");
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
