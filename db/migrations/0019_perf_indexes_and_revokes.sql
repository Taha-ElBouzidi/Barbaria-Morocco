-- Performance: add the missing index on the unindexed FK so reverse
-- joins (facet → products) don't seq-scan product_facets. Flagged
-- by the Supabase performance advisor in the sprint 10 review.
CREATE INDEX IF NOT EXISTS product_facets_facet_id_idx
  ON public.product_facets (facet_id);

-- Security advisor follow-up: revoke EXECUTE on is_admin() from anon
-- and authenticated. The RLS policies that call is_admin() run as
-- SECURITY DEFINER regardless, so revoking these grants only removes
-- the /rest/v1/rpc/is_admin endpoint from the public surface. anon
-- always got `false` anyway (the body queries admin_users by
-- auth.uid which is null for anon), but exposing the function name
-- was unnecessary fingerprinting.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;
