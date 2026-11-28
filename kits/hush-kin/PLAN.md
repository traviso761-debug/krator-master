# `kits/hush-kin` — Design Plan: The Hush-Kin (*Handspeak* Sanctuary Folk) of Silent Vales

*Status: Build-ready design plan (`2026-11-28`), aligned with [LORE.md](../../LORE.md) §6.25 & §6.26, [CROOK-RIA-SCOPE.md](../../core/region/CROOK-RIA-SCOPE.md), [biomes/crook/PLAN.md](../../biomes/crook/PLAN.md), and [biomes/veiledmountains/PLAN.md](../../biomes/veiledmountains/PLAN.md).*

The **`Hush-Kin`** (*Sutiru-Kuran* "Still-Clan" to their `Utari-Kuran` neighbours; `9,000` souls, `aggression: 0`) inhabit the twin ribbon lakes (`196, 928` & `186, 1020`) and high granite-pegmatite divide of **`Silent Vales`** (`rmwzq292w0qc9` / `rmw4wizrk66e1`). Their entire homeland lies inside **"The Great Hush"** — a surviving pre-Cataclysm broadband acoustic-suppression field where voices, footsteps, rockfalls, and gunfire drop to `-inf dB` dead silence, while **only pure sinusoidal harmonics (`440 / 660 Hz`)** pass undamped. Communicating `100%` in grammatical **Two-Handed Sign Language (*Handspeak*)** (and fighting *no* outsiders except rare southern `Timpar-Kuran` raiding parties), their architecture fuses **pale high-divide granite and blue-grey slate terraces** with **gleaming stepped snow-white milky-quartz & rock-crystal spires**, **unbroken *Handspeak* sightline galleries**, and **sinusoidal nephrite lithophone & *bianzhong* bell belfries**.

---

## 0. Build Identity & Key Specifications

| Field | Specification |
|---|---|
| **Folder & Output** | `kits/hush-kin/` (`src/`, `tests/`, `build.py`, `verify.py`, `kit_bundle.py`, `materials.json`, `mip-variance.json`, `tex/`, `API.md`, `PORT.md`, `INDEX.md`, `KNOWN_ISSUES.md`, `README.md`, `BUDGETS.json`) -> `dist/hush-kin.html` (+ sidecar `.tex.js`) |
| **Culture & Identifiers** | `KIT_ID = 'hush-kin'`, `culture: 'hush-kin'` (registered locally onto `KTAGS.VOCAB` via `52z-hs-vocab.js`), building key prefix **`hs_`**, fragment prefix **`// prefix: hs`**, sealed world bundle **`HSK`** (`kit_bundle.py`) |
| **Reserved Seed Block** | **`37001–37499`** (`37001–37099` *Handspeak* dwellings & sightline terraces, `37101–37199` white-quartz heliograph spires, moot-amphitheatres & Hush sanctuaries, `37201–37299` open-palm boundary gates & silent border watches, `37301–37399` ribbon-lake ferries, quartz/nephrite lapidaries & `HS_TRADES`, `37401–37499` lakeside sightline showcase) |
| **Signature Architectural Pillars** | 1. **Gleaming Stepped Snow-White Quartz Spires (`hsQuartzSpire`):** `5:1` to `6:1` battered granite-and-slate shafts crowned with **stepped snow-white milky-quartz pyramids & rock-crystal prism lanterns** (`hsHeliograph`) for silent optical signalling across mist-veiled ribbon lakes.<br>2. **Sinusoidal `440 / 660 Hz` Resonance (`hsLithophoneRack` & `hsBianzhongFrame`):** Sawn emerald-nephrite lithophone slabs and two-tone elliptic *bianzhong* bronze bells (`SV_CLOTH` rigid-pendulum wind/mallet sway) that ring at the sole pure harmonics *The Great Hush* transmits.<br>3. **`100%` *Handspeak* Sightline Architecture:** Open colonnaded sign-loggias (`>= 65%` clear ground-arcade sightlines), circular stepped *Handspeak* council amphitheatres (`hs_handspeak_moot`), warm chest-height night sign-alcoves (`y = 1.15–1.55 m` crystal-diffused lamps illuminating signers' hands), and carved **raised open-palm boundary monoliths** (`hsPalmMonolith`) |

---

## 1. Core Adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

Modelled directly on [kits/timpar-kuran/build.py](../timpar-kuran/build.py) and [kits/hueru-kuran/build.py](../hueru-kuran/build.py), opted into all `2026-11-11` `SURVEY` checks in `tools/checks_optin.json` (`recorded`, `samplers`, `drawn-ground`, `names`, `water-mouths`).

### 1.1 Modules Taken

| Module | Fragments / Path | How `kits/hush-kin` Takes It |
|---|---|---|
| **`core/engine`** | `engine.py` (`10-core.js` ... `99-host-take.js`, `99-tail.html`), read in place | Merged PBR material buckets, `defBuilding`, `place`, openings (`36o-open.js`), walkable stepped amphitheatre & terrace stairs (`36s-stair.js`), walk boxes (`37-wk-rec.js`), furnish pass (`91f-furnish.js`), night crystal-lantern halos (`91n-night.js`), clock (`93-anim.js`), host hand-over |
| **`core/shader`** | `06-core-khook.js`, `06b-core-kcolor.js`, `07-core-kwarp.js` (`KHOOK`, `KCOLOR`) | Library PBR detail hooks, cut-away planes, `core/water` ribbon-lake shaders, crystal/quartz specular & emissive lantern hooks, and `atmos-hs-wind` silent wind sway (swaying banners, seed-chimney bundles & rigid-pendulum nephrite/*bianzhong* chimes in `100%` visual wind inside dead acoustic silence!) |
| **`core/rand`** | `08-core-rand.js` (`KRAND`) | Every `core/tags` uid, quartz-step proportion, heliograph shutter angle, lithophone pitch bar, and masonry take drawn from `KRAND` hashes of `(world, cell, index, salt)` — zero `Math.random` or `Math.sin` |
| **`core/drawn`** | `10-core-drawn.js` (`KDRAWN`) | Registers the kit sheet's drawn granite-and-ribbon-lake ground grid so `SURVEY` eye-clearance audits test real drawn triangles |
| **`core/materials`** | `23-mat-record.js`, `24-tex-def.js`, `25-matlib-host.js`, `27-matlib-m1.js` (`KMAT`) + `materials.json` -> `tex/` | Packed `512 px` library albedo, lossless normal, and roughness maps across `quartz` (snow-white milky quartz), `crystal` (rock-crystal prism), `granite` (pale silver-grey pegmatite granite), `slate` (blue-grey roofing & paving slate), `nephrite`, `bronze` (*bianzhong*), `cypress`, `birch`, `linen`, `felt`, and `f_*` furniture maps (`<= 14/15` samplers) |
| **`core/tags`** | `50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` + `src/52z-hs-vocab.js` (`KTAGS`) | Pre-draw registration of every placed `hs_*` building, quartz spire, open-palm monolith, Ancient Hush-pylon, resource node, and furniture item |
| **`core/furnish` + `core/catalog`** | `50/52/53-core-furnish*.js` (`KFURN`) + `furniture_bundle.py` (`indexed: true`) | Bundles `generic`, `generic-goods`, `jobs`, `arms`, and `scrap` alongside **`14` bespoke `hush_*` pieces** (`src/39-hs-furn.js`: two-tone *bianzhong* bell-rack, sawn nephrite lithophone stand, shuttered quartz heliograph lantern, chest-height *Handspeak* mirror-lamp, open-palm stele, silent felt-runner loom, etc.) |
| **`core/host`** | `khost.SHELL + kengine.HOST` | Orbit/WASD/walk camera, frame clock (`core/clock`), hover inspector, polygon tool, standard keys (`X` cut-away, `N` night, `E` door, `F` walk), `window._api` |
| **`core/atmos` + `placeholder`** | `89-atmos-*.js` (`ATMOS`, `ATMOS.skylight`, `ATMOS.U`, `ATMOS.GLSL_WIND`) + `KratorSky` | Crisp silent alpine skylight on white-quartz facets + live `ATMOS` wind moving linen sign-flags and lithophone pendulums silently inside *The Great Hush* |
| **`core/door`** | `10-core-door.js`, `20-core-glass.js`, `90-core-door-host.js` (`KDOOR`, `KGLASS`, `KDOORHOST`) | Operable silent felt-buffered cypress & bronze-pivoted doors (`svLeaf`) + translucent thin-sawn rock-crystal & quartz windowpanes (`svPane`) |
| **`core/walk` + `walk/box`** | `20-core-walk.js`, `24-core-walk-box.js` (`KWALK`, `KWALKBOX`) | Walkable open sign-galleries, stepped moot-amphitheatre tiers, heliograph tower stairs, and ribbon-lake slips (`reachAudit`) |
| **`core/water`** | `20-core-water.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js` (`WATER`) | Live mirror-calm `WATER.still` ribbon-lake basins and silent `WATER.flow` quartz-grinding millraces (obeying `water-mouths`) |
| **`kits/resources`** | `42r-res-ore.js`, `44r-res-nodes.js`, read in place | Places high-divide `quartz`/`silica`, `jade`, `copper`, `tin`, `silver`, and `stone` nodes and binds `hs_quartz_quarry` & `hs_bell_foundry` via `resSource` |

### 1.2 Modules Deliberately Not Taken

| Module | Why Not Taken |
|---|---|
| `core/world`, `core/terrain`, `core/biome` | Standalone building-kit sheet on an analytic `KDRAWN` ground; `Silent Vales` biome / open-world builds load `HSK` (`kit_bundle.py`) |
| `core/space`, `core/mask`, `core/city`, `core/hamlet`, `core/camp` | Settlement-layout modules; `kits/hush-kin` exports `hsDims()`, `HS_TRADES`, and `HSK` ready for `core/hamlet` ribbon-lake sanctuary villages |
| `core/simulation`, `core/sched`, `core/coast`, `core/ruins` | Kit sheet runs `core/clock` for rotating heliograph shutters; `Silent Vales` has inland ribbon lakes (`196,928` & `186,1020`, `0 km` ocean coast); `hs_hush_pylon_shrine` frames an intact tended Ancient acoustic obelisk rather than `KRUINS` rubble |

---

## 2. Three-Tier Architectural Grammar (`HS1`–`HS3`)

1. **`HS1` — Gleaming Snow-White Milky-Quartz Spires & Optical Heliographs (`src/41-hs-quartz.js`):**
   - Battered `5:1` pale-granite & blue-slate towers (`hsSpireTower`) crowned with **6- to 9-stepped snow-white `quartz` pyramidal spires (`hsQuartzPyramid`)**, rock-crystal prism-lantern cupolas (`hsHeliographCupola` with rotating `core/clock` bronze shutter vanes!), and slender monolithic white-quartz tuning-fork finials.
2. **`HS2` — *Handspeak* Open-Sightline Loggias & Hand-Lit Night Alcoves (`src/40-hs-kit.js`):**
   - Unlike windowless mountain keeps, `Hush-Kin` houses and halls open onto **wide colonnaded granite-and-cypress *Handspeak* sign-porches** (`hsSignGallery`) so neighbours can converse clearly across streets, terraces, and courtyards (`>= 1.8 cm` non-coplanar relief steps; `0` z-fights).
   - Every threshold and gallery features **chest-height (`1.25 m`) rock-crystal sign-lantern alcoves** (`hsHandLamp`) backed by polished white-quartz reflectors so signers' hands are brightly lit at dusk (`--night`).
3. **`HS3` — Pure `440 / 660 Hz` Harmonic Lithophones, *Bianzhong* Bells & Open-Palm Boundary Stones:**
   - Because broadband speech and clatter vanish inside *The Great Hush*, civic announcements, ferry calls, and rare `Timpar-Kuran` border alerts use **tuned emerald-nephrite lithophones** and **elliptic two-tone *bianzhong* bronze bells**, while passes and lake-quays stand behind **carved open-palm granite & white-quartz monoliths** (`hsPalmMonolith`).

---

## 3. Complete Building Roster (`35` `hs_*` Defs + `44`-Row `HS_TRADES` Census)

- **Dwellings (`10` defs, `37001–37010` — full `(poor | middle | rich) × (single | multi)` matrix):**
  - `hs_slate_cot_poor`, `hs_lake_croft_poor`, `hs_terrace_pair_poor`, `hs_sign_loggia_mid`, `hs_quartz_gabled_mid`, `hs_courtyard_sign_mid`, `hs_arcade_row_mid`, `hs_spire_villa_rich`, `hs_lithophone_manor_rich`, `hs_gallery_house_rich`.
- **Sanctuaries, Moot-Amphitheatres, Quartz Heliographs & Border Defence (`10` defs, `37101–37204`):**
  - `hs_handspeak_moot` (Circular Stepped *Handspeak* Council Amphitheatre & White-Quartz Spire), `hs_heliograph_beacon` (Tall `21 m` Snow-White Quartz Optical Heliograph & Prism-Shutter Tower), `hs_bianzhong_belfry` (Sinusoidal `440/660 Hz` *Bianzhong* & Nephrite Lithophone Sanctuary), `hs_hush_pylon_shrine` (Tended Pre-Cataclysm Acoustic Hush-Pylon & Crystal Garden), `hs_sign_academy` (*Handspeak* Visual Chronicle & Gesture-Scroll School), `hs_quiet_infirmary` (Herbal & Thermal-Stone Sanctuary Healer), `hs_quartz_ossuary` (Stepped White-Quartz Lantern Columbaria), `hs_palm_gate` (Open-Palm Monolith Pass Gate watching the `Timpar-Kuran` border), `hs_mist_watch_spire` (Slender `5:1` Granite-and-White-Quartz Border Watchtower with `440 Hz` Alarm Bell), `hs_sanctuary_wall` (Granite & Slate Sightline Curtain Wall).
- **Silent Works, Ribbon-Lake Ferries & Voth Census Trades (`15` defs, `37301–37315`):**
  - `hs_quartz_quarry` (Milky-Quartz & Pegmatite Crystal Quarry, `resSource: 'silica'`/`'stone'`), `hs_lithophone_lapidary` (Water-Driven Quartz-Prism & Nephrite Lithophone Grinding Mill), `hs_bell_foundry` ( Harmonic *Bianzhong* Two-Tone Bronze Bell Foundry, `resSource: 'copper'`/`'tin'`), `hs_felt_weaver` (Sound-Damping Felt-Sole & Undyed/Indigo Linen Loom-House), `hs_silent_ferry` (Ribbon-Lake Underwater-Cable Silent Ferry & White-Quartz Landing), `hs_reed_skiff_shed` (Scull-Oar Lake Boatyard & Net-Drying Pier), `hs_slate_bakehouse`, `hs_herb_smokehouse`, `hs_birch_brew_cellar`, `hs_bark_tannery`, `hs_granary_spire` (White-Quartz-Capped Stilted Granite Silo & Watermill), `hs_prism_warehouse`, `hs_wayfarer_hospice` (Guest Hostel with Visual *Handspeak* Primer Tablets for Mute Outsiders!), `hs_tea_sign_pavilion`, `hs_ribbon_terrace_farm` (Contoured Lake-Shore Grain, Berry, Goat-Cheese & Dark-Cellar Mushroom Croft) — plus `hs_lakeside_sanctuary_row` (`37401` diorama showcase).
