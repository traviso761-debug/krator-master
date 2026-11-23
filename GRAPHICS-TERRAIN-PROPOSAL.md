# Krator terrain and graphics: a unified proposal

**Written:** 2026-11-17, on `claude/exciting-curie-1c0022` (427ce3115). **Status:** a proposal; no code changed for it.
The owner answered its three questions the same day (section 12): Godot is where it should look best, the stream bake
may move to world tiles, and the relief is re-baked with the all-builds rebuild.

It reconciles three inputs:
- **G**: the consolidated "Graphics, Terrain Relief & Surface Overhaul" proposal (Gemini's audit and all-builds overhaul);
- **C**: ChatGPT's reconciliation of it against the worktrees;
- **this pass**: a read of the code in three worktrees (this one, `ancientsvalley-7f521c`, `cool-tereshkova-d594e8`), new
  measurements, and a literature check.

Each claim below is marked **measured** (run in this pass), **read** (seen in the source or its docs, with the file) or
**assumed** (not checked). Section 10 is the decision list.

## 1. The short version

1. **Fix what is measurably wrong before adding anything.** Two of G's three WMICRO bugs are real, and one is large: the
   erosion sinks the land by about 23 % of its own amplitude (7 m on a 20 % slope). Ancient's Valley's ground shader reads
   its texture distance from the wrong point and fetches 49 texels a pixel. Plants stand on a ground the page does not
   draw. These cost little and each one shows.
2. **The terrain has two different faults, and they need different cures.**
   - Gentle country lacks relief. The hills on a floor answer that, and the answer is modest by design.
   - Steep country has the relief (25 to 43 m in the 180-540 m band, inside the real DEMs' range) but it runs along the
     contours, not down the slope: alignment 0.55 to 0.73 where a DEM reads 0.17 to 0.46.

   What is missing in both is the **valley network between 250 m and 4 km**. Pointwise noise cannot make one; a bake can.
3. **Do the 250 m bake as a residual, not a replacement.** A signed raster added to the authored land, whose 2 km low-pass
   is zero by construction. The authored map never moves. It is an experiment with stated acceptance numbers (section 4).
4. **Light the open world with what the repo already has.** The open-world ground uses none of the shared modules: no
   `KHORIZON`, no `KSHADOW`, no `KGROUND`, no core/atmos sky. Taking them is cheaper and safer than G's new systems, and
   `KHORIZON` already is the horizon-angle bake C asks for.
5. **Split the work by engine.** Terrain shape, baked horizon data, material records and room data are shared. Lights,
   shadows, global illumination, ambient occlusion, fog and tone mapping are Godot's own; the web page gets the cheap
   version. `GODOT-PLAN.md` already says so (`[G native]`: "port nothing; do not improve it further in three.js").
6. **Ancient's Valley has no headroom.** 6 to 9 million triangles a frame, up to 1,176 draw calls against a ceiling of
   1,200, 48 to 90 ms a frame on the Arc at 2880 x 1620, 3.85 of Chrome's 4.19 GB heap. G's "+1.35 to 1.60 ms, 60 fps
   preserved" has no basis there. Its track starts by getting cost back.
7. **Vertical slices, then decide.** No all-builds rebuild until one terrain slice, one surface slice and one Ancient's
   Valley route have numbers on both GPU lanes and in Godot.

## 2. What the code is today

### 2.1 Open world (this worktree)

| Fact | Source |
|---|---|
| Ground: a quadtree of 64 x 64 chunks, finest 128 m with 2 m between vertices; `MeshLambertMaterial`, vertex colours; per-vertex normals from the height grid; skirts, no geomorphing | read, `core/world/81-world-terrain.js:4-81` |
| Ground textures: one 256 px noise canvas at 4 scales, plus the strata shader's 3 samplers. 4 samplers in all. No `KGROUND` | read, `81:15-38`, `core/terrain/host/35-core-strata-shade.js` |
| No shadows of any kind | read, `45-world-host.js:3` |
| ACES tone mapping, sRGB out, pixel ratio capped at 1.5, logarithmic depth | read, `45:18-20` |
| The sun follows the clock; the sky dome's colours and the fog's colour do not | read, `80-world-sky.js`, `45:23` |
| Flora reads the analytic `WORLD.H`, not the drawn mesh (`TERRAIN.heightDrawn` exists; flora does not call it) | read, `85-world-flora.js:11,74`, `81:129` |
| Chunks are built on the main thread in a time-budgeted queue | read, `81:123` |
| **Bug:** the gas giant's ring is built and never added to the scene: a trailing `//` comment swallows the line | read, `80-world-sky.js:79` (older than this branch's work) |
| The stream bake samples a 250 m grid per region and writes stream records only. It writes no elevation | read, `core/world/bake_streams.py:24,67-93` |

### 2.2 Shared modules the open world does not take

| Module | What it already does | Source |
|---|---|---|
| `KHORIZON` | per heightfield texel, the horizon's elevation in 8 azimuths (two RGBA8 textures) and a sky-visibility mean; shaded per fragment. Defaults: 256 texels, 6 km reach. Many biome pages use it | `core/terrain/45-core-horizon.js`, `host/45-core-horizon-shade.js` |
| `KSHADOW` | one sun shadow box fitted to the view (90 to 600 m), a 4096 map, PCF. Off unless `?shadow=1` | `core/shadow/host/12-core-shadow-host.js` |
| `KGROUND` | any number of layers, blended by height, hex tiling, distance doubling, a height-derived bump that needs no texture unit, opt-in triplanar. Albedo only per layer | `core/terrain/43-core-ground.js` |
| core/atmos | a sky model, a 3D noise volume for clouds, cloud shade; Godot twins generated from the JS | `core/atmos/`, `godot/shaders/atmos_*.gdshaderinc` |
| A texture-array atlas | albedo, normal and roughness arrays, 512 px, 16 layers, so a town's pieces draw in one call | `openworld/isle-demo/src/88a-world-atlas.js` |

### 2.3 Materials

- 82 `materials.json` files hold 2,696 families; **857 are `mapOnly`** (measured by count). G's "262 of 276" is one
  subset, not the repo.
- `pack.py` writes 512 px WebP: albedo lossy q82, normals lossless at 6 bits, roughness greyscale. It already has a
  height-in-alpha mode. `tools/textures/depth.py` exists.
- The page inlines the maps as data URLs and decodes them to RGBA8. There is no GPU-compressed path on the web. Godot
  compresses at load (BPTC on desktop, `godot/krator/kmat.gd:90-110`).
- No budget measures samplers or video memory. The budgets are page bytes (16 MB), triangles and draw calls.

### 2.4 Godot (`cool-tereshkova-d594e8`)

- Forward+, MSAA 2x, run on 4.7.2. Screenshot CI runs on Compatibility under llvmpipe.
- `library.gdshader` takes separate albedo, normal and roughness maps and builds its tangent frame from screen
  derivatives. No texture arrays, no height map.
- Bark and foliage are `diffuse_lambert, specular_disabled`; foliage back light is a constant 0.30.
- An open-world terrain streams in Godot (64 m cells, `world_stream.gd`), shaded by a stand-in that reads slope only.
- No SDFGI, VoxelGI, LightmapGI, ReflectionProbe or SSAO anywhere. Lamps are a pool of 8 unshadowed `OmniLight3D`.
- `compare_shots.py` scores SSIM with a threshold of **0.40**; the first baselines were 0.54 and 0.71, and the compare is
  a report, not a gate. G's "SSIM >= 0.82" is far above anything the two renderers have reached.

### 2.5 Ancient's Valley (`ancientsvalley-7f521c`)

- 12.5 to 18 M triangles in the registry (budget 20 M); 6 to 9 M and 550 to 1,176 calls a frame (ceiling 1,200).
- Arc 140T at 2880 x 1620: 48 to 90 ms a frame, stalls of 200 to 470 ms (`KNOWN_ISSUES.md:212`).
- Heap: about 3.85 of 4.19 GB; one tour ran the renderer out of memory (closed, `KNOWN_ISSUES.md:117`).
- Ground: one 440 x 440 plane, 14 m cells, 387k triangles, never culled. Plants stand on the analytic height, so they
  float or sink over carvings narrower than a cell. The fix (`GROUND.meshH`) is written and not applied.
- **`KGROUND` bug, unfixed:** Lambert gets no `cameraPosition`, so the ground's texture distance is measured from the
  origin (tiles up to 8 times too coarse underfoot), and there is no zero-weight guard: 49 fetches a pixel
  (`LOD-WRITEUP.md:453-468`).
- Shadows off by default. No ambient occlusion. Interiors take the scene's lights.
- `KSHELL` shells write `gl_FragDepth`, which turns early depth testing off.

## 3. What was measured in this pass

Scripts are in the session's scratchpad (`micro/audit.js`, `micro/steepest.py`); they move into `core/world` with stage T0.

### 3.1 G's three WMICRO bugs

| Claim | Verdict | Measurement |
|---|---|---|
| The masked target is not mean-compensated, so the land sinks where the mask closes | **Real, and large** | Mean change -1.3 / -2.9 / -7.0 / -13.7 m on slopes of 3 / 8 / 20 / 40 %: a steady -23 % of the mean absolute change. `test-micro.js` allows 25 % of the spread, so it passes |
| The 3 x 3 kernel has dead holes | **Real, small in area, wider in effect** | Zero weight on 0.07 % of the ground; the octave fully faded on 0.5 %; **partly faded on 18 %**. G's kernel (jitter 0.25 to 0.75, radius 1.25) has a minimum weight of 0.60, so the coverage fade never acts |
| Steering is over-damped, so fine rills curl parallel to the trunk | **Not shown** | The angle between fine (200 m and under) and coarse (400 m and over) gully lines is nearly uniform over 0 to 90 degrees (15 % in the first 10 degrees, 9 to 12 % in each other). No parallel curl, and no preferred junction angle either |

Why the first matters beyond the mean: wherever the erosion fades out (a town's band, a stream's corridor, flat ground)
the land steps back up by the bias. On a 20 % slope that is a 7 m shelf round a town.

### 3.2 G's "steepest window" audit

Scored with the same selector the reference DEMs were (the steepest 4 km window by p90 - p10), at 10 m:

| Window | 20-60 / 60-180 / 180-540 m relief | alignment | slope p50 / p90 / p99 |
|---|---|---|---|
| pinnacle, hyperjungle (-20000, 34000) | 3.8 / 11.5 / 25.3 m | 0.55 | 0.11 / 0.45 / 1.10 |
| pinnacle, NE rim (36000, -4000) | 2.8 / 6.7 / 6.9 m | 0.18 | 0.19 / 0.31 / 0.45 |
| pinnacle, hyperjungle (-16000, 34000) | 2.5 / 8.4 / 19.3 m | 0.73 | 0.10 / 0.32 / 0.80 |
| oidong, Oidong Valley (-28000, 22000) | 4.9 / 16.9 / 42.6 m | 0.63 | 0.36 / 0.77 / 1.43 |
| oidong, High Rift (14000, 34000) | 10.5 / 21.9 / 18.0 m | 0.31 | 0.55 / 0.99 / 2.48 |
| oidong, High Rift (6000, 30000) | 11.8 / 23.9 / 20.5 m | 0.42 | 0.53 / 1.01 / 3.05 |
| reference DEMs (their steepest 4 km) | 180-540 m: 20 to 46 m | 0.17 to 0.46 | |

- G's exact pinnacle figures (11.7 / 31.2 / 23.8 m, p99 1.90) did not reproduce. Its two findings do:
  - **Spectral inversion** on the High Rift: the 180-540 m band is smaller than the 60-180 m band. Real land grows with
    wavelength.
  - **Steep flanks are over-rough at the short end** there (10 to 12 m in the 20-60 m band, slopes of 68 to 72 degrees at
    the 99th percentile).
- New: in three of six steep windows the detail runs **along the contours** (0.55 to 0.73). The benches and landform
  cliffs dominate there, and the gullies do not cut through them.
- My earlier report understated the land: it measured two gentle windows against the DEMs' steepest. That bias was real.

### 3.3 Corrections to the two documents

| Statement | Correction |
|---|---|
| G: Option B is "selected" and "zero closed basins" | It is a candidate. The bake does not exist. Authored basins (crater lakes, playas, calderas) must survive |
| G: the far shadow marches 6 taps to 7 km "0 to 40 km" | 7 km is not 40. `KHORIZON` already bakes horizon angles; extend its reach |
| G: the light volume is a `sampler3D` "already prototyped in girder" | `nlvTex` is a 2D atlas of height slices, and it is copied into four builds |
| G: SSIM >= 0.82 between engines | The measured baseline is 0.54 and 0.71 at a threshold of 0.40 |
| G: Godot 4.5+ | The project runs on 4.7.2 |
| C: "the latest Godot material shader reads separate maps" | Confirmed (`library.gdshader:17-19`) |
| C: Ancient's Valley is "multi-million-triangle" | Confirmed, with the numbers in 2.5 |

## 4. Terrain

### T0. Fixes (keep; do first)

1. **The erosion's mean.** Subtract the stripe's mean from the masked target as well as the open stripe:
   `out += a0/2 * (mk*(y - YMEAN) + fade*cov*fo*(1 - mask)*(tgt - YMEAN))`, with `tgt` still built from the raw `y`.
   Tighten the test from 25 % of the spread to 5 %.
2. **The kernel.** Jitter 0.25 to 0.75, radius 1.25, weight `(1 - d^2/1.5625)^2`. The coverage fade becomes dead code and
   goes. Check that the tighter jitter shows no lattice (a hillshade and the alignment by direction).
3. **The ring.** Move the comment in `80-world-sky.js:79` into `/* */`.
4. **Move the two audit scripts into `core/world`** as `landshade.py --steepest` and a `test-micro.js` check.

Each of 1 and 2 changes every relief region's land. They go in one change, behind a version (`relief.micro: 2` in
`region.json`), with goldens for both versions and the GDScript twin. A region turns the version on at its re-bake, which
the owner has put in the all-builds rebuild (section 12).

**Not kept from G's list:** splitting the steering vector from the surface gradient (3.1: the fault it cures is not
there), and the sliding knee threshold (untested, and it reopens the closed basins the floor was built to stop). Both can
return as experiments judged by the junction-angle histogram and the tarn count.

### T1. Find which pass draws the contour-parallel relief (keep; one day)

An ablation on the six windows of 3.2: the alignment and the band relief with the bench pass off, with the landforms off,
and with the erosion's depth doubled. It says whether steep country needs (a) the erosion to cut through bench risers,
(b) the benches narrowed to their landforms, or (c) only the meso layer below. No code ships from T1; it picks T2's shape.

### T2. The 250 m drainage residual (revise G's Option B; an experiment)

**What it is.** A signed raster `D` at 250 m, added to the authored land before the micro-relief:

```
H = model (2 km, bicubic) + D (250 m, bicubic) + hills + erosion + ... (as now)
```

`D` is baked once per world tile, not per region (see "world-absolute" below).

**The model.** Stream power with uplift and hillslope creep:

```
dh/dt = U - K * A^m * S^n + kd * laplacian(h)

h  elevation, m            A  drainage area, m^2        S  slope to the receiver, m/m
U  uplift, m/yr            K  erodibility, m^(1-2m)/yr  (n = 1)      kd  creep, m^2/yr
m = 0.45, n = 1 (the common concavity m/n of 0.4 to 0.5)
```

**The implicit step** (n = 1), cells visited from the outlets up, with `d_i` the distance to the receiver `r(i)`:

```
c_i = dt * K_i * A_i^m / d_i                         (dimensionless: 1/yr * yr)
h_i' = (h_i + dt*U_i + c_i * h_r(i)') / (1 + c_i)
```

G's update leaves out `dt*U_i`. Without it every step lowers the land toward its outlet, and the minimum-slope clamp
then raises cells with no rule behind it.

**Uplift from the authored land.** At equilibrium `U = K * A^m * S`. Compute `A` and `S` on the authored surface `h0`
(after priority-flood routing) and set `U` to that. Trunk valleys then keep their authored long profiles, and the relief
that grows is between them. (Schott et al. 2023 reconstruct uplift from an elevation model in the same spirit.)

**Preserving the macro shape, by construction.** Equilibrium alone does not hold the hillslopes to the authored heights:
small `A` wants steep slopes, and ranges would grow. So after every step, project:

```
h <- h - G2km * (h - h0)          G2km: the low-pass back to the authored map's scale
D  = h - h0                       so G2km * D = 0 exactly
```

The erosion can only move relief around below 2 km. The authored map cannot drift. This is C's preservation term made a
hard constraint, not a weight to tune.

**Routing.** Re-route (priority-flood, receivers, `A`) after every step: `A` and the receivers go stale as the land
changes. Six to ten steps.

**Boundary conditions and pins.**

| Thing | Rule |
|---|---|
| Sea and authored lakes | fixed-height outlets. An authored closed basin is an outlet at its own level, so it survives |
| Named rivers | receivers forced along the authored course (burned in), so the trunk cannot wander |
| Settlement sites, roads' banks | `D` fades to 0 in the town's band, as the relief mask does now |
| Tile edges | each tile is baked with a halo; inflow `A` at the halo's edge comes from one global accumulation on the 2 km map |
| Landform records (mesas, calderas) | `D` faded inside their footprints until T1 says otherwise |

**World-absolute.** The stream bake today runs per region (`WORLD.box()`), so two regions over one place trace different
streams. A residual that changes the land cannot do that: `H` must agree everywhere. Bake `D` on fixed world tiles (64 km
with a halo), keyed by tile, and let a region take the tiles it covers. (Agreed by the owner, section 12.)

**Storage.** Unsigned 16-bit with a stated offset and scale: `D` is bounded (clamp at +-400 m), so a step of 0.0125 m.
Not `R16F`: a half float steps 2 m near 3,000 m (C is right). About 160,000 cells per 100 km region; 150 to 300 KB as a
16-bit PNG (assumed; measure).

**What changes above it.** Where `D` is present, it supplies the 500 m to 4 km forms. The pointwise hills fade to a
fraction there, and the erosion drops its 800 m octave and follows `D`'s slope, so the fine gullies branch off real
valleys.

**Acceptance (the experiment passes only if all hold), on one High Rift tile and one pinnacle tile:**

| Measure | Tolerance |
|---|---|
| Macro drift `G2km * D` | under 0.5 m rms, 3 m worst (pins only) |
| Coastline | the zero contour moves by at most one 250 m cell; no sea cell changes |
| Named rivers | the bed stays within one cell of its course; its long profile never climbs downstream |
| Sites | under 0.3 m change inside a town's band; every site check still reads ok |
| Accidental closed basins | under 0.5 % of the land, none deeper than 1 m after a final breach; every authored basin still closed |
| Alignment in the steep windows of 3.2 | 0.46 or under (now 0.55 to 0.73) |
| Band growth, 180-540 m over 60-180 m | 1.5 or more (now 0.8 to 0.9 on the High Rift) |
| Slope p99 outside declared cliffs | 1.0 or under |
| Junction angles of the 250 m network | a peak between 40 and 75 degrees |
| `WORLD.H` | under 5.5 us a call (now 4.4) |
| Bake | under 60 s a tile; byte for byte the same on Windows and Linux |
| Twin | the GDScript `H` matches the golden to 1e-6 with `D` read from the same raster |

Hurst-style ratios and G's universal thresholds stay as diagnostics in the report, not gates (C is right: one target
cannot certify a mesa and a fen).

**If it fails:** the pointwise land stays as it is after T0, and T1's answer is applied to the benches alone.

### T3. Landform library (defer; after T2)

C's list (glacial troughs and cirques, alluvial fans, volcanic flows with age, talus) is right and large. It belongs on the
existing records (`WLAND`, `KSTACKS`, `KSTRATA`, `KLAVA`, `KTHERM`), one landform at a time, each with a measure. Not part
of this proposal's first pass.

## 5. Open-world lighting and shading

Ordered by what it shows for what it costs. Every item names the module it takes. The owner's answer (section 12) puts
the main work of S3, S4 and S5 in Godot; the web page keeps the shared data and the cheap version listed there.

### S1. Far terrain shadows and sky visibility: take `KHORIZON` (revise G's layers 1 and 2)

- Bake horizon elevation per 250 m texel from the same grid as T2 (the authored land plus `D`), in 8 azimuths, reach
  40 km. The sun's arc covers half the compass, so the 8 azimuths can be spent on that half.
- **Direct sun:** shadowed where the horizon's tangent toward the sun exceeds `sunDir.y / length(sunDir.xz)`, softened
  over about 1.5 degrees. (G compared against `sunDir.y` alone; C's correction is right.)
- **Sky visibility**, from the same angles, for a level receiver under an even sky: `V = 1 - mean(sin^2(theta_i))`
  (Dozier and Frew 1990). It multiplies the hemisphere and ambient light only, never the sun.
- **Fine occlusion** is a second, separate term: the erosion's crease, already computed per vertex. A Laplacian of the
  chunk grid is not a sky-view factor and is dropped.
- **Ground bounce** stays a third term (a warm tint on the occluded ambient), small.
- Storage: two RGBA8 textures of 400 x 400, the tangent stored through a square root for precision at low angles.
  About 1.3 MB of video memory, 200 to 400 KB in the page (assumed; measure).
- Shared data: the same two textures feed the Godot terrain shader.

### S2. Near shadows: take `KSHADOW` (keep G's near cascade, with the module that exists)

One box round the camera, on by default in the open world, budgeted. Trees, cliffs and buildings cast; S1 carries the far
field. In Godot this is the engine's own directional shadow.

### S3. Per-pixel ground normals (revise G's layer 3)

- **Why the micro-relief barely shows from the air:** normals are per vertex. A chunk a kilometre off has vertices 16 to
  32 m apart (a node splits at 1.05 times its size, 64 cells a side), so the 25 to 100 m gullies are averaged away before
  they are lit.
- **Proposal:** build chunks in a Web Worker (the height function is pure data code; Godot already builds its chunks off
  the main thread), then bake each mid and far chunk a 129 x 129 normal-and-crease texture: twice the mesh's density.
  Near chunks (2 to 4 m vertices) keep vertex normals.
- Cost to measure, not assume: about 16,600 height calls a chunk (roughly 75 ms in a worker), and video memory per
  chunk of 67 KB; 700 chunks is 47 MB.
- Not proposed: perturbing normals from screen derivatives of procedural noise. It adds detail that the land does not
  have, and the two engines would disagree about it.

### S4. Ground material: take `KGROUND` near the camera (revise)

- Fix its two bugs first (section 7, A0), in core, for every build that uses it.
- The open world's near ground then gets layered textures with hex tiling in place of one noise canvas.
- Layer maps move into one texture array (the isle-demo atlas is the pattern): 7 samplers become 1, which makes room
  for a normal array and a roughness array within the same budget. This is where arrays earn their place.

### S5. Sky, fog and cloud shadow by the hour: take core/atmos (revise G's layer 5)

- The dome is a day's painting at every hour, and the fog is one beige. Both follow the clock through core/atmos's sky
  model and cloud shade, which already have generated Godot twins. No new Rayleigh and Mie shader.
- The default hour moves later (G's 16:20) **after** S1 and S2 land. A low sun without shadows only dims the land.

### S6. Colour from the land's shape (revise G's layer 4)

The crease and lift already tint the ground by 6 to 7 %. Make it chromatic (hollows cooler and damper, noses paler and
warmer) and let aspect shift the moisture thresholds. Small, per vertex, shared data. Talus classes wait for T1.

## 6. Surfaces and assets

### M1. Material slice (keep C's slice; measured before any all-builds change)

One ground set, one masonry wall and one rock, taken through four variants in both engines:

| Variant | What it tests |
|---|---|
| today's three maps | the baseline |
| albedo + height in alpha; normal xy + roughness + cavity | G's two-map packing, with a real byte count |
| the same in texture arrays | sampler count against video memory |
| 6-bit xy, 8-bit xy and 8-bit octahedral normals | banding on a glazed, smooth, curved surface |

Report for each: page bytes, decoded bytes, video memory, samplers of the linked program, load time, frame time on the
Arc and the RTX, and the Godot import.

Rules settled now:
- **Arrays cut sampler bindings, not fetches or memory.** 12 layers at 512 px RGBA8 with mips are about 16 MiB an array.
  WebP shrinks the download, not the texture on the card.
- **No GPU-compressed textures on the web for now.** r128 can upload a compressed 2D texture but not a compressed
  array, and block-compressed data would raise page bytes against the 16 MB cap. Godot already compresses at load.
  Revisit only if measured video memory becomes the limit.
- **Height never goes in the alpha of a cut-out material.** The record and the Godot contract carry a version when a
  channel's meaning changes.
- **The sampler limit is measured, not assumed.** WebGL2 guarantees 16 fragment texture units. Budget against the linked
  program's count on each lane.

### M2. Per-pixel lighting where the eye is close (keep, staged)

- Near ground, walls and rock move from Lambert to the standard material on the web; bark gains a normal map at its
  nearest level. Far tiers stay Lambert.
- In Godot these are the engine's materials; `diffuse_lambert, specular_disabled` comes off bark at the near level only.
- **Specular anti-aliasing without new bytes:** `pack.py` writes each normal map's variance per mip level into
  `pack.json` (about ten numbers a material, from the float normals before quantising). The shader works out its mip
  level from derivatives and adds that variance to the roughness. The same table feeds both engines. The geometric
  term (Kaplanyan and Antonov) is added separately; the two are different variances and are not folded together.

### M3. Parallax occlusion (revise: hero surfaces only)

- Only on planar surfaces with an analytic basis: world-UV walls and floors, box faces, terrain's XZ.
- Never under triplanar blending, on arbitrary UV islands, or across two ground layers in transition (the dominant layer
  only, or none).
- Derivatives are taken before the loop and the march samples with explicit gradients: derivatives inside non-uniform
  control flow are undefined in GLSL ES 3.00.
- 8 linear steps and one linear refinement. Self-shadow taps only where M1 shows they are seen.
- Terracing comes from texel size, the depth map's quality and step count, not from WebP's 8-bit alpha.
- `KGROUND`'s existing height-derived bump stays the general answer for ground.

### M4. Edges, wear and contact (revise)

- **Bevels are geometry** on near-tier primitives where the triangle budget allows (a chamfered box is 44 triangles for
  12). A normal bend gives a glint and no silhouette or shadow. Not in Ancient's Valley, which has no budget.
- **Corner and joint darkening is baked per vertex** by the builders, which know every wall, floor and beam. Both engines
  read it; no shader plane tests.
- **Cavity and wear are separate masks.** One channel cannot say both "concave pore" and "worn convex edge".
- **Grounding:** each instance carries its base height; the shader darkens and tints the first 0.25 to 0.4 m above it.
  No terrain texture lookup in every asset shader. The larger grounding fault is plants on the wrong ground (A0).
- **Wet margins** read the local water body (`WORLD.water`) and horizontal distance, not one global level.

### M5. Foliage (revise)

- Back light depends on the leaf's normal, the light and the view (transmission only through leaves the light can
  reach), with thickness from the card where it exists. G's `dot(V, -sunDir)` alone lights leaves that face away.
- Crown occlusion (darker inside and low) is baked per vertex at build time.
- In Godot: `BACKLIGHT` and the engine's transmittance. On the web: one wrap term.

### M6. Tone mapping (revise: a look choice, not a parity device)

- Add AgX as a `KCOLOR.output()` mode on the web (a custom tone-mapping chunk; r128 has no built-in one). Godot uses its
  own AgX. Do not set Godot to linear to force a match.
- Judge it on three hero views with the owner, and on a swatch gallery whose tolerances come from the measured baseline.

### Deferred on the web, native in Godot

Screen-space contact shadows, SSAO and screen-space indirect light, global illumination (SDFGI, VoxelGI or lightmaps),
reflection probes, volumetric fog. The web page has a logarithmic depth buffer and MSAA and no post chain; adding one is
a project of its own. Godot has all of these as settings.

## 7. Ancient's Valley

### A0. Get cost back (keep; first)

| Item | Why | Source |
|---|---|---|
| `KGROUND`: distance from the eye (`KHOOK.EYE`), and skip zero-weight layers | tiles up to 8 times too coarse underfoot; 49 fetches a pixel | `LOD-WRITEUP.md:453-468` |
| Plants on `GROUND.meshH`; refine the ground along carvings in culled 8 x 8 tiles | floating flora; 387k triangles never culled | `LOD-WRITEUP.md:371-390` |
| core/biome's merge, index and cull switches | written, not enabled | `LOD-WRITEUP.md:440-451` |
| Impostors baked to render targets | 671 MB of heap and 8.8 GB of uploads at bake | `LOD-WRITEUP.md:420-438` |
| `KSHELL`: conservative depth where the lane has `EXT_conservative_depth` | `gl_FragDepth` turns early depth off | `LOD-WRITEUP.md:350,481` (extension support assumed; test) |

### A1. A deterministic route (keep C's step 4; this is the track's gate)

Four stops: a city block at street level, the forest's edge, a tower's door from outside to inside, and the ground at
the water. At each, on the Arc and the RTX: frame time (median and 95th percentile), calls, triangles, heap, texture
bytes, the worst plant-to-drawn-ground error, and a screenshot at noon, late afternoon and night. A0 is judged by the
route; so is everything after it.

### A2. Then what shows (staged, each inside the budgets)

1. Shadows on by default (`KSHADOW`'s one box), if the route holds.
2. Occlusion that costs nothing at run time: vertex occlusion on heroes, an occlusion channel in the shells' atlas bake.
3. The forest past 1.2 km: a far canopy tier (owed, `KNOWN_ISSUES.md:93`).
4. Forests as stands (C): species by moisture, slope and aspect; gaps, snags, fallen timber; regrowth by substrate
   (rubble, parks, street edges, broken roofs). These are placement records: shared data, both engines.
5. The city's hierarchy (C): districts, landmark silhouettes, a far tier per district. Silhouette and structure before
   shader cost: no parallax here.

## 8. Interiors

G's four pillars, redrawn round room identity instead of a 3D texture:

| Step | Proposal | Why |
|---|---|---|
| I1 | **Sun and sky masked indoors by a flag the builder writes** (an interior face knows it is one) | The fault everyone sees (sunlit tables under a roof) fixed with no lookup. Keep |
| I2 | **A row per room in a small table**: daylight colour and strength from a breadth-first walk of the room graph from windows and open doors, and the room's lamp ambience. Surfaces carry a room id | Light cannot bleed through a wall, because nothing interpolates across rooms. Shared data. Keep |
| I3 | Real lights for the room the camera is in (the pools exist: 6 on the web, 8 in Godot); shadows on one or two in Godot | Keep |
| I4 | Corner darkening baked per vertex (M4) | Keep |
| I5 | Window sun patches | Defer until I1 to I3 are seen |
| I6 | A 3D light volume | Defer. Half-metre trilinear voxels bleed through a 0.2 m wall, and RGBA8 cannot hold colour, direction and occlusion together (C is right) |

Also: `nlvTex` is copied into four builds (girder, yuni, locus, mavs-refuge). If it stays, it becomes one core module; the
room table may replace it.

In Godot's high tier, a reflection probe per building and the engine's GI are settings, not work for this plan.

## 9. Shared or native, and the checks

### 9.1 What is shared and what is each engine's own

| Shared (data, or shader logic written once and twinned) | Native (each engine's own way) |
|---|---|
| `WORLD.H`, `WMICRO`, the residual `D`, stream records | chunk streaming, level of detail, culling |
| horizon angles and sky visibility (S1) | shadow maps, cascades, contact shadows |
| material records, packed maps, variance tables | GI, SSAO, reflection probes, volumetric fog |
| crease, lift, vertex occlusion, room table, interior flag | tone mapper and exposure |
| placement records (forests, city) | sky rendering beyond core/atmos's shared model |
| `KGROUND` layer rules, world-UV and triplanar rules | GPU texture compression |

Parity target: the same data and the same named terms, checked by value where a twin exists (as the GPU golden checks do
now) and by eye on a swatch gallery. Not pixel-identical frames.

### 9.2 G's eight gates

| Gate | Verdict | Change |
|---|---|---|
| 1. Pack and channel physics | **Revise** | Assert in `pack.py` at write time. Drop the fixed thresholds (cavity mean 0.42 to 0.58, height range over 0.20): they reject plaster, sheet metal and glazed tile. A material declares itself flat |
| 2. Sampler limit and NaN lint | **Revise** | Keep the sampler count, read from the linked program, as a budget in the harness. Drop the regex ban on `pow` and `sqrt`: the real-GPU lanes (`KRATOR_GL=gpu`, `gpu-renderer`) already catch what SwiftShader hides; new shader text goes through the existing `check_source` ratchet |
| 3. Handedness probe | **Keep** | The best new check: a flipped green channel or an inverted march is silent otherwise. Small, both engines |
| 4. Clay raking-light audit | **Revise** | Compare normal map on against off (a mean difference), only on materials flagged as relief. The 2.5 times energy ratio fails any honest smooth surface |
| 5. HDR pixel sanity | **Revise** | Keep the NaN and infinity read on a half-float target. Drop the darkness and chroma thresholds: caverns, night and interiors are legitimately dark. Keep the indoor sun-leak probe as an interiors check |
| 6. UV stretch and shimmer | **Drop** the temporal half (optical flow is a flaky judge); keep UV stretch as a report |
| 7. Cross-engine swatches | **Revise** | A swatch gallery with per-swatch tolerances set from the measured baseline. No SSIM gate at 0.82 |
| 8. Budgets ratchet | **Keep** | It exists for bytes, triangles and calls. Add samplers and an estimate of video memory (the texture inventory and geometry bytes). GPU timer queries where a lane exposes them, frame time otherwise |

**The one end-to-end check to add:** the deterministic route (A1), run for one page of each track (open world, Ancient's
Valley, an interior) on both lanes and in Godot. It is the only check that sees cost, grounding, light leaks and looks in
the same frame, and its history is what a ratchet compares.

## 10. Decisions

**Keep**
- The WMICRO mean fix and the hole-free kernel (T0).
- The ablation of the bench and landform passes (T1).
- `KSHADOW` on in the open world (S2).
- Sun and sky masked indoors by a builder's flag; the room table; the near-light pool (I1 to I3).
- The handedness probe; the budgets ratchet with samplers and video memory; the deterministic route.
- Vertical slices before any all-builds rebuild.
- Ancient's Valley's owed work first (A0).

**Revise**
- Option B becomes a residual raster with uplift, re-routing and a hard macro projection, baked per world tile, judged
  by the table in T2.
- Sky-view factor and far shadows come from baked horizon angles (`KHORIZON`), not a Laplacian and six taps.
- Per-pixel terrain normals come from a baked chunk texture built in a worker, not from screen derivatives of noise.
- The sky, fog and cloud shadow come from core/atmos, not a new shader.
- Two-map packing and texture arrays go through the material slice (M1) with measured bytes and memory.
- Parallax only on hero planar surfaces with analytic bases.
- Bevels as geometry; corner darkening and crown occlusion baked per vertex; cavity and wear as separate masks.
- Foliage back light with the leaf's normal in it.
- AgX as a look choice per engine, judged on swatches.
- Gates 1, 2, 4, 5 and 7 as in 9.2.
- Metrics (band ratios, Hurst, pit area) as diagnostics, with per-landform envelopes.

**Defer**
- The 3D interior light volume; window sun patches.
- GPU-compressed textures on the web.
- Screen-space contact shadows, SSAO and GI on the web (native in Godot).
- The landform library (glacial, volcanic with ages, talus).
- Terrain-texture lookups in asset shaders for grounding.
- The later default hour, until shadows exist.

**Drop**
- "Zero closed basins" as a target.
- The stream-power update without uplift, and `R16F` heights.
- The split steering vector and the sliding knee, as bug fixes (they may return as experiments).
- Pixel-level parity between engines, the SSIM 0.82 gate, and Godot set to linear.
- The temporal shimmer gate and the regex NaN lint.
- The estimated "+1.35 to 1.60 ms" as a budget.

## 11. Order of work

| Stage | What | Exit |
|---|---|---|
| 0 | T0's fixes behind `relief.micro: 2` (goldens, twin, tests; no region re-baked); A0's `KGROUND` fix in core; the ring | the tests and goldens pass in node and Godot; the builds `KGROUND` reaches rebuilt and verified on the GPU |
| 1 | The route harness (A1) on one open-world page, Ancient's Valley and the Godot walk scene; samplers and video memory in the budgets | baselines recorded on the Arc, the RTX and in Godot |
| 2 | T1 ablation; the stream bake moved to world tiles; then the T2 experiment on two tiles | T2's table passes, or the residual is shelved with the numbers |
| 3 | Open-world light, Godot first: S1 horizon data (both engines), the engine's shadows, the sky by the hour from core/atmos's twins. Web: `KHORIZON`, `KSHADOW` on, the dome and fog by the hour | the route holds its frame time; before and after at three hours in Godot |
| 4 | Godot ground: S3 chunk normal textures, S4 layers in arrays | measured chunk time and memory |
| 5 | M1 material slice in both engines | the table of bytes, memory, samplers and time; the owner picks the packing |
| 6 | Ancient's Valley A0's rest, then A2 in order | each inside the budgets on the route |
| 7 | Interiors I1 to I4 on one building, the lights native in Godot | the sun-leak probe passes; the owner's eye |
| 8 | The all-builds rebuild: every relief region re-baked on `relief.micro: 2` (and on `D` if T2 passed), the chosen packing, every page rebuilt and verified | `test_all.py --nightly` green on the web and in Godot |

Stages 0 and 1 are a few sessions. Nothing after stage 1 starts without its baseline.

## 12. The owner's answers (2026-11-17)

1. **Godot is where it should look best.** So the looks are built once, natively, in Godot, and the web page keeps the
   shared data and the cheap version:

   | Item | Godot | Web page |
   |---|---|---|
   | S1 horizon shadows and sky visibility | the terrain shader reads the two baked textures | the same textures through `KHORIZON` |
   | S2 near shadows | the engine's directional shadow | `KSHADOW`'s one box, on |
   | S3 per-pixel ground normals | built here first: the chunk's normal-and-crease texture, in the chunk thread that exists | vertex normals stay; the worker and the textures only if the owner later wants them |
   | S4 layered near ground | `ground.gdshader`'s layers, moved to arrays | `KGROUND`'s two bug fixes only |
   | S5 sky, fog and cloud shadow by the hour | core/atmos's generated twins | the dome's tint and the fog's colour follow the hour; nothing more |
   | S6 colour from the land's shape | shared, per vertex | shared, per vertex |
   | M2 to M6, interiors' lights, GI, SSAO, contact shadows | native | the cheap term or nothing |

   Terrain (section 4), the material records and packing (M1), the room table and flags (I1, I2, I4) and the placement
   records are shared data and are unchanged by this answer.
2. **The stream bake may move to world tiles.** T2 is unblocked. The streams move with it: one trace per tile, so two
   regions over one place agree.
3. **The relief is re-baked as part of the all-builds rebuild**, not before it. So T0's two WMICRO fixes ship behind a
   version in `region.json` (`relief.micro: 2`): a region keeps today's land and its baked streams, roads and sites until
   its re-bake turns the version on. The T2 experiment's tiles run on version 2. Nothing is half-migrated in between.

## 12b. The vertical stack: one place, every layer, in Godot, before the rebuild (owner, 2026-11-17)

Stage 0's two branches (WMICRO version 2 with the ring; KGROUND's zero-weight guard) are merged into one test branch and
shown together on one place in Godot, before anything goes project-wide.

- **The place:** `openworld/oidong-highrift`, a High Rift tile: Godot already streams it (`krator/world_stream.gd`, M7) and
  walks it (`walk.tscn`, M8), it has the steep windows of 3.2, and the relief bake runs on it.
- **The switch:** a copy of its `region.json` with `relief.micro: 2` (a test copy; the committed one stays version 1),
  its streams, sites and resources re-baked on it, and the Godot export taken from it.
- **What is compared, version 1 against version 2, at the same three cameras (a High Rift flank, a valley floor, a
  town's edge) and at 15:30:**
  - the twin: `wrelief_test.gd` passes the v2 goldens in Godot 4.7.2;
  - the land: `landshade.py --steepest` before and after (mean bias, band relief, alignment);
  - the bake: tarns, junctions, site checks;
  - the look: Godot shots (Forward+, on the RTX lane) side by side; one web shot of the same views for reference;
  - the cost: `WORLD.H` µs a call; Godot chunk build time.
- **KGROUND's guard** is checked on one build that takes it (a throne station), on the web, by its shader-programs and
  shader-errors asserts and a before/after shot. Godot has no KGROUND map-layer twin to change.
- **Pass:** v2's mean bias under 5 % of its amplitude, no seam or step at the town's band, the stream and site checks
  ok, and the owner's eye on the Godot shots. Then the all-builds rebuild turns version 2 on everywhere.

## 12c. Stage 8 runbook (for the all-builds rebuild) and next expansion: Xanadu *(owner, 2026-11-22)*

Stages 0 through 7 are proven on `claude/vertical-stack` (`STAGE-3-4-REPORT.md`, `STAGE-5-REPORT.md`, `STAGE-6-7-REPORT.md`). Stage 8 waits to ride along with the next all-builds rebuild once the other collected sessions merge into `main` (also queued in `TODO.md`, *"Ride along with the next all-builds rebuild"*):

1. **Relief `relief.micro: 2` & regional `S1` horizon bakes:**
   - Enable `"relief": {"micro": 2}` in every `openworld/*/region.json` (plus `D` residual rasters where `T2` passed).
   - Re-bake world-tile streams, `plan/sites.json`, and resource placements across every `openworld/<region>` and map-seated settlement (`settlements/longsong`, `settlements/pinnacle`, `settlements/pher`, `settlements/kirstabal`, `settlements/isle-demo`).
   - Run `python3 core/world/bake_horizon.py <godot_export_dir>` (`40 km` reach, 8-azimuth sqrt-tangent `horizon0.webp` / `horizon1.webp`) for every Godot region export; confirm `wrelief_test.gd` v2 goldens and `python3 tools/check_godot_exports.py`.
2. **Engine-split `M1` material packing (`STAGE-5-REPORT.md` §4):**
   - **Godot (`godot/tools/export_spike.py`, `packFormat: 2`):** Export multi-layer ground/town sets as `v4_arrays_two_maps` (`hemi-oct8` + `mipVariance` specular AA in `pack.json`) and standalone kits as `v2_two_maps_oct8` (`library.gdshader` `use_nrc = true`, `normal_enc = 1`), cutting `BC7` VRAM by `-33.3%` and multi-layer samplers to `2`. Keep cut-out materials (`alphaTest > 0`) on RGBA albedo + alpha with no height in alpha (Gate 1).
   - **Web (`tools/textures/pack.py`):** Retain `v1` 3-map WebPs on inline HTML builds so single-file pages stay well inside the `16 MB` cap; promote smooth/glazed materials (`specular >= 0.45`, `roughness < 0.35`) to `8-bit` `xy8` normals; assemble `v3_arrays_three_maps` at runtime where linked fragment samplers approach `16`. Assert Gate 1 and Gate 3 (`m1_slice_test.gd` / `tools/textures/m1_slice.py --web`).
3. **Topological all-builds rebuild, route ratchets & baselines:**
   - Sweep the companion items parked in `TODO.md` (*"Ride along with the next all-builds rebuild"*), build `kits/interiors` before `kits/ancients-interiors`, rebuild all Throne stations (`--station <name>`), Girder's hero (`build_hero.py`), and `python3 tools/build.py --all`.
   - Verify `python3 core/engine/fingerprint.py` and `python3 core/furnish/fingerprint.py`.
   - Run `tools/route_harness.py` (`openworld`, `ancientsvalley`, `interiors`) on `arc` and `rtx`, plus Godot `route_harness.gd` and `stage7_interiors_test.gd`.
   - Rewrite `PORT-BASELINE.json` (`python3 tools/port_baseline.py`) only for rebuilt, GPU-verified pages, and require `python3 tools/test_all.py --nightly` green on both Web and Godot 4.7.2.

### Next step after merge & Stage 8: Build out Xanadu on the new graphics & terrain stack
Once the collected sessions are merged and Stage 8 lands, the next graphics expansion targets **Xanadu** (`settlements/xanadu` / Erewhon, `kits/xanadu` & `XAK`, `biomes/xanadu`, `openworld/xanadu-lake-shore`, `openworld/xanadu-north-shore`, `openworld/xanadu-oidong-highrift`, `settlements/pher`, and `settlements/kirstabal`):
- **Land, `40 km` Horizon Light & 3D Grass (`S1`–`S5`):** Pair `core/world`'s lush `xanadu` style and `relief.micro: 2` with `40 km` `KHORIZON` solar penumbrae + Dozier–Frew sky-visibility, hourly `core/atmos` sky/fog/cloud shadows, `S3` `32 m` sub-grid chunk normals, Sultanate/lake-margin `S4` hex-tiled ground `Texture2DArray`s, and `KratorWorldGrass` 3D grass swards in Godot.
- **Glazed Domes, Tilework & Masonry (`M1`–`M4`):** Bring Xanadu's glazed domes, Persian/Turkish tilework, carved eaves, and lacquerware onto `hemi-oct8` + `mipVariance` specular AA (eliminating curved highlight banding), `M3` planar POM on hero ashlar/brick walls, and `M4` concave cavity + base grounding.
- **Erewhon & Sultanate Interiors (`I1`–`I4`, Gate 5):** Export `interiors.json` v2 (`core/interiors/10-core-roomlight.js` `KROOMLIGHT`) for Erewhon and `kits/xanadu` interiors (`89y-xa-interiors.js`, `kits/interiors/sets/xanadu.js`), wire native Godot `KInteriorsLight` + `library_interior.gdshader` (`INDOOR_LAYER = 2` sun/sky mask, BFS portal daylight + lamp bounce, room-gated `OmniLight3D` pool with 2 shadowed hero lamps, per-vertex dihedral corner AO), and verify with a Xanadu deterministic route and Gate 5 Sun-Leak Probe.

## 12d. All-biome and all-kit shared core steps for the all-builds rebuild *(2026-11-22)*

Because `core/biome` (`231` builds / `540` pages), `core/materials/record` (`279` builds / `758` pages), `core/catalog` (`53` builds / `263` pages), and `core/engine` (`16` builds / `74` pages) reach nearly every LFS HTML page in the repo, the following shared-core upgrades are designed to land **once, inside the all-builds rebuild**, lifting every biome and kit simultaneously without extra intermediate rebuild passes:

### A. All-Biome Core Steps (`core/biome/*`, `core/terrain/*`, `godot/shaders/foliage.gdshader` & `bark.gdshader` — `540` pages; individualized 64-biome checklist in `BIOME-REBUILD-SURVEY.md`)

1. **`B1` (`M5`) `[G shader]` Normal-aware leaf transmittance (`core/biome/30-core-foliage.js:361-365`, `godot/shaders/lib/foliage.gdshaderinc`):**
   - Today `foliageHook` computes `_bk = pow(max(dot(_bV, uSunDir), 0.0), 6.0)` with no leaf normal, illuminating leaves whose sunlit side is occluded.
   - Multiply `_bk` by a leaf-normal gate (`clamp(-dot(_bN, uSunDir) * 0.65 + 0.35 * (1.0 - abs(dot(_bN, uSunDir))), 0.0, 1.0)` using `vFlN` when `o.aN` else `transformedNormal`), and mirror the exact normal gate in `foliage.gdshaderinc` (`BACKLIGHT`).
2. **`B2` (`M4` + `M5`) `[G data]` Baked crown self-occlusion & trunk/boulder base grounding (`core/biome/20-core-kit.js`):**
   - In `BIO.bake()`, multiply tree-crown clump `_COLOR` by radial-and-height crown occlusion (`0.62` low/interior -> `1.00` outer/top canopy) so both Web and Godot glTF MultiMeshes inherit volumetric crown depth with zero runtime shader taps.
   - Bake a `0.72 .. 1.00` base-height contact ramp over the lowest `0.35 m` of merged `bark` and `solid` rock/trunk buckets (`M4` grounding, zero terrain-texture reads).
3. **`B3` `[web]` Foliage & bark shader-program deduplication (`core/biome/30-core-foliage.js:304,372,393`, `TODO.md`):**
   - Move `o.swayA` (`uSwayA`) and `iridBarkMat` `colA`/`colB` (`uIridA`, `uIridB`) from interpolated GLSL float literals into per-material uniforms, and key `customProgramCacheKey` strictly on structural shader flags (`aN`, `irid`, `axis`, `swayW`, `spin`, `ground`, `backlit`, `season`, `a2c`, `BIO._fx()`). Collapses `50–90` foliage programs per biome/settlement page down to `3–6` programs (`~2–5 s` faster WebGL link time, pixel-identical).
4. **`B4` (`A0.3` + `R7`) `[web]` Default-on biome indexing, LOD culling, `A2C` & card-fringe dilation (`core/biome/20-core-kit.js`, `44-core-stage.js`):**
   - Enable `BIO.INDEX_ITEMS = true` and `BIO.setA2C(renderer)` by default in `44-core-stage.js` (and `BIO.LOD.merge = true; BIO.LOD.minTris = 4000; BIO.LOD.cull = true; BIO.LOD.fade = 0.15` on multi-pass station hosts).
   - Fix `BIO.libSwap` (`20-core-kit.js:242-245`) to dilate `alpha < 48` texels with the sheet's mean opaque RGB on a `willReadFrequently` canvas once per cached library card, eliminating dark mipmap fringes across all 231 biome builds.
5. **`B5` (`S6` + `A0.2`) `[G data]` Drawn-ground audits & chromatic land-shape tint (`core/biome/20-core-kit.js`, `40-core-place.js`, `core/terrain/`):**
   - Point `BIO.attachAudit`, `cliffOld`, and `57-core-water-audit.js` at `KDRAWN.h` whenever `core/drawn` is loaded so coarse-triangle plant float is caught automatically.
   - Upgrade vertex crease/lift ground tinting (`S6`) from achromatic `±6%` to chromatic hollow/nose & aspect-moisture tinting across shared terrain builders.

### B. All-Kit Core Steps (`core/materials/*`, `core/engine/*`, `core/catalog/*`, `core/furnish/*`, `kits/interiors/*`, `godot/shaders/` — up to `758` pages; individualized 36-kit checklist in `KIT-REBUILD-SURVEY.md`)

1. **`K1` (`M1` + `M2` + `M4`) `[G data]` / `[G shader]` Material-library uniform dedup, sine-free breakup & `mipVariance` AA (`core/materials/record/25-matlib-host.js`, `opt/69a-world-uv.js`, `tools/textures/pack.py`):**
   - Replace literal GLSL floats in `KMAT.specularHook`, `KMAT.breakupHook`, and `69a-world-uv.js` with per-material uniforms (`uKmSpec`, `uKmBreak`, `uWuvScale`), collapsing `30–45` duplicate `MeshStandardMaterial` programs per kit/settlement down to `1–2` programs; replace `sin()` in `kmH` with a sine-free hash matching `godot/shaders/lib/breakup.gdshaderinc`.
   - Have `pack.py` emit pre-quantisation normal `mipVariance` (`8` floats) into every kit's `pack.json` (`M2` specular AA) and separate concave pore/mortar `cavity` from convex edge `wear` (`M4`).
2. **`K2` (`M4` + `I1`–`I4`) `[G data]` Building-kit engine grounding, hero bevels & universal `KROOMLIGHT` (`core/engine/30-geo.js`, `91i-interiors.js`, `kits/interiors/src/49-exports.js` & `50-shell.js`):**
   - Add per-vertex plot-base grounding (`0.72 .. 1.00` over `y = 0 .. 0.30 m` on exterior walls/posts) and an opt-in `boxBevel()` chamfered primitive (`44` tris vs `12` for near-tier plinths, piers, and lintels where budget permits) in `core/engine/30-geo.js`.
   - Wire `core/interiors/10-core-roomlight.js` (`KROOMLIGHT.buildTable`, `vertexCornerAO`, `pickPool`) directly into `core/engine/91i-interiors.js` and `kits/interiors` (`50-shell.js`, `49-exports.js`), giving **every kit with an interior set** (`kits/interiors/sets/*.js`) automatic `I1` indoor sun/sky masking, `I2` discrete doorway-portal daylight, `I3` room-gated lights, `I4` dihedral corner AO, and `interiors.json` v2 exports for Godot `KInteriorsLight`. Re-baseline `core/engine/fingerprint.json` once after visual verification.
3. **`K3` (`M1` + `M4`) `[G data]` Master catalog smooth-normal promotion & batched foot grounding (`core/catalog/krator-furniture-core.js`, `krator-furniture-detail.js`, `core/furnish/50-core-furnish.js`):**
   - Promote smooth/curved catalog detail families (`lacquer`, `ceramic`, `gold`, `metal`, `bronze`, `nacre`, `obsidian`, `tile`) from `xy6` to `8-bit` (`xy8` on Web, `hemi-oct8` + `mipVariance` in Godot), eliminating specular stepping across all `1,696` catalog pieces (`53` builds).
   - Bake subtle foot-contact darkening (`0.76 .. 1.00` over local `y = 0 .. 0.18 m`) inside `KF.batch({indexed: true})` so every batched table, shelf, chest, and vessel grounds onto its floor in both engines at zero runtime cost; fix `rec.scale == null ? 1 : rec.scale` in `50-core-furnish.js:65` and verify `core/furnish/fingerprint.py`.
4. **`K4` (`I1`–`I3`) `[G data]` / `[web]` Shared `KROOMLIGHT` Web host hook replacing copied `nlvTex` (`core/interiors/20-core-roomlight-host.js`):**
   - Extract Longsong's `uIndoorMask` + `room_light_tex` `KHOOK` shader layer (`89z-ls-atmos.js`) into `core/interiors/20-core-roomlight-host.js` so the four Yuni-lineage builds (`girder`, `yuni`, `locus`, `mavs-refuge`) and standalone kit sheets (`highlands`, `iziz-vernacular`, `xanadu`) can drop their pasted `nlvTex` copies onto one shared module.
5. **`K5` `[G native]` Godot opaque `library.gdshader` split (`godot/shaders/library.gdshader` + `library_cutout.gdshader`, `godot/krator/kmat.gd`):**
   - Remove unconditional `ALPHA = 1.0; ALPHA_SCISSOR_THRESHOLD = 0.0;` from `godot/shaders/library.gdshader` (moving `alpha_test > 0.0` materials onto a dedicated `library_cutout.gdshader`), restoring Godot's opaque depth prepass, hardware Early-Z rejection, and vertex-only shadow-map passes across **every** building kit and town in Godot (proven in Stage 7 `library_interior.gdshader`).

## 13. Sources

- Schott, Paris, Fournier, Guérin, Galin: [Large-scale terrain authoring through interactive erosion simulation](https://history.siggraph.org/learning/large-scale-terrain-authoring-through-interactive-erosion-simulation-by-schott-paris-fournier-guerin-and-galin) (TOG 2023); [code](https://github.com/H-Schott/StreamPowerErosion)
- Tzathas, Gailleton, Steer, Cordonnier: [Physically-based analytical erosion for fast terrain generation](https://diglib.eg.org/handle/10.1111/cgf15033) (CGF 2024)
- Cordonnier et al.: [Large scale terrain generation from tectonic uplift and fluvial erosion](https://diglib.eg.org/handle/10.1111/cgf12820) (CGF 2016)
- Dozier and Frew: [Rapid calculation of terrain parameters for radiation modeling from digital elevation data](https://ntrs.nasa.gov/citations/19910030222) (1990); the two sky-view definitions compared in [HORAYZON](https://gmd.copernicus.org/articles/15/6817/2022/) (2022)
- Mikkelsen: [Practical real-time hex-tiling](https://jcgt.org/published/0011/03/05/paper.pdf) (JCGT 2022)
- three.js: [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html); [compressed texture arrays, forum](https://discourse.threejs.org/t/is-it-possible-to-have-a-texture-array-of-compressed-textures/16213)
- The two input documents' own references (Fischer et al. 2022, Tatarchuk 2006, Stewart 2014, the GLSL ES 3.00 and OpenGL ES 3.0 specifications, Godot's Environment and SDFGI pages).

Not read in full in this pass: the Tzathas and Schott papers' method sections (the PDF did not extract). The update in T2
is derived here from the stream power law, not quoted from them.
