# core/biome

The biome core every biome kit runs on (`10-core-head.js` to `44-core-stage.js`; `biomes/README.md` for the kits). A build
lists the fragments it takes in `CORE_BIOME` in its `build.py`. This file covers the parts added for the final rebuild
(2026-10-26, `HANDOFF-REBUILD.md` "Stage 1, final", core changes B1-B8 and research pick R6). Tests: `node core/biome/test-*.js`
(`test-lod.js`, `test-impostor.js` for what follows).

## The runtime LOD's draw-call options (B1, B2; `20-core-kit.js`)

A pass that sets `BIO.range` keys what it puts by chunk and range, and `BIO.lodTick(camera)` shows a chunk mesh while the
camera is within its range of the chunk box. Until now each (chunk, range, minRange) was its own mesh, so a near floor band
at 800 m and a mid band at 1200 m cost two calls a chunk per item. Four options, each **off by default** (a page that sets
none bakes exactly today's meshes):

| Option | What it does | Look |
|---|---|---|
| `BIO.LOD.merge = true` | one mesh per chunk (and minRange) whatever its ranges; rows sorted by range, longest first; `lodTick` draws the prefix whose range reaches the camera (an InstancedMesh's `count` while it renders, a bucket's draw range). The same instances are shown from every camera (`test-lod.js` proves it on five cameras). | none |
| `BIO.LOD.minTris = n` | with merge: an item or bucket whose chunk meshes would average under `n` triangles is keyed on a 2, 4 or 8 times coarser grid. Its box grows, so it draws a little further out. Stand-ins (minRange) are never coarsened. | small layers reach a little further |
| `BIO.chunk = metres` | a pass's own chunk size, set like `BIO.range` (hero sub-chunks, big chunks for a sparse layer); the key carries the size | per pass |
| `BIO.LOD.fade = .15` | a dithered cross-fade over the last 15% of each range: a chunk's heroes dither out while its stand-ins (minRange) dither in over the same band, filling complementary pixels. `BIO.lodFade(material)` wraps the material's `onBeforeCompile` (after the page's own hook) and is applied at bake to every chunk mesh's material; the mesh carries its box and ranges as three per-mesh vec4s in one instanced interleaved buffer (the export skips it). `BIO.LODFADE_GLSL` holds the chunks for a material that wants them in its own shader. | no pop at the switch |

Notes. A merged mesh's `userData.lod` gains `ranges: [[range, count], ...]` (and `size` when the chunk is not the page's).
**The Godot importer reads only `lod.range`** (`godot/krator/biome_import.gd` `_apply_lod`): for a merged mesh holding
several ranges that is the longest, so a port draws its near layer out to the far range until the export
(`42-core-export.js`) splits a record by `ranges` (requested; not in this workstream's files). A page whose chunk meshes
each hold one range (both pilots at 1200 m) exports as before. The fade's `discard` costs early depth rejection on opaque
materials (bark, boulders) inside faded meshes. A mesh with over three ranges, or with no room for three more attribute
slots, keeps the hard switch.

## Per-instance inspector labels (B5)

`BIO.put(name, pos, q, s, col, {label: 'Black grass'})` gives one instance its own label where it differs from the item's,
so two plants sharing a geometry and a material can be one item (one call a chunk) and still be named apart. Bake hands the
table to the mesh (`userData.instLabels = {names, idx}`, an index per row, kept through the merge sort);
`BIO.instLabel(mesh, instanceId)` reads it, and core/host's inspector (`93-host-inspect.js`) names the hit by it, so every
build's own `describe()` sees the instance's label in `hit.object.userData.inspectLabel` unchanged (`hit.mesh` is the mesh).

## Small fixes (B4, B6, B7)

- `BIO.lathe(fam, rings, seg, rep, ...)`: `rep` may be a function of the ring, rounded per ring to a whole number (at least
  1) so each wrap is seamless; a number draws exactly as before. The hyperjungle's boles pass `R => TAU*R.r/sc0` (no seam
  where sections of different repeat meet; that moves the look of the hyperjungle and of every build that reads its trees).
- `BIO.animMat`: `flap.rate`, `flap.amp`, `legs.top`, `legs.amp` default only when left out (`== null`): rate 0 is a still
  wing (sedesert's 1e-9 draws the same shader as 0).
- `BIO.dynamic` names the kit current when it makes a mesh (`userData.kit`); eastabyss's own assignment
  (`75-biome-eastabyss-fauna.js` line 163) can go.

## Octahedral impostors (R6; `34-core-impostor.js`, opt-in)

A far tree as one quad showing the species from the camera's direction, blended from 8 x 8 views over the upper hemisphere
(a hemi-octahedral grid) baked once per species into a colour atlas and a normal-and-coverage atlas (1024 px each at 128 px
a view; 8 MB of GPU memory a species). The quad turns with the tree's yaw, is lit by the scene's sun, ambient and hemisphere
lights (read every frame) and fogged by the scene's fog; 2 triangles a tree. The bake builds one tree with the kit's own
builders after `BIO.bake` (so its random numbers come after every placement), renders it, and leaves no instance, charge,
registration (the kit mutes its own) or scene object behind.

## Adopting it

The draw-call options, in the host fragment right after `BIO.init(...)` (nwlowlands' and swbay's `45-host-stage.js`):

```js
BIO.LOD.merge=true;BIO.LOD.minTris=1500;BIO.LOD.fade=.15;
```

Nothing else changes; a kit that had raised its near floor range to 1200 m to save calls can take it back to 800 (the
measured trade is in the pilots' KNOWN_ISSUES.md). Per-instance labels: pass `{label}` in the put's `extra` and merge the
items that differed only by label.

The impostors, three lines and the kit's own call sites (swbay is the worked example):

1. `build.py`: add `'34-core-impostor.js'` to `CORE_BIOME` after `'32-core-variants.js'`.
2. The kit's tree pass, once the trees are chosen: per species, `const rec = BIO.impostor(key, () => buildOneTree(T0), {at:
   [T0.x, T0.y0, T0.z], label})` and `BIO.impostorItem(itemName, rec)`; then where a blob far tree or stand-in was drawn,
   `BIO.put(itemName, [T.x, T.y0, T.z], qEuler(0, yaw, 0), T.H / T0.H, tint)` under the same `BIO.range` / `minRange`.
   Keep any random draws the blob code made (swbay keeps its cap colours) so no later tree moves.
3. The host build (`88-host-build.js`), after `BIO.bake()`: `if (BIO.bakeImpostors) BIO.bakeImpostors(renderer);`

## Godot

- The merge, minTris and chunk options are three-side draw grouping; the export's records carry `lod.ranges` for a port
  to split by. The cross-fade is `GeometryInstance3D.visibility_range_fade_mode` (FADE_SELF, already set by the importer)
  or the same dither in a shader.
- Per-instance labels: `userData.instLabels` exported per item as a label table and a row index (an export change, as
  above) for the Godot inspector.
- Impostors: the atlases are DataTextures (export them as PNGs with the material's `userData.bio` {kind: 'impostor',
  opts: grid, cell, radius, centre}); a `far.gdshader` on a MultiMesh does the same hemi-octahedral decode and three-view
  blend (SIsilicon's Octahedral Impostors addon uses the same layout). The bake is browser-side; a port reads its atlases.
