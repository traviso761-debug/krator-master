# settlements/ardent: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 91 (64%) | 0 (0%) | 0 (0%) | 39 (28%) | 12 (8%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.8 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/28-ar-model.js` | 9.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | baked Scale Model 5.1 elevation grid, 360-deg horizon & geology at (830, 553) |
| `src/30-ar-ground.js` | 8.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | bicubic 5.1 ground, cosine-eased burgh/Thing-Crag/burn channel & KDRAWN grids |
| `src/32-ar-layout.js` | 59.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | narrow-cobbled burgh, Nine Clans koshki crown, RES_ORE & KCAMP Silk-Trail layout |
| `src/34-ar-rules.js` | 14.2 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | rustic-only, unwalled-watchful, cobble, Nine Clans, bronze ore, MC-06/BF-04 rules & KTAGS |
| `src/45-ar-stage.js` | 27.5 | [web] | 31 | 5 | 1 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | WebGL stage, KMASK cobble mask, near & far terrain meshes, ore & camp builders |
| `src/89z-ar-sky.js` | 1.1 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.skyBiome & ATMOS.bindHost at (830, 553) |
| `src/89zp-ar-place.js` | 11.6 | [draw] | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | places layout records through VERN/HL, WATER.drawFlow, BIO/NHL & KWALK |
| `src/96-ar-lod.js` | 0.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | tunes LOD_OPTIONS chunking & screen-error thresholds before 97-lod-auto.js |
| `src/99-ar-host.js` | 9.3 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | VIEWS (no apostrophes or colons), day/night states, hostChecks & KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place, not tagged here: `kits/ancients` runtime, `kits/iziz-vernacular` + `kits/highlands` (`rustic` + `82-rus-baronial.js`), `kits/resources` (`42r`, `42s`), `biomes/nhighlands`, and core modules (`core/rand`, `core/mask`, `core/drawn`, `core/space`, `core/city`, `core/hamlet`, `core/camp`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/ruins`, `core/water`, `core/atmos`, `core/materials`, `core/biome`, `core/lod`, `core/clock`, `core/minimap`, `core/host`).

