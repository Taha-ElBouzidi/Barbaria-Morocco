-- Analytics views for /admin/analytics. Each view is explicitly set
-- to security_invoker so the caller's RLS applies, not the view
-- creator's. We only ever query these from server code with the
-- service-role client gated by requireAdmin(), but the explicit setting
-- silences Supabase's security_definer_view advisor and keeps the
-- views safe to expose later if ever needed.

-- Rolling 30-day inquiry status counts. One row per status, including
-- statuses with zero rows in the window (LEFT JOIN against a status
-- list so the dashboard shows "0 won" rather than omitting the bar).
CREATE OR REPLACE VIEW inquiry_stats_30d WITH (security_invoker = on) AS
SELECT
  s.status,
  coalesce(c.cnt, 0)::int AS cnt
FROM (VALUES ('new'), ('contacted'), ('quoted'), ('won'), ('lost')) AS s(status)
LEFT JOIN (
  SELECT status::text AS status, count(*) AS cnt
  FROM inquiries
  WHERE created_at >= now() - interval '30 days'
  GROUP BY status
) c ON c.status = s.status;

-- Daily inquiry counts for the last 30 days, dense (zero-filled).
-- generate_series gives us every day so the sparkline never has gaps.
CREATE OR REPLACE VIEW inquiry_daily_30d WITH (security_invoker = on) AS
WITH days AS (
  SELECT generate_series(
    (current_date - interval '29 days')::date,
    current_date,
    interval '1 day'
  )::date AS day
)
SELECT
  d.day,
  coalesce(c.cnt, 0)::int AS cnt
FROM days d
LEFT JOIN (
  SELECT created_at::date AS day, count(*) AS cnt
  FROM inquiries
  WHERE created_at >= current_date - interval '29 days'
  GROUP BY created_at::date
) c ON c.day = d.day
ORDER BY d.day;

-- Top 10 occasions by inquiry count (lifetime). Useful to spot which
-- moments drive the most concierge volume.
CREATE OR REPLACE VIEW top_occasions WITH (security_invoker = on) AS
SELECT
  occasion,
  count(*)::int AS cnt
FROM inquiries
WHERE occasion IS NOT NULL AND occasion <> ''
GROUP BY occasion
ORDER BY cnt DESC, occasion ASC
LIMIT 10;

-- Top 10 inquired-about boxes (curated + custom). One row per gift_box,
-- carries both locale names so the page renders the right one without
-- a second round-trip.
CREATE OR REPLACE VIEW top_inquired_boxes WITH (security_invoker = on) AS
SELECT
  gb.slug,
  gbt_fr.name AS name_fr,
  gbt_en.name AS name_en,
  gb.is_customizable,
  count(DISTINCT ii.inquiry_id)::int AS inquiry_count,
  coalesce(sum(ii.qty), 0)::int AS total_qty
FROM inquiry_items ii
JOIN gift_boxes gb ON gb.id = ii.gift_box_id
LEFT JOIN gift_box_translations gbt_fr ON gbt_fr.gift_box_id = gb.id AND gbt_fr.locale = 'fr'
LEFT JOIN gift_box_translations gbt_en ON gbt_en.gift_box_id = gb.id AND gbt_en.locale = 'en'
GROUP BY gb.slug, gbt_fr.name, gbt_en.name, gb.is_customizable
ORDER BY total_qty DESC, inquiry_count DESC
LIMIT 10;

-- Top 10 products that show up inside custom-box compositions. Proxy
-- for "most-requested piece" since we don't have a real product-level
-- inquiry table (the wizard sends boxes, not raw products).
--
-- Expands composition.productSlugs (jsonb array) into rows, joins back
-- to products+translations to give the admin readable names.
CREATE OR REPLACE VIEW top_custom_pieces WITH (security_invoker = on) AS
WITH expanded AS (
  SELECT
    ii.qty,
    jsonb_array_elements_text(ii.composition->'productSlugs') AS slug
  FROM inquiry_items ii
  WHERE ii.is_custom = true
    AND ii.composition ? 'productSlugs'
    AND jsonb_typeof(ii.composition->'productSlugs') = 'array'
)
SELECT
  e.slug,
  pt_fr.name AS name_fr,
  pt_en.name AS name_en,
  count(*)::int AS pick_count,
  sum(e.qty)::int AS total_qty
FROM expanded e
LEFT JOIN products p ON p.slug = e.slug
LEFT JOIN product_translations pt_fr ON pt_fr.product_id = p.id AND pt_fr.locale = 'fr'
LEFT JOIN product_translations pt_en ON pt_en.product_id = p.id AND pt_en.locale = 'en'
GROUP BY e.slug, pt_fr.name, pt_en.name
ORDER BY pick_count DESC, total_qty DESC
LIMIT 10;

-- Lifetime headline counters. Single-row view for the top tiles.
CREATE OR REPLACE VIEW inquiry_lifetime WITH (security_invoker = on) AS
SELECT
  count(*)::int AS total,
  count(*) FILTER (WHERE status IN ('new', 'contacted', 'quoted'))::int AS open_count,
  count(*) FILTER (WHERE status = 'won')::int AS won_count,
  count(*) FILTER (WHERE status = 'lost')::int AS lost_count,
  count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS last_30d,
  count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS last_7d
FROM inquiries;
