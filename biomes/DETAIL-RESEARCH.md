# Perceived detail in lush terrain: research and proposals (2026-10-26)

The owner (2026-10-26): "do an internet search for better ways of enhancing perceived detail in lush terrain, both near
and far, and propose features to add to the final rebuild". Read-only research; nothing here is built.

**What exists already (not re-proposed):** instanced flora on `BIO.put` with chunked runtime LOD (hero/mid/far/floor
bands) and blob far impostors; `BIO.leafMat` with sway, bent normals and a two-sided light mix; iridescent bark; the
material library with a world-noise `breakup` (`core/materials/record/23-mat-record.js`, `25-matlib-host.js`); the shared
sky, fog, weather, wet ground, snow cover and cloud shadows (`core/atmos`); per-biome canopy shade baked into the ground
paint (nhighlands). The HANDOFF-REBUILD "Stage 1, final" table already holds the LOD-by-chunk rework and a dithered
cross-fade for the 1.2 km pop, so those are dependencies here, not proposals. Findings in the code: **the ground shader
is per-biome host code** (`biomes/*/src/45-host-stage.js`, `47-host-land.js`, `84-host-ground.js`), and hex-cell texture
bombing (`kdither`) is copied in Korona and Farside, not in core. Nothing in core uses `alphaToCoverage`.

## Ranked proposals

**1. One core ground shader: height-blended splat layers with hex-tiled detail and a distance scale. (TOP)**
What: move the per-biome ground into `core/terrain` as one material: up to 4-6 library layers per pixel chosen by the
painted zone weights, blended by each layer's height (the "highest wins, blend near ties" rule), every layer sampled
with Mikkelsen's hex-tiling, and the detail UV scale doubling past ~60 m (two scales cross-faded) so far ground keeps
grain without a visible grid. Why: near, height blending gives pebbles-through-moss edges instead of a smear; far, the
tiling vanishes and the macro paint still reads. Cost: 0 triangles, 0 draw calls; ~3 fetches per layer per map (cap
at 2 hex samples on integrated GPUs, `KMAT.breakupOn`-style switch); memory only the layers' existing sets. Where:
`core/terrain/43-core-ground.js` (new), lifting `kdither` from `biomes/korona/src/47-host-land.js`; layer data in
`materials.json`. Godot: a `ground.gdshader` with the same parameters (the godotshaders hex-tiling port is MIT);
Terrain3D does height blending if the port adopts it. Effort: L (it replaces many host grounds; port one biome first).
Sources: https://jcgt.org/published/0011/03/05/paper.pdf , https://iquilezles.org/articles/texturerepetition ,
https://godotshaders.com/shader/stochastic-hex-tiling-mikkelsens-adaptation/

**2. Floor cover tinted from the ground and fading into it. (TOP)**
What: grass and floor cards sample the same ground paint at their root (world xz to paint UV) and take its colour and
the terrain normal, then shade root-to-tip from that colour to the species' tip colour; past the floor band they shrink
and fade their alpha into the ground, which carries a matching "grass colour" term in its paint. Why: removes the
visible edge of the floor band and the colour mismatch of cards on paint, so the field seems to run to the horizon.
Cost: one texture fetch per vertex; 0 extra draws; no memory. Where: `core/biome/30-core-foliage.js` (`leafMat` option
`groundTint:{tex,box}`), the floor band end in `20-core-kit.js`. Godot: the same uniform sampler in `leaf.gdshader`
(Godot's own grass docs and Terrain3D's instancer do this). Effort: S-M. Sources:
https://gdcvault.com/play/1027214/Advanced-Graphics-Summit-Procedural-Grass ,
https://forums.unrealengine.com/t/blending-grass-with-terrain-with-no-seam/412439

**3. Octahedral impostors for the far trees. (TOP)**
What: bake each species (or variant) at build time into an 8x8 or 12x12 octahedral atlas of colour plus normal-depth,
and draw the far band as one instanced quad per tree that picks and blends the three nearest views. Why: replaces the
blob impostors with silhouettes and lit crowns that turn as the camera moves, the largest far-field gain available.
Cost: 2 triangles per tree, one draw per atlas page; ~1-4 MB per species at 1024-2048 px (budget it in the pack);
fragment cost of 3 view blends. Where: `core/biome/20-core-kit.js` (far bake) plus a new `core/biome/33-core-impostor.js`.
Godot: SIsilicon's Octahedral Impostors addon, or the same atlas read in a `far.gdshader` on a MultiMesh. Effort: M-L
(bake at build time in the headless browser; atlases deterministic). Sources:
https://discourse.threejs.org/t/a-forest-of-octahedral-impostors/85735 ,
https://github.com/SIsilicon/Godot-Octahedral-Impostors

**4. Alpha-to-coverage on leaf and grass cards. (TOP)**
What: turn on `alphaToCoverage` for cutout foliage when the renderer has MSAA, keeping `alphaTest` as the fallback.
Why: soft, unaliased leaf edges and no shimmering fringe at mid range; the canopy stops "sparkling" when the camera
moves, which reads as detail rather than noise. Cost: free with MSAA on; no draws or memory. Where:
`core/biome/30-core-foliage.js` (one flag in `leafMat`/far kind), a host switch. Godot: `alpha_antialiasing_mode`
(alpha-to-coverage plus alpha-to-one) on StandardMaterial3D/shader render mode. Effort: S. Sources:
https://en.wikipedia.org/wiki/Alpha_to_coverage , https://github.com/godotengine/godot/pull/40364

**5. Per-instance ambient occlusion and crown depth darkening.**
What: bake a vertex AO into each species mesh (distance to crown centre, height in the crown) and a per-instance
"crowding" value from neighbours counted in `KSPACE` at placement. Why: interior leaves darken, dense stands read deep,
lone trees read lit, without SSAO. Cost: one vertex attribute and one instance float; 0 draws. Where:
`core/biome/30-core-foliage.js`, `40-core-place.js`. Godot: a custom instance data channel on MultiMesh. Effort: S-M.
Source: https://www.guerrilla-games.com/read/gpu-based-procedural-placement-in-horizon-zero-dawn

**6. Leaf translucency term with sun-behind boost.**
What: add a view-dependent back-light (pow of dot(view, -sun)) scaled by a per-species thickness to the existing
two-sided mix, nearer LODs only. Why: backlit canopies and grass glow, the cue players read as "lush". Cost: a few ALU
per fragment. Where: `core/biome/30-core-foliage.js` (`leafMat`). Godot: `backlight` in the shader. Effort: S. Source:
https://docs.unity3d.com/ScriptReference/SpeedTreeImporter-enableSubsurfaceByDefault.html

**7. Wind gust waves across fields and canopies.**
What: a scrolling world-space gust noise driven by the `ATMOS` wind, read by grass and crown sway, so waves visibly
roll across meadows. Why: motion at distance makes a field read as millions of blades. Cost: one noise or texture fetch
per vertex. Where: `core/biome/30-core-foliage.js` (`BIO.WIND`), the wind in `core/atmos`. Godot: same uniform in
`leaf.gdshader`. Effort: S. Sources: https://gdcvault.com/play/1027124/Blowing-from-the-West-Simulating ,
https://wiki.kwonsh.duckdns.org/Between-Tech-and-Art--The-Vegetation-of-/Between-Tech-and-Art--The-Vegetation-of-.html

**8. Screen-space contact shadows (desktop tier).**
What: a short depth ray-march toward the sun in a post pass, adding shadows the shadow map misses under stones, roots
and grass. Why: grounds every small object near the camera. Cost: one full-screen pass, needs a depth texture; off
on integrated GPUs. Where: `core/atmos/fx` (new pass). Godot: built-in light "contact shadow" option. Effort: M.
Source: https://www.bendstudio.com/blog/inside-bend-screen-space-shadows/

**9. Colour variation by noise on instances and ground.**
What: a low-frequency world noise shifts hue/value per instance (crowns, grass patches) and a matching macro tint on
the ground. Why: breaks the clone look at mid range. Cost: negligible. Where: `40-core-place.js` instance colour.
Godot: the same in instance custom data. Effort: S. Source: https://hexaquo.at/pages/grass-rendering-series-part-1-theory/

**10. Far forest as terrain shading.**
What: beyond the impostor band, colour and bump the terrain itself with a canopy paint (crown colour, a canopy-height
normal) instead of drawing trees. Why: forests reach the horizon at zero geometry. Cost: one fetch on the ground.
Where: the ground shader of item 1. Godot: same. Effort: M. Source:
https://www.cg.tuwien.ac.at/research/publications/2006/G_P_06_RFS/G_P_06_RFS-Report.pdf

## For the final rebuild

Items 1-4. Items 2 and 4 are small and lift every biome at once; item 1 ends the copied ground shaders and is the base
for 10; item 3 is the big far-field gain and lands well with the LOD-by-chunk and cross-fade rework already queued.
Godot: visibility ranges fade alpha only, so the cross-fade needs dither materials there
(https://docs.godotengine.org/en/4.5/tutorials/3d/visibility_ranges.html).
