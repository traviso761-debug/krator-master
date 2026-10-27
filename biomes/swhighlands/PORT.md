# biomes/swhighlands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 5 (5%) | 8 (8%) | 1 (1%) | 39 (38%) | 49 (48%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 19.2 | [web] | 7 | 0 | 3 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | the station's host: renderer and lights ([web]); the ground records (KRELIEF ranges, gaps, the gorge's steps, the cave patch), the water courses and the fields are data on core/terrain and core/water, baked into KFIELD for Godot. split: the records could move to a [G data] fragment |
| `src/47-host-land.js` | 6.3 | [draw] | 6 | 1 | 0 | 0 | 0 | 1 | 6 | 0 | 0 | 0 | 0 | the rock bodies (KSTACKS records, drawn) and the strata shader on the rock; the records cross over through KSTACKS.export |
| `src/50-biome-swhighlands-species.js` | 14.5 | [draw] | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: species and plant data (tags, palettes) beside the kit's items and materials |
| `src/55-biome-swhighlands-trees.js` | 13.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: placement by KRAND cell (records: SWHI.TREES, SWHI.LOGS) then the builders draw them in the same pass |
| `src/56-biome-swhighlands-treeline.js` | 10.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | station 6: placement by KRAND cell then the builders draw (split: records SWHI.TREES, SWHI.TREELINE.glass) |
| `src/60-biome-swhighlands-floor.js` | 2.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: places (KRAND cells) and draws (BIO.put) in one pass |
| `src/70-biome-swhighlands.js` | 1.5 | [web] | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | the biome's public surface: orders the passes (timed with performance.now: split: data inside host code), tags of a hit |
| `src/82-host-far.js` | 8.1 | [draw] | 9 | 1 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 0 | the far country (KFAR lattice, plain data) drawn, and the farm's walls from KRELIEF.fields hedges |
| `src/84-host-ground.js` | 15.1 | [web] | 14 | 5 | 0 | 0 | 2 | 3 | 4 | 0 | 0 | 0 | 0 | the ground's paint (canvas) and shader (KGROUND, KSTRATA, KHORIZON), the mist sprites |
| `src/88-host-build.js` | 2.0 | [web] | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | the build order |
| `src/89a-host-atmos.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/atmos bound to the page (bindHost, weather, height fog, rain cover) |
| `src/89s-host-sky.js` | 1.3 | [G native] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shared sky (ATMOS.skyBiome): Godot has its own sky |
| `src/89w-host-water.js` | 2.2 | [draw] | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | core/water's draws of the page's records |
| `src/99-host-take.js` | 12.1 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | the page handed to core/host (KHOST.take): the views, the inspector's words, the budgets and the kit's own checks |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Station 6 (the treeline) overlays `stations/treeline/*.js` on `src/` (`build.py --station treeline`): its host fragments have the same roles and tags as `src/`'s of the same name (45 [web], 47 [draw], 82 [draw], 84 [web], 88/89a/99 [web], 89s [G native], 89w empty); `47c-host-ehigh-end.js` [web] closes the eastern highlands' kit read in place.

(none yet: the split lists and the overrides go here)
