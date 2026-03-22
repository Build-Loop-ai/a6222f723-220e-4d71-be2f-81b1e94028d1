

# Fix Voice Call Duration & Add Link Sharing

## Two Problems

### 1. Voice calls max out at 30 seconds
The Vapi assistant is created with `maxDurationSeconds: 30` in the `create-vapi-assistant` edge function (line 363). This is far too short for real conversations.

**Fix**: Increase `maxDurationSeconds` from `30` to `300` (5 minutes). The client-side overlay already has a 300-second timer limit, so these will align. Also need to update any existing Vapi assistants via the `update-vapi-assistant` function.

### 2. Voice agent can't share clickable links
Currently the voice overlay is a full-screen takeover with no way to display links or navigation suggestions. When the Vapi agent mentions a page, the user has no way to click through.

**Fix**: Add a `navigateToPage` tool to the Vapi assistant that the AI can call when the user asks to visit a page. When the tool is triggered, the webhook returns the URL, and the client-side overlay displays it as a clickable link card. This uses Vapi's existing tool-calling infrastructure.

## Files to Change

### 1. `supabase/functions/create-vapi-assistant/index.ts`
- Change `maxDurationSeconds: 30` → `maxDurationSeconds: 300`
- Add a new `navigateToPage` tool definition alongside the existing `checkAvailability` and `bookAppointment` tools. The tool takes a `url` and `title` parameter and tells the AI to suggest a page link.

### 2. `supabase/functions/vapi-webhook/index.ts`
- Add a `navigateToPage` case in `handleToolCalls` that returns the URL back as a success result (the AI just needs confirmation it was shared).

### 3. `src/components/embed/VoiceCallOverlay.tsx`
- Listen for Vapi `message` events to detect when the agent calls `navigateToPage`
- Display a clickable link card at the bottom of the overlay when a URL is shared
- The link opens in `_blank` (new tab) so the call continues
- Auto-dismiss the link card after ~10 seconds or when user clicks it

### 4. `supabase/functions/update-vapi-assistant/index.ts`
- Ensure the update function also includes `maxDurationSeconds: 300` when rebuilding the assistant config, so existing assistants get the new limit on next update

## Technical Detail

**Vapi tool flow for link sharing:**
1. User says "Can I see your services page?"
2. Vapi AI calls `navigateToPage` tool with `{ url: "https://example.com/services", title: "Services" }`
3. Webhook returns `{ success: true }` so AI confirms verbally
4. Client receives the tool call via Vapi's `message` event (type `tool-calls`)
5. Overlay renders a floating link card the user can tap

**Duration change**: Only the Vapi-side `maxDurationSeconds` needs updating. The client overlay already supports 300s. Existing assistants will pick up the change on their next settings update.

