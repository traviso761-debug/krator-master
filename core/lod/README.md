# core/lod: shared level of detail

Before this module no build had LOD: every triangle was drawn at every distance. `09-lod.js` is a runtime that takes
over a **finished** scene. It does not change how a build makes geometry, draws nothing from the PRNG, and changes no
build output except for its own two fragments. `97-lod-auto.js` applies it to the build's `scene`.

## Taking it into a build

1. In `build.py`, add the numbered files of `core/lod/` to the fragment list, the same way `core/materials/` is read:

   ```python
   LOD_DIR = os.path.join(ROOT, 'core', 'lod')
   LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[0].isdigit())
   src.update({f: os.path.join(LOD_DIR, f) for f in LOD_FILES if f not in src})   # a src/ copy overrides
   ```

   If the build has a `DETERMINISTIC` set (fragments with no builder or reseed), add `09-lod.js` and `97-lod-auto.js`.
   Both fragments are IIFEs and declare nothing at column 0, so the shared-scope checks pass.
2. That is all, if the build names its globals `scene`, `camera` and `renderer` (every Krator build does).
   `09-lod.js` sorts before `10-core.js` and only defines `window.LOD`. `97-lod-auto.js` sorts after the camera and
   frame-loop fragments and before `99-tail`, and calls `LOD.init({THREE,scene,camera,renderer,...LOD_OPTIONS})`, then
   `LOD.apply()`. The update runs from `scene.onBeforeRender`, so the frame loop needs no edit.
3. Optional: set `window.LOD_OPTIONS = {...}` in one of the build's own fragments that runs before 97 (the port sets it in
   `92-camera.js`). `LOD_OPTIONS = false` turns the module off for that build. A build that needs to apply it at another
   time calls `LOD.init(...)` and `LOD.apply()` itself, and 97 then does nothing.
4. Rebuild, and measure (below). Record the numbers in the build's README.

**Adopted by every build:** `settlements/port`, `jimjam`, `reedlake`, `screamers`, `voth`, `yuni`, `locus`, `iziz`,
`highlands`, `xanadu`, `dalab`, `mavs-refuge`, `girder` and `kits/ancients` (measurements in each build's README or
KNOWN_ISSUES, "Level of detail"). A new build: the `build.py` edit above, then check its animated objects (anything
flagged or declared dynamic is left out, and anything that moves anyway is handed back on its first move, but naming
it in `skip`/`skipUnder` saves the work at apply time), any flora with its own distance curve (the biome core's sets
default to `minPx:0`; screamers names its jungle the same way), where the panel lands against the build's UI
(`panelStyle`), and the build's draw-call budget in `verify.py --assert`.

## What it does

| Kind of object | What LOD does |
|---|---|
| Merged static `Mesh` (pbFlush batches, terrain strips, biome far meshes) | cut into chunks by a k-d split on triangle centroids (at most `maxTris` triangles, and at most about `maxExtent` m unless the chunk is already under `minChunkTris`, so sparse far ground stays one chunk). Chunks share the original's vertex buffers (only the index is new). A chunk switches to a clustered proxy when its grid (`levels`, metres) is under `errPx` on screen, and is dropped when the whole chunk is under `minPx`. The chunks are drawn **combined**: one copy per level in use, whose index buffer is the concatenation of the chunks at that level (rebuilt when a chunk changes level), with a bounding sphere round just those chunks. So a split mesh costs one draw call per level in view (usually two or three), not one per chunk. |
| `InstancedMesh` | stays ONE draw call. Instances are bucketed in `cell`-metre cells and sorted by size inside each cell. Each update copies, cell by cell, the instances still larger than `minPx` on screen into the copy's buffers (one contiguous copy per cell), so small detail drops first. A base geometry of `instFarMinTris` triangles or more gets a clustered far version (one more draw call) beyond `errPx`. The copy has a real bounding sphere, so it is frustum-culled (the kits' `kbake` turns culling off on the originals). |
| Transparent, `depthWrite:false`, back-side (sky), skinned, morphed, multi-material meshes, sprites, points, lines | left alone. |
| Anything the build animates by contract: an instanced set whose `instanceMatrix` (or an instanced attribute) uses `DynamicDrawUsage` or is interleaved, a mesh whose positions are dynamic, and anything flagged `userData.life`, `lifeLabel`, `flyers`, `noPick` or `lodSkip` | left alone. |

**Proxies are vertex clustering:** every vertex is snapped to a world grid of `s` metres, vertices whose normals face
different ways stay apart, positions, normals and colours are averaged per cell, other attributes come from the first
vertex, and collapsed and duplicate triangles are dropped. Vertices on an open edge of the mesh (welded by position,
so flat-shaded boxes count as closed) and on an edge between two chunks are **pinned**: they never move, so a proxy's
rim meets its neighbour exactly, whether that is another chunk at another level or another mesh along a shared seam
(the port's terrain strips). A level is built for the whole original mesh at once and
shared by its chunks (no cracks between chunks of one mesh), lazily, the first time a chunk wants it, at most
`buildMs` per frame. A level that saves under 15% reuses the level below. Until a level is built the chunk draws the
best one that is.

**Originals stay the truth.** Every object it manages is moved to layer 30, which the camera does not draw, and a copy
under `LOD.root` draws instead. `Raycaster.intersectObject(s)` is patched to see layer 30, and the copies never
raycast, so the inspector, picking, the polygon tool, labels and every `_api` probe see full detail. The copies carry
`userData.lodCopy` and `userData.probeSkip` and the original's other userData. Every frame the copies follow their
original's `visible` (and its parents') and `material`, so night toggles keep working. An original whose matrix,
geometry, instance matrices or count change after `apply()` is animated: it is handed back (its layer restored, its
copies removed) and draws exactly as before. A changed `instanceColor` is re-copied.

**Cost:** `apply()` is one pass over the scene (k-d split of the big meshes, bucketing of the instances). After that a
still camera costs, per managed object and frame, one matrix compare and two version reads (to catch animation) and a
walk up its parents (so a hidden original hides its copy the same frame: cutaways, night toggles, underground views). Bands are recomputed at most every
`throttle` ms and only after the camera moves `moveEps` m, with hysteresis `hyst` on every threshold.

## API

| Call | What |
|---|---|
| `LOD.init(opt)` | binds `THREE`, `scene`, `camera`, `renderer` and the options below; patches the Raycaster once |
| `LOD.apply(root?)` | takes over every eligible mesh under `root` (default the scene); returns `LOD.stats()`, which 97 keeps in `LOD.applied` (not on `window._*`, so verify's counter baselines do not change) |
| `LOD.update(force?)` | the per-frame update (called for you from `scene.onBeforeRender` unless `auto:false`) |
| `LOD.enabled` | get / set. `false` removes `LOD.root` from the scene and restores the originals' layers: the scene graph is exactly the build's. Also the panel button, the `l` key, and `?lod=0` / `?lod=1` in the URL |
| `LOD.stats()` | `{enabled, managed, applyMs, chunks, chunksFar, chunksOff, instances, instancesDrawn, managedTris, managedTrisDrawn, visibleCopies, pending, live:{calls,tris}, measured}`. `managedTris*` are before frustum culling |
| `LOD.flush()` | builds every pending proxy and recomputes the bands now (call before a screenshot or a count) |
| `LOD.measure(frames=2)` | renders the current view with LOD off, then on: `{off:{calls,tris,ms}, on:{calls,tris,ms}}` (ms per frame after `gl.finish`) |
| `LOD.release(obj)` | hands one original back for good (for something the build will animate) |
| `LOD.root` | the group that holds every copy |

For a verify assert that counts full-detail triangles: `LOD.enabled=false`, render, count, `LOD.enabled=true`.

## Options

| Option | Default | What |
|---|---|---|
| `cell` | 64 | instance cell size, m |
| `maxTris`, `maxExtent`, `minChunkTris` | 40000, 400, 10000 | chunk limits for merged meshes |
| `errPx` | 3 | screen error a proxy may make, px |
| `minPx` | 1 | an object or chunk smaller than this on screen (radius, px) is dropped |
| `levels` | `[1,4,16,64]` | clustering grids for merged-mesh proxies, m |
| `simplifyMinTris` | 64 | meshes with fewer triangles are only dropped, never simplified |
| `instFarMinTris`, `instFarMinTotal`, `instFarDiv` | 48, 20000, 6 | an instanced set whose base geometry has `instFarMinTris` triangles, and `instFarMinTotal` in all, gets a far version (one more draw call) clustered at radius/`instFarDiv` |
| `throttle`, `moveEps`, `hyst` | 200, 0.5, 1.12 | ms between band updates, m of camera travel, hysteresis factor |
| `buildMs` | 10 | proxy building per frame, ms |
| `skip(o)` | | `true` leaves an object alone (something the build animates per frame) |
| `skipUnder` | | objects (or a function returning them) whose whole subtree is left alone: turning sails, orreries, windmills |
| `classify(o)`, `classes` | | name a class per object and give it `{minPx, maxDist, simplify}`: e.g. clutter `{minPx:2}`, figures `{maxDist:400}`. Instanced sets of the shared biome core (`userData.biome`) default to class `biome`, `{minPx:0}`: the biome thins its own flora with distance, so LOD only culls and simplifies them |
| `ui`, `key`, `panelStyle` | true, `'l'`, `''` | the panel (bottom right, outside `#ui` so view sweeps never click it), its key, and CSS appended to its style to move it |
| `render` | `renderer.render(scene,camera)` | what `measure()` draws |
| `auto` | true | hook `scene.onBeforeRender` |

## Measuring a build

```js
setView(...VIEWS['Overview']); LOD.flush(); LOD.measure()   // {off:{calls,tris,ms}, on:{...}}
```

The panel's `measure` button does the same for the current view. Record an overview and an eye-level view, off and on.

## Known limits

- Pinning closes seams along open edges and chunk edges. Two meshes that touch without sharing an edge (a wall
  standing on a terrain chunk) can still show a gap of up to one grid cell at a proxy level, which is `errPx` (3 px).
- Instances in a cell are dropped by their own size from the cell's nearest point, so a cell switches as one; at the
  default 64 m cells that is not visible.
- Objects added to the scene after `apply()` are not managed (the port's bounds overlay, labels made later).
  Call `LOD.apply(group)` on a new static group to take it over.
- Animated originals are handed back on their first move. A build with many per-frame animated meshes should list
  them in `skip` so `apply()` does not chunk them first.
