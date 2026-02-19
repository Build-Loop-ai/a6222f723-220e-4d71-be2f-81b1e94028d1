

# Complete Redesign: Voice Receptionist to Website Embed Widget

## Overview

Transform the platform from a phone-based AI receptionist into a **website embed widget** that provides voice + text chat, using Firecrawl to crawl customer websites and guide visitors to the right pages. The existing auth, organizations, billing, and admin infrastructure stays intact.

## What Changes

### Concept Shift
- **Before**: AI answers phone calls for businesses using Twilio phone numbers
- **After**: AI powers a chat widget businesses embed on their websites, using their site content as knowledge

### What Gets Removed
- All Twilio integration (phone numbers, forwarding, etc.)
- Phone-specific edge functions: `buy-phone-number`, `search-phone-numbers`, `release-phone-number`, `cleanup-vapi-phone`, `update-forwarding-status`, `vapi-webhook`
- Phone-related UI: `PhoneNumberDialog`, `TestCallDialog`, phone carrier utilities
- Call log dashboard views (replaced with conversation logs)
- Phone-specific onboarding steps

### What Stays
- Authentication (login, signup, forgot password, invitations)
- Organizations, user roles, profiles
- Subscriptions and Stripe billing
- Admin panel and system roles
- Site config and branding
- Email via Resend
- Google Calendar integration
- Vapi (repurposed for browser-based voice in the widget)
- ElevenLabs (voice synthesis)

---

## Implementation Plan

### Phase 1: Database Changes

**New tables:**

1. **`widget_configs`** -- per-organization widget settings
   - `id`, `organization_id`, `position` (bottom-right, bottom-left), `theme` (light/dark/auto), `accent_color`, `welcome_message`, `placeholder_text`, `avatar_url`, `widget_title`, `allowed_domains` (array), `voice_enabled` (boolean), `created_at`, `updated_at`

2. **`site_pages`** -- cached Firecrawl content
   - `id`, `organization_id`, `url`, `title`, `content_markdown`, `summary`, `last_crawled_at`, `created_at`

3. **`site_maps`** -- discovered URLs from Firecrawl map
   - `id`, `organization_id`, `url`, `is_crawled`, `created_at`

4. **`conversations`** -- replaces call_logs
   - `id`, `organization_id`, `visitor_id` (anonymous identifier), `channel` (text/voice), `status`, `started_at`, `ended_at`, `page_url` (where visitor started), `metadata`

5. **`chat_messages`** -- individual messages
   - `id`, `conversation_id`, `role` (user/assistant/system), `content`, `suggested_url`, `created_at`

**Tables to eventually clean up** (not dropped immediately to preserve data):
- `phone_numbers`, `call_logs` -- mark as deprecated, remove references in code

**RLS policies**: All new tables get org-based RLS policies. `conversations` and `chat_messages` also need a public insert policy for anonymous widget visitors (validated via widget API key).

### Phase 2: Firecrawl Integration

Connect Firecrawl using the connector system.

**New edge functions:**

1. **`crawl-site`** -- triggered during onboarding or manually
   - Uses Firecrawl `map` to discover all URLs on the customer's website
   - Stores URLs in `site_maps`
   - Crawls top pages (limit ~50) using Firecrawl `scrape`, stores content in `site_pages`
   - Generates summaries for each page using Lovable AI

2. **`refresh-site`** -- re-crawl on demand or scheduled
   - Updates `site_pages` with fresh content

3. **`widget-chat`** -- the main chat endpoint (public, no JWT required)
   - Receives message + conversation history + widget API key
   - Validates the widget key against `widget_configs`
   - Searches `site_pages` content to find relevant answers
   - Uses Lovable AI to generate a response grounded in the site content
   - Returns answer + suggested page URL when relevant
   - Supports streaming for better UX

### Phase 3: Embeddable Widget

**Widget component** (`src/components/embed/ChatWidget.tsx`):
- Floating bubble + expandable chat panel
- Text input with message history
- Voice button that uses Vapi's browser SDK for voice interaction
- Displays suggested links when the AI recommends a page
- Configurable colors, position, avatar, welcome message
- Built as a standalone bundle that can be loaded via a `<script>` tag

**Widget loader script** (served as a static asset or via edge function):
```text
<script src="https://[your-domain]/widget.js" data-widget-id="xxx"></script>
```

**Inline embed option:**
- Also provide an iframe-based embed for customers who want inline placement
- Same widget UI, just rendered in an iframe with configurable dimensions

### Phase 4: Dashboard Redesign

**Dashboard home** -- replace call-focused metrics with:
- Total conversations today
- Active visitors right now
- Messages sent
- Pages recommended
- Recent conversations feed

**Conversations page** (replaces Calls page):
- List of conversations with visitor info, channel (text/voice), duration
- Click to see full transcript
- Filter by date, channel, status

**Settings updates:**
- Remove phone number management
- Add **Widget Settings** tab: customize colors, position, welcome message, allowed domains
- Add **Knowledge Base** tab: view crawled pages, trigger re-crawl, see site map
- Keep AI assistant settings (voice selection, language, greeting)
- Keep Google Calendar, billing, team management

### Phase 5: Onboarding Redesign

New 3-step onboarding flow:

1. **Business Basics** -- name, website URL, type (same as before but website is required)
2. **Crawl Your Site** -- enter website URL, trigger Firecrawl, show progress, preview discovered pages
3. **Customize Widget** -- pick colors, write welcome message, preview the widget live

### Phase 6: Landing Page Updates

- Change hero messaging from "AI Receptionist" to "AI Website Assistant"
- Update mockup from phone call to chat widget
- Update features, pricing copy, FAQ
- Demo page: embed the actual widget for visitors to try

### Phase 7: Cleanup

- Delete Twilio-related edge functions (6 functions)
- Delete phone utility files (`phone-carriers.ts`, `phone-countries.ts`, `phone-utils.ts`)
- Remove phone-related components
- Update `health-check` to remove Twilio checks
- Update site-config defaults to reflect new branding
- Remove `TWILIO_*` secrets (4 secrets)

---

## Technical Details

### Widget Architecture

The widget will be built as a self-contained React component that gets bundled separately:

```text
Customer's website
  |
  +-- <script> tag loads widget.js
        |
        +-- Renders floating chat bubble
        +-- On click: opens chat panel
        +-- Messages sent to widget-chat edge function
        +-- Voice: initializes Vapi browser SDK
```

### AI Chat Flow

```text
Visitor sends message
  |
  +-- widget-chat edge function receives message
  |     |
  |     +-- Validates widget API key
  |     +-- Searches site_pages for relevant content (text matching)
  |     +-- Calls Lovable AI with:
  |     |     - System prompt with business context
  |     |     - Relevant page content as context
  |     |     - Conversation history
  |     |     - Instruction to suggest URLs when relevant
  |     +-- Returns AI response + optional suggested URL
  |
  +-- Widget displays response with clickable link
```

### Edge Functions Summary

| Function | Purpose | Auth |
|----------|---------|------|
| `crawl-site` | Firecrawl map + scrape customer site | JWT (org member) |
| `refresh-site` | Re-crawl site content | JWT (org member) |
| `widget-chat` | Handle chat messages from widget | Widget API key |
| `generate-widget-key` | Create API key for widget embed | JWT (org admin) |

### Files to Delete

- `supabase/functions/buy-phone-number/`
- `supabase/functions/search-phone-numbers/`
- `supabase/functions/release-phone-number/`
- `supabase/functions/cleanup-vapi-phone/`
- `supabase/functions/update-forwarding-status/`
- `supabase/functions/vapi-webhook/`
- `src/lib/phone-carriers.ts`
- `src/lib/phone-countries.ts`
- `src/lib/phone-utils.ts`
- `src/components/dashboard/PhoneNumberDialog.tsx`
- `src/components/dashboard/TestCallDialog.tsx`
- `src/components/dashboard/CallCard.tsx`
- `src/components/dashboard/CallDetailSheet.tsx`

### Execution Order

Due to the scope, this should be implemented across multiple prompts:

1. Database migrations (new tables + RLS)
2. Connect Firecrawl connector
3. Build `crawl-site` and `widget-chat` edge functions
4. Build the embeddable chat widget component
5. Redesign dashboard (conversations view)
6. Redesign onboarding (website + crawl + widget setup)
7. Update landing page messaging and visuals
8. Delete deprecated phone/Twilio code and functions
9. End-to-end testing

