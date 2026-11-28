# `settlements/arcodiga` — Host & Data API

## `[G data]` Modules (Engine-Neutral, Node-Tested in `tests/test-arcodiga-town.js`)
- **`ADG_SITE`** (`src/40-adg-site.js`): `1:1` Scale-Model `5.1` elevation (`bareGround`, `macroGround`, `WMICRO` v2), `6` zones (`Z1..Z6`), `3` `90s` cliff-hoist corridors (`HOISTS`), *Santa Cristina* well (`SANTA_CRISTINA`), bronze tide-clock (`TIDE_CLOCK`), cascade streams (`STREAMS`), and `5` mineral nodes (`RESOURCE_NODES`).
- **`ADG_CROOK_DELTA`** (`src/44-adg-crook-delta.js`): Asymmetric partial-refurbishment adapter for `ARCODIGA` & `ADG_INTERIORS` at `yOffset = -95.0 m` (`buildDelta`, `auditDelta`, `isReclaimedUnit`).
- **`ADG_TUNE` & `ADG_TRADES`** (`src/42-adg-tune.js`, `src/42-adg-trades.js`): Multi-kit footprint manifest (`KRATOR_KITS`: `'hueru-kuran'` + `'eternian'`) and `41/44` Voth trade census table (`3` canonical `na`).
- **`ADG_CITY`** (`src/45-adg-city-steps.js`): Three-instance `KCITY` planner (`hk_rim`, `et_cantonment`, `cove_works`), cross-instance OBB & `+65.0 m` dwelling audit (`auditLots`), and continuous `Z1..Z6` pedestrian/hoist graph (`buildWalkGraph`).
- **`ADG_ROOMS`** (`src/58-adg-roomlight.js`): Stage 7 `KROOMLIGHT` room-graph daylight & 6-light gated pool (`buildLightTable`, `auditVaultIsolation`, `poolForEye`).
- **`ADG_SIM`** (`src/60-adg-sim.js`): `3,400`-citizen / `715`-HH dual-polity `core/simulation` setup, `5` workshop chains, and `4` `SIM.trade` routes (`init`, `stocks`, `tradeReport`).

## `[web]` Runtime API (`window._api`)
- **`window._api.hostChecks()`**: Runs all 8 settlement invariant checks (`voth-trades`, `arcodiga-asymmetric-delta`, `tsunami-trimline-65m`, `multikit-hlod-atlas`, `closed-eyes-statuary`, `crook-trimline-flora`, `roomlight-deep-vaults`, `hoists-and-sim-charter`).
- **`window._api.hostNegatives()`**: Runs 4 fault-injected negative checks proving broken inputs fail.
- **`window._api.setCharterMode(mode)`**: Switches live port state between `'Normal Charter'`, `'Ghost-Tsunami Drawdown'` (`-8.0 m` ocean/lagoon drawdown, *Santa Cristina* nephrite chime alarm, synced `et_clock` rapid sweep, raised `90s` cliff-hoists), and `'Hoist Drill 90s Lift'`.
