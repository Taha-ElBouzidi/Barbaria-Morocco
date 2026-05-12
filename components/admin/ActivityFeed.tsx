import { createServerClient } from "@/lib/supabase/server";

const ENTITY_LABEL: Record<string, string> = {
  product: "product",
  journal_card: "journal entry",
  atelier: "atelier",
  ritual: "ritual",
  ritual_subcategory: "sub-category",
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

export default async function ActivityFeed() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id, entity_type, entity_id, action, created_at, actor_id, after_state, before_state")
    .order("created_at", { ascending: false })
    .limit(10);

  const entries = data ?? [];

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
            // Try to extract a human name from after_state or before_state.
            // actor names resolve to "Someone" until Sprint 2.5 adds actor_id lookup.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = (e.after_state as any) || (e.before_state as any) || {};
            const name = state.slug || state.name || state.id || e.entity_id;
            return (
              <li key={e.id} className="py-3 flex items-baseline justify-between gap-4">
                <p className="font-sans text-[13px] text-bb-on-surface">
                  Someone {verb} {entityLabel}{" "}
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
