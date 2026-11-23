# Krator in Godot: the look plan

**Written:** 2026-11-23, on `claude/krator-graphics-quality-k24ni6` (the same commit as `claude/vertical-stack`, b2f50948).
**Status:** steps 1 to 3 of section 14 are built on this branch (2026-11-23: `godot/README.md`, "The look", and
`godot/CHECKLIST.md` section 8); the rest is a proposal.

**Correction, 2026-11-23.** The counts this plan first gave for instanced items cut into cells (2.4 M, 10.0 M and
10.3 M primitives; sections 1, 3.2 and 5, appendix A) are withdrawn. The trial that produced them grouped instances with
a construct that, in GDScript, appends to a copy: every cell came out empty, and the frame was counted without the town's
instanced items. The cut as built is `godot/krator/cells.gd`, with a test that every instance lands in one cell.

The owner's question: what takes the Godot render to at least the grade of Skyrim, with buildings, plants and props that
read less like a cartoon and less like Minecraft and more like solid things, without breaking the graphics budget; with a
full plan for light, texture, fog and shaders, and for the Godot-only tools that carry it.

Four parts: what this branch proposes and how it holds up (section 2), why the frame still reads as a blockout (section 3),
the plan by track (sections 5 to 11), and how to deploy it (sections 12 to 15).

Each claim is marked as `GRAPHICS-TERRAIN-PROPOSAL.md` marks them: **measured** (run in this pass), **read** (seen in the
source, with the file), **docs** (Godot's manual or release notes, section 16) or **assumed**. The measurements were taken in
a cloud container: Godot 4.7.2, Forward+ on Mesa's software Vulkan (lavapipe), 1280 x 720. The frames are real Forward+
frames. The frame times are not worth quoting and none is quoted: every cost in milliseconds below is a cap to hold, not a
measurement, until the route harness runs on the two GPU lanes.

## 1. The short version

1. **Keep the branch's work.** Stages 0 to 7 gave the land its relief, a 40 km horizon shadow, hex-tiled ground, a grass
   sward, a measured texture packing and interiors that do not leak sun. None of it is redone here.
2. **It does not reach the three things that make the frame read as a blockout** (section 3):
   - **Surfaces have no colour or gloss of their own.** 38 % of the packed families are a grey detail map under one flat
     tint, the source sets they come from are grey too (the plaster's saturation is 0.000), and roughness is all but
     constant (a spread of 0.02 to 0.13, up at 0.8 to 0.99). One hue and one matte finish a surface is what a cartoon is.
   - **Every edge is a razor and every wall is a plane.** The kits are scaled unit boxes, cylinders and quads. Nothing
     catches a highlight on a corner, no silhouette is anything but a ruled line.
   - **The renderer's own light is mostly off, and what is on is set for reach, not for nearness.** The sun's shadow is
     stretched over 2,400 m, so its finest texel is about 29 cm: a window reveal, a beam or a person casts no shadow that
     holds a shape. No bounce light, no local reflections, no fog with depth, no glow, no eye adaptation.
3. **The frame already costs too much, and for one reason.** Every instanced item in a town is a single `MultiMesh`
   spanning the whole place, so the culler sees one box and the view and each of the sun's four shadow splits draw all of
   it: 46 million primitives a frame without the sun's shadow, 181 million with it. Cutting those into 64 m cells when the
   place opens was tried in this pass: 2.4 million and 10 million, the same picture. That comes first (section 5).
4. **So the order is cost, light, surface, form, plants, air.** The first three are Godot-only work on the exports as they
   stand, and they move the picture most for what they cost.
5. **Three things need the exporters, and they must be specified before Stage 8**, because a change to shared core is only
   cheap inside the all-builds rebuild: a chamfered box that adds no vertices, three per-vertex fields (height above the
   plot, occlusion, edge), and true-colour packs for Godot (section 13).
6. **Godot 4.8 is weeks away and brings three things this plan would otherwise build**: screen-space contact shadows,
   multi-bounce ambient occlusion and mip-level texture streaming (beta 4 on 2026-11-18; the blog calls a release
   candidate imminent). Plan for it; do not build them on 4.7.2.

## 2. What this branch proposes, and how it holds up

Read: `GRAPHICS-TERRAIN-PROPOSAL.md` (sections 4 to 12d), `VISUAL-BAR.md`, `VERTICAL-STACK-REPORT.md`, the three stage
reports, `GRAPHIC-LOAD.md`, `KIT-REBUILD-SURVEY.md`, `BIOME-REBUILD-SURVEY.md`, and the Godot side it produced
(`godot/shaders/`, `godot/krator/`, `godot/walk.gd`, `godot/tests/perf/route_harness.gd`).

### 2.1 Item by item

| Item | What it is | State | For the Godot look |
|---|---|---|---|
| T0 to T2 | WMICRO v2, the 250 m drainage residual on world tiles | proven on Oidong; re-bake at Stage 8 | **Keep.** The land's shape is not what reads as cartoon |
| S1 | 40 km horizon shadows and sky visibility, baked | in `terrain.gdshader`, `grass_sward.gdshader` | **Keep, and lean on it harder**: it is what lets the sun's shadow map shrink to 400 m (L1) |
| S2 | "the engine's directional shadow" | on, at 2,400 m in four splits | **Revise.** The setting defeats the feature (3.2). With S1 carrying the far field the map should cover 250 to 400 m |
| S3, S4 | chunk normal textures; six ground layers in arrays, hex-tiled | done | **Keep.** Add wetness, puddles and snow as weather terms (M7) |
| S5 | sky, fog colour and cloud shadow by the hour | done | **Keep.** Fog is still one exponential with no height, no volume, and `fog_sky_affect` 0 (section 7) |
| S6 | chromatic tint from the land's shape | planned (B5) | **Keep.** The same idea is what buildings lack (M7) |
| M1 | two-map packs, hemi-oct normals, arrays | measured; Godot takes `v2`/`v4` at Stage 8 | **Keep.** It fixes precision and memory. It does not change what is in the maps (3.3) |
| M2 | mip-variance specular anti-aliasing | in `library.gdshader` | **Keep.** It matters more once roughness has a range (M8) |
| M3 | planar parallax on hero surfaces | in `library.gdshader`, 8 steps | **Keep, hero only.** It needs real height: 509 of 628 sets derive height from luminance |
| M4 | bevels as geometry "where the budget allows", baked corner darkening, grounding | planned (K2: opt-in `boxBevel()`) | **Promote.** Bevels are the cure for the Minecraft read, and built the right way they add no vertices (R1) |
| M5 | foliage back light with the leaf's normal, baked crown occlusion | planned (B1, B2) | **Keep.** Cards still have no normal, thickness or roughness map (P2) |
| M6 | AgX as a look choice | on in `walk.gd` | **Keep.** 4.6 exposed `tonemap_agx_white` and `tonemap_agx_contrast`: tune them per hour (L5) |
| I1 to I4 | indoor sun and sky mask, room table, lamp pool, corner occlusion | proven at Longsong | **Keep.** Add a reflection probe a room: `ambient_light_disabled` also removes the reflections, so glazed tile and bronze are dead indoors (L4) |
| I5, I6 | window sun patches; a light volume | deferred | **Reopen I5 as an experiment** once the near cascade has 2 cm texels (L1): the leak the mask cures came from coarse shadows |
| A0 | cost recovery in Ancient's Valley, then looks | done on the web | **Do the same in Godot first** (section 5): one fault there accounts for most of 181 M primitives a frame. The Godot route has never been timed on a GPU |
| B1 to B5, K1 to K5 | core steps for every biome and kit at Stage 8 | planned | **Keep.** K5 (an opaque `library.gdshader`) moves to the front: it is cost, not looks |
| "Native in Godot" | SSAO, SSIL, GI, probes, contact shadows, volumetric fog: "settings, not work for this plan" | not specified | **The gap.** They are where a large share of the look is, and settings chosen without a budget are how the shadow got to 2,400 m. Sections 6 and 7 specify them |

### 2.2 Corrections

| Statement | Correction |
|---|---|
| Proposal 2.4: "Forward+, MSAA 2x" | `godot/project.godot` sets `anti_aliasing/quality/msaa_3d=2`, which is 4x (0 off, 1 is 2x, 2 is 4x, 3 is 8x; **read**, and the 4.7.2 class reference). Nothing in `walk.gd` lowers it |
| Proposal 2.4: "No SDFGI ... or SSAO anywhere" | Since then `walk.gd` turns SSAO on and has SDFGI behind `--gi` and a UI toggle (**read**, `walk.gd:101-112`). Still true: no `ReflectionProbe`, `VoxelGI`, `OccluderInstance3D` or `generate_lods` in any script under `godot/` (**measured**, grep) |
| Stage reports: Godot render medians | Every Godot frame time in the reports is llvmpipe. `godot/PERF.md` holds only a headless run. The route has no Forward+ number on either lane |
| Proposal M4: a chamfered box is "44 triangles for 12" | True, and the number that matters is vertices: a hard-edged box already has 24, and a chamfer whose strips reuse them has 24 as well (R1). `GRAPHIC-LOAD.md` found the load is vertices |

### 2.3 What it leaves out

1. **What is in the maps.** Colour and roughness, as against how they are packed (3.3).
2. **Form**, beyond an opt-in bevel and parallax.
3. **The native light rig as a specified thing**, with tiers for the two GPUs.
4. **Cost on the Godot side.**
5. **Plants' own maps, bark, wind in levels, and the far tiers in Godot.**
6. **Air**: fog with height and volume, shafts, particles.
7. **Dressing in Godot**: decals, clutter underfoot.
8. **Anti-aliasing and scaling** as a choice per tier.
9. **Load**: maps are compressed to BC7 when a place streams in, and meshes are parsed from glTF each time.

## 3. Why the frame reads as a blockout

### 3.1 Four frames

Shot in this pass with the walk scene's own rig (`walk.gd`: AgX, SSAO 1.4 / 1.55, four splits to 2,400 m, the colour
script's fog and exposure) at three of the place's exported views and the route's forest edge, 16:20. They are not
committed (`shots/` is ignored); appendix A has the settings.

- **"The White Palace from the avenue."** The palace is flat white planes with black rectangles in a grid. The avenue is a
  blurred noise texture with no kerb, cobble or wear. Arcade posts are sticks. Prayer flags are flat squares. The stair on
  the facade is thin ruled lines. There is one faint shadow in the whole frame and no air between the eye and a building
  150 m away.
- **"The Hall of Forms."** The brick is one saturated orange from eave to ground. The shadow beside the hall is a soft blob
  with no edge. The lawn is a flat pale green with tufts on it. The houses behind are white boxes with a red stripe.
- **"[Village] East", a green with blossom trees and conifers.** The sward's blades hold up near the eye: stage 4's work
  shows. The conifers are near-black cut-outs of layered cards, trunks are black with no relief, the far trees are two
  pale tones. A whole canopy's shadow on the grass is one dithered blob. The path is an untextured band.
- **The route's forest edge, from 12 m up.** Each crown is a flat disc of cards in one pastel, with no inside and no
  shade of its own. Trunks are black sticks. Every tree's shadow is the same soft oval. The slope between them is one
  smooth colour with scattered tufts.

Against `VISUAL-BAR.md` section 3 these fail on: flat-lit streets, bare terrain texture underfoot, smooth low-poly
silhouettes on a landmark, single-noise albedo, and a population of one colour.

### 3.2 What was measured

| Finding | Number | How |
|---|---|---|
| Primitives a frame, avenue view | 180.7 M in 3,372 draws; 181.1 M in 3,543 at the Hall of Forms | **measured**, `Performance.RENDER_TOTAL_*`, every pass counted |
| The same view by shadow setting | no sun shadow: 46.3 M in 1,164 draws. Shadow to 400 m: 180.6 M in 3,323. Shadow to 2,400 m: 180.7 M in 3,372. **Shortening the shadow does not lower the count** | **measured** |
| Why | 392 of the town's 420 instanced items have instances spread over more than 1,000 m (about 2.4 km: the whole place), and they hold 33.5 M triangles, all of the instanced total. `gltf_instancing.gd` makes one `MultiMesh` an item. (180.7 - 46.3) / 4 = 33.6 M a split, the size of the town's instanced total | **measured**, the glb's instance translations; **read**, `gltf_instancing.gd` |
| The cure, tried | Every `MultiMesh` wider than 96 m cut into 64 m cells after the place opened (1,067 of them into 38,287 cells, 108,724 instances, half a second of GDScript), each cell keeping its item's visibility range. No sun shadow: **2.4 M in 259 draws**. Shadow to 400 m: **10.0 M in 697**. Shadow to 2,400 m: **10.3 M in 723**. The frame matched the one before to a mean difference of 1.4 in 255, the difference being the verge's sway and the clouds' drift | **measured**, appendix A |
| The town place (`sq80bzd7ep/world.glb`) | 456 meshes, 1.31 M triangles, 3.21 M vertices (2.45 a triangle: hard edges and unindexed soup), **34.2 M triangles once instanced** (33.5 M of them in instanced items) | **measured**, the glb's JSON |
| The monastery place | 911 meshes, 1.11 M triangles, 8.7 M instanced; 165 of 911 meshes have UVs | **measured** |
| The streamed flora | 541 meshes, exactly 3 vertices a triangle | **measured** |
| Vertex attributes in all three | POSITION, NORMAL, TEXCOORD_0, COLOR_0. No TANGENT | **measured** |
| What a runtime glTF load adds | `girder/region.glb` through `GLTFDocument`: 57 surfaces, all 57 with a tangent array, none with a level of detail, none with a shadow mesh | **measured**, 4.7.2 |
| Materials | town: 70, of which 18 have a normal map and 60 are double-sided; monastery: 184, 24 and 115. `library.gdshader` is `cull_disabled` for all of them and writes `ALPHA` always | **measured**; **read**, `library.gdshader:10,170` |
| The sun's shadow texels | about 0.29 m, 0.54 m, 1.4 m and 2.7 m in the four splits (4096 atlas, 2,400 m, splits 0.1 / 0.2 / 0.5, 58 degrees, 16:9) | computed from **read** settings (`walk.gd:110-112`; the project keeps the 4096 default) |
| Packs, repo-wide | 111 packs, 2,761 surface families. `tint.keep` 0: 1,051 (38 %); 0.3 or under: 375 more. `roughLift` above 0: 75 %; 0.3 or more: 56 % | **measured**, every `tex/pack.json` |
| The library | 628 surface sets: 509 generated images (`process.py`, height from luminance), 104 scans (Poly Haven 55, ambientCG 49). All 104 scans list a displacement map as available and 83 an occlusion map; neither is ingested. The scans' roughness is floored at ingest (mean floor 0.69) | **measured**, the sets' `meta.json` in aggregate |
| Eight source sets the town uses | `plaster`: saturation 0.000, roughness 0.843 to 0.878 (5th to 95th percentile). `stone.cut`: 0.003, 0.800 to 0.867. `concrete.ancient`: 0.008, 0.851 to 0.898. `wood.siding`: 0.073, 0.737 to 0.863. `rock.old_stone_wall` (a scan): 0.267, but roughness 0.984 to 0.988, and it is packed with `keep` 0 | **measured**, the images |
| Leaf and bark | 30 leaf materials and 7 bark: every one at roughness 1, none with a normal, thickness or roughness map. Bark is a grey albedo under a tint; its relief is a normal made from the albedo's screen derivatives. Several cards are grey shapes under a tint | **measured**, `flora/world.json`; **read**, `bark.gdshader` |
| Load | A place is parsed from glTF and its materials built every time it opens: the town took 86 to 130 s to stream on 4 vCPUs, with texture compression off (`KRATOR_VRAM=none`). Compression to BC7 at load comes on top by default: `STAGE-5-REPORT.md` has 9.9 s for 21 maps against 0.3 s uncompressed, and the town's pack alone is 47 families of three maps | **measured** (a container; a laptop is faster); **read** |
| The sky | `sky.gdshader` runs the whole `atmSky` (13 loops) for the radiance map too: no `AT_CUBEMAP_PASS` branch, no half-resolution pass | **read**, `sky.gdshader`, `atmos_sky.gdshaderinc` |
| The light rig | set by hand in at least four places: `walk.gd`, `route_harness.gd`, `vertical_stack_shots.gd`, `stage7_interiors_test.gd` (and `sky.gd` sets ACES, which `walk.gd` then overrides) | **read** |

### 3.3 The four causes, by weight

1. **Surface.** A wall is a grey detail map times one vertex colour, at one roughness near 0.9. Real stone, plaster and
   timber vary in hue across a metre, darken in creases and under sills, bleach on top, streak below openings, and shine
   where they are worn or wet. None of that is in the maps and nothing in the shader adds it. This is by design: the sets
   were made neutral "so it can be tinted" for the Lambert pages (`core/materials/PLAN.md`; `pack.py`'s `tint.keep`). It
   is also why the packing work (M1) could not show: it stores the same grey more exactly.
2. **Form.** `core/engine/30-geo.js` builds from `box()` (a scaled unit cube), `cyl()` (14 sides), `beam()`, `quad()`,
   `prism()`; the kits' helpers (`xnWall`, `xnFlatRoof`, `vBeam`) reduce to the same. Faces are planes and edges meet at
   exactly 90 degrees with split normals. Triangles are not short (1.3 M in one small town): they are spent on many small
   hard boxes, not on the edges and outlines the eye reads.
3. **Light.** With 29 cm texels nothing small casts a shadow, so nothing sits on anything. Ambient is the sky at 0.95 with
   screen-space occlusion and nothing else: no bounce, so shade has no colour of its surroundings.
4. **Density.** Streets and lawns are a texture with sparse tufts. That is `VISUAL-BAR.md` pillar A and it is owed, but it
   reads as "empty", not "cartoon", and comes after the first three.

## 4. The bar

Skyrim is the named bar, so it helps to say what its look rests on. Its world is built from modular kits (Burgess and
Purkeypile, GDC 2013); the 2016 edition added volumetric god rays, screen-space reflections, depth of field and new snow
and water shaders. Godot 4.7's Forward+ renderer already has more than that engine had: physically based materials,
clustered lights, SDFGI, volumetric fog. **The gap is not renderer features. It is what the assets carry and how the
light is set.**

So the bar is stated as properties of the frame, each one a row the route harness can shoot or measure. They extend
`VISUAL-BAR.md` section 4, they do not replace it.

| Property | Pass | Today |
|---|---|---|
| Near shadow | a texel of 3 cm or under within 15 m of the eye; a sill, a rail and a hand cast a shadow with a shape | 29 cm |
| Grounding | at every wall foot and under every eave the ambient term falls by a visible step (occlusion from GI or baked), not by a painted line | SSAO only |
| Surface colour | inside one wall, hue and value both move: a saturation spread of at least 0.04 and a value spread of at least 0.12 over a 4 m patch | 0.00 and the breakup's 0.10 |
| Surface gloss | on a hero family, roughness spans at least 0.25 between its 5th and 95th percentile; wet ground reads as wet | 0.02 to 0.13 |
| Edges | within 10 m, no hero edge is a single-pixel line: a bevel or a broken outline catches light | none |
| Depth of walls | every opening within 20 m has a reveal, a frame and a sill that cast shadow | to audit per kit |
| Air | three depth planes separate by haze at any hour; a low sun draws shafts through trees and arcades | one exponential |
| Plants | a leaf card has a normal and lets light through by its thickness; bark has relief; trunk, branch and leaf move differently in wind | albedo only |
| Hour | the grade changes with the hour (it does) and the eye adapts between a hall and a courtyard | scripted exposure only |
| Cost | the route's four stops hold the caps of section 12 on both lanes | never timed |

## 5. Track C: get the cost back first

The probe in 3.2 says where it goes. A `MultiMesh` is culled as one box. Each of a town's instanced items (a tree
species, a bench, a lamp) is one `MultiMesh` over the whole 2.4 km place, so whichever way the eye looks, and for each
of the sun's four splits, all 33.5 M instanced triangles are drawn. The per-instance cull in `lod.gdshaderinc` collapses
far instances to a point, which saves fill but still runs every vertex. And a visibility range on such a node never
acts: the eye is always inside its box. `GRAPHIC-LOAD.md` saw the same on a biome tile ("13.2 M primitives at the stream
and at the hummocks alike"). Every item below is Godot-side and changes no page.

| Item | What | Why it pays | Godot's tool |
|---|---|---|---|
| C1 | **Cut every instanced item into cells** of about 48 to 64 m when a place is cooked or opened, each cell its own `MultiMeshInstance3D` with a visibility range from the item's size and LOD range | Then the frustum, each shadow split, the range and the occluders all cull by cell. **Measured** (3.2): 181 M to 10 M, 46 M to 2.4 M without the sun's shadow. One thing the trial hit: a cell that copies the node's `lod_*` instance uniforms overflows the buffer for them (29,068 errors at 38,287 cells), so a cell carries its range on the node, and rows of different range become different cells | `MultiMesh`, `visibility_range_end`; the indoor furniture is already in 36 m cells (`kinteriors_light.gd`) |
| C2 | **The sun's shadow to 250 to 400 m**, splits near 0.05 / 0.15 / 0.40; S1's baked horizon carries the land beyond | An object in all four splits is drawn five times (**docs**). The far splits hold the most objects and give the least: 1.4 and 2.7 m texels. It is a quality item first (L1): on its own it left the count where it was | `DirectionalLight3D.directional_shadow_*` |
| C3 | **Who casts.** No shadow from furniture when the eye is outside, from undergrowth, lamps, bunting; none from anything under about 0.4 m beyond the second split | Shadow passes run the vertex shader for every caster | `cast_shadow` a cell, `Light3D.shadow_caster_mask` (4.4), layers |
| C4 | **A shadow mesh a surface**: positions only, welded | The shadow and depth passes then read a third of the vertex data and far fewer vertices (2.45 a triangle today) | `ArrayMesh.shadow_mesh`, set by the cook (N2) |
| C5 | **K5 now, and widened**: `library.gdshader` split into opaque (`cull_back`, no `ALPHA`), two-sided and cut-out | 60 of 70 town materials are two-sided and all draw two-sided; writing `ALPHA` keeps them out of the opaque depth prepass. The same for `terrain.gdshader` (`cull_disabled`) | render modes |
| C6 | **Occluders from the records.** A box a room block or a wall run, built when a place opens | From the avenue the halls behind the facade are drawn: interiors are culled by range (160 m), not by what hides them. **Docs**: occlusion culling is most effective indoors, costs CPU, and `ArrayOccluder3D` is meant for generation from script | `OccluderInstance3D`, `BoxOccluder3D`, `ArrayOccluder3D`; `rendering/occlusion_culling/use_occlusion_culling` |
| C7 | **Mesh levels of detail** on every static surface and item | A runtime glTF load makes none (**measured**, 3.2; **docs**: generation happens on import). 33.5 M instanced triangles have one level | `ImporterMesh.generate_lods()` in the cook (N2); `mesh_lod_threshold` per tier |
| C8 | **Far tiers**: a town past about 600 m as one merged low mesh a block; trees as impostors (P6) | what is left after C1 at long range | `visibility_range_*` with `visibility_parent` (HLOD) |
| C9 | **The sky's radiance pass**: a cheap branch (gradient, sun, mean cloud) when `AT_CUBEMAP_PASS`; clouds in a half-resolution pass | The radiance map re-renders whenever the sky's uniforms change, which is every frame | sky shader built-ins, `use_half_res_pass` |
| C10 | **MSAA by tier** (it is 4x for everyone today) | Section 6.6 | `Viewport.msaa_3d` |

**Exit:** the route harness's four stops in Forward+ on the RTX and the Arc lanes, with GPU time from
`RenderingServer.viewport_get_measured_render_time_gpu` (frame delta hides what is CPU). Target for the step: the
primitive caps of section 12 at every stop with the sun's shadow on, and its caps for "opaque" and "shadows".
`tests/perf/route_harness.gd` already records draws, primitives and memory; it gains the GPU timer and a `--look=` tier.

## 6. Track L: the light rig

One owner for it: `godot/krator/look.gd` (`KratorLook`), which takes a tier and sets the `Environment`, the
`CameraAttributesPractical`, the sun, the viewport and the `RenderingServer` quality calls. `walk.gd`, the route harness
and the shot scripts call it instead of each setting properties by hand. Every feature has a switch (`--no-gi`,
`--no-vfog`, ...), as `VISUAL-BAR.md` asks of any fix. The colour script (`sky_model.gd`) goes on driving sun colour,
energy, fog colour and exposure by the hour.

Tiers are the two lanes: **low** is the Arc 140T (the one to design for, `GRAPHIC-LOAD.md`), **high** is the RTX 5060.
A third, **photo**, turns everything up for stills and has no budget. Values are starting points to tune on the lanes;
the names are the 4.7.2 class reference's.

### 6.1 Sun and shadow (L1)

| Property | low | high |
|---|---|---|
| `directional_shadow_mode` | 4 splits | 4 splits |
| `directional_shadow_max_distance` | 250 | 400 |
| `directional_shadow_split_1 / 2 / 3` | 0.06 / 0.18 / 0.45 | 0.05 / 0.15 / 0.40 |
| `directional_shadow_blend_splits` | off | on |
| `directional_shadow_fade_start` | 0.8 | 0.85 |
| atlas (`directional_shadow_atlas_set_size`) | 4096 | 8192 (128 MB) |
| `directional_soft_shadow_filter_set_quality` | Soft Low | Soft Medium |
| `light_angular_distance` | 0 | 0.5 degrees, if it fits (**docs**: a high cost on directional lights) |
| far field | S1's baked horizon | the same |

At 400 m the four splits have texels of about 2.4, 7, 18 and 46 cm on a 4096 atlas (half that on 8192), against 29 cm at
best today. That is the largest single change to how solid things look. Tried in this pass (appendix A): on the avenue the
arcade's shadow goes from a soft blur to the roof's edge, the rail and each post drawn on the paving. It does not lower
the primitive count on its own (3.2); C1 does.

On 4.8, turn on the new screen-space contact shadows for the sun (a per-light and per-environment option, **docs**): they
cover the last centimetres no shadow map resolves. Do not write a compositor effect for it on 4.7.2.

### 6.2 Ambient and bounce (L2)

| Term | low | high | Note |
|---|---|---|---|
| Sky ambient | on | replaced by SDFGI where it has data | `ambient_light_sky_contribution` stays the fallback |
| S1 sky visibility | on (terrain, grass) | on | exists |
| SSAO | half size, quality Low, radius 1.0, intensity 2.0 | half size, Medium | Multi-bounce on 4.8 stops it over-darkening (**docs**) |
| SSIL | off | on, half size | coloured contact bounce; a complement to GI, not a replacement (**docs**) |
| SDFGI | off | on: 4 cascades, `sdfgi_min_cell_size` 0.4 (a 410 m reach), `sdfgi_use_occlusion`, Y scale 75 %, `gi/use_half_resolution`, lights updated in 16 frames | **Docs**: viable for procedural levels, including geometry made during play; dynamic objects receive but do not contribute. It is the manual's first choice on desktop |
| Baked vertex occlusion | on | on | I4 and B2, extended to every exterior wall foot and eave by the form pass (R4) |

SDFGI is the right first GI because the world is generated and streamed: lightmaps cannot be baked outside the editor
(**docs**), and VoxelGI must be baked a place at a time. It ran on the avenue in this pass and deepened the shade under
eaves; it also lit the volumetric fog until the frame washed out, so `volumetric_fog_gi_inject` comes down with it
(appendix A). Three things to check on the lanes before it is on by default: that `MultiMesh` content contributes (most of
a town is instanced); what it does at the 0.2 m walls (indoor surfaces take no ambient today, so the leak to watch is lamp
light reaching the street through a wall at night); and its cost while the stream rebases.

### 6.3 Local reflections (L3)

- **A `ReflectionProbe` a room cluster and a covered arcade**, `update_mode` once, `interior` on with a constant ambient
  matched to the room table's daylight, box projection on. **Docs**: probes suit procedural levels, four blend at a
  point, and they share the 512 clustered elements with lights and decals. Make them when the room's lamps are made.
- **Screen-space reflections on water and wet paving** (the 4.6 rewrite, half size by default), high tier only.
- `rendering/reflections/specular_occlusion/enabled` is already on by default (4.5): it keeps sky out of creases.

### 6.4 Interiors (L4)

Keep I1 to I4. One thing the stage left: indoor surfaces take their ambient as `EMISSION` under
`ambient_light_disabled` (**read**, `library_interior.gdshader:11,132`). SSAO acts on ambient light only (**docs**), so it
does nothing indoors, and there is no ambient specular at all: glazed tile, lacquer and bronze show lamp highlights and
nothing else. The spatial shader's `IRRADIANCE` and `RADIANCE` outputs are the engine's way to hand a surface its own
ambient (they compile on 4.7.2, **measured**). The room table's colour goes there in place of emission, the render mode
comes off, and occlusion, probes and the specular term then work indoors as they do outside.

Then, each judged by Gate 5's probes:

1. **`IRRADIANCE` and `RADIANCE` from the room table**, with the probe of L3.
2. **Sun through windows by the shadow map** (I5). With a 2 cm first split the sun can be let onto the indoor layer inside
   the first two splits. If the probes stay dark where they should, the mask becomes a far-field fallback.
3. **One baked `VoxelGI` in a hero hall.** **Docs**: `bake()` works in an exported project, takes 5 to 20 s, and eight can
   draw at once. Too slow to do when a place streams in: bake on the owner's machine and store the `VoxelGIData` with the
   place (N2's cook).

`AreaLight3D` (4.7) would suit a window or a skylight, but **docs**: one in view adds cost to every object drawn. Hold it
for the photo tier.

### 6.5 Exposure, tone and grade (L5)

| Property | Value | Note |
|---|---|---|
| Tonemapper | AgX, `tonemap_agx_contrast` 1.25, `tonemap_agx_white` 16.29 (the defaults), then tuned per hour | 4.6 exposed both |
| Exposure | the colour script's value times auto exposure held to about one stop either way | `CameraAttributesPractical.auto_exposure_*`. **Docs**: Forward+ only, a moderate cost |
| Glow | high: `glow_intensity` 0.35, `glow_bloom` 0.05, `glow_hdr_threshold` 1.1, Screen blend | gilt roofs, white walls in sun, lamps at night. `stage.gd` turns it off to match the pages; that is the wrong default for the walk |
| Grade | one 33-cube LUT a colour-script key, blended by the hour | `adjustment_color_correction` (**docs**: a 3D LUT, applied after tonemapping) |
| Debanding | on | `use_debanding`: the sky's gradient |
| HDR output | optional, high | `display/window/hdr/request_hdr_output` (4.7) |

### 6.6 Anti-aliasing and scale (L6)

The project is at 4x MSAA with alpha to coverage on cards. **Docs**: MSAA does nothing for alpha scissor or specular
aliasing; TAA is "generally the most suitable option" for a photorealistic direction and FSR2 at native scale is a
quality mode. But foliage that sways in the vertex shader on a global uniform may have no motion vectors, and then TAA
and FSR2 smear it (the Terrain3D issue in section 16 is the same fault). So this is a test, not a setting:

| Candidate | low | high |
|---|---|---|
| A | MSAA off, SMAA, FSR 1 at 0.77 | MSAA 4x with alpha to coverage, SMAA |
| B | FSR 2.2 at 0.67 | FSR 2.2 at 1.0 |
| C | MSAA 2x, bilinear at 0.77 | TAA |

Judge on four things at the forest edge and the avenue: card edges, shimmer on glazed tile, ghosting on sway
(`Viewport.DEBUG_DRAW_MOTION_VECTORS` shows whether the cards have vectors), and GPU time. Anisotropic filtering to 8x
(low) and 16x (high); it is 4x now.

## 7. Track F: fog and air

Fog today is one exponential whose density the colour script sets, with no height and no volume. Air is layers:

| Layer | What | Godot's tool | Tier |
|---|---|---|---|
| F1 Aerial perspective | far things take the sky's colour, not one fog colour | `fog_aerial_perspective` 0.4 to 0.6 (**docs**: "a better sense of depth" in large open worlds) | both |
| F2 Height fog | mist that lies in valleys at dawn, dusk and after rain; none at noon | `fog_height`, `fog_height_density`, keyed by the colour script and the region's floor height | both |
| F3 Volumetric fog, near | shafts through trees and arcades, lamps that glow in mist | `volumetric_fog_*`: length 200 to 300 m, anisotropy 0.6 to 0.8, ambient inject 0.5; density and the sun's `light_volumetric_fog_energy` as per-hour keys of the colour script (the trial's 0.001 and 2 read well across the sun and whitened a third of the sky toward it, appendix A). **Docs**: Forward+ only, a finite range, meant to be used with the non-volumetric fog | high |
| F4 Fog volumes | mist over water, spray at falls, hollows, chimney smoke, dust in a hall | `FogVolume` (box, ellipsoid, cone, cylinder), `FogMaterial` or a `shader_type fog` with wind-scrolled noise | high |
| F5 Particles | smoke, motes in shafts, petals and leaves, spindrift, rain with splashes | `GPUParticles3D`, `GPUParticlesCollisionHeightField3D` | both, counts by tier |
| F6 Wetness | darker, smoother ground and stone in rain; puddles in hollows that reflect | the `atm_wet` global, in the weathering stack (M7) and the terrain shader; SSR | both; SSR high |

Where F4's volumes go is data the repo has: stream and tarn records, the falls, `smokeAt` records, and S1's
sky-visibility raster, which already marks gorges and hollows (visibility under about 0.6). Placement stays a record;
Godot draws it.

Not now: volumetric clouds. The sky's own clouds and their ground shadow exist and agree with each other. A
compositor-based cloud pass (SunshineClouds2, section 11) is a later, high-tier choice.

## 8. Track M: surfaces (textures and shaders)

### M7. A weathering stack in the shader (the largest gain for the least data)

One include, `shaders/lib/weather.gdshaderinc`, used by the library, bark and terrain shaders. It does at run time what a
texture artist's generators do, from what the shader already knows:

| Layer | Driven by | Effect |
|---|---|---|
| Hue and value drift | two slow world-space noises (3 to 15 m) | warm and cool patches, 10 % value: no wall is one colour |
| Crease dirt | the detail map's dark end now; a real occlusion channel later (M8) | warm dark in joints, grain and mortar |
| Run-off | noise stretched down the wall, on steep faces only | streaks; stronger below openings once the export marks them |
| Top and under | the world normal's Y | bleach and dust on top, dark and damp underneath |
| Foot | height above the plot (a vertex field, section 13) | a damp, darker, greener band in the first 0.4 m |
| Moss and lichen | up-facing, sheltered, low sky visibility, wet climate | green-grey patches, rougher |
| Edge wear | a vertex edge field (section 13) | lighter, smoother arrises on stone and timber |
| Gloss | all of the above | roughness gets a range: worn and wet are smoother, dirt and moss rougher |
| Weather | globals `atm_wet`, season, a snow line | wet darkening, snow on up-faces |

Amounts come per family from the material record (plaster streaks, glazed tile does not) and per building from an
instance uniform (age). The prototype in appendix A uses analytic noise; the real one reads one shared four-channel
noise texture, so the cost is one or two fetches. It runs on today's exports. The fields in section 13 make it better,
they do not gate it.

The first cut was tried in this pass (appendix A): on the palace's facade the flat grey plane became a wall with run-off
and warm and cool patches, with nothing changed in the export. It is crude, and it is enough to say the idea reads.

### M8. True colour and true gloss for the hero families

About forty families cover most of a town's screen (walls, roofs, paving, timber, bark, ground; **assumed**: the look lab
counts screen share a family to pick them). For those:

- **Scans where they exist.** Poly Haven and ambientCG are CC0 and carry albedo, normal, roughness, occlusion and
  displacement at 4K and up; `tools/textures/fetch_polyhaven.py` and `ingest_polyhaven.py` exist. Ingest roughness with
  no floor and no lift, and take the occlusion and displacement maps the ingest drops today.
- **A Godot pack policy.** The Godot export's packs (`packFormat: 2`, Stage 8) take `keep` 0.7 or more on scans and no
  `roughLift`. The web packs stay as they are. So that kit palettes survive, neutralise the mean and keep the variation:
  divide each channel by its own mean, then scale to the record's `tint.mean`. The tint still sets the hue; the stone
  keeps its lichen.
- **1024 px for the forty, 512 for the rest**, two maps a family, BC7. That is about 112 MB for the forty.
- **Generated sets** that stay: regenerate in colour with roughness prompted, or leave them to M7.

### M9. Detail at arm's length

512 px over 2 m is 256 texels a metre: enough at three metres, soft at half a metre. One shared array of about eight detail
normals (stone, plaster, wood grain, metal, cloth, leaf, bark, earth), tiled at 0.2 to 0.4 m and faded out by 6 m, keyed
by the family's class. One sampler for every material.

### M10. Tangents

The engine already makes them: a runtime glTF load gives every surface a tangent array (**measured**, 3.2).
`library.gdshader` does not use it. It builds its frame from screen derivatives, as three.js does for a mesh with no
tangents (**read**, `library.gdshader:96-103`). That is exact on a flat face and noisy where a surface curves or shrinks to
a few pixels, and the parallax march inherits the noise. Writing `NORMAL_MAP` against the mesh's `TANGENT` and
`BINORMAL` is the engine's own path, and `wuv_box` only scales the mesh's UVs, so the tangents stay right for world-UV
boxes. The derivative frame stays for triplanar and UV-less furniture.

### M11. Decals

`Decal` nodes for what is specific, not general: soot above a chimney, a leak below one sill, ruts and puddles on a road,
a worn path across a court. **Docs**: albedo, normal, ORM and emission; they cost by screen coverage; they share the 512
clustered elements; they cannot take a custom shader. Fade them out by 40 m. On 4.8 they can animate.

### M12. Wood that has a direction

Catalog furniture has no UVs and takes its detail by triplanar projection, so grain runs the wrong way on two faces in
three. A grain axis per piece from the catalog core (one more vertex field or a per-piece uniform) is what stops
furniture reading as moulded plastic. Small, and it rides with section 13.

### The shader work in one list

| Shader | Change | Item | Step |
|---|---|---|---|
| `library.gdshader` | split into opaque, two-sided and cut-out; `cull_back` and no `ALPHA` on the opaque one | C5 | 1 |
| `terrain.gdshader` | `cull_back`; later wetness, puddles and a snow line from the weather include | C5, F6 | 1, 6 |
| `sky.gdshader` | a cheap `AT_CUBEMAP_PASS` branch; clouds in a half-resolution pass | C9 | 1 |
| `library_interior.gdshader` | the room table through `IRRADIANCE` and `RADIANCE`, not emission; `ambient_light_disabled` off | L4 | 2 |
| `lib/weather.gdshaderinc` (new) | the weathering stack: one shared noise texture, the vertex fields when they exist, `atm_wet` and the season globals, an instance `age` | M7 | 3 |
| `lib/detail.gdshaderinc` (new) | a detail-normal array keyed by class, faded by distance | M9 | 3 |
| `library*.gdshader` | `NORMAL_MAP` on the mesh's tangents; the derivative frame only for triplanar and UV-less meshes | M10 | 3 |
| `bark.gdshader` | a normal map; the weather include for moss and wet | P3, M7 | 5 |
| `foliage.gdshader`, `lib/foliage.gdshaderinc` | normal and thickness maps, B1's gate; then wind in three levels | P2, P4 | 5, 8 |
| fog shaders (new, `shader_type fog`) | density from wind-scrolled noise with a height falloff, for mist, spray and smoke | F4 | 6 |
| `water.gdshader` | roughness and normals that suit SSR; a wet margin by distance to the shore | L3, F6 | 6 |
| `grass_sward.gdshader` | a specular lobe, clumping, bare patches | P8 | 7 |
| an impostor shader (new) | an octahedral atlas with a normal, lit like the tree it stands for | P6 | 8 |

## 9. Track R: form

### R1. The chamfered box that costs no vertices

A hard-edged box has 24 vertices: three at each corner, one a face. Move each a bevel's width in along its face and
stitch the gaps: twelve edge strips and eight corner triangles. 44 triangles on the same 24 vertices. Leave the strips'
normals as the faces' normals and the strip shades as a rounded edge with no new normal data. The load is vertices
(`GRAPHIC-LOAD.md`), and on an indexed bucket this adds none (the engine's buckets keep indices, `flushBuckets`; the
catalog's can, `KF.batch({indexed:true})`).

Two limits. The strip's texture is an interpolation between two faces' mappings, which is fine at 1 to 4 cm and wrong
for a wide chamfer. And the plain 12 triangles cannot be drawn from the same vertices without cracks, so the far level
is the cook's (C7): Godot's mesh levels are index lists over one vertex buffer, and a simplifier collapses the shortest
edges first, which are the strips. If that proves uneven, the exact way is one more vertex field (the true corner) so
the shader closes the bevel at range.

Widths by class: 8 to 12 mm furniture, 15 to 25 mm sawn timber, 20 to 40 mm dressed stone, 50 mm and up for adobe and
rough stone. It belongs in `box()` and `beam()` of `core/engine/30-geo.js` and the kit helpers that make their own
boxes, on behind an export flag so no page's geometry moves.

### R2. Out of true

A building nobody ruled: walls with a batter of half a degree to a degree and a half, ridges that sag one to three per
cent of their span on thatch and old timber, posts off plumb, beams with a bow, courses that wander by a centimetre.
Drawn from `core/rand` by a hash of (world, building, part, salt), applied after placement so no record, walk box or door
moves. It costs nothing at run time.

### R3. Depth at openings

Every window and door inside 20 m: a reveal of 10 to 25 cm, a frame, a sill that projects, a lintel. With L1's shadows
each one then draws a shadow line, which is most of what makes a facade read as built. From the avenue the palace's
windows read as flat dark rectangles. An audit per kit first (`36o-open.js` and `KDOOR` cut real openings in some),
because this is where kits differ most.

### R4. Silhouette where the silhouette is

Parallax gives depth in the middle of a wall and nothing at its edge. So real geometry goes to corners and tops, flat
maps stay in the field: quoins as separate chamfered blocks, a plinth course, a coping, rafter ends under an eave, ridge
tiles, a broken edge on rubble. That is how a kit-built game spends its triangles.

Displacing a subdivided wall by its height map in `vertex()` works in Godot and is not proposed now: it needs dense
grids, and R4 gets most of the read for a fraction of the vertices. Terrain3D 1.1 does tessellated displacement for
terrain, in its own mesh.

### R5. Sculpted hero pieces

Finials, capitals, statues, boulders, root flares: one generated or scanned high-resolution mesh each, decimated, with
its normal map baked, instanced. The owner has text-to-3D services for this already
(`.claude/skills/character-modeling`, `kits/fauna/PLAN-MESHY.md`). A handful a culture is enough to break the
"everything is a primitive" read.

## 10. Track P: plants and props

| Item | What | Godot side |
|---|---|---|
| P1 | **Colour cards for hero species.** Several cards are grey shapes under a tint; a tinted grey leaf has no vein, edge or blemish colour | none: the library and `materials.json` |
| P2 | **A normal and a thickness map a card sheet** for the thirty most-drawn sheets (the depth model in `tools/textures/depth.py` gives the normal; thickness can start as distance in from the card's edge and midrib), and a roughness that is not 1 | `foliage.gdshader`: a normal map in place of the procedural vein; `BACKLIGHT` scaled by thickness; B1's normal gate |
| P3 | **Bark with relief.** Scanned bark sets with normal and occlusion; a root flare and taper on the trunk (`BIO.tube`, `31j-core-joint.js` exist) | `bark.gdshader` takes a normal map; the derivative furrow stays as the fallback |
| P4 | **Wind in three levels**: the trunk leans, a branch swings on its own phase, a leaf flutters, with per-vertex stiffness (the scheme of GPU Gems 3, chapter 16) | `lib/foliage.gdshaderinc`; stiffness and phase in a vertex colour channel from `core/biome` |
| P5 | **A population, not a clone**: hue, value and age per instance, a dead and a bare fraction (`VISUAL-BAR.md` G) | `INSTANCE_CUSTOM` carries a second colour already |
| P6 | **Far tiers in Godot**: hero mesh, then cards, then an octahedral impostor from about 400 m, then a canopy shell. `core/biome/34-core-impostor.js` bakes them for the web | bake the atlases in Godot with a `SubViewport` at cook time (N4); one quad an instance |
| P7 | **Underfoot**: stones, twigs, litter, ferns and flowers as geometry inside 10 m, clumped by the sward's own masks | more `MultiMesh` rings in `world_grass.gd` |
| P9 | **Cloth and small props.** Flags, bunting and awnings are flat squares in both frames: subdivided cards with sag, folds in a normal, light through the cloth, on the sway include that exists. Catalog pieces take R1's chamfer and M12's grain | `lib/cloth-sway.gdshaderinc`, `BACKLIGHT` |
| P8 | **The sward**: it has blades; give it a specular lobe, back light by height, clumping and bare patches (GodotGrass, section 16, follows Ghost of Tsushima's scheme), and no shadow casting | `grass_sward.gdshader` |

Trees keep their own generator: `BIO.tree` knows structure the Godot tree add-ons do not, and placement is shared data.

## 11. The Godot-only tools

### 11.1 The engine's own

| Tool | Job here | Step |
|---|---|---|
| `Environment`, `CameraAttributesPractical`, `RenderingServer` quality calls behind `KratorLook` | the rig, by tier | 2 |
| `DirectionalLight3D` splits, `shadow_caster_mask`, PCSS | L1, C2, C3 | 1, 2 |
| SSAO, SSIL, SDFGI | L2 | 2 |
| `ReflectionProbe`, SSR | L3 | 2 |
| `VoxelGI` baked off line | L4, hero halls | later |
| Fog: aerial, height, volumetric; `FogVolume`; fog shaders | track F | 6 |
| `GPUParticles3D` and its collision and attractor nodes | F5 | 6 |
| `Decal` | M11 | 7 |
| `MultiMesh` in cells with visibility ranges | C1 | 1 |
| `OccluderInstance3D` with box and array occluders | C6 | 1 |
| Mesh LOD, `ArrayMesh.shadow_mesh` | C4, C7 | 4 |
| Visibility ranges and `visibility_parent` | C8 | 4 |
| Instance uniforms and global shader parameters | M7's age and weather (both in use already for LOD and the atmosphere) | 3 |
| Sky shader passes (`AT_CUBEMAP_PASS`, half resolution) | C9 | 1 |
| `Viewport.debug_draw` | the audit views: overdraw, PSSM splits, SDFGI, SSAO, occluders, decal and light clusters, motion vectors | all |
| `viewport_get_measured_render_time_gpu` | the harness's clock | 1 |
| `CompositorEffect` | only for what the engine lacks: none is needed for this plan on 4.8 | none |
| Shader baker (4.5) and the pipeline cache | no first-sight stutter in an exported build | export |
| `AreaLight3D`, HDR output (4.7) | photo tier | later |

### 11.2 Tools to build on them (N)

| Item | What | Why |
|---|---|---|
| N1 | **`KratorLook`** and its tier table | one rig, switchable, harness-driven |
| N2 | **A mesh cook**: per place, once, off line (`godot --headless --script`): instanced items cut into cells, weld, levels of detail, shadow mesh, occluders, far tiers; saved as a `.res` beside the glb and keyed by its hash | load time, C4, C7, C8 (and C1 and C6, which step 1 does when a place opens). Today a place is parsed from glTF every time it streams in |
| N3 | **A texture cook**: BC7 once, keyed by the source hash `pack.json` already carries; `PortableCompressedTexture2D` or `Image.save_dds` | the BC7-at-load stall (3.2). On 4.8, mip streaming on top |
| N4 | **An impostor baker** in Godot (`SubViewport`, albedo and normal atlases) | P6 without a round trip through the page |
| N5 | **A look lab scene**: swatches of every hero family under the rig, a tier and hour switch, the debug views, A/B by flag | where M7's amounts are tuned and Gate 7's swatches are shot |
| N6 | **The route harness, extended**: GPU time, the tier, the bar's rows of section 4 as numbers | the only check that sees cost and looks in one frame |

### 11.3 Add-ons and repositories

| Project | Take | Why |
|---|---|---|
| Terrain3D (TokisanGames, MIT; 1.1 for Godot 4.5 to 4.8) | ideas, not the node | Krator's land is its own analytic `WORLD.H` and stream. Worth reading for near-camera displacement and macro variation |
| SunshineClouds2 (Bonkahe; compositor-based volumetric clouds, 4.4 and later) | later, high tier | the sky's clouds work; revisit when the rest holds its caps |
| GodotGrass (2Retr0) and the Hexaquo grass series | reference for P8 | blade shading, wind, levels of detail |
| godot-imposter (zhangjt93, MIT, Godot 4) | reference for N4 | an octahedral baker and shader to read, not a dependency |
| Sky3D (TokisanGames) | no | the sky model is Krator's own and has a twin |
| Cosmo Tree Gen, Tree3D | no | trees stay on `BIO.tree` |
| Material Maker (a Godot-based PBR authoring tool) | optional | for procedural sets with true roughness and height where no scan exists |
| The `godot_mcp` add-on (already enabled) | yes | driving the editor for N5 |

### 11.4 Godot 4.8

Beta 4 is dated 2026-11-18 and the blog says a release candidate is imminent (**docs**). It adds screen-space contact
shadows (an option on the environment and the directional light), multi-bounce ambient occlusion, mip-level texture
streaming, animated decals and a `Trail3D`. Every Godot test must pass on it first (`CLAUDE.md`: 4.7.2 is the owner's
version). Take it as its own step and re-shoot the route before and after.

## 12. The budget

Caps, not measurements. They are what the route harness holds each step to, and they are replaced by measured numbers at
step 1.

| | low: Arc 140T, 1080p out, 30 fps | high: RTX 5060, 1440p, 60 fps |
|---|---|---|
| Frame | 33.3 ms | 16.7 ms |
| Depth prepass and opaque | 14 | 6 |
| Sun shadows | 6 | 2.5 |
| SSAO (and SSIL on high) | 2 | 1.2 |
| SDFGI | 0 | 2.5 |
| Fog (volumetric on high) | 0.5 | 1.0 |
| Transparent, water, particles | 2 | 1.0 |
| Sky and its radiance | 1 | 0.5 |
| Post, anti-aliasing, upscale | 3 | 1.0 |
| Headroom | 4.8 | 1.0 |
| Primitives a frame, all passes | 10 M | 20 M |
| Video memory | 1.5 GB | 3 GB |

What pays for what: C1 to C5 pay for L1's finer shadow and 8192 atlas. C6 and C7 pay for M7's extra fetches and R1's
triangles. The low tier takes no SDFGI, no volumetric fog and no SSR, and gets its grounding from S1, baked vertex
occlusion, probes and SSAO.

## 13. What the exporters must carry (decide before Stage 8)

A change to `core/engine`, `core/catalog` or `core/biome` rebuilds every page that takes it, so it is cheap only inside
the all-builds rebuild. These are small, and they are what the Godot side cannot make for itself:

| Addition | Where | Used by |
|---|---|---|
| The chamfered box (44 triangles on the box's own 24 vertices), behind an export flag | `core/engine/30-geo.js`, kit helpers, `core/catalog` | R1 |
| Three per-vertex fields on walls, posts and furniture: height above the plot or floor, baked occlusion, edge (convex and near an arris) | the same builders; one extra colour set or `COLOR.a` and a second UV | M7, L2, K2's grounding |
| An opening's mark on the wall below and beside it | `36o-open.js` | M7's run-off, M11 |
| Out-of-true jitter, behind the same flag | builders | R2 |
| A grain axis a furniture piece | `core/catalog` | M12 |
| Wind stiffness and phase a vertex on trunks, branches and cards | `core/biome/20-core-kit.js` | P4 |
| Godot packs with colour kept and roughness as ingested | `tools/textures/pack.py` (`packFormat: 2`), `godot/tools/export_spike.py` | M8 |
| A material's `side` (front, back or double), where it now carries only `doubleSided` | `core/export/10-core-export-scene.js` | C5: a record three draws from inside only (`BackSide`: Erewhon's ice shell is one) arrives as single-sided and would be culled. None is in the cases exported so far |
| A mirrored mesh's triangles turned over when its matrix is baked into a bucket | the same, where it applies `matrixWorld` | C5: three flips the winding of a mesh with a negative determinant, the bake does not. The importer now catches it (`KratorKmat.fit`) and draws that bucket on both faces; turned over at export it could be culled |
| `closed: true` on a bucket or an item whose mesh is a closed solid | the same | C5: 60 of the town's 70 materials are double-sided, and 99.8 % of their triangles wind with their normals. A closed solid can cull its back faces whatever the record says; only the export can say cheaply that it is closed |

All are `[G data]`: plain numbers on vertices and records. The web pages ignore them.

## 14. Order of work

One place first, as section 12b of the proposal did for the vertical stack: Longsong's avenue, its east village, the
Oidong forest edge and one hall. Nothing goes to every case until that slice holds its caps and passes the owner's eye.

| Step | What | Exit |
|---|---|---|
| 1 | **Cost, at open time.** C1 to C3, C5, C6, C9, C10; N1, N6; the route timed in Forward+ on both lanes for the first time | the primitive cap at every stop; the caps for opaque and shadows; baselines recorded |
| 2 | **Light.** `KratorLook`, L1 to L6 | the bar's near-shadow, grounding and hour rows; before and after at three hours; AA chosen per tier |
| 3 | **Surface in the shader.** M7 on today's exports, M9, M10, N5 | the bar's colour and gloss rows on the slice's hero families; fetches and GPU time inside the caps |
| 4 | **The cooks.** N2 (with C4, C7, C8), N3 | a place streams in from caches; no BC7 at load; levels of detail and shadow meshes on every surface |
| 5 | **True maps.** M8 for the forty families; P1 to P3 | roughness and saturation spreads measured from the packs; the swatch gallery |
| 6 | **Air.** F1 to F6 | three depth planes at every hour; shafts at 16:20 and at dawn |
| 7 | **Dressing.** M11, P7, P8 | `VISUAL-BAR.md`'s bare-ground gate on the avenue and the lawn |
| 8 | **Form.** Section 13's additions land with Stage 8; then R1 to R5, P4 to P6, M12 in Godot | the bar's edge and opening rows; vertices not raised by R1 |
| 9 | **Godot 4.8** | every test green; the route re-shot |
| 10 | **Every case** | the route on each world case; `test_all.py --nightly` |

Steps 1 to 3 need nothing from the web side and can start now. Step 8's contract (section 13) is the one thing with a
deadline.

The first thing to run needs no code: the route as it stands, in Forward+, on each lane (the header of
`godot/tests/perf/route_harness.gd`; `--gpu-index 1` is the Arc on the owner's laptop, `GRAPHIC-LOAD.md`). It is the
baseline every later number is read against.

```
python tools/harness.py lock --lane rtx -- <godot> --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-rtx.json --md=res://PERF-route-rtx.md --shots=shots/route-rtx
python tools/harness.py lock --lane arc -- <godot> --gpu-index 1 --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-arc.json --md=res://PERF-route-arc.md --shots=shots/route-arc
```

### 14.1 What could go wrong

| Risk | Guard |
|---|---|
| SDFGI leaks at thin walls, ignores instanced geometry, or costs too much while the stream rebases | it is one switch in `KratorLook`; the low tier never has it; the bar's grounding row can be met by baked occlusion and probes alone |
| TAA or FSR2 smear swaying cards | L6 is a test with MSAA as the fallback; sway can move to the engine's `TIME` if motion vectors need it |
| Weathering reads as noise, or every wall the same dirty | amounts per family and per building, tuned in the look lab (N5) against reference photos; an ablation flag |
| True-colour maps shift a kit's palette | the mean is neutralised, the tint still sets the hue; the swatch gallery before and after, per culture |
| The cooks add a build step and stale caches | keyed by the source's hash; `check_godot_exports.py` learns the cache; a cold load still works from glb and webp |
| Bevels and jitter move triangles into small details | R1 adds no vertices; the far level drops the strips; the route's primitive cap |
| The two engines drift further apart | accepted in the proposal's section 12; shared data stays shared, and Gate 7's swatches say by how much |
| 4.8 breaks a twin or a golden | its own step, behind every Godot test |

### 14.2 Not checked in this pass

No frame was timed on a GPU. Only the Oidong case was opened, and of it the Longsong monastery, its east village and one
forest edge. Interiors were read in code and in the stage report, not rendered (the shot script does not run the lamp
pool). Water, characters and fauna were not assessed. The web pages were not opened.

## 15. For the owner to decide

1. **The tiers and their targets.** Is the floor the Arc 140T at 1080p and 30 fps, and the high tier the RTX 5060 at 1440p
   and 60? Every cap in section 12 follows from this.
2. **Godot-only looks.** M7's weathering and R1's bevels will not show on the web pages. The proposal's section 12 already
   says Godot is where it should look best; this widens the gap. The swatch gate (Gate 7) then compares fewer things.
3. **Scans for the hero families.** Forty Poly Haven or ambientCG sets at 1024 px, in colour, in place of generated
   neutral sets, for Godot's packs. This changes how kits look: the tint keeps the hue, the stone gains its own variation.
4. **Section 13 in Stage 8.** Whether the seven additions ride with the rebuild. Without them steps 1 to 7 still stand;
   step 8 waits for the next rebuild.
5. **4.8.** Whether to move when it is stable, since contact shadows and mip streaming are planned around it.

## 16. Sources

Godot, release notes and manual (4.7):
- [Godot 4.7](https://godotengine.org/releases/4.7/): `AreaLight3D`, HDR output, per-pass uniform buffers
- [Godot 4.6](https://godotengine.org/releases/4.6/): the SSR overhaul, octahedral probes, AgX white and contrast, better LOD generation
- [Godot 4.5](https://godotengine.org/releases/4.5/): stencil, the shader baker, specular occlusion, bent normals, SMAA
- [Godot 4.4](https://godotengine.org/releases/4.4/): AgX, the shadow caster mask, ubershaders, the Betsy compressor
- [Godot 4.8 beta 1](https://godotengine.org/article/dev-snapshot-godot-4-8-beta-1/) and [beta 4](https://godotengine.org/article/dev-snapshot-godot-4-8-beta-4/): contact shadows, multi-bounce AO, mip streaming
- [Introduction to global illumination](https://docs.godotengine.org/en/4.7/tutorials/3d/global_illumination/introduction_to_global_illumination.html), [SDFGI](https://docs.godotengine.org/en/4.7/tutorials/3d/global_illumination/using_sdfgi.html), [VoxelGI](https://docs.godotengine.org/en/4.7/tutorials/3d/global_illumination/using_voxel_gi.html), [reflection probes](https://docs.godotengine.org/en/4.7/tutorials/3d/global_illumination/reflection_probes.html)
- [Volumetric fog and fog volumes](https://docs.godotengine.org/en/4.7/tutorials/3d/volumetric_fog.html), [environment and post-processing](https://docs.godotengine.org/en/4.7/tutorials/3d/environment_and_post_processing.html), [lights and shadows](https://docs.godotengine.org/en/4.7/tutorials/3d/lights_and_shadows.html)
- [Decals](https://docs.godotengine.org/en/4.7/tutorials/3d/using_decals.html), [occlusion culling](https://docs.godotengine.org/en/4.7/tutorials/3d/occlusion_culling.html), [mesh LOD](https://docs.godotengine.org/en/4.7/tutorials/3d/mesh_lod.html), [visibility ranges](https://docs.godotengine.org/en/4.7/tutorials/3d/visibility_ranges.html)
- [3D antialiasing](https://docs.godotengine.org/en/4.7/tutorials/3d/3d_antialiasing.html), [resolution scaling](https://docs.godotengine.org/en/4.7/tutorials/3d/resolution_scaling.html), [the Compositor](https://docs.godotengine.org/en/4.7/tutorials/rendering/compositor.html)
- [HDDAGI, pull request 86267](https://github.com/godotengine/godot/pull/86267): not merged; SDFGI stays the open-world GI for now
- [Terrain3D issue 302](https://github.com/TokisanGames/Terrain3D/issues/302): TAA and FSR2 against vertex displacement with no motion vectors

Repositories and tools:
- [Terrain3D](https://github.com/TokisanGames/Terrain3D), [SunshineClouds2](https://github.com/Bonkahe/SunshineClouds2), [GodotGrass](https://github.com/2Retr0/GodotGrass), [Sky3D](https://github.com/TokisanGames/Sky3D)
- [Octahedral impostors (wojtekpil, Godot 3)](https://github.com/wojtekpil/Godot-Octahedral-Impostors); Godot 4 ports are in the asset library
- [Cosmo Tree Gen](https://github.com/FrogCosmonaut/cosmo_tree_gen), [Tree3D](https://github.com/JekSun97/gdTree3D)
- [Poly Haven](https://polyhaven.com) and [ambientCG](https://ambientcg.com): CC0 scans

Craft:
- Burgess and Purkeypile, [Skyrim's modular approach to level design](https://gamedeveloper.com/design/skyrim-s-modular-approach-to-level-design) (GDC 2013)
- [Skyrim Special Edition's additions](https://en.uesp.net/wiki/Skyrim:Special_Edition): god rays, reflections, depth of field, snow and water shaders
- Olsen, [The Ultimate Trim](https://gdcvault.com/play/1022323/The-Ultimate-Trim-Texturing-Techniques) (GDC 2015): bevels carried in a trim sheet's normals
- [Mid-poly assets with face-weighted normals](https://80.lv/articles/creating-assets-within-the-mid-poly-workflow-in-ue5/) (80.lv)
- Sousa, [Vegetation procedural animation and shading in Crysis](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch16.html) (GPU Gems 3, chapter 16)
- Sanders, [The vegetation of Horizon Zero Dawn](https://www.gdcvault.com/play/1025530) (GDC 2018)
- [Hexaquo's grass rendering series in Godot](https://hexaquo.at/pages/grass-rendering-series-part-2-full-geometry-grass-in-godot/)

Not read in full: the GDC talks (the vault pages gate the slides); they are cited for the technique's name and source,
and the claims above rest on their abstracts and on the write-ups linked beside them.

## Appendix A. The A/B run in this pass

One process, so the scene streams once and every variant is shot from the same pose: Xvfb, `--rendering-method
forward_plus --rendering-driver vulkan` on Mesa lavapipe, `KRATOR_VRAM=none`, 1280 x 720, hour 16.33, day 75. MSAA was
2x, not the project's 4x, to save time. The script set the rig as `walk.gd` does, took the views from
`KratorHostUI.build_pois` ("The White Palace from the avenue", "[Village] East") and the route harness's `forest_edge`
stop, and applied each variant on top of the one before. It lives in the session's scratchpad, not in the repo; step 2's
`KratorLook` and step 3's look lab replace it.

| Variant | What was set |
|---|---|
| `cur` | `walk.gd`'s rig: AgX; SSAO radius 1.4, intensity 1.55; four splits to 2,400 m, blended; sky ambient 0.95; the colour script's sun, fog and exposure |
| `light` | sun: `directional_shadow_max_distance` 400, splits 0.05 / 0.15 / 0.4, `light_angular_distance` 0.5, `light_volumetric_fog_energy` 2; atlas 8192, Soft Medium. Environment: SSAO radius 1.0, intensity 2.0, power 1.5, `ssao_light_affect` 0.1; SSIL on; glow 0.35, bloom 0.05, threshold 1.1; volumetric fog density 0.001, length 300, anisotropy 0.75, ambient inject 0.5; `fog_aerial_perspective` 0.45 |
| `weather` | `library.gdshader` with the two blocks below added, as a second `Shader` swapped at run time onto every material that used it (150 at the avenue). The repo's file was not edited |
| `gi` | SDFGI: 6 cascades, `sdfgi_min_cell_size` 0.4, occlusion on, Y scale 75 %, half-resolution GI, converge in 5 frames; shot after 10 frames |

What the frames show:

- **`cur` to `light`, the avenue.** The arcade's shadow on the paving goes from a soft blur to separate bands for the
  roof's edge, the rail and each post. The sky toward the sun gains a glow from the volumetric fog and the palace sits
  behind a thin haze. The palace itself does not change: its walls are as flat as before. That is why surfaces and form
  come after light and are not replaced by it.
- **`cur` to `light`, the green.** The canopy's shadow goes from one dithered blob to dappled shade: leaf-shaped light
  and dark on the grass, with the trunk's own line in it. This is the same setting as on the avenue and it does as much
  for plants as for buildings.
- **`cur` to `light`, the forest edge.** Shadows take the crowns' shapes and the crowns shade themselves underneath. The
  volumetric fog toward the sun is too strong at these values: it whitens a third of the sky. Density and the sun's fog
  energy are per-hour keys for the colour script, not constants. The trees are still flat pastel discs: light does not
  fix what P1 to P6 are for.
- **`light` to `weather`.** The facade gains run-off and warm and cool patches and stops reading as one plane; the brick
  hall beside it gains value. The streaks ignore the windows and the eaves, which is what the opening's mark in section
  13 is for. On the green nothing changed: almost nothing there uses the library shader, which is why M7 is an include
  for the bark and terrain shaders too.
- **`weather` to `gi`.** SDFGI ran on this content and changed the frame: shade under the eaves and the arcade deepened
  and took the sky's blue. But the volumetric fog takes GI light too (`volumetric_fog_gi_inject` is 1 by default), and
  with both on the air brightened until the flags and the facade washed out. The two have to be tuned together: the
  inject down to about a third, or the density down. Whether the instanced geometry contributed cannot be told from one
  frame.
- **Primitives** were 180.6 M in every variant: none of these settings changes what is drawn.
- **The cells.** At the avenue, after the other variants were undone, the script cut every visible `MultiMesh` wider than
  96 m into 64 m cells by its instances' positions, each cell a new `MultiMeshInstance3D` with the same mesh, material,
  layers, shadow setting and visibility range, and hid the original. Counts before and after are in 3.2. It is a count
  experiment: the cells copied the node's `lod_*` uniforms, most of them overflowed, and a row can then draw past its
  range, so the numbers are an upper bound on what a proper split gives.

The weathering blocks. After `c *= bu_bright(v_wp, bu_macro, bu_cell);`:

```glsl
vec3 w_nw = normalize((INV_VIEW_MATRIX * vec4(N_geom, 0.0)).xyz);
float w_wall = 1.0 - abs(w_nw.y);
float w_top = smoothstep(0.45, 0.95, w_nw.y);
float w_under = smoothstep(-0.15, -0.9, w_nw.y);
float w_m1 = km_n(v_wp / 3.7 + 11.0);
float w_m2 = km_n(v_wp / 13.0 + 47.0);
float w_lum = dot(a.rgb, vec3(0.2126, 0.7152, 0.0722));
float w_cav = has_albedo ? smoothstep(0.60, 0.30, w_lum) : 0.0;
float w_streak = smoothstep(0.52, 0.86, km_n(vec3(v_wp.x * 2.9, v_wp.y * 0.21, v_wp.z * 2.9) + 5.0)) * w_wall;
float w_moss = smoothstep(0.60, 0.82, km_n(v_wp * 0.83 + 31.0)) * max(w_top, 0.35 * w_wall * smoothstep(0.55, 0.9, w_m2));
c *= mix(vec3(1.07, 1.0, 0.90), vec3(0.93, 1.0, 1.08), w_m1) * (0.90 + 0.22 * w_m2);
c = mix(c, c * vec3(0.50, 0.43, 0.35), w_cav * 0.55);
c *= 1.0 - 0.20 * w_streak;
c = mix(c, c * 1.10 + vec3(0.015), w_top * 0.35);
c *= 1.0 - 0.22 * w_under;
c = mix(c, vec3(0.10, 0.13, 0.05) + c * 0.35, w_moss * 0.42);
```

Before `METALLIC = metal;`:

```glsl
float w_pol = smoothstep(0.42, 0.78, km_n(v_wp * 1.7 + 3.0));
ROUGHNESS = clamp(ROUGHNESS * mix(1.0, 0.62, w_pol * (1.0 - w_cav)) + 0.10 * w_moss + 0.06 * w_streak, 0.05, 1.0);
```

`km_n` is the value noise already in `lib/breakup.gdshaderinc`. This is a first cut to see whether the idea reads, not
the stack of M7: it has no foot band, no edge wear, no mark below openings and no per-family amounts, and its noise is
analytic where the real one samples a texture.

Also compiled on 4.7.2 in this pass, as one-line shaders on lavapipe: `IRRADIANCE` and `RADIANCE` in a spatial shader,
`BENT_NORMAL_MAP`, an `instance uniform` beside a `global uniform`, a sky shader with `use_half_res_pass`,
`AT_CUBEMAP_PASS`, `AT_HALF_RES_PASS` and `HALF_RES_COLOR`, a `shader_type fog`, and `LIGHT_VERTEX`.
