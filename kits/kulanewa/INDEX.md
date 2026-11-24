# `kits/kulanewa` — Fragment Index

| Fragment | Port Tag | Purpose |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML head, error overlay `#errs`, three.js r128 loader |
| `src/26k-kit.js` | `[G data]` | `KIT`, `KL`, `KL_FACTIONS` (*Kārum* & *Kūla-Nā Ikki*), `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL` |
| `src/27v-kl-vstack.js` | `[G shader]` | Vertical-stack `K1` uniform shader dedup + sine-free 3D hash, `M2` `KMAT_M1` `km1RoughAA` specular AA, `M3` planar POM (`< 18 m`), and `M4` plot-base contact AO + mortar cavity |
| `src/27z-kl-matfix.js` | `[draw]` | Re-binds library textures onto engine fallback keys (`plain`, `brass`, `bone`, `flag`) & tunes PBR glazes/metals |
| `src/31-alt-takes.js` | `[G data]` | Seeded `MAT_VAR` material variations |
| `src/39-kl-furn.js` | `[draw]` | 15 bespoke `kulanewa_*` *Kārum* Syndicate & *Ikki* Covenant furniture definitions on `KratorFurniture` |
| `src/40-kl-kit.js` | `[draw]` | `// prefix: kl` — `AF3` *kura* plinths, *udatsu* firewall wings, *kiyomizu* river-trestles, water channels, timber bridges, iron fire-shutter windows; `Style A` repoussé bronze *torana* doors, carved *sanjhyā* oriels, Ria dado friezes, multi-register walls, colonnades, walk & `CURREC.rooms` helpers |
| `src/42-kl-crowns.js` | `[draw]` | `// prefix: kl` — `AF4` iron- & `Arch`-nickel-hooped slatted-cedar conical frustums (`klHoopedFrustum`) & timber sky-walks (`klSkywalk`); `AF1` multi-eave Newar/Dong roofs (`klNewarRoof`), octagonal bronze Syndicate/Covenant bell-cupolas (`klBellCupola`), undershot mill waterwheels (`klMillWheel`), steelyard scales (`klSteelyard`), derrick cranes, and banners |
| `src/52-kl-karum-civic.js` | `[draw]` | `// prefix: kl` — *Kārum* (`style: 'karum'`) civic & exchange halls `8101..8105`: `kl_karum_grand_bank`, `kl_karum_clearing_hall`, `kl_karum_treaty_factor`, `kl_karum_mill_bridge`, `kl_karum_guild_thermae` |
| `src/54-kl-karum-trades.js` | `[draw]` | `// prefix: kl` — *Kārum* (`style: 'karum'`) mints, presses, bazaars & granaries `8106..8110`: `kl_karum_paktong_mint`, `kl_karum_amber_press`, `kl_karum_silk_exchange`, `kl_karum_kura_granary`, `kl_karum_glaze_pottery` |
| `src/56-kl-karum-mil-log.js` | `[draw]` | `// prefix: kl` — *Kārum* (`style: 'karum'`) quays, caravanserai & fortifications `8111..8115`: `kl_karum_crane_quay`, `kl_karum_caravanserai`, `kl_karum_chain_boom`, `kl_karum_mercenary_keep`, `kl_karum_watch_frustum` |
| `src/58-kl-karum-dwellings.js` | `[draw]` | `// prefix: kl` — *Kārum* (`style: 'karum'`) all 6 `(poor\|middle\|rich) x (dwelling-single\|dwelling-multi)` dwellings `8116..8121`: `kl_karum_banker_mansion`, `kl_karum_syndicate_court`, `kl_karum_sanjhya_shophouse`, `kl_karum_clerk_insula`, `kl_karum_trestle_cottage`, `kl_karum_porter_tenement` |
| `src/62-kl-ikki-covenant.js` | `[draw]` | `// prefix: kl` — *Ikki* (`style: 'ikki'`) *Jinaimachi* covenant citadels & parish halls `8122..8126`: `kl_ikki_covenant_citadel`, `kl_ikki_mujinzo_vault`, `kl_ikki_debtor_cloister`, `kl_ikki_otona_hall`, `kl_ikki_infirmary_bath` |
| `src/64-kl-ikki-works.js` | `[draw]` | `// prefix: kl` — *Ikki* (`style: 'ikki'`) hydro-forges, foundries, coke kilns, sawmills & mason yards `8127..8130, 8136`: `kl_ikki_hydro_forge`, `kl_ikki_bell_foundry`, `kl_ikki_coke_kiln`, `kl_ikki_timber_sawmill`, `kl_ikki_quarry_mason` |
| `src/66-kl-ikki-mil-log.js` | `[draw]` | `// prefix: kl` — *Ikki* (`style: 'ikki'`) weir-mills, ore relays & militia fortifications `8131..8135`: `kl_ikki_covered_weir`, `kl_ikki_pack_depot`, `kl_ikki_drum_gate`, `kl_ikki_pavise_armoury`, `kl_ikki_moat_bastion` |
| `src/68-kl-ikki-dwellings.js` | `[draw]` | `// prefix: kl` — *Ikki* (`style: 'ikki'`) all 6 `(poor\|middle\|rich) x (dwelling-single\|dwelling-multi)` dwellings `8137..8142`: `kl_ikki_elder_manor`, `kl_ikki_brotherhood_hall`, `kl_ikki_smith_shophouse`, `kl_ikki_commune_row`, `kl_ikki_smelter_hut`, `kl_ikki_foundry_tenement` |
| `src/70-kl-vocab.js` | `[G data]` | `// prefix: kl` — Page-local registration of culture `'kulanewa'` on `KTAGS.VOCAB` |
| `src/72-kl-trades.js` | `[G data]` | `// prefix: kl` — `KL_TRADES` & `klTradeDefs(style)` covering all 44 Voth census trades across both `karum` and `ikki` |
| `src/89-rows.js` | `[G data]` | Four-row sheet layout (`42` buildings: `21` *Kārum* + `21` *Ikki*) |
| `src/91r-kl-roomlight.js` | `[web]` | Stage 7 `KROOMLIGHT` room-graph daylight & 6-`PointLight` portal/lamp pool controller |
| `src/91z-kl-world.js` | `[web]` | `KDRAWN` ground grid, `core/water` streams, `K1` furniture shader dedup, `KROOMLIGHT` rebuild, `klDims()` |
| `src/99-host-tz-kl.js` | `[web]` | File-safe preset `VIEWS` and `window._api` audits (`doorsAudit`, `reachAudit`, `ceilingAudit`, `texturesAudit`, `zfightAudit`, `tradesAudit`, `vstackAudit`, `fingerprint`, `rebuild`) |
