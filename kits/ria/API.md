# `kits/ria` — API Reference

## Kit Identity & Registry (`src/26k-kit.js`, `core/engine/36-def.js`)

- `KIT`: `{ id: 'ria', pack: 'ria', culture: 'ria', faction: 'Ria Dynasties of the Two Reaches', band: 'Ma-Ria', frag: 'kits/ria' }`
- `RA_DYNASTIES`: `{ lowerRia, upperRia }` — canonical regional seats, linguistic shifts (*Rīwa-Tōka* vs *Līwa-Tōga*), cognates, and hereditary emblems.
- `DEFS`: 16 `defBuilding` entries (`8` with `tags.style === 'lower-ria'` + `8` with `tags.style === 'upper-ria'`).
- `raDims()`: returns `{ [key]: { cls, w, d, h, style, wealth, types, role, job, cut } }` for settlement/city layout consumers (`core/city`).

## Structural & Walkability Helpers (`src/40-ra-kit.js`, `// prefix: ra`)

- `raPlinth(w, d, h, o)` — Battered polychrome glazed-brick (`lower-ria`) or imperial porphyry & dolomite (`upper-ria`) terrace with `wkPad` deck and `raGrandStair`.
- `raGrandStair(x0, y0, z0, x1, y1, z1, w, o)` — Monumental stair flight drawn in `svNoWalk` with `svStripWalk`, rotation-safe `wkPad` landings, and `rail: 'naga' | 'hongsa'`.
- `raFloorSlab(cx, yTop, cz, w, d, o)` / `raFloorDisc(cx, cz, r, yTop, mk, col, o)` — Walkable rectangular (`wkPad` / `svWell`) and polygonal (`svFloor`) slabs.
- `raCeilingSlab(cx, yCeil, cz, w, d, o)` — Coffered teak, gilt, cedar, or carved-dolomite underside ceiling (`svNoWalk`).
- `raWall(x0, z0, x1, z1, y0, h, o)` / `raWallRing(x0, z0, x1, z1, y0, h, o)` — Multi-course walls drawn in `svNoWalk` with full-height `raWallBlock` collision blocks split around operable `raDoor` portals.
- `raColumn`, `raColonnade`, `raArcade`, `raBatteredPylon`, `raCavettoCornice`, `raWaterCourt`, `raBoardwalk`, `raDrumWall`, `raSpiralRamp`.

## Southeast Asian & Dynastic Crowns (`src/42-ra-crowns.js`, `// prefix: ra`)

- `raTieredRoof(cx, y0, cz, w, d, tiers, o)` — 1-to-7-tier Thai *Prasat*, Burmese *Pyatthat*, or Lanna indigo-slate roof with solid underside ceiling & tier soffits, carved *panlom* bargeboards, and *chofa* / *Hongsa* finials.
- `raOctPavilionRoof(cx, y0, cz, rEave, tiers, o)` — Octagonal/hexagonal/square tiered pavilion roof with `{inward: true}` interior vault soffit.
- `raPrasatSpire(cx, y0, cz, wBase, hSpire, o)` — 5-stage gilded *Prasat* / *Hti* spire (optional `{inward: true}` crossing vault).
- `raPrang(cx, y0, cz, wBase, hPrang, o)` — Khmer-Thai glazed corncob *Prang* or Angkor-Bagan stepped stone *Shikhara-Prang* with `{inward: true}` sanctuary vault soffit.
- `raLotusDome(cx, y0, cz, rBase, hDome, o)` — Ribbed porphyry-and-gilt Bagan-Ptolemaic lotus dome with `{inward: true}` gilded interior dome soffit.
- `raNagaHead5`, `raNagaRail`, `raHongsaSculpt`, `raHongsaRail`, `raSwanFinial`, `raLodestoneObelisk`, `raBanner`.

## Bespoke Furniture Keys (`src/39-ra-furn.js`)

Registered on `KratorFurniture` under culture `'ria'`:
`ria_sovereign_throne`, `ria_uktena_brazier`, `ria_hongsa_lectern`, `ria_teak_divan`, `ria_porphyry_table`, `ria_lotus_altar`, `ria_amber_seal_desk`, `ria_glazed_amphora_rack`, `ria_saffron_cushion`, `ria_silk_screen`, `ria_lodestone_compass`, `ria_tribute_chest`, `ria_lantern_stand`, `ria_offering_basin`.

## Verification Probe (`window._api`, `src/99-host-tz-ra.js`)

- `_api.doorsAudit()`, `_api.reachAudit()`, `_api.ceilingAudit()`, `_api.texturesAudit()`, `_api.zfightAudit()`, `_api.fingerprint()`, `_api.rebuild()`.
