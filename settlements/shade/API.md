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
| `BASIN`, `POOL`, `TERR`, `LIPX` | the basin's box, the pool `{x,z,r,y,depth}`, the map, the lip's top edge |
| `zS(x)`, `WLL(x)`; `zU(x)`, `WLU(x)` | the lower and upper streams' centrelines and surfaces |
| `zC(x)`, `cW(x)` | the canyon's centreline and half-width (x > 100) |
| `SWB` | the switchback: `pts` `[[x,z,y],...]`, `len`, `grade`, `legs`, `half` (flat half-width 1.6), `bank` (3.5) |
| `swNear(x,z)` | `{d,y}`: distance to the switchback's centreline and its height there, or null |
| `PLACES` | every place: `{id,name,kind,poly,activities,capacity,tags,facade?}` |
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

## The builder contract (for the building kit)

Each family is one standalone function, with no terrain, scene or global in it:

```js
buildPetraFacade({width, height, depth, seed})  // a THREE.Group, base at y=0, front facing +z, its back plane at z=0
buildFairyChimney({height, radius, seed})
buildPuebloBlock({w, d, storeys, seed})
buildHairclothTent({w, d, seed})
// each returns a Group with userData = {kind:'building', name, culture:'eastern-nomad', types:[...], footprint:[[x,z],...]}
```

The host places them: it rotates +z onto the place's `facade.face` (or the facing
the place wants), sets the base to `terrainH`, pushes `OBSTACLES` and `REGISTER`s each
one with `cls:'building'` and its tags, all **before** `SEDESERT.build` in 88.

## Hooks

| Name | What |
|---|---|
| `REGISTER({name,cls,x,z,y,r,h,tags})` | a volume the inspector names on hover (cls: building, flora, fauna, place, water, terrain) |
| `TICKS.push(fn(dt,t))` | per-frame work |
| `OBSTACLES.push({x,z,r,y0,y1})` | a cylinder nothing grows inside (the biome reads it) |
| `LIFE` | `ACTIVITIES`, `FACTIONS`, `JOBS` (schedule per hour), `PEOPLE`, `EVENTS`, `NAV`, `route(ax,az,bx,bz,block)`, `reach(x,z,block)`, `offering(activity,x,z)`, `ROUTES`, `OUT` (the checks' results) |
| `OVERLAY` | the overlay groups; `ribbonPath(pts,w,color,closed)` for a new one |
| `window._api` | the probe: `shadeChecks()`, `shadeNegatives()`, `totals`, `typeStats()` |

## Budgets (91-probe.js)

Scene ≤ 6.0M triangles and ≤ 120 draw calls at the first view; any one biome pass
≤ 3.5M. Measured at this pass: ~2.6M triangles, 48 calls, 112k instances, built in ~1.2 s.
