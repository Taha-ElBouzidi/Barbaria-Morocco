import Link from "next/link";
import { listInquiries } from "@/lib/admin/inquiries";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700",
    contacted: "bg-yellow-50 text-yellow-700",
    quoted: "bg-purple-50 text-purple-700",
    won: "bg-green-50 text-green-700",
    lost: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.12em] ${colors[status] ?? "bg-bb-bg-low text-bb-on-surface-variant"}`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PageProps {
  searchParams: Promise<{ status?: string; sort?: string; page?: string }>;
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status ?? "all";
  const sort = params.sort ?? "newest";
  const page = parseInt(params.page ?? "1", 10);

  const { data, count, pageSize } = await listInquiries({ status, sort, page });
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function pageUrl(p: number) {
    const sp = new URLSearchParams({
      ...(status !== "all" ? { status } : {}),
      ...(sort !== "newest" ? { sort } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
    });
    return `/admin/inquiries${sp.toString() ? `?${sp}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Admin / Inquiries
        </p>
        <h1 className="font-serif text-[36px] leading-tight">Inquiries</h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant">
          B2B concierge requests
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <Link
                key={opt.value}
                href={pageUrl(1).replace(/(\?|$)/, (_, q) => {
                  const sp = new URLSearchParams({
                    ...(opt.value !== "all" ? { status: opt.value } : {}),
                    ...(sort !== "newest" ? { sort } : {}),
                  });
                  return sp.toString() ? `?${sp}` : "";
                })}
                aria-current={active ? "true" : undefined}
                className={`px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                  active
                    ? "border-bb-primary text-bb-primary bg-bb-bg-low"
                    : "border-bb-line text-bb-on-surface-variant hover:border-bb-primary"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant">
            Sort:
          </span>
          {SORT_OPTIONS.map((opt) => {
            const sp = new URLSearchParams({
              ...(status !== "all" ? { status } : {}),
              ...(opt.value !== "newest" ? { sort: opt.value } : {}),
            });
            const active = sort === opt.value;
            return (
              <Link
                key={opt.value}
                href={`/admin/inquiries${sp.toString() ? `?${sp}` : ""}`}
                aria-current={active ? "true" : undefined}
                className={`px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                  active
                    ? "border-bb-primary text-bb-primary bg-bb-bg-low"
                    : "border-bb-line text-bb-on-surface-variant hover:border-bb-primary"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table or empty state */}
      {count === 0 ? (
        <div className="border border-bb-line px-8 py-16 text-center space-y-4">
          <p className="font-display italic text-bb-on-surface-variant text-[22px]">
            No inquiries yet.
          </p>
          <p className="font-sans text-[13px] text-bb-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Inquiries from the public contact form appear here. Each row
            carries the buyer&apos;s company, the requested boxes (curated +
            custom), and the occasion. Click a row to view, reply, or update
            its status.
          </p>
        </div>
      ) : (
        <>
          <p className="font-sans text-[12px] text-bb-on-surface-variant">
            {count} inquir{count !== 1 ? "ies" : "y"}
          </p>
          {/* Mobile: stacked cards */}
          <div className="md:hidden flex flex-col gap-3">
            {data.map((inq) => (
              <Link
                key={inq.id}
                href={`/admin/inquiries/${inq.id}`}
                className="block p-4 border border-bb-line bg-bb-bg hover:border-bb-secondary-deep transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-sans text-[14px] text-bb-on-surface font-medium leading-tight flex-1 truncate">
                    {inq.company}
                  </p>
                  <span className="shrink-0">
                    <StatusBadge status={inq.status} />
                  </span>
                </div>
                <p className="font-sans text-[11px] text-bb-on-surface-variant truncate">
                  {inq.contact_name} · {inq.email}
                </p>
                <p className="font-sans text-[11px] text-bb-on-surface-variant">
                  {(inq.items as Array<unknown>).length} box{(inq.items as Array<unknown>).length !== 1 ? "es" : ""} · {formatDate(inq.created_at)}
                </p>
              </Link>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block border border-bb-line overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bb-line bg-bb-bg-low">
                  {[
                    "Company",
                    "Contact",
                    "Email",
                    "Items",
                    "Status",
                    "Received",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((inq) => (
                  <tr
                    key={inq.id}
                    className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low transition-colors"
                  >
                    <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium">
                      {inq.company}
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                      {inq.contact_name}
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                      <a
                        href={`mailto:${inq.email}`}
                        className="hover:text-bb-primary hover:underline"
                      >
                        {inq.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant text-center">
                      {(inq.items as Array<unknown>).length}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inq.status} />
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant whitespace-nowrap">
                      {formatDate(inq.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/inquiries/${inq.id}`}
                        aria-label={`View inquiry from ${inq.company}`}
                        className="font-sans text-[12px] text-bb-primary hover:underline whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
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
                  href={pageUrl(page + 1)}
                  className="px-4 py-2 border border-bb-line font-sans text-[12px] uppercase tracking-[0.14em] hover:border-bb-primary transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
