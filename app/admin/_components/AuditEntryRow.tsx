"use client";

import { useState } from "react";

interface AuditEntry {
  id: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  created_at: string;
}

interface AuditEntryRowProps {
  entry: AuditEntry;
  actor: string;
  entityRef: string;
  relativeTime: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AuditEntryRow({
  entry,
  actor,
  entityRef,
  relativeTime,
  isExpanded,
  onToggle,
}: AuditEntryRowProps) {
  const state = entry.after_state ?? entry.before_state;

  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low cursor-pointer transition-colors"
        aria-expanded={isExpanded}
      >
        <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface whitespace-nowrap">
          <span title={entry.created_at}>{relativeTime}</span>
        </td>
        <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
          {actor}
        </td>
        <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
          {entry.entity_type}
        </td>
        <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface font-medium max-w-[160px] truncate">
          {entityRef}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.12em] ${
              entry.action === "create"
                ? "bg-green-50 text-green-700"
                : entry.action === "delete"
                  ? "bg-red-50 text-red-700"
                  : entry.action === "publish"
                    ? "bg-blue-50 text-blue-700"
                    : entry.action === "unpublish"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-bb-bg-low text-bb-on-surface-variant"
            }`}
          >
            {entry.action}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-sans text-[11px] text-bb-secondary-deep select-none">
            {isExpanded ? "▲" : "▼"}
          </span>
        </td>
      </tr>
      {isExpanded && state && (
        <tr className="border-b border-bb-line bg-bb-bg-low">
          <td colSpan={6} className="px-4 py-4">
            <pre className="font-mono text-[11px] leading-relaxed text-bb-on-surface overflow-x-auto whitespace-pre-wrap max-h-[320px] overflow-y-auto">
              {JSON.stringify(state, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
