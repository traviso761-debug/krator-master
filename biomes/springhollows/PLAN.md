# springhollows: the plan (locked design, 2026-11-22)

**The Springhollows** (High-Ria / `Līwa-Tōga`: **`Sikwīngi-Khālōyi`**; replacing the Earth-placeholder label `"neo-ozarks"` on polygon **`rmvyiyw8ucd1y`** in Scale Model `5.1`): a `56,684 km²` (`100%` dry land, `X = 1109..1318, Y = 107..231`) dissected cherty-dolomite karst and red-porphyry shut-in plateau forming the eastern limestone heartland of the `Ria Valley` macro-basin. Perched at **`+1,057.1 to +2,525.7 m`** (`p5–p95`, median **`+1,747.7 m`**, incised spring hollows at `+819..+1,290 m`) under **`1.40–1.17 atm`** (`1.29 atm` median, `1.41 atm` in the spring valleys, `g = 7.4 m/s²` / `0.75 g`) and a uniform, frost-mild **`100.0% Cfa`** humid warm-temperate climate (**`1,333 mm/yr`** median rain, **`+19.0 °C`** tableland mean / **`+22..+24 °C`** hollow mean), it bridges **`Upper Ria`** (`rmweu2qb4nyia`, north) and **`Weeping Valley`** (`rmwetzg8idewz`, west) with **`Spider Lake`** (`biomes/spiderlake/PLAN.md`, `rmvyj4v2ozgb1`, southeast) and **`Compass Hills`** (`biomes/compasshills/PLAN.md`, `rmweu4kpowzji`, southwest).

Unlike `Zeijani` (arid volcanic lava tubes on the Throne), `Tungangs` (hot deep-Rift rail bores), or `k-guilin` (tropical `-1,480 m` drowned tower-karst), **Springhollows is a sun-dappled, upland daylight karst-and-porphyry paradise** shaped by four intersecting geological and cultural forces:
1. **`100% Carbonate` Cherty-Dolomite Tableland Sliced by `5` Purple-Red Rhyolite Porphyry Shut-In Ridges:** Across all `3,559` `4 km` cells (`limestone = 255`, `zinc = 90`), flat-lying cream-and-buff cherty dolostone (`KSTRATA` `carbonate-shelf`) is intruded by five strike-aligned basement knobs and dikes of insoluble **purple-red rhyolite porphyry** (`+180 to +320 m` relief). Where rivers (`9109` **`Tlīla-Wāda`**, `320 km`, `Q = 95 -> 440 m³/s`) cross soluble dolomite, they open wide, misty alluvial hollows; where they strike a porphyry dike, the valley pinches abruptly into a `12–28 m`-wide polished **igneous shut-in gorge** of thundering whitewater chutes — bypassed by the **Eastern (`Upper Ria`) Dynasty's** open-air counterweight boat-lifts (`CROOK-RIA-DECISIONS.md` §2.4).
2. **First-Magnitude Sapphire Phreatic Mammoth-Springs (`cav_ozarks_resurgence`):** Fed from the southeast by `Spider Lake`'s `+1,460 m` warm sub-escarpment seepage and upland sinkholes, artesian groundwater boils upward out of drowned `22–28 m`-high cave mouths in crystal-sapphire and turquoise **`WATER` resurgence pools** (`8–35 m³/s` per spring), keeping spring-runs ice-free (`+18 °C`) year-round.
3. **Collapsed Sinkhole Fern-Fenestres & `KSPELEO.CALCITE` Mississippi-Valley Crystal Caverns (`tube_ozarks_15`):** Along the `310 km` `tube_ozarks_15` conduit (`[1246, 172] -> [1212, 174] -> [1176, 184] -> [1144, 168]`, `biomes/CRYSTAL-CAVES-5.1.md` site 2), `12–22 m` daylight collapse skylights (`fenestres`) drop through fern curtains into vast phreatic halls along red-porphyry dike walls (`cav_ozarks_porphyry`, `cav_ozarks_onyx`) — lined with honey **scalenohedral calcite druse**, `14 m` (`0.75 g`) **pale-blue celestine megabeams**, banded cave-onyx pillars, and **`zinc = 90` galena-sphalerite** ore seams.
4. **High-Ria (`Līwa-Tōga`) Gallery Forests, `71`-Crop Terraces & Calcifying Cave-Mouth Bryophytes:** `88%` Earthlike upland gallery and glade mosaic — buttressed **bald-cypress** standing directly in sapphire spring runs, **chinkapin oak**, **shagbark hickory**, redbud, dry **rhyolite-porphyry glades**, and terraced **`saffron` & `whorl-olive`** — accented (`12%`) by native Kratorian **calcifying twilight bryophyte curtains (`tufabryum`)** that build porous tufa stalactites by day and glow soft cyan-jade (`495 nm`) inside cave-mouths at dusk, plus **celestine-sori calamine ferns (`calaminefern`)** over MVT zinc veins and rare **Ancient incomplete-ecocide bleach-belt scars** (`CROOK-RIA-DECISIONS.md` §2.3) on the western plateau.

Status: **Build-ready specification** aligned with `CROOK-RIA-DECISIONS.md` (§2.3–§2.6), `CONTINENTAL-SCOPE.md`, `biomes/CRYSTAL-CAVES-5.1.md` (site 2), `biomes/riavalley/PLAN.md`, and `biomes/spiderlake/PLAN.md`. Zero edits to `tools/scale-model/` or `kits/`.

---

## Core adoption

Written first per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and verified against `tools/check_core_use.py` (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/springhollows` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('springhollows')` registry; `31j` `BIO.flareJoin` on fluted spring bald-cypress knees/buttresses and chinkapin oaks; `32` `BIO.kin` reading `biomes/swlowlands` / `biomes/nhighlands` broadleaf oaks, hickories, pines, and ferns in place; `33` `BIO.fung` for calcifying cave-mouth `tufabryum` curtains, `springsponge` resurgence cushions, and dark-zone `glow-mushroom` / `alecap` kin; `34` octahedral impostors on `>= 7 m` gallery trees; `35`/`39` hollow-breeze sway & cliff-lip lean |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers plateau ground, shut-in porphyry chutes, sinkhole fenestre rims, and cavern floors (`39d-core-cavern-floor.js`) via `KDRAWN.add` so eye-clearance checks verify both surface and walk-in crystal-hall triangles (survey item 28) |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Deterministic `KRAND.cell(seed, ix, iz)` and `KRAND.hash` for karst joint networks, crystal beam orientations, spring boils, porphyry boulders, and plant placement |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every gallery tree, porphyry glade, spring resurgence, skylight fenestre, `KSPELEO` crystal cluster, `zinc`/`amber` node, hazard volume, and `site:high-ria-*` / `site:karst-arcology` reserves |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Order-free occupancy across surface trees, shut-in boulders, crystal beams (`KSPELEO.blocks`), and boat-lift site reserves |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `38-core-relief.js` (`KRELIEF`), **`39-core-cavern.js` + `39b-core-speleo.js` (`KSPELEO`) + `39c-core-karst.js` (`KKARST`) + `39d-core-cavern-floor.js` + `host/39e-core-cavern-draw.js` + `host/39h-core-cavern-cut.js` (`KCAVERN.cutLayer`)**, `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` `carbonate-shelf` (cream cherty dolomite) sliced laterally by vertical purple-red `porphyry-dike` (`outland-tuff` variant) walls; `KKARST.network` (`kind: 'branch'` & `'maze'`) + `KCAVERN.cutLayer` opening true walk-in cave mouths (`Station 1`) and `16 m` skylight fenestres (`Station 3`); **`KSPELEO.CALCITE` & `KSPELEO.LIMESTONE`** dressing `cav_ozarks_porphyry` and `cav_ozarks_onyx` with calcite druse/blocks, `14 m` celestine beams, and banded onyx columns; `KGROUND` (`<= 5` layers); `KFAR` + `KHORIZON` |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js` | `WATER.still` / `WATER.karstSpring` for deep sapphire-turquoise phreatic resurgence boils (`Station 1 spring`) and flooded subterranean crystal sumps (`Station 3`); `WATER.flow` for crystal-clear bald-cypress spring-runs and frothing whitewater chutes through red-porphyry shut-in narrows (`Station 2 shutin`, `WATER.mirrorSwitch` off at load) |
| **`core/atmos`** | `89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover.js`, `fx/lightning.js` | Shared Krator sky at `(px - 272, py - 330)` (`pressure: 1.41..1.26`), `#include <atmos_waves>`, cool inversion mist (`heightfog`) curling out of `+18 °C` cave mouths into warm `+28 °C` hollow air, volumetric sunbeam shafts piercing `16 m` fenestre skylights (`Station 3`), and `--night` cyan-jade bryophyte glow |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazards via `KKARST.hazards(N)` + custom rules: `springhollows:shutin` (`current`/`crush` in `4–6 m/s` porphyry whitewater chutes), `springhollows:fenestre` (`fall` around unfenced sinkhole skylights), `springhollows:sump` (`drown` in deep phreatic spring throats), and `springhollows:crystal` (`slip`/blockage on wet `KSPELEO.CALCITE` celestine beams) |
| **`core/materials`** | `core/materials/record/23-mat-record.js`, `25-matlib-host.js` + `tools/textures/matlib_pack.py` | Packed library textures (`tex/pack.json`), keeping linked shader samplers `<= 12` (`< 15` survey gate) |
| **`core/shadow`** | `core/shadow/10-core-shadow.js`, `host/12-core-shadow-host.js` (`KSHADOW`) | Sun shadow cascade **off at page load** (`?shadow=1` or UI toggle attaches on first click) |
| **`core/host`** & **`core/walk`** | `khost.FULL` + `94-host-polytool.js` | Camera, surface-to-cavern walk controller (`KSPELEO.blocks` collision), `[Day] / [Dusk Cave-Glow]` toggle, inspector tags, polygon tool, preset views, `window._api` |
| **`core/export`** | `core/export/07-core-export.js`, `09-core-export-adapters.js` | `krator-world` tile, `KKARST` void network, and `HOLLOW_PHYS` export for `openworld/` and Godot `4.7.2` |
| **`kits/crops`** | `kits/crops/src/10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js` (`CROPS`) | Read in place (`[G data]`): defines `CROPS.BIOMES.springhollows` (`71` rain-fed + dark cavern crops across `springrun`, `terrace`, `glade`, `cavern`!) |
| **`kits/fauna`** | `kits/fauna` (`[G data]` records first) | Registers 6 Springhollows fauna species (blind white cave-crayfish/hexapods, twilight glow-gnat web-spinners, spring-run giant hellbenders, porphyry collared lizards, shut-in kingfishers, and chinkapin turkeys/grouse) |
| **`kits/resources`** | Read-only contract (`kits/resources/GEOLOGY.md`, `data/geology.json`) | Honours `100.0% carbonate` (`limestone = 255`), **`zinc = 90`** (`1,266` MVT sphalerite-galena-celestine nodes), `clay = 255`, and 39-family **`amber = 120`** (`764` nodes) + `lodestone = 220` (`18` W-tip nodes) |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/mask`** (`KMASK`) | **No** | Porphyry dike strikes, dolomite joint grids (`KKARST`), phreatic spring heads, and Ancient bleach-scars are pure `[G data]` functions in `HOLLOW_PHYS` (`getImageData` is zero) |
| **`core/city`**, **`core/hamlet`**, **`core/camp`**, **`core/ruins`** | **No** | Eastern (`Upper Ria`) Dynasty (`Līwa-Tōga`) stone-terrace towns, open-air counterweight shut-in boat-lifts (`CROOK-RIA-DECISIONS.md` §2.4.2), and the partially inhabited Karst-Spring Hydro-Arcology (`1135, 153`, §2.3.7) are held clear as `KTAGS` `site:*` reserves for dedicated kit/settlement builds (`?works=0` places light cut-dolomite spring-level stelae and wooden skiff-portage rollers as `class: 'furniture'`) |
| **`core/coast`**, **`core/water/farbed`**, **`core/water/geyser`** | **No** | Upland interior karst plateau (`+819..+2,780 m`); resurgences are cool/mild (`+17..+24 °C`) artesian karst boils rather than boiling geysers |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/springhollows"` joins all five lists in `tools/checks_optin.json` (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`) from commit 1, enforcing `buildlib.through_tools_build`, `CORE_BIOME_MIN`, `< 15` samplers, `KDRAWN` surface + cavern registration, `tools/ktest.js`, and strictly punctuation-free view names.

---

## 0. Naming (replacing `"Neo-Ozarks"`) & what the kit is

### 0.1 Region rename table (`rmvyiyw8ucd1y` — retiring Earth placeholder `"Neo-Ozarks"`)

Scale Model `5.1` (`51-region-store.js` & `tubes.json`) temporarily carried the working Earth-analogue name `"neo-ozarks"`. To give the region a native, grounded Kratorian identity while keeping its High-Ria (`Līwa-Tōga`, Cherokee-shifted English per `CROOK-RIA-DECISIONS.md` §2.6: `p/b -> kw/gw`, `r -> l`, `h -> kh`, locative `-yi`) endonym transparent, three candidate names are evaluated below, with **`Springhollows`** adopted as the primary kit and biome name:

| Candidate Name | Kit / Folder Slug | High-Ria (`Līwa-Tōga`) Cognate | Strengths & Fit | Verdict |
|---|---|---|---|---|
| **1. `Springhollows`** | `biomes/springhollows/` | **`Sikwīngi-Khālōyi`** (*`sikwīngi`* `< spring` + *`khālō`* `< hollow` + *`-yi`* `"place of"`; folk: *`Ani-Sikwīngi`*) | Immediately evokes the signature drowned cave-mouth mammoth-springs, misty bald-cypress hollows, and dissected carbonate valleys; pairs naturally with `Compass Hills`, `Weeping Valley`, and `Drownlands` without any Earth toponym | **Recommended Primary** *(adopted here)* |
| **2. `The Shut-Ins`** | `biomes/shutins/` | **`Sūti-Īniyi`** (*`sūti-īni`* `< shut-in`; red-porphyry narrows: *`Lēdi-Sitōna Sūti-Īni`*) | Punchy, authentic geomorphic term spotlighting the `5` purple-red rhyolite porphyry gorges and the Eastern Dynasty's counterweight boat-lifts | **Strong Secondary** *(retained in-world for the 5 porphyry gorges: *The Five Shut-Ins*)* |
| **3. `Karstwells`** | `biomes/karstwells/` | **`Kālsiti-Wēliyi`** (*`wēli`* `< well`) | Highlights the collapse fenestres, artesian phreatic wells, and `tube_ozarks_15` crystal shafts; slightly more technical in tone | **Clean Alternative** *(owner option)* |

> **Scale-Model `5.1` Sync Note (no files in `tools/scale-model/` edited in this pass):** When the Scale Model's label pass runs, rename `rmvyiyw8ucd1y` `"neo-ozarks"` -> `"springhollows"` and `tube_ozarks_15`'s display title to `"Springhollows Dolomite Karst & Porphyry-Vein Cavern System"` (keeping stable IDs `rmvyiyw8ucd1y` and `tube_ozarks_15` unchanged).

### 0.2 Kit summary

| | |
|---|---|
| **Folder** | `biomes/springhollows/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon & Culture** | **`rmvyiyw8ucd1y`** (*springhollows*, High-Ria **`Sikwīngi-Khālōyi`**): **`56,684 km²` dry land** (`100.0% carbonate`, `100.0% Cfa`), `X = 1109..1318, Y = 107..231`, centroid `(1198.4, 166.6)` on `1821 × 1723` (`2 km/px`); **`culture: 'ria'`** (Eastern `Upper Ria` Dynasty & Pioneers HQ, `CROOK-RIA-SCOPE.md`) |
| **Pages (`5` Stations)** | `dist/springhollows.html` (**Station 1 `spring`**: First-Magnitude Sapphire Mammoth-Spring Cavern Mouth & Bald-Cypress Gallery at `1144, 168`), `--station shutin` (`1224, 158` Red-Porphyry Whitewater Shut-In Gorge & Counterweight Boat-Lift Reserve), `--station fenestre` (`1212, 174` Collapsed Sinkhole Fenestre & `KSPELEO.CALCITE` Cathedral of the Red Porphyry Vein), `--station glade` (`1176, 184` Onyx-Pillar Chert-Bridge Karst Glade, Saffron-Olive Terraces & Ancient Bleach-Belt Scar), and `--station porphyryrelict` (`1268, 142` `+2,570.2 m` High Red-Porphyry Carnelian Relict Knob & Inert `ecof_mist_pylon`, `docs/CARNELIAN-FRONTIER-PLAN.md` `25% Red · Tier 1`) |
| **Objects** | **`HOLLOW_PHYS`** (`[G data]` in `src/15-springhollows-phys.js`: porphyry-dike shut-in constriction hydraulics, artesian karst-spring discharge/clarity, MVT `zinc`/celestine crystal growth window, twilight cave-mouth bryophyte calcifying/bioluminescence gradient, Ancient defoliant bleach-scar recovery, and `porphyryRelictQuiltAt` crazy-quilt; tested by `tests/test-springhollows.js`) and **`SPRINGHOLLOWS`** (`BIO.kit('springhollows')`, **`25` species**) |
| **Read in place (`BIO.kin`)** | **`biomes/swlowlands`** & **`biomes/nhighlands`** (bald-cypress cousin, chinkapin/white oaks, hickory, pine, sword/lady ferns, moss boulders — zero copied fragments) |

---

## 1. Geological, karstic & hydrological ground truth (`Scale Model 5.1`)

### 1.1 Exact surveyed raster, `geology.json` & `tubes.json` metrics (`rmvyiyw8ucd1y`)

| Metric (`Scale Model 5.1`) | Surveyed Value in `rmvyiyw8ucd1y` (*Springhollows*) | Geomorphic & Ecological Consequence |
|---|---|---|
| **Area & Elevation (`p5..p95`)** | **`56,684 km²` dry land** (`0 km²` raster lake); `min = +819.1 m`, **`p5 = +1,057.1 m`, `p10 = +1,178.6 m`, `p50 = +1,747.7 m`, `p90 = +2,431.1 m`, `p95 = +2,525.7 m`**, `max = +2,779.8 m` | `900–1,400 m` of total hydraulic head from the SE `Spider Lake` rim (`+1,460..+2,525 m`) down to NW resurgences (`+846..+996 m`), driving immense artesian mammoth-springs! |
| **Atmosphere & Climate** | **`1.40–1.16 atm`** (`p5–p95`, med **`1.29 atm`**, `1.41 atm` at `1144, 168`, `1.16 atm` on `+2,570 m` `porphyryrelict`); **`100.0% Cfa`** (`56,684 km²`); rain `p5 / p50 / p95` = **`1,098 / 1,333 / 1,584 mm/yr`**; **`+19.0 °C`** (`+28/+9 °C`; hollows `+23 °C`) | Abundant warm `CO2`-charged rainwater dissolves thick cherty dolostone rapidly while keeping hollow bottoms lush and frost-mild |
| **`geology.json` & 39-Family Resources** | **`100.0% carbonate` province** (`56,944 km²` on `4 km` grid): **`limestone = 255`** (`3,559` cells = `100%`), **`zinc = 90`** (`3,559` cells = **`1,266` MVT sphalerite-galena-celestine lode nodes!**), `clay = 255` (`34` c), `stone = 120`; 39-fam **`amber = 120`** (`764` nd), `lodestone = 220` (`18` W-tip nd) | Supplies High-Ria (`culture: 'ria'`, `Līwa-Tōga`) **`Springhollows Brass` (`Cu + Zn`)**, galena `silver`/`lead`, optical calcite/celestine crystals, and cut cream-dolomite & red-porphyry ashlar |
| **Trunk Surface River (`rivers.json`)** | **`9109` `Tlīla-Wāda`** (`Līwa-Tōga` Shut-In River): `320.0 km`, **`Q = 95.0 -> 440.0 m³/s`**, rising at **`(1246, 172)` (`+1,290 m`)** and cutting across the 5 red-porphyry shut-in ridges to join `9101` `Līwa-Wāda` (`Rīwa-Wāta`) at **`(1124, 134)` (`+846 m`)** | Alternates between calm emerald dolomite-bluff reaches (navigable by High-Ria Swan barges) and violent red-porphyry **shut-ins** requiring counterweight boat-lifts |
| **Master Karst System (`tubes.json` `tube_ozarks_15`)** | **`310 km` habitable `dolomite_and_porphyry` trunk** (`32 × 24 m` bore, `48 m` depth): `[1246, 172] -> [1212, 174] -> [1196, 179] -> [1176, 184] -> [1144, 168]`, plus `Red Porphyry Dike Contact Gallery` (`[1212, 174] -> [1258, 136]`) and geothermal **`Spider Lake Sub-Escarpment Phreatic Conduit`** (`[1246, 206] -> [1212, 174]`) | Warm (`+28–38 °C`), mineral-saturated `Spider Lake` sub-escarpment seepage mixing with cool dolomite meteoric water along impermeable red-porphyry dike walls is the **exact Mississippi-Valley-Type (`MVT`) crystal recipe** (`CRYSTAL-CAVES-5.1.md` site 2)! |

### 1.2 Pure `[G data]` karst, shut-in, crystal & Carnelian crazy-quilt physics (`HOLLOW_PHYS` in `src/15-springhollows-phys.js`)

Zero `THREE`, zero `DOM`, deterministic on `KRAND`, tested by `node biomes/springhollows/tests/test-springhollows.js`:

1. **`HOLLOW_PHYS.porphyryDikeAt(x, z, site) -> {inDike, signedDistM, dikeStrikeRad, rockHardness01, strataKind}`**
   - Models the strike-aligned vertical basement ribs of insoluble purple-red rhyolite porphyry (`rockHardness01 = 0.96`, `strataKind = 'porphyry-dike'`) cutting flat-lying soluble cream cherty dolostone (`rockHardness01 = 0.42`, `strataKind = 'carbonate-shelf'`).
2. **`HOLLOW_PHYS.shutInFlowAt({qM3s, inDike, signedDistM, baseSlope}) -> {channelWidthM, depthM, velMs, froude, whitewater01, liftBypassReq}`**
   - Continuity & Manning/Froude hydraulics: in soluble dolomite (`inDike === false`), `Tlīla-Wāda` flows `65–110 m` wide at gentle `velMs = 0.6–1.2 m/s` (`froude < 0.35`, sapphire-emerald clarity); across a porphyry dike (`inDike === true`), width pinches to **`12–24 m`**, `velMs` surges to **`3.8–6.4 m/s`** (`froude > 1.15`, `whitewater01 -> 1.0` boulder cataracts), and `liftBypassReq === true` flags the bank bench for `site:high-ria-boatlift` (`culture: 'ria'`)!
3. **`HOLLOW_PHYS.mammothSpringAt({headDropM, conduitAreaM2, spiderSeepShare01}) -> {qSpringM3s, tempC, caMgPpm, sapphireDepthM, mistPlume01}`**
   - Computes phreatic resurgence boil (`qSpringM3s = 12–34 m³/s`, constant `tempC = +17.5..+21.5 °C`, dissolved `Ca2+/Mg2+/HCO3- = 240–380 ppm`), driving `WATER.still` / `WATER.karstSpring` optical attenuation (`sapphireDepthM`: vivid cobalt-sapphire over `> 8 m` flooded cave throats, turquoise over `1–4 m` chert gravel bars) and morning thermal-contrast mist (`mistPlume01`).
4. **`HOLLOW_PHYS.mvtCrystalAt({dikeDistM, spiderSeepShare01, depthBelowTableM, gKrator}) -> {speleoPreset, maxBeamLenM, celestineShare01, galenaZinc01}`**
   - Along impermeable porphyry dike contacts (`dikeDistM < 45 m`) where warm `Spider Lake` brine (`spiderSeepShare01 >= 0.25`) meets cool dolomite water, activates `KSPELEO.CALCITE` with **`maxBeamLenM = 14.5 m`** (`1.33×` Earth span under `gKrator = 7.4 m/s²`, `CRYSTAL-CAVES-5.1.md`), `celestineShare01` (`SrSO4` pale sky-blue megabeams), honey scalenohedral calcite druse, and `galenaZinc01` (`PbS` / `ZnS` metallic joint cubes).
5. **`HOLLOW_PHYS.caveMouthGlowAt({skyOpenness01, springHumidity01, isNight}) -> {tufaAccretionMmYr, bryoCover01, biolumRadiance01}`**
   - Governs native Kratorian **`tufabryum`** curtains: strictly confined to humid twilight cave brows and skylight throats (`0.04 <= skyOpenness01 <= 0.42`, `springHumidity01 >= 0.65`), precipitating stalactitic tufa (`tufaAccretionMmYr`) by `CO2` degassing in daylight and emitting soft `495 nm` cyan-jade bioluminescence (`biolumRadiance01`) at dusk/night (`0.0` out on open sunlit hillsides!).
6. **`HOLLOW_PHYS.ecocideScarAt(x, z, site) -> {inBleachBelt, yearsPostCataclysm, hardpan01, stranglerFront01}`** & **`HOLLOW_PHYS.porphyryRelictQuiltAt(x, z, elevRelM, site)`**
   - Models the `380 m`-wide geometric Ancient defoliant **"bleach-belt"** swath on `Station 4 glade` (`CROOK-RIA-DECISIONS.md` §2.3) contested by `stranglervine`, `blood_strangler`, and `bleachfireweed`, plus the **`25% Red · Tier 1` Edaphic Porphyry-Knob vs Dolomite-Hollow Crazy-Quilt** (`docs/CARNELIAN-FRONTIER-PLAN.md`) crowning high insoluble purple-red porphyry knobs in `carnelian_organpipe`, `erythra_veil`, `agate_window`, and `blood_strangler` above green Earthlike dolomite hollows.

---

## 2. Ecological zones (`75%` Earthlike Karst & Terrace Mosaic + `25%` Carnelian Porphyry Relicts & Karst/MVT Specialists)

| Zone Key | Setting & Elev | Substrate (`KSTRATA` / `KGROUND`) | Dominant Biota & Visual Signature |
|---|---|---|---|
| **`1. springrun`** (*Sapphire Mammoth-Springs & Bald-Cypress Galleries*) | `+846..+1,290 m` hollow floors (`Station 1`) | Cream cherty dolomite cave arches, white chert gravel bars, emerald-sapphire spring boils | Buttressed **`springcypress`** with submerged fluted knees, **`springtupelo`** along moist spring levees, emergent **`artesianwatercress`**, submerged **`springsponge`** cushions, and twilight **`tufabryum`** cave-brow curtains |
| **`2. shutingorge`** (*Purple-Red Rhyolite Porphyry Narrows & MVT Gossans*) | `5` dike crossings (`+980..+1,950 m`, `Station 2`) | Water-polished **purple-red rhyolite porphyry** (`porphyry-dike`) potholes, monoliths, and foaming chutes | Gnarled **`porphyrypine`** (`card.pine.b`) gripping red-rock joints, **`calaminefern`** & **`zincviolet`** along mineralized `zinc = 90` MVT dike contacts, and High-Ria (`culture: 'ria'`) boat-lift terrace reserves |
| **`3. dolomitebench`** (*Chinkapin-Oak, Hornbeam, Storax & High-Ria Terraces*) | `+1,100..+2,100 m` valley shoulders (`Stations 1–5`) | `KSTRATA` `carbonate-shelf` buff dolostone ledges & rich cherty loam | Sun-dappled **`chinkapinoak`**, **`dolomitehornbeam`**, warm Weeping-border **`weepingamberstorax`** (`ria-amber` resin), **`redbudkarst`**, and High-Ria dry-stone terraces of **`whorlolive`**, **`karstsaffron`**, and **`karstwildtea`** |
| **`4. porphyryglade`** (*Carnelian Sky-Island Knobs & Acidic Porphyry Balds*) | `+1,450..+2,570 m` sunny porphyry knobs (`Stations 2, 4, 5`) | Thin purple-red rhyolite grus & exfoliated porphyry tors | **`25% Red · Tier 1` Crazy-Quilt:** crimson **`carnelian_organpipe`** flutes, **`erythra_veil`** solar sails, and **`agate_window`** chalcedony skylight domes crowning insoluble high porphyry balds alongside xeric **`porphyrypine`** |
| **`5. fenestrecavern`** (*Collapsed Skylight Shafts & `KSPELEO.CALCITE` Halls*) | `-52..0 m` below `tube_ozarks_15` (`Stations 1, 3, 4`) | `KKARST` + `KCAVERN.cutLayer` dolomite/porphyry halls dressed with **`KSPELEO.CALCITE` & `LIMESTONE`** | **`travertinemaidenhair`** & **`fenestrespicebush`** on wet tufa lips and skylight rims, **`tufabryum`** twilight curtains, `14 m` celestine beams, and dark-zone **`fenestreglowmush`** & **`karstalecap`** |
| **`6. bleachscar`** (*Ancient Incomplete-Ecocide Bleach-Belt & Kill-Line Seam*) | Geometric plateau swath (`Station 4`) & mist-pylon rim (`Station 5`) | Pale chemical-bleached chert hardpan bordered by contested humus seams | Stark pre-Cataclysm defoliant swath contested along its margins by **`stranglervine`**, Carnelian **`blood_strangler`** chitin-webs, and pioneer **`bleachfireweed`** spikes |

---

## 3. Station catalogue (`5` verified Scale-Model `5.1` sites)

Every station `(px, py)` sits on verified `5.1` coordinates (`sky frame = (px - 272, py - 330)`), anchoring all three canonical caverns of `tube_ozarks_15`, `9109` `Tlīla-Wāda`, and the NE `+2,570 m` Carnelian porphyry sky-island (`docs/CARNELIAN-FRONTIER-PLAN.md`). Preset view names contain zero `'` and zero `:`.

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | Elev, `10 km` Relief & `P_atm` | Climate, Rain & `T` (`w/c`) | `KSTRATA` & `tubes.json` | Core Ecological, Karst & Cultural Signature (`culture: 'ria'`) |
|---|---|---|---|---|---|---|
| **1** | **`spring`** *(main)* `dist/springhollows.html` | **`(1144, 168)`** `(+872, -162)` (`cav_ozarks_resurgence`) | **`+996.2 m`** (`+984..+1,278 m`), **`1.41 atm`** | `Cfa`, **`1,255 mm`**, **`+23 °C`** (`+33/+13`) | `carbonate-shelf` + breached red-porphyry lip; `limestone = 255`, `zinc = 90`, `clay = 255` | **Shut-In Big Spring Resurgence & Bald-Cypress Hollow:** `24 m`-high drowned dolomite cave arch boiling out a `26 m³/s` **sapphire mammoth-spring**, `tufabryum` curtains, `springcypress`, `springtupelo`, `artesianwatercress` & `site:high-ria-springworks` |
| **2** | **`shutin`** `--station shutin` `dist/springhollows-shutin.html` | **`(1224, 158)`** `(+952, -172)` (paired w/ `1246, 172` `Tlīla-Wāda` head) | **`+1,480..+1,941 m`** (`+1,290..+2,102 m`), **`1.33 atm`** | `Cfa`, **`1,510 mm`**, **`+20.5 °C`** (`+29/+10`) | Vertical purple-red `porphyry-dike` slicing `carbonate-shelf`; `limestone = 255`, `zinc = 90` | **Purple-Red Rhyolite Porphyry Shut-In Gorge & Boat-Lift Bypass:** `Tlīla-Wāda` pinching into a `16 m`-wide polished red-porphyry whitewater chute, edaphic `agate_window`/`erythra_veil` porphyry knobs, `calaminefern` + `zincviolet` gossans & `site:high-ria-boatlift` |
| **3** | **`fenestre`** `--station fenestre` `dist/springhollows-fenestre.html` | **`(1212, 174)`** `(+940, -156)` (`cav_ozarks_porphyry`) | **`+1,257.2 m`** (`+1,250..+1,769 m`, `-52 m` hall), **`1.37 atm`** | `Cfa`, **`1,475 mm`**, **`+22 °C`** (`+31/+12`) | `carbonate-shelf` + red-porphyry dike wall + **`KSPELEO.CALCITE`** | **Sinkhole Fern-Fenestre & Cathedral of the Red Porphyry Vein:** `18 m` daylight collapse skylight (`KCAVERN.cutLayer`) dropping into `14 m` **celestine beams**, honey calcite druse, `travertinemaidenhair`, `fenestreglowmush`, `karstalecap` & `site:high-ria-calamine-assay` |
| **4** | **`glade`** `--station glade` `dist/springhollows-glade.html` | **`(1176, 184)`** `(+904, -146)` (`cav_ozarks_onyx` & `1135, 153` tie-in) | **`+1,106.8 m`** (`+1,088..+1,479 m`), **`1.39 atm`** | `Cfa`, **`1,380 mm`**, **`+22.5 °C`** (`+32/+13`) | `carbonate-shelf` + chert bridges + `KSPELEO.LIMESTONE`/`CALCITE` | **Onyx-Pillar Chert-Bridge Karst Glade, Saffron Terraces & Bleach-Scar:** `14 m` kipuka-skylight into `20 m` banded cave-onyx pillars, porphyry-knob `agate_window` relicts, `karstsaffron`/`whorlolive`/`karstwildtea` terraces, Bleach-Scar (`stranglervine` + `blood_strangler` + `bleachfireweed`) & `site:karst-arcology` |
| **5** | **`porphyryrelict`** `--station porphyryrelict` `dist/springhollows-porphyryrelict.html` | **`(1268, 142)`** `(+996, -188)` (NE porphyry sky-island) | **`+2,570.2 m`** (`+2,410..+2,780 m`), **`1.16 atm`** | `Cfa`, **`1,506 mm`**, **`+14 °C`** (`+23/+5`) | `carbonate-shelf` intruded by high purple-red `porphyry-dike` knob | **High Red-Porphyry Carnelian Relict Knob & Inert Mist-Pylon:** `+2,570 m` purple-red rhyolite porphyry sky-island crowned in crimson `carnelian_organpipe`, `erythra_veil`, `agate_window` & `blood_strangler` above `chinkapinoak`/`dolomitehornbeam` hollows, inert `ecof_mist_pylon` & `site:high-ria-porphyry-quarry` |

### 3.1 Station 1 (`spring`, main page `dist/springhollows.html`): Shut-In Big Spring Resurgence — `(1144, 168)`
- **Site & Framing (`5.2 × 5.2 km`):** Anchored at `(1144, 168)` (`sky +872, -162`, `+996.2 m`, `1.41 atm`), the western resurgent mouth of `tube_ozarks_15` (`cav_ozarks_resurgence`). At the foot of a tiered cream cherty-dolomite palisade (`KSTRATA` `carbonate-shelf`), `KKARST` + `KCAVERN.cutLayer` carves a `24 m`-high daylight cave arch, where artesian water boils upward out of a flooded phreatic throat as a **deep cobalt-sapphire spring pool** (`26 m³/s`), spilling into a meandering bald-cypress `WATER.flow` spring-run.
- **Signature Ecology & Works:** Buttressed **`springcypress`** giants and **`springtupelo`** along moist banks, emergent **`artesianwatercress`**, submerged **`springsponge`** cushions, damp-ledge **`travertinemaidenhair`**, twilight **`tufabryum`** curtains (`495 nm` cyan-jade dusk glow), dark-hall **`fenestreglowmush`** & **`karstalecap`**, and `site:high-ria-springworks` (`culture: 'ria'`).
- **Preset views:** `Overview`, `Sapphire spring boil`, `Cypress spring run`, `Cave arch tufa`, `Dusk bryophyte glow`, `Porphyry riffle`.

### 3.2 Station 2 (`shutin`, `dist/springhollows-shutin.html`): Red-Porphyry Shut-In Gorge & Boat-Lift Bypass — `(1224, 158)`
- **Site & Framing (`5.4 × 5.4 km`):** Set across one of Springhollows' **five strike-aligned purple-red rhyolite porphyry ridges** (`(1224, 158)`, `+1,480 m`, `sky +952, -172`, `1.33 atm`).
- **Signature Ecology & Works:** `9109` **`Tlīla-Wāda`** pinches from an emerald dolomite reach into a **`16 m`-wide whitewater shut-in gorge**; sunny upper porphyry-dike knobs carry **`porphyrypine`** (`card.pine.b`) plus edaphic relict **`agate_window`**, **`erythra_veil`**, and **`carnelian_organpipe`**; mineralized `zinc = 90` contacts host **`calaminefern`** & **`zincviolet`**; western dolomite benches carry **`whorlolive`**, **`karstsaffron`**, and **`karstwildtea`** beside `site:high-ria-boatlift` (`culture: 'ria'`).
- **Preset views:** `Overview`, `Porphyry shut-in chute`, `Dike dolomite contact`, `Porphyry bald glade`, `Boat-lift terrace site`, `Upper calm pool`.

### 3.3 Station 3 (`fenestre`, `dist/springhollows-fenestre.html`): Sinkhole Fenestre & `KSPELEO.CALCITE` Crystal Cathedral — `(1212, 174)`
- **Site & Framing (`4.8 × 4.8 km` surface + walk-in subterranean hall):** Directly implements **`biomes/CRYSTAL-CAVES-5.1.md` site 2 (`cav_ozarks_porphyry`)** at `(1212, 174)` (`sky +940, -156`, `+1,257.2 m`, `1.37 atm`).
- **Signature Ecology & Works:** `18 m` collapse sinkhole fenestre rimmed in **`travertinemaidenhair`**, **`fenestrespicebush`**, and **`tufabryum`** dropping via a walk-in breccia ramp into `10–14.3 m` (`0.75 g`) **celestine megabeams**, honey calcite druse, **`fenestreglowmush`**, **`karstalecap`**, and `zinc = 90` galena veins; surface **`site:high-ria-calamine-assay`** (`culture: 'ria'`).
- **Preset views:** `Overview`, `Fenestre sunbeam`, `Red porphyry cathedral`, `Celestine megabeams`, `Calcite druse sump`, `Galena vein wall`.

### 3.4 Station 4 (`glade`, `dist/springhollows-glade.html`): Onyx-Pillar Chert-Bridge Glade, Saffron Terraces & Bleach-Scar — `(1176, 184)`
- **Site & Framing (`5.2 × 5.2 km`):** Set at `(1176, 184)` (`sky +904, -146`, `+1,106.8 m`, `1.39 atm`), pairing **`cav_ozarks_onyx`** (`14 m` kipuka skylight, suspended chert-breccia natural bridge & `20 m` banded cave-onyx columns) with warm western **`weepingamberstorax`** benches, High-Ria **`karstsaffron` / `whorlolive` / `karstwildtea`** terraces, edaphic porphyry-knob **`agate_window`** / **`carnelian_organpipe`** relicts, `site:karst-arcology` (`culture: 'ancient'`), and the geometric Ancient **Bleach-Scar** contested along its seams by **`stranglervine`**, Carnelian **`blood_strangler`**, and vanguard **`bleachfireweed`**.
- **Preset views:** `Overview`, `Chert bridge portal`, `Banded onyx columns`, `Ancient bleach belt`, `Strangler front`, `Hydro-arcology site`.

### 3.5 Station 5 (`porphyryrelict`, `dist/springhollows-porphyryrelict.html`): High Red-Porphyry Carnelian Relict Knob & Inert Mist-Pylon — `(1268, 142)`
- **Site & Framing (`5.2 × 5.2 km`):** Perched on the NE highland margin at `(1268, 142)` (`sky +996, -188`, `+2,570.2 m`, `1.16 atm`), implementing the **`25% Red · Tier 1` Carnelian Ecological Frontier** (`docs/CARNELIAN-FRONTIER-PLAN.md`).
- **Signature Ecology & Works:** An insoluble purple-red rhyolite porphyry bornhardt knob rises above green **`chinkapinoak`**, **`dolomitehornbeam`**, and **`weepingamberstorax`** dolomite hollows where an inert Ancient **`ecof_mist_pylon`** stands (`class: 'infrastructure'`, `0` active hazard). Above the historical defoliant pool band, the sun-baked porphyry crown preserves a vivid sky-island of **`carnelian_organpipe`**, **`erythra_veil`**, **`agate_window`**, and seam **`blood_strangler`** / **`bleachfireweed`**, beside a clear contact spring tarn and `site:high-ria-porphyry-quarry` (`culture: 'ria'`).
- **Preset views:** `Overview`, `Carnelian porphyry crown`, `Organpipe sky-island`, `Inert mist-pylon`, `Contact spring tarn`, `Porphyry quarry site`.

---

## 4. Species roster (`src/50-springhollows-species.js` — `25` audited species), guardrails & `kits/crops`

Every species in `BIO.kit('springhollows')` (`SPRINGHOLLOWS.SPECIES.length === 25`, `calls <= 135`, `samplers < 15`) binds packed library textures in `materials.json` and carries full `HV(wood, edible, medicinal, notes, fruit)` metadata verified by `tools/check_botany.py`:

| # | Key | Name & Clade | Zone | Packed Library Slot(s) | Ecological Role & `HV` Harvest Summary |
|---|---|---|---|---|---|
| 1 | **`springcypress`** | **Sapphire-Run Bald-Cypress** (*Taxodium fontanum*) | `springrun` | `bark.cypress` + `cypress` (`card.pine`) | `24–38 m` buttressed gallery conifer w/ submerged knees (`BIO.flareJoin`); waterproof Ria boat-lift & Swan-barge timber |
| 2 | **`chinkapinoak`** | **Karst Chinkapin Oak** (*Quercus muehlenbergii*) | `dolomitebench` | `bark.oak` + `oak` (`card.lobed`) | `14–25 m` calciphile plateau canopy dominant (`inBleachBelt === false`); sweet acorns (`crop: 'acorn'`) & cooperage oak |
| 3 | **`porphyrypine`** | **Shut-In Red-Rock Pine** (*Pinus porphyritica*) | `shutingorge` | `bark.pine` + `pine` (`card.pine.b`) | `9–19 m` resinous pine strictly confined to `inDike === true` purple-red porphyry ribs; boat-lift pitch tar & pine nuts |
| 4 | **`redbudkarst`** | **Hollow Rose-Cercis** (*Cercis calcicola*) | `dolomitebench` | `bark.redbud` + `olive` (`card.orchard.broad`) | `4.8–8.8 m` rose-lilac calciphile understory tree along dolomite ledges; edible blossoms & basket shoots |
| 5 | **`tufabryum`** | **Twilight Calcifying Glow-Curtain** (*Bryofungus stalactiticus*) | `fenestrecavern` | `stone.tufa` (`stone.travertine.tufa`) | Native stalactitic cave-brow bryophyte (`0.04 <= skyOpen <= 0.42`) glowing `495 nm` cyan-jade at dusk; acoustic tufa & reagent |
| 6 | **`calaminefern`** | **Celestine-Sori Zinc-Fern** (*Asplenium calaminare*) | `shutingorge` | `calaminefern` (`card.fern`) + `crystal.celestine` | MVT metallophyte cleft fern w/ sky-blue `Sr/Zn` spore sori pinpointing `zinc = 90` galena-sphalerite veins |
| 7 | **`springsponge`** | **Sapphire Resurgence Cushion** (*Spongilla sapphirina*) | `springrun` | `organic.sponge` + `moss` (`card.moss`) | Submerged `+18 °C` emerald-turquoise freshwater sponge polishing celestine & Imperial Red Porphyry |
| 8 | **`stranglervine`** | **Bleach-Edge Strangler-Creeper** (*Liana & Retinol-Plum Front*) | `bleachscar` | `organic.strangler` (`ground.mycelium.crimson`) | Tangled plum-violet & ivy front reclaiming Ancient Bleach-Scar margins; alkaloid pest-repellent varnish & cordage |
| 9 | **`whorlolive`** | **High-Ria Terraced Whorl-Olive** (*Olea verticillata*) | `dolomitebench` | `bark.redbud` + `olive` (`card.orchard.broad`) | `4.5–7.2 m` dry-stone terrace orchard tree (`crop: 'whorl-olive'`); golden oil & Pioneer compass-housing wood |
| 10 | **`karstsaffron`** | **Sikwingi Karst Saffron Crocus** (*Crocus sikwingensis*) | `dolomitebench` | `saffron` (`card.crop.saffron`) | Autumn-blooming High-Ria terrace crocus (`crop: 'saffron'`); crimson-gold spice & ceremonial dye |
| 11 | **`fenestreglowmush`** | **Fenestre Phreatic Glow-Mushroom** (*Mycena cyanophreatica*) | `fenestrecavern` | `glowmush` (`card.mushroom.glow`) + `stone.tufa` | Subterranean cyan-jade bioluminescent dark-hall mushroom (`crop: 'glow-mushroom'`); cold lantern phosphor & poultice |
| 12 | **`karstalecap`** | **Subterranean Karst Alecap** (*Boletus spelaeus*) | `fenestrecavern` | `alecap` (`card.mushroom.alecap`) + `stone.onyx` | Constant-temperature `tube_ozarks_15` dark-bed dome mushroom (`crop: 'alecap'`); malted into Sikwingi cave-ale |
| 13 | **`carnelian_organpipe`** | **Sanguine Flute-Colony** (*Sanguinitubus porphyriticus*) | `porphyryglade` | `organic.strangler` + `rock.porphyry` (`KFRONTIER`) | `3.0–10.5 m` fluted crimson silica-chitin chimneys crowning high purple-red porphyry knobs; refractory crucible grog |
| 14 | **`erythra_veil`** | **Pleated Carnelian Lattice-Fan** (*Erythrophyllum flabellatum*) | `porphyryglade` | `rock.porphyry` (`KFRONTIER`) | `1.5–4.2 m` perforated scarlet *Erythrophyll* solar sails on sun-baked porphyry tors; carnelian ceramic glaze pigment |
| 15 | **`agate_window`** | **Chalcedony Window-Dome** (*Fenestraria carneliana*) | `porphyryglade` | `organic.strangler` + `crystal.calcite` (`KFRONTIER`) | `0.20–1.05 m` crimson cushion rosettes w/ clear biogenic chalcedony skylight lenses on porphyry balds; Pioneer survey loupes |
| 16 | **`blood_strangler`** | **Reactive Chitin-Web** (*Haematoplexus calcificans*) | `bleachscar` | `organic.strangler` (`KFRONTIER`) | Arterial-red calcifying chitin cables along Bleach-Scar & mist-pylon seams; acid-resistant lashing & reagent |
| 17 | **`weepingamberstorax`** | **Weeping-Amber Karst Storax** (*Liquidambar lachrymans*) | `dolomitebench` | `bark.amber` + `samara` (`card.samara.maple`) | `13–23 m` golden `ria-amber` resin tree on warm western benches bridging toward Weeping Valley; dielectric coil-varnish |
| 18 | **`dolomitehornbeam`** | **Karst Fluted Hornbeam** (*Carpinus dolomitica*) | `dolomitebench` | `bark.mossy` + `broadleaf` (`card.broadleaf`) | `9–17 m` mossy-barked calciphile terrace & shoulder tree; iron-hard timber for boat-lift gear teeth & lock cogs |
| 19 | **`springtupelo`** | **Artesian Buttress-Tupelo** (*Nyssa sapphirina*) | `springrun` | `bark.plane` + `heartleaf` (`card.heartleaf`) | `14–26 m` swollen-base riparian broadleaf beside `springcypress` (`py > wy + 0.42 m`); hollow bee-gums & tupelo honey |
| 20 | **`fenestrespicebush`** | **Sinkhole Karst Spicebush** (*Lindera fenestralis*) | `fenestrecavern` | `bark.redbud` + `spicebush` (`card.orchard.broad`) | `2.4–4.8 m` shaded sinkhole/fenestre understory shrub; aromatic warming red drupes & fever-bark tea |
| 21 | **`artesianwatercress`** | **Sapphire-Boil Watercress** (*Nasturtium fontanum*) | `springrun` | `watercress` (`card.wingreed`) | Emergent `+18 °C` sapphire spring-boil & chert-riffle herb; year-round antiscorbutic peppery greens |
| 22 | **`travertinemaidenhair`** | **Travertine Drip-Wall Maidenhair** (*Adiantum tuficola*) | `fenestrecavern` | `maidenhair` (`card.fan.lace`) | Wet tufa lip, spring-seep & shaded `fenestre` rim fern; glossy black wire-rachis hat-braid & demulcent syrup |
| 23 | **`zincviolet`** | **Gossan Calamine-Violet** (*Viola calaminaria*) | `shutingorge` | `zincviolet` (`card.cushion.anemone`) | MVT Pb-Zn gossan metallophyte cushion companion to `calaminefern` over shallow sphalerite-galena seams |
| 24 | **`karstwildtea`** | **Sikwingi Terraced Wild-Tea** (*Camellia sikwingensis*) | `dolomitebench` | `bark.mossy` + `wildtea` (`card.crop.tea`) | `1.4–2.6 m` terraced dolomite slope camellia bush (`crop: 'tea'`); pan-fired High-Ria court mist-tea |
| 25 | **`bleachfireweed`** | **Bleach-Scar Vanguard Fireweed** (*Chamaenerion calicicola*) | `bleachscar` | `fireweed` (`card.fireweed`) | Magenta-spiked pioneer herb spearheading Earth recolonization along `glade` & `porphyryrelict` Bleach-Scar vanguard seams |

### 4.1 Explicit cross-biome non-duplication guardrails
1. **Against `biomes/k-guilin` & `biomes/nwbay`:** Zero tropical `-1,480 m` drowned *fenglin*/*fengcong* limestone haystacks or `tsingy` razors — `Springhollows` (`+996..+2,525 m`, `1.29 atm`) is a **flat-bedded cherty-dolomite plateau dissected from below** into spring hollows, collapse fenestres, and red-porphyry shut-in canyons!
2. **Against `biomes/hearths` (`SELENITE`) & `biomes/scablands` (`AMETHYST`):** `Springhollows` uses **`KSPELEO.CALCITE` & `KSPELEO.LIMESTONE`** exclusively (Mississippi-Valley honey calcite druse, pale-blue celestine beams, banded cave-onyx, and galena-sphalerite ore — never scalding `+55 °C` gypsum selenite or basalt lava geodes).
3. **Against `biomes/spiderlake`:** Zero eusocial *Arachneapolita* `180 m` golden dragline curtains or `Brood-Pavilions` (Spider Lake's midge engine stops behind the `+2,040 m` `1278, 166` ejecta rampart; only warm mineral groundwater crosses underground via `tube_ozarks_15`).

### 4.2 `kits/crops` registration (`CROPS.BIOMES.springhollows` — `71` verified crops!)

```js
springhollows: {
  atm: 1,   /* 1.26-1.29 atm plateau standard band; incised +850..+1,150 m hollows override to atm: 2 (1.38-1.44 atm) */
  zones: {
    springrun: {warmth: [3, 3], arid: [3, 4], wet: true, atm: 2}, /* +850..+1,250 m frost-mild spring-runs & paddies */
    terrace:   {warmth: [2, 3], arid: [2, 3], atm: 2},            /* High-Ria dolomite bench orchards & saffron terraces */
    glade:     {warmth: [2, 3], arid: [1, 2], atm: 1},            /* Sunny upland red-porphyry & chert glades */
    cavern:    {warmth: [2, 2], arid: [3, 3], dark: true, atm: 2} /* tube_ozarks_15 dark-bed mushroom works */
  }
}
```
- **Verified `CROPS` Palette (`PROPOSAL-CROOK-RIA-BRAINSTORM.md` §2.4 — `71` crops):** **`saffron`**, **`whorl-olive`**, `rice`, `wild-rice`, `emmer`, `helix-bean`, `sweet-potato`, `murnong`, `painted-camas`, `acorn`, `wingnut`, `persimmon`, `canyon-grape`, `juniper`, `umbel-seed`, **`tea`**, `coffee` (sheltered lower hollows), `mulberry`, and dark-cavern **`alecap`** & **`glow-mushroom`**.

---

## 5. Fauna (`kits/fauna` `[G data]` records)

| Key (`kits/fauna`) | Name & Clade | Scale | Ecological Niche & Karst Tie-In | Yields & 24h Schedule |
|---|---|---|---|---|
| **`alabastercraw`** | **Blind Phreatic Cave-Hexapod** (stygobitic decapod-analogue hexapod) | `0.32 m` | Translucent pearl-white detritivore patrolling `tube_ozarks_15` sumps (`Stations 1, 3, 4`) with `0.4 m` tactile antennae | `cave-chitin`, `pearl-gastrolith`. `00–24` `FORAGE_SUMP` (arrhythmic troglobite) |
| **`springhellbender`** | **Sapphire-Run Giant Cryptobranchid** (aquatic amphibian) | `1.25 m` | Flattened mottled-chert ambush hunter under dolomite slabs in `+18 °C` oxygenated resurgence currents (`Station 1`) | `amphibian-meat`, `mucus-salve`. `00–07` `HUNT_RIFFLE`, `07–18` `SHELTER_SLAB`, `18–24` `PATROL_BOIL` |
| **`fenestregnat`** | **Cyan-Lure Cave Gnat & Spinner** (twilight micro-swarm + `0.14 m` predator) | `0.14 m` | Drawn into `tufabryum` glowing `495 nm` mucilage threads at dusk (`Stations 1, 3`), transferring bryophyte spores cave-to-cave | `glow-mucilage`. `05–18` `ROOST_ARCH`, `18–05` `SWARM_GLOW` |
| **`porphyrylizard`** | **Red-Shut-In Collared Agamid** (bipedal-sprinting saxicolous reptile) | `0.38 m` | Vivid turquoise-and-crimson lizard basking on sun-heated purple-red rhyolite porphyry monoliths (`Station 2`) | `reptile-skin`, `small-meat`. `07–11` `BASK_DIKE`, `11–17` `HUNT_GLADE`, `17–07` `CREVICE_SLEEP` |
| **`shutinkingfisher`** | **Silver-Crested Plunge-Fisher** (riparian bird) | `0.30 m` | Plunges from `springcypress` limbs into sapphire spring boils (`Stations 1–2`); heralds clear water along `Tlīla-Wāda` | `feathers`. `06–18` `DIVE_SPRING`, `18–06` `ROOST_CYPRESS` |
| **`chinkapingrouse`** | **Karst Gobbler-Fowl** (woodland galliform) | `0.65 m` | Flocks through `chinkapinoak` benches (`Stations 2–4`) feeding on sweet acorns and juniper berries | `fowl`, `feathers`, `eggs`. `06–11` `FORAGE_ACORN`, `11–15` `DUST_GLADE`, `15–19` `PECK_BENCH`, `19–06` `ROOST_OAK` |

---

## 6. Resources, workshop closure (`Ruling #1`), hazards & sampler budget

### 6.1 `kits/resources` & `CONTINENTAL-SCOPE.md` Ruling #1 input-output closure

| Good / Node | Source in `biomes/springhollows` | `[LOCAL]` High-Ria (`Sikwīngi-Khālōyi`) Upkeep | `[TRADED]` Export (`Upper Ria`, `Spider Lake`, `Heartland`) |
|---|---|---|---|
| **`zinc = 90` & Galena (`MVT` lodes)** | `1,266` sphalerite-galena-celestine nodes across `100%` of polygon (`Stations 2–4`) | Cemented with imported `copper` into **High-Ria Calamine Brass** boat-lift valves, sheaves & lock pins | Brass ingots, silver-lead cupellation bullion, and optical **celestine/Iceland-spar calcite** prisms |
| **`limestone = 255` & Red Porphyry** | `100% carbonate` cream dolostone + `5` purple-red porphyry dikes | Slaked `lime-mortar` (`Ruling #1` closed locally!), cut ashlar terraces & counterweight lift troughs | Monumental **Imperial Red Porphyry** & cream dolomite columns shipped to `Upper Ria` & `Spider Lake` (`SL1` colonnades!) |
| **`springcypress` & `chinkapinoak` (`wood = 255`)** | Hollow gallery forests & tableland oak woods | Waterwheel paddles, boat-lift caissons, cooperage casks & charcoal | Eastern Dynasty `riaEastPalaceBarge` (`89j`) hull timber |
| **`saffron`, `whorl-olive`, `alecap` (`71` crops)** | Bench terraces + `tube_ozarks_15` dark mushroom beds | Daily olive oil, soap fat, cave-ale (`alecap`) & grain rations | Luxury **High-Ria Saffron**, olive oil & `ria-amber` (`764` local nd) |

### 6.2 Data-driven hazards (`core/hazard`, `KHAZ`) & 4-layer ambient audio (`STATIONS-AMBIENT-AUDIO.md`)

| Hazard ID | `KHAZ` Kind | Stations & Trigger Rule (`HOLLOW_PHYS` / `KKARST`) | Visual / Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`springhollows:shutin`** | `current` / `crush` | `Station 2 shutin` (`shutInFlowAt(...).froude >= 1.15`) | Standing whitewater roostertails between polished purple-red porphyry walls; `4–6 m/s` chute sweep (`site:high-ria-boatlift` provides the dry-land bypass!) |
| **`springhollows:fenestre`** | `fall` | `Stations 3, 4` (`KCAVERN` skylight perimeter where drop `> 12 m`, off the collapsed ramp) | Fern-draped dolostone lip overlooking sunbeam-lit `-52 m` crystal halls; guides walker onto the safe `KDRAWN` chert-breccia descent ramp |
| **`springhollows:sump`** | `drown` | `Stations 1, 3` (`depthM >= 4.0` inside artesian `cav_ozarks_resurgence` & SE `Spider Lake` conduit) | Vivid cobalt-sapphire optical depth & upwelling boil rings; cold artesian current |
| **`springhollows:crystal`** | `slip` | `Station 3 fenestre` (`KSPELEO.CALCITE` wet `celestine` megabeams) | Specular sky-blue mineral faces wetted by cave condensate; `KSPELEO.blocks` keeps large crystal prisms solid |

**Station-by-Station 4-Layer Procedural Audio (`biomes/STATIONS-AMBIENT-AUDIO.md` contract):**
- **Layer 1 (Karst / Fluvial Bed):** Deep hollow-throated artesian boil echoing out of `cav_ozarks_resurgence` (`Station 1`) vs. high-velocity red-porphyry canyon whitewater (`Station 2`) and hushed subterranean sump lap (`Station 3`).
- **Layer 2 (Woodland & Glade):** Warm `1.29–1.41 atm` `Cfa` breeze through `chinkapinoak` crowns and feathery `springcypress` boughs.
- **Layer 3 (Cavern / Mineral Foley):** Long-`RT60` (`3.8 s`) **pitched water-drop chimes on `KSPELEO.CALCITE` celestine beams** inside `Station 3 fenestre` + dry chert-gravel crunch & `porphyrylizard` skitter on sunny porphyry balds.
- **Layer 4 (Twilight Accent):** Rattling `shutinkingfisher` calls by day, cross-fading under `[Dusk Cave-Glow]` / `--night` to resonant `springhellbender` / tree-frog cave-mouth chorus and soft `fenestregnat` hum beneath glowing `495 nm` `tufabryum` curtains.

### 6.3 Material & sampler budget (`< 15` samplers, `KSHADOW` off at load)
- **Sampler budget:** `KGROUND` (`<= 5` layers: `4–5`) + `KSTRATA` (`2`) + `ATMOS` (`2–3`) + `KHORIZON` (`1`) + `KSHADOW` (`1` when `?shadow=1`) = **`10–12` active samplers (`< 15` survey ceiling)**.
- **Reused library materials (`materials.json`):** `rock.limestone`, `rock.limestone.karst`, `ground.gravel042`, `ground.sphagnum`, `ground.needles`, `ground.dry_grass`, `bark.alder.lichen`, `bark.juniper`, `card.broadleaf`, `card.fern.green`, `card.pine`, plus `swlowlands` / `nhighlands` kin packs deduplicated via `matlib_pack`.
- **Four targeted prompts for `core/materials/PROMPTS-NEEDED.md` (procedural stand-ins until packed):**
  1. **`rock.porphyry.shutins`** — water-polished purple-red rhyolite porphyry studded with pale feldspar phenocrysts (`Stations 1–3`).
  2. **`organic.tufa.glowcurtain`** — stalactitic cream travertine/tufa draped in velvet moss with `495 nm` cyan-jade emissive twilight veins (`Stations 1, 3`).
  3. **`mineral.celestine.calcite`** — translucent pale sky-blue orthorhombic celestine blades and honey-amber dogtooth calcite druse (`Station 3`).
  4. **`card.fern.calamine`** — leathery dark-emerald karst cleft fern showing luminous pale-blue underside spore sori (`Stations 2, 3`).

---

## 7. Numbered `src/` architecture, rollout & verification invariants

### 7.1 Fragment map & `PORT.md` tags

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `CORE_BIOME_MIN` + `31j, 32, 33, 35, 39, 41..44`, `KDRAWN`, `KRAND`, `KTAGS`, `KSPACE`, `KSTRATA`, `KRELIEF`, `KCAVERN` + `KSPELEO` + `KKARST` + `cutLayer`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER`, `ATMOS`, `CROPS` |
| `40-biome-hollow-phys.js` | **`[G data]`** | `HOLLOW_PHYS`: `porphyryDikeAt`, `shutInFlowAt`, `mammothSpringAt`, `mvtCrystalAt`, `caveMouthGlowAt`, `ecocideScarAt` |
| `41-biome-hollow-sites.js` | **`[G data]`** | `HOLLOW_SITES`: surveyed `5.1` pixels, `tube_ozarks_15` hall specs, `9109` `Tlīla-Wāda` profiles, and `site:high-ria-*` / `site:karst-arcology` reserves |
| `45-host-stage.js` | `[web]` | Renderer, dolomite/porphyry terrain + `KKARST.network` + `KCAVERN.cutLayer` skylights/arch + `KSPELEO.place(CALCITE/LIMESTONE)`, `KDRAWN.add` (surface + cave floor) |
| `47a..47b` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `swlowlands` & `nhighlands` broadleaf/fern kin read in place |
| `50-biome-hollow-species.js` | `[G partial]` | `SPRINGHOLLOWS.SPECIES` (`8` own species), `HV` tags, `springcypress` knee/buttress builder, `tufabryum` dusk-emissive shader hook |
| `60-biome-hollow-place.js` | **`[G data]`** | Deterministic `KRAND.cell` surface + twilight-threshold + dark-cavern placement, `KSPACE` (`KSPELEO.blocks`), `CROPS`, `KTAGS` |
| `84-host-ground.js` & `86-host-works.js` | `[web]` | `KGROUND` (`<= 5` layers, bleach-belt hardpan mask), `KSTRATA` lateral dolomite/red-porphyry contact, `KFAR`, `KHORIZON`, `site:*` reserves & `?works=0` spring-gauge obelisk |
| `89a-host-atmos.js`, `89w-host-water.js`, `99-host-take.js` | `[web]` | `ATMOS` (`1.41..1.26 atm`, cave-mouth mist, fenestre sun-shafts), `WATER.karstSpring`/`still`/`flow`, `[Day]/[Dusk Cave-Glow]`, compliant views, `hostChecks()` |

### 7.2 Rollout milestones (`SH0–SH5`)
- **`SH0`:** Land `PLAN.md` (and updated `biomes/riavalley/PLAN.md`); add `"biomes/springhollows"` to all 5 checks in `tools/checks_optin.json` and append the 4 material slots to `core/materials/PROMPTS-NEEDED.md`.
- **`SH1`:** Implement `src/40-biome-hollow-phys.js` + `src/41-biome-hollow-sites.js` (`[G data]`) and pass `node biomes/springhollows/tests/test-hollow-phys.js` on `tools/ktest.js`.
- **`SH2`:** Build **Station 1 `spring`** (`dist/springhollows.html`): `cav_ozarks_resurgence` arch, `WATER.karstSpring` sapphire boil, `springcypress` gallery, `tufabryum` dusk glow, `verify.py --assert` (`checks=harness.SURVEY`).
- **`SH3`:** Build **Station 2 `shutin`** (`-shutin` red-porphyry whitewater pinch), **Station 3 `fenestre`** (`-fenestre` walk-in `KSPELEO.CALCITE` crystal cathedral), and **Station 4 `labyrinth`** (`-labyrinth` onyx-bridge hollow & Ancient bleach-belt scar).
- **`SH4–SH5`:** Register `CROPS.BIOMES.springhollows` (`71` crops, `test-crops.js`) and the 6 `kits/fauna` records; complete `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; pass `check_core_use.py`, `check_botany.py`, and `python3 tools/test_all.py`.

### 7.3 Z-fighting separation & `verify.py --assert` invariants (`T.ok` + `T.neg`)
1. **Shut-in hydraulic pinch (`porphyryDikeAt` & `shutInFlowAt`):** Proves `channelWidthM` drops from `>= 65 m` (`froude < 0.35`) in `carbonate-shelf` to `<= 24 m` (`froude > 1.15`, `whitewater01 > 0.85`, `liftBypassReq === true`) across red-porphyry dikes (`T.neg`: `liftBypassReq === false` in open dolomite hollows).
2. **`KSPELEO.CALCITE` `0.75 g` crystal & walkability check (`mvtCrystalAt`):** Proves `maxBeamLenM` reaches `14.0–14.5 m` inside `cav_ozarks_porphyry` (`Station 3`), `KCAVERN.cutLayer` cleanly clips surface `KGROUND` over the `16 m` skylight aperture (`zero` double-drawn roof skin or z-fighting at the cut lip!), `KDRAWN` eye clearance stays positive down the ramp onto the hall floor, and `KSPELEO.blocks` prevents flora/walker overlap (`T.neg`: zero `CALCITE` megabeams placed on open surface terrain).
3. **Twilight bryophyte confinement (`caveMouthGlowAt`):** Proves `tufabryum` places **only** in humid cave-brows/skylight throats (`0.04 <= skyOpenness01 <= 0.42`), with `T.neg` asserting zero `tufabryum` or `glow-mushroom` on open sunlit `skyOpenness01 > 0.6` hillsides.
4. **Lithological & cultural hygiene:** `porphyrypine` confined to `inDike === true`; `chinkapinoak` excluded from `inBleachBelt === true` hardpan core; `WATER.karstSpring` pool plane stepped `>= 0.06 m` above downstream `WATER.flow` riffle lip; zero `class === 'building'` records inside `site:high-ria-boatlift` or `site:karst-arcology`; `< 15` active samplers; `KSHADOW` off at load.

---

## 8. `build.py` assembly, `openworld/` karst streaming & Godot `4.7.2` twin contract

### 8.1 `build.py` deterministic cross-platform assembly (`AGENTS.md` rules)

```python
#!/usr/bin/env python3
"""Build biomes/springhollows stations -> dist/springhollows[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS check

STATIONS = ('spring', 'shutin', 'fenestre', 'labyrinth')
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '35-core-anim.js', '39-core-lean.js', '41-core-env.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js',
]
# Every text open() uses encoding='utf-8' (and newline='\n' when writing); all paths use '/'
```

### 8.2 `stations/<station>.json` & `materials.json` contracts

```json
{
  "id": "spring",
  "title": "Springhollows — Cav Ozarks Resurgence Mammoth-Spring & Cypress Hollow",
  "px": [1144, 168],
  "elevM": 1003.4,
  "pAtm": 1.41,
  "koppen": "Cfa",
  "rainMmYr": 1333,
  "springQMinM3s": 24.0,
  "cavernId": "cav_ozarks_resurgence",
  "tubeId": "tube_ozarks_15",
  "strataStack": "dolomite-porphyry-contact",
  "kin": ["swlowlands", "nhighlands"],
  "reserves": [
    { "id": "site:high-ria-springworks", "x": 92, "z": -64, "r": 38 }
  ],
  "modes": ["Day", "Dusk Cave-Glow"]
}
```

```json
{
  "slots": {
    "rock_dolomite": "rock.limestone",
    "rock_karst": "rock.limestone.karst",
    "ground_chert": "ground.gravel042",
    "ground_moss": "ground.sphagnum",
    "ground_needles": "ground.needles",
    "ground_glade": "ground.dry_grass",
    "bark_cypress": "bark.alder.lichen",
    "bark_oak": "bark.juniper",
    "card_oak": "card.broadleaf",
    "card_fern": "card.fern.green",
    "card_pine": "card.pine"
  }
}
```

### 8.3 `verify.py` shared-harness specification (`tools/harness.py` — no pasted launcher)

```python
#!/usr/bin/env python3
"""Verify biomes/springhollows stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'spring':    'dist/springhollows.html',
    'shutin':    'dist/springhollows-shutin.html',
    'fenestre':  'dist/springhollows-fenestre.html',
    'labyrinth': 'dist/springhollows-labyrinth.html',
}

if __name__ == '__main__':
    harness.main(
        pages=PAGES,
        default_page='spring',
        checks=harness.SURVEY,   # <15 samplers, KSHADOW off at load, KCAVERN.cutLayer & KSPELEO walk checks
    )
```

### 8.4 `openworld/` `tube_ozarks_15` linkage & Godot `4.7.2` parity
- **`core/world` + `KKARST` streaming:** When `rmvyiyw8ucd1y` streams at 1:1 in `openworld/`, the five strike-aligned red-porphyry dikes (`HOLLOW_PHYS.porphyryDikeAt`) automatically pinch `9109` `Tlīla-Wāda` and tributary widths (`shutInFlowAt`), place `porphyrypine` glades on ridges, and reserve `site:high-ria-boatlift` banks for High-Ria transit kits, while `tube_ozarks_15`'s three canonical caverns (`1212, 174`, `1176, 184`, `1144, 168`) load deterministic `KKARST` + `KSPELEO.CALCITE` sub-tiles seamlessly connected to [`biomes/spiderlake`](file:///home/antigravity/traviso761-debug/krator-master/biomes/spiderlake/PLAN.md)'s `[1246, 206]` conduit.
- **Godot `4.7.2` GDScript twin (`godot/krator/biome/hollow_phys.gd`):** Pure `[G data]` records (`KRAND` integer hashes, `x == null ? d : x` defaults, zero `THREE`/DOM) export `golden-hollow-phys.json` vectors verified alongside `core/terrain/test-karst.js` and `core/terrain/test-speleo.js` in headless Godot `4.7.2`.
