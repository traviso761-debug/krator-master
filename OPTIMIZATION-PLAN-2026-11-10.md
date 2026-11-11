# Krator Optimization Analysis & Implementation Plan (2026-11-10)

Companion second-opinion audit and locked implementation plan for `heaviest-pages-2026-11-10.md`, targeting both the self-contained Three.js r128 pages and the open-world map painter (`core/world/`, `openworld/isle-demo/`, and the Godot 4 Forward+ port) while preserving `VISUAL-BAR.md`, `README.md` ("CORE MODULES ARE NOT OPTIONAL"), `[G data]` / `[web]` / `[draw]` separation, `core/tags` UIDs, click-to-inspect, and deterministic `BIO.fn.rng` / `KRAND` placement streams.

---

## 1. Hardware Profile, Measurement Reconciliation & Locked Decisions

### 1.1 GPU Bottleneck Profile: Vertex-Transform & Submission Bound
Empirical A/B measurements in `biomes/nhighlands/PERF.md` (L27–35, L95–116) and `GRAPHIC-LOAD.md` establish what actually governs frame time across both Three.js WebGL2 (especially on integrated Intel Arc 140T) and Godot 4.7 Forward+:

1. **Vertices & instances, not pixels:** Halving render resolution (`pixelRatio = 0.5`, 25% pixels) saved only ~10% frame time, and replacing custom wind/iridescence shaders with plain `MeshLambertMaterial` saved only 10–15 ms out of a 70 ms frame. Conversely, welding 18-vertex 3-card foliage clumps down to 12 indexed vertices (`BIO.INDEX_ITEMS = true`) immediately cut GPU frame time by **17–18%** with identical pixels.
2. **Submission & material-state overhead on settlements/sheets:** While single-biome foliage pages sit at 50–360 draw calls, multi-kit biomes (`ringisles` 811, `nwbay-caverns` 880, `dambasins/port` 894), settlements (`pinnacle-rock` 1,857, `erewhon` 1,528, `voth-city` 1,047, `iziz` 923), cultural fauna sheets (`590–972`), and unbatched interior/catalog galleries (`17,397–47,108`) hit severe WebGL/driver draw-submission and shader-program switching walls.
3. **Engine-portable geometry budget:** Submitting 20M–35M unculled vertices costs nearly the same hardware vertex-transform budget in Godot 4 `MultiMeshInstance3D` as in Three.js `InstancedMesh` unless spatial frustum culling, per-instance distance culling, vertex indexing, and HLOD are baked into the shared core and export pipeline.

### 1.2 Why `max triangles drawn > scene triangles` Across `heaviest-pages-2026-11-10.md`
Over half of the heaviest pages report `renderer.info.render.triangles` (`max triangles drawn`) exceeding `scene triangles`. Code inspection reveals three distinct mechanisms:

1. **Probe Census Omissions (`BIO.totals()` and `TSTAT.by`):**
   - On biome pages, `tools/harness.py` reads `_api.totals.tris` from `BIO.totals()` (`core/biome/10-core-head.js` L159), which sums only `BIO.stats` passes and omits all `userData.host` / `probeSkip` geometry:
     - `GROUND` + fine `GROUND_PATCH`es (`0.42M–2.20M` tris; e.g. `1.68M` on `throne-vents.html`, `2.0M` on `swhighlands-span.html`).
     - `KSTACKS.mounds`: **362 sculptural termite mounds at `step: 0.8` = `2.19M` host triangles** on `crater-drylands-edge.html` (`biomes/crater-drylands/stations/edge/86-host-edge.js` L18–28), explaining `22.23M` drawn vs `19.5M` scene.
     - `WATER` CDLOD grids (`~1.05M` tris across 3 lakes on `riftrim-lakes.html`), `KFAR` (`35k–90k` tris), `KCAVERN`/`KSPELEO` (`1.5M–2.0M` tris on `nwbay-caverns.html`), and `KratorFauna`.
     - **Entire settlements** on `pinnacle-rock.html` (`settlements/pinnacle-rock/src/99-host-take.js` L58: `1.1M` `BIO.totals` vs `4.08M` drawn) and `longsong.html` (`settlements/longsong/src/99-host-take.js` L136).
   - On settlement/kit pages, `TSTAT.by` omits unbridged `BIO.bake()` flora (`~15M–16M` `XANADU` tris on `erewhon.html`, `~5.4M` `NSEMIARID` floor tris on `dambasins/graveyard.html` where `scene triangles` reports `0.6M` vs `6.06M` drawn, `4.1M` `NHL` tris on `roketstad.html`), `KratorFurniture` batches (`~255k` tris on `talia.html`), and raw `new THREE.Mesh` palace rooms + 6,419 furniture pieces in `IZPALDRAW.draw()` (`settlements/iziz/src/78r-palace-draw.js` L393–412) on `iziz-palace.html` (`0.3M` reported vs `3.03M` drawn).
2. **Always-On Directional Shadow Map Passes (`2×` Draw Calls & Caster Triangles):**
   - `renderer.info.render` accumulates across **both** the directional shadow pass and the main camera pass.
   - Shadows start ON at load on `pinnacle-rock.html` (`KSHADOW` `2048²` `±520 m`, `99-host-take.js` L48), `voth-city.html` (`sun.castShadow = true` `4096²` `±1900 m`, `settlements/voth/src/50-site-scene.js` L15–17), and `jimjam-kit.html` (`JJ_SUN.castShadow = true`, `settlements/jimjam/src/90-scene.js` L26–30).
   - Conversely, `locus.html`, `mungo.html`, and `yuni.html` gate `sun.castShadow` on `!FAST` (`!navigator.webdriver`, e.g. `settlements/mungo/src/20-stage.js` L11–40), so interactive browser users pay ~`2×` the headless numbers in the table.
3. **The `verify.py --all-views` `#shadow-btn` & `#boundsBtn` Click Bug:**
   - `core/shadow/host/12-core-shadow-host.js` (L94) appends `<button id="shadow-btn">shadows: off</button>` inside `#ui`. Only `biomes/throne/verify.py` (L240) and `biomes/xanadu/verify.py` (L190) filter `:not([id$=-btn])`. Every other biome's `verify.py --all-views` clicks **every** `#ui button` in DOM order, toggling shadows ON mid-sweep and doubling all subsequent views:
     - `farside.html`: `~10.8M` → **`19.93M` tris**; `farside-front.html`: `~185` → **`357` draw calls**.
     - `nsemiarid.html`: `~215` → **`427` draw calls** (`16.80M` drawn vs `15.5M` scene).
     - `scablands/highline.html`: `~150` → **`300` draw calls** (`15.21M` drawn vs `14.1M` scene).
     - `dambasins/port.html`: clicks `#boundsBtn` (`+23` wireframe `Box3Helper` draws).

---

### 1.3 Owner-Locked Architectural Decisions

1. **Decision #1 (`BIO.range == null` Policy — Option 1A + Diagnostic Check):**
   - **Adopt Option 1A universally in `BIO.bake()` (`core/biome/20-core-kit.js`):** Always compute rotation-safe r128 `im.geometry.boundingSphere`s (`im.frustumCulled = true`) on every `InstancedMesh`, and spatially split heavy `BIO.range == null` items (`it.count * def.tris >= 25,000`) into `1200 m` frustum chunks (keyed by `BIO.owner || [x, z]`, keeping `lod: null` so `test-lod.js` and `BIO.attachAudit` stay intact; coalesced cleanly on boxed tile exports in `42-core-export.js`).
   - **No silent core distance cutoffs (skip Option 1B):** Because kits intentionally use `BIO.range = null` for horizon-permanent features (`hoodoos` in `60-biome-sedesert-floor.js` L171, boulders, `lv=0` impostors) and unpaired hero trees would pop into bare hillsides or fail `attachAudit`'s `outrange` check, core will **not** invent arbitrary distance cutoffs. Instead, the probe will flag any item with `> 100k` instances and `BIO.range == null`, and paired `BIO.range` + impostor/ground-paint handoffs will be wired explicitly per kit.
2. **Decision #2 (Promote `ISLE_ATLAS` + 4-Tier HLOD into `core/world/`):**
   - Promote `openworld/isle-demo/src/88a-world-atlas.js` (`DataTexture2DArray`) and `88t-world-towns.js` (`< 150 m` `ISLE_ATLAS`, `150–350 m` & `350–800 m` vertex-clustered `bakeMat` proxies, `> 800 m` lot massing + `bounded(im)`) into `core/world/` (`88-world-towns.js`, `88s-world-sites.js`), and reuse on multi-site settlement pages (`pinnacle-rock.html`).
3. **Decision #3 (Copy & Generalize Iziz `95i` Lazy Per-Cell Interiors Across Settlements):**
   - Generalize `settlements/iziz/src/95i-iziz-interiors.js` (`NEAR_R = 85`, `NEAR_CELL = 100`, `PER_FRAME = 2`, `> 60 m` AGL hide, `KratorFurniture.batch({indexed: true})`) into a shared `core/furnish/` streamer—keeping each `100 m` cell's flushed meshes in its own frustum-culled cell group rather than folding visited cells back into one city-wide mesh—and adopt across `roketstad`, `verge`, `erewhon`, `ys` (inner shells + internal stairs), `iziz-palace`, `longsong`, `dalab`, and `girder`.
4. **Decision #4 (Batched Showcase Sheets with Triangle-Range Inspect):**
   - Batch showcase adapters (`IX.catalogAdapter` and `KratorFurniture._buildInstance`) on `interiors-sets`, `ancients-interiors`, `interiors-walk`, `interiors`, and `catalog` through `KratorFurniture.batch({indexed: true})`, storing `{tri0, tri1, rec}` ranges on merged meshes so raycast `faceIndex` resolves the exact clicked piece.

---

## 2. Systemic Core & Open-World Root Causes

### 2.1 `core/biome/20-core-kit.js` & `34-core-impostor.js`
1. **Failure Mode A (`BIO.range == null` → Unchunked `frustumCulled = false`):** At `20-core-kit.js` L537–548, any item with `BIO.range == null` bakes into a single map-wide `InstancedMesh` with `im.frustumCulled = false`, transforming 100% of map instances even behind the camera (`throne`, `crater-drylands`, `shighlands`, `copperglacier`, `farside`, `ringisles` native + 4 kits, `sedesert-mantis` floor/gardens, `riftrim`, `nsemiarid`, `scablands/highline`, `dambasins/graveyard`, and `lv=0` blobs in `xanadu`/`nhighlands`).
2. **Failure Mode B (`e.ranges.length > 3` Bailout in `_lodFadeBake`):** `BIO.LODFADE_GLSL` (L432–457) packs at most 3 ranges into `aLodB.w, aLodC.y, aLodC.w`. When a merged `1200 m` chunk holds 4+ distinct ranges (`rift` has 5: `650/800/1200/1300/1600`; `xanadu` has 4: `600/900/1200/2400`; `nhighlands` has 4: `650/800/1100/1300`), L481 sets `e.fade = false`, silently disabling **both** cross-fade dithering and per-instance `_lcull`! Furthermore, L435 gates `_lcull` on `uLodF > 0`.
3. **Failure Mode C (`BIO.owner` Disabling Per-Instance `_lcull`):** Setting `BIO.owner` on tree crown cards sets `e.loose = false` (L553), skipping `_lcull` (L451) so 100% of crown cards in a `1200 m` chunk draw out to `range + 1200*sqrt(2) ≈ range + 1,697 m`! Worse, one owned placement in a merged chunk marks unowned instances `loose = false` too. Storing the **owner tree's `(rootX, rootZ)`** in a 1-slot `InstancedBufferAttribute` `aLodI` (`vec4(rootX, rootZ, minRange, range)`) solves both Failure Mode B and Failure Mode C simultaneously.
4. **`BIO.INDEX_ITEMS = false` Default (L61, L140):** Calls `geo.toNonIndexed()`, inflating every 4-vert quad to 6 verts (`+50%` vertex shader cost) and smooth lathes by `3×–5×`. (Must patch `NURSERY.harvest()` in `core/world/84-world-nursery.js` L62 first, which currently ignores `geo.index`!)
5. **`34-core-impostor.js` Exposure & Adoption:** Fixing the ~`4×` dark capture exposure in core (worked around via `IMP_GAIN = 2.2..3.6` in host builds) lets remaining 56–256-tri `IcosahedronGeometry(1, 1)` `lv=0` blobs (`ringisles`, `xanadu`, `nhighlands`, `rift`, `throne`) switch to 2-tri `BIO.impostorSet` octahedral quads.

### 2.2 `core/world/` Open-World Painter
1. **`84-world-nursery.js`:** `harvest()` (L62) ignores `geo.index` and outputs unwelded `BufferGeometry` soup; `worldMat()` (L42–52) strips `ShaderMaterial` (`34-core-impostor`); and when `K.grow(T, 0)` returns `null` (`throne` `elfin` duplicate-key bug at `50-biome-throne-species.js` L139–140 + 4 `far: null` species) or delegates to `lv=1` (`SWHI.grow(T, 0)` at `57:145`), `85-world-flora.js` L144 (`g[lv] || g[1]`) instances **3D `lv=1` trees out to 2.5–7 km**! Also `NHL.grow` (`nhighlands/src/55:649`) lacks a local `reseed` and collides at `(0, 0)` in `NHL.FUNNELS`.
2. **`85-world-flora.js` & `86-world-floor.js`:** `ensure()` (L125) sets `m.frustumCulled = false`; `FLORA.draw()` (L135–151) recomputes 360° of matrices on the CPU and uploads `p.attr.needsUpdate = true` **every frame** even when the camera hasn't moved; `VARIANTS = 4` (`2` suffices at `lv=1`, `1` octahedral card at `lv=0`); `FLOOR.build()` (`86-world-floor.js` L48–53) emits unindexed triangle soup per 128 m chunk.
3. **`88-world-towns.js` & `88s-world-sites.js`:** `TOWNS_DRAW` loads full `.ktile` cities at `NEAR = 30,000 m` with `o.frustumCulled = false` (L80) and zero HLOD; `SITES_DRAW` switches to multi-material `isleProto` at `FULL = 3,500 m` without `bounded(im)` or `ISLE_ATLAS`.

### 2.3 `kbake`, `core/lod/09-lod.js`, `KratorFurniture`, `KratorFauna` & `30-geo.js`
1. **`kbake()` (`src/30-kit.js`):** Unconditionally calls `def.mat.clone()` per chunk × item (`1,435` materials on `erewhon.html`) and sets `im.frustumCulled = false`.
2. **`core/lod/09-lod.js`:** `pins()` (L110–118) pins all `cnt[e] === 1` open material-boundary edges, causing architectural `buildLevel` clustering to fail the `> .85` threshold (L226); `instFar` (L235–237) doubles draw calls per qualified `InstancedMesh`; omitted completely on `voth-city`, `ys`, and `verge`.
3. **`KratorFurniture` (`core/catalog/`):** `Batch` (`krator-furniture-runtime.js` L75) defaults `indexed: false` (`2×–4×` vertex bloat) and omits `computeBoundingSphere()`; `mkPillow` (`krator-furniture-core.js` L262, `_seg(12, 8)` = **672 tris**) and `mkBolster` (L319, `_seg(16, 12)` = **448 tris**) are over-tessellated `4×`.
4. **`KratorFauna` (`kits/fauna/fauna-lands-host.js`, `kits/desert-nomads/src/56-sa-beasts.js`):** Spawns 10–28 individual `THREE.Mesh` limbs per animal (`500–900+` draw calls on beast-heavy pages).
5. **`core/engine/30-geo.js`:** `cord` (L189) and `sagRope` (L191) omit `open = true` on `tube()`, adding 10 unseen end-cap triangles per rope.

---

## 3. Biome-by-Biome Audit Summary

- **`ringisles` (`ringisles-high.html` `811` dc / `27.00M`, `ringisles.html` `784` dc / `26.87M`, `ringisles-lagoon.html` `256` dc / `17.04M`):**
  - `src/88-host-build.js` instantiates 9 separate `BIO.kit()` registries (`ringisles` + 8 borrowed kits); 4 kits chunk at `1200 m` (`~380` IMs) while native `RINGISLES` + 4 kits leave `BIO.range = null` (`100%` unculled).
  - `src/55-biome-ringisles-trees.js` (L218–245) builds custom 80-tri `IcosahedronGeometry(1, 1)` `farBlob`s (`~2.2M` unculled tris) instead of `BIO.impostorSet`.
  - `src/60-biome-ringisles-floor.js` (L26–38) places 210-tri `brain` coral (`14 × 8` lathe) and 110-tri `strom` with `BIO.range = null`, plus 22 separate `WATER.still` terrace pools, `0.8 m` bench ground (`405k`t), and ~57 uninstanced fauna (`src/89f-host-fauna.js`, `+140` dc).
- **`throne` (`throne-cloud.html` `24.97M`, `throne-vents.html` `21.32M`, `throne.html` `20.56M`, `throne-savanna.html` `17.90M`, `throne-ash.html` `17.86M`):**
  - `BIO.INDEX_ITEMS = false` and `BIO.range = null` across all passes (`450k` unindexed 18t `mossclump` = `8.1M`t on `cloud`).
  - `src/50-biome-throne-species.js` L139–140 overwrites `elfin`'s `far: {...}` with duplicate key `far: null`.
  - `src/60-biome-throne-floor.js` (L32–78) defines unindexed high-seg `G.lathe` fungi/corals: `gcoral` (`576`t), parasol `cap` (`560`t), `brain` & `mossdome` (`480`t), `puff` (`450`t); `throne-vents` uses `GN = 880` (`1.68M`t ground).
- **`crater-drylands` (`crater-drylands-edge.html` `22.23M`, `crater-drylands.html` / `-n.html` `18.84M`):**
  - `BIO.INDEX_ITEMS`, `BIO.LOD`, and `BIO.range` all off; `904k` `bloom` carpet along 12-fire spine on `edge`; **362 `KSTACKS.mounds` at `step: 0.8` = `2.19M` host tris** (`stations/edge/86-host-edge.js` L18–28).
- **`farside` (`farside.html` `19.93M`, `farside-front.html` `357` dc / `9.53M`):**
  - `verify.py` clicks `#shadow-btn` (`2×` tris/draws); `INDEX_ITEMS = false`, `BIO.range = null`; dense sculpted floor solids in `src/60-biome-farside-floor.js` (`rim` `343`t every `1.6 m`, `crust` `252`t, `staghorn` `204`t, `bladder` `56`t × 40–100/kelp stand).
- **`swhighlands` (`swhighlands-span.html` `19.71M` / `29.0M` scene, `rainwall` `17.62M`, `pillars-span` `240` dc / `16.83M`, `pillars` `16.78M` on `159k` inst):**
  - Sculpted hero prototypes used at all ranges: `celllamp` (**`3,418` tris/inst**, `src/59-biome-swhighlands-lamps.js` L31–35), `beadcoral` (**`1,114`t**), `trumpets` (**`654`t**), `torch` (`288`t), `wingreed` (`240`t × 3–8/cell, `src/57-biome-swhighlands-pillars.js` L62–78); `SWHI.grow(T, 0)` builds `lv=1` (L145); `stations/span/87-host-kin.js` (L21) hardcodes `lv=2` on `SWLOW` madrones; `2.0M`t ground on `span`; `+201` unmerged `SPAN_FROZEN`/`SPAN_MASSING` preview meshes on `pillars-span` (`89y-preview-span.js` L11–35).
- **`shighlands` (`shighlands.html` `159` dc / `19.26M`, `conifers` `16.99M`) & `ehighlands` (`15.81M`):**
  - `BIO.LOD` configured in stage, but `BIO.range` is never set (`lodMeshes = 0`, 100% unculled); `volute` (`954`t item, `6.8k–12.8k`t/tree), `cereus` (`448`t), `albuca` (`252`t placed even in `lv=0` far floor in `src/60-biome-shigh-floor.js` L145–175); ~89 unbatched `MIST` sprites/planes in `84-host-mist.js` (L119–136).
- **`rift` (`17.98M` drawn / `35.7M` scene / `361` dc), `xanadu` (`40.8M` scene on `cloud`, `16.06M` `descent`, `344` dc), `nhighlands` (`30.8M` scene, `2.75M` inst):**
  - Hit Failure Modes B (`4–5` ranges > 3) & C (`BIO.owner` `e.loose = false` across `1200 m` chunks) + 3D `lv=0` blobs (`BIO.range = null`); `xanadu/stations/cloud/87-host-cloud.js` (L37–38) grows ~9,600 cousin trees at hardcoded `lv=2`; `nhighlands` `nfunnel` uses `seg = 36` (`~84 MB` wood buffer).
- **`riftrim-lakes.html` (`17.64M` on `150k` inst), `sedesert-mantis.html` (`17.22M`), `copperglacier-pass.html` (`15.11M`):**
  - `riftrim`: **720-tri `G.lens` (`~10M` unculled tris)** in `src/60-biome-riftrim-floor.js` + `1.05M`t across 3 CDLOD lakes + `BIO.range = null`.
  - `sedesert-mantis`: Station overrides `stations/bowl/66-biome-sedesert-halo.js` (L110–140), `stations/mantis/67-biome-sedesert-pocket.js` (L23–55), and `stations/mantis/88-host-build.js` (L45–54) omit `BIO.range` on ~`1.25M` floor/garden instances (`230.8k` `grass`, `113.9k` `rankgrass`, etc.).
  - `copperglacier-pass`: `src/60-biome-copperglacier-floor.js` leaves `BIO.range = null` on 90t `cushion` (`6 m` grid) and 80t `Icosahedron(1, 1)` `stone` (`5 m` grid).
- **High-Draw-Call Biomes:**
  - `dambasins/port.html` (`894` dc) & `graveyard.html` (`472` dc, `6.06M`t): `DBW.draw` (`src/50-db-wrecks.js` L94–115) emits 4–10 unmerged `THREE.Mesh`es per stranded boat (`~450–650` draws across shared 4 materials) + `pbFlush()` in port item loop + `#boundsBtn` click + unculled `5.4M`t `NSEMIARID` floor on `graveyard`.
  - `nwbay-caverns.html` (`880` dc, `13.21M`t) & `godthrone-tube.html` (`635` dc): `500–615` unmerged `16–24 m` `KCAVERN` meshes (`stations/caverns/89x-host-caverns.js`, `stations/tube/87-host-tube.js`) + 25–45 `WATER.drawStill` cave pools drawn simultaneously with the surface.
  - `ancientsvalley.html` (`662` dc): 46 cloned multi-mesh Ancient hero towers (`src/70-host-city.js`) lacking `KSHELL` on 14 `MP.DESIGNS` + `BIO.LOD.merge = false`.
  - `hyperjungle-savage`/`-north` (`482`/`462` dc) & `swbay.html` (`388` dc): `FAUNALANDS.draw` multi-mesh animals + `chunk = 300 m` across multiple kits + 37 individual hydrothermal smoke spheres on `swbay`.


---

## 4. Settlements & Open-World Sites Audit Summary

| Settlement Page | Peak Draws / Drawn Tris | Primary Code Bottlenecks | Expected Post-Fix Load |
|---|---:|---|---:|
| `settlements/pinnacle-rock/dist/pinnacle-rock.html` | `1,857` dc (#1!) / `4.08M` (`1.1M` reported) | ~800 duplicated `isleProto` IMs across 5 sites + 2 biomes + always-on `KSHADOW` (`±520 m`) `2×` pass (`src/99-host-take.js` L48–58) | `~180–240` dc / `1.9M` |
| `settlements/xanadu/dist/erewhon.html` | `1,528` dc / `35.14M` (`21.8M` reported) | 12 chunks × `kbake` `def.mat.clone()` (`1,435` mats, `frustumCulled=false`, `range=1700m`) + unconditional hollow Pleasure Domes (`78`/`78d`) & 9 Citadel Palaces (`78m`/`78n`) + 360t `XDOME` + `~16M`t unbridged `XANADU` flora (`targets/erewhon/90b-er-build.js` L45–95) | `~260–340` dc / `7–9.5M` |
| `settlements/voth/dist/voth-city.html` | `1,047` dc / `34.88M` (`41.0M` scene) | No `core/lod`, 3,147 unculled IMs (`core/city/52-city-host-buildings.js` L17–62: 3 LODs × 4 mats/lot) + always-on `4096²` `±1900m` `sun.castShadow` (`src/50-site-scene.js` L15–17) | `~160–220` dc / `6–8M` |
| `settlements/ys/dist/ys.html` (`kit.html` `4.26M`) | `199` dc / `29.77M` (`28.7M` scene) | No `core/lod`, city-wide `hykFlush` (`frustumCulled=false`), unconditional inner+outer shells in `src/61-hyk-shell.js` (`hykPod` `6,720`t, `hykConch` `10,400`t, `hykLip` `448`t/opening) + 324 internal spiral stairs | `~170` dc / `5.5–7.5M` |
| `settlements/iziz/dist/iziz.html` (`iziz-ixtest` `585` dc, `iziz-palace` `3.03M`) | `923` dc / `5.86M` | Unchunked `kbake` (`frustumCulled=false`, `def.mat.clone()`) + `09-lod` `instFar` `2×` IM splits; `95i` L189–190 `fam` `join()` folds visited cells into city-wide mesh; `iziz-palace`: 227 raw `THREE.Mesh` rooms + 6,419 furn in `src/78r-palace-draw.js` L393–412 | `~210` dc / `2.8M` (`palace`: `0.7M`) |
| `settlements/verge/dist/verge.html` & `settlements/highlands/dist/roketstad.html` | `620` / `537` dc, `12.49M` / `12.42M` | `verge`: no `core/lod`, 2,661 hollow buildings + `2.3M`t escarpment; `roketstad`: 1,797 hollow buildings + `3.35M`t global unindexed furniture + `4.1M`t `NHL` flora | `~180` dc / `4–5.5M` |
| `longsong`, `dalab`, `locus`, `mungo`, `yuni`, `jimjam-kit`, `hook` | `432–579` dc / `1.07–8.80M` | Eager interiors (`longsong`, `dalab`), `!FAST` shadow gate (`locus`/`mungo`/`yuni`, e.g. `settlements/mungo/src/20-stage.js` L11–40), `REEDKIT` +190 IMs (`mungo`), `JJ_SUN` shadow + uninstanced `jjArch`/`jjPorthole` (`jimjam/src/90-scene.js` L26–30), `pbFlush()` inside 29-item loop (`kits/port/src/90-scene.js` L80 on `hook`) | `~75–190` dc |

---

## 5. Building Kits, Interiors, Catalog & Fauna Sheets Audit Summary

- **Interior & Catalog Showcase Galleries (`interiors-sets.html` `47,108` dc, `catalog.html` `43,032` dc, `ancients-interiors.html` `17,397` dc, `interiors-walk.html` `3,370` dc, `interiors.html` `2,148` dc):**
  - `IX.catalogAdapter` and `KratorFurniture._buildInstance` (`core/catalog/krator-furniture-core.js` L1158) spawn 5–25 individual `THREE.Mesh`es per furniture piece with unmerged hex materials instead of `KratorFurniture.batch({indexed: true})`, allocate uncached room-shell materials, build duplicate cutaway shells on `interiors-sets` / `interiors-walk`, and add ~1,000 individual `CanvasTexture` label planes on `catalog.html`.
- **Fauna & Cultural Beast Sheets (`fauna.html` `2,369` dc, `desert-nomads.html` `972` dc, `scyvoi.html` `753` dc, `islanders.html` `591` dc / `2.10M`t, `ash-nomads.html` `590` dc):**
  - 90%–94% of draw calls on the four cultural kits and `fauna.html` come from uninstanced `KratorFauna` / `kits/desert-nomads/src/56-sa-beasts.js` articulated limb meshes (10–28 `THREE.Mesh`es × 30–40 beasts) + unmerged tack; `islanders.html` also pays capped `sagRope` ends (`30-geo.js` L191) and unindexed weave cards.
- **Classical, Ancients & Cavern Kits:**
  - `talia.html` (`3.25M`t) & `pylon.html` (`1.14M`t): `kbake` `frustumCulled = false`, 316–508t columns, 120t `TABAL` balusters, 336t `PYRING` rings, and ~255k unindexed furniture tris.
  - `ancients/dist/iziz-style.html` (`836` dc) & `ancients-kit.html` (`355` dc, `14.6M` scene): `kits/ancients/src/77z-iziz-style.js` `wreck()` de-instances rubble into individual `THREE.Mesh`es, `tripodMarket` spawns ~570 unmerged meshes, 93 awnings clone materials, and `ancients-kit` instances 422k fine filigree parts without a mid-distance baked card LOD.
  - `zeijani.html` (`460` dc, `1.57M`t) & `post-apoc.html` (`30` dc, `1.26M`t): `kits/zeijani/src/40-zj-cave.js` emits ~350 unmerged `16 m` `KCAVERN` rock meshes + `712k`t unindexed furniture; `post-apoc` needs `BIO.weldGeo` on non-indexed rubble/rebar.

---

## 6. Execution-Ready Implementation Plan

### 6.0 Non-Negotiable Three.js r128 & Repo Invariants

1. **r128 `InstancedMesh` Frustum Culling (`im.geometry.boundingSphere`):**
   - Three.js r128 has **no** `InstancedMesh.boundingSphere` (added in r151); `WebGLRenderer` tests **`im.geometry.boundingSphere`** (as seen in `core/lod/09-lod.js` L180, L216 and `openworld/isle-demo/src/88t-world-towns.js` L124–129).
   - Note that `88t`'s `bounded()` adds unrotated `gs.center.x/y/z`, which under-bounds rotated asymmetric prototypes. Always compute a rotation-safe radius: cache unit sphere `s0` on `g0.userData.baseSphere`, let `rProto = s0.center.length() + s0.radius`, clone/wrap a lightweight `BufferGeometry` sharing the prototype's `BufferAttribute`s, set `geo.boundingSphere = new T.Sphere(centroid, maxDist + rProto * maxScale + reach + swayPad)`, and set `im.frustumCulled = true`.
2. **r128 `USE_INSTANCING_COLOR` Shader Cache Key Collision (`core/world/88-world-towns.js` L73–75):**
   - Three.js r128 omits `instanceColor` presence from its internal program cache key! Sharing one `Material` object between an `InstancedMesh` with `instanceColor` and one without crashes WebGL (`null instanceColor`).
   - When deduplicating `kbake()` materials in `30-kit.js`, maintain **two** cached variants per definition: `def._imMat` (no `instanceColor`, `customProgramCacheKey` suffix `'|im'`) and `def._imColMat` (`color: 0xffffff`, suffix `'|imCol'`).
3. **WebGL2 16-Attribute-Slot Ceiling (`core/biome/20-core-kit.js` L480):**
   - `InstancedMesh` consumes 5 attribute slots (`instanceMatrix` = 4 + `instanceColor` = 1) plus up to 6 geometry/foliage slots (`position`, `normal`, `uv`, `color`, `aN`, `aC2` = 11 slots), leaving **5 vec4 slots** below WebGL2's 16-slot limit. Replacing the 3-slot `aLodA/B/C` attributes on instanced meshes with a single 1-slot `InstancedBufferAttribute` `aLodI` (`vec4(rootX, rootZ, minRange, range)`) uses **12 slots total** (`-2` slots vs current!).
4. **Zero Placement-Stream Drift (`BIO.fn.rng`, `KRAND`) & Green Test Suites:**
   - Never add or reorder RNG draws inside placement loops (`make`, `BIO.grid`, `grow` placement branches). Any new `_mid` prototype helper built inside `BIO.def` must save and restore `BIO.fn.rngState()` (`core/biome/10-core-head.js` L161).
   - Keep `BIO._lodKey(x, z) === null` when `BIO.range == null` so `core/biome/test-lod.js` (L68) and `BIO.attachAudit` (`20-core-kit.js` L615–670) pass with zero regressions.

---

### Phase 0: Measurement & Verify Harness Parity

#### 0.1 Fix `verify.py` UI Button Sweep (`#shadow-btn` & `#boundsBtn`)
- **Files:** All `biomes/*/verify.py` scripts not yet matching `biomes/throne/verify.py` (L240) / `biomes/xanadu/verify.py` (L190), plus any shared button selector in `tools/harness.py`.
- **Change:** Restrict view-preset button discovery to `#ui button:not([id$=-btn]):not(#boundsBtn)` so `<button id="shadow-btn">` (`core/shadow/host/12-core-shadow-host.js` L94) and `#boundsBtn` are never clicked during `--all-views`.
- **Effect:** Immediately eliminates artificial `2×` shadow-pass spikes on `farside.html` (`19.93M` → `~10.5M`), `farside-front.html` (`357` → `~182` dc), `nsemiarid.html` (`427` → `~215` dc), `scablands/highline.html` (`300` → `~150` dc), and `dambasins/port.html` (`-23` wireframe draws).

#### 0.2 Add `_api.sceneCensus()` & `BIO.unrangedReport()` Diagnostics
- **Files:** `core/host/95-host-probe.js` (L53–67), `core/biome/20-core-kit.js` (L531–573).
- **Change:**
  1. Preserve existing `_api.totals` semantics (so `showcase-triangle-budget` thresholds stay stable) and expose `_api.sceneCensus()` traversing `scene` to report `{bio, tstat, ground, water, stacks, caverns, furniture, fauna, otherHost, shadowEnabled}`.
  2. Add non-throwing `BIO.unrangedReport()` in `20-core-kit.js` listing baked items with `count > 100,000` and `BIO.range == null` so kit authors can pair explicit `BIO.range` + stand-ins cleanly.

---

### Phase 1: Core Zero-Look-Change Multipliers

#### 1.1 Index-Safe `NURSERY.harvest()` + Global `BIO.INDEX_ITEMS = true`
- **Files:** `core/world/84-world-nursery.js` (L59–88), `core/biome/20-core-kit.js` (L61).
- **Changes:**
  1. In `NURSERY.harvest()` (`84-world-nursery.js` L62–72), read `const IX = geo.index ? geo.index.array : null, nv = IX ? IX.length : geo.attributes.position.count;` and resolve `const v = IX ? IX[k] : k;` before reading `P`, `N`, `U`, `VC`. For non-`anchor` nursery geometries (L80–85), run `geo = BIO.weldGeo(geo)` after attribute construction (`anchor` floor patches retain parallel `userData.anchor` until `86-world-floor.js` welds them in Phase 2).
  2. In `20-core-kit.js` L61, change `BIO.INDEX_ITEMS = false;` → `BIO.INDEX_ITEMS = true;` (honoring per-item `{indexed: false}` at L140).

#### 1.2 Option 1A: Auto Frustum-Chunking & r128 `geo.boundingSphere` in `BIO.bake()` + Tile Coalesce in `42-core-export.js`
- **Files:** `core/biome/20-core-kit.js` (L531–573), `core/biome/42-core-export.js` (L131–168).
- **Changes:**
  1. Add `BIO.boundInstanced(im, def)` in `20-core-kit.js`: compute rotation-safe `im.geometry.boundingSphere` over `im.instanceMatrix.array` (`rProto = baseSphere.center.length() + baseSphere.radius`, `reach = _lodReach(def)`, `swayPad = 4.0`) and set `im.frustumCulled = true` on **every** `InstancedMesh` emitted by `BIO.bake()` (both ranged and unranged).
  2. For `BIO.range == null` items (`key === ''` at L537) where `idx0.length * def.tris >= 25000`:
     - Partition `idx0` into `C = BIO.LOD.chunk || 1200` metre spatial cells keyed by `o = it.o[i] || [IM[i*16+12], IM[i*16+14]]` (coarsening `C` by `2×`/`4×` if average cell tris `< 8,000`).
     - Emit one `InstancedMesh` per non-empty cell with `BIO.boundInstanced(im, def)` and `im.userData.frustumChunk = cellKey`, keeping `im.userData.lod = undefined` and **not** pushing to `BIO.lodMeshes`.
     - Apply the same `>= 25,000`-tri spatial cell split to `key == null` `BIO.bucket` wood/rock meshes at L557 so trunks and foliage stay co-chunked.
  3. In `BIO.exportParts()` (`42-core-export.js` L131–138), when `opt.box` is set, coalesce `frustumChunk` meshes per `kit + '|' + name` before `instRec` so boxed `.biome.json` tile exports remain 1 record per item.

#### 1.3 Single-Slot `aLodI` Per-Instance Range & Cohesive Owner-Root Culling in `20-core-kit.js`
- **Files:** `core/biome/20-core-kit.js` (L432–483, L537–556), `core/biome/test-lod.js`.
- **Changes:**
  1. On ranged `InstancedMesh`es (`key != null`), replace the 3-slot `aLodA/B/C` attributes with a single 1-slot `InstancedBufferAttribute(new Float32Array(n * 4), 4)` named `aLodI` = `vec4(rootX, rootZ, minRange, range)`:
     - When `it.o[i]` (`BIO.owner`) is present, `(rootX, rootZ) = (it.o[i][0], it.o[i][1])`; otherwise `(IM[i*16+12], IM[i*16+14])`.
  2. In `BIO.LODFADE_GLSL` (L432–457), under `#ifdef USE_INSTANCING`, compute horizontal distance from `(aLodI.x, aLodI.y)` to `_lc.xz` (plus vertical box distance), compare against `_lm = aLodI.z * uLodS` and `_lr = aLodI.w * uLodS`, and set `_lcull = 1.0` (`gl_Position = vec4(0.0, 0.0, 2.0, 1.0)`) regardless of `uLodF > 0`, `e.ranges.length > 3`, or `BIO.owner`!
  3. Result: Owned canopy cards (`nhighlands`, `rift`, `xanadu`, `swhighlands`, `shighlands`) fade and cull cohesively with their trunk at `range` instead of `range + 1,697 m`, and chunks with 4–6 ranges never bail out of fade/cull.
  4. Fix capture exposure gain (~`4×` dark bake) directly in `core/biome/34-core-impostor.js` so kits no longer need manual `IMP_GAIN` overrides.

#### 1.4 `kbake()` 2-Slot Material Cache + `bounded(im)`, `KratorFurniture` Indexing & Open Ropes
- **Files:** `src/30-kit.js` across kits/settlements (`xanadu`, `iziz`, `jimjam`, `ancients`, `talia`, `pylon`, `port`), `core/catalog/krator-furniture-runtime.js` (L75, L166), `core/catalog/krator-furniture-core.js` (L262, L319), `core/engine/30-geo.js` (L189–191).
- **Changes:**
  1. **`kbake()`:** Cache `def._imMat` (`'|im'`) and `def._imColMat` (`'|imCol'`, `color: 0xffffff`) instead of cloning per chunk; compute rotation-safe `im.geometry.boundingSphere` (`im.frustumCulled = true`); auto-bucket unchunked `kbake` placements into `300 m` cells when `items.length * tris >= 15,000`.
  2. **`KratorFurniture`:** Default `this.indexed = this.opt.indexed !== false;` in `krator-furniture-runtime.js` L75 and call `geo.computeBoundingSphere()` in `flush()` (L166). Reduce `mkPillow` (`krator-furniture-core.js` L262) `_seg(12, 8)` → `_seg(6, 4)` (`672`t → `168`t) and `mkBolster` (L319) `_seg(16, 12)` → `_seg(8, 6)` (`448`t → `112`t).
  3. **`30-geo.js`:** Pass `open = true` in `cord` (L189) and `sagRope` (L191) (`tube(k, pts, r, 4, true)`).

---

### Phase 2: Open-World Map Painter, Lazy Interiors, Fauna Instancing & Showcase Batching

#### 2.1 Promote `ISLE_ATLAS` + 4-Tier HLOD into `core/world/` (Decision #2)
- **Files:** Promote `openworld/isle-demo/src/88a-world-atlas.js` → `core/world/87a-world-atlas.js` (`WORLD_ATLAS` + `ISLE_ATLAS` alias); update `core/world/88-world-towns.js`, `core/world/88s-world-sites.js`, `core/world/84-world-nursery.js`, `core/world/85-world-flora.js`, `core/world/86-world-floor.js`, and `settlements/pinnacle-rock/`.
- **Changes:**
  1. **`88-world-towns.js` & `88s-world-sites.js`:** Replace `o.frustumCulled = false` (L80) with rotation-safe `bounded(o)`; merge `< 200 m` static sector meshes via `WORLD_ATLAS.merge()` (`DataTexture2DArray` + `aLayer`); bake `200–450 m` and `450–900 m` vertex-clustered `bakeMat` proxies (from `88t-world-towns.js`); render lightweight lot massing `> 900 m` (reducing full `.ktile` load radius from `30,000 m` to `2,500 m`). Share one `WORLD_ATLAS` + `isleProto` pool across all 5 sites on `pinnacle-rock.html` (`1,857` → `~200` dc).
  2. **`85-world-flora.js`, `84-world-nursery.js` & `86-world-floor.js`:** Frustum-cull flora cells (`_frus.intersectsBox(cellBox)`) before CPU matrix packing; skip `FLORA.draw()` matrix rebuilds when camera delta `< 2 m` and `< 0.015 rad`; preserve `34-core-impostor` `ShaderMaterial` in `worldMat()` (`1` octahedral card at `lv=0`, `2` variants at `lv=1`, `4` at `lv=2`); emit indexed buffers in `FLOOR.build()` (`86-world-floor.js` L48–53).

#### 2.2 Generalize Iziz `95i` Lazy Per-Cell Interior Streamer into `core/furnish/` (Decision #3)
- **Files:** New `core/furnish/95-core-interiors-stream.js` (modeled on `settlements/iziz/src/95i-iziz-interiors.js` L148–214); wire into `iziz` (`95i`), `iziz-palace` (`78r`/`95p`), `highlands/roketstad`, `verge`, `xanadu/erewhon` (`78d-dome-interior.js`, `78m-muqarnas.js`, `78n-citadel-palace.js`), `ys` (`61-hyk-shell.js` inner shell + internal stairs), `longsong`, `dalab`, and `girder`.
- **Changes:**
  1. Keep non-cutaway interiors `bare: true` at load; populate `PER_FRAME = 2` buildings/rooms per frame within `NEAR_R = 85 m` horizontally (`±30 m` vertically on multi-storey towers/palaces) into per-cell (`NEAR_CELL = 100 m`) `KratorFurniture.batch({indexed: true})` groups.
  2. **Improvement over `95i` L189–190:** Keep each `100 m` cell's flushed `3–6` finish meshes in its own frustum-culled `cellGroup` (`geo.boundingSphere` set) rather than `join()`ing visited cells into one city-wide mesh; set `cellGroup.visible = false` when `distXZ > 180 m` OR `(camAGL > 60 m && !cutaway)`.
  3. Route `ys` inner shell walls / inner `hykLip` collars / 324 internal spiral stairs and `erewhon` indoor Pleasure Dome / Citadel Palace rooms & `XM_CELL` muqarnas vaults into the cell streamer so exterior shots draw **zero** indoor triangles.

#### 2.3 `KratorFauna` Articulated Part-Instancing
- **Files:** `kits/fauna/fauna-lands-host.js`, `kits/desert-nomads/src/56-sa-beasts.js`, `biomes/ringisles/src/89f-host-fauna.js`, `kits/fauna/`.
- **Changes:** Represent articulated animal skeletons with lightweight `THREE.Object3D` joints (updating `matrixWorld` only when inside frustum and `< 400 m`), pool each `(species, partId, matKey)` into one `DynamicDrawUsage` `InstancedMesh` (`im.count = visibleCount`), and pre-merge static tack/saddle/pack parts per mount variant.

#### 2.4 Batched Showcase Sheets with Triangle-Range Raycast Inspect (Decision #4)
- **Files:** `core/catalog/krator-furniture-runtime.js` (L146–214), `kits/interiors/`, `kits/ancients-interiors/`, `kits/catalog/`.
- **Changes:** Record `{tri0, tri1, rec}` in `b.ranges` inside `Batch.prototype.place`/`absorb`, attach `m.userData.triRanges` in `flush()` with binary-search helper `KratorFurniture.pickPlacement(hit)` (`hit.faceIndex` → `rec`), and batch showcase rows through `KratorFurniture.batch({indexed: true})` + cached room-shell materials + single-draw glyph/atlas label `InstancedMesh` (`47,108` & `43,032` draws → `< 180` draws).

---

### Phase 3: Surgical Kit, Biome & Settlement Passes

1. **`sedesert-mantis` (`17.22M` → `~5M` tris):** Add `const LF = SEDESERT.LOD || {}, BR = [LF.floor, LF.mid, LF.far]; BIO.range = BR[bi] || null;` in `biomes/sedesert/stations/bowl/66-biome-sedesert-halo.js` (L133), `stations/mantis/67-biome-sedesert-pocket.js` (L43–54), and `stations/mantis/88-host-build.js` (L46–53).
2. **`hook.html` & Port Kit (`432` → `~75` dc):** Move `pbFlush()` outside `for (const it of PORT_LAYOUT.items)` in `kits/port/src/90-scene.js` (L80) with triangle-range `PORT_OWN` pick lookup.
3. **`dambasins/port` (`894` → `~85` dc) & `graveyard` (`472` → `~65` dc, `6.06M` → `~1.8M`t):** Merge `DBW.draw` (`biomes/dambasins/src/50-db-wrecks.js` L94–115) into 4 shared material `BufferGeometry`s (`hull`, `deck`, `house`, `dark`) per `512 m` cell with `userData.probePoints`; set `BIO.range` on `graveyard`'s `NSEMIARID` floor.
4. **`riftrim-lakes` (`17.64M` → `~5M`t):** Step down 720-tri `G.lens` (`biomes/riftrim/src/60-biome-riftrim-floor.js`) to `176`t (`< 150 m`) / `48`t (`150–650 m`), set `BIO.range`, and use coarse `32 × 32` water planes on tarns `> 400 m` away.
5. **`xanadu-cloud` (`40.8M` → `~20M` scene) & `nhighlands` (`30.8M` scene / `84 MB` wood):** Gate cousin trees in `biomes/xanadu/stations/cloud/87-host-cloud.js` (L37–38) on `BIO.lodD(x, z)`; fix `NHL.grow` nursery `reseed` + `(0, 0)` `NHL.FUNNELS` collision in `biomes/nhighlands/src/55-biome-nhighlands-trees.js` (L649) and reduce `nfunnel` segments `36` → `16` (`lv=2`) / `8` (`lv=1`); adopt `BIO.impostorSet` at `lv=0`.
6. **`throne` (`24.97M` → `~6M`t) & `crater-drylands-edge` (`22.23M` → `~5M`t):** Remove duplicate `far: null` on `elfin` (`biomes/throne/src/50-biome-throne-species.js` L140), step down `60-biome-throne-floor.js` fungi lathes to `12 × 8`, wire `BIO.LOD` + `BIO.range` + `BIO.impostorSet`, scope `throne-vents` fine ground to vent terraces, and step `KSTACKS.mounds` (`biomes/crater-drylands/stations/edge/86-host-edge.js` L18–28) from `0.8 m` (`< 180 m`) to `1.8 m` beyond (`-1.7M` host tris).
7. **`swhighlands` (`19.71M` → `~6.5M`t, `240` → `~75` dc), `shighlands` (`19.26M` → `~5.5M`t) & `ringisles` (`811` → `~170` dc, `27.00M` → `~7M`t):** Pair untouched `< 140 m` sculpted `celllamp`/`beadcoral`/`trumpets`/`volute` with `160–220`t `_mid` prototypes (`140–700 m`, saving/restoring `BIO.fn.rngState`), gate `SWLOW` kin on `BIO.lodD` (`stations/span/87-host-kin.js` L21), merge `SPAN_MASSING` (`89y-preview-span.js`), instance `MIST` (`84-host-mist.js`), assign `BIO.range` on `shighlands`/`ehighlands`/`ringisles` (native + 8 kits), replace `ringisles` 80t `buildFar` blobs (`55:218`) with `BIO.impostorSet`, and merge the 22 `ringisles` terrace water pools.
8. **Cavern Super-Chunks (`nwbay-caverns` `880` → `~120` dc, `godthrone-tube` `635` → `~55` dc, `zeijani` `460` → `~65` dc):** Merge `16–24 m` `KCAVERN` meshes into `96–144 m` super-chunks (`frustumCulled = true`), merge cave water pools by elevation, and gate sealed underground groups by camera elevation / portal distance.
9. **`core/lod/09-lod.js` Seam Relaxation + Missing Cities (`voth-city`, `ys`, `verge`, `ancientsvalley`, `iziz-style`, `talia`/`pylon`):** Relax straight (`< 15°`) interior material-split edge pins in `pins()` (`09-lod.js` L110–118) on `userData.building` meshes; chunk `ys` `hykFlush` into `200 m` cells + `09-lod.js`; clamp `voth-city` shadow to a camera-following `±300 m` box + `09-lod.js`; wire `09-lod.js` into `verge`; instance `KSHELL` hero towers on `ancientsvalley`; instance `tripodMarket` + merge `wreck()` rubble in `kits/ancients/src/77z-iziz-style.js`; add `_mid` `TABAL`/`PYRING` LODs in `talia`/`pylon` and step down `XDOME` (`360`t → `96`t `> 250 m`) on `erewhon`.

---

### 6.4 Final Verification Matrix & Godot 4 Mapping

| Check Suite | Command / Target | Pass Criteria |
|---|---|---|
| **Core Biome Unit Suite** | `node core/biome/test-lod.js && node core/biome/test-attach.js && node core/biome/test-guards.js && node core/biome/test-tags.js && node core/biome/test-impostor.js` | `0` failures; `attachAudit` floating/split/outrange `<= 1%` |
| **Placement Determinism** | `fingerprint.py` / `KTAGS` `uid32` spot-check before & after Phase 1/2 | `100%` identical placement coordinates & `uid32` hashes |
| **Top Biomes GPU Verify** | `verify.py --assert --all-views` on `ringisles`, `throne`, `crater-drylands`, `farside`, `swhighlands`, `shighlands`, `rift`, `sedesert`, `dambasins`, `nwbay` | All views `< 700` draw calls and `< 12M` drawn tris (well below `17M` soft budget); zero console/GL errors |
| **Top Settlements GPU Verify** | `verify.py --assert` on `pinnacle-rock`, `erewhon`, `voth-city`, `ys`, `iziz`, `verge`, `roketstad`, `hook`, `jimjam` | All cities `< 400–500` draw calls (well below `900` budget) and `< 10M` drawn tris |
| **Showcase Sheets** | `geometry_report.py` / `verify.py` on `interiors-sets`, `catalog`, `ancients-interiors`, `fauna`, `desert-nomads` | `< 200` draw calls per sheet; click-to-inspect resolves exact furniture/fauna record via `triRanges` |
| **Godot 4 Export Parity** | `python3 tools/harness.py export ...` on `nhighlands` & `isle-demo` | Valid `.biome.json` / `krator-world` output; coalesced tile items; `aLodI` → `MultiMesh` `INSTANCE_CUSTOM`, `WORLD_ATLAS` → `Texture2DArray`, `100 m` interior cells & cave portals → `Node3D.visible` / `OccluderInstance3D` |
