"use client";

import AuditEntryRow from "./AuditEntryRow";

interface AuditEntry {
  id: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  before_state: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  after_state: any;
  created_at: string;
}

interface ActivityLogTableProps {
  entries: AuditEntry[];
  actorMap: Record<string, string>;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.round((now - then) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return `${Math.round(sec / 86400)}d ago`;
}

function extractEntityRef(entry: AuditEntry): string {
  const state = entry.after_state ?? entry.before_state ?? {};
  return state.slug ?? state.name ?? entry.entity_id;
}

export default function ActivityLogTable({
  entries,
  actorMap,
}: ActivityLogTableProps) {
  if (entries.length === 0) {
    return (
      <p className="font-display italic text-bb-on-surface-variant py-8 text-center">
        No activity entries match the current filters.
      </p>
    );
  }

  return (
    <div className="border border-bb-line overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bb-line bg-bb-bg-low">
            <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant whitespace-nowrap">
              When
            </th>
            <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Who
            </th>
            <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Entity type
            </th>
            <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Entity ref
            </th>
            <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const actor = entry.actor_id
              ? (actorMap[entry.actor_id] ?? entry.actor_id)
              : "system";
            const entityRef = extractEntityRef(entry);
            const relativeTime = formatRelative(entry.created_at);

            return (
              <AuditEntryRow
                key={entry.id}
                entry={entry}
                actor={actor}
                entityRef={entityRef}
                relativeTime={relativeTime}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
