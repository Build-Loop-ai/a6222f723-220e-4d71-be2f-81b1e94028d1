

## Problem

The hero section's gradient orbs use **CSS `@keyframes`** which interpolate in straight lines between keyframe stops. No matter how many waypoints you add, CSS `transform: translate()` always moves in a straight line between each pair of stops. This is fundamentally different from the stat cards in the "What We Do" section, which use a **canvas with `Math.sin`/`Math.cos`** producing naturally curved, organic motion.

## Solution

Replace the 5 CSS-animated `<div>` orbs in the hero with a **single full-screen `<canvas>` element** that renders fluid blobs using sine/cosine math — the exact same technique used in the `StatCard` component's `IntroSection`.

### What changes

**`src/components/landing/HeroSection.tsx`**
- Remove the 5 `<div>` elements with `hero-orb-*` CSS animations (lines ~487–521)
- Add a single `<canvas>` element covering the hero background
- Add a `useEffect` that runs a `requestAnimationFrame` loop drawing 5 radial-gradient blobs, each drifting on sinusoidal paths with unique speeds, phases, and drift ranges
- Use the same darker teal/green palette already defined (`rgb(0,160,190)`, `rgb(30,180,100)`, `rgb(0,140,140)`, `rgb(20,150,90)`, `rgb(0,120,130)`)
- Keep the base gradient, vignette, and grain overlays unchanged

**`src/index.css`** (cleanup)
- Remove the now-unused `hero-orb-1`, `hero-orb-2`, `hero-orb-3` keyframe definitions (lines 677–700)

### Canvas blob config (matching stat cards pattern)
```text
5 blobs, each with:
  - cx/cy: normalized center position (0–1)
  - color: RGB tuple from existing palette
  - speed: 0.3–0.5 (animation rate)
  - phase: unique offset so they don't sync
  - drift: 0.2–0.4 (how far they wander)
  - radius: ~60–90% of canvas min dimension (large, soft)

Draw loop:
  cx_actual = cx + sin(t * speed + phase) * drift
  cy_actual = cy + cos(t * speed * 0.8 + phase) * drift
  → radialGradient from color at full opacity → transparent
  → fillRect to blend additively
```

This guarantees zero straight lines since sine/cosine produce continuous curves.

