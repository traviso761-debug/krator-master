# biomes/farside: port audit

*Written by hand in the shape `tools/audit_port.py` writes (GODOT-PLAN.md, section 3); rerun it to refresh the numbers. Edit the **Tag** and **Note** cells.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| Fragment | KB | Tag | Uses | Note |
|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | | page shell |
| `src/44z-host-shell.js` | 2.1 | [web] | | the page's shell |
| `src/45-host-stage.js` | 6.3 | [web] | | split: the station's landform and fields are data (closed functions); the shell is not here |
| `src/47-host-land.js` | 10.5 | [draw] | | split: the fields and masks are data; the ground and far meshes and their shader draw |
| `src/50-biome-farside-species.js` | 16.1 | [draw] | | split: the species, palettes and placeholders are data; the geometries and materials draw |
| `src/55-biome-farside-trees.js` | 11.2 | [draw] | | the stands' records (FARSIDE.STANDS) are data; the builders write buckets and items |
| `src/60-biome-farside-floor.js` | 6.4 | [draw] | | the floor's passes (core/rand grids) write items |
| `src/65-biome-farside-dress.js` | 3.6 | [draw] | | the dressing writes items |
| `src/70-biome-farside.js` | 1.1 | [G data] | | the build order |
| `src/86-host-works.js` | 9.2 | [draw] | | split: the works' records (core/tags, Eternian furniture) are data; their meshes draw (to move to kits/eternian) |
| `src/88-host-build.js` | 1.7 | [web] | | split: data inside host code |
| `src/89a-host-atmos.js` | 0.6 | [web] | | ATMOS.bindHost |
| `src/89s-host-sky.js` | 2.8 | [web] | | ATMOS.sky at the station's pixel |
| `src/89w-host-water.js` | 3.7 | [draw] | | core/water records and draws |
| `src/89x-host-weather.js` | 0.7 | [web] | | ATMOS.bindWeather |
| `src/99-host-take.js` | 8.6 | [web] | | the views, the inspector, the checks |
| `src/99-tail.html` | 0.0 | [web] | | page shell |
| `stations/strand/45-host-stage.js` | 4.6 | [web] | | as src/45 |
| `stations/front/45-host-stage.js` | 3.8 | [web] | | as src/45 |
| `stations/cloud/45-host-stage.js` | 3.3 | [web] | | as src/45 |

## Notes

The data a Godot port needs is the records: each station's fields (`STAGE.fields`, closed functions of x, z), the stands
(`FARSIDE.STANDS`: key, x, z, y0, H, n, form, seed), the works (core/tags furniture records) and core/water's surfaces.
Every plant is built from its own `KRAND.hash` seed, so a GDScript builder can rebuild any one from its record.
