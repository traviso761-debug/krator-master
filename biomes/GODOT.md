# Biome kits in Godot 4: the contract (scaffolding)

The open world runs in Godot (`WORLD.md`). The port comes later; this file and
`BIO.export()` (`core/biome/42-core-export.js`) are the scaffolding: what a kit places can
already be written out as data in the shape a Godot importer will read, so nothing built
now has to be torn up for the port. It follows the conventions of
`settlements/yuni/GAME_EXPORT.md` and `core/atmos/GODOT.md`.

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

Colours are **linear** (the core converts every designer's sRGB hex once, at `BIO.put` and
at every bucket write). In a Godot shader read `COLOR` and the custom data as they are; do
not mark them `source_color`. Texture PNGs are sRGB images: declare their samplers
`source_color`.

## The object

| Key | What |
|---|---|
| `format`, `version` | `'krator-biome'`, 1 |
| `convention` | units, up, axes, handedness, matrix order, colour space (above) |
| `core`, `kits` | the core's version, the kits resident in the page (`BIO.kit`) |
| `box` | the tile, or null |
| `items` | one record per instanced mesh (below) |
| `buckets` | one record per merged mesh (below) |
| `materials` | one record per material (below) |
| `textures` | one record per texture: `id`, `wrap`, `repeat`, `size`, `png` (a data URL) |
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
hook's options: sway amplitude, two-tone and so on), `hooked` (a shader hook a port must
rewrite).

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
  kits' own hooks (`hooked:true` without a core `kind`: the iridescent barks, the glow) as
  they are ported. Wind and time come from the atmosphere's global shader parameters
  (`atm_time`, `atm_wind`, `atm_gust_amp`: `core/atmos/GODOT.md`), so the forest and the
  smoke share one wind.
- **Tags** (species, class, harvest, Köppen) are not in the export yet: the inspector's
  registry is the host's. They will travel as each node's glTF extras, as Yuni's do.

## What a port is tested against

The continent cannot be baked (`WORLD.md`, the scale model): Godot will grow the flora tile
by tile from the same rules. The three.js kits stay the reference. Once placement is seeded
by cell, a tile exported here is what a Godot generator must reproduce for the same seed and
fields, instance for instance: the export is that test's golden data.

## Not done yet

- Placement seeded by cell (a tile built alone gets the same plants as in a full build).
- Tags and Köppen on the records.
- A converter from this JSON to `.glb` / `.tscn` (`MultiMesh` resources).
- Stand-ins and far impostors as explicit LOD levels of the item they replace.
