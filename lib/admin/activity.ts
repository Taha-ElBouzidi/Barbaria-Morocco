import { createServiceRoleClient } from "@/lib/supabase/service";

export async function listAuditLog(params: {
  entityType?: string;
  action?: string;
  range?: "7d" | "30d" | "all";
  page?: number;
}) {
  const supabase = createServiceRoleClient();
  const pageSize = 50;
  const page = Math.max(0, (params.page ?? 1) - 1);

  let q = supabase
    .from("audit_log")
    .select(
      `id, actor_id, entity_type, entity_id, action, before_state, after_state, created_at`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (params.entityType && params.entityType !== "all") {
    q = q.eq("entity_type", params.entityType);
  }
  if (params.action && params.action !== "all") {
    q = q.eq("action", params.action);
  }
  if (params.range && params.range !== "all") {
    const days = params.range === "7d" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
    q = q.gte("created_at", cutoff);
  }

  q = q.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, count, error } = await q;
  if (error) throw new Error(`listAuditLog: ${error.message}`);

  // Resolve actor display names in one extra query
  const actorIds = [
    ...new Set(data?.map((r) => r.actor_id).filter(Boolean) ?? []),
  ] as string[];

  const actorMap = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: admins } = await supabase
      .from("admin_users")
      .select("id, email, display_name")
      .in("id", actorIds);
    for (const a of admins ?? []) {
      actorMap.set(a.id, a.display_name || a.email);
    }
  }

  return { data: data ?? [], count: count ?? 0, page: page + 1, pageSize, actorMap };
}
