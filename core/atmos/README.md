# core/atmos: the atmosphere and street-dressing module

Evening lights, a glow layer, particles, weather, ivy and window boxes, sewer grates, street lamps and fountains, and
InstancedMesh culling. The pieces are portable: each fragment is a closure that adds to one global, `ATMOS`, and declares
nothing else at top level. It has its own PRNG and never touches a host's stream. It needs only three.js r128 and
the five things a host passes to `init`. The Iziz city is its first user (`settlements/iziz/targets/city/90c-city-atmos.js`).

## Taking it into a build

Add the `89-atmos-*.js` files to the build's fragment list. Iziz's `build.py` does it per target with
`TARGET_CORE = {'city': ['atmos']}`. If the build checks shared-scope names, mark `89-atmos-` as scoped: it is IIFE-scoped,
like the biome core. Then, once the scene, camera and frame loop exist:

```js
ATMOS.init({THREE, scene, camera,
  hour: () => myHour,                 // 0..24, the module's clock
  onFrame: fn => myFrameHooks.push(fn),
  ground: (x, z) => terrainH(x, z),   // ground height for anything placed on it
  seed: 1234, err: msg => console.warn(msg),
  pixelRatio: () => renderer.getPixelRatio()});   // sprites are sized in framebuffer pixels: pass it, or HiDPI shrinks them
// ...place things (below)...
ATMOS.finish();                       // bakes the instanced sets and builds the glow layer
ATMOS.cull(scene, {keep: m => m.userData.biome});   // optional, last
```

Everything it makes goes under one group, `ATMOS.root`. Sprites, beams and rain have their raycasting switched off and
carry `userData.probeSkip`. `ATMOS.stats` counts what was made.

## Presets, the clock, the wind, export

- **`ATMOS.PRESETS`** (`0p-presets`) holds every effect's numbers: sizes, rates, alphas, colours (display-space `[r,g,b]`),
  the wind and the evening's hours. The shaders read them. Change a value before placing the effect.
- **`ATMOS.clock`**: the module's own time, from 0 at `init`. `clock.scale` speeds it up or stops it; `clock.fixed = t`
  pins every shader and hook to time `t` (repeatable screenshots). Hooks get `(t, hour, dt)` in clock seconds.
- **The wind** is `ATMOS.windBase` (from the preset), veering slowly, times `ATMOS.windScale` (the weather sets it: storm
  2.4x). Gust fronts travel downwind: `atmGust`/`atmWind` in GLSL, `ATMOS.gust`/`ATMOS.windAt(t,x,z)` in JS. Smoke, fog
  banks, rain, banner cloth and brazier flames all ride it.
- **Haze**: searchlights, spot cones and beacons read stronger in fog and rain (`ATMOS.haze()`), and halos swell.
- **`ATMOS.export()`** returns everything placed as JSON (presets, effect records `ATMOS.fx`, lamps, glows, prop sets);
  `ATMOS.download(name)` saves it. `GODOT.md` is the contract and the port plan.
- **`ATMOS.sprites(name, attrs, material)`** makes a sprite cloud of camera-facing quads (not GL points). Particle
  shaders compute `mv` and a pixel size `ps`, end with `gl_Position = atmQuad(mv, ps)`, and read `vUv` in the fragment.

## Calls

| Fragment | Call | What |
|---|---|---|
| `0-core` | `init`, `finish`, `hook(fn(t,hour,dt))`, `clock`, `windAt`, `gust`, `haze`, `rec`, `sprites`, `stream(seed)`, `litAt(h,on,off)`, `night(h)`, `glowAdd(x,y,z,[r,g,b],size,on,off)`, `set/put` (instanced sets), `rnd/rr/pick/seed` | the binding and the clock. A light's `on`/`off` are hours: on in the evening, off next morning (off may be past 24). `on<0` follows the night; `on=0` is always lit |
| `1-street` | `lamp(x,z,o)`, `lampRow(pts,o)`, `planter(x,z,ry)`, `banner(x,z,bearing,hex)`, `fountain(x,z,o)` | boulevard lamps (the evening runs down a row; each head goes in `ATMOS.lamps`), timber planters, banner poles whose cloth swings and ripples in the wind, stone fountains with moving water |
| `2-lights` | `sweepBeam(x,y,z,o)`, `spotCone(x,y,z,dir,o)`, `beacon(x,y,z)`, `brazier(x,y,z)`, `floodLight(x,y,z,o)`, `buildGlow()` | searchlights (sweeping, or `sky:true`), fixed spot cones, a rotating beacon, braziers, scheduled PointLights (keep these to a handful), and the glow layer over every light |
| `3-particles` | `smoke([[x,y,z,kind]])`, `fireflies(centres,o)`, `mistRing(rFn,o)`, `fogBank(points)`, `moths(o)` | chimney smoke / steam / spray (kind: a `PRESETS.smoke` name or 0/1/2), fireflies at night, mist round a closed curve (a moat), fog banks for foggy weather, moths round the lit lamp heads (`ATMOS.lamps`; their own seed stream) |
| `4-weather` | `weather({ui, apply(W)})`, `strike()` | modes auto / clear / rain / storm / fog. Rain streaks follow the camera, lightning comes in storms. `W.rain/fog/wet/flash` ease each frame, and `apply(W)` is where the HOST changes its own scene: fog density, sun, wet ground |
| `5-dress` | `boxIndex(meshes)`, `dressBuilding(idx,b,o)`, `ivy`, `ivyClump`, `windowBox`, `cistern`, `windowBoxesOnPanes(im,o)` | an exact ray index over box instances. A building's real walls take ivy, its flat roof a cistern, and window panes get flower boxes under them |
| `6-sewer` | `outfall(x,y,z,ry,o)`, `drain(pts,o)`, `inletGrate(x,y,z,ry)` | a culvert with an iron grate in a wall face, a trickle down to the water, a grated drain channel, an inlet grate |
| `7-cull` | `cull(scene,o)` | splits big static InstancedMeshes into bearing sectors and bounds every set by its instances, so r128 can frustum-cull them. Raycasts still test each instance correctly |
| `8-export` | `export()`, `download(name)` | the whole placed atmosphere as JSON for a game engine (`GODOT.md`) |

Positions are world metres: `x` east, `z` south, `y` up. A rotation `ry` is about y, three.js convention: local `+z` turns to
`(sin ry, cos ry)`. A *bearing* is the angle from `+x` toward `+z`.

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
