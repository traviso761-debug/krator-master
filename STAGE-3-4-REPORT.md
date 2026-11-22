# Stages 3 & 4 Report — Open-World Lighting, Far Horizon Shadows, Hex-Tiled Ground & 3D Grass Sward

**Branch:** `claude/vertical-stack`  
**Spec:** `GRAPHICS-TERRAIN-PROPOSAL.md` Sections 5, 11 (Stages 3 & 4), and 12 (Owner's engine split)  
**Target Region:** `openworld/oidong-highrift` (`godot/data/world-oidong-highrift`) + all 7 `openworld/*` web builds

---

## 1. Stage 3 — Open-World Lighting, `40 km` Horizon Shadows & Hourly Atmosphere (`S1` + `S2` + `S5`)

### 1.1 Shared Regional `40 km` Horizon & Sky-Visibility Bake (`S1`)
- **Tool:** `core/world/bake_horizon.py`
- **Output:** `godot/data/world-oidong-highrift/horizon/horizon.json` + `tex/horizon0.webp` + `tex/horizon1.webp` (linked via `index.json["horizon"]` and validated by `tools/check_godot_exports.py`).
- **Grid & Reach:** `4,673 x 705` texels at `250 m` step across `[-1,168,000 .. 0] x [-176,000 .. 0]`, marching 8 compass azimuths (`+X, +X+Z, +Z, -X+Z, -X, -X-Z, -Z, +X-Z`) out to **`40,000 m`** (`max_tan = 4.0`, sqrt-tangent encoded `sqrt(clamp(tan, 0, 4) / 4)` in 2 lossless RGBA8 WebPs).
- **Measured Footprint & Values:**
  - Disk: **`8.61 MB`** lossless WebP (`4.29 MB` + `4.32 MB`).
  - Uncompressed RGBA8 VRAM (`S1`): **`25.14 MB`**.
  - Dozier & Frew (1990) sky-view factor `V = 1 - mean(sin^2(theta_k))`: minimum **`0.167`** in deep Strongbow / Oidong gorges, mean **`0.916`** across plateaus.

### 1.2 Godot Native `S1` + `S5` Lighting (`khorizon.gdshaderinc`, `terrain.gdshader`, `sky.gd`)
- **Shader Globals (`godot/project.godot`):** `khz_tex0`, `khz_tex1`, `khz_box`, `khz_params`, `kgd_albedo_arr`, `kgd_nr_arr`, `kgd_params`.
- **Horizon & Cloud Shadowing (`godot/shaders/lib/khorizon.gdshaderinc` + `godot/shaders/atmos_cloudshade.gdshaderinc`):**
  - Constant-angle `1.55°` solar penumbra (`khz_sun_shadow`) interpolated across the two bracketing azimuth channels.
  - Drifting `core/atmos` cloud shadows (`atmCloudShade`) multiplied with `khz_sun_shadow` in `void light()` exclusively on the primary solar `DirectionalLight3D` (matched in view space via `dot(LIGHT, (VIEW_MATRIX * vec4(atm_sun_dir, 0.0)).xyz) > 0.70`, leaving secondary planetshine unoccluded).
  - Dozier–Frew `sky_vis` ambient modulation + warm canyon ground-bounce term `(1 - sky_vis) * max(sun_dir.y, 0) * 0.22 * ALBEDO`.
- **Hourly Sky & Fog (`godot/krator/sky.gd`):** Pushes `atm_sun_dir`, `atm_hour`, `atm_cloud`, `atm_cloud_lo`, `atm_cloud_dir`, `atm_time`, `atm_wet`, and hourly `env.fog_sun_scatter`.

### 1.3 Web Stage 3 (`core/world/*` + All 7 `openworld/*` Builds)
- **`KHORIZON` (`S1`):** `core/world/81-world-terrain.js` builds a regional `1,024` grid (`32 km` reach) via `KHORIZON.build` and binds `KHORIZON.patchMaterial` onto the open-world ground material.
- **`KSHADOW` (`S2`):** `core/world/45-world-host.js` enables `KSHADOW.create` (`shadowMap = 4096`, `radius = 220 m`, `maxSpan = 560 m`) by default (`?shadow=0` opts out), fitted per frame in `45-world-host.js` and updated on terrain, near trees (`85-world-flora.js`), town meshes (`88-world-towns.js`), and site meshes (`88s-world-sites.js`).
- **Hourly Dome & Fog (`S5`):** `core/world/80-world-sky.js` and `45-world-host.js` progress sky zenith/horizon/ground dome tints, directional & hemisphere light colors, background color, and distance fog continuously with `WORLD.clock.hour`.
- **Rebuilt & Verified Pages:** `oidong-highrift`, `pinnacle`, `isle-demo`, `iziz-cluster`, `xanadu-lake-shore`, `xanadu-north-shore`, `xanadu-oidong-highrift` (`check_budgets.py`, `check_core_use.py`, `check_assembly.py openworld` all green).

---

## 2. Stage 4 — Godot Ground Surface & Legible 3D Grass Overhaul (`S3` + `S4` + `KratorWorldGrass`)

### 2.1 `S3` Sub-Grid Chunk Normal & Crease Textures (`godot/krator/kdata.gd`)
- Every streamed `64 m` world chunk (`251 x 251` vertices) synthesizes a `2x` denser **`501 x 501` (`32 m` texel)** normal-and-crease map (`Image.resize(..., INTERPOLATE_CUBIC)` + trig-free downslope V-rill etching on steep rock faces `rk > 0.16`) inside the existing background chunk builder (`KData._build_s3_subgrid_nc`), bound via `nc_dims = (501, 501)`.
- **Measured `S3` Cost (2-vCPU VM, `route_harness.gd`):**
  - Mean build time per `16 km x 16 km` chunk: **`78.4 – 95.0 ms`** (`980.1 KB` RGBA8 per chunk; `3.82 – 7.66 MB` total across `4 – 8` active chunks).

### 2.2 `S4` Hex-Tiled PBR Ground `Texture2DArray` (`godot/krator/kground_layers.gd`, `godot/shaders/terrain.gdshader`)
- **Packer:** `godot/tools/pack_ground_layers.py` packs 6 seamless `512 x 512` PBR ground layers from `tools/textures/library/` into `godot/data/ground_layers/`:
  - `0: grass_lush` (`2.6 m`), `1: moss_forest` (`2.2 m`), `2: turf_native` (`3.0 m`), `3: gravel_scree` (`2.4 m`), `4: rock_granite` (`6.5 m`), `5: paving_flag` (`2.8 m`), plus edge-dilated `card_themeda.albedo.webp` (`4.34 MB` total mipmapped VRAM).
- **Shader (`terrain.gdshader`):** Implements Mikkelsen (2022) Real-Time Hex-Tiling (`sample_hex_layer`) with uniform-flow screen-space `dFdx`/`dFdy` (`textureGrad`), `kcolour.gdshaderinc` (`k_tex`) sRGB/linear normalization, distance fade (`0.5 .. 220 m`), and rotated `Monastery/Terrain` (`case_ry`) `pave_zone_tex` zone painting (meadow, kora gravel path, ward gravel terraces, granite cliffs, and flagstone courts/avenue).

### 2.3 Dense Legible 3D Grass Sward (`godot/krator/world_grass.gd`, `godot/shaders/grass_sward.gdshader`)
- **`KratorWorldGrass` (`StreamGrass`):** Camera-centered MultiMesh 3D grass sward built on `tri_height_at` and root-matched to `albedo_rock_tex` via `INSTANCE_CUSTOM`:
  - `GrassNear` (`0 .. 34 m`, `0.44 m` jittered grid, 12-blade curved 3-segment clumps, `0.24 m` ground spread).
  - `GrassMid` (`31 .. 84 m`, `1.18 m` jittered grid, 6-blade curved 2-segment clumps, `0.34 m` ground spread).
  - `GrassPlume` (`0 .. 46 m`, `1.85 m` jittered grid, crossed golden flowering `Themeda` seed heads).
- **Masking & Grounding:** Masked off water (`wet >= 0.62`), steep cliffs (`slope >= 0.34`, `rock >= 0.72`), `RoadRibbon` corridors, building footprints (`_is_clear_for_undergrowth`), paved courts (`pave >= 0.55`), and indoor/subterranean chambers; grounded to **`0.00012 m` (`0.12 mm`)** against `tri_height_at`.

---

## 3. Measured Route Benchmark (`godot/tests/perf/route_harness.gd`, 4 Stops x 3 Hours)

| Stop | Chunks | `S3` Mean / Chunk | `S3` Total | `S4` Arrays | `S1` Horizon | `GrassNear` / `Mid` / `Plume` | Plant-to-Ground `p95` / `worst` |
|---|---:|---:|---:|---:|---:|---:|---:|
| `city_block` (Longsong street) | 7 | `92.0 ms` | `6.70 MB` | `4.34 MB` | `25.14 MB` | `418` / `1,775` / `10` | `0.044 m` / `0.159 m` |
| `forest_edge` (Oidong Valley) | 4 | `82.8 ms` | `3.82 MB` | `4.34 MB` | `25.14 MB` | `4,912` / `3,501` / `97` | `0.250 m` / `0.250 m` *(was `3.84 m` in Stage 1)* |
| `door_transition` (Gatehouse) | 7 | `95.0 ms` | `6.70 MB` | `4.34 MB` | `25.14 MB` | `0` *(paved)* / `947` / `0` | `0.026 m` / `0.048 m` |
| `water_ground` (Strongbow canyon) | 8 | `78.4 ms` | `7.66 MB` | `4.34 MB` | `25.14 MB` | `2,246` / `5,762` / `75` | `0.040 m` / `0.195 m` |

---

## 4. Verification Summary
- `node core/shadow/test-shadow.js` & `node core/terrain/test-horizon.js` — **pass**
- `python3 tools/check_godot_exports.py` — **`13 case(s) clean`**
- `python3 tools/check_budgets.py`, `tools/check_core_use.py`, `tools/check_assembly.py openworld` — **all pass (`0` over baseline)**
- `godot --headless --path godot --script res://tests/terrain/stage34_test.gd` — **`19/19` passed**
- `godot --headless --path godot --script res://tests/export/oidong_world_test.gd` — **`29/29` passed**
- `godot --headless --path godot --script res://tests/export/conversion_audit_test.gd` — **`22/22` passed**
