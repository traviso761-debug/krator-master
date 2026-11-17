# The road on the GPU (GODOT-PLAN.md M8)

NVIDIA GeForce RTX 5060 Laptop GPU, 1.4.325, 1600x900, vsync off, Godot 4.7.2-stable (official); `tests/perf/road_perf.gd`, the walker driven at 30 m/s over 3 km of road a stretch.

| Stretch | Start (ms) | Frames | Mean (ms) | 95th (ms) | Worst (ms) | Hitches > 33 ms | of them: compiling pipelines / just after an attach / the walker's physics (its collision queries) / else | Draw calls (max) | Primitives (max) | VRAM (MB) |
|---|---|---|---|---|---|---|---|---|---|---|
| out of Longsong (km 1) | 9004 | 74782 | 1.3 | 1.6 | 334.2 | 10 | 0 / 2 / 0 (0) / 8 | 14 | 1728752 | 274 |
| the valley's middle (km 240) | 6079 | 80499 | 1.2 | 1.5 | 358.0 | 21 | 0 / 2 / 0 (0) / 19 | 14 | 1750000 | 218 |
| the last climb to Strongbow (km 478) | 6201 | 67098 | 1.5 | 1.9 | 173.6 | 19 | 0 / 0 / 0 (0) / 19 | 64 | 1707631 | 235 |

The stream during each drive: the cases built on the worker thread (the build off the main thread, the attach on it: what a frame pays), and any update that loaded (+) or freed (-) a case on the main thread:

- out of Longsong: c-012-002 built 380 ms off the main thread, attached in 0.1 ms, c-012-001 built 522 ms off the main thread, attached in 1.2 ms
- the valley's middle: c-026-004 built 1190 ms off the main thread, attached in 0.5 ms, c-026-005 built 488 ms off the main thread, attached in 0.1 ms
- the last climb to Strongbow: none
