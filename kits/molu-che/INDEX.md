# `kits/molu-che` — Fragment Index

| Fragment | Port Tag | Purpose |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML head, error overlay `#errs`, three.js r128 loader |
| `src/26k-kit.js` | `[G data]` | `KIT`, `MC`, `MC_CLANS` (`dikengyuan` & `bonduwe`), `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL` |
| `src/27v-mc-vstack.js` | `[G shader]` | Vertical-stack `K1` uniform shader dedup + sine-free 3D hash, `M2` `KMAT_M1` `km1RoughAA` specular AA, `M3` planar POM (`< 18 m`), and `M4` plot-base contact AO + pore/mortar cavity |
| `src/27z-mc-matfix.js` | `[draw]` | Re-binds library textures onto engine fallback keys (`plain`, `brass`, `bone`, `flag`) & tunes PBR loess/stone/metals |
| `src/31-alt-takes.js` | `[G data]` | Seeded `MAT_VAR` material variations |
| `src/39-mc-furn.js` | `[draw]` | 16 bespoke `molu_*` *Dikengyuan* & *Dīpü-Bōnduwe* furniture definitions on `KratorFurniture` |
| `src/40-mc-kit.js` | `[draw]` | `// prefix: mc` — sunken *dikengyuan* base pads, graded *Talpathere* entry ramps, stone stairs, recessed limewash *yaodong* portals & radial cedar lunettes, Mapuche-Cucuteni stepped-diamond mineral friezes, hollowed loess vault wings, sky-well parapets, walk & `CURREC.rooms` helpers |
| `src/42-mc-props.js` | `[draw]` | `// prefix: mc` — vaulted *yaodong* smoke/air hoods, tuned basalt/bronze Seismic Way-Stones, hydraulic-lime cistern wells, *Talpathere* stalls, bronze-runner caravan sleds, steelyard assay beams, rotary capstan mills, Cucuteni downdraft kilns, iron portcullis gates, tuber drying mats & treaty banners |
| `src/52-mc-clan-civic.js` | `[draw]` | `// prefix: mc` — Bench Clans (`style: 'dikengyuan'`) civic & sacred pits `8301..8305`: `mc_clan_great_pit`, `mc_elder_council_pit`, `mc_ancestor_echo_shrine`, `mc_deep_cistern_bath`, `mc_pit_tavern_inn` |
| `src/54-mc-clan-works.js` | `[draw]` | `// prefix: mc` — Bench Clans (`style: 'dikengyuan'`) *Talpathere*, tuber & craft works `8306..8311`: `mc_talpathere_great_byre`, `mc_claw_shoe_smithy`, `mc_tuber_seep_gallery`, `mc_amber_grub_cellar`, `mc_mole_felt_fullery`, `mc_cucuteni_kiln_pit` |
| `src/56-mc-clan-mil-log.js` | `[draw]` | `// prefix: mc` — Bench Clans (`style: 'dikengyuan'`) mill-granary & rim watch `8312..8313`: `mc_loess_mill_pit`, `mc_steppe_rim_watch` |
| `src/58-mc-clan-dwellings.js` | `[draw]` | `// prefix: mc` — Bench Clans (`style: 'dikengyuan'`) all 6 `(poor\|middle\|rich) x (dwelling-single\|dwelling-multi)` dwellings `8314..8319`: `mc_rich_double_pit`, `mc_rich_kin_compound`, `mc_mid_drover_pit`, `mc_mid_artisan_pit`, `mc_poor_single_yaodong`, `mc_poor_diggers_pit` |
| `src/62-mc-vault-civic.js` | `[draw]` | `// prefix: mc` — Bonded Vaults (`style: 'bonduwe'`) strong-vaults, archive & bazaar `8320..8323`: `mc_grand_bullion_vault`, `mc_famine_grain_silo`, `mc_amber_seal_scriptorium`, `mc_covered_bazaar_trench` |
| `src/64-mc-vault-trades.js` | `[draw]` | `// prefix: mc` — Bonded Vaults (`style: 'bonduwe'`) masonry, sled-wrights & halite vaults `8324..8326`: `mc_lime_and_ashlar_yard`, `mc_sled_wright_yard`, `mc_salt_and_jerky_cellar` |
| `src/66-mc-vault-mil-log.js` | `[draw]` | `// prefix: mc` — Bonded Vaults (`style: 'bonduwe'`) bypass relays & steppe fortifications `8327..8332`: `mc_bypass_customs_gate`, `mc_caravan_sled_mansio`, `mc_seismic_watch_mound`, `mc_sunken_sally_redoubt`, `mc_gate_ramp_bastion`, `mc_fortified_vault_keep` |
| `src/68-mc-vault-dwellings.js` | `[draw]` | `// prefix: mc` — Bonded Vaults (`style: 'bonduwe'`) all 6 `(poor\|middle\|rich) x (dwelling-single\|dwelling-multi)` dwellings `8333..8338`: `mc_vault_factor_manor`, `mc_treaty_envoy_court`, `mc_assay_shophouse_pit`, `mc_vault_clerk_terraces`, `mc_trail_warden_dugout`, `mc_caravan_crew_bunks` |
| `src/70-mc-vocab.js` | `[G data]` | `// prefix: mc` — Page-local registration of culture `'molu-che'` on `KTAGS.VOCAB` |
| `src/72-mc-trades.js` | `[G data]` | `// prefix: mc` — `MC_TRADES` & `mcTradeDefs(style)` covering all 44 Voth census trades across both `dikengyuan` and `bonduwe` |
| `src/89-rows.js` | `[G data]` | Four-row sheet layout (`38` buildings: `19` `dikengyuan` + `19` `bonduwe`) |
| `src/91r-mc-roomlight.js` | `[web]` | Stage 7 `KROOMLIGHT` room-graph daylight & 6-`PointLight` portal/lamp pool controller |
| `src/91z-mc-world.js` | `[web]` | `KDRAWN` ground grid, `core/water` cistern/seep streams, `K1` furniture shader dedup, `KROOMLIGHT` rebuild, `mcDims()` |
| `src/99-host-tz-mc.js` | `[web]` | File-safe preset `VIEWS` and `window._api` audits (`doorsAudit`, `reachAudit`, `ceilingAudit`, `texturesAudit`, `zfightAudit`, `tradesAudit`, `vstackAudit`, `fingerprint`, `rebuild`) |
