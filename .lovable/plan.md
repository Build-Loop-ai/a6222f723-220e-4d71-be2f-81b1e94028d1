

## Fix VAPI Voice Call Failing Immediately

### Root Causes Identified

There are three bugs causing the call to close immediately:

1. **Stale closure in `endCall`**: The `useEffect` runs once (empty dependency array) and captures the initial `endCall` function where `status = "connecting"`. When the Vapi SDK fires events later, they use a stale reference. If `endCall` gets called twice (e.g., from both an "error" event and the `.catch()`), the second call passes the `status === "ended"` guard because the stale closure still sees `status = "connecting"`.

2. **No cleanup of Vapi event listeners**: Every time the overlay mounts, new event listeners are added via `vapi.on(...)`, but they are never removed on unmount. If the user opens the call overlay a second time, the old listeners from the previous instance fire alongside new ones, causing double `endCall` invocations.

3. **Singleton Vapi instance gets into a dirty state**: `resetVapiClient()` sets the variable to `null`, but doesn't call cleanup methods on the old instance. The old instance may still have active internal state that interferes when a new instance is created.

### Fix Plan

**File: `src/lib/vapi-client.ts`**
- Before resetting the singleton to null, call `vapi.stop()` and remove all event listeners on the old instance
- Add a `createFreshVapiClient` function that always returns a clean new instance for each call session

**File: `src/components/embed/VoiceCallOverlay.tsx`**
- Replace `useCallback` for `endCall` with a ref-based pattern so the effect always calls the latest version (avoids stale closure)
- Add proper cleanup in the `useEffect` return: remove all event listeners from the Vapi instance
- Add a guard (`endingRef`) to prevent double-invocation of end logic
- Add visible error feedback: instead of silently closing, show the actual error message briefly (e.g., "Connection failed") before closing, so users can see what went wrong
- Add `console.log` breadcrumbs for each lifecycle event to aid debugging

**File: `src/components/embed/ChatPanel.tsx`**
- Stop the mic stream tracks in the `onEnd` callback (already done, just verify)
- Pass the existing `micStream` to the overlay so Vapi can potentially reuse it (prevents double mic request)

### Expected Outcome
- The call overlay will no longer close immediately due to stale closures or duplicate event firings
- If the call genuinely fails (e.g., network issue or VAPI API error), the user will see a brief error message before the overlay closes
- Console logs will show exactly where the failure occurs for future debugging

### Testing
- After implementation, publish the app and test the voice call on the live URL
- The preview environment may still have limitations with certain network requests, so the published URL is the reliable way to verify

