

## Problem
The hero canvas blobs are barely moving because `t` increments at `0.012` per frame — nearly 5x slower than the stat cards which use `0.055`. The colors are also more muted.

## Solution
Match the hero canvas parameters to the stat cards:

### `src/components/landing/HeroSection.tsx`

1. **Speed up animation** — change `t += 0.012` to `t += 0.055` (line 35)
2. **Increase blob speeds** — bump each blob's `speed` from 0.3–0.4 range to 0.38–0.50 range (matching stat card values)
3. **Brighten colors** — shift to the stat cards' palette: `[52,215,123]`, `[0,194,224]`, `[80,200,180]`, etc.
4. **Increase opacity** — change the center gradient stop from `0.9` to `1.0` (line 48)

These four changes will make the hero gradient move and look identical to the stat cards.

