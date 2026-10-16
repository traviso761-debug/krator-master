# Eastern badlands — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## The open world

- [ ] **Two fields the world does not bind yet: `geo` and `barren`.** The kit reads `geo` (geothermal ground:
  the sulphur flats, their chimneys, mounds, parasols and stilt pods) and `barren` (the ice cap and the airless
  rim, where nothing grows) through `BIO.field`, so both read 0 in `openworld/little-demo` today. With
  `barren` at 0 the tundra zone reaches every point colder than -10 °C mean (the world's `cold` saturates
  there), so cushions and krummholz would grow on EF ice and on O and HF ground. With `geo` at 0 there are no
  vents. Both belong in `WORLD.at` for every kit (the handoff's rule), from the scale model: `barren` from the
  classes EF, O, HF (and perhaps a mean below about -20 °C), `geo` from a volcanic/geothermal raster or the
  owner's overlay. The kit needs no change when they arrive; its registry entry then wants a `vent` floor profile.
- [ ] **The world's `cold` stops at -10 °C.** ET and EF are both `cold` 1; the kit separates them only by
  `barren` (above).
- [ ] **`upland` is not used for zoning**: the region's median height is 4.5 km, so the world's `upland`
  (height and relief) is high almost everywhere. Altitude reaches the kit through `cold`.

## Hosted by Yuni (2026-10-06)

`settlements/yuni` plants its wild valley with this kit, read in place (`BIO_CANON` in its `build.py`). The kit is
unchanged; Yuni's binding (`src/69b-yuni-biohost.js`) gives `cold`, `wet`, `flow`, `rock`, `slope` and `upland` from its
own ground, river and canal, and 0 for `canyon`, `rim`, `dune`, `geo` and `barren`. The valley is the kit's humid south
(BIOME-API.md: "the valley of Yuni"), held to the Zion side by the owner's note: `cold` .24 on the floor and `wet` .5, so
the floor is `vale` and `rip` (gambel oak, bigtooth maple, cottonwoods, rose weepers, umbels) under `pine` on the walls.
`EBADLANDS.dress()` hangs Zion's gardens on Yuni's butte.
- [ ] Yuni has no carved channels, so `canyon`, `bench` and `rimZ` never fire there: the canyon flora of the showcase
  (bench pinyon, rim maples) is absent. A host that bound the valley walls as a canyon would get it.
- [ ] Yuni's own ground painter draws its terrain; the kit's bedded-rock shader (`35-core-strata.js`) is not used there.

## The showcase

- The showcase is a compressed transect (6.8 km for a region 300 km wide): the treeline at 1,350 m and the ice at
  1,650 m are the transect's own numbers, not the region's (where they sit near 4-5 km).
- The ground's 13.4 m cells cut the badland rills coarsely; close up the mounds read smoother than the reference.
- **Trees as variants (2026-10-06):** the showcase draws its 31k trees as instances of 324 prototypes (6 variants of
  each species at each of three levels, plus a small krummholz form for the treeline spruce), grown once by the kit's
  own `make`/`grow` (`86-host-variants.js`), the level chosen per tree by its distance from the camera (hero within
  ~14x its height, 60-220 m; mid to 300-1000 m; the impostor to 900-3200 m). Every hero is grown with full branches.
  The first view draws about 5.5M triangles (18M with every tree unique), the page builds in ~3 s, and the probe's
  triangle total is what is drawn at the camera. `?unique=1` builds the old way to compare. Costs: ~350 draw calls
  (one per pool part), and a tree changes shape when its level changes (hero and mid are the same variant seed, built
  at two levels of detail).
- The floor (3.2M) and the dressing are still baked whole, not by the camera (`KNOWN_ISSUES` item for later: floor
  patches as in the open world).
- The ice past 1,650 m is a thin band on the crest's east side: the snow paints it, but the showcase has no glaciers.
- Every far species has an impostor; the floor stops at the far band's 36 m cells, so from the high views the
  ground between trees is painted, not planted.
- **The spruce's close-up (2026-10-06):** a hero spruce within 240 m of the LOD spine builds each branch as a sagging
  twig carrying two to four pairs of metre-long sprays and a leader spray (one card the branch's whole length read as a
  giant fern frond up close); farther heroes keep one card per branch. The core cone is slimmer and darker. Spruce
  count is held at a 16 m cell: the rich branches cost about 3.4M triangles.
- **The arcade** (`85-host-arcade.js`) is a host test structure for `dress()`, like sedesert's Girder tower: a world
  hands over its own shells.

## Textures

- The showcase uses 25 library sets (`materials.json`, `tex/`, 2.5 MB; core/materials/PLAN.md "Eastern badlands"): ten
  leaf cards, eight ground layers blended by zone, five barks and woods, the amazonite pods. The open world loads the kit
  without its pack, so there it keeps the procedural canvases (KMAT is not in that page); `?mat=proc` shows them here.
- `card.spruce` keeps a faint lilac at a few needle tips (magenta in the source's anti-aliasing); the species tint covers it.
- `card.ember` came as one compound pompom, not nine: every ember-crown tuft is the same shape, rotated.

## From other kits

- [ ] **Import the Throne's sulphur layer onto the sulphur flats** (the owner, 2026-10-06). `biomes/throne` station 8
  (vent country) grows Krator's sulphur extremophiles wherever its host hands in a `sulph` field (`THRONE.buildSulphur`
  in `src/60-biome-throne-floor.js`, the brimstone candelabra `sp 23` in `55`; `BIOME-API.md`, the `sulph` row). Bring
  that layer here for the north's Danakil-like flats: bind a `sulph` field from the flats' `geo` ground, and take the
  **brimstone reeds only round the acid pools** (a narrow band at their shores, not across the flats). Either load the
  Throne kit as a second kit on the page (as the Throne's kipuka loads the hyperjungle: `station.json` `kits`) or port
  the reeds' items (`rod` stems in two bands, the `tassel`, `PAL.reedLow/reedHigh/tassel`) into this kit.

