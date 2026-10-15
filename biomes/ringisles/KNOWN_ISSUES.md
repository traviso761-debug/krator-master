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

## Stand-ins (procedural or a near library set until the owner's texture comes; prompts below)

- [ ] The lagoon's floor: the library's wet beach sand (`ground.damp_beach_sand`) with seagrass meadows painted in the
  ground's shader from the kit's meadow noise. Wants `ground.lagoon.seagrass`.
- [ ] The reef flat and the bench: `rock.limestone.karst`. Wants `ground.reef.flat`.
- [ ] The coral heads' surface: `stone.coral` (a building block of coral limestone) on the brain and table corals; the
  procedural meanders without the pack. Wants `organic.coral.brain`.
- [ ] Seagrass blades, the beach creeper's leaves, naupaka, the sea grape's and the breadfruit's leaves: procedural
  (52-biome-ringisles-look.js). Want `card.seagrass`, `card.creeper.beach`, `card.naupaka`, `card.seagrape`, `card.breadfruit`.
- [ ] The salt cedar's foliage: `card.heath` (a fine-leaved shrub, near enough); wants `card.tamarisk`.
- [ ] The banana's leaves: procedural. `card.paddle` has banana leaves but they lie diagonally in their cells, and BIO.libSwap
  cuts a cell without turning it; the crater drylands' `libCell(..., rot)` would turn one upright (code, no new texture).
- [ ] The mango's, coffee's and clove's leaves: one procedural glossy-lance card (`glossy`). Wants `card.croptree.glossy`.
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
