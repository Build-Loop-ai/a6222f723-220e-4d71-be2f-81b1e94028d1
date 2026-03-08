

# Production Readiness Analysis — Release 1

## System Overview

Greet is an AI website assistant SaaS: users sign up, crawl their website, and get an embeddable chat widget powered by AI. The system includes onboarding, dashboard, widget builder, team management, billing (Stripe), voice calls (Vapi), and an admin panel.

---

## Critical Issues (Must Fix Before Production)

### 1. Onboarding Business Type Mismatch
The onboarding page (`Onboarding.tsx` line 41) defines only 5 business types: `dental_clinic`, `medical_practice`, `salon`, `restaurant`, `other`. But the database migration expanded the enum to 35+ types, and `BusinessSettings.tsx` shows the full list. **If a user selects one of the expanded types in settings after onboarding, it works — but the onboarding dropdown is outdated and inconsistent.** This needs to be synced.

### 2. Signup → Onboarding: Email Confirmation Race Condition
`signUp` in `useAuth.tsx` calls `supabase.auth.signUp()` which (by default) requires email confirmation. But `Signup.tsx` immediately navigates to `/onboarding` after signup (line 55). If email confirmation is enabled, the user won't have a valid session yet and will be bounced to `/login` by `ProtectedRoute`. **Either auto-confirm must be explicitly enabled, or the signup flow needs a "check your email" step.** Currently there is no indication to the user to verify their email.

### 3. Invitation Flow: Signup Without Email Confirmation
`AcceptInvitation.tsx` calls `signUp()` and immediately navigates to `/dashboard` (line 151). Same issue — if email confirmation is required, this will fail silently. The `handle_invitation_acceptance` trigger fires on profile creation, but the user won't have a confirmed session.

### 4. Missing STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
These secrets are not in the secrets list. `stripe-checkout`, `stripe-portal`, and `stripe-webhook` all depend on them. The checkout flow will throw "Payments not configured" errors. **Stripe must be fully configured or billing UI should be hidden/gracefully degraded.**

### 5. `crawl-site` Edge Function: Auth Bypass When Called from `complete-onboarding`
`complete-onboarding` calls `crawl-site` with `Authorization: Bearer ${serviceRoleKey}`. But `crawl-site` validates the user via `supabase.auth.getUser(token)` using an anon-key client — the service role key is not a valid user JWT. This means the **crawl will fail with 401 during onboarding**. The function needs to handle service-role auth as well.

### 6. `site_maps` and `site_pages` Upsert Conflicts
The `crawl-site` function uses `upsert` with `onConflict: "organization_id,url"` for both tables. The schema confirms these unique constraints exist. However, the function first **deletes all rows** then inserts — the upsert is redundant. More importantly, if the delete fails (RLS), old data remains and upserts could silently fail on constraint mismatches.

### 7. Widget Embed Script: No Domain Validation
`widget-loader` serves the widget JS to anyone with a valid API key. The `allowed_domains` column exists in `widget_configs` but is never checked. Any website can embed any customer's widget.

---

## Significant Issues (Should Fix)

### 8. `complete-onboarding` Uses Service Role to Insert `user_roles`
This bypasses RLS correctly, but there is no check that the user doesn't already have an organization. If called twice (e.g. network retry), it creates a duplicate organization. **Add idempotency: check if user already has an org before creating one.**

### 9. Dashboard: 50-conversation Limit
`Dashboard.tsx` fetches only 50 conversations. `todayConversations` is filtered from this set — so on busy days with >50 conversations, today's metrics will be undercounted. Use a date filter in the query instead.

### 10. `widget-chat` Fetches ALL Site Pages
Line 138-140: `select("url, title, summary, content_markdown").eq("organization_id", orgId)` with no limit. For sites with 200+ pages, this is a massive payload in memory. Add a reasonable limit or use pagination.

### 11. No Rate Limiting on Widget Chat
The `widget-chat` endpoint has no rate limiting beyond what the AI gateway provides. A bad actor could spam messages, consuming AI credits and creating thousands of conversation rows.

### 12. Stripe Webhook: No `verify_jwt = false` in config.toml
The `stripe-webhook` function is not listed in `config.toml`, meaning it uses the default `verify_jwt = true`. Stripe cannot send a valid JWT — **webhook calls will be rejected with 401**. Must add `[functions.stripe-webhook] verify_jwt = false`.

### 13. Missing Edge Functions in config.toml
Several functions that need JWT-free access are missing from config.toml: `stripe-webhook`, `vapi-webhook`, `health-check`, `send-email`, `hero-chat`. Any function called externally (webhooks) or without auth needs `verify_jwt = false`.

### 14. `DashboardCalls.tsx` Route Exists but No Route in App.tsx
There's a `DashboardCalls` page file but no `/dashboard/calls` route in `App.tsx`. The calls list is unreachable through navigation.

---

## Minor Issues (Polish)

### 15. Onboarding Crawl is Fake
Step 2 of onboarding simulates progress with `setTimeout` (lines 127-136). The actual crawl happens in `complete-onboarding` after org creation. The "0 pages discovered" text shown after fake crawl is misleading. Should either show "will be crawled after setup" or do a real preview.

### 16. Inconsistent Auth Pattern
`crawl-site` uses `getUser(token)`, `complete-onboarding` uses `getUser()`, `stripe-checkout` uses `getUser(token)`. Should standardize on `getClaims()` per the guidelines.

### 17. `AuthCallback.tsx` 5-Second Timeout
Falls back to `/login` after 5 seconds. On slow connections or when processing OAuth tokens, this could interrupt legitimate sign-ins. Consider increasing or removing the hard timeout.

### 18. `BillingCard` — No Handling for Missing Plans
If Stripe products aren't synced to the `plans` table, the billing upgrade flow shows nothing. Should show a message like "Plans coming soon" rather than empty state.

### 19. `profiles` Table: No INSERT RLS Policy
The `handle_new_user` trigger inserts profiles via `SECURITY DEFINER`, which works. But if the trigger fails or profile needs to be recreated, there's no way for a user to insert their own profile row.

---

## Recommended Fix Priority for Release 1

```text
Priority 1 (Blocking):
├── #5  Fix crawl-site auth for service-role calls during onboarding
├── #12 Add stripe-webhook to config.toml with verify_jwt = false
├── #13 Add all webhook/public functions to config.toml
├── #2  Handle email confirmation in signup flow
└── #3  Handle email confirmation in invitation flow

Priority 2 (High Impact):
├── #1  Sync onboarding business types with full enum
├── #4  Configure Stripe secrets or gracefully degrade billing UI
├── #8  Add idempotency to complete-onboarding
├── #9  Fix dashboard conversation query to filter by date
├── #10 Add limit to site_pages query in widget-chat
├── #11 Add basic rate limiting to widget-chat
└── #14 Add /dashboard/calls route or remove the page

Priority 3 (Polish):
├── #7  Enforce allowed_domains in widget-loader
├── #15 Make onboarding crawl step honest about what's happening
├── #16 Standardize edge function auth pattern
├── #17 Increase AuthCallback timeout
├── #18 Handle empty plans gracefully in billing
└── #19 Consider adding profiles INSERT policy
```

---

## Summary

The core flows (signup → onboard → dashboard → widget) are well-structured but have **5 blocking issues** that will cause failures in production: the crawl auth bypass during onboarding, missing Stripe webhook JWT config, email confirmation handling, and missing config.toml entries for webhook functions. Fixing these along with the high-impact items will give you a solid Release 1.

