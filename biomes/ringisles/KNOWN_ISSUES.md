# biomes/ringisles: known issues

Open items are `- [ ]`; `build.py` counts them.

## Shared files this kit wants changed (not changed here: they belong to other kits)

2026-10-26: the four were made upstream, additively (the owner asked for them at the start of the biome rebuild). Each kit's own
page was built with and without the change from the same tree and compared: the pages differ only by the added lines, and on
the GPU the default camera's draw calls and triangles and every mesh's instance count and matrices are identical (the one mesh
that differs, the hyperjungle's and the geyser's walking strider, moves between the two runs).

- [x] **rift and nwlowlands have no `make`/`grow`.** The plan (settlements/isle-demo/PLAN.md, section 2) names the Rift's
  acacia and termite spires and nwlowlands' she-oak (the strand casuarina) as reusable in place; their builders are bound
  in their kits' closures (`B[]` in `55-biome-rift-trees.js`, `55-biome-nwlowlands-trees.js`) with no export, so this kit
  does without them (swbay's umbrella thorn stands for the acacia; this kit's own termite mounds; no she-oak). The fix
  upstream is the Throne's eleven lines: `RIFT.make/grow`, `NWLOW.make/grow` (biomes/WORLD.md, "trees as variants").
  Done 2026-10-26: `RIFT.make/grow` and `RIFT.small.termite` (rift 55 and 60), `NWLOW.make/grow` (nwlowlands 55). build.py reads
  the two kits' species, trees (and the Rift's floor) and build; this kit plants the Rift's acacia among the umbrella thorns
  (BORROW `acacia`, scale .8), the drape she-oak behind the beach (`sheoak`, scale .55: 13-19 m), and the Rift's termite
  spires in place of its own mounds (60's `spire`; the own mound stays as the fallback for a world without the Rift).
- [x] **The hyperjungle's understorey palm and screwpine** live inside its floor's closure (`60-biome-hyperjungle-floor.js`)
  with no export; the plan names them for the island rainforest. The Throne's arch palm and tree fern and this kit's own
  strand pandanus stand in. An export like `THRONE.small` (`HYPERJUNGLE.small = {palm, screwpine, ...}`) would let any kit
  plant them. Done 2026-10-26: `HYPERJUNGLE.small = {palm, screwpine, treeFern, ginger, aroid, fern, shrub}` (hyperjungle 60,
  wrapped to its registry); build.py reads its species, floor and build; BORROW `junglepalm` and `screwpine` (a `small` entry:
  the kit's plant at (x, y, z, lv), a keep-clear record of its own, none past the mid radius) plant them after every older pass
  in the Af, Am and XA forest.
- [x] **`GEYSER.build` has no centre.** Its passes grid round the core's centre (`BIO.center()`); a world with a vent off
  its centre must move the host's centre while it builds (`src/88-host-build.js` does). A `center` option on
  `GEYSER.build` would do it cleanly. Done 2026-10-26: `GEYSER.build({center:[x,z]})` (geyser 70) moves the host's centre for its
  passes and puts it back; `src/88-host-build.js` passes the vent's and no longer moves it itself.
- [x] **The Throne's `THRONE.small` functions are not wrapped** to the Throne's registry (BIO.kitWrap wraps only the
  export's own functions). This kit does not call them, but a kit that does must switch to the Throne's registry itself. Done 2026-10-26: throne 60 wraps them
  (`BIO.kitWrap('throne', THRONE.small)`).

## Water (core/water)

- [x] **No shore grid; flat tide and brine pools (done 2026-10-20, migration phase 3).** `src/89w-host-sea.js`: the sea's bed (`SEA_BED`, the lagoon floored at 1.6 m) is now a core/water
  SHORE GRID (`shore:{cell:6, band:100, seeds}` over the terrain box, flooded from the box's deep corners; no `maskLand`, the beaches and the reef are `terrainH`'s own heights): the swell
  shoals toward the beaches and the reef, a breaker train runs in along the coast, and the ground takes `WATER.wetGround` (wet sand where the swash reaches). The 18 tide pools and 4 brine
  pools (24-segment `MeshLambertMaterial` discs) are `WATER.still` polygons (`POOL_STILLS`, 84) drawn by `drawStill` with their old colours and opacities (.55 teal, .7 pink), the sky in them,
  night darker, `pick: true` for the inspector's click. `build.py` takes core/water 21, 22 and 51 as well. The shore grid and the draw take about 1 s on a real GPU machine
  (`_t.sea0` to `_t.sea`). `verify.py dist/ringisles.html --assert` passes (default camera 764 calls, 23.85 M triangles, 21.85 M scene of 30 M; the pools are 22 meshes
  as before, so the calls and triangles do not move). Gaps: `core/water/README.md`, "Open gaps (phase 3, Throne frontier/ringisles)".

- [x] **Core/water workarounds (2026-10-25).** The 22 invisible pick discs are `pick: true` on each pool's `drawStill`. Kept on purpose: the lagoon's 1.6 m bed floor and the hand seeds. With the true bed (and the lap off, or held to its last 0.6 m) the swell shoals over the real shallows and rises over the sand bars and the mangal's mud, covering them; `seeds:'edge'` gave the same. A per-surface shoaling limit (or a surf mask) in core/water would let the true bed in.

## Stand-ins (procedural or a near library set until the owner's texture comes; prompts below)

- [x] Wired 2026-10-18 from the owner's tex2 delivery (materials.json): the lagoon floor (`ground.wetsand` -> `ground.lagoon.seagrass`; the
  ground shader still paints its own dark seagrass meadows over it, a second layer that could now be thinned), the reef flat and
  bench (`ground.reef` -> `ground.reef.flat`), the coral heads (`coral` -> `organic.coral.brain`, grey, tinted by the head's colour),
  seagrass (middle cell of `card.seagrass`), the beach creeper (a cell of `card.creeper.beach`), naupaka (`card.naupaka`), the sea grape
  (`card.seagrape`), the breadfruit (`card.breadfruit`), the salt cedar (`card.tamarisk`, whole sheet, replaces `card.heath`) and the
  mango, coffee and clove (`card.croptree.glossy`). The sea grape, breadfruit and naupaka cards are full colour (`keep` 1, so the red leaves, the fruit and the white flowers show; `RINGISLES.libCol` keeps a sixth of the species colour); the rest are grey detail maps tinted by the instance colour. One cell fills a clump quad (a clump quad draws v up, so these cells are listed bottom-first to stand upright).
- [x] The banana's leaves: procedural. `card.paddle` has banana leaves but they lie diagonally in their cells, and BIO.libSwap
  cuts a cell without turning it; the crater drylands' `libCell(..., rot)` would turn one upright (code, no new texture). Done 2026-10-26: materials.json
  `bananaleaf` (card.paddle at 1024 px, keep 0; no material slot, so libSwap leaves it); 52 draws the middle cell's leaf turned
  upright (-45 degrees) into a 256 x 512 canvas onto the paddle material (the banana and the ginger leaves).
- [x] The mango's, coffee's and clove's leaves: one procedural glossy-lance card (`glossy`). Wants `card.croptree.glossy`. - 2026-10-20: wired 2026-10-18 (see the tex2 entry above), nothing open.
- [x] Greens and sweet potato reuse the elephant-ear cell of `card.paddle` (`heart`) and the creeper's mat: near enough at
  a field's distance, wrong up close (no prompt yet: the owner's call whether the crops want their own sheet). Done 2026-10-26 with `card.crop.greens`: `greens`
  (the bok choy cell) and `greensb` (the frilled lettuce) a row of each, one rosette tuft a plant (five heart leaves before);
  `sweetvine` (the bottom row's sweet potato vine), one tuft over each hill (the creeper mat and three heart leaves before).
- [x] Rice and cane blades: procedural (`card.crop`'s leaves arch sideways, not as a standing clump). Done 2026-10-26:
  `rice` and `riceripe` (card.crop.rice: the grown and the ripe row's middle cells; the ripe paddies take their own item),
  `cane` (card.crop.cane, the middle cell); full colour, keep 1, the instances near-white (`RINGISLES.libCol`).

## The page

- [ ] **Five other kits ride on the page** (their species, trees, floor, build and fauna fragments): about 1.4 MB of code
  and their procedural textures built at load, for the fourteen species borrowed. A world that already carries those kits
  pays nothing more. The sidecar packs are trimmed to what is drawn (build.py `EXCL`), about 22 MB in all (eastabyss's
  is the biggest: its families are not yet trimmed per species).
  Stays open (2026-10-26): now eight kits. The Rift's, nwlowlands' and the hyperjungle's species (and the Rift's floor) came
  for the acacia, the termite spires, the she-oak, the palm and the screwpine: the page 2262 -> 2591 KB, the sidecars 23.8 ->
  26.1 MB (their packs trimmed to the families those draw, build.py `EXCL`; the crop cards add 1.3 MB). Their species files
  still build every procedural texture of their kits at load; a kit export that builds only what a borrowed species draws
  (a per-species material list) would be the cure, in each kit.
- [ ] **The far trees of the borrowed kits** are their own kits' impostors; swbay's are its runtime-LOD lite stand-ins
  (`BIO.lodTick` runs in `99-host-take.js`).
  Stays open (2026-10-26): by design for now. Each kit's far form is its own (biomes/WORLD.md, "trees as variants": a far
  impostor is one more level of a species' record); one far scheme for every borrowed species (one bucket, one look) is the
  open world's and core/biome's to settle, not this kit's. The Rift's acacia and nwlowlands' she-oak add their kits' impostors.
- [ ] The showcase's climate is synthetic (a dryness from the wind and the mountain): the open world binds the scale
  model's raster instead (`openworld/isle-demo`, the plan's section 2, "Into the world").
  Stays open (2026-10-26): the open world's (it binds the raster); the showcase keeps its synthetic one.
- [ ] The sky is the geyser kit's (the Throne to the south-south-west over the sea, the jungle line to the north): close
  enough for an island of the isle demo, which lies on the Ring Sea's west ring; not re-baked for it.
  Stays open (2026-10-26): left to the shared sky rollout (core/atmos; the item below).
- [x] 2026-11-09: **station 2 (the high isle) failed its first GPU verify.** (1) The ground did not compile: "FRAGMENT shader texture image units
  count exceeds MAX_TEXTURE_IMAGE_UNITS(16)" (read with a linkProgram hook): ten library layers, uMacro, the strata's five (uKSCol, uKSBed, uKSAlt,
  uKSNz, uKSBt), the fog belt's atmFogBeltT and the shore's wtrBed made 18 live samplers. Fixed by `STATION.shareLayers` (84: a layer reads another's
  map, recoloured by luminance): wet sand reads the sand's, cured grass the grass's; 16 now (the shadow and rain cover stay skipped on this ground, as
  before). (2) `api.hostChecks` threw "Maximum call stack size exceeded": the scale check spread 247,503 heights into `Math.max` (99: a reduce now).
  (3) Three coffee and banana trees at the lee terraces' banks (-600,1612) read as cliff through the 16 m fields: a plot's trees skip what the zones
  call a cliff (62 `gTree`). (4) The instance cap: this kit's fern 274,311 (cap 400,000 in 52) and the Throne's small plants 275,677 and tree fern
  fronds 348,439 (cap and capWhy set from 88 on the Throne's registry, its files unchanged).

## Texture prompts

The prompts for the stand-ins above are in `core/materials/PROMPTS-NEEDED.md` (section 1, "The Ring Sea isles biome", moved there 2026-10-15): `ground.lagoon.seagrass`, `ground.reef.flat`, `organic.coral.brain`, `card.seagrass`, `card.creeper.beach`, `card.naupaka`, `card.seagrape`, `card.breadfruit`, `card.tamarisk`, `card.croptree.glossy`.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js). Add each back when the kit fills it.

2026-10-20: `atmos` is back in the profile: the build lists `89-atmos-8-export.js` (the one shared fragment sedesert took), so the section fills (clock, wind, presets, skylight).

## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the Throne's plume (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the Throne, moved to where it stands from the
      isles (due west, about 160 km); the canopy lines the dome inherited from the geyser kit's coast are dropped (sea on
      every side). Day and night are hours now (13:00 and 22:00). Draw calls at the default camera (verify.py --assert,
      GPU): 764 before, 762 after.


## The final rebuild (pair 8, 2026-11-03; `PLAN-STATIONS.md`, "Core adoption")

- [x] **`check_assembly`'s MISSING `BIO.impostorItem/Put/Set` and `BIO.leafOn/leafQ`** (the six borrowed kits' trees and the kit core called them; the page
  did not list `34-core-impostor.js` or `31b-core-leafset.js`): both listed. The borrowed kits' far trees are now their octahedral impostors (`?imp=0` their
  old blobs), baked after the bake (`89zz-host-core.js`, gain 2.2).
- [x] **The vent film's glint read `cameraPosition`** (84): r128 uploads none to a Lambert ground, so the glint was lit from the origin. It reads `kEye()`
  (core/shader's `KHOOK.EYE`, the eye from the view matrix), as the Throne's new stations do.
- [x] **Cards on their geometry**: `check_cells.py --fix` on the nine crown clumps (`stems`), the liana (its `cell` and `base: top`), the bromeliad (its whole
  plant, not a quarter of it) and the wrack (one seaweed of the nine). The one fault left is `bananaleaf`, by design: it has no material slot, and 52 cuts
  its cell itself, turned upright.
- [x] **Lianas and bromeliads floating** (the attach audit's `liana` and `epiphyte`, after the Throne's `pompom`): the dressing (60) hung each liana at a
  random point of a crown's disc and seated each bromeliad at the trunk's foot radius at its height. The forest's near and mid trees now keep their
  structure log (`BIO.tree`, 55: what `BIO.tube` and `BIO.beam` drew, this kit's or a borrowed one's), and both are put on the span nearest the old spot
  (`BIO.snapSeg`), the liana set out on the bark, the bromeliad seated in it. The same draws, so nothing else moves. A tree whose kit draws no spans
  (a lathed bole) keeps the old spot.
- [x] **Numeric defaults with `||`** (the port lint, 11): eight were defaults and are `x == null ? d : x`; three stay, `Z.xv / (Z.sav || 1)` and its
  kind, which guard a division, not a default.
- [x] **This kit's crowns off their limbs** (the audit's `thornspray`, 230 of 409, and `breadleaf`, 9 of 10, on the first rebuilt page): the scrub thorn's
  plates were drawn at a point between a twig tip and a random spot in the crown's disc, the breadfruit's leaves up to a third of the crown off a tip and
  lifted. Each builder now keeps its own limbs' spans and holds each clump within a stem card's reach of the nearest (`BIO.snapSeg`, `BIO.holdTo`; 55's
  `held`; `?hold=0` the old spots). The same draws.
- [ ] **The attach audit's limit is raised to 1.6%** (`99-host-take.js`, `guards.maxShare`; the owner's rule for a turn that cannot fix all in its own kit):
  on the first rebuilt page (software GL, before the two fixes above) 368 of 9,041 audited cards floated (4.07%; 24.0% before this turn): this kit's
  thornspray and breadleaf (239), and the borrowed savanna trees' `leaflet` (79 of 204) and `bloom` (41 of 71), 25-45 m up on the lee with no structure near
  them at all (the Rift's acacia, swbay's thorn and baobab, read in place, scaled .5-.8 by `BORROW`): theirs to fix at their kits, then lower the cap.
- [ ] **Sixteen texture units on the ground** (`window._units`): fourteen library layers, the macro map and the water's wet sand. On a 16-unit GPU (the
  Arc's ANGLE) `89zz` skips the sun's shadows, the rain's occlusion map and the ground's horizon (the flora keeps the horizon), as on the Throne's isle;
  under SwiftShader (32) all three run, so a software verify is not the GPU's page. To take shadows on the Arc the ground must drop a layer (the damp
  sand and the wet sand are near twins) or pack two into one map.
- [ ] **`export-profile` under software GL** (station 1): "library textures still decoding after 180 s", on both software runs of the rebuilt page;
  the first screenshot then timed out (10 minutes at 1280x800, 26.7 M triangles), so the harness's universal asserts were not reached. The GPU run owes both.
- [x] **The lagoon's export box** was the island's (`EXPORT_BOX`: open lagoon on its map): `verify.py`'s `STATION_EXPORT_BOX` gives it the north-east motu.
- [ ] **A pale band walls off the far lagoon** in 'The lagoon from above' (software GL, 800x500): a flat light surface past the far rim up to the
  horizon. Thinning the morning mist fourfold (`89a`: .001 below 14 m to .00025 below 10 m, both pages) did not remove it, so the mist is not its cause;
  **not traced**. Suspects: the water's shallow colour or the shore grid's lap over the 600 m of fore reef between the far rim and the map's edge
  (the bed box ends there), or the sky's horizon haze at a 1.1 km eye. Check on the GPU with `?hfog=0` and from a lower eye first.
- [x] **The high isle's forest load** (2026-11-09, station 2, `stations/high/87b-host-lod.js`): the Throne's far trees are octahedral impostors; mid trees 400 m or more from the spine and more than 600 m from every preset camera (`STATION.lodTrees.mute`, `.cam`), and hero or mid trees out of every view's reach (350 m from its sight line, 2 km from its camera: `.near`, `.far`), are built (their draws kept), then taken back and drawn as impostors (one item, `impHigh`). Measured on the GPU (`--assert --all-views`, every check passing): trees 41.1 M to 15.3 M, scene 52.1 M to 26.0 M, rendered 53.4 M to 27.0 M at the heaviest view, calls unchanged (811). Before and after shots in `shots-kground/ringisles-high-opt/` (not committed). Left: flying to a valley no preset view stands in shows impostors where heroes were (the impostors read darker and denser than the trees); the kit's own far blobs (2.2 M) stay, since 55's `buildFar` is not reachable from a station; muted trees still cost their build time. `?imp=0`, `?lodmute=<m>`, `?lodview=0` switch it.
