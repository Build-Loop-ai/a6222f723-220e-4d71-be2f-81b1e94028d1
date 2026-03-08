

# Remaining Production Fixes

## What's left from the analysis

Most items (13 of 19) were already implemented. Here are the 5 remaining fixes:

### 1. Stripe Graceful Degradation in UI
**Problem**: If Stripe secrets aren't configured, clicking "Change Plan" will error. The edge functions handle it, but the UI doesn't hide billing actions gracefully.
**Fix**: In `BillingCard.tsx`, catch the "Payments not configured" error from `stripe-checkout` and show a friendly message instead of a raw error. Also add a subtle note when no Stripe customer exists yet.

### 2. Widget-Chat Rate Limiting
**Problem**: No rate limiting — bad actors can spam messages, consuming AI credits.
**Fix**: Add IP + visitor-based rate limiting in `widget-chat/index.ts`. Track message counts per visitor_id in a simple in-memory map (resets on cold starts) with a fallback DB check. Limit to ~30 messages per visitor per 10-minute window.

### 3. Crawl-Site Delete+Upsert Cleanup
**Problem**: `crawl-site` deletes all rows then uses upsert (redundant). If delete fails silently due to RLS edge cases, stale data remains.
**Fix**: Change upserts to plain inserts (since we just deleted), and add error handling on the delete operations.

### 4. Standardize Edge Function Auth Pattern
**Problem**: Inconsistent auth — some use `getUser(token)`, some `getUser()`, some `getClaims()`.
**Fix**: Update `stripe-checkout` and `stripe-portal` to use `getClaims(token)` pattern per best practices. Leave `complete-onboarding` as-is since it needs the full user object.

### 5. Profiles INSERT RLS Policy
**Problem**: If the `handle_new_user` trigger fails, there's no way for a user to create their own profile row.
**Fix**: Add a migration with an INSERT policy: `auth.uid() = id` so users can insert their own profile if needed.

---

### Implementation Order
1. Database migration for profiles INSERT policy
2. Update `widget-chat` with rate limiting
3. Clean up `crawl-site` delete/insert logic
4. Standardize auth in `stripe-checkout` and `stripe-portal`
5. Improve `BillingCard` error handling for unconfigured Stripe

