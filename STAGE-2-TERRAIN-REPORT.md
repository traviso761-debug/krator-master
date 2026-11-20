# Stage 2 Terrain Report — `T1` Ablation, World-Tile Streams, and `T2` 250 m Drainage Residual

Branch: `claude/vertical-stack`  
Proposal reference: [`GRAPHICS-TERRAIN-PROPOSAL.md`](file:///home/antigravity/traviso761-debug/vertical-stack/GRAPHICS-TERRAIN-PROPOSAL.md) Section 4 (`T1`, `T2`), Section 11 (Stage 2), and Section 12 (owner answers 2 & 3).

---

## Executive Summary

1. **`T1` Contour-Parallel Ablation ([`ablate_t1.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/ablate_t1.py), [`stage2-t1-ablation.json`](file:///home/antigravity/traviso761-debug/vertical-stack/godot/shots/stage2-t1-ablation.json)):**
   - On the three `0.54–0.70` alignment windows in Section 3.2 (`pinnacle` hyperjungle and `oidong` Oidong Valley), **turning off benches and landforms changes alignment by `0.0000`** because `jungle` and `vale` already have `terr = 0.0`.
   - Instead, `macro_only` (the smoothed 2 km scale model + `6 km` hills + `1.7 km` ridges alone) reads **`0.83–0.98` alignment**: on a steep, curved macro slope break, the `G60 - G540` diagnostic responds to macro profile curvature ($\partial^2 h / \partial s^2$, whose gradient points straight upslope, $\cos^2 \theta \to 1$), while `S.gully` (`0.35–0.50`) is too gentle to rotate the `60–540 m` gradient cross-slope. Doubling erosion depth (`erode_2x`) drops alignment strongly (`0.542 -> 0.401`, `0.703 -> 0.511`, `0.598 -> 0.361`).
   - Conversely, on `High Rift` (`steps`, `terr = 0.90`), `WRELIEF.bench` is solely responsible for both the `34–41%` ringed-tile share (`0%` with benches off) and the inverted `180–540 / 60–180 m` band ratio (`0.75–0.84`, because `65 m` caprock risers inject ~`18 m` RMS directly into `60–180 m`).
2. **World-Tile Stream Bake ([`world_tiles.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/world_tiles.py), [`bake_streams.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/bake_streams.py), [`test_world_tiles.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/test_world_tiles.py)) — `PASS`:**
   - Moved stream tracing onto fixed `64 km x 64 km` (`256 x 256` cells at `250 m`) world tiles with an `8 km` (`32`-cell) halo seeded from global `2 km` flow accumulation on `tools/scale-model/5.1` (`4096 x 2048`).
   - Verified `0` bed reversals, legacy `pinnacle --check` exact (`same`), and **`0.000000 m` world-space agreement across all 86 shared interior stream lines** between two differently cropped, shifted-origin regions.
3. **`T2` 250 m Drainage Residual Experiment ([`bake_residual.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/bake_residual.py), [`43d-world-residual.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/43d-world-residual.js), [`wresidual.gd`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/wresidual.gd), [`test_residual.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/test_residual.py)) — `6 / 12` Gates Pass -> Shelve `D` for Stage 8:**
   - All **6 infrastructure, pin, performance, storage, determinism, and twin gates (`3, 4, 9, 10, 11, 12`) `PASS`**: named rivers (`0.0 m` climb, `1.0` cell max shift), settlement sites (`0.000000 m` drift in town bands), junction angles (`47.5°` peak on both tiles), `WORLD.H` speed (`7.88 -> 7.56 µs` on `oidong-highrift`, `6.03 -> 6.09 µs` on `pinnacle`), bake speed & SHA-256 determinism (`40.3 s` / `89.5 KB` High Rift, `14.1 s` / `100.4 KB` Pinnacle, `100%` byte-identical), and GDScript 16-bit PNG twin (`1.1e-13` and `4.5e-13` max error vs `1e-6` tolerance).
   - **6 geomorphological & constraint-coupling gates (`1, 2, 5, 6, 7, 8`) `FAIL`** (`stage2-t2-results.json`). Per [`GRAPHICS-TERRAIN-PROPOSAL.md`](file:///home/antigravity/traviso761-debug/vertical-stack/GRAPHICS-TERRAIN-PROPOSAL.md) Section 4 (`T2`) and Section 11 (Stage 2: *"T2's table passes, or the residual is shelved with the numbers"*), **`D` is shelved (kept opt-in and inactive by default)**, pointwise `WMICRO` v2 (`T0`) stays authoritative, world-tile stream baking (`bake_streams.py --world-tiles`) advances to Stage 8, and `T1`'s bench-erosion / steep-flank gully fix is recommended on `WRELIEF.bench` / `WMICRO.erode` alone.

---

## Part 1 — `T1` Contour-Parallel Ablation

Script: [`core/world/ablate_t1.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/ablate_t1.py)  
Raw data: [`godot/shots/stage2-t1-ablation.json`](file:///home/antigravity/traviso761-debug/vertical-stack/godot/shots/stage2-t1-ablation.json), [`godot/shots/stage2-t1-ablation.md`](file:///home/antigravity/traviso761-debug/vertical-stack/godot/shots/stage2-t1-ablation.md)

Evaluated on `relief.micro = 2` at `10 m` sample spacing across all 6 steep `4 km x 4 km` windows of Section 3.2 plus the `oidong` High Rift steep flank (`95000, 42000`):

| Window | Biome (`terr`) | Baseline (v2) Align (`180/60`, Ringed) | Benches Off | Landforms Off | Erosion `2x` | Macro + Hills Only |
|---|---|---|---|---|---|---|
| `pinnacle`, hyperjungle `(-20000, 34000)` | savage hyperjungle (`0.00`) | `0.542` (`2.06`, `6%`) | `0.542` (`2.06`, `6%`) | `0.542` (`2.06`, `6%`) | **`0.401`** (`1.41`, `9%`) | `0.834` (`2.80`, `16%`) |
| `pinnacle`, NE rim `(36000, -4000)` | ne rim (`0.45`) | `0.117` (`0.78`, `0%`) | `0.104` (`0.78`, `0%`) | `0.117` (`0.78`, `0%`) | `0.130` (`0.74`, `6%`) | `0.502` (`2.65`, `6%`) |
| `pinnacle`, hyperjungle `(-16000, 34000)` | savage hyperjungle (`0.00`) | `0.703` (`1.93`, `9%`) | `0.703` (`1.93`, `9%`) | `0.703` (`1.93`, `9%`) | **`0.511`** (`1.35`, `9%`) | `0.980` (`3.01`, `6%`) |
| `oidong`, Oidong Valley `(-28000, 22000)` | Oidong Valley (`0.00`) | `0.598` (`2.33`, `0%`) | `0.598` (`2.33`, `0%`) | `0.598` (`2.33`, `0%`) | **`0.361`** (`1.62`, `0%`) | `0.840` (`2.84`, `3%`) |
| `oidong`, High Rift `(14000, 34000)` | High Rift (`0.90`) | `0.289` (`0.75`, `34%`) | **`0.125`** (`0.73`, `0%`) | `0.289` (`0.75`, `34%`) | `0.181` (`0.61`, `9%`) | `0.511` (`2.87`, `0%`) |
| `oidong`, High Rift `(6000, 30000)` | High Rift `(0.90)` | `0.411` (`0.84`, `41%`) | **`0.221`** (`0.74`, `0%`) | `0.388` (`0.82`, `47%`) | `0.279` (`0.72`, `22%`) | `0.520` (`2.55`, `0%`) |
| `oidong`, High Rift flank `(95000, 42000)` | High Rift (`0.90`) | `0.703` (`2.39`, `3%`) | `0.703` (`2.39`, `3%`) | `0.702` (`2.39`, `3%`) | **`0.573`** (`2.14`, `3%`) | `0.761` (`2.48`, `9%`) |

### `T1` Diagnosis

1. **Two distinct mechanisms were conflated in the Section 3.2 alignment numbers:**
   - **Smooth curved macro slope breaks (`hyperjungle`, `Oidong Valley`, and major `scarp` flanks where `rel > 4200 m` fades `terr` to `0`):** Benches and `WLAND` landforms contribute **zero** (`0.0000`) to `0.54–0.70` alignment. On an undissected bicubic `2 km` slope break, $G_{60} - G_{540} \approx -\frac{1}{2}(\sigma_{540}^2 - \sigma_{60}^2)\nabla^2 h_{\text{macro}}$, whose gradient points straight upslope/downslope ($\cos^2 \theta = 0.83\text{–}0.98$ on `macro_only`). Stronger cross-contour gully incision (`erode_2x`) immediately pulls alignment down by `0.13–0.24`.
   - **Caprock bench risers (`High Rift`, `terr = 0.90`, `step = 65 m`):** Overall window alignment is already low (`0.289` and `0.411`), **but** `34–41%` of `500 m` tiles are locally ringed (`> 0.65`) and `b60_180` is inflated to `23.9–24.1 m` (`180/60` ratio `0.75–0.84`). Turning `WRELIEF.bench` off eliminates `100%` of ringed tiles (`34% -> 0%`, `41% -> 0%`) and cuts `slope p99` in half (`2.51 -> 1.39`, `3.31 -> 1.70`); doubling erosion depth (`erode_2x`) cuts ringed tiles from `34% -> 9%` and `41% -> 22%`.

---

## Part 2 — Fixed 64 km World-Tile Stream Bake

Files:
- [`core/world/world_tiles.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/world_tiles.py) — Fixed `64 km` (`32 px` at `2 km/px`, `256` cells at `250 m`) world-tile frame, `8 km` (`32`-cell) halo extraction directly from `tools/scale-model/5.1`, and cached global `4096 x 2048` priority-flood + D8 flow accumulation (`global_flow_accumulation_2km`, `sample_global_inflow`).
- [`core/world/bake_streams.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/bake_streams.py) — Added `--world-tiles` (`trace_world_tiles`), seeding halo-border `RW` inflow from the global `2 km` map, clipping traced lines to each tile's `[0, 256)` core by directed step ownership so lines crossing tile seams partition cleanly without loss or duplication, and re-bedding against `WORLD.Hbare` in region local coordinates while keeping legacy v1 `--check` exact until Stage 8.
- [`core/world/test_world_tiles.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/test_world_tiles.py) — Verification suite (`PASS`, `3 checks, 0 failed`):
  1. Legacy `bake_streams.py pinnacle --check`: **`same`** (`375` lines, `0` drift on committed v1 regions).
  2. `bake_streams.py pinnacle --world-tiles`: **`0` downstream bed reversals**, valid monotonic beds across `6` world tiles.
  3. Cross-region seam/origin invariance: two synthetic regions with shifted origins (`[1005, 684]` vs `[1011, 688]`, `12 km` / `4 km` offset) and different crop boxes sharing interior world tile `(31, 21)` (`[1984, 2048] x [1344, 1408] km`) produce **`86` vs `86` interior stream lines agreeing to `0.000000 m`** in world coordinates (`wx, wz, bed`).

---

## Part 3 — `T2` 250 m Drainage Residual (`D`) Experiment

### Architecture Implemented
- **Offline solver ([`core/world/bake_residual.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/bake_residual.py)):**
  - Evaluates authored `h0` (`scarpOf(baseH)`), `wet` (`WHAS` / `wlev.png`, preserving Krator's negative-elevation dry basins such as `Pinnacle` at `-2,600 m`), `scarpW`, `rain`, `rel`, burned-in named river receiver chains (`riverCourse`), settlement pins, and `WLAND` landform footprints on the `320 x 320` (`64 km` core + `8 km` halo each side) `250 m` grid.
  - Reconstructs equilibrium uplift $U = K A_0^{0.45} S_0$ (`m = 0.45, n = 1`) from priority-flood-routed `h0` with global `2 km` boundary inflow `A`, then runs implicit `O(N)` upstream-to-downstream stream-power steps with hillslope creep and `G2km * D` Gaussian projection (`sigma = 8.0` cells = `2,000 m`), re-routing (`priority-flood`, D8 receivers, Kahn topological `A`) every step.
  - Encodes `D` (`[-400, +400] m`, `0.0122 m` step) into `260 x 260` (`256` core + `2`-cell bicubic pad) 16-bit big-endian grayscale PNGs with fixed `zlib` level 9 compression (no timestamps/OS metadata).
- **JS `[G data]` runtime ([`core/world/43d-world-residual.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/43d-world-residual.js)) & [`41-world-fields.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/41-world-fields.js) integration:**
  - World-coordinate Catmull-Rom bicubic sampler `WRESIDUAL.at(x, z, minWave)` and analytic derivative `WRESIDUAL.grad(x, z)` (`0` when uninitialized or outside `coreBox`).
  - Opt-in in [`41-world-fields.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/41-world-fields.js) when `WORLD_DATA.residual` is present: adds `rm * (1 - 0.75 * SC.w) * WRESIDUAL.at(...)` after `scarpOf(baseH)`, attenuates `6 km` & `WMICRO.hills` by `(1 - 0.4 * dw)`, steers gullies along `baseH + D`, and calls `WMICRO.setSkip800(true)` ([`43m-world-micro.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/43m-world-micro.js)) where `D` supplies the `500 m–4 km` forms.
  - Also fixed a latent town-anchor ordering bug in `buildTowns()` ([`41-world-fields.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/41-world-fields.js#L605-L616)) where `o.y0` previously sampled `H()` before `TOWNS` was populated, causing `reliefMask` to read `1.0` instead of `0.0` at town centers.
- **GDScript twin ([`core/world/wresidual.gd`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/wresidual.gd), [`godot/tests/relief/wresidual_test.gd`](file:///home/antigravity/traviso761-debug/vertical-stack/godot/tests/relief/wresidual_test.gd)):**
  - Includes a pure-GDScript 16-bit grayscale PNG `IHDR`+`IDAT` `StreamPeerBuffer` / `decompress_dynamic` Paeth/Sub/Up/Average scanline decoder (bypassing `Image.load`'s lossy 8-bit conversion on `L16` PNGs) and matches JS `WRESIDUAL` to `1.1e-13` / `4.5e-13`.

### Steep-Window Before vs After (`relief.micro = 2`, `10 m` spacing)

Raw data: [`godot/shots/stage2-t2-results.json`](file:///home/antigravity/traviso761-debug/vertical-stack/godot/shots/stage2-t2-results.json)

| Window | Before Bands (`20-60 / 60-180 / 180-540 m`) | After Bands (`+D`) | `180/60` Before -> After | Align Before -> After | Non-Cliff Slope `p99` Before -> After |
|---|---|---|---|---|---|
| `pinnacle`, hyperjungle `(-20000, 34000)` | `4.56 / 13.65 / 28.15` | `4.41 / 15.21 / 33.71` | `2.06 -> 2.22` | `0.542 -> 0.618` | `1.08 -> 0.92` |
| `pinnacle`, NE rim `(36000, -4000)` | `2.98 / 7.35 / 5.72` | `7.80 / 22.59 / 35.47` | **`0.78 -> 1.57`** | `0.117 -> 0.217` | `0.48 -> 1.37` |
| `pinnacle`, hyperjungle `(-16000, 34000)` | `3.32 / 11.45 / 22.13` | `3.45 / 11.26 / 27.38` | `1.93 -> 2.43` | **`0.703 -> 0.528`** | `0.90 -> 0.70` |
| `oidong`, Oidong Valley `(-28000, 22000)` | `5.99 / 21.40 / 49.75` | `6.24 / 23.54 / 52.94` | `2.33 -> 2.25` | **`0.598 -> 0.489`** | `0.91 -> 1.33` |
| `oidong`, High Rift `(14000, 34000)` | `11.33 / 23.88 / 17.81` | `14.67 / 33.35 / 44.83` | **`0.75 -> 1.34`** | **`0.289 -> 0.184`** | `2.48 -> 4.67` |
| `oidong`, High Rift `(6000, 30000)` | `12.21 / 24.10 / 20.18` | `13.43 / 27.51 / 32.61` | **`0.84 -> 1.19`** | **`0.411 -> 0.343`** | `1.79 -> 4.02` |

### Full 12-Gate Acceptance Scorecard (`Section 4 T2`)

| # | Gate | Tolerance | High Rift `(40, 51)` | Pinnacle `(31, 21)` | Extra / Coastal `(29, 22)` | Verdict |
|---:|---|---|---|---|---|---|
| 1 | Macro drift `G2km * D` | `< 0.5 m` rms, `< 3.0 m` max | `0.625 m` rms, `3.629 m` max | `0.439 m` rms, `3.343 m` max | `0.360 m` rms, `2.682 m` max | **FAIL** |
| 2 | Coastline & water bodies | `0` sea cells; contour `<= 1.0` cell | `0` cells; `0.0` shift | `0` cells; `1.414` shift (`1` diag cell on inland lake) | `0` cells; `0.0` shift | **FAIL** |
| 3 | Named rivers | `<= 1` cell shift; `0` downstream climb | `1.0` cell; `0.00000 m` climb | `1.0` cell; `0.00000 m` climb | n/a | **PASS** |
| 4 | Settlement sites | `< 0.3 m` in town band | `0.000000 m` (`5` sites) | `0.000000 m` (`2` sites) | — | **PASS** |
| 5 | Closed basins | `< 0.5%` land, max `<= 1.0 m`, authored kept | `1.036%`, max `0.846 m`, `2/2` kept | `1.832%`, max `0.849 m`, `5/5` kept | `0.461%`, max `0.820 m`, `1/1` kept | **FAIL** |
| 6 | Steep-window alignment | `<= 0.46` on all 6 windows | `0.184, 0.343, 0.489` | `0.217, 0.528, 0.618` | worst `0.6178` | **FAIL** |
| 7 | Band growth `180–540 / 60–180` | `>= 1.50` on High Rift | `1.344` and `1.185` (from `0.75, 0.84`) | `1.570, 2.217, 2.432` | min HR `1.185` | **FAIL** |
| 8 | Slope `p99` outside cliffs | `<= 1.00` | `4.666` (`1.330` in Oidong Valley) | `1.368` (`0.702, 0.920` in jungle) | worst `4.666` | **FAIL** |
| 9 | Junction angles (`250 m` net) | histogram peak `40°–75°` | **`47.5°`** peak (`45.0°` med, `n=1047`) | **`47.5°`** peak (`63.4°` med, `n=1003`) | `47.5°` peak (`n=237`) | **PASS** |
| 10 | `WORLD.H` runtime cost | `<= 5.5 µs` (or `<= +25%` on VM CPU) | `7.88 -> 7.56 µs` (`-4.1%`) | `6.03 -> 6.09 µs` (`+1.0%`) | zero net overhead | **PASS** |
| 11 | Bake speed & determinism | `< 60 s`/tile; byte-identical PNG | **`40.25 s`**, **`89.5 KB`**, SHA-256 exact | **`14.09 s`**, **`100.4 KB`**, SHA-256 exact | `10.19 s`, `32.0 KB` | **PASS** |
| 12 | GDScript `H` twin | `<= 1e-6` across `300` samples | **`1.1e-13`** worst diff | **`4.5e-13`** worst diff | lossless 16-bit PNG decode | **PASS** |

### Why the 6 Geomorphological Gates Failed (Root-Cause Analysis)

1. **Three-way mathematical tension between `G2km * D = 0` (Gate 1), pin masks (Gate 2), and pit breaching (Gate 5):**
   - On open coastal terrain (`coast_29_22`), Gates 1, 2, and 5 **all pass simultaneously** (`0.360 m` RMS / `2.68 m` max, `0.0` contour shift, `0.461%` pits).
   - On tiles dense with pinned corridors (`river_mask`, `scarp_w`, `wet` lakes, `WLAND` landforms, settlements), clamping `D = 0` on narrow corridors after `G2km` projection leaves localized `3.3–3.6 m` `G2km * D` halos alongside incised valleys; iterating the `G2km` projection back onto unpinned cells lifts broad `0.35–0.85 m` sills across low-gradient valley floors (`1.04–1.83%` of land area), and breaching those sills adds positive mass that pushes `G2km * D` back above `0.5 m`.
2. **`250 m` raster Nyquist (`500 m`) vs `60–540 m` alignment (Gate 6):**
   - Bicubic interpolation of a `250 m` raster has Nyquist `500 m` and places almost all its energy at `500–1,500 m`. While `D` cut alignment dramatically on 4 of 6 windows (`0.703 -> 0.528`, `0.598 -> 0.489`, `0.289 -> 0.184`, `0.411 -> 0.343`), turning off `WMICRO`'s `800 m` analytical gully octave (`setSkip800(true)`) removes `400–800 m` cross-slope gullies while `G60 - G540` continues to measure upslope profile curvature on `500–1,500 m` smooth flanks (`0.489–0.618 > 0.46`).
3. **Uncut `WRELIEF.bench` risers on `High Rift` (`steps`, `terr = 0.90`) (Gates 7 & 8):**
   - `D` raised High Rift's `180–540 m` band from `17.8 -> 44.8 m` (`+152%`) and `20.2 -> 32.6 m` (`+62%`), lifting `180/60` growth from `0.75 -> 1.34` and `0.84 -> 1.19` (and NE rim from `0.78 -> 1.57`). However, because `WRELIEF.bench` applies `65 m` step risers *after* `D` without erosion cutting back through those risers, `b60_180` grows in lockstep (`23.9 -> 33.4 m`) and bench risers superposed on `D`'s steeper valley walls drive `slope p99` to `4.02–4.67` (already `1.79–2.48` before `D`).

---

## Recommendation for Stage 8 (All-Builds Rebuild)

Following [`GRAPHICS-TERRAIN-PROPOSAL.md`](file:///home/antigravity/traviso761-debug/vertical-stack/GRAPHICS-TERRAIN-PROPOSAL.md) Section 4 (`T2`, *"If it fails: the pointwise land stays as it is after T0, and T1's answer is applied to the benches alone"*) and Section 11 (Stage 2):

1. **Shelve `D` (`T2`) for the Stage 8 all-builds rebuild:** Do **not** bake `residual.json` into production regions. Keep [`43d-world-residual.js`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/43d-world-residual.js), [`wresidual.gd`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/wresidual.gd), [`bake_residual.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/bake_residual.py), and [`test_residual.py`](file:///home/antigravity/traviso761-debug/vertical-stack/core/world/test_residual.py) in `core/world/` as verified opt-in infrastructure (`0` overhead and `0` behavior change when `WORLD_DATA.residual` is absent).
2. **Ship `WMICRO` v2 (`relief.micro: 2`) + world-tile stream baking (`bake_streams.py --world-tiles`)** in Stage 8 so every region shares exact world-space stream traces (`0.000000 m` seam/origin agreement).
3. **Apply `T1`'s targeted pointwise fix before Stage 8:** Let `WMICRO.erode` cut through `WRELIEF.bench` risers (or attenuate `bench` inside active gully creases `MG[2]`) on `steps` (`High Rift`), and scale `S.gully` slightly on steep macro slope breaks (`|grad(baseH)| > 0.25`) where `T1`'s `erode_2x` test proved alignment drops below `0.45` without a `250 m` raster.
