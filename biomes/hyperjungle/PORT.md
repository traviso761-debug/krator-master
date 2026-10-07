# biomes/hyperjungle: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 2 (1%) | 0 (0%) | 12 (8%) | 20 (13%) | 116 (78%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.3 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/41-hyperjungle-globals.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/45-host-stage.js` | 4.6 | [web] | 14 | 1 | 3 | 1 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | split: terrainH, water and fields are data for core/terrain; the DOM goes to core/host |
| `src/50-biome-hyperjungle-species.js` | 27.1 | [draw] | 9 | 3 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-hyperjungle-trees.js` | 29.6 | [draw] | 2 | 1 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | placement pass: `HYPERJUNGLE.buildTrees` (line 299) places the hero trees, the far ring and the saplings: `mk` (line 303) makes a record, `BIO.scatter` and `BIO.grid` call it, and the records go to `TREES` and `SAPS`. Draw pass: the `heroes.forEach(buildHero)`, `fars.forEach(buildFar)` and `SAPS.forEach(buildSapling)` loop (line 320) in the same function, which reads the records and draws them. Split in one function, not yet in two |
| `src/58-biome-hyperjungle-fauna.js` | 14.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 21 | 0 | 1 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then the body build) |
| `src/60-biome-hyperjungle-floor.js` | 33.0 | [draw] | 1 | 1 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then BIO.put) |
| `src/65-biome-hyperjungle-dress.js` | 6.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.upFaces, downFaces, sideFaces and ledgePoints over the host's shells, then BIO.put); not a BIO.grid pass |
| `src/70-biome-hyperjungle.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/82-host-sky.js` | 12.2 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | becomes a core/atmos sky preset |
| `src/85-host-tower.js` | 5.2 | [draw] | 8 | 2 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | a preview prop builder (one Girder tower); no port |
| `src/88-host-build.js` | 0.9 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-host-camera.js` | 6.6 | [web] | 5 | 0 | 4 | 7 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 5.0 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (2026-10-03): the kit's own copies.** PRNG and noise: none of its own. `reseed`/`rng` (mulberry32), `h3` (a sin hash), `vnoise` and `fbm` are the one copy in `core/biome/10-core-head.js` (`BIO.fn`); its `rng` already equals `KRAND.stream` (`core/PORT.md`), and the sin-based `h3`, `vnoise` and `fbm` move to `core/rand` in the biome reseeding event. Terrain: its own `terrainH` (line 28) in `src/45-host-stage.js`, which is the data `core/terrain` replaces. Palette: its own `HYPERJUNGLE.PAL`, built in `src/50-biome-hyperjungle-species.js` (line 38).
