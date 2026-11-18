# The Catch, its oases and the Twins: a fact survey for the sim proposal (2026-11-16)

Read-only survey of the worktree `claude/openworld-sites-24defd`. Paths are repo-relative. "px" is scale model 5.1 (2 km a
pixel; the legacy 4.2x canvas is 5.1 minus 272,330: `tools/scale-model/model/data/model.json` key `legacy_shift`).
Ground figures are sampled by me from `tools/scale-model/model/data` (h.png, tm.png, p.png, c.png, rivers.json,
basins.json) at the pin's pixel; resources from `kits/resources/data/geology.json` (4 km cells, bytes 0-255).
Distances are straight-line unless a route file is named. (The survey's scripts were throwaway and are not kept.)

The owner's brief (2026-11-16, relayed): northern caravaneers = the Geomancers, the Yuni Merchants' Guild, two rival Iziz
merchant noble houses, the Train of Jabal (operates the Catch salt works); Stair pop 750; other oases ~100 or less; and
(scope addition) integrate the Twins.

---

## 0. Conflicts and stale records found (read first)

| # | What | Where |
|---|---|---|
| 1 | **Stair's population**: the owner now says 750. The Catch plan and LORE say "a couple of hundred" (`biomes/catch/PLAN.md:161`, `LORE.md:84`, pin note). Gemini's trade model has Stair 250 (`tools/scale-model/gemini_trade_model.py:218`), its polity "Stair Divers (Catch)" 275 (`openworld/TRADE-GEMINI.md:147`). | |
| 2 | **"None is lived in but Stair's"** (the owner, 2026-10-23: `biomes/catch/PLAN.md:118-119`, `LORE.md:86`). The owner's new "~100 or less" for the other oases overrides this. Gemini gave Kolli 550, Arfwai 650, Bab al-Hawa (Godsgate) 320, The Twins fort 420, Catch Salt Works 350 (`gemini_trade_model.py:351, 372-375`); polity "Catch Oasis Stations" 2,400 (`TRADE-GEMINI.md:143`). | |
| 3 | **The Stair tunnel is dropped**: "No Ancient tunnel crosses the Catch's walls to Stair" (the owner, 2026-11-11, `LORE.md:82-83`; `openworld/ANCIENT-NETWORK.md:628-640`, 8.8). The Ancients reached Stair "over the surface by the Godsgate highway". **Not yet rewritten**: `biomes/catch/PLAN.md:155-158, 305-307`, `biomes/catch/README.md` (station 2's "tunnel's southern portal"), `openworld/ANCIENT-NETWORK.md:43-44, 86, 492`. A *possible* Rift-line bore Strongbow/Theodiga-Stair is left open (`LORE.md:92-93`; net route `rift.bowl.theodiga-stair`, 438 km, 385 km of it tunnel). | |
| 4 | **The oases moved**: the kit's `CATCH.OASES` (`biomes/catch/src/50-biome-catch-species.js:25-35`) and the plan's table (`biomes/catch/PLAN.md:295-301`) carry 4.22 points ~100-150 km apart along a 700 km crossing (NNW notch to the southern passes). Scale model 5.1 edit 5 (`tools/scale-model/README.md:735-739`) re-placed them at fans' toes on the 5.1 floor: "two north of Stair and two south: closer than the plan's 100-150 km". On the pins, Bitta and Lasso are 22 and 63 km from Stair, not "the last water before the southern passes" in a geographic sense: from Lasso it is ~300 km over the Twins to Strongbow. | |
| 5 | **Strongbow moved** 1026,1594 to **1001,1596** (5.1e5, 2026-11-11). The Twins plan, `kits/resources/data/ledger.json` and `ANCIENT-NETWORK.md:130` still use 1026,1594; `T.horns` uses 1001,1597. | |
| 6 | **The Twins plan's km are about half what its 5.1 px give.** Route A is "~82 km underground + ~11 km outside" (`biomes/twins/PLAN.md:154`), but its own waypoints measure 228 km; Sprint 1 is "3.5 km" for (978,1468)->(982,1466), which is 8.9 km (`biomes/twins/NOTES.md:37-39` says so). Tube A4 exits "~65 km SW of Stair" (`PLAN.md:170`); measured 137 km. Route A's entry (938,1496) is said to be +2,950 m (`PLAN.md:158`); 5.1 has 5,152 m there. | |
| 7 | **The Twins' ground on 5.1 already carries Option A** (`PLAN.md:3`; NOTES.md:4): polygon median now 4,162 m (was 7,665 m in `PLAN.md:65`), no airless class left. But the oases sample as **Csb, 392-424 mm** (Oasis 2-5) and the polygon is Dsc 49% / ET 41% / EF 9%: the plan's target BSk/BWk Catch-side benches (`PLAN.md:7.2`) are not on the model. | |
| 8 | **The gills plan's heights are pre-5.1**: "the caravan road from Lasso (6.6 km) over the 7.3 km saddle toward Strongbow" (`biomes/gills/PLAN.md:218-219`). On 5.1 Lasso is 1,509 m and the Twins' saddle 4.3-4.7 km. | |
| 9 | **Two Godsgates**: Gemini's pin "Bab al-Hawa (Godsgate)" (gem_godsgate, 1028,1246) samples 3,661 m, Dsc; the pass itself is "a 6.0 km pass at 0.75 atm" (`core/camp/PLAN.md:439`) / "the one low notch ... 6,158 m" (`biomes/catch/PLAN.md:36`, old px 726,896 = 5.1 998,1226, sampled 6,143 m EF). The straight line Godsgate pin -> Kolli crosses 6,918 m at 1034,1269. | |
| 10 | **Jabal** is a pin (sa5o6dvjdv, city, 1225,1149, polity "Jabal Shiekdom" [sic]) placed by the owner on the live map 2026-11-13 (`tools/scale-model/reconcile_5.1e11.json:1560`), at the Dasri town site TRADE-SCOPE proposed (1219,1148, `openworld/TRADE-SCOPE.md:637`). Gemini makes it a 15,000 city, capital of a 46,000 sheikdom (`openworld/populations-gemini.json:2311-2324, 685-700`). No lore file names it. | |
| 11 | **The salt works pins are held**: Catch Salt Works = Ṣalṭ al-Bān (`svhmyhf33w`, 1080,1428) and Bowl Salt Works = Solta (`s0zgu7u6yb`, 1169,1150), "the owner's held batch 5.1e10 ... not placed" (`tools/scale-model/README.md:866-868`). TRADE-SCOPE gives Ṣalṭ al-Bān to the Dasri ("Nomad Country", a seasonal camp of ~150) and Solta to Mantis's Izani merchant houses (`openworld/TRADE-SCOPE.md:339-340, 68-69`). Gemini put Bowl Salt Works under Jabal Shiekdom (`gemini_trade_model.py:350-352`). The owner now: the Train of Jabal runs the Catch salt works. | |
| 12 | **The ledger is stale** for the region: no Kolli/Arfwai/Bitta/Lasso/Jabal/Twins entries; Strongbow and Qiblai at their old points (`kits/resources/data/ledger.json`, settlements). | |

---

## 1. The places

### 1a. Pins in and along the Catch (from `tools/scale-model/model/src/60-settlements.js`, defSetts + SETT_ADDED + SETT_MOVED applied)

| id | Name | Type | 5.1 px | Polity (pin) | Notes (pin note, abridged) |
|---|---|---|---|---|---|
| `s2o8f4p123` | **Stair** | ruined arcology | 1106,1442 | none | The Hill arcology (`kits/ancients/targets/hill`), east flank of the springs' hollow through the interior hills, at the biggest of the five oases; "a glorified campground of a couple of hundred people (merchants, caravans, arcology divers)"; tunnel "sealed halfway" (stale, see 0.3). Moved 2026-10-23 from 827,1113 |
| `scatchkolli01` | **Kolli** | outpost | 1058,1367 | none | "the cold one": first water down from the notch, snowmelt at the north fan's toe. Izani Kold'a, Dasrī al-Kōl, Xanadui Kholṭu. Pool, reed bed, poplar and tamarisk, a well (1446 m). 5.1 edit 5 |
| `scatcharfwai01` | **Arfwai** | outpost | 1090,1387 | none | "halfway (to Stair)". Izani Afguai, Dasrī al-Ḥafwē, Xanadui Hāphwe (1074 m). Kit note: "a well in a hollow of the reg ... a lined shaft, a trough, three poplars" |
| `scatchbitta01` | **Bitta** | outpost | 1088,1455 | none | "bitter water: brackish, drinkable by beasts, not by people unless boiled with ash". Izani Bit'ar, Dasrī al-Bitar, Xanadui Biṭṭar (1576 m) |
| `scatchlasso01` | **Lasso** | outpost | 1083,1474 | none | "the last water before the southern passes, toward Strongbow". Izani Last'a Guat'ar, Dasrī al-Lāst, Xanadui Lāsṭu (1509 m) |
| `gem_godsgate` | **Bab al-Hawa (Godsgate)** | outpost | 1028,1246 | Catch Oasis Stations | "North Catch wind-gap caravanserai south of Parabola" (Gemini, 2026-11-14). The plan's oasis names have Stair as one of the five, so this is a sixth stop at the north gate, Gemini's |
| `svhmyhf33w` *(held, not on the page)* | **Ṣalṭ al-Bān** ("salt of the pan"), the Catch Salt Works | outpost | 1080,1428 | Nomad Country (TRADE-SCOPE) | batch 5.1e10, held; 59 km from Stair, 56 km from Bitta (TRADE-SCOPE.md:68, 339, 350) |
| `sodpa02bfv` | Hub 01 | ruined arcology | 1344,1409 | none | the mad AI, source of the Stalkers (`biomes/catch/PLAN.md:235-240`); in the Stalker Peaks polygon `rmwstalkerpks` |

The Catch's own polygons: **`rmvka7icdn1dq` "the catch" (biome)**, 126,700 km², and **`rmuf346nvpktx` "The Catch"
(geographic)**, 160,900 km² (`model/src/51-region-store.js`). Pins inside both: Stair, Kolli, Arfwai, Bitta, Lasso. No
polity polygon covers the Catch (`TRADE-SCOPE.md:68`, "no polity polygon").

### 1b. The northern approach and the gateway towns

| id | Name | Type | 5.1 px | Polity | Notes |
|---|---|---|---|---|---|
| `scyeauyek7` | **Parabola** (the Bowl arcology) | inhabited ruin | 970,1186 | Empire of Iziz (Gemini) | the Bowl arcology "at 970,1186: the Bowl's most temperate ground near the Godsgate" (`openworld/ANCIENT-NETWORK.md:631-632`); `ANCIENT-NETWORK.md` 8.11 a design proposal |
| `sa5o6dvjdv` | **Jabal** | city | 1225,1149 | Jabal Shiekdom | the Bowl's east shore, on the Rvr Ḥmm (119 m³/s); see 0.10 |
| `s0zgu7u6yb` *(held)* | **Solta**, the Bowl salt works | village | 1169,1150 | Empire of Iziz (TRADE-SCOPE) / Jabal Shiekdom (Gemini) | rock salt 234, gypsum 253 by the Bowl's salt lake |
| `slw9dufqfs` | **Mantis** | village | 1113,1164 | Iziz holding (lore) | oasis town on the Bowl's salt lake; "taken over by Izani merchant houses" (`LORE.md:257`) |
| `skz25tuq0w` | Arcbeam | arcology | 1016,1058 | Iziz | the Stair line's old north end |
| `sxxrgmrk8c` | **Iziz** | city | 963,985 | Empire of Iziz | |
| `ss0il0ejb7` | **Yuni** | city | 1263,1089 | Yuni Emirate | |
| `sx4srhrf5g` | **Locus** | village | 1267,1043 | Yuni Emirate | the Geomancers' oil town (~2,650, `LORE.md:404`) |

### 1c. The Twins and the Xanadu side (pins, plus the plan's proposed places)

| id / source | Name | Type | 5.1 px | Notes |
|---|---|---|---|---|
| `sfgtxw10kr` (pin) | **Strongbow** | arcology | 1001,1596 | cliff arcology in the Xanadu-Oidong scarp; top ~1,400 m, foot ~3,100 m lower; "its elevator is the way between the two" (pin note, 5.1e5). The Sultan's royal lift and toll gate (`core/simulation/PROPOSAL-XANADU.md` section 9, Q4) |
| `sl758m2396` (pin) | Kirstabal | village | 989,1600 | Xanadu Sultanate; the Xanadu floor below Strongbow (-1,661 m) |
| `gem_twins_pass` (pin) | **The Twins** (fort) | fort | 1042,1525 | Gemini's "Twins Pass Wardenry": "Geothermal steam-vent pass fort between Stair and Strongbow"; pop 420 in Gemini's model (`gemini_trade_model.py:375, 1007-1019`). No lore |
| `sttkxo9ndy` (pin) | **White Gills Hermitage** | outpost | 1035,1535 | Order of Historians; the Monks' hermitage in the White pipe field "doubles as a caravan stop ... passing news and rumors from travelers to Longsong" (the owner, `biomes/gills/PLAN.md:34-36`) |
| `T.horns` | Brotherhood guild house, Strongbow | house | 1001,1597 | 300 people (`core/region/data/xan-tune.js:159`) |
| `T.horns` | Brotherhood house at the Stair gate | house | 1106,1442 | "off the map; its table is Stair's", 0 people (`xan-tune.js:160`) |
| `T.horns` | factor houses | | Erehwon 806,1515 (40), Qiblai 922,1594 (40), Theodiga 908,1534 (20), Kirstabal 989,1599 (20), Phēr 810,1482 (20), Thalaba 839,1463 (20) | `xan-tune.js:161-163` |
| twins PLAN 3.2 | Oasis 1 *Bāb al-Bukhār*, Sinter-Gate | oasis | 996,1504 | "the Guild's SW toll-house"; stone corrals with heated floor slabs (`PLAN.md:185`) |
| twins PLAN 3.2 | Oasis 2 *Qidr al-Ṭīn*, Mud-Kettle Hollow | oasis | 1005,1489 | maar crater, mud pots (`PLAN.md:186`) |
| twins PLAN 3.2 | Oasis 3 *Al-Miǧmarah*, the Brazier | oasis | 1016,1479 | mid-pass crossroads; **the Shrine of the Split Horn** "where the second half of the guide's fee falls due" (`PLAN.md:187`); station 2 |
| twins PLAN 3.2 | Oasis 4 *Birkat al-Kibrīt*, Brimstone-Tarn | oasis | 1031,1473 | sulfur tarn, borate crusts (`PLAN.md:188`) |
| twins PLAN 3.2 | Oasis 5 *Manẓar al-Maṣīd*, Catch-Lookout Spring | oasis | 1056,1462 | "caravans wash alkali dust from their eyes and refill waterskins before descending to Stair" (`PLAN.md:189`); station 6 |
| twins PLAN 3.1 | **Hall of the Tally-Marks** | tube camp | 1014,1464 | Route A's overnight camp in tube A3, a carved basalt cistern; the Route A mid-col pay point (`PLAN.md:166, 197`) |
| twins PLAN 3.1 | Route A portals | | A1 entry 938,1496 (above the Alph chasm); sprints at 978,1468 / 1002,1469 / 1020,1461; A4 exit 1038,1452 | `PLAN.md:157-170`; a Strongbow feeder by tube 10 from 1010,1517 to 1028,1506 (`PLAN.md:171`) |
| twins PLAN 4 | the traps | | F1 Iron Shroud 968,1442; F2 Bitter Frost 1068,1528; L1 Red Cistern 992,1465; L2 Boiling Crucible 1035,1493 | `PLAN.md:210-229` |
| twins PLAN 2 | the cones | | NW Twin (*Al-Qaran al-Kabīr*) 988,1458, 6,480 m; SE Twin (*Al-Qaran al-Ṣaghīr*) 1042,1498, 5,880 m; fissure vents 1007,1472 and 1024,1485 | `PLAN.md:113-118` |
| ANCIENT-NETWORK G10 | the "Lasso pass" | pass | 1040,1566 | "the caravans use the Lasso pass (1040,1566)" (`openworld/ANCIENT-NETWORK.md:130`): this is the old Lasso point shifted, on the Twins' south flank |

The Twins polygon `rmw536m06wlyf` (biome, 7 points), 49,180 km² on my raster (the plan says 48,636): pins inside are only
the White Gills Hermitage and The Twins fort. **Neither Strongbow nor Stair is inside**; Strongbow is 30 km south of its
south corner.

---

## 2. The ground (sampled on 5.1; "class" = Köppen-style code from `climate.json`)

### 2a. Catch and approach

| Place | px | Elev m | Mean °C | Rain mm | Class | Province | Nearest water (rivers.json / basins.json) | Pins within 30 km |
|---|---|---|---|---|---|---|---|---|
| Godsgate pin | 1028,1246 | 3,661 | 4 | 282 | Dsc | granite | wadi Guli rrija (r440) 28 km; water cell 33 km | none |
| NNW notch (old 726,896) | 998,1226 | 6,143 | -10 | 141 | EF | crystalline | | none |
| **Kolli** | 1058,1367 | 1,446 | 15 | 47 | BWk | granite | wadi Wādī al-Bīr al-Gharb (r875, 0.9 m³/s, ephemeral) 1.9 km; the terminal lake 67 km | none |
| **Arfwai** | 1090,1387 | 1,074 | 18 | 31 | BWk | crystalline | salt pans 497 km² (1081,1414) and 176 km² (1107,1410), 56-57 km to their centres; no river within 30 km | none |
| **Ṣalṭ al-Bān** (held) | 1080,1428 | 458 | 19 | 16 | **ET** (sic; a model class at 458 m, +19 °C: TRADE-SCOPE.md:68 records the same) | evaporite | salt pan 257 km² (1071,1428) 18 km; Rīfar al-Layl (r867, perennial, 12.7 m³/s) 20 km | none |
| **Stair** | 1106,1442 | 1,379 | 16 | 47 | BWk | granite | no river within 30 km; salt pans 65-76 km; water cell 56 km. Ledger: water **false**, wood false (`ledger.json`) | none |
| **Bitta** | 1088,1455 | 1,576 | 14 | 47 | BWk | crystalline | Rīfar al-Layl 28 km | none |
| **Lasso** | 1083,1474 | 1,509 | 14 | 47 | BWk | crystalline | **Rīfar al-Layl (r867, perennial, 12.5 m³/s) 4.2 km**; Wādī al-Sarāb al-Fawq 8 km | none |
| Terminal lake | 1035,1392 | 313 (water) | 21 | 16 | BSh | water | the salt lake, 738 km² at 318 m | |
| Hub 01 | 1344,1409 | 4,351 | -2 | 157 | ET | sedimentary | dry wadis | |
| Parabola | 970,1186 | 1,716 | 15 | 314 | BSk | granite | water cell 85 km | |
| Jabal | 1225,1149 | -1,206 | 29 | 533 | BSh | sedimentary | Brk Ǧbl (r871) 4 km, 20.9 m³/s; Rvr Ḥmm (r037) 6 km, 120 m³/s | |
| Solta (held) | 1169,1150 | -1,115 | 29 | 659 | BSh | evaporite | the Bowl salt lake (3,129 km², -1,158 m) 47 km to centre, water cell 7 km | |
| Mantis | 1113,1164 | -978 | 28 | 1,553 | Am | sedimentary | lake 176 km² 10 km | |
| Iziz | 963,985 | -1,428 | 31 | 1,835 | XA | sedimentary | Bruk Falz 17 km (427 m³/s) | |
| Yuni | 1263,1089 | 636 | 21 | 675 | Cfa | sedimentary | Waita Riba (r077) 0.8 km, 51 m³/s | |
| Locus | 1267,1043 | -2,403 | 32 | 3,827 | XA | granite | the lake 2 km | |

**The Catch as a whole** (my raster stats; polygon `rmvka7icdn1dq`): median 3,552 m; land median rain 110 mm; the floor
under 1 km (26,400 km²) median **16 mm**, +20 °C. Classes BWk 31.5%, Dsc 22.4%, ET 21.2%, Dsb 12.0%, BSk 7.2%, EF 3.8%.
The 4.22 correction stands on 5.1 (plan: floor 18 mm, `biomes/catch/PLAN.md:94`). The plan's floor: warmest month +34 °C,
coldest +6, highs +43, nights -4 (`PLAN.md:98`). Air on the floor ~1.55 atm (`PLAN.md:82`); RESOURCES-SETTLEMENTS gives
Stair 1.35 atm (`openworld/RESOURCES-SETTLEMENTS.md:281`).

### 2b. The Twins and Strongbow

| Place | px | Elev m | Mean °C | Rain mm | Class | Province | Water |
|---|---|---|---|---|---|---|---|
| Oasis 5 Catch-Lookout | 1056,1462 | 3,690 | 11 | 424 | Csb | granite | no river; plan: 70 °C alkaline-chloride springs |
| Tube A4 exit | 1038,1452 | 3,071 | 6 | 94 | BSk | sedimentary | |
| Hall of the Tally-Marks | 1014,1464 | 4,114 | 1 | 267 | Dsc | sedimentary | plan: +14 °C seep, a cistern |
| Oasis 4 Brimstone-Tarn | 1031,1473 | 4,418 | 7 | 392 | Csb | sedimentary | plan: 38 °C sulfur tarn |
| Oasis 3 the Brazier | 1016,1479 | 4,680 | 5 | 392 | Csb | sedimentary | plan: pools 40-86 °C (NOTES.md:86-92) |
| Oasis 2 Mud-Kettle | 1005,1489 | 4,327 | 7 | 392 | Csb | sedimentary | tarn at 7,091 m?? (basins.json lake at 1004.9,1517.7, level 7091: a model artefact) |
| Oasis 1 Sinter-Gate | 996,1504 | 3,777 | 10 | 408 | Csb | sedimentary | plan: 62 °C bicarbonate spring |
| Station 1 (Sprint 1) | 980,1467 | 4,240 | 1 | 267 | ET | volcanic | |
| Route A entry | 938,1496 | 5,152 | -8 | 157 | ET | granite | (plan says 2,950 m) |
| NW Twin | 988,1458 | 5,980 | -9 | 204 | EF | volcanic | |
| SE Twin | 1042,1498 | 5,420 | -6 | 220 | EF | volcanic | |
| Trap F1 / F2 | 968,1442 / 1068,1528 | 4,720 / 4,571 | -2 / -1 | 251 | ET | | |
| Trap L1 / L2 | 992,1465 / 1035,1493 | 4,890 / 5,633 | 7 / 3 | 235 / 220 | ET / EF | volcanic | |
| The Twins fort | 1042,1525 | 4,449 | -1 | 251 | ET | granite | |
| White Gills Hermitage | 1035,1535 | 3,438 | 5 | 282 | Dsc | sedimentary | |
| Lasso pass | 1040,1566 | 4,207 | -1 | 251 | ET | granite | |
| **Strongbow** | 1001,1596 | 1,400 | 14 | 800 | Cfb | rift | Keb Riwā (r107) 4 km, 750-780 m³/s (the cataract river) |
| Kirstabal | 989,1600 | -1,661 | 33 | 1,255 | Af | rift | Keb Riwā 5 km |

Twins polygon: median 4,162 m (p10 3,199, p90 5,281, max 7,059), median rain 267 mm, median +1 °C; Dsc 49%, ET 41%, EF 9%.
The plan's microclimate: the col "bitterly cold, rime-swept, and lethal at night (-18 to -26 °C outside)"; oases +10 to +20
°C air at 0-3 m (`biomes/twins/PLAN.md:79, 179`). Pressures: Oasis 1 1.00 atm, Oasis 3 0.89, Oasis 5 1.01 (`PLAN.md:185-189`).

---

## 3. Resources

### 3a. Within 30 km (geology.json byte at the cell / best byte within 30 km / its distance km; only families present)

| Place | Salt families | Other |
|---|---|---|
| Kolli | halite 0/179/29, gypsum 0/219/26, **saltpeter 200**/240/23 | iron 120/180, tin 200, rare-earth 160, clay -/230 28, limestone -/148, **water 255** (here) |
| Arfwai | halite 0/239/25, potash 0/93/29, gypsum 0/252/20, alkali 0/102/29, saltpeter 200/240/26 | iron 160/**255** at 9 km, copper 50/130, marble -/136 13 km |
| **Ṣalṭ al-Bān** | **halite 239**/255/16, potash 0/176/18, **gypsum 194**/242/13, alkali 0/236/20, saltpeter 240 | clay -/230, water -/255 28 km |
| Stair | halite 0/25, saltpeter 200 | iron 120/180, tin 200, rare-earth 160, gold/silver 110, marble/limestone ~130 at 28 km; no wood, no water within 30 km |
| Bitta | halite 0/32, saltpeter 200 | iron 160/180, tin -/200 11 km, clay -/230, water -/255 28 km |
| Lasso | halite 0/29, saltpeter 200 | iron 160/180, clay -/230, water -/255 29 km |
| Terminal lake (1035,1392) | halite -/250 13 km, potash -/175 14, gypsum -/253, **alkali -/254 9 km**, saltpeter -/240 | iron -/255, marble -/133 |
| Godsgate | saltpeter 127/171 | iron, tin 200, rare-earth 160, stone 255 |
| Oases 1-5 (the Twins) | halite 9-21, saltpeter 71-140 | **sulfur to 255** within 23-29 km (Brimstone, Brazier, Mud-Kettle), iron to 255 (Brazier 255 here), copper to 210, gold 140, silver 150 |
| Strongbow | none (saltpeter -/14) | copper 120, rare-earth 190, oil -/110, wood -/255 16 km, water 222-255 |
| Jabal | halite 13/15, saltpeter 20/33 | iron 180, coal 49/65, oil 30/43, wood 73/210, water 148/255 |
| Solta | **halite 209**/254, potash -/245 9 km, gypsum -/253, alkali -/46 | limestone 110/152 |

**Census of the Catch polygon** (`rmvka7icdn1dq`, 7,956 cells of 4 km; cells over byte 80 / over 150 / peak): halite
231/153/255, potash 167/36/178, gypsum 223/151/255, alkali 226/107/255, saltpeter 7,821/7,508/240, iron 5,911/4,089/255,
tin 1,822/1,822/200, rare-earth 3,847/1,822/160; no oil, coal or wood. Ledger world totals for scale: alkali 271 nodes and
potash 957 in the whole world (`kits/resources/data/ledger.json`, `world`), so the Catch holds most of the planet's alkali
("Krator's one great salt field", `LORE.md:87`).

**The Twins polygon**: no halite, potash, gypsum or alkali over 80; saltpeter 3,121 cells over 80; **sulfur 391 over 80,
86 over 150 (peak 255)**; iron 1,860; copper 752; gold 1,566 (all under 150).

### 3b. The richest unclaimed districts there (`openworld/RESOURCES-SETTLEMENTS.md:436-480`, 10 km node-yield)

| Family | px | Node-yield | Peak, rich km² | Nearest pin (km) | Ground |
|---|---|---|---|---|---|
| rock salt | 1080,1428 | 61.6 | 243, 352 | Stair 59 | ET, 457 m |
| rock salt | 1020,1395 | 32.8 | 250, 176 | Stair 196 | BWk, 386 m |
| gypsum | 1081,1428 | 52.9 | 239, 384 | Stair 57 | ET, 457 m |
| gypsum | 1051,1386 | 31.6 | 253, 120 | Stair 156 | |
| potash | 1069,1415 | 32.3 | 178, 16 | Stair 91 | BWk, 343 m |
| soda (alkali) | 1069,1415 | 44.6 | 245, 152 | Stair 91 | BWk, 343 m |
| soda | 1109,1408 | 34.6 | 245, 168 | Stair 68 | BWk, 377 m |
| soda | 1044,1384 | 23.9 | 241, 136 | Stair 169 | ET, 331 m |
| saltpeter | 1068,1409 | 32.0 | 240, 484 | Stair 100 | ET, 406 m |
| saltpeter | 1099,1418 | 31.1 | 240, 484 | Stair 50 | BWk, 422 m |
| silver | 1054,1499 | 11.3 | 150, 0 | Stair 154 | ET, 4,552 m (in the Twins) |

`RESOURCES-SETTLEMENTS.md:417-420`: "The Xanadu south has no salt ... The map's richest unclaimed evaporites (rock salt,
gypsum, potash, soda and saltpeter together, 1060-1110 x 1385-1430) lie in the Catch with only Stair's campground 50-100 km
off: a salt road from the Catch, or a salt town there, is the obvious fix." Stair's ledger row: ok false (no wood, no water)
(`ledger.json`); RESOURCES-SETTLEMENTS row 281: BWk 16°, 47 mm, 1.35 atm, iron 19, tin 12, saltpeter 17, farmland 0.

The kit adds the potash and alkali nodes (`node-potash-*`, `node-alkali-*`; `biomes/catch/README.md`, "Its resources").
The divers' salvage: alloys and energy cells that keep in the dry (`biomes/catch/PLAN.md:187-196`; `LORE.md:93`).

### 3c. Crops (`kits/crops`, `CROPS.at`; no `catch` or `twins` biome is defined in `kits/crops/src/10-crop-core.js`)

My queries (axes chosen by me: the Catch oases dense air ~1.35-1.55 atm, arid; the Twins oases ~0.9-1.0 atm, cool, heated):
- **Catch oasis, fresh** (subtropic, dense, arid, wet): 46 fits; "rain" (the crop tolerates arid) 28: emmer, basin-amaranth,
  tepary bean, sweet potato, murnong, pinyon, pistachio, almond, whorl-olive, apricot, pomegranate, citron, fig, pitaya,
  carob, juniper, saffron, rattlepod, cave-date, measuremelon, **tamarisk-manna, saxaul**...; irrigated 18 (rice, tea,
  coffee, tobacco, herbs...).
- **Catch oasis, brackish** (temperate, dense, arid, wet, salt): 34 fits.
- **Twins oasis** (cool, standard, semiarid, heated): 28: frostroot, snowpotato, goldroot, bistort, stonepine, crowberry,
  dust-lentil, cave-date, bench-garlic; irrigated frostoat, tea, bilberry, cloudberry...
- Caveat: the Catch's 16-47 mm is far below what "arid" means in the kit, and the owner ruled **"No oasis waters fields"**
  (`biomes/catch/PLAN.md:118`). Gemini gives Stair "oasis dates only; imports food" (`gemini_trade_model.py:1026`).
  RESOURCES-SETTLEMENTS lists Stair's crops as basin amaranth, murnong, plain emmer with 0 farmland (`:281`).

---

## 4. Routes and trade on record

### 4a. The road network (recorded lengths)

| Leg | km | Source |
|---|---|---|
| Iziz - Arcbeam | 198 (trunk, 10 km tunnel) | `openworld/net51-gemini.json` `r.skz25tuq0w.sxxrgmrk8c` |
| Arcbeam - Parabola | 308 (trunk) | `r.skz25tuq0w.tbd.bowl` |
| Iziz - Mantis | 591 (Izani highway) | `izani.4.6` |
| Arcbeam - Mantis | 393 | `izani.0.6` |
| Mantis - Parabola | 315 (Izani road) | `izani.mantis-bowl` |
| Yuni - Mantis | 374 (Yuni highway, 63 km tunnel) | `yuni.mantis` |
| Yuni - Arcbeam | 534 | `r.skz25tuq0w.ss0il0ejb7` |
| Locus - Yuni | 92 straight; Yuni's road to Mungo "by Locus" 615 | `yuni.mungo` |
| Jabal - Solta | 112 (polity highway) | `roads-supplement-gemini.json` `supp.sa5o6dvjdv` |
| **Stair - Parabola, by the Godsgate** | **726** (Godsgate at km 491 from Stair; *possible* Rift-line, 170 km tunnel) | `rift.bowl.stair-bowl-arcology`; its line passes (1092,1418), (1072,1392), (1048,1368), (1030,1350), (1028,1324), (1038,1298), (1030,1272), Godsgate (1028,1246). It is the only recorded route through the Catch's north |
| Hub 01 - Stair | 541 (trunk) | `r.sodpa02bfv.s2o8f4p123`; through the Stalker Peaks: "no caravan takes them" (`biomes/catch/PLAN.md:39`) |
| **Stair - The Twins (fort) - Strongbow** | stated 411.4 (dirt road; polyline 374, fort at 210 km) | `supp.catch_twins_pass` (Gemini) |
| Stair - White Gills Hermitage - Strongbow | stated 413.6 (polyline 374) | `supp.catch_white_gills_pass` (Gemini) |
| Theodiga - Stair | 438 (*possible* dead bore, 385 km tunnel); passes ~10 km from Oasis 3, ~6 km from Oasis 5, 8 km from Bitta | `rift.bowl.theodiga-stair` |
| Spurs: Lasso-Bitta 39, Bitta-toward-Stair 47, Arfwai 32, Kolli 15, Catch Salt Works 24, Twins fort-White Gills 38 | | roads-supplement (Gemini) |
| Qiblai - Strongbow | 160 (Xanadu road) | `xanadu.1.3` |
| Strongbow - Longsong | 469 | `xanadu.3.5` |

### 4b. Straight-line distances (km)

| From - to | km | | From - to | km |
|---|---|---|---|---|
| Godsgate - Kolli | 249 | | Iziz - Stair | 958 |
| Kolli - Arfwai | 75 | | Yuni - Stair | 773 |
| Arfwai - Stair | 115 | | Locus - Stair | 861 |
| Stair - Bitta | 44 | | Jabal - Stair | 632 |
| Bitta - Lasso | 39 | | Jabal - Godsgate | 439 |
| Lasso - Oasis 5 (Catch-Lookout) | 59 | | Mantis - Godsgate | 236 |
| Oasis 5 - Oasis 4 - 3 - 2 - 1 (Route B) | 55 + 32 + 30 + 35 = **152** | | Parabola - Godsgate | 167 |
| Oasis 1 - Strongbow | 184 | | Stair - Strongbow | 373 |
| Route A, A1 entry - A4 exit (plan waypoints) | **228** | | Ṣalṭ al-Bān - Stair / Bitta / Arfwai | 59 / 56 / 84 |
| Tube A4 exit - Stair | 137 | | Stair - Hub 01 | 481 |
| Strongbow - tube 10 feeder (1010,1517) | 159 | | Iziz - Strongbow | 1,224 |

**Chains** (my sums from 4a, km): Iziz -> Arcbeam -> Parabola -> Godsgate -> Stair = 198 + 308 + 235 + 491 ≈ **1,232**;
Yuni -> Mantis -> Parabola -> Godsgate -> Stair = 374 + 315 + 235 + 491 ≈ **1,415**; Stair -> Strongbow ≈ **374-411**.
Iziz to Strongbow ≈ 1,600-1,650 km. Gemini's own trade rows give Kirstabal/Qiblai -> Iziz 1,576-1,708 km
"via Arcbeam -> Strongbow -> Stair" (`openworld/TRADE-GEMINI.md:672-674`). At Gemini's pack caravan 24 km/day
(`trade-fleets-gemini.json` `carrier_specs.pack_caravan`) or core/camp's 25-40 km/day for camels (`core/camp/PLAN.md:423-424`):
Stair-Strongbow ~10-16 days, Iziz-Stair ~31-50 days.

**Elevation profiles** (straight legs on 5.1, max height): Godsgate-Kolli-Arfwai-Stair crosses 6,918 m at 1034,1269
(the north wall; the pass itself is 6.0-6.2 km per the docs); Parabola-Godsgate 6,186 m; Stair-Bitta-Lasso-Oasis 5 rises
959 -> 3,690 m; Route B Oasis 5 -> 1 peaks 4,723 m at 1020,1478; Oasis 1 -> Strongbow crosses 5,148 m at 999,1554;
Lasso -> Lasso pass -> Strongbow 4,946 m; Gemini's Stair-Twins fort-Strongbow line 4,826 m. Route A (plan waypoints) 6,217 m
at 986,1466 (the NW Twin's shoulder on 5.1).

### 4c. Trade and fleets on record

- **The gateway rule** (the owner, 2026-11-12; 2026-11-16 adds Dalab): the East Rift trades directly only with Iziz,
  Yuni, the Dasri (and Dalab), "over the Catch (by Stair) and the high passes north" (`openworld/TRADE-SCOPE.md:34-37`;
  `core/simulation/PROPOSAL-XANADU.md:327-336, 439`).
- **Xanadu's salt** (TRADE-SCOPE 2.2, `:62-72`): Xanadu short ~290 t/yr. Three sources: the Catch's Dasri works (~1/3,
  ~100 t; "a seasonal Dasri camp (an outpost of ~150): the crossing is too hostile for more"), the Bowl's Izani works
  (~1/3, Mantis's merchant houses), the north (Iziz net surplus 1,680 t, Yuni 751). PROPOSAL-XANADU:305 repeats it.
- **PROPOSAL-XANADU section 6** (`:325-357`): "The Catch road: Erehwon, via Thalaba or Strongbow, the Twins, Stair and the
  Catch oases (Lasso, Bitta, Arfwai, Kolli)" to Iziz (out goldwork, cacao, saffron, tea, silk, opal; in iron, arms, salt,
  scrap) and to the Dasri (in: "The Catch's salt, alkali, lung salt").
- **Lung salt** (*Lãg Solṭ*): the White Gills' oxygen salt "on the Catch-to-Xanadu road", chewed against thin-air sickness,
  carried by "the gateway caravans (Yuni, Izani, Dasri, Xanadui)" (`TRADE-SCOPE.md:409`).
- **Gemini's corridor** "Catch & Twins Trans-Rift Caravan Chain (Marr/Parabola <-> Catch <-> Twins <-> Strongbow)": avg leg
  741 km, 5,914 t gross a year, 95 wagon convoys, operators Iziz 30%, Catch Oasis Stations 26.5%, Xanadu 23.6%, Stair
  Divers 7.5%; top goods salt 1,571 t, alkali 1,469 t, scrap 927 t, saltpeter 505 t (`openworld/trade-fleets-gemini.json`,
  `overland_corridors`). "Dasri & East Abyss Trunk Network (Talia/Jabal <-> Verge <-> Yuni <-> Abyss)": Jabal Shiekdom
  20.7% of operators.
- **Gemini polities** (`TRADE-GEMINI.md`): Catch Oasis Stations (3 pins, 2,400) exports salt 1,525 t, alkali 1,037 t,
  saltpeter 190 t, dried fruit 96 t (`:143`); Twins Pass Wardenry (1 pin, 504) saltpeter 54 t, mounts 39, sulfur 21 t;
  imports food 216 t (`:146`); Stair Divers (275) alkali 364 t, scrap 278 t, relics 27 (`:147`); Jabal Shiekdom (2 pins,
  46,000): mezcal 198 t, saltpeter 166 t, potash 82 t, incense 78 t (`:118`). Gemini routes carry "Desert Nomad Bandits"
  and "Lizardman Raid Hazard" tags (e.g. `:389-393`).
- Gemini's per-pin supply: Stair energy cells 5.5, electrics 2.5, relics 2.2, nickel 4.5, food 10 (`gemini_trade_model.py:1021-1026`);
  Kolli salt 420, Arfwai salt 1,550 (`:984-1005`); Catch Salt Works salt 480, saltpeter 24, food 0 (`:1294-1297`); alkali
  producers Arfwai 195, Stair 96, Catch Salt Works 95, Kolli 75 (`:1663-1667`). These are Gemini's, larger than the lore.

---

## 5. Lore

| Subject | What exists | Source |
|---|---|---|
| **The Catch** | "the biggest barrier to trade between Xanadu and everywhere else"; "oases, but only just enough for the crossing to be doable, not comfortable or safe"; hyperarid sealed basin, Tarim-sized; Stair "a glorified campground"; the four peoples **Yuni, Izani, Dasrī or Xanadui**; "Krator's one great salt field" (potash, alkali); caustic dust | `LORE.md:77-93`; `biomes/catch/PLAN.md:9-13, 144-196` |
| Hazards of the crossing | the Stalkers (pairs or triads, harpooner + blade, take stragglers; "a wise caravan carries explosives ... one that does not flees"), black storms of caustic alkali dust in spring, dawn katabatic winds, an oasis found dry, the beasts' water running out between stages | `biomes/catch/PLAN.md:85-87, 150-154, 214-267`; `LORE.md:153-154` |
| Who runs Stair | "A handful of merchants (who sell water, fodder, repairs and news at the prices the Catch allows), the caravans passing through, and now and then bands of daring or desperate arcology divers". "Nobody else lives here. No oasis people, no ruler of the passes." "Stair's merchants answer to all four [tongues]". Proposed: Stair's merchants buy salts and cells; buyers Yusar, Yuni's and Locus's Geomancers, Xanadu's engine-keepers, the Empire's armourers | `biomes/catch/PLAN.md:159-167, 194-196, 303` |
| **The Dasri** (§6.8, "The Eastern Nomads") | Shade (~1,000), Wardens of the Deep Aquifer, dune raiders ("come as a convoy of camel riders every few days"), the Khan caravanserai, camel lines; sign **horns**; Dasrī tongue (Arabic-style, Yuni loans for "trade, oil and rank") | `LORE.md:381-391` |
| Dasri and the Catch | "the Dasri are mostly nomadic. they should have 4 village and 1 town size settlements" (the owner); the town site 1219,1148 = "the Dasri's gateway to the Catch ... Caravans for Xanadu muster there, and the Dasri's salt from Ṣalṭ al-Bān and the Bowl's from Solta pass through it" | `openworld/TRADE-SCOPE.md:620-648` |
| **The Train of Jabal** | **Nothing found.** "Jabal" exists only as Gemini's pin/polity "Jabal Shiekdom" (city 1225,1149, "Capital of Jabal Shiekdom in the Bowl; terraced canyon/oasis city + surrounding palm-qanat suburbs", 15,000) and its trade rows; mezcal "signature Dasri spirit led by Jabal Shiekdom" | `openworld/populations-gemini.json:2311-2324`; `gemini_trade_model.py:302, 531, 1163-1170`; `TRADE-GEMINI.md:118, 1055`. Unrelated: *Jabal al-Qaوس* (opalvalley), *Wādī al-Jabal* (r637, a wadi 26 km from Jabal) |
| **Iziz's merchant houses** | **Five Izani merchant houses**, core/camp's caravan houses (owner 2026-10-26: pack oxen and horses, a `laager` of carts with a house pavilion): **Goldanda** "gold hand" (proposed: bankers, coin/credit/bullion on the eastern road to Yuni), **Saltroda** "salt road" (proposed: salt and staples from the salt pans to the jungle cities), **Istberar** "east bearer" (proposed: Talia's house, spice, relics, petrol from the desert and abyss), **Farguogar** "far walker" (the owner's: west to the Eternal State), **Getmastarz**, the Gatemasters (the owner's: "treks past the Godsgate, south to Xanadu"). Names by `tools/names/izani.py` `houses()` (HOUSE_A/HOUSE_B roots; "Duxun" pattern) | `core/camp/PLAN.md:19-20, 426-449`; `tools/names/izani.py:61-84` |
| Iziz nobility | No named noble houses beyond **House Duxun** (the exiled claimant Mav's) and **Marxal** ("the Marshal's house", the Pirate Emperors). "The imperial house has no name in the lore". Mantis "taken over by **Izani merchant houses**". Talia "rich on the caravan trade". The Talent is the caravaneers' coin | `LORE.md:231, 255, 257, 265-266, 273`; `settlements/iziz/palace/BLUEPRINT.md:113` |
| **The Yuni Merchants' Guild** | **Not found** anywhere ("Merchants' Guild" occurs only in Voth's source). Yuni: Emir chosen by "the prominent families" (an oligarchy; tower-houses compete), de facto run by the Geomancers, a caravanserai, the Caravan Gate, "Desert nomads come to the caravanserai"; "a fluid society". Caravans: "Yuni and the desert nomads" | `LORE.md:419-435, 1074`; `settlements/yuni/NOTES.md:185-197` (caravanserai, great market circle) |
| **The Geomancers** | a guild that drills for oil; Locus ~2,650; "In Yuni they hold the Cloisters. Culturally 'mostly Yuni'"; "Lizard riders patrol in sixes"; "pioneers in exploiting the various tectonic / volcanic resources of the southeast map quadrant" (the owner, re the White Gills' hydrogen). On the sim: `gate.geomancers` (oil caravans from Locus to Qiblai, 40 days, 4 carriers) and the Qiblai oil concession (`T.oil`, 300 people, Sultan's licence 20%, Prismarchy 10%) | `LORE.md:400-408`; `biomes/gills/PLAN.md:32-34`; `core/region/data/xan-tune.js:120-122` |
| **The Brotherhood of the Two Horns** (*Ṭā'ifat Dalīl al-Qaranayn*; also "the Xanadui Guild of the Two Horns (*Dalīl al-Qaranayn*)") | "Based in **Strongbow** and **Stair**, the Xanadui mountain guides guard the shifting topology of the Twins as a hereditary trade secret"; unguided "less than a one-in-three chance of crossing without losing its pack train". **The Custom of the Split Tally**: "half the silver and rations at the gate (Strongbow or Stair) and the second half at the Mid-Col Shrine (Hall of the Tally-Marks ... or The Brazier / Oasis 3)", plus "a sworn share of tea, furs, and warm tent-space". The stiffed guide leads to a frozen vale or lava pool "before vanishing through a hidden crack-chimney in the night". 2026-11-16 the owner: "the guilds of the twins as merchant houses with a presence throughout Xanadu who additionally try to profit from trade" | `biomes/twins/PLAN.md:17, 193-198`; `core/region/data/xan-tune.js:438-441`; `PROPOSAL-XANADU.md:380-381` |
| Owner's brief for the Twins | "this tall and inhospitable range divides Xanadu and the Catch and contains the Twins, two active small volcanoes. Savvy travellers know two ways ... The Xanadui guides are paid well; those who have been stiffed, or mistreated, have been known to lead caravaneers to dead end frozen vales or active lava pools" | `biomes/twins/PLAN.md:14` |
| Xanadu's view | the north "rough high passes, often blocked by lava flows or earthquakes"; "its bandits, and the robotic stalkers rumored to haunt it"; "deficient in iron ore and scrap, and their best weapons are always obtained from Izizian and Yuni traders" | `LORE.md:507-508` |
| The White Gills hermitage | Monks' hermitage "doubles as a caravan stop"; the pass's calendar is "the hour of the breath" (the ground exhales on a daily tide whose hour walks round the clock once a year) | `biomes/gills/PLAN.md:34-36, 189-195` |
| Xanadui loanword | *lāin*, "a caravan route, from *line*"; *bāiṭ*, a traveller's packed food | `LORE.md:516` |

---

## 6. The Twins as caravan country

### 6a. The two routes

| | Route A, the Dark-Tube Road (*Darb al-Anfāq*) | Route B, the Steaming-Stone Dash (*Darb al-Manāwir*) |
|---|---|---|
| What | four drained lava tubes (A1 Western Alph Pyroduct, A2 Horn-Underpass, A3 Saddle Siphon, A4 Stair Conduit), three open sprints (the First Breath, the Saddle-Gasp, the Catch-Leap) | almost all outdoors, day by day between five geothermal oases (*Al-Manāwir al-Khams*) |
| Who takes it | laden pack mules and yaks; +8 to +15 °C inside | "caravans with bulky high-frame wagons, siege-engines, or claustrophobic herds that cannot fit through the 3.5 m choke-points" |
| Overnight | the Hall of the Tally-Marks (1014,1464), +14 °C cistern | each oasis, under the dwarf pocket-hearths' warm canopies (+12 to +16 °C when outside is -20) |
| Mid-col payment | Hall of the Tally-Marks | the Brazier, Shrine of the Split Horn |
| Plan's length | "~82 km underground ... three brief ... sprints totaling ~11 km" (inconsistent with 5.1, see 0.6) | not stated; Oasis 1-5 measured 152 km; "day-by-day" (one oasis a day implies ~4-5 days on the range) |
| Measured on 5.1 | 228 km A1 entry -> A4 exit; then A4 exit -> Stair 137 km | Strongbow -> Oasis 1 184; Oasis 1 -> 5 152; Oasis 5 -> Stair 108 (or via Lasso/Bitta 59 + 39 + 44) |
| Entry from Strongbow | the tube 10 feeder (1010,1517 -> 1028,1506) "to link Strongbow caravans into either Route A or Route B" | Oasis 1 "SW Approach Oasis above Strongbow" |
| Source | `biomes/twins/PLAN.md:153-171` | `:175-189` |

Whole Strongbow -> Stair by Route B on the pins: 184 + 152 + 108 ≈ **444 km** (or ~455 via Lasso and Bitta). Gemini's direct
dirt road: 411 km. Both cross 4.3-5.1 km heights.

### 6b. Hazards that matter to caravans

| Hazard | Detail | Source |
|---|---|---|
| Cold and wind | open crest -20 to -35 °C, 90-120 km/h katabatic gales; col -18 to -26 °C at night: "neither beast nor driver can survive exposed overnight camps" | `twins/PLAN.md:79, 124` |
| Sprints | Sprint 1: frost, rime fog, 85 km/h crosswinds; Sprint 2: graupel, sulfur steam, loose cinders; Sprint 3: talus in view of the Catch | `:159-168` |
| Changing ground | "roof falls periodically seal lava-tube skylights on Route A and phreatic quakes shift which springs are boiling vs. dormant on Route B" | `:196` |
| Gas and heat | CO2/SO2 pools at night in still air; crusts that break under a laden mule; scald at the oases | `NOTES.md:72-77, 112-114`; core/hazard `KHAZ.ENV` |
| The guides' traps | F1 Iron Shroud (-34 °C night sink, "frozen pack-mules and rimed wagon frames of forty past betrayals"), F2 Bitter Frost (snow-slab sealed), L1 Red Cistern (1,150 °C lava pond under 3-8 cm crust), L2 Boiling Crucible | `:202-229` |
| Fauna | cinder-vipers on warm slabs and in decoy tube mouths; fissure-ibex; pyroduct swifts and cave crickets | `:265-270` |
| Banditry | no bandits named in the Twins plan. Xanadu lore: "its bandits, and the robotic stalkers" on the northern way (`LORE.md:507`); Gemini tags "Desert Nomad Bandits" on every Catch route and "Lizardman Raid Hazard" on Xanadu legs (`TRADE-GEMINI.md:389-393`) | |
| Seasons | **No season closes the Twins in any doc.** The Catch's black storms come in spring (`catch/PLAN.md:86`); the pass's own calendar is the hour of the ground's breath (`gills/PLAN.md:189-195`). Xanadu lore: northern passes "often blocked by lava flows or earthquakes" (`LORE.md:507`) | |
| Beasts | Xanadui cloud-yaks, Strongbow basalt-mules "trained to step over lava-tube floor cracks and wear leather alkali-goggles on the Catch descent" | `twins/PLAN.md:266` |

---

## 7. The sim side already built

### 7a. `core/region/data/xan-tune.js` (XAN_TUNE, the Xanadu region tune)

- **Gateways** (`:112-120`), each an **off-map pool** (`offMap`, `:327-339`: a settlement `faction:'gate'`, people 0, placed
  1,000 km off, a bazaar work with no output, `start` = its pool from `T.gatePool`), reached by one road `trade.<id>` from the
  gateway to its entry town (`minutes: days*1440`, `carriers`, `stagger`, `cap`, `keep:20`, `want: max(60, 2*days)`):
  - `gate.iziz` "Iziz (by the Catch, the Twins and Strongbow)": entry **Strongbow** (`sfgtxw10kr`), side south, **64 days**,
    **8 carriers**, cap 40,000; out goldwork, cacao, opium, tea, silk, wheels; in salt, iron, arms, pearls, oil.
  - `gate.dasri` "The Dasri (by the Catch oases and Stair)": entry Strongbow, side south, **22 days**, **6 carriers**, cap
    30,000; out cacao, tea, silk, opium; in salt only.
  - also `gate.yuni` (to Qiblai by the Geomancers' road, 48 d, 10 carriers), `gate.dalab` (the Great Caravan round, 52 d a leg),
    `gate.geomancers` (Locus oil caravans to Qiblai, 40 d, 4 carriers).
  - The days are "its whole route to the capital's market (X1 makes Strongbow and Thalaba its stages)" (`:96-98`).
  - Pools: `T.gatePool` salt 1e7, iron 1e6, arms 1e5, pearls 1e4, wine 1e6, oil 1e6, tools 1e5 (`:165`); exports wanted a day
    `T.gateWant` (`:166`), split among the gateways that carry each good (`:325, 329`).
  - Salt: the south's (Qiblai's subtree) salt is split equally among the south salt gateways (iziz, dasri, yuni), as the road's
    `expect` at Strongbow/Qiblai (`:471-477`).
- **The Two Horns** (`T.horns`, `:157-163`; wiring `:438-456`): tally **4%**, margin **3%**. Cuts on `trade.gate.iziz` and
  `trade.gate.dasri`: 4% at Strongbow to `horns.strongbow` ("the guides' tally, half at the gate"), 4% at the gate end to
  `horns.stair` ("the guides' tally outbound, at Stair"), and **the Sultan's 5% toll** at Strongbow to `xan.citadel` (`T.toll`,
  `:164`). The 3% margin is cut where factor houses stand on the Yuni and Geomancer gateways and the internal roads and the
  Great Caravan. Factions: `horns` is one of three merchant houses ("wary" of each other, friendly to all else, `:499-504`).
  The Stair house is off the map: Stair itself is not a settlement in this tune.
- `core/region/data/east-rift.js:53` adds Longsong's order to `trade.gate.iziz`.

### 7b. Caravans elsewhere

- `core/camp/PLAN.md` 6.2 (`:417-463`): "A caravan is a `SIM.trade` carrier on land", stops at caravanserais, `laager`/`line`
  night camps, 25-40 km a day for camels; danger by segment (raids). Built so far: the census and pitch, the Raptor camp, tents
  by role and culture and the caravan's night halt (`kits/tents`, `core/camp/50-camp-tents.js`) (`PLAN.md:5-6`). No caravan
  venture on the world map is built.
- `settlements/isle-demo`: merchant houses chartered from a town's treasury run its expeditions as a business
  (`src/47y-isle-houses.js`; `PLAN.md:1080`), the pattern PROPOSAL-XANADU's houses follow.
- No tune models the Catch's oases, Stair or Jabal as settlements; no oasis pattern exists on the sim. The Twins kit lists
  `core/camp`, `core/simulation` as owed ("the resting caravan in tube A1, the guides ... the camps at the Hall of the
  Tally-Marks and the oases", `biomes/twins/PLAN.md:50`).
- TRADE-SCOPE 5 (`:358`): "`SIM.trade`'s land carriers (core/camp's caravans) ... need a route rule: ... the Catch by Stair";
  2.2's works "are new hamlets (`KHAMLET.village`, salt kind) when a region with them is built".

---

## 8. Not found

- Any lore or file for **the Train of Jabal** (only Gemini's "Jabal Shiekdom").
- Any **Yuni Merchants' Guild**.
- Any **named Iziz noble house** in the merchant trade other than core/camp's five merchant houses (Getmastarz is the owner's
  Godsgate-to-Xanadu house; Saltroda the proposed salt house).
- Any season or closure for the Twins or the Godsgate; any bandit group named on the Catch road.
- A sim settlement for Stair, the oases, Jabal or the salt works; the 5.1e10 pins are held.
