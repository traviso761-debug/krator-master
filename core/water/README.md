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
| `geyser/52-core-water-geyser.js` | [G data] | `WATER.spring`, `WATER.geyser`: hot pools with a temperature and mineral colour ramp and geyser columns on a period/duration cycle, their CPU twins (`S.colourAt`, `S.state(t)`), the ramp and the cycle as GLSL text, the particles as plain arrays, export records. Optional, and in the SUBFOLDER `core/water/geyser/` on purpose: many builds pool every numbered `*.js` of `core/water` with `os.listdir`, so a new top-level fragment would leak into all of them. A build opts in by path (`biomes/geyser/build.py`: `CORE_WATER_GEYSER`). Needs core/rand (`KRAND`) for particles and phase jitter |
| `geyser/52b-core-water-geyser-draw.js` | [draw] + [G shader] | `WATER.drawSpring` (the banded disc), `WATER.drawGeyser` (one Points per column), `WATER.thermalUniforms` / `thermalStep` |
| `geyser/test-geyser.js` | | `node core/water/geyser/test-geyser.js [--golden]`: the ramp and cycle GLSL run as text against the twins, the Old Kettle's schedule, determinism, export; `--golden` (`node core/water/geyser/test-geyser.js --golden`) writes `godot/tests/water/geyser_golden.json` |
| `ext/53-core-water-terraces.js` | [G data] | `WATER.terraces` (a stepped river: a still pool per tread, a fall per riser, linked: `T.heightAt`, `at`, `flowAt`, `export`) and `WATER.mergedFalls` (the arrays of many falls in one). Optional, in the SUBFOLDER `core/water/ext/` for the same reason as `geyser/` (a build opts in by path) |
| `ext/53b-core-water-terraces-draw.js` | [draw] + [G shader] | `WATER.drawFalls` (two meshes for any number of falls), `WATER.drawPools` (one mesh for many pools), `WATER.drawTerraces`, `WATER.fallGLSLMerged` |
| `test-gaps.js` | | `node core/water/test-gaps.js`: every new option's default is the old output (snapshots of the shaders' text, the meshes, the materials and the export hashed against `test-gaps.golden.json`, taken from the code of 2026-10-20) and each option, with its negative control (the GLSL against the twins for them is at the end of `test-water.js`) |
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

## Hot springs and geysers (2026-10-20, phase 1 of making every wet thing core/water's)

Two kinds in their own fragments (`geyser/52-core-water-geyser.js` data, `geyser/52b-core-water-geyser-draw.js` drawing; keep every new opt-in fragment in a subfolder, never at the top level of `core/water` or `core/atmos`); list both beside `20` and `50`
and the build is otherwise byte for byte what it was. The geyser kit (`biomes/geyser`, fragment `65-biome-geyser-show.js`) is the first taker.

| Call | Data | Twin | Drawn |
|---|---|---|---|
| `WATER.spring({key, name, x, z, r, level, temp, mineral, milky, boil, kind, steam, tint})` | a **still** surface (poly = the disc's rim: `WATER.at`, `heightAt`, core/export's extent and mesh read it as any pool) with `S.thermal`: `temp` 0..1 (1 boils), the mineral ramp (`'sinter'` silica, `'sulfur'`, `'iron'`, `'copper'`, or `{deep, blue, green, yel, ora, rust}`; `WATER.THERMAL.ramps`), `milky`, `tint`, a steam plan | `S.colourAt(t01)` = `WATER.springColour`: 0 the middle, 1 the rim | `WATER.drawSpring(S, o)` |
| `WATER.geyser({key, name, vents, top, top2, H, style, period, pre, dur, steam, off, wob, pool, cone, mound, world})` | kind `geyser` (wets nothing: `contains` false); style `cone`, `fountain`, `spouter`; `off` a number or a function | `S.state(t)` -> `{phase, water, steam, next, u}`, `S.columnTop(t)`, `S.sprayRadius(t)`, `WATER.geyserParticles(S)` | `WATER.drawGeyser(S, o)` |

**The colour** runs from the middle out: the deep blue of a boiling vent to turquoise out to `m0 = clamp(temp * .78, .08, .86)`, then, as the
pool cools, the mats reach in (green, yellow, orange, rust: Grand Prismatic). A mineral swaps the six stops; a tint multiplies them. The GLSL
(`WATER.springGLSL(ramp)`, `thmColour`) is written from the same stops and bands as the twin; `test-geyser.js` runs that text against
`WATER.springColour` (246 samples, exact).

**GEYSER_STATE** (what a port replays). With `u = ((t - off) mod period)`, `a = pre`, `b = a + dur`, `c = b + steam`:
`u < a` the PRE (surges: `water = .16 max(0, sin(1.9 u + 2 sin(.7 u)))^6 sm(0, .4 a, u) (.5 + .5 u/a)`, `steam = .15 + .2 u/a`);
`a <= u < b` the COLUMN (`v = u - a`, `water = sm(0, 2.5, v) (1 - .3 sm(dur/2, dur, v)) sm(dur, dur - 3, v)`, `steam = 1`);
`b <= u < c` the STEAM (`water = 0`, `steam = .1 + .9 sm(c, b + 2, u)`); then REST (`water 0`, `steam .1`). `sm` is smoothstep with its edges
in the order given (it runs backwards for a falling edge). A spouter never rests: `water = .72 + .28 sin(3.1 t + wob) sin(1.7 t + 2 wob)`,
`steam .35`. The highest drop's apex is `top + H * water`. The shader runs the same text (`WATER.geyserGLSL`), checked against `S.state` to 1e-14,
and against the kit's former `GEYSER.cycle` for the Old Kettle's data. (The kit's `GEYSER.cycle` keeps `water = .04 sm(c, b, u)` in the steam
phase and a position-hash wobble for spouters, neither of which the shader ever drew; it stays for the kit's panel.) The clock `off` of a
kit geyser is read each frame (`GEYSER.erupt` moves it). `godot/tests/water/geyser_golden.json` (`node core/water/geyser/test-geyser.js --golden`)
holds the Old Kettle's record and sampled states, the vectors a Godot twin is tested against; no importer yet (phase 5).

**Particles are data.** `WATER.geyserParticles(S)` gives positions, `aS` (four randoms/size) and `aK` (drop, steam puff, mist) as plain arrays,
each random a `KRAND.hash` of (`KRAND.child(world, key)`, class, vent, index, k): never `Math.random`, never a draw count, so a tile built alone
draws the same column as the full build. Counts come from `S.budget()` (the kit's: more drops and steam for a taller column).

**Drawing.** `o = {THREE, scene, uniforms: {uT, uSun, uSky, uLight, uScale, uWind}, fog, wind, onMaterial, mats, renderOrder, gravity}`; any
missing uniform is made (`WATER.thermalUniforms`). With core/atmos bound and no `uT` given, the clock is `ATMOS.hook`'s `t` and `uLight` follows
`ATMOS.night(hour)`; without, step `WATER.thermalStep(dt)`. The shaders are ShaderMaterials (no `ATMOS.skyEnv`: they carry the kit's `uSky`
tint and a sun glint, as before). One material per ramp (`o.mats`, a Map the page keeps).

**Export.** `WATER.export()` is wrapped: a spring lists as kind `still` with a `thermal` record and its polygon (so the water section has its
extent and mesh sum), a geyser as kind `geyser` with its whole record (its extent is `null` in the adapter: listed whatever the box). Not yet
drawn by Godot's `water_import.gd` (it draws `open` surfaces only and ignores the rest).

**Not here (yet):** mud pots (a grey swelling mud, not water), the run-off sheet and the steam of fumaroles (kit-side); the other takers (below).
Takers still to opt in: Throne station 4 (`85-host-springs.js` has its own `GEY_MAT`/`SPRING_MAT`/mud pots) and station 8 (`86-host-vents.js`),
station 1 (`84-host-ground.js`), `biomes/ringisles` (reads the kit's `GEYSER.build`: rebuilt with it), `openworld/isle-demo` (16 vents, built on
demand: reads the kit; rebuild and verify after this change).

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

## Open gaps (2026-10-20, phase 2 of putting every biome's water on core/water)

Found taking the easy flows and pools of the biome kits (hyperjungle, nhighlands, ebadlands, Throne stations 2 and 6, sedesert). None
needed a core change, and none was hacked in a biome beyond what is said here; each is a thing a next pass on core/water can make a setting.

- **White water is one global preset, not a property of a flow.** `WATER.PRESETS.flow.rapids` (`[.015, .12]`: a grade of 1.5% starts the foam and **Closed 2026-10-21:** `WATER.flow({rapids: [lo, hi]})` (or `drawFlow({rapids})`) is the flow's own band, in its GLSL, its twins (`flowNormal`, `flowFoam` take it as a last argument), its export record and the Godot twin; no `rapids` means the preset, as before. The pages' preset writes can go (below, "Gaps closed").
  the rougher ripple, 12% is full) is read by every `drawFlow` of the page, into the shader's literals and into `WATER.export()`. A mountain
  stream is not a lowland river: nhighlands' stream falls 17% on average and came out white from end to end; the kipuka's streams (3% to 12%) came out
  mottled. Both pages now set the preset before drawing (`89w-host-water.js`: `[.2, 1]` and `[.1, .3]`). Fine while a page has one kind of
  flow; a page with a brook and a torrent needs `rapids` on the flow record (and in its export) instead.
- **Big drops are a chute, not a curtain.** A step in the bed that the flow line follows (nhighlands: 23 m and 30 m over a 12 m and a 24 m run, a **Closed 2026-10-21:** `WATER.fallsOf` returns each fall's `foot` `[x, z, y]` and `run`; `WATER.fall({foot, fit: true})` (`fallsOf(F, {fit: true})` sets it) fits the speed to `run / tFall` so the curtain lands on the foot; a 70 m drop and a 30 m drop are tested.
  grade of 2.5:1) is `WATER.fallsOf`'s fall, but the curtain leaves the lip at the flow's speed (about 1 to 4 m/s here) and lands a few metres out,
  inside the bank, while the ribbon runs on down the chute. The page raises the fall's `speed` to run / sqrt(2 drop / g) so it lands at the chute's
  foot. A fall that takes the line's own run (and so a flow that stops at the lip and starts at the foot, or a curtain fitted to the ribbon) would
  need no such fitting.
- **A still pool has one colour.** `WATER.drawStill` / `stillMaterial` take one colour: no tint from the middle to the rim, nor from the depth. **Closed 2026-10-21:** `WATER.still({gradient: {centre, rim, power, at, radius}})` runs the colour from the middle out (`S.gradientT`, the shader's `wtrStillT`), `drawStill({tint})` multiplies it; `WATER.open({tint})` is a baked per-cell tint field over an open surface (below).
  Per-pool tints work (one `drawStill` per pool, as ebadlands' six acid pools and savanna's sixteen): the gradient inside a pool does not (nhighlands'
  tarn was peat at the rim and deep at the middle: one mean colour now). `WATER.spring` (geyser/) has the ramp, with a temperature, but is for hot
  pools and lives in an opt-in subfolder.
- **The inspector cannot click core/water's water.** `tag()` (51) sets `raycast` to a no-op and `probeSkip` on every mesh it draws, so a page's click-to-inspect **Closed 2026-10-21:** every drawing takes `pick: true` (no no-op raycast, no `probeSkip`, `userData.inspectLabel` = the surface's name); the open surface, whose grid has no shape, gets a ray cast at its level plane refined by `heightAt`.
  stops naming the brook, the stream, the pools, and the probe's registered-volume occupancy loses the pool's own mesh (Throne's savanna failed
  `registered-volumes-non-empty` until each pool kept an invisible flat disc). A `pick: true` option that keeps a ray on the surface would remove the discs.
- **No mist/spray emitter of a flow's own**: a fall's plunge can emit core/atmos's `spray` (`drawFall` `spray: true`); a river's rapids and a **Closed 2026-10-21:** `drawFlow({spray: true | {every, min, max, lift}})` places core/atmos's `spray` emitters at the steep reaches (`WATER.sprayPoints`).
  stream's mist stay page sprites.

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

## Open gaps (phase 3, swbay, swlowlands, nwlowlands: seas and lakes; 2026-10-20)

Found taking the lowland seas (`biomes/swbay`: the bay, a flow river, 37 falls, an outer sea; `biomes/swlowlands` and `biomes/nwlowlands`: the sea or lake, the bayou, the delta, the river). None needed a core change; each is a setting a next pass could add.

- **An open surface has one tint pair.** `WATER.draw`'s `shallow` and `deep` mix over a fixed `smoothstep(0.5, 9, depth)`: no pale sand shoals, no fresh-water tint where a river enters a bay, no tea-dark bayou in a sea's bed, no ramp that reaches its deep colour at 4 m. swbay's vertex-coloured plane had all four. Workaround: one tint pair for the bay (shallow a third of the way to the old mid colour, deep three quarters of the old deep: the lit, tone-mapped standard material brightens a tint, so the old unlit colours are written darker), and in the lowlands a SECOND open surface for the inland water. The river's fresh tint at swbay's delta and the pale shoals are lost. A per-surface `tint(x, z)` (or a `ramp: [[depth, colour], ...]` and a `tintMask`) would keep them. **Closed 2026-10-21:** `WATER.open({tint: {box, cell, at(x, z) -> null | colour | {c, a}}})` bakes a premultiplied RGBA tint field over the box (or `{x0, z0, cell, nx, nz, data}` bytes), blended over the depth ramp in the fragment (`S.tintAt`, `wtrTintAt`, the export's `tint` with its bytes); `draw({ramp: [a, b]})` sets the depths over which shallow turns to deep (default `[0.5, 9]`). A bayou that fades into a sea over a distance, a plume, pale shoals: one surface, a gradient in the alpha.
- **Two bodies of different colour on one level need two masked surfaces, and the tint then changes at a hard edge.** swlowlands and nwlowlands drew the sea, the bayou, the delta and the river's lowland reach in one plane whose colour blended over 90 m of shore and 200 m of delta plume. Now `mask` (16 m cells, complementary bytes, so no cell is drawn twice) splits an open sea with a shore grid from a flat bed-less inland surface; the tint steps at the mask edge (the shoreline, and a 45 m wide plume off the delta). A `blend` over the mask's bilinear weight (alpha, not a discard) would soften it. **Closed 2026-10-21:** the tint field's alpha is the soft blend this asked for (no discard); a page may keep its second masked surface for geometry that differs (a different bed or swell), and drop it where only the colour differed.
- **A bed-less open surface is a flat colour.** `WATER.draw` without a bed has no depth tint and no surf (it needs `S.bed`), so the inland water is `color` only; and a bed brings surf foam wherever the water is under 1.4 m (`o.surf` is the lap's cycles, not its strength), which on a river or bayou with shallow edges would lap white bands, so the inland surfaces take no bed. A `foam: false` option would let a bayou take a bed's tint and its shore clip without the lap. **Closed 2026-10-21:** `draw({surf: false})` removes the white lap bands (`surfDepth` n or `[lo, hi]` bounds them, default `[0.1, 1.4]`), so a bayou may take a bed (its depth tint, its shore clip) without them; the tint field also colours a bed-less surface.
- **The bed is read at cell centres; the page can feed the same array twice.** `bakeBed` and `shoreGrid` call `bed(x, z)` at `box0 + (i + .5) cell`, so a page that already holds the ground in a `Float32Array` at that cell (the lowlands bake terrainH once at 8 m over 6.6 km, 680k samples, and cut the mask's 16 m cells from the same array) can hand `bed` a lookup instead of a second terrainH sweep. Worth saying in the contract (`WATER.open`). **Closed 2026-10-21 (recorded):** the contract is in the API note below: `bed(x, z)` is called at cell centres, so a page holding the ground in an array at that cell hands it a lookup.
- **Falls: two draw calls each, nothing merged.** swbay's river is a staircase of 37 five-metre steps (`WATER.fallsOf({steep: .3, minDrop: 3.5})`): each `drawFall` is a curtain mesh and a plunge mesh, 74 draw calls in a page whose ceiling is 400. The page draws only the ones within 900 m of the camera (`mesh.visible` per frame). One `drawFalls(list)` that builds one geometry (a curtain per record, one plunge per record) and one material would cost two calls however many steps. **Closed 2026-10-21:** `WATER.drawFalls(list, o)` (the fragment `core/water/ext/53b`; the data `WATER.mergedFalls` in `ext/53`) draws any number of falls as two meshes: the curtains in one, the plunge discs in the other (the streak's lip scale and fall time, and the plunge's centre and radius, are vertex attributes in place of literals). Opt-in by path; `drawFall` is unchanged.
- **`fallsOf` gives the lip and the drop, not the foot.** To land a curtain at the foot of a chute the page needs the chute's run; `fallsOf` has it (`P[j]`) and does not return it, so the pages re-find the lip in `F.pts` and re-scan (nhighlands by matching `y`, which fails when the line holds a level over a flat stretch: swbay matches the lip midpoint's x and z). A `foot: [x, z, y]` and `run` in each fall record would remove that. **Closed 2026-10-21:** it now gives `foot` and `run` (see the phase 2 entry).
- **Rapids are still one global preset** (the phase 2 gap): swbay set `[.06, .14]` (the old foam cards' band), swlowlands and nwlowlands `[.08, .3]`. **Closed 2026-10-21:** per flow.
- **No click-to-inspect on the water** (the phase 2 gap: `raycast` is a no-op): swbay's bay, river and outer water had `inspectLabel`s and a ray hit; the labels are kept on the new meshes but nothing picks them. **Closed 2026-10-21:** `pick: true`.
- **A far sea under a near one**: swbay's outer water is a second open surface (`swell: []`, `field: 0`, level -.15, `mask` of 50 m cells open everywhere but 60 m inside the bay's box) so the CDLOD does not draw fine nodes twice; it works (not measured separately: both surfaces select nodes for the one camera), but a surface with a rectangular hole would say it in one line. **Left as a page choice 2026-10-21:** not a gap in core/water after all: left as a page choice (a mask with a hole is what `mask` already is); not changed.

## Open gaps (phase 3, Throne frontier/ringisles)

Found putting the Throne's frontier (the Ring Sea and bay on `WATER.open` with a shore grid, two streams on `WATER.flow`) and biomes/ringisles (a shore grid on the existing sea, 22 pools on `WATER.still`) on core/water (2026-10-20). None needed a core change.

- **A shore grid has no tiling: its cost is the box.** `WATER.open({shore: {cell}})` samples the bed at every cell of `bedBox` on the load thread and runs two distance transforms: the frontier's 3680 x 6760 m box at 8 m (390 k cells) and ringisles' 4300 x 3100 m at 6 m (370 k) each take about 0.8 s on a real GPU machine, but a 6 m cell over the frontier's whole 6.8 km would be 1.3 M. Both pages cut the box to where water can be (the frontier's sea lies west of x = 300 whatever z) and take 6 to 8 m cells, which is coarse for a metre-wide surf line. The shore window (`shore.window`, `shoreJob`) is the answer for a bigger sea but needs a taker that moves it with the camera; neither page did, because the sea is a fixed hand-sized box. **Closed 2026-10-21 (in part, see "Gaps closed"):** no multi-tile shore texture was written. What shipped: `seeds: 'edge'` (no hand-sized box needed to find a sea), the grid as a job (`WATER.shoreGridJob`: sampling, flood, each transform and the bytes in separate steps a host can spread over frames) and `WATER.shoreJob(S, x, z, {staged: true})`, with the existing shore window for water too big to grid whole.
- **Seeds are points, so a page must know a sea point.** Both pages seed the flood by hand (the frontier: the bay's centre and a point at u = -3000; ringisles: the box corners that lie deep). A `seeds: 'edge'` (every deep cell on the box's rim) would do for a sea. **Closed 2026-10-21:** `seeds: 'edge'` or `{edge: true, depth, sides, points}`.
- **A flow has one width.** `WATER.flow({width})` is a number: the frontier's streams were ribbons 2 (5 + 2 sin) m wide (6 to 14 m, breathing along the valley) and are now a flat 10 m; the kipuka's came out the same way (2.3 w). A `width: [[s, w], ...]` profile along the line would keep them. **Closed 2026-10-21:** `width` (and `speed`) are a number, a per-point array, a profile `[[s, w], ...]` over the metres along the line, or a function `(s, i) => w`; `densify: m` adds points so a profile that breathes faster than the line's vertices is drawn as it is.
- **`wetGround` composes with a page's own `onBeforeCompile`, but only if it is called after the material is defined** (it wraps the previous hook). Both pages call it from the sea's fragment (89w), which loads after the ground (84): worked for a MeshLambertMaterial with the page's own detail layers. A ground made after the call would lose it. **Closed 2026-10-21:** order-independent: the material's `onBeforeCompile` becomes an accessor; a hook the page assigns after the call is the one that runs first, the wet chunk always after.
- **A still pool is one colour and ignores night** (as phase 2 found): ringisles' pool tints are set per light mode by the page through `d.material.color`. **Closed 2026-10-21 (colour):** the gradient; per-pool night tints through the material colour stay the page's way (a frozen-water kind is out of scope: recorded only).


## Open gaps (phase 3, rift/eastabyss)

Found putting the Rift's algal lake and streams (`biomes/rift`) and the East Abyss's salt lake, marsh pools and rivers (`biomes/eastabyss`) on core/water (2026-10-20). No core change; the workarounds are in the two biomes' `src/89w-host-water.js`.

- **An open surface always laps a surf where the bed is under 1.4 m.** `WATER.draw` writes white bands over `wtrDp < 1.4` (`o.surf` only sets their speed), right for a sea's beach and wrong for a still lake's rim or a marsh's pools: the Rift's lake came out with a striped foam rim from every camera. Both biomes clamp the baked bed at 1.4 m (`bed: (x, z) => Math.min(terrainH(x, z), -1.4)`), so the baked depth is wrong inside the last 1.4 m of the shallows. A `surf: false` option (or the shore field's own surf only) would remove the lie. **Closed 2026-10-21:** `surf: false`, `surfDepth`; the biomes can bake the true bed.
- **A surface has one depth ramp (shallow to deep) and no other tint.** The old plane's vertex colour carried pale shoals, scum mats, a salinity change and a river colour; now a body of a different colour is a body of its own (a masked open surface, a flow). The pale shoals and scum patches of the Rift's lake, and the East Abyss's salt shoals, are gone from the water (the floor's scum mats and lily pads still float on it). A tint field over a surface (`tint: (x, z) => colour`, baked like the bed) would bring them back. **Closed 2026-10-21:** `ramp` and the `tint` field.
- **A flow ribbon at an open surface's level fights it.** The streams and rivers cross water that is also open surface (the lake, the marsh pools) at the same y; both pages lift the ribbons .1 m. A mask that can exclude a flow's channel, or a ribbon option that cuts the open surface under it, would remove the 10 cm ledge where a river meets its lake. **Closed 2026-10-21:** `drawFlow({depthBias})` / `draw({depthBias})` (polygon offset; `depthWrite` overrides the policy), so a flow sits AT the level.
- **A river with forks is several flows.** A `WATER.flow` is one line, so a delta (the East Abyss: two rivers, each with two side channels) is six lines, six draws and six surfaces in the export, with ribbons overlapping where a channel leaves its river. Junctions in the record would draw them as one. **Still open 2026-10-21:** not part of this pass (junctions in the record).
- **A flow follows the bed up a slope, not a level.** The East Abyss's east river climbs 3 km of hills at bed + .5 m (the old ribbon's line), so its line rises and falls with the bed's noise; the slope the ribbons read (and the export carries) is negative where it rises. The sedesert river instead holds its level where the bed rises; that would be a gap under the bed here. **Still open 2026-10-21:** a flow that holds a level over a rising bed was not part of this pass.
- **A big masked surface bakes its bed at load.** The marsh's 2750 x 7480 m box at a 10 m cell is 200,000 `terrainH` calls (the lake's, at 8 m, 160,000): measured on the GPU machine 234 ms for the marsh's bed, 174 ms for the lake's and 66 ms for the marsh's mask, about half a second of load (the page's `_buildMs` is 9 to 24 s without it). A coarser bed over a mask would do for pools that are tens of metres wide; the bed texture reads at 8 to 10 m either way. **Closed 2026-10-21 (partly):** `WATER.shoreGridJob` spreads a shore grid's bake; a masked surface's plain `bakeBed` is still one call.


## Gaps closed (2026-10-21): the options, all off by default

Every option below reproduces the previous output exactly when it is not given (`node core/water/test-gaps.js` hashes the shaders' text, the meshes, the materials and the export of 33 default cases against a snapshot of the code as it stood). Where a record changes it changes only for a surface that uses the option (`WATER.export()` lists it; the Godot twin reads it or ignores it).

| Option | Where | What |
|---|---|---|
| `WATER.flow({rapids: [lo, hi]})`, `drawFlow({rapids})` | 20, 22, 51 | this flow's white-water band on the line's slope (default `PRESETS.flow.rapids`); `WATER.flowGLSL(rapids)`, `flowNormal(..., t, rapids)`, `flowFoam(slope, bank, rapids)`; export `rapids` on a flow that has one |
| `WATER.flow({width, speed})` | 20 | a number, a per-point array, a profile `[[s, v], ...]` over metres along the line (linear, held past its ends), or `(s, i) => v`; `densify: m` first puts a point at least every `m` metres (a per-point array spreads over the original points); a short array holds its last value |
| `drawFlow`, `draw`, `drawStill`, `drawFall`, `stillMaterial`: `depthBias`, `depthWrite` | 50, 51 | `depthBias: n` (or `[factor, units]`, `{factor, units}`) is polygon offset toward the camera by `n` (negative pushes back), so a flow can sit AT an open surface's level; `depthWrite` overrides the drawing's policy. A flow's choice is `ribbon.depthBias` in the export, an open surface's `draw.depthBias` |
| `draw({surf: false})`, `surfDepth`, `ramp` | 50 | `surf: false` removes the lap's white bands over the shallows (the depth tint and the shore clip stay), `surfDepth: n` or `[lo, hi]` sets their depth band (default `[0.1, 1.4]`), `ramp: [a, b]` the depths over which shallow turns to deep (default `[0.5, 9]`); with the lap off a page bakes the TRUE bed (the two biomes that clamped it at 1.4 m can stop). Non-default choices are the export's `draw` record |
| `WATER.open({tint})` | 20, 50 | a per-cell tint field: `{box, cell, at(x, z) -> null | colour | {c, a}}` baked to premultiplied RGBA bytes (or `{x0, z0, cell, nx, nz, data}`), a texture uniform `wtrTint`, one line in the fragment after the depth ramp (`colour*(1-a) + rgb`); `S.tintAt`, GLSL `wtrTintAt`; export `tint {x0, z0, cell, nx, nz, bytes}`. A bayou fading into a sea over a distance is alpha 1 to 0 over a ramp in `at` |
| `WATER.still({gradient})`, `drawStill({tint})` | 20, 51 | `gradient: {centre, rim, power (1), at (vertex mean), radius (farthest vertex)}` (hex colours): t = (distance / radius)^power from the middle out, `S.gradientT`, GLSL `wtrStillT`, export `gradient`; `tint` is a hex multiplier on the colour |
| `pick: true` on every drawing | 50, 51, ext | the mesh keeps a ray cast and no `probeSkip`; `userData.inspectLabel` = the surface's name. An open surface's ray cast is the plane at its level, refined three times by `heightAt` and kept if `contains` (the CDLOD grid has no shape to hit) |
| `WATER.fallsOf` | 22 | each fall also gets `foot: [x, z, y]` and `run` (m from the lip to the foot along the direction); `fallsOf(F, {fit: true})` adds `fit: true` |
| `WATER.fall({foot, fit})` | 20 | records `foot` and `run` (export `foot`, `run`); `fit: true` sets `speed = run / tFall` so the arc lands on the foot |
| `W.curtainRows(S, {rows, rowStep})`, `drawFall({rowStep})` | 22, 51 | `rowStep: m` of drop per row gives at least that many rows (28 stays the default; a 70 m cataract at 28 rows is 2.5 m a row) |
| `drawFlow({spray})`, `WATER.sprayPoints(F, {every (40), min, max (24), lift (1)})` | 22, 51 | emitters of core/atmos's `spray` where the slope is over `min` (default the middle of the flow's band), at least `every` m apart, in line order (no random draw) |
| `seeds: 'edge'`, `{edge: true, depth (2), sides ('wesn'), points}` | 21 | the flood seeds from the cells on the box's rim at least `depth` m under the level, on the named rims, plus `points`; also for a shore window |
| `WATER.shoreGridJob(o)`, `WATER.shoreJob(S, x, z, {staged, ms})` | 21 | the shore grid as stages (sampling a row at a time, the flood, each transform, the bytes): `J.step(ms)` runs until the budget is spent (a stage is never cut), `J.step(0)` one stage, `J.step()` all; `J.left()`; `J.G` when `J.done`. `WATER.shoreGrid` is `J.step()`. The bytes are the same however it is spent. `shoreJob` with `{staged: true, ms}` spreads the finish too (unstaged it finishes in the call that has the last sample, as before) |
| `WATER.wetGround(mat, {surface, rain})` | 51 | order-independent: it makes `mat.onBeforeCompile` an accessor, so a hook assigned before or after the call runs first and the wet chunk after it |
| `WATER.terraces({name, line, treads | levels, width, riser, speed, spread, treadSpeed, step})` | ext/53 | a stepped river: a `WATER.still` polygon per tread (the line's ribbon, following bends) and a `WATER.fall` per riser (lip across the line at the top of the riser, `foot` on the next tread's level, speed fitted). Returns `T` with `pools`, `falls`, `treads`, `risers`; `T.heightAt(x, z)` (the level on a tread, linear down a riser's face, null off the water), `T.at`, `T.contains`, `T.flowAt`, `T.export()`; `WATER.heightAt` and `WATER.flowAt` ask `WATER.groups` when no surface holds a point; the export lists `groups`. Refuses levels that do not descend, overlapping or empty treads, and risers longer than the line |
| `WATER.drawFalls(list, o)`, `drawPools(list, o)`, `drawTerraces(T, o)`, `WATER.mergedFalls(list, o)` | ext/53, 53b | many falls in two meshes (curtains, plunge discs: the streak scale and fall time, the plunge centre and radius, as attributes), many pools in one; a staircase of 37 steps costs two calls and a stepped river three or four instead of 2 per step and 1 per pool |

**`WATER.open({bed})` reads the ground at cell centres** (`bed(x, z)` at `box0 + (i + .5) cell`, for `bakeBed` and `shoreGrid` alike), so a page that already holds the ground in an array at that cell hands `bed` a lookup instead of a second sweep.

**What did not ship.** (1) A tiled shore grid (several textures chosen per fragment) is not written: the box is still one grid, and the answers are the shore window (`shore.window`, which a camera-following host moves with `shoreJob`), `seeds: 'edge'` for finding the sea, and the staged job so a load does not stall. A page whose water is bigger than a few hundred thousand cells at its cell size still has to window it. (2) A frozen-water kind is out of scope (recorded here only). (3) Forks and junctions in a flow record, a flow holding a level over a rising bed, and a far sea under a near one with a rectangular hole stay as the phase 3 entries say. (4) Godot: `KWater` is the twin of `rapids`, `foot`/`run`, `gradient`, `tint` and the edge seeds (`godot/tests/water/gaps_test.gd`, golden `node godot/tools/water_gaps_golden.js`); `water_import.gd` ignores the new fields (it draws what it drew), and does not draw the tint field, the gradient, the terraces (their pools and falls are ordinary `still` and `fall` records and are drawn as such) or the merged meshes (a port builds its own batching).
