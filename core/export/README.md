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
`interiors` (below, "Iziz"); since 2026-10-18 Yuni fills `fixtures` and answers `interiors` (below, "Yuni"); for every
other build they are still stubs:

- **`fixtures`**: doors, windows, lights and signs as core/tags records, each with its placement on its host wall
  (Yuni's `KRATOR_EXPORT.fixtures` shape): `{format: 'krator-fixtures', records: [{id, uid, class: 'fixture', kind,
  parent, at, ry, size, tags, host: {wall, side, sill}}]}`. Filled by Iziz (M5) and by Yuni
  (`settlements/yuni/src/77-export.js`: the records `51-fixtures.js` makes, with `host.wall` the shell wall of the
  interior plan that holds the opening, where the building has a plan).
- **`interiors`**: the room graph (`kits/interiors` `ROOM()`): `{format: 'krator-interiors', buildings: [{id (the
  building's record), storeys: [{y, rooms: [{id, kind, poly, h, doors}]}], links: [{a, b, kind: 'door' | 'stair' |
  'ladder', at}], walls: [{a, b, h, col: true}]}]}`.
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
`--assert` through the shared `check_profile` (`tools/harness.py`: it waits for the library maps, injects
`44-core-stage.js` where the page lacks it, exports the box with a small sky and prints the statuses); the nightly
(`tools/test_all.py --nightly`) runs those verifies. `--profile a,b,c` on a verify replaces the list for one run: add
`sim` to any of them and the run fails on the stub, which is the proof the check bites.

| Case | Box | Profile |
|---|---|---|
| sedesert's tile (M4) | `80,490,380,790` | `registry, items, buckets, materials, textures, terrain=field, stage, atmos, water` (its build takes `89-atmos-8-export.js` since 2026-10-18, so `atmos` fills: the clock, wind, presets and skylight) |
| Iziz's district (M5) | `40,-225,280,15` (the triumphal plaza and its statues: the Godot case's box, `-120,292,120,532`, holds no registered furniture, the gap the profile catches; move the case to this box when it is re-exported) | `registry, items, buckets, materials, textures, terrain, stage, atmos, fixtures, furniture, interiors?` (its buildings are shells; its ground is sampled, ROADMAP.md section 11, item 3) |
| Yuni (`settlements/yuni/verify.py`, the world page) | `140,-80,340,90` (the Foundry, `bld_00005`: the Godot spike's yuni case, and the street before it) | `registry, fixtures, interiors?` (its buildings and fixtures are the core/tags records `51-fixtures.js` makes; its rooms go out building-local through `KRATOR_EXPORT.building` until they take the kits/interiors shape, so `interiors` reads empty; it contributes no meshes: the page's geometry is not baked into item sets, ROADMAP.md section 11, item 3) |
| the isle demo (M6; `settlements/isle-demo/PLAN.md` section 7) | not yet registered: the page is not built | `registry, items, buckets, materials, textures, terrain=field` (the extracted heights, not `EXPORT.ground`'s samples), `city` (two `KCITY` plans, registered by core/city), `fixtures`, `interiors` (the kit's rooms), `furniture` (the catalog placements, by look), `sim` (places, actors, stocks per settlement, the canoe route and its books), `stage`, `atmos`; its verify names it when P6b lands, before P7, so the sim's export is written to it |

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
| files | `world.json` 7.7 MB (the stage's sky and ground look 6.8 MB of it), `world.glb` 2.8 MB, `tex/` 2.0 MB; the legacy `biome.json` of the same tile is 19.7 MB. Compaction dropped 1.31 M, 0.63 M and 0.41 M unused vertices from the three buckets |
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

## Yuni (2026-10-18)

Yuni was the template (`KRATOR_EXPORT`, `settlements/yuni/GAME_EXPORT.md`) and kept its own route: the Godot spike's
`yuni` case reads `KRATOR_EXPORT.fixtures()`, `.tags()` and `.building('bld_00005')` directly
(`godot/tools/export_spike.py`). Since 2026-10-18 it is a contributor as well: `settlements/yuni/src/77-export.js`
registers `fixtures` (by `yuni`) and answers `interiors` empty, and its `build.py` lists core/export with its other
core modules. Both routes read the same registries (`FIX`, `KTAGS.page`), so a door has the same id and uid in
`fixtures.json`, `tags.json` and a `world.json`. A fixture record is the registry's, plus `host`: `wall` the id of the
shell wall of the building's interior plan whose opening holds it (null for a light or a building without a plan),
`side` `outside` (`court` for a door to the building's own yard, `street` for a street light), `sill` above the
building's base. Its buildings are registry records already, so the registry adapter keeps every parent.

```
python3 tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90 --profile registry,fixtures,interiors?
godot --headless --path godot -- --check --case=world-yuni
```

No meshes come through this route (Yuni's geometry is drawn by its kit, not baked into item sets), so the case is
records only: `Records/Building_<id>` nodes with their fixtures as children, no `Items`, no terrain. `verify.py
--assert` checks the profile (`registry, fixtures, interiors?`) over that box; `--profile registry,fixtures,sim` fails
on the stub.

## Report

`python3 tools/export_report.py [case ...] [--json] [--compare old.json]` prints one row per case under `godot/data`
that holds a `world.json` and a `world.glb` (ROADMAP.md section 11, the cross-case size report; it extends the idea of
`tools/geometry_report.py`, which counts a page's draw calls in Chromium, to the exported files). Pure Python: `json`
over `world.json` and `struct` over the glb's header and JSON chunk (accessor counts give vertices and triangles,
`EXT_mesh_gpu_instancing`'s TRANSLATION count gives instances); no Chromium, no Godot, no 3D library. Columns: bytes of
`world.json`, `world.glb` and `tex/` (an LFS pointer counts as the file it names); sections by status (`ok empty stub
none`); item sets and instances; buckets and bucket triangles (`itris`: the items' triangles, unit triangles times
instances); `mats` and `texs` (records in the lists) beside `usedm` and `usedt` (those a node or a material names);
`draws`, the draw-call proxy (item sets + buckets, one MultiMesh or mesh node each in Godot); the terrain source.
`--json` writes `godot/data/export-report.json` (committed: it is the baseline); `--compare` prints each column's delta
against such a file. `tools/test_all.py --nightly` runs it with `--compare` as a report that never fails the run.

Reconciled with the tables above (the files in `godot/data` of 2026-10-13):

| | M4 sedesert | M5 Iziz |
|---|---|---|
| instances | 7,280, as the table | 9,638, as the table |
| items, buckets, bucket triangles | 34, 3, 47,471, as the table | 130, 33, 60,735, as the table |
| bucket records | **60** (the table is right; 60 is sedesert's figure) | **49** (the Iziz table says 49 of 49; the 60 in the Iziz row of a summary is the 60,735 triangles, not records) |
| materials | **36** records (the M4 row says 35: it was written before stage 2e added the ground's `world-uv` record, `stats.materials` and the file count 36); 28 are named by a node | 220, as the table |
| textures | **27** listed: 20 library maps and 7 PNGs (the M4 row's 25 = 18 + 7 was the first export; the ground layers' two library maps of stage 2e, `world-sedesert` re-exported in cd29d616, make 27, as the references line says); 25 are named by a material | 68, as the table (57 library + 11 PNGs); all named |
| files | json 7.9 MB (the table says 7.7 MB, before the ground records), glb 2.8 MB, tex 2.0 MB | 8.2 MB, 3.1 MB, 11.0 MB, as the table |
| draw-call proxy | 37 | 163 (the glb's node count) |

Where a figure here differs from the report, the report is right: it reads the files the Godot tests import.

## Not done

- `sim` and `city` are contracts only; `furniture` is filled by Iziz alone; `fixtures` by Iziz and Yuni; `interiors`
  is answered empty by both (Iziz's buildings are shells; Yuni's rooms are in its own shape, below, "Yuni").
- The biome kits and Iziz contribute meshes; Girder's region still goes through `godot/tools/export_spike.py`'s glTF
  route (its merged furniture batches name no record); M6 is the isle demo (`ROADMAP.md` section 11), Voth after it.
- The registry, atmos and KMAT adapters live here until their modules are rebuilt to carry them (no branch owns those
  modules since 2026-10-18).
- Profiles are built (above, "Profiles"; 2026-10-18) and named by sedesert and Iziz; the isle demo's is listed there
  and lands with its verify.
- The Throne and its ten stations, Verge, little-demo and the settlements that read core/biome in place do not list
  core/export; the harness injects it for an export.
- No PNG or EXR height export, no carver floors (core/terrain's own "not yet"). The `water` section carries a page's
  water only where the page names it to core/water (sedesert's pond, river, cataract and plunge pool since 2026-10-13, and
  every core/water taker); the other biome hosts' water is still only the grid's `water` and the field's named surfaces.
- Only sedesert describes its ground layers; the other biome hosts that draw the same layers (swbay, nwlowlands,
  eastabyss and the rest of `hostGroundLib`'s users) each need one `EXPORT.groundLayers` call. The strata the hosts paint
  on rock (`35-core-strata.js`) and the cave's occlusion are not described.
- Fauna stand still in Godot (`anim`, `anim-phase`: the spike's gap, unchanged).
