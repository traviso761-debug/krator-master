# The spike's perf table

Written by `godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=...` (`godot/README.md`, "The perf capture"): one table per must-pass case, one row per camera pose (`POSES` in the script), the machine above each. **Only a run in Forward+ on a real GPU counts** (`godot/CHECKLIST.md`, item 7); a headless or llvmpipe run only proves the script runs, and says so in its header. Frame time is the frame delta with vsync off at the window size shown; p95 is the 95th percentile; process is `Performance.TIME_PROCESS` (Godot refreshes it once a second as that second's worst process step: the max seen at the pose); draws, prims and objects are the RenderingServer's per-frame totals; VRAM, textures and buffers are `RENDER_*_MEM_USED`. Paste a real run's tables into `GODOT-PLAN.md`'s findings.

## world-iziz

- 4.7.2-stable (official), **forward_plus** (vulkan), GPU: none  **HEADLESS: the numbers mean nothing**
- Windows, commit `4acd620d1d5b`, 2026-10-18 21:09:25, window 0x0, vsync off, 120 frames per pose after 10 warm-up
- import 1469 ms (the importer's own clock 1439.0 ms), first frame at 1480 ms; 1254 nodes, 191 mesh nodes, 157 MultiMeshes with 12298 instances; 3 gaps reported

| Pose | Frame ms | p95 | fps | Process max ms | Draws | Prims | Objects | VRAM MB | Tex MB | Buf MB | Static MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| whole tile, high oblique | 17.65 | 22.38 | 57 | 1501.26 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 167.0 |
| whole tile, from the far side | 29.26 | 20.67 | 34 | 945.66 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 167.0 |
| edge, eye level, looking in | 6.90 | 7.09 | 145 | 790.42 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 167.0 |
| near, a walker at the centre | 6.95 | 7.74 | 144 | 5.05 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 167.0 |

## world-sedesert

- 4.7.2-stable (official), **forward_plus** (vulkan), GPU: none  **HEADLESS: the numbers mean nothing**
- Windows, commit `4acd620d1d5b`, 2026-10-18 21:09:25, window 0x0, vsync off, 120 frames per pose after 10 warm-up
- import 623 ms (the importer's own clock 579.0 ms), first frame at 630 ms; 48 nodes, 39 mesh nodes, 34 MultiMeshes with 7280 instances; 5 gaps reported

| Pose | Frame ms | p95 | fps | Process max ms | Draws | Prims | Objects | VRAM MB | Tex MB | Buf MB | Static MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| whole tile, high oblique | 6.90 | 7.38 | 145 | 2.49 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 110.0 |
| whole tile, from the far side | 10.27 | 15.84 | 97 | 46.59 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 110.0 |
| edge, eye level, looking in | 11.12 | 15.97 | 90 | 148.84 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 110.0 |
| near, a walker at the centre | 7.04 | 8.86 | 142 | 148.84 | 0 | 0 | 0 | 0.0 | 0.0 | 0.0 | 110.0 |

