-- Per-box lead-time band, editable from the admin gift-box editor.
-- Stored as a min/max integer pair in weeks so the public site can
-- render "Lead time: 4 to 6 weeks" and the Product JSON-LD Offer can
-- emit a schema.org `deliveryLeadTime` QuantitativeValue. Bespoke
-- (isCustomizable=true) boxes typically get longer lead times set by
-- the house; curated boxes default to the FAQ-published 4-6 week band.
--
-- Applied to the live project via mcp__supabase__apply_migration on
-- 2026-05-22.

ALTER TABLE public.gift_boxes
  ADD COLUMN lead_time_weeks_min smallint NOT NULL DEFAULT 4
    CHECK (lead_time_weeks_min >= 1 AND lead_time_weeks_min <= 52),
  ADD COLUMN lead_time_weeks_max smallint NOT NULL DEFAULT 6
    CHECK (lead_time_weeks_max >= 1 AND lead_time_weeks_max <= 52);

ALTER TABLE public.gift_boxes
  ADD CONSTRAINT gift_boxes_lead_time_band_check
    CHECK (lead_time_weeks_max >= lead_time_weeks_min);

COMMENT ON COLUMN public.gift_boxes.lead_time_weeks_min IS
  'Minimum lead time in weeks, from order confirmation to delivery. Surfaced on the public box detail page and in the Product JSON-LD Offer.';

COMMENT ON COLUMN public.gift_boxes.lead_time_weeks_max IS
  'Maximum lead time in weeks. Pair with lead_time_weeks_min to render a band on the public page (e.g., "4 to 6 weeks").';
