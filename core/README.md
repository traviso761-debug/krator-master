# core/

Code shared by more than one build, kept here once instead of copied into each:
`materials/` (the Ancients-lineage materials), `biome/` (the biome core every biome kit
runs on), `terrain/` (carve patches and relief functions for any heightfield world), `atmos/` (atmosphere and street
dressing), `sockets/` (cultural sockets), and three engine-neutral modules for the Godot port: `walk/` (floors and
blockers), `sched/` (motion and events as functions of time) and `minimap/` (a plan drawn from data), plus `rand/`
(the one generator, hash and noise a Godot port can reproduce), `clock/` (the world clock) and `tags/` (what a placed
thing is: ids, class, tags).

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
| `42-core-export.js` | `BIO.export()`: what a page placed, as data for Godot (`biomes/GODOT.md`) |
| `43-core-export-host.js` | `BIO.download(name, opt)` ([web], moves to `core/host/` in Phase 1): saves `BIO.export(opt)` as a `.biome.json`; no build calls it. List it after `42-core-export.js` in `CORE_BIOME`. With a box it also adds `stage` to `BIO.export` |
| `44-core-stage.js` | `KSTAGE` ([web], export time only): the page's look as data, so Godot can match it: lights, fog, tonemapping, the sky (a cube render saved as a panorama) and the ground's material, uvs and colours on the export's grid (`biomes/GODOT.md`, "The stage"). Also used by `core/atmos/89-atmos-9-host.js`. List it after `43-core-export-host.js` |

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

Locus and Mungo read this folder and `biomes/eastabyss/src` in place (since 2026-10-05: `BIO_CANON` in their
`build.py`, under Locus's old slot names `69a*`, `69c*`; their town trees use `EASTABYSS.make` / `grow`).
Worlds that vendored a kit (dalab from swlowlands, the Ancients kit from
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
sewer grates, lamps and fountains, InstancedMesh culling, the open-water wave field (`#include <atmos_waves>`) and the
sky's light on standard materials (`ATMOS.skylight`). One global (`ATMOS`) behind a five-item host binding, so any
three.js r128 build can take it. Read `atmos/README.md`. **Used by** `settlements/iziz` (city target; its `build.py`
reads it through `TARGET_CORE`), `settlements/voth` (the bay's waves), `settlements/girder` (the sky's light) and
`settlements/locus` with `settlements/mungo` (the lake's waves, shading only); they add `core/atmos` to their `build.py` core
loop and bind it in `src/90-atmos-host.js`.

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

## `furnish/`

The furniture glue, once (GODOT-PLAN.md Phase 2 item 4): a builder's `FURNISH(...)` becomes a placement record here,
and the build's own adapter draws it. Girder, Mav's Refuge, Locus, Highlands (and Roketstad) and Post-Apoc take it;
each lists the three fragments the way it lists `lod/`. `furnish/README.md` has the record, the adapters and the proof.

| File | What |
|---|---|
| `50-core-furnish.js` | [G data] `KFURN.create(cfg)`: the registry and the placement pass (records with ids, room and job; missing keys; the recentring table; the interiors hook; the summary). No THREE, no DOM |
| `52-core-furnish-draw.js` | [draw] a record into the catalog batch, and the sRGB-to-linear colour step |
| `53-core-furnish-host.js` | [web] `KFURN.flags()`: `?furniture=0`, `?interiors=` |
| `test-furnish.js` | `node core/furnish/test-furnish.js` |
| `fingerprint.py` | every furnished page's records and furniture meshes, compared with `fingerprint.json`: a change to this module must leave them `same` |

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
`src/88b-voth-minimap.js` feeds it the terrain, the roads, `PLACED` and the cantons), `settlements/locus` and `settlements/mungo`
(`88b-locus-minimap.js`: the ground, the streets by class, `PLACED`; Mungo adds its reed islands in `MINIMAP_EXTRA`) and `settlements/mungo` (`sched/`:
its `CORE_MODULES`; the simulation's group formations follow `KSCHED.formation`'s offsets) and `settlements/shade`
(`sched/` and `clock/` in its `CORE_MODULES`, with the simulation) and `settlements/yuni` (`minimap/` and `sched/`, its
`CORE_MODULES`: `src/88b-yuni-minimap.js` feeds the minimap the terrain, the river and canal, the street graph, the wall
and `FIX.buildings`; the volcano's cycle is `KSCHED.eruption`). `walk/` has no user yet.

## `materials/record/`: material records and the library loader

`GODOT-PLAN.md` Phase 3, as built 2026-10-03 (the how-to is `core/materials/PLAN.md`, "How a build adopts the library").
A subfolder, so the Ancients-lineage builds that take every top-level `core/materials/` fragment do not take these.

| File | What |
|---|---|
| `23-mat-record.js` | `KMAT` ([G data]): `record()` checks a material record in the Phase 3 vocabulary; `adapter(build, recs)`, `table(build)` (the export's material table: maps named by library set or `TEX.def` id); `pack()`/`packed()` hold the build's library pack |
| `24-tex-def.js` | `TEX` ([G data]): `kind()`, `def()`, `fn()` (the pure pixel function), `pixels()` (the bytes a canvas fill writes), `defs()` |
| `25-matlib-host.js` | [web]: `KMAT.mode` from `?mat=proc`, `KMAT.breakupOn` from `?breakup=0`, `KMAT.textures(entry, {aniso, flipY})` (data URLs to three.js textures; `flipY:false` for a card that replaces a canvas or data texture; `window._texPending`), `KMAT.image(entry, cb)` (the decoded image, for a build composing an atlas), `KMAT.specularHook`, `KMAT.breakupHook`, `KMAT.libHooks`/`libKey` |
| `test-record.js` | `node core/materials/record/test-record.js` |

**Used by** `settlements/girder` (its `build.py` reads this folder like `core/lod/`, and generates `46-matlib-pack.js`
from `tex/`, which `tools/textures/pack.py` writes from `materials.json`) and `settlements/yuni` (the same way, since
2026-10-05: 24 families on library sets, the interiors included; the rest procedural `TEX.def` kinds; `?mat=proc` is
the old look).

## `clock/`

The world clock, `KCLOCK` (`GODOT-PLAN.md`, Phase 1, "The world clock"): motion time `t` in seconds, and world time
(`hour`, `day`) that runs at one world day per 72 real minutes when it runs. The preview holds the hour by default; the
viewer runs time and sets the hour. Pure (no THREE, no DOM, no wall clock): the host steps it with its frame's `dt`.
`node core/clock/test-clock.js`. **Used by** `settlements/iziz` (city target, `TARGET_CORE`), `settlements/mungo`
(the whole page: `MCLOCK` drives the sky, the lights and the simulation; the Run time button), `settlements/locus`
(`LCLOCK` drives the sky and everything that reads its hour; the sky panel's slider and speed row feed the clock),
`settlements/shade` (held at noon; its probe steps the simulation with it), `settlements/yuni` (`YCLOCK` in `21-sky.js`
replaces the sky's own `SKY_T`, so `skyHour()` is the world clock everywhere it is read; held at 10:00, Run time, the sky
panel's rate row) and `simulation/example/`.

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
so nothing moved), `settlements/yuni` (only `core/tags`' uid hash: no draws; Yuni keeps its own Park-Miller `rnd()` and
`Math.sin` noise by the owner's decision, `GODOT-PLAN.md` Phase 2 item 1) and `core/simulation` (SIM's decision stream is
`KRAND.stream` when the module is loaded).

## `sockets/`

The cultural socket and banner/awning system: buildings declare sockets, a culture pack fills them (Iziz, Republic, Voth, Yuni, Beast Riders, generic). A worked example, `sockets/example/`,
builds a sheet of the same wall in every pack. Read `sockets/README.md`. **Used by** `kits/post-apoc` (its `build.py` reads `37-sockets.js`, `38-symbols.js` and `80-cultures.js` from here; a local copy with the same name overrides) and, for the symbols alone, `kits/catalog` (vendored as `krator-symbols.js`).

## `tags/`

One engine-neutral registry of what every build places (an order id, a position-hash `uid`, class, kind, tags from one
vocabulary), for the inspector, the minimap, the exporters and Godot node metadata (GODOT-PLAN.md Phase 2 item 3).
`tags/README.md` has the record, the ids, the uid recipe Godot reproduces, the vocabulary and the adopters;
`tags/PROPOSAL.md` is the design with Travis's decisions. Needs `rand/` loaded first. **Used by** `settlements/yuni`
(its fixtures registry forwards into it; `KRATOR_EXPORT.tags()`).

| File | What |
|---|---|
| `50-core-tags.js` | [G data] `KTAGS.create({build})`: `add`, `child`, `get`, `remove`, `query`, `at`, `audit`, `export`; `KTAGS.uid`, `KTAGS.norm`. No THREE, no DOM |
| `52-core-tags-vocab.js` | [G data] `KTAGS.VOCAB`: the 18 cultures and their aliases, types, wealth, the other tag vocabularies, id prefixes; the catalog's lists copied and checked by the test |
| `53-core-tags-host.js` | [web] `KTAGS.label(rec, instance)`: the inspector's text, generated |
| `test-tags.js` | `node core/tags/test-tags.js` (`--write` rewrites `golden.json`) |
| `ktags.gd`, `ktags_test.gd`, `golden.json` | the uid in GDScript and its vectors (passing in Godot 4.5); copied to `godot/tests/tags/` |

## `mask/`

A city's placement raster (GODOT-PLAN.md Phase 2 item 5): `KMASK.canvas(w, h)` stands in for the canvases the four
mask-placed cities paint their buildable mask and street classes on, with the same calls, rasterised hard-edged by
pixel centre so every browser (GPU or CPU canvas) and Godot get the same bytes. `mask/README.md` has the rule.
**Used by** the city targets of `settlements/iziz`, `dalab`, `xanadu` (Erewhon) and `highlands` (Roketstad), each
through `TARGET_CORE`, and by `settlements/locus` and `settlements/mungo` (their `MASK_CANVAS`, through the transform layer
`26-core-mask-xform.js`: `KMASK.xform(cv)` takes the painters' scale/translate/rotate and hands KMASK plain pixel numbers).

| File | What |
|---|---|
| `25-core-mask.js` | [G data] `KMASK.canvas`, `hash`, `ops`, `export`; the rasteriser (`disc`, `ring`, `polyline`, `polygons`, `rect`) |
| `26-core-mask-xform.js` | [G data] `KMASK.xform(cv)`: save/restore, translate/scale/rotate, full ellipses, applied before KMASK sees a point (the ops stay plain numbers, so `kmask.gd` is unchanged); non-portable calls throw |
| `test-mask.js` | `node core/mask/test-mask.js` (`--write` rewrites `golden.json`) |
| `test-mask-xform.js` | `node core/mask/test-mask-xform.js`: world-space calls give the same bytes and ops as the shapes in pixels; the negatives throw |
| `kmask.gd`, `kmask_test.gd`, `golden.json` | the GDScript twin, replaying the ops to the same bytes (passing in Godot 4.5); copied to `godot/tests/mask/` |

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

The World Simulation Layer. `simulation/ROADMAP.md` is the design (factions, activities, schedules, routes, events,
engine-independent world IR) and `simulation/PLAN.md` is the survey of every current life layer and the phased plan to
move them onto one shared vocabulary. Read `PLAN.md` before touching any build's life fragment, and `SCHEMA.md` before
writing a settlement's `world/*.json`.

**Phase 1 is built (2026-10-05), with `settlements/mungo` as its first consumer and `settlements/shade` its second.**
`SIM`, one global, no THREE, no DOM:

| File | What |
|---|---|
| `77-sim-0-core.js` | the host binding (`SIM.init`: world hour and day, motion time, seed, error sink), the seeded decision stream, the registries (`SIM.add/get/all`), schedules (`SIM.sched`: spans to 24 hours), the overlay (`SIM.load`: override by id, add, remove; a relation's id defaults to `a>b`) and `SIM.check` (every reference resolves), the decision log |
| `77-sim-1-world.js` | factions, organisations, directional relations (`SIM.stance`: org over faction, default neutral), presence, `SIM.welcome(actor, place)` |
| `77-sim-2-places.js` | activities; places offering activities in SLOTS (and a shared `cap`: people present over all of them), hours, indoor flags, spots; `SIM.placesFor`, `reserve`/`release`; `slotsFromFurniture` (furniture jobs and types as slots) |
| `77-sim-3-actors.js` | roles (`sched`, `prefers`, `cycle`, `fallback`), actors, groups, ports, EVENTS (caravans and rider bands that arrive together, stay on their own schedules, leave together; an itinerary of `legs`, stop to stop together and out; excursions: one resident takes a vehicle out and back); the resolver (`SIM.decide`: pinned, remembered, preferred kinds, any; unreachable places struck off); the motion baked as legs (walk / ride / drive / boat, `via` a boarding place); `SIM.step()` once per simulated minute; `SIM.jump()` when the clock jumps |
| `77-sim-4-nav.js` | the NAV contract per layer (`pedestrian road water animal ...`): graph layers (A* on a heap, cost per edge kind, width), grid layers by a host route function; node-pair path cache |
| `77-sim-5-motion.js` | `SIM.pose(actor, t)`: a pure function of motion time (along the legs, or at the spot with a hashed idle wander); group members trail their leader |
| `77-sim-6-population.js` | `SIM.populate`: residents from the roles' counts and home kinds (or place ids; `deal:'round'` deals them in turn), work dealt round-robin, boats at docks, vehicles at bases; a `fill` role takes the beds left |
| `77-sim-8-export.js` | `SIM.export()`: `format:'krator-sim'`, the export convention, every record kind in its JSON shape |
| `77-sim-9-debug.js` | `SIM.audit()` (unknown activities, hourly capacity filled scarcest first with caps shared, unreachable places and ports), a build's own checks on the same report (`SIM.audits`), `SIM.census()`, `window._sim` |
| `test-sim.js` | `node core/simulation/test-sim.js`: 37 checks on a toy world, each with a negative |
| `example/` | the smallest world on the module alone (core/rand, core/clock, SIM; a 2D canvas): 20 townsfolk and a caravan. `python3 build.py && python3 check.py` (4 checks and 4 negatives, determinism across loads). The worked example to copy |

A build takes it by listing `simulation` in its core modules (Mungo's `CORE_MODULES`) and putting its own data and
embodiment after `77-`: Mungo's `78b-mungo-world.js` registers the layers and places from its geometry, `world/*.json`
(inlined by `build.py` as `78a-world-json.js`) supplies factions, roles and events, `84-mungo-life.js` draws. Shade's
`84-host-life.js` registers its walkable grid as a grid layer, its places from `44-host-layout.js` and its ports, loads
`world/*.json` (`83-host-world-json.js`), and adds its own audits (only way up, convoy, commutes) to `SIM.audit()`; its
`_life.OUT` numbers are the ones it had before SIM. Not yet: tools/sim_scaffold.py and tools/sim_check.py, the
GDScript twin, LOD tiers, stockpiles.
