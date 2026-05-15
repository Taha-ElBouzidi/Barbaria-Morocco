"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";

const InquiryUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "won", "lost"]),
  notes: z.string().max(4000).nullable().default(null),
});

export async function updateInquiry(id: string, formData: FormData) {
  await requireAdmin();
  const data = InquiryUpdateSchema.parse({
    status: String(formData.get("status") ?? "new"),
    notes: (formData.get("notes") as string | null) || null,
  });
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status: data.status, notes: data.notes })
    .eq("id", id);
  if (error) throw new Error(`inquiry update: ${error.message}`);
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
}
