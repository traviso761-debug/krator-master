# core/

Code shared by more than one build, kept here once instead of copied into each:
`materials/` (the Ancients-lineage materials), `biome/` (the biome core every biome kit
runs on), `terrain/` (carve patches and relief functions for any heightfield world), `atmos/` (atmosphere and street
dressing), `sockets/` (cultural sockets), and three engine-neutral modules for the Godot port: `walk/` (floors and
blockers), `sched/` (motion and events as functions of time) and `minimap/` (a plan drawn from data), plus `rand/`
(the one generator, hash and noise a Godot port can reproduce) and `clock/` (the world clock).

## `materials/`

| File | What |
|---|---|
| `20-textures.js` | procedural canvas textures (`TEX.*`) and packed roughness/metal maps |
| `22-materials.js` | the base `MAT` table: `white rust verdigris glass winIntact winDead dark guts pipe pipeRust strip dot moss vine rubble fig ground slab stain`, plus the glass Fresnel patch |
| `68-mat-v5.js` | `MAT.rock lawn water mud turf turfR spray darkGlass` |
| `PLAN.md` | the material library plan: a shared PBR base library for every build, culture pattern sheets, sources, prompts, status and next steps (GODOT-PLAN.md Phase 3) |
| `library/`, `patterns/` | processed texture sets (colour, normal, roughness, `meta.json`), made by `tools/textures/process.py` |

**Used by** the six Ancients-lineage builds: `kits/ancients`, and `settlements/`
`dalab`, `highlands`, `iziz`, `reedlake`, `screamers`. Each `build.py` adds
these files to its fragment list through `srcpath()`/`CORE_FILES`. They sort
into the same place they held when each build had its own copy.

**Override:** a build that needs a different version keeps a file with the same
name in its own `src/`. That copy wins for that build only. Record why in the
build's `KNOWN_ISSUES.md`.

**After editing a file here,** rebuild all six builds and check each one by eye.
A material change is visible everywhere at once.

### Textures are painted lazily

`canvasTex` paints a texture the first time something reads its `.image`, which three.js does when it first draws
with it. A page pays only for the textures it shows: painting all of them at load was about 11 s of every Ancients
page's start-up. The pixels are the same either way.

**A texture whose painter calls `rng()` must pass `eager=true`** (the fifth argument), or every later draw in the
seeded stream shifts and the world changes. Screamers' `TEX.thatch`, `TEX.lash`, `flBarkTex` and `skyTex` do.
Painters that use only `h3`/`vnoise`/`fbm`, or `Math.random`, need nothing.

### `materials/opt/`: opt-in shared fragments

Every digit-named file in `materials/` goes into every build that reads it (kits/ringsea takes them all). A
fragment only some builds want lives in `materials/opt/` instead, and a build takes it by naming it in
`CORE_OPT_FILES` in its `build.py` (`srcpath()` and `build_one()` fall back to it; a local copy still wins).

| File | What | Opted in by |
|---|---|---|
| `opt/69a-world-uv.js` | `vWorldUV(mat,K[,Kv])`: world-unit UVs for instanced boxes, re-tiled by instance scale per face. One shader program per K | `kits/ancients`, `settlements/iziz`, `highlands`, `xanadu`, `reedlake` |

**The world-UV fix (2026-10-01).** The hook used to be a closure copied into several places (`69b-vern-mat.js` in
Iziz, Highlands, Xanadu, Reedlake and Dalab; `izsWorldUV` in `77z-iziz-style.js`). three.js keys a compiled program
on `onBeforeCompile.toString()`, and a closure prints the same source whatever K it captured, so every world-UV
material in a page rendered at the K of whichever compiled first. Xanadu worked round it (`xUVKey`). The shared copy
builds the hook with `Function()`, so K is in the hook's source text (the key differs per K and survives `kbake`'s
material clone, so `30-kit.js` needs no change), and sets `customProgramCacheKey` as well.

**Still on the old closure:** only `settlements/dalab` (its own `69b-vern-mat.js` and `71-hl-mat.js`; Dalab is
left alone, its drift is deliberate). To move it over: delete `vWorldUV` from its `69b`, re-vendor `71-hl-mat.js`
(whose `hWorldUV` now calls the shared hook), add `CORE_OPT_FILES` and the `srcpath`/`build_one` fallback to its
`build.py` (copy them from `settlements/reedlake`), and rebuild. Highlands' `hWorldUV` (Ku != Kv, 71-hl-mat) was
the same kind of closure and now calls `vWorldUV(mat,Ku,Kv)`.

Checked and not affected: `settlements/jimjam` (`jjWorldUV` is already keyed per K; it also scales plain meshes, so
it is a different function); the Voth-lineage `applyWorldUV` in girder, mavs-refuge and locus (each material sets
`customProgramCacheKey` with its scale); port, screamers, kits/post-apoc, kits/ringsea and biomes/* have no
world-UV hook.

### What is not here yet

These material fragments drifted between builds, so they stay vendored:
- `54-mat-concrete.js`: three versions (ancients+highlands+iziz+jimjam+port+reedlake+xanadu, dalab, screamers)
- `69-mat-salvage.js`: two versions (ancients+dalab+highlands+iziz+port+reedlake+xanadu, screamers)
- the local layers `69b-vern-mat`, `71-hl-mat`, `74-rl-mat`, `69d-dalab-mat`

The Ancients versions of `54` and `69` are byte-identical in seven builds and belong in `materials/opt/`, but Dalab,
Port and Reedlake vendor-check them against `kits/ancients/src` and `settlements/highlands/src`: take the copies out
of those folders and those checks report the files as missing upstream. Move them in a pass that may also change
those builds' `build.py`.

Merge a drifted file only once its differences have been read and the merged
version renders correctly in every build that uses it.

Voth and Yuni use a separate system: a frozen `PAL` palette and `FAMMAT`
material families, instanced per family under a draw-call budget. The catalog
in `kits/catalog/` uses family strings (`'wood'`, `'cloth'`, `'plank'`…) plus a
colour. Neither is compatible with `MAT`.

## `biome/`

The biome core: the engine-independent kit every biome in `biomes/` is written against
(`BIO`: the host binding, the PRNG and noise, instanced items and merged buckets, the
foliage hook, placement, the runtime LOD, kits, export). One copy, merged from the nine
copies the kits carried (Oct 2026). xanadu's is the base (runtime LOD); the others'
additions are in it, each marked with the kit it came from:

| File | What |
|---|---|
| `10-core-head.js` | `BIO`, `BIO.fn` (rng, noise...), `BIO.init` and the host binding: fields (wet, salt, upland, flow, mist, cold, rock), `waterH`/`depth`, `register`, detail radii (`BIO.radii()`), windows, `eye`, the world's `clock` and `wind` (one wind for leaves and atmosphere) |
| `20-core-kit.js` | kits (`BIO.kit`, `BIO.kitEnd`), items and buckets on Float32 stores, extra per-instance vec4s, the runtime LOD (`BIO.LOD`, `BIO.range`, `BIO.lodTick`), indexed bake, `BIO.dynamic`/`BIO.tick` |
| `30-core-foliage.js` | leaf textures and cards, the foliage and bark hooks, the wind clock, `BIO.col` |
| `35-core-anim.js` | animated items (orbit, flit, walk; flapping wings, swinging legs) for fauna |
| `40-core-place.js` | stands, `BIO.grid` (accept first, `depth`, `box`), `BIO.scatter`, keep-clear, surface sampling for `dress()` (`BIO.faceSamples` takes shells: `{geos, share}`) |
| `test-place.js` | `node core/biome/test-place.js`: the surface sampler's contract, each check with a negative |
| `42-core-export.js` | `BIO.export()` / `BIO.download()`: what a page placed, as data for Godot (`biomes/GODOT.md`) |

**Used by** all nine kits in `biomes/`: each lists the files in `CORE_BIOME` in its
`build.py`, read from here unless its `src/` has a copy of the same name (none does).
hyperjungle also lists `35-core-anim.js`, and takes the core's helpers as globals in its
own `41-hyperjungle-globals.js` (it was written when the core declared them). `build.py`
stops if any of the four base files is missing (the syntax check cannot see an absent fragment).

**Kits.** Several kits can share one page (`biomes/WORLD.md`). Each kit calls
`BIO.kit('<name>')` at the top of its first fragment and `BIO.kitEnd(<API>)` at the end of
its last: it gets its own registry of items and buckets (two kits may both have a `trunk`),
its exported functions run in that registry, and material cache keys carry its name
(`BIO.kitKey`), so two kits' `grass` cannot share one compiled shader. Mesh names stay
`biome:<name>`; `userData.kit` says whose.

**`BIO.LOD`** is both the runtime LOD's settings (`chunk`, `scale`) and, called, the detail
radii (sedesert's `BIO.LOD()`, the same as `BIO.radii()`), so sedesert's fragments and
Shade's copies of them run unchanged.

**Proving a change.** The page's HTML changes with the core, so its hash proves nothing.
Compare the baked geometry instead: every biome mesh's attributes and instance buffers,
hashed per mesh name, before and after (fauna moved every frame by a script are hashed by
their geometry only). Identical means the change moved nothing.

Worlds that vendored a kit (dalab from swlowlands, locus and the Ancients kit from
eastabyss, iziz, screamers and the Ancients kit from hyperjungle, Shade from sedesert, the
xanadu settlement) keep their copies. dalab's, iziz's and Shade's `--vendor-check` compare
their core with this folder and report the drift; each records it in its `KNOWN_ISSUES.md`.
Re-vendor when that world is next rebuilt and verified, or switch it to read this folder.

`biomes/WORLD.md` is the plan this core grows toward: several kits in one open world, and
Godot (`biomes/GODOT.md`).

## `terrain/`

| File | What |
|---|---|
| `36-core-carve.js` | carve patches: overhangs (alcoves, niches, undercuts, or a shape a build registers) on a heightfield world. Global `KCARVE`; with the biome core loaded also `BIO.carve` |
| `test-carve.js` | `node core/terrain/test-carve.js`: the module's contract on a synthetic cliff, each check with a negative |
| `38-core-relief.js` | relief functions, all plain maths of (x,z) and a seed (global `KRELIEF`): `range` (a wall of mountains along a line: steep sides, broad serrated top, eased toe, tapered ends), `join` (where ranges meet: the tallest plus a quarter of the rest), `volcano` (a concave cone with gullies and a crater), `fields` (an enclosure lattice: field kinds, crop-row directions and hedge polylines, with missing hedges merging fields), `river` (a water surface that never climbs downstream, with the slope per vertex for foam) |
| `test-relief.js` | `node core/terrain/test-relief.js`, each check with a negative |

`38-core-relief.js`'s provenance is in `TODO.md`; no build uses it yet. It needs nothing at all, so a build lists it in `CORE_TERRAIN` (biomes)
or as an ordinary fragment, and a Godot port evaluates the same functions at export or ports them line for line.

**Used by** `biomes/sedesert` and `settlements/shade`. Opt-in by name: every
biome's `build.py` has a `CORE_TERRAIN` list (empty in the biomes that do not use
it), and a listed file is read from here unless the build's `src/` has a copy with
the same name, which then wins for that build only (record why in its
`KNOWN_ISSUES.md`). A biome that lists nothing builds byte-identical.

The module needs nothing but THREE (at `mesh()` only, from `opt.THREE`,
`BIO.host.THREE` or the global) and works outside the biome core too (an
Ancients-lineage settlement can load it as an ordinary fragment). To use it a
build must:

1. **declare patches** with `KCARVE.add({...})` before it builds its ground, each
   with a `base(x,z)`: its ground height WITHOUT the patch;
2. **fold `KCARVE.recessD(x,z)` into its wall function** (`min` with its own
   distance to the floor's edge), so the floor runs in under each hood;
3. **mesh the rock back** with `KCARVE.mesh(groundMaterial, {sun})` and give the
   meshes the ground's material (the patch is in world space, so a triplanar or
   world-position shader joins without a seam); `aOcc` and `aSun` are vertex
   attributes for the material to multiply in;
4. **teach its consumers**: no flora where `topAt(x,z)` is set, a camera pushed
   out of `rockAt`, walkable cells blocked where `rockAt(x, ground+1, z)`.

Shade's `45-host-stage.js` and `84-host-life.js` are the worked example. The
contract and its tunables are in the header of `36-core-carve.js`.

## `atmos/`

The atmosphere and street-dressing module: evening lights and a glow layer, particles, weather, ivy and window boxes,
sewer grates, lamps and fountains, InstancedMesh culling. One global (`ATMOS`) behind a five-item host binding, so any
three.js r128 build can take it. Read `atmos/README.md`. **Used by** `settlements/iziz` (city target; its `build.py`
reads it through `TARGET_CORE`).

## `lod/`

Level of detail for any three.js r128 build: `09-lod.js` (the `LOD` global) and `97-lod-auto.js` (applies it to the
build's `scene` once everything is built). It works on the finished scene: big merged meshes are cut into frustum-culled
chunks that share the original vertex buffers and switch to clustered proxies with distance, InstancedMeshes keep one
draw call and drop their smallest instances first, and the originals stay the raycast targets, so inspectors and
probes see full detail. `LOD.enabled=false` restores the exact scene graph; `LOD.stats()` and `LOD.measure()` report
draw calls and triangles with it off and on. Read `lod/README.md`.

**Used by** every settlement and `kits/ancients`: `port`, `jimjam`, `reedlake`, `screamers`, `voth`, `yuni`, `locus`,
`iziz`, `highlands`, `xanadu`, `dalab`, `mavs-refuge`, `girder`. Each `build.py` adds the `core/lod/` files to its
fragment list next to its `CORE_FILES`/`CORE_OPT_FILES` (a `src/` copy with the same name overrides) and lists both in
`DETERMINISTIC`. A build passes options through `window.LOD_OPTIONS` (port, screamers, voth, highlands, dalab).

## `walk/`, `sched/`, `minimap/`: engine-neutral, for the Godot port

Three small modules with no THREE and no DOM in their data side, each with a node test (each check has a negative).
Their provenance is in `TODO.md`. Each is a global; a build adds the file to its fragment list
and to `DETERMINISTIC` (none of them draws from the seeded stream).

| File | What |
|---|---|
| `walk/20-core-walk.js` | `KWALK`: one list of walkable floors (level rects, sloping strips) and blockers, written by whatever builds the geometry as it builds it (after Moria's carver). Queries `floorsAt`, `floorBelow`, `blocked`, `push` (a walker slides round corners), and `export()` (navigation-mesh source and collision boxes for Godot) |
| `sched/20-core-sched.js` | `KSCHED`: repeating timetables of eased segments (`timeline`), conflict-free phases (`slots`), a periodic event's strength (`eruption`: geysers), formations in the leader's frame, and a queued approach that slows as it arrives. Pure functions of t, so Godot plays them back identically |
| `minimap/88-core-minimap.js` | `KMAP` ([G data]): a plan as records (rects, turned boxes, strips, discs, labels, a hill-shaded relief grid, or a `KWALK` registry), `pick`, `paint` and `overlay` onto any 2D-context-like object, `export()` the plan as data. No document, no canvas of its own, no input |
| `minimap/88a-core-minimap-host.js` | the browser panel ([web], moves to `core/host/` in Phase 1): `KMAP.mount(M, op)`, also attached as `M.mount(op)`. Base painted once and repainted when `M.rev()` moves, overlay a few times a second, hover names, click goes there, M toggles. A build takes both files |
| `walk/test-walk.js`, `sched/test-sched.js`, `minimap/test-minimap.js` | `node core/<dir>/test-*.js` |

**Used by** `settlements/voth` (the minimap: its `build.py` reads `core/minimap/` like `core/lod/`, and
`src/88b-voth-minimap.js` feeds it the terrain, the roads, `PLACED` and the cantons). `walk/` and `sched/` have no
user yet.

**Testing the minimap hover in headless Chromium** (checked on Voth, 2026-10-03: the hover bar draws; no code fault). A
check that sees "no change" is usually probing wrong, not the panel. What works:

- Open the map with a real `page.keyboard.press('m')`, wait ~2 s, then read the canvas rect from
  `document.querySelector('.kmap canvas').getBoundingClientRect()`.
- Aim at a record, not at a guess. `_minimap.export()` gives `frame` `[x0,x1,z0,z1]` and the records; a disc or box
  record has `x`,`z` and a `name`. Pixel = `(x-frame[0])/(frame[1]-frame[0])*300` and the same for z (map size is 300).
  Most of the canvas is water or ground with no record, which draws no bar, so a blind grid of moves reads as "dead".
- One `page.mouse.move(rect.x+px, rect.y+py)` is enough. Under software GL with Voth's render loop a move takes
  ~1.5 s to return; do not scan a grid (hundreds of moves run for many minutes). Then wait 200 ms or more.
- Read the result from canvas pixels, never an element screenshot (it times out): the bar is `rgba(0,0,0,.65)` over the
  bottom 16 px, so sample `getImageData(290,286,1,1)` before (217 on the water-blue base) and after (76).
- To prove delivery, add a `mousemove` counter listener to the canvas first; `elementFromPoint` there is the canvas.
  The 4 Hz redraw timer keeps `hoverTxt`, so the bar survives to the next frame.
- Do not `pkill -f` a pattern that also matches your own shell command line.

## `clock/`

The world clock, `KCLOCK` (`GODOT-PLAN.md`, Phase 1, "The world clock"): motion time `t` in seconds, and world time
(`hour`, `day`) that runs at one world day per 72 real minutes when it runs. The preview holds the hour by default; the
viewer runs time and sets the hour. Pure (no THREE, no DOM, no wall clock): the host steps it with its frame's `dt`.
`node core/clock/test-clock.js`. **Used by** `settlements/iziz` (city target, `TARGET_CORE`).

## `rand/`

`KRAND` (`GODOT-PLAN.md`, Phase 2, item 1): the generator, hash and noise a Godot port reproduces bit for bit.

| File | What |
|---|---|
| `rand/08-core-rand.js` | `KRAND.stream(seed)`: mulberry32, the same numbers as every lineage's `rng()`/`reseed()` (the test proves it against `kits/ancients` and `core/biome`), so moving draws onto a stream moves nothing. `hash(seed, ints...)`, `h3`, `vnoise`, `fbm`: an integer lattice hash (murmur3's finalizer) in place of the `Math.sin` hash, with the lineages' smoothstep noise on top; moving a build's noise onto it moves that build once. `cell(seed, ix, iz)` and `child(seed, name)`: seeds for a placement cell and for a named sub-stream |
| `rand/golden.json` | the vectors: 1000 draws for 20 seeds, 3000 hashes, 4000 noise values, 1000 cell seeds, 30 child seeds (digests plus the first few values) |
| `rand/test-rand.js` | `node core/rand/test-rand.js` (`--write` regenerates the vectors: only when the algorithm is meant to change) |
| `rand/krand.gd`, `rand/krand_test.gd` | the GDScript twin and its golden test. Not yet run inside Godot: the first test of the Phase 7 project |
| `rand/test_rand.py` | `python3 core/rand/test_rand.py`: `krand.gd` transliterated to Python with the same 64-bit tricks (split multiplies, u32 masks), passing the vectors, so the twin's arithmetic is proven before Godot runs it |

Rules: lattice coordinates and hash inputs are int32; floats are floored. No `Math.sin`, `pow`, `exp`, `log` or
`random` in the module (the test greps for them). A new build takes `core/rand` from the start (`GODOT-PLAN.md` rule 2).
**Used by** `settlements/ys` (city target, `TARGET_CORE`: the P3 placement pass draws from it; nothing placed yet,
so nothing moved).

## `sockets/`

The cultural socket and banner/awning system: buildings declare sockets, a culture pack fills them (Iziz, Republic, Voth, Yuni, Beast Riders, generic). A worked example, `sockets/example/`,
builds a sheet of the same wall in every pack. Read `sockets/README.md`. **Used by** `kits/post-apoc` (its `build.py` reads `37-sockets.js`, `38-symbols.js` and `80-cultures.js` from here; a local copy with the same name overrides) and, for the symbols alone, `kits/catalog` (vendored as `krator-symbols.js`).

## Planned: a material registry

This comes later, with the furniture kit and the Blender export. The plan is not
to merge the three systems into one implementation. **The seed of steps 1 and 2 exists** in
`kits/catalog/krator-asset-engine.js`: `CATALOG_MATERIALS` is the canonical list (timber, stone,
plaster, metal, rustSteel, glass, cloth, rope, thatch, foliage, skin, emissive, and since the
interiors furniture pass bamboo, reed, hyperMahogany, nacre, gold, bronze, lacquer, ceramic,
obsidian, jade, bone, hide, wicker, plastic), each with tags and the catalog family strings it
covers; `CORE_MATERIAL_MAP` says which `MAT.*` here and which `FAMMAT` family each name lands on.
Every catalog furniture piece declares its canonical names and `kits/catalog/verify.py` checks
them against what it builds. Instead:

1. **One list of canonical material names** (`slate`, `glazedTile`, `rustSteel`,
   `timber`, `cloth`…), each with tags (stone, metal, wood, fabric, glass,
   organic; weathering) and a Blender Principled BSDF recipe (base colour,
   roughness, metallic, and which procedural texture to bake).
2. **Each system maps its own names onto it**: `MAT.rust → rustSteel`,
   `FAMMAT.slate → slate`, catalog `'wood' → timber`.
3. **Exports carry canonical names.** A glTF export names each material by its
   canonical name, and one `bpy` script turns those into proper Blender
   materials for every settlement.
4. **Portable assets check against the registry.** A piece of furniture or a
   building declares the canonical materials it uses, and a host build must
   map every one of them.

## `simulation/`

The World Simulation Layer: documents only for now. `simulation/ROADMAP.md` is the design (factions, activities, schedules,
routes, events, engine-independent world IR) and `simulation/PLAN.md` is the survey of every current life layer and the
phased plan to move them onto one shared vocabulary. Read `PLAN.md` before touching any build's life fragment.
