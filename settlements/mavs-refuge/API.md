# Mav's Refuge — generator API (the contract)

A tree city in Krator's hypertropic jungle, generated procedurally in Three.js
r128 and built into ONE self-contained HTML file. `src/` fragments are
concatenated by `build.py` inside a single `BUILD()` function, so **every
top-level name is a global shared by every fragment**. Prefix your own
helpers/locals (e.g. `fly…`, `FLY_…`) — a stray `var seed`, `var T`, `var P`
at fragment top level WILL clobber someone else's. Wrap your fragment body in
an IIFE where you can and export only what others need.

**Units are metres.** `x` east, `z` south, `y` up. A person is 1.75 m.
River surface ≈ y 0–14; forest floor ≈ y 5–30; main decks y 148–224;
hypertrees are 290–480 m tall. The volcano/Ring Sea lie to the NW; the river
flows east→west. Rotation convention (same as Voth): a plain number `ry` is
`rotation.y`; local +x then points along world angle `-ry`
(`loc(x,z,lx,lz,ry)` converts). To aim local +x along heading (dx,dz):
`ry = Math.atan2(-dz, dx)`. To aim local +z along (dx,dz): `ry = Math.atan2(dx, dz)`.

## Loop

```
python3 build.py                                   # rules + syntax check -> mavs-refuge.html
python3 verify.py mavs-refuge.html --assert --all-views --out shots
python3 verify.py mavs-refuge.html --views "Mav's Crown" --hour 21.5 --out shots     # night
python3 verify.py mavs-refuge.html --cam "cx,cy,cz,tx,ty,tz" --cam-name mine --out shots
python3 verify.py mavs-refuge.html --eval "()=>window._myCounter"
```
Headless Chromium with software GL: a run takes 1–3 minutes. LOOK at your
screenshots (Read the PNG). `build.py` fails on: a generative fragment that
does not open with `reseed(N)` (N unique across fragments — use your fragment
number ×10000+1), a colour array (`var X = [0x…`) outside `05-palette.js`, or
a syntax error. `verify.py --assert` fails on a dirty error panel, an
invariant, or a budget ceiling. `FAST` is true under the verifier (no shadows,
no AA) — do not branch generation on it.

## Fragments and owners

| file | owner | what |
|---|---|---|
| 05-palette.js | planner, FROZEN | `PAL`, `FAMMAT`, `BUDGET`, colour aliases |
| 10-core.js | planner | RNG, noise, river, `terrainH`, `TICKS` |
| 20-stage / 21-sky / 82-daynight | sky | scene, lights, Krator sky, the clock |
| 30-layout.js | planner | trees, platforms, levels, bays, lots, rooms, bridges, spirals, roosts, NAV |
| 32-branches.js | planner | `BRANCHES` limb skeletons |
| 45-kit.js / 47-texture.js | planner | geometry kit, light volume, textures |
| 50-structure.js | planner | decks, floors, stairs, rails, struts, bridges, ramps |
| 55-arch.js | arch-A | deck buildings, satellite huts/farms, plaza, council hall |
| 56-levels.js | arch-B | lower-level room fronts + dressing, gate-tree carvings, gate yards |
| 60-trees.js | trees | trunks, limbs, foliage, flowers/fruit, saplings, far forest |
| 62-jungle.js | jungle | understorey, fallen logs + log bridge, rocks, cataract dressing |
| 72-lights.js | planner | `LANTERN`, `LAMPPOST`, fixed lamps |
| 75-terrain.js | planner | **emits the kit** (`emitBuckets`, `emitMerged`), ground, river |
| 78-life.js | life | pedestrians, soldiers, gatherers, lifts |
| 79-spiders.js | spiders | spider-riders |
| 84-flyers.js | flyers | flying beasts + riders, roost traffic |
| 80/81/85/86/87/98 | planner | camera+loop, glow, probe, inspector, path viz, start |

**Static fabric must be generated in a fragment numbered below 75** (the kit is
emitted there). Fragments ≥ 76 create their own meshes (animated things).

## Randomness

`rnd() rr(a,b) ri(a,b) pick(arr) chance(p) shuffle(arr) reseed(n)` — one global
LCG. `phash(x,y,z,salt)` is a position hash (0..1) for choices that must not
move when someone else's code changes. Noise: `vn fbm sig(x,z,f)`.
Maths: `clamp smooth mix smin TAU wrapPi angDist segDist polyNear cumLen loc`.
Runtime behaviour (animation) uses `Math.random()`, never `rnd()`.

## Fields

| | |
|---|---|
| `terrainH(x,z)` | ground height |
| `riverDist(x,z)` | signed distance to the waterline (>0 land). `inRiver(x,z,margin)` |
| `RIVER`, `RIVER_LEN`, `riverAt(s)` → `{x,z,tx,tz}` (downstream tangent), `riverLevel(s)`, `riverHalfAt(s)`, `cataractK(s)` 0..1, `CATARACTS[{x,z,s,drop,run}]` | river, by arc length `s` (0 = east/upstream end). `polyNear(x,z,RIVER,RIVER_CUM).t` gives `s` for a point |
| `trunkR(T,y)` | trunk radius of tree `T` at absolute height `y` — THE trunk contract; trunks are vertical and centred on `(T.x,T.z)` |

## Layout objects (READ ONLY)

`SPECIES[4]` = Ironbark(0) Ghostwood(1) Prism gum(2) Gate baobab(3):
`{name,H,rb,crown0,crownR}`. See the PAL comments for how each must look.

`TREES[]` `{id,x,z,y0 (base, ~1.5 m under the ground),sp,H,rb,crownR,crown0,role,seed,plat?}` —
35 near hypertrees (11 occupied). `FARTREES[]` same fields, ~210, beyond ±1500, to be drawn cheaply.

`BRANCHES[]` `{id,tree,kind:'limb'|'under'|'over',pts:[{x,y,z,r}],sat?,ang}` — limb skeletons
(10–13 points each, already clear of platforms and bridges). `under` boughs carry a
satellite on top; `over` boughs have a satellite slung beneath on ropes.

`PLATS[]` — every platform. `PIDX[name]`. `MAINS` (11 main), `SATS` (satellites), named:
`P_C` central "Mav's Crown", `P_CC` council, `P_R1..P_R5` residential, `P_RK` rookery,
`P_SP` spider "Silk Loft", `P_G1..P_G3` gates.
```
P = { id,name,kind:'central'|'res'|'rook'|'spider'|'gate'|'council'|'sat', main, tree,
      x,z, y (deck top), R, rt (trunk radius at the deck, ~0.9 for satellites),
      shape:'round'|'oval'|'square', ry,sx,sz, yBottom,
      levels[k] = { k, kind:'deck'|'apt'|'store'|'work'|'roost'|'hangar'|'web', y (FLOOR TOP), H (clear height),
                    Rout, gw (open gallery width at the rim), depth (room depth), Rin (= Rout-gw-depth), label },
      heads[]  = bridgeheads { ang, x,y,z, w, bridge, node },
      bays[]   = stair slots { ang, corridor[k] } — 3 per main platform, through every level,
      slots[]  = deck building lots (main platforms, not the central one):
                 { a0,a1 (angles), r0,r1 (radii), y, kind, floors, doorIn, doorOut },
                 kinds: home fancy shrine shop tavern inn barracks armoury mess store silkhouse
      rooms[]  = lower-level rooms { lvl, a0,a1, r0,r1, y, H, kind, door, whole? },
      subs[]   = satellite hut sites { ang, r, size, kind:'hut', door },
      use (satellites): 'homes'|'farm'|'mixed'|'waypost',  support:'under'|'over', supPts,
      hall (council): { r0, r1, doors:[angles] }, holeR (council: gap round the trunk for the stair),
      spiral, gatePassage, nav:{rings[k]:{inner,outer}, doors[]} }
```
**Polar frame.** Everything on a platform is addressed `(r, a)` about its centre:
`platXZ(P,r,a)` → `[x,z]` (honours oval/square satellites), `platOutDir(P,a)` → unit
`[dx,dz]` pointing outward, `platAngleTo(P,x,z)`. A lot or room is the annular sector
`r0..r1 × a0..a1` — "pizza-slice" buildings: curved outer wall, straight sides toward the trunk.
Level `k` occupies `y .. y+H`; its floor slab is `SLAB`=0.8 thick below `y`. Each lower level steps
IN by 3 m, so from outside you see every level's gallery edge: the open gallery is
`Rout-gw .. Rout`, rooms are `Rin .. Rout-gw` (room FRONT wall at `r = Rout-gw`, facing OUT), a
blank core wall stands at `Rin`. `stairOf(P,bay,k)` → `{rTop,rBot,yTop,yBot,angA,angB,run,rise}`:
lane A (`angA`) holds the flight from level k down to k+1, descending INWARD; lane B (`angB`) is the
corridor back out. Keep bay slots (`±(LANE_W+0.9)/r` about `bay.ang`) and bridgehead streets
(`±(w/2+2.4)/r` about `head.ang`) clear on every level — lots and rooms already respect them.

`BRIDGES[]` `{id,a,b (heads),L,w,sag}`, `bridgeY(br,t)` deck height at t∈[0,1].
`SPIRALS[]` `{id,kind:'gate'|'council',tree,plat,y0,y1,turns,dir,a0,off,w,landing?,nodes}`;
`helixPoint(S,t)` → `{x,y,z,a,r}` centre-line of the ramp (r = trunk radius + off). The walking
surface spans `trunkR-0.5 .. trunkR+off+w/2`.
`LIFTS[]` `{plat,x,z,y0,y1,a,capstan:{x,z,y,r}}`, `LADDERS[]` `{plat,x,z,y0,y1}`.
`ROOSTS[]` `{id,plat,lvl,ang,x,y,z (perch point on the floor at the rim),ox,oz (outward),H,big}` — 555.

`NAV` walk graph: `nodes[{id,x,y,z,plat,lvl,tag,…}]`, `edges[{id,a,b,len,kind,bridge?}]`
(`kind`: deck stair bridge spiral ladder ground), `adj[nodeId] = [edgeIds]`. Fully connected.
On a `bridge` edge a walker's height is `bridgeY(BRIDGES[e.bridge], t)` (t from head a to head b);
on every other edge interpolate linearly between the node heights.
Node tags: trunkpath promenade street bridgehead gallery stairtop stairfoot corridor door
satdeck spiral landing laddertop ground. `door` nodes carry `.slot`/`.room`/`.sub`.

## Making geometry (fragments < 75)

**A. Instanced kit** — one InstancedMesh per (shape, family):
```
BOX(x,y,z, w,h,d, rot, colour, family)     // y = BASE. rot: number (yaw) or [rx,ry,rz] Euler 'YXZ'
FR8 FR5 PYR (same args)                    // battered box, strong taper, 4-sided pyramid
CYL(x,y,z, r,h, rot, col, fam)  CONE(...)  DOME(...)  BLOB(...)   BALL(x,y,z,r,col,fam)
BEAM(ax,ay,az, bx,by,bz, w,d, col, fam)    // box from a to b, no roll (w horizontal, d in the vertical plane)
ROD (ax,ay,az, bx,by,bz, r, col, fam)      // 5-sided open cylinder: ropes, poles, spars
```
**B. Merged builder** — one Mesh per family, vertex-coloured, world-unit UVs:
```
SECTOR(fam, P, r0,r1, a0,a1, yb,yt, col, {faces:'tbios', step, colTop, colInner})
        // annular-sector prism in P's polar frame. faces: t(op) b(ottom) i(nner) o(uter) s(ides)
RING_HOLES(fam, P, r0,r1, yb,yt, col, holes[{a0,a1,r0,r1}], opt)
SECTOR_ROOF(fam, P, r0,r1, a0,a1, yb,h, col, {over, ridge, noSoffit})   // hipped roof over a sector
MCONE(fam, x,yb,z, rBase,rTop, h, col, seg, {under})                    // cone / frustum roof
TUBE(fam, pts[{x,y,z,r,col?}], col, {seg, cap, rfn(i,ang,pt), vscale})  // smooth tube along a polyline
MQUAD(fam, a,b,c,d, col)  MTRI(fam, a,b,c, col)      // [x,y,z] corners, CCW seen from outside
platFrame(x,z,ry)                                   // a throw-away polar frame anywhere
```
Families (`FAMMAT`): `plank timber wall thatch shingle rope cloth rock web leafy bark0..bark3 glowmat`.
Textures are grayscale; the colour you pass tints them (bark2 is a colour texture — pass white-ish).
`cloth` boxes sway (local y=1 is the hung edge). `glowmat` is unlit (lantern cores, embers).
**A new family is a new draw call — ask the planner.** `shade(hex,f)` lightens(+)/darkens(−).
Anything animated or alpha-blended is your own mesh in a fragment ≥ 76 (or your own static
mesh in a fragment < 75 if the kit cannot express it — e.g. foliage cards — budget permitting).
Any material you create yourself must be wrapped: `nlMaterial(mat, 'key', extraHook)` so it
receives the night light volume (`extraHook(shader)` is your own onBeforeCompile body).

**Lights.** `LANTERN(x,y,z, amp,rad, cool, hang)`, `LAMPPOST(x,y,z, h, amp,rad, cool)` (72-lights.js,
function declarations — callable from any fragment) draw a lantern and register it.
`nlLampAdd(x,y,z, amp,rad, cool)` registers a bare light (hearth, forge) with no geometry.
`WINPANE(x,y,z, nx,nz, w,h, cool)` registers a window pane: centre, outward horizontal normal, size.
Panes are drawn, lit on a staggered evening schedule and spill light automatically — you only
build the dark frame/opening behind it. `cool` = the blue-green bioluminescent light of the
Silk Loft and shrines. Registered lamps glow at night, pool light in the 3-D light volume and
get a halo. Typical: amp 0.6–1.2, rad 10–18.

**Inspector.** `REGISTER({name, kind, label, x,y,z, r, h, plat?})` — a vertical cylinder; the
smallest one containing the cursor hit wins the tooltip. Register every building / notable thing.
Own meshes: set `mesh.userData.inspectLabel = 'Giant bat'` (or
`mesh.userData.inspectFn = function(instanceId){ return 'Beast-rider on a quetzal'; }`).

**Animation.** `TICKS.push(function(dt, hour, nightK){ … })`. `skyHour()` 0–24. `SKY_STATE.keyDir`.
**Path viz.** `PATHVIZ.push({ key, label, color, paths:function(){ return [ [[x,y,z],…], … ]; } })`
(`var PATHVIZ` is declared in 10-core.js) — every moving population registers its routes.

## Budget (whole build: 110 draw calls, 4.2 M triangles, 260k instances)

| pass | triangles | instances | draw calls |
|---|---|---|---|
| structure (done) | 1.08 M | 52k | 14 |
| trees | 1.30 M | — | ≤ 14 |
| jungle | 0.45 M | 40k | ≤ 8 |
| arch-A | 0.40 M | 45k | ≤ 6 new |
| arch-B | 0.40 M | 60k | ≤ 4 new |
| life / spiders / flyers | 0.25 M total | — | ≤ 8 each |

## Pitfalls (each cost Voth a round)

- One material object per InstancedMesh; never add an InstancedMesh with count 0.
- Hand-built BufferGeometry needs UVs and CCW winding.
- Coplanar faces z-fight: offset ≥ 0.05.
- `Group.add()` returns the group, not the child.
- Test an object's EXTENT, not its centre, against bays/streets/holes.
- Two yaw conventions exist (see the top). A lintel that looks perpendicular is this.
- Assert every scripted text edit applied.

## Lessons folded in from Voth (read these)

- **Bake order.** The kit is drained ONCE in 75-terrain.js. A kit call from a fragment ≥ 75 now raises an
  error-panel message instead of silently vanishing — but check your instance counts anyway.
- **Shared scope.** `build.py` rejects column-0 `var/function` names declared in two fragments, and short
  generic names, unless the whole fragment is one IIFE. Keep your fragment one IIFE.
- **GLSL that passes here and dies on a real GPU.** The verifier renders with SwiftShader, which forgives
  undefined maths. On real drivers `pow(x<0, y)`, `sqrt(<0)`, `acos/asin(|x|>1)`, `normalize(vec3(0))`
  and divide-by-zero are NaN = black or missing objects. Clamp every base/argument:
  `pow(max(x,0.0), k)`, `acos(clamp(x,-1.0,1.0))`, `normalize(v + 1e-6)`.
- **Merging stock geometries by hand**: Box/Cylinder/Sphere/Cone geometries are INDEXED — walk
  `geometry.index` when present or you reassemble the wrong triangles.
- **Probe scripts lie too**: select meshes by a tag (`userData`), never by instance count.
- A check that fires on almost everything is usually too strict at a boundary (endpoints), not proof
  the logic is wrong.
