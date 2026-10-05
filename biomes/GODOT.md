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

In a kit's page, after it has built (the probe's `window._ready`):

```js
BIO.export()                                   // the whole build, one object
BIO.export({box:[x0,z0,x1,z1]})                // one tile: instances whose origin, triangles whose centroid lie in it
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
| `ground` | with a box: the ground under the tile, `{x0, z0, step, nx, nz, heights, water}` (typed arrays; row j is z0 + j*step). The host's `terrainH` and `waterH` sampled on a grid (`opt.ground`: the step, 2 m by default; `false` leaves it out). A stand-in for the `core/terrain` bake (since 2026-10-05) |
| `items` | one record per instanced mesh (below) |
| `buckets` | one record per merged mesh (below) |
| `materials` | one record per material (below) |
| `textures` | one record per texture: `id`, `wrap`, `repeat`, `flipY`, `size`, `png` (a data URL, encoded by the host's `BIO.texPNG`), or `error` saying why there is no image |
| `stats` | counts: items, instances, buckets, triangles |

Typed arrays are `{type, n, b64}`: the array's bytes, base64. `Float32Array`,
`Uint16Array` and `Uint32Array` occur.

**Item**: `name` (the item's name in its kit), `kit`, `label` (what the inspector shows),
`material` (a material id), `lod`, `count`, `dynamic` (fauna that a script moves every
frame), `geometry` (the unit mesh once: `position`, `normal`, `uv`, `color` if any,
`index` if any), `matrices` (16 floats an instance), `colours` (3 an instance), `extras`
(per-instance attributes: `aN` the foliage normal, 3; `aC2` the second colour, 3; `aP0`,
`aP1` a fauna path, 4 each).

**Bucket**: `name` (the family), `kit`, `label`, `material`, `lod`, `triangles`,
`geometry` (indexed `position`, `normal`, `uv`, `color`; a tile keeps the whole vertex list
and only the triangles inside it, so an importer drops unused vertices).

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
| `irid` | eastabyss, nhighlands, rift, xanadu (`BIO.iridBarkMat`) | `a`, `b`: the tints facing the eye and at grazing angles | `bark.gdshader` mode 1 |
| `gloss` | nwlowlands, swlowlands (`barkMat2`) | `alt` (linear), `mean`, `gain`, `gloss`: the map is data (red brightness, green a mask) | `bark.gdshader` mode 2 |
| `far` | rift, swlowlands (`farMat`): the far impostors | `uv`: what the impostor packs into its uvs | not yet |
| `hang` | nhighlands' glowing bulbs and pods | `swayA`, `swayW`, `emissive` | not yet |
| `anim-phase` | swbay, nwbay fauna (`animMat`) | `mode` (bird, swim, walk), `attribute: 'aPh'` | not yet |

They still export `hooked:true`. Each is to become a core kind whose hook lives once in the core, so that `kind`
names the library shader (`GODOT-PLAN.md`, rule 7), and the record then moves onto the plan's
shared material vocabulary (Phase 3: `family`, `colour`, `map`, `roughness`, `metal`,
`emissive`, `doubleSided`, `alphaTest`, `hook`).

**LOD**: `null` for a mesh drawn at every range, or `{chunk:'cx,cz', range, minRange}`: the
mesh is drawn while the camera is within `range` metres of the chunk (`BIO.LOD.chunk`, 1200 m)
and at least `minRange` from it. In Godot that is `visibility_range_end` and
`visibility_range_begin` on the node, with a fade margin.

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
- **Tags** (species, class, harvest, Köppen) are not in the export yet: the inspector's
  registry is the host's. They will travel as each node's glTF extras, as Yuni's do.

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
- Tags, Köppen and deterministic ids on the records, items and buckets (for `core/tags`).
- The kits' shader hooks as core material kinds (named as data since 2026-10-05; the hook code is still each
  kit's); materials on the plan's shared vocabulary. *(`convention.colours` per table: done 2026-10-05.)*
- `BIO.download()` moved to the host (`core/host`): the export's one browser line. *(Split out to `core/biome/43-core-export-host.js` [web] 2026-10-03; it joins `core/host/` in Phase 1.)*
- `BIO.export` folded into `core/export/` (`krator-world`, Phase 4). (`tools/audit_port.py` sees it in every
  build that lists `42-core-export.js` since 2026-10-02.)
- A converter from this JSON to `.glb` / `.tscn` (`MultiMesh` resources).
