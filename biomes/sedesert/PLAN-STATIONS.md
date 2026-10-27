# sedesert: more stations (plan, 2026-10-23)

The kit draws red desert (BWh) with Socotran flora, mesas, hoodoos and the canyon to the Abyss. The polygon is half
**desert-steppe**, and the owner's new **Bowl** polygon (2026-10-23) lies over it as its abyssal end. Two stations; the
page as built stays station 1. The strata upgrade (`core/terrain/STRATA-PLAN.md`) lands under all three.

**Status: plan, awaiting the owner.**

## The ground (surveyed 2026-10-23)

| | km² | Height | Air | Rain | Mean | Climate |
|---|---|---|---|---|---|---|
| The kit's desert (BWh) | 152k | ~700 m | ~1.5 atm | ~170 mm | +22 | BWh |
| **The steppe** (BSh) | **145k** | ~670 m | ~1.5 | ~330 mm | +22 | BSh |
| **The Bowl** (its own polygon) | **110k** | ~-800 m | ~1.77 | ~220 mm | +27 (34/18) | BWh 56%, BSh 20%; 63% salt-basin zone, 8% water |

## Station 2: the Bowl

The detailed plan is `PLAN-BOWL.md` (**built 2026-10-26**: `python3 build.py --station bowl` -> `dist/sedesert-bowl.html`, the station's files
in `stations/bowl/`; its section 10 says what is built and left; **station 2b, Mantis's pocket**, a Socotran monsoon forest at the oasis
town, `python3 build.py --station mantis`: its section 11); in short:

The abyssal desert: a salt basin under dense air, 4.21's lakes painted in the Bowl's own look (an ochre salt rim, a teal
core, a pale salt flat round each: `tools/scale-model/README.md`, `LAKE_STYLE`), salt polygons and efflorescence, the
kit's Socotran flora grown larger and squatter in the dense air (bottle trees, dragon's blood trees), halophyte scrub on
the rims, mirages over the flats. Arcbeam (arcology) and Mantis (village) stand in it.

## Station 3: the steppe fringe

The detailed plan is `PLAN-STEPPE.md` (**built 2026-10-26**: `python3 build.py --station steppe` -> `dist/sedesert-steppe.html`). In short:

Desert grassland and thorn steppe at ~330 mm: bunchgrass between acacia-like thorn trees and frankincense, the kit's
species thinning in, gravel plains, a seasonal pan that greens after rain; the hoodoos and mesas giving way to low
rolling ground.

## Order

D0 sites; D1 the Bowl (the larger change); D2 the steppe; verified and baselined; `kits/crops` `sedesert` gains `salt`
and `steppe` zones.

## Core adoption: the final rebuild's turn (2026-10-27, pair 3)

`BACKPORT.md` section 1 (the universal set), sedesert's row in section 2 and section 5, on all four pages (`dist/sedesert.html`, the Bowl,
Mantis's pocket, the steppe). Every look change has its switch.

| What | Where | Switch |
|---|---|---|
| `BIO.INDEX_ITEMS`, `BIO.LOD.merge/minTris/fade/cull` | `src/45-host-stage.js`, `stations/bowl/46-host-land.js` (Mantis and the steppe take it) | `?index=0`, `?lodmerge=0`, `?lodfade=0`, `?lodcull=0` |
| The runtime LOD on the kit's passes (`SEDESERT.LOD`, all null for a reader) and octahedral impostors (core/biome 34) for every far tree that had a blob; the twist-candles keep their spires; `BIO.impostorLook` gain 2.6 | `src/55`, `src/60`, each page's `88-host-build.js`, `99-host-take.js` (`lodTick`) | `?diet=0`, `?impgain=`, `?impwrap=` |
| R8 wind, R7 alpha-to-coverage, R1 height fog, R10 rain cover, R9 wet ground and puddles (the main page only: the stations' ground is at 15 of 16 texture units) | `src/89x-host-air.js` (all four pages) | `?hfog=0`, `?wet=0` |
| The water set: the cataract's spray by drop, `lipK` .85, `footK` .6 (tall falls); rain rings on the river, the pool and the pond | `src/89w-host-water.js` | `?wset=0` |
| KFAR: the far country to 14.5 km (the Inner Wall's ramp, the dunes, the Abyss floor), its lattice in the KHORIZON bake | `src/45-host-stage.js` (`FAR`) | `?far=0` |
| KSTRATA: the page takes core/terrain 35 and its shader (no recipe: the legacy column, the same beds); `src/35-core-strata.js` stays for the five builds that read it in place | `build.py` | |
| KRELIEF: talus at every mesa's and the butte's foot; a dry braided wadi (bars, cut banks, pools) from the southern scrub to a dry fall over the canyon rim, painted as cobble and gravel | `src/45-host-stage.js` (`LANDF`) | `?landforms=0` |
| KGROUND kinds: `sand` on the main page's dunes and the Bowl's (ripples across the wind, grain glints); `clast` as the main desert's pavement (varnished pebbles in red sand); `polygon` as the Bowl's salt-crust pressure polygons | `src/45-host-stage.js`, `stations/bowl/84-host-ground.js` | `?sand=0`, `?pave=0`, `?polygon=0` |
| Dust storms: core/atmos 3d-dust (lifted off bare dry ground by the wind) and the air's load (the fog from the sight; KHAZ's dust, alkali on the Bowl's crust, visibility); a haboob from the panel's air select | `src/89x-host-air.js`, core/hazard 20 in `build.py` | `?dust=0`, `?storm=1` |
| The Bowl's lake recorded as `brine` (`WATER.withLook`, the export's look; the page keeps its bands); the shore's `pan` (salt crust, floods to brine after rain), drawn on the ground by core/water's pan GLSL in the strip just over the waterline (drawPan's flat sheet z-fought the shore: the owner, 2026-10-27) | `stations/bowl/89w-host-water.js`, `84-host-ground.js` | `?pan=0` |
| The delta's apex as one water (core/water ext/55 `WATER.confluence`, the water session's lines; eastabyss's forks): the river now ends on the apex and every distributary starts there (their lines were 50 m apart), one surface over the junction, the six ribbons faded inside it; the ribbons' ripples broken up (ext/56 `WATER.breakupFlows`, main page and Bowl) | `stations/bowl/45-host-stage.js`, `89w-host-water.js`, `src/89w-host-water.js` | `?apex=0`, `?breakup=0` |
| The Bowl's ground layers' tile breakup: each patch's copy turned as well as shifted, patches a third the size, a third copy at 0.37 the scale; the salt crust's second texture (the soda crust in broad patches) (the owner: the flat read as a grid of one tile) | `stations/bowl/84-host-ground.js` | `?tiles=0` |
| Mantis's cucumber tree: leaf tufts seated on the limb tips (they floated 0.3 m over capped stubs once the fig card held its sprigs by their stems), the limbs tapering into them, a second tuft along each hero limb | `stations/mantis/57-biome-sedesert-forest.js` | |
| Seasons on the steppe: the bunchgrass and needle grass go to straw in the dry season (`BIO.bindSeason`) | `stations/steppe/59`, `99` | `?season=0`, `?dry=0..1` |
| Card fit (`check_cells.py --fix`): feather, hang, paddle, palmfrond, pods, reed, small; the Bowl's saltbush, tamarisk, salt reed and saxaul twigs (their own slot now); Mantis's beard and fig. Sheets cut by the geometry (`"sheet": "geometry"`, `BIO.geo.cells` a plant a quad), after the owner caught the spinifex drawing whole nine-sprig sheets as boxed grids: `needle` (three pine sprigs a tuft), `bloom` (two of `card.flower.bloom`'s six flowers a bloom, its boxes set by eye: the checker's proposal is wrong for it) and the Bowl's `flowers` (three of the nine highland flowers a tuft). Every slot on the four pages checks at 0 faults | `materials.json` (three), `tex/pack.json` | |
| Exchanges: eastabyss's jade on the Abyss floor (read in place, `src/87-host-kin.js`); the brine lamp's one builder (`stations/bowl/65-biome-sedesert-brinelamp.js`) for the Catch to read | `build.py` NEIGH | `?kin=0` |

Not taken, and why: KGROUND on the Bowl's own ground (its nine layers are its own shader; the kinds sit over them), domes (the steppe's kopjes are
KSTACKS tors already; the main desert's mesas are the kit's), the kaluts on a KSTRATA recipe (they keep their legacy column, now from the core
shader), `BIO.fung` (the kit has no fungoid part), R5 ground tint on the floor (no floor material carries `ground` yet).
