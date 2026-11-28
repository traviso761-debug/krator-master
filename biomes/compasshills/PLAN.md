# compasshills: the plan (locked design, 2026-11-22)

**The Compass Hills** (`rmweu4kpowzji` / `compass hills` in Scale Model `5.1`): a `46,216 km²` (`100%` dry land, `X = 977..1139, Y = 185..290`) warm-temperate upland cuesta-and-tor country perched on the southern rim of the `Ria Valley` macro-basin between **`Weeping Valley`** (`rmwetzg8idewz`) to the north, **`Springhollows`** (`rmvyiyw8ucd1y`, formerly `"Neo-Ozarks"`) to the northeast, **`Arachnoid Canyons`** (`rmvarachnoids`) to the east/south, and **`Korona`** (`rmuqm3urh0mo6`) across the southern divide. Sliced across its northern third by the `890 km` **`9102` `Hām-Tsēk` (*Web-Cleaver River*, `Q ≈ 820–1,250 m³/s`)**, the hills span **`+767.5 to +1,735.7 m`** (`p5–p95`, median **`+1,004.3 m`**, gorge floor `+485.3 m` to SE granite-sandstone crest `+2,078.4 m`) under **`1.45–1.29 atm`** (`1.41 atm` median, `g = 7.4 m/s²` / `0.75 g`) and a sunny **`Cfa` (`86.4%`) / `Csa` (`13.6%`)** climate (`863 mm/yr` median rain, `+23.0 °C` annual mean [`+32 °C` warm / `+13 °C` cold]).

At the geographic heart of the hills stands **`Lodestone` (`1058, 224`, `+876.5 m`, `1.43 atm`, `CROOK-RIA-DECISIONS.md` §2.3.1 & §2.5.4)**: the ruined industrial arcology that housed the Ancients' room-temperature **Superconductor & Cryo-Magnet Foundry** on the northern terraforming boomtown frontier. When the Cataclysm struck, `Lodestone`'s subterranean multi-kilometer toroidal and linear cryo-magnet rings suffered a **catastrophic flux-quench**, discharging an immense multipolar electromagnetic pulse through the surrounding ferruginous sandstone and banded ironstone strata (`iron = 180`). That quench permanently remagnetized **`46,216 km²` of country rock into Krator's #1 natural magnet province (`lodestone = 220`, `1,129` lode nodes across `100%` of the polygon)**.

Crucially, **Compass Hills requires zero planetary core dynamo** (preserving `biomes/arch/PLAN.md` §1's open dynamo question): its `0.5–85 mT` (`5–850 Gauss`, **`10–1,700×` Earth's `50 µT` background**) multipolar crustal remanence is entirely local, static, and physically strong enough (`m·B / k·T >> 250` at cell scale; magnetic traction overcoming `0.75 g` gravity on fine `Fe3O4` grains at tor edges) to sculpt rock dust, plant leaves, insect cuticles, lightning strikes, and human toolmaking:
1. **`85%` Earthlike Mediterranean-Continental Cuesta Matrix:** Warm golden-buff sandstone dip-slopes and sheltered `Cfa`/`Csa` valleys clothed in stone and cluster pine, cork and pubescent oak, wild *whorl-olive*, terebinth/*pistache*, aromatic juniper, rosemary-like macchia, and terraced `saffron` meadows.
2. **Magnetized Black Ironstone Tors & Field-Line Sand Ripples:** Tilted cuesta scarps capped by jet-black **magnetite/maghemite banded ironstone tors** where ordinary magnetic compasses spin wild or lock toward the nearest tor, wind-blown black `Fe3O4` sand self-aligns along local $\mathbf{B}(x, z)$ flux lines into curved **streamline ripples** across bare slabs, and high-gradient crag edges grow centimetre-scale spiky **ferro-tuft mineral beards**.
3. **Ferromagnetic & Iron-Chelating Flora/Fauna (`15%` grounded physical weirdness):** Sclerophyll **compass-leaf shrubs (`compassbush`)** whose biogenic-magnetite-loaded petioles torque every vertical leaf blade parallel to local horizontal flux lines $\mathbf{B}_{\text{horiz}}(x, z)$ to shed `+32 °C` midday sun — turning whole hillsides into **living vector-field streamlines** that swirl in `180°` vortices around dipole inversions — alongside **magnetotactic stripe-lichens (`fluxlichen`)**, **lightning-vitrified fulgurite lodestone spires (`lodestonespire`)**, and specular gunmetal **magnetite-armoured bark hexapods (`ironcladbeetle`)**.
4. **Zero-Iron Bronze & Nephrite Delver Cantons:** Because strong $\nabla(|\mathbf{B}|^2)$ gradients near `Lodestone`'s toroidal tunnel vents and high-grade tors yank iron nails, steel picks, and iron belt-buckles violently to the rock, autonomous local delvers and geomancers work strictly with **non-magnetic tin-bronze, copper, and nephrite-jade tools**, supplying rare **`Superconductors`** (delved from `Lodestone`) and **`lodestones` / `magnets`** to both Ria Dynasties and the `Spider Lake -> Korona` silk road (`Ham-Tsek Silk Post` at `1055, 219`).

Status: **Build-ready specification** aligned with `CROOK-RIA-DECISIONS.md` (§2.3.1, §2.5.4, §2.5.5) and `CONTINENTAL-SCOPE.md`. Zero edits to `tools/scale-model/` or `kits/`.

---

## Core adoption

Written first per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and verified against `tools/check_core_use.py` (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/checks_optin.json` (survey items 22–31):

### Modules taken

| Module | Fragments / Path | What `biomes/compasshills` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('compasshills')` registry; `31j` `BIO.flareJoin` on gnarled cuesta oaks, stone pines, and *pistache*; `32` `BIO.kin` reading `biomes/swlowlands` / `biomes/wouterwall` Earthly Mediterranean-continental pines, oaks, juniper, and dry bunchgrasses in place; `33` `BIO.fung` for banded magnetotactic `fluxlichen` crusts and ferro-tuft mineral beards; `34` octahedral impostors on `>= 7 m` pines/oaks; `35`/`39` wind sway + magnetic-restoring leaf yaw |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers cuesta dip-slopes, magnetite tor ledges, toroidal quench-trench walls, and `Hām-Tsēk` gorge banks via `KDRAWN.add(KDRAWN.grid(...))` (survey item 28) |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Deterministic `KRAND.cell(seed, ix, iz)` and `KRAND.hash` for dipole/toroid pole seeds, tor fractures, fulgurite scars, plant placement, and lode grades — zero `Math.random` or `Math.sin` |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Pre-draw registration of every magnetite tor, compass-leaf stand, dipole inversion seam, lightning spire, `lodestone`/`iron` node, magnetic-pull hazard, non-ferrous bronze quarry marker, and `site:lodestone-arcology` / `site:ham-tsek-post` reserves |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Order-free occupancy keeping magnetite tors, pine/oak crowns, iron-sand ripple slabs, and arcology/post site reserves clear |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `38-core-relief.js` (`KRELIEF`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | Custom local `KSTRATA` column **`banded-ironstone`** (jet-black specular magnetite/chert bands capping warm ochre-ferruginous cuesta sandstone; `carbonate-shelf` on N lip; `rift-basement` granite window in SE); `KRELIEF` for asymmetric cuesta scarps, toroidal quench-ring subsidence moats (`Station 1`), and `Hām-Tsēk` ironstone narrows (`Station 4`); `KGROUND` (`<= 5` layers, tangent-rotated `'sand'` ripple kind aligned to $\mathbf{B}_{\text{horiz}}$ for field-line iron-sand ripples!); `KFAR` (`14 km`) + `KHORIZON` |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js` | `WATER.flow` for the `1,080 m³/s` **`9102` `Hām-Tsēk` (*Web-Cleaver River*)** cutting through dark magnetite gorge walls on `Station 4` and rust-stained cuesta brooks on `Stations 1–2`; `WATER.still` for iron-iridescent quarry cisterns and rock-cut rain basins (`WATER.mirrorSwitch` off at load) |
| **`core/atmos`** | `89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover.js`, **`fx/lightning.js`** | Shared Krator sky at `(px - 272, py - 330)` (`pressure: 1.44..1.29`), `#include <atmos_waves>`, **`fx/lightning.js`** driving cloud-to-tor lightning strikes onto high `lodestonespire` crags during summer `Cfa` convective squalls (`Station 2 tors`), and fine suspended black magnetite dust motes shimmering in tor-crest updrafts |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazards: `compass:magpull` (intense $\nabla(|\mathbf{B}|^2)$ ferrous-gear wrench/pinning zone within `18 m` of quench-vent lips & grade-high lodestone spires), `compass:lightning` (exposed conductive magnetite tor summits during squalls), and `compass:compassspin` (diegetic HUD/navigation bearing scramble field) |
| **`core/materials`** | `core/materials/record/23-mat-record.js`, `25-matlib-host.js` + `tools/textures/matlib_pack.py` | Packed library textures (`tex/pack.json`), keeping linked shader samplers `<= 12` (`< 15` survey gate) |
| **`core/shadow`** | `core/shadow/10-core-shadow.js`, `host/12-core-shadow-host.js` (`KSHADOW`) | Sun shadow cascade **off at page load** (`?shadow=1` or UI toggle attaches on first click) |
| **`core/host`** & **`core/walk`** | `khost.FULL` + `94-host-polytool.js` | Camera, walk controller, live **HUD Compass-Needle Widget** (driven by `COMPASS_PHYS.fieldAt(cam.x, cam.z)` so walking past a tor visibly spins/locks the needle!), `[Clear] / [Thunder-Squall]` & `[Field Overlay]` toggles, preset views, `window._api` |
| **`core/export`** | `core/export/07-core-export.js`, `09-core-export-adapters.js` | `krator-world` tile & `COMPASS_PHYS` magnetic vector field export for `openworld/` and Godot `4.7.2` |
| **`kits/crops`** | `kits/crops/src/10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js` (`CROPS`) | Read in place (`[G data]`): defines `CROPS.BIOMES.compasshills` (`cuesta`, `dipslope`, `ripgorge`, `highcrag`) supporting `whorl-olive`, `saffron`, `emmer`, `rice`, `canyon-grape`, `juniper`, and `mulberry` |
| **`kits/fauna`** | `kits/fauna` (`[G data]` records first) | Registers 6 Compass Hills fauna species (magnetite-armoured bark hexapods, iron-sand velvet-ants/hexapods, disoriented cliff-rollers, cuesta boars, bronze-horned ibex, and river-gorge ospreys) |
| **`kits/resources`** | Read-only contract (`kits/resources/GEOLOGY.md`, `data/geology.json`) | Honours surveyed `5.1` bytes (`iron = 180`, `stone = 255`, `coal = 55`, N-lip `limestone = 255, zinc = 90`, SE `tin = 200, rare-earth = 160` + 39-family **`lodestone = 220`** [`1,129` nodes] & `amber = 120` [`385` nodes]) + `superconductor` salvage reserve tag at `Lodestone` |

### Modules deliberately NOT taken

| Module | Taken? | Why not |
|---|---|---|
| **`core/mask`** (`KMASK`) | **No** | Analytical multipolar dipole + toroidal-ring Biot-Savart remanence equations in `COMPASS_PHYS.fieldAt(x, z)` define every magnetic vector, sand-ripple tangent, and compass-bush azimuth directly (`getImageData` is zero) |
| **`core/city`**, **`core/hamlet`**, **`core/camp`**, **`core/ruins`** | **No** | `Lodestone` (`1058, 224` ruined cryo-magnet arcology & bronze-delver canton) and `Ham-Tsek Silk Post` (`1055, 219` `kits/spider-lake` silk-and-magnet river post) are held clear as registered `KTAGS` `site:*` settlement/arcology reserves for dedicated settlement builds; `?works=0` places lightweight non-ferrous bronze quarry wedges, ceramic-gimbal survey tripods, and copper lightning-rods (`class: 'furniture'`) |
| **`core/coast`**, **`core/water/farbed`**, **`core/water/geyser`** | **No** | `100%` landlocked upland (`0 km²` sea or raster lake; zero geothermal vents in `rmweu4kpowzji`) |
| **`core/simulation`**, **`core/sched`**, **`core/engine`**, **`core/furnish`** | **No** | Pure biome showcase kit; fauna schedules are plain `[G data]` scaffolding |

### New-build survey compliance (`tools/checks_optin.json`, items 22–31)

`"biomes/compasshills"` joins all five lists in `tools/checks_optin.json` from commit 1 (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`), running `buildlib.through_tools_build`, `build_sources.report()`, `KDRAWN.add`, `< 15` samplers (`9–12` target), `tools/ktest.js`, and strictly punctuation-free view names.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/compasshills/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmweu4kpowzji`** (*compass hills*): **`46,216 km²` dry land** (`0 km²` lake/sea), `X = 977..1139, Y = 185..290`, centroid `(1060.8, 233.2)` on the `1821 × 1723` (`2 km/px`) canvas |
| **Pages (`4` Stations)** | `dist/compasshills.html` (**Station 1 `foundry`**: `Lodestone` Toroidal Quench-Ring Scar, Swirling Compass-Leaf Whorls & Bronze Delver Trail at `1058, 224`), `--station tors` (`1128, 248` Lightning-Scarred `iron = 180` Magnetite Tors & Field-Line Sand Ripples), `--station cuesta` (`1046, 258` Dry-Summer `Csa` Pine-Oak-Pistache Dip-Slope & `180°` Dipole Inversion Saddle), and `--station gorge` (`1055, 219` `Hām-Tsēk` Magnetite Narrows & Silk-Magnet Ferry Post) |
| **Objects** | **`COMPASS_PHYS`** (`[G data]` in `src/40-biome-compass-phys.js`: analytical multipolar crustal remanence $\mathbf{B}(x, y, z)$, gradient force $\nabla(|\mathbf{B}|^2)$, compass-leaf pulvinus azimuth torque, iron-sand streamline ripple tangents, lightning-rod strike probability, and cuesta aspect moisture; tested by `tests/test-compass-phys.js`) and **`COMPASS`** (`BIO.kit('compasshills')`) |
| **Read in place (`BIO.kin`)** | **`biomes/swlowlands`** & **`biomes/wouterwall`** (`stone pine`, `cork/sprawl oak`, `juniper`, dry Mediterranean bunchgrasses & herbs — forming the `85%` Earthlike warm-temperate cuesta woodland matrix without fragment duplication) |
| **Locked Lore Tie-In** | Anchors `Lodestone` (`1058, 224`, `CROOK-RIA-DECISIONS.md` §2.3.1 & §2.5.4) — Krator's premier source of salvaged Ancient **`Superconductors`** and natural **`lodestones` / `magnets`** (`lodestone = 220`), worked by zero-iron bronze/nephrite delver cantons trading down `Hām-Tsēk` (`1055, 219`) to both Ria Dynasties and via `Spider Lake` to `Korona` |

---

## 1. Geological, magnetic & climatic ground truth (`Scale Model 5.1`)

### 1.1 Exact surveyed raster & `geology.json` metrics (`rmweu4kpowzji`)

| Metric (`Scale Model 5.1`) | Surveyed Value in `rmweu4kpowzji` (*compass hills*) | Physical & Ecological Meaning |
|---|---|---|
| **Area & Bounds** | **`46,216 km²` dry land** (`11,554` `2 km` px; `0 km²` water), `X = 977..1139, Y = 185..290` | Compact `324 × 210 km` upland block matching a `~140 km` radius flux-quench remagnetization halo centered on `Lodestone` (`1058, 224`) |
| **Elevation (`min / p5 / p10 / p50 / p90 / p95 / max`)** | `+485.3 /` **`+767.5 / +804.7 / +1,004.3 / +1,575.7 / +1,735.7`** `/ +2,078.4 m` | Gentle `4°–9°` NNW-dipping cuesta dip-slopes broken by steep `80–350 m` SSE-facing magnetite-capped escarpments and the incised `+847 m` `Hām-Tsēk` river corridor |
| **Atmosphere & Gravity** | **`1.45–1.29 atm` (`p5–p95`)**, median **`1.41 atm`** (`1.43 atm` at `Lodestone` `+876.5 m`; `pO2 = 0.30 atm`), `0.75 g` | Dense, warm upland air (`ρ ≈ 1.65 kg/m³`) supporting intense afternoon convective `Cfa` thunderheads (`fx/lightning.js`) and lowering gravity threshold for magnetic sand-tufting |
| **Köppen, Rainfall & Temp** | **`Cfa` 86.4% (`39,932 km²`)**, **`Csa` 13.6% (`6,284 km²` SW/central dip-slopes)**; rain `p5 / p50 / p95` = **`722 / 863 / 1,051 mm/yr`**; **`+23.0 °C`** (`+32.0 / +13.0 °C`) | Subhumid Mediterranean-continental transition: hot `+32 °C` summers make vertical edge-on leaf alignment (`compassbush`) a major water-saving adaptation! |
| **`geology.json` & 39-Family Resources** | `98.4% sedimentary` (`46,032 km²`), `1.4% carbonate` (`656 km²` N edge, `limestone = 255, zinc = 90`), `0.2% granite` (`96 km²` SE window, `tin = 200, rare-earth = 160, gold/silver = 110`); **`iron = 180`** (`38` `4 km` cells `>= 120` on E/SE scarps, `851` 39-fam nd), `coal = 55`, **`amber = 120`** (`385` nd), and **`lodestone = 220` (`1,129` nd across `100%` of polygon!)** | Proterozoic-style **banded ironstone / oolitic magnetite** beds interlayered in `sedimentary` sandstone cuestas took permanent thermo-/isothermal-remanent magnetization (`TRM`/`IRM`) when `Lodestone` flux-quenched, while SE `tin = 200` granite supplies local tin-bronze toolmakers! |
| **Verified Pins in Polygon** | **`Lodestone`** `(1058, 224)` (`+876.5 m`, `1.43 atm`, `Cfa`, `847 mm`) & **`Ham-Tsek Silk Post`** `(1055, 219)` (`+846.7 m`, `1.44 atm`, `Cfa`, `831 mm`, `10 km` NNW on `9102` `Hām-Tsēk`) | Direct `10 km` bronze-cart portage from `Lodestone`'s tunnel mouths straight to river barges and silk-packers at `Ham-Tsek Silk Post`! |

### 1.2 Physics of the `Lodestone` flux-quench & multipolar remanence (`COMPASS_PHYS`, `[G data]`)

Authored in `src/40-biome-compass-phys.js` (zero `THREE`, zero `DOM`, deterministic on `KRAND`, tested by `tests/test-compass-phys.js`):

1. **`COMPASS_PHYS.fieldAt(x, z, site) -> {bx, by, bz, bMagMt, azimuthRad, dipRad, gradB2, inversionSeam01}`**
   - Superposes: (a) the regional **toroidal quench-ring multipole** anchored on `Lodestone` (`1058, 224`, `R_ring = 2.4 km` buried cryo-toroid + radial feeder dipoles) and (b) cell-seeded **magnetite-tor local dipoles** ($\mathbf{B}_{\text{dip}}(\mathbf{r}) = \frac{\mu_0}{4\pi r^3}[3(\mathbf{m}\cdot\hat{\mathbf{r}})\hat{\mathbf{r}} - \mathbf{m}]$) plus lightning-struck vertical line-current IRM scars on summit spires.
   - Yields ambient hillside $|\mathbf{B}| \approx 0.4–6.5\text{ mT}$ (`8–130×` Earth), rising to **`25–120 mT` (`250–1,200 Gauss`)** at exposed `lodestonespire` faces and quench-vent shafts. Where two opposing remanent domains meet (`|\mathbf{B}_{\text{horiz}}| < 0.08\text{ mT}` between opposite azimuth lobes), `inversionSeam01 -> 1.0` marks a dramatic **`180°` compass-flip corridor** (`Station 3 cuesta`).
2. **`COMPASS_PHYS.leafAzimuthAt(x, z, site, jitterU) -> {bladeYawRad, alignment01, noonShadeGain01}`**
   - Models `compassbush` magnetotropism: young developing petioles contain chains of `Fe3O4` magnetosomes (`m·B / k·T > 200` for `bMagMt >= 0.35`), torquing leaf blades until their flat lamina aligns vertically along `azimuthRad` (`alignment01 -> 0.92` over strong ironstone beds, relaxing to random `alignment01 < 0.15` on unmagnetized alluvium or right inside a zero-horizontal-field `inversionSeam01` core!). Vertical edge-on posture cuts `+32 °C` solar noon leaf heat load by `38–52%` (`noonShadeGain01`).
3. **`COMPASS_PHYS.sandStreamAt(x, z, slope, ironByte, bMagMt, gradB2) -> {rippleYawRad, streakContrast01, ferroTuftMm}`**
   - Rotates `KGROUND` iron-sand ripple tangents along `azimuthRad + pi/2` (or chain-streamlines along `azimuthRad` where `bMagMt >= 1.5 mT`) on bare `slope < 0.28` ironstone ledges, and grows `3–28 mm` bristling **ferro-tuft magnetite-grain spikes** (`ferroTuftMm > 0`) only along sharp tor edges where $\frac{\chi}{\mu_0}\nabla(|\mathbf{B}|^2) > \rho_s g_{\text{Krator}}$ (`g = 7.4 m/s²`).
4. **`COMPASS_PHYS.ferrousPullAt(x, z, toolIronKg, gradB2) -> {forceN, wrenchTool, pinClimber, safeBronze}`**
   - Computes magnetic Kelvin force $F = \frac{V_{\text{Fe}} \chi_{\text{eff}}}{2\mu_0} \nabla(|\mathbf{B}|^2)$ on an iron object of mass `toolIronKg` (`safeBronze === true` always for `Cu-Sn` bronze and nephrite jade, since $|\chi| < 10^{-5}$!). Within `15 m` of quench-vent throats or grade-high lodestone spires (`gradB2` peak), `forceN > 180 N` (`wrenchTool: true` for a `2 kg` steel pick; `pinClimber: true` for `12 kg` iron mail), grounding `KHAZ` `compass:magpull` in exact physics.
5. **`COMPASS_PHYS.lightningScoreAt({elevM, localProminenceM, ironByte, bMagMt}) -> {strikeProb01, fulgurite01, irmpole01}`**
   - Scores convective strike attraction on conductive magnetite tors (`iron >= 120`), placing glassy branching **fulgurite melt-veins** and lightning-re-poled summit `lodestone = 220` nodes (`Station 2 tors`).

---

## 2. Ecological zones (`85%` Mediterranean-continental cuesta + `15%` ferromagnetic)

| Zone Key | Elev & Climate | Substrate (`KSTRATA` / `KGROUND`) | Dominant Biota & Magnetic Signature |
|---|---|---|---|
| **`1. cuestawood`** (*Pine-Oak-Pistache Dip-Slopes*) | `+780..+1,450 m`, `Cfa` / `Csa` (`85%` of hills) | Warm ochre-buff ferruginous sandstone & red terra-rossa loam (`ground.dry_grass` / `ground.needles`) | Open sunlit woodland of **stone pine**, **cork/pubescent oak**, **terebinth *pistache* (`ironpistache`)**, wild **`whorl-olive`**, juniper, and `saffron` glades — Earthlike at first glance until you notice the understory `compassbush` blades all combed along invisible curved flux lines! |
| **`2. magnetor`** (*Black Banded-Ironstone Tors & Sand Slabs*) | `+950..+1,940 m` cuesta crests (`iron = 180`, `lodestone = 220`) | Custom `KSTRATA` **`banded-ironstone`** (jet-black specular magnetite & jasper-chert ribs) + **field-line black iron-sand ripples** | Lightning-scarred **`lodestonespire`** crags striped along isogauss contours by gunmetal-and-ochre **`fluxlichen`**, edged with spiky **`ferrotuft`** magnetite-grain beards and **flux-plume grass (`fluxgrass`)** |
| **`3. quenchscar`** (*`Lodestone` Toroidal Ring Subsidence Moat*) | `+845..+910 m` around `(1058, 224)` (`Station 1`) | Vitrified rust-violet quench-slag & fractured ironstone blocks forming a `2.4 km`-radius arcuate trench | Intense multipolar vortices where **`compassbush`** stands swirl in tight `360°` rosettes around buried quench-nodes, bronze-rung delver trails approach `site:lodestone-arcology`, and zero iron-sensitive birds cross |
| **`4. inversionseam`** (*`180°` Magnetic Domain-Wall Saddles*) | `+920..+1,350 m` (`Station 3`, `Csa` `769 mm`) | Pale cherty sandstone & red hematitic soil along opposing remanent domain boundaries | Striking botanical boundary: north of the `35 m` seam every `compassbush` and `fluxgrass` awning points `NNE`, south of the seam every blade points `WNW`, and right in the zero-`B_horiz` middle leaves splay radially! |
| **`5. irongorge`** (*`Hām-Tsēk` Magnetite River Narrows*) | `+760..+920 m` along `9102` (`Station 4`) | Polished dark banded-ironstone river cliffs, black magnetite placer sandbars, and `amber = 120` driftwood eddies | Riparian **plane/sycamore**, **oleander**, **`mulberry`** (outlying Silk-Road groves near `Ham-Tsek Silk Post` `1055, 219`), and overhanging `compassbush` ledges above `1,080 m³/s` green-gold water |

---

## 3. Station catalogue (`4` verified Scale-Model `5.1` sites)

Every station `(px, py)` is directly verified on `5.1` rasters (`sky frame = (px - 272, py - 330)`). All preset view names strictly obey survey item 30 (zero `'` and zero `:`).

| # | Station Arg & Output | `5.1` `(px, py)` & Sky `(ox, oy)` | Elev, `10 km` Relief & `P_atm` | Climate, Rain & `T` (`w/c`) | `KSTRATA` & `geology.json` | Core Physical & Ecological Signature |
|---|---|---|---|---|---|---|
| **1** | **`foundry`** *(main)* `dist/compasshills.html` | **`(1058, 224)`** `(+786, -106)` (*`Lodestone` Ring Rim*) | **`+876.5 m`** (`+836..+898 m` bench + incised quench-moat), **`1.43 atm`** | `Cfa`, **`847 mm`**, **`+24 °C`** (`+33/+14`) | `banded-ironstone` over sandstone; **`lodestone = 220`**, `iron = 40..180`, `amber = 120` | **`Lodestone` Toroidal Flux-Quench Rim & Swirling Compass-Leaf Vortices:** Arcuate subsided cryo-ring trench, `360°` swirling `compassbush` streamlines, iron-sand field ripples, bronze-chisel delver trail & `site:lodestone-arcology` reserve (`superconductor` salvage hub) |
| **2** | **`tors`** `--station tors` `dist/compasshills-tors.html` | **`(1128, 248)`** `(+856, -82)` (Eastern High Ironstone Scarp) | **`+1,392.3 m`** (`+1,270..+1,867 m`, `597 m` rel), **`1.34 atm`** | `Cfa`, **`941 mm`**, **`+20 °C`** (`+30/+10`) | `banded-ironstone` cuesta scarp; **`iron = 180`**, **`lodestone = 220`** | **Lightning-Struck Magnetite Tors, Fulgurite Spires & `ATMOS` Thunder-Squalls:** `60 m` black magnetite tors (`fx/lightning.js` target), `ferrotuft` grain-beards, `fluxlichen` isogauss stripes, and `?works=0` bronze quarry wedges & lightning-rods |
| **3** | **`cuesta`** `--station cuesta` `dist/compasshills-cuesta.html` | **`(1046, 258)`** `(+774, -72)` (Central-South `Csa` Dip-Slope) | **`+987.6 m`** (`+910..+1,240 m`), **`1.42 atm`** | **`Csa`**, **`769 mm`**, **`+22 °C`** (`+32/+13`) | Ferruginous cuesta sandstone + `banded-ironstone` cap; **`lodestone = 220`** | **Dry-Summer `Csa` Pine-Oak-Pistache Woodland & `180°` Dipole Inversion Saddle:** Sun-baked Mediterranean dip-slope, `whorl-olive` & `saffron` glades, and a crisp magnetic domain-wall saddle where `compassbush` leaf bearings flip across `40 m` |
| **4** | **`gorge`** `--station gorge` `dist/compasshills-gorge.html` | **`(1055, 219)`** `(+783, -111)` (*`Ham-Tsek` River Narrows*) | **`+846.7 m`** (`+836..+921 m`), **`1.44 atm`** | `Cfa`, **`831 mm`**, **`+23 °C`** (`+33/+14`) | `banded-ironstone` river palisades; **`lodestone = 220`**, `coal = 39`, `amber = 120` | **`Hām-Tsēk` Magnetite Narrows & Silk-Magnet Ferry Gorge:** `9102` `Web-Cleaver River` (`Q = 1,080 m³/s`) slicing black magnetite bluffs with black-sand streamline bars, `site:ham-tsek-post` (`kits/spider-lake` outpost reserve), and bronze ferry cables |

### 3.1 Station 1 (`foundry`, main page `dist/compasshills.html`): `Lodestone` Flux-Quench Rim & Swirling Compass-Leaf Whorls — `(1058, 224)`
- **Site & Framing (`5.4 × 5.4 km`):** Set on the outer arcuate rim of **`Lodestone` (`1058, 224`, `sky +786, -106`, `+876.5 m`, `1.43 atm`)**, where a `220 m`-wide, `28 m`-deep subsided circular **toroidal quench-trench** (`KRELIEF`) traces the Ancients' buried `4.8 km`-diameter cryo-magnet ring, framing the held-clear central `site:lodestone-arcology` (`r = 450 m`) reserve (`CROOK-RIA-DECISIONS.md` §2.3.1).
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* Custom `banded-ironstone` (`1.5–4 m` specular black magnetite-maghemite & red jasper-chert caprock) resting on `4–8 m` cross-bedded warm ochre ferruginous sandstone, with rust-violet vitrified quench-breccia exposed in the trench walls.
  - *Ground (`5` layers):* `ground.dry_grass` (golden Mediterranean cuesta turf), `ground.needles` (pine-oak litter), `ground.sand.magnetite` (tangent-steered black `Fe3O4` field-line ripples on bare ledges), `rock.gossan` (oxidized quench-trench floor), `ground.gravel019` (bronze-delver trail).
- **Signature Visuals & Interactive Host Controls:**
  - Across rolling pine-oak-pistache shoulders, thousands of silvery-olive **`compassbush`** shrubs trace the toroidal multipole in sweeping **curved botanical streamlines** — bowing into tight `360°` dipole whorls around collapsed tunnel-vent throats!
  - Bare dark `banded-ironstone` slabs along the trench lip display wind-winnowed **jet-black magnetite sand ripples** curved strictly along `COMPASS_PHYS.sandStreamAt` tangents, while high-gradient vent rims (`KHAZ` `compass:magpull`) bristle with metallic `ferrotuft` fringes.
  - `?works=0` places a zero-iron delver approach path: notched **nephrite-and-tin-bronze distance stelae** warning iron-bearers back (`"NO IRON PAST THE THIRD STONE"`), a ceramic-gimballed lodestone survey table, and a timber-and-bronze capstan head (`class: 'furniture'`).
  - **Live HUD Compass-Needle & `[Field Overlay]` Toggle:** Walking the camera updates a live corner compass needle from `COMPASS_PHYS.fieldAt(cam.x, cam.z)` (visibly spinning `180°` as you cross a dipole pole!), while `[Field Overlay]` briefly highlights subtle iron-dust shimmer lines in `ATMOS` air!
- **Preset views:** `overview`, `compass-leaf-whorl`, `iron-sand-ripples`, `quench-trench-lip`, `bronze-delver-stelae`, `lodestone-arcology-site`.

### 3.2 Station 2 (`tors`, `dist/compasshills-tors.html`): Lightning-Struck Magnetite Tors & Thunder-Squalls — `(1128, 248)`
- **Site & Framing (`5.2 × 5.2 km`):** Directly on a surveyed **`geology.json` `iron = 180` + `lodestone = 220`** cuesta escarpment (`+1,392.3 m` climbing to `+1,867 m`, `sky +856, -82`, `1.34 atm`, `941 mm/yr`).
- **`KSTRATA` & `KGROUND` Stack (`<= 5` layers):**
  - *Strata:* Thick `banded-ironstone` scarp (`35–65 m` exposed cliff face) over `rift-basement` granitic-sandstone footwall.
  - *Ground (`5` layers):* `ground.sand.magnetite`, `organic.lichen.isogauss` (concentric gunmetal/ochre bands), `ground.dry_grass`, `ground.needles`, `ground.gravel019`.
- **Signature Visuals:** Monumental jet-black **`banded-ironstone` tors and pinnacles (`lodestonespire`)** jutting above stone-pine and cork-oak slopes. Glassy turquoise-black **fulgurite lightning tubes** snake down the crags alongside concentric **`fluxlichen`** isogauss stripes. Toggling **`[Clear] / [Thunder-Squall]`** triggers `ATMOS` `fx/lightning.js` bolts preferentially striking the highest `lightningScoreAt` magnetite spires! `?works=0` adds non-sparking tin-bronze plug-and-feather quarry wedges in a split lodestone block and copper lightning-harvesting rods.
- **Preset views:** `overview`, `magnetite-tor-wall`, `fulgurite-spire`, `flux-lichen-bands`, `bronze-quarry-bench`, `squall-horizon`.

### 3.3 Station 3 (`cuesta`, `dist/compasshills-cuesta.html`): Dry-Summer `Csa` Dip-Slope & Dipole Inversion Saddle — `(1046, 258)`
- **Site & Framing (`5.2 × 5.2 km`):** Showcases Compass Hills' **`13.6% Csa` (`769 mm/yr`, `+32 °C` summer)** Mediterranean dip-slope woodland at `(1046, 258)` (`sky +774, -72`, `+987.6 m`, `1.42 atm`): umbrella stone pines, gnarled oaks, crimson-fruited **`ironpistache`**, wild **`whorl-olive`**, and violet autumn **`saffron`** meadows.
- **`KSTRATA` & `KGROUND` Stack (`4` layers):** Ferruginous cuesta sandstone + thin `banded-ironstone` cap; `ground.dry_grass`, `ground.needles`, `ground.sand.magnetite`, `ground.lichen.crust`.
- **Signature Visuals:** Across the central saddle runs a natural **magnetic domain-wall seam (`inversionSeam01`)** where two opposite remanent crustal blocks meet: north of the `35 m` seam every `compassbush` and `fluxgrass` blade points `NNE`, south of the seam every blade points `WNW`, and inside the zero-`B_horiz` neutral core leaves splay radially while `fluxroller` flocks bank in figure-eights overhead!
- **Preset views:** `overview`, `inversion-saddle`, `pine-pistache-wood`, `saffron-olive-bench`, `domain-wall-closeup`.

### 3.4 Station 4 (`gorge`, `dist/compasshills-gorge.html`): `Hām-Tsēk` Magnetite Narrows, Weeping-Amber Seam & Silk-Magnet Ferry — `(1055, 219)`
- **Site & Framing (`5.4 × 5.4 km`):** Where **`9102` `Hām-Tsēk` (`Q = 1,080 m³/s`)** carves a `90 m`-deep canyon through `banded-ironstone` bluffs at **`Ham-Tsek Silk Post` (`1055, 219`, `sky +783, -111`, `+846.7 m`, `1.44 atm`)**, `10 km` NNW of `Lodestone` toward the `Weeping Valley` (`898, 174` / `996, 156`) confluence.
- **`KSTRATA` & `KGROUND` Stack (`4` layers):** `banded-ironstone` palisades over `coal = 39` sandstone; `ground.grass`, `ground.needles`, `ground.sand.magnetite` (black placer bars), `ground.gravel`.
- **Signature Visuals:** Point-bars gleam with heavy black **magnetite-and-gold-amber (`amber = 120`)** placer sand ripples; naturalized northern-seam **`amberstorax` (*Weeping-Amber Storax*)** groves (`compass:weeping-amber-grove`) weep golden **`ria-amber`** balsam tapped by **The Pioneers** (*Society of the Needle* / *Sap-Breakers*, `CROOK-RIA-SCOPE.md` §3.3) to boil dielectric coil-varnish for hydro-dynamos and silk-wrapped telegraph coils; `site:ham-tsek-post` (`r = 46 m` river terrace) holds clear buildable space for `kits/spider-lake` (`SL1–SL4`) silk-and-magnet warehouses, flanked by `?works=0` non-ferrous bronze ferry bollards (`zero` iron anchor-hooks), `silkmulberry` rows, `gorgeplane`, `gorgeoleander`, `canyongrape`, and `seepmaidenhair`.
- **Preset views:** `overview`, `magnetite-river-narrows`, `black-sand-placer`, `weeping-amber-grove`, `ham-tsek-post-site`, `mulberry-terrace`.

---

## 4. Species roster (`src/50-biome-compass-species.js`, `25` species), guardrails & `kits/crops`

`COMPASS.SPECIES` registers **25 library-backed species** (`18` Earthlike Mediterranean-continental, Weeping-Amber seam, garrigue & riparian `Hām-Tsēk` species forming `85%` of instances [`0.78 <= earthShare <= 0.90`] + `7` ferromagnetic, magnetotropic & gossan specialists in `FERRO_KEYS` forming `15%` of instances):

### 4.A Ferromagnetic, Magnetotropic & Gossan Specialists (`7` species in `FERRO_KEYS`, `~15%` share)

| Key | Name & Library Card | Zone & Field Rule | Height & `3D` Builder | Biome Mechanics & `HV` Harvest Tag |
|---|---|---|---|---|
| **`compassbush`** | **Flux-Leaf Compass-Shrub** (`card.sage` custom `makeCompassBladeGeo`) | All zones (`bMagMt >= 0.25`) | `0.9–2.6 m` woody shrub (`ch_pistache`) + vertical silver-olive sclerophyll fins locked within `<= 12°` (`0.21 rad`) of `fluxAt(x, z).declinationRad` | Biogenic `Fe3O4` magnetosome petioles torque vertical leaf blades parallel to $\mathbf{B}_{\text{horiz}}$ to shed `+32 °C` noon sun (`< 0.20` radial splay inside neutral domain seams). `HV('fuel', [], true, 'Aromatic mastic-like resin chewed by delvers; calcined iron-rich leaf ash ground into fine magnetic-ink pigment and reagent.')` |
| **`fluxgrass`** | **Magnetite-Awn Plume-Grass** (`card.stipa`) | `magnetor`, `cuestawood`, `inversionseam` | `0.45–1.15 m` golden-bronze tussock grass streaming along local flux | Feathery `12 cm` seed-awns chelate fine magnetite dust. `HV('thatch, weaving, padding', [], false, 'Woven into non-static cushioned baskets for carrying raw lodestones and salvaged Ancient superconductors.')` |
| **`fluxlichen`** | **Isogauss Stripe-Lichen** (`rock.lichen.circles` on `BIO.fung.crust`) | `magnetor`, `irongorge` (`bMagMt >= 2.0 mT`) | `0.035 m` proud concentric gunmetal-black and rust-gold crustose rings | Magnetotactic symbionts steer hyphal tips along constant-$|\mathbf{B}|$ contours. `HV('none', [], false, 'Scraped for rust-gold and gunmetal wool dye; prospectors read tight isogauss ring spacing as a high-grade lodestone ore indicator.')` |
| **`ferrotuft`** | **Tor-Edge Ferro-Moss** (`organic.chitin.iridescent`) | `magnetor`, `quenchscar` (`ferroTuftMm > 2`) | `0.05–0.20 m` dark-metallic spiky cushions along high-gradient crag corners | Mucilaginous moss traps upright single-domain magnetite needles. `HV('none', [],false, 'Brushed with tin-bronze combs to harvest pure single-domain magnetite sand for hourglasses and compass fluid reagent.')` |
| **`lodestonespire`** | **Fulgurite-Veined Magnetite Crag** (`rock.hematite.mirror` + `rock.gneiss.banded` + `rock.turquoise.vein`) | `magnetor`, `quenchscar`, `irongorge` | `4.0–18.0 m` angular `banded-ironstone` spire + proud `+0.14 m` glassy fulgurite veins | Conductive lightning-rod and high-grade `lodestone = 220` outcrop. `HV('none', [], false, 'Split with non-sparking tin-bronze plug-and-feather wedges into Krator natural permanent magnets; lightning marker.')` |
| **`magnetitespleenwort`** | **Magnetite-Crevice Spleenwort** (`card.frond.needle`) | `magnetor`, `quenchscar`, `irongorge` (`bMagMt >= 2.2 mT` crevices) | `0.18–0.48 m` xerophytic ironstone-crevice metallophyte fern | Hyperaccumulates `Fe3O4` in stiff bronze-olive pinnae along high-field rock clefts. `HV('none', [], true, 'Calcined iron-chelating frond ash yields fine magnetic rouge reagent for polishing bronze mirrors and Pioneer compass jewel-bearings; high-field lodestone indicator.')` |
| **`gossanwhorlheath`** | **Gossan Copper-Magnetite Whorl-Heath** (`card.heath.whorl`) | `quenchscar`, `magnetor` (`foundry` & `tors` gossan seams) | `0.30–0.85 m` ericoid metallophyte subshrub with rust-violet bell whorls | Tracks oxidized copper-magnetite gossan veins and quench-slag rims. `HV('fuel', [], false, 'Metallophyte ore indicator whose rust-violet bell whorls mark oxidized copper-magnetite gossan veins and quench-slag pockets; dense root-burl turnery.')` |

### 4.B Earthlike Mediterranean Cuesta, Weeping-Amber Seam, Garrigue & Riparian `Hām-Tsēk` Matrix (`18` species, `~85%` share)

| Key | Name & Library Materials | Zone & Niche | Height & Builder | Utilitarian & Regional Lore (`HV`) |
|---|---|---|---|---|
| **`stonepine`** | **Umbrella Cuesta Stone Pine** (`bark.ponderosa` `ch_pine` + `card.pine`) | `cuestawood` | `10–19 m` umbrella-crowned pine (`growTree`) | Structural river-barge timber, resin & pine nuts |
| **`corkoak`** | **Cuesta Cork and Pubescent Oak** (`bark.cork` `ch_cork` + `card.lobed`) | `cuestawood` | `7.5–14.5 m` gnarled savanna-woodland oak (`growTree`) | Non-magnetic cork tool sheaths, floats, tanbark & roasted acorns |
| **`ironpistache`** | **Cuesta Terebinth Iron-Pistache** (`bark.madrone` `ch_pistache` + `card.orchard.small` + `card.blossom`) | `cuestawood`, `irongorge` | `5.0–10.5 m` fluted broadleaf tree + drupe panicles (`growTree`) | Non-sparking mallet/wedge handle wood inside `Lodestone` tunnels; pistache nuts & turpentine |
| **`whorlolive`** | **Wild Cuesta Whorl-Olive** (`bark.juniper` `ch_juniper` + `card.broadleaf.dry`) | `dipslope` (`Csa`/`Cfa`) | `3.8–7.2 m` silver-backed olive (`growTree`) | Golden culinary/lamp oil, soap & tunnel-leather dressing |
| **`cuestajuniper`** | **Red-Berry Cuesta Juniper** (`card.juniper`) | `cuestawood` scarps | `1.6–4.2 m` resinous scarp shrub | Rot-proof survey-stake wood & spiced berry extract |
| **`gorgeplane`** | **Web-Cleaver Riparian Plane** (`bark.plane` `ch_plane` + genuine `card.broadleaf` + `card.samara.maple`) | `irongorge` & brooks | `12–21 m` mottled riparian tree + pendulous samara balls (`growTree`) | Cross-grained `Hām-Tsēk` ferry planking & bronze-capstan blocks |
| **`silkmulberry`** | **Ham-Tsek White Mulberry** (`bark.plane` `ch_plane` + genuine `card.heartleaf`) | `irongorge` terraces | `4.8–8.2 m` heart-leaved orchard/riparian tree (`growTree`) | Feeds `Spider Lake -> Korona` silk-moth broods at `Ham-Tsek Silk Post`; inner bast paper |
| **`amberstorax`** | **Weeping-Amber Storax** (`bark.amber` `ch_amber` + `card.lobed`) | Northern `Weeping Valley` (`amber = 120`) seam: `gorge` & sheltered N dips on `foundry`/`cuesta` | `6.8–13.5 m` resin-streaked lobed tree (`growTree`) | **Pioneers Dielectric Varnish Source (`CROOK-RIA-SCOPE.md` §3.3):** Weeping golden `ria-amber` balsam boiled by Pioneers engineers & *Sap-Breakers* into dielectric coil-varnish for hydro-dynamos and silk-wrapped telegraph coils |
| **`cuestaarbutus`** | **Cuesta Strawberry-Tree** (`bark.madrone` `ch_pistache` + `card.starberry`) | `cuestawood` macchia | `3.0–6.0 m` flaking red-barked sclerophyll treelet (`growTree`) | Non-magnetic Pioneer instrument cases, crimson fruit cordial & bark tannin |
| **`sunnycarob`** | **Dip-Slope Carob** (`bark.cork` `ch_cork` + `card.orchard.broad`) | `dipslope` (`Csa` benches) | `4.6–9.2 m` broad-domed drought-hardy pod tree (`growTree`) | Delver trail pod-flour; uniform seeds used by *Court of the Amber Seal* bullion factors as carat weights |
| **`gorgeoleander`** | **Web-Cleaver Canyon Oleander** (`ch_pistache` stems + `card.petal.coral`) | `irongorge` floodbars & washes | `1.4–3.2 m` coral-flowered phreatophyte shrub (`growWoodyShrub`) | Pest-repellent leaf decoction wash for ferry hulls & silk warehouses |
| **`goldenbroom`** | **Cuesta Golden Broom** (`ch_pistache` stems + `card.broom`) | `cuestawood` garrigue & trails | `0.8–2.1 m` nitrogen-fixing golden-flowered shrub (`growWoodyShrub`) | Non-ferrous haulage cordage, quarry baskets & yellow wool dye |
| **`cistusrockrose`** | **Labdanum Cistus Rock-Rose** (`card.cupflower`) | `dipslope` & `foundry` sandstone | `0.45–1.10 m` pyrophytic sticky rock-rose subshrub | Fragrant labdanum oleoresin raked with bronze combs for leather balm & tinder |
| **`canyongrape`** | **Wild Ham-Tsek Canyon Grape** (`ch_plane` vine + `card.vine.hanging.2`) | `irongorge` walls & rocky brooks | `1.6–4.5 m` scrambling/draping wild vine (`growCanyonGrape`) | Matches `CROPS` `'canyon-grape'`: sharp canyon wine, copper-still vinegar & vine lashing |
| **`seepmaidenhair`** | **Iron-Seep Maidenhair Fern** (`card.fan.lace`) | `irongorge` wet seeps & alcoves | `0.22–0.55 m` lacy black-stemmed seep fern | Pectoral frond syrup brewed against magnetite-sand dust cough |
| **`cuestaasphodel`** | **Limestone Hollow-Stem Asphodel** (`card.firelily`) | `dipslope` N-lip carbonate & sandstone | `0.45–1.05 m` starry-spiked Mediterranean geophyte | Dried tuber paste glue for Pioneer geodetic ledgers; skin salve |
| **`saffroncrocus`** | **Cuesta Autumn Saffron** (`card.crop.saffron`) | `dipslope` benches | `0.18–0.35 m` violet-petalled, crimson-stigma crocus | High-value golden dye & culinary spice traded down `Hām-Tsēk` |
| **`macchiasage`** | **Rosemary and Cuesta Bunchgrass Macchia** (`card.sage`, `card.grass.dry`, `card.moss`) | `cuestawood` ground matrix | `0.35–0.85 m` aromatic rosemary scrub & golden bunchgrass | Distilled essential oil rub, thatch & kindling tinder |

### 4.1 Explicit cross-biome non-duplication guardrails
1. **Against `biomes/ancientsvalley`:** `Compass Hills` has **zero** vitrified nuclear blast craters (`glass = 0`), radiation anomalies, or floating gravity shards — `Lodestone`'s quench was a **purely magnetic flux-quench** leaving an `85%` healthy, sunlit Mediterranean-continental pine-oak-olive-carob woodland!
2. **Against `biomes/galvanic` / Rift electro-flora:** Zero living electrical wires, galvanic acid batteries, or glowing plasma arcs; every botanical effect in Compass Hills (`compassbush` blade orientation, `fluxlichen` rings, `ferrotuft` dust trapping, `magnetitespleenwort` & `gossanwhorlheath` metallophytism) is **passive static ferromagnetism (`Fe3O4` magnetosomes / iron-copper chelation)**!
3. **Against `biomes/arch`:** `0.0% ultramafic` (`nickel = 0`); requires **zero** planetary core dynamo (`biomes/arch/PLAN.md` §1 stays untouched) because `0.5–120 mT` fields come directly from local `TRM`/`IRM` ironstone remanence.
4. **Northern `Weeping Valley` (`rmwetzg8idewz`) & `Torus` Seam (`CROOK-RIA-SCOPE.md` §3.3, Ruling #104):** While central `Weeping Valley` (`996, 156`) pools psychoactive sap-fog around ruptured bio-ruins, breezy upland `Compass Hills` (`+846..+1,050 m`) hosts healthy naturalized `amberstorax` groves tapped for clean **`ria-amber`** dielectric coil-varnish by **The Pioneers** (zero overlap with `Torus`'s Rinkvolk *Tenders*).

### 4.2 `kits/crops` registration (`CROPS.BIOMES.compasshills`)

```js
compasshills: {
  atm: 2,   /* 1.34-1.45 atm across +767..+1,450 m cuesta benches (highcrag > +1,600 m overrides to atm: 1) */
  zones: {
    cuesta:   {warmth: [3, 3], arid: [2, 3]},              /* Cfa +800..+1,400 m subhumid pine-oak slopes: 58+ crops */
    dipslope: {warmth: [3, 3], arid: [1, 2]},              /* 13.6% Csa dry-summer olive, pistache & saffron slopes */
    ripgorge: {warmth: [3, 4], arid: [3, 3], wet: true},   /* +760..+900 m Ham-Tsek river terraces & mulberry groves */
    highcrag: {warmth: [2, 2], arid: [2, 2], atm: 1}       /* +1,450..+2,078 m SE granite-ironstone tors */
  }
}
```
- **Verified `CROPS` Palette:** **`whorl-olive`**, **`saffron`**, `emmer`, `rice` (`ripgorge`), `helix-bean`, `murnong`, `painted-camas`, `acorn`, `almond`, `apricot`, `persimmon`, `canyon-grape`, `juniper`, `umbel-seed`, `tea`, **`mulberry`** (`Ham-Tsek` silk corridor), `flax`, and `iron` mineral dye.

---

## 5. Fauna (`kits/fauna` `[G data]` records)

| Key (`kits/fauna`) | Name & Clade | Scale | Niche & Magnetic Adaptation | Yields & 24h Schedule |
|---|---|---|---|---|
| **`ironcladbeetle`** | **Gunmetal Bark-Hexapod** (vertebrate-grade armoured hexapod) | `0.22 m` | Chews iron-rich `compassbush` & `ironpistache` bark using **magnetite-capped radular mandibles** (chiton analogue), cross-linking `Fe3O4` nanoparticles into **mirror-gunmetal crush-proof elytra** that visibly cling to `lodestonespire` rock! | `magnetite-elytra` (prized non-sparking scale inlay), `chitin`. `06–13` `BROWSE_BARK`, `13–17` `CLING_TOR`, `17–21` `MATE_SPIRE`, `21–06` `CREVICE_SLEEP` |
| **`fluxroller`** | **Vortex-Winged Cliff Roller** (iridescent coraciiform bird) | `0.34 m` | Hunts `ironcladbeetles` on cuesta scarps; evolved **visual polarized-sky navigation** to override its scrambled trigeminal magnetoreceptors (visibly banking in tight figure-eights when crossing `Station 3` `inversionseam`!) | `feathers`, `small-fowl`. `06–18` `HAWK_TOR`, `18–06` `NEST_SCARP` |
| **`bronzehornibex`** | **Cuesta Copper-Horn Ibex** (sure-footed caprid) | `0.95 m` shoulder | Bounds across steep `banded-ironstone` scarps (`Station 2`); keratin horn-sheaths chelate trace copper/iron into burnished bronze ridges | `venison`, `horn`, `hide`, `tallow`. `05–10` `GRAZE_CUESTA`, `10–16` `SHADE_TOR`, `16–20` `LICK_IRON`, `20–05` `ROOST_CRAG` |
| **`sandvelvet`** | **Ripple-Line Velvet-Hexapod** (ground-probing hexapod) | `0.30 m` | Follows black magnetite sand streamlines (`Station 1` & `2`) sensing triboelectric/magnetic vibrations of burrowing grubs | `chitin`, `venom-gland`. `00–08` `PROWL_RIPPLE`, `08–17` `BURROW_SAND`, `17–24` `PROWL_RIPPLE` |
| **`truffleboar`** | **Cuesta Oak-Rooter** (wild suid) | `0.85 m` | Roots under cork/pubescent oaks for tubers and acorns along `Cfa`/`Csa` dip-slopes | `pork`, `lard`, `bristle-hide`. `04–09` `ROOT_OAK`, `09–17` `WALLOW_BROOK`, `17–23` `FORAGE_OLIVE`, `23–04` `SLEEP_THICKET` |
| **`gorgeosprey`** | **Web-Cleaver Fish-Hawk** (raptor on `Station 4`) | `0.60 m` (`1.6 m` span) | Plunges into `9102` `Hām-Tsēk` magnetite narrows for barbels and river-trout | `feathers`. `06–18` `FISH_NARROWS`, `18–06` `ROOST_PINE` |

---

## 6. Resources, workshop closure (`Ruling #1` & `Rulings #102–104`), hazards & sampler budget

### 6.1 `kits/resources`, `gather` tags & `CROOK-RIA-SCOPE.md` (§3.2–§3.3) input-output closure

| Good / Node | Source in `biomes/compasshills` | `[LOCAL]` Canton Upkeep (`6,500` Pop, `Zero-Iron Rule`) | `[TRADED]` Export (*The Pioneers*, *Amber Seal*, `Ria Dynasties`, `Spider Lake`, `Korona`) |
|---|---|---|---|
| **`lodestone = 220` (`gather: 'lodestone'`)** | `1,129` lode nodes across `100%` of polygon (`Station 2` spires & `Station 1` rim) | Survey compasses, non-sparking magnetic ore-separators, lightning-rod grounds | **#1 Planetary Magnet Supply:** monopolized with `85 mT` flux-compasses by **The Pioneers** (*Society of the Needle*, `PN-01..PN-15`) for hydro-dynamos & geodetic surveys |
| **`superconductor` (`salvage` reserve)** | `site:lodestone-arcology` (`1058, 224` subterranean cryo-toroid tunnels) | Strictly brokered by delver guild syndicates (`zero` local consumption) | Krator's premier source of pre-Cataclysm room-temperature **`Superconductors`**, shipped via `Upper/Lower Ria`, `Silkhead -> Shell -> Iziz` & `Ria Sound -> Farport` |
| **`amber = 120` (`ria-amber` coil-varnish)** | `385` local nodes along northern `Weeping Valley` seam (`amberstorax` groves on `Station 4` & `Station 1` N dips) | Waterproof tunnel-cordage pitch & lantern resin | Boiled by **Pioneers** engineers & *Sap-Breakers* into **dielectric coil-varnish** for hydro-dynamos & `Spider Lake` silk-wrapped telegraph wire; *Court of the Amber Seal* (*Kūri-Āmpala*) seal-wax |
| **`tin-bronze` tools (`tin = 200` + imported `Cu`)** | SE granite window (`tin = 200`, `6` cells) + `Springhollows`/`Upper Ria` copper | **Replaces `100%` of `iron-bar` tool/boot-nail upkeep** inside high-gradient cantons (`safeBronze === true`!) | Non-magnetic surgical, compass-gimbal & geomancer/Pioneer instruments |
| **`whorl-olive` oil, `saffron` & `sunnycarob`** | `Csa`/`Cfa` dip-slope terraces (`Station 3`) | Cooking fat, lamp oil, carob pod trail-flour, tunnel leather dressing | Culinary/dye exports down `Hām-Tsēk` (`1055, 219`); uniform carob seeds used as *Amber Seal* bullion carat standards |

### 6.2 Data-driven hazards (`core/hazard`, `KHAZ`) & 4-layer ambient audio (`STATIONS-AMBIENT-AUDIO.md`)

| Hazard ID | `KHAZ` Kind | Stations & Trigger Rule (`COMPASS_PHYS`) | Visual / Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`compass:magpull`** | `force` | `Stations 1, 2` (`ferrousPullAt(..., 2.0, gradB2).wrenchTool === true`, `< 15 m` from quench-vents & grade-high spires) | Bristling `ferrotuft` magnetite-needle rims & carved bronze warning stelae; wrenches ferrous weapons/tools and slows iron-clad walkers (`0.0` force on tin-bronze, copper, or nephrite gear!) |
| **`compass:lightning`** | `shock` | `Station 2 tors` (`lightningScoreAt(...).strikeProb01 >= 0.65` during `[Thunder-Squall]`) | Glassy teal-black fulgurite melt-tubes & ozone crackle on exposed `lodestonespire` crests; attracts `ATMOS` `fx/lightning.js` cloud-to-ground bolts |
| **`compass:compassspin`** | `field` (nav) | `Stations 1–4` (`bMagMt >= 0.5 mT` or `inversionSeam01 > 0.4`) | Swirling `compassbush` leaf streamlines & `fluxlichen` contour bands; deflects unshielded magnetic compasses toward local tor poles rather than geographic north |
| **`compass:narrows`** | `current` | `Station 4 gorge` (`9102` `Hām-Tsēk` `1,080 m³/s` magnetite canyon) | Boiling green-gold river eddies & black magnetite sandbars; sweeps iron-shod boat-poles against submerged magnetized ledges |

**Station-by-Station 4-Layer Procedural Audio (`biomes/STATIONS-AMBIENT-AUDIO.md` contract):**
- **Layer 1 (Atmospheric Bed):** Warm `1.41 atm` Mediterranean stone-pine wind sigh (`Stations 1, 3`) shifting to distant convective `Cfa` thunder roll (`Station 2`) or `1,080 m³/s` `Hām-Tsēk` river roar (`Station 4`).
- **Layer 2 (Botanical / Insect Texture):** Dry-summer sclerophyll `compassbush` leaf click-rustle + warm afternoon cicada-like hexapod stridulation across `Csa` dip-slopes.
- **Layer 3 (Ferromagnetic Foley):** Crisp **metallic magnetite-sand hiss** as wind gusts re-comb black `Fe3O4` grain chains across bare ironstone ledges + `ironcladbeetle` gunmetal elytra clicks against rock.
- **Layer 4 (Anomalous Accent):** Subtle **`55 / 110 Hz` magnetostrictive rock-hum** audible within `40 m` of `Lodestone`'s subsided toroidal quench-trench (`Station 1`), plus sharp lightning-strike transients on `Station 2` when `[Thunder-Squall]` is active.

### 6.3 Material & sampler budget (`<= 14` samplers, `KSHADOW` off at load)
- **Sampler budget:** `KGROUND` (`4` layers per station — zero extra ground layers added) + `KSTRATA` (`2`) + `ATMOS` + `fx/lightning` (`2–3`) + `KHORIZON` (`1`) + `KSHADOW` (`1` when `?shadow=1`) = **`10–12` active samplers (`<= 14` survey ceiling)**.
- **Bark bucket sharing (`7` buckets, `calls << 120`):** `ch_pine` (`bark.ponderosa`), `ch_cork` (`bark.cork`: cork oak & sunny carob), `ch_pistache` (`bark.madrone`: iron-pistache, cuesta arbutus & woody shrubs), `ch_juniper` (`bark.juniper`: whorl-olive & juniper), `ch_plane` (`bark.plane`: gorge plane, white mulberry & canyon grape), `ch_amber` (`bark.amber`: weeping-amber storax), `ch_wood` (`wood.gnarled`).
- **Dedicated library foliage cards across all 25 species (`materials.json`):** `card.pine`, `card.lobed` (`oak` & `storax`), `card.orchard.small` + `card.blossom` (`pistache`), `card.broadleaf.dry` (`olive`), `card.juniper`, `card.broadleaf` + `card.samara.maple` (`gorgeplane`), `card.heartleaf` (`silkmulberry`), `card.starberry` (`cuestaarbutus`), `card.orchard.broad` (`sunnycarob`), `card.petal.coral` (`gorgeoleander`), `card.broom` (`goldenbroom`), `card.cupflower` (`cistusrockrose`), `card.vine.hanging.2` (`canyongrape`), `card.fan.lace` (`seepmaidenhair`), `card.firelily` (`cuestaasphodel`), `card.crop.saffron`, `card.sage`, `card.grass.dry`, `card.moss`, `card.stipa` (`fluxgrass`), `card.frond.needle` (`magnetitespleenwort`), and `card.heath.whorl` (`gossanwhorlheath`).

---

## 7. Numbered `src/` architecture, rollout & verification invariants

### 7.1 Fragment map & `PORT.md` tags

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `buildlib.CORE_BIOME_MIN` + `31j, 32, 33, 35, 39, 41..44`, `KDRAWN`, `KRAND`, `KTAGS`, `KSPACE`, `KSTRATA`, `KRELIEF`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER`, `ATMOS` (+ `fx/lightning.js`), `CROPS` |
| `40-biome-compass-phys.js` | **`[G data]`** | `COMPASS_PHYS`: `fieldAt` / `fluxAt` (`azimuthRad` / `declinationRad`), `leafAzimuthAt`, `sandStreamAt`, `ferrousPullAt`, `lightningScoreAt`, `cuestaAspectAt` (zero `THREE`/DOM) |
| `41-biome-compass-sites.js` | **`[G data]`** | `COMPASS_SITES`: verified `5.1` pixels, toroidal multipole seeds, `KSTRATA` `banded-ironstone` columns, and `site:lodestone-arcology` / `site:ham-tsek-post` reserves |
| `45-host-stage.js` | `[web]` | Renderer, cuesta/tor/quench-moat/`Hām-Tsēk` heightfields (`KRELIEF`), `KDRAWN.add`, `BIO.init({tags:'compasshills'})` |
| `50-biome-compass-species.js` | `[draw]` | `COMPASS.SPECIES` (`25` species: `18` Earthlike + `7` ferromagnetic/gossan), `HV` tags, genuine library cards, shared bark buckets, `compassbush` / `lodestonespire` / `growTree` / `growWoodyShrub` / `growCanyonGrape` builders |
| `60-biome-compass-place.js` | **`[G data]`** | Deterministic `KRAND.hash` cell placement reading `COMPASS_PHYS.fieldAt` for instance yaw, `FERRO_KEYS` (`7` species) `85/15` matrix balance (`0.78 <= earthShare <= 0.90`), `KSPACE`, and `KTAGS` registration |
| `84-host-ground.js` | `[G shader]` | `KGROUND` (`4` layers, `<= 14` samplers, tangent-steered `sand` iron-ripple layer), `KSTRATA` `banded-ironstone` cliff shading, `KDRAWN` |
| `86-host-works.js` | `[draw]` | `site:lodestone-arcology` & `site:ham-tsek-post` reserves + `?works=0` zero-iron bronze/nephrite warning stelae, bronze quarry wedges, gimbal survey tripod, copper lightning-rods (`class: 'furniture'`) |
| `89a-host-atmos.js` & `89w-host-water.js` | `[draw]` | `ATMOS` (`1.44..1.34 atm`, `fx/lightning.js` tor-targeted strikes, magnetite dust motes), `WATER.flow` (`Hām-Tsēk` & cuesta brooks) / `still` |
| `99-host-take.js` | `[web]` | `KHOST.take`: live HUD Compass-Needle indicator, `[Clear] / [Thunder-Squall]` & `[Field Overlay]` toggles, compliant preset views, `FERRO_KEYS` & 25-species `hostChecks()` |

### 7.2 Rollout milestones (`CH0–CH5`)
- **`CH0`:** Land `PLAN.md`; add `"biomes/compasshills"` to all 5 lists in `tools/checks_optin.json` and append the 4 material prompts to `core/materials/PROMPTS-NEEDED.md`.
- **`CH1`:** Implement `src/40-biome-compass-phys.js` + `src/41-biome-compass-sites.js` (`[G data]`) and pass `node biomes/compasshills/tests/test-compass-phys.js` on `tools/ktest.js`.
- **`CH2`:** Build **Station 1 `foundry`** (`dist/compasshills.html`): `Lodestone` quench-ring trench, `compassbush` vector-field whorls, tangent-steered `ground.sand.magnetite`, live HUD Compass-Needle, `verify.py --assert` (`checks=harness.SURVEY`).
- **`CH3`:** Build **Station 2 `tors`** (`-tors` with `fx/lightning.js` spire strikes), **Station 3 `cuesta`** (`-cuesta` `180°` domain-wall saddle), and **Station 4 `gorge`** (`-gorge` `Hām-Tsēk` magnetite narrows).
- **`CH4–CH5`:** Register `CROPS.BIOMES.compasshills` (`test-crops.js`) and the 6 `kits/fauna` records; complete `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; pass `check_core_use.py`, `check_botany.py`, and `python3 tools/test_all.py`.

### 7.3 Z-fighting separation & `verify.py --assert` invariants (`T.ok` + `T.neg`)
1. **Divergence-free multipolar field & `180°` domain-wall inversion (`fieldAt`):** Proves finite $|\mathbf{B}| \in [0.3, 120]\text{ mT}$ across `Stations 1–4`, `360°` azimuth rotation around `Lodestone` toroidal poles (`Station 1`), and an exact `> 150°` azimuth flip across `40 m` at `Station 3`'s `inversionSeam01` saddle (`T.neg`: zero NaN singularities at dipole cores).
2. **Compass-leaf vector alignment (`leafAzimuthAt`):** Asserts in both Node and `verify.py` `hostChecks()` that every placed `compassbush` where `bMagMt >= 0.5 mT` has its blade yaw within `±12°` of `COMPASS_PHYS.fieldAt(x, z).azimuthRad`, whereas inside `inversionSeam01` (`|\mathbf{B}_{\text{horiz}}| < 0.05\text{ mT}`) alignment drops `< 0.2` (`T.neg`).
3. **Zero-iron safety & Kelvin pull physics (`ferrousPullAt`):** Proves `wrenchTool === true` (`forceN > 180 N` on `2 kg` iron) within `12 m` of `Lodestone` quench-vents while `safeBronze === true` (`forceN < 0.05 N`) for tin-bronze and nephrite tools everywhere (`T.neg`: zero `iron` material tags on `?works=0` delver props!).
4. **Coplanar depth hygiene, `85% / 15%` matrix balance & site reserves:** `fluxlichen` bands blend via `KGROUND` / vertex displacement (`>= 0.015 m` normal offset, zero coplanar decal z-fighting on `lodestonespire` faces); Earthlike pine/oak/pistache/olive/grass matrix holds `78–90%` of instances; zero `class === 'building'` records intrude into `site:lodestone-arcology` or `site:ham-tsek-post`; `< 15` active shader samplers; `KSHADOW` off at load; positive `KDRAWN` eye clearance.

---

## 8. `build.py` assembly, `openworld/` vector-field streaming & Godot `4.7.2` twin contract

### 8.1 `build.py` deterministic cross-platform assembly (`AGENTS.md` rules)

```python
#!/usr/bin/env python3
"""Build biomes/compasshills stations -> dist/compasshills[-<station>].html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS check

STATIONS = ('foundry', 'tors', 'cuesta', 'gorge')
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
  "id": "foundry",
  "title": "Compass Hills — Lodestone Quench-Ring & Toroidal Vent Rim",
  "px": [1058, 224],
  "elevM": 876.5,
  "pAtm": 1.43,
  "koppen": "Cfa",
  "rainMmYr": 863,
  "toroidRadiusM": 420.0,
  "peakFieldMt": 85.0,
  "strataStack": "banded-ironstone",
  "kin": ["swlowlands", "wouterwall"],
  "reserves": [
    { "id": "site:lodestone-arcology", "x": 0, "z": 0, "r": 145 }
  ],
  "modes": ["Clear", "Thunder-Squall", "Field Overlay"]
}
```

```json
{
  "slots": {
    "ground_grass": "ground.dry_grass",
    "ground_needles": "ground.needles",
    "ground_gravel": "ground.gravel019",
    "ground_lichen": "ground.lichen.crust",
    "strata_ironstone": "rock.gneiss.banded",
    "rock_gossan": "rock.gossan",
    "rock_tor": "rock.granite.tor",
    "bark_pine": "bark.ponderosa",
    "bark_oak": "bark.juniper",
    "wood_dead": "wood.gnarled",
    "card_pine": "card.pine",
    "card_oak": "card.broadleaf",
    "card_grass": "card.grass.dry"
  }
}
```

### 8.3 `verify.py` shared-harness specification (`tools/harness.py` — no pasted launcher)

```python
#!/usr/bin/env python3
"""Verify biomes/compasshills stations via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

PAGES = {
    'foundry': 'dist/compasshills.html',
    'tors':    'dist/compasshills-tors.html',
    'cuesta':  'dist/compasshills-cuesta.html',
    'gorge':   'dist/compasshills-gorge.html',
}

if __name__ == '__main__':
    harness.main(
        pages=PAGES,
        default_page='foundry',
        checks=harness.SURVEY,   # <15 samplers, KSHADOW off at load, compliant view names, leafAzimuthAt audit
    )
```

### 8.4 `openworld/` 1:1 magnetic field evaluation & Godot `4.7.2` parity
- **Seamless regional vector field (`core/world`):** In 1:1 `openworld/` streaming over `rmweu4kpowzji`, `COMPASS_PHYS.fieldAt(worldX, worldZ)` evaluates the global `Lodestone` (`x = 1058 * 2000`, `z = 224 * 2000`) toroidal multipole plus deterministic `KRAND.cell(worldSeed, ix_2km, iz_2km)` tor dipoles (`3×3` cell neighbourhood lookup), guaranteeing $C^\infty$-smooth, seam-free `compassbush` leaf azimuths, HUD compass deflection, and `compass:magpull` forces across every `500 m` chunk boundary!
- **Godot `4.7.2` GDScript twin (`godot/krator/biome/compass_phys.gd`):** Pure `[G data]` math (`x == null ? d : x` defaults, zero `THREE`, zero DOM) exports `golden-compass-phys.json` vectors (`bx, by, bz, leafYaw, forceN`) from `test-compass-phys.js` so Godot's player compass UI, iron-equipment physics, and `MultiMeshInstance3D` shrub rotations match the browser build to `1e-6` radians.
