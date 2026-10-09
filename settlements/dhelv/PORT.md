# settlements/dhelv: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 72 (32%) | 0 (0%) | 0 (0%) | 145 (65%) | 6 (3%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 3.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-dhelv-layout.js` | 34.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45-dhelv-bio.js` | 9.5 | [web] | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/48-dhelv-flows.js` | 3.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the vents and THRONE.flowHistory over the layout's land: data |
| `src/49-dhelv-grove.js` | 15.1 | [web] | 18 | 0 | 0 | 0 | 2 | 4 | 10 | 1 | 0 | 0 | 0 | the variants' growing and instancing (a port grows them in its own nursery); the placement (a seeded stream on the shelf's mask) is data |
| `src/72-dhelv-nav.js` | 11.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the nav graph and its checks (core/walk, the cavern): data |
| `src/74-dhelv-sim.js` | 22.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the ramblers' world into core/simulation, its checks: data |
| `src/86-dhelv-extras.js` | 6.4 | [draw] | 5 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | section 13's extras the defs do not draw (the shafts, the sentinels, the buried well, the decoy, the mirrors' light); where they are is the layout's (41, data) |
| `src/88-dhelv-fungi.js` | 3.5 | [web] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | the fungi pass (a port plants its own along the layout's ways) |
| `src/89-dhelv-hills.js` | 8.8 | [web] | 9 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | the hills' drawing, walk floors and flora pass (a port plants its own); the hills and their pads are the layout's (41, data) |
| `src/90-dhelv-scene.js` | 58.6 | [web] | 56 | 0 | 1 | 0 | 10 | 21 | 3 | 5 | 0 | 0 | 0 |  |
| `src/91-dhelv-probe.js` | 18.4 | [web] | 3 | 0 | 0 | 0 | 3 | 1 | 0 | 1 | 0 | 0 | 0 |  |
| `src/92-dhelv-export.js` | 5.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the export to godot/data/dhelv (window._api): reads the data, holds none |
| `src/93-dhelv-map.js` | 5.6 | [web] | 1 | 3 | 2 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/94-dhelv-light.js` | 8.4 | [web] | 14 | 1 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/95-dhelv-life.js` | 8.7 | [web] | 12 | 0 | 2 | 2 | 1 | 3 | 0 | 2 | 2 | 0 | 0 | split: data inside host code |

## Notes

(none yet: the split lists and the overrides go here)
