# The Pile — notes

A stack of blocks: the Rift's ruined arcology in place of the Arccube (owner, 2026-10-27). "The Pile" is a working
name. The brief, the form, the neck, the cut and the population are in `plan/BLUEPRINT.md`; in short:

- **99 blocks** (28 m deep, 10 storeys) in **10 tiers** crosswise on each other, 940 m square at the ground narrowing
  upward, a quarter of each tier block and the rest courts and gardens; on top **the capstone**, a terraced ziggurat
  (owner, 2026-10-27: five terraces of glass under sloping fascias, the decks planted, a summit pavilion), 435 m up,
  with four atria cut down through it over the gaps below, a quarter of its footprint. 85 ha of roof gardens.
- **About 153 700 people** at its height (low case: 65% dwellings, 45 m2 a person; every storey lit from two sides).
- **The crown** (tiers 7-10 and the capstone, 21.4% of the floor, 32 900 people, 19 ha of roof fields) reaches the
  ground only by four great cores and two grand stairs. Cut those six and it is an island; its fields feed about
  2 000-4 000.
- **The ruin** (decay 1; owner, 2026-10-27): the six links cut and a third of the base cores broken; **one corner wholly
  down** (the south-east, x + z > 275 m: 15 blocks fallen into a debris slope, 23 torn off at the line, the capstone
  clear of it), the other three quarters standing; **two crash-throughs** (a block hinged on one end, dropped a tier
  through the block under it); **the crown farmed** (832 plots: ridged crops, orchards, polytunnels, paddies, sheds,
  tanks, people working) and joined by **six rope bridges**. The base's roofs and the bare surfaces are left as ground
  for the Rift's flora, which the settlement placement grows over them: `AP_SITE[1].roofs` lists every standing roof
  with `overgrow` (the base) or `farmed` (the crown).

## Files

| File | What |
|---|---|
| `8at0-arcpile-plan.js` | the plan, [G data]: blocks, cores, stairs, the circulation graph, the stats, the ruin's deltas, the gardens' records. KRAND only, ids stable |
| `8at1-arcpile-draw.js` | the drawing: core/tags first (KTAGS.arcpile), then blocks on the dwelling map, roofs on the Wheel's grass, cores, stairs, gardens, the ruin's pieces |
| `test-arcpile.js` | `node kits/ancients/targets/arcpile/test-arcpile.js`: determinism, ~150 000, a fifth cut off by exactly the six links, the ruin an island |
| `89z-rows.js`, `91z-views.js` | the two sites (intact west, ruin east) and 14 views |
| `plan/` | the rough floor plan (sheets, AREAS.md) |

Build: `python3 build.py --target arcpile` (it takes core/rand and core/tags: `TAGS_TARGETS`). Seed 9690.

## Weaknesses

- The weave is orthogonal and every block is the same depth and height; the references' rotations and stepped
  heights are not in it.
- The capstone's first terrace overhangs the gaps between the tenth tier's blocks: it is carried by them and by the
  great cores, and its soffit shows from below.
- Cores are placed from the blocks (each stands on the ground or in a block, ends at a block roof, joins two or more:
  the owner's 2026-10-27 note); they are plain cylinders, with no lobbies or bridges where they meet a block.
- The shaft tops z-fought the roofs and decks they ended in (owner, 2026-10-27): a shaft now stops 0.2 m over a roof
  under its cap, or 0.4 m under the capstone's deck.
- The corner's debris is torn slabs on the plain and rubble, not a heap that climbs the standing pile.
- The roofs are the Wheel's procedural grass; the crop beds are coloured boxes (a terraced-field set is owed,
  `core/materials/PROMPTS-NEEDED.md` section 35).
- The Rift's station 4 bakes the Arccube (`biomes/rift/stations/bake_cube.py`); pointing it at this page is the Rift
  session's change.
