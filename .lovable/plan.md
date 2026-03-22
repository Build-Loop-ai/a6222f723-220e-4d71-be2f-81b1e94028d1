

# Fix Widget Embed Issues

Three problems identified from the screenshots:

## 1. Black Background
The `/widget` embed page inherits the app's dark theme CSS (dark background from `index.css`). The `WidgetEmbed` page wrapper `div` has no explicit background color, so it picks up the global dark `body`/`:root` background.

**Fix**: Add `bg-transparent` or `bg-white` to the wrapper div in `WidgetEmbed.tsx`, and ensure the `body` background is overridden for the widget route. Best approach: add inline style `background: transparent` on the wrapper so the iframe blends with the host page.

## 2. Cookie Consent Showing in Embed
The `CookieConsent` component is rendered globally in `App.tsx` (line 107), outside the router. This means it appears on every route, including `/widget`. The widget embed should never show the cookie banner.

**Fix**: Move `CookieConsent` so it doesn't render on the `/widget` route. Options:
- Conditionally render `CookieConsent` based on the current path (check `window.location.pathname`)
- Or move it inside a layout wrapper that excludes the widget route

Simplest: Add a path check inside `CookieConsent.tsx` — if `window.location.pathname === "/widget"`, return null.

## 3. Chat Panel Getting Cut Off
The widget renders inside a `h-screen w-screen overflow-hidden` container. The `ChatPanel` uses `fixed` positioning with `bottom-24` and a height of `520px`. In a small iframe (600px height), the panel extends above the viewport and gets clipped by `overflow-hidden`.

**Fix**: In `WidgetEmbed.tsx`, remove `overflow-hidden` or make the ChatWidget render inline (not fixed-positioned) when in embed mode. Better approach: pass an `embedded` prop to `ChatWidget` so it renders the panel inline/fullscreen within the iframe instead of as a fixed overlay.

## Files to Change

1. **`src/pages/WidgetEmbed.tsx`** — Set transparent background, pass `embedded` prop to ChatWidget
2. **`src/components/CookieConsent.tsx`** — Skip rendering on `/widget` path
3. **`src/components/embed/ChatWidget.tsx`** — Accept `embedded` prop; when true, render panel inline (always open, no bubble)
4. **`src/components/embed/ChatPanel.tsx`** — Accept `embedded` prop; when true, use relative positioning and fill container instead of fixed positioning

### Technical Detail

When `embedded=true`:
- `ChatWidget` skips the bubble entirely and renders `ChatPanel` always-open, filling the iframe
- `ChatPanel` switches from `fixed` positioning to `relative` with `h-full w-full` to fill the parent container
- `WidgetEmbed` wrapper uses `bg-transparent` so the iframe has no background
- `CookieConsent` checks `window.location.pathname.startsWith("/widget")` and returns null if true

