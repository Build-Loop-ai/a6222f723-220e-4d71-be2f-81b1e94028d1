
Fix the iframe widget so the unused iframe area is transparent instead of black, while keeping the widget collapsed by default.

## What’s causing it
The `/widget` page only makes its inner wrapper transparent. The actual document surface (`html`, `body`, and `#root`) still inherits the app’s dark global background, so the iframe rectangle appears black in external iframe testers. Also, the embedded widget layout should behave like a floating widget inside the iframe, not like a full-page app.

## Plan
1. Add a dedicated “embed mode” for the `/widget` route
- In `src/pages/WidgetEmbed.tsx`, apply a route-scoped embed class or inline document styles on mount
- Force `html`, `body`, and `#root` to:
  - `background: transparent`
  - no dark theme fill
  - full height
- Clean these styles up on unmount so the rest of the app is unaffected

2. Refine the embedded widget layout
- In `src/components/embed/ChatWidget.tsx`, wrap embedded mode in a transparent full-frame container
- Keep the widget collapsed initially
- Keep toggle behavior exactly as it works now

3. Make the open panel float inside the iframe instead of occupying the full iframe surface
- In `src/components/embed/ChatPanel.tsx`, change embedded mode from a full white `h-full w-full` panel to a floating card anchored near the bubble
- Preserve transparency around the panel so the host page shows through
- Keep normal non-embed behavior unchanged

4. Prevent cutoff without reintroducing a full-screen white/black canvas
- Constrain the embedded panel with responsive sizing, e.g.:
  - width capped to iframe width minus margins
  - height capped to iframe height minus bubble/header spacing
- Use embedded-specific positioning so the panel opens upward cleanly inside small iframe sizes

5. Add a small embed hardening pass
- Make the embedded bubble/panel use iframe-scoped positioning for consistency
- Confirm the generated iframe snippet still points to the published URL, not a preview URL

## Files to update
- `src/pages/WidgetEmbed.tsx`
- `src/components/embed/ChatWidget.tsx`
- `src/components/embed/ChatPanel.tsx`
- `src/index.css` (or equivalent route-scoped embed styles)

## Technical details
The key fix is not the widget card itself; it’s the page chrome behind it. Right now the iframe document still renders the app’s dark background. The correct solution is:
- transparent document background in widget route
- transparent wrapper around the widget
- floating embedded panel with bounded dimensions

That will make the iframe look like a true overlay widget instead of a black mini-page.
