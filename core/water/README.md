# core/water: one module for every wet surface

Every sea, bay, lake, river, fall, pool and wet street in Krator is meant to come from here: a build names the **kinds** of
water it has and writes no water shader of its own. The plan, the audit of the thirty-nine builds that draw water and what
was taken from Halcyon are `core/atmos/WATER.md`; this file is the contract.

**Status (2026-10-12): phases 0 and 1 of `WATER.md` section 5.** The data side and its CPU twins for all six kinds, and the
drawing of **open** water (the CDLOD mesh, the shared wave field, the sky in the water, Jacobian foam). Its first takers are
`kits/ringsea` (the roadstead; the kit's Gerstner swell, `rsSeaH` and `rsRide` moved in here) and `biomes/geyser` (the Ring
Sea off the basin's beach). Shore, flow, fall, still and wet are recorded (their data and twins work and are tested) but not
drawn yet: phases 2 to 4.

**Phase 1's other takers (2026-10-13):** `settlements/reedlake` (the lake: no swell of its own, a calm share of the field
so the kit's baked canoes and islands keep their waterlines, the old lake map's ripple as the detail normal map;
`src/90w-rl-lake.js`); `settlements/noahs-regret` (the Ring Sea off the south shore, the basin and the flooded holds: the
whole field as before, no trochoids while the floats are baked, the bed from `terrainH` with the hull's ground;
`src/82-nr-water.js`); `settlements/port`, the Ancient Port kit (the sea along the coast: a calm
share of the field while the vessels are baked, the bed from the stamped ground, the depth tint still painted on the
seabed under the part-transparent water, dry pits cut out; `src/71w-port-sea.js`, which Ys vendors); `settlements/ys` (the port's sea, vendored, under the drowned city; its own
sky copy in the water, a flat pick plane named `sea`).

| File | Tag | What |
|---|---|---|
| `20-core-water.js` | [G data] | `WATER`: the presets, the six kinds as records, the CPU twins, `heightAt`, `flowAt`, `seaLevel`, `ride`, `export`. No THREE, no DOM |
| `50-core-water-draw.js` | [draw] + [G shader] | the CDLOD selection (`WATER.cdlod`, data), the GLSL chunk written from a surface (`WATER.glsl`), `WATER.draw` (the open-water mesh and material), `WATER.shaderOn` |
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
| **shore** (the band within ~100 m of land) | `WATER.shore({name, of, band, land})` | the open surface it edges, the band | its open water's height | Phase 2: the distance field on `core/mask`, shoaling, the breaking lip, swash, wet sand |
| **flow** (river, stream, creek, canal) | `WATER.flow({name, pts or river, width, speed})` | a line `[[x,z,y],...]` or `KRELIEF.river`'s `[{x,z,y,slope}]`, width and speed per point or for all | `S.flowAt` `[vx, vz, speed, slope]`, `S.heightAt` (the line's surface) | Phase 3: one flow shader, advected normals |
| **fall** (waterfall, cataract, spillway) | `WATER.fall({name, lip, dir, speed, drop, plunge})` | the lip, the direction and speed the water leaves it, the drop | `S.curtainAt(u, f)`: the curtain ARCS (a parabola from the lip speed) | Phase 3 |
| **still** (pools, fountains, troughs, moats) | `WATER.still({name, level, bounds or poly})` | a level over a box or a polygon | `S.heightAt` = the level | Phase 4 |
| **wet** (ground after rain) | `WATER.wet()` | the weather's `W.wet` (core/atmos 4-weather) | 0..1 | Phase 4 |

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

## Still to do (phases 2 to 6)

- Phase 2: the shore distance field (jump flood on `core/mask`), shore waves, wet sand; `seaLevel(t)` from `core/clock`.
- Phase 3: the flow field from `KRELIEF.river`, one flow shader, falls that arc, plunge pools, spray from atmos.
- Phase 4: still water and `W.wet`.
- Depth-buffer absorption (WATER.md section 3 item 3): water drawn after the opaque pass reading depth.
- Phase 5: the FFT backend, the ripple sim (wakes). Phase 6: Godot (above).
- The other takers of Phase 1 (`WATER.md` section 5) still to come: little-demo, Locus, Mungo. (Taken 2026-10-13: Reed Lake, Noah's Regret, Port, Ys.)
  Voth and Streetlab wait for the Voth branch (ROADMAP.md section 9).
