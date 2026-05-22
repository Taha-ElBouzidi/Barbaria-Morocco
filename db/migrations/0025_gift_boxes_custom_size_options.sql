-- Per-box custom-size options for customizable (wizard) boxes. The
-- wizard previously offered a hardcoded {3, 5, 6} set of sizes; this
-- column lets the house configure which sizes a given customizable
-- box offers (e.g., compose-cosmetiques can offer {3, 5, 6} while
-- compose-epicerie_fine could offer just {4, 6}).
--
-- Values are 1..6 because the wizard architecture has six narrative
-- step slots per theme (sahara_stars / caravan_route). Going higher
-- would require new step copy.
--
-- The column applies only when is_customizable = true; curated boxes
-- ignore it. We do not enforce that via a partial constraint to keep
-- the editor logic simple: setting it on a non-customizable box is a
-- harmless no-op.
--
-- Applied to the live project via mcp__supabase__apply_migration on
-- 2026-05-22.

ALTER TABLE public.gift_boxes
  ADD COLUMN custom_size_options smallint[] NOT NULL DEFAULT ARRAY[3, 5, 6]::smallint[];

ALTER TABLE public.gift_boxes
  ADD CONSTRAINT gift_boxes_custom_size_options_range_check CHECK (
    array_length(custom_size_options, 1) BETWEEN 1 AND 6
    AND custom_size_options <@ ARRAY[1, 2, 3, 4, 5, 6]::smallint[]
  );

COMMENT ON COLUMN public.gift_boxes.custom_size_options IS
  'Array of size options (1..6) the wizard exposes to buyers for this customizable box. Ignored when is_customizable = false. Defaults to {3, 5, 6}.';
