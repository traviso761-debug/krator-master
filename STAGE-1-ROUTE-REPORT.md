# Stage 1 Report — Deterministic Route Harness & Sampler / VRAM Budgets

**Branch:** `claude/vertical-stack`  
**Spec:** `GRAPHICS-TERRAIN-PROPOSAL.md` Section 7 (`A1`), Section 9.2 (Gates 2 & 8), Section 11 (Stage 1)  
**Date:** 2026-11-19

---

## 1. Summary of Infrastructure Added

1. **Linked-Program Sampler & Estimated VRAM Budgets (`tools/harness.py`, `tools/check_budgets.py`):**
   - Added `VRAM_JS` and `R.vram` scene-memory accounting in `tools/harness.py` (deduplicating shared `THREE.Texture`, `DataTexture`, `DataTexture2DArray`, `CompressedTexture`, `BufferGeometry`, `InterleavedBuffer`, and `InstancedMesh` matrices/colors).
   - Extended `FIND_JS`, `SAMPLERS_JS`, and `SAMPLE_JS` in `tools/harness.py` so open-world pages (`HOST.scene`, `HOST.camera`, `HOST.renderer`) report active GLSL uniform samplers and estimated VRAM alongside standard kit/settlement pages.
   - Added `samplers` and `vram_mb` ceiling enforcement to `VerifyPage.run_universal` and documented both fields in `tools/check_budgets.py`.
   - Verified with `tools/tests/test_route_and_budgets.py`: **`PASS` (`5 checks, 0 failed`)**, including shared-buffer deduplication and negative regression catches on sampler, VRAM, draw-call, triangle, and plant-grounding regressions.

2. **Web Deterministic 4-Stop Route Harness (`tools/route_harness.py`):**
   - Evaluates 4 deterministic stops across 3 hours (`12:00`, `16:20`, `22:00`) on three tracks:
     - `openworld` (`openworld/oidong-highrift/dist/oidong-highrift.html`)
     - `ancientsvalley` (`biomes/ancientsvalley/dist/ancientsvalley.html`)
     - `interior` (`kits/ancients-interiors/dist/ancients-interiors.html`)
   - Records `median_ms`, `p95_ms`, `gpu_median_ms` (`EXT_disjoint_timer_query_webgl2` when exposed), `calls`, `tris`, `heap_mb`, `vram` (`texMB` + `geomMB`), `samplers_max` (from `getActiveUniform` on linked programs), and worst plant-to-drawn-ground height error (`TERRAIN.heightDrawn` / `GROUND.meshH` / `KDRAWN`).
   - Supports `--compare <baseline.json> <current.json>` ratchet gating.

3. **Godot 4.7.2 Deterministic 4-Stop Route Harness (`godot/tests/perf/route_harness.gd`):**
   - Streams `world-oidong-highrift` across 4 stops (`city_block`, `forest_edge`, `door_transition`, `water_ground`) and 3 hours (`12:00`, `16:20`, `22:00`), recording chunk/place stream build time, active draw nodes, `MultiMesh` instances, `StreamFlora` hero/mid counts, VRAM monitors, frame time, and `StreamFlora`-to-`tri_height_at` plant grounding error.

---

## 2. Recorded Baselines

### 2.1 Open World Web (`openworld/oidong-highrift`, `11.80 MB` page)

*Environment: Chromium 156 ANGLE SwiftShader (`software` lane, `800x450`, boot `49.61 s`).*

| Stop | Hour | Calls | Triangles | Median (ms) | Heap (MB) | VRAM Est. (MB) | Tex / Geom (MB) | Max Samplers | Worst Plant Err (m) |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|
| `city_block` (Longsong Shar) | `12:00` | `314` | `2,866,106` | `3.0` | `669.8` | `323.68` | `145.27 / 178.41` | `4` | `25.417` |
| `city_block` (Longsong Shar) | `16:20` | `314` | `2,866,106` | `2.0` | `669.8` | `323.68` | `145.27 / 178.41` | `4` | `25.417` |
| `city_block` (Longsong Shar) | `22:00` | `313` | `2,866,104` | `2.1` | `669.8` | `323.68` | `145.27 / 178.41` | `4` | `25.417` |
| `forest_edge` (Oidong Valley) | `12:00` | `346` | `1,777,013` | `8.2` | `710.0` | `344.87` | `150.29 / 194.58` | `4` | `0.000` |
| `forest_edge` (Oidong Valley) | `16:20` | `346` | `1,777,013` | `5.8` | `710.0` | `344.87` | `150.29 / 194.58` | `4` | `0.000` |
| `forest_edge` (Oidong Valley) | `22:00` | `345` | `1,777,011` | `3.5` | `710.0` | `344.87` | `150.29 / 194.58` | `4` | `0.000` |
| `door_transition` (Longsong Nub) | `12:00` | `474` | `3,151,094` | `7.6` | `643.3` | `354.71` | `150.29 / 204.42` | `4` | `21.801` |
| `door_transition` (Longsong Nub) | `16:20` | `474` | `3,151,094` | `7.3` | `643.3` | `354.71` | `150.29 / 204.42` | `4` | `21.801` |
| `door_transition` (Longsong Nub) | `22:00` | `473` | `3,151,092` | `10.4` | `643.3` | `354.71` | `150.29 / 204.42` | `4` | `21.801` |
| `water_ground` (Biruk al-Ghaym) | `12:00` | `602` | `4,966,752` | `3.8` | `663.3` | `362.99` | `150.62 / 212.36` | `4` | `6.724` |
| `water_ground` (Biruk al-Ghaym) | `16:20` | `602` | `4,966,752` | `13.2` | `663.3` | `362.99` | `150.62 / 212.36` | `4` | `6.724` |
| `water_ground` (Biruk al-Ghaym) | `22:00` | `601` | `4,966,750` | `13.4` | `663.3` | `362.99` | `150.62 / 212.36` | `4` | `6.724` |

- **Findings:** Confirms `GRAPHICS-TERRAIN-PROPOSAL.md` Section 2.1 (`Max Samplers = 4`, giving `11` samplers of headroom under the `15`-sampler WebGL2 budget for Stage 3's `KHORIZON` + `KSHADOW`). At `forest_edge`, near-camera chunks use `2 m` vertex spacing so `FLORA` matches `TERRAIN.heightDrawn` to `< 1 mm`, whereas at `water_ground` (`6.72 m`) and hamlet edges (`21.8–25.4 m`), plants placed past the finest `128 m` chunk tier sit on analytic `WORLD.H` while coarser terrain chunks bridge across channels/cuts.

---

### 2.2 Ancient's Valley Web (`biomes/ancientsvalley`, `4.81 MB` page)

*Environment: Chromium 156 ANGLE SwiftShader (`software` lane, `320x180`, hour `16:20`).*

| Stop | Calls | Triangles | Heap (MB) | VRAM Est. (MB) | Tex / Geom (MB) | Max Samplers | Worst Plant Err (m) |
|---|---:|---:|---:|---:|---|---:|---:|
| `city_block` (`A residential street`) | `1,216` | `7,361,991` | `1,313.8` | `887.97` | `212.81 / 675.17` | `11` | `10.770` |
| `forest_edge` (`A park gone feral`) | **`1,638`** | **`8,379,595`** | `1,316.5` | `887.97` | `212.81 / 675.17` | `11` | **`31.501`** |
| `tower_door` (`AVL.doors[0]` lobby threshold) | `651` | `5,254,998` | `1,321.2` | `887.97` | `212.81 / 675.17` | `11` | `1.505` |
| `water_ground` (`The core from the water`) | `759` | `5,791,508` | `1,320.5` | `887.97` | `212.81 / 675.17` | `11` | **`36.679`** |

- **Findings:** Quantifies every pressure point identified in `GRAPHICS-TERRAIN-PROPOSAL.md` Section 2.5 & Section 7 (`A0`):
  1. **Draw calls exceed ceiling:** `city_block` (`1,216`) and `forest_edge` (`1,638`) exceed the `1,200` call budget before `core/biome` merge/index/cull switches are enabled (Stage 6 `A0`).
  2. **VRAM & geometry footprint:** `887.97 MB` estimated GPU buffers (`675.17 MB` unique geometry/instance buffers + `212.81 MB` textures), `1.32 GB` JS heap.
  3. **Plant-to-drawn-ground error (`GROUND.meshH`):** `10.77 m` to `36.68 m` where flora stands on analytic `STAGE.ground` while the unculled `14 m`-cell `GROUND` mesh bridges craters, channels, and shorelines.
  4. **Pre-rebuild `KGROUND` cost:** `forest_edge` software rasterization is `~90x` slower than `city_block` due to unguarded `49`-texel-per-pixel fetches across exposed ground (fixed in `core/terrain/43-core-ground.js` in Stage 0; reaches `ancientsvalley.html` on rebuild).

---

### 2.3 Ship Interiors Web (`kits/ancients-interiors`, `0.36 MB` page)

| Stop | Calls | Triangles | Median (ms) | Heap (MB) | VRAM Est. (MB) | Tex / Geom (MB) | Max Samplers |
|---|---:|---:|---:|---:|---:|---|---:|
| `hall_entry` | `17,624` | `629,292` | `106.7–132.9` | `173.7` | `48.29` | `19.40 / 28.89` | `1` |
| `corridor_door` | `17,624` | `629,292` | `111.5–156.1` | `139.9` | `48.29` | `19.40 / 28.89` | `1` |
| `cabin_room` | `17,624` | `629,292` | `116.2–127.4` | `129.5` | `48.29` | `19.40 / 28.89` | `1` |
| `bridge_deck` | `17,624` | `629,292` | `104.8–115.2` | `135.3` | `48.29` | `19.40 / 28.89` | `1` |

---

### 2.4 Godot 4.7.2 Open-World Route (`world-oidong-highrift`)

*Scene/grounding/streaming baseline (`godot --headless --path godot --script res://tests/perf/route_harness.gd`):*

| Stop | Stream Build (ms) | Active Draw Nodes | MultiMesh Instances | `StreamFlora` (Hero / Mid) | Worst Plant Err vs `tri_height_at` (m) |
|---|---:|---:|---:|---|---:|
| `city_block` (Longsong & Monastery) | `65,800.4` | `779` | `108,932` | `0 / 14,703` | `0.0000` |
| `forest_edge` (Oidong Valley) | `1,083.7` | `365` | `20,945` | `242 / 6,956` | **`3.8393`** |
| `door_transition` (Monastery gatehouse) | `60,027.5` | `779` | `109,025` | `0 / 14,731` | `0.0000` |
| `water_ground` (Strongbow canyon & Cataract) | `9,349.7` | `621` | `114,061` | `0 / 318` | `0.0000` |

- **Findings:** `forest_edge` catches a **`3.84 m`** plant-to-drawn-ground discrepancy in Godot because `StreamFlora` places trees on analytic height while `world_stream.gd` builds `64 m` terrain cells (`tri_height_at`).

---

## 3. Hardware GPU Capture Commands (Arc 140T & RTX 5060)

Because this remote Linux container has no hardware GPU (`arc` / `rtx`), run these three commands on the Windows workstation to record the hardware frame-time and Forward+ GPU baselines:

```powershell
# 1. Web routes on Intel Arc 140T lane:
$env:KRATOR_GL = "gpu"
python tools/harness.py lock --lane arc -- python tools/route_harness.py --track openworld --shots shots/route-ow-arc --out PERF-route-ow-arc.json --md PERF-route-ow-arc.md
python tools/harness.py lock --lane arc -- python tools/route_harness.py --track ancientsvalley --shots shots/route-av-arc --out PERF-route-av-arc.json --md PERF-route-av-arc.md

# 2. Web routes on NVIDIA RTX 5060 lane:
python tools/harness.py lock --lane rtx -- python tools/route_harness.py --track openworld --shots shots/route-ow-rtx --out PERF-route-ow-rtx.json --md PERF-route-ow-rtx.md
python tools/harness.py lock --lane rtx -- python tools/route_harness.py --track ancientsvalley --shots shots/route-av-rtx --out PERF-route-av-rtx.json --md PERF-route-av-rtx.md

# 3. Godot 4.7.2 Forward+ route on NVIDIA RTX 5060 lane:
python tools/harness.py lock --lane rtx -- godot --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-godot-rtx.json --md=res://PERF-route-godot-rtx.md --shots=shots/route-godot-rtx
```
