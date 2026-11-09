# biomes/farside: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (1%) | 0 (0%) | 0 (0%) | 42 (31%) | 89 (68%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/44z-host-shell.js` | 2.1 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | the page's shell |
| `src/45-host-stage.js` | 13.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the station's landform and fields are data (closed functions); the shell is not here |
| `src/47-host-land.js` | 17.0 | [draw] | 16 | 1 | 0 | 0 | 2 | 8 | 5 | 0 | 0 | 0 | 0 | split: the fields and masks are data; the ground and far meshes and their shader draw |
| `src/50-biome-farside-species.js` | 25.4 | [draw] | 0 | 1 | 0 | 0 | 0 | 21 | 0 | 0 | 0 | 0 | 0 | split: the species, palettes and placeholders are data; the geometries and materials draw |
| `src/55-biome-farside-trees.js` | 12.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | the stands' records (FARSIDE.STANDS) are data; the builders write buckets and items |
| `src/60-biome-farside-floor.js` | 10.1 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the floor's passes (core/rand grids) write items |
| `src/65-biome-farside-dress.js` | 3.8 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the dressing writes items |
| `src/70-biome-farside.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the build order |
| `src/86-host-works.js` | 12.7 | [draw] | 15 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: the works' records (core/tags, Eternian furniture) are data; their meshes draw (to move to kits/eternian) |
| `src/88-host-build.js` | 5.3 | [web] | 2 | 0 | 1 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89a-host-atmos.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 2.8 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.sky at the station's pixel |
| `src/89t-host-air.js` | 1.8 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the final rebuild's air: wind, A2C, height fog, the fog belt, the rain cover (core/atmos calls) |
| `src/89w-host-water.js` | 7.6 | [draw] | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | core/water records and draws |
| `src/89x-host-weather.js` | 0.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindWeather |
| `src/99-host-take.js` | 13.3 | [web] | 3 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | the views, the inspector, the checks |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

The data a Godot port needs is the records: each station's fields (`STAGE.fields`, closed functions of x, z), the stands
(`FARSIDE.STANDS`: key, x, z, y0, H, n, form, seed), the works (core/tags furniture records) and core/water's surfaces.
Every plant is built from its own `KRAND.hash` seed, so a GDScript builder can rebuild any one from its record.
