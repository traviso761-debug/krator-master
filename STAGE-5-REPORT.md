# Stage 5 Report — `M1` Material Packing, Normal Quantisation & `Texture2DArray` Slice (Web + Godot)

**Branch:** `claude/vertical-stack`  
**Spec:** `GRAPHICS-TERRAIN-PROPOSAL.md` Sections 6 (`M1`, `M2`, `M3`), 9.2 (Gates 1, 2, 3), and 11 (Stage 5)  
**Slice Manifest & Assets:** `godot/data/m1_slice/manifest.json` (`7` lit PBR families + `1` alpha cut-out guard at `512 x 512`)

---

## 1. Slice Composition
Seven representative `core/materials/library/` PBR sets + one alpha cut-out guard taken identically through Three.js r128 (WebGL2) and Godot 4.7.2:
1. **3-Layer Ground Set:** `ground_grass` (`ground.grass.lush`), `ground_moss` (`ground.moss001`), `ground_gravel` (`ground.gravel019`)
2. **Hero Planar Masonry & Ashlar Walls (with `M3` 8-step + 1-refinement POM & cavity):** `masonry_wall` (`brick.red`), `ashlar_wall` (`stone.chiselled`)
3. **Steep Faceted Rock:** `cliff_rock` (`rock.granite.tor`, `tilt_p95 = 50.5°`)
4. **Smooth Glazed Curved Surface:** `glazed_ceramic` (`ceramic.celadon.crackle`, `roughness = 0.23`, `tilt_mean = 2.86°` on a 64-segment cylinder)
5. **Alpha Cut-Out Guard:** `cutout_themeda` (`card.grass.themeda` — verifies Gate 1 & `M1` rule that height never overwrites cut-out alpha)

---

## 2. Master Measured Table (`7` Lit `512 x 512` Families Across All 6 Variants)

| Variant | Maps / Arrays | Raw WebP | HTML Page (Inline b64) | WebGL2 VRAM (w/ mips) | Godot RGBA8 / `BPTC` (`BC7`) VRAM | Linked Program Samplers (Ground / Hero) | Web Load `ms` | Godot Load `ms` (`RGBA8` / `BPTC`) | Godot Render Median `ms` *(llvmpipe)* | Gate 2 & Gate 3 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **`v1_three_maps`** *(today's baseline)* | `21` `Texture2D` (`3`/fam: RGB q82 + RGB xy6 lossless + L q85) | **`3,255 KB`** | **`4.85 MB`** | `28.00 MB` | `21.00 MB` / `7.00 MB` | `9` / `3` | `571.5 ms` | `298.1 ms` / `9,881.6 ms` | `1,109.2 ms` | PASS / PASS |
| **`v2_two_maps_xy6`** | `14` `Texture2D` (`2`/fam: `alb+H` RGBA + `xy6+r+cav` lossless) | `5,693 KB` *(+75%)* | `8.02 MB` | **`18.67 MB`** *(-33%)* | `18.67 MB` / **`4.67 MB`** *(-33%)* | `6` / `2` | `369.4 ms` | `137.9 ms` / **`1,564.6 ms`** *(6.3x)* | `1,241.2 ms` *(+POM)* | PASS / PASS |
| **`v2_two_maps_xy8`** | `14` `Texture2D` (`2`/fam: `alb+H` RGBA + `xy8+r+cav` lossless) | `6,891 KB` *(+112%)* | `9.58 MB` | **`18.67 MB`** *(-33%)* | `18.67 MB` / **`4.67 MB`** *(-33%)* | `6` / `2` | `418.4 ms` | `151.0 ms` / **`1,573.4 ms`** *(6.3x)* | `1,241.0 ms` *(+POM)* | PASS / PASS |
| **`v2_two_maps_oct8`** | `14` `Texture2D` (`2`/fam: `alb+H` RGBA + `hemi-oct8+r+cav` lossless) | `6,872 KB` *(+111%)* | `9.56 MB` | **`18.67 MB`** *(-33%)* | `18.67 MB` / **`4.67 MB`** *(-33%)* | `6` / `2` | `438.0 ms` | `152.7 ms` / **`1,538.4 ms`** *(6.4x)* | `1,238.3 ms` *(+POM)* | PASS / PASS |
| **`v3_arrays_three_maps`** | **`3` `Texture2DArray`** (`7` layers: `alb`, `nor`, `rgh`) | **`3,255 KB`** | **`4.85 MB`** | `28.00 MB` | `28.00 MB` / `7.00 MB` | **`3` / `3`** | `441.3 ms` | `148.0 ms` / `1,920 ms`* | `935.0 ms` *(-16%)* | PASS / PASS |
| **`v4_arrays_two_maps`** *(`hemi-oct8`)* | **`2` `Texture2DArray`** (`7` layers: `alb+H`, `nrc`) | `6,872 KB` | `9.56 MB` | **`18.67 MB`** *(-33%)* | **`18.67 MB`** / **`4.67 MB`** *(-33%)* | **`2` / `2`** | `415.3 ms` | `171.1 ms` / **`1,545 ms`** | **`819.0 ms`** *(-26%)* | PASS / PASS |

---

## 3. Normal Quantisation & Glazed Curved Specular Banding (`xy6` vs `xy8` vs `hemi-oct8`)

Note: Full-sphere octahedral wastes 50% of `[0..255]^2` on `n.z < 0` (`mean = 0.356°`, `max = 0.911°`). Switching `oct8` to **Cigolle et al. (JCGT 2014, Sec. 3.2) Hemisphere Octahedral (`hemi-oct8`)** maps `n.z >= 0` onto 100% of `[0..255]^2` with a branchless 3-instruction decode:

| Surface | Encoding | Unique Normals (`512x512`) | Mean Angular Err | `p95` Err | `p99` Err | Max Err | Curved Grazing Specular `RMSE` | Curved Specular `p99` Step |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| **`glazed_ceramic`** *(smooth curved, `rough=0.23`)* | `xy6` *(today)* | `623` | `0.728°` | `1.269°` | `1.285°` | `1.616°` | `1.3180` *(visible bands)* | `4.6867` |
| **`glazed_ceramic`** | `xy8` | `4,272` | `0.018°` | `0.073°` | `0.172°` | `0.328°` | `0.1229` *(smooth)* | `0.1625` |
| **`glazed_ceramic`** | `oct8` *(`hemi-oct8`)* | **`4,645`** | `0.179°` | `0.227°` | `0.243°` | `0.422°` | `0.2648` *(smooth)* | `0.7665` |
| **`cliff_rock`** *(steep facets, `tilt_p95=50.5°`)* | `xy6` *(today)* | `2,639` | `0.786°` | `1.344°` | `1.607°` | `3.475°` | `0.0032` | `0.0078` |
| **`cliff_rock`** | `xy8` | `34,155` | `0.167°` | `0.292°` | `0.346°` | `0.722°` | `0.0007` | `0.0017` |
| **`cliff_rock`** | `oct8` *(`hemi-oct8`)* | `27,394` | `0.208°` | `0.376°` | `0.440°` | **`0.550°`** | `0.0009` | `0.0022` |

---

## 4. Key Findings & Packing Recommendation for Owner Decision

1. **Why G's 2-map packing doubles WebP download bytes (`3.26 MB -> 5.69–6.87 MB`) while cutting GPU VRAM by `-33.3%` (`28.0 -> 18.7 MB` RGBA8, `7.0 -> 4.7 MB` `BC7`):**
   - In `v1`, `albedo` (`q82` RGB) and `roughness` (`q85` greyscale, `12–24 KB`/map) are lossy WebPs, and only the 6-bit 2-channel `normal` is lossless WebP.
   - Folding `roughness + cavity` into the lossless RGBA `nrc.webp` (`v2`/`v4`) forces lossless LZ77 compression over 4 uncorrelated high-frequency channels, adding `+340–510 KB` per material (`+75%` at `xy6`, `+111%` at `xy8`/`oct8`). On self-contained single-file HTML builds without sidecar `.tex.js` splits, that threatens the `16 MB` page cap!
   - Conversely, on the GPU (and in Godot `BPTC`/`BC7` where every RGBA texture compresses to `1 byte/px` regardless of WebP size!), 2-map packing cuts **VRAM by `-33.3%`**, cuts **Godot load & BC7 compression count by `-33.3%` (`298 ms -> 152 ms`)**, and in **`v4_arrays_two_maps`** cuts **Godot render time by `-26.2%`** while needing **only `2` fragment samplers** for multi-layer ground + hero POM + cavity + `mipVariance` specular AA!
2. **Recommended Split for Stage 8 (matching Section 12 "Godot is where it should look best"):**
   - **Godot exports (`world.json` / `packFormat: 2`):** Adopt **`v4_arrays_two_maps` (`hemi-oct8`)** for multi-layer ground/town atlases and **`v2_two_maps_oct8`** (`library.gdshader` `use_nrc = true`, `normal_enc = 1`, `mipVariance` in `pack.json`) for standalone kits (`-33%` `BC7` VRAM, `2` samplers, zero glazed banding, planar POM + concave cavity ready).
   - **Web builds (`16 MB` HTML cap):** Keep **`v1` 3-map WebP** on inline HTML pages (preserving the `3.26 MB` byte footprint!), upgrade smooth/glazed families (`specular >= 0.45`, `roughness < 0.35`) selectively to `8-bit` normals, and assemble **`v3_arrays_three_maps`** at runtime (`ISLE_ATLAS` pattern) where sampler counts approach `15`.

---

## 5. Automated Verification
- `node core/materials/record/test-m1.js` & `node core/materials/record/test-record.js` — **all passed**
- `tools/textures/m1_slice.py --web` — **6 WebGL2 variants verified (`0` errors, Gate 1 + Gate 2 + Gate 3 all green)**
- `godot --headless --path godot --script res://tests/materials/m1_slice_test.gd` — **`12/12` passed** (`13/13` in OpenGL 4.5 with GPU Gate 3 Handedness Probe)
- `python3 tools/check_port.py core` & `python3 tools/check_source.py core/materials` — **clean (`0` over baseline)**
