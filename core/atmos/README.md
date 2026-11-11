# core/atmos: the atmosphere and street-dressing module

Evening lights, a glow layer, particles, weather, ivy and window boxes, sewer grates, street lamps and fountains,
InstancedMesh culling, **the open-water wave field**, **the sky's light on standard materials** and **the cloud deck**. The pieces are
portable: each fragment is a closure that adds to one global, `ATMOS`, and declares nothing else at top level. It has
its own PRNG and never touches a host's stream. It needs only three.js r128 and the five things a host passes to `init`.

**Users:** the Iziz city takes all of it (`settlements/iziz/targets/city/90c-city-atmos.js`); Voth takes the wave field
for its bay; Girder takes the sky's light for its library-textured families; the southern highlands (`biomes/shighlands`) take the
cloud deck, with only the core, the presets and the export (its `build.py`, `CORE_ATMOS`). The northern semiarid kit (`biomes/nsemiarid`, 2026-10-22) takes the core, presets, export, waves and sky light for its water and **its wind**: a wind setting scales `ATMOS.windScale` (calm 0.4, a breeze 1, high 2.6), and the helicopter trumpets' spin and the seeds the wind tears off its trees ride `ATMOS.windAt` (`src/89b-host-atmos.js`, `src/89c-host-seeds.js`). Voth's and Girder's
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

**A biome kit or Throne station** binds with one call, `ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground,hour,seed})` (`core/atmos/host/89-atmos-c-hostbind.js`, in a subfolder so the kits that take `core/atmos` whole are unchanged; the build lists it by path beside the five `CORE_ATMOS` fragments: core, presets, export, waves, skylight). It is the one-time `init` on the page's frame ticks and draws nothing; `WATER.draw` and `ATMOS.skylight` follow when the page takes core/water (migration phase 0, 2026-10-20: every biome and Throne station is bound; each host fragment is `89a-host-atmos.js`).

**A kit's viewer page** takes the placeholder sky, `core/atmos/placeholder` (`KratorSky`, `81-sky.js`, with the `h3()` it reads for builds that have none; moved from Iziz's `src/` on 2026-11-02, MODULARITY-PLAN.md step 1). It is in a subfolder for the same reason as `host/`: the kits take `core/atmos` whole. A build reads it by path through `placeholder/placeholder.py`; its README says what it is and is not.

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
| `3d-dust` (opt-in) | `dust({ground, mask, color, n, box, lift, ride, alpha})`, `dustLift(x,z,mask)` | dust the wind lifts off bare dry ground (2026-10-23): a box of soft sprites riding the camera on a baked height map of the host's ground (64 x 64, re-baked as the camera moves; its third byte the host's `mask`, 0..1, where dust can rise), each shown where the wind there (`atmWind`, gusts and all) passes `lift[0]` and thickest at `lift[1]` (ATMOS's wind units: 1 is the presets' breeze). Calm: none; a breeze: a puff as a gust front passes; a gale: a ground blizzard. `dustLift` is its CPU twin, for checks. Its preset (`PRESETS.dust`) is set by the file when a build's presets have none, so no other build changes. Taken by `biomes/nsemiarid` and `biomes/dambasins` |
| `4-weather` | `weather({ui, apply(W), ash, snow})`, `strike()` | modes auto / clear / rain / storm / fog. Rain streaks follow the camera, lightning comes in storms. `W.rain/fog/wet/flash` ease each frame, and `apply(W)` is where the HOST changes its own scene: fog density, sun, wet ground. **Ash (opt-in, `ash:true`)**: two more modes, `ashfall` (ash sifting down) and `ash` (an ash storm, from Voth's: flecks driven by a gale, veils of ash racing along the ground, warm volcanic lightning, haze) and `W.ash` / `atm_ash`; a host that does not ask sees the old modes and `W.ash` 0. **Snow (opt-in, `snow:true`, 2026-10-06, the Throne's glacier)**: `snowfall` and `blizzard` (flakes driven by a gale, streaks of blown snow, spindrift on the ground, a white-out), `W.snow` / `atm_snow`; drawn by the same function as the ash (`flakeWeather`, its own preset); no lightning |
| `5-dress` | `boxIndex(meshes)`, `dressBuilding(idx,b,o)`, `ivy`, `ivyClump`, `windowBox`, `cistern`, `windowBoxesOnPanes(im,o)` | an exact ray index over box instances. A building's real walls take ivy, its flat roof a cistern, and window panes get flower boxes under them |
| `6-sewer` | `outfall(x,y,z,ry,o)`, `drain(pts,o)`, `inletGrate(x,y,z,ry)` | a culvert with an iron grate in a wall face, a trickle down to the water, a grated drain channel, an inlet grate |
| `7-cull` | `cull(scene,o)` | splits big static InstancedMeshes into bearing sectors and bounds every set by its instances, so r128 can frustum-cull them. Raycasts still test each instance correctly |
| `8-export` | `export()` | the whole placed atmosphere as JSON for a game engine (`GODOT.md`) |
| `9-host` | `weatherUI(el)`, `download(name)` | [web]: the Weather selector and the JSON download |
| `a-waves` | `waveUniforms(u)`, `waveGLSL()`, `waveHeight(x,z,t,chopW)`, `waveSlope(x,z,t,camDist)`, `waveWrap(t)`; GLSL `#include <atmos_waves>`: `atmWaveHeight(xz,chopW)`, `atmWaveSlope(xz,camDist)`, `atmWaveNormal(xz,camDist,k)` | the open-water wave field (`PRESETS.waves`, from World of ClaudeCraft, MIT): chop, mid waves and swell in sets, on the module clock wrapped at a whole number of cycles. Displace with the swell only unless the mesh is finer than ~4 m; the chop and the mid waves only shade |
| `d-clouddeck` | `cloudDeck({y, sun, bounds, name})`, `deckUniforms(u)`, `deckGLSL()`, `deckHeight(x,z,t,y)`, `deckSlope(x,z,t,camDist)`, `deckWrap(t)`; GLSL `#include <atmos_clouddeck>`: `atmDeckHeight(xz,y)`, `atmDeckSlope(xz,camDist)`, `atmDeckNormal(slope)` | a sea of cloud seen from above (`PRESETS.clouddeck`): billow noise on a repeating lattice with an integer hash (bit-exact in every engine), heaped, warped and drifting on the module clock, a grid that follows the camera (snapped) and thins where the host's `ground` rises through it, recorded as `clouddeck` for the export. The same field in Godot (`GODOT.md`, "The cloud deck") |
| `b-skylight` | `skylight({renderer, sky, scene, ground, key})`, `skyEnv` | the host's sky scene captured into a prefiltered cube map as `scene.environment`, recaptured as the hour moves (`PRESETS.skylight`). Standard materials only (Lambert ignores it). Specular by default: `diffuse` 0 keeps a build's tuned hemisphere and ambient fill |
| `fx/lava` (opt-in, a subfolder: `core/atmos/fx/89-atmos-fx-lava.js`) | `lavaMaterial(o)`, `lavaGLSL(P)`, `PRESETS.lava` | a lava surface (2026-10-25, lifted from the Throne caldera's lake): a moving, warped Voronoi crust of plates with glowing cracks, finer facets riding them, seams, thin facets the heat shows through, plates overturning; the swell and the vents' domes in the vertex shader; the night raises the heat, `erupt` (a uniform the host eases) widens the cracks and churns patches; `flow` slides it, `channel: {width, speed}` runs it down a stream's mesh (aF across and along); `scale` and `crack` size it. An integer hash (lowbias32), never sin. Recorded as `lava`. Taken by the Throne's caldera (the lake) and tube (the stream) |
| `fx/snowcover` (opt-in: `core/atmos/fx/89-atmos-fx-snowcover.js`) | `snowCover(o)`, `snowStep(S,W,dt,hour)`, `snowOn(mat,o)`, `snowOnScene(scene)`, `snowGLSL()`, `snowBare(M)` (a mask from a field: warm ground bare, `core/README.md`, KTHERM), `PRESETS.snowcover` | snow that LIES (2026-10-25; the weather's `snow` modes make it fall): a depth 0..1 that builds while it snows and melts when it does not (slower at night, never in `frozen` air), a pure step; any lit material whitens where it holds (up-facing first, patchy at the edges by an integer-hash noise, steeper faces as it deepens, a cliff stays bare), `base` cover and a snow `line` [y0, y1] for permanent snow, the biome core's bent normal (`aN`) on leaf cards. `node core/atmos/fx/test-fx.js`. Taken by the Throne's glacier |
| `fx/lightning` (opt-in: `core/atmos/fx/89-atmos-fx-lightning.js`) | `boltPath(seed, from, to, o)`, `thunderDelay(d)`, `thunder`, `onThunder(fn)`, `PRESETS.lightning` | branched lightning (2026-10-26, WEATHER item 8): 4-weather's storm strikes become seeded midpoint-displacement bolts with forks, a flash of the cloud above, and thunder events at `dist / 343` s (`onThunder` for the host's sound). Without the file the old ribbon stays |
| `fx/raincover` (opt-in: `core/atmos/fx/89-atmos-fx-raincover.js`) | `rainCover({renderer, size, box, step, every, lift, depth, skip})`, `rainCoverGLSL()`, `rainCoverUniforms(u)`, GLSL `atmRainOpen(wp)` (1 open sky), `atmRainCover(wp)`, `atmRainOccY(xz)` | the rain occlusion map (2026-10-26, R10): a top-down depth map of a 160 m box round the eye, re-rendered every 20 m; rain streaks, flakes, cloudShade's wet darkening and the fresh snow stay off what is more than 1.2 m under cover (crowns, roofs, overhangs; grass shelters nothing). core/water's wetness takes it through `rainCoverGLSL` |
| `sky/fog` + `host/heightfog` (opt-in: `sky/89-atmos-j-fog.js`, `host/89-atmos-j-heightfog.js`) | `heightFog(o)`, `heightFogOn(mat)`, `heightFogScene(scene)`, `fogGLSL()`, `fogAt(ro, P, F)`, `fogLayer/fogPool/fogSlab` | height fog (2026-10-26, R1): the page's fog (its colour and density, which the sky and the weather drive) up to the ground under the eye and thinning above it, graded toward the sky's zenith colour up the ray and the sun's in a forward lobe; dawn mist pooling under a level; a broken cloud band at mid-height; the patches drifting on the wind and its gusts. Exact closed-form integrals (Quilez), ~20 ops a fragment. A level view at the reference height is FogExp2's own fog (`test-fog.js`) |
| `host/hostbind` | `windUniforms(u)`, `windGLSL()` | the gust field for any shader (R8): `atmWindV`, `atmGustAmp`, `atmTime` (the shared uniforms) and `atmGust`, `atmWind`, `atmGustHere(xz)`, `atmWindHere(xz)` |
| `host/skyhost` | `shaderHook(mat, key, fn)` | every core hook on a material's `onBeforeCompile` (cloudShade, heightFog, snowOn) goes through it: any number compose in any order, a page's own hook (set before or after) runs first, no hook can call itself, the program key carries each layer |

Positions are world metres: `x` east, `z` south, `y` up. A rotation `ry` is about y, three.js convention: local `+z` turns to
`(sin ry, cos ry)`. A *bearing* is the angle from `+x` toward `+z`.

## Water and the sky's light: what to know

- **The plan for all water** (every build's sea, lake, river, fall and pool on one module, the CDLOD mesh, the shore field,
  the FFT backend) is `WATER.md` beside this file. Its module is `core/water` (phases 0 and 1 done 2026-10-12: open water
  on a CDLOD mesh over this wave field; `kits/ringsea` and `biomes/geyser` take it).

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

## Adopting the final rebuild's atmos items (2026-10-26)

**What applies by default** (every page that takes the files; today's output unchanged at the clear weather):
- `ATMOS.shaderHook`: `cloudShade` and `snowOn` compose with each other, with core/water's `wetGround` and with the page's own
  hooks in any order (the NW outer wall's recursion is gone; its `89s-host-sky.js` workaround can stay or go).
- The sky and `ATMOS.bindWeather` compose whichever binds first (X2): with the shared sky the binding hands the sky its look
  (`ATMOS.wxLook`: the weather greys and clouds the sky, dims the sun and wets the ground through cloudShade's `uWet`) and runs
  its fog law on the hour's fog (`ATMOS.wxFog`). A sky given `o.weather` keeps it (Farside, the NW outer wall): unchanged. A
  stand-in fog for the binding is no longer needed.
- Every page on the shared sky shows the hour slider and run / hold in the host's panel (X3: `ATMOS.sky` sets `KHOST.wantHour`).
- `bindWeather` takes `climate.dry` (no wet ground, a dust-coloured haze; `climate.dust` the colour) beside wet, cold, frozen, ash.
  Every biome kit and station binds the weather (the roll-out, 2026-10-26), except guilin (frozen as an Earth reference) and
  the Throne's tube (underground); the Throne's ash desert, caldera, cloud forest, glacier and vents keep their own weather law.

**Opt-in** (pilots: nhighlands, swbay, the Throne's glacier). The build lists the files by path:

```python
for f in ['89-atmos-4-weather.js','89-atmos-9-host.js']:          # the weather and its selector, if not already listed
    if f not in PATH: PATH[f]=J('core','atmos',f)
for f in ['89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
PATH['89-atmos-j-fog.js']=J('core','atmos','sky','89-atmos-j-fog.js')
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']: PATH[f]=J('core','atmos','fx',f)
```

(a Throne or Korona station: `"sky/89-atmos-j-fog.js"`, `"host/89-atmos-j-heightfog.js"`, `"fx/89-atmos-fx-raincover.js"`,
`"fx/89-atmos-fx-lightning.js"` in station.json `"atmos"`). Then, in the host fragment that runs after `ATMOS.bindHost` /
`ATMOS.init` and after the scene is built (before `KHOST.take`, so the first compile sees it):

```js
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[MAT_GROUND]});
ATMOS.heightFog({falloff:1/850,sun:.35,sky:.35,                       /* the biome's own numbers */
 mist:{density:.0045,y:260,depth:45,noise:.7},                        /* or below: metres under the eye's ground */
 band:{density:.0016,y:[1560,1720],cover:.38,noise:1}});
ATMOS.heightFogScene(scene);
ATMOS.rainCover({renderer});
```

A page whose fog chunk is not FogExp2's passes its shape (`shape:'exp'`, `compress:[4000,5000]`: nhighlands). Height fog is
opt-in because it changes the look wherever the view climbs or falls (the point of it); at a level view it is the page's fog.
For the roll-out, each biome's numbers: the falloff from its relief (1/700 to 1/1100), the mist level at its valley floors or
`below`, the band where its plans put a cloud layer (or none). `ATMOS.fog.off = true` shows the plain fog (an A/B check).
`node core/atmos/test-fog.js` holds the integrals, the twin, the hooks, the compose and the bolts.
Measured on the pilots (GPU, 2026-10-26): at clear noon nhighlands' crest overview with height fog differs from the plain
fog by at most 3/255 on every pixel (0 pixels past 3), the same calls and triangles; dawn pools the mist in the low old growth.
**Known issue:** on swbay the rain occlusion pass throws inside three ("reading 'isInterleavedBufferAttribute' of null")
although every mesh renders alone into the same target; the module retries five times and then turns the map off (the
rain falls everywhere, as before). On nhighlands and the glacier the map works (164k pixels of the trumpet colony stay dry).

### Adopting it: the planned biomes' sky and air (2026-10-26)

Three opt-in features for the planned biomes (`HANDOFF-REBUILD.md`, the core tests after the rebuild). A page that does not
ask for them is unchanged: the fog chunk's text is the same without a belt, the sky's look ignores the eye's height without
`air.thin`, and the rain wall is a new file. `node core/atmos/test-fog.js` and `test-sky.js` hold them, each check with a
negative.

**The fog belt** (the Outlands' C1, `biomes/outlands/PLAN.md` section 12): cloud lying on the slope between two heights,
thicker on faces turned to the wind, thinning where the ground rises up through it, clinging to the ground over `depth`
metres. It is a fourth layer of the height fog (`sky/89-atmos-j-fog.js`, drawn with the band's colour), read from a ground
field the host builds once (`res` x `res` over `extent`, half precision: the GPU's RGBA16F texture) and marched in `steps`
samples inside the band. Take the height fog's files (above), then, **before** `heightFogScene`:

```js
const BELT=ATMOS.fogBelt({y0:3500,y1:4400,             /* the band, m (the Fog Rim: ~3.5-4.4 km) */
 windward:[-1,0],                                      /* where the wind comes from; default: against the page's wind */
 density:.004,depth:150,lee:.25,rise:.5,               /* 1/m at full; hug depth (m); the lee's share; the thinning toward the top */
 centre:[0,0],radius:6000,res:128,steps:8});           /* or extent:[x0,z0,x1,z1]; the field covers the view */
ATMOS.heightFogScene(scene);
// placement (the veil caps): BELT.cover(x,z) 0..1 at the ground, BELT.at(x,y,z) the density; static, never the weather's
```

It makes the height fog first when the page has none (`heightFog:` its options). The rain and the weather's fog thicken it
(`weather`, default .5 each); `ATMOS.fog.off` turns it off with the rest. The pure side (`ATMOS.fogBeltMake(o, ground)`,
`fogBeltAt`, `fogBeltCover`, `fogBeltDepth`, `fogAt` with `belt:`) is engine-free, for a kit's own placement pass. Cost: up to
`steps` texture reads a fragment, only on rays that cross the band.

**Thin air** (the Godthrone, `biomes/godthrone/PLAN.md` section 2): the pressure falls with the eye's height,
`p = air.pressure * exp(-(y - y0) / scale)` (the model's law, scale 8 km: 1.6 atm at sea level, 0.52 at 9 km, 0.07 at the
25 km rim). The sky's look already reads the pressure (a darker zenith, the bright stars by day below ~0.6 atm); with
`air.thin` the sky fill also falls away (hard, dark shadows), the sun whitens and strengthens, the haze floor goes and the
fog falls to nothing. One preset field, no new file (`sky/89-atmos-f-skypresets.js`; the sky host passes the camera's height):

```js
ATMOS.skyBiome({...,preset:{air:{pressure:1.6,thin:{y0:0,scale:8000}}}});   /* y0: the page height where air.pressure holds */
ATMOS.airPressureAt(SKY.preset, y)                                           /* the pressure anywhere (a kit's own checks) */
```

A page whose y is not sea level sets `y0` to the page height of sea level (or of the height where `pressure` holds). A station
page is where the thin end is tuned (the plan's G4).

**The rain wall** (the SW highlands, `biomes/swhighlands/PLAN.md`: 2,600-4,000 mm at ~2 km on the windward ramp):
orographic rain, a field on the ground, not a weather mode: rain where the ground lies in the band, on faces turned to the
wind (`ATMOS.rainWallAt`). Inside it the weather's own rain falls (it lifts `W.rain`, so the streaks, the wet ground, the grey
sky and the rain cover all follow); seen from outside it is curtains of grey falling streaks standing on the ground up into
the cloud, one per cell of the field, seeded by `KRAND.hash` of the cell. Build: list `fx/89-atmos-fx-rainwall.js` (station.json
`"fx/89-atmos-fx-rainwall.js"`) and core/rand (`08-core-rand.js`, which every biome page has); then, after `ATMOS.weather` /
`bindWeather`:

```js
const WALL=ATMOS.rainWall({y0:1700,y1:2600,windward:[-1,0],   /* the band of ground it rains on; where the wind comes from */
 centre:[0,0],radius:5000,cell:260,top:3000});                /* the curtains' area, cell size and tops (the cloud base) */
// WALL.at(x,z) 0..1: the field, for the kit's scars, wet ground and plants; WALL.off = true hides it
```

The rain wall's cloud is a fog belt over the same band: the station takes both.

**Acid rain** (the Valley of the Ancients, planned; core/hazard's `acid-rain` row; the pH values are placeholders for the
owner): `fx/89-atmos-fx-acid.js`, after the weather (and after `rainCover`, so nothing sheltered etches or fizzes):

```js
ATMOS.acidRain({ph:(x,z)=>VALLEY.has(x,z)?2.5:5.6,   /* a number or a field; clean rain is 5.6 */
 cover:(x,y,z)=>ROOF.over(x,y,z)?1:0});             /* the page's own shelter test, for the hazard's rain field */
ATMOS.acidOn(MAT_RUIN_METAL,{kind:'metal'});ATMOS.acidOn(MAT_ROCK,{kind:'stone'});ATMOS.acidOn(MAT_PUDDLE,{kind:'water'});
```

The weather's streaks turn a sickly yellow-green as the pH falls; `metal` pits and tarnishes and `stone` bleaches and
streaks as the etch at the eye grows (a base from the pH, plus what each storm adds; it never falls back); `water` fizzes
while it rains. With core/hazard on the page it provides `KHAZ.provide('rain', ...)` (mm/h, 0 under `cover`, the rain wall's
field where one stands) and `KHAZ.provide('ph', ...)`; the weather record gains `acid`. Thin air's pressure goes to the same
bridge with `ATMOS.provideAir(SKY.preset)`. There is no temperature field yet. The etched textures are procedural until
`metal.etched` and `stone.acidstreak` arrive (`core/materials/PROMPTS-NEEDED.md` section 33).

**The air's load: dust, ash, caustic alkali and sight** (core/hazard's ambient bridge; the Catch's black storms, the
Throne's ash, every page with the dust module): `fx/89-atmos-fx-airload.js`, after `ATMOS.dust` and `ATMOS.weather` /
`bindWeather`. It puts what the weather lifts into mg/m3 at any point and time, and drives the page's fog from the same
numbers, so the sight core/hazard reports is what the page shows (a 57 m sight leaves 2% of the far contrast at 57 m):

```js
const AIR=ATMOS.airLoad({                          /* every field optional; the numbers are PRESETS.airload's */
 alkali:(x,z)=>F('soda')>.5||F('crust')>.5?.45:.05, /* the Catch: the share of caustic salt where the dust is lifted */
 ashAt:(x,z)=>PLUME.under(x,z)});                   /* the Throne: how much of the ash falls here (default 1) */
AIR.stormTo=1;                                      /* a black storm (the page's spring, or its UI); eases in over ~15 s */
```

- **dust**: clean air (.05) + the wind's own dust (the dust module's lift and mask x 30 mg/m3, thinning over 30 m up) + the
  storm (1500 mg/m3 at full over its bare ground, 35% of that elsewhere, carried from `fetch` m upwind, thinning over 800 m).
- **ash**: the weather's `W.ash` (ashfall .35, the ash storm 1) x 120 mg/m3 x `ashAt`, thinning over 1.5 km.
- **alkali**: the share where each part of the load was lifted: the storm brings the lake beds' share downwind over the sand.
- **sight**: Chepil and Woodruff's law, as KHAZ's (`VOCAB.dustSight` when core/tags is on the page). The fog becomes the
  density that matches it when that is thicker than the page's own, tinted toward the dust (or the ash), and goes back to the
  page's own after the storm. It composes with the shared sky (through `ATMOS.wxFog`) and with the weather binding's own
  fog law (neither stacks on the other); a sky given its own `o.weather` should call `AIR.applyFog(scene.fog)` after
  it writes the fog.
- **The fields** (when the page has core/hazard): `dust`, `ash` (with an ash weather or `ashAt`), `alkali` (with `alkali`)
  and `visibility` (only what the page's fog allows: its density, the height fog's falloff and mist, the fog belt: not the
  dust's, which KHAZ already counts). The cloud deck gives none yet. The weather record gains `air`, with an `airload`
  record. Thin air's pressure goes to the same bridge with `ATMOS.provideAir(SKY.preset)`.

**For the other workstreams.** core/water's `WATER.wetGround` should hook through `ATMOS.shaderHook` when present (today a
page hook set after it replaces a core hook layered under it) and (done on the water side, 2026-10-26) multiplies its wetness, puddles and rain rings by `atmRainOpen(worldPos)`
when `ATMOS.rainCoverGLSL` and `ATMOS.U.rainOcc` exist (`ATMOS.rainCoverUniforms(sh.uniforms)`). `ATMOS.bindWeather`'s `o.wet` is passed
to `WATER.wetGround(mat, o.wet)` (porosity, puddles, ripples). The terrain workstream's KHORIZON reads the sky's `uSunDir`: a stable name. core/biome's foliage and grass
sway can read the travelling gusts with `ATMOS.windGLSL()` and `ATMOS.windUniforms(sh.uniforms)` (R8).

## Steam in groups and the heat shimmer (`fx/`, opt-in, 2026-11-03)

**`ATMOS.smokeGroups`** (`fx/89-atmos-fx-smokegroups.js`, `test-smokegroups.js`): one `ATMOS.smoke` cloud a group, each with its own
strength, so the gills' steam follows the breath, a fumarole's stays steady and a disc's follows the night's work on one page.
`const G = ATMOS.smokeGroups({breath: {emitters, k: 0}, vents: {emitters, n: 6, k: .6}})`; each frame `G.set('breath', B(t))`. The
strength multiplies every kind's preset alpha in that cloud (never compounded); the presets are untouched; the export carries a
`smokeGroups` record for Godot (the group's GPUParticles3D alpha times the same scalar).

**`ATMOS.shimmer`** (`fx/89-atmos-fx-shimmer.js`, `test-shimmer.js`, `check_shimmer.py`): the heat shimmer over warm ground (the
Hearths' section 12, the Stills' basins). A post pass for `core/host`'s `o.draw` slot: the scene drawn to a target with its depth,
each pixel over hot ground (a KTHERM bake) taking its colour from a little below and beside it, wavering upward, stronger with
the heat and with distance (`near` 6 m to `far` 90 m), times a master `S.k` the kit sets (by day, in the work's hours). The sky
does not shimmer. `const S = ATMOS.shimmer({renderer, field: H.bake({box, cell: 8}), t0: 25, t1: 70})`, then
`KHOST.start({..., draw: S.draw})`. `ATMOS.shimmerK(F, x, z, d)` is its strength for a probe and Godot. **Checked** on SwiftShader:
5,801 pixels move over the hot patch, none outside it and none in the sky. **Not judged:** no look at a real station's
ground; its target is not multisampled (a page that relies on MSAA loses it under the pass); its wavering is a GLSL value noise
(a look, not placement, so not on KRAND).

## The cloud deck's day (`fx/89-atmos-fx-deckday.js`, opt-in, 2026-11-03; `test-deckday.js`)

The cloud sea at a wall's foot laps up at dawn and burns back through the day (the Cliff Lungs' section 14 item 5). `ATMOS.deckLevel(hour,
W, {y, lap, burn, high, low, fog, rain})` is the level as a plain function of the hour and the weather (the kit's own breath reads the same
one); `ATMOS.deckDay(deck, o)` writes it into a `cloudDeck`'s `uY` each frame; `ATMOS.deckIn(x, y, z, t, level)` is how deep a point is in
the cloud; `ATMOS.provideDeck(KHAZ, {level, base})` registers `visibility` (25 m deep in it, the page's own elsewhere), the field the
deck gave none of. The deck's ground-clearance window is fixed when it is made: make it at `o.y` and keep `lap` and `burn` within about
60 m. **Godot:** `deckLevel` is arithmetic on the clock; the deck's shader takes the level as a uniform, as here.

## Tags

The module registers nothing itself, because a host's registry is its own. The Iziz city adds REG entries for what it
places that a viewer would inspect: fountains (`furniture`, type fountain), the sewer outfall and the drain channel
(`infrastructure`).

## Where it came from

The pieces are rewritten from Travis's alternate Iziz build: stages 16 (ivy, window boxes, cisterns), 19 (the sewer
grate), 22 (lamps, fountains, banners), 37 and 47 (the evening, the glow layer), 42 to 44 (weather, lightning,
particles) and 49 (culling). The code is new and the behaviour follows those stages.

## Still to do for the port

- **One shared sky** to replace every biome's painted dome (`82-host-sky.js`): the plan, the owner's decisions and the
  open questions are in `SKY-PLAN.md` beside this file. Step S0 is built (2026-10-25): `sky/` holds the model
  (`ATMOS.siteAt`, `skyState`, `skyDate`, `ridgeProfile`: [G data]), the presets and colour script (`PRESETS.sky`,
  `skyPreset`, `skyLook`) and the `atmos_sky` chunk ([G shader]); `host/89-atmos-h-skyhost.js` is `ATMOS.sky(preset, o)`, the
  sky as a background pass driving the page's light and `ATMOS.skylight`; `demo/` is the viewer; `node core/atmos/test-sky.js`.
  The files sit in subfolders so the builds that take every `89-atmos-*` file in this folder are unchanged. No biome takes
  it yet; the Godot twin is next.

- The cloud deck's edge mist (the southern highlands' sprites along the deck's edge and up the ravines) is the host's own and
  is not exported; in Godot it would be `FogVolume`s along the deck's contour, as the fog banks are.

- Beams, cones, braziers and floodlights still run one JS hook each per frame. Move their hours into per-instance data
  read by the shader, as the glow layer does.
- The street lamps' own glow halos in Iziz (`cityGlows`) come from the host's kit items, not `ATMOS.lamp`, so they have no
  moths.

## The sky as data: `ATMOS.libration(t)`, `ATMOS.sunHidden(t, site)` (2026-11-02; `test-sky.js`)

`ATMOS.libration(t)`, t in days from game start (skyState's `dayCount + hour/24`): `{phase (0..1), nod (-1..1), swing (-1..1), nodDeg, swingDeg, ringOpen, dN, dE}`. `ATMOS.sunHidden(t, site)`: the share of the sun's
disc behind the giant, 0..1. **`skyState` draws the giant and the eclipse from these same functions, so a picture of the giant and these numbers can't disagree.** The hour of an eclipse moves with longitude: pass the site
(`ATMOS.siteAt(px, py)`). With no site it is the sky `ATMOS.skyBiome` bound on the page (`ATMOS.skySite`), else Voth. Godot: `libration(t)`, `sun_hidden(t, site)` in `godot/krator/sky_model.gd`, held to `godot/tests/sky/golden.json`.

Adopting it: load `sky/89-atmos-e-skymodel.js` (every sky has it), and read them from the module clock: a shaped function of `libration(t).nod` is the Gills' breath, `sunHidden` the Hearths' working day. Never read pixels for either.
