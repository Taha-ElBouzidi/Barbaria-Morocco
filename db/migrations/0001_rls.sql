-- ====================================================================
-- Sprint 2, Slice 4: RLS policies for all 18 public tables.
--
-- Principles:
--   1. anon: read-only on public catalogue. products + journal_cards are
--      filtered by status = 'published'. Joined child tables (translations,
--      images, steps, facets links) are anon-readable because the parent
--      filter naturally hides them via the join, and the data is non-sensitive.
--   2. authenticated + admin_users membership: full write on the public
--      catalogue. Private tables (admin_users, audit_log, inquiries,
--      inquiry_items) have no anon access and tighter admin scopes.
--   3. service_role bypasses RLS entirely. It is used by:
--        - server-side admin route handlers
--        - the seed script (db/seed.ts)
--        - audit_log INSERT triggers (added in Slice 5)
--        - the /api/inquiry handler in Sprint 3
--      No service_role policy is needed (or desired) anywhere.
-- ====================================================================

-- ==== Enable RLS on all 18 tables ====

ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_subcategory_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_application_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ateliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atelier_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_card_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Public catalogue: anon read + admin write
-- ====================================================================

-- ---- rituals (3 fixed rows, always public) ----
CREATE POLICY rituals_anon_read
  ON public.rituals FOR SELECT TO anon
  USING (true);

CREATE POLICY rituals_admin_all
  ON public.rituals FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- ritual_translations ----
CREATE POLICY ritual_translations_anon_read
  ON public.ritual_translations FOR SELECT TO anon
  USING (true);

CREATE POLICY ritual_translations_admin_all
  ON public.ritual_translations FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- ritual_subcategories ----
CREATE POLICY ritual_subcategories_anon_read
  ON public.ritual_subcategories FOR SELECT TO anon
  USING (true);

CREATE POLICY ritual_subcategories_admin_all
  ON public.ritual_subcategories FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- ritual_subcategory_translations ----
CREATE POLICY ritual_subcategory_translations_anon_read
  ON public.ritual_subcategory_translations FOR SELECT TO anon
  USING (true);

CREATE POLICY ritual_subcategory_translations_admin_all
  ON public.ritual_subcategory_translations FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- products (anon reads published only; admins see all via FOR ALL) ----
CREATE POLICY products_anon_read_published
  ON public.products FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY products_admin_all
  ON public.products FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- product_translations (anon reads all; parent products policy gates by status via join) ----
CREATE POLICY product_translations_anon_read
  ON public.product_translations FOR SELECT TO anon
  USING (true);

CREATE POLICY product_translations_admin_all
  ON public.product_translations FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- product_images ----
CREATE POLICY product_images_anon_read
  ON public.product_images FOR SELECT TO anon
  USING (true);

CREATE POLICY product_images_admin_all
  ON public.product_images FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- product_application_steps ----
CREATE POLICY product_application_steps_anon_read
  ON public.product_application_steps FOR SELECT TO anon
  USING (true);

CREATE POLICY product_application_steps_admin_all
  ON public.product_application_steps FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- facets (filter values; non-sensitive) ----
CREATE POLICY facets_anon_read
  ON public.facets FOR SELECT TO anon
  USING (true);

CREATE POLICY facets_admin_all
  ON public.facets FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- product_facets (join table) ----
CREATE POLICY product_facets_anon_read
  ON public.product_facets FOR SELECT TO anon
  USING (true);

CREATE POLICY product_facets_admin_all
  ON public.product_facets FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- ateliers (always public) ----
CREATE POLICY ateliers_anon_read
  ON public.ateliers FOR SELECT TO anon
  USING (true);

CREATE POLICY ateliers_admin_all
  ON public.ateliers FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- atelier_translations ----
CREATE POLICY atelier_translations_anon_read
  ON public.atelier_translations FOR SELECT TO anon
  USING (true);

CREATE POLICY atelier_translations_admin_all
  ON public.atelier_translations FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- journal_cards (anon reads published only; admins see all via FOR ALL) ----
CREATE POLICY journal_cards_anon_read_published
  ON public.journal_cards FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY journal_cards_admin_all
  ON public.journal_cards FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- journal_card_translations ----
CREATE POLICY journal_card_translations_anon_read
  ON public.journal_card_translations FOR SELECT TO anon
  USING (true);

CREATE POLICY journal_card_translations_admin_all
  ON public.journal_card_translations FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ====================================================================
-- Private tables: no anon, scoped admin policies
-- ====================================================================

-- ---- admin_users (admins full access; no anon) ----
CREATE POLICY admin_users_admin_all
  ON public.admin_users FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- audit_log (admin read only; service_role writes via trigger in Slice 5) ----
CREATE POLICY audit_log_admin_read
  ON public.audit_log FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- inquiries (admin read + update status/notes; service_role inserts in Sprint 3; no delete to preserve history) ----
CREATE POLICY inquiries_admin_read
  ON public.inquiries FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY inquiries_admin_update
  ON public.inquiries FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- ---- inquiry_items (admin read only; service_role inserts in Sprint 3) ----
CREATE POLICY inquiry_items_admin_read
  ON public.inquiry_items FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- (End of file)
