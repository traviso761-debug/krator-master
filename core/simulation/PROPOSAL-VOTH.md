# Proposal: the Vothic Kingdom & Bay of Voth on the sim layer (Scale Model 5.1 census, seven-province division, estates, fleets and gateways)

Status: **Scoping proposal (2026-11-18)**, paired with the Ring Sea macro-region census (`Shumar`, `Drum`/`Torus`, `Porta Marr`/`Iziz`) on the pattern of `core/simulation/PROPOSAL-XANADU.md`. Quantitative figures come from a full pixel-by-pixel scan (`scan_voth.py` -> `voth_census_out.txt`) of Scale Model 5.1 post-`edit_513_voth` (`rmw5rzefnfapk` **"Vothic Kingdom"** and `rmuqigmn88r9w` **"Bay of Voth"**), the 39-family `kits/resources/data/geology.json` lode/placer/ruin rasters, `core/world/49r-world-resources.js` land indices, and `kits/crops` (`CROPS.at` / `CROPS.forBiome` across all 213 records).

---

## Sources & Cross-Session Locks

- **Scale Model 5.1 & bay reshape:** `tools/scale-model/model/data/` (`elev.bin`, `koppen.png`, `rain.png`, `temp.png`, `water-51.png`, `rivers.json`), `51-region-store.js`, `60-settlements.js`, and `tools/scale-model/edit_513_voth.report.json` (which reshaped Voth's bay, narrows, `21 km²` lake, and the `Turm`/`Vindos` river system).
- **Canon lore & settlement plans:** `LORE.md` (§6.2 Iziz & Hook, §6.12 Zeijani, §6.15 Vothic Kingdom, §6.16 League of Amphitriton, §6.17 Scyvoi, §6.21 Dalab, §6.23 Shumar & Free Giants), `openworld/PLAN-VOTH.md`, `openworld/PLAN-SETTLEMENTS.md`, `openworld/ANCIENT-NETWORK.md`, `settlements/voth/{README,PLAN,HANDOFF,SIM-ROADMAP}.md`, `settlements/shim/PLAN.md`, `settlements/almua/PLAN.md`, `settlements/drum/PLAN.md`, `settlements/torus/PLAN.md`, `settlements/zeydanin/PLAN.md`, and `lore/tongues-of-krator.html` (Vothic phonology and Shumari-derived script).
- **Economy, crops & vessels:** `openworld/TRADE-SCOPE.md` (§2.4 oil, §2.5 native crops, §2.7 scrap-to-iron, §8.1 Shim's `Blïtrit` + second crop, §11 Scyvoi kraals), `openworld/RESOURCES-SETTLEMENTS.md`, `kits/crops/src/`, `core/hamlet/20-hamlet-cultures.js`, `kits/ringsea/src/` (9 Vothic vessel fragments), and Gemini's draft files (`openworld/{populations,trade,trade-fleets,net51,roads-supplement}-gemini.json`, treated strictly as a non-canonical draft to audit and replace).
- **Locked sibling-session decisions incorporated here (2026-11-18):**
  1. **Drum & Torus session (`drum_stage1_blueprints.md`):** **`Drum` (`Drïm` / `Vinvolk`, `673,932`)** is locked at **`13,500` souls** (`5,400` / `40%` inside the 15-level Ruined Drum Arcology `y = 0..66 m`, housing the L01 **Under-Drum Salvage Bourse** and L02–03 **SIM Trade Galleries, Bonded Warehouses & Mushroom Vaults**; `8,100` / `60%` in concentric outer rings across `2,562` buildings). It is the seat of a **Military Governor** (`88 x 104 m` Praetorium & Levy Hall), an **Ordinator Fortress** (`68 x 76 m` Inquisition & Watch Bastion enforcing sun-orthodoxy and the ban on the Order of Historians), and **"The Cauldron"** (`92 x 80 m` Gladiatorial Arena). Its outer rings blend `1/3` **`kits/sw-arcology`** (28 silo, storage-tank, Horton-sphere, clarifier, and steel-drum industrial-salvage types — a SW Arcology vassal kit that also informs **Torus**), `1/3` **`voth-scrap`**, and `1/3` **`post-apoc`**, ringed by Ancient inner wall `W1` (`r = 402 m`) and outer wreck palisade `W2` (`r = 636 m`, `118` ruined `kits/motor-vehicles` hulls). **`Torus` (`774,1007`)** pairs its living Forest Ring barrel arcology with Soleri-style `kits/metropolis` / `kits/sw-arcology` planned farm-terrace pods.
  2. **Porta Marr / Iziz session (`marr_layout_and_blueprint.md`):** **`Marr` (`Porta Marr`, `sxmeztkqg7`, `926,1017`)** stands at **`~20,000` souls** as the **foremost ocean-going port of the Empire of Iziz** (eclipsing Port Tobin `956,943`), seat of the **Navigators' Guild (`Gilda de Navigadarz`)** holding the *Greta Charta de Rriñ*, and notorious for **smuggling and privateering** across the Ring Sea — acting alongside Iziz's reconquest of **`Hook` (`809,923`)** as Voth's primary naval rival and illicit contraband counterpart.
  3. **Shumar session (`msg_shumar_answers.txt` & `shumar_census_out.txt`):** Paired mountain-pass forts **`Tallhouse`** (`683,1184`, Free Giants/Vrivolci) and **`Ṭāru-Bētun`** (`689,1185`, Shumar) lock the southern pass above **`Driyan`** (`725,1141` pin vs `705,1129` Ancient-trunk candidate); guarded cold-truce **grain-for-mounts barter** runs only through **`Suṭōn-Qappu`** under a strict bilateral embargo on arms, metals, and books.

---

## 1. Physical Geography, Climate & Hydrology (Scale Model 5.1 post-`edit_513_voth`)

### 1.1 Polygon Footprint & Hypsometry: Two Atmospheric Worlds

On the 5.1 `2 km` raster (`4 km²/px`), **`Bay of Voth` (`rmuqigmn88r9w`)** lies **100% inside** **`Vothic Kingdom` (`rmw5rzefnfapk`)**:

| Region ID | Name | BBox (`px`) | Span (`km`) | Total (`km²`) | Land (`km²`) | Water (`km²`) | Sea / Lake Split & Shoreline |
|---|---|---|---|---:|---:|---:|---|
| `rmuqigmn88r9w` | **Bay of Voth** | `733..750, 1000..1027` | `34 x 54` | **1,216** | **1,052** (`263` px) | **164** (`41` px) | `-1,500.2 m` Ring Sea bay, narrows & Voth's `21 km²` inner lake (`edit_513_voth`); land shelf `-1,500..-1,208 m` (`1.88 atm`, `XA` `99.6%`, `31 °C`, `1,898 mm`) |
| `rmw5rzefnfapk` | **Vothic Kingdom** | `550..849, 832..1196` | `598 x 728` | **176,304** | **133,408** (`33,352` px) | **42,896** (`10,724` px) | **`32,792 km²` Ring Sea** (`-1,500.2 m`, `~2,432 km` sea shore) + **`10,104 km²` inland lakes** (`~1,200 km` lakeshore) |

Unlike landlocked highland polities, Voth straddles **two distinct atmospheric and ecological regimes** separated by `1,500–3,000 m` crater and rift scarps — **50.3% of its land (`67,104 km²`) lies below planetary datum (`< 0 m`)** in the hot, thick-air Ring Sea basin, while **49.7% (`66,304 km²`)** rises across the temperate SW Lowlands (`Shim`), Shumari foothills (`Driyan`), and cloud-forest scarps (`Torus`/Talovolci):

| Elevation Band (`m`) | Land Area (`km²`) | Share | Mean Pressure (`atm`) | Median Rain (`mm/yr`) | Mean Temp (`tm °C`) | Dominant Landform & Core Provinces |
|---|---:|---:|---:|---:|---:|---|
| `< -1,400` (sea level `-1,500.2 m`) | 3,500 | 2.6% | **1.92** | 2,290 | 32.0 | Bay of Voth shelf, Throne spice beaches, Almua/Toruslittoral (`V1, V4, V6, V7`) |
| `-1,400 .. -1,000` | 25,428 | 19.1% | **1.85** | 1,647 | 30.2 | Dense-air coastal benches: Turm delta, Almua–Drum plain, Temora/Zey'danin (`V1, V4, V7`) |
| `-1,000 .. -500` | 27,124 | 20.3% | **1.76** | 988 | 28.0 | Dry savanna & monsoon interior (`Drïm` basin, `Tzunfort`, lower `klir` gorge; `V4, V5`) |
| `-500 .. 0` | 11,052 | 8.3% | **1.66** | 894 | 25.6 | `Lake of Shim` (`-9.2 m`) shoreline flats, `Wing` gorge, NW Nazar floor (`V2, V5`) |
| `0 .. +300` | 12,276 | 9.2% | **1.57** | 1,192 | 23.0 | Old Shim plantation plain, `Sethas` & `Azoth` lake benches, central Nazar (`V2, V5`) |
| `+300 .. +600` | 14,228 | 10.7% | **1.51** | 1,098 | 21.4 | `Driyan` foothill apron (`490–589 m`), upper Nazar, Tors/Turm middle valleys (`V2, V3, V5, V6`) |
| `+600 .. +1,000` | 15,344 | 11.5% | **1.45** | 988 | 19.8 | SW Lowland rolling hills, Shumari outer benches, Talovolci lower cloud-forest (`V2, V3, V5, V6`) |
| `+1,000 .. +1,800` | 13,928 | 10.4% | **1.35** | 1,098 | 16.7 | Lake-1067 highland basin, saltpeter/skarn ridges (`669,1069`), Shumari scarps (`V3, V5`) |
| `+1,800 .. +3,000` | 9,748 | 7.3% | **1.22** | 1,286 | 13.0 | High Shumari pass (`Suṭōn-Qappu` / `Taru-Vakt`), Lake-2281, Vrivolci/Talovolci crests (`V2, V3, V6`) |
| `> +3,000` (max `+3,198 m`) | 604 | 0.5% | **1.09** | 1,631 | 5.7 | Uninhabited boundary peaks above `Driyan` (`3,082 m`) and `Torus` (`3,198 m`) |

**Land Köppen breakdown (`133,408 km²`):** `Csa` warm-summer Mediterranean (`31,436 km²`, `23.6%`), `Aw` tropical savanna (`31,264 km²`, `23.4%`), `Cfa` humid subtropical (`26,920 km²`, `20.2%`), `Af` tropical rainforest (`15,456 km²`, `11.6%`), **`XA` dense-air hyper-tropical littoral (`12,728 km²`, `9.5%`, `tm >= 30 °C` at `1.85–1.93 atm`)**, `Am` tropical monsoon (`5,084 km²`, `3.8%`), **`XV` dense-air dry savanna (`4,900 km²`, `3.7%`, around `Tzunfort`/NW `Drum`)**, `Dsb` (`1,476 km²`, `1.1%`), `BSh` hot semi-arid (`1,284 km²`, `1.0%` — Voth's sole nitre/saltpeter pocket at `669,1069`), `Csb` (`1,240 km²`, `0.9%`), `WS` wet lakeshore (`1,064 km²`, `0.8%`), `Dfb/Cfb` (`556 km²`, `0.4%`).

### 1.2 Polygon Overlaps & Frontier Neighbours

`rmw5rzefnfapk` overlaps physical sub-regions `SW Bay` (`83,516 km²`), `SW lowlands` (`63,456 km²`), `West Ring isles` (`20,920 km²`), **`Ruins of Nazar`** (`15,664 km²` inside Voth out of `20,352 km²`), **`Talovolci Chiefs`** (`13,720 km²` lower-slope overlap + `10,220 km²` 16 km border), `Volcano` / Throne skirt (`8,464 km²`), `sw highlands` (`2,784 km²`), `s highlands` (`2,584 km²`), and `Lake of Shim` (`372 km²` core label inside the `5,620 km²` Vothic portion of the Great SW Lake).

Along its perimeter, Voth shares direct political borders (or contested frontier overlaps) with **ten polities/peoples**:
1. **`Shumar`** (`2,888 km²` conquered foothill overlap around `Driyan` + `3,948 km²` 16 km pass border).
2. **`Free Giants` / `Vrivolci` (`Greenstep`)** (`512 km²` overlap + `2,252 km²` 16 km border S of `Azoth` and `Shim` — prime haven for escaped plantation slaves at `Tallwalls` `650,1268`).
3. **`Realm of Dalab`** (`2,056 km²` 16 km border across the western Great SW Lake toward `Dapor` `519,1152`, `Dayshun` `513,1081`, and `Span` `562,1022`).
4. **`Frogmen`** (`2,688 km²` 16 km marsh border W of `Nazar` around `Krrmt` `557,1080`).
5. **`Scyvoi`** (`64 km²` overlap + `2,848 km²` 16 km steppe border NW of `Drum` and `Tzunfort`, facing Baelu kraals `B7` `652,907` and `B1` `651,857`).
6. **`League of Amphitriton`** (`1,152 km²` maritime/coastal overlap + `3,328 km²` 16 km border facing `Tethis` `678,828` and `Nereus` `762,803`).
7. **`Empire of Iziz`** (`868 km²` 16 km strait/land border across the **`Hook` (`809,923`)** peninsula, freshly recaptured from Voth by Izani mechs).
8. **`Hookfleet`** (`436 km²` 16 km maritime border off the Throne toward `Port Mira` `864,897` and `Noah's Regret` `836,920`).
9. **`Talovolci Chiefs`** (`Spirladunon` `800,1017`, 52 km up the Izani highway from `Torus`, and Iziz-aligned `Daridel` `799,1095`).
10. **`West Ring Islanders` & `Zeijani`** (on the Throne above `Zey'danin` `795,860`: `Šurpu-Dhelv` `806,818` and `Qarnu-Tūbu` `834,882`).

### 1.3 Four Hydrological Systems & Geothermal Vents

Sixty named rivers (`Q >= 10 m³/s`) cross or feed the Kingdom, organized into four transport and irrigation basins:

1. **The Great Lake of Shim & `klir Rivrh` Artery (`Q = 5,744.4 m³/s`):**
   - Ten perennial highland rivers pour off the Shumari, Vrivolci, and Nazar rims into the **`-9.2 m` freshwater Lake of Shim** (`5,620 km²` in V2 + `~3,900 km²` western arm in V5/Dalab): **`Bētun-Nārun`** (`r007`, `604.8 m³/s`, 174 km, joined by **`Dōriyan-Nārun`** `r284`, `73.2 m³/s`), **`Dubnosriba`** (`r011`, `422.8 m³/s`, 211 km), `Clodosriba` (`r030`, `131.3 m³/s`, from `Tallwalls`), **`Sharf Rivrh`** (`r034`, `118.0 m³/s`, 137 km, past `Driyan` `705,1129`), `Ixosriba` (`r039`, `105.0 m³/s`), `Rixosbruk` (`r060`, `71.6 m³/s`), `mist Brük` (`r104`, `44.0 m³/s`, at `Shim`), and four Yusar-named Nazar rivers (`Waywater Sleepdown` `r117` `41.0 m³/s`, `Waywater Golddeep` `r124` `38.3 m³/s`, `Runbrook Golddeep` `r161` `29.2 m³/s`, `Runbrook Watchstill` `r171` `27.1 m³/s`).
   - From `Shim` (`654,1118`) at the lake's north-east throat, the immense **`klir Rivrh` (`r000`, `Q = 5,744.4 m³/s`, 205 km)** cuts north down the `1,490 m` drop past **`Wing` (`699,1042`)** (joined by `Brant Rivrh` `r273`, `78.6 m³/s`) to empty into the SW Bay of the Ring Sea at `(700.6, 1023.0)`. As noted in `settlements/shim/PLAN.md` and `trade-fleets-gemini.json`, 50 m **`voth_barge`** river craft navigate the Lake of Shim and upper/lower reaches, making `Shim` and the `klir` mouth Voth's heaviest inland bulk corridor.
2. **The Bay of Voth & Eastern Scarp Rivers (post-`edit_513_voth`):**
   - `edit_513_voth` sculpted the **`Turm Rivrh` (`r029`, `Q = 289.4 m³/s`, 117 km)** and its great Talovolci tributary **`Vindos Rivros` (`r023`, `Q = 157.5 m³/s`, 130 km)**, together with `Silvr Rivrh` (`r347`, `47.6 m³/s`), `Gowld Brük` (`r348`, `31.3 m³/s`), `Stil` (`r337`, `30.9 m³/s`), `Vayt` (`r335`, `21.2 m³/s`), and `Krown` (`r336`, `20.1 m³/s`), discharging at `(741.91, 1018.45)` through Voth's narrows and `21 km²` inner harbour lake into the `Bay of Voth`.
   - Flanked west by `Flint Rivrh` (`r115`, `41.2 m³/s`) and `Kowld Rivrh` (`r126`, `38.7 m³/s`), and east in `Torus`'s province by **`Tors Rivrh` (`r072`, `59.3 m³/s`)**, `Shvarts Brük` (`r065`, `64.6 m³/s`), `brayt Rivrh` (`r131`, `35.3 m³/s`), and `Dip Brük` (`r159`, `29.4 m³/s`).
3. **The Northern Dryland & Fleet Coast Rivers (`V4`):**
   - **`Drïm Rivrh` (`r058`, `Q = 74.7 m³/s`, 207 km)** waters `Drum` (`673,932`) before reaching the Ring Sea at `(688.5, 910.8)`.
   - **`Dip Rivrh` (`r863`, `Q = 38.3 m³/s`, 89 km)** feeds **`Almua`'s** sheltered `1,235 km²` coastal lagoon/estuary (`710.6, 888.8` -> `720.6, 876.8`), while `Brik Gülch` (`r646`), `Hafn Gülch` (`r650`), `Sharf Gülch` (`r744`), and `Krown Gülch` (`r748`) form seasonal wadis along the Scyvoi march.
4. **Highland Through-Lakes & Throne Geothermal Vents (`V3`, `V4`, `V7`):**
   - In `V3`, `Uarosriba` (`r069`, `62.4 m³/s`) feeds a deep **`449 km²` foothill lake at `+1,067 m`** (`738.6, 1117.1`), with a second `80 km²` alpine lake at `+2,281 m` (`782.7, 1123.1`).
   - Across `V4` (NE of `Almua` at `729,877` & `731,877`) and `V7` (`Kautono` `749,895`, `749,927`, and the Throne skirt at `791,889`, `805,905` plus a **`48 km²` endorheic salt lake at `768.6, 890.8`, `-1,408 m`**), **6 active geothermal geyser fields** precipitate planetary-grade volcanic **sulfur (`byte = 252`)** and epithermal copper-gold-silver lodes.

---

## 2. 39-Family Geology, Ancient Ruin Salvage & Native Crop Ecology

### 2.1 Rock Provinces & the 39 Mineral Families (`kits/resources/data/geology.json`)

Over `8,395` geology cells (`134,320 km²` land at `16 km²/cell`), Voth's bedrock is **`80.4%` sedimentary (`107,984 km²`)**, **`7.5%` granite (`10,112 km²`)**, **`6.4%` crystalline (`8,656 km²`)**, **`4.7%` volcanic (`6,320 km²`, Throne & NE Almua)**, **`0.8%` impact (`1,088 km²`, eastern scarp behind Torus)**, and **`0.1%` evaporite (`160 km²`)**, with `0 km²` ultramafic.

Scanning all 39 mineral families (`Good >= 120`, `Rich >= 180`; zero hits in Voth for `glass`, `lodestone`, `opal`, `diamond`, `jade`):

| Family | Good (`km²`) | Rich (`km²`) | Max Byte | Peak (`px`) | Good Yield | All Yield | Strategic & Sim Significance for Voth |
|---|---:|---:|---:|---|---:|---:|---|
| **Iron** (`iron` + `skarn`) | **42,960** | **23,248** | **255** | `619,1063` / `754,1115` | **3,022.5** | 4,462.0 | **Planetary superpower (#2 after Fulcrum):** colossal red-bed & skarn iron in `V5`, `V3`, `V6`, `V2`, `V1` (`Voth iron mine` `732,1014`). Fuels the Legion, fleet rams, and Chichani mail |
| **Coal** (`coal`) | **30,448** | **3,248** | **215** | `722,998` | **1,699.0** | 3,407.5 | **Major exporter:** rich seams right behind Voth Bay (`722,998`), `Almua`–`Drum` (`758,963`), `Torus` (`765,998`), `Shim` (`672,1144`), and `Temora` (`751,861`). Fires Voth's smelters and Drum/Almua scrap furnaces |
| **Tin** (`tin`) | **10,112** | **10,112** | **200** | `734,1023` / `689,1172` | **511.0** | 659.0 | **#1 world tin producer (`Voth` `41.4 t`):** granite lodes in every province + **36 alluvial tin placers** (`r007` load `12.54`, `r284` `12.46`, `r058` `9.17`, `r159` `6.95`, `r065` `6.60`, `r000` `5.03`) |
| **Silver** (`silver`) | **12,688** | 0 | **150** | `821,891` / `730,877` | **476.0** | 486.5 | **#1 & #2 world pins (`Zey'danin` + `Voth`):** volcanic/granite veins on the Throne (`V7`), NE of `Almua` (`V4`), and `V5`/`V1`. Backs Vothic silver coinage against the Izani Talent |
| **Gold** (`gold`) | *12,688 raw -> **toned down*** | 0 | *< 110 (tuned)* | *minor placers only* | ***~35–60 (toned down)*** | *low* | **[OWNER RULING — TONED DOWN SIGNIFICANTLY]:** Suppress `geology.py` mainland Vothic lode/placer gold (`V1`/`V3`/`V4`) so Voth is **gold-scarce** domestically and must acquire Sun-Temple & royal bullion via **Talovolci `C4`**, **West Rift**, **Throne**, and maritime trade/tribute |
| **Sulfur** (`sulfur`) | **2,256** | **1,008** | **252** | `730,877` / `790,887` | **417.5** | 741.5 | **39.6% of world supply:** geyser sublimates NE of `Almua` (`730,877`) and on the Throne (`790,887`). Exported across the Ring Sea — yet useless for domestic gunpowder without saltpeter! |
| **Copper** (`copper`) | **9,664** | **6,464** | **210** | `821,891` / `730,877` | **369.0** | 801.5 | **#2 world pin (`Zey'danin` `225 t`):** massive Throne volcanic porphyry (`V7`), NE `Almua` (`V4`), and `Nazar`/`Driyan` skarns (`V5, V3`). Pairs with Vothic tin for naval bronze |
| **Silica & Kaolin** | 7,760 / 12,688 | 0 | 140 / 110 | `706,966` / `730,877` | **354.0** / 0 | 2,001 / 428 | Glass sand & stoneware clays; Voth makes utilitarian amphorae (`Almua`), importing fine glass (`Jimjam`/`League`) and porcelain (`Fulcrum`) |
| **Lead & Zinc** | 0 / 10,080 | 0 / 0 | 110 / 125 | `821,891` / `619,1063` | 0 / **280.5** | 513.5 / 478 | Cupellation lead for silver refining (`V7, V5`) and calamine brass (`V5, V3`) |
| **Rare Earths** | **10,112** | 0 | 120 | `734,1023` | **258.5** | 405.5 | **Tech-locked:** Voth lacks pre-Cataclysm chemical separation; lies unworked in granite sand unless smuggled as raw heavy sand |
| **Marble & Limestone** | 2,448 / 0 | 0 / 0 | 140 / 100 | `692,1076` | **122.5** / 0 | 150.5 / 3,477 | Fine white/veined marble on the upper `klir` / N `Shim` rim (`V5/V2`) for Voth's stepped Sun-Temples and palace ashlar; ubiquitous limestone (`80%` sedimentary) |
| **Oil & Bitumen** | **3,152** / 0 | 0 / 0 | 130 / 100 | `726,1003` / `761,870` | **66.5** / 0 | 865.0 / 152.5 | **Tech-locked (`TRADE-SCOPE.md` §2.4):** good pools sit 32 km NW of `Voth` (`726,1003`) and 26 km N of `Temora` (`761,870`), but **only Geomancers can drill oil** (20% royal + 10% temple cut if licensed — §6 Q6). Surface bitumen (`152.5` all) caulks `Almua` & `Shim` hulls |
| **Nickel** (`nickel`) | **720** | **432** | **220** | `788,986` | **44.0** | 49.0 | Impact-melt sulfide lode on the scarp behind `Torus` (`V6`, shared with Talovolci `Spirladunon`); makes meteoric-grade armour steel |
| **Emerald, Amber, Turquoise** | 448 / 0 / 0 | 0 | 130 / 90 / 90 | `748,858` / `724,994` | **15.0** / 0 / 0 | 22 / 56.5 / 5.5 | Small emerald pocket W of `Temora` (`V7`) and fossil amber behind `Voth Bay` (`V1`) for noble/priestly regalia |
| **Saltpeter (`nitre`)** | **96** | 0 | **121** | `669,1069` | **4.0** | 104.5 | **CRITICAL BOTTLENECK:** only **6 cells (`96 km²`)** of good nitre in the entire Kingdom, in a single `BSh` rain-shadow pocket at `(669,1069)` in `V5`! Explains why Voth has abundant sulfur & charcoal yet depends on smuggled gunpowder/arms (`Porta Marr` / `Hookfleet`) and relies on its heavy iron Legion rather than massed musketry |
| **Halite (`salt`)** | **16** | 0 | **189** | `746,858` | **1.0** | 501.0 | Almost zero rock salt onshore (`1 cell` in `V7`), **solved by the sea:** `203` warm coastal cells (`~406 km` dry/seasonal shore around `Almua` `720 t` and `Voth` `568 t`) plus `V7`'s `48 km²` salt lake make Voth **self-sufficient and a net salt exporter** |

### 2.2 Three Ancient Ruin Clusters (`14,320 km²`) & Scrap-to-Iron Smelting

The geology `ruin` layer (`895` cells = **`14,320 km²`** inside `rmw5rzefnfapk`) reveals **three distinct pre-Cataclysm ruin zones** inside Vothic borders, tying geography directly to Voth's slave castes, client ruin-tribes, and smelter economy (`TRADE-SCOPE.md` §2.7):

1. **`Ruins of Nazar` (`s3i61t95z5`, `582,1079` in `V5`):** **`13,392 km²`** inside Voth (`17,120 km²` total cluster). A colossal ruined megacity basin W of Shim. Source of the enslaved **Nazarites**, high-grade structural scrap, and illicit relics — and the primary magnet for underground **Order of Historians** expeditions whom Voth's **Ordinators** hunt on sight (`LORE.md` §6.15).
2. **`Agropolis` (`sc3u7qalqi`, `717,917` in `V4`, midway on the trunk road between `Drum` and `Almua`):** **`512 km²`** ruin cluster on prime `Aw` farmland (`farm = 1.00`). **[OWNER RULING — LOCKED]:** The **Agropolitans (`4,000` in all)** are **NOT enslaved**, but a **free semi-nomadic ruin-tribe in a Vothic client-state treaty relationship analogous to `Torus`**, making their living as **mobile scrap-merchants (`KCAMP` salvage caravans + `Agropolis` winter/sorting camp)** who quarry and broker structural steel/copper scrap to **`Almua`'s `162 t/yr` bloomeries and `Drum`'s L01 Under-Drum Salvage Bourse (`50 t/yr` cupolas)**!
3. **`Wing` (`sjgv4qfmg4`, `699,1042` in `V5`, astride the `5,744 m³/s` `klir Rivrh`):** **`416 km²`** ruined arcology cluster at the river's northern canyon gate. Source of the enslaved **Wingmen**; barges float Wing's heavy steel plate down to the bay or up toward `Shim`.
4. **Living / Semi-Ruined Arcologies (`Drum` `673,932` in `V4` & `Torus` `774,1007` in `V6`):** Occupied by Voth's client arcology peoples (**Vinvolk** at Drum, **Rinkvolk** at Torus, alongside the **`4,000` semi-nomadic Agropolitan scrap-merchant client tribe**), governed under Vothic praetors/treaties and Ordinator bastions, building in **`kits/sw-arcology`** industrial-tank salvage alongside `voth-scrap`.

### 2.3 Agricultural Potential & Native Crop Ecology (`CROPS.at` + `TRADE-SCOPE.md` §2.5 & §8.1)

Across `133,408 km²` of land, `49r` yields **`92,812.8` farm-equivalent km²** (`73,540.4` strict `49r`, with `107,932 km²` scoring `>= 0.50` and `9,456 km²` prime river-corridor alluvium), **`77,425.3` pasture-equivalent km²**, and **`85,735.6` timber-equivalent km²**.

Running `kits/crops` (`CROPS.forBiome` and `CROPS.at` with verified `{warmth, atm, arid, wet, salt, heated}` signatures across Voth's five sub-climates) and applying the **Native Crop Rule (`TRADE-SCOPE.md` §2.5, §8.1)**:

| Sub-Climate / Biome Zone | Provinces | `CROPS.at` Count | Staple Grains, Pulses & Tubers | Signature Cash Crops, Fibres, Dyes & Fungi (Canon + `kits/crops`) |
|---|---|---:|---|---|
| **Dense-Air Bay & Littoral** (`swbay`, `warm=5, atm=2, arid=1..2`) | `V1`, coastal `V6`, `V7` | **84–99** | Paddy **`rice`** (wet river flats), `ashmillet`, `bambara`, `taro`, `sweet-potato`, `cassava`, `breadfruit`, `banana`, `coconut`, `avocado` | **`bay-purple`** (`HOME_ONLY` coastal murex snail dye — *royal monopoly*), **`dragons-blood`** (`HOME_ONLY` red resin), **`rosette-vanilla`** (`swbay` native orchid spice), **`capgill`** (painkiller), **`beadcone-silk`** (wild gold silk), **`indigo`**, **`annatto`**, **`tobacco`**, `cacao`, `coffee`, **Sunboll `cotton`** |
| **SW Lake & Estate Lowlands** (`swlowlands`, `warm=3..4, atm=1..2, arid=2`) | `V2` (`Shim`, `Azoth`, `Sethas`), low `V5` | **115–132** | **`emmer`** wheat, chinampa **`rice`**, `chickpea`, `lentil`, `sweet-potato`, `whorl-olive`, `canyon-grape`, `pomegranate`, `fig` | **`Blïtrit`** (*proposed `kits/crops` addition*: blood-reed crimson-purple dye, Shim slave-estate staple, `homeOnly: ['swlowlands']`), **Sunboll `cotton` & `rattlepod` ("Rattle coffee", `HOME`)** *replacing Gemini's non-native `sugar-cane`* (`TRADE-SCOPE.md` §8.1), `flax`, `mulberry`, `saffron`, `hill-terracotta` & `verdigris` (`HOME_ONLY` pigments) |
| **Shumari Foothills & Scarps** (`shighlands` / `swhighlands`, `warm=2..3, atm=1`) | `V3` (`Driyan`), high `V2/V5/V6` | **62–77** | **`frostoat`**, `barley`, `rye`, `helix-bean`, `fava`, `potato`, `turnip`, `apple`, `walnut`, `tamarillo` | `flax` (linen), `tea`, `sky-poppy` (medicinal), `madder`, `weld`, `coilbark-split` (fuel), **`clifflung`** (imported/gathered on Talovolci border in `V6` for high-tensile ship cordage) |
| **Northern Crater Drylands** (`crater-drylands`, `warm=4..5, atm=2, arid=3`) | `V4` (`Drum`, `Almua`, `Tzunfort`) | **72–86** | Drought-hardy **`ashmillet`**, `sorghum`, `cowpea`, `pigeon-pea`, `parasol-nut`, `fireseed` (oilseed), `mesquite`, `carob`, `prickly-pear` | **`sisal`** & `yucca-stalk` (dryland cordage for `Almua`'s arsenal), **Sunboll `cotton`** (irrigated along `Drïm`/`Dip` rivers), `burn-black` dye; **Dark-grown `alecap`, `pale-fungi`, `lamp-cap` & `glow-mushroom`** inside **`Drum`'s L02–03 Arcology Mushroom Vaults**! |
| **Throne Spice Skirt & Isles** (`throne` + `ringisles`, `warm=5, atm=2, arid=0..1`) | `V7` (`Zey'danin`, `Temora`, `Kautono`) | **94–152** | `taro`, `breadfruit`, `banana`, `coconut`, `rice`, `winged-bean`, `kelp` | **Spice Isles `clove`**, `nutmeg`/`isle-spice`, `cacao`, `coffee` & `tobacco` **replacing failing pre-war Izani `Ranj` orchards** (`settlements/zeydanin/PLAN.md`), `kava`, `reef-teal` & `tar-black` Islander dyes, plus volcanic `fumarole-ochre`, `sulfur-yellow`, and Zeijani **`alecap` / `pale-fungi`** |

> **Correction to Gemini's crop output:** Gemini (`trade-goods.json`) assigned `Voth` **`25,200 t` of `sugar` (#1 in the world)** and **`202 t` of `rum`**. Under the Native Crop Rule (`TRADE-SCOPE.md` §2.5 & §8.1), `sugar-cane` is native to the Ring Isles (`Kautoa` / `West Ring Islanders`), **not** the Vothic mainland (`Shim`'s `swlowlands` or `Bay of Voth`). Mainland sugar/rum are **dropped** (save small Islander plots in `V7` if desired); `Shim`'s slave estates instead pair **`Blïtrit` purple** with **Sunboll `cotton`** and/or **`rattlepod` coffee** (§6, Q5).

---

## 3. Provincial Division: Seven Provinces Partitioning `rmw5rzefnfapk` (`V1`–`V7`)

Voth's political geography is shaped by a sharp historical dualism (`LORE.md` §6.15): the **Chichani conquerors** descended from the Throne first built their lake-kingdom at **Old `Shim`** (`Sim-Tzan`), absorbed literacy and stone administration from conquered Shumari **`Driyan`**, reduced the **`Nazar`**, **`Wing`**, and **`Agropolis`** survivors to estate slavery, bound the living arcologies of **`Torus`** (*Rinkvolk*) and **`Drum`** (*Vinvolk*) as tribute-paying vassal marches under Military Governors and **Ordinators**, and finally moved the royal seat down to the Ring Sea at **`Voth`** (`Tzintzun-Bē`) to contest maritime hegemony and seize the Throne spice ports (**`Zey'danin`**, **`Temora`**).

We partition **100.0% of `rmw5rzefnfapk` (`44,076` cells = `176,304 km²` total; `33,352` land cells = `133,408 km²`)** into **seven provinces** (4 core/lowland provinces + 2 arcology/frontier marches + 1 overseas spice captaincy). Coined Vothic names strictly follow `lore/tongues-of-krator.html` phonology (**no `c, f, j, q, w, x`**; `s -> tz`, `sh -> s`, `f/w -> v`, `u -> ï`, final `-er -> -rh`).

| # | Province (Vothic / Gloss) | Seat(s) | BBox (`px`) | Land (`km²`) | Water (`km²`) | Med Elev / `atm` | Dominant Köppen | `49r` Farm-eq (`km²`) | Existing + Proposed Named Pins | Signature Role & Exports |
|---|---|---|---|---:|---:|---|---:|---:|---|---|
| **V1** | ***Tzintzun-Bē*** (Sun-King's Bay / Crown Demesne) | **Voth** (`742,1018`) | `712..761, 968..1051` | 11,120 | 4,884 | `-971 m` (`1.81`) | `XA, Af, Am` | 7,768 | **2** (`Voth`, `Ayirn-Krak` iron mine) + **4** (`Kol-Grïb`, `Bē-Tzalt`, `Tïrm-Brik`, `Gowld-Vald`) | Royal capital, Sun-Temple treasury, Legion arsenal, **`bay-purple`** murex monopoly, coal (`max 215`), iron, tin, vanilla, tobacco |
| **V2** | ***Sim-Tzan*** (Land of Shim / Old Lake & Estate Core) | **Shim** (`654,1118`) | `626..697, 1080..1196` | 24,688 | 5,620 | `+618 m` (`1.48`) | `Cfa, Csa, Af` | 18,481 | **3** (`Shim`, `Azoth`, `Sethas`) + **4** (`Blïtrit-Lant`, `Lēk-Kol`, `Rïd-Krak`, `Tin-Bïrk`) | Old Chichani ritual heartland & Kingsmoot; noble **slave plantations** (`Blïtrit` purple, Sunboll cotton / rattlepod, grain); `50 m` lake barges |
| **V3** | ***Driyan-Mark*** (Conquered Shumari Foothill March) | **Driyan** (`725,1141` / `705,1129`) | `698..788, 1084..1173` | 15,828 | 652 | `+1,560 m` (`1.32`) | `Csa, Cfa, Dsb` | 8,786 | **1** (`Driyan`) + **3** (`Taru-Vakt` pass fort, `Hok-Lēk`, `Ozt-Ayirn`) | Conquered Shumari scribes, linen/wool weavers, skarn **iron (`gy=647.5`)**, gold/tin placers, and guarded **`Suṭōn-Qappu`** grain-for-mounts truce gate |
| **V4** | ***Almua-Drïm*** (Northern Fleet Coast & Dryland March) | **Almua** (`718,883`) & **Drum** (`673,932`) | `637..761, 858..967` | 30,904 | 7,956 | `-828 m` (`1.77`) | `Aw, XV, XA` | 24,484 | **4** (`Almua`, `Drum`, `Tzunfort`, `Agropolis`) + **3** (`Gēzrh-Vïrk`, `Drïm-Vord`, `Kïzt-Kol`) | Northern **Royal Fleet Arsenal** (`Almua` — primary naval base post-`Hook`), **Drum Arcology** (`13.5k`, Salvage Bourse, Mushroom Vaults, Ordinators), `Agropolis` scrap smelting, coal, sulfur (`max 252`), solar salt (`720 t`), Scyvoi frontier |
| **V5** | ***Vink-Nazarh*** (Wing & Nazar Salvage Borderland) | ***Klir-Havn*** (`711,1012`) & **Vink-Lēgrh** (`700,1040`) | `550..711, 968..1133` | 31,036 | 6,044 | `+313 m` (`1.54`) | `Csa, Aw, Cfa, BSh` | 21,812 | **2 ruins** (`Wing`, `Nazar`) + **5** (`Klir-Havn`, `Vink-Lēgrh`, `Nazarh-Vakt`, `Tzaltpētrh-Krak`, `Vēzt-Mïnd`) | **`13,712 km²` Ancient ruin ground**; Ordinator anti-Historian cordon; penal scrap & white **marble** quarries; Voth's richest **iron (`gy=993.5`)**, **tin (`gy=198`)**, and **ONLY good saltpeter (`669,1069`)**; `klir` barge transfer |
| **V6** | ***Tors-Rink*** (Torus Arcology & Talovolci Scarp March) | **Torus** (`774,1007`) | `762..795, 936..1050` | 7,084 | 5,568 | `-265 m` (`1.65`) | `Af, XA, Csa` | 3,934 | **1** (`Torus`) + **3** (`Tors-Gēt`, `Grē-Krak`, `Svartz-Vakt`) | Living **Torus** barrel arcology + Soleri farm pods (*Rinkvolk* granary); ship-timber (`wood=253`), **impact nickel (`max 220`)**, Talovolci `Spirladunon` trade (`clifflung` rope & hillmen), and front line **36 km S of Iziz-held `Hook`** |
| **V7** | ***Zei'danin-Temora*** (Overseas Throne & Strait Spice Captaincy) | **Zey'danin** (`795,860`) | `738..849, 832..935` | 12,748 | 12,172 | `-1,130 m` (`1.84`) | `XA, Af, Am` | 7,548 | **4** (`Zey'danin`, `Temora`, `Tzinguard`, `Kautono`) + **4** (`2` Islander villages, `Thron-Bïrn`, `Gowld-Kïzt`) | **Cut-off overseas colonial captaincy** across the `Hook` strait: Spice Isles `clove`/`isle-spice`, coffee/cacao estates, planetary-tier **copper (`max 210`)**, **silver (`max 150`)**, **gold (`max 140`)**, **sulfur (`max 252`)**, coal & emerald |
| **ALL** | **Vothic Kingdom** | **Voth** | `550..849, 832..1196` | **133,408** | **42,896** | `-27 m` (`1.61`) | — | **92,813** | **15 existing** (14 inhabited + `Agropolis`/`Wing`/`Nazar` ruins) + **24 proposed** | **485,000 total souls** (`185,020` urban/works + `299,980` rural/plantation) |

*(Note on **`Nephtos` (`sezlil6yjd`, `919,762`)**: in `settlements/isle-demo/PLAN.md` §15 and `populations-gemini.json`, `Nephtos` (`1,250–1,552` pop, East Ring Isles) is canonically a **Hykkousoi League of Tethys** colony, **not** a Vothic crown possession. Voth's overseas colonial spice factories are **`Zey'danin`**, **`Temora`**, **`Kautono`**, and **`Tzinguard`** (`V7`), while `Nephtos` serves alongside Izani **`Porta Marr`** as the critical neutral/contraband transshipment entrepôt where embargoed Vothic silver, sulfur, and purple cloth swap flags — see §5.2 and §6 Q3.)*

---

### 3.1 Province Details, Verified Candidate Pins, Social Structure & Kits

Every proposed pin `(X, Y)` below has been verified on the 5.1 `water-51.png` and `elev.bin` rasters to be **dry land (`water = 0`)** with gentle buildable slope (`sl <= 0.045`).

#### V1 — *Tzintzun-Bē* (Crown Bay & Turm-Vindos Demesne)
- **Geography:** `11,120 km²` land + `4,884 km²` sea/bay (`Bay of Voth` `rmuqigmn88r9w` at its core). Sheltered dense-air amphitheatre (`-1,500..-900 m`, `1.88 atm`, `30–32 °C`, `1,898 mm`) fed by the reshaped `Turm` (`289 m³/s`) and `Vindos` (`158 m³/s`) rivers (`edit_513_voth`).
- **Existing & Proposed Pins:**
  - **`Voth`** (`s3n66733vo`, `742,1018`, `-1,500 m`): **54,020 souls** (`53,387` free citizens + `633` household/dock slaves, exact `1:1` census from `settlements/voth/HANDOFF.md`). Royal Palace, Great Stepped Sun-Temple (*"Dha Tzun it vïrhst"*), Grand Harbour, Naval Arsenal, Mint, Royal Dyers (`bay-purple`), Ordinator High Seat.
  - ***Ayirn-Krak*** (`sowif50v6z`, `732,1014`, currently `"Voth iron mine (to be named)"`, `-1,180 m`, linked by 44 km highway): **900 souls**. Crown iron & tin lode works feeding Voth's Legion smithies (`1,050 t` iron, `41.4 t` tin).
  - ***Kol-Grïb*** *(proposed coal works, `722,998`, `-1,109 m`, `sl=0.002`, `Af`, **coal byte `215` — richest in Kingdom**)*: **600 souls**. Pithead mining & coking ovens Barged/carted 48 km SE to Voth. *(Adjacent `(726,1003)` holds `oil byte=130`, unworked unless leased to Geomancers — §6 Q6.)*
  - ***Bē-Tzalt*** *(proposed murex & solar-salt village, `741,1004`, `-1,458 m`, `sl=0.028`, `XA`, coastal)*: **550 souls**. Harvesting `bay-purple` murex shells and bay-side evaporation pans.
  - ***Tïrm-Brik*** *(proposed river-barge market town, `720,1026`, `-450 m`, `sl=0.014`, `farm=1.00`)*: **1,400 souls**. Head of Turm flatboat navigation; collects `rosette-vanilla`, paddy rice, cacao, and tobacco from bay-rim estates.
  - ***Gowld-Vald*** *(proposed upper-Turm timber & placer village, `735,1038`, `+520 m`, `sl=0.028`, `Af`)*: **450 souls**. Hardwood logging and `Turm`/`Gowld Brük` gold-washing (`load=4.35`).
- **`core/hamlet` Foci & Social Structure:** `farming` (rice/vanilla/tobacco), `fishing`, `mine` (iron/coal/tin), `salt`, plus new `dye-shell` (`bay-purple`). Socially dominated by the Royal House, urban guild-citizens, Legion veterans, and `~8,000` crown/patrician plantation slaves in the humid bay valleys (`42,080` rural; **`100,000` total**).
- **Kit Identity:** Canonical Vothic city stone/timber/courtyard architecture (`settlements/voth` on `core/city`), bright lime-plaster, crimson/purple awnings, sun-disc finials, `voth_dhow` / `voth_trireme` harbourfront.

#### V2 — *Sim-Tzan* (Old Shim, Lake of Shim & Blïtrit Slave-Estate Lowlands)
- **Geography:** `24,688 km²` gently rolling `Cfa/Csa` basin (`+0..+900 m`, `1.48–1.58 atm`, `21–24 °C`, `1,200–1,800 mm`) wrapping `5,620 km²` of the `-9.2 m` freshwater `Lake of Shim` (`532 km` lakeshore).
- **Existing & Proposed Pins:**
  - **`Shim`** (`sshimrest01`, `654,1118`, `0 m` at the `klir Rivrh` outlet): **22,000 souls**. Venerable Chichani ancestral capital (`settlements/shim/PLAN.md`); seat of the **High Priest of the Sun** (in the archaic Iziz-style Grand Sun-Temple), site of the royal **Kingsmoot / Coronation**, great `50 m` `voth_barge` shipyard, chinampa market gardens, and `Blïtrit` dye vats. **[OWNER RULING — LOCKED]:** Built **100% in the `"Shim" vassal / old Chichani` architectural set**.
  - **`Azoth`** (`s5zcvs194o`, `651,1160`, `+65 m`, south shore of Lake of Shim, 116 km highway to SE pass): **8,500 souls**. **[OWNER RULING — LOCKED]:** A **former Shumari city that has mostly assimilated into Voth**, retaining a **large fraction of Shumari buildings** alongside a partial **`"Shim" vassal / old Chichani`** architectural layer (+ Vothic slave-patrol garrison walls facing Vrivolci `Greenstep` / `Tallwalls` 216 km S up the `Clodosriba`).
  - **`Sethas`** (`skwjynoxko`, `688,1141`, `+18 m`, east lakeshore, 56 km spur to Driyan trunk): **2,800 souls**. East-shore barge & plantation staple town shipping estate grain, cotton/rattlepod, and Driyan iron across the lake to Shim. **[OWNER RULING — LOCKED]:** Built **100% in the `"Shim" vassal / old Chichani` architectural set** (like `Shim`).
  - ***Blïtrit-Lant*** *(proposed estate landing, `670,1119`, `-8 m` shore, `sl=0.031`, `farm=0.99`, `Af`)*: **900 souls**. Reed-bed dyeworks and plantation wharf on the NE shore.
  - ***Lēk-Kol*** *(proposed lakeside coal village, `672,1144`, `+5 m`, `sl=0.020`, `coal byte=174`)*: **600 souls**. Fuels Shim's dye-boilers and Azoth's forges by lake barge.
  - ***Rïd-Krak*** *(proposed NW skarn mine, `647,1080`, `+1,929 m`, `sl=0.010`, `iron byte=255`, `copper=170`, `skarn=200`)*: **700 souls**. High-grade iron & copper ore sent down to Shim.
  - ***Tin-Bïrk*** *(proposed SE tin & placer camp, `689,1172`, `+705 m`, `sl=0.003`, `tin byte=200`, near `Bētun-Nārun` `12.54` tin placer)*: **500 souls**.
- **`core/hamlet` Foci & Social Structure:** `estate` (**new focus**: Chichani manor latifundia), `farming` (chinampa & dryland emmer/rice), `fishing` (lake), `mine`. Holds the heaviest concentration of **old Chichani landed nobility** and **`~42,000` plantation slaves** (enslaved **Nazarites, Wingmen, and penal/frontier captives** — *NOT Agropolitans, who are free client scrap-merchants*; `~43%` of V2's `98,000` rural population; **`134,000` total**). Chronic slave flight southward toward Free Giant `Tallwalls` (`LORE.md` §6.23) is V2's defining social tension.
- **Kit Identity:** **`Shim` & `Sethas` are 100% `"Shim" vassal / old Chichani` set** (archaic, moss-weathered Chichani stone + Iziz-derived stepped sun-masonry, walled slave-barrack compounds, `Blïtrit` racks, `voth_barge` quays), while **`Azoth` blends a large surviving Shumari building fraction with the `"Shim" / old Chichani` set** and Vothic garrison fortifications.

#### V3 — *Driyan-Mark* (Driyan & the Conquered Shumari Foothill March)
- **Geography:** `15,828 km²` highland terrace & foothill march (`+200..+3,082 m`, med `+1,560 m`, `1.32 atm`, `21–24 °C`, `Csa/Cfa`), holding the `449 km²` `+1,067 m` through-lake (`Uarosriba`) and `647.5` good-yield skarn iron.
- **Existing & Proposed Pins:**
  - **`Driyan`** (`sxvb4k4024`, currently pinned at `725,1141` [`+490 m`, `sl=0.058`, `Csa`] vs `ANCIENT-NETWORK.md` / `net51` node `new.driyan` at `705,1129` [`+589 m`, `sl=0.013`, `Cfa`, directly on `Sharf Rivrh` `r034` & the Ancient trunk junction] — **see §6 Q2**): **11,000 souls**. Ancient conquered Shumari city (*Dōriyan*) from which the Voths adopted their modified Shumari alphabet (`lore/tongues-of-krator.html`); centre of bilingual chancery clerks, fine linen/wool textiles, ironmongery, and the March Praetorium.
  - ***Taru-Vakt*** *(proposed Vothic pass-watch fort & customs barrier, `691,1179` or `700,1172`, directly facing Free Giant **`Tallhouse` `683,1184`** and Shumari **`Ṭāru-Bētun` `689,1185`** across the pass)*: **600 souls** (Legion cohort + Ordinator book-inspectors). Stages Voth's side of the guarded cold-truce **grain-for-mounts barter at `Suṭōn-Qappu`**, enforcing the strict embargo on arms, metals, and books (`msg_shumar_answers.txt`).
  - ***Hok-Lēk*** *(proposed highland lake town, `729,1120`, `+1,076 m`, `sl=0.003`, `farm=1.00`, W shore of the `449 km²` lake)*: **1,600 souls**. Terrace `frostoat`/flax market, lake fishery, and mule-staging town.
  - ***Ozt-Ayirn*** *(proposed skarn-iron mine, `754,1115`, `+1,820 m`, `sl=0.023`, `iron byte=255`, `copper=130`)*: **800 souls**.
- **`core/hamlet` Foci & Social Structure:** `farming` (terrace `frostoat`, barley, flax), `ranch` (highland sheep/mules), `mine` (iron/tin), `placer` (`Dōriyan-Nārun` tin `12.46`; gold placer toned down per owner ruling). Populated by **`44,000` assimilated/tributary Shumari-Vothic peasants and townsfolk** (`58,000` total) under Chichani *mark-lords* — legally free subjects rather than chattel slaves.
- **Kit Identity [OWNER RULING — LOCKED]:** Like `Azoth`, **`Driyan` retains a large fraction of `kits/shumari` buildings alongside a partial `"Shim" vassal / old Chichani` set** (+ Vothic Legion bastions & sun-altars).

#### V4 — *Almua-Drïm* (Northern Fleet Coast, Drum & Agropolitan Client Ruin-Tribe)
- **Geography:** `30,904 km²` hot, dense-air `Aw/XV` savanna and monsoon plain (`-1,500..+513 m`, med `-828 m`, `1.77 atm`, `28–31 °C`, `700–1,460 mm`) + `7,956 km²` Ring Sea & `Almua`'s `1,235 km²` coastal lagoon (`576 km` dry-season solar-salt coast).
- **Existing & Proposed Pins:**
  - **`Almua`** (`sjau3958qz`, `718,883`, coastal lagoon mouth, linked by 140 km Vothic highway to `Drum`): **15,000 souls**. Four-canton port city (`settlements/almua/PLAN.md`): **Royal Northern Naval Arsenal** (now Voth's #1 warship base after the loss of `Hook`!), amphora & coaster harbour, **scrap-iron bloomeries** (`162 t/yr` bought from the Agropolitan scrap-merchants + local coal), solar salt pans (`720 t/yr`), and outer **semi-nomadic Chichani clan-tent wards** keeping traditional pastoral rites alive.
  - **`Drum` / *Drïm*** (`sirb5um6cr`, `673,932`, `-1,080 m` on `Drïm Rivrh`, terminus of the **Inner Wall karst tunnel** `326 km / 89 km tunnel` to Iron Republic `Cascade` and `539 km` to `Babel`): **13,500 souls** *(locked Stage 1 census)*. `5,400` in the 15-level Ruined Drum Arcology (**L01 Under-Drum Salvage Bourse**, **L02–03 SIM Trade Galleries, Bonded Warehouses & dark-grown Mushroom Vaults** growing `alecap`/`pale-fungi`/`lamp-cap`) + `8,100` in concentric outer rings (`2,562` buildings). Houses the **Military Governor's Praetorium**, **Ordinator Fortress**, **"The Cauldron" Gladiatorial Arena**, and `50 t/yr` scrap-to-iron cupola smelters.
  - **`Tzunfort`** (`soctr12hfz`, `670,886`, `-980 m`, `XV` dry steppe, 100 km highway N of `Drum`): **600 souls**. Frontier cavalry/chariot & camel/mount fort watching **Scyvoi Baelu kraals `B7` (`652,907`, 56 km SW) and `B1` (`651,857`, 69 km NW)** as well as League `Tethis` (`678,828`, 117 km N).
  - **`Agropolis` & the Agropolitan Client Ruin-Tribe** (`sc3u7qalqi`, `717,917`, `512 km²` Ancient ruin cluster on the `Drum`–`Almua` trunk): **`4,000 souls in all` [OWNER RULING — LOCKED]**. A **free, semi-nomadic ruin-tribe in a Vothic client-state relationship comparable to `Torus`** (`~1,200` at the `Agropolis` sorting/winter ruin-moot + `~2,800` in mobile `KCAMP` scrap-merchant caravans ranging between `Agropolis`, `Drum`'s L01 Salvage Bourse, and `Almua`'s bloomeries).
  - ***Gēzrh-Vïrk*** *(proposed sulfur & copper geyser works, `730,877`, `-455 m`, `sl=0.014`, **sulfur byte `252`**, **copper `210`**, **silver `150`** at 2 active geyser vents 25 km E of `Almua`; gold toned down per owner ruling)*: **700 souls**. Extracts `Almua`'s `160 t/yr` volcanic sulfur and rich copper-silver ore.
  - ***Drïm-Vord*** *(proposed river market & auxiliary kraal town, `664,936`, `-912 m`, `sl=0.025`, `farm=1.00` on `Drïm Rivrh`)*: **1,100 souls**. Irrigated `ashmillet`/cotton market and treaty-camp of pacified ***Sinsun*-paying Scyvoi** borunsa/lizard-riders serving as frontier scouts (`LORE.md` §6.17).
  - ***Kïzt-Kol*** *(proposed coastal coal & salt village, `758,963`, `-1,197 m`, `sl=0.011`, `XA`, `coal byte=210`)*: **600 souls**. Ships bunker coal by coaster to `Almua` and `Voth`.
- **`core/hamlet` Foci & Social Structure:** `farming` (`ashmillet`, `fireseed`, irrigated cotton, sisal), `ranch` (dryland cattle/goats), `salt` (solar pans), `mine` (coal/sulfur/copper), `salvage` (`4,000` free semi-nomadic Agropolitan scrap-merchants). Mix of **Vinvolk** arcology commoners, **Agropolitan** client scrap-merchants (`4,000`), traditionalist **Chichani pastoral clans**, Legion/Ordinator garrisons, *Sinsun* Scyvoi auxiliaries, and smelter/arena captives (`42,500` non-Agropolitan rural; **`78,000` total**).
- **Kit Identity:** Locked at `Drum` (`1/3` **`kits/sw-arcology`** industrial tanks/spheres + `1/3` **`voth-scrap`** + `1/3` **`post-apoc`** inside Ancient/wreck walls); at `Almua`, Vothic stone arsenal quays surrounded by **Chichani patterned clan-pavilion wards** (`settlements/almua/PLAN.md`).

#### V5 — *Vink-Nazarh* (Wing & Nazar Salvage Borderland)
- **Geography:** `31,036 km²` rugged, haunted western march (`-2,118..+2,811 m`, `Csa/Aw/Cfa/BSh`) + `6,044 km²` SW Bay sea & NW Lake of Shim. Contains **`13,712 km²` of Ancient ruin ground** (`Nazar` `13,392 km²` + `Wing` `416 km²`), Voth's largest iron (`gy=993.5`), tin (`gy=198.0`), and white marble (`gy=96.0`) reserves, and **Voth's sole `96 km²` pocket of good saltpeter (`669,1069`)**.
- **Existing Ruins & Proposed Pins:**
  - ***Klir-Havn*** *(proposed barge-to-sea transfer port at `klir Rivrh` mouth, `711,1012` [`-902 m`, `sl=0.013`, `coal=181`] or coastal bar `701,1024`)*: **2,600 souls**. Essential transshipment town where `50 m` `klir` barges/log-rafts transfer cargo around the lower canyon rapids to Ring Sea `voth_coaster` and `voth_dhow` hulls, backed by a riverside coal seam.
  - ***Vink-Lēgrh* at `Wing`** (`sjgv4qfmg4`, `699,1042` / camp `700,1040` on the `5,744 m³/s` `klir Rivrh`): **1,200 souls**. Fortified Royal & Ordinator Salvage Camp and barge lock beside the ruined `Wing` arcology (`416 km²` ruin field) and white marble quarries (`692,1076`).
  - ***Nazarh-Vakt* at `Nazar`** (`s3i61t95z5`, `582,1079` ruin heart / garrison station at `572,1074`, `+232 m`, `sl=0.010`, `farm=1.00`, on the Ancient trunk toward Dalab `Span` `167 km` N): **1,400 souls**. Ordinator Inquisition Bastion & Licensed Salvage Depot patrolling the `13,392 km²` `Ruins of Nazar` to intercept **Order of Historians** excavation cells, unlicensed relic-looters, and Frogman/Dalab scouts.
  - ***Tzaltpētrh-Krak*** *(proposed crown nitre & copper fort-works, `669,1069`, `+1,586 m`, `sl=0.045`, `BSh`, **saltpeter byte `121` — ONLY good nitre in Voth**)*: **600 souls**. Heavily guarded royal gunpowder-earth leacher & copper mine.
  - ***Vēzt-Mïnd*** *(proposed western lake-border watch & customs landing, `570,1084`, `-8 m` shore, `sl=0.026`, `farm=1.00`, facing Dalab `Dapor` `519,1152` and Frogman `Krrmt` `557,1080`)*: **500 souls**. Monitors lake barges crossing to/from Dalab.
- **`core/hamlet` Foci & Social Structure:** `salvage` (**new focus**), `mine` (marble, saltpeter, iron, tin), `farming` (`klir` valley crofts). Sparsely settled (`18,700` rural + `6,300` camps/ports = **`25,000` total**), comprising Ordinator/Legion patrols, licensed salvage guilds, `~5,500` penal/convict quarry & wrecking slaves, and scattered free Nazarite/Wingman tribute-hamlets hiding in the broken towers.
- **Kit Identity:** Fortified Vothic timber-and-ashlar watchtowers grafted onto overgrown `kits/ancients` megastructure stumps (`voth-scrap` + `post-apoc` salvage yards).

#### V6 — *Tors-Rink* (Torus Arcology & Talovolci Scarp March)
- **Geography:** `7,084 km²` precipitous emerald rainforest scarp (`-1,500..+3,198 m`, `Af` `68.3%`, `XA` `14.7%`, `2,500–2,800 mm` rain, `wood` byte `253`) + `5,568 km²` coastal sea, rising from the Ring Sea up the Izani highway to Talovolci `Spirladunon` (`800,1017`) and extending north toward Iziz-recaptured `Hook` (`809,923`).
- **Existing & Proposed Pins:**
  - **`Torus` / *Tors*** (`sy42jwlyk4`, `774,1007`, coastal bench on `Tors Rivrh`): **14,000 souls**. Living Forest Ring barrel arcology (`settlements/torus/PLAN.md`) surrounded by Soleri-style **`kits/metropolis` / `kits/sw-arcology`** terraced farm-pods; dual rule by the hereditary ***Rinkvolk* Chief** (delivering Voth's richest arcology grain & iron tribute) and a Vothic Royal Governor + Ordinator shrine; deepwater timber & grain harbour (`2,347 t` entrepôt in Gemini).
  - ***Tors-Gēt*** *(proposed highland road market, `788,1027`, `+265 m`, `sl=0.014`, `farm=1.00`, `Af`, on the `59 km` Izani highway up to `Spirladunon`)*: **900 souls**. Border market where Vothic grain, salt, and tobacco exchange for Talovolci **`clifflung` lung-skin cordage**, **Checked Wool (`plaid`)**, giant ship-spars, and hired **Talovolci hill-auxiliary cohorts** (`LORE.md` §6.15).
  - ***Grē-Krak*** *(proposed impact-nickel, tin & iron mine, `769,1020` [`tin=200`, `gold/silver=110`] paired with upper adit `788,986` [`nickel=220`])* : **600 souls**. Supplies Voth's rare meteoric nickel-steel (`44.0` good yield) and alluvial tin.
  - ***Svartz-Vakt*** *(proposed northern frontier bastion, `785,941`, `-836 m`, `sl=0.033`, `Af`, on `Shvarts Brük` along the `199 km` Ancient trunk road to `Hook`, **36 km S of the Iziz border**)*: **700 souls**. Front-line Legion & Talovolci-auxiliary blockhouse barring Izani mech columns from marching south from `Hook` (`809,923`) on `Torus` and `Voth`!
- **`core/hamlet` Foci & Social Structure:** `farming` (Soleri terrace pods, taro, breadfruit, rice), `lumber` (**ship-timber** for Voth & Torus yards), `mine` (nickel/iron/tin), `placer`. Inhabited by **`23,800` free client *Rinkvolk* arcology farmers and friendly lower-slope Talovolci clans** (`40,000` total; almost no chattel estates, `~1,000` dock/mine thralls — keeping *Rinkvolk* and Talovolci loyalty intact against neighbouring Iziz!).
- **Kit Identity:** Living Ancient barrel-ring arcology + **`kits/sw-arcology` / `kits/metropolis`** agricultural pods + `voth-scrap` / highland timber longhouses on the Talovolci road.

#### V7 — *Zei'danin-Temora* (Overseas Throne & Strait Spice Captaincy)
- **Geography:** `12,748 km²` hyper-tropical volcanic coast & strait islands (`-1,500..-496 m`, `1.84 atm`, `30–31 °C`, `2,100–2,900 mm`, `XA` `42%` / `Af` `38%`) + `12,172 km²` Ring Sea (`970 km` shore) and a `48 km²` inland salt lake (`768.6, 890.8`), **severed from mainland `V1`/`V6` by Iziz's recapture of `Hook` (`809,923`)** and reachable from `Almua`/`Voth` only by running the strait past `Tzinguard` (`773,922`).
- **Existing & Proposed Pins:**
  - **`Zey'danin`** (`s5x27pj6hn`, `795,860`, SE foot of the Throne): **15,000 souls**. Five-layer colonial port (`settlements/zeydanin/PLAN.md`): (1) native **Zeijani** basal cliff-stack, (2) exiled **Hetānini West Islander** stilt-wharf quarter, (3) former **Izani Governor's Palace** (now seat of the Vothic Captain-General), (4) watched **Hykkousoi** trader pods, and (5) Vothic fortified spice mole & plantations where blighted Izani `Ranj` groves are being replanted with **Spice Isles `clove`, `coffee`, `cacao`, and `tobacco`**. World-class volcanic **copper (`225 t`)**, **silver (`941 kg`, #1 world)**, and **gold (`163 kg`, #2 world)** hinterland.
  - **`Temora`** (`s7u81vhk60`, `762,883`, SW Throne coast, joined to `Zey'danin` by the isolated `143 km` Vothic coastal highway `vothic.isle` and a `111 km` dirt path N to League `Nereus` `762,803`): **2,800 souls** (upgraded from placeholder 300-pop village pin to match Gemini's `2,500` & `LORE.md` §6.15's purely Vothic spice port). Direct convoy terminus from `Almua` (`108 km` open-sea hop!), bypassing the `Hook` guns; sits beside emerald (`748,858`), coal (`751,861`), and unworked oil (`761,870`).
  - **`Tzinguard`** (`sziebkh7y3`, `773,922`, fortified strait island **72 km W of Izani `Hook` `809,923`**): **900 souls**. Voth's Gibraltar: `voth_trireme` & `voth_bireme` patrol station guarding the western mouth of the Hook Strait and escorting spice convoys between `Temora` and `Almua`/`Voth`.
  - **`Kautono`** (`suax2l62ec`, `749,894`, volcanic geyser isle SW of `Temora`): **700 souls**. Subject West Ring Islander fishing, pearl, and sulfur-skimming village.
  - **Two Throne-Coast West Islander Villages** *(already in `net51-gemini.json` per owner 2026-11-11: **`new.islander.ne` at `806,794`** and **`new.islander.se` at `801,871`**, linked by dirt paths to `Zey'danin`)*: **1,000 + 1,000 souls**. `kits/islanders` (West/rumah style) fishing, `clove`, `kava`, and `tar-black` villages under Vothic harbour tribute.
  - ***Thron-Bïrn*** *(proposed geothermal sulfur camp, `790,887`, `-674 m`, `sl=0.000`, `Af`, **sulfur byte `252`** at active geyser)*: **500 souls**.
  - ***Gowld-Kïzt*** *(proposed polymetallic mine camp, `821,891`, `-1,447 m`, `sl=0.000`, `XA`, **copper `210`**, **silver `150`**, **gold `140`** — richest combined precious-metal cell in Voth)*: **700 souls** (heavilystockaded against **`Hookfleet` / `Port Mira` (`864,897`)** coastal raiders 90 km E!).
- **`core/hamlet` Foci & Social Structure:** `orchard` (clove/cacao/coffee replacing `Ranj`), `fishing` (Islander), `mine` (copper/silver/gold/sulfur), `salt` (`48 km²` salt lake). Restive colonial mosaic (`27,400` rural + `22,600` ports/forts = **`50,000` total**): Vothic garrison & planters ruling Hetānini West Islanders, lowland Zeijani, licensed Hykkousoi factors, former Izani creoles, and `~5,500` colonial plantation/mine slaves.
- **Kit Identity:** 5-layer composite at `Zey'danin` (Zeijani stack + `kits/islanders` rumah piles + `kits/iziz-vernacular` captured palace + Hykkousoi pods + Vothic stone mole); pure Vothic colonial port at `Temora`; `kits/islanders` at `Kautono` and the two coast villages.

---

## 4. Demography, Carrying Capacity & Royal/Sun-Temple Ledger Reconciliation

### 4.1 Reconciling `TRADE-GOODS.md` (`98k`) vs Gemini (`1.32M`) vs Grounded Proposal (`485k`)

Just as in `PROPOSAL-XANADU.md` §1 (`45.6k` raw pins vs Gemini's `465.3k` -> reconciled to `~350,000`), Voth's existing files diverge by **13.5x**:
- **`trade-goods.json` (`98,137`)** counts only 9 pins (omitting `Driyan`, `Azoth`, `Sethas`, `Tzinguard`, `Kautono`, and **100% of the countryside and slave estates**), while leaving `Shim`, `Almua`, and `Zey'danin` on flat `8,000` type-placeholders and `Temora` on `300`.
- **Gemini (`populations-gemini.json`, `1,324,340`)** inflates every city by `1.8x–2.4x` "off-screen multipliers" (turning Voth's exact `54,020` built census into `96,000`, `Drum`'s locked `13,500` into `28,800`, and `Shim` into `40,000` -> `287,900` urban) and then multiplies by `3.6x` (`1,036,440` rural) and `6.5x` carrier multipliers!

Locking **`Voth` at its exact built `1:1` census (`54,020`)** and **`Drum` at its locked Stage 1 blueprint (`13,500`)**, sizing the secondary cities to their lore/blueprint roles (`11k–22k`), and setting rural + estate populations by province ecology yields a grounded, self-consistent Kingdom of **`485,000` souls**:

| Settlement / Province | `trade-goods.json` | Gemini (`sim_urban` / total) | **Proposed (`1:1` Sim)** | Free / Tributary | Enslaved | Basis & Notes |
|---|---:|---:|---:|---:|---:|---|
| **Voth** (`V1` seat) | 53,387 | 96,000 | **54,020** | 53,387 | 633 | **Locked `1:1` census** (`settlements/voth/HANDOFF.md`) |
| **Shim** (`V2` seat) | 8,000 | 40,000 | **22,000** | 19,800 | 2,200 | Old lake-capital, High Priest's Sun-Temple, barge yards (`shim/PLAN.md`) |
| **Almua** (`V4` co-seat) | 8,000 | 27,000 | **15,000** | 14,100 | 900 | 4-canton Northern Fleet Arsenal + Chichani clan-tent town (`almua/PLAN.md`) |
| **Zey'danin** (`V7` seat) | 8,000 | 30,000 | **15,000** | 14,000 | 1,000 | 5-layer Throne & Spice Isles colonial port (`zeydanin/PLAN.md`) |
| **Torus** (`V6` seat) | 10,000 | 28,800 | **14,000** | 13,800 | 200 | Living Forest Ring barrel arcology + Soleri farm pods (*Rinkvolk*) |
| **Drum** (`V4` co-seat) | 10,000 | 28,800 | **13,500** | 12,700 | 800 | **Locked Stage 1 blueprint** (`5,400` arcology + `8,100` outer rings) |
| **Driyan** (`V3` seat) | *(omitted)* | 16,200 | **11,000** | 10,700 | 300 | Conquered Shumari foothill city (*Dōriyan*), scribes & weavers |
| **Azoth** (`V2` S lake) | *(omitted)* | 14,000 | **8,500** | 8,000 | 500 | S Lake of Shim fortified city & slave-patrol base |
| **Sethas** (`V2` E lake) | *(omitted)* | 3,000 | **2,800** | 2,600 | 200 | E Lake of Shim barge & plantation market town |
| **Temora** (`V7` port) | 300 | 2,500 | **2,800** | 2,600 | 200 | Purely Vothic spice & convoy port (`LORE.md` §6.15) |
| **5 Forts, Mines & Isles** (`Tzinguard` `900`, `Ayirn-Krak` `900`, `Kautono` `700`, `Tzunfort` `600`, `Agropolis` `500`) | 450 | 1,600 | **3,600** | 3,333 | 267 | Existing pins brought to `1:1` garrison/camp strength |
| **24 Proposed Villages, Mines, Salvage Camps & Pass Forts** (`V1`–`V7`) | 0 | 0 | **22,800** | 21,600 | 1,200 | Verified dry/flat sites (`Klir-Havn` `2.6k`, `Nazarh-Vakt` `1.4k`, `Vink-Lēgrh` `1.2k`, `Hok-Lēk` `1.6k`, `Tïrm-Brik` `1.4k`, `2` Islander villages `2k`, etc.) |
| **Subtotal: Urban, Forts & Works** | **98,137** | **287,900** | **185,020** (`38.1%`) | **176,620** | **8,400** | — |
| **Bulk Rural & Slave Estates (`V1`–`V7`)** | 0 | 1,036,440 | **299,980** (`61.9%`) | **234,380** | **65,600** | `3.60/km²` overall (`3.98/km²` in `Sim-Tzan` V2; `0.60/km²` in ruined V5) |
| **TOTAL VOTHIC KINGDOM** | **98,137** | **1,324,340** | **485,000** (`100%`) | **411,000** (`84.7%`) | **74,000** (`15.3%`) | **3.64 souls/km²** over `133,408 km²` land |

### 4.2 Carrying Capacity & Surplus Balance

At the valley host's staple food requirement (`~0.158 t` grain-eq/person/yr), **`485,000` people consume `~76,630 t/yr` of staple food** and **`~1,455 t/yr` of dietary/preserving salt** (`3 kg/person/yr`).
- **Food:** With `92,813` farm-eq km², lake fisheries (`5,620 km²`), Ring Sea fishing (`32,792 km²`), `Torus`'s high-intensity Soleri pods, and `Shim`'s chinampas, Voth easily produces **`~95,000–105,000 t/yr`**, feeding every town, Legion fort, mine, and slave barrack while generating **`~20,000+ t/yr` exportable grain/staple surplus** (provisioning `Zey'danin`, `Almua`'s warships, the `Suṭōn-Qappu` mount barter with Shumar, Talovolci `Spirladunon`, and Ring Sea buyers).
- **Salt:** Coastal solar pans at `Almua` (`720 t`), `Voth`/`Bē-Tzalt` (`568 t`), `Torus` (`264 t`), `Zey'danin`/`Temora` (`589 t` + `V7`'s `48 km²` salt lake) yield **`~2,200+ t/yr`**, covering Voth's `1,455 t` domestic + fish-salting demand with **`~700 t/yr` surplus** (shipped inland up the `klir` to salt-poor `Shim`/`Driyan`/`Spirladunon`).

### 4.3 Actor Scaling & Polity Treasury Flows on `core/region` (`50-region-valley.js`)

Following `PROPOSAL-XANADU.md` X1's per-settlement `scale`:

| Settlement Tier | `scale` (people/actor) | People | Actors | Notes |
|---|---:|---:|---:|---|
| 7 Bulk Rural + 3 Slave-Estate Districts | `250` | 299,980 | **~1,200** | Free peasantry separated from `estate` slave-plantation pools in `V1`, `V2`, `V7` |
| `Voth` (`54k`) + 9 Secondary Cities (`8.5k–22k`) | `100` (macro) / `50` (solo) | 158,620 | **~1,586** (`3,172` @ `50`) | `100` keeps a full Ring Sea multi-polity run fast (~1 min/yr) |
| 29 Forts, Mines, Salvage Camps & Islander Villages | `10`–`25` | 26,400 | **~1,320** | Exact garrison/crew resolution on critical works (`Tzaltpētrh-Krak`, `Drum` Bourse, `Taru-Vakt`) |
| **Total Kingdom Sim Footprint** | — | **485,000** | **~4,100** | Or `~2,150` actors if secondary towns run at `100` and bulk rural at `500` |

**Polity Treasuries & `SIM.transfer` / `share` Flows:**
Unlike centralized Xanadu (`xan:citadel` alone), Voth's Chichani state has a **two-pillar fiscal tension** (`LORE.md` §6.15 — *"Dha Tzun it vïrhst"*, "The Sun eats first"):
1. **The Royal Palace & Naval Treasury at `Voth` (`voth:palace`):** Receives provincial grain/silver/iron dues (`share` roads from `Driyan`, `Almua`, `Drum`, `Torus`, `Zey'danin`), the **Royal Murex (`bay-purple`) & Salt Monopoly**, `Wing`/`Nazar` salvage licence cuts (`20%`), and harbour customs; pays and feeds the **Legion garrisons** (`Taru-Vakt`, `Tzunfort`, `Svartz-Vakt`, `Tzinguard`) and **`Almua` / `Voth` warship squadrons**.
2. **The Grand Sun-Temples (`voth:sun-temple` & `shim:sun-temple`) + Ordinator Inquisition (`drum:ordinators`, `nazar:vakt`):** Take the sacred **"Sun's First-Cut"** (`10%` tithe off royal/noble estate harvests, gold/silver assay, and winter-solstice offerings). Fund the **Ordinators** who police arcologies and ruins against the banned Order of Historians.
3. **Chichani Noble Slave-Estates (`v2:estates`, `v1:estates`, `v7:estates`):** Sub-settlements consuming cheap slave rations (`ashmillet`/lake fish) + replacement captive inflows while remitting high-margin `Blïtrit` purple, Sunboll cotton / rattlepod, and export grain to noble townhouses in `Shim` and `Voth`.

---

## 5. Internal & External Trade Web, Fleets (`kits/ringsea`) & Gateways

### 5.1 Voth's Nine Built `kits/ringsea` Hulls & Fleet Allocation

Unlike Xanadu (0 sea ships), Voth already has **nine dedicated vessel fragments built in `kits/ringsea/src/`**, mapping cleanly onto `SIM.trade` carrier classes:

| `kits/ringsea` Fragment | Vessel Class | Role & Cargo Tier | Primary Operating Waters & Routes |
|---|---|---|---|
| `18-voth-barge.js` | **`voth_barge`** (`50 m` river/lake barge, ~25 t) | Heavy inland bulk carrier | **Lake of Shim rounds** (`Shim` <-> `Azoth` <-> `Sethas` <-> `Vēzt-Mïnd`/Dalab `Dapor`) & **`klir Rivrh` artery** (`Shim` <-> `Wing` <-> `Klir-Havn`) |
| `17-voth-coaster.js` | **`voth_coaster`** (~12 t coastal lighter) | Short-sea cabotage | `Voth` <-> `Torus` <-> `Klir-Havn` <-> `Almua`; coastal coal (`Kïzt-Kol`) & salt runs |
| `14-voth-dhow.js` | **`voth_dhow`** (~15 t lateen trader) | Standard Ring Sea merchantman | `Almua` <-> `Temora` <-> `Zey'danin` strait runs; `Almua`/`Shim` <-> League `Tethis` & `Kautoa` |
| `15-voth-baghlah.js` | **`voth_baghlah`** (~30 t deep-sea merchant) | Armed colonial spice & bullion ship | Long-haul `Voth`/`Almua` <-> `Zey'danin` spice/silver/copper convoys; `Kautoa` & `Bipo` voyages |
| `16-voth-junk.js` | **`voth_junk`** (~35 t battened-lug bulk ship) | Heavy sea collier & grain/timber ship | `Torus` ship-timber (`1,638 t`), `Voth`/`Almua` coal & iron exports across the Ring Sea |
| `19-voth-ferry.js` & `20-voth-skiff.js` | **`voth_ferry`**, **`voth_skiff`** | `transport` passenger loops & `fishing` | `Bay of Voth` inner narrows/lake ferries; `Shim`, `Almua` & `Zey'danin` morning fishing fleets |
| `21-voth-bireme.js` & `22-voth-trireme.js` | **`voth_bireme`**, **`voth_trireme`** (chitin-sheathed bronze/iron rams) | Royal Navy escort & blockade squadrons | Stationed at **`Almua`** (Northern Fleet), **`Voth`** (Home Bay Fleet), and **`Tzinguard`** (Hook Strait Squadron) to counter Izani **`Hook`**, **`Porta Marr`** privateers, and **`Noah's Regret`** pirates |

*(Scaled to `485,000` people without Gemini's `6.5x` inflation, Voth operates **`~36` seagoing merchant hulls**, **`~18` `50 m` `Shim`/`klir` barges**, **`~14` `bireme`/`trireme` warships**, and **`~45` highway wagon/mule convoys**.)*

### 5.2 The Strategic Maritime Crisis: `Hook` Lost, `Almua` Elevated, and `Porta Marr` + `Nephtos` Contraband

1. **Loss of `Hook` (`809,923`) to Iziz:** Izani mechs recapturing the `Hook` peninsula cut the `Hook`–`Torus` (`199 km`) land trunk and placed Izani batteries on the eastern jaw of the Hook Strait. Consequently:
   - **`Svartz-Vakt` (`785,941` in `V6`)** locks the landward rainforest road 36 km S of `Hook`.
   - **`Tzinguard` (`773,922` in `V7`)** holds the western island jaw of the strait (72 km W of `Hook`), shielding convoys slipping into `Zey'danin`.
   - **`Almua` (`718,883` in `V4`)** becomes Voth's indispensable northern naval arsenal and safe back-door port (`Almua` <-> `Temora` is a direct `108 km` western sea crossing well clear of `Hook`, connecting via the `143 km` `vothic.isle` highway to `Zey'danin`!).
2. **`Porta Marr` (`926,1017`, `~20,000` souls) & `Nephtos` (`919,762`, League of Tethys) — Rival Port & Black Market:**
   - Open Vothic–Izani trade is severed by war, yet **`Porta Marr`** — Iziz's foremost ocean-going port, seat of the `Gilda de Navigadarz`, and hotbed of privateers and smugglers (`marr_layout_and_blueprint.md`) — both **preys on Vothic `baghlah` convoys** and **secretly fences contraband** through neutral **`Nephtos` (`League: Tethys`)**, **`Tethis` (`678,828`)**, and **`Kautoa` (`964,725`)**.
   - Through these neutral/smuggling relays, Vothic **silver, coal, volcanic sulfur, `bay-purple` / `Blïtrit` cloth, and `isle-spice`** trade illicitly for Voth's scarcest war-goods: **saltpeter, gunpowder, Iron Republic firearms/lenses, Jimjam glass/almanacs, and Yuni electrics**.
3. **`Noah's Regret` (`836,920`) & `Hookfleet` (`Port Mira` `864,897`) Piracy:** Operating just E of `Zey'danin`, `Hookfleet` salvage tugs and prize sloops raid unescorted `Zey'danin` silver, spice, and sulfur runs (`trade-gemini[noas_regret_piracy]`) while fencing captured **saltpeter, cordage, pitch-tar, and firearms** back into `Zey'danin`'s Hykkousoi pods and `Almua`'s docks.

### 5.3 Land, River & Tunnel Gateways

| Gateway / Corridor | Endpoints & Distance | Mode & Operators | Outbound from Voth | Inbound to Voth | Friction / Sim Rule |
|---|---|---|---|---|---|
| **1. `klir Rivrh` & Lake of Shim Spine** *(Internal + Dalab)* | `Voth` <-> `Klir-Havn` (sea `82 km`) <-> `Wing` <-> `Shim` (`205 km` river) <-> `Vēzt-Mïnd` / Dalab **`Dapor` (`519,1152`)** | `voth_barge` (`50 m`) + Dalab lake barges | Salt, coal, ironware, `Blïtrit` & `bay-purple` cloth, `isle-spice` | Dalab wine, dried fruit, bronze, genecraft/beasts (guarded); `Shim` grain & cotton to `Voth` | `Klir-Havn` transships between `50 m` river barges and sea coasters; `Vēzt-Mïnd` inspects Dalab hulls for Historian books |
| **2. Inner Wall Karst Tunnel (`Drum` <-> `Cascade` / `Babel`)** | `Drum` (`673,932`) <-> Iron Republic **`Cascade` (`568,841`)** (`326 km`, `89 km` tunnel; on to `Babel` `539 km`) | Heavy mule/wagon trains through Drum's L02–03 Bonded Galleries | Coal, `Drum` salvage-bourse Ancient alloys/circuits, `alecap` rations, sulfur, cotton | **Saltpeter** (Roketstad/Cascade!), precision tools, lenses, Highland steel/firearms | Taxed at Drum's Military Governor & Ordinator gate; passes within `45 km` of Scyvoi `B7` (`652,907`) outside the tunnel mouth |
| **3. `Suṭōn-Qappu` Cold-Truce Pass (`Driyan` <-> `Shumar` & `Free Giants`)** | `Driyan` -> `Taru-Vakt` -> **`Tallhouse` (`683,1184`) / `Ṭāru-Bētun` (`689,1185`)** -> **`Suṭōn-Qappu`** | Seasonal pack-trains under armed truce | Lowland **grain (`emmer`/rice)** and **sea salt** | Shumari/Vrivolci **highland cavalry & draft mounts**, coarse wool | **Strict bilateral embargo on arms, metals, and books** (`msg_shumar_answers.txt`); chronic diplomatic crisis over runaway `Sim-Tzan` slaves reaching `Tallwalls` (`650,1268`) |
| **4. Talovolci Cloud-Forest Highway (`Torus` <-> `Spirladunon`)** | `Torus` (`774,1007`) -> `Tors-Gēt` -> **`Spirladunon` (`800,1017`)** (`59 km` Izani highway) | Pack-trains & timber sledges | Arcology grain, sea salt, `tobacco`, iron tools | **`clifflung` lung-skin naval rope**, **Checked Wool (`plaid`)**, giant ship-spars, **Talovolci auxiliary levies** | Friendly client/mercenary alliance (`LORE.md` §6.15); vital buffer on `Hook`'s southern flank |
| **5. Scyvoi Steppe Frontier (`Tzunfort`/`Drum` <-> `B7` & `B1`)** | `Drum`/`Drïm-Vord`/`Tzunfort` <-> Scyvoi **`B7` (`652,907`)** & **`B1` (`651,857`)** (`55–70 km`) | Steppe barter at *Sinsun* kraals vs dry-season raids | Grain, cheap cloth, beer/spirits (arms officially banned) | Steppe mounts, cattle, hides, horn; *Sinsun* auxiliary scouts | Unsubmitted Baelu bands raid `V4` dryland herds in `SIM` frontier events |
| **6. League, Islander & Geomancer Sea Lanes** | `Almua` / `Shim` / `Voth` / `Zey'danin` <-> **`Tethis` (`241 km`)**, **`Nereus` (`111 km` land / sea)**, **`Kautoa` (`862 km`)**, **`Nephtos`** | `voth_dhow`, `voth_baghlah`, Hykkousoi corbitae, Kautoan `drua` | Silver, coal, iron, tin, sulfur, purple cloth, grain | **Ship-timber, cordage, pitch-tar, pearls, sugar/rum (`Kautoa`), Yuni/Geomancer lamp-oil & electrics**, smuggled saltpeter | Commercial rivalry + pragmatic wartime trade with League cities (`Tethis`/`Nephtos`) to outflank Izani `Porta Marr` |

---

## 6. Key Open Choices for the Owner

1. **Seven-Province Boundaries, Vothic Names & `Azoth`'s Status (§3):**
   - Does the 7-province partition (**`V1` *Tzintzun-Bē*** [`Voth`], **`V2` *Sim-Tzan*** [`Shim`], **`V3` *Driyan-Mark*** [`Driyan`], **`V4` *Almua-Drïm*** [`Almua` & `Drum`], **`V5` *Vink-Nazarh*** [`Klir-Havn`/`Wing`/`Nazar`], **`V6` *Tors-Rink*** [`Torus`], **`V7` *Zei'danin-Temora*** [`Zey'danin`]) match your vision, or should southern **`Azoth` (`651,1160`)** be split off from `Sim-Tzan` (`V2`) as an eighth **Southern Greenstep / Slave-Catcher March** facing Free Giant `Tallwalls`?
   - Do you want the pure Vothic province and village names above (no `c, f, j, q, w, x`, e.g. ***Ayirn-Krak*** for `"Voth iron mine (to be named)"`), or English working glosses?

2. **`Driyan`'s Map Pin (`725,1141` vs `705,1129`):**
   - `60-settlements.js` currently places `Driyan` (`sxvb4k4024`) at **`(725, 1141)`** (`+490 m`, `Csa`, `slope = 0.058`, in an upper tributary valley), whereas `ANCIENT-NETWORK.md` / `net51-gemini.json` (`new.driyan`) places it 44 km WNW at **`(705, 1129)`** (`+589 m`, `Cfa`, flat `slope = 0.013`, directly on the `118 m³/s` `Sharf Rivrh` and the Ancient `Shim`–`Wing`–`Pluton` highway junction).
   - **(a) Recommended:** Move `Driyan`'s canonical pin to **`(705, 1129)`** on the `Sharf Rivrh` & Ancient trunk junction (and optionally keep `(725, 1141)` as a smaller Shumari foothill town), **or (b)** keep `Driyan` at `(725, 1141)` and route the `Shim` spur to it?

3. **`Nephtos` (`919,762`) vs Vothic Overseas Possessions (`V7`):**
   - Confirm our reconciliation that **`Nephtos`** stays a **League of Tethys** island town (`isle-demo/PLAN.md` §15) acting as a neutral contraband entrepôt between Voth and Izani **`Porta Marr`**, while Voth's own overseas colonial spice ports are **`Zey'danin`, `Temora`, `Kautono`, and `Tzinguard` (`V7`)** — *or* should Voth hold a treaty-port / factor compound inside `Nephtos` (`nephtos:voth-factor`, on the Xanadu merchant-house pattern)?

4. **Slave Estates, Runaway Flight & Winter-Solstice Offerings in `core/simulation` (§4.3):**
   - How far should `V0`/`V1` model Voth's slave system on the valley host?
     - **(a) Recommended economic + friction layer:** Model `v2:estates`, `v1:estates`, and `v7:estates` as sub-settlements on low-cost slave diets remitting `Blïtrit`/cotton/grain to Chichani noble houses, with a steady **annual attrition/runaway drain** toward `Tallwalls` (replenished by penal sentencing, Scyvoi/frontier captives, or debt bondage, plus unrest spikes if Legion patrols go unpaid), while keeping the **Winter-Solstice Sun-Temple rites** (`LORE.md` §6.15) as a symbolic/ledger tribute sink (`voth:sun-temple` / `shim:sun-temple`) rather than per-actor execution ticks; **or**
     - **(b)** Explicit `captives` / `slaves` headcount stock transferred on the ledger for both plantation Replacements and the Winter Solstice?

5. **`Shim`'s Second Plantation Crop & Native `kits/crops` Additions (§2.3):**
   - With non-native `sugar-cane` removed from mainland `Shim` (`TRADE-SCOPE.md` §8.1), what pairs with **`Blïtrit` purple** on `Sim-Tzan`'s great slave plantations:
     - **(a) Both:** **Sunboll `cotton`** on the low lake-plains (feeding `Driyan`/`Shim` looms for dyed purple & crimson cloth exports!) **and `rattlepod` ("Rattle coffee")** on the warmer foothill estates;
     - **(b)** Sunboll `cotton` alone; or **(c)** `rattlepod` alone?
   - Should we queue the 5 Stage-1 native records from `TRADE-SCOPE.md` §2.5 (**`blitrit`**, **`rosette-vanilla`**, **`capgill`**, **`beadcone-silk`**, **`clifflung`**) into `kits/crops` before wiring `VOTH_TUNE`?

6. **Salvage Licensing (`Nazar`, `Wing`), `[LOCKED]` `Agropolitans`, `[LOCKED]` Toned-Down Gold & Geomancer Oil Leases (§2.1–2.2):**
   - **`Agropolitans` `[LOCKED BY OWNER]`:** Confirmed **NOT enslaved** — a **`4,000`-soul free, semi-nomadic ruin-tribe** in a client-state relationship comparable to `Torus`, making their living as mobile scrap-merchants supplying `Almua` and `Drum`.
   - **Voth Domestic Gold `[LOCKED BY OWNER]`:** Toned down significantly so Voth must seek bullion via external trade/tribute (`Talovolci C4`, `West Rift`, `Throne`).
   - **Remaining Open Call (`Nazar`/`Wing` & Oil):** Should `Nazar` (`13,392 km²`) and `Wing` (`416 km²`) remain strict Ordinator-guarded crown/penal salvage zones, and does Voth **refuse** homeland Geomancer oil derricks (`726,1003` near Voth Bay) while optionally licensing one watched enclave at overseas `Temora` (`761,870`)?

7. **Provincial Architectural & Kit Differentiation Across Voth's Seven Regions (§3.1 — `[PARTIALLY LOCKED BY OWNER]`):**
   - **`V1` (`Voth`):** Canonical bright Vothic urban masonry & courtyard kit (`settlements/voth`).
   - **`V2` (`Shim`, `Sethas`) `[LOCKED BY OWNER]`:** **100% `"Shim" vassal / old Chichani` architectural set** (+ Iziz-derived stepped Grand Sun-Temple & walled rural slave-estate villas).
   - **`V2` (`Azoth`) & `V3` (`Driyan`) `[LOCKED BY OWNER]`:** Both are **former Shumari cities that have mostly assimilated**, retaining a **large fraction of `kits/shumari` buildings** alongside a partial **`"Shim" vassal / old Chichani` set** (+ Vothic Legion garrison bastions).
   - **`V4` & `V6` (`Drum`, `Torus`):** Living/ruined Ancient shells + **`kits/sw-arcology`** industrial-tank/silo vassal kit + `voth-scrap` / Soleri `kits/metropolis` farm pods (`drum_stage1_blueprints.md`), **`Agropolis` (`4k`)** semi-nomadic `KCAMP` scrap-caravans, while **`Almua`** pairs a Vothic stone naval arsenal with **Chichani pastoral clan-tent wards**.
   - **`V5` (`Wing`, `Nazar`):** Fortified Ordinator timber/stone camps amid overgrown `kits/ancients` megastructure ruins.
   - **`V7` (`Zey'danin`, `Temora`, `Kautono`):** 5-layer colonial port (`Zeijani` + `kits/islanders` rumah + captured `Iziz` palace + `Hykkousoi` pods + Vothic mole) and West Islander coastal villages.
