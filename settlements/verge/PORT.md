# settlements/verge: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 104 (37%) | 12 (4%) | 6 (2%) | 110 (39%) | 49 (17%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.5 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-verge-layout.js` | 22.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | the terrain, river, falls, trail and ramps as functions; no THREE (tests/test-layout.js runs it in node). The geom hits are names, not calls |
| `src/45-verge-stage.js` | 9.7 | [web] | 9 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-verge-ground.js` | 10.2 | [web] | 9 | 2 | 0 | 0 | 2 | 1 | 5 | 0 | 0 | 0 | 0 |  |
| `src/47-verge-water.js` | 11.9 | [G shader] | 19 | 2 | 0 | 0 | 0 | 4 | 9 | 0 | 0 | 0 | 0 |  |
| `src/70-verge-place.js` | 32.6 | [G data] | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | placement: every building, street, plaza and pad as records (core/tags); the raster is core/mask, not a browser canvas |
| `src/71-verge-furnish.js` | 5.1 | [web] | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | 0 | binds core/furnish to the page; interiors are chosen by kits/interiors (data), furnished progressively near the camera |
| `src/72-verge-buildings.js` | 7.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 |  |
| `src/74-verge-sim.js` | 45.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | factions, places and slots, the nav graph, the timetabled groups, the citizens; memberPose is pure (godot/krator/verge_sim.gd is its twin) |
| `src/77-verge-rigs.js` | 29.9 | [draw] | 10 | 0 | 0 | 0 | 0 | 40 | 3 | 7 | 0 | 0 | 0 | the person, camel and lizard rigs; RIGS' API (set, hide, flush) is the contract a Godot rig keeps |
| `src/78-verge-life.js` | 5.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | poses RIGS each frame from SIM.memberPose and SIM.decide; reads the camera for its range |
| `src/80-verge-skyhost.js` | 6.2 | [draw] | 7 | 4 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-verge-sky.js` | 56.4 | [web] | 67 | 0 | 19 | 6 | 0 | 9 | 26 | 0 | 0 | 0 | 0 | vendored from settlements/locus/src/21-sky.js (unchanged) |
| `src/82-verge-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | vendored from settlements/locus/src/82-daynight.js (unchanged): lights and fog from the sky state |
| `src/87-verge-views.js` | 3.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the preset cameras, derived from the layout; two find their subject in the sim when picked |
| `src/88-verge-build.js` | 1.3 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-verge-camera.js` | 13.5 | [web] | 9 | 0 | 14 | 12 | 3 | 1 | 0 | 0 | 2 | 0 | 0 |  |
| `src/91-verge-probe.js` | 9.9 | [web] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | window._api: the checks (each with a negative control) and the Godot export |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- 41 and 70 are overridden to `[G data]`: the audit's geometry hits are identifiers, and 70's raster is core/mask's (`KMASK.canvas(...).getContext()`, no browser canvas).
- 72 draws through the kits (IZV.VERN, IZV.FUNICULAR, YKIT.buildAsset): a Godot port draws the same records with the kits' own ports.
- The page's export (`verify.py --export godot/data/verge`) is the crossing: terrain, place, tags, walk, sim, golden.
