-- Sprint 2.7, Occasions table, admin-configurable.
-- Replaces the hardcoded options in the contact form so the maison can
-- surface seasonal events (Mother's Day, Eid, Ramadan, Christmas, etc.)
-- without a code deploy.

-- 1. Extend audit entity enum.
ALTER TYPE audit_entity_type_enum ADD VALUE IF NOT EXISTS 'occasion';

-- 2. Tables.
CREATE TABLE IF NOT EXISTS occasions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  sort_order  integer NOT NULL DEFAULT 0,
  status      product_status_enum NOT NULL DEFAULT 'published',
  published_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by  uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS occasions_status_idx ON occasions(status);

CREATE TABLE IF NOT EXISTS occasion_translations (
  occasion_id uuid NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,
  locale      locale_enum NOT NULL,
  name        text NOT NULL,
  PRIMARY KEY (occasion_id, locale)
);

-- 3. Triggers.
CREATE TRIGGER occasions_set_updated_at
  BEFORE UPDATE ON public.occasions
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS occasions_audit ON occasions;
CREATE TRIGGER occasions_audit
  AFTER INSERT OR UPDATE OR DELETE ON occasions
  FOR EACH ROW EXECUTE FUNCTION log_audit('occasion');

-- 4. RLS.
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasion_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY occasions_public_read ON occasions
  FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY occasions_admin_write ON occasions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY occasion_translations_public_read ON occasion_translations
  FOR SELECT USING (true);
CREATE POLICY occasion_translations_admin_write ON occasion_translations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 5. Seed defaults: the legacy hardcoded options + the B2B/cultural events
-- the maison cares about. All published; sort order matches the visual
-- grouping (business → seasonal → cultural → other).
INSERT INTO occasions (slug, sort_order, status, published_at) VALUES
  ('yearend',      10, 'published', now()),
  ('onboarding',   20, 'published', now()),
  ('anniversary',  30, 'published', now()),
  ('press',        40, 'published', now()),
  ('wedding',      50, 'published', now()),
  ('mothers-day',  60, 'published', now()),
  ('valentines',   70, 'published', now()),
  ('christmas',    80, 'published', now()),
  ('eid',          90, 'published', now()),
  ('ramadan',     100, 'published', now()),
  ('hanukkah',    110, 'published', now()),
  ('other',       999, 'published', now())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO occasion_translations (occasion_id, locale, name)
SELECT o.id, t.locale, t.name FROM occasions o
JOIN (VALUES
  ('yearend',      'en', 'Year-end'),
  ('yearend',      'fr', 'Fin d''année'),
  ('onboarding',   'en', 'Onboarding'),
  ('onboarding',   'fr', 'Intégration'),
  ('anniversary',  'en', 'Anniversary'),
  ('anniversary',  'fr', 'Anniversaire'),
  ('press',        'en', 'Press'),
  ('press',        'fr', 'Presse'),
  ('wedding',      'en', 'Wedding / corporate'),
  ('wedding',      'fr', 'Mariage / corporate'),
  ('mothers-day',  'en', 'Mother''s Day'),
  ('mothers-day',  'fr', 'Fête des mères'),
  ('valentines',   'en', 'Valentine''s Day'),
  ('valentines',   'fr', 'Saint-Valentin'),
  ('christmas',    'en', 'Christmas'),
  ('christmas',    'fr', 'Noël'),
  ('eid',          'en', 'Eid'),
  ('eid',          'fr', 'Aïd'),
  ('ramadan',      'en', 'Ramadan'),
  ('ramadan',      'fr', 'Ramadan'),
  ('hanukkah',     'en', 'Hanukkah'),
  ('hanukkah',     'fr', 'Hanoukka'),
  ('other',        'en', 'Other'),
  ('other',        'fr', 'Autre')
) AS t(slug, locale, name) ON t.slug = o.slug
ON CONFLICT (occasion_id, locale) DO NOTHING;
