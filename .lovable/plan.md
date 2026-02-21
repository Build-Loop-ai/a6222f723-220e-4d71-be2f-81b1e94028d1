

## Fix VAPI Voice Call -- "[object Object]" Error and Immediate Close

### Root Causes

**Problem 1: `vapi.start()` is called outside user gesture context**

The current flow is:
1. User clicks phone button -> `getUserMedia()` runs (good -- user gesture)
2. `setInCall(true)` triggers React re-render
3. `VoiceCallOverlay` mounts -> `useEffect` fires -> `vapi.start()` is called

By the time `useEffect` runs, the browser no longer considers it a user gesture. The Vapi SDK internally needs microphone access via Daily.co, and this second mic request is blocked because the gesture context was lost across the React render boundary. The pre-acquired `micStream` from step 1 is never passed to Vapi -- it's wasted.

**Problem 2: "[object Object]" error display**

The error handler does:
```typescript
const msg = err instanceof Error ? err.message : String(err);
```

The Vapi SDK's `error` event passes a plain object (not an `Error` instance), so `String({some: "data"})` produces `"[object Object]"`. This gets displayed as the error message.

### Fix Plan

**File: `src/components/embed/ChatPanel.tsx`**
- Remove the pre-emptive `getUserMedia()` call from the phone button click handler (it's unnecessary -- Vapi handles mic access internally)
- Instead, create the Vapi instance and call `vapi.start()` directly inside the click handler (preserving user gesture context)
- Pass the already-started Vapi instance to `VoiceCallOverlay` as a prop instead of passing keys/IDs

**File: `src/components/embed/VoiceCallOverlay.tsx`**
- Accept a `vapiInstance` prop (already started) instead of `vapiPublicKey` / `vapiAssistantId`
- Remove the `useEffect` that creates the client and calls `vapi.start()` -- the call is already in progress
- Keep the `useEffect` only for attaching event listeners (`call-start`, `call-end`, `speech-start`, `speech-end`, `error`) and cleaning them up on unmount
- Fix error serialization: use `JSON.stringify(err)` for non-Error objects so the actual error details are shown instead of "[object Object]"

**File: `src/lib/vapi-client.ts`**
- No changes needed -- `createFreshVapiClient` already works correctly

### Technical Details

The restructured flow will be:

```text
User clicks phone button
  -> createFreshVapiClient(publicKey)     [still in gesture context]
  -> vapi.start(assistantId)              [still in gesture context - mic allowed]
  -> setVapiInstance(vapi)
  -> setInCall(true)
  -> VoiceCallOverlay mounts with running instance
  -> useEffect attaches event listeners to track call status
```

This keeps `vapi.start()` in the synchronous call chain of the click event, which satisfies the browser's user gesture requirement.

### Error Display Fix

```typescript
// Before (broken):
const msg = err instanceof Error ? err.message : String(err);
// Shows: "[object Object]"

// After (fixed):
const msg = err instanceof Error
  ? err.message
  : (typeof err === 'object' ? JSON.stringify(err) : String(err));
// Shows: actual error details like '{"error":"meeting has ended"}'
```

### Expected Outcome
- Voice calls will connect successfully because `vapi.start()` runs within user gesture context
- Errors will display meaningful messages instead of "[object Object]"
- The mic stream is managed entirely by Vapi (no redundant `getUserMedia` call)

