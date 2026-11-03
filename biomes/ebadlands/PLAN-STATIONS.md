# ebadlands: the transect as stations (plan 2026-10-23; built 2026-11-02, the final rebuild's pair 5)

The kit draws its whole transect, from the sulphur flats and the hot waste to the tundra under the airless rim (BSh to
EF), on one page. Its polygon is 231,000 km² on scale model 5.1 (209,000 on 4.23), the largest kit polygon after Korona, and
each band is big enough to want room of its own. The transect is split into four stations; the strata upgrade
(`core/terrain/STRATA-PLAN.md`, the `badland` recipe) lands under all of them.

**Status: built (2026-11-02).** B0, decided at the turn (not by the owner: say if it should go the other way): **the page as built
stays the overview** (`dist/ebadlands.html`, the transect), because the open world (`openworld/little-demo`), Yuni and eastabyss read
the kit in place and the transect is the one page that shows every zone; **station 1 is the hot waste alone**.

## The ground on scale model 5.1 (re-surveyed 2026-11-02)

`tools/scale-model/smodel` on `tools/scale-model/model/data` (5.1, canvas 1821 x 1723), the polygon `e badlands` (regions export
`rmuqm20f95x4v`, old canvas, shifted by (272, 330)). 30 km relief is the height range within 15 px. Gemini's Round 1 edit (32% of the
polygon moved over 100 m) put the Grand Staircase's five steps and the badlands' dendritic gullies here, and the dry-summer classes
(Csa, Dsb, Dsc) the 4.23 survey did not have.

| Climate | km² | Height | Rain | Mean (warm/cold) | 30 km relief |
|---|---|---|---|---|---|
| BSh | 21k | 1.02 km | 501 mm | +21 (32/10) | 1.0 km |
| Csa | 33k | 1.28 km | 627 mm | +19 (30/8) | 2.0 km |
| Cfa | 38k | 1.90 km | 596 mm | +16 (27/4) | 1.5 km |
| BSk | 25k | 2.40 km | 376 mm | +14 (26/2) | 1.2 km |
| Dsb | 18k | 3.21 km | 470 mm | +8 (21/-5) | 1.7 km |
| Dfb | 13k | 3.52 km | 392 mm | +6 (19/-7) | 1.7 km |
| BWk | 3k | 4.00 km | 125 mm | +5 (18/-8) | 0.9 km |
| Dsc | 12k | 4.17 km | 250 mm | +3 (16/-10) | 1.2 km |
| Dfc | 41k | 4.61 km | 266 mm | 0 (13/-13) | 1.1 km |
| ET | 8k | 5.41 km | 219 mm | -4 (9/-17) | 1.4 km |

Smaller classes inside the polygon (under 3k km² each): the abyss's own along its west edge (XA, XV, XW, Aw, Am, BWh, 0.5-2.3 km
down), Csb, Cfb, Dfa, Dwb, Dsa. **The overview's sky site** (old canvas 1043,508) now lies in the abyss's rim at -1,648 m (XA): the
sky reads only its latitude and the giant's bearing from it, so it was kept; each station has its own.

## The stations (built)

Every page compresses its band into 6 km (R 3000; the overview's is 6.8 km): the heights are the page's, the model's are below.
A station is `python3 build.py --station <name>`: `stations/<name>/44w-host-land.js` replaces the transect's land on the same kit
(the land contract: `src/44w-host-land.js`'s header; `src/44v-host-landlib.js` builds a station's from its parts).

| Station | Page | Site on 5.1 (old canvas) | The model there | What the page draws |
|---|---|---|---|---|
| 1 the hot waste | `dist/ebadlands-waste.html` | px 1352,844 (1080,514) | BSh, 1,101 m, 392 mm, +23 (34/11), 2.4 km relief | the sulphur flats (vents, five acid pools, brimstone reeds, stilt pods), the painted badlands cut into dendritic gullies (badland recipe), two wadis to a playa (mud polygons), the reg (desert pavement), the first step of the staircase (230 m, canyon recipe) with its talus, domes and a slot canyon; rope araucarias in the slot (the kin) |
| 2 canyons and green valleys | `dist/ebadlands-canyons.html` | px 1279,1111 (1007,781) | Csa (Cfa, BSk round it), 2,156 m, 612 mm, +13 (24/1), 3.2 km relief | five steps of the staircase in the canyon recipe, each bed's ledge in the ground (`S.terrace`), a river down through them in a Zion narrows widening to a green valley (cottonwood, maple, oak, weepers), pinyon-juniper on the treads, talus and its boulders at every cliff's foot |
| 3 montane forest | `dist/ebadlands-montane.html` | px 1356,1016 (1084,686) | Dfb (Dsb, Dfc, Dsc round it), 3,630 m, 690 mm, +7 (20/-6), 2.0 km relief | ponderosa and aspen, a wet meadow (no trees), a burn (charred ground, 2,000 snags, 1,350 logs, no living tree), spruce-fir up to a cirque tarn (the reflections switch) and its stream; granite, no bedded rock |
| 4 tree line, tundra, glacier | `dist/ebadlands-tundra.html` | px 1374,623 (1102,293) | ET with Dfc below, 4,782 m, 267 mm, +1 (14/-12), 2.1 km relief | the last spruce-fir and krummholz, bristlecones, tundra with patterned ground (KGROUND's polygon kind) and granite tors, a valley glacier (host ice: the ground drawn as ice and firn, nothing roots on it) with lateral and end moraines (boulder fields) and a milky proglacial lake; the airless rim's wall past the map (KFAR, 4 km up in 8) |

Model notes for the owner: station 1's site sits 30 km from the abyss's rim (the relief's low end, -460 m, is the rim's); station 4's
site is ET at 4.8 km but the band's median ET is 5.4 km, and the polygon has no EF: the glacier is the kit's (the 4.23 plan asked for
one), not a mapped ice field.

## Core adoption: the final rebuild's turn (2026-11-02, pair 5)

`BACKPORT.md` section 1 (the universal set), ebadlands' row in section 2 and section 5, on all five pages. Each look change has its switch.

| What | Where | Switch |
|---|---|---|
| `BIO.INDEX_ITEMS`, `BIO.LOD.merge/minTris/fade/cull`, the runtime LOD tick | `src/45-host-stage.js`, `99-host-take.js` | `?index=0`, `?lodmerge=0`, `?lodfade=0`, `?lodcull=0` |
| The variants' far level on octahedral impostors (core/biome 34, one set of 17 species, drawn in the variants' own pool so it changes level with them); gain 2.4 | `src/86-host-variants.js`, `89z-host-build.js` | `?diet=0`, `?impgain=`, `?impwrap=` |
| KSTRATA (core/terrain 35 and its shader; `src/35-core-strata.js` is gone): the `badland` recipe's clays to 330 m under the `canyon` recipe's sandstones (the transect, station 1), the canyon recipe with its ledges in the ground (station 2); the painter takes the same beds (`S.surface`), so ground and rock are one stratigraphy | `src/44w-host-land.js`, stations' lands, `45` | `?strata=0` (the legacy column in the badland palette) |
| KRELIEF and KSTACKS: talus at the escarpment's and every cliff's foot, wadis (the transect's across the hot basin, station 1's two to the playa), slickrock domes, granite tors | lands, `45` (the rock bodies) | `?landforms=0` |
| KGROUND: the library's layers hex-tiled and height-blended on documented masks (five a page: the 16-unit limit, below); kinds: `clast` desert pavement, `polygon` mud polygons and patterned ground, `clast` talus scree | `45` | `?kground=0`, `?pave=0`, `?polygon=0` |
| KFAR (to 14 km, the land's own far function) and KHORIZON (the ground, then the flora) | `src/83-host-far.js`, `89z` | `?far=0`, `?hz=0` |
| R8 wind, R7 alpha-to-coverage, R5 ground tint, R1 height fog, R10 rain cover, snow that lies (over the land's snow line, lee drifts), R9 wet ground and puddles (station 3 only: a dry land's weather never wets it), dust and the air's load with a dust storm (the panel's air select) | `src/89a-host-atmos.js`, `89z` | `?hfog=0`, `?wet=0`, `?snow=0`, `?dust=0`, `?storm=1` |
| Water: breakup on the river and the stills; `WATER.mirrorSwitch` on the tarn (off at page load) | `src/89w-host-water.js`, `99` | `?breakup=0`, `?mirror=probe|live` |
| The water as fields (`WATER.fields`, `BIO.env`): wet and flow read the water's own shore | `89z` | `?fields=0` |
| `BIO.fung`: the dressing's lichen and moss crusts on `BIO.fung.crust` | `src/50`, `65` | `?fung=0` |
| Card cells (`check_cells.py`): 0 faults before and after | `materials.json` | |
| Ride-along: the succulent columns' quality pass (the moonflower cactus, 80 triangles) | `src/50` | |
| Exchanges (`EXCHANGES.md`): eastabyss's araucaria (a cousin) on station 1, read in place; sedesert's mesquite wired but not read (its crowns float off their limbs in sedesert's builder) | `src/87-host-kin.js`, `stations/waste/station.json` | `?kin=0` |

**The review's three lines.** Ground layers on documented masks: `45-host-stage.js`, "THE GROUND'S MASKS" (each layer's zone weight,
the pavement, the polygons, the water's wet band, the talus; no layer on a bare noise). Strata and scour feed placement: the beds'
ledges are baked into station 2's ground (`S.terrace` in `44v-host-landlib.js`), the talus is a field that seats boulders
(`landBoulders`, `LAND.build`) and the wadis' floors and bars a field (`wash`) the mesquite and the paint read; the domes and tors keep
the flora off them (`ROCK_MASK`). Wet ground and flora read the water's shore: `89z-host-build.js` (`WATER.fieldAt`, the wet band
`aGM.z`), checked by `edgeCheck` in `99-host-take.js`.

**Not taken, and why:** seasons and `BIO.kin` as a source (no row asks them of ebadlands), the dust's alkali (no salt here), KSEAT
(swlowlands' opt-in; no float was measured on these grounds), the Bowl's tamarisk (its builder is private to the Bowl's floor
fragment) and Korona's frost tank (Korona's turn, pair 9).

**The 16-unit limit.** A fragment shader takes 16 textures and ANGLE on the Arc linked 15 at most: the ground's paint and grain (2), the
strata (5), the horizon (2) and the rain's cover map (1, the lying snow reads it) leave five library layers a page (`LAND.groundLayers`);
the transect shows clay, sandstone, sulphur, steppe and needles, and drops travertine, redwall, caprock, playa and tundra (the playa's
look is the polygon kind's). The procedural crack canvas went too.

## Order (as built)

B0 the overview kept; B1-B4 the stations, the species moved, not redrawn; `openworld/little-demo`, Yuni and eastabyss keep reading
the kit's `build`/`dress` and species unchanged (new parts are guarded: `BIO.fung`, `onLeaf`).
