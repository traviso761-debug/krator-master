# `kits/ria` — API Reference

## Kit Identity, Trades & Settlement Bundle (`src/26k-kit.js`, `src/72-ra-trades.js`, `kit_bundle.py`)

- `KIT`: `{ id: 'ria', pack: 'ria', culture: 'ria', faction: 'Ria Dynasties of the Two Reaches', band: 'Riwa-Wata and Liwa-Wada', frag: 'kits/ria' }`
- `RA_DYNASTIES`: `{ lowerRia, upperRia }` — canonical regional seats, linguistic shifts (*Rīwa-Tōka* vs *Līwa-Tōga*), cognates, and hereditary emblems.
- `DEFS`: 76 `defBuilding` entries (`38` with `tags.style === 'lower-ria'` + `38` with `tags.style === 'upper-ria'`), covering `poor`, `middle`, and `rich` across both `dwelling-single` and `dwelling-multi`, plus full `military` (`6` per branch) and `infrastructure`/logistics (`7` per branch) rosters.
- `RA_TRADES` / `raTradeDefs(style)` (`[G data]`): all 44 Voth census trades mapped to `lowerRia` (`ra_west_*`) and `upperRia` (`ra_east_*`) building keys.
- `raDims()`: returns `{ [key]: { cls, name, w, d, h, fw, fd, style, wealth, types, role, job, cut, variants } }` for `core/city` layout consumers.
- `kit_bundle.bundle(key='RIK')` (`kits/ria/kit_bundle.py`): seals the kit in one closure exposing `RIK.proto(key, v)`, `RIK.dims()`, `RIK.trades`, `RIK.tradeDefs(style)`, `RIK.dynasties`, and `RIK.errors`.

## Vertical-Stack Graphics (`src/27v-ra-vstack.js`, `src/91r-ra-roomlight.js`)

- **Stage 5 & `K1` (`27v-ra-vstack.js`):** Uniform-deduplicated `uKmSpec`, `uKmBreak` & sine-free 3D hash (`<= 28` compiled WebGL programs, `<= 12` active samplers), `KMAT_M1.GLSL_COMMON` `km1RoughAA` mip-variance specular AA (`mip-variance.json`), 6-step planar POM (`uPomDepth`, `< 18 m`) on `"height": true` masonry families (`travertine`, `dolomite`, `brick`, `paving`, `porphyry`), and plot-base contact AO (`0.74 -> 1.00`) + concave mortar cavity.
- **Stage 7 `KROOMLIGHT` (`91r-ra-roomlight.js`, `window._raRoomLight`):** Builds a doorway/window room-light graph via `KROOMLIGHT.buildTable` over `CURREC.rooms` (recorded automatically by `raRoom`, `raWallRing`, and `raDrumWall`) and drives a 6-`PointLight` portal-daylight & warm-lamp pool via `KROOMLIGHT.pickPool`.

## Structural, Logistics & Crown Helpers (`src/40-ra-kit.js`, `src/42-ra-crowns.js`, `src/57-ra-west-sacred.js`, `src/59m-ra-west-mil-log.js`, `// prefix: ra`)

- `raPlinth`, `raGrandStair`, `raFloorSlab`, `raFloorDisc`, `raCeilingSlab`, `raFlatTerraceRoof`, `raWall`, `raWallRing`, `raRoom`, `raIshtarPortal`, `raMerlonParapet`, `raClassicalBalustrade`, `raPiercedFretWall`, `raClassicalPediment`, `raCurvedColonnade`, `raColumn`, `raMosaicSquareCol`, `raColonnade`, `raArcade`, `raBatteredPylon`, `raBussabokPortal`, `raCavettoCornice`, `raWaterCourt`, `raBoardwalk`, `raDrumWall`, `raSpiralRamp`, `raTopiaryUrn`, `raGuardianStatue`, `raCargoCrane`, `raSteelyardScale`, `raChainCapstan`.
- `raTieredRoof`, `raMondopSpireRoof`, `raOctPavilionRoof`, `raPrasatSpire`, `raPrang`, `raPorcelainPrang`, `raCaryatidChedi`, `raLotusDome`, `raPantheonRotundaDome`, `raNagaHead5`, `raNagaRail`, `raHongsaSculpt`, `raHongsaRail`, `raSwanFinial`, `raLodestoneObelisk`, `raBanner`.

## Verification Probe (`window._api`, `src/99-host-tz-ra.js`)

- `_api.doorsAudit()`, `_api.reachAudit()`, `_api.ceilingAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.tradesAudit()`, `_api.vstackAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
