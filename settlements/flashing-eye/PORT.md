# settlements/flashing-eye: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 94 (48%) | 0 (0%) | 0 (0%) | 58 (30%) | 43 (22%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/30-fe-layout.js` | 27.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/31-fe-rules.js` | 23.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/32-fe-rooms.js` | 19.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-fe-watch.js` | 8.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89q0w-fe-mats.js` | 1.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89qe-fe-roofs.js` | 9.7 | [draw] | 2 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89qf-fe-buildings.js` | 15.7 | [draw] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/cone/89z-rows.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/cone/89zfe-site.js` | 15.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `targets/cone/90fe-world.js` | 12.5 | [web] | 12 | 3 | 0 | 0 | 2 | 5 | 6 | 0 | 0 | 0 | 0 |  |
| `targets/cone/90fg-build.js` | 5.4 | [web] | 5 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/cone/90fh-vent.js` | 13.2 | [web] | 12 | 3 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/cone/90fi-bridges.js` | 12.9 | [draw] | 23 | 0 | 0 | 0 | 0 | 11 | 0 | 4 | 0 | 0 | 0 |  |
| `targets/cone/90fj-face.js` | 3.4 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/cone/90fk-fe-interiors.js` | 24.0 | [web] | 3 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `targets/cone/91z-views.js` | 3.3 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |

## Notes

(none yet: the split lists and the overrides go here)
