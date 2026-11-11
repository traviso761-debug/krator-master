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
| `atm_ash` | `A.U.ash` | the opt-in ash weather (`ashfall` .35, the `ash` storm 1); the flecks and the ground veils read it |
| `atm_snow` | `A.U.snow` | the opt-in snow weather (`snowfall` .4, the `blizzard` 1); the same flakes, streaks and veils as the ash (`flakeWeather`), white |
| `atm_wind`, `atm_gust_amp`, `atm_wind_off` | `A.U.wind/gustAmp/windOff` | the wind: base x weather scale, slowly veering; `wind_off` is its integral over time (rain rides it) |
| `atm_light` | `A.U.light` | `1 - nightDim * night` |
| `atm_px` | `A.U.px` | not needed in Godot (it sizes sprites in pixels; size them in metres instead) |
| `atm_wave_t` | `A.U.waveTime` (GLSL `atmWaveT`) | the module clock wrapped at `presets.waves.period`; every wave runs whole cycles per period, so the wrap is seamless |
| `atm_wave_amp` | `A.U.waveAmp` (GLSL `atmWaveAmp`) | `presets.waves.amp` |
| `atm_deck_t` | `A.U.deckTime` (GLSL `atmDeckT`) | the module clock wrapped at `presets.clouddeck.period`; every billow runs whole cycles per period |

**The wave field** (`89-atmos-a-waves.js`) is ported. `godot/shaders/atmos_waves.gdshaderinc` is generated:
`node godot/tools/atmos_waves.js` loads core/atmos, takes `ATMOS.waveGLSL()` (written from `presets.waves`) and swaps
its two uniforms for the global parameters `atm_wave_t` and `atm_wave_amp`; the bodies are unchanged and the functions
take snake_case names (`atm_wave_height(xz, chopW)`, `atm_wave_slope(xz, camDist)`, `atm_wave_normal(xz, camDist, k)`).
**Rerun it after changing `presets.waves` or the chunk**, then `node godot/tools/atmos_golden.js`: the golden keeps a
copy of the include, so `atmos_test.gd` fails on a stale one. The `Atmos` autoload sets `atm_wave_t` (its clock wrapped
at `presets.waves.period`) and `atm_wave_amp` (`presets.waves.amp`), and carries the CPU twin, `Atmos.wave_height(x, z,
t, chopW)` and `Atmos.wave_slope(x, z, t, camDist)` (64-bit, for buoyancy), checked against `ATMOS.waveHeight`/`waveSlope`
to 1e-9 by `godot/tests/atmos/atmos_test.gd`; `godot/tests/atmos/waves_gpu_check.gd` draws the include on a GPU and
reads it back against the twin. No Godot water surface uses it yet: the spike's water is a flat biome sheet
(`kdata.gd`) and the glTF regions' water `ShaderMaterial`s arrive as stand-ins. A water shader includes it and adds
`atm_wave_height(world xz, 0.0)` to `VERTEX.y` (the swell only, on a coarse mesh).

**The cloud deck** (`89-atmos-d-clouddeck.js`) is ported the way the waves are, so a streamed open world draws the same
cloud in Godot. Its relief is **gradient noise** (Perlin's, quintic fade, with its analytic derivative) written from
`presets.clouddeck`: octaves of billow noise (`puff`: 2|n| - 0.5, rounded domes with sharp creases) heaped by `heap`, bent
by a second noise that drifts its own way so the cloud changes shape, finer octaves for shading. The lattice repeats every
`lattice` cells and each corner's gradient comes from an **integer hash** (lowbias32): `Math.imul` in JavaScript, `uint`
in GLSL ES 3 and Godot's shading language, a 16-bit-halves multiply in GDScript (no unsigned type there), so every engine
computes the same gradients bit for bit. No noise texture, no baked mesh. (The first version was a sum of plane waves:
every crest straight, so the deck showed parallel lines.) drift and evolve move each octave a whole number of lattice
periods per clock period, so the clock's wrap is seamless.

`godot/tools/atmos_clouddeck.js` writes `godot/shaders/atmos_clouddeck.gdshaderinc` from `ATMOS.deckGLSL()` (the uniform
`atmDeckT` becomes the global `atm_deck_t`; `atm_deck_height(xz, y)`, `atm_deck_slope(xz, camDist)`,
`atm_deck_normal(slope)`). **Rerun it after changing `presets.clouddeck`**, then `atmos_golden.js` (the golden keeps a
copy of the include). The `Atmos` autoload sets `atm_deck_t` (its clock wrapped at `presets.clouddeck.period`) and carries
the CPU twin, `Atmos.deck_height(x, z, t, y)` and `deck_slope(x, z, t, camDist)` (is a point in the cloud? a flyer
skimming the tops?), checked against `ATMOS.deckHeight`/`deckSlope` by `atmos_test.gd`. The slope carries the warp's
Jacobian (the warp bends 230 m: leaving it out tilts the normals badly). Checked on 2026-10-06: `test-atmos.js` (the slope
against the height's own finite difference, the deck repeating every lattice span, the seamless wrap); the chunk evaluated
on a GPU (WebGL2) against the JS twin (128 samples: heights within 0.8 mm, slopes within 2e-4, float32 rounding); and a
line-for-line Python copy of the GDScript twin's integer and float arithmetic against the golden vectors (every height and
slope exact). Tune the look in the presets only; the shaders carry no unnamed literal that changes it.

The export record is `{type:'clouddeck', y, bounds, sun, preset:'clouddeck'}`. `godot/krator/atmos_import.gd` makes it a
`krator/clouddeck.gd` node: the same grid as the page (`presets.clouddeck.mesh`: `cells` a side over +-`radius`, denser
near the middle), moved to the camera in steps of `snap` so the billows never swim, drawn with
`godot/shaders/clouddeck.gdshader` (blend_mix, depth_draw_never, unshaded: the page's own lambert from the record's `sun`).
Where the ground rises through the deck it thins by the ground's clearance under the deck's top: the page samples its
host's `ground(x, z)` round the camera into a one-byte texture (`presets.clouddeck.clear`), and Godot samples the scene's
heightfield (`KData.height_at`) the same way at each snap. Gaps: it is unshaded, so it misses Godot's sky light and
shadows; ACES tonemaps it greyer than the page (re-tune `top`/`shade` in the presets if it matters); a depth-fade
(`hint_depth_texture`) would soften the edge with no heightfield, at the cost of the page and the engine differing.
Not yet run in Godot: no Godot on the machine that wrote it.

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

## The shared sky (SKY-PLAN.md, 2026-10-25)

One `shader_type sky` draws Krator's whole sky in Godot, from the same source as the pages:

| Piece | JavaScript (the pages) | Godot |
|---|---|---|
| the shader | `core/atmos/sky/89-atmos-g-sky.js` (`ATMOS.skyGLSL()`, the `atmos_sky` chunk) | `godot/shaders/atmos_sky.gdshaderinc`, **generated** by `node godot/tools/atmos_sky.js`, included by `godot/shaders/sky.gdshader` (the chunk's display colour decoded to linear) |
| the model and the colour script | `89-atmos-e-skymodel.js`, `89-atmos-f-skypresets.js` | `godot/krator/sky_model.gd`, its constants, presets, bright stars and moon epochs read from `godot/data/sky/sky.json` (generated) |
| the host | `core/atmos/host/89-atmos-h-skyhost.js` (`ATMOS.sky`) | `godot/krator/sky.gd`: the WorldEnvironment's Sky (incremental, radiance 128), the sun and giantshine DirectionalLight3Ds, fog (`fog_sky_affect` 0) and exposure from the keys |
| the noise volume | `ATMOS.skyNoiseVolume(64)` | `godot/data/sky/noise64.bin` (generated) as an `ImageTexture3D` |
| the moon maps | the library's `sky.moon.*`, one atlas | the same files, stacked at load |

Checks: `godot --headless --path godot --script res://tests/sky/sky_test.gd` holds the GDScript model to the JavaScript's
numbers (`godot/tests/sky/golden.json`: 24 states over four sites, the colour script, dates, the noise volume, the include's
digest; vectors agree to 1e-6, Godot's `Vector3` being single precision). `godot --path godot --script
res://tests/sky/sky_shot.gd -- --out=<png> --look=giant|cluster|sun|station|up --hour= --day= --fov=` renders it (needs a GPU; first run
2026-10-25 on Vulkan, Forward+). Rerun the generator after any change to `core/atmos/sky`, then the test.
The broken station (`station` in each golden state) and the shooting stars came on 2026-10-26: `sky.gd` sets `uStaDir`,
`uStaAx`, `uStaV` and `uStaK` from the model's `station`, `uMeteor` from the preset's `night.meteors`, and `uRealT` from
`Time.get_ticks_msec()`: the meteors keep wall-clock time, not the game clock.

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

## Lava (`fx/89-atmos-fx-lava.js`)

The export's `lava` records carry the surface's name, its pattern's anchor (`centre`), `flow` (m/s), the vents, `swell`, `channel`
and the preset's name; `PRESETS.lava` carries every number (the plates' and facets' cells, the crack and seam widths, the
colours, the heat by day, night and eruption). Godot: one `.gdshader` with the chunk `lavaGLSL` writes (`lavaSurface`), its
hash the same lowbias32 on `uint`, `TIME` for the module clock, `EMISSION` = the colour times `hotK` (the cracks, seams,
overturned plates and churned patches) so WorldEnvironment glow blooms them, and the swell and vents in `vertex()`. The host
eases `erupt` per second, as the Throne caldera's `SUMMIT.eruptStep` does.

## Snow that lies (`fx/89-atmos-fx-snowcover.js`)

The `snowcover` record carries `base`, `line` and `frozen`; `PRESETS.snowcover` the rate, the melt (and its night share),
the normal's band, the noise and the colours. Godot: the depth is a global shader parameter `atm_snow_depth` stepped by the
autoload exactly as `ATMOS.snowStep` (from the weather's `snow`, `dt` and the hour); `atmSnow(world position, world normal)`
is a `.gdshaderinc` every ground, rock and foliage shader includes, mixing the snow's albedo (and roughness) after its own.
`ATMOS.snowBare(M)` (2026-11-02, opt-in) multiplies the snow by a byte mask, recorded as `snowbare`: in Godot the same bytes in an R8 texture (`KTherm.snow_mask`, `core/terrain/ktherm.gd`), a texel on each raster node, 1 off the box.

The `lee` (2026-10-26, WEATHER item 10) is a global `atm_snow_lee` and `atm_snow_wind_dir` (the wind's direction, from
`atm_wind`); under the rain occlusion map (below) only the base cover lies.

## Height fog, valley mist and the cloud band (R1: `sky/89-atmos-j-fog.js`, `host/89-atmos-j-heightfog.js`)

The `heightfog` record carries the falloff, the reference (`ground` or metres), the sun and sky shares, the shape (`exp2`
or `exp`, with a distance compression), the mist (density, level or `below`, depth, noise, the dawn hours) and the band
(density, bottom and top, cover, noise). Godot: the air is `Environment.fog_height` (the reference), `fog_height_density`
(the falloff), `fog_sun_scatter` (sun), `fog_aerial_perspective` (sky), with `fog_density` from the hour as the sky sets
it; the mist and the band are `atmos_fog.gdshaderinc` (the same three closed-form integrals, `atmFogLayer`, `atmFogPool`,
`atmFogSlab`, and the lowbias32 patch noise) mixed in `fragment()` of the ground and plant shaders over globals `atm_fog_h`,
`atm_fog_mist`, `atm_fog_band`, `atm_fog_x`, `atm_fog_drift`; or, for a world with volumetric fog on, `FogVolume` boxes:
one under the mist level (density from the dawn curve), one slab for the band. The dawn curve and the drift (the wind at the
eye times the gust factor) are the autoload's, as `F.step` is.

**The fog belt** (C1, `ATMOS.fogBelt`). The `fogbelt` record carries the band (`y0`, `y1`, `edge`), `depth`, `density`,
`noise`, `steps`, `windward`, `lee`, `slope`, `rise`, `reach`, the `extent` and `res` of its field, and the weather share.
The field is rebuilt from the Godot ground (`ATMOS.fogBeltMake`'s loop in GDScript: two ground samples `reach` metres either
side along the wind for the windward rise, then k) into an `Image.FORMAT_RGBAH` texture (R ground - y0, G k), given to the
fog include as a global `sampler2D atm_fog_belt_tex` with `atm_fog_belt` (density, y0, y1, edge), `atm_fog_belt_k` (1/depth,
noise, steps, res) and `atm_fog_belt_e` (x0, z0, 1/width, 1/depth); `atm_fog_belt_depth(ro, rd, L)` is `atmFogBeltDepth`
line for line (`textureLod`, the same texel-centre mapping), added to the band's optical depth. Placement in GDScript reads
the same field (`fogBeltCover`), not the texture.

**Thin air** (`preset.air.thin`). `krator/sky.gd` passes the camera's height to its `sky_look` port as the fourth argument
and applies the same lines: the pressure by `air_pressure_at`, then (only with `thin`) `hemiI`, `sunC`, `sunI`, `hazeFloor`
and `fogD`. In the Environment that is `ambient_light_energy` (the sky fill, hence the hard shadows), the sun light's colour
and energy, and `fog_density`. No shader change: the sky shader reads only the look.

**The rain wall** (`fx/89-atmos-fx-rainwall.js`). The `rainwall` record carries the band, the windward direction, `lee`,
`slope`, `reach`, `rain`, the curtains' `extent`, `cell`, `min`, `top`, `alpha`, `colour`, `inside` and `seed`. The curtains
are a `MultiMesh` of quads, one per cell `ATMOS.rainWallCells` keeps (the cell's jitter and phase from `KRAND.hash(seed, ix,
iz, k, 0x7261)`, which `core/rand/krand.gd` reproduces), turned to the eye about the vertical in `vertex()`, the streaks the
same lowbias32 columns in `fragment()`. Inside, the Atmos autoload raises `W.rain` to the eased field under the eye after its
weather step, as the JS hook does, so the rain particles, the wetness and the grey sky follow.

**Acid rain** (`fx/89-atmos-fx-acid.js`). The `acidrain` record (and the weather record's `acid`) carries the pH (a number,
or `field` when the page gives a function: the port takes the same region map), `mmh`, the tint and the pH it is full at,
the etch's base and rate. The Atmos autoload steps the etch with `ATMOS.acidStep`'s line and sets a global `vec4 atm_acid`
(etch, fizz, time, 0) and the rain particles' colour from `acidTint`; `atmos_acid.gdshaderinc` is `ATMOS.acidGLSL()` (the
same lowbias32 cells: pits, streaks, fizz) applied to ALBEDO in the ruin, rock and puddle shaders, times `atm_rain_open`.
The dose is core/hazard's: the autoload registers the same `rain` and `ph` fields with its KHAZ port.

**The air's load** (`fx/89-atmos-fx-airload.js`). The `airload` record (and the weather record's `air`) carries every
number of the load (`clean`, `dust`, `dustH`, `storm`, `stormH`, `stormFloor`, `fetch`, `ash`, `ashH`), the dust module's
`lift` thresholds, the sight law (`sight` {c, p}) and the `contrast`, the fog `shape`, and which fields were given
(`alkali` and `ashAt` are page maps: the port takes the same region rasters). The Atmos autoload runs `ATMOS.airAt` line for
line (the lift from its own wind at the point and the dust mask), eases the storm, and sets `Environment.fog_density` to
`sqrt(-ln contrast) / sight` (or `-ln contrast / sight` for an exponential fog) when that is thicker than the hour's, the
fog colour lerped toward the dust's by the share it adds. It registers the same `dust`, `ash`, `alkali` and `visibility`
fields with its KHAZ port, so the dose, the sight and the drawn fog are one number.

## The rain occlusion map (R10: `fx/89-atmos-fx-raincover.js`)

The `raincover` record carries the size, box, step, lift, depth and the shelter margin. Godot: a
`GPUParticlesCollisionHeightField3D` (follow-camera, the same box) for the rain, snow and ash particles, and an orthographic
`SubViewport` depth of the same box, re-rendered when the eye moves `step` metres, as a global `sampler2D` `atm_rain_occ` with
`atm_rain_occ_box` and `atm_rain_occ_cam`; `atm_rain_cover(world_pos)` (a `.gdshaderinc`, four taps, the margin, the edge
fade) multiplies the wetness (cloud shade's and core/water's) and the fresh snow.

## The wind for leaf shaders (R8: `ATMOS.windGLSL`, `ATMOS.windUniforms`)

`atm_wind` (vec2), `atm_gust_amp`, `atm_time` are already globals (above); `atmos_wind.gdshaderinc` carries `atm_gust(t, xz, w)`
and `atm_wind(t, xz, w, amp)` written from `PRESETS.wind` (the same sum of sines on the travelling front), and
`atm_gust_here(xz)`, `atm_wind_here(xz)`. Foliage and grass sway read them in `vertex()`.

## Lightning (`fx/89-atmos-fx-lightning.js`)

`ATMOS.boltPath(seed, from, to)` is pure data (mulberry32 per strike): the same segments in GDScript, drawn as an
`ImmediateMesh` of camera-facing quads at the weather's flash, with an `OmniLight3D` pulse at the cloud. Each strike queues a
thunder event at `t + dist / 343`; the autoload emits `thunder(dist, power)` and an `AudioStreamPlayer3D` plays it.

## Rules that keep the module portable

1. **A new effect is a preset plus a record.** Put its numbers in `ATMOS.PRESETS` and have its call `A.rec()` what it
   placed. Shaders read the preset; they carry no unnamed literals that affect the look.
2. **Particles stay stateless** unless they need collisions. No per-frame CPU loop over particles.
3. **Time comes from `A.clock`, the hour from the host, weather from `A.W`.** Never `performance.now()` in an effect.
4. **Schedules live in data** (`[on, off]` hours per instance), evaluated in the shader, not in one JS hook per light.
5. **Colours are display-space `[r,g,b]` in presets.** Convert them in each engine, once.
