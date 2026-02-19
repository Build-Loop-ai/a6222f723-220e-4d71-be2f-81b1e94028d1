

# Widget Builder: Light Theme Redesign

## Problem
The current widget builder uses the app's dark theme with grey text on dark backgrounds and white outline borders, making it hard to read and visually noisy.

## Solution
Convert the entire widget builder into a self-contained light-themed interface. This means applying light colors directly via inline styles and explicit class overrides so the builder feels like a standalone design tool -- clean, readable, and professional.

## Changes (single file: `src/components/settings/WidgetSettings.tsx`)

### 1. Outer Container
- Remove the `border border-border/50` (the white outline)
- Add a light background (`bg-white`), subtle shadow, and soft rounded corners
- Apply `text-gray-900` as the base text color for the entire builder

### 2. Left Panel (Controls Sidebar)
- Background: `bg-gray-50/80` with a subtle right border in `border-gray-200`
- All labels and headings: dark grays (`text-gray-900`, `text-gray-600`, `text-gray-400`)
- Tab pills: light gray inactive (`bg-gray-100`), white active with shadow
- "Click to edit" banner: soft green tint on white instead of dark primary/5
- Quick Edit Zone list items: light hover states (`hover:bg-gray-100`)
- Toggle rows: `bg-gray-50` background
- Color swatch text inputs: light borders, dark text
- FieldInput component: light bottom borders (`border-gray-200`), dark text

### 3. Right Panel (Canvas)
- Background: very subtle warm gray (`bg-[#fafafa]`) with a lighter dot grid
- Canvas toolbar: white background with light bottom border
- Device toggle pills: `bg-gray-100` inactive, white active
- "Preview" label and editing badge: dark text on light backgrounds
- Device frame shadow: softer, lighter shadow suitable for light backgrounds

### 4. "Create Widget" Empty State
- Light background card instead of glass/dark
- Dark text for heading and description

### 5. FieldInput Helper Component
- Update default classes to use light-friendly colors

### 6. ColorSwatch Component
- Hex text input: dark text, light border
- Preset color dots: light ring-offset color

## Technical Approach
- All changes are CSS class swaps within the component -- no new files, no theme system changes
- The rest of the app remains dark-themed; only the widget builder panel becomes light
- Uses explicit Tailwind color classes (e.g., `bg-white`, `text-gray-700`) rather than CSS variables so the light theme is self-contained

