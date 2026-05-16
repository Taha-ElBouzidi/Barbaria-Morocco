"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";

const InquiryUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "won", "lost"]),
  notes: z.string().max(4000).nullable().default(null),
});

export type UpdateInquiryResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateInquiry(id: string, formData: FormData): Promise<UpdateInquiryResult> {
  await requireAdmin();
  const parsed = InquiryUpdateSchema.safeParse({
    status: String(formData.get("status") ?? "new"),
    notes: (formData.get("notes") as string | null) || null,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status: parsed.data.status, notes: parsed.data.notes })
    .eq("id", id);
  if (error) {
    console.error("[updateInquiry] failed:", { id, error });
    return { ok: false, error: `Could not save: ${error.message}` };
  }
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
  return { ok: true };
}
