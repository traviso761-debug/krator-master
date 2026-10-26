# Perceived height, scale and depth: research and proposals (2026-10-26)

The owner (2026-10-26): "do a similar one for enhancing the perception of terrain height". The sibling report on surface
detail is `biomes/DETAIL-RESEARCH.md`; this one covers only height, scale and depth.

**What exists and is not re-proposed:** the shared sky's air, ridge profiles and cloud deck (`core/atmos/SKY-PLAN.md` 3.3, 4, 11);
cloud shadows and rain darkening (SKY-PLAN 11.1); nwlowlands' Inner Wall as far geometry (`biomes/nwlowlands/src/83-host-range.js`);
KSTACKS, carve AO, strata (`core/terrain`); spray scaled to the drop (the core/water row in `HANDOFF-REBUILD.md` "Stage 1, final").
**The gap the survey found:** 27 pages fog with `THREE.FogExp2`, which has one density at every altitude and one colour in
every direction. Almost no page has a shadow map, so a mountain casts no shadow onto the valley. Those two cues, haze that
changes with height and shadows cast across the land, are what make terrain read as big. Neither is in any plan.

## Ranked proposals (TOP = for the final rebuild)

**1. TOP: height fog with sun and sky in-scatter (`atmos_fog`).** The fog chunk is replaced on every ground, rock and flora
material by Quilez's analytic exponential height fog: density falls with altitude, and the fog integral runs along the view
ray. Its colour blends sky blue (Rayleigh, growing with distance) and a sun-coloured forward lobe (Mie, Henyey-Greenstein),
both taken from the shared sky's `air` preset so the land fades into the same colour as the sky behind it.
*Why:* valleys fill and peaks stand clear, so each ridge is lighter than the one in front of it. Lower contrast alone
reads as farther away (O'Shea 1994), and back-lit ridges glow at dawn. *Cost:* 0 triangles, 0 draw calls, about 20 ALU per
fragment; no textures. *Where:* `core/atmos/sky/89-atmos-h-fog.js` (chunk + JS twin for tests), hooked like `ATMOS.cloudShade`; BIO
material makers call it. *Godot:* `Environment.fog_height`, `fog_height_density`, `fog_sun_scatter`, `fog_aerial_perspective`
(depth fog works in Compatibility too). *Effort:* M. *Sources:* https://iquilezles.org/articles/fog/ ,
https://diglib.eg.org/handle/10.1111/cgf14050 (Hillaire: aerial perspective that matches the sky).

**2. TOP: horizon-map terrain shadows and sky visibility (`KHORIZON`).** This is baked once per page: for each texel of the
ground heightfield (and the far ring), the elevation angle of the horizon in 8 to 16 azimuths, packed into two RGBA8 textures.
At run time a pixel is in shadow when the sun is below the horizon angle interpolated for the sun's azimuth (soft over a few
degrees). The mean of the angles gives sky visibility, which works as AO for gorges, canyon floors and the feet of cliffs.
*Why:* mountains cast long shadows across valleys at a low sun, which is the strongest cue for height there is, and it works
at every distance, unlike shadow maps. *Cost:* 0 triangles, 0 calls; 2 to 4 MB of textures at 512x512; 3 taps per fragment;
the bake is about 1 s in JS (or a worker). *Where:* data in `core/terrain/43-core-horizon.js` ([G data], node test);
the shading chunk in core/atmos next to `atmos_cloudshade`, multiplied into the same sun term. *Godot:* the same textures and
a `.gdshaderinc` in `light()`. *Effort:* M. *Sources:* https://diglib.eg.org/handle/10.2312/CGF.v27i4pp1275-1283 ,
https://elib.dlr.de/101497

**3. TOP: a shared far-field ring (`KFAR`).** This generalises nwlowlands' `83-host-range` into a core module. One or two
vertex-coloured rings (grid of about 100 m, then 400 m) from the edge of the ground square out to 20 to 60 km, read from
terrainH or the scale model. Optional extras: vertical exaggeration beyond a distance (x1.1 to 1.3), drop for the planet's
curvature, and a crest pass that sharpens ridgelines. Its colours come from the terrain palette, its shading from #1 and #2.
*Why:* the walls and ranges get real parallax as the camera moves and a lit and shadowed relief that a dome cannot show. The
middle distance (5 to 30 km) is what the dome's ridge layers (SKY-PLAN 3.3) do worst. *Cost:* 0.1 to 0.3M triangles, 1 to 3 calls.
*Where:* `core/terrain/44-core-farfield.js` + its host draw. *Godot:* MeshInstance3D with `visibility_range`, or Terrain3D's
far LOD. *Effort:* M. *Sources:* https://gdcvault.com/play/1025480/Terrain-Rendering-in-Far-Cry ,
https://github.com/TokisanGames/Terrain3D

**4. TOP: fog slabs, valley mist pooling and cloud bands on the flanks.** Chunk #1 takes up to two extra slabs, each a band
between altitudes h0 and h1, with density shaped by the noise volume and the wind. The low slab is dawn mist pooled in basins
(its floor follows a blurred low-pass of the heightfield). The high slab is a cloud band that wraps a range at mid-height,
so the peaks rise out of it. *Why:* a layer that cuts a mountain gives an absolute height reference, and the peaks above it
read as tall. *Cost:* 0 calls; about 2 noise taps per fragment. *Where:* `89-atmos-h-fog.js`, slabs in `PRESETS.sky`.
*Godot:* FogVolume boxes with `FogMaterial.height_falloff` (Forward+ only), or the same slabs in the shader. *Effort:* M.
*Sources:* https://www.guerrilla-games.com/read/the-real-time-volumetric-cloudscapes-of-horizon-zero-dawn ,
https://docs.godotengine.org/en/stable/tutorials/3d/volumetric_fog.html

**5. Altitude bands drawn from one rule.** A placement rule, `BIO.altBand({treeline, ecotone, snowline})`, scales tree
density and instance size down toward the treeline (krummholz near it). Snow takes its line from aspect and slope (it lies
lower on shaded faces), into `fx/snowcover`. *Why:* a gradient of trees of known size is a ruler laid on the slope.
*Cost:* fewer instances. *Where:* `core/biome/40-core-place.js`. *Godot:* the same placement data. *Effort:* S-M.
*Source:* https://www.advances.realtimerendering.com/s2021/jpatry_advances2021/index.html (Ghost of Tsushima's vistas).

**6. Objects of known size, for scale.** Raptors soaring at cliff height (seen below the viewer from a summit), switchback
trails and cairns, a lone hut at a far ridge. *Why:* familiar size gives the absolute scale that height fog cannot.
*Cost:* 1 to 3 instanced calls. *Where:* core/biome fauna (`35-core-anim`) + the dress fragments. *Godot:* MultiMesh. *Effort:* S.

**7. Rim light on the ridgelines.** Where #1's sun lobe is strong and the ground normal faces away from the view (ndotv < 0.2),
a thin brightening is added at the silhouette. *Why:* it separates layered ridges against the sky when the sun is behind them.
*Cost:* about 5 ALU. *Where:* `atmos_fog`. *Godot:* the same in `fragment()`. *Effort:* S.

**8. Camera: lens and eye height.** Views get a vertical FOV of 45 to 55 degrees (wide angles flatten mountains), the walk view
an eye height of 1.6 m, and vista views a slow lateral drift, which gives parallax. *Cost:* none. *Where:* core/host camera.
*Godot:* Camera3D. *Effort:* S.

**9. Depth precision for the far ring.** Either `logarithmicDepthBuffer` on pages with #3, or two passes split at 5 km.
This prevents z-fighting at 50 km. *Cost:* the depth write disables early-z (log), or one extra camera pass. *Godot:* none
needed (reverse-Z). *Effort:* S.

**10. (Optional) cascaded shadow maps near hero cliffs and towers.** three.js `CSM` with 2 to 3 cascades, only inside about 300 m.
*Why:* it adds contact shadows that #2 misses. *Cost:* 2 to 3 shadow passes over the near geometry, too much for integrated GPUs
as the default; keep it as a quality setting. *Godot:* DirectionalLight3D PSSM. *Effort:* M.
*Source:* https://threejs.org/examples/#webgl_shadowmap_csm

## The final rebuild's four, and why

**#1, #2, #3, #4.** None of them adds draw calls except #3, which adds 1 to 3. #1 and #4 are one chunk. #2 is one bake and
three texture taps. Together they deliver the two missing cues, haze graded by height and terrain shadows, plus real parallax
on the walls, and each has a direct Godot counterpart. They must land in core/atmos after the shared sky rollout merges, since
they read its `air` preset and hook the same materials as `cloudShade`. #5 to #8 are cheap follow-ups for each biome.

Further reading: https://dev.epicgames.com/documentation/unreal-engine/exponential-height-fog-in-unreal-engine ;
https://docs.godotengine.org/en/stable/classes/class_environment.html ;
https://github.com/takram-design-engineering/three-geospatial (Bruneton atmosphere in three.js) ;
https://researchportal.murdoch.edu.au/esploro/outputs/journalArticle/Contrast-as-a-depth-cue/991005543080007891
