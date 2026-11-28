# settlements/iron-millstream: port audit

*Written for `tools/check_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun of `tools/audit_port.py` keeps them and refreshes the numbers.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 0.9 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/28-im-model.js` | 8.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | baked Scale Model 5.1 elevation grid, r201 Snou Bruk hydrography & geology around (632, 716) |
| `src/30-im-ground.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | deterministic Snou Bruk gorge channel, weir pond, 4 stepped mill-benches & KDRAWN grids |
| `src/32-im-layout.js` | 20.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | monotonic hydraulic cascade, 7 hydropower works, KCITY mill-street, KHAMLET & RES_ORE |
| `src/34-im-rules.js` | 11.0 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | monotonic head, wheel-to-water contact, dry-hall channel clearance, OBB overlap & KTAGS |
| `src/45-im-stage.js` | 12.0 | [web] | 14 | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | WebGL stage, KMASK cobble road/yard field, near (4 m) & regional (320 m) ground meshes |
| `src/82-im-bridges.js` | 11.0 | [draw] | 12 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 | arched granite gorge bridge, masonry leat troughs, wheel-pit revetments & magnetite adits |
| `src/89z-im-sky.js` | 1.2 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ATMOS.skyBiome & ATMOS.bindHost at Roketstad / Snou Bruk (632, 716; 1.107 atm) |
| `src/89zp-im-place.js` | 14.0 | [draw] | 12 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | places records through VERN/HL, draws live WATER stream/pond/leat/falls/cove, BIO & KWALK |
| `src/99-im-host.js` | 8.0 | [web] | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | VIEWS (no apostrophes or colons), hostChecks, hostNegatives & KHOST.take |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

Read in place, not tagged here: `kits/ancients` runtime, `kits/iziz-vernacular` (`69b`, `69c`, `69e5`, `69e`, `69e6`), `kits/highlands` (`culture_files('republican', 'rustic')`, including `77c-rep-hydro.js` and `94-hl-anim.js`), `kits/resources` (`42r`, `42s`), `biomes/nhighlands`, and core modules (`core/rand`, `core/mask`, `core/drawn`, `core/space`, `core/city`, `core/hamlet`, `core/tags`, `core/furnish`, `core/door`, `core/walk`, `core/water`, `core/atmos`, `core/biome`, `core/lod`, `core/host`).
