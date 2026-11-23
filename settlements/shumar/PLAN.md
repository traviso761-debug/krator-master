# Amaro (*ʾAmāru*): canyon-lip capital of the Kingdom of Shumar, 12,000 people (proposal, 2026-11-18)

The owner, 2026-11-18: *"Do a careful planning session for amaro; reference the actual terrain map so you can account for heights, as iirc, you said this would be looking over a cliff lip"*.

Everything here is *proposed* except what the owner or `LORE.md` has fixed, what `core/region/data/shumar-tune.js` (`SHUMAR_TUNE`) already simulates, and what `kits/shumari` (`59` buildings, built and verified) already draws. No code, open-world cut, or scale-model raster is mutated by this document.

What is already settled:
- **The polity and capital** (`LORE.md` §6.19, §6.23; `core/simulation/PROPOSAL-SHUMAR.md`; `core/region/data/shumar-tune.js`): `ssgsv5zbd2`, **Amaro** (*ʾAmāru*), seat of the 1st Regiment ("Blades of Amaro", province `S1` `Qappu-Šubaru`) and capital of the **Kingdom of Shumar** (`rmw5s3ktxgv0d`), **12,000 people** in all:
  - **`10,600` in the walled canyon-lip city** (`ssgsv5zbd2`, including `480` `Gēdu-šu` Free Giants and `420` `-no` outlanders);
  - **`1,100` in the High Citadel & Grand *Dīwān*** (`amaro.citadel`, *Qappu al-Šubaru*, including `200` `Gēdu-šu` Giants, `560` `-šu` Sword, `340` `-ko` cadets);
  - **`300` in the Avenue of Domes & Hall of Blades** (`amaro.necropolis`, *Madīnat al-Qubab*, Mamluk *Qarāfa* / City of the Dead analogue, including `40` `Gēdu-šu` Giants).
- **Owner calls already answered (2026-11-17):**
  1. **Northern Vothic border (`gate.voth-march`):** cold-truce grain & cavalry mounts, strict embargo on `blades`, `armour`, `steel`, and `powder`.
  2. **Amaro's ground:** **canyon lip** (modeled on Dagestan's Khunzakh Plateau, Ronda's *El Tajo*, and Kars Citadel), using the **hilltop / Phēr multi-level `core/city` pattern** (`89zp-ph-site.js`: upper rim + switchback wall + lower gorge foot).
  3. **Distilled spirits trade slot:** keep `tequila` sim key, glossed in-world as **`Ṣūnu-šikaru`** (canyon twist-apricot & `spiralaloe` spirit distilled in copper-dome alembics).
  4. **Open-world split:** two regions — **`openworld/shumar-west`** (`S1`–`S3`, holding Amaro) and **`openworld/shumar-east`** (`S4`–`S6`).
- **The building kit (`kits/shumari`, committed through `d815de3e`):** all `59` `defBuilding`s, `44/44` Voth census trades (`SM_TRADES`), `97` PBR surface + `f_*` furniture detail texture families, `krator-master-furniture-shumari.js` (`28` pieces), `kits/interiors/sets/shumari.js`, and `core/hamlet/shumari/25-hamlet-shumari.js` (`KHAMLET.shumariRow`) are built and verified.

Sources surveyed directly for this plan:
- Scale model `5.1` (`tools/scale-model/model/data/`): `h.png` decoded as `(R*256 + G)/65535 * 29600 - 2600 m`, `wl.png`, `c.png` (`climate.json`), `p.png`, `tm.png`/`tw.png`/`tc.png`, `rivers.json`, `60-settlements.js`;
- Open-world terrain & town-baking pipeline: `tools/scale-model/extract_region.py`, `core/world/41-world-fields.js` (`carveAt`, `scarpw`), `core/world/bake_towns.py` (`closed` ground sampling), `tools/scale-model/edit_517_pher.py`, `tools/scale-model/edit_517_gorge.py`;
- Network routes: `openworld/net51-gemini.json` (`dirt.amaro`) and `openworld/roads-supplement-gemini.json` (`supp.ssgsv5zbd2`);
- Built reference terrain: `biomes/shighlands/stations/shumar/44s-host-land.js` (Station 4's `230 m` four-tier basalt-and-limestone *ablaq* gorge) and `settlements/pher/targets/town/89zp-ph-site.js`.

---

## 1. The site on the actual `5.1` terrain map (and the cliff-lip discrepancy uncovered)

### 1.1 Direct raster survey at the current pin `px (731, 1184)` (`ssgsv5zbd2`)

Inspecting `tools/scale-model/model/data/h.png` and `rivers.json` directly around `(731, 1184)` (`2 km/px`) reveals an important discrepancy between the prose assumption in `PROPOSAL-SHUMAR.md` / `BUILD-OUT.md` (*"overhanging the 260–330 m triple confluence of Bētun-Nārun, Qappu-Nārun and Pāyaru-Buruqu"*) and what the `5.1` heightmap currently holds at `(731, 1184)`:

| Property | Actual `5.1` raster at `(731, 1184)` | Actual `S1` triple confluence (`730.6, 1191.2` – `728.6, 1193.2`) |
|---|---|---|
| **Distance from `(731, 1184)`** | `0 km` (current `60-settlements.js` pin) | **`14.4 km` south** (`7.2 px` in `+y`) |
| **Ground elevation (`h.png`)** | **`3,054.0 m`** (`1.09 atm`) | River cells **`3,026.9 m`**; N bluff **`3,070.7 m`** (`730,1191`); central promontory **`3,088.7–3,103.7 m`** (`731,1192` / `730,1193`); S rim **`3,116.3 m`** (`730,1194`) |
| **W–E profile (`2 km` steps)** | `2,988 m` (`727`) -> `3,000 m` (`728`) -> `3,015 m` (`729`) -> `3,033 m` (`730`) -> **`3,054 m` (`731`)** -> `3,077 m` (`732`) -> `3,123 m` (`733`) -> `3,175 m` (`734`) -> `3,236 m` (`736`) -> `3,283 m` (`739`) | Confluence trough at `3,026.9 m` pinched between `3,071 m` N bluff, `3,089–3,104 m` promontory spur, and `3,116–3,124 m` S plateau |
| **N–S profile (`2 km` steps, col `731`)** | `3,072 m` (`1180`) -> `3,067 m` (`1182`) -> **`3,054 m` (`1184`)** -> `3,048 m` (`1186`) -> `3,049 m` (`1188`) -> `3,063 m` (`1190`) -> **`3,027 m` (`1191`, river)** -> **`3,089 m` (`1192`, bluff)** | Steepest natural river pinch in central `S1`: `61.8 m` in `2 km` at `730.6,1191.2` and `89.4 m` in `2 km` at `728.6,1193.2` (`97.5 m` in `4 km`) |
| **Local slope & cliff lip** | **Gentle west-facing bench (`~1.1%` grade, `25 m` max drop in `2 km`, NO cliff lip)** | Converging river bluffs (`44–90 m` raw 2 km drop, **before** sub-cell gorge incision; see §1.2) |
| **Rivers within `6 km`** | **None.** Nearest is `r288 Pāyaru-Buruqu` (`60.1 m³/s`, `35 m` wide) **`7.2 km` ESE** at `(732.6, 1187.2)`, where `bed_m = 3,070.8 m` (`17 m` *higher* than `731,1184`) | **Three perennial rivers meet here:** `r007 Bētun-Nārun` (`72.8 -> 135.1 -> 209.1 m³/s`, `111 m` wide), `r288 Pāyaru-Buruqu` (`60.1 m³/s`, `35 m` wide), and `r287 Qappu-Nārun` (`68.9 m³/s`, `37 m` wide, descending from Station 4) |
| **Climate (`c.png`, `p.png`, `tm.png`)** | `Dsb`, `439 mm/yr`, mean `+6 °C` (warm `+17 °C`, cold `-4 °C`) | `Dsb` / `Dsc` transition, `439 mm/yr`, mean `+6 °C` (sheltered canyon floor ~`+1.5 °C` warmer by lapse) |
| **Highway endpoints (`net51` / `supp`)** | `dirt.amaro` (102 km W tunnel/viaduct road) and `supp.ssgsv5zbd2` (92 km Urundashi highway) both start `7.2 km` ENE at **`(734, 1182)` (`3,191.3 m`)**, Amaro's pre-nudge pin | `19.8 km` SSW of `(734, 1182)` (a 9-px plateau connector joins both roads cleanly) |

### 1.2 Why `5.1` lacks a `240 m` slot gorge in `S1` (and where the `331 m` and `1,875 m` cliffs actually are)

Three facts in the `5.1` pipeline explain what happened:

1. **Where the `331 m` drop on `r007 Bētun-Nārun` actually sits:** Along `r007`'s 174 km course, its maximum 4 km canyon-wall drop on the plateau is indeed `331.1 m` — **but at `v[28] px (698.58, 1169.22)`, `71 km` WNW in West Gorge (`S2`)**, where `r007` (`499.7 m³/s`) drops from `2,718.8 m` (`v[27]`) to `2,408.1 m` (`v[28]`) under a `2,739.2 m` rim, right before plunging `2,182 m` off the western escarpment to `225.7 m` at `v[29] (696.50, 1167.20)`.
2. **Why `r007` is flat (`3,026.9 m`) across central `S1`:** Across `v[7]..v[15]` (`px 736.6,1191.2` to `720.6,1193.2`, `36 km` of river), the `5.1` hydrology basin-breach pass clamped `r007`'s `bed_m` and `cellE` to a single flat sill elevation of **`3,026.9 m`** (`0.0 m` gradient over `36 km`, with `bed_m == cellE`), before resuming its fall at `v[16] (718.6, 1191.2, 3,000.6 m)` and `v[20] (710.6, 1185.2, 2,893.6 m)`.
3. **Why `core/world` (`41-world-fields.js`) does not auto-cut a `240 m` canyon when `bed_m == cellE`:** At 1:1, `carveAt(x, z, h)` cuts `Dc = h - min(h - depth, bed - depth*0.5)` within `CHREACH = 900 m`, where `depth = 2 + chanS * 5` is only **`~12–16 m`**. And `extract_region.py`'s `scarpw` (`SCARP_R = 24 km`) only sharpens macro-escarpments (`>45–180 m/km`), not a `300–600 m`-wide Khunzakh/Ronda river chasm inside a `2 km` pixel. That is why Station 4 (`biomes/shighlands/stations/shumar/44s-host-land.js`) explicitly carved its `230 m` four-tier gorge (`3,312 m` rim -> `3,082 m` river floor) in its local height function, and why `Phēr` (`edit_517_pher.py` + `bake_towns.py` `closed`), `Shade`, and `Verge` bake their sub-cell cliffs/basins into `openworld/towns/<id>`.

For completeness, the **actual existing cliffs in `h.png`** within or bordering `S1–S3` are:

| Candidate cliff on `5.1` | `px, py` | Rim -> Floor (`h.png`) | Drop | River / Water | Trade-off for Amaro |
|---|---|---|---|---|---|
| **A. Triple-Confluence Promontory (*recommended*)** | **`730.8, 1191.8`** (`14 km` S of pin) | **`3,071–3,104 m` -> `3,027 m`** raw (`-> 2,828 m` with gorge incision, §1.3) | `62–90 m` raw; **`245–276 m` incised** | **`Bētun-Nārun` (`209 m³/s`) + `Pāyaru-Buruqu` (`60 m³/s`) + `Qappu-Nārun` (`69 m³/s`)** | Preserves `S1` centrality (`14 km` shift), real 3-river confluence, Khunzakh/Kars canyon lip, `Pāyaru-Gisr` bridge at city foot |
| **B. Current Pin + Sub-Cell Tributary Gorge** | **`731, 1184`** (`0 km` shift) + `733, 1184` E spur | **`3,054 m` city / `3,123 m` citadel -> `2,844 m`** sub-cell ravine (`amaroH`) | `25 m` raw; **`210–279 m` with local ravine** | Requires new spring-fed `r_amaro_buruqu` (`~18 m³/s`, `14 km` S to `r007`, like Phēr's `Swīṭ Siṭrīm`) | Zero pin move in `60-settlements.js`; smaller tributary stream rather than the great `209 m³/s` confluence |
| **C1. `Dōriyan-Īnu` Karst Abyss Lip** | **`737, 1171`** (`28.6 km` NNE, `S3`) | **`2,966–3,006 m` -> `1,003–1,091 m`** already in `h.png` | **`1,875–1,962 m` in `2–4 km`!** | Overhangs `16 km²` sunken karst tarn (`1,091 m`); `Csa` `+8 °C`, `675 mm` | Spectacular `1.9 km` sheer cliff already in `h.png` with zero terrain edits; moves Amaro `29 km` NNE into `S3` (`Dōriyan-Īnu` / `Qirmiz-Wādī` swap places with `S1`) |
| **C2. West Gorge Cataract Lip** | **`699, 1170`** (`68 km` WNW, `S2`) | **`2,715–2,739 m` -> `2,408 m` -> `226 m`** already in `h.png` | **`331 m` inner gorge + `2,285 m` outer plunge** | `Bētun-Nārun` (`500 m³/s`) leaping off Shumar | Huge natural gorge + waterfall cliff, but sits on the far western border (`68 km` off-center from `S4`–`S6` and the Ordeal) |

### 1.3 Proposed siting & terrain engineering (Option A default, designed so Option B uses the same vertical architecture)

*Proposed (**Option A**, question 1):* **Seat Amaro on the triple-confluence promontory (`px 730.8, 1191.8`, nudging `ssgsv5zbd2` `14 km` south to `(731, 1192)`) and un-flatten `r007`'s `3,026.9 m` sill into a true `~245 m` stepped *ablaq* gorge (`edit_520_amaro_gorge.py` + `openworld/towns/amaro`).**

How the two-scale terrain works so `dist/amaro.html` and `openworld/shumar-west` agree to the metre:
1. **Scale-model gorge edit (`tools/scale-model/edit_520_amaro_gorge.py`, queued in Wave 1.1 alongside Phēr's `edit_517_pher.py` / `edit_517_gorge.py`):**
   - Un-flattens the artificial `3,026.9 m` sill along `r007 Bētun-Nārun` (`v[6..20]`) plus the lowest `3` vertices of `r288 Pāyaru-Buruqu` (`v[9..11]`) and `r287 Qappu-Nārun` (`v[7..8]`):
     - `r007` falls smoothly from `3,060.9 m` (`v[6]`, `736.6,1189.2`) -> `2,865 m` (`v[9]`, `732.6,1191.2`) -> **`2,828.0 m` at the Amaro confluence (`v[10]`, `730.6,1191.2`, `135.1 m³/s`)** -> **`2,818.0 m` at the `Qappu-Nārun` junction (`v[11]`, `728.6,1193.2`, `209.1 m³/s`)** -> `2,795 m` (`v[18]`, `714.6,1189.2`, joining the existing west-gorge fall cleanly above `2,768.2 m` at `v[25]`).
   - Re-lapses temperature grids (`smodel.climate.lapse`: canyon floor warms by `~1.3 °C` to `+7.3 °C`, making sheltered `whorlapricot` and `spiralaloe` terraces ecologically native at the gorge foot!).
   - Splices `dirt.amaro` and `supp.ssgsv5zbd2` from their stale `(734, 1182)` endpoint south across the `3,065 m` plateau bench to Amaro's north landward *wikala* gate.
2. **Closed-form 1:1 ground (`amaroH(x, z)` in `89za-am-site.js`, sampled into `openworld/towns/amaro` by `core/world/bake_towns.py` `closed`, `R = 3,200 m`, `band = 1,100 m`, `step = 10 m`):**
   - Page frame: metres, `+x` east along the canyon rim, `+z` south-west **out over the cliff lip into the confluence chasm**, `y` metres **above the confluence river level (`AM.RIVER_ASL = 2,828.0 m`, so page `y = 0` is the water surface at the mill-quay)**.
   - World height = `amaroH(x, z) + 2828.0 m`:
     - **`y = 0.0 m` (`2,828 m asl`):** `Bētun-Nārun` (`90 m` channel in the gorge) joined from the NE side-canyon by `Pāyaru-Buruqu` (`32 m` channel).
     - **`y = +2.5 to +28 m` (`2,830.5–2,856 m asl`):** gravel point-bar, dressed basalt mill-quay, and south-facing orchard/alembic benches (`120–220 m` wide) at the canyon foot.
     - **`y = +28 to +224 m` (`2,856–3,052 m asl`):** **the `196 m` sheer stepped *ablaq* cliff wall** (matching Station 4's `44s-host-land.js` geology): four columnar-basalt risers (`42–56 m` high at `68–78°` slope) separated by three `8–18 m` pale cream-limestone/travertine ledges (`y = +74 m`, `+132 m`, `+184 m`), cleft on the west flank by a `55 m`-deep side-ravine (`Pāyaru` forge-chute) up which the switchback ramp climbs.
     - **`y = +224 to +244 m` (`3,052–3,072 m asl`):** **the Canyon-Lip City table (`ʾAmāru` proper)** — a `1,650 m × 1,050 m` plateau headland (`1.2–2.5%` gentle N->S tilt toward the lip) bounded on S, SE, and SW by the sheer cliff drop and on N by the landward curtain wall.
     - **`y = +252 to +276 m` (`3,080–3,104 m asl`):** **two higher rock spurs** rising `+25–32 m` above the city table:
       - **West Promontory Spur (`Qappu al-Šubaru`, `amaro.citadel`, `y = +268 m` / `3,096 m asl`):** narrow `420 m × 300 m` prow jutting between the two river gorges (drop of **`268 m`** on three sides, rock-cut dry fosse on the fourth — exact Kars / Khunzakh citadel geometry).
       - **East Rim Crest (`Madīnat al-Qubab`, `amaro.necropolis`, `y = +256 m` / `3,084 m asl`):** `620 m × 240 m` limestone-capped ridge along the eastern cliff lip, lifting the Hall of Blades and the six regimental *qubba* domes onto the skyline from both city and gorge below (`refs/01–03`).

*(Note if **Option B** is chosen instead: the exact same `amaroH(x, z)` profile stands at `(731, 1184)` rotated `90°` so the city table at `3,054 m` looks west over a `210 m` incised `r_amaro_buruqu` gorge at `2,844 m`, while `Qappu al-Šubaru` climbs the real `3,101–3,123 m` east ridge toward `733, 1184`!)*

---

## 2. Who lives there (exact split of `SHUMAR_TUNE`'s `12,000`)

Every count below matches `core/region/data/shumar-tune.js` (`T.places[0]` + `T.districts`) to the single resident:

| Precinct | Total Pop | `Gēdu-šu` / `Gēdu-ko` Free Giants (`3.3–3.6 m`) | `-šu` Human Sword | `-ko` Human Cadets / Probationers | `-ra` Hearth-Commons | `-no` Outlanders |
|---|---:|---:|---:|---:|---:|---:|
| **`ssgsv5zbd2` City Proper (`L0–L3`)** | **10,600** | **480** (~95 Giant households) | **1,170** | **720** | **7,810** | **420** |
| **`amaro.citadel` (*Qappu al-Šubaru*, `L4W`)** | **1,100** | **200** (1st-Regiment Giant wing) | **560** | **340** | *0* (served from city) | *0* (barred) |
| **`amaro.necropolis` (*Madīnat al-Qubab*, `L4E`)** | **300** | **40** (veteran wardens) | **120** | **40** | **100** (*bimaristan* leeches & carvers) | *0* |
| **Greater Amaro Total** | **12,000** | **720** (`6.0%`, `2.6x` diet) | **1,850** (`15.4%`) | **1,100** (`9.2%`) | **7,910** (`65.9%`) | **420** (`3.5%`) |

### 2.1 Occupational breakdown across the `10,600` city residents (`SHUMAR_TUNE` works + households)

| Group | Crew in `SHUMAR_TUNE` | People (with households) | Where they live & work |
|---|---:|---:|---|
| **Master bladesmiths, crucible/hearth melters & armourers** | `640` (`80` crucible + `80` coal-hearth + `240` bladesmiths + `240` armourers) | ~2,450 | Work on `L1` Forge-Chute & `L0` trip-hammer mill-race; live in lower `L2` Hearth wards (`sm_hearth_house`, `sm_terrace_house`) |
| **Toolsmiths, damascene brass/bronze inlay & crimson kilim/lacquer guilds** | `320` (`160` toolsmiths + `80` brass-shop + `80` kilim-loom) | ~1,250 | `L2` Covered Bazaar spine & guild courts (`sm_lacquer_inlay_shop`, `sm_shop_house`, `sm_weaver_dyer`) |
| **`Ṣūnu-šikaru` (`tequila`) distillers & canyon orchardists** | `240` (`160` glass-bottled + `80` stoneware-jug stills; `1.8x` in `distilling`) | ~950 | `L0` Gorge Foot copper-dome still-houses (`sm_spirits_still`) & south-facing apricot/aloe shelves (`sm_apricot_orchard`) |
| **`-šu` Sword officers, *muqṭaʿ* fief-holders & `Gēdu-šu` Giant households** | `1,650` (`1,170` human `-šu` + `480` `Gēdu-šu` Giants in city) | `1,650` | `L2` Rim Quarter (`giant: true` `sm_captain_bayt`, `sm_sword_villa`, `sm_giant_sword_hall`, `sm_rim_pavilion` directly along the cliff lip) |
| **`-ko` urban probationers, quarrymen, water-carriers & ramp porters** | `720` | `720` | `L1` cliff-shelf `sm_cliff_cot` & `sm_cadet_cell` / `sm_giant_cadet_cell` ranges beside the switchbacks and cisterns |
| **`-no` licensed foreign factors, drovers & caravan crews** | — | **`420`** | Strictly confined outside the inner Giant *pishtaq* in **`L3` `Bābu-Wikāla` Forecourt** (`sm_wikala_caravanserai`, `sm_outlander_lodging`, `sm_envoy_house`: Dalabi coal/salt factors, Longsong glass/sugar factors, Vrivolci Giant drovers) |
| **Bakers, *boza* brewers, *hammam* attendants, *sabil* keepers & domestic trades** | — | ~3,160 | Distributed across `L2` Hearth blocks (`sm_bakery`, `sm_butcher`, `sm_brewery_teahouse`, `sm_bazaar_hall`, `sm_courtyard_house`) |

---

## 3. Physical & vertical layout: five elevation tiers (`L0`–`L4`)

To make the `~245–268 m` cliff lip dramatic from **every** camera angle — looking down from the rim pavilions into tiny foaming rivers and copper still-domes `240 m` below, looking across the chasm from the Citadel prow to the Avenue of Domes, or looking *up* from the fortified gorge bridge at `250 m` of *ablaq* masonry and domes crowning sheer columnar basalt — Amaro is organized into **five explicit vertical tiers**, using **three `core/city` (`KCITY`) instances** (`AM_LOW`, `AM_RIM`, `AM_WIKALA`), **two monumental spur ensembles** (`AM_CITADEL`, `AM_QUBAB`), and **one engineered switchback + compound-stair wall** (`AM_WALL`):

| Tier | Name & Role | Local `y` (over river) | World `asl` (Option A) | Footprint & Slope | `KCITY` / Placement Mode |
|---|---|---:|---:|---|---|
| **`L0`** | **`Gisr al-Bētun` (The Gorge Foot, Confluence Bridge & Still-Yards)** | `0 .. +28 m` | `2,828 .. 2,856 m` | `950 m × 260 m` canyon floor benches (`sl <= 0.08`) | `KCITY` instance **`AM_LOW`** (`cell: 2.5 m`, contour strip along both riverbanks) |
| **`L1`** | **`Darb al-Kīr` (The Switchback Forge-Ramp & Cliff Terraces)** | `+28 .. +224 m` | `2,856 .. 3,052 m` | `196 m` vertical climb across `4` basalt cliff steps | Parametric switchback **`AM_WALL`** (`2,750 m` road at **`7.1%` max grade**) + direct compound Giant/human stair-chute + terraced smithies/houses on the `3` limestone ledges |
| **`L2`** | **`ʾAmāru` Proper (The Canyon-Lip Walled City)** | `+224 .. +244 m` | `3,052 .. 3,072 m` | `1,550 m × 980 m` rim table (`sl 0.015–0.04`) | Primary `KCITY` instance **`AM_RIM`** (`frontage-courts` + `KCITY.stance` battered *ishigaki* plinths up to `maxDrop: 12 m` along the lip) |
| **`L3`** | **`Rabaḍ al-Ghurabāʾ` (The Outer `-no` *Wikala* & Caravan Forecourt)** | `+236 .. +248 m` | `3,064 .. 3,076 m` | `520 m × 360 m` north of the landward gate (`sl <= 0.03`) | Secondary `KCITY` instance **`AM_WIKALA`** outside the inner `sm_pishtaq_gate` where `dirt.amaro` & the Urundashi highway converge |
| **`L4W`** | **`Qappu al-Šubaru` (`amaro.citadel` — High Citadel & Grand *Dīwān*)** | `+252 .. +276 m` | `3,080 .. 3,104 m` | `420 m × 300 m` west cliff promontory (`268 m` 3-sided drop) | Host court **`AM_CITADEL`** across a rock-cut dry fosse (`18 m` wide, `14 m` deep) bridged by a Giant *ablaq* causeway |
| **`L4E`** | **`Madīnat al-Qubab` (`amaro.necropolis` — Avenue of Domes & Hall of Blades)** | `+246 .. +264 m` | `3,074 .. 3,092 m` | `620 m × 240 m` east cliff-lip crest | Processional ridge **`AM_QUBAB`** (`14 m`-wide basalt ceremonial way lined with `6` regimental *qubbas* + `sm_hall_of_blades`) |

### 3.1 `L0` — The Gorge Foot (`y = 0 .. +28 m`, `2,828–2,856 m asl`)
- **The Fortified Confluence Bridge (`sm_gorge_bridge_tower` × 2):** Spans the narrowed basalt throat where `Pāyaru-Buruqu` enters `Bētun-Nārun`, carrying the southern *Way of Blades* (`road.amaro-urudiru` toward Station 4 `Qappu-Qubba` and the Ordeal).
- **Waterwheel Trip-Hammer & Bellows Race (`sm_watermill` × 6):** Fed by a stone diversion leat (`+6 m` head) along the north bank, driving heavy forge-hammers and crucible-air trompes before tailwater returns to the river.
- **The Copper-Dome Still-Yards (`sm_spirits_still` × 8) & Sheltered Orchards (`sm_apricot_orchard` × 10, `sm_fungus_cellar` × 3):** Placed on the sunny, wind-sheltered south-facing limestone talus shelf (`+1.3 °C` warmer than the windy plateau rim), where canyon `whorlapricot` and `spiralaloe` mash is roasted and distilled in copper-dome alembics (`amaro.stills-glass`, `amaro.stills-jug`).
- **Riverbank Tannery & Dye-Vats (`sm_tannery` × 3, `sm_weaver_dyer` × 3):** Kept `220 m` downwind/downstream of the city rim so tanning and madder-vat effluent enters `Bētun-Nārun` below the bridge.

### 3.2 `L1` — The Switchback Forge-Ramp & Cliff Ledges (`y = +28 .. +224 m`)
Accounting carefully for heights and Giant biomechanics (`kits/shumari/src/26k-kit.js`):
- **Wagon & `Gēdu-šu` Giant Ramp (`AM_ROAD`):** Climbing `196 m` straight up would be a `35–60%` cliff — impossible for ox-wagons hauling iron/charcoal or `3.5 m` Giants in plate. Instead, `AM_ROAD` switchbacks in **five long legs (`~550 m` each = `2,750 m` total length)** cut into the `Pāyaru` side-ravine and the three natural limestone ledges (`y = +74 m`, `+132 m`, `+184 m`), holding a continuous **`7.1%` grade (`4.1°`)** with `18 m`-radius flat hairpin turns (`sm_sabil_shrine` or `sm_wayside_cairn` + mule watering trough on each hairpin, just as Phēr puts a teahouse/stall at each switchback turn).
- **The Direct Compound Stair-Chute (*Sullam al-Gēdu*, `smCompoundStair`):** Cutting straight up the ravine axis in `900 m` horizontal run is a `6.5 m`-wide monumental stair pairing **`0.38 m` Giant risers (`0.62 m` tread)** on the `3.8 m` central spine with **`2 × 0.19 m` human steps** flanking both sides under *ablaq* arch-landings every `24 m` of rise.
- **Ledge Forge-Terraces (`y = +74 m` & `+132 m`):** The crucible steel furnaces (`amaro.crucible`, `amaro.coal-hearth`) and heavy bladesmith/armourer hearths (`sm_blade_smithy` × 14, `sm_stonecutters_yard` × 2) stand on the broad `+74 m` and `+132 m` limestone ledges where **canyon updrafts** vent furnace smoke away from the upper `-šu` residences and rockfall/fire cannot spread into the bazaar, flanked by `3`-storey `sm_terrace_house` and `sm_cliff_cot` dwellings (`maxDrop: 14 m` *ishigaki* plinths).

### 3.3 `L2` — The Canyon-Lip City (`ʾAmāru` Proper, `y = +224 .. +244 m`)
- **The Cliff-Lip Promenade & Battered *Ishigaki* Rim (`z` lip):** Along `1.4 km` of the southern cliff edge, no blind curtain wall blocks the abyss where the `224 m` vertical drop itself is impregnable. Instead, battered polygonal basalt plinths (`smPlinth`) step directly out of the uppermost basalt column-cap, topped by *shurafat* crenellated parapets, `4` overhanging **`sm_rim_pavilion`** belvederes, and the grand **`-šu` Sword-Caste Quarter** (`giant: true` `sm_captain_bayt`, `sm_sword_villa`, `sm_giant_sword_hall`, `sm_hammam` × 3). Every `-šu` mansion along the south rim looks straight over the cliff lip onto the confluence `230 m` below.
- **The Crossed Mamluk Spine (*Qaṣaba al-ʾAmāru*):**
  - **N–S Grand Spine (`14 m` wide, Giant clearance):** Runs `920 m` from the northern landward **`sm_pishtaq_gate`** (`Bābu al-Šamāl`) straight to the **Lip Meydan** (`110 m × 80 m` open basalt square at the head of the `L1` ramp & compound stair, anchored by `sm_cistern_hall` snowmelt vault and `sm_sabil_shrine`). Lined with `sm_bazaar_hall` (`v=0,1`), `sm_lacquer_inlay_shop`, `sm_brewery_teahouse`, and `sm_shop_house` with projecting crimson-lacquered *mashrabiya* bays (`refs/02`).
  - **W–E Crest Avenue (`12 m` wide):** Links the Citadel draw-arch (`L4W`) on the west to the Necropolis Ceremonial Gate (`L4E`) on the east (`road.amaro-citadel` & `road.amaro-necropolis`).
- **Hearth-Commons (`-ra`) Neighbourhoods:** `18` `KCITY` `frontage-courts` blocks filled with `sm_hearth_house` (`v=0,1`), `sm_courtyard_house`, `sm_terrace_house`, `sm_bakery`, `sm_butcher`, `sm_weaver_dyer`, and neighbourhood `sm_sabil_shrine` fountains; fortified on the flat landward N/NW arc by **`sm_curtain_wall`** segments and **`sm_payaru_tower`** bastions.

### 3.4 `L3` — The Outer `-no` *Wikala* Ward (`y = +236 .. +248 m`, Landward North Gate)
- Placed immediately north of `Bābu al-Šamāl`'s `sm_pishtaq_gate` where `dirt.amaro` (western trunk) and `road.amaro-urundashi` (eastern steppe highway) meet.
- Anchored by **`sm_wikala_caravanserai` × 3** (Dalabi coal/salt court, Izani/Longsong glass & book-factor court, Vrivolci Giant cattle/timber court), **`sm_envoy_house` × 3**, **`sm_outlander_lodging` × 12**, **`sm_stock_fold` × 4** (caravan mule/ox corrals), and the *Dīwān* `4%` customs weigh-house (`cut` rule in `SHUMAR_TUNE`). Visualizes Shumar's caste law directly in architecture: vibrant foreign caravan life outside the wall, Giant-guarded Mamluk austerity inside.

### 3.5 `L4W` & `L4E` — The Twin Skyline Spurs (`y = +246 .. +276 m`)
- **`L4W` — `Qappu al-Šubaru` (`amaro.citadel`, `1,100` people, `y = +252 .. +276 m`):**
  - Isolated from `L2` by a `18 m`-wide rock-cut dry fosse crossed by a single `sm_gorge_bridge_tower` causeway into a Giant `sm_pishtaq_gate`.
  - Outer bailey (`+254 m`): **`sm_ordeal_yard`** (probationer drill court), **`sm_regiment_barracks` × 3**, **`sm_cadet_cell` × 6**, **`sm_giant_cadet_cell` × 4**, **`sm_state_granary` × 4** (receiving the six provinces' annual *iqta'* grain/cheese/wool convoys), and **`sm_armoury` + `sm_saltpeter_works`** (`citadel.powder`, `80` crew grinding `S6` nitre, sulfur & `S2` charcoal).
  - Inner prow (`+268 .. +276 m` right on the `268 m` three-sided cliff point): **`sm_diwan_hall`** (the hexagonal Council of the Six Captains), **`sm_kattu_chancery`** (Archive of the `Šumaru-kattu` Oath-Rolls), **`sm_citadel_keep`**, and the supreme **`sm_payaru_tower`** signal beacon visible for `40 km` across `S1`.
- **`L4E` — `Madīnat al-Qubab` (`amaro.necropolis`, `300` people, `y = +246 .. +264 m`):**
  - Modeled directly on Cairo's Northern Cemetery (*Qarāfa* of Qaytbay & Barsbay) and `kits/shumari/refs/01–03`, perched along the high eastern cliff crest so its carved stone domes stand in crisp silhouette above the gorge!
  - Entered through **`sm_ordeal_gate`**; a `480 m` stone-flagged *Avenue of Domes* links **`sm_regiment_qubba` × 6** (one endowed *waqf* mausoleum for each of the Six *Šubaru* Regiments, alternating `#spiral` `+1` right-handed gadroons and `#carved` geometric star-interlace domes), culminating at **`sm_hall_of_blades`** (twin carved Mamluk domes where notched blades of fallen Sword-brothers hang and spring `graduation` blades are issued).
  - At the NW cliff corner looking toward lost *Dōriyan* stands **`sm_doriyan_stele`** — the sole **left-handed (`hand = -1`) mirror-spiral dome** in Amaro — beside **`sm_bimaristan`** (the veteran Sword hospice & trauma surgery endowed by *waqf*).

### 3.6 Target building count & population calibration (~`1,480` buildings for `12,000` residents)

| Zone | Civic / Sacred / Defence / Works hosts | Residential & shop-house infill (`KCITY`) | Est. Buildings | People Carried |
|---|---:|---:|---:|---:|
| **`L0` Gorge Foot** | `34` (`2` bridge-towers, `6` mills, `8` stills, `10` orchards, `6` tannery/dyers, `2` *sabils*) | `38` (`sm_cliff_cot`, `sm_herder_house`, `sm_terrace_house`) | ~`72` | ~`550` |
| **`L1` Switchback & Ledges** | `24` (`14` `sm_blade_smithy`, `2` stone yards, `5` hairpin *sabil*/cairns, `3` guard posts) | `135` (`sm_terrace_house`, `sm_cliff_cot`, `sm_cadet_cell`, `sm_giant_cadet_cell`) | ~`159` | ~`1,350` |
| **`L2` Canyon-Lip City** | `58` (`4` `sm_rim_pavilion`, `3` `sm_hammam`, `2` `sm_cistern_hall`, `8` `sm_bazaar_hall`, `6` `sm_sabil_shrine`, `12` walls/gates/towers, `23` guild/bake/brew hosts) | `1,040` (`~190` `-šu` Giant villas/bayts/halls + `~850` `-ra` hearth/courtyard/shop houses) | ~`1,098` | ~`8,280` |
| **`L3` Outer `-no` *Wikala*** | `14` (`3` `sm_wikala_caravanserai`, `3` `sm_envoy_house`, `4` `sm_stock_fold`, `4` gate/weigh/watch) | `42` (`sm_outlander_lodging`, `sm_shop_house`) | ~`56` | ~`420` |
| **`L4W` `amaro.citadel`** | `28` (`keep`, `diwan`, `chancery`, `ordeal_yard`, `3` barracks, `4` granaries, `2` armoury/powder, `15` walls/towers/cells) | `18` (`sm_captain_bayt`, `sm_giant_sword_hall`, `sm_cadet_cell`, `sm_giant_cadet_cell`) | ~`46` | **`1,100`** |
| **`L4E` `amaro.necropolis`** | `18` (`sm_hall_of_blades`, `6` `sm_regiment_qubba`, `sm_doriyan_stele`, `sm_bimaristan`, `sm_ordeal_gate`, `2` *sabils*, `6` cloister/wall segments) | `24` (custodian `sm_sword_villa`, `sm_courtyard_house`, `sm_cadet_cell`) | ~`42` | **`300`** |
| **Total** | **`176` stamped hosts** | **~`1,297` `KCITY` lots** | **~`1,473`** | **`12,000`** |

---

## 4. Economy & `SHUMAR_TUNE` parity (zero drift from `core/region/data/shumar-tune.js`)

The page reads `core/region/data/shumar-tune.js` (`SHUMAR_TUNE`) directly in place; `tests/test-amaro-site.js` asserts exact parity between the drawn works/districts and `SHUMAR_TUNE`:

1. **All `9` city industrial works (`ssgsv5zbd2`, `1,200` total works crew) + `1` citadel ordnance work (`citadel.powder`, `80` crew):**
   - `amaro.crucible` (`80` crew, `crucibleSteel`: `iron` + `S2` `charcoal` + `S5` `nickel` -> watered `steel`) -> `L1` upper forge ledge;
   - `amaro.coal-hearth` (`80` crew, `coalSteel`: Dalabi `coal` + `scrap` + `iron` -> `steel`) -> `L1` lower forge ledge;
   - `amaro.bladesmiths` (`240` crew, `bladesmith`: `steel` + `charcoal` + `brass` + `crimson` -> `blades`) -> `L1` forge-chute & `L2` Sword-guild court;
   - `amaro.armourers` (`240` crew, `armourer`: `steel` + `iron` + `brass` + `wool` -> Mamluk mirror-plate `armour`) -> `L1`/`L2` armourers' street;
   - `amaro.toolsmiths` (`160` crew, `toolsmith`) -> `L2` hardware lane;
   - `amaro.inlay` (`80` crew, `bronzeSmelt`: `copper` + `tin` -> damascene `brass`/bronze) -> `L2` *Qaṣaba* bazaar (`sm_lacquer_inlay_shop`);
   - `amaro.stills-glass` (`160` crew, `alembicGlass`, `1.8x` in `distilling`) & `amaro.stills-jug` (`80` crew, `alembicJug`, `1.8x` in `distilling`) -> `L0` Gorge Foot (`sm_spirits_still`);
   - `amaro.looms` (`80` crew, `kilimLoom`: `wool` + `crimson` -> regimental kilims & scabbard-felt) -> `L2` weavers' court (`sm_weaver_dyer`);
   - `citadel.powder` (`80` crew in `amaro.citadel`, `powderMill`: `saltpeter` + `charcoal` + `sulfur` -> `powder`) -> `L4W` Citadel magazine (`sm_saltpeter_works` + `sm_armoury`).
2. **State *iqta'*, *waqf*, and `4%` *Bābu* toll flows:**
   - Annual post-harvest *iqta'* convoys (`diwan.iqta.s1..s6`) deliver directly into `L4W`'s `sm_state_granary` court (`105 t` grain, `14 t` cheese, `12 t` wool, `6 t` fish, `10 t` charcoal, `3.9 t` brass, `40` blades, `20` armour, `24` mounts).
   - Regimental *waqf* shares from `Pāyaru-Gisr` (`22%` grain) and `Mīṣu-Bustān` (`18%` driedfruit, `12%` fruit) endow `L4E` `Madīnat al-Qubab` and `sm_bimaristan`; every spring `graduation`, `amaro.necropolis` dispatches `48` ceremonial blades down *The Way of Blades* to `Urudīru-Qappu`.
3. **Amaro's `6` ring hamlets (`1,310` people in `SHUMAR_TUNE.rings`, placed on `openworld/shumar-west` via `KHAMLET.shumariRow`):**
   - `amaro.ring.farm-1..3` (`3 × 240`), `amaro.ring.orchard-1` (`240`), `amaro.ring.quarry-1` (`190`), `amaro.ring.ranch-1` (`160`) — coordinates auto-adjusted if Option A nudges the capital `14 km` south so all `6` stay within an `8–18 km` ring on `<0.20` dry arable/pasture cells.

---

## 5. Core adoption (written in full before the first fragment; checked by `tools/check_core_use.py`)

| Need | Module | How |
|---|---|---|
| **1:1 open-world ground & roads** | `core/world` (`WORLD.H`, `ROADS`, `bake_towns.py`) | Standalone target `settlements/shumar` (`--target amaro` -> `dist/amaro.html`) shares the exact closed-form `amaroH(x, z)` + `amaroWorldFrame()` with `core/world/bake_towns.py` (`kind: 'closed'`, `openworld/towns/amaro`), loaded by `openworld/shumar-west` (`41t`). Zero height mismatch between settlement page and open world |
| **Gorge rivers, mill-leat & snowmelt sheen** | `core/water` | `Bētun-Nārun` and `Pāyaru-Buruqu` flowing in the `L0` gorge channel (`y = 0`), plus the `+6 m` stone mill-leat feeding `sm_watermill` overshot wheels (`41t` `over` river link into `openworld/shumar-west`) |
| **Sub-cell cliff-face overhangs (optional)** | `core/terrain` (`CORE_TERRAIN`) | Optional undercut basalt column pockets behind the `L0` still-yards and under the `L4W` Citadel prow |
| **Multi-level streets, blocks & lot stances** | `core/city` (`KCITY`, `KCITY.stance`, `frontage-courts`) | Three `KCITY` instances (`AM_LOW` on `L0`, `AM_RIM` on `L2`, `AM_WIKALA` on `L3`) + `AM_WALL` switchbacks (`<= 7.1%` grade) and `AM_CITADEL` / `AM_QUBAB` spur courts, following `settlements/pher/targets/town/89zp-ph-site.js` without touching `core/city/` files |
| **Buildings & trade mapping (`59` defs)** | `kits/shumari` (`shumari.py` / `kit_bundle.py` `SMK`) | Read in place from `kits/shumari/src` + `core/engine` on `dist/amaro.html` (and bundled via `SMK` on `openworld/shumar-west`), with `97` PBR & `f_*` detail texture sets from `kits/shumari/tex/` |
| **Flora & highland rock dress** | `biomes/shighlands` (`--station shumar`) | Read in place (`ropepine`, `coiljuniper`, `helixpoplar` along `L0` riverbanks, `whorlapricot` & `spiralaloe` on `L0`/`L1` sunny shelves, `spiralsage` & `ichu` on `L2`–`L4` plateau rims; cleared over street/lot masks) |
| **Seeded PRNG, masks, tags & spatial hash** | `core/rand` (`KRAND`), `core/mask` (`KMASK`), `core/tags` (`KTAGS`), `core/space` (`KSPACE`) | Every lot, cliff boulder, orchard tree, market stall, and bridge pier seeded from `(world, cell, index, salt)`, never `Math.sin` or `getImageData`; registered in `KTAGS` before drawing |
| **Camera, inspector, sky (`1.09 atm`), walker & doors** | `core/camera`, `core/probe`, `core/sky`, `core/walk`, `core/door`, `core/lighting` | Standard `1.09 atm` crisp `Dsb` highland sky, `F`-key ground walker able to walk continuously from `L0` Gorge Bridge up both the `L1` switchback and compound Giant stairs through `L2` *Qaṣaba* into `L4W` *Dīwān* and `L4E` Hall of Blades; night brazier/cresset lighting (`?night=1`) |
| **Walk-in interiors (`?interiors=1`)** | `kits/interiors` (`sets/shumari.js`) + `kits/catalog` (`krator-master-furniture-shumari.js`) | Indexed catalog batch (`KF.batch({indexed:true})`) furnishing `sm_diwan_hall`, `sm_hall_of_blades`, `sm_regiment_qubba`, `sm_captain_bayt`, `sm_wikala_caravanserai`, `sm_hearth_house`, `sm_spirits_still`, and `sm_brewery_teahouse` |
| **Citizens & Free Giants (when crowded)** | `core/charactermodels` | Human `-šu`/`-ra`/`-ko`/`-no` citizens plus `3.3–3.6 m` `Gēdu-šu` Free Giants (`tools/giant.py`) verified against every `giant: true` `4.2 m` portal |
| **Economy & census source of truth** | `core/region` (`core/region/data/shumar-tune.js`) | Imported directly; verified by `tests/test-amaro-site.js` |
| **Verification & Godot export** | `tools/harness.py`, `core/export` | Headless `verify.py --assert` (`SURVEY` + rim-overlook, gorge-upward, citadel-prow, qubab-skyline, wikala-gate, and walk-reach views) + `core/export` adapter |

---

## 6. Ordered build steps (`Track A`, ~3 sessions once siting is confirmed)

| Step | Scope | Verification Gate |
|---|---|---|
| **`A0` — Map & tune alignment (if Option A or C chosen)** | Queue `tools/scale-model/edit_520_amaro_gorge.py` (un-flatten `r007` `v[7..18]` to `2,828 m` at the confluence, nudge `ssgsv5zbd2` to the confluence bluff, splice `dirt.amaro` & `supp.ssgsv5zbd2` from `(734,1182)` to Amaro's north gate, update `SHUMAR_TUNE` `px, py` for Amaro + its `6` ring hamlets & `Pāyaru-Gisr`) | `tests/test_smodel.py` green; river strictly downhill (`0` pits); `node core/simulation/tests/test-shumar-economy.js` `100%` green |
| **`A1` — Ground, gorge water, spurs & walls (`settlements/shumar --target amaro`)** | Scaffold `settlements/shumar/` (`build.py` with `build_sources.report()`, `verify.py` on `tools/harness.py`, `BUDGETS.json`, `INDEX.md`); author `89za-am-site.js` (`amaroH` `245–268 m` four-tier *ablaq* cliff + `L0` confluence rivers + `L1` `7.1%` switchback & compound Giant stair + `L4W` Citadel & `L4E` Avenue of Domes hosts) | Node geometry & slope audit (`max ramp grade <= 0.075`, `0` drowned lots, `0` cliff-hanging un-plinthed corners); `verify.py` terrain & silhouette pass |
| **`A2` — Three-level `KCITY` infill (`L0`, `L2`, `L3`) & flora** | Populate `AM_LOW` (mills, copper stills, orchards), `AM_RIM` (`-šu` Giant cliff-lip villas/pavilions, *Qaṣaba* bazaar, `-ra` Hearth courts), `AM_WIKALA` (`-no` caravanserais & envoy courts), `L1` forge-terraces, and `biomes/shighlands --station shumar` canyon/rim flora | `tests/test-amaro-site.js` (`~1,450–1,550` lots, `12,000 ± 5%` capacity, `100%` `SHUMAR_TUNE` works & Giant-clearance parity, `0` OBB collisions) |
| **`A3` — Walkability, `?interiors=1`, night cressets & delta audit** | Wire `core/walk` continuous nav strips (`L0 -> L1 -> L2 -> L3/L4W/L4E`), `?interiors=1` Shumari room sets, `?night=1` Mamluk bronze cressets & forge glow, Godot `core/export`, and `DELTA.md` audit | `verify.py --assert`, `check_core_use.py`, `check_assembly.py`, `check_source.py`, `check_budgets.py` all green |
| **`A4` — Open-world integration (`openworld/shumar-west`)** | Add `'amaro'` to `core/world/bake_towns.py` (`openworld/towns/amaro`) and mount in `openworld/shumar-west/SITES.json` alongside Amaro's `6` `KHAMLET.shumariRow` ring hamlets | `openworld/shumar-west` `verify.py --assert`: seamless rim-to-gorge blend and continuous river channel |

---

## 7. Decisions for the owner before `A0` / `A1` begins

1. **Where should Amaro's cliff lip sit on the `5.1` terrain map (§1.1–1.3)?**
   - **(Recommended) Option A — Nudge `14 km` south to the real Triple-Confluence Promontory (`px 730.8, 1191.8` / `(731, 1192)`) + incise the `3,027 m` river sill into a `245–268 m` *ablaq* gorge (`edit_520_amaro_gorge.py`):** Gives Amaro the actual `209 m³/s` confluence of `Bētun-Nārun`, `Pāyaru-Buruqu`, and `Qappu-Nārun` directly under its cliff lip (`3,096 m` Citadel prow -> `2,828 m` river), keeps `S1` centrality, and folds `Pāyaru-Gisr`'s fortified bridge & watermills right into the city's gorge foot (`L0`) or `4 km` downstream.
   - **Option B — Keep exact `(731, 1184)` pin (`3,054 m`) + carve a sub-cell tributary ravine (`r_amaro_buruqu`, `210 m` deep to `2,844 m`):** Leaves `60-settlements.js` at `(731, 1184)` (`Qappu al-Šubaru` on the `3,123 m` east ridge toward `733, 1184`) and adds a smaller spring-fed ravine draining `14 km` south to `Bētun-Nārun` (like Phēr's `Swīṭ Siṭrīm`).
   - **Option C — Re-seat onto an existing `h.png` mega-cliff (no gorge carving needed):** either **`C1` `Dōriyan-Īnu` (`737, 1171`, `29 km` NNE)** where a `2,966 m` `Csa` rim already plunges **`1,875 m` in `2 km`** into a `16 km²` sunken karst lake (`1,091 m`), or **`C2` West Gorge lip (`699, 1170`, `68 km` WNW)** above `Bētun-Nārun`'s `331 m` inner gorge and `2,180 m` western cataract.
2. **If Option A is chosen, how should `Pāyaru-Gisr` (`sm.payaru-gisr`, `850` people, currently `729, 1192`) relate to Amaro's Gorge Foot (`L0`)?**
   - **(Recommended) Keep `Pāyaru-Gisr` as a distinct sister bridge-townlet `6 km` downstream (`726, 1193`, where `Qappu-Nārun` & `Mīṣu-Nārun` swell `Bētun-Nārun` to `214–332 m³/s`)**, while Amaro's own `L0` Gorge Foot holds the capital's fortified bridge, copper-dome `Ṣūnu-šikaru` stills, and trip-hammer mills. (Preserves all `37` named records in `SHUMAR_TUNE` intact.)
   - Or merge `Pāyaru-Gisr` directly into Amaro as a third sub-district (`amaro.gisr`), reducing the `37` named places to `36`.
3. **Placement of the noisy/smoky watered-steel & coal hearths (`amaro.crucible`, `amaro.coal-hearth`, `amaro.bladesmiths`):**
   - **(Recommended) Split on the `L1` cliff ledges & forge-chute** (`+74 m` & `+132 m` shelves above the `L0` waterwheel bellows/hammers, venting smoke up the side-ravine away from the `L2` `-šu` Rim Quarter, with fine hilt/scabbard damascene & crimson-lacquer finishing up in the `L2` *Qaṣaba* bazaar).
   - Or concentrate all furnaces in a dedicated walled Foundry Ward on the plateau rim (`L2`).
4. **`Madīnat al-Qubab` (`amaro.necropolis` — Hall of Blades & 6 Regimental *Qubba* Domes):**
   - **(Recommended) East Cliff-Lip Crest (`L4E`)** so its `8` carved and `+1`/`-1` spiral Mamluk stone domes stand along the canyon rim in dramatic silhouette from both the city meydan and the gorge bridge below (`refs/01–03`).
   - Or along the landward approach road outside the north gate (classic Cairene *Qarāfa* arrival avenue before entering the city).

---

## 8. Found on the way (recorded for Wave 1.1; untouched here)

- **Stale road origin `(734, 1182)` in `net51-gemini.json` and `roads-supplement-gemini.json`:** Both `dirt.amaro` (`102 km` western tunnel/viaduct road) and `supp.ssgsv5zbd2` (`92 km` Urundashi highway) start at `[734, 1182]` (`3,191.3 m`), `7.2 km` ENE of `(731, 1184)` and `20.9 km` NNE of `(731, 1192)`. Wave 1.1 should prepend a smooth plateau segment into Amaro's `L3` north *wikala* gate.
- **`dirt.amaro` northern alignment vs `Bētun-Bābu` (`701, 1171`):** In `net51-gemini.json`, `dirt.amaro` runs NW from `(734, 1182)` through `(720, 1166)` into its `19 km` tunnel `(718, 1164 .. 712, 1160)` and viaduct `(710, 1160 .. 694, 1162)` — `18 km` north of `Bētun-Bābu` (`701, 1171`) and `Bābu-Wikāla` (`699, 1171`), which sit on the southern West Gorge of `Bētun-Nārun`. Wave 1.1 should either add the `S1->S2` West-Gorge branch road along `Bētun-Nārun` (`Amaro -> Nazāru-Kūra -> Bētun-Kūra -> Bētun-Bābu`, joining `Dervu-Čiču` `711,1165` up to the `dirt.amaro` tunnel portal at `718,1164`) or align `Bābu-Wikāla` to the tunnel head `(718, 1164)` so customs, road geometry, and `SHUMAR_TUNE` match.
- **Flat `3,026.9 m` sill on `r007 Bētun-Nārun` (`v[7..15]`):** Whether Option A or Option B is chosen, un-flattening `r007`'s `36 km` `0.0`-slope sill (`edit_520_amaro_gorge.py`, modeled on `edit_517_gorge.py`) will give all of central `S1` (`Amaro`, `Pāyaru-Gisr`, `Mīṣu-Bustān`) a true falling highland canyon river instead of a flat sill.
