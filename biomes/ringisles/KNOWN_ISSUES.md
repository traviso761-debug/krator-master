# biomes/ringisles: known issues

Open items are `- [ ]`; `build.py` counts them.

## Shared files this kit wants changed (not changed here: they belong to other kits)

- [ ] **rift and nwlowlands have no `make`/`grow`.** The plan (settlements/isle-demo/PLAN.md, section 2) names the Rift's
  acacia and termite spires and nwlowlands' she-oak (the strand casuarina) as reusable in place; their builders are bound
  in their kits' closures (`B[]` in `55-biome-rift-trees.js`, `55-biome-nwlowlands-trees.js`) with no export, so this kit
  does without them (swbay's umbrella thorn stands for the acacia; this kit's own termite mounds; no she-oak). The fix
  upstream is the Throne's eleven lines: `RIFT.make/grow`, `NWLOW.make/grow` (biomes/WORLD.md, "trees as variants").
- [ ] **The hyperjungle's understorey palm and screwpine** live inside its floor's closure (`60-biome-hyperjungle-floor.js`)
  with no export; the plan names them for the island rainforest. The Throne's arch palm and tree fern and this kit's own
  strand pandanus stand in. An export like `THRONE.small` (`HYPERJUNGLE.small = {palm, screwpine, ...}`) would let any kit
  plant them.
- [ ] **`GEYSER.build` has no centre.** Its passes grid round the core's centre (`BIO.center()`); a world with a vent off
  its centre must move the host's centre while it builds (`src/88-host-build.js` does). A `center` option on
  `GEYSER.build` would do it cleanly.
- [ ] **The Throne's `THRONE.small` functions are not wrapped** to the Throne's registry (BIO.kitWrap wraps only the
  export's own functions). This kit does not call them, but a kit that does must switch to the Throne's registry itself.

## Water (core/water)

- [x] **No shore grid; flat tide and brine pools (done 2026-10-20, migration phase 3).** `src/89w-host-sea.js`: the sea's bed (`SEA_BED`, the lagoon floored at 1.6 m) is now a core/water
  SHORE GRID (`shore:{cell:6, band:100, seeds}` over the terrain box, flooded from the box's deep corners; no `maskLand`, the beaches and the reef are `terrainH`'s own heights): the swell
  shoals toward the beaches and the reef, a breaker train runs in along the coast, and the ground takes `WATER.wetGround` (wet sand where the swash reaches). The 18 tide pools and 4 brine
  pools (24-segment `MeshLambertMaterial` discs) are `WATER.still` polygons (`POOL_STILLS`, 84) drawn by `drawStill` with their old colours and opacities (.55 teal, .7 pink), the sky in them,
  night darker, an invisible disc each for the inspector's click. `build.py` takes core/water 21, 22 and 51 as well. The shore grid and the draw take about 1 s on a real GPU machine
  (`_t.sea0` to `_t.sea`). `verify.py dist/ringisles.html --assert` passes (default camera 764 calls, 23.85 M triangles, 21.85 M scene of 30 M; the pools are 22 meshes
  as before, so the calls and triangles do not move). Gaps: `core/water/README.md`, "Open gaps (phase 3, Throne frontier/ringisles)".

## Stand-ins (procedural or a near library set until the owner's texture comes; prompts below)

- [x] Wired 2026-10-18 from the owner's tex2 delivery (materials.json): the lagoon floor (`ground.wetsand` -> `ground.lagoon.seagrass`; the
  ground shader still paints its own dark seagrass meadows over it, a second layer that could now be thinned), the reef flat and
  bench (`ground.reef` -> `ground.reef.flat`), the coral heads (`coral` -> `organic.coral.brain`, grey, tinted by the head's colour),
  seagrass (middle cell of `card.seagrass`), the beach creeper (a cell of `card.creeper.beach`), naupaka (`card.naupaka`), the sea grape
  (`card.seagrape`), the breadfruit (`card.breadfruit`), the salt cedar (`card.tamarisk`, whole sheet, replaces `card.heath`) and the
  mango, coffee and clove (`card.croptree.glossy`). The sea grape, breadfruit and naupaka cards are full colour (`keep` 1, so the red leaves, the fruit and the white flowers show; `RINGISLES.libCol` keeps a sixth of the species colour); the rest are grey detail maps tinted by the instance colour. One cell fills a clump quad (a clump quad draws v up, so these cells are listed bottom-first to stand upright).
- [ ] The banana's leaves: procedural. `card.paddle` has banana leaves but they lie diagonally in their cells, and BIO.libSwap
  cuts a cell without turning it; the crater drylands' `libCell(..., rot)` would turn one upright (code, no new texture).
- [x] The mango's, coffee's and clove's leaves: one procedural glossy-lance card (`glossy`). Wants `card.croptree.glossy`. - 2026-10-20: wired 2026-10-18 (see the tex2 entry above), nothing open.
- [ ] Greens and sweet potato reuse the elephant-ear cell of `card.paddle` (`heart`) and the creeper's mat: near enough at
  a field's distance, wrong up close (no prompt yet: the owner's call whether the crops want their own sheet).
- [ ] Rice and cane blades: procedural (`card.crop`'s leaves arch sideways, not as a standing clump).

## The page

- [ ] **Five other kits ride on the page** (their species, trees, floor, build and fauna fragments): about 1.4 MB of code
  and their procedural textures built at load, for the fourteen species borrowed. A world that already carries those kits
  pays nothing more. The sidecar packs are trimmed to what is drawn (build.py `EXCL`), about 22 MB in all (eastabyss's
  is the biggest: its families are not yet trimmed per species).
- [ ] **The far trees of the borrowed kits** are their own kits' impostors; swbay's are its runtime-LOD lite stand-ins
  (`BIO.lodTick` runs in `99-host-take.js`).
- [ ] The showcase's climate is synthetic (a dryness from the wind and the mountain): the open world binds the scale
  model's raster instead (`openworld/isle-demo`, the plan's section 2, "Into the world").
- [ ] The sky is the geyser kit's (the Throne to the south-south-west over the sea, the jungle line to the north): close
  enough for an island of the isle demo, which lies on the Ring Sea's west ring; not re-baked for it.

## Texture prompts

The prompts for the stand-ins above are in `core/materials/PROMPTS-NEEDED.md` (section 1, "The Ring Sea isles biome", moved there 2026-10-15): `ground.lagoon.seagrass`, `ground.reef.flat`, `organic.coral.brain`, `card.seagrass`, `card.creeper.beach`, `card.naupaka`, `card.seagrape`, `card.breadfruit`, `card.tamarisk`, `card.croptree.glossy`.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js). Add each back when the kit fills it.

2026-10-20: `atmos` is back in the profile: the build lists `89-atmos-8-export.js` (the one shared fragment sedesert took), so the section fills (clock, wind, presets, skylight).
