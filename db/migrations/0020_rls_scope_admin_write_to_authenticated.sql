-- Scope admin-write policies to the `authenticated` role only. The
-- previous PERMISSIVE policies targeted `public` which includes anon;
-- every anon SELECT was re-evaluating `is_admin()` on top of the
-- public_read policy for nothing (anon can never be admin). Advisor
-- multiple_permissive_policies flagged 8 public-facing tables.
--
-- Behaviour change: only authenticated roles will see the admin gate;
-- service_role bypasses RLS regardless so admin server actions keep
-- working. anon now evaluates only the public_read policy.

DROP POLICY IF EXISTS categories_admin_write ON public.categories;
CREATE POLICY categories_admin_write ON public.categories
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS category_translations_admin_write ON public.category_translations;
CREATE POLICY category_translations_admin_write ON public.category_translations
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS gift_boxes_admin_write ON public.gift_boxes;
CREATE POLICY gift_boxes_admin_write ON public.gift_boxes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS gift_box_translations_admin_write ON public.gift_box_translations;
CREATE POLICY gift_box_translations_admin_write ON public.gift_box_translations
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS gift_box_items_admin_write ON public.gift_box_items;
CREATE POLICY gift_box_items_admin_write ON public.gift_box_items
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS occasions_admin_write ON public.occasions;
CREATE POLICY occasions_admin_write ON public.occasions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS occasion_translations_admin_write ON public.occasion_translations;
CREATE POLICY occasion_translations_admin_write ON public.occasion_translations
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS site_settings_admin_write ON public.site_settings;
CREATE POLICY site_settings_admin_write ON public.site_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
