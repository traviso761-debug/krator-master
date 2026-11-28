# swouterwall: the plan — The South-Western Outer Wall & Trigemini Pass (proposal & build-ready design, 2026-11-27)

**The South-Western Outer Wall** (Scale Model `5.1` biome polygon **`SW outer wall`**, id **`rmwvsqhhqyk3f`**, **annealed with northern `Region 177` `rmwzq42zszc94`** into one continuous `1,140 km` highland arc spanning `X = 213..678, Y = 858..1427`, `~255,000 km²`; enclosing political/pass corridor **`Trigemini Pass`** `rmwvsmgi8xrro` at `279, 1120`): the vast, cold, thin-air southwestern rim of the main crater between **`Veiled Mountains`** (`rmwzq1pa88m7q`, `Y = 609..979`) on the north, **`Silent Vales` / `Copper Glacier` / `Firebliss` / `Labyrinth`** on the west, and **`Ancient's Valley` / `Realm of Dalab` / `Tungang Union` / `Fellgangs` / `W Rift Highland`** on the east.

Unlike `biomes/wouterwall` (whose lower `3.2–4.2 km` bench is blanketed in warm-summer `185 m` golden loess tablelands and Eternian/Hayrant terraces), the **SW Outer Wall** stands predominantly **high, cold, wind-scoured, and low-pressure** (`p50 = +8,746 m` on the uncarved crest, `0.76` down to `< 0.30 atm`), broken into habitable and passable life-corridors by **three north-to-south hydrological & altitudinal steps**:
1. **The Annealed Northern Boreal-Lake Transition (`Y = 858..985`, ex-`Region 177` north, bordering `Veiled Mountains`):** Glaciated U-basins (`+2,750–+3,750 m`, `0.96–1.14 atm`, `Dfc`/`Dfb`) catching spillover mist from the Veiled Mountains to feed **chains of dark, mirror-still Boreal Paternoster Lakes** ringed by shaggy `fur-larch`, spire-spruce, floating sphagnum/cottongrass quaking bogs, and beaver/waterfowl sedge-fens.
2. **The Mid-Northern Mountain Tarn Step (`Y = 980..1085`, ex-`Region 177` south -> `Trigemini` approach):** Cold subalpine-to-alpine moraine benches (`+3,850–+5,150 m`, `0.81–0.95 atm`, `ET` / cold `Dfc`) holding **milky-turquoise glacial-flour Mountain Lakes** behind tilted `megabreccia` terminal moraines, krummholz stone-pine mats, `KFROST` sorted stone polygons, and seasonal Fellgang / Dalab drover camps.
3. **Trigemini Pass (`+5,680 m` Cold Tarn) & the Southern Hypoxic Breath-Vales (`Y = 1073..1427`, `+5,680–+6,450 m` floors between `9–15.5 km` airless `megabreccia` walls, `0.76–0.62 atm`, `ET`/`HT`/`EF`/`O`):** Three converging glacial U-troughs meeting at half-frozen **Trigemini Tarn (`+5,680 m`, `279, 1120`)** — **Dalab's strategic high-altitude backup road to the Rift** (`edit_532_sw_wall_trigemini.py`) — plus three isolated `5,900–6,200 m` hanging breath-vales (`410, 1213`; `568, 1292`; `628, 1362`) cut into the airless `O` rim.

Status: **Build-ready biome & scale-model annealing plan** aligned with `edit_532_sw_wall_trigemini.py`, [biomes/veiledmountains/PLAN.md](../veiledmountains/PLAN.md), [biomes/wouterwall/PLAN.md](../wouterwall/PLAN.md), and [biomes/copperglacier](../copperglacier/).

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/swouterwall/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygons** | **`rmwvsqhhqyk3f`** (*SW outer wall*) **annealed with `rmwzq42zszc94`** (*ex-`Region 177`*, `X = 213..332, Y = 858..1047`) -> unified **`SW outer wall`** (`X = 213..678, Y = 858..1427`, `~255,000 km²`), plus **`rmwvsmgi8xrro`** (*Trigemini Pass*, `10,928 km²` dry + `148 km²` tarn) |
| **Pages (`4` Stations)** | `dist/swouterwall.html` (**Station 1 `boreallakes`**: *Northern Boreal Paternoster Lakes & Veil-Spill Larch Fen* in annealed north at px `264, 904`, `+3,050 m`), `--station morainetarn` (*Mid-Northern Turquoise Moraine Lakes & Krummholz Bench* at px `276, 1012`, `+4,380 m`), `--station trigemini` (*Trigemini Pass Junction & the +5,680 m Cold Tarn* at px `279, 1120`, `0.76 atm`), and `--station breathvale` (*Hanging Breath-Vale at the Airless `0.60 atm` Threshold* at px `410, 1213`, `+6,100 m`) |
| **Objects** | **`SWOW_PHYS`** (`[G data]` in `src/15-swow-phys.js`: north-to-south moisture & temperature gradient, barometric pressure / hypoxia curve `P(z)`, glacial lake ice-margin cover `iceShareAt`, `KFROST` polygon/solifluction intensity, and wind-scour exposure; tested by `tests/test-swow-phys.js` on `tools/ktest.js`) and **`SWOW`** (`BIO.kit('swouterwall')`) |
| **Read in place (`BIO.kin`)** | **`biomes/nwouterwall`** (`fur larch`, `creeping stone pine` krummholz, `woolly willow`, `cottongrass`, `crowberry`, alpine fellfield cushions); **`biomes/veiledmountains` / `nhighlands`** (spire-spruce, bog moss, & drift mist along the northern `boreallakes` border); **`biomes/copperglacier` & `biomes/riftrim`** (high-altitude frost cushions, snow-algae, & `HT` ice-edge lichens on `trigemini` & `breathvale`) |
| **Out of scope** | Permanent **Dalab**, **Tungang**, or **Fellgang** stone way-forts and caravan shelters (`kits/highlands`, `kits/yeti`) — published here as registered `core/tags` `site:dalab-trigemini-post` & `site:fellgang-camp` reserves (with optional `?works=0` drystone wind-cairns and pass prayer-poles tagged `class: 'furniture'`) |

---

## 1. Core adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

| Module | Fragments / Path | What `biomes/swouterwall` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('swouterwall')`; `31j` `BIO.flareJoin` on wind-flagged larch & krummholz stems; `32` `BIO.kin` reading `nwouterwall`, `nhighlands`, `copperglacier`, `riftrim`; `33` `BIO.fung` for high-UV black/orange crustose `megabreccia` lichens and oxygen-trapping ice-cushions; `34` impostors on northern boreal conifers; `35`/`39` strong katabatic lean |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers drawn moraine benches, lake beds, shore-ice shelves, and U-trough walls for `SURVEY` eye-clearance audits (item 28) |
| **`core/rand`** & **`core/tags`** & **`core/space`** | `KRAND` (`08`), `KTAGS` (`50/52/53`), `KSPACE` (`20`) | Deterministic cell seeding, pre-draw registration of all lakes, boulders, cushions, hazards, and Dalab pass-sites, non-overlapping moraine boulder & tree spacing |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` + `38c-core-landforms.js` (`KRELIEF`), **`42-core-frost.js` (`KFROST`)**, `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` **`megabreccia`** (tilted impact blocks exposed on 4 km cirque headwalls, zero thick loess!); `KRELIEF` glacial U-troughs, terminal moraine dams, and rock-glacier lobes; **`KFROST`** sorted stone circles, frost-boils, aufeis flats, and solifluction terraces; `KGROUND` (`<= 4` layers: boreal sphagnum/needle mat, wet moraine cobble, frost-shattered `megabreccia`, rime-snow); `KFAR` + `KHORIZON` |
| **`core/water`** | `20`, `21`, `22`, `50`, `51`, **`ext/54-core-water-ice.js` + draw (`WATER.ice`)**, `ext/56..58` | `WATER.open` for dark tannin boreal lakes (`boreallakes`) and milky-turquoise glacial mountain lakes (`morainetarn`); **`WATER.ice` (`ext/54`)** for shore-ice aprons, floating pan-ice, and winter freeze-over on `+5,680 m` **Trigemini Tarn** (`trigemini`); `WATER.flow` for moraine-breach meltwater cascades (terminated cleanly at lake edges per `water-mouths`!) |
| **`core/atmos`** | `0-core`, `0p-presets`, `3-particles`, `4-weather` (`snow:true`), `8-export`, `9-host`, `a-waves`, `b-skylight`, `sky/e,f,g,j`, `host/c,e,h,i,j`, **`fx/89-atmos-fx-snowcover.js`**, **`fx/89-atmos-fx-katabatic.js`**, **`fx/89-atmos-fx-slopewind.js`** | Thin-air cobalt-violet high-altitude sky (`pressure: 1.10` in north down to `0.62` in `breathvale`!), dawn frost-smoke (`fogPool`) steaming off boreal lakes, `fx/snowcover` snowline ramping down southward, `fx/katabatic` roaring down the Trigemini arms |
| **`core/hazard`** | `20/21-core-hazard*.js` (`KHAZ`) | **`thin-air` (`pressure` ambient field: `< 0.76 atm` exertion on `trigemini`, `< 0.60 atm` lethal ceiling above `breathvale`!)**, **`cold`** (`-10` to `-41 °C`), `swow:thinice` (`drown`/`cold` at lake ice leads), `swow:quakingbog` (`sink` in northern sphagnum fens), and `swow:rockfall` |
| **`core/materials`**, **`core/shadow`**, **`core/host`**, **`core/export`** | `KMAT` (`< 15` samplers), `KSHADOW` (off at load), `khost.FULL`, `07`/`09` | Standard PBR pack, host chrome, `krator-world` export |
| **`kits/crops`**, **`kits/fauna`**, **`kits/resources`** | Read in place (`[G data]`) | `CROPS.BIOMES.swouterwall` (`borealfen`, `moraine`, `trigemini`, `hypoxicvale`: cloudberry/lingonberry, reindeer-lichen, bog-iron & peat in north; barren above `+5,800 m`); `6` cold-lake & high-wall species |

---

## 2. Scale-Model `5.1` Annealing & Northern Lake-Chain Specification (Proposed `edit_537`)

### 2.1 Current `edit_532` Baseline vs. What Annealing `Region 177` Adds
- **Current `SW outer wall` (`rmwvsqhhqyk3f`, `Y = 1047..1427`):** `218,824 km²` dry, `51.2% O` (airless), `19.5% EF`, `16.4% HF`, `6.3% ET`, `2.2% HT`, `180 km²` water (almost entirely **Trigemini Tarn** at `279, 1120`, `+5,680 m`).
- **Annealing `Region 177` (`rmwzq42zszc94`, `X = 213..332, Y = 858..1047`):** Unions `Region 177` into `rmwvsqhhqyk3f` (retiring the temporary `Region 177` polygon) and carves **two stepped glacial valley-and-lake corridors** linking `Veiled Mountains` (`Y <= 979`) southward to `Trigemini Pass` (`Y >= 1073`):

| Proposed Sub-Belt (`edit_537`) | Pixel Corridor (`5.1`) | Carved Basin & Lake Levels | Resulting Climate & Air | Lake Character (`WH` raster cells) |
|---|---|---|---|---|
| **Belt A — Veil-Foot Boreal Lake Chain** (`3` Paternoster Lakes) | `(248, 878)` -> `(264, 904)` -> `(274, 938)` *(just south of `Veiled Mountains`)* | Valley floor **`+2,750–+3,350 m`**; **3 lakes (`16–38` px = `64–152 km²` each)** at **`+2,820 m`**, **`+3,040 m`**, and **`+3,290 m`** | **`1.14–1.05 atm`**, `tw +13..+16 °C`, `tc -6..-11 °C`, `650–1,200 mm/yr` -> **`Dfc` / `Dfb` habitable boreal taiga** | Dark, mirror-still tannin & snowmelt **boreal lakes** connected by short whitewater riffles through larch-spruce woods & sphagnum bogs |
| **Belt B — Subalpine & Alpine Moraine Tarns** (`4` Mountain Lakes) | `(268, 976)`, `(296, 998)`, `(276, 1024)`, `(308, 1052)` *(stepping toward `Trigemini`)* | Glaciated benches **`+3,850–+5,150 m`**; **4 moraine/cirque lakes (`10–26` px = `40–104 km²` each)** at **`+3,980 m`**, **`+4,360 m`**, **`+4,740 m`**, and **`+5,120 m`** | **`0.95–0.81 atm`**, `tw +5..+11 °C`, `tc -14..-22 °C`, `380–700 mm/yr` -> **upper `Dfc` krummholz -> `ET` alpine tundra** | Cold **turquoise glacial-flour mountain lakes** dammed behind `megabreccia` terminal moraines, rimmed by shore-ice & stone circles |
| **Belt C — Trigemini Pass & Hanging Breath-Vales** *(existing `edit_532`)* | `Trigemini Tarn` `(279, 1120)` + `3` vales `(410,1213)`, `(568,1292)`, `(628,1362)` | Tarn at **`+5,680 m`** (`148 km²`), cols `6,236–6,476 m`; vales **`+5,900–+6,200 m`** | **`0.76–0.62 atm`** (`< 0.60 atm` lethal above walls), `tw -2..+4 °C` -> **`ET` / `HT` / `EF` -> `O`** | Half-frozen **Cold Lake** twin (`WATER.ice` + open lead); bare frost-wedged `megabreccia` breath-pockets |

---

## 3. Stations (`4` proposed pages)

| # | Station (`dist/`) | `5.1` Pixel | Elev & Pressure | Scene Composition |
|---|---|---|---|---|
| **1** | **`boreallakes`** *(default `swouterwall.html`)* | **`264, 904`** (Northern Belt A, near `Veiled Mountains`) | **`+3,040 m`**, `1.10 atm`, `Dfc` | **The Paternoster Boreal Tarn:** Two stepped dark-mirror boreal lakes linked by a boulder riffle (`WATER.flow` fading cleanly into `WATER.open`), ringed by shaggy `fur-larch`, spire-spruce, silver dwarf-birch, floating golden-red sphagnum/cottongrass quaking mats, dawn frost-smoke (`fogPool`), and Veil-mist banking against the northern ridge |
| **2** | **`morainetarn`** (`swouterwall-morainetarn.html`) | **`276, 1024`** (Mid-Northern Belt B) | **`+4,360 m`**, `0.90 atm`, `Dfc`/`ET` treeline | **Turquoise Moraine Lake & Treeline Bench:** A vivid glacial-flour mountain tarn impounded behind a hummocky `megabreccia` terminal moraine (`KRELIEF`); wind-sheared `creeping stone pine` krummholz giving way upward to `KFROST` sorted stone rings, aufeis sheets, and `glassbell` ice-flowers |
| **3** | **`trigemini`** (`swouterwall-trigemini.html`) | **`279, 1120`** (`Trigemini Pass` junction) | **`+5,680 m`**, **`0.76 atm`**, `ET`/`HT` | **Trigemini Tarn — Dalab's High Back Door:** Where the three colossal U-troughs (`NE` Dalab, `S` W Rift Highland, `W` Copper Glacier) meet at the `148 km²` Cold Tarn (`WATER.ice` shore shelves + wind-rippled dark blue centre lead). Roaring katabatic spindrift, black-and-saffron `megabreccia` cliffs, oxygen-holding `lungcushion` domes, and `site:dalab-trigemini-waypost` cairn line |
| **4** | **`breathvale`** (`swouterwall-breathvale.html`) | **`410, 1213`** (Southern hanging vale) | **`+6,100 m`**, **`0.69 -> 0.58 atm`**, `HT` -> `O` | **The Last Breath Pocket:** One of `edit_532`'s narrow `6.1 km` amphitheatre vales cut into a `9.8 km` airless `megabreccia` wall. Stark cobalt-black thin-air sky, `KFROST` polygons, endolithic `sunblood` rock-crusts, rime-glazed boulders, and a visible `KHAZ` hypoxia ceiling (`< 0.60 atm`) halfway up the headwall |

---

## 4. Endemic Low-Pressure & Lake Flora (`8` native items + `nwouterwall`/`copperglacier` `BIO.kin`) & Fauna (`6` species)

### 4.1 Native Flora (`SWOW.SPECIES`)
1. `paternoster_spruce` (**Tarn Spire-Spruce**, `14–28 m`, `Belt A`): Narrow snow-shedding boreal spruce mirroring in dark northern lakes (`HV`: straight pole timber, resin pitch `F`, needle tea `M`).
2. `quaking_sphagnum` (**Floating Fen-Mat**, `Belt A` lake margins): Buoyant rust-red and chartreuse peat-moss & sundew raft extending out over boreal lake shallows (`KHAZ` `sink` warning, `HV`: wound-dressing `M`, dried peat `F`).
3. `moraine_birch` (**Silver-Peel Dwarf Birch**, `1.2–3.5 m`, `Belt A–B`): Contorted copper-and-chalk-barked shrub turning brilliant flame-gold around northern tarns (`HV`: waterproof bark tinder `F`).
4. `lungcushion` (**Bellows Cushion / Air-Dome**, `0.4–1.3 m`, `Belt B–C`, `+4,200–+6,200 m`): Hemispherical dark-green cushion plant whose hollow, sunlit interior holds **`+12 °C` warmer, O₂-enriched daytime air** (`~28% O₂` from trapped photosynthesis!). High-pass Dalab couriers press breathing cloths over `lungcushion` mats during hypoxic headaches (`HV`: high-altitude respiratory tea `M` / `reagent`!).
5. `glassbell` (**Rime-Lantern Gentian**, `0.15–0.35 m`, `Belt B–C` lake shores): Translucent parabolic ice-blue bracts focusing weak subpolar sun onto dark seed-pods (`HV`: febrifuge bitter root `M`).
6. `ice_waterweed` (**Sub-Ice Tarn Quillwort**, `Belt B–C` shallows): CAM aquatic rosette photosynthesizing beneath clear `WATER.ice` tarn shelves all winter (`HV`: emergency starch corm `edible`).
7. `sunblood_crust` (**Hyper-UV Hematite Lichen**, `Belt C` `+5,500–+6,500 m`, `BIO.fung`): Rust-crimson & jet-black mineral-armoured crustose lichen surviving down to `0.58 atm` (`HV`: UV-screen salve & rust dye `M`).
8. `bog_rosemary_sw` (**Veil-Drift Bog Heath**, `0.3–0.7 m`, `Belt A`): Fragrant bell-heath along the misty northern `Veiled Mountains` transition (`HV`:preserving herb & tea).

### 4.2 Fauna (`kits/fauna` / `src/24-swow-fauna.js`)
1. **`boreal_loon`** (*Belt A* lakes): Haunting-voiced diving waterfowl fishing the northern paternoster lakes.
2. **`tarn_char`** (*Belt A–C* lakes, up to `+5,680 m` Trigemini Tarn!): Slow-growing,ruby-bellied cold-water salmonid surviving under 8 months of tarn ice; salted by Dalab couriers.
3. **`fen_beaver` / `musk-vole`** (*Belt A*): Builds larch-and-peat lodges across northern lake outlets.
4. **`thinair_ibex` / `bharal`** (*Belt B–C*, up to `0.65 atm`): Barrel-chested, high-hematocrit cliff caprid leaping `megabreccia` ledges (`0.75 g`!).
5. **`cushion_pika`** (*Belt B–C*): Hay-stacking lagomorph nesting beside warm `lungcushion` domes.
6. **`ice_midge_swarm`** (*Belt C*): Wingless antifreeze-blooded glacier/tarn-edge hexapod feeding `tarn_char`.

---

## 5. `core/world` Style Row & Order of Work

- **`core/world/41-world-fields.js` (ride-along note):** Add `'sw outer wall': ['alpine', 'wouterwall']` (or dedicated `PAL.swouterwall` slate-and-moss palette) and retire `'region 177'` once annealed.
- **Order:** `S0` run `edit_537` annealing `Region 177` into `SW outer wall` and carving the `7` northern boreal + moraine lakes; `S1` scaffold `biomes/swouterwall/` + `SWOW_PHYS` (`tests/test-swow.js`); `S2` `boreallakes` & `morainetarn`; `S3` `trigemini` (`WATER.ice`) & `breathvale` (`0.60 atm` hypoxia line); `S4` `verify.py --assert` across all 4 stations.
