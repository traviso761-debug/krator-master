# settlements/torus: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 233 (45%) | 0 (0%) | 1 (0%) | 93 (18%) | 188 (37%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.9 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/30-torus-arcology.js` | 16.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/31-torus-kits-data.js` | 22.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/32-torus-city-plan.js` | 37.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/32b-torus-hinterland.js` | 21.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/33-torus-rules.js` | 21.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/34-torus-stage4-arcology.js` | 18.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/35-torus-stage4-landmarks.js` | 35.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-torus-city-kcity.js` | 13.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-torus-stage.js` | 50.1 | [web] | 102 | 0 | 1 | 0 | 0 | 27 | 0 | 2 | 0 | 0 | 0 |  |
| `src/78-torus-sim.js` | 67.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88d-torus-trades.js` | 7.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89z-torus-sky.js` | 0.7 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8bf-torus-arcology-3d.js` | 21.9 | [draw] | 53 | 0 | 0 | 0 | 0 | 32 | 0 | 4 | 0 | 0 | 0 |  |
| `src/8bg-torus-landmarks.js` | 36.5 | [draw] | 18 | 0 | 0 | 0 | 0 | 218 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8bh-torus-vernacular.js` | 7.1 | [web] | 5 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8bi-torus-hinterland-3d.js` | 15.6 | [draw] | 26 | 0 | 0 | 0 | 0 | 11 | 0 | 2 | 0 | 0 | 0 |  |
| `src/8bj-torus-furnish-doors.js` | 6.2 | [draw] | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/8bk-torus-life.js` | 12.2 | [draw] | 24 | 0 | 0 | 0 | 0 | 8 | 0 | 2 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/8bl-torus-flora.js` | 60.4 | [draw] | 57 | 0 | 0 | 0 | 0 | 10 | 1 | 1 | 0 | 0 | 0 |  |
| `src/94-torus-export.js` | 8.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-main-torus.js` | 34.7 | [web] | 0 | 0 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
