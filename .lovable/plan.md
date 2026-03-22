

# Fix 30-Second Voice Call Timeout on Embedded Widget

## Root Cause

The code already sets `maxDurationSeconds: 300` in both `create-vapi-assistant` and `update-vapi-assistant` edge functions. However, the **existing Vapi assistant** (ID: `46dcf106-aa4f-41cf-92da-59c5cc80ef8c`) was created before this change and still has the old 30-second limit stored on Vapi's servers.

The fix requires:
1. **Re-deploying** the `create-vapi-assistant` edge function to ensure the updated code (with 300s) is live on the server
2. **Triggering a re-sync** of the existing assistant so Vapi receives the updated `maxDurationSeconds: 300`

## Plan

### 1. Re-deploy the `create-vapi-assistant` edge function
Use the deployment tool to push the current code (which already has `maxDurationSeconds: 300`) to the live environment.

### 2. Re-deploy the `update-vapi-assistant` edge function
Same reason — ensure the live version includes `maxDurationSeconds: 300`.

### 3. Force re-sync the existing assistant
Call the `create-vapi-assistant` function with the user's organization ID. Since the assistant already exists, it will PATCH the Vapi assistant with the full payload including `maxDurationSeconds: 300`.

No code changes needed — the source code is already correct. This is a deployment/sync issue.

