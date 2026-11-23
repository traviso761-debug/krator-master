# `kits/hueru-kuran` — Fragment Index

Built by `python3 tools/build.py kits/hueru-kuran` into `dist/hueru-kuran.html` (+ `dist/hueru-kuran.tex.*.js` library texture sidecars).

| Fragment | Tag | Prefix | Role & Contents |
|---|---|---|---|
| `src/00-head.html` | `[web]` | — | HTML shell, error banner `#errs`, Three.js r128 loader |
| `src/26k-kit.js` | `[G data]` | — | `KIT` (`culture: 'hueru-kuran'`), `HK`, `HK_POLITIES`, `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL`, `P(k)` |
| `src/27z-hk-matfix.js` | `[draw]` | — | Restores library maps onto `plain`/`brass`/`bone`/`flag` and tunes basalt, nephrite, whalebone, *kaen-doki*, glaze, seaglass & wind-rigged materials |
| `src/34-hk-trades.js` | `[G data]` | — | `HK_TRADES` (44 Voth census trade mappings) and `hkRigMath` (`cornerPin`, `spanPin`, `hangPin`, `chimePin`, `nuragheRadius`, `whaleRibArc`, `keyholeHalfWidth`) |
| `src/39-hk-furn.js` | `[draw]` | — | `KratorFurniture.FPAL['hueru-kuran']` and 14 bespoke `hueru-kuran_*` furniture pieces (`KratorFurniture.def`) |
| `src/40-hk-kit.js` | `[draw]` | `hk` | Architectural toolkit: `hkPlinth`, `hkJadeDoor`, `hkJadeWindow`, `hkNuraghe` & `hkMensoloni` (`HK1`), `hkChise` & `hkKaenCrown` (`HK3`), `hkWallRing`, `hkTurfRoof`, `hkGutskinAwning`, `hkWindHanging`, `hkNephriteChimes`, `hkWhaleJawArch`, `hkBaidarka` |
| `src/50-hk-houses.js` | `[draw]` | `hk` | 12 defs (`8101–8112`): 3 poor, 3 middle, 3 rich *Villaggio Nuragico* *Chise* & *Nuraghe* houses + cliff hostel, jawbone tavern, Hayrant legation |
| `src/54-hk-civic.js` | `[draw]` | `hk` | 8 defs (`8201–8208`): Quadrilobate *Nuraghe Complesso* Citadel, *Santa Cristina* Inverted-Keyhole Tsunami-Drawdown Step-Well (`core/water`), *Ukor* Chime-Council Hall, Matron *Ukor* Long-Lodge, Jade Bourse, Lore Hall, Thermal Healer Lodge, *Tomba dei Giganti* Ossuary |
| `src/58-hk-works.js` | `[draw]` | `hk` | 16 defs (`8301–8316`): Water-Powered Nephrite Pendulum Wire-Saw Mill (`core/water`), Blubber Try-Works, Baleen Bowyer & Cordage Loft, Sea-Green Glassworks, Harpoon Smithy, *Kaen-Doki* Climbing Kiln, Smokehouse-Saltery, Bakehouse, Seal-Hide Tailor, Kelp Brew-Lodge, `+690 m` Cypress Flume Yard, Market Stalls, Granary-*Nuraghe*, Vault Warehouse, Terrace Croft, Nephrite Quarry-Mine |
| `src/62-hk-waterfront.js` | `[draw]` | `hk` | 9 defs (`8401–8409`): Lagoon Wave-Splitter & Leviathan Jawbone Arch, Intertidal *Nuraghe Prou-Torre* (`+8 m` solid prow), `90-Second` Gravity Water-Counterweight Cliff Hoist & *Via Ferrata*, *Baidarka* Shipyard, Caldera Quay, Columnar Weir-Bridge, Beacon *Nuraghe* Lighthouse, Trilobate Gatehouse, Tsunami-Watch Barracks |
| `src/89-rows.js` | `[G data]` | — | `TITLE` and `FAMILIES` (10 showcase rows: 45 `hk_*` defs + 60 `kits/resources` ore nodes) |
| `src/90z-hk-atmos.js` | `[G shader]` | — | Hooks all `SV_CLOTH` materials (`gutskin`, `hide`, `kelp`, `netting`, `banner`, `chime`, `flag`) into `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, and `atmWind` via `KHOOK` |
| `src/91z-hk-world.js` | `[web]` | — | Scales ground, registers `KDRAWN`, draws `core/water` *Santa Cristina* mirror pools & millrace/caldera flows, wires furniture detail fallbacks, exposes `hkOreLinks` & `hkDims` |
| `src/99-host-tz-hk.js` | `[web]` | — | `window._api` probes: `doorsAudit`, `reachAudit`, `waterAudit`, `atmosWindAudit`, `texturesAudit`, `zfightAudit`, `tradesAudit`, `oreAudit`, `fingerprint`, `rebuild` |
