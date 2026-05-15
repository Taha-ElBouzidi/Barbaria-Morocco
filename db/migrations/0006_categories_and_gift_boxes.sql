-- Sprint 2.0 — Categories and Gift Boxes
-- Adds the public-facing 2-category taxonomy (Cosmétiques, Épicerie Fine)
-- and the gift_boxes domain. Rituals are retained as internal product
-- tagging but no longer surfaced in public IA.

-- 1. Extend audit entity enum so categories + gift_boxes can be logged.
ALTER TYPE audit_entity_type_enum ADD VALUE IF NOT EXISTS 'category';
ALTER TYPE audit_entity_type_enum ADD VALUE IF NOT EXISTS 'gift_box';

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,                   -- 'cosmetiques' | 'epicerie_fine'
  sort_order  integer NOT NULL DEFAULT 0,
  hero_image_path text,
  story_theme_key text NOT NULL,                      -- 'sahara_stars' | 'caravan_route'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale      locale_enum NOT NULL,
  name        text NOT NULL,
  tagline     text,
  lede        text,
  PRIMARY KEY (category_id, locale)
);

-- 3. Gift boxes (curated and customizable both live here)
CREATE TABLE IF NOT EXISTS gift_boxes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id           uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug                  text NOT NULL UNIQUE,
  hero_image_path       text,
  status                product_status_enum NOT NULL DEFAULT 'draft',
  default_quantity_min  integer NOT NULL DEFAULT 5,
  sort_order            integer NOT NULL DEFAULT 0,
  is_customizable       boolean NOT NULL DEFAULT false,
  published_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gift_boxes_category_id_idx ON gift_boxes(category_id);
CREATE INDEX IF NOT EXISTS gift_boxes_status_idx ON gift_boxes(status);

CREATE TABLE IF NOT EXISTS gift_box_translations (
  gift_box_id uuid NOT NULL REFERENCES gift_boxes(id) ON DELETE CASCADE,
  locale      locale_enum NOT NULL,
  name        text NOT NULL,
  tagline     text,
  story_intro text,
  PRIMARY KEY (gift_box_id, locale)
);

CREATE TABLE IF NOT EXISTS gift_box_items (
  gift_box_id uuid NOT NULL REFERENCES gift_boxes(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (gift_box_id, product_id)
);

CREATE INDEX IF NOT EXISTS gift_box_items_product_id_idx ON gift_box_items(product_id);

-- 4. Add category_id to products (nullable; backfill in seed)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

-- 5a. updated_at triggers (matches the pattern from 0002_triggers.sql).
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER gift_boxes_set_updated_at
  BEFORE UPDATE ON public.gift_boxes
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- 5b. Audit triggers — wire the new tables into the existing log_audit.
DROP TRIGGER IF EXISTS categories_audit ON categories;
CREATE TRIGGER categories_audit
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION log_audit('category');

DROP TRIGGER IF EXISTS gift_boxes_audit ON gift_boxes;
CREATE TRIGGER gift_boxes_audit
  AFTER INSERT OR UPDATE OR DELETE ON gift_boxes
  FOR EACH ROW EXECUTE FUNCTION log_audit('gift_box');

-- 6. RLS — categories and gift_boxes follow same pattern as products:
-- public can SELECT published rows; admin (via is_admin) can write.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_box_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_box_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_public_read ON categories
  FOR SELECT USING (true);
CREATE POLICY categories_admin_write ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY category_translations_public_read ON category_translations
  FOR SELECT USING (true);
CREATE POLICY category_translations_admin_write ON category_translations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY gift_boxes_public_read ON gift_boxes
  FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY gift_boxes_admin_write ON gift_boxes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY gift_box_translations_public_read ON gift_box_translations
  FOR SELECT USING (true);
CREATE POLICY gift_box_translations_admin_write ON gift_box_translations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY gift_box_items_public_read ON gift_box_items
  FOR SELECT USING (true);
CREATE POLICY gift_box_items_admin_write ON gift_box_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
