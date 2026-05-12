import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

const ReorderSchema = z.object({
  images: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Update each image sort_order
  await Promise.all(
    parsed.data.images.map(({ id, sort_order }) =>
      supabase.from("product_images").update({ sort_order }).eq("id", id)
    )
  );

  return NextResponse.json({ ok: true });
}
