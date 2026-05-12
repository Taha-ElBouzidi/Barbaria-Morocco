import { createServiceRoleClient } from "@/lib/supabase/service";

export async function listInquiries(params: {
  status?: string;
  page?: number;
  sort?: string;
}) {
  const supabase = createServiceRoleClient();
  const pageSize = 25;
  const page = Math.max(0, (params.page ?? 1) - 1);

  let q = supabase
    .from("inquiries")
    .select(
      `
      id, company, contact_name, email, status, created_at, locale,
      items:inquiry_items ( product_id )
    `,
      { count: "exact" }
    );

  if (params.status && params.status !== "all") {
    q = q.eq("status", params.status);
  }

  const ascending = params.sort === "oldest";
  q = q.order("created_at", { ascending });
  q = q.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, count, error } = await q;
  if (error) throw new Error(`listInquiries: ${error.message}`);

  return { data: data ?? [], count: count ?? 0, page: page + 1, pageSize };
}

export async function getInquiryById(id: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      `
      *,
      items:inquiry_items (
        qty,
        product:products (
          id, slug, moq,
          translations:product_translations ( locale, name ),
          images:product_images ( path, sort_order )
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
