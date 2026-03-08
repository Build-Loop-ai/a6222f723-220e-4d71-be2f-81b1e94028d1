

# Final Polish — Auth Page SEO + Widget Embed Config

Two small items remain:

## 1. Add SEO meta tags to auth pages
**Files**: `Login.tsx`, `Signup.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`

Each page is missing `<Helmet>` tags. Add title and description to each:
- Login: "Log In — Greet"
- Signup: "Sign Up — Greet"
- Forgot Password: "Reset Password — Greet"
- Reset Password: "Set New Password — Greet"

Simple one-liner additions using the existing `react-helmet` package.

## 2. WidgetEmbed: Fetch actual widget config instead of hardcoded defaults
**File**: `src/pages/WidgetEmbed.tsx`

Currently the embed page hardcodes accent color, title, etc. This means if a customer customizes their widget (different color, voice enabled, custom title), the iframe embed ignores it all.

**Fix**: Query `widget_configs` table using the API key to fetch the real config, then pass those values to `ChatWidget`. Fall back to defaults if the query fails. This can use the existing `supabase` client with the anon key since `widget_configs` likely has a select policy or we can use the `get-widget-voice-config` edge function that already exists.

---

That's it. After these two, the app is fully production-ready.

