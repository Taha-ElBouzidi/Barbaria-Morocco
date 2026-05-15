-- Sprint 2.6 — Inquiry is box-level, not product-level.
-- Each row of inquiry_items now represents either a curated gift box (just
-- gift_box_id + qty) or a custom composition (gift_box_id of the parent
-- "compose-*" box + composition jsonb with the ordered product slugs).
-- Multiple distinct compositions per inquiry are allowed, so the composite
-- primary key is replaced with a uuid id.

-- 1. Drop the old composite primary key by its exact name.
ALTER TABLE inquiry_items DROP CONSTRAINT inquiry_items_inquiry_id_product_id_pk;

-- 2. product_id becomes nullable; a custom box line has no single product.
ALTER TABLE inquiry_items ALTER COLUMN product_id DROP NOT NULL;

-- 3. Box-level columns.
ALTER TABLE inquiry_items
  ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS gift_box_id uuid REFERENCES gift_boxes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS composition jsonb,
  ADD COLUMN IF NOT EXISTS line_index integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS inquiry_items_gift_box_id_idx ON inquiry_items(gift_box_id);
CREATE INDEX IF NOT EXISTS inquiry_items_inquiry_id_idx ON inquiry_items(inquiry_id);
