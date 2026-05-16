import { createServiceRoleClient } from "@/lib/supabase/service";

export async function listAuditLog(params: {
  entityType?: string;
  action?: string;
  range?: "7d" | "30d" | "all";
  page?: number;
}) {
  const supabase = createServiceRoleClient();
  const pageSize = 50;
  const rawPage = params.page;
  const safePage =
    typeof rawPage === "number" && Number.isFinite(rawPage) && rawPage > 0
      ? rawPage
      : 1;
  const page = safePage - 1;

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

  // Resolve actor display names. The DB trigger captures `auth.uid()`
  // which is null for service-role writes (every /admin/* action), so
  // we fall back to row-state stamps: after_state.updated_by /
  // .created_by, then before_state. ActivityLogTable also reads this
  // map per-row to render the right name.
  const resolvedActorByEntry = new Map<string, string | null>();
  const actorIds = new Set<string>();
  for (const r of data ?? []) {
    const after = (r.after_state ?? {}) as Record<string, unknown>;
    const before = (r.before_state ?? {}) as Record<string, unknown>;
    const cand =
      r.actor_id ??
      after.updated_by ??
      after.created_by ??
      before.updated_by ??
      before.created_by;
    const id = typeof cand === "string" && cand ? cand : null;
    resolvedActorByEntry.set(r.id, id);
    if (id) actorIds.add(id);
  }

  const actorMap = new Map<string, string>();
  if (actorIds.size > 0) {
    const { data: admins } = await supabase
      .from("admin_users")
      .select("id, email, display_name")
      .in("id", Array.from(actorIds));
    for (const a of admins ?? []) {
      actorMap.set(a.id, a.display_name || a.email);
    }
  }

  return {
    data: data ?? [],
    count: count ?? 0,
    page: page + 1,
    pageSize,
    actorMap,
    resolvedActorByEntry,
  };
}
