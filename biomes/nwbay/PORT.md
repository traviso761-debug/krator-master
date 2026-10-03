# biomes/nwbay: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 12 (5%) | 13 (5%) | 10 (4%) | 59 (23%) | 165 (63%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 2.4 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/10-core-head.js` | 5.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/20-core-kit.js` | 11.7 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 5 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/30-core-foliage.js` | 13.3 | [G shader] | 0 | 3 | 0 | 0 | 0 | 5 | 10 | 0 | 0 | 0 | 0 |  |
| `src/40-core-place.js` | 6.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |  |
| `src/45-host-stage.js` | 43.2 | [web] | 58 | 5 | 3 | 1 | 0 | 13 | 13 | 3 | 0 | 0 | 0 | split: terrainH, water and fields are data for core/terrain; the DOM goes to core/host |
| `src/50-biome-nwbay-species.js` | 43.8 | [draw] | 0 | 3 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-nwbay-trees.js` | 61.1 | [draw] | 0 | 1 | 0 | 0 | 0 | 28 | 0 | 0 | 0 | 0 | 0 | placement pass: `NWBAY.buildTrees` (line 530); `mk` (line 534) makes a record and the `BIO.grid` calls push it to `TREES`, with the LOD level `T.lv` set there (see TODO.md, level-free records). Draw pass: the `TREES.forEach` loop (line 579) in the same function, which calls the per-species builder `B[sp]` (hero and stand-in) or `buildFar` for the far impostor. The two passes share one function but not one loop; `NWBAY.buildReedBeds` (line 511) places and draws in one pass |
| `src/60-biome-nwbay-floor.js` | 18.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then BIO.put) |
| `src/65-biome-nwbay-dress.js` | 9.6 | [draw] | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | split: places and draws in one pass (BIO.upFaces, downFaces, sideFaces and ledgePoints over the host's shells, then BIO.put); not a BIO.grid pass |
| `src/70-biome-nwbay.js` | 1.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/75-biome-nwbay-fauna.js` | 12.6 | [draw] | 0 | 0 | 0 | 0 | 0 | 4 | 3 | 6 | 0 | 0 | 0 | split: places and draws in one pass (BIO.grid then the body build) |
| `src/82-host-sky.js` | 10.0 | [G native] | 19 | 1 | 0 | 0 | 0 | 3 | 6 | 0 | 0 | 0 | 0 | becomes a core/atmos sky preset |
| `src/85-host-tower.js` | 4.8 | [draw] | 8 | 2 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | a preview prop builder (one Girder tower); no port |
| `src/86-host-jetty.js` | 3.4 | [draw] | 3 | 1 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |  |
| `src/88-host-build.js` | 1.9 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/90-host-camera.js` | 8.3 | [web] | 5 | 0 | 4 | 7 | 3 | 0 | 0 | 1 | 2 | 0 | 0 |  |
| `src/91-host-probe.js` | 3.6 | [web] | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

**Hand pass (2026-10-03): the kit's own copies.** PRNG and noise: its own, because this kit runs on an old copy of the biome core. `src/10-core-head.js` holds `reseed`/`rng`, `h3`, `vnoise` and `fbm` (an older copy of `core/biome/10-core-head.js`, without its `vnoise` cell cache), and `20-core-kit.js`, `30-core-foliage.js` and `40-core-place.js` are old copies too; it has no `42-core-export.js`, so no `BIO.export` (`PORT-INDEX.md`). Left as they are: this pass does not re-vendor the core. Terrain: its own `terrainH` (line 149; it reads `stackAt`/`stackTop` before it falls back to `groundH`) in `src/45-host-stage.js` and the climate-field bake `FC`, which is the data `core/terrain` replaces. Palette: its own `NWBAY.PAL`, built in `src/50-biome-nwbay-species.js` (line 39).
