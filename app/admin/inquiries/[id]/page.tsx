import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiryById } from "@/lib/admin/inquiries";
import { requireAdmin } from "@/lib/admin/auth";
import InquiryControls from "./InquiryControls";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  quoted: "bg-purple-50 text-purple-700",
  won: "bg-green-50 text-green-700",
  lost: "bg-red-50 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.12em] ${STATUS_COLORS[status] ?? "bg-bb-bg-low text-bb-on-surface-variant"}`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const inquiry = await getInquiryById(id);

  if (!inquiry) notFound();

  const replySubject = encodeURIComponent(
    `Re: Barbaria Concierge inquiry, ${inquiry.company}`
  );
  const mailtoHref = `mailto:${inquiry.email}?subject=${replySubject}`;
  const totalUnits = inquiry.items.reduce((sum, l) => sum + l.qty, 0);

  return (
    <div className="space-y-6 md:space-y-8">
      <nav className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant">
        <Link href="/admin/inquiries" className="hover:text-bb-primary transition-colors">
          Inquiries
        </Link>
        <span>→</span>
        <span className="text-bb-on-surface truncate max-w-[200px] md:max-w-none">{inquiry.company}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-[24px] md:text-[36px] leading-tight">{inquiry.company}</h1>
            <StatusBadge status={inquiry.status} />
          </div>
        </div>
        <a
          href={mailtoHref}
          className="shrink-0 bg-bb-primary text-bb-bg px-4 md:px-6 py-3 min-h-[44px] inline-flex items-center justify-center font-sans text-[11px] md:text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          Reply via email
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        <section className="space-y-6">
          <div className="border border-bb-line divide-y divide-bb-line">
            <h2 className="px-4 md:px-6 py-3 md:py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Contact details
            </h2>
            {[
              { label: "Contact name", value: inquiry.contact_name },
              { label: "Email", value: inquiry.email },
              { label: "Phone", value: inquiry.phone ?? "—" },
              { label: "Company", value: inquiry.company },
              { label: "Locale", value: inquiry.locale ?? "—" },
              { label: "Received", value: formatDate(inquiry.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 md:px-6 py-3 flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant w-32 shrink-0 pt-0.5">
                  {label}
                </span>
                <span className="font-sans text-[13px] text-bb-on-surface break-words">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {(inquiry.occasion || inquiry.event_date) && (
            <div className="border border-bb-line divide-y divide-bb-line">
              <h2 className="px-4 md:px-6 py-3 md:py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
                The moment
              </h2>
              {[
                { label: "Occasion", value: inquiry.occasion ?? "—" },
                { label: "Event date", value: formatDate(inquiry.event_date) },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 md:px-6 py-3 flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant w-32 shrink-0 pt-0.5">
                    {label}
                  </span>
                  <span className="font-sans text-[13px] text-bb-on-surface">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {inquiry.message && (
            <div className="border border-bb-line">
              <h2 className="px-4 md:px-6 py-3 md:py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
                Message
              </h2>
              <p className="px-4 md:px-6 py-4 font-sans text-[13px] text-bb-on-surface leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>
          )}

          <div className="border border-bb-line">
            <h2 className="px-4 md:px-6 py-3 md:py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Status &amp; notes
            </h2>
            <InquiryControls
              id={inquiry.id}
              initialStatus={inquiry.status}
              initialNotes={inquiry.notes ?? ""}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="border border-bb-line">
            <h2 className="px-4 md:px-6 py-3 md:py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Boxes requested ({inquiry.items.length}) · {totalUnits} units
            </h2>
            {inquiry.items.length === 0 ? (
              <p className="px-4 md:px-6 py-4 font-sans text-[13px] text-bb-on-surface-variant italic">
                No boxes attached.
              </p>
            ) : (
              <ul className="divide-y divide-bb-line">
                {inquiry.items.map((line) => (
                  <li key={line.id} className="px-4 md:px-6 py-3 space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-sans text-[13px] text-bb-on-surface font-medium leading-tight">
                        {line.boxName}
                      </p>
                      <span className="shrink-0 font-sans text-[12px] text-bb-secondary-deep">
                        × {line.qty}
                      </span>
                    </div>
                    <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-bb-on-surface-variant">
                      {line.is_custom ? "Custom box" : "Curated box"}
                      {line.categorySlug && ` · ${line.categorySlug.replace("_", " ")}`}
                    </p>
                    {line.is_custom && line.compositionNames.length > 0 && (
                      <ul className="pl-3 border-l-2 border-bb-secondary-deep/30 space-y-1">
                        {line.compositionNames.map((n, i) => (
                          <li
                            key={i}
                            className="font-sans text-[12px] text-bb-on-surface-variant"
                          >
                            {n}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
