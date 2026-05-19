-- ====================================================================
-- HOTFIX: Sprint 2 RLS recursion on admin_users.
--
-- Bug: Sprint 2 Slice 4 set every admin-scoped policy to
--      USING (auth.uid() IN (SELECT id FROM admin_users))
--
-- The subquery against admin_users is itself gated by the policy above, so
-- the membership check requires admin membership before it can read
-- admin_users to determine membership. Catch-22, always returns false.
-- Result: logged-in admins fail the is-admin check inside callback and get
-- bounced to /admin/login?error=unauthorized.
--
-- Fix: SECURITY DEFINER helper function bypasses RLS during the lookup.
-- All admin-gating policies switch to `public.is_admin()`.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ==== Rewrite every admin-scoped policy to call is_admin() ====

DROP POLICY IF EXISTS admin_users_admin_all ON public.admin_users;
CREATE POLICY admin_users_admin_all ON public.admin_users FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS audit_log_admin_read ON public.audit_log;
CREATE POLICY audit_log_admin_read ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS inquiries_admin_read ON public.inquiries;
CREATE POLICY inquiries_admin_read ON public.inquiries FOR SELECT TO authenticated
  USING (public.is_admin());
DROP POLICY IF EXISTS inquiries_admin_update ON public.inquiries;
CREATE POLICY inquiries_admin_update ON public.inquiries FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS inquiry_items_admin_read ON public.inquiry_items;
CREATE POLICY inquiry_items_admin_read ON public.inquiry_items FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS rituals_admin_all ON public.rituals;
CREATE POLICY rituals_admin_all ON public.rituals FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS ritual_translations_admin_all ON public.ritual_translations;
CREATE POLICY ritual_translations_admin_all ON public.ritual_translations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS ritual_subcategories_admin_all ON public.ritual_subcategories;
CREATE POLICY ritual_subcategories_admin_all ON public.ritual_subcategories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS ritual_subcategory_translations_admin_all ON public.ritual_subcategory_translations;
CREATE POLICY ritual_subcategory_translations_admin_all ON public.ritual_subcategory_translations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS products_admin_all ON public.products;
CREATE POLICY products_admin_all ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS product_translations_admin_all ON public.product_translations;
CREATE POLICY product_translations_admin_all ON public.product_translations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS product_images_admin_all ON public.product_images;
CREATE POLICY product_images_admin_all ON public.product_images FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS product_application_steps_admin_all ON public.product_application_steps;
CREATE POLICY product_application_steps_admin_all ON public.product_application_steps FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS facets_admin_all ON public.facets;
CREATE POLICY facets_admin_all ON public.facets FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS product_facets_admin_all ON public.product_facets;
CREATE POLICY product_facets_admin_all ON public.product_facets FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS ateliers_admin_all ON public.ateliers;
CREATE POLICY ateliers_admin_all ON public.ateliers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS atelier_translations_admin_all ON public.atelier_translations;
CREATE POLICY atelier_translations_admin_all ON public.atelier_translations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS journal_cards_admin_all ON public.journal_cards;
CREATE POLICY journal_cards_admin_all ON public.journal_cards FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS journal_card_translations_admin_all ON public.journal_card_translations;
CREATE POLICY journal_card_translations_admin_all ON public.journal_card_translations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_images_admin_select ON storage.objects;
CREATE POLICY product_images_admin_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS product_images_admin_insert ON storage.objects;
CREATE POLICY product_images_admin_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS product_images_admin_update ON storage.objects;
CREATE POLICY product_images_admin_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS product_images_admin_delete ON storage.objects;
CREATE POLICY product_images_admin_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());
