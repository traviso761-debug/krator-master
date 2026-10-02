# kits/post-apoc: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (0%) | 8 (2%) | 0 (0%) | 54 (14%) | 327 (84%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core.js` | 2.5 | [web] | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/20-tex.js` | 10.9 | [draw] | 2 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/22-mat.js` | 7.6 | [G shader] | 10 | 0 | 0 | 0 | 0 | 17 | 8 | 0 | 0 | 0 | 0 |  |
| `src/30-geo.js` | 18.9 | [draw] | 47 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |  |
| `src/32-cores.js` | 11.5 | [draw] | 2 | 0 | 0 | 0 | 0 | 48 | 0 | 0 | 0 | 0 | 0 |  |
| `src/34-adds.js` | 23.0 | [draw] | 1 | 0 | 0 | 0 | 0 | 42 | 0 | 0 | 0 | 0 | 0 |  |
| `src/36-def.js` | 21.6 | [draw] | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/40-dw-small.js` | 31.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 41 | 0 | 0 | 0 | 0 | 0 |  |
| `src/42-lg-dwell.js` | 32.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 0 |  |
| `src/44-civic.js` | 25.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 38 | 0 | 0 | 0 | 0 | 0 |  |
| `src/46-shops.js` | 15.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |  |
| `src/48-industry.js` | 21.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/50-farm.js` | 26.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 41 | 0 | 0 | 0 | 0 | 0 |  |
| `src/52-defence.js` | 22.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 | 0 |  |
| `src/54-compound.js` | 29.7 | [draw] | 2 | 0 | 0 | 0 | 0 | 37 | 0 | 0 | 0 | 0 | 0 |  |
| `src/56-arena.js` | 17.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 32 | 0 | 0 | 0 | 0 | 0 |  |
| `src/58-dock.js` | 17.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 38 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89-rows.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/90-scene.js` | 8.5 | [web] | 19 | 3 | 1 | 0 | 2 | 2 | 3 | 0 | 0 | 0 | 0 |  |
| `src/91-probe.js` | 3.5 | [web] | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/91f-furnish.js` | 7.3 | [web] | 2 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/91n-night.js` | 9.9 | [web] | 15 | 2 | 3 | 1 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |  |
| `src/92-camera.js` | 10.7 | [web] | 13 | 0 | 21 | 14 | 4 | 2 | 0 | 0 | 3 | 0 | 0 |  |
| `src/93-anim.js` | 8.6 | [web] | 14 | 0 | 0 | 0 | 3 | 4 | 6 | 3 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
