# biomes/xanadu: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (0%) | 0 (0%) | 12 (6%) | 33 (16%) | 160 (78%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.4 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 17.8 | [web] | 7 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | split: terrainH, water and fields are data for core/terrain; the DOM goes to core/host |
| `src/46-host-ground.js` | 10.7 | [draw] | 21 | 2 | 0 | 0 | 0 | 4 | 9 | 0 | 0 | 0 | 0 | builds the ground and water meshes from terrainH and the fields: the Godot terrain bake replaces it |
| `src/50-biome-xanadu-species.js` | 52.6 | [draw] | 0 | 4 | 0 | 0 | 0 | 16 | 5 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-xanadu-trees.js` | 66.0 | [draw] | 0 | 1 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 | placement pass: `XANADU.buildTrees` (line 535); `mk` (line 539) makes a record and the `BIO.grid` calls push it to `TREES`, with the LOD level `T.lv` set there (see TODO.md, level-free records). Draw pass: the `TREES.forEach` loop (line 613) in the same function, which calls the per-species builder `B[sp]` (hero and stand-in) or `buildFar` for the far impostor. The two passes share one function but not one loop; `XANADU.treeAt` (line 625) places one tree at a point and draws it in one call |
| `src/60-biome-xanadu-floor.js` | 19.2 | [draw] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then BIO.put) |
| `src/65-biome-xanadu-dress.js` | 5.4 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.upFaces, downFaces, sideFaces and ledgePoints over the host's shells, then BIO.put); not a BIO.grid pass |
| `src/70-biome-xanadu.js` | 1.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-host-sky.js` | 12.2 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | becomes a core/atmos sky preset |
| `src/85-host-dome.js` | 4.3 | [draw] | 14 | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 0 | 0 |  |
| `src/86-host-fountain.js` | 2.1 | [draw] | 3 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 1.0 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-host-camera.js` | 9.1 | [web] | 5 | 0 | 4 | 7 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 2.5 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (2026-10-03): the kit's own copies.** PRNG and noise: none of its own. `reseed`/`rng` (mulberry32), `h3` (a sin hash), `vnoise` and `fbm` are the one copy in `core/biome/10-core-head.js` (`BIO.fn`); its `rng` already equals `KRAND.stream` (`core/PORT.md`), and the sin-based `h3`, `vnoise` and `fbm` move to `core/rand` in the biome reseeding event; the one other source is `Math.random()` in `86-host-fountain.js` (line 18), unseeded spray particles for the preview, nothing that crosses to Godot. Terrain: its own `terrainH` (line 134) in `src/45-host-stage.js` and the climate-field bake `FC`, which is the data `core/terrain` replaces. Palette: its own `XANADU.PAL`, built in `src/50-biome-xanadu-species.js` (line 30).
