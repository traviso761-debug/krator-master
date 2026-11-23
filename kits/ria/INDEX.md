# `kits/ria` — Fragment Index

| Fragment | Port Tag | Purpose |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML head, error overlay `#errs`, three.js r128 loader |
| `src/26k-kit.js` | `[G data]` | `KIT`, `RA`, `RA_DYNASTIES` (*Rīwa-Tōka* & *Līwa-Tōga*), `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL` |
| `src/27v-ra-vstack.js` | `[G shader]` | Vertical-stack `K1` uniform shader dedup + sine-free 3D hash, `M2` `KMAT_M1` `km1RoughAA` specular AA, `M3` planar POM (`< 18 m`), and `M4` plot-base contact AO + mortar cavity |
| `src/27z-ra-matfix.js` | `[draw]` | Re-binds library textures onto engine fallback keys (`plain`, `brass`, `bone`, `flag`) & tunes PBR glazes/metals |
| `src/31-alt-takes.js` | `[G data]` | Seeded `MAT_VAR` material variations |
| `src/39-ra-furn.js` | `[draw]` | 14 bespoke Ria Dynasty court, temple, chancellery, and domestic furniture definitions on `KratorFurniture` |
| `src/40-ra-kit.js` | `[draw]` | `// prefix: ra` — Structural masonry, battered plinths, cavetto cornices, Ishtar portals, merlon parapets, Classical balustrades & pediments, flat ziggurat/terrace roofs, curved colonnades, Egyptian palm / Persepolitan protome / Minoan / Solomonic spiral columns, arcades, water basins, boardwalks, helical ramps, `KWALK` wall/floor helpers, and `raRoom` `CURREC.rooms` recorder |
| `src/42-ra-crowns.js` | `[draw]` | `// prefix: ra` — Multi-tiered Thai/Burmese/Lanna roofs (with solid ceilings & soffits), *Prasat* spires, Khmer *Prangs*, Classical Pantheon stepped saucer-rotundas & Bagan lotus domes (`{inward: true}` soffits), *Uktena* 5-headed naga & *Hongsa* water-swan balustrades, and `lodestone` obelisks |
| `src/52-ra-west-court.js` | `[draw]` | `// prefix: ra` — Lower Ria (`style: 'lower-ria'`) monuments 1–4: `ra_west_prasat_palace`, `ra_west_lotus_pavilion`, `ra_west_pyatthat_hall`, `ra_west_prang_cloister` |
| `src/54-ra-west-town.js` | `[draw]` | `// prefix: ra` — Lower Ria (`style: 'lower-ria'`) gates, watch & houses 5–8: `ra_west_water_gate`, `ra_west_spiral_beacon`, `ra_west_arcade_villa`, `ra_west_stilt_house` |
| `src/56-ra-west-civic.js` | `[draw]` | `// prefix: ra` — Lower Ria (`style: 'lower-ria'`) civic, market, inn & barracks 9–13: `ra_west_covered_bazaar`, `ra_west_lotus_thermae`, `ra_west_amber_scriptorium`, `ra_west_caravanserai_inn`, `ra_west_ishtar_barracks` |
| `src/57-ra-west-sacred.js` | `[draw]` | `// prefix: ra` — Shared sacred/civic helpers + Lower Ria (`style: 'lower-ria'`) chancellery & sacred precincts 19–22: `ra_west_chakri_chancellery`, `ra_west_mondop_library`, `ra_west_celadon_prang_terrace`, `ra_west_bussabok_gate` |
| `src/58-ra-west-trades.js` | `[draw]` | `// prefix: ra` — Lower Ria (`style: 'lower-ria'`) trades, granary & poor cottage 14–18: `ra_west_glaze_kiln`, `ra_west_silk_dyeworks`, `ra_west_bronze_smithy`, `ra_west_ziggurat_granary`, `ra_west_canal_cottage` |
| `src/62-ra-east-court.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) monuments 1–4: `ra_east_swan_prasat`, `ra_east_mandala_cloister`, `ra_east_lotus_dome`, `ra_east_gopura_gate` |
| `src/64-ra-east-town.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) boat-lift, viharn & houses 5–8: `ra_east_boatlift_hall`, `ra_east_saffron_viharn`, `ra_east_peristyle_villa`, `ra_east_terrace_house` |
| `src/66-ra-east-civic.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) agora, thermae, serai, watchfort & boathouse 9–13: `ra_east_stoa_agora`, `ra_east_karst_thermae`, `ra_east_pilgrim_serai`, `ra_east_cavetto_watchfort`, `ra_east_skiff_boathouse` |
| `src/67-ra-east-sacred.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) pantheon, dromos, dicastery & reliquary 19–22: `ra_east_thepbidorn_pantheon`, `ra_east_kinnara_dromos`, `ra_east_archon_dicastery`, `ra_east_caryatid_reliquary` |
| `src/68-ra-east-trades.js` | `[draw]` | `// prefix: ra` — Upper Ria (`style: 'upper-ria'`) foundry, atelier, press, granary & poor cottage 14–18: `ra_east_zinc_foundry`, `ra_east_stone_atelier`, `ra_east_saffron_press`, `ra_east_cliff_granary`, `ra_east_karst_cottage` |
| `src/70-ra-vocab.js` | `[G data]` | `// prefix: ra` — Page-local registration of culture `'ria'` on `KTAGS.VOCAB` |
| `src/72-ra-trades.js` | `[G data]` | `// prefix: ra` — `RA_TRADES` & `raTradeDefs(style)` covering all 44 Voth census trades across both `lower-ria` and `upper-ria` |
| `src/89-rows.js` | `[G data]` | Four-row dynastic sheet layout (`44` buildings: `22` Lower Ria + `22` Upper Ria) |
| `src/91r-ra-roomlight.js` | `[web]` | Stage 7 `KROOMLIGHT` room-graph daylight & 6-`PointLight` portal/lamp pool controller |
| `src/91z-ra-world.js` | `[web]` | `KDRAWN` ground grid, `core/water` streams, `K1` furniture shader dedup, `KROOMLIGHT` rebuild, `raDims()` |
| `src/99-host-tz-ra.js` | `[web]` | File-safe preset `VIEWS` and `window._api` audits (`doorsAudit`, `reachAudit`, `ceilingAudit`, `texturesAudit`, `zfightAudit`, `tradesAudit`, `vstackAudit`, `fingerprint`, `rebuild`) |
