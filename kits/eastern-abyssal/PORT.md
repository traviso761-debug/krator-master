# kits/eastern-abyssal: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 101 (10%) | 5 (1%) | 16 (2%) | 165 (17%) | 685 (70%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/65-abyss-00-core.js` | 42.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 103 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-20-plants.js` | 2.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/65-abyss-30-housing.js` | 21.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 64 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-40-shops.js` | 31.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 63 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-50-civic.js` | 21.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 41 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-60-temple.js` | 7.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-70-palace.js` | 8.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-75-verge.js` | 22.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 95 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-80-military.js` | 13.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 32 | 0 | 0 | 0 | 0 | 0 |  |
| `src/65-abyss-90-farm.js` | 12.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 |  |

Moved with the files from `settlements/locus/PORT.md` on 2026-11-03 (MODULARITY-PLAN.md step 4); the tags and notes are Locus's.
