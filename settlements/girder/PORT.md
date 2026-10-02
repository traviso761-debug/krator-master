# settlements/girder: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 42 (7%) | 0 (0%) | 14 (3%) | 318 (57%) | 185 (33%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 6.5 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05-palette.js` | 7.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/10-core.js` | 8.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 14.5 | [web] | 21 | 6 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/21-sky.js` | 54.3 | [web] | 62 | 0 | 19 | 6 | 0 | 9 | 25 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 21.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/32-branches.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-kit.js` | 25.4 | [draw] | 37 | 0 | 0 | 0 | 0 | 13 | 15 | 2 | 0 | 0 | 0 |  |
| `src/47-texture.js` | 9.3 | [draw] | 4 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/50-structure.js` | 17.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 40 | 0 | 0 | 0 | 0 | 0 |  |
| `src/53-furnish.js` | 9.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-arch.js` | 51.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 33 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-interiors.js` | 16.7 | [web] | 5 | 0 | 0 | 0 | 8 | 3 | 1 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/58-overgrowth.js` | 14.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-trees.js` | 39.2 | [web] | 35 | 2 | 0 | 0 | 2 | 8 | 8 | 5 | 0 | 0 | 0 |  |
| `src/62-jungle.js` | 46.0 | [draw] | 19 | 6 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-lights.js` | 3.1 | [G native] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 12.0 | [draw] | 22 | 0 | 0 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78-life.js` | 60.6 | [web] | 30 | 0 | 0 | 0 | 13 | 38 | 7 | 6 | 0 | 0 | 0 | split: data inside host code |
| `src/80-camera.js` | 11.2 | [web] | 7 | 0 | 10 | 16 | 1 | 2 | 0 | 1 | 2 | 0 | 0 |  |
| `src/81-glow.js` | 4.7 | [G native] | 12 | 2 | 0 | 0 | 0 | 2 | 3 | 2 | 0 | 0 | 0 | shader hook inside |
| `src/82-daynight.js` | 6.2 | [G native] | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/83-walk.js` | 19.4 | [web] | 1 | 0 | 6 | 8 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/84-flyers.js` | 88.1 | [web] | 37 | 0 | 0 | 0 | 2 | 8 | 6 | 3 | 0 | 0 | 0 |  |
| `src/85-probe.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-inspect.js` | 3.7 | [web] | 0 | 0 | 7 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/87-pathviz.js` | 3.0 | [web] | 5 | 0 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/98-start.js` | 0.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-tail.html` | 0.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
