
-- Add granular styling columns to widget_configs
ALTER TABLE public.widget_configs
  ADD COLUMN IF NOT EXISTS header_text_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS bot_message_bg text NOT NULL DEFAULT '#f3f4f6',
  ADD COLUMN IF NOT EXISTS bot_message_text_color text NOT NULL DEFAULT '#1f2937',
  ADD COLUMN IF NOT EXISTS user_message_text_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS font_family text NOT NULL DEFAULT 'DM Sans',
  ADD COLUMN IF NOT EXISTS border_radius text NOT NULL DEFAULT 'rounded',
  ADD COLUMN IF NOT EXISTS show_branding boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS header_subtitle text NOT NULL DEFAULT 'Online',
  ADD COLUMN IF NOT EXISTS bot_name text NOT NULL DEFAULT 'AI Assistant',
  ADD COLUMN IF NOT EXISTS chat_bg_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS input_bg_color text NOT NULL DEFAULT '#f9fafb',
  ADD COLUMN IF NOT EXISTS input_text_color text NOT NULL DEFAULT '#111827',
  ADD COLUMN IF NOT EXISTS input_border_color text NOT NULL DEFAULT '#e5e7eb';
