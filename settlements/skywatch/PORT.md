# settlements/skywatch: port audit

*Written for `tools/check_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun of `tools/audit_port.py` keeps them and refreshes the numbers.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.9 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/28-sw-model.js` | 12.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | baked Scale Model 5.1 elevation grid, 360-deg horizon & geology at (776, 470) |
| `src/30-sw-ground.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | bicubic 5.1 ground, <=4 cosine-eased deltas, cistern basins & KDRAWN grids |
| `src/32-sw-layout.js` | 26.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Tiers I-V layout on KCITY, KHAMLET, KCAMP, KSPACE, KRAND & RES_ORE |
| `src/34-sw-rules.js` | 12.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | overlap, street, cistern, moot, solstice/horizon sightline checks & KTAGS registration |
| `src/45-sw-stage.js` | 9.0 | [web] | 14 | 0 | 1 | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | WebGL stage, KMASK ground shading, near & far terrain meshes |
| `src/82-sw-landmarks.js` | 24.0 | [draw] | 18 | 0 | 0 | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 | Solstice Sanctuary, Horizon Ring, Beacons, Step-Cisterns, Wind-Furnaces & Silent Moot |
| `src/89z-sw-sky.js` | 2.5 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.skyBiome & ATMOS.bindHost at (776, 470) |
| `src/89zp-sw-place.js` | 12.0 | [draw] | 10 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | places layout records through JJ, VERN/HL, WATER, KRUINS, BIO & KWALK |
| `src/99-sw-host.js` | 8.0 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | VIEWS (no apostrophes or colons), day/solstice/night states, hostChecks & KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place, not tagged here: `kits/ancients` runtime, `settlements/jimjam` (`JJ`), `kits/iziz-vernacular` + `kits/highlands` (`HL`), `kits/resources` (`42r`, `42s`), `biomes/nhighlands`, and core modules (`core/rand`, `core/mask`, `core/drawn`, `core/space`, `core/city`, `core/hamlet`, `core/camp`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/ruins`, `core/water`, `core/atmos`, `core/biome`, `core/lod`, `core/host`).
