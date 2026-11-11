# kits/ancient-transit: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 122 (46%) | 0 (0%) | 0 (0%) | 36 (13%) | 109 (41%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `krator-transit-furniture.js` | 24.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 98 | 0 | 0 | 0 | 0 | 0 | split: each kind's box, states and ruin numbers are KTRANSIT.KINDS ([G data], 40); the builds draw on the catalog frame |
| `transit-furnish.js` | 10.1 | [draw] | 11 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the assembler: the catalog frame run, the ruin pass on the vertices, one mesh a family |
| `src/00-head.html` | 1.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-tr-records.js` | 11.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41-tr-path.js` | 16.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/41b-tr-network.js` | 22.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/42-tr-highway.js` | 15.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-tr-rail.js` | 15.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43b-tr-subway.js` | 11.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | plain records on KRAND; tests/test-transit.js |
| `src/44-tr-dress.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/44b-tr-war.js` | 16.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | plain records on KRAND; tests/test-transit.js |
| `src/44c-tr-quake.js` | 4.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | plain records on KRAND; tests/test-transit.js |
| `src/45-host-stage.js` | 8.1 | [web] | 6 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-tr-mats.js` | 15.5 | [draw] | 15 | 0 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-host-land.js` | 4.6 | [web] | 5 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | host: the ground mesh, BIO.init, the shadows |
| `src/55-tr-draw-highway.js` | 22.4 | [draw] | 8 | 0 | 0 | 0 | 0 | 31 | 0 | 3 | 0 | 0 | 0 |  |
| `src/56-tr-draw-rail.js` | 18.4 | [draw] | 8 | 0 | 0 | 0 | 0 | 52 | 0 | 1 | 0 | 0 | 0 |  |
| `src/56b-tr-draw-subway.js` | 12.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 31 | 0 | 0 | 0 | 0 | 0 | KTRANSIT.subway's records as meshes |
| `src/57-tr-draw-dress.js` | 5.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-host-stage.js` | 8.9 | [web] | 1 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-host-sky.js` | 0.4 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | host: the shared sky bound (core/atmos) |
| `src/99-host-take.js` | 12.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | host: the page handed to core/host, the checks |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)

The kit's own files sit at the top of this folder (another build reads them through `transit_bundle.py`, as the vehicles' through `vehicle_bundle.py`). For Godot: the records (`KTRANSIT.highway`, `rail`, `train`, `dress`: plain JSON) export as they are; the meshes cross over as meshes (one a material family); the furniture's ruin pass is vertex arithmetic a GDScript port repeats.
