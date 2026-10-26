# Weather rendering: research and proposals for the final rebuild (2026-10-26)

Research only; nothing in core changed. Scope: weather (sibling reports cover lush-terrain detail and perceived height).

## What exists (core/atmos, core/water)

- `89-atmos-4-weather.js`: one global state `W` (rain, fog, wet, wind, flash, opt-in snow, ash), eased by a pure
  `weatherStep`; `auto` follows the hour (dawn fog, an evening shower). Rain streaks follow the camera; a bolt in storms.
- `ATMOS.windAt` / `atmGust`: a veering wind with gust fronts that travel downwind (smoke, fog banks, rain, cloth, dust ride it).
- `host/89-atmos-e-weatherhost.js` (`bindWeather`): fog, sun and sky eased by the weather; wet ground via `WATER.wetGround`
  (`WATER.wetGroundRain`: W.wet on up-facing faces); snow cover.
- `fx/89-atmos-fx-snowcover.js`: snow that lies and melts (pure step, up-faces first).
- The shared sky: cloud coverage, cloud shadows (`cloudShade`).
- Gaps found: the weather has **no position** (it rains everywhere at once); rain **falls through canopies and roofs**;
  no puddles, no rain rings on water or puddles, no splashes; foliage sway (`BIO.WIND`, `30-core-foliage.js`) uses its own
  global vector and sinusoids, not ATMOS's travelling gusts; fog is three's uniform fog, not height fog.
- Already on HANDOFF-REBUILD.md's "Stage 1, final" table (not re-proposed): `cloudShade` recursion; `ATMOS.sky` overwriting
  the weather's fog; the duplicated ground dither.

## Ranked proposals

**1. Physically based wetness and puddles in hollows** (TOP)
What: extend `WATER.wetGround` along Lagarde's model: wet darkens albedo by porosity and lowers roughness; puddles fill
where a baked hollow mask (terrain height minus its blurred height, flat normals only) passes a level that rises with
W.wet and drains after. Puddles take a mirror-smooth surface and the sky reflection.
Adds: the single biggest "it has rained" read, in every biome, for free in draw calls.
Cost: shader only (one extra mask sample, a few ALU); a 256-512 px hollow mask per chunk or per page (R8, <1 MB), baked
from `terrainH` on the CPU (plain data). 0 draw calls.
Where: `core/water/51-core-water-kinds.js` (`wetGround` GLSL), the hollow bake in `core/water/21-core-water-shore.js` beside
`wetGroundAt`. Godot: the same mask as a texture, the same lines in the terrain `.gdshader`. Effort: S-M.
Sources: [Lagarde, Water drop series (3dvf summary)](https://3dvf.com/actualite-5676-sebastien-lagarde-simulation-pluie-en-jeu-video-html/),
[fxguide, making wet environments](https://www.fxguide.com/?p=43362), [UE puddle function (slope + height)](https://axton.artstation.com/projects/nYeAJe).

**2. Rain rings on water and puddles** (TOP, with 1)
What: a procedural ripple normal (a grid of hashed cells, each an expanding ring on its own phase) added to puddles and to
core/water's still and open kinds, scaled by W.rain. Seeded by integer hash, not `Math.sin`.
Adds: water that visibly takes the rain; sells rain at night and in fog where streaks vanish.
Cost: shader only (2 octaves of cells). Where: a `WATER.rainRippleGLSL()` in `core/water/51-core-water-kinds.js`, read by
`wetGround` and the water kinds. Godot: a `.gdshaderinc` (ports exist). Effort: S.
Sources: [Godot rain puddles with ripples (ports Zavie's Shadertoy)](https://godotshaders.com/shader/rain-puddles-with-ripples-and-reflection/),
[Tatarchuk, ToyShop rain (SIGGRAPH 2006)](https://advances.realtimerendering.com/s2006/Tatarchuk-Rain.pdf).

**3. Rain occlusion map** (TOP)
What: a top-down depth/height map of everything over the ground (canopy, roofs, overhangs) in a box round the camera
(e.g. 256 px over 160 m), re-rendered only when the camera moves ~20 m; rain streaks, splashes, wetness (1), snow cover
and drips read it, so it is dry under a tree and a roof, and drips fall from leaf edges after rain.
Adds: fixes the visible error of rain inside canopies, under eaves and in caves; one map serves rain, snow, ash and wetness.
Cost: one ortho depth pass of near geometry every few seconds (cull to the box; skip grass); a 256 px float texture.
Where: `core/atmos/89-atmos-4-weather.js` (a `rainCover` pass), sampled through a GLSL helper beside `atm_snow`; snow cover
takes it in `fx/89-atmos-fx-snowcover.js`. Godot: `GPUParticlesCollisionHeightField3D` (made for rain and snow) plus the
same texture for wetness. Effort: M.
Sources: [Godot GPUParticlesCollisionHeightField3D](https://docs.godotengine.org/en/4.2/classes/class_gpuparticlescollisionheightfield3d.html),
[Tatarchuk ch. 3, artist-directable rain](https://advances.realtimerendering.com/s2006/Chapter3-Artist-Directable_Real-Time_Rain_Rendering_in_City_Environments.pdf).

**4. Analytic height fog, valley fog and rolling banks** (TOP)
What: replace three's uniform fog with the closed-form exponential height-fog integral (with the near-zero guard), a sun
in-scatter tint, and a density that thickens in low ground at dawn and drifts with `atmGust`. Fog then pools in valleys
and thins on ridges, which also sells terrain height.
Adds: depth and layering at almost no cost; fixes "fog is a grey wall". Cost: a replaced `fog_fragment` chunk; 0 draws.
Where: `core/atmos/host/89-atmos-e-weatherhost.js` (it already eases fog), GLSL in `89-atmos-0-core.js`; land it with the
handoff's "sky overwrites the weather's fog" fix. Godot: `Environment` height fog plus `FogVolume`s for banks. Effort: S.
Sources: [Quilez, better fog](https://iquilezles.org/articles/fog/), [Flax ExponentialHeightFog.hlsl](https://git.flaxengine.com/Flax/FlaxEngine/src/commit/38cd840a66e1ec9b5fc310b54fff327a9217974d/Source/Shaders/ExponentialHeightFog.hlsl),
[Godot fog volumes](https://godotengine.org/article/fog-volumes-arrive-in-godot-4).

**5. One wind field for foliage, grass, water and particles**
What: `BIO.WIND` reads ATMOS's wind and gusts (`atmGust`), so a gust band visibly rolls across grass and canopy, and
water chop scales with the local wind. Adds: the Ghost of Tsushima effect; storms feel driven. Cost: shader ALU only.
Where: `core/biome/30-core-foliage.js` (`_tickWind`, the sway lines), `core/atmos/89-atmos-0-core.js`. Godot: one
`global uniform` set by the weather node. Effort: S-M (every foliage taker rebuilds anyway).
Sources: [GDC 2021, Blowing from the West](https://gdcvault.com/play/1027124/Blowing-from-the-West-Simulating),
[GDC 2021, Procedural grass in Ghost of Tsushima](https://gdcvault.com/play/1027214/Advanced-Graphics-Summit-Procedural-Grass).

**6. Weather cells: fronts that cross the map (weather as a moving system)**
What: a seeded set of cells (rain, storm, fog, snow, dust) drifting with the wind, pure data: `weatherAt(x,z,t)` returns
the local W; the global W becomes the camera's sample; per-biome weights as in The Witcher 3. Feeds sky coverage, rain
shafts (7), lightning (8). Adds: watching a storm arrive. Cost: CPU trivial; a 64 px coverage texture for the sky.
Where: `core/atmos/89-atmos-4-weather.js` (pure step), the sky's coverage in `sky/89-atmos-g-sky.js`. Godot: same records.
Effort: M (touches the shared sky; after the sky rollout). Sources: [Nubis, Guerrilla](https://www.guerrilla-games.com/read/nubis-authoring-real-time-volumetric-cloudscapes-with-the-decima-engine),
[Witcher 3 weather, regional weights](https://www.gamebanshee.com/kwa9c).

**7. Distant rain shafts and virga**: soft cylinders under storm cells, noise-streaked, depth-faded. 1-4 draws.
`core/atmos/89-atmos-4-weather.js`. Godot: cylinder `FogVolume` or mesh. Effort: S-M (needs 6).
Source: [Cinevva, clouds and weather in games](https://app.cinevva.com/blog/2026-05-04-volumetric-clouds-and-weather).

**8. Better lightning**: a branched bolt by seeded midpoint displacement (KRAND), the cloud deck lit from inside, the
strike placed in the storm cell, thunder delayed by distance / 343 m/s (an event in W for the host's audio). 1 draw per
bolt. `89-atmos-4-weather.js` (`strike`). Godot: an `ImmediateMesh` line and an `OmniLight3D` pulse. Effort: S.
Source: [gamedev.net, lightning bolts](https://gamedev.net/blogs/entry/1901925-lightning-bolts).

**9. Splashes and ground mist**: one instanced set of splash sprites on the occlusion map (3) round the camera, and a low
mist sheet in heavy rain. 1-2 draws, ~2-4k instances. Godot: `GPUParticles3D` with collision. Effort: S (needs 3).
Source: [Tatarchuk, ToyShop rain](https://advances.realtimerendering.com/s2006/Tatarchuk-Rain.pdf).

**10. Snow cover by occlusion and wind**: no snow under canopy (3), deeper on lee faces (dot with wind), rain becoming
snow below a temperature line. Shader only. `fx/89-atmos-fx-snowcover.js`. Godot: the same GLSL. Effort: S.

**11. Dust walls (haboob) and ash fronts**: a dust cell (6) as a moving wall: `3d-dust` density and height fog tinted
brown along its front, visibility dropping as it passes. `89-atmos-3d-dust.js`. Godot: `FogVolume` box moving with it. Effort: S-M.

**12. Weather as gameplay data**: export `W` per place (wet, slippery, wind, fires out, shelter), as Breath of the Wild's
rain makes climbing slip. No render cost. `89-atmos-8-export.js`. Effort: S.
Source: [Zelda Wiki, Rain](https://zelda.fandom.com/wiki/Rain).

Seasons (a season scalar for foliage tint, snow line and crops) is left out: L, and it reaches every kit.

## For the final rebuild

Take **1 + 2 (wetness, puddles, rain rings), 3 (rain occlusion) and 4 (height fog)**. They are shader-side or one cheap
pass, run on integrated GPUs, keep the weather a plain-data state, map one-to-one onto Godot, and fix the two visible
errors (rain under cover, flat grey fog). 5 (one wind field) is the next cheapest if the foliage takers rebuild anyway.
6 to 9 (fronts, shafts, lightning, splashes) form one later stage after the shared sky lands.
