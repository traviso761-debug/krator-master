# `kits/kulanewa` — Implementation Plan & Core Adoption

## 1. Purpose & Cultural Scope

Builds the production architectural kit for **The Kulanewa Free-Towns** (`culture: 'kulanewa'`, `~125,000` souls across the `Arcflow` `Suur-Neva`, `Mere-Upe`, `Musta-Jõgi`, and `Helme-Koski` river basin and **Ria Sound** estuary shore), uniting all three zones of the Kuruneva cultural gradient across **63 `defBuilding`s** (`seeds 8101..8163`) in six rows:

1. **`style: 'karum'` (*Kaarum-Linna Suurgild* Syndicates, 21 buildings, `8101..8121`):** Joint-stock merchant-banker ports (*osakott* venture-shares, 64-sign `ampala-kiri` tablets, `raha` bark-paper drafts, extraterritorial Ria clearing-wards, *kiyomizu* crane wharves, covered mill-bridges, and hired crossbow keeps).
2. **`style: 'ikki'` (*Ilma-Kuluuna Talku-Küla* Covenant-Communes, 21 buildings, `8122..8142`):** Fortified egalitarian *maalinn* and foundry-towns of *The Uncrowned Bell*, governed by elected *Vanemad* lay-elders with zero-usury *Talku-Ait* granaries, debtor sanctuary cloisters, dual-wheel `valge-vask` *sampo* hydro-forges, bell foundries, twin drum-frustum moat gates, and *Maleva* pavise/pike/crossbow arsenals.
3. **`style: 'suudme'` (*Suudme-Kaarum / Sūmi-Kārum* Assimilated Estuary Towns, 21 buildings, `8143..8163`):** Rian-assimilated lowland estuary towns at East Bluff (`Suudme-Kuluuna`, `px [648, 141]`) and the Floating City `Tooka-Hoov` treaty pontoon-wards (`px [635, 138]`), fusing Kuruneva `kura` vaults, `sanjhya` oriels, `paktong`, and *Kellakoda* clearing-bells 50/50 with Lower-Ria Babylonian polychrome glazed Ishtar arches (`klIshtarKuraVault`), Classical travertine round-arch arcades (`klArcadeKiyomizu`), *Ruan-Thai* dark-teak galleries (`klTeakSanjhyaGallery`), `paktong`-and-gilt hooped glazed pylons (`klHoopedGlazePylon`), bimetallic 5-headed *Uktena* serpent balustrades (`klPaktongNagaRail`), and multi-tier glazed *Pyatthat/Mondop* crowns opening into octagonal bronze bell-lanterns (`klBellMondop`).

All three styles independently cover all **6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` cells**, dedicated `military` (`>= 3`) and `infrastructure` (`>= 5`) rosters, and all **44 Voth census trades** (`KL_TRADES`).

## 2. Core Adoption (`README.md` — "CORE MODULES ARE NOT OPTIONAL")

| Concern | Core Module Adopted | Usage in `kits/kulanewa` |
|---|---|---|
| Building kit geometry, buckets & sheet host | `core/engine` (`engine.py`) | Read in place (`10-core.js` .. `99-tail.html`) |
| Seeded deterministic PRNG | `core/rand` (`KRAND`) | Read in place via `CORE_DIRS`; unique building seeds `8101..8163` |
| Shader hooks, color & warp | `core/shader` (`KHOOK`, `KCOLOR`) | Read in place via `CORE_DIRS` |
| Library PBR textures, M1–M4 AA & POM | `core/materials/record` (`KMAT`, `KMAT_M1`) | `materials.json` + `mip-variance.json` + `27v-kl-vstack.js` (`\|km1` uniform dedup) |
| Stage 7 room-graph daylight & 6-light pool | `core/interiors` (`KROOMLIGHT`) | `klRoom` records `CURREC.rooms`; `91r-kl-roomlight.js` drives 6-`PointLight` pool |
| Vocabulary & placement tagging | `core/tags` (`KTAGS`) | Every placed building & furniture item registered (`culture: 'kulanewa'` in `52-core-tags-vocab.js`) |
| Catalog & bespoke furniture placement | `core/furnish` (`KFURN`) + `kits/catalog` | `38-furniture-bundle.js` + 18 bespoke `kulanewa_*` pieces in `39-kl-furn.js` |
| Operable doors & real glass panes | `core/door` (`KDOOR`, `KGLASS`, `KDOORHOST`) | Every doorway uses `svLeaf` (`klToranaDoor`, `klIshtarPortal`), every window uses `svPane` |
| First-person walkability & reach audit | `core/walk` + `core/walk/box` (`KWALK`) | 100% floor/stair/sky-walk/bridge/pylon reachability (`0` unreached floors, `0` missed targets) |
| Flowing canals, mill-races & Sound slips | `core/water` (`WATER`) | `CURREC.river` streams drawn via `WATER.flow` & `WATER.drawFlow` in `91z-kl-world.js` |
| Drawn ground clearance grid | `core/drawn` (`KDRAWN`) | Registered in `91z-kl-world.js` for `harness.SURVEY` camera clearance checks |
| Atmosphere, wind & placeholder sky | `core/atmos` + `core/atmos/placeholder` | PBR skylight & live cloth flutter on Syndicate, Covenant & Suudme banners |
| Viewer controls, inspector & polytool | `core/host` (`KHOST`) | Standard orbit/walk/cut-away/night shell |
| Headless Chromium verification | `tools/harness.py` | `verify.py` uses `verify_page(..., checks=harness.SURVEY)` |
