# core/atmos in Godot 4

This file is the contract between the three.js atmosphere module and its future Godot port. The rule that makes a port
possible is to keep **what** an effect is (data) apart from **how** three.js draws it (shaders). The data is
`ATMOS.export()`. It returns one JSON object, and `ATMOS.download('iziz-atmos')` saves it from the page.

## What is in the export

| Key | What | Godot |
|---|---|---|
| `convention` | metres, +Y up, x east, z south, right-handed (glTF). `ry` is radians about +Y | the same as Godot. Godot's forward is -Z, so a fixture's outward +Z is `basis.z` |
| `uniforms` | the shared shader state, one name per value | **global shader parameters** (Project Settings, Shader Globals), set each frame by the `Atmos` autoload |
| `presets` | every effect's numbers: sizes, rates, alphas, colours, wind, the evening's hours | one `Resource` (`.tres`) per preset, or read straight from the JSON |
| `clock`, `wind` | the clock time and the base wind | the autoload's state |
| `fx` | one record per placed effect: `searchlight`, `spotcone`, `beacon`, `brazier`, `floodlight`, `banner`, `fountain`, `smoke`, `fireflies`, `moths`, `mist`, `fogbank`, `weather`, `outfall`, `drain` | one node or scene per record (table below) |
| `lamps` | every street-lamp head and its hours, its halo (`glow`: an index into `glow`) and colour. three.js gives a lamp no light, only the halo and its moths (`light` says so) | `OmniLight3D`s for the nearest few, of the halo's colour; sprites for the rest |
| `glow` | every light's halo: position, colour, size, hours | a MultiMesh of halo quads; hours go in `INSTANCE_CUSTOM` |
| `stage` | the page's light, fog, tonemapping, sky and ground look: `KSTAGE.capture` (`biomes/GODOT.md`, "The stage"), around `opt.at` (above the first lamp by default); `opt.stage: false` leaves it out | `godot/krator/stage.gd` |
| `props` | each instanced set: unit geometry kind, material, instances `[x,y,z, sx,sy,sz, ry, colour]` | one `MultiMeshInstance3D` per set |

Colours are in **display (sRGB) space**. The three.js shaders write them out as they are. Godot lights in linear space,
so declare colour uniforms with `source_color`, or convert them with `Color.srgb_to_linear()`. Skip the conversion and
everything looks washed out.

## The shared state: global shader parameters

| Export name | three.js | Set by |
|---|---|---|
| `atm_hour` | `A.U.hour` | the host's clock (0..24) |
| `atm_night` | `A.U.night` | `night(hour)`, ramps over `presets.clock.dawn` and `dusk` |
| `atm_time` | `A.U.time` | the module clock: `A.clock.t += dt * scale`, dt from the host's frame. **Not the wall clock.** Use this, not Godot's `TIME`, so pause, time-lapse and fixed-time screenshots work |
| `atm_rain`, `atm_fog`, `atm_flash` | `A.U.rain/fog/flash` | the weather state machine (`ATMOS.W`) |
| `atm_wind`, `atm_gust_amp`, `atm_wind_off` | `A.U.wind/gustAmp/windOff` | the wind: base x weather scale, slowly veering; `wind_off` is its integral over time (rain rides it) |
| `atm_light` | `A.U.light` | `1 - nightDim * night` |
| `atm_px` | `A.U.px` | not needed in Godot (it sizes sprites in pixels; size them in metres instead) |
| `atm_wave_t` | `A.U.waveTime` (GLSL `atmWaveT`) | the module clock wrapped at `presets.waves.period`; every wave runs whole cycles per period, so the wrap is seamless |
| `atm_wave_amp` | `A.U.waveAmp` (GLSL `atmWaveAmp`) | `presets.waves.amp`, metres |

**The wave field** (`89-atmos-a-waves.js`) becomes `atmos_waves.gdshaderinc`: `ATMOS.waveGLSL()` prints the GLSL from
`presets.waves`, and its functions translate line for line (`fract`, `sin`, `smoothstep` are the same; `vec3` stays
`vec3`). Read `atm_wave_t` instead of `TIME`. `ATMOS.waveHeight`/`waveSlope` are the CPU twin a GDScript buoyancy
function reproduces; `test-atmos.js` pins the clock and the bounds, and the GLSL was checked against the twin on a GPU.

**The sky's light** (`89-atmos-b-skylight.js`) has no port: a `WorldEnvironment` with a `Sky` resource lights every
`StandardMaterial3D` from that sky, ambient and reflections both (`ambient_light_source = SKY`,
`reflected_light_source = SKY`). `presets.skylight.diffuse` 0 matches `ambient_light_sky_contribution = 0` with the
hemisphere fill kept as the ambient colour.

The gust function must be the same everywhere. It lives in `presets.wind`, and `A.GLSL_WIND` is written from it.

```glsl
// Godot shading language, shared include: atmos.gdshaderinc
global uniform float atm_time; global uniform vec2 atm_wind; global uniform float atm_gust_amp;
float atm_gust(float t, vec2 xz, vec2 w) {               // presets.wind.gust: [[amp, freq, phase], ...]
    float s = t - dot(xz, w) / max(length(w), 1e-3) / 12.0;   // presets.wind.frontSpeed
    return 0.5*sin(s*0.31) + 0.3*sin(s*0.73 + 1.3) + 0.2*sin(s*1.9 + 4.1);
}
vec2 atm_wind_at(vec2 xz) { return atm_wind * (1.0 + atm_gust_amp * atm_gust(atm_time, xz, atm_wind)); }
float atm_lit(float h, vec2 t) { float hh = h < 12.0 ? h + 24.0 : h;   // a light's [on, off] hours (moths, lamps)
    return smoothstep(t.x, t.x + 0.3, hh) * (1.0 - smoothstep(t.y - 0.3, t.y, hh)); }
float atm_glow_lit(float h, vec2 t) {                    // a HALO's hours (89-atmos-2-lights.js): two more cases
    return t.x < 0.0 ? 0.25 + 0.75 * atm_night           //   on < 0 (a glow added with no hours): dims by day
         : (t.x == 0.0 ? 1.0 : atm_lit(h, t)); }         //   on = 0: always lit
```

One clock serves the whole world, not just the air: `GODOT-PLAN.md` (Phase 1, "The world clock") splits motion time
`t` from world time `hour`, and `WorldClock.gd` owns both. `Atmos.gd` reads it.

The CPU side (the clock, `night()`, the weather state machine `weatherTarget`/`weatherStep`/`flashAt`, the wind's
veer) is about 60 lines in `89-atmos-0-core.js` and `89-atmos-4-weather.js`. It becomes one GDScript autoload,
`Atmos`, that sets the global parameters in `_process(delta)`; `test-atmos.js` holds the vectors it is tested against. The host's `weather({apply})` callback becomes the autoload adjusting
`WorldEnvironment` (fog density, `volumetric_fog_density`, sun energy, ground roughness through a global `atm_wet`).

## Particles: which Godot tool for which effect

Every particle effect here is **stateless**: a particle's position is a function of its seed attributes and the time.
The port can keep that (a MultiMesh plus a vertex shader, a near line-for-line port) or hand the effect to Godot's
particle system and get features three.js lacks. The table chooses for each effect.

| Record | three.js today | Godot | Why |
|---|---|---|---|
| `smoke` (chimney, steam, spray) | sprite quads, age = fract(time*rate+phase) | `GPUParticles3D`, one per emitter cluster, `ParticleProcessMaterial` from the preset: `lifetime = 1/rate`, gravity `-rise`, turbulence on, `preprocess = lifetime` so plumes start full | built-in turbulence replaces the hand-written wobble; per-particle wind response via a process shader reading `atm_wind_at` |
| `fireflies` | stateless sprites | MultiMesh + the same vertex shader | thousands of points with no physics: stateless is cheapest |
| `moths` | stateless sprites round each lamp | the same, one MultiMesh; lamp hours per instance in `INSTANCE_CUSTOM` | as above |
| `mist` (moat ring), `fogbank` | big soft sprites | **`FogVolume`** nodes (Forward+) with a density texture; fall back to sprites on Compatibility | real volumetric fog looks far better than sprites and catches light |
| rain (`weather`) | 7000 line segments in a box riding the camera | `GPUParticles3D` attached to the camera, a `GPUParticlesCollisionHeightField3D` for the ground, a sub-emitter for splashes | collisions and splashes come free |
| lightning | a ribbon mesh and a flash value | the same mesh, plus a brief `DirectionalLight3D` energy spike from `atm_flash` | |
| `glow` | additive halo quads that follow each light's hours | the nearest N become `OmniLight3D` (Forward+ clusters hundreds); the rest stay halo quads; `Environment.glow` (bloom) does the near halo | |
| `searchlight`, `spotcone`, `beacon` | additive fading cones (no real light) | the same cones as unlit additive meshes; with volumetric fog on, a `SpotLight3D` with `light_volumetric_fog_energy` draws a real shaft | |
| `brazier` | a scaled cone that flickers and leans downwind | the same mesh, plus an `OmniLight3D` with flicker, plus an embers `GPUParticles3D` | |
| `floodlight` | a real PointLight warming from orange | `OmniLight3D`, the same warm-up curve | |
| `banner` | the flag shader: the lower cloth pushed downwind and rippling | the same vertex displacement in a spatial shader on the flag MultiMesh | |
| `fountain` | instanced stone and water with an animated emissive | MultiMesh props, plus a `GPUParticles3D` jet and spray | |

### Translating the shaders

| three.js r128 | Godot 4 spatial shader |
|---|---|
| `ShaderMaterial` with `AdditiveBlending`, `depthWrite:false` | `render_mode blend_add, depth_draw_never, unshaded, cull_disabled;` |
| `NormalBlending`, transparent | `render_mode blend_mix, depth_draw_never, unshaded;` and write `ALPHA` |
| `fog:false` | `render_mode fog_disabled;` |
| `A.sprites` quad, `atmQuad(mv, ps)` | `MODELVIEW_MATRIX`/`VIEW_MATRIX` billboarding in `vertex()`: offset `VERTEX.xy` in view space by the size in metres |
| `vUv` (0..1 across the sprite) | `UV` |
| per-particle attributes `pp`, `lt` | `INSTANCE_CUSTOM` (vec4) and `COLOR` on a MultiMesh |
| `time` | `atm_time` (global), never `TIME` |
| `gl_FragColor = vec4(c*a, a)` with additive blending | `ALBEDO = c; ALPHA = a;` with `blend_add` (Godot multiplies by alpha) |

**Tonemapping.** three.js here has no tonemapper on these shaders. Godot's Filmic and ACES compress bright additive
light, so halo `gain` (1.7) and beam opacities need re-tuning in Godot. Put the tuned values in the presets, not in
the shaders.

**Renderer choice.** Forward+ gives volumetric fog, `FogVolume`, many lights and particle collisions. If a web export
(Compatibility) is a target, keep the sprite versions of `mist` and `fogbank` and the halo quads as the fallback.
Check which `GPUParticles3D` features Compatibility supports in the Godot version the port uses.

## Rules that keep the module portable

1. **A new effect is a preset plus a record.** Put its numbers in `ATMOS.PRESETS` and have its call `A.rec()` what it
   placed. Shaders read the preset; they carry no unnamed literals that affect the look.
2. **Particles stay stateless** unless they need collisions. No per-frame CPU loop over particles.
3. **Time comes from `A.clock`, the hour from the host, weather from `A.W`.** Never `performance.now()` in an effect.
4. **Schedules live in data** (`[on, off]` hours per instance), evaluated in the shader, not in one JS hook per light.
5. **Colours are display-space `[r,g,b]` in presets.** Convert them in each engine, once.
