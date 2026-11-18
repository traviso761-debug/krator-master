# The Lizardman Polygon (`rmufwmqdl9qjf`): Hinterland Census, Minor Settlements, Hamlets & Coil Road Network (scope, 2026-11-17)

The owner, 2026-11-17: *"also, let's scope the lizardman polygon for its hamlet and small settlement + road network similar to
the xanadu census"*.

Modeled directly on `core/simulation/PROPOSAL-XANADU.md` and `settlements/xanadu/BUILD-OUT.md`, this document scopes every level
of settlement and transport inside the **Lizardmen political polygon (`rmufwmqdl9qjf`)** on scale model **5.1** (`2 km/px`),
reconciling `LZ_TUNE` (`core/region/data/lz-tune.js`, `59,500` Lizardmen) with the actual raster heights (`h.png`), water mask,
rivers (`rivers.json`), and mineral/placer nodes (`kits/resources/data/geology.json`). Every proposed coordinate below has been
verified dry (`wet = false`) and low-slope on `h.png`. Everything not fixed by the owner or `LZ_TUNE` is *proposed* (questions in
section 7).

---

## 1. The Polygon & Population Reconciliation

### 1.1 Physical footprint of `rmufwmqdl9qjf` on 5.1
- **Polygon:** 12 vertices spanning `px 565–882 x 1417–1675` (`634 x 516 km`), area **`176,596 km²`** (`44,149` cells):
  - **Dry land:** `35,354` cells = **`141,416 km²`**
  - **Water (`35,180 km²` inside polygon):**
    - **Eastern Terminal Sea** (*"the Lizardman Rift Sea"*): `9,272 km²` (`px 758–873 x 1579–1616`, `-2,600.5 m`, salt, no tide).
    - **Western Terminal Sea** (eastern & central reaches inside polygon): `~23,600 km²` of its `29,472 km²` (`px 508–699 x 1431–1580`, `-2,600 m`, salt) — **cuts diagonally NW–SE right across the western cluster**, separating Gila/Skink on its NE side from The Tubes on its SW side.
    - **Gila's Lake:** `2,304 km²` (`px 636–677 x 1479–1512`, `-1,723 m`, hypersaline soda/salt lake).
- **Elevation & habitat bands (`141,416 km²` dry):**
  - **Abyssal floor & sabkhas (`-2,600` to `-2,400 m`, `10,256 km²`, `2.15–2.21 atm`, `XA` `35–36 °C`):** Basilisk, Komodo, the two terminal-sea strands, Nahr ash-Shalālāt's cataract delta (`1,180 m³/s`).
  - **Salt basins & volcanic savannas (`-2,400` to `-1,500 m`, `29,168 km²`, `1.95–2.10 atm`, `XV` `28–31 °C`):** Tuatara, Gila, Skink, Tkyoob Warra's lower bench.
  - **Scarp benches (`-1,500` to `-500 m`, `33,732 km²`):** transition ramps, Muckle Weyt Beck's lower placer gorge, Tyan Warra.
  - **Pile plateau & Tubes uplands (`-500` to `+100 m`, `17,012 km²`, `1.62–1.68 atm`, `Af / Cfa / Csa` `21–23 °C`):** Iguana's prime farmland (`0.3 %` slope), the Pile (`Loj Nahn`, ~`1,000` Tungangs besieged in the upper levels), The Tubes (`-77 m`).
  - **Rim cliffs & high scarps (`> +100 m`, `51,248 km²`):** *"too high for the Lizardmen to venture comfortably"* (`LORE.md` 6.20) — uninhabited save raid passes toward Xanadu's Marches (`818,1531`; `843,1546`; `853,1540`).

### 1.2 Reconciling the numbers (`LZ_TUNE` vs Gemini vs Lore)

| Tier | `LZ_TUNE` (`59,500` total) | How this census distributes them on the map |
|---|---|---|
| **1. Capital (`1`)** | **15,000** (`Basilisk`) | `settlements/basilisk` (`766.6,1597.25`): 7 stone districts + Mound + Gate Quarter (`15,337` beds) |
| **2. Towns & villages (`6`)** | **14,500** (`Tuatara`, `Komodo`, `Gila`, `Iguana` `3,000` each; `Skink` `1,500`; `The Tubes` `1,000`) | 5 built & GPU-verified (`gila`, `tuatara`, `iguana`, `komodo`, `skink`); `tubes` on hold. Each town's page already includes 1–2 immediate outworks |
| **3. Town hinterland rings (`29` hamlets)** | **~5,280** *(drawn from the `30,000` warrens, as Xanadu draws `pherRing` / `ksRing` from `prov.rural`)* | `KHAMLET.village` (`core/hamlet/lizardmen`, `120–240` each) within `3–18 km` of the 7 seats (section 3; 5 already built on town pages) |
| **4. Named minor settlements & works (`26` sites)** | **~7,420** *(drawn from the `30,000` warrens)* | Shore fishing villages, river-mouth placer camps, savanna cistern warrens, ferry slips, and frontier raid camps (`150–550` each, section 4) |
| **5. Coil Round staging halts (`24` halts)** | **~720** *(~30 Drovers/Tenders per halt)* | `lz-wayhalt` stations spaced every `~20–25 km` (one day's sledge march) on dry land corridors (section 5) |
| **6. Dispersed bulk warrens (8 sub-districts)** | **~16,580** remaining in bulk (`30,000 - 13,420`) | Never drawn singly (seeded camera sample on openworld cuts, as Xanadu Wave 8); replaces the single water-bound centroid `warrens-west` (`630,1515` stands in `-2,600 m` sea water!) with 8 dry sub-districts (section 2) |
| **Total Lizardmen** | **59,500** (`~0.66 / km²` habitable below `+100 m`) | Plus **~1,000 Tungangs** in **Loj Nahn** (`slonhq0jgv`, `720,1567`, upper Pile) and **120 seasonal Xanadui** at `exp.rift-gold` (`850,1628`) |

---

## 2. The Eight Warren Sub-Districts (replacing the two bulk centroids)

In `LZ_TUNE` today, `warrens-east` (`18,000` at `805,1570`) and `warrens-west` (`12,000` at `630,1515` — **a wet cell in the middle
of the Western Terminal Sea**) are single abstract bulk settlements. Splitting them into **eight dry geographic sub-districts** (four
on the East Loop = `18,000`, four on the West Loop = `12,000`, mirroring Xanadu's `p1`–`p8` provinces) fixes the underwater
centroid, keeps every actor on dry land, and anchors every minor village to its local seat:

| Id | Sub-district (Coil loop) | Hub / Seat | Verified dry centroid (`5.1 px`, elev) | Total rural (`LZ_TUNE`) | Named rings + villages + halts | Bulk remainder | Primary ground & surplus |
|---|---|---|---|---|---|---|---|
| **E1** | **Basilisk Sabkha & South Strand** (East) | Basilisk | `774, 1605` (`-2,599 m`, `0.2 %`) | **6,500** | 6 ring (`1,180`) + 4 shore (`1,350`) + 4 halts (`120`) | 3,850 | `XA` alluvial apron (`r762`, `r066`, `r191`): `bamboo-rice`, `taro`, bay fish, tin gravel |
| **E2** | **Tuatara Volcanic Savanna** (East) | Tuatara | `812, 1564` (`-1,910 m`, `1.4 %`) | **4,500** | 4 ring (`760`) + 3 savanna (`800`) + 3 halts (`90`) | 2,850 | `XV` volcanic bench: `ashmillet`, `sorghum`, hexapod herds, copper/sulfur veins |
| **E3** | **Komodo & Cataract Shore** (East) | Komodo | `858, 1608` (`-2,540 m`, `1.8 %`) | **3,500** | 4 ring (`740`) + 4 shore (`1,220`) + 4 halts (`120`) | 1,420 | `XA` hyper-wet shore (`4,000 mm`) & Nahr ash-Shalālāt plunge (`1,180 m³/s`): drift-timber, fish, placer tin |
| **E4** | **North Strand & Battery Coast** (East) | Basilisk / Tuatara | `778, 1579` (`-2,599 m`, `0.1 %`) | **3,500** | 3 river/galvanic (`850`) + 3 halts (`90`) | 2,560 | Perennial mouths of `r249` & `r207` (jungle charcoal for `lk-bronzehall`) + galvanic ochre/vitriol strand (`801,1576`) |
| **W1** | **Pile Plateau & Beck Rim** (West) | Iguana | `718, 1578` (`-245 m`, `0.5 %`) | **3,500** | 4 ring (`760`) + 3 plateau (`850`) + 3 halts (`90`) | 1,800 | Prime `Af/Cfa` tableland (`rice`, `helix-bean`, `ashroot`) + `r202` cassiterite gorge |
| **W2** | **Gila Salt-Basin & Skink Corridor** (West) | Gila / Skink | `664, 1492` (`-1,580 m`, `1.6 %`) | **4,000** | 7 ring (`1,220`) + 5 lake/beck (`1,250`) + 3 halts (`90`) | 1,440 | `XV` lake deltas (`r866`, `r215`, `r140`): `ashmillet`, lakecake skimmers, potash/gypsum |
| **W3** | **Tkyoob Bench & Tubes Mouths** (West) | The Tubes | `618, 1554` (`-1,890 m`, `3.8 %`) | **2,500** | 4 ring (`620`) + 3 river/ferry (`750`) + 2 halts (`60`) | 1,070 | `r052` (`98.5 m³/s`) & `r369` alluvial benches + Western Sea SW ferry landing |
| **W4** | **South-Sea Return Apron** (West) | Iguana / Tubes | `661, 1572` (`-1,590 m`, `4.2 %`) | **2,000** | 1 river terrace (`350`) + 2 halts (`60`) | 1,590 | Southern dry-land bypass south of the Western Terminal Sea (`r086`, `r211`) |
| **All** | **8 sub-districts** | | | **30,000** | **29 rings + 26 villages + 24 halts = `13,420`** | **16,580** | Exact match to `LZ_TUNE` (`18,000` East + `12,000` West) |

---

## 3. Town Hinterland Rings (`core/hamlet/lizardmen`, 29 hamlets)

Just as Erehwon, Qiblai, Phēr and Kirstabal each carry a ring of 4–6 `KHAMLET.village` outworks (`145–240` people), each of the
seven Lizardman seats has a ring of `core/hamlet/lizardmen` outworks within `3–18 km`. **Five are already built and GPU-verified**
on the settlement pages:

| Seat | Ring id | Focus | Offset / `5.1 px` | Pop | State & role |
|---|---|---|---|---|---|
| **Basilisk** (`766.6,1597.25`) | `bs.ring.salt` | `salt` | NW strand (`765.8,1596.9`) | 180 | **in `basilisk_plan.json`**: 3 `gl-pans`, 2 `lk-boil` (`55 t/yr`) |
| | `bs.ring.bay` | `fishing` | E bay (`767.4,1597.1`) | 190 | **in `basilisk_plan.json`**: 3 `lz-weir`s, `lz-barge` moorings |
| | `bs.ring.tlahn-dam` | `farming` | SE check dam (`768.2,1598.6`) | 220 | *proposed*: Tlahn Gill weir keepers & `bamboo-rice` bunds |
| | `bs.ring.south-paddy` | `farming` | S apron (`766.4,1599.4`) | 240 | *proposed*: southern `taro` & `shade-manioc` paddies |
| | `bs.ring.west-paddy` | `farming` | WSW apron (`764.2,1598.1`) | 210 | *proposed*: west-road `bamboo-rice` estate |
| | `bs.ring.sabkha-herd` | `ranch` | SW margin (`765.0,1599.8`) | 140 | *proposed*: burden-beast & frilled-lizard stockyards for the South Gate |
| **Tuatara** (`818,1554`) | `tuatara.diggings` | `mine` | `[-2100, -1450]` (`817.0,1553.3`) | 210 | **built** (`tuatara.html`): copper & sulfur shafts |
| | `tu.ring.east-lode` | `mine` | `820.2, 1554.8` | 180 | *proposed*: eastern malachite/copper surface pits |
| | `tu.ring.neet-wadi` | `farming` | `816.5, 1556.8` | 220 | *proposed*: flood-recession `ashmillet` along Neet Gill (`r754`) |
| | `tu.ring.north-herd` | `ranch` | `818.4, 1551.6` | 150 | *proposed*: savanna grazing & warband baggage beasts |
| **Komodo** (`865,1617`) | `komodo.placers` | `mine` | `[11381, -2200]` (`870.7,1615.9`) | 210 | **built** (`komodo.html`): Kruk Warra (`r088`) tin & gold sluices |
| | `km.ring.west-weir` | `fishing` | `862.4, 1616.5` | 180 | *proposed*: sheltered cove weirs & reed-barge slip |
| | `km.ring.bluff-rice` | `farming` | `866.2, 1618.8` | 200 | *proposed*: terraced `bamboo-rice` & `taro` above the monsoon strand |
| | `km.ring.quarry` | `quarry` | `864.1, 1618.2` | 150 | *proposed*: basalt plinth quarry against `4,000 mm` runoff |
| **Iguana** (`713,1569`) | `iguana.farm` | `farming` | `[-3000, 1400]` (`711.5,1569.7`) | 210 | **built** (`iguana.html`): west-plateau `rice` & `helix-bean` |
| | `iguana.placer` | `mine` | `[-4460, -2320]` (`710.8,1567.8`) | 174 | **built** (`iguana.html`): Muckle Weyt Beck (`r202`) upper tin sluices |
| | `ig.ring.north-grain` | `farming` | `713.4, 1566.2` | 220 | *proposed*: northern plateau `rice` & windmill ridge |
| | `ig.ring.pile-cordon` | `ranch` | `716.8, 1568.4` | 156 | *proposed*: eastern baggage herd & night-gleaners' forward post `6.4 km` W of the Pile |
| **Skink** (`691,1521`) | `skink.pans` | `salt` | `[820, 3260]` (`691.4,1522.6`) | 210 | **built** (`skink.html`): south-basin salt-lake `gl-pans` |
| | `sk.ring.halite` | `mine` | `689.6, 1520.2` | 160 | *proposed*: western rock-salt dome adits (`halite` 254) |
| | `sk.ring.savanna` | `farming` | `692.8, 1519.8` | 170 | *proposed*: dry-farmed `ashmillet` & `pulse` bench |
| **Gila** (`653,1485`) | `gl.ring.west-pans` | `salt` | `651.2, 1485.8` | 200 | *proposed*: outer spit evaporite & potash pans |
| | `gl.ring.skimmers` | `fishing` | `654.6, 1486.2` | 170 | *proposed*: `lz-skimmer` lakecake harvest on the sheltered east bay |
| | `gl.ring.crest-farm` | `farming` | `653.5, 1482.8` | 220 | *proposed*: upland `ashmillet` & windmill crest north of the lake |
| | `gl.ring.quarry` | `quarry` | `650.8, 1484.1` | 150 | *proposed*: basalt & brick-clay pit |
| **The Tubes** (`608,1547`) | `tb.ring.sea-weir` | `fishing` | `613.8, 1542.4` | 180 | *proposed*: Western Terminal Sea shore fishery (`15.6 km` NE, `40 t/yr` fish) |
| | `tb.ring.spore-vents` | `farming` | `607.2, 1548.1` | 160 | *proposed*: collapse-sinkhole `pale-fungi` beds (`lz-fungus`) |
| | `tb.ring.salvage` | `quarry` | `608.8, 1546.4` | 140 | *proposed*: Ancient transit-tunnel basalt & relic sorting camp |
| | `tb.ring.herd` | `ranch` | `606.4, 1545.8` | 140 | *proposed*: dry `Csa` upland frilled-lizard pens |

---

## 4. Named Minor Settlements, Shore Villages & Resource Camps (26 sites)

Analogous to Xanadu's `T.lake`, `T.lowerLake`, mines and watch forts (`BUILD-OUT.md` §1b–1e), these **26 minor settlements**
(`150–550` people each, `7,420` total) occupy the polygon's perennial river mouths, high-grade mineral nodes, ferry narrows, and
raid passes. Because Lizardman speech is tonal hissing without human exonyms (`LORE.md` 6.20), records carry descriptive English /
Tungang-river working names (as *"the Tubes"* and *"Muckle Weyt Beck"* already do):

### 4a. Eastern Terminal Sea ("Lizardman Rift Sea") shore & river mouths (9 sites — `2,970` people)
Like Xanadu's Lake Atitlán ring in miniature, **paddled `lz-barge`s** link these calm salt-sea river mouths to Basilisk's Lothal dock:

| Id | Working name | `5.1 px` (verified dry) | Elev / slope | People | Sub-dist | River / node | Role & annual trade |
|---|---|---|---|---|---|---|---|
| `lz.v.blek-mouth` | **Blek-Mouth** | `758, 1594` | `-2,600 m`, `0.0 %` | 420 | E4 | `r249` Blek Beck (`15.3 m³/s`) | Perennial freshwater delta `18 km` NW of Basilisk: **jungle charcoal kilns & barge timber** feeding `lk-bronzehall` and `lk-boil` |
| `lz.v.stuan-mouth` | **Stuan-Mouth** | `761, 1580` | `-2,600 m`, `0.0 %` | 380 | E4 | `r207` Stuan Warra (`22.3 m³/s`) | NW sea corner where the Shore Road turns east: freshwater supply, `lz-weir` fishery, charcoal barges south to Basilisk (`36 km` by water) |
| `lz.v.battery-strand` | **Battery-Strand** | `801, 1576` | `-2,599 m`, `0.0 %` | 250 | E4 | galvanic vent (`801,1573`) | Tenders & Makers `22 km` E of `reliquary-east` (`biomes/galvanic/PLAN.md`): harvests **iron-ochre for oxblood lacquer** and green/blue vitriols |
| `lz.v.north-strand` | **North-Strand** | `835, 1582` | `-2,599 m`, `0.0 %` | 300 | E3 | north sea shore | Mid-shore `lz-weir` fishing village & barge landing where the Tuatara–Komodo road meets the sea |
| `lz.v.cataract-foot` | **Cataract-Foot** | `864, 1594` | `-2,599 m`, `1.8 %` | 520 | E3 | `Nahr ash-Shalālāt` (`1,180 m³/s`) | Below the last cataract where Xanadu's great outflow plunges into the Rift Sea: **massive drift-timber catch booms**, giant river-mouth `lz-weir`s, and a watch on the Cataracts gorge |
| `lz.v.leet-mouth` | **Leet-Mouth** | `857, 1617` | `-2,490 m`, `4.8 %` | 350 | E3 | `r145` Leet Beck (`32.6 m³/s`) | `16 km` W of Komodo: secondary cassiterite `lz-placer` sluices and `bamboo-rice` terraces |
| `lz.v.tlahn-beck` | **Tlahn-Mouth** | `841, 1611` | `-2,596 m`, `0.6 %` | 300 | E1 | `r182` Tlahn Beck (`25.4 m³/s`) | South-shore perennial delta: `taro`, `bamboo-rice` and barge halt halfway on the Komodo–Basilisk south road |
| `lz.v.methera-mouth` | **Methera-Mouth** | `803, 1605` | `-2,599 m`, `0.4 %` | 300 | E1 | `r191` Methera Beck (`23.8 m³/s`) | South-shore fishery & `lz-orchard` pod groves `74 km` E of Basilisk |
| `lz.v.garth-placer` | **Garth-Placer** | `791, 1603` | `-2,599 m`, `0.0 %` | 450 | E1 | `r066` Garth Warra (`63.8 m³/s`), high tin `790.7,1603.8` | Largest south-shore river (`63.8 m³/s`, `50 km` E of Basilisk) + **unworked high-grade tin placer** (`skink/PLAN.md` q.6 reserve) & irrigated `bamboo-rice` |

### 4b. Volcanic savanna & Xanadu frontier raid posts (4 sites — `950` people)

| Id | Working name | `5.1 px` (verified dry) | Elev / slope | People | Sub-dist | Feature | Role |
|---|---|---|---|---|---|---|---|
| `lz.v.neet-cistern` | **Neet-Cistern** | `816, 1568` | `-1,992 m`, `1.5 %` | 320 | E2 | `r754` lower wadi | `28 km` S of Tuatara on the shore road: five `lz-cistern`s, `ashmillet` fields and hexapod herds |
| `lz.v.sulfur-pits` | **East-Savanna Pits** | `827, 1558` | `-2,224 m`, `0.1 %` | 280 | E2 | high copper/sulfur nodes | `20 km` ESE of Tuatara on the Komodo descent: surface copper malachite & native sulfur diggings (`lz-mine`) |
| `lz.v.rim-watch` | **South-Rim Muster** | `820, 1546` | `-1,180 m`, `6.4 %` | 200 | E2 | `16 km` N of Tuatara | Permanent `lz-muster` & `lc-*` war-camp staging post under the Marches scarp (`14 km` from `march.s` and `prov.p8`) |
| `lz.v.tears-watch` | **Gold-Lode Watch** | `856, 1624` | `-2,190 m`, `5.8 %` | 150 | E3 | `22 km` SW of Komodo | Jungle `lz-lookout` & war-party camp watching the Golden Tears' seasonal camp (`exp.rift-gold` at `850,1628`, `14 km` W) |

### 4c. Pile plateau, scarp steps & southern rivers (4 sites — `1,200` people)

| Id | Working name | `5.1 px` (verified dry) | Elev / slope | People | Sub-dist | Feature | Role |
|---|---|---|---|---|---|---|---|
| `lz.v.scarp-foot` | **Scarp-Foot** | `742, 1588` | `-2,599 m`, `0.0 %` | 300 | W1/E1 | foot of the Pile ramp | Oasis & `lz-wayhalt` switchback base `52 km` WNW of Basilisk where sledges double-team burden beasts for the `2,200 m` climb onto the Pile's plateau |
| `lz.v.south-grange` | **South-Plateau Grange** | `722, 1582` | `-216 m`, `0.4 %` | 350 | W1 | flat plateau S of Pile | `28 km` SE of Iguana: `rice`, `sweet-potato` and `lz-windmill` village watching the Pile's south face |
| `lz.v.weyt-gorge` | **Weyt-Gorge Placer** | `701, 1564` | `-1,529 m`, `11.0 %` | 200 | W1 | `res:placer-tin:r202:5` | `27 km` WNW downstream of Iguana on Muckle Weyt Beck (`r202`): the high-grade lower cassiterite gravel bar backing `iguana.placer` |
| `lz.v.tyan-bench` | **Tyan-Bench** | `698, 1586` | `-1,075 m`, `9.5 %` | 350 | W4 | `r086` Tyan Warra (`52.8 m³/s`) | Perennial valley village on the Southern Return Road between The Tubes and Iguana |

### 4d. Gila basin, Skink corridor & Western Terminal Sea (9 sites — `2,300` people)

| Id | Working name | `5.1 px` (verified dry) | Elev / slope | People | Sub-dist | Feature | Role |
|---|---|---|---|---|---|---|---|
| `lz.v.pimp-ford` | **Pimp-Ford** | `670, 1495` | `-1,512 m`, `1.0 %` | 350 | W2 | `r140` Pimp Beck (`33.8 m³/s`) | Midpoint farming & `lz-wayhalt` village (`58 km` from Skink, `40 km` from Gila) where the West Coil crosses perennial `r140` |
| `lz.v.brant-mouth` | **Brant-Mouth** | `656, 1478` | `-1,735 m`, `1.9 %` | 280 | W2 | `r215` Brant Beck (`20.2 m³/s`) | `15 km` N of Gila on the north lake shore: fresh river water, reed beds (`36 t/yr` reed supply to Gila) and gardens |
| `lz.v.tkyoob-beck` | **Tkyoob-Delta** | `643, 1474` | `-1,739 m`, `1.3 %` | 340 | W2 | `r866` Muckle Tkyoob Beck (`51.8 m³/s`) | Largest inflow into the northern salt-lake chain (`29 km` NW of Gila): irrigated `ashmillet` & `pulse` granary of W2 |
| `lz.v.east-spit` | **East-Lake Pans** | `669, 1500` | `-1,717 m`, `2.1 %` | 180 | W2 | Gila's Lake SE shore | Potash & alkali crust scrapers (`geology.json` potash/alkali nodes) |
| `lz.v.west-shore` | **West-Lake Skimmers** | `642, 1495` | `-1,732 m`, `6.9 %` | 200 | W2 | Gila's Lake W shore | `lz-skimmer` lakecake presses on the western shore |
| `lz.v.narrows-ne` | **East-Narrows Slip** | `645, 1518` | `-1,610 m` -> strand | 220 | W2 | Western Sea NE narrows | Slipway & `lz-dockstore`-style reed store where West-Coil loads board `lz-barge`s for the **`66 km` calm-water crossing** to The Tubes (`lz.v.narrows-sw`), saving `380 km` of mountain detour! |
| `lz.v.narrows-sw` | **West-Narrows Slip** | `615, 1536` | `-2,599 m`, `1.7 %` | 230 | W3 | Western Sea SW narrows | Landing & `lz-weir` fishery `26 km` NE of The Tubes: receives Gila/Skink barges and sends `40 t` of sea fish up to The Tubes |
| `lz.v.tkyoob-ford` | **Tkyoob-Crossing** | `624, 1554` | `-2,090 m`, `5.1 %` | 300 | W3 | `r052` Tkyoob Warra (`98.5 m³/s`) | Largest river inside the Lizardman interior (`98.5 m³/s`, `35 km` SE of The Tubes): heavy timber/reed bridge, `lz-weir`s and floodplain farms |
| `lz.v.kopa-forks` | **Kopa-Forks** | `618, 1562` | `-1,931 m`, `4.1 %` | 200 | W3 | `r369` Kopa Warra (`33.7 m³/s`) | Confluence village where the Southern Return Road climbs out of the Tkyoob basin toward `lz.v.tyan-bench` and Iguana |

---

## 5. The Coil Road & Reed-Barge Network

In `LZ_TUNE`, every load rides its season's direction round its loop (`outward` in `wet1` & `dry1`, `inward` in `wet2` & `dry2`)
at `kmDay: 20` on Drover sledges (`lwSledge`). Mapping those abstract edges onto 5.1's real topography (`h.png` least-slope dry
paths, max grade `<= 20.5 %`) yields **two complete physical circuits**, **`24` `lz-wayhalt` day-march posts**, and **three calm-sea
`lz-barge` water links**:

### 5.1 Trunk Land Corridors & Staging Halts (`lz-wayhalt` every `~25–45 km`, `lz-waystone` every `~5 km`)

| Coil Loop & Leg | From -> To (`5.1 px`) | Real dry length | Max grade | Sledge days (`20 km/d`) | Intermediate villages & `lz-wayhalt` posts (`px`) |
|---|---|---|---|---|---|
| **East Loop 1** *(Shore Road N)* | **Basilisk** (`766.6,1597.3`) -> **East Reliquary** (`790,1578`) | **110 km** *(skirts sea's W head)* | `0.4 %` | 5.5 d | `lz.v.blek-mouth` (`758,1594`) -> `halt.e1` (`757,1586`) -> `lz.v.stuan-mouth` (`761,1580`) -> `halt.e2` (`775,1580`) |
| **East Loop 2** *(Savanna Climb)* | **East Reliquary** (`790,1578`) -> **Tuatara** (`818,1554`) | **81 km** | `7.7 %` | 4.0 d | `lz.v.battery-strand` spur (`801,1576`) -> `halt.e3` (`800,1573`) -> `halt.e4` (`810,1564`) |
| **East Loop 3** *(Cataract Descent)* | **Tuatara** (`818,1554`) -> **Komodo** (`865,1617`) | **206 km** | `12.7 %` | 10.5 d | `lz.v.sulfur-pits` (`827,1558`) -> `lz.v.north-strand` (`835,1582`) -> `halt.e5` (`850,1585`) -> `lz.v.cataract-foot` (`864,1594`) -> `halt.e6` (`871,1606`) |
| **East Loop 4** *(South-Shore Return)* | **Komodo** (`865,1617`) -> **Basilisk** (`766.6,1597.3`) | **214 km** | `5.3 %` | 10.5 d | `lz.v.leet-mouth` (`857,1617`) -> `lz.v.tlahn-beck` (`841,1611`) -> `halt.e7` (`823,1605`) -> `lz.v.methera-mouth` (`803,1605`) -> `lz.v.garth-placer` (`791,1603`) -> `halt.e8` (`779,1600`) |
| **West Loop 1** *(Plateau Ramp)* | **Basilisk** (`766.6,1597.3`) -> **Iguana** (`713,1569`) | **131 km** | `20.5 %` *(scarp switchbacks)* | 6.5 d | `halt.w1` (`754,1591`) -> `lz.v.scarp-foot` (`742,1588`) -> *Scarp Switchbacks* (`halt.w2` `731,1584`) -> `lz.v.south-grange` (`722,1582`) |
| **West Loop 2** *(Salt-Basin Descent)* | **Iguana** (`713,1569`) -> **Skink** (`691,1521`) | **114 km** | `7.4 %` | 5.5 d | `halt.w3` (`711,1555`) -> `halt.w4` (`704,1542`) -> `halt.w5` (`696,1531`) |
| **West Loop 3** *(Beck Corridor)* | **Skink** (`691,1521`) -> **Gila** (`653,1485`) + **West Reliquary** (`651.9,1486.7`) | **138 km** | `5.1 %` | 7.0 d | `halt.w6` (`681,1509`) -> `lz.v.pimp-ford` (`670,1495`) -> `halt.w7` (`661,1488`) |
| **West Loop 4a** *(Primary: Narrows Barge)* | **Gila** (`653,1485`) -> **The Tubes** (`608,1547`) | **82 km land + 66 km water** | `6.2 %` | **5.5 d** | Land `68 km` via `lz.v.west-shore` (`642,1495`) to `lz.v.narrows-ne` (`645,1518`), **`66 km` `lz-barge` ferry** to `lz.v.narrows-sw` (`615,1536`), land `26 km` to `The Tubes` |
| **West Loop 4b & 5** *(South Return Apron)* | **The Tubes** (`608,1547`) -> **Iguana** (`713,1569`) -> **Basilisk** | **248 km** *(to Iguana)* | `20.2 %` | 12.5 d | `lz.v.tkyoob-ford` (`624,1554`) -> `lz.v.kopa-forks` (`618,1562`) -> `halt.w8` (`642,1566`) -> `halt.w9` (`661,1572`) -> `halt.w10` (`681,1580`) -> `lz.v.tyan-bench` (`698,1586`) -> `Iguana` |

### 5.2 Paddled Reed-Barge Water Runs (`lz-barge`, `core/tags` `class: 'vessel'`, `45 km/day` in calm terminal-sea air, no sails)

> **Vessel tag requirement (the owner, 2026-11-17):** Every barge and boat across Lizardman settlements and open-world cuts (`lz-barge`
> in `kits/lizardmen/src/59w-lz-works.js`, `kits/lizardmen/settle/82-lzv-site.js`, `settlements/komodo`, and `basilisk_plan.json`)
> registers in `core/tags` as **`class: 'vessel'`** (`ves_*`) with Ring Sea vessel vocabulary (`types: ['cargo', 'barge', 'ferry']`,
> `propulsion: 'paddles'`, `hull: 'raft'`, `wealth: 'middle'`, `crew: 6`, `role: 'barge'`), riding along with the repo-wide `vessel`
> / `vehicle` rollout in the next all-builds rebuild (`TODO.md`).

1. **The Straight Ley Relic Run** (`Basilisk ley mole` -> `reliquary-east`, **`60.6 km` at `50.6°`**, `1.3 days`): **the sole straight
   transport route in the Lizardman country** (`basilisk/PLAN.md` q.8), carrying Iguana's Pile relics across the sea.
2. **The Eastern Sea Coastal Relay** (`Komodo` <-> `Leet` <-> `Tlahn-Mouth` <-> `Methera` <-> `Garth-Placer` <-> `Basilisk Lothal dock`,
   and `Stuan-Mouth` / `Blek-Mouth` -> `Basilisk Lothal dock`, `18–195 km`): carries Komodo's `8 t` tin concentrate, dried fish, and
   Blek/Stuan charcoal into Basilisk's `lk-dock` without bogging sledges in monsoon mud (obeying the Coil's seasonal cw/ccw turn!).
3. **The Western Sea Narrows Ferry** (`lz.v.narrows-ne` `645,1518` <-> `lz.v.narrows-sw` `615,1536`, **`66 km`**, `1.5 days`): bridges
   the `29,472 km²` Western Terminal Sea gulf between Gila and The Tubes, avoiding a `464 km` overland backtrack around the Pile.

### 5.3 Seasonal War-Band Raid Trails (`LZ_TUNE.raids`, foot only, `25 km/day`, no sledges)
- **Tuatara War Band (`150` caste 4+6):** climbs north from `lz.v.rim-watch` (`820,1546`) against `march.s` (`843,1546`, `46 km`),
  `march.w` (`818,1531`, `30 km`), `march.e` (`853,1540`, `67 km`), and the Marches' southern villages (`prov.p8`, `825,1541`, `14 km`).
- **Komodo War Band (`120` caste 4+6):** marches SW past `lz.v.tears-watch` (`856,1624`) against the Golden Tears' armed prospecting
  camp (`exp.rift-gold`, `850,1628`, `37 km` from Komodo) and climbs the SE rim passes.

---

## 6. Open-World Region Cuts (`openworld/SITES.json`)

The two planned regions in `openworld/SITES.json` divide cleanly along `px ~735` (the scarp between the Eastern Sea sabkha and the
Pile's plateau):
- **`lizardmen-east`** (`order: 8`): **Basilisk** (`slrodrkrls`, reach `30 km`), **East Reliquary** (`slzreliqe01`, `6 km`),
  **Tuatara** (`szv27b2reu`, `15 km`), and **Komodo** (`spnqhezhiw`, `15 km`), joined by `10 km` shore corridors (`Basilisk ->
  Reliquary -> Tuatara -> Komodo -> Basilisk`).
- **`lizardmen-west`** (`order: 7` — or split into `lizardmen-pile` + `lizardmen-west` if sub-continental cell size requires):
  **Iguana** (`slziguana01`, `15 km`, moved from `lizardmen-east` or shared as a gateway site like Thalaba), **Skink**
  (`slzskink01`, `12 km`, added at `691,1521`), **Gila** (`sze26pgivd`, `15 km`), **West Reliquary** (`slzreliqw01`, `6 km`), and
  **The Tubes** (`sa8xk6pimb`, `15 km`), joined by `10 km` corridors along `Iguana -> Skink -> Gila` and the Narrows ferry landings.

---

## 7. Questions for the Owner (answered 2026-11-17: all five agreed, with `class: 'vessel'` enforced on all barges & boats)

1. **Splitting the `30,000` warrens into 8 dry sub-districts (section 2):** Replace the two abstract centroids (`warrens-west` at
   `630,1515` currently sits in `-2,600 m` water of the Western Terminal Sea!) with the 8 geographic warren sub-districts (`E1`–`E4`
   = `18,000`, `W1`–`W4` = `12,000`) when Z3 / openworld lands? **Agreed:** yes.
2. **Western Sea Narrows reed-barge ferry (`66 km`, `lz.v.narrows-ne` <-> `lz.v.narrows-sw`):** The Western Terminal Sea cuts
   between Gila (`653,1485`) and The Tubes (`608,1547`), making a pure land walk `464 km` back around Iguana. Use paddled
   `lz-barge`s (`class: 'vessel'`) across the `66 km` narrows on the West Coil, with the `248 km` Southern Return Apron (`W4`)
   closing the loop back to Iguana? **Agreed:** yes.
3. **Cataract-Foot (`864,1594`, `520` people):** A Lizardman drift-timber and giant-weir village where Xanadu's `1,180 m³/s` Nahr
   ash-Shalālāt plunges into the Eastern Terminal Sea (catching Vale timber washed down the cataracts without trading with humans)?
   **Agreed:** yes.
4. **Naming minor warrens & river villages:** Keep English/Tungang geographic working names (`Blek-Mouth`, `Garth-Placer`,
   `Pimp-Ford`, as *"the Tubes"* and *"Muckle Weyt Beck"* do) since Lizardman speech is non-human tonal hissing? **Agreed:** yes.
5. **Region assignment of Iguana & Skink in `openworld/SITES.json`:** Keep `Iguana` + `Skink` on the `lizardmen-west` cut (since
   both sit on `LZ_TUNE.coil.loops.west`), with a `10 km` scarp corridor joining Iguana to `Basilisk` (`"also": ["lizardmen-east"]`)?
   **Agreed:** yes.
