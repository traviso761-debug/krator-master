# godot/: the port spike

The first Godot project for Krator (`GODOT-PLAN.md`, Phase 7, "The spike"). It opens Krator's exports in Godot 4 to
find out what an importer lacks. It is a test bench, not the game: the importers here are the simplest thing that
reads each contract, and every guess they make is printed as a **gap**. Those gaps are the spike's output; the
first pass is in `GODOT-PLAN.md` ("The spike: first findings").

Run on Windows with **Godot 4.7.2-stable** too (2026-10-08: the dhelv case and its tests; Verge's replay passes there). A fresh checkout needs
`godot --headless --path godot --import` once before a `--script` test, so the class names register. Written and first run on 2026-10-05 in a cloud container with **Godot 4.5-stable**: headless for the imports and the
`core/rand` test, and the Compatibility renderer (OpenGL on Mesa llvmpipe, under Xvfb) for the screenshots in
`godot/shots/` (gitignored). Forward+ on a real GPU has **not** been run yet: that, and the look, is tomorrow's job (`CHECKLIST.md`).

## Run it

Godot 4.3 or later (4.5 tested). From the repo root:

```
godot --path godot                                # the window: keys 1-9 switch case
godot --path godot -- --case=rift                 # start on one case
godot --headless --path godot -- --check          # import every case, print the gap lists, write spike-report.json
godot --headless --path godot --script res://tests/rand/krand_test.gd   # core/rand's golden vectors (exits 0 on pass)
godot --headless --path godot --script res://tests/tags/ktags_test.gd   # core/tags' uid vectors (exits 0 on pass)
godot --headless --path godot --script res://tests/tags/records_test.gd   # the hyperjungle case's ids: every MultiMesh instance's uid, recomputed
godot --headless --path godot --script res://tests/export/world_test.gd   # M4: the world-sedesert case (core/export): uids, materials, terrain
godot --headless --path godot --script res://tests/export/iziz_test.gd    # M5: the world-iziz case: a city's records, fixtures, owners, materials and hooks
godot --headless --path godot --script res://tests/export/yuni_test.gd    # the world-yuni case: Yuni's buildings and fixtures as records, against its own route
godot --headless --path godot --script res://tests/export/yuni_interiors_test.gd   # the same case's interiors section: rooms, -col walls, links, and a path from room to room through the doors
godot --headless --path godot --script res://tests/shaders/library_test.gd   # the shader library: the hook table; world-sedesert's ground layers and pond
godot --headless --path godot --script res://tests/water/water_test.gd     # KWater (core/water's twin) against WATER's own heights, frames, foam, bed
xvfb-run -a godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 --script res://tests/shaders/library_gpu_check.gd   # the includes on a GPU
godot --headless --path godot --script res://tests/mask/kmask_test.gd   # core/mask's golden grid (exits 0 on pass)
godot --headless --path godot --script res://tests/terrain/kfield_test.gd        # core/terrain's field: KField against the page's golden samples
godot --headless --path godot --script res://tests/terrain/field_import_test.gd  # a krator-field to a mesh and HeightMapShape3D collision (rays)
godot --headless --path godot --script res://tests/atmos/atmos_test.gd  # the Atmos autoload against core/atmos (night, hours, weather, waves)
godot --headless --path godot --script res://tests/verge/verge_sim_test.gd   # Verge's sim replayed against its golden trace
godot --headless --path godot --script res://tests/dhelv/dhelv_sim_test.gd   # Dhelv's ramblers: KSim.pose (core/simulation's twin) against the page's trace
godot --headless --path godot --script res://tests/dhelv/dhelv_nav_test.gd   # Dhelv's walk floors baked to a navmesh: gate to temple, through the braid
godot --headless --path godot --script res://tests/isle/isle_books_test.gd   # the isle demo's books after a week (KratorIsleSim) against the page's answers
godot --headless --path godot --script res://tests/export/isle_test.gd   # Kautoa's ceremonial centre: buildings, records, doors, stage, the sim joined, citizens replayed, canoes
godot --headless --path godot --script res://tests/export/isle_test.gd -- --case=world-isle-valapo --town=valapo   # Valapo's village centre, the same checks
xvfb-run -a godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 --script res://tests/atmos/waves_gpu_check.gd   # the wave include on a GPU
godot --headless --path godot --script res://tests/character/kchar_test.gd   # core/charactermodels: records and morphs against the JS golden, a MakeHuman figure from the pieces
godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-sedesert,world-iziz   # the perf table (PERF.md, perf-<case>.json): run it on the real GPU, below
```

Or open `godot/project.godot` in the editor (Import, then F5). The editor skips `data/` (`data/.gdignore`): the
spike loads its exports at runtime, and the editor's glTF import of a 20 MB region with LOD generation took over
twenty minutes. To try the editor's import route, copy a `.glb` out of `data/` (`CHECKLIST.md` item 3).

In the window: left or right mouse drag to look, middle drag to orbit the point ahead, arrow keys to turn and tilt,
WASD to move, Q/E down and up, Shift for x5, wheel to zoom (dolly), Ctrl+wheel for speed, `+` `-` to narrow or widen the lens
(Backspace resets it). `[` `]` step the
hour, `T` runs a time-lapse, `P` pauses the clock, `F3` cycles the weather (or start with `-- --weather=storm`), `F1` hides the help, `F2` prints the case's report.

## The cases

| Key | Case | Route | What it tests |
|---|---|---|---|
| 1 | `hyperjungle` | `krator-biome` JSON (`BIO.export`) | a 300 m tile round a hero hypertree: DataTexture leaf atlases, the foliage hook (wind, aN normals, prism-gum iridescence), fauna on shader paths; since 2026-10-12 every instance's core/tags uid (`krator_records`) and `tags.json` |
| 2 | `rift` | `krator-biome` JSON | a 300 m tile where every mesh is LOD-chunked; kit hooks with no core kind (iridescent bark, far impostors); 48k instances |
| 3 | `girder` | glTF from three's `GLTFExporter` | a 60 m region of Girder's centre: the material library's textures, extras, what glTF drops (hooks, instancing, custom attributes) |
| 4 | `iziz` | `krator-atmos` JSON + glTF | the whole city's atmosphere (lamps, halos, smoke, searchlights, fog banks, 26 prop sets) on the Atmos autoload, over a glTF region of the centre |
| 5 | `yuni` | `KRATOR_EXPORT` records | every building, door, window and light as tagged records with stable ids, and one compound's interior (rooms, walls with `-col`, furniture, nav links). No meshes at all |
| 6 | `verge` | `krator-sim` + `krator-verge-place` | the twin cities' buildings as stand-ins; the caravans, porters, nomads and patrols on the exported timetable |
| 7 | `dhelv` | `krator-dhelv-place`, `krator-walk`, `krator-sim` (its `motion` block), `krator-lights` | the cave city (kits/zeijani): its sites as boxes, its walk floors drawn and baked (Recast) to a NavigationMesh between the outpost's gate and the temple, a NavigationAgent3D walking that way, the 651 ramblers posed each frame by `KSim.pose`, the 48 lamps nearest the temple. Gaps: the cavern's rock (its marching cubes are not ported; the floors stand in), furniture, materials |
| 8 | `sedesert` | `krator-biome` JSON with a `krator-field` ground | a 300 m tile round the rain-shadow pond: the first export whose ground is the page's baked core/terrain field, imported as a terrain mesh and HeightMapShape3D collision (`--check` casts rays onto it) |
| 9 | `world-sedesert` | `krator-world` (core/export): `world.json` + `world.glb` + `tex/` | the same tile through the one container (M4, 2026-10-13): the meshes as glb with `EXT_mesh_gpu_instancing`, the records, materials (library maps by reference to the pack in `tex/`), the field, the stage; written by `tools/harness.py export`, read by `krator/world_import.gd`. Since stage 2e the ground's crack and detail layers (a `world-uv` record) and the pond (the `water` section) on the shader library |
| (by name) | `world-iziz` | `krator-world` (core/export) | M5 (2026-10-13): a 240 m district of Iziz inside the south gate (`tools/shot.sh world-iziz`; keys reach only nine cases): the kit's and the biome's instances, the plain meshes by material, three.js material records drawn on `library.gdshader` with their hooks, Iziz's library pack in `tex/`, the sampled ground with the stage's look, and a `Records` node of `Building_<id>` with its doors, windows and lamps (`core/export/README.md`, "Iziz") |
| (by name) | `world-yuni` | `krator-world` (core/export) | 2026-10-18: the Foundry's box of Yuni (`140,-80,340,90`) through the one container, records only: `Records/Building_<id>` with its doors, windows and lights, and under each planned building its `interiors` section built by the spike's own builder (rooms as floor polygons with their record, walls as `-col` StaticBody3D boxes, a Marker3D per link, a navmesh per storey and yard with a NavigationLink3D per door: `core/export/README.md`, "Interiors"). Written by `tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90 --profile registry,fixtures,interiors` |

Each case also loads `terrain.json`: the page's ground height sampled on a grid. No exporter carries the ground yet;
this stands in for the `core/terrain` bake (Phase 2) so the plants have something to stand on.

## Scoring the pairs

`tools/compare_shots.py` shoots the page and the spike from one camera (`shots/compare/<case>-web.png`, `<case>-godot.png`,
the composite `<case>.png`) and scores each pair (ROADMAP.md stage 4, "a perceptual metric"; section 11 item 4). Both shots
are the same case, view and size: 1600 x 900 on both sides (the page at device pixel ratio 1, the spike's window), and where
they still differ (a window clipped to a small screen) both are downscaled to the smaller before scoring and the table says
so. Each pair gets, on grey copies:

- **SSIM**, structural similarity (Wang 2004) on a 400-px-wide copy with 8 x 8 mean windows, numpy only. At that scale a
  tree, a wall or a water sheet is one feature and a leaf's exact placement is not. 1 is identical, 0 unrelated.
- **MAD**, the mean absolute difference at the common size, as a fraction of full range.
- **diff**, the fraction of pixels differing by more than `--diff` (default 0.10 of full range).
- `<case>-diff.png`, the grey difference amplified x3 (brighter is further apart), next to the shots and gitignored like them.

`--threshold=<ssim>` (default **0.40**) and `--assert` make a pair under it, or a pair with a shot missing, exit 1; `--report`
prints the same table and exits 0; `--score` scores the shots already present without taking new ones; `scores.json` keeps
the last table. The worst SSIM prints first. `tools/test_all.py --nightly` runs it on the must-pass cases (`COMPARE_CASES`:
`world-sedesert`, `world-iziz`) as a report; set `COMPARE_ASSERT = True` there to make it a gate once the first numbers below
have been read. CI takes the shots under Xvfb on the Compatibility renderer (`tools/shot.sh`); a desktop runs the binary
directly on the same renderer, so the two tables differ in the GPU, not the renderer. Needs numpy and Pillow (the nightly
workflow installs both).

**Why 0.40.** The first pairs (below) scored 0.54 and 0.71. The failures the gate exists to catch, measured on the same
shots, all scored under 0.32: a black render 0.00, the wrong case 0.24 to 0.26 (sedesert's page against Iziz's spike and the
reverse), a mirrored camera 0.29 to 0.31. 0.40 sits 0.09 over the worst failure and 0.14 under the worst good pair. It is a
gate against an empty render, a wrong camera or a missing world, not against a shade: a pair whose sky matches and whose
ground is flat grey still scores about 0.65, so a dropped layer shows in the `diff` column and the difference image, not in
SSIM. Raise the threshold only after the pairs above it have been looked at, and record the new numbers here.

**First baseline** (2026-10-18, the owner's machine: Godot 4.7.2 Compatibility on the GPU, the page in headless Chromium on
SwiftShader; both 1600 x 900):

| case | SSIM | MAD | diff > 0.10 | what the eye sees |
|---|---|---|---|---|
| `world-sedesert` | 0.542 | 0.128 | 54.8% | the pond, its shore plants and the mesa agree; the page's sky has the ringed planet and clouds, the spike's a plain haze; the spike draws far terrain the page fogs out and misses the page's far cliff: the diff is mostly sky and horizon |
| `world-iziz` | 0.707 | 0.134 | 25.4% | the gate, towers, wall, tavern, stalls and street shadows agree; the page draws its in-canvas building labels, the spike a billboard the page does not; the far trees differ in colour (Compatibility's colour space, below) |

## Layout

| Path | What |
|---|---|
| `project.godot`, `main.tscn`, `spike.gd` | the project, its one scene, and the case loader, HUD, `--check` and `--shot` |
| `krator/kdata.gd` | decoding shared by the importers: typed arrays, matrices, colours, data-URL textures, three geometry to `ArrayMesh` (winding reversed), the heightfield |
| `krator/biome_import.gd` | `krator-biome` to MultiMesh and ArrayMesh, per `biomes/GODOT.md` |
| `krator/world_import.gd` | `krator-world` (core/export, `core/export/README.md`) to a tile: the glb through `gltf_instancing.gd`, materials by `KratorBiome._material`, library maps from `tex/`, the terrain by `KratorField`, the atmosphere by `KratorAtmos.build_from`; node metadata as the biome importer's |
| `krator/field_import.gd` | a `krator-field` (core/terrain's baked heightmap, carried as a biome export's `ground.field`) to a terrain mesh on its own grid and a StaticBody3D with one HeightMapShape3D per grid (insets are holes in the base); `check_collision` casts rays onto it against `KField.h` (`--check` prints it) |
| `krator/clouddeck.gd` | a krator-atmos `clouddeck` record drawn: the page's grid, following the camera, thinned where the scene's heightfield rises through it (`core/atmos/GODOT.md`, "The cloud deck") |
| `krator/atmos.gd` | the `Atmos` autoload: clock, `night()`, a light's and a halo's hours, the veering wind, the weather state machine and lightning, the wave field's CPU twin (`wave_height`, `wave_slope`, for buoyancy), the global shader parameters (`core/atmos/GODOT.md`) |
| `krator/atmos_import.gd`, `atmos_lights.gd` | `krator-atmos` to lights, halos, props, smoke, fog volumes; the lights' hours, flicker and sweeps |
| `krator/gltf_region.gd` | a `.glb` loaded at runtime, glTF extras copied to node metadata |
| `krator/gltf_instancing.gd`, `addons/krator_gltf/` | `EXT_mesh_gpu_instancing` (Godot 4.5 has no importer for it): instanced meshes come in as MultiMeshes, at runtime and in the editor's importer (the plugin is enabled in `project.godot`) |
| `krator/weather_fx.gd` | the weather drawn: rain particles that ride the camera, the lightning bolt on `Atmos.strike` |
| `krator/stage.gd` | the export's `stage` (or `data/<case>/stage.json`): tonemapping, exposure, sky panorama, sun and fill lights, ambient, fog, matched to the page (`biomes/GODOT.md`, "The stage") |
| `krator/kmat.gd` | library materials rebuilt on a glTF region from the build's pack (`data/<case>/tex/`), by the `lib` and `fam` the glTF extras keep |
| `krator/khooks.gd` | `KHooks`: the shader library's hook table (below), `resolve(hook)` (aliases, `+` lists; an unknown name reported) and `survey(materials)` for an importer's report |
| `krator/water.gd` | `KWater`: core/water's open surface in GDScript, rebuilt from core/export's `water` section (the twins: `tro_d`, `tro_nj`, `rest`, `surface_at`, `height_at`, `normal_at`, `foam_at`, the bed's depth), and `uniforms()` for `lib/water.gdshaderinc` |
| `krator/water_import.gd` | `KratorWater`: the `water` section's open surfaces drawn (a grid in world space on `shaders/water.gdshader`), and `check_probes` (the page's own heights against KWater) |
| `krator/lamps_import.gd` | a page's lamps (`lamps.json`, krator-lamps; Girder's `_api.lamps`): halos on `halo.gdshader` and the nearest 32 as OmniLight3D, run by `atmos_lights.gd` |
| `krator/records_import.gd` | Yuni's records to stand-in nodes, each node's `krator` metadata its core/tags record (`tags.json`; a MultiMesh keeps its instances' records in a `records` side table) |
| `krator/character/` | `kchar.gd` (the twin of core/charactermodels' `KCHAR` for the MakeHuman bodies: morph weights and joints, strangers by people, parts, hidden skin) and `kchar_figure.gd` (a character on one Skeleton3D: morphs as shared blend shapes from `<piece>.gshapes.bin`, skin as one surface of cover regions dropped by `kchar_skin.gdshader`, garments through `kchar_push.gdshader` (their look, the push out of the limbs, the waistband tuck), cloth chains, moved joints and binds, tint, `kchar_eye.gdshader`); data in `data/characters/` (`tools/sync_core.py`: the JSON and golden are tracked, the pieces are copied in and gitignored); body mods (`KChar.mods`, `arms`, `fits`: a second pair of arms or rib gills, drawn as pieces on the lower-arm joints every skeleton has; the lower arms driven from the upper by `_arms2` when the body has four) and a giant (`kit.scale`, the man's clips at its own pace); `tests/character/kchar_test.gd` checks it against the JS golden, `kchar_shot.gd` draws five strangers (`--giant`: three giants) |
| `krator/fly_camera.gd` | the camera |
| `krator/dhelv_import.gd`, `dhelv_sim_node.gd`, `dhelv_nav.gd` | the dhelv case: stand-ins, the frame (ramblers and the agent), and the walk floors as Recast source (`KratorDhelvNav`: both windings for floors, the blocks' sides; cell 0.25 m, walker 0.25 m by 1.7 m, step 0.6) with DHN's own route for comparison |
| `shaders/lib/` | **the shader library** (below): one `.gdshaderinc` per hook id, `world-uv`, `breakup`, `foliage`, `bark`, `cloth-sway`, `flag`, `triplanar`, `glass`, `coursing`, `water` |
| `shaders/` | `water` (an open surface from the `water` section, on `lib/water`), `atmos.gdshaderinc` (the shared globals and functions), `atmos_waves.gdshaderinc` (the open-water wave field, generated by `tools/atmos_waves.js`; `lib/water` includes it), `atmos_clouddeck.gdshaderinc` (the cloud deck, generated by `tools/atmos_clouddeck.js`) and `clouddeck` (the deck drawn with it), `foliage` (on `lib/foliage`), `bark` (also plain, and the kits' `irid` and `gloss` kinds; on `lib/bark`), `library` (the material library: specular; break-up and world-unit tiling on `lib/breakup` and `lib/world-uv`), `halo`, `terrain`, `ground` (the stage's ground material on the heightfield, and a ground record's layers on `lib/world-uv`) |
| `tests/rand/` | copies of `core/rand/krand.gd`, `krand_test.gd`, `golden.json` (`res://` cannot reach outside `godot/`); `tools/sync_core.py --check` reports drift |
| `tests/mask/` | copies of `core/mask/kmask.gd` (the mask rasteriser), `kmask_test.gd`, `golden.json`, kept by `tools/sync_core.py` |
| `tests/terrain/` | copies of `core/terrain/kfield.gd` (`class_name KField`, the field's sampler: the importer uses it from here), `kfield_test.gd`, `golden-field.json`, kept by `tools/sync_core.py`; `field_import_test.gd` (the importer, here only) |
| `tests/tags/` | copies of `core/tags/ktags.gd` (the uid), `ktags_test.gd`, `golden.json`, kept by `tools/sync_core.py` the same way; `records_test.gd` (here only): the hyperjungle case imported, every MultiMesh instance carries a uid, each recomputed in GDScript from its exported matrix, every id resolving in `tags.json`, with negatives |
| `tests/export/` | `world_test.gd` (here only): the M4 proof on the `world-sedesert` case; `iziz_test.gd`: the M5 proof on `world-iziz` (kit uids from TRANSLATION, owners, bucket records, building and fixture nodes at their records and under their buildings, materials, maps and hooks, world-UV tiling, the sampled ground; each with a negative); `yuni_test.gd`: `world-yuni`'s buildings and fixtures as records, against the spike's own `yuni` route; `yuni_interiors_test.gd` (2026-10-18): the same case's `interiors` section built under each building (rooms with their record, `-col` walls as StaticBody3D, a Marker3D per link, every room's door resolving in the fixtures section or the building's links), and the nav check GODOT-PLAN.md finding 19 asked for: a path from one room of `bld_00005` to another through its door links and the yard; the negative removes the links. `world_test.gd`'s checks: every instance's uid recomputed from `world.glb`'s TRANSLATION, every instance drawn at its record, bucket records, every material and map resolved, `KField.h` against the page's probes, collision rays; each with a negative |
| `tests/sim/` | a copy of `core/simulation/ksim.gd` (`KSim`: SIM.at and SIM.pose, the wander's 32-bit hash), kept by `tools/sync_core.py`; its test reads a world's export (`tests/dhelv/`) |
| `tests/isle/` | `isle_books_test.gd`: the isle demo's `krator-sim` export after a week (Valapo watched, Kautoa abstract; `data/isle`), read by `krator/isle_sim.gd` (`KratorIsleSim`): every place of its own settlement, warehouse stock equal to the place records, every load landed or at sea, each town's books balanced over the week, every answer the page's; five negatives (P8, settlements/isle-demo/PLAN.md) |
| `tests/dhelv/` | `dhelv_sim_test.gd` (3906 rows of the page's trace, 0 differ; a negative: legs 10% faster) and `dhelv_nav_test.gd` (the path reaches the temple through the stone door on a braid strand, within 0.8 to 1.15 of DHN's length; a negative: the stone door's floors left out) |
| `tests/atmos/` | `atmos_test.gd` and its `golden.json`, written from core/atmos's JavaScript by `tools/atmos_golden.js` (rerun it after changing core/atmos); `waves_gpu_check.gd`, the wave include drawn on a GPU against the CPU twin (needs a renderer: Xvfb + Compatibility) |
| `tests/shaders/` | `library_test.gd` (headless): every hook has its include, hooks resolve (an unknown one is reported), and on `world-sedesert` the ground's layers sit on the terrain's `ground.gdshader` (maps, scales, gains, the crack weight to a byte of the page's) and the pond on `water.gdshader` (its uniforms; KWater's heights equal the page's probes), each with a negative. `library_gpu_check.gd` (needs a renderer: Xvfb + Compatibility): `lib/water`'s `wtr_height` and `wtr_damp` on three surfaces read back against KWater (and a 5% taller wave that must miss), and the other eight includes compiled together, twenty values against GDScript twins |
| `tests/water/` | `water_test.gd` and its `golden.json` (written by `tools/water_golden.js` from core/water through core/export's water adapter): KWater against WATER at fixed (x, z, t), with negatives |
| `tools/water_golden.js` | writes `tests/water/golden.json` (rerun it after changing core/water, core/atmos's waves or the water adapter) |
| `tests/perf/` | `perf_capture.gd`: the perf capture (below), which writes `PERF.md` and `perf-<case>.json` beside `spike-report.json` |
| `PERF.md`, `perf-<case>.json` | the perf table and the captures it is built from (kept, like `spike-report.json`; the header says which machine and renderer wrote them) |
| `tools/atmos_waves.js` | writes `shaders/atmos_waves.gdshaderinc` from `ATMOS.waveGLSL()` (rerun it, then `atmos_golden.js`, after changing `presets.waves`) |
| `tools/atmos_clouddeck.js` | writes `shaders/atmos_clouddeck.gdshaderinc` from `ATMOS.deckGLSL()` (rerun it, then `atmos_golden.js`, after changing `presets.clouddeck`). With no node on the machine: `python3 tools/node_in_chromium.py godot/tools/atmos_clouddeck.js --write` |
| `data/<case>/` | the exports (below); `meta.json` says where each came from |
| `tools/export_spike.py` | writes `data/` from the built pages (headless Chromium; `pip install playwright`) |
| `tools/spike_export.js`, `tools/vendor/GLTFExporter.r128.js` | the glTF region exporter injected into a page, and three r128's own exporter (MIT, from the three@0.128.0 npm package) |
| `tools/stage_hook.js` | an init script for a page: finds its cameras and what it renders each frame, so `KSTAGE` can read the scenes |
| `tools/compare_shots.py` | the web page and the spike side by side from the same camera (`shots/compare/`), each pair scored by SSIM, mean absolute difference and the differing fraction, with a difference image ("Scoring the pairs", below); `--assert` gates on `--threshold`; the nightly runs it on the must-pass cases |
| `tools/shot.sh` | a screenshot on a machine with no display (Xvfb + Compatibility) |
| `shots/` | screenshots from `tools/shot.sh` (gitignored, like every `shots/` in the repo) |

## The shader library

GODOT-PLAN.md Phase 3's library (ROADMAP.md stage 2e, its shader half, 2026-10-13): one `.gdshaderinc` per hook id in
`shaders/lib/` (here, not `core/godot/shaders/`: `res://` cannot reach outside `godot/`, and the spike's shaders already
live here, so nothing moved). Each include is pure functions of its arguments (and, for water, its uniforms and the
atmosphere's globals), guarded, so any shader, spatial or canvas_item, can include it; each is the twin of one three.js
hook, named in its header. A material record's `hook` (KMAT's, core/export's `materials`; several joined by `+`) selects
them through `krator/khooks.gd`; an importer reports a hook nothing answers (`world_import.gd`'s report `hooks` and gap
`hooks`). The rules are the plan's: a cut-out is `ALPHA_SCISSOR_THRESHOLD`, never blending (`transparent` is for glass,
water and smoke); options are uniforms, not `#define`s; per-instance values ride `COLOR` and `INSTANCE_CUSTOM`; a detail
normal is `StandardMaterial3D`'s `detail_*` fields fed from a record's `detail`, not a shader, so the library has none
(no record carries `detail` yet: KMAT's fields lack it, `core/materials/PLAN.md` "From spiderbench").

| Hook | Include | The three.js hook it answers | Record fields it reads | Drawn by |
|---|---|---|---|---|
| `world-uv` | `lib/world-uv` | `core/materials/opt/69a-world-uv.js` `vWorldUV` (`wuv_box`); Girder's `applyWorldUV` (`wuv_box_offset`); the biome hosts' ground layers (`wuv_planar`, `wuv_layer`; `core/export`'s `EXPORT.groundLayers`); `wuv_triplanar` for a mesh with no UVs | `scale`, `layers`, `weights` | `library`, `ground` |
| `breakup` | `lib/breakup` | `core/materials/record/25-matlib-host.js` `KMAT.breakupHook` | `breakup` {mix, macro, cell} | `library` |
| `foliage` (`leaf`) | `lib/foliage` | `core/biome/30-core-foliage.js` `BIO.foliageHook` | `sway`, `options`, `alphaTest` | `foliage` |
| `bark` (`irid`, `gloss`, `far`, `hang`) | `lib/bark` | the biome kits' bark kinds (`BIO.iridBarkMat`, `barkMat2`, `RIFT.farMat`, `SWLOW.farMat`, the nhighlands bulbs), named by `core/biome/42-core-export.js` | `kind`, `options` | `bark` |
| `cloth-sway` (`cloth-flutter`) | `lib/cloth-sway` | Girder's `applyClothSway` (`settlements/girder/src/45-kit.js`; Voth's the same); no `core/` copy | none yet | none yet |
| `flag` | `lib/flag` | the Ring Sea kit's flag flutter (`kits/ringsea/src/40-rs-core.js`, `RS_AUX_GLSL`); no `core/` copy | none yet | none yet |
| `triplanar` | `lib/triplanar` | the Iziz court finishes (`settlements/iziz/src/95i-iziz-interiors.js` `courtFinish`, `COURT_TRI`): a court set on the catalog furniture, which has no UVs, projected from three sides (the page in world space, a piece here in its own frame) | `triplanar` {tile, detail, gain} | `library` |
| `glass` | `lib/glass` | `core/materials/22-materials.js` `MAT.glass` (GLASS FRESNEL): the rim as `EMISSION` | none | none yet |
| `coursing` | `lib/coursing` | none yet: the TEX kind `coursing` (`core/materials/PLAN.md`, "From spiderbench") waits for its pilot, Voth's canton walls (the Voth branch's) | `coursing` {courseH, blockW, slide, joint, tone, seed} | none yet |
| `water` | `lib/water` | `core/water/50-core-water-draw.js` `WATER.glsl` and `WATER.draw` | core/export's `water` section | `water` |
| `anim` | `lib/anim` | `core/biome/35-core-anim.js` `BIO.animHook`: fauna on a path (orbit, flit), walkers' legs, flapping wings, billboard motes | `options`; per instance `aP0.w` (COLOR.a) and `aP1` (INSTANCE_CUSTOM) | `anim`, `anim_add` |

What it proves: `tests/shaders/library_test.gd` (the table, the resolution, the sedesert case's ground and pond),
`tests/water/water_test.gd` (KWater equals WATER to 1e-14 m), `tests/shaders/library_gpu_check.gd` (every include
compiles, and computes what its GDScript twin does: water within 0.5 mm, the rest within 2e-4), `tests/motion/motion_test.gd` (the baked motion of CPU-moved fauna against the page's ticks: `tools/motion_golden.py`; `krator/kmotion.gd`), `tests/anim/anim_test.gd`
(`krator/kanim.gd`, the anim twin, against `BIO.animHook`'s own GLSL run on a GPU: `tools/anim_golden.py`; the importer's packing). Not yet: a record field
that selects `cloth-sway`, `flag`, `glass` or `coursing` on an exported mesh (no export carries those materials yet: Girder
and Iziz still go through the glTF route), fauna a kit moves on the CPU (`BIO.dynamic`; swbay's and nwbay's flocks), a texture array for bark variants,
and pre-compiling the library at load.

## Driving the editor (Godot MCP)

`addons/godot_mcp` (vendored from tomyud1/godot-mcp v0.6.0, MIT; `VENDOR.md`) is the editor half of an MCP server,
`godot-mcp-server`, which the repo's `.mcp.json` registers for Claude Code (pre-approved in `.claude/settings.json`).
With the editor open, Claude can read and edit scenes, scripts and project settings, list errors and validate scripts.

- **On a desktop:** open `godot/` in Godot 4.5 (the plugin is enabled in `project.godot`), start Claude Code in the
  repo, and the plugin shows "MCP Connected".
- **In a cloud session:** the start hook (`.claude/hooks/session-start.sh`) installs Godot 4.5 as `godot`; then
  `godot/tools/editor.sh` starts the editor under Xvfb (`stop` ends it). The first start imports the project
  (minutes). Checked 2026-10-05: the editor tools answer (project settings, scripts, errors). `run_scene` and
  `take_screenshot` timed out there: the main scene loads a whole biome tile under software rendering. Use
  `tools/shot.sh` for screenshots in the cloud.
- The plugin talks only to `127.0.0.1:6505`. The server's optional visualizer (`map_project`) serves on port 6510.

## The perf capture

The tests above prove parity, not speed. `tests/perf/perf_capture.gd` measures each must-pass case on the machine it runs on
(ROADMAP.md section 11, item 4) and writes the table:

```
godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-sedesert,world-iziz
godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-iziz --compare    # the deltas against the last perf-world-iziz.json
godot --headless --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-sedesert --frames=10 --out=res://shots/perf   # the nightly's smoke
```

For each case it imports the world through the spike's own loader (`spike.gd` `_load_case`, so nothing is forked), records the
import wall time and the time to the first drawn frame, then puts the camera at four fixed poses (`POSES` in the script: the
whole tile from two high oblique corners, an eye-level view from the tile's edge, a walker's eye at the centre) and samples
`--frames` frames (120) at each after `--warmup` (10): the frame delta (mean, 95th percentile, fps), `Performance.TIME_PROCESS`
(the worst process step of the last second, as the max seen), the RenderingServer's draw calls, primitives and objects in frame,
video, texture and buffer memory, static memory; plus the scene's node count and its MultiMesh instance total. It writes
`perf-<case>.json` and rebuilds `PERF.md` from every `perf-*.json` in `--out` (default `res://`, next to `spike-report.json`),
with the Godot version, renderer, GPU (`RenderingServer.get_video_adapter_name()`), window, date and git commit at the top of
each case's table. The window is set to 1600x900 (`--size=WxH`) and vsync is turned off (`--vsync` keeps it), so frame time
is the GPU's and the table says what it measured at.

**Only a run in Forward+ on a real GPU counts** (`CHECKLIST.md`, item 7): `--headless` never draws (draw calls and memory read
0, frame time is the script's own), and CI's llvmpipe is not the owner's machine. The headless run is what
`tools/test_all.py --nightly` smokes, into `shots/perf/` so it never overwrites a real table; it fails only if the script
crashes or cannot write, never on a number. `--compare` prints, before overwriting, each figure that moved against the
previous capture of the case (`--compare=<dir>` reads them from elsewhere).

## Re-exporting the data

```
python3 godot/tools/export_spike.py            # every case (about ten minutes under software GL)
python3 godot/tools/export_spike.py rift       # one
python3 godot/tools/export_spike.py --list
```

The pages must be built first (`cd biomes/rift && python3 build.py`, and so on). Tiles and regions are set in
`CASES` at the top of the script.

The `krator-world` cases (core/export, `core/export/README.md`) go through the shared verify harness instead:

```
python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790
python3 tools/harness.py export settlements/iziz/dist/iziz.html --out godot/data/world-iziz --box=-120,292,120,532
```

`shaders/library.gdshader` also draws a city's three.js material records (`krator/world_import.gd` `_standard`): uniforms
`colour` (linear, multiplies the map), `has_albedo`, `flip_v` (the texture's flipY), `emission`, `unlit` (a MeshBasicMaterial)
and `world_uv_offset` (false: vWorldUV has no per-instance start; Girder's applyWorldUV has one). Their defaults leave the
Girder pack's surfaces as they were.

Verge and Dhelv write their own data through their verify (their pages expose `_api.exportParts()`):

```
cd settlements/verge && python3 verify.py dist/verge.html --export ../../godot/data/verge
cd settlements/dhelv && python3 verify.py dist/dhelv.html --export ../../godot/data/dhelv   # 92-dhelv-export.js: nine parts, about 10 MB
python3 tools/harness.py export settlements/isle-demo/dist/isle-city.html --query "?town=Kautoa&simAt=362" --out godot/data/world-isle-kautoa --box=320,780,820,1220
node settlements/isle-demo/tools/export-sim.js   # godot/data/isle: sim.json (the week's end, about 3 MB) and golden.json (the start's books, the page's answers)
```

## Rules

- This folder holds no Krator logic of its own that a build needs: the builds never read it.
- `tests/rand/` follows `core/rand/`, never the other way: fix upstream, then `python3 godot/tools/sync_core.py`.
- An importer that has to guess records the guess as a gap in its report, so the list stays honest.

## Colour space in the Compatibility renderer

Measured on 2026-10-05 (Godot 4.5, a lit grey plane): Forward+ decodes a `source_color` texture when it is sampled
and takes `ALBEDO` as linear; **Compatibility reads the texture raw and decodes `ALBEDO` itself** (sRGB to linear)
before lighting. A shader that only passes a texture to `ALBEDO` is right in both. One that multiplies a texture by
linear data (vertex and instance colours, the stage's linear colour uniforms) is wrong in Compatibility by a gamma:
Girder's floor and roof came out at a third of their brightness. `shaders/kcolour.gdshaderinc` has the fix: `k_tex()`
decodes a sample, `k_albedo()` writes the result, both no-ops in Forward+. Every shader here that mixes a texture with
a colour uses them. `halo` writes the atmosphere's sRGB colours and stays as it is.

Also measured: Godot's ACES is three's curve with other scaling (`stage.gd`: white 16, exposure / 1.08), the sky
`PanoramaSkyMaterial` samples a low mip under Compatibility (`shaders/panorama.gdshader` reads level 0), and three's
exporter writes no tangents, so `library.gdshader` builds the normal map's frame from screen derivatives as three's
`perturbNormal2Arb` does.
