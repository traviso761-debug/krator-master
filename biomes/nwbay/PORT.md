# biomes/nwbay: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 1 (0%) | 0 (0%) | 10 (4%) | 83 (30%) | 184 (66%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.4 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 61.0 | [web] | 72 | 5 | 3 | 1 | 0 | 16 | 14 | 5 | 0 | 0 | 0 | split: terrainH, water and fields are data for core/terrain; the DOM goes to core/host |
| `src/50-biome-nwbay-species.js` | 50.3 | [draw] | 0 | 3 | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-nwbay-trees.js` | 73.3 | [draw] | 0 | 1 | 0 | 0 | 0 | 35 | 0 | 0 | 0 | 0 | 0 | placement pass: `NWBAY.buildTrees`; `mk` makes a record and the `BIO.grid` calls push it to `TREES`, with the LOD level `T.lv` set there (see TODO.md, level-free records). Draw pass: `NWBAY.plantTrees` (56-variants) builds the impostors with `buildFar` and stamps every hero from the six variants per species the per-species builders `B[sp]` grow once; `NWBAY.buildReedBeds` places and draws in one pass |
| `src/56-biome-nwbay-variants.js` | 9.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: the variant choice (by height and wet, the quantiles) and `NWBAY.make` are data; the nursery captures the kit's stores into BufferGeometry and stamps instances (Matrix4 through BIO.host.THREE, which the audit cannot see) |
| `src/60-biome-nwbay-floor.js` | 19.3 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then BIO.put) |
| `src/65-biome-nwbay-dress.js` | 9.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.upFaces, downFaces, sideFaces and ledgePoints over the host's shells, then BIO.put); not a BIO.grid pass |
| `src/70-biome-nwbay.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-biome-nwbay-fauna.js` | 12.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 3 | 6 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then the body build) |
| `src/82-host-sky.js` | 10.2 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | becomes a core/atmos sky preset |
| `src/85-host-tower.js` | 5.3 | [draw] | 8 | 2 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | a preview prop builder (one Girder tower); no port |
| `src/86-host-jetty.js` | 3.9 | [draw] | 3 | 1 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 2.2 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-host-camera.js` | 10.5 | [web] | 5 | 0 | 4 | 7 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 7.3 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (2026-10-03): the kit's own copies.** PRNG and noise: none of its own since 2026-10-03; the kit reads `core/biome/` (10, 20, 30, 40, 42, 43) through `CORE_BIOME` like the other nine, so `reseed`/`rng`, `h3`, `vnoise` and `fbm` are the shared ones and `BIO.export` exists (`KNOWN_ISSUES.md`). Terrain: its own `terrainH` (line 149; it reads `stackAt`/`stackTop` before it falls back to `groundH`) in `src/45-host-stage.js` and the climate-field bake `FC`, which is the data `core/terrain` replaces. Palette: its own `NWBAY.PAL`, built in `src/50-biome-nwbay-species.js` (line 39).
