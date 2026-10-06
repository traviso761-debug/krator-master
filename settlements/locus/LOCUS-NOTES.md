# Locus — world build notes (Sep 2026)

Locus is a fork of the Yuni engine (`build.py` concatenates `src/*` into one `BUILD()`), with its own
terrain, layout, placement, life layer and fauna. Three targets: `locus.html` (the world),
`locus-kit.html` (the Locus building kit sheet), `locus-plants.html` (flora catalogue). `publish/` holds
the artifact copies.

## Where things live

| fragment | what it owns |
|---|---|
| `10-core.js` | the world field: `terrainH`, the lake shore (`lakeShoreX`), river / distributaries / canal splines and distance queries, the hill, the strand ridge, the SE hummocks, `LOCUS_FIELDS` (wet/salt/upland/flow), centred noise `nfb`/`nsig` |
| `20-stage.js`, `21-sky.js` | the painted horizon: abyss shelf in the east, far lake shore in the west; `skyFront` redraws the shelf through its silhouette mask after the sun, giant, ring and stars, so the cliff occludes them |
| `30-layout.js` | the schedule (refinery, 3 tanks, both chapterhouses, school, warehouse, caravanserai, rich band, market, park), ring road + 8 crooked avenues + concentric rings + alleys, the ROUTE GRID (`RG`, 12 m cells, A* with a binary heap) that lays the two highways, the dock road, 24 pumpjack tracks; the riverside (docks, fishers' stilt houses, farms, lane); `NAV` walk graph and `NAV.roadEnds` |
| `40-ground.js` | ground canvas + category mask (`maskAt`) |
| `64-locus-*.js` | the Locus kit (see LOCUS-KIT-NOTES.md) + `64-locus-infra.js`: warehouse, fishing dock, and the culture/type tags applied to every Yuni asset Locus places |
| `68-place.js` | placement: scheduled sites, bridges, refinery-yard clutter, market, park, frontage/back-lot fill to ~2,650 people |
| `68c-locus-crossings.js` | (2026-10-01) plank bridges and earth causeways wherever a street-graph edge runs under the water plane; publishes the deck surface through `XING_AT` (read by `bridgeDeckAt`) |
| `71g-locus-grid.js` | (2026-10-01) the generator house's distribution line: poles, crossarms, catenary wires, service drops, electric street lamps; `GRID_EDGE`, `gridNear()` |
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
| salt-rice farmers | 30 | work legs INTO the paddies (the three farms and the nine paddy blocks), bent over |
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

## October 2026: crossings, paddies, the cliff, the town grid

**Pool crossings (`68c-locus-crossings.js`).** Every `ST.edges` edge is sampled every 2 m; a sample is wet when
`terrainH < 0.3` away from the lake, the river channels and the canal (those keep their own bridges). Wet runs are
grouped across edges that meet at a wet node; a group with <= 30 m of open water becomes a plank bridge on piles
(deck 1.05 m), a longer one an earth causeway (crest 0.85 m, battered sides, a stone-headed culvert every ~22 m).
Ends ramp to the bank over 4 m (bridge) / 8 m (causeway). `bridgeDeckAt(x,z)` now falls through to `XING_AT`, so the
walkers, riders, highway ribbons and street lamps all stand on the deck; NAV and RG are unchanged (the routes always
crossed there). `_xings.stats` / `_api.XINGS` report them.

**Paddy blocks (`30-layout.js` 7b, `64-locus-farm.js`).** `farm_saltrice_paddies` (48 x 38, same frame as the farm:
channel at -z toward the water, verge at +z) holds eight paddies (field-detail rice: `salt_rice_stand` variants 2-3, 12 stands a paddy, for the triangle budget); nine are laid on low dry ground 30-110 m from the
river/canal, off every road cell, site and circle, levelled, with a lane to the nearest street node. 18 + 72 = 90
paddies, five times the three farms' 18. They are FARMS (mask 7) but their POI category is `paddy`: farmers work them,
nobody lives in them. `_api.PADDY_FIELDS`.

**The cliff in front of the sky (`20-stage.js`, `21-sky.js`).** `makeSkyTexture` records the shelf's skyline and
paints a half-res silhouette mask (`tex.silMask`). `skyFront` draws the same dome again through it as an alphaMap
(same texture, tint, shader uniforms), renderOrder 50, after everything else in the sky scene. One extra draw call.

**The town grid (`71g-locus-grid.js`).** One pole per electrified edge (ring, boulevards inside 470 m, streets inside
330 m), spans chosen by Kruskal over poles of adjacent edges plus a relayed feeder from the generator's own pole;
only poles reachable from the generator are built. Each pole: crossarm, two insulators, a bracket lamp (cool, in
`NL_LAMPS`). Wires are 5-piece catenaries (`ROD`, sag 2.5% + 0.15 m); up to two service drops per pole.
`72-lights.js` skips its oil posts on `GRID_EDGE` edges and wires every window within 34 m of a pole (cool panes,
later off-times, one in seven all night). `_grid.stats`.


## October 2026 (later): the shared core, and the Geomancers' buggy park

**On the shared core.** The eastern-abyss biome is the canonical one (`core/biome` + `biomes/eastabyss`, read in place by
`BIO_CANON` in `build.py`; the town trees are grown with `EASTABYSS.make` / `grow` after the biome's passes), the mask is
`core/mask` (through `KMASK.xform`), the lake shades with `core/atmos`'s wave field (`90-atmos-host.js`), the plan is
`core/minimap` (`88b-locus-minimap.js`, the M key) and the sky's hour is `core/clock` (`LCLOCK` in `80-camera.js`: held by
default, Run time for a 72-minute day). Mungo reads all of these by name.

**The buggy park** (`PARKING`, 30-layout): an open yard of six bays behind the chapterhouse, a site with no building
(`yard:true`), its gate street joined to the nearest street; gravel and bays painted in 40-ground, two shade shelters and
fuel drums in 68-place, four arc standards in 72-lights. The buggies are the Motor Vehicles kit's (`KratorVehicles`, the
virtual `65y-vehicles-bundle.js`). In 84-life (section 4b): the park is one of the Geomancers' work stops, where each
stands at a parked buggy's bonnet; every 2-5 minutes between 8:00 and 17:00 one of them drives a buggy over the streets to
a highway's end, it is off the map for 1.5-4 minutes, and it comes back (maybe by the other highway) to its bay. Real-time
timers, like this layer's caravans and riders, so trips run while the world clock is held. `_life.buggies()`,
`lookBuggy(i)`, `tripNow()`, `simBuggies(sec)` (steps only the buggies: a full trip in simulated time); `verify.py`'s
`geomancer-buggy-park`. Mungo's buggies do the same on `core/simulation` (`geo_trip`).
