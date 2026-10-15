# settlements/isle-demo: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 8 (46%) | 0 (0%) | 0 (0%) | 9 (54%) | 0 (0%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/10-isle-frame.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | a town's frame and the ground Voth's editor reads, from the world's fields; the box records are data (no THREE) |
| `src/56-isle-tools.js` | 4.8 | [web] | 1 | 0 | 2 | 5 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | the planner's save, towns and views over Voth's tools |
| `src/98-isle-start.js` | 4.5 | [web] | 1 | 4 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | decode the region, raise the town |

## Notes

(none yet: the split lists and the overrides go here)
