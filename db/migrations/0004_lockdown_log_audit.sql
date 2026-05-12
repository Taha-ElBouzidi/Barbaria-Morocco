-- ====================================================================
-- Sprint 2, Slice 6 follow-up: lock down log_audit() RPC exposure.
--
-- Issue: SECURITY DEFINER functions in the public schema are auto-exposed
-- by PostgREST as /rest/v1/rpc/<name>. log_audit() was callable by anon
-- and authenticated roles, which is a privilege-escalation risk
-- (anyone could write arbitrary entries to audit_log via this function).
--
-- Fix: revoke EXECUTE from anon, authenticated, public. Triggers don't
-- require EXECUTE grant on the function — they invoke it directly with
-- the table owner's privileges (postgres / the function's owner).
-- After this REVOKE, triggers continue to fire normally but the function
-- is no longer reachable from the REST API.
-- ====================================================================

REVOKE EXECUTE ON FUNCTION public.log_audit() FROM anon, authenticated, public;
