# biomes/k-guilin: port audit

*Written by hand in `tools/audit_port.py`'s shape (GODOT-PLAN.md, section 3), 2026-10-26; a rerun of the audit keeps the Tag and Note cells and refreshes the numbers.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 44 (34%) | 0 (0%) | 0 (0%) | 18 (14%) | 67 (52%) |

Columns: matching lines per API family (as the audit counts them).

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/45-host-stage.js` | 11.9 | [web] | 10 | 0 | 6 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | the lake, the wadi, the plain and the rock records: data inside host code (the stage) |
| `src/46-biome-kguilin-layout.js` | 16.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47-host-land.js` | 19.3 | [draw] | 41 | 3 | 0 | 0 | 0 | 5 | 8 | 0 | 0 | 0 | 0 | split: data candidate that also draws (the fields and the water records are data; the meshes draw) |
| `src/48n0-kguilin-nwbay-open.js` | 0.7 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | opens nwbay's registry (BIO.kit) |
| `src/48n9-kguilin-nwbay-close.js` | 0.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | closes it (BIO.kitEnd) |
| `src/50-biome-kguilin-species.js` | 24.4 | [draw] | 0 | 4 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | split: data candidate that also draws |
| `src/55-biome-kguilin-trees.js` | 20.9 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the borrowed passes (BPASSES) are data; NWBAY.plantTrees draws |
| `src/57-biome-kguilin-cliffs.js` | 4.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/60-biome-kguilin-floor.js` | 5.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/70-biome-kguilin.js` | 1.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/88-host-build.js` | 1.0 | [web] | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89a-host-atmos.js` | 0.7 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.bindHost |
| `src/89s-host-sky.js` | 3.6 | [web] | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the shared sky and the weather bound on the page |
| `src/89w-host-water.js` | 2.9 | [draw] | 6 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | core/water drawn |
| `src/99-host-take.js` | 16.3 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

- biomes/nwbay's species (50), trees (55) and variants (56) are read in place between `48n0` and `48n9` (build.py `KITS`); their tags are nwbay's own PORT.md's.
