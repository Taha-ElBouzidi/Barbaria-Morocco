import Link from "next/link";
import { listRitualsForAdmin } from "@/lib/admin/rituals";

export const dynamic = "force-dynamic";

export default async function AdminRitualsPage() {
  const rituals = await listRitualsForAdmin();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
          Admin / Rituals
        </p>
        <h1 className="font-serif text-[36px] leading-tight">Rituals</h1>
        <p className="font-sans text-[13px] text-bb-on-surface-variant">
          3 fixed ritual rows. Edit translations, hero image, sort order, and sub-categories.
        </p>
      </header>

      <div className="border border-bb-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bb-line bg-bb-bg-low">
              <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                ID
              </th>
              <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                Name (EN)
              </th>
              <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                Sort
              </th>
              <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                Edit
              </th>
            </tr>
          </thead>
          <tbody>
            {rituals.map((r) => {
              const enT = (r.translations as any[]).find((t: any) => t.locale === "en");
              return (
                <tr
                  key={r.id}
                  className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-bb-on-surface-variant capitalize">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium">
                    {enT?.name ?? r.id}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {r.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/rituals/${r.id}`}
                      className="font-sans text-[12px] text-bb-primary hover:underline"
                    >
                      Edit
                    </Link>
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
