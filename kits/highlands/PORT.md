# kits/highlands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 202 (21%) | 6 (1%) | 13 (1%) | 70 (7%) | 655 (69%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/70-hl-tex.js` | 26.8 | [draw] | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71-hl-mat.js` | 9.0 | [draw] | 15 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 | 0 |  |
| `src/71b-hl-motif.js` | 33.6 | [draw] | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/71c-hl-openings.js` | 6.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | real doors and glass: leaves registered in KDOOR (core/door) through IZDOOR.leaf (69e5), panes and room cards as kit items; stable door ids |
| `src/72-hl-helpers.js` | 14.1 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/73-hl-carve.js` | 32.3 | [draw] | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/73b-hl-frame.js` | 32.1 | [draw] | 3 | 6 | 0 | 0 | 0 | 11 | 1 | 0 | 0 | 0 | 0 |  |
| `src/74-rep-dwell.js` | 32.7 | [draw] | 4 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-rep-trade.js` | 48.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/76-rep-civic.js` | 45.4 | [draw] | 12 | 0 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/76c-rep-capital.js` | 7.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/77-rep-guild.js` | 20.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/77b-rep-guild2.js` | 16.6 | [draw] | 14 | 1 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/78-rep-grand.js` | 52.9 | [draw] | 3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79-rep-land.js` | 30.1 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/79b-rep-salvage.js` | 14.8 | [draw] | 3 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79c-rep-apoc.js` | 25.3 | [draw] | 2 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79d-rep-scrap2.js` | 9.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/79e-rep-arco.js` | 12.9 | [draw] | 6 | 2 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/79f-rep-shipbreak.js` | 7.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-rus-dwell.js` | 24.5 | [draw] | 1 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/81-rus-village.js` | 29.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/81b-rus-salvage.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/84-tri-dwell.js` | 32.6 | [draw] | 6 | 4 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/85-tri-village.js` | 26.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/85b-tri-salvage.js` | 10.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88-hl-dress.js` | 10.4 | [draw] | 4 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-hl-trades.js` | 5.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Voth census table: plain data |
| `src/89y-hl-furnish.js` | 4.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | the draw adapter onto core/furnish (2026-10-05): the placement pass is core/furnish/50-core-furnish.js. Kept here: the seed rule (place in the list), the VERN frame, the murals' keep-clear boxes, full detail outside, world-placed town furniture (Roketstad), the shader colour step at kbake |
| `src/94-hl-anim.js` | 2.0 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |  |

Moved with the files from `settlements/highlands/PORT.md` on 2026-11-03 (MODULARITY-PLAN.md step 4); the tags and notes are Highlands'.
