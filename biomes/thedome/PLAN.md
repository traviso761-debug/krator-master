# thedome: the plan (locked design, 2026-11-22)

**The Dome** (`rmweubdnyts8y` / `the dome` in Scale Model `5.1`): a **`28,960 km²`** (`7,240` `2 km` cells, **`100.0%` dry land**, `X = 1298..1403, Y = 100..194`) **resurgent quartz-porphyry & leucogranite laccolith dome** rising in haunting, symmetric isolation on the northeastern rim of the `Ria Valley` macro-basin — bounded by **`Upper Ria`** (`rmweu2qb4nyia`, northwest, where trunk river **`9101` `Rīwa-Wāta` (*High-Ria:* `Līwa-Wāda`)** skirts `8 km` outside the NW collar), **`Springhollows`** (`rmvyiyw8ucd1y`, southwest), **`Spider Lake`** (`rmvyj4v2ozgb1`, south), and **`Tharn Hills`** (`rmweud6jurkfl`, east).

Unlike eruptive calderas or fault-block ranges (`0` volcanic vents in `vents.json`, `0 km²` direct overlap with `rmvarachnoids`), `The Dome` is a **cryptovolcanic / plutonic blister** (`~190 km` across, Richat Structure + Navajo Mountain + Stone Mountain / Brandberg analogue scaled to `g = 7.4 m/s²` / `0.75 g`). A buoyant anorogenic felsic magma body arched its roof strata by **`+1,483 m`** without breaching the surface, then unroofed into concentric **ring-dike hogbacks** and miles-wide **onion-skin sheet-jointed exfoliation shells** rising smoothly from **`+1,442.0 m`** (`p5 = +1,604.6 m`) at the perimeter seepage moat to **`+2,924.8 m`** (`p95 = +2,799.7 m`, median **`+2,301.9 m`**, mean **`+2,248.4 m`**) at the cloud-capped apex **`(1328, 150)`** under **`1.34–1.11 atm`** (`1.20 atm` median) and a **`97.0% Cfa` / `3.0% Cfb`** (`1,161 mm/yr` median rain, `+16.0 °C` annual mean [`+25/+6 °C`]) humid-subtropical-to-montane climate.

Four coupled geological and atmospheric mechanisms turn `The Dome` into one of Krator's most unforgettable landscapes (`80–85%` grounded bornhardt/montane guild ecology + `15–20%` eerie laccolith physics):
1. **Curved Monolithic Sheet-Jointed Bald-Rock Aprons & A-Tent Buckles:** Lithostatic unloading at `0.75 g` peels the pale rose-grey porphyry-granite core into sweeping `0.8–3.5 m`-thick **concentric exfoliation slabs ("onion-skins")** and hollow cantilevered **A-tent pop-up arches (`exfoliationarch`)** where trees cannot drive taproots.
2. **Perched Vernal Solution-Pan (`Gnamma`) Sky-Mirror Gardens:** Across bare curved stone aprons, `1,161 mm/yr` rain etches thousands of circular flat-floored **weathering pans (`gnammas`, `0.6–14 m` wide)** that brim like stepped sky-mirrors after storms and desiccate between squalls — hosting **resurrection-moss carpets (`gnammamoss`)**, ephemeral branchiopod crustaceans (`gnammatriops`), and ancient dwarfed **pan-island bonsai pines (`panbonsai`)**.
3. **Concentric Ring-Dike Moats & Seepage Fens:** Because zero raster rivers incise the impermeable convex carapace, `100%` of radial sheetwash cascades down the slabs and pools behind upturned concentric **ring-dike & carbonate collar hogbacks**, feeding lush annular **ring-moat seepage fens** of carnivorous pitcher-sedges (`moatpitcher`), golden sphagnum, and artesian toe-springs.
4. **Cloud-Combing Summit Garlands & Acoustic/Barometric Dome Phenomena ("The Singing Shell"):** Smooth radial airflow condenses above `+2,720 m` into a stationary **lenticular cap-cloud ("The Crown-Veil", `3.0% Cfb`)**, nurturing concentric **contour-line treeline garlands (`cloudgarlandpine`)** along exfoliation risers and silvery **fog-combing cushion rosettes (`crownrosette`)** — while hollow detached granite shells boom at `65–140 Hz` underfoot like giant **stone lithophones**, concave ring-dike walls focus whispers across `300 m`, and afternoon solar heating exhales warm barometric sighs (`ΔP` breathing) from deep radial *Kluft* clefts!

Status: **Build-ready specification** aligned with [`biomes/riavalley/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/riavalley/PLAN.md), [`biomes/springhollows/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/springhollows/PLAN.md), and [`biomes/spiderlake/PLAN.md`](file:///home/antigravity/traviso761-debug/krator-master/biomes/spiderlake/PLAN.md). Zero edits outside `biomes/thedome/PLAN.md`.

---

## Core adoption

Written first per [`README.md`](file:///home/antigravity/traviso761-debug/krator-master/README.md) ("CORE MODULES ARE NOT OPTIONAL") and verified against [`tools/check_core_use.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/check_core_use.py) (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/thedome` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('thedome')` (`window.THEDOME`); `31j` `BIO.flareJoin` on contorted `panbonsai` roots gripping exfoliation lips; `32` `BIO.kin` reading `springhollows` and `swlowlands` red-cedar/juniper, stunted oak, alder, and sedges in place for the `80–85%` montane/fen matrix; `33` `BIO.fung` for concentric crustose `ringlichen` bullseyes and wet sheetwash cyanobacteria streaks; `34` octahedral impostors on `>= 7 m` ring-moat & garland trees; `35`/`39` laminar upslope breeze sway |
| **`core/speleo`** *(via `core/terrain`)* | [`core/terrain/39-core-cavern.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/39-core-cavern.js) (`KCAVERN`), [`39b-core-speleo.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/39b-core-speleo.js) (`KSPELEO`), [`39b2-core-speleo-cleft.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/39b2-core-speleo-cleft.js) (`KSPELEO.SMOKY`) | Sub-slab cantilevered **A-tent exfoliation vaults** (`Station 1`) and the `45 m`-deep **radial unloading *Kluft* fissure** (`Station 4 cleft`) lined with **`KSPELEO.SMOKY`** smoky-quartz, chlorite-dusted microcline, and topaz `KSPELEO.VUG` pockets (`KSPELEO.blocks` solid collision) |
| **`core/terrain`** | [`35-core-strata.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/35-core-strata.js) + `host/35-core-strata-shade.js` (`KSTRATA`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` + [`38d-core-slab.js`](file:///home/antigravity/traviso761-debug/krator-master/core/terrain/38d-core-slab.js) (`KRELIEF`), `40-core-basin.js` (`KBASIN`), `41-core-scour.js` (`KSCOUR`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | Custom local `KSTRATA` column **`laccolith-shell`** (`0.8–3.2 m` curved surface-parallel rose-grey porphyry & leucogranite exfoliation sheets; upturned `carbonate-shelf` & sandstone hogbacks on the outer moat); **`KBASIN` (`40-core-basin.js`)** carving flat-floored, undercut-lip **`gnamma` solution pans** with guaranteed horizontal water sills; `KSCOUR` for dark radial rainwater drainage flutes ("water-streaks") down bare slabs; `KSTACKS` for concentric ring-dike hogback fins; `KGROUND` (`<= 5` layers); `KFAR` (`14 km`) + `KHORIZON` |
| **`core/atmos`** & **`core/sky`** | `core/atmos/89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j` (`core/sky` shared dome), `host/c,e,h,i,j`, `fx/raincover.js` | Shared Krator sky dome at `(px - 272, py - 330)` (`pressure: 1.29 -> 1.11 atm`), stationary **lenticular summit `ATMOS.fogBelt` ("The Crown-Veil")** above `+2,700 m` (`Station 3 crown`), `#include <atmos_waves>`, and barometric warm-air shimmer wisps exhaling from radial clefts (`Station 4`) |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js` | **`WATER.still`** for hundreds of sky-reflecting perched **`gnamma` solution pans** (`Stations 1, 3`) and tannin-amber **ring-moat seepage fens** (`Station 2`); **`WATER.flow`** for thin post-rain sheetwash rills spilling from pan to pan down drainage flutes into the annular moat (`WATER.mirrorSwitch` off at load) |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Order-free spatial index (`KSPACE`) keeping `gnamma` water mirrors, A-tent buckles, contour-line garland strips, and `site:dome-observatory` clear of overlapping geometry |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Deterministic `KRAND.cell(seed, ix, iz)` and `KRAND.hash` for exfoliation step radii, `gnamma` pan diameters/hydroperiods, A-tent buckle placement, and plant/crystal seeds — zero `Math.random` or `Math.sin` |
| **`core/mask`** | `core/mask/15-core-mask.js` (`KMASK.canvas`) | CPU distance and curvature masks (`KMASK.canvas`) for concentric exfoliation step-risers, sheetwash flute channels, and ring-moat fen boundaries — **zero `getImageData`** |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every `gnamma` pan, hollow lithophone slab, botanical record, `KSPELEO.SMOKY` crystal pocket, `stone`/`limestone`/`zinc` resource tag, `KHAZ` zone, and `site:dome-observatory` / `site:moat-waystation` reserves |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers curved bald-rock aprons, exfoliation step-ledges, ring-dike hogbacks, and walkable radial cleft floors via `KDRAWN.add(KDRAWN.grid(...))` (survey item 28) |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazards: `dome:slickslab` (wet cyanobacteria-coated `> 26°` bare granite sheetwash chutes), `dome:spall` (insolation-stressed popping granite exfoliation scales on hot afternoons), `dome:quagmire` (deep floating sphagnum-peat pockets in `Station 2` ring-moat fen), and `dome:cleftdrop` (narrow `45 m` radial tension *Kluft* slots on `Station 4`) |
| **`core/materials`** & **`core/shadow`** | `23-mat-record.js`, `25-matlib-host.js` + `matlib_pack.py`; `10-core-shadow.js`, `12-core-shadow-host.js` (`KSHADOW`) | Packed genuine library textures (`tex/pack.json`, `10–12` active shader samplers `< 15`; `0` untextured lit meshes); `KSHADOW` **strictly off at page load** (`?shadow=1` or UI toggle) |
| **`core/host`**, **`core/walk`** & **`core/export`** | `khost.FULL` + `94-host-polytool.js`; `07-core-export.js`, `09-core-export-adapters.js` | Camera, walk controller (driving hollow-slab `65–140 Hz` lithophone footstep pitch from `DOME_PHYS.acousticsAt`!), `[Sun-Baked Dry] / [Vernal-Brim] / [Crown-Mist]` hydroperiod & weather states, compliant preset views, `krator-world` & Godot `4.7.2` export |
| **`kits/crops`**, **`kits/fauna`** & **`kits/resources`** | `kits/crops/src/10,20,22,40` (`CROPS`); `kits/fauna` (`[G data]`); `kits/resources` (`geology.json`) | Read in place: `CROPS.BIOMES.thedome` (`67` verified crops across `ringmoat`, `gnammapan`, `garland`, `crown`), 6 endemic/montane fauna records, and surveyed `stone = 214`, `clay = 48`, S-collar `limestone = 255, zinc = 90` |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/city`**, **`core/hamlet`**, **`core/camp`**, **`core/ruins`** | **No** | `The Dome` is an uninhabited sacred acoustic/barometric sanctuary on the NE edge of `Upper Ria` (`0` settlement pins in `60-settlements.js`); `site:dome-observatory` (`Station 3`) and `site:moat-waystation` (`Station 2`) are held clear as `KTAGS` reserves, while `?works=0` places lightweight Upper Ria cut-porphyry acoustic listening dishes, bronze barometric wind-harps, and stone rain-gauges (`class: 'furniture'`) |
| **`core/coast`**, **`core/water/farbed`**, **`core/water/geyser`**, **`core/terrain/lava`** | **No** | `100%` inland (`0 km²` sea or raster lake) and strictly **non-eruptive cryptovolcanic/plutonic** (`0` vents, `0` lava flows, `0` boiling geysers) |
| **`core/simulation`**, **`core/sched`**, **`core/engine`**, **`core/furnish`** | **No** | Pure biome showcase kit; vernal-pan & montane fauna schedules are plain `[G data]` scaffolding |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/thedome"` joins all five lists in `tools/checks_optin.json` from commit 1 (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`), running `buildlib.through_tools_build`, `build_sources.report()`, `KDRAWN.add`, `10–12` active samplers (`< 15` gate), `tools/ktest.js`, and strictly punctuation-free preset view names.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/thedome/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmweubdnyts8y`** (*the dome*): **`28,960 km²` dry land** (`7,240` `2 km` cells, `0 km²` lake/sea), `X = 1298..1403, Y = 100..194`, centroid `(1351.0, 145.7)`, apex `(1328, 150)` at `+2,924.8 m`; **`22,520 km²` (`5,630` cells) strictly exclusive of all sibling sub-biomes (`own_dm`)** inside the `Ria Valley` macro-basin |
| **Pages (`4` Stations)** | `dist/thedome.html` (**Station 1 `apron`** at `1336, 128`: Onion-Skin Bald-Rock Apron, `Gnamma` Sky-Mirrors & Hollow A-Tent Lithophones), `--station moat` (`1317, 117`: Concentric Ring-Dike Hogback & Seepage Fen), `--station crown` (`1328, 150`: `+2,924.8 m` Lenticular Cloud-Cap & Contour Treeline Garlands), and `--station cleft` (`1372, 148`: Radial Tension *Kluft* & `KSPELEO.SMOKY` Smoky-Quartz Vault) |
| **Objects** | **`DOME_PHYS`** (`[G data]` in `src/40-biome-dome-phys.js`: onion-skin exfoliation shell steps, perched `gnamma` solution-pan hydroperiods, A-tent flexural lithophone frequencies, whispering-gallery focus, and radial-cleft barometric breathing; tested by `tests/test-dome-phys.js`) and **`THEDOME`** (`BIO.kit('thedome')`) |
| **Read in place (`BIO.kin`)** | **`biomes/springhollows`** & **`biomes/swlowlands`** (montane red-cedar/juniper, stunted oak, moat alder, and fen sedges — `80–85%` recognizable matrix without fragment duplication) |
| **Cultural Tie-In** | Sacred uninhabited acoustic & barometric sanctuary on the NE rim of **`Upper Ria`** (`Līwa-Tōga`, `1186, 118`), visited by Ria geomancers and Hum sky-pilgrims (`site:dome-observatory`, `site:moat-waystation`; perimeter cut-porphyry lithophones & smoky-quartz prisms) |

---

## 1. Scale-Model Footprint & Physical Envelope (`rmweubdnyts8y`, Scale Model `5.1`)

### 1.1 Exact Surveyed Raster, Overlap & `geology.json` Metrics

| Metric (`Scale Model 5.1`, `2 km/px`) | Surveyed Value in `rmweubdnyts8y` (*the dome*) | Physical, Hydrological & Ecological Meaning |
|---|---|---|
| **Cells, Area & Land Share** | **`7,240` `2 km` cells = `28,960 km²`** (`1,809` `4 km` geology cells); **`100.0%` dry land** (`0` water cells / `0 km²` lake) | Coherent `210 × 188 km` sub-circular resurgent dome blister (`r ≈ 95 km`), completely unbreached by raster rivers or lakes |
| **Bounds, Centroid & True Apex** | `X = 1298..1403`, `Y = 100..194`, centroid **`(1351.0, 145.7)`**; summit apex **`(1328, 150)` (`+2,924.8 m`)** | Slightly asymmetric WSW-crested laccolith whose steep NW/SW aprons face `Upper Ria` and `Springhollows` while long gentle E/SE sheets slope toward `Tharn Hills` |
| **Umbrella & Sibling Overlaps** | `100%` inside `rmvriavalley` (`ria valley` macro-basin, `28,960 km²`); **`5,630` cells = `22,520 km²` (`77.8%`) strictly exclusive of all sibling sub-biomes (`own_dm`)**; outer collar overlaps `Spider Lake` (`4,536 km²` S), `Springhollows` (`1,428 km²` WSW), `Upper Ria` (`384 km²` NW), `Tharn Hills` (`104 km²` E); **`0 km²` overlap with `rmvarachnoids`** | All 4 chosen `biomes/thedome` stations sit strictly inside `own_dm` (`22,520 km²` sibling-exclusive core, `8–58 km` inside `rmweubdnyts8y`!), while honouring the upturned S carbonate collar in regional streaming |
| **Elevation (`min / p5 / p10 / p50 / mean / p90 / p95 / max`)** | **`+1,442.0 / +1,604.6 / +1,690.4 / +2,301.9 / +2,248.4 / +2,726.6 / +2,799.7 / +2,924.8 m`** | **`+1,482.8 m` convex prominence**: radial rings drop smoothly from `+2,859 m` (`r = 0–15 km`) -> `+2,702 m` (`15–35 km`) -> `+2,382 m` (`35–60 km`) -> `+2,010 m` (`60–85 km`) -> `+1,442..+2,094 m` (`85–120 km` ring-moat) |
| **Atmosphere & Gravity** | **`1.34–1.11 atm`** (`p5–p95` = **`1.31–1.13 atm`**, median **`1.20 atm`**, `pO2 = 0.25 atm`), `g = 7.4 m/s²` (`0.75 g`) | Standard-pressure upland air (`CROPS` `atm: 1`) whose smooth adiabatic lift over `1,483 m` of convex symmetry forms a permanent `+2,720 m` lenticular cloud-cap; `0.75 g` allows `18–32 m` cantilevered granite A-tent arches without roof collapse! |
| **Köppen, Rainfall & Temp** | **`Cfa` `97.0%` (`28,080 km²`, med `+2,292 m`, `1,145 mm`)**, **`Cfb` `3.0%` (`880 km²` summit cap `> +2,780 m`, med `+2,868 m`, `1,239 mm`)**; rain `min / p5 / p50 / mean / p95 / max` = **`894 / 988 / 1,161 / 1,166 / 1,412 / 1,569 mm/yr`**; `T` med **`+16.0 °C`** (`mean +15.9 °C`, `+25/+6 °C`; summit `+11 °C` [`+21/+2 °C`]) | Ample `1,161 mm/yr` rainfall falling onto zero-soil bald stone creates **flash sheetwash** during storms followed by **edaphic drought** hours later — the classic terrestrial *bornhardt / inselberg* paradox! |
| **`geology.json` & Drainage** | `79.8% sedimentary` (`1,443` `4 km` cells: arched arkose/sandstone roof & unroofed **porphyry-leucogranite laccolith**, `stone = 214`, `iron = 40`, `copper = 10`, `clay = 48`) + **`20.2% carbonate`** (`366` S/SW collar cells: **`limestone = 255`**, **`zinc = 90`**); `0` vents, `0` internal raster rivers (trunk **`9101` `Rīwa-Wāta` (*High-Ria:* `Līwa-Wāda`)**, `Q = 334 m³/s`, collects NW moat seepage at `1303, 100`) | Impermeable crystalline/porphyry dome sheds water radially into annular **ring-moat seepage fens** trapped behind upturned sandstone/carbonate hogbacks and porphyritic ring-dikes |

### 1.2 Surveyed Concentric Radial Profile from Apex `(1328, 150)`

| Radial Annulus from `(1328, 150)` | Area in `rmweubdnyts8y` | Elev `min / p10 / p50 / p90 / max` | Dominant Geomorphic & Ecological Belt |
|---|---|---|---|
| **`r = 0..15 km`** | `708 km²` | `+2,709 / +2,771 /` **`+2,859`** `/ +2,916 / +2,925 m` | `Cfb` stationary lenticular `Crown-Veil` summit, `crownrosette` cushions & bullseye exfoliation steps (`Station 3`) |
| **`r = 15..35 km`** | `3,184 km²` | `+2,287 / +2,491 /` **`+2,702`** `/ +2,836 / +2,915 m` | Upper contour-riser `cloudgarlandpine` ribbons & deep radial unloading *Kluft* clefts (`Station 4`) |
| **`r = 35..60 km`** | `7,092 km²` | `+1,665 / +1,971 /` **`+2,382`** `/ +2,733 / +2,880 m` | Sweeping curved bald-rock onion-skin aprons, `gnamma` sky-mirror gardens & hollow A-tent lithophones (`Station 1`) |
| **`r = 60..85 km`** | `6,688 km²` | `+1,514 / +1,624 /` **`+2,010`** `/ +2,541 / +2,764 m` | Lower sheetwash drainage flutes (`KSCOUR`) & inner porphyritic ring-dike hogbacks |
| **`r = 85..120 km`** | `7,540 km²` | `+1,442 / +1,586 /` **`+2,094`** `/ +2,404 / +2,600 m` | Annular ring-moat pitcher-sedge seepage fens & upturned sandstone/`carbonate` collar (`Station 2`) |

---

## 2. Tectonic / Geomorphic Character & Laccolith Dome Physics (`DOME_PHYS`, `[G data]`)

### 2.1 Resurgent Porphyry-Granite Laccolith, Onion-Skin Exfoliation & Ring-Dikes

`The Dome` represents the plutonic end-member of northern Krator's anorogenic magmatism (sibling to `Springhollows`'s 5 linear red-porphyry ridges and `Arachnoid Canyons`'s collapsed basalt ring-complexes, but here preserved as a **single intact, uncollapsed felsic blister**):
1. **Concentric Onion-Skin Sheet-Jointing (`laccolith-shell`):** Erosional unroofing relaxed vertical lithostatic stress while preserving high horizontal compressive stress parallel to the dome's convex surface. At `0.75 g`, tensile fracture split the pale rose-and-silver quartz-monzonite porphyry into nested `0.8–3.5 m`-thick **curved exfoliation shells** whose stepped `0.5–2.8 m` risers wrap around `(1328, 150)` like monumental amphitheatre tiers (`Station 1`, `Station 3`).
2. **Hollow A-Tent Buckles (`exfoliationarch`) & Radial *Kluft* Clefts:** Solar thermal expansion pops `15–32 m`-wide surface shells upward into triangular **A-tent vaults** (`0.6–2.4 m` hollow air gap underneath!), while radial hoop tension opens straight, vertical `8–18 m`-wide, `30–55 m`-deep **unloading clefts (*Klüfte*)** lined with hydrothermal **`KSPELEO.SMOKY`** smoky-quartz and feldspar crystals (`Station 4`).
3. **Annular Ring-Dike & Upturned Collar Moats (`Station 2`):** Around `r = 65–95 km`, porphyritic ring-dikes and `25°–45°` outward-dipping roof-sandstone/`carbonate` hogbacks dam radial sheetwash into concentric peat-and-marl **seepage fens**.

### 2.2 Pure `[G data]` Physics Engine (`src/40-biome-dome-phys.js`)

Zero `THREE`, zero `DOM`, deterministic on `KRAND` and `KMASK.canvas` (`0` `getImageData`), tested by `tests/test-dome-phys.js`:
1. **`DOME_PHYS.shellAt(x, z, site) -> {domeRadiusKm, slopeDeg, shellStep01, riserHeightM, hollowGapM, slickFlute01}`**
   - Computes local surface-parallel exfoliation shell geometry: `shellStep01` marks concentric onion-skin fracture risers (where thin grus soil accumulates to root `cloudgarlandpine` and `panbonsai`), `hollowGapM > 0` identifies detached **A-tent buckles** (`0.4–2.4 m` sub-slab void), and `slickFlute01` traces radial rainwater `KSCOUR` drainage streaks (`KHAZ` `dome:slickslab` where `slopeDeg >= 26°` and wet).
2. **`DOME_PHYS.gnammaAt(x, z, hydroperiod01, site) -> {inPan, panRadiusM, depthM, waterDepthM, rimGrit01, desiccationRing01}`**
   - Parameterizes flat-floored, overhang-lipped **`KBASIN` solution pans (`gnammas`)** on `slopeDeg < 16°` bare granite benches (`Stations 1, 3`): `hydroperiod01` (`0.0` in `[Sun-Baked Dry]`, `1.0` in `[Vernal-Brim]`, `0.65` default) smoothly raises/lowers `WATER.still` pan mirrors while exposing concentric mineral/resurrection-moss rings (`desiccationRing01`)!
3. **`DOME_PHYS.acousticsAt(x, z, site) -> {lithophoneHz, hollowBoom01, whisperFocusDb, aeolianChordHz, baroFlowMs}`**
   - **Lithophone Resonance:** Models flexural plate vibration $f_0 \propto \frac{h}{R_{\text{plate}}^2}\sqrt{\frac{E}{\rho(1-\nu^2)}}$ over detached `hollowGapM > 0.15 m` exfoliation shells, returning exact **`lithophoneHz` (`62–148 Hz`)** so `core/walk` footsteps ring like tuned bass stone gongs!
   - **Whispering-Gallery & Barometric Breathing:** Concave ring-dike scarps (`Station 2`) yield `whisperFocusDb` (`+12 to +22 dB` tangential acoustic focus), while diurnal pressure/temperature swings ($\Delta T_{\text{slab}} - \Delta T_{\text{cleft}}$) drive `baroFlowMs` (`0.8–4.2 m/s` cool morning inhalation / warm afternoon exhalation + Aeolian `aeolianChordHz` organ-pipe harmonics) out of deep radial clefts (`Station 4`).

---

## 3. Stations (`4` Verified Scale-Model `5.1` Sites Strictly Inside `own_dm` / `rmweubdnyts8y`)

Every station `(X, Y)` is directly verified on `5.1` rasters to lie **strictly inside `rmweubdnyts8y`** *and* inside its `22,520 km²` sibling-exclusive core (`own_dm[Y, X] === true`, `8–58 km` inside the polygon; `sky frame = (px - 272, py - 330)`). All preset view names strictly obey survey item 30 (zero `'` and zero `:`).

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | `rmweubdnyts8y` Buffer & Elev (`10 km` win) | `P_atm`, Climate, Rain & `T` (`w/c`) | `KSTRATA` & `geology.json` | Core Geomorphic, Ecological & Acoustic Signature |
|---|---|---|---|---|---|---|
| **1** | **`apron`** *(main)* `dist/thedome.html` | **`(1336, 128)`** `(+1064, -202)` | `own_dm = True` (`21.9 px` / `44 km` in); **`+2,268.5 m`** (`+1,939..+2,580 m`, `641 m` rel) | **`1.20 atm`**, `Cfa`, **`1,255 mm`**, **`+16 °C`** (`+25/+6`) | `laccolith-shell` rose-grey porphyry-granite; `stone = 182`, `iron = 40` | **Onion-Skin Bald-Rock Apron, `Gnamma` Sky-Mirrors & Hollow A-Tent Lithophones:** Sweeping curved exfoliation slabs stepped with `120+` specular `KBASIN` `gnamma` pans, `gnammamoss` & `panbonsai` islands, booming A-tent arches & `?works=0` acoustic cairns |
| **2** | **`moat`** `--station moat` `dist/thedome-moat.html` | **`(1317, 117)`** `(+1045, -213)` | `own_dm = True` (`4.1 px` / `8 km` in); **`+1,749.1 m`** (`+1,570..+2,300 m`, `730 m` rel) | **`1.29 atm`**, `Cfa`, **`1,098 mm`**, **`+19 °C`** (`+28/+10`) | Concentric red-porphyry ring-dike & upturned sandstone collar; `stone = 202` | **Concentric Ring-Dike Hogback, Seepage Fen & Whispering Scarp:** Radial sheetwash cascades (`WATER.flow`) pooling behind an arcuate `180 m` ring-dike wall into a golden `moatpitcher` & sphagnum fen (`site:moat-waystation`) with parabolic cliff echoes |
| **3** | **`crown`** `--station crown` `dist/thedome-crown.html` | **`(1328, 150)`** `(+1056, -180)` (*True Summit*) | `own_dm = True` (`27.2 px` / `54 km` in); **`+2,924.8 m`** (`+2,717..+2,925 m`) | **`1.11 atm`**, **`Cfb`**, **`1,255 mm`**, **`+11 °C`** (`+21/+2`) | Concentric summit `laccolith-shell` amphitheatre rings; `stone = 60`, `clay = 33` | **Lenticular Cloud-Cap Crown, Contour Treeline Garlands & Oracle Plinth:** Stationary `ATMOS` cap-cloud (`Crown-Veil`), concentric `cloudgarlandpine` rings tracing onion-skin steps like living contour lines, `crownrosette` fog-cushions & `site:dome-observatory` |
| **4** | **`cleft`** `--station cleft` `dist/thedome-cleft.html` | **`(1372, 148)`** `(+1100, -182)` | `own_dm = True` (`29.0 px` / `58 km` in); **`+2,537.7 m`** (`+2,345..+2,615 m`) | **`1.17 atm`**, `Cfa`, **`1,004 mm`**, **`+14 °C`** (`+24/+5`) | `3` stacked `laccolith-shell` plates split by radial *Kluft* + **`KSPELEO.SMOKY`** | **Radial Unloading *Kluft* Cleft, Smoky-Quartz Vault & Barometric Wind-Organ:** `14 m`-wide, `45 m`-deep radial fissure slicing the onion-skin carapace; walkable `KCAVERN` overhang lined with `KSPELEO.SMOKY` smoky-quartz druse, shade ferns & exhaling barometric mist |

### 3.1 Station 1 (`apron`, main page `dist/thedome.html`): Onion-Skin Apron & `Gnamma` Gardens — `(1336, 128)`
- **Site & Framing (`5.4 × 5.4 km`):** Set halfway up the northern flank (`+2,268.5 m`, `1.20 atm`, `Cfa` `1,255 mm/yr`), where `80%` of the ground is continuous, convex pale rose-grey porphyry-granite peeled into `1.2–2.6 m` curved exfoliation steps (`KRELIEF` + `KSTRATA` `laccolith-shell`).
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* Custom `laccolith-shell` (surface-parallel `1.5 m` rose-grey quartz-porphyry sheets with white aplite veins and dark manganese sheetwash streaks).
  - *Ground (`5` layers):* `rock.granite.shell` (smooth feldspar-flecked dome stone), `organic.scour.cyanomat` (`KSCOUR` dark velvet drainage flutes), `ground.grus.feldspar` (coarse pink-white crystal grit along step-risers & pan rims), `organic.moss.gnamma` (emerald-copper resurrection mat), `organic.lichen.bullseye` (concentric `ringlichen` crusts).
- **Signature Visuals & Interactive Modes:**
  - Over `120` circular flat-floored **`gnamma` solution pans (`KBASIN`)** pit the broad stone benches, reflecting the sky like scattered silver lenses (`WATER.still`). Toggling **`[Vernal-Brim] / [Sun-Baked Dry]`** shifts `hydroperiod01`, turning dried crimson-bronze resurrection mats into brimming emerald water-gardens!
  - Contorted **`panbonsai`** pines (`1.5–3.5 m` tall despite centuries of growth) root in `25 cm` grus pockets along exfoliation step-risers and perched pan islands, while three `22 m`-wide **hollow A-tent buckles (`exfoliationarch`)** form natural stone-slab shelters that boom at `78–112 Hz` (`lithophoneHz`) when walked across! `?works=0` places Upper Ria bronze-and-porphyry acoustic listening cairns.
- **Preset views:** `overview`, `gnamma-sky-mirrors`, `onion-skin-steps`, `a-tent-lithophone-arch`, `pan-bonsai-island`, `sheetwash-flutes`.

### 3.2 Station 2 (`moat`, `dist/thedome-moat.html`): Concentric Ring-Dike & Annular Seepage Fen — `(1317, 117)`
- **Site & Framing (`5.4 × 5.4 km`):** At the NW annular perimeter (`+1,749.1 m`, `1.29 atm`, `Cfa` `1,098 mm/yr`, draining NW toward `9101` `Rīwa-Wāta` (*High-Ria:* `Līwa-Wāda`)), where the smooth inner dome foot meets an arcuate `180 m`-high purple-red **porphyry ring-dike hogback (`KSTACKS`)** and upturned roof-sandstone beds. *(In regional streaming, the southern moat counterpart at `(1316, 174)` transitions seamlessly into `limestone = 153, zinc = 90` calcareous fens.)*
- **`KSTRATA` & `KGROUND` Stack (`5` layers):** `laccolith-shell` inner apron + vertical purple-red porphyry ring-dike + upturned sandstone collar; `organic.peat.sphagnum` (golden-russet fen mat), `rock.granite.shell`, `ground.grus.feldspar`, `organic.scour.cyanomat`, `ground.dry_grass`.
- **Signature Visuals:** Silvery `WATER.flow` sheetwash ribbons slide down the inner dome apron and spread into a luminous amber-water **annular seepage fen (`WATER.still`)** carpeted with crimson-throated **`moatpitcher`** sedges, golden sphagnum hummocks, and `BIO.kin` swamp-cedar/alder groves. The concave inner face of the ring-dike acts as a natural **whispering gallery** above `site:moat-waystation` (`r = 150 m` pilgrimage trailhead reserve).
- **Preset views:** `overview`, `ring-dike-hogback`, `seepage-pitcher-fen`, `sheetwash-apron-toe`, `whispering-wall-alcove`, `moat-waystation-site`.

### 3.3 Station 3 (`crown`, `dist/thedome-crown.html`): Cloud-Combing Summit Crown & Contour Garlands — `(1328, 150)`
- **Site & Framing (`5.2 × 5.2 km`):** Centered directly on the **surveyed `+2,924.8 m` apex of `The Dome`** (`1.11 atm`, **`Cfb` `1,255 mm/yr`, `+11 °C` [`+21/+2 °C`]**, commanding a `360°` `14 km` `KFAR` + `KHORIZON` panorama over `Upper Ria` and `Spider Lake`).
- **`KSTRATA` & `KGROUND` Stack (`4` layers):** Concentric bullseye `laccolith-shell` summit rings; `rock.granite.shell`, `ground.grus.feldspar`, `organic.lichen.bullseye`, `organic.moss.gnamma`.
- **Signature Visuals:** Bathed in the luminous, drifting base of the stationary **lenticular cap-cloud (`ATMOS.fogBelt` `[Crown-Mist]`)**, concentric exfoliation risers encircle the summit like a colossal stone target. Because soil and fog-drip collect strictly in the narrow riser notches between bare stone shells, stunted **`cloudgarlandpine`** and **`veilbeard`** lichen-draped shrubs form **unbroken concentric green rings ("treeline garlands")** separated by `30–60 m` bands of bare silver-rose granite and summit **`crownrosette`** cushions! Holds clear `site:dome-observatory` (`r = 120 m` Upper Ria barometric-acoustic sanctuary reserve) with `?works=0` bronze Aeolian wind-harps.
- **Preset views:** `overview`, `concentric-treeline-garlands`, `lenticular-crown-veil`, `crown-rosette-gnammas`, `dome-observatory-plinth`.

### 3.4 Station 4 (`cleft`, `dist/thedome-cleft.html`): Radial Tension *Kluft* & `KSPELEO.SMOKY` Quartz Vault — `(1372, 148)`
- **Site & Framing (`5.2 × 5.2 km`):** On the high eastern dome shoulder (`+2,537.7 m`, `1.17 atm`, `Cfa` `1,004 mm/yr`, `+14 °C`), where hoop-stress unloading split three stacked `3 m`-thick onion-skin granite shells into a straight, vertical `14 m`-wide, `45 m`-deep **radial tension cleft (*Kluft*)**.
- **`KSTRATA` & `KGROUND` Stack (`4` layers):** Stacked `laccolith-shell` plates + `KCAVERN` overhang + **`KSPELEO.SMOKY`** smoky-quartz crystal lining; `rock.granite.shell`, `ground.grus.feldspar`, `organic.moss.gnamma`, `ground.lichen.crust`.
- **Signature Visuals:** Walking down a natural wedged-chockstone ramp into the cool, sun-slit radial chasm reveals `0.4–1.2 m` **`KSPELEO.SMOKY` smoky-quartz and green-chlorite-dusted feldspar crystal clusters** lining the granite walls, lush translucent **`cleftfilmyfern`** curtains thriving in steady `+14 °C` `baroFlowMs` barometric exhalations, and haunting Aeolian chord resonances as wind crosses the sharp granite lip `40 m` overhead.
- **Preset views:** `overview`, `radial-kluft-throat`, `smoky-quartz-pocket`, `barometric-fern-gallery`, `wedged-chockstone-bridge`.

---

## 4. Flora & Structural Guilds (`src/50-biome-dome-species.js`, `check_botany.py` Verified)

| Key | Name & Clade | Laccolith Guild & Zone | Height / Form & `3D` Builder | Biome Mechanics & `HV(wood, edible, medicinal, note)` |
|---|---|---|---|---|
| **`gnammamoss`** | **Resurrection Mirror-Mat** (*Selaginella / Craterostigma rediviva*) | `gnamma` solution-pan rims & shallow beds (`Stations 1, 3`, `inPan` / `desiccationRing01`) | `0.02–0.14 m` concentric velvet turf shifting in shader tint from curled copper-crimson (`hydroperiod01 < 0.2`) to lush emerald (`>= 0.5`)! | Survives `95%` cellular water loss during sunny dry spells on `+40 °C` bare granite, unfurling within `20 minutes` of a `Cfa` rain squall to stabilize pan-rim feldspar grus. `HV('none', [], true, 'Dried resurrection fronds steeped by Upper Ria travellers as a restorative rehydration and fever tea.')` |
| **`panbonsai`** | **Gnamma-Island Twisted Pine** (*Pinus / Cupressus insularis*, bornhardt specialist) | Perched `gnamma` islands & exfoliation cracks (`Station 1`, `+1,900..+2,650 m`) | `1.2–3.8 m` ancient wind-sculpted miniature conifer (`BIO.flareJoin` flattened root-plate clasping granite lips) | `300`-year-old trees dwarfed to shrub stature by `20 cm` feldspar-grus root volume, drinking seasonal `gnamma` seepage. `HV('resin', ['dwarf pine nut'], true, 'Fragrant slow-grown heartwood prized only from windfall branches for Upper Ria temple incense.')` |
| **`cloudgarlandpine`** | **Contour-Riser Cloud Pine** (*Pinus coronaria*, `85%` montane matrix) | Exfoliation step-risers (`Stations 1, 3`, `shellStep01 > 0.7`, `+2,200..+2,880 m`) | `4.5–11.5 m` dense, long-needled montane conifer (`34` impostor) growing strictly in `4–9 m`-wide arcuate ribbons along onion-skin steps | Long `18 cm` fascicle needles comb `350+ mm/yr` of extra horizontal fog-drip out of `The Crown-Veil`, dripping it directly into the step-riser root trench! `HV('timber, resin', ['garland pinyon'], false, 'Close-grained resonant soundboard wood used by Ria luthiers and wind-harp makers.')` |
| **`crownrosette`** | **Silver Crown-Chalice** (*Argyroxiphium / Espeletia tholiformis*) | Summit `Cfb` cloud-cap (`Station 3`, `+2,720..+2,925 m`) | `0.65–1.85 m` parabolic rosette of mirror-silvery pubescent leaves (`2.2 m` golden flower spike) | Parabolic leaf geometry focuses diffuse cloud-light onto the central apical bud while shedding cold `+2 °C` winter radiative frost; leaf hairs channel fog droplets to basal cisterns. `HV('fibre', [], true, 'Silvery leaf-wool spun into warm, mist-repellent cloaks by dome watchers; soothing throat balm.')` |
| **`moatpitcher`** | **Ring-Moat Amber Pitcher** (*Sarracenia / Darlingtonia annularis*) | Annular seepage fens (`Station 2`, `waterDepthM = 0.02..0.25 m`) | `0.35–0.95 m` translucent honey-gold & ruby hooded tubular leaves rising from sphagnum | Because rain washing off pure quartz-feldspar granite carries almost zero dissolved nitrogen or phosphorus, moat-fen flora supplement nutrients by trapping sheetwash-swept insects! `HV('none', [], true, 'Digestive pitcher nectar fermented into a sharp tonic; ruby hoods yield amber-rose linen dye.')` |
| **`cleftfilmyfern`** | **Barometric Breath-Fern** (*Hymenophyllum / Asplenium pneumaticum*) | Deep radial *Kluft* clefts & A-tent shade (`Stations 1, 4`) | `0.25–0.85 m` one-cell-thick translucent jade frond curtains (`ATMOS` gentle barometric flutter) | Survives exclusively where steady `baroFlowMs` air exhaling from deep sub-slab sheet joints maintains `98%` relative humidity even at midday. `HV('none', [], true, 'Delicate cooling poultice leaf gathered sparingly by crystal prospectors.')` |
| **`ringlichen`** | **Bullseye Exfoliation Lichen** (*Parmelia / Umbilicaria concentrica*) | Bare `laccolith-shell` granite aprons (`Stations 1–4`) | `0.01–0.05 m` radial rings of saffron-gold, celadon, and slate-violet crustose thalli (`BIO.fung` / `KGROUND`) | Radial growth rate (`1.2 mm/yr`) lets geomancers date individual granite spall-scars to the decade! `HV('none', [], false, 'Boiled with alum for fast saffron-gold and violet-ochre liturgical dyes.')` |

### 4.1 Explicit Cross-Biome Non-Duplication Guardrails
1. **Against `biomes/firebliss` (Station 8 `glass` pancake domes) & `biomes/korona`:** `The Dome` (`28,960 km²`) is **not** a small glassy rhyolite-obsidian lava extrusion or a vertical-walled `tepui` sandstone mesa: it is a **continental-scale (`190 km`) unroofed crystalline/porphyry plutonic laccolith** defined by concentric onion-skin exfoliation shells, `gnamma` solution-pan gardens, and ring-moat pitcher fens!
2. **Against `biomes/springhollows` (`rmvyiyw8ucd1y`):** `Springhollows` is a flat-bedded `100% carbonate` sinkhole-and-mammoth-spring karst plateau (`KSPELEO.CALCITE`). `The Dome` is a **convex bald-rock bornhardt carapace** whose caves are **mechanical granite A-tent buckles & radial `KSPELEO.SMOKY` smoky-quartz tension clefts** (`0` limestone sinkholes on `Stations 1–4`).
3. **Against `biomes/shroudhills` (`Cloak-Tors`):** Zero tropical/coastal *Shroud-Ant* drum-galls or tree-to-tree root-hammocks; `The Dome` is a cool-to-warm inland `1.20 atm` granite-slab amphitheatre of sky-reflecting vernal pans and concentric treeline garlands.

---

## 5. Fauna (`kits/fauna` `[G data]`) & Data-Driven Hazards (`core/hazard`, `KHAZ`)

### 5.1 Endemic Bornhardt, Vernal-Pan & Cloud-Crown Fauna (`6` Species)

| Key (`kits/fauna`) | Name & Clade | Scale | Niche & Laccolith Adaptation | Yields & 24h Schedule |
|---|---|---|---|---|
| **`gnammatriops`** | **Mirror-Pan Shield-Shrimp** (desiccation-cyst branchiopod crustacean) | `0.06–0.11 m` | Hatches within `36 hours` when rain fills `gnamma` pans (`Stations 1, 3`), swimming in iridescent bronze schools that flash in sky-mirrors before laying drought-proof cysts in rim grit! | `dried-roe-paste` (savory trail condiment). `06–18` `FILTER_PAN`, `18–06` `GRAZE_GNAMMAMOSS` *(active when `hydroperiod01 >= 0.35`)* |
| **`atentgecko`** | **Pancake Crevice-Skink** (ultra-flattened granite lizard/hexapod) | `0.38 m` (`1.8 cm` flat!) | Rib-hinged dorsoventrally flattened body slips into `2 cm` horizontal exfoliation cracks under **hollow A-tent buckles** (`Stations 1, 4`); communicates by tapping belly-plates at `90 Hz` into resonant lithophone slabs! | `scale-hide`, `small-meat`. `07–11` `BASK_APRON`, `11–16` `SHADE_ATENT`, `16–20` `HUNT_PAN_RIM`, `20–07` `WEDGED_SLEEP` |
| **`garlandtragopan`** | **Crown-Veil Bell-Pheasant** (iridescent montane galliform) | `0.62 m` | Walks the concentric `cloudgarlandpine` contour rings (`Station 3`), booming a low `120 Hz` throat-sac note that rings around the amphitheatre risers through the cap-cloud | `fowl`, `iridescent-plumes`. `05–10` `FORAGE_GARLAND`, `10–16` `ROOST_CLOUDPINE`, `16–20` `DISPLAY_RISER`, `20–05` `SLEEP_BOUGH` |
| **`slabklipspringer`** | **Porphyry Tip-Hoof Antelope** (rubber-hooved rock ungulate) | `0.78 m` shoulder | Stands on coin-sized cylindrical rubbery hoof-tips gripping `32°` bare `laccolith-shell` granite slabs (`Stations 1–4`), drinking from perched `gnammas` | `venison`, `sinew`, `hide`, `horn`. `05–10` `GRAZE_STEP`, `10–16` `STAND_SENTINEL`, `16–21` `DRINK_GNAMMA`, `21–05` `BED_ARCH` |
| **`moatnewt`** | **Fen-Amber Giant Salamander** (annular seepage-fen amphibian) | `0.75 m` | Lurks in cool, tannin-gold ring-moat spring channels (`Station 2`) beneath `moatpitcher` hummocks | `mucilage-salve`, `meat`. `00–08` `PROWL_MOAT`, `08–18` `HIDE_SPHAGNUM`, `18–24` `AMBUSH_RILL` |
| **`cleftswift`** | **Kluft Wind-Harrier** (acoustic-gliding raptor) | `0.54 m` (`1.5 m` span) | Rides laminar radial updrafts from `Station 2` moat up to `Station 3` crown and nests on `Station 4` radial *Kluft* chockstones | `feathers`. `07–19` `SOAR_UPDRAFT`, `19–07` `NEST_KLUFT` |

### 5.2 Data-Driven Hazards (`KHAZ`) & 4-Layer Acoustic Profile ("The Singing Shell")

| Hazard ID | `KHAZ` Kind | Stations & Trigger (`DOME_PHYS`) | Visual / Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`dome:slickslab`** | `slip` | `Stations 1, 2` (`slickFlute01 >= 0.6` and `slopeDeg >= 26°` during/after rain) | Glossy dark-velvet `KSCOUR` cyanobacteria water-streaks down curved stone; slides careless walkers toward step-risers (dry pale feldspar granite alongside has high grip!) |
| **`dome:spall`** | `impact` | `Stations 1, 4` (`[Sun-Baked Dry]` afternoon insolation peak on fresh unstressed `shellStep01` lips) | Sharp metallic rifle-crack warning `1.5 s` before a thin granite scale pops `0.3 m` upward |
| **`dome:quagmire`** | `mire` | `Station 2 moat` (floating bright-chartreuse sphagnum eye-pockets where `waterDepthM >= 1.2 m`) | Quaking bog mat encircled by `moatpitcher` rings; slows wading off firmer sedge-tussock causeways |
| **`dome:cleftdrop`** | `fall` | `Station 4 cleft` (unguarded `45 m` vertical radial *Kluft* rim away from the chockstone ramp) | Exhaling cool mist wisps & Aeolian chord hum rising from the clean-cut granite slot |

- **4-Layer Procedural Audio:** (1) *Bed:* smooth laminar upslope breeze across curved bald stone + soft lenticular fog-drip on `Station 3`; (2) *Acoustic Phenomenon:* **`62–148 Hz` resonant stone-gong footstep thuds** (`hollowBoom01`) when walking across detached A-tent slabs (`Station 1`), **`+18 dB` slapback whispering-gallery reflections** along the concave ring-dike (`Station 2`), and **hollow Aeolian chord harmonics (`165 / 247 Hz`)** over the radial cleft (`Station 4`); (3) *Bio Texture:* `garlandtragopan` bell-calls & `atentgecko` `90 Hz` slab-taps; (4) *Accent:* rare afternoon thermal granite-spall cracks.

---

## 6. Crops, Gatherables & Material Budget (`kits/crops`, `kits/resources`, `core/materials`)

### 6.1 `CROPS.BIOMES.thedome` Registration (`67` Verified Crops via `CROPS.forBiome`)

```js
thedome: {
  atm: 1,   /* 1.11-1.31 atm standard upland envelope across the entire laccolith (0.8-1.3 atm band) */
  zones: {
    ringmoat:  {warmth: [2, 3], arid: [2, 3], wet: true}, /* +1,442..+1,900 m annular seepage fens & spring-fed collar benches */
    gnammapan: {warmth: [2, 2], arid: [1, 2], wet: true}, /* +1,900..+2,550 m perched seasonal solution-pan micro-gardens */
    garland:   {warmth: [2, 2], arid: [2, 3]},            /* +2,200..+2,780 m fog-drip exfoliation step-riser trenches */
    crown:     {warmth: [1, 2], arid: [2, 3]}             /* +2,780..+2,925 m Cfb lenticular cap-cloud summit benches */
  }
}
```
- **Verified `CROPS` Palette (`67` fits):**
  - *Annular `ringmoat` (`Cfa` `+1,500–1,900 m`, `wet: true`):* **`rice`** (irrigated moat-spring terraces on the NW `Upper Ria` edge), **`wild-rice`**, **`emmer`**, `frostoat`, `helix-bean`, `sweet-potato`, `murnong`, `painted-camas`, `whorl-olive`, `almond`, `fiddlehead`, `wineweed`.
  - *Perched `gnammapan` & `garland`:* **`basin-amaranth`**, **`pinyon`**, `pistachio`, `acorn`, `wingnut`, `tea` (mist-fed `garland` benches), `saffron` (well-drained feldspar grus risers).
  - *Cool `crown` (`Cfb` `+2,780–2,925 m`):* **`frostroot`**, alpine berry-heaths, and `pale-fungi` in damp radial *Kluft* recesses.

### 6.2 Gatherables & Regional Closure (`Upper Ria`, `Springhollows` & `Spider Lake`)

| Resource / Gather Tag | Source in `biomes/thedome` (`rmweubdnyts8y`) | Cultural & Economic Role (`Upper Ria` Sanctuary Rule) |
|---|---|---|
| **`porphyry-lithophone` & `stone = 214`** | Perimeter exfoliation benches (`Station 2` outer collar; inner dome sacred/unquarried) | Cut resonant rose-porphyry & leucogranite colonnade monoliths and tuned **temple lithophone chimes** barged down `9101` `Rīwa-Wāta` (*High-Ria:* `Līwa-Wāda`) to `Upper Ria` (`1186, 118`) |
| **`smoky-quartz` (`KSPELEO.SMOKY`)** | Radial unloading *Kluft* pockets (`Station 4 cleft`) | Prized optical/geomancer prisms and survey lenses traded to `Upper Ria` & `Compass Hills` |
| **`ringlichen` & `moatpitcher` dyes** | Exfoliation aprons & annular moat fens (`Stations 1–2`) | Saffron-gold, violet-ochre, and amber-rose ceremonial dyes |
| **S-Collar `limestone = 255, zinc = 90`** | Upturned `20.2% carbonate` collar (`(1316, 174)` S overlap margin) | Links geologically into `Springhollows` / `Spider Lake` MVT brass-and-lime belt |

### 6.3 Genuine Library Materials & `PROMPTS-NEEDED.md` Additions
- **Reused library sets (`materials.json`):** `rock.granite.tor`, `rock.porphyry.red`, `ground.gravel019`, `ground.dry_grass`, `ground.needles`, `ground.lichen.crust`, `bark.ponderosa`, `bark.juniper`, `wood.gnarled`, `card.pine`, `card.broadleaf`, `card.sedge`.
- **Four targeted prompts for `core/materials/PROMPTS-NEEDED.md` (procedural stand-ins until packed):**
  1. **`rock.granite.shell`** — pale rose-and-silver quartz-monzonite porphyry with coarse pink K-feldspar phenocrysts, thin white aplite veins, and smooth exfoliation polish (`Stations 1–4`).
  2. **`organic.scour.cyanomat`** — dark velvety slate-black cyanobacteria rainwater drainage streak (`KSCOUR` sheetwash flutes on bare granite, `Stations 1–2`).
  3. **`organic.moss.gnamma`** — concentric rim-grit and resurrection-selaginella carpet grading from copper-russet outer ring to emerald wet pan centre (`Stations 1, 3`).
  4. **`card.rosette.crownsilver`** — parabolic mirror-silver pubescent *Argyroxiphium*-like cloud-combing summit leaves with dew droplets (`Station 3`).

---

## 7. Numbered Fragment Architecture (`src/`), Rollout & Build Contracts

### 7.1 Fragment Map & `PORT.md` Tags

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `CORE_BIOME_MIN` + `31j,32,33,35,39,41..44`, `KDRAWN`, `KRAND`, `KMASK`, `KTAGS`, `KSPACE`, `KSTRATA`, `KSTACKS`, `KRELIEF` + `38d`, `KCAVERN`, `KSPELEO` + `39b2`, `KBASIN` (`40`), `KSCOUR` (`41`), `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER`, `ATMOS`, `CROPS` |
| `40-biome-dome-phys.js` | **`[G data]`** | `DOME_PHYS`: `shellAt`, `gnammaAt`, `acousticsAt` (lithophone Hz, whispering focus, barometric flow; zero `THREE`/DOM) |
| `41-biome-dome-sites.js` | **`[G data]`** | `DOME_SITES`: verified `own_dm` pixels `(1336,128)`, `(1317,117)`, `(1328,150)`, `(1372,148)`, `laccolith-shell` column, `site:dome-observatory` & `site:moat-waystation` reserves |
| `45-host-stage.js` | `[web]` | Renderer, convex exfoliation-step heightfield + `KBASIN` `gnamma` pans + `KCAVERN` A-tent & radial *Kluft* (`KDRAWN.add`), `BIO.init({tags:'thedome'})` |
| `47a..47b` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `springhollows` & `swlowlands` cedars, stunted oaks, alders & fen sedges read in place (`80–85%` matrix) |
| `50-biome-dome-species.js` | `[G partial]` | `THEDOME.SPECIES` (`7` own species), hydroperiod-tinted `gnammamoss`, `panbonsai`, `cloudgarlandpine`, `crownrosette`, `moatpitcher` & `HV` tags |
| `60-biome-dome-place.js` | **`[G data]`** | Deterministic `KRAND.cell` placement along `shellStep01` contour risers, `gnammaAt` pan rims, `KSPELEO.SMOKY` cleft walls, `KSPACE`, `CROPS`, and `KTAGS` |
| `84-host-ground.js` | `[web]` | `KGROUND` (`<= 5` layers), `KSCOUR` radial sheetwash streaks, `KSTRATA` surface-parallel exfoliation shading, `KFAR` (`14 km`), `KHORIZON` |
| `86-host-works.js` | `[web]` | `site:dome-observatory` & `site:moat-waystation` reserves + `?works=0` porphyry listening dishes, bronze wind-harps, rain-gauges (`class: 'furniture'`) |
| `89a-host-atmos.js` & `89w-host-water.js` | `[web]` | `ATMOS.bindHost` (`1.29 -> 1.11 atm`, stationary `Crown-Veil` lenticular `fogBelt`, cleft breath wisps), `WATER.still` (`gnammas` + moat fen) & `WATER.flow` sheetwash rills |
| `99-host-take.js` | `[web]` | `KHOST.take`, lithophone footstep synthesizer hook (`DOME_PHYS.acousticsAt`), `[Vernal-Brim] / [Sun-Baked Dry] / [Crown-Mist]` toggles, compliant preset views, `hostChecks()` |

### 7.2 Rollout Milestones (`DM0–DM5`)
- **`DM0`:** Land `PLAN.md`; add `"biomes/thedome"` to all 5 lists in `tools/checks_optin.json` and append the 4 material prompts to `core/materials/PROMPTS-NEEDED.md`.
- **`DM1`:** Implement `src/40-biome-dome-phys.js` + `src/41-biome-dome-sites.js` (`[G data]`) and pass `node biomes/thedome/tests/test-dome-phys.js` on `tools/ktest.js`.
- **`DM2`:** Build **Station 1 `apron`** (`dist/thedome.html`): curved `laccolith-shell` exfoliation steps, `KBASIN` `gnamma` sky-mirrors, hollow A-tent lithophone arches, `[Vernal-Brim] / [Sun-Baked Dry]` toggle, `verify.py --assert`.
- **`DM3`:** Build **Station 2 `moat`** (`-moat` ring-dike hogback & `moatpitcher` seepage fen), **Station 3 `crown`** (`-crown` `+2,924.8 m` lenticular cloud-cap & concentric `cloudgarlandpine` garlands), and **Station 4 `cleft`** (`-cleft` radial *Kluft* & `KSPELEO.SMOKY` smoky-quartz vault).
- **`DM4–DM5`:** Register `CROPS.BIOMES.thedome` (`67` crops, `test-crops.js`) and the 6 `kits/fauna` records; complete `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; pass `python3 tools/test_all.py`.

### 7.3 `build.py`, `stations/apron.json` & `verify.py` Assembly Contracts (`AGENTS.md`)

```python
#!/usr/bin/env python3
"""Build biomes/thedome stations -> dist/thedome[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS check

STATIONS = ('apron', 'moat', 'crown', 'cleft')
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '35-core-anim.js', '39-core-lean.js', '41-core-env.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js',
]
# Every text open() names encoding='utf-8' (and newline='\n' when writing); all paths use '/'
```

```json
{
  "id": "apron",
  "title": "The Dome — Onion-Skin Exfoliation Apron & Gnamma Sky-Mirror Gardens",
  "px": [1336, 128],
  "inDomeVerified": true,
  "elevM": 2268.5,
  "pAtm": 1.20,
  "koppen": "Cfa",
  "rainMmYr": 1255,
  "domeApexPx": [1328, 150],
  "strataStack": "laccolith-shell",
  "kin": ["springhollows", "swlowlands"],
  "reserves": [],
  "modes": ["Vernal-Brim", "Sun-Baked Dry", "Crown-Mist"]
}
```

```json
{
  "slots": {
    "strata_shell": "rock.granite.tor",
    "strata_dike": "rock.porphyry.red",
    "ground_grus": "ground.gravel019",
    "ground_grass": "ground.dry_grass",
    "ground_needles": "ground.needles",
    "ground_lichen": "ground.lichen.crust",
    "bark_pine": "bark.ponderosa",
    "bark_cedar": "bark.juniper",
    "wood_gnarled": "wood.gnarled",
    "card_pine": "card.pine",
    "card_oak": "card.broadleaf",
    "card_sedge": "card.sedge"
  }
}
```

```python
#!/usr/bin/env python3
"""Verify biomes/thedome stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'apron': 'dist/thedome.html',
    'moat':  'dist/thedome-moat.html',
    'crown': 'dist/thedome-crown.html',
    'cleft': 'dist/thedome-cleft.html',
}

if __name__ == '__main__':
    harness.main(pages=PAGES, default_page='apron', checks=harness.SURVEY)
```

---

## 8. Verification & Budgets (`verify.py --assert`, `openworld/` & Godot `4.7.2`)

1. **Strict `rmweubdnyts8y` & Sibling-Exclusive `own_dm` Invariant (`test-dome-phys.js`):** Asserts that all 4 station pixels `(1336, 128)`, `(1317, 117)`, `(1328, 150)`, and `(1372, 148)` lie strictly inside `rmweubdnyts8y` *and* inside `own_dm` (`0` overlap with `Spider Lake`, `Springhollows`, `Upper Ria`, `Tharn Hills`, or `Arachnoid Canyons`).
2. **Flat-Silled `Gnamma` Pan & Tree-Exclusion Invariants (`gnammaAt` + `hostChecks`):** Proves every `WATER.still` `gnamma` disk sits in a `KBASIN` depression whose rock rim is `>= waterY + 0.04 m` around `360°` (`0` floating water edges on sloped slabs!) and that **zero full-stature trees** (`height > 4 m`) spawn on unfractured bare exfoliation interiors (`shellStep01 < 0.55` and `inPan === false`), preserving authentic bald-rock aprons (`T.neg`).
3. **Concentric Garland & Lithophone Physics (`shellAt`, `acousticsAt`):** Proves `cloudgarlandpine` instances on `Station 3` cluster strictly along concentric `shellStep01 >= 0.70` risers around `(1328, 150)`, and `lithophoneHz` returns finite `62–148 Hz` bass frequencies exclusively where `hollowGapM >= 0.15 m` (`T.neg`: solid bedrock returns `hollowBoom01 === 0`).
4. **Sampler, Triangle, Shadow & Z-Fighting Budgets:**
   - **Samplers (`< 15` hard gate):** `KGROUND` (`<= 5` layers: `4–5`) + `KSTRATA` (`2`) + `ATMOS` (`2`) + `KHORIZON` (`1`) + `WATER` (`2`) = **`11–12` active samplers** (`12–13` when `?shadow=1`; `KSHADOW` off at page load).
   - **Geometry & Draw Calls:** `< 5.5 M` triangles and `< 110` draw calls per station (`ringlichen` and `KSCOUR` streaks blended in `KGROUND` height/mask channels rather than coplanar decals — `0` z-fighting, `0` untextured lit meshes, `0` console errors, positive `KDRAWN` eye clearance).
5. **`openworld/` 1:1 Streaming & Godot `4.7.2` Parity:** In `openworld/` streaming over `rmweubdnyts8y`, radial distance from `(1328 * 2000, 150 * 2000)` drives seamless concentric exfoliation rings across chunk boundaries; `golden-dome-phys.json` and `KSPELEO.export` (`SMOKY` cleft crystals) verify `godot/krator/biome/dome_phys.gd` to `1e-6`.
