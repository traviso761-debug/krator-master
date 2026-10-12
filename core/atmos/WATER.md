# Water: one shared module for every wet surface

**Status: a plan for the refactor, not started (2026-10-10).** It touches `core/atmos`, `core/terrain`, the biome
hosts and about thirty-five built pages, so it belongs with `full-refactor` (its `ROADMAP.md`), not on `main`
while the refactor is paused (`CLAUDE.md`, "Working rules while the refactor is paused"). `TODO.md`, "Water",
points here.

Sources: an audit of every water surface in the repo (section 1), and **Halcyon** (github.com/billpwchan/halcyon,
MIT, three.js r186 on WebGL2, read 2026-10-10): a tropical atoll whose sea is a Tessendorf FFT ocean on a CDLOD mesh,
with a shore-wave model on a coastline distance field and a ripple simulation for wakes. Section 3 says what to take
from it and in which order. Its code is read for ideas; anything taken is written as a Krator fragment.

## 1. What exists today (audit, 2026-10-10)

Thirty-nine builds draw water. Five take the shared wave field (`core/atmos/89-atmos-a-waves.js`,
`#include <atmos_waves>`); everything else runs its own ripple or a static material. Unless a row says otherwise:
the clock is a `uT`/`uTime` uniform advanced by `dt` that **never wraps**; reflection is a Fresnel mix to a flat
`uSky` colour (no `ATMOS.skylight`, no envMap); there is no refraction, no depth buffer, no caustics; nothing bobs.

### 1.1 On the shared wave field

| Build | Where | Kinds | Notes |
|---|---|---|---|
| `settlements/voth` | `src/75-terrain.js:92-186` | bay, chinampa canals (gaps in the sheet) | warped 250² plane, swell displaces, `aDepth` tint, foam lap on `atmWaveT`. Ships sit at fixed heights |
| `settlements/noahs-regret` | `src/82-nr-water.js` | Ring Sea, flooded holds | Voth's shader; scene has `skylight`, the water does not take it |
| `openworld/little-demo` | `src/83-world-water.js` | sea, lakes, salt lakes, named rivers | one 16² sheet per chunk, log depth, `aSalt`; "skylight not yet" |
| `settlements/locus`, `settlements/mungo` | `src/75-terrain.js:106-154` | salt lake, river, delta, pools | not displaced; own 4-sine ripple on unwrapped `uTime` blended with `atmWaveNormal` by `aOpen` |

### 1.2 Own shaders and materials

| Build | Where | Kinds | How |
|---|---|---|---|
| `kits/ringsea` | `src/40-rs-core.js:133-185`, `90-rs-scene.js`, `94-rs-anim.js` | roadstead | own 4-wave **Gerstner** sum + CPU twin `rsSeaH`; hulls heave, pitch, roll (`rsRide`); Jacobian whitecaps; Kelvin wakes; `performance.now()` clock; displacement fades past 570-680 m (grid too coarse) |
| `biomes/geyser` | `src/86-host-water.js` | Ring Sea, creek, terrace pools | own 3-sine sea, surf foam from `aD`; creek flow sines; pools filled in the ground shader |
| `settlements/girder`, `mavs-refuge`, `yuni` | `src/75-terrain.js` | brook/river ribbons, cataracts, canal | the **flow shader**: 2-sine height, sin-hash noise scrolling downstream, cataract foam (`aFall`), edge alpha |
| `settlements/shade`, `verge` | `45-host-stage.js`, `47-verge-water.js` | streams, gorge basins, cataracts, falls, plunge pools, salt lakes | Sedesert's 4-sine ripple; fall = 2 scrolling texture samples; mist and spray sprites |
| `settlements/port`, `ys` | `src/71-port-terrain.js:117-141` | sea, harbour, terraced river | MeshStandard, normal map baked from 22 sines, **static**; underwater fade in every MAT; moiré (Ys KI:55) |
| `settlements/reedlake` | `src/74-rl-mat.js`, `94-rl-anim.js` | lake | scrolled sinusoid canvas texture; boats do not bob (KI:6) |
| `settlements/xanadu`, `jimjam`, `highlands`, `dalab`, `iziz`, `screamers`, `streetlab`, `kits/ancients`, `kits/post-apoc` | various | rills, fountains, pools, troughs, moats, reservoirs, harbour plates, Lambert seas | static MeshStandard/Lambert/Basic boxes, discs, plates |
| biome hosts (16: swbay, nwbay, nwlowlands, swlowlands, eastabyss, rift, sedesert, ebadlands, shighlands, ehighlands, crater-drylands, throne, nhighlands, xanadu, geyser, hyperjungle) | `45-host-stage.js` / `84-host-ground.js` | bays, lakes, tarns, bog pools, river and stream ribbons, cascades, falls, mist | vertex-coloured ShaderMaterial with a 3- or 4-sine normal ripple on `uT`, not displaced; foam cards; `nhighlands` and `xanadu` have a `waterMat(flow)` whose ripple runs downstream. Kits draw no water; they read `BIO.waterH` |
| `core/atmos` | `1-street.js`, `6-sewer.js`, `3-particles.js`, `4-weather.js` | fountain jet, outfall trickle, moat mist, `W.wet` | `W.wet` is computed and read by nothing |
| `godot/` | `shaders/atmos_waves.gdshaderinc`, `krator/atmos.gd:183` | one flat PlaneMesh per tile | the chunk and the CPU twin are ported and tested; no water shader uses them; ShaderMaterial water imports magenta |

### 1.3 What the audit says

- **Open water breaks the README's rule** ("open water uses the shared wave field") in ringsea, geyser, port, ys,
  reedlake, verge and every biome bay, lake and tarn: ten different ripples for the same sea.
- **Nine clocks never wrap.** Only the shared field and Voth's foam lap are seamless.
- **Nothing floats properly.** Only the Ring Sea kit reads a CPU height. Reedlake's boats, the biome rafts and
  pads (eastabyss KI:26, rift KI:39), Voth's ferries and Mungo's decks are all fixed.
- **No water reflects the sky.** The skylight reaches MeshStandard only; every animated water is a ShaderMaterial.
- **Rivers are exempt and fragmented.** The README exempts river ribbons because they flow. Four flow shaders exist
  (Girder's, Sedesert's, nhighlands', geyser's). `KRELIEF.river` already stores surface and slope per vertex
  (`core/terrain/38-core-relief.js:120`), and nothing reads the slope.
- **Falls and cataracts are geometry problems first:** 26° chutes (swbay KI:43), falls that do not arc and
  fixed-width channels (sedesert KI:21-64), ramps for risers (nwbay KI:20), streams painted on the ground
  (shighlands KI:28).

## 2. Target shape

One module, `core/water/`, with its data side free of three.js ([G data]) and one drawing side that takes
`core/atmos` (waves, skylight, clock) and `core/terrain` (heights, rivers). A build names which **kinds** of water it
has; it writes no water shader of its own.

| Kind | Data ([G data]) | Drawing | First takers |
|---|---|---|---|
| **open** (sea, bay, lake, salt lake) | `seaLevel(t)` (tides, `TODO.md` "Worlds"); the wave field's CPU twin for everything that floats | the shared wave field on a **CDLOD water mesh**; skylight reflection; depth absorption | ringsea, geyser, port, ys, reedlake, biome bays and lakes |
| **shore** (the band within ~100 m of land) | a **distance-to-shore field** (jump-flood on the land mask, `core/mask`; Ys's land-sea lattice is the same shape) | shoaling, a breaking lip leaning up the gradient, swash, wet sand; shore froth | voth, ys, noahs-regret, mavs-refuge, little-demo, every biome bay |
| **flow** (river, stream, creek, canal, rill) | a **flow field** along the `KRELIEF.river` polyline: direction, speed and slope per vertex; bank distance | one flow shader: normals advected along the flow in two phases (the flow-map trick, no stretching), foam from slope and convergence, edge foam from bank distance, depth absorption | girder, mavs-refuge, yuni, locus, mungo, shade, verge, every biome ribbon |
| **fall** (waterfall, cataract, spillway) | the fall's lip polyline, drop and plunge point (from the river's slope breaks) | a curtain that **arcs** (a parabola from the lip speed), scrolling streaks plus a Jacobian-style foam term, the plunge pool churned by the **ripple sim** stamped at the plunge point, spray and mist as `core/atmos` particles | shade, verge, sedesert, swbay, nwbay, nhighlands, girder's cataract, ancients' dam |
| **still** (pools, fountains, troughs, cisterns, moats) | level only | one still material: skylight reflection, a faint ripple, a fountain stamp into the ripple sim where there is a jet | xanadu, jimjam, iziz, dalab, highlands, yuni's courts |
| **wet** (ground after rain, swash, splash zones) | `W.wet` from the weather, the swash extent from the shore field | darkened, sharpened ground (roughness down, albedo down) | every build on `core/atmos` weather |

Rules, from the audit and the existing README:

1. **One clock.** Every water animation runs whole cycles per `PRESETS.waves.period` on `atmWaveT`, flow shaders
   included (scroll by `fract(atmWaveT*c/period)`). Halcyon does the same: frequencies quantised to a 240 s loop.
2. **Every surface has a CPU twin.** `WATER.heightAt(x,z,t)` for open and shore water, `WATER.flowAt(x,z)` for
   rivers, so boats, rafts, pads, swimmers and ferries ride what the shader draws. The Ring Sea kit's `rsRide`
   becomes the shared one.
3. **Displacement only where the mesh can carry it**, shading everywhere (the wave field's rule today). The CDLOD mesh
   makes the mesh fine where the camera is, which ends the "fades past 600 m" and "cells are 75 m at the rim" rows.
4. **Water is drawn after the opaque pass** so it can read depth: absorption along the true path through the water
   (Halcyon: Snell's law, `exp(-sigma*path)`), clean edges on piers, reef steps and hull waterlines. Voth's
   per-vertex `aDepth` and Port's `portUW` injection retire.
5. **Reflection is the sky**, from `ATMOS.skylight`, not a flat colour; screen-space reflections are a later option.
6. **The data side runs in Godot as it is:** the shore field and the flow field are textures, `seaLevel` and the
   twins are GDScript (`atmos.gd` already has the wave twin), and the shaders become `.gdshader` on the global
   parameters `core/atmos/GODOT.md` lists.

## 3. From Halcyon: what to take, in order of value against risk

1. **The CDLOD water mesh.** Instanced 17×17 nodes, 13 levels from 8 m leaves, split by distance, vertices morphing
   between levels, root snapped to the camera. Independent of any wave model; fixes ringsea's fade, Voth's rim cells,
   little-demo's per-chunk sheets. Smallest change with the widest effect.
2. **The shore distance field and shore-wave model.** A jump-flood distance to the coastline; waves displaced only
   within ~110 m of shore and ~360 m of the camera, shaded beyond that (no sawtooth waterline); a breaking lip
   leaning along the shore gradient; swash and wet sand decided per pixel against the heightfield. This is the one
   visible upgrade for every build with a coast, and it is pure data on the land mask.
3. **Depth-buffer absorption and the pass order.** Needs a depth texture from the opaque pass: on r128 a
   `WebGLRenderTarget` with `depthTexture`, available.
4. **Foam as the Jacobian with decay.** `J=(1+dDx/dx)(1+dDz/dz)-dDxz²`, whitecap where `J<0.6`, accumulated with a
   1.8 s decay. The Ring Sea kit has the first half already. Works on the sine field (its slopes are analytic) as well
   as on an FFT.
5. **The FFT ocean itself**, as a second backend behind the same `atmos_waves` API. Three 256² cascades (431, 97,
   23 m tiles), a Phillips wind sea plus a narrow swell lobe, 54 small passes a frame; a deterministic seed
   (`rng(1337+7919*cascade)`); a CPU twin of the strongest 76 modes for buoyancy. The presets (wind speed and
   direction, swell direction and wavelength, significant height) replace the nine hand-tuned sines. Cost: ping-pong
   float render targets (r128 has `FloatType` targets; its multiple-render-target support is experimental, so write
   two single targets or upgrade three.js); in Godot a compute shader, not a shader include. Do this after 1-3, and
   only for worlds whose sea is the subject (Ys, the Ring Sea, Noah's Regret, the geyser basin).
6. **The ripple simulation.** A 512² damped wave equation (damping 0.985) following the camera, with up to 256
   instanced soft-disc stamps a frame and its own foam channel. Wakes for the Ring Sea's vessels and swimmers; the
   plunge pools and fountains of section 2 stamp into it too. GPU-only, so Godot gets a second small sim.

**What does not transfer:** Halcyon's ES-module Vite build and glTF/KTX2 assets (Krator pages are single files);
its procedural sky panorama (Krator has `core/atmos` skylight); its SSR as a first step (take the sky first).

## 4. Streams and waterfalls: what makes them read as real

The FFT does nothing for a stream: it models a statistically stationary deep-water sea, and a stream is advected
flow over a bed. What helps, in order:

- **Geometry before shading.** Falls arc, chutes are not 26° ramps, channels vary in width, and the surface never
  climbs downstream (the `KRELIEF.river` rule). Most of the open KNOWN_ISSUES rows are this.
- **Advected normals, not scrolling noise.** Sample the normal twice along the flow direction, offset by two
  half-period phases and cross-faded (the flow-map trick), so the texture moves with the water and never stretches.
  Speed and direction come from the flow field, which comes from the polyline and slope `KRELIEF.river` already stores.
- **Foam where the water works:** slope (rapids), convergence (behind rocks, at confluences), bank distance (edge
  foam), and at the plunge pool the ripple sim stamped at the fall's foot with its foam channel decaying downstream.
- **Depth absorption** over the bed, so a shallow riffle is clear and a pool is dark; Halcyon's path-length term
  does both from the depth buffer.
- **Spray and mist as particles** from `core/atmos` (`mistRing`, `spray` exist), driven by the fall's drop and
  width, not placed by hand.
- **Sound** (there is none anywhere): a looped procedural wash whose gain follows distance to the nearest fall or
  rapid, in Godot an `AudioStreamPlayer3D`.

## 5. Phases and what each rebuilds

| Phase | Work | Rebuild and check |
|---|---|---|
| 0 | `core/water/README.md`: the kinds, the API (`WATER.open/shore/flow/fall/still`, `heightAt`, `flowAt`, `seaLevel`), a node test for the twins | none |
| 1 | CDLOD mesh + the shared field + skylight + Jacobian foam; the Ring Sea kit's Gerstner, `rsSeaH` and `rsRide` move into it | voth, noahs-regret, little-demo, locus, mungo, ringsea, geyser, port, ys, reedlake; `port_baseline` |
| 2 | shore field + shore waves + wet sand; `seaLevel(t)` | the coast builds above plus every biome host with a bay |
| 3 | the flow field and one flow shader; falls that arc; plunge pools; spray from atmos | girder, mavs-refuge, yuni, shade, verge, every biome host with a ribbon |
| 4 | still water and `W.wet` | xanadu, jimjam, iziz, dalab, highlands |
| 5 | FFT backend (opt-in per world); ripple sim | the sea worlds |
| 6 | Godot: shore and flow fields as textures, `.gdshader` per kind, the twins in GDScript, a compare test against the three.js reference for a fixed seed | `godot/tests/atmos` |

Every phase ends with `python3 tools/port_baseline.py` and a rewritten baseline for the pages changed on purpose.
