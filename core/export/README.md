# core/export: one container, `krator-world`

GODOT-PLAN.md Phase 4 ("one exporter"), ROADMAP.md stage 2d. Every module that places or describes something gives its
part to one plain-data object, per build or per tile; the harness writes it headless into `godot/data/<case>/`, and
`godot/krator/world_import.gd` builds the tile from it. Proof milestone M4 (a biome tile opens in Godot from
`core/export` with its materials, tags and terrain) is met by `biomes/sedesert` (below, "The proof"); M5 (the first city,
on the `KRATOR_EXPORT` record shape) by a district of Iziz (below, "Iziz").

| Fragment | Tag | What |
|---|---|---|
| `07-core-export.js` | [G data] | `EXPORT`: `register`, `world`, `check`, `glb`, `compact`, `terrain`, `pack`/`unpack`; the section list, the convention, the stubs' contracts. No THREE, no DOM: it runs in node |
| `09-core-export-adapters.js` | [G data] | the parts of modules that do not register themselves yet: `registry` (core/tags), `atmos` (core/atmos), `materials` (core/materials/record's adapter tables), `water` (core/water), `EXPORT.ground(...)` for a build whose ground no module exports, and `EXPORT.groundLayers(...)` for a ground shader's world-space layers |
| `test-export.js` | | `node core/export/test-export.js`: a biome page built in node, exported; each check with a negative |

A build lists both files (a biome kit: `CORE_EXPORT` in its `build.py`, beside `CORE_TAGS`). The modules that fill it
are the biome core (`core/biome/42-core-export.js`: items, buckets, materials, textures, terrain;
`43-core-export-host.js` [web]: stage) and the adapters. A module that loads before `07` queues its contributors in
`EXPORT_QUEUE`, which `07` drains, so fragment order does not matter. A page built without core/export (the Throne and
its stations, Verge) still exports: `tools/harness.py export` injects the two files and the queue fills it.

## The API

```
EXPORT.register(section, fn, {by})   -> unregister(). fn(ctx) returns the part, or null. An unknown section throws.
                                        Registering the same (section, by) again replaces it.
EXPORT.world({box?, sections?, build?, ...opt}) -> the container. box [x0, z0, x1, z1] is a tile; sections the names to
                                        fill (an unknown name throws); everything else reaches each contributor as ctx.opt
EXPORT.check(world, {uid?, profile?}) -> {ok, problems, joins}: every reference resolves (below); uid(cls, key, [x,y,z])
                                        recomputes each instance's uid from its matrix; profile: the sections the case
                                        must fill ("Profiles" below); without one the statuses are not judged
EXPORT.glb(world)                    -> {json, glb: Uint8Array, stats}: the meshes as binary glTF, the rest as JSON
EXPORT.terrain(box, {h, water?, field?, step?, probes?}) -> a terrain section from a build's ground
EXPORT.groundLayers(spec)            -> a ground's world-space layers as one material record and its maps ("Ground
                                        layers" below); groundLayers(null) takes them back out
EXPORT.compact({name: [array, itemSize]}, index) -> the vertices the index uses, renumbered
EXPORT.pack(typed) / EXPORT.unpack({type, n, b64})
```

`ctx` = `{box, opt, build, out, inBox(x, z), memo(key, f)}`. Sections fill in `EXPORT.SECTIONS` order (items, buckets,
materials, textures, registry, terrain, stage, atmos, water, fixtures, interiors, furniture, sim, city), so a later one reads
an earlier one in `ctx.out` (the registry crops itself to the tile's items; the stage samples the ground's look on the
terrain grid). `memo` lets a module that fills several sections compute once per `world()` call.

**Failure is per section.** A contributor that throws is recorded in `errors` (`{section, by, error}`), its part is
skipped and the other sections still fill; a list record without an id, a duplicate id, a non-list for a list section
and a second contributor to a single section are recorded the same way (the first stays). An unknown section name, in
`register` or in `world({sections})`, throws: that is a programming error, not data.

## The container

```
{ format: 'krator-world', version: 1, build, convention, box,
  sections: { <name>: { status, by: [contributors], errors? } },
  errors: [ { section, by, error } ],
  items: [], buckets: [], materials: [], textures: [],               lists: concatenated over contributors, ids unique
  registry, terrain, stage, atmos, water, fixtures, interiors, furniture, sim, city,   one contributor each, or null
  stats: { items, instances, buckets, triangles, materials, textures, records, errors } }
```

`status`: `ok` (filled), `empty` (its contributors ran and gave nothing: a page without ATMOS), `error` (every
contributor failed), `none` (nobody registered), `stub` (a section no module fills yet: its contract is below),
`skipped` (not asked for).

**The convention** (`EXPORT.CONVENTION`, in every container): metres; +Y up, x east, z south; right-handed (glTF's and
Godot's); matrices 4x4 column-major, elements 12 to 14 the translation (Godot: basis = columns 0 to 2, origin =
column 3); front faces counter-clockwise (a reader of the JSON form reverses for Godot; a glTF importer already does);
uv as three holds them, sampled at `uv * repeat + offset`, `flipY` true putting the image's top row at v = 1; colours
linear for instances, vertices and materials (three's working values as hex: do not convert), sRGB for texture images
and the atmosphere; typed arrays `{type, n, b64}` (little-endian bytes); ids as core/tags makes them; the box rule
(an instance by its origin, `x0 <= x < x1`; a bucket piece by its foot).

#### LOD

`convention.lod = {cell: 150, widen: 'half-diagonal', copies: 'none'}` is the one declared LOD policy (ROADMAP.md
section 11 item 4; GODOT-PLAN.md finding 16).

- **What a page exports.** No LOD render copies: `core/lod`'s `extras.lodCopy` meshes are skipped, so the glTF holds each
  original once. A record that three draws in LOD chunks carries `lod: {chunk, range, minRange}` in the JSON form.
- **What Godot does.** Visibility is measured from a node's point, three's from the chunk's box, so the importer splits
  each LOD-chunked item (instances by position) and bucket (connected pieces by centroid) into `cell`-metre cells, one
  node per cell at its centre, and widens `range` (and narrows `minRange`) by the cell's half-diagonal, `cell * 0.7071`
  (106 m at 150). A 300 m tile then thins cell by cell instead of all at once. `krator/biome_import.gd` reads
  `convention.lod.cell` (`KratorBiome.policy_cell`) and falls back to its `CELL` constant, 150, for an older export or
  the krator-biome JSON route, whose convention has no `lod` entry. `world_import.gd` places whole chunks and keeps the
  chunk's own widening.
- **Changing it.** A case sets `lod.cell` in the convention (a smaller cell gives smoother thinning and more nodes: the
  rift tile is 175 item nodes and 47 bucket nodes over 12 cells at 150, 607 and 119 over 28 at 75). A change to the
  default is a change to `07-core-export.js`, so every page that lists it rebuilds. `godot/tests/export/world_test.gd`
  asserts the entry on the sedesert case and the rift counts at both cells.

### The sections

| Section | Filled by | Shape |
|---|---|---|
| `items` | the biome core | `BIO.export`'s item (`biomes/GODOT.md`) plus `id` (`<kit>/<name>`, `@<chunk>` for a LOD chunk, `~<n>` on a repeat): `name, kit, label, material, lod, count, dynamic, geometry, matrices, colours, extras`, and with core/tags `record` (the item set), `recordClass`, `recordKey`, `records` (a uid per instance, aligned with the matrices), `recordIndex` |
| `buckets` | the biome core | `BIO.export`'s bucket plus `id`; a tile's `geometry` keeps only the vertices its triangles use (`compacted: {vertices, dropped}`; ROADMAP.md finding 10); `records`, `recordIds`, `pieces` |
| `materials` | the biome core, the KMAT adapter | one vocabulary: core/materials/record's fields (`family, colour, map, normalMap, roughnessMap, roughness, metal, specular, emissive, doubleSided, alphaTest, scale, tint, hook, lib`) beside the source's own (a biome material's `kind, key, type, options, sway, hooked, vertexColours, transparent`). The adapter's records are `kmat:<build>:<name>`, maps by library reference. `hook` selects the Godot shader library's includes (`godot/README.md`, "The shader library": several joined by `+`; the biome kinds `leaf`, `irid`, `gloss`, `far`, `hang` are aliases of `foliage` and `bark`). A ground's layers are one record with `role: 'ground'`, `hook: 'world-uv'`, `layers` and `weights` ("Ground layers" below) |
| `textures` | the biome core | `{id, from, wrap, repeat, offset, flipY, size}`; `from: 'png'` with `png` (a data URL: canvases, DataTextures), `'library'` with `lib, pack, family, slot`: a library map **by reference** (the build's `tex/pack.json` names the file; the harness copies the pack beside the case), `'none'` with `error` |
| `registry` | the core/tags adapter | `KTAGS.page.export()` (`krator-tags`); in a tile, cropped to the records an item or bucket names, the records whose `at` lies in the box (not item sets), and their parents (`cropped: {from, kept, rule}`) |
| `terrain` | the biome core, or `EXPORT.ground` | `{format: 'krator-terrain', source: 'field' \| 'sampled', box, field, grid, probes}`: `field` the build's KFIELD (`krator-field`, core/terrain) cropped to the box on its own lattice; `grid` the page's `h` and water on a 2 m grid over the box (the stand-in where there is no field; the stage's ground look lies on it); `probes` `h` at 16 x 16 points off the lattice, which a port compares its own sampling against. Without a box: the field whole, no grid |
| `stage` | the biome core's host (43) | `KSTAGE.capture` over the tile (`biomes/GODOT.md`, "The stage"): renderer, lights, fog, environment, the sky panorama from 40 m over the tile's centre, the ground's look on the terrain grid |
| `atmos` | the core/atmos adapter | `ATMOS.export({stage: false})` as it is (`krator-atmos`, `core/atmos/GODOT.md`; its colours are sRGB) |
| `water` | the core/water adapter | `krator-water`: `WATER.export()` and what a port needs to rebuild the twins and the shader to the bit ("Water" below) |

What joins by id (`EXPORT.check`): an item's and a bucket's `material` to `materials`; a material's `map`,
`normalMap`, `roughnessMap` and each of its layers' maps to `textures`, each layer's weight to its weights' names (and
the weights' length to their grid); a water surface's bed bytes to its texel count, a shore's `of` and every water
probe's surface to the water section; an item's `record` to an item set in `registry` with the same class and key,
`records` and `recordIndex` as long as `count` (and, given `uid`, each uid recomputed from its matrix); a bucket's
`recordIds` to registry records whose uid is the bucket's; every registry record's parent to the registry.

### Water (core/water; ROADMAP.md stage 2e)

The adapter (`09`) reads `WATER.export()` and the surfaces themselves, so a port rebuilds core/water's twins and its
shader without reading JavaScript. In a tile it keeps the surfaces whose extent meets the box (an unbounded sea always).

```
{ format: 'krator-water', version: 1, period (s: the clock's wrap, ATMOS.PRESETS.waves.period, 600 without core/atmos),
  presets (WATER.PRESETS: sea, swells, open, foam, bed, cdlod), field: 'atmos' | 'none' (whether the page has the shared
  wave field), clock, note,
  surfaces: [ { id: 'water:<n>', kind: 'open' | 'shore' | 'flow' | 'fall' | 'still', name, extent [x0, z0, x1, z1] | null,
     and WATER.export()'s own fields for the kind (flow: pts [x, z, y, slope, width, speed], ribbon {step, across, margin,
     count, rows, sum [x, y, z]} (the mesh core/water draws: a port rebuilds it and checks the count and sums); fall: lip,
     dir, speed, drop, plunge [x, y, z] | null, spread, tFall, lipW, curtain {rows, cols, count, sum}, plungePoint
     [x, y, z, r]; still: level, bounds, poly, fountain [x, z] | null, mesh {triangles, sum}; shore: of (a surface id),
     band); an open surface:
       level (null: the sea's, with its tide), base (the level its bed was baked at), swell (the preset's name or the
       list as given), waves [{A, lambda, k, dir [dx, dz], H, phase, cycles, turns [tx, tz, tc]}] (turns per metre and
       cycles per second: the phase is 2 pi (fract(x tx) + fract(z tz) - fract(t tc)) + phase), field (the share of the
       shared wave field the page draws: 0 without core/atmos), fieldShare (as asked), chop, kChop, tilt, lod, px, damp,
       amp, bounds, bed {x0, z0, cell, nx, nz, level, bytes (Uint8Array: RGBA per texel, PRESETS.bed's two channels;
       on a shore grid B is the signed shore distance over [-band, band] and A the depth linear over PRESETS.shore.mid)} or
       null, shore {band, clip (cells), seeded, wetCells, window (m) | null} (Phase 2: the bed is a shore grid), mask {x0,
       z0, cell, cellZ, nx, nz} (the coarse cells it may cover; the bytes are the page's), look or null } ],
  probes: [ [x, z, t, h, surface id] ]     WATER's own heightAt at 6 x 6 points over each open surface's part of the
          [x, z, 0, h, id, vx, vz, speed, slope]   tile, at t = 0, 3.7 and 421.3 s; on a river, 8 points down its line
                                           with its height and current (WATER.flowAt)
```

`look` is the material of the `WATER.draw` that draws the surface (`colour, roughness, metal, envMapIntensity,
transparent`), or what a build that draws its water itself writes on the surface record (`S.look`: sedesert's pond:
`colour, shallow, deep` as linear hex, `roughness`, `transparent`, `sky {colour, base, grazing}`, its shader's flat sky
mixed in by `base + grazing (1 - n.v)^3`, and `unlit`: its shader takes no light, so Godot emits the colour). Godot: `godot/krator/water.gd` (`KWater`) is the twin; `water_import.gd` draws
each open surface on `shaders/water.gdshader` (the library's `lib/water.gdshaderinc`, `WATER.glsl`'s maths with the waves
as uniforms; with `wtr_has_shore` the shore grid's flood clip, shoaling and breakers), and since core/water's phases 2 to 4
(2026-10-13) the other kinds too: a flow as its ribbon (`KWater.ribbon`, the same vertices) on `shaders/water_flow.gdshader`,
a fall as its arcing curtain (`KWater.curtain`) on `water_fall.gdshader` with its plunge disc on `water_plunge.gdshader`, a
still pool flat at its level on `water_still.gdshader` (all on `lib/water_kinds.gdshaderinc`). A shore band record is drawn
by its open water.

**Phases 2 to 4, proved** (the same test, golden from the same script, seven surfaces): a tarn on a shore grid with a
lower hollow beside it, a river with a riffle and a bend, a 60 m fall, an L-shaped pool with a fountain. KWater rebuilds
the shore grid from the ground's heights to every byte (the flood and the distance transform; without its seed the flood
takes the hollow too, the negative) and the hollow is not the tarn's; its shoaled heights with the breakers equal
WATER.heightAt within 3e-14 m, the shore distance, breaker foam and the beach's wetness within 2e-13; the river's ribbon
(728 vertices) within 5e-13 m and the same triangles, its height, current, advected normal and foam within 8e-13; the
fall's curtain within 5e-13, its streaks and plunge churn within 7e-14; the pool's normal within 3e-16; each with a
negative (a second late, the band a metre off, the fountain left out). On a GPU the tarn's shoaled heights are within
1.5 cm of KWater (the shore distance read through 8-bit filtering: under one byte, 0.31 m) and its depth within 3.5 cm.

**The height twin, proved** (`godot/tests/water/water_test.gd`, its golden from `node godot/tools/water_golden.js`: three
surfaces through this adapter, the Ring Sea's trochoids with half the field and a bed, a pond, a bay with the field's chop):
at 72 points and five clocks (to 98,765 s) KWater's heights equal `WATER.heightAt` within 1.1e-14 m (5 Newton steps; the
shader's 3: 1.2e-14 m), the vertex, frame, normal, foam and bed depth within 4e-13, the section's 324 probes within
1.1e-14 m; tolerance 1e-9 m. One second late, a ripple 1% taller, the field left out or the bed's bytes 3 steps off each
fail. On a GPU (`godot/tests/shaders/library_gpu_check.gd`, Compatibility on llvmpipe) the include's `wtr_height` is within
0.5 mm of the twin. In node (`test-export.js`) the twin rebuilt from the record alone meets the page's probes exactly.

### Ground layers (`EXPORT.groundLayers`)

The biome hosts' ground shaders (`biomes/*/src/45-host-stage.js`) multiply world-space maps over the painted ground: a
fine detail map at two scales, mud cracks weighted by a field. A build describes them once, after its ground material
(sedesert's):

```js
EXPORT.groundLayers({id: 'ground:sedesert', build: 'sedesert',
  terms: [{maps: [{family: 'groundDetail', texture: TEX_DETAIL, scale: .165}, {family: 'groundDetail', texture: TEX_DETAIL, scale: .021, offset: .37}],
           gain: 1.12, amount: .85},
          {maps: [{family: 'groundCrack', texture: TEX_CRACK, scale: .14}], weight: 'crack'}],
  weights: {crack: (x, z) => FC.at(FC.a.crack, x, z)}, step: 2, box: [...the ground], png: t => BIO.texPNG(t)});
```

It joins `materials` as `{id, family: 'ground', role: 'ground', hook: 'world-uv', layers: {terms: [{maps: [{map (a texture
id), scale [u, v], offset [u, v]}], gain, amount, weight}]}, weights: {x0, z0, step, nx, nz, names, values (Float32Array,
the names interleaved)}}`, and its maps join `textures` (a family in the build's pack by library reference, else a PNG).
Each term multiplies the colour by `mix(1, gain * product(maps at xz * scale + offset), amount * weight)`, in order, the
maps' bytes as stored (the page samples them in its own uniform, undecoded). The weights are sampled over the tile at
`step` (without a box, over `spec.box`, at most 512 a side). Godot: `world_import.gd`'s `ground_layers` puts them on the
terrain's `ground.gdshader` (the library's `lib/world-uv.gdshaderinc`), the weights as an RGBA8 texture sampled between
grid points as the page interpolates its per-vertex weights.

### Stubs: the written contracts

A contributor meets this shape (`EXPORT.CONTRACTS`). Since M5, Iziz fills `fixtures` and `furniture` and answers
`interiors` (below, "Iziz"); since 2026-10-18 Yuni fills `fixtures` and `interiors` (below, "Yuni" and "Interiors":
the first room graph through the container); for every other build they are still stubs:

- **`fixtures`**: doors, windows, lights and signs as core/tags records, each with its placement on its host wall
  (Yuni's `KRATOR_EXPORT.fixtures` shape): `{format: 'krator-fixtures', records: [{id, uid, class: 'fixture', kind,
  parent, at, ry, size, tags, host: {wall, side, sill}}]}`. Filled by Iziz (M5) and by Yuni
  (`settlements/yuni/src/77-export.js`: the records `51-fixtures.js` makes, with `host.wall` the shell wall of the
  interior plan that holds the opening, where the building has a plan).
- **`interiors`**: the room graph (`kits/interiors` `ROOM()`), building-local: `{format: 'krator-interiors',
  buildings: [{id (the building's record), storeys: [{y, rooms: [{id, kind, poly, h, doors: [ids]}]}], links: [{id, a,
  b, kind: 'door' | 'stair' | 'ladder', at, from, to}], walls: [{id, a, b, h, col: true}], yard?: {y, poly}}]}`. A
  room's door id is a record of the `fixtures` section (an exterior door) or the id of one of its building's links (an
  interior door); a link's `a` and `b` are room ids, or `outside` or `court` past an exterior door. `EXPORT.check`
  joins both (`joins.interiorsDoorsResolved` of `interiorsDoorRefs`) and requires each building in the registry.
  Filled by Yuni (below, "Interiors") and by a kit's sheet on Iziz's page (below, "The sheet's interiors"); Iziz's
  city answers it empty (its buildings are shells).
- **`furniture`**: GODOT-PLAN.md Phase 4's per-look scheme: `{format: 'krator-furniture', pieces: [{id:
  '<piece>/<variant>/<look>', entry: {tags, anchor, size, role, job, family per material}, lights, mesh (a glb node)}],
  placements: [{record (a core/tags furniture id), piece, at, ry}]}`. A placement's seed is reduced to one of K looks
  (about 4) per variant, so placements share a mesh, and the importer makes one MultiMesh per piece and look. A
  catalog-only export (every piece, no placements) is the furniture library the interiors planner places from. Waits on
  the indexed furniture batch (`wip/furniture-indexed`).
- **`sim`**: core/simulation's export (`krator-sim`: places, actors, schedules, routes, the clock). Verge and Dhelv
  write theirs through their verify (`godot/data/verge`, `godot/data/dhelv`) until they register here.
- **`city`**: `core/city`'s; only the registration point is here. Expected: `{format: 'krator-city', plan (streets,
  blocks, lots as plain records keyed by stable ids), edits (krator-edits/1 deltas by id)}`; its buildings and doors
  join the registry by id. `core/city` registers with `EXPORT.register('city', fn, {by: 'city'})` for the isle demo's
  two plans (M6, `ROADMAP.md` section 11).

## Files: JSON and glTF

`EXPORT.world` returns everything as plain data, meshes included (typed arrays as base64). `EXPORT.glb(world)` splits
it the way the port reads it: **meshes as glTF** (one binary glTF 2.0 file, `world.glb`), **everything else as JSON**
(`world.json`):

- an item is a node `item_<k>` (k its index in `world.json`'s `items`) whose mesh is the unit geometry and whose
  `EXT_mesh_gpu_instancing` carries `TRANSLATION` (the matrix translation, float32 bit for bit, so a uid recomputes from
  it), `ROTATION`, `SCALE`, `_COLOR`, and the per-instance extras as `_AN`, `_AC2`, `_AP0`, `_AP1`. `stats.trsMaxError`
  is the largest difference between a matrix and its recomposed TRS (a sheared matrix would show; the biome kits' are
  under 1e-6);
- a bucket is a node `bucket_<k>` with its mesh;
- each node's extras name its item or bucket id and its item set; a glTF material per material record (base colour,
  roughness, alpha) so the file is viewable on its own; an importer replaces them from `world.json`'s `materials`;
- `world.json` keeps every record, with `geometry`, `matrices`, `colours` and `extras` replaced by `glb: {node,
  instances, attributes}`. The side tables (`records`, `recordIndex`) stay in the JSON.

## Writing a case

```
python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790
```

loads the page headless (the shared harness's Chromium; `godot/tools/stage_hook.js` first, for the stage), waits for
`window._ready` and for the library maps to decode, calls `EXPORT.world` and `EXPORT.check` (with `KTAGS.uid`), and writes
`world.json`, `world.glb`, the library packs the textures name (`tex/`: `pack.json` and the files used) and
`meta.json`. `--json` writes one `world.json` with the meshes inline; `--sections a,b` exports some; `--sky 0` leaves the
panorama out; `--profile a,b,c` judges the statuses against a profile (below). It exits 1 when the page is not ready or
dirty, a section reported an error, a join failed, or the profile is not met.

## Profiles (ROADMAP.md section 11, item 1)

A world file could pass `EXPORT.check` with no interiors, furniture or citizens: nothing said which sections a case
must have. A **profile** is that list. `EXPORT.check(world, {profile: [...]})` takes section names, each optionally
qualified: `terrain=field` requires the part's `source` to be `field` (a `krator-field`, not sampled heights);
`interiors?` lets the section read `empty` (its contributors ran and had nothing). A required section that reads
`stub`, `none`, `error` or `skipped` (or `empty` without the `?`) is a problem and `ok` is false; `joins.profile`
counts `{required, met}`. An unknown name throws, as `register` does. Without a profile the statuses are not judged,
as before 2026-10-18. `test-export.js` has the positive case and the negatives (a stub, empty, none, skipped, sampled
terrain, an unknown name).

Each must-pass case names its profile in its `verify.py` (`EXPORT_BOX`, `EXPORT_PROFILE`) and checks it under
`--assert` through the shared `check_profile` (`tools/harness.py`: it waits for the library maps, with `inject=True`
injects core/export the way `export` does into a page that does not embed it (the Throne), injects
`44-core-stage.js` where the page lacks it, exports the box with a small sky and prints the statuses); the nightly
(`tools/test_all.py --nightly`) runs those verifies. `--profile a,b,c` on a verify replaces the list for one run: add
`sim` to any of them and the run fails on the stub, which is the proof the check bites.

| Case | Box | Profile |
|---|---|---|
| sedesert's tile (M4) | `80,490,380,790` | `registry, items, buckets, materials, textures, terrain=field, stage, atmos, water` (its build takes `89-atmos-8-export.js` since 2026-10-18, so `atmos` fills: the clock, wind, presets and skylight) |
| Iziz's district (M5) | `40,-225,280,15` (the triumphal plaza and its statues: the Godot case's box, `-120,292,120,532`, holds no registered furniture, the gap the profile catches; move the case to this box when it is re-exported) | `registry, items, buckets, materials, textures, terrain, stage, atmos, fixtures, furniture, interiors?` (its buildings are shells; its ground is sampled, ROADMAP.md section 11, item 3) |
| Yuni (`settlements/yuni/verify.py`, the world page) | `140,-80,340,90` (the Foundry, `bld_00005`: the Godot spike's yuni case, and the street before it) | `registry, fixtures, interiors` (its buildings and fixtures are the core/tags records `51-fixtures.js` makes; `interiors` is the room graph of every planned building in the box, required since 2026-10-18: an empty one fails the run; it contributes no meshes: the page's geometry is not baked into item sets, ROADMAP.md section 11, item 3) |
| the isle demo (M6; `settlements/isle-demo/PLAN.md` section 7; the city page `dist/isle-city.html`, Kautoa, since 2026-10-19) | `-700,-700,700,700` (Kautoa's ceremonial centre, in the town's frame) | **checked now:** `registry, materials, terrain` (sampled: `EXPORT.ground` on the plan's ground). **The target (`EXPORT_TARGET`, reported by every `--assert` run, `--profile target` to fail on it):** `registry, items, buckets, materials, textures, terrain=field` (the extracted heights, not `EXPORT.ground`'s samples), `city` (two `KCITY` plans, registered by core/city), `fixtures`, `interiors` (the kit's rooms), `furniture` (the catalog placements, by look), `sim` (places, actors, stocks per settlement, the canoe route and its books), `stage`, `atmos` (2 of 13 met on 2026-10-19; each joins the checked list as it lands, so the sim's export is written to it) |
| crater-drylands (2026-10-18) | `600,-1200,900,-900` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| eastabyss (2026-10-18) | `2100,-300,2400,0` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| ebadlands (2026-10-18) | `-300,0,0,300` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| ehighlands (2026-10-18) | `900,1200,1200,1500` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| geyser (2026-10-18) | `300,0,600,300` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| hyperjungle (2026-10-18) | `-600,-300,-300,0` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| nhighlands (2026-10-18) | `-1500,-1200,-1200,-900` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| nwbay (2026-10-18) | `600,600,900,900` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| nwlowlands (2026-10-18) | `-900,-1200,-600,-900` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| rift (2026-10-18) | `300,0,600,300` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| ringisles (2026-10-18) | `-300,-900,0,-600` | `registry, items, buckets, materials, textures, terrain, stage, water` (sampled terrain; atmos left out, its KNOWN_ISSUES.md) |
| shighlands (2026-10-18) | `-1800,-900,-1500,-600` | `registry, items, buckets, materials, textures, terrain, stage, atmos` (sampled terrain; water left out, its KNOWN_ISSUES.md) |
| swbay (2026-10-18) | `0,0,300,300` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| swlowlands (2026-10-18) | `600,0,900,300` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| xanadu (2026-10-18) | `-300,1800,0,2100` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; atmos, water left out, its KNOWN_ISSUES.md) |
| the Throne, station 1 (`biomes/throne/dist/throne.html`; 2026-10-18; its eleven pages check through `check_profile(..., inject=True)`: the pages do not embed core/export, below, "Not done"; the table is `EXPORT_STATIONS` in its verify.py) | `-400,40,-100,340` | `registry, items, buckets, materials, textures, terrain, stage` (sampled terrain; water left out: no page is on core/water; atmos left out of every Throne row, `biomes/throne/KNOWN_ISSUES.md`, "Export profile") |
| the Throne, the kipuka (`throne-kipuka.html`) | `-240,-700,60,-400` | `registry, items, buckets, materials, textures, terrain, stage` |
| the Throne, the spice frontier (`throne-frontier.html`) | `-560,-400,-260,-100` | `registry, items, buckets, materials, textures, terrain, stage` |
| the Throne, the geyser isle (`throne-isle.html`) | `-300,-300,0,0` | `registry, items, buckets, materials, textures, terrain, stage` |
| the Throne, the cloud forest (`throne-cloud.html`) | `-1720,570,-1420,870` | `registry, items, buckets, materials, textures, terrain, stage`; exported with `--sections` of the same (its atmos section throws: the station lists the atmos host without `89-atmos-8-export.js`) |
| the Throne, the savanna (`throne-savanna.html`) | `-1050,350,-750,650` | `registry, items, buckets, materials, textures, terrain, stage` |
| the Throne, the ash desert (`throne-ash.html`) | `-350,50,-50,350` | `registry, items, buckets, materials, textures, terrain, stage`; `--sections` the same (atmos throws, as the cloud forest's) |
| the Throne, vent country (`throne-vents.html`) | `-330,-430,-30,-130` | `registry, items, buckets, materials, textures, terrain, stage`; `--sections` the same (atmos throws) |
| the Throne, the glacier (`throne-glacier.html`) | `-1800,-600,-1500,-300` | `registry, items, buckets, materials, textures, terrain, stage`; `--sections` the same (atmos throws) |
| the Throne, the caldera rim (`throne-caldera.html`) | `0,-1500,300,-1200` | `registry, items, buckets?, materials, textures, terrain, stage`; `--sections` the same (atmos throws). No cell of its map holds a bucket: the kit's baked meshes are trees and the summit has none, so `buckets?` |
| the Throne, the lava tube (`throne-tube.html`) | `-320,-320,-20,-20` | `registry, items, buckets, materials, textures, terrain, stage` (`HEAT.render` draws the shimmer after the scene; the stage's panorama and the terrain read ok, as the caldera's) |

Every other build is preview-only until it names a profile and meets it.

## Godot

`godot/krator/world_import.gd` (`KratorWorld.build(path)`) reads the split form, reusing the spike's importers:
GLTFDocument with `krator/gltf_instancing.gd` (a world item becomes a MultiMesh packed as `krator/biome_import.gd`
packs it: colour and `aC2` in COLOR, `oct(aN)` and `aC2` in INSTANCE_CUSTOM), `KratorBiome._material` (the foliage and
bark shaders, the kits' kinds; `uv_offset` added for a library card's cell), library maps loaded from `tex/` by
reference, `KratorField` for the terrain (a mesh on the field's grid and a HeightMapShape3D), `KratorAtmos.build_from`,
and the stage through `krator/stage.gd`. Node metadata as `biomes/GODOT.md` "Records" says (`krator_record`,
`krator_records`, `krator_index`, `krator_set`; a bucket's `krator_records`, `krator_record_ids`). The spike's case
`world-sedesert` (key 9) shows it; `godot --headless --path godot --script res://tests/export/world_test.gd` is the M4 test.

## The proof (M4, 2026-10-13)

`biomes/sedesert`'s 300 m tile round the rain-shadow pond (box `80,490,380,790`), the same tile as the spike's
`sedesert` case, exported through core/export (Godot 4.7.2, headless; the page on Chromium with SwiftShader):

| | |
|---|---|
| the tile | 34 items, 7,280 instances, 3 buckets, 47,471 triangles, 35 materials, 25 textures (18 library maps by reference, 7 PNGs), 116 registry records (of 3,998 on the page): the same counts as the spike's `sedesert` case |
| files | `world.json` 7.7 MB (the stage's sky and ground look 6.8 MB of it), `world.glb` 2.8 MB, `tex/` 2.0 MB; the legacy `biome.json` of the same tile is 19.7 MB. Compaction dropped 1.31 M, 0.63 M and 0.41 M unused vertices from the three buckets. **Since the re-export of 2026-10-18 `world.glb` is 10.2 MB:** the 7.3 MB more are the baked motion tracks (biomes/GODOT.md, "Motion", 2026-10-16: the first export of this case to carry them) on the five moving items, 108 instances (swift 77, deer 5, deer head 5, deer antler 1, deer leg 20), each 1,222 frames (10 Hz over the 120 s loop plus the 2 s fade) of 12 floats, 58.7 kB an instance, in `extras.krator_motion`'s accessors; the meshes and instance arrays are byte for byte the 2.8 MB they were (same 37 nodes, 269 accessors, 47,027 vertices, 142,413 indices, 7,280 TRS rows), `world.json` grew 6 kB (the `atmos` section, filled since the build took `89-atmos-8-export.js`). Not a defect: the glb is where the track travels, and the JSON form stays small because of it |
| in the page | `EXPORT.check`: 34 of 34 sets resolve, 7,280 uids recomputed from the matrices, 0 differ; 60 of 60 bucket records resolve; 37 material and 27 texture references resolve; no section errors; TRS error 2.3e-7 |
| in Godot | every one of 7,280 MultiMesh instances carries its uid; each recomputed in GDScript from `world.glb`'s TRANSLATION: 0 mismatches (a 20 cm shift and a one-row misalignment both fail, the negatives); every instance drawn at its record's position (0 m); 60 bucket records resolve, their uids recompute; 47,471 bucket triangles in Godot; every mesh has its material and every named map its image (18 library maps from `tex/` on 15 meshes) |
| terrain | `KField.h` against the page's own `h` at 256 probes off the lattice: max 2.9e-12 m (tolerance 1e-4 m); rays onto the HeightMapShape3D at 200 lattice points: max 1.6e-4 m (tolerance 1e-2 m); between lattice points the shape's triangles and the field's bilinear cells differ by up to 0.92 m (0.45 m at the probes): the HeightMapShape3D's own triangulation, reported, not a defect of the export |

Side by side from one camera (`python3 godot/tools/compare_shots.py world-sedesert`, `godot/shots/compare/`): the
pond's outline, every tree, bush, flower and grass clump stand in the same places. Two gaps of the first pair are closed
(stage 2e, 2026-10-13): the ground's crack and detail layers (they travel as a `world-uv` material record and Godot's
ground shader multiplies them: the mud cracks round the pond read in both) and the water (the pond is a core/water
surface in the `water` section, drawn by the library's water shader with the page's colours and flat sky, unlit as the
page's is; before, Godot drew a flat dark sheet at the mean wet level). What still differs at the pond: the shoreline
follows each engine's own ground mesh (on the right Godot shows water the page does not: most likely the page's 17.8 m
ground triangles stand above the level where the field's 8.9 m lattice dips under it; not measured), Godot shows core/water's surf lap as a pale rim in the shallows (the page's own pond has none), and its ripples
are the surface's trochoids (regular bands) where the page shades four sine ripples. Elsewhere: the strata on rock, the
far scenery (the stage's panorama, taken from 40 m over the tile's centre: blurred, and the mesas outside the tile shift by
parallax seen from another eye); the light is a little flatter and warmer in Godot.

## Iziz (M5, 2026-10-13)

GODOT-PLAN.md Phase 4's "Cities": `KRATOR_EXPORT` (Yuni's) is the city template, so Iziz's records take its shape (a
building, its doors, windows and lights, its furniture slots, each a core/tags record with a stable id and tags) from
its `REGISTER`/`REG` and its placement records, and its meshes, materials, ground and stage arrive the way a biome tile's
do. The contributor is `settlements/iziz/targets/city/94-city-export.js` (by `iziz`; core/export is in the city's
`TARGET_CORE`); the records are made before the first frame by `src/91t-iziz-tags.js`, the fixtures noted while the city
builds by `src/69f-iziz-fixtures.js`.

```
python3 tools/harness.py export settlements/iziz/dist/iziz.html --out godot/data/world-iziz --box=-120,292,120,532
godot --headless --path godot --script res://tests/export/iziz_test.gd
```

(`--box=`: a box that starts with a minus sign is read as an option otherwise.)

**The city's record shape** (core/tags records; the registry section crops them to the box and their parents):

| Record | From | Shape |
|---|---|---|
| building | `REG` entries of class building (`REGISTER`, `vnReg`, the city's own `REG.push`) | `bld_<n>`; `class building`, `key` the builder (`vern_house_poor_a`, `iziz_gate`, `anc_<type>`), `name`, `at` the base centre, `tags` culture, types, wealth, state, lit; a building standing in a city placement (`OCC.list`, the lots 88 and 90b place) takes the lot's `ry` and `size` [w, d, h], else `r` and `h` |
| feature, landmark, prop | REG's farms, plazas, statues, fountains, drains | as Iziz's tags fragment always made them |
| fixture | the vernacular helpers `vnDoor`, `vnWin`, `vnLamp`, `vnLampPost` (69c), noted by 69f in the kit's own transform | a child of its building: `bld_00226.door.0`, `.window.<n>`, `.light.<n>`; `kind` door, window or light; `at` a door's sill and a window's on the outer face, a lamp's bulb; `ry` the outward normal's yaw (local +z out, as Yuni's); `size` [w, 0.2, h]; `tags` door (plank) or light (electric, arc-standard) or style (lit, glass, open, shut), `lit`, the building's culture. The fixtures section adds `host: {wall: null, side: 'outside', sill}` |
| item set | every baked kit item (`KIT.meshes`, one InstancedMesh each) | `part_<n>`, `class part`, `key 'kit:<item>'`; its instances are rows read from the instance matrices themselves, so `part_00012#37` names one and its uid recomputes from the float32 matrix the export writes |
| furniture slot | REG's furniture (`cls 'furniture'`) | the `furniture` section: `pieces [{id: '<key>/0/0', entry: {tags, size, role, key}, mesh: null}]`, `placements [{record, piece, at, ry}]`: the piece's geometry is in items and buckets, owned by the same record |

**The meshes.** `items`: each kit item and each of the vendored hyperjungle's instanced sets with an instance in the box
(origin rule), its unit geometry once, its matrices as the page holds them (float32), its instance colours; a kit item
names its set (`record`, `records`, `recordIndex`, as the biome core's) and every item carries `owners`: per instance the
registered volume it stands in (REG's x, z, r, y to y + h with 1 m slack; the smallest of several; REG's buildings, farms
and furniture, not the biome's flora and life), or null. `buckets`: the plain meshes (walls, lathes, escarpments, the moat; not the
ground, which is the terrain and the stage's look), one per material, the triangles whose centroid lies in the box, in
world space, compacted by construction; `recordIds` the volumes the centroids stand in. Not exported: ShaderMaterial
and additive meshes (the sky, the atmosphere's sprites, the glow layer), core/lod's render copies.

**The materials.** One record per material a mesh uses (a kbake clone is its source's), `kind` standard or basic (unlit),
with `colour` (linear), `roughness`, `metal`, `specular`, `emissive`, `transparent`, `opacity`, the maps by texture id,
`kmat` (the KMAT record it is, `kmat:iziz:<MAT key>`, also in the section through the KMAT adapter), `hook`, `worldUV:
{K}` and `scale`. Hooks: `world-uv` where vWorldUV tiles it (an instance: uv times the two instance-scale axes its face
spans times K, no per-instance start; a plain mesh keeps its uv: vWorldUV replaces three's uv transform, so a map's
repeat does not apply there), `breakup` where the library's break-up runs, `glass` for the glass Fresnel. A library map
is a texture by reference to Iziz's pack (`tex/pack.json`), with its repeat where no world-UV replaces it; a procedural
canvas map is a PNG.

**The ground** is `EXPORT.terrain` over the box from `terrainH` (a 2 m grid, 256 probes: Iziz bakes no core/terrain
field) and the stage's look of the painted ground on the same grid (`KSTAGE.capture`).

**Godot.** `world_import.gd` reads it with no Iziz-only path: a material of kind standard or basic is drawn by
`KratorWorld._standard` on `shaders/library.gdshader` (its colour, unlit and emission uniforms are new; their defaults
leave the Girder pack's surfaces as they were), its hooks resolved through `krator/khooks.gd`; a transparent one as a
StandardMaterial3D with alpha. Items carry `krator_owners`; a `Records` node holds `Building_<id>` per building record,
its fixtures as `Door_<id>` / `Window_<id>` / `Light_<id>` children (Marker3D, local +z out), and `Furniture_<record>`
per slot. `KData.water_sheet` no longer fails on a terrain without water.

The proof (box -120, 292 to 120, 532: 240 m inside the south gate, from the gatehouse and the outer wall to the
vernacular streets; Godot 4.7.2 headless, the page on Chromium with SwiftShader):

| | |
|---|---|
| the district | 130 items (78 kit items, 52 hyperjungle sets), 9,638 instances (2,158 of them kit instances with an item set), 33 buckets, 60,735 triangles, 220 materials (96 mesh materials, 124 KMAT records), 68 textures (57 library maps by reference, 11 PNGs), 263 registry records of the page's 3,469 (766 REG, 2,528 fixtures, 175 item sets), 139 fixtures (28 doors, 96 windows, 15 lights), 40 buildings |
| files | `world.json` 8.2 MB, `world.glb` 3.1 MB, `tex/` 11.0 MB (Iziz's pack, the families the district uses) |
| in the page | `EXPORT.check`: 78 of 78 sets resolve, 2,158 uids recomputed from the matrices, 0 differ; 49 of 49 bucket records resolve; 163 material and 164 texture references resolve; no section errors; TRS error 5.0e-7 |
| in Godot (`tests/export/iziz_test.gd`) | 9,638 MultiMesh instances; every kit instance's uid recomputed in GDScript from world.glb's TRANSLATION: 2,158 checked, 0 differ (20 cm off: 134 sampled, all change); every drawn instance at its translation (0 m, tolerance 1e-4 m); owners: 9,269 stand in a volume that resolves, 369 in none, 0 bad; 49 bucket records resolve and recompute (20 cm off changes the uid); 60,735 bucket triangles in Godot as on the page; 40 Building nodes at their records (0 m); 139 fixtures, each a child of its building, id and parent resolving (0 m off; a parent the page never made does not resolve); every mesh has its material and every map its image (57 library maps from `tex/` on 98 meshes, 11 PNGs); every hook resolves to library includes (`world-uv+breakup`, `breakup`, `world-uv`, `glass`; an unknown one is reported); 70 of 70 instanced world-UV meshes tile at 1/K m; 50 materials name their KMAT record, all in the export; the ground through its 14,400 inner grid samples to 0 m (tolerance 1e-4 m; half a step off, 280 differ) |

Side by side from one camera (`python3 godot/tools/compare_shots.py world-iziz`: the eye inside the district at (-55, 40,
375), looking at the gatehouse): the outer wall, the wedge towers, the gatehouse, the tavern, the market stalls, the lamp
posts, the house roofs and the painted streets stand in the same places with the same colours and the wall's ashlar in
both. What differs: beyond the box, the page draws the jungle and the city where Godot shows the stage's panorama
(blurred, and shifted by parallax: it is taken from 40 m over the tile's centre); the page's chimney smoke (core/atmos
sprites, additive) and its floating labels are not exported; the gate's passage reads lighter in Godot (the page's deep
shade there is its own darker interior, not matched by Godot's ambient); the light is a little flatter in Godot.

## A kit's sheet on Iziz's page: Pylon (2026-10-19)

A kit built on Iziz's page (`settlements/iziz/build.py --kit`, `settlements/iziz/API.md`) exports through the city's
contributor read in place: `kits/pylon/kit.json` lists `settlements/iziz/targets/city/94-city-export.js` and
`core/biome/44-core-stage.js` under `external` and `export` in its target's core. The contributor looks a bound material up
in Iziz's pack first, then in every other pack the page binds (the kit's own, `KMAT.pack('pylon')`); a texture names its
pack, its id `tex:iziz:<pack>:<family>:<slot>` outside Iziz's (Iziz's own ids, and its export, are unchanged: the district
above exported before and after differs only in the clock and the sky picture taken at that moment). The harness copies
each pack as `tex/<pack>.pack.json` with its files side by side, and fails when two packs name one file;
`world_import.gd` reads a texture's own pack file.

```
python3 tools/harness.py export kits/pylon/dist/pylon.html --out godot/data/world-pylon --box=-62,964,32,1000
godot --headless --path godot --script res://tests/export/iziz_test.gd -- --case=world-pylon --sheet
```

The box is the sheet's industry mixed street (the Vernacular's smithy and salvage yard beside Pylon's workshop and smelter;
the workshop furnished): 88 items (34 of the kit, 54 furniture items: 21 pieces of 22 placements), 880 instances, no
buckets (the box's only plain meshes were the furniture), 27 textures (24 of Iziz's pack, 3 of Pylon's), the interiors of
2 buildings (4 rooms, 4 links); `world.glb` 1.6 MB. `--sheet` lets atmos be empty (a sheet has no weather) and buckets
too where the case has interiors, checks that the ground is flat where the half-step negative would need relief, and
checks the interiors (below). All checks pass in Godot 4.7.2, and the nightly runs it (`tools/test_all.py`,
`GODOT_TESTS`: an entry may carry arguments).

### The sheet's interiors (2026-10-19)

Until 2026-10-19 the furnished rooms arrived as world-space buckets of the catalog's furniture (the batch 95i flushes:
one merged mesh per render family). They are now the interiors section and pieces of the furniture section, filled by
the same contributor (`94-city-export.js`) from what `settlements/iziz/src/95i-iziz-interiors.js` keeps: `IZIX.jobs` (per
furnished building its record and the interiors kit's instantiated plans, in the world frame) and `IZIX.placed` (per
piece its `ixf` record and the batch's arguments: key, variant, seed, wealth, span, pose, room, building). On a page
without interiors (Iziz's city) nothing changes: the district above, exported before and after, differs only in the
clock and the sky picture, and its `world.glb` is byte-identical.

- **interiors** (Yuni's contract, building-local under the building record: its `at`, turned by `ry`): one building
  per furnished building with a piece in the box or its record's `at` in it; `storeys` from the plans' levels with their
  rooms (95i's, with the windows the builder drew), `links` for every planned door (an exterior door `b: 'outside'`,
  `fixture` the 69f door record within 1 m; `from` 0.45 m inside its room, `to` past the wall on the yard, at the
  building's base) and every stair or ladder (`from` its foot, `to` its top), `walls` (exterior and partition, `col`),
  `yard` the plot. `units` names the 95i jobs.
- **furniture**: each placement in the box (by its origin) as `{record, piece, at, ry, room, building}`, its piece
  `<key>/<variant>/<look>` once per look. The look is found, not reduced: each placement is built again alone at its
  heading and turned back into the piece's frame (the catalog's frame adds `ry` to a tilted part's Euler angles, so a
  turned build is not the ry 0 build turned: up to 0.69 m apart on the sheet's paintings), and placements whose meshes
  match (names, materials, index, every value within 1e-4) share it. A piece names its `items` (one per render family and
  painted panel, unit geometry with vertex colours, an instance per placement in the order of the item's `placements`,
  the material the scene's merged mesh of that family has), `entry` (catalog tags, size, type, anchor) and `lights`
  (`KratorFurniture.lightsOf`, in its frame). The merged meshes are then left out of the buckets.

In the page (the whole sheet, box -100, -50 to 100, 1100, checked on Chromium with SwiftShader): every one of the 910
placements' instances (864,772 vertices) lies within 1.2e-4 m of the piece built at its pose (float32 at z 1,000), the
drawn furniture triangles equal the page's (545,026), and `EXPORT.check` resolves every join (29 buildings, 117 rooms,
173 door refs). Against the buckets route on that box: `world.glb` 42.9 MB to 27.8 MB, bucket triangles 600,585 to
55,559, the furniture's stored triangles 545,026 to 332,190 (361 pieces for 910 placements: the pieces whose seed changes
what they carry, shelves, bookcases, sacks, vats, stay one look each), but 1,067 glb nodes for 147 (a MultiMesh per
piece look and family: GODOT-PLAN.md's per-look scheme with K looks per variant would need 95i to place with K seeds, so
that the page and the export agree; not done).

In Godot (`iziz_test.gd -- --case=world-pylon --sheet`, section 6): every building of the section is a building record
with its `Interior_<id>` under its Building node and its rooms drawn there; every room's door ref resolves to a link or a
fixture, every link ends in its rooms (or outside) and an exterior door's fixture is its building's; every furnished
placement resolves to its record (class furniture, its building the parent, its room tag), its room in the section and
its piece with items, and every piece instance stands at its placement's pose (54 instances, 2e-7). Negatives: a
placement moved to another building's room, an unknown piece, an unknown record and a pose 20 cm off do not resolve.

### Talia (2026-10-19)

The same route: `kits/talia/kit.json` lists the contributor and the stage under `external` and `export` in its core.

```
python3 tools/harness.py export kits/talia/dist/talia.html --out godot/data/world-talia --box=-40,1064,16,1086
godot --headless --path godot --script res://tests/export/iziz_test.gd -- --case=world-talia --sheet
godot --path godot --script res://tests/export/court_shot.gd -- --case=world-talia --view=living --out=/abs/shot.png
```

The box is the rich mixed street's west half: Talia's palazzo and the Vernacular rich house between them, both furnished,
chosen so the case holds the Iziz court furniture with its textures (95i): 280 items, 2,216 instances, no buckets, 62
textures, 33 fixtures, the interiors of 2 buildings (14 rooms) and 127 furniture placements as 80 pieces; `world.glb`
3.5 MB. The court overlays (paintings, gilt frames, vase glazes, book spines, carpets) are parts of their pieces
(`furniture:court/<set>`, 95i `courtParts`), so a piece carries its picture; the court finishes (marquetry, brocade,
opus sectile; gold leaf and velvet as detail) are materials with hook `triplanar` and a `triplanar` field {tile, detail,
gain}, which `world_import.gd` hands to `library.gdshader` (`lib/triplanar.gdshaderinc`): projected in the piece's own
frame where the page projects in the world. All checks pass in Godot 4.7.2, the court finishes' check among them (the
test also logs `get_meta` lookups for 'krator' on nodes that carry none, which do not fail it); `court_shot.gd` renders a
piece of the case with the walls hidden, for a picture beside the page. The nightly runs the test. Until 2026-10-19 the box
was the middle mixed street (-35,868,13,886), which has no Iziz court pieces.

## The scene reader, and the isle demo (P8, 2026-10-20)

**The scene reader** (`10-core-export-scene.js`, `EXPORT.sceneReader(o)`) is the half of Iziz's contributor that reads any
page's three.js scene: the materials and textures (library maps by reference, procedural canvases as PNGs), every
InstancedMesh as an item (the unit geometry once, the box's instances, a uid per instance where the item names a core/tags
item set, an owner per instance), the plain meshes as buckets (one per material, triangles by centroid, the records they
stand in). A page passes its own lookups (`name`, `scene`, `matKeys`, `kitOf`, `library`, `kmat`, `hooks`, `itemKit`,
`itemMat`, `itemSet`, `tags`, `owner`, `ownerOf`, `skipInstanced`, `skipMesh`) and `more(ctx, C, own, out)` for its own items
before the buckets. Iziz's `94-city-export.js` now calls it: the same box exported from the page before and after the lift
is identical but for the clock-dependent sky panorama and atmosphere clock (world.glb byte for byte; items, buckets,
materials, textures, fixtures and furniture equal). It loads with core/export where a build takes it (Iziz's city through
`TARGET_CORE`, the isle demo's `CITY_EXPORT`); the biomes do not need it.

**The isle demo: Kautoa's ceremonial centre** (`settlements/isle-demo/src/62-isle-export-scene.js` for the meshes, `50` for
the sim):

```
python3 tools/harness.py export settlements/isle-demo/dist/isle-city.html --query "?town=Kautoa&simAt=362" --out godot/data/world-isle-kautoa --box=320,780,820,1220
godot --headless --path godot --script res://tests/export/isle_test.gd
```

`?simAt=362` runs the sim to 06:02 first, people on their way to work. Before it reads, the page draws its near set over
the whole box (every lot in full) and puts it back after; a kit piece's instance is owned by its lot's record (exactly,
not by volume), the footings, compound walls and streets by the record whose footprint holds them. The sim section
carries the motion of the 774 people who live or work in the box (`SIM.exportMotion`, in world metres, with the town's
frame to subtract). 359 items (1,535 instances), the streets (one bucket), 56 materials, 22 textures, 89 records;
world.json 6.9 MB, world.glb 37.1 MB (the Islanders' pieces are detailed). In Godot 4.7.2 every check passes: every
instance where world.glb says, every kit piece owned by its lot's record at the piece, every record's uid recomputed,
every sim place in the box joined to its record, 4,644 pose rows of 774 people (425 moving) replayed by `KSim.pose` with
none differing, the citizens drawn as stand-ins, the canoes placed from the routes; each with a negative. Stage, fixtures,
interiors and furniture are not filled yet.
