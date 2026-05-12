-- ====================================================================
-- Sprint 2, Slice 6: storage bucket + RLS policies.
--
-- product-images bucket:
--   - public = true so next/image can serve via CDN public URL
--   - 8 MB file size limit
--   - MIME allowlist: jpeg, png, webp, avif
--
-- storage.objects policies for this bucket:
--   - Public reads happen via the CDN URL (bucket.public = true bypasses
--     storage.objects RLS for read), so no SELECT policy needed for anon.
--   - Authenticated admins (in public.admin_users) can SELECT / INSERT /
--     UPDATE / DELETE on objects in this bucket via PostgREST / Supabase
--     Storage SDK.
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY product_images_admin_select
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY product_images_admin_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY product_images_admin_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM public.admin_users));

CREATE POLICY product_images_admin_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM public.admin_users));
