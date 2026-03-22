

# Fix: Widget Iframe Embed URL

## Problem
The iframe embed snippet in `EmbedCodeSnippet.tsx` uses `window.location.origin` to build the iframe URL. When the user copies this from the dashboard, it points to the Lovable preview domain (e.g., `https://id-preview--xxx.lovable.app/widget?key=...`), which requires Lovable login.

## Solution
Update `EmbedCodeSnippet.tsx` to use the **published URL** for the iframe snippet instead of `window.location.origin`. The published URL is `https://a6222f723-220e-4d71-be2f-81b1e94028d1.lovable.app`. We should derive this from `VITE_SUPABASE_PROJECT_ID` or hardcode the published domain pattern.

However, a better long-term approach: since the **script tag** embed already works perfectly without any origin dependency (it loads from the edge function URL and injects the widget inline), we should:

1. **Make the script tag the primary/default** embed method (it already is labeled "recommended")
2. **Fix the iframe URL** to use the published app URL instead of `window.location.origin`
3. **Add a note** on the iframe option that it requires the app to be published

### File Change: `src/components/embed/EmbedCodeSnippet.tsx`

- Replace `window.location.origin` with the published URL derived from the environment
- Use a pattern like `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.lovable.app` or store the published domain
- Since we know the published URL, we can use it directly, but a cleaner approach is to use `VITE_SUPABASE_URL` to construct a standalone widget-embed endpoint, or simply note that users should replace the domain with their own

**Concrete change**: Replace the iframe origin with the known published domain, and add a comment in the snippet telling users to use their custom domain if they have one.

### Technical Details
- `EmbedCodeSnippet.tsx` line 26: change `${window.location.origin}` to the published URL
- The published URL pattern from Lovable is available but not as an env var — we'll use a hardcoded published domain or make the iframe snippet point users to use their own domain
- Best approach: read from a constant or env var, falling back to guidance text

