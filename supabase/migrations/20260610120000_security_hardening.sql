-- Security hardening
--
-- 1. Remove privilege-escalation hole: the "Users can insert own role" policy
--    let any authenticated user insert themselves into user_roles with any role
--    for ANY organization (the only check was user_id = auth.uid()). No app
--    code uses this path: onboarding and invitation acceptance both run with
--    elevated privileges (service role / SECURITY DEFINER trigger).
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- 2. Lock down increment_minutes_used: it was executable by any authenticated
--    user and accepted negative values, allowing anyone to reset their own
--    (or another org's) billed minutes. Only the vapi-webhook calls it, using
--    the service role.
CREATE OR REPLACE FUNCTION public.increment_minutes_used(org_id uuid, minutes_to_add integer)
RETURNS void AS $$
BEGIN
  IF minutes_to_add IS NULL OR minutes_to_add <= 0 THEN
    RAISE EXCEPTION 'minutes_to_add must be a positive integer';
  END IF;

  UPDATE public.subscriptions
  SET minutes_used = COALESCE(minutes_used, 0) + minutes_to_add
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) TO service_role;

-- 3. Referential integrity: invitations and system_roles were created without
--    foreign keys, leaving orphaned rows behind when an org or user is deleted.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invitations_organization_id_fkey'
  ) THEN
    ALTER TABLE public.invitations
      ADD CONSTRAINT invitations_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping invitations FK: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'system_roles_user_id_fkey'
  ) THEN
    ALTER TABLE public.system_roles
      ADD CONSTRAINT system_roles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping system_roles FK: %', SQLERRM;
END $$;

-- 4. Invitation acceptance: if the user already had a role in the org, the
--    invited role was silently ignored (ON CONFLICT DO NOTHING). Apply the
--    role from the most recent accepted invitation instead.
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Find pending invitations for this email
  FOR invitation_record IN
    SELECT * FROM public.invitations
    WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LOOP
    -- Add user to organization with the invited role
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, invitation_record.organization_id, invitation_record.role)
    ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role;

    -- Update user's profile with organization and mark onboarding as complete
    -- (invited users join an already-configured organization)
    UPDATE public.profiles
    SET
      organization_id = invitation_record.organization_id,
      onboarding_completed = true
    WHERE id = NEW.id AND organization_id IS NULL;

    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invitation_record.id;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 5. Webhook idempotency: Vapi retries end-of-call reports, which produced
--    duplicate call_logs rows (and double-billed minutes). Dedupe and enforce
--    uniqueness on vapi_call_id.
DO $$
BEGIN
  DELETE FROM public.call_logs a
  USING public.call_logs b
  WHERE a.vapi_call_id IS NOT NULL
    AND a.vapi_call_id = b.vapi_call_id
    AND a.created_at > b.created_at;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_call_logs_vapi_call_id'
  ) THEN
    CREATE UNIQUE INDEX uq_call_logs_vapi_call_id
      ON public.call_logs (vapi_call_id)
      WHERE vapi_call_id IS NOT NULL;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping call_logs unique index: %', SQLERRM;
END $$;

-- 6. Indexes for hot lookups used by RLS policies and the invitation trigger.
CREATE INDEX IF NOT EXISTS idx_invitations_org ON public.invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email_pending
  ON public.invitations(email) WHERE status = 'pending';
