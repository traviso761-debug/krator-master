# Greater Dalab — Regional & Settlement Build-Out Blueprint

Companion to [`settlements/xanadu/BUILD-OUT.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/xanadu/BUILD-OUT.md), [`settlements/dalab/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/PLAN.md), and [`core/region/DALAB-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/core/region/DALAB-SCOPE.md).

Tracks every inhabited settlement (`43`), ruin (`2`), decentralized countryside bailiwick (`476` `KHAMLET`s = `187,775` souls), `Frogmen` border seat (`12` sites = `11,500` souls), `openworld/dalab-*` regional cut (`5` cuts), shared building kit piece, and session-by-session wave needed to bring **all `320,000` inhabitants (`310,351` `cal-eq`) of Greater Dalab (`ND1–ND5` + `SD1–SD3`)** — plus the `8,500` co-resident Tungangs inside the **50/50 dual-culture `Shelf` & `Ledge` arcologies** — onto Scale Model 5.1, `core/world`, `core/city`, `core/hamlet`, and `core/simulation`.

---

## 0. Summary Status Table

| Group | Sites / Scope | Dalab Pop (`Headcount`) | Built Today | Planned (`PLAN.md`) | Scoped / Unplanned | Build Mechanism |
|---|---:|---:|---:|---:|---:|---|
| **Capital `Dalab`** (`seed05`) | `1` | `24,500` | Legacy flat (`84..95`) | **`1` (`dalab/PLAN.md`)** | `0` | Bespoke `core/city` + `core/world` (`settlements/dalab`, w/ `ancient-biogel` + `vat-biogel` chain) |
| **Regional Hub Cities & 50/50 Arcologies** | `4` | `27,000` *(`+8.5k` `TU` = `35.5k`)* | `0` | **`2` (`Ledge`, `Nulab`)** | **`2` (`Dayshun`, `Shelf`)** | Bespoke `settlements/<name>` builds on `dalab_kit.py` (+ `kits/shumari` in `Dayshun`, `kits/ancients` + `kits/tungang` 50/50 in `Shelf`/`Ledge`) |
| **Bailiwick Market Towns (`2,000–4,600`)** | `29` | `75,200` | **`1` (`Span` `2.3k`)** | `0` | **`28` towns** | **One parameterized `settlements/dalab-town` target (`?town=<id>`)** driven from `dalab-tune.js` (like `settlements/xanadu-lake`) |
| **Frontier Forts, Bore-Terminals & Toll** | `9` *(`+2` ruins)* | `5,525` | `0` | `1` (`Blaktol` in `blakhed`) | **`8` posts** *(`+Nazar`, `Chimes`)* | `1` bespoke ruin-fort (`Blade`) + `settlements/dalab-post` (`?post=<id>`) / open-world stamped `KHAMLET` forts |
| **Countryside `KHAMLET` Network** | `476` | `187,775` | `0` | `0` | **`476` hamlets** | **`core/hamlet/22-hamlet-dalab.js`** (`5` archetypes) streamed deterministically in `openworld/dalab-*` + `settlements/dalab-hamlets` sheet |
| **Open-World `1:1` Regional Cuts** | `5` cuts | *(hosts all `320k`)* | `0` | `0` | **`5` `openworld/dalab-*`** | `extract_region.py --upsample 4` (`500 m/cell`) + `core/world` + `SITES.json` |
| **`Frogmen` Border Seam (`FM1–FM4`)** | `12` | *`11,500` (border)* | *(in `Span`)* | `0` | **`12` fen seats** | `kits/frogmen` + `Jrrmiah` / `Krrmt` showcase & `dalab-north-march` edge |
| **GREATER DALAB TOTAL** | **`519` sites** | **`320,000`** | **`1` (`Span`) + kit** | **`3` (`Dalab`, `Ledge`, `Nulab`)** | **`515` (`28` towns, `2` hubs, `8` posts, `476` hamlets)** | **Zero 29-folder copy-paste: `7` bespoke builds + `1` parameterized town build + `22-hamlet-dalab.js` + `5` open-world cuts** |

---

## 1. Complete Inventory by Category

### 1a. Capital, Regional Hub Cities & 50/50 Dual-Culture Rim Arcologies (`5` Cities = `51,500` Dalab + `8,500` Tungang = `60,000` Urban Pop)

| Settlement | ID | Sub | `(px, py)` | Elev | Pop (`Dal / 2A / 4A` + `TU`) | Signature Architecture & Kits | Folder & Status |
|---|---|---|---:|---:|---|---|---|
| **`Dalab`** | `seed05` | `ND1` | `477, 1108` | `+8 m` | **`24,500`** (`23800/480/220`) | `180 m` Ancient Lab Dome (`ancient-biogel` vaults), Palace & High Mounds, Halls of Reformation + `dalab_biogel_vat` crop-conversion courts, 5 Embassies (`+Xanadu`), 5 `KCITY` Mound Wards, `110` Chinampas | [`settlements/dalab/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/PLAN.md) — **Planned (Wave 1)** |
| **`Ledge`** | `sxyznayzgc` | `SD1` | `437, 1330` | `+1,563 m` -> `+298 m` | **`10,000` 50/50** (`5,000` `SD1` `4800/130/70` + **`5,000` `TU2` `Loj Fower`**) | **`[LOCKED 50/50]` Dual-Culture Cliff Arcology:** Dalab shore/head settlements + 1–2 entrance levels (`dalab_kit.py`, `vat-biogel` vats, `#1` bronze foundry importing `Nulab` `clay:230`) + Tungangs (`kits/tungang`) inside arcology interior, lift cores & S2 tunnels | [`settlements/ledge/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/ledge/PLAN.md) — **Planned (Wave 4)** |
| **`Nulab`** | `ssk1wsnjjd` | `SD2` | `443, 1359` | `+344 m` | **`10,000`** (`9800/140/60`) *(`+250` `TU2` `Loj Fayv`)* | South-shore Great Lake breadbasket city, stepped Dalab mounds, `clay:230` fireclay/tun kilns, `vat-biogel` vats + deep spire `ancient-biogel`, copper/bronze yards, Great Caravan caravanserai | [`settlements/nulab/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/nulab/PLAN.md) — **Planned (Wave 4)** |
| **`Dayshun`** | `s5xupuwq1h` | `ND4` | `608, 1168` | `+423 m` | **`8,500`** (`8250/170/80`) | **Assimilated former-Shumari scarp-foot city:** ~45% Shumari battered polygonal ashlar lower wards ([`PROPOSAL-WEST-RIFT.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-WEST-RIFT.md) §2.1) + Dalab ceremonial temple mounds, `vat-biogel` vats & Giant gates (`minDoorH: 4.2`) | `settlements/dayshun` — **Scoped (Wave 4)** |
| **`Shelf`** | `sw96wqyc7j` | `ND3` | `461, 1161` | `+3,760 m` | **`7,000` 50/50** (`3,500` `ND3` `3350/100/50` + **`3,500` `TU1` `Loj Tuu`**) | **`[LOCKED 50/50]` Dual-Culture Rim Arcology & Station #2:** Dalab surface terraced apron + 1–2 entrance levels (`vat-biogel` courts, Great Caravan customs, entrance bazaar) + Tungang `Loj Tuu` (`kits/tungang`) inside arcology structure, mushroom/blind-fish galleries & spiral mountain bores (`clay:0` scarp) | `settlements/shelf` — **Scoped (Wave 4)** |

### 1b. The `29` Small & Medium Bailiwick Market Towns (`2,000–4,600` Pop = `75,200` Pop)

 **`Span`** (`seed01`, `2,300` pop) is **already built and verified** (`settlements/span`, `SP1–SP5`). The remaining **`28` towns** are generated by **one shared parameterized `core/city` build (`settlements/dalab-town`, `?town=<id>`)** reading exact terrain from its parent `openworld/dalab-*` extract and census/works from `core/region/data/dalab-tune.js`:

| Sub | Town (`?town=`) | `(px, py)` | Elev | Pop | Town Preset (`dalab-town`) | Signature Centerpiece & Works |
|---|---|---:|---:|---:|---|---|
| `ND1` | **`dapor`** (`svvu4ssvzc`) | `485, 1105` | `+123 m` | `4,600` | `harbour-bluff` | Deep-water `-9.2 m` lake moles (`wpin 486,1104`), Giant crane-quay, customs `guildhall`, `3 × boatyard`, bluff-top mound |
| `ND1` | **`konwel`** | `478, 1128` | `+613 m` | `2,600` | `bench-market` | `Shelf`-road caravan court, `4 × granary`, emmer/rice mills, `dalab_biogel_vat`, *Da-Hundad* mound |
| `ND1` | **`riidom`** | `477, 1099` | `-14 m` | `2,500` | `polder-chinampa` | Diked lakeshore polder, `36` chinampa islands, `mat-reed` weaving halls, `clay:255` brick & biogel-tun clamps |
| `ND1` | **`grinmach`** | `464, 1096` | `+586 m` | `2,400` | `bench-market` | Pressed `hashish` resin presses, cotton/ramie dye-courts, `Blade`-trunk staging post |
| `ND1` | **`asfol`** | `464, 1119` | `+334 m` | `2,300` | `river-terrace` | `Wind Bruk` stone bridge, `whorl-olive` oil presses, blue-agave `tequila` stills, ash-kilns |
| `ND1` | **`okeben`** | `496, 1113` | `+1 m` | `2,100` | `harbour-cove` | `4 × dalab_boatyard` (chief live-oak barge builder), bitumen caulking pits, slipware kilns |
| `ND1` | **`tonbruk`** | `494, 1130` | `+435 m` | `2,000` | `quarry-bench` | Giant-levered `dalab_quarry` yards, cyclopean block sledges, `Dalab–Daranch` road inn |
| `ND1` | **`konbruk`** | `508, 1066` | `-21 m` | `2,000` | `colliery-quay` | Peak `coal:205` lakeside drift `minehead`s + timber coal-staithes loading barges for `Dalab` |
| `ND2` | **`nufelds`** (`sdfnky6vm8`)| `442, 1053` | `+91 m` | `4,000` | `shire-seat` | Double-ring mound town, `6 × granary`, `dalab_biogel_vat`, olive & `tequila` guild courts, `100`-Giant barracks |
| `ND2` | **`rokwal`** (`sgnwyt5n59`) | `413, 1088` | `+3,235 m`| `2,700` | `highland-fort-town`| Battered impactite/marble wall (`clay:0`), `100`-Giant western watch, `iron:180` forges, flax looms |
| `ND2` | **`brodbruk`** | `454, 1075` | `+517 m` | `2,700` | `ford-market` | Multi-arch `Brod Bruk` ford-bridge, ironmongers, pottery & grain market |
| `ND2` | **`waitbruk`** | `412, 1063` | `+791 m` | `2,400` | `quarry-bench` | White `limestone:142` lime-kilns (biogel catalytic reagent), `iron:180` bloomeries, lizard-drover corrals |
| `ND2` | **`windbruk`** | `442, 1129` | `+759 m` | `2,200` | `ranch-bench` | Upper `Wind Bruk` lizard-ranch stockades, agave-spirit tuns, leather `tannery` |
| `ND2` | **`kleibruk`** | `428, 1071` | `+724 m` | `2,000` | `river-terrace` | `clay:254` stoneware, fireclay crucibles & glazed biogel-tun bottle kilns, overshot watermills |
| `ND3` | **`windrib`** | `491, 1155` | `+550 m` | `2,600` | `ford-market` | `Wind Riba` bridge & pack-train transfer yard (`clay` brick & crop feed) at foot of the `3,200 m` `Shelf` climb |
| `ND3` | **`mistibruk`** | `500, 1159` | `+794 m` | `2,000` | `quarry-bench` | Timber-flume splash dam, charcoal clamps, `iron:180` smithies |
| `ND4` | **`daranch`** (`semn6wzmqx`)| `527, 1149` | `+677 m` | `4,600` | `breeding-ranch` | **Unique `dalab-town` preset:** `250`-Giant cohort muster campus + `vat-biogel` veterinary sanctum + giant pack-lizard breeding paddocks |
| `ND4` | **`klirbruk`** | `510, 1137` | `+30 m` | `2,700` | `harbour-cove` | SW lake ferry pier, `dalab_fishdock` eel/perch weirs, wet-rice mills |
| `ND4` | **`pirlafod`** | `580, 1165` | `+6 m` | `2,500` | `estuary-port` | `61 m³/s` `Spirlariba` causeway-bridge, lake-barge quay, cypress sawmills |
| `ND4` | **`midmar`** | `560, 1145` | `+295 m` | `2,300` | `bench-market` | Bitumen pitch-boiling vats, `sugar-cane` rollers (`vat-biogel` feed), `cacao` & `indigo` drying courts |
| `ND4` | **`dafiri`** | `534, 1133` | `+5 m` | `1.60` | `harbour-cove` | Wide-ramp livestock & Giant-cohort ferry slips serving `Daranch` |
| `ND4` | **`koleben`** | `544, 1079` | `+42 m` | `2,100` | `colliery-quay` | `coal:138` drift mines, lime-kilns, and `Nazar`-narrows patrol barges |
| `ND5` | **`panfod`** | `520, 1039` | `+288 m` | `2,700` | `estuary-port` | Head of `Pan Riba` (`153 m³/s`) barge navigation; mulberry-silk & iron transfer |
| `ND5` | **`span`** (`seed01`) | `554, 1010` | `+2,545 m`| `2,300` | *Bespoke (`settlements/span`)* | **Already built:** Ancient bridge span, `42 m` Thunderdome pit, Frogman quarter, `"priests' cut"` `ancient-biogel` |
| `ND5` | **`geitbruk`** | `489, 1053` | `+258 m` | `2,100` | `ford-market` | `Geit Bruk` toll-bridge on `Dalab–Blade` highway, `coal:108` & fruit orchards |
| `SD2` | **`kouldmauf`** | `434, 1355` | `+351 m` | `3,100` | `estuary-port` | `Kould Riba` (`96 m³/s`) mouth on `+298 m` Great Lake; `Drovers` slab-salt & grain barges |
| `SD2` | **`chimsfod`** | `460, 1380` | `+299 m` | `2,900` | `smelter-ford` | `Chimes Riba` (`1,089 m³/s`) gorge-head fortress-ford; `copper:240` & `gold:140` fireclay-crucible smelters |
| `SD2` | **`silbabruk`** | `462, 1366` | `+826 m` | `2,400` | `river-terrace` | Cupellation silver-hearths, `mist-tea` drying lofts, terraced orchards |
| `SD2` | **`kopafol`** | `436, 1375` | `+1,141 m`| `2,200` | `smelter-bench` | Chief South-Dalab `copper:240`, `sulfur` & `iron:210` roasting stalls & slag terraces |

### 1c. Frontier Forts, Bore-Terminals, Toll Outposts (`9` Posts = `5,525` Pop) & Ruins (`2`)

| Site | Sub | `(px, py)` | Elev | Pop | Build Path |
|---|---|---:|---:|---:|---|
| **`Blade`** (`s4tcb5iuwc`) | `ND5` | `451, 1022` | `+1,229 m` | `900` | **Bespoke `settlements/blade` (Wave 5):** Ruined rim arcology stub + Dalab quarantine gatehouse screening Valley `ancient-biogel` & salvage |
| **`Borgeit`** | `ND3` | `457, 1165` | `+4,464 m` | `800` | `dalab-post` (`?post=borgeit`): Rift-Line North Portal (`37 m` gallery mouth) + Tungang ore/crucible transfer yard |
| **`Istgeit`** | `ND4` | `619, 1168` | `+208 m` | `800` | `dalab-post` (`?post=istgeit`): Cyclopean Giant border fort + `coal:132` pit watching Voth's 8th march `Azoth` (`V8`) |
| **`Beisngeit`** | `ND5` | `540, 1014` | `+1,826 m` | `800` | `dalab-post` (`?post=beisngeit`): Lower **Basin Tunnel** portal (`28 km` to `Span`) + `Pan Riba` mule/lizard yard |
| **`Aianwal`** | `ND2` | `396, 1111` | `+4,481 m` | `700` | `dalab-post` (`?post=aianwal`): Cold-modded alpine `iron:180` & `gold:90` garrison mine (`clay:0`) |
| **`Salpita`** | `ND3` | `482, 1192` | `+4,967 m` | `700` | `dalab-post` (`?post=salpita`): `saltpeter:158` leaching vats + Crest Tunnel North Portal (`488, 1220`) guard |
| **`Nazawach`** | `ND5` | `552, 1060` | `+723 m` | `700` | `dalab-post` (`?post=nazawach`): Salvage-customs fort screening `ancient-biogel` & tech from `Nazar` (`3,072 km²` `0x80`) |
| **`Sautgeit`** | `SD1` | `477, 1245` | `+5,580 m`* | `100` | `dalab-post` (`?post=sautgeit`): Heated gallery guardhouse at Crest Road Tunnel South Portal (*raw 2 km cell `+8,052 m`*) |
| **`Blaktol`** | `SD3` | `441, 1400` | `+3,653 m` | `25` | Built inside **`settlements/blakhed`** ([`blakhed/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/blakhed/PLAN.md)): Dalab stair-head customs house |
| *`Nazar` (`s3i61t95z5`)* | `ND5` | `582, 1079` | `+466 m` | `0` | Open-world `kits/ancients` + `KSHELL` Ordinator-quarantined megacity ruin field (`ancient-biogel` cryo-vaults) |
| *`Chimes` (`s4fnuph33n`)*| `SD2` | `468, 1392` | `+243 m` | `0` | Open-world ruined Station #6 arcology at `Chimes Riba` gorge lip in `openworld/dalab-rift-line` |

### 1d. Town Rings & the `476`-Hamlet Network (`187,775` Pop = `58.68%`)

Built once in **`core/hamlet/22-hamlet-dalab.js`** (`[G data]`, [`DALAB-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/core/region/DALAB-SCOPE.md) §3.2):
- `174 × dalab:chinampa` (`ND1` `84`, `SD1/SD2` `90`), `109 × dalab:levee` (`ND4` `64`, `SD1/SD2` `35`, `ND5` `10`), `123 × dalab:bench` (`ND2` `54`, `ND3` `27`, `SD2` `24`, `ND5` `18`), `42 × dalab:ranch` (`ND2` `22`, `ND4` `12`, `ND3` `8`), and `28 × dalab:works` (`SD1` `12`, `ND4` `8`, `ND5` `7`, `SD3` `1` **`Skarnpit`** at `416, 1377`).
- Audited visually via a compact **`settlements/dalab-hamlets`** showcase page (`5` archetypes side-by-side + `Skarnpit` preset) before streaming all `476` across the 5 `openworld/dalab-*` cuts.

### 1e. Neighbours & Border Seams Appearing on Dalab Open-World Cuts

- **`Frogmen` (`FM1–FM4`, `11,500` pop):** `Jrrmiah` (`557, 959` wet pin -> **nudge to dry tarn shore `555, 957` at `+2,928 m` or `557, 958` at `+2,985 m`**), `Grrmp-Sump` (`554, 955`), `Brrml-Silk` (`552, 977`), `Trrmb-Pillar` (`574, 1015`), `Vrrm-Reed` (`580, 1023`), and `Krrmt` (`643, 1023`, `1,500` pop). Requires `peoples.json` `"frogmen"` registration + `kits/frogmen` wetland pile-lodge & karst-sump kit (`DALAB-SCOPE.md` §3.2).
- **`Tungang Union` (`TU1–TU2`, `20,000` connected):** **`Loj Tuu` (`3,500` inside `Shelf` 50/50 arcology & N spiral bores)**, `Loj Twenny` (`2,000` at `445, 1266` / `457, 1269`), **`Loj Fower` (`5,000` inside `Ledge` 50/50 arcology, lifts & S2 tunnels)**, `Loj Fayv` (`250` under `Nulab`), and `492, 1255` cave saltpeter works — uses `kits/tungang`.
- **`Fellgangs` (`FG1`):** `Blakhed` (`441, 1400`, `5,000` pop) at the south tip of `openworld/dalab-rift-line`.

---

## 2. Proposed `openworld/dalab-*` Regional Cuts (`openworld/SITES.json`) & Shared `?town=` Architecture

### 2.1 Five Scale Model 5.1 Open-World Regional Cuts (`500 m/cell` Option C Super-Res)

Every cut below was verified by `scan_dalab_capital_and_regions.py` (`<= 25,284` map pixels, well below `extract_region.py`'s `180,000 px` threshold, so **all five build at `--upsample 4` = `500 m/cell`**):

| `openworld/` Slug | 5.1 Pixel Box `[x0..x1, y0..y1]` | Size (`km`) & Area | `500 m` Grid (`upsample 4`) | Elev Range & Water `%` | Biome Kits (`KITS`) | Hosted Settlements & Hamlets |
|---|---|---|---|---|---|---|
| **`dalab-dadem-ring`** | `[456..516, 1060..1138]` (`60 × 78 px`) | `120 × 156 km` (`18,720 km²`) | `240 × 312` (`74,880` cells), origin `(972000, 2198000)` | `-579..+1,037 m` (`42.0%` water) | `swlowlands`, `swhighlands` | **`Dalab`**, **`Dapor`**, `Konwel`, `Riidom`, `Grinmach`, `Asfol`, `Okeben`, `Tonbruk`, `Konbruk` + **`84` `ND1` `KHAMLET`s** (`78,000` pop) |
| **`dalab-west-benches`**| `[390..466, 1045..1136]` (`76 × 91 px`) | `152 × 182 km` (`27,664 km²`) | `304 × 364` (`110,656` cells), origin `(856000, 2181000)` | `-28..+6,471 m` (`1.4%` water) | `swlowlands`, `swhighlands`, `wouterwall` | **`Nufelds`**, **`Rokwal`**, `Brodbruk`, `Waitbruk`, `Windbruk`, `Kleibruk`, `Aianwal` + **`76` `ND2` `KHAMLET`s** (`47,000` pop) |
| **`dalab-east-lowlands`**| `[504..626, 1072..1176]` (`122 × 104 px`)| `244 × 208 km` (`50,752 km²`) | `488 × 416` (`203,008` cells), origin `(1130000, 2248000)` | `-671..+3,109 m` (`55.2%` water) | `swlowlands`, `swhighlands` | **`Dayshun`**, **`Daranch`**, `Klirbruk`, `Pirlafod`, `Midmar`, `Dafiri`, `Koleben`, `Istgeit` + **`84` `ND4` `KHAMLET`s** (`59,000` pop) |
| **`dalab-north-march`** | `[444..590, 1002..1086]` (`146 × 84 px`) | `292 × 168 km` (`49,056 km²`) | `584 × 336` (`196,224` cells), origin `(1034000, 2088000)` | `-507..+4,108 m` (`9.3%` water) | `swlowlands`, `swhighlands` | **`Span`**, `Panfod`, `Geitbruk`, **`Blade`**, `Beisngeit`, `Nazawach`, *`Nazar` ruin*, `Trrmb-Pillar`/`Vrrm-Reed` (`FM2`) + **`35` `ND5` `KHAMLET`s** (`23,000` Dalab) |
| **`dalab-rift-line`** | `[410..508, 1148..1406]` (`98 × 258 px`) | `196 × 516 km` (`101,136 km²`) | `392 × 1032` (`404,544` cells), origin `(918000, 2554000)` | `-1,999..+11,132 m` (`2.5%` water) | `swhighlands`, `riftrim`, `rift` | **`Shelf` (`50/50`)**, `Windrib`, `Mistibruk`, `Borgeit`, `Salpita` + Crest/Rift bores + `Loj Twenny` + **`Ledge` (`50/50`)**, `Sautgeit`, **`Nulab`**, `Kouldmauf`, `Chimsfod`, `Silbabruk`, `Kopafol`, *`Chimes`*, `Skarnpit`, `Blaktol`/`Blakhed` + **`197` `ND3`+`SD` `KHAMLET`s** (`113,000` Dalab + `20,000` Tungang) |

### 2.2 Parameterized `settlements/dalab-town` (`?town=<id>`) Architecture

Rather than maintaining 28 separate folders for `2,000–4,600`-pop market towns, **`settlements/dalab-town`** follows `settlements/xanadu-lake`:
1. Reads the town's record (`px, py`, `pop`, `giants2a`, `giants4a`, `preset`, `works`, `roads`, `river`/`lake` vector) directly from `core/region/data/dalab-tune.js`.
2. Samples real `500 m/cell` ground from the matching `openworld/dalab-*` `region.json` + `elev.png` via `core/world`.
3. Runs **`KCITY`** (`core/city`) using one of `10` deterministic layout presets (`harbour-bluff`, `polder-chinampa`, `bench-market`, `river-terrace`, `harbour-cove`, `quarry-bench`, `colliery-quay`, `shire-seat`, `highland-fort-town`, `breeding-ranch`, `estuary-port`, `smelter-ford`, `smelter-bench`) centered on a neighborhood ceremonial mound (`dalab_mound` facing `Dalab` `477, 1108`!), a `DPAL.god` deacon's shrine + `guildhall`, a `4.2 m`-portal Giant bailiff barracks, and `180–420` `dalab_kit.py` residential and trade lots (including `dalab_biogel_vat` in shire/market seats).

---

## 3. Kit Gaps & `kits/crops` / `peoples.json` Additions Needed First

| Area | Missing Today | Built In |
|---|---|---|
| **Dalab Kit (`settlements/dalab/src`)** | `12` missing `DALAB_TRADES` pieces + **`dalab_biogel_vat` (crop-to-`inferior-biogel` conversion court)** + `dalab_chinampa_stead` + `dalab_lake_barge` + `dalab_embassy_xanadu` + `vpArchGeo` porch doorway fix + `dalab_kit.py` exporter ([`dalab/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/dalab/PLAN.md) §2.4) | **Wave 0 (`Session 0A`)** |
| **South/North Specialized Works** | `dalab_smelter` (fireclay-crucible copper/bronze roasting & casting shed for `Kopafol`/`Chimsfod`/`Ledge`), `dalab_colliery_staithe` (`Konbruk`/`Koleben`), `dalab_lizard_corral` (`Daranch`) | **Wave 0 (`Session 0A`)** |
| **`core/hamlet` Dalab Culture** | `core/hamlet/22-hamlet-dalab.js` (`dalab:chinampa`, `dalab:levee`, `dalab:bench`, `dalab:ranch`, `dalab:works` — `476` hamlets) + `node core/hamlet/test-hamlet.js` assertions | **Wave 0 (`Session 0B`)** |
| **`kits/crops` Biome Zones** | `swhighlands`, `riftrim`, and `ancientsvalley` absent from `CROPS.BIOMES`; `swlowlands` `atm` should reflect `dense` (`1.5–1.6 atm`) on `< 800 m` plains | **Wave 0 (`Session 0B`)** |
| **`core/charactermodels` Frogmen & Giants** | Register `"frogmen"` in `peoples.json` (`mod_head_frog` + `mod_legs_frog`, bog-olive wet skin, `beadcone-silk` wrap); optional `mpfb_giant_female` morph for `Daranch`/`Nulab` | **Wave 5 (`Session 5B`)** |

---

## 4. Multi-Wave Session-by-Session Build Order (`Wave 0` – `Wave 5`)

| Wave & Session | Deliverable | Verification |
|---|---|---|
| **Wave 0A — Shared Dalab Kit Closure** | Fix `75-port-embassy.js` (`vpArchGeo`), sync `63`/`76`, add all `15` pieces in `dalab/PLAN.md` §2.4 (incl. `dalab_biogel_vat`) + `dalab_smelter`/`colliery_staithe`/`lizard_corral`, export `dalab_kit.py`, rebuild `dalab-set.html` & check `Span` | `build.py --kit` + `verify.py --assert` (`0` missing Voth trades) |
| **Wave 0B — `22-hamlet-dalab.js`, `CROPS` & `dalab-tune.js`** | Write `core/hamlet/22-hamlet-dalab.js` (`5` archetypes, `476` hamlets), add `swhighlands`/`riftrim` to `kits/crops`, and land `core/region/data/dalab-tune.js` (`ancient-biogel` vs `inferior-biogel`, `clay`, 50/50 `Shelf`/`Ledge`) + `52-region-dalab.js` (`DL0–DL5`) | `node core/region/tests/test-dalab.js` (`ΔPop = 0`) + `test-crops.js` + `dalab-hamlets` sheet verify |
| **Wave 1 — Capital `Dalab` 5.1 Port (`D1–D6`)** | Extract `openworld/dalab-dadem-ring`; rebuild `settlements/dalab` (`dalab.html` + `dalab-site.html`) at `(477, 1108)` on `core/world` + `KCITY` + `KHAMLET` + `SIM`; fix `swlowlands/glossy` `< 165k` | `settlements/dalab/verify.py --assert` (`SURVEY` green, zero `capWhy`) |
| **Wave 2 — Five `openworld/dalab-*` Cuts** | Register and extract `dalab-dadem-ring`, `dalab-west-benches`, `dalab-east-lowlands`, `dalab-north-march`, and `dalab-rift-line` in `openworld/SITES.json`; stream `476` `KHAMLET`s, roads, rivers, lakes, and `Nazar`/`Chimes` ruins | `verify.py --assert` on each open-world cut (`KCOAST`, `KWATER`, `KLOD` budgets green) |
| **Wave 3 — `settlements/dalab-town` (`28` Towns)** | Build parameterized `settlements/dalab-town` (`?town=dapor`, `?town=daranch`, `?town=nufelds`, `?town=kopafol`, etc.) covering all `28` remaining market towns (`72,900` pop) | Smoke + `--assert` across representative presets (`dapor`, `riidom`, `daranch`, `rokwal`, `konbruk`, `chimsfod`) |
| **Wave 4 — Four Regional Hubs (`Shelf`, `Dayshun`, `Nulab`, `Ledge`)** | **4A:** `settlements/shelf` (`7k` 50/50 Dalab–Tungang Rim Arcology & Station #2). **4B:** `settlements/dayshun` (`8,500` Shumari-Dalab hybrid city). **4C:** `settlements/nulab` (`10k` Great Lake city per `nulab/PLAN.md`). **4D:** `settlements/ledge` (`10k` 50/50 Dalab–Tungang cliff arcology + `Loj Fower` lifts per `ledge/PLAN.md`) | Dedicated `verify.py --assert` (`SURVEY`) on each of the 4 hub cities |
| **Wave 5 — Forts, Bores & `Frogmen` Border** | **5A:** `settlements/blade` (`900` rim quarantine hold) + `settlements/dalab-post` (`7` bore/border posts). **5B:** `"frogmen"` in `peoples.json` + `kits/frogmen` + `settlements/jrrmiah` (`555, 957` dry tarn shore) & `krrmt` (`643, 1023`) | Full `python3 tools/test_all.py` + `EAST_RIFT` <-> `DALAB_TUNE` live Great Caravan join check |

---

## 5. `dalab-tune.js` Contract & Open Owner Questions

### 5.1 Single-Source Tune Contract

Every Dalab build (`dalab`, `dalab-town`, `dalab-post`, `dayshun`, `shelf`, `ledge`, `nulab`, `blade`, and all 5 `openworld/dalab-*` cuts) reads its population, Giant counts, crop/resource works, and road/barge connections from **`core/region/data/dalab-tune.js`** — never hardcoded numbers inside a `src/` fragment — so tuning an economic rate or town headcount updates `SIM` and `KCITY` lot counts together.

### 5.2 Concise Owner Questions

1. **Five Open-World Cuts vs Merged North Basin:** Keep `ND1` (`dalab-dadem-ring`), `ND2` (`dalab-west-benches`), and `ND4` (`dalab-east-lowlands`) as 3 focused `500 m/cell` (`upsample 4`) cuts, or also offer a `1 km/cell` (`upsample 2`) unified `dalab-lake-basin` overview cut?
2. **`Daranch` (`4,600` Pop) Standalone vs Preset:** Is the `breeding-ranch` preset inside `settlements/dalab-town?town=daranch` sufficient, or should `Daranch` (`Giant` + giant-lizard breeding seat) get its own standalone `settlements/daranch` folder in Wave 4?
3. **Dry Pin Nudge for `Jrrmiah` (`sfuf85wred`):** Confirm nudging `Jrrmiah` `1–2 px` from wet tarn pixel `(557, 959)` (`wlev = +2,878 m`) to dry tarn-shore `(555, 957)` (`+2,928 m`) or `(557, 958)` (`+2,985 m`) on the next `60-settlements.js` pass.
