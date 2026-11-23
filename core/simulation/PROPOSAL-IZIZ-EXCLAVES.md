# Proposal: Exclave Iziz on the Sim Layer — `Dilihan Province` & `Shell Province`

This document scopes the two northern exclaves of the **Empire of Iziz** — **`Dilihan Province`** (`rmvlqd5ix7mfn`) on the mouth of **The Cut**, and **`Shell Province`** (`rmvlqffsaj2v0`) on the northeastern Ring Sea shore — for `core/simulation` and `core/region` (`core/region/50-region-valley.js`), following the provincial benchmark established in `core/simulation/PROPOSAL-XANADU.md`. Mainland Iziz (including `Iziz`, `Pylon`, `Talia`, `Hook`, `Port Tobin`, and ocean-going `Porta Marr` at `926,1014`) is scoped in the companion mainland/Marr blueprint.

All areas, elevations, atmospheric pressures (`atm`), rainfall, Köppen classes, river discharges, water-body connectivities, 39-family mineral node yields, `49r` surface indices, and `CROPS.at` / `CROPS.forBiome` crop matches below are extracted pixel-by-pixel from **Scale Model 5.1** (`tools/scale-model/model/data/` and `51-region-store.js`).

## Sources

- **Canon & Settlement Plans:**
  - `LORE.md` §6.2 (*Empire of Iziz* & *Former Empire exclaves*, lines 199–215, 535–548, 1204–1245), §6.3 (*Iron Republic*, line 679), §6.4 (*Free Clans / Ardent*), §6.6 (*Beast Riders*, line 346), §6.7 (*Screamers*, lines 265–268, 355–363), §6.14 (*Jimjam*), §6.16 (*League of Amphitriton*, line 539), §6.18 (*Noa's Regret*), and §11 (*Open questions*, line 1242).
  - `settlements/dilihan/PLAN.md` (Dilihan's 1:4 Jimjam Old Quarter, Veterans' Council, Ardent bronze & Republican tech-copying); `settlements/iziz/VASSAL-KITS.md`; `kits/iziz-vernacular/README.md`; `kits/pylon/PLAN.md`; `kits/ancients/README.md`.
  - `biomes/cut/PLAN.md` (The Cut's 5-km wall profile, `hyperbamboo`, `circlelichen`, `measuremelon`) and `biomes/k-guilin/PLAN.md` (tower karst on the Dilihan–League border).
  - `core/hamlet/20-hamlet-cultures.js`, `core/hamlet/21-hamlet-iziz.js`, `core/world/49r-world-resources.js`, and `kits/crops/src/10-crop-core.js` (`CROPS.at`, `CROPS.forBiome`).
  - `openworld/ANCIENT-NETWORK.md`, `openworld/ANCIENT-ROADS.md`, `openworld/RESOURCES-SETTLEMENTS.md`, `openworld/TRADE-GOODS.md`, and `openworld/TRADE-SCOPE.md` (native-crop lock, salt split, oil licence, gateway rules).
- **Gemini's Draft Trade & Demographic Model (audited & corrected in §4):**
  - `openworld/TRADE-GEMINI.md`, `populations-gemini.json`, `resources-settlements.json`, `trade-gemini.json`, `trade-fleets-gemini.json`, `roads-supplement-gemini.json`, and `net51-gemini.json`.

---

## 1. Tale of Two Exclaves — Strategic & Institutional Contrast

When the old Empire of Iziz pushed across the Ring Sea ~600 years ago (`LORE.md:201–203`), it planted garrisons along the northern crater rim and the ancient arcology road from **Jimjam** (`745,546`) through **Dilihan** (`744,663`), **Hexahedron** (`817,670`), **Fort Kalor** (`863,693`), and **Shell** (`902,659`) toward **Crescent** (`994,694`). Two centuries of Screamer expansion across the north-central hyperjungle and salt flats (`Screamer Country`, `rmuca1tm8hito`) tore that northern belt in two, culminating ~120 years ago in the **Screamer sack of `Port Visas`** (`800,712`), which severed Dilihan's own Ring Sea harbour (`LORE.md:208, 266, 540`).

Today the two surviving Izani exclaves embody opposite solutions to imperial distance:

| Dimension | **Dilihan Province** (`rmvlqd5ix7mfn`) — *"Iziz-by-Letter"* | **Shell Province** (`rmvlqffsaj2v0`) — *"Iziz-by-Convoy"* |
|---|---|---|
| **Capital & Anchor** | **`Dilihan`** (`solqo7hz7s`, `744,663`, `-889 m`, `1.79 atm`) — rock-bench & karst-mouth city over the lower Cut, founded as Jamṭōkku *Ḍeḷḷu-Hanḍu* ("Lower Market") | **`Shell`** (`s8kenhm9vi`, `902,659`, `-1,240 m`, `1.87 atm`) — inhabited Ancient tiered-clamshell arcology (`2.0 km` off a `192 km²` inland lake at `-1,352 m`) |
| **Sea Outlet** | **`Port Visas`** (`szn5aae96p`, `800,712`, `-1,458 m`, `1.92 atm`) — **sacked ~120 yrs ago** by Screamers; ~1,000 survivors work ruined quays; cut off from regular Izani fleets | **`Port Goto`** (`ski7uk8fjc`, `918,698` -> **shore snap `920,703`**, `-1,460 m`, `1.92 atm`) — active fortified convoy port on the open Ring Sea (`14` Izani Dhoni coasters) |
| **Regime & Imperial Tie** | **De facto autonomous veteran-council republic**: the **Veterans' Council** chooses the governor; Iziz confirms by letter with an Imperial title (`LORE.md:541`). Zero fiscal tribute; self-funded treasury | **Direct Imperial military governorate**: governor & officer cadre appointed from Iziz; garrison rotations, ordnance, and naval escorts supplied via `Porta Marr` (`926,1014`) & `Port Tobin` (`932,973`) |
| **Speech & Culture** | Archaic northern **Izani** heavily creolized with **Jamṭōkku** trade, irrigation, and masonry loans (`settlements/dilihan/PLAN.md`); strong local civic pride | Standard **Imperial Izani** in the arcology & `Port Goto`, over a frontier substratum of Scyvoi-named river valleys (`Kumun Buruku`, `Bitir Gulusu`) and League/Islander coasters |
| **Road Maintenance** | **Maintained Izani highways**: `246 km` (`67 km` tunnels) north up The Cut to `Jimjam`; `152 km` (`28 km` tunnels) SE to `Port Visas` (`net51-gemini.json`) | **Split**: kept convoy road south (`~90–102 km`) from `Shell` to `Port Goto`; **lapsed Ancient/Izani trunk** east toward ruined `Crescent` (`219 km`) and west toward ruined `Fort Kalor` (`105 km`) |
| **Allies & Lifelines** | Allied with **`Ardent`** (`830,553`, Free Clans bronze down The Cut) and **`Jimjam`** (`745,546`); diplomatic envoys & compact trade cross **Hykkousoi League** roads/waters (`Limnaia` -> `Trigon`/`Ys`/`Tethis` -> `Hook`/`Porta Marr`) | Linked by sea convoy to **`Porta Marr`**, **`Port Tobin`**, and **`Hook`**, plus licensed League port calls (`Tethis`, `Kierson` `884,737`, `Nephtos` `919,762`); tense coolness toward `Kautoa` (`964,725`) |
| **Primary Adversaries** | **`Iron Republic`** on the high western rim (`Lipp` `691,619`, `+3,565 m`) — Republican goods *"may be seized, taxed or quietly copied"* (`LORE.md:679`) — and **`Screamer Country`** (`Hexahedron` `817,670`) to the east | **Three-front frontier**: **`Beast Riders`** (`Pinnacle Rock` `1007,686`) raiding `Shell` & the `Port Goto` road (`LORE.md:346`); **`Screamers`** (`Fort Kalor` `863,693`) & **`Boiling Bay`** pirates (`866,723`) west; **`Korona`** Hum-tribes (`K9` `907,586`) north |
| **Economic Signature** | **Heavy chemical & metallurgical workshop state**: #1 map-wide `potash` (`80.0` good yield), `halite`, `gypsum`, `marble`, `skarn`, `iron` (`1,124` good yield), `tin` (`253.5` + placers), `gold`/`silver`, D4 `coal`, and reverse-engineered Republican wares | **Naval timber, fuel, brimstone & garrison entrepôt**: `ship-timber` (`wood 255`), Goto `coal`, hydrothermal vent `sulfur` (`255` at `888,694`), `gypsum`/`halite`/`potash`, #2 map-wide `alkali` (soda), `copper`/`silver`, and tropical dyes/cordage |

---

## 2. Physical Geography, Dense-Air Climate, Hydrology & 39-Family Geology

### 2.1 Comparative Hypsometry, Dense-Air Pressure & Climate Regimes

Both provinces plunge from standard-air highland rims (`+3,337 m` to `+4,321 m`, `0.93–1.05 atm`) down into hyper-dense inner-crater basins (`-1,455 m` to `-1,794 m`, **`1.79–2.00 atm`**), where air density nearly doubles sea-level standard, accelerating windborne dust/salt transport, suppressing open-flame draught without forced bellows, and unlocking Krator's `atm = 2` (`dense`) crop guild (`hyperbamboo`, `bamboo-rice`, `ashmillet`, `sandpan-fonio`).

| Metric (Scale Model 5.1, `2 km` pixel grid) | **Dilihan Province** (`rmvlqd5ix7mfn`) | **Shell Province** (`rmvlqffsaj2v0`) |
|---|---|---|
| **Polygon Vertices & 5.1 BBox** | 13 vertices; `X = 701..816` (`230 km`), `Y = 589..724` (`270 km`) | 14 vertices; `X = 872..942` (`140 km`), `Y = 585..719` (`268 km`) |
| **Total Area (`4 km²` cells)** | **`33,800 km²`** (`8,450` cells) | **`25,192 km²`** (`6,298` cells) |
| **Dry Land Area** | **`25,976 km²`** (`6,494` cells, `76.9%`) | **`23,108 km²`** (`5,777` cells, `91.7%`) |
| **Wet Area (Ring Sea + Inland Lakes)** | **`7,824 km²`** (`496 km²` Ring Sea + `7,328 km²` inland salt lakes) | **`2,084 km²`** (`1,780 km²` Ring Sea + `304 km²` inland lakes) |
| **Dry Elevation (`min` / `p25` / `med` / `p75` / `max`)** | `-1,793.8 m` / `-1,121.6 m` / **`-593.7 m`** / `+229.2 m` / `+4,320.9 m` | `-1,677.7 m` / `-1,293.8 m` / **`-888.6 m`** / `-405.8 m` / `+3,336.7 m` |
| **Dry Atmospheric Pressure (`min` / `med` / `p95` / `max`)** | `0.932` / **`1.723 atm`** / `1.914` / **`2.002 atm`** | `1.054` / **`1.788 atm`** / `1.920` / **`1.973 atm`** |
| **Annual Rainfall (`min` / `med` / `mean` / `p90` / `max`)** | `188` / **`769 mm`** / `966 mm` / `1,694` / `3,294 mm` | `110` / **`925 mm`** / `889 mm` / `1,224` / `2,243 mm` |
| **Dry Temp (`tm` med `[p10..p90]`, `tw` med, `tc` med, `th`)** | `28.0 °C [18..32 °C]`, `tw 35.0 °C`, `tc 21.0 °C`, `th 41.0 °C` | `30.0 °C [25..33 °C]`, `tw 37.0 °C`, `tc 23.0 °C`, `th 44.0 °C` |
| **Terrain Slope (`med` / `p90` / cliffy `>= 0.15`)** | `0.046` / `0.150` / **`2,584 km²` (`9.9%`)** — steep Cut & Republic walls | `0.026` / `0.072` / **`912 km²` (`3.9%`)** — broad gentle basin & coast |
| **Dominant Köppen Classes (% of dry land)** | `BSh 28.9%` (`7,520 km²`), `Aw 15.5%` (`4,024 km²`), `Cfa 10.8%` (`2,812 km²`), `Csa 10.2%` (`2,656 km²`), `XA 10.1%` (`2,632 km²`), `XV 6.9%` (`1,804 km²`), `XS 6.2%` (`1,620 km²`), `Am 3.6%`, `Af 2.0%` | `Aw 36.9%` (`8,520 km²`), `XV 23.7%` (`5,480 km²`), `BSh 19.7%` (`4,548 km²`), `Cfa 6.1%` (`1,412 km²`), `BWh 4.9%` (`1,136 km²`), `XA 2.9%` (`680 km²`), `Csa 2.1%`, `Am 2.1%`, `Af 1.3%` |

*(Note: `XA`, `XV`, and `XS` are Scale Model 5.1's hyper-dense lowland `tm > 30 °C` equivalents of perhumid rainforest `Af`/`Am`, wet-dry savanna `Aw`, and hot steppe `BSh` at `1.85–2.00 atm`.)*

| Elevation Band (m) | Dilihan Dry `km²` (`%`) | Dilihan `atm` / Rain / `tm` | Shell Dry `km²` (`%`) | Shell `atm` / Rain / `tm` |
|---|---:|---|---:|---|
| `-2,000 .. -1,500 m` (deep sumps & shore) | `284 km²` (`1.1%`) | `1.96 atm` / `1,820 mm` / `34 °C` | `476 km²` (`2.1%`) | `1.94 atm` / `1,224 mm` / `34 °C` |
| `-1,500 .. -1,350 m` (evaporite pans & sea bench) | `3,164 km²` (`12.2%`) | `1.91 atm` / `1,051 mm` / `33 °C` | `4,116 km²` (`17.8%`) | `1.91 atm` / `1,035 mm` / `33 °C` |
| `-1,350 .. -1,100 m` (arcology & lake benches) | `3,316 km²` (`12.8%`) | `1.87 atm` / `753 mm` / `32 °C` | `3,520 km²` (`15.2%`) | `1.87 atm` / `1,004 mm` / `32 °C` |
| `-1,100 .. -700 m` (Dilihan bench & mid-savanna) | `5,252 km²` (`20.2%`) | `1.79 atm` / `643 mm` / `30 °C` | `6,164 km²` (`26.7%`) | `1.79 atm` / `894 mm` / `31 °C` |
| `-700 .. -200 m` (karst & river foothills) | `4,444 km²` (`17.1%`) | `1.69 atm` / `612 mm` / `28 °C` | `4,284 km²` (`18.5%`) | `1.70 atm` / `690 mm` / `29 °C` |
| `-200 .. +400 m` (lower canyon & valley floors) | `3,960 km²` (`15.2%`) | `1.59 atm` / `690 mm` / `26 °C` | `2,608 km²` (`11.3%`) | `1.58 atm` / `408 mm` / `26 °C` |
| `+400 .. +1,200 m` (mid-scarp & Cfa/Csa terraces) | `2,280 km²` (`8.8%`) | `1.46 atm` / `941 mm` / `22 °C` | `692 km²` (`3.0%`) | `1.50 atm` / `235 mm` / `24 °C` |
| `+1,200 .. +3,000 m` (upper Cut & Korona rim) | `2,652 km²` (`10.2%`) | `1.26 atm` / `1,333 mm` / `16 °C` | `1,056 km²` (`4.6%`) | `1.22 atm` / `1,035 mm` / `15 °C` |
| `+3,000 .. +4,321 m` (Republic & Free-Clan crests) | `624 km²` (`2.4%`) | `1.05 atm` / `973 mm` / `8 °C` | `192 km²` (`0.8%`) | `1.08 atm` / `627 mm` / `11 °C` |

### 2.2 Hydrology, Inland Salt Lakes vs. Ring Sea, Vents & Pin Diagnostics

Connected-component labelling of the 5.1 water mask (`284` water bodies; open **Ring Sea** = `lbl=126`, `173,380 km²` at `-1,500.2 m`) resolves how each settlement connects to the sea and exposes a critical pin-offset bug on **`Port Goto`**:

1. **Dilihan's Endorheic Salt Basins vs. Open Ring Sea at `Port Visas`:**
   - **`Dilihan` (`744,663`, `-888.6 m`) is `151.3 km` inland from the Ring Sea.** Its nearest water (`8.0 km` north at `744,659`) is the **Cut Salt Lake (`lbl=98`, `3,152 km²` total, all inside Dilihan Province)**, an endorheic brine basin standing at `-1,455.9 m` (`2,663 km²` main pan at `728.6,632.4`, `spill_m = -383 m`) with a lower `-1,608 m` sub-sump (`497 km²` at `748.6,652.5`).
   - Feeding the Cut Salt Lake from the northeast canyon wall is **`Rrivar airon`** (`r865`, Izani tongue, perennial, **`Q = 68.1 m³/s`**, `51 km`, canyon walls `385–603 m` deep from `+2,531 m` down to `-101 m`, discharging into the lake at `728.6,604.4`). Where `Rrivar airon` flattens (`736.7,603.5`) and mouths (`730.6,604.4`), it deposits **four high-grade alluvial placers** (`gold` loads `2.79` & `2.28`; `tin` loads `5.68` & `4.84`).
   - Along Dilihan's eastern border with `Screamer Country` lies a second huge endorheic brine sheet: the **Screamer-March Salt Depression (`lbl=113`, `4,176 km²` at `-1,500.2 m`**, with a `-1,758 m` sump at `804.7,674.5`), separating Dilihan from `Hexahedron` (`817,670`, `22.6 km` east of the lake).
   - **`Port Visas` (`800,712`, `-1,458.2 m`) sits on the open Ring Sea (`lbl=126`, `496 km²` inside SE Dilihan Province)**: `4.0 km` from open Ring Sea water (`802,712`) and `2.0 km` from the dry 1:1 shoreline (`801,712`). Crucially, in `51-region-store.js`, `Port Visas` lies inside **both** `Dilihan Province` (`rmvlqd5ix7mfn`) and `Screamer Country` (`rmuca1tm8hito`) — `10,128 km²` of eastern Dilihan overlaps `Screamer Country`, cartographically encoding the contested Screamer march!

2. **Shell's Inland Lake, Hydrothermal Vents & the `Port Goto` `10.8 km` Inland Pin Bug:**
   - **`Shell` (`902,659`, `-1,239.6 m`) is `90.0 km` north of the Ring Sea**, perched on a bench `2.0 km` east of **Shell's Lake (`lbl=110`, `192 km²` endorheic brackish/salt lake at `-1,352.0 m`**, `spill_m = -1,316 m`). Shell's Lake is fed from the north by the perennial **`Kumun Buruku`** (`r247`, Scyvoi tongue, **`Q = 15.4 m³/s`**, `71 km`, `260–394 m` valley walls, `low` tin placer `0.61` at `906.8,640.4`) and its northern tributary **`Bitir Gulusu`** (`r595`, `Q = 10.0 m³/s`, `38 km`, `low` gold placer `0.38` at `900.8,618.4`), plus ephemeral `Akun Gulusu` (`r787`, `4 km`). Two smaller closed basins lie at `920,686` (**Goto Road Salt Pan**, `lbl=120`, `48 km²` at `-1,390.9 m`) and `884,710` (**SW Lagoon**, `lbl=127`, `64 km²` at `-1,500.2 m`).
   - **Two active hydrothermal vents** lie inside SW Shell Province (overlapping the eastern `Steampits` polygon `rmucgu3s7bzwh`): **`(888,694)`** (`floor -1,796 m`, `radius 1.6`) and **`(893,716)`** (`floor -1,403 m`, `radius 1.6`), generating `sulfur = 255`, `tuff = 200`, and rich polymetallic `copper` (`210`), `zinc` (`168`), `silver` (`150`), and `gold` (`140`) veins.
   - **CRITICAL PIN DIAGNOSTIC — `Port Goto` (`ski7uk8fjc`, `918,698`):** In `60-settlements.js`, `Port Goto` is pinned at `918,698` (`-1,453.2 m`), which is **`12.6 km` inland from Ring Sea water (`920,704`) and `10.8 km` inland from the dry 1:1 shoreline (`920,703`, `-1,460.0 m`)**. Because a `village` pin's resource scan radius in `tools/scale-model/settlement_resources.py` is **`10.0 km`**, `resources-settlements.json` recorded `Port Goto` with **`sea_km2 = 0`, `fish = 0`, `polity = null`**, and `net51-gemini.json` dumped `"Port Goto"` into `excluded.ports`! Snapping `Port Goto` `10.8 km` SSE to **`920,703`** (and setting `polity: "Shell Province"`) puts it directly on Shell's `1,780 km²` Ring Sea coast (`2.0 km` from `lbl=126` water) without altering road topology (§5, Q2).

### 2.3 Complete 39-Family Geology & Rock Provinces

Neither province contains `ruin_km2` cells (`0 km²` Ancient metropolis rubble ground; `Shell` is a clean intact point arcology, unlike ruined `Crescent` `176 km²` or `Fort Kalor` `188 km²`). Their rock provinces and **all 39 `geology.json` resource families** (`4 km × 4 km = 16 km²` cells; node yields computed via `core/world/49r-world-resources.js` local-maxima spacing `NODE_SPACING_CELLS = 2`) compare as follows:

- **Dilihan Rock Provinces (`1,658` land cells = `26,528 km²`):** `sedimentary 41.5%` (`11,008 km²`), `crystalline 27.8%` (`7,376 km²`), `granite 18.3%` (`4,864 km²`), `carbonate 5.9%` (`1,552 km²`), `evaporite 5.1%` (`1,360 km²`), `impact 1.4%` (`368 km²`).
- **Shell Rock Provinces (`1,464` land cells = `23,424 km²`):** `sedimentary 77.5%` (`18,144 km²`), `crystalline 6.1%` (`1,424 km²`), `volcanic 5.4%` (`1,264 km²`), `evaporite 4.6%` (`1,072 km²`), `quartzite 4.0%` (`928 km²`), `granite 2.5%` (`592 km²`).

| # | Resource Family | Dilihan Mean / Max | Dilihan `Good>=100` / `Rich>=170` (`km²`) | Dilihan Nodes (`AllY` / **`GoodY`**) & Peak `px` | Shell Mean / Max | Shell `Good>=100` / `Rich>=170` (`km²`) | Shell Nodes (`AllY` / **`GoodY`**) & Peak `px` |
|---:|---|---:|---:|---|---:|---:|---|
| 1 | **`iron`** | `106.2` / `255` | `16,400` / `4,016` | `1,267` (`1,250.5` / **`1,124.0`**) @ `716,622` | `77.8` / `255` | `6,848` / `4,832` | `794` (`782.5` / **`547.5`**) @ `930,686` |
| 2 | **`copper`** | `30.0` / `170` | `464` / `224` | `172` (`147.5` / **`13.5`**) @ `716,622` | `24.4` / `210` | `1,376` / `1,264` | `122` (`122.5` / **`70.0`**) @ `888,686` |
| 3 | **`gold`** *(+ placers)* | `52.0` / `110` | `12,240` / `0` | `205` (`187.0` / **`181.5`**) @ `720,592` *(+2 high pl.)* | `17.0` / `140` | `3,280` / `0` | `65` (`63.0` / **`63.0`**) @ `888,686` *(+1 low pl.)* |
| 4 | **`tin`** *(+ placers)* | `53.9` / `200` | `4,864` / `4,864` | `363` (`375.5` / **`253.5`**) @ `718,594` *(+2 high pl.)* | `9.8` / `200` | `592` / `592` | `48` (`42.5` / **`24.5`**) @ `888,624` *(+1 low pl.)* |
| 5 | **`silver`** | `51.9` / `110` | `12,240` / `0` | `200` (`189.5` / **`187.0`**) @ `720,592` | `17.6` / `150` | `3,280` / `0` | `60` (`54.5` / **`54.5`**) @ `888,686` |
| 6 | **`rare-earth`** | `58.0` / `160` | `12,240` / `0` | `155` (`138.0` / **`135.0`**) @ `718,594` | `11.7` / `160` | `2,016` / `0` | `29` (`30.5` / **`27.5`**) @ `888,624` |
| 7 | **`coal`** | `26.6` / `215` | `1,632` / **`1,408`** | `306` (`302.0` / **`147.0`**) @ `812,700` & `798,700` | `50.9` / `183` | `2,672` / `80` | `495` (`457.5` / **`120.0`**) @ `912,704` |
| 8 | **`sulfur`** | `0.0` / `0` | `0` / `0` | `0` (`0.0` / **`0.0`**) — *none* | `16.5` / **`255`** | `1,264` / `336` | `387` (`360.0` / **`173.0`**) @ vent `888,694` |
| 9 | **`saltpeter`** | `13.9` / `158` | `432` / `0` | `110` (`101.5` / **`16.5`**) @ `780,646` | `17.1` / `196` | `1,760` / `240` | `100` (`98.0` / **`61.0`**) @ `888,618` |
| 10 | **`oil`** | `14.8` / `148` | `272` / `0` | `46` (`41.0` / **`4.5`**) @ `814,696` | `37.4` / `83` | `0` / `0` | `165` (`145.5` / **`0.0`**) @ `906,692` |
| 11 | **`gypsum`** | `3.0` / `251` | `400` / `224` | `57` (`57.5` / **`50.5`**) @ `744,644` | `2.5` / `248` | `320` / `128` | `35` (`37.0` / **`33.5`**) @ `896,668` |
| 12 | **`halite`** (rock salt) | `6.9` / `250` | `320` / `160` | `124` (`109.0` / **`34.5`**) @ `736,652` | `9.2` / `239` | `304` / `80` | `126` (`111.5` / **`25.5`**) @ `896,674` |
| 13 | **`potash`** | `4.4` / **`254`** | `672` / `288` | `71` (`80.5` / **`80.0`**) @ `724,642` & `729,641` | `3.2` / `223` | `496` / `112` | `40` (`36.0` / **`35.5`**) @ `888,674` & `920,688` |
| 14 | **`alkali`** (soda ash) | `0.0` / `1` | `0` / `0` | `0` (`0.0` / **`0.0`**) | `1.0` / **`70`** | `0` / `0` | `14` (**`11.5`** / `0.0`) @ `926,684` *(map #2)* |
| 15 | **`nickel`** | `18.2` / `220` | `2,240` / `1,216` | `78` (`81.0` / **`69.5`**) @ `722,590` | `2.2` / `220` | `256` / `128` | `9` (`8.0` / **`7.0`**) @ `904,586` |
| 16 | **`marble`** | `4.4` / `131` | `752` / `0` | `51` (`51.0` / **`40.5`**) @ `716,630` | `1.9` / `120` | `208` / `0` | `16` (`17.5` / **`9.0`**) @ `922,688` |
| 17 | **`zinc`** | `7.4` / `136` | `464` / `0` | `41` (`36.0` / **`9.0`**) @ `716,622` | `9.6` / `168` | `1,376` / `0` | `59` (`68.0` / **`68.0`**) @ `888,686` |
| 18 | **`emerald`** | `17.7` / `130` | `1,808` / `0` | `33` (`32.5` / **`15.5`**) @ `724,590` | `40.6` / `130` | `6,992` / `0` | `63` (`63.5` / **`61.0`**) @ `902,640` |
| 19 | **`turquoise`** | `1.7` / `52` | `0` / `0` | `7` (`5.0` / `0.0`) @ `792,650` | `1.7` / `44` | `0` / `0` | `2` (`1.5` / `0.0`) @ `888,618` |
| 20 | **`stone`** (bulk) | `199.4` / `255` | `23,808` / `17,632` | *surface layer* | `165.1` / `255` | `19,488` / `11,280` | *surface layer* |
| 21 | **`clay`** (bulk) | `31.7` / `255` | `3,040` / `3,040` | *surface layer* (`736,604`, `800,712`) | `24.3` / `255` | `1,376` / `1,376` | *surface layer* (`896,658`, `912,704`) |
| 22 | **`wood`** (bulk) | `160.2` / `255` | `18,256` / `12,480` | *surface layer* (`744,663`, `798,700`) | `169.0` / `255` | `18,304` / `14,224` | *surface layer* (`902,659`, `912,704`) |
| 23 | **`water`** (bulk) | `209.6` / `255` | `24,944` / `19,296` | *surface layer* | `218.6` / `255` | `20,880` / `19,392` | *surface layer* |
| 24 | **`limestone`** | `29.4` / `255` | `3,648` / `1,552` | *karst belt* (`758,708`..`780,712`) | `17.5` / `149` | `1,840` / `0` | *lake bench* (`900,664`) |
| 25 | **`impactite`** | `17.6` / `255` | `3,472` / `368` | *north rim* (`720,588`) | `1.8` / `120` | `352` / `0` | *north rim* (`904,586`) |
| 26 | **`ultramafic`** | `0.0` / `0` | `0` / `0` | *absent* | `0.0` / `0` | `0` / `0` | *absent* |
| 27 | **`tuff`** | `0.0` / `0` | `0` / `0` | *absent* | `8.0` / `200` | `736` / `80` | *hydrothermal vent apron* (`888,694`) |
| 28 | **`skarn`** | `3.6` / `200` | `480` / `480` | *contact belt* (`716,622`, `758,670`) | `1.4` / `200` | `160` / `160` | *Goto road skarn* (`926,686`) |
| 29 | **`glass`** | `0.0` / `0` | `0` / `0` | *absent* | `0.0` / `0` | `0` / `0` | *absent* |
| 30 | **`lodestone`** | `0.0` / `0` | `0` / `0` | *absent* | `0.0` / `0` | `0` / `0` | *absent* |
| 31 | **`peat`** | `2.6` / `134` | `400` / `0` | `26` (`23.5` / **`17.5`**) @ `796,698` | `2.3` / `124` | `192` / `0` | `24` (`26.5` / **`8.5`**) @ `912,704` |
| 32 | **`silica`** | `11.3` / `150` | `2,000` / `0` | `72` (`71.5` / **`71.5`**) @ `724,602` | `4.3` / `150` | `640` / `0` | `22` (`22.5` / **`21.5`**) @ `900,656` |
| 33 | **`quartz`** | `8.4` / `30` | `0` / `0` | `17` (`17.5` / `0.0`) @ `718,594` | `2.4` / `30` | `0` / `0` | `6` (`5.5` / `0.0`) @ `888,624` |
| 34 | **`alabaster`** | `2.2` / `201` | `368` / `128` | `10` (`9.0` / **`8.0`**) @ `744,644` | `1.8` / `198` | `240` / `48` | `12` (`10.5` / **`9.0`**) @ `896,668` |
| 35 | **`bitumen`** | `1.2` / `111` | `96` / `0` | `2` (`1.0` / `0.0`) @ `814,696` | `3.2` / `90` | `0` / `0` | `13` (`12.5` / `0.0`) @ `896,698` |
| 36 | **`opal`** | `0.0` / `0` | `0` / `0` | *absent* | `0.0` / `0` | `0` / `0` | *absent* |
| 37 | **`diamond`** | `0.0` / `0` | `0` / `0` | *absent* | `4.6` / `170` | `576` / `576` | `4` (`5.5` / **`5.5`**) @ `905,599` |
| 38 | **`jade`** | `0.0` / `0` | `0` / `0` | *absent* | `0.0` / `0` | `0` / `0` | *absent* |
| 39 | **`amber`** | `3.9` / `75` | `0` / `0` | `13` (`11.5` / `0.0`) @ `810,700` | `0.6` / `64` | `0` / `0` | `0` (`0.0` / `0.0`) @ `912,704` |

**Three geological surprises that reshape the sim economy:**
1. **Dilihan is NOT coal-starved (`D4` holds `1,408 km²` of rich coal at `798,700..812,700`, `max = 215`, `147.0` good yield):** Because `Dilihan` (`744,663`) only scanned a `30 km` circle (`coal max = 136`, `rich = 0`) and `Port Visas` (`800,712`) only scanned `10 km`, Gemini's model thought Dilihan had almost no coal and invented `1,124 t/yr` of sea-shipped Izani coal landing at sacked `Port Visas`! In reality, a premier coalfield sits `24 km` NNW of `Port Visas` (`798,700`, `-1,432 m`, slope `0.002`) right beside the kept `Dilihan–Port Visas` highway.
2. **Dilihan lacks `sulfur` (`0.0`) while Shell is a `sulfur` powerhouse (`173.0` good yield, `max = 255` at vent `888,694`):** Dilihan has #1 map-wide `potash` (`80.0` good yield), `saltpeter` (`16.5` good / `101.5` all), and `silica` (`71.5`), but zero native `sulfur`. Conversely, Shell has hydrothermal `sulfur` (`255`), northern `saltpeter` (`61.0` good), and #2 map-wide `alkali`/soda (`max = 70` at `926,684`, `byte < 100` because soda ash is capped below 100 map-wide).
3. **`Shell` arcology (`902,659`) has zero `good` iron within `20 km` (`max = 40`), whereas the `Port Goto` road (`924,690..932,690`) has `iron = 255` (`547.5` provincial good yield) and `skarn = 200`:** `Shell` depends on convoy forts along the southeastern Goto road (`S2`) and northern `Kumun Buruku` foothills (`S3`) for iron ore and smelted blooms.

### 2.4 `49r` Surface Indices & `CROPS.at` / `CROPS.forBiome` Agricultural Palettes

| `49r` Surface Index | **Dilihan Province** (`25,976 km²` dry) | **Shell Province** (`23,108 km²` dry) |
|---|---|---|
| **Farmland-Equivalent (`farm-eq`)** | **`13,826.6 km²`** (dry mean `0.532`; `good >= 0.5`: `17,000 km²`; `best >= 0.7`: `6,848 km²`) | **`13,657.7 km²`** (dry mean `0.591`; `good >= 0.5`: `17,368 km²`; `best >= 0.7`: `9,956 km²`) |
| **Perennial River-Corridor Dry Land (`<= 2 km`)** | `220 km²` (`159.3 km²` `farm-eq` along `Rrivar airon`, `farm = 1.00` at `737,604`) | `300 km²` (`235.5 km²` `farm-eq` along `Kumun Buruku`, `farm = 0.93` at `906,638`) |
| **Pasture-Equivalent (`pasture-eq`)** | **`16,169.4 km²`** (dry mean `0.622`) | **`16,107.5 km²`** (dry mean `0.697`) |
| **Timber-Equivalent (`timber-eq`)** | **`12,557.5 km²`** (dry mean `0.483`; `wood` byte mean `160.2`, `max 255`) | **`11,530.8 km²`** (dry mean `0.499`; `wood` byte mean `169.0`, `max 255`) |

Querying `CROPS.at({warmth, arid, atm, wet, salt, heated})` and `CROPS.forBiome` across `cut` (`167` crops), `nwbay` (`117`), `hyperjungle` (`83`), `abyssal-savannah` (`96`), and `nhighlands` (`77`) — filtered through **`TRADE-SCOPE.md` §2.5's native-crop rules** (which lock `sugar-cane` and `clove` to the Ring Isles and `coffee` to southern highlands, even where raw climate axes permit them) — yields distinct, lore-faithful crop baskets:

- **Dense-Air Basin & Karst Staples (`1.75–1.95 atm`, `D1`, `D2`, `D4`, `S1`, `S2`):**
  - *Grains & pulses:* **`rice`**, **`bamboo-rice`** (`home: ['cut']`, `atm: [2,2]`), **`ashmillet`**, **`sandpan-fonio`**, **`wild-rice`** (`home: ['nwbay']`), **`bambara`**, **`tepary-bean`**.
  - *Tubers & starch-fruit:* **`taro`**, **`shade-manioc`** (`home: ['hyperjungle']`), **`sweet-potato`**, **`ashroot`**, **`stub-cone`** (`home: ['abyssal-savannah']`), **`plantain`**, **`breadfruit`**.
  - *Salt-pan halophytes (`salt: true` around `729,641`, `800,712`, `896,668`):* **`glasswort`** (vegetable + soda-ash reagent), **`tidewort`**, **`brine-apple`**, **`tamarisk-manna`**, **`wadi-date`**, **`carob`**, **`gatepod`**.
- **The Cut Canyon & Mid-Wall Terrace Specialties (`D3`, `0.95–1.65 atm`, `Cfa`/`Csa`):**
  - *Cut endemics (`biomes/cut/PLAN.md`):* **`hyperbamboo`** (`atm: [2,2]`, structural scaffolding, shoots, water-pipe), **`measuremelon`** (`home: ['cut']`), **`circlelichen`** (`home: ['cut']`, orange dye & mountain tonic herb), **`rankgrass`**.
  - *Upper `Rrivar airon` (`+137..+1,500 m`, `Cfa` `1,145 mm`):* **`emmer`**, **`helix-bean`**, **`murnong`**, **`painted-camas`**, **`frostoat`** (above `+1,800 m`), **`mulberry`**, **`flax`**, **`wallhemp`**, **`saffron`**, **`pomegranate`**, **`fig`** / **`citron`** (supporting Dilihan's Jamṭōkku-style fruit brandies, dried-fruit, and hillside wine).
- **Fibres, Dyes, Stimulants & Dark-Bed Works:**
  - *Fibres & cordage:* **`cotton`** (`nwlowlands` / savanna benches in `D1`/`D3`), **`ramie`** (`nwbay`/karst spinning fibre), **`rope-banana`** (`hyperjungle` marine cordage for `Port Goto`), **`baobab-bark`**, **`mat-reed`**, **`pandan`**.
  - *Dyes (`CROPS.palette`):* **`indigo`** & **`annatto`** (`hyperjungle` wild), **`bloodwood`** (`hyperjungle` `homeOnly` crimson), **`aril-blue`** & **`dragons-blood`** (`nwbay` `homeOnly` in `D1`/`D4`), **`circlelichen`** (Cut orange), **`ironbark-tannin`**, **`mangrove-red`**, plus mineral **`sulfur-yellow`** (`S3` vent) and **`verdigris`**.
  - *Herbs & dark-bed fungi (`works`, climate-independent):* **`tobacco`** & **`rimdew`** (rainfed), plus dark-cellar **`alecap`** (garrison beer), **`pale-fungi`**, **`mat`** (mycelial sheet), and **`glow-mushroom`** (tunnel & mine-drift reagent in `D3`'s `67 km` Cut tunnels and `Shell`'s lower decks).

---

## 3. Sub-Provincial Division (`D1`–`D4` in Dilihan + `S1`–`S3` in Shell)

Following `PROPOSAL-XANADU.md` §2, each sub-province is represented on `core/region/50-region-valley.js` by **(1) one abstract `rural district`** (`scale: 100` or `200`, never drawn in 3D), **(2) 2–3 named villages, forts, or resource works** (`core/hamlet` / `kits/resources`), and **(3) a district seat**. Every pixel in both provinces is assigned to an exact disjoint partition (`8,450 / 8,450` cells in Dilihan; `6,298 / 6,298` cells in Shell), and **every existing and proposed pin below has been verified `in_prov = True`, `dry = True`, and `slope < 0.13` on Scale Model 5.1**.

| ID | Sub-Province / Ward (*Working Name*) | Seat (`px`) | Total `km²` (Dry / Wet) | `farm-eq` / `timb-eq` (`km²`) | Proposed Pop (Seat + Works + Rural) | Signature Outputs & Strategic Role |
|---|---|---|---:|---:|---:|---|
| **D1** | **Dilihan Metropolis & Karst Core** (*Kmandariatz Dellu*) | **`Dilihan`** (`744,663`) | `10,728` (`10,088` / `640`) | `5,399` / `3,290` | **`18,100`** (`12,000` + `1,100` + `5,000`) | Tin-bronze & iron-skarn foundries, reverse-engineered Republican tools/optics, karst-gate customs to League `Limnaia` |
| **D2** | **Great Potash & Salt Basin** (*Salpan Dellu*) | **Potash Works** (`729,641`) | `4,432` (`2,760` / `1,672`) | `1,903` / `1,946` | **`4,900`** (`1,100` + `1,000` + `2,800`) | #1 map-wide `potash` (`59.5` goodY), `halite` (`33.0`), `gypsum` (`36.5`), `marble` (`12.5`), `glasswort` soda |
| **D3** | **Upper Cut & Republican March** (*Kotgeta*) | **Cut-Gate Town** (`737,604`) | `8,880` (`7,928` / `952`) | `3,655` / `4,691` | **`5,800`** (`1,000` + `1,200` + `3,600`) | `Rrivar airon` gold/tin placers, granite `tin` (`153.0`) & `iron` (`505.5`), Ardent bronze, Republic-watch toll/seizure fort |
| **D4** | **Ruined Visas & Screamer-Lake March** (*Guach-Visas*) | **`Port Visas`** (`800,712`) | `9,760` (`5,200` / `4,560`) | `2,869` / `2,631` | **`3,200`** (`1,000` + `1,000` + `1,200`) | **Visas coalfield (`143.0` goodY, `coal 215`)**, `saltpeter`, Screamer highway barrier, ruined Ring Sea quay (`496 km²` sea) |
| | ***Dilihan Province Subtotal*** | | **`33,800`** (`25,976` / `7,824`) | **`13,827`** / **`12,558`** | **`32,000`** (`15,100` / `3,300` / `12,600`*) | *\*Total urban/named `18,400`, rural `13,600` (see table §4.1)* |
| **S1** | **Shell Arcology & Lake-Basin Core** (*Guardi Xel*) | **`Shell`** (`902,659`) | `5,616` (`5,424` / `192`) | `3,911` / `3,194` | **`13,800`** (`10,000` + `900` + `2,900`) | Imperial command & depot, arcology workshops, lake `gypsum` (`29.0`), `halite` (`19.5`), `potash` (`15.5`), garrison farms |
| **S2** | **Port Goto & Beast-Rider March** (*Guardi Porta Godu*) | **`Port Goto`** (`920,703`) | `8,060` (`6,340` / `1,720`) | `4,264` / `3,919` | **`6,200`** (`2,200` + `1,400` + `2,600`) | Naval convoy harbour (`1,672 km²` Ring Sea), `ship-timber`, `coal` (`50.5`), `alkali` soda (`70`), `iron`-skarn (`155.0`), Crescent-road forts |
| **S3** | **Kumun Buruku & Screamer–Korona Buffer** (*Nortolda*) | **Buruku Hold** (`906,638`) | `11,516` (`11,344` / `172`) | `5,483` / `4,418` | **`4,000`** (`800` + `1,200` + `2,000`) | Vent `sulfur` (`173.0`), `copper` (`65.0`), `silver`/`gold`, `saltpeter` (`61.0`), river granary, Screamer & Korona watchtowers |
| | ***Shell Province Subtotal*** | | **`25,192`** (`23,108` / `2,084`) | **`13,658`** / **`11,531`** | **`24,000`** (`13,000` / `3,500` / `7,500`*) | *\*Total urban/named `15,500`, rural `8,500` (see table §4.1)* |

---

### 3.1 Dilihan Province — Four Prefectures (*Kmandariatz*)

#### D1 — Dilihan Metropolis & Karst-Mouth Core (`X = 718..773`, `Y = 646..712`)
- **Ground & Climate:** `10,728 km²` total (`10,088 km²` dry, `640 km²` southern Cut-lake arm, `0 km²` Ring Sea). Dry elevation `-1,700 m` to `+2,558 m` (`median -659 m`, `1.74 atm`, `612 mm` rain, `tm 29 °C`; `BSh 51%`, `Aw 25%`, `XS 6%`, `Csa 4%`, with `Am 1,522 mm` right on `Dilihan`'s bench). `farm-eq = 5,399.4 km²` (`good >= 0.5`: `6,280 km²`), `pasture-eq = 6,876.1 km²`, `timber-eq = 3,289.5 km²`.
- **District Lodes:** `iron = 391.0` goodY (`max 255`), `tin = 58.5` (`max 200`), `silver = 50.0`, `gold = 49.0`, `rare-earth = 31.5`, `marble = 17.5`, `potash = 11.0`, `gypsum = 7.0`, `copper = 5.0` (`allY 54.0`, `max 170`).
- **Pins & `core/hamlet` Sites:**
  1. **`Dilihan`** (`solqo7hz7s`, existing `city`, **`744,663`**, `-889 m`, `1.79 atm`, slope `0.101`, `Am`, `12,000` souls): provincial capital, Veterans' Council seat, bronze/iron foundries, glass/optics & Republican-pattern reverse-engineering workshops, Cut caravan entrepôt.
  2. ***Tin-Skarn Foundry Village*** (proposed `mining` village, **`762,662`**, `-247 m`, `1.65 atm`, slope `0.028`, `Aw`, `farm 0.85`, `tin = 200`, `iron = 120`, `gold/silver = 110`, `650` souls): works the rich eastern granite-skarn cassiterite contact (`18 km` east of Dilihan).
  3. ***South Karst League-Gate*** (proposed `fort` / customs post, **`760,708`**, `-902 m`, `1.79 atm`, slope `0.003`, `Aw`, `limestone = 255`, `farm 0.83`, `450` souls): tower-karst border gatehouse on the `k-guilin` frontier (`24 km` ENE of League `Limnaia` `736,712`), staging Dilihan's envoys and compact silver/potash/relic mule trains south to `Trigon` (`722,740`), `Ys` (`788,741`), and `Tethis` (`733,775`).
  4. **D1 Rural District** (`5,000` souls across ~22 terrace `farming` & `ranch` hamlets): `rice`, `bamboo-rice`, `taro`, `cotton`, `ramie`, `citron`, `dragons-blood`, goat/cattle pasture.
- **Social & Kit Blend:** Per `settlements/dilihan/PLAN.md`, **`Dilihan` is `1/4` Jamṭōkku Old Quarter (`JJ.def` warm fired brick, stepped gables, corbelled water-cisterns) and `3/4` Iziz Vernacular (`VERN.def` ochre-and-white render on stone plinths)**, crowned by a Jamṭōkku-dressed `govpalace` for the Veterans' Council; rural hamlets use `KHAMLET.CULTURES.iziz` with karst limestone footings (`biomes/k-guilin`).

#### D2 — The Great Potash & Evaporite Basin (`X = 715..745`, `Y = 622..659`)
- **Ground & Climate:** `4,432 km²` total (`2,760 km²` dry, `1,672 km²` Cut Salt Lake `lbl=98` at `-1,455.9 m`). Hyper-dense floor (`median -1,243 m`, **`1.87 atm`**, `1,051 mm`, `tm 29 °C`; `XV 31%`, `XA 24%`, `Aw 13%`, `Csa 13%`). `farm-eq = 1,902.7 km²`, `timber-eq = 1,946.0 km²`.
- **District Lodes:** **#1 chemical basin on the map** — `potash = 59.5` goodY (`max 254` at `724,642` / `729,641`), `gypsum = 36.5` (`max 251`), `halite = 33.0` (`max 250`), `iron = 125.0`, `tin = 25.5`, `rare-earth = 19.0`, `silver = 13.5`, `gold = 13.0`, `marble = 12.5` (`max 131` + `alabaster 195`).
- **Pins & `core/hamlet` Sites:**
  1. ***Salpan Dellu / Great Potash Works*** (proposed district seat & `salt`/`mining` town, **`729,641`**, `-1,455 m`, `1.92 atm`, slope `0.006`, `XV`, `potash = 133` on-cell & `254` `5 km` W at `724,642`, `wood = 244`, `1,100` souls): solar evaporation pans, carnallite/sylvite leaching vats, and potash calcining kilns (`7.2 km` off the `-1,456 m` brine shore).
  2. ***White-Brine Halite & Gypsum Pans*** (proposed `salt` village, **`736,652`**, `-1,397 m`, `1.91 atm`, slope `0.026`, `XA`, `halite = 250`, `clay = 230`, `wood = 255`, `550` souls): rock-salt gallery & plaster-of-Paris works directly beside the `izani.north.dilihan` highway (`14 km` NNW of `Dilihan`).
  3. ***West-Contact Marble & Alabaster Quarry*** (proposed `mining` village, **`720,630`**, `-1,331 m`, `1.89 atm`, slope `0.032`, `XV`, `marble = 131`, `iron = 180`, `450` souls): dimension marble and translucent alabaster cut for `Dilihan` and `Jimjam` (`678 t/yr` northward flow).
  4. **D2 Rural District** (`2,800` souls): salt-tolerant shoreline hamlets growing `ashmillet`, `sandpan-fonio`, `glasswort` (burned for supplementary soda ash), `wadi-date`, `tamarisk-manna`, and `bambara`.
- **Social & Kit Blend:** Mixed Jamṭōkku–Izani pan-workers' guilds; `VERN.def` timber-and-plaster sheds over salt-glazed brick vats (`kits/resources` salt/evaporite dress + proposed `KHAMLET` `iziz` `salt` template).

#### D3 — The Upper Cut & Republican-March Uplands (`X = 701..777`, `Y = 589..654`)
- **Ground & Climate:** `8,880 km²` total (`7,928 km²` dry, `952 km²` upper Cut lake head). Rises from `-1,460 m` (`1.92 atm`) up `Rrivar airon`'s gorge and the western Republic-facing scarp to `+4,321 m` (`0.93 atm`; `median +721 m`, `1.46 atm`, `1,067 mm`, `tm 22 °C`; `Cfa 33%`, `Csa 22%`, `BSh 13%`, `Aw 7%`). `farm-eq = 3,655.2 km²`, `timber-eq = 4,691.2 km²` (richest timber in Dilihan).
- **District Lodes & Placers:** **Metallurgical heartland** — `iron = 505.5` goodY (`max 255`), `tin = 153.0` goodY (`max 200`) + **2 high-grade tin placers (`5.68`, `4.84`)**, `gold = 111.5` + **2 high-grade gold placers (`2.79`, `2.28`)**, `silver = 111.5`, `rare-earth = 75.0`, `nickel = 58.5` (`max 220`), `marble = 10.5`, `saltpeter = 8.0` (`allY 27.5`), plus `silica` (`150` at `724,602`).
- **Pins & `core/hamlet` Sites:**
  1. ***Kotgeta / Rrivar Airon Cut-Gate*** (proposed district seat, customs & placer town, **`737,604`**, `+137 m`, `1.57 atm`, slope `0.017`, `Cfa`, `farm = 1.00`, `Q = 68.1 m³/s`, `wood = 255`, `clay = 255`, `iron = 180`, `1,000` souls): sits directly at the `r865` flatten-placer (`gold 2.79`, `tin 5.68`) where the kept Izani Cut highway (`67 km` of rock-cut galleries and bridges) descends from `Jimjam` (`745,546`) and receives **`Ardent`** (`830,553`) Free-Clan bronze pack-trains.
  2. ***Airon Cassiterite & Silica Works*** (proposed `mining` village, **`732,600`**, `+227 m`, `1.56 atm`, slope `0.029`, `Cfa`, `tin = 200`, `iron = 120`, `gold/silver = 110`, `wood = 255`, `650` souls): water-wheel stamp mills on `Rrivar airon` crushing lode tin, gold-silver electrum, and optical `silica` sand.
  3. ***Aidol / Republic-Watch Toll Fort*** (proposed `fort` & seizure/assay house, **`712,628`**, `-297 m`, `1.66 atm`, slope `0.128`, `BSh`, `tin = 200`, `iron = 120`, `550` souls; with high watch-beacon at pass `708,624`, `+786 m` facing Republican `Lipp` `691,619`, `+3,565 m`, `42 km` WNW): enforces Dilihan's canon customs decree (`LORE.md:679`) — Republican ironmongery, clockwork, and arms caught crossing from `Lipp` are taxed, impounded, or sent down to `Dilihan`'s copying benches.
  4. **D3 Rural District** (`3,600` souls across ~16 canyon-bench `farming` & `lumber` hamlets): `emmer`, `helix-bean`, `mulberry`, `flax`, `hyperbamboo` harvesting, `circlelichen` gathering, `glow-mushroom` tunnel beds, and charcoal burning.
- **Social & Kit Blend:** Izani veteran-descended mountaineers, Jamṭōkku muleteers, and Free-Clan factor houses; `VERN.def` stone-plinth mountain houses (`kits/iziz-vernacular`) + rock-cut portal galleries (`biomes/cut/PLAN.md`) and water-wheel stamp sheds.

#### D4 — The Ruined Visas & Screamer-Lake March (`X = 774..816`, `Y = 646..724`)
- **Ground & Climate:** `9,760 km²` total (`5,200 km²` dry, `4,560 km²` wet = **`496 km²` open Ring Sea `lbl=126`** + `4,064 km²` Screamer-March Salt Depression `lbl=113`). Deep dense-air trough (`median -1,320 m`, **`1.89 atm`**, max **`2.002 atm`**, `784 mm` med / `2,008 mm` in SE coal forest, `tm 32 °C`; `XA 31%`, `BSh 23%`, `XS 18%`, `XV 17%`). Overlaps `Screamer Country` across almost its entire eastern flank (`Hexahedron` `817,670` lies `2 km` outside D4's NE boundary!).
- **District Lodes:** **Dilihan's domestic fuel reserve** — **`coal = 143.0` goodY (`170.5` allY, `max 215` across `1,408 km²` rich seam at `798,700..812,700`)**, `iron = 102.5`, `tin = 16.5`, `silver = 12.0`, `rare-earth = 9.5`, `saltpeter = 8.5` (`max 158`), `gold = 8.0`, `gypsum = 7.0`, `potash = 6.5`, `oil = 4.5` (`allY 21.0`, `max 148` at `814,696` — unworked Screamer wilds, plus `peat 17.5` and `amber`).
- **Pins & `core/hamlet` Sites:**
  1. **`Port Visas`** (`szn5aae96p`, existing `inhabited ruin` / `village`, **`800,712`**, `-1,458 m`, `1.92 atm`, slope `0.010`, `XV`, `4.0 km` from Ring Sea water `802,712` / `2.0 km` from dry shore `801,712`, **`1,000` souls** per `LORE.md:267`): burnt Ancient/Izani harbour moles and breached sea-wall from the Screamer sack ~120 years ago; garrisoned fisher-salvagers, signal-beacon crew, and occasional night-running League/smuggler coasters (`96 km²` inshore fishery).
  2. ***Kolkrika / Visas Coalfield Colliery*** (proposed fortified `mining` village, **`798,700`**, `-1,432 m`, `1.91 atm`, slope `0.002`, `XA`, **`coal = 211`**, `wood = 255`, `24 km` NNW of `Port Visas` and `16 km` off the kept highway spur, `600` souls): stockaded strip-and-drift colliery supplying coking coal by highway wagon convoys back to `Dilihan`'s foundries and potash kilns — **completely replacing Gemini's impossible sea-coal imports**.
  3. ***Guach-Roda / Screamer-Watch Highway Fort*** (proposed `fort`, **`780,706`**, `-1,205 m`, `1.86 atm`, slope `0.016`, `XS`, `400` souls; paired with a small `100`-man northern saltpeter/lake beacon at **`782,648`**, `+18 m`, `saltpeter = 121`): holds the southern limestone neck between the Screamer salt lake (`lbl=113`) and the `Dilihan–Port Visas` highway (`152 km`, `28 km` tunnels), screening `D1` from Screamer warbands out of the `Hexahedron` marches.
  4. **D4 Rural District** (`1,200` souls in fortified highway & coastal stockade-hamlets): `ashmillet`, `sandpan-fonio`, `taro`, `dried-reed`, `peat` cutting, and inshore salt-fish curing.
- **Social & Kit Blend:** Hard-bitten frontier militia, penal/veteran colliers, and Visas quay-scavengers; shattered `kits/port` / `kits/ancients` seawall blocks patched with `VERN.def` timber stockades and watchtowers.

---

### 3.2 Shell Province — Three Military Wards (*Guardi*)

#### S1 — Shell Arcology & Lake-Basin Garrison Core (`X = 886..924`, `Y = 646..681`)
- **Ground & Climate:** `5,616 km²` total (`5,424 km²` dry, `192 km²` **Shell's Lake `lbl=110`** at `-1,352.0 m`). Gentle dense-air amphitheatre (`-1,489 m` to `-309 m`, `median -981 m`, **`1.81 atm`** [`1.87 atm` at `Shell`], `941 mm` med [`1,694 mm` at `Shell`], `tm 31 °C`; `Aw 60%`, `XV 20%`, `BSh 10%`, `Af 3%`). `farm-eq = 3,910.8 km²` (`good >= 0.5`: `5,208 km²`), `pasture-eq = 4,197.7 km²`, `timber-eq = 3,194.2 km²`.
- **District Lodes:** `gypsum = 29.0` goodY (`max 248`), `coal = 22.5` (`allY 133.5`, `max 173`), `halite = 19.5` (`allY 44.5`, `max 239`), `potash = 15.5` (`max 223`), `alkali = 5.5` allY (`max 62`), `iron = 2.0` goodY (`allY 63.5`).
- **Pins & `core/hamlet` Sites:**
  1. **`Shell`** (`s8kenhm9vi`, existing `arcology`, **`902,659`**, `-1,240 m`, `1.87 atm`, slope `0.057`, `XA`, `wood = 255`, `coal = 151`, **`10,000` souls**): Imperial governor's citadel, garrison barracks, ordnance magazines, shaded interior hydroponic/dark-bed tiers (`alecap`, `pale-fungi`, `glow-mushroom`), and walled exterior market ring overlooking Shell's Lake (`2.0 km` W).
  2. ***Guaitpan / Shell Lake Gypsum & Salt Works*** (proposed `salt`/`mining` village, **`896,668`**, `-1,253 m`, `1.87 atm`, slope `0.040`, `XV`, **`gypsum = 248`**, `wood = 255`, adjacent to `halite = 239` at `896,674` & `potash = 223` at `888,674`, `500` souls): supplies dietary salt, plaster, and potash flux for the entire province.
  3. ***West-Lake Imperial Granary Village*** (proposed `farming` hub, **`893,659`**, `-1,115 m`, `1.84 atm`, slope `0.025`, `Af`, `1,318 mm`, **`farm = 0.87`**, `clay = 255`, `coal = 148`, `400` souls): irrigated rice, taro, ramie, and brickworks feeding the arcology garrison.
  4. **S1 Rural District** (`2,900` souls across ~14 lake-bench `farming` & `ranch` hamlets): `rice`, `bamboo-rice`, `ashmillet`, `taro`, `shade-manioc`, `glasswort`, `indigo`, `annatto`, lake fish (`151` fish score), and garrison mule/cattle herds.
- **Social & Kit Blend:** Mainland-born Izani administrators & garrison regiments, settled veteran families, and hyperjungle-edge cultivators. **Architectural kit (§5, Q4):** an intact **Ancient tiered-clamshell arcology** (`kits/ancients` new `shell` target, echoing `89c-arcoindian2` / `89h-crescent` shell ribs) ringed at its base by **`kits/pylon`** white-render-and-Iziz-orange military/civic halls (sharing `Shell`'s identity as an active post-Cataclysm Izani arcology ward) and **`kits/iziz-vernacular`** farmsteads beyond the ditch.

#### S2 — Port Goto & Eastern Beast-Rider March (`X = 900..942`, `Y = 646..716`)
- **Ground & Climate:** `8,060 km²` total (`6,340 km²` dry, `1,720 km²` wet = **`1,672 km²` open Ring Sea `lbl=126`** + `48 km²` Goto Road Salt Pan `lbl=120`). Warm monsoon-savanna coastal plain (`median -974 m`, **`1.81 atm`** [`1.92 atm` at coast], `1,035 mm`, `tm 31 °C`; `Aw 56%`, `XV 20%`, `BSh 9%`, `Am 5%`). Overlaps `Region 87` (`Beast Riders`) and the northern edge of `isle demo`. `farm-eq = 4,264.1 km²`, `timber-eq = 3,919.0 km²` (`wood = 255` across the entire coastal belt).
- **District Lodes:** **Shell's iron, shipbuilding & soda-coal corridor** — `iron = 155.0` goodY (`max 255` at `924,690..932,690` with `skarn = 200`), `coal = 50.5` goodY (`allY 161.0`, **`max 183` at `912,704`**), `potash = 20.0` (`max 218`), **`alkali`/soda = `6.0` allY (`max 70` at `926,684`, #2 on map)**, `marble = 9.0`, `tin = 8.5`, `gold = 8.5`, `silver = 8.5`, `halite = 6.0` (`allY 27.5`), `copper = 5.0`.
- **Pins & `core/hamlet` Sites:**
  1. **`Port Goto`** (`ski7uk8fjc`, existing `village` -> **upgrade to fortified `town` & snap `10.8 km` SSE from `918,698` to shoreline `920,703`**, `-1,460 m`, `1.92 atm`, slope `0.023`, `XV`, `2.0 km` from Ring Sea water `920,704`, **`2,200` souls**): walled Izani convoy harbour, naval arsenal, `Izani Dhoni` slipways, customs mole, and fortified caravan yard at the foot of the `Shell–Port Goto` road.
  2. ***Goto Coalfield & Naval Timber Yard*** (proposed `lumber`/`mining` village, **`912,704`**, `-1,473 m`, `1.92 atm`, slope `0.013`, `XA`, `4.0 km` off Ring Sea, **`wood = 255`, `coal = 183`, `clay = 255`**, `550` souls): coastal colliery and dense-hardwood ship-timber yard (`16 km` WSW of `Port Goto`), loading `ship-timber` and bunker/smithy `coal` straight onto coasters and `Shell` pack-trains.
  3. ***Xelroda / Soda-Pan & Iron-Skarn Convoy Fort*** (proposed `fort` & `mining` townlet, **`924,690`**, `-1,264 m`, `1.87 atm`, slope `0.078`, `Am`, **`iron = 255`, `skarn = 200`, `wood = 255`, `copper = 130`, `marble = 120`**, `12 km` S of `alkali = 70` soda pan `926,684`, `500` souls): halfway convoy-relay fort and bloomery smelter on the `Shell–Port Goto` road, directly guarding convoy mules against **Beast Rider** ambushes (`LORE.md:346`).
  4. ***Istguach / Crescent-Road Watch Fort*** (proposed `fort` & border-fair post, **`936,688`**, `-902 m`, `1.79 atm`, slope `0.021`, `Aw`, `farm = 0.83`, `iron = 180`, `wood = 250`, `350` souls): easternmost Imperial stockade on the lapsed `Shell–Crescent` Ancient highway (`116 km` W of ruined `Crescent` `994,694` and `142 km` W of `Pinnacle Rock` `1007,686`), serving both as early-warning beacon against Raptor/Beast-Rider raids and as the controlled truce-gate for seasonal Beast-Rider hide/mount barter.
  5. **S2 Rural District** (`2,600` souls across coastal `fishing`, `lumber`, and ditched `farming` hamlets): `ashmillet`, `sandpan-fonio`, `rope-banana` (cordage), `tobacco`, `bloodwood` / `indigo` / `annatto` dyes, and Ring Sea coastal fishing.
- **Social & Kit Blend:** Izani marines, Navigators' Guild factors from `Porta Marr`, League/Islander shipwrights (`Kierson` & `Nephtos` lies just across the strait), and truce-trading Beast Rider scouts at `Istguach`; `kits/port` stone quays + `kits/iziz-vernacular` walled harbour houses, `vern_boatyard`, `vern_sawmill`, and ditched stockade-farms.

#### S3 — Kumun Buruku Uplands & Screamer–Korona Buffer (`X = 872..942`, `Y = 585..719`)
- **Ground & Climate:** `11,516 km²` total (`11,344 km²` dry, `172 km²` wet = `108 km²` SW Ring Sea + `64 km²` SW Lagoon `lbl=127`). Spans the fertile `Kumun Buruku` (`15.4 m³/s`) and `Bitir Gulusu` (`10.0 m³/s`) valleys north to the `+3,337 m` Korona rim (`K9` `907,586` sits `2 km` outside the north boundary!) and the hydrothermal `Steampits` march southwest toward `Fort Kalor` (`863,693`) and pirate `Boiling Bay` (`866,723`). `farm-eq = 5,482.8 km²`, `pasture-eq = 7,056.9 km²`, `timber-eq = 4,417.6 km²`.
- **District Lodes & Vents:** **Brimstone, copper-silver & saltpeter march** — `iron = 390.5` goodY, **`sulfur = 173.0` goodY (`350.0` allY, `max 255` at vents `888,694` & `893,716`)**, **`copper = 65.0` goodY (`max 210`)**, **`saltpeter = 61.0` goodY (`max 196`)**, `gold = 54.5` (`max 140`), `coal = 47.0` (`allY 163.0`), `silver = 46.0` (`max 150`), `rare-earth = 23.5`, `tin = 16.0` (`max 200` at `908,626`), `nickel = 7.0`, plus `zinc` (`68.0` goodY, `max 168`) and northern `diamond` (`5.5` goodY, `max 170` at `905,599`).
- **Pins & `core/hamlet` Sites:**
  1. ***Buruku Hold*** (proposed ward seat, valley granary & `farming`/`mining` townlet, **`906,638`**, `-652 m`, `1.74 atm`, slope `0.025`, `Aw`, **`farm = 0.93`**, `Q = 15.4 m³/s`, `clay = 235`, `iron = 180`, `tin` placer `0.61` + `tin = 200` `4 km` N at `910,636`, `800` souls): irrigated river-terrace town `42 km` N of `Shell`, supplying grain, cattle, and tin-iron blooms down the `Kumun Buruku` to the arcology.
  2. ***Brimstone Vent Works*** (proposed fortified `mining` camp, **`888,694`**, `-1,375 m`, `1.90 atm`, slope `0.007`, `XV`, **`sulfur = 255`, `copper = 210`, `silver = 150`, `gold = 140`**, `550` souls): works the active hydrothermal fumarole apron (`34 km` N of Ring Sea, `46 km` ENE of `Boiling Bay`), harvesting native brimstone, blister copper, and silver-gold bullion under armed escort.
  3. ***Nortolda / Bitir Saltpeter & Silkhead-Road Gate Fort*** (proposed `fort`, customs toll & `mining` outpost, **`903,606`**, `+84 m`, `1.58 atm`, slope `0.010`, `Cfa`, `Q = 10.0 m³/s`, `farm = 0.85`, adjacent to `saltpeter = 165–196` at `894,610..888,618`, `450` souls): **[OWNER RULING — LOCKED]** guards the southern mountain gate of the **tentative, poorly maintained Imperial trade highway running `~470 km` due north from `Shell` (`902,659` -> `Buruku Hold` `906,638` -> `Nortolda` `903,606`) past western `Korona` villages (`K9` `907,586` -> `K10` `912,556` -> `K2` `909,499`) to `Silkhead` (`932,425`, the Korona Gateway)**! Caravans brave Painted-Men/Korona hazards along this cracked old Imperial trace to bring `Silkhead` / `Spider Lake` `spider-silk`, `orchil`, and Outland/Coyote trade down to `Shell` & `Port Goto` in exchange for Imperial salt, tools, glass, and Marr rum.
  4. ***Kalor-Way Watchtower*** (proposed `fort`, **`880,684`**, `-1,324 m`, `1.89 atm`, slope `0.009`, `XV`, `coal = 91`, `300` souls): bars the lapsed `Fort Kalor–Shell` Ancient highway (`38 km` ENE of ruined `Fort Kalor` `863,693`) against Screamer packs.
  5. **S3 Rural District** (`2,000` souls, concentrated in the `Kumun Buruku` valley): river-irrigated `rice`, `emmer`, `helix-bean`, `cotton`, cattle/mule ranching (`pasture-eq 7,057 km²`), and charcoal/mule-relay stations along the `Shell -> Silkhead` road.
- **Social & Kit Blend:** Assimilated Scyvoi-substrate river farmers under Izani military-settler landlords (`limitanei`), caravan muleteers on the `Silkhead` trace, plus stockaded fumarole miners; `VERN.def` courtyard farm-forts and stone watchtowers.

### 3.3 Required `core/hamlet` Wiring (`core/hamlet/21-hamlet-iziz.js`)

Inspection of `core/hamlet/21-hamlet-iziz.js` (`KHAMLET.CULTURES.iziz`) shows that only **`farming`** and **`ranch`** village templates are currently wired (and `vern_shrine` is marked pending), whereas `kits/iziz-vernacular/src/74z-vern-trades.js` already defines the full vernacular trade piece set! Before placing Dilihan and Shell on an open-world map cut, `21-hamlet-iziz.js` should wire the four missing `KHAMLET` kinds using existing `VERN.def` pieces:
- **`mining`**: `vern_mine`, `vern_quarry`, `vern_smelter`, `vern_foundry`, `vern_kiln` (for `762,662`, `720,630`, `732,600`, `798,700`, `924,690`, `888,694`);
- **`salt`**: solar brine pans + `vern_kiln` + `vern_warehouse` (for `729,641`, `736,652`, `896,668`);
- **`lumber`**: `vern_sawmill`, `vern_carpenter`, `vern_charcoal` (for `912,704` and `D3` canyon camps);
- **`fishing`**: `vern_fish_landing`, `vern_boatyard`, `vern_ropewalk`, `vern_sailmaker` (for `Port Goto` `920,703`, `Port Visas` `800,712`, and `S2` coves);
- **`iziz-dilihan` sub-palette** (optional): swaps `1 in 4` rural/town `VERN.def` masonry slots for Jamṭōkku fired-brick dress where `JJ` is bundled.

---

## 4. Demography, Carrying Capacity, Sim Schema & Lifeline Logistics

### 4.1 Reconciling the Census vs. Gemini (`populations-gemini.json`)

As in Xanadu (`PROPOSAL-XANADU.md` §1, where Gemini inflated the Sultanate `10×` to `465,300`), Gemini applied a `14.54×` multiplier to `Dilihan Province` (`9,000` -> **`130,830`**) and a `7.38×` multiplier to `Shell Province` (`11,100` -> **`81,970`**). Both exclaves are canonically **cut-off or frontier colonial enclaves** hemmed in by `Screamer Country`, `Region 87` Beast Riders, and the `Iron Republic` — not quarter-million-soul river empires.

| Settlement / Group | Repo Pin Census (`TRADE-GOODS.md`) | Gemini (`populations-gemini.json`) | Lore & Blueprint Anchor | **Proposed Sim Census** |
|---|---:|---:|---|---:|
| **`Dilihan`** (`solqo7hz7s`, `744,663`) | `8,000` | `30,000` (`15k × 2.0`) | Major Cut entrepôt & council city (`settlements/dilihan/PLAN.md`) | **`12,000`** |
| **`Port Visas`** (`szn5aae96p`, `800,712`) | `1,000` | `1,150` (`1k × 1.15`) | **Hard canon: `~1,000`** survivors in sacked port (`LORE.md:267`) | **`1,000`** |
| **Dilihan Named District Seats, Works & Forts** (`9` sites across `D1`–`D4`) | *none* | *none* | Potash works (`1,100`), Cut-Gate (`1,000`), Visas coal (`600`), 6 mines/forts (`2,700`) | **`5,400`** |
| **Dilihan Rural Districts (`D1`–`D4`)** | *none* | `99,680` (`3.2×` urban) | Security-constrained to karst bench, salt-lake rim & Cut terraces (`~1.0×` named) | **`13,600`** |
| **`Dilihan Province` Total** | **`9,000`** | **`130,830`** | *Autonomous veteran-council exclave* | **`32,000`** |
| **`Shell`** (`s8kenhm9vi`, `902,659`) | `10,000` | `26,400` (`12k × 2.2`) | Active tiered arcology + garrison depot | **`10,000`** |
| **`Port Goto`** (`ski7uk8fjc`, `920,703`) | `1,100` | `2,875` (`2.5k × 1.15`) | Fortified naval convoy port & `Dhoni` shipyard | **`2,200`** |
| **Shell Named Forts, Mines & Granaries** (`7` sites across `S1`–`S3`) | *none* | *none* | `Buruku Hold` (`800`), `Goto Coal/Timber` (`550`), `Brimstone Vent` (`550`), 4 forts/pans (`1,700`) | **`3,600`** |
| **Shell Rural Districts (`S1`–`S3`)** | *none* | `52,695` (`1.8×` urban) | Concentrated around `Shell`'s lake, `Kumun Buruku`, and ditched `Goto` coast | **`8,200`** |
| **`Shell Province` Total** | **`11,100`** | **`81,970`** | *Direct Imperial garrison & convoy province* | **`24,000`** |

- **Sim Actor Budget on `core/region/50-region-valley.js`:** With `scale: 100` on the seven rural districts (`218` rural actors) or `scale: 200` (`109` rural actors), plus the `20` named towns/works/forts, **both exclaves combined run in ~160–240 sim actors** — well inside `PROPOSAL-XANADU.md`'s 472-actor, 50-second annual tick budget.

### 4.2 Food, Salt & Fuel Carrying Capacity

- **Food Self-Sufficiency (Ample Surplus in Both Exclaves):** At Krator's standard `160 kg/person/yr` grain/tuber demand (`~0.075 ha/person` on rainfed/irrigated dense-air double-cropped rice, bamboo-rice, ashmillet, and taro), `32,000` people in Dilihan require **`5,120 t/yr` (`24.0 km²` tilled)** out of **`13,826.6 km²` `farm-eq`** (`0.17%` utilization), and `24,000` people in Shell require **`3,840 t/yr` (`18.0 km²` tilled)** out of **`13,657.7 km²` `farm-eq`** (`0.13%` utilization). Even under Beast Rider or Screamer raids that burn exposed outlying fields, `D1`/`D3` in Dilihan and `S1`/`S3` in Shell feed their garrisons locally without importing bulk grain by sea.
- **Salt Split (`TRADE-SCOPE.md`):** Both exclaves sit on giant rock-salt & salt-lake evaporite beds (`D2` `halite 34.5` goodY + `3,152 km²` salt lake; `S1`/`S2` `halite 25.5` goodY + `1,780 km²` Ring Sea), making both **net exporters of dietary `salt`, chemical `potash`, and `gypsum`**, never salt-short like Xanadu.
- **Fuel Balance:** `D4`'s `Visas Coalfield` (`798,700`, `coal = 211`, `143.0` goodY) + `D3` Cut charcoal make Dilihan 100% self-sufficient in metallurgical fuel; `S2`'s `Goto Coalfield` (`912,704`, `coal = 183`) + `S1` lake-bench coal (`173`) make Shell a net Ring Sea **coal & ship-timber exporter**.

### 4.3 Audit & Reconciliation of Gemini's Trade & Fleet Draft (`TRADE-GEMINI.md`)

Gemini's gravity solver produced four major canon/data contradictions on the northern exclaves that must be corrected before wiring `core/region` trade routes:

| # | Gemini Draft Artefact (`trade-gemini.json` / `trade-fleets-gemini.json`) | Canon & Scale Model 5.1 Reality | **Sim-Layer Correction** |
|---:|---|---|---|
| **1** | **The `Port Visas` Paradox:** Gemini marked `Dilihan Province` `"Landlocked / 0 Sea Ships"`, yet simultaneously routed **`26.1` Izani sea ships (`1,033 t` coal from `Marr` + `404 t` from `Port Tobin`)** and `3.6` ships from `Port Goto` into `Port Visas` (`2,244 t-eq`), plus **`5,196 t`** on an `"Iziz-Guarded Visas Corridor"`! | Screamers sacked `Port Visas` ~120 yrs ago, **cutting off sea trade with Iziz** (`LORE.md:208, 540`); `1,000` survivors hold ruined quays inside the `Screamer Country` overlap; and Dilihan already owns **`1,408 km²` of rich coal in `D4` (`798,700`)**! | **Close `Port Visas` to mainland Izani bulk fleets.** Source Dilihan's coal domestically from `D4` (`798,700 -> Dilihan`, `115 km` kept highway). Keep `Port Visas` as a `1,000`-soul fortified ruin-quay with local fishing/salvage + optional 1-boat covert League/smuggler packet (`Ys`/`Tethis`). |
| **2** | **Dilihan–Iziz Envoy & Luxury Link:** Missing as an explicit treaty relay because `Port Visas` absorbed sea flows. | *"Since the alliance warmed, envoys cross the League's land and sea to Hook"* (`LORE.md:539`); sibling Marr blueprint places the Navigators' Guild & ocean fleets at **`Porta Marr` (`926,1014`)**. | Route Dilihan's Imperial letters, confirmation gifts, `silver`, `potash`, `relics`, and copied Republican `optics`/`tools` south through **`D1` Karst Gate (`760,708`) -> League `Limnaia` (`736,712`) -> `Trigon` (`722,740`) / `Ys` (`788,741`) / `Tethis` (`733,775`) -> sea to `Hook` (`809,923`) & `Porta Marr` (`926,1014`)**. |
| **3** | **Illegal Ring-Isles Crops in `Shell Province`:** Gemini made `sugar` (`313.6 t`), `coffee` (`49.0 t`), `rum` (`48.7 t`), and `spice-tropical` (`29.3 t`) four of Shell's top exports! | Violates **`TRADE-SCOPE.md` §2.5 native-seed rules**: `sugar-cane` (hence `rum`) and `clove` (`isle-spice`) belong exclusively to the Ring Isles (`Kautoa`, `West Ring Isles`, `isle-demo`), and `coffee` to southern highlands. | **Drop `sugar`, `rum`, `coffee`, and `spice-tropical` from Shell's production.** Replace with Shell's real 5.1 surpluses: **`ship-timber`**, **`coal`**, **vent `sulfur`** (`888,694`), **`potash` / `halite` / `alkali` (soda)**, **`copper` / `silver`**, **`tobacco` / `cigars`**, **`rope-banana` cordage**, and **`bloodwood` / `indigo` / `annatto` dyes**. |
| **4** | **`Port Goto` Excluded from Road/Sea Graph (`net51-gemini.json`):** `Port Goto` (`918,698`) had `sea_km2 = 0` and `polity = null` in `resources-settlements.json` and was dropped from `net51`! | Caused by the `10.8 km` inland pin offset (§2.2). Meanwhile `trade-fleets-gemini.json` rightly assigned Shell **`14` `Izani Dhoni` coasters (`12 t`)** under Izani naval escort, with `Noa's Regret` / `Boiling Bay` (`866,723`) piracy skimming `ship-timber`, `coal`, and `potash`. | Snap `Port Goto` to **`920,703`** (`polity: "Shell Province"`), wire the `~96 km` kept convoy road `Shell <-> Xelroda (924,690) <-> Port Goto (920,703)`, and run Shell's **14-hull `Izani Dhoni` convoy** to `Porta Marr` (`634 km`), `Port Tobin` (`516 km`), `Hook`, and League `Tethis` (`424 km`). |

### 4.4 Institutional & Trade Mechanics on `core/simulation`

1. **Dilihan's Cut Alliance & Republican Reverse-Engineering Loop (`D1` + `D3`):**
   - **Northward Cut Corridor (`Dilihan <-> Kotgeta 737,604 <-> Jimjam 745,546 <-> Ardent 830,553`):** Wagon and mule convoys haul `D2` **`potash`**, **`halite`**, **`gypsum`**, and **`marble`**, plus `D1` **`tin`** and **`silver`**, up the `246 km` (`67 km` tunnelled) Izani Cut highway to `Jimjam` and `Ardent`, returning with Free-Clan **`bronze`**, highland **`wool`/`hides`**, and Jamṭōkku **`tea`/`ceramics`**.
   - **Western Republic-March Seizure & "Quiet Copying" (`Aidol 712,628 -> Dilihan 744,663`):** Transiting `Iron Republic` caravans from `Lipp` (`691,619`) pay a heavy border tariff or suffer seizure at `Aidol`; `Dilihan`'s guild workshops run a licensed *"Reverse-Engineered Republican Pattern"* recipe (`bronze` / `iron` + `D3` `silica` + `D4` `coal` -> `tools`, `weapons`, `optics` / `clockwork`), supplying the northern Cut without enriching `Roketstad`.
   - **Fiscal Autonomy (`SIM.transfer`):** Unlike mainland provinces, Dilihan sends **zero tax coin** to `Iziz`; once a year the Veterans' Council dispatches a symbolic **Confirmation Gift** (`1` chest of `silver` + `relics` / `optics`) via League `Ys`/`Hook` to `Iziz` in exchange for the sealed Imperial patent confirming the council's governor.

2. **Shell's Imperial Convoy, Garrison Stipend & Frontier Friction (`S1` + `S2` + `S3`):**
   - **Imperial Stipend vs. Strategic Shipments (`SIM.transfer` + Convoy):** Mainland `Iziz` (via `Porta Marr` & `Port Tobin`) pays an annual **Frontier Garrison Grant** (`coin`, `armor`, `weapons`, `cloth`, `almanacs`, and Ring-Isles `ranjrum` / `sugar` re-exported from `Marr`/`Nephtos`) to `Shell`'s military chest, while `Port Goto`'s 14 `Izani Dhoni` coasters ship back **`ship-timber`** (vital for `Porta Marr` & `Hook` naval yards), **vent `sulfur`** (`888,694`), **`potash`**, **`alkali` (soda)**, **`coal`**, and **`tobacco`**.
   - **Piracy & Raid Events (`X5` event hooks):**
     - *Sea:* Raiders out of **`Boiling Bay`** (`866,723`, just `112 km` WSW of `Port Goto` along the Steampits coast!) and **`Noa's Regret`** prey on unescorted `Port Goto` coasters (`~8–12%` attrition when naval escort from `Porta Marr` / `Hook` dips).
     - *Land:* **Beast Rider** bands from `Pinnacle Rock` (`1007,686`) alternate between raiding `Xelroda` (`924,690`) convoys along the `Shell–Port Goto` road and bartering `mounts`, `monster-hides`, and `resins` for `forged-blades`, `salt`, and `cloth` at `Istguach` (`936,688`) during truce moons.

---

## 5. Key Open Choices for the Owner

1. **Izani Names for `Shell`, `Port Goto` & the Seven Sub-Provinces (`LORE.md:1242`):**
   - `LORE.md:1242` flags `Shell` and `Port Goto` as English/placeholder pins awaiting Izani forms. Checked through `tools/names/izani.py`:
     - **`Shell` (`902,659`):** Keep English *"Shell"* as the common gloss of an Izani official name — **(Recommended)** **`Xelsidi`** (`Sel+siti`, *"Shell-City"*) or **`Tirxel`** (`tir+Sel`, *"Tier-Shell"*), or keep plain **`Shell`** on the map and use `Xelsidi` in Izani court/sim text?
     - **`Port Goto` (`920,703`):** Reinterpret *"Goto"* as Izani **`Porta Godu`** (`gou+tu`) or **`Getporta`** (`geit+port`, *"Gate-Port"*), or keep **`Port Goto`** on the pin?
     - **Dilihan District Names:** Use Jamṭōkku-inflected northern Izani compounds (`Kmandariatz Dellu`, `Salpan Dellu`, `Kotgeta`, `Guach-Visas`), or pure Jamṭōkku survivals?

2. **Snapping `Port Goto` (`ski7uk8fjc`) `10.8 km` SSE to the Ring Sea Shoreline (`920,703`):**
   - **(Recommended)** Move `Port Goto` in `60-settlements.js` from inland `918,698` (`12.6 km` from Ring Sea water -> `sea_km2 = 0`, `excluded.ports` in `net51`) to **`920,703`** (`-1,460 m`, `2.0 km` from open Ring Sea `lbl=126`), tag `polity: "Shell Province"`, and upgrade its stage from `village` (`1,100`) to fortified convoy `town` (`2,200`). *(Companion cleanup: mainland `Port Tobin` currently has two pins in `60-settlements.js` — `skwl1d2hdu` `"Port Tobin"` at `932,973` and `s06eu913kl` `"Port  Tobin"` [double space] at `956,943` — for the mainland session to deduplicate.)*

3. **`Port Visas` (`800,712`) Current Status & Sea-Trade Rule:**
   - **(Recommended — Lore-Strict):** Keep `Port Visas` as a **`1,000`-soul fortified `inhabited ruin`** (`LORE.md:267`), **zero mainland Izani bulk colliers** (sourcing Dilihan's coal from `D4`'s `798,700` seam `24 km` NNW), and route Dilihan's diplomatic/luxury sea contact across the **Hykkousoi League** (`Limnaia` -> `Trigon`/`Ys`/`Tethis` -> `Hook`/`Porta Marr`), allowing at most a single small covert League/smuggler coaster (`<= 50 t/yr`) into Visas's ruined mole.
   - *Alternative:* Treat `Port Visas` as partially resettled (`~2,500` souls) with armed Izani blockade-runners braving the Screamer coast.

4. **`Shell` (`902,659`) Arcology Target & Architectural Kit Blend:**
   - **(Recommended):** Author `Shell` as a **tiered-clamshell `kits/ancients` target (`shell`)** overhanging the `-1,352 m` lake bench, ringed by **`kits/pylon`** white-render-and-Iziz-orange garrison/civic halls (sharing `settlements/iziz/VASSAL-KITS.md` as Iziz's second live arcology city beside `Pylon`) and **`kits/iziz-vernacular`** rural compounds.
   - *Alternative:* Dress `Shell`'s exterior town purely in `kits/iziz-vernacular` (keeping `kits/pylon` exclusive to the `Pylon` monolith).

5. **Dilihan's Republican Tech-Seizure & "Quiet Copy" Workshop Mechanics in `core/simulation`:**
   - **(Recommended):** Represent `LORE.md:679` with two explicit sim rules: (a) a border toll/confiscation share at **`Aidol` (`712,628`)** on any `Iron Republic` (`Lipp`) goods entering `D3`, and (b) licensed workshop recipes in **`Dilihan` (`744,663`)** that consume Free-Clan `bronze` (from `Ardent`) + local `D1`/`D3` `iron`, `silica`, and `D4` `coal` to craft *"Dilihan-copy"* `tools`, `weapons`, and `optics` without Republican trade licences.

6. **Population Scale (`32,000` Dilihan / `24,000` Shell vs. Higher Macro Totals):**
   - **(Recommended):** Adopt **`32,000` for `Dilihan Province`** (`Dilihan` `12,000`, `Port Visas` `1,000`, `9` district seats/mines/forts `5,400`, rural `13,600`) and **`24,000` for `Shell Province`** (`Shell` `10,000`, `Port Goto` `2,200`, `7` forts/works `3,600`, rural `8,200`), counted once with `scale: 100` on rural districts (no hidden Gemini `14.5×` / `7.4×` multipliers).
   - *Alternative:* Scale rural districts `~2.5×` higher (`~65,000` Dilihan / `~45,000` Shell) if denser open-world countryside traffic is desired on the northern rim.

7. **Open-World Region Cuts (`openworld/PLAN-SITES.md`) & `core/hamlet/21-hamlet-iziz.js` Expansion:**
   - Should **`Dilihan + The Cut + Jimjam`** (`X = 700..820, Y = 540..725`) and **`Shell + Port Goto + Northern Isle-Demo Rim`** (`X = 860..1010, Y = 635..740`, bridging `Shell`, `Port Goto`, `Boiling Bay`, `Kierson`, `Crescent`, and `Pinnacle Rock`) be scoped as two separate `openworld/<region>` cuts, and may we proceed with wiring `mining`, `salt`, `lumber`, and `fishing` into `core/hamlet/21-hamlet-iziz.js`?
