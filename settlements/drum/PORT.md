# settlements/drum: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 184 (47%) | 0 (0%) | 1 (0%) | 72 (19%) | 131 (34%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.8 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/30-drum-arcology.js` | 11.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/31-drum-kits-data.js` | 14.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/32-drum-city-plan.js` | 23.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/33-drum-rules.js` | 14.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/34-drum-stage4-arcology.js` | 34.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/35-drum-stage4-landmarks.js` | 30.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-drum-city-kcity.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-drum-stage.js` | 36.9 | [web] | 83 | 0 | 1 | 0 | 0 | 10 | 0 | 1 | 0 | 0 | 0 |  |
| `src/78-drum-sim.js` | 59.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88d-drum-trades.js` | 6.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89z-drum-sky.js` | 0.7 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8bf-drum-arcology-3d.js` | 14.1 | [draw] | 14 | 0 | 0 | 0 | 0 | 5 | 0 | 1 | 0 | 0 | 0 |  |
| `src/8bg-drum-walls.js` | 22.1 | [draw] | 18 | 0 | 0 | 0 | 0 | 4 | 0 | 2 | 0 | 0 | 0 |  |
| `src/8bh-drum-landmarks.js` | 36.4 | [draw] | 11 | 0 | 0 | 0 | 0 | 260 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8bi-drum-vernacular.js` | 8.8 | [web] | 17 | 0 | 0 | 0 | 2 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/8bj-drum-furnish-doors.js` | 6.8 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/8bk-drum-life.js` | 11.7 | [draw] | 24 | 0 | 0 | 0 | 0 | 8 | 0 | 2 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/8bl-drum-flora.js` | 9.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |  |
| `src/94-drum-export.js` | 7.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/99-main-drum.js` | 25.3 | [web] | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
