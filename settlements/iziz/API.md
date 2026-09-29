# Iziz — generator API (the contract)

Iziz is built on the Krator Ancients kit's fragment contract: `src/` fragments
are concatenated by `build.py` in filename order into one `<script>`, so
**every top-level name is a global shared by every fragment**. `build.py` fails
the build on a duplicate or over-generic top-level name, on a `build*()` that
does not open with `reseed(N)`, and on a generative fragment with no reseed.
Units are metres, `x` east, `z` south, `y` up; a person is 1.75 m. Ground is
`terrainH(x,z)` (flat `0` in the showcase; the city pass replaces the function).

## Loop

```
python build.py                                   # src/ + targets/vernacular -> dist/iziz-vernacular.html
python jscheck.py .syntax-vernacular.js           # parse check when node is missing (Travis's machine)
python verify.py dist/iziz-vernacular.html --assert --views "Overview,Middle — eye level" --out shots
python verify.py dist/iziz-vernacular.html --cam "36,6,222,32,0.5,215" --cam-name heap
python verify.py dist/iziz-vernacular.html --eval "()=>window._api.tagAudit()"
```

`verify.py` is the Ancients harness unchanged: it serves the file, loads it in
headless Chromium, prints the error panel, runs the invariants against
`window._api`, clicks the hidden view buttons and screenshots. **Look at the
shots**, at eye level (`… — eye level` presets) — that is where proportion and
placement errors live, and no invariant sees them.

## Vendored fragments

`10-core 12-stats 20-textures 22-materials 30-kit 32-surfaces 34-kitdefs
36-decor 38-helpers2 50-registry 54-mat-concrete 68-mat-v5 69-mat-salvage` are
byte-identical copies of `../ancients/src/`. `VENDOR.json` records their sha1s;
`python build.py --vendor-check` compares them with the Ancients repo when it is
beside this one. Do not edit them here — fix upstream and re-vendor. They give
Iziz the PRNG (`reseed rng rr`), noise (`fbm`), the instancing kit
(`kdef kput kbake KOFF KXF qFacing qEuler`), surfaces (`gridSurface lathe mesh
meshMerged`), the Ancients materials/textures (`MAT.white/.rust/.corrugate/
.timber/.tarp/.verdigris/.concrete/.brick/.glass/.dark`), decoration helpers
(`stripRing rubbleRing figures beam …`) and the registry (`REG REGISTER
useGroupXF endGroupXF`).

## The Vernacular set

### Registry — `69c-vern-helpers.js`

```js
VERN.def({key, name, family, tags:{type:[...], wealth, lit}, w, d, h, build})
VERN.place(scene, key, x, z, ry, o)   // -> THREE.Group; o = {v: variant, lit: override, scale: uniform scale (default 1), y: base height}
VERN.defs[key] · VERN.order · VERN.cur (the def/group/options being built; VERN.cur.r0 = REG.length at entry)
vnReg(name, lx, lz, r, h, extraTags)  // inspector volume, LOCAL frame; carries cls + tags; honours o.scale
vnAdoptREG(r0, nameFn, tags)          // for builders that WRAP an Ancients-kit builder: move the REG entries the kit
                                      // builder pushed (from index r0 = VERN.cur.r0) into the world frame + tag them
```

`build(G,o)` is a **named** `function buildVern*(G,o){reseed(N+(o.v|0)); …}`
(build.py's rules see it). It builds in the local frame: origin at the plot
centre on the ground, **+z is the front**, and never touches world coordinates —
`VERN.place` positions and yaws the group and sets the kit transform
(`useGroupXF`), so `kput` and `mesh(…,G,…)` both land correctly. Tags follow the
project rule: `culture:'iziz-vernacular'` is added for you; give `type` (one or
more of the project's building types), `wealth` (`poor|middle|rich|civic`) and
`lit` (**true only for rich and civic** — the electric-light canon). `vLit()`
inside a builder answers that flag (or `o.lit`), and `vnDoor`/`vnLamp`/
`vnLampPost` only emit bulbs when it is true.

Seed blocks: dwellings 7100–7399, trade 7400–7499, civic 7500–7599, infra
7600–7699. Take the next free `xx1` and leave room for variants (`+o.v`).

### Kit items — `69b-vern-mat.js` (prefix `v`)

Boxes: `vWood vStone vPlaster vCorr vIron vThatchB vShingleB vCopperB vPanelB
vRustB vClothB vTarpB vClayB vDarkB(void) vWinLit vWinGlass vFlag`.
Planes: `vSheet vBoard vPlate vPlateW vTarp vCloth`. Cylinders (base at y=0):
`vPost vPostB vPostS vPipe vPipeR vPipeC vClayPot vBarrel vTank vTankW vTankR
vStave vRope`. Roof wedges (base 1×1 at y=0, apex at y=1): gable `vGable{S,T,C,
Cu,P,W,St,Pl}`, pyramid `vPyr{S,Cu,T,Sh,C}`, hip `vHip{S,T,Cu,C}`, battered block
`vBatter{S,P,W}`. Domes `vDomeS vDomeC vDomeP`, cones `vConeT vConeC vConeI`,
balls `vBall(iron) vRock vFinial(copper) vBallW vGourd vSack vLeaf vBulb vEmber`,
`vHoop` (torus). Suffix key: S stone · T thatch · C corrugate · Cu copper · P
ghost panel · Pl plaster · W wood · Sh shingle · St stone(gable).

Materials are painted near-grey and tinted per instance with `vC(hex[,k])`
(sRGB → linear, once). Palette in `VPAL` (`sand orange adobe woodPoor woodMid
woodRich awning trim thatch stone stoneDark`), `vPick(arr)`. **Orange leads** (Travis, round 2): `VPAL.awning`
is weighted to Iziz orange, and `VPAL.trim` is painted-timber orange for fascias, shutters and doors — use it on
middle and rich buildings so the vernacular reads as Iziz from the air. Every textured material
carries `vWorldUV(mat,K)`: UVs are scaled by the instance's size per face
normal, so maps tile in metres on any box (K = 1/tile-metres: wood/plaster/
thatch 2 m, stone/copper 4 m, Ancient panel 8 m).

### Building blocks — `69c-vern-helpers.js` (prefix `vn`, local frame, y = base)

```
vB(item,x,y,z,w,h,d,ry,c)  vBq(item,x,yc,z,w,h,d,q,c)  vPst(item,x,y,z,r,h,c,q)  vPl(item,x,yc,z,w,h,ry,c,tilt)  vBall  vBeam(a,b,w,c,item)
loc(x,z,lx,lz,ry) -> [x',z']      vQ(ry,tiltX,rollZ) -> quaternion
vnFrame(x,y,z,w,h,d,ry,c,pr)       timber frame: posts every ~2.4 m + sill/head rails
vnStilts(x,y,z,w,d,h,ry,c,pr)      posts on pad stones with braces
vnPlinth(item,x,y,z,w,h,d,ry,c)    battered plinth storey (vBatterS/P) + cap band
vnCornice(item,x,y,z,w,d,ry,c,steps,cap) -> top y     Mayan stepped cornice
vnStrip(x,y,z,ry,w,h,frameItem,c)  deco vertical strip (dark slot + fins)
vnPatch(x,y,z,ry,w,h,n)            salvage sheets nailed over a face
vnGableRoof(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick)   ridge along local x
vnShedRoof(x,y,z,w,d,rise,ry,item,c,over,thick)                          high at -z
vnHipRoof(item,x,y,z,w,d,rise,ry,c,over)   vnPyrRoof(...)   vnThatchCone(x,y,z,r,rise,c)
vnWin(x,y,z,ry,w,h,kind,frameItem,c,shutters)   kind: lit | glass | open | shut ; (x,z) ON the face, ry = outward
vnDoor(x,y,z,ry,w,h,frameItem,c,leafC,step)      lamp above if vLit()
vnLamp(x,y,z,ry)  vnLampPost(x,y,z,h)            electric — only call under vLit() (vnDoor does)
vnVeranda(x,y,z,w,d,ry,deckH,postH,c,railC)  vnStairs(x,y,z,ry,w,rise,steps,item,c)  vnLadder(x,y,z,ry,h,c)
vnBarrel vnWaterButt vnCrate vnSacks vnPlanter vnDryingRack vnAwning vnBannerPole vnChimney
vnFence(x,y,z,w,d,ry,c,gate,h)  vnPalisade(x,y,z,w,d,ry,h,gate)  vnPaving(x,y,z,w,d,ry,c,n)  vnFolk(x,z,n,spread)
vnStall(x,z,ry,c)  vnSign(x,y,z,ry,c)  vnCivicBlock(...)  (in 71/72)
```

Roof helpers: a **gable** = a wall-material wedge closing the ends (`endItem`)
plus two overhanging slabs + ridge cap + fascia; **hip/pyramid** are solid
wedges whose base is dropped 0.35 m so the wall top is buried. Overhangs default
to 0.8–0.9 m: this is a rain climate.

### Wrapping an Ancients-kit builder (Salvager's / Mercenary guilds, ported landmarks)

A kit builder has the signature `buildX(scene,gx,gz,d)`, sets `KOFF=[gx,0,gz]`, adds a group to `scene` at
`gx,0,gz`, calls `REGISTER` in that frame and returns the group. Inside a `VERN` builder call it as
`const r0=VERN.cur.r0; const H=buildX(G,0,0,3); vnAdoptREG(r0, n=>'Salvagers\' Guild — '+n);` — `G` is the
group `VERN.place` made (already positioned, yawed and scaled; `KXF` carries the transform, and `kput`
scales instance sizes when `o.scale` ≠ 1). Restore `KOFF=[0,0,0]` afterwards. Decay `3` is the kit's
*repaired* state (`HOLES` may be set to .55 around the call, as `90-scene.js` in the Ancients kit does).
Vendor the builder fragment byte-identical from `../ancients/src/` and add it to `VENDORED` in build.py.

### Adding a building

1. New `function buildVernX(G,o){reseed(7xx1+(o.v|0)); … vnReg(...); …}` in the
   right fragment (or a new `7x-vern-<family>.js`).
2. `VERN.def({...})` at the foot of the fragment with honest `w,d,h` (the
   showcase spaces sites by `w`).
3. Add the key to a row in `targets/vernacular/89z-rows.js` and a view or two in
   `91z-views.js` (an eye-level one).
4. `python build.py && python verify.py … --assert` — then read the shots.

## Targets

| target | output | what |
|---|---|---|
| `vernacular` | `dist/iziz-vernacular.html` | the set in rows by family, wealth left→right |

A target contributes `89z-rows.js` (`TITLE`, `GROUND_C`, `SITES`) and
`91z-views.js` (`VIEWS`; the first entry is the opening shot). `90-scene.js`
loops `SITES` through `VERN.place`, tags every `REG` entry with its site key,
then `kbake(scene)`.

## Dev tools (project rule) — `92-camera.js`

* **Inspector** (on by default; button toggles): hover shows *name ·
  classification · tags · world point*; unregistered geometry says so.
* **Polygon**: click the ground to add vertices, right-click removes the last;
  the panel shows copy-pasteable `[[x,z],…]` (or `{x,z}`), with Copy / Close
  loop / Undo / Clear. Also `window._poly`.
* **Walk (F)**: eye height 1.7 m, WASD, drag to look, wheel = speed, Shift =
  run. Judge the set from here.
* **Labels**: per-site name · wealth sprites.

## Probe — `window._api`

`totals`, `typeStats()`, `regOccupancy()`, `nanSweep()`, `tagAudit()` (every
REG entry has cls + culture/type/wealth), `defs()`, `setView`, `views()`.
Budgets: showcase 3 M scene triangles / 400 draw calls; per type 250 k.


## Group transforms nest (round 3b)

`useGroupXF(P)` / `endGroupXF()` are reassigned in `69c` to a stack: a child
group's local matrix composes onto the parent's, and end pops. Kit builders
that open their own body group (the skyscrapers, `bodyGroup`) therefore work
inside `VERN.place`, `TRANS.place` and `placeKit`. Rule for placers: call the
builder at local (0,0) and carry the centring in the GROUP — `KOFF` is added
in world space after the transform and cannot centre a scaled, rotated plot.

## The city target (`targets/city/`, round 3)

Fragments, in build order (they sit between the shared `src/` fragments):

| fragment | what |
|---|---|
| `84-city-geo.js` | `CITY` constants (WORLD 1900, PLATEAU 18, CHASM −16, R 470, GATES, the three HILLS as mesas `{x,z,H,r0,E,ring,gate}`), `wallR(t)`, `hillProfile/hillH`, `cityFlat`, **`terrainH` reassigned** (plateau + hills + moat + causeways + spaceport pad), `insideWall`, `nearestHill`, `radial`, `FRAME_HOOKS_PRE` |
| `85-city-paint.js` | the painted ground: `gcv` albedo / `mv` buildable mask / `kv` class canvases (2048 px), `KL` classes, `road(pts,w,cls,opt)` (paints + pushes to `ROADS`), `disc`, `footprint`, `annulus`, `precinct/inPrecinct`, `cityBakeMasks()` then `canBuild/klass/isRoad/walkable` samplers |
| `86-bio-10…70` | the hyperjungle biome kit, vendored byte-identical (SCOPED in build.py; manifest in VENDOR.json) |
| `86-bio-45-init.js` | `BIO.init` against `terrainH` and the mask canvases; `bioMaskFn` (jungle outside the moat, undergrowth in parks at .85 and in ruined clusters at .28), `bioTreeMaskFn` (hypertrees stand back 130 m from the wall), `BIO_OBSTACLES`, `RUIN_RECTS` |
| `87-city-layout.js` | the primary network: escarpment paint, ring roads (`roadInside` clips to the plateau), ramps, thoroughfares ring-to-ring, gate roads to the nearest ring, the spaceport causeway, hill-top courts/plazas, parks (`park()` re-strokes roads through it), amphitheatre pad, needle pad. `nearestRoadPt`, `connectRoad` |
| `88-city-place.js` | occupancy (`OCC`, `obbOverlap`, `occFree`, `occAdd`, `obbCorners`, `groundOK`, `groundY`, `findSpot`); the ancient lattice `AG` (pitch 40, street 7, 12°), cluster growth to the ½-area target, reclaimed/ruined split by distance to a ring, streets + two connectors per cluster, slot tiling by wishlist (`QUOTA` per hill: 5 sky / 15 midrise reclaimed) |
| `90a-city-world.js` | terrain mesh (4 m cells, albedo texture), moat water, `KratorSky` attach + `citySkyTick` (sun/hemi/fog/BIO.setSun), outer wall + gates, palace hill (palace `orig` @1, Ancient curtain wall r 84, two `izBarracks` blocks inside, statue, lamp columns), temple (`anc` @.8), arena (`anc` @.82), needle, spaceport |
| `90b-city-build.js` | `KITCAT` + `measureKit` (core footprint above the plinth line) + `placeKit` (fit, `hmax`, flora strip, `trimPlinths`, repairPass, lighting rule, REG adoption) + `placeTrans` + `placeVern`; passes 1 ancient clusters → 2 moat bunkers + rust amphitheatre → 3 civic/guilds (`placeNear`, `placeOnTop`, `fillTop` for the temple and arena tops) → 4 settler streets (BFS from the network) → 5 frontage walker (`pickVern` zoning) → 5b infill with footpaths → 6 farms → 7 footprints into the mask, jungle (trees with the tree mask, floor with the full mask), `BIO.bake` → 8 `kbake`, `TRANS.bake`, labels |
| `src/93-labels.js` | **standard package**: floating labels for every REG volume (buildings, farms, furniture; repeated wall segments skipped) as ONE atlas mesh — constant screen size, landmarks (`tags.role` or `tags.landmark`) bigger and never faded; lives in `LABELS`, toggled by the Labels button |
| `91z-views.js`, `93-city-ui.js` | presets; Paths overlay (class map + DOORS), Jungle toggle, hour slider, city budgets, `window._api.city` |

Lighting rule (Travis, round 3): the citadel, arena and grand temple are
electrified (their generators stand on the tops); civic buildings and guild
halls are lit; a rich house or a reclaimed Ancient building is lit 50/50 **only
on one of the three hills** (`onHill`: within ring+40 m); everything else is
dark. `placeVern` passes `lit` through `o.lit` (so `vLit()` follows it) and
stamps the REG tag; `placeKit` recolours the kit's light items `DEADLIGHT`
when a reclaimed building draws dark.

Adding a building type to the city: a vernacular def needs nothing (it is
picked by `pickVern` or placed by name with `placeNear`); an Ancients-kit
builder needs a `KITCAT` row (`smax`, `smin`, `hmax`, `type`, `kind`) and a
wishlist entry in `88`'s `assignSlots`; a transplant kind is placed through
`placeTrans` with `TREFHALF`.
