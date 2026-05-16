-- Red-team finding: anon role had implicit SELECT on the analytics views
-- via PostgREST and could fingerprint zero-count rows (RLS already
-- prevents actual data leakage on the underlying tables, but the API
-- surface should not expose the views at all).
--
-- Service-role keeps access since it bypasses these grants, which is
-- what the /admin/analytics page uses via createServiceRoleClient().
REVOKE ALL ON
  inquiry_lifetime,
  inquiry_stats_30d,
  inquiry_daily_30d,
  top_inquired_boxes,
  top_custom_pieces,
  top_occasions
FROM anon, authenticated;
