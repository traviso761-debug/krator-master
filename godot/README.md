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
godot --path godot                                # the window: keys 1-5 switch case
godot --path godot -- --case=rift                 # start on one case
godot --headless --path godot -- --check          # import every case, print the gap lists, write spike-report.json
godot --headless --path godot --script res://tests/rand/krand_test.gd   # core/rand's golden vectors (exits 0 on pass)
godot --headless --path godot --script res://tests/tags/ktags_test.gd   # core/tags' uid vectors (exits 0 on pass)
godot --headless --path godot --script res://tests/mask/kmask_test.gd   # core/mask's golden grid (exits 0 on pass)
godot --headless --path godot --script res://tests/atmos/atmos_test.gd  # the Atmos autoload against core/atmos (night, hours, weather, waves)
godot --headless --path godot --script res://tests/verge/verge_sim_test.gd   # Verge's sim replayed against its golden trace
godot --headless --path godot --script res://tests/dhelv/dhelv_sim_test.gd   # Dhelv's ramblers: KSim.pose (core/simulation's twin) against the page's trace
godot --headless --path godot --script res://tests/dhelv/dhelv_nav_test.gd   # Dhelv's walk floors baked to a navmesh: gate to temple, through the braid
xvfb-run -a godot --path godot --rendering-method gl_compatibility --rendering-driver opengl3 --script res://tests/atmos/waves_gpu_check.gd   # the wave include on a GPU
```

Or open `godot/project.godot` in the editor (Import, then F5). The editor skips `data/` (`data/.gdignore`): the
spike loads its exports at runtime, and the editor's glTF import of a 20 MB region with LOD generation took over
twenty minutes. To try the editor's import route, copy a `.glb` out of `data/` (`CHECKLIST.md` item 3).

In the window: right mouse drag to look, WASD to move, Q/E down and up, Shift for x5, wheel for speed. `[` `]` step the
hour, `T` runs a time-lapse, `P` pauses the clock, `Shift+W` cycles the weather (or start with `-- --weather=storm`), `F1` hides the help, `F2` prints the case's report.

## The cases

| Key | Case | Route | What it tests |
|---|---|---|---|
| 1 | `hyperjungle` | `krator-biome` JSON (`BIO.export`) | a 300 m tile round a hero hypertree: DataTexture leaf atlases, the foliage hook (wind, aN normals, prism-gum iridescence), fauna on shader paths |
| 2 | `rift` | `krator-biome` JSON | a 300 m tile where every mesh is LOD-chunked; kit hooks with no core kind (iridescent bark, far impostors); 48k instances |
| 3 | `girder` | glTF from three's `GLTFExporter` | a 60 m region of Girder's centre: the material library's textures, extras, what glTF drops (hooks, instancing, custom attributes) |
| 4 | `iziz` | `krator-atmos` JSON + glTF | the whole city's atmosphere (lamps, halos, smoke, searchlights, fog banks, 26 prop sets) on the Atmos autoload, over a glTF region of the centre |
| 5 | `yuni` | `KRATOR_EXPORT` records | every building, door, window and light as tagged records with stable ids, and one compound's interior (rooms, walls with `-col`, furniture, nav links). No meshes at all |
| 6 | `verge` | `krator-sim` + `krator-verge-place` | the twin cities' buildings as stand-ins; the caravans, porters, nomads and patrols on the exported timetable |
| 7 | `dhelv` | `krator-dhelv-place`, `krator-walk`, `krator-sim` (its `motion` block), `krator-lights` | the cave city (kits/zeijani): its sites as boxes, its walk floors drawn and baked (Recast) to a NavigationMesh between the outpost's gate and the temple, a NavigationAgent3D walking that way, the 651 ramblers posed each frame by `KSim.pose`, the 48 lamps nearest the temple. Gaps: the cavern's rock (its marching cubes are not ported; the floors stand in), furniture, materials |

Each case also loads `terrain.json`: the page's ground height sampled on a grid. No exporter carries the ground yet;
this stands in for the `core/terrain` bake (Phase 2) so the plants have something to stand on.

## Layout

| Path | What |
|---|---|
| `project.godot`, `main.tscn`, `spike.gd` | the project, its one scene, and the case loader, HUD, `--check` and `--shot` |
| `krator/kdata.gd` | decoding shared by the importers: typed arrays, matrices, colours, data-URL textures, three geometry to `ArrayMesh` (winding reversed), the heightfield |
| `krator/biome_import.gd` | `krator-biome` to MultiMesh and ArrayMesh, per `biomes/GODOT.md` |
| `krator/clouddeck.gd` | a krator-atmos `clouddeck` record drawn: the page's grid, following the camera, thinned where the scene's heightfield rises through it (`core/atmos/GODOT.md`, "The cloud deck") |
| `krator/atmos.gd` | the `Atmos` autoload: clock, `night()`, a light's and a halo's hours, the veering wind, the weather state machine and lightning, the wave field's CPU twin (`wave_height`, `wave_slope`, for buoyancy), the global shader parameters (`core/atmos/GODOT.md`) |
| `krator/atmos_import.gd`, `atmos_lights.gd` | `krator-atmos` to lights, halos, props, smoke, fog volumes; the lights' hours, flicker and sweeps |
| `krator/gltf_region.gd` | a `.glb` loaded at runtime, glTF extras copied to node metadata |
| `krator/gltf_instancing.gd`, `addons/krator_gltf/` | `EXT_mesh_gpu_instancing` (Godot 4.5 has no importer for it): instanced meshes come in as MultiMeshes, at runtime and in the editor's importer (the plugin is enabled in `project.godot`) |
| `krator/weather_fx.gd` | the weather drawn: rain particles that ride the camera, the lightning bolt on `Atmos.strike` |
| `krator/stage.gd` | the export's `stage` (or `data/<case>/stage.json`): tonemapping, exposure, sky panorama, sun and fill lights, ambient, fog, matched to the page (`biomes/GODOT.md`, "The stage") |
| `krator/kmat.gd` | library materials rebuilt on a glTF region from the build's pack (`data/<case>/tex/`), by the `lib` and `fam` the glTF extras keep |
| `krator/lamps_import.gd` | a page's lamps (`lamps.json`, krator-lamps; Girder's `_api.lamps`): halos on `halo.gdshader` and the nearest 32 as OmniLight3D, run by `atmos_lights.gd` |
| `krator/records_import.gd` | Yuni's records to stand-in nodes, each node's `krator` metadata its core/tags record (`tags.json`; a MultiMesh keeps its instances' records in a `records` side table) |
| `krator/fly_camera.gd` | the camera |
| `krator/dhelv_import.gd`, `dhelv_sim_node.gd`, `dhelv_nav.gd` | the dhelv case: stand-ins, the frame (ramblers and the agent), and the walk floors as Recast source (`KratorDhelvNav`: both windings for floors, the blocks' sides; cell 0.25 m, walker 0.25 m by 1.7 m, step 0.6) with DHN's own route for comparison |
| `shaders/` | `atmos.gdshaderinc` (the shared globals and functions), `atmos_waves.gdshaderinc` (the open-water wave field, generated by `tools/atmos_waves.js`; no water shader uses it yet), `atmos_clouddeck.gdshaderinc` (the cloud deck, generated by `tools/atmos_clouddeck.js`) and `clouddeck` (the deck drawn with it), `foliage`, `bark` (also plain, and the kits' `irid` and `gloss` kinds), `library` (the material library: break-up, specular), `halo`, `terrain`, `ground` (the stage's ground material on the heightfield) |
| `tests/rand/` | copies of `core/rand/krand.gd`, `krand_test.gd`, `golden.json` (`res://` cannot reach outside `godot/`); `tools/sync_core.py --check` reports drift |
| `tests/mask/` | copies of `core/mask/kmask.gd` (the mask rasteriser), `kmask_test.gd`, `golden.json`, kept by `tools/sync_core.py` |
| `tests/tags/` | copies of `core/tags/ktags.gd` (the uid), `ktags_test.gd`, `golden.json`, kept by `tools/sync_core.py` the same way |
| `tests/sim/` | a copy of `core/simulation/ksim.gd` (`KSim`: SIM.at and SIM.pose, the wander's 32-bit hash), kept by `tools/sync_core.py`; its test reads a world's export (`tests/dhelv/`) |
| `tests/dhelv/` | `dhelv_sim_test.gd` (3906 rows of the page's trace, 0 differ; a negative: legs 10% faster) and `dhelv_nav_test.gd` (the path reaches the temple through the stone door on a braid strand, within 0.8 to 1.15 of DHN's length; a negative: the stone door's floors left out) |
| `tests/atmos/` | `atmos_test.gd` and its `golden.json`, written from core/atmos's JavaScript by `tools/atmos_golden.js` (rerun it after changing core/atmos); `waves_gpu_check.gd`, the wave include drawn on a GPU against the CPU twin (needs a renderer: Xvfb + Compatibility) |
| `tools/atmos_waves.js` | writes `shaders/atmos_waves.gdshaderinc` from `ATMOS.waveGLSL()` (rerun it, then `atmos_golden.js`, after changing `presets.waves`) |
| `tools/atmos_clouddeck.js` | writes `shaders/atmos_clouddeck.gdshaderinc` from `ATMOS.deckGLSL()` (rerun it, then `atmos_golden.js`, after changing `presets.clouddeck`). With no node on the machine: `python3 tools/node_in_chromium.py godot/tools/atmos_clouddeck.js --write` |
| `data/<case>/` | the exports (below); `meta.json` says where each came from |
| `tools/export_spike.py` | writes `data/` from the built pages (headless Chromium; `pip install playwright`) |
| `tools/spike_export.js`, `tools/vendor/GLTFExporter.r128.js` | the glTF region exporter injected into a page, and three r128's own exporter (MIT, from the three@0.128.0 npm package) |
| `tools/stage_hook.js` | an init script for a page: finds its cameras and what it renders each frame, so `KSTAGE` can read the scenes |
| `tools/compare_shots.py` | the web page and the spike side by side from the same camera (`shots/compare/`) |
| `tools/shot.sh` | a screenshot on a machine with no display (Xvfb + Compatibility) |
| `shots/` | screenshots from `tools/shot.sh` (gitignored, like every `shots/` in the repo) |

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

## Re-exporting the data

```
python3 godot/tools/export_spike.py            # every case (about ten minutes under software GL)
python3 godot/tools/export_spike.py rift       # one
python3 godot/tools/export_spike.py --list
```

The pages must be built first (`cd biomes/rift && python3 build.py`, and so on). Tiles and regions are set in
`CASES` at the top of the script.

Verge and Dhelv write their own data through their verify (their pages expose `_api.exportParts()`):

```
cd settlements/verge && python3 verify.py dist/verge.html --export ../../godot/data/verge
cd settlements/dhelv && python3 verify.py dist/dhelv.html --export ../../godot/data/dhelv   # 92-dhelv-export.js: nine parts, about 10 MB
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
