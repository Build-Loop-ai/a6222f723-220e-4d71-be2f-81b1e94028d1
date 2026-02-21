

# Glassy Top Bar for Widget Builder

## Overview

Replace the right-side builder panel with a floating glassy top toolbar. This maximizes the canvas area and creates a more modern, Figma/Canva-style editing experience. The canvas fills the entire viewport while a translucent toolbar hovers at the top with all controls accessible via tab sections and expandable dropdowns/popovers.

## Layout Change

**Current**: Navigation sidebar (left) | Canvas (center) | Builder panel 300px (right)

**New**: Navigation sidebar (left) | Full canvas with glassy top bar overlay

## Design Details

### Glassy Top Bar
- Fixed to the top of the canvas area, full width
- Glassmorphism: `backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-lg`
- Height: ~56px for the main bar
- Contains:
  - Left: Widget Builder label + Wand2 icon + auto-save indicator
  - Center: Tab pills (Design / Embed / Domains) -- same as current but horizontal
  - Right: Preview button + position toggle (left/right)

### Design Tab -- Inline Controls
When "Design" is active, the top bar shows a compact horizontal control strip:
- Brand color swatches (the preset circles) inline
- Color picker input
- Font selector as a small dropdown/popover
- Corner style as a small dropdown/popover
- Feature toggles (Voice, Branding) as icon buttons
- A "More" or zone-specific editing via a dropdown panel that slides down from the bar when a zone is clicked on the canvas

### Zone Editing
When a user clicks a zone on the canvas preview, a slim dropdown panel slides down from the top bar (still glassy) showing the zone-specific fields (text inputs, color pickers). Clicking away or pressing the back button closes it.

### Embed/Domains Tabs
These open a centered popover/dropdown panel below the top bar (not a full sidebar) with the embed code snippet or domain management UI.

## Technical Plan

### File: `src/components/settings/WidgetSettings.tsx`

1. **Remove** the right panel `<div className="w-[300px]">` and all its contents (lines 821-1139)
2. **Add** a new `<div>` as the first child inside the canvas container, positioned as an overlay at the top:
   - Glassmorphism styling with `backdrop-blur-xl`, semi-transparent background
   - Contains the tab navigation, inline design controls, and action buttons
3. **Add** a collapsible dropdown panel below the top bar for:
   - Zone-specific editors (triggered by clicking canvas zones)
   - Embed code display
   - Domains management
4. **Reorganize** the Design controls into a horizontal layout:
   - Color swatches displayed inline as a row
   - Font, corners, and toggles as small popover triggers
5. **Adjust** canvas padding to account for the top bar height (~56px top padding or margin)

### File: `src/layouts/DashboardLayout.tsx`
- No changes needed -- the full-bleed route already works correctly

### New UI Pattern
- Use Radix `Popover` components for font/corner/feature dropdowns
- Use `AnimatePresence` + `motion.div` for the slide-down panel animation
- Keep the existing state management (`activePanel`, `editingZone`, config updates) -- only the rendering layout changes

## What Stays the Same
- All the config state, auto-save logic, and data fetching
- The canvas with website iframe/screenshot background
- The chat panel preview and bubble positioning
- Zone click detection on the canvas
- Embed code snippet and domain management functionality
