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
      Stays open (2026-10-25): the fields come from the scale model / the world binding (open world), not this kit.
- [ ] **The world's `cold` stops at -10 °C.** ET and EF are both `cold` 1; the kit separates them only by
  `barren` (above).
      Stays open (2026-10-25): the world's `cold` field is the open world's (core/world), not this kit.
- [ ] **`upland` is not used for zoning**: the region's median height is 4.5 km, so the world's `upland`
  (height and relief) is high almost everywhere. Altitude reaches the kit through `cold`.
      Stays open (2026-10-25): a world-field question for the open world; the kit already reads altitude through `cold`.

## Hosted by Yuni (2026-10-06)

`settlements/yuni` plants its wild valley with this kit, read in place (`BIO_CANON` in its `build.py`). The kit is
unchanged; Yuni's binding (`src/69b-yuni-biohost.js`) gives `cold`, `wet`, `flow`, `rock`, `slope` and `upland` from its
own ground, river and canal, and 0 for `canyon`, `rim`, `dune`, `geo` and `barren`. The valley is the kit's humid south
(BIOME-API.md: "the valley of Yuni"), held to the Zion side by the owner's note: `cold` .24 on the floor and `wet` .5, so
the floor is `vale` and `rip` (gambel oak, bigtooth maple, cottonwoods, rose weepers, umbels) under `pine` on the walls.
`EBADLANDS.dress()` hangs Zion's gardens on Yuni's butte.
- [ ] Yuni has no carved channels, so `canyon`, `bench` and `rimZ` never fire there: the canyon flora of the showcase
  (bench pinyon, rim maples) is absent. A host that bound the valley walls as a canyon would get it.
      Stays open (2026-10-25): Yuni's binding, not this kit.
- [ ] Yuni's own ground painter draws its terrain; the kit's bedded-rock shader (`35-core-strata.js`) is not used there.
      Stays open (2026-10-25): Yuni's host, not this kit.

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

- [x] **Import the Throne's sulphur layer onto the sulphur flats** (the owner, 2026-10-06). Done 2026-10-26 as a **port of
  the reeds** (not the Throne kit as a second kit: its species, trees and floor are ~225 KB of fragments with their own
  `BIO.init`, palettes and library, for one plant). `EBADLANDS.buildSulphur` (`src/60`, its own seed 640047 and budget type
  `badlands/sulphur`, run after the floor in `70` and in the showcase's `88`) is `THRONE.buildSulphur`'s reed stand as the
  Throne has it: `rod` stems in two bands (`PAL.reedLow/reedHigh`), a crusted `tassel` (`PAL.tassel`, new item), the plant
  `brimreed` in `EBADLANDS.PLANTS`. Only in a narrow band at the acid pools' shores (the grid's depth window: the shallows to
  0.45 m and the lip half a metre above), on the Throne's `sulph` field (`BIOME-API.md`): the showcase binds it as
  `max(geo, the pools' banks)` (`45`); unbound it is 0 and nothing grows (the open world, until it binds `sulph` from its
  `geo`). The Throne's acid pads, gas bladders and brimstone candelabra (`sp 23`) stay out, as the owner asked for the reeds.
  New view `Brimstone reeds at a sulphur pool`; check `brimstone reeds at the sulphur pools only` (and its negative). Cost:
  4639 stems, 13917 instances, 185,560 triangles; +1 draw call (366 -> 367 at the default camera; Sulphur flats 187 -> 188).
- [x] **The brimstone reeds are procedural rods.** The Throne draws them from the owner's `card.reedbrim` sheet when its pack
  carries it (`THRONE.buildSulphur`, `RB`). Adding that slot to `materials.json` (and the Throne's cell cutter) would give
  the pools the same card stands; left for a pass that owns `materials.json`.
  2026-10-26: done. `materials.json` slot `card.reedbrim` (`card.reed.brimstone`, full colour); `50` cuts its nine cells and
  defines `reedbrim0`-`8` on `G.tuft` with the Throne's sway; `60`'s reeds draw a stand of the cards (2-4 near, 1-2 mid) when
  the pack has them, the rods and tassels otherwise; the check counts either. 1,652 stands, all at a pool shore.


## The final rebuild's turn (2026-11-02, pair 5; `PLAN-STATIONS.md` "Core adoption")

- [ ] **The looks to judge** (each behind its switch): the badland and canyon recipes on the strata (`?strata=0` the legacy column), the
  ground's layers on KGROUND (`?kground=0`: the pine floor reads paler and greyer than the old mix: not measured, by eye), the pavement
  (`?pave=0`), the mud polygons and patterned ground (`?polygon=0`), the talus scree and the landforms (`?landforms=0`), the impostors' gain
  2.4 (`?impgain=`; the core bake is ~4x dark), the height fog (`?hfog=0`), the dust (`?dust=0`, `?storm=1`), the lichen crusts on
  `BIO.fung` (`?fung=0`), the far country (`?far=0`), and each station's page as a whole.
- [ ] **B0 was decided at the turn, not by the owner**: the transect stays the overview page and station 1 is the hot waste alone.
- [ ] **Five library ground layers a page** (`45-host-stage.js`, `LAND.groundLayers`): a fragment shader has 16 texture units and ANGLE on
  the Arc linked 15 at most; the strata take 5, the horizon 2, the paint, the grain and the rain's cover map 3. The transect lost travertine,
  redwall, caprock, playa and tundra (the playa's look is the polygon kind's, the tundra station has tundra). An atlas of the layers, or
  KGROUND reading a texture array, would give them back.
- [ ] **No wet ground on the dry lands** (the transect, stations 1, 2 and 4): the weather's dry climate never wets the ground, and the
  puddle mask and the rain map are two texture units the ground has not got. Station 3 (montane, wet) has it.
- [ ] **Exchanges owed** (`EXCHANGES.md`): sedesert's mesquite (wired in `87-host-kin.js`, not read: its crowns float off their limbs, 9.5% on station 1's
  attach audit; read it again once sedesert holds them), the Bowl's tamarisk to station 1 (its builder is private to
  `biomes/sedesert/stations/bowl/66-biome-sedesert-halo.js`: the Bowl exports it, then `src/87-host-kin.js` grows it on the wadis' bars),
  Korona's frost tank (Korona's turn, pair 9); as vendor, ebadlands' juniper to sedesert's main page and cottonwood to the Bowl's delta
  (sedesert's next turn: its `build.py` NEIGH and `87-host-kin.js`, then its pages' verifies), and the bristlecone to Korona (Korona's turn).
  2026-11-08: checked: the mesquite is read in place (`BIO.kin('sedesert.mesquite')`, sedesert's own builder; ebadlands holds no copy of its
  crown placement), so sedesert's crown fix (BIO.snapSeg/BIO.holdTo, under way in biomes/sedesert) reaches it for free. Nothing to change here;
  once that fix lands, put sedesert's species fragment back on the page and re-run station 1's attach audit.
- [ ] **The glacier is host ice** (station 4): the ground drawn as ice and firn (barren, snow), no ice kind in core/water; its surface has no
  crevasses or séracs.
- [ ] **The overview's sky site** (old canvas 1043,508) lies in the abyss's rim on scale model 5.1 (-1,648 m): kept, since the sky reads only
  the latitude and the giant's bearing from it.
- [x] **The variant trees lost their welded items** (the owner, 2026-11-03: "stilt pods not rendering properly"): `BIO.INDEX_ITEMS` (this turn's
  universal set) welds every item into an indexed geometry, and `86-host-variants.js`'s harvest copied an item vertex by vertex, ignoring the index, so
  every item drawn through the variants (the stilt pod's head, its tendrils, the trees' leaf clumps and fruit) came out as scrambled triangles: the
  pod's head was 30 of its 180. The harvest expands an indexed item first. The attach audit could not see it: it samples BIO's baked items, and the
  variant trees are 86's own pools; a check does now (`the variants keep every triangle of their items`, with its negative). **A trap for the open
  world:** `openworld/isle-demo/src/world/84-world-nursery.js` harvests the same way; it is safe only while no open world sets `INDEX_ITEMS`.
- [x] **The ember crown's joins and the needle bloom's seat** (the owner, 2026-11-03): every limb in this kit now leaves its parent through
  `BIO.flareJoin` (core/biome 31j: the root sunk into the parent, a collar, 6-8 sides at the joint; a reader without the fragment draws the old
  tube); the ember crown's bottle has a shoulder over the limbs' roots. The needle bloom's head stood .55 of its size over its stem's tip; it sits
  on it now, the tip inside the core (most of the gap the owner saw was the harvest bug above, which scrambled the head and its eye).
- [ ] **The painted badlands still read smooth up close** (the owner, 2026-11-03: "too uniformly bright, looks painted on"). Done at page level:
  the beds' ledges cut into the transect's mounds (KSTRATA `ledge`; `?ledges=0`), a cavity term from the ground's own curvature and slope
  (`aAO`; `?cavity=0`), chips shed by the beds in each bed's colour within 260 m (`?chips=0`), station 1's ground at 7.9 m cells. Mid and far
  range now show ribs and gullies; up close a flank is still a smooth band, because the ground's cells (13 m on the overview) cannot carry 0.3-2 m
  steps: that wants the core ground session's shading (KGROUND normals, roughness, cavity at texel scale), or a finer mesh near the camera.
- **The transect's land is `src/44w-host-land.js`** (split from `45-host-stage.js`): a station replaces it (`stations/<name>/`); its header is
  the land contract. `88-host-build.js` is `89z-host-build.js` (after the water: the flora reads the water's shore).
- **Species for readers** (eastabyss, the open world, Yuni): keys and indices unchanged; the item `bloom` is `onLeaf` (held in a leaf card's
  body), flat floor blooms and the floor's tufts take the ground at their own spot (same draws), the hanging garden's blooms sit on their
  strand, the moonflower's column has the quality pass (80 triangles), and the dressing's crusts are `crustf` (`BIO.fung.crust`) where the page
  has core/biome 33 (a reader without it keeps `lichen`).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 2): `water` is now in the profile; the two "nothing to wire" notes above are out of date. The river, the six acid pools and the tarn are core/water's: in `45-host-stage.js`, `RIVER` (a `WATER.flow` along zR(x) at WL(x), from the east end to the west, every 20 m, 24 m wide), `POOL_STILLS` (a `WATER.still` disc each, radius 1.35 of the pool's, at its own `POOLL` level) and `TARN_STILL` (radius 1.3 of the tarn's, at `TARNL`); drawn in `89w-host-water.js` (`drawFlow`; one `drawStill` per pool with its own colour; the tarn; the sky from `ATMOS.skylight` on a capture of the dome and giant, given to the water only). The page's `MAT_WATER` ShaderMaterial, the river sheet and the fans are gone. `BIO.waterH`, `terrainH` and the `REGISTER` volumes are unchanged. build.py lists `CORE_WATER` (20, 21, 22, 50, 51). Cost, same cameras, before -> after (calls, triangles): Zion, the river in the canyon 366 -> 366, 5.53 M -> 5.52 M (the river was 880 rows of 16 triangles, now 374 of 8); Sulphur flats 187 -> 187, 4.20 M -> 4.20 M; The tarn 275 -> 275, 6.52 M -> 6.51 M. EXPORT_BOX unchanged ([-300,0,0,300] holds the river's reach at z 224..341); the profile passes (registry through water, 9 of 9). Look: the pools' acid greens, yellows and turquoise are each one mean colour now (a pool was its colour at the middle running to the same lightened 35% at the rim: `drawStill` takes one colour, `core/water/README.md` "Open gaps"); the river is lit by the page's sun and shows the sky at grazing views, paler teal than the old unlit shader, and the white of the rapids is the flow shader's (the grade of the bed, 1.5% to 12%) rather than the old noise colour in x 1500..2300. The river's surface rises and falls with the bed (it is `WL(x) = floorC(x) - 1.2`, which `waterH` reads: not a monotone line).

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the far ranges beyond the Outer Rim, the
      abyss's far rim in the west and the mesas (ridges). The Outer Rim's near wall is the map's own range (real terrain),
      so it is not painted again. Draw calls at the default camera (verify.py --assert, GPU): 366 before, 365 after.

