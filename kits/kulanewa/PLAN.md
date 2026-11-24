# `kits/kulanewa` — Implementation Plan & Core Adoption

## 1. Purpose & Cultural Scope

Builds the production architectural kit for **The Kulanewa Free-Towns** (`culture: 'kulanewa'`, `~125,000` souls across the `Arcflow` `Pāk-Mā` and `Tōng-Mā` river basin), uniting two distinct yet architecturally coherent branches across **42 `defBuilding`s** (`seeds 8101..8142`):

1. **`style: 'karum'` (*Kārum* Ledger-Syndicates, 21 buildings, `8101..8121`):** Joint-stock merchant-banker ports (*naruqqum* venture-shares, 64-sign Amber-Envelope tablets, bark-paper remittance drafts, extraterritorial Ria clearing-wards, *kiyomizu* crane wharves, covered mill-bridges, and hired crossbow keeps).
2. **`style: 'ikki'` (*Kūla-Nā* Covenant-Communes, 21 buildings, `8122..8142`):** Fortified egalitarian *Jinaimachi* temple- and foundry-towns of *The Uncrowned Bell*, governed by elected *Otona* lay-elders with zero-usury *Mujinzō* granaries, debtor sanctuary cloisters, dual-wheel `Arch`-nickel hydro-forges, bell foundries, twin drum-frustum moat gates, and commoner pavise/pike/crossbow arsenals.

Both styles cover all **6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` cells**, dedicated `military` and `infrastructure` rosters, and all **44 Voth census trades** (`KL_TRADES`).

## 2. Core Adoption (`README.md` — "CORE MODULES ARE NOT OPTIONAL")

| Concern | Core Module Adopted | Usage in `kits/kulanewa` |
|---|---|---|
| Building kit geometry, buckets & sheet host | `core/engine` (`engine.py`) | Read in place (`10-core.js` .. `99-tail.html`) |
| Seeded deterministic PRNG | `core/rand` (`KRAND`) | Read in place via `CORE_DIRS`; unique building seeds `8101..8142` |
| Shader hooks, color & warp | `core/shader` (`KHOOK`, `KCOLOR`) | Read in place via `CORE_DIRS` |
| Library PBR textures, M1–M4 AA & POM | `core/materials/record` (`KMAT`, `KMAT_M1`) | `materials.json` + `mip-variance.json` + `27v-kl-vstack.js` (`\|km1` uniform dedup) |
| Stage 7 room-graph daylight & 6-light pool | `core/interiors` (`KROOMLIGHT`) | `klRoom` records `CURREC.rooms`; `91r-kl-roomlight.js` drives 6-`PointLight` pool |
| Vocabulary & placement tagging | `core/tags` (`KTAGS`) | Every placed building & furniture item registered; `70-kl-vocab.js` registers `'kulanewa'` |
| Catalog & bespoke furniture placement | `core/furnish` (`KFURN`) + `kits/catalog` | `38-furniture-bundle.js` + 15 bespoke `kulanewa_*` pieces in `39-kl-furn.js` |
| Operable doors & real glass panes | `core/door` (`KDOOR`, `KGLASS`, `KDOORHOST`) | Every doorway uses `svLeaf` (`klToranaDoor`), every window uses `svPane` |
| First-person walkability & reach audit | `core/walk` + `core/walk/box` (`KWALK`) | 100% floor/stair/sky-walk/bridge reachability (`0` unreached floors, `0` missed targets) |
| Flowing canals, mill-races & wet moats | `core/water` (`WATER`) | `CURREC.river` streams drawn via `WATER.flow` & `WATER.drawFlow` in `91z-kl-world.js` |
| Drawn ground clearance grid | `core/drawn` (`KDRAWN`) | Registered in `91z-kl-world.js` for `harness.SURVEY` camera clearance checks |
| Atmosphere, wind & placeholder sky | `core/atmos` + `core/atmos/placeholder` | PBR skylight & live cloth flutter on Syndicate & Covenant banners |
| Viewer controls, inspector & polytool | `core/host` (`KHOST`) | Standard orbit/walk/cut-away/night shell |
| Headless Chromium verification | `tools/harness.py` | `verify.py` uses `verify_page(..., checks=harness.SURVEY)` |
