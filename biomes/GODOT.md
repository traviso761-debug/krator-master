# Biome kits in Godot 4: the contract (scaffolding)

The open world runs in Godot (`WORLD.md`). The port comes later; this file and
`BIO.export()` (`core/biome/42-core-export.js`) are the scaffolding: what a kit places can
already be written out as data in the shape a Godot importer will read, so nothing built
now has to be torn up for the port. It follows the conventions of
`settlements/yuni/GAME_EXPORT.md` and `core/atmos/GODOT.md`.

The repo-wide plan is `GODOT-PLAN.md`; this file is its authority for flora. Its tags for the
core are in `core/PORT.md`, the kits' in each `biomes/<kit>/PORT.md`. What it changes for the
biomes is in `WORLD.md` ("Against the port plan") and the items are in `TODO.md` ("Biomes: the
port plan's findings").

The rule that makes a port possible is the atmosphere's: keep **what** a plant is (data)
apart from **how** three.js draws it (shader hooks).

## Getting the data out

Since 2026-10-13 the port reads a tile through core/export's one container (`krator-world`, `core/export/README.md`):
`python3 tools/harness.py export <page> --out godot/data/<case>/ --box x0,z0,x1,z1`. `BIO.export` below is unchanged and
still what the spike's `biome` cases read.

In a kit's page, after it has built (the probe's `window._ready`):

```js
BIO.export()                                   // the whole build, one object
BIO.export({box:[x0,z0,x1,z1]})                // one tile: instances whose origin lies in it, and whole bucket pieces whose
                                               // foot does (opt.cut:'triangle' clips by triangle centroid instead)
BIO.export({kit:'rift', textures:false})       // one kit's meshes; leave the PNGs out
BIO.download('rift-tile-0-0', {box:[0,0,500,500]})   // saves rift-tile-0-0.biome.json
```

It reads the baked meshes, so it costs nothing until it is called. A whole build is large
(rift: ~600k instances); export tiles.

## Coordinates

Metres, +Y up, x east, z south, right-handed: glTF's convention and Godot's. Matrices are
4x4, column-major (three's and glTF's order); Godot's `Transform3D` is the first three
columns as the basis and the fourth as the origin. Godot's forward is -Z; a plant has no
forward, a fauna body is modelled with +X forward and +Y up (`35-core-anim.js`).

**Texture rows.** Each PNG is the image as stored. A canvas texture has `flipY:true` (three uploads it flipped:
the image's top row sits at v=1), a DataTexture (the kits' leaf atlases) has `flipY:false` (row 0 at v=0). Godot puts
the image's top row at v=0, so an importer flips v (`1 - v`) only for `flipY:true`. Before 2026-10-05 the export wrote
no image for a DataTexture at all (the spike found it: hyperjungle's leaf cards came out solid).

Colours are **linear** (the core converts every designer's sRGB hex once, at `BIO.put` and
at every bucket write). In a Godot shader read `COLOR` and the custom data as they are; do
not mark them `source_color`. Texture PNGs are sRGB images: declare their samplers
`source_color`. **Material colours are linear too**: `colour` is three's working value written as hex (the pages
render with `outputEncoding = sRGB`, so three treats `material.color` as linear). Read it with `Color.html()` and do
not convert it. `convention.colours` says this per table (since 2026-10-05).

## The object

| Key | What |
|---|---|
| `format`, `version` | `'krator-biome'`, 1 |
| `convention` | units, up, axes, handedness, matrix order, colour space (above) |
| `core`, `kits` | the core's version, the kits resident in the page (`BIO.kit`) |
| `box` | the tile, or null |
| `ground` | with a box: the ground under the tile, `{x0, z0, step, nx, nz, heights, water}` (typed arrays; row j is z0 + j*step). The host's `terrainH` and `waterH` sampled on a grid (`opt.ground`: the step, 2 m by default; `false` leaves it out). A stand-in for the `core/terrain` bake (since 2026-10-05). When the host binds a baked field (`BIO.init({field})`, `core/terrain/30-core-field.js`; biomes/sedesert since 2026-10-08) the block also carries `field`: the `krator-field` export cropped to the box on the field's own lattice, the real heightmap the page reads; `godot/krator/field_import.gd` builds the terrain mesh and a HeightMapShape3D from it (`opt.field: false` leaves it out) |
| `stage` | with a box: the page's look (`core/biome/44-core-stage.js`, "The stage" below); `opt.stage: false` leaves it out, `opt.sky` sets the panorama's width (1024) |
| `items` | one record per instanced mesh (below) |
| `buckets` | one record per merged mesh (below) |
| `materials` | one record per material (below) |
| `textures` | one record per texture: `id`, `wrap`, `repeat`, `flipY`, `size`, `png` (a data URL, encoded by the host's `BIO.texPNG`), or `error` saying why there is no image |
| `stats` | counts: items, instances, buckets, triangles; with core/tags, `records` (items and instances that carry ids, buckets that name records) |
| `tags` | with core/tags: `{build, format}`, the page's registry (`KTAGS.page`), which `godot/tools/export_spike.py` writes beside the export as `tags.json` |

Typed arrays are `{type, n, b64}`: the array's bytes, base64. `Float32Array`,
`Uint16Array` and `Uint32Array` occur.

**Item**: `name` (the item's name in its kit), `kit`, `label` (what the inspector shows),
`material` (a material id), `lod`, `count`, `dynamic` (fauna that a script moves every
frame), `geometry` (the unit mesh once: `position`, `normal`, `uv`, `color` if any,
`index` if any), `matrices` (16 floats an instance), `colours` (3 an instance), `extras`
(per-instance attributes: `aN` the foliage normal, 3; `aC2` the second colour, 3; `aP0`,
`aP1` a fauna path, 4 each). With core/tags: `record`, `recordClass`, `recordKey`, `records`, `recordIndex` (below).

**Bucket**: `name` (the family), `kit`, `label`, `material`, `lod`, `triangles`,
`geometry` (indexed `position`, `normal`, `uv`, `color`; a tile keeps the whole vertex list
and only the triangles inside it, so an importer drops unused vertices). With core/tags: `records`, `recordIds`,
`pieces` (below).

## Records (core/tags, 2026-10-12)

Every biome page registers what it places in core/tags (`core/tags/README.md`, "Item sets"; the host passes
`BIO.init({tags: '<build>'})`, and `build.py` lists core/rand and core/tags in `CORE_TAGS`):

- **An item is one record, an item set**: class `flora`, `life` (an anim material, a path in `aP0`, an item put by a
  fauna pass, a kit's `FAUNA` key, every `BIO.dynamic` mesh) or `feature` (kind `rock`: `BIO.MINERAL`, the boulders,
  stones, hoodoos, beads, mounds and chimneys); key the item's name; kind its species', plant's or animal's key
  (`speciesOfItem`, `plantOfItem`, `FAUNA`) or the item's name; tags the biome (the kit), the kit's `TAGS` and the
  species', plant's or animal's own (harvest, Köppen, diet). `BIO.def(name, geo, mat, {cls, kind, tags})` overrides.
- **Its instances are not copied**: instance `i` (in put order, over every bake) is `<set id>#i`, at the position in
  its matrix, with the uid `KTAGS.uid(class, key, position)`, the position as the float32 the matrix holds.
- **A registered volume** (`BIO.register`, or the host's `REGISTER`, which calls `BIO.record`: a tree, a stand, a log,
  a herd) is a plain record: `flora` for kind `tree`, `stand`, `log` or a kit species' key, `life` for kind `fauna`
  or a `FAUNA` key, else `feature` (a spring, a thermal, the map's own volume); `r` and `h` its cylinder.

In the export:

- **An item** carries `record` (its set's id), `recordClass` and `recordKey` (enough to recompute a uid without
  `tags.json`), and a side table aligned with `matrices`: `records`, each instance's uid (8 hex digits), and
  `recordIndex` (Uint32Array), its index in the set, so its id is `record + '#' + recordIndex[j]`. A tile keeps the
  rows of the instances it keeps.
- **A bucket** carries `records` (uids) and `recordIds`: the volumes its pieces belong to, once each (a piece, a
  connected run of triangles, belongs to the smallest flora or life volume whose disc holds its foot and whose height
  span, 3 m under to 5 m over, holds the foot's height), and `pieces: {n, unowned}` (pieces in no volume: boulders
  and ground cover merged into buckets, logs no kit registers).
- `opt.records: false` leaves the ids out. A page without core/tags exports as before.

Godot (`godot/krator/biome_import.gd`): a MultiMesh's metadata `krator_record` (the set id), `krator_records`
(PackedStringArray, by instance index), `krator_index` (PackedInt32Array) and `krator_set` (the set's record from
`tags.json`); a bucket's `krator_records`, `krator_record_ids` and `krator_pieces`. `godot/tests/tags/records_test.gd`
recomputes every uid of the hyperjungle case in GDScript (`core/tags/ktags.gd`).

Every biome page on 2026-10-12 (`KTAGS.page.audit()` after the build; a set holds an item's instances, a volume is a
registered tree, log, stand, herd or feature):

| Page | Sets | Instances | flora | life | feature | Volumes | Unknown tags |
|---|---|---|---|---|---|---|---|
| crater-drylands | 38 | 1,260,261 | 1,244,601 | 0 | 15,660 | 30,227 | 0 |
| eastabyss | 50 | 864,901 | 861,541 | 1,378 | 1,982 | 3,895 | 0 |
| ebadlands | 42 | 243,041 | 222,291 | 0 | 20,750 | 220 | 0 |
| ehighlands | 22 | 663,231 | 640,624 | 0 | 22,607 | 20,056 | 0 |
| geyser | 45 | 376,169 | 371,072 | 2,238 | 2,859 | 2,106 | 0 |
| hyperjungle | 28 | 320,125 | 313,864 | 5,358 | 903 | 225 | 0 |
| nhighlands | 43 | 2,030,582 | 2,014,904 | 0 | 15,678 | 14,095 | 0 |
| nwbay | 206 | 703,071 | 698,646 | 0 | 4,425 | 4,453 | 0 |
| nwlowlands | 42 | 668,792 | 666,311 | 0 | 2,481 | 3,042 | 0 |
| rift | 50 | 1,698,732 | 1,690,462 | 0 | 8,270 | 15,933 | 0 |
| sedesert | 43 | 545,951 | 512,116 | 2,458 | 31,377 | 3,955 | 0 |
| shighlands | 38 | 404,388 | 390,126 | 0 | 14,262 | 27,252 | 0 |
| swbay | 31 | 539,065 | 536,356 | 0 | 2,709 | 2,762 | 0 |
| swlowlands | 39 | 855,168 | 853,107 | 0 | 2,061 | 3,451 | 0 |
| throne-ash | 118 | 278,494 | 278,494 | 0 | 0 | 9,586 | 0 |
| throne-caldera | 6 | 48,997 | 48,841 | 0 | 156 | 12 | 0 |
| throne-cloud | 56 | 1,713,138 | 1,712,571 | 0 | 567 | 20,685 | 0 |
| throne-frontier | 69 | 442,596 | 436,341 | 3,456 | 2,799 | 9,710 | 0 |
| throne-glacier | 31 | 151,279 | 151,276 | 0 | 3 | 3,378 | 0 |
| throne-isle | 87 | 1,226,672 | 1,226,466 | 0 | 206 | 29,361 | 0 |
| throne-kipuka | 81 | 724,749 | 719,002 | 1,778 | 3,969 | 10,352 | 0 |
| throne-savanna | 58 | 786,294 | 763,674 | 0 | 22,620 | 9,769 | 0 |
| throne-tube | 77 | 12,339 | 11,448 | 0 | 891 | 19 | 0 |
| throne-vents | 152 | 288,087 | 285,004 | 0 | 3,083 | 7,022 | 0 |
| throne | 168 | 532,192 | 512,868 | 0 | 19,324 | 8,978 | 0 |
| xanadu | 52 | 1,415,450 | 1,408,131 | 0 | 7,319 | 10,863 | 0 |

Every instance the core bakes is in a set (the sets' counts equal `BIO.bake`'s, plus `BIO.dynamic` fauna). Not
registered: what a page draws outside `BIO.put` and `BIO.dynamic`: ebadlands' variant-library trees
(`86-host-variants.js`, 13,953 instances: host-drawn InstancedMeshes), and the swbay and nwbay fauna, which build their
own InstancedMeshes (`75-biome-*-fauna.js`); moving them onto `BIO.dynamic` would register them.

**The cost** (2026-10-12, measured on the cloud container under a load average of 20 to 50, so wall times are noisy):
nothing per instance until bake; then 4 bytes per instance only where LOD splits an item over several meshes (the index
table: rift 6.8 MB of its 491 MB of buffers, hyperjungle none), and about 340 bytes of heap per registered volume (rift:
+5.3 MB for 15,933 volumes, hyperjungle +0.2 MB). CPU-profiled loads of rift put the tags code at 0.3 to 0.5 s of 72 to
78 s (under 1 %); the build times of four interleaved pairs per page were within the noise (hyperjungle median 9.5 s
both ways; rift 55 s before, 64 s after, one pair the other way round).

**Material**: `id`, `kind` (`leaf`: a foliage card with the wind and two-tone hook; `bark`:
vertex-coloured textured wood; `anim`: an animated fauna body; `plain`: anything else),
`key` (the kit's own name for it), `type` (the three.js material type), `colour`, `map` (a
texture id), `alphaTest`, `doubleSided`, `vertexColours`, `transparent`, `options` (the
hook's options: sway amplitude, two-tone and so on), `sway` (the foliage sway as data: weight =
`c + dot(w, position)`, amplitude `a`, `axis`; or `{text}` for a GLSL weight it does not know), `hooked` (a shader hook a port must
rewrite).

The kits' own hooks are named since 2026-10-05: each sets `userData.bio`, so the export writes its `kind`, `key`
and options as data (the hook code still lives in the kit):

| `kind` | Kits | Options | Godot (`godot/shaders/`) |
|---|---|---|---|
| `irid` | the core (`BIO.iridBarkMat`, `core/biome/30-core-foliage.js`): eastabyss, nhighlands, rift, shighlands, xanadu | `a`, `b`: the tints facing the eye and at grazing angles | `bark.gdshader` mode 1 |
| `gloss` | nwlowlands, swlowlands (`barkMat2`) | `alt` (linear), `mean`, `gain`, `gloss`: the map is data (red brightness, green a mask) | `bark.gdshader` mode 2 |
| `far` | rift, swlowlands (`farMat`): the far impostors | `pack` (`c2-rule`: rift, `gloss`: swlowlands) and `uv`: what the impostor packs into its uvs | `bark.gdshader` modes 3, 4 |
| `hang` | nhighlands' glowing bulbs and pods | `swayA`, `swayW`, `night` (the emissive intensity by day and by night); the material's `emissive` | `bark.gdshader` mode 5 |
| `anim` | the core (`BIO.animMat`, `core/biome/35-core-anim.js`): hyperjungle's rays, darts, butterflies, motes, striders | `mode` (orbit, flit, walk), `flap` {rate, amp, root}, `legs` {top, amp}, `billboard`, `basic`, `additive`; per instance `aP0.w` (the path's radius) and `aP1` | `anim.gdshader`, `anim_add.gdshader` (`lib/anim`; 2026-10-16) |
| `anim-phase` | swbay, nwbay fauna (`animMat`) | `mode` (bird, swim, walk), `attribute: 'aPh'` | not yet: their flocks are moved by the kit on the CPU and no export carries them |

They still export `hooked:true`. Each is to become a core kind whose hook lives once in the core, so that `kind`
names the library shader (`GODOT-PLAN.md`, rule 7), and the record then moves onto the plan's
shared material vocabulary (Phase 3: `family`, `colour`, `map`, `roughness`, `metal`,
`emissive`, `doubleSided`, `alphaTest`, `hook`).

**LOD**: `null` for a mesh drawn at every range, or `{chunk:'cx,cz', range, minRange}`: the
mesh is drawn while the camera is within `range` metres of the chunk (`BIO.LOD.chunk`, 1200 m)
and at least `minRange` from it. In Godot that is `visibility_range_end` and
`visibility_range_begin` on the node, with a fade margin.

## The stage

`KSTAGE.capture()` (`core/biome/44-core-stage.js`, [web], export time only) records how the page looks, so a port
starts from the same light instead of guessing. Every Krator page can call it; `BIO.export` and `ATMOS.export`
add it as `stage`, and `godot/tools/export_spike.py` writes it as `stage.json` for the glTF cases.

| Key | What | Godot (`godot/krator/stage.gd`) |
|---|---|---|
| `renderer` | `toneMapping` (`ACESFilmic`, `Reinhard`, ...), `exposure`, `output` encoding | `Environment.tonemap_mode`, `tonemap_exposure` |
| `lights` | `directional`: `dir` (light to target, unit), `colour`, `intensity`, `shadow`, brightest first; `hemisphere` `{sky, ground, intensity}`; `ambient`; `points` (a count) | the first is the sun, the rest fill lights; `light_energy` = intensity (three's legacy units). Hemisphere and ambient become a colour ambient |
| `fog` | `{type:'exp2', colour, density}` or `{type:'linear', colour, near, far}` | exponential fog with density `0.8326 * d` (one exponential matched to three's squared one at the half-way distance); depth fog for linear |
| `background` | a colour, or `'texture'` / `'cube'` | the clear colour when there is no sky |
| `environment` | `{specular, diffuse, source}` when the page lights its standard materials from its sky (`scene.environment`: core/atmos's skylight), else null | `reflected_light_source = SKY` on the panorama, `ambient_light_sky_contribution = diffuse`; disabled reflections otherwise |
| `sky` | `{png, width, height, at, near}`: what the page draws past `near` metres (half the box's shorter side, so the panorama starts where the export stops; `opt.skyNear` overrides, 1500 without a box), rendered from `at` into a cube and unwrapped: u = 0.5 looks down -z, u = 0.75 down +x, v = 0 is straight up | `PanoramaSkyMaterial` |
| `ground` | on the export's grid (`x0, z0, step, nx, nz`): `uv` (2 a sample) and `colour` (3, or null) read from the mesh under each point, and its `material` (`colour`, `map` as a PNG, `repeat`, `offset`, `flipY`, `vertexColours`, `roughness`, `hooked`); `mesh` names it, `uvFit` says the uvs are an exact affine fit | `shaders/ground.gdshader` on the heightfield |

Colours are three's linear working values, as everywhere in this export: Godot's light, fog and ambient colours are
sRGB, so `stage.gd` converts them (`linear_to_srgb`). The sky PNG is already sRGB. What it cannot see: shader hooks
on the ground (`hooked`), fog written in a ShaderMaterial, and anything a page changes per frame (it is one frame).

## In Godot

- **An item** becomes a `MultiMeshInstance3D`: the unit geometry as its mesh, one
  instance per record. A MultiMesh carries the transform plus eight floats (`COLOR` and
  `INSTANCE_CUSTOM`), and a foliage item needs nine (colour 3, `aN` 3, `aC2` 3), so pack:
  `COLOR = (r, g, b, c2.r)`, `INSTANCE_CUSTOM = (oct(aN).x, oct(aN).y, c2.g, c2.b)`, where
  `oct` is the octahedral encoding of a unit vector into two floats. A fauna item's `aP0`,
  `aP1` go in `INSTANCE_CUSTOM` and a second `MultiMesh` channel the importer chooses.
- **A bucket** becomes a `MeshInstance3D` with an `ArrayMesh`.
- **Materials** become a handful of shaders written once, not one per kit: the foliage card
  (wind sway, two-tone, the up-bent normal), bark, plain, the animated fauna body, and the
  kinds the kits' hooks become (iridescent bark, gloss bark, far impostor, hanging sway): about
  seven for every kit, in the shared library (`core/godot/shaders/`, `GODOT-PLAN.md` Phase 3). Wind and time come from the atmosphere's global shader parameters
  (`atm_time`, `atm_wind`, `atm_gust_amp`: `core/atmos/GODOT.md`), so the forest and the
  smoke share one wind.
- **Ids**: each MultiMesh keeps its instances' uids as a side table (`krator_records` metadata, by instance index) and
  names its item set (`krator_record`); the records themselves (species, class, harvest, Köppen) are `tags.json`
  ("Records" above).

## What a port is tested against

The continent cannot be baked (`WORLD.md`, the scale model): Godot will grow the flora tile
by tile from the same rules. The three.js kits stay the reference. Once placement is seeded
by cell, a tile exported here is what a Godot generator must reproduce for the same seed and
fields, instance for instance: the export is that test's golden data.

Two things stand between that and today:

- **The golden data is the placement records, not the meshes.** Items are instances already,
  but hero trees are built unique and merged into buckets, and `GODOT-PLAN.md` ports no builder
  code. So placement writes records (species, position, seed, size, tags, id; no LOD level),
  the draw pass reads them, and the export carries the records beside the meshes. For Godot to
  grow trees without the builders, each species and habit ships as a library of K baked variants
  that the records choose by seed (`WORLD.md`, blocker 10). Hero trees are an opt-in (Travis,
  Oct 2026; `WORLD.md`, "Hero trees: an opt-in"): a record marked `hero` carries its own baked
  mesh, made by the kit's hero builder, and Godot loads it with its tile instead of placing a
  variant. Sites built on their trees (Mav's Refuge) and hero zones (hyperjungle's hero disc)
  opt in.
- **The arithmetic must match.** `rng` (`10-core-head.js`) is mulberry32 and reproduces bit
  for bit in GDScript. `h3` is a `Math.sin` hash, and `vnoise`, `fbm` and every field rest on it,
  so it moves to `core/rand`'s integer hash (Phase 2) in the same event as cell seeding. Anything
  that goes through trigonometry is compared within a tolerance, not bit for bit.

## Not done yet

Items in `TODO.md` ("Biomes: the port plan's findings"); the order is `WORLD.md`'s.

- Placement seeded by cell (a tile built alone gets the same plants as in a full build), on
  `core/rand`'s integer hash: one reseeding event with the two items below that also move plants.
- Placement records without an LOD level (today `T.lv` comes from the showcase's LOD spine,
  `BIO.lodD`), in the export beside the meshes.
- Stand-ins and far impostors as explicit LOD levels of the record they replace.
- Ground height from the `core/terrain` heightmap, not each host's `terrainH` closure. *(A sampled stand-in, the
  export's `ground`, since 2026-10-05.)*
- Trees as a variant library by default, with hero trees opt-in per record (`hero`, set by a
  site or a hero zone) and baked per tile; a preview switch between all heroes and opt-in only.
- ~~Tags, Köppen and deterministic ids on the records, items and buckets (for `core/tags`).~~ Done 2026-10-12
  ("Records"); placement records proper (species, seed, no LOD level) still wait for the reseeding event.
- The kits' shader hooks as core material kinds (named as data since 2026-10-05; the hook code is still each
  kit's); materials on the plan's shared vocabulary. *(`convention.colours` per table: done 2026-10-05.)*
- `BIO.download()` moved to the host (`core/host`): the export's one browser line. *(Split out to `core/biome/43-core-export-host.js` [web] 2026-10-03; it joins `core/host/` in Phase 1.)*
- ~~`BIO.export` folded into `core/export/` (`krator-world`, Phase 4).~~ Done 2026-10-13 (`core/export/README.md`): the
  biome core gives the container its items, buckets, materials, textures, terrain and stage from `BIO.exportParts`, with
  ids, a tile's buckets compacted and library maps by reference; `BIO.export` is the krator-biome envelope over the same
  parts and writes what it wrote before (byte-identical). Every kit but the Throne lists core/export (`CORE_EXPORT`).
- ~~A converter from this JSON to `.glb` / `.tscn` (`MultiMesh` resources).~~ The `.glb` half: `EXPORT.glb` writes a
  tile's meshes as one glb (`EXT_mesh_gpu_instancing`, the per-instance extras as `_AN`, `_AC2`, `_AP0`, `_AP1`);
  `godot/krator/world_import.gd` reads it. No `.tscn` yet.
