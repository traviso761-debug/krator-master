# doubledelta: the plan (locked design, 2026-11-21)

**The Great Double Delta** (`rmvdoubledelta` / `double delta` and `rmwgux56yzw8l` / `Delta` in Scale Model `5.1`): Krator's largest ocean-facing alluvial wetland (`50,268 km²` outer envelope, `34,292 km²` dry land, with a **`16,320–17,736 km²` ultra-flat `< +25 m` marsh bowl**), built where the northern continent's great river network — **`9101` `Ria River` (`Mā-Rīa`, `4,850 m³/s`)**, **`9103` `Tōng-Mā` (`1,420 m³/s`)**, **`9107` `Pāk-Mā` (`1,380 m³/s`)**, and **`9104` `Sī-Mā` (`520 m³/s`)** (`8,170 m³/s` combined discharge) — empties westward out of **Ria Sound** (`626, 140`) into the `0 m`, `1.60 atm` Western Ocean.

In `1.60 atm` tropical monsoon air (`Am`, `+30 °C` annual mean, `2,243–2,557 mm/yr` rain), a sheltered delta of this size on Earth would carry towering swamp forest and dense river cities. **Double Delta carries neither.** Battered every `3–7 years` by `3–10 m` surges from the near-field **Steaming Seamounts** (`176, 322` & `166, 338`, `81 min` travel) and drowned `12–22 m` deep every **`20–35 years`** (`2–3×` per human lifetime) by **unshadowed WNW (`287°–294°`) "Ghost / Orphan Tsunamis"** arriving silently after `3.8–6.5 hours` from the Globe's `14–15 km` stagnant-lid **Farside Tsunami Shields** (`9.5°S, 88.5°W` & `4.2°N, 104.5°W`) with zero felt local earthquake, **structural rigidity is fatal across the entire `< +25 m` plain**. Brittle woody trees snap and uproot before reaching maturity; permanent human towns are impossible (`67.5%` of the marsh bowl lies `15–73.8 km`, median `24.3 km`, from `>= +25 m` refuge).

What thrives instead is a flat, island-less, **hydro-elastic and amphibious disturbance wilderness** on `95.3% sedimentary` silt, peat, lignite, and glauconitic blue clay: **house-sized colonial siliceous-spongin sponge-hummocks** (`1–6 m` domed and chimneyed bioherms that compress under a bore, drink the surge, and filter-feed on plankton and monsoon mist), **whip-flexible calcified sea-pen meadows** that lie flush in `20-knot` currents and spring upright as backwash drains, **bellows-reeds and `bamboo-rice` swards on floating peat-mats** tethered by `15–25 m` elastic tap-rhizomes, **giant `Sea-Byssus` pen-shells** anchored to storm-sorted shell lags by golden keratin cables, iridescent **`bitumen` tar-seeps**, and **scoured Oligocene-style `blue-clay` `ria-amber` lag gullies** ripped open by mega-tsunami backwash — watched from safe high ground at **`Ria Sound` (`626, 140`, `+41.3 m` lower slipways / `+65..+140 m` upper town bluffs)**.

Status: **Build-ready plan** incorporating the owner's locked geological, tsunami, and settlement rules (`CROOK-RIA-DECISIONS.md` §1.5, §2.1). **Explicitly supersedes** the older flood-basalt / columnar-island assumption in `biomes/arch/PLAN.md` §17.1 and `biomes/riavalley/PLAN.md` §1–§2 (see §2.2 below). Zero scale-model rasters, `LORE.md` lines, or existing builds are modified by this plan.

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/doubledelta/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Kind** | Standalone multi-station biome kit on the shared biome core (`buildlib.CORE_BIOME_MIN` + extensions), taking all 2026-11-11 survey checks (`tools/checks_optin.json`) from its first commit (`tools/new_build/README.md`) |
| **Scale-Model Polygons** | **`rmvdoubledelta`** (*double delta*, `50,268 km²` total / `34,292 km²` dry, outer biome envelope) and **`rmwgux56yzw8l`** (*Delta*, `38,832 km²` total / `23,300 km²` dry, inner `100% Am` marsh-and-mouth polygon); all coordinates on the Scale Model `5.1` (`1821 × 1723`, `2 km/px`) canvas |
| **Pages (`5` Stations)** | `dist/doubledelta.html` (**Station 1 `braid`**: Main Sponge-Hummock & Sea-Pen Distributary Braid at `556, 160`), plus `--station scour` (`572, 130`), `--station bar` (`516, 172`), `--station throat` (`626, 140` *Ria Sound* Overlook), and `--station lip` (`512, 160` Western Serpentinite Contact Cove) |
| **Objects** | **`DDELTA_PHYS`** (`[G data]` in `src/40-biome-ddelta-phys.js`: pure tsunami-bore drag, reconfiguration elasticity, estuarine silica/salinity mixing, blue-clay amber scour, trimline, and Earthly/Kratorian ecotone rules; tested by `tests/test-ddelta-phys.js` on `tools/ktest.js`) and **`DDELTA`** (`BIOME-API.md` kit registry in `BIO.kit('doubledelta')`) |
| **Read in place (`BIO.kin`)** | **`biomes/nwlowlands`** & **`biomes/swlowlands`** (woody gallery oaks, camphor, pines, and bamboo **strictly above the `+25 m` tsunami trimline** on Station 4 `throat`); **`biomes/arch`** (candelabra araucarias, she-oak, `Pycnandra` blue-sap nickel-hoarders, and `verdigris` caps **strictly on the `X <= 514` western ultramafic fault-lip** on Station 5 `lip`); **`biomes/farside`** (`wineweed` / `stormwrack` drift-flora references by coastal dispersal, without land-kelp forests below the scour ceiling). Zero fragments copied |
| **Out of scope** | Permanent city/port architecture at **`Ria Sound` (`626, 140`)** (held clear as a registered `core/tags` settlement site for a later `core/city` / `settlements/` build); editing `tools/scale-model/model/data/*` or `LORE.md`; active `core/simulation` sea-trade ticks |

---

## 1. Core adoption & 2026-11-11 survey checks (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

Written before the first fragment and verified against `tools/check_core_use.py` (`REQUIRED['biomes'] = ['biome', 'rand', 'tags', 'host', 'atmos', 'water']`) and `tools/new_build/README.md` (survey items 22–31):

### 1.1 Modules taken

| Module | Fragments / Path | What `biomes/doubledelta` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `33b-core-bamboo.js`, `35-core-anim.js`, `37-core-traps.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('doubledelta')` namespace, `BIO.fung` for colonial sponge-chimneys and Kratorian symbiont caps, `33b` culms for `bamboo-rice` and bellows-reeds, `35`/`39` current-and-wind lean + surge reconfiguration sway, `37` (`KTRAPS`) for filter-valve / snapping hydroid records, `32` `BIO.kin` for `arch` and `nwlowlands`/`swlowlands` rim flora, octahedral impostors on bluff trees, runtime LOD & world export |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` | Registers every station's drawn terrain & peat-mat strip grid via `KDRAWN.add(KDRAWN.grid(...))` so `verify.py` eye/ground-clearance audits measure the real drawn surface (survey item 28) |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Every cell draw, hummock cluster, shell-lag patch, amber nodule, and wave/bore seed keyed on `KRAND.cell(seed, ix, iz)` and `KRAND.hash(world, cell, index, salt)` — never `Math.random`, `mulberry32`, or `Math.sin` |
| **`core/tags`** | `core/tags/50-core-tags.js`, `52-core-tags-vocab.js`, `53-core-tags-host.js` (`KTAGS`) | Every placed sponge bioherm, sea-pen stand, reed mat, `Sea-Byssus` bed, amber scour-pocket, bitumen seep, hazard volume, seasonal harvesting rack, and the `Ria Sound` settlement reserve registered in `KTAGS` before draw |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Order-free keep-clear occupancy between multi-metre sponge bioherms, tidal channels, shell-lag bars, and seasonal skiff-poles |
| **`core/coast`** | `core/coast/30-core-coast.js` (`KCOAST`) | Natural grid-free `marsh`, `sand`, `rock`, and `cliff` shoreline profiles, signed coast distance `coastC`, and class weights (`coast:marsh`, `coast:sand`, `coast:cliff`) binding distributary islands, surf-bars, and the `Ria Sound` / serpentinite headlands |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` recipes (`carbonate-shelf` + `loess` on Station 4 `throat`; `arch-rift-basalt` / `serpentinite` fault footwall on Station 5 `lip`; custom local `delta-amber-bed` lignite-over-blue-clay seam on Station 2 `scour`); `KGROUND` hex-tiled height-blended ground layers (`<= 5` samplers per station, well below the 15-sampler warning gate) including `'sand'` ripple/glint kind on Station 3 `bar`; `KFAR` (`14 km` flat drowned-labyrinth & bluff horizon) and `KHORIZON` |
| **`core/water`** | `20-core-water.js`, `21-core-water-shore.js`, `22-core-water-flow.js`, `50-core-water-draw.js`, `51-core-water-kinds.js`, `ext/56-core-water-breakup.js`, `ext/57-core-water-audit.js`, `ext/58-core-water-mirror.js`, `ext/60-core-water-fields.js`, `ext/61-core-water-plume.js`, `farbed/53-core-water-farbed.js` | `WATER.open` with `1.60 atm` WNW ocean rollers and heavy shoaling surf on Station 3 `bar` + calm inner sound on Station 4 `throat`; `WATER.flow` for braided silt-gold distributaries and backwash scour gullies; `WATER.still` for slackwater peat-ponds and iridescent `bitumen` tar-rimmed pools; `WATER.plume` (`ext/61`) for the `4,850 m³/s` `Mā-Rīa` golden-brown sediment front colliding with blue-green ocean swell; `farbed/53` to erase shore-window edges |
| **`core/atmos`** | `89-atmos-0-core.js`, `0p-presets.js`, `3-particles.js`, `4-weather.js`, `8-export.js`, `9-host.js`, `a-waves.js`, `b-skylight.js`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover.js`, `fx/lightning.js` | Shared Krator sky (`ATMOS.skyPreset('standard', ...)` at each station's `5.1` pixel shifted by `-272, -330` to the sky frame; `pressure: 1.60`), `#include <atmos_waves>`, `ATMOS.skylight` PBR reflections, warm `Am` monsoon squalls, sea-spray particles on `bar`, dawn mist (`heightfog`) threading the sponge channels |
| **`core/hazard`** | `core/hazard/20-core-hazard.js`, `21-core-hazard-flow.js` (`KHAZ`) | Data-driven hazard volumes: `mire` (thixotropic glauconitic blue-clay quicksand in fresh scour gullies), `tar` (viscous warm `bitumen` seeps), and dynamic tsunami `drawdown` / `bore` state preview (`[Calm]`, `[Drawdown]`, `[Surge]` host bar controls) |
| **`core/materials`** | `core/materials/record/23-mat-record.js`, `25-matlib-host.js` + `tools/textures/matlib_pack.py` | Packed library textures from `materials.json` (`tex/pack.json`), keeping active WebGL samplers `<= 12` per program |
| **`core/shadow`** | `core/shadow/10-core-shadow.js`, `host/12-core-shadow-host.js` (`KSHADOW`) | Sun shadow cascade **off at page load** (`?shadow=1` or panel toggle attaches it on demand, per owner rule 2026-11-03) |
| **`core/host`** & **`core/walk`** | `khost.FULL` + `94-host-polytool.js` | Camera, walk controller, world clock, inspector hover/click tags, polygon coordinate tool, `[Surge]` elastic-reconfiguration demo toggle, preset views, `window._api` |
| **`core/export`** | `core/export/07-core-export.js`, `09-core-export-adapters.js` | `krator-world` tile & `DDELTA_PHYS` export for `openworld/` and Godot `4.7.2` |
| **`kits/crops`** | `kits/crops/src/10-crop-core.js`, `20-crop-records.js`, `22-crop-material.js`, `40-crop-query.js` (`CROPS`) | Read in place (`[G data]`): registers `CROPS.BIOMES.doubledelta` and drives deterministic wild/semi-tended `bamboo-rice`, `wild-rice`, `taro`, `wineweed`, `mat-reed`, and bluff-rim `tea`/`camphor` placement |
| **`kits/fauna`** | `kits/fauna` (`[G data]` records first) | Registers Double Delta's six hexapod, bivalve-associate, and amphibious species with biome tags, diets, yields, and schedules |
| **`kits/resources`** | Read-only contract (`kits/resources/GEOLOGY.md`, `data/geology.json`) | Honours exact `5.1` prospectivity bytes (`coal = 228`, `oil = 157`, `clay = 255`, `silica = 150`, `amber = 120`, `peat = 158`, `bitumen = 118`, W-lip `ultramafic = 255`, `nickel = 180`, `jade = 150`); places `amber` and `bitumen` as `owner` nodes where scour/seeps expose them |

### 1.2 Modules deliberately NOT taken (with reasons)

| Module | Taken? | Why not |
|---|---|---|
| **`core/mask`** (`KMASK`) | **No** (on station showcases) | Every station's channels, bars, scour gullies, and zones are evaluated directly from pure `[G data]` functions (`DDELTA_PHYS.*`), never raster pixel reads (`getImageData` is zero); in `openworld/`, `KCOAST` uses `KMASK.distance` through `core/world/44c-world-coast.js` |
| **`core/city`**, **`core/hamlet`**, **`core/camp`** | **No** | **Locked owner rule:** ZERO permanent settlements or camps exist inside the `< +25 m` tsunami bowl; the permanent `Ria Sound` port (`626, 140`) sits on the `>= +65 m` bluff and is reserved as a site record for its own settlement build |
| **`core/simulation`**, **`core/sched`** | **No** | Biome showcase pages carry no NPC crowd loop; fauna records include `core/sched`-compatible schedule scaffolding as plain data |
| **`core/engine`**, **`core/furnish`**, **`core/catalog`** | **No** | No buildings or furnished rooms; light sacrificial delta harvesting props (skiff-poles, sponge-drying racks, reed blinds) are simple tagged outdoor `furniture` meshes in `86-host-works.js` (`?works=0`) |
| **`core/ruins`** (`KRUINS`) | **No** | No stone ruins stand in the `< +25 m` sedimentary marsh bowl (unshadowed bores bury or scour rigid masonry beneath metres of silt and lignite; haunted Ancient ruins belong upriver in `Weeping Valley` `rmwetzg8idewz`) |
| **`core/water/geyser`** | **No** | No volcanic vents, geysers, or boiling fumaroles exist in `rmvdoubledelta` (non-volcanic `95.3% sedimentary` basin; cold/warm `28–34 °C` alkaline seeps on Station 5 `lip` use `WATER.still` / `WATER.flow`) |
| **`core/lod`**, **`core/minimap`** | **No** | Single-station `5.2–6.4 km` biome pages use `core/biome`'s chunk LOD and `KFAR`, matching `arch`, `farside`, and `rheolith` |

### 1.3 New-build survey compliance (`tools/checks_optin.json`, items 22–31)

From its first commit, `"biomes/doubledelta"` is appended to all five lists in `tools/checks_optin.json`:
- **`recorded`** (item 25): `build.py` calls `buildlib.through_tools_build(__file__)` at top so `build-inputs.json` is always written and Git LFS pointers are refused (`python3 tools/lfs_needs.py biomes/doubledelta --pull`).
- **`minset`** (item 26): `CORE_BIOME` starts from `buildlib.CORE_BIOME_MIN` and extends it — never hand-copied.
- **`samplers`** (item 27): `verify.py` runs `harness.verify_page(..., checks=harness.SURVEY)`, enforcing `< 15` active texture samplers on every linked shader program.
- **`drawn-ground`** (item 28): `KDRAWN` registers every station's ground mesh so camera eye checks test real drawn triangles.
- **`names`** (item 30): zero apostrophes (`'`) or colons (`:`) in any preset view name across all five stations.

---

## 2. Geological & hydrological ground truth (`Scale Model 5.1`)

### 2.1 Exact surveyed raster & `geology.json` metrics (`1821 × 1723`, `2 km/px`)

Scale Model `5.1` (`tools/scale-model/model/src/51-region-store.js`) defines two nested biome polygons over the estuary mouth:
1. **`rmvdoubledelta` (`double delta`)** — the broader coastal-and-rim biome envelope (`X = 502..625, Y = 98..208`).
2. **`rmwgux56yzw8l` (`Delta`)** — the tight alluvial marsh-and-distributary core (`X = 493..628, Y = 107..215`).

| Metric (verified on `h.png`, `wl.png`, `c.png`, `p.png`, `tm/tw/tc.png`, `geology.json`) | `rmvdoubledelta` (*double delta* envelope) | `rmwgux56yzw8l` (*Delta* marsh core) |
|---|---|---|
| **Total / Dry / Sea+Sound Area** | `50,268 km²` total / **`34,292 km²` dry** / `15,976 km²` water | `38,832 km²` total / **`23,300 km²` dry** / `15,532 km²` water |
| **Dry Marsh Bowl `< +25 m`** | **`17,736 km²`** (`p10 / p50 / p90`: `+2.1 / +6.6 / +12.9 m`) | **`16,364 km²`** (`16,320 km²` contiguous bowl; `+2.1 / +6.6 / +11.5 m`) |
| **Full Dry Elevation (`p5 / p10 / p50 / p90 / p95`)** | `+2.1 / +2.5 / +20.6 / +516.0 / +696.8 m` (rim bluffs) | `+2.1 / +2.1 / +8.8 / +229.5 / +350.7 m` |
| **Distance of `< +25 m` Bowl to `>= +25 m` Refuge** | Median **`22.1 km`**, max **`73.8 km`** (`62.0%` at `>= 15 km`) | Median **`24.3 km`**, max **`73.8 km`** (**`67.5%` at `15–73.8 km`**) |
| **Surface Pressure & Gravity** | **`1.60 atm`** (`1.56–1.59 atm` on rim bluffs), `g = 7.4 m/s²` (`0.75 g`) | **`1.60 atm`** (`pO2 ≈ 0.33 atm`), `g = 7.4 m/s²` (`0.75 g`) |
| **Climate & Rainfall** | **`Am` 94.3%** (`32,352 km²`), `Cfa` 5.5% (upper bluffs); **`2,243 mm/yr`** med (`2,478 mm` in bowl) | **`Am` 100.0%** (`23,292 km²`); **`2,431 mm/yr`** med (`2,478 mm` in bowl) |
| **Temperatures (`Mean` / `Warm` / `Cold`)** | **`+30.0 °C`** (`+39.0 °C` warm / `+22.0 °C` cold) | **`+30.0 °C`** (`+39.0 °C` warm / `+22.0 °C` cold; `+31 °C` in inner braids) |
| **`geology.json` Provinces (`4 km` cells)** | **`95.3% sedimentary`** (`33,008 km²`), **`4.7% ultramafic`** (`1,632 km²` W lip) | **`91.0% sedimentary`** (`21,568 km²`), **`9.0% ultramafic`** (`2,128 km²` W lip) |
| **39-Family Mineral Bytes (`max`, node count)** | `clay = 255`, `wood/water = 255`, **`coal = 228`** (`2,456` nd), **`oil = 157`** (`413` nd), **`peat = 158`** (`606` nd), **`silica = 150`** (`384` nd), **`amber = 120`** (`304` nd), **`bitumen = 118`** (`118` nd); W-lip `ultramafic = 255`, **`nickel = 180`** (`46` nd), `jade = 150` (`8` nd) | Same sedimentary lignite-clay-amber-bitumen suite across the entire `X > 514` delta plain; `ultramafic` / `nickel = 180` strictly confined to `X = 493..514` |

### 2.2 Explicit geological override: flat, island-less `95% sedimentary` bowl (no basalt island chains)

Earlier seed notes (`biomes/arch/PLAN.md` §17.1 and `biomes/riavalley/PLAN.md` §1–§2) sketched `Double Delta` with `40–90 m` `arch-rift-basalt` columnar sea-stack gates splitting the delta interior. **Per the owner's locked geological rule (`CROOK-RIA-DECISIONS.md` §2.1), that assumption is overridden:**

1. **`The Arch` is a magma-starved serpentinite tidal dilational band (`biomes/arch/PLAN.md` §1), NOT a flood-basalt plume or spreading mid-ocean ridge.** Its exhumed mantle footwall runs offshore along the NW coast and clips **only the far western lip** of the delta between `X = 493..514, Y = 148..168` (`4.7%` of `rmvdoubledelta`, where `geology.json` records `province = ultramafic`, `nickel = 180`).
2. **East of `X = 514` across the entire `16,320–17,736 km²` `< +25 m` delta bowl (`X = 515..622, Y = 114..188`), bedrock lies deeply buried beneath unconsolidated `sedimentary` alluvium, `peat = 158`, `coal = 228` lignite, and Oligocene-style glauconitic `clay = 255`.**
3. **Rule for all stations and openworld tiles:** **DO NOT place chains of columnar-basalt islands, sea-stacks, or rocky tors inside the sedimentary delta bowl.** Relief inside the bowl (`+0.2 m` to `+12.9 m`) comes exclusively from living **sponge bioherms (`1–6 m`)**, **natural silt/shell distributary levees (`1–4 m`)**, **tethered peat-mat domes (`0.5–2.5 m`)**, and **tsunami backwash scour-gullies (`-4 m` to `+4 m`)**. Hard rock appears only on the surrounding `>= +25 m` mainland bluffs (`Ria Sound` `626, 140`, `carbonate-shelf` + `loess`) and along the far western `X <= 514` serpentinite contact cove (`Station 5 lip`).

### 2.3 Five-river convergence & why it is called *The Great Double Delta*

Verified in `tools/scale-model/model/data/rivers.json`, five named rivers drain `850,000+ km²` of northern `Ria Valley`, `Arcflow`, and `Neo-Ozarks` loess/karst country into the basin, splitting into **two primary tide-and-swell-reworked delta lobes** (a **Northern `Tōng-Mā` / `Sī-Mā` Lobe** around `Y = 126..154` and a **Southern `Mā-Rīa` / `Pāk-Mā` Main Trunk Lobe** around `Y = 156..196`, separated by drowned central subtidal shoals rather than rock islands):

| River ID & Canonical Name (`rivers.json`) | Length | Mouth / Confluence (`5.1` px) | Discharge `Q` | Sediment & Chemical Load Delivered to `Double Delta` |
|---|---:|---|---:|---|
| **`9101` `Ria River (Mā-Rīa)`** | `2,140 km` | Enters throat S of `Ria Sound`, triple confluence at `(590, 158)`, ocean mouth at **`(490, 186)`** | **`4,850 m³/s`** | Golden-buff calcareous loess silt, dissolved biogenic **orthosilicic acid (`H4SiO4`, `18–28 mg/L`)**, `Neo-Ozarks` `Ca2+/HCO3-` carbonate hardness, and reworked upriver `ria-amber` |
| **`9103` `Tōng-Mā` (*North Ria Distributary*)** | `780 km` | Drains `Arcflow` & NE `Arch` margin via `(558, 113)` to **`(590, 158)`** (and northern braid channels `512..560, 132..152`) | **`1,420 m³/s`** | High dissolved silica + trace `Mg2+`/`Fe2+` from the `Arcflow` piedmont; feeds the northern sponge-hummock labyrinth and `562, 114` oil/bitumen seeps |
| **`9107` `Pāk-Mā` (*North Ria Fork*)** | `740 km` | Joins `Mō-Mā` at `(645, 134)`, passes `Ria Sound` throat `(618, 142)`, joins `Mā-Rīa` at **`(590, 158)`** | **`1,380 m³/s`** | Organic humic acids, peat tannins, and fine kaolinite/glauconite clay |
| **`9104` `Sī-Mā` (*South/North-Rim Distributary*)** | `310 km` | Enters from `(555.9, 87.0)` into `Tōng-Mā` at **`(558, 113)`** | **`520 m³/s`** | Incises lignite (`coal = 228`) and `oil = 136..146` beds along the northern delta margin |
| **`9108` `Mō-Mā`** *(upriver feeder)* | `340 km` | Joins `Pāk-Mā` just E of `Ria Sound` at **`(645, 134)`** | **`480 m³/s`** | Contributes to `Pāk-Mā`'s `1,380 m³/s` throat discharge |

---

## 3. Two-source tsunami regime & hydro-elastic physics (`DDELTA_PHYS`, `[G data]`)

### 3.1 The two planetary wave engines (`CROOK-RIA-DECISIONS.md` §1.5)

1. **Near-Field Source — `Steaming Seamounts` (`176, 322` Krakatoan caldera `r = 32 km` & `166, 338` Surtseyan vent `r = 24 km`):**
   - Distance `~720–840 km` SW (`229°–255°` bearing); travel time **`~81 minutes`**.
   - Preceded `35–50 minutes` earlier by felt ground roll, sky-darkening ash plumes, and acoustic shockwaves.
   - Partially baffled by `The Arch`'s horst chain (`229°–279°` shadow), refracting around `500, 150` as `2–6 m` surging bores up the distributaries.
2. **Unshadowed Far-Field Mega-Source — `Farside Tsunami Shields` (`gallery/krator-globe`):**
   - Two colossal stagnant-lid heat-pipe shield volcanoes rising **`14.2 km` and `15.2 km` from the `-4.1 km` abyssal plain** (**`Shield S`** at `9.5°S, 88.5°W`, `~2,350 km`, **`3.8 hr`** travel; **`Equatorial Shield N`** at `4.2°N, 104.5°W`, `~4,050 km`, **`6.5 hr`** travel).
   - Because Krator has no moving plates to carry edifices off their mantle plumes, their oversteepened submarine flanks shed `100–1,000+ km³` Hilina-class debris avalanches every generation along bearings **`287°–294°` (WNW)** — **bypassing `5.1`'s `The Arch` cleanly to the north and firing straight down the throat of `Double Delta`!**
   - **"Ghost / Orphan Tsunami" Signature:** At `2,350–4,050 km`, **zero earthquake is felt on the delta**. Under a bright blue `Am` sky, the first local physical tell is a **rapid `8–20 m` pre-bore ocean drawdown** (`12–25 minutes` before impact) that sucks distributary channels dry, leaves fish flapping on `blue-clay` mud, and triggers the sponge-hummocks' ostial valve-snap.

### 3.2 Recurrence spectrum & why `0.75 g` + `1.60 atm` selects for hydro-elasticity

| Disturbance Tier | Combined Return Period | Crest at Outer Bar (`516, 172`) | Bore Depth & Speed Across `< +25 m` Bowl | Geomorphic & Biological Consequence |
|---|---|---|---|---|
| **Tier 1: Minor Surtseyan / Shield Bench-Slump** | **Every `3–7 years`** | `3–10 m` | `1.5–5 m` depth, `4–7 m/s` (`8–14 kt`) | Flushes `< +8 m` channels twice a decade; snaps brittle woody saplings; delivers marine plankton & salt pulses `25 km` inland to terrestrial sponges |
| **Tier 2: Major Flank Slump ("Ghost Bore")** | **Every `20–35 years`** (*`2–3×` per human lifetime*) | `15–25 m` | **`12–22 m` depth**, `8–12 m/s` (`16–23 kt`), shear `400–900 Pa` | **Drowns 100% of the `< +25 m` marsh bowl.** Any rigid tree (`> 2.5 m`) suffers trunk-snapping bending moment or liquefaction uprooting; sponges compress, sea-pens flatten, tethered peat-mats float vertically on `20 m` rhizome cables |
| **Tier 3: `15 km`-Edifice Hilina Mega-Collapse** | **Every `150–300 years`** | `35–55 m` (`50 m` nominal; `+65 m` scour ceiling on outer faces) | **`18–26 m+` sheet**, violent `10–15 m/s` channelised backwash | Strips `peat = 158` and `coal = 228` lignite caps along backwash chutes, cutting `-3 to -6 m` **glauconitic `blue-clay` gullies** that winnow buoyant **`ria-amber`** (`SG 1.06`) into rich lag pockets (triggering post-tsunami skiff rushes from `Ria Sound`!) |

### 3.3 Why terrestrial sponges & sea-pens work physically on Krator

On Earth, sponges (`Porifera`) are confined to water (plus seasonal freshwater *Spongillidae* resting gemmules on Amazonian flood-trees) because 1.0 atm dry air desiccates choanocyte chambers and pure collagen collapses under `1 g`. In `Double Delta`, **four physical parameters of Scale Model `5.1` converge**:
1. **Silica glut (`18–28 mg/L` `H4SiO4` + `silica = 150`):** `8,170 m³/s` of warm water draining `748,000 km²` of northern loess and `Arcflow` sediments saturates the estuary with dissolved silica, letting colonial sponges precipitate interlocking **opal-A megasclere truss-lattices** bound in elastomeric **spongin** (`E_bulk ≈ 0.4–1.8 MPa`, compressive strain to `55%` without fracture) — boosted `1.33×` in self-supporting dome height (`1–6 m`) by Krator's **`0.75 g` (`7.4 m/s²`)** gravity.
2. **Saturated `1.60 atm` `Am` boundary layer (`2,478 mm/yr` rain, `+30 °C`):** Dense `1.60 atm` air (`pO2 = 0.33 atm`) slows evaporative mass transfer while daily coastal mist, monsoon downpours, and `0.6 m` libration tides keep internal sponge canals at `100%` relative humidity between surges. When exposed to air, external **pinacoderm valve-lips** seal the `1–3 mm` inhalant *ostia*, holding `200–800 L/m³` of water inside capillary mesohyl reservoirs where endosymbiotic **cyanobacteria / Kratorian retinol-plastids** photosynthesise by day and filter-chambers digest trapped mist/tidal picoplankton!
3. **Vogel hydrodynamic reconfiguration (`F_drag ∝ v^(2 + B)` with Vogel exponent `B ≈ -0.8 to -1.1`):** Where a rigid tree crown has `B ≈ -0.2` (drag rises nearly with `v²`, snapping trunks at `v = 10 m/s` water flow), a **whip sea-pen** (`calcified calcite-gorgonin axial rod` + basal muscular *peduncle* anchor) bends `85°` flush into the silt boundary layer (`z < 0.08 m`, reducing drag **`9–12×`**) and retracts polyps into fleshy rachis leaves; a **domed sponge bioherm** streamlines and compresses `35–55%` under dynamic pressure while its one-way *oscular chimneys* vent internal pore pressure so it never bursts!
4. **Coiled elastomeric rhizome tethers (`15–25 m` extension):** Floating `peat = 158` sedge-and-`bamboo-rice` mats root into stiff basal `clay = 255` via helical, corkscrew-coiled tap-rhizomes (analogous to giant kelp stipes + water-lily petioles). During a `16 m` Tier-2 Ghost Bore, the mat uncoils upward and **rides the surge surface intact** instead of ripping out to sea.

### 3.4 Pure `[G data]` physics module (`src/40-biome-ddelta-phys.js`)

Zero `THREE`, zero `DOM`, deterministic on `KRAND`, mirrored in Godot `4.7.2` and verified by `node biomes/doubledelta/tests/test-ddelta-phys.js` on `tools/ktest.js`:

1. **`DDELTA_PHYS.boreAt({x, z, elevM, oceanDistKm, wnwExposure01, tier}) -> {crestM, depthM, velMs, shearPa, drawdownM, returnYrs, woodySurvival}`**
   - Computes local wave attenuation across the shallow delta flat (`tier` `1 | 2 | 3`, default `2` for the `20–35 yr` generational design wave).
   - Returns `woodySurvival: false` wherever `depthM >= 2.5` or `shearPa >= 180` (`elevM < 25.0` across the bowl; `elevM < 45..65` on unshielded WNW outer faces).
2. **`DDELTA_PHYS.trimlineAt({oceanDistKm, wnwExposure01}) -> {minWoodyElevM, safeTownElevM}`**
   - Returns the exact elevation threshold below which no woody tree (`minWoodyElevM`: `25.0 m` inner delta throat, rising to `58.0 m` on exposed outer WNW headlands) and no permanent building (`safeTownElevM`: `45.0–65.0 m`) may stand.
3. **`DDELTA_PHYS.salinityAt({qLocalM3s, oceanDistKm, channelDistM, tide01, monsoon01}) -> {psu, silicaMgL, carbonateAlk, plankton01, silt01}`**
   - Models the `0.2 -> 34.5 PSU` estuarine mixing gradient from `Ria Sound` (`< 2 PSU`) across the central sponge braids (`4–18 PSU` mesohaline optimum for siliceous-spongin bioherms) to the outer surf-bar (`22–34 PSU` polyhaline/euhaline optimum for `Sea-Byssus` pen-shells and sea-pens).
4. **`DDELTA_PHYS.elasticity({form, heightM, spongin01, spiculeSi01, tetherLenM, depthM, velMs}) -> {bendDeg, compress01, dragRatio, intact, recoverMin}`**
   - Evaluates survival under `boreAt` load for `form` in `'woody-tree' | 'sponge-bioherm' | 'seapen-whip' | 'tethered-mat' | 'byssus-bivalve'`.
   - Proves `intact === false` for `'woody-tree'` under Tier-2 bores (`velMs >= 6`), while `'sponge-bioherm'` (`compress01: 0.35..0.52`), `'seapen-whip'` (`bendDeg: 82..88`, `dragRatio < 0.12`), `'tethered-mat'` (`tetherLenM >= depthM`), and `'byssus-bivalve'` return `intact === true`.
5. **`DDELTA_PHYS.scourExpose({elevM, backwashSlope, yearsSinceMega, coalByte, clayByte, oilByte, amberByte}) -> {blueClay01, amberLag01, ligniteLedge01, bitumenSeep01, mireDanger01}`**
   - Models backwash incision stripping `peat`/`lignite` (`coal = 228`) to expose `clay = 255` glauconitic blue-earth, concentrating buoyant `amber = 120` nodules at channel hydraulic jumps (`amberLag01`) and venting `bitumen = 118` (`oil = 73..157`) along compacted differential-compaction faults.
6. **`DDELTA_PHYS.ecotoneAt({elevM, psu, niPpm, boreShearPa, silicaMgL}) -> {zone, woodyOk, spongeOk, seapenOk, byssusOk, archUltramaficOk, earthShare, kratorShare}`**
   - Implements the **Earthly + Kratorian Ecotone** (`gallery/krator-globe/README.md`): returns deterministic guild permissions and Earth-green (`earthShare`) vs. native Kratorian/amphibious (`kratorShare`) weights so placement (`60-biome-ddelta-place.js`) and `verify.py --assert` share one source of truth.

---

## 4. Ecological zones & the Earthly–Kratorian ecotone

Per `gallery/krator-globe/README.md`, **Earthly green flora** radiating down the `Ria Valley` corridor meets **native Kratorian fungoid-partner and maritime/amphibious clades** dispersing along the `Arch` / `Farside` exterior coast:

| Zone Key | Elev & `PSU` | Where on `5.1` | Substrate (`KGROUND` / `KSTRATA`) | Dominant Biota (`Earthly` + `Kratorian` Mix) |
|---|---|---|---|---|
| **`1. surfbar`** (*Outer Plume & Shell-Lag Bars*) | `-2.0..+4.5 m`, `20–34 PSU` | `X = 504..524, Y = 156..186` (Station 3 `bar`) | Storm-sorted shell/quartz-cobble lag, rippled `sand` kind, `clay = 255` mud troughs | **Giant `Sea-Byssus` pen-shell beds** (*Pinna* analogues), surge-clamping visor oysters, robust outer **violet/coral whip sea-pens**, `tidewort`, drift `stormwrack`; **zero trees** |
| **`2. seapenflat`** (*Intertidal Silt & Whip-Meadows*) | `-0.8..+3.0 m`, `10–24 PSU` | Broad lower tidal mudflats & braided shoal aprons | Silty estuarine mud (`ground.bayoumud`, `ground.silt`), shell grit | Dense waving meadows of **calcified feather sea-pens** and **snapping plume-hydroids** (`KTRAPS`) that flatten flush under bores and spring upright in calm tide |
| **`3. spongebraid`** (*Siliceous Sponge-Hummock Labyrinth*) | `+1.5..+9.5 m`, `4–18 PSU`, `SiO2 >= 16 mg/L` | Central `16,320 km²` braid plain (`X = 535..605`, Station 1 `braid`) | Firm spicule-bound silt & peat levees over `clay = 255` | **`1–6 m` domed & oscular-chimneyed sponge bioherms** (ochre-gold, verdigris-teal, and Kratorian retinol-plum symbiont skins), skirted by **pneumatophore bellows-reeds** and `wineweed` |
| **`4. peatmat`** (*Tethered Floating Fen & `Bamboo-Rice` Swards*) | `+2.0..+12.5 m`, `1–8 PSU` | Back-levee slackwater basins (`peat = 158`, `coal = 228`) | Floating `ground.peat` / `ground.reedbed` over `2–5 m` water/ooze | Buoyant sedge-and-moss rafts anchored by `15–25 m` coiled tap-rhizomes, carrying lush Earthly **`bamboo-rice`**, **`wild-rice`**, **`taro`**, and Kratorian **lantern-bladders** |
| **`5. scourseep`** (*Blue-Clay `Ria-Amber` Gullies & Bitumen Seeps*) | `-3.5..+6.0 m`, `2–12 PSU` | Backwash chutes & N/SE margin fault-seeps (`572, 130`, `562, 114`, `605, 168`; Station 2 `scour`) | Black `coal = 228` lignite ledges over **slate-blue glauconite clay** (`amber = 120`) + `bitumen = 118` tar | Bare scoured blue-clay banks studded with golden/cherry **`ria-amber` lag nodules**, rainbow-iridescent **tar-seep microbial mats** (`tarfelt`), and tar-tolerant **brimstone-reeds** |
| **`6. serpentlip`** (*Western Ultramafic Contact Margin*) | `+2.0..+28.0 m`, `12–32 PSU`, `Ni = 180` | **Far western rim ONLY** (`X = 493..514, Y = 148..168`; Station 5 `lip`) | Slickensided green `serpentinite` & `laterite` (`KSTRATA`) meeting delta silt | Sharp lithological contact: stunted **`arch` kin** (`Pycnandra` blue-sap shrubs, `verdigris` caps, wind-sheared araucarias above `+25 m`, alkaline `limeshelf` seeps) stopping dead where `sedimentary` sponge-silt begins |
| **`7. riabluff`** (*Tsunami-Safe Mainland Rim Bluffs*) | **`+25.0..+240 m`**, `< 1 PSU` (runoff) | Eastern throat at **`Ria Sound` (`626, 140`)** & N/S valley walls (Station 4 `throat`) | `KSTRATA` `carbonate-shelf` bluffs (`0 m` oyster visor) capped by `loess` (`+40..+140 m`) | Crisp **`+25 m` tsunami trimline**: woody `nwlowlands` / `swlowlands` oaks, camphor laurels, stone pines, bamboo, and `tea` terraces **above** `+25..+45 m`; bare wave-washed rock/reeds below |

---

## 5. Species roster (`src/50-biome-ddelta-species.js`)

Every species is declared in `BIO.kit('doubledelta')`, tagged per `README.md` (`climate`, `aridity`, `abyssal: false`, `riparian`, `koppen`, `alien`/`native`, plus `zone`, `elasticity`, and `HV(wood, edible, medicinal, note)` checked by `tools/check_botany.py`), with zero woody trees allowed where `DDELTA_PHYS.ecotoneAt` returns `woodyOk: false`:

### 5.1 Colonial Terrestrial & Intertidal Sponge-Bioherms & Symbionts (Kratorian + Maritime Amphibious)

| Key | Name | Origin / Clade | Height & Visual Form (`3D` Builder) | Biome Mechanics & `HV` Harvest Tag |
|---|---|---|---|---|
| **`chimneysponge`** | **Great Chimney-Sponge** (*Oscularia turris*) | Amphibious siliceous-spongin colonial bioherm + retinol/cyanobacterial skin partner | `2.0–6.2 m` tall, `3–8 m` wide clustered fluted chimneys and buttressed domes (`BIO.fung` custom ribbed tube-cluster with apical `0.3–0.8 m` oscular craters that exhale mist plumes at low water); warm ochre-amber and olive-teal exterior with deep plum-violet inner atrium | Compresses `45%` under `15 m` bores; drinks plankton/silica floods. `HV('none', [], true, 'Cut outer spongin-felt blocks cured as surgical dressings, shock-absorbing brigandine/armour padding, and water filters; reagent silica-ash.')` (`gather: 'sponge-felt'`) |
| **`brainsponge`** | **Cushion / Brain-Hummock** (*Spongilla labyrinthica*) | Colonial intertidal siliceous-spongin bioherm | `0.5–2.2 m` low hemispherical domes covered in convoluted meandroid ridges (hex-normal `organic.sponge` / `organic.coral.brain` detail), mottled sage-green, rust-gold, and cream | Pioneer stabilizer on `< +5 m` distributary point-bars; seals ostia tightly during noon sun. `HV('none', [], false, 'Dense elastic bath and caulking sponge; holds fresh rain-water in upper chambers.')` |
| **`glassbasket`** | **Venus-Lattice Tower** (*Euplectella riaensis*) | High-silica (`SiO2 > 22 mg/L`) hexactinellid-analogue spire | `0.8–2.6 m` pale opal-white cylindrical lattice cages growing along `Tōng-Mā` / `Mā-Rīa` silica-rich levee toes; catches low sun with translucent specular sheen | Flexible braided silica-spongin struts bend `40°` without snapping; dead cages wash into `ria-amber` gullies. `HV('none', [], false, 'Calcined spicule-glass cullet for optical/lantern glassmaking and fine polishing powder.')` (`reagent`) |
| **`tarfelt`** | **Rainbow Seep-Mat** (*Bituminaria iridescens*) | Native Kratorian hydrocarbon/sulfur chemotrophic fungoid mat (`biomes/arch` `acidfelt` cousin) | `0.05–0.35 m` velvety black-violet and oil-slick bronze-teal terraced rims (`irid` thin-film hook) ringing `bitumen = 118` tar-seeps | Oxidises seep `H2S` and light aromatics at ambient `+31 °C`. `HV('none', [], true, 'Scraped with bitumen pitch as antiseptic hull-caulking and hoof/boot salve.')` |

### 5.2 Whip-Flexible Sea-Pen Meadows, Hydroids & Bivalve Reefs

| Key | Name | Origin / Clade | Height & Visual Form (`3D` Builder) | Biome Mechanics & `HV` Harvest Tag |
|---|---|---|---|---|
| **`seapen`** | **Calcified Feather Sea-Pen** (*Pennatula elastica*) | Amphibious octocoral (`calcite-gorgonin` axial whip + muscular silt-peduncle) | `0.6–2.4 m` dense waving plumes in coral-crimson, saffron-gold, and sea-violet (`card.seapen.feather` on `BIO.leafMat` with high `swayA` + `[Surge]` `85°` lay-down uniform) | Bends flat into the mud boundary layer under `20-knot` bores; retracts water-filled polyps at low tide. `HV('none', [], false, 'Dried calcified axial rods bundled into flexible fish-weir wattle and basket ribs.')` |
| **`whippen`** | **Wire-Whip Sea-Pen** (*Funiculina flagellum*) | Outer-bar polyhaline octocoral | `1.2–3.5 m` slender ivory-and-magenta spiralled whips in `10–30/m²` stands along deep distributary margins | Streams horizontally in `4,850 m³/s` river-mouth currents like underwater wheat. `HV('none', [], false, 'Tough gorgonin-lime cores twisted into rot-proof skiff painter lines.')` |
| **`snaphydroid`** | **Clap-Plume Hydroid** (*Aglaophenia mordax*) | Colonial amphibious hydrozoan (`KTRAPS` record) | `0.4–1.1 m` translucent amber-green fern-like fans on lower mudflats; curls shut on contact (`KTRAPS` `kind: 'snap'`, `preyMax: 'small'`, `danger: 0.08` mild sting) | Captures stranded plankton and small shrimp during post-surge drain-off. `HV('none', [], true, 'Diluted nematocyst vinegar-wash used by Ria boatmen as a counter-irritant liniment.')` |
| **`penshell`** | **Giant `Sea-Byssus` Fan-Mussel** (*Pinna aurata*) | Earthly/naturalized giant estuarine bivalve (`TRADE-GEMINI.md` canonical source!) | `0.6–1.35 m` upright triangular amber-horn shells (`card.byssus.penshell` / wedge mesh) buried two-thirds in outer cobble/shell lags, gleaming golden **byssus-silk** beard visible at base | `300–800` sacrificial-loop keratin threads hold fast through `12 m/s` surf-bars. `HV('none', ['adductor meat'], false, 'Combed golden holdfast beard spun into weightless iridescent Sea-Byssus cloth; nacreous shell inlay.')` (`gather: 'sea-byssus'`) |
| **`visoroyster`** | **Surge-Clamp Reef Oyster** (*Crassostrea librata*) | Estuarine reef-building bivalve (shared with `Ria Sound`) | `0.25–0.9 m` cemented silver-white shell bioherms encrusting cobble lags and `Ria Sound`'s `0 m` limestone libration notch | Hinged visor-valves slam watertight on pre-tsunami drawdown pressure drop. `HV('none', ['oyster'], false, 'Rich estuarine oyster meat; burnt shells yield high-purity slaked lime mortar.')` |

### 5.3 Hydro-Elastic Reeds, Tethered Peat-Mats & Ecotone Graminoids

| Key | Name | Origin / Clade | Height & Visual Form (`3D` Builder) | Biome Mechanics & `HV` Harvest Tag |
|---|---|---|---|---|
| **`bellowsreed`** | **Pneumatophore Bellows-Reed** (*Phragmites follis*) | Kratorian–Earthly hybrid air-pumping marsh cane | `1.8–4.2 m` segmented hollow culms (`33b-core-bamboo.js`) with swollen pleated basal air-bladders that hiss softly as tide/waves compress them, pumping `O2` down to anoxic `clay = 255` roots | Double-hinged silica nodes fold flat without kinking under bores. `HV('thatch, weaving, fuel (dried reed)', ['young shoot'], false, 'Split culms woven into duck-blinds, skiff fenders, and floating mat-rafts.')` |
| **`bamboorice`** | **Delta `Bamboo-Rice`** (*Bambusa oryzoides*) | `kits/crops` `bamboo-rice` wild/tended grass | `1.4–3.0 m` supple emerald culms heavy with golden grain panicles on tethered floating `peat = 158` mats | Elastomeric rhizome-cables (`15–25 m`) lift the entire sward above saltwater surges. `HV('straw, thatch', ['bamboo-rice grain', 'culm shoot'], false, 'Harvested from seasonal skiffs at low water; primary wild grain of the delta.')` |
| **`tetherpad`** | **Cable-Lotus / Anchor-Lily** (*Nelumbo funis*) | Earthly `lotus-root` ecotone macrophyte | `0.5–1.2 m` broad waxy blue-green peltate pads and cream-pink blossoms floating in slackwater peat-ponds, anchored by spiral-coiled `20 m` petioles | Uncoils smoothly during `12–22 m` flood pulses. `HV('none', ['lotus-root', 'lotus-seed'], true, 'Starchy rhizome dug in dry-season lows; seed-head astringent tea.')` |
| **`wildrice`** | **Estuarine `Wild-Rice`** (*Zizania palustris* var.) | `kits/crops` `wild-rice` | `1.2–2.2 m` feathery olive-gold grass ribbons lining fresher (`< 6 PSU`) inner distributaries (`Station 1` & `Station 4` foot) | Bends flat in river floods; grain knocked directly into skiff hulls with wooden beaters. `HV('thatch', ['wild-rice grain'], false, 'Nutty black grain harvested by Ria Sound skiff-crews.')` |
| **`brimreed`** | **Bitumen-Reed** (*Juncus bituminosus*) | Tar-tolerant sedge (`scourseep` zone) | `0.6–1.5 m` stiff dark-bronze rushes with glossy hydrocarbon-waxy cuticles fringing `bitumen` seeps and `coal = 228` lignite ledges | Indicators of shallow tar pockets and firm clay footing beside quicksand gullies. `HV('fuel (resin-wicks)', [], false, 'Pith dipped in seep-bitumen makes waterproof storm-torches.')` |
| **`driftwrack`** | **Tide-Line `Wine-Weed` & `Storm-Wrack`** | Coastal dispersal from `biomes/farside` (`LORE.md` §6.19) | Crimson `wineweed` sheets and olive bladder-straps draped along outer shell-lags and sponge bases (kept `< 0.6 m` herbaceous — **never** `20–40 m` `landkelp` trees, which bores strip off flat sediment!) | Washed in by `1.60 atm` WNW swell. `HV('fertiliser', ['dried nori sheet'], false, 'Gathered on outer bars for agar sizing and iodine-rich soup cakes.')` |

### 5.4 Boundary-Only Kin (`BIO.kin` — Zero Intrusion Into `< +25 m` Sedimentary Bowl!)
- **On Station 4 (`throat`, `626, 140`) strictly at `elevM >= +25.0 m` (`+45 m` on WNW-exposed spurs):** `biomes/nwlowlands` & `biomes/swlowlands` (`camphor`, `sprawl oak`, `stone pine`, `bamboo`, `glow-willow` along high bluff brooks) — creating a razor-sharp **visual tsunami trimline** above the bare/reed-fringed lower cliff!
- **On Station 5 (`lip`, `512, 160`) strictly where `province === 'ultramafic'` (`X <= 514`):** `biomes/arch` (`pycnandra` sève-bleue shrubs, `gymnostoma` she-oak, `verdigris` nickel caps, `limeshelf` on Type-I/II alkaline seeps, and wind-sheared `araucaria` **only** on the `+25..+28 m` upper western headland back-crest at `498, 152`).

---

## 6. Fauna (`kits/fauna` — data-first records & schedules)

Following `README.md` and `kits/fauna/BIOME-FAUNA-PLAN.md` (**native arthropods are vertebrate-grade hexapods, never giant insects**; Earthly fish, bivalves, and coastal birds co-occur in the northern ecotone; all records carry `biome`, `diet`, `yields`, `factions`, and 24-hour `core/sched` scaffolding before any mesh is drawn):

| Key (`kits/fauna`) | Name | Clade & Size | Niche & Tsunami-Survival Behaviour | Yields & Schedule (`00–24h`) |
|---|---|---|---|---|
| **`amberskimmer`** | **Stilt Amber-Skimmer** | Vertebrate-grade hexapod wader (`1.4 m` tall, `0.35 m`-wide hydroplane snowshoe-tarsi) | Skates across thixotropic `blue-clay` quicksand (`mire` zones where bipeds sink!) probing post-bore scour gullies for stranded crustaceans and resin-trapped carrion; sprints upslope or inflates thoracic air-sacs to bob over surges | `chitin`, `skimmer-meat`, gizzard `ria-amber` pebbles! Schedule: `05–11` `FORAGE_SCOUR`, `11–15` `ROOST_SPONGE`, `15–20` `FORAGE_SCOUR`, `20–05` `SLEEP_MAT` |
| **`oscularcrab`** | **Oscular Sponge-Symbiote** | Dog-sized carapace hexapod (`0.5 m`) | Lives commensally inside the warm, humid apical chimneys of `chimneysponge` bioherms, grooming silt and debris from the sponge's ostial pores; seals itself inside the chimney when pre-bore drawdown triggers valve closure | `shell-meat`, `sponge-pearl` concretions. Schedule: `00–06` `GROOM_OSTIA`, `06–18` `SHELTER_CHIMNEY`, `18–24` `FILTER_TIDE` |
| **`byssusray`** | **Shell-Cracker Plume Ray** | Broad euryhaline benthic ray (`1.8 m` wingspan) | Patrols the `4,850 m³/s` `Mā-Rīa` mouth bars (`Station 3`) crushing young oysters and worms; senses sub-crustal acoustic precursors of `Shield` slumps hours early and flees seaward into `-40 m` channels (watched by `Ria Sound` skiffmen as a living tsunami alarm!) | `ray-wing` meat, `shagreen` rasp-hide, `barbed-spine`. Schedule: `04–10` `FEED_BAR`, `10–16` `BURY_SILT`, `16–22` `FEED_PLUME`, `22–04` `DRIFT_DEEP` |
| **`tarstrider`** | **Bitumen-Seep Scavenger** | Low, long-limbed hexapod (`0.8 m`, oil-repellent fluorolipid foot-pads) | Walks unmired across warm `bitumen = 118` tar-seeps (`Station 2`) picking off animals and drift-carcasses trapped in the pitch (La Brea analogue) | `seep-wax` waterproofing gland, `hide`. Schedule: `00–08` `PATROL_SEEP`, `08–17` `SHADE_LEDGE`, `17–24` `PATROL_SEEP` |
| **`mudfish`** | **Delta Mudfish** (`farside` kin) | Amphibious air-breathing fish (`0.35 m`, `farside` `faWdFish`) | Skips across `seapenflat` mud and `brainsponge` aprons in `1.60 atm` wet air | `fish` (salted/smoked in `Ria Sound`). Schedule: `06–18` `BASK_FORAGE`, `18–06` `BURROW_MUD` |
| **`riaheron`** | **Plume-Stalker / Spoonbill** | Earthly estuarine wading bird (`1.1 m`) | Nests in dense colonies on `>= +45 m` `Ria Sound` cliff ledges (`Station 4`), flying `15–30 km` out into the wild delta by day to hunt `mudfish` | `eggs`, `feathers`, `fowl`. Schedule: `06–18` `HUNT_BRAID`, `18–06` `ROOST_BLUFF` |

---

## 7. Crops (`kits/crops`), geology resources, hazards & the human footprint rule

### 7.1 `kits/crops` integration (`CROPS.BIOMES.doubledelta`)

Added as pure `[G data]` in `kits/crops/src/10-crop-core.js` when the kit builds (until then asserted via `CROPS.at` in `tests/test-ddelta-phys.js`), matching the surveyed `1.60 atm` (`atm: 2`, dense), `+28..+31 °C`, `2,243–2,557 mm/yr` axes:

```js
doubledelta: {
  atm: 2,   /* 1.57-1.60 atm across the delta and lower Ria Sound bluffs */
  zones: {
    braid:   {warmth: [4, 4], arid: [4, 4], wet: true},              /* < 6 PSU inner freshwater braids: 38 crops */
    marsh:   {warmth: [4, 4], arid: [4, 4], wet: true, salt: true},  /* 6-22 PSU brackish sponge & peat-mat bowl: 44 crops */
    surfbar: {warmth: [4, 5], arid: [4, 4], wet: true, salt: true},  /* 22-34 PSU outer mouth bars */
    bluff:   {warmth: [3, 4], arid: [3, 3]}                          /* >= +45 m Ria Sound safe loess terraces: 33+ crops */
  }
}
```
- **Verified `CROPS.at` Wild & Skiff-Gathered Bowl Crops (`< +25 m`):** **`bamboo-rice`** (signature tether-mat staple), **`wild-rice`**, **`rice`** (flood-recession), **`taro`**, **`lotus-root`** (`tetherpad`), **`wineweed`**, **`kelp`** / **`sea-lettuce`** / **`sea-grapes`**, **`tidewort`**, **`mat-reed`**, **`pandan`**, **`eelgrass`**, **`dried-reed`** (fuel), **`mangrove-red`** (dye, sheltered bluff-foot coves only).
- **Verified `>= +45 m` `Ria Sound` Bluff Crops (`Station 4`):** **`tea`**, **`rice`**, **`helix-bean`**, **`sweet-potato`**, **`ashroot`**, **`avocado`**, **`citron`**, **`persimmon`**, **`mulberry`** (for mulberry-and-sponge paper!), **`cotton`**, **`flax`**, **`camphor`**.

### 7.2 `kits/resources` & `TRADE-GEMINI.md` luxury/industrial goods

| Resource / Good | `geology.json` Ground Truth in `Double Delta` | Field Expression in `biomes/doubledelta` | Downstream Craft & `SIM.trade` Use |
|---|---|---|---|
| **`ria-amber`** (*Ria River-Amber*) | **`amber = 120`** (`304` lode nodes in `rmvdoubledelta`; `7,299` across `Ria Valley`) | Scoured out of slate-blue glauconitic **`clay = 255`** beds (`SG 1.06`, floating in dense silt-brine!) beneath black **`coal = 228`** lignite seams in Station 2 `scour` & storm wrack lines on Station 3 `bar` | Electrostatic **amber-rod insulators** (`ēlektron` for `Yuni` & `Eternal State`), gimballed liquid-amber compasses (with `Compass Hills` `lodestone = 220`), succinic marine varnish (`TRADE-GEMINI.md` `287.18 u` export via `Farport`!) |
| **`Sea-Byssus`** (*Gold-of-the-Tide*) | Biogenic shell-lag product on outer `Mā-Rīa` mouth (`Station 3 bar`) | Golden keratin holdfast beards of `penshell` beds combed at low spring/libration water | Washed in citron/berry acid and spun at `Ria Sound` into weightless, iridescent amber-gold **`Sea-Byssus` silk** (bundled in `ria-amber`) |
| **Architectural & Surgical Sponges** | Biogenic (`silica = 150`, `384` nodes + `18–28 mg/L` river `H4SiO4`) | Outer spongin-felt rind harvested sustainably from `chimneysponge` & `brainsponge` domes (leaving basal plate to regrow in 2 monsoons) | Shock-absorbing **armor/brigandine padding**, sterile surgical dressings, `Mã-wè` sponge-and-mulberry printing paper, optical silica-cullet |
| **Lignite Coal & Peat** | **`coal = 228`** (`2,456` nd, `94%` of cells!) & **`peat = 158`** (`606` nd) | Black bedded lignite seams in scour-gully walls (`Station 2`); buoyant `peat` rafts (`Station 1` & `2`) | Kiln & river-barge capstan-brazier fuel at `Ria Sound` |
| **Bitumen & Seep-Oil** | **`oil = 157`** (`413` nd, peaking `136–157` on N margin `562, 114`) & **`bitumen = 118`** (`118` nd) | Warm viscous tar-seeps ringed by `tarfelt` mats (`Station 2 scour`) | Waterproof **bitumen marine pitch** for caulking `Ria Sound` harvesting skiffs, *batea* oyster rafts, and coastal coasters |
| **W-Lip Nickel & Nephrite** | **`ultramafic = 255`**, **`nickel = 180`** (`46` nd), **`jade = 150`** (`8` nd) | Confined strictly to `X = 493..514` (`Station 5 lip`): `Pycnandra` / `verdigris` bio-ore shrubs & serpentinite-contact cobbles | Links ecologically to `cFlīt-qBōn` phytomining (`Paktong` `Cu-Ni-Zn`) along `The Arch` |

### 7.3 Hazards (`core/hazard`, `KHAZ`)

| Hazard Key | Kind | Where | Physical Tell & Gameplay Effect |
|---|---|---|---|
| **`ddelta:mire`** | `mire` / sink | Freshly scoured `blue-clay` gully floors (`Station 2`, `mireDanger01 > 0.5`) | Thixotropic slate-blue glauconite silt liquefied by upward pore-water seepage (glistening bubble-pocked sheen, zero `brimreed` cover; `amberskimmers` skate over it, heavy boots bog down!) |
| **`ddelta:tar`** | `tar` / trap | Active `bitumen = 118` seeps (`Station 2`) | Mirror-black rainbow sheen + `tarfelt` collar + warm hydrocarbon scent; slows movement `75%` and fouls boots |
| **`ddelta:surge`** | `flood` / `crush` | Entire `< +25 m` bowl during `[Drawdown]` -> `[Surge]` state | Preceded by `15 min` silent channel **drawdown** (`visoroysters` snap shut, `chimneysponges` hiss shut, `byssusrays` flee seaward); `8–12 m/s` bore sweeps anything untethered while sponges compress and sea-pens lie flat |

### 7.4 Locked human footprint rule (`CROOK-RIA-DECISIONS.md` §2.1)

1. **ZERO permanent settlements, dwellings, stone towers, or roads anywhere below `+25 m` across `Double Delta`.** (`verify.py --assert` fails if any `KTAGS` record with `class === 'building'` has `y < 25.0`!)
2. **Permanent settlement reserve at `Ria Sound` (`626, 140`):** On **Station 4 (`throat`)**, the upper `+65..+140 m` loess-capped limestone bluff is registered in `KTAGS` as `site:ria-sound` (`culture: 'riavalley'`, `note: 'Ria Sound & Mã-wè Free-Port: stilted stone hórreos, amber/byssus guild-halls, and coaster transshipment wharves above the +65 m WNW tsunami ceiling'`), held open and unbuilt just as `biomes/farside` holds Farport's `+212 m` plateau site clear.
3. **Optional ephemeral / sacrificial harvesting works (`86-host-works.js`, `?works=0`):** Light seasonal gear deployed by daytime skiff-crews from `Ria Sound` — **bamboo sponge-squeezing & drying racks**, **long-handled amber-dipping scoop-nets & floating wooden sluice-boxes** tethered in scour gullies, **bitumen-caulked reed duck-blinds**, and **acoustic drawdown warning floats** — all tagged `class: 'furniture'`, `placement: 'outdoor'`, `culture: 'riavalley'`, built of light bamboo/reed/rope that washes away cleanly in a Tier-2 bore.

---

## 8. Showcase stations (`5` verified Scale-Model `5.1` sites)

Every station coordinate `(px, py)` below has been directly sampled on `h.png`, `wl.png`, `c.png`, `p.png`, `tm/tw/tc.png`, `rivers.json`, and `kits/resources/data/geology.json`. View names strictly obey survey item 30 (alphanumeric + spaces/hyphens only; **no apostrophes or colons**).

### Overview table

| # | Station Arg & Output | `5.1` `(px, py)` & Lat | Elev & `P_atm` | Climate & Rain | `geology.json` at Site | Core Signature Shown |
|---|---|---|---|---|---|---|
| **1** | **`braid`** *(main)* `dist/doubledelta.html` | **`(556, 160)`** (`19.5°S`) | **`+2.1..+5.7 m`** (channel `-6.5 m` at `555, 158`), `1.60 atm` | `Am`, **`2,557 mm`**, `+31 °C` (`+40/+22`) | `sedimentary`, `coal = 228`, `clay = 255`, `oil = 43` | **Main Sponge-Hummock & Sea-Pen Distributary Braid:** `1–6 m` `chimneysponge` & `brainsponge` bioherms, waving `seapen` mudflats, `bellowsreed` & tethered `bamboorice` peat-mats (`26 km` from `>= +25 m` land; zero trees, zero islands!) |
| **2** | **`scour`** `--station scour` `dist/doubledelta-scour.html` | **`(572, 130)`** (`18.8°S`, N-lobe scour; paired w/ `562, 114` `oil=146` & `605, 168`) | **`+2.1..+4.8 m`** (gully `-3.2 m`), `1.60 atm` | `Am`, **`2,463 mm`**, `+31 °C` (`+40/+22`) | `sedimentary`, **`coal = 228`**, **`clay = 255`**, `oil = 79..146`, `amber = 120`, `bitumen = 118` | **Post-Tsunami Blue-Clay `Ria-Amber` Scour-Gully & Bitumen Seep:** Tier-2/3 backwash trench cutting black lignite over slate-blue glauconite clay with gleaming `ria-amber` lag pockets, `bitumen` tar-seeps ringed in `tarfelt`, `amberskimmers`, and tethered amber-sluice poles |
| **3** | **`bar`** `--station bar` `dist/doubledelta-bar.html` | **`(516, 172)`** (`19.8°S`, mouth bar E of `505, 160` / `490, 186`) | **`+2.1..+4.8 m`** (bar trough `-6.5..-33 m`), `1.60 atm` | `Am`, **`2,384 mm`**, `+30 °C` (`+37/+22`) | `sedimentary`, `clay = 255`, `coal = 205`, `silica = 150` | **Outer Surf-Bar & `Sea-Byssus` Shell-Lag Mouth:** `4,850 m³/s` `Mā-Rīa` golden silt plume (`WATER.plume`) colliding head-on with `1.60 atm` WNW ocean rollers (`WATER.open`), storm-sorted shell/cobble bars carpeted in giant golden-tethered `penshells`, `visoroysters`, and `whippens` |
| **4** | **`throat`** `--station throat` `dist/doubledelta-throat.html` | **`(626, 140)`** (`19.1°S`, *Ria Sound* mainland throat) | **`+41.3 m`** bench (`-2.5 m` channel at `618, 142`; **`+65..+140 m`** upper bluff), `1.57–1.59 atm` | `Am` / `Cfa` edge, **`2,259 mm`**, `+28 °C` (`+37/+19`) | `sedimentary` (`carbonate-shelf` + `loess`), `coal = 169`, `oil = 102`, `clay = 255` | **`Ria Sound` Bluff-Throat Overlook:** Safe `+68 m` & `+115 m` headland vista looking WSW across the vast drowned sponge-labyrinth; crisp **`+25..+45 m` woody trimline** (`nwlowlands`/`swlowlands` kin above, reeds/sponges/oyster visors below); `site:ria-sound` port reserve |
| **5** | **`lip`** `--station lip` `dist/doubledelta-lip.html` | **`(512, 160)`** (`19.5°S`, W fault-margin `498..514, 148..168`) | **`+6.1 m`** cove (`+26.4 m` crest at `498, 152`), `1.59–1.60 atm` | `Am`, **`2,369 mm`**, `+30 °C` (`+36/+23`) | **`ultramafic = 255`**, **`nickel = 180`**, `clay = 255` (meeting `sedimentary` at `X = 515`) | **Western Serpentinite Contact Cove:** Where `The Arch`'s `4.7%` waxy-green `serpentinite` & `laterite` fault-margin touches the sedimentary delta — blue-sap `Pycnandra` & `verdigris` nickel-hoarders (`arch` kin) on green rock meeting `chimneysponge` & `seapen` silt across one cove! |

---

### 8.1 Station 1 (`braid`, main page `dist/doubledelta.html`): Main Sponge-Hummock & Sea-Pen Distributary Braid — `(556, 160)`
- **Why here:** `26 km` from the nearest `>= +25 m` mainland bluff and `68 km` downstream of `Ria Sound`, directly in the braided heart below the `(590, 158)` triple confluence of `Mā-Rīa` (`4,850 m³/s`), `Tōng-Mā` (`1,420 m³/s`), and `Pāk-Mā` (`1,380 m³/s`).
- **Scene layout (`5.4 × 5.4 km`):** Three anastomosing golden-silt distributary channels (`WATER.flow` + `WATER.open` tidal backwater, `-4.5 to 0 m`) winding through low point-bars (`+0.5 to +5.7 m`) and slackwater fen-ponds (`WATER.still`). **Zero rocks, zero islands, zero trees.**
  - Point-bar crests carry cathedral-like clusters of `2–6 m` **`chimneysponge`** towers (exhaling faint warm vapour puffs from apical oscula) and meandroid **`brainsponge`** domes, interspersed with lacy white **`glassbasket`** silica spires along the levee toes.
  - Broad intertidal mud aprons (`-0.5 to +2.0 m`) ripple with thousands of crimson, saffron, and violet **`seapen`** plumes and **`snaphydroid`** fans streaming with the ebb current.
  - Back-levee slackwaters hold floating **`peatmat`** islands (`bamboorice`, `tetherpad` cable-lotus, `bellowsreed`) whose coiled submerged rhizome-cables show cleanly in clear black-tannin pond margins.
  - **Interactive `[Calm] / [Drawdown] / [Surge]` host bar button:** Lets the viewer watch a live deterministic demonstration of `DDELTA_PHYS.elasticity` — channels drain (`Drawdown`, oscula snap shut), then a `6 m` Tier-1 surge wave sweeps across (`chimneysponges` compress `40%`, `seapens` bend `85°` flat to the silt, `peatmats` rise vertically on uncoiling rhizomes, then spring upright undamaged!).
- **Preset views:** `overview`, `chimney-bioherm`, `seapen-meadow`, `tethered-mat`, `braid-channel`, `low-mist`.

### 8.2 Station 2 (`scour`, `dist/doubledelta-scour.html`): Post-Tsunami Blue-Clay `Ria-Amber` Scour-Gully & Bitumen Seep — `(572, 130)`
- **Why here:** Inside the northern `Tōng-Mā` / `Sī-Mā` lobe (`coal = 228`, `clay = 255`, `oil = 79` rising to `146–157` toward `562, 114`, `amber = 120`, `bitumen = 118`), showcasing how generational WNW bores create Krator's #1 amber-and-bitumen harvest ground.
- **Scene layout (`4.8 × 4.8 km`):** A fresh, V-headed **tsunami backwash scour-chute** (`-3.5 to +4.8 m`, `KRELIEF` dendritic cut) ripped across a flat `peat` and `brainsponge` plain:
  - Steep `2–4 m` cut-banks expose a custom local `KSTRATA` column (`delta-amber-bed`: fibrous brown `peat` over brittle jet-black **`coal = 228` lignite** ledges, resting on vivid **slate-blue glauconitic clay** — exact analogue of Samland/Curonian Baltic *"Blue Earth"*).
  - Along hydraulic eddy bars in the gully bed, winnowed golden, honey-orange, and cherry-red **`ria-amber` nodules** (`0.05–0.35 m`, translucent PBR refraction/tint) gleam among white `glassbasket` skeletons and lignite cobbles (`KHAZ` `ddelta:mire` marks soft blue-clay quicksand pockets where `amberskimmer` hexapods stride safely!).
  - On the adjacent differential-compaction bench, three warm **`bitumen = 118` tar-seeps** (`WATER.still` mirror-black viscous look + rainbow `tarfelt` microbial collars + `brimreed` fringe) bubble slowly alongside seasonal bamboo amber-sluice trestles (`?works=0`).
- **Preset views:** `overview`, `blue-clay-cut`, `amber-lag`, `bitumen-seep`, `peat-scarp`, `skiff-sluice`.

### 8.3 Station 3 (`bar`, `dist/doubledelta-bar.html`): Outer Surf-Bar & `Sea-Byssus` Shell-Lag Mouth — `(516, 172)`
- **Why here:** Right at the oceanward barrier-bar mouth (`+2.1..+4.8 m` dry spit beside `-6.5 to -33.2 m` bar channels at `505, 160`–`490, 186`) where **`9101` `Mā-Rīa`'s `4,850 m³/s` freshwater silt plume** hits unshadowed `1.60 atm` WNW Western Ocean rollers head-on.
- **Scene layout (`6.0 × 6.0 km`):**
  - Dramatic hydrodynamic clash rendered via `WATER.open` (heavy `1.60 atm` whitecap surf & shoaling shore-grid) + `WATER.plume` (`ext/61`: sharp golden-ochre sediment front curling into deep indigo-teal ocean water) + `ATMOS` sea-spray mist.
  - Broad wave-planed **shell-and-quartz-cobble lag spits** (`KGROUND` `'sand'` wind-ripple & shell-glint kind + `ground.lakebed.shells`), sculpted into low tsunami backwash chevrons (`+1.5 to +4.8 m`).
  - Dense, shimmering beds of metre-tall **`penshell` (`Sea-Byssus` fan-mussels)** standing two-thirds buried in the lag, their golden keratin byssus-cables taut around cobbles, flanked by cemented **`visoroyster`** reefs, ivory **`whippen`** stands in the swash channel, and crimson `driftwrack` windrows.
- **Preset views:** `overview`, `plume-front`, `byssus-bed`, `oyster-lag`, `surf-spit`, `ocean-horizon`.

### 8.4 Station 4 (`throat`, `dist/doubledelta-throat.html`): `Ria Sound` Bluff-Throat Overlook — `(626, 140)`
- **Why here:** The canonical locked settlement pin (`CROOK-RIA-DECISIONS.md` §2.1: **`Ria Sound` `626, 140`, `+41.3 m` lower bench / `+65..+140 m` upper safe bluff**), where the sheltered dendritic limestone throat of `Ria Valley` opens out into the flat `16,320 km²` drowned wilderness of `Double Delta`.
- **Scene layout (`6.4 × 6.4 km`):**
  - Eastern half rises steeply from the `-2.5 to -10.6 m` `Pāk-Mā` / `Ria Sound` channel (`618, 142`) across **`KSTRATA` `carbonate-shelf`** cream cherty-limestone bluffs (undercut at `0 m` by a `24 h` libration-tide notch crusted in **`visoroyster`** visors) up to `+41 m` stone slipway ledges and **`+68..+135 m` `loess`-capped tablelands**.
  - **The Tsunami Trimline made visible:** Below `+25..+38 m` (exposed to WNW funneling), the limestone slope is scrubbed clean of trees — carrying only `visoroysters`, `bellowsreeds`, and low `brainsponge` cushions in wet splash-hollows. Above `+38..+45 m`, lush woody **`nwlowlands` & `swlowlands` gallery forest** (sprawl oaks, camphor laurels, stone pines, bamboo, and terraced `tea` rows) crowns the safe bluffs!
  - Looking WSW (`250°`) from `+88 m` on the bluff brow: `KFAR` (`14 km`) stretches flat to the Western Ocean gleam across endless braided `chimneysponge` domes and `wildrice` channels, with `site:ria-sound` held clear on the `+72 m` upper terrace and seasonal sponge-drying racks & skiff-mooring stakes down at the `+2 m` cove foot (`?works=0`).
- **Preset views:** `overview`, `delta-vista`, `trimline-bluff`, `oyster-visor`, `ria-sound-site`, `skiff-cove`.

### 8.5 Station 5 (`lip`, `dist/doubledelta-lip.html`): Western Serpentinite Fault-Lip Contact Cove — `(512, 160)`
- **Why here:** Anchors the **`4.7% ultramafic` (`nickel = 180`)** western boundary (`X = 493..514, Y = 148..168`) where `The Arch`'s NE onshore detachment fault actually touches the `95.3% sedimentary` delta — visually demonstrating *why* ultramafic rock is a marginal western wall rather than an interior chain of basalt islands!
- **Scene layout (`5.0 × 5.0 km`):**
  - Western shore (`X <= 514` side of the frame) rises from `0 m` to `+26.4 m` (`498, 152` profile) in waxy dark-green slickensided **serpentinite** and brick-red **laterite** (`KSTRATA` lateral contact: `arch-rift-basalt` / `serpentinite` footwall on the W side tonguing sharply under unconsolidated delta silt on the E side!).
  - On the green/red ultramafic bank: stunted **`biomes/arch` kin** (`pycnandra` blue-sap shrubs, `gymnostoma` she-oak, `verdigris` nickel-crust caps, milky-blue Type-I/II alkaline seep rims with `limeshelf`, and wind-sheared candelabra `araucaria` **only** above `+25 m` on the back ridge).
  - Across the `180 m` cove channel on the flat `+1.5..+4.5 m` eastern sedimentary bar: `chimneysponge` bioherms, `seapen` mudflats, and `penshell` cobble lags — two incompatible geochemistries (`Ni = 180, Ca:Mg < 0.2` vs. `SiO2-rich alluvial clay`) meeting across one tidal channel!
- **Preset views:** `overview`, `fault-contact`, `serpentinite-seep`, `sponge-spit`, `ultramafic-crest`.

---

## 9. Textures & sampler budget (`materials.json` & `PROMPTS-NEEDED.md`)

Every station strictly caps `KGROUND` to **`<= 5` library layers** so total linked fragment samplers (`KGROUND` + `ATMOS` sky/fog/rain + `KSHADOW` + `WATER`) stay at **`9–12` (`< 15` warning / `< 16` hard fail, survey item 27)**:

### 9.1 Existing library assets reused immediately
- **Ground (`KGROUND`):** `ground.bayoumud`, `ground.silt`, `ground.peat`, `ground.reedbed`, `ground.lakebed.shells`, `ground.damp_beach_sand`, `ground.laterite`, `rock.limestone`, `rock.loess`.
- **Flora & Bioherm Cards / Surfaces:** `organic.sponge`, `organic.coral.brain`, `card.reed`, `card.reed.brimstone`, `card.seaweed`, `card.seagrass`, `card.reef`, `bark.mangrove` (bluff/kin), plus `nwlowlands`, `swlowlands`, and `arch` packs via `matlib_pack.fragment(..., exclude=...)`.

### 9.2 Five targeted slots to add to `core/materials/PROMPTS-NEEDED.md` (procedural stand-ins until packed)
1. **`organic.sponge.chimney`** — fibrous siliceous-spongin bioherm wall with `2–5 mm` ostial pores and subtle spicule sheen (grey height/albedo detail, `keep: 0`, tinted ochre/verdigris/retinol-plum per instance).
2. **`card.seapen.feather`** — `3 × 3` celled card sheet of pinnate octocoral sea-pens, spiral whip-pens, and fern-like hydroid fans (`alphaTex` procedural card until generated).
3. **`card.byssus.penshell`** — upright fluted triangular *Pinna* fan-mussel shells + basal golden byssus-silk anchor threads.
4. **`ground.clay.blueamber`** — slick slate-blue glauconitic marine/estuarine clay with embedded translucent golden amber pebbles (`Station 2 scour`).
5. **`ground.bitumen.mat`** — glossy black asphaltic tar-crust rimmed with iridescent sulfur-purple/bronze microbial film (`Station 2 scour`).

---

## 10. Fragment map, `PORT.md` tags, build order & verify invariants

### 10.1 Numbered `src/` fragment architecture

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(by path from `core/` & `kits/crops`)* | `[G data]` / `[web]` | `buildlib.CORE_BIOME_MIN` + biome extensions, `KDRAWN`, `KRAND`, `KTAGS`, `KSPACE`, `KCOAST`, `KSTRATA`, `KGROUND`, `KFAR`, `KHORIZON`, `KHAZ`, `KSHADOW`, `WATER`, `CROPS` |
| `40-biome-ddelta-phys.js` | **`[G data]`** | `DDELTA_PHYS`: `boreAt`, `trimlineAt`, `salinityAt`, `elasticity`, `scourExpose`, `ecotoneAt` (zero `THREE`/DOM) |
| `41-biome-ddelta-sites.js` | **`[G data]`** | `DDELTA_SITES`: exact `5.1` metrics, river discharges, `KSTRATA` columns, and zone bounds for `braid`, `scour`, `bar`, `throat`, `lip` |
| `45-host-stage.js` | `[web]` | Renderer, terrain heightfield + `KCOAST` / `KRELIEF` channels, `KDRAWN.add`, `BIO.init({tags:'doubledelta'})` |
| `47a..47c` *(virtual `BIO.kin`)* | `[G data]` / `[web]` | `nwlowlands` + `swlowlands` (Station 4 `throat` only) and `arch` (Station 5 `lip` only), read in place with filtered `matlib_pack` |
| `50-biome-ddelta-species.js` | `[G partial]` | `DDELTA.SPECIES` (`15` own species), `HV` harvest tags, procedural card fallbacks, `BIO.leafMat` / `BIO.fung` builders + `[Surge]` lay-down/compression shader hook |
| `60-biome-ddelta-place.js` | **`[G data]`** | Deterministic cell-seeded (`KRAND.cell`) placement driven strictly by `DDELTA_PHYS.ecotoneAt`, `KSPACE` keep-clear, `CROPS.pick`, and `KTAGS` pre-draw registration |
| `84-host-ground.js` | `[web]` | `KGROUND` (`<= 5` layers), `KSTRATA` cliff/gully shading, `KFAR` (`14 km`), `KHORIZON` |
| `86-host-works.js` | `[web]` | Optional sacrificial skiff-poles, amber sluices, sponge racks (`class: 'furniture'`, `?works=0`) + `site:ria-sound` reserve on `throat` |
| `89a-host-atmos.js` & `89w-host-water.js` | `[web]` | `ATMOS.bindHost` (`1.60 atm` `Am` sky, mist, monsoon weather), `WATER.open` / `flow` / `still` / `plume` + `farbed` |
| `99-host-take.js` | `[web]` | `KHOST.take`: preset views, inspector vocabulary, `[Calm]/[Drawdown]/[Surge]` controls, `hostChecks()` |

### 10.2 Rollout order (`D0`–`D6`)

- **D0.** This `PLAN.md`; add the 5 texture prompts to `core/materials/PROMPTS-NEEDED.md`; add `"biomes/doubledelta"` to all 5 checks in `tools/checks_optin.json`.
- **D1.** `src/40-biome-ddelta-phys.js` + `src/41-biome-ddelta-sites.js` (`[G data]`) + `tests/test-ddelta-phys.js` on `tools/ktest.js` (`node biomes/doubledelta/tests/test-ddelta-phys.js`).
- **D2.** Station 1 **`braid`** (`dist/doubledelta.html`): `build.py` (from `tools/new_build/build.py.template`), `50-species`, `60-place`, `WATER`, `KGROUND`, `[Surge]` elastic demo, `verify.py --assert` (`checks=harness.SURVEY`).
- **D3.** Stations 2 **`scour`** (`-scour`), 3 **`bar`** (`-bar`, with `WATER.plume` & `penshell` beds), 4 **`throat`** (`-throat`, `Ria Sound` `626, 140` bluff trimline & port site reserve), and 5 **`lip`** (`-lip`, W serpentinite contact).
- **D4.** Register `CROPS.BIOMES.doubledelta` in `kits/crops` (`node kits/crops/tests/test-crops.js`) and the 6 fauna records in `kits/fauna`.
- **D5.** Complete `PORT.md`, `BIOME-API.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`; run `python3 tools/check_core_use.py biomes/doubledelta`, `python3 tools/check_botany.py`, `python3 tools/test_all.py`.

### 10.3 `verify.py --assert` & `test-ddelta-phys.js` invariants (each paired with a negative `T.neg`)

1. **Zero woody trees below the tsunami trimline:** Every placed woody tree (`nwlowlands`, `swlowlands`, `araucaria`) satisfies `y >= DDELTA_PHYS.trimlineAt(...).minWoodyElevM` (`>= +25.0 m`); `T.neg` proves `DDELTA_PHYS.ecotoneAt({elevM: 12, ...}).woodyOk === false` and `elasticity({form: 'woody-tree', depthM: 14, velMs: 9}).intact === false`.
2. **Zero permanent buildings below `+45 m` (and zero in the `< +25 m` bowl):** No `KTAGS` record of `class === 'building'` exists below `+45 m` across any station; `site:ria-sound` sits at `y >= +65 m` on Station 4 `throat`.
3. **Zero interior basalt islands:** Across Stations 1–4 (`X > 514`), zero `arch-rift-basalt` or `ultramafic` strata/clasts or rocky island landforms occur inside the `< +25 m` sedimentary bowl; `ultramafic` / `arch` kin appear exclusively on Station 5 `lip` where `province === 'ultramafic'`.
4. **Hydro-elastic survival under Tier-2 Ghost Bore:** `chimneysponge`, `seapen`, `tethered-mat` (`tetherLenM >= depthM`), and `penshell` all return `intact === true` at `depthM = 16 m, velMs = 10 m/s`, whereas a mat with `tetherLenM < depthM` fails (`T.neg`).
5. **Geochemical & salinity fidelity:** `chimneysponge` and `glassbasket` place only where `silicaMgL >= 14` and `2 <= psu <= 24`; `penshell` places only where `psu >= 18` and cobble/shell lag weight `>= 0.4`; `ria-amber` lag nodules place only where `DDELTA_PHYS.scourExpose(...).amberLag01 > 0.35` (`T.neg`: zero amber nodules on un-scoured peat domes).
6. **Survey & deterministic tile invariance:** Rebuilding any `500 m` cell alone vs. inside the full station produces identical `KTAGS` ids, positions, and seeds (`KRAND.cell`); active shader samplers `< 15`; camera eye clearance positive on `KDRAWN`.
