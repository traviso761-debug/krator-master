# Post-Apoc set: generator contract

The Post-Apoc set is a generic building kit for settlements built from RECLAIMED and RECYCLED material: silos, shipping containers, storage tanks,
buses and trailers, arcology bulkheads (the reclaimed large objects), used alone or fused with outbuildings and additions of sheet metal, earth-filled
tyres, timber, and glass or plastic bottles. It is culture-neutral. Each building declares **sockets**; a **culture pack** (`src/80-cultures.js`)
fills them (Iziz orange striped awnings, Voth banners, Republic triskelion). Not to be confused with the Ancients' reclaimed buildings: this set is
called **post-apoc** everywhere (folder `kits/post-apoc`, def tag `culture: 'post-apoc (generic)'`).

```
cd kits/post-apoc && python3 build.py                                  # -> dist/post-apoc.html (build checks + node --check)
python3 verify.py dist/post-apoc.html --assert --views "Shops,Food shop — eye level" --out <scratch>/shots
python3 verify.py dist/post-apoc.html --only shop-food --culture iziz --cam=-12,6,20,0,3,0 --out <scratch>/shots
```
`--only key,key` builds only those defs (fast). `--culture generic|iziz|voth|republic`. `--eval "()=>window._api.footprints()"` prints anything.
Views: `Opening`, `Overview`, one per family row (`Shops`), one per building `<Name> — eye level`. Read every screenshot. Never open `dist/`.

## Units and frames
Metres, 1.75 m person. `x` east, `z` south, `y` up. A building's local frame: origin = plot centre on the ground, **+z = front** (door side, faces the
street), x right. `place(key,x,z,ry,o)` moves this frame; `W(x,y,z,ry,fn)` enters a sub-frame inside a builder (ry turns about y; local +x -> (cos ry, 0, -sin ry)).
Each def declares `w` (x extent), `d` (z extent), `h`. The measured world bbox must fit `w+2.2 x d+2.2` and `h+4` (verify --assert). Declare honestly.

## A building def
```js
// prefix: xx                      <- first line of every 4x-7x fragment; every top-level name in the file starts with xx
defBuilding({key:'shop-food',name:'Food shop',seed:4610,tags:{type:['market/shop'],size:'small',core:'shipping container',materials:[..]},w:14,d:12,h:6,build:xxFoodShop});
function xxFoodShop(o){ ... }      // o.v = variant number (0..); place() already reseeded (seed + v*7). Use only rng()/rr()/pick(); NEVER Math.random.
```
* Keep the order `key, name, seed, tags, w, d, h, build` (build.py reads the seed after the key). `seed`: unique four-digit block from your range in the brief. All randomness through `rng()` `rr(a,b)` `pick(list)`. Seeds are per building.
* `tags.type` (README rule): one or more of `civic, market/shop, tavern/inn, industry, farm, single-family dwelling, multi-family dwelling, infrastructure, religious, funerary`.
  Also give `size`, `core` (the reclaimed object), `materials`. `culture` and `sockets` are added for you. `budget:N` raises the triangle limit (default 120000).
* A builder never names a culture. Declare sockets; keep every awning/banner/flag/emblem/sign out of the geometry itself.
* Supply `o.v` variants where it is cheap (mirror, colour, add-ons). Variant 0 is the showcase.

## Sockets (`sock(type,x,y,z,ry,opts)`), frame: origin at the anchor, +z OUT of the surface, +x along it, y up
| type | opts | meaning |
|---|---|---|
| `awning` | `w d drop h` | canopy over a door, stall, window. Anchor = top edge against the wall (y = top of opening + ~0.1); slopes down `drop` over depth `d`; posts `h` tall |
| `banner` | `w h` | cloth hung from a pole/beam/wall; anchor = top edge, hangs down `h` |
| `flag` | `w h` | pennant on a pole; anchor = top of pole |
| `emblem` | `w h` | flat plate/painted field on a wall (a cultural badge, triskelion...), centred on the anchor |
| `sign` | `w h trade` | shop board centred on the anchor; `trade` is its text ('FOOD', 'ARMOR', ...) |
| `paint` | `w h` | large panel a culture may band or stripe (currently unfilled; declare where a livery would go) |
**Every building declares at least: one `awning` (or `banner` on a windowless type), one `banner` or `flag`, and one `emblem`.** Shops declare a `sign` and one awning per
service opening. Big buildings (chief, mess, longhouse, arena, compound gate) declare several of each. Sockets must sit where the thing would really hang:
give the pole, beam or wall it needs (the socket draws only the cloth/plate and, for awnings, its posts). Test with `--culture iziz`, `voth`, `republic`: a socket floating in air is a bug.

## Engine (30-geo.js) primitives: all draw in the current frame, all merged (16 draw calls for the whole set)
```
box(mat, x,y,z, w,h,d, colour, ry,rx,rz)      BASE-anchored (y = underside). rotations about the box centre
cyl(mat, x,y,z, r,h, colour, seg, rTop, wrap) vertical, base at y; wrap=true makes corrugation follow the surface (silos, drums)
cylH(mat, x,y,z, r,L, colour, 'x'|'z', seg, wrap)   horizontal cylinder centred on (x,y,z)
cone(mat, x,y,z, r,h, colour, seg)  sph(mat, x,y,z, r, colour, yScale)  tire(x,y,z, R,t, colour, ry,rx,rz)  (axis vertical; rx=PI/2 stands it up)
beam(mat, [x,y,z],[x,y,z], w, colour, round, seg)   pipe(mat, [pts], r, colour)   (no-roll basis: safe for any direction)
roofP(mat, x0,x1, zLow,yLow, zHigh,yHigh, th, colour)   plane4(mat, p0,p1,p2,p3, th, colour)   quad/decal (flat, two-sided)
poly(mat, [[x,y,z]...], colour, double)   prism(mat, [[x,z]...], y0,y1, colour)   sector(mat, cx,cz, r0,r1, a0,a1, y0,y1, colour)  (curved walls)
wallOpen(mat, x,y,z, w,h,th, [{x0,x1,y0,y1}], colour, ry)     a wall with real rectangular openings
spin(x,y,z, ry, 'x'|'y'|'z', rate, fn)     parts that turn (turbine rotor, fans): fn draws about the pivot. Rate in rad/s.
W(x,y,z,ry,fn)   sbBegin/sbEnd are internal.   terrainH(x,z) = 0 now; always use it for ground contact of anything placed far from the origin.
```
Materials (`mat`): `corr` (vertical-rib galvanised/painted sheet, tile 0.8 m) `corrH` (horizontal ribs: silos, drums) `cont` (container ribs) `sheet` (patchwork flat sheet)
`plank` (horizontal boards) `wood` (posts, beams, logs, grain vertical) `earth` (rammed earth, plaster) `conc` (Ancient ceramic/concrete panels) `iron` (structural steel, pipes)
`bottle` (bottle-glass wall, carries its own colours: pass colour null) `rubber` (tyres) `cloth` (tarps, hides, sacks; two-sided) `chain` (chain-link, alpha) `glass` (transparent panes)
`water` (a plate at y=0.05 over the ground: the dock's harbour; colour ~0x3a6a70) `glow` (unlit: lamps, fire, lit windows) `plain` (untextured paint: leaves, soil, rope). Colours are sRGB hex through `jc(hex,jitter)` (jittered) or `P('rust'|'paint'|'galv'|'wood'|'woodD'|'cloth'|'tarp'|'grey'|'glass'|'black'|'conc'|'bone')`,
`PAINT()` (container livery: culture-aware). UVs are world-unit so a texture never stretches; box-projected on the dominant axis.
Never use a different colour space: pass hex numbers to `jc`, never `new THREE.Color`.

## Reclaimed cores (32-cores.js) and additions (34-adds.js). READ THESE FILES before writing a building
Cores: `container({len:6.06|12.19,hi,col,open:'front'|'end'})` (long axis x, +z front; sizes in `CT`), `silo({r,h,col,roofCol,rise})`, `tankV({r,h})`, `tankH({r,L})`, `bus({len,col})`,
`semi({trailer,col,tcol})`, `bulkhead({w,h,th,hatch:'round'|'door'})` (Ancient white ceramic slab, hatch or doorway). Each draws in the current frame centred on the origin, base at y=0: `W(x,0,z,ry,()=>container(...))`.
Additions: `door win porthole patchWall plankWall sheetWall bottleWall tireWall tireRing gableRoof leanRoof tarp deck stairs ladder stovepipe solar barrel crate sacks pallet lamp fire
tireStack junkPile antenna fenceRun bottleString waterButt`. Appliqué doors/windows (`door`, `win`) sit ON a wall facing +z at (x, y=sill, z=wall face); use `W(...)` with ry to put them on other faces.
Real openings (an open-fronted shop, a walk-in porch) need `wallOpen` or a core with `open:'front'`.
If you need a helper twice, add it at the top of YOUR fragment with your prefix. If you think the ENGINE (files 10-36, 80, 9x) needs a change, do not edit it: describe it in your report.

## The look
Fused, patched, lived-in, bright junk-colour: faded livery paint (rust red, teal, mustard, olive) against galvanised grey and weathered timber; patchwork; things lashed on in layers
with lean-to roofs, decks, ladders, stovepipes, solar panels, water butts, tyre stacks, hanging bottles, rag awnings. Read the reference sheets (`refs/sheet0-3.jpg`, index in `refs/INDEX.txt`): the silo-house with a
wrap porch, container stacks with colour blocks, the tank-tower tenement with pipes, tyre-wall earthships with bottle-glass windows, corrugated arch huts, the bus, the crane-and-cage arena, the pier of barrels and boats.
Silhouette first: from 50 m each building must read as its own thing (a silo with a hat, a stack of boxes, a tower on stilts). Then up close: doors, windows, steps, junk at the feet.

## Rules
1. Edit only the fragment file(s) named in your brief. Work in YOUR OWN COPY of the kit folder (the brief says where); copy your finished fragment(s) back into `kits/post-apoc/src/` at the end. Never edit the shared engine files.
2. `python3 build.py` must pass (unique top-level names via the prefix, unique seeds, `node --check`). Verify with `--only` and read screenshots from at least three angles (eye level front, 3/4 overview from ~1.6x the building height, one close-up on a detail), in generic plus one culture pack. Fix what you see.
3. Budget: <= 120,000 triangles per building (compound/arena/dock: `budget:240000`). Use `seg` counts of 8-12 for small round things.
4. Everything grounded: nothing floats; posts reach the ground (or a base); roofs sit on walls; awning posts reach the ground. Check with a low side view.
5. Report: keys built, footprint/tris, sockets declared, known defects, any engine change you want.
