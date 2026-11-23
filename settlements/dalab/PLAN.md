# Dalab — Scale Model 5.1 Capital City Plan & `core/city` + `core/world` Port Blueprint

**Dalab** (`seed05` in [`60-settlements.js`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/model/src/60-settlements.js), live 5.1 pixel **`477, 1108`**, world `(954,000 m, 2,216,000 m)`, `+7.5 m` elevation on the delta of **`r106 Wind Bruk`** / *Dalab Bruk* into the **`-9.2 m` Great SW Lake**) is the sacred biomedical, ceremonial, and administrative capital of the **Realm of Dalab**.

Following the owner's regional demographic ruling — *"I think Dalab's pop should be bigger, they should have a spread out decentralized pop in the countryside with a few more small and medium size settlements and a large hamlet network"* — **Greater Dalab** holds **`320,000` headcount (`310,351` `cal-eq`)** across `ND1–ND5` and `SD1–SD3` ([`DALAB-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/core/region/DALAB-SCOPE.md)), while **Capital Dalab** itself is intentionally a **moderate `24,500`-soul (`24,821` `cal-eq`) temple-laboratory and canal city** (`7.66%` of the realm), ringed by the dense `78,000`-soul **`Dadem-Ring` (`ND1`)** mound-and-chinampa countryside (`8` bailiwick market towns + `84` `KHAMLET` villages).

---

## Why the Redo (Replacing the September/October Flat-Ground Build)

Today's [`settlements/dalab/dist/dalab.html`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/README.md) ([`84-city-geo.js`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/targets/city/84-city-geo.js) through `95-city-life.js`) was built before Scale Model 5.1, `core/world`, `core/city`, `core/hamlet`, `kits/crops`, and the `320,000`-pop decentralized Dalab census existed. Rebuilding `dalab.html` and `dalab-site.html` retires every single architectural and technical debt item in [`KNOWN_ISSUES.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/KNOWN_ISSUES.md):

| Legacy Debt in `targets/city/84..95` | 5.1 Redo Resolution in This Plan |
|---|---|
| **Invented flat `2.2 m` `WORLD: 4400` plane** (`84-city-geo.js`) with fake procedural rivers (`RIVER_MAIN`, `RIVER_BRANCH`) and no lake shore | Grounded on **Scale Model 5.1 `WORLD.Hland`** at `seed05` (`477, 1108`, `+7.5 m`), rotated **`+45°` NE** toward the sheltered `-9.2 m` lake embayment, with `landHook` grading the `Wind Bruk` distributary delta, raised chinampa polders, and ceremonial earthen mounds |
| **Bespoke layout & placement** (`87-city-layout.js`, `88-city-place.js`) bypassing `core/city` and `core/space` | Full **`core/city` (`KCITY`)** port: radial-ring-and-causeway districts around 5 neighborhood ceremonial mounds + rectilinear/sinuous chinampa canal wards, all indexed in `KSPACE` and `core/tags` before drawing |
| **875 buildings across 1 main + 6 miniature `r = 170 m` satellite mounds** (`Ashfold`, `Greenmarch`, `Reedholm`, `Oakhaven`, `Cornwell`, `Stonebrook`) crammed `1.25–1.55 km` from the dome | Those 6 names are now full **`2,000–2,600`-pop `ND1` bailiwick market towns `18–45 km` out** (`Asfol`, `Grinmach`, `Riidom`, `Okeben`, `Konwel`, `Tonbruk` — [`BUILD-OUT.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/BUILD-OUT.md) §1b). Capital Dalab (`24,500` pop, ~`2,350` urban lots + chinampa farmsteads) fills its own `4.2 × 3.8 km` delta shelf, while outer `ND1` bailiwicks spawn via **`core/hamlet` (`KHAMLET`)** |
| **12 missing Voth-census trades** in [`77-dalab-trades.js`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/src/77-dalab-trades.js) + 5 `na` rows (`river bargemen`, `dockers`, `customs`, `chinampa growers`, `envoys`) excused by "no river barges, no lake" | All **12 missing `DALAB_TRADES` buildings** (`bakery`, `butcher`, `brewery`, `tannery`, `boatyard`, `guildhall`, `ossuary`, `fishdock`, `minehead`, `quarry`, `dairy`, `livestock_yard`) + river quay/customs/chinampa farmstead (`15` pieces in §2.4; **Xanadu's permanent embassy compound stands at `Nulab` in pure `kits/xanadu` style, not at capital `Dalab`**) |
| **Kit copy drift & `vpArchGeo` porch doorway bar bug** (`63-anc-dalab.js`, `75-port-embassy.js`, `76-port-chapterhouse.js`) | Re-synced against `kits/ancients`, `kits/iziz-vernacular`, and `kits/highlands`; `vpArchGeo` doorway threshold strip suppressed on arched embassy porches; `settlements/dalab/dalab_kit.py` exported so `Span`, `Ledge`, `Nulab`, `Dayshun`, `Shelf`, and `dalab-town` read one source |
| **`swlowlands/glossy` `instance-cap` failure (`282,687 > 250,000`)** | `BIO` scatter mask excludes paved mound plazas, chinampa beds, and lake water (`KMASK`), plus `swlowlands/glossy` crown-cluster thinning brings glossy foliage instances under **`165,000`** with zero `capWhy` waiver needed |
| **No `SIM` hookup & placeholder crowd spheres** | Wired to **`core/simulation`** (`SIM`, [`DALAB-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/core/region/DALAB-SCOPE.md) §5) and **`core/charactermodels`** (`dalabites` green-undertone citizens + `mpfb_giant` 2-armed Patrol Giants and 4-armed Temple Giants) |

> **Coordinate Verification Note (`477, 1108` vs `499, 1108` & `464, 1112`):**
> Direct inspection of [`tools/scale-model/model/src/60-settlements.js`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/model/src/60-settlements.js) and [`h.png`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/model/data/h.png) / [`wl.png`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/model/data/wl.png) confirms:
> - **`seed05` `Dalab` is at `(477, 1108)`** (`gx = 954,000 m, gz = 2,216,000 m`, `+7.5 m`, `water = false`), carrying the owner's 2026-11-11 move note: *"Moved 2026-11-11 (the owner) from 464,1112 (hill country 280 m over its river) 27 km ENE to the Wind Bruk's delta into the -9 m lake, +7 m; the page's flat plain wants a small map edit (293 m of relief within 4 km); the frame turns about +45 degrees."*
> - Pixel `(499, 1108)` (`44 km` east) lies in deep open water (`elev = -245.0 m`, `water = true`, `wlev = -9.2 m`) inside the `38,480 km²` Great SW Lake (`px 468..683, py 1067..1166`).
> - Pixel `(464, 1112)` is the retired 5.0 hill pin (`+606.4 m`), near where the `ND1` bench town `Asfol` (`464, 1119`, `+334 m`) now sits.
> All coordinates in this plan anchor on live `seed05` **`(477, 1108)`**.

---

## 0. Core Adoption & Build Architecture

Every build rule in [`README.md`](file:///home/antigravity/traviso761-debug/krator-master/README.md) (*CORE MODULES ARE NOT OPTIONAL*) and [`AGENTS.md`](file:///home/antigravity/traviso761-debug/krator-master/AGENTS.md) applies. No custom PRNG, noise, `getImageData`, spatial hash, bespoke water shader, or inline sky dome is permitted.

### 0.1 Core Modules Table

| Module | Role in `settlements/dalab` |
|---|---|
| `core/rand` (`KRAND`) | Seeded cell draws `(world, cell, index, salt)` for lot jitter, chinampa crop strips, courtyard trees, Giant patrols, and barge moorings. Numeric defaults strictly `x == null ? d : x` |
| `core/noise` (`KNOISE`) | Earthen mound micro-terracing, compacted clay/ash road wear, and wet silt bank variation |
| `core/mask` (`KMASK`) | CPU raster masks (`KMASK.canvas` + `KMASK.distance`) for mound aprons, processional causeways, chinampa canals, `Wind Bruk` channels, and `swlowlands` flora exclusion. Zero `getImageData` |
| `core/space` (`KSPACE`) | Single 2D spatial index shared by `KCITY` lots, ceremonial mounds, Ancient Lab ring ruins, canal bridges, and `swlowlands` flora scatter |
| `core/tags` (`KTAGS`) | Every placed mound, temple, Lab wing, embassy, rowhouse, trade yard, bridge, chinampa plot, boat, Giant, and citizen registered before geometry is drawn |
| `core/world` (`WORLD`) | `WORLD.Hland(x, z)` from the `dalab-dadem-ring` 5.1 regional extract (`px 456..516, py 1060..1138`, `500 m/cell` Option C super-res) + `landHook` delta shelf, ceremonial mound profiles, and chinampa canal cuts |
| `core/drawn` (`KDRAWN`) | Authorable spline overrides for the Madrone/Live-Oak Processional Avenue, the 5 radial mound causeways, and primary `Wind Bruk` / chinampa canal trunks |
| `core/city` (`KCITY`) | District graph, radial-ring street loops round `dalab_mound` anchors, canal-front trade blocks, `minDoorH: 4.2` Giant clearance rules, lot subdivision, and `KCITY.constructMesh` under-construction plots |
| `core/hamlet` (`KHAMLET`) | Outer `ND1` *Dadem-Ring* countryside bailiwicks (`core/hamlet/22-hamlet-dalab.js`: mound-and-chinampa & river-levee villages) visible on `dalab-site.html` and `openworld/dalab-dadem-ring` |
| `core/water` (`KWATER` + `farbed`) | `Wind Bruk` (`43.7 m³/s`) north & south delta distributaries, `+0.5 m` stepped chinampa irrigation grid, and the `-9.2 m` Great SW Lake embayment |
| `core/coast` (`KCOAST`) | Natural reed-fen, clay-shingle levee, and sedimentary bluff shoreline shaping around the `-9.2 m` embayment and `Dapor` narrows |
| `core/atmos` (`KATMOS`) | Standard sky dome, sun, aerial perspective, and warm dense-air (`1.599 atm`) morning lake mist |
| `core/lod` (`KLOD`) | Tiered distance culling (`near` full detail -> `mid` simplified roofs/porches -> `far` merged mound + `KSHELL`/box impostors; `swlowlands/glossy` capped `< 165,000` instances) |
| `core/furnish` (`KFURN`) + `core/catalog` | Audited interior furnishing (`KF.batch({indexed: true})`) for the High Priest's Palace, Halls of Reformation, Embassies, Chapterhouse, rowhouses, and trade halls |
| `core/charactermodels` | `dalabites` (chloroplast green-undertone skin morphs, brown/red/teal linen-ramie dress) + `mpfb_giant` (`tools/giant.py` + `tools/mods.py` 2-armed Patrol Giants & 4-armed Temple Giants at `3.56 m`) |
| `core/simulation` (`SIM`) | Live regional stocks, `genecraft` output, `Wind Bruk` / Great SW Lake barge arrivals from `Dapor` (`17 km`), and Great Caravan staging to `Shelf` (`109 km`) |
| `core/host` (`KHOST`) | `FULL` (`dalab.html` / `dalab-site.html`) with inspector, hover, polygon tool, district/caste toggles, and `SIM` ledger overlay; `KEYS` (`dalab-set.html` kit sheet); `build_sources.report()` before first write |
| `biomes/swlowlands` (`BIO`) | Dense-air warm lowland flora: live oaks, red-barked madrones, bald cypresses, tupelos, tree ferns, cattails, sedges, and duckweed on `core/biome` |
| `kits/crops` (`CROPS`) | `CROPS.forBiome('swlowlands')` (`132` legal crops) + `CROPS.palette('swlowlands')` (`brown`, `red`, `teal`) driving chinampa strip geometry and dye vats |
| `kits/resources` (`KRES`) | `RES_GEO` clay, sedimentary freestone, silica, peat, and bench coal prospectivity nodes |
| `kits/construction` (`KCONS`) | Active earthen-ramming & timber-cribbed building sites on 3% of outer mound-ring lots |
| `tools/harness.py` | Shared GPU verify (`checks=harness.SURVEY`, `--assert`, zero custom browser launcher) |

### 0.2 Build Targets & Shared Kit Export (`dalab_kit.py`)

`settlements/dalab` produces three clean targets and exports a Python helper (`settlements/dalab/dalab_kit.py`, mirroring `kits/highlands/highlands.py` and `settlements/span/build.py`) so every Dalab settlement (`Span`, `Ledge`, `Nulab`, `Dayshun`, `Shelf`, and `settlements/dalab-town`) reads one canonical kit in place without file copies:

1. **`python3 tools/build.py settlements/dalab --kit` -> `dist/dalab-set.html`:** Component showcase (`68` kit pieces: `54` existing + `14` new trade/embassy/harbour pieces in §2.4), `KHOST` `KEYS` inspector, polygon/socket audit.
2. **`python3 tools/build.py settlements/dalab` -> `dist/dalab.html`:** The `6.4 × 6.4 km` (`1:1`) capital build centered on `(477, 1108)` rotated `+45°` NE so `+Z` faces down the `Wind Bruk` delta into the `-9.2 m` lake embayment (matching the owner's `60-settlements.js` frame note).
3. **`python3 tools/build.py settlements/dalab --site` -> `dist/dalab-site.html`:** The `32 × 32 km` (`px 469..485, py 1100..1116`) surrounding `ND1` *Dadem-Ring* cut showing Capital Dalab in `KLOD` alongside `Dapor` (`485, 1105`) across the embayment narrows, `Riidom` (`477, 1099`) `18 km` north on the reed-fen shore, and `14` seeded `KHAMLET` mound-and-chinampa bailiwicks.

---

## 1. Scale Model 5.1 Site Survey at `(477, 1108)`

### 1.1 Exact Coordinates, Frame & Climate

| Parameter | Scale Model 5.1 Ground Truth (`scan_dalab_capital_and_regions.py`) |
|---|---|
| **Settlement ID & Pin** | `seed05` — **`Dalab`**, `px = 477, py = 1108` (`gx = 954,000 m, gz = 2,216,000 m`) |
| **Raw Pin Elevation & Slope** | **`+7.5 m`** (`water = false`, `slope = 1.55%`), `2.6 km` from the mouth of `r106 Wind Bruk` (`+9.3 m`) into the **`-9.2 m`** Great SW Lake (`478, 1108`) |
| **Scene Orientation** | **`+45°` azimuth** (`NE = lakeward / +Z`, `SW = upriver Wind Bruk valley / -Z`, `NW = Riidom reed-fen / -X`, `SE = Dapor headland / +X`), per `60-settlements.js` |
| **Barometric Pressure** | **`1.599 atm`** (`1.6 * exp(-7.5 / 8000)`) — dense, warm, high-CO₂/O₂ basin air ideal for Dalabite dermal chloroplasts (`0.92×` caloric requirement) |
| **Temperature & Rainfall** | `tm = 24 °C` (`tw = 29 °C` warmest month, `tc = 19 °C` coldest month; frost-free `365 days/yr`), **`1,349 mm/yr`** at `(477, 1108)` rising to **`1,976 mm/yr`** (`Am`) at `Dapor` (`485, 1105`) |
| **Climate Class & Biome** | `WS` / `Aw`–`Am` warm humid lakeshore margin; primary biome **`swlowlands`** (`biomes/swlowlands`), grading into `swhighlands` on the `> 300 m` benches `8–14 km` SW |

### 1.2 `15 × 15` Map-Pixel Elevation & Water Grid Around `(477, 1108)` (`1 px = 2 km`, `~ -9` = Lake Surface `-9.2 m`)

```text
py\px |   470   471   472   473   474   475   476   477   478   479   480   481   482   483   484
------+------------------------------------------------------------------------------------------
 1101 |   366   311   257   197   134    89    51    46    50    31     3   -79  ~ -9  ~ -9  ~ -9
 1102 |   348   295   242   191   141   113    93    78    66    20   -42  -118  ~ -9  ~ -9  ~ -9
 1103 |   330   278   225   185   150   139   136   112    80     2  ~ -9  ~ -9  ~ -9  ~ -9  ~ -9
 1104 |   313   269   225   199   179   163   148    97    34   -40  ~ -9  ~ -9  ~ -9  ~ -9  ~ -9
 1105 |   296   261   226   213   207   181   156    76  ~ -9  ~ -9  ~ -9  ~ -9  ~ -9  ~ -9    92  <- Dapor at (485,1105) +123m
 1106 |   314   286   259   234   209   162   107    33  ~ -9  ~ -9  ~ -9  ~ -9  ~ -9  ~ -9   156
 1107 |   336   313   293   255   209   146    50   -12  ~ -9  ~ -9    12    83   162   196   213
 1108 |   368   333   296   230   176   104    28    [8] ~ -9  ~ -9   120   172   222   229   219  <- Dalab [8m] at (477,1108)
 1109 |   399   350   293   214   122    49     9    35    88   156   225   259   276   254   217  <- Wind Bruk mouth (476.3,1109.1)
 1110 |   385   314   248   178    98    68    72   125   174   226   280   291   282   249   207
 1111 |   363   282   194   130    70   104   157   196   273   310   333   315   281   239   195
 1112 |   312   244   166   145   143   190   228   285   335   346   342   313   274   238   205
 1113 |   256   194   143   168   219   258   335   371   392   376   346   307   265   239   218
 1114 |   227   206   204   250   290   343   395   407   404   377   340   307   274   259   248
 1115 |   203   227   277   320   395   428   448   435   408   372   332   307   287   281   281
```

**Geomorphic Reading & `landHook` Grading Specification:**
- **The Sheltered SW Embayment (*Da-Dem Bight*):** Pixels `(478..479, 1105..1108)` form a `4 km`-wide sheltered pocket bay of the `-9.2 m` Great SW Lake (`38,480 km²`), protected from open-lake storms by the `+120..+276 m` SE peninsula (`480..484, 1107..1109`) and `Dapor` headland (`485, 1105`, `+122.6 m`). Heavy lake freighters berth at `Dapor` (`17 km` ENE) and lighter shallow-draft barges (`1.8 m` draft) run straight across the calm `4 km` bight to Dalab's Riverfront Quays!
- **The `Wind Bruk` (*Dalab Bruk*) Alluvial Delta (`r106`):** Rising at `(438.2, 1131.2)` (`+879 m` near `Windbruk` in `ND2`), `Wind Bruk` runs `94 km` NE through a sedimentary trough (`474,1111` `+70 m` -> `475,1109` `+49 m` -> `476,1109` `+9 m` -> `477,1108` `+7.5 m`), discharging **`43.7 m³/s`** (`30 m` main channel width) into the `-9.2 m` bight.
- **Addressing the `60-settlements.js` `293 m` Relief Note (`landHook`):** Because raw `2 km` cells climb rapidly south (`+35 m` at `477,1109`, `+125 m` at `477,1110`, `+285 m` at `477,1112`), `dalab`'s `WORLD.landHook` applies an exact, deterministic alluvial delta & terrace flatten over a `2.6 km` radius around `(477, 1108)`:
  - **Chinampa & Harbor Apron (`r = 0..2.4 km` NE/lakeward):** Graded smoothly between `-8.4 m` (`+0.8 m` above the `-9.2 m` lake surface) and `+3.5 m`, cut by `-10.8 m` (`1.6 m` deep) navigable chinampa canals.
  - **Urban Mound Shelf (`r = 0..1.9 km` central/SW):** Graded to `+4.0..+14.0 m` (`slope < 2.5%`) so `KCITY` streets, rowhouses, and canal locks sit level without stilting artefacts, topped by **engineered earthen mounds** (`+8 m` to `+22 m` above shelf = `+16..+34 m` ASL).
  - **Ancient Lab Ring Terrace (`SW apex`):** Level `+16.5 m` plinth cut into the toe of the `Wind Bruk` right-bank bluff, backed naturally by rising `+45..+140 m` madrone-and-oak hills `2.2–3.5 km` SW and SE!

### 1.3 Crops (`CROPS.forBiome('swlowlands')`) & Geology (`RES_GEO`)

- **Verified `CROPS.forBiome('swlowlands')` (`132` legal crops at `24 °C`, `1.599 atm`, `1,349 mm/yr`):**
  - **Chinampa & Levee Staples:** `rice` `[rain]`, `wild-rice` `[rain]`, `basin-amaranth` `[rain]`, `taro` `[rain]`, `sweet-potato` `[rain]`, `shade-manioc` `[rain]`, `painted-camas` `[rain]`, `helix-bean` `[rain]`, `tepary-bean` `[rain]`, `plantain` `[rain]`, `banana` `[rain]`, `breadfruit` `[rain]`, `wineweed` `[rain]`.
  - **Orchard, Oil & Ceremonial Crops:** `madrone` `[wild]`, `arbutus` `[rain]`, `acorn` `[wild]` (live-oak mast for ducks/swine), `whorl-olive` `[rain]`, `avocado` `[rain]`, `mango` `[rain]`, `persimmon` `[wild]`, `fig` `[wild]`, `sugar-cane` `[rain]`, `cacao` `[rain]`, `kava` `[rain]`, `tea` `[irrigated]`, `valley-ginseng` `[irrigated]`, `monks-sage` `[rain]`, `sky-poppy` `[irrigated]`, `camphor` `[rain]` (biomedical reagents for the Halls of Reformation!).
  - **Fibres, Reeds & Dyes:** `ramie` `[rain]`, `flax` `[rain]`, `mulberry` `[rain]`, `rope-banana` `[rain]`, `wallhemp` `[rain]`, `mat-reed` `[rain]`, `pandan` `[rain]`, `bamboo` `[irrigated]`; `CROPS.palette('swlowlands')` yields **`brown` (`mangrove-red`), `red` (`hill-terracotta`), and `teal` (`verdigris`)**, widened on chinampa dye-beds by rain-fed `indigo`, `annatto`, `cave-madder`, and `flametip-tanbark`.
  - **Dark-Grown Vault Crops (`works`-grown):** `pale-fungi`, `alecap`, `glow-mushroom`, and sealed-bed **`the-mat`** inside under-mound Genepriest fermentation/reformation vaults.
- **Verified `geology.json` Prospectivity (`0–30 km` around `477, 1108`):**
  - Sedimentary & lacustrine province: **`clay: 255`** (rammed-earth mounds, fired roof tile, slipware), **`wood: 255`** (bald cypress, live oak, madrone), **`water: 255`**, **`stone: 169–183`** (sedimentary freestone & cyclopean Giant-cut ashlar from the `480..483, 1108..1111` SE bluffs `6–10 km` away), **`silica: 150`** (laboratory & apothecary glassware!), **`coal: 143–146`** (bench seams toward `Konbruk` & `Tonbruk`), **`peat: 78–87`**, **`oil: 65–66`** (bitumen caulking for barges), **`amber: 50–51`**, **`iron: 40`** (bog/bench iron; higher-grade `180` iron comes `70 km` down from `Waitbruk`/`Mistibruk`).

### 1.4 Immediate Neighbour Distances (`ND1` & Trunk Corridors)

| Settlement | `(px, py)` | Distance & Bearing | Connection to Capital `Dalab` |
|---|---|---|---|
| **`Dapor`** (`4,600`) | `(485, 1105)` | `17.1 km` ENE | Deep-lake port across the `Da-Dem Bight` narrows; `45 min` barge shuttle + SE bluff road |
| **`Riidom`** (`2,500`) | `(477, 1099)` | `18.0 km` N | Reed-fen & chinampa market town along the north lakeshore causeway |
| **`Asfol`** (`2,300`) | `(464, 1119)` | `34.1 km` SW | Upriver `Wind Bruk` bench town (brick/lime kilns & charcoal) |
| **`Grinmach`** (`2,400`) | `(464, 1096)` | `35.4 km` NW | NW bench grain & orchard market town |
| **`Okeben`** (`2,100`) | `(496, 1113)` | `39.3 km` ESE | South-bight live-oak timber & boatbuilding town |
| **`Konwel`** (`2,600`) | `(478, 1128)` | `40.0 km` S | South bench grain & caravan staging town toward `Shelf` |
| **`Tonbruk`** (`2,000`) | `(494, 1130)` | `55.6 km` SSE | Cyclopean quarry & coal-seam town above `Wind Riba` |
| **`Shelf`** (`7,000` 50/50) | `(461, 1161)` | `110.7 km` SSW | **50/50 Dalab–Tungang Rim Arcology (`3,500` Dalab surface/entrance levels + `3,500` Tungang `Loj Tuu` interior/tunnels)** — Rift-Line Station #2 (`3,760 m`) |

---

## 2. Castes, Census (`24,500` Headcount / `24,821` `Cal-Eq`) & Complete `DALAB_TRADES` Closure

### 2.1 Locked Capital Population & Biometabolic Split

Per [`PROPOSAL-NORTH-DALAB-FROGMEN.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-NORTH-DALAB-FROGMEN.md) §4.3 and [`DALAB-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/core/region/DALAB-SCOPE.md) §1 (`ΔPop = 0`):

| People / Caste Group | Headcount | Food Mult | `Cal-Eq` | Urban Role & Architectural Footprint |
|---|---:|---:|---:|---|
| **Genepriests & Acolytes of The God** (Dalabites) | `950` | `0.92×` | `874` | Keepers of the Ancient Genetic Lab AI, surgeons of the Halls of Reformation (`ancient-biogel` + `inferior-biogel`), mound liturgists (`DPAL.god` teal-white light allowed) |
| **Dalabite Mound Nobles & Scribes** | `2,150` | `0.92×` | `1,978` | Clan stewards of the 5 radial mounds, bailiwick tax-assessors, granary & barge-customs clerks (`DPAL.god` allowed on noble villas & guildhall) |
| **4-Armed Temple & Lab Shock Giants** (`giant_dalab_4a`) | `220` | `4.35×` | `957` | `3.56 m` sacred guardians (**both breed true as hereditary lineages AND can be elevated from selected `2A` Giants in cryo-vats via scarce `ancient-biogel`**); guard Lab Dome, Palace Mound, High Mound, and Reformation vaults (`minDoorH: 4.5 m`) |
| **2-Armed Urban Patrol, Dock & Bailiff Giants** (`giant_dalab_2a`) | `480` | `4.10×` | `1,968` | `3.56 m` avenue sentries, river-lock winchmen, cyclopean masons, caravan guards (`+50` more 2A Giants reside in the immediate `ND1` bluff quarries & canal locks on `dalab-site.html`, `530` across the capital bailiwick) |
| **Foreign Envoys, Historians & Caravan Factors** | `450` | `1.00×`* | `414` | Resident missions of `Iziz`, `Voth`, `Iron Republic`, `Yuni`/Historians' Chapterhouse, and Great Caravan factors (**Xanadu's permanent embassy is at `Nulab`**, not `Dalab`; *counted inside the `23,800` non-Giant headcount for regional ledger exactness) |
| **Artisans, Biogel-Vatmen, Glassblowers & Merchants** | `8,950` | `0.92×` | `8,234` | `DALAB_TRADES` workshops, crop-to-`inferior-biogel` conversion vatmen, apothecary-glass blowers, slipware/biogel-tun potters (`clay: 255`), ramie weavers, bargemen (warm firelight only) |
| **Chinampa Growers, Fishers & Canal Laborers** | `11,300` | `0.92×` | `10,396` | Four-crop-a-year raised-bed farmers (feeding both city households and the ~15–20% `vat-biogel` crop sink!), duck/swine/crayfish tenders, reed-cutters, mound-earth rammers (warm firelight only) |
| **Capital `Dalab` Total (`seed05`)** | **`24,500`** | — | **`24,821`** | **`23,800` non-Giants + `480` 2A Giants + `220` 4A Giants** (`700` urban Giants = `2.86%` headcount, `11.78%` caloric load) |

### 2.2 Strict Canon Lighting Law (`DESIGN.md` — Zero Drift)

- **`DPAL.god` (`0xccf2ec` cold teal-white Ancient luminescence, `lit: true`):** Permitted **exclusively** on **`priest`**, **`noble`**, and **`civic`** buildings (Ancient Genetic Lab, Palace Mound, High Mound, Halls of Reformation, 5 Neighborhood Ceremonial Mounds, Shrine Pavilions, Giant Temple Barracks, Guild/Scribes' Hall, and Ossuary/Undertakers' Court).
- **Warm Firelight (`0xff9640` / `0xe87428` hearths, clay-oil braziers, plaza fire-bowls, `lit: false`):** Mandatory on **all `peasant` and `middle`/`trade` buildings**, rowhouses, tenements, workshops, `dalab_biogel_vat` fermentation yards, markets, quays, and chinampa farmsteads. Commoners never possess Ancient bioluminescent or cold-cathode fixtures.

### 2.3 Foreign Missions (`4` Embassies + Historians' Chapterhouse; `Xanadu` Embassy at `Nulab`)

1. **`dalab_embassy_iziz` (`75-port-embassy.js`, fixed):** White render + Iziz orange (`0xd85a18`) cornice, 4-arch loggia (**fix `vpArchGeo` porch doorway bar** before build), courtyard plinth. Negotiates Biomedical Reformation charters and watches the Yusar/`Blade` frontier.
2. **`dalab_embassy_voth`:** Cream limestone ashlar, royal purple (`0x5b2468`) velarium banners, classical Vothic portico; handles Great SW Lake shipping treaties with Voth's 8th march `Azoth` (`651, 1160`) and `Shim`, plus `Nazar`/`Drum` crown `ancient-biogel` salvage clearances.
3. **`dalab_embassy_republic`:** Dark riveted iron-ribbed brick & Slavic-carved timber hall of the Iron Republic (`kits/highlands` Slavic/Carpathian woodcarving); trades hydropowered machine tools and precision lenses for Dalabite longevity/organ-graft treatments.
4. **`dalab_embassy_yuni` + `dalab_chapterhouse` (`76-port-chapterhouse.js`):** Sahel-ochre buttressed Yuni mission beside the **Order of Historians' Chapterhouse** (archival vaults studying The God's pre-Cataclysm gene-catalogues under Genepriest supervision).
- *Note (`[LOCKED 2026-11-21]`):* The **Sultanate of the Two Horns (`Xanadu`) has no embassy at sacred capital `Dalab`**; its permanent embassy stands at southern gateway-city **`Nulab` (`443, 1359`)**, built from the ground up as a **pure `kits/xanadu` (`XAK`) Two Horns compound** clearing the Annual Great Caravan as it arrives over the northern rim of the Rift through Xanadu's `The Marches` province (`P8`).

### 2.4 Closing All 12 Missing `DALAB_TRADES` + Biogel-Vat & Lake/Chinampa Pieces (`77-dalab-trades.js` & `78-dalab-civic-water.js`)

Adding these **15 new Dalab kit pieces** closes 100% of [`KNOWN_ISSUES.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/KNOWN_ISSUES.md) (*Voth census trades*), realizes the locked two-tier biogel conversion chain ([`CONTINENTAL-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/core/region/CONTINENTAL-SCOPE.md) §2.3), and equips the shared `settlements/dalab-town` builder (`BUILD-OUT.md` §2.2):

| New Piece Key | Caste / Light | Closes Voth Census Trade(s) | Architectural Form (Earthen Plinth, Heavy Eaves, Painted Timber) |
|---|---|---|---|
| `dalab_bakery` | `trade` (fire) | `bakers` (`20`) | Twin beehive rammed-clay dome ovens under a vented tile loggia; amaranth/rice-flour cooling racks |
| `dalab_butcher` | `trade` (fire) | `butchers` (`27`) | Screened waterside dress-hall over a drainage culvert, smoked-duck/pork rafters, salt-crock verandah |
| `dalab_brewery` | `trade` (fire) | `brewers` (`35`) | Sunken cool-earth fermentation court with 6 glazed clay *kava*/rice-beer/madrone-wine tuns & copper mash kettle |
| `dalab_biogel_vat` | `trade` (fire) | `industrial workers` (`63`), `healers and nurses` (`91`) | **Crop-to-`inferior-biogel` (`vat-biogel`) conversion court:** `8` deep glazed-clay (`clay: 255`) starch-hydrolysis & fermentation tuns, cane/taro/rice mash crushers, `salt`/`sulfur`/`lime` dosing troughs, and ceramic settling carboys |
| `dalab_tannery` | `trade` (fire) | `tanners` (`11`) | Downwind canal-edge lime & `ironbark-tannin` pit yard (`8` sunken vats), hide-stretching frames (lizard & swine pelts) |
| `dalab_boatyard` | `trade` (fire) | `shipwrights and boatbuilders` (`6`), `ropemakers and sailmakers` (`43`) | Slipway shed (`26 × 14 m`) launching flat-bottomed `16 m` lake barges and `7 m` chinampa punts; bitumen cauldron & `rope-banana` walk |
| `dalab_guildhall` | `civic` (`DPAL.god`) | `guild officers and clerks` (`16`), `customs and harbour officers` (`51`) | Stepped `2.4 m` earthen plinth, painted 6-column loggia, tally-tablet archive, Giant-height (`4.4 m`) central weigh-portal |
| `dalab_ossuary` | `priest` (`DPAL.god`) | `priests and undertakers` (`24`) | *Court of Return*: cloistered earthen columbarium & biocompost sanctum where citizens' bodies return to the sacred madrone groves |
| `dalab_fishdock` | `peasant` (fire) | `fishers` (`54`), `dockers and porters` (`50`), `river bargemen` (`49`) | Cypress-pile quay + cantilevered dip-net gantry, eel/crayfish live-cars, and Giant-winched barge crane |
| `dalab_minehead` | `trade` (fire) | `miners` (`58`) | Timbered adit collar, rail tipple, and sorting shed (used on outer `ND1`/`ND2`/`SD2` coal, iron & copper benches) |
| `dalab_quarry` | `trade` (fire) | `quarrymen and masons` (`59`) | Stepped sedimentary freestone bench, Giant-levered block sledges (`3.2×` haul), and cyclopean dressing shelter |
| `dalab_dairy` | `peasant` (fire) | `dairymen` (`62`) | Cool thick-walled earth-bermed cheese/curd press house + water-buffalo / bench-goat milking paddock |
| `dalab_livestock_yard` | `peasant` (fire) | `swineherds and duck keepers` (`63`) | Canal-margin duck-ladder ramp, wattled swine pens fed on chinampa trimmings & live-oak acorns |
| `dalab_chinampa_stead` | `peasant` (fire) | `chinampa and terrace growers` (`56`) | Willow-piled `48 × 14 m` raised island plot (`rice`, `taro`, `basin-amaranth`, `indigo`) + punt landing & tool hut |
| `dalab_lake_barge` | `prop` (fire) | `merchants and factors` (`48`), `river bargemen` (`49`) | `16 m` shallow-draft cypress lake-barge (`scow` bow, woven `pandan` deckhouse, twin sweep oars) + `7 m` chinampa punt |

---

## 3. District-by-District Layout on 5.1 Ground (`6.4 × 6.4 km` Scene, `+45°` NE Lakeward Frame)

In the local scene frame (`origin = (954,000 m, 2,216,000 m)`, rotated `+45°` so **`+Z` points NE into *Da-Dem Bight* (`-9.2 m` lake)** and **`-Z` points SW up the `Wind Bruk` valley**):

```text
                       [-Z : SW Upriver Wind Bruk Valley & Sedimentary Bluffs (+45..+140 m)]
                                              |
                     +------------------------+------------------------+
                     |    (1) DOMED ANCIENT GENETIC LAB (z = -1450)    |
                     |   180 m White Dome + 480 m Ruined Ring-Apron    |
                     +------------------------+------------------------+
                                              |  Madrone & Live-Oak
              [NW Mound M1]         (2) SACRED MOUND AXIS        [SE Mound M2]
              (Artisans/Glass)     Palace Mound | High Mound     (3) DIPLOMATIC &
                     \             Halls of Reformation          GREAT CARAVAN QUARTER
                      \                       |                 (4 Embassies + Lizards)
        [-X : NW] -----+-----[M3]-----(4) CENTRAL PLAZA-----[M4]-----+----- [+X : SE toward Dapor]
        Wind Bruk       \              & MOUND RING WARDS           /       South Distributary
        North Arm        \             (KCITY Radial Loops)        /        & Bluff Quarries
                          +------------------[M5]-----------------+
                                              |
                     +------------------------+------------------------+
                     |  (5) RIVERFRONT QUAYS, BIOGEL VATS & CUSTOMS    |
                     |      (z = +650..+1050, Giant Lock-Winches)      |
                     +------------------------+------------------------+
                     |  (5b) CHINAMPA RAISED-FIELD CANAL BELT          |
                     |       110 Willow-Staked Islands (z = +1050..+2100)|
                     +------------------------+------------------------+
                                              v
                       [+Z : NE Da-Dem Bight (-9.2 m Lake) -> 17 km to Dapor]
```

### District 1 — The Domed Ancient Genetic Lab & Ruined Ring-Apron (`z = -1,850..-1,100 m`, Plinth `+16.5 m`)
- **The God's Sanctuary (`64-dalab.js` at `0.4×` scale):** `180 m` white geodesic-ribbed Ancient Lab Dome (`480 m` outer security ring), housing the surviving biomedical AI (*The God*), deep pre-Cataclysm **`ancient-biogel`** cryo-vaults, and `4A` Temple Giant elevation vats (`4A` Giants both breed true and can be elevated here in cryo-vats). Cold `DPAL.god` teal-white glow (`lit: true`) radiates from its oculus and ring-conduits.
- **Ruined Ring-Apron (`63-anc-dalab.js`):** Broken pre-Cataclysm ring segments, overgrown aqueduct piers, and sunken cryo-vault skylights emerging from red-barked madrone and live-oak roots; patrolled exclusively by `4-Armed Temple Giants` (`minDoorH: 4.5 m`).
- **Under-Lab Conduit Canal:** A stone-lined diversion of `Wind Bruk` (`6 m` wide) feeds clean mountain water through the Lab's cooling heat-exchangers before cascading into the Sacred Axis reflecting basins.

### District 2 — The Sacred Mound Axis & Halls of Reformation (`z = -1,100..-250 m`, Shelf `+11..+15 m`)
- **Madrone & Live-Oak Processional Avenue (`KDRAWN` trunk, `28 m` wide):** Paved in Giant-laid cyclopean sedimentary slabs (`4.5 m` clearance throughout), flanked by alternating ancient live oaks, red-barked madrones, and cold-lit `DPAL.god` obelisk lanterns.
- **High Priest's Palace Mound (`dalab_palace_mound`, west of axis at `x = -240, z = -780 m`):** `3-tier` stepped earthen pyramid (`+22 m` above shelf = `+35 m` ASL) crowned by the High Priest's cloister, AI-communion sanctum, and 4-Armed Giant Honor Barracks (`dalab_giant_barracks`).
- **Greater Temple Mound (`dalab_high_mound`, east of axis at `x = +230, z = -740 m`):** `2-tier` liturgy mound (`+18 m` above shelf) where the city gathers at solstice to receive chloroplast-blessing sacraments; faces the Lab Dome directly.
- **The Halls of Reformation (`dalab_halls` × 3 pavilions + `dalab_ossuary`, `z = -460 m`) — Two-Tier Biogel Architecture (`[LOCKED]`):**
  - **Masterwork Sanctums (`ancient-biogel`):** Fed by scarce, non-renewable **`ancient-biogel`** recovered from deep Lab Dome sub-levels, `Nazar`/`Span`/`Blade` `"priests' cut"` salvage, and foreign brokers (`Tethis`, `Port Mira`, `Yusar`). Mandatory input for **cryo-vat elevation of `4A` Temple Giants (`2.3×` sacred caste, supplementing hereditary true-breeding `4A` families)**, masterwork chimeras, and wealthy outlanders from `Iziz`, `Voth`, `Xanadu`, and the `Iron Republic` seeking organ regeneration and longevity grafts (`genecraft: 600/yr`).
  - **Everyday Reformation Clinics (`inferior-biogel` / `vat-biogel`):** Powered by domestic crop-fermented `vat-biogel` piped/carted up from District 5's `dalab_biogel_vat` courts, supporting `1B` Graft-Servitors, `1A`/`2A` Vat-Brutes, amphibi-gill/cold splices, and citizen healing.

### District 3 — Diplomatic & Great Caravan Quarter (`x = +380..+980 m, z = -650..+150 m`, Shelf `+9..+13 m`)
- Occupying the dry SE bluff-foot terrace where the overland road from `Dapor` (`17 km` ENE) and `Shelf` (`111 km` SSW) enters the capital:
  - **Embassy Row:** `dalab_embassy_iziz`, `dalab_embassy_voth`, `dalab_embassy_republic`, `dalab_embassy_yuni`, and `dalab_chapterhouse` (Order of Historians) — while `Xanadu`'s permanent embassy compound stands at southern gateway `Nulab` (`443, 1359`).
  - **Great Caravan Lizard-Yard & Quarantine Gate:** Walled staging caravanserai (`90 × 70 m`, `minDoorH: 4.4 m`) where `South-Rift` and northern-rim Great Caravan pack-lizard trains (`lizard-pack-train`, cleared upstream through Xanadu's embassy at `Nulab` and transshipped via `Ledge` & `Shelf`) unload `copper`, `bronze`, `silk`, `gold`, `tea`, and sealed `ancient-biogel` cryo-canisters and load biomedical `genecraft` phials, `amber`, `glass`, and `linen-ramie` cloth.

### District 4 — Five Radial-Ring Mound Quarters on `core/city` (`r = 250..1,250 m`, Shelf `+5..+11 m`)
- Built entirely through **`KCITY`** (`core/city`) — **never** bespoke radial loops:
  - **Five Neighborhood Ceremonial Mounds (`M1–M5`, `dalab_mound`):** Each neighborhood centers on a `+10 m` grassed earthen mound whose summit temple (`lit: true`, `DPAL.god`) **rotates its `front` socket to face the Ancient Genetic Lab (`z = -1,450 m`)** (`DESIGN.md` sacred-orientation rule).
  - **Ceremonial Fire Plazas:** At the foot of each mound sits a `55 × 45 m` compacted-earth plaza with a sunken communal hearth-bowl (`lit: false`, warm firelight), public cistern (`dalab_well`), market awning (`dalab_stall`), and `dalab_noble_villa` / deacon compounds on the inner ring.
  - **Radial & Concentric Street Hierarchy (`KCITY`):**
    - **Primary Causeways (`14 m` wide, `minDoorH: 4.2 m`):** Connect `M1–M5` to the Sacred Axis and Riverfront Quays; patrolled by pairs of `2-Armed Giants`.
    - **Concentric Ring Streets (`8 m` wide):** Lined with `dalab_rowhouse`, `dalab_tenement`, `dalab_bakery`, `dalab_brewery`, `dalab_workshop` (silica-glass & apothecary phials, `clay: 255` slipware pottery & glazed biogel tuns, ramie looms), and `dalab_smithy`.
    - **Garden Alleys (`4 m` wide):** Rear courtyard access with rain-barrels, breadfruit/persimmon shade trees, and `KCONS` active construction sites (`~18` lots).

### District 5 — `Wind Bruk` Delta Quays, Biogel Conversion Vats & Chinampa Belt (`z = +550..+2,250 m`, `-8.4..+5.0 m`)
- **North & South `Wind Bruk` Distributaries (`KWATER`, `18–24 m` wide):** Embrace the urban shelf on NW and SE before meeting *Da-Dem Bight* (`-9.2 m`).
- **Riverfront Quays & Customs (`z = +550..+950 m`):** `dalab_guildhall` (Harbour & Barge Customs), `4 × dalab_fishdock` with Giant-cranked capstans, `2 × dalab_boatyard`, `dalab_butcher`, `dalab_granary` × 6, and `14` moored `dalab_lake_barge` hulls shuttling bulk cargoes across the `4 km` bight from `Dapor`.
- **Downwind Wet-Trades & Biogel Conversion Apron (SE Distributary Mouth, `x = +700..+1,250 m`):** **`6 × dalab_biogel_vat` crop-conversion courts** (fermenting bulk `rice`, `taro`, `shade-manioc`, `sugar-cane`, and `basin-amaranth` with `salt`/`sulfur`/`lime` in locally fired `clay: 255` tuns into **`inferior-biogel`**, absorbing ~15–20% of `ND1`'s crop surplus!), alongside `dalab_tannery`, `indigo`/`verdigris`/`hill-terracotta` dye-vat yards, brick/tile/biogel-tun kilns (`clay: 255`), and `dalab_livestock_yard` (fed on biogel-vat spent mash & live-oak acorns).
- **The Chinampa Raised-Field Canal Belt (`z = +950..+2,250 m`):** **`110` willow-staked rectangular chinampa islands** (`40–65 m × 12–16 m`, `+0.8 m` above the `-9.2 m` lake level = `-8.4 m` surface) separated by `5–8 m` punt channels (`dalab_chinampa_stead` + `CROPS` strip meshes of `rice`, `taro`, `basin-amaranth`, `sweet-potato`, `ramie`, and `indigo`), yielding 4 harvests a year in `24 °C`, `1.60 atm` air!

### District 6 — Outer `Dadem-Ring` (`ND1`) Bailiwicks (`dalab-site.html` `32 × 32 km` Cut)
- Beyond the chinampa belt (`r = 3–16 km`), `KHAMLET.village` (`core/hamlet/22-hamlet-dalab.js`) places **`14` deterministic `ND1` bailiwick hamlets** (`300–450` pop each: mound-shrine + deacon's house + 2A Giant bailiff post + 18–28 peasant cottages/chinampas/bluff quarries), connected by towpaths to `Dalab`, `Dapor` (`485, 1105`), and `Riidom` (`477, 1099`).

---

## 4. Staged Order of Work (`D0–D6`), Verify Views & Open Questions

### 4.1 Staged Implementation Steps

| Step | Scope | Verification Gate |
|---|---|---|
| **`D0` — Kit Sync, Bugfixes & `dalab_kit.py`** | Sync `63-anc-dalab.js`, `75-port-embassy.js` (fix `vpArchGeo` porch doorway bar), `76-port-chapterhouse.js`; add `75b-port-embassy-xanadu.js` (`XAK` bundle), the **12 missing `DALAB_TRADES` pieces**, `dalab_chinampa_stead`, and `dalab_lake_barge`; export `settlements/dalab/dalab_kit.py`; rebuild `dist/dalab-set.html` | `python3 tools/build.py settlements/dalab --kit` + kit `verify.py --assert` (`0` socket/z-fight errors; all 64 Voth census rows covered or truthfully mapped) |
| **`D1` — 5.1 Extract & `WORLD.Hland` + `landHook`** | Extract `openworld/dalab-dadem-ring` (`px 456..516, py 1060..1138`, `upsample 4` = `500 m/cell`); wire `WORLD.Hland` at `(477, 1108)` (`+45°` NE frame) + `landHook` delta shelf, 7 ceremonial mounds, `Wind Bruk` distributaries, and `-9.2 m` *Da-Dem Bight* (`KWATER` + `KCOAST`) | Terrain & hydrology smoke check: Lab plinth `+16.5 m`, urban shelf `+4..+14 m`, chinampas `-8.4 m` (`+0.8 m` above `-9.2 m` lake), zero flooded roads |
| **`D2` — `KCITY` Layout & Sacred Orientation** | Replace `87-city-layout.js` & `88-city-place.js` with `KCITY` districts: Sacred Axis (`KDRAWN`), Diplomatic/Caravan Quarter, 5 Radial-Ring Mound Quarters (`M1–M5` facing Lab Dome, `minDoorH: 4.2 m` Giant routes), Riverfront Quays, and `110`-island Chinampa Canal Grid | Node layout test: `0` building overlaps in `KSPACE`, `100%` mound temples oriented within `3°` of Lab Dome, `100%` Giant patrol corridors `>= 4.2 m` clear |
| **`D3` — Flora, Crops, Lighting & Instance-Cap Fix** | Scatter `biomes/swlowlands` via `KMASK` (excluding mounds, streets, chinampas, water); populate chinampa strips from `CROPS.forBiome('swlowlands')`; enforce `DPAL.god` strictly on `priest`/`noble`/`civic` and firelight on `peasant`/`trade`; thin `swlowlands/glossy` `< 165,000` instances | `harness.SURVEY` check: `swlowlands/glossy < 165,000` (`instance-cap` green with **no** `capWhy` waiver), `draw calls <= 900` |
| **`D4` — Interiors, Characters, Barges & `SIM`** | Wire `KFURN` (`indexed: true`) interiors for Palace, Halls of Reformation, Embassies, Guildhall, and sample rowhouses/trades; place `dalabites` + `mpfb_giant` (`2A` & `4A`), pack-lizards, and `dalab_lake_barge` traffic; bind `SIM` (`dalab-tune.js`) | `SIM` 365-day capital stock proof green (`food >= 90 d`, `genecraft` positive export, `coal` & `copper` balanced via `Dapor`/`Shelf`) |
| **`D5` — `dalab-site.html` (`32 × 32 km` Cut)** | Build `--site` target showing `Dalab` + `Dapor` (`485, 1105`) + `Riidom` (`477, 1099`) + `14` `KHAMLET` (`22-hamlet-dalab.js`) bailiwicks + `KLOD` tiers | `python3 tools/build.py settlements/dalab --site` + `verify.py --site --assert` |
| **`D6` — Full Lint, Reach & Baseline** | Run `python3 tools/reach.py`, rebuild `settlements/span` if `dalab_kit.py` touched shared pieces, run `python3 tools/test_all.py` | All lints (`check_core_use`, `check_views`, `check_assembly`, `check_budgets`) and GPU `verify.py --assert` green |

### 4.2 Standard Verify Views (`tools/check_views.py` Compliant — No `'` or `:`)

1. `overview-ne-lakeward` — High bird-eye from SW bluffs over the Lab Dome, Sacred Mound Axis, 5 radial mound wards, Chinampa Belt, and `-9.2 m` *Da-Dem Bight* toward `Dapor`
2. `ancient-lab-and-sacred-avenue` — Ground-level processional view down the madrone/live-oak avenue from the `180 m` Lab Dome between Palace Mound and High Mound (`4A` Temple Giants on guard)
3. `halls-of-reformation-court` — Cloistered biomedical court showing `silica`-glass vats, Genepriests, and outlander patients under cold `DPAL.god` teal-white lanterns
4. `embassy-row-and-xanadu-caravan` — Diplomatic terrace showing Iziz, Voth, Republic, Yuni, and Xanadu missions plus pack-lizards in the Great Caravan yard
5. `neighborhood-mound-fire-plaza` — Radial Mound `M3` dusk check proving `DPAL.god` glow on the summit shrine vs warm firelight across surrounding rowhouses and workshops
6. `wind-bruk-quays-and-boatyards` — Riverfront customs `guildhall`, Giant-cranked barge winches, `dalab_boatyard`, and `16 m` lake barges arriving from `Dapor`
7. `chinampa-canals-and-punts` — Low oblique over willow-staked `rice`/`taro`/`amaranth`/`indigo` chinampa islands and punt channels on the `-9.2 m` lake margin

### 4.3 Concise Open Questions for the Owner

1. **`seed05` Pin Confirmation (`477, 1108`):** Confirm keeping `Dalab` at its 2026-11-11 moved `60-settlements.js` pin **`(477, 1108)`** (`+7.5 m`, mouth of `Wind Bruk` into the `-9.2 m` bight, `17 km` WSW of `Dapor`), with `landHook` smoothing the `2.6 km` delta shelf as noted in `60-settlements.js`.
2. **Xanadu Mission Style:** Should `dalab_embassy_xanadu` use pure Two Horns battered whitewash-and-gilt roofs (`XAK` bundle), or a Dalab-built earthen plinth topped by a Xanadu timber pavilion? (Default in `D0`: Dalab cyclopean plinth + `XAK` gilt pavilion and lizard-court.)
3. **Kit Extraction Path:** Keep the Dalab building fragments in `settlements/dalab/src/` exposed via `settlements/dalab/dalab_kit.py` (zero churn to `Span`), or move `50..78` into a dedicated `kits/dalab/` folder in Wave 0? (Default: `settlements/dalab/dalab_kit.py` in-place first, matching `Span`.)
