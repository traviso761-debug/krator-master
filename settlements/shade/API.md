# Shade: the contract

What a later pass (the building kit, the walking population) may read and must
respect. Units are metres; **x east, z south, north is −z**; y up. A person is 1.75 m.

## Layout (44-host-layout.js): read-only

| Name | What |
|---|---|
| `terrainH(x,z)` | ground height (memoised one point deep) |
| `waterH(x,z)` | the local water surface there, `-1e9` where there is none |
| `basinD(x,z)`, `wallW(x,z)` | signed distance to the floor's edge (negative on the floor), and the wall face's horizontal width there |
| `kSouth`, `kLip`, `kSwitch` | 0..1: how much a point is in the carved face, the lip, the switchback slope |
| `terrainBase(x,z)` | the ground without the carve patches' recesses (a patch's rock top) |
| `BASIN.r` | each corner's radius `{nw,ne,sw,se}`; `basinD0` is the rounded, bulging floor edge, `basinD` adds the patches' recesses |
| `CONTOUR`, `footRun(a,b)` | the traced foot of the wall, clockwise `[x,z,nx,nz,s]` (n out of the rock), and a stretch of it |
| `CLIFF_RUNS` | the cliff-dwelling runs: `{id,a,b,out,rows,tower,path,len}`; each is a 'wall' place whose `facade.pts` is its foot |
| `ALCOVES`, `BIO.carve.patches` | the alcoves (`run`, `s` along it) and every carve patch; `BIO.carve.covered/topAt/rockAt` for what is over a point |
| `BASIN`, `POOL`, `TERR`, `LIPX` | the basin's box, the pool `{x,z,r,y,depth}`, the map, the lip's top edge |
| `zS(x)`, `WLL(x)`; `zU(x)`, `WLU(x)` | the lower and upper streams' centrelines and surfaces |
| `zC(x)`, `cW(x)` | the canyon's centreline and half-width (x > 100) |
| `SWB` | the switchback: `pts` `[[x,z,y],...]`, `len`, `grade`, `legs`, `half` (flat half-width 1.6), `bank` (3.5) |
| `swNear(x,z)` | `{d,y}`: distance to the switchback's centreline and its height there, or null |
| `PLACES` | every place: `{id,name,kind,poly,activities,capacity,tags,facade?}`; a facade is `{a,b,face}` or `{pts:[[x,z,nx,nz],...]}` |
| `PORTS` | the edges a traveller arrives from or leaves by |
| `polyHas`, `polyDist`, `polyCentre` | polygon helpers on `[x,z]` lists |

## Places: the building pass builds INTO these

A place's polygon is already reserved: no plant roots inside it, or within 3 m of it,
and the probe proves it (`no-flora-in-reserved-places`). Build inside the polygon;
if a building needs more room, **change the polygon in 44** and rerun the checks.
Do not place a building outside every place.

| kind | rule (checked by 91-probe) |
|---|---|
| `ground` | flat (grade ≤ 0.2 over 1 m) and dry on a 2 m grid |
| `wall` | has `facade:{a,b,face}`: the line `a→b` lies at the foot of a sheer face (≥ 30 m of rise within 4 m); `face` is the outward normal `[nx,nz]` |
| `shore` | touches the water: some of it wet, most of it dry |
| `plateau` | flat and dry, up top |

Building tags (README): `culture:'eastern-nomad'`, `types:[...]` from civic,
market/shop, tavern/inn, industry, farm, single-family dwelling, multi-family
dwelling, infrastructure, religious, funerary. Each place carries the types its
buildings should have.

## The building kit (77a-e) and the plan (44, 80)

Every builder is host-free (THREE and the DOM only; `build.py` greps the 10..79
range for host names) and returns a `THREE.Group`, base at y = 0, front facing +z,
with `userData = {kind:'building', name, culture:'eastern-nomad', types, footprint, height, family, seed}`.
A wall-backed piece has its back plane at z = 0 (the plan sets it 1 m inside the face).

| Builder | Family | Notes |
|---|---|---|
| `buildTreasury({width,height,niche,seed})` | treasury | the Khazneh: two orders, tholos, broken pediment; in a niche of wedge cheeks and a hood unless `niche:false` (the host cuts a real one, a carve patch) |
| `buildCrowTomb({width,height,ledge,seed})` | tomb | a Hegra house front: pilasters, two cornices, crow-steps, a pedimented door |
| `buildRockStair({run,rise,width,dir,seed})` | stair | steps cut along the face, rising toward +x (dir 1) |
| `buildLedge({length,depth,seed})` | ledge | the gallery an upper row stands on |
| `buildPuebloCompound({cx,cz,cell,storeys,seed})` | pueblo | a U of rooms stepping down to a plaza at +z; `userData.cells`, `plaza` |
| `buildCaravanserai({w,d,seed})` | khan | walls, towers, a pishtaq gate at +z, arcades, rooms, a well; `userData.ring`, `gate` |
| `buildBlackTent({w,d,poles,seed})` | tent | goat-hair roof sagging between pole peaks, ropes, a rug and a hearth |
| `buildMarketStall({w,d,dye,seed})` | stall | four poles, a striped awning, a counter and its goods |
| `buildCliffPueblo({length,rows,storeys,cell,tower,climb,seed})` | cliffpueblo | rooms against a cliff (back at z = 0), stepping down to the floor; rubble stone and plaster; a tower in front; `climb:false` (under an alcove's ceiling) keeps the back rooms from climbing the face |
| `buildPuebloTower({storeys,round,radius,seed})` | tower | a round or square watch tower |

Materials (`NOMAD.MAT`): `stone` (the host's strata: `NOMAD.useStrata(BIO.strata())`, so a
carving shows the bed lines of its face; level bands without one), `adobe`, `cloth`,
`canvas`, `wood`, `dark` (openings). Tints are sRGB hex,
converted to linear by the collector. Textures tile in metres.

`SHADE_PLAN.plans` (44): `{id,family,placeId,x,z,yaw,lift,group?,access?,inAlcove?,inNiche?,params}`
(a building in an alcove is checked against its ceiling, not the rock behind it, and its tint takes the hood's shadow);
`SHADE_PLAN.rejected` counts what did not fit (a `*_short` entry fails the probe).
80 builds every plan before the walkable grid (84) and publishes `BUILDINGS.records`
(world footprint, the cells the grid blocks, the door, base and lift) and
`BUILDINGS.meshes` (one per material). To add a building: add a plan in 44; to add a
family: a builder in 77, an entry in 80's `BUILD` table and its nav/door rule.

## Hooks

| Name | What |
|---|---|
| `REGISTER({name,cls,x,z,y,r,h,tags})` | a volume the inspector names on hover (cls: building, flora, fauna, place, water, terrain); 80 registers every building |
| `TICKS.push(fn(dt,t))` | per-frame work |
| `OBSTACLES.push({x,z,r,y0,y1})` | a cylinder nothing grows inside (the biome reads it) |
| `LIFE` | `ACTIVITIES`, `FACTIONS`, `JOBS` (schedule per hour), `PEOPLE`, `EVENTS`, `NAV`, `route(ax,az,bx,bz,block)`, `reach(x,z,block)`, `offering(activity,x,z)`, `ROUTES`, `OUT` (the checks' results) |
| `OVERLAY` | the overlay groups; `ribbonPath(pts,w,color,closed)` for a new one |
| `window._api` | the probe: `shadeChecks()`, `shadeNegatives()`, `totals`, `typeStats()` |

## Budgets (91-probe.js)

Scene ≤ 6.0M triangles and ≤ 120 draw calls at the first view; any one biome pass
≤ 3.5M. Measured at this pass: ~2.6M triangles, 48 calls, 112k instances, built in ~1.2 s.
