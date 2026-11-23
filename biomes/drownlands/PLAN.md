# drownlands: the plan (locked design, 2026-11-22)

**The Drownlands** (`rmwete7oza9d9` / `drownlands` in Scale Model `5.1`): a `612 km`-long (`X = 22..215, Y = 332..638`, **`161,804 km²` total envelope**: **`32,516 km²` low skerry-and-horst dry land [`20.1%`]** interlaced with **`129,288 km²` of warm marine shoals, drowned-valley lagoons, and fault-graben channels [`79.9%`]**) half-submerged coastal archipelago on Krator's north-western ocean margin. It occupies the structural and geochemical hinge between **`The Arch`** (`biomes/arch/PLAN.md`: magma-starved ultramafic serpentinite tidal dilational band, `nickel = 180`), the **`Steaming Seamounts`** immediately on its northern lip (`176, 322` Krakatoan caldera & `166, 338` Surtseyan vent — near-field source of the `35–55 m` megatsunamis), **`Crookshore`** (`biomes/crook/PLAN.md`) to the south, and **`Farside` / `Farport`** (`294, 588`) across the deep sound to the east.

Bathed in `1.60 atm` equatorial-tropical monsoon air (`Am` `90.3%`, **`1,694 mm/yr`** median rainfall, **`+27.0 °C`** annual mean [`+32 °C` warm / `+22 °C` cold], `pO2 = 0.336 atm`, `g = 7.4 m/s²` / `0.75 g`), `90%` of Drownlands' dry land stands below `+166 m` (`p5 = +6.6 m`, **`p50 = +23.7 m`**, `p95 = +248.0 m`). Because it sits only `20–560 km` south of the `Steaming Seamounts` (`15–55 min` near-field tsunami arrival) and directly in the `287°–294°` WNW sightline of the Globe's `14–15 km` **Farside Tsunami Shields** (`3.3–6.2 hr` silent "Ghost Tsunamis"), **virtually the entire `< +45..+65 m` archipelago is periodically swept over by `15–55 m` bores**.

Where `Double Delta` (`biomes/doubledelta/PLAN.md`) is a flat `95% sedimentary` freshwater-estuarine silt bowl, **Drownlands is a marine, rock-bottomed, bimodal ultramafic-and-drowned-valley skerry maze**:
1. **`42,004 km²` of sunlit `< 40 m` turquoise-and-ochre marine shoals** (`39,780 km²` `40–100 m` sounds + `47,504 km²` `>= 100 m` fault-trench refuges) threaded by submarine/intertidal giant seagrass and tethered kelp-meadow channels, sponge-coral boulder pavements, and imbricated **megatsunami serpentinite-and-nephrite boulder-bars**.
2. **Amphibious Nickel-Hyperaccumulating Prop-Root Woods (`55.9% ultramafic`, `nickel = 180`):** Across `18,304 km²` of waxy green-black serpentinite skerries, wave-elastic mangrove-like prop-root trees and shrubs (*Rhizophora* + New Caledonian *Pycnandra* convergence) grip fractured ultramafic rock with braided cable-roots and bleed vivid **teal-blue `18–25% Ni` latex sap** (`sève bleue`) when storm-gashed or coppiced by phytominers.
3. **Intertidal Alkaline Brucite & Travertine Chimneys (`pH 10.5–11.6`):** Where Type-II `Ca-OH` (`H2`-bearing) serpentinization seeps vent into `Mg2+`-rich `1.60 atm` tidal channels, Lost-City-style **chalk-white and turquoise brucite-aragonite stacks** (`0.8–6.5 m` tall, exposed at `0.5 m` libration low water) steam gently beside native Kratorian alkaliphile `limeshelf` and `seepcomb` colonies.
4. **Subsiding Drowned-Valley Snag Lagoons (`44.1% sedimentary`, `coal = 214`):** Across `14,448 km²` of southeastern fault-tilted sandstone/coal valleys, episodic graben subsidence and megatsunami scour leave ghostly groves of **salt-petrified, oyster-and-sponge-encrusted forest snags** standing in `-4 to +1.5 m` emerald lagoons, haunted by **`cFlīt-qBōn`** (*"Fleet-Born"*) click-speaking boat-nomad Ark-Wards (`kits/ringsea/` `89c–89g`) and **`Hueru-Kuran`** whalers (`89h`).

Status: **Build-ready specification** aligned with `CROOK-RIA-DECISIONS.md` (§1.1–§1.5), `CONTINENTAL-SCOPE.md`, `biomes/arch/PLAN.md`, and `biomes/crook/PLAN.md`. Zero edits to `tools/scale-model/` or `kits/`.

---

## Core adoption

Written first per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and verified against `tools/check_core_use.py` (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (2026-11-11 survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/drownlands` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('drownlands')` registry; `31j` `BIO.flareJoin` on braided amphibious prop-roots and drowned snag buttresses; `32` `BIO.kin` reading `biomes/arch` (`araucaria`, `pycnandra`, `gymnostoma`, `verdigris`, `limeshelf`, `seepcomb` on `ultramafic` skerries) and `biomes/crook` / `biomes/farside` (`spraycushion`, `stormwrack` drift); `33` `BIO.fung` for intertidal sponge-corals and brucite-vent `limeshelf` collars; `34` octahedral impostors on `> +50 m` refuge-crown araucarias & tall snags; `35`/`39` current-and-monsoon sway |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers skerry bedrock, shoal bathymetry, boulder-bars, and brucite terrace steps via `KDRAWN.add(KDRAWN.grid(...))` for survey item 28 eye-clearance checks |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Order-independent cell hashes (`KRAND.cell(seed, ix, iz)`, `KRAND.hash`) for every skerry outcrop, prop-root tangle, drowned snag, brucite chimney, boulder-bar clast, and seagrass patch |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every flora/sponge/chimney record, `nickel`/`coal`/`jade` resource node, hazard volume, sacrificial phytomining/mooring prop, and `site:cflit-qbon-*` / `site:prou-torre-*` reserves |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Spatial occupancy keeping brucite chimneys, prop-root domes, tsunami boulders, navigation channels, and mooring reserves non-overlapping |
| **`core/coast`** | `core/coast/30-core-coast.js` (`KCOAST`) | Multi-island `rock`, `shingle`, `sand`, and `marsh` shoreline profiles, signed `coastC`, and shoal exposure fields across the skerry labyrinth |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `38-core-relief.js` (`KRELIEF`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` recipes: `serpentinite` + `laterite` on NW/central ultramafic skerries (`Stations 1, 2, 4`), laterally faulted against `coal`-bearing `sedimentary` drowned-valley sandstone/shale (`Station 3`); `KRELIEF` for fault-graben trenches (`> 80 m` deep), boulder-bar chevrons, and wave-planed benches; `KGROUND` (`<= 5` layers per station); `KFAR` (`14 km` skerry-and-seamount horizon) + `KHORIZON` |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js`, `farbed/53-core-water-farbed.js` | `WATER.open` rendering crystal-turquoise `< 15 m` carbonate/brucite shoals grading abruptly into deep indigo `-85 m` fault-trench escape channels (with heavy `1.60 atm` breakers on outer `Station 2 bar` and sheltered tidal currents on `Stations 1, 3`, `WATER.mirrorSwitch` off at load); `WATER.still` for milky-blue `pH 11.4` intertidal brucite pools; `WATER.flow` for tidal race chutes between skerries; `farbed/53` seamlessly extending shallow shoal beds |
| **`core/atmos`** | `89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover.js`, `fx/lightning.js` | Shared Krator sky at each station's `5.1` pixel shifted by `(-272, -330)` (`pressure: 1.60`), `#include <atmos_waves>` driving prop-root & seagrass sway, warm `Am` squalls, surf-spray & warm alkaline-chimney vapour wisps, and distant `Steaming Seamounts` horizon haze on `Station 2` |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazard volumes: `drownlands:alkalipool` (`pH 11–11.8` caustic brucite vent pools), `drownlands:tidalrace` (`3–5 m/s` constricted skerry-gap currents), `drownlands:bore` (`< +45 m` tsunami over-wash & drawdown exposure), and `drownlands:snagreef` (submerged hull-ripping snag/boulder shoals) |
| **`core/materials`** | `core/materials/record/23-mat-record.js`, `25-matlib-host.js` + `tools/textures/matlib_pack.py` | Packed library textures from `materials.json` (`tex/pack.json`, deduplicating `arch` kin via `exclude`), keeping active shader samplers `<= 12` (`< 15` survey gate) |
| **`core/shadow`** | `core/shadow/10-core-shadow.js`, `host/12-core-shadow-host.js` (`KSHADOW`) | Sun shadow cascade **off at page load** (`?shadow=1` or UI toggle attaches on demand, owner rule 2026-11-03) |
| **`core/host`** & **`core/walk`** | `khost.FULL` + `94-host-polytool.js` | Camera, walk/wade controller, world clock, inspector hover/click tags, polygon tool, `[Low Water] / [Drawdown] / [Swell]` tidal-and-tsunami preview toggle, preset views, `window._api` |
| **`core/export`** | `core/export/07-core-export.js`, `09-core-export-adapters.js` | `krator-world` tile & `DROWN_PHYS` export for `openworld/` and Godot `4.7.2` |
| **`kits/crops`** | `kits/crops/src/10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js` (`CROPS`) | Read in place (`[G data]`): defines `CROPS.BIOMES.drownlands` across 4 zones (`shoal`, `ultramafic`, `drowned`, `highskerry`) for wild seagrass, sea-grapes, coconut, taro, and coppiced bio-ore |
| **`kits/fauna`** | `kits/fauna` (`[G data]` records first) | Registers 6 amphibious hexapod, cetacean-commensal, and shoal species with diets, yields, and 24h `core/sched` schedules |
| **`kits/resources`** | Read-only contract (`kits/resources/GEOLOGY.md`, `data/geology.json`) | Honours surveyed `5.1` bytes (`ultramafic = 255`, `nickel = 180`, `coal = 214`, `clay = 255`, `oil = 137`, `iron = 180` + 39-family `jade = 200`, `peat = 157`, `silica = 150`) |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/mask`** (`KMASK`) | **No** (on station pages) | Shoal channels, fault trenches, boulder-bars, and brucite seeps are evaluated from pure `[G data]` functions in `DROWN_PHYS` (`getImageData` is zero); `openworld/` uses `KMASK.distance` via `core/world/44c-world-coast.js` |
| **`core/city`**, **`core/hamlet`**, **`core/camp`** | **No** | On the `< +24 m` Drownlands shelf, permanent stone towns are planed flat every century (`CROOK-RIA-DECISIONS.md` §1.1, §1.3): the `~8,000` **`cFlīt-qBōn`** live aboard mobile **`kits/ringsea/` Ark-Wards (`89c–89g`)** moored over `> 80 m` trenches, while dry-stone basalt **`Prou-Torres`** inundation refuge keeps and mooring trenches are registered as `KTAGS` `site:*` reserves (with optional `?works=0` mooring rings, hydrophone jars, and phytomining ash-retorts as `class: 'furniture'`) |
| **`core/simulation`**, **`core/sched`** | **No** | Biome showcase pages run no live trade/vessel tick; fauna carry `core/sched` tables as plain `[G data]` |
| **`core/engine`**, **`core/furnish`**, **`core/catalog`**, **`core/ruins`** | **No** | Zero buildings, interiors, or Ancient ruins inside `rmwete7oza9d9` (`g_ruin === 0` across all `2,047` dry `4 km` cells) |
| **`core/water/geyser`** | **No** | Active Krakatoan/Surtseyan vents lie north inside `rmvseamounts` (`biomes/arch --station coast`); Drownlands' own intertidal chimneys are **warm (`28–44 °C`) `pH 11` serpentinization brucite/aragonite seeps**, rendered via `BIO.fung` / `KRELIEF` + `WATER.still` + `ATMOS` vapour |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/drownlands"` enters all five opt-in lists (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`) from commit 1: `build.py` calls `buildlib.through_tools_build(__file__)` and `build_sources.report()`, extends `buildlib.CORE_BIOME_MIN`, refuses LFS pointers, registers drawn ground in `KDRAWN`, keeps shader samplers `< 15` (`9–12` target), uses `tools/ktest.js` (`T.ok` + `T.neg`), and forbids `'` and `:` in all preset view names.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/drownlands/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmwete7oza9d9`** (*drownlands*): **`161,804 km²` total** (**`32,516 km²` dry land** + **`129,288 km²` shallow shoals & fault-sound channels**), `X = 22..215, Y = 332..638`, centroid `(119.0, 481.6)` on the `1821 × 1723` (`2 km/px`) canvas |
| **Pages (`4` Stations)** | `dist/drownlands.html` (**Station 1 `shoal`**: Teal-Sap Nickel-Mangrove Skerries, Brucite Chimneys & Trench Mooring at `145, 520`), `--station bar` (`195, 420` Tsunami Serpentinite-Jade Boulder-Bar & Sponge-Coral Flat facing `Steaming Seamounts`), `--station drowned` (`95, 545` Subsiding Drowned-Valley Snag Lagoon & Detachment Contact), and `--station skerry` (`145, 495` High `+125 m` Serpentinite Refuge Crown & Trimline Cliff) |
| **Objects** | **`DROWN_PHYS`** (`[G data]` in `src/40-biome-drown-phys.js`: shoal optics/bathymetry, two-source tsunami over-wash & trench escape time, submarine/intertidal brucite-aragonite chimney precipitation, amphibious nickel-latex uptake, and ultramafic-vs-sedimentary ecotone gating; tested by `tests/test-drown-phys.js`) and **`DROWN`** (`BIO.kit('drownlands')`) |
| **Read in place (`BIO.kin`)** | **`biomes/arch`** (`araucaria`, `agathis`, `gymnostoma`, `pycnandra`, `verdigris`, `limeshelf`, `seepcomb` — restricted to `ultramafic` rock, with tall `araucaria`/`agathis` strictly above the `+45..+55 m` tsunami trimline on `Station 4 skerry`); **`biomes/crook`** / **`biomes/farside`** (`spraycushion`, herbaceous `stormwrack` / `wineweed` wrack, zero `landkelp` trees) |
| **Cultural Tie-In** | Primary archipelago of the **`~8,000` `cFlīt-qBōn`** (*"Fleet-Born"* click-speaking pelagic boat nomads, `CROOK-RIA-DECISIONS.md` §1.2–1.4) whose `kits/ringsea/` Ark-Fleet (`arkCatamaran`, `arkSmelter`, `arkDiveTender`, `arkScoutTri`, `arkChainedWard`) moors over `80–150 m` graben trenches, coppices teal-sap nickel shrubs to smelt **Paktong (`Cu-Ni-Zn`)**, and shares outer whaling channels with **`Hueru-Kuran`** twin-hulled catamarans (`hkWhaler`) |

---

## 1. Geological, bathymetric & climatic ground truth (`Scale Model 5.1`)

### 1.1 Exact surveyed raster & `geology.json` metrics (`rmwete7oza9d9`)

Directly sampled on `tools/scale-model/model/data/` (`h.png`, `wl.png`, `c.png`, `p.png`, `tm/tw/tc.png`) and `kits/resources/data/geology.json`:

| Metric (`Scale Model 5.1`) | Surveyed Value in `rmwete7oza9d9` (*drownlands*) | Ecological & Physical Consequence |
|---|---|---|
| **Total / Land / Water Area** | `161,804 km²` total = **`32,516 km²` dry land (`20.1%`)** + **`129,288 km²` sea (`79.9%`)** | A true `4:1` sea-to-skerry labyrinth (`8,129` dry `2 km` pixels broken into hundreds of fault-aligned skerries, shoal-bars, and drowned headlands) |
| **Bathymetric Depth Tiers (`129,288 km²`)** | **`< 40 m` sunlit shoals: `42,004 km²` (`32.5%`)**; `40–100 m` sounds: `39,780 km²` (`30.8%`); **`>= 100 m` fault trenches: `47,504 km²` (`36.7%`, `p5 = -255.8 m`, med `-70.2 m`)** | Photic `< 40 m` turquoise-ochre benches host vast kelp/seagrass channels & brucite stacks, immediately adjacent to `> 80–255 m` graben rifts where `cFlīt-qBōn` Ark-Wards ride out megatsunamis in deep water! |
| **Dry Elevation (`p5 / p10 / p50 / p90 / p95 / max`)** | **`+6.6 / +7.0 / +23.7 / +166.0 / +248.0 / +432.0 m`** (min `-20.1 m` tidal pan) | **Over `78%` of dry land lies below `+55 m`**: almost every island is periodically over-topped by Tier-2/3 tsunamis, selecting for amphibious prop-root scrub below `+45..+55 m` and rare refuge-crown forest above |
| **Atmosphere & Gravity** | **`1.60 atm` median** (`1.60 atm` at `0 m` to `1.55 atm` at `p95 = +248 m`; `pO2 = 0.336 atm`), `0.75 g` (`7.4 m/s²`) | Warm, hyperoxic dense air buoys seabirds, slows low-tide desiccation of intertidal sponge-corals, and steepens wind-waves across shallow shoals |
| **Köppen, Rainfall & Temp** | **`Am` 90.3% (`29,364 km²`)**, `Cfa` 7.7% (`2,488 km²` S margin), `Aw` 2.0% (`660 km²`); rain `p5 / p50 / p95` = **`1,522 / 1,694 / 1,773 mm/yr`**; **`+27.0 °C`** (`+32.0 / +22.0 °C`) | Frost-free equatorial-monsoon warmth (`22.5°–29.8°S`), heavy warm downpours leaching red nickel-laterite on high skerries and flushing freshwater lenses into tidal lagoons |
| **`geology.json` Lithology Split** | **`55.9% ultramafic` (`18,304 km²`, NW & central horst skerries)** + **`44.1% sedimentary` (`14,448 km²`, SE drowned-valley shale, sandstone & coal blocks)** | Sharp geological contrast: toxic `Ni/Mg` green-black serpentinite & red laterite skerries meet subsided `coal = 214` / `clay = 255` sedimentary valleys along active detachment faults! |
| **Verified Mineral Bytes (`geology.json` + 39-fam)** | `ultramafic = 255` (`1,144` c), **`nickel = 180`** (`1,144` c / `514` nd), **`coal = 214`** (`903` c `>= 80` / `1,062` nd), `clay = 255` (`975` c), `oil = 137` (`332` c), `iron = 180` (`3` c); 39-fam **`jade = 200`** (`271` nd at detachment contacts), `peat = 157` (`937` nd), `silica = 150` (`180` nd), `lodestone = 40` (`70` nd) | Fuels `cFlīt-qBōn` **Paktong phytomining** (`nickel = 180` bio-ash fired with local `coal = 214` / `peat = 157` in shore retorts & `arkSmelter` barges) plus sea-tumbled **nephrite jade** boulder-bars (`jade = 200`) |

### 1.2 Two-source tsunami physics, shoal amplification & deep-trench escape (`DROWN_PHYS`, `[G data]`)

Authored in `src/40-biome-drown-phys.js` (zero `THREE`, zero `DOM`, deterministic on `KRAND`, tested by `tests/test-drown-phys.js`):

1. **`DROWN_PHYS.tsunamiAt({px, py, elevM, depthM, seamountDistKm, trenchDistM, tier}) -> {travelMinNear, travelHrFar, shoalWaveM, boreVelMs, trimElevM, arkEscapeOk, prouTorreReq}`**
   - **Near-field `Steaming Seamounts` (`176, 322` & `166, 338`, `12–580 km` N):** Wave arrival is **`14–52 minutes`** after felt seismic P-waves and Surtseyan thunder. As long-period waves shoal from `-180 m` fault grabens onto `-8..0 m` benches (`Green's Law`: $H \propto d^{-1/4}$), crests steepen to `4–10 m` (Tier 1, `3–7 yr`), `16–28 m` (Tier 2, `20–35 yr`), and **`38–55 m` (Tier 3, `150–300 yr`)**, setting `trimElevM = 45.0–62.0 m` (above which non-amphibious `araucaria` / `agathis` trees survive on `Station 4 skerry`).
   - **Far-field `Farside Tsunami Shields` (`2,050–4,100 km` WNW):** Arrive as **silent Ghost Tsunamis** (`zero` local quake), detected `20–30 min` early by `cFlīt-qBōn` submerged **ceramic/nephrite hydrophone-jars** suspended in `-90 m` fault rifts and by rapid `-10 to -18 m` shoal drawdown.
   - **Deep-Water Escape vs. *Prou-Torres* (`CROOK-RIA-DECISIONS.md` §1.1):** Returns `arkEscapeOk: true` where a `depthM >= 80 m` fault trench lies within `trenchDistM <= 1200 m` (`< 4 min` haul-out on `arkChainedWard` anchor cables, where a `50 m` coast-breaking tsunami passes underneath as a gentle `2.5–4 m` long-period ocean swell!); on wide `< 25 m` shoals with `trenchDistM > 1500 m`, sets `prouTorreReq: true` (`site:prou-torre-*` dry-stone columnar refuge keeps with knife-edge seaward prows and `+22 m` dogging hatches).
2. **`DROWN_PHYS.bruciteStackAt({ultramaficByte, faultDistM, waterDepthM, tidalRangeM, waveShearPa}) -> {active, pH, h2Mmol, stackHeightM, subaerialTopM, turquoiseMilk01}`**
   - Models submarine-to-intertidal **Lost City brucite-aragonite precipitation**: when `pH 11.2–11.8` `Ca2+`/`OH-`/`H2`-rich serpentinite fault water vents into `Mg2+`/`HCO3-` seawater at `-8.0 <= waterDepthM <= +0.4 m` under moderate shelter (`waveShearPa < 320`), $\text{Mg}^{2+} + 2\text{OH}^- \rightarrow \text{Mg(OH)}_2$ (brucite) and $\text{CaCO}_3$ (aragonite) precipitate `0.8–6.5 m` white fluted chimneys (`stackHeightM` boosted `1.33×` by `0.75 g`) whose crowns stand `0.2–1.1 m` awash at low libration tide and tint surrounding slackwater milky-turquoise (`turquoiseMilk01`).
3. **`DROWN_PHYS.nickelMangroveAt({ultramaficByte, niByte, elevM, depthM, trimElevM, waveShearPa}) -> {propRootOk, coppiceShrubOk, refugeTreeOk, latexNiPct, barkCrust01}`**
   - Enforces strict lithological and elevation partitioning: amphibious **teal-sap prop-root woods (`verdigrismangrove`)** occupy `-1.2 <= elevM <= +18 m` on `ultramafic` shores (`latexNiPct = 18.0..24.5%` dry weight); wind-sheared **`pycnandra` / `tealcoppice`** shrubs hold `+4..trimElevM`; tall rigid **`araucaria` / `agathis`** are barred (`refugeTreeOk: false`) everywhere below `trimElevM`!
4. **`DROWN_PHYS.snagLagoonAt({sedimentary01, coalByte, depthM, subsidenceM, shelter01}) -> {snagDensity01, encrustHeightM, peatMat01, driftwoodBoom01}`**
   - Models fault-subsided southeastern `sedimentary` (`coal = 214`) valleys where drowned hardwood trunks (`snaggrove`) stand preserved in mineral-rich brackish water (`-4.5 to +1.2 m`), armored up to high-tide mark (`encrustHeightM`) in cemented oysters, sponges, and barnacles while trapping rafts of tsunami-seasoned ship timber (`driftwoodBoom01`).

---

## 2. Ecological zones & bimodal lithological mosaic

| Zone Key | Elev / Depth | Lithology (`geology.json`) | Substrate (`KGROUND` / `KSTRATA`) | Dominant Biota & Visual Signature |
|---|---|---|---|---|
| **`1. kelpchannel`** (*Turquoise-Ochre Shoals & Trench Lips*) | `-35.0 .. -0.5 m` (`42,004 km²` `< 40 m`) | Both `ultramafic` & `sedimentary` benches | Rippled carbonate/olivine shoal sand, ochre iron-oxide/sponge pavement, plunging black `serpentinite` trench walls | Submarine forests of **buoy-bladdered `shoalkelp`** and emerald **`ribbonseagrass`** streaming in tidal currents; crustose **ochre-and-violet `spongecoral`** carpets |
| **`2. bruciteflat`** (*Intertidal Alkaline Chimney Gardens*) | `-3.0 .. +1.5 m`, `pH 10.2–11.7` | `ultramafic = 255` detachment faults (`Station 1`) | White aragonite-brucite sinter aprons over slickensided green-black `serpentinite` | `0.8–6.5 m` chalk-white **brucite-travertine chimneys (`brucitestack`)** steaming at low tide, ringed by native Kratorian **`limeshelf`** plates and **`seepcomb`** `H2`-oxidizing frills in milky-turquoise pools |
| **`3. propwood`** (*Amphibious Teal-Sap Prop-Root Thickets*) | `-1.2 .. +18.0 m` (`< trimElevM`) | `ultramafic = 255`, **`nickel = 180`** (`Stations 1, 2, 4`) | Fractured green serpentinite ledges & rust-red nickel-laterite mud | **`4–11 m` `verdigrismangrove` (teal-sap prop-root trees)** whose interlocking elastoplastic stilt-roots flex through `15 m` surges and weep luminous **teal-blue `22% Ni` latex** from storm scars |
| **`4. boulderbar`** (*Megatsunami Serpentinite-Jade Chevrons*) | `+0.5 .. +38.0 m` (exposed N/WNW faces) | `ultramafic` / `sedimentary` contact (`jade = 200`, `Station 2`) | Imbricated `1–6 m` dark serpentinite, white magnesite, and translucent green **nephrite jade** boulder ridges | Wave-scoured chevron ramparts encrusted in **`spongecoral`** cushions, **`tealcoppice`** phytomining scrub in leeward pockets, and crimson `stormwrack` lines |
| **`5. snaglagoon`** (*Drowned-Valley Ghost-Snag & Coal Bays*) | `-4.5 .. +12.0 m` | `sedimentary` (`44.1%`), **`coal = 214`**, `clay = 255` (`Station 3`) | Drowned `peat = 157` / black `coal` seams & estuarine clay | Hundreds of bleached, salt-petrified **drowned forest snags (`snaggrove`, `6–22 m`)** sleeved below `+1.8 m` in visor-oysters and ochre sponges, plus floating tsunami-driftwood rafts |
| **`6. refugeskery`** (*Un-Swept High Laterite Skerry Crowns*) | **`+48.0 .. +248.0 m`** (`>= trimElevM`) | `ultramafic` (`Station 4`) or `sedimentary` southern bluffs | Brick-red `laterite` cuirasse over `KSTRATA` `serpentinite` (`Station 4`) | Razor-sharp tsunami trimline above which stand wind-sculpted **`biomes/arch` candelabra `araucaria`**, `agathis`, `gymnostoma`, and native `verdigris` nickel-crust caps |

---

## 3. Station catalogue (`4` verified Scale-Model `5.1` sites)

Every station `(px, py)` is directly verified on `5.1` rasters (`sky frame = (px - 272, py - 330)`). All preset view names strictly obey survey item 30 (zero `'` and zero `:`).

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | Elev, `10 km` Relief & `P_atm` | Climate, Rain & `T` (`w/c`) | `KSTRATA` & `geology.json` | Core Ecological & Cultural Signature |
|---|---|---|---|---|---|---|
| **1** | **`shoal`** *(main)* `dist/drownlands.html` | **`(145, 520)`** `(-127, +190)` | **`+6.1 m`** skerry (`-84..+16 m` in `10 km`), **`1.60 atm`** | `Am`, **`1,710 mm`**, **`+27 °C`** (`+32/+22`) | `serpentinite` + `laterite`; `ultramafic = 255`, **`nickel = 180`**, `clay = 255` | **Teal-Sap Nickel-Mangrove Skerries, Intertidal Brucite Chimneys & `-84 m` Ark-Ward Trench:** Turquoise `< 12 m` seagrass/kelp shoals + milky-blue `brucitestack` vents dropping off into a deep `-84 m` fault-graben escape channel (`site:ark-ward-trench`) |
| **2** | **`bar`** `--station bar` `dist/drownlands-bar.html` | **`(195, 420)`** `(-77, +90)` (`82 km` SSE of `166, 338` Surtseyan vent!) | **`+8.4 m`** bar (`-69..+115 m` in `10 km`), **`1.60 atm`** | `Am`, **`1,663 mm`**, **`+28 °C`** (`+32/+23`) | `serpentinite` + `ophiolite`; `ultramafic = 255`, **`nickel = 180`**, 39-fam **`jade = 200`** | **Megatsunami Serpentinite-Jade Boulder-Bar, Intertidal Sponge-Coral Flats & Phytomining Coppice:** V-shaped `28 m` imbricated boulder chevrons facing `Steaming Seamounts` horizon steam, `tealcoppice` bio-ore plots, and `site:prou-torre-north` refuge reserve |
| **3** | **`drowned`** `--station drowned` `dist/drownlands-drowned.html` | **`(95, 545)`** `(-177, +215)` (meeting `120, 545` ultramafic fault) | **`+26.4 m`** neck (`-11..+33 m`), **`1.59–1.60 atm`** | `Am`, **`1,678 mm`**, **`+27 °C`** (`+31/+22`) | `sedimentary` (`coal = 206, clay = 255`) faulted against `serpentinite` | **Subsiding Drowned-Valley Snag Lagoon & Driftwood Harvest Cove:** Salt-petrified `snaggrove` ghost forest standing in `-4..+1 m` emerald tidewater above black `coal = 206` benches, oyster/sponge collars, and boomed ship-driftwood rafts |
| **4** | **`skerry`** `--station skerry` `dist/drownlands-skerry.html` | **`(145, 495)`** `(-127, +165)` | **`+53.1 m`** bench (`-52..+125 m` in `10 km`), **`1.59 atm`** | `Am`, **`1,616 mm`**, **`+26 °C`** (`+31/+21`) | `serpentinite` capped by red `laterite`; `ultramafic = 255`, **`nickel = 180`** | **High `+125 m` Refuge Skerry & `+48 m` Tsunami Trimline:** Scoured green serpentinite cliffs & amphibious `verdigrismangrove` coves below `+48 m`, crowned above `+48 m` by un-swept red-laterite **`arch` candelabra `araucaria`** & `pycnandra` maquis |

### 3.1 Station 1 (`shoal`, main page `dist/drownlands.html`): Teal-Sap Nickel-Mangrove Skerries, Brucite Chimneys & Trench — `(145, 520)`
- **Site & Framing (`5.6 × 5.6 km`):** Anchored at `(145, 520)` (`sky -127, +190`), where dozens of low (`+1.5 to +16 m`) slickensided dark-green `serpentinite` skerries rise out of a broad `-1.5 to -14 m` sunlit carbonate/olivine sand shoal (`WATER.open` + `farbed/53`), sliced along its western flank by an abrupt **`-84 m` indigo fault-graben escape trench** (`KRELIEF`).
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* `serpentinite` (`1.5–4 m` sheared waxy dark-green peridotite/antigorite benches laced with white chrysotile-magnesite veins) capped above `+8 m` by `0.8–2 m` mottled rust-red `laterite`.
  - *Ground (`5` layers):* `ground.damp_beach_sand` (turquoise-tinted carbonate/olivine shoal sand), `rock.sinter.brucite` (intertidal `pH 11` chimney aprons), `ground.laterite` (high skerry pockets), `organic.sponge.shoal` (low-tide boulder pavement), `ground.lakebed.shells` (storm-sorted coral/shell troughs).
- **Signature Ecology & Geochemistry:**
  - Sheltered skerry margins are skirted by dense **`verdigrismangrove`** thickets whose arched, braided prop-roots wade `-1.0 to +2.5 m` through the surf and weep bright **teal-blue nickel latex** where branches chafe in trade winds.
  - Along the detachment-fault step between shoal and trench, `18–30` chalk-white **intertidal brucite-aragonite chimneys (`brucitestack`, `1.2–5.8 m`)** stand awash at low libration water, venting warm (`+34 °C`, `pH 11.4`) fluid into milky-turquoise `WATER.still` pools rimmed by native `limeshelf` and `seepcomb`.
  - Clear `< 10 m` channels wave with **`ribbonseagrass`** and tethered **`shoalkelp`** (which terminates sharply at the `-28 m` trench drop-off, visually marking deep safe water for boat crews!).
  - **Human Footprint Reserve:** Along the `-84 m` trench lip, `site:ark-ward-trench` (`r = 320 m` deep-water mooring zone) holds clear berth space for `cFlīt-qBōn` `arkChainedWard` and `arkSmelter` vessels (`kits/ringsea/` `89d`, `89g`), marked under `?works=0` by three cyclopean carved nephrite mooring-rings and a submerged ceramic/bronze hydrophone warning buoy.
- **Interactive Host Toggle (`[Low Water] / [Drawdown] / [Swell]`):**
  - `Low Water` (`-0.3 m` libration ebb): exposes full `brucitestack` bases, steaming milky pools, and sealed `spongecoral` flats.
  - `Drawdown` (`-9.5 m` pre-Ghost-Tsunami withdrawal): drains the `< 10 m` seagrass shoals dry while keeping the `-84 m` escape trench deep and navigable; triggers the hydrophone buoy harmonic alert.
  - `Swell` (`+5.5 m` Tier-1 surge): submerges low skerries while `verdigrismangrove` cable-roots flex `35°` without snapping!
- **Preset views:** `overview`, `teal-mangrove-cove`, `brucite-chimneys`, `trench-dropoff`, `kelp-shoal-channel`, `mooring-rings`.

### 3.2 Station 2 (`bar`, `dist/drownlands-bar.html`): Megatsunami Boulder-Bar & Sponge-Coral Flat — `(195, 420)`
- **Site & Framing (`5.6 × 5.6 km`):** Set on Drownlands' northern frontier at `(195, 420)` (`sky -77, +90`, only `82 km` SSE of `Steaming Seamounts` Surtseyan caldera `166, 338`, whose faint white phreatomagmatic steam column rises on the NNW `KFAR` horizon). Heavy `1.60 atm` rollers (`WATER.open` outer-coast breaker share) hammer a `2.4 km`-long V-shaped **megatsunami boulder-bar chevron** (`+2 to +28 m`) linking two `+85..+115 m` serpentinite headlands.
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* `ophiolite` (pillow-basalt & sheeted-dyke outer headland) faulted against `serpentinite` footwall.
  - *Ground (`5` layers):* `ground.gravel042` (imbricated serpentinite-magnesite cobble lag), `organic.sponge.shoal` (intertidal sponge-coral flat), `ground.damp_beach_sand` (black-olivine swash), `ground.laterite` (leeward phytomining pockets), `rock.gossan` (oxidized ultramafic iron-crust).
- **Signature Ecology & Works:**
  - Storm-imbricated `1–5 m` megaboulders of dark serpentinite, white magnesite, and water-tumbled **emerald nephrite jade (`jade = 200` `owner` nodes)** frame a `600 m`-wide intertidal **sponge-coral flat (`spongecoral`, `tidefan`)** that seals watertight at low tide.
  - Leeward `+12..+38 m` laterite benches hold managed rotational plots of **`tealcoppice`** nickel-ash scrub. `site:prou-torre-north` (`+14 m` bedrock rib, `r = 45 m`) reserves a streamlined columnar-basalt inundation refuge tower (`CROOK-RIA-DECISIONS.md` §1.1.1); `?works=0` places a low coal-fired brick nickel-calcining hearth and nephrite boulder-claim cairns (`class: 'furniture'`).
- **Preset views:** `overview`, `boulder-chevron`, `sponge-coral-flat`, `phytomine-coppice`, `seamount-horizon`, `prou-torre-site`.

### 3.3 Station 3 (`drowned`, `dist/drownlands-drowned.html`): Subsiding Drowned-Valley Snag Lagoon — `(95, 545)`
- **Site & Framing (`5.2 × 5.2 km`):** Captures Drownlands' **`44.1% sedimentary` (`coal = 206, clay = 255`)** southeastern province at `(95, 545)` (`sky -177, +215`), where a dendritic fluvial valley dropped `6 m` during a graben-fault episode along the eastern `120, 545` ultramafic detachment boundary.
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* Local `drowned-coal-measure` column (cross-bedded buff sandstone and grey estuarine shale seamed with `0.8–1.6 m` jet-black **`coal = 206`** bituminous ledges) meeting slickensided `serpentinite` across the eastern tidal gut.
  - *Ground (`5` layers):* `ground.bayoumud` (estuarine lagoon silt), `ground.peat` (subsided drowned forest floor), `ground.lakebed.shells` (visor-oyster shell banks), `ground.damp_beach_sand` (tidal gut spit), `ground.gravel019` (detachment cobble lag).
- **Signature Ecology & Works:**
  - Hundreds of **salt-cured, mineralized hardwood snags (`snaggrove`, `6–22 m`)** rise from `-3.8 to +0.8 m` calm emerald lagoon water (`WATER.open`, `surf: false, breakers: false`), their lower `1.8 m` encased in flared collars of cemented **`visoroyster`** and ochre **`spongecoral`**, while upper stag-horns carry epiphytic salt-ferns and `snagbooby` stick-nests.
  - `?works=0` places harpoon-staked **tsunami-driftwood harvest booms** (`CROOK-RIA-DECISIONS.md` §1.1.2) trapping seasoned `30 m` valley logs washed out of `Crookshore`, beside a hand-cut intertidal `coal = 206` barge-coaling bench.
- **Preset views:** `overview`, `ghost-snag-lagoon`, `oyster-collar-trunks`, `coal-seam-bank`, `driftwood-boom`, `detachment-gut`.

### 3.4 Station 4 (`skerry`, `dist/drownlands-skerry.html`): High Serpentinite Refuge Skerry & Trimline — `(145, 495)`
- **Site & Framing (`5.2 × 5.2 km`):** One of Drownlands' rare high horst islands (`+53.1 m` saddle climbing to **`+125 m`** at `145, 495`, `sky -127, +165`) plunging steeply into a `-52 m` sound channel where `Hueru-Kuran` `hkWhaler` catamarans and `cFlīt-qBōn` `arkScoutTri` trimarans shelter in storm lee.
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* `serpentinite` (`0..+72 m` wave-planed and fault-mullioned green-black cliff) capped unconformably above `+72 m` by `laterite` (`4–9 m` brick-red iron cuirasse over green garnierite saprolite).
  - *Ground (`4` layers):* `ground.laterite`, `rock.gossan` (cuirasse cap), `organic.sponge.shoal` (intertidal foot), `ground.damp_beach_sand`.
- **Signature Ecology:** Makes the **`+48 m` megatsunami trimline** unmistakable: below `+48 m`, wave-scoured `serpentinite` ledges hold only amphibious `verdigrismangrove` coves, `spongecoral` tide-pools, and `tealcoppice`; above `+48 m`, brick-red `laterite` cuirasse preserves an untouched island crown of **`biomes/arch` candelabra `araucaria`**, stunted `agathis`, `gymnostoma` she-oak, *Nepenthes* pitcher seeps, and native blue-bleeding `verdigris` caps!
- **Preset views:** `overview`, `araucaria-refuge-crown`, `trimline-scarp`, `laterite-cuirasse`, `whaler-lee-channel`.

---

## 4. Species roster (`src/50-biome-drown-species.js`), guardrails & `kits/crops`

Every species in `BIO.kit('drownlands')` carries complete `README.md` botany tags (`climate: 'tropical'`, `aridity: 'wet'`, `abyssal: false`, `riparian`, `koppen: ['Am', 'Cfa']`, `HV(wood, edible, medicinal, note)` checked by `tools/check_botany.py`):

| Key | Name & Clade | Zone & Chemistry | Height & `3D` Builder | Biome Mechanics & `HV` Harvest Tag |
|---|---|---|---|---|
| **`verdigrismangrove`** | **Teal-Sap Prop-Wood** (*Rhizophora pycnandroides*, Earthly–ultramafic specialist) | `propwood` (`-1.2..+18 m`, `ultramafic = 255`, `Ni = 180`) | `4.5–11.5 m` multi-stemmed evergreen salt-tree on `2–4 m` arched, braided stilt/prop-roots (`BIO.flareJoin`), glossy dark-olive sclerophyll leaves, vivid **teal-blue latex scars** on bark | Elastoplastic cable-roots flex under `15 m` bores without uprooting; hyperaccumulates **`18–24% Ni`** in teal phloem latex (`sève bleue`) to poison marine borers (`Teredo` shipworms cannot bite it!). `HV('ship-knees, fuel', [], true, 'Worm-proof boat knees; coppiced limbs burned by cFlit-qBon into 18% nickel bio-ore ash for Paktong smelting.')` (`gather: 'nickel-bio-ash'`) |
| **`tealcoppice`** | **Blue-Bleed Skerry Scrub** (*Phyllanthus / Pycnandra thalassia*) | `propwood`, `boulderbar` (`+2..+48 m`, `Ni = 180`) | `0.8–2.8 m` dense wind-sheared resprouting shrub with silvery-bronze twigs and turquoise-veined leaves; stumps show bright teal cut-rings | Re-sprouts from serpentine rock fissures within months of tsunami stripping; primary rotational phytomining crop of the Ark-Wards. `HV('fuel', [], false, 'Harvested on 3-year coppice rotation and calcined with local coal into rich green nickel-oxide ash.')` (`gather: 'nickel-bio-ash'`) |
| **`brucitestack`** | **Intertidal Brucite-Aragonite Chimney** (*Living-lined mineral bioherm*) | `bruciteflat` (`-3.0..+1.2 m`, `pH 10.5–11.7` seeps) | `0.8–6.5 m` fluted chalk-white and pale-celadon porous carbonate/brucite towers (`BIO.fung` + custom sinter normal), colonized along wet rims by native `limeshelf` & `seepcomb` | Precipitates where `Ca-OH` serpentinite groundwater meets `Mg2+` seawater; alkaline pools naturally saponify whale/fish fats! `HV('none', [], true, 'Natural pH-11 pool water used by Ark-Wards to saponify whale-oil soap and degrease Paktong castings; soft brucite chalk.')` (`reagent`) |
| **`spongecoral`** | **Ochre-Turquoise Shoal Bioherm** (*Spongocorallum aestuarium*, native–maritime partner) | `kelpchannel`, `boulderbar`, `snaglagoon` (`-6..+2.5 m`, `silica = 150`) | `0.20–0.95 m` low wave-streamlined hemispherical cushions and brain-plates mottled warm ochre, verdigris-turquoise, and plum | Siliceous-calcareous composite skeleton survives boulder-bar surf and `1.60 atm` noon low-water exposure via sealed mucus pores. `HV('none', [], true, 'Elastic caulking sponge and calcined lime-silica flux.')` (`gather: 'sponge-felt'`) |
| **`tidefan`** | **Flexible Gorgonian Shoal-Fan** (*Subergorgia elastica*) | `kelpchannel`, `boulderbar` (`-12..+0.4 m`) | `0.5–1.8 m` perforated saffron-ochre and sea-violet lattice fans (`card.reef` / custom fan card) | Lies flat against rock pavements during tsunami backwash (`Vogel B ≈ -0.95`). `HV('none', [], false, 'Tough horny axial skeletons dried for rot-proof fish-trap screens.')` |
| **`shoalkelp`** | **Tethered Buoy-Kelp** (*Macrocystis / Sargassum ancoratum*) | `kelpchannel` (`-28..-0.5 m` across `< 40 m` shoals) | `3.0–14.0 m` golden-olive submarine fronds buoyed by gas pneumatocysts, anchored exclusively to submerged rock (`never` terrestrial!) | Marks navigable `< 25 m` shoal edges vs. dark kelp-free `> 80 m` Ark-Ward trenches; dampens short chop. `HV('fertiliser', ['kelp blade'], true, 'Burned for potash-iodine ash and boiled with alkaline spring water into marine soap.')` (`crop: 'kelp'`) |
| **`ribbonseagrass`** | **Shoal Eel-Meadow** (*Enhalus / Thalassia lata*) | `kelpchannel`, `snaglagoon` (`-8..+0.2 m` sand/silt) | `0.6–1.9 m` lush emerald strap-meadows carpeting `< 12 m` turquoise sand flats | Binds shoal sediment with deep matte rhizomes; grazing ground of `shoaldugong` and turtles. `HV('thatch, weaving', ['seagrass nut'], false, 'Rot-resistant salt-hay insulation and woven deck-mats.')` (`crop: 'eelgrass'`) |
| **`snaggrove`** | **Salt-Petrified Drowned Snag** (*Subfossil mineralized timber + oyster/sponge sleeve*) | `snaglagoon` (`Station 3`, `-4.5..+1.5 m`, `sedimentary`) | `6.0–22.0 m` stag-headed silver-grey drowned tree trunks (`BIO.flareJoin` buttresses, stripped of bark), encased below `+1.8 m` in a flared `visoroyster` & `spongecoral` bioherm skirt | Silicified/pyritized over centuries in brackish coal-measure water — dense as ironwood and prized by shipwrights! `HV('timber', ['visor oyster'], false, 'Winched up by cFlit-qBon divers as rock-hard, borer-proof keel and rudder-post timber.')` |

### 4.1 Explicit cross-biome non-duplication guardrails
1. **Against `biomes/arch`:** `biomes/arch` showcases subaerial `pH 11 vs. pH 2.5` acid-alkaline **confluence curtains (`curtain`)**, dry/monsoon horst domes (`+863–+1,456 m`), and Krafla-style graben lava fissures. `Drownlands` (`0` subaerial solfataras, `0` acid `pH 2` streams) places **zero `curtain` or `acidfelt`** — instead realizing the **drowned `80%`-water archipelago** of submarine kelp/seagrass shoals, intertidal `Mg(OH)2` brucite stacks, amphibious teal-sap prop-root mangroves, and subsided sedimentary snag lagoons!
2. **Against `biomes/farside`:** Zero terrestrial `landkelp` trees, `spraycoral`, or `strandanemone`. `shoalkelp` is **100% submarine (`y <= -0.5 m`)**, never climbing dry land.
3. **Against `biomes/doubledelta`:** Zero `2–6 m` alluvial freshwater-estuarine silt `chimneysponge` domes or `ria-amber` blue-clay gullies; Drownlands is marine (`32–35 PSU`), rock-and-sand floored, and bimodal `ultramafic`/`coal-sedimentary`.

### 4.2 `kits/crops` registration (`CROPS.BIOMES.drownlands`)

```js
drownlands: {
  atm: 2,   /* 1.55-1.60 atm warm maritime monsoon across all skerries and shoals */
  zones: {
    shoal:      {warmth: [4, 4], arid: [4, 4], wet: true, salt: true}, /* < +2 m seagrass, kelp & intertidal flats */
    ultramafic: {warmth: [4, 4], arid: [3, 4], salt: true},            /* Ni-rich serpentinite skerries (coppice & strand) */
    drowned:    {warmth: [4, 4], arid: [3, 4], wet: true, salt: true}, /* SE sedimentary drowned-valley brackish lagoons */
    highskerry: {warmth: [3, 4], arid: [3, 4]}                         /* >= +48 m tsunami-safe southern/central island crowns */
  }
}
```
- **Verified `CROPS` Palette:** `kelp`, `sea-lettuce`, `sea-grapes`, `wineweed`, `tidewort`, `eelgrass`, `mat-reed`, `pandan`, `coconut`, salt-tolerant `bamboo-rice` and `taro` (in `drowned` sedimentary pockets only), `kava`, `mangrove-red` dye, and `dried-reed` (`CROPS` excludes grain staples from toxic `ultramafic` soil via `DROWN_PHYS.nickelMangroveAt`).

---

## 5. Fauna (`kits/fauna` `[G data]` records)

| Key (`kits/fauna`) | Name & Clade | Scale | Niche & `cFlīt-qBōn` / Tsunami Interaction | Yields & 24h Schedule |
|---|---|---|---|---|
| **`chelahexapod`** | **Verdigris Reef-Walker** (vertebrate-grade amphibious hexapod) | `0.65 m` carapace | Grazes toxic `verdigrismangrove` fallen leaves and `spongecoral`, sequestering nickel into turquoise-patinated unpalatable shell plates; clings inside submerged rock undercuts during bores | `nickel-shell` inlay, `chitin`. `00–07` `FORAGE_PROP`, `07–16` `SUBMERGE_LEDGE`, `16–24` `GRAZE_FLAT` |
| **`clickporpoise`** | **Sounder-Hound Dolphin** (echolocating shoal cetacean) | `2.4 m` | Hunts shoal fish across `< 40 m` channels; **co-evolves acoustic click-codas with free-diving `cFlīt-qBōn` divers** (`CROOK-RIA-DECISIONS.md` §1.2.1), herding fish into Ark-Ward moon-pools and fleeing into `> 100 m` trenches `30 min` before Ghost Tsunamis! | Never hunted by `cFlīt-qBōn` (sacred dive-kin; `aggression: 0`). `05–19` `HERD_SHOAL`, `19–05` `REST_TRENCH` |
| **`snagbooby`** | **Oyster-Snag Plunge-Gannet** (coastal seabird) | `0.95 m` (`1.6 m` span) | Nests in stick-platforms high in `Station 3` `snaggrove` crowns and `Station 4` `araucaria` tops; effortless dynamic soaring in `1.60 atm` air | `eggs`, `guano`, `feathers`. `06–18` `DIVE_SHOAL`, `18–06` `ROOST_SNAG` |
| **`brucitesnail`** | **Alkali-Stack Limpet-Hexapod** (armoured vent grazer) | `0.28 m` | Scrapes hydrogen-oxidizing `seepcomb` biofilms off `pH 11.4` `brucitestack` chimneys (`Station 1`) using iron-mineralized radular plates | `aragonite-shell`, `vent-nacre`. `00–10` `GRAZE_CHIMNEY`, `10–18` `SEAL_POOL`, `18–24` `GRAZE_CHIMNEY` |
| **`shoaldugong`** | **Dense-Air Seagrass Sirenian** (herbivorous marine mammal) | `3.1 m` | Grazes `42,004 km²` of warm `< 15 m` `ribbonseagrass` meadows; surfaces quietly in `snaglagoon` coves | `blubber-oil`, `hide`, `dense-ivory` rib. `04–11` `GRAZE_MEADOW`, `11–16` `DOZE_CHANNEL`, `16–04` `GRAZE_MEADOW` |
| **`leviathancalf`** | **Sound Filter-Whale** (`Hueru-Kuran` seasonal quarry) | `14–18 m` (distant offshore breach/spout rig on `Stations 2, 4`) | Migrates down the `> 100 m` western fault-trenches toward *Whale-Haven* (`81, 677` in `Crookshore`), hunted offshore under strict clan quotas by `Hueru-Kuran` `hkWhaler` catamarans | `whale-oil`, `baleen`, `whale-rib`, `ambergris` (`SIM.trade` level). `00–24` `MIGRATE_TRENCH` |

---

## 6. Resources, workshop closure (`Ruling #1`), hazards & sampler budget

### 6.1 `kits/resources`, `gather` tags & `CONTINENTAL-SCOPE.md` Ruling #1 input-output closure

| Good / Node | Source in `biomes/drownlands` | `[LOCAL]` Ark-Fleet Upkeep Use | `[TRADED]` Export (`Farport` / `Crookshore` / `Battered Isle`) |
|---|---|---|---|
| **`nickel-bio-ash` (`nickel = 180`)** | Coppiced `verdigrismangrove` & `tealcoppice` (`514` lode nodes on `55.9%` ultramafic land) | Calcined aboard `arkSmelter` (`89d`) using local `coal = 214` / `peat = 157` | Smelted with `Copper Glacier` `copper`+`zinc` into corrosion-proof **Paktong (`Cu-Ni-Zn`)** chain-links, surgical tools & Eternian mirror-backs |
| **`coal = 214` & `peat = 157`** | `Station 3` southeastern `sedimentary` drowned-valley seams (`903` cells `>= 80`) | Retort fuel for phytomining ash, galley braziers & pitch boiling | Coaling supply for `Battered Isle` (`435, 259`) & `Farport` coasters |
| **`jade = 200` (`frost-coral` bundle)** | Detachment-contact boulder-bars (`Station 2` & `3`, `271` nodes) + deep trench hydrocoral | Cyclopean non-rusting **anchor-chain swivel rings** & diving weights | Traded to `Hueru-Kuran` pendulum wire-sawyers & `Farport` Factory Quarter |
| **`alkali` / `marine-soap` (`reagent`)** | `Station 1` `brucitestack` `pH 11.4` pools + `shoalkelp` potash ash + `shoaldugong`/whale oil | Hull degreasing, Paktong flux, rope preservation & crew hygiene (`Ruling #1` soap loop closed without imported lime!) | Exported as salt-water lathering **Arch-Soap** cakes |
| **`snaggrove` iron-timber & driftwood** | `Station 3` mineralized drowned trunks + boomed `Crookshore` tsunami rafts | Borer-proof keels, moon-pool frames & rudder-posts (`arkCatamaran` `89c`, `arkDiveTender` `89e`) | Specialty ship-knees traded to treeless outer skerries |

### 6.2 Data-driven hazards (`core/hazard`, `KHAZ`) & 4-layer ambient audio (`STATIONS-AMBIENT-AUDIO.md`)

| Hazard ID | `KHAZ` Kind | Stations & Trigger Rule (`DROWN_PHYS`) | Visual / Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`drownlands:alkalipool`** | `caustic` | `Station 1 shoal` (`bruciteStackAt(...).pH >= 11.0`) | Milky-turquoise steaming `WATER.still` pools inside white brucite rims; saponifies skin/leather on wading (`0` damage to hull planks) |
| **`drownlands:tidalrace`** | `current` | `Stations 1, 3, 4` (`velMs >= 3.0` constricted skerry-gap guts) | Standing V-ripples & streaming horizontal `shoalkelp` blades; sweeps swimmers toward shoal rocks (`cFlīt-qBōn` divers ride it intentionally) |
| **`drownlands:snagreef`** | `crush` / snag | `Station 3 drowned` (`-2.5..0 m` submerged `snaggrove` stumps) | Dark iron-hard silicified root-crowns ringed by white oyster visors just beneath turbid brackish water; rips deep-draft keels |
| **`drownlands:bore`** | `flood` | `Stations 1–4` (`elevM < trimElevM` during `[Drawdown] -> [Swell]`) | Preceded `20 min` early by `-9.5 m` shoal withdrawal & hydrophone-buoy harmonic ring; sweeps untethered walkers on `< +45 m` benches while `arkEscapeOk` trenches ride smooth swell |

**Station-by-Station 4-Layer Procedural Audio (`biomes/STATIONS-AMBIENT-AUDIO.md` contract):**
- **Layer 1 (Hydrodynamic Bed):** Gentle `1.60 atm` turquoise shoal wash (`Stations 1, 3`) vs. heavy outer-bar surf thunder (`Station 2 bar`) and hollow resonant tide-gurgle inside `brucitestack` vents.
- **Layer 2 (Wind & Canopy):** Warm `Am` monsoon trade-wind + creaking elastoplastic `verdigrismangrove` cable-roots rubbing in swell.
- **Layer 3 (Biological / Click Foley):** Crisp **cetacean & `clickporpoise` echolocation click-codas** propagating through shallow channels at dusk (`CROOK-RIA-DECISIONS.md` §1.2.1) + snapping `visoroyster` valves at low libration tide.
- **Layer 4 (Geophysical Accent):** Distant `35–60 Hz` `Steaming Seamounts` Surtseyan bass roll on `Station 2` (`82 km` from `166, 338`), shifting during `[Drawdown]` to the pure `260 Hz` ceramic/nephrite hydrophone warning hum.

### 6.3 Material & sampler budget (`< 15` samplers, `KSHADOW` off at load)
- **Sampler budget:** `KGROUND` (`<= 5` layers: `4–5` samplers) + `KSTRATA` (`2`) + `ATMOS` (`2–3`) + `KHORIZON` (`1`) + `KSHADOW` (`1` when `?shadow=1`) = **`10–12` active samplers (`< 15` survey ceiling)**.
- **Reused library materials (`materials.json`):** `ground.damp_beach_sand`, `ground.laterite`, `ground.bayoumud`, `ground.lakebed.shells`, `ground.peat`, `rock.gossan`, `bark.mangrove`, `wood.gnarled` (bleached `snaggrove`), `organic.sponge`, `organic.coral.brain`, `card.seaweed`, `card.seagrass`, `card.reef`, plus `arch` kin textures deduplicated via `matlib_pack.fragment(..., exclude=...)`.
- **Four targeted prompts for `core/materials/PROMPTS-NEEDED.md` (procedural stand-ins until packed):**
  1. **`bark.mangrove.tealsap`** — dark salt-crusted prop-root bark with diagonal storm-checks weeping luminous turquoise-teal nickel latex (`Stations 1, 4`).
  2. **`rock.sinter.brucite`** — porous chalk-white and pale-celadon fluted submarine-intertidal brucite-aragonite chimney crust (`Station 1`).
  3. **`organic.sponge.shoal`** — mottled ochre-gold and turquoise intertidal sponge-coral pavement with sealed low-tide oscula (`Stations 2, 3`).
  4. **`bark.snag.oyster`** — silver-grey mineralized drowned hardwood encrusted with cemented white visor-oysters and rust sponges (`Station 3`).

---

## 7. Numbered `src/` architecture, rollout & verification invariants

### 7.1 Fragment map & `PORT.md` tags

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `buildlib.CORE_BIOME_MIN` + `31j, 32, 33, 35, 39, 41..44`, `KDRAWN`, `KRAND`, `KTAGS`, `KSPACE`, `KCOAST`, `KSTRATA`, `KRELIEF`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER`, `ATMOS`, `CROPS` |
| `40-biome-drown-phys.js` | **`[G data]`** | `DROWN_PHYS`: `tsunamiAt`, `bruciteStackAt`, `nickelMangroveAt`, `snagLagoonAt`, `ecotoneAt` (zero `THREE`/DOM) |
| `41-biome-drown-sites.js` | **`[G data]`** | `DROWN_SITES`: surveyed `5.1` pixels, sky offsets, shoal/trench bathymetry, `KSTRATA` stacks, and `site:*` reserves for `shoal`, `bar`, `drowned`, `skerry` |
| `45-host-stage.js` | `[web]` | Renderer, multi-skerry shoal & `-84 m` fault-trench heightfield (`KCOAST` + `KRELIEF`), `KDRAWN.add`, `BIO.init({tags:'drownlands'})` |
| `47a..47b` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `biomes/arch` (`Stations 1, 2, 4` ultramafic) & `biomes/crook`/`farside` wrack, read in place |
| `50-biome-drown-species.js` | `[G partial]` | `DROWN.SPECIES` (`8` own species), `HV` tags, braided `BIO.flareJoin` prop-roots, `brucitestack` & `snaggrove` builders, `[Swell]` elastic-flex uniform |
| `60-biome-drown-place.js` | **`[G data]`** | Deterministic `KRAND.cell` placement gated by `DROWN_PHYS`, `KSPACE` keep-clear, `CROPS` picks, and `KTAGS` registration |
| `84-host-ground.js` | `[web]` | `KGROUND` (`<= 5` layers), `KSTRATA` serpentinite/coal-sedimentary shading, `KFAR` (`14 km`, w/ `Steaming Seamounts` plume on `bar`), `KHORIZON` |
| `86-host-works.js` | `[web]` | `site:ark-ward-trench` & `site:prou-torre-north` reserves + `?works=0` nephrite mooring-rings, hydrophone buoy, driftwood boom stakes, and brick nickel-ash retort (`class: 'furniture'`) |
| `89a-host-atmos.js` & `89w-host-water.js` | `[web]` | `ATMOS.bindHost` (`1.60 atm` `Am` sky, chimney vapour, monsoon weather), `WATER.open` (turquoise shoal -> indigo trench) / `still` / `flow` + `farbed` |
| `99-host-take.js` | `[web]` | `KHOST.take`: compliant preset views, `[Low Water] / [Drawdown] / [Swell]` toggle, inspector tags, `hostChecks()` |

### 7.2 Rollout milestones (`DL0–DL5`)
- **`DL0`:** Land `PLAN.md`; add `"biomes/drownlands"` to all 5 checks in `tools/checks_optin.json` and append the 4 material slots to `core/materials/PROMPTS-NEEDED.md`.
- **`DL1`:** Implement `src/40-biome-drown-phys.js` + `src/41-biome-drown-sites.js` (`[G data]`) and pass `node biomes/drownlands/tests/test-drown-phys.js` on `tools/ktest.js`.
- **`DL2`:** Build **Station 1 `shoal`** (`dist/drownlands.html`): `verdigrismangrove`, `brucitestack`, `< 15 m` shoal-to-`-84 m` trench `WATER.open` optical transition, `[Low Water]/[Drawdown]/[Swell]` toggle, `verify.py --assert` (`checks=harness.SURVEY`).
- **`DL3`:** Build **Station 2 `bar`** (`-bar`), **Station 3 `drowned`** (`-drowned`), and **Station 4 `skerry`** (`-skerry`), verifying the ultramafic-vs-sedimentary split and `+48 m` `araucaria` trimline.
- **`DL4–DL5`:** Register `CROPS.BIOMES.drownlands` (`test-crops.js`) and the 6 `kits/fauna` records; author `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; pass `check_core_use.py`, `check_botany.py`, and `python3 tools/test_all.py`.

### 7.3 Z-fighting separation & `verify.py --assert` invariants (`T.ok` + `T.neg`)
1. **Lithological & trimline fidelity (`nickelMangroveAt`):** `verdigrismangrove` and `tealcoppice` place **only** where `ultramaficByte >= 128` (`Stations 1, 2, 4`), returning `latexNiPct` in `[18.0, 24.5]%`; `T.neg` proves `propRootOk === false` on `Station 3` `sedimentary` (`ultramaficByte === 0`), and `refugeTreeOk === false` for rigid `araucaria` everywhere below `trimElevM` (`+48 m`).
2. **Intertidal brucite chimney window (`bruciteStackAt`):** Proves `active === true`, `pH >= 10.5`, and `stackHeightM` in `[0.8, 6.5] m` along sheltered `-8..+0.4 m` ultramafic fault toes (`Station 1`), while `T.neg` proves `active === false` on `sedimentary` beds, dry cliffs (`waterDepthM > +1.5 m`), or surf-hammered outer bars (`waveShearPa > 350`).
3. **Deep-trench Ark-Ward escape vs. *Prou-Torre* (`tsunamiAt`):** Proves `arkEscapeOk === true` on `Station 1 shoal` (`-84 m` trench within `600 m`, `< 4 min` haul-out) and `prouTorreReq === true` on wide `< 25 m` shoals (`Station 2 bar`); zero `class === 'building'` records exist anywhere across all 4 stations.
4. **Drowned snag & submarine kelp bounds (`snagLagoonAt`):** Proves `snaggrove` oyster collars terminate strictly at `<= +1.8 m` high-water mark (`T.neg`: zero floating collars in upper air) and `shoalkelp` places strictly at `bedElevM <= -0.5 m` (`T.neg`: zero terrestrial kelp).
5. **Coplanar z-fighting & survey hygiene (`checks=harness.SURVEY`):** Every perched `WATER.still` milky brucite pool disc sits `>= 0.12 m` above `WATER.open` mean tide level (`>= 0.04 m` below its brucite stone rim, zero coplanar water overlap); `< 15` active samplers on every shader program; `KSHADOW` off at load; positive `KDRAWN` eye clearance; and bit-identical `KRAND.cell` tile determinism.

---

## 8. `build.py` assembly, `openworld/` streaming & Godot `4.7.2` twin contract

### 8.1 `build.py` deterministic cross-platform assembly (`AGENTS.md` rules)

```python
#!/usr/bin/env python3
"""Build biomes/drownlands stations -> dist/drownlands[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS check

STATIONS = ('shoal', 'bar', 'drowned', 'skerry')
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '35-core-anim.js', '39-core-lean.js', '41-core-env.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js',
]
# Every open() uses encoding='utf-8' (and newline='\n' on write); all paths use '/'
```

### 8.2 `stations/<station>.json` & `materials.json` contracts

```json
{
  "id": "shoal",
  "title": "Drownlands — Brucite-Chimney Shoal & Nickel-Mangrove Gut",
  "px": [145, 520],
  "skyOffsetKm": [28.0, -14.0],
  "lithology": "ultramafic",
  "pAtm": 1.60,
  "tideRangeM": 2.6,
  "trimElevM": 48.0,
  "trenchDepthM": -84.0,
  "strataStack": "serpentinite-detachment",
  "kin": ["arch"],
  "reserves": [
    { "id": "site:ark-ward-trench", "x": -180, "z": 140, "r": 55 }
  ],
  "modes": ["Low Water", "Drawdown", "Swell"]
}
```

```json
{
  "slots": {
    "ground_sand": "ground.damp_beach_sand",
    "ground_ochre": "ground.laterite",
    "ground_mud": "ground.bayoumud",
    "ground_shells": "ground.lakebed.shells",
    "strata_rock": "rock.gossan",
    "bark_mangrove": "bark.mangrove",
    "wood_snag": "wood.gnarled",
    "sponge_mat": "organic.sponge",
    "coral_head": "organic.coral.brain",
    "kelp_card": "card.seaweed",
    "seagrass_card": "card.seagrass"
  }
}
```

### 8.3 `verify.py` shared-harness specification (`tools/harness.py` — no pasted launcher)

```python
#!/usr/bin/env python3
"""Verify biomes/drownlands stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'shoal':   'dist/drownlands.html',
    'bar':     'dist/drownlands-bar.html',
    'drowned': 'dist/drownlands-drowned.html',
    'skerry':  'dist/drownlands-skerry.html',
}

if __name__ == '__main__':
    harness.main(
        pages=PAGES,
        default_page='shoal',
        checks=harness.SURVEY,   # <15 samplers, KSHADOW off at load, compliant view names, KDRAWN clearance
    )
```

### 8.4 `openworld/` 1:1 streaming (`core/world`) & Godot `4.7.2` parity
- **`core/world` (`44c-world-coast.js`) binding:** When an `openworld/` cut streams over `rmwete7oza9d9`, `WORLD.H(x, z)` and `RES_GEO` (`ultramafic`, `nickel`, `coal` bytes) feed `DROWN_PHYS.nickelMangroveAt` and `bruciteStackAt` directly per `500 m` chunk (`KRAND.cell(worldSeed, ix, iz)`), while `kits/ringsea/` `arkChainedWard` (`89g`) and `arkSmelter` (`89d`) moorings query `DROWN_PHYS.tsunamiAt(...).arkEscapeOk` to pick `<= -80 m` graben rifts automatically.
- **Godot `4.7.2` GDScript twin (`godot/krator/biome/drown_phys.gd`):** Because `40-biome-drown-phys.js` and `60-biome-drown-place.js` use strictly integer-hashed `KRAND` draws, explicit `x == null ? d : x` numeric defaults, and zero `THREE`/DOM globals, `node biomes/drownlands/tests/test-drown-phys.js --golden` emits `golden-drown-phys.json` vectors verified identically under `godot --headless --path godot --script res://krator/biome/drown_phys_test.gd`.
