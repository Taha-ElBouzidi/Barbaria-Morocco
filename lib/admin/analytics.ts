import { createServiceRoleClient } from "@/lib/supabase/service";

export interface InquiryLifetime {
  total: number;
  openCount: number;
  wonCount: number;
  lostCount: number;
  last30d: number;
  last7d: number;
}

export interface InquiryStatusRow {
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  cnt: number;
}

export interface InquiryDayPoint {
  day: string;
  cnt: number;
}

export interface TopInquiredBox {
  slug: string;
  name: string;
  isCustomizable: boolean;
  inquiryCount: number;
  totalQty: number;
}

export interface TopCustomPiece {
  slug: string;
  name: string;
  pickCount: number;
  totalQty: number;
}

export interface TopOccasion {
  occasion: string;
  cnt: number;
}

/**
 * Pulls every analytics view in one Promise.all and shapes it for the
 * page. Service-role bypasses RLS, but the caller MUST gate with
 * requireAdmin() first, this helper never authenticates on its own.
 */
export async function getAnalyticsSnapshot(locale: "en" | "fr" = "en") {
  const supabase = createServiceRoleClient();
  const [lifetimeRes, statusRes, dailyRes, boxesRes, piecesRes, occasionsRes] =
    await Promise.all([
      supabase.from("inquiry_lifetime").select("*").single(),
      supabase.from("inquiry_stats_30d").select("status, cnt"),
      supabase.from("inquiry_daily_30d").select("day, cnt").order("day"),
      supabase
        .from("top_inquired_boxes")
        .select("slug, name_fr, name_en, is_customizable, inquiry_count, total_qty"),
      supabase
        .from("top_custom_pieces")
        .select("slug, name_fr, name_en, pick_count, total_qty"),
      supabase.from("top_occasions").select("occasion, cnt"),
    ]);

  const lifetime: InquiryLifetime = lifetimeRes.data
    ? {
        total: lifetimeRes.data.total,
        openCount: lifetimeRes.data.open_count,
        wonCount: lifetimeRes.data.won_count,
        lostCount: lifetimeRes.data.lost_count,
        last30d: lifetimeRes.data.last_30d,
        last7d: lifetimeRes.data.last_7d,
      }
    : { total: 0, openCount: 0, wonCount: 0, lostCount: 0, last30d: 0, last7d: 0 };

  const statusBreakdown: InquiryStatusRow[] = (statusRes.data ?? []).map((r) => ({
    status: r.status as InquiryStatusRow["status"],
    cnt: r.cnt,
  }));

  const daily: InquiryDayPoint[] = (dailyRes.data ?? []).map((r) => ({
    day: r.day,
    cnt: r.cnt,
  }));

  const topBoxes: TopInquiredBox[] = (boxesRes.data ?? []).map((r) => ({
    slug: r.slug,
    name: (locale === "fr" ? r.name_fr : r.name_en) ?? r.slug,
    isCustomizable: r.is_customizable,
    inquiryCount: r.inquiry_count,
    totalQty: r.total_qty,
  }));

  const topPieces: TopCustomPiece[] = (piecesRes.data ?? []).map((r) => ({
    slug: r.slug,
    name: (locale === "fr" ? r.name_fr : r.name_en) ?? r.slug,
    pickCount: r.pick_count,
    totalQty: r.total_qty,
  }));

  const topOccasions: TopOccasion[] = (occasionsRes.data ?? []).map((r) => ({
    occasion: r.occasion,
    cnt: r.cnt,
  }));

  return { lifetime, statusBreakdown, daily, topBoxes, topPieces, topOccasions };
}
