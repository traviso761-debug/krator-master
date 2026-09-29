# Round 2: POOR QUARTERS   (agent "poor")
Read `briefs2/_common2.md` first. You own `src/57-poor.js`.

The user's verdict: "Buildings look great but needs a quality pass. keep lanterns and windows at current counts."
The budget is relaxed — this round is about the things that are visibly wrong or thin, not about saving triangles.

## 1. Your own "not happy with" list — work it top to bottom
- **Musgum ribs are too coarse.** You were holding back for the budget; you no longer need to. The reference
  (`refimg/06-musgum-shell-dome.webp`) is a dense pattern of raised vertical finger-ridges running the full height of
  the shell, close together, with horizontal courses between them — it is the whole character of the building. Go
  denser (12–16 ribs round the shell, in 5–6 courses) and thinner, and let them follow the shell's curve.
- **The animal pen's "thorn" reads as brush heaps.** `THORNC` now exists (dry thorn / brush). Build the fence as a low
  ring of crossed sticks and cut thorn branches (thin `F.beam`s at mixed angles) on a mud kerb, rather than a ring of
  leafy blobs — it will also cost far less than the 800 triangles it does now.
- **Shack B's thatch roof is too flat and neat** for the poorest building in the city — sag it, make it ragged, let the
  edge overhang unevenly.
- **The cone-cluster footing is a circle**, so the footprint corners are empty. `rfn`'s angle now arrives in the asset's
  own frame, so an oval or a lobed rock platform will rotate correctly with the building.
- **The egg hut porch reads like a doghouse from the side** — make it a proper mud hood that grows out of the shell.
- **`F.door` on a leaning `fr8` wall protrudes at the top.** Place it at the face's own height (see `zf(y)` in
  `55-mid-example.js`, which the planner just fixed).

## 2. New helpers
`F.window(..., {noReveal:true})`, `F.disc`, `F.roundWindow`, `F.door(..., ly)`, `F.tree(lx,lz,kind,h)` (F's own stream),
and the colours `THORNC`, `GILDC`, `BLUEGREYC`, `STONEC`.

## 3. Then shoot what you never looked at
Your own list: wide Musgum (C) after the rib tweak; thatch-hood egg hut (A) after the door plug; flat-roofed house B and
C after the dark foot and the whitewashed door surround; compound B after its rooms changed; the shade shelter after the
dark-foot fix; the animal pen after the recolour; painted gabled egg hut (C), which was never re-shot at all.
