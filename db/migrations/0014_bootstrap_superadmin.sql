-- Promote the founder so /admin/admins is reachable on first visit.
-- Idempotent, the role check prevents stomping a future
-- non-superadmin assignment if the founder ever gets demoted on
-- purpose.
UPDATE admin_users
SET role = 'superadmin'
WHERE email = 'ta.elbouzidi@gmail.com'
  AND role <> 'superadmin';
