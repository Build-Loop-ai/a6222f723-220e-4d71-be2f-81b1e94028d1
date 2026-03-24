

# Fix Hero Voice Agent — Use Real Vapi Integration

## Problem
The hero section's voice tab is purely cosmetic — it fakes "AI is speaking" with animations and a counting timer. No actual Vapi connection, no audio, no real call.

## Solution
Replace the fake voice UI with the same real Vapi integration used in the chat widget (`ChatPanel.tsx` → `createFreshVapiClient` + `VoiceCallOverlay`).

## Architecture

```text
User clicks "Start Call" in hero
        │
        ▼
Fetch /hero-voice-config  ──►  Returns { vapiPublicKey, vapiAssistantId }
        │                       (from VAPI_PUBLIC_KEY secret + demo org's assistant)
        ▼
createFreshVapiClient(publicKey)
        │
        ▼
vapi.start(assistantId)
        │
        ▼
VoiceCallOverlay renders inside the widget card
(same component used in the production widget)
```

## Changes

### 1. New edge function: `supabase/functions/hero-voice-config/index.ts`
Returns the platform VAPI_PUBLIC_KEY and the demo organization's assistant ID. Lightweight, no auth required — it only exposes the public key and a single assistant ID meant for demo use.

### 2. Update `src/components/landing/HeroSection.tsx`
- Import `createFreshVapiClient`, `resetVapiClient`, `stopVapiCall` from `@/lib/vapi-client`
- Import `VoiceCallOverlay` from `@/components/embed/VoiceCallOverlay`
- On mount (when widget becomes "ready"), fetch `/hero-voice-config` to get `vapiPublicKey` + `vapiAssistantId`
- Replace the fake voice tab content:
  - When no active call: show "Start Call" button (same as now)
  - On "Start Call" click: call `createFreshVapiClient(publicKey)` then `vapi.start(assistantId)`, set state to show `VoiceCallOverlay`
  - `VoiceCallOverlay` handles all call states (connecting, listening, speaking, ended) with real audio
  - On "End Call" or call-end event: reset back to the Start Call button
- Remove the fake `voiceActive`, `voiceSeconds`, and fake animation states for the voice tab
- Keep the chat tab completely unchanged

### 3. No database changes needed
The demo org (Everyman AI) already has a Vapi assistant configured. The edge function will query it.

## Technical Notes
- `VoiceCallOverlay` is rendered **inside** the hero widget card (within the voice tab area), not as a full-screen overlay
- The overlay's `onEnd` callback resets local state back to the idle voice view
- Microphone permission will be requested by Vapi SDK automatically on call start
- The existing `vapi-proxy` edge function handles SDK traffic server-side

