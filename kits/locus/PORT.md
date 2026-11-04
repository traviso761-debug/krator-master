# kits/locus: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 101 (10%) | 5 (1%) | 16 (2%) | 165 (17%) | 685 (70%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/64-locus-chapterhouse.js` | 13.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 58 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-core.js` | 16.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 68 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-dwellings.js` | 19.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 56 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-farm.js` | 10.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-infra.js` | 8.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-petroleum.js` | 22.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 86 | 0 | 0 | 0 | 0 | 0 |  |
| `src/64-locus-plants.js` | 3.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/64-locus-power.js` | 17.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 95 | 0 | 0 | 0 | 0 | 0 |  |

Moved with the files from `settlements/locus/PORT.md` on 2026-11-03 (MODULARITY-PLAN.md step 4); the tags and notes are Locus's.
