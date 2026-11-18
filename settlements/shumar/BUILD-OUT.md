# Shumar: building the plateau kingdom's settlements, sanctuaries, canyon villages, works and hamlets (draft, 2026-11-17)

The owner, 2026-11-17: *"merge in claude/openworld-sites-24defd and scope the Shumari plateau for trade, resources, hamlets, and small settlements similar to the work done for the xanadu census"*.

This is a draft build-out programme for the owner to approve, paired directly with `core/simulation/PROPOSAL-SHUMAR.md` (`SHUMAR_TUNE`). No code, open-world region or scale-model pin is mutated by this document. Following `settlements/xanadu/BUILD-OUT.md`, it inventories every settlement of the Kingdom of Shumar (`rmw5s3ktxgv0d`), reconciles existing pins with the 37-layer geology and 16-river/4-lake hydrology rasters, assigns each settlement a build method (`core/city`, `core/hamlet`, work-camp, blueprint/monument, or `core/camp`), specifies the opt-in `core/hamlet` culture row (`KHAMLET.shumariRow`), identifies four new kit pieces uncovered by the trade census, and orders the work into session waves. Everything not fixed by `LORE.md`, the owner's briefs or the map's rasters is marked *proposed*. Session counts are estimates (est.).

Sources:
- `core/simulation/PROPOSAL-SHUMAR.md` (census, caste demography, six regimental *Šubaru* provinces `S1`–`S6`, goods chains, *Dīwān*/*waqf*/Ordeal ledger, external gateways);
- `biomes/shighlands/PLAN-STATIONS.md` ("Shumar: the western dry-plateau stations"): built Stations 4 (`--station shumar`, `5.1 px 737,1201`, 3,308 m `Dsb` *ablaq* gorge) and 5 (`--station ordeal`, `5.1 px 782,1194`, 4,426 m `ET` initiation ramp);
- `kits/shumari/PLAN.md` and `kits/shumari/README.md`: Phase SM2 built (`sm_regiment_qubba` `#spiral`/`#carved`, `sm_doriyan_stele`, `sm_sample_pishtaq`, `sm_sample_hearth_bay`; `40-sm-kit.js`, `41-sm-dome.js`), Phases SM3–SM6 planned;
- Scale model 5.1 (`tools/scale-model/model/data/`, `51-region-store.js` `rmw5s3ktxgv0d`, `60-settlements.js` `ssgsv5zbd2` Amaro, `srbp1bvh1r` Urundashi, `smqy5z5eek` Tallhouse), `kits/resources/data/geology.json` (37 layers + placers), and `kits/crops`;
- Merged open-world census & network files (`openworld/populations-gemini.json`, `openworld/trade-gemini.json`, `openworld/net51-gemini.json`, `openworld/roads-supplement-gemini.json`, `openworld/ANCIENT-NETWORK.md`, `openworld/TRADE-SCOPE.md`);
- `LORE.md` §6.19, §6.23, §10–11; `lore/tongues-of-krator.html` lines 3255–3330, 5103–5360 (`Šumaru-kattu` script and `-šu`/`-ra`/`-ko`/`-no` caste grammar);
- Precedent programme: `settlements/xanadu/BUILD-OUT.md` and `core/hamlet/20-hamlet-cultures.js`.

---

## 0. Summary

| State | Named settlements | Town-ring hamlets (`core/hamlet`, counted apart) | Bulk provincial countrysides |
|---|---|---|---|
| **Biome & kit groundwork built (`ccf58539`)** | **0 settlements** (`biomes/shighlands` Stations 4 & 5 and `kits/shumari` Phase SM2 dome/*pishtaq* toolkit + first 2 sacred monuments are built and verified) | 0 | — |
| **Pinned on `60-settlements.js` (unbuilt)** | **2 Shumari pins:** `ssgsv5zbd2` **Amaro** (`city`, `731,1184`) and `srbp1bvh1r` **Urundashi** (`village` -> *proposed* `town`, `779,1153`); plus border Free Giant fort `smqy5z5eek` **Tallhouse** (`683,1184`, section 1g) | 0 | — |
| **Proposed in this programme (`SHUMAR_TUNE`)** | **35 new named records** (+ the 2 existing pins = **37 named settlements, `38,700` people**): **6** regimental seats/towns (`25,400`), **8** regimental *qubba* sanctuaries & frontier forts (`2,000`), **15** canyon & NE-lake villages (`9,350`: `12` canyon/steppe + `3` lake), **8** mine/quarry/nitre works, rim post & seasonal *yayla* camps (`1,950`) | **22 hamlets (`4,630` people):** Amaro's 6 (`1,310`), Bētun-Bābu's 4 (`830`), Suṭōn-Qappu's 3 (`670`), Urundashi's 5 (`990`), Yāmu-Qappu's 3 (`670`), Urudīru-Qappu's 1 (`160`) | **6 records (`prov.s1`..`prov.s6`, `66,300` people)** — simulated in bulk, drawn only as seeded camera samples on open-world ground |
| **Kingdom of Shumar total** | **`38,700`** in 37 named places (`25,400` seats + `13,300` named non-seats) | **`4,630`** in 22 drawn town-ring hamlets | **`66,300`** bulk rural (**`109,630` total**, `~105,000` rounded) |

Every coordinate below has been verified on the merged `5.1` rasters (`rmw5s3ktxgv0d` polygon mask, `whas` dry-ground check, `E` elevation, `slope`, Köppen class, `rivers.json`, `basins.json`, and `geology.json`).

The programme proposed here is **~16 sessions (est.) across six waves**, plus **Track A (`Amaro`, ~3 sessions)** in parallel once `kits/shumari` Phases SM3–SM4 land.

---

## 1. Inventory

`px` are on the `5.1` canvas (`2 km` per pixel). People match `core/simulation/PROPOSAL-SHUMAR.md` §1a & §3 to the single resident. Every `defence`, `civic`, `sacred` and `-šu` Sword-caste building in these settlements carries **`giant: true`** (`>= 4.2 m` portals, `>= 5.0 m` hall vaults, compound Giant-and-human stairs) for Shumar's ~2,400 `Gēdu-šu` Free Giant Sword-brothers.

### 1a. The six regimental seats and towns (`25,400` people)

| Id | Name (*Šumārum* & gloss) | `5.1 px` | Elev & Climate | People | Prov. | State & role |
|---|---|---|---|---|---|---|
| `ssgsv5zbd2` | **Amaro** (*ʾAmāru*, capital of Shumar) | `731,1184` (pin) or `734,1182` (`net51`) | `3,054 m` (`sl 0.011`) or `3,191 m` (`sl 0.015`), `Dsb`, `439 mm`, `+6 °C` | **10,600** city + `1,100` citadel + `300` necropolis = **12,000** | **S1** `Qappu-Šubaru` | **pinned (`60-settlements.js`), unbuilt.** Seat of the 1st Regiment ("Blades of Amaro"); perches above the `260–330 m` triple canyon confluence of `Bētun-Nārun` (`604.8 m³/s`), `Qappu-Nārun` and `Pāyaru-Buruqu`. Master watered-steel bladesmiths, armourers, damascene & crimson-lacquer guild, `Ṣūnu-šikaru` distilleries, outer `-no` *wikala* ward |
| `amaro.citadel` | *Qappu al-Šubaru* (The High Citadel & Grand *Dīwān*) | `731,1185` (rim spur) | `3,065 m`, `Dsb` | *(1,100 in Amaro)* | **S1** | *district of Amaro* (like `xan.citadel` in Erehwon): `sm_citadel_keep`, `sm_diwan_hall`, `sm_kattu_chancery`, `sm_armoury` powder magazine, `sm_state_granary`, `sm_ordeal_yard` |
| `amaro.necropolis` | *Madīnat al-Qubab* (The Avenue of Domes & Hall of Blades) | `732,1185` (east rim) | `3,072 m`, `Dsb` | *(300 in Amaro)* | **S1** | *district of Amaro* (Mamluk *Qarāfa* / City of the Dead analogue): `sm_hall_of_blades` (`refs/03`), six regimental `sm_regiment_qubba` mausolea (`+1` spiral & star-carved domes), `sm_bimaristan` veteran hospice |
| `sm.betun-babu` | **Bētun-Bābu** ("Gate of the House-River", *proposed*) | `701,1171` | `2,719 m`, `sl 0.006`, `Cfa`, `533 mm`, `+6 °C` | **3,200** | **S2** `Bētun-Gēdu` | *proposed town.* Seat of the 2nd Regiment (heavy `Gēdu-šu` Giant wing) astride `Bētun-Nārun` and `dirt.amaro` (km 68 from Amaro, just above the 19 km rock-cut gallery to the Ancient trunk road). Western customs *wikala*, charcoal & timber staple, tin/iron smelting |
| `sm.suton-qappu` | **Suṭōn-Qappu** ("Stone-Keep of the Scarp", *proposed*) | `727,1158` | `2,954 m`, `sl 0.020`, `Cfa`, `455 mm`, `+5 °C` | **2,500** | **S3** `Dōriyan-Māru` | *proposed town.* Seat of the 3rd Regiment on `r301 Suṭōnun-Buruqu` overlooking Vothic `Driyan`/`Sethas`. Northern garrison town, `clay 230` stoneware & spirit-jug potteries, `iron 180` bloomeries, reception & screening court for escaping `Nazāru-ko` slaves |
| `srbp1bvh1r` | **Urundashi** (*Urundaši*) | `779,1153` | `3,220 m`, `sl 0.012`, `Dfb`, `424 mm`, `+8 °C` | **3,500** | **S4** `Ṣōrun-Dubnu` | **pinned (`60-settlements.js` as `village`), unbuilt; *proposed* upgrade to `town`.** Seat of the 4th Regiment at the headwaters of `r011 Dubnosriba` (`422.8 m³/s`), terminus of the 92 km plateau highway from Amaro and eastern gateway toward Iziz/Longsong. Wool, aged sheep cheese, cavalry mounts, secondary bladesmiths & `Ṣūnu-šikaru` stills |
| `sm.yamu-qappu` | **Yāmu-Qappu** ("Keep of the Lake", *proposed*) | `785,1130` | `2,935 m`, `sl 0.002`, `Csb`, `439 mm`, `+9 °C` | **2,800** | **S5** `Šīru-Yāmu` | *proposed lake town.* Seat of the 5th Regiment on the sheltered west shore of `289 km²` `Šīru-Yāmu` (`2,710 m` water level). Quay & ore-barge harbour, trout/char curing sheds, apricot & canyon-grape terraces, nickel-steel & copper assay house, northern trailhead toward Talovolci `Spirladunon` |
| `sm.urudiru-qappu` | **Urudīru-Qappu** ("Keep of the Ordeal", *proposed*) | `774,1199` | `4,313 m`, `sl 0.012`, `Dfc`, `376 mm`, `0 °C` (`0.93 atm`) | **1,400** | **S6** `Urudīru-Ḫāru` | *proposed fortress-town.* Seat of the 6th Regiment ("Masters of the Trial") at the foot of the `Station 5` Ordeal ramp (`88 km` SE of Amaro). Holds `-ko` human & `Gēdu-ko` Giant probationer barracks (`sm_cadet_cell`, `sm_giant_cadet_cell`), the polymetallic ore assay/smelting court (`copper`, `zinc`, `silver`, `gold`), and winter grain stores |

*Note on internal quarters:* Foreign `-no` merchant compounds (Dalab salt factors, Free Giant drovers, Izani/Longsong caravan agents) stand inside the outer *wikala* courts of `Amaro`, `Bētun-Bābu` and `Urundashi` as town lots rather than separate settlements.

### 1b. Regimental *qubba* sanctuaries and frontier watch-forts (`2,000` people across 8 sites)

Shumar has no monastic orders like Xanadu's eight colours; their functional and visual counterparts are **fortified regimental *qubba* *waqf* shrines** (crowned with Mamluk carved and spiral stone domes) and **canyon-rim watch-forts (`Čiču` / `Bābu`)**:

| Id | Name | `5.1 px` | Elev & Climate | People | Prov. | Kind & architectural character |
|---|---|---|---|---|---|---|
| `sm.qappu-qubba` | **The Gorge *Waqf* of `Qappu-Nārun`** (*Qubbat al-Qappu*) | `737,1201` | `3,308 m`, `Dsb`, `424 mm` | **250** | **S1** | `sacred` *waqf* sanctuary on the exact **`biomes/shighlands --station shumar` site**: mother-shrine along *The Way of Blades* between Amaro and the Ordeal, twin-variant `sm_regiment_qubba` (`+1` right-handed spiral dome), *sabil* cistern, twist-apricot *waqf* terrace |
| `sm.doriyan-inu` | **The Mirror Sanctuary of `Dōriyan-Īnu`** | `740,1168` | `2,889 m` rim (`1,093 m` tarn floor), `Cfb`, `675 mm` | **250** | **S3** | `sacred` mourning precinct & `Nazāru-ko` sanctuary on the rim of the `16 km²` sunken karst tarn (`738.6,1169.2`): built around **`sm_doriyan_stele`'s mirror-handed (`hand = -1`) spiral dome** over black impactite steles facing lost *Dōriyan* |
| `sm.siru-qubba` | **`Šīru-Qubba`** (The Lake Promontory Shrine) | `790,1133` | `3,012 m` headland (`2,710 m` lake), `Csb`, `455 mm` | **150** | **S5** | `sacred` headland *qubba* jutting into `Šīru-Yāmu` (water on N & W, Lake Sevan / Akdamar analogue): star-carved Mamluk stone dome, lighthouse brazier for lake ore-barges, veteran retreat |
| `sm.ordeal-gate` | **`Bābu al-Urudīru`** (The Outer Ordeal Gate & Trial Cells) | `782,1194` | `4,426 m`, `ET`, `235 mm`, `-2 °C` (`-23 °C` winter) | **250** | **S6** | `sacred`/`defence` initiation gate (`sm_ordeal_gate`) + `urudiru.camp` probationer cells on the exact **`biomes/shighlands --station ordeal` site** under Godthrone's 9.5 km wall |
| `sm.taru-betun` | **`Ṭāru-Bētun`** (Upper Tallhouse Gate-Fort) | `689,1185` | `2,740 m`, `sl 0.084`, `Cfb`, `675 mm` | **350** | **S2** | `defence` Giant-clearance cliff fortress guarding the 1,740 m drop down `Dōriyan-Nārun` to Free Giant `Tallhouse` (`683,1184`, `1,001 m`); `sm_pishtaq_gate` + `sm_payaru_tower` |
| `sm.gedu-saddle` | **`Gēdu-Sāru`** (Greenstep Saddle Watch-Fort) | `701,1214` | `3,216 m`, `sl 0.004`, `Dsb`, `439 mm` | **250** | **S2** | `defence` SW pass fort & pack-mule customs post on the saddle toward Vrivolci `Tallwalls` (`650,1268`) |
| `sm.dervu-cicu` | **`Dervu-Čiču`** (NW Scarp Beacon-Fort) | `711,1165` | `2,886 m`, `sl 0.015`, `Cfa`, `533 mm` | **250** | **S2** | `defence` watch-fort above `r300 dervosriba` & the western highway drop; polygonal Mamluk beacon tower (`sm_payaru_tower`) |
| `sm.kattu-cicu` | **`Kattu-Čiču`** (East Scarp Beacon-Fort) | `744,1152` | `2,985 m`, `sl 0.013`, `Dsc`, `439 mm` | **250** | **S3** | `defence` watch-fort over `r303 Kattu-Buruqu` watching Vothic `Driyan`/`Sethas` and guiding `Nazāru-ko` runaways up the scarp stairs |

*(Note: `S6` also holds the small 100-soldier SE rim watch-post `sm.haru-cicu` at `772,1203`, `4,372 m`, listed under high-altitude works/posts in 1e.)*

### 1c. Specialist canyon and highway villages (`S1`–`S4`, 12 villages, `7,800` people)

Snowmelt rivers in `100–330 m` basalt-and-limestone gorges carry Shumar's intensive water-power, twist-apricot orchards, `Ṣūnu-šikaru` distilleries, charcoal clamps, crimson dye vats and brine sheds:

| Id | Name | `5.1 px` | Elev & Climate | People | Prov. | River / Road & specialist trade |
|---|---|---|---|---|---|---|
| `sm.payaru-gisr` | **Pāyaru-Gisr** ("Watch-Bridge") | `729,1192` | `3,054 m`, `sl 0.010`, `Dsc` | **850** | **S1** | Triple-confluence gorge (`Bētun-Nārun` `604.8 m³/s` + `Pāyaru-Buruqu`): pointed-arch *ablaq* canyon bridge (`sm_gorge_bridge_tower`), overshot waterwheel trip-hammers & flour mills feeding Amaro (`8 km` N) |
| `sm.misu-bustan` | **Mīṣu-Bustān** | `723,1194` | `3,081 m`, `sl 0.018`, `Dsc` | **800** | **S1** | Confluence of `Mīṣu-Nārun` (`115.3 m³/s`) & `Bētun-Nārun`: walled canyon `whorlapricot` orchards (`sm_apricot_orchard`), rooftop apricot-drying & sweet-kernel oil presses (`driedfruit`) |
| `sm.nazaru-kura` | **Nazāru-Kūra** | `713,1188` | `2,977 m`, `sl 0.008`, `Cfa`, `439 mm` | **750** | **S1** | Sunny `Cfa` mouth of `Nazāru-Nārun` (`134.5 m³/s`): south-facing `spiralaloe`/agave & twist-apricot terraces and copper alembic still-houses (`sm_spirits_still` -> `Ṣūnu-šikaru` `spirits`) |
| `sm.nazaru-head` | **Nazāru-Rēšu** | `716,1210` | `2,986 m`, `sl 0.013`, `Csb`, `439 mm`, `+7 °C` | **700** | **S1** | Warm `Csb` upper `Nazāru-Nārun` bench: irrigated `emmer`, `flax` linen, `apricot` & `almond` terraces |
| `sm.betun-kura` | **Bētun-Kūra** | `705,1175` | `2,768 m`, `sl 0.003`, `Cfa`, `455 mm` | **650** | **S2** | `wood 255` West-Gorge `ropepine` & `helixpoplar` timber sawpits and stone beehive charcoal clamps (`sm_charcoal_kiln` — Amaro's metallurgical fuel lifeline) |
| `sm.babul-wikala` | **Bābu-Wikāla** | `699,1171` | `2,715 m`, `sl 0.069`, `Cfb`, `690 mm` | **600** | **S2** | Upper portal of `dirt.amaro`'s 19 km rock-cut gallery: `-no` caravan *wikala*, cooperage, wheelwrights & mule-to-wagon transshipment |
| `sm.gedu-wash` | **Gēdu-Šaṭṭu** ("Giant's Gravel-Bar") | `699,1173` | `2,738 m`, `sl 0.010`, `Cfa`, `533 mm` | **400** | **S2** | Works the rich alluvial **`tin` (`load 12.46`) and `gold` (`load 4.57`) placers** of `Dōriyan-Nārun` & `Gēdun-Buruqu` (`692.5,1171.2–1173.2`) via stepped canyon sluices (`sm_placer_sluice`) |
| `sm.madder-glen` | **Qirmiz-Wādī** | `737,1171` | `2,966 m`, `sl 0.018`, `Csa`, `675 mm`, `+8 °C` | **650** | **S3** | Warm `Csa` limestone pocket above `Dōriyan-Īnu`: `cave-madder` & `woad` terraced gardens, stone dye-vats and crimson regimental kilim looms (`sm_weaver_dyer`) |
| `sm.suton-kilns` | **Suṭōn-Fakhkhār** | `732,1159` | `3,016 m`, `sl 0.008`, `BSk`, `439 mm` | **600** | **S3** | `clay 230` river-terrace potteries firing glazed stoneware `Ṣūnu-šikaru` spirit flasks (Shumar's domestic bottle fallback where `silica = 0`) + scarp `iron` bloomery |
| `sm.sorun-melh` | **Ṣōrun-Milḥ** ("Salt-Brook") | `753,1152` | `3,000 m`, `sl 0.004`, `Dsc`, `424 mm` | **650** | **S4** | Confluence of `Ṣōrun-Nārun` (`95.9 m³/s`) & `Dubnosriba` (`halite 22`): Shumar's sole domestic brine-boiling pans (`sm_salt_evaporator`, ~45 t/yr salt) & sheep-cheese brining cellars |
| `sm.sorun-wikala` | **Ṣōrun-Manzil** | `755,1164` | `3,092 m`, `sl 0.015`, `Dsb`, `424 mm` | **600** | **S4** | Midpoint townlet (km 46) on the 92 km `Amaro–Urundashi` highway at the `Ṣōrun-Nārun` bridge: state post-station, wool-shearing pens & `halite 22` salt lick |
| `sm.dubnu-stud` | **Dubnu-Rikāb** | `768,1158` | `3,137 m`, `sl 0.009`, `Dsb`, `424 mm` | **550** | **S4** | `Dubnosriba` meadow bench: 4th-Regiment cavalry remount & pack-mule stud corrals (`mounts`), aged *kashkaval*/tulum cheese lofts |

### 1d. The North-East Lakes (`Šīru-Yāmu`, `S5`: 3 shore villages, `1,550` people)

Around Shumar's three mild `Csa`/`Csb` highland through-lakes (`289 km²` `Šīru-Yāmu` at `2,710 m`, `80 km²` `Nemetu-Yāmu` at `2,281 m`, and `32 km²` `Suṭāru-Yāmu` at `2,694 m`; seat `Yāmu-Qappu` in 1a, promontory shrine `Šīru-Qubba` in 1b):

| Id | Name | `5.1 px` | Elev & Climate | People | Prov. | Shore role & annual trade |
|---|---|---|---|---|---|---|
| `sm.siru-maru` | **Šīru-Māru** | `799,1128` | `3,160 m` bench above E shore, `sl 0.009`, `Dsb` (shore `Csa`) | **600** | **S5** | East-shore stone jetty (`sm_lake_jetty`), smoked lake-trout/char racks, south-facing `canyon-grape` & `spiralaloe` terraces, and ore-barge loading slip for NE skarn copper/iron |
| `sm.nemetu-gisr` | **Nemetu-Gisr** | `783,1127` | `2,886 m`, `sl 0.031`, `Dsb`, `502 mm`, `+8 °C` | **500** | **S5** | Outlet weir between `Šīru-Yāmu` and lower `Nemetu-Yāmu` (`r069 Uarosriba` `62.4 m³/s`): fish traps, watermills & tarred pine skiff boatyard |
| `sm.sutaru-betu` | **Suṭāru-Bētu** | `809,1117` | `2,956 m`, `sl 0.003`, `Csa`, `439 mm`, `+10 °C` | **450** | **S5** | Warm `Csa` south shore of `Suṭāru-Yāmu` (`32 km²`) right beside the **`nickel 220` impact-margin lode (`808,1116`)**: smelts nickel-iron master-alloy blooms for Amaro's watered crucible steel + apricot orchards |

### 1e. Mines, quarries, ordnance works, high watch-posts and seasonal *yayla* camps (8 sites, `1,950` people)

| Id | Name | `5.1 px` | Elev & Climate | People | Prov. | Kind & `geology.json` peak grade |
|---|---|---|---|---|---|---|
| `sm.ablaq-quarry` | **ʾAblaq-Maqṭaʿ** (Royal Basalt & Travertine Quarry) | `740,1185` | `3,274 m`, `sl 0.015`, `Dsb` | **300** | **S1** | `works` quarry village (`18 km` E of Amaro): `stone 255`, `impactite 255`, pale `limestone 48`; dresses *ablaq* courses & *qubba* dome-rib templates (`sm_stonecutters_yard`) |
| `sm.west-iron-tin` | **Bētun-Maʿdan** (West Gorge Iron & Tin Lodes) | `704,1172` | `2,765 m`, `sl 0.002`, `Cfb`, `471 mm` | **350** | **S2** | `mine` work-camp (`-ko` cadet corvée & `-ra` master miners): **`iron 255`** + granite **`tin 200`** adits (`sm_mine_head`), right beside West-Gorge pine charcoal |
| `sm.skarn-mine` | **Suṭāru-Maʿdan** (NE Skarn & Marble Works) | `820,1118` | `3,388 m`, `sl 0.012`, `Dsc`, `392 mm` | **250** | **S5** | `mine` & `quarry` work-camp on the NE volcanic-limestone contact: **`iron 255`**, **`copper 210`**, **`skarn 200`**, **`zinc 168`**, **`silver 150`**, **`gold 140`**, and pale contact **`marble 43`** |
| `sm.urudiru-lode` | **Urudīru-Maʿdan** (Godthrone Contact Polymetallic Mines) | `776,1200` | `4,343 m`, `sl 0.005`, `Dfc`, `361 mm`, `+1 °C` | **400** | **S6** | `mine` high-altitude work-camp (`4 km` E of `Urudīru-Qappu`): **`iron 255`**, **`copper 210`**, **`zinc 168`** (Mamluk brass!), **`silver 150`**, **`gold 140`** |
| `sm.nitre-vats` | **Šūru-Bāru** (Ordeal Saltpeter & Fumarole Works) | `784,1194` | `4,560 m`, `sl 0.055`, `Dfc`, `157 mm`, `-4 °C` | **250** | **S6** | `works` ordnance camp (`4 km` E of `Station 5`): richest **`saltpeter 184`** crusts + **`sulfur 60`** fumarole scrapings (`sm_saltpeter_works` leaching vats; crew drops to skeleton watch in `ordeal-winter`) |
| `sm.haru-cicu` | **Ḫāru-Čiču** (Godthrone Rim Watch-Post) | `772,1203` | `4,372 m`, `sl 0.028`, `Dfc`, `298 mm` | **100** | **S6** | `defence` high basalt signal-tower (`sm_payaru_tower`) watching the southern crest & high Ordeal cairn line |
| `sm.dubnu-yayla` | **Dubnu-Yayla** (Eastern Summer Flock Camp) | `768,1184` | `3,640 m`, `Dsb`, `408 mm` | **150** | **S4** | `camp` (seasonal `yayla` `[125, 245]`): black/crimson felt shepherd tents (`core/camp`), stone milking pens & mobile *sabil* |
| `sm.warun-yayla` | **Wārun-Yayla** (Southern Crest Summer Flock Camp) | `748,1204` | `3,705 m`, `sl 0.031`, `Dsb`, `408 mm` | **150** | **S6** | `camp` (seasonal `yayla` `[125, 245]`): high transhumant sheep, goat & cavalry-mare summer camp above `r395 Wārun-Buruqu` |

*Province named-site check (`1b + 1c + 1d + 1e` = **31 sites, `13,300` people**):*
- `S1`: `250 + 850 + 800 + 750 + 700 + 300 = 3,650` (6 sites)
- `S2`: `350 + 250 + 250 + 650 + 600 + 400 + 350 = 2,850` (7 sites)
- `S3`: `250 + 250 + 650 + 600 = 1,750` (4 sites)
- `S4`: `650 + 600 + 550 + 150 = 1,950` (4 sites)
- `S5`: `150 + 600 + 500 + 450 + 250 = 1,950` (5 sites)
- `S6`: `250 + 400 + 250 + 100 + 150 = 1,150` (5 sites)

### 1f. Town rings (`core/hamlet`, 22 hamlets, `4,630` people) and bulk countrysides (`66,300`)

Around each of the six seats stands a drawn ring of `core/hamlet` villages (`KHAMLET.shumariRow`, section 4b), within `8–22 km` of the town wall (`farming`/`orchard` = `240` people, specialist `quarry`/`lumber`/`clay`/`salt`/`fishing` hamlet = `190`, upland `ranch` = `160`):

| Seat ring | Hamlet ids (*proposed*) | Breakdown & people | Remaining bulk countryside (`prov.s*`) | Prov. rural + ring |
|---|---|---|---|---|
| **Amaro's ring (6)** | `amaro.ring.farm-1..3`, `orchard-1`, `quarry-1`, `ranch-1` | `4 x 240` + `190` + `160` = **`1,310`** | `prov.s1`: **`22,100`** | **`23,410`** |
| **Bētun-Bābu's ring (4)** | `betun.ring.farm-1..2`, `lumber-1`, `ranch-1` | `2 x 240` + `190` + `160` = **`830`** | `prov.s2`: **`11,400`** | **`12,230`** |
| **Suṭōn-Qappu's ring (3)** | `suton.ring.farm-1..2`, `clay-1` | `2 x 240` + `190` = **`670`** | `prov.s3`: **`10,310`** | **`10,980`** |
| **Urundashi's ring (5)** | `urundashi.ring.farm-1..2`, `salt-1`, `ranch-1..2` | `2 x 240` + `190` + `2 x 160` = **`990`** | `prov.s4`: **`12,635`** | **`13,625`** |
| **Yāmu-Qappu's ring (3)** | `yamu.ring.orchard-1..2`, `fish-1` | `2 x 240` + `190` = **`670`** | `prov.s5`: **`7,810`** | **`8,480`** |
| **Urudīru-Qappu's ring (1)** | `urudiru.ring.ranch-1` (hardy sheep/yak fold at `3,980 m`) | `1 x 160` = **`160`** | `prov.s6`: **`2,045`** | **`2,205`** |
| **Total (22 hamlets)** | `12` farm/orchard, `5` works, `5` ranch | **`4,630`** | **`66,300`** | **`70,930`** |

As in `settlements/xanadu/BUILD-OUT.md` §1f, the six bulk countrysides (`prov.s1`..`prov.s6`, `66,300` people) are simulated as single district records in `SHUMAR_TUNE` and never hand-pinned one by one; on open-world region pages, `KHAMLET.village` draws a deterministic seeded sample on the `farm`/pasture mask near the camera.

### 1g. Border neighbours outside the programme

- **Tallhouse** (`smqy5z5eek`, `683,1184`, `1,001 m Csa`, `250` fort) and **Tallwalls** (`s2be1r4hve`, `650,1268`, `2,500` town): Free Giant (`Vrivolci`) settlements of Greenstep (`LORE.md` §6.19; `PROPOSAL-SHUMAR.md` §1b, Q3). Paired with Shumar's upper rim gate-fort `Ṭāru-Bētun` (`689,1185`) via `gate.greenstep`.
- **Spirladunon** (`800,1017`, `1,000` town): Talovolci cloud-forest seat north of `S5`, linked seasonally via `gate.talovolci`.
- **Driyan** (`sxvb4k4024`, `725,1141` / `705,1129`, lost *Dōriyan*) and **Sethas** (`690,1139`): Vothic Kingdom foothill cities north of `S3`'s scarp (`gate.voth-march`).
- **Dayshun** (`608,1168`): former Shumari western foothill city now under the Realm of Dalab (`LORE.md` §6.23; `gate.west-trunk`).

---

## 2. How each group is built and which kits draw it

### 2a. By build method

| Method | What it is | Which Shumari sites use it |
|---|---|---|
| **Capital city on `core/city`** (`settlements/shumar`, target `amaro` -> `dist/amaro.html`) | Full `KCITY.create` canyon-rim capital with stepped *ishigaki* wards, `amaro.citadel` and `amaro.necropolis` landmarks, canyon waterwheel chutes and outer `-no` *wikala* | **Amaro** (`12,000`) |
| **Shared Shumari castle-town / canyon-village target on `core/city`** (*proposed* `settlements/shumar --target town`, `?town=<id>`, following Xanadu's `settlements/xanadu-lake` pattern and the owner's rule *"over 500 laid out in full"*) | Parameterised `KCITY.create` layout driven directly by `SHUMAR_TUNE` records (canyon-rim or lakeshore street, `giant: true` *pishtaq* keep/*qubba*, *sabil*, and the town's specialist works), Three-free plan data reusable on open-world `48s` | **The 5 regional seats** (`Urundashi`, `Bētun-Bābu`, `Suṭōn-Qappu`, `Yāmu-Qappu`, `Urudīru-Qappu`) and, if approved in Q1, **the 13 canyon/lake villages of `500–850` people** |
| **`core/hamlet` villages** (`KHAMLET.village` with opt-in `KHAMLET.shumariRow`, section 4b) | Up to `500` laid (`KHAMLET.POP_MAX`), basalt/*ablaq* houses around a `sm_sabil_shrine` and `sm_sword_villa` *iqta'* head-house | **All 22 town-ring hamlets** (`160–240` each), **`Gēdu-Šaṭṭu`** (`400`), **`Suṭāru-Bētu`** (`450`), **`ʾAblaq-Maqṭaʿ`** (`300`), and seeded open-world countryside samples |
| **`core/hamlet` work-camps** (`shumari-camp` option: `workShare: 0.88`, `-ko` cadet cells & Giant cells without family wards) | High-altitude or gorge mining/ordnance camps around `kits/resources` lode/nitre nodes | **`Urudīru-Maʿdan`** (`400`), **`Bētun-Maʿdan`** (`350`), **`Suṭāru-Maʿdan`** (`250`), **`Šūru-Bāru` nitre vats** (`250`) |
| **Monument / fort blueprints & open-world landmarks** (shared fort/sanctuary generator on `kits/shumari` defence & sacred pieces) | Compact walled precincts (`100–350` people) anchored by a Mamluk *qubba* dome, *pishtaq* gate and polygonal *pāyaru* beacon tower | **The 4 *qubba* sanctuaries** (`Qappu-Qubba` on Station 4, `Dōriyan-Īnu` mirror sanctuary, `Šīru-Qubba` headland, `Bābu al-Urudīru` on Station 5) and **the 5 frontier forts/watch-posts** (`Ṭāru-Bētun`, `Gēdu-Sāru`, `Dervu-Čiču`, `Kattu-Čiču`, `Ḫāru-Čiču`) |
| **`core/camp` seasonal camps** (`KCAMP` + `kits/tents`) | Pitched dark wool-felt & crimson-trimmed highland tents, dry-stone windbreaks and sheepfolds, active during `yayla` `[125, 245]` | **`Dubnu-Yayla`** (`150`), **`Wārun-Yayla`** (`150`), and caravan halts along the `92 km` Urundashi spine & `88 km` Way of Blades |

### 2b. Kit & biome mapping

| Site group | Building kit & flora/resource kits read in place |
|---|---|
| **Central, Western, Northern & Eastern bench/canyons (`S1`–`S4`)** | **`kits/shumari`** (`SM.def`) + **`biomes/shighlands` (`--station shumar`)** (`ropepine`, `coiljuniper`, `helixpoplar`, `whorlapricot`, `spiralaloe`, `spiralsage`, `ichu`) + `kits/crops` + `kits/resources` |
| **North-East Lakes (`S5`, `Šīru-Yāmu`)** | **`kits/shumari`** + new `sm_lake_jetty` & tarred pine skiff/ore-barge props + **`biomes/shighlands` (`--station shumar`)** (`whorlapricot`, `helixpoplar`, `canyon-grape` vines) |
| **Ordeal Ramp, `Urudīru-Qappu` & SE Polymetallic/Nitre Camps (`S6`)** | **`kits/shumari`** (stark dark-basalt *ishigaki* & `sm_ordeal_gate` / `sm_cadet_cell` / `sm_giant_cadet_cell` palette, minimal timber overhang against `-23 °C` wind) + **`biomes/shighlands` (`--station ordeal`)** (`thornwhorl`, `coiljuniper`, frost-sorted stone spirals, `snowcover` fx) + `kits/resources` lode/nitre heads |
| **Outer `-no` *wikala* caravan courts & *yayla* camps** | **`kits/shumari`** (`sm_wikala_caravanserai`, `sm_outlander_lodging`, `sm_envoy_house`) + **`core/camp` / `kits/tents`** (Shumari black-felt & crimson-stripe highland dress, plus Dalabi/Izani merchant tents in outer caravan yards) |

---

## 3. Order of work: waves and sessions

Every new build starts from `tools/new_build/`, registers in `tools/checks_optin.json`, declares its `Core adoption` table before writing code, reads `core/engine` and `SHUMAR_TUNE` in place (never copying camera, PRNG, noise, sky or tune tables), and passes `verify.py --assert`, `check_core_use.py`, `check_text.py` and `check_budgets.py`.

| Wave | Session | Brief | Waits on |
|---|---|---|---|
| **0. Shared groundwork** | **0.1 `kits/shumari` SM3 (Dwellings & Gorge Street)** | All 13 caste dwellings (`-ko`, `-ra`, `-šu` human + `Gēdu-šu` Giant, `-no` lodging) + `sm_gorge_street` cut-away ensemble (`kits/shumari/PLAN.md` SM3) | nothing (`SM1` & `SM2` already merged) |
| | **0.2 `kits/shumari` SM4 (Cult, State, Defence & Canyon/Lake Trades)** | Remaining sacred, civic, citadel/defence & canyon trade defs + **the 4 new census-discovered pieces** (`sm_spirits_still`, `sm_charcoal_kiln`, `sm_lake_jetty`, `sm_placer_sluice`, section 4a); `SM_TRADES` check green; `kattu-frieze` deterministic bake | 0.1 |
| | **0.3 `kits/shumari` SM5 (Furniture, Interiors & Opt-in Hamlet Row)** | `kits/catalog/krator-master-furniture-shumari.js`, `kits/interiors/sets/shumari.js`, and opt-in **`core/hamlet/shumari/25-hamlet-shumari.js`** (`KHAMLET.shumariRow` + `shumari-camp`, section 4b) with negative-control node tests (`'shumari'` `core/tags` & `core/sockets` queued for the next shared-reach rebuild) | 0.2 |
| | **0.4 Sim & Crops (`SM-Sim-1` + `SM-Sim-2`)** | Add `shumar` & `ordeal` zones to `CROPS.BIOMES.shighlands` (`test-crops.js`); author **`core/region/data/shumar-tune.js`** (`SHUMAR_TUNE`) + `test-shumar-economy.js` asserting all 37 named sites, 22 ring hamlets, 6 provinces, caste diets (`2.6x` Giant), *iqta'*/*waqf*/Ordeal flows and Voth embargo | Owner review of `PROPOSAL-SHUMAR.md` §9 |
| **1. Map queue & open-world cuts** | **1.1 Scale-model pin queue** | Queue canonical `Amaro` pin alignment (`731,1184` vs `734,1182`, Q3), `Urundashi` `town` upgrade, and *proposed* pins for the 4 new provincial seats, major forts and lode mines | Scale-model queue turn + owner Q3 |
| | **1.2 Open-world region cuts** | Cut Shumar's open-world ground on the 5.1 rasters — either **one region per regimental province** (`shumar-qappu`, `shumar-betun`, `shumar-doriyan`, `shumar-sorun`, `shumar-yamu`, `shumar-urudiru`, matching Xanadu's 1-per-province answer) or **two paired regions** (`openworld/shumar-west` `S1–S3` & `openworld/shumar-east` `S4–S6`, Q2) | 0.4, 1.1 |
| **2. Sanctuaries & frontier forts** | **2.1 Station-anchored sanctuaries** | Place **`Qappu-Qubba`** (`737,1201`) onto Station 4's basalt gorge and **`Bābu al-Urudīru` + `urudiru.camp`** (`782,1194`) onto Station 5's Ordeal ramp; build **`Dōriyan-Īnu`** mirror-dome sanctuary (`740,1168`) and **`Šīru-Qubba`** lake headland shrine (`790,1133`) | 0.2, 0.4 |
| | **2.2 Frontier watch-forts** | Shared Shumari canyon-rim fort generator (`sm_pishtaq_gate`, `sm_curtain_wall`, `sm_payaru_tower`, `sm_regiment_barracks` with `Gēdu-šu` Giant clearance): **`Ṭāru-Bētun`** (`689,1185`), **`Gēdu-Sāru`**, **`Dervu-Čiču`**, **`Kattu-Čiču`** and **`Ḫāru-Čiču`** | 0.2, 1.2 |
| **3. The five regional seats** | **3.1 Shared Shumari town target + `Urundashi` & `Bētun-Bābu`** | Scaffold `settlements/shumar` (`--target town`, `?town=<id>`) on `core/city` reading `SHUMAR_TUNE` in place; lay out **`Urundashi`** (`3,500`, steppe highway & cavalry/wool/cheese seat) and **`Bētun-Bābu`** (`3,200`, West-Gorge highway customs & timber/tin seat) | 0.3, 0.4 |
| | **3.2 `Yāmu-Qappu`, `Suṭōn-Qappu` & `Urudīru-Qappu`** | Lay out **`Yāmu-Qappu`** (`2,800`, `Šīru-Yāmu` lake harbour & nickel/copper assay), **`Suṭōn-Qappu`** (`2,500`, northern scarp fortress & stoneware kilns), and **`Urudīru-Qappu`** (`1,400`, `4,313 m` Ordeal garrison & polymetallic smelter) | 3.1 |
| **4. Canyon & NE-lake villages** | **4.1 Canyon mill, orchard & distillery villages (`S1`–`S2`)** | `Pāyaru-Gisr` (bridge & forge-wheels), `Mīṣu-Bustān` (twist-apricot terraces), `Nazāru-Kūra` (`Ṣūnu-šikaru` stills), `Nazāru-Rēšu`, `Bētun-Kūra` (charcoal clamps), `Bābu-Wikāla`, `Gēdu-Šaṭṭu` (placer sluices) | 3.1, 1.2 |
| | **4.2 Scarp, brine & NE-lake villages (`S3`–`S5`)** | `Qirmiz-Wādī` (madder dyeworks), `Suṭōn-Fakhkhār` (potteries), `Ṣōrun-Milḥ` (brine pans), `Ṣōrun-Manzil`, `Dubnu-Rikāb` (mounts), plus `Šīru-Yāmu` shore villages `Šīru-Māru`, `Nemetu-Gisr` and `Suṭāru-Bētu` | 3.1, 1.2 |
| **5. Mines, quarries, camps & rings** | **5.1 Lode mines, nitre vats & *ablaq* quarry** | `Urudīru-Maʿdan`, `Šūru-Bāru` nitre works, `Bētun-Maʿdan`, `Suṭāru-Maʿdan` on `shumari-camp` + `ʾAblaq-Maqṭaʿ` quarry village | 0.3, 1.2 |
| | **5.2 *Yayla* camps, town rings & countryside sample** | `Dubnu-Yayla` & `Wārun-Yayla` + highway caravan halts on `core/camp` (`shumari` tent row); all **22 town-ring hamlets** and seeded `prov.s1`..`prov.s6` countryside samples verified against `SHUMAR_TUNE` | 0.3, 1.2 |
| **A. Amaro (parallel, ~3 sessions)** | **A.1–A.3 Capital build (`settlements/shumar --target amaro`)** | **A.1:** Canyon-rim terrain & battered *ishigaki* bench above `Bētun-Nārun` / `Qappu-Nārun`, `amaro.citadel` (*Dīwān*, keep, arsenal) & `amaro.necropolis` (Hall of Blades + 6 regimental *qubba* domes). **A.2:** `KCITY` Sword (`-šu` Giant-clearance), Hearth (`-ra` bladesmith/lacquer/stills) & outer `-no` *wikala* wards + canyon waterwheel forge-chutes. **A.3:** Interiors, night lights, walker (`F`), delta pass & `test-amaro-city.js` | 0.2, 0.3, owner Q3 |

Total estimate: **~16 sessions** (`Wave 0`: 4, `Wave 1`: 2, `Wave 2`: 2, `Wave 3`: 2, `Wave 4`: 2, `Wave 5`: 2, `Track A`: 3 — ~17 sessions including `1.1`). **Wave 0 (`0.1`–`0.4`) can start immediately with zero map-queue wait.**

---

## 4. Shared work needed first

### 4a. Four census-discovered additions to `kits/shumari` (beyond `kits/shumari/PLAN.md` §4)

Scanning `trade-gemini.json`, `geology.json` and `basins.json` across all `8,353 px` of Shumar surfaced four major plateau trades that `kits/shumari/PLAN.md` §4's initial 52-def list did not yet give dedicated structures:

| New def key | Role / Tier | Why the census requires it | Where it stands |
|---|---|---|---|
| **`sm_spirits_still`** | `works` (`-ra`) | Shumar (`Amaro` + `Urundashi`) is **#2 on Krator in distilled `spirits` (`141.2 t/yr`, 32% of world `tequila` slot)**. Stone-walled roasting pit for canyon `spiralaloe`/agave & `whorlapricot` mash, twin riveted **copper-dome alembics** echoing miniature Mamluk *qubbas*, snowmelt condenser trough, and stoneware/glass bottling room | `Amaro`, `Urundashi`, `Nazāru-Kūra`, `Šīru-Māru` |
| **`sm_charcoal_kiln`** | `works` (`-ko`/`-ra`) | Shumar has **`0` domestic `coal`** yet leads the world in watered-steel blades: stone-banked beehive charcoal clamp pair + stacked `ropepine` / `helixpoplar` cordwood yard & soot shed | `Bētun-Kūra`, `Bētun-Bābu`'s ring (`betun.ring.lumber-1`), `Suṭōn-Qappu` |
| **`sm_lake_jetty`** | `trade` (`-ra`) | `kits/shumari/PLAN.md` §4 marked `fishers` and `boatbuilders` `na` before `basins.json`'s **`401 km²` NE lakes (`S5`)** were scanned. Dressed basalt quay steps, tarred pine skiff/ore-barge slipway, and wind-drying trout/char rack (flipping `fishers` and `river bargemen` from `na` to carried in `S5`!) | `Yāmu-Qappu`, `Šīru-Māru`, `Nemetu-Gisr`, `Suṭāru-Bētu`, `Šīru-Qubba` |
| **`sm_placer_sluice`** | `works` (`-ko`/`-ra`) | `geology.json` holds high-grade river **`tin` (`load 12.46`) and `gold` (`load 4.57`) placers** in `S2`'s `Dōriyan-Nārun` / `Gēdun-Buruqu` gorges: stepped basalt diversion race, riffled timber sluice boxes, and heavy-mineral washing table | `Gēdu-Šaṭṭu` (`699,1173`) and `S2` canyon streams |

### 4b. Opt-in `core/hamlet` row: `KHAMLET.shumariRow` (`core/hamlet/shumari/25-hamlet-shumari.js`)

Because `core/hamlet/20-hamlet-cultures.js` reaches ~56 builds (`CLAUDE.md` high-reach rule), Shumar follows Kirstabal's and Phēr's opt-in pattern: `core/hamlet/shumari/25-hamlet-shumari.js` exports `KHAMLET.shumariRow` and `KHAMLET.shumariCampRow` to pages that include it, and folds into `20-hamlet-cultures.js` on the next all-builds rebuild.

Proposed `KHAMLET.shumariRow` parameters:
- **`kit: 'shumari'`, `household: 5.2`, `workShare: 0.46`, `slopeMax: 0.28`** (steeper than Xanadu's `0.22` because Shumari houses step onto battered *ishigaki* basalt plinths along canyon walls).
- **Village services (all monumental/head pieces `giant: true` so a visiting `Gēdu-šu` *iqta'* captain can enter every village's shrine and head-house!):**
  - `religious: 'sm_sabil_shrine'` (`2` jobs — domed snowmelt fountain & ancestor-roll loggia; wayside `sm_wayside_cairn` at the gate),
  - `civic: 'sm_sword_villa'` (`3` jobs — the resident `-šu` *muqṭaʿ* fief-holder's *pishtaq* compound),
  - `general: 'sm_bazaar_hall'` (`3` jobs),
  - `food: 'sm_brewery_teahouse'` (`3` jobs — *boza* millet-beer & samovar house),
  - `warehouse: 'sm_state_granary'` (`3` jobs — buttressed *ablaq* tithe store).
- **Houses (`middlingShare: 0.42`):**
  - `poor` (`-ko` / poor `-ra`): `[['sm_herder_house', 1, 3], ['sm_cliff_cot', 1, 2], ['sm_cadet_cell', 2, 1]]`,
  - `middling` (`-ra` Hearth-Commons): `[['sm_hearth_house', 2, 3], ['sm_courtyard_house', 2, 2], ['sm_terrace_house', 3, 1], ['sm_shop_house', 2, 1]]`,
  - `head` (`-šu` *iqta'* bailiff): `[['sm_captain_bayt', 1, 1]]`.
- **Works foci (`works`, `focusJobs`, `reach`):**
  - `farming` (`focusJobs: 92`, `reach: 480`): `sm_terrace_farm` (`0.70`), `sm_state_granary` (`0.15`), `sm_watermill` (`0.15`);
  - `orchard` (`focusJobs: 88`, `reach: 440`): `sm_apricot_orchard` (`0.65`), `sm_spirits_still` (`0.20`), `sm_state_granary` (`0.15`);
  - `ranch` (`focusJobs: 56`, `reach: 750`): `sm_stock_fold` (`0.60`), `sm_herder_house` (`0.25`), `sm_butcher` (`0.15`);
  - `lumber` (`focusJobs: 68`, `reach: 600`): `sm_charcoal_kiln` (`0.65`), `sm_stonecutters_yard` saw/dressing floor (`0.35`);
  - `quarry` (`focusJobs: 64`, `reach: 360`): `sm_stonecutters_yard` (`0.80`), `sm_blade_smithy` tool-dressing (`0.20`);
  - `clay` (`focusJobs: 60`, `reach: 320`): stoneware kiln yard + `sm_lacquer_inlay_shop`;
  - `salt` (`focusJobs: 64`, `reach: 340`): `sm_salt_evaporator` (`0.80`), `sm_state_granary` (`0.20`);
  - `fishing` (`focusJobs: 64`, `reach: 280`, `landing: {key: 'sm_lake_jetty', jobs: 3}`): `sm_lake_jetty` (`0.75`), `sm_butcher` smoking loft (`0.25`);
  - `mine` (`focusJobs: 110`, `reach: 450`, mostly on `shumariCampRow`): `sm_mine_head` (`0.60`), `sm_blade_smithy` (`0.20`), `sm_saltpeter_works` (`0.20`);
  - `placer` (`focusJobs: 80`, `reach: 420`): `sm_placer_sluice` (`0.75`), `sm_blade_smithy` (`0.25`).
- **`KHAMLET.shumariCampRow` (`workShare: 0.88`, `household: 6.0`):** replaces family cottages with `[['sm_cadet_cell', 4, 4], ['sm_giant_cadet_cell', 2, 1]]`, `civic: 'sm_regiment_barracks'`, `religious: 'sm_wayside_cairn'`, so `-ko` human and `Gēdu-ko` Free Giant corvée crews at `Urudīru-Maʿdan` and `Šūru-Bāru` have accurate Giant-and-human bunk geometry without civilian households.

### 4c. Tune parity (`SHUMAR_TUNE`)

Every settlement or open-world region page imports `core/region/data/shumar-tune.js` (`SHUMAR_TUNE`) in place and runs a node parity test (modeled on Kirstabal's `test-ks-town.js`) asserting exact agreement on `id`, `px`, `pop`, `province`, `caste` share, and `works` keys.

### 4d. Textures (`core/materials/PROMPTS-NEEDED.md` §59)

After merging `claude/openworld-sites-24defd` (which placed Kirstabal at §57 and Xanadu works at §58), Shumar's queued prompts stand in **`core/materials/PROMPTS-NEEDED.md` §59**: `stone.dome.mamluk`, `masonry.ablaq.basalt`, `stone.jali.blade`, `card.apricot.whorl`, plus the deterministic SVG-glyph bake `patterns/shumari/kattu-frieze`. All stand-ins (`stone.stucco.yeseria`, per-course basalt/travertine geometry, `patterns/common/jali-diamond`) are already wired in `kits/shumari/materials.json`.

---

## 5. Questions for the owner (build-out & layout)

*(Complementing the six sim/trade questions in `core/simulation/PROPOSAL-SHUMAR.md` §9.)*

1. **Villages of `500–850` people (`13` canyon & lake villages in 1c–1d):** In Xanadu (`settlements/xanadu/BUILD-OUT.md` §5), you ruled *"towns over 500 can be laid out in full"* on `core/city`. Should Shumar's `500–850` canyon/lake villages (`Pāyaru-Gisr`, `Mīṣu-Bustān`, `Nazāru-Kūra`, `Šīru-Māru`, etc.) also be laid out in full via the **shared Shumari town target (`?town=<id>`)**, or should `core/city` stop at the **6 regimental seats (`1,400–12,000`)** while villages under `1,000` use `KHAMLET.shumariRow`?
2. **Open-world region granularity (`openworld/shumar-*`):** Cut **one open-world region per regimental province (`S1`–`S6`, six regions)** matching Xanadu's one-region-per-province rule, or group the `33,412 km²` plateau into **two larger regions** (`shumar-west` `S1–S3` and `shumar-east` `S4–S6`)?
3. **Amaro's ground (`(731, 1184)` vs `(734, 1182)`):** Should `Track A` stage **Amaro** directly on the dramatic **`260 m` canyon lip at `(731, 1184)`** (current `60-settlements.js` pin, Khunzakh/Kars cliff-citadel feel, with waterwheel forge-chutes dropping straight into `Bētun-Nārun`), or on the gentler bench at `(734, 1182)`?
4. **The four census-discovered kit pieces (section 4a):** Approve adding **`sm_spirits_still`**, **`sm_charcoal_kiln`**, **`sm_lake_jetty`** and **`sm_placer_sluice`** to `kits/shumari` in Wave `0.2` (raising the kit from 52 to 56 defs and enabling `S5`'s lake fishery/ore-barge traffic)?
5. **Station-4 & Station-5 architectural tie-in (Wave `2.1`):** Keep `biomes/shighlands` `--station shumar` and `--station ordeal` pure natural biome pages while drawing **`Qappu-Qubba`** (`737,1201`) and **`Bābu al-Urudīru`** (`782,1194`) on the settlement/open-world pages, or add an optional `--dressed` / settlement preview target showing the Mamluk *qubba* and Ordeal *pishtaq* standing on those exact station stages?
6. **Starting order:** Once you review these two scope docs, should we kick off **Wave 0 (`kits/shumari` SM3–SM5 + `SHUMAR_TUNE`)**, or jump straight to **`SHUMAR_TUNE` + cutting the first province region (`S1 Qappu-Šubaru`)**?
