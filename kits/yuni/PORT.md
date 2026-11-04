# kits/yuni: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 227 (100%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/55-mid-example.js` | 3.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-mid.js` | 63.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 298 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-poor.js` | 28.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 153 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-rich.js` | 47.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 212 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59-civic.js` | 19.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 88 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59a-civic-park.js` | 27.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 133 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59b-civic-library.js` | 28.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 163 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59c-civic-furniture.js` | 9.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 64 | 0 | 0 | 0 | 0 | 0 |  |

## Notes

Moved with the files from `settlements/yuni/PORT.md` (2026-11-03, MODULARITY-PLAN.md step 4b). The buildings draw through the Yuni
engine (Yuni's `53-assets.js` frame, `51-fixtures.js` doors and openings), which stays in `settlements/yuni`.
