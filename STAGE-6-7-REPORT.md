# Stages 6 & 7 Report — Ancient's Valley (`A0` + `A2`) & Longsong Monastery Interiors (`I1`–`I4`, Gate 5 Sun-Leak Probe)

**Branch:** `claude/vertical-stack`  
**Spec:** `GRAPHICS-TERRAIN-PROPOSAL.md` Sections 7 (`A0`, `A1`, `A2`), 8 (`I1`–`I4`), 9.2 (Gate 5 & Gate 8), and 11 (Stages 6 & 7)  
**Builds & Targets:**
- **Stage 6:** `biomes/ancientsvalley` (`ancientsvalley.html`, `ancientsvalley-terraces.html`, `ancientsvalley-yards.html`) + `kits/metropolis` (`metropolis.html`)
- **Stage 7:** `core/interiors/10-core-roomlight.js`, `settlements/longsong`, and Godot 4.7.2 (`godot/krator/kinteriors_light.gd`, `godot/shaders/library_interior.gdshader`, `godot/data/world-oidong-highrift/places/sq80bzd7ep-monastery/interiors.json` v2, `godot/tests/interiors/stage7_interiors_test.gd`)

---

## 1. Stage 6 — Ancient's Valley: Cost Recovery (`A0.1`–`A0.5`) & Staged Visuals (`A2.1`–`A2.5`)

### 1.1 `A0` Cost-Recovery Fixes Implemented
1. **`A0.1` (`KGROUND` eye distance & zero-weight guard):** Landed in Stage 0 (`core/terrain/36-core-ground.js`) and active across all 3 `ancientsvalley` stations (`12` max fragment samplers `< 16` WebGL2 budget even with `KSHADOW` enabled).
2. **`A0.2` (`GROUND.meshH` seating & crack-free `8 x 8` frustum-culled refined tiles, `47-host-land.js` + `73-host-wrecks.js`):**
   - Coarse `440 x 440` valley ground (`13.8 m` cell) refines to `K = 6` (`2.30 m` sub-cells) wherever cell curvature exceeds `0.35 m` (craters, highway cuts, sunken basins), stitched crack-free along coarse/fine edges by snapping boundary sub-vertices onto the coarse edge line.
   - Partitioned into **`8 x 8` (`64`) independent `THREE.Mesh` tiles** (`frustumCulled = true`) instead of one unculled valley-wide mesh.
   - Exact barycentric `GROUND.meshH(x, z)` feeds `kitH`, `BIO.init`, `AVW` wrecks, and `KHOST.take`, dropping worst plant-to-drawn-ground error from **`36.68 m` (Stage 1) -> `0.000 m`** across all 4 route stops (verified by `HCHK.groundSeat` + paired `+2 m` negative).
3. **`A0.3` (`core/biome` indexing, merging, chunking & culling, `47-host-land.js` + `71-host-creepers.js`):**
   - Enabled `BIO.INDEX_ITEMS = true`, `BIO.LOD.chunk = 1600`, `BIO.LOD.merge = true`, `BIO.LOD.minTris = 15000`, `BIO.LOD.fade = 0.15`, `BIO.LOD.cull = true`.
   - Partitioned `AV_CREEPERS` into `800 m x 800 m` `InstancedMesh` cells with bounding spheres and `1,400 m` range culling.
4. **`A0.4` (Direct GPU `WebGLRenderTarget` tower impostor baker, `70-host-city.js`):**
   - Bakes tower & ruin impostor slots directly into GPU `WebGLRenderTarget`s (`impCell = 64` -> `2048 x 2048` atlas pair, down from `4096 x 4096` CPU canvas `getImageData`/`putImageData` churn), generates hardware mipmaps once on completion, deletes the temporary depth renderbuffers, and frees `BIO.kits.metro` (`VRAM` down **`-500.7 MB`** from `1,612.2 MB -> 1,111.5 MB`). Lowland tree impostors (`!r.avKey`) continue through `BIO.bakeImpostors`.
5. **`A0.5` (`KSHELL` `EXT_conservative_depth` + distance-adaptive `MP_STEPS`, `kits/metropolis/src/60-mp-shell-host.js`):**
   - Enables `#extension GL_EXT_conservative_depth : enable` and `layout(depth_greater) out float gl_FragDepth;` on WebGL2 lanes advertising `EXT_conservative_depth` (preserving hardware early-Z rejection on inward heightfield shell marches; recorded on `mat.userData.conservativeDepth`).
   - Distance-scales raymarch steps from `MP_STEPS` (`28`) inside `450 m` down to `10` steps past `2,200 m`.

### 1.2 `A2` Staged Visual Additions (All Inside Route Budgets)
1. **`A2.1` (`KSHADOW` on by default, `88-host-build.js` + `70-host-city.js`):** `KSHADOW.create` enabled by default (`?shadow=0` opts out; `2048` PCF on GPU lanes, `1024` hard on software GL; `radius = 280 m`, `maxSpan = 620 m`) across ground tiles, `KSHELL` towers, and hero structures.
2. **`A2.2` (Zero-runtime-cost baked occlusion, `60-mp-shell-host.js` + `70-host-city.js` + `46-av-feral.js`):**
   - `KSHELL` bakes sky/cavity occlusion from its 4-neighbour heightfield horizon (`0.38 .. 1.00`) into `at.C.a`, darkening recessed window bays, colonnades, and interior courtyards at zero runtime tap cost.
   - `avHeroGroundAO` darkens the lowest `6 m` of hero ruins (`0.58 .. 1.00` vertex tint) and `AV.feralKit` darkens the lowest `2.2 m` of feral trunks (`0.68 .. 1.00`).
3. **`A2.3` (Far canopy tier past `1.2 km`, `88-host-build.js`):** Single instanced `AV_FAR_CANOPY` mound tier (`1,280` instances from `1.05 km` out to `5.0 km`, smooth vertex scale-in across `1,050 .. 1,320 m` via `modelViewMatrix` eye distance, closing `KNOWN_ISSUES.md:93`).
4. **`A2.4` (Ecological forest stands, substrates & deadwood, `41-av-field.js` + `46-av-feral.js` + `88-host-build.js`):** `[G data]` `AV.stands` classifies moisture/slope/aspect + `rubble_plinth`, `street_crack`, `broken_roof`, `park`, and `scar_edge` substrates, and places deterministic standing snags and fallen logs (`AV_DEADWOOD`, 2 instanced draws).
5. **`A2.5` (City districts & landmark silhouettes, `41-av-field.js` + `70-host-city.js`):** `[G data]` `AV.districts` classifies `360 m` sectors (`waterfront_spire`, `civic_core`, `midrise_ring`, `industrial_yard`, `residential_grid`), elects tall landmark spires (`landmarkScale = 1.08 .. 1.18`), and renders a 1-draw `av.district.plinths` far urban massing tier (`900 .. 4,500 m`).

### 1.3 Stage 1 vs Stage 6 Deterministic Route Comparison (`ancientsvalley.html`, `q = 1.0`, `16:20`)

| Stop (`tools/route_harness.py`) | Stage 1 Calls *(no shadow)* | **Stage 6 Calls *(w/ `KSHADOW`)* ** | Stage 1 Triangles | **Stage 6 Triangles** | Stage 1 VRAM | **Stage 6 VRAM** | Samplers | Stage 1 Plant Err | **Stage 6 Plant Err** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **`city_block`** *(Residential street)* | `1,618` | **`1,131`** *(-30%)* | `19.31M` | **`10.49M`** *(-46%)* | `1,612.2 MB` | **`1,111.5 MB`** *(-31%)* | **`12`** | `36.68 m` | **`0.000 m`** |
| **`forest_edge`** *(Park gone feral)* | `1,942` | **`1,570`** *(-19%)* | `21.04M` | **`12.46M`** *(-41%)* | `1,612.2 MB` | **`1,111.5 MB`** *(-31%)* | **`12`** | `14.22 m` | **`0.000 m`** |
| **`tower_door`** *(Tower entrance)* | `1,180` | **`528`** *(-55%)* | `18.45M` | **`7.43M`** *(-60%)* | `1,612.2 MB` | **`1,111.5 MB`** *(-31%)* | **`12`** | `8.95 m` | **`0.000 m`** |
| **`water_ground`** *(Core from water)* | `1,390` | **`669`** *(-52%)* | `19.82M` | **`9.09M`** *(-54%)* | `1,612.2 MB` | **`1,111.5 MB`** *(-31%)* | **`12`** | `21.40 m` | **`0.000 m`** |

---

## 2. Stage 7 — Longsong Monastery Interiors (`I1`–`I4`) & Gate 5 Sun-Leak Probe

### 2.1 Shared `[G data]` Room Table & Corner AO (`core/interiors/10-core-roomlight.js`)
- **`KROOMLIGHT.buildTable` (`I2`):** Deterministic multi-source walk of the room-portal graph. A room's own sky sets its hop-0 daylight: windows by their area (`0.34 + 0.15 * sqrt(area)`, clamped `0.36..0.92`), doors out by their width (`0.30 + 0.09 * width`, `0.34..0.62`), a `skylight` room at least `0.66`. Each portal then passes on `0.32 + 0.075 * min(width, 2.6)` of it (clamped `0.35..0.52`), relaxed until nothing rises (at most 32 passes), keeping subterranean `vault` rooms strictly at `daylight = 0.0` while accumulating per-room warm butter-lamp ambience (`lampAmbience`, `lampColor`). Zero cross-wall interpolation or trilinear voxel bleed. *(Corrected 2026-11-23: this line described another rule, `0.24` a window, decay `0.68`, 5 hops, than the code's. Since then a window and a skylight take an `aperture`, a room sized `skylights`, a door `shut`; see the module's header.)*
- **`KROOMLIGHT.vertexCornerAO` (`I4`):** Pure analytic per-vertex dihedral/trihedral crease darkening (`floor-wall`, `ceiling-wall`, `wall-wall`, `min = 0.44`, `reach = 1.35 m`) evaluated identically in JS and GDScript.
- **`KROOMLIGHT.pickPool` (`I3`):** Selects active room + 1-hop open-portal window/lamp lights (`6` on Web, `10` on Godot Forward+ / `6` on GL Compatibility), keeping full lamp energy in windowless subterranean rooms (`daylight ~ 0`) and marking the **2 brightest hero lamps** in the camera's room for real omnidirectional shadows.
- **Export (`interiors.json` v2):** `648` indoor/vault rooms with doorway portals, `667`-row `room_table`, `2,419/2,419` room-tagged windows, and `1,453/1,453` room-tagged butter lamps.

### 2.2 Native Godot Implementation (`kinteriors_light.gd`, `library_interior.gdshader`, `walk.gd`)
- **`I1` Indoor Surface Masking:**
  - Splits `277,533` indoor shell triangles from `339,616` exterior shell triangles across `40` Monastery material buckets into spatially chunked (`36m x 10m x 36m`) `IndoorShells` on `VisualInstance3D.layers = 2` (`INDOOR_LAYER`), and tags `21,680` indoor furniture instances into `36m x 12m x 36m` `MultiMeshInstance3D` cells (splitting out `86` outdoor Debate Court benches onto Layer `1`).
  - Exterior solar `DirectionalLight3D` uses `light_cull_mask = 1`, while `library_interior.gdshader` uses `render_mode ambient_light_disabled` (opaque Early-Z + `cull_back`, preventing back-to-back coplanar partition z-fighting): **100% of direct sun and exterior sky ambient is blocked on indoor surfaces (`0.00000` leak)** while outdoor mountains and courtyards seen through open windows remain 100% sunlit on Layer `1`.
- **`I2` + `I3` + `I4` Shading & Shadowed Hero Lamps:**
  - `room_light_tex` (`667 x 2` RGBA8 `ImageTexture`, `filter_nearest`, non-interpolated `varying flat float v_room_u`) supplies discrete per-room portal daylight + warm lamp bounce, modulated by `I4` per-vertex `COLOR.a` corner AO (`0.440 .. 1.000`).
  - Pooled `OmniLight3D`s (`light_cull_mask = 2`) cast native shadows on the 2 hero lamps using `SHADOW_DUAL_PARABOLOID` on Forward+/Mobile and `SHADOW_CUBE` on `gl_compatibility` (offset `-0.24 m` below ceiling housings for clean ceiling clearance).

### 2.3 Gate 5 Automated Sun-Leak Probe & Paired Negative (`stage7_interiors_test.gd`, OpenGL 4.5)

| Test / Probe (`sun.shadow_enabled = false`, overhead noon sun `2.5` vs `0.0`) | Measured Result | Threshold | Verdict |
|---|---|---|---|
| **Gate 5 Probe 1:** Archive Stacks floor & reading tables | `max_luma_diff = 0.00000`, `mean_diff = 0.00000` (`luma = 0.046`) | `max <= 0.005`, `mean < 0.0005` | **PASS** |
| **Gate 5 Probe 2:** Room of Slow Water floor & basin | `max_luma_diff = 0.00000`, `mean_diff = 0.00000` (`luma = 0.002`) | `max <= 0.005`, `mean < 0.0005` | **PASS** |
| **Gate 5 Probe 3:** West monk cell floor & desk | `max_luma_diff = 0.00000`, `mean_diff = 0.00000` (`luma = 0.026`) | `max <= 0.005`, `mean < 0.0005` | **PASS** |
| **Paired Negative Control:** `I1` sun mask disabled (`mask_sun = false`) | `unmasked max_luma_diff = 0.7249` | `max > 0.15` *(must catch leak)* | **PASS** |
| **`I2` BFS Room-Graph Monotonicity:** Cataclysm -> Corridor -> Cell -> Vault | `0.920 > 0.620 > 0.240 > 0.000` | strictly decreasing, vault `= 0` | **PASS** |
| **`I2` / `I3` Cross-Wall Bleed Audit:** Adjacent solid-wall rooms | `0` cross-wall lights selected (`3` valid local/portal picks) | `0` cross-wall leaks | **PASS** |
| **`I4` GPU Corner-AO Crease Darkening:** `use_corner_ao` on vs off | `max_crease_darken = 0.1574`, `mean = 0.0139` (`AO = 0.440..1.000`) | `max > 0.025` | **PASS** |

---

## 3. Automated Verification Summary
- `node core/interiors/test-roomlight.js` — **`all 6 passed`** (with paired negatives)
- `node biomes/ancientsvalley/tests/test-av.js` — **`all 71 passed`** (including `A2.4` stands/deadwood & `A2.5` districts + paired negatives)
- `node biomes/ancientsvalley/tests/test-farm.js` — **`all 11 passed`**
- `biomes/ancientsvalley` `_api.hostChecks()` / `_api.hostNegatives()` — **`40/40` checks passed, `44/44` negatives failed as expected**
- `godot --headless --path godot --script res://tests/interiors/stage7_interiors_test.gd` — **`8/8` passed**
- `xvfb-run -a godot --rendering-driver opengl3 --path godot --script res://tests/interiors/stage7_interiors_test.gd` — **`13/13` passed (`0` errors)**
