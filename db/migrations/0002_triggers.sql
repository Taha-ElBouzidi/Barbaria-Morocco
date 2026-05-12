-- ====================================================================
-- Sprint 2, Slice 5: triggers for updated_at and audit_log.
--
-- updated_at:
--   moddatetime extension provides a generic trigger fn.
--   We attach BEFORE UPDATE triggers to 5 tables that carry updated_at.
--
-- audit_log:
--   Custom log_audit() plpgsql function captures actor (auth.uid()),
--   before/after JSON state, and action (create/update/delete).
--   SECURITY DEFINER so it can INSERT into audit_log despite RLS.
--   AFTER triggers on 7 tracked tables call this function with the
--   appropriate entity_type as the trigger argument.
-- ====================================================================

-- ==== 1. Enable moddatetime ====
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- ==== 2. updated_at triggers ====

CREATE TRIGGER rituals_set_updated_at
  BEFORE UPDATE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER ateliers_set_updated_at
  BEFORE UPDATE ON public.ateliers
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER journal_cards_set_updated_at
  BEFORE UPDATE ON public.journal_cards
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER inquiries_set_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ==== 3. log_audit function ====

CREATE OR REPLACE FUNCTION public.log_audit() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_entity_type audit_entity_type_enum := TG_ARGV[0]::audit_entity_type_enum;
  v_entity_id text;
  v_action audit_action_enum;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_entity_id := OLD.id::text;
    v_action := 'delete';
    INSERT INTO public.audit_log (actor_id, entity_type, entity_id, action, before_state, after_state)
    VALUES (v_actor, v_entity_type, v_entity_id, v_action, to_jsonb(OLD), NULL);
    RETURN OLD;

  ELSIF (TG_OP = 'INSERT') THEN
    v_entity_id := NEW.id::text;
    v_action := 'create';
    INSERT INTO public.audit_log (actor_id, entity_type, entity_id, action, before_state, after_state)
    VALUES (v_actor, v_entity_type, v_entity_id, v_action, NULL, to_jsonb(NEW));
    RETURN NEW;

  ELSE -- UPDATE
    v_entity_id := NEW.id::text;
    v_action := 'update';
    INSERT INTO public.audit_log (actor_id, entity_type, entity_id, action, before_state, after_state)
    VALUES (v_actor, v_entity_type, v_entity_id, v_action, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

-- ==== 4. Audit triggers (AFTER INSERT/UPDATE/DELETE on 7 tracked tables) ====

CREATE TRIGGER products_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('product');

CREATE TRIGGER journal_cards_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.journal_cards
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('journal_card');

CREATE TRIGGER ateliers_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.ateliers
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('atelier');

CREATE TRIGGER rituals_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('ritual');

CREATE TRIGGER ritual_subcategories_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.ritual_subcategories
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('ritual_subcategory');

CREATE TRIGGER facets_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.facets
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('facet');

CREATE TRIGGER inquiries_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_audit('inquiry');

-- ==== 5. Lock down direct audit_log writes by non-definer roles ====
-- audit_log RLS already excludes anon and admin INSERT. service_role bypasses
-- RLS by default. The log_audit() function is SECURITY DEFINER so it runs
-- as the function owner (typically postgres) -- INSERTs succeed regardless
-- of who's calling the mutation on the underlying tracked table.
-- No additional grants needed here.
