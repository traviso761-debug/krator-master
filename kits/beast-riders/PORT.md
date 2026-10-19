# kits/beast-riders: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 0 (0%) | 10 (7%) | 140 (93%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 4.3 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/50-br-mounts.js` | 18.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 90 | 0 | 0 | 0 | 0 | 0 |  |
| `src/55-br-rockcut.js` | 76.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 179 | 0 | 0 | 0 | 0 | 0 | the rock-cut pieces as ASSETs and their carving vocabulary (wall frame, rim, portal, beasts in relief); the tribes' and offerings' tables are data |
| `src/56-br-rockcut-b.js` | 42.4 | [draw] | 3 | 0 | 0 | 0 | 0 | 104 | 0 | 0 | 0 | 0 | 0 | split: the Deep Root cavern's pieces; BR_ROCK's dims/face/onWall/onStack maths is data, backOf and the sheet's backdrop are host |
| `src/60-br-ports.js` | 3.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the ports as ASSETs: copies of the sealed towns' groups (towns.py) |
| `src/90-br-sheet.js` | 5.9 | [web] | 1 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
