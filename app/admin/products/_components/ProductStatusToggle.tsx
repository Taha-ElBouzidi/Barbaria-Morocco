"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setStatus } from "@/app/admin/products/[id]/actions";
import { cn } from "@/lib/utils";

interface ProductStatusToggleProps {
  id: string;
  currentStatus: "draft" | "published";
}

export default function ProductStatusToggle({ id, currentStatus }: ProductStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = currentStatus === "published" ? "draft" : "published";
    startTransition(async () => {
      await setStatus(id, next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.18em] border transition-colors disabled:opacity-50",
        currentStatus === "published"
          ? "border-amber-300 text-amber-700 hover:bg-amber-50"
          : "border-green-300 text-green-700 hover:bg-green-50"
      )}
    >
      {isPending
        ? "Updating…"
        : currentStatus === "published"
          ? "Unpublish"
          : "Publish"}
    </button>
  );
}
