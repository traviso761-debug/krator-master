# `kits/ria` — Fragment Index

| Fragment | Port Tag | Purpose |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML head, error overlay `#errs`, three.js r128 loader |
| `src/26k-kit.js` | `[G data]` | `KIT`, `RA`, `RA_DYNASTIES` (*Rīwa-Tōka* & *Līwa-Tōga*), `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL` |
| `src/27z-ra-matfix.js` | `[draw]` | Re-binds library textures onto engine fallback keys (`plain`, `brass`, `bone`, `flag`) & tunes PBR glazes/metals |
| `src/31-alt-takes.js` | `[G data]` | Seeded `MAT_VAR` material variations |
| `src/39-ra-furn.js` | `[draw]` | 14 bespoke Ria Dynasty court, temple, chancellery, and domestic furniture definitions on `KratorFurniture` |
| `src/40-ra-kit.js` | `[draw]` | `// prefix: ra` — Structural masonry, battered plinths, cavetto cornices, Ishtar portals, merlon parapets, Classical balustrades & pediments, flat ziggurat/terrace roofs, curved exedras, Egyptian palm / Persepolitan protome / Minoan / Solomonic spiral columns, arcades, water basins, boardwalks, helical ramps, and `KWALK` wall/floor helpers |
| `src/42-ra-crowns.js` | `[draw]` | `// prefix: ra` — Multi-tiered Thai/Burmese/Lanna roofs (with solid ceilings & soffits), *Prasat* spires, Khmer *Prangs*, Classical Pantheon stepped saucer-rotundas & Bagan lotus domes (`{inward: true}` soffits), *Uktena* 5-headed naga & *Hongsa* water-swan balustrades, and `lodestone` obelisks |
| `src/52-ra-west-court.js` | `[draw]` | `// prefix: ra` — Lower Ria (`style: 'lower-ria'`) buildings 1–4: `ra_west_prasat_palace`, `ra_west_lotus_pavilion`, `ra_west_pyatthat_hall`, `ra_west_prang_cloister` |
| `src/54-ra-west-town.js` | `[draw]` | `// prefix: ra` — Lower Ria (`style: 'lower-ria'`) buildings 5–8: `ra_west_water_gate`, `ra_west_spiral_beacon`, `ra_west_arcade_villa`, `ra_west_stilt_house` |
| `src/62-ra-east-court.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) buildings 1–4: `ra_east_swan_prasat`, `ra_east_mandala_cloister`, `ra_east_lotus_dome`, `ra_east_gopura_gate` |
| `src/64-ra-east-town.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) buildings 5–8: `ra_east_boatlift_hall`, `ra_east_saffron_viharn`, `ra_east_peristyle_villa`, `ra_east_terrace_house` |
| `src/70-ra-vocab.js` | `[G data]` | `// prefix: ra` — Page-local registration of culture `'ria'` on `KTAGS.VOCAB` |
| `src/89-rows.js` | `[G data]` | Two-row sheet layout (`Lower Ria` Row 1 + `Upper Ria` Row 2) |
| `src/91z-ra-world.js` | `[web]` | `KDRAWN` ground grid, `core/water` flowing canal/basin/chute streams, furniture detail-map guard, `raDims()` |
| `src/99-host-tz-ra.js` | `[web]` | File-safe preset `VIEWS` and `window._api` audits (`doorsAudit`, `reachAudit`, `ceilingAudit`, `texturesAudit`, `zfightAudit`, `fingerprint`, `rebuild`) |
