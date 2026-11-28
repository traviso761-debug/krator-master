# Jimjam — Scale Model 5.1 City Site Blueprint (`st5e01l76v`)

Status: **Site blueprint on the Scale Model 5.1 ground (`2026-11-18`)**. `settlements/jimjam/` currently builds only the **Jimjam architectural & sacred kit sheet** (`JJ.def`: 39 buildings across 7 categories + 9 `JJFURN` pieces, `dist/jimjam.html` today, to be split cleanly as `dist/jimjam-kit.html` beside the city target). This document specifies the **1:1 city and openworld site build** for **Jimjam** (`id: st5e01l76v`, pixel `(745, 546)`, world `(-892,000 m E, -2,046,000 m S)`), capital of the **Kingdom of Jimjam** (`22,000` townsfolk at the capital inside `41,000` in `JJ1` and `65,500` across the kingdom; `core/simulation/PROPOSAL-ARDENT-JIMJAM.md`).

Read first:
- `settlements/jimjam/DESIGN.md`, `AGENT-BRIEF.md`, `API.md`, `INDEX.md`, `KNOWN_ISSUES.md` — the banded red/yellow brick, imported marble trim, onion/ribbed domes, chhatris, stepped plinths, and solstice-arch contract of `JJ.def`.
- `LORE.md` §6.14 (Jimjam, the *kaunṭavan* day-keepers, the 292-day year, the `±50°` Veil elongation, the four rival calendar schools, and the **Raja's Eye** quest) and §12 (the `-40° S` vs `-34.34° S` solstice-azimuth discrepancy).
- `core/simulation/PROPOSAL-ARDENT-JIMJAM.md` — canonical 5.1 provinces (`JJ1`, `JJ2`), named settlements, trade corridors (`Dilihan` via the Cut, `Ardent` / Free Clans, `Skywatch`, `Palewharf` lake barges), and census.
- `core/city/README.md` ("Porting a settlement") and `openworld/PLAN-SITES.md` — the shared settlement and 1:1 terrain architecture.

---

## 0. What the City Build Is & Core Adoption

### 0.1 Separating the Kit Target from the City & Site Targets

`settlements/jimjam/src/` (`00-jj-shell.js` through `90-scene.js`) is an active kit sheet read in place by downstream builds (`settlements/dilihan` for southern-fringe brick/caravanserai dialogue, and Jimjam's own verify suite). The city build preserves the kit fragments untouched in `src/60-jj-materials.js`..`84-jj-furniture.js` and splits `build.py` into three clean targets on the standard `settlements/voth` / `settlements/verge` / `settlements/dilihan` pattern:

| Target | Command | Output | Role |
|---|---|---|---|
| **Kit sheet** (existing) | `python3 tools/build.py jimjam --kit` (alias preserved while transitioning) | `dist/jimjam-kit.html` | Inspection grid of all `JJ.def` buildings, `JJFURN` pieces, `JJ.solsticeCheck()`, polygon/socket inspector |
| **City build** (new default) | `python3 tools/build.py jimjam` | `dist/jimjam.html` | The `22,000`-person capital at `(745, 546)` on 1:1 `WORLD.Hland` ground (`core/world` + `core/city`), lakeside barge cove, Raised Solar Acropolis, Palace + Sunray Plaza, walled brick wards, *hanḍu* farm belt |
| **Site editor** (new) | `python3 tools/build.py jimjam --site` | `dist/jimjam-site.html` | Reads Voth's site-editor fragments (`settlements/voth/src/site/`) in place over `site/jimjam-site.json` for authoring zone polygons, walls, roads, pads, and fixed landmarks (`jj_temple_sun`, `jj_palace`, `jj_amphitheater`, harbour moles) |

In addition, when the NW Lowlands / North Cut `openworld/<region>` slice is cut by `tools/scale-model/extract_region.py`, `st5e01l76v` mounts the exact same `site/jimjam-site.json` + `KCITY` record stream on `WORLD.Hland`.

### 0.2 Core Adoption (`tools/check_core_use.py` Contract)

Per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and `AGENTS.md`, the city build writes **zero** bespoke PRNG, noise, `getImageData`, spatial hash, sky dome, water shader, camerarig, or verify launcher. Every subsystem takes its `core/` or shared kit module:

| Subsystem | Module / Source | How Jimjam Uses It |
|---|---|---|
| **1:1 World terrain & streaming** | `core/world` (`WORLD.H`, `WORLD.Hland`, `ROADS`, `41t-world-townwater.js`, `49r-world-resources.js`) | Streams the 1:1 Scale Model 5.1 heightfield around `(745, 546)` (`+486.2 m` bench above `+429.78 m` Great Trough Lake), overland Cut / Free-Clan / Skywatch roads, lotus-tank feeder channels (`41t`), and nearby resource lodes (`49r`). |
| **Lakeside coast & water** | `core/coast` (`KCOAST`, `44c-world-coast.js`) + `core/water` (`farbed` opt-in) | Shapes the NNW sheltered pocket cove (`(744..745, 545)`), brick quay walls, shingle/marl strand, and shallow barge basin at lake datum **`+429.78 m`**, plus calm reflective water in the city's stepped brick lotus tanks. |
| **1:1 Ground deltas** | `core/terrain` (`KLAND` / `WORLD.landHook`, `CORE_TERRAIN` if rock-cut) | Applies minimal, sign-safe `levelPad` / basin / slope-bowl deltas for the Solar Acropolis (`50 × 86 m`), Palace + Sunray Plaza (`113 × 180 m`), Amphitheater slope hollow (`80 × 61 m`), and `3.5 m`-dredged NNW barge basin. |
| **City layout & infill** | `core/city` (`KCITY` steps `0`–`12`, `54-city-host-construct.js`) | Generates avenues, concentric lake-terrace streets, `frontage-courts` blocks (sacred/palace/rich lotus-court wards), `alleys` blocks (kiln, glass, almanac-press, and harbour wards), and `KCONS` (`kits/construction`) under-construction lots. |
| **Primary building kit** | `settlements/jimjam/src/60`–`84` (`JJ.def`, `JJ_MAT`, `JJFURN`) read in place | All 39 existing banded-brick, marble-trimmed, onion/ribbed-domed buildings and walls (`culture: 'jimjam'`), extended in `src/77`–`78` only for missing Voth-census trade lots (`KNOWN_ISSUES.md`). |
| **Farming & clay/quarry hamlets** | `core/hamlet` (`KHAMLET.village`, `KHAMLET.CULTURES.jimjam`) | Places lakeside *hanḍu* irrigated rice/cotton/indigo villages, rhythmite clay-pit brickworks, and gypsum/alabaster quarry hamlets on the `+432..+480 m` bench and `Tāmarai-āṟu` fan. |
| **Crops & resource nodes** | `kits/crops` (`CROPS.at`, `CROPS.palette`) + `kits/resources` | Selects climate-legal `Am`/`Cfa` `dense`-air (`1.51 atm`) crops (`rice`, `cotton`, `indigo`, `saffron`, `citron`, `ironplum`, `lotus-root`, `emmer`) and places local `clay`, `gypsum`, `alabaster`, `emerald`, and `iron` workings. |
| **Interiors & furnishing** | `core/furnish` (`KFURN.useBatch(..., {indexed: true})`) + `kits/interiors` (`ROOM()`) + `core/catalog` (`catalog.py`) | Furnishes openable interiors (Sun Temple sanctuary, Palace audience hall, Almanac College, Raja's Eye observatory, Caravanserai, sample rich/mid/poor houses) using `JJFURN` + shared catalog pieces with indexed geometry (`indexed: true`, never triangle soup). |
| **Citizens & visitors** | `core/charactermodels` (`peoples.json`) + `core/sched` | Populates Jamṭōkku townsfolk, shaved-headed saffron/indigo-sashed *kaunṭavan* day-keepers, Izani Cut caravanners, Free-Clan bronze factors, Eternian lake-barge crews, and the Republican Guild's posted astronomer minder. |
| **Economy, clock & 292-day almanac** | `core/simulation` (`SIM`) + `core/region` + `core/clock` | Wires `JJ1` (`Jimjam`) into the Cut / Trough / Free-Clan trade graph (`PROPOSAL-ARDENT-JIMJAM.md`), keeping `test-sim.js` and Voth's stocks baseline unchanged unless intentionally updated. |
| **Determinism, masks & space** | `core/rand` (`KRAND`), `core/mask` (`KMASK.canvas`), `core/space` (`KSPACE`) | Every lot, tree, brick variant, and crop plot hashes `(world, cell, index, salt)` via `KRAND`; masks sample `KMASK.canvas` (never `getImageData`); occupancy uses `KSPACE`; numeric defaults use `x == null ? d : x`. |
| **Tags, edits, LOD & host UI** | `core/tags` (`KTAGS`), `core/edits` (`KEDITS`), `core/lod` (`09-lod.js`, `97-lod-auto.js`), `core/host` (`khost.FULL + khost.KEYS`), `core/export` | Registers every placed record in `KTAGS` (`culture: 'jimjam'`) before draw; keeps site edits as id-keyed deltas in `KEDITS`; attaches LOD tiers (`JJ_LOD_SPECS`) and full inspector/probe/walk/flight UI + Godot export. |
| **Sky & celestial mechanics** | `core/world/80-world-sky.js` (`KratorSky`, shared sky contract) | Renders the NE ringed Gas Giant (`Az 66°`, `Alt +25°`, `30°` disc), inner `Companion` dial, `Veil` (`±50°` elongation), and solar ephemeris — parameterized to Jimjam's true 5.1 latitude **`-34.34° S`** (see §1.6 & §4.3 Q1). |
| **Build & verification** | `tools/build_sources.py` (`report()`) + `tools/harness.py` | `build.py` calls `build_sources.report()` before its first write (`encoding='utf-8'`, `newline='\n'`, `/` paths); `verify.py` uses `tools/harness.py` (`KRATOR_GPU_LANE=auto` for `--assert`, `arc` for `--timing`). |

---

## 1. Scale Model 5.1 Site Survey at `(745, 546)`

All figures below were sampled directly from `tools/scale-model/model/data/` (`h.png`, `wl.png`, `tm.png`, `p.png`, `c.png`, `rivers.json`, `basins.json`, `outlets.json`, `palaeolakes.json`, `floods.json`, `model.json`), `tools/scale-model/model/src/60-settlements.js`, `kits/crops`, and `kits/resources/data/geology.json` + `lodes.json`.

### 1.1 World Pin, Frame & Polygons

| Property | Scale Model 5.1 Value | Notes |
|---|---|---|
| **Settlement record** | `id: "st5e01l76v"`, `name: "Jimjam"`, `type: "city"` | Moved `2026-11-11` by the owner `8 km` north to the lake shore (`60-settlements.js` `SETT_MOVED['5.1e6']`) |
| **5.1 canvas pixel** | **`px = 745`, `py = 546`** (`2,000 m/px` on `2048 × 2048`) | Legacy 4.23 pixel was `(473, 216)` (`legacy_shift: dx = +272, dy = +330`; older kit brief quoted `474, 220`) |
| **World coordinates** | **`x = -892,000 m` (`-892.0 km E`), `z = -2,046,000 m` (`-2,046.0 km S`)** | Origin `(1191, 1569)` |
| **True 5.1 latitude** | **`-34.34° S`** (`smodel/climate.py`: `y_old = 216` on `-30°..-58° S`) | `5.66°` closer to the equator than `KratorSky`'s placeholder `-40.00° S` (`LORE.md` §6.14, §12) |
| **Containing polygons** | Political: **`Jimjam`** (`rmv9g32xg2gqt`)<br>Biome: **`NW lowlands`** (`rmuqlni4tiwqm`) + **`floodzone`** (`rmvflvh2enyr6`)<br>Geographic: **`big demo`** (`rmuvgirpa9ui1`) | Nearest upland biome boundary: **`n highlands`** (`rmuqllt8dvbu0`) `46.9 km` E/SE |

### 1.2 Micro-Topography: The `+486 m` Bench, the NNW Pocket Cove & the WSW Peninsula

Sampling the `15 × 15` pixel grid (`x = 738..752`, `y = 539..553`, `30 × 30 km`) reveals a much richer coastal geometry than a plain west-facing beach:

1. **The Capital Bench (`(745, 546)`):** Dry land (`whas = False`) at **`E = +486.2 m`**, standing **`+56.5 m` above Great Trough Lake (`wlev = +429.78 m`)**. Local slope at the pin is a gentle, buildable **`27.9 m/km` (`1.60°`)**, rising SSE (`dE/dy = +27.1 m/km`, `dE/dx = +6.5 m/km`) toward `+540..+645 m` terraces `2–6 km` inland.
2. **The Sheltered NNW Harbour Embayment (`(742..745, 544..545)`):** Directly **north and NNW** (`Az 333.4°`, `2.0–2.8 km` from pin center) Great Trough Lake indents eastward into a natural **lee-sheltered pocket bay**:
   - `(745, 545)` (`2.0 km` N) and `(744, 545)` (`2.8 km` NNW) are **wet (`whas = True`)** with bed `+427.1 m` and **shallow `2.7 m` water depth** — an ideal natural shelf for brick moles, `25 t` barge quays, and lotus-lined ferry steps!
   - Just `1 cell` farther out at `(743, 544)` (`4.5 km` NW), the bay floor drops to `+368.4 m` (**`61.4 m` water depth**), giving deep-water anchorage sheltered from south-westerly squalls.
3. **The 10 km WSW Headland Peninsula (`x = 740..744, y = 546..551`):** Extending **west and WSW** from Jimjam's bench is a dry **promontory/peninsula** separating the northern pocket cove (`y = 544..545`) from the southern river-mouth bay (`y = 552..555`):
   - Due west along `y = 546`, the headland crest runs `+488.5 m` `(744,546)` → `+511.1 m` `(743,546)` → `+523.7 m` `(742,546)` → `+529.1 m` `(741,546)` → `+467.7 m` `(740,546)` before plunging into deep open lake at `(739, 546)` (`68.1 m` deep) and `(738, 546)` (`156.2 m` deep).
   - Toward the WSW (`4.5–5.7 km`, `(743, 547..548)`), this headland swells into a **`+572..+625 m` low ridge** (`+86..+139 m` above the pin) before dropping southward into the `Tāmarai-āṟu` estuary bay.
4. **Buildable Bench Supply:**
   - **Within `6 km` (`116 km²`):** `92 km²` dry (`+462..+647 m`, median `+530 m`), `24 km²` wet (`2.7..61.4 m` deep); **`28 km²` at `≤ 25 m/km`** and **`84 km²` at `≤ 40 m/km`**.
   - **Within `15 km` (`708 km²`):** `556 km²` dry (`+368..+831 m`, median `+644 m`), `152 km²` wet (`2.7..264 m` deep); **`300 km²` gentle benches `≤ 25 m/km`** (`516 km²` `≤ 40 m/km`) — ample room for the walled `22,000`-person capital and gridded lakeside *hanḍu* estates.
   - **Within `30 km` (`2,836 km²`):** `2,068 km²` dry (`+357..+1,299 m`), `768 km²` wet (`2.7..631 m` deep); **`1,000 km²` gentle benches `≤ 25 m/km`**.

### 1.3 Hydrology: Great Trough Lake (`+429.78 m`) & Regional Rivers

- **Great Trough Lake (`wl.png` connected component `lbl = 77`, `rivers.json` target `lake_m: 430`):**
  - **Extent & Bathymetry:** **`28,704 km²`** (`7,176 px`), spanning `390 km` E–W (`x = 562..757`) by `250 km` N–S (`y = 500..625`) at uniform surface level **`+429.78 m`**. Lakebed elevation ranges from `-467.2 m` to `+427.1 m` (median bed `+27.6 m`), giving **`897.0 m` maximum depth** and **`402.2 m` median depth**.
  - **Water Balance & Chemistry:** Closed inland trough lake (`outlets.json` has no surface spillway from `lbl = 77`), fed by **`14` mapped rivers totaling `591.9 m³/s`** balanced against `~0.65 m/yr` evaporation across `28,704 km²`. Because its deep eastern head receives heavy `Am`/`Af`/`Cfa` monsoon rainfall (`1,176–1,459 mm/yr`) and perennial highland rivers, Jimjam's eastern bay is **freshwater**, whereas shallow evaporating embayments `250–380 km` WSW toward `Barada-Quay` (`JJ2`) concentrate soda and salts.
  - **Inland Navigation:** Connects Jimjam's NNW cove directly across open water to `Barada-Quay` (`620, 604`, `~276 km` WSW) and Eternian `Palewharf` (`565, 604`, `378.2 km` chord / `425.3 km` barge track).
- **Mapped Scale-Model Rivers within `60 km` (all carrying Jamṭōkku names in `rivers.json`):**

| ID | Name & Jamṭōkku Gloss | Kind | Mouth `(px, py)` | Dist & Bearing from `(745,546)` | `Q_mouth` (`m³/s`) | Notes |
|---|---|---|---|---|---|---|
| `r038` | **`Tāmarai-āṟu`** (*"Lotus River"*) | Perennial trunk | `(740.6, 554.3)` → `lake_m: 430` | **`18.8 km` SSW (`Az 207.9°`)** | **`115.5`** | Rises near North Cut divide `(742.6, 588.4, +856 m)`; guides the Cut caravan road straight to Jimjam; rich rice/lotus delta fan. |
| `r356` | **`Mēkam-ōṭai`** (*"Monsoon-Cloud Stream"*) | Perennial trib. | `(742.6, 556.3)` → `r038` | **`21.2 km` SSW (`Az 193.1°`)** | **`28.0`** | Drains the `+2,703 m` SE highland flank `(760.6, 574.4)` into `Tāmarai-āṟu`. |
| `r876` | **`Pacum-kāl`** (*"Green-Paddy Wadi"*) | Seasonal wadi | `(724.6, 546.3)` → `lake_m: 430` | **`37.5 km` W (`Az 262.7°`)** | **`4.0`** | Drains the alabaster hills around `Veḷḷai-kal` `(728, 546)`. |
| `r057` | **`Veḷḷi-āṟu`** (*"Silver River"*) | Perennial river | `(758.6, 526.3)` → `lake_m: 430` | **`45.2 km` NNE (`Az 34.5°`)** | **`75.0`** | Waters the northern lake bench along the copper road toward `Cempu-malai`. |
| `r222` | **`Kuḷir-ōṭai`** (*"Cool Stream"*) | Perennial stream | `(754.6, 518.3)` → `lake_m: 430` | **`59.0 km` NNE (`Az 19.1°`)** | **`18.9`** | Northern `JJ1` lakeshore stream. |

- **1:1 Site Water Implication:** No scale-model trunk river crosses pixel `(745, 546)` itself (`Tāmarai-āṟu` mouths `18.8 km` SSW across the peninsula neck, and `springs.json` has zero authored springs within `60 km`). At 1:1, the capital's water architecture therefore centers on **monsoon rainwater & bench runoff harvested into stepped brick lotus tanks (`kuḷam`), masonry aqueduct/cistern storage, and lakeside shaduf/screw-lifts** on the `+429.78 m` freshwater bay (with an optional minor `41t` bench rill feeding the Palace/Temple tanks; see §4.3 Q2).

### 1.4 Climate, Dense Atmosphere & Legal Crop Basket (`kits/crops`)

- **Köppen & Thermal Regime at `(745, 546)`:** **`Am` (tropical monsoon)** at the lake-moderated junction of `Cfa` (`78 px` within `15 km`), `Af` (`44 px`), `Aw` (`8 px`), `Am` (`6 px`), and `Csa` (`3 px`).
  - Annual mean **`tm = 25.0 °C`**; coldest month **`tc = 18.0 °C`**; warmest month **`tw = 31.0 °C`**; **`0` frost months** (`CROPS` warmth band: **`subtropic`** on the warm `25 °C` tropic boundary).
  - Annual precipitation **`p = 1,176 mm/yr`** at the pin, rising to **`1,372 mm/yr` mean (`1,459 mm/yr` max)** on the eastern `15 km` bench (`CROPS` moisture band: **`humid`** irrigated / `subhumid`–`humid` rainfed).
- **Barometric Pressure (`1.6 * exp(-h / 8000)`):**
  - **`1.506 atm`** (`CROPS` atmosphere band: **`dense`**, index `2`) at the `+486.2 m` pin; **`1.517 atm`** at the `+429.78 m` quay; **`1.477 atm`** on the `+640 m` upper hill bench.
  - **Architectural & Kiln Consequence:** Dense `1.51 atm` air carries `~51%` higher convective heat capacity and oxygen mass per unit volume than Earth sea level — intensifying monsoon sun-heat (justifying thick brick walls, deep arcades, chhatri breeze pavilions, and stepped water tanks) while letting wood- and husk-fired brick kilns reach **vitrified dark-clinker temperatures** without mineral coal (`DESIGN.md`).
- **Climate- & Lore-Legal Crop Basket (`CROPS.at({warmth:'subtropic', atm:'dense', arid:'humid', wet:true})` filtered by `TRADE-SCOPE.md` home locks):**
  - **Irrigated *hanḍu* & paddy staples:** `rice`, `wild-rice` (`bamboo-rice` in wet pockets), `emmer`, `helix-bean` (plus `nwlowlands` `basin-amaranth`, `tepary-bean`, `taro`), `sweet-potato`, **`lotus-root`** (grown in temple/estate lotus tanks), `murnong`, `ashroot`. *(Surplus grain distills to `whiskey`/grain-arrack; `sugar-cane`/`rum`, `cacao`, `kava`, `clove`, `lotus-silk`, and `coffee` are excluded as commercial crops per `TRADE-SCOPE.md`.)*
  - **Textiles, paper & cordage:** **`cotton`** (signature export sash/muslin fibre), `flax`, `mulberry` (`ramie`), `rope-puff`, **`mat-reed`** & **`bamboo`** (almanac slips, scaffolding, mats), `willow`.
  - **Orchards, oilseeds, spices & stimulants:** `ironplum` (native), `citron`, `pomegranate`, `persimmon`, `apricot`, `fig`, `pitaya`, `canyon-grape`, `carob`, **`bodhi-fig`** (sacred courtyard shade tree), `measuremelon`, `lantern-fruit`; **`whorl-olive`** & `avocado` (lamp/table oil); `tamarisk-manna` (sweetener); upland bench `tea`; **`saffron`** (day-keeper robe dye & temple spice), `umbel-seed`, `juniper`, `camphor`, `tobacco`, `rimdew`.
  - **Full 7-colour `CROPS.palette`:** `indigo` / `woad` (blue), `saffron` (orange), `wineweed` / `paintbrush` (red), `ghost-gum` (yellow), `purple-fan` (purple), `lichen` (brown) — backing the bright festival dress and dyed cotton trade of the capital.

### 1.5 Palaeoflood Rhythmite Geology, Clay, Gypsum & Mineral Deficits (`geology.json`)

`lodes.json` has `0` hand-authored lodes within `120 km`; all mineral availability comes from the 39-family `geology.json` rasters and procedural `kits/resources` lode sampling — and **every geological number confirms `DESIGN.md` and `LORE.md` §6.14**:

- **Why Red & Yellow Brick Exists Here (`palaeolakes.json` + `floods.json` + `clay`):** Just `80 km` north of Jimjam at `(748.6, 506.3)`, the **`west dam breach`** (`floods.json` order `2`, draining the `48,260 km²` / `20,711 km³` and `62,763 km²` / `43,870 km³` northern palaeolakes) discharged into the Great Trough basin (`floodzone` polygon `rmvflvh2enyr6`). Those slackwater megaflood sheets deposited alternating **iron-rich red silt** and **calcareous yellow marl** rhythmite beds right across Jimjam's bench:
  - **`clay = 230`** at `(745, 546)` (rising toward `255` on the floodzone flats) — inexhaustible brickearth firing to warm terracotta red (`#B85338`) and buff-ochre yellow (`#D4A856`), plus over-fired vitrified dark headers (`#3A2C27`).
  - **`gypsum = 94`** at the pin, **`108` at `2 km` east `(746, 546)`**, peaking at **`127` (`58` lode nodes within `30 km`, `GoodY = 24.0`, `AllY = 50.5`)** — supplying local lime-gypsum mortar, gesso, and ochre-tinted exterior plaster for poor courtyard houses.
  - **`alabaster = 101–102`** within `13.4–34.0 km` (`10` lode nodes within `30 km`, first `≥ 100` at `(742, 552)` `13.4 km` SSW and quarried in bulk at **`Veḷḷai-kal`** *"White-Stone"*, `(728, 546)`, `34 km` W) — used for translucent window *jalis*, interior lamps, and local relief panels where true marble is too costly.
  - **`emerald = 130`** (`12` lode nodes within `30 km`, `GoodY = 13.0`, `AllY = 25.5`, peaking `18 km` E on the eastern bench `(754, 545)`) — green beryl cabochons and optical/sighting crystals prized by the *kaunṭavan* astronomers and Raja's court jewellers!
  - **`iron = 180`** (`26` lode nodes within `30 km`, `GoodY = 3.0`, `AllY = 23.5`, first `≥ 100` `28.1 km` S at `(744, 560)` near `Tāmarai-āṟu`) — bog/bench iron sufficient for nails, tyres, hinges, and farm tools, though outclassed by Free-Clan steel.
  - **`stone = 60`** at the pin (`max 243` on rocky hills `20–30 km` SE); **`wood = 255`** and **`water = 255`** (dense monsoon timber fuel for brick and glass kilns).
- **Geological Zeroes That Drive Trade (`DESIGN.md` & `PROPOSAL-ARDENT-JIMJAM.md`):**
  - **`marble = 0`** at `(745, 546)` and **`0` across the entire `50 km` radius** (nearest `≥ 100` is `160 km` S on the Cut floor `(720, 622)` toward `Dilihan`). Every white marble arch voussoir, cornice, column shaft, and temple sill in `JJ.def` is **visibly imported wealth**, never structural wall mass!
  - **`silica = 0`** within `50 km` (nearest `117 km` S in the Cut near `Kotgeta`, or barged `276 km` ENE across Great Trough Lake from **`Barada-Quay`** `(620, 604)` in `JJ2`, fluxed with **`Serai`** soda ash to blow the famous **Raja's Eye** lenses and stained temple glass).
  - **`copper` (`max 10` in `30 km`) & `tin = 0`:** Hauled `137 km` SSW down the lakeshore from Jimjam's own northern skarn mine **`Cempu-malai`** (`(766, 486)`, `copper = 200`) and bought as finished bronze/brass stock from **`Ardent` / `Kopparberg`** (`107–176 km` E) for astrolabes, armillary rings, bells, and dome finials.
  - **`coal` (`GoodY = 0.0`, `max 62`):** Zero usable coal; all brick, ceramic, and glass furnaces burn local `wood = 255` + rice-husk/cotton-stalk biomass in `1.51 atm` forced-draft updraft kilns.

### 1.6 Neighbouring Pins & Overland / Lake Routes on the 5.1 Canvas

| Destination | Polity / Province | 5.1 Pixel `(px, py)` | Elev (`m`) | Chord (`km`) | 5.1 Road / Barge (`km`) | Mean / P95 Grade | Trade Role with Jimjam |
|---|---|---|---|---|---|---|---|
| **`Veḷḷai-kal`** | Jimjam (`JJ1`) | `(728, 546)` | `+459` | `34.0` W | `52.3` road / **`36` barge** | `1.8%` / `4.5%` | Alabaster quarries & lakeside lime kilns |
| **`Tāmarai-kuppam`** | Jimjam (`JJ1`) | `(740, 577)` | `+759` | `62.8` S | `67.0` road | `1.3%` / `3.0%` | Irrigated *hanḍu* granary town on upper `Tāmarai-āṟu` |
| **`North Cut Sill`** | Jimjam / Cut border | `(733, 592)` | `+860` | `95.1` SSW | `101.0` road | `1.1%` / `2.6%` | Gentle `2.6%` saddle into the North Cut corridor |
| **`Kotgeta`** | Izani Cut | `(722, 600)` | `+326` | `117.4` SSW | `123.0` road | `1.6%` / `4.1%` | Nearest Cut market town & silica sand source |
| **`Cempu-malai`** | Jimjam (`JJ1`) | `(766, 486)` | `+1,060` | `127.1` NNE | `137.3` road | `1.4%` / `3.1%` | Royal copper skarn (`copper = 200`) for brass dials & finials |
| **`Skywatch`** | Independent / Guild-hosted | `(825, 564)` | `+2,605` | `164.0` ESE | `178.4` mule | `3.2%` / `8.4%` | High-altitude rival/partner observatory (`+2,119 m` higher); lens & ephemeris exchange |
| **`Ardent`** | Free Clans (`FC2`) | `(829, 531)` | `+1,843` | `170.7` E | `176.2` wagon | `2.6%` / `6.1%` | Bronze/brass ingots (`Kopparberg` `107 km` E), steel tools, wool; buys grain, brick, almanacs |
| **`Serai`** | Cut Salt Pan | `(728, 650)` | `-1,422` | `210.4` S | `218.0` Cut road | `2.1%` / `5.2%` | Soda ash (`natron`), borax & salt (`halite`) for glassmaking & curing |
| **`Dilihan`** | Cut / Dilihan | `(711, 658)` | `-1,389` | `234.1` SSW | `243.0` Cut road | `1.9%` / `4.8%` | Southern architectural twin; Cut marble, caravans, desert goods, southern almanacs |
| **`Barada-Quay`** | Jimjam (`JJ2`) | `(620, 604)` | `+450` | `275.6` WSW | **`~295` lake barge** | `0.0%` water | Western lakeshore province (`JJ2`): `silica = 213` glass-sand barges |
| **`Palewharf`** | Eternal State (`ES3`) | `(565, 604)` | `+454` | `378.2` WSW | **`425.3` lake barge** | `0.0%` water | Western head of Great Trough Lake: porcelain, lacquer, silk, silver |
| **`Roketstad`** | Iron Republic (`IR`) | `(715, 748)` | `+2,487` | `408.4` S | `434.0` Cut+pass | `2.4%` / `6.8%` | Precision clockwork, Guild optical blanks, astronomy minder |

### 1.7 Summer-Solstice Sunset Azimuth & `360°` Terrain Horizon Profile

`LORE.md` §6.14 & §12 and `src/74-jj-sacred.js` (`JJ.solsticeCheck`) specify that the **Great Temple of the Sun** (`jj_temple_sun`) frames the **southern-hemisphere summer-solstice sunset (`day = 350`, `OBL = 23.0°`)** through its monumental west-southwest arch (`archR = 4.5 m`, `archSpring = 12.0 m` above the `PH = 6.0 m` platform; observer eye at `+13.7 m` above temple base = **`+499.9 m`** at pin elevation `+486.2 m`).

Sampling `0.5–120 km` rays every `1°` around `(745, 546)` on `h.png` + `wl.png` yields a **crucial terrain-grounding result**:

| Celestial Sightline | Azimuth (`0°=N, 90°=E`) | Controlling Terrain Feature (`0.5–120 km`) | Curved-Planet Horizon Angle | Flat Three.js Horizon Angle (`≤ 80 km`) | Clearance at Target Celestial Altitude |
|---|---|---|---|---|---|
| **Summer Solstice Sunset (`LAT = -40.0° S`, current `KratorSky`, `Sun Alt = +3.00°`, `19:05`)** | **`242.17°` (WSW)**<br>*(geometric `Alt 0°` at `239.33°`, `19:23`)* | **WSW peninsula headland crest** at **`4.50 km`** (`px 743.0, 547.1`, `E = +574.5 m`); behind it `12.5–22 km` lake arm (`+430 m`, hidden from `+486 m` pin) and **`80–105 km` Western Cut / Republic flank** (`E = +2,026..+2,880 m`) | **`+0.93°`** *(at `4.5 km` headland; `80 km` ridge is `+0.81°` curved)* | **`+1.16°`** *(at `80 km` ridge; `4.5 km` headland is `+0.95°` flat)* | **Clears terrain by `+2.07°` curved (`+1.84°` flat)!** Sun disc sits cleanly inside the `12.0–16.5 m` upper arch aperture (`+0.3°..+14.0°`). |
| **Summer Solstice Sunset (`LAT = -34.34° S`, true 5.1 pin latitude, `Sun Alt = +3.00°`, `18:51`)** | **`244.02°` (WSW)**<br>*(geometric `Alt 0°` at `241.76°`, `19:07`)* | Same **WSW peninsula shoulder** at **`4.50 km`** (`px 743.0, 547.0`, `E = +571.1 m`), dropping to lake arm (`12.5–22 km`) and **`80–105 km` Western Cut / Republic peak** (`+2,044..+2,880 m`) | **`+0.89°`** *(at `4.5 km` headland; `80 km` ridge is `+0.84°` curved)* | **`+1.18°`** *(at `80 km` ridge; `4.5 km` headland is `+0.91°` flat)* | **Clears terrain by `+2.11°` curved (`+1.82°` flat)!** Temple yaw shifts only `1.85°` clockwise (`ry = -1.0851` → `-1.1174 rad`). |
| **Equinox Sunset (`day = 80 / 260`, due West)** | **`270.00°` (W)** | Low peninsula nose at `6.0 km` (`+524.1 m`), then **`227 km` of open lake** | **`+0.20°`** | **`+0.22°`** | Essentially sea-flat (`+0.2°`); lake glitters beyond the headland nose. |
| **Winter Solstice Sunset (`day = 170`) & Northern `Veil` Elongation (`+50°` from solstice)** | **`294°–299°` (WNW)** | **Unbroken open water of Great Trough Lake** from **`2.0 km` to `214–377 km`** (`+429.78 m`, `-70 m` below temple eye!), backed by `+3,449 m` NW peaks at `214 km` | **`-0.25°` water** / **`-0.05°` distant peak** | **`-0.05°` water** | **Pure water-horizon sunset** straight across `370 km` of Great Trough Lake! |
| **Southern `Veil` Elongation (`-50°` from summer solstice, `LORE.md` §6.14)** | **`192°–194°` (SSW)** | Southern bench (`6–8 km`, `+619 m`) & `Mēkam-ōṭai` / SE Cut flank (`57 km`, `+2,727 m`) | **`+2.01°`** *(at `57 km` peak)* | **`+2.26°`** | Clears the `+2.0°` SSW mountain silhouette whenever `Veil` stands `≥ +4°` at dusk. |
| **Ringed Gas Giant & `Companion` Dial (`KratorSky` fixed anchor)** | **`66.00°` (ENE)** at **`Alt +25.0°`** (`30°` diameter disc) | Gently rising eastern monsoon bench (`8.5–9.2 km`, `E = +701..+712 m`) | **`+1.30°`** | **`+1.34°`** | Lower limb of the `30°` Giant (`Alt +10°`) hangs **`+8.7°` clear** above the green eastern hills (`+23.7°` to Giant center). |

**Architectural takeaway for §3.1:** Because the `4.5 km` WSW headland (`+571..+575 m`) subtends **`+0.89°..+0.93°`** along `Az 242°–244°`, seating the Sacred Solar Acropolis on the **`+512..+522 m` upper west-central crown** of `(745, 546)` (just `400–700 m` SSE of the pin center, where natural ground already reaches `+510..+520 m`) lowers that headland horizon to **`+0.48°`**, reveals a sliver of the distant southern lake arm (`13–22 km`) **and** the purple `100 km` Western Cut mountains framed beneath the `+3.00°` solstice sun disc, while simultaneously overlooking the NNW harbour cove (`Az 333°`) and the `370 km` open-lake vista (`Az 285°–345°`)!

---

## 2. Census, Social Structure & Economy (`PROPOSAL-ARDENT-JIMJAM.md`)

### 2.1 Kingdom & Capital Scale

Per `core/simulation/PROPOSAL-ARDENT-JIMJAM.md`, the **Kingdom of Jimjam** holds **`65,500` subjects** across two provinces (`JJ1` **Jimjam**, `41,000` on the fertile eastern head of Great Trough Lake; `JJ2` **West Trough Shore / Barada-Quay**, `24,500` along the drier western shore). The royal capital at `(745, 546)` houses **`22,000` townsfolk** (~`4,580` households at `4.8` persons/household, plus `~3,200` rural *hanḍu* smallholders and brick/quarry villagers in the immediate `6–12 km` lakeside ring).

### 2.2 Occupational & Social Breakdown of the `22,000` Capital

| Stratum / Guild | Pop. (est.) | Kit / Lot Footprint | Economic & Lore Function |
|---|---|---|---|
| **1. The Raja's Court, *Hanḍu* Assessors & Garrison** | `1,600` (`7.3%`) | `jj_palace`, `jj_palace_plaza`, `jj_court`, `jj_fortress`, `jj_barracks`, `jj_gatehouse`, `jj_guard_post` | Royal household, land-tax registry (measuring gridded *hanḍu* allotments by solar gnomon), Cut-road customs brokers, and pike/bow/matchlock watch guarding the Cut gate and harbour moles. |
| **2. The *Kaunṭavan* Day-Keepers, Almanac Scriptoria & Brass-Dial Makers** | `1,900` (`8.6%`) | `jj_temple_sun`, `jj_library`, `jj_school`, Almanac Press & Brass Instrument Courts, **Raja's Eye** Pavilion | Shaved-headed astronomer-priests divided among the **four rival schools** (*School of the Eye* empirical sighters, *School of the Hidden Hand* perturbation reckoners, *School of the Outside* rogue-body theorists, and the suppressed *Eighty-One* `81 × 421 = 34,101`-day cycle heresy), plus block-printers, palm-leaf/reed-paper scribes, emerald/glass lens grinders, and brass gnomon/astrolabe engravers (watched by the Iron Republic Astronomers' Guild minder). |
| **3. Brick, Ceramic, Gypsum/Alabaster & Glass Guilds** | `4,200` (`19.1%`) | Kiln & Glass Wards (`alleys`), `jj_smithy_a/b`, `jj_carpenter`, `jj_quarry`, imported-marble mason yards | Digging floodzone red-silt and yellow-marl `clay = 230` rhythmite pits; firing banded brick, glazed dome tiles, and terracotta pipes in `1.51 atm` biomass kilns; calcining `gypsum = 108` plaster; carving `Veḷḷai-kal` alabaster *jalis*; sawing imported Cut marble (`marble = 0` locally) into thin trim; blowing `Barada-Quay` silica + `Serai` soda-ash glass (`Raja's Eye` optical blanks, stained fanlights, almanac-ink phials). |
| **4. Lake Bargemen, Fishers & Boatwrights** | `3,100` (`14.1%`) | NNW Cove Quays, `jj_warehouse_a/b`, Boatyard, Drying Terraces, Fish Market (`jj_market_a/b`) | Crewing `25 t` shallow-draft lateen lake barges (`lbl = 77` to `Veḷḷai-kal`, `Barada-Quay`, and `Palewharf`), net-fishing the `61–400 m` freshwater basin, curing/smoking lake catch (`Serai` salt), and building carvel lake hulls from `wood = 255` monsoon timber. |
| **5. Caravan Factors, Textiles, Dye-Vats & Urban Trades** | `6,400` (`29.1%`) | `jj_caravanserai`, `jj_shop_a/b/c`, `jj_tavern_a/b`, `jj_bathhouse`, `jj_bakery`, `jj_house_mid_*` | Spinning, weaving, and indigo/saffron-dyeing *hanḍu* cotton muslins and sashes; pressing `whorl-olive` oil; distilling grain spirit; running stepped brick bathhouses; brokering Cut camel/mule trains (`Dilihan`, `Kotgeta`, `Serai`) and eastern mountain trains (`Ardent`, `Skywatch`). |
| **6. Urban Gardeners, Lotus-Tank Tenders, Brick-Porters & Labourers** | `4,800` (`21.8%`) | `jj_house_poor_a/b/c`, `jj_well`, `jj_fountain`, `jj_cistern`, peri-urban *hanḍu* plots (`jj_farm_field`, `jj_farmhouse_a/b`, `jj_granary`, `jj_windmill`) | Tending stepped lotus cisterns, carrying kiln wood and harbour cargo, working the inner irrigated *hanḍu* vegetable/citron/rice plots and headland windmills. |

### 2.3 Closing the Voth-Census Kit Gaps (`KNOWN_ISSUES.md`)

`settlements/jimjam/KNOWN_ISSUES.md` notes 15 Voth-census trade slugs not yet wrapped as distinct `JJ.def` ids (`tailor`, `weaver`, `dyer`, `potter`, `glassmaker`, `mason`, `chandler`, `butcher`, `fishmonger`, `miller`, `brewer`, `healer`, `inn`, `scribes`, `instrument_maker`). Rather than inventing new architectural idioms, stage `P1` adds compact `JJ.def` trade recipes in `src/77-jj-commercial.js` and `src/78-jj-civic.js` composed strictly from existing `JJ_MAT` banded brick, Tudoresque gable-end chimney stacks (kilns/dyehouses/glassworks), arcaded ground-floor shopfronts, and courtyard dye-vats/drying racks so `KCITY` step `8`–`11` trade placement resolves `100%` natively.

---

## 3. Multi-Zone Urban Layout on the 5.1 Ground

### 3.1 Site Envelope & Topographic Reading (`3.2 km × 2.8 km` Core + `6 km` *Hanḍu* Ring)

At 1:1 scale around `(745, 546)` (`x = -892,000 m, z = -2,046,000 m`), the terrain rises smoothly from the **`+429.78 m` NNW pocket cove** (`~1.4–2.0 km` NNW of pin center, where the `wl.png` shoreline crosses between `(745, 546)` and `(744..745, 545)`) across the **`+455..+495 m` central city bench** (`1.6°` / `28 m/km` mean slope) up to two framing rises:
- a **`+508..+522 m` west-central shoulder** (`500 m` WSW of pin center, leading out onto the WSW peninsula), and
- a **`+525..+545 m` south-eastern landward crest** where the `Tāmarai-kuppam` / North Cut and `Ardent` / `Skywatch` roads converge.

Jimjam uses this natural amphitheater-over-a-cove exactly as its lore and kit demand: **water and barges below to the NNW, walled banded-brick terraces stepping up the `56 m` rise, the Raja's Palace and Sunray Plaza holding the central datum, and the Great Temple of the Sun crowning the western shoulder with an unobstructed WSW solstice sightline.**

```
                      GREAT TROUGH LAKE  (+429.78 m, 28,704 km²)
         Open WNW Water Vista (Az 285°-340°)        NNW Sheltered Pocket Cove (2.7 m -> 61 m)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\      /~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                             \    /  [Zone 3: Brick Moles, 25t Barge Basin,
      WSW Headland Peninsula                  \__/    Fish Steps, Warehouses & Market Strand]
     (+510..+575 m, 4.5 km WSW)                 ||   (+430..+452 m)
        <-- Az 244.02° Solstice Ray ---   ======||==========================================
            (clears +0.89° crest         /  [Zone 1: Sacred Solar Acropolis (+512 m)]
             at +3.00° Sun Alt!)        |    jj_temple_sun (50x86m) + Veil ±50° Pylons
                                        |    Four Calendar Schools + Raja's Eye Pavilion
       [Zone 6: Headland Windmills      |
        & Irrigated Handu Terraces]     |   [Zone 2: Raja's Palace & Sunray Plaza (+496 m)]
                                        |    jj_palace + jj_palace_plaza (85m N-S axis,
                                        |    facing NNW lake & NE Gas Giant Az 66°)
                                        |
                                        |   [Zone 4: Walled Brick & Lotus-Tank Wards]
                                        |    - West/Upper Courts: Rich Lotus-Tank Mansions
                                        |    - Spine Avenues: Mid Chimney-Houses & Almanac Press
                                        |    - East/Leeward Alleys: Poor Ochre Courts,
                                        |      1.51-atm Brick/Ceramic Kilns & Glassworks
                                         \
                                          \===[Zone 5: South Cut Gate, Caravanserai (+530 m),
                                               Fortress Crest & Natural-Slope Amphitheater]==
                                                       ||                    \\
                                        To Tāmarai-āṟu (18.8 km SSW),         To Ardent (176 km E)
                                        North Cut Sill & Dilihan (243 km)     & Skywatch (178 km ESE)
```

### 3.2 Zone-by-Zone Specification

#### Zone 1 — Sacred Solar Acropolis & the Four Calendar Schools (`+508..+518 m`, West-Central Crown)
- **Placement & Orientation:** Seated on a `150 × 120 m` brick-retained terrace on the west-central crown (`~450 m` WSW of pin center, `E = +512 m` pad). Nothing to its WSW within the city walls rises above `+495 m`, guaranteeing a **zero-obstruction foreground** for `JJ.solsticeCheck()`.
- **Monumental Core:**
  - **`jj_temple_sun`** (`50 × 86 m`, `PH = 6 m` stepped red/yellow brick platform, `SH = 6 m` sanctuary podium, `39 m` ribbed dome with golden finial, west-southwest monumental arch `archR = 4.5 m`, `archSpring = 12 m`) rotated strictly to **`ry = -1.1174 rad` (`Az 244.02°`, `-34.34° S` day-350 `+3.00°` sun)** *(or parameterized dynamically from `KratorSky.sunDir(350, t_alt3)` so kit and world never drift)*.
  - **Veil `±50°` Elongation Sightline Markers (`LORE.md` §6.14):** Two subsidiary carved-alabaster & imported-marble gnomon pylons on the western terrace parapet aligned to **`Az 294.0°` (WNW, straight across `370 km` of open lake)** and **`Az 194.0°` (SSW, over the `Tāmarai-āṟu` / Cut peaks)**, marking the extreme northern and southern dusk/dawn excursions of `Veil` that drove the *kaunṭavan* perturbation crisis.
  - **New Fire Forecourt & Four School Cloisters:** East of the sanctuary sit the **New Fire** brass brazier court (where household hearths are relit after the five *Empty Days* `293`–`297` or the `34`-year intercalary week) and four distinct courtyard colleges (`jj_school`, `jj_library`) housing the *Eye*, *Hidden Hand*, and *Outside* schools plus a shuttered, half-defaced annex of the *Eighty-One* heresy.
  - **The Raja's Eye Observatory Pavilion:** Perched on the northern corner of the Acropolis parapet (`+518 m`) with simultaneous clear sightlines to the **ENE Gas Giant & `Companion` (`Az 66°`, `Alt +25°`, local hill horizon `+1.30°`)**, the **WSW solstice arch**, and the **WNW lake horizon** — the playable stage of the **Raja's Eye** optical/ephemeris quest (`LORE.md` §6.14).

#### Zone 2 — Raja's Palace, Great Sunray Plaza & Almanac Press (`+492..+502 m`, Central Bench)
- **Axial Pairing:** Uses `JJ.JJ_PAL_PLAZA_OFFSET = 85 m` (`src/75-jj-palace.js`) to lock **`jj_palace`** (`113 × 96 m`, `41 m` central dome, four corner chhatris, `4.5 m` podium) and **`jj_palace_plaza`** (`96 × 84 m` raised `4.5 m` deck paved in a `16`-ray red/yellow/dark-vitrified brick sunburst around a central marble astronomical obelisk/gnomon) into a single **`113 × 181 m` monumental complex**.
- **Orientation:** Aligned NNW–SSE (`Az 336°` toward the pocket-cove harbour below, perpendicular to the WSW solstice boulevard linking Zone 2 to Zone 1), so petitioners mounting the grand northern plaza stairs see the `41 m` Palace dome framed ahead and, turning back, look straight down the Harbour Processional Avenue onto Great Trough Lake.
- **Flanking Civic Courts (`KCITY` step `6`):** **`jj_court`** (*Hanḍu* Land-Tax & Weights Court), the Royal Almanac Block-Print & Brass-Instrument Manufactory, and the Iron Republic Astronomers' Guild legation house (`lit: true`).

#### Zone 3 — NNW Sheltered Cove Quays, Barge Basin & Market Strand (`+429.8..+452 m`)
- **Harbour Engineering:** Placed where the `+486 m` bench meets the sheltered `2.7 m`-deep embayment `(744..745, 545)` at **`+429.78 m`**. Two curved banded-brick and basalt-footing moles (`180 m` W mole sheltering against open-lake fetch, `110 m` E mole) enclose a **`220 × 140 m` dredged `3.5 m`-deep barge basin**.
- **Waterfront Program:**
  - **West Quay (Heavy Bulk):** Berths for `25 t` lateen lake barges unloading `Veḷḷai-kal` alabaster blocks, `Barada-Quay` (`JJ2`) white glass-sand (`silica`), and `Palewharf` Eternian porcelain/lacquer crates alongside `jj_warehouse_a/b` and masonry crane piers.
  - **Center Water-Gate & Ferry Steps:** Stepped red-brick *ghat* landings descending directly into `+429.78 m` water beneath a marble-trimmed **`jj_gatehouse`** (the **Lotus Water-Gate**), leading into the arcaded **Strand Bazaar** (`jj_market_a/b`, `jj_shop_a/b/c`, `jj_tavern_a/b`).
  - **East Slipway & Fish Quay:** Timber carvel boatyard (`wood = 255`), net-drying frames, `Serai`-salt fish-curing sheds, and reed-skiff slips.

#### Zone 4 — Walled Banded-Brick Residential, Lotus-Tank & Craft Wards (`+452..+520 m`, `core/city`)
Enclosed within a **`~7.4 km` circuit of modular `jj_wall_seg` (`12 m`), `jj_wall_tower`, `jj_wall_corner`, and `4` `jj_gatehouse` portals** (`KCITY` wall circuit), `core/city` steps `7`–`12` divide the intramural bench into three socially and micro-climatically distinct fabrics:
1. **Upper Western & Central Lotus-Court Wards (`frontage-courts`, Rich & Scholarly):** **`jj_house_rich_a/b/c`** (`lit: true`, marble window surrounds, courtyard fountains, rooftop chhatris) and senior *kaunṭavan* residences arranged around **three public stepped-brick lotus tanks (`kuḷam`, `36 × 36 m` to `54 × 40 m`)** shaded by `bodhi-fig` and `citron` trees, plus **`jj_bathhouse`** domes.
2. **Avenue Spines (`frontage-courts` / mixed frontage, Middle Artisans & Clerks):** **`jj_house_mid_a/b/c`** (`lit: true`, rhythmic banded-brick gables, Tudoresque clustered brick chimney stacks, ground-floor shop arcades) housing cotton weavers, indigo/saffron dyers, brass-dial engravers, scribes, and bakers (`jj_bakery`).
3. **Eastern & South-Eastern Leeward Craft & Kiln Wards (`alleys`, Poor & Industrial):** Placed **downwind of the lake breeze** along the eastern wall so smoke blows clear of the Solar Acropolis and Raja's Eye lenses! **`jj_house_poor_a/b/c`** (`lit: false`, gypsum-ochre plaster over rough brick, external brick stairs, flat roof terraces) intermixed with `1.51 atm` updraft **brick & glazed-tile beehive kilns**, **`Barada-Quay` glass-blowing furnaces** (using the kit's tall clustered brick chimneys), `gypsum` calcining pits, and bog-iron smithies (`jj_smithy_a/b`).

#### Zone 5 — South Cut Gate, Caravanserai, Crest Fortress & Slope Amphitheater (`+515..+542 m`)
- **Southern Landward Crest:** Where the **Cut Highway** (from `Tāmarai-kuppam` `67 km`, `North Cut Sill` `101 km`, `Kotgeta` `123 km`, `Dilihan` `243 km`) and the **Eastern Highland Road** (from `Ardent` `176 km` and `Skywatch` `178 km`) meet before entering the **Sun-Road Gate**:
  - **`jj_fortress`** (`65 × 65 m` moated/ditched brick citadel) and **`jj_barracks`** command the `+538 m` SE knoll overlooking both road approaches and the kiln suburb.
  - **`jj_caravanserai`** (`57 × 72 m` courtyard khan with ground-floor camel/mule arcades, marble-trimmed portal, and upper merchant galleries) plus an extramural wagon/pack-train customs paddock where Cut marble blocks, `Serai` soda-ash sacks, and Free-Clan bronze ingots are weighed against the Raja's solar standards.
  - **`jj_amphitheater`** (`80 × 61 m` oval tiered brick cavea with marble stage colonnade): Cut into the **natural `28 m/km` NNW-facing slope** just west of the Palace–Cut spine (`+518 m` upper rim stepping down to `+504 m` orchestra), so spectators seated on the brick tiers look north-northwest over the city's onion domes out across Great Trough Lake (`lbl = 77`) during New-Fire dramas and public calendar debates!

#### Zone 6 — Lakeside *Hanḍu* Allotments, Clay Pits & `KHAMLET` Ring (`+431..+530 m`, `1.5–6.0 km` Belt)
- **Gridded *Hanḍu* ("Hands of Land"):** Outside the walls across the gentle `≤ 25 m/km` eastern and SSW benches, land is surveyed in rectilinear solar-aligned *hanḍu* parcels (`jj_farm_field` irrigated `rice`, `cotton`, `indigo`, `saffron`, `lotus-root`, and `emmer` strips bordered by `citron`/`ironplum`/`whorl-olive` bunds, `jj_farmhouse_a/b`, `jj_granary`).
- **WSW Peninsula Windmills:** `4`–`6` **`jj_windmill`** brick towers crest the breezy `+515..+535 m` WSW headland ridge (`1.8–3.0 km` W of the wall, carefully kept **north** of the `Az 240°–246°` solstice arch corridor so no sail ever crosses the solstice sun disc!).
- **Satellite `KHAMLET` Villages (`2`–`3` on the map slice):**
  1. **Rhythmite Brick-Earth & Marl Pit Hamlet (`2.2 km` ESE, `+495 m`):** Open stepped red-silt and yellow-marl clay cuts, pugging mills, drying hacks, and clamp kilns (`clay = 230`, `gypsum = 108`).
  2. **South Peninsula Neck *Hanḍu* Village (`3.5 km` SSW toward `Tāmarai-āṟu`, `+455 m`):** Irrigated paddy, cotton ginning, and lotus ponds along the Cut road.

### 3.3 Minimal 1:1 Terrain & Water Deltas (`WORLD.landHook` / `KCOAST` / `41t`)

Because `(745, 546)` already sits on a `27.9 m/km` (`1.60°`) bench `+56.5 m` above `+429.78 m` lake water, **no heavy terraforming is required**. Only five small, localized 1:1 deltas are registered in `site/jimjam-site.json`:

1. **NNW Barge Basin & Quay Shelf (`KCOAST` + `WORLD.landHook`):** Smooths the coarse `2 km` heightfield transition between `(745, 546)` (`+486.2 m`) and `(744..745, 545)` (`+427.1 m` bed under `+429.78 m` lake) into a clean `+432.0 m` masonry quay apron above a **`+426.3 m` (`3.5 m` deep) harbour basin** (`220 × 140 m`), keeping sign-safe shore masks on `KCOAST`.
2. **Solar Acropolis Terrace Pad (`levelPad`, `150 × 120 m` at `+512.0 m`):** Levels the `jj_temple_sun` platform base (`50 × 86 m`) and Four-Schools forecourt with banded-brick retaining batters (`≤ 4.5 m` cut/fill).
3. **Palace + Sunray Plaza Axial Pad (`levelPad`, `125 × 195 m` at `+496.0 m`):** Ensures `jj_palace` and `jj_palace_plaza` (`JJ_PAL_PLAZA_OFFSET = 85 m`) share an exact datum so their `4.5 m` podium decks meet flush with zero step gap.
4. **Amphitheater Cavea Bowl (`ellipseBowl`, `84 × 65 m`, `-6.5 m` concave cut into the `+518..+506 m` NNW slope):** Seats `jj_amphitheater` into the hillside rather than perching a `15 m` freestanding drum on sloped turf.
5. **Stepped Lotus Tanks & Bench Feeder Rill (`41t-world-townwater.js`):** Three rectangular `-3.5 m` water basins (`+0.5 m` below surrounding court grade, calm `core/water` plane) fed by a narrow brick-lined monsoon canal tracing down from the `+560 m` eastern `Cfa`/`Af` bench through the East Water-Sluice into the NNW cove.

---

## 4. Staged Order of Work, Verification & Open Questions

### 4.1 Staged Build Plan (`P0`–`P5`)

| Stage | Scope | Key Deliverables & Checks |
|---|---|---|
| **`P0` — Target Split & 1:1 Site Ground** | Split `build.py` into `--kit` (`dist/jimjam-kit.html`), `--site` (`dist/jimjam-site.html`), and default city (`dist/jimjam.html`) importing `tools/build_sources.py` (`report()`). Extract/stream the 1:1 `WORLD.Hland` ground at `(745, 546)` (`x = -892,000, z = -2,046,000`), lake plane `+429.78 m`, `KCOAST` NNW cove, and `site/jimjam-site.json` pads/roads/walls. | `dist/jimjam-kit.html` byte-verified; `python3 tools/check_core_use.py` passes; lake cove, WSW headland, and NE Giant horizon render cleanly. |
| **`P1` — Solstice Sky Alignment & Kit Trade Completion** | Parameterize `KratorSky` latitude to **`-34.34° S`** (with optional override so kit tests stay reproducible), add Veil `±50°` (`Az 294°` / `Az 194°`) sightline pylons & Raja's Eye observatory pavilion, and add the 15 compact Voth-census trade defs (`KNOWN_ISSUES.md`) in `src/77`–`78` + `JJ_LOD_SPECS` coverage. | All `JJ.def` records pass socket/door/footprint lints; `JJ.solsticeCheck()` passes at `-34.34° S` (`Az 244.02°`, `Alt +3.00°`). |
| **`P2` — Monumental Anchors & Harbour (`KCITY` Steps `0`–`6`)** | Place Zone 1 (`jj_temple_sun` + Four Schools + Raja's Eye), Zone 2 (`jj_palace` + `jj_palace_plaza` on `85 m` axis + `jj_court`), Zone 3 (NNW brick moles, `25 t` lake barges, `jj_warehouse_*`, Water-Gate), Zone 5 (`jj_fortress`, `jj_caravanserai`, hillside-cut `jj_amphitheater`), and the `jj_wall_*` circuit. | Zero foundation float (`max skirt ≤ 2.5 m`), zero monument overlap in `KSPACE`, flush Palace–Plaza podium seam, dry quay decks at `+432.0 m` (`+2.2 m` freeboard). |
| **`P3` — Intramural Wards, Lotus Tanks & *Hanḍu* Ring (`KCITY` Steps `7`–`12` + `KHAMLET`)** | Run `KCITY` (`frontage-courts` upper lotus-tank wards, avenue mid chimney-houses, leeward eastern `alleys` kiln/glass/poor wards, `KCONS` active construction plots), step-tank water planes, `CROPS.at` *hanḍu* irrigated fields, headland `jj_windmill` row, and `2`–`3` `KHAMLET.village` brick/paddy hamlets. | Target `~1,800–2,400` buildings + *hanḍu* estates representing `22,000` townsfolk within `check_budgets.py` page/draw-call caps; `100%` `KRAND` + `KMASK` + `KTAGS` (`culture: 'jimjam'`). |
| **`P4` — Interiors, Citizens, Sim & Quest Stage** | Wire `KFURN` (`indexed: true`) + `ROOM()` interiors for Sun Temple, Palace Hall, Almanac College, Raja's Eye Pavilion, Caravanserai, and 3 house tiers; spawn `core/charactermodels` crowds (*kaunṭavan* day-keepers, townsfolk, Cut caravanners, Republican minder) on `core/sched`; bind `JJ1` in `core/simulation`. | `test-sim.js` and Voth stocks baseline remain green; interior cutaway & door navigation verified. |
| **`P5` — `verify.py --assert`, Perf Views & Godot Export** | Full `tools/harness.py` verification suite, `arc`-lane timing budget check, `core/export` Godot check, `tools/test_all.py`, and `port_baseline.py` update. | `verify.py --assert` green (`0` console/page errors, all custom site/solstice asserts pass); `tools/test_all.py` green. |

### 4.2 Required `verify.py --assert` Views & Geometric Assertions

`settlements/jimjam/verify.py` (built strictly on `tools/harness.py`, never a pasted launcher) will capture and assert eight canonical views:

1. **`overview_n_lake`** — High oblique from over the NNW pocket cove (`+620 m` eye looking SSE) framing the brick harbour moles, `56 m` terraced city rise, Palace + Sunray Plaza, Solar Acropolis on the western crown, and Cut mountains behind.
2. **`solstice_arch_sunset` (Hard Geometric & Raycast Assert)** — Camera at the `jj_temple_sun` sanctuary threshold (`obsZ = -8.5 m`, `+13.7 m` above platform base) at **`day = 350`, `Sun Alt = +3.00°`** (`18:51` at `-34.34° S` / `Az 244.02°`):
   - **Assert 1 (`JJ.solsticeCheck`):** Lateral offset `< 0.25 m` inside `archR = 4.5 m`; sun center height `12.5–15.5 m` inside the `12.0–16.5 m` upper arch opening.
   - **Assert 2 (1:1 Terrain & City Clearance Raycast):** A `THREE.Raycaster` shot from the sanctuary eye along `KratorSky.sunDir` to `80 km` hits **zero** city roofs, walls, windmills, or WSW headland terrain (`+0.89°` headland crest lies `≥ 1.8°` below the `+3.00°` ray!).
3. **`palace_sunray_plaza`** — Looking NNW from the Palace podium down the `16`-ray brick Sunray Plaza, Harbour Processional Avenue, and Great Trough Lake, with the `30°` ringed Gas Giant (`Az 66°`, `Alt +25°`) visible to the right on the east-facing turn.
4. **`rajas_eye_observatory`** — From the Raja's Eye Pavilion (`+518 m`) framing both the ENE Gas Giant + `Companion` dial (`+23.7°` above the eastern bench) and the WNW `370 km` open-lake Veil sightline (`Az 294°`).
5. **`nnw_cove_quays`** — Water-level view (`+434 m`) at the Lotus Water-Gate and `25 t` barge basin; asserts quay deck freeboard (`+1.8..+3.0 m` above `+429.78 m`) and zero submerged land buildings.
6. **`lotus_tank_ward`** — Street/court view in Zone 4 showing banded red/yellow brick mansions (`lit: true`), marble *jali*/trim accents, stepped brick lotus tank water plane, and `bodhi-fig` shade.
7. **`kiln_and_cut_gate`** — Southern/eastern view across the `1.51 atm` beehive brick/glass kiln chimneys, `jj_caravanserai` customs yard, `jj_fortress`, and hillside-cut `jj_amphitheater` looking NNW over the lake.
8. **`handu_headland`** — Extramural view across gridded irrigated `rice`/`cotton`/`indigo` *hanḍu* fields and WSW headland `jj_windmill` towers above Great Trough Lake.

### 4.3 Open Questions for the Owner

1. **Fixing `KratorSky` Latitude to `-34.34° S` vs Keeping `-40.0° S` (`LORE.md` §12):** At Jimjam's true 5.1 pixel `(745, 546)`, latitude is **`-34.34° S`**, shifting the `+3.00°` day-350 solstice sunset `1.85°` clockwise from `Az 242.17°` (`19:05`) to **`Az 244.02°` (`18:51`)** — and both clear the `+0.89°..+0.93°` WSW headland by `> 1.8°`. Should `core/world/80-world-sky.js` (`KratorSky`) compute latitude directly from the site's 5.1 `py` (`-34.34° S` at Jimjam, resolving `LORE.md` §12 cleanly while keeping `-40° S` as fallback on unpinned kit sheets), and should we place the two subsidiary `±50°` `Veil` elongation sightline pylons (`Az 294°` lakeward, `Az 194°` Cut-ward) on the Acropolis forecourt?
2. **Lotus-Tank Feeder Canal (`41t`):** Since `Tāmarai-āṟu` (`115.5 m³/s`) mouths `18.8 km` SSW across the southern bay and no `rivers.json` trunk crosses `(745, 546)`, should we bring a modest brick-lined monsoon bench canal (`41t-world-townwater.js`, `3–4 m` wide) in from the wet eastern `Cfa`/`Af` slope (`1,372–1,459 mm/yr`) to feed the city's stepped lotus tanks and cascade down beside the Harbour Avenue into the NNW cove?
3. **Openworld Region Cut Boundary:** When Jimjam is mounted in `openworld/<region>`, should it start as a standalone `32 × 32 km` lakeshore-and-`Tāmarai-āṟu` slice (`openworld/jimjam`, covering `(745, 546)`, the NNW cove, the WSW headland, `Veḷḷai-kal` alabaster coast, and the `Tāmarai-āṟu` mouth), or be bundled into a broader **North Cut / East Trough** corridor slice linking `Jimjam` → `North Cut Sill` → `Kotgeta`?
4. **Inland `25 t` Lake Barge Vessel Source:** Should Great Trough Lake (`lbl = 77`) harbor traffic borrow a shallow-draft lateen hull from `kits/ringsea` (re-dressed in Jamṭōkku saffron/indigo cotton sails and timber trim), or get a dedicated `jj_lake_barge` asset in `src/77-jj-commercial.js` shared between `Jimjam`, `Barada-Quay`, and `Palewharf`?
5. **Catalog Furniture Culture (`jimjam`):** Until a full `kits/catalog` `jimjam` furniture file is authored, should openable interiors pair the `9` native `JJFURN` pieces (`src/84-jj-furniture.js`: gnomons, low divans, brass lamps, scroll racks) with `xanadu` / `yuni` low-cushion & timber pieces via `KFURN`?
