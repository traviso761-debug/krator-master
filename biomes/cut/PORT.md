# biomes/cut: port audit

*Written by hand in `tools/audit_port.py`'s shape (GODOT-PLAN.md, section 3): rerun the tool to refresh the counts; it keeps the Tag and Note cells.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-cut-field.js` | 12.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the bowl, the field, the warp: no three.js, no DOM (tests/test-cut.js) |
| `src/45-host-stage.js` | 8.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | station 1's STAGE (its ground, zones and fields are data a port re-reads) |
| `src/46-biome-cut-warp.js` | 8.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the warp laid on a read-in kit's stores at placement: the rules are 41's |
| `src/47-host-land.js` | 9.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | renderer, light, ground mesh, far ground, BIO.init |
| `src/50-biome-cut-species.js` | 13.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the natives' records (data) and their geometries and materials |
| `src/55-biome-cut-natives.js` | 10.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: CUT.plan (records, KRAND per cell) and CUT.draw |
| `src/57-biome-cut-melon-lichen.js` | 5.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the melon and lichen planners (records) and their drawing |
| `src/60-biome-cut-camp.js` | 6.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: the camp's record and its drawing |
| `src/70-biome-cut.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | CUT.build: the plan, then the draw |
| `src/88-host-build.js` | 2.5 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the build order |
| `src/89a-host-atmos.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 3.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shared sky, the ridges cast from the bowl, the echoes' light |
| `src/89t-host-weather.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindWeather |
| `src/89w-host-water.js` | 3.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the lake and the stations' pools on core/water |
| `src/99-host-take.js` | 9.9 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | views, inspector, compass, checks, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `stations/wall/00-head.html` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `stations/wall/45-host-stage.js` | 7.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | station 2's STAGE |
| `stations/face/00-head.html` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `stations/face/45-host-stage.js` | 7.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | station 3's STAGE (KRELIEF's range on the lip) |
| `stations/face/48z-host-face.js` | 2.0 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the polished face's mesh |

## Notes

- **The data side is `41-cut-field.js`**: the bowl on the 4.22 survey, `CUT.field`, `CUT.warp` (its 3x3 and the bite and echo draws on core/rand), `CUT.snap`, `CUT.quant`, `CUT.airScale`, `CUT.horizon`. Godot reads the same records (`CUT.PLANTS`, the camp's) and applies the same matrices: a plant's lean and stretch are in its instance matrix already.
- **The read-in kits' warp** (`46`) is the one place the kit changes another kit's output; it does so on the core's stores between that kit's builders and the bake, so an export carries the warped matrices and triangles.
- The counts are zero until `tools/audit_port.py` is run on the merged tree (it was not run in the build session: other sessions shared the tools).
