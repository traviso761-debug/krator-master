# core/water: one module for every wet surface

Every sea, bay, lake, river, fall, pool and wet street in Krator is meant to come from here: a build names the **kinds** of
water it has and writes no water shader of its own. The plan, the audit of the thirty-nine builds that draw water and what
was taken from Halcyon are `core/atmos/WATER.md`; this file is the contract.

**Status (2026-10-13): phases 0 to 4 of `WATER.md` section 5.** The data side and its CPU twins for all six kinds, and
their drawing: **open** water (the CDLOD mesh, the shared wave field, the sky in the water, Jacobian foam; 2026-10-12),
the **shore** (the flood and distance field on the ground, shoaling, breakers, surf foam, the wet-sand twin, masks and
shore windows for water too big to grid whole; Phase 2), **flow** and **falls** (the ribbon, the advected ripple, rapids
and bank foam, the arcing curtain, its plunge; Phase 3) and **still** water with the weather's wetness (`W.wet`; Phase 4),
each with its Godot twin (below). Its first takers are `kits/ringsea` (the roadstead; the kit's Gerstner swell, `rsSeaH`
and `rsRide` moved in here) and `biomes/geyser` (the Ring Sea off the basin's beach).

**Phases 2 to 4's takers (2026-10-13):** `openworld/little-demo` (the sea and every lake one masked open surface on a
shore window, the Yuni river a flow; `src/83w-world-seas.js`, `src/83-world-water.js`); `biomes/sedesert` (the river a
flow from the head of the wadi to the notch, the cataract a fall into the Abyss, the plunge pool still water;
`src/89w-host-water.js`); `settlements/ys` (the terraced river a flow down its rimstone pools; `targets/city/88b-city-draw.js`);
`settlements/reedlake` (the troughs, the wallow, the pen's pan and the dye vats still water; `src/90x-rl-still.js`); `biomes/nsemiarid` (2026-10-22: the remnant salt lake and the spring pool still water, the stream a flow; the records in `src/45-host-stage.js`, which its `waterH` answers from, drawn in `src/89b-host-atmos.js`);
`settlements/xanadu`'s kit page (its pools, rill basins, channels and bowls still water; `targets/xanadu/90-xa-still.js`).
Not taken, and why: Locus's and Mungo's river, delta, canals and pools are one level sheet shaped by the ground (no line
to flow along, no rim to hold a pool) and their troughs are merged kit geometry; Erewhon (Xanadu's city) bakes its pools
per chunk under its own sky; `W.wet` has no taker yet (only Voth's page (`settlements/voth`) runs core/atmos's weather, and it waits for the
Voth branch).

**Phase 1's other takers (2026-10-13):** `settlements/reedlake` (the lake: no swell of its own, a calm share of the field
so the kit's baked canoes and islands keep their waterlines, the old lake map's ripple as the detail normal map;
`src/90w-rl-lake.js`); `settlements/noahs-regret` (the Ring Sea off the south shore, the basin and the flooded holds: the
whole field as before, no trochoids while the floats are baked, the bed from `terrainH` with the hull's ground;
`src/82-nr-water.js`); `settlements/port`, the Ancient Port kit (the sea along the coast: a calm
share of the field while the vessels are baked, the bed from the stamped ground, the depth tint still painted on the
seabed under the part-transparent water, dry pits cut out; `src/71w-port-sea.js`, which Ys vendors); `settlements/ys` (the port's sea, vendored, under the drowned city; its own
sky copy in the water, a flat pick plane named `sea`); `settlements/locus` (the open salt lake; the river, the delta and the pools stay on the
old sheet, the two split on the shoreline by one baked mask both shaders sample; the life layer's boats ride it;
`src/90w-lake.js`); `settlements/mungo`, which reads Locus's fragment by name (its lake and
the Reed Lake kit's islands on it; the reed boats ride it).

**`openworld/little-demo`** (taken 2026-10-13, phases 2 and 3). Its water was one sheet per streamed terrain chunk,
each vertex at its own level, which one `WATER.open` (one level, a rectangle) could not draw. Now each water body of the
scale model (`WORLD.waterBodies`: a run of wet 4 km cells at one level) is one open surface with a **mask** (its cells and
the ring round them, the ring refined by a flood at about 500 m) and a **shore window** (8 km at 32 m round the camera,
re-baked a slice at a time: `WATER.shoreJob`), drawn on 17 CDLOD levels about a **camera-relative origin**
(`WATER.draw(S, {origin})`); the Yuni river is a `WATER.flow` along `WORLD.riverLines`, its ribbon local to its middle.

| File | Tag | What |
|---|---|---|
| `20-core-water.js` | [G data] | `WATER`: the presets, the six kinds as records, the CPU twins, `heightAt`, `flowAt`, `seaLevel`, `ride`, `export`. No THREE, no DOM |
| `21-core-water-shore.js` | [G data] | the shore grid (`WATER.shoreGrid`: the flood, the exact distance transform `WATER.edt`, the bytes), shore windows (`moveShore`, `shoreJob`), the shore's twins (shoaling, breakers, the beach), `WATER.maskLand` |
| `22-core-water-flow.js` | [G data] | the meshes as arrays (`WATER.ribbon`, `curtain`, `stillMesh`) and the twins of their shading (`flowNormal`, `flowFoam`, `fallStreak`, `fallFoam`, `plungeAt`, `stillNormal`, the value noise), `WATER.fallsOf` |
| `50-core-water-draw.js` | [draw] + [G shader] | the CDLOD selection (`WATER.cdlod`, data), the GLSL chunk written from a surface (`WATER.glsl`), `WATER.draw` (the open-water mesh and material), `WATER.shaderOn` |
| `51-core-water-kinds.js` | [draw] + [G shader] | `WATER.drawFlow`, `drawFall`, `drawStill`, `stillMaterial`, `wetGround` and their GLSL (`flowGLSL`, `fallGLSL`, `stillGLSL`, `wetChunk`) |
| `test-water.js` | | `node core/water/test-water.js`: every check with a negative control; runs the shaders' own GLSL in a small interpreter against the twins |

## Taking it into a build

List the two files in `build.py` beside core/atmos, which the drawing needs (`89-atmos-0-core.js`, `89-atmos-0p-presets.js`,
`89-atmos-a-waves.js`, and `89-atmos-b-skylight.js` for the sky in the water). `kits/ringsea/build.py` (`CORE_ATMOS`,
`CORE_WATER`) and `biomes/geyser/build.py` are the worked examples. Both files declare one global each way (`const WATER`,
then an IIFE that adds to it), so a shared-scope check sees nothing else; nothing runs at load time.

Then, after `ATMOS.init` (the module clock and the `atmos_waves` chunk must exist) and before the first frame:

```js
const SEA = WATER.open({name: 'The Ring Sea', swell: 'ringsea', field: .5});     // the data: a surface record
const D = WATER.draw(SEA, {color: 0x06222e, roughness: .22, metalness: .4,      // the drawing: one instanced mesh
                           envMapIntensity: .2, normalMap: TEX.water, detailSize: 46});
WATER.ride(hull.group, {L: 40, B: 8}, x, z, heading, t);                          // a hull on the water, each frame
```

**The clock is core/atmos's.** The shaders read `atmWaveT` (`ATMOS.U.waveTime`, the module clock wrapped at
`PRESETS.waves.period`); the twins take the module's seconds `t` and wrap it themselves. A page with its own time pins the
module to it (`ATMOS.clock.fixed = t` before running ATMOS's frame hooks: the Ring Sea kit's `_api.pause(t)` keeps working
that way). A fragment that calls `WATER.open` must load after `89-atmos-*` (the geyser's sea is `89w-host-sea.js`): the
open surface reads the wave period from `ATMOS.PRESETS`.

**The sky in the water** is `ATMOS.skylight`'s capture. `WATER.draw` takes `ATMOS.skyEnv`'s map onto its material as it
arrives and whenever it is recaptured. To keep a build's tuned standard materials as they were, give skylight a holder
instead of the scene (`ATMOS.skylight({renderer, sky: skyScene, scene: {environment: null}, ...})`): only the water then
reflects the sky. `envMapIntensity` sets how much: the Ring Sea takes a fifth (more reads as pale ice from a low camera).

**Picking and walking.** The water mesh's raycast is off (its geometry is a unit grid; the shape is made in the vertex
shader). Keep a flat, invisible plane for the camera's ground picks (`new THREE.MeshBasicMaterial({visible: false})`, as
`kits/ringsea/src/90-rs-scene.js` does) and use `WATER.heightAt` for anything that needs the surface.

**Level of detail.** The mesh carries `userData.lodSkip` (2026-10-13): core/lod's automatic pass (`97-lod-auto.js`) took it
for a static mesh, culled its unit grid by its size at the origin and moved it off layer 0, so in Locus the lake vanished
once the camera was far from the origin. The CDLOD selection is the water's own level of detail.

## The six kinds

| Kind | Call | Data | Twin | Drawn |
|---|---|---|---|---|
| **open** (sea, bay, lake, salt lake) | `WATER.open({name, level, swell, field, chop, tilt, bounds, bed, bedBox, bedCell, damp})` | a level (default `seaLevel(t)`), trochoids (a `PRESETS.swells` name or a list), a share of the shared wave field, an optional bed baked to a depth grid | `S.heightAt`, `S.surfaceAt`, `S.normalAt`, `S.rest`, `S.depthAt`; `WATER.troD`, `troNJ`, `foamAt` | yes: `WATER.draw` |
| **shore** (the band within ~100 m of land) | `WATER.open({..., shore: {seeds, land, band, clip, cell, window}})`; `WATER.shore({name, of, band})` names a band | a shore grid: the flood from the seeds over the ground under the level, the signed distance to the shoreline (bytes beside the bed's depth) | `S.shoreDist`, `S.wetAt`, `S.surfAt`, `S.surfFoamAt`, `S.wetGroundAt`; heights with shoaling and breakers in `S.heightAt` | yes (Phase 2): `WATER.draw` clips to the flood, shoals, surfs; `WATER.wetGround` wets the beach |
| **flow** (river, stream, creek, canal) | `WATER.flow({name, pts or river, width, speed})` | a line `[[x,z,y],...]` or `KRELIEF.river`'s `[{x,z,y,slope}]`, width and speed per point or for all | `S.flowAt` `[vx, vz, speed, slope]`, `S.heightAt` (the line's surface); `WATER.ribbon`, `flowNormal`, `flowFoam` | yes (Phase 3): `WATER.drawFlow` |
| **fall** (waterfall, cataract, spillway) | `WATER.fall({name, lip, dir, speed, drop, plunge, spread})`; `WATER.fallsOf(flow)` | the lip, the direction and speed the water leaves it, the drop | `S.curtainAt(u, f)`: the curtain ARCS (a parabola from the lip speed); `WATER.curtain`, `fallStreak`, `plungeAt` | yes (Phase 3): `WATER.drawFall` |
| **still** (pools, fountains, troughs, moats) | `WATER.still({name, level, bounds or poly, fountain})` | a level over a box or a polygon | `S.heightAt` = the level, `S.normalAt`; `WATER.stillMesh` | yes (Phase 4): `WATER.drawStill`, `WATER.stillMaterial` |
| **wet** (ground after rain) | `WATER.wet()` | the weather's `W.wet` (core/atmos 4-weather) | 0..1; `WATER.wetGroundRain` | yes (Phase 4): `WATER.wetGround` |

**The queries** cover every surface a build made: `WATER.at(x, z)` is the surface there (a still pool before a flow, a flow
before a bounded open water, the unbounded sea last), `WATER.heightAt(x, z, t)` its height (`null` where there is no water),
`WATER.flowAt(x, z)` the current (zero off a river), `WATER.seaLevel(t)` the sea's level (`PRESETS.sea.level`, plus a tide
once `WATER.tide({amp, period, phase})` sets one; Phase 2 drives it from `core/clock`). `WATER.export()` is every surface
as plain data (for `core/export` and Godot).

**Floating:** `WATER.rideAt(L, B, x, z, yaw, t, heel, hFn)` returns a hull's pose `{x, y, z, rx, ry, rz}` (Euler `YXZ`) on
the water: heave is the mean of five samples (amidships twice, bow and stern at 0.36 L, both beams at 0.28 B), pitch and
roll the slopes between them, so a long hull averages short waves out and a canoe follows them; `heel` adds to the roll.
`WATER.ride(G, D, ...)` applies it to anything with `position.set` and `rotation.set` (a three.js `Object3D`; `D = {L, B}`).
`hFn` (default `WATER.heightAt`) lets a world ride a sea of its own. It is the Ring Sea kit's `rsRide`, moved.

## Open water

The surface the vertex shader draws for a **rest point** `p0` of the mesh at time `t`:

```
p   = p0 + m * sum_i H_i D_i cos(th_i)                      the trochoids move the water sideways (Gerstner)
y   = level + m * ( sum_i A_i sin(th_i) + field * atmWaveHeight(p, chop) )
th_i = 2 pi (fract(p0.x kx_i) + fract(p0.z kz_i) - fract(t n_i / period)) + ph_i
```

- **Trochoids** (`PRESETS.swells`, `[amplitude m, wavelength m, direction deg, phase rad, steepness]`, `H = steepness / k`):
  the crests sharpen and the troughs flatten; the sum of steepnesses stays under 1. Each runs `n_i` whole cycles per wave
  period, its deep-water frequency `sqrt(g k)` rounded (within 1.5%: the test checks), and its phase is written in turns,
  as the shared field's is, so the clock's wrap is seamless and fp32 never steps on a long session. `ringsea` is the Ring
  Sea kit's four (70, 43, 27 and 17 m).
- **The shared wave field** (`core/atmos/89-atmos-a-waves.js`): `field` scales it (the Ring Sea and the geyser take half),
  evaluated at the moved point. Its swell displaces; its chop displaces only if `chop` > 0 and the mesh is fine enough;
  its chop and mid waves always shade.
- **The bed** (optional): `bed(x, z)` is the ground; `WATER.open` bakes the depth below the surface's level over `bedBox`
  into bytes (`PRESETS.bed`: a square-root channel to 40 m, a linear one with 2 cm steps over -2..3 m), the same bytes the
  GPU samples, so the twin and the shader read the same depth. `m` is the damping: `smoothstep(0, damp, depth)` (3 m), so
  the water calms to nothing at the waterline. The drawing tints shallow to deep over it, laps a surf where it is under
  1.4 m and, if transparent, fades out over the sand. Phase 2's shore field replaces this per-surface grid.
- **`heightAt(x, z, t)`** inverts the map: Newton (5 steps on the CPU, 3 in GLSL's `wtrHeight`) finds the rest point that
  lands on `(x, z)`, then adds the two. Error: 1e-14 m on the CPU, under 0.3 mm for the GLSL's 3 steps.
- **Shading:** the fragment builds the normal from the trochoids' tangent frame at the rest point (each wave faded where
  it is finer than a pixel, `PRESETS.open.px`), plus the field's slope at the moved point (tilted by
  `PRESETS.waves.tilt` x `tilt`), calmed by `m` (`S.normalAt` is its twin).
- **Foam** (`PRESETS.foam`): the trochoids' Jacobian `J = (1 + dDx/dx)(1 + dDz/dz) - (dDx/dz)^2` is under 1 on the crests;
  a whitecap is where it falls from 0.5 to 0.3. The decay is the max over four past times 0.45 s apart, each weighted
  `exp(-age / 1.8 s)`, at the same rest point: the foam a water particle carries after its crest broke, with no render
  target. Broken by a value noise fixed in rest-point space (so it rides the orbits and needs no clock). `WATER.foamAt` is
  the twin, without the noise.

## The CDLOD water mesh

`WATER.draw` draws an open surface as **one instanced mesh**: every node is the same 17 x 17 vertex grid; a per-instance
attribute `wtrNode` carries `(x0, z0, size, level)`. Each time the scene is rendered (`scene.onBeforeRender`, so it is
the camera actually rendering, and the attribute uploads in that same render), `WATER.cdlod` walks a quadtree:

- the **root** is `leaf * 2^(levels-1)` (8 m x 4096 = 32.8 km), snapped to the camera on a grid of half its size, so
  every level's nodes sit on a fixed world grid (no swimming) and the camera is at least 8 km from the edge;
- a node of size `s` **splits** while the camera (3D, to the node's box at the water's level) is within `range * s / 2`
  (`PRESETS.cdlod.range` 4.5); leaves are 8 m (0.5 m between vertices);
- nodes outside the view frustum (the box padded by the surface's amplitude) and outside the surface's `bounds` are
  dropped with their subtrees.

In the vertex shader (`wtrMorph`) each vertex morphs toward the next coarser level over the last 15% of its node's range
(`morph` 0.85): odd vertices slide onto their even neighbours, so a node fully morphed is exactly its parent's triangles
(one diagonal direction everywhere). Where a fine node meets a coarser one the fine one is fully morphed and the coarse
one not at all, provided `range * (morph - 0.5) >= sqrt 2`; `test-water.js` checks the shared edges vertex by vertex at
three camera positions (and that `range` 2.6 cracks). The vertex spacing `sp = size/16 * (1 + morph)` fades each wave's
displacement out where the mesh cannot carry it (`k * sp` from 1.2 to 2.4, `PRESETS.open.lod`); the fragment keeps
shading it. The Ring Sea's old plane faded every wave past ~600 m from a fixed centre; now the fine mesh goes wherever
the camera goes.

Cost, the Ring Sea at its "Toward the volcano" view (13 m up): 172 nodes, 88k triangles (the old plane: 115k), one draw
call. At 2 m above the water with no frustum it would be ~860 nodes; the frustum keeps about a quarter.

## The GLSL (`WATER.glsl(S)`)

Written from the surface's records and the presets (every wave a literal), the same text in both stages, after
`#include <atmos_waves>`. Uniforms: `wtrLevel` (the level now), `wtrBase` (the level the bed was baked at), `wtrBed` (the
depth grid, with a bed), plus atmos's `atmWaveT` and `atmWaveAmp`. Functions:

| Function | What |
|---|---|
| `wtrSurface(p0, sp)` | the drawn point `(x, y, z, m)` for rest point `p0` and vertex spacing `sp` (twin: `S.surfaceAt`) |
| `wtrHeight(p)` | the height at a world point (3 Newton steps; twin: `S.heightAt`) |
| `wtrTroD(p0, sp)`, `wtrTroNJ(p0, mpp, t)`, `wtrTroJv(p0, mpp, t)` | the trochoids' displacement; normal and Jacobian; the Jacobian's terms (twins: `WATER.troD`, `troNJ`) |
| `wtrFoam(p0, mpp, J)`, `wtrCap(J)` | the decayed whitecap (twin: `WATER.foamAt`, `WATER.cap`) |
| `wtrNormal(nj, p, camDist, m)` | the shading normal (twin: `S.normalAt`) |
| `wtrDepth(p)`, `wtrDamp(p)` | the bed's depth and the damping (twin: `S.depthAt`, `S.damp`) |
| `wtrMorph(g, node)` | the CDLOD morph: `(x, z, spacing)` (twin: `WATER.cdlodMorph`) |

`WATER.shaderOn(S, shader)` gives another material the surface's uniforms and returns the chunk to inject: the Ring Sea's
wakes ride the sea with `wtrHeight` in their vertex shader.

## The shore (Phase 2, `21-core-water-shore.js`)

`WATER.open({..., bed, bedBox, shore: {seeds, land, band, clip, cell}})` makes the surface's bed a **shore grid**
(`WATER.shoreGrid`): the ground sampled at cell centres (`bed` is a function or a KFIELD, `land` a predicate that marks a
cell dry whatever its height: `WATER.maskLand(KMASK.canvas, toPx)` reads a core/mask raster's own bytes), the cells under
the level that the water **reaches** (a 4-connected flood from `seeds`: points or a predicate; `null` takes every cell under
the level), and the **signed distance to the shoreline** in metres (+ on the water, - inland or in a hollow the flood never
reached), exact (the Felzenszwalb-Huttenlocher squared distance transform, what a jump flood approximates). It is bytes, as
the bed is: R and G the depth as `bakeBed` writes it, B the distance over `[-band, band]`, A the depth again, linear over
`PRESETS.shore.mid` (-2..14 m), which a shore grid reads (the fine channel clamps at 3 m, so where one of the four texels a
sample filters is deeper its value is biased by up to half a metre, and GPU and CPU could pick different channels there).
On such a surface:

- **It stops where the flood stopped.** `S.wetAt(x, z)` (distance > -clip cells), `S.contains` too; the fragment discards
  the rest and the CDLOD selection drops nodes over no drawable cell (`S.wetIn`, a summed-area table). A lake in a box no
  longer floods the lower hollow beside it (`test-water.js`: an 8 m deeper hollow 150 m off stays dry; without seeds it
  floods, the negative).
- **It shoals.** The damping becomes `smoothstep(0, damp, depth) * shoalK(depth)`, Green's law `(12 / depth)^(1/4)` under
  12 m, capped at 1.8: the trochoids and the field grow toward the shore, then calm at the waterline.
- **It surfs.** A breaker train runs in along the distance (`S.surfAt`): crests parallel to the coast, `round(period / 9 s)`
  whole cycles per wave period, born over the band's outer 45 %, highest in the breaking depths (shoaled), gone at the
  waterline, the front steepened by a second harmonic as it breaks (the lip leaning shoreward). They move nothing sideways,
  so `heightAt`'s Newton inverse is unchanged; their slope (central differences, `S.surfSlope`) joins the shading normal;
  their foam (`S.surfFoamAt`) is on the crest and its front in the breaking depths.
- **It wets the beach.** `S.wetGroundAt(x, z, groundY, t)` -> `[wet, film]`: dark where the swash reaches (up to the runup,
  1.1 m over the level, within 40 m inland), and the swash's film glistening on its way up and back, once per breaker.
  A ground material takes it with `WATER.wetGround(material, {surface})` (51).

The GLSL (`WATER.shoreGLSL`, added to `WATER.glsl` only for a shore grid: the text for every other surface is
byte-identical) adds `wtrShoalK`, `wtrShoreDist`, `wtrWet`, `wtrSurf`, `wtrSurfSlope`, `wtrSurfFoam` and `wtrWetGround`.

## Masks and shore windows (water too big to grid whole)

- **A mask** (`WATER.open({mask: {x0, z0, cell, cellZ, nx, nz, data}})`): a coarse raster of the cells the surface may
  cover (a byte per cell, > 127 = may). The fragment discards outside it (`wtrMaskOk`), the CDLOD selection drops nodes
  over none of its cells (`S.maskIn`), `S.maskAt` is the twin. A world's water raster gives one per body, so one body never
  shows in a basin that is not its own.
- **A shore window** (`shore: {window, cell, seeds, ...}`): a shore grid of `window` m square that follows the camera,
  open water until its first bake, then re-baked around a point with `WATER.moveShore(S, x, z)` or a slice at a time with
  `WATER.shoreJob(S, x, z).step(ms)` (the flood, the transform and the bytes in the last step; the same bytes as a grid
  baked there: the test checks it). Its box is a uniform (`wtrBedBox`), its texture refreshed in place.
- **`WATER.draw(S, {cdlod: {levels}, origin, hideEmpty})`**: more levels for a far horizon (17: a 524 km root); `origin`
  (a snap in m) stands the mesh at a point near the camera and draws the vertices relative to it, so the view transform is
  taken in doubles (a world a million metres across without the jitter of float world-space vertices; the waves still
  read world coordinates); `hideEmpty` hides the mesh while it selects no node (a world of many bodies issues no empty
  draw calls; `D.active` switches its selection off).

## Flow and falls (Phase 3, `22-core-water-flow.js`, `51-core-water-kinds.js`)

- **`WATER.ribbon(S, {step, across, margin})`**: a flow line's water as a ribbon, a row of `across`+1 vertices every `step`
  m and at every vertex of the line (so the surface falls exactly as the line does: the sloping surface, and it never
  climbs where the line does not), as wide as the channel plus `margin` m a side under the banks, each row turned to the
  bisector at a bend (and stretched to keep its width). Per vertex: the current, the line's slope, the distance to the bank
  (negative under it), the distance downstream. Built as arrays: `KWater.ribbon` builds the same vertices in Godot.
- **`WATER.drawFlow(S, o)`**: the ribbon on one material: ripples **advected** along the current (`WATER.flowNormal`, the
  shader's `wtrFlowN`: two copies of a fixed ripple pattern, each carried downstream for half a phase and cross-faded, 150
  phases per wave period, turned with the current), rougher and white on the rapids (the line's slope, 1.2 % to 7 %) and
  along the banks (`wtrFlowFoam`), paler toward the banks, fading under them. `o.origin` keeps a long river's vertices local.
- **`WATER.curtain(S, {rows, cols})`**: a fall's curtain at equal times of flight down an arc (20's `curtainAt`: a parabola
  from the lip speed) that widens by `spread` m a side at the foot; its normals face out and up.
  **`WATER.drawFall(S, o)`** draws it with streaks that **fall with the water** (`WATER.fallStreak`: a periodic value noise
  fixed to each parcel from the lip, whole cycles per period), whiter toward the foot (`fallFoam`), thinning at its edges;
  its plunge pool (`WATER.plunge`: the foot, radius from the drop) as a disc of churn, rings running out broken by a noise
  that boils (`WATER.plungeAt`); spray from core/atmos's particles where the page has them.
- **`WATER.fallsOf(F, {steep, minDrop})`**: the slope breaks on a flow line, as `WATER.fall` options.

## Still water and wet ground (Phase 4)

- **`WATER.stillMesh(S)`** (a box's two triangles or a polygon's, ear-clipped, facing up either winding) and
  **`WATER.drawStill(S, o)`**: flat at the level, the sky in it, a faint ripple and a fountain's rings
  (`WATER.stillNormal`, `S.normalAt`; `WATER.still({..., fountain: [x, z]})`). **`WATER.stillMaterial(o)`**: the same for
  many small pools a build's own (instanced) meshes hold: their tops take the ripple, their sides keep their normals.
- **`WATER.wetGround(material, {surface, rain})`**: a MeshStandard, Phong or Lambert ground darkens and shines where it is
  wet: the beach a shore surface's swash reaches, and, by the weather's `W.wet` (`WATER.wet()`), every up-facing surface
  (`WATER.wetGroundRain`). A build with its own ShaderMaterial takes `WATER.wetChunk(surface, uniforms)`.

## Proof (`node core/water/test-water.js`)

The test loads core/atmos's wave field and both water files, and runs the GLSL that `WATER.glsl` writes (with the
`atmos_waves` chunk it includes) in a small GLSL interpreter, in doubles, at sample points out to 16 km and times past
1e5 s: the vertex sum, the Newton height, the normal, the Jacobian and the decayed foam all equal their CPU twins (under
1e-9; the GLSL's 3-step Newton height within 3e-7 m), with and without a bed, and stop equalling them for a sea 1 cm or 0.02 steepness off, or a
clock 1 s off. Then the wrap, the inverse, the foam's rise and decay, the bed's bytes (0.7 cm), the CDLOD tiling, levels
and cracks, riding, flow, still, fall, the tide and the export. On a GPU (SwiftShader, the Ring Sea kit, 2026-10-12): the
GLSL `wtrHeight` read back at the 28 hull centres is within 0.06 mm of `WATER.heightAt`, and the mesh as drawn from each
hull's own preset view (the triangle over the hull, from the vertex shader's twin) within 6 mm.

## Godot (Phase 6: notes, not written yet)

*Begun 2026-10-13 (ROADMAP.md stage 2e):* core/export's `water` section carries every surface (`core/export/README.md`,
"Water": the waves in turns, the bed's bytes, WATER's own heights as probes); `godot/krator/water.gd` (`KWater`) is the
open surface's GDScript twin, rebuilt from that record alone and equal to `WATER.heightAt` within 1.1e-14 m
(`godot/tests/water/water_test.gd`, golden from `node godot/tools/water_golden.js`); the shader is a library include,
`godot/shaders/lib/water.gdshaderinc`, the maths of `WATER.glsl` with the waves as uniform arrays rather than generated
literals (one shader for every surface; within 0.5 mm of the twin on a GPU), drawn by `godot/shaders/water.gdshader` on a
regular grid over the tile (`krator/water_import.gd`), not yet the CDLOD selection.

*Phases 2 to 4 in Godot (2026-10-13):* `KWater` is the twin of every new kind from the same record: the shore grid's
distance, shoaling, breakers, foam and beach, and the grid itself rebuilt from the ground's heights (`KWater.shore_grid`:
the flood and the distance transform, to every byte); the flow's height, current, ribbon (`KWater.ribbon`, the same
vertices and triangles) and advected normal; the fall's curtain, streaks and plunge churn; the still pool's normal; the
rain's wetness. `lib/water.gdshaderinc` takes the shore grid (`wtr_has_shore`: the clip, the shoaling, the breakers; the
Phase 1 path is unchanged when it is off); `lib/water_kinds.gdshaderinc` with `water_flow`, `water_fall`, `water_plunge`
and `water_still.gdshader` draw the rest; `water_import.gd` builds their meshes and checks them against the page's
counts and sums. `tests/water/water_test.gd` checks every kind within 1e-9 (in practice 1e-12) with negatives, and that
no lower hollow floods; `tests/shaders/library_gpu_check.gd` reads the shore grid, the shoaled heights (within 1.5 cm) and
lib/water_kinds' functions (within 0.0013) back from the GPU. Not yet in Godot: masks and shore windows (a streamed world:
little-demo has no export), the ground's wet band (`WATER.wetGround`). Below is the rest of the plan.

- **The data side ports as it is** ([G data]): `WATER` becomes a `Water` autoload in GDScript with the same records and
  twins (64-bit, like `Atmos.wave_height`); `test-water.js` grows a golden of `WATER.export()` plus sampled heights,
  normals and foam, and a `godot/tests/water/water_test.gd` checks the GDScript twins against it to 1e-9, as
  `atmos_test.gd` does for the wave field.
- **The shader** becomes `godot/shaders/water_open.gdshader`, generated like `atmos_waves.gdshaderinc` is
  (`node godot/tools/water_open.js` writes it from `WATER.glsl(S)` per surface: `atmWaveT` becomes the global
  `atm_wave_t`, `wtrLevel` a global `wtr_sea_level`, `cameraPosition` `CAMERA_POSITION_WORLD`, `texture2D` `texture`).
  The vertex function is unchanged: `VERTEX = wtrSurface(...)`; the fragment sets `NORMAL`, `ALBEDO`, `ROUGHNESS`,
  `METALLIC`. The sky comes from the `WorldEnvironment` ([G native]), so `envMapIntensity` is the material's specular.
- **The CDLOD mesh** in Godot: the same selection in GDScript feeding a `MultiMeshInstance3D` of one 17 x 17 `PlaneMesh`
  with `INSTANCE_CUSTOM` = `(x0, z0, size, level)`, updated in `_process` from the active camera; or a `GPUParticles`-free
  clipmap if profiling prefers it. The crack condition and the morph are the same numbers.
- **The bed** is an `ImageTexture` from the same bytes (`Image.FORMAT_RGBA8`, linear filter); Phase 2's shore field
  replaces it with a distance texture.
- **A compare test** (WATER.md Phase 6): render a fixed seed and time in both engines and read heights back at the same
  points (`godot/tests/atmos/waves_gpu_check.gd` is the pattern).

## Still to do

- Phase 2: `seaLevel(t)` from `core/clock` (the tide is a record; nothing drives it); the wet band on the grounds of the
  builds that have a shore (their grounds are their own ShaderMaterials: `WATER.wetChunk`).
- Phase 3: a flow field across a whole basin (today a flow is its line); spray and mist from core/atmos where a page has
  no particles; the ripple sim's plunge stamp (Phase 5).
- Phase 4: a taker for `W.wet` (only Voth's page, `settlements/voth`, runs core/atmos's weather, and it waits for the Voth branch).
- Depth-buffer absorption (WATER.md section 3 item 3): water drawn after the opaque pass reading depth.
- Phase 5: the FFT backend, the ripple sim (wakes). Phase 6: Godot (above).
- Phase 1's takers are all in (2026-10-13: Reed Lake, Noah's Regret, Port, Ys, Locus, Mungo, little-demo). Voth
  (`settlements/voth`) waits for the Voth branch (ROADMAP.md section 9).
- More takers of phases 2 to 4: the coasts' beaches (geyser's, Port's, Noah's Regret's: a shore grid from their ground)
  and the wet band on their grounds; the ribbons of girder, mavs-refuge, yuni, shade and verge (flow); the pools of
  jimjam, iziz, dalab, highlands and Erewhon (still).
