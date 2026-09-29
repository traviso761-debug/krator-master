# Locus — world build notes (Sep 2026)

Locus is a fork of the Yuni engine (`build.py` concatenates `src/*` into one `BUILD()`), with its own
terrain, layout, placement, life layer and fauna. Three targets: `locus.html` (the world),
`locus-kit.html` (the Locus building kit sheet), `locus-plants.html` (flora catalogue). `publish/` holds
the artifact copies.

## Where things live

| fragment | what it owns |
|---|---|
| `10-core.js` | the world field: `terrainH`, the lake shore (`lakeShoreX`), river / distributaries / canal splines and distance queries, the hill, the strand ridge, the SE hummocks, `LOCUS_FIELDS` (wet/salt/upland/flow), centred noise `nfb`/`nsig` |
| `20-stage.js`, `21-sky.js` | the painted horizon: abyss shelf in the east, far lake shore in the west |
| `30-layout.js` | the schedule (refinery, 3 tanks, both chapterhouses, school, warehouse, caravanserai, rich band, market, park), ring road + 8 crooked avenues + concentric rings + alleys, the ROUTE GRID (`RG`, 12 m cells, A* with a binary heap) that lays the two highways, the dock road, 24 pumpjack tracks; the riverside (docks, fishers' stilt houses, farms, lane); `NAV` walk graph and `NAV.roadEnds` |
| `40-ground.js` | ground canvas + category mask (`maskAt`) |
| `64-locus-*.js` | the Locus kit (see LOCUS-KIT-NOTES.md) + `64-locus-infra.js`: warehouse, fishing dock, and the culture/type tags applied to every Yuni asset Locus places |
| `68-place.js` | placement: scheduled sites, bridges, refinery-yard clutter, market, park, frontage/back-lot fill to ~2,650 people |
| `69a*/69c*` | the eastern-abyss biome kit, ported unchanged except one API addition (below) |
| `69b-locus-biohost.js` | the host binding: footprint raster `LOCUS_FP`, mask, LOD spine |
| `69z-locus-flora.js` | plants the biome; **town trees** (see below); inspector tags on biome meshes |
| `72-lights.js`, `75-terrain.js`, `76-locus-anim.js` | lamps, terrain + water + road ribbons, pumpjack animation |
| `83-locus-fauna.js` | ambient fauna (self-contained) |
| `84-life.js` | the life layer |
| `87-pathviz.js` | the path devtool (Voth's) |

## Town trees (the shorter jungle / marsh species inside the city)

`69z-locus-flora.js` computes `EASTABYSS.SITES` before the biome builds: street verges (boulevards and ring
thicker), the park (dense), round the market, and a thin scatter through yards — every site clear of the
footprint raster by its crown and off streets, plazas, water and fields. Species (index in
`EASTABYSS.SPECIES`) with height caps: fan palmetto 8 (11 m), salt cycad 4 (8 m), shelf umbrella-tree 9
(12 m, crown ≤ 6 m), Calamophyton 12 (9 m), Sanfordacaulis 13 (12 m), jade shrub 10 (4 m), stilt-wood 7
(11 m). ~290 trees. The biome side is a generic extension in `69c2`: `EASTABYSS.SITES = [{x,z,sp,H?,crownR?}]`
are planted exactly there (H / crownR cap the draw); the build result reports `hostSites`. Each is a
separate biome tree with the biome's tags in the inspector, not part of any building.

## Life layer (`84-life.js`) — Voth's pattern

Three routers: street A* over `NAV` (binary heap; width as an edge attribute — caravans need ≥ 7 m, with
a no-width fallback), water-grid A* over `RG` river/lake cells for the boats (jetties barred, string-pulled
by line of sight), land-grid A* for the lizard riders (lake barred, rivers waded dearly, streets only
inside the town). Collision: Voth's separation steering over a spatial hash, real-position-first then
look-ahead, asymmetric give-way by priority (riders 4 › caravans 3 › carts 2 › people 1), applied as a
decaying offset from the route.

| population | count | behaviour |
|---|---|---|
| townspeople | 170 | ramble between market, park, shops, taverns, civic buildings, the refinery ring, the caravanserai and home; go indoors at home |
| Geomancers | 56 | brown uniform + canvas pack; work the refinery, tanks, pumpjacks (walking the tracks), the chapterhouse, the warehouse, 06:00–18:30 |
| merchants | 34 | market, warehouse, shops, caravanserai |
| salt-rice farmers | 12 | work legs INTO the paddies, bent over |
| fishermen | 14 | walk to their dock, board their boat (moored alongside the jetty), sail to fishing spots on the river and the lake, fish, come home before dusk |
| carts | 20 | warehouse / market / refinery / caravanserai / docks / shops |
| caravans | 5 | in from a highway end, through the gate passage into the caravanserai court, rest, out the same road; some start in the court, some on the road |
| lizard riders | 1 squad / 60 s | 6 riders from a random map-edge point, cross-country, single file in town, halt in a line in the court, leave by another edge; one squad is 90 m from the court at load |

Debug: `_life.debug()`, `_life.look(i)`, `_life.lookSquad()`, `_life.lookBoat(i)`, `_life.lookFarm()`,
`_life.squads()`, `_life.boatsState()`, `_life.corridors()`, `_life.routeFailures()`. Path devtool
layers: `life_rambler`, `life_merchant`, `life_geomancer`, `life_farmer`, `life_fisher`, `life_cart`,
`life_caravan`, `life_boats`, `life_riders`. Inspector: every instance reports `… — life layer · …`.

## Fauna (`83-locus-fauna.js`)

| species | tags | where |
|---|---|---|
| salt-lake flamingo | hypertropic/tropic · wet · abyssal · riparian: both | ~170 in 9 wading flocks (delta mouths, lake shallows), feeding or standing; two flying skeins |
| marsh emu | tropic · mild/wet · abyssal · riparian: no | mobs of 3–7 on dry ground 650–2500 m out |
| frilled lizard | hypertropic/tropic · mild/wet · abyssal · riparian: no | 60 singles on dry open ground at the town edge; frill opens when the camera comes within 25 m |

Needs only `terrainH`, `lakeDist`, `riverDist`, `LOCUS_FP`, `maskAt`, `camera`, `scene`, `TICKS`.

## Verification

`python3 verify.py locus.html --out DIR --hour H --views "…" --wait MS --shot-eval "()=>…" --eval "()=>…" --assert`
(`--shot-eval` runs JS then screenshots `evN.png`; `--wait` lets the sim run first). Headless SwiftShader
runs at a few fps, so the sim moves slowly there.

## The Ancients port was removed (Sep 2026)

Locus inherited Yuni's `61-ancients.js` (262 KB: the Ancients kit port, its `ancient_*` assets and furniture)
when it forked the Yuni engine, but never placed any of it: no layout schedules an `ancient_*` key and the
kit sheet lists only Locus's own kit. Removing it leaves `locus.html` and `locus-kit.html` building the same
static scene (identical mesh, instance and triangle counts and instance transforms; only the animated life
layer differs between any two runs) and cuts `locus.html` from 1.08 MB to 0.82 MB. To place an Ancient
building in Locus later, vendor the parts from `kits/ancients/` rather than restoring the old port.
