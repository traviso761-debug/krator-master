# biomes/cut: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 14 (11%) | 0 (0%) | 3 (2%) | 50 (40%) | 59 (47%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-cut-field.js` | 12.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the bowl, the field, the warp: no three.js, no DOM (tests/test-cut.js) |
| `src/45-host-stage.js` | 10.1 | [web] | 0 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | station 1's STAGE (its ground, zones and fields are data a port re-reads) |
| `src/46-biome-cut-warp.js` | 10.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the warp laid on a read-in kit's stores at placement: the rules are 41's |
| `src/47-host-land.js` | 11.5 | [web] | 16 | 2 | 1 | 0 | 0 | 2 | 4 | 0 | 0 | 0 | 0 | renderer, light, ground mesh, far ground, BIO.init |
| `src/50-biome-cut-species.js` | 14.5 | [draw] | 0 | 3 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: the natives' records (data) and their geometries and materials |
| `src/55-biome-cut-natives.js` | 12.3 | [draw] | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: CUT.plan (records, KRAND per cell) and CUT.draw |
| `src/57-biome-cut-melon-lichen.js` | 9.2 | [draw] | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: the melon and lichen planners (records) and their drawing |
| `src/60-biome-cut-camp.js` | 6.4 | [draw] | 0 | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: the camp's record and its drawing |
| `src/70-biome-cut.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | CUT.build: the plan, then the draw |
| `src/88-host-build.js` | 4.5 | [web] | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | the build order |
| `src/89a-host-atmos.js` | 0.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 3.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shared sky, the ridges cast from the bowl, the echoes' light |
| `src/89t-host-weather.js` | 2.6 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindWeather, the wet hollows, the height fog (the dawn mist, the walls' cloud band), the rain cover |
| `src/89w-host-water.js` | 6.1 | [draw] | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the lake (no breakers), its plume, the creek (a WATER.flow) and the stations' pools on core/water |
| `src/89zy-host-bend.js` | 2.4 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | KWARP's bend on ?bend=1 (off at load): Godot needs the same warp in its own shaders (core/shader/README.md) (2026-11-04) |
| `src/89zz-host-shadow.js` | 3.0 | [G native] | 1 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | KSHADOW on ?shadow=1 (off at load): Godot's DirectionalLight3D shadows (2026-11-04) |
| `src/99-host-take.js` | 13.9 | [web] | 2 | 0 | 6 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | views, inspector, compass, checks, KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- **The data side is `41-cut-field.js`**: the bowl on the 4.22 survey, `CUT.field`, `CUT.warp` (its 3x3 and the bite and echo draws on core/rand), `CUT.snap`, `CUT.quant`, `CUT.airScale`, `CUT.horizon`. Godot reads the same records (`CUT.PLANTS`, the camp's) and applies the same matrices: a plant's lean and stretch are in its instance matrix already.
- **The read-in kits' warp** (`46`) is the one place the kit changes another kit's output; it does so on the core's stores between that kit's builders and the bake, so an export carries the warped matrices and triangles.
- The counts are zero until `tools/audit_port.py` is run on the merged tree (it was not run in the build session: other sessions shared the tools).
