# Krator Ancient Port — API (the contract as built)

`CONTRACT.md` is the law; this is how it is implemented and what you call.
Everything the ancients kit's `API.md` says about the instancing kit, the
surfaces, materials, `REGISTER`, `holeFn`, `HOLES`, `repairPass`, day/night
and the r128 pitfalls still holds here; this file covers what is new.

## Axes, levels, frame

* **x** along the coast, **z** land (-) to sea (+), **y** up. **Sea level is
  y = 0.** Every deck is at **`PORT.DECK` = 6**.
* A segment's local origin is the centre of its quay line at sea level. Its
  footprint is x in [-W/2, W/2] (W = `PORT.W` = 220 always), z in [-LAND, SEA]
  (LAND <= 120, SEA <= 420).
* Buildings, cranes, ships and props stay `PORT.CLEAR` = 8 m inside the x
  edges and the z extremes (`port-clearance` reports REGISTER volumes that
  do not). Decks, walls and paving may run to the edge.
* Constants: `PORT = {DECK:6, W:220, SEA0:0, SEABED:-30, CLEAR:8, LAND_MAX:120,
  SEA_MAX:420, BERTH:-16}`.

## Fragment order

| files | what |
|---|---|
| `00`-`69` | copied from `voth/ancients/src` (see README) — the kit, materials, `REGISTER`, salvage |
| `70-port-core.js` | `PORT`, registry, layouts, vessel hook, `pbAdd` batching, `boxUV`, `portH`, views |
| `71-port-terrain.js` | natural coast, stamps, `terrainH`, terrain mesh, the sea, underwater fade |
| `72-port-kit.js` | the `pk*` kit items and their materials |
| `73-port-edges.js` | paving, quay wall, revetment, side closure, deck on columns |
| `74-port-dress.js` | containers, container houses, lamps, rails, boats, people, stalls, gardens, sheds |
| `75`-`88` | **segments and vessels, one fragment each** (anchors: `80-pq-quay.js`, `81-pp-pier.js`) |
| `89z-rows.js`, `91z-views.js` | per target: `TITLE`, `PORT_LAYOUT_DEF`; `VIEWS` |
| `90-scene.js` `91-probe.js` `92-camera.js` `99-tail.html` | scene loop, probe, camera, tail |

Your fragment must sort after `74` and before `89z`. Materials you define at
top level must be in `MAT` **before `90-scene.js` runs** to get the
underwater fade (see "Materials").

## Seed blocks

| block | owner | fragment number |
|---|---|---|
| 19990 | terrain nature scatter (`71`) | — |
| 20000-20099 | anchors: `quay` 20000+d, `pier` 20010+d | `80`, `81` |
| 20100-20199 | agent 1 | `82-...` |
| 20200-20299 | agent 2 | `83-...` |
| 20300-20399 | agent 3 | `84-...` |
| 20400-20499 | agent 4 | `85-...` |
| 20500-20599 | agent 5 | `86-...` |
| 20600-20699 | agent 6 | `87-...` |

`reseed(N+d)` claims N..N+4; `build.py` fails on any overlap. A second
builder in your fragment takes another `N` from your block (e.g. 20110+d).

## Registration

```js
function buildXxYard(scene,gx,gz,d,opt){reseed(20100+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 ...                                   // local coordinates from here on
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'yard',name:'Ship yard',cls:'seg',W:220,LAND:80,SEA:200,decays:[0,1,3],
  stamps:xxStamps,build:buildXxYard});
```

* The builder is a **top-level `function build...`** opening with `reseed`,
  passed as `build:` — `build.py` rejects a fragment that registers without
  one (its seed check cannot see inside a method). `PORT_SEG(` / `PORT_VESSEL(`
  at column 0 with `key` first; keys are unique across fragments.
* Required: `key name cls W LAND SEA decays stamps build`; vessels also
  `length beam draft`. `cls`: `'seg'` 200 000 triangles per placed decay,
  `'vessel'` 250 000, `'small'` 60 000. Optional `norepair:true` skips the
  d>=3 salvage pass (defaults true for vessels).
* A registration error goes to the on-screen error panel, which fails verify.

`opt` (to both `stamps(opt)` and `build(...,opt)`):
`{key, d, gx, gz, nb:{W:{kind,dz,key}, E:{...}}, slot, run, ctx, W, LAND,
SEA, vessels:[keys], heading}`. `nb.kind` is `'seg'`, `'land'` (natural
coast) or `'sea'` (open water); `dz` = neighbour's z offset minus yours
(negative: the neighbour is set back toward the land). `ctx` is true for the
plain quays flanking your key in the dev targets. `vessels` is the sorted list
of registered vessel keys a berth may show (see "Vessel hook").

Decays: segments `[0,1,3]` (0 intact, 1 ruined, 3 reclaimed). At d>=3 the
scene sets `HOLES = .55` and runs the salvage pass on your group after you
return; add your own reclaimed dressing on top.

## Stamps: the ground, declared before anything is built

`stamps(opt)` returns an array, in LOCAL coordinates:

```js
{kind:'flat', x0,z0,x1,z1, y:PORT.DECK, soft:40, paint:'pave'}   // set to y
{kind:'dig',  x0,z0,x1,z1, y:-16, soft:30}                       // lower to y
{kind:'fill', x0,z0,x1,z1, y:6}                                  // raise to y
{kind:'ramp', x0,z0,x1,z1, axis:'z', ya:6, yb:-2.5}              // y runs ya -> yb along axis
{kind:'dig',  poly:[[x,z],...], y:-4, soft:20}                   // any kind can be a polygon
```

* `soft` - falloff distance back to what was there. `paint` - ground colour
  inside: `'pave' 'soil' 'sand' 'mud' 'grass' 'rock' 'dry' 'shelf'` (a flat at
  deck height defaults to `'pave'`). `dry:true` - no sea surface over it (a
  dry dock pit). `outside:true` - only for `portEdgeStamps`' strips.
* **Must not call `rng()`** (stamps run before any reseed). Use `portHash(a,b,c)`.
* Stamps may depend on `opt.d` (a silted berth at d=1) and `opt.nb`.
* **Hard shapes must lie inside your footprint** (`port-stamps-inside-footprint`
  fails otherwise); soft rings may spill over — that is how you blend.

**Stamp order (defined).** 1. Natural coast. 2. Every stamp's soft ring,
outside its shape, in stamp order (placement order, then array order), each
blended toward its target on the height so far. 3. Every stamp whose shape
strictly contains the point, in order, each op on the previous result: **the
later stamp wins** (a fill after a dig raises it back). 4. A point **on** a
shape edge (5 cm) takes the **lowest** height found 12 cm either side along x
and z: every land/water cliff falls on the high side, inside the wall that
stands there, while two raised areas that abut stay flush.

Consequences you design with:
* Put the quay wall's FACE exactly on the rect edge; its thickness (2.5 m
  default) hides the 0.3 m-wide ground cliff behind it.
* Two raised shapes meeting where a dig also has its edge (a mole's root on
  the quay line) — overlap the raised ones by >= 1 m (the pier's mole starts
  at z=-2) or the boundary rule cuts a trench along the seam.
* The terrain grid has vertices on every rect edge and 0.3/1.5/5 m either
  side. **Polygon edges are not grid-aligned**: use polygons for soft shaping
  (bars, beaches), rects under walls.

`terrainH(x,z)` (WORLD coords) returns the final stamped height after the
terrain is built, i.e. inside every builder. **`portH(lx,lz)`** is the same
in your LOCAL frame (adds KOFF) — use it. Do not use the ancients' `trees()`
(it samples at local coordinates); use `portTrees`. The ancients'
`figures()` stands people at y=0; use `portFigures`.

## The helpers (all LOCAL coordinates, all use your seeded `rng()`)

Edges (`73`):
* `portPaving(G,x0,z0,x1,z1,d,o)` - 4 m slab paving at DECK+0.03. d=1: 22 %
  of slabs gone in patches (give the apron stamp `paint:'soil'` at d>=1);
  `o.hole(x,z)` cuts it round a basin; `o.y`, `o.broken`.
* `portQuayWall(G,x0,z0,x1,z1,d,o) -> info` - wall FACE on the line, body
  `o.thick` behind it, from `o.top` (DECK) to below the lowest ground in front.
  Faces n = (-(z1-z0), x1-x0)/L (x -110 -> 110 at z=0 faces +z) or
  `o.face:[nx,nz]`, `o.flip`. `o.cope, o.tide, o.fenders` (spacing, 0 off),
  `o.ladders, o.bollards, o.bollardSet, o.gaps:[[s0,s1]], o.mat, o.bottom`.
  Ruined/reclaimed dressing is automatic. Returns `{L,t,n,yaw,top,yb,
  at(s,off)->[x,z], ladders:[[x,z]], bollards:[[x,z]]}` - moor boats at
  `ladders`.
* `portRevetment(G,x0,z0,x1,z1,d,o)` - riprap skin and boulders over the
  existing ground in a band `o.width` on the face side, between `o.toe` and
  `o.top`. Does not shape the ground.
* `portSideClose(G,opt.nb,d,{z0:-LAND,z1:0})` - finishes both x sides where
  your deck (z0..z1) meets the edge: flush neighbour nothing; neighbour set
  back -> quay wall along your edge; neighbour standing out -> nothing (it
  builds); `land` -> short return wall + revetment round the corner; `sea`
  -> wall along the whole side + revetment at the back corner.
* `portEdgeStamps(opt,{LAND,SEA})` - concat to your stamps: dredges outside a
  `sea` side. Every segment should include it.
* `portDeckOnPiles(G,x0,z0,x1,z1,d,o) -> info` - slab on concrete columns,
  bays `o.bay` along z, `o.collapse:[bay indices]` drops spans into the sea,
  fascia, guard rails. `info.bayZ(i)`, `info.collapsed`, `info.cols`.

Dressing (`74`): `portContainer(x,y,z,yaw,big,d,col,tilt)`,
`portContainerStack(x,y,z,yaw,nRow,nTier,d,o)`,
`portContainerHouse(G,x,y,z,yaw,d,{levels,big,lit,roof})`,
`portLamp(x,y,z,yaw,d)`, `portRail(xa,xb,z,y,d)`,
`portSkiff(x,z,yaw,col,y)`, `portBuoy(x,z,col)`,
`portFigures(x,y,z,n,spread)` (y null = on the ground),
`portWashLine(ax,az,bx,bz,y,n)`, `portStall(x,y,z,yaw,col)`,
`portGarden(x,y,z,w,dp,d)`, `portTrees(x0,z0,x1,z1,n,y,hMin,hMax)`,
`portWeeds(x0,z0,x1,z1,n,y)`, `portRubble(x,y,z,r,n)`,
`portShed(G,x,z,w,dp,h,d,{y,rise,name,doorSide})`. Sheds and container houses
REGISTER themselves.

Kit items (`72`, via `kput`): `pkCont20 pkCont40` (+`R` rusted; length along
x, bottom centre), `pkBollard pkFender pkTyre pkCope pkLadder pkLamp
pkLampGlow pkRail pkSleepers pkBuoy pkSkiff pkSolar pkDish pkAwn pkCloth
pkLine pkGuard pkCol pkPile pkStair pkDoor`. Pivots: standing things at the
bottom centre; fenders, ladders at their top (scale y = length); skiff and
buoy on the waterline (y=0). Instance colour multiplies each.

Utilities (`70`): `pbAdd(geo,mat,parent,noRepair)` - batch opaque geometry
(already in the parent's frame); the scene merges it into one mesh per
(parent, material) when your builder returns. `pbBox(parent,mat,x,y,z,w,h,dp,
yaw,tile,noRepair)`, `boxUV(w,h,dp,tile)` (world-scaled UVs), `pgeo(g,x,y,z,
yaw)`, `pkMergeGeo(geos)`, `portYaw(tx,tz)`, `portCam(tx,ty,tz,az,el,r,night)`.
Mark anything under water `noRepair` (the salvage pass would stick patches on
it).

## Vessels

* Frame: origin **midship on the waterline**, bow toward **+z at heading 0**,
  hull down to `-draft`. `build(scene,gx,gz,d,opt)` gets `opt.heading`
  (radians about +y; PI/2 = bow toward +x). Keep G unrotated at (gx,0,gz)
  with `KOFF=[gx,0,gz]`, put an inner group `H` at G's origin with
  `H.rotation.y=opt.heading`, and build inside `useGroupXF(H) ...
  endGroupXF()` so `kput` items turn with the meshes (kput does not know a
  group's rotation otherwise). `W/LAND/SEA` are required but unused (give
  220/0/0); `stamps` may return `[]`.
* Vessels are never tiled on their own. **Vessel hook**: a berth/slip
  segment calls `const vk=portVesselFor(opt,i)` (null until a vessel exists)
  and `portPlaceVessel(G,vk,x,z,heading,d)`: the vessel is charged to its own
  `'key/d'` budget, the PRNG is saved and restored round it, and it is
  dressed by its own d=3 code (norepair). The pier offers its slip basin
  (x 72, bow out, beam <= 58, length <= 370).
* A vessel's dev target is a segment-target copy with `PORT_ONLY` = the
  vessel key: it is moored off three quays in a dredged pocket, heading +x.
* Reclaimed vessels are inhabited; do your own d=3 dressing.

## Materials, water, night

* Every `MeshStandardMaterial` in `MAT` at scene start gets the **underwater
  fade** (below y=0 it fades to deep water with depth). A material you create
  inside a builder does not: define it at top level in `MAT`.
* The sea is one sheet at y=0 (`MAT.pkSea`); `dry:true` stamps cut it.
* `PORT_NIGHT.push(on=>...)` runs your own night change (lights on, etc.).
  Fire items (`FIREKIT`) already toggle.

## Targets, layouts, views

`build.py` builds every `targets/*/89z-rows.js`. A target sets `TITLE`
(literal string - build.py stamps it into `<title>`) and
`PORT_LAYOUT_DEF`:
* `portLayoutShowcase({decays,gap})` - one run per decay of every segment,
  sorted by key, offsets from `PORT_DZSEQ`, `gap` m of coast between runs.
* `portLayoutSegment(key,{nbdz:[W,E]})` - key per decay between quays.
* `portLayoutEdges(key,{d})` - key against steps +/-40, +/-20, sea, land.
`91z-views.js`: `const VIEWS=portViewsShowcase()` / `portViewsSegment()` /
`portViewsEdges()`, then add your own. The first view is the opening shot;
a 7th element truthy = night.

## Budgets and invariants (`verify.py --assert`)

Showcase soft ceiling 9 000 000 triangles and 900 draw calls; per placed
decay by `cls`; `env` (terrain, sea, natural scatter) 2 500 000. The six
ancients invariants (registered volumes non-empty, no NaN, per-type budget,
showcase triangles, draw calls, registry+bake) plus `port-stamps-inside-
footprint` (hard) and `port-clearance` (soft). Budgets report OVER without
failing unless `--strict-budget`.
