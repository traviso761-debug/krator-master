# biomes/nsemiarid: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 30 (13%) | 11 (5%) | 14 (6%) | 41 (19%) | 127 (57%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-scene.js` | 1.9 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45b-host-stage.js` | 12.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45c-host-ground.js` | 10.8 | [G shader] | 6 | 3 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 |  |
| `src/50-biome-nsemiarid-species.js` | 59.3 | [draw] | 0 | 5 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-nsemiarid-trees.js` | 36.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/60-biome-nsemiarid-floor.js` | 28.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-biome-nsemiarid.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-host-sky.js` | 14.1 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | shader hook inside |
| `src/86-host-variants.js` | 14.1 | [web] | 11 | 0 | 0 | 0 | 2 | 1 | 11 | 3 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 1.8 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89b-host-atmos.js` | 5.5 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | core/atmos and core/water bound: the wind setting (ATMOS.windScale), NSWIND, the water drawn from its records (in Godot: the Atmos autoload, water_import.gd) |
| `src/89c-host-seeds.js` | 12.3 | [draw] | 12 | 2 | 0 | 0 | 0 | 4 | 0 | 2 | 0 | 0 | 0 | the seed weather and seed flight: host particles on core/atmos's wind (in Godot, GPU particles on atm_wind; the release rule is data) |
| `src/98-host-checks.js` | 13.9 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |  |
| `src/99-host-take.js` | 9.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the page handed to core/host (KHOST.take): the preset views, the inspector's words, the budgets and the kit's own checks |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
