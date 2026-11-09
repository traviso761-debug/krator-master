# biomes/abyssal-savannah: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 43 (23%) | 0 (0%) | 4 (2%) | 59 (31%) | 82 (44%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 21.1 | [web] | 18 | 1 | 3 | 1 | 0 | 1 | 4 | 0 | 0 | 0 | 0 |  |
| `src/47c-host-eastabyss-end.js` | 0.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/50-biome-absav-species.js` | 19.5 | [draw] | 0 | 2 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-absav-trees.js` | 22.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/60-biome-absav-floor.js` | 9.3 | [draw] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/70-biome-absav.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/80-host-ground.js` | 3.5 | [web] | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89a-host-atmos.js` | 1.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/89s-host-sky.js` | 2.2 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89w-host-water.js` | 3.0 | [draw] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/89z-host-build.js` | 4.9 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/99-host-take.js` | 10.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/rim/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/rim/45-host-stage.js` | 12.3 | [web] | 11 | 1 | 3 | 1 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | the stage: renderer, the map (river on KSPACE, zones), KFIRE history, the painted ground on KGROUND |
| `src/rim/50-biome-savrim-species.js` | 8.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the species records (harvest, Köppen, fire) are data; the materials and items are draw |
| `src/rim/52-biome-savrim-east.js` | 6.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the e rim's cousins: records (harvest, Köppen, fire) at load; BIO.kin deltas made on first use (cousins()) |
| `src/rim/55-biome-savrim-trees.js` | 3.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | builders: the fan palm and the umbrella thorn (the hyperjungle's G.tree), every number from KRAND |
| `src/rim/56-biome-savrim-southeast.js` | 12.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the se rim's records (harvest, Köppen) are data; its own builders (rust miombo, incense, cloud avocado, leaning fern) and items draw; the Bowl's cousins by BIO.kin |
| `src/rim/60-biome-savrim-floor.js` | 3.5 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the grass passes (rings by the burn's age, the blind grass's lanes): placement from KRAND cells, drawn by BIO.put |
| `src/rim/70-biome-savrim.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the kit's surface and kitEnd |
| `src/rim/83-host-far.js` | 3.7 | [web] | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/rim/87-host-land.js` | 11.1 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the land's placement (KRAND lattices) and its drawing (BIO.put, the mounds' mesh) |
| `src/rim/87e-host-own.js` | 10.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | split: the se rim's zones and placement (KRAND lattices) and the held cards of the Bowl's builders (BIO.snapSeg, holdTo) |
| `src/rim/88-host-build.js` | 1.3 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/rim/89-host-sky.js` | 1.5 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/rim/89a-host-atmos.js` | 2.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos bound: wind, A2C, wet ground, weather, height fog |
| `src/rim/89w-host-water.js` | 1.4 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/rim/99-host-take.js` | 6.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | the page handed to core/host: views, inspector, budgets, checks |
| `src/rim/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes
