-- Retire the rituals taxonomy entirely. Products are now keyed only on
-- category (cosmetiques | epicerie_fine). Subcategories were derived from
-- rituals so they go too. ritual_label was a denormalized text column on
-- products used by old product cards.

-- Drop the FK columns from products first so the parent tables can drop.
ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;
ALTER TABLE products DROP COLUMN IF EXISTS ritual_id;
ALTER TABLE products DROP COLUMN IF EXISTS ritual_label;

-- Drop the rituals taxonomy tables in dependency order.
DROP TABLE IF EXISTS ritual_subcategory_translations;
DROP TABLE IF EXISTS ritual_subcategories;
DROP TABLE IF EXISTS ritual_translations;
DROP TABLE IF EXISTS rituals;
