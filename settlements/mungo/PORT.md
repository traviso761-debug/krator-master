# settlements/mungo: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 110 (52%) | 0 (0%) | 5 (2%) | 64 (30%) | 35 (16%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 6.2 | [web] | 0 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/01b-build-open.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/05b-mungo-palette.js` | 1.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the life layer's dress by organisation (data) |
| `src/10-core.js` | 16.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/20-stage.js` | 15.3 | [web] | 22 | 8 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/30-layout.js` | 54.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the layout as records only (SITES_L, REED, ST, RG, NAV, PORTS): no geometry |
| `src/40-ground.js` | 6.7 | [draw] | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | canvas painters: TEX.def or bake |
| `src/65r-reed-village.js` | 4.2 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 2 | 0 | 0 | 0 | split: calls the reed kit (REEDKIT_MAKE) with the layout records; lifts its meshes for the picker; the interiors finisher |
| `src/68-place.js` | 14.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the placement pass: records into PLACED via buildAsset (draws as it places: Locus's pattern) |
| `src/69b-locus-biohost.js` | 4.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/69z-locus-flora.js` | 5.0 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/71g-mungo-grid.js` | 8.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |  |
| `src/72-lights.js` | 4.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |  |
| `src/75-terrain.js` | 13.4 | [draw] | 23 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/78b-mungo-world.js` | 16.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the world as SIM data: nav layers (grid routes on RG), places from the built geometry, ports, SIM.load of world/*.json, SIM.populate |
| `src/80-camera.js` | 13.3 | [web] | 7 | 0 | 10 | 16 | 1 | 2 | 0 | 1 | 2 | 0 | 0 |  |
| `src/84-mungo-life.js` | 18.3 | [web] | 8 | 0 | 5 | 1 | 2 | 18 | 0 | 2 | 0 | 0 | 0 | split: the embodiment reads SIM.pose (port: the Godot life autoload); the census panel and path-viz registry are [web] |
| `src/85-probe.js` | 1.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88c-mungo-minimap.js` | 1.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/reed/90-mungo-reed-glue.js` | 6.2 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the Reed Lake kit's mungo_reed_village def and the API Mungo calls; runs inside the wrapped kit |

## Notes

(none yet: the split lists and the overrides go here)
