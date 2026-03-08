

# Final Production Readiness Sweep

After reviewing every page, component, edge function, and flow end-to-end, here is what still needs fixing:

---

## Issues Found

### 1. Signup `emailRedirectTo` points to `/` instead of `/auth/callback`
**File**: `src/hooks/useAuth.tsx` line 44
**Problem**: `emailRedirectTo: ${window.location.origin}/` — when a user clicks the email confirmation link, they land on the landing page (`/`) instead of `/auth/callback`, which checks onboarding status and routes them correctly. They'd have to manually navigate to login.
**Fix**: Change to `${window.location.origin}/auth/callback`.

### 2. No global ErrorBoundary
**Problem**: If any React component throws, the entire app white-screens. There's no fallback UI anywhere.
**Fix**: Create a simple `ErrorBoundary` component and wrap the app in it. Show a "Something went wrong" screen with a retry button.

### 3. No SEO meta tags on landing page, Terms, or Privacy
**Problem**: `Index.tsx`, `Terms.tsx`, and `Privacy.tsx` have no `<Helmet>` tags. The other public pages (Demo, Assessment, Admin) already use react-helmet. Missing title/description hurts SEO and social sharing.
**Fix**: Add `<Helmet>` with appropriate title, description, and og:tags to Index, Terms, Privacy, Signup, Login, and ForgotPassword.

### 4. DashboardCalls not in sidebar or bottom nav
**Problem**: The `/dashboard/calls` route exists and works, but it's not in the sidebar nav (`DashboardSidebar.tsx`) or mobile bottom nav (`BottomNav.tsx`). Users can only reach it from the main dashboard's call cards. It should be accessible from navigation.
**Fix**: Add a "Calls" item with the `Phone` icon to the sidebar nav items (between Conversations and Analytics) and optionally to the mobile bottom nav.

### 5. `QueryClient` has no global error handler
**Problem**: The `QueryClient` is created with no `defaultOptions`. Failed queries show nothing to the user — data just silently doesn't load.
**Fix**: Add `defaultOptions.queries.retry: 1` and a global `onError` that shows a toast.

### 6. `DashboardConversations` message count query can hit 1000-row limit
**Problem**: Line 70-73 fetches `chat_messages` for all conversation IDs, but with no `.limit()`. If there are >1000 messages across those conversations, the count will be wrong due to the default 1000-row Supabase limit.
**Fix**: Use a database function or `.select('conversation_id', { count: 'exact', head: true })` grouped by conversation_id, or at minimum add a `.limit(5000)` safety valve.

---

## Implementation Order

1. Fix signup `emailRedirectTo` → `/auth/callback` (one-line fix)
2. Add "Calls" to sidebar and bottom nav
3. Create ErrorBoundary component and wrap App
4. Add SEO meta tags to public pages
5. Add QueryClient global error handling
6. Fix conversation message count query limit

