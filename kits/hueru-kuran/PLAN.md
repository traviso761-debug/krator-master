# `kits/hueru-kuran` — Plan: The Hueru-Kuran ("Whale Clans") of Crookshore's Four Drowned Ejecta Craters

## 1. Core adoption (written before the first fragment)

Started from `kits/spider-lake` and `kits/coyote` (the gold-standard standalone building kits on `core/engine`). Every core module is either adopted directly in `build.py` or explicitly accounted for below (`README.md`, "Core modules are not optional").

### Modules taken

| Module | How `kits/hueru-kuran` takes it |
|---|---|
| `core/engine` | Read in place via `engine.py` (`10-core.js` ... `99-host-take.js`, `99-tail.html`): merged geometry buckets, `defBuilding`, `place`, openings, stairs, walk box reader, night halos, animation, host hand-over. |
| `core/shader` | `06-core-khook.js`, `06b-core-kcolor.js`, `07-core-kwarp.js` (`KHOOK`, `KCOLOR`): composes library material hooks, cut-away, `core/water` shaders, and the live `atmos-hk-wind` shader layer cleanly and checks linked WebGL programs via `KHOOK.checkPrograms`. |
| `core/rand` | `08-core-rand.js` (`KRAND`): deterministic hashing for `core/tags` uids, `MAT_ALT` selection, and seeded placement; no `Math.random` or `Math.sin` hashes in kit fragments. |
| `core/drawn` | `10-core-drawn.js` (`KDRAWN`): registers the sheet's drawn ground grid alongside `groundM.name = 'ground'` so `harness.SURVEY` measures camera eye clearance against the drawn triangles. |
| `core/materials` (`record` + library) | `23-mat-record.js`, `24-tex-def.js`, `25-matlib-host.js` (`KMAT`) + `materials.json` packed via `tools/textures/pack.py` into `tex/`: real library albedo, lossless 6-bit normal, and roughness maps for every columnar/cyclopean basalt, turf/peat, whalebone, red-cypress, sawn emerald-nephrite jade, Jōmon *kaen-doki* terracotta, verdigris, oiled hide/gutskin, kelp, netting, sea-green glass, door, resource-node, and furniture surface. |
| `core/tags` | `50/52/53-core-tags*.js` (`KTAGS`): every placed building, resource node, and furniture piece is registered before drawing under culture `'hueru-kuran'` (plus `'generic'` for world resource nodes and shared catalog goods). |
| `core/furnish` + `core/catalog` | `50/52/53-core-furnish*.js` (`KFURN`) + `kits/catalog/furniture_bundle.py` (`KratorFurniture` with `indexed: true`): places shared `generic`, `generic-goods`, and `jobs` pieces alongside 16 bespoke `hueru-kuran` pieces (`39-hk-furn.js`), with triplanar library detail maps (`svfDetail`). |
| `core/host` | `khost.SHELL + kengine.HOST`: orbit/WASD/walk camera, frame clock, UI panel, hover inspector, polygon coordinate tool, standard key map (`X` cut-away, `N` night, `E` door, `F` walk), and `window._api` probe. |
| `core/atmos` + `placeholder` | `89-atmos-*.js` (`ATMOS`, `ATMOS.skylight`, `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, `ATMOS.GLSL_WIND` / `atmWind`) + `core/atmos/placeholder` (`KratorSky` read in place): captures skylight reflections onto PBR materials AND drives live downwind sway and travelling gust ripples across all oiled gutskin awnings, pelican throat-pouches, drying kelp curtains, suspended nets, whale-clan banners, and tuned emerald-nephrite wind/tide-chimes. |
| `core/door` | `10-core-door.js`, `20-core-glass.js`, `90-core-door-host.js` (`KDOOR`, `KGLASS`, `KDOORHOST`): real operable red-cypress & bronze doors (`svLeaf`) and translucent thin-sawn emerald-nephrite & sea-green kelp-glass windowpanes (`svPane`), audited open and shut. |
| `core/walk` + `walk/box` | `20-core-walk.js`, `24-core-walk-box.js` (`KWALK`, `KWALKBOX`): automatic box floor/wall extraction (`37-wk-rec.js`), explicit stairs (`svStair`, `svStairCase`, `svWell`, `svStripWalk`, `wkPad`), and flood-fill reachability from every building's front door (`reachAudit`) — including elevated *Prou-Torre* tsunami hatches, *Santa Cristina* aquifer step-wells, and the `90-second` cliff-hoist *via ferrata*. |
| `core/water` | `20-core-water.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js` (`WATER`): draws the live `WATER.still` coastal-aquifer mirror pools inside the *Santa Cristina* Inverted-Keyhole Tsunami-Drawdown Sacred Step-Well (`hk_stepwell_sanctuary`) and thermal healer basin (`hk_healer_lodge`), plus live `WATER.flow` millraces and caldera channels under the Water-Powered Nephrite Pendulum Wire-Saw Mill (`hk_jade_sawmill`), Cypress Log-Flume Yard (`hk_cypress_flume_yard`), and Caldera Weir-Bridge (`hk_ferry_causeway`). |
| `kits/resources` | `42r-res-ore.js`, `44r-res-nodes.js` read in place: places the 60 world resource nodes and links `hk_jade_quarry` (`role: 'mine'`) to its nearest mineral/metal node via `resSource`. |

### Modules not taken (one-line reason per module)

| Module | Why not taken |
|---|---|
| `core/world` | Standalone building kit viewer sheet on flat ground; settlements at Crookshore's four drowned ejecta craters (`89,604`, `81,677`, `104,562`, `123,659`) and `+690 m` terrace (`124,710`) will read `core/world` when placed on the open-world map. |
| `core/terrain` | Kit viewer sheet stands on a flat ground plane (`terrainH = 0`); sunken step-wells, cliff-hoist buttresses, and quarry benches are self-contained architectural masonry. |
| `core/space`, `core/mask` | Kit rows are laid out deterministically by `core/engine/90-scene.js`; street/lot spatial occupancy runs in `core/city` or `core/hamlet` when a settlement page consumes `hkDims()`. |
| `core/city`, `core/hamlet`, `core/camp` | This build is the cultural building, megatsunami-infrastructure, and furniture kit (`kits/hueru-kuran`); `hkDims()` and `HK_TRADES` expose footprints and Voth census trade mappings ready for `core/city` and `core/hamlet`. |
| `core/simulation`, `core/sched`, `core/clock` | Host frame loop uses `core/clock` via `core/host`; full citizen simulation runs in settlement pages that instantiate this kit. |
| `core/biome` | Flora and fauna belong to biome kits (`README.md`), never baked into building defs. |
| `core/ruins` | All `hueru-kuran` kit pieces represent intact tsunami-hardened clan architecture (`state: 'intact'`); no ruined structures are defined on this sheet. |
| `core/export`, `core/lod`, `core/minimap` | Settlement/world-level tools; the kit sheet uses `core/host` views and `KMAT` material records for Godot crossover. |
| `core/anomaly`, `core/region`, `core/coast` | Regional/open-world map modules, not applicable to a standalone building kit sheet. |

---

## 2. Cultural & Architectural Synthesis (`HK1 + HK2 + HK3 + HK4`)

The **`Hueru-Kuran`** ("Whale Clans", western maritime branch of the **`Utari-Kuran`** complex descended from the destroyed arcology **`Kanopi`** in the **Veiled Mountains**, mutually intelligible with both eastern Eternian-subjugated **`Hayrant`** and the unconquered **`Timpar-Kuran`** raiders of the Veiled Mountains; [LORE.md](../../LORE.md) §6.25) inhabit tsunami-safe marine terraces (`+65..+120 m`), breached basalt caldera throats (`89,604`, `81,677`, `104,562`, `123,659`), and the high `+690 m` red-cypress flume terrace (`124,710`) along Krator's megatsunami-battered **`Crookshore`**. Their economy and architecture fuse **Bronze-Age Sardinian *Villaggio Nuragico* (*Su Nuraxi* & *Santa Cristina*)** megalithic basalt engineering with **Prehistoric Jōmon, Kuril-Ainu, and Pacific-Northwest/Aleut pelagic whale-rib, nautical *Hueru-Pira* totem-carving, *kaen-doki* flame-ceramic, and sawn emerald-nephrite (`jade = 200`) craft**:

1. **`HK1` — Sardinian Dry-Stone Basalt *Nuraghi* & *Nuraghi Complessi* (*Su Nuraxi* Massing):**
   - Clan keeps, tsunami-refuge bastions (*Prou-Torres*), granaries, lighthouses, and gatehouses built as **battered dry-laid dark columnar-basalt truncated cones** tapering upward in stepped cyclopean courses with **interior corbelled *tholos* beehive vaults**.
   - Crowned with **projecting Sardinian *mensoloni* basalt stone corbel-brackets** supporting overhanging stone parapets, **trapezoid doorways spanned by massive 3-ton sawn emerald-nephrite (`jade = 200`) lintel blocks** over **triangular relieving slits**, and **trilobate / quadrilobate *Nuraghe Complesso* bastions** joined by concave cyclopean basalt curtain walls.
2. **`HK2` — Sardinian *Santa Cristina* Inverted-Keyhole Tsunami-Drawdown Sacred Step-Wells (`core/water`):**
   - Precision-dressed **inverted-keyhole / triangular basalt ashlar step-wells** descending to a live `core/water` (`WATER.still`) coastal-aquifer mirror pool hung with **tuned emerald-nephrite tide-chimes** — engineered to detect sudden aquifer drawdown `25 minutes` before silent far-field **Ghost Tsunamis** strike Crookshore.
3. **`HK3` — Basalt-Ringed Whale-Rib *Chise* Lodges, `Kanopi` Three-Clan Memory Shrine, *Hueru-Pira* Nautical Totem Poles & Jōmon *Kaen-Doki* Crowns (*Villaggio Nuragico*):**
   - Poor (`3` variants), middle (`3` variants), and rich (`3` variants + Matron's *Ukor* Long-Lodge, Cliff Hostel, Blubber-Lamp Tavern, Hayrant Legation, `Kanopi` Three-Clan Memory Shrine `hk_kanopi_shrine`, and **`Hueru-Pira` Nautical Totem Court & Carver Loft** `hk_nautical_totem_quay`) pair **thick `2.2–2.8 m` battered cyclopean basalt *nuraghe* ring-walls** with **arching bleached pelagic whale-rib structural vaults** supporting **interlocking turf, peat, and red-cypress bark domes**.
   - Flanked on marine headlands, quays, and clan forecourts by **`4.0–9.2 m` *Hueru-Pira* / *Kōpa-Pira* nautical maritime totem poles** (`41-hk-totem.js`) stacking **Pelagic Filter-Whales (*Hueru*)**, **Diving Pouch-Pelicans (*Kōpa-Tori*)** with wind-swaying nephrite tide-chimes, **Kelp Sea-Otters (*Rakkō*)**, **Giant Kelp-Octopi (*Takō*)**, **Fur-Seals (*Tukari*)**, and **Reef-Crabs**, all with **wide-open inlaid emerald-nephrite & ivory horizon-watching eyes**.
4. **`HK4` — Megatsunami Waterfront Infrastructure & Full Voth Census Trades (`48` `hk_*` Defs, `HK_TRADES`):**
   - **Prow-Shaped Hexagonal Columnar-Basalt Lagoon Wave-Splitter** crowned with a **bleached Leviathan Whale-Jawbone Arch** (`hk_wave_splitter`);
   - **Streamlined Intertidal *Nuraghe Prou-Torre* Refuge Keep** with solid `+8 m` lower basalt prow & external ladder-stair to elevated nephrite hatch (`hk_prou_torre`);
   - **90-Second Gravity Water-Counterweight Cliff Hoist** with headframe, crew cage, counterbalancing water-ballast tank, and rock-cut zigzag *via ferrata* stair (`hk_cliff_hoist`);
   - **Perched Tsunami-Safe Slipway & *Baidarka* Shipyard** (`hk_baidarka_yard`);
   - **Water-Powered Nephrite Pendulum Wire-Saw Mill** (`hk_jade_sawmill`), whale-blubber & ambergris try-works, baleen-laminate bowyer & cordage loft, sea-spray brine evaporation & kelp-potash calcining kiln (`hk_brine_kelp_pan`), kelp-soda & quartz-sand sea-green glassworks (`silica = 150`), bronze/iron harpoon smithy, Jōmon *kaen-doki* climbing kiln, smokehouse/saltery, bakehouse, oiled seal-hide tailor, kelp brew-lodge, `+690 m` cypress flume yard, granary-*nuraghe*, warehouse vault, coastal nephrite quarry-mine (`kits/resources`), and *Ukor* Chime-Council Hall.

---

## 3. Explicit Quality Gates

1. **100% Real Library Textures Across ALL Surfaces (`all-surfaces-textured` assert):** Every building, whalebone arch, *Hueru-Pira* nautical totem pole, nephrite lintel, *kaen-doki* crown, gutskin awning, door leaf/hardware, resource node, and `KratorFurniture` piece (`16` bespoke `hueru-kuran` defs + catalog pieces) carries real packed library maps (`0` untextured opaque/lit meshes).
2. **Live `core/atmos` Wind & Gusts (`atmos-wind` assert):** All oiled gutskin awnings, pelican throat-pouches, drying kelp curtains, nets, hide wind-screens, clan banners, and suspended nephrite chime-slabs (`SV_CLOTH`) bind `ATMOS.U.time`, `ATMOS.U.wind`, `ATMOS.U.gustAmp`, and `atmWind` via `KHOOK`, with `0.0` drift at pinned suspension vertices.
3. **Zero Coplanar Z-Fighting (`z-fighting` assert):** `_api.zfightAudit()` scans all world-space triangles across every placed building, *nuraghe* course, whale-rib arch, *Hueru-Pira* totem pole, maritime frieze, lintel, cliff-hoist, and furnished interior and asserts **`0` coplanar material/color overlaps**.
4. **Nautical Totem Triad & Open Horizon-Watching Eyes (`nautical-totems` assert):** `_api.nauticalTotemAudit()` verifies `>= 18` placed `hkNauticalTotemPole`s, `>= 55` stacked coastal creature tiers across all 6 motifs (`whale`, `pelican`, `otter`, `octopus`, `seal`, `crab`), and `100%` wide-open horizon-watching eyes (`openEyes === totalFigures`).
