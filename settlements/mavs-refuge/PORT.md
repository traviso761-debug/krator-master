# settlements/mavs-refuge: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 56 (8%) | 0 (0%) | 15 (2%) | 318 (46%) | 309 (44%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 5.8 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 7.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 8.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 14.9 | [web] | 21 | 6 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 54.3 | [web] | 62 | 0 | 19 | 6 | 0 | 9 | 25 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 29.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/32-branches.js` | 7.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-kit.js` | 31.6 | [draw] | 38 | 0 | 0 | 0 | 0 | 13 | 15 | 2 | 0 | 0 | 0 |  |
| `src/47-texture.js` | 8.4 | [draw] | 4 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/50-structure.js` | 17.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-furnish.js` | 7.7 | [draw] | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-arch.js` | 62.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-levels.js` | 69.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/57a-interiors.js` | 27.7 | [web] | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 1 | 0 | the interiors’ data: units, plans, piece records, the bake’s adoption, the edits overlay, the slots the simulation reads; no THREE (performance.now and TICKS only) |
| `src/57c-interiors-draw.js` | 25.1 | [web] | 17 | 1 | 0 | 0 | 10 | 12 | 0 | 0 | 0 | 2 | 0 | the interiors near the camera: geometry from 57a’s records, the light pool, the edits’ browser storage |
| `src/60-trees.js` | 40.4 | [web] | 35 | 2 | 0 | 0 | 2 | 8 | 8 | 5 | 0 | 0 | 0 |  |
| `src/62-jungle.js` | 45.3 | [draw] | 15 | 4 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/63-trails.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/72-lights.js` | 3.0 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 6.1 | [draw] | 16 | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78-life.js` | 50.8 | [web] | 21 | 0 | 0 | 0 | 7 | 42 | 4 | 5 | 0 | 0 | 0 | split: data inside host code |
| `src/79-spiders.js` | 60.0 | [draw] | 26 | 0 | 0 | 0 | 0 | 39 | 0 | 2 | 0 | 0 | 0 |  |
| `src/80-camera.js` | 11.2 | [web] | 7 | 0 | 9 | 16 | 1 | 2 | 0 | 1 | 2 | 0 | 0 |  |
| `src/81-glow.js` | 5.8 | [G native] | 13 | 2 | 0 | 0 | 0 | 2 | 5 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-flyers.js` | 80.6 | [web] | 49 | 0 | 0 | 0 | 2 | 8 | 6 | 3 | 0 | 0 | 0 |  |
| `src/85-probe.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.4 | [web] | 0 | 0 | 7 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/87-pathviz.js` | 3.2 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/98-start.js` | 0.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
