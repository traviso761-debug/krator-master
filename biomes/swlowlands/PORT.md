# biomes/swlowlands: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (0%) | 0 (0%) | 13 (6%) | 37 (18%) | 155 (75%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.4 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 19.8 | [web] | 27 | 3 | 3 | 1 | 0 | 5 | 9 | 0 | 0 | 0 | 0 | split: terrainH, water and fields are data for core/terrain; the DOM goes to core/host |
| `src/50-biome-swlowlands-species.js` | 56.5 | [draw] | 0 | 8 | 0 | 0 | 0 | 7 | 14 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-swlowlands-trees.js` | 61.4 | [draw] | 0 | 1 | 0 | 0 | 0 | 38 | 0 | 0 | 0 | 0 | 0 | placement pass: `SWLOW.buildTrees` (line 516); `mk` (line 520) makes a record and the `BIO.grid` calls push it to `TREES`, with the LOD level `T.lv` set there (see TODO.md, level-free records). Draw pass: the `TREES.forEach` loop (line 589) in the same function, which calls the per-species builder `B[sp]` (hero and stand-in) or `buildFar`/`buildFarSmall` for the far impostor. The two passes share one function but not one loop; `SWLOW.treeAt` (line 599) places one tree at a point and draws it in one call |
| `src/60-biome-swlowlands-floor.js` | 24.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then BIO.put) |
| `src/65-biome-swlowlands-dress.js` | 7.8 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.upFaces, downFaces, sideFaces and ledgePoints over the host's shells, then BIO.put); not a BIO.grid pass |
| `src/70-biome-swlowlands.js` | 0.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-host-sky.js` | 13.2 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | becomes a core/atmos sky preset |
| `src/85-host-tower.js` | 5.1 | [draw] | 8 | 2 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | a preview prop builder (one Girder tower); no port |
| `src/88-host-build.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-host-camera.js` | 8.5 | [web] | 5 | 0 | 4 | 7 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 5.4 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (2026-10-03): the kit's own copies.** PRNG and noise: none of its own. `reseed`/`rng` (mulberry32), `h3` (a sin hash), `vnoise` and `fbm` are the one copy in `core/biome/10-core-head.js` (`BIO.fn`); its `rng` already equals `KRAND.stream` (`core/PORT.md`), and the sin-based `h3`, `vnoise` and `fbm` move to `core/rand` in the biome reseeding event. Terrain: its own `baseH` (line 73) and `terrainH` (line 78) in `src/45-host-stage.js` and the climate-field bake `FC`, which is the data `core/terrain` replaces. Palette: its own `SWLOW.PAL`, built in `src/50-biome-swlowlands-species.js` (line 35).
