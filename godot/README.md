# godot/: the port spike

The first Godot project for Krator (`GODOT-PLAN.md`, Phase 7, "The spike"). It opens Krator's exports in Godot 4 to
find out what an importer lacks. It is a test bench, not the game: the importers here are the simplest thing that
reads each contract, and every guess they make is printed as a **gap**. Those gaps are the spike's output; the
first pass is in `GODOT-PLAN.md` ("The spike: first findings").

Written and run on 2026-10-05 in a cloud container with **Godot 4.5-stable**: headless for the imports and the
`core/rand` test, and the Compatibility renderer (OpenGL on Mesa llvmpipe, under Xvfb) for the screenshots in
`godot/shots/` (gitignored). Forward+ on a real GPU has **not** been run yet: that, and the look, is tomorrow's job (`CHECKLIST.md`).

## Run it

Godot 4.3 or later (4.5 tested). From the repo root:

```
godot --path godot                                # the window: keys 1-5 switch case
godot --path godot -- --case=rift                 # start on one case
godot --headless --path godot -- --check          # import every case, print the gap lists, write spike-report.json
godot --headless --path godot --script res://tests/rand/krand_test.gd   # core/rand's golden vectors (exits 0 on pass)
godot --headless --path godot --script res://tests/atmos/atmos_test.gd  # the Atmos autoload against core/atmos (night, hours, weather)
```

Or open `godot/project.godot` in the editor (Import, then F5). The first open imports `data/` (the `.glb` files are
also imported by the editor's own glTF importer: compare that with the runtime load, `CHECKLIST.md` item 4).

In the window: right mouse drag to look, WASD to move, Q/E down and up, Shift for x5, wheel for speed. `[` `]` step the
hour, `T` runs a time-lapse, `P` pauses the clock, `Shift+W` cycles the weather (or start with `-- --weather=storm`), `F1` hides the help, `F2` prints the case's report.

## The five cases

| Key | Case | Route | What it tests |
|---|---|---|---|
| 1 | `hyperjungle` | `krator-biome` JSON (`BIO.export`) | a 300 m tile round a hero hypertree: DataTexture leaf atlases, the foliage hook (wind, aN normals, prism-gum iridescence), fauna on shader paths |
| 2 | `rift` | `krator-biome` JSON | a 300 m tile where every mesh is LOD-chunked; kit hooks with no core kind (iridescent bark, far impostors); 48k instances |
| 3 | `girder` | glTF from three's `GLTFExporter` | a 60 m region of Girder's centre: the material library's textures, extras, what glTF drops (hooks, instancing, custom attributes) |
| 4 | `iziz` | `krator-atmos` JSON + glTF | the whole city's atmosphere (lamps, halos, smoke, searchlights, fog banks, 26 prop sets) on the Atmos autoload, over a glTF region of the centre |
| 5 | `yuni` | `KRATOR_EXPORT` records | every building, door, window and light as tagged records with stable ids, and one compound's interior (rooms, walls with `-col`, furniture, nav links). No meshes at all |

Each case also loads `terrain.json`: the page's ground height sampled on a grid. No exporter carries the ground yet;
this stands in for the `core/terrain` bake (Phase 2) so the plants have something to stand on.

## Layout

| Path | What |
|---|---|
| `project.godot`, `main.tscn`, `spike.gd` | the project, its one scene, and the case loader, HUD, `--check` and `--shot` |
| `krator/kdata.gd` | decoding shared by the importers: typed arrays, matrices, colours, data-URL textures, three geometry to `ArrayMesh` (winding reversed), the heightfield |
| `krator/biome_import.gd` | `krator-biome` to MultiMesh and ArrayMesh, per `biomes/GODOT.md` |
| `krator/atmos.gd` | the `Atmos` autoload: clock, `night()`, a light's and a halo's hours, the veering wind, the weather state machine and lightning, the global shader parameters (`core/atmos/GODOT.md`) |
| `krator/atmos_import.gd`, `atmos_lights.gd` | `krator-atmos` to lights, halos, props, smoke, fog volumes; the lights' hours, flicker and sweeps |
| `krator/gltf_region.gd` | a `.glb` loaded at runtime, glTF extras copied to node metadata |
| `krator/gltf_instancing.gd`, `addons/krator_gltf/` | `EXT_mesh_gpu_instancing` (Godot 4.5 has no importer for it): instanced meshes come in as MultiMeshes, at runtime and in the editor's importer (the plugin is enabled in `project.godot`) |
| `krator/weather_fx.gd` | the weather drawn: rain particles that ride the camera, the lightning bolt on `Atmos.strike` |
| `krator/kmat.gd` | library materials rebuilt on a glTF region from the build's pack (`data/<case>/tex/`), by the `lib` and `fam` the glTF extras keep |
| `krator/records_import.gd` | Yuni's records to stand-in nodes with every record on its node as metadata |
| `krator/fly_camera.gd` | the camera |
| `shaders/` | `atmos.gdshaderinc` (the shared globals and functions), `foliage`, `bark` (also plain, and the kits' `irid` and `gloss` kinds), `library` (the material library: break-up, specular), `halo`, `terrain` |
| `tests/rand/` | copies of `core/rand/krand.gd`, `krand_test.gd`, `golden.json` (`res://` cannot reach outside `godot/`); `tools/sync_core.py --check` reports drift |
| `tests/atmos/` | `atmos_test.gd` and its `golden.json`, written from core/atmos's JavaScript by `tools/atmos_golden.js` (rerun it after changing core/atmos) |
| `data/<case>/` | the exports (below); `meta.json` says where each came from |
| `tools/export_spike.py` | writes `data/` from the built pages (headless Chromium; `pip install playwright`) |
| `tools/spike_export.js`, `tools/vendor/GLTFExporter.r128.js` | the glTF region exporter injected into a page, and three r128's own exporter (MIT, from the three@0.128.0 npm package) |
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

## Rules

- This folder holds no Krator logic of its own that a build needs: the builds never read it.
- `tests/rand/` follows `core/rand/`, never the other way: fix upstream, then `python3 godot/tools/sync_core.py`.
- An importer that has to guess records the guess as a gap in its report, so the list stays honest.
