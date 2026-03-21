

# Redesign Greet Landing Page Using Flomo Design Patterns

## What We're Doing
Replacing the current dark, aurora-heavy Greet landing page with the clean, structured design language from the Flomo Launchpad project — but keeping Greet's dark color scheme (green/cyan brand, #050506 background) and all Greet-specific content.

## Design Patterns to Adopt from Flomo

The Flomo project uses a fundamentally different design philosophy:
- **Fluid typography/spacing scale** via CSS custom properties (`--text-h1`, `--space-section-y`, etc.)
- **Container class** (`container-large` at 1400px) instead of fixed `max-w-[1140px]`
- **Section labels** with a colored dot + small text (e.g. `● How It Works`)
- **Scroll-driven word reveal** for intro text
- **Stat cards** with animated canvas blob backgrounds
- **Stacking cards** for process/steps (sticky cards that stack on scroll)
- **Scroll-driven marquees** instead of CSS-only marquees
- **Benefit cards** with hover lift + shadow, clean white card style
- **Two-column CTA** with dark card + form
- **Clean footer** with rounded top corners and link columns
- **No floating particles, no aurora blobs, no animated backgrounds**

## What Changes (mapped to Greet sections)

### 1. Global CSS (`src/index.css`)
Add Flomo's fluid typography and spacing scale as CSS custom properties, plus utility classes (`container-large`, `heading-1`, `heading-2`, `section-label`, `btn-primary`, `btn-secondary`). Keep all existing Greet color variables.

### 2. Hero Section (`HeroSection.tsx`)
Keep the existing interactive widget demo (it's unique to Greet). But adopt:
- Flomo's clean layout: left text + right widget, no aurora orbs
- Fluid type scale for headline
- Solid dark background instead of animated gradients
- Dot + label pattern for section tag

### 3. Social Proof / Logo Banner (`SocialProofBar.tsx`)
Replace with Flomo's `LogoBanner` pattern: simple horizontal marquee of text logos, muted color, minimal padding. No glass pills.

### 4. How It Works (`HowItWorks.tsx`)
Replace glass cards with Flomo's **stacking card** pattern:
- Sticky cards that overlap as you scroll
- Dark cards with progressively lighter backgrounds (using Greet's green hues)
- Scroll-driven marquee text above the cards
- Clean layout: left text, right visual

### 5. Features Section (`FeaturesSection.tsx`)
Replace aurora background with clean solid background. Adopt Flomo's `WhyFlomo` layout:
- Large headline with accent-colored word
- 3-column grid of clean cards with icon, title, description
- Cards with subtle shadow + hover lift (adapted to dark theme: dark card bg instead of white)

### 6. Demo Section (`DemoSection.tsx`)
Simplify: remove underwater particles, side accents, animated glows. Keep the browser mockup but on a clean dark background with minimal glow.

### 7. Pricing Section
Keep as-is (already distinct from Flomo's structure).

### 8. FAQ Section
Keep as-is.

### 9. CTA Section (`CTASection.tsx`)
Adopt Flomo's two-column CTA: left dark card with headline + contact info + button, right card with a contact form or "Get Started" flow. Adapt to Greet's green gradient buttons.

### 10. Footer (`Footer.tsx`)
Adopt Flomo's footer layout: rounded top corners, CTA band at top, link columns below, dark background (`#050506`).

### 11. Navbar (`Navbar.tsx`)
Adopt Flomo's frosted glass navbar with rounded bottom corners. Keep Greet links and branding.

## Color Mapping (Flomo → Greet)
| Flomo | Greet equivalent |
|---|---|
| `#020F26` (navy) | `#050506` / `#0D0D0F` (dark bg) |
| `#FF4900` (accent orange) | `hsl(148 68% 52%)` (green) / `hsl(190 100% 44%)` (cyan) |
| `#F8F6F0` (off-white) | `hsl(240 5% 96%)` (foreground) |
| White cards | Dark glass cards (`rgba(255,255,255,0.03)`) |
| `hsl(var(--accent))` dots | Green `hsl(148 68% 52%)` dots |

## Files to Create/Modify
1. **`src/index.css`** — Add fluid scale variables and utility classes
2. **`src/components/landing/Navbar.tsx`** — Rounded bottom corners, frosted style
3. **`src/components/landing/HeroSection.tsx`** — Clean layout, remove auroras
4. **`src/components/landing/SocialProofBar.tsx`** — Simple marquee
5. **`src/components/landing/HowItWorks.tsx`** — Stacking cards + scroll marquee
6. **`src/components/landing/FeaturesSection.tsx`** — Clean grid, no aurora
7. **`src/components/landing/DemoSection.tsx`** — Simplify background
8. **`src/components/landing/CTASection.tsx`** — Two-column CTA layout
9. **`src/components/landing/Footer.tsx`** — Rounded top, CTA band, columns
10. **`src/pages/Index.tsx`** — Potentially reorder/add sections

## What We Keep Unchanged
- All Greet content/copy
- Interactive hero chat widget
- Pricing section structure
- FAQ section
- All dashboard/app pages
- Color palette (green/cyan on dark)

