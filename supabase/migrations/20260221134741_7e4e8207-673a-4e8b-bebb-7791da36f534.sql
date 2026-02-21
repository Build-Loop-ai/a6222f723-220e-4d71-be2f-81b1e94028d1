-- Add a column to track auto-extracted business data from website crawls
ALTER TABLE public.organization_settings
ADD COLUMN extracted_business_data jsonb DEFAULT NULL;

-- This will store structured data like:
-- { "description": "...", "phone": "...", "address": {...}, "business_hours": {...}, "services": [...], "extracted_at": "..." }
COMMENT ON COLUMN public.organization_settings.extracted_business_data IS 'Structured business data auto-extracted from website during crawl';