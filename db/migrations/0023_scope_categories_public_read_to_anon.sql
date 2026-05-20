-- Migration 0006 created `categories_public_read` with USING (true) and
-- no role restriction; migration 0021 closed the same gap on every
-- other public-readable table but missed this one. Drop and recreate
-- scoped to anon so we are not exposing the row to every PostgREST
-- caller, which security audit advisors flag as a defence-in-depth
-- gap (info-disclosure scope tightening).

DROP POLICY IF EXISTS categories_public_read ON public.categories;

CREATE POLICY categories_public_read
  ON public.categories
  FOR SELECT
  TO anon
  USING (true);
