# core/

Code shared by more than one build, kept here once instead of copied into each:
`materials/` (the Ancients-lineage materials), `biome/` (the biome core every biome kit
runs on), `terrain/` (the baked terrain field, carve patches and relief functions for any heightfield world), `atmos/` (atmosphere and street
dressing), `water/` (every wet surface: open water on a CDLOD mesh, the CPU twins things float on), `sockets/` (cultural sockets), and three engine-neutral modules for the Godot port: `walk/` (floors and
blockers), `sched/` (motion and events as functions of time) and `minimap/` (a plan drawn from data), plus `rand/`
(the one generator, hash and noise a Godot port can reproduce), `clock/` (the world clock), `tags/` (what a placed
thing is: ids, class, tags), `space/` (the one spatial index placement passes share) and `export/` (the one
`krator-world` container every module gives its part to, for Godot). `charactermodels/` (the people: MakeHuman bodies,
clothes, peoples and clips, with two labs) is a build of its own as well as a module. `audio/` (sound: the clip
catalogue and its license policy so far; cues, soundscapes, the music director and the Audio Lab to come; `audio/PLAN.md`).

## `ruins/`

`KRUINS`: every ruined structure is watched once drawn (`KRUINS.watch(root, {name, ground})`), and the verify harness asserts it: no piece
touching nothing, every wreck on its lowest points on the ground (the owner, 2026-11-10: the default for ruined structures). `ruins/README.md`.

## `shader/`

`KHOOK` (the one door for shader hooks: layers in a fixed order, a program keyed from them, an anchor that throws, `checkPrograms`)
and `KCOLOR` (display against linear). On every page: `khost.resolve` adds them. `shader/README.md`.

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
| `30-core-foliage.js` | leaf textures and cards, the foliage and bark hooks (`leafMat`, `barkMat`, the iridescent `iridBarkMat`: the `irid` kind, tints `colA`/`colB`), the wind clock, `BIO.col` |
| `35-core-anim.js` | animated items (orbit, flit, walk, and `breath`: one scalar moving a part of every item of a kit; flapping wings, swinging legs) for fauna and for what breathes |
| `41-core-env.js` | the environmental fields' contract (`BIO.ENV`, [G data], opt-in): one set of host fields with units, and thin adapters `BIO.env`, `BIO.envCheck`, `BIO.envInto` from the ground, `WATER.fields` and `KTHERM`. `core/biome/README.md` |
| `36-core-walker.js` | walkers: a grazing or roaming animal's pose as a pure function of the clock (`BIO.walker`, `BIO.walkAt`, `BIO.walkPitch`, `BIO.walkLoop`), so the export's motion bake takes it (`biomes/GODOT.md`, "Motion"). Opt-in: swbay, hyperjungle and the builds that run their fauna list it. `node core/biome/test-walker.js` |
| `37-core-traps.js` | the carnivorous plants' trap rules (global `KTRAPS`, [G data]): the trap record (`make`: kind, mouth, prey class, cycle, lure, danger), `state(trap, t, id, speed)` (its cycle by a hash of its id), `catches(trap, prey)` (by the fauna kit's mass classes; a person only where danger > 0), and `GLSL`, the shader's twin of `state`. Opt-in: `biomes/necanyons` first (Korona next). `node core/biome/test-traps.js` |
| `40-core-place.js` | stands, `BIO.grid` (accept first, `depth`, `box`), `BIO.scatter`, keep-clear (`BIO.clearOf`, `clearOf3`; both and `scatter`'s spacing read a `core/space` grid when the page loads it), surface sampling for `dress()` (`BIO.faceSamples` takes shells: `{geos, share}`) |
| `test-place.js` | `node core/biome/test-place.js`: the surface sampler's contract, and keep-clear and scatter on `KSPACE` equal to the linear scans they replaced (frozen in the test), each check with a negative |
| `test-tags.js` | `node core/biome/test-tags.js`: the biome core on core/tags (one kit built with tags and without: identical meshes; every instance names its set and the uid of its own position; the export's ids), each check with a negative |
| `42-core-export.js` | `BIO.export()`: what a page placed, as data for Godot (`biomes/GODOT.md`); `BIO.exportParts`, the same parts given to core/export's `krator-world` (items, buckets, materials, textures, terrain) |
| `43-core-export-host.js` | `BIO.download(name, opt)` ([web], moves to `core/host/` in Phase 1): saves `BIO.export(opt)` as a `.biome.json`; no build calls it. List it after `42-core-export.js` in `CORE_BIOME`. With a box it also adds `stage` to `BIO.export` |
| `44-core-stage.js` | `KSTAGE` ([web], export time only): the page's look as data, so Godot can match it: lights, fog, tonemapping, the sky (a cube render saved as a panorama) and the ground's material, uvs and colours on the export's grid (`biomes/GODOT.md`, "The stage"). Also used by `core/atmos/89-atmos-9-host.js`. List it after `43-core-export-host.js` |

**Used by** every kit in `biomes/`: each lists the files in `CORE_BIOME` in its
`build.py`, read from here unless its `src/` has a copy of the same name (none does), and `core/space`'s
`20-core-space.js` in `CORE_SPACE` beside it (openworld/little-demo lists it in its `ORDER`).
hyperjungle also lists `35-core-anim.js`, and takes the core's helpers as globals in its
own `41-hyperjungle-globals.js` (it was written when the core declared them). `build.py`
stops if any of the four base files is missing (the syntax check cannot see an absent fragment).

**Kits.** Several kits can share one page (`biomes/WORLD.md`). Each kit calls
`BIO.kit('<name>')` at the top of its first fragment and `BIO.kitEnd(<API>)` at the end of
its last: it gets its own registry of items and buckets (two kits may both have a `trunk`),
its exported functions run in that registry, and material cache keys carry its name
(`BIO.kitKey`), so two kits' `grass` cannot share one compiled shader. Mesh names stay
`biome:<name>`; `userData.kit` says whose.

**Keep-clear and scatter read `core/space`** (Oct 2026). `BIO.clearOf`/`clearOf3` read `BIO.host.obstacles` through
a `KSPACE` grid (24 m cells) that files whatever was pushed since the last query (a swapped array, a shorter one or a
changed last entry is filed afresh; an entry or a query whose x, z or r is not a number goes to the plain scan; eight
obstacles or fewer are scanned), and `BIO.scatter` tests its spacing through a grid of cell `minD`, so neither grows
with the square of the count. The candidates come back in insertion order and take the same test, so the answers are
the scans' exactly (`test-place.js`, and every kit's baked geometry hashed the same before and after). An obstacle
changed in place after it was pushed is not seen: push a new one. A page without `core/space` (the settlements that
read this folder: Yuni, Locus, Mungo, Verge, Dhelv, Voth) runs the scans as before.

**Records (core/tags, 2026-10-12).** With `BIO.init({tags: '<build>'})` (and core/rand and core/tags in the build:
`CORE_TAGS` in each kit's `build.py`) every item a kit puts is one core/tags item set, its instances read from the
item's own matrices, and every volume a kit registers (`BIO.register`, `BIO.record` from the host's `REGISTER`) a
record; a baked mesh names its set (`userData.krator`) and `BIO.recordsOf(mesh)` gives each row's uid and index
(`20-core-kit.js`, "core/tags: what a kit places, as records"; `biomes/GODOT.md`, "Records"). Without `tags` nothing
runs: the worlds that take this core but not core/tags draw and export exactly as before.

**`BIO.LOD`** is both the runtime LOD's settings (`chunk`, `scale`) and, called, the detail
radii (sedesert's `BIO.LOD()`, the same as `BIO.radii()`), so sedesert's fragments and
Shade's copies of them run unchanged.

**Proving a change.** The page's HTML changes with the core, so its hash proves nothing.
Compare the baked geometry instead: every biome mesh's attributes and instance buffers,
hashed per mesh name, before and after (fauna moved every frame by a script are hashed by
their geometry only). Identical means the change moved nothing.

Locus and Mungo read this folder and `biomes/eastabyss/src` in place (since 2026-10-05: `BIO_CANON` in their
`build.py`, under Locus's old slot names `69a*`, `69c*`; their town trees use `EASTABYSS.make` / `grow`).
Yuni reads this folder and `biomes/ebadlands/src` the same way (since 2026-10-06, `BIO_CANON` in its `build.py`, `69a*`
and `69c*`; its host binding is `src/69b-yuni-biohost.js`, the planting `src/69z-yuni-badlands.js`).
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
| `30-core-field.js` | the terrain field (global `KFIELD`, [G data]: no THREE, no DOM): a world's `terrainH` baked once onto a Float32 heightmap in metres, with finer insets, named water surfaces and an optional land-cover byte grid; `h(x,z)` is bilinear sampling, `export()` the `krator-field` file Godot reads. Below |
| `test-field.js`, `golden-field.json` | `node core/terrain/test-field.js` (each check with a negative; `--write` rewrites the golden file): the contract, and the golden vectors `kfield.gd` is held to |
| `kfield.gd`, `kfield_test.gd` | the GDScript twin (`class_name KField`: `from_export`, `h`, `normal`, `water_at`, `water_h`, `cover_at`, insets) and its test on the same golden file; the project's copies are `godot/tests/terrain/` (`godot/tools/sync_core.py`), passing in Godot 4.5 and, merged into `full-refactor` (2026-10-12), in 4.7.2 |
| `35-core-strata.js` | bedded rock as data (global `KSTRATA`, [G data], needs `KRAND`; `core/terrain/STRATA-PLAN.md` S1-S5): formations stacked bottom to top, each a recipe's beds drawn by `KRAND.hash`; a closed-form warp, dip, folds, faults and a lateral change give the stratigraphic height, so `at` / `surface` name the bed, its kind, colour, hardness, the downslope wash and the cover's colour on the CPU where the GPU draws them; `megabreccia` is blocks, not beds; alterations under height lines; the ledge pass (`ledge`, `ledgeField`); `bake`, the bytes the shaders read; `legacy` is today's column bit for bit. Recipes `canyon`, `badland`, `danxia`, `rift`, `tepui`, `outland`, `tibasalt`, `tibasalt-ponded`, `megabreccia` (`crest`), `pillar`, `ringfold`, `loess`. Below, "Strata" |
| `test-strata.js`, `golden-strata.json` | `node core/terrain/test-strata.js` (each check with a negative; `--write` rewrites the golden file) |
| `kstrata.gd`, `kstrata_test.gd` | the GDScript twin (`class_name KStrata`: `from_export`, `yy`, `at`, `surface`, `ledge`, `terrace`, `bake`, `params`, `apply`; the noise lattice from `krand.gd`) and its test on the golden file (the points, and the baked bytes by sha256); the shader is `godot/shaders/lib/strata.gdshaderinc`, its GPU check `godot/tests/terrain/kstrata_gpu_check.gd`; copies in `godot/tests/terrain/` (`godot/tools/sync_core.py`), passing in Godot 4.7.2 |
| `36-core-carve.js` | carve patches: overhangs (alcoves, niches, undercuts, or a shape a build registers) on a heightfield world. Global `KCARVE`; with the biome core loaded also `BIO.carve` |
| `test-carve.js` | `node core/terrain/test-carve.js`: the module's contract on a synthetic cliff, each check with a negative |
| `37-core-stacks.js` | rock standing on a heightfield (global `KSTACKS`, [G data]): mesas, buttes, spires, fins and balanced rocks as piles of beds, from nwbay's karst stacks; one footprint and one top function make the height (`at`, `topAt`, `ledge`, `ring`) and the mesh (`mesh`) agree; layouts `row` (fins on a strike) and `cluster` (a garden), `export`/`load`; a mesa's `weather` (flutes, gullies, each bed's own retreat) and `shoulder` (thin ledges stepping back 30-45 degrees to the top), undersides under any overhang. Used by `biomes/necanyons`; Pinnacle Rock's rock. Since 2026-10-19 (Korona): a layout (`cluster`, `row`) takes optional variety ranges per stack (`taper`, `lean`, `e`, `crown`), `plates` (Roraima's piles of thin beds, `platesShare` of the stacks) and `lift` (a stack on a slope), drawn from a stream of their own so an unasking page does not move; `mesh` reads the top function through the export (a host that wraps `KSTACKS.topH` draws its relief) and takes `topRings` and `segMax` for a top with relief. Since 2026-10-26 (core gap H10, `biomes/hyperjungle/PLAN-LANDS.md` section 11): the kind `mound`, a termite cathedral (fluted clay spires clustered on a skirt whose foot is on the sampled ground, each spire set into the skirt as drawn, a `clay` colour from the ground's) and `mounds` (a savannah's mounds by cell, each from its own cell's hashes); the kinds are one table (`KINDS`). Since 2026-10-26 (the planned biomes' landforms, below): the kinds `dome` (an inselberg's exfoliation sheets, a pagoda's ledges), `tor` (rounded joint blocks in columns), `arch` (corbelled legs under a lintel whose soffit is drawn) and `pillar` (a jointed sandstone tower), the layout `pillars` (the pillar rim, from `KRELIEF.joints`), and a mesa's `columns` option (colonnades: prisms in the one footprint function); every foot set on the ground as drawn |
| `test-stacks.js` | `node core/terrain/test-stacks.js`, each check with a negative |
| `test-chimney.js` | `node core/terrain/test-chimney.js`: KSTACKS kind `chimney` (below), each check with a negative |
| `37b-core-stacks-contour.js` | opt-in companion of `37-core-stacks.js` ([G data], 2026-10-27, first at `settlements/span`): `KSTACKS.contour(B, m, o)` moves a drawn mesh about the body's axis by angle and height (a profile in and out, a flared foot, a crown drawn in, the axis wandering, vertical joints as grooves, a cleft down from the crown; `o.keep` keeps a held top whole). The record is not changed. A build lists it to use it: no other page moves |
| `test-stacks-contour.js` | `node core/terrain/test-stacks-contour.js`, each check with a negative |
| `37c-core-rubble.js` | opt-in ([G data], 2026-11-03, first at `kits/metropolis`): loose rubble on the ground (global `KRUBBLE`): a heap is a lumpy dome at the talus angle over an ellipse, roughened by value noise, its loose blocks and a `cover` of broken chunks (a jittered grid, each piece its own size, tilt and shade, its corners jittered) lying on it; one surface function (`heightAt`, `at`, its noise no finer than the heap's `cell` can draw) makes the mesh (`mesh`: the heap as a polar grid, then the pieces) and the walk triangles (`walkTris`, for `core/walk`'s `poly`); `bedAt` is the drawn mesh's own height, and each piece is laid along it, sunk a third (none floats); `export`/`load`. Not bedded rock: `KSTACKS` is for that. A build lists it to use it |
| `test-rubble.js` | `node core/terrain/test-rubble.js`, each check with a negative |
| `38-core-relief.js` | relief functions, all plain maths of (x,z) and a seed (global `KRELIEF`): `range` (a wall of mountains along a line: steep sides, broad serrated top, eased toe, tapered ends), `join` (where ranges meet: the tallest plus a quarter of the rest), `volcano` (a concave cone with gullies and a crater), `fields` (an enclosure lattice: field kinds, crop-row directions and hedge polylines, with missing hedges merging fields), `river` (a water surface that never climbs downstream, with the slope per vertex for foam). Since 2026-10-26 (with core/rand): the landform kinds as records, drawn by `shape` and read by `at`: `wadi` (+ fan), `talus`, `pit`, `pavement` + `paintCover`, `stair` (+ `flowAt`), `rille`, `tube`, `columns`, `gap`, `joints` + `tableland`, `meander` |
| `test-relief.js` | `node core/terrain/test-relief.js`, each check with a negative |
| `SCARP.md`, `test-scarp.js`, `golden-scarp.json` | `KRELIEF.scarp`: a wall along a polyline, and its profile published for the scale model (`--write` rewrites the golden file) |
| `40-core-basin.js` | the old water bodies of a heightfield world (global `KBASIN`, [G data], needs `KRAND`): a lake that stood and is gone, by the ground's height under it and which old lakes covered the point (a member function from the world, `palaeo.png`). `sample` gives the band (the bathtub ring under a dam lake's level, the fast drain to its sill, the slow recession under it with its strandlines, a flood lake's high line), `bed`, `ring`, `shore`, `strand`, `silt`, `salt`, `yard` and the years since the point came out of the water; where a flood lake filled a dam basin the later water decides. `land` puts the strandlines and full levels in as benches (a monotone map of h: no new hollows), the beach ridge under a long-held level, yardangs along the wind in the dry silt. `fromRegion` reads `region.json` `palaeo` (`tools/scale-model/extract_region.py`). For the dam-basin overlay (`biomes/nsemiarid/PLAN.md`) |
| `test-basin.js` | `node core/terrain/test-basin.js`, each check with a negative |
| `41-core-scour.js` | a megaflood's channels (global `KSCOUR`, [G data], needs `KRAND`) along courses in metres with their beds: `locate` (along and across the nearest course), `sample` (`scour` under the flood's surface, the floor in full and the walls fading; streamlined `island`s drawn out along the flow; `bar`s on the margins and the end's fan with giant current `ripple`s; `pothole`s keyed on their place; dry `fall`s found where the bed steepens, their lip a horseshoe bowed upstream, the `pool` basin under each), `land` (butte-and-basin cut in steps of the rock's flows, the falls' basins, potholes, bars heaped with ripples; islands kept), and `strata`/`rock` (flood basalt in 15-50 m flows, each with its red interbed and its colonnade, over sandstone and limestone, under cover). Noise keyed on each course's name, not its place in the list. `potholes(box)` lists the kolks whose centres lie in a box. A course takes a station's scales (`islandL`, `islandW`, `fan`: 2026-10-23, `biomes/scablands`; defaults the world's). `fromRegion` reads `region.json` `palaeo`. For the scablands overlay (`biomes/scablands`: station 1, a coulee and dry falls) |
| `test-scour.js` | `node core/terrain/test-scour.js`, each check with a negative |
| `43-core-ground.js` | the ground shader's layers (global `KGROUND`, [G shader]; DETAIL-RESEARCH item 1, 2026-10-26): the material library's ground sets laid over a page's painted ground by the page's own weights, each sampled with Mikkelsen's hex tiling, scaled with distance (its tile doubling at each doubling past 60 m, two scales cross-faded) and blended by height (each layer's luminance about its mean against what is under it). `KGROUND.layer(build, slot, o)` takes a `materials.json` slot through KMAT; `KGROUND.hook(mat, o)` wraps the page's hook. JS twins of the GLSL in `KGROUND.fn`. Opt-in layer kinds (2026-10-26): `clast` (megabreccia, pavement), `sand` (ripples, glints), `polygon` (sand-wedge polygons, patterned ground); below, "Adopting KGROUND's layer kinds" Below, "The ground, the far field and the horizon" |
| `test-ground.js` | `node core/terrain/test-ground.js`: the twins (hex weights, the height lerp, the distance level) and the hook's shader edits, each check with a negative |
| `44-core-farfield.js` | the far field (global `KFAR`, [G data]; HEIGHT-RESEARCH item 3): `lines` (grid lines, even to an inner edge then growing) and `grid` (a vertex-coloured lattice from a height and a colour function, cells skipped by the page; lazy or dense; optional `exag`, `curve` (the planet's curvature, R 4,810 km), `crest`), `shape` (the options on any other height, a lake). Its three.js side is `host/44-core-farfield-draw.js` (`KFAR.mesh`, `KFAR.geometry`, `KFAR.fogThin`) |
| `test-farfield.js` | `node core/terrain/test-farfield.js`, each check with a negative |
| `44g-core-glacier.js` | a valley glacier (global `KGLACIER`, [G data], needs `KRAND`; 2026-11-03, lifted from the Throne's glacier station): along an axis (`up`, the centre line, half-width and thickness as functions of u, the snout) it gives `iceAt`, the `trough` the ice cut, lateral and terminal `moraine`s (breached for the river), the proglacial lake's basin (`lakeK`, `lakeAt`), `bed` (all three in the Throne's order); placement on `KRAND.hash` per kind and index (`seracs`, `bergs`, `crevasses`, `caves` from specs) and `records()`. Every part but the ice is optional (`null`: none). The shape uses `Math.exp`/`pow` as the Throne did (a port matches to a hair, not the bit); the draws are bit-exact |
| `host/44h-core-glacier-draw.js` | its three.js half (`KGLACIER.drawer`, [draw]): the serac and ice-tower items, ice-cave shells lit blue through the ice (an optional `tint`; opt-in, 2026-11-03, Copper Glacier: `apron` (a fillet of ice from the shell's flank to the ground, a share of R), `skirt` (m: the foot carried into the ground), `mouthTop` (how high the mouth opens), `fine` (a finer shell), `uvWorld` (a planar map), `caveFloor` (a floor disc); all off by default, the Throne's caves draw as they did), the ice arch, crevasse slots, the steam. The Throne's glacier station draws through it with its own placement draws, and its page draws exactly what it drew (a scene fingerprint of every mesh, instance, record and a terrain grid: 39 of 39 lines the same) |
| `test-glacier.js` | `node core/terrain/test-glacier.js`, each check with a negative: the Throne's numbers give its old formulas to the bit, placement deterministic and independent of run length |
| `45-core-horizon.js` | horizon maps (global `KHORIZON`, [G data]; HEIGHT-RESEARCH item 2): `bake` (the horizon's elevation in eight directions over a heightfield, two RGBA8 arrays, and the sky visibility; an optional coarse far grid the rays read past the map; about 1 s at 256 x 256), `at`/`skyAt`/`horizon` (what the shader computes, for tests and placement). Its three.js side is `host/45-core-horizon-shade.js` (`KHORIZON.shade(mat, Hz)`: the sun's direct light cut and the ambient darkened; `uniforms`, `glsl` for a material with its own shading) |
| `test-horizon.js` | `node core/terrain/test-horizon.js`, each check with a negative |
| `46-core-lava.js` | lava that flows (global `KLAVA`, [G data]; `LAVA.md`): a Bingham flow on a KFIELD lattice, the MAGFLOW family: per cell ground, thickness and temperature; eight-neighbour Bingham sheet flux capped so it never overshoots, heat mixed by volume, radiative and conductive cooling, the column frozen into new ground at the solidus. `vent`, `pond` (a lake that spills), `step`/`run` (adaptive by the front's CFL), `mass` (kept to rounding), `at`, `front`, `writeBack` (the deposits into a field and its insets), `snapshot`/`restore`, `hazard` + `KLAVA.bind` (KHAZ's `KLAVA.flow` state), `export` (`krator-lava`). Opt-in by path; the Godthrone's vent page is its first user |
| `test-lava.js`, `golden-lava.json` | `node core/terrain/test-lava.js` (each check with a negative; `--write` rewrites the golden file): Jeffreys' sheet in any direction, the run-out stopping at the yield thickness, mass, freezing, writing back, determinism, stability, a pond's spill, the hazard |
| `klava.gd`, `klava_test.gd` | the GDScript twin (`class_name KLava`) and its test on the golden file; copies in `godot/tests/terrain/`, passing in Godot 4.7.2 |
| `47-core-therm.js` | the ground's temperature (global `KTHERM`, [G data], opt-in): vents as point or line records over the country's soil; `heatAt`, `bake`, `contour`, `snowMask`, `export`. Below |
| `test-therm.js`, `golden-therm.json` | `node core/terrain/test-therm.js` (each check with a negative; `--write` rewrites the golden file) |
| `ktherm.gd`, `ktherm_test.gd` | the GDScript twin (`class_name KTherm`) and its test on the golden file; copies in `godot/tests/terrain/` |
| `host/46-core-lava-gpu.js`, `host/46-core-lava-draw.js` | KLAVA's three.js halves: `KLAVA.gpu` (the step as render passes on float textures, ping-pong; `KLAVA.gpuCheck` against the CPU) and `KLAVA.surface` (the moving surface on core/atmos's lava chunk, its glow by temperature) |
| `host/` | the three.js halves of 35, 44 and 45 (`35-core-strata-shade.js`, `44-core-farfield-draw.js`, `45-core-horizon-shade.js`: named to sort before a page's host fragment of the same number, and merging into the same global as the data half whichever loads first), listed by explicit path in a build.py (below) |

### The ground, the far field and the horizon (2026-10-26: the final rebuild's R2-R4, and KSTACKS' gridded top)

Four opt-in pieces, none of which changes a page that does not ask for it.

**KSTACKS' gridded top** (`37-core-stacks.js`, `KSTACKS.mesh(B, {top: {grid: 5}})`): a top that carries relief of its own (a
wrapped `KSTACKS.topH`) is drawn as a square grid on world multiples of `grid` metres, clipped to the top's edge ring, the ring being
the wall's top row (so wall and top share their edge). Cells the ring crosses are the ring clipped to the cell (Sutherland-Hodgman
with keyed vertices, relinked Weiler-Atherton where the ring enters a cell twice) and ear-clipped; a crossing's height is the ring
edge's own, so no crack opens at the wall. A bed narrower than `minCells` (3) cells keeps its rings. Without `opt.top` every mesh
hashes as before (`test-stacks.js` holds the hashes). Cells wholly under the bed above (a cell in from its foot) are left out
(`cull: false` keeps them): hidden tops cost nothing. Korona's hoar table takes it (`STAGE.stackTop` in its station's `45-host-stage.js`,
read by `biomes/korona/src/47-host-land.js`).

**Adopting KGROUND** (a biome's ground; the pilots are `biomes/sedesert/src/45-host-stage.js` and `biomes/nhighlands/src/84-host-ground.js`):
1. `build.py`: add `'43-core-ground.js'` to `CORE_TERRAIN`.
2. In the ground's `onBeforeCompile`, delete the page's own layer code (its samplers, its anti-tiling function, its mixes) and put the
   marker `'/*KGROUND*/'` where the layers were mixed (after the paint and before any term that must stay on top, as granite on the steep).
   Keep the page's varyings and attributes that carry the weights.
3. After the hook: `KGROUND.hook(MAT, {key: '<page>-ground', layers: [KGROUND.layer('<build>', '<slot>', {w: '<GLSL weight>', amt, gain,
   tint: 'diffuse'}), ...]})`, with the same weight expression, strength (`amt`: the page's cap) and gain as the page's mix had. A page
   whose layers were all-or-nothing keeps that (`M && G ? [...] : []`). Without its pack `KGROUND.layer` is null and the ground is its paint.
4. Options: `blend` (.18; 0 is the plain mix), `hex` (`false` samples once), `far` (`{d: 60, levels: 3}` or `false`), per layer
   `h: {from: 'lum' | 'a', contrast}` (`'a'` once a pack carries a height channel: `tools/textures/pack.py` does not yet).
5. Rebuild, verify on the GPU (a shader that fails to compile shows only as a vanished ground: read the console), shots at two
   distances against the page before.
Cost: 3 fetches per layer per hex sample, 6 in the cross-fade bands past 60 m; no draw calls, no memory past the sets the page had.

**Adopting KGROUND's layer kinds** (2026-10-26, for the planned biomes: the Godthrone, Godstep, the W outer wall, the Outlands). A layer
with `kind` is drawn by a recipe instead of a map alone; its map is optional (a kind with none is procedural), it is drawn only where
its weight is above 0, and it blends by height as any layer. A layer without `kind` is drawn as before, and a page that asks for no
kind gets the same shader byte for byte (`test-ground.js` holds the hashes). The options are listed at the top of `43-core-ground.js`.
1. Take KGROUND as above (`CORE_TERRAIN`, the marker, `KGROUND.hook`), then add the kind's layer to `layers`, with its weight from the
   page's varyings and a `seed` (below 997: `KRAND.hash(world, 0, n, salt) % 997`) so two layers of a kind differ:
   - **`clast`**, the megabreccia crest and slump scarps (`biomes/godthrone/PLAN.md` section 3, `biomes/wouterwall` section 2):
     `{kind: 'clast', w: 'vCrest', size: 12, seed}` draws blocks of every rock (`KGROUND.BRECCIA`) in a grey matrix with a finer
     generation of clasts and black and bottle-green glass flecks in it. Its cells are 3D (`proj: 'tri'`), so a scarp is a quilt, not
     streaks; `proj: 'xz'` is the cheaper plane for flat ground (small and packed, `size: .06, matrix: .1, sub: 0, fleck: 0` with a
     varnished palette, it is the Outlands' desert pavement). A map (`KGROUND.layer(build, 'rock.megabreccia', {...})`, or any rock)
     is the blocks' grain, turned and shifted per block; with a `palette` too, the map's light and dark only. The overturned flap:
     `colorFn: 'myBand'`, a GLSL `vec3 myBand(vec3 centre, float h)` the page declares before `main` (its strata colour at the block's
     centre, from `35-core-strata.js`), so each block keeps its bed's colour.
   - **`sand`**, Godstep's black dunes and the Godthrone's bead sand: `KGROUND.layer('godstep', 'ground.sand.black', {kind: 'sand',
     w: 'vSand', wind: [wx, wz], sun: 'uSunDir', seed})` (the sky's sun uniform when the page binds it; a constant otherwise). Ripples
     `ripple` m apart across the wind (lit and shaded by the sun, meandering, broken into patches), glints of single grains
     toward the sun. Both fade out where a pixel covers more than they can show (at 1080p and a 50 degree view the ripples between
     about 20 and 70 m, the glints between 17 and 50 m).
   - **`polygon`**, sand-wedge polygons on the airless rim, patterned ground on the plateaus, a mare's pressure plates:
     `{kind: 'polygon', w: 'vRegolith', size: 15, width: .04, edgeTint: 'vec3(1.25)', seed}` (a pale sand in the wedges), or a map
     for the troughs' fill (moss in the cracks), `rim` for sorted stones beside them.
2. Check it in `core/terrain/check-ground-kinds.html` first (`python3 tools/harness.py smoke core/terrain/check-ground-kinds.html`
   compiles every kind on a Lambert and a Standard ground), then the page's own verify, with shots at 6 m and 40 m.
Cost (per pixel where the weight is above 0): `clast` 27 cells (3D; 9 on the plane), 27 more where the matrix is, 3 fetches with a
map in 3D; `sand` the layer's hex sample, 2 value-noise lookups (8 hashes) and 2 hashes for the glint; `polygon` 9 cells and 3 value-noise lookups, a hex
sample with a map. No draw calls, no textures past the page's own.
Textures: `rock.megabreccia`, `ground.sand.black`, `ground.beads.orange` and `rock.palagonite` are in the library; the kinds need no
new set (the polygons' fill and the pavement's stones are tints of the ground under them).

**Adopting KGROUND's relief and triplanar sides** (2026-11-03, opt-in; the ground diagnosis and the shots are in `core/terrain/GROUND.md`).
Without `relief` or `tri` the shader is the same byte for byte (`test-ground.js`'s FROZEN hashes).
1. **Judge first, with no change to the page:** load it with `?kgrelief=1` (relief, the mesh cavities found on the scene, and the bed
   relief on steep ground where the core strata path is on) and `?kgrelief=1&kgtri=1` (the side planes too). `tools/ground_shots.py`
   takes the same near, mid and far cameras with and without, with their calls, triangles and GPU ms.
2. **Adopt:** `KGROUND.hook(MAT, {..., relief: {bump: .05, near: 25, far: 140, cavity: .55, direct: .35, mesh: .7, strata: .3,
   strataW: '<GLSL: where the beds show, e.g. vRock>', h: '<GLSL: a height of the page's own, metres-free, added>'}, tri: {from: .35,
   to: .7}})`, and after the ground mesh is built `KGROUND.cavityMesh(mesh, {rings: [3, 18], depth: [.5, 4]})` (the attribute `aKGAO`
   that `relief.mesh` reads; skip it and set `mesh: 0`). `strata` needs the core strata path (`KSTRATA.shade`, the uniform `uKSBed`);
   on the legacy column it is left out by itself.
   - `relief` costs **no texture unit** (it bumps the normal by the screen derivatives of the layers' blended height), so a page at the
     Arc's 15-sampler limit (ebadlands) can take it. On MeshStandard it bumps the lit normal; on Lambert (r128 lights per vertex) it
     scales the sun's share by the bumped facing, which is weaker: a Lambert ground gains more by moving to MeshStandard.
   - `tri` samples each layer from the side on the steep (two side planes blended by facing): up to 2 more hex samples a layer there.
3. Rebuild, run the page's verify, and take the shots again on the same cameras.

**Adopting KFAR** (a far field round the ground square; the pilots are `biomes/nwlowlands/src/83-host-range.js` and
`biomes/nhighlands/src/82-host-sky.js`):
1. `build.py`: `CORE_TERRAIN` gets `'44-core-farfield.js'`, and after the `CORE_TERRAIN` loop
   `PATH.setdefault('44-core-farfield-draw.js', os.path.join(CORE_T, 'host', '44-core-farfield-draw.js'))`.
2. `const G = KFAR.grid({lines: KFAR.lines({cell, inner, out, grow}) /* or cell, n */, h: (x, z) => ..., skip: (x0, z0, x1, z1) => ...,
   color: (x, z, y, q) => [r, g, b], dense, exag, curve, crest})`; then `const m = KFAR.mesh(G, {fogK, name, label}); scene.add(m)` and
   register it, or `KFAR.geometry(G, {attrs: true})` under the page's own material. `h` is the page's `terrainH` carried past the map (or
   its own far function, or the scale model's heights); `q.h` is the height before the options, for the colour's snow and tree lines.
3. Anything drawn beside it at a height (a lake) takes `KFAR.shape(opts, x, z, y)`, so it drops and rises with the land.
nwlowlands' range draws the lattice it drew by hand; nhighlands' far country is the same with `FARK` empty, and with it (`curve` from the
square's edge, `crest` k .5 past 9 km, `exag` 1.15 past 12-24 km over the plain's -330 m) is the look change the pilot shows.

**Adopting KHORIZON** (terrain shadows and sky visibility; the pilots are sedesert and nhighlands, both on the ground):
1. `build.py`: `CORE_TERRAIN` gets `'45-core-horizon.js'`, and `PATH.setdefault('45-core-horizon-shade.js', os.path.join(CORE_T, 'host',
   '45-core-horizon-shade.js'))`.
2. Once the ground is built: `const HZ = KHORIZON.bake({box: [x0, z0, x1, z1], n: 256, h: terrainH, far: {h, box, n}})` (the far grid is
   optional: KFAR's `G.at` reads a lattice for it), then `KHORIZON.shade(MAT_GROUND, HZ)`, and once the biome is baked
   `KHORIZON.shadeScene(scene, HZ, {filter})` hooks every lit material standing on the land (the flora, the rock; the pilots
   leave out the far field). Any single material takes `shade`; a foliage hook with its own shading binds `KHORIZON.uniforms(HZ)` and calls `khzShadow(worldPos, sunDir)` and
   `khzSky(worldPos)` from `KHORIZON.glsl()`.
3. The sun is the shared sky's `uSunDir` (read when the program is made) or the page's first directional light. With the sun below the
   horizon (under about -3 degrees) nothing is cut, so the giantshine and the night lights keep their direct light.
Cost: one bake (about 1 s at 256: `window._horizon.ms` on the pilots), 0.5 MB of textures at 256 (2 MB at 512), two texture reads per
pixel; no draw calls.

**Godot.** KGROUND: a `ground.gdshader` with the same functions (the godotshaders hex-tiling port is the same algorithm) and the layers as
uniforms; `KGROUND.fn` holds the JS twins to hold it to. The layer kinds' functions are already in Godot:
`godot/shaders/lib/kground_kinds.gdshaderinc` (`kg_hash3`, `kg_vor2`, `kg_vor3`, `kg_vn`, `kg_ripple` and the kinds' recipes
`kg_polygon`, `kg_sand_ripple`, `kg_glint`), held to `KGROUND.fn` by `godot/tests/shaders/kground_kinds_gpu_check.gd` (on a renderer,
not headless) at the values in `kground_kinds_golden.json` (`node core/terrain/test-ground.js --golden`). The clast recipe is
written inline in the page's GLSL only; it goes into the include with the ground.gdshader port. KFAR: the lattice arrays are plain data (export them as a mesh with vertex
colours), a `MeshInstance3D` with `visibility_range`; the curvature and exaggeration are baked in. KHORIZON: the two RGBA8 arrays as
`ImageTexture`s (`FORMAT_RGBA8`), the shading as a `.gdshaderinc` in `light()` (scale `ATTENUATION` by `khzShadow`, `AMBIENT_LIGHT` by
`khzSky`); the bake is [G data] and can run at import from the field. The gridded top: `KSTACKS.export` carries records and the mesh is
rebuilt from them, so a GDScript twin of `mesh` takes `opt.top` the same way.

### The new biomes' pieces (2026-11-02: the Gills, the Cliff Lungs, the Hearths, Outland Gate, Siphon Pits)

Each is opt-in: a page that doesn't ask draws exactly as before.

**`KTHERM`** (`47-core-therm.js`). The geyser kit keeps per-spring ramps, and nothing gave a kit the ground's temperature between vents. A vent is `{kind:'point', x, z, T, reach, decay}` or
`{kind:'line', pts, ...}`; the ground is the country's soil plus each vent's share, never past the hottest vent reaching the point, plus KRAND detail where the ground is heated.
*Adopting it:* list `47-core-therm.js` (`CORE_TERRAIN`, or read it in place). Bake once: `const H = KTHERM.create({soil, vents, world}), F = H.bake({box, cell: 8})`, then read `KTHERM.fieldAt(F, x, z)`.
Placement takes `H.contour(25, {box})`; the snow takes `ATMOS.snowBare(H.snowMask({box, cell}))` before the materials compile. Godot reads `H.export()` with `KTherm.from_export`.

**`KSTACKS` kind `chimney`** (`37-core-stacks.js`). One hollow kind, `form` setting its defaults: `pipe` (the Gills), `bell` (the Lungs: flared, on holdfasts), `stalk` (the Hearths: slender, broken),
`siphon` (Siphon Pits). Options: `bore | wall, taper, flare {from, k, p}, mouths, fork, spread, lean, toward, state ('standing'|'broken'|'rubble'|'fallen'), cut, fan, ledges, ledgeW, holdfasts, ice {from, thick}`.
`topAt`, `at`, `surface`, `foot`, `ledge` and `ring` read it as any body (over the bore `topAt` finds no lip; `ledge` answers on `ledges`' steps); `mesh` adds part 3, the bore, and `ice`, 0..1 a vertex, with `ice`. Laminae are `KSTRATA.lamina` (`35b-core-lamina.js`, `core/terrain/LAMINA.md`, 2026-11-03), read on a chimney by `L.atPipe(B, x, y, z)`.
`KSTACKS.bore(B, {depth})` gives its `KCAVERN.shaft` records and the well: a shaft stands plumb, so on a leaning bed the mesh and the shaft part by at most half that bed's shift (`test-chimney.js` holds it).
*Adopting it:* `make` it, draw `mesh(B, {bore: 'open'})` when a shaft goes on below (without it a plug closes the foot), and add `bore(B).shafts` and `.opening` to the cavern.

**`KHAZ` moving and pooling** (`core/hazard/21-core-hazard-flow.js`, 2026-11-03): a hazard's `move` read at last, `move.pull` toward its core (the Gills' in-breath), and `shape.pool` (gas that kills on the floor and is nothing a few metres up); `core/hazard/README.md`, "Moving and pooling".
**`KHAZ` the tunnels' kinds** (`core/hazard/22-core-hazard-tunnel.js`, opt-in, 2026-11-11): `rockburst` (a crush on a cycle, one cell of the stretch a period), `inrush` (a drown whose water rises on a cycle or once) and `seal` (a section that bleeds to the surface's pressure while its door is open), for the Line; their rows join the vocabulary at first use, so pages without the file are unchanged; `core/hazard/README.md`, "The tunnels' kinds".

**`KSPELEO`** (`core/terrain/39b-core-speleo.js`, `test-speleo.js`, 2026-11-03): what grows in a built KCAVERN's voids (riftrim's hold:
gypsum chandeliers, stalactites, stalagmites, columns where the two meet), placed by `KRAND` per cell from the cavern's own `sdf` and
`ceilingAt` (a tile placed alone gets what the whole cavern has there; nothing under the sky or in rock), meshed as plain arrays,
`KSPELEO.blocks` for core/walk. *Adopting it:* list it after `39-core-cavern.js`; after `C.build()`, `const R = KSPELEO.place(C, {box,
y: a height inside the voids, world, kinds})`, register each record (`core/tags`), draw `KSPELEO.mesh(R)` as one geometry, add
`KSPELEO.blocks(R)` to the walk (`C.fixture` takes the same box order). Not judged by eye.

**The breath's turn** (`core/biome/35b-core-anim-turn.js`), **steam in groups** and **the heat shimmer** (`core/atmos/fx/`): see
`core/biome/README.md`, "The breath's turn", and `core/atmos/README.md`, "Steam in groups and the heat shimmer".

### The Cliff Lungs', Godstep's and the limestone caves' pieces (2026-11-03)

Each in a new file, opt-in, node-tested with negatives, except `KCAVERN.pipe`, which is in `39-core-cavern.js` (below).

- **`KLAVA.bakeLayers`, `KLAVA.column`, `KLAVA.strata`** (`46b-core-lava-layers.js`, `test-lava-layers.js`; Godstep's owed 1): `KLAVA.bake`'s run bit
  for bit, keeping each eruption's frozen sheet; the stack at a point; and the same flows as KSTRATA formations, so a front's or a rille's
  wall shows the flows the plain was built from. *Adopting it:* `const B = KLAVA.bakeLayers(o)` in place of `KLAVA.bake(o)` (the same `dh`
  and `age`); at a cliff, `KSTRATA.create({seed, formations: KLAVA.strata(B, x, z, {ground}), warp: [0, 0], dip: [1, 0, 0]})`.
- **`KRELIEF.tumuli`, `KRELIEF.tumulus`, `KRELIEF.tubeRille`** (`38b-core-relief-lava.js`, `test-relief-lava.js`; Godstep's owed 2 and 3, the
  Throne's tube station): tumuli on a bake's ponded lobes and pressure ridges along their margins, each split by an axial crack; and the
  trench cut where a `KRELIEF.tube`'s roof fell (by thickness, or spans given), talus at its walls' foot, its walls recorded for the carve,
  skylights where the roof stands thin. *Adopting it:* list the file after `38-core-relief.js`; the records go into `KRELIEF.apply` with the
  others (`KRELIEF.shape`, `at`, `apply` and `kinds` take them once it is loaded; every older kind answers as before); add the rille's
  `openings` to the cavern.
- **`KCAVERN.pipe`** (`39-core-cavern.js`, `test-cavern-pipe.js`; the Cliff Lungs' item 2): a hollow body on a 3D centreline, a solid
  `pipebody` standing in the air as a mass does and a `bore` inside it, its floor stepped, its open ends doors. The edit: `mass` gained a
  `body` flag, and the six places that named `'mass'` read it; no older kind's mesh moved (`test-cavern.js`' hashes 75a40609 and 41820564
  before and after). *Adopting it:* `C.pipe({id, pts: [[x, y, z], ...], r, wall, steps, open})` before `C.build()`.
- **`ATMOS.deckLevel`, `deckDay`, `deckIn`, `provideDeck`** (`core/atmos/fx/89-atmos-fx-deckday.js`, `test-deckday.js`; the Cliff Lungs' item 5):
  `core/atmos/README.md`, "Steam in groups and the heat shimmer" and "The cloud deck's day".
- **`KFAR.streaks`, `streakAt`, `streaksOf`, `streakMesh`** (`44b-core-farfield-lines.js`, `host/44b-core-farfield-lines-draw.js`,
  `test-farfield-lines.js`; the Cliff Lungs' item 7): far dark lines (the lungs down the Inner Wall, a far fall or scar) as camera-facing
  ribbons scaled by the kit's value, as the sprites are. *Adopting it:* `scene.add(KFAR.streakMesh(KFAR.streaks({world, lines, shape, range}),
  {k: uniform}))`. Drawn and counted on SwiftShader (`core/atmos/check_shimmer.py`).
- **`KKARST`** (`39c-core-karst.js`, `test-karst.js`; limestone caverns): a solution cave's plan as records. Branchwork (sinks draining down
  the joints to one spring, the floor falling to it) or a network maze on a jittered joint lattice; chambers where passages meet; older dry
  levels above, joined by shafts; keyhole canyons over the water table and sumps under it; dolines over the sinks and cenotes where a
  chamber's roof is thin; a `karst` KSTRATA recipe. `KKARST.build(C, N)` carves it in a KCAVERN; `water(N)` gives the streams, sumps, pools
  and the spring's `WATER.karstSpring` arguments; `hazards(N)` the drowning and the falls; `relief(N)` the dolines as a KRELIEF kind.
  *Adopting it:* `const N = KKARST.network({box, ground, world, kind, level, table, joints})`, then `KKARST.build(C, N)` before `C.build()`,
  the ground through `KRELIEF.apply(ground, KKARST.relief(N))`, then `KSPELEO.place(C, {box, y, kinds: KSPELEO.LIMESTONE})`.
  **`kind: 'hypogene'`** (2026-11-03, the Hearth hold): water rising from depth, hot and sulphurous. Feeders up the faults or joints,
  big chambers and cupolas over them at the water table, a level rising maze or spongework a storey (older storeys above, at older
  tables), gypsum crust round the table (replacement gypsum and blocks on the old storeys) tagged `speleo: 'HYPOGENE'`, a warm spring
  and vents for outlets, no sinks; `hazards(N)` adds scalding pools, pooled bad air and the acid's drips on the existing kinds (heat,
  gas with `shape.pool`, acid). Dress it with `KSPELEO.place(C, {box: crust.box, y, kinds: KSPELEO.HYPOGENE})` over each of `N.crusts`.
  The branch and maze outputs are byte-identical to before it (`test-karst.js` holds their digests).
- **`KSPELEO.LIMESTONE`** (`39b-core-speleo.js`): soda straws in clusters, curtains along the roof, flowstone mounds, and rimstone dams
  across a falling floor, beside the dripstone; the hypogene preset's records are unchanged.
- **The crystal caves' presets** (`39b-core-speleo.js`, 2026-11-03; `biomes/CRYSTAL-CAVES-5.1.md`): three new kinds, `beam` (a megacrystal
  rising from the floor across the void until it meets rock), `block` (stubby crystals on the floor) and `druse` (points on
  their own floor or roof), each record with its mineral; presets `KSPELEO.SELENITE` (Naica), `AMETHYST` (a basalt geode),
  `CALCITE` (Mississippi Valley: calcite, celestine) and `VUG` (thundereggs, rhyolite vugs). Beams and blocks block a walker.
  The old presets' records, meshes and blocks are byte-identical (`test-speleo.js` holds their digests). `KKARST`'s hypogene kind
  takes `crystal: {storeys, speleo}` to dress the storeys that grew megacrystals with a crystal preset.
- **`KSPELEO.SMOKY`** (`39b2-core-speleo-cleft.js`, opt-in, 2026-11-11; `test-speleo-cleft.js`): an Alpine granite cleft's smoky quartz for the
  Line's cleft shrine (druse, big points as blocks, a few long points), with `KSPELEO.SMOKY_LOOK` (the mineral's colours for a draw). A
  separate file listed after `39b-core-speleo.js`, so the pages that take 39b are byte-identical; 39b's presets do not move.
- **A cave page's floor and rock** (2026-11-09, lifted from the Hearths' Cave of Crystals for every cave page): `KCAVERN.floorFn(C, {from,
  to, step, fallback})` (`39d-core-cavern-floor.js`, `[G data]`, `test-cavern-floor.js`): the lowest open point of a column read off the
  cavern's `sdf` on a cached 1 m lattice, bilinear (a cave page's camera floor, its BIO ground, a water's bed); `KCAVERN.openAt(C, x, y, z,
  pad)`. `KCAVERN.drawRock(C, {THREE, material, tile, attrs, weight, ground})` (`host/39e-core-cavern-draw.js`): the chunks merged into one
  mesh per tile with the page's per-vertex weights (its KGROUND layers' masks) and the occlusion as vertex colour; `ground: 'drop'` leaves
  out the ground's triangles inside an opening. *Adopting it:* list both after `39-core-cavern.js` (`tools/fragment_needs.json`), then
  `const floorH = KCAVERN.floorFn(C, {from: <under the lowest floor>, to: <over the highest>, fallback})` and
  `scene.add(KCAVERN.drawRock(C, {THREE, material, attrs: ['aA'], weight: (x, y, z, nx, ny, nz, ch, i, w) => { w[0] = ...; }}).group)`.
- **Geodes** (`KGEODE`, 2026-11-09, the scablands' coulee first: `biomes/CRYSTAL-CAVES-5.1.md` site 3): `39f-core-geode.js` (`[G data]`,
  `test-geode.js`): `KGEODE.scatter({box, world, cell, bands: [{y0, y1, id}], ground, normal, near, wall, loose, r, split, accept})` puts
  geodes on a cell lattice hashed by (world, cell, salt): **wall** ones in a band where the ground is steep (broken open, the face out
  along the ground's normal), **loose** ones on gentler ground under a band; `KGEODE.block(C, {id, x, z, ground, face, w, d, h, r, ph})`
  adds a walk-in geode to a KCAVERN: a fallen block (a `mass`), its pocket (a `hall`) and the broken face's `opening`;
  `KGEODE.line(C, block, {n, len})` lines the pocket with amethyst points marched from its centre to its rock (KSPELEO reads a void
  inside a mass as under the sky, so it does not dress one). `host/39g-core-geode-draw.js`: `KGEODE.draw(recs, {THREE, points, maps,
  lamp, tint, colors})`, instanced nodules, shells, rind faces, druse bowls and crystals (a KHOOK'd fake glow; a thin-film iridescence for
  aura and bismuth). `KGEODE.MINERALS` (amethyst, quartz, celestine, chalcedony, watermelon, aura, bismuth): each a crust habit and a rind
  palette; a host passes `minerals: {id: weight}` to `scatter` (its rock's palette). *Adopting it:* list both after
  `39-core-cavern.js`; draw the block on `KCAVERN.drawRock` (the pocket's own primitive as the rind's weight).

**`KRELIEF.scarp`** (`38-core-relief.js`): `SCARP.md`, which has its "Adopting it" and the profile for the scale model.

**`KFAR` far items** (`44-core-farfield.js`, drawn by `host/44-core-farfield-draw.js`). `KFAR.sprites({world, sources, shape, range, kind})`: far steam and cloud as a plain record, placed by hash of (world, source, slot), so
any list of the same sources gives the same sprites. `KFAR.spriteMesh(S, {k})` is one instanced draw on one uniform, the kit's value: a sprite gates in past its source's `lag`, its size and alpha growing with what is left. The value never touches an item.
`KFAR.spriteAt(S, i, k, r)` is the shader's arithmetic for a probe or Godot. `KFAR.itemsExport` wraps sets of any `kind`, so the metropolis's district masses (`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 13) are one more kind in this format, with the same placing and `range`. Not built.
*Adopting it:* `const S = KFAR.sprites({world, sources: [{x, z, y, r, n: 30, size: [300, 700], rise: [100, 400], lag}], shape: (x, z, y) => KFAR.shape(o, x, z, y), range: [3000, 40000]})`, `scene.add(KFAR.spriteMesh(S, {k: uniform}))`, register it (`core/tags`), and set `uniform.value` from the kit's clock.

### The unbuilt plans' pieces (2026-11-03: landforms, strata, seasons, sound)

The 2026-11-03 audit of the unbuilt biome plans found that most need nothing new; these are what they did need. Each piece is in a
new file, opt-in, and node-tested with negatives. No page takes one yet, so no page's bytes move.

- **`KRELIEF.slump`, `runout`, `gully`, `terraces`, `maar`, `relay`, `stepcut`, `KRELIEF.waters`** (`38c-core-landforms.js`,
  `test-landforms.js`; `LANDFORMS.md` has the table of parts and plans):
  - wouterwall's slump terraces, sturzstrom fields, loess gullies with box-canyon heads and yuan, liang and mao, and its terraced fields;
  - Mid Basin's breached maars and relay benches;
  - the Siphon Pits' sheer stepped graben and pits (no falloff; KFIELD's brushes stay smooth).

  *Adopting it:* list the file after `38-core-relief.js`, and put the records in `KRELIEF.apply` with the others. `KRELIEF.waters(rec,
  ground)` gives the ponds, lakes and spring pools.
- **`KSTRATA.vary`, `KSTRATA.drape`, `KSTRATA.loadVaried`** (`35c-core-strata-vary.js`, `test-strata-vary.js`; GDScript twin
  `kstrata_vary.gd`, golden `golden-strata-vary.json`, vendored to `godot/tests/terrain/`): a formation whose base varies from place to
  place. Contacts move by an offset of (x, z), which sums any of a constant, a plane, the stack's table noise, bumps or a grid. The
  stratigraphic height is remapped piecewise linearly between the moved contacts, so beds keep their place and thin or thicken with their
  formation. Where two contacts cross, the higher-numbered wins, and the formation between them pinches out. `KSTRATA.drape(S, k, ground,
  {box, step, th})` lays formation k's base `th` under the ground: a mantle following the land it fell on.
  - It serves Mid Basin's interbedded loess and tuff and the W outer wall's loess.
  - *Adopting it:* list it after `35-core-strata.js`, then `const V = KSTRATA.vary(S, {contacts: [{at: 2, by: KSTRATA.drape(S, 2, ground,
    {box, step: 16, th: 40})}]})`, and read `V.at` / `V.surface` where `S`'s were read.
  - **The shaders still draw the flat column** (`BIO.strata`, `strata.gdshaderinc`). A varied stack is the CPU's, for painters, plant passes
    and cliffs: a baked offset texture for the shaders is not done. Keep alterations off a varied stack: their lines read the shifted height.
- **The season's last two pieces (H7)** (`core/biome/30s-core-season-flush.js` and `core/clock/opt/21-core-clock-flush.js`; `test-season-flush.js`,
  `test-flush.js`):
  - **the copper flush**, a leaf colour at the start of the rains (`KCLOCK.flush`, `BIO.FLUSH`, `BIO.bindFlush`);
  - **the Godot leaf twin**: `season_dry` and `season_flush` as global uniforms, `shaders/lib/season.gdshaderinc` in `foliage.gdshader`,
    `biome_import.gd` reading the leaf's season options, and `KSeason.flush` and `set_globals` in `kseason.gd` (golden `golden-flush.json`).

  `core/biome/README.md`, "The season", has the details and the GPU check.
- **The `sound` record (H9)** (`core/tags/opt/54-core-tags-sound.js`, `test-sound.js`, twin `ksound.gd`): an aeolian emitter as a record in core/tags,
  for a core/audio still to be written and Godot's audio. Its modes are an edge tone, an overblown closed pipe and a Helmholtz cavity, with
  presets for the howl bamboo, the Singing Gjár and the singing buttress. `core/tags/README.md`, "Adopting it: the sound key".
- **`KSPAN`** (`core/biome/45-core-span.js`, `test-span.js`): catenaries between two anchors, for spiderlake's silk and loom-chasms' living
  cables. A span is solved by length, slack or sag. `up` makes a buoyant cable arch over its chord; the shape is the mirror, since
  buoyancy only changes the tension. It gives points, the tangent, the low point and the tension for a weight, and `strands` hangs a
  curtain of spans between two anchor lines, with each strand's slack drawn by hash.
  - Data only: a kit draws the points as tubes or ribbons.
  - *Adopting it:* list the file in `CORE_BIOME`; `KSPAN.points(KSPAN.solve(a, b, {slack: .05}), 24)`.

### The landform kinds (2026-10-26: the planned biomes' core gaps)

The planned biomes' landforms that are core, not kit: the outlands' C4 (`biomes/outlands/PLAN.md` section 12), Godstep's
flows (`biomes/godstep/PLAN.md` section 4), the SW highlands' gaps, arches and pillar rim (`biomes/swhighlands/PLAN.md`
section 4). Every form is a **record first** (plain data, JSON-safe, every draw `KRAND.hash` of (seed, slot, salt)), then the
ground it leaves. `KRELIEF` forms are heightfield edits: `KRELIEF.shape(rec, x, z, g)` (the height given the ground `g`),
`KRELIEF.at(rec, x, z, g)` (the part: floor, bar, bank, fan, face, bench, wall, talus, pool, spoil...), `KRELIEF.apply(ground,
[recs])` to compose. `KSTACKS` kinds are bodies on the heightfield, each foot set on the ground **as drawn** (sampled round the
drawn foot, listed in the record's `feet`), checked by rays in `test-stacks.js`. Nothing that existed moves: the new fields
(`sq`, `cw`, `und`, `ot`, `feet`) are opt-in, and every old mesh hashes as before.

**Adopting it.** List `38-core-relief.js` (and `37-core-stacks.js` for bodies) in the build's `CORE_TERRAIN`, after
`core/rand`. Make the records once, compose the ground with `KRELIEF.apply`, bake it into `KFIELD` (the forms query a
polyline grid: call them at bake, not per frame), and export the records beside the field (`KSTACKS.export` for bodies).

| Biome | Kind | For |
|---|---|---|
| `outlands` | `KRELIEF.wadi` (+ its `fan`), `KRELIEF.meander` | the Z7 wadis; the fans and bajadas at every wall's foot (Z4-Z5); pools for `WATER` after rain |
| `outlands` | `KRELIEF.talus` | the aprons against the basin walls and the gem hills' stacks (Korona's `talusH`, lifted; `bodies` takes KSTACKS records) |
| `outlands` | `KSTACKS` `dome`, `tor` | the inselbergs and the boulder piles of N1-N2 (a tor's `clitter` for the kit's loose rocks) |
| `outlands` | `KRELIEF.pit` | the gem hills' open-cast workings (S4): benches, spoil heaps, `adits` for `KCARVE` |
| `outlands` | `KRELIEF.pavement` + `KRELIEF.paintCover` | N2's desert pavement as a class in `KFIELD`'s cover grid |
| `godstep` | `KRELIEF.stair` (+ `flowAt`) | the steps at 2.7, 2.0, 1.3, 0.6 km: ponded floors, lobate terraced fronts, lava falls (`tongues`), kipukas (`shape` keeps older ground that stands above) |
| `godstep` | `KRELIEF.rille` (`tops: stair.flowTops`) | the sinuous rilles, their walls a staircase of benches, one per flow |
| `godstep` | `KRELIEF.tube` | lava tubes and their pit chains; `passage` and `openings` are `KCAVERN.tube`'s and `KCAVERN.opening`'s arguments |
| `godstep` | `KSTACKS` `columns` option, `KRELIEF.columns` | colonnades and entablature on a hero front or a canyon wall drawn as stacks; a causeway's column tops in plan |
| `swhighlands` | `KRELIEF.gap` | water gaps and wind gaps through the ring folds' ridges (`KRELIEF.range`); a water gap's `stream` for `WATER.flow` |
| `swhighlands` | `KSTACKS` `arch` | arches where a hard bed is breached on a ridge (and a sea arch on the fan coast) |
| `swhighlands` | `KRELIEF.joints`, `KRELIEF.tableland`, `KSTACKS.pillars` / `pillar` | Span's tableland: its slots, its cliff, the pillar rim's 250-300 m towers, all from one joint set and one zone |
| `swhighlands` | `KSTACKS` `dome` with `pagoda` | the tableland's pagoda and beehive domes |

**Kit work, not core** (read in each plan): the folds' ridges themselves (rows of `KRELIEF.range`), the karst cave through a
ridge and the chain of natural bridges (`KCAVERN`), the rain wall's scars, the landslide dam and its lake, the fan deltas (a
wadi's `fan` into the sea), the flysch platforms; Godstep's lava-dammed basins (`KBASIN`), black sand, the falls, the flank
vent (`KRELIEF.volcano`), the laterite breakaways; the Gate's defile.

**The strata hook.** `dome` and `pillar` take `o.strata(x, y, z) -> {h, hard}` (a bed's thickness from y, its hardness 0..1:
hard beds proud, soft notched), the shape `core/terrain/STRATA-PLAN.md`'s `S.at` answers; `KRELIEF.flowAt(stair, y)` names a
flow's colonnade and entablature for a `tibasalt` recipe. Without the hook the beds come from the body's seed.

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

**A cave mouth in a hillside, and weathered bodies** (2026-10-26, biomes/swhighlands station 1; the owner's notes; opt-in). `KCARVE`
(36): `face(o)` / `cut(F, x, z, h)` the bite a mouth opens in (a floor, noisy walls by KRAND except on the mouth's side, never more than
`maxCut` under the natural ground), `site(o)` where along a line the back wall stands `face` m, `fold(h, x, z, {steep})` the recess
folded into the host's ground steeply enough to lie inside the hood's margin (`minSteep(Q)`: else a trench opens round the hood),
`keepOut(x, z, pad)` where a host's other carving (a stream's banks) must leave the ground alone, and `mesh(material, {attrs})` (the
host's uv and zone weights on the patch, so the hood takes the ground's own material and its top is the hill's). `KSTACKS.weather(B, m,
{ground, amp, grain, pit, round})` (37): the drawn mesh worn natural (an arch's upper corners rounded, two grains of KRAND noise, the
feet kept on the ground); the record is not changed. Tests: `test-carve.js`, `test-stacks.js` (each with negatives).

### Strata (`KSTRATA`, 2026-10-26: `STRATA-PLAN.md` S1-S5)

Bedded rock as records, so what a painter, a plant pass, a relief pass or Godot asks of the rock is what the shader draws.
The data (`35-core-strata.js`, [G data]: no THREE, no DOM, no sin), the three.js shader (`host/35-core-strata-shade.js`, [G shader]),
the GDScript twin (`kstrata.gd`) and the Godot shader (`godot/shaders/lib/strata.gdshaderinc`). **Nothing takes it yet**: sedesert,
ebadlands and Shade keep their own `35-core-strata.js`, and every page builds as before.

```
const S = KSTRATA.create({seed, formations: [{recipe: 'megabreccia', top: 3000}, {recipe: 'loess'}], range: [0, 4200],
  dip: [.6, .8, .012], warp: [9, 2.2], fold: {dir: [0, 1], wl: 15000, amp: 600, sharp: .5},
  faults: [{a: [x, z], b: [x, z], throw: 40, w: 3, taper: 200}], alter: [{kinds: ['bead'], to: 'palagonite', below: 8500, band: 400}],
  lateral: {recipe: 'danxia', dir: [1, 0], at: [x, z], d0: -500, d1: 500, tongue: 6}, wash: {m: 2.5}, regolith: .8, dust: 0xc9a27e});
S.at(x, y, z)          // {formation, recipe, bed, kind, colour [r,g,b] sRGB, hard, f, edge, cell, altered, side}
S.surface(x, y, z, ny) // at() with the wash (a gentle slope shows the bed m higher), plus cover: the loose cover's colour
S.ledge(x, z, h, slope); KSTRATA.ledgeField(S, terrainH)   // the ledge pass; S.terrace(x, z, h) is its gentler first cut
S.hardnessAt(x, y, z); S.colorAt(yy); S.export()  /* KSTRATA.load(json); KStrata.from_export in Godot */
const M = KSTRATA.shade(S, {cap, foot, dust, res: .25})   // or BIO.strata({recipe | formations, ...}); M.inject(shader), strataColor(wp, wn)
```

- **Formations over beds.** Each formation is one recipe's column over its own thickness (no 120-180 m repeat unless it asks for
  `repeat`); a `suite` recipe (`outland`, `rift`) splits its formation by shares. Bed `i` of a formation is drawn from
  `KRAND.hash(seed, salt, i, k)`, so a thicker formation keeps the beds under it. `flip` reads a formation top-down (the Godthrone's
  overturned flap). Rules per recipe: `between` kinds never follow each other, `alternate` swaps two kinds in turn, `noRepeat` never
  lays a kind on itself (badland's and danxia's contrast).
- **The warp is closed-form**: two value-noise terms on a 64 x 64 table of `KRAND.hash` bytes, read by the shaders as an RGBA8 texture
  (`texelFetch`; WebGL1 samples texel centres), by JS and by GDScript as k/255; with the dip, the fold (a quartic profile, round to
  chevron by `sharp`) and the faults it gives the stratigraphic height `yy`.
- **Lateral change** (`lateral`): a second stack with the same structure takes over from `d0` to `d1` metres along `dir`; between them
  its beds tongue in by `tongue` metres of `yy`, so the two interfinger rather than meet on a line. `at` reports `side`.
- **Blocks.** A recipe with `blocks` (`megabreccia`) has no beds: a 27-cell jittered lattice of blocks (60 m, a `fine` block a breccia of
  7.5 m blocks), each a clast kind by weight, banded by its own tilted bedding, in a grey matrix flecked with impact glass. A stack may
  hold several blocks formations (the shader takes four).
- **Alteration.** Under a world height (wandering by `band`) named kinds turn into another, first match first (the bead beds to
  palagonite under the Godthrone's dry-cold line by default; Godstep passes laterite as well). The shader takes four.
- **The surface.** `wash`: on gentle slopes (the normal's y from .55 to .9) the colour comes from the bed `m` metres higher, so each band
  bleeds down the slope below it (badland's default 2.5 m). `regolith`: the dust and loose cover take the bed's own colour (badland's
  popcorn clay .85; 0 is the plain dust). Both are in the shader and in `S.surface`.
- **Ledges** (S4). `S.ledge(x, z, h, slope, {k, bench, e, anchor, s0, s1})`: where rock shows (|grad h| from `s0` .45 to `s1` .9) each bed is
  remapped so hard beds stand steep and soft ones ease (by `k`, .5), with a bench (`bench` 1.5 m, floor `e`) in a soft bed over a hard one;
  beds are taken in packets of `anchor` (30) m whose tops keep their height, so the land does not drift. A monotone map of h at (x, z)
  (no new hollows), except where a lateral change interfingers. `KSTRATA.ledgeField(S, h, {step})` wraps a height function, the slope
  by central differences. Bake it into the heightfield (KFIELD) and Godot has the same ground. At close range the shader draws a shadow
  line under each hard bed's lip.
- **The bake** (`KSTRATA.bake(S, {res})`): the bytes the shaders read (the column of each half at `res` m a texel, the alterations, the
  blocks formations' clasts), plain data so `KStrata.bake` gives Godot the same bytes; `KSTRATA.params` the uniforms as numbers.
- **The shaders.** `BIO.strata(opt)` with no recipe is today's shader character for character (its column from `KSTRATA`'s `legacy`,
  which `test-strata.js` holds bed for bed to sedesert's fragment); with a recipe it is the core path. Effects by recipe `fx`:
  cross-bedding, varnish (tepui's in black-green, `fx.varnishCol`), opal-shell iridescence, Liesegang bands, colonnade joints,
  impact-glass flecks, the ledge line, the cap, dust and cover. In Godot: `#include "res://shaders/lib/strata.gdshaderinc"`,
  `KStrata.from_export(json).apply(material, .25, {cap, foot})`, then `ks_strata_color(world_pos, world_normal)` into ALBEDO
  (`ks_strata_raw` for the bed's own colour). An alteration of a blocks formation's clasts is the CPU's only.
- **Checked on GPUs** (2026-10-26): with `#define KSTRATA_RAW` (three.js, WebGL2 in the app's browser) and `ks_strata_raw` (Godot 4.7.2,
  Forward+ on the RTX 5060: `godot --path godot --script res://tests/terrain/kstrata_gpu_check.gd`, which needs a window), the bed
  colour equals `S.surface`'s at every sampled pixel off the bed edges (within 1/255) on ten stacks: canyon, legacy, outland with a
  fault, tibasalt across its alteration line, ringfold folded, megabreccia under loess, two blocks formations with two alterations,
  lateral changes (into blocks too), tepui, and badland's wash on flat ground.
- **Not yet**: Godot's side of a varied contact on the GPU (`35d-core-strata-bake.js` bakes it for three.js, 2026-11-09: "The 2026-11-09 plans' pieces"); the alteration of block clasts on the GPU;
  `tools/harness.py smoke` crashed every page on this machine (a bare three.js page too), so the browser checks ran in the app's browser.

**Adopting it** (a planned biome; each at its own turn of the rebuild):
1. `build.py`: `CORE_TERRAIN` gets `'35-core-strata.js'` (core/rand on the page first), and after the `CORE_TERRAIN` loop
   `PATH.setdefault('35s-core-strata-shade.js', os.path.join(CORE_T, 'host', '35-core-strata-shade.js'))` (keyed `35s`: the shade reads
   `KSTRATA` when it loads and does not merge into a later data half, so it must sort after `35-core-strata.js`; found by the Godthrone, 2026-10-26). A build that has its own
   `src/35-core-strata.js` (sedesert, ebadlands) deletes it: the same name in `src/` wins over the core file.
2. Build the stack once from the recipe the plan names (below), then `BIO.strata({strata: S, cap, foot, dust})` (or `KSTRATA.shade(S, o)`)
   and `S.inject(shader)` in the rock's `onBeforeCompile`, `strataColor(vSWP, vSWN)` where the colour is mixed, as today.
3. The ground: `terrainH = KSTRATA.ledgeField(S, terrainH0)` before the field is baked, where the plan wants ledges.
4. Plants and painters ask `S.surface(x, y, z, ny)` (the bed's kind under a plant, `colour` and `cover` for a far painter).
   `BIO.export` carries `S.export()` for Godot, which fills its material with `KStrata.apply`.

| Biome (plan) | Recipe | How |
|---|---|---|
| `outlands` (PLAN.md section 5, C3) | `outland` | one formation per basin wall (red beds, tuffs, red vesicular basalt cap; copper green and turquoise bands, white altered zones); the gem hills and Trickster's wall the same stack; plants by `S.surface` |
| `godthrone` (section 3, G2) | `tibasalt`; `megabreccia` at the airless rim's crest (`flip` on the formation over it for the overturned flap) | the caldera, escarpments, rilles and pits; the alteration's `below` is the dry-cold line (8,500 m by default: set it from the kit's field); the ledge pass on the escarpments (each flow a ledge, the bead beds recessed) |
| `godstep` (section 2, D2) | `tibasalt` on the slopes, `tibasalt-ponded` on each step (colonnades) | `alter: [{kinds: ['bead'], to: 'palagonite', below, band}, {kinds: '*', to: 'laterite', below, band}]`; the ledge pass for the trap staircase |
| `hyperjungle` drylands edge (PLAN-LANDS.md section 11) | `tibasalt` | a thin formation at the southern edge, read from the Godthrone's |
| `swhighlands` (section 2, H2) | `pillar` (Span's tableland, the pillar rim), `ringfold` (the ring folds: pass `fold` with `dir` along the crest, wl 10-20 km), `crest` (= `megabreccia`) | one stack with formations by height, or `lateral` from the folds into the tableland; the folds' chevrons are `sharp` near 1 |
| `wouterwall` (section 2, W2) | `megabreccia` under `loess` | formations `[{recipe: 'megabreccia', top: L}, {recipe: 'loess'}]`, L the loess's base on the lower bench (a level) |
| `ebadlands`, the painted highlands (STRATA-PLAN section 7) | `badland`, `danxia` | the wash and the clay's own cover are badland's defaults; danxia's fins with `fold` |
| `riftrim`, `rift` | `rift` | the trough's walls and the rim; the caves are cut in its gypsum and limestone (soft and hard in `S.at`) |
| `korona`, `necanyons` | `tepui` | the tepuis, the hoar table, the caps (`cap` for the pale crowns) |

### The field (`KFIELD`, 2026-10-08)

GODOT-PLAN.md Phase 2 item 2: the ground as data, so the ground a page plants on is the ground Godot draws and
collides with. A world paints its closure once and then reads the field:

```
const F = KFIELD.bake((x,z) => myClosure(x,z), [x0,z0,x1,z1], step, {
  insets: [{box, step}],                      // finer where the world draws finer (a cliff, a cave mouth)
  water:  {river: (x,z) => wet ? y : NaN, sea: -1.5},   // a surface on the lattice (NaN dry), or a level everywhere
  waterBox: {river: [x0,z0,x1,z1]}});         // bake a surface only where it can be
function terrainH(x,z){ return F.h(x,z); }    // bilinear, clamped at the edges; F.normal(x,z), F.waterH(x,z), F.coverAt(x,z)
BIO.init({..., terrainH, field: F});          // a biome kit: BIO.export's ground then carries F.export({box}) as `field`
```

- **The grid.** Point (i, j) is at x = x0 + i*step, z = z0 + j*step, `heights[j*nx + i]`, Float32, metres, +y up, x east,
  z south. Choose the step so the world's ground mesh vertices are grid points: there the drawn ground is the closure (to
  float32: 6e-5 m at 900 m); between grid points the field is bilinear, and anything that reads it moves by that error.
- **The arithmetic is the contract.** `bilinear()` clamps, takes `floor`, caps the cell at nx-2, then `a+(b-a)*fu` along
  x and the same along z. `kfield.gd` repeats it operation for operation: on the golden file the two engines agree to
  2e-15 m (the JSON parse's last bit), not merely 1e-6.
- **Insets** are fields of their own over a window snapped out to the base lattice; `h` reads the first that holds the
  point (edges included). The Godot importer leaves the base's cells under an inset out of the mesh and makes its grid
  points a hole (NaN) in the base's HeightMapShape3D.
- **Water** is named surfaces: `{level}` everywhere, or a window of the lattice with NaN where dry; `waterAt` is
  bilinear where all four corners are wet, else the nearest corner. `waterH` is the highest wet surface, else `KFIELD.DRY`.
- **The export** (`f.export({box})`): `{format:'krator-field', version:1, convention, name, x0, z0, step, nx, nz, min,
  max, heights (base64 of little-endian Float32), water, cover?, coverNames?, insets?}`. A box crops on the field's own
  lattice (the grid does not move). `KFIELD.load(json)` reads it back bit for bit; `KField.from_export` in Godot.
  `godot/krator/field_import.gd` turns it into a terrain mesh and a StaticBody3D with one HeightMapShape3D per grid.
- **Not yet:** a 16-bit PNG or EXR height export, the carver's floors and blockers, a land-cover map from a real
  build (the byte grid and its legend are there; no world fills it yet).

**Used by** `biomes/sedesert` (its ground, flora, camera and export; `biomes/sedesert/KNOWN_ISSUES.md` has the measured
error). The other 41 `terrainH` closures are still closures.

## The 2026-11-09 plans' pieces (cross-module)

The biome plans written on 2026-11-09 (Labyrinth, Firebliss, Mid Basin, NE Outer Wall, Outland Gate, Painted Highlands, W
Outer Wall, Loom-Chasms on `claude/biome-rebuild`; Great Chasm, Godshearth on the integration branch; Opal Valley, SE Outer
Wall, the Twins, Greenstep on `gemini/scale-model-5.1-r3`) each list core amendments. These are built ahead of the kits, as
the 2026-11-03 batch was: each piece in a new opt-in file that no build lists yet (or an option that defaults off in a file no
build lists), plain data (`[G data]`) wherever it can be, node-tested with negatives (`tools/test_all.py` finds every
`core/**/test-*.js`), and **no page's bytes move**. New files at the top of `core/atmos` and `core/water` would be swept in by
the builds that list those folders, so they go in `fx/`, `ext/` and `geyser/`; `core/hazard`, `core/hamlet`, `core/camp`,
`core/biome` and `core/terrain` are listed file by file.

**PLAN** (the amendments de-duplicated and checked against core first):

| # | Piece | File | Wanted by | Notes |
|---|---|---|---|---|
| 1 | Geothermal surfaces: mud pots, fumaroles (steam, run-off), sinter, travertine and mat aprons | `core/water/geyser/52c-core-water-thermal.js` (+ `52d` draw) | godshearth, twins, greatchasm, seouterwall, firebliss, midbasin, neouterwall | owed in `core/water/README.md`, "Not here (yet)"; aprons read `KTHERM` when it is there |
| 2a | A crust that breaks underfoot | `core/hazard/22-core-hazard-env.js` | twins, opalvalley, firebliss, godshearth, neouterwall | checked: a `trigger` today makes a hazard harmful *until* tripped and then resets, so a crust cannot stay broken: a state function |
| 2b | Gas that pools at night and in still air; the cold-air pool | same | neouterwall, godshearth, midbasin, greatchasm, firebliss, twins | a state function on the world hour and the wind; the pool is `21`'s `shape.pool` |
| 2c | A front along a path: the gorge flood (the level rises) and the charge (a herd, bound to its fauna record) | same, and `core/water/ext/62-core-water-flood.js` (+ `62b` draw) | firebliss, midbasin, outlandgate, paintedhighlands, wouterwall, labyrinth | one front law, written in both and checked against each other |
| 3 | A volcanic plume: ash fall, fog and shade along an azimuth from vents | `core/atmos/fx/89-atmos-fx-ashplume.js` | firebliss (the Throne, Godthrone could take it) | feeds `airLoad`'s `ashAt` and `KFAR.sprites` |
| 4 | Katabatic, anabatic and gap wind; the cold-air pool's temperature | `core/atmos/fx/89-atmos-fx-slopewind.js` | seouterwall, twins, outlandgate, godshearth, wouterwall | extends `ATMOS.windAt`; gives 2b its stillness and `KHAZ` a temperature field |
| 5 | A rock iridescence glaze | `core/terrain/35e-core-strata-skarn.js` | opalvalley, neouterwall | thin-film colour as data and GLSL text with a JS twin |
| 6 | A skarn recipe: lensing epidote, garnet, magnetite and marble bands | same | neouterwall | checked: `KSTRATA.vary` moves contacts but makes no lenses; the recipe drives it |
| 7 | Landforms: a tapered chasm head for `stepcut`; the three-trend graben net; giant flood ripples | `core/terrain/38c-core-landforms.js` (`head`, off by default; no build lists 38c) and `38d-core-landforms-net.js` | midbasin, loom-chasms; labyrinth, siphon-pits; outlandgate | |
| 8 | A baked texture for `KSTRATA.vary`, so varied strata draw on the GPU | `core/terrain/35d-core-strata-bake.js` | wouterwall, midbasin | |
| 9 | Animal sign: trails, wallows, dung, browse lines, trampled ground, bone yards from herd records | `core/biome/46-core-sign.js` | labyrinth (the open world wherever herds live) | masks for `KGROUND`, decal records |
| 10 | `core/hamlet`: a defended platform village; a trade post shared by two cultures | `core/hamlet/32-hamlet-platform.js`, `34-hamlet-trade.js` | labyrinth, paintedhighlands; greatchasm | no Kimr, Yuni or Coyote row exists: their buildings come back `pending` |
| 11 | `core/camp`: an outlaw band (its own size), a lookout and its siting rule | `core/camp/50-camp-outlaw.js` | midbasin | the camp's pieces stay a kit's |

**Rejected or left to a kit** (and why):
- **A dust hazard kind:** it exists, as the ambient `dust` row fed by `ATMOS.airLoad` (`core/hazard/README.md`, "The air and
  the cold").
- **A separate timed cold-air pool kind:** a `cold` record with `shape.pool` (21) on 2b's night state, and the temperature from 4.
- **The season-keyed flower drift on a bed** (paintedhighlands): its plan makes it a kit-side mask until two kits want it.
- **The outpost or player-settlement registry:** open world, not core (its own workstream).
- **The wind-sounding rock** (outlandgate): proposed as a `core/audio` source; no audio module yet.
- **Greenstep** asks for nothing core does not have.

**Built** (2026-11-09; every piece below is opt-in, listed by no build, node-tested with negatives; nothing is judged on a GPU
yet, so the first page to take a drawn piece screenshots it and reads the console: a shader that fails to compile just vanishes):

- **Geothermal surfaces** (`core/water/geyser/52c-core-water-thermal.js`, `52d` draw, `geyser/test-thermal.js`; item 1): `WATER.mudpot`
  (a grey swelling mud surface whose bubbles rise and burst at hashed places and times), `WATER.fumarole` (its puffing steam, and
  a run-off traced downhill by `WATER.downhill`, ready for `WATER.flow`), `WATER.thermalAprons` (sinter, travertine, sulfur, clay and
  microbial mats banded by temperature, from `KTHERM` when given). *Adopting it:* list `geyser/52`, `52b`, `52c`, `52d` by path after
  core/rand and core/water's `20` and `50`; `WATER.mudpot({key, x, z, r, level, kind})`, `WATER.fumarole({key, x, z, ground})`, draw
  with `WATER.drawMudpot` / `drawFumarole`, give `F.runoff.flow` to `WATER.flow`; `A = WATER.thermalAprons({springs, geysers,
  fumaroles, mudpots, ground, therm})`, then `A.apronAt` or `A.bake` into KGROUND layers (mats coloured by `WATER.matGLSL()`); a
  travertine apron's `terraces` goes to `WATER.terraces` as it is. `core/water/README.md`, "Geothermal surfaces".
- **Crusts, night and fronts** (`core/hazard/22-core-hazard-env.js`, `test-hazard-env.js`; items 2a-2c): `KHAZ.crust` and `KHAZ.under`
  (harmless until a load breaks it, then broken for good or until it heals, over the heat, lava or mud below), `KHAZ.night` (gas or
  cold air that pools at night and in still air, on the world clock and a bound wind; with 21's `shape.pool` it is the cold-air
  pool), `KHAZ.front` (a gorge flood a walker can stand above, or a stampede's band bound to its herd: `charge.fauna`,
  `KHAZ.bindHerd`). *Adopting it:* list it after `20-core-hazard.js` (and after `21` when both); register the bodies
  `KHAZ.ENV.crust`, `nightGas`, `coldPool`, `flood`, `stampede`, `rockDrop` give; once `KHAZ.bindClock(clock)` and `bindWind(fn)`;
  `KHAZ.load(crust, mass, t)` on a step; pass the walker's height to the queries. `core/hazard/README.md`, "Crusts, night and fronts".
- **The gorge flood's water** (`core/water/ext/62-core-water-flood.js`, `62b` draw, `ext/test-flood.js`; item 2c): `WATER.flood` on
  the very law `KHAZ.front` reads (`ext/test-flood-front.js` holds the two to each other: level, arc length and k agree to 1e-14 on
  three floods, and a record with a changed law is caught). *Adopting it:* list `ext/62` after `20` (and `62b` after `22`, `50`, `51`,
  with core/atmos bound); `const F = WATER.flood({key, path: [[x, bedY, z], ...], w, speed, period, rise, hold, fall, depth})`,
  `WATER.drawFlood(F)`, and register `F.hazardRecord()` in core/tags: the water and the drowning are one record.
- **The volcanic plume** (`core/atmos/fx/89-atmos-fx-ashplume.js`, `fx/test-ashplume.js`; item 3): a Gaussian plume from vents along
  an azimuth (or the wind): ash fall, fog, its shade, the deposit, far sprites. *Adopting it:* list it (with core/rand for the
  sprites); `const PL = ATMOS.ashPlume({vents: [{x, z, y, top, rate}], azimuth, reach})`, then `ATMOS.airLoad({ashAt: PL.under})` (or
  `PL.provide(KHAZ)`), `PL.deposit` as a KGROUND mask, `PL.shade(x, z, sunDir)`, `KFAR.sprites({sources: PL.sources(), kind:
  'cloud'})`. Godot loads `PL.export()`. Firebliss first; the Throne and the Godthrone can take it.
- **The wind the ground makes** (`core/atmos/fx/89-atmos-fx-slopewind.js`, `fx/test-slopewind.js`; item 4): katabatic flow down the
  fall line by night, anabatic up it by day, gap winds that reverse with the day, and cold-air pools in hollows, on baked grids.
  *Adopting it:* `const W = ATMOS.slopeWind({ground, box, cell, katabatic, gaps, pool})`; `W.attach(ATMOS, hourFn)` adds the field to
  `ATMOS.windAt` (CPU readers only: the shaders' `atmWind` keeps the base wind), `W.provide(KHAZ, baseC, hourFn)` gives core/hazard's
  `temperature` its pools, and `KHAZ.bindWind` takes `W.windAt` for the night gas. Godot loads `W.export()`.
- **Skarn and the rock glaze** (`core/terrain/35e-core-strata-skarn.js`, `test-strata-skarn.js`; items 5-6). The plan asked whether
  `KSTRATA.vary` was enough for skarn: it is. Lens formations on its `pts` and `noise` pinch out at their rims and swell inside,
  zoned from the intrusion front (garnet and magnetite near, epidote farther). The glaze is a thin-film tint by view angle and film
  thickness on the rock a stack names (kinds, formations, fault faces: the pseudotachylite mirrors). *Adopting it:* list it after
  `35c`; `const V = KSTRATA.skarn({seed, base, top, front: {pts}, lenses, scale})`, read as any varied stack, and register the
  magnetite pods in `V.skarn.lenses` as ore; for the glaze, `KSTRATA.glazeAt(S, G, x, y, z)` per vertex into an attribute and
  `KSTRATA.glazeGLSL()` in the fragment shader. `STRATA-PLAN.md` section 10.
- **Landforms** (item 7). **The chasm head:** `stepcut` lines take `head: {at: 'end'|'start'|'both', len, amph, wall}` (in place in
  `38c`, which no build lists; a record without it is unchanged: `test-landforms.js` freezes the old records' digest, `55247ac0`):
  the depth tapers and the walls close round an amphitheatre with their steps, `wall` keeping a sapped headwall. **`KRELIEF.grabenNet`**
  (`38d-core-landforms-net.js`, `test-landforms-net.js`): grabens on several fault trends as en-echelon `stepcut` segments with chasm
  heads, hashed per (world, trend, line, segment), with their corridors, crossings and the horst bastions between; its own `shape`
  unions the cuts (the deeper floor wins at a crossing; the cuts applied one by one would add up there). **`KRELIEF.ripples`** (same
  file): giant current ripples, gentle stoss and steep lee, crests that wander and fork without a seam. *Adopting it:* list `38d`
  after `38c`; put `KRELIEF.grabenNet({box, world, id, trends: [{az, spacing, w, depth, len}], keep, ground})` or
  `KRELIEF.ripples({poly, flow, wl, h, seed})` into `KRELIEF.apply`; `N.corridors` feeds `KSIGN`'s cost, `N.bastions` the flora and
  `KGLACIER`. `LANDFORMS.md`.
- **Varied strata on the GPU** (`core/terrain/35d-core-strata-bake.js`, `test-strata-bake.js`; item 8): a varied stack's moved
  contacts baked over a box into an RGBA8 texture (16 bits a contact, only the moved ones), `ksVaryYY` written as GLSL with a JS twin
  on the same bytes (they agree to the last bit; the bake's error against `V.yy` is measured into `B.err`). *Adopting it:* list `35c`
  and `35d` after `35`; shade the flat stack, `const B = KSTRATA.varyBake(V, {box, step})` (shrink `step` until `B.err` fits), and in
  `onBeforeCompile` after `M.inject(sh)`: `sh.fragmentShader = KSTRATA.varyPatch(sh.fragmentShader, B)`, `uKSVary` a NEAREST
  `DataTexture(B.data, B.W, B.H)`, `KSTRATA.varyKey(B)` in the cache key. Godot's bake and `ks_vary_yy` are owed. `STRATA-PLAN.md`
  section 9.
- **Animal sign** (`core/biome/46-core-sign.js`, `test-sign.js`; item 9): `KSIGN.make` reads kits/fauna's herd records (or plain
  herds) and gives trails (least-cost paths from bedding to pasture and water that follow cheap corridors, avoid cliffs and widen
  where herds share them), wallows, dung, browse lines, trample and bone yards; every draw a hash per cell on one lattice, so a tile
  agrees with the whole box. *Adopting it:* add `'46-core-sign.js'` to `CORE_BIOME`; `const S = KSIGN.make({herds, ground, cost,
  water, box, world})`, bake `KSIGN.maskAt(S, x, z)` into the weights the KGROUND layers read, decals from `S.dung` and
  `S.boneyards`, the flora's browse line from `S.browse`. `core/biome/README.md`.
- **The defended platform village and the trade post** (`core/hamlet/32-hamlet-platform.js`, `34-hamlet-trade.js`,
  `test-hamlet-platform.js`, `test-hamlet-trade.js`; item 10): `KHAMLET.platform` lays roomblocks on a plinth or in a cliff alcove,
  stepped back in storeys round a plaza, entered by hatches and ladders with no door on the outer face, the pen and court at the
  foot; `KHAMLET.tradePost` lays two cultures' halves either side of a line, the serai and the market on it. *Adopting it:* list `32`
  (and `34`) after `30`; `KHAMLET.platform({...village spec, plinth: {pts, top, foot}})` or `alcove: {line, depth, floor, height}`;
  `KHAMLET.tradePost({id, world, cultures: [a, b], links: [A, B], caravans})`; register `records` and `ladders`. No Kimr, Painted
  Men, Yuni or Coyote row exists: their keys come back `pending` with boxes (`KHAMLET.pendingRow`), and a future row names
  `platform {...}` and `trade {...}`. The `trade` focus is kept in `34` (`KHAMLET.TRADE_FOCUS`), not added to `KHAMLET.FOCI`.
- **Outlaw bands** (`core/camp/50-camp-outlaw.js`, `test-camp-outlaw.js`; item 11): the `outlaw` war-camp row, a band size per row
  (`band: [10, 30]`; a row without it is unchanged), `KCAMP.lookout` (sees the road, is not seen from it: cover at the lookout and no
  skyline behind it), `KCAMP.outlawCamp` (the hidden camp within reach of its best lookout). *Adopting it:* list it after `40`;
  `KCAMP.outlawCamp({id, world, road, ground: {h, ok}, cover, box, water})`, register the lookouts and the camp's records, stand-ins
  for the pending ones until a Yuni camp kit exists.

**What each plan can now call:** Labyrinth: `KRELIEF.grabenNet`, `KSIGN`, `KHAZ.ENV.stampede` and `rockDrop`, `KHAMLET.platform`.
Firebliss: the thermal surfaces, `KHAZ.crust`, `KHAZ.night`, `WATER.flood` with `KHAZ.ENV.flood`, `ATMOS.ashPlume`. Mid Basin: the
thermal surfaces, `KHAZ.night`, `KHAZ.crust`, the flood, `stepcut`'s `head`, `KSTRATA.varyBake`, `KCAMP.outlawCamp` and `lookout`.
NE outer wall: `KSTRATA.skarn`, `KSTRATA.glaze`, the thermal surfaces, `KHAZ.night`, `KHAZ.crust`. Outland Gate: `ATMOS.slopeWind`'s
gaps, the flood, `KRELIEF.ripples`. Painted Highlands: the flood, `KHAMLET.platform`'s alcove. W outer wall: `KSTRATA.varyBake`,
`ATMOS.slopeWind`, the flood. Loom-Chasms: `grabenNet`, `stepcut`'s `head`. Great Chasm: `KHAMLET.tradePost`, `KHAZ.night`, the
thermal surfaces. Godshearth: the thermal surfaces, `KHAZ.crust`, `KHAZ.night`, `ATMOS.slopeWind`. Opal Valley: `KSTRATA.glaze`,
`KHAZ.crust`, the thermal aprons. SE outer wall and the Twins: `ATMOS.slopeWind` (and its pools), the thermal surfaces, `KHAZ.crust`,
`KHAZ.night`.

**Owed:** the Godot twins (each piece exports plain data; GDScript for the slope wind, the plume, the glaze, `ks_vary_yy` and the
relief kinds is not written), a GPU look at every drawn piece, the slope wind in the shaders' `atmWind` (it needs a baked wind
texture), the flood's `WATER.flowAt` (it takes no time: use `F.flowAt(x, z, t)`), and the rows for the Kimr, the Painted Men, the
Yuni and the Coyote Men.

## `anomaly/`

`KANOM` (2026-11-10, `anomaly/README.md`; `biomes/ancientsvalley/PLAN-ANOMALIES.md` 4 and 14): zones where physics fails, as
records (`gravity`, `time`, `bend`, `space`, `portal`; a circle or a polygon, a rim ramp, a strength), registered in core/tags
with their hazards on core/hazard before they are drawn. `KANOM.at` (gravity and time multiplied in log scale), `walk` (the heavy
and the slow walk, never stuck), `squash` (the Press's placement), `owed` (the world's time on leaving, capped at a day). Free when
absent: no record in reach and every reader gets the same frozen NORMAL. Its hazard rows (`crushing`, `aging`, `lift`) go into the
vocabulary when the file loads, so a page without it is byte-identical. `host/90-anomaly-walker.js` binds the host camera's
walker. `[G data]`; `node core/anomaly/test-anomaly.js`. The particles it holds or presses are core/atmos's `fx/89-atmos-fx-localtime.js`.
## `atmos/`

The atmosphere and street-dressing module: evening lights and a glow layer, particles, weather, ivy and window boxes,
sewer grates, lamps and fountains, InstancedMesh culling, the open-water wave field (`#include <atmos_waves>`) and the
sky's light on standard materials (`ATMOS.skylight`). One global (`ATMOS`) behind a five-item host binding, so any
three.js r128 build can take it. Read `atmos/README.md`. **Used by** `settlements/iziz` (city target; its `build.py`
reads it through `TARGET_CORE`), the first Voth (the bay's waves; retired 2026-10-14, its build in `archive/voth-first`), `settlements/girder` (the sky's light) and
`settlements/locus` with `settlements/mungo` (the lake's waves, shading only); they add `core/atmos` to their `build.py` core
loop and bind it in `src/90-atmos-host.js`. `kits/ringsea` and `biomes/geyser` take its core, presets, wave field and
skylight for their sea through `core/water`.

## `water/`

One module for every wet surface (`water/README.md`; the plan is `atmos/WATER.md`). `20-core-water.js` ([G data]) is
`WATER`: six kinds (open, shore, flow, fall, still, wet) as records, their CPU twins (`WATER.heightAt`, `flowAt`,
`seaLevel`, the floating helper `WATER.ride`) and `export`. `50-core-water-draw.js` draws open water: a CDLOD mesh
(instanced 17x17 nodes from 8 m leaves, morphing between levels, the root snapped to the camera) on the shared wave field
plus Gerstner trochoids, one clock (`atmWaveT`), the sky through `ATMOS.skylight`, Jacobian foam with a decay. It needs
`core/atmos` (`0-core`, `0p-presets`, `a-waves`, `b-skylight`). **Used by** `kits/ringsea` (the roadstead; the kit's
Gerstner, `rsSeaH` and `rsRide` moved in) and `biomes/geyser` (the sea off the beach). After a change: `node
core/water/test-water.js` (it runs the shaders' own GLSL against the twins), then rebuild both and run
`kits/ringsea/verify.py --assert`. Phases 2 to 6 (shore, flow and falls, still and wet, FFT, Godot) are to do.


## `shadow/`

The sun's shadows (2026-11-03, the owner: the valley needs them; first at `kits/metropolis`). One shadow box that follows the view
instead of a fixed one per build: `10-core-shadow.js` ([G data], global `KSHADOW`) is the numbers (`KSHADOW.fit`: the sun's shadow
camera placed on the texel grid so a moving eye does not make edges shimmer; `KSHADOW.radiusFor`: the box's half side for the eye's
height, 90 m round a walker to 600 m from high up, in steps); `host/12-core-shadow-host.js` ([web]) is `KSHADOW.attach({ renderer,
scene, camera, sun, ground })`, which readies the renderer's shadow map and moves the page's sun in the scene's `onBeforeRender`
(after `core/atmos` has set the sun for the frame), and `cast(root)`, which flags a group's lit meshes. **Off by default** (the owner,
2026-11-03: toggleable, off, in every build and rebuild): while off the renderer's shadow map is disabled, so there is no shadow pass and no
shadow variant; the panel's `shadows` button, `?shadow=1` or `H.set(true)` turns them on (the mirror switch's pattern). `node core/shadow/test-shadow.js`.
Read `shadow/README.md`.

**Used by** `kits/metropolis`. About twenty builds still wire their own shadow map (`settlements/girder`, `voth`, `yuni`, the kits'
`90-scene.js`): each can move onto this when it is next touched.

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

## `city/`

The city-layout module (`city/PLAN.md`): a city is an instance, `KCITY.create({tune, site, ground, kit, rules, seed})`
-> `{plan, raster, index, steps, run(), export()}`, laying out avenues and lots, main streets, side streets, alleys
and the infill of every block as plain records (ways, lots, greens, the wall) with the step that made each, on one
occupancy raster and one footprint index (on `space/`). The world gives its data (the site, its ground, its kit, its
rules); the module has the site layer (steps 0-5: roles, the zone raster, avenues, highways, the wall as records,
ground deltas), the builder's defaults (6-12), and street and infill strategies behind one interface (`alleys`;
`frontage-courts`, Ys's). Voth's city plan (`settlements/voth`) is the first world on it; Ys's placement pass takes its
shared primitives. **Every settlement should eventually be ported to it**: `city/README.md` has the API, the method,
the porting steps and the module's debts.

| File | What |
|---|---|
| `10-city-core.js` | [G data] the `KCITY` namespace, stream PRNG (`SL.stream`, or KRAND), value noise, geometry, the occupancy raster, A* |
| `12-city-index.js` | [G data] footprints, road segments and fields on `KSPACE` (`KCITY.boxIndex`, `KCITY.segIndex`): exact for any size |
| `15-city-ground.js` | [G data] the ground through the instance, a per-lot ground predicate, Erewhon's stance (`KCITY.stance`, `stanceAtDoor`) |
| `20-city-plan.js` | [G data] the plan's records: ways, lots along streets (`SL.tryLot`, `SL.lineLots`), parks and plazas, core/tags |
| `25-city-site.js` | [G data] the site layer (`KCITY.site`, `KCITY.ground`): roles, the zone, avenues, highways, the wall, pads and banks |
| `31-city-steps-b.js` | [G data] steps 6-9: civic by `near` scorers, avenue lots, main streets across the voids, main-street lots |
| `32-city-steps-c.js` | [G data] steps 10-12 (the `alleys` strategy): side streets, lots and alley entrances, alleys and the infill |
| `33-city-strategies.js` | [G data] the strategies (`alleys`, `frontage-courts`) and their shared primitives (`KCITY.prim`) |
| `34-city-radial.js` | [G data] the optional radial strategy (the retired toy's rings and spokes) |
| `40-city-kcity.js` | [G data] the instance: `KCITY.create`, steps as data, `run`, `bind`, the export |
| `50-city-host-streets.js` | [web] streets, the ground overlay, labels, the step slider |
| `52-city-host-buildings.js` | [web] lots' kit pieces as instanced LOD prototypes; furniture pieces |
| `test-city.js`, `golden.json` | `node core/city/test-city.js` (`--write` after a meant change): a synthetic site, each check with a negative |

## `space/`

One spatial index for every placement pass (ROADMAP.md section 8, "One spatial index, not three"): a uniform grid of
square cells, `KSPACE` ([G data]: no THREE, no DOM).

| File | What |
|---|---|
| `20-core-space.js` | `KSPACE.create({cell})` (no default cell): `insert(item, x, z, r)` files an item under the cells its square `[x-r,x+r]x[z-r,z+r]` touches; `query(x, z, pad, out)` returns every item with `|x-ix| <= ir+pad` and `|z-iz| <= ir+pad`, **in insertion order** (acceptance and the PRNG stream can depend on it), each once, exactly what a linear scan returns; `some(x, z, pad, fn)`, `items`, `size()`, `clear()`. Items wider than 64 cells, non-finite numbers and coordinates beyond 2^20 cells are kept on a list every query reads, and a query wider than the grid is a scan, so the answer never depends on the grid. Coordinates are read once, at insert |
| `test-space.js` | `node core/space/test-space.js`: query equals a linear scan on random sets (three cell sizes, odd pads and radii), with items inserted between queries, under a disc test, with wide items and far coordinates; each check with a negative |

**Used by** `core/biome` (`BIO.clearOf`, `clearOf3`, `BIO.scatter`: every biome kit lists it in `CORE_SPACE`, and
openworld/little-demo in its `ORDER`) and `core/city` (its footprint, road-segment and field index,
`city/12-city-index.js`; Voth's placement hash unchanged by the move, 2026-10-14). The biome core falls back to its
scans on a page that does not load it.

**To move onto it:** openworld/little-demo's flora buckets (`src/85-world-flora.js`, 24 m buckets of its records),
proven by its placement hash before and after; `core/walk` keeps its own 16 m hash for now. Its GDScript twin comes
with the biome placement port.

## `walk/`, `sched/`, `minimap/`: engine-neutral, for the Godot port

Three small modules with no THREE and no DOM in their data side, each with a node test (each check has a negative).
Their provenance is in `TODO.md`. Each is a global; a build adds the file to its fragment list
and to `DETERMINISTIC` (none of them draws from the seeded stream).

| File | What |
|---|---|
| `door/10-core-door.js`, `door/20-core-glass.js`, `door/90-core-door-host.js` | `KDOOR` ([G data]): doors that open and shut, as records keyed by stable ids (hinge, width, swing, state, locked, owner), `open` / `close` / `toggle` / `nearest` as plain functions a key, an NPC, a quest or a save calls, each doorway's walk blocks in `KWALK` (shut blocks, open clears), `state()`/`load()` deltas, `export()`. `KGLASS`: one set of glass (clear, lit, frosted, smoked, stained, and the room card behind a pane on a solid body) as data plus one three.js material each. `KDOORHOST`: posing a leaf, the frame tick, the E key. Lifted from Iziz's `IZDOOR` (the Vernacular's `69e5` draws its leaves on it). `core/door/README.md`; `node core/door/test-door.js` |
| `walk/20-core-walk.js` | `KWALK`: one list of walkable floors (level rects, sloping strips) and blockers, written by whatever builds the geometry as it builds it (after Moria's carver). Queries `floorsAt`, `floorBelow`, `blocked`, `push` (a walker slides round corners), `setBlock(rec, on)` (a door that opens and shuts: a block, or an array, switched off and on), and `export()` (navigation-mesh source and collision boxes for Godot) |
| `sched/20-core-sched.js` | `KSCHED`: repeating timetables of eased segments (`timeline`), conflict-free phases (`slots`), a periodic event's strength (`eruption`: geysers), formations in the leader's frame, and a queued approach that slows as it arrives. Pure functions of t, so Godot plays them back identically |
| `minimap/88-core-minimap.js` | `KMAP` ([G data]): a plan as records (rects, turned boxes, strips, discs, labels, a hill-shaded relief grid, or a `KWALK` registry), `pick`, `paint` and `overlay` onto any 2D-context-like object, `export()` the plan as data. No document, no canvas of its own, no input |
| `minimap/88a-core-minimap-host.js` | the browser panel ([web], moves to `core/host/` in Phase 1): `KMAP.mount(M, op)`, also attached as `M.mount(op)`. Base painted once and repainted when `M.rev()` moves, overlay a few times a second, hover names, click goes there, M toggles. A build takes both files |
| `walk/box/24-core-walk-box.js` | `KWALKBOX` ([G data]): for kits that build from boxes and declare no floors (Islanders, Lizardmen): a drawn upright box is read as a floor (flat: a deck, a slab, a stair tread) or a block (tall: a wall segment, a post); `ladder` is a strip, or rung floors when steep. Opt-in by path, not by the `walk/` listing (`kits/islanders/build.py`). `node core/walk/box/test-walk-box.js` |
| `walk/test-walk.js`, `sched/test-sched.js`, `minimap/test-minimap.js` | `node core/<dir>/test-*.js` |

**Used by** the first Voth (retired 2026-10-14; the minimap: its `build.py`, now `archive/voth-first/build.py`, read `core/minimap/` like `core/lod/`, and
`settlements/voth/src/88b-voth-minimap.js` feeds it the terrain, the roads, `PLACED` and the cantons), `settlements/locus` and `settlements/mungo`
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
from `tex/`, which `tools/textures/pack.py` writes from `materials.json`), `settlements/yuni` (the same way, since
2026-10-05: 24 families on library sets, the interiors included; the rest procedural `TEX.def` kinds; `?mat=proc` is
the old look) and `settlements/screamers` (2026-10-05, the first Ancients-lineage build: `23` and `25` only, since
`24-tex-def.js`'s global `TEX` would meet the lineage's canvas table; `src/72c-matlib.js` puts each family on its `MAT`
keys by world-space triplanar projection, the lineage's UVs being in no one unit).

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

**The season (H7, 2026-10-26; `biomes/hyperjungle/PLAN-LANDS.md` section 11).** `KCLOCK.season(day, hour, o)` and
`C.season(o)` give where the day falls in the sky model's year (`KCLOCK.YEAR` is `ATMOS.SKY`'s `yearD`, `startDay` and
`solsticeDay`; `test-clock.js` checks they agree): `{yearDay, phase, summer, wet, dry, quarter, name}`. South by default
(Krator's sites); `latitude > 0` turns the year half round; `lagD` delays the wet behind the sun (a river's flood after
the rains), `sharp` squares it toward two seasons, `wetIn: 'winter'` is a Mediterranean year. Plain data; the GDScript
twin is `core/clock/kseason.gd` (vendored to `godot/tests/clock/` by `godot/tools/sync_core.py`; `kseason_test.gd` runs
`golden-season.json`, which `node core/clock/test-clock.js --write` rewrites). Its takers are the foliage's season blend
(`core/biome/README.md`, "The season") and a still's seasonal level (`core/water/README.md`, "Seasonal still water").

**Adopting it:** a page with core/clock already has it. Read it where a pass wants the season:

```js
const S=KHOST.host.clock.season({sharp:2});   // or KCLOCK.season(day, hour, {...}) on a page with its own clock
```

## `host/`

The host shell (ROADMAP.md section 10; GODOT-PLAN.md Phase 1), all `[web]`: `90-host-camera.js` (orbit, pan, fly, walk,
the pin, the depth range), `91-host-loop.js` (`KHOST.take`, the frame loop, which owns the world clock `KCLOCK` and isolates
each subscriber's errors, the `TICKS` shim, `window._ready`), `92-host-panel.js` (the bar, foldable panels, layers, time
controls, inspector, `#errs`, the loading note, `?chrome=0`) and `95-host-probe.js` (`window._api`). Voth's city-plan viewer,
copied and generalised (Voth's own files are the Voth branch's; `sources.py` says when they change). A build lists
them with `host.py` (`CORE_HOST = khost.SHELL`, which adds `clock/20-core-clock.js`), hands its page to `KHOST.take`, and
keeps no camera, loop, panel or probe of its own; `94-host-polytool.js` (the inspect, polygon and path tools) is opt-in.
Read `host/README.md`. **Used by** every biome kit in `biomes/`, the Throne's eleven pages included.

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

The cultural socket and banner/awning system: buildings declare sockets, a culture pack fills them (Iziz, Republic, Voth, Yuni, Beast Riders, generic). A worked example, `kits/post-apoc/sockets-example/` (it builds on that kit's engine),
builds a sheet of the same wall in every pack. Read `sockets/README.md`. **Used by** `kits/post-apoc` (its `build.py` reads `37-sockets.js`, `38-symbols.js` and `80-cultures.js` from here; a local copy with the same name overrides; so does `kits/post-apoc/apoc_bundle.py`, the closure `settlements/screamers` loads) and, for the symbols alone, `kits/catalog` (vendored as `krator-symbols.js`).

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
| `opt/54-core-tags-sound.js` | [G data] opt-in (a subfolder: the settlements that take every file in `core/tags` do not take it): the `sound` record (H9), aeolian emitters with `KTAGS.sound`, `soundLevel` and `soundAt`; twin `ksound.gd` (`tags/README.md`, "Adopting it: the sound key") |
| `test-tags.js` | `node core/tags/test-tags.js` (`--write` rewrites `golden.json`) |
| `ktags.gd`, `ktags_test.gd`, `golden.json` | the uid in GDScript and its vectors (passing in Godot 4.5); copied to `godot/tests/tags/` |

## `export/`

The one exporter (GODOT-PLAN.md Phase 4, ROADMAP.md stage 2d; 2026-10-13): `EXPORT.world({box})` returns one
`krator-world` object per build or tile, which each module fills with its part through `EXPORT.register(section, fn)`.
`export/README.md` has the API, the container, the convention, every section's shape (the stubs' contracts too), the
harness command and the M4 proof. **Used by** the fifteen biome kits other than the Throne (`CORE_EXPORT` in each
`build.py`); the biome core fills `items`, `buckets`, `materials`, `textures`, `terrain` and `stage`
(`biome/42-core-export.js`, `43-core-export-host.js`). `python3 tools/harness.py export <page> --out godot/data/<case>/
--box ...` writes it; `godot/krator/world_import.gd` reads it.

| File | What |
|---|---|
| `07-core-export.js` | [G data] `EXPORT`: `register`, `world`, `check` (ids join), `glb` (meshes as glTF with `EXT_mesh_gpu_instancing`, the rest JSON), `compact`, `terrain`, `pack`/`unpack`; the sections, the convention, the stubs' contracts. No THREE, no DOM |
| `09-core-export-adapters.js` | [G data] the parts of core/tags (`registry`), core/atmos (`atmos`) and the material records (`materials`) until those modules register themselves; `EXPORT.ground` for a build's terrain |
| `test-export.js` | `node core/export/test-export.js`: a biome page built in node, exported; each check with a negative |

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
| `27-core-mask-distance.js` | [G data] `KMASK.distance(mask)`: the exact Euclidean distance transform of a region raster, in integers (squared pixels), and `KMASK.distanceHash`; a species' reach reads it (`core/biome` `BIO.reachW`). Opt-in: a build lists it after `25-core-mask.js` |
| `test-mask.js` | `node core/mask/test-mask.js` (`--write` rewrites `golden.json`) |
| `test-mask-distance.js` | `node core/mask/test-mask-distance.js`: exact against a brute force, the negatives, `golden-distance.json` (`--write`) |
| `test-mask-xform.js` | `node core/mask/test-mask-xform.js`: world-space calls give the same bytes and ops as the shapes in pixels; the negatives throw |
| `kmask.gd`, `kmask_test.gd`, `golden.json` | the GDScript twin, replaying the ops to the same bytes (passing in Godot 4.5); copied to `godot/tests/mask/` |
| `kmask_distance_test.gd`, `golden-distance.json` | `KMask.distance` in Godot: the golden's squared distances (hash) and samples (their IEEE bytes) match; passing in Godot 4.7.2 |

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
| `77-sim-6-population.js` | `SIM.populate`: residents from the roles' counts and home kinds (or place ids; `deal:'round'` deals them in turn), work dealt round-robin, boats at docks, vehicles at bases; a `fill` role takes the beds left; with settlements, a town's role in its own town's homes, work in its home's town (`SIM.populate({settlement})`) |
| `77-sim-6-trade.js` | `SIM.trade`: trade between settlements (each with its own economy): carriers on a timer or a `SIM.transport` line; leaving, a load of what the next town wants and this one can spare; at sea in neither town's stock (`SIM.tradeInbound`/`Outbound`); landing in the other's; gated by the factions' relation (`SIM.trades`); `SIM.tradeReport` |
| `77-sim-7-lod.js` | the levels: `SIM.level(s, 'abstract' \| 'presented')`; an abstract town is skipped by the step and runs on its books (production by schedule, timed carts, households by the hour); raised, everyone is decided where the schedule says and a cart on a trip gets its route |
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

## `charactermodels/`

The characters: two MakeHuman bodies and the giants, morphing face, build and ancestry, clothes for every people that
follow the morphs, hair, beards and tint, peoples that keep a culture's strangers in range, body mods, about 140
animation clips with props and cloth, and the Godot twin (`godot/krator/character/`). Moved here from `kits/characters`
on 2026-10-16. Unlike the other modules it is also a build (`build.py`, `src/`, two pages in `dist/`: the Cosmetic Lab
and the Animation Lab), listed by `tools/make_index.py` and `tools/audit_port.py` through `CORE_BUILDS`; its pieces
(about 1.5 GB of GLBs and morph files) are made from Blender + MPFB2 and gitignored, so CI runs its node test
(`tests/test-rig.js`) but not its build.

**Used by** nothing yet. It is meant to replace the settlements' citizen stand-ins (GODOT-PLAN.md Phase 5, "Bodies
for the citizens"; `charactermodels/README.md`, "A core module: where it goes next"). Read the `character-modeling`
skill (`.claude/skills/character-modeling/`) before working here.
