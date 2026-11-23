# Qoold Lheek: Capital of Khaay Qantïr on Cold Lake (Plan & Blueprint, 2026-11-18)

**Qoold Lheek** (*"the cold lake"*, Old English *cold lake* through the Khaayken drift; scale-model 5.1 pin `s427qb1kma` at
`px 410, py 506`, anchored `3.5 km` SE down the `Musïq Quli` coulee fan at `px 411.4, py 508.1`) is the capital of **Khaay
Qantïr** ("the high country"), the Yeti Kingdom on the NW Outer Wall plateau.

This folder holds the site plan, the `[G data]` layout (`src/30-ql-layout.js`), the rule and covered-way engine
(`src/31-ql-rules.js`, calling `core/city/36-city-covered.js` in place), the unit test suite (`tests/test-qoold-lheek.js`),
and the blueprint generator (`qoold_blueprint.py` -> `floors/*.png`, `FURNITURE.md`, `BLUEPRINT.md`). There is no 3D HTML
page yet; everything not fixed by `LORE.md`, `kits/yeti/PLAN.md`, `biomes/nwouterwall/PLAN.md`, `kits/crops`, `kits/resources`
or the scale model 5.1 rasters is marked *proposed*.

---

## 0. Core adoption (required before page build)

Per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and `AGENTS.md`, when `settlements/qoold-lheek` advances from blueprint
data to a 3D Three.js + Godot settlement build, it takes these shared modules and kits in place — zero bespoke PRNG, noise,
`getImageData`, sky dome, water shader, spatial hash, or duplicated kit engine:

| Module / Kit | Taken | How Qoold Lheek uses it |
|---|---|---|
| `core/rand` (`KRAND`) | yes | Deterministic cell/lot/snow-drift/boulder/loot hashes (`KRAND.hash32`, `KRAND.rng`); zero draw-order RNG or `Math.sin` hashes |
| `core/tags` (`KTAGS`) | yes | Every placed building, tunnel segment, snow fence, weir, crop pocket, tomb, resource work, prop, and NPC registered with stable id before drawing |
| `core/space` (`KSPACE`) | yes | Spatial occupancy for boulder pockets, `furlarch` coppice, sled parks, and pasture infill |
| `core/mask` (`KMASK`) | yes | Coulee/terrace/aufeis/drift/permafrost masks (`KMASK.canvas`, distance fields); never `getImageData` |
| `core/city` (`KCITY` + `KCITY.covered`) | yes | Plain-record layout (`src/30-ql-layout.js`), rule checks (`src/31-ql-rules.js`), and **already wired in place** to `core/city/36-city-covered.js` (`KCITY.covered`: 91 winter tunnel ways, 45 junction/warming domes, 0 blocked ways) |
| `core/world` (`WORLD`) | yes | Scale-model 5.1 terrain `WORLD.H` at 1:1 around `[411.4, 508.1]`, `ROADS` (`supp.jimjam_qoold_lheek_dirt`), streamed tundra floor & flora |
| `core/coast` (`KCOAST`) | yes | Cold Lake's shingle/gravel fan apron, frozen shore shelves, and rock-bluff transitions |
| `core/terrain` + `KFROST` | yes | Terrace risers, coulee notch banks, dry-bedrock tomb spurs, and `biomes/nwouterwall` `KFROST` frost-polygon / patterned-ground fields |
| `core/water` + `core/atmos` | yes | Cold Lake's seasonal black-ice / summer meltwater plane, `Musïq Quli` coulee stream, gravity `kuhl` leats, aufeis glaze, standard Krator skybox & high-altitude thin-air (`0.79 atm`) presets |
| `core/engine` + `kits/yeti` | yes | `kits/yeti` (`50-yt-houses.js` .. `66-yt-civic.js`, `31-alt-takes.js` on `core/engine`) at the `1.15x` Khaayken stature contract (`2.18 m` doors, `52 cm` benches, `92 cm` tables) |
| `kits/eternian` (`42-et-head.js`) | yes | Read in place as `kits/yeti` does (`45-yt-inside.js` `YT_LOOT_N`) for gilded Eternian war-loot bronze masks and colossus heads mounted in halls, shrines, gates, and clan seats (`ruin: false` locally — all bronze comes by raid/tribute via Leng) |
| `core/catalog` + `core/furnish` (`KFURN`) | yes | Indexed catalog batch (`KF.batch({indexed:true})`, `KFURN.useBatch(..., {indexed:true})`) across `yeti`, `eternian`, `nomad`, and `supplies` pieces (`FURNITURE.md`: 5,030 pieces; 11 `NEW` Khaayken pieces queued for `kits/catalog/src/yeti.js`) |
| `biomes/nwouterwall` | yes | Cold-plateau tundra flora (`furlarch` coppice on the shaded left bank, `cushion` & `saxifrage` fellfield, `qiviut` musk-oxen & `qaribuu` herds) |
| `kits/crops` (`CROPS`) | yes | Cold-limit plateau palette (`CROPS.forBiome('nwouterwall')`): the Three Gifts — `ïsnoo-pa'a` (snow-potato), `isiit` (sweetroot), and `gooldruut` (*Rhodiola*) — plus `Ivan-chai` fireweed tea |
| `kits/resources` | yes | High-grade coulee gold & tin placer sluices, saltpeter scraping pans, meteoritic/impactite iron bloomeries, and silver/turquoise/gold lode imports |
| `core/charactermodels` | yes | Khaayken Yeti citizens (`peoples.json`, `1.15x` stature, deep barrel chests, pale-grey/white pelts, `qiviut` robes & bronze war-trophy collars) |
| `core/simulation` (`SIM`) | yes | Urban stocks, winter sled-train & Leng tribute trade (`SIM.trade`), seasonal `Quunsul` muster |
| `core/host`, `core/walk` | yes | Standard inspector, polygon tool, view presets, and `walk` / `smoke` harness (`tools/harness.py`) |

---

## 1. The site on the world map (scale model 5.1)

### 1.1 From the plateau pin (`410, 506`) to the coulee-fan anchor (`411.4, 508.1`)

In `tools/scale-model/pins.json`, `s427qb1kma` (**Qoold Lheek**) sits at `px 410, py 506` (`6,053 m` ASL, `-5.8 °C` mean,
`88 mm/yr`), out on the exposed rim plateau `4 km` back from the lake cliff. Along almost the entire NW rim of Cold Lake,
the plateau drops **`~350 m` in a sheer scarp** (`6,020–6,060 m` down to `5,680.41 m`), leaving nowhere to beach boats, saw
quarry ice, water herds, or bring a sled road down to the ice highway.

Directly SE of the pin, **`Musïq Quli`** (`r466`, `25 km` course, `0.4 m³/s` mean discharge) and its tributary **`Lïtl
Paayar Quli`** (`r855`, `0.2 m³/s`) breach that scarp in a SE-trending notch (`px 410.2, 508.3`, `5,717 m`) and spread a
**thaw-stable impactite-gravel fan and lateral-moraine terrace staircase** onto the NW shore of Cold Lake at **`px 411.4,
py 508.1`** (`3.5 km` SE of the pin). Anchoring the capital on this coulee fan solves every physical requirement at once:

| Parameter | Value at `411.4, 508.1` | Source & effect on the plan |
|---|---|---|
| **Cold Lake (`Qoold Lheek`)** | **`5,680.41 m` ASL** (`y = 0.0 m` datum), `448 km²` (`112` cells, ~`60 x 15 km` NE–SW), max depth **`159 m`** (`-142 m` at `412, 510`) | `basins.json` (`410.2, 510.3`). Frozen **7–8 months/yr** (`1.4 m` clear black ice): winter sled superhighway, pycrete slab quarry, net-char fishery, and thermal moderator |
| **Crown datum (`Quunsul` terrace)** | **`5,702.41 m` ASL** (`y = +22.0 m` local) | Well above wave/ice-shove (`+5 m` berm), dry coarse gravel over shallow impactite bedrock |
| **Latitude & sun** | **`27.8° S`** (southern hemisphere) | **Midday sun stands in TRUE NORTH (`0°` bearing)**: winter solstice noon `38.7°`, equinox `62.2°`, summer noon `85.7°` |
| **Sheltered shore climate** | **`-4.2 °C` mean**, warmest **`+10.8 °C`**, coldest **`-19.4 °C`**, **`94 mm/yr`** (`ET` dry polar tundra) | Safely below `kits/yeti`'s **`-2 °C` permanent pycrete ceiling**; dry enough (`94 mm`) that snow fences must actively trap drifting snow, and crops need coulee meltwater leats |
| **Barometric pressure** | **`~0.79 atm`** (`~5,700 m` on the scale-height curve) | Thin, crisp plateau air; Yetis are adapted to it, while lowland invaders struggle on the climbs (`LORE.md`) |
| **Prevailing wind** | **`300° WNW`**, `5.3 m/s` on bench, `5.9 m/s` on lake | `wd.png` / `ws.png` katabatic Outer Wall gales blowing down-coulee from WNW to ESE |
| **Hydrology** | `Musïq Quli` (`r466`, `0.4 m³/s`) + `Lïtl Paayar Quli` (`r855`, `0.2 m³/s`) on-site; `Qaribuu Quli` (`r873`, `0.9 m³/s`) at SW head (`394.2, 524.3`); `Ïsnoo Quli` (`r195`, `8.7 m³/s`) at NE outlet (`424.2, 498.2`) | `rivers.json`. `Musïq Quli` feeds the `y = +29 m` weir, placer sluices, gravity crop leats, and winter `aufeis` sheet |
| **Overland & ice roads** | `supp.jimjam_qoold_lheek_dirt` (`186 km` SE via `Qaribuu Quli` saddle & `Jimjam` `[442, 535]` to **Leng** `[490, 554]`) + NE/SW winter lake-ice highways | `roads.json`. Leng Gate (`gate.leng`) greets the SE road at the foot of the town terrace |

### 1.2 Geology, baked resources, and the zero-ruin rule (`kits/resources/data/geology.json`)

- **Geologic province:** **`impact`** (cratered impact-melt breccia, shocked granite, and dark impactite gravel; **`ruin:
  false`**). Unlike **Leng** (`[490, 554]`, `sedimentary`, `ruin: true`), Qoold Lheek has **no Ancient ruins in its bedrock**.
  Every gilded Eternian colossus face, bronze mask, altar chest, and brass astrolabe in Qoold Lheek is **war loot and tribute**
  hauled back up the Leng sled road (`kits/yeti/src/45-yt-inside.js` `YT_LOOT_N`), never dug up on-site.
- **Prospectivity bytes at `[410.2, 508.3]`:** `water: 255`, `impactite: 255`, `saltpeter: 200`, `stone: 191`, `iron: 120`,
  `gold: 90`, `silver: 80`, `rare-earth: 60`, `nickel: 60`, `copper: 50`, `turquoise: 45`, `tin: 40`.
- **Baked high-grade resource nodes in the coulee & rim:**
  - **Placer gold (high)** & **placer tin (high)** right in the `Musïq Quli` coulee throat (`[410.2, 508.3]`) -> worked by
    `sluice.upper` and `sluice.lower` beside the weir;
  - **Saltpeter (high)** on the dry cold bluff toes (`[410.4, 508.4]`) -> scraped in `nitre.pans` on the lower northbank;
  - **Lode gold (high)** (`[411.2, 506.9]`, `2.4 km` N), **lode silver (high)** (`[408.6, 508.6]`, `5.6 km` W), and **lode /
    meteoritic iron (high)** (`[408.3, 502.8]`, `12 km` NW) -> smelted and forged in the town's four shared-wall smithies.

### 1.3 Sightlines from the benches (`L.sights`)

| Sight id | From | Bearing | Range | Target | Margin | Role |
|---|---|---|---|---|---|---|
| `sight.leng` | `shrine.lake` (`+22.5 m`) | `132° SE` | `186 km` (pass `28 km`) | Leng Road Saddle & `Qaribuu` Gap (`424, 518`) | `+64 m` | Chief's & Lake Shrine's axis toward Leng tribute road |
| `sight.outlet` | `cairn.ne` (`+49 m`) | `44° NE` | `24 km` | `Ïsnoo Quli` Cold Lake outlet (`424.2, 498.2`) | `+38 m` | NE ice-highway & outlet watch |
| `sight.sewall` | `chief.hall` (`+22.8 m`) | `145° SE` | `16 km` | Far SE scarp across `Qoold Lheek` (`418, 514`) | `+180 m` | Ceremonial threshold axis across the frozen lake |
| `sight.coulee` | `tower.west` (`+44.5 m`) | `298° WNW` | `4 km` | `Musïq Quli` gorge head & plateau rim (`410, 506`) | `+42 m` | Katabatic storm watch & western rim trail |

---

## 2. Harmonizing the layout with terrain, sun, wind, and permafrost

Every district of `QOOLD_LAYOUT` (`1,480 x 1,300 m` local frame: `u` = East, `v` = True North = **Midday Sun**, `(0, 0)` on the
`Quunsul` Crown at `y = +22.0 m`) is placed where the landform does half the engineering work:

1. **Cross-coulee solar split (`27.8° S` -> northern sun):**
   Because `Musïq Quli` cuts NW -> SE across the northern quadrant of the site, its two banks have opposite microclimates:
   - **Right (south) bank (`sunbench`, `town`, `state`, tilted NNE toward `0°` True North):** Bathed in year-round northern
     sunshine. Holds the **Three Gifts terraces** (dark impactite boulders re-radiating daytime heat into snow-potato pockets,
     gravity-irrigated sweetroot beds, and *Rhodiola* / fireweed strips) and the entire permanent town, whose `45°` north-side
     clear lake-ice skylights catch low `38.7°` winter noon sun.
   - **Left (north) bank (`northbank`, tilted SSW away from the northern sun):** Permanently shaded in winter (`<= -10 °C`
     rock temperature). Preserves winter snowpack moisture for the **coppiced `furlarch` stand** (sawdust supply for pycrete!)
     and houses the **three deep permafrost ice cellars** (`cellar.state`, `cellar.char`, `cellar.seed`) where thawing would be
     catastrophic.
2. **Permafrost & foundation discipline (`zone` soil law):**
   - **Heated structures (`heated: true`)** stand strictly on **thaw-stable impactite gravel or dry bedrock** (`state`, `town`,
     `apron`, `sunbench`, `watchbrow`) atop `0.45 m` ventilated dry-stone gravel plinths so hearth heat never melts ground ice.
   - **Wet silt & patterned-ground pasture (`pasture`, SW of the gravel fan)** is **strictly off-limits to heated floors**
     (enforced by Rule 2): it carries only **elevated 4-post `yt_cache_platform` (`labaz`) caches** and **unheated `yt_corral`
     (`khoton`) winter yards**, plus the seasonal unheated pycrete muster ring (`fort.muster`).
   - **Dry bedrock Ancestors' Ridge (`tombridge`, `+49..+52 m`, NE):** Above all summer meltwater, frost heave, and scavengers,
     holding the **Seven Clan Tombs** (`tomb.khaay` .. `tomb.musiq`) and `cairn.ne`.
3. **Katabatic `300° WNW` wind defence & snow-harvesting (`fences`):**
   - In a `94 mm/yr` polar desert, snow is a precious construction material. Four dry-stone and timber **snow-harvesting
     fences** (`fence.1`..`4`) stand along the WNW windward crest (`u = -505..-140`), breaking the `300°` gale over the town
     and casting **`26 m` leeward drift quarries** (`driftBox`, strictly building-free by Rule 6) where clean wind-packed snow
     is sawn for seasonal tunnel banking.
   - Every building's **cold-trap entrance tunnel (`mouth`, `katak` sump `-1.2 m` below floor)** opens to **`S`, `E`, or `N` —
     never `W` into the `300°` gale** (enforced by Rule 5).
   - **Odour & smoke lee (`u >= +210 m` ESE):** Both urine-and-brain-liquor **tanneries** (`tannery.east`, `tannery.south`) and
     the lime/pottery kiln (`kiln.east`) sit downwind of every house and hall on the ESE flank (enforced by Rule 9).
4. **Shared thermal-mass walls (`bathhouse` + `smithy` pairs):**
   - Fuel (`furlarch` brush, dry dung, animal fat) is scarce at `5,700 m`. Every **`yt_bathhouse` shares a `<= 5 m` thermal
     stone spine with a `yt_smithy`** (enforced by Rule 8): `bath.state` + `smithy.state` (+ `kitchen.state` on the Crown),
     `bath.west` + `smithy.quraa`, `bath.east` + `smithy.qaribuu`, and `bath.gate` + `smithy.gate`. Forge waste heat pre-warms
     the bathhouse stones and water tanks.
5. **The Pycrete Works triangle (`Q3`):**
   - Khaayken permanent architecture uses **sawdust-reinforced pycrete (`86%` water ice + `14%` `furlarch` wood pulp)**. Sheet
     `Q3` places all three inputs within `150 m` of each other:
     1. **`quarry.ice.w` & `quarry.ice.e`** on Cold Lake (`y = 0 m`), sawing `1.4 m` crystal-clear winter black ice (blocks for
        `45°` roof lenses, crushed ice for slurry);
     2. **`aufeis.field`** below `weir.coulee`, freezing shallow coulee overflow layers in autumn/spring before the lake freezes;
     3. **`chute.sawdust` + `mill.sawdust`**, sliding coppiced `furlarch` poles down the shaded left bank straight to the
        horse-turned pulping mill and **`yard.pycrete`** casting molds on the `+4 m` gravel apron.

---

## 3. Urban structure: the Crown, the Seven `Kileŋler`, and the `KCITY.covered` winter net

### 3.1 The Seven `Kileŋler` (Clans) of Qoold Lheek (*proposed* names in Khaayken phonology)

| Clan (`Kileŋ`) | Seat / Ward | Stewardship in the capital | Ancestors' Tomb |
|---|---|---|---|
| **1. `Khaay Kileŋ`** (*High-Peak Clan*) | `chief.hall` (`state`, `+22.8 m`) | Royal house of the High Chief; convenes the `Quunsul`, keeps the Leng tribute treaties & Eternian war-banners | `tomb.khaay` (`+52.0 m`) |
| **2. `Quraa Kileŋ`** (*Frost-Iron Clan*) | `clan.quraa.*` (`town` NW, `+26.5 m`) | Meteoritic/impactite iron smiths, West Watch garrison, snow-fence wardens | `tomb.quraa` (`+51.0 m`) |
| **3. `Qiviut Kileŋ`** (*Underwool Clan*) | `clan.qiviut.*` (`town` N, `+25.5 m`) | Musk-ox (`qiviut`) spinners, broadloom weavers, air-gapped hide dome liners | `tomb.qiviut` (`+50.5 m`) |
| **4. `Qaribuu Kileŋ`** (*Caribou Clan*) | `clan.qaribuu.*` (`town` NE, `+22.0 m`) | Great SW caribou/yak herds, sled trains, horn-bowyers, `labaz` meat caches | `tomb.qaribuu` (`+50.0 m`) |
| **5. `Ïsnoo Kileŋ`** (*Clear-Ice Clan*) | `clan.isnoo.*` (`town` SW, `+20.5 m`) | Lake-ice quarrymen, `45°` ice-lens cutters, pycrete master masons, winter ice-netters | `tomb.isnoo` (`+49.5 m`) |
| **6. `Isiit Kileŋ`** (*Sweetroot Clan*) | `clan.isiit.*` (`town` S, `+19.5 m`) | Gravity `kuhl` leats, Three Gifts boulder terraces, Ivan-chai brick-tea & root-beer brewers | `tomb.isiit` (`+49.0 m`) |
| **7. `Musïq Kileŋ`** (*Coulee-Song Clan*) | `clan.musiq.*` (`town` SE, `+18.5 m`) | Lore-singers (`song.house`), coulee gold/tin placer sluices, Leng Gate toll & caravans | `tomb.musiq` (`+48.5 m`) |

### 3.2 The State Heart (`Quunsul` Crown, Sheet `Q2`)

Centered on the `+22.0 m` gravel crown (`u = -125..+135, v = -95..+95`), every state building joins into a continuous winter
ring:
- **`chief.hall`** (`yt_hall_chief`, `26 x 22 m`, `h = 9.5 m`): High Chief's Pycrete Great Dome (`S` katak mouth facing the
  `Quunsul` moot court and the `145°` SE sightline across Cold Lake).
- **`quunsul.hall`** (`yt_council_hall`, `22 x 22 m`, `h = 8.5 m`): Conical stone-and-pycrete council hall with 7 tiered clan
  benches round the sunken central hearth.
- **`shrine.lake`** (`yt_shrine`, `15 x 15 m`, `h = 11.0 m`): Shrine of Cold Lake & Sky at the SE brow (`132°` Leng sightline),
  housing the largest gilded Eternian colossus face (`et_loot_head_large`) above the frozen-lake libation basin.
- **`song.house`** (`yt_hall_clan`, `20 x 17 m`): `Qaggiq` of Songs & Lore-Keepers on the W flank.
- **`bath.state` + `smithy.state` + `kitchen.state`**: The **Crown Hearth Triad** on the NE flank — royal forge, steam
  bathhouse, and feast-cauldron / sweetroot-mash brewhouse sharing one massive heated impactite core.
- **`envoy.dome`** & **`guard.dome`**: Tributary & Leng Envoy Dome (housing ransom hostages / Eternian factors under watch)
  and Hearth-Guard Barracks flanking the southern `Quunsul` court (`court.moot`, marked by `serge.crown` 7-clan hitching
  posts and `trophy.crown` war-cairn).

### 3.3 The `KCITY.covered` winter tunnel network (`src/31-ql-rules.js`)

For 7 months of `-19 °C` blizzards, no citizen walks exposed across the gravel benches between clan wards, state halls,
bathhouses, smithies, kitchens, weavehouses, or gates. `QOOLD.coveredNet(L)` passes all **`47` `winterNet` buildings** and
`6` cross-street lanes directly into **`core/city/36-city-covered.js` (`KCITY.covered`)** with `cold` pycrete-and-turf vault
dress:
- **`91` covered tunnel segments** (`maxRun = 135 m`, `2.6 m` corridor width for `1.15x` Yetis passing abreast in furs);
- **`45` junction & mid-span warming domes** (`cover_junction` / `cover_node`, `5.2 m` span);
- **`0` blocked tunnels** and **single connected graph (`components = 1`)** from `portal.west` (West Watch rim trail) through
  all six clan clusters and the `Quunsul` Crown down to `gate.leng` (Leng SE road) and `portal.ne` (Ancestors' Way & coulee
  sluices).

---

## 4. Census (`2,200` permanent / `2,750` seasonal `Quunsul` muster) & Economy

| Group | Permanent Pop | Wards / Workplaces | Role in `SIM` economy |
|---|---|---|---|
| High Chief's household & Hearth-Guard | `130` | `chief.hall`, `guard.dome`, `envoy.dome`, `tower.west`, `gate.leng` | Polity seat, Leng tribute & war-raid command, toll keeping |
| Lore-singers, Lake Shrine & tomb-keepers | `70` | `shrine.lake`, `song.house`, `tomb.*` | Oral law, seasonal ice-break & solstice rites, Eternian trophy custody |
| Pycrete masons, ice-quarrymen & `furlarch` coppicers | `280` | `clan.isnoo`, `yard.pycrete`, `mill.sawdust`, `quarry.ice.*`, `coppice.larch` | `1.4 m` clear ice lenses, pycrete dome blocks, snow-fence drift maintenance |
| Meteoritic-iron smiths, gold/tin sluicers & nitre scrapers | `240` | `clan.quraa`, `smithy.*`, `sluice.*`, `nitre.pans`, `kiln.east` | Tools, sled runners, spears, placer gold/tin ingots, saltpeter |
| `Qiviut` spinners, weavers, curriers & feltmakers | `310` | `clan.qiviut`, `weave.*`, `tannery.*` | Fine `qiviut` underwool cloth (high-value export), caribou dome liners, winter parkas |
| Three-Gifts cultivators, leat-wardens, brewers & tea-curers | `340` | `clan.isiit`, `crop.*`, `kitchen.*`, `tea.leng` | Freeze-dried `ïsnoo-pa'a` (`chuño`), `isiit` sweetroot beer, `gooldruut` tonics, `Ivan-chai` tea |
| `Qaribuu` & yak herders, sled-drivers & bowyers | `490` | `clan.qaribuu`, `khoton.*`, `cache.*`, `sled.*` | Meat, tallow, hides, winter sled-train freight (`186 km` to Leng & across lake ice) |
| Cold Lake winter net-fishers, boatwrights & smoking racks | `340` | `clan.musiq`, `boathouse.*`, `fish.racks`, `cellar.char` | Deep-water Cold Lake char netted under `1.4 m` ice via jigger-boards, frozen & smoked |
| **Permanent urban total** | **`2,200`** | `47` tunnel-linked heated buildings + `49` works/caches/tombs | **`+550` upland band delegates (`2,750` total)** camp in `fort.muster` during the midwinter `Quunsul` |

---

## 5. Open forks for the owner (*proposed* defaults taken in this blueprint)

1. **Exact 3D region cut bounds:** Once `openworld` or `settlements/qoold-lheek` extracts its 1:1 terrain patch via
   `tools/scale-model/extract_region.py`, we recommend a **`6 x 6 km` cut centered on `[411.4, 508.1]`** so the coulee throat,
   the `350 m` NW bluff, `4 km` of Cold Lake offshore ice, and the Ancestors' Ridge spur all sit inside real `WORLD.H` ground.
2. **Seasonal target state (Deep Winter vs. High Summer thaw):** The blueprint designs for both seasons at once; for the first
   3D page target we recommend **Late Winter / Equinox (`-8 °C`, `1.4 m` black lake ice, active ice quarries, snow-banked
   tunnels, low `45°` northern sun gleaming off pycrete domes)**, with an optional `--season summer` switch showing open
   cobalt lake water, green `sunbench` crop terraces, and dry gravel plinths.
3. **High Chief's name & Leng envoy status:** Currently titled *High Chief of Khaay Qantïr* (`Khaay Kileŋ`) with an `envoy.dome`
   on the Crown for Leng tributary factors and Eternian ransom captives. Confirm if a specific named Chief or permanent
   Eternian hostage household from `LORE.md` should be tagged here.
