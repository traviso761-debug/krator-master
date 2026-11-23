# batteredisle: the plan (locked design, 2026-11-23)

**Battered Isle** (`id: "rmwetgzft4x9d"`, `"battered isle"` in Scale Model `5.1`): an isolated **`128 × 86 km` (`7,204 km²` dry land inside a `13,308 km²` island-and-sound polygon, `X = 429..504, Y = 222..285`)** offshore volcanic island standing guard off Krator's north-western **`Tsunami Coast`** (`rmvyk62bgdvs3`), separated from the mist-drowned **`Shroudhills`** mainland (`rmwetizlzivnz`, *Yonni-Zāg:* `Shrūda-Khīltæ`) by a **`17.0–32 km` tidal sound**.

**Foundational Geomorphic Identity (Owner Direction, 2026-11-23):** Battered Isle is **a very, very, very worn extinct cinder and scoria cone**. It is not a crisp young stratovolcano: ages of `1,700–2,200 mm/yr` monsoon rainwash (`Am` `77.2%`, `Aw` `21.3%`, summit `Cfa` `1.6%`) and thousands of `35–55 m` megatsunami impacts from **`Steaming Seamounts`** (`533–561 km` WSW) and the Great NW Ocean's **`Farside Tsunami Shields`** (`287°–294°` WNW) have stripped away most of the loose outer pyroclastic apron. What endures above the waves is the cone's **deeply denuded skeletal core**:
1. **Low, Heavily Gullied Red-Black Scoria & Yellow-Tan Palagonite Slopes (`p25 = +26.0 m`, `p50 = +115.4 m`):** Weathered vesicular cinder-gravel, oxidized brick-red lapilli beds, and consolidated hydrovolcanic palagonite tuff (`clay = 255`, `stone = 244`) that swallow surface rainfall without forming a single permanent river (`0` rivers in `rivers.json`), discharging instead along basal spring-lines above impermeable tuff horizons.
2. **Exhumed Central Olivine-Basalt Volcanic Neck & Radial Feeder-Dike Ribs (`max = +868.8 m` at `474, 248`):** Solid columnar olivine-rich basalt and ultramafic mantle-xenolith cumulates (`69.2% ultramafic` province, **`nickel = 180`** across `305` `4 km` cells) forming the stubby central plug and radiating vertical **feeder-dike walls and welded-spatter hogbacks** that resist erosion long after softer cinders wash away.
3. **WNW Oceanward Tsunami-Planed Rim & Dike-Stack Rampart:** Facing the open ocean head-on, millennia of `50 m` bores have bevelled the windward cone flank into stepped dark basalt/scoria abrasion benches (`+6 to +48 m`), offshore **radial-dike sea-stacks (`KSTACKS`)**, thundering **blowhole sea-caves (`KCAVERN` / `KSPELEO`)**, wave-tossed boulder ridges, and a knife-sharp **`+52 to +62 m` megatsunami trimline**.
4. **Breached ESE/SSE Crater Embayment & Upturned `coal = 201` Country-Rock Collar:** Where the ancient cinder vent punched up through coastal sedimentary strata (`30.8% sedimentary` province in the SE sector) and breached leeward toward `Shroudhills`, tilted country-rock coal measures were contact-baked into high-grade **bituminous/anthracitic seams (`coal = 201` peak, `112` cells `>= 80`)** flanking drowned crater-rim coves, palagonite sea-arches, kelp anchorages, and the natural stronghold of **`Bè-tõ-pò` (`settlements/battered-port/`, `(435, 259)` `+115 m` bluff)** — the `~5,000`-soul HQ of the Unpainted Eternian Exiles' Smuggler Ring.

Status: **Build-ready specification** aligned with `CROOK-RIA-DECISIONS.md` (§1.5, §2.1, §2.5.6), `biomes/shroudhills/PLAN.md`, `biomes/drownlands/PLAN.md`, and `settlements/battered-port/PLAN.md`. Zero edits to `tools/scale-model/`, `core/`, or `kits/`.

---

## Core adoption

Written first per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and verified against `tools/check_core_use.py` (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/batteredisle` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('batteredisle')` registry; `31j` `BIO.flareJoin` on wind-sheared crater-laurel buttresses and dike-gripping surface roots; `32` `BIO.kin` reading `biomes/arch` (`pycnandra`, `gymnostoma` on `ultramafic` nickel-scoria) and `biomes/farside` / `biomes/crook` (`stormwrack`, `wineweed` intertidal wrack — zero `landkelp` trees); `33` `BIO.fung` for salt-spray barnacle/coralline collars; `34` octahedral impostors on dense `wood = 255` leeward/summit forest; `35`/`39` permanent salt-shear lean (`BATTER_PHYS.windShearAt`) |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers eroded cinder-cone slopes, abrasion benches, dike ribs, and sea-arch roofs via `KDRAWN.add` for survey item 28 eye-clearance checks |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Order-independent cell hashes (`KRAND.cell(seed, ix, iz)`, `KRAND.hash`) for every radial dike rib, sea-stack, blowhole vent, tsunami boulder, tree lean, and rookery ledge |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of all flora, fauna roosts, `coal`/`nickel`/`wood` nodes, `KHAZ` blowhole/surge volumes, and `site:battered-port-rim` / `site:seamount-beacon` reserves |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Spatial occupancy keeping feeder-dike walls, blowhole orifices, tsunami megaboulders, cove boat-channels, and canopy crowns non-overlapping |
| **`core/coast`** | `core/coast/30-core-coast.js` (`KCOAST`) | Bimodal island shoreline profiles: high-energy `cliff` and `rock` abrasion benches on the WNW tsunami rampart vs. sheltered `shingle`, `rock`, and `sand` pocket coves on the ESE leeward sound |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `36-core-carve.js` (`KCARVE`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` (`KRELIEF`), `39-core-cavern.js` + `39b-core-speleo.js` + `39b2-core-speleo-cleft.js` + `host/39e-core-cavern-draw.js` + `host/39h-core-cavern-cut.js` (`KCAVERN`, `KSPELEO`), `41-core-scour.js` (`KSCOUR`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` custom worn-cone recipes (`worn-scoria-palagonite`, `olivine-plug-basalt`, `upturned-coal-collar`); `KSTACKS` for offshore radial-dike sea-stacks (`Station 2`); `KCARVE` + `KCAVERN` + `KSPELEO` for wave-bored blowhole tubes (`Station 2`) and palagonite sea-arches/smuggler vaults (`Stations 1, 3`); `KSCOUR` + `KRELIEF` for radial rain-gullies and `+6..+48 m` tsunami planation steps; `KGROUND` (`<= 5` layers/station); `KFAR` (`16 km` island silhouette + `Shroudhills` mist horizon across the `17 km` strait on `Station 3`) + `KHORIZON` |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/56..60`, `farbed/53-core-water-farbed.js` | `WATER.open` with heavy `1.60 atm` WNW ocean rollers on `Station 2` and calm, mist-sheltered deep-green cove water on `Stations 1, 3` (`WATER.mirrorSwitch` off at load); `WATER.still` for basalt rock-cut tidepools & perched palagonite spring basins; `WATER.flow` for basal tuff-contact spring cascades (`Station 1`); `farbed/53` for kelp-and-dike shoal beds |
| **`core/atmos`** | `89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover.js`, `fx/lightning.js` | Shared Krator sky at `(px - 272, py - 330)` (`1.44–1.60 atm`), `#include <atmos_waves>` wind-gust animation, rhythmic **blowhole compression-spray plumes** (`3-particles.js` on `Station 2`), strait sea-fog belt (`Station 3`), and cloud-cap mist (`Station 4`) |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazard volumes: `batteredisle:blowhole` (intermittent high-pressure air/spray blasts on `Station 2`), `batteredisle:tsunamibench` (`< +55 m` WNW over-wash zone), and `batteredisle:dikereef` (submerged radial-dike hull-rippers) |
| **`core/materials`** | `core/materials/record/23-mat-record.js`, `25-matlib-host.js` + `tools/textures/matlib_pack.py` | Packed genuine library textures via `materials.json` (`tex/pack.json`), keeping active shader samplers `<= 12` (`< 15` survey ceiling) and `0` untextured lit meshes |
| **`core/shadow`** | `core/shadow/10-core-shadow.js`, `host/12-core-shadow-host.js` (`KSHADOW`) | Sun shadow cascade **off at page load** (`?shadow=1` or UI toggle attaches on demand, owner rule 2026-11-03) |
| **`core/host`** & **`core/walk`** | `khost.FULL` + `94-host-polytool.js` | Camera, walk/scramble controller (including sea-arch & blowhole ledges), world clock, inspector, polygon tool, `[Calm] / [Gale] / [Tsunami Drawdown]` preview toggle, `window._api` |
| **`core/export`** | `core/export/07-core-export.js`, `09-core-export-adapters.js` | `krator-world` tile & `BATTER_PHYS` export for `openworld/` and Godot `4.7.2` |
| **`kits/crops`** | `kits/crops/src/10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js` (`CROPS`) | Read in place (`[G data]`): defines `CROPS.BIOMES.batteredisle` across 4 zones (`rampart`, `leecove`, `cinderslope`, `plugcrest`) |
| **`kits/fauna`** | `kits/fauna` (`[G data]` records first) | Registers 6 coastal rookery, kelp-cove, and cinder-burrowing species with diets, yields, and 24h `core/sched` schedules |
| **`kits/resources`** | Read-only contract (`kits/resources/GEOLOGY.md`, `data/geology.json`) | Honours exact surveyed `5.1` bytes (`ultramafic = 255`, `nickel = 180`, `coal = 201`, `wood = 255`, `stone = 244`, `clay = 255`, `iron = 40`, `oil = 78`) |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/mask`** (`KMASK`) | **No** (on station pages) | Eroded cone radial geometry, dike azimuths, blowhole tubes, and trimlines are evaluated from pure `[G data]` functions in `BATTER_PHYS` (`getImageData` is zero); `openworld/` uses `KMASK.distance` via `core/world/44c-world-coast.js` |
| **`core/city`**, **`core/simulation`**, **`core/engine`** | **No** | Urban streets, unmasked `kits/eternian` exile wards, cliff-hoists, and smuggler `SIM` routes live in the companion build **`settlements/battered-port/`**; Station 1 registers `site:battered-port-rim` and `site:seamount-beacon` as clean `KTAGS` reserves (with optional `?works=0` smuggler leading-marks and coal-seam adit props as `class: 'furniture'`) |
| **`core/water/geyser`** | **No** | `vents.json` has **`0` active volcanic or hydrothermal vents** inside `rmwetgzft4x9d` — the cinder cone is **completely extinct**, its "blowholes" driven purely by ocean wave compression inside eroded scoria/dike sea-caves! |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/batteredisle"` enters all five opt-in lists (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`) from commit 1: `build.py` calls `buildlib.through_tools_build(__file__)` and `build_sources.report()`, extends `buildlib.CORE_BIOME_MIN`, refuses LFS pointers, registers drawn ground in `KDRAWN` and cavern cuts via `KCAVERN.cutLayer`, keeps shader samplers `< 15` (`10–12` target), uses `tools/ktest.js` (`T.ok` + `T.neg`), and forbids `'` and `:` in all preset view names.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/batteredisle/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmwetgzft4x9d`** (*battered isle*, `kind: "biome"`): **`13,308 km²` polygon** = **`7,204 km²` dry land (`1,801` `2 km` cells, `54.1%`)** + **`6,104 km²` shoals & strait waters (`1,526` cells, `45.9%`)**; polygon BBox `X = 429..504, Y = 222..285`, dry-land BBox `X = 434..497, Y = 227..269` (`128 × 86 km`), centroid `(468.4, 250.3)`; `100%` nested inside `Tsunami Coast` (`rmvyk62bgdvs3`) |
| **Pages (`4` Stations)** | `dist/batteredisle.html` (**Station 1 `portcove`** at `438, 258`: Breached Scoria Rim, Basal Tuff Springs & Exile Port Bluff overlooking `435, 259`), `--station rampart` (`444, 244`: WNW Tsunami Abrasion Bench, Blowhole Sea-Caves & Exhumed Radial-Dike Stacks), `--station archcove` (`494, 250`: ESE Leeward Palagonite Sea-Arch Cove & Upturned `coal = 201` Collar facing `Shroudhills`), and `--station plugcrest` (`474, 248`: `+868.8 m` Exhumed Olivine-Basalt Volcanic Neck, Spatter Ribs & Wind-Sheared Cloud-Forest) |
| **Objects** | **`BATTER_PHYS`** (`[G data]` in `src/40-biome-batter-phys.js`: worn cinder-cone radial erosion profile, feeder-dike rib/stack projection, wave-driven blowhole air-compression physics, WNW-vs-ESE tsunami trimline asymmetry, and ultramafic-plug vs. upturned-coal-collar lithology; tested by `tests/test-batter-phys.js`) and **`BATTER`** (`BIO.kit('batteredisle')`) |
| **Settlement & Cultural Tie-In** | Island stronghold of **`Bè-tõ-pò` (*Bare-Stone Port*, `settlements/battered-port/`, `(435, 259)`, `+115 m` rim bench)** — `~5,000` Unpainted Eternian Exiles & `Farport`-creole mariners (`CROOK-RIA-DECISIONS.md` §2.1) mining the cone's upturned `coal = 201` seams, smelting `nickel = 180` olivine-laterite/gossan ore into corrosion-proof marine steel, harvesting wind-curved `wood = 255` ship-knees, and running contraband between `Farport`, `Yonni` (`Shroudhills`), `The Crook`, and `Ria Sound` |

---

## 1. Surveyed geological, bathymetric & climatic ground truth (`Scale Model 5.1`)

### 1.1 Exact raster & `geology.json` survey (`rmwetgzft4x9d`)

Directly queried via `/tmp/smodel-venv/bin/python` against `tools/scale-model/model/data/` (`h.png`, `wl.png`, `c.png`, `p.png`, `tm/tw/tc.png`, `tl/th.png`, `wd.png`, `vents.json`, `rivers.json`), `51-region-store.js`, `60-settlements.js`, and `kits/resources/data/geology.json`:

| Metric (`Scale Model 5.1`) | Surveyed Value in `rmwetgzft4x9d` (*battered isle*) | Worn Extinct Cinder-Cone & Ecological Meaning |
|---|---|---|
| **Polygon / Land / Sea Cells** | `3,327` total (`13,308 km²`) = **`1,801` land (`7,204 km²`, `54.1%`)** + **`1,526` sea (`6,104 km²`, `45.9%`)** | Single oval denuded volcanic edifice (`128 km E-W × 86 km N-S`) with a `14 km`-wide breached SSE embayment (`X = 466..480, Y = 264..268`) and indented ESE sound coves |
| **Dry Elevation (`min / p5 / p10 / p25 / p50 / p75 / p90 / p95 / max`)** | **`+6.1 / +7.0 / +8.8 / +26.0 / +115.4 / +433.8 / +646.6 / +747.8 / +868.8 m`** (summit at **`474, 248`**) | Low, broad, heavily bevelled scoria/palagonite flanks (`p50 = +115.4 m`) rising to the stubby exhumed **`+868.8 m` central volcanic plug** — down from an original `~2,200+ m` cone! |
| **Marine & Strait Bathymetry** | Polygon sea: `min = -211.6 m`, `p25 = -63.9 m`, **`p50 = -36.8 m`**; **`Shroudhills` Strait**: **`17.0 km` min width** (`495,258` to `501,264`), depths `-160.1 m` max / `-26.9 m` med | Deep WNW ocean drop-off (`-106 to -212 m`) amplifies incoming tsunamis; the `17–32 km` leeward strait to `Shroudhills` holds reef-guarded `-25 to -75 m` smuggler channels |
| **Tsunami & Wave Bearings** | **`Steaming Seamounts`**: `533.1 km` (`256.3°`) & `560.7 km` (`253.6°`), **`48–72 min`** travel; **NW Mega-Shields**: `287°–294°` WNW (`3.5–6.3 hr` Ghost Tsunamis) | WNW/WSW rim takes `35–55 m` bores directly (`trimElevM = +52..+62 m`), while the crescentic plug & cone body cast a deep wave-shadow across the ESE/SSE coves (`trimElevM = +14..+22 m`) |
| **Atmosphere, Rain & Köppen** | `P_atm = 1.60 atm` (`0 m`) to **`1.44 atm`** (`+868.8 m`), `0.75 g`; **`Am` `77.2%` (`5,560 km²`)**, **`Aw` `21.3%` (`1,532 km²` SE leeward rain-shadow)**, **`Cfa` `1.6%` (`112 km²` summit)**; rain `p5 / p50 / p95` = **`1,380 / 1,694 / 2,055 mm/yr`** (`max 2,196`); `TM = +26 °C` (`+22..+29 °C`; `TW +31 / TC +22 °C`) | Wet windward WNW spray-slopes (`1,850–2,196 mm`), slightly drier sun-warmed SE `Aw` leeward cinder-slopes (`1,333–1,550 mm`), and a cool `22 °C` fog-wrapped `Cfa` summit plug; `TL = 106` med, `TH = 127` med |
| **Hydrology & Vents** | **`0` rivers** (`rivers.json`), **`0` active vents** (`vents.json`), **`0` Ancient ruins** (`ruinBit = 0`), **`0` `defSets` pins** yet in `60-settlements.js` | Loose vesicular scoria & lapilli absorb `1,700 mm/yr` rain like a sponge (zero surface rivers!), feeding cold, mineral-filtered **basal palagonite-contact springs** around `+25..+95 m` |
| **`geology.json` Bimodal Cone-and-Collar Structure (`441` `4 km` cells)** | **`69.2% ultramafic` (`305` cells / `4,880 km²`, WNW & central cone)** + **`30.8% sedimentary` (`136` cells / `2,176 km²`, ESE/SSE upturned vent collar)** | **Exact match to an eroded cinder cone:** the WNW/central edifice exposes deep olivine-rich basaltic/ultramafic cumulates (`nickel = 180`), while the ESE/SSE margin exposes upturned, contact-metamorphosed coal-measure country rock (`coal = 201`)! |
| **Verified Resource Bytes** | **`wood = 255`** (`441/441` c), **`water = 255`** (`441/441` c), **`nickel = 180`** (`305` c `>= 80`), **`coal = 201` max** (`136` c `> 0`, `112` c `>= 80`, peak at `494, 250`), **`stone = 244` max** (`416` c `>= 80`), **`clay = 255` max** (`84` c `>= 80`), `oil = 78` max (`484, 258`), `iron = 40` (`136` c) | Supplies `Bè-tõ-pò` with **natural low-sulfur coking coal (`coal = 201`)**, **garnierite/laterite nickel ore (`nickel = 180`)**, **storm-curved iron-dense ship timber (`wood = 255`)**, **hydraulic palagonite pozzolan (`clay = 255`)**, and **tarry coal-seep pitch (`oil = 78`)** for hull caulking! |

### 1.2 Worn cinder-cone & asymmetric tsunami physics (`BATTER_PHYS`, `[G data]`)

Authored in `src/40-biome-batter-phys.js` (zero `THREE`, zero `DOM`, integer-seeded via `KRAND`, verified by `tests/test-batter-phys.js`):

1. **`BATTER_PHYS.cinderConeAt({px, py, localX, localZ, elevM, distPlugKm, azDeg}) -> {lithology, scoriaDepthM, palagonite01, dikeRib01, plugColumnar01, coalCollarByte, gullyDepthM}`**
   - Models the **very, very worn extinct cinder cone**: loose unwelded scoria (`scoriaDepthM`) is stripped to `0 m` below the tsunami trimline and along high summit crests, surviving only in mid-slope pockets (`0.5–4.5 m` oxidized red-black vesicular gravel) over cemented yellow-ochre **palagonite hydrovolcanic tuff (`palagonite01`)**.
   - **Exhumed Radial Feeder Dikes (`dikeRib01`):** `18` deterministic radial vertical basaltic-olivine dikes (`1.8–6.5 m` wide, striking outward from `(474, 248)` and parasitic vents) stand `3–18 m` proud of eroded cinder gullies onshore and project `80–450 m` into the sea as **wave-piercing sea-stacks and cove-mouth reef jaws** (`KSTACKS`).
   - **Upturned Contact-Baked Coal Collar (`coalCollarByte`):** In the southeastern `sedimentary` sector (`azDeg` `95°–195°` from the plug), country-rock sandstone, shale, and `0.6–2.2 m` **`coal = 201`** seams dip `28°–52°` *outward* away from the volcanic neck, thermally devolatilized at dike contacts into clean-burning natural coke and sweating viscous **`oil = 78` bitumen** used by exile shipwrights.
2. **`BATTER_PHYS.tsunamiShadowAt({azFromCenterDeg, coastSlope, shoalDepthM, tier}) -> {exposedWNW, boreCrestM, trimElevM, boulderMaxM, drawdownM}`**
   - Captures the island's dramatic **two-face exposure**: along WNW/WSW bearings (`215°–335°`), unrefracted `Steaming Seamounts` and `Farside Shield` swells steepen over `-120 -> -10 m` basalt ramps into `38–55 m` Tier-3 run-up (`trimElevM = 52.0–62.0 m`, hurling `2–5 m` rounded olivine-basalt boulders onto `+35 m` ledges). Diffraction around the `128 km` island body attenuates waves entering the ESE/SSE sound (`75°–185°`) by `68–82%`, dropping `trimElevM` to **`+14.0–22.0 m`** inside leeward breached-crater coves (`Stations 1, 3`).
3. **`BATTER_PHYS.blowholeAt({dikeRib01, palagonite01, elevM, coastDistM, waveEnergy, swellPhase}) -> {active, tubeRadiusM, jetHeightM, airVelMs, sprayMist01, boomHz}`**
   - Where ocean surf hammers a fractured contact between a vertical basaltic feeder-dike (`dikeRib01 > 0.6`) and softer overlying palagonite tuff (`+4 <= elevM <= +28 m`, `coastDistM < 65 m` on `Station 2`), `KCAVERN`/`KSPELEO` excavates an L-shaped **wave-compression sea-cave & vertical chimney (`tubeRadiusM = 0.9–2.8 m`)**. Each `1.60 atm` roller compresses trapped air like a pneumatic piston, firing **`12–34 m` salt-spray geysers** (`jetHeightM` boosted `1.33×` by `0.75 g`) with a `28–55 Hz` bass cannon-boom audible `8 km` inland!
4. **`BATTER_PHYS.springLineAt({elevM, scoriaDepthM, palagonite01, upslopeCatchKm2}) -> {seepFlowLs, moisture01, fernPocket01}`**
   - Explains how a **riverless cinder island (`0` `rivers.json` lines)** sustains **`wood = 255` forest and `5,000` townsfolk**: rainwater percolates instantaneously through porous upper scoria (`k ≈ 10^-2 m/s`) until hitting consolidated palagonite tuff aquitards (`k ≈ 10^-7 m/s`), emerging at `+25..+110 m` cliff-niches as crystal-clear freshwater spring curtains (`WATER.flow`).

---

## 2. Ecological zones across the worn cinder cone

| Zone Key | Elev & Exposure | Substrate (`KSTRATA` / `KGROUND`) | Dominant Biota & Geomorphic Signature |
|---|---|---|---|
| **`1. dikerampart`** (*WNW Tsunami-Planed Bench, Dike-Stacks & Blowholes*) | `0 .. +58 m` WNW/WSW (`< trimElevM`, `1.60 atm`) | Bevelled black olivine-basalt benches, red oxidized scoria pockets, vertical feeder-dike walls & sea-stacks | Zero trees! Wave-scoured **`cinderbarren`** crustose lichens, salt-blasted **`scoriathrift`** cushions in dike crevices, crimson `stormwrack` swash lines, and booming **blowhole chimneys** |
| **`2. cinderbarren`** (*Gullied Red-Black Scoria & Laterite Aprons*) | `+35 .. +380 m` wind-exposed outer flanks (`ultramafic`, `Ni = 180`) | Loose black-and-rust vesicular scoria gravel (`KSCOUR` rills) + green-streaked nickel-laterite saprolite | Open wind-pruned **`nickelmyrtle`** (`1.5–3.5 m` copper-teal metallophyte scrub), **`cindersedge`** tussocks binding loose lapilli, and radiating bare **`2–5 m` welded-spatter hogback ribs** |
| **`3. craterwood`** (*Salt-Sheared Palagonite Bowl & Lee-Slope Forest*) | **`+58 .. +680 m`** WNW (`>= trimElevM`) & **`+18 .. +680 m`** ESE leeward (`wood = 255`) | Moisture-retentive yellow-tan **palagonite ash loam** (`clay = 255`) & sheltered scoria gullies | Dense, canopy-interlocked **`batteredlaurel`** & **`ironkneepodocarp`** (`12–28 m`, sculpted into smooth aerodynamic `30°` wind-wedges on ridges, yielding natural curved `wood = 255` ship-frames!) over basal spring-fern grottos |
| **`4. plugcrown`** (*Exhumed `+868.8 m` Olivine-Basalt Neck & Mist-Spine*) | `+650 .. +868.8 m` (`1.44–1.47 atm`, `Cfa` `+22 °C` cloud cap) | Hexagonal/platy **columnar olivine-basalt plug** (`474, 248`) & mossy agglutinate crags | Gnarled, fog-dripping dwarf `batteredlaurel`, **`plugmoss`** cushions (strictly Earthlike bryophytes/ferns — zero `Shroudhills` giant ant-galls!), and soaring **`stackpetrel`** summit burrows |
| **`5. coalarch`** (*ESE Leeward Sea-Arch Coves, Kelp Sound & Coal Collar*) | `-28 .. +45 m` ESE/SSE sound (`sedimentary`, `coal = 201`, `oil = 78`) | Yellow palagonite tuff **sea-arches**, tilted black **`coal = 201` seams**, tarry `oil = 78` seeps & cobble pocket beaches | Calm emerald sound anchored by submarine **`soundkelp`** beds (`y <= -0.5 m`), guano-white rookery ledges, salt-tolerant **`covepandan`**, and hidden smuggler careening caves |

---

## 3. Station catalogue (`4` verified Scale-Model `5.1` dry-land sites)

Every station `(px, py)` lies **strictly inside `rmwetgzft4x9d` on verified dry land (`WF === False`)**, with `sky = (px - 272, py - 330)` and compliant preset view names (zero `'` and zero `:`, survey item 30):

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | Elev, `10 km` Relief & `P_atm` | Climate, Rain & `T` (`w/c`) | `KSTRATA` & `geology.json` | Core Geomorphic & Ecological Signature |
|---|---|---|---|---|---|---|
| **1** | **`portcove`** *(main)* `dist/batteredisle.html` | **`(438, 258)`** `(+166, -72)` *(frames `435,259` `+10.6 m` shore & `441,258` `+115 m` port rim!)* | **`+39.5 m`** bench (`-52.6..+188.1 m` in `10 km`), **`1.59 atm`** | `Am`, **`1,788 mm`**, **`+28 °C`** (`+32/+23`) | `worn-scoria-palagonite` + radial basalt dikes; `ultramafic = 255`, **`nickel = 180`**, `wood = 255` | **Breached Parasitic Scoria Cove, Basal Tuff Springs & Exile Port Rim Overlook:** Crescentic red-black cinder/palagonite rim (`+115 m` `site:battered-port-rim` reserve) dropping past freshwater tuff-contact springs into a reef-jawed smuggler cove & sea-cave vault adjacent to `(435, 259)` |
| **2** | **`rampart`** `--station rampart` `dist/batteredisle-rampart.html` | **`(444, 244)`** `(+172, -86)` *(WNW oceanward cone flank)* | **`+13.8 m`** bench (`-106.3..+257.7 m` in `10 km`), **`1.60 atm`** | `Am`, **`1,898 mm`**, **`+27 °C`** (`+32/+23`) | `worn-scoria-palagonite` cut by `feeder-dike-basalt`; `ultramafic = 255`, **`nickel = 180`** | **WNW Megatsunami Rampart, Blowhole Sea-Caves & Exhumed Radial-Dike Sea-Stacks:** Wave-planed `+6..+48 m` basalt/scoria benches, offshore vertical dike-wall stacks (`KSTACKS`), booming `25 m` **blowhole spray-geysers** (`KCAVERN`), boulder ridges, and razor-sharp **`+58 m` forest trimline** |
| **3** | **`archcove`** `--station archcove` `dist/batteredisle-archcove.html` | **`(494, 250)`** `(+222, -80)` *(ESE strait cove; `17 km` from `Shroudhills`)* | **`+9.7 m`** bench (`-11.0..+185.0 m` in `10 km`), **`1.60 atm`** | `Am`, **`1,741 mm`**, **`+27 °C`** (`+32/+23`) | `upturned-coal-collar` + palagonite tuff; `sedimentary`, **`coal = 201` (island max!)**, `iron = 40`, `wood = 255` | **ESE Leeward Smuggler Sound, Palagonite Sea-Arches & `coal = 201` Vent-Collar Cove:** Mist-shrouded tidal narrows facing `Shroudhills` (`KFAR` silhouette across the `17 km` strait), double palagonite sea-arches (`KCARVE`), exposed `40°`-dipping jet-black **`coal = 201`** & `oil = 78` tar seams, submarine kelp anchorage, and seabird rookeries |
| **4** | **`plugcrest`** `--station plugcrest` `dist/batteredisle-plugcrest.html` | **`(474, 248)`** `(+202, -82)` *(exact `+868.8 m` island summit!)* | **`+868.8 m`** crag (`+379.6..+868.8 m` in `10 km`), **`1.44 atm`** | **`Cfa`**, **`1,616 mm`** + fog, **`+22 °C`** (`+27/+17`) | `olivine-plug-basalt` + welded spatter ribs; `ultramafic = 255`, **`nickel = 180`**, `stone = 129`, `wood = 255` | **Exhumed Central Olivine-Basalt Volcanic Neck & Wind-Sheared Cloud-Cinder Spine:** Denuded columnar volcanic plug rising out of gullied red-black scoria bowls, radiating welded-spatter & feeder-dike hogbacks, `nickel = 180` garnierite veins, and aerodynamic salt-sheared `wood = 255` cloud-laurel forest |

### 3.1 Station 1 (`portcove`, main page `dist/batteredisle.html`): Breached Scoria Rim, Tuff Springs & `(435, 259)` Port Overlook — `(438, 258)`
- **Site & Scale-Model Tie (`5.6 × 5.6 km`):** Centered at `(438, 258)` (`+39.5 m`), spanning the exact `6 km` coastal gradient between the **`(435, 259)` WSW shore pin (`+10.6 m`, `-63 m` offshore drop)** and the **`+110–128 m` crescentic cinder-rim bluff (`441–442, 258–259`)** where **`Bè-tõ-pò`** (`settlements/battered-port/`) stands.
- **Geomorphology & Strata (`<= 5` `KGROUND` layers):** Layered yellow-tan consolidated **palagonite tuff** overlain by gullied dark-red/black **oxidized scoria**, pinned together by two resistant **radial basaltic feeder-dike jaws** that enclose a sheltered `-24 m` emerald pocket lagoon and a wave-cut **subterranean palagonite sea-cave (`KCAVERN` + `KSPELEO`)**. Along the `+42 m` tuff contact, three clear freshwater spring ribbons (`WATER.flow`) cascade through tree-fern and `tuffcress` grottos into the cove.
- **Reserves & `?works=0` Props:** Registers `site:battered-port-rim` (`+95..+122 m` crescentic bluff) and `site:seamount-beacon` (`+128 m` dike crag facing `255°` WSW toward `Steaming Seamounts`). Under `?works=0`, places chiselled unmasked basalt leading-cairns and a freshwater spring-barrel cooperage landing (`class: 'furniture'`).
- **Preset views:** `overview`, `breached-cove-jaws`, `palagonite-sea-cave`, `tuff-spring-grotto`, `exile-rim-overlook`, `dike-reef-throat`.

### 3.2 Station 2 (`rampart`, `dist/batteredisle-rampart.html`): WNW Blowhole Rampart & Radial-Dike Stacks — `(444, 244)`
- **Site & Framing (`5.6 × 5.6 km`):** Anchored on the open WNW tsunami face (`+13.8 m`, `10 km` relief `-106.3 to +257.7 m`). Heavy `1.60 atm` ocean swells roll across wave-bevelled `+6 to +48 m` dark basalt/scoria benches.
- **Signature Features:** Four **exhumed radial feeder-dike sea-stacks (`KSTACKS`, `22–54 m` tall)** march seaward like ruined breakwaters where the surrounding loose cinder apron eroded away. Along the dike-tuff contacts, three active **blowhole sea-caves (`BATTER_PHYS.blowholeAt`)** thunder rhythmically, firing `18–30 m` white spray plumes (`ATMOS` particles) and booming at `38 Hz`. Above the imbricated olivine-basalt boulder ridge (`+36 m`), the **`+58 m` megatsunami trimline** cuts like a knife between salt-scoured `scoriathrift` rock below and `35°`-wind-wedged `batteredlaurel` forest above!
- **Interactive Host Toggle (`[Calm] / [Gale] / [Tsunami Drawdown]`):** `Gale` doubles blowhole jet height (`32 m`); `Tsunami Drawdown` drops sea level `-12 m`, exposing the submerged feeder-dike wall roots and silencing the blowholes into an eerie sucking roar.
- **Preset views:** `overview`, `blowhole-eruption`, `radial-dike-stacks`, `megatsunami-trimline`, `boulder-ridge-bench`, `scoria-gully-scarp`.

### 3.3 Station 3 (`archcove`, `dist/batteredisle-archcove.html`): ESE Leeward Sea-Arch Cove & `coal = 201` Collar — `(494, 250)`
- **Site & Framing (`5.2 × 5.2 km`):** Set at the island's peak **`coal = 201`** cell (`494, 250`, `+9.7 m`, `10 km` relief `-11.0 to +185.0 m`), looking east across the **`17.0 km` mist-veiled strait** toward the forested granite tors of **`Shroudhills`** (`KFAR` `16 km` horizon). *(Also serves as the geological template for the `14 km` SSE breached-crater bay at `474, 263`, `coal = 185`.)*
- **Signature Features:** Twin **palagonite-and-sandstone sea-arches (`KCARVE`, `18–26 m` span)** frame a glassy `-14 m` leeward smuggler anchorage carpeted in submarine **`soundkelp`**. In the cove's `42°`-tilted sedimentary collar cliffs, three glistening `1.4 m` **contact-coked `coal = 201` seams** and viscous **`oil = 78` bitumen seeps** crop out directly at boat-loading height, topped by guano-frosted `cormorant` & `stackpetrel` ledges and lush `wood = 255` `ironkneepodocarp` slopes sheltered from WNW bores (`trimElevM = +16 m`). `?works=0` places a hand-cut smuggler coal-bunkering bench and veiled signal-lantern niche (`class: 'furniture'`).
- **Preset views:** `overview`, `double-palagonite-arch`, `upturned-coal-seam`, `kelp-smuggler-roadstead`, `shroudhills-strait-mist`, `rookery-ledge`.

### 3.4 Station 4 (`plugcrest`, `dist/batteredisle-plugcrest.html`): `+868.8 m` Exhumed Volcanic Plug & Cloud-Cinder Spine — `(474, 248)`
- **Site & Framing (`5.2 × 5.2 km`):** Crowned by the island's **`+868.8 m` `Cfa` summit crag** (`1.44 atm`, `+22 °C`), where millions of years of rainwash stripped the upper cinder cone completely away to expose the **solid `380 m`-wide hexagonal-jointed olivine-basalt & peridotite-xenolith volcanic neck**.
- **Signature Features:** Five **welded-spatter and radial feeder-dike hogback ribs** (`KRELIEF`) radiate outward from the central plug across deeply incised red-and-black cinder gullies (`KSCOUR`) and green-weathered **`nickel = 180` garnierite/olivine veins**. Between the rocky ribs, moisture-holding yellow palagonite bowls support ancient, moss-bearded **`batteredlaurel` and `ironkneepodocarp` cloud-forest** whose crowns are sheared into continuous `25°–35°` streamlined wind-canopies over `plugfern` carpets.
- **Preset views:** `overview`, `olivine-plug-columns`, `radial-dike-hogback`, `sheared-cloud-canopy`, `red-scoria-badland-gully`, `garnierite-vein-cut`.

---

## 4. Species roster (`src/50-biome-batter-species.js`), guardrails & `kits/crops`

Every species carries full `README.md` botany tags (`climate`, `aridity`, `abyssal: false`, `riparian`, `koppen: ['Am', 'Aw', 'Cfa']`, `HV(wood, edible, medicinal, note)` verified by `tools/check_botany.py`):

| Key | Name & Clade | Zone & Substrate | Height & `3D` Builder | Worn Cinder-Cone Adaptation & `HV` Tag |
|---|---|---|---|---|
| **`batteredlaurel`** | **Salt-Wedge Crater Laurel** (*Beilschmiedia / Machilus cuneata*) | `craterwood`, `plugcrown` (`>= trimElevM` WNW, `>= +18 m` ESE; palagonite loam) | `10–24 m` broad-buttressed evergreen hardwood (`BIO.flareJoin`) with glossy salt-waxy dark leaves; `39-core-lean.js` shears exposed stands into `30°` aerodynamic wedges | Roots lock fractured scoria over palagonite water-tables; interlocking canopy deflects `1.60 atm` gales. `HV('timber, fuel', ['laurel drupe'], false, 'Dense salt-cured framing timber and charcoal wood (wood = 255).')` |
| **`ironkneepodocarp`** | **Dike-Clasp Ship-Podocarp** (*Podocarpus / Metrosideros nautica*) | `craterwood`, `coalarch` (`+22..+720 m` dike ribs & cove bluffs) | `14–28 m` gnarled conifer-myrtle hybrid with natural J-curved wind-bent boughs and flattened roots clasping vertical basalt dikes | Grown under relentless WNW wind-load so its reaction-wood boughs cure into **pre-bent ship ribs, stems, and cliff-hoist knees** without steam-bending! `HV('ship-knees, timber', [], false, 'Premier borer-resistant curved hull frames for Bè-tõ-pò smuggler luggers.')` |
| **`nickelmyrtle`** | **Garnierite Cinder-Scrub** (*Pycnandra / Kunzea scoriae*, Earthly metallophyte) | `cinderbarren`, `plugcrown` (`ultramafic = 255`, `Ni = 180` red-black scoria) | `1.2–3.4 m` springy multi-stem shrub with coppery-olive twigs, glaucous blue-green leaves, and pale-green nickel-oxalate bark plates | Hyperaccumulates `8–14% Ni` on porous olivine-scoria slopes; prospectors trace dense stands to locate rich garnierite-laterite pockets beneath cinder ash. `HV('fuel', [], true, 'Calcined ash enriches nickel-steel crucible charges; astringent leaf-tar.')` (`gather: 'nickel-ash'`) |
| **`scoriathrift`** | **Blowhole Basalt-Cushion** (*Armeria / Colobanthus basaltica*) | `dikerampart` (`+4..+58 m` tsunami-scoured benches & dike cracks) | `0.15–0.55 m` rock-hard hemispherical emerald-and-russet cushion domes studded with salt-excreting pink/white capitula | Survives `50 m` megatsunami over-wash via `3 m` taproots wedged into columnar basalt joints and waxy air-trapping leaf-rosettes. `HV('none', ['scoria-samphire shoot'], true, 'Pickled antiscorbutic sea-greens for blockade-runner crews.')` (`gather: 'sea-greens'`) |
| **`cindersedge`** | **Red-Lapilli Tussock** (*Poa / Carex pyroclastica*) | `cinderbarren`, `dikerampart` (`+18..+650 m` loose scoria gullies) | `0.5–1.3 m` bronze-ochre silica-edged tussock grass with `2 m` fibrous cinder-netting root mats | Arrests rill erosion on `30°` loose red-black cinder slopes (`KSCOUR`); dried blades thatch cliffside goat-pens. `HV('thatch, fodder', [], false, 'Tough salt-hay thatch and pack-goat forage.')` |
| **`covepandan`** | **Sea-Arch Screw-Palm** (*Pandanus / Freycinetia archipelagica*) | `coalarch` (`+3..+45 m` sheltered ESE tuff coves & coal ledges) | `3.5–8.5 m` stilt-rooted coastal screw-pine with spiralled sword-leaves | Thrives in tsunami-shadowed ESE coves (`trimElevM <= +18 m`); absent on WNW `dikerampart`! `HV('weaving, cordage', ['pandan key'], false, 'Braided salt-proof sail-matting and cargo-hoist fenders.')` (`crop: 'pandan'`) |
| **`tuffcress`** | **Palagonite Spring-Fern & Cress Mat** (*Blechnum / Nasturtium palagoniticum*) | Basal tuff-contact spring niches (`+20..+120 m`, `BATTER_PHYS.springLineAt`) | `0.35–1.1 m` lush emerald hanging fern-and-watercress curtains | Marks every potable freshwater aquitard seep on a riverless island! `HV('none', ['spring cress', 'fiddlehead'], true, 'Crisp peppery cress harvested daily beside Bè-tõ-pò cisterns.')` (`gather: 'spring-cress'`) |
| **`soundkelp`** | **Smuggler-Sound Canopy Kelp** (*Ecklonia / Macrocystis fretensis*) | `coalarch` submarine shoals (`-26..-0.5 m`, strictly underwater!) | `3.0–15.0 m` golden-brown buoyed kelp forests streaming in `17 km` strait currents | Dampens chop inside breached coves and masks submerged radial-dike reefs to pilots who know its canopy lanes. `HV('fertiliser', ['kelp frond'], true, 'Manures walled cinder-terraces and burns to potash-soda ash.')` (`crop: 'kelp'`) |

### 4.1 Explicit cross-biome non-duplication guardrails
1. **Against `biomes/shroudhills` (`17 km` ESE across the strait):** The `17 km` salt strait is an **absolute biogeographical barrier** to flightless/short-nuptial `Myrmecodia` drum-galls and cat-sized **Shroud-Ants (*Khrōma-Mīra*)**! `Battered Isle` has **`0` `Sister-Cup` sky-ponds, `0` `Root-Hammocks`, and `0` giant Shroud-Ants** — which is precisely why `5,000` Eternian exiles can fell timber and build freely here without being overrun by territorial canopy ants!
2. **Against `biomes/drownlands` & `biomes/arch`:** Zero intertidal `pH 11` `brucitestack` carbonate chimneys, zero `verdigrismangrove` intertidal stilt-trees, and zero `pH 2` acid-alkaline `curtain` vents (`Battered Isle` is an **extinct `+869 m` subaerial eroded cinder-cone**, not an `80%`-submerged `p50 = +24 m` serpentinite skerry shoal).
3. **Against `biomes/farside` & `biomes/crook`:** Zero terrestrial `landkelp` forests, `spraycoral` terraces, or terrestrial `chimneysponge` crusts; `soundkelp` is `100%` submarine (`y <= -0.5 m`).

### 4.2 `kits/crops` registration (`CROPS.BIOMES.batteredisle`)

```js
batteredisle: {
  atm: 2,   /* 1.44-1.60 atm warm maritime monsoon across eroded cinder slopes & sheltered coves */
  zones: {
    rampart:     {warmth: [4, 4], arid: [3, 4], wet: true, salt: true}, /* WNW spray bench & intertidal wrack */
    leecove:     {warmth: [4, 4], arid: [3, 4], salt: true},            /* ESE/SSE tsunami-shadowed coves & coal benches */
    cinderslope: {warmth: [3, 4], arid: [2, 3]},                        /* free-draining Aw/Am scoria & palagonite terraces */
    plugcrest:   {warmth: [3, 3], arid: [3, 4], atm: 1}                 /* +650..+869 m Cfa cloud-wrapped summit neck */
  }
}
```
- **Verified `CROPS.forBiome('batteredisle', {works: ['cellar'], nodes: ['coal', 'iron']})` Palette:**
  - *Rain-fed / wrack-manured cinder-terraces (`cinderslope`, `leecove`):* **`sweet-potato`**, **`taro`** (in spring-fed palagonite pockets), **`yam`**, **`pigeon-pea`**, **`sesame`**, **`cabbage`/brassica greens**, **`ginger`**, **`chili`**, **`pandan`**, **`tea`** (on misty `+400–750 m` `plugcrest`/`cinderslope` benches — giving the Eternian exiles their beloved leaf-infusion without mainland imports!), and **`hemp`/`ramie` sail-fibre**.
  - *Marine & strand (`rampart`, `leecove`):* **`kelp`**, **`wineweed`**, **`sea-lettuce`**, **`tidewort`**.
  - *Dark sea-cave & tuff-cellar crops (`works: ['cellar']`):* **`alecap`** and **`pale-fungi`** grown inside damp, mined-out palagonite tuff adits!

---

## 5. Fauna (`kits/fauna` `[G data]` records)

| Key (`kits/fauna`) | Name & Clade | Scale | Worn Cinder-Cone Niche & Exile Port Tie | Yields & 24h Schedule |
|---|---|---|---|---|
| **`stackpetrel`** | **Scoria-Burrow Storm-Petrel** (pelagic burrow-nesting seabird) | `0.42 m` (`1.05 m` span) | Excavates `1.5 m` nesting tunnels into soft upper red-scoria & palagonite banks (`Stations 1, 4`) above the `+58 m` trimline; night-returning cries guide smuggler luggers home in fog | `eggs`, `petrel-oil` (lamp fuel), `guano` (`saltpeter` supplement). `05–19` `FORAGE_SEA`, `19–05` `BURROW_RIM` |
| **`dikechiton`** | **Basalt-Prow Giant Chiton** (armoured intertidal mollusc) | `0.32 m` | Grips wave-hammered WNW `dikerampart` basalt benches (`Station 2`) with `0.75 g`-oversized magnetite-toothed radulae and eight overlapping slate-black shell plates | `chiton-meat`, `radula-grit`. `00–12` `CLING_BENCH`, `12–24` `GRAZE_CORALLINE` |
| **`archcormorant`** | **Sound-Arch Shag** (diving coastal bird) | `0.85 m` | Crowds guano-whitened ledges on `Station 3` palagonite sea-arches; dives `-18 m` through `soundkelp` lanes for herring and squid | `guano`, `feathers`, `meat`. `06–17` `DIVE_KELP`, `17–06` `ROOST_ARCH` |
| **`cindergecko`** | **Garnierite Crag-Skink** (viviparous volcanic lizard) | `0.38 m` | Basks on warm black welded-spatter ribs (`Stations 1, 4`), camouflaged in mottled charcoal-red and copper-green scales; hunts sea-slaters and moths | `pest-control` (`aggression: 0`). `07–18` `BASK_DIKE`, `18–07` `CREVICE_SLEEP` |
| **`soundseal`** | **Kelp-Cove Eared Seal** (pinniped) | `2.1 m` | Hauls out inside wave-shadowed ESE sea-arch caves (`Station 3`) and offshore dike-stack ledges prior to WNW storm-swells | `seal-oil`, `waterproof-hide`, `meat`. `06–15` `HUNT_STRAIT`, `15–06` `HAUL_CAVE` |
| **`feralcliffgoat`** | **Farside Escape Crag-Goat** (introduced caprine, `?works=0` / wild) | `0.85 m` shoulder | Descended from Eternian `Farside` wrack-grazing stock released by early exiles; scrambles `45°` feeder-dike ledges browsing `cindersedge` and beachcast `stormwrack` | `milk`, `chevon`, `goat-horn`, `hide`. `05–11` `GRAZE_WRACK`, `11–16` `SHADE_TUFF`, `16–05` `ROOST_DIKE` |

---

## 6. Resources, workshop closure (`Ruling #1`), hazards & sampler budget

### 6.1 `kits/resources` & `CONTINENTAL-SCOPE.md` Ruling #1 input-output closure

| Good / Node (`5.1` Byte) | Source on `Battered Isle` | `[LOCAL]` Island / Exile Port Use | `[TRADED]` Smuggler Ring Export |
|---|---|---|---|
| **`coal = 201` (Natural Coke)** | `136` SE `sedimentary` collar cells (`112` `>= 80`; peak `201` at `Station 3`) | Crucible steel-smelting, lime/pozzolan calcining, bathhouse & drying-kiln fuel | Traded to `Yonni` Spear-Queen smiths (`Shroudhills`) & `Farport` night-coasters |
| **`nickel = 180` + `iron = 40`** | `305` `ultramafic` scoria/plug cells (`Ni = 180`) + SE ironstone (`Fe = 40`) | **Corrosion-proof Nickel-Steel & Cupronickel** cliff-hoist chains, sea-boom links, bolts & anchors | High-margin rustproof **Bare-Stone Blades, Spear-Sockets & Marine Hardware** sold to `Yonni` & `Ria` |
| **`wood = 255` (Curved Knees)** | `441/441` cells (`ironkneepodocarp` & `batteredlaurel` above trimline) | Smuggler lugger hulls, cliff-hoist cradles, sea-gallery cantilevers & charcoal | Repaired hulls & spare spars for storm-battered strait runners |
| **`clay = 255` + `stone = 244`** | Yellow palagonite tuff (`clay = 255` natural Roman-style hydraulic pozzolan!) + basalt/scoria | **Salt-water-setting Hydraulic Pozzolan Mortar** (palagonite ash + shell/coral lime) & dark scoria plinths | Ballast block & firebrick linings |
| **`oil = 78` (Coal-Tar Pitch)** | Contact-heated SE coal-collar tar seeps (`484, 258`) + `soundkelp` potash | Hull paying/caulking pitch & rope waterproofing (`Ruling #1` naval upkeep closed 100% on-island!) | Waterproof tarred canvas & cordage |

### 6.2 Data-driven hazards (`core/hazard`, `KHAZ`) & 4-layer procedural audio
- **`batteredisle:blowhole` (`blast` / `spray` on `Station 2`):** `r = 6 m` orifice zones along dike-tuff benches firing upward `20–35 m/s` compressed air/water jets every `9–14 s` wave period; audible `38 Hz` warning boom `1.2 s` before eruption.
- **`batteredisle:tsunamibench` (`flood` on `Station 2` `< +58 m`, `Stations 1, 3` `< +18 m`):** Triggered under `[Tsunami Drawdown]` preview mode; demonstrates why `Bè-tõ-pò`'s permanent wards sit safely at `+85..+138 m`.
- **`batteredisle:dikereef` (`crush` / `snag` on `Stations 1–3`):** Submerged vertical basalt feeder-dike blades extending offshore from coastal ribs — lethal to deep-draft Eternal State revenue junks, navigable through charted `soundkelp` gaps by local creole pilots.
- **4-Layer Ambient Audio (`STATIONS-AMBIENT-AUDIO.md`):** (1) Heavy `1.60 atm` WNW basalt surf & rhythmic **blowhole pneumatic cannon-booms** (`Station 2`) vs. hollow sea-cave slap (`Stations 1, 3`); (2) High-velocity ridge-wind whistling across sharp radial dike fins (`Station 4`); (3) Nocturnal `stackpetrel` chattering & `archcormorant` cove calls; (4) Crunch of loose vesicular scoria underfoot & trickle of basal palagonite spring-curtains.

### 6.3 Material & sampler budget (`< 15` samplers, `KSHADOW` off at load)
- **Sampler budget:** `KGROUND` (`<= 5` layers: `4–5` samplers) + `KSTRATA` (`2`) + `ATMOS` (`2–3`) + `KHORIZON` (`1`) + `KSHADOW` (`1` when `?shadow=1`) = **`10–12` active samplers (`< 15` hard ceiling)**.
- **Reused library materials (`materials.json`):** `rock.volcanic.scoria` / `rock.basalt` (columnar plug & radial dikes), `ground.volcanic_ash` / `ground.gravel042` (red-black lapilli), `rock.tuff` / `rock.sandstone.buff` (yellow-tan palagonite tuff), `rock.coal` (upturned `coal = 201` seams), `ground.laterite` / `rock.gossan` (`Ni = 180` garnierite crusts), `ground.moss`, `bark.gnarled`, `card.broadleaf`, `card.fern`, `card.seaweed`.
- **Three optional polish slots for `core/materials/PROMPTS-NEEDED.md` (library stand-ins ship immediately):**
  1. `rock.tuff.palagonite` — stratified yellow-ochre and olive-tan consolidated hydrovolcanic tuff studded with black basaltic lapilli clasts.
  2. `ground.scoria.oxidized` — coarse brick-red and charcoal-black vesicular cinder gravel with rain-sorted rill texture.
  3. `rock.coal.baked` — glossy contact-coked prismatic coal seam interlaced with buff sandstone partings and iridescent tar film.

---

## 7. Numbered `src/` architecture, rollout & verification invariants

### 7.1 Fragment map & `PORT.md` tags

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `buildlib.CORE_BIOME_MIN` + `31j, 32, 33, 35, 39, 41..44`, `KDRAWN`, `KRAND`, `KTAGS`, `KSPACE`, `KCOAST`, `KSTRATA`, `KCARVE`, `KSTACKS`, `KRELIEF`, `KCAVERN`, `KSPELEO`, `KSCOUR`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER`, `ATMOS`, `CROPS` |
| `40-biome-batter-phys.js` | **`[G data]`** | `BATTER_PHYS`: `cinderConeAt`, `tsunamiShadowAt`, `blowholeAt`, `springLineAt` (zero `THREE`/DOM) |
| `41-biome-batter-sites.js` | **`[G data]`** | `BATTER_SITES`: surveyed `5.1` pixels `(438,258)`, `(444,244)`, `(494,250)`, `(474,248)`, sky offsets, `KSTRATA` worn-cone columns, radial dike tables & `site:*` reserves |
| `45-host-stage.js` | `[web]` | Renderer, eroded cinder-cone + dike-rib + sea-arch + blowhole terrain (`KCOAST` + `KRELIEF` + `KCARVE` + `KSTACKS` + `KCAVERN`), `KDRAWN.add`, `BIO.init({tags:'batteredisle'})` |
| `47a..47b` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `biomes/arch` (`ultramafic` scrub) & `biomes/farside` (`stormwrack` / `wineweed` intertidal wrack), read in place |
| `50-biome-batter-species.js` | `[G partial]` | `BATTER.SPECIES` (`8` own species), `HV` botany tags, `39-core-lean` aerodynamic wind-sheared crowns, curved `ironkneepodocarp` boughs |
| `60-biome-batter-place.js` | **`[G data]`** | Deterministic `KRAND.cell` placement gated by `BATTER_PHYS` (`trimElevM`, dike keep-out, basal spring lines), `KSPACE`, `CROPS`, and `KTAGS` |
| `84-host-ground.js` | `[web]` | `KGROUND` (`<= 5` layers), `KSTRATA` scoria/palagonite/plug/coal-collar shading, `KCAVERN.cutLayer`, `KFAR` (`16 km`, w/ `Shroudhills` strait horizon on `archcove`), `KHORIZON` |
| `86-host-works.js` | `[web]` | `site:battered-port-rim` & `site:seamount-beacon` reserves + `?works=0` unmasked basalt leading-marks, spring-cask landing & coal-bunkering cut (`class: 'furniture'`) |
| `89a-host-atmos.js` & `89w-host-water.js` | `[web]` | `ATMOS.bindHost` (`1.44–1.60 atm` sky, rhythmic blowhole spray plumes, strait fog), `WATER.open` / `still` / `flow` (tuff springs) + `farbed` |
| `99-host-take.js` | `[web]` | `KHOST.take`: compliant preset views, `[Calm] / [Gale] / [Tsunami Drawdown]` toggle, inspector tags, `hostChecks()` |

### 7.2 Rollout phases (`BI0–BI4`) & `verify.py --assert` invariants (`T.ok` + `T.neg`)
- **`BI0–BI1`:** Register `"biomes/batteredisle"` in `tools/checks_optin.json`; implement `40-biome-batter-phys.js` & `41-biome-batter-sites.js` (`[G data]`) and pass `node biomes/batteredisle/tests/test-batter-phys.js` (`tools/ktest.js`).
- **`BI2–BI3`:** Build `portcove` (`dist/batteredisle.html`), `rampart`, `archcove`, and `plugcrest` via `buildlib.through_tools_build(__file__)` + `build_sources.report()`; wire `verify.py` directly onto `tools/harness.py` (`checks=harness.SURVEY`, zero pasted launcher).
- **`BI4`:** Register `CROPS.BIOMES.batteredisle` (`test-crops.js`) and `kits/fauna` records; pass `check_core_use.py`, `check_botany.py`, and `python3 tools/test_all.py`.
- **Hard `--assert` Invariants (`T.ok` + `T.neg`):**
  1. **Asymmetric Megatsunami Trimline:** On `Station 2 rampart` (WNW `255°–295°`), `batteredlaurel` and `ironkneepodocarp` place **strictly at `elevM >= 56.0 m`** (`T.neg`: `0` trees below `+52 m`); on leeward `Stations 1, 3` (ESE/SSE wave-shadow), canopy trees descend cleanly to **`+18.0 m`** (`T.ok`).
  2. **Bimodal Cone-and-Collar Lithology:** `nickelmyrtle` (`Ni = 180`) places only on `ultramafic` scoria/plug substrates (`Stations 1, 2, 4`; `T.neg`: `0` on `Station 3` `sedimentary` collar), while upturned `coal = 201` strata and `covepandan` appear only on `Station 3` (`T.ok`).
  3. **Extinct Cone & Blowhole Fidelity:** `blowholeAt(...).active === true` only along WNW wave-exposed dike-palagonite contacts (`Station 2`, `jetHeightM` in `[12, 34] m`), with `0` hydrothermal/fumarole vents (`T.neg`) and `0` `Shroudhills` ant-galls (`T.neg`) anywhere on the island.
  4. **Submarine Kelp & Basal Spring Bounds:** `soundkelp` places strictly at `bedElevM <= -0.5 m` (`T.neg`: `0` terrestrial kelp); `tuffcress` clusters strictly within `12 m` of `springLineAt(...).seepFlowLs > 0.5` tuff contacts; `< 15` active shader samplers; `KSHADOW` off at load; `0` untextured lit meshes; positive `KDRAWN` / `KCAVERN` eye clearance.

---

## 8. `KSTRATA` worn-cone columns, `build.py` / `verify.py` contracts & Godot `4.7.2` twin

### 8.1 Custom `KSTRATA` recipes for the deeply eroded extinct cinder cone (`src/41-biome-batter-sites.js`)

```js
/* Three lateral rock columns matching the worn cinder cone & upturned SE coal collar ([G data]) */
BATTER_SITES.STRATA = {
  'worn-scoria-palagonite': {
    dipDeg: 14.0,            /* gentle outward pyroclastic apron dip away from central neck */
    layers: [
      { key: 'basalt_sill',     h: 12.0, hard: 0.94, col: '#25262B' }, /* wave-bevelled sub-cone basalt foot */
      { key: 'palagonite_tuff', h: 28.0, hard: 0.52, col: '#B9985A' }, /* cemented hydrovolcanic aquitard (sea-caves & springs!) */
      { key: 'welded_spatter',  h:  4.5, hard: 0.88, col: '#3B2826' }, /* resistant agglutinate ledge */
      { key: 'oxidized_scoria', h: 36.0, hard: 0.28, col: '#7A2E22' }  /* gullied brick-red & charcoal lapilli */
    ]
  },
  'olivine-plug-basalt': {
    dipDeg: 82.0,            /* near-vertical columnar jointing & radial feeder-dike sheets */
    layers: [
      { key: 'olivine_cumulate', h: 45.0, hard: 0.96, col: '#2A332B' }, /* Ni=180 ultramafic xenolith core */
      { key: 'columnar_neck',    h: 65.0, hard: 0.98, col: '#2E3036' }, /* exhumed +868.8 m summit plug */
      { key: 'garnierite_vein',  h:  3.0, hard: 0.65, col: '#4F8A6B' }  /* weathered green nickel-silicate fracture rind */
    ]
  },
  'upturned-coal-collar': {
    dipDeg: 42.0,            /* country-rock coal measures tilted steeply outward by vent intrusion */
    layers: [
      { key: 'collar_sandstone', h: 14.0, hard: 0.74, col: '#A89674' },
      { key: 'baked_coal_201',   h:  1.8, hard: 0.44, col: '#141518' }, /* contact-coked coal=201 seam + oil=78 tar parting */
      { key: 'estuarine_shale',  h:  9.5, hard: 0.48, col: '#4E5258' },
      { key: 'palagonite_cap',   h: 18.0, hard: 0.54, col: '#B59458' }  /* distal tuff unconformably draping tilted coal */
    ]
  }
};
```

### 8.2 `build.py` deterministic cross-platform assembly (`AGENTS.md` rules)

```python
#!/usr/bin/env python3
"""Build biomes/batteredisle stations -> dist/batteredisle[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS refusal

STATIONS = ('portcove', 'rampart', 'archcove', 'plugcrest')
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
    '35-core-anim.js', '39-core-lean.js', '41-core-env.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js',
]
CORE_TERRAIN = [
    '35-core-strata.js', 'host/35-core-strata-shade.js',
    '36-core-carve.js', '37-core-stacks.js', '38-core-relief.js',
    '39-core-cavern.js', '39b-core-speleo.js', '39b2-core-speleo-cleft.js',
    'host/39e-core-cavern-draw.js', 'host/39h-core-cavern-cut.js',
    '41-core-scour.js', '43-core-ground.js',
    '44-core-farfield.js', 'host/44-core-farfield-draw.js',
    '45-core-horizon.js', 'host/45-core-horizon-shade.js',
]
# Every open() specifies encoding='utf-8' (and newline='\n' when writing); all paths use '/'
```

### 8.3 `stations/<station>.json` & `materials.json` schemas

```json
{
  "id": "portcove",
  "title": "Battered Isle — Breached Scoria Rim, Tuff Springs & (435, 259) Exile Cove",
  "px": [438, 258],
  "pinRefPx": [435, 259],
  "skyOffsetPx": [166, -72],
  "lithology": "ultramafic",
  "strataStack": "worn-scoria-palagonite",
  "pAtm": 1.59,
  "trimElevM": 18.0,
  "dikeCount": 4,
  "reserves": [
    { "id": "site:battered-port-rim", "x": 420, "z": -180, "r": 260, "elevM": 115.0 },
    { "id": "site:seamount-beacon",   "x": -340, "z": 210, "r": 36,  "elevM": 128.0 }
  ],
  "modes": ["Calm", "Gale", "Tsunami Drawdown"]
}
```

```json
{
  "slots": {
    "ground_scoria": "ground.volcanic_ash",
    "ground_lapilli": "ground.gravel042",
    "ground_laterite": "ground.laterite",
    "ground_moss": "ground.moss",
    "ground_cobble": "ground.gravel019",
    "strata_basalt": "rock.basalt",
    "strata_tuff": "rock.tuff",
    "strata_coal": "rock.coal",
    "bark_laurel": "bark.gnarled",
    "leaf_laurel": "card.broadleaf",
    "fern_spring": "card.fern",
    "kelp_sound": "card.seaweed"
  }
}
```

### 8.4 `verify.py` shared-harness contract (`tools/harness.py` — no pasted launcher)

```python
#!/usr/bin/env python3
"""Verify biomes/batteredisle stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'portcove':  'dist/batteredisle.html',
    'rampart':   'dist/batteredisle-rampart.html',
    'archcove':  'dist/batteredisle-archcove.html',
    'plugcrest': 'dist/batteredisle-plugcrest.html',
}

if __name__ == '__main__':
    harness.main(
        pages=PAGES,
        default_page='portcove',
        checks=harness.SURVEY,   # <15 samplers, KSHADOW off at load, compliant view names, KDRAWN clearance
    )
```

### 8.5 `openworld/` 1:1 streaming (`core/world`) & Godot `4.7.2` parity
- **`core/world` (`44c-world-coast.js`) & `settlements/battered-port` hand-shake:** When an `openworld/` cut streams across `rmwetgzft4x9d`, `WORLD.H(x, z)` and `RES_GEO` (`ultramafic`, `nickel`, `coal`, `wood` bytes) feed `BATTER_PHYS.cinderConeAt` and `tsunamiShadowAt` directly per `500 m` chunk (`KRAND.cell(worldSeed, ix, iz)`). Around `(435, 259)` / `(441, 258)`, `settlements/battered-port`'s `KCITY` instance stamps its lot and road occupancy into `KSPACE` first so `BATTER`'s wind-sheared `batteredlaurel` woods, `tuffcress` spring-curtains, and `soundkelp` anchorages wrap seamlessly up to the dark scoria plinths and breached-crater dike jaws without tree-in-building collisions.
- **Godot `4.7.2` GDScript twin (`godot/krator/biome/batter_phys.gd`):** Because `40-biome-batter-phys.js` and `60-biome-batter-place.js` use strictly integer-hashed `KRAND` draws, explicit `x == null ? d : x` numeric defaults, and zero `THREE`/DOM globals, `node biomes/batteredisle/tests/test-batter-phys.js --golden` emits `golden-batter-phys.json` vectors verified identically under `godot --headless --path godot --script res://krator/biome/batter_phys_test.gd`.

