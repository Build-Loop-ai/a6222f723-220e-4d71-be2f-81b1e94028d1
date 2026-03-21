
Goal: make the Step 01/02/03 cards in `HowItWorks` actually stack on scroll exactly like the reference `ProcessSection`, instead of appearing static with dead space.

What I found
- Your `src/components/landing/HowItWorks.tsx` is already very close to the reference component. The sticky logic, incremental `top`, `zIndex`, and entrance animation all match the source project.
- The main structural difference is the page wrapper: your landing page uses `className="min-h-screen overflow-x-hidden"` in `src/pages/Index.tsx`, while the reference page uses `style={{ overflowX: "clip" }}`.
- `position: sticky` is often broken or made unreliable by ancestor overflow clipping/scroll contexts. Even if it is only horizontal overflow, browsers can still treat it differently than `clip`, especially in complex animated layouts.
- The section itself also uses a `fixed` background layer and `clipPath`, which increases the chance of sticky behavior being affected by the section’s containing/painting context.
- The screenshot and replay strongly suggest the marquee/background animation is running, but the cards are not entering a real sticky stacking phase.

Implementation plan
1. Fix the page-level scroll container
- Update `src/pages/Index.tsx` to match the reference wrapper behavior:
  - replace `overflow-x-hidden` with inline `overflowX: "clip"`
  - keep the rest of the page structure unchanged

2. Simplify the `HowItWorks` containing context
- In `src/components/landing/HowItWorks.tsx`, remove the `clipPath: "inset(0 0 0 0)"` from the section wrapper
- Keep the fixed dot-grid and gradient fades, but ensure the card container itself does not live inside any clipping context that can interfere with sticky

3. Make the stacking region match the reference more literally
- Keep the current sticky card formula:
  - `top: 110 + index * 28`
  - `zIndex: index + 1`
  - `paddingBottom: clamp(36px, 7vw, 80px)`
- Keep the same `motion.div` entrance animation and viewport settings
- Ensure the card list is rendered directly inside the container without extra wrappers that might create height or overflow issues

4. Add a small sticky-debug safeguard if needed
- If sticky is still inconsistent after the overflow fix, switch the section structure to the exact reference layout:
  - section
  - marquee
  - spacer
  - `container-large`
  - mapped sticky cards
- Avoid any extra transforms, clipping, or perspective styles on the section and its ancestors

5. Verify against the reference behavior
- Confirm that on desktop:
  - card 1 sticks first
  - card 2 scrolls over and locks 28px lower
  - card 3 does the same
  - cards overlap visually instead of sitting in separate blocks
- Confirm there is no large empty vertical gap between the cards
- Confirm the behavior still works at tablet/mobile widths where sticky can behave differently

Technical notes
- Root cause is likely not the card code itself, because your `HowItWorks.tsx` already matches the reference pattern almost line-for-line.
- The most likely culprit is the parent layout/overflow/clipping context preventing `position: sticky` from engaging correctly.
- The safest fix is to align both the page wrapper and the section wrapper with the reference project before touching the animation math.

Files to update
- `src/pages/Index.tsx`
- `src/components/landing/HowItWorks.tsx`

Expected result
- The step cards will visibly stack as you scroll, with each later card pinning slightly lower and above the previous one, matching the reference interaction.

<lov-actions>
<lov-suggestion message="Test the How It Works section end-to-end on desktop and mobile to make sure the cards actually stack while scrolling.">Verify that it works</lov-suggestion>
<lov-suggestion message="Implement the sticky-card fixes in HowItWorks and the landing page wrapper so the step cards stack exactly like the reference project.">Fix the stacking cards</lov-suggestion>
<lov-suggestion message="Add subtle scale and shadow emphasis to the topmost sticky card so the active step feels more alive during scroll.">Enhance active card depth</lov-suggestion>
</lov-actions>
