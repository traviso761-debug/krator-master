# openworld/little-demo: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 47 (30%) | 0 (0%) | 9 (6%) | 95 (60%) | 6 (4%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 4.9 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-world-fields.js` | 32.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-world-roads.js` | 10.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45-world-host.js` | 4.4 | [web] | 9 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-world-kits.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-world-sky.js` | 9.1 | [G native] | 15 | 1 | 0 | 0 | 0 | 3 | 12 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/81-world-terrain.js` | 11.4 | [web] | 10 | 1 | 0 | 0 | 3 | 2 | 5 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/83-world-water.js` | 6.1 | [draw] | 7 | 0 | 0 | 0 | 0 | 1 | 7 | 0 | 0 | 0 | 0 |  |
| `src/84-world-nursery.js` | 12.8 | [web] | 8 | 0 | 0 | 0 | 6 | 1 | 10 | 0 | 0 | 0 | 0 |  |
| `src/85-world-flora.js` | 12.8 | [web] | 4 | 0 | 0 | 0 | 5 | 2 | 0 | 4 | 0 | 0 | 0 |  |
| `src/86-world-floor.js` | 6.0 | [web] | 5 | 0 | 0 | 0 | 5 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/87-world-places.js` | 2.9 | [web] | 6 | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-world-towns.js` | 9.0 | [web] | 20 | 0 | 0 | 0 | 2 | 2 | 0 | 3 | 0 | 0 | 2 |  |
| `src/90-world-camera.js` | 12.6 | [web] | 3 | 3 | 6 | 14 | 0 | 1 | 0 | 0 | 2 | 0 | 0 |  |
| `src/91-world-probe.js` | 12.1 | [web] | 0 | 0 | 1 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/98-world-start.js` | 5.7 | [web] | 0 | 1 | 2 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 1 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
