# nhighlands: the optimization pass and the Godot spike (the final rebuild, step 2)

`HANDOFF-REBUILD.md`, "The job" step 2: an optimization pass on the test bed, then a Godot spike of it, measured, before the
graphic-load assessment (step 3) chooses a scheme for the remaining biomes. Measured 2026-10-26 on the owner's laptop.

## The machine (it has two GPUs)

- **Chrome renders on the integrated Intel Arc 140T** (ANGLE, Direct3D 11; `WEBGL_debug_renderer_info`), WebGL 2, MSAA 4x.
  Every three.js number below, and every `verify.py` run with `KRATOR_GL=gpu`, is that GPU.
- **Godot 4.7.2 picks the NVIDIA GeForce RTX 5060 Laptop GPU** (Vulkan, Forward+) unless told otherwise (`--gpu-index`).
- So the page has been judged on the weaker GPU all along. A comparison between the engines has to name the GPU; the table in
  "The Godot spike" does.

## Where a frame goes (three.js, the page as built)

1024x768, the page's preset views, `EXT_disjoint_timer_query_webgl2` around `renderer.render(scene, camera)` (the world only,
not the sky pass). The timer swings about 25% between runs on this GPU, so each comparison below is an A/B inside one page,
alternated, keeping the minimum.

| View | Draw calls | Triangles | Instances drawn | GPU ms |
|---|---:|---:|---:|---:|
| The stream | 217 | 13.1 M | 0.97 M | 45-70 |
| Fan-leaf | 285 | 12.8 M | 0.92 M | 63-90 |
| The tower | 257 | 15.7 M | 1.22 M | 55-80 |
| Overview from the SE crest | 144 | 5.5 M | 0.33 M | 47-55 |

- **It is vertex-bound, not fill-bound.** A quarter of the pixels (pixel ratio 0.5) saved about a tenth of the frame.
- **The instanced flora is most of it.** Hiding every instanced item took the stream view from 74 to 25 ms; hiding all flora,
  to 12 ms. Bark buckets, the ground, the water and the fog are a few ms each. By group: the crowns' leaf cards 20-28 ms, the
  floor cards 8-28 ms, the solid floor items (cushions, boulders, mushrooms, pods) 0-12 ms.
- **The shaders are not the main cost.** Plain Lambert materials in place of every instanced material (no sway, gusts, ground
  tint, back-light, fade or fog hooks) saved 10-15 ms of 70.
- **The count is.** The stream view runs the vertex shader for about 22 M vertices: 296 k fern fronds, 90 k needle sprays,
  84 k leaf sprays, 68 k lady ferns... The geometry was triangle soup (`BIO.def` un-indexed every item), so a 6-triangle card
  ran 18 vertices.

## What this pass changed

| Change | Where | Measured |
|---|---|---|
| **Item geometry welded and drawn by index** (`BIO.INDEX_ITEMS`, opt-in; `BIO.def(..., {indexed})`): the same triangles in the same order, a card's 18 vertices become 12 and the post-transform cache shares them | `core/biome/20-core-kit.js` (`weldGeo`), test in `test-lod.js`; nhighlands `45-host-stage.js` (`?index=0` for the soup) | in-page A/B, minimum of 15 frames: The stream 57.5 -> 47.6 ms (-17%), The tower 69.4 -> 56.6 ms (-18%), Fan-leaf 62.6 -> 62.8 (no change: its conifers' needle sprays are vertex-light already) |
| (from step 1) the LOD merge, `minTris`, the cross-fade, the four label merges | core/biome B1/B2/B5 | draw calls 293 -> 217 (the stream), 353 -> 285 (worst view) |

Tried and dropped: **400 m chunks for the near floor band** (B2 `BIO.chunk`): 7-14% fewer instances drawn, about 100 more draw
calls on every view. Not worth it at this density.

## The budget, held and on the GPU

- 31.1 M triangles held (trees 18.2 M, floor 11.9 M, dress 0.2 M, the Cut's lichen and reeds 0.7 M), 2.67 M instances.
- GPU memory, measured from the scene: **geometry 379 MB** (the trumpet trees' bark `nfunnel` 84 MB, the far-tree blobs `nfar`
  67 MB, `nbark4` 57 MB, `nbark0` 38 MB, the ground 34 MB), **instance data 207 MB** (a 64-byte matrix and a colour each),
  **textures about 80 MB** (50 maps; one 2048 sheet is 21 MB of it). JS heap 700 MB. The page is 7.7 MB (the cap is 16 MB).
- The far trees are one always-drawn 1.04 M-triangle bucket on every view (`nfar`, blob crowns past 1300 m).

## Levers not taken here (for step 3)

Ranked by what they would buy on this page:

1. **Far trees as octahedral impostors** (R6, `34-core-impostor.js`, already in core): `nfar`'s 1.04 M triangles a view and 67 MB
   become 2 triangles a tree and a few MB of atlas. Waits on the owner's look (the impostors read darker and thinner than the
   blobs: HANDOFF "Looks waiting on the owner").
2. **Fewer card instances in the near band's outer half**: the floor is planted in bands round the LOD origins (5.6 m cells
   to 320 m, 13 m cells to 900 m) and drawn to 650 m from a 1200 m chunk box, so a chunk draws whole up to about 1.8 km out.
   A density fall-off inside the band (keep 1 in k past 400 m, the floor tint R5 already fades them into the ground) would cut
   the frond and fern count most. Changes the look a little; the owner's call.
3. **Range caps for tiny items**: mushrooms (8-24 cm) and berries (5 cm) are drawn to 1300 m inside the tree passes. A
   per-item `maxRange` in `BIO.def` would drop them past ~200 m at no visible cost (a few hundred thousand triangles a view).
4. **Instance data**: 207 MB of mat4s. Godot's MultiMesh stores a 3x4 transform (48 bytes); three.js needs the 4x4.
5. **The ground**: 1.04 M triangles in one mesh, drawn whole on every view (34 MB). A chunked or clipmap ground is the Godot
   terrain bake's job; on the page it costs a few ms.

## The Godot spike

The export: `python3 tools/harness.py export biomes/nhighlands/dist/nhighlands.html --out godot/data/<case> --box ...` (core/export's
krator-world container). `godot/spike.gd` loads `world-nhighlands` and `world-nhighlands-wide` as krator-world cases;
`godot/tests/perf/perf_capture.gd` takes a case's own poses (`CASE_POSES`: the page's preset views in world coordinates).

**`world-nhighlands`** (a 400 m tile at the stream, `--box=-1800,-1800,-1400,-1400`): 38.5 k instances, 39 items, 11 buckets,
every join resolved; world.json 10.9 MB (8.8 MB of it the stage's map-wide fields), world.glb 8.1 MB, tex/ 4.0 MB. Imports in
1.3-2.2 s. On the RTX 5060, Forward+, 1024x768: 84-89 draws, 0.59 M primitives, 1.2-2.4 ms a frame, VRAM 242 MB
(textures 154 MB, buffers 25 MB).

The importer's gaps on this case: the kit shader hooks it cannot name (the spore glow, one bark kind) draw plain; every Godot
material here is double-sided; LOD-chunked items are split into 150 m cells with node-point visibility ranges (three's are per
1200 m chunk box); the terrain is the page's height sampled on a grid (no core/terrain field baked).

**`world-nhighlands-wide`** (2.4 km about the stream view, `--box=-2900,-2900,-500,-500`; not committed, 290 MB: run the export
to make it, `.gitignore` keeps it out): 1.28 M instances in 274 items, 84 buckets, every join and uid resolved; world.json
64.5 MB, world.glb 235 MB. Exported in 95 s. Godot imports it in 16 s (275 MultiMeshes).

The same page views in both engines, 1024x768, on both GPUs (Godot: the frame time with vsync off; three.js: the world pass
alone by the GPU timer, minimum of 15 frames; three draws the whole map, the Godot tile only its 2.4 km, so the far country,
the far trees past the tile and the sky are missing from the Godot side):

| View | three.js, Intel Arc 140T | Godot, Intel Arc 140T | Godot, RTX 5060 | Godot draws | Godot primitives |
|---|---:|---:|---:|---:|---:|
| The stream | 63 ms (217 calls, 13.1 M tris) | 43 ms | 9.1 ms | 291 | 13.2 M |
| The tower | 50 ms | 38 ms | 8.0 ms | 278 | 12.8 M |
| Temperate cathedral | 34 ms | 30 ms | 5.7 ms | 179 | 10.6 M |
| Moss hummocks | 36-45 ms | 38 ms | 9.3 ms | 284 | 13.2 M |

Godot memory on the tile: VRAM 640-656 MB (buffers 309 MB, textures 165-181 MB), static 630-656 MB.

What it says:
- **The same content costs about the same on the same GPU.** Godot is somewhat faster on the iGPU (30-43 ms against 34-63)
  while drawing every one of the tile's 13 M primitives at every pose. Neither engine reaches 30 fps on the integrated GPU at
  this density; the discrete GPU runs Godot at 108-176 fps.
- **Godot draws nearly everything in the tile at every pose** (13.2 M primitives at the stream and at the hummocks alike): the
  importer's 150 m cells with widened visibility ranges cull little. Range culling at instance level (the importer's next
  step, or the export splitting a record by `lod.ranges`, the open core/export request) is where Godot's frame drops further.
- **Export throughput was the blocker, now fixed.** `tools/harness.py export` returned the whole container in one
  `page.evaluate`; at 1 M instances it ran past 25 minutes where the page's own work takes seconds. It now keeps the result as
  one string and pulls it in 4 MB slices (`evaluate_big`): 488 k instances in 67 s and 1.28 M in 95 s, page build included.
- **Memory is the next wall.** 650 MB of VRAM for one 2.4 km tile, most of it MultiMesh buffers (three.js: 207 MB of instance
  data and 379 MB of geometry for the whole map). Step 3's texture arrays and compression address the 165-180 MB of textures;
  the buffers want fewer instances (the levers above) and the far ring as impostors or HLOD.

Commands (the perf capture opens a window; `--gpu-index 1` is the Intel GPU on this laptop, the default the NVIDIA):

```
python3 tools/harness.py export biomes/nhighlands/dist/nhighlands.html --out godot/data/world-nhighlands-wide --box=-2900,-2900,-500,-500 --sky 1024
godot --gpu-index 1 --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-nhighlands-wide --size=1024x768 --out=<dir>
```
