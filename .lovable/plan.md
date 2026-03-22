

# Fix Widget Embed: Shadow & Cutoff

## Problems
1. **Shadow**: The panel uses `shadow-2xl` which creates a visible backdrop shadow around the widget in the iframe.
2. **Cutoff at top**: The panel height `min(520px, calc(100vh - 90px))` plus `bottom-24` (96px) positioning means the panel can extend above the iframe viewport. The iframe snippet is only `600px` tall — not enough headroom.

## Changes

### 1. `src/components/embed/ChatPanel.tsx`
- Remove `shadow-2xl` from the embedded container class (replace with `shadow-lg` or `shadow-none`)
- Change embedded height constraint to `calc(100vh - 100px)` to guarantee it fits above the bubble with margin

### 2. `src/components/embed/EmbedCodeSnippet.tsx`
- Increase the iframe height in the snippet from `600px` to `700px` to give more room for the chat panel

### Technical Detail
- Line 216: Change `shadow-2xl` → `shadow-lg` in the embedded branch
- Line 216: Change height from `h-[min(520px,calc(100vh-90px))]` → `h-[min(520px,calc(100vh-100px))]`
- Line 31: Change iframe `height:600px` → `height:700px`

