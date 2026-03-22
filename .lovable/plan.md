

# Walkthrough Page

A new `/walkthrough` page styled identically to the landing page (dark #050506 background, Syne headings, fluid typography, framer-motion animations) that serves as a presentation-style screen-share walkthrough of the entire Greet platform.

## Structure

The page will be a vertical scroll-through presentation with distinct "slides" (full or near-full viewport sections), each covering a key aspect of the app. The Navbar will be included for navigation back to home.

### Slide Sequence

1. **Title Slide** — "What We're Building" with the Greet logo, a one-line tagline ("An AI receptionist that answers calls, chats with visitors, and books appointments — 24/7"), and a subtle animated gradient background (reusing the blob canvas pattern).

2. **The Problem** — Split layout. Left: bold heading "Every missed call is a missed customer." Right: 3 pain-point cards with icons (missed calls after hours, slow response times, expensive receptionists). Staggered fade-in animations.

3. **The Solution** — "Meet Greet" with a high-level architecture visual: a simple animated diagram showing Website → Greet AI → Chat + Voice + Bookings. Uses the green/cyan gradient lines connecting nodes.

4. **How It Works (Setup)** — 3 numbered steps with motion reveals: (1) Connect your website — Greet crawls and learns, (2) Customize your widget — colors, voice, personality, (3) Go live — embed one script tag. Each step has a descriptive card.

5. **Core Feature: Chat Widget** — Full-width showcase. Left: description of RAG-powered chat, streaming responses, knowledge base. Right: a static mockup of the chat panel (reusing the visual language from the widget builder).

6. **Core Feature: Voice Agent** — Similar split layout. Describes Vapi integration, 22+ languages, call transcripts, smart routing. Right side shows a stylized call overlay mockup with pulsing rings.

7. **Core Feature: Dashboard** — Describes the analytics dashboard, conversation management, call logs, knowledge base management. Shows a stylized card grid representing metrics.

8. **The Business Model** — Shows the 3 pricing tiers in a simplified visual (Starter / Pro / Business) with key differentiators. Mentions the SaaS subscription model.

9. **Tech Stack** — Clean grid of tech badges: React, Vite, Tailwind, Supabase, Vapi.ai, OpenAI, Stripe, Firecrawl. Each in a glass-card with icon/logo text.

10. **What's Next / CTA** — Closing slide with gradient text "Let's Build This" and a link back to the app or signup.

## Technical Details

- **New file**: `src/pages/Walkthrough.tsx` — single-file page component
- **New route** in `App.tsx`: `<Route path="/walkthrough" element={<Walkthrough />} />`
- **Styling**: Reuses existing CSS classes (`container-large`, `heading-1`, `heading-2`, `body-text`, fluid spacing vars) and the #050506 dark background
- **Animations**: `framer-motion` `whileInView` for scroll-triggered reveals, staggered children
- **No database or backend changes needed**
- Each "slide" is a `<section>` with `min-height: 100vh` (or `80vh` for shorter ones) and centered content
- Responsive — stacks to single column on mobile
- Includes the landing page Navbar at top for consistency

