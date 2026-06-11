-- Greet is sold as an all-in "Voice / Chat" widget, but voice_call_enabled defaulted to
-- false, so freshly-remixed widgets came up chat-only and buyers thought voice was missing.
-- The embed safely hides the call button until a Vapi public key + assistant are present
-- (see supabase/functions/widget-loader: requires vapiPublicKey && vapiAssistantId), so
-- turning this on by default is non-breaking — it simply lights up once Vapi is connected.

-- New widgets ship with voice calls on.
ALTER TABLE public.widget_configs ALTER COLUMN voice_call_enabled SET DEFAULT true;

-- Bring the auto-created default row(s) in a fresh install in line with the new default.
-- (Runs once per remixed project; only touches rows still sitting at the old default.)
UPDATE public.widget_configs
   SET voice_call_enabled = true
 WHERE voice_call_enabled IS DISTINCT FROM true;
