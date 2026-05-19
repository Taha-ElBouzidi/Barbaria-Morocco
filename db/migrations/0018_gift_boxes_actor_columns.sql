-- Add created_by / updated_by to gift_boxes so the admin actions can
-- stamp the actor on every row write. Without these columns,
-- saveGiftBox's payload (which already included updated_by) got
-- rejected by PostgREST with "column does not exist", that's the
-- root cause of the repeated save errors on /admin/gift-boxes/[id].
--
-- Same shape as products + journal_cards + occasions for consistency.
-- ActivityFeed reads after_state.updated_by as the actor fallback
-- when the audit trigger's auth.uid() is null (which it always is for
-- service-role driven writes from /admin/* actions).
ALTER TABLE gift_boxes
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Backfill existing rows with the bootstrap admin so older audit log
-- entries can resolve to a person rather than "System".
UPDATE gift_boxes
SET created_by = au.id, updated_by = au.id
FROM admin_users au
WHERE au.email = 'ta.elbouzidi@gmail.com'
  AND gift_boxes.created_by IS NULL;
