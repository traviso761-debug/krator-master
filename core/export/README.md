# core/export: one container, `krator-world`

GODOT-PLAN.md Phase 4 ("one exporter"), ROADMAP.md stage 2d. Every module that places or describes something gives its
part to one plain-data object, per build or per tile; the harness writes it headless into `godot/data/<case>/`, and
`godot/krator/world_import.gd` builds the tile from it. Proof milestone M4 (a biome tile opens in Godot from
`core/export` with its materials, tags and terrain) is met by `biomes/sedesert` (below, "The proof").

| Fragment | Tag | What |
|---|---|---|
| `07-core-export.js` | [G data] | `EXPORT`: `register`, `world`, `check`, `glb`, `compact`, `terrain`, `pack`/`unpack`; the section list, the convention, the stubs' contracts. No THREE, no DOM: it runs in node |
| `09-core-export-adapters.js` | [G data] | the parts of modules that do not register themselves yet: `registry` (core/tags), `atmos` (core/atmos), `materials` (core/materials/record's adapter tables), and `EXPORT.ground(...)` for a build whose ground no module exports |
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
EXPORT.check(world, {uid?})          -> {ok, problems, joins}: every reference resolves (below); uid(cls, key, [x,y,z])
                                        recomputes each instance's uid from its matrix
EXPORT.glb(world)                    -> {json, glb: Uint8Array, stats}: the meshes as binary glTF, the rest as JSON
EXPORT.terrain(box, {h, water?, field?, step?, probes?}) -> a terrain section from a build's ground
EXPORT.compact({name: [array, itemSize]}, index) -> the vertices the index uses, renumbered
EXPORT.pack(typed) / EXPORT.unpack({type, n, b64})
```

`ctx` = `{box, opt, build, out, inBox(x, z), memo(key, f)}`. Sections fill in `EXPORT.SECTIONS` order (items, buckets,
materials, textures, registry, terrain, stage, atmos, fixtures, interiors, furniture, sim, city), so a later one reads
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
  registry, terrain, stage, atmos, fixtures, interiors, furniture, sim, city,   one contributor each, or null
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

### The sections

| Section | Filled by | Shape |
|---|---|---|
| `items` | the biome core | `BIO.export`'s item (`biomes/GODOT.md`) plus `id` (`<kit>/<name>`, `@<chunk>` for a LOD chunk, `~<n>` on a repeat): `name, kit, label, material, lod, count, dynamic, geometry, matrices, colours, extras`, and with core/tags `record` (the item set), `recordClass`, `recordKey`, `records` (a uid per instance, aligned with the matrices), `recordIndex` |
| `buckets` | the biome core | `BIO.export`'s bucket plus `id`; a tile's `geometry` keeps only the vertices its triangles use (`compacted: {vertices, dropped}`; ROADMAP.md finding 10); `records`, `recordIds`, `pieces` |
| `materials` | the biome core, the KMAT adapter | one vocabulary: core/materials/record's fields (`family, colour, map, normalMap, roughnessMap, roughness, metal, specular, emissive, doubleSided, alphaTest, scale, tint, hook, lib`) beside the source's own (a biome material's `kind, key, type, options, sway, hooked, vertexColours, transparent`). The adapter's records are `kmat:<build>:<name>`, maps by library reference |
| `textures` | the biome core | `{id, from, wrap, repeat, offset, flipY, size}`; `from: 'png'` with `png` (a data URL: canvases, DataTextures), `'library'` with `lib, pack, family, slot`: a library map **by reference** (the build's `tex/pack.json` names the file; the harness copies the pack beside the case), `'none'` with `error` |
| `registry` | the core/tags adapter | `KTAGS.page.export()` (`krator-tags`); in a tile, cropped to the records an item or bucket names, the records whose `at` lies in the box (not item sets), and their parents (`cropped: {from, kept, rule}`) |
| `terrain` | the biome core, or `EXPORT.ground` | `{format: 'krator-terrain', source: 'field' \| 'sampled', box, field, grid, probes}`: `field` the build's KFIELD (`krator-field`, core/terrain) cropped to the box on its own lattice; `grid` the page's `h` and water on a 2 m grid over the box (the stand-in where there is no field; the stage's ground look lies on it); `probes` `h` at 16 x 16 points off the lattice, which a port compares its own sampling against. Without a box: the field whole, no grid |
| `stage` | the biome core's host (43) | `KSTAGE.capture` over the tile (`biomes/GODOT.md`, "The stage"): renderer, lights, fog, environment, the sky panorama from 40 m over the tile's centre, the ground's look on the terrain grid |
| `atmos` | the core/atmos adapter | `ATMOS.export({stage: false})` as it is (`krator-atmos`, `core/atmos/GODOT.md`; its colours are sRGB) |

What joins by id (`EXPORT.check`): an item's and a bucket's `material` to `materials`; a material's `map`,
`normalMap`, `roughnessMap` to `textures`; an item's `record` to an item set in `registry` with the same class and key,
`records` and `recordIndex` as long as `count` (and, given `uid`, each uid recomputed from its matrix); a bucket's
`recordIds` to registry records whose uid is the bucket's; every registry record's parent to the registry.

### Stubs: the written contracts

No module fills these yet. A contributor that does meets this shape (`EXPORT.CONTRACTS`):

- **`fixtures`**: doors, windows, lights and signs as core/tags records, each with its placement on its host wall
  (Yuni's `KRATOR_EXPORT.fixtures` shape): `{format: 'krator-fixtures', records: [{id, uid, class: 'fixture', kind,
  parent, at, ry, size, tags, host: {wall, side, sill}}]}`. First taker: Yuni, then Iziz for M5.
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
- **`city`**: **owned by the Voth branch** (`core/city`, `settlements/streetlab`); this branch leaves only the
  registration point. Expected: `{format: 'krator-city', plan (streets, blocks, lots as plain records keyed by stable
  ids), edits (krator-edits/1 deltas by id)}`; its buildings and doors join the registry by id. `core/city` registers
  with `EXPORT.register('city', fn, {by: 'city'})` when that branch pauses.

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
panorama out. It exits 1 when the page is not ready or dirty, a section reported an error, or a join failed.

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
pond's outline, every tree, bush, flower and grass clump stand in the same places. What differs: the water (the page's
lit, rippled water is the host's, not in any section: Godot draws `KData.water_sheet`'s flat dark sheet at the mean
level; `core/water` phases 2 to 4 export it); the ground (the page multiplies the library's crack and detail layers over
its painted ground in a host hook; the stage carries the painted map only, so Godot's ground is smooth); the far
scenery (the stage's panorama, taken from 40 m over the tile's centre: blurred, and the mesas outside the tile shift by
parallax seen from another eye); the light is a little flatter and warmer in Godot.

## Not done

- The `fixtures`, `interiors`, `furniture`, `sim` and `city` sections are contracts only (above).
- Only the biome kits contribute meshes. Girder's and Iziz's regions still go through `godot/tools/export_spike.py`'s
  glTF route; M5 (Iziz) is the next contributor: its `REGISTER` and the `KRATOR_EXPORT` record shape.
- The registry, atmos and KMAT adapters live here until their modules can be rebuilt with the Voth branch's agreement.
- The Throne and its ten stations, Verge, little-demo and the settlements that read core/biome in place do not list
  core/export; the harness injects it for an export.
- No PNG or EXR height export, no carver floors (core/terrain's own "not yet"); the water surfaces travel only as the
  grid's `water` and the field's named surfaces.
- Fauna stand still in Godot (`anim`, `anim-phase`: the spike's gap, unchanged).
