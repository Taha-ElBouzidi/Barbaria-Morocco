import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

const ENTITY_LABEL: Record<string, string> = {
  product: "product",
  journal_card: "journal entry",
  atelier: "atelier",
  facet: "facet",
  inquiry: "inquiry",
};

const ACTION_VERB: Record<string, string> = {
  create: "created",
  update: "edited",
  delete: "deleted",
  publish: "published",
  unpublish: "unpublished",
  status_change: "changed status of",
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.round((now - then) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return `${Math.round(sec / 86400)}d ago`;
}

/**
 * Audit-log actor fallback. The DB trigger uses `auth.uid()` which is
 * always null for service-role writes (every /admin/* action). We
 * stamp `updated_by` / `created_by` on row writes so the trigger's
 * captured `after_state` / `before_state` JSONB carries the actor.
 * This helper picks the first non-null actor id from that chain.
 */
function resolveActorId(e: {
  actor_id: string | null;
  after_state: unknown;
  before_state: unknown;
}): string | null {
  if (e.actor_id) return e.actor_id;
  const after = (e.after_state ?? {}) as Record<string, unknown>;
  const before = (e.before_state ?? {}) as Record<string, unknown>;
  const cand =
    after.updated_by ?? after.created_by ?? before.updated_by ?? before.created_by;
  return typeof cand === "string" && cand ? cand : null;
}

export default async function ActivityFeed() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, entity_type, entity_id, action, created_at, actor_id, after_state, before_state")
    .order("created_at", { ascending: false })
    .limit(10);

  const entries = data ?? [];

  // Resolve actor ids via the fallback chain (trigger column or
  // row-state stamps) into a single batched admin_users lookup.
  const actorIdByEntry = new Map<string, string | null>();
  const actorIds = new Set<string>();
  for (const e of entries) {
    const id = resolveActorId(e);
    actorIdByEntry.set(e.id, id);
    if (id) actorIds.add(id);
  }
  const actorMap = new Map<string, string>();
  if (actorIds.size > 0) {
    const service = createServiceRoleClient();
    const { data: admins } = await service
      .from("admin_users")
      .select("id, email, display_name")
      .in("id", Array.from(actorIds));
    for (const a of admins ?? []) {
      actorMap.set(a.id, a.display_name || a.email);
    }
  }

  return (
    <section>
      <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-4">
        Recent activity
      </h2>
      {entries.length === 0 ? (
        <p className="font-display italic text-bb-on-surface-variant">No activity yet.</p>
      ) : (
        <ul className="divide-y divide-bb-line border-y border-bb-line">
          {entries.map((e) => {
            const entityLabel = ENTITY_LABEL[e.entity_type] ?? e.entity_type;
            const verb = ACTION_VERB[e.action] ?? e.action;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = (e.after_state as any) || (e.before_state as any) || {};
            const name = state.slug || state.name || state.id || e.entity_id;
            const actorId = actorIdByEntry.get(e.id);
            const actor = actorId
              ? actorMap.get(actorId) ?? "Unknown admin"
              : "System";
            return (
              <li key={e.id} className="py-3 flex items-baseline justify-between gap-4">
                <p className="font-sans text-[13px] text-bb-on-surface">
                  <span className="font-medium">{actor}</span> {verb}{" "}
                  {entityLabel}{" "}
                  <span className="font-medium">{name}</span>
                </p>
                <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant whitespace-nowrap">
                  {formatRelative(e.created_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
