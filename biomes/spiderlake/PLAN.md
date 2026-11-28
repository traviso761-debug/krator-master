# spiderlake: the plan (locked design, modernized 2026-11-22)

**Spider Lake** (`rmvyj4v2ozgb1` / `spider lake` in Scale Model `5.1`): a **`72,928 km²`** highland-lacustrine secondary-impact basin (`66,688 km²` dry rim, bench, and escarpment land + **`6,240 km²`** open water surface at **`+1,460.0 m`** on `X = 1225..1417, Y = 154..291`) perched on Krator's northeastern outer-slope divide between **`Springhollows`** (`biomes/springhollows/PLAN.md`, `rmvyiyw8ucd1y`, northwest), **`Ria Valley`** (`biomes/riavalley/PLAN.md`, north), **`Arachnoid Canyons`** (`rmvarachnoids`, southwest), and the **`Outland Gate`** (`1438, 326`, east).

At the **`+1,460.0 m`** lake datum, Krator's scale-height barometric law ($P(h) = 1.60 \cdot e^{-h / 8000\text{ m}}$, `g = 7.4 m/s²` / `0.75 g`) locks a warm, dense, hyperoxic atmosphere of **`1.33 atm`** (**`pO2 = 0.28 atm`** — **`+33%` above Earth sea-level oxygen partial pressure**, air density **`ρ = 1.56 kg/m³`**). Combined with `90.8% Cfa` / `2.9% Cfb` mild frost-free lakeshore warmth (`+19.0 °C` basin median, `+21.0 °C` [`+30/+12 °C`] at the `+1,460 m` shoreline, `1,459 mm/yr` median rain rising to `1,804–1,929 mm/yr` over the lake) and `+28 to +42 °C` sublacustrine hydrothermal seeps along the Arachnoid–Springhollows ring-fault intersection, **three ecological drivers run in permanent year-round overdrive**:
1. **The Hydrothermal "Lake-Smoke" Trophic Engine:** Warm silica- and calcium-rich lake-floor seeps fuel continuous diatom/cyanobacterial blooms that hatch astronomical dusk-and-dawn pillars (`300 m` high, **`15–40 g/m²/day`** aerial biomass) of non-biting chironomid lake-midges, giant burrowing mayflies, and caddisflies.
2. **Eusocial Arachnid Megacolonies (*Arachneapolita sericifera*):** Sustained by uninterrupted prey delivery, `+33%` hyperoxic book-lung diffusion (`0.28 atm O2`), and `1.56 kg/m³` / `0.75 g` aerodynamic lift, female-biased colonies of **`20,000–250,000` cooperative spiders** (`Foundresses/Matriarchs`, `Riggers/Span-Workers`, `Packers/Nurses`) drape rocky lake narrows in **`150–250 m` golden `1.3 GPa` dragline Bridge-Curtains** and link shoreline spindle-willow and crown-cypress woods with **`2–6 m` insulated ivory Brood-Pavilions**.
3. **Zero-Kill *Hum*–Ria Rotational Arachniculture & Wind-Billowing Silk (`CROOK-RIA-DECISIONS.md` §2.5.5 + [`kits/spider-lake`](file:///home/antigravity/traviso761-debug/krator-master/kits/spider-lake/README.md)):** Ethnically and linguistically rooted in the **Korona / *Hum* cultural complex** and refined by centuries of **Ria Civilizational hegemony** into the literate, treaty-bound **Silk Principality of Spider Lake** (*Hām-Spī* at `1288, 220` & *Hām-Tsēk* at `1055, 219`), silk-wrights **never kill or boil a spider colony**. Using acoustic *Hum* resonance (`spider-lake_hum_harp` / `slSpiderLoft`) and mild bog-myrtle & cliff-fern spore smudge-smoke, they cue workers peacefully into central brood-domes every 6 days while reeling outer `Golden Cable`, `Cloud-Fleece`, and `Lake-Sheen Gossamer` sheets off removable cedar-and-porphyry frames — every natural web-sheet and architectural silk canopy (`SL1–SL4`) wired directly to **`ATMOS.U.wind` / `ATMOS.GLSL_WIND` (`atmWind`)** with pinned anchor vertices so the entire landscape breathes and ripples with travelling lake gusts.

Status: **Build-ready modernized specification** uniting the original trophic/silk science with Scale Model `5.1` rasters, `CROOK-RIA-DECISIONS.md` §2.5.5, [`kits/spider-lake`](file:///home/antigravity/traviso761-debug/krator-master/kits/spider-lake/API.md), and `biomes/CRYSTAL-CAVES-5.1.md` (site 2). Zero edits to `tools/scale-model/` or `kits/`.

---

## Core adoption

Written first per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and verified against `tools/check_core_use.py` (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (2026-11-11 survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/spiderlake` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('spiderlake')` registry; `31j` `BIO.flareJoin` on buttressed littoral `crowncypress` knees and horizontal-whorled `spindlewillow` limbs; `32` `BIO.kin` reading `biomes/springhollows` / `biomes/swlowlands` oaks, pines, and ferns on upper dolomite/ejecta slopes; `33` `BIO.fung` for insulated multi-chamber `broodpavilion` silk domes and travertine warm-seep rims; `34` octahedral impostors on `>= 7 m` trees; `35`/`39` canopy wind sway synchronized with silk anchor points |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers lakeshore benches, `secondary-ejecta` boulder ramparts, emergent island stacks, spillway cataracts, and sub-escarpment `KSPELEO` cave floors via `KDRAWN.add` (survey item 28) |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Order-independent `KRAND.cell(seed, ix, iz)` and `KRAND.hash` for every tree, brood-pavilion fork, bridge-curtain catenary span, hydrothermal seep, crystal cluster, and midge-column seed |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every `Arachneapolita` colony complex (`bridgecurtain`, `broodpavilion`, `silkweir`), host tree, hydrothermal degumming spring, crystal cavern, hazard volume, resource node, and `site:spider-lake-weirs` (`1288, 220`) settlement reserve |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Spatial keep-clear between emergent stacks, navigable boat-arch channels under `Bridge-Curtains`, spindle-terrace rows, crystal beams (`KSPELEO.blocks`), and `kits/spider-lake` site reserves |
| **`core/coast`** | `core/coast/30-core-coast.js` (`KCOAST`) | Natural lacustrine `rock`, `cliff`, `marsh`, and `shingle` shore profiles (`coastC`) around the `+1,460.0 m` crater-lake shoreline and emergent silk-weir stacks |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `38-core-relief.js` (`KRELIEF`), `39-core-cavern.js` + `39b-core-speleo.js` (`KSPELEO.CALCITE`) + `39c-core-karst.js` (`KKARST`) + `39d-core-cavern-floor.js` + `host/39e-core-cavern-draw.js` + `host/39h-core-cavern-cut.js` (`KCAVERN.cutLayer`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` **`secondary-ejecta`** (`3–9 m` chaotic polymictic boulder breccia & dark suevite melt sheets collaring the `176 × 124 km` impact basin) unconformably overlying basal **`carbonate-shelf`** (cream cherty dolomite & red-porphyry dikes on the NW shore); `KKARST` + `KSPELEO.CALCITE` + `KCAVERN.cutLayer` on `Station 5 dolomite` for the warm-seep-fed MVT calcite/celestine grotto (`tube_ozarks_15` SE feeder `[1246, 206]`); `KGROUND` (`<= 5` layers); `KFAR` (`14 km`) + `KHORIZON` |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, **`geyser/52c-core-water-thermal.js` + `52d-core-water-thermal-draw.js`**, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js`, `farbed/53-core-water-farbed.js` | `WATER.open` at `+1,460.0 m` (`surf: false, breakers: false` on calm misty lake coves, light wind-chop in `narrows`, `WATER.mirrorSwitch` off at load) + `farbed/53`; `WATER.flow` for the **`380 m³/s` SW breach spillway cataracts (`1272, 193` into `9102` `Hām-Tsēk`)** and eastern `9106` `Hau-Gèl` inflow; `52c/52d` **`WATER` thermal pools** (`+32–44 °C` alkaline carbonate seeps & natural sericin-degumming baths on `Station 3 fen`) |
| **`core/atmos`** | `89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover.js`, `fx/lightning.js` | Shared Krator sky at `(px - 272, py - 330)` (**`pressure: 1.33`** at `+1,460 m`, `1.24` on the `+2,040 m` North Rampart); **`ATMOS.U.wind` / `ATMOS.GLSL_WIND` (`atmWind`)** driving live pinned-edge catenary billowing across every `Bridge-Curtain`, funnel-sheet, and `SL1–SL4` silk weir (`0.0` drift at rock/branch anchor rings, matching `kits/spider-lake/src/90z-sl-atmos.js`!); dawn radiation lake-fog (`heightfog`), hydrothermal steam wisps, and **dusk `"lake-smoke"` chironomid midge-pillar particle columns** (`3-particles.js`) |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazards: `spiderlake:snarecurtain` (sticky peripheral capture-web entanglement slowing movement `65%` off cleared paths; non-lethal to humans unless harassing brood-domes), `spiderlake:thermalbath` (`+42–48 °C` hot alkaline degumming vent centers), and `spiderlake:spillway` (`380 m³/s` cataract sweep at `1272, 193`) |
| **`core/materials`** | `core/materials/record/23-mat-record.js`, `25-matlib-host.js` + `tools/textures/matlib_pack.py` | Packed library textures (`tex/pack.json`, sharing silk/dolomite/porphyry material keys with `kits/spider-lake/materials.json`), keeping linked shader samplers `<= 12` (`< 15` survey ceiling) |
| **`core/shadow`** | `core/shadow/10-core-shadow.js`, `host/12-core-shadow-host.js` (`KSHADOW`) | Sun shadow cascade **off at page load** (`?shadow=1` or UI toggle attaches on first click, owner rule 2026-11-03) |
| **`core/host`** & **`core/walk`** | `khost.FULL` + `94-host-polytool.js` | Camera, walk controller, `[Dawn Fog] / [Dusk Lake-Smoke] / [Smudge Harvest]` state toggle, inspector tags, polygon tool, preset views, `window._api` |
| **`core/export`** | `core/export/07-core-export.js`, `09-core-export-adapters.js` | `krator-world` tile & `SPIDER_PHYS` export for `openworld/` and Godot `4.7.2` |
| **`kits/spider-lake`** *(companion kit)* | Read-in-place contract / `?works=0` weir props (`kits/spider-lake/API.md`, `34-sl-trades.js` `slSilkMath`) | Full urban/palace architecture (`SL1–SL4`: `sl_silk_bourse`, `sl_palace_pavilion`, `sl_dyehouse_canal`, `sl_weir_dock`) lives in the verified [`kits/spider-lake`](file:///home/antigravity/traviso761-debug/krator-master/kits/spider-lake/README.md) build and is reserved at `site:spider-lake-weirs` (`1288, 220`); biome stations share `slSilkMath` (`cornerPin`, `spanPin`, `hangPin`) and optionally place lightweight `?works=0` removable cedar-and-porphyry silk-weir reeling frames, smudge-pots, and cocoon lanterns (`class: 'furniture'`) |
| **`kits/crops`**, **`kits/fauna`**, **`kits/resources`** | Read-in-place `[G data]` contracts | `CROPS.BIOMES.spiderlake` (`littoral`, `terrace`, `fen`, `rampart`); `kits/fauna` records for *Arachneapolita sericifera* (`3` castes), `"lake-smoke"` midges/mayflies, silk-gleaner birds, and vent fish; `geology.json` (`100% carbonate`, `limestone = 255`, `zinc = 190`, `skarn = 200`, `marble = 138`, `copper = 120`, `iron = 140`, `clay = 255`) |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/mask`** (`KMASK`) | **No** | Catenary silk spans, midge-flux decay from shore, thermal seep halos, and ejecta rampart profiles are pure `[G data]` functions in `SPIDER_PHYS` (`getImageData` is zero) |
| **`core/city`**, **`core/hamlet`**, **`core/camp`**, **`core/simulation`** | **No** | The Silk Principality's town at `Spider Lake Weirs` (`1288, 220`, *Hām-Spī*) and river post at `Ham-Tsek` (`1055, 219`) belong to `settlements/` using `kits/spider-lake`; biome stations keep `site:spider-lake-weirs` clear |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/spiderlake"` joins all five opt-in lists (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`) from commit 1: `buildlib.through_tools_build(__file__)`, `build_sources.report()`, `CORE_BIOME_MIN`, `< 15` samplers (`9–12` target), `KDRAWN.add`, `tools/ktest.js`, and zero `'` or `:` in any preset view name.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/spiderlake/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmvyj4v2ozgb1`** (*spider lake*): **`72,928 km²` total** (**`66,688 km²` dry land** + **`6,240 km²` `+1,460.0 m` open lake**), `X = 1225..1417, Y = 154..291`, centroid `(1319.2, 224.3)` on `1821 × 1723` (`2 km/px`) |
| **Atmospheric Constants (Unified & Fixed)** | **`+1,460.0 m` lake surface:** **`P = 1.33 atm`** ($1.60 \cdot e^{-1460/8000}$), **`pO2 = 0.28 atm`** (**`+33%`** above Earth sea level), **`ρ = 1.56 kg/m³`**, **`g = 7.4 m/s²` (`0.75 g`)** *(unifying the whole spec on `1.33 atm` / `0.28 atm O2` at lake level; `1.24 atm` only on the `+2,040 m` North Rampart crest)* |
| **Pages (`6` Stations)** | `dist/spiderlake.html` (**Station 1 `spillway` [Main Showcase]**: SW Crater-Rim Breach & Silk-Weir Cataracts at `1272, 193`), `--station narrows` (`1295, 212` / `1288, 220` Golden Narrows `180 m` Bridge-Curtains & *Hām-Spī* Reserve), `--station pavilion` (`1308, 224` High Canopy Brood-Pavilion & Spindle-Willow Woods), `--station fen` (`1328, 228` `Hau-Gèl` Hydrothermal `"Lake-Smoke"` Midge-Fen & Degumming Springs), `--station dolomite` (`1256, 184` NW Dolomite-Porphyry Shore & `KSPELEO.CALCITE` Crystal Grotto), and `--station rampart` (`1278, 166` `+2,040 m` Unbreached North `secondary-ejecta` Boulder-Collar & Ria Divide) |
| **Objects** | **`SPIDER_PHYS`** (`[G data]` in `src/40-biome-spider-phys.js`: `1.33 atm` / `0.75 g` gossamer ballooning & `1.3 GPa` catenary sag solver, pinned `aFlut` `ATMOS` wind weights matching `slSilkMath`, hydrothermal midge-flux trophic budget, 6-day smudge-calming state, and MVT sub-escarpment brine feed; tested by `tests/test-spiderlake-phys.js`) and **`SPIDERLAKE`** (`BIO.kit('spiderlake')`) |

---

## 1. Geological, hydrological & atmospheric ground truth (`Scale Model 5.1`)

### 1.1 Exact surveyed raster & `geology.json` metrics (`rmvyj4v2ozgb1`)

| Parameter | Surveyed `Scale Model 5.1` Value | Physical, Hydrological & Ecological Meaning |
|---|---|---|
| **Total / Land / Lake Area** | `72,928 km²` = **`66,688 km²` dry** + **`6,240 km²` lake (`WL = +1,460.0 m`)** (`X = 1261..1328, Y = 191..230` water bbox) | Shallow-to-moderate warm polymictic/hydrothermal crater lake (`bed p5 / p50 / p95 = +1,437.9 / +1,441.5 / +1,454.2 m`: `6,236 km²` `< 25 m` deep!) maximizing sunlit benthic midge habitat across `99.9%` of the lake floor! |
| **Dry Elevation (`p5 / p10 / p50 / p90 / p95 / max`)** | `+1,028.7` (SW gorge) / **`+1,277.1 / +1,339.9 / +1,613.2 / +2,700.7 / +3,147.9`** / `+7,099.5 m` (SE wall edge) | Terraced `+1,460..+1,780 m` silk-grove benches collared on the NW/N/NNE by the unbroken `+1,880..+2,146 m` `secondary-ejecta` rampart (`1278, 166`) |
| **Barometric Pressure & `O2`** | **`1.33 atm` (`pO2 = 0.28 atm`, `ρ = 1.56 kg/m³`)** at `+1,460.0 m`; `1.31 atm` land median; `1.24 atm` on `+2,040 m` North Rampart | `+33%` oxygen partial pressure fuels giant colonial spider silk-gland synthesis; `1.56 kg/m³` dense air at `0.75 g` gives **`1.77×` Earth's aerodynamic buoyancy-to-weight ratio** for casting `180–250 m` gossamer bridge-cables! |
| **Köppen, Rainfall & Temp** | **`Cfa` 90.8% (`60,524 km²`)**, `Dfc` 4.7%, `Cfb` 2.9% (`1,940 km²` shore/rampart); rain `p5 / p50 / p95` = **`1,145 / 1,459 / 1,882 mm/yr`** (`1,804–1,929 mm` on shore); **`+19.0 °C`** (`+21 °C` [`+30/+12 °C`] at lake shore) | **The lake never freezes over** (`tc = +10..+12 °C` buffered by thermal mass + `+28–42 °C` seeps), preventing the winter prey crash that forces temperate Earth spiders into solitary annual lifecycles |
| **Basin Origin & Single Unbifurcated Outflow** | **Radial Secondary Impact Crater (`center 1295, 212`, `176 × 124 km`)** excavated into `carbonate-shelf` dolomite. **Inflow:** `9106` **`Hau-Gèl` (*Outland Gate River*, `680 km`, `Q = 640 m³/s` at `1328, 228`)**. **Sole Surface Outflow:** Single SW breach at **`(1272, 193)`** into **`9102` `Hām-Tsēk` (*Web-Cleaver River*, `890 km`, `Q = 380 -> 1,650 m³/s`)** | **Zero artificial lake bifurcation:** the unbroken northern `secondary-ejecta` boulder rampart (`1278, 166`, `+2,040 m`) seals Spider Lake off completely on the surface from `9101` `Rīwa-Wāta` (`Līwa-Wāda`) and `9109` `Tlīla-Wāda` (while feeding slow sub-escarpment geothermal groundwater into `tube_ozarks_15` `[1246, 206]`!) |
| **`geology.json` Resources** | **`100.0% carbonate` basement** (`limestone = 153..255` on `4,201` cells): **`zinc = 190` (`4,201` c!)**, **`skarn = 200`** (`38` c), **`marble = 138`** (`94` c), `copper = 120` (`38` c), `iron = 140` (`38` c), `clay = 255` (`133` c), `saltpeter = 200` (`5` c), `turquoise = 82` | Supplies cream dolomite, contact `marble`, `copper`/`zinc` bronze-brass sheaves (`kits/spider-lake` `SL1` pulley hardware!), and warm carbonate-brine feed for `Springhollows` MVT crystal caverns |

---

## 2. Trophic physics, *Arachneapolita* eusociality & `ATMOS` wind-pinned silk (`SPIDER_PHYS`, `[G data]`)

Authored in `src/40-biome-spider-phys.js` (zero `THREE`, zero `DOM`, deterministic on `KRAND`, tested by `tests/test-spiderlake-phys.js`):

1. **Hyperoxic Diffusion & `0.75 g` Bridge-Casting (`SPIDER_PHYS.aerodynamicsAt({elevM, windSpeedMs, threadDiaUm, spanM}) -> {pAtm, pO2Atm, rhoKgM3, dragLiftRatio, maxCastSpanM, catenarySagM}`):**
   - At `+1,460 m` (`pAtm = 1.33`, `pO2Atm = 0.279`, `rhoKgM3 = 1.56`), passive book-lung/tracheal $O_2$ flux supports `3.5–6.5 cm` worker legspans (`9.0 cm` in deep-amber *Foundress/Matriarch* queens) and continuous year-round ampullate protein spinning without hypoxia.
   - Because upward electrostatic/turbulent air drag scales with $\rho = 1.56\text{ kg/m}^3$ while silk weight scales with $g = 7.4\text{ m/s}^2$, `dragLiftRatio` is **`1.77×` Earth's**, enabling `Rigger` castes to loft **`180–250 m` golden dragline cables** (`tensile = 1.3 GPa`, `30%` breaking strain) across narrows and cataract throats (`catenarySagM` solved analytically with `boatClearanceM >= 6.5 m` over navigation channels).
2. **Hydrothermal `"Lake-Smoke"` Midge Trophic Budget (`SPIDER_PHYS.lakeSmokeAt({shoreDistM, seepProximity01, hour24, windOnshore01}) -> {midgeFluxGm2Day, pillarHeightM, colonyPopCap, webSheetDensity01}`):**
   - Models `+28–42 °C` sublacustrine vents (`6,236 km²` `< 25 m` sunlit lakebed) producing **`15–40 g/m²/day`** of emerging non-biting chironomid midges, burrowing mayflies, and caddisflies peaking at dawn (`05:30–08:00`) and dusk (`17:30–20:30`) in `180–320 m` brown-gold `"lake-smoke"` columns. Shoreward wind advection (`shoreDistM <= 1,800 m`) sustains permanent eusocial colonies of **`20,000–250,000` females** (`Foundresses/Matriarchs` in `2–6 m` thermally insulated `Brood-Pavilions`; long-legged `Riggers/Span-Workers` on outer draglines; `Packers/Nurses` swarming giant lake-flies and feeding spiderlings trophallactically), dropping smoothly to solitary funnel/trapdoor spiders on dry upper bluffs (`shoreDistM > 2,500 m`).
3. **Live `ATMOS` Wind-Pinned Silk Contract (`SPIDER_PHYS.silkPinWeight(kind, u, v)` — unified with `kits/spider-lake` `slSilkMath`):**
   - Every drawn wild spider structure (`bridgecurtain`, `funnelsheet`, `weirsheet`) and `?works=0` silk-weir frame encodes a vertex pin-weight attribute `aFlut` bound to **`ATMOS.U.wind` / `ATMOS.GLSL_WIND` (`atmWind`)**:
     - `aFlut === 0.0` at every rock stack attachment, `crowncypress` / `spindlewillow` limb anchor, and cedar weir crossbar (**zero detached or floating cable endpoints under any gale!**).
     - `aFlut` ramps smoothly via `slSilkMath.spanPin(u) * slSilkMath.cornerPin(u, v)` to `1.0` in the catenary sheet belly, rippling organically with travelling gusts across the lake!
4. **Zero-Kill *Hum* & Smudge Rotational Harvest (`SPIDER_PHYS.harvestCycleAt({dayMod6, smudgeActive01, humFreqHz}) -> {sheetThicknessMm, workersRetreated, reelReady, broodUnharmed}`):**
   - Models the Silk Principality's **strict non-lethal covenant** (`CROOK-RIA-DECISIONS.md` §2.5.5): when `humFreqHz` (`110–165 Hz` acoustic *Hum* string/rafter vibration) + `smudgeActive01` (*bog-myrtle* & `porphyryfern` golden spore smoke) are applied on day 6, `workersRetreated === true` and `broodUnharmed === true`, allowing outer capture/structural sheets to be wound onto water-powered bobbins without harming a single spider!

---

## 3. Ecological zones & the Silk Principality landscape

| Zone Key | Elev Band (`m`) | Substrate (`KSTRATA` / `KGROUND`) | Dominant Biota & Silk Architecture |
|---|---|---|---|
| **`1. narrows`** (*Littoral Narrows & Silk-Weir Island Stacks*) | `+1,460 .. +1,492 m` (`Stations 1, 2`) | Emergent `secondary-ejecta` suevite & `carbonate-shelf` dolomite stacks in `< 22 m` water | Buttressed **`crowncypress`** standing in `0–2.5 m` water, anchoring shimmering **`15–40 m` tall × `150–220 m` wide golden `Bridge-Curtains`** (`Golden Cable`) with arched boat-passages underneath |
| **`2. fumarole_fen`** (*Hydrothermal `"Lake-Smoke"` Midge-Fens & Degumming Springs*) | `+1,460 .. +1,478 m` (`Station 4`) | Travertine-rimmed `+32–44 °C` alkaline carbonate pools (`52c-core-water-thermal.js`) & floating peat-silt | Dense **`lakesmokesedge`** larval nurseries, carnivorous **`silkfenpitcher`** bogs co-inhabited by juvenile spiders, dusk `300 m` midge pillars, and natural **alkaline sericin-degumming spring baths** |
| **`3. pavilion_wood`** (*High Canopy Brood-Pavilion Woods*) | `+1,464 .. +1,690 m` (`Station 3`) | Mist-drenched bench loam over `carbonate-shelf` / `secondary-ejecta` | Supple **`spindlewillow`** and **`crowncypress`** groves linked crown-to-crown by **`2–6 m` ivory-gold `Brood-Pavilions`** (`Cloud-Fleece`) and sunlit funnel-sheet highways |
| **`4. spindle_terrace`** (*Managed *Hum*–Ria Arachniculture Groves*) | `+1,475 .. +1,760 m` (`Stations 1, 2, 3`) | Cut cream-dolomite & purple-red porphyry dry-stone terraces | Pruned **`ambermulberry`** (extrafloral nectar droplets feeding worker spiders!) and pollarded `spindlewillow` rows alternating with `?works=0` removable cedar **`Silk-Weir` reeling frames** (`Lake-Sheen Gossamer`) |
| **`5. rim_rampart`** (*Dolomite-Porphyry Escarpments & North Ejecta Collar*) | `+1,680 .. +2,450 m` (`Stations 5, 6`) | Chaotic `secondary-ejecta` megablock breccia (`1278, 166`) & NW `Springhollows` dolomite/porphyry bluffs | Drier chinkapin oak, porphyry pine, **`porphyryfern`** (harvested for calming smudge-spores!), solitary trapdoor/funnel spiders, and sub-escarpment **`KSPELEO.CALCITE`** crystal caverns (`Station 5`) |

---

## 4. Station catalogue (`6` verified Scale-Model `5.1` sites)

Every station `(px, py)` is directly verified on `5.1` rasters (`sky frame = (px - 272, py - 330)`). View names obey survey item 30 (zero `'` and zero `:`).

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | Elev, `10 km` Relief & `P_atm` | Climate, Rain & `T` (`w/c`) | `KSTRATA` & `geology.json` | Core Signature Shown |
|---|---|---|---|---|---|---|
| **1** | **`spillway`** *(main)* `dist/spiderlake.html` | **`(1272, 193)`** `(+1000, -137)` (*SW Breach into `9102` `Hām-Tsēk`*) | **`+1,460.0 m`** lip -> `+1,390 m` gorge, **`1.33 atm`** | `Cfa`/`Cfb`, **`1,898 mm`**, **`+21 °C`** (`+30/+12`) | `secondary-ejecta` megablocks over basal `carbonate-shelf`; `zinc = 90..190` | **Arachnoid Spillway & Silk Weirs:** Sole `380 m³/s` lake outlet plunging through `secondary-ejecta` cataracts beneath `180 m` wind-billowing golden **Bridge-Curtains**, `?works=0` water-driven reeling frames & alkaline degumming vats |
| **2** | **`narrows`** `--station narrows` `dist/spiderlake-narrows.html` | **`(1288, 220)`** -> `(1295, 212)` `(+1016, -110)` | **`+1,460.9 m`** shore / `-22 m` bed, **`1.33 atm`** | `Cfa`, **`1,804–1,867 mm`**, **`+21 °C`** (`+29/+12`) | `secondary-ejecta` & dolomite island stacks; `clay = 255`, `limestone = 153`, `zinc = 90` | **Golden Narrows `200 m` Bridge-Curtains & *Hām-Spī* Principality Reserve:** Emergent rocky stacks spanned by multi-tier golden dragline curtains (`6.5 m` boat arches) + `site:spider-lake-weirs` (`kits/spider-lake` `SL1–SL4` town reserve) |
| **3** | **`pavilion`** `--station pavilion` `dist/spiderlake-pavilion.html` | **`(1308, 224)`** `(+1036, -106)` (S/SE Bench Woods) | **`+1,463.2 m`** (`+1,445..+1,685 m`), **`1.33–1.30 atm`** | `Cfa`, **`1,867 mm`**, **`+21 °C`** (`+30/+12`) | `carbonate-shelf` + ejecta loam; `limestone = 153`, `wood = 255` | **High Canopy Brood-Pavilion Grove & *Hum* Spindle-Terraces:** `spindlewillow`, `crowncypress`, and `ambermulberry` woods linked canopy-to-canopy by `2–6 m` glowing ivory-gold **Brood-Pavilions** + interactive `[Smudge Harvest]` demo |
| **4** | **`fen`** `--station fen` `dist/spiderlake-fen.html` | **`(1328, 228)`** `(+1056, -102)` (`9106` `Hau-Gèl` Inflow Delta) | **`+1,460.0 m`** (`+1,397..+1,472 m`), **`1.33 atm`** | `Cfa`, **`1,929 mm`**, **`+21 °C`** (`+30/+12`) | Travertine warm-seep terraces over `carbonate-shelf`; `clay = 255` | **Hydrothermal `"Lake-Smoke"` Midge-Fen & Alkaline Degumming Springs:** Steaming `+38 °C` carbonate thermal pools (`52c/52d`), `lakesmokesedge` & `silkfenpitcher` mats, and `300 m` dusk chironomid `"lake-smoke"` pillars |
| **5** | **`dolomite`** `--station dolomite` `dist/spiderlake-dolomite.html` | **`(1256, 184)`** `(+984, -146)` (NW Escarpment & `1246, 206` Conduit) | **`+1,284..+1,580 m`**, **`1.36–1.31 atm`** | `Cfa`, **`1,741 mm`**, **`+22 °C`** (`+31/+13`) | `carbonate-shelf` + red-porphyry dike + **`KSPELEO.CALCITE`** | **Dolomite Rim Overlook & Warm-Brine Crystal Grotto:** NW transition into `Springhollows` where lake-fed geothermal dolomite joints open via `KCAVERN.cutLayer` into a walk-in `KSPELEO.CALCITE` celestine-and-calcite crystal chamber (`CRYSTAL-CAVES-5.1.md` site 2) |
| **6** | **`rampart`** `--station rampart` `dist/spiderlake-rampart.html` | **`(1278, 166)`** `(+1006, -164)` (North Impact Collar) | **`+2,040.0 m`** (`+1,651..+2,146 m`), **`1.24 atm`** | `Cfa` / `Cfb`, **`1,537 mm`**, **`+17 °C`** (`+26/+8`) | **`secondary-ejecta`** ballistic megablock breccia; `limestone = 153`, `zinc = 90` | **North Rampart Boulder-Collar & Ria Hydrological Divide:** Unbroken hummocky `secondary-ejecta` rampart sealing `+1,460 m` Spider Lake (`S` view) cleanly off from the headwaters of `9101` `Rīwa-Wāta` (`Līwa-Wāda`) & `9109` `Tlīla-Wāda` (`N` view), carpeted in `porphyryfern` & ballooning spiderling gossamer |

### 4.1 Station 1 (`spillway`, main page `dist/spiderlake.html`): Arachnoid Spillway & Silk Weirs — `(1272, 193)`
- **Site & Framing (`5.6 × 5.6 km`):** Anchored at `(1272, 193)` (`sky +1000, -137`), the **sole unbifurcated surface outlet** of Spider Lake (`+1,460.0 m`), plunging `70 m` over stepped `secondary-ejecta` boulder cataracts into the upper throat of **`9102` `Hām-Tsēk` (*Web-Cleaver River*, `Q = 380 m³/s` at outlet -> `1,650 m³/s` mouth)** under `1.33 atm` `Cfa`/`Cfb` air (`1,898 mm/yr`).
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* Upper `secondary-ejecta` (`+1,415..+1,760 m`, `3–9 m` chaotic polymictic boulder breccia & dark suevite impact-melt lenses) resting unconformably on basal `carbonate-shelf` (`+1,340..+1,415 m` cream cherty dolomite undercut at the plunge pool).
  - *Ground (`5` layers):* `ground.gravel042` (spillway boulder lag), `ground.needles` (`crowncypress` & willow litter), `ground.travertine.degum` (warm-seep degumming aprons), `rock.limestone` (dolomite terrace), `ground.sphagnum` (spray moss).
- **Signature Visuals:** Looking ENE (`az 68°`, pitch `-7°`) from `+1,488 m` above the breach throat: foaming whitewater (`WATER.flow`) slices between `secondary-ejecta` megablocks spanned overhead by `180 m` wind-billowing golden **`bridgecurtain` dragline sheets** (`aFlut` pinned at rock anchors, rippling on `ATMOS.U.wind`); `?works=0` places removable cedar-and-porphyry silk-weir reeling frames (`weirframe_wild`), alkaline warm-spring degumming vats (`52c-core-water-thermal.js`), and glowing cocoon lanterns (`class: 'furniture'`).
- **Preset views:** `overview`, `breach-cataract`, `bridge-curtain-arch`, `reeling-weir-terrace`, `degumming-vats`, `lake-horizon`.

### 4.2 Station 2 (`narrows`, `dist/spiderlake-narrows.html`): Golden Narrows & *Hām-Spī* Reserve — `(1288, 220)`
- **Site & Framing (`5.8 × 5.8 km`):** Spans from the Silk Principality shore at **`Spider Lake Weirs` (`1288, 220`, `sky +1016, -110`, `+1,460.9 m`)** out across emergent `secondary-ejecta` and dolomite island stacks (`+1,465..+1,488 m` over `-18..-22 m` water toward crater center `1295, 212`).
- **Signature Visuals:** Multi-colony **`bridgecurtain`** suspension nets (`15–40 m` tall × `150–220 m` wide) link buttressed littoral **`crowncypress`** trees from stack to stack, with maintained `6.5 m`-high arched navigation gaps for silk-skiffs underneath. On the gentle `+1,462 m` shore terrace, `site:spider-lake-weirs` (`r = 420 m`) holds clear buildable space for **`kits/spider-lake` (`SL1–SL4`)** (`sl_silk_bourse`, `sl_palace_pavilion`, `sl_dyehouse_canal`, `sl_weir_dock`).
- **Preset views:** `overview`, `golden-narrows-span`, `boat-navigation-gap`, `cypress-stack-anchors`, `ham-spi-principality-site`, `dusk-sheen`.

### 4.3 Station 3 (`pavilion`, `dist/spiderlake-pavilion.html`): High Canopy Brood-Pavilion Grove — `(1308, 224)`
- **Site & Framing (`5.2 × 5.2 km`):** Mist-swathed `+1,463..+1,685 m` bench forest (`1.33–1.30 atm`, `1,867 mm/yr`) where entire groves of **`spindlewillow`** and **`crowncypress`** are linked canopy-to-canopy by `2–6 m` insulated ivory-gold **`broodpavilion`** domes and sunlit three-dimensional funnel-sheet highways, bordered upslope by cut dolomite/porphyry **`ambermulberry`** terraces.
- **Interactive `[Smudge Harvest]` Toggle:** Wafts golden `porphyryfern` + bog-myrtle smudge smoke and `132 Hz` *Hum* resonance (`SPIDER_PHYS.harvestCycleAt`), causing `arachneapolita` `Rigger` swarms on `weirframe_wild` frames to retreat peacefully into `broodpavilion` domes (`broodUnharmed === true`)!
- **Preset views:** `overview`, `brood-pavilion-canopy`, `amber-mulberry-terrace`, `spindle-willow-forks`, `smudge-harvest-frame`, `funnel-highway`.

### 4.4 Station 4 (`fen`, `dist/spiderlake-fen.html`): Hydrothermal `"Lake-Smoke"` Midge-Fen — `(1328, 228)`
- **Site & Framing (`5.4 × 5.4 km`):** Where **`9106` `Hau-Gèl` (*Outland Gate River*, `Q = 640 m³/s`)** enters the eastern lake (`1328, 228`, `sky +1056, -102`, `+1,460.0 m`, `1,929 mm/yr`) across travertine-rimmed **`+32–44 °C` alkaline carbonate thermal pools (`52c/52d`)**.
- **Signature Visuals:** Dense **`lakesmokesedge`** floating mats and **`silkfenpitcher`** bogs surround steaming natural sericin-degumming baths. Toggling **`[Dawn Fog] / [Dusk Lake-Smoke]`** launches `300 m`-tall shimmering brown-gold `ATMOS` chironomid/mayfly midge columns off the warm water into shoreline webs!
- **Preset views:** `overview`, `dusk-lake-smoke-pillars`, `alkaline-degum-springs`, `pitcher-snare-bog`, `hau-gel-inflow-braid`, `dawn-radiation-fog`.

### 4.5 Station 5 (`dolomite`, `dist/spiderlake-dolomite.html`): Dolomite Rim & `KSPELEO.CALCITE` Grotto — `(1256, 184)`
- **Site & Framing (`5.0 × 5.0 km`):** Northwestern basin wall (`+1,284..+1,580 m`, `sky +984, -146`) where `Spider Lake`'s warm seepage feeds the **`Spider Lake Sub-Escarpment Phreatic Conduit` (`[1246, 206] -> [1212, 174]`, `tubes.json` `tube_ozarks_15`)** into [`biomes/springhollows`](file:///home/antigravity/traviso761-debug/krator-master/biomes/springhollows/PLAN.md). Beneath `carbonate-shelf` dolomite cliffs sliced by a purple-red porphyry dike, `KCAVERN.cutLayer` + `KKARST` opens a walkable lakeshore grotto dressed with **`KSPELEO.CALCITE`** (honey calcite druse, `12 m` pale-blue celestine beams, and `zinc = 90..190` sphalerite-galena seams; `biomes/CRYSTAL-CAVES-5.1.md` site 2).
- **Preset views:** `overview`, `dolomite-lake-bluff`, `porphyry-dike-rib`, `sub-escarpment-grotto`, `celestine-calcite-hall`, `springhollows-vista`.

### 4.6 Station 6 (`rampart`, `dist/spiderlake-rampart.html`): North Ejecta Collar & Ria Divide — `(1278, 166)`
- **Site & Framing (`5.4 × 5.4 km`):** High on the unbroken ballistic **`secondary-ejecta` boulder-collar** (`+2,040.0 m`, `sky +1006, -164`, `1.24 atm`, `+17 °C`) that hydrologically seals `+1,460 m` Spider Lake (`KFAR` south vista) from the headwaters of `9101` `Rīwa-Wāta` (`Līwa-Wāda`) and `9109` `Tlīla-Wāda` (`KFAR` north vista). Chaotic `3–9 m` ejecta megablocks carry **`porphyryfern`** smudge-spore ledges, wind-sheared oaks/pines (`springhollows` kin), and gossamer-ballooning juvenile spiderlings (`0` giant eusocial `Brood-Pavilions` above the midge line!).
- **Preset views:** `overview`, `ejecta-megablock-crest`, `two-watersheds-divide`, `gossamer-balloon-ridge`, `porphyry-fern-ledges`.

---

## 5. Species roster (`src/50-biome-spider-species.js`), Silk Grades & `kits/crops`

### 5.1 Core Flora & Colonial Silk Structures (`9` kit builders, `tools/check_botany.py` compliant)

| Key | Name & Role | Zone | Height / Span & `3D` Builder | Biome Mechanics & `HV` Harvest Tag |
|---|---|---|---|---|
| **`spindlewillow`** | **Spindle-Willow** (*Salix arachnophila*) | `pavilion_wood`, `spindle_terrace` | `12–19 m` supple smooth-barked tree with horizontal whorled limbs (`BIO.flareJoin`) engineered to bear `400 kg` wet silk loads without snapping | Winged seeds co-dispersed in spider guy-anchors; pollarded along arachniculture rows. `HV('weaving, cordage, fuel', [], true, 'Salicin-rich bark tea; supple pollard wands framed into removable silk-weir reels.')` |
| **`crowncypress`** | **Buttressed Crown-Cypress** (*Taxodium coronatum*) | `narrows`, `pavilion_wood` (`0–3 m` littoral water) | `26–38 m` fluted emergent conifer with flat table-crowns and submerged knees (`BIO.flareJoin`) | Primary living pylon anchoring `180–220 m` `Bridge-Curtains` across lake narrows. `HV('timber', [], false, 'Rot-proof littoral piling and weir-dock timber.')` |
| **`ambermulberry`** | **Nectar Amber-Mulberry** (*Morus chrysophaea*) | `spindle_terrace`, `pavilion_wood` | `6–13 m` broadleaf terrace tree exuding glistening amber extrafloral nectar droplets along leaf veins | Feeds worker spiders quick carbohydrates during dry spells while berries feed silk-wright towns! `HV('timber, sheet', ['amber mulberry'], false, 'Sweet berries; inner bast beaten into crisp treaty-parchment stitched with gossamer.')` (`crop: 'mulberry'`) |
| **`lakesmokesedge`** | **Lake-Smoke Tussock Sedge** (*Carex nebulosa*) | `fumarole_fen`, `narrows` | `0.5–1.4 m` buoyant littoral tussocks with dense submerged root-curtains | Houses trillions of aquatic chironomid midge and mayfly larvae round warm seeps. `HV('thatch, weaving', [], false, 'Woven into airy cocoon-drying baskets.')` |
| **`silkfenpitcher`** | **Snare-Mouth Fen Pitcher** (*Sarracenia sericea*) | `fumarole_fen` | `0.35–0.85 m` fluted crimson-and-chartreuse bog trumpets | Mutualism: juvenile *Arachneapolita* spin tiny snare-webs across pitcher mouths, dropping chitinous husks inside to fertilize the plant! `HV('none', [], true, 'Digestive pitcher fluid used to spot-clean raw silk.')` |
| **`porphyryfern`** | **Calming Smudge Cliff-Fern** (*Polypodium porphyriticum*) | `rim_rampart`, `spindle_terrace` walls | `0.30–0.75 m` leathery bronze-green fern with heavy golden sporangia on dolomite/ejecta/porphyry rock | Essential to zero-kill arachniculture! `HV('none', [], true, 'Dried golden spore-fronds burned with bog-myrtle in silk-wright smudge-pots to calm colonies peacefully into brood-domes.')` (`reagent`) |
| **`bridgecurtain`** | **Golden Dragline Bridge-Curtain** (*Arachneapolita* span work) | `narrows`, `spillway` (`50–220 m` spans) | `15–40 m` tall × `50–220 m` wide multi-tier catenary suspension sheet (`aFlut` pinned at anchor stacks/trees, billowing on `ATMOS.U.wind`), burnished metallic gold | Intercepts skimming midge clouds above `+6.5 m` boat-navigation arches. `HV('cordage', [], false, 'Outer structural cables harvested rotationally as 1.3 GPa Golden Cable rigging.')` (`gather: 'spider-silk-cable'`) |
| **`broodpavilion`** | **Communal Silk Brood-Pavilion** (*Arachneapolita* nest dome) | `pavilion_wood` (`+4..+18 m` branch forks) | `2.0–6.0 m` rainproof, thermally insulated ivory-gold nonwoven silk dome (`BIO.fung` multi-lobed chamber + guy-ropes) | Houses `Foundress` queens and year-round egg-sacs at `+24 °C` internal warmth; **strictly inviolate under Principality law** (`only` shed outer autumn weather-shells are sheared!). `HV('sheet', [], true, 'Shed outer weather-shells carded into ultralight waterproof Cloud-Fleece.')` (`gather: 'spider-silk-fleece'`) |
| **`weirframe_wild`** | **Tended Spindle-Weir Sheet** *(Symbiotic silk-on-frame)* | `spindle_terrace` (`?works=0` removable cedar frames) | `3.2 × 2.4 m` pearl-gold iridescent capture/spindle sheet (`aFlut` pinned to 4 frame corners, `slSilkMath.cornerPin`) | Reeled every 6 days after smudge-smoke + *Hum* calming and degummed in `+38 °C` alkaline springs. `HV('spinning', [], false, 'Degummed into continuous iridescent Lake-Sheen Gossamer filament.')` (`gather: 'spider-silk'`) |

### 5.2 The Three Export Grades & `kits/spider-lake` (`SL1–SL4`) Structural Hand-Off

| Export Grade | Biological Source (`biomes/spiderlake`) | Mechanical & Optical Properties | Downstream Architectural (`kits/spider-lake`) & Continental (`SIM.trade`) Uses |
|---|---|---|---|
| **1. `Golden Cable`** (*Major-Ampullate Dragline*) | Rotational outer cables of `bridgecurtain` spans (`narrows`, `spillway`) | Deep burnished gold; **`1.3 GPa` tensile strength**, `30%` elongation-to-break, rot-proof | Suspends **`SL1` `slMastObelisk` *velaria*** & **`SL2` `slHyparCanopy` King-Masts**; rigs `Ria Valley` Palace-Barges (`89i–89l`), Outer-Wall gliders, bowstrings & lamellar armor |
| **2. `Cloud-Fleece`** (*Tubuliform & Aciniform Felt*) | Shed seasonal outer weather-shells of `broodpavilion` domes (`pavilion_wood`) | Warm ivory-cream hydro-repellent nonwoven felt; traps dead air while shedding rain | Amber-waxed **`SL2` hyperbolic-paraboloid ("Lotus-Saddle") palace roofs**; `Yeti Kingdom` / `NW Outer Wall` expedition parkas & surgical dressings |
| **3. `Lake-Sheen Gossamer`** (*Minor-Ampullate & Flagelliform*) | Reeled every 6 days off `weirframe_wild` frames & washed in `+38 °C` alkaline springs | Iridescent pearl-gold continuous filament with two-tone interference sheen | Weaves **`SL3` *shamiyana* awnings**, evaporative **`slWindVeils`**, **`SL4` `19.2 m` dyed canal bolts (`sl_dyehouse_canal`)**, cocoon lanterns & Ria dynastic court robes |

### 5.3 `kits/crops` registration (`CROPS.BIOMES.spiderlake`)

```js
spiderlake: {
  atm: 2,   /* 1.33 atm at +1,460 m lake surface & shores (dense band >= 1.30 atm); high rampart > +1,800 m overrides to atm: 1 */
  zones: {
    littoral: {warmth: [3, 3], arid: [3, 4], wet: true},               /* +1,460 m warm lake margins & inflow paddies */
    terrace:  {warmth: [2, 3], arid: [3, 3]},                          /* +1,475..+1,760 m mulberry, tea & orchard benches */
    fen:      {warmth: [3, 3], arid: [3, 4], wet: true, heated: true}, /* +32..+42 C hydrothermal midge-fen & degumming seeps */
    rampart:  {warmth: [1, 2], arid: [2, 3], atm: 1}                   /* +1,800..+2,450 m North Ejecta Rampart (1.24 atm) */
  }
}
```
- **Verified `CROPS` Palette:** **`mulberry`**, **`tea`**, `rice`, `wild-rice`, `lotus-root`, `helix-bean`, `persimmon`, `saffron` & `whorl-olive` (NW `dolomite` bench), `flax`, `cave-madder` & `indigo` silk dyes (`SL4` dye-works!), plus dark-cavern `alecap` & `glow-mushroom` (`Station 5`).

---

## 6. Fauna (`kits/fauna`), workshop closure (`Ruling #1`), hazards & sampler budget

### 6.1 Fauna (`kits/fauna` `[G data]` records)

| Key (`kits/fauna`) | Name & Castes / Clade | Scale | Ecological Niche & *Hum* Symbiosis | Yields & 24h Schedule |
|---|---|---|---|---|
| **`arachneapolita`** | ***Arachneapolita sericifera*** (`Matriarch`, `Rigger`, `Packer` eusocial arachnid) | `0.04–0.09 m` (`20k–250k` colony) | Spins `bridgecurtain` & `broodpavilion` complexes; retreats peacefully into brood-domes on `110–165 Hz` *Hum* cadence + `porphyryfern` smudge | `spider-silk` (**`live` rotational harvest only; `0` kill yield!**). `00–06` `SPIN_REPAIR`, `06–17` `SHADE_DOME`, `17–24` `SWARM_LAKE_SMOKE` |
| **`lakesmokemidge`** | **Plume Chironomid & Giant Lake-Mayfly** (`ATMOS` column + swarm) | `0.02–0.06 m` (`300 m` pillars) | Emerges year-round (`15–40 g/m²/day`) from `6,236 km²` `< 25 m` warm hydrothermal lakebed (`Stations 1–4`) | `fish-bait`, dried poultry/carp mash. `05–08` `DAWN_EMERGE`, `08–17` `BENTHIC_NYMPH`, `17–21` `DUSK_PILLAR` |
| **`gossamerfinch`** | **Velvet-Footed Silk-Gleaner** (passerine bird) | `0.18 m` | Lipid-coated non-stick tarsal scales let it walk `Golden Cable` guy-lines gleaning inedible beetle husks without tearing webs (protected by *Hām-Spī* law) | Never hunted (`aggression: 0`). `06–18` `GLEAN_CURTAIN`, `18–06` `ROOST_WILLOW` |
| **`ventbarbel`** | **Warm-Seep Diatom Carp** (lacustrine cyprinid) | `0.45 m` | Schools densely over `+28–38 °C` carbonate seeps (`Stations 1, 2, 4`) feeding on midge pupae; primary protein of the Silk Principality | `fish`, `fish-glue` (sizing). `05–19` `SCHOOL_SEEP`, `19–05` `REST_WEED` |
| **`dewgecko`** | **Porphyry Nectar-Skink** (arboreal lizard) | `0.24 m` | Licks `ambermulberry` extrafloral nectar beside `Rigger` spiders (`Station 3`), tapping a slow `3-beat` *Hum* vibration on branches to inhibit prey-attack! | `small-hide`. `07–18` `LICK_NECTAR`, `18–07` `HIDE_TERRACE` |

### 6.2 `CONTINENTAL-SCOPE.md` Ruling #1 Workshop Closure (`*Hām-Spī*` & `*Hām-Tsēk*`)
- **Fuelwood-Free Alkaline Degumming (`[LOCAL]` reagent loop closed!):** Natural `+38–44 °C` `NaHCO3/CaCO3` hydrothermal pools on `Station 4 fen` degum raw sericin off `Lake-Sheen Gossamer` without burning scarce terrace timber (`porphyryfern` smudge-spores + bog-myrtle close the harvest-calming reagent input).
- **Stone, Bronze & Dye Inputs:** Local `limestone = 153..255` dolomite, `marble = 138`, `copper = 120`, and `zinc = 190` (`geology.json`) supply `kits/spider-lake` `SL1` colonnades, bronze pulley sheaves (`slMastObelisk`), and lime-mortar locally, while **bulk grain, `Coyote` rock-salt (`229`), `Compass Hills` `lodestone` magnets, and `Ria` polychrome ceramics** are imported up `Hām-Tsēk` (`1055, 219`) and via `The Gate` (`1438, 326`, Ruling #58 Toad-Men river-pilots) in exchange for all three silk grades!

### 6.3 Data-driven hazards (`core/hazard`, `KHAZ`), 4-layer ambient audio & cross-biome guardrails

| Hazard ID | `KHAZ` Kind | Stations & Trigger Rule (`SPIDER_PHYS`) | Visual / Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`spiderlake:snarecurtain`** | `mire` / entangle | `Stations 1–3` (`webSheetDensity01 >= 0.55` off cleared paths) | Dew-beaded sticky flagelliform funnel-sheets between trees; slows movement `65%` without harming walkers (`[Smudge Harvest]` clears frame lanes) |
| **`spiderlake:broodguard`** | `swarm` | `Station 3 pavilion` (`< 2.5 m` from `broodpavilion` without smudge/*Hum*) | Audible `Packer` tarsal drumming warning before non-lethal silk-throw immobilization (`Principality` taboo forbids striking brood-domes!) |
| **`spiderlake:thermalbath`** | `heat` | `Station 4 fen` (`52c` thermal seep center `tempC >= +43 °C`) | Rising steam plumes & creamy travertine sinter rims; mild scald in central vent throats (outer `+36 °C` degumming aprons are safe) |
| **`spiderlake:spillway`** | `current` | `Station 1 spillway` (`9102` `Hām-Tsēk` `380 m³/s` breach cataracts) | Foaming `secondary-ejecta` boulder drops beneath high `bridgecurtain` spans; rapid downstream sweep |

**Station-by-Station 4-Layer Procedural Audio (`biomes/STATIONS-AMBIENT-AUDIO.md` contract):**
- **Layer 1 (Lacustrine / Spillway Bed):** Gentle `+1,460 m` lake-lap against dolomite stacks (`Stations 2, 4, 5`) vs. thundering `380 m³/s` spillway cataract (`Station 1`) and high ridge-wind (`Station 6`).
- **Layer 2 (Aeolian Silk Harmonic):** Signature **`110–220 Hz` wind-strummed `Golden Cable` Aeolian chord** rising and falling organically as `ATMOS.U.wind` gusts tension `180–220 m` `bridgecurtain` spans!
- **Layer 3 (Trophic `"Lake-Smoke"` Foley):** Warm dusk/dawn **`580–900 Hz` chironomid `"lake-smoke"` wing-shimmer** (`Stations 1–4`) + delicate dry-silk rustle of thousands of `Rigger` tarsi repairing outer curtains.
- **Layer 4 (Cultural *Hum* Accent):** Distant plucked **`spider-lake_hum_harp` pentatonic calming cadence** near `site:spider-lake-weirs` (`Station 2`) and during `[Smudge Harvest]` (`Station 3`).

**Explicit Cross-Biome Guardrails & `< 15` Sampler Budget:**
- **Guardrails:** Kept unmistakably distinct from **`biomes/korona`** (tepuí carnivorous bog plateaus with *wild* cloud-fleece huts vs. Spider Lake's `+1,460 m` impact-crater lake, `180 m` golden suspension curtains, and literate *Hum*–Ria Silk Principality) and **`biomes/springhollows`** (which receives Spider Lake's warm brine underground via `tube_ozarks_15`, but has `0` `"lake-smoke"` midge pillars or eusocial spider canopies).
- **Sampler budget (`9–12` active, `< 15` survey ceiling, `KSHADOW` off at load):** Shares packed dolomite, red-porphyry, cedar, and iridescent silk textures with `kits/spider-lake/materials.json` (`matlib_pack.fragment(..., exclude=...)`); adds **4 biome prompts** to `PROMPTS-NEEDED.md`:
  1. **`card.silk.bridgecurtain`** — translucent burnished-gold braided major-ampullate dragline sheet beaded with morning lake-mist (`Stations 1, 2`).
  2. **`organic.silk.broodpavilion`** — dense weatherproof ivory-gold nonwoven tubuliform silk dome felt (`Station 3`).
  3. **`bark.willow.spindle`** — smooth silver-celadon resin-free willow bark wrapped in guy-silk anchor collars (`Stations 2, 3`).
  4. **`ground.travertine.degum`** — creamy alkaline carbonate warm-spring sinter rimmed with golden diatom film (`Stations 1, 4`).

---

## 7. Numbered `src/` architecture, rollout & verification invariants

Replacing the legacy 7-file sketch (`config.js / index.html`), `biomes/spiderlake/` uses Krator's standard numbered `src/` + `build.py` + `stations/` + `verify.py` architecture:

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `buildlib.CORE_BIOME_MIN` + `31j, 32, 33, 35, 39, 41..44`, `KDRAWN`, `KRAND`, `KTAGS`, `KSPACE`, `KCOAST`, `KSTRATA`, `KRELIEF`, `KCAVERN` + `KSPELEO` + `KKARST` + `cutLayer`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER` (+ `52c/52d` thermal), `ATMOS`, `CROPS` |
| `40-biome-spider-phys.js` | **`[G data]`** | `SPIDER_PHYS`: `aerodynamicsAt` (`1.33 atm` / `0.28 atm O2`), `lakeSmokeAt`, `silkPinWeight` (`slSilkMath`-compatible), `harvestCycleAt`, `mvtBrineAt` |
| `41-biome-spider-sites.js` | **`[G data]`** | `SPIDER_SITES`: surveyed `5.1` pixels, `+1,460.0 m` lake datum, `9102`/`9106` discharges, `KSTRATA` `secondary-ejecta`/`carbonate-shelf` stacks, `site:spider-lake-weirs` reserve |
| `45-host-stage.js` | `[web]` | Renderer, crater-lake / stack / spillway / rampart heightfields + `Station 5` `KCAVERN.cutLayer` & `KSPELEO.CALCITE`, `KDRAWN.add`, `BIO.init({tags:'spiderlake'})` |
| `47a` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `springhollows` / `swlowlands` upland oaks, pines, and ferns read in place on `Stations 5–6` |
| `50-biome-spider-species.js` | `[G partial]` | `SPIDERLAKE.SPECIES` (`9` builders), `HV` tags, `aFlut` `ATMOS.GLSL_WIND`-pinned `bridgecurtain` / `weirframe_wild` catenary meshes, `broodpavilion` domes |
| `60-biome-spider-place.js` | **`[G data]`** | Deterministic `KRAND.cell` tree, colony, span-anchor, and crystal placement gated by `SPIDER_PHYS`, `KSPACE`, `CROPS`, and `KTAGS` |
| `84-host-ground.js` & `86-host-works.js` | `[web]` | `KGROUND` (`<= 5` layers), `KSTRATA` ejecta-over-dolomite cliff shading, `KFAR`, `KHORIZON`, `site:spider-lake-weirs` reserve + `?works=0` cedar silk-weir frames, smudge-pots & cocoon lanterns (`class: 'furniture'`) |
| `89a-host-atmos.js`, `89w-host-water.js`, `99-host-take.js` | `[web]` | `ATMOS.bindHost` (`1.33 atm`, `atmWind` silk uniforms, dawn fog, `300 m` dusk `"lake-smoke"` midge pillars), `WATER.open`/`flow`/`thermal` + `farbed`, `[Dawn Fog]/[Dusk Lake-Smoke]/[Smudge Harvest]`, `hostChecks()` |

### 7.1 Rollout milestones (`SL0–SL5`)
- **`SL0`:** Land modernized `PLAN.md`; add `"biomes/spiderlake"` to all 5 checks in `tools/checks_optin.json` and append the 4 biome material prompts to `core/materials/PROMPTS-NEEDED.md`.
- **`SL1`:** Implement `src/40-biome-spider-phys.js` + `src/41-biome-spider-sites.js` (`[G data]`) and pass `node biomes/spiderlake/tests/test-spiderlake-phys.js` on `tools/ktest.js`.
- **`SL2`:** Build **Station 1 `spillway`** (`dist/spiderlake.html`) and **Station 2 `narrows`** (`-narrows`): `180–220 m` `ATMOS`-pinned `bridgecurtain` catenaries, `crowncypress` stacks, `380 m³/s` `Hām-Tsēk` breach cataracts, `verify.py --assert` (`checks=harness.SURVEY`).
- **`SL3`:** Build **Station 3 `pavilion`** (`-pavilion`), **Station 4 `fen`** (`-fen` `"lake-smoke"` midge columns & `52c/52d` degumming pools), **Station 5 `dolomite`** (`-dolomite` walk-in `KSPELEO.CALCITE` grotto), and **Station 6 `rampart`** (`-rampart` `+2,040 m` Ria divide).
- **`SL4–SL5`:** Register `CROPS.BIOMES.spiderlake` (`test-crops.js`) and the 5 `kits/fauna` records; complete `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; pass `check_core_use.py`, `check_botany.py`, and `python3 tools/test_all.py`.

### 7.2 Z-fighting separation & `verify.py --assert` invariants (`T.ok` + `T.neg`)
1. **Unified `1.33 atm` / `0.28 atm O2` lake-level physics (`aerodynamicsAt`):** Proves `pAtm` at `+1,460.0 m` is `1.333 ± 0.005 atm`, `pO2Atm` is `0.280 ± 0.003 atm`, `rhoKgM3` is `1.56 ± 0.02`, and `maxCastSpanM >= 220 m` with `boatClearanceM >= 6.5 m` on navigation channels (`T.neg`: `maxCastSpanM < 90 m` at thin `< 0.75 atm` alpine pressures).
2. **`ATMOS` wind-pinned silk integrity (`silkPinWeight` & `_api.atmosSilkAudit`):** Proves `aFlut === 0.0` (`0.000 m` vertex drift under any `ATMOS.U.wind` gust) at all `bridgecurtain` rock/tree anchor endpoints and `weirframe_wild` crossbars while belly vertices (`u = 0.5, v = 0.5`) displace smoothly downwind (`T.neg`: zero unpinned floating cable ends; `>= 0.03 m` slot offset between silk sheet edges and cedar weir crossbars so zero coplanar z-fighting occurs!).
3. **Hydrological divide & single SW outlet (`SPIDER_SITES`):** Proves `+1,460.0 m` lake water exits solely via `(1272, 193)` (`Station 1 spillway`), while `Station 6 rampart` (`1278, 166`, `+2,040 m`) has zero surface water crossing (`T.neg`).
4. **Trophic shore gradient & zero-kill covenant (`lakeSmokeAt` & `harvestCycleAt`):** Proves `broodpavilion` and `bridgecurtain` place only where `midgeFluxGm2Day >= 12.0` (`Stations 1–4`), dropping to `0` on the `+2,040 m` `Station 6 rampart` (`T.neg`); proves `broodUnharmed === true` throughout `[Smudge Harvest]`; `52c` thermal pool water planes sit `>= 0.10 m` above `+1,460.0 m` `WATER.open` lake level on `Station 4 fen`; `< 15` active samplers; `KSHADOW` off at load; zero `class === 'building'` inside `site:spider-lake-weirs`.

---

## 8. `build.py` assembly, [`kits/spider-lake`](file:///home/antigravity/traviso761-debug/krator-master/kits/spider-lake/API.md) hand-off & Godot `4.7.2` twin contract

### 8.1 `build.py` deterministic cross-platform assembly (`AGENTS.md` rules)

```python
#!/usr/bin/env python3
"""Build biomes/spiderlake stations -> dist/spiderlake[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS check

STATIONS = ('spillway', 'narrows', 'pavilion', 'fen', 'dolomite', 'rampart')
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '35-core-anim.js', '39-core-lean.js', '41-core-env.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js',
]
# Every text open() specifies encoding='utf-8' (and newline='\n' when writing); all paths use '/'
```

### 8.2 `stations/<station>.json` & `materials.json` contracts

```json
{
  "id": "spillway",
  "title": "Spider Lake — Ham-Tsek Spillway Breach & Suspension Silk Curtains",
  "px": [1272, 193],
  "lakeDatumM": 1460.0,
  "pAtm": 1.33,
  "pO2Atm": 0.28,
  "rhoKgM3": 1.56,
  "outflowM3s": 380.0,
  "maxSpanM": 220.0,
  "minBoatClearM": 6.5,
  "strataStack": "ejecta-over-dolomite",
  "kin": ["springhollows", "swlowlands"],
  "reserves": [],
  "modes": ["Dawn Fog", "Dusk Lake-Smoke", "Smudge Harvest"]
}
```

```json
{
  "slots": {
    "rock_ejecta": "rock.breccia",
    "rock_dolomite": "rock.limestone",
    "ground_sinter": "ground.lakebed.shells",
    "ground_moss": "ground.sphagnum",
    "ground_terrace": "ground.dry_grass",
    "bark_cypress": "bark.alder.lichen",
    "bark_mulberry": "bark.juniper",
    "wood_cedar": "wood.cedar",
    "silk_cloth": "fabric.silk.gold",
    "card_foliage": "card.broadleaf",
    "card_fern": "card.fern.green",
    "card_reed": "card.sedge"
  }
}
```

### 8.3 `verify.py` shared-harness specification (`tools/harness.py` — no pasted launcher)

```python
#!/usr/bin/env python3
"""Verify biomes/spiderlake stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'spillway': 'dist/spiderlake.html',
    'narrows':  'dist/spiderlake-narrows.html',
    'pavilion': 'dist/spiderlake-pavilion.html',
    'fen':      'dist/spiderlake-fen.html',
    'dolomite': 'dist/spiderlake-dolomite.html',
    'rampart':  'dist/spiderlake-rampart.html',
}

if __name__ == '__main__':
    harness.main(
        pages=PAGES,
        default_page='spillway',
        checks=harness.SURVEY,   # <15 samplers, KSHADOW off at load, aFlut pin audit, 1.33 atm datum
    )
```

### 8.4 Seamless `openworld/` hand-off to `kits/spider-lake` (`1288, 220` & `1055, 219`) & Godot `4.7.2` parity
- **Unified `ATMOS` wind & `core/city` lot hand-off:** When *Hām-Spī* (`Spider Lake Weirs`, `1288, 220`) is placed on `core/city` + `core/world` using [`kits/spider-lake`](file:///home/antigravity/traviso761-debug/krator-master/kits/spider-lake/API.md) (`slDims()`, `SL_TRADES`, `SL1–SL4`), both the city's architectural *velaria* / lotus-saddle roofs / canal bolts (`SV_CLOTH` `aFlut`) and the surrounding biome's `180 m` `bridgecurtain` spans and `spindle_terrace` weirs read the **exact same `ATMOS.U.wind` (`atmWind`) uniform field**, rippling in unison as lake squalls cross from water to town!
- **Godot `4.7.2` GDScript twin (`godot/krator/biome/spider_phys.gd`):** Pure `[G data]` catenary, pin-weight (`slSilkMath`), and midge-flux functions (`x == null ? d : x` defaults, integer `KRAND` hashes, zero `THREE`/DOM) export `golden-spiderlake-phys.json` vectors from `test-spiderlake-phys.js` so Godot `4.7.2`'s vertex-wind shader (`a_flut`) and colony placement match the Three.js stations identically.
