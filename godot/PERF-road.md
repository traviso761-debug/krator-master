# The road on the GPU (GODOT-PLAN.md M8)

NVIDIA GeForce RTX 5060 Laptop GPU, 1.4.325, 1600x900, vsync off, Godot 4.7.2-stable (official); `tests/perf/road_perf.gd`, the walker driven at 30 m/s over 3 km of road a stretch.

| Stretch | Start (ms) | Frames | Mean (ms) | 95th (ms) | Worst (ms) | Hitches > 33 ms | Draw calls (max) | Primitives (max) | VRAM (MB) |
|---|---|---|---|---|---|---|---|---|---|
| out of Longsong (km 1) | 10695 | 74358 | 1.3 | 1.6 | 856.6 | 10 | 14 | 1728752 | 274 |
| the valley's middle (km 240) | 4819 | 81507 | 1.2 | 1.5 | 890.4 | 12 | 14 | 1750000 | 218 |
| the last climb to Strongbow (km 478) | 7225 | 67848 | 1.4 | 1.8 | 111.4 | 12 | 64 | 1707631 | 235 |

The stream's updates that loaded (+) or freed (-) a case, during each drive (each runs on the main thread: its time is a hitch):

- out of Longsong: 580 ms (+c-012-002), 855 ms (+c-012-001)
- the valley's middle: 889 ms (+c-026-004), 716 ms (+c-026-005)
- the last climb to Strongbow: none
