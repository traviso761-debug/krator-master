# kits/yuni: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (0%) | 0 (0%) | 0 (0%) | 19 (7%) | 235 (92%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/55-mid-example.js` | 3.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-mid.js` | 64.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 298 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57-poor.js` | 29.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 153 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-rich.js` | 47.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 212 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59-civic.js` | 20.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 89 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59a-civic-park.js` | 27.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 133 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59b-civic-library.js` | 28.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 163 | 0 | 0 | 0 | 0 | 0 |  |
| `src/59c-civic-furniture.js` | 9.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 64 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/sheet/00-head.html` | 2.8 | [web] | 0 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `targets/sheet/20-ys-stage.js` | 2.1 | [web] | 8 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/sheet/30-ys-world.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the one world name the engine's 50-structure.js reads at load (BRIDGES, empty) |
| `targets/sheet/70-ys-sheet.js` | 3.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the sheet's layout: calls the engine's builders (buildAsset, buildFurn, CYL, BALL) |
| `targets/sheet/75-ys-emit.js` | 2.4 | [draw] | 4 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/sheet/82-ys-sky.js` | 1.3 | [web] | 4 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/sheet/89-ys-sheetui.js` | 4.5 | [web] | 1 | 0 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/sheet/98-ys-take.js` | 8.0 | [web] | 1 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `targets/sheet/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Moved with the files from `settlements/yuni/PORT.md` (2026-11-03, MODULARITY-PLAN.md step 4b). The buildings draw through the Yuni
engine (Yuni's `53-assets.js` frame, `51-fixtures.js` doors and openings), which stays in `settlements/yuni`.

The kit's own sheet (2026-11-09): `targets/sheet/` is its page (`build.py`, `dist/yuni.html`): a head and tail, the stage and the
placeholder sky, the layout, the emit and ground, the labels and controls, the take on core/host. The Yuni engine it draws
through is read in place from `settlements/yuni/src` and tagged there.
