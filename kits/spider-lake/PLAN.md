# `kits/spider-lake` — Plan: The Silk Principality of Spider Lake (`1288, 220`) & Ham-Tsek (`1055, 219`)

## 1. Core adoption (written before the first fragment)

Started from `kits/coyote` (`2026-11-16`, the newest standalone building kit on `core/engine`). Every core module is either adopted directly in `build.py` or explicitly accounted for below (`README.md`, "Core modules are not optional").

### Modules taken

| Module | How `kits/spider-lake` takes it |
|---|---|
| `core/engine` | Read in place via `engine.py` (`10-core.js` ... `99-host-take.js`, `99-tail.html`): merged geometry buckets, `defBuilding`, `place`, openings, stairs, walk box reader, night halos, animation, host hand-over. |
| `core/shader` | `06-core-khook.js`, `06b-core-kcolor.js`, `07-core-kwarp.js` (`KHOOK`, `KCOLOR`): composes library material hooks, cut-away, and the live `atmos-silk-wind` shader layer cleanly and checks linked WebGL programs via `KHOOK.checkPrograms`. |
| `core/rand` | `08-core-rand.js` (`KRAND`): deterministic hashing for `core/tags` uids, `MAT_ALT` selection, and seeded placement; no `Math.random` or `Math.sin` hashes in kit fragments. |
| `core/drawn` | `10-core-drawn.js` (`KDRAWN`): registers the sheet's drawn ground grid alongside `groundM.name = 'ground'` so `harness.SURVEY` measures camera clearance against the drawn triangles. |
| `core/materials` (`record` + library) | `23-mat-record.js`, `24-tex-def.js`, `25-matlib-host.js` (`KMAT`) + `materials.json` packed via `tools/textures/pack.py` into `tex/`: real library albedo, lossless 6-bit normal, and roughness maps for every building, rigging, silk, door, resource-node, and furniture surface. |
| `core/tags` | `50/52/53-core-tags*.js` (`KTAGS`): every placed building, resource node, and furniture piece is registered before drawing under culture `'spider-lake'` (plus `'generic'` for world resource nodes and shared catalog goods). |
| `core/furnish` + `core/catalog` | `50/52/53-core-furnish*.js` (`KFURN`) + `kits/catalog/furniture_bundle.py` (`KratorFurniture` with `indexed: true`): places shared `generic`, `generic-goods`, and `jobs` pieces alongside bespoke `spider-lake` pieces (`39-sl-furn.js`), with triplanar library detail maps (`svfDetail`). |
| `core/host` | `khost.SHELL + kengine.HOST`: orbit/WASD/walk camera, frame clock, UI panel, hover inspector, polygon coordinate tool, standard key map (`X` cut-away, `N` night, `E` door, `F` walk), and `window._api` probe. |
| `core/atmos` + `placeholder` | `89-atmos-*.js` (`ATMOS`, `ATMOS.skylight`, `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, `ATMOS.GLSL_WIND` / `atmWind`) + `core/atmos/placeholder` (`KratorSky` read in place): captures skylight reflections onto PBR materials AND drives live downwind billowing and travelling gust ripples across every spider-silk canopy, *velarium*, *shamiyana*, evaporative wind-veil, and `20 m` canal silk streamer. |
| `core/door` | `10-core-door.js`, `20-core-glass.js`, `90-core-door-host.js` (`KDOOR`, `KGLASS`, `KDOORHOST`): real operable hinged/double doors (`svLeaf`) and real window panes (`svPane`), audited open and shut. |
| `core/walk` + `walk/box` | `20-core-walk.js`, `24-core-walk-box.js` (`KWALK`, `KWALKBOX`): automatic box floor/wall extraction (`37-wk-rec.js`), explicit stairs (`svStair`, `svWell`, `svStripWalk`), and flood-fill reachability from every building's front door (`reachAudit`). |
| `core/water` | `20-core-water.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js` (`WATER`): draws the flowing canal stream beneath the Canal Dye-Works (`sl_dyehouse_canal`) and Weir-Bridge (`sl_ferry_bridge`). |
| `kits/resources` | `42r-res-ore.js`, `44r-res-nodes.js` read in place: places the 60 world resource nodes and links `sl_mine_quarry` (`role: 'mine'`) to its nearest mineral/metal node via `resSource`. |

### Modules not taken (one-line reason per module)

| Module | Why not taken |
|---|---|
| `core/world` | Standalone building kit viewer sheet on flat ground; settlements at `Spider Lake (1288, 220)` and `Ham-Tsek (1055, 219)` will read `core/world` when placed on the open-world map. |
| `core/terrain` | Kit viewer sheet stands on a flat ground plane (`terrainH = 0`); carved/stepped stone plinths and quarry benches are architectural masonry. |
| `core/space`, `core/mask` | Kit rows are laid out deterministically by `core/engine/90-scene.js`; street/lot spatial occupancy runs in `core/city` when a settlement page consumes `slDims()`. |
| `core/city`, `core/hamlet`, `core/camp` | This build is the cultural building & silk-tensile kit (`kits/spider-lake`); `slDims()` and `SL_TRADES` expose footprints and Voth census trade mappings ready for `core/city` and `core/hamlet`. |
| `core/simulation`, `core/sched`, `core/clock` | Host frame loop uses `core/clock` via `core/host`; full citizen simulation runs in settlement pages that instantiate this kit. |
| `core/biome` | Flora and fauna belong to biome kits (`README.md`), never baked into building defs. |
| `core/ruins` | All `spider-lake` kit pieces represent intact Principality architecture (`state: 'intact'`); no ruined structures are defined on this sheet. |
| `core/export`, `core/lod`, `core/minimap` | Settlement/world-level tools; the kit sheet uses `core/host` views and `KMAT` material records for Godot crossover. |
| `core/anomaly`, `core/region`, `core/coast` | Regional/open-world map modules, not applicable to a standalone building kit sheet. |

---

## 2. Cultural & Structural Synthesis (`SL1 + SL2 + SL3 + SL4`)

`Spider Lake` (`1288, 220`) and its western market sister `Ham-Tsek` (`1055, 219`) belong ethnically and linguistically to the **Korona / *Hum* cultural complex**—inheriting colonial `Cloud-Fleece` and golden-orb spider symbiosis alongside acoustic *Hum* resonance—refined over centuries of **Ria Civilizational hegemony** into a literate, wealthy lakeside **Silk Principality**.

### Core Structural Honesty Rule
Every building maintains **100% honest structural separation between compression and tension**:
1. **Compression (`Stone & Lacquered Cedar`):** Cream dolomite ashlar plinths, imperial red-porphyry post-and-lintel colonnades, notched dolomite **Mast-Obelisks**, and raked **vermilion-and-ebony lacquered cedar King-Masts** carry all vertical and overturning loads down to stone foundations and perimeter mooring bollards.
2. **Tension (`Spider-Silk Rigging & Membranes`):** Golden `1.3 GPa` dragline-silk cables over bronze pulley sheaves tensioned by nephrite-jade and bronze counterweight bobbins suspend pleated catenary *velaria*, anticlastic hyperbolic-paraboloid ("Lotus-Saddle") amber-waxed silk roofs, indigo-and-gold *shamiyana* court awnings, vertical evaporative silk wind-veils dipping into stone water-troughs, and `18–22 m` hanging dyed canal silk streamers. There are **zero** load-bearing silk shells or "silk eggs".

### The Four Architectural Systems
- **`SL1` — Ria Stone Colonnades & Retractable Catenary *Velarium* Sun-Sails:** Stepped cream-dolomite & red-porphyry colonnades paired with tall notched dolomite Mast-Obelisks, bronze sheaves, golden dragline-silk cables, and nephrite/bronze counterweights spanning saffron, cochineal-crimson, and raw ivory *velaria* over guild plazas, silk bourses, reeling markets, and rich courtyard villas.
- **`SL2` — Raked Lacquered Cedar King-Masts & Hyperbolic-Paraboloid ("Lotus-Saddle") Amber-Silk Roofs:** Raked vermilion-and-ebony lacquered cedar compression masts + perimeter stone/bronze bollards tensioning amber-resin-waxed waterproof spider-silk broadcloth into anticlastic saddle canopies with floating crimson crown-caps and sheer ivory veranda curtains (Palace Pavilion, Great *Hum* Acoustic Sanctuary, Treaty Hall, Noble Saddle Estate).
- **`SL3` — Open Spider-Loft Wind-Scoops, *Shamiyana* Canopies & Evaporative Hanging Silk Wind-Veils:** Poor, middle, and rich lakeside houses, inns, academies, and healing pavilions crowned by open-rafter cedar ***Hum* Spider-Loft Wind-Scoop Towers** (where colonial spiders spin golden orb-webs safely up in the rafters), shaded by *shamiyana* awnings, and cooled by overlapping vertical silk louvers whose lower hems dip into carved dolomite perimeter water-troughs.
- **`SL4` — Weir-Bridges, Cedar Pergola Parasols, Cocoon Lanterns & `20 m` Hanging Dyed Silk Streamers:** Canal dye-houses with twin `16 m` drying-towers draping `18–22 m` catenary silk bolts across flowing canal water (`core/water`), copper silk-reeling works, brocade drawloom halls, full Voth census trade buildings (`SL_TRADES`), arched dolomite weir-bridges, princely barge-quays, silk-weir docks, lakeside bastions, and warm glowing oiled-silk cocoon lanterns at `--night`.

---

## 3. Technical Mandates

1. **Live `core/atmos` Wind & Travelling Gusts on All Silk (`90z-sl-atmos.js`):**
   - Every silk surface (`silk`, `velarium`, `shamiyana`, `veil`, `streamer`, `brocade`, `flag`) is in `SV_CLOTH` and emitted inside `withCloth(...)` with **strict `[0, 0, 0]` pin-weights (`aFlut`) at every masthead, bronze ring, stone lintel, guy-cable corner, pergola rib, and suspension crossbar**, ramping smoothly to peak amplitude in catenary bellies, saddle centers, and free lower hems.
   - `90z-sl-atmos.js` replaces `27-mat.js`'s static scalar `'flut'` hook with `KHOOK.add(MAT[k], 'atmos-silk-wind', ...)` binding `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, and `ATMOS.GLSL_WIND` (`atmWind`), syncing `ANIMU.uWind` each frame, and verifying shader compilation, zero drift at pinned vertices, and active downwind displacement via `verify.py --assert` (`atmos-silk-wind`).
2. **100% Real Library Textures Across Buildings, Silk, Doors & Furniture (`materials.json` -> `tex/`):**
   - `materials.json` wires real library textures across every architectural, silk, resource-node, and `f_*` furniture family, packed deterministically via `tools/textures/pack.py`.
   - `39-sl-furn.js` registers 12 bespoke `spider-lake` furniture pieces (`KratorFurniture.def`) alongside `generic`, `generic-goods`, and `jobs`.
   - `verify.py --assert` (`all-surfaces-textured`) verifies every non-glow, non-glass `Mesh` and `InstancedMesh` in `WORLD` carries a real library `map`.
3. **Geometric World-Space Z-Fighting Audit (`zfightAudit`):**
   - `99-host-tz-sl.js` implements a deterministic 3D world-space coplanar triangle overlap scanner (`_api.zfightAudit()`) across all placed buildings, plinths, colonnade caps, bridges, silk canopies, doors, resource nodes, and furnished interiors, asserted clean (`0` coplanar material/color conflicts) in headless Chromium (`verify.py --assert`).
