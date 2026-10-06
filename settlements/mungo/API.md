# Mungo — API (the contract for anyone editing a fragment)

Units metres, **x east, z south (north is −z), y up**; the water plane is y = 0. A building's local frame: origin at
its plot centre on the ground, +z its front (the door). Yaw `ry`: local +z points along `(sin ry, cos ry)`
(`faceRy(dx,dz) = atan2(dx,dz)`). The origin is the bridgehead (`HUB`, the market's centre is at (22, −6)).

## The layout's records (30-layout.js, no geometry)

| Name | What |
|---|---|
| `SITES_L` / `schedule(key, v, x, z, ry, w, d, name, tag, extra)` | every scheduled building; `extra.alt` a fallback key, `extra.water` a dock standing in the lake; `S.rec` the built record, `S.placedKey` the key actually built, `S.placeId` the SIM place |
| `MARKET` `{x,z,r,rim}` · `SHOPS[]` · `LANDING` · `QUAY[]` | the bridgehead |
| `MAIN_STREET {nodes}` · `JUNCTION` · `NORTH_ROAD[]` · `SOUTH_ROAD[]` · `GEO_ROAD[]` | the laid streets |
| `HEADMAN` `CARAVANSERAI` `INNS[]` `WATCH` `WAREHOUSES[]` `FISH_WAREHOUSE` `SALT_MERCHANT` | the town's sites |
| `GEOCHAPTER` `GENERATOR` `FUELSTATION` `YUNI_HOUSES[]` `PARKING {x,z,w,d,ry,node,bays}` | the Geomancers' quarter |
| `REED {islands[{id,x,z,rx,rz,seed,cluster,buildings[{key,v,x,z,ry,name,door}],nav}], pads[], bridges[[i,j]], padBridges[[pad,i]], docks[], boats[], clumps[], pontoon, tavern, islandR(I,a), onIsland(x,z,pad), onPad(x,z,pad), doorNodes[], padNodes[]}` | the reed village, in WORLD x,z; built by the reed kit in `65r` |
| `REED_Y` (0.45) · `REED_FOOT {key:[w,d]}` | the reed island top above the water; the reed defs' footprints |
| `PONTOON {a, b, w, nodes}` | the one bridge to the land |
| `ST {nodes, edges, hub, landing, hwyN, hwyS, roadEnds, grown, report}` · `ST_CLASS` · `stNode stEdge stChain` | the street graph (Locus's contract; classes `highway main quay road street alley lane track`) |
| `RG` · `rgIdx rgX rgAStar roadCost rgPolyline` | the 12 m route grid (W: 0 dry, 1 river, 3 lake, 4 pool; H; ROAD; BLOCK) |
| `HIGHWAYS[]` `BRIDGES[]` `FARMS[]` `PADDY_FIELDS[]` `DOCKS[]` `LOGGING[]` `FORAGE[]` `FISH_WATER[]` `SHORE_FISH[]` `PORTS{}` `YARDS[]` | the countryside and the map edge |
| `NAV {nodes, edges, adj, hub, reachable, roadEnds}` · `navNode navEdge` | the walk graph: streets (`ground`), the reed decks (`deck`), the pontoons (`pontoon`), door nodes |
| `districtAt(x,z)` · `cityGround(x,z)` · `nearestStreet` · `onStreet` · `bridgeDeckAt` · `siteFront(S, out)` · `inSiteRect inAnySite segHitsSite inCircle inYard` | queries |

## The terrain (10-core.js)

`terrainH(x,z)`, `lakeShoreX(z)`, `lakeDist(x,z)`, `RIVER` / `riverDist` / `riverQuery` / `riverAt` / `riverHalfAt`,
`terraceK`, `forestK`, `eastRise`, `MUNGO_FIELDS` (= `LOCUS_FIELDS`: wet salt upland flow for the biome),
`TERRAIN_PADS / RECTS / MOUNDS` (levelled sites), `MAP_R` 1150, `CITY_EXT` 780.

## The reed kit (01-reedkit.html, 65r, src/reed/)

`REEDKIT = REEDKIT_MAKE(host)`; `REEDKIT.build(REED)` → `{root, placed[{b,key,r0,r1}], missing, reg, instances, lamps}`;
`REEDKIT.setNight(on)`, `defs()`, `has(key)`, `foot(key)`, `REG`, `KIT`, `RL`. Inside the function the reed kit's own
names (`VERN`, `hnSub`, `hnRL*`, `kput`, `kbake`) are all there is. A new reed def goes in `settlements/reedlake/src`
(the kit), never here; Mungo places it from `REED`.

## The simulation (core/simulation; 78b, world/*.json, 84)

`SIM` (see `core/simulation/SCHEMA.md`). Mungo's layers: `pedestrian`, `road` (the same graph, ground edges only),
`water`, `animal` (grids on `RG`). Its place kinds: `home_reed home_shore home_town home_yuni farmstead hall watch
chapterhouse barracks_reed shrine` (homes) · `market shop food_shop builders_yard fish_market inn tavern caravanserai
warehouse reed_warehouse weaver smithy` · `post geo_square parking fuel generator commons longhouse spirit_circle
watchtower dock` · `field reed_garden logging grove fishing_water shore_fishing`. Ports: `north_highway
south_highway east_country northeast_country southeast_country north_country south_country`.

`MCLOCK` (80-camera.js) is the world clock (`core/clock`): `MCLOCK.hour/day/t`, `run()`, `set(h)`; `_dbg.setHour(h)`,
`_dbg.runTime(on)`.

## The furniture and the interiors

`FURNISH(key, lx,ly,lz, lry, o)` inside an ASSET builder (Locus's glue, 66-locus-furnish.js). `?interiors=1`
plans and furnishes every building with an interiors item: Locus-engine buildings through `buildAsset`, the reed
buildings through `65r`'s finisher. Sets bundled: `locus abyss reedlake yuni`.

## Fragment rules (build.py)

A generative fragment opens with `reseed(N)` (unique N); colour arrays only in `05-palette.js` / `05b-mungo-palette.js`;
no top-level name in two fragments; a fragment that is one IIFE is exempt. `--list` shows where each comes from.
