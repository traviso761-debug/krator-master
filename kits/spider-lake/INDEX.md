# `kits/spider-lake` — Fragment Index

Built by `python3 build.py` into `dist/spider-lake.html` (+ `dist/spider-lake.tex.*.js` library texture sidecars).

| Fragment | Tag | Prefix | Role & Contents |
|---|---|---|---|
| `src/00-head.html` | `[web]` | — | HTML shell, error banner `#errs`, Three.js r128 loader |
| `src/26k-kit.js` | `[G data]` | — | `KIT` (`culture: 'spider-lake'`), `SL`, `SL_POLITIES`, `SV_LIB`, `SV_TILE0`, `SV_CLOTH`, `SV_CUT`, `SVPAL`, `P(k)` |
| `src/27z-sl-matfix.js` | `[draw]` | — | Restores library maps onto `plain`/`brass`/`bone`/`flag` and tunes lacquer, bronze, jade, porphyry, cocoon & silk materials |
| `src/34-sl-trades.js` | `[G data]` | — | `SL_TRADES` (44 Voth census trade mappings) and `slSilkMath` (`cornerPin`, `spanPin`, `hangPin`, `hyparY`) |
| `src/39-sl-furn.js` | `[draw]` | — | `KratorFurniture.FPAL['spider-lake']` and 15 bespoke `spider-lake_*` furniture pieces (`KratorFurniture.def`) |
| `src/40-sl-kit.js` | `[draw]` | `sl` | Structural & tensile-silk toolkit: `slPlinth`, `slWallRing`, `slDoor`, `slWindow`, `slHipRoof`, `slColonnade` (`SL1`), `slMastObelisk` (`SL1`), `slVelarium` (`SL1`), `slKingMast` / `slBollard` / `slHyparCanopy` (`SL2`), `slSpiderLoft` (`SL3`), `slShamiyana` (`SL3`), `slWindVeils` (`SL3`), `slPergola` / `slCocoonLantern` / `slSilkBolt` (`SL4`) |
| `src/50-sl-houses.js` | `[draw]` | `sl` | 12 defs (`7101–7112`): 3 poor, 3 middle, 3 rich lakeside houses + hostel inn, canal teahouse, Ria legation |
| `src/54-sl-civic.js` | `[draw]` | `sl` | 8 defs (`7201–7208`): Silk-Prince Lotus-Saddle Palace, Great *Hum* Acoustic Sanctuary, Silk Bourse, Treaty Hall, Velarium Guild Plaza, Academy, House of Healing, Ancestor Shrine |
| `src/56-sl-silkhead.js` | `[draw]` | `sl` | 1 centerpiece def (`7209`, `sl_caravanserai_silkhead`): `39.6 × 39.6 m` Great Central Caravanserai for `Silkhead` unifying `SL1–SL4` (twin Mast-Obelisk gatehouse, two-storey Ria colonnade quadrangle, 4 corner *Hum* spider-loft wind-scoop towers with evaporative wind-veils, central raked King-Mast Lotus-Saddle Silk-Bourse pavilion, radial *velaria*, trough pergolas, cocoon lanterns, and dyed silk bolts) |
| `src/58-sl-works.js` | `[draw]` | `sl` | 16 defs (`7301–7316`): Open-Air Copper Silk-Reeling Market, Canal Dye-Works with `19.2 m` silk streamers, Brocade Drawloom Hall, Market Stalls, Lacquerer Shophouse, Spindle Smithy, Celadon Kiln, Bakehouse, Smokehouse, Amber-Wax Yard, Mast-Wright Yard, Silk Godown, Watermill/Granary, Mulberry Farm, Stock Byre/Pens, Dolomite/Nephrite Quarry-Mine |
| `src/62-sl-waterfront.js` | `[draw]` | `sl` | 8 defs (`7401–7408`): Silk-Weir Harvest Dock, Princely Barge-Quay, Boatwright Slipway, Arched Weir-Bridge & Pergola Ferry, Lake Lighthouse, Weir-Bastion, Mast-Gatehouse, Silk-Guard Barracks |
| `src/89-rows.js` | `[G data]` | — | `TITLE` and `FAMILIES` (11 showcase rows: 45 `sl_*` defs incl. dedicated `Silkhead` hero row + 57 `kits/resources` ore nodes) |
| `src/90z-sl-atmos.js` | `[G shader]` | — | Hooks all `SV_CLOTH` silk materials into `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, and `ATMOS.GLSL_WIND` (`atmWind`) via `KHOOK` |
| `src/91z-sl-world.js` | `[web]` | — | Scales ground, registers `KDRAWN`, draws `core/water` canals, wires furniture detail fallbacks, exposes `slOreLinks` & `slDims` |
| `src/99-host-tz-sl.js` | `[web]` | — | `Silkhead Caravanserai courtyard` preset view + `window._api` probes: `doorsAudit`, `reachAudit`, `atmosSilkAudit`, `texturesAudit`, `zfightAudit`, `tradesAudit`, `oreAudit`, `fingerprint`, `rebuild` |
