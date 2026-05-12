import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiryById } from "@/lib/admin/inquiries";

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
  if (!iso) return ",";
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
  const { id } = await params;
  const inquiry = await getInquiryById(id);

  if (!inquiry) notFound();

  const items = (inquiry.items as Array<{
    qty: number;
    product: {
      id: string;
      slug: string;
      moq: number;
      translations: Array<{ locale: string; name: string }>;
      images: Array<{ path: string; sort_order: number | null }>;
    } | null;
  }>) ?? [];

  const replySubject = encodeURIComponent(
    `Re: Barbaria Concierge inquiry, ${inquiry.company}`
  );
  const mailtoHref = `mailto:${inquiry.email}?subject=${replySubject}`;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant">
        <Link href="/admin/inquiries" className="hover:text-bb-primary transition-colors">
          Inquiries
        </Link>
        <span>→</span>
        <span className="text-bb-on-surface">{inquiry.company}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[36px] leading-tight">{inquiry.company}</h1>
            <StatusBadge status={inquiry.status} />
          </div>
        </div>
        <a
          href={mailtoHref}
          className="bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
        >
          Reply via email
        </a>
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left: Inquiry details */}
        <section className="space-y-6">
          <div className="border border-bb-line divide-y divide-bb-line">
            <h2 className="px-6 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Contact details
            </h2>
            {[
              { label: "Contact name", value: inquiry.contact_name },
              { label: "Email", value: inquiry.email },
              { label: "Phone", value: inquiry.phone ?? "," },
              { label: "Company", value: inquiry.company },
              { label: "Locale", value: inquiry.locale ?? "," },
              { label: "Received", value: formatDate(inquiry.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-3 flex gap-4">
                <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant w-32 shrink-0 pt-0.5">
                  {label}
                </span>
                <span className="font-sans text-[13px] text-bb-on-surface">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {(inquiry.occasion || inquiry.event_date || inquiry.quantity) && (
            <div className="border border-bb-line divide-y divide-bb-line">
              <h2 className="px-6 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
                Occasion
              </h2>
              {[
                { label: "Occasion", value: inquiry.occasion ?? "," },
                { label: "Event date", value: formatDate(inquiry.event_date) },
                { label: "Quantity", value: inquiry.quantity ?? "," },
              ].map(({ label, value }) => (
                <div key={label} className="px-6 py-3 flex gap-4">
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
              <h2 className="px-6 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
                Message
              </h2>
              <p className="px-6 py-4 font-sans text-[13px] text-bb-on-surface leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>
          )}

          {/* Status section (read-only in Sprint 2) */}
          <div className="border border-bb-line">
            <h2 className="px-6 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Status
            </h2>
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-sans text-[13px] text-bb-on-surface-variant">
                  Current:
                </span>
                <StatusBadge status={inquiry.status} />
              </div>
              <p className="font-sans text-[12px] text-bb-on-surface-variant italic">
                Status changes will be available in Sprint 3.
              </p>
            </div>
          </div>

          {/* Internal notes */}
          <div className="border border-bb-line">
            <h2 className="px-6 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Internal notes
            </h2>
            <div className="px-6 py-4">
              {inquiry.notes ? (
                <p className="font-sans text-[13px] text-bb-on-surface leading-relaxed whitespace-pre-wrap">
                  {inquiry.notes}
                </p>
              ) : (
                <p className="font-sans text-[13px] text-bb-on-surface-variant italic">
                  No notes yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Right: Items list */}
        <section className="space-y-4">
          <div className="border border-bb-line">
            <h2 className="px-6 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant bg-bb-bg-low">
              Requested items ({items.length})
            </h2>
            {items.length === 0 ? (
              <p className="px-6 py-4 font-sans text-[13px] text-bb-on-surface-variant italic">
                No items attached.
              </p>
            ) : (
              <ul className="divide-y divide-bb-line">
                {items.map((item, idx) => {
                  const product = item.product;
                  if (!product) return null;
                  const nameEn =
                    product.translations.find((t) => t.locale === "en")?.name ??
                    product.slug;
                  const heroImage = product.images.sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                  )[0];

                  return (
                    <li key={idx} className="px-4 py-3 flex items-center gap-3">
                      {heroImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={heroImage.path}
                          alt={nameEn}
                          className="w-12 h-12 object-cover shrink-0 bg-bb-bg-low"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-[13px] text-bb-on-surface font-medium truncate">
                          {nameEn}
                        </p>
                        <p className="font-sans text-[11px] text-bb-on-surface-variant">
                          Qty: {item.qty} · MOQ: {product.moq}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
