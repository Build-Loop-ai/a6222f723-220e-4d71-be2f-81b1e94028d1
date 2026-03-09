

## Dramatically Improve AI Agent Quality

### Problem Summary

There are two major quality gaps in how the AI agents answer questions:

1. **Voice Agent (Vapi)**: The system prompt includes business hours, services, and address, but has absolutely no knowledge of the actual website content (site_pages). If a caller asks "What do you offer?" or "Tell me about your pricing", the voice agent has nothing to work with.

2. **Chat Agent (widget-chat)**: Uses a very basic keyword search (splitting on spaces, filtering words > 3 chars) which misses many relevant pages. It also truncates each page to only 1,000 characters, losing important details.

### Plan

#### 1. Inject website knowledge into the Vapi voice agent

**File: `supabase/functions/create-vapi-assistant/index.ts`**

- After fetching org and settings, also fetch all `site_pages` for the organization
- Build a condensed knowledge base from site page summaries and key content (up to ~4,000 tokens to stay within Vapi's system prompt limits)
- Add a new "## Website Knowledge Base" section to the system prompt containing:
  - Page titles and their summaries
  - Key content snippets from the most important pages (home, about, services, pricing, contact, FAQ)
- Prioritize pages by relevance: pages with titles containing "about", "services", "pricing", "FAQ", "contact" come first

#### 2. Improve chat agent content retrieval

**File: `supabase/functions/widget-chat/index.ts`**

- Replace the naive keyword search with a smarter approach:
  - Normalize search terms: lowercase, remove common stop words (the, is, a, an, etc.)
  - Score pages using term frequency (count occurrences, not just boolean includes)
  - Boost title/summary matches higher than body matches (3x weight)
  - Include bi-grams (two-word phrases) for better matching
- Increase content preview from 1,000 to 3,000 characters per page
- Increase max relevant pages from 5 to 8
- When no keyword matches are found, include more fallback pages (up to 5 instead of 3)

#### 3. Enhance the chat system prompt

**File: `supabase/functions/widget-chat/index.ts`**

- Fetch additional business context: organization_settings (business_hours, services, extracted_business_data)
- Include this structured data in the system prompt so the chat agent can answer questions about hours, services, and pricing even when the page search misses
- Improve the system prompt instructions to be more helpful:
  - Encourage providing specific, detailed answers rather than just pointing to URLs
  - Include business hours and services directly so common questions can be answered instantly
  - Add instructions to handle greetings, thanks, and small talk naturally

#### 4. Keep Vapi assistant in sync on re-crawl

**File: `supabase/functions/crawl-site/index.ts`**

- After crawling completes and summaries are generated, check if the org has a Vapi assistant
- If yes, trigger `create-vapi-assistant` (which already handles update-or-create) to refresh the voice agent's knowledge with the new content

### Technical Details

**Voice agent knowledge injection (create-vapi-assistant):**

```text
buildSystemPrompt() will be updated to:

1. Query site_pages for the org
2. Sort pages by priority (about/services/pricing/FAQ pages first)
3. Build a condensed knowledge section:
   - Each page: "Page: {title} | {summary}"
   - For top 5 pages: include first 800 chars of content
   - For remaining pages: summary only
4. Insert as "## Website Knowledge Base" section in prompt
```

**Chat agent improved search:**

```text
Current: split message by spaces, filter len > 3, boolean includes
New: 
  - Remove stop words (the, is, a, an, what, how, do, can, etc.)
  - Score = (title matches * 3) + (summary matches * 2) + (body matches * 1)
  - Count occurrences, not just boolean
  - Include bigrams: "business hours" matches better than "business" + "hours" separately
```

**Prompt enhancement for chat:**

```text
Current system prompt context:
  - Org name, description, special instructions
  - Matched page content (truncated)

New system prompt context:
  - Org name, description, special instructions
  - Business hours (formatted)
  - Services list with descriptions
  - Matched page content (larger, better ranked)
  - Extracted business data (phone, address)
```

**Auto-sync after crawl:**

After crawl-site finishes generating summaries, it will call the create-vapi-assistant function internally to update the voice agent's knowledge base with the fresh content.

### Expected Outcome

- Voice agent can answer detailed questions about the business based on actual website content
- Chat agent finds more relevant pages and provides richer, more detailed answers
- Both agents have access to structured business data (hours, services, contact info) for instant answers to common questions
- Re-crawling the website automatically updates both the chat and voice agents

