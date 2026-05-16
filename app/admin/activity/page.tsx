import Link from "next/link";
import { listAuditLog } from "@/lib/admin/activity";
import ActivityLogTable from "../_components/ActivityLogTable";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const ENTITY_TYPES = [
  { value: "all", label: "All" },
  { value: "gift_box", label: "Gift box" },
  { value: "product", label: "Product" },
  { value: "occasion", label: "Occasion" },
  { value: "journal_card", label: "Journal" },
  { value: "atelier", label: "Atelier" },
  { value: "category", label: "Category" },
  { value: "facet", label: "Tag" },
  { value: "inquiry", label: "Inquiry" },
];

const ACTIONS = [
  { value: "all", label: "All" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "publish", label: "Publish" },
  { value: "unpublish", label: "Unpublish" },
  { value: "status_change", label: "Status change" },
];

const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

interface PageProps {
  searchParams: Promise<{
    entityType?: string;
    action?: string;
    range?: string;
    page?: string;
  }>;
}

export default async function AdminActivityPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const entityType = params.entityType ?? "all";
  const action = params.action ?? "all";
  const range = (params.range ?? "30d") as "7d" | "30d" | "all";
  const parsedPage = parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data, count, pageSize, actorMap } = await listAuditLog({
    entityType,
    action,
    range,
    page,
  });

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function filterUrl(overrides: Record<string, string>) {
    const sp = new URLSearchParams({
      ...(entityType !== "all" ? { entityType } : {}),
      ...(action !== "all" ? { action } : {}),
      ...(range !== "30d" ? { range } : {}),
      ...overrides,
    });
    // Drop page=1 from URL
    if (sp.get("page") === "1") sp.delete("page");
    return `/admin/activity${sp.toString() ? `?${sp}` : ""}`;
  }

  // Convert Map to plain object for the client component
  const actorMapObj = Object.fromEntries(actorMap);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Admin / Activity
        </p>
        <h1 className="font-serif text-[36px] leading-tight">Activity log</h1>
      </header>

      {/* Filters */}
      <div className="space-y-4">
        {/* Entity type filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant w-24 shrink-0">
            Entity
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ENTITY_TYPES.map((opt) => (
              <Link
                key={opt.value}
                href={filterUrl({
                  entityType: opt.value === "all" ? "" : opt.value,
                  page: "1",
                })}
                className={`px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                  entityType === opt.value
                    ? "border-bb-primary text-bb-primary bg-bb-bg-low"
                    : "border-bb-line text-bb-on-surface-variant hover:border-bb-primary"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Action filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant w-24 shrink-0">
            Action
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={filterUrl({
                  action: opt.value === "all" ? "" : opt.value,
                  page: "1",
                })}
                className={`px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                  action === opt.value
                    ? "border-bb-primary text-bb-primary bg-bb-bg-low"
                    : "border-bb-line text-bb-on-surface-variant hover:border-bb-primary"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant w-24 shrink-0">
            Period
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DATE_RANGES.map((opt) => (
              <Link
                key={opt.value}
                href={filterUrl({
                  range: opt.value === "30d" ? "" : opt.value,
                  page: "1",
                })}
                className={`px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                  range === opt.value
                    ? "border-bb-primary text-bb-primary bg-bb-bg-low"
                    : "border-bb-line text-bb-on-surface-variant hover:border-bb-primary"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="font-sans text-[12px] text-bb-on-surface-variant">
        {count} entr{count !== 1 ? "ies" : "y"}
      </p>

      {/* Table (client component for expand-to-diff) */}
      <ActivityLogTable entries={data as any} actorMap={actorMapObj} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={filterUrl({ page: String(page - 1) })}
              className="px-4 py-2 border border-bb-line font-sans text-[12px] uppercase tracking-[0.14em] hover:border-bb-primary transition-colors"
            >
              ← Previous
            </Link>
          )}
          <span className="font-sans text-[12px] text-bb-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={filterUrl({ page: String(page + 1) })}
              className="px-4 py-2 border border-bb-line font-sans text-[12px] uppercase tracking-[0.14em] hover:border-bb-primary transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
