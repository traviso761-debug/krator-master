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


## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 2): `water` is now in the profile; the two "nothing to wire" notes above are out of date. The river, the six acid pools and the tarn are core/water's: in `45-host-stage.js`, `RIVER` (a `WATER.flow` along zR(x) at WL(x), from the east end to the west, every 20 m, 24 m wide), `POOL_STILLS` (a `WATER.still` disc each, radius 1.35 of the pool's, at its own `POOLL` level) and `TARN_STILL` (radius 1.3 of the tarn's, at `TARNL`); drawn in `89w-host-water.js` (`drawFlow`; one `drawStill` per pool with its own colour; the tarn; the sky from `ATMOS.skylight` on a capture of the dome and giant, given to the water only). The page's `MAT_WATER` ShaderMaterial, the river sheet and the fans are gone. `BIO.waterH`, `terrainH` and the `REGISTER` volumes are unchanged. build.py lists `CORE_WATER` (20, 21, 22, 50, 51). Cost, same cameras, before -> after (calls, triangles): Zion, the river in the canyon 366 -> 366, 5.53 M -> 5.52 M (the river was 880 rows of 16 triangles, now 374 of 8); Sulphur flats 187 -> 187, 4.20 M -> 4.20 M; The tarn 275 -> 275, 6.52 M -> 6.51 M. EXPORT_BOX unchanged ([-300,0,0,300] holds the river's reach at z 224..341); the profile passes (registry through water, 9 of 9). Look: the pools' acid greens, yellows and turquoise are each one mean colour now (a pool was its colour at the middle running to the same lightened 35% at the rim: `drawStill` takes one colour, `core/water/README.md` "Open gaps"); the river is lit by the page's sun and shows the sky at grazing views, paler teal than the old unlit shader, and the white of the rapids is the flow shader's (the grade of the bed, 1.5% to 12%) rather than the old noise colour in x 1500..2300. The river's surface rises and falls with the bed (it is `WL(x) = floorC(x) - 1.2`, which `waterH` reads: not a monotone line).
