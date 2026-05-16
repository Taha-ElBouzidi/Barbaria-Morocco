-- Add 'superadmin' to admin_role_enum so the /admin/admins user-
-- management page can gate write actions. Postgres 14+ supports
-- ALTER TYPE ADD VALUE outside a transaction, but the value cannot
-- be referenced in the same migration that creates it ("unsafe use
-- of new value"); 0014 promotes the founder in a follow-up.
ALTER TYPE admin_role_enum ADD VALUE IF NOT EXISTS 'superadmin';
