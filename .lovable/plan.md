
# Add Voice Agent (VAPI) Call to the Chat Widget

## Overview

Currently the widget has a microphone button that does **speech-to-text** (browser's SpeechRecognition API) -- it transcribes your voice into text and sends it as a chat message. What's missing is a **live voice call** with the VAPI voice agent, similar to a phone call experience.

This plan adds a dedicated "Call" button to the widget that starts an interactive voice conversation powered by VAPI, right inside the chat panel.

## What the User Will See

1. **New phone icon** in the chat panel input area (next to the existing mic button) -- a `Phone` icon that starts a live voice call
2. **In-call overlay** inside the chat panel showing:
   - A pulsing animation indicating the call is active
   - "Speaking..." / "Listening..." status indicators
   - A red "End Call" button
   - Call duration timer
3. When the call ends, the panel returns to the normal chat view

## How It Works

- The widget needs two new props: `vapiPublicKey` and `vapiAssistantId`
- These come from the organization's settings (`organization_settings.vapi_assistant_id` and the `VAPI_PUBLIC_KEY` secret)
- When the user clicks the phone button, it uses the existing `vapi-client.ts` helper to start a browser-based VAPI call
- The VAPI Web SDK handles all audio capture/playback in the browser

## Technical Details

### 1. Database: Add VAPI fields to widget_configs table

Add a new `voice_call_enabled` boolean column to `widget_configs` to let orgs control whether the voice call button appears (separate from the existing `voice_enabled` which controls speech-to-text).

### 2. New Edge Function: `get-widget-voice-config`

A lightweight public endpoint that the embedded widget calls to get the VAPI public key and assistant ID for a given widget API key. This avoids exposing secrets in the widget loader.

- Input: `x-widget-key` header
- Output: `{ vapiPublicKey, vapiAssistantId }` (or empty if not configured)
- Looks up `widget_configs` -> `organization_settings` to find the assistant ID, and reads the `VAPI_PUBLIC_KEY` secret

### 3. New Component: `VoiceCallOverlay.tsx`

A full-panel overlay rendered inside ChatPanel when a voice call is active:

- Uses `startVapiCall` / `stopVapiCall` from `vapi-client.ts`
- Shows animated concentric rings (pulsing) during the call
- Displays status: "Connecting...", "Listening...", "Speaking..."
- Shows a call duration timer
- Big red "End Call" button
- Auto-ends after 30 seconds (matching existing duration cap)

### 4. Update `ChatPanel.tsx`

- Accept new optional props: `vapiPublicKey` and `vapiAssistantId`
- Add `inCall` state
- Render `VoiceCallOverlay` when `inCall === true`
- Add a `Phone` icon button next to the send button (only visible when `vapiPublicKey` and `vapiAssistantId` are provided)

### 5. Update `ChatWidget.tsx`

- Add `vapiPublicKey` and `vapiAssistantId` optional props
- Pass them through to `ChatPanel`

### 6. Update `WidgetSettings.tsx`

- Fetch `vapi_assistant_id` from `organization_settings` for the current org
- Add a "Voice Call" toggle in the widget design settings
- Pass `vapiPublicKey` and `vapiAssistantId` to the try-mode `ChatWidget`

### 7. Update `widget-loader` edge function

- Include `voice_call_enabled` in the config it serves
- When `voice_call_enabled` is true, also fetch and include the VAPI public key and assistant ID in the widget initialization data

### File Changes Summary

| File | Change |
|------|--------|
| `supabase/migrations/` | Add `voice_call_enabled` column to `widget_configs` |
| `supabase/functions/get-widget-voice-config/index.ts` | New edge function |
| `src/components/embed/VoiceCallOverlay.tsx` | New component - in-call UI |
| `src/components/embed/ChatPanel.tsx` | Add phone button + voice call overlay |
| `src/components/embed/ChatWidget.tsx` | Pass through VAPI props |
| `src/components/settings/WidgetSettings.tsx` | Voice call toggle + pass VAPI config to try mode |
| `supabase/functions/widget-loader/index.ts` | Include voice call config |
| `supabase/functions/widget-chat/index.ts` | No changes needed |
