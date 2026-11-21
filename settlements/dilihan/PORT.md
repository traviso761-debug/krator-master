# settlements/dilihan: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 127 (56%) | 0 (0%) | 0 (0%) | 28 (12%) | 72 (32%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.9 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/28-dl-model.js` | 12.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | baked Scale Model 5.1 elevation/wet grid, 360-deg horizon, geology & net51 at (744, 663) |
| `src/30-dl-ground.js` | 15.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Catmull-Rom 5.1 ground, Cut wall polish, colonia/palace/lower-town benches, stream & KDRAWN |
| `src/32-dl-layout.js` | 86.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5-zone urban & Dellu-Handu layout on KCITY, KHAMLET, CROPS, KSPACE, KRAND & RES_ORE |
| `src/34-dl-rules.js` | 13.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | pin, 1:4 area ratio, cornice, overlap, solstice, palace, handu checks & KTAGS registration |
| `src/45-dl-stage.js` | 14.9 | [web] | 22 | 5 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | WebGL stage, KMASK.canvas road/plaza field, KDRAWN-exact near & 30 km Cut terrain meshes |
| `src/82-dl-landmarks.js` | 40.3 | [draw] | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | dual-kit socket dispatch, KFURN catalog glue, govpalace, forum, Hykkousoi legation & works |
| `src/89z-dl-sky.js` | 1.2 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.skyBiome (-31.50 deg S, 56.27 deg, 1.788 atm) & ATMOS.bindHost |
| `src/89zp-dl-place.js` | 32.1 | [draw] | 17 | 0 | 0 | 0 | 2 | 4 | 1 | 2 | 0 | 0 | 0 | JJ/VERN placement, KCONS + KCITY.constructMesh, WATER, KWALK, biomes/cut flora & night |
| `src/99-dl-host.js` | 10.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 8 required VIEWS (no apostrophes or colons), solstice/night clocks, hostChecks & KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place, not tagged here: `kits/ancients` runtime, `settlements/jimjam` (`JJ`, `JJFURN`), `kits/iziz-vernacular` (`VERN`), `kits/construction` (`KCONS`), `kits/crops` (`CROPS`), `kits/resources` (`RES_ORE`), `biomes/cut` (`CUT`), `biomes/nwlowlands`, `biomes/nhighlands`, `kits/catalog` (`iziz`, `hykkousoi`, `republican`, `generic`), and core modules (`core/shader`, `core/rand`, `core/mask`, `core/drawn`, `core/space`, `core/city`, `core/hamlet`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, `core/coast`, `core/terrain`, `core/atmos`, `core/materials`, `core/biome`, `core/lod`, `core/clock`, `core/minimap`, `core/export`, `core/host`).
