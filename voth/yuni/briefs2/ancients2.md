# Round 2: THE ANCIENTS   (agent "ancients")
Read `briefs2/_common2.md` first. You own `src/61-ancients.js` (generated) + `tools/`.

The user's verdict on your port, verbatim where it matters:

> "Terraced ancient house lacks full roofs. Can you make a version of the ancient imports that dials back the ruin a
> little bit? Like more worn than ruined... where pieces haven't actually fallen off and the original white sheen is
> still visible, if a bit tarnished." … "make an academic quadrangle in the ancient style with full variants. make a
> thicker, shorter version of the honeycomb wall apartments with full variations."

## 1. A third variant: WORN (the new variant 0, before "patched" and "ruin")
This is the headline item. "Worn, not ruined": the structure is **whole** — nothing has fallen off, no decay holes, no
toppled fragments, no rubble rings, windows and glass still in place — but a thousand years of weather have gone over
it. Build it from the kit's INTACT path (builder decay 0, `HOLES = 0`), then age it:
- keep `MAT.white` (the panel texture) as the skin, tinted down to a soft tarnished ivory-grey — the original sheen
  must still read, so tint something like [0.86, 0.85, 0.80], not toward rust. The point of this variant is that Yuni's
  Ancient quarter still gleams a little.
- add the kit's own water-staining (`stainsFromLedge`) generously, a light `mossOnSurface` on flat tops and a few
  `vinesFromLedge` at the parapets — weathering, not invasion. No `rubbleRing`.
- the kit's light strips and dots stay DEAD (only the Grand Vault has working power in Yuni).
- the blue glass survives here: where the intact path draws `MAT.glass`, keep it.
- inhabitation: lighter than the patched variant — a handful of lean-tos, awnings and lit windows at ground level only,
  since these are the buildings the Order and the prominent families actually keep up.
So every ancient asset becomes 3 variants: **worn · patched & inhabited · ruin** (the two that are ruin-only stay as
they are). Name them with the same `variantNames` mechanism you already use.

## 2. Terrace-stack apartments need roofs
`ancient_apartments_terrace` reads as open floor plates. Every terrace level wants a real roof/parapet: a slab with a
lip over each setback, the top stage capped, and the recessed face behind each terrace closed so you cannot see through
the building. Check it from a low front camera AND from above.

## 3. Academic quadrangle, ancient style, full variants  (`ancient_quad`)
The user's canon for an Ancient campus: "follow UFM (Guatemala City) philosophy: multi-atria, terraces, multilevel,
exposed brick/concrete, integrated into a forested hillside" — and the house style is "Cyclopean, Modernist, Organic":
late Gaudí, Goldberg, Soleri. The kit has a `campus` builder already ported but not in `ANC_TABLE`; use it if it reads
as a quadrangle, otherwise compose one from kit parts. What it must have: a **closed court** (60–90 m across) ringed by
2–4-storey ranges; a deep arcaded or colonnaded cloister walk facing the court on all four sides; the ranges stepping
back in terraces on at least one side; one taller element (a lecture drum, a stair tower or a pair of them) breaking
the skyline; a monumental opening on the +z side into the court. Concrete and white metal, glass where it survives.
Footprint about 120 x 100 m. All three variants.

## 4. Thicker, shorter honeycomb apartments  (`ancient_apartments_comb_short`)
The existing `ancient_apartments_comb` is a thin 74 x 26 screen wall 36 m tall. The user wants a stubbier sibling:
roughly **twice as deep and about half as tall** — a thick perimeter block, not a screen. Roughly 60 x 50 x 18. Do it
whichever way is cleanest: a `maxY` cull added to `ANC_build`, a second pass of the same structure offset along its
depth, or a non-uniform depth scale. Whatever you pick, the honeycomb cell pattern must still read on the long faces and
the top must be a real roof, not a cut. All three variants.

## 5. Tower scale is now fixed
I dropped the four towers and the fallen one to scale 0.34–0.37 (100 x 100 m footprints, 86–126 m tall) so they fit
inside a 640 m walled city. Check they still look right at that size, and that the plinth dressing still lands.

## 6. From your own list
Rust banding on tall towers at distance; dressing missing entirely on the data vault, robotics works and corn-cob
cluster, and never checked on the hospital; the corn-cob close-up landed inside a neighbour. The banding is worth a
try: the kit's rust texture tiles at 5 m, so on a 100 m tower it repeats 20 times — vary the tint per storey band or
push the tile scale up for the tower types.
