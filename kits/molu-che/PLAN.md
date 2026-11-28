# `kits/molu-che` — Implementation Plan & Core Adoption

## 1. Purpose & Cultural Scope

Builds the production architectural kit for **The `Mōlü-che` Fossorial Clans of `Moleshelf`** (`culture: 'molu-che'`, `peoples.json`: `molu_che`), uniting pastoral bench clans and neutral treaty vault-syndicates across **38 `defBuilding`s** (`seeds 8301..8338`):

1. **`style: 'dikengyuan'` (Bench Pastoral, Tuber-Gallery & Craft Clans, 19 buildings, `8301..8319`):** Open-sky square sunken loess courtyards, lime-washed *yaodong* vaults, twin-ramp *Talpathere* (`ktrama-mōlü`) breeding byres, bronze-and-iron claw-shoe smithies, *lūma-pāpa* seep-wall tuber & mushroom drifts, blind amber-grub cellars, mole-felt fulleries, Cucuteni downdraft kilns, rotary capstan grain-pits, seismic-gong rim-watches, and all 6 residential classes.
2. **`style: 'bonduwe'` (*Dīpü-Bōnduwe* Bonded Strong-Vaults & Overland Bypass, 19 buildings, `8320..8338`):** Siege/flood/fireproof subterranean bullion & 10-year dry-loess famine-grain strong-vaults (`Kulanewa` `raha` silver, `ampala-kiri` amber-ledgers, Ria reserves), safe-conduct tally halls, wind-sheltered market trenches, bronze-runner caravan sled relays around perilous `Weeping Valley`, seismic listening mounds, gorge-head portcullis bastions, citadel keeps, and all 6 residential classes.

Both styles cover all **6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` cells**, dedicated `military` (`>= 3`) and `infrastructure` (`>= 5`) rosters, and all **44 Voth census trades** (`MC_TRADES`).

## 2. Core Adoption (`README.md` — "CORE MODULES ARE NOT OPTIONAL")

| Concern | Core Module Adopted | Usage in `kits/molu-che` |
|---|---|---|
| Building kit geometry, buckets & sheet host | `core/engine` (`engine.py`) | Read in place (`10-core.js` .. `99-tail.html`) |
| Seeded deterministic PRNG | `core/rand` (`KRAND`) | Read in place via `CORE_DIRS`; unique building seeds `8301..8338` |
| Shader hooks, color & warp | `core/shader` (`KHOOK`, `KCOLOR`) | Read in place via `CORE_DIRS` |
| Library PBR textures, M1–M4 AA & POM | `core/materials/record` (`KMAT`, `KMAT_M1`) | `materials.json` + `mip-variance.json` + `27v-mc-vstack.js` (`\|km1` uniform dedup) |
| Stage 7 room-graph daylight & 6-light pool | `core/interiors` (`KROOMLIGHT`) | `mcRoom` records `CURREC.rooms`; `91r-mc-roomlight.js` drives 6-`PointLight` pool |
| Vocabulary & placement tagging | `core/tags` (`KTAGS`) | Every placed building & furniture item registered; `70-mc-vocab.js` registers `'molu-che'` |
| Catalog & bespoke furniture placement | `core/furnish` (`KFURN`) + `kits/catalog` | `38-furniture-bundle.js` + 16 bespoke `molu_*` pieces in `39-mc-furn.js` |
| Operable doors & real glass panes | `core/door` (`KDOOR`, `KGLASS`, `KDOORHOST`) | Every *yaodong* & strong-vault portal uses `svLeaf`, every lunette uses `svPane` |
| First-person walkability & reach audit | `core/walk` + `core/walk/box` (`KWALK`) | 100% courtyard/ramp/vault/stair/terrace reachability (`0` unreached floors, `0` missed targets) |
| Hydraulic-lime cisterns & karst seep-flumes | `core/water` (`WATER`) | `CURREC.river` streams drawn via `WATER.flow` & `WATER.drawFlow` in `91z-mc-world.js` |
| Drawn ground clearance grid | `core/drawn` (`KDRAWN`) | Registered in `91z-mc-world.js` for `harness.SURVEY` camera clearance checks |
| Atmosphere, wind & placeholder sky | `core/atmos` + `core/atmos/placeholder` | PBR skylight & live cloth flutter on clan tapestries and safe-conduct flags |
| Viewer controls, inspector & polytool | `core/host` (`KHOST`) | Standard orbit/walk/cut-away/night shell |
| Headless Chromium verification | `tools/harness.py` | `verify.py` uses `verify_page(..., checks=harness.SURVEY)` |
