"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setJournalStatus } from "@/app/admin/journal/[id]/actions";

interface JournalStatusToggleProps {
  id: string;
  currentStatus: "draft" | "published";
}

export default function JournalStatusToggle({ id, currentStatus }: JournalStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = currentStatus === "published" ? "draft" : "published";
    startTransition(async () => {
      await setJournalStatus(id, next);
      router.refresh();
    });
  }

  const isPublished = currentStatus === "published";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={
        isPublished
          ? "px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.18em] border border-bb-line text-bb-on-surface hover:border-bb-tertiary hover:text-bb-tertiary transition-colors disabled:opacity-50"
          : "px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.18em] bg-green-700 text-white hover:bg-green-800 transition-colors disabled:opacity-50"
      }
    >
      {isPending ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
