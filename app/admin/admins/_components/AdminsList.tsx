"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminListRow } from "@/lib/admin/users";
import { updateAdminRole, deleteAdmin } from "../actions";

interface Props {
  admins: AdminListRow[];
  currentUserId: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminsList({ admins, currentUserId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  function onRoleChange(id: string, role: string) {
    setError(null);
    setWarning(null);
    setSavingId(id);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("role", role);
    startTransition(async () => {
      const res = await updateAdminRole(fd);
      if (!res.ok) setError(res.error ?? "Unknown error");
      setSavingId(null);
      router.refresh();
    });
  }

  function onDelete(id: string, email: string) {
    if (!confirm(`Delete admin ${email}? They lose access immediately.`)) return;
    setError(null);
    setWarning(null);
    setSavingId(id);
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const res = await deleteAdmin(fd);
      if (!res.ok) {
        setError(res.error ?? "Unknown error");
      } else if (res.warning) {
        setWarning(res.warning);
      }
      setSavingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p
          role="alert"
          className="px-4 py-3 border border-red-200 bg-red-50 text-red-800 font-sans text-[13px]"
        >
          {error}
        </p>
      )}
      {warning && (
        <p
          role="status"
          className="px-4 py-3 border border-yellow-300 bg-yellow-50 text-yellow-900 font-sans text-[13px]"
        >
          {warning}
        </p>
      )}

      <div className="border border-bb-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bb-line bg-bb-bg-low">
              {["Email", "Display name", "Role", "Last seen", "Created", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.id === currentUserId;
              const inactionable = pending && savingId === a.id;
              const isLegacyRole =
                a.role !== "admin" && a.role !== "superadmin";
              return (
                <tr
                  key={a.id}
                  className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low transition-colors"
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium break-all">
                    {a.email}
                    {isSelf && (
                      <span className="ml-2 inline-block px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.12em] bg-bb-bg-low text-bb-secondary-deep">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {a.displayName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`role-${a.id}`}>
                      Role for {a.email}
                    </label>
                    <select
                      id={`role-${a.id}`}
                      value={a.role}
                      onChange={(e) => onRoleChange(a.id, e.target.value)}
                      disabled={inactionable}
                      aria-describedby={
                        isLegacyRole ? `role-hint-${a.id}` : undefined
                      }
                      className="px-3 py-2 min-h-[36px] border border-bb-line bg-bb-bg text-bb-primary text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary disabled:opacity-50"
                    >
                      {/* When the row carries a legacy role (sales /
                          concierge / readonly), render the current
                          value as a hidden disabled option so the
                          <select> stays in sync. Picking "Admin" or
                          "Superadmin" then fires a real onChange,
                          rather than a silent no-op because the
                          ternary already chose "admin" as the value. */}
                      {isLegacyRole && (
                        <option value={a.role} disabled hidden>
                          {a.role}
                        </option>
                      )}
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {isLegacyRole && (
                      <p
                        id={`role-hint-${a.id}`}
                        className="font-sans text-[10px] text-bb-on-surface-variant mt-1"
                      >
                        Legacy: {a.role}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant whitespace-nowrap">
                    {formatDate(a.lastSeenAt)}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant whitespace-nowrap">
                    {formatDate(a.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(a.id, a.email)}
                      disabled={isSelf || inactionable}
                      aria-label={`Remove admin ${a.email}`}
                      className="font-sans text-[12px] text-red-700 hover:underline disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
