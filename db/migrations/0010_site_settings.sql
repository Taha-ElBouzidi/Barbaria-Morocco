-- Sprint 2.5 follow-up — Editable site settings (social handles + contact).
-- Single-row table guaranteed by the boolean PK check. Public anon can
-- SELECT (footer, drawers, contact page all read it on every request);
-- only admins can write.

CREATE TABLE IF NOT EXISTS site_settings (
  id            boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  instagram_url text,
  linkedin_url  text,
  x_url         text,
  whatsapp_url  text,
  contact_email text,
  contact_phone text,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_settings_public_read ON site_settings
  FOR SELECT USING (true);
CREATE POLICY site_settings_admin_write ON site_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Seed defaults; swap to real URLs in /admin/settings.
INSERT INTO site_settings (
  id, instagram_url, linkedin_url, x_url, whatsapp_url, contact_email, contact_phone
) VALUES (
  true,
  'https://instagram.com/barbaria_00',
  'https://www.linkedin.com/company/barbaria-morocco',
  'https://x.com/barbariamorocco',
  'https://wa.me/212659658863',
  'Contact@barbariamorocco.com',
  '+212659658863'
) ON CONFLICT (id) DO NOTHING;
