-- CRITICAL security fix. The original admin_users_admin_all policy
-- subqueried admin_users while protecting admin_users. Per the
-- MEMORY.md "Supabase RLS recursion trap", that pattern resolves to
-- "any authenticated user in admin_users may do ANYTHING on
-- admin_users", letting a plain admin self-promote to superadmin via a
-- direct PostgREST PATCH. Replace with a self-only read policy and no
-- authenticated write policies — all mutations now flow through the
-- service-role server actions in app/admin/admins/actions.ts, which
-- gate with requireSuperadmin().

DROP POLICY IF EXISTS admin_users_admin_all ON public.admin_users;

-- Read: any signed-in admin can read their own row (login flow uses
-- this to verify membership before signing the user out as
-- non-admin). All other admin_users rows are invisible to
-- authenticated; the management page reads the full roster via
-- service-role, which bypasses RLS.
CREATE POLICY admin_users_self_read
  ON public.admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- No INSERT / UPDATE / DELETE policy for authenticated → denied by
-- default. service_role bypasses RLS for legitimate writes from
-- server actions.
