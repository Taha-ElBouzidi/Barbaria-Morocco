-- Expand the product-images storage bucket to accept iOS / iPadOS
-- native formats (HEIC / HEIF) and GIF. Bump the per-file limit from
-- 8 MB to 16 MB because HEIC / AVIF originals often exceed 8 MB even
-- though their JPEG/WebP equivalents would be smaller. The API route
-- (app/api/admin/images/route.ts) mirrors this allowlist and limit.
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/gif'
  ],
  file_size_limit = 16777216
WHERE id = 'product-images';
