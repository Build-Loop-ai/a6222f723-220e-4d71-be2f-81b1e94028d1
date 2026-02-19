
-- 1. widget_configs: per-organization widget settings
CREATE TABLE public.widget_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_key uuid NOT NULL DEFAULT gen_random_uuid(),
  position text NOT NULL DEFAULT 'bottom-right',
  theme text NOT NULL DEFAULT 'auto',
  accent_color text NOT NULL DEFAULT '#6366f1',
  welcome_message text NOT NULL DEFAULT 'Hi! How can I help you today?',
  placeholder_text text NOT NULL DEFAULT 'Type a message...',
  avatar_url text,
  widget_title text NOT NULL DEFAULT 'Chat with us',
  allowed_domains text[] DEFAULT '{}',
  voice_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);

-- 2. site_pages: cached Firecrawl content
CREATE TABLE public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  content_markdown text,
  summary text,
  last_crawled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, url)
);

-- 3. site_maps: discovered URLs from Firecrawl map
CREATE TABLE public.site_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_crawled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, url)
);

-- 4. conversations: replaces call_logs
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  visitor_id text NOT NULL DEFAULT gen_random_uuid()::text,
  channel text NOT NULL DEFAULT 'text',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  page_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. chat_messages: individual messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  suggested_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- widget_configs RLS
CREATE POLICY "Members can view widget config" ON public.widget_configs
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can insert widget config" ON public.widget_configs
  FOR INSERT WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update widget config" ON public.widget_configs
  FOR UPDATE USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Super admins can view all widget configs" ON public.widget_configs
  FOR SELECT USING (is_system_admin(auth.uid()));

CREATE POLICY "Service role can manage widget configs" ON public.widget_configs
  FOR ALL USING (is_service_role());

-- site_pages RLS
CREATE POLICY "Members can view site pages" ON public.site_pages
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Service role can manage site pages" ON public.site_pages
  FOR ALL USING (is_service_role());

CREATE POLICY "Super admins can view all site pages" ON public.site_pages
  FOR SELECT USING (is_system_admin(auth.uid()));

-- site_maps RLS
CREATE POLICY "Members can view site maps" ON public.site_maps
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Service role can manage site maps" ON public.site_maps
  FOR ALL USING (is_service_role());

CREATE POLICY "Super admins can view all site maps" ON public.site_maps
  FOR SELECT USING (is_system_admin(auth.uid()));

-- conversations RLS
CREATE POLICY "Members can view conversations" ON public.conversations
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Service role can manage conversations" ON public.conversations
  FOR ALL USING (is_service_role());

CREATE POLICY "Super admins can view all conversations" ON public.conversations
  FOR SELECT USING (is_system_admin(auth.uid()));

-- chat_messages RLS (join through conversations for org check)
CREATE POLICY "Members can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND is_org_member(auth.uid(), c.organization_id)
    )
  );

CREATE POLICY "Service role can manage chat messages" ON public.chat_messages
  FOR ALL USING (is_service_role());

CREATE POLICY "Super admins can view all chat messages" ON public.chat_messages
  FOR SELECT USING (is_system_admin(auth.uid()));

-- Updated_at trigger for widget_configs
CREATE TRIGGER update_widget_configs_updated_at
  BEFORE UPDATE ON public.widget_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Index for fast widget API key lookups
CREATE INDEX idx_widget_configs_api_key ON public.widget_configs(api_key);

-- Index for conversation lookups
CREATE INDEX idx_conversations_org_id ON public.conversations(organization_id, started_at DESC);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);
CREATE INDEX idx_site_pages_org_id ON public.site_pages(organization_id);
CREATE INDEX idx_site_maps_org_id ON public.site_maps(organization_id);

-- Enable realtime for conversations and chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
