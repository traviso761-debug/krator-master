# Proposal: the Kingdom of Shumar on the sim layer (Amaro, the six *Šubaru* regiments, the canyons, the NE lakes and the Ordeal ramp)

The owner, 2026-11-17: *"merge in claude/openworld-sites-24defd and scope the Shumari plateau for trade, resources, hamlets, and small settlements similar to the work done for the xanadu census"*.

Status: **Draft census & sim scope (`SM-Sim-0`, 2026-11-17)**. No simulation code or scale-model pin is mutated by this document; it reconciles the merged open-world census and trade records on `main` (`3062edc0`) with a full pixel-by-pixel scan of `Shumar` (`rmw5s3ktxgv0d`), scopes `core/region/data/shumar-tune.js` (`SHUMAR_TUNE`) on the valley host (`core/region/50-region-valley.js`), and pairs with `settlements/shumar/BUILD-OUT.md` for the physical build-out of Shumar's towns, regimental sanctuaries, canyon villages, mines, quarries, *yayla* camps and `core/hamlet` rings. Everything not fixed by `LORE.md`, the owner's briefs or the map's rasters is marked *proposed*.

## Sources

- **Lore & language:**
  - `LORE.md` §6.23 (the Shumari, lost Driyan/*Dōriyan*, the purchased slave-soldiers who inverted power into the ruling Mamluk caste, **the Ordeal** under Godthrone, escaped Nazari slaves, and Free Giants in the caste); §6.19 (Tallwalls, Tallhouse & Greenstep); §10–11 (culture-neutral meshes and signs).
  - `lore/tongues-of-krator.html` lines 3255–3330, 5172–5360: the Shumari tongue (*Šumārum*), its 28-letter `Šumaru-kattu` Blade-and-Hook script, sound laws, and mandatory four-caste grammar (`-šu` Sword-caste, `-ra` Hearth-commons, `-ko` Ordeal-cadets, `-no` Outlanders).
- **Biome & building kit (built 2026-11-17, `ccf58539`):**
  - `biomes/shighlands/PLAN-STATIONS.md` ("Shumar: the western dry-plateau stations"): Station 4 (`--station shumar`, `5.1 px 737,1201`, 3,308 m `Dsb` basalt-and-limestone *ablaq* gorge) and Station 5 (`--station ordeal`, `5.1 px 782,1194`, 4,426 m `ET`/`Dsc` SE initiation ramp under Godthrone).
  - `kits/shumari/PLAN.md` and `kits/shumari/README.md`: Kars/Ani Armenian basalt + Cairene Mamluk carved & right-handed (`+1`) spiral-fluted stone domes (`qubba`), towering *pishtaq* portals, battered *ishigaki* plinths, crimson-lacquered galleries, ancestor/regimental cult, and Free Giant (`Gēdu-šu`) clearance (`>= 4.2 m` doors, `>= 5.0 m` vaults) on all `defence`, `civic`, `sacred` and `sword` (`-šu`) buildings.
- **Scale model 5.1, geology & crops (scanned directly on merged `main`):**
  - `tools/scale-model/model/data/` (`h`, `wl`, `c`, `p`, `tm`, `tw`, `tc`, `th`, `tl`, `rivers.json`, `basins.json`), `51-region-store.js` (`rmw5s3ktxgv0d`), and `60-settlements.js` (`ssgsv5zbd2` Amaro, `srbp1bvh1r` Urundashi, `smqy5z5eek` Tallhouse).
  - `kits/resources/data/geology.json` (all 37 layers: the 16 base ore/evaporite families, `zinc`, the 10 `--mined` families, 4 ledger basics, and 6 rock layers, plus river placers).
  - `kits/crops` (`CROPS.at` and `CROPS.BIOMES.shighlands`) and `core/world/49r-world-resources.js` (`farm`, pasture, timber).
- **Open-world census, network & Gemini trade model (`claude/openworld-sites-24defd`):**
  - `openworld/RESOURCES-SETTLEMENTS.md`, `openworld/TRADE-GOODS.md`, `openworld/TRADE-SCOPE.md` (the extraction rule for oil/rare earths, native crops, Tallwalls resized to a town of 2,500).
  - `openworld/ANCIENT-NETWORK.md` lines 851–853 and `openworld/net51-gemini.json` (`dirt.amaro`, `r.new.driyan.*`, `izani.shim.driyan`).
  - `openworld/populations-gemini.json`, `openworld/trade-gemini.json`, `openworld/roads-supplement-gemini.json`, `openworld/trade-fleets-gemini.json`, and `tools/scale-model/gemini_trade_model.py` (read as a draft baseline; section 10 lists where it disagrees with the rasters).
  - Precedent census & build-out pair: `core/simulation/PROPOSAL-XANADU.md` and `settlements/xanadu/BUILD-OUT.md`.

---

## 1. Scale, pins and caste demography to reconcile first

### 1a. Population across sources

Unlike Xanadu (where the early census and Gemini differed tenfold), Shumar was **absent from the 120-pin `resources-settlements.json` scan** because `Amaro` (`ssgsv5zbd2`) and `Urundashi` (`srbp1bvh1r`) were added later in `5.1e11`. Gemini's calibrated population table (`openworld/populations-gemini.json`) is therefore the first quantitative baseline:

| Place / Group | `60-settlements.js` pin | Gemini (`populations-gemini.json`) | Proposed sim census (`SHUMAR_TUNE`) |
|---|---|---|---|
| **Amaro** (*ʾAmāru*, capital) | `ssgsv5zbd2`, `city` at `731,1184` (`net51`: `734,1182`) | `cur_pop` 6,500; `on_screen` **12,000**; `sim_urban` **18,000** (`1.5x`) | **12,000** in the city & citadel (`amaro`, `amaro.citadel`, `amaro.necropolis`); the other 6,000 urban people are unbundled into the 4 regional gorge/lake seats below |
| **Urundashi** (*Urundaši*, eastern seat) | `srbp1bvh1r`, `village` at `779,1153` | 1,100 (`1.0x`) | **3,500** (`town`, seat of the eastern flock-and-brine province `S4`; Gemini already gives it city-tier bladesmith, armour, dairy, wool & distillery output) |
| **Four *proposed* provincial seats** (`Bētun-Bābu`, `Suṭōn-Qappu`, `Yāmu-Qappu`, `Urudīru-Qappu`) | *unpinned* | folded into Amaro's `1.5x` multiplier and the rural ratio | **9,900** in all (`3,200 + 2,500 + 2,800 + 1,400`) |
| **Named forts, *qubba* sanctuaries, canyon & lake villages, mines & camps** (31 sites) | `Tallhouse` (`683,1184`, 250, held by Free Giants — see 1b); rest *unpinned* | folded into `rural_pop` | **13,300** (drawn/declared one by one on the valley host; section 3 and `BUILD-OUT.md` §1b–1e) |
| **Bulk provincial countrysides** (`prov.s1`..`prov.s6`, plus 22 drawn town-ring hamlets of ~4,630) | — | `rural_pop` **85,950** (`rural_ratio: 4.5`) | **66,300** in bulk rural districts + **4,630** in town rings (**70,930** rural; `~84,230` outside the 6 seats) |
| **Kingdom of Shumar total** | 2 Shumari pins (+ 1 Vrivolci fort inside NW corner) | **105,050** (`3.08/km²` on 34,128 km²) | **~109,630** (`~105,000` rounded: **3.28 people/km²** across `33,412 km²`, concentrated along the 16 perennial gorges and the NE lakes) |

**Why ~105,000–110,000 fits the plateau:** Shumar is a cold `Dsb`/`Dfb` continental tableland (`424 mm/yr` rain, `-5 °C` winter mean, `6,970 farm-eq km²` and `16,362 pasture km²-eq`), roughly a third the population of lush caldera-lake Xanadu (`~350,000` on `73,808 km²`). Keeping Gemini's ~105k total while splitting Amaro's `18,000` abstract urban figure into **12,000 at Amaro + four 1,400–3,200 district seats + Urundashi at 3,500** gives Shumar a believable Mamluk castle-town hierarchy without inflating headcount. As in `PROPOSAL-XANADU.md` §1, the sim counts every resident once (never multiplying supply/demand by `pop_mult_vs_cur = 13.82`).

### 1b. Coordinate & border discrepancies to settle (section 9, Q2)

Direct raster inspection on merged `5.1` (`tools/scale-model/model/data/`) surfaces three pin alignments:

1. **Amaro (`ssgsv5zbd2`): `(731, 1184)` vs `(734, 1182)`.**
   - `60-settlements.js` (`5.1e11`) places `Amaro` at **`(731, 1184)`**: dry, inside `Shumar`, **3,054 m**, `slope 0.011`, `Dsb`, `439 mm`, `+6.0 °C` (`+17 / -4 °C`), perched directly above the grand canyon confluence where `r288 Pāyaru-Buruqu` (`60.1 m³/s`) and `r287 Qappu-Nārun` (`68.9 m³/s`) drop into `r007 Bētun-Nārun` (`604.8 m³/s` at `730.6,1191.2`).
   - `openworld/ANCIENT-NETWORK.md` line 851 and `net51-gemini.json` (`new.amaro`, `dirt.amaro`, `supp.ssgsv5zbd2`) place `Amaro` 6.7 km ENE at **`(734, 1182)`**: dry, inside `Shumar`, **3,191 m**, `slope 0.015`, `Dsb`, `439 mm`, `+7.0 °C` (`+20 / -5 °C`), on the open interfluve bench (`765 farm-eq km²` vs `715` at 30 km reach).
   - *Recommendation:* reconcile `60-settlements.js` and `net51` to one canonical coordinate in the scale-model queue — either **`(731, 1184)`** if we want a dramatic Khunzakh/Kars **canyon-rim capital** overhanging `Bētun-Nārun`, or **`(734, 1182)`** if we keep `ANCIENT-NETWORK.md` verbatim and treat `(730, 1191)` as Amaro's lower river-mill & bridge suburb (`Pāyaru-Gisr`). Both are dry and gentle.
2. **Driyan (`sxvb4k4024`, Vothic Kingdom — lost *Dōriyan*): `(725, 1141)` vs `(705, 1129)`.**
   - `60-settlements.js` has `(725, 1141)` (`490 m, Csa, 1,035 mm`, foot of the Shumar scarp); `ANCIENT-NETWORK.md` line 852 / `net51-gemini.json` moved it to `(705, 1129)` (`589 m, Cfa, 1,882 mm`, on `r034 Sharf Rivrh` and Shim's Izani highway). Outside Shumar's polygon either way, but affects the exact bearing of Shumar's northern watch-forts (`S3`).
3. **Tallhouse (`smqy5z5eek`, `(683, 1184)`, `1,001 m, Csa, 878 mm`) sits inside the NW corner of `Shumar`'s polygon (`rmw5s3ktxgv0d`), while `populations-gemini.json` assigns it to `Free Giants (Vrivolci)` (`250` fort) and `tongues-of-krator.html` line 5359 glosses it as Shumari `Ṭāru-bētun` ("northern watch-fort and border gate at the NW rim of Shumar").**
   - At `1,001 m Csa`, `(683, 1184)` is physically at the **western escarpment foot** where `r284 Dōriyan-Nārun` plunges off the plateau, right on the 352 km² polygon overlap between `Shumar` and `Vrivolci`.
   - *Proposed lore-exact synthesis (Q3):* keep `Tallhouse` (`683, 1184`) at the 1,001 m foot as a **joint / Free Giant lower pass-fort** where `Gēdu-ko` Giant volunteers and Greenstep pack trains stage, paired with Shumar's upper rim fortress **`Ṭāru-Bētun` (Upper Tallhouse)** 12 km east up the gorge lip at **`(689, 1185)`** (`2,712 m Cfb`).

### 1c. Caste demography on the sim

Shumari grammar (`tongues-of-krator.html:5320-5325`) divides every person into four castes, which map cleanly onto `kits/shumari` building tiers and `SHUMAR_TUNE.diet` rows:

| Caste | Suffix | Share (est.) | People | Who they are & how the sim models them |
|---|---|---|---|---|
| **Sword-Caste** (*Šubaru-šu* & *Gēdu-šu*) | **`-šu`** | ~13% | ~14,200 | ~11,800 human Mamluk officers/cavalry/administrators and **~2,400 Free Giants (`Gēdu-šu`, ~450 Giant households)** who passed the Ordeal. Concentrated in Amaro, the 5 regional seats, regimental *qubba* precincts and frontier forts. Live in `giant: true` compounds (`sm_sword_villa`, `sm_captain_bayt`, `sm_giant_sword_hall`); paid from *iqta'* village shares and the *Dīwān* Arsenal |
| **Hearth-Commons** (*Bētu-ra*) | **`-ra`** | ~70% | ~76,800 | Free Shumari canyon farmers, orchardmen, distillers, shepherds, millers, smiths, masons and domestic traders (`sm_hearth_house`, `sm_courtyard_house`, `sm_terrace_house`, `sm_herder_house`). Hold the 6 provincial countrysides, town rings and craft wards |
| **Ordeal-Cadets & Probationers** (*Ṭirānu-ko*, *Nazāru-ko*, *Gēdu-ko*) | **`-ko`** | ~15% | ~16,400 | Drafted Shumari youths, newly escaped **Nazari** slaves climbing up from Voth, **Free Giant** initiates (`Gēdu-ko`), and poor unsworn upland drovers. ~1,800 stand in active training cells (`Urudīru-Qappu` and Amaro's Ordeal yard); the rest work cadet corvée in mines, charcoal kilns, saltpeter vats and high *yayla* flocks before their trial |
| **Outlanders** (*ʾAwtu-no*) | **`-no`** | ~2% | ~2,200 | Dalabi, Free Giant, Talovolci, Izani and Eternian caravan factors, glass/scrap peddlers and envoys, legally confined to outer *wikala* caravanserais (`sm_wikala_caravanserai`, `sm_outlander_lodging`, `sm_envoy_house`) outside the inner *pishtaq* gates |

---

## 2. Quantitative resource, water, mineral and crop census (`rmw5s3ktxgv0d`)

### 2a. Ground, climate and elevation bands

Scanned across all **8,353 cells (`33,412 km²`)** of `Shumar` (`rmw5s3ktxgv0d`, bounding box `px 681..826, 1109..1226`):

- **Elevation:** `960 m` (NW escarpment toe at `685,1183`) to `4,797 m` (SE rim under Godthrone at `773,1207`); `p10 = 2,881 m`, **median = `3,162 m`**, `p75 = 3,457 m`, `p90 = 3,983 m`, `p99 = 4,442 m`.
- **Air pressure (`1.6 * exp(-h/8 km)`):** **median `1.08 atm`** (`p5 = 0.95 atm` on the Ordeal ramp, `p95 = 1.13 atm` in the gorges) — dense enough on the plateau for full forge draft and cavalry charge, thinning below `0.95 atm` only on the SE Ordeal climb.
- **Precipitation & temperature:** **median `424 mm/yr`** (`mean 440 mm`, `p10 = 392 mm`, `p90 = 471 mm`, rising above `800–1,500 mm` only on the narrow NW escarpment lip); annual mean **`+6.0 °C`** (`p10..p90: +3..+9 °C`), warm month **`+18.0 °C`** (`+14..+21 °C`), cold month **`-5.0 °C`** (`-10..-2 °C`), winter extreme **`-12 °C`** (`-23 °C` on the SE ramp).
- **Köppen mix:** **`Dsb` 34.3%** (`11,452 km²`), **`Dfb` 21.2%** (`7,092 km²`), **`Cfa` 15.1%** (`5,048 km²`, mild western/northern canyon lips), **`Dsc` 10.8%** (`3,600 km²`), **`Dfc` 5.8%** (`1,948 km²`), **`Csb` 4.8%** (`1,604 km²`), **`Csa` 2.2%** (`736 km²`, sheltered lake/gorge pockets), **`BSk` 2.1%** (`704 km²`), **`ET` 1.2%** (`388 km²`, high Ordeal rim).

### 2b. Hydrology: 16 perennial rivers and 4 highland through-lakes (`356 km²` water)

Shumar has **no dry wadis**; snowmelt from Godthrone's western flank and the 4.5 km southern crest feeds **16 perennial canyon rivers** plus **four fresh through-lakes** inside the polygon (`89 wet px = 356 km²` inside `rmw5s3ktxgv0d`, `417 km²` including border shore cells):

| Water body | Id / `5.1 px` | Flow / Size | Elev & Gorge wall | Role in Shumar's economy |
|---|---|---|---|---|
| **Bētun-Nārun** ("House-River") | `r007`, `748.6,1191.2 -> 686.5,1153.2` | **`604.8 m³/s`**, 174 km (58 km in Shumar) | bed `2,408–3,332 m`; wall up to **`331 m`** | Trunk artery of `S1` & `S2`: Amaro's canyon mills, apricot orchards, blast-bellows waterwheels, and the `102 km` western highway gorge |
| **Dubnosriba** (*Dubnu-Nārun*) | `r011`, `778.7,1157.2 -> 684.5,1141.2` | **`422.8 m³/s`**, 211 km (38 km in Shumar) | bed `2,913–3,154 m`; wall `57–99 m` | Trunk river rising at **Urundashi** (`779,1153`), draining the north-central bench westward into the Vothic lowlands |
| **Nazāru-Nārun** ("Nazar-River") | `r285`, `716.6,1211.3 -> 712.6,1189.2` | **`134.5 m³/s`**, 51 km | bed `2,925–3,027 m`; wall `97–118 m` | South-western tributary to `r007`; irrigates `S1`'s western grain terraces and carries the Greenstep saddle trail |
| **Mīṣu-Nārun** | `r286`, `734.6,1215.3 -> 724.6,1195.2` (with `r395 Wārun-Buruqu`) | **`115.3 m³/s`**, 48 km | bed `3,071–3,610 m`; wall `85–210 m` | Southern snowmelt canyon descending from the central rim straight toward Station 4 (`shumar`) and `r007` |
| **Ṣōrun-Nārun** ("Salt-River") | `r304`, `754.6,1165.2 -> 752.6,1153.2` | **`95.9 m³/s`**, 26 km | bed `2,976–3,080 m`; wall `41–91 m` | Cuts across Shumar's bedded-halite bench (`halite 22`) into `Dubnosriba`: site of Shumar's modest brine-boiling sheds |
| **Dōriyan-Nārun & Gēdun-Buruqu** | `r284` (`73.2 m³/s`) & `r394` (`15.3 m³/s`) | 83 km & 20 km | bed `1,041–2,800 m`; wall up to **`1,644 m`**! | Spectacular NW boundary chasm above `Tallhouse`: holds Shumar's **richest high-grade gold (`load 4.57`) and tin (`load 12.46`) placers** |
| **Qappu-Nārun, Pāyaru-Buruqu & Dīpun-Buruqu** | `r287` (`68.9`), `r288` (`60.1`), `r289` (`28.6 m³/s`) | 40, 51 & 23 km | bed `2,984–3,646 m`; wall `45–185 m` | The three upper head-gorges converging below Amaro (Station 4 stands on `Qappu-Nārun` at `737,1201`) |
| **Northern Scarp Brooks** (`dervosriba`, `Suṭōnun-Buruqu`, `Dōriyan-Buruqu`, `Kattu-Buruqu`) | `r300` (`38.6`), `r301` (`37.2`), `r302` (`32.9`), `r303` (`26.6 m³/s`) | 32–81 km | bed `2,865–2,974 m`; wall `64–198 m` | Four parallel north-flowing notches over the Vothic March (`S3`), guarded against Voth and climbed by fleeing `Nazāru-ko` |
| **NE Great Lake** (*Šīru-Yāmu*, *proposed*) | `basin` at `790.7,1131.2` (`r069 Uarosriba` `62.4 m³/s` west) | **`289 km²`**, `207 m` deep | level **`2,710 m`**, **`Csa`/`Csb`** (`+9..+11 °C`) | Warmest microclimate on the plateau (Lake Sevan / Lake Çıldır analogue): highland trout/char fishery, canyon-grape & apricot shores (`S5`) |
| **Lower NE Gorge Lake & East Rim Tarn** | `782.7,1123.1` (`80 km²`, fed by `r237 Nemetos Brucos` `17 m³/s`) & `810.7,1115.1` (`32 km²`) | `80 km²` (`221 m` deep) & `32 km²` (`173 m` deep) | **`2,281 m` `Csa`** & **`2,694 m` `Csa`** | Stepping-stone lake chain along the NE frontier toward `Spirladunon` and the NE skarn/nickel mines |
| **Dōriyan Gorge Tarn** (*Dōriyan-Īnu*, *proposed*) | `basin` at `738.6,1169.2` (head of `r302 Dōriyan-Buruqu`) | **`16 km²`**, `199 m` deep | sunken gorge level **`1,093 m` `Cfa`**, rim `2,889 m` | Deep karst/fault sink-tarn ringed by 1.8 km cliffs (`stone 255`): sacred mourning pool for lost *Dōriyan* |

### 2c. Bedrock and the 37 `geology.json` layers

Scanned across all **2,103 geology land cells (`33,648 km²`)** inside `Shumar`:
- **Rock provinces:** `sedimentary` **89.6%** (`30,160 km²`), `granite` **3.9%** (`1,312 km²`), `impact` **3.7%** (`1,248 km²`), `volcanic` **1.8%** (`592 km²`, SE Godthrone & NE contacts), `crystalline` **1.0%** (`336 km²`).
- **Ancient ruin ground:** **`0` cells** (`ruin_g = 0`). Shumar has zero domestic Ancient scrap.

| Family | Mean byte | Peak byte | Good (`>=100`) km² | Rich (`>=170`) km² | Lode nodes | Good-ground yield (all-grade) | Where the rich ground stands (`5.1 px`) |
|---|---|---|---|---|---|---|---|
| **`iron`** | **77.3** | **255** | **9,728** | **6,832** | **1,105** | **705.5** (`1,064.5`) | Three rich belts: West Gorge `(704,1172)` `255`, SE Ordeal contact `(774,1200)` `255`, NE skarn rim `(822,1120)` `255` |
| **`saltpeter`** | **67.4** | **184** | **1,168** | **80** | **558** | **35.0** (`505.0`) | SE dry-cold Ordeal ramp `(774,1206)` & `(786,1192)` `184`; plateau-wide dry limestone caves/crusts (`62–77`) |
| **`tin`** | 10.2 | **200** | **1,312** | **1,312** | **79** + placers | **61.5** (`87.5`) + **4 high-grade placers** | Western granite plutons `(686,1188)` & `(700,1172)` `200`, N rim `(746,1144)` `200`; placers at `(692.5,1171.2)` (`load 12.46`) & `(692.5,1173.2)` (`6.64`) |
| **`gold`** | 11.2 | **140** | **2,240** | 0 | **71** + placers | **56.0** (`70.0`) + **2 high / 4 low placers** | SE Ordeal contact `(778,1200)` `140` & NE rim `(824,1120)` `140`; rich river placers in `Dōriyan-Nārun` `(692.5,1171.2)` (`load 4.57`) & `Gēdun-Buruqu` `(692.5,1173.2)` (`3.15`) |
| **`zinc`** | 4.7 | **168** | **1,168** | 0 | **44** | **48.5** (`48.5`) | SE Ordeal sulfide contact `(776–778,1198–1202)` `168` & NE skarn `(824,1120)` `168` (alloys with copper for Mamluk brass!) |
| **`copper`** | 19.0 | **210** | **1,168** | **592** | **140** | **41.5** (`136.5`) | SE Godthrone volcanic contact `(776–778,1200)` `210` & NE skarn `(822–824,1120)` `210` |
| **`silver`** | 11.0 | **150** | **2,240** | 0 | **53** | **40.0** (`53.5`) | Same SE Ordeal `(778,1200)` `150` & NE `(824,1120)` `150` argentiferous galena/sulfide veins |
| **`rare-earth`** | 10.0 | **160** | **1,648** | 0 | 38 | 30.5 (`36.5`) | Northern granite `(746,1144)` — **unworked** under `TRADE-SCOPE.md` §2.4 (Shumar lacks extraction tech) |
| **`nickel`** | 3.9 | **220** | **272** | **176** | **20** | **11.5** (`18.5`) | NE impact-melt margin `(804–808,1112–1116)` `220` — prized trace alloy for **Shumari watered crucible steel**! |
| **`halite`** (rock salt) | 14.7 | **22** | **0** | **0** | 316 (all thin) | **0.0** (`273.0` low) | Thin bedded salt (`14–22`) around `Ṣōrun-Nārun` `(755,1164)` & `(770,1168)`: boils ~45 t/yr locally, leaving a **~400 t/yr salt deficit** |
| **`sulfur`** | 1.1 | **60** | **0** | 0 | 36 (low) | **0.0** (`27.5` low) | Minor fumarolic crusts on the SE Godthrone contact `(782,1194)` `34–60` & `(824,1120)` `60` (~12 t/yr local; rest imported or gathered on high Godthrone) |
| **`marble` & `skarn`** | 1.3 / 3.4 | 43 / **200** | 0 / **576** | 0 / **576** | 22 / — | 0.0 (`22.5`) | NE contact `(820–822,1118)` (`skarn 200`, pale contact limestone/travertine `43–48` for *ablaq* courses) |
| **`stone`, `impactite`, `limestone`** | **142.0** / **107.7** / 37.5 | **255** / **255** / 48 | **24,384** / **24,896** / 0 | **11,920** / **1,248** / 0 | — | — | Abundant dark basalt, black impactite (for *Dōriyan* steles) and iron-stained pale limestone (*ablaq* ashlar) |
| **`clay` & `wood`** | 15.4 / 34.2 | **230** / **255** | **2,256** / **1,392** | **2,256** / **704** | — | — | River-terrace `clay` (`230` near Amaro, N rim & NE lakes); `wood` (`255`) concentrated in **West Gorge (`S2`) & N Scarp (`S3`)**, scarce on the central/eastern steppe |
| **`coal`, `oil`, `silica`, `opal`, `peat`, `alabaster`, `lodestone`** | **0.0** | **0–9** | **0** | **0** | **0** | **0.0** | **Absent.** Zero coal, zero silica glass-sand, zero Ancient scrap: Shumar's three defining industrial bottlenecks |

### 2d. Farmland, pasture, timber and `kits/crops` suitability

- **Pasture (`16,361.9 km²-eq`, mean index `0.490`):** Shumar's premier extensive land resource. Short sweet `ichu`, swirl-tussock and wormwood steppe across `33,412 km²` supports **fat-tailed highland sheep, cashmere/kurdi goats, dairy flocks, and hardy Shumari mountain mules & cavalry mounts** (`trade-gemini.json`: #1 world `wool` surplus `422.5 t`, `18%` of world `mounts` surplus `1,501 head`, `13.6%` of world `cheese` surplus `297.8 t`).
- **Farmland (`6,970.3 farm-eq km²`, mean `0.209`; `1,276 km²` over `0.5`, `879.8 farm-eq km²` in river corridors):** Mostly cool dry-summer loess terraces (`1.0–1.5 t/ha` rainfed grain) and **irrigated canyon/lakeshore shelves** (`1.8–2.4 t/ha`).
- **Timber (`2,390.2 km²-eq`, mean `0.072`):** Tight! Only the western `Bētun-Nārun` gorge (`S2`, `398 km²-eq` in 20 km) and northern scarp (`S3`) hold dense `ropepine`, `coiljuniper` and canyon `helixpoplar` woods; the central smithies must ration pine charcoal and buy **coal (`~409 t/yr`) and timber (`~52 t/yr`)** from outside.
- **Viable crops (`CROPS.at` on `standard` air `1.06 atm`, `semiarid` `400–470 mm`):**
  - *Staple grains, pulses & tubers:* **`emmer`** (canyons, rainfed), **`dustmillet`** (bench & canyons, rainfed), **`frostoat`** (irrigated bench), **`redstem`** & **`bistort`** (high cold terraces), **`dust-lentil`** (rainfed), **`helix-bean`** (irrigated), **`frostroot`** & **`snowpotato`** (high frost-hardy tubers).
  - *Canyon & lake-shore orchards/nuts:* **`apricot`** (Station 4's native **`whorlapricot` / twist-apricot**, fresh & sun-dried on flat stone roofs into Shumar's `dried-fruit` export + pressed sweet-kernel lamp/cooking oil), **`canyon-grape`**, **`pistachio`**, **`almond`**, **`stonepine`**, **`pinyon`**, **`juniper`** berries, **`bench-garlic`**.
  - *Distillation stock (`spirits` / Gemini's `tequila` slot — section 9, Q4):* Gemini gives `Amaro` (`17.0`) and `Urundashi` (`8.5`) **32.0% of world `tequila` exports (`141.2 t/yr`)**, alongside former Shumari foothill cities `Dayshun` (`15.0`), `Driyan` (`11.5`) and `Azoth` (`7.5`). On `3,160 m Dsb` (`tc = -5 °C`), true lowland blue agave freezes on the open steppe, **but** Station 4 (`biomes/shighlands`) already grows native frost-hardy **`spiralaloe` / corkscrew-agave** on sunny south-facing basalt canyon ledges (`2,500–3,050 m Csa`/`Csb`) alongside **`whorlapricot`**. We propose glossing Shumar's signature spirit as **`Ṣūnu-šikaru` ("Sun-Blade Spirit")**: pit-roasted canyon spiral-agave & twist-apricot *arak* double-distilled in copper-and-basalt stills and bottled in imported `glass` flasks (keeping the `tequila` trade-good key for global compatibility, or splitting `apricot-arak` if the owner prefers).
  - *Fibres, thatch & highland dyes:* **`flax`** (irrigated canyon linen), **`wallhemp`** (cordage), **`ichu`** (thatch/bedding), **`cave-madder`** (Shumar's signature **crimson** kilim & felt dye!), **`woad`** (indigo-blue), **`larch-bark`**, **`lichen`**, **`birch-tar`** (scabbard & lamellar lacquer base), **`monks-sage`** and **`cloudpine-resin`**.

---

## 3. The country as the sim sees it: six regimental *Šubaru* provinces

Just as Mamluk Syria/Egypt was parcelled into fortress *niyābāt* and regimental *iqta'* fiefs, Shumar's `33,412 km²` divides naturally along its watersheds and mineral belts into **six regimental provinces (`Šubaru`)**, each answered for by one of the **Six Great Regiments (*Ṭuppu*)** of the `Šubaru-šu`:

| # | Province (*Šubaru* & gloss) | Seat (`5.1 px`, elev, climate) | People (seat / named / bulk+ring) | Ground & rivers | What it makes (beyond subsistence grain) |
|---|---|---|---|---|---|
| **S1** | **`Qappu-Šubaru`** (*The High Keep & Central Canyons*, 1st Regiment "Blades of Amaro") | **`Amaro`** (`731,1184` or `734,1182`, 3,054/3,191 m, `Dsb`, 439 mm) | **12,000** seat / **3,650** named / **23,410** rural+ring (**39,060**) | Central basalt-and-loess bench & `240–330 m` gorges of `Bētun-Nārun`, `Qappu-Nārun`, `Mīṣu-Nārun`, `Nazāru-Nārun`, `Pāyaru-Buruqu` | **Watered-steel blades (`weapons`) & lamellar/plate `armour`** (#1–2 on Krator), **twist-apricot `fruit` & `dried-fruit`**, **`spirits` (`Ṣūnu-šikaru`)**, crimson-dyed wool kilims, *ablaq* basalt/travertine stone, canyon water-milling |
| **S2** | **`Bētun-Gēdu`** (*The West Gorge & Giant March*, 2nd Regiment "Spears of the Gate" — heavy `Gēdu-šu` Giant wing) | **`Bētun-Bābu`** (*proposed*, `701,1171`, 2,719 m, `Cfa`, 533 mm) | **3,200** seat / **2,850** named / **12,230** rural+ring (**18,280**) | Lower `Bētun-Nārun` gorge, the `102 km` Ancient-highway spur (`dirt.amaro`), `Dōriyan-Nārun` / `Gēdun-Buruqu` chasms, `Tallhouse` pass & SW saddle to `Tallwalls` | **Pine & poplar `timber` and `charcoal`** (the smithies' lifeline: `wood 255`), **granite `tin` (`200`)**, **West-Gorge `iron` (`255`)**, **high-grade placer `gold` & `tin`**, customs tolls on the western caravan road, `Gēdu-ko` Giant recruitment |
| **S3** | **`Dōriyan-Māru`** (*The Northern Scarp & Lost-Doriyan March*, 3rd Regiment "Keepers of the Mirror") | **`Suṭōn-Qappu`** (*proposed*, `727,1158`, 2,954 m, `Cfa`, 455 mm) | **2,500** seat / **1,750** named / **10,980** rural+ring (**15,230**) | Northern cliff rim above Vothic `Driyan`/`Sethas` (`r300`–`r303`) and the sunken 1,093 m karst tarn `Dōriyan-Īnu` (`738.6,1169.2`) | **Northern scarp `iron` (`180`)**, river `clay` (`230`, stoneware & spirit-jug kilns where glass is scarce), `cave-madder` crimson dye, `charcoal`, frontier watch-beacons, and reception of escaping **`Nazāru-ko`** slaves |
| **S4** | **`Ṣōrun-Dubnu`** (*The Eastern Flock-Bench & Brine Brooks*, 4th Regiment "Horsemen of the Steppe") | **`Urundashi`** (`srbp1bvh1r`, `779,1153`, 3,220 m, `Dfb`, 424 mm) | **3,500** seat / **1,950** named / **13,625** rural+ring (**19,075**) | Broad rolling `Dfb`/`Dsb` steppe around `Dubnosriba` (`422.8 m³/s`) and `Ṣōrun-Nārun` (`95.9 m³/s`), connected to Amaro by the `92 km` plateau highway | **Highland `wool`**, **aged sheep `cheese` & `dairy`**, **cavalry & pack `mounts`**, secondary **blades, armour & `spirits`**, and Shumar's only domestic **`salt` boiling sheds** (`~45 t/yr` from `Ṣōrun-Nārun` brine seeps) |
| **S5** | **`Šīru-Yāmu`** (*The North-East Lakes & Skarn March*, 5th Regiment "Wardens of the Silver Water") | **`Yāmu-Qappu`** (*proposed*, `785,1130`, 2,935 m, `Csb`, 439 mm, `+9 °C`) | **2,800** seat / **1,950** named / **8,480** rural+ring (**13,230**) | Three fresh `Csa`/`Csb` through-lakes (`289 + 80 + 32 = 401 km²` at `2,281–2,710 m`) plus the far-NE skarn/impact rim (`804–824,1112–1120`) | **Lake trout/char `fish`** (`~320 t/yr`), **`canyon-grape` & spiral-agave/apricot orchards**, **meteoric/impact `nickel` (`220`)** for watered steel, **NE skarn `iron` (`255`) & `copper` (`210`)**, and pale *ablaq* **`marble`/travertine** |
| **S6** | **`Urudīru-Ḫāru`** (*The Ordeal Ramp & Godthrone Contact*, 6th Regiment "Masters of the Trial") | **`Urudīru-Qappu`** (*proposed*, `774,1199`, 4,313 m, `Dfc`, 376 mm, `0 °C`) | **1,400** seat / **1,150** named / **2,205** rural+yayla (**4,755**) | Bleak 3,900–4,600 m `Dfc`/`ET` SE ramp climbing toward Godthrone (`Station 5` at `782,1194`) | **The Ordeal (`Urudīru`)** (`-ko` -> `-šu` graduation), plus Shumar's richest hydrothermal lode field: **`saltpeter` (`184`)**, **`copper` (`210`)**, **`zinc` (`168`)**, **`silver` (`150`)**, **`gold` (`140`)**, **`iron` (`255`)** and fumarolic **`sulfur` (`60`)** (fed from S1 & S4!) |
| **Total** | | **6 seats** | **25,400** seats / **13,300** named / **70,930** rural+ring (**109,630**) | `33,412 km²` | |

### 3a. The North-East Lakes (`Šīru-Yāmu`): Shumar's miniature Sevan/Van basin

While Xanadu's caldera lake (`5,980 km²`) carries twenty towns and 500 launches, Shumar's three north-eastern through-lakes (`289 km²` `Šīru-Yāmu` at `2,710 m`, `80 km²` `Nemetu-Yāmu` at `2,281 m`, and `32 km²` `Suṭāru-Yāmu` at `2,694 m`) form a crisp **highland lake district (`Csa`/`Csb`, +8 to +11 °C)** on the scale of Armenia's **Lake Çıldır / small Lake Sevan**:
- **Four named shore places and one promontory sanctuary** (`Yāmu-Qappu` seat `2,800` at `785,1130`, `Šīru-Māru` fishery & vineyard village `600` at `799,1128`, `Nemetu-Gisr` gorge-outlet village `500` at `783,1127`, `Suṭāru-Bētu` east-tarn ferry & nickel-bloomery village `450` at `809,1117`, and the promontory regimental *qubba* **`Šīru-Qubba`** `150` on the dry L-bend headland at `790,1133`, echoing Lake Sevan's Sevanavank / Lake Van's Akdamar translated into a carved Mamluk stone dome; plus `Suṭāru-Maʿdan` NE skarn mine camp `250` at `820,1118` = `1,950` named outside the seat).
- **Traffic (`SIM.trade` + ~35 tarred pine fishing skiffs & 6 ore barges):** carries NE skarn `copper`, `nickel`, `iron` and pale `marble` across `Šīru-Yāmu` from the eastern shore (`800,1133`) to `Yāmu-Qappu` (`785,1130`), saving two days of steep gorge pack-haul on the road down to `Urundashi` and `Amaro`.

---

## 4. Goods and industrial chains on the valley host

**Goods carried by `SHUMAR_TUNE`:** `grain`, `fruit`, `driedfruit`, `dairy`, `cheese`, `fish`, `wool`, `kilims`, `hides`, `mounts`, `timber`, `charcoal`, `coal`, `scrap`, `iron`, `nickel`, `copper`, `tin`, `zinc`, `brass`, `silver`, `gold`, `steel`, `blades` (`weapons`), `armour` (`armor`), `tools`, `salt`, `saltpeter`, `sulfur`, `powder`, `spirits` (`tequila`), `glass`, `stoneware`, `stone` (*ablaq*), `crimson` (`cave-madder` + lacquer), `firearms`, `mechparts`, `medicine`, `sugar`, `books`.

| Chain | Where it runs | Inputs -> Outputs & sim mechanics |
|---|---|---|
| **1. Watered Crucible Steel, Blades & Armour** | Ore & bloomeries in `S2` (`704,1172`), `S3` (`727,1158`), `S5` (`820,1118`), `S6` (`774,1199`); **finishing armouries in `Amaro` & `Urundashi`** | `iron` + (`charcoal` or imported `coal`) + (`nickel` from `S5` or imported `scrap`) -> **watered `steel`** -> **`blades`** (`weapons`, #1 city output on Krator) and **`armour`** (`armor`, Mamluk mirror-plate & crimson-laced lamellar). If `coal`/`charcoal` runs short, blade exports throttle before domestic garrison upkeep |
| **2. Mamluk Brass, Bronze & Damascene Inlay** | Smelted at `Urudīru-Qappu` (`S6`) & `Yāmu-Qappu` (`S5`); inlaid in `Amaro`'s `sm_lacquer_inlay_shop` | `copper` (`S6`/`S5`) + `zinc` (`S6`) or `tin` (`S2` granite & placers) -> **`brass`/`bronze`** (dome *jamur* finials, Giant door straps, *sabil* grilles, hilt furniture) + `silver`/`gold` -> damascened officer gear & bullion exports (`140.5 kg` silver, `27.4 kg` gold/yr) |
| **3. Highland Saltpeter & Black Powder** | Leaching vats on `S6` (`784,1194`, `saltpeter 184`) and `Urundashi` (`S4`); powder magazine in `Amaro` (`sm_saltpeter_works`, `sm_armoury`) | Raw `saltpeter` exported in bulk (`121.3 t/yr`); a domestic fraction + local `S6` `sulfur` (`~12 t/yr`) + willow/poplar `charcoal` -> **`powder`** for citadel cannon and imported `firearms` (`21 units/yr`) |
| **4. `Ṣūnu-šikaru` Distilled Spirits (`tequila` slot) & Dried Twist-Apricot** | Sunny canyon terraces of `S1`, `S2`, `S5` and `Urundashi` (`S4`) | Canyon `spiralaloe`/agave + `whorlapricot` -> fresh `fruit`, roof-dried **`driedfruit`** (`45.6 t/yr` exported), and fermented mash + fuel + **imported `glass` bottles** (with `S3` `stoneware` jugs as local fallback when glass imports dip!) -> **`spirits`** (`141.2 t/yr` exported to Fulcrum, Iziz, Jimjam) |
| **5. Transhumant Flocks, Cheese, Crimson Kilims & Mounts** | Winter folds in `S1`/`S4` benches; summer *yayla* camps (`3,600–4,100 m`) in `S4`/`S6`/`S2` | `pasture` + **`salt`** (critical livestock lick & cheese-brining input!) -> **`wool`** (`148.5 t` exported + woven with `S3` `cave-madder` into `kilims`), **`cheese`** (`49.5 t` exported), `hides` (crimson *shagreen* scabbards), and **`mounts`** (`523 head` exported) |
| **6. The Salt & Charcoal Squeeze (Shumar's structural crisis)** | `Ṣōrun-Nārun` (`S4`, ~45 t salt) & `Bētun-Gēdu` (`S2`, ~900 t charcoal) vs kingdom demand (`~455 t` salt, `~1,300 t` fuel-eq) | Unlike Xanadu (short of iron and salt), Shumar swims in iron and metals but **starves for `salt` (`411 t` imported) and `coal`/fuel (`409 t` coal + `52 t` timber imported)** — without salt its `cheese` and `mounts` falter; without coal/charcoal its `blades` and winter stoves go cold |

---

## 5. Polity ledger: the *Dīwān al-Šubaru*, regimental *Awqāf* and the Ordeal

In Xanadu, every province pays into one spendthrift Sultan's Treasury (`xan:citadel`). Shumar's Mamluk constitution (`LORE.md` §6.23, `kits/shumari/PLAN.md` §3) is **conciliar and regimental**:

1. **The Grand *Dīwān* & State Arsenal (`amaro.citadel`):** Sub-settlement inside Amaro holding the central armoury, gunpowder magazine, `Šumaru-kattu` chancery and state granary (`sm_diwan_hall`, `sm_armoury`, `sm_state_granary`).
   - Receives **the Sword-Tithe (`iqta'` share, 15% of grain/cheese/wool and 25% of iron/copper/saltpeter)** from the six provincial seats (`S1`–`S6`), plus **the *Bābu* Caravan Toll (4%)** cut at `Bētun-Bābu` (`S2`) and `Urundashi` (`S4`) on `-no` outlander caravans.
   - Issues rations, `blades`, `armour`, `powder` and `mounts` to the frontier forts (`Ṭāru-Bētun`, `Dōriyan-Čiču`, `Urudīru-Qappu`) and pays state contracts to Amaro's master bladesmiths.
2. **The Ancestor & Regimental *Waqf* (`amaro.necropolis` + five provincial *qubba* shrines):**
   - Each regiment's domed *qubba* mausoleum (`sm_regiment_qubba`) and the twin-domed **Hall of Blades** (`sm_hall_of_blades`) hold an inalienable *waqf* share from designated canyon orchard/mill villages (modeled like Qiblai's temple estates in `PROPOSAL-XANADU.md` §3b: `SIM.trade` road with `share`).
   - The *waqf* burns lamp oil/tallow at the eternal ancestor braziers, stocks the public snowmelt *sabil* cisterns, feeds maimed veterans (`sm_bimaristan`), and Provisions the annual **Muster of Blades** memorial feast.
3. **The Ordeal Pipeline (`urudiru.camp`, on `S6`):**
   - Every autumn, `-ko` probationers (`Ṭirānu-ko` youths, `Nazāru-ko` escaped slaves arriving through `S3`, and `Gēdu-ko` Giant volunteers arriving through `S2`) march up to `Urudīru-Qappu` (`4,313 m`) and walk the winter trial across `Station 5` (`4,426 m ET`).
   - On the sim, `urudiru.camp` is a high-altitude sub-settlement fed entirely by `amaro.citadel` and `Urundashi` (`grain`, `driedfruit`, `cheese`, `wool` cloaks, `firewood`); in spring (`window: 'graduation'`), surviving initiates replenish the `-šu` garrison actors and each receives a notched `blade` from the Hall of Blades.

### Caste diets (`SHUMAR_TUNE.diet`, kg/person/year; `D = 1/365`)

| Row | Who | Yearly per-capita basket (`* D` per day in `SHUMAR_TUNE`) |
|---|---|---|
| **`sword`** (`-šu` human) | Urban & seat Mamluk households | `grain 145`, `cheese 18`, `fruit 16`, `driedfruit 8`, `salt 6.5`, `spirits 3.5`, `wool/kilims 1.8`, `tools 0.5`, `blades 0.04`, `armour 0.02`, `crimson 0.15`, `sugar 1.2` |
| **`giant`** (`Gēdu-šu`, `3.2–3.8 m`) | ~2,400 Free Giant Sword-brothers (**`2.6x` caloric intake!**) | `grain 360`, `cheese 45`, `driedfruit 18`, `salt 14`, `spirits 6.0`, `wool 3.5`, `tools 1.0`, `blades 0.06`, `armour 0.04` |
| **`town`** (`-ra` urban) | Amaro, Urundashi & provincial-seat artisans | `grain 155`, `cheese 12`, `fruit 12`, `driedfruit 5`, `salt 6.0`, `spirits 1.2`, `tools 0.4`, `stoneware 1.5` |
| **`lake`** (`S5` `-ra`) | `Šīru-Yāmu` shore villages | `grain 125`, `fish 42`, `cheese 10`, `fruit 14`, `salt 6.0`, `tools 0.35`, `stoneware 1.2` |
| **`rural`** (`-ra` bench/canyon) | Provincial countrysides & town rings | `grain 165`, `cheese 14`, `driedfruit 4`, `salt 5.5`, `tools 0.3` |
| **`cadet`** (`-ko` probationers) | Ordeal cells, mine/kiln corvée & `Nazāru-ko` hostels | `grain 185` (frostoat/dustmillet gruel), `cheese 10`, `driedfruit 6`, `salt 6.0`, `tools 0.8` (**zero `spirits` or `sugar`**, by cadet discipline!) |
| **`fort`** (`-šu`/`-ko` garrison) | March forts & `Urudīru-Qappu` | `grain 180`, `cheese 16`, `driedfruit 10`, `salt 7.0`, `tools 0.7`, `blades 0.05`, `powder 1.8` |

### Highland calendar (`SHUMAR_TUNE.calendar`, 365-day year)

Shumar's `3,160 m Dsb` year is sharply seasonal — dry sunny summers, early frosts, and deep snow closing the high SE ramp and outer passes in winter:
- **`snowmelt` `[65, 125]`:** canyon torrents peak (`Bētun-Nārun`, `Qappu-Nārun`), waterwheels & placer sluices (`S2`) run at double head.
- **`yayla` `[125, 245]`:** summer transhumance window; high pasture camps (`3,600–4,100 m`) and the high SE polymetallic mines (`S6`) work at full crew.
- **`apricot-harvest` `[165, 215]`:** canyon `whorlapricot` picking and rooftop sun-drying (`driedfruit`).
- **`grain-harvest` `[185, 235]`:** plateau `emmer`, `dustmillet` and `frostoat` harvest (later than Xanadu's `[150, 200]`).
- **`distilling` `[210, 280]`:** autumn roasting of canyon spiral-agave & apricot mash (`spirits`).
- **`muster` `[255, 270]`:** autumn Regimental *Qubba* memorial week & induction of new `-ko` probationers.
- **`ordeal-winter` `[300, 45]`:** midwinter survival rite on `Station 5` (`Urudīru`); high passes snowed-in (`gate.talovolci` & `gate.east-highland` paused; only the lower `2,719 m` `Bētun-Bābu` western gorge stays open at half carrier speed).
- **`graduation` `[50, 60]`:** spring return through `sm_ordeal_gate`; `-ko` survivors take `-šu`.

---

## 6. External trade gateways and internal roads

### 6a. Internal road & lake network

| Route | Class & source | Length | Mode & sim stops |
|---|---|---|---|
| **Amaro – Urundashi** | `supp.ssgsv5zbd2` (`roads-supplement-gemini.json`) | **92 km** | Paved/graded Shumari plateau spine (`polity_highway`) via the `Ṣōrun-Nārun` brine post (`755,1164`): 4 days by wagon/mule |
| **Amaro – Bētun-Bābu – Ancient Highway** | `dirt.amaro` (`net51-gemini.json`, `734,1182 -> 694,1162`, 19 km rock-cut gallery/bore) | **102 km** | Main western caravan road down `Bētun-Nārun` gorge; `Bētun-Bābu` (`701,1171`, km 68) cuts customs & shifts plateau mules to lowland highway wagons |
| **Amaro – Urudīru-Qappu** (*The Way of Blades*) | *proposed* ceremonial & ore track up `Qappu-Nārun` (`Station 4`) | **88 km** | Stepped basalt pack-road to the Ordeal Gate (`774,1199`): rations up, `copper`/`zinc`/`silver`/`saltpeter` down |
| **Amaro – Suṭōn-Qappu** (*The Dōriyan Watch-Road*) | *proposed* northern rim road | **54 km** | Garrison supply & clay/iron/crimson-dye road to the northern scarp (`727,1158`) |
| **Urundashi – Yāmu-Qappu – NE Skarn Mines** | *proposed* NE road + `Šīru-Yāmu` lake barges | **52 km** land + **30 km** lake | Connects `S5`'s fish, `nickel`, `copper` and pale `marble` into `Urundashi` and `Amaro` |
| **Bētun-Bābu – Ṭāru-Bētun – Tallhouse / Tallwalls** | *proposed* Giant-Pass trail (`supp.smqy5z5eek` 8 km at foot) | **38 km** to Tallhouse (`186 km` to Tallwalls) | Mountain mule & Giant-porter trail across the NW/SW saddles |

### 6b. Five external gateways (`SHUMAR_TUNE.gateways`)

| Gateway id | Entry town on Shumar | Counterparts (`trade-gemini.json` flows) | Shumar sends (`out`) | Shumar buys (`in`) |
|---|---|---|---|---|
| **`gate.west-trunk`** (*The Western Highway Gate*, via `dirt.amaro` to `[694,1162]` on the Driyan–Pluton trunk) | **`Bētun-Bābu`** (`S2`) -> `Amaro` | **Realm of Dalab** (`Dalab`, `Dapor`, `Shelf`, `Nufelds`, former Shumari `Dayshun`), **Eternal State** (`Fulcrum`, `Lux` via Drum-Cascade), **Jimjam**, **Iron Republic** (`Roketstad`, `Stahlborn`), **Hookfleet** (`Port Mira`), **League** (`Ys`) | `blades` (`weapons`), `armour`, `spirits` (`141 t`), `wool` (`148 t`), `mounts`, `cheese` (`50 t`), `saltpeter` (`121 t`), `driedfruit` (`46 t`), `silver`, `gold` | **`salt`** (`Dapor -> Amaro` & northern salt), **`coal`** (`Port Mira` / `Shelf` -> `Amaro`, `409 t`), **`scrap`** (`93 t`), **`glass`** (spirit bottles & *qamariyya* panes), `sugar`, `beer`, `cotton`, `firearms`, `mechparts` (`Roketstad`/`Stahlborn`), `pearls` |
| **`gate.greenstep`** (*The Free Giant Brotherhood Pass*) | **`Ṭāru-Bētun`** (`S2`) | **Free Giants / Vrivolci** (`Tallhouse` `683,1184` & `Tallwalls` `650,1268`) | `blades`, `armour`, `brass` hardware, `spirits`, `cheese` | **`salt`** (`Tallwalls -> Amaro 48 t`), **`timber`**, supplemental `grain` (`Tallhouse -> Amaro 20 t`), and **`Gēdu-ko` Free Giant initiates** |
| **`gate.talovolci`** (*The Cloud-Scarp Trail*, open spring–autumn) | **`Yāmu-Qappu`** (`S5`) | **Talovolci Chiefs** (`Spirladunon` `800,1017`, 235 km north) | `wool`, `cheese`, `saltpeter`, `driedfruit`, `spirits` | **`timber`** (cloud-forest rafters), raw **`iron`/`nickel` bloom**, highland `medicine` |
| **`gate.east-foothills`** (*The Izani & Historian Caravan*) | **`Urundashi`** (`S4`) | **Empire of Iziz** (`Iziz`, `Pylon` `683–913 km`), **Order of Historians** (`Longsong`), **Yuni / Tabisti** (re-exported via Iziz) | `blades` (`Amaro -> Yuni/Verge/Tabisti`), `armour`, `spirits` (`Amaro -> Iziz`), `wool`, `silver` | **`mechparts`** (`Pylon -> Amaro 4.55 u`), **`medicine`** (`Iziz -> Amaro/Urundashi`), **`books`** (**`Longsong -> Amaro 1.82 u`** — curated histories prized by `Šumaru-kattu` scribes, strictly denied to Voth!), `lung-salt` |
| **`gate.voth-march`** (*The Hostile Dōriyan Scarp* — section 9, Q1) | **`Suṭōn-Qappu`** (`S3`) | **Vothic Kingdom** (`Driyan`, `Sethas` `134 km`, `Shim` `240 km`) | **Zero military goods** (`gemini_trade_model.py:5402` strict embargo). Optional cold-truce `mounts` (`104 head`), or **smuggled silver** to fund underground slave-runners | Escaping **`Nazāru-ko`** fugitives (non-cargo people flow); optional cold-truce lowland **`grain`** (`Shim/Sethas -> Amaro/Urundashi ~260 t` in Gemini, if owner keeps border-truce markets open — Q1) |

---

## 7. Implementation steps (`SM-Sim-0` to `SM-Sim-4`)

1. **`SM-Sim-0` (this proposal + `settlements/shumar/BUILD-OUT.md`):** Owner review of population split, pin reconciliation (`Amaro` `731,1184` vs `734,1182`; `Tallhouse` vs `Ṭāru-Bētun`), Vothic border rule, and `Ṣūnu-šikaru` spirits recipe.
2. **`SM-Sim-1` (`kits/crops` `shighlands` dry-plateau zones):** Add `shumar: {warmth: [1, 2], arid: [1, 2]}` and `ordeal: {warmth: [0, 0], arid: [1, 1], atm: 0}` to `CROPS.BIOMES.shighlands` (`kits/crops/src/10-crop-core.js`), add `shighlands` to `apricot` / `cave-madder` homes if approved, and verify with `node kits/crops/tests/test-crops.js`.
3. **`SM-Sim-2` (`core/region/data/shumar-tune.js` + `core/region/tests/test-shumar-economy.js`):** Author `SHUMAR_TUNE` on `core/region/50-region-valley.js` (`scale: 150` on bulk districts, `40` on seats, `10` on forts/camps/mines -> ~620 actors total, <35 s/year). Assert with negative controls:
   - all ~109,630 people (including `2.6x`-diet `Gēdu-šu` Giants and `-ko` Ordeal cadets) are fed through winter;
   - `S6` polymetallic ores, `S2` charcoal/tin/placers, and `S5` nickel/copper reach `Amaro` and `Urundashi` to forge `blades`, `armour`, `brass` and `powder`;
   - every regiment's *qubba* *waqf* and `amaro.citadel`'s *iqta'* dues close cleanly;
   - `salt`, `coal`, `scrap`, `glass` and `Longsong` `books` arrive through the gateways while `blades`, `armour`, `spirits`, `wool`, `cheese`, `mounts` and `saltpeter` clear out;
   - zero `blades`, `armour`, `powder`, `iron` or `saltpeter` ever cross `gate.voth-march`.
4. **`SM-Sim-3` (Depleting lodes, snowed-in winter passes & Ordeal graduation):** Wire `SHUMAR_TUNE.field` multi-vein depletion (>200 yr collective life, 2–4 yr per individual adit on `S6`/`S2`/`S5`, matching Xanadu's X2 rule) and winter pass throttling (`ordeal-winter` `[300, 45]`).
5. **`SM-Sim-4` (Joint SW / Greenstep fragment, later):** Couple `SHUMAR_TUNE` with Greenstep (`Tallwalls` + `Tallhouse`) once the Free Giants' valley tune exists, replacing `gate.greenstep` with live settlements.

---

## 8. What this does not do

- Does not touch `core/simulation`'s contract or `core/hamlet/20-hamlet-cultures.js` (high-reach `core/`; Shumar's hamlet row is scoped as opt-in `core/hamlet/shumari/` in `settlements/shumar/BUILD-OUT.md`).
- Does not mutate `60-settlements.js` or `51-region-store.js` directly; any pin additions/nudges go through the single scale-model queue.

---

## 9. Open questions for the owner

1. **The Vothic border (`gate.voth-march`):** Gemini embargoes all military goods between Voth and Shumar (`0.0`) but still lets lowland Vothic towns (`Shim`, `Sethas`) sell ~260 t of bulk `food` up to `Amaro`/`Urundashi` and buy 104 `mounts` back. Should we:
   - **(a) Recommended — Strict Armed Frontier:** Close formal Voth–Shumar trade completely (only clandestine smugglers and escaping `Nazāru-ko` / `Gēdu-ko` fugitives cross `S3`), meeting Shumar's small 280 t grain margin via its own irrigated canyon terraces plus friendly `Tallwalls`/`Dalab` caravans; or
   - **(b) Cold-Truce Toll Markets:** Allow unarmed `-no` border-barter of lowland grain for highland mules under guard at `Suṭōn-Qappu`, while keeping the total embargo on arms, metals and books?
2. **Amaro's canonical pin (`ssgsv5zbd2`):** Keep **`(731, 1184)`** (`3,054 m`, dramatic canyon-rim capital directly over the `Bētun-Nārun` / `Qappu-Nārun` / `Pāyaru-Buruqu` triple gorge, with `dirt.amaro`'s start nudged 3 px to match), or move `60-settlements.js` to **`(734, 1182)`** (`3,191 m` open bench, matching `ANCIENT-NETWORK.md` line 851)?
3. **Tallhouse (`smqy5z5eek`, `683, 1184`, `1,001 m Csa`):** Keep `Tallhouse` at the 1,001 m western escarpment foot as a **Free Giant (`Vrivolci`) haven/staging fort** paired with a Shumari upper-rim gate-fort **`Ṭāru-Bētun`** at `(689, 1185)` (`2,712 m`), or make `Tallhouse` itself a **joint Shumari–Free Giant condominium fort**?
4. **Shumar's `141 t` distilled-spirits export (`tequila` in `trade-gemini.json`):** Keep the `tequila` good key on the global ledger while glossing Shumar's drink as **`Ṣūnu-šikaru`** — distilled from **sunny-canyon `spiralaloe`/agave (`biomes/shighlands` Station 4) & `whorlapricot` (twist-apricot *arak*/*oghi*)** — or split highland `arak`/fruit-brandy into its own trade good?
5. **The six regimental province & seat names (`S1`–`S6`):** Approve the coined `Šumaru-kattu` names (`Qappu-Šubaru`, `Bētun-Gēdu` / `Bētun-Bābu`, `Dōriyan-Māru` / `Suṭōn-Qappu`, `Ṣōrun-Dubnu` / `Urundashi`, `Šīru-Yāmu` / `Yāmu-Qappu`, `Urudīru-Ḫāru` / `Urudīru-Qappu`), or adjust any of them?
6. **Where `SHUMAR_TUNE` lives:** In `core/region/data/shumar-tune.js` (matching `core/region/data/xan-tune.js` so `settlements/shumar`, `openworld/shumar` and joint regional tests all read one file in place)?

---

## 10. Discrepancies found on the way (to reconcile at `SM-Sim-1` / `SM-Sim-2`)

1. **Why `trade-gemini.json` missed Shumar's `copper`, `tin`, `zinc` and `nickel`:** Gemini's resource scanner only sampled discs around `Amaro` (`731,1184`) and `Urundashi` (`779,1153`), both on the sedimentary middle bench (`copper 0`, `tin 0`, `zinc 0`, `nickel 0`), and therefore booked Shumar as a small *importer* of all four metals. Full-polygon scanning of `rmw5s3ktxgv0d` proves Shumar holds rich **`copper` (`210`), `zinc` (`168`), `tin` (`200` + `12.46` placers), and `nickel` (`220`)** on its SE Ordeal, West Gorge and NE Lake-Rim marches (`S6`, `S2`, `S5`). Pinning those district works makes Shumar self-sufficient in bronze, Mamluk brass and nickel-bearing watered steel, while confirming its true imports (`salt`, `coal`, `scrap`, `glass`, `sugar`, `firearms`, `mech-parts`, `books`).
2. **`CROPS.BIOMES.shighlands` lacks a `semiarid` (`arid: 1`) zone:** Today `10-crop-core.js:64` defines only `cloudforest` (`arid: [3,4]`) and `paramo` (`arid: [2,3]`), so `CROPS.forBiome('shighlands')` misses Shumar's `408–440 mm/yr` `Dsb` bench (`arid: 1`). Step `SM-Sim-1` adds `shumar` and `ordeal`.
3. **Shumar's four through-lakes (`356 km²` water) were unnoted in early lore summaries:** `basins.json` holds a **`289 km²`, `207 m`-deep `Csa` lake at `(790.7, 1131.2)`** (`2,710 m`) plus `80 km²`, `32 km²` and `16 km²` companion lakes inside `rmw5s3ktxgv0d`. Giving `S5` (`Šīru-Yāmu`) this milder lake basin adds real geographic variety to the plateau without inventing map edits.
4. **`PROMPTS-NEEDED.md` section numbering:** Merging `claude/openworld-sites-24defd` placed Kirstabal at section 57 and Xanadu works at section 58, so Shumari's four optional material prompts now live at **`core/materials/PROMPTS-NEEDED.md` §59** (`kits/shumari/PLAN.md` and `biomes/shighlands/PLAN-STATIONS.md` updated to match).
