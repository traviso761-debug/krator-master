# biomes/abyssal-savannah: port audit

*Written by hand in `tools/audit_port.py`'s shape (2026-10-26); a rerun of that tool keeps the Tag and Note cells and fills the counts.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code.

| Fragment | KB | Tag | Note |
|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | page shell |
| `src/45-host-stage.js` | 18.4 | [web] | split: the profile, gullies, kopjes, fields and water levels are data on KRAND (for core/terrain and KLAND); the renderer, ground and far meshes are host |
| `src/47c-host-eastabyss-end.js` | 0.5 | [web] | closes the eastern abyss's registry (BIO.kitEnd) |
| `src/50-biome-absav-species.js` | 19.2 | [draw] | split: species, plants, harvest and palettes are data; the fallback canvases, materials and items draw |
| `src/55-biome-absav-trees.js` | 18.5 | [draw] | split: `ABSAV.cells`, `ABSAV.burn`, `ABSAV.zones`, `ABSAV.make` and the PASSES table are data (KRAND per cell); the builders `B[sp]` and `buildFar` draw, called from the same pass |
| `src/60-biome-absav-floor.js` | 9.0 | [draw] | split: places and draws in one pass (ABSAV.cells then BIO.put); the kopje piles are seeded per kopje (KRAND.stream) |
| `src/70-biome-absav.js` | 1.0 | [G data] | no three.js, no geometry, no DOM |
| `src/88-host-build.js` | 1.3 | [web] | split: data inside host code |
| `src/89a-host-atmos.js` | 0.6 | [web] | ATMOS.bindHost |
| `src/89s-host-sky.js` | 2.0 | [G native] | the shared sky (core/atmos/sky) at px 1021,350 |
| `src/89w-host-water.js` | 2.6 | [draw] | core/water records (flow, still) and their drawing |
| `src/99-host-take.js` | 8.3 | [web] | the page handed to core/host (KHOST.take): the views, the inspector's words, the budgets and the kit's own checks |
| `src/99-tail.html` | 0.0 | [web] | page shell |

## Notes
