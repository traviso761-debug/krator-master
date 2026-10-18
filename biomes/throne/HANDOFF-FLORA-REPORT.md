# Report: the Throne's new flora (`HANDOFF-FLORA.md`)

Gemini set up the worktree (`gemini/throne-flora` from `origin/main` 827fae40) and did P0-P2, then ran out of credits
halfway through the pyre thistle. Claude finished it on 2026-10-18.

## The phases

| phase | what | who | done |
|---|---|---|---|
| P0 | the gating: the `riftlife` (station 1) and `ashlife` (ash desert) fields, the zones (`riftlife`, `ashlife`, `hill`, `yard`, `hollowRim`), `THRONE.PASSES_NEW`, `THRONE.buildNewFlora`, the `placed` filters, the "stays on its own page" check and its negatives | Gemini | yes |
| P1 | geode pods | Gemini | yes |
| P2 | ember burrs, red velvet, wire sporestalks, gold pins | Gemini | yes |
| P3 | the pyre thistle (26) | Gemini, finished by Claude | yes |
| P4-P7 | the chalice parasol (27), cage lantern (28), medusa cap (29), lace-fan tree (30), braid cap (31), coil horns (32) | Claude | yes |
| P6, P8 | blood chalices, moss domes, red coral-fern, snare rafts | Claude | yes |
| P9 | docs, this report, the texture prompts | Claude | yes |

## Checks (`biomes/geyser/verify.py <page> --assert`, the shared verify; the Throne has none of its own)

- **Station 1** (`dist/throne.html`): exit 0. Every invariant and host check passes, every negative fails as it must. 19
  species of the station placed (the scarcest 10). The turn holds: under the plume 100% native of 3606 trees; in clear
  air 6% of 2199 (4% before; the ceiling is 12%). 19,799,173 scene triangles of 20,000,000. Draw calls at the default
  camera 202 of 140, flagged as a budget, not a failure; before any of this work they were 186.
- **The ash desert** (`dist/throne-ash.html`): exit 0, every check passes (8 species of the desert placed, the scarcest 27;
  the CO2 hollow dead; Krator's own life holds the ground). 17,596,806 scene triangles of 24M, 142 draw calls of 260. The
  first run failed `registered-volumes-non-empty` on 27 coil-horn clusters (fixed: see below).

## Nothing moved elsewhere (placement fingerprints)

A hash of every tree's species and position, with the instance count, draw calls and triangles, read from each page
after its build (`fp.py` on the shared harness), on the pages built from 827fae40 (before) and from this branch (after):

| page | trees | hash | instances | calls | triangles | same |
|---|---|---|---|---|---|---|
| kipuka | 10219 | -308693824 | 724749 | 101 | 9166758 | yes |
| frontier | 5195 | 1742286855 | 442596 | 92 | 7673202 | yes |
| isle | 63775 | -944238432 | 1226672 | 121 | 16939001 | yes |
| cloud | 31860 | 786319961 | 1713138 | 75 | 22533367 | yes |
| savanna | 14556 | -279457521 | 786294 | 73 | 17973396 | yes |
| vents | 9041 | 319520200 | 288087 | 185 | 19150868 | yes |
| glacier | 5761 | -1840392894 | 151279 | 42 | 6311924 | yes |
| caldera | 0 | 0 | 48997 | 5 | 3960 | yes |
| tube | 12 | -366975359 | 12339 | 92 | 908804 | yes |

All nine identical. On stations 1 and 7 the old species keep their positions: the hash over species 0-25 is the same
before and after (station 1: 11893 trees, 1096039729; the ash desert: 12770 trees, 1603403329). Their shapes may differ,
since the builders run after every pass and share the generator.

**After merging `origin/main`** (51bc399e, which changed the biome core and rebuilt the Throne), the same comparison
against main's pages built from main's sources: all nine identical, and stations 1 and 7 keep every old tree's position.
Main's committed `throne-kipuka.html` and `throne-frontier.html` were not what its sources build (stale pages on main);
rebuilt from main's sources they match this branch exactly. Both verifies pass again on the merge, with the same
numbers. `tools/test_all.py --no-build`: 36 steps, 0 failed. `PORT-BASELINE.json` rewritten for the eleven Throne pages
only (Pylon, Talia and Hook already differ on main).

## Where this departs from the handoff

- **Station 1's gullies lie on the clear shoulder** and its skylights barely reach the plume (gully x alien is 0 over the
  map, skylight x alien 0.00003). The handoff put the chalice parasol, medusa cap and braid cap in the gullies under the
  plume, so at first they barely placed (one chalice, one braid cap). They stand instead on the plume's old ground
  (`woods x alien`) and the acid shores, a few in the gullies. Gemini's gold pins in the gullies had the same problem.
- **Fewer new item kinds than the handoff listed**, for the draw calls: the medusa and braid caps take the parasol cap
  and gills, the lace fans' cups the trumpet funnel, the cage lantern's core the geode core, the blood chalices the
  trumpet funnel, the moss domes the brain cap, the snare rafts the acid pad. New items: `chalskirt`, `glowgill`,
  `cagebulb`, `lacefan` (and Gemini's geode, burr, velvet, sporeball, pin and pyre items).
- **The braid caps' purple** is put directly on the cap (the kit's `cap()` lets the library's skin wash it to orange).
- **The canvas cut-outs** (lattice, lace) are painted with `h3`, a hash of the position, not the kit's generator, so
  painting them moves nothing that draws after them.
- **Densities.** The cage lanterns, lace fans and coil horns were thinned and the pyre thistle cut to a third on the ash
  desert (3334 to 1174: it had become the desert's commonest tree). Station 1's moss domes are few (~800): the brain cap
  is ~480 triangles, and 3500 of them put the page at 21.7M.
- **The coil horns carry a mould crust** (the `lichen` item at their foot): a cluster of tubes alone is merged bark,
  which the registered-volume check cannot see.
- **The pyre thistle's blades**: Gemini's black was linear .1, which renders mid-grey; it is .018 now.

## Counts

Station 1: pyre 10, chalice 50, cage lantern 68, medusa 83, lace fan 42, braid cap 70, coil horns 35 (clusters);
floor: geode pods 854, ember burrs 694, velvet 128, wire stalks 193, gold pins 202, blood chalices 128, moss domes ~800,
red coral 356, snare rafts 147. Ash desert: pyre 1174, chalice 159, cage lantern 331, coil horns 27; geode pods 472, ember
burrs 735.

## Textures wanted

`core/materials/PROMPTS-NEEDED.md`, section "The Throne's new flora", holds the paste-ready prompts. Reuse first:
the chalice stalk could take `bark.ghostwood` or `bark.smooth`, the moss domes `ground.moss001`, the geode shells any of
the library's grey rocks.

## Open questions for the owner

- Station 1's draw calls were over its 140 ceiling before this work (186) and are 202 now. Raise the ceiling, or merge
  items?
- Should the gullies' plants (medusa, braid cap) stay mostly on the plume's old ground, or should the plume reach a
  gully on this station?

## Vent country takes the rift's flora (2026-10-18, the owner)

`stations/vents/47-host-land.js` hands in `riftlife` (1 everywhere), so vent country plants the rift's six trees and its
floor exactly as station 1 does (the pyre thistle needs cinder cones, which vent country has none of). Its `placed`
check requires the six; two preset views added. Counts: chalice 39, cage lantern 92, medusa 71, lace fan 49, braid cap
40, coil horns 68; floor: velvet 1601, wire stalks 2385, gold pins 1344, blood chalices 322, moss domes 552, red coral
261, snare rafts 256 (on the sulphur marsh and the hot pools), geode pods 91, ember burrs 476. 20.02M scene triangles of
its 24M; every host check passes, the CO2 hollows and the fissure stay bare. No other page changes (only vent country's
own station files were edited).

## The owner's textures (2026-10-18)

Six sets, processed into the library and wired (`materials.json`, re-packed): `ground.moss.crimson` (the red velvet, with a
ragged alpha outline so a patch is no octagon), `organic.cap.medusa` (the medusa cap's own dome item), `organic.coil.ribbed`
(the coil horns' own bark bucket, tiled 3.5 m along the tube), `card.blade.pyre` and `card.fan.lace` (3 x 3 sheets; four
of each nine cut into cards on the leaf quad, since every card is a draw call of its own; their bright veins glow at night) and `organic.lattice.cage` (the cage lantern's alpha, tiled
three times round the bulb). Without the pack (`?mat=proc`, an open world) every one falls back to its procedural form.
`tools/textures/cards.py` gained anchor `none` (no crop), so a sheet's cells stay equal thirds and a keyed surface still tiles.

