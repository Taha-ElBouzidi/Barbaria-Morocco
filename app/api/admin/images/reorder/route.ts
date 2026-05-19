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

  // Update each image sort_order. Collect per-row errors so the client
  // sees a real failure when a single update fails, the old
  // Promise.all swallowed errors and always returned ok:true.
  const results = await Promise.all(
    parsed.data.images.map(({ id, sort_order }) =>
      supabase.from("product_images").update({ sort_order }).eq("id", id)
    )
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) {
    console.error("[images/reorder] update failed:", firstError);
    return NextResponse.json(
      { ok: false, error: `Reorder failed: ${firstError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
