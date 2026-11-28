# ricochetpeaks: the plan — The Ricochet Peaks Boreal Crater-Archipelago (proposal & build-ready design, 2026-11-27)

**Ricochet Peaks** (Scale Model `5.1` biome polygon **`Ricochet Peaks`**, id **`rmwvsvyf1iqzg`**, px `1097–1594 × 1410–1643`, **`251,564 km²`**): the jagged, `9–15.5 km`-tall southern cordillera walling off the **`Yuni Emirate`** (`rmw8ca6baau47`, `Y = 913..1502`), **`The Catch`**, and **`Siphon Pits`** on the north from **`Oidong Valley` (`Longsong`)**, **`High Rift`**, and **`The Twins`** on the south.

Its name comes from a **catastrophic grazing secondary-ejecta swarm**: during the main impact, a cluster of mountain-sized blocks skipped at a shallow oblique angle across this massif like cannonballs across water, gouging a **chain of overlapping, elliptical "ricochet" craters** (`10–36 km` across, complete with central rebound peaks, melt-breccia sheets, and breached rim-notches) deep into the otherwise airless `10–15 km` peaks.

### Why `edit_533` Needed Tuning — From Freezing `5.5 km` `ET` Bowls to a Habitable `Dfc`/`Dfb` Boreal Frontier
In `edit_533_ricochet_craters.py` (`2026-11-25`), only `4` craters were added (`West` `5,400 m`, `North` `5,800 m`, `South` `5,600 m`, `East` `5,282 m` + `old` `6,900 m`), connected by `6,300–7,000 m` cols. At `5.3–5.8 km`, air stood near `0.76 atm`, rainfall averaged `93 mm`, and **`99%` of the unheated floors stayed freezing `ET`/`EF` tundra** (`Dfc` was `0.3%` — just `137` hydrothermal cells in `East` crater!).

Per the owner's `2026-11-27` direction (*"ricochet peaks needs more craters and have them tuned so there is a cold but habitable boreal climate; this will be a wild area full of bandits and a few pioneering yuni settlers"*), this plan specifies:
1. **A `12`-Crater Ricochet Swarm Tuned to the Habitable Boreal Band (`+2,650–+3,650 m`, `0.98–1.16 atm`, `Dfc`/`Dfb`):** Sinking `8` primary habitable crater bowls (including deepened `West`, `North`, `South`, `East` + `4` new Yuni-border, Central-Doublet, Oidong-Gate, and Siphon-Step bowls) to **`+2,650–+3,650 m`** (plus `4` higher `+4,100–+5,100 m` satellite/cryofumarole bowls), with winding **breach-notch passes lowered to `+3,750–+4,550 m`** into the **Yuni Emirate** (`north`), **Oidong Valley** (`SW`), **High Rift** (`SE`), and **Siphon Pits** (`NE`).
2. **Self-Watering Orographic Crater-Lakes (`550–950 mm/yr` effective basin catch):** Towering `5–9 km` crater walls intercept high-altitude westerly/rift moisture as snow, avalanching and melting down radial chutes into **clear sapphire crater-floor lakes (`WH`), central-peak spruce-larch islands, and eastern `High Rift`-warmed hydrothermal hot-spring oases** — yielding **`tw = +13..+19 °C`, `tc = -7..-14 °C`, genuine `Dfc`/`Dfb` boreal taiga**!
3. **Lawless Bandit Strongholds & Pioneering Yuni Homesteaders:** Every crater is a hidden, `3–6 km`-walled bowl entered through a `150–300 m` rock notch that twenty men can hold against an army — making Ricochet Peaks a **notorious outlaw sanctuary** (caravan-raiders, Catch/Stalker smugglers, tax-flight exiles) alongside **hardy pioneering Yuni settlers** pushing south from the dry Emirate to log straight boreal timber, pan impact-nickel/gold, bathe in hot springs, and adapt Yuni's curved adobe-and-mosaic architecture to steep snow-shedding shingle roofs!

Status: **Build-ready biome & scale-model tuning plan** aligned with `edit_533_ricochet_craters.py`, [kits/yuni/README.md](../../kits/yuni/README.md), [biomes/highrift](../highrift/), and [biomes/oidong](../oidong/).

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/ricochetpeaks/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmwvsvyf1iqzg`** (*Ricochet Peaks*, `kind: "biome"`): **`251,564 km²`** (`X = 1097..1594, Y = 1410..1643`), tuned from `5` high `ET` pockets to a **`12`-crater boreal archipelago** (`~18,500 km²` of habitable `Dfc`/`Dfb` crater floors & lakes threaded through `9–15.5 km` `EF`/`O` peaks) |
| **Pages (`5` Stations)** | `dist/ricochetpeaks.html` (**Station 1 `ringlake`**: *Central-Peak Crater Lake, Shatter-Cone Taiga & Yuni Pioneer Clearing* at px `1258, 1478`, `+2,850 m`), `--station notch` (*Skipper's Notch — Overlapping Doublet Breach & Bandit Toll-Eyrie* at px `1318, 1506`, `+3,580 m`), `--station vents` (*East Crater Cryofumarole Rim & Hot-Spring Boreal Oasis* at px `1450, 1558`, `+2,720 m`), `--station glasssheet` (*Shocked Impact-Melt Floor, Sueva-Pine Barrens & Nickel Placer Creek* at px `1182, 1512`, `+3,180 m`), and `--station highbowl` (*Old `5,100 m` Erebus Steam-Ice Satellite Crater* at px `1375, 1525`) |
| **Objects** | **`RICOCHET_PHYS`** (`[G data]` in `src/15-ricochet-phys.js`: oblique elliptical crater-bowl + central rebound peak + uprange/downrange ejecta-ray math, wall-snowmelt water harvest, cold-air pooling vs. hydrothermal ground warmth `heatAt`, shatter-cone radial strike, and breach-notch wind venturi; tested by `tests/test-ricochet-phys.js` on `tools/ktest.js`) and **`RICOCHET`** (`BIO.kit('ricochetpeaks')`) |
| **Read in place (`BIO.kin`)** | **`biomes/nwouterwall` & `biomes/nhighlands`** (`fur larch`, `great spruce`, `birch`, `ivan-chai` fireweed, `silverthorn`, `creeping stone pine` adapted to dark impact-melt breccia); **`biomes/oidong` & `biomes/highrift`** (`rift larch` and high-country cold herbs on the southern passes); **`biomes/geyser`** (hot-spring temperature-banded microbial mats & sinter on `--station vents`) |
| **Out of scope** | Full **Yuni pioneer farmsteads** (`kits/yuni` + snow-roof frontier kit) and **Bandit notch-forts / camps** (`core/camp`, `core/hamlet`) — published here as clean `core/tags` `site:yuni-pioneer-*` and `site:ricochet-bandit-*` reserves (with optional `?works=0` Yuni mosaic boundary-shrine cairns and bandit log-chevaux/watch-platforms tagged `class: 'furniture'`) |

---

## 1. Core adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

| Module | Fragments / Path | What `biomes/ricochetpeaks` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('ricochetpeaks')`; `31j` `BIO.flareJoin` on heavy snow-loaded spruce/larch boughs; `32` `BIO.kin` reading `nwouterwall`, `nhighlands`, `highrift`, `geyser`; `33` `BIO.fung` for hydrothermal sinter mats & shocked-glass crustose lichens; `34` impostors on dense crater-floor spruce-larch rings; `35`/`39` notch-venturi wind lean |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers crater bowls, central rebound peaks, melt-breccia benches, sinter terraces, and breach-notches for `SURVEY` eye-clearance audits (item 28) |
| **`core/rand`**, **`core/tags`**, **`core/space`** | `KRAND` (`08`), `KTAGS` (`50/52/53`), `KSPACE` (`20`) | Deterministic seeding, pre-draw registration of all flora, vents, shatter-cone tors, nickel/impact-glass outcrops, `KHAZ` hazards, and `site:yuni-pioneer-*` / `site:ricochet-bandit-*` reserves |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `36-core-carve.js` (`KCARVE`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` + `38c-core-landforms.js` (`KRELIEF`, `KBASIN`), `42-core-frost.js` (`KFROST`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` **`secondary-ejecta` / `suevite` impact-melt breccia** with radial **shatter-cone** striations and black **impact-glass (`tagamite`)** veins; `KSTACKS` central rebound peak tors, Erebus fumarole **steam-ice towers** (`highbowl`), and jagged crater-rim needles; `KRELIEF` crater-wall avalanche fans & breached septum notches; `KGROUND` (`<= 4` layers: spruce-needle/lichen duff, black suevite impact-glass gravel, pale hydrothermal sinter, snow); `KFAR` (`8–14 km` towering crater ring-wall!) + `KHORIZON` (dramatic crater-wall ring-shadow!) |
| **`core/water`** | `20`, `21`, `22`, `50`, `51`, **`geyser/52` + draw (`WATER.spring`)**, **`ext/53` + draw (sinter)**, **`ext/54` + draw (`WATER.ice`)**, `ext/57` | `WATER.open` for annular **moat-lakes circling central rebound peaks** (`ringlake`); `WATER.spring` + sinter terraces (`ext/53`) for East Crater's hydrothermal oasis (`vents`); `WATER.ice` (`ext/54`) on `highbowl`; `WATER.flow` for snowmelt wall-cascades (`water-mouths` compliant!) |
| **`core/atmos`** | `0-core`, `0p-presets`, `3-particles`, `4-weather` (`snow:true`), `8-export`, `9-host`, `a-waves`, `b-skylight`, `sky/e,f,g,j`, `host/c,e,h,i,j`, **`fx/89-atmos-fx-snowcover.js`** (`snowBare` over hydrothermal heat!), **`fx/89-atmos-fx-katabatic.js`**, **`fx/89-atmos-fx-slopewind.js`** | Cold crisp crater-basin lightringed by towering `10–14 km` snow-peaks (`KHORIZON` early dusk inside the bowl!), dawn inversion mist (`fogPool`) trapped inside each crater cup, steaming fumarole plumes (`3-particles`), `snowBare` melting snow cleanly around warm vents |
| **`core/hazard`** | `20/21-core-hazard*.js` (`KHAZ`) | `ricochet:coldpool` (nighttime `-20 °C` katabatic cold-air drainage pooling at crater bottoms), `ricochet:bandit_notch` (`trap` / ambush bottleneck warning in narrow inter-crater breaches), `ricochet:scald` & `ricochet:co2` (`heat` & `gas` in `vents` & `highbowl` fumarole hollows), and `ricochet:rim_hypoxia` (`< 0.60 atm` above `+5,800 m` on the outer crater rims!) |
| **`core/materials`**, **`core/shadow`**, **`core/host`**, **`core/export`** | `KMAT` (`< 15` samplers), `KSHADOW` (off at load), `khost.FULL`, `07`/`09` | Standard PBR pack, host chrome, `krator-world` export |
| **`kits/crops`**, **`kits/fauna`**, **`kits/resources`** | Read in place (`[G data]`) | `CROPS.BIOMES.ricochetpeaks` (`cratertaiga`, `thermalfloor`, `suevitebarren`, `rimtundra`: hardy Yuni pioneer **rye, barley, turnip, potato**, wild **lingonberry, cloudberry, pine-nut, birch-sap, fireweed-tea**, and **hot-spring greenhouse herbs**!); `6` crater-island fauna species; meteoritic **`nickel` / `iron` / `gold` / `impact-glass`** nodes |

---

## 2. Scale-Model `5.1` Ricochet-Crater Swarm & Boreal Tuning Specification (Proposed `edit_538`)

### 2.1 Geological Mechanism: Oblique Skipping-Stone Impact Chain (`WNW -> ESE` Grazing Trajectory)
A cluster of secondary blocks ejected at `< 12°` grazing incidence struck along a curved `WNW -> ESE` arc (`px 1135,1475 -> 1525,1565`), producing **elliptical bowls (`aspect 1.15–1.45`)**, **overlapping doublet/triplet "peanut" craters** separated by low breached septum walls, **central rebound peaks** (`+180–+420 m` above the moat lake!), and **dark suevite impact-melt sheets** rich in meteoritic iron-nickel and black glass.

### 2.2 The `12` Proposed Craters & Pass Network (`edit_538` replacing/deepening `edit_533`)

| # | Crater Name | `5.1` Centre | Size (`km`) | Tuned Floor (`m`) | Air & Temps (`tw / tc`) | Climate & Water / Feature | Human / Frontier Role |
|---:|---|---|---|---:|---|---|---|
| **1** | **Yuni-Gate Crater** *(new)* | `1248, 1456` | `26 × 20` | **`+2,780 m`** | `1.14 atm`, `+17 / -7 °C` | **`Dfb`/`Dfc`**, `48 km²` moat-lake; `+3,750 m` N breach directly to **Yuni Emirate**! | **First Yuni Pioneer Settlement** (sawmill, rye benches, mud-and-shingle village) |
| **2** | **Skipper's Doublet W** *(new)* | `1298, 1482` | `24 × 18` | **`+2,920 m`** | `1.12 atm`, `+16 / -8 °C` | **`Dfc`**, central rebound peak (`+3,240 m`) in annular lake | Shares breached septum (`Skipper's Notch`, `+3,580 m`) with **Crater 3** |
| **3** | **North Crater** *(deepened `533`)* | `1295, 1515` | `30 × 26` | **`+3,050 m`** *(was `5,800`)* | `1.10 atm`, `+15 / -9 °C` | **`Dfc`** spruce-larch taiga & beaver fens | **Main Bandit Crossroads** controlling N-S & E-W breaches |
| **4** | **Glass-Pan Crater** *(new)* | `1178, 1506` | `22 × 16` | **`+3,180 m`** | `1.08 atm`, `+14 / -10 °C` | **`Dfc`**, black `tagamite` impact-glass floor & nickel creek | Yuni Geomancer/prospector **meteoric-iron & glass works** |
| **5** | **West Crater** *(deepened `533`)* | `1215, 1535` | `32 × 28` | **`+2,880 m`** *(was `5,400`)* | `1.12 atm`, `+16 / -8 °C` | **`Dfc`/`Dfb`**, `64 km²` deep crater lake; `+3,950 m` SW pass toward **Oidong / Longsong** | Smuggler haven trading contraband between Yuni & Oidong outskirts |
| **6** | **South / Monk's-Look** *(deepened `533`)* | `1335, 1592` | `28 × 24` | **`+3,150 m`** *(was `5,600`)* | `1.08 atm`, `+15 / -9 °C` | **`Dfc`** larch-birch bowl above Oidong/High Rift divide | Hidden outlaw horse-and-yak pasture |
| **7** | **Kettle-Chain Doublet** *(new)* | `1398, 1488` | `28 × 19` | **`+3,280 m`** | `1.06 atm`, `+14 / -11 °C` | **`Dfc`**, twin connected boreal lakes; N pass toward **Stalker Gate / Yuni** | Fur-trappers' & timber-floaters' boom camp |
| **8** | **East Hearth Crater** *(deepened `533`)* | `1450, 1558` | `34 × 30` | **`+2,720 m`** *(was `5,282`)* | `1.15 atm`, **`+18 / -3 °C`** *(+`13 °C` vent heat!)* | **`Dfb` / warm `Dfc`**, `6` fumaroles, steaming turquoise hot-spring lake & sinter terraces | **Coveted Winter Refuge**: Yuni pioneer bath-village & rival bandit fort across the hot lake! |
| **9** | **Siphon-Lip Crater** *(new)* | `1518, 1512` | `22 × 18` | **`+3,480 m`** | `1.03 atm`, `+12 / -13 °C` | **`Dfc`** upper taiga; `+4,250 m` NE notch toward **Siphon Pits** | Outlaw toll-gate on the Siphon smuggling track |
| **10–12** | **Old Ice Tarn (`1375,1525`) + Two Perched Rim Bowls** | `1375,1525`, `1142,1558`, `1488,1592` | `12–20` | **`+4,600–+5,250 m`** | `0.80–0.87 atm`, `+4 / -19 °C` | **`ET` / cryofumarole** (`Erebus` steam-ice towers on `1375,1525`) | High alpine refuge & ice-cave hideouts above the boreal bowls |

**Orographic Rain & Snow-Trap Rule (`edit_538`):** Even where regional exterior winds carry only `150–300 mm`, a `30 km`-wide bowl sunk `5,000 m` below `8–12 km` rims intercepts blowing snow and high cloud over a `3×` wider rim catchment and funnels `100%` of that meltwater onto the flat crater floor (`effective floor moisture = 550–900 mm/yr`), feeding permanent `WH` crater lakes and dense **`Dfc`/`Dfb` boreal forest**!

---

## 3. Stations (`5` proposed pages)

| # | Station (`dist/`) | Crater & `5.1` Pixel | Elev & Climate | Scene Composition |
|---|---|---|---|---|
| **1** | **`ringlake`** *(default `ricochetpeaks.html`)* | **Yuni-Gate / Skipper's W** (`1258, 1478`) | **`+2,820 m`**, `1.14 atm`, `Dfb`/`Dfc` | **The Central-Peak Ring-Lake & Pioneer Clearing:** Standing on a forested **central rebound island** surrounded by a crystal-clear annular crater lake (`WATER.open`) and a `360°` amphitheatre of `5 km`-high snow-crowned ejecta walls (`KFAR` + `KHORIZON`). Tall `crater_spruce`, golden `shatter_larch`, radial shatter-cone cliffs, and a `site:yuni-pioneer-homestead` clearing (with `?works=0` curved Yuni rammed-earth & mosaic wayside shrine under a steep snow-shingle hood!) |
| **2** | **`notch`** (`ricochetpeaks-notch.html`) | **Skipper's Notch** (`1318, 1506`, between Craters 2 & 3) | **`+3,580 m`**, `1.01 atm`, `Dfc` | **The Doublet Breach & Bandit Eyrie:** Where one ricochet crater punched straight through the rim of its neighbour! A dramatic `180 m`-wide V-notch cut through tilted `suevite` impact-breccia looking down into two different boreal crater-lakes on opposite sides; wind-flagged `glass_pine`, fireweed talus, and `site:ricochet-bandit-gate` (`?works=0` timber abatis & lookout platform) |
| **3** | **`vents`** (`ricochetpeaks-vents.html`) | **East Hearth Crater** (`1450, 1558`) | **`+2,720 m`**, `1.15 atm`, warm `Dfb`/`Dfc` | **The Hydrothermal Boreal Oasis:** Six steaming fumaroles and white sinter terraces (`WATER.spring` + `ext/53`) ringing a steaming emerald hot-spring lake inside a snow-rimmed crater (`ATMOS.snowBare` melts winter snow cleanly around the warm vents!). Lush moss-draped birch, thermal ferns, and rival `site:yuni-bath-claim` vs. `site:bandit-shore-camp` sites |
| **4** | **`glasssheet`** (`ricochetpeaks-glasssheet.html`) | **Glass-Pan Crater** (`1178, 1506`) | **`+3,180 m`**, `1.08 atm`, `Dfc` | **Black Impact-Melt Sheet & Meteoric Creek:** Ropy, glazed jet-black **`tagamite` impact-melt rock** (`KSTRATA`) cracked by frost into natural obsidian-like pavements, colonized by bonsai-twisted **`glass_pine`**, silver reindeer-lichen mats, and a rust-gold meteoritic iron-nickel placer stream (`kits/resources` `iron` + `nickel` + `gold` nodes) |
| **5** | **`highbowl`** (`ricochetpeaks-highbowl.html`) | **Old Rim Crater** (`1375, 1525`) | **`+5,100 m`**, `0.82 atm`, `ET` cryofumarole | **Erebus Steam-Ice Chimneys:** Preserves `edit_533`'s eerie high-altitude cryofumarole concept on the `5.1 km` perched bowl: `6–14 m` hollow **rime-ice fumarole towers and warm steam-caves** (`KSTACKS` + `KCAVERN`) venting into `-18 °C` thin air beside a frozen tarn (`WATER.ice`) |

---

## 4. Endemic Crater-Boreal Flora (`9` native species + `BIO.kin`) & Island-Crater Fauna (`6` species)

### 4.1 Flora (`RICOCHET.SPECIES` — Boreal Taiga Shaped by Impact Glass, Ring-Shadow & Cold-Air Pools)
Because each crater sits inside a `4–6 km`-tall rock ring (`KHORIZON` cuts direct winter sun to `4–5 hours/day` and night katabatic air pools on the very bottom!), **Ricochet Peaks shows an inverted "bowl treeline"**: boggy/frosty sedge-meadows and lakes right at the lowest centre, dense **spruce-larch-birch thermal-belt forest** `40–350 m` up the lower talus apron, and krummholz up to the rim!
1. `crater_spruce` (**Black-Cone Crater Spruce**, `20–38 m`): Narrow spire crown shedding heavy crater snow, dark blue-green needles absorbing low-angle sky light (`HV`: Yuni pioneer house-logs & bandit palisades, spruce-beer tips `edible`/`M`).
2. `shatter_larch` (**Shatter-Cone Gold Larch**, `18–32 m`, `BIO.kin` `nwouterwall` `fur larch`): Deciduous conifer turning fiery autumn gold across the crater walls (`HV`: rot-proof shingle & sluice-box timber).
3. `glass_pine` (**Tagamite Melt-Pine**, `6–16 m`): Twisted, copper-barked five-needle pine whose roots secrete organic acids to crack jet-black **impact-glass sheets** (`HV`: pine nuts `edible`, amber-clear pitch glue `F`/`reagent`!).
4. `ejecta_birch` (**Chalk-Bark Pioneer Birch**, `10–22 m`): Colonizes fresh avalanche talus and bandit burn-clearings alongside magenta **fireweed** (`HV`: sweet birch-syrup `edible` tapped by Yuni settlers, betulin bark tar `F`/`M`).
5. `vent_willow` (**Fumarole Plume-Willow**, `3–8 m`, `vents`): Lush emerald shrub forming frost-free thickets in the warm steam of East Hearth Crater (`HV`: salicin fever-bark `M`, basket withes).
6. `nickel_heather` (**Meteoric Bell-Heath**, `0.3–0.8 m`, `glasssheet`): Hyperaccumulates meteoritic nickel/iron into metallic-blue bells — **prospectors' indicator plant** used by Yuni Geomancers to find buried impactor fragments (`HV`: blue-grey glazeflux `reagent`!).
7. `shock_lichen` (**Star-Burst Reindeer Moss**, floor carpet): Pale silver-gold cushion lichen blanketing black suevite gravel (`HV`: emergency winter flour & fodder).
8. `frost_hollow_sedge` (**Cold-Pool Tussock**, crater-bottom frost hollows, `0.5–1.1 m`): Survives `-25 °C` night inversions where trees freeze out (`HV`: insulation thatch).
9. `steam_moss` (**Cryofumarole Ice-Moss**, `highbowl` & `vents`): Emerald bryophyte lining the warm insides of Erebus steam-ice chimneys (`HV`: warm poultice `M`).

### 4.2 Island-Speciated Crater Fauna (`kits/fauna` / `src/24-ricochet-fauna.js`)
Isolated bowl-by-bowl like sky-archipelago Galápagos islands:
1. **`crater_caribou` / `ring_elk`**: Pale-antlered boreal cervid migrating between craters through the `3.8–4.5 km` notches (which bandits and Yuni hunters stake out every autumn!).
2. **`suevite_lynx`**: Silver-spotted ambush felid stalking the shatter-cone boulder aprons.
3. **`thermal_macaque` / `hearth_marmot`** (`vents`): Soaks in East Hearth Crater's steaming sinter pools through `-15 °C` blizzards!
4. **`moat_trout`**: Deep-bodied sapphire-speckled char endemic to the annular central-peak crater lakes.
5. **`notch_raven`**: Oversized glossy corvid that follows bandit parties and mimics whistle-signals in the echoing notches.
6. **`yuni_pack_mule` / `shaggy_camelid`** *(pioneer stock)*: Brought south through Yuni-Gate by pioneering settlers.

---

## 5. Cultural & Settlement Hooks (Bandits vs. Pioneering Yuni Settlers)

Published as `core/tags` `site:*` records for future `settlements/` and `openworld/` builds:
- **Pioneering Yuni Settlers (`site:yuni-pioneer-homestead`, `site:yuni-bath-claim`):** Pushing south out of the arid `Yuni Emirate` (`kits/yuni`), these settlers build **hybrid Boreal-Yuni frontier compounds**: thick curved walls of dark suevite cobble and geothermal clay inset with colorful broken-quartz/ceramic **Gaudí mosaics**, topped not by flat desert roofs (which would collapse under `2 m` of crater snow!) but by **steep, sweeping spruce-shingle "witch-hat" and parabolic snow-hoods**, warming their walled kitchen gardens (`rye`, `potato`, `turnip`) with hot-spring stone channels.
- **Ricochet Bandit Rings (`site:ricochet-bandit-gate`, `site:bandit-shore-camp`):** Outlaw brotherhoods (*The Skippers*, *Notch-Lords*) holding timber-and-breccia blockhouses wedged into `Skipper's Notch` and `West Crater`, levying tolls on untaxed Yuni-to-Oidong silk/opium/jade mules and raiding Siphon Pits & Catch caravans before vanishing back behind `4,000 m` cols where Emirate cavalry cannot follow.

---

## 6. Order of Work & Open Questions

- **Order:** `R0` run `edit_538` carving the `12` ricochet craters (`+2,720–+3,480 m` boreal floors + `WH` crater lakes + `+3,750–+4,550 m` breaches); `R1` scaffold `biomes/ricochetpeaks/` + `RICOCHET_PHYS` (`tests/test-ricochet.js`); `R2` `ringlake` & `notch`; `R3` `vents` (`WATER.spring`), `glasssheet`, & `highbowl` (Erebus ice towers); `R4` `verify.py --assert` across all 5 stations.
- **Open questions for the owner:**
  1. **Running the Scale-Model `5.1` edits (`SW Outer Wall` annealing + `7` lakes, and `Ricochet Peaks` `12` boreal craters):** Would you like us to write and execute the `tools/scale-model/` script(s) for both regions once you confirm the lake/crater elevations (`+2,750–+3,350 m` northern boreal lakes on `SW Outer Wall`; `+2,720–+3,480 m` habitable `Dfc`/`Dfb` floors across `8` main + `4` high craters on `Ricochet Peaks`)?
  2. **A small `kits/yuni-frontier` or `Ricochet` settlement build later:** Would you like one of the Ricochet craters (e.g., **Yuni-Gate** or **East Hearth Crater**, with a pioneering snow-roofed Yuni village uneasily sharing the hot-spring lake with a bandit notch-fort!) planned as a full `settlements/` build too?
