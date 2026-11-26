# The graphic load: assessment and recommendation (the final rebuild, step 3)

`HANDOFF-REBUILD.md`, "The job" step 2.3: before the remaining biomes are rebuilt, assess the ways to cut the graphic load in both
engines (texture arrays or atlases, material merging, GPU-compressed textures, size caps, HLOD for the far field, what the
impostors and the LOD rework buy) and choose a scheme, so every biome takes it. Measured on nhighlands, the test bed, on the
owner's laptop, 2026-10-26. The step 2 numbers behind this are in `biomes/nhighlands/PERF.md`.

**Which GPU.** The laptop has two. Chrome (and every `verify.py` run) renders on the **integrated Intel Arc 140T**; Godot picks
the **RTX 5060** unless given `--gpu-index 1`. Every number here names its GPU. The integrated one is the one to design for:
it is what the browser pages run on, and a player's laptop may have nothing better.

## What the load is

1. **Vertices, not pixels.** A quarter of the pixels saved a tenth of the frame (three.js, Intel). Hiding every instanced item took
   the stream view from 74 to 25 ms; plain materials in place of every hooked one saved 10-15 ms. The cost is how many card
   instances are drawn and how many vertices each runs.
2. **Most of what is drawn is far away.** The stream view draws 356 k crown cards: 8 k nearer than 150 m, 36 k at 150-400 m,
   116 k at 400-800 m, 196 k beyond 800 m. Its other items (the floor, pods, boulders): 25 k, 120 k, 302 k, 155 k. The tower view
   draws 440 k floor items beyond 800 m (4 M of its 15.7 M triangles); 209 k of them are fern fronds of the far floor band, which
   is drawn to 2.4 km by design.
3. **A third to a half is drawn past its own range.** A chunk mesh (1200 m) is shown while its nearest edge is in range, so a
   650 m item draws out to ~1.85 km and a 1300 m item to ~2.5 km. Counted per instance against its own row's range: the stream
   view 346 k of 956 k instances beyond their range (36% of the instanced triangles), Fan-leaf 50%, the tower 47%, the crest
   overview 52%.
4. **Draw calls are not the limit.** 144-286 calls a view on the page; Godot draws 179-302 a view on the same content and is as
   fast or faster on the same Intel GPU (30-43 ms against three's 34-63), 6-9 ms on the RTX.
5. **Memory is the second wall.** The page: geometry ~380 MB (the bark buckets and the far-tree blobs), instance data ~207 MB,
   textures ~86 MB (39 library maps at 512 px, 54 MB with mips; the 2048 px ground paint, 21 MB). Godot on the 2.4 km tile:
   VRAM 615-656 MB, of which textures 140-181 MB and MultiMesh buffers 309 MB.

## The options, measured

| Option | Measured on nhighlands | Cost | Verdict |
|---|---|---|---|
| **Weld item geometry** (`BIO.INDEX_ITEMS`, step 2) | three, Intel: the stream -17%, the tower -18%, Fan-leaf 0% | done, opt-in per page; same pixels | **take it everywhere** |
| **Cull per instance at its own range** (a vertex-shader early-out in the LOD fade: an instance past its row's range collapses to nothing) | prototyped in the page (a shader hook on the 41 instanced materials, A/B, minimum of 12 frames): the stream 58.0 -> 41.6 ms (-28%), the tower 74.5 -> 63.9 (-14%), Fan-leaf 55.3 -> 52.7 (-5%). The vertices still run (no base-instance draws in WebGL 2), but the tiny far triangles are never rasterized | a few lines in `20-core-kit.js`'s fade chunk; items then stop at the range their kit gave them (they drew up to twice as far): a look change at the far edge of the floor | **take it**, on with `BIO.LOD.fade` |
| **The far band's diet** (a) the far floor band ends nearer (now 2.4 km) and fades into the ground paint (R5 already tints it); (b) crowns past ~600-800 m as octahedral impostors (R6, `34-core-impostor.js`, in core, not yet adopted) instead of hero cards and the blob bucket | not yet measured as a whole. Its reach: 196-361 k crown cards (3.6-6.6 M indices) beyond 800 m a view, 155-440 k floor items, and the 1.04 M-triangle blob bucket drawn on every view (67 MB) | the owner's look: the impostors read darker and thinner than the blobs (HANDOFF, looks waiting) | **the biggest lever left; decide on nhighlands with the owner** |
| **GPU-compressed textures**: KTX2/Basis in three.js, VRAM compression in Godot | Godot, the 2.4 km tile: textures 181 -> 140 MB with BC1/3 (S3TC) or BC7 (BPTC) at load (`KRATOR_VRAM`, `godot/krator/kmat.gd`): the library maps ~55 -> ~14 MB; the rest is the engine's own buffers. Import time unchanged. three.js: ~54 MB of library maps would become ~14 MB (BC7/ASTC, 4x) or ~7 MB (ETC1S, 8x, softer) | three.js: r128's `KTX2Loader` and the Basis transcoder (wasm, a few hundred KB, inlined: pages are single files under 16 MB); a pack.py step writing .ktx2. Godot: an import preset (editor import), no code | **Godot: yes, at import. three.js: not now** (the page is vertex-bound, and 86 MB fits); revisit if page memory on integrated GPUs becomes the limit |
| **Texture arrays / atlases, material merging** (the isle demo's M7 arrays are prior art) | draw calls are not the limit (above): merging cuts calls, not frame time, at this scale | shader rewrites in both engines, uv remaps (the card cells), every kit's materials | **not now**; reconsider for Godot's material count when its importer merges cells |
| **Size caps per family** | already at 512 px for cards and detail maps, one 1024, one 2048 ground paint | none | **keep the caps as they are** (512 cards and details, 1024 hero surfaces, one 2048 ground) |
| **HLOD for the far field** | the far country is already one ring (KFAR, R3); the far trees are a 1.04 M-triangle bucket on every view | the impostors (above) are the far trees' HLOD; the floor's is the ground paint | **through the far band's diet** |
| **Godot: range culling and cell merging** | the importer draws nearly the whole tile from every pose (13.2 M primitives at the stream and at the hummocks alike); it splits each 1200 m chunk into 150 m cells | `core/export` splitting a record by `lod.ranges` (the open request), the same per-instance cull in the leaf and floor shaders (`INSTANCE_CUSTOM` the range), cells merged toward chunks | **take it** with the export change |

## Recommendation

In this order, each on nhighlands first, measured on the Intel GPU, then carried by every biome as it is rebuilt:

1. **Per-instance range culling in core/biome** (the LOD fade's vertex chunk), on wherever `BIO.LOD.fade` is on, with
   `BIO.INDEX_ITEMS` (welding) on in every biome. Each was measured as its own A/B on nhighlands' stream view (welding -17%, then
   the cull -28% on top): together about 40% of that view's frame.
2. **The far band's diet, decided with the owner on nhighlands**: the far floor band shortened (2.4 km -> about 1 km, the ground
   paint carrying the rest) and the octahedral impostors adopted for crowns past ~600-800 m (R6), replacing the blob bucket. This
   is where the remaining 50-70% of the instanced vertices are. Measure, then judge the look.
3. **core/export splits records by `lod.ranges`**; the Godot importer culls per instance (the same rule in its shaders) and merges
   its 150 m cells toward chunks. Godot's frame and its 309 MB of MultiMesh buffers both fall with step 2's diet.
4. **Godot imports textures VRAM-compressed** (BC7 on desktop; ASTC on mobile). three.js keeps its webp maps for now.
5. **Not now:** texture arrays, material merging, new size caps.

Each biome's rebuild then takes: `BIO.INDEX_ITEMS = true`, the LOD merge and fade (which bring the per-instance cull), its card
cells (`tools/textures/check_cells.py`), and, once step 2 is approved, the far band's settings and the impostors.

## Commands

The page measurements are browser-pane scripts (the GPU timer around `renderer.render`, instance matrices against the camera);
`biomes/nhighlands/PERF.md` describes them. Godot:

```
python3 tools/harness.py export biomes/nhighlands/dist/nhighlands.html --out godot/data/world-nhighlands-wide --box=-2900,-2900,-500,-500 --sky 1024
KRATOR_VRAM=bptc godot --gpu-index 1 --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-nhighlands-wide --size=1024x768 --out=<dir>
```
