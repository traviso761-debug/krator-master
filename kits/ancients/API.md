# Krator Ancients — generator API (the contract)

A procedural architectural kit for the ruined ancient civilisation of Krator:
33 structure types, each a builder function that takes a site and a decay level
and emits geometry into a Three.js **r128** scene. `src/` fragments are
concatenated by `build.py` into one `<script>`, so **every top-level name is a
global shared by every fragment**. A stray column-0 `const R` or `function se`
WILL clobber someone else's; `build.py` fails the build on a duplicate or an
over-generic top-level name. Keep locals inside your builder.

**Units are metres.** `x` east, `z` south, `y` up. A person is 1.75 m — most of
these structures are meant to dwarf one, and several are 300–420 m tall.
Ground is `y = 0` everywhere today (see *Ground contact* below; there is no
terrain hook yet).

## Targets

A **target** is a showcase. It is built from the shared `src/` fragments plus
its own site table and view list, merged into one sorted filename order:

| target | output | what it shows |
|---|---|---|
| `kit` | `dist/ancients-kit.html` | the 32-type showcase, rows along +z |
| `theodiga` | `dist/theodiga.html` | the dam arcology alone, at the origin |

Everything else — core, helpers, all 33 builders — is shared, so a fix to
`buildDam` or to `lathe()` lands in both and the two cannot drift. A target
directory contributes exactly two fragments:

* `89z-rows.js` — `TITLE`, `GROUND_C` (z centre of the ground plane) and
  `ROWS`/`RUINS`.
* `91z-views.js` — the `VIEWS` preset table. **The first entry is the opening
  shot**, whatever it is called.

`00-head.html` is shared, so the page shell exists once. `TITLE` names the
target in three places: `build.py` stamps it into the static `<title>` (the
artifact gallery reads that tag, and setting `document.title` at runtime is too
late for it), and `92-camera.js` sets `document.title` and the on-screen
caption.

To add a target: make `targets/<name>/` with those two files and add a line to
`TARGET_OUT` in `build.py`. A target may not shadow a `src/` fragment name;
`build.py` refuses if it does.

Theodiga lives in its own target because it is the heaviest single structure in
the kit and is being taken up as its own piece of work. `buildDam` still ships
in the kit's `<script>` — only the site is gone.

## Loop

```
python build.py                            # both targets
python build.py --target theodiga          # just one
python build.py --assert-origin            # prove a refactor changed nothing
python verify.py dist/ancients-kit.html --assert --out shots
python verify.py dist/ancients-kit.html --views "Lab,Starport" --out shots
python verify.py dist/ancients-kit.html --cam "cx,cy,cz,tx,ty,tz" --cam-name mine
python verify.py dist/ancients-kit.html --eval "()=>window._api.totals"
./run.sh mylog --assert --views "Lab"      # background it; poll mylog.done
```

Headless Chromium on software GL: **a 16-view run takes several minutes.** Keep
a run to ≤ 16 views and background it. LOOK at the screenshots afterwards (Read
the PNG) — a preset camera that ends up inside geometry gives a wall of one
colour, which no counter will tell you about.

Two harness facts worth knowing before you debug a ghost:

* **`build.py` does not check syntax.** `node` is not installed here, so
  `node --check` never runs and the script says so rather than printing
  "syntax OK". The only syntax check this project has is `verify.py` reading the
  on-screen error panel.
* **SwiftShader flakes.** Roughly one run in seven dies with a null
  shader-info-log `TypeError` that reads exactly like a real regression. Re-run
  before you revert anything.

## Fragments and ownership

Fragments are **contiguous slices of the original single file, in original
order**, and they must stay that way: top-level order is load-bearing. `kdef()`
calls fix the order in which `kbake()` creates the InstancedMeshes, and the
`TEX`/`MAT` literals must exist before the `kdef()`s that name them. Never move
a top-level statement across a fragment boundary.

| file | what |
|---|---|
| `00-head.html` | page shell, styles, `#ui` `#cap` `#insp` `#hud` `#errs`, the three.js loader |
| `10-core.js` | error panel, PRNG (`reseed rng rr`), noise (`h3 vnoise fbm`), `clamp lerp TAU`, the frame hook `TICKS tick` |
| `12-stats.js` | per-type accounting (`TSTAT`, `tcur triOf ktri finite3`) — no geometry, no PRNG draws |
| `20-textures.js` | `canvasTex`, `TEX.panel/.rust/.ground` |
| `22-materials.js` | `MAT.*`, `SHELL(d)`, `WIN(d)`, `CYAN WARM DEAD` |
| `30-kit.js` | the instancing kit: `KIT kdef kput kbake KOFF KXF`, `qFacing qEuler qAxis` |
| `32-surfaces.js` | `gridSurface lathe holeFn mesh arcShape paraFill arcWindowGeo hyperGeo` |
| `34-kitdefs.js` | the shared `kdef()` geometry (windows, mullions, slabs, moss, vines, rubble…) |
| `36-decor.js` | `windowsOnLathe stripRing mullions glassBand floorSlabs scatterMoss mossOnRing vinesOnRing rubbleRing trees figures` |
| `38-helpers2.js` | `beam hexR petalGeo petalRing luceShells ribCurveGeo` |
| `50-registry.js` | `REG REGISTER useGroupXF endGroupXF STATE`, a few `kdef`s |
| `54-mat-concrete.js`, `68-mat-v5.js` | concrete/brick/glass materials and their `kdef`s, `CONC BOXC SLABC PLATE` |
| `4x–8x` | **one builder per file** (see the table below) |
| `90-scene.js` | renderer, lights, sky, gas giant, `ROWS`, ground paint, the builder loop, `kbake` |
| `91-probe.js` | `window._api`, `BUDGET`, the invariants verify.py measures |
| `92-camera.js` | `VIEWS`, the preset UI, click-to-inspect, orbit/WASD, the frame loop |
| `99-tail.html` | closes the script and the document |

Builder fragments: `40-factory-extras` `42-offices` `44-starport` `46-bunker`
`48-library` `52-sky-abc` `56-sky-d` `57-sky-e` `58-sky-f` `60-gate`
`62-robotics` `64-houses-def` `66-office-c` `70-sky-g` `71-sky-h`
`72-datacenter` `73-police` `74-hospital` `75-hotel` `76-campus` `77-dam`
`78-factory-silo` `79-government` `80-aa-battery` `81-houses-abc`
`82-apartments` `83-amphitheater` `84-fuel` `85-radar` `86-dish` `87-mega`
`88-factory` `89-lab`.

## Builders

```js
function buildX(scene, gx, gz, d) -> THREE.Group
```

`gx, gz` are the site centre in world space; `d` is the decay level. The builder
creates its own `THREE.Group` at `(gx, 0, gz)`, adds it to `scene`, and **must**:

1. open with `reseed(N)` — a seed no other fragment claims;
2. set `KOFF = [gx, 0, gz]` before its first `kput`, and reset `KOFF = [0,0,0]`
   before returning;
3. call `REGISTER(...)` for every volume the inspector should be able to name.

`reseed` matters because the PRNG is one global stream. Without a reseed at the
head of each builder, adding two `rng()` calls to the Laboratory silently moves
every rock in every structure built after it. `build.py` checks this. It also
checks that no two fragments claim overlapping seeds — remember a builder runs
**once per decay state**, so `reseed(9100+d)` claims 9100–9104 (decays 0–4).

### Decay semantics

`d` is `0` intact, `1` ruined, `2` toppled, `3` rehabilitated, `4`
rehabilitated **and still standing** ("The Project"). Only types with a `t`
column in `ROWS` (the eight skyscrapers) are ever called with `d === 2`; every
type in the `kit` target is called with `3` (the rehabilitated variants were
folded in from the retired `repaired` target, and stand at x=0); and only a row
that names `j` and lists `4` in its own `ds` is ever called with `4`, which
today is `skyA`, `skyD` and `skyH`: the three Projects.

Only `d === 2` is built cut down: the standing test is `d !== 2`. It used to
be `d < 2`, which made every tower a three-storey stump at level 3.

Levels 3 and 4 are the same ancient fabric at a reduced hole density: the scene
loop sets the global `HOLES = 0.55` for them (`holeFn` multiplies `d` by it), so
33 builders get a part-eaten shell without one of them being edited. After the
builder returns, the loop runs `repairPass()` on the group it returned, which
dresses it with salvage — again without any builder knowing the level exists.

**Level 3 is a stump.** `bodyGroup` and `buildSkyA` both decide whether a tower
stands with `d < 2`, which excludes 3, so a rehabilitated tower is built cut off
at `cutY` with no fallen upper body. Level 4 exists because of that. See
`KNOWN_ISSUES.md`.

Inside a builder the convention is:

```js
const dd = d>0 ? 1 : 0;      // "is this a ruin" - drives materials and holes
```

`d === 2` differs from `d === 1` only in that the upper body is built into a
separate group laid on its side by `toppledUpper()`. Most decay effects are
driven by `dd`, not `d`. A placer can BREAK the fallen body in two: set the global
`TOPPLE_BREAK={x,z}` (builder-local) around the call and clear it after. Only
builders whose `toppledUpper` call passes `partFn(U,y0,y1)` break: everything built
through `bodyGroup` (D, E, F). The second piece's foot and bearing come back on
`TOPPLE_BREAK.out`. See NOTES "Iziz round 4".

Decay is expressed through a small vocabulary, all of which take `d` (or `dd`)
directly: `SHELL(d)` picks white metal vs rust, `WIN(d)` lit vs dead glass,
`CONC(d)` / `BOXC(d)` / `SLABC(d)` / `PLATE(d)` the concrete equivalents, and
`holeFn(d, seed, cut, scale)` returns a `hole(u,y)` predicate that punches
progressively more of a surface away as `d` rises (and much more near a `cut`).
Pass the result as `opt.hole` to `gridSurface`/`lathe`.

### Site table

`ROWS` in the target's `89z-rows.js`: one row per type, `{z, s, r, t?, j?, ds?}`.
Intact stands at `x = -s`, ruined at `x = +s`, toppled at `x = t`, rehabilitated
at `x = 0`, and The Project at `x = j`. `r` is the row's ground-paint radius.
Rows run from `z = 0` (Skyscraper A) to `z = 25400` (the Flatiron).

A target picks its decay levels with `DECAYS`; **one row may override that with
its own `ds`**, which is how a single type gets a variant no other type has
without every builder being called with a level it does not understand.

### Day and night

A `VIEWS` preset is `[cx,cy,cz,tx,ty,tz]` and may carry a **seventh element**:
truthy puts the scene into night. `setView` is the only route into a view that
anything uses — the select, the hidden button list `verify.py` clicks, and
`_api.setView` — so there is no second control to keep in sync and `--all-views`
screenshots night presets without knowing night exists. `n` toggles by hand.

`setNight(on)` in `92-camera.js` swings `hemi`, `sun`, `fill`, the sky shader's
`u_n` uniform, the fog colour and the tone-mapping exposure, and flips
`.visible` on the InstancedMeshes named in `FIREKIT`. **Nothing is rebuilt.**
That works because `kbake` now records `KIT.meshes[name]`, and one `kdef` is one
InstancedMesh, so a whole class of instanced detail is one flag.

Two traps if you add anything else that is state-dependent:

* **An unlit material does not go dark.** `MAT.dot` / `MAT.strip` items ignore
  the scene, so a `DEAD` instance colour renders at a fixed ~60/255 — a dark
  opening by day and a pale panel at night. Use `cellD` (`MAT.winDead`) for a
  window that is off.
* Fire is **additive cards on unlit materials**, not lights. A scene light
  cannot make a window brighter than the sunlit wall beside it, which is a
  standing kit-wide complaint; the fire has to BE the light.

## The instancing kit

Anything that repeats goes through the kit instead of becoming its own mesh.

```js
kdef(name, geo, mat)                 // define a shared item, once, at top level
kput(name, p, q, s, c)               // place one: position, quaternion|null,
                                     //   scale (number or [x,y,z]), colour|null
kbake(parent)                        // once, at the end of 90-scene.js
```

`kput` adds `KOFF` to `p`, so builders work in local coordinates. If the whole
sub-assembly is rotated (a leaning spire, a toppled upper body), wrap it:

```js
const P = new THREE.Group(); P.position.set(0, Y0, 0); G.add(P);
useGroupXF(P);  ...builder body...  endGroupXF();
```

`useGroupXF` sets `KXF`, and `kput` then pre-transforms every item by that
matrix so instanced detail follows the group. `kbake` must run **after** every
builder; it is called once, at the bottom of `90-scene.js`.

**r128 pitfalls the kit already handles — do not undo them:**

* `kbake` does `def.mat.clone()` per InstancedMesh. Sharing one material
  instance across InstancedMeshes breaks `instanceColor` in r128.
* Any InstancedMesh that colours *some* instances must fill the rest with white;
  `kbake` does this. Skip it and the uncoloured instances render black.
* `frustumCulled = false` on instanced meshes: their bounding spheres span a
  22 km row and would cull wrongly.
* The three.js `<script>` sets `crossorigin` **only when not on `file:`**.
  `verify.py` serves over HTTP and routes `**/three.min.js` to the pinned local
  r128 copy, so runs are offline and version-stable.

## Surfaces

```js
gridSurface(fn, nu, nv, opt)   // fn(u,v)->[x,y,z]; opt.hole(u,v)->bool drops a quad
                               // opt.uS/vS scale the UVs into world-ish units
lathe({rFn, H, cut, jag, flutes, amp, sharp, twist, nu, nv, hole, seed})
holeFn(d, seed, cut, scale)    // the standard decay predicate
mesh(geo, mat, parent, x,y,z)  // the ONLY way to add a non-instanced mesh
meshMerged(geos, mat, parent)  // many geometries -> one mesh, one draw call
beam(name, a, b, w, dp, c)     // a kit box stretched and aimed from a to b
```

**`meshMerged` is how a tall building stays cheap.** A tower that emits one
mesh per storey is one draw call per storey; a 53-floor tower emitting two bands
each was 106 draw calls on its own. Collect the geometries in an array and merge
them at the end of the loop instead:

```js
const bands=[];
for(let s=0;s<n;s++){ bands.push(gridSurface(…)); … }
meshMerged(bands,SHELL(dx),P);
```

Where a geometry needs its own offset, bake it in with `.translate(x,y,z)`
before pushing. The merge copies per-vertex normals rather than recomputing
them, so shading is unchanged, and it is triangle-neutral.

A merge with no `.translate()` is **bit-exact** — Skyscraper B's came back 0
pixels different over a full view. Baking a large offset in is not quite: a
vertex that was `7.5` in a matrix at `x=340` becomes `347.5` in the position
buffer, which costs a few bits of float precision and can flip an antialiased
sample on a silhouette edge. Measured cost on the Apartments towers (offset
340 m): **8 pixels out of 1 024 000, max delta 39/255.** Fine here; worth
remembering before merging something whose offset is in the thousands.

**Only merge opaque materials.** Transparent meshes are depth-sorted per mesh,
so merging glass changes the order things blend in. Leave `MAT.glass` alone.

`mesh()` and `kput()` are the two funnels everything passes through, which is
what makes the per-type accounting in `12-stats.js` possible. If you add
geometry by any other route it will not be counted and the budget checks will
quietly under-report. Don't.

Shape helpers: `arcShape` (parabolic arch solid), `paraFill` (parabolic wall
with an arched opening), `arcWindowGeo`, `hyperGeo` (hyperboloid), `se(th,n)`
(superellipse radius — the squarish plans), `hexR`, `petalGeo`/`petalRing`
(Gaudí crown petals), `luceShells` (leaning hypar pair), `ribCurveGeo` (a swept
tube along a point list).

Decoration helpers all take `(gx, gy, gz, …, d)` in **world** coordinates, not
builder-local — they call `kput` which adds `KOFF`, so pass local coords and let
`KOFF` do the work, exactly as the existing builders do.

## Materials

All procedural, generated once at load, in world-ish units: **a texture tile is
about 8 m**, because `lathe` sets `uS = rFn(0)*TAU/8` and `vS = cut/8`. At 512 px
that is 64 px per metre, which is what the 2×1 m panel sheets and the 0.65 m
form boards are sized against. Change the tile size and those stop meaning
anything.

| | |
|---|---|
| `MAT.white` / `MAT.rust` | `SHELL(d)` — white panelled metal, tarnished steel |
| `MAT.verdigris` | copper/bronze patina. **Only** for parts meant to read as copper; steel rusts, it does not go green |
| `MAT.concrete` / `MAT.concreteR` | `CONC(d)` — board-formed, with form-tie holes |
| `MAT.brick` | common bond, header course every sixth |
| `MAT.glass` | blue-transparent, with a fresnel rim (below) |
| `MAT.dark` / `MAT.guts` | what you see through a hole in a ruin |

**Roughness and metalness come from a packed map**, built by `rmTex`: r128 reads
`roughnessMap` from the green channel and `metalnessMap` from the blue, so one
texture serves both, and both *multiply* the material's scalar — which is why
`roughness` and `metalness` are set to `1` on those materials. Breaking
roughness up per panel and along the seams is what makes metal read as metal; a
single flat roughness gives every panel on a 420 m tower an identical highlight
and the whole thing looks moulded.

Two traps worth knowing before you add a material:

* **A data map must not be sRGB-encoded.** `canvasTex` sets sRGB, which is right
  for albedo and wrong for roughness/metalness. `rmTex` resets it to linear.
* **Keep metalness modest (~0.3–0.45).** There is no environment map in this
  scene, so a near-1 metalness has no diffuse and nothing to reflect, and the
  surface renders almost black.

`MAT.glass` gets a fresnel rim through `onBeforeCompile`, injected into the stock
standard-material shader so lights, fog and tone mapping still apply. In r128 the
anchor is the literal `gl_FragColor = vec4( outgoingLight, diffuseColor.a );` —
there is no `<output_fragment>` chunk in this version. The cube is written out
instead of `pow()` because a negative base gives NaN and **SwiftShader silently
swallows it**, so it would look perfect under `verify.py` and break on real
hardware. Clamp anything feeding `pow`/`sqrt`. Note `kbake` re-attaches
`onBeforeCompile` after cloning, because `Material.copy()` does not carry it.

## Enclosure: things that must be closed

A shell made with `lathe` or `gridSurface` is a **surface, not a solid**. It has
no ends and no cap, and with `DoubleSide` materials an unclosed one simply shows
you its inside. Every enclosed space needs its lid and its ends built
explicitly. Ones already found and fixed, as a checklist of the shapes that
catch people out:

* a stack of drums (Apartments A) — every tray needs a floor *and* a ceiling, or
  you see down through the whole stack;
* a tube on a column (House C's lobes) — open at the top *and* the bottom;
* a sandwich of two skins (Apartments B) — needs both end elevations and a roof;
* a swept bar on an arc (Office C) — needs its two end walls.

The top-down view is the one that finds these. `verify.py --cam "x,y,z,tx,ty,tz"`
puts the camera straight over a structure.

```js
REGISTER({ name, x, z, r, h, y })
```

Registers an upright cylinder — centre `(x,z)` (local; `KOFF` is added for you),
radius `r`, from `y` (default 0) to `y + h`. Click-to-inspect ray-casts the
scene, then picks the **smallest** registered volume containing the hit point,
so a sub-volume ("Library — reading hall") nests correctly inside its parent.

A volume with nothing inside it is a bug: the inspector names a structure the
user cannot see, which usually means the builder moved and the registration did
not follow. `verify.py --assert` measures this (`registered-volumes-non-empty`).
The scene loop tags each registration with the type key that made it, so a
failure names the owner.

## Budgets

Defined in `BUDGET` in `91-probe.js` and measured by `verify.py --assert`.
**They are a target to optimise toward, not a gate:** this is a showcase, and an
exceeded ceiling reports as `OVER` without failing the run. Pass
`--strict-budget` to make it fail. Correctness invariants always fail hard.

| | limit |
|---|---|
| showcase, scene triangles | 6 000 000 |
| showcase, draw calls @1280×800 | 900 |
| small (houses, fuel, radar, dish, police) | 60 000 |
| medium | 250 000 |
| skyscrapers A–H | 400 000 |
| megastructures, Gate, dam, campus | 700 000 |

Per-type numbers are **scene content**: every triangle a builder emitted, with
instanced items expanded (one `kput` of a 12-triangle box costs 12). That is the
number a builder controls. `renderer.info.render.triangles` answers a different
question — what is drawn from wherever the camera happens to be — and is
reported alongside it.

**Draw calls are per camera, so one reading is worthless.** `verify.py` samples
them at every view it screenshots and judges the worst. Measured over 16 views
at 1280×800: best 68 (`Skyscraper A`), worst 1129 (`Robotics factory`), six
views over the 900 ceiling. Distant views are cheap because per-mesh frustum
culling does the work; close views are not, because the ~50 kit InstancedMeshes
are `frustumCulled = false` and always draw. Anything small and repeated
therefore belongs in the kit, not in a `mesh()` call of its own.

Where the kit stands today (measured, round 1): 6 015 160 scene triangles,
85 153 baked instances, 114 registered volumes, 70 type/decay pairs. Two
ceilings are exceeded — see `KNOWN_ISSUES.md`.

## Counters

`window._ready` (true when the frame loop has started), `window._instances`
(baked instance count), `window._registered` (registry size), and `window._api`:

| | |
|---|---|
| `_api.totals` | `{tris, inst, meshes, registered, types}` for the whole scene |
| `_api.typeStats()` | per `type/decay` key: `{tris, inst, meshes, cls, limit, over}` |
| `_api.regOccupancy()` | per registered volume: how many sample points fall inside |
| `_api.nanSweep()` | meshes with a non-finite vertex, instances placed at NaN |
| `_api.setView(cx,cy,cz,tx,ty,tz)`, `_api.views()` | camera, preset names |
| `_api.BUDGET`, `_api.REG` | the budget table and the raw registry |

## Animation

One frame hook, and nothing else animates. `10-core.js` holds

```js
const TICKS=[];
function tick(fn){TICKS.push(fn);}      // fn(dt, t)
```

and the frame loop in `92-camera.js` calls every registered function once per
frame, **after** the camera has moved and **before** the render, as
`fn(dt, t)`: `dt` in seconds, clamped to 0.1 (so a multi-second SwiftShader
frame cannot fling anything round), `t` wall-clock seconds. The argument order
is Screamers' (its `10-core.js` has the same hook), which is also what the
biome binding already passes its wind through, so the biome's wind now moves in
this kit too. A tick that throws is reported once to the error panel and the
frame still renders.

Rules: **move or show what the builder already built; never build in a
tick.** Register once per fragment, not once per builder call (a builder runs
once per decay level), and keep the per-frame work to a handful of transform or
`.visible` writes. `NIGHT` is readable inside a tick, so night-only effects can
switch themselves.

**Screenshots are single frames**, taken ~900 ms after a preset is applied at an
unknown wall-clock time, so anything that moves must still read in a still.
The worked example is the lighthouse beacon (`89n-lighthouse.js`): its sweep
advances by the clamped `dt`, and when the camera JUMPS (a preset, not an
orbit) it re-aims the beam at a fixed bearing off the line to the camera, so
every preset shows the beam at a known angle and the sweep carries on from
there.

## Ground contact

There is none yet. Every builder assumes `y = 0` and sets its own berm or plinth
by hand where it has one. The brief calls for a `terrainH` hook (default 0) and
an apron on every structure; that work is open, and tracked in
`KNOWN_ISSUES.md`. Until it lands, do not add a builder that assumes terrain.

## House style

Cyclopean · Modernist · Organic. Gleaming white metal or blue-transparent glass
when intact; tarnished, rusted and verdigrised metal, glass gone, moss and vines
and rubble, interiors exposed when ruined. Secondary vocabulary of board-formed
concrete, shaped glass panes and brick. Not light-and-airy. Original forms in
that style — never a reproduction of a named real building.
