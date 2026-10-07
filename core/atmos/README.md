# core/atmos: the atmosphere and street-dressing module

Evening lights, a glow layer, particles, weather, ivy and window boxes, sewer grates, street lamps and fountains,
InstancedMesh culling, **the open-water wave field** and **the sky's light on standard materials**. The pieces are
portable: each fragment is a closure that adds to one global, `ATMOS`, and declares nothing else at top level. It has
its own PRNG and never touches a host's stream. It needs only three.js r128 and the five things a host passes to `init`.

**Users:** the Iziz city takes all of it (`settlements/iziz/targets/city/90c-city-atmos.js`); Voth takes the wave field
for its bay; Girder takes the sky's light for its library-textured families. Voth's and Girder's
`src/90-atmos-host.js` are the worked examples of a 21-sky.js-lineage binding (below). **A new build with open water or
standard materials takes these instead of writing its own:** one water shader and one sky-light path for every world.

## Taking it into a build

Add the `89-atmos-*.js` files to the build's fragment list. Iziz's `build.py` does it per target with
`TARGET_CORE = {'city': ['atmos']}`. If the build checks shared-scope names, mark `89-atmos-` as scoped: it is IIFE-scoped,
like the biome core. Then, once the scene, camera and frame loop exist:

```js
ATMOS.init({THREE, scene, camera,
  hour: () => myHour,                 // 0..24, the module's clock
  onFrame: fn => myFrameHooks.push(fn),   // the host calls fn(dt) every frame, dt in seconds: the module reads no wall clock
  ground: (x, z) => terrainH(x, z),   // ground height for anything placed on it
  seed: 1234, err: msg => console.warn(msg),
  viewH: () => innerHeight,             // the view's height in CSS pixels
  pixelRatio: () => renderer.getPixelRatio()});   // sprites are sized in framebuffer pixels: pass it, or HiDPI shrinks them
ATMOS.weather({reduceMotion, apply: W => {/* the host's fog, sun, ground */}});   // reduceMotion: no lightning flashes
// ...place things (below)...
ATMOS.finish();                       // bakes the instanced sets and builds the glow layer
ATMOS.cull(scene, {keep: m => m.userData.biome});   // optional, last
```

**A 21-sky.js-lineage build** (Voth, Girder, Mav's Refuge, Locus, Yuni) takes it in four steps, as Voth and Girder do:
1. `build.py`: `ATMOS_DIR = <root>/core/atmos` in the loop that adds core directories (beside `LOD_DIR`), and
   `DETERMINISTIC |= {f for f in os.listdir(ATMOS_DIR) if f.startswith('89-atmos-')}` (the files open with no `reseed`).
2. `src/90-atmos-host.js`: an `ATMOS_HOOKS` array, `function atmosFrame(dt)` calling each, and `ATMOS.init({..., onFrame:
   fn => ATMOS_HOOKS.push(fn), hour: () => skyHour(), ground: terrainH})`; then `ATMOS.waveUniforms(...)` and/or
   `ATMOS.skylight({...})`.
3. `80-camera.js` `frame()`: `atmosFrame(dt)` last, just before drawing, so a sky capture sees the frame as drawn.
4. The first `frame()` call must come after fragment 90 (`98-start.js`): a material that includes `<atmos_waves>`
   cannot compile before `init` registers the chunk.

Everything it makes goes under one group, `ATMOS.root`. Sprites, beams and rain have their raycasting switched off and
carry `userData.probeSkip`. `ATMOS.stats` counts what was made.

## Presets, the clock, the wind, export

- **`ATMOS.PRESETS`** (`0p-presets`) holds every effect's numbers: sizes, rates, alphas, colours (display-space `[r,g,b]`),
  the wind and the evening's hours. The shaders read them. Change a value before placing the effect.
- **`ATMOS.clock`**: the module's own time, from 0 at `init`, advanced by the host's `dt`. `clock.scale` speeds it up or
  stops it; `clock.fixed = t` pins every shader and hook to time `t` (repeatable screenshots). Hooks get `(t, hour, dt)` in
  clock seconds. It becomes a view onto the host's world clock (`GODOT-PLAN.md`, Phase 1, "The world clock").
- **The wind** is `ATMOS.windBase` (from the preset), veering slowly, times `ATMOS.windScale` (the weather sets it: storm
  2.4x). Gust fronts travel downwind: `atmGust`/`atmWind` in GLSL, `ATMOS.gust`/`ATMOS.windAt(t,x,z)` in JS. Smoke, fog
  banks, rain, banner cloth and brazier flames all ride it.
- **Haze**: searchlights, spot cones and beacons read stronger in fog and rain (`ATMOS.haze()`), and halos swell.
- **`ATMOS.export()`** returns everything placed as JSON (presets, effect records `ATMOS.fx`, lamps, glows, prop sets);
  `ATMOS.download(name)` saves it. `GODOT.md` is the contract and the port plan.
- **Engine-neutral by fragment.** `0`, `0p`, `4` and `8` touch no browser API (`tools/check_port.py` holds them to it);
  `a` (waves) touches none either and is tagged [G shader]: its chunk becomes a `.gdshaderinc`.
  The browser lines are in `9-host` ([web]): the Weather selector and the download. They move to `core/host/`.
- **`node core/atmos/test-atmos.js`**: the evening, light hours, the weather state machine, the flash, the gusts, the
  GLSL agreeing with the JS, and a fingerprint of a small street's export. Run it after any change here; the fingerprint
  changes only when what the module places or exports changes (then take a screenshot diff and update `GOLD`).
- **`ATMOS.sprites(name, attrs, material)`** makes a sprite cloud of camera-facing quads (not GL points). Particle
  shaders compute `mv` and a pixel size `ps`, end with `gl_Position = atmQuad(mv, ps)`, and read `vUv` in the fragment.

## Calls

| Fragment | Call | What |
|---|---|---|
| `0-core` | `init`, `finish`, `hook(fn(t,hour,dt))`, `clock`, `windAt`, `gust`, `haze`, `rec`, `sprites`, `stream(seed)`, `litAt(h,on,off)`, `night(h)`, `glowAdd(x,y,z,[r,g,b],size,on,off)`, `set/put` (instanced sets), `rnd/rr/pick/seed` | the binding and the clock. A light's `on`/`off` are hours: on in the evening, off next morning (off may be past 24). `on<0` follows the night; `on=0` is always lit |
| `1-street` | `lamp(x,z,o)`, `lampRow(pts,o)`, `planter(x,z,ry)`, `banner(x,z,bearing,hex)`, `fountain(x,z,o)` | boulevard lamps (the evening runs down a row; each head goes in `ATMOS.lamps`), timber planters, banner poles whose cloth swings and ripples in the wind, stone fountains with moving water |
| `2-lights` | `sweepBeam(x,y,z,o)`, `spotCone(x,y,z,dir,o)`, `beacon(x,y,z)`, `brazier(x,y,z)`, `floodLight(x,y,z,o)`, `buildGlow()` | searchlights (sweeping, or `sky:true`), fixed spot cones, a rotating beacon, braziers, scheduled PointLights (keep these to a handful), and the glow layer over every light |
| `3-particles` | `smoke([[x,y,z,kind]])`, `fireflies(centres,o)`, `mistRing(rFn,o)`, `fogBank(points)`, `moths(o)` | chimney smoke / steam / spray (kind: a `PRESETS.smoke` name or 0/1/2), fireflies at night, mist round a closed curve (a moat), fog banks for foggy weather, moths round the lit lamp heads (`ATMOS.lamps`; their own seed stream) |
| `4-weather` | `weather({ui, apply(W), ash, snow})`, `strike()` | modes auto / clear / rain / storm / fog. Rain streaks follow the camera, lightning comes in storms. `W.rain/fog/wet/flash` ease each frame, and `apply(W)` is where the HOST changes its own scene: fog density, sun, wet ground. **Ash (opt-in, `ash:true`)**: two more modes, `ashfall` (ash sifting down) and `ash` (an ash storm, from Voth's: flecks driven by a gale, veils of ash racing along the ground, warm volcanic lightning, haze) and `W.ash` / `atm_ash`; a host that does not ask sees the old modes and `W.ash` 0. **Snow (opt-in, `snow:true`, 2026-10-06, the Throne's glacier)**: `snowfall` and `blizzard` (flakes driven by a gale, streaks of blown snow, spindrift on the ground, a white-out), `W.snow` / `atm_snow`; drawn by the same function as the ash (`flakeWeather`, its own preset); no lightning |
| `5-dress` | `boxIndex(meshes)`, `dressBuilding(idx,b,o)`, `ivy`, `ivyClump`, `windowBox`, `cistern`, `windowBoxesOnPanes(im,o)` | an exact ray index over box instances. A building's real walls take ivy, its flat roof a cistern, and window panes get flower boxes under them |
| `6-sewer` | `outfall(x,y,z,ry,o)`, `drain(pts,o)`, `inletGrate(x,y,z,ry)` | a culvert with an iron grate in a wall face, a trickle down to the water, a grated drain channel, an inlet grate |
| `7-cull` | `cull(scene,o)` | splits big static InstancedMeshes into bearing sectors and bounds every set by its instances, so r128 can frustum-cull them. Raycasts still test each instance correctly |
| `8-export` | `export()` | the whole placed atmosphere as JSON for a game engine (`GODOT.md`) |
| `9-host` | `weatherUI(el)`, `download(name)` | [web]: the Weather selector and the JSON download |
| `a-waves` | `waveUniforms(u)`, `waveGLSL()`, `waveHeight(x,z,t,chopW)`, `waveSlope(x,z,t,camDist)`, `waveWrap(t)`; GLSL `#include <atmos_waves>`: `atmWaveHeight(xz,chopW)`, `atmWaveSlope(xz,camDist)`, `atmWaveNormal(xz,camDist,k)` | the open-water wave field (`PRESETS.waves`, from World of ClaudeCraft, MIT): chop, mid waves and swell in sets, on the module clock wrapped at a whole number of cycles. Displace with the swell only unless the mesh is finer than ~4 m; the chop and the mid waves only shade |
| `b-skylight` | `skylight({renderer, sky, scene, ground, key})`, `skyEnv` | the host's sky scene captured into a prefiltered cube map as `scene.environment`, recaptured as the hour moves (`PRESETS.skylight`). Standard materials only (Lambert ignores it). Specular by default: `diffuse` 0 keeps a build's tuned hemisphere and ambient fill |

Positions are world metres: `x` east, `z` south, `y` up. A rotation `ry` is about y, three.js convention: local `+z` turns to
`(sin ry, cos ry)`. A *bearing* is the angle from `+x` toward `+z`.

## Water and the sky's light: what to know

- **The wave field is in metres and seconds.** `PRESETS.waves.amp` (0.22) is the half-height scale; Voth's swell peaks
  near 0.45 m. A host scales the shading tilt per build with `atmWaveNormal`'s `k`: Voth passes 3x, because WoCC lays
  detail normal maps over this field and Voth has none, so from 200-1500 m up the field is all the texture there is.
- **Anything else a water shader animates must run whole cycles per `PRESETS.waves.period`** on `atmWaveT`, or it jumps
  when the clock wraps: write `6.283185307*fract(atmWaveT*c/600.0)` for c cycles (Voth's foam lap: c = 153).
- **It is for open water.** A river ribbon (Girder, Mav's Refuge, Yuni) flows: its noise scrolls downstream, which the
  field does not do. Lakes and bays take it; a river keeps its flow shader.
- **The sky's light lights MeshStandardMaterial only** (r128: `scene.environment` reaches standard materials). Lambert
  worlds (Voth, Locus, Mav's Refuge today) see nothing until they adopt the material library's standard families.
- **r128's prefilter mirrors a rendered cube left to right.** `PMREMGenerator.fromCubemap` samples with x negated (right
  for a cube map loaded from six images); a CubeCamera's cube is not mirrored, so unpatched every reflection showed the
  giant on the wrong side. `b-skylight` unflips its own generator's shader (three.js r130 added `flipEnvMap` for this).
  Tested with a chrome sphere: the giant's dark disc reflects at its true bearing.
- **Capture with the sky as drawn:** the cube target takes the renderer's output encoding, so custom sky shaders that
  write display values (the giant, the dome's onBeforeCompile) land in the map as the screen shows them.
- **`renderer.info` is left as it was** after a capture, so a build's draw-call budget does not count it.

## Tags

The module registers nothing itself, because a host's registry is its own. The Iziz city adds REG entries for what it
places that a viewer would inspect: fountains (`furniture`, type fountain), the sewer outfall and the drain channel
(`infrastructure`).

## Where it came from

The pieces are rewritten from Travis's alternate Iziz build: stages 16 (ivy, window boxes, cisterns), 19 (the sewer
grate), 22 (lamps, fountains, banners), 37 and 47 (the evening, the glow layer), 42 to 44 (weather, lightning,
particles) and 49 (culling). The code is new and the behaviour follows those stages.

## Still to do for the port

- Beams, cones, braziers and floodlights still run one JS hook each per frame. Move their hours into per-instance data
  read by the shader, as the glow layer does.
- The street lamps' own glow halos in Iziz (`cityGlows`) come from the host's kit items, not `ATMOS.lamp`, so they have no
  moths.
