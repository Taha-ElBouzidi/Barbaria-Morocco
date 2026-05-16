-- Final RLS / perf advisor cleanup.
--
-- 1) Scope `*_public_read` policies to the `anon` role only. After
--    0020 the admin_write policies target `authenticated`; with
--    public_read on the broad `public` (anon + authenticated)
--    PostgreSQL still evaluates BOTH for every authenticated SELECT.
--    Splitting roles means each role evaluates exactly one policy.
--    service_role bypasses RLS regardless, so admin queries via the
--    server actions are unaffected.
--
-- 2) Wrap auth.uid() in (select auth.uid()) on admin_users_self_read
--    so it's planned once per query rather than re-evaluated per row.
--    Advisor auth_rls_initplan.
--
-- 3) Add covering indexes for the audit-actor / inquiry-assignee FKs
--    flagged by unindexed_foreign_keys.

-- ---- 1. public_read split to anon ----

DROP POLICY IF EXISTS categories_public_read ON public.categories;
CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS category_translations_public_read ON public.category_translations;
CREATE POLICY category_translations_public_read ON public.category_translations
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS gift_box_items_public_read ON public.gift_box_items;
CREATE POLICY gift_box_items_public_read ON public.gift_box_items
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS gift_box_translations_public_read ON public.gift_box_translations;
CREATE POLICY gift_box_translations_public_read ON public.gift_box_translations
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS gift_boxes_public_read ON public.gift_boxes;
CREATE POLICY gift_boxes_public_read ON public.gift_boxes
  FOR SELECT TO anon USING (status = 'published');

DROP POLICY IF EXISTS occasions_public_read ON public.occasions;
CREATE POLICY occasions_public_read ON public.occasions
  FOR SELECT TO anon USING (status = 'published');

DROP POLICY IF EXISTS occasion_translations_public_read ON public.occasion_translations;
CREATE POLICY occasion_translations_public_read ON public.occasion_translations
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
CREATE POLICY site_settings_public_read ON public.site_settings
  FOR SELECT TO anon USING (true);

-- ---- 2. admin_users_self_read auth.uid() initplan ----

DROP POLICY IF EXISTS admin_users_self_read ON public.admin_users;
CREATE POLICY admin_users_self_read ON public.admin_users
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

-- ---- 3. Cover the FK indexes the advisor flagged ----

CREATE INDEX IF NOT EXISTS inquiries_assigned_to_idx
  ON public.inquiries (assigned_to);
CREATE INDEX IF NOT EXISTS inquiry_items_product_id_idx
  ON public.inquiry_items (product_id);
CREATE INDEX IF NOT EXISTS journal_cards_created_by_idx
  ON public.journal_cards (created_by);
CREATE INDEX IF NOT EXISTS journal_cards_updated_by_idx
  ON public.journal_cards (updated_by);
CREATE INDEX IF NOT EXISTS occasions_created_by_idx
  ON public.occasions (created_by);
CREATE INDEX IF NOT EXISTS occasions_updated_by_idx
  ON public.occasions (updated_by);
CREATE INDEX IF NOT EXISTS products_created_by_idx
  ON public.products (created_by);
CREATE INDEX IF NOT EXISTS products_updated_by_idx
  ON public.products (updated_by);
CREATE INDEX IF NOT EXISTS site_settings_updated_by_idx
  ON public.site_settings (updated_by);
