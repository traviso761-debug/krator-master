# Report: the new flora (HANDOFF-FLORA.md)

**By:** Claude, for the owner, 2026-10-18 (Gemini ran out of usage; nothing of its was on any branch). Branch
`claude/nhighlands-flora` in `../krator-nhl-flora`, from `origin/main` e6e5ce6c. One commit (the plan's phases P0-P9
together; each was built and looked at on the way).

## 1. What is in

Everything in the handoff: six species (25-30), four habits (`shag`, `serpent`, `table`, `banyan`), `farShape`,
`NHL.buildNewFlora` (moss collars and staghorns, crown ferns, the fern sea, moss hummocks, sun-wheels, spore lamps),
four new items (`fan`, `staghorn`, `wheel`, `sporepin`) and one bucket (`nmoss`), the spore lamps in `NHL.setNight`,
eight preset views (one per tree, `Moss hummocks`, `Night: spore lamps`).

Final `verify.py --assert`: **OK**, every assert passes.

| | before | after | budget |
|---|---|---|---|
| scene triangles | 24.49 M | 30.07 M | 32 M |
| trees / floor | 16.42 M / 7.85 M | 18.07 M / 11.78 M | 22 M each |
| draw calls at the verify camera | 234 | 233 | 520 |
| instances | 2.03 M | 2.63 M | |
| build (`_phases`, SwiftShader) | trees 5.7 s, floor 2.7 s | trees 5.8 s, floor 1.9 s, newflora 1.0 s | |

**Every existing species' count is unchanged** (`every-species-placed` equals the before baseline key for key). New:
ghost alder 2533, shag maple 523, serpentwood 1076, fan-leaf 314, table cedar 73, veil banyan 14.

## 2. Where this departs from the handoff, and why

- **The new tree passes are gated.** `NHL.buildTrees(R,q,box,{flora:true})` runs them; `NHL.build` passes it
  (`{flora:false}` builds the old forest). Roketstad reads these fragments in place and calls `buildTrees` itself: the
  owner wants the new plants there only when Roketstad goes into the open world. Checked: Roketstad's rebuilt page has
  the same 7426 trees per species, 928,014 instances and triangle totals as before; only its inlined source differs.
- **The new textures draw from `KRAND.stream(500091)`,** not the kit's `rng`, for the same reason: nothing after them on
  Roketstad's page may move.
- **Budget cuts** (the plan as written held 42.1 M triangles): fern sea cell 5 m with a second fern in two cells of five
  (3 m held 9.8 M of fronds); ghost alder weight × .2 (12,766 trees); spore lamps on ~1 hummock in 7 with 8-22 pins (2.6 M);
  hummock weight × .6 and 1-3 mounds in the mid band; crown ferns 7-11 fronds.
- **Banyan weight × 1.29** (.45 for .35): two landed at .35; the plan aims for 4-12, the map now has 14.
- **Shag maple, after the owner's look** ("very stubby"): a taller trunk, limbs leaving at staggered heights, longer
  and forked twice, sleeves that thin out and stop short of the tips (no flat cut ends), twigs and leaf past them.
- **Limb collisions, after the owner's look:** `limbCut` samples every metre along a limb (eight points 4 m apart missed
  trunks) and a tree's limbs collide with its own earlier limbs (the banyan's crossed at the core). A blocked limb is
  cut short, not dropped.
- **Banyan prop roots** are bark tubes at the hero level (rods read as white poles), mossed and darker; the banyan's and
  the ghost alder's barks are darker than the plan's (both read as white).
- **Moss collars** hug the bole (×1.04-1.15, 1-3 rings, taller): at the plan's ×1.12-1.3 they read as floating plates.
- **The staghorn shield** is the `paddle` card as planned: a pointed leaf, not round. (2026-10-19: the owner's `card.staghorn` now dresses the antler fronds, on a plain strip, `G.antler`; the shield is still the paddle.)
- `60-…` and `70-…` are tagged `[draw]` / `[web]` in `PORT.md` now, not `[G data]`; the lint passes either way.
- `NHL.PLANTS` gains Staghorns, Sun-wheels, Spore lamps; not Fan-leaf leaves or Moss sleeves (the inspector names the
  tree for those, as it does for every other canopy card).

## 3. Open questions for the owner

1. The ghost alder at 2.5k trees: thick enough on the wet flats, or more (it costs about 0.2 M triangles per 1000)?
2. The hummocks are the 49-triangle cushion at up to 4 m: faceted close up. A smoother mound is a new item (draw calls).
3. Moss collars on fluted giants (cathedral cedar) can show gaps: drop them on that species?

## 4. Textures

Library cards that might fit (not wired; your call): `card.ginkgo` (fan-leaf), `card.moss.hanging`, `card.fern.green`,
`card.frond.fractal`, `card.clubmoss`, `bark.mossy` (serpentwood, shag maple), `ground.moss001`-`003` (sleeves),
`bark.smooth` (banyan). Wanted, with prompts in `core/materials/PROMPTS-NEEDED.md` (section 2, Northern Highlands):
`bark.alder.lichen` (`card.staghorn` and `card.sunwheel` were delivered and wired 2026-10-19).
