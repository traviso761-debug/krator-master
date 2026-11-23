# arachnoids: the plan (locked design, 2026-11-22)

**Arachnoid Canyons** (`rmvarachnoids` / `arachnoid canyons` in Scale Model `5.1`): a spiderweb-fractured volcano-tectonic canyon province on Krator's northern outer-crater slope, named simultaneously for its **Venusian-type *arachnoid* concentric ring-graben and radial-dike complexes** (`D = 45–110 km` abortive mantle-plume diapirs) and the **communal chasm-spanning suspension-web arachnids (*Tsēk-Mā*)** that rig `35–90 m` golden-gunmetal bridge-webs between dark basalt dike ribs above boiling slot gorges.

Crucially, on Scale Model `5.1` (`1821 × 1723`, `2 km/px`, `g = 7.4 m/s²` / `0.75 g`), `rmvarachnoids` serves two distinct roles that this specification separates cleanly:
1. **Total `rmvarachnoids` Tectonic-Modifier Polygon (`437,092 km²` / `109,273` cells, `X = 855..1345, Y = 180..445`):** A regional structural envelope tracing radial basalt/diabase dike swarms and fracture corridors into **11 neighboring biome regions** (`12` biome polygons: `Ria Valley`, `Korona / NE`, `NE Outer Wall`, `Compass Hills`, `Spider Lake`, `Tiers`, `Springhollows` [`neo-ozarks`], `N Outlands`, `NW Outer Wall` [`2` polygons], `Weeping Valley`, and `Heartland`). In those overlap belts, the neighboring kit owns the surface biome while `rmvarachnoids` contributes dike-rib shut-ins (for example, `(1055, 219)` *Ham-Tsek Silk Post* lies inside `Compass Hills` `rmweu4kpowzji` — **not** inside `own` — and is already built as Station 4 `gorge` of [`biomes/compasshills/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/compasshills/PLAN.md)).
2. **Core `Arachnoid Canyons` Proper (`own = rmvarachnoids & ~all_other_biomes` = `111,952 km²` / `27,988` cells, `100%` dry land, `X = 864..1340, Y = 243..427`):** The standalone biome territory owned exclusively by `biomes/arachnoids`, spanning **`+847 to +5,845 m`** (`p5–p95`, canyon bed `+554.4 m` to outer-wall crest `+7,853.4 m`, median **`+2,217.3 m`**) across **`Cfa` (`44.1%`)**, **`Csa` (`12.6%`)**, **`ET` (`11.3%`)**, and **`Dfc` (`9.7%`)** climates under **`1.44–0.77 atm`** (`1.21 atm` median) and incised across `97` vertices (`~230 km`) by master trunk river **`9102` `Hām-Tsēk` (*Web-Cleaver River*, `Q = 664 -> 1,421 m³/s`)**.

Core `Arachnoid Canyons` Proper runs on **inverted canyon microclimates** paired with **`85%` recognizable montane-gorge vascular guild logic and `15%` grounded `0.75 g` biophysical extremes**:
- **Inverted Slot-Canyon Thermodynamics:** Deep, narrow `40–180 m`-wide slot floors (`+660–950 m`, `1.43–1.47 atm`) trap `9102` river spray, convective humidity, and radial-fissure geothermal steam (`+24 to +29 °C` annual mean, surging to `+41 °C` warm-season thermal troughs along the southern ring-fault), fostering lush frost-free tree-fern, bamboo, and fumarole-sinter gardens **underneath** dry `Csa` (`706 mm/yr`) columnar-basalt pine-oak rims (`+1,600–2,400 m`) and howling sub-zero `Dfc`/`ET` (`-2 °C`) alpine frost-rims (`+3,500–5,845 m`).
- **Communal Chasm-Spanning Bridge-Webs (*Macrothele pontifex*):** At `0.75 g` (`25%` less catenary self-weight sag) and `1.43–1.47 atm` (`pO2 = 0.30 atm`), colonial canyon-mouth arachnids anchor multi-tier horizontal sheet-and-guy-cable webs across `35–90 m` basalt dike shut-ins to funnel dense canyon-updraft insect emergences; **Hum** gorge-wardens braid shed guy-cables into toll-bridge hawsers and harvest **`saltpeter = 200`** from dry guano-and-web-refuse alcoves.

Status: **Build-ready specification** aligned with [`biomes/compasshills/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/compasshills/PLAN.md), [`biomes/spiderlake/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/spiderlake/PLAN.md), and [`biomes/neouterwall/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/neouterwall/PLAN.md). Zero edits outside `biomes/arachnoids/PLAN.md`.

---

## Core adoption

Written first per [`README.md`](file:///home/antigravity/traviso761-debug/krator-master/README.md) ("CORE MODULES ARE NOT OPTIONAL") and verified against [`tools/check_core_use.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/check_core_use.py) (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/arachnoids` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('arachnoids')` (`window.ARACHNOIDS`); `31j` `BIO.flareJoin` on cliff-wedged `columnarpine` root-claws and Hum bridge piers; `32` `BIO.kin` reading `nwlowlands`, `swlowlands`, and `korona` gorge hemlocks, evergreen oaks, bamboo, and alpine cushion sedges in place; `33` `BIO.fung` for thermophilic `sintermat` crusts and fumarole sulfur-bacteria aprons; `34` octahedral impostors on `>= 7 m` ledge conifers/oaks; `35`/`39` updraft wind-flagging on `rimkrummholz` and elastic catenary sway on `bridgeweb` spans |
| **`core/speleo`** *(via `core/terrain`)* | [`core/terrain/39-core-cavern.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/39-core-cavern.js) (`KCAVERN`), [`39b-core-speleo.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/39b-core-speleo.js) (`KSPELEO`), [`39b2-core-speleo-cleft.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/39b2-core-speleo-cleft.js) (`KSPELEO.SMOKY`) | Overhanging `tepui`/`carbonate` canyon-wall guano & `saltpeter = 200` shelter alcoves (`KSPELEO.HYPOGENE` gypsum-nitrate crusts on `Stations 1–2`) and radial tension-fissure *Kluft* pockets (`KSPELEO.SMOKY` smoky-quartz & epidote druse on `Station 3 ledges`); `KSPELEO.blocks` feeds solid collision boxes to `core/walk` |
| **`core/terrain`** | [`35-core-strata.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/35-core-strata.js) + `host/35-core-strata-shade.js` (`KSTRATA`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` + [`38d-core-slab.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/38d-core-slab.js) (`KRELIEF`), `42-core-frost.js` (`KFROST`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`), `47-core-therm.js` (`KTHERM`) | `KSTRATA` binding **`arch-rift-basalt`** (`colonnade` + `entablature` + baked brick-red `bolus` contact margins) crosscutting **`outland-tuff`** and **`tepui`** sandstone/granite walls; `KSTACKS` for standing radial basalt dike fins & natural shut-in piers; `KRELIEF.slab` for tiered mid-wall colonnade ledges; `KFROST` for patterned frost-polygons on `Station 4 frostrim`; `KTHERM` for `+38..+68 °C` canyon-floor fumarole aprons on `Station 2`; `KGROUND` (`<= 5` layers); `KFAR` (`14 km`) + `KHORIZON` |
| **`core/atmos`** & **`core/sky`** | `core/atmos/89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j` (`core/sky` shared dome), `host/c,e,h,i,j`, `fx/raincover.js` | Shared Krator sky dome at `(px - 272, py - 330)` (`pressure: 1.47 -> 0.88 atm`), **inverted `ATMOS.fogBelt`** trapping luminous warm river-and-fumarole mist deep inside slot chasms while leaving upper `Csa`/`ET` rims crisp and clear, `#include <atmos_waves>`, and updraft insect/steam particle plumes |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/54-core-water-geyser.js`, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js` | `WATER.flow` for whitewater shut-in chutes of **`9102` `Hām-Tsēk`** (`Q = 995–1,295 m³/s` on `Stations 1–2`); `WATER.still` for basalt-dike-dammed turquoise step-pools (`Station 2`); `ext/54-core-water-geyser.js` steam-vent plumes on radial fissure fumaroles (`WATER.mirrorSwitch` off at load) |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Order-free spatial occupancy (`KSPACE`) indexing radial dike ribs, ledge trees, fumarole vents, and opposite-wall anchor pairs (`35–90 m` gap queries) for deterministic **Arachnoid Bridge-Web** catenary placement |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | All fissure-network seeds, web-span hashes, cliff lithophyte clusters, and frost-polygon jitter via `KRAND.cell(seed, ix, iz)` and `KRAND.hash` — zero `Math.random` or `Math.sin` |
| **`core/mask`** | `core/mask/15-core-mask.js` (`KMASK.canvas`) | Evaluates radial-and-concentric fracture-corridor distance fields, slot-width shut-in masks, and fumarole heat halos strictly in CPU `KMASK` arrays — **zero `getImageData`** |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every plant, bridge-web span, `KSPELEO` crystal/nitrate alcove, resource node (`iron`, `tin`, `saltpeter`, `rare-earth`, `gold`/`tin` placers, `sulfur`), `KHAZ` zone, and `site:hum-webgate` toll-post reserve |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers slot-gorge walls, radial dike fins, ledge benches, and suspension paths via `KDRAWN.add(KDRAWN.grid(...))` (survey item 28) |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazards: `arachnoids:webtrap` (sticky high-tensile perimeter guy-webs & colony alert vibration), `arachnoids:fumarole` (`+65 °C` steam/H₂S scalding vents on `Station 2`), `arachnoids:slotflood` (`9102` whitewater shut-in surge), and `arachnoids:updraftdrop` (sheer `600–900 m` unguarded cliff-ledge gales on `Stations 3–4`) |
| **`core/materials`** & **`core/shadow`** | `23-mat-record.js`, `25-matlib-host.js` + `matlib_pack.py`; `10-core-shadow.js`, `12-core-shadow-host.js` (`KSHADOW`) | Packed genuine library textures (`tex/pack.json`, `< 15` linked shader samplers; `0` untextured lit meshes); `KSHADOW` **strictly off at page load** (`?shadow=1` or UI toggle) |
| **`core/host`**, **`core/walk`** & **`core/export`** | `khost.FULL` + `94-host-polytool.js`; `07-core-export.js`, `09-core-export-adapters.js` | Camera, walk controller (with suspension-bridge deck & `KSPELEO.blocks` collision), `[Clear] / [Slot-Mist] / [Rim-Gale]` weather states, compliant preset views, `krator-world` & Godot `4.7.2` export |
| **`kits/crops`**, **`kits/fauna`** & **`kits/resources`** | `kits/crops/src/10,20,22,40` (`CROPS`); `kits/fauna` (`[G data]`); `kits/resources` (`geology.json`) | Read in place: `CROPS.BIOMES.arachnoids` (`93` verified crops across `slotfloor`, `ledgewood`, `dryrim`, `frostrim`), 6 native/gorge fauna records, and surveyed `own` lodes & `9102` placers |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/city`**, **`core/hamlet`**, **`core/camp`**, **`core/ruins`** | **No** | Hum gorge toll-villages and Spider-Road caravanserais are held clear as registered `KTAGS` `site:hum-webgate` reserves; `?works=0` places lightweight Hum braided-silk cable anchors, basalt-notched wind-whistles, and saltpeter scraping troughs (`class: 'furniture'`) |
| **`core/coast`**, **`core/water/farbed`** | **No** | Core `Arachnoid Canyons` Proper (`own`) is `100%` inland (`0 km²` sea or raster lake; all water is river `9102` `WATER.flow` and dike-dammed `WATER.still` step-pools) |
| **`core/simulation`**, **`core/sched`**, **`core/engine`**, **`core/furnish`** | **No** | Standalone biome kit; fauna & web-colony schedules are plain `[G data]` records |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/arachnoids"` joins all five lists in `tools/checks_optin.json` from commit 1 (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`), running `buildlib.through_tools_build`, `build_sources.report()`, `KDRAWN.add`, `10–13` active samplers (`< 15` gate), `tools/ktest.js`, and strictly punctuation-free preset view names.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/arachnoids/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Envelope** | **`rmvarachnoids`** (*arachnoid canyons*): **`111,952 km²` Core `Arachnoid Canyons` Proper** (`own = rmvarachnoids & ~all_other_biomes`, `27,988` cells, `X = 864..1340, Y = 243..427`, `100%` dry land), distinct from the **`437,092 km²`** total chasm-cut modifier polygon (`109,273` cells overlapping 11 neighboring biome regions) |
| **Pages (`4` Stations)** | `dist/arachnoids.html` (**Station 1 `nexus`** at `998, 290`: Radial Dike Shut-In & Communal Bridge-Webs), `--station fumarole` (`1097, 331`: Warm Canyon-Floor Fumarole & Step-Pools), `--station ledges` (`984, 283`: `Csa` Columnar Basalt & Tuff Ledge Forest), and `--station frostrim` (`919, 281`: `ET` High Alpine Frost-Rim & Updraft Krummholz) |
| **Objects** | **`ARACH_PHYS`** (`[G data]` in `src/40-biome-arach-phys.js`: radial/concentric dike networks, slot-bottom thermal inversion, `0.75 g` catenary bridge-web mechanics, and fumarole sinter zoning; tested by `tests/test-arach-phys.js`) and **`ARACHNOIDS`** (`BIO.kit('arachnoids')`) |
| **Read in place (`BIO.kin`)** | **`biomes/nwlowlands`**, **`biomes/swlowlands`**, & **`biomes/korona`** (gorge hemlocks, bamboo, evergreen oaks, juniper, and alpine cushion sedges — `85%` vascular matrix without fragment duplication) |
| **Cultural Corridor** | **Hum** river-gorge wardens (`Hām-Tsēk`, `9102`) guiding silk, `tin = 200`, `saltpeter = 200`, and placer gold between `Spider Lake` (`1272, 193`), `Korona` (`K6`/`K7`), and `Compass Hills` / `Ria Valley` |

---

## 1. Scale-Model Footprint & Physical Envelope (`rmvarachnoids` Total vs. `own` Proper)

### 1.1 Partitioning `rmvarachnoids`: Regional Chasm-Cut Modifier vs. Core Biome Proper

| Envelope Metric (`Scale Model 5.1`, `2 km/px`) | Total `rmvarachnoids` Polygon *(Tectonic Modifier)* | **Core `Arachnoid Canyons` Proper (`own = rmvarachnoids & ~all_other_biomes`)** | Architectural Rule |
|---|---|---|---|
| **Cells & Area** | `109,273` cells = **`437,092 km²`** (`436,032 km²` dry, `1,060 km²` water) | **`27,988` cells = `111,952 km²`** (**`100.0%` dry land**, `0 km²` raster water) | `biomes/arachnoids` stations & `CROPS`/`BIO` census target **`own` (`111,952 km²`)** exclusively |
| **Canvas Bounds & Centroid** | `X = 855..1345`, `Y = 180..445`, centroid `(1097.0, 311.2)` | **`X = 864..1340, Y = 243..427`**, centroid **`(1034.3, 298.4)`** | Every station `(X, Y)` verified `own[Y, X] === true` (`5–37 px` / `10–74 km` inside boundary) |
| **Overlapping Regions** | Overlaps **11 neighboring biome regions** (`Ria Valley` `99,316 km²`, `Korona / NE` `98,712 km²`, `NE Outer Wall` `76,304 km²`, `Compass Hills` `46,216 km²`, `Spider Lake` `20,560 km²`, `Tiers` `18,732 km²`, `Springhollows` `15,268 km²`, `N Outlands` `14,284 km²`, `NW Outer Wall` `13,748 km²`, `Weeping Valley` `12,272 km²`, `Heartland` `2,268 km²`) + political `Coyote Kingdom` (`23,940 km²`) & `Sasquatch Tribes` (`13,788 km²`) | **`0 km²` biome overlap** (by definition of `own`; `0` political overlap at all 4 chosen station pixels!) | Neighboring kits own their overlap ground (e.g., `(1055, 219)` belongs to `Compass Hills` Station 4 `gorge`, never duplicated here) |
| **Elevation (`min / p5 / p50 / mean / p95 / max`)** | `-1,828.6 / +665.1 / +2,829.5 / +3,357.1 / +7,893.1 / +12,579.6 m` | `+554.4 /` **`+846.8 / +2,217.3 / +2,843.9 / +5,844.8`** `/ +7,853.4 m` (`p10 = +1,054.9 m`, `p90 = +5,512.7 m`) | **`+847–5,845 m` (`p5–p95`)**: `5.0 km` of vertical relief from humid `Hām-Tsēk` slot-bottoms up to glaciated outer-wall radial spurs |
| **Barometric Pressure (`g = 7.4 m/s²`)** | `2.01–0.33 atm` (`1.12 atm` med) | **`1.44–0.77 atm` (`p5–p95`)**, median **`1.21 atm`** (`1.49 atm` at `+554 m` slot exit; `0.60 atm` at `+7,853 m` peak) | Dense hyperoxic `1.43–1.47 atm` (`pO2 = 0.30 atm`) canyon bottoms beneath thin `0.88 atm` alpine rims |
| **Köppen Climate Breakdown** | `Cfa` `38.8%`, `ET` `10.4%`, `Dfc` `6.5%`, `Dsc` `6.1%`, `EF` `5.5%`, `Csa` `5.3%` | **`Cfa` `44.1%` (`49,416 km²`)**, **`Csa` `12.6%` (`14,136 km²`)**, **`ET` `11.3%` (`12,656 km²`)**, **`Dfc` `9.7%` (`10,824 km²`)**, `EF` `8.0%` (`8,992 km²`), `Dfb` `3.1%`, `Dsc` `2.9%`, `O` `2.4%`, `Cfb` `2.2%`, `BSk` `1.2%` | Four-tier climate staircase inside a single canyon network (`Cfa` slot/lower bench -> `Csa` dry sun-rim -> `Dfc` boreal ledge -> `ET` frost-rim) |
| **Rainfall & Temperature** | Rain `16 / 863 / 1,820 mm/yr`; `T` med `+12.0 °C` (`+23/+1 °C`) | Rain `p5 / p50 / mean / p95` = **`204 / 863 / 866 / 1,522 mm/yr`** (`max 2,008 mm`); `T` med **`+15.0 °C`** (`mean +10.9 °C`, `+25/+5 °C`, slot trough **`+29 °C` [`+42/+16 °C`]**) | Strong thermal inversion between steaming `+28..+29 °C` southern `Hām-Tsēk` slot-bottoms and `-2 °C` `ET` frost-rims |

### 1.2 Trunk Hydrology (`9102` `Hām-Tsēk`) & `geology.json` Resources inside `own`

- **Master Trunk Canyon River (`9102` `Hām-Tsēk` / *Web-Cleaver River*, Hum tongue):** Enters `own` at `(1212, 254)` (`+1,195 m`, `Q = 664 m³/s`) carrying the sole SW spillway discharge of `Spider Lake`, loops `230 km` (`97` vertices) through the deep southern concentric cauldron trough at `(1097, 331) -> (1091, 334)` (`+912.6 -> +886.4 m`, `Q = 995–1,011 m³/s`, `+28..+29 °C` mean air!), slices NW across the radial fracture-nexus at `(998, 290)` (`+660.6 m`, `Q = 1,295 m³/s`), and exits `own` at `(963, 245)` (`+574 m`, `Q = 1,421 m³/s`) toward `Compass Hills` and `Ria River` (`9101`).
- **`geology.json` Provinces (`6,967` `4 km` cells in `own`):** **`57.3% sedimentary`** (`3,993` cells: uplifted outer-slope sandstones/siltstones), **`19.4% crystalline`** (`1,351` cells), **`12.1% granite`** (`840` cells: unroofed diapir stocks), **`10.9% impact`** (`756` cells: proximal outer-wall megabreccia on S rim, `impactite = 255`), `0.3% quartzite` (`20`), `0.1% carbonate` (`7`).
- **Surveyed Ore, Gem & Evaporite Bytes in `own`:** **`iron = 255`** (`4,491` cells `>= 120` in Fe-Ti basalt/diabase dikes), **`tin = 200`** (`840` cells `>= 120` in granite stocks + **`2` `9102` river placers** at `1097, 331` & `1091, 334`), **`saltpeter = 200`** (`532` cells `>= 120` under dry canyon overhangs), **`skarn = 200`** (`6` contact cells), **`emerald = 170`** (`614` cells `> 0`) & **`turquoise = 170`** (`1,339` cells `> 0`), **`rare-earth = 160`** (`840` cells `>= 120`), **`copper = 130`**, **`gold = 110`** (+ **`1` `9102` river placer** at `1091, 334`), **`silver = 110`**, **`coal = 75`**, and **`sulfur = 60`** (`19` hydrothermal ring-fault cells along `Y = 338–344`).

---

## 2. Tectonic / Geomorphic Character & Canyon-Inversion Physics (`ARACH_PHYS`, `[G data]`)

### 2.1 Venusian-Type Arachnoid Diapirs & Radial Dike Boxwork

Unlike tall subduction stratovolcanoes, `Arachnoid Canyons` formed where 4 abortive sub-crustal mantle-plume diapirs domed the northern outer-crater sedimentary/granite slope (`D = 45–110 km`, Venusian *arachnoid* / Mull & Ardnamurchan ring-complex analogue) and then partially deflated:
1. **Concentric Ring-Grabens & Stepped Cauldron Benches:** Deflation dropped nested arcuate graben troughs (`300–1,100 m` deep) floored by tabular **`tibasalt-ponded`** sills and hydrothermal sinter benches (`Station 2`).
2. **Radial `arch-rift-basalt` Dike Spokes (`KSTACKS` + `KSTRATA`):** Vertical `4–14 m`-thick blue-black Fe-Ti basalt and diabase dikes (with chilled glassy obsidian-vitrophyre selvages that clink like broken glass underfoot, and brick-red baked `bolus` contact margins) radiate `40–90 km` outward from each cauldron center, standing `80–320 m` proud as blade-like stone walls and natural river **shut-in gates** (`Station 1`) where `9102` breaches them at `60°–90°` intersections.
3. **Horizontal Columnar Hex-Joints:** Because radial dikes cooled laterally against vertical sandstone/granite walls, their hexagonal cooling columns lie **horizontally** like stacked cordwood (`KSTRATA` `arch-rift-basalt` colonnade), creating thousands of natural pigeonhole ledges for cliff-clinging lithophytes (`dikeclaw`), web-anchor pads, and Hum cliff-stairs (`Station 3`).

### 2.2 Pure `[G data]` Physics Engine (`src/40-biome-arach-phys.js`)

Zero `THREE`, zero `DOM`, deterministic on `KRAND` and `KMASK.canvas` (`0` `getImageData`), tested by `tests/test-arach-phys.js`:
1. **`ARACH_PHYS.fissureNetAt(x, z, site) -> {ringDistM, spokeDistM, slotWidthM, dikeHeightM, nexusScore01, vitrophyre01}`**
   - Evaluates intersecting concentric ring-fault arcs and radial dike rays (`KMASK` distance fields): where two or more dike rays cross a ring-graben (`nexusScore01 -> 1.0`), `slotWidthM` narrows to `32–75 m` between standing `arch-rift-basalt` ribs (`Station 1`). Chilled dike margins (`spokeDistM < 6 m`) raise `vitrophyre01` for glassy obsidian-scree foley and specular dark rock.
2. **`ARACH_PHYS.inversionAt(x, z, y, site) -> {tempC, rh01, mistDensity01, updraftMs, frost01}`**
   - Models the **vertical microclimate inversion**: canyon sky-view factor $\psi_{\text{sky}}(x, z) \in [0.08, 1.0]$ and hydrothermal flux $Q_{\text{therm}}$ keep deep slot floors (`\psi_{\text{sky}} < 0.28`, `y - y_{\text{bed}} < 120\text{ m}`) warm, frost-free (`frost01 = 0`), and mist-saturated (`rh01 = 0.88..0.99`, `mistDensity01 -> 0.85`), while thermal chimney updrafts (`updraftMs = 2.5..8.5 m/s` through narrow dike notches) strip moisture from exposed rims (`\psi_{\text{sky}} > 0.75`), driving dry `Csa` sclerophyll ledges at `+1,630 m` (`Station 3`) and sub-zero `frost01 > 0.7` `KFROST` polygons at `+4,784 m` (`Station 4`).
3. **`ARACH_PHYS.webSpanAt(anchorA, anchorB, gKrator) -> {spanM, sagM, tensionN, tierCount, validSpan}`**
   - Solves `0.75 g` (`g = 7.4 m/s²`) catenary mechanics $y(s) = a \cosh(s / a) - a$ for *Tsēk-Mā* communal suspension webs between `KSPACE`-paired basalt dike faces where `30 <= spanM <= 92 m`, `updraftMs >= 1.8 m/s`, and `frost01 === 0`: `sagM` is `25%` shallower than at `1 g`, allowing 3-tier horizontal capture sheets (`tierCount = 2..4`) suspended `18–75 m` clear of `9102` floodwaters!
4. **`ARACH_PHYS.fumaroleAt(x, z, site) -> {groundTempC, steam01, sinterRim01, sulfurCrust01}`**
   - Evaluates ring-fault hydrothermal seeps (`Station 2`): `groundTempC = 35..72 °C` builds travertine-silica `sinterRim01` terraces around step-pools and `sulfurCrust01` yellow-ochre sublimates (`KHAZ` `arachnoids:fumarole` where `groundTempC >= 58 °C`).

---

## 3. Stations (`4` Verified Sites Strictly Inside Core `own`)

Every station `(X, Y)` is verified on Scale Model `5.1` to lie **100% inside Core `Arachnoid Canyons` Proper** (`own[Y, X] === true`, `regs = ['rmvarachnoids']` exclusively, `10–74 km` clear of every neighboring biome boundary; `sky frame = (px - 272, py - 330)`). All view names obey survey item 30 (zero `'` and zero `:`).

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | `own` Buffer & Elev (`10 km` win) | `P_atm`, Climate, Rain & `T` (`w/c`) | `KSTRATA` & `geology.json` | Core Geomorphic & Ecological Signature |
|---|---|---|---|---|---|---|
| **1** | **`nexus`** *(main)* `dist/arachnoids.html` | **`(998, 290)`** `(+726, -40)` | `own = True` (`31.9 px` / `64 km` in); **`+660.6 m`** (`+646..+1,600 m`, `954 m` rel) | **`1.47 atm`**, `Cfa`, **`1,082 mm`**, **`+24 °C`** (`+34/+14`) | `arch-rift-basalt` radial star-dikes cutting `tepui` sandstone; `iron = 180`, `coal = 48` | **Radial Fracture-Nexus Slot Gorge & Communal Bridge-Web Shut-In:** `9102` `Hām-Tsēk` (`Q = 1,295 m³/s`) breaching a 3-spoke basalt dike star-junction under `35–85 m` catenary *Tsēk-Mā* bridge-webs, `KSPELEO` `saltpeter` overhangs & `site:hum-webgate` |
| **2** | **`fumarole`** `--station fumarole` `dist/arachnoids-fumarole.html` | **`(1097, 331)`** `(+825, +1)` | `own = True` (`6.0 px` / `12 km` in); **`+912.6 m`** (`+875..+2,000 m`, `1,125 m` rel) | **`1.43 atm`**, `Cfa`, **`1,224 mm`**, **`+28 °C`** (`+41/+15`) | `tibasalt-ponded` + `arch-rift-basalt` sill dams + `KTHERM` sinter; `iron = 180`, **`tin` & `gold` placers**, adj. `sulfur = 60` | **Warm Humid Canyon-Floor Fumarole & Dike-Dammed Step-Pools:** Inverted `+28 °C` steaming cauldron-slot floor, turquoise basalt-weir plunge pools, `fumarolefern` & `sintermat` jungles below `1,100 m` sheer dry cliffs |
| **3** | **`ledges`** `--station ledges` `dist/arachnoids-ledges.html` | **`(984, 283)`** `(+712, -47)` | `own = True` (`34.1 px` / `68 km` in); **`+1,629.0 m`** (`+659..+2,895 m`, `2,236 m` rel) | **`1.31 atm`**, **`Csa`**, **`769 mm`**, **`+18 °C`** (`+28/+8`) | `arch-rift-basalt` horizontal colonnades + `outland-tuff` over `granite`; **`tin = 200`**, `rare-earth = 160`, `gold/silver = 110` | **Mid-Wall Columnar Basalt & Tuff Ledge Forest:** Sun-baked `Csa` tiered colonnade benches (`KRELIEF.slab`), `columnarpine` & evergreen oak ledges, cliff-clinging `dikeclaw` rosettes, and a `KSPELEO.SMOKY` radial quartz cleft above a `970 m` mist abyss |
| **4** | **`frostrim`** `--station frostrim` `dist/arachnoids-frostrim.html` | **`(919, 281)`** `(+647, -49)` | `own = True` (`37.0 px` / `74 km` in); **`+4,784.3 m`** (`+2,764..+5,822 m`, `3,058 m` rel) | **`0.88 atm`**, **`ET`** (`Dfc` lip), **`392 mm`**, **`-2 °C`** (`+7/-12`) | Frost-riven `granite` & glassy `arch-rift-basalt` vitrophyre ribs; **`tin = 200`**, `rare-earth = 160`, `iron = 120` | **High Alpine Frost-Rim & Updraft-Sheared Krummholz:** `KFROST` stone polygons & clinking obsidian-selvage dike hogbacks overlooking `2,000 m` cloud-stuffed radial chasms; horizontal `rimkrummholz` banners streaming in warm slot updrafts |

### 3.1 Station 1 (`nexus`, main page `dist/arachnoids.html`): Radial Fracture-Nexus Slot Gorge — `(998, 290)`
- **Site & Framing (`5.4 × 5.4 km`):** Deep inside `own` (`64 km` clear of any neighboring biome), where **`9102` `Hām-Tsēk` (`Q = 1,295 m³/s`, `+660.6 m`)** saws through three intersecting radial `arch-rift-basalt` dike walls (`KSTACKS` fins rising `240 m` out of `+1,600 m` cross-bedded `tepui` canyon walls).
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* Vertical `arch-rift-basalt` radial dike spokes (`3–8 m` horizontal hexagonal `colonnade` cores, glassy black vitrophyre margins, and `1.5 m` brick-red baked `bolus` contact zones) crosscutting uplifted `tepui` sandstone.
  - *Ground (`5` layers):* `ground.gravel.vitrophyre` (clinking black obsidian-selvage dike talus), `ground.moss.canyon` (mist-fed gorge floor), `ground.sand.river` (`9102` eddy bars), `rock.basalt.wet` (shut-in splash ledges), `ground.nitre.crust` (dry overhang floors).
- **Signature Visuals:** `35–85 m` overhead, multi-tiered golden-gunmetal **Arachnoid Bridge-Webs (`bridgeweb`)** span between horizontal basalt hex-columns, glistening with condensed canyon mist (`ATMOS.fogBelt`) as `45 cm` colonial *Tsēk-Mā* spiders tend the guy-lines. Under dry undercut sandstone/basalt alcoves (`KCAVERN` + `KSPELEO`), white **`saltpeter = 200`** crusts gleam above `site:hum-webgate` (`r = 160 m` cliff-pier reserve), with `?works=0` Hum braided-silk suspension anchor capstans and carved basalt wind-flutes (`class: 'furniture'`).
- **Preset views:** `overview`, `radial-dike-nexus`, `communal-bridge-webs`, `whitewater-shutin`, `saltpeter-alcove`, `hum-webgate-pier`.

### 3.2 Station 2 (`fumarole`, `dist/arachnoids-fumarole.html`): Canyon-Floor Fumarole & Step-Pools — `(1097, 331)`
- **Site & Framing (`5.2 × 5.2 km`):** At the `+912.6 m` thermal trough of `9102` (`Q = 995 m³/s`, `+28 °C` annual mean / `+41 °C` warm season, `1,125 m` below `+2,000 m` cauldron walls), where transverse basalt sills dam the river into stepped turquoise plunge pools beside steaming ring-fault fumaroles (`KTHERM` + `ext/54-core-water-geyser.js`) and surveyed **`tin` + `gold` river placers**.
- **`KSTRATA` & `KGROUND` Stack (`5` layers):**
  - *Strata:* Tabular `tibasalt-ponded` cauldron sills + `arch-rift-basalt` weir ribs capped along vents by porous white-ochre hydrothermal silica sinter.
  - *Ground (`5` layers):* `organic.sinter.therm` (zoned orange-gold-jade thermophilic mat), `rock.sinter.white` (steaming fumarole aprons), `ground.moss.canyon`, `ground.sand.placer` (cassiterite-and-gold black sandbars), `ground.gravel.vitrophyre`.
- **Signature Visuals:** Billowing fumarole steam merges into a luminous low-altitude canyon mist lid (`inversionAt`), sheltering `6 m` **`fumarolefern`** crowns, thermophilic orange-emerald **`sintermat`** aprons, and `BIO.kin` bamboo thickets on the humid slot floor while arid, sun-bleached cliff rims tower `1 km` above! `?works=0` places Hum placer-washing wooden riffle boxes and willow sulfur-condenser baskets.
- **Preset views:** `overview`, `dike-step-pools`, `fumarole-sinter-apron`, `thermal-fern-gallery`, `placer-riffle-bar`, `inversion-mist-lid`.

### 3.3 Station 3 (`ledges`, `dist/arachnoids-ledges.html`): Mid-Wall Columnar Basalt & Tuff Ledge Forest — `(984, 283)`
- **Site & Framing (`5.4 × 5.4 km`):** Perched halfway up a `2,236 m`-relief chasm wall (`+1,629.0 m`, `1.31 atm`, dry-summer **`Csa` `769 mm/yr`**), where horizontal hexagonal `arch-rift-basalt` colonnades and cream-ochre `outland-tuff` beds (`KRELIEF.slab`) step across a `tin = 200` / `rare-earth = 160` diapir granite contact.
- **`KSTRATA` & `KGROUND` Stack (`4` layers):**
  - *Strata:* Tiered `arch-rift-basalt` horizontal colonnades + welded `outland-tuff` benches resting on unroofed `granite` diapir basement.
  - *Ground (`4` layers):* `ground.needles` (`columnarpine` & oak litter), `ground.dry_grass` (`Csa` sun-bench turf), `ground.gravel.vitrophyre`, `ground.lichen.crust`.
- **Signature Visuals:** Gnarled **`columnarpine`** and `BIO.kin` evergreen oaks pry their flared roots (`BIO.flareJoin`) into basalt column joints; sheer vertical faces between benches are tapestried in crimson-and-silver **`dikeclaw`** lithophyte rosettes and resinous **`webanchorvine`** pads; a walkable `9 m`-wide radial tension cleft (`KCAVERN` + `KSPELEO.SMOKY`) reveals smoky-quartz druse behind the cliff face, looking down into the silver cloud-ribbon filling the slot gorge `970 m` below.
- **Preset views:** `overview`, `columnar-ledge-woods`, `dikeclaw-cliff-face`, `smoky-quartz-kluft`, `abyss-mist-overlook`.

### 3.4 Station 4 (`frostrim`, `dist/arachnoids-frostrim.html`): High Alpine Frost-Rim & Radial Krummholz — `(919, 281)`
- **Site & Framing (`5.4 × 5.4 km`):** On the western outer-wall structural shoulder (`+4,784.3 m`, `0.88 atm`, **`ET` `392 mm/yr`, `-2 °C` [`+7/-12 °C`]**, dropping `2,020 m` into `Dfc` radial chasms within `10 km`).
- **`KSTRATA` & `KGROUND` Stack (`4` layers):**
  - *Strata:* Frost-shattered `granite` felsenmeer pierced by standing jet-black `arch-rift-basalt` vitrophyre dike hogbacks.
  - *Ground (`4` layers):* `ground.frost.polygon` (`KFROST` sorted stone rings), `ground.gravel.vitrophyre` (black volcanic glass scree), `ground.lichen.crust`, `ground.snow.patch` (shaded leeward drifts).
- **Signature Visuals:** Frost-sorted `KFROST` polygonal stone rings and jet-black glassy **vitrophyre dike hogbacks** cut across pale `tin = 200` granite felsenmeer. Along the chasm lips, warm moist air rising `2,000 m` out of the deep grabens condenses into rime-plumes and shears **`rimkrummholz`** conifers into flat horizontal green banners pointing radially away from every slot edge!
- **Preset views:** `overview`, `radial-chasm-lip`, `updraft-krummholz-flag`, `vitrophyre-dike-rib`, `frost-polygon-rim`.

---

## 4. Flora & Structural Guilds (`src/50-biome-arach-species.js`, `check_botany.py` Verified)

| Key | Name & Clade | Vertical Guild & Zone | Height / Span & `3D` Builder | Biome Mechanics & `HV(wood, edible, medicinal, note)` |
|---|---|---|---|---|
| **`fumarolefern`** | **Steam-Plume Tree-Fern** (*Cyathea / Blechnum thermale*) | Canyon-floor thermal & step-pool (`Station 2`, `frost01 === 0`, `rh01 >= 0.82`) | `3.2–7.0 m` fibrous silica-armoured trunk with `3.5 m` arching bronze-emerald fronds (`ATMOS` mist-drip sheen) | Thrives in `1.43 atm`, `+28 °C` H₂S/CO₂-enriched fumarole mist and dike plunge-pool spray; silica scales resist scalding condensate. `HV('none', ['steamed crosier pith'], true, 'Silica-rich trunk fibre braided into heat-proof tongs by Hum sulfur & placer crews; mucilage salve for steam burns.')` |
| **`sintermat`** | **Thermophilic Sinter-Cushion** (*Thermobryum / Oscillatoria arachnoidea*) | Fumarole aprons & warm basalt weirs (`Station 2`, `groundTempC = 34..62 °C`) | `0.03–0.16 m` terraced ochre-gold, copper-orange & jade gelatinous mats (`BIO.fung` + `KGROUND` height blend) | Precipitates porous silica-travertine micro-rims around warm step-pools, zoning color strictly by water temperature. `HV('none', [], true, 'Dried ochre-orange mineral crust ground for antiseptic poultices and warm saffron-ochre pottery slip.')` |
| **`dikeclaw`** | **Hex-Joint Cliff Lithophyte** (*Vriesea / Saxifraga basaltica*) | Vertical `arch-rift-basalt` colonnades (`Stations 1–3`, `slope > 0.65`) | `0.45–1.40 m` spiky silver-pruinose & carmine rosette clamping horizontal hexagonal basalt cracks | Velamen anchor-roots wedge into `10–30 cm` cooling joints between horizontal basalt columns, drinking nocturnal updraft mist (`inversionAt.mistDensity01`). `HV('none', ['nectar spike'], false, 'Crushed carmine bracts yield fast gorge-red silk dye; rosette tanks hold clean drinking water on sheer climbs.')` |
| **`webanchorvine`** | **Gum-Pad Chasm Creeper** (*Parthenocissus glutinosa*) | Slot-gorge walls & shut-in dikes (`Stations 1–3`) | `4.0–18.0 m` woody cliff liana with discoid amber adhesive pads | Co-evolves with *Tsēk-Mā* bridge-spiders: spiders anchor primary guy-cables around its lignified stem loops while the vine absorbs nitrogen-rich prey droppings! `HV('cordage', [], false, 'Boiled adhesive pads yield waterproof caulking pitch for Hum river-barges and cable bindings.')` |
| **`columnarpine`** | **Basalt-Claw Ledge Pine** (*Pinus hexagona*, `85%` Earthlike ledge matrix) | Mid-wall `Csa`/`Cfa` colonnade & tuff benches (`Station 3`, `+1,350..+2,900 m`) | `8.0–22.0 m` flat-topped, thick-barked conifer (`BIO.flareJoin` octagonal root-buttresses straddling column tops + `34` impostor) | Flared root-claws lock onto fractured basalt/tuff ledges at `0.75 g`, leaning `15°–28°` out over `900 m` chasms without uprooting. `HV('timber, resin', ['ledge pinyon nut'], true, 'Resinous rot-proof bridge-deck planking and pitch torches.')` |
| **`rimkrummholz`** | **Updraft-Flagged Rim Pine-Juniper** (*Pinus / Juniperus flagellata*) | `Dfc` / `ET` chasm rims (`Station 4`, `+3,300..+5,100 m`, `updraftMs >= 3.0`) | `0.45–1.90 m` prostrate, streamlined banner-cushion (`yaw` locked radially away from nearest `fissureNetAt` chasm lip!) | Abraded by ice spindrift on the plateau back while bathed in rising canyon plumes on the lip, growing strictly as directional wind-vanes. `HV('fuel', ['rime-berry'], true, 'Dense twisted root-wood burned in high-pass cairn braziers; aromatic juniper-like berries.')` |
| **`frostcushion`** | **Vitrophyre Glass-Wort Cushion** (*Silene / Azorella vitrea*) | `ET` frost-polygon rims (`Station 4`, `frost01 >= 0.65`) | `0.08–0.32 m` hemispherical silver-emerald wooly dome hugging black basalt dike selvages | Dark obsidian-vitrophyre gravel absorbs solar warmth in `0.88 atm` `-2 °C` air, warming cushion roots `8–12 °C` above ambient. `HV('fuel', [], true, 'Dried resinous turf blocks burned on treeless alpine portages; febrifuge tea.')` |

### 4.1 Explicit Cross-Biome Non-Duplication Guardrails
1. **Against `biomes/spiderlake` (`rmvyj4v2ozgb1`):** `Spider Lake` owns calm `+1,460 m` open-water shoreline reed-curtain silk farms (`SL1–SL4`). `Arachnoid Canyons` (`own`) has **`0 km²` lakes** and places **high-altitude horizontal/catenary structural bridge-webs (`bridgeweb`)** tensioned `35–90 m` between vertical basalt dike walls across roaring slot canyons!
2. **Against `biomes/compasshills` (`rmweu4kpowzji`):** Zero `Lodestone` flux-quench magnetic vortices, zero `compassbush` magnetotropism, and `(1055, 219)` stays strictly in `Compass Hills`.
3. **Against `biomes/korona` & `biomes/tiers`:** `Arachnoid Canyons` is defined by **intersecting radial/concentric `arch-rift-basalt` dike boxwork + warm-bottom / cold-rim vertical microclimate inversion**, never broad open `tepui` table-tops or regular glacis stairs.

---

## 5. Fauna (`kits/fauna` `[G data]`) & Data-Driven Hazards (`core/hazard`, `KHAZ`)

### 5.1 Native & Gorge Fauna Roster (`6` Species)

| Key (`kits/fauna`) | Name & Clade | Scale | Niche & Canyon Adaptation | Yields & 24h Schedule |
|---|---|---|---|---|
| **`bridgearachnid`** | **Chasm-Weaver (*Tsēk-Mā*)** (colonial suspension-web arachnid; `bridgeweb` builder) | `0.38–0.52 m` legspan (`1.8 kg`) | Colonies of `40–180` females spin `35–90 m` braided golden-gunmetal catenary guy-cables and horizontal capture-sheets across `9102` basalt dike shut-ins (`1.47 atm`, `0.75 g`), harvesting updraft stonefly/mayfly clouds; non-aggressive to bridge-walkers unless anchor cables are severed! | `wild-chasm-silk` (high-tensile hawser fibre), `venom-reagent`. `05–09` `REEL_DEW_SILK`, `09–17` `CROUCH_DIKE_JOINT`, `17–22` `SPIN_BRIDGE_SHEET`, `22–05` `CULL_SWARM` |
| **`dikegecko`** | **Column-Claw Glide-Saurian** (patagial cliff reptile/hexapod) | `0.48 m` | Launches off horizontal basalt hex-columns on `Stations 1–3`, gliding `80 m` across `1.43 atm` canyon updrafts below the spider-web tiers | `scale-hide`, `small-meat`. `07–11` `BASK_BASALT`, `11–18` `GLIDE_FORAGE`, `18–07` `CREVICE_TORPOR` |
| **`ventloach`** | **Sinter-Pool Armor-Loach** (thermophilic canyon fish) | `0.35 m` | Grazes `sintermat` biofilms in `+28..+36 °C` basalt-dike step-pools (`Station 2`), climbing wet cascade weirs with suctorial belly-fins | `fish`, `fish-oil`. `00–24` `GRAZE_WEIR` |
| **`nitreswift`** | **Echo-Clicking Nitre-Swiftlet** (echolocating gorge bird) | `0.22 m` | Roosts by the thousand inside dry `KSPELEO` `tepui` overhangs (`Stations 1–2`), depositing the guano that mineralizes into **`saltpeter = 200`** while dodging `bridgeweb` cables via `7 kHz` double-clicks | `guano-nitre`, `feathers`. `05–08` `DAWN_SPIRAL`, `08–18` `HAWK_RIM`, `18–05` `ROOST_ALCOVE` |
| **`columnargoral`** | **Hex-Step Cliff Goral** (caprine cliff browser) | `0.90 m` shoulder | Bounds along `20 cm` horizontal basalt column-ends from `+1,400 m` `Csa` ledges (`Station 3`) up to `+4,800 m` `ET` frost-rims (`Station 4`) | `venison`, `wool-undercoat`, `horn`. `06–11` `BROWSE_LEDGE`, `11–16` `RUMINATE_DIKE`, `16–20` `CLIMB_SCARP`, `20–06` `BED_ALCOVE` |
| **`vitrophyremarmot`** | **Obsidian-Whistler** (colonial alpine burrowing mammal) | `0.55 m` | Excavates frost-heaved granite/vitrophyre talus on `Station 4` (`ET`), piping `3.2 kHz` alarm whistles that echo down `2 km` radial chasms | `pelt`, `tallow`, `meat`. `07–17` `FORAGE_CUSHION`, `17–07` `BURROW_HUDDLE` |

### 5.2 Data-Driven Hazards (`KHAZ`) & 4-Layer Acoustic Profile (`NEW-BIOMES-SOUND-DESIGN-BRIEF.md` §9)

| Hazard ID | `KHAZ` Kind | Stations & Trigger (`ARACH_PHYS`) | Visual / Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`arachnoids:webtrap`** | `snare` | `Station 1 nexus` (`< 3.5 m` from active `bridgeweb` anchor-sheets off the cleared Hum footpath) | Shimmering golden-gunmetal guy-cables & `12 Hz` plucked-string web-tremor; entangles trespassers and alerts `bridgearachnid` defenders |
| **`arachnoids:fumarole`** | `heat` / `gas` | `Station 2 fumarole` (`fumaroleAt(...).groundTempC >= 58 °C`) | Boiling steam plumes, yellow `sulfur = 60` crust & orange `sintermat` bullseyes; scalding steam damage if stepped into |
| **`arachnoids:slotflood`** | `current` | `Stations 1, 2` (`9102` `Hām-Tsēk` `45 m` basalt dike shut-in thalweg) | Roaring whitewater standing waves between polished blue-black basalt ribs (`Q = 995–1,295 m³/s` sweep) |
| **`arachnoids:updraftdrop`** | `wind` / `fall` | `Stations 3, 4` (`updraftMs >= 5.5 m/s` within `4 m` of `> 300 m` sheer chasm lips) | Streamlined `rimkrummholz` wind-vanes & rising mist ribbons; sudden cross-gusts along unguarded cliff edges |

**Station-by-Station 4-Layer Procedural Audio (`NEW-BIOMES-SOUND-DESIGN-BRIEF.md` §9):**
- **Layer 1 (Atmospheric & Hydro Bed):** Cavernous `35 ms` slapback gorge wind (`Stations 1, 3`), deep `9102` whitewater + fumarole sub-bass hum (`35–80 Hz`, `Stations 1–2`), shifting to thin `0.88 atm` howling katabatic spindrift on `Station 4`.
- **Layer 2 (Web & Avian Texture):** Low Aeolian harmonic drone (`110–220 Hz`) as canyon updrafts vibrate tensioned `bridgeweb` silk hawsers (`Station 1`), punctuated by `nitreswift` `7 kHz` cave-click echoes.
- **Layer 3 (Geological Foley):** Sharp **metallic-glassy clatter of chilled obsidian-vitrophyre dike flakes** (`vitrophyre01 > 0.5`) underfoot + wet travertine-sinter splash on `Station 2`.
- **Layer 4 (Tectonic / Cryogenic Accent):** Subtle subterranean basalt-fissure degassing groans (`Station 2`) and sharp permafrost/granite frost-cracks (`Station 4`).

---

## 6. Crops, Gatherables & Material Budget (`kits/crops`, `kits/resources`, `core/materials`)

### 6.1 `CROPS.BIOMES.arachnoids` Registration (`93` Verified Crops via `CROPS.forBiome`)

```js
arachnoids: {
  atm: 1,   /* median 1.21 atm across mid-wall benches; slotfloor overrides to dense 1.43-1.47 atm (2), frostrim to thin 0.88 atm (0) */
  zones: {
    slotfloor: {warmth: [3, 4], arid: [3, 3], wet: true, heated: true, atm: 2}, /* +660..+1,050 m warm misty 9102 & fumarole terraces */
    ledgewood: {warmth: [2, 3], arid: [1, 3], atm: 1},                          /* +1,100..+2,600 m Cfa/Csa basalt & tuff benches */
    dryrim:    {warmth: [2, 3], arid: [1, 2], atm: 1},                          /* +1,500..+2,400 m 12.6% Csa sun-exposed dike rims */
    frostrim:  {warmth: [0, 1], arid: [1, 2], atm: 0}                           /* +3,500..+5,845 m Dfc/ET alpine frost-rims */
  }
}
```
- **Verified `CROPS` Palette (`93` fits):**
  - *Warm `slotfloor` (`atm: 2, wet: true, heated: true`):* **`rice`**, **`wild-rice`**, **`taro`**, **`steambed-yam`**, `sweet-potato`, `helix-bean`, `wingnut`, `tea`, `mulberry` (along the Hum–Spider-Lake silk corridor!), and dark-bed `pale-fungi` / `glow-mushroom` in damp `KSPELEO` side-clefts.
  - *Mid-wall `ledgewood` & `dryrim` (`Cfa`/`Csa`):* **`emmer`**, **`frostoat`**, **`basin-amaranth`**, `tepary-bean`, `murnong`, `painted-camas`, **`pinyon`**, `acorn`, `whorl-olive`, `canyon-grape`, `saffron`.
  - *High `frostrim` (`ET`/`Dfc`, `atm: 0`):* **`frostroot`**, alpine lichens, and hardy `frostoat` on sheltered `Dfc` benches.

### 6.2 Gatherables & Trade Closure (`Spider Lake -> Hām-Tsēk -> Ria` & `Korona` Silk Corridor)

| Resource / Gather Tag | Source inside `own` (`biomes/arachnoids`) | Local Hum Gorge-Warden Use | Regional Export (`Spider Lake`, `Compass Hills`, `Ria`, `Korona`) |
|---|---|---|---|
| **`wild-chasm-silk` (`gather: 'silk'`)** | Shed/culled *Tsēk-Mā* guy-cables on `Station 1` shut-ins | Suspension toll-bridges, safety harnesses, bowstrings | Blended with `Spider Lake` reel-silk for heavy marine & crane hawsers |
| **`saltpeter = 200` (`532` cells `>= 120`)** | Dry `KSPELEO` `nitreswift`-guano & web-refuse overhangs (`Stations 1–2`) | Meat curing, signal flares along gorge watch-posts | Alchemical & oxidizer trade down `9102` to `Ria Valley` |
| **`tin = 200` (`840` cells) & `gold` placers** | Diapir `granite` contacts (`Stations 3–4`) + `3` `9102` placers (`Station 2`) | Non-corroding bronze bridge-pins & pulley sheaves | Direct tin supply to **`Compass Hills`** zero-iron bronze toolmakers! |
| **`sulfur = 60` & `dikeclaw` carmine dye** | Southern ring-fault fumaroles (`Station 2`) & colonnade cliffs | Silk bleaching/degumming (`sulfur`) & crimson sash dyeing | Dyed Hum silk-bolts traded to `Korona` guides (`K6`/`K7`) & `Upper Ria` |

### 6.3 Genuine Library Materials & `PROMPTS-NEEDED.md` Additions
- **Reused library sets (`materials.json`):** `rock.basalt.columnar`, `rock.sandstone.tepui`, `rock.granite.tor`, `rock.sinter.white`, `ground.dry_grass`, `ground.needles`, `ground.gravel019`, `ground.lichen.crust`, `bark.ponderosa`, `bark.juniper`, `card.pine`, `card.broadleaf`, `card.fern.frond`.
- **Four targeted prompts for `core/materials/PROMPTS-NEEDED.md` (procedural fallback until packed):**
  1. **`ground.gravel.vitrophyre`** — jet-black conchoidal obsidian-vitrophyre dike-selvage shards mixed with brick-red baked `bolus` grit (`Stations 1, 3, 4`).
  2. **`card.web.chasmcable`** — braided golden-gunmetal communal spider guy-cables and dew-beaded cribellate capture sheet (`Station 1`).
  3. **`organic.sinter.therm`** — terraced copper-orange, ochre-gold, and emerald thermophilic fumarole biofilm (`Station 2`).
  4. **`card.lithophyte.dikeclaw`** — silver-pruinose and carmine cliff-clinging rosette sprays wedged into basalt hex-joints (`Stations 1–3`).

---

## 7. Numbered Fragment Architecture (`src/`), Rollout & Build Contracts

### 7.1 Fragment Map & `PORT.md` Tags

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `CORE_BIOME_MIN` + `31j,32,33,35,39,41..44`, `KDRAWN`, `KRAND`, `KMASK`, `KTAGS`, `KSPACE`, `KSTRATA`, `KSTACKS`, `KRELIEF` + `38d`, `KCAVERN`, `KSPELEO` + `39b2`, `KFROST`, `KTHERM`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER` (+ `ext/54`), `ATMOS`, `CROPS` |
| `40-biome-arach-phys.js` | **`[G data]`** | `ARACH_PHYS`: `fissureNetAt`, `inversionAt`, `webSpanAt`, `fumaroleAt` (zero `THREE`/DOM; `KMASK` + `KRAND`) |
| `41-biome-arach-sites.js` | **`[G data]`** | `ARACH_SITES`: verified `own` pixels `(998,290)`, `(1097,331)`, `(984,283)`, `(919,281)`, `arch-rift-basalt` stacks, `site:hum-webgate` reserve |
| `45-host-stage.js` | `[web]` | Renderer, radial-graben/dike heightfield (`KRELIEF.slab`, `KSTACKS`, `KCAVERN`, `KFROST`, `KTHERM`), `KDRAWN.add`, `BIO.init({tags:'arachnoids'})` |
| `47a..47c` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `nwlowlands`, `swlowlands`, and `korona` gorge trees, bamboo, oaks & alpine sedges read in place (`85%` vascular matrix) |
| `50-biome-arach-species.js` | `[G partial]` | `ARACHNOIDS.SPECIES` (`7` own species) + `bridgeweb` catenary sheet-and-guy-cable mesh builder & `HV` botany metadata |
| `60-biome-arach-place.js` | **`[G data]`** | Deterministic `KRAND.cell` placement, `KSPACE` opposite-dike `webSpanAt` pairing, `KSPELEO.place`, `CROPS`, and `KTAGS` registration |
| `84-host-ground.js` | `[web]` | `KGROUND` (`<= 5` layers), `KSTRATA` horizontal basalt colonnade + red `bolus` shading, `KFAR` (`14 km`), `KHORIZON` |
| `86-host-works.js` | `[web]` | `site:hum-webgate` reserve + `?works=0` Hum silk-cable capstans, placer riffle-boxes, basalt wind-flutes (`class: 'furniture'`) |
| `89a-host-atmos.js` & `89w-host-water.js` | `[web]` | `ATMOS.bindHost` (`1.47 -> 0.88 atm`, inverted slot-mist `fogBelt`), `WATER.flow` (`9102`), `WATER.still` step-pools & fumarole steam |
| `99-host-take.js` | `[web]` | `KHOST.take`, `[Clear] / [Slot-Mist] / [Rim-Gale]` toggles, compliant preset views, `hostChecks()` |

### 7.2 Rollout Milestones (`AC0–AC5`)
- **`AC0`:** Land `PLAN.md`; add `"biomes/arachnoids"` to all 5 lists in `tools/checks_optin.json` and append the 4 material prompts to `core/materials/PROMPTS-NEEDED.md`.
- **`AC1`:** Implement `src/40-biome-arach-phys.js` + `src/41-biome-arach-sites.js` (`[G data]`) and pass `node biomes/arachnoids/tests/test-arach-phys.js` on `tools/ktest.js`.
- **`AC2`:** Build **Station 1 `nexus`** (`dist/arachnoids.html`): radial `arch-rift-basalt` star-junction, `9102` shut-in rapids, `KSPACE` catenary `bridgeweb` spans, `KSPELEO` `saltpeter` overhangs, `verify.py --assert`.
- **`AC3`:** Build **Station 2 `fumarole`** (`-fumarole` step-pools & `KTHERM` fumaroles), **Station 3 `ledges`** (`-ledges` `KRELIEF.slab` colonnades & `KSPELEO.SMOKY` cleft), and **Station 4 `frostrim`** (`-frostrim` `ET` `KFROST` polygons & updraft-flagged `rimkrummholz`).
- **`AC4–AC5`:** Register `CROPS.BIOMES.arachnoids` (`93` crops, `test-crops.js`) and the 6 `kits/fauna` records; write `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; pass `python3 tools/test_all.py`.

### 7.3 `build.py`, `stations/nexus.json` & `verify.py` Assembly Contracts (`AGENTS.md`)

```python
#!/usr/bin/env python3
"""Build biomes/arachnoids stations -> dist/arachnoids[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS check

STATIONS = ('nexus', 'fumarole', 'ledges', 'frostrim')
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '35-core-anim.js', '39-core-lean.js', '41-core-env.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js',
]
# Every text open() names encoding='utf-8' (and newline='\n' when writing); all paths use '/'
```

```json
{
  "id": "nexus",
  "title": "Arachnoid Canyons — Ham-Tsek Radial Dike Nexus & Bridge-Web Shut-In",
  "px": [998, 290],
  "ownVerified": true,
  "elevM": 660.6,
  "pAtm": 1.47,
  "koppen": "Cfa",
  "rainMmYr": 1082,
  "riverId": 9102,
  "dischargeM3s": 1295.0,
  "strataStack": "arch-rift-basalt",
  "kin": ["nwlowlands", "swlowlands", "korona"],
  "reserves": [
    { "id": "site:hum-webgate", "x": -95, "z": 60, "r": 160 }
  ],
  "modes": ["Clear", "Slot-Mist", "Rim-Gale"]
}
```

```json
{
  "slots": {
    "strata_basalt": "rock.basalt.columnar",
    "strata_sandstone": "rock.sandstone.tepui",
    "rock_granite": "rock.granite.tor",
    "rock_sinter": "rock.sinter.white",
    "ground_grass": "ground.dry_grass",
    "ground_needles": "ground.needles",
    "ground_gravel": "ground.gravel019",
    "ground_lichen": "ground.lichen.crust",
    "bark_pine": "bark.ponderosa",
    "bark_juniper": "bark.juniper",
    "card_pine": "card.pine",
    "card_oak": "card.broadleaf",
    "card_fern": "card.fern.frond"
  }
}
```

```python
#!/usr/bin/env python3
"""Verify biomes/arachnoids stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'nexus':    'dist/arachnoids.html',
    'fumarole': 'dist/arachnoids-fumarole.html',
    'ledges':   'dist/arachnoids-ledges.html',
    'frostrim': 'dist/arachnoids-frostrim.html',
}

if __name__ == '__main__':
    harness.main(pages=PAGES, default_page='nexus', checks=harness.SURVEY)
```

---

## 8. Verification & Budgets (`verify.py --assert`, `openworld/` & Godot `4.7.2`)

1. **Strict `own`-Polygon & Non-Overlap Invariant (`test-arach-phys.js`):** Asserts that all 4 station coordinates `(998, 290)`, `(1097, 331)`, `(984, 283)`, and `(919, 281)` satisfy `own_ar === true` (`0` overlap with `Compass Hills`, `Spider Lake`, `Korona`, `Tiers`, or `Ria Valley`; explicitly rejects `(1055, 219)`).
2. **Vertical Microclimate Inversion Proof (`inversionAt`):** Asserts `tempC(y_bed + 5) - tempC(y_rim) >= +8.5 °C` and `rh01(y_bed + 5) > rh01(y_rim) + 0.30` on `Stations 1–3`, and `frost01 === 0` on all `bridgeweb` anchors while `frost01 >= 0.70` on `Station 4 frostrim` (`T.neg`: zero `bridgeweb` or `fumarolefern` instances above `+1,450 m` or where `frost01 > 0`).
3. **`0.75 g` Catenary Bridge-Web Anchoring (`webSpanAt` + `hostChecks`):** Proves every `bridgeweb` record terminates within `0.15 m` of solid `KSTRATA` basalt/rock on both ends (`30 <= spanM <= 92 m`, lowest sag point `>= 12 m` above `WATER.flow` `9102` surface; `T.neg`: zero sky-floating web endpoints!).
4. **Sampler, Triangle, Shadow & Z-Fighting Budgets:**
   - **Samplers (`< 15` hard gate):** `KGROUND` (`<= 5` layers: `4–5`) + `KSTRATA` (`2`) + `ATMOS` (`2`) + `KHORIZON` (`1`) + `WATER` (`2`) = **`11–12` active samplers** (`12–13` when `?shadow=1`; `KSHADOW` off at page load).
   - **Geometry & Draw Calls:** `< 6.5 M` triangles and `< 120` draw calls per station (`34` octahedral impostors beyond `160 m`; instanced `dikeclaw` & `rimkrummholz`; merged `bridgeweb` catenary ribbons with `>= 0.02 m` normal offset on anchor pads — `0` coplanar decal z-fighting, `0` untextured lit meshes, `0` console errors, positive `KDRAWN` eye clearance).
5. **`openworld/` Streaming & Godot `4.7.2` Parity:** In 1:1 `openworld/` streaming, `ARACH_PHYS` evaluates radial/concentric dike fields in world coordinates across `own` while cleanly yielding surface flora ownership inside neighboring overlap polygons; `golden-arach-phys.json`, `KSPELEO.export`, and `webSpanAt` records cross into `godot/krator/biome/arach_phys.gd` with `1e-6` agreement.

