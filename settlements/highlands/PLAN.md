# Highlands & Roketstad Rebuild Plan (`s28hf1s9ab`, `px 632, 716`, `+2,949.6 m`)

**Status:** Site-scoped Scale Model 5.1 rebuild plan (`2026-11-19`)
**Canonical Pin (`60-settlements.js`):** `id: "s28hf1s9ab"`, `name: "Roketstad"`, `type: "city"`, `px: 632`, `py: 716`, `polity: "The Iron Republic"` (`rmufxti8qwcxy`, Seat of `R1` *Roket-Kanton / Öst-Ting*)
**5.1 World Frame (`origin 1191, 1569`, `2,000 m/px`):** `x = -1,118,000 m` (`1,118.0 km` W), `z = -1,706,000 m` (`1,706.0 km` N), ground **`+2,949.6 m ASL`**, pressure **`1.107 atm`**
**Companion Docs:** [`ROKETSTAD-BLUEPRINT.md`](ROKETSTAD-BLUEPRINT.md) (district, hydraulic cascade & structural blueprints), [`kits/highlands/README.md`](../../kits/highlands/README.md) (Slavic Republican & Rustic kits + `77c-rep-hydro.js`), [`kits/painted-men/README.md`](../../kits/painted-men/README.md) (standalone Tlingit/Pacific-NW Painted Men kit), [`settlements/iron-millstream/PLAN.md`](../iron-millstream/PLAN.md) (live hydropower trial on `r201` *Snou Bruk*), [`PROPOSAL-IRON-REPUBLIC.md`](../../core/simulation/PROPOSAL-IRON-REPUBLIC.md).

---

## 0. Core Adoption (Written First per `AGENTS.md` & `README.md`)

When `settlements/highlands` (`roketstad` target) is rebuilt onto Scale Model 5.1 (`openworld/PLAN-SITES.md`), it adopts the shared `core/` modules rather than retaining legacy Round 1–10 bespoke terrain, sky, or street passes:

| Core Module | Taken? | Role in the Roketstad Rebuild (or Reason Not Applicable) |
|---|---|---|
| `core/world` (`WORLD.Hland`, `ROADS`, `48s`/`88s`) | **Yes** | Cuts 1:1 Scale Model 5.1 ground (`cut_site.py --upsample 8`, `250 m` cells) over `(632, 716)`, *Roketsjö* (`L1`, `+2,860.0 m`), `r201` *Snou Bruk* gorge, and the eastern Launch Pentagon bench; applies `WORLD.landHook` ground deltas (`150 m` cosine ease) for town terraces, leat benches, and blast-pad aprons. |
| `core/terrain` (`KLAND`, `KRELIEF`, `KCAVERN`) | **Yes** | `KLAND` / `KRELIEF` for fractured impactite-granite gorge walls along *Snou Bruk* and *Jernhorn-Alperna* spurs; `KCAVERN` (`39h-core-cavern-cut.js`) for iron-lode adits (`iron = 180`), flame-trench vaults under Launch Pad 4, and the subterranean tailrace culvert. |
| `core/water` (`open`, `shore`, `flow`, `fall`, `still`) | **Yes** | `WATER.open` + `shore` on `L1` *Roketsjö* (`+2,860.0 m`); `WATER.flow` + `fall` for `r201` *Snou Bruk* (`19.5–21.9 m³/s`) plunging down the eastern gorge AND for the 4-step engineered **Forge & Arsenal Mill-Leat** (`weir -> headrace flumes -> wheel-pits -> tailrace`), proven in [`settlements/iron-millstream`](../iron-millstream/PLAN.md). |
| `core/city` (`KCITY`) & `core/space` (`KSPACE`) | **Yes** | Replaces legacy `87-rk-layout.js` / `88-rk-place.js` custom `RSEG` & plot loops with `KCITY.create` (`civic` squares: *Ting* Square, Assembly Square, Pantheon Square, Market Square, Scraptown Kontor; terraced street & alley infill; `KSPACE` occupancy). |
| `core/hamlet` (`KHAMLET.village`) | **Yes** | Places `R1` alpine charcoal-coppice, iron-mining, saltpeter-leaching, and transhumance dairy villages (`KHAMLET.CULTURES.republican` mixing Slavic `hl_rus_*` chalets/izbas with `hl_rep_hydro_*` watermills) in the surrounding 30 km cut. |
| `core/rand` (`KRAND`) | **Yes** | Deterministic `KRAND.hash(world, cell, index, salt)` seeding for every lot, leat trestle, flora cell, and interior record; strict `reseed(N)` discipline inside `kits/highlands` builders. |
| `core/mask` (`KMASK.canvas`) | **Yes** | CPU-deterministic placement rasters for walled districts, mill-race keep-clears, launch-pad blast zones, and forest setbacks — zero `getImageData`. |
| `core/drawn` (`KDRAWN.h`) | **Yes** | Registers drawn terrain strips and engineered terrace decks so `verify.py` (`checks=harness.SURVEY`) audits camera eye height, foundations, and waterwheel immersion against drawn geometry. |
| `core/tags` (`KTAGS`) | **Yes** | Registers every building, waterwheel, weir, flume, sluice, launch arcology ruin, tree, furniture item, and citizen (`culture: 'republican' | 'rustic' | 'ancients'`) before drawing. |
| `core/atmos` (`ATMOS.bindHost`) | **Yes** | Replaces legacy `81-rk-sky.js` with the standard Krator skybox (`ATMOS.bindHost`, Gas Giant & Companion, `#include <atmos_waves>`, `ATMOS.skylight` PBR reflections on wet slate, glazed Zsolnay tiles, and *Roketsjö* waves) tuned to `+2,950 m` (`1.107 atm`). |
| `core/materials` (`KMAT`, `pack.py`) | **Yes** | Packed PBR library maps (`highlands` sidecar pack) plus pure Slavic procedural *rospis'*, *rozetka*, *pletenka*, and *nalichnik* woodcarving maps (`70-hl-tex.js`, `71b-hl-motif.js`). |
| `core/furnish` + `kits/catalog` + `kits/interiors` | **Yes** | Indexed catalog batches (`KFURN.useBatch(..., {indexed:true})`) and camera-independent `[G data]` room plans (`kits/interiors/sets/highlands.js`, including the room-by-room Hall of the Republic and First Citizen's Fortress on `72c-hl-plan.js`). |
| `core/door` (`KDOOR`, `KGLASS`, `KDOORHOST`) & `core/walk` | **Yes** | Hinged doors (`E` key), glazed *nalichnik* windows and stained keel fanlights, walkable stairs, bridges, and interior floors (`?interiors=1`). |
| `core/biome` (`buildlib.CORE_BIOME_MIN+`) & `biomes/nhighlands` | **Yes** | Reads `biomes/nhighlands` in place: blue beech, moss maple, cathedral cedar, Norway spruce, silver fir, and boulder-field old oak/yew graded by elevation from *Roketsjö* (`+2,860 m`) up *Jernhorn* (`+4,200 m` treeline). |
| `core/ruins` (`KRUINS.watch`) | **Yes** | Watches the unlaunched ruined Launch Arcology (`Pad 4`), Starport hull-plates, and gantry wrecks in Scraptown so `verify.py` enforces zero floating debris. |
| `core/simulation`, `core/sched`, `core/clock`, `core/charactermodels` | **Yes** | Cantonal stocks & trade ledger (`iron + charcoal + waterpower -> steel, tools, rockets, weapons`; `saltpeter` + imported Vothic `sulfur` -> `powder`), shift schedules for foundrymen/millwrights/assembly clerks, and `peoples.json` Republican crowds. |
| `core/host` (`KHOST`), `core/lod`, `core/minimap`, `core/export` | **Yes** | Full `KHOST` viewer (`FULL + KEYS`: Inspector `I`, Polygon tool `P`, Walk `F`, Cutaway `X`), `09-lod.js` + `97-lod-auto.js` skipping `HLANIM` waterwheels/hammers/clocks/orreries, minimap layers, and Godot export. |
| `tools/harness.py` | **Yes** | Shared headless WebGL harness (`SURVEY` checks + hydraulic head, wheel-immersion, dry-hall, and trade-census invariants). |
| `core/coast` (`KCOAST`) | **No (opt-in shore only)** | *Not applicable to ocean surf:* Roketstad is strictly landlocked (`>36 km` W of eastern Inner Wall crest); *Roketsjö* (`L1`) uses `core/water` alpine lake shore + stone barge quays rather than marine wave-cut coast classes. |
| `core/camp` (`KCAMP`) | **Optional** | Used only for seasonal teamster/salvager mule-train bivouacs outside the North (`Lipp`) and West (`Slussport`) highway gates; permanent population lives in `KCITY` wards and `KHAMLET` villages. |
| `core/engine` (`engine.py`) | **No** | *Not applicable:* Roketstad builds on the Ancients + Vernacular (`HL.def` / `VERN.place`) contract of `kits/highlands` and `kits/ancients`. |

---

## 1. Architectural & Cultural Refactor Summary (Completed Prerequisite Stages)

Before rebuilding the full `roketstad` page, three foundational prerequisites were ordered by the owner (`2026-11-19`) and executed in this branch:

1. **Standalone Painted Men Kit ([`kits/painted-men/`](../../kits/painted-men/README.md)):**
   - Split `84-tri-dwell.js`, `85-tri-village.js`, and `85b-tri-salvage.js` out of `kits/highlands` into `kits/painted-men/`, retaining 100% of the **Tlingit / Pacific-Northwest black-red-teal (`#141619`, `#b63124`, `#1f6e6c`) formline crest panels, ovoids, split-Us, Raven/Eagle/Bear/Frog/Orca totem poles, painted house-fronts, bamboo-stilt dwellings, and cantilevered cliff settlements** (`83-pm-tlingit.js`) for the north-eastern Painted Men tribes.
2. **Pure Slavic / Carpathian / Novgorodian Ornamentation in [`kits/highlands/`](../../kits/highlands/README.md):**
   - Stripped all Tlingit ovoids, split-Us, NW-coast totem poles, thunderbird wings, and cyan-red-black formline friezes from `kits/highlands` (`republican` & `rustic`), and blocked `KMAT` from re-binding Tlingit library sheets (`formF`, `hFrzT`, `hFrzA`, `hM_w_folkA/B`).
   - Replaced them throughout `70-hl-tex.js`, `71-hl-mat.js`, `71b-hl-motif.js`, `73-hl-carve.js`, `73b-hl-frame.js`, and `80`–`81` with authentic **Slavic / Rus' / Carpathian / Novgorodian carved & painted woodwork**:
     - **Solar Rosettes (*Rozetka* / *Kolovrat* / *Gromovoy Znak*):** 6- and 8-petal compass-rose sun wheels in gable tympanums, lintels, roundels, and guild friezes.
     - **Pierced Window Surrounds (*Nalichniki*) & Eaves Fretwork (*Prichelina* + *Polotentse*):** Scalloped birch-white, saffron-ochre, and vermilion lacy window casings with ogee/*kokoshnik* crowns, hanging central gable *polotentse* towel-drops, and drilled heart/star bargeboards.
     - **Slavic Ridge Finials (*Okhlupen'* / *Konyok*) & Courtyard Shrine Posts (*Kapliczka* / *Stolbtsy*):** Crossed horse-heads and solar firebirds/roosters on roof ridges, and shingled pitched-hood wayside shrine columns replacing courtyard totems.
     - **Braided Interlace (*Pletenka*) & Folk *Rospis'* Scrollwork:** Two-strand rope-braid borders, turned *kubyshka* melon-bulb porch columns, and vermilion/saffron/pine-green/ultramarine *Gorodets* & *Khokhloma* floral-berry panels.
3. **Republican Hydropower Kit (`kits/highlands/src/77c-rep-hydro.js` + `94-hl-anim.js`) & Live Stream Trial ([`settlements/iron-millstream/`](../iron-millstream/PLAN.md)):**
   - Built four animated Slavic Republican water-powered industrial buildings (`hl_rep_hydro_forge`, `hl_rep_hydro_sawmill`, `hl_rep_hydro_stampmill`, `hl_rep_hydro_gristmill`) and three modular stream-engineering structures (`hl_hydro_weir`, `hl_hydro_flume`, `hl_hydro_sluice_gate`), with spinning overshot/breastshot waterwheels, cam-lifted helve trip-hammers, oscillating forge bellows, reciprocating vertical gang-saws, and staggered 5-pestle ore-stamp batteries driven by `94-hl-anim.js`.
   - Trialled the full cascade on a real `core/water` alpine stream cut from Roketstad's Scale Model 5.1 *Snou Bruk* gorge in `settlements/iron-millstream/`.

---

## 2. Scale Model 5.1 Site Survey for `Roketstad` (`px 632, py 716`)

All measurements below come directly from `tools/scale-model/model/data/` (post-`edit_520_republic_alps.py`, version `5.1e20`), `rivers.json`, `kits/resources/data/geology.json` (`4 km/cell`), and `kits/crops`:

### 2.1 Hypsometry, Lake Bench & Gorge Relief (`30 × 30 km` Window)

- **Pin Coordinates:** `px = 632, py = 716` (`x = -1,118.0 km`, `z = -1,706.0 km`), ground **`+2,949.6 m ASL`**, atmospheric pressure **`1.107 atm`** (`CROPS.ATM` `'standard'`, comfortably breathable thanks to Krator's `1.6 atm` sea-level baseline).
- **15×15 Pixel Elevation & Water Grid (`2 km/px`, `x = 625..639`, `y = 709..723`; `~` = `L1` *Roketsjö* at `+2,860 m`, `*` = Roketstad pin at `+2,950 m`):**

```text
y \ x |   625   626   627   628   629   630   631   632   633   634   635   636   637   638   639
------+------------------------------------------------------------------------------------------
 709  |  3873  4201  4362  4442  4497  4628  4813  4865  4751  4648  4572  4460  4337  4263  4219
 710  |  3511  3854  4138  4290  4381  4487  4593  4656  4727  4790  4721  4557  4446  4420  4396
 711  |  3189  3472  3780  4054  4212  4298  4369  4456  4628  4788  4754  4594  4531  4545  4526
 712  |  2990  3163  3407  3689  3936  4093  4197  4318  4482  4628  4678  4696  4712  4670  4590
 713  | 2860~  2984  3119  3329  3568  3795  4000  4153  4302  4442  4599  4788  4882  4772  4628
 714  | 2860~ 2860~  2978  3068  3232  3433  3681  3923  4101  4272  4484  4727  4853  4806  4731
 715  | 2860~ 2860~ 2860~  2969  3007  3133  3109  3219  3347  4086  4305  4546  4696  4793  4848
 716  | 2860~ 2860~ 2860~ 2860~ 2860~  2967  2988 2950*  3201  3845  4093  4367  4553  4759  4878
 717  | 2860~ 2860~ 2860~ 2860~ 2860~ 2860~  2933  2957  3058  3526  3863  4231  4477  4685  4810
 718  | 2860~ 2860~ 2860~ 2860~ 2860~ 2860~ 2860~  2941  2956  3192  3641  4141  4419  4613  4722
 719  |  2958 2860~ 2860~ 2860~ 2860~ 2860~ 2860~  2922  2945  2984  3507  4093  4392  4585  4687
 720  |  3013  2982 2860~ 2860~ 2860~ 2860~ 2860~  2905  2943  3042  3450  4061  4420  4601  4692
 721  |  3073  3050  2978 2860~ 2860~ 2860~ 2860~ 2860~  2933  3090  3473  4033  4475  4632  4708
 722  |  3118  3089  3006  2745  2587 2860~ 2860~ 2860~  2917  3125  3524  3988  4544  4678  4748
 723  |  3125  3118  3041  2966  2639  2537 2860~ 2860~ 2860~  3102  3490  3986  4595  4729  4825
```

- **Four Defining Landforms:**
  1. **The Civic & Citadel Moraine Knoll (`631..632, 716..717`, `+2,950..+2,988 m`):** A natural glacially planed rock-and-moraine crown standing `90–128 m` above *Roketsjö*, commanding both the lake narrows and the eastern mountain road.
  2. **The Ancient Spaceport Shelf (`632..633, 717..719`, `+2,945..+3,058 m`):** A broad consolidated impactite terrace (`impactite = 140`, `stone = 255`) immediately ESE of the town knoll — wide and bedrock-stable enough (`~1.6 × 1.6 km`) to carry the pre-Cataclysm Pentagon of five Launch Arcology pads and the central Starport without sliding into the lake.
  3. **The *Snou Bruk* (`r201`) Millstream Gorge (`632.5, 714.6 -> 631.6, 718.2 -> 630.5, 720.5`):** Cuts directly between the Civic Knoll and the Spaceport Shelf! Rising at `+4,680 m` on *Jernhorn-Alperna*, `r201` delivers **`Q = 18.6–21.9 m³/s`** across a **`163.3 m` bed drop (`+3,033.0 m` to `+2,869.7 m`, and `+2,860.0 m` at the lake)** right past the eastern forge wall.
  4. **`L1` *Roketsjö* (`+2,860.0 m`, `552 km²`) & `M1` *Jernhorn-Alperna* (`+5,900.4 m`):** To the west and south-west gleams the deep glacial ribbon lake (`340 m` max depth), linking Roketstad by *Nauen* ore/timber barge `22 km` south to the **`335.8 MW` *Silvr Cataract* (`r051`, `77.8 m³/s`, `440 m` drop)** and the incline-tramway head above ***Korshamn*** (`627, 740`); to the east towers the glaciated `4.8–5.9 km` *Jernhorn* wall.

### 2.2 Geology, Mineral Endowments & the Fuel Bottleneck (`geology.json`)

| Resource / Family | At `(632, 716)` | Max `<= 30 km` (`px, py`) | Strategic & Architectural Consequence |
|---|---:|---|---|
| **`iron`** | **`180`** *(Rich)* | **`180`** `(634, 702)` | High-grade magnetite/hematite veins right in the *Snou Bruk* gorge walls -> feeds Roketstad's blast hearths and water-hammer fineries directly. |
| **`clay`** | **`254`** *(Supreme)* | **`255`** `(622, 716)` | Glacio-lacustrine refractory fireclay on the *Roketsjö* shore -> kiln-fired firebrick for blast linings, rocket nozzles, and Zsolnay-style glazed polychrome roof tiles (`hTile*`). |
| **`stone` & `impactite`** | **`255`** / **`140`** | **`255`** / **`255`** `(640, 704)` | Unlimited dressed grey granite/impactite ashlar for hydraulic wheel-pits, weir dams, bastion walls, and Peles-style civic socles. |
| **`wood` & `water`** | **`255`** / **`255`** | **`255`** / **`255`** | Dense subalpine spruce/fir/cedar/beech timber (`nhighlands`) and perennial snowmelt discharge. |
| **`saltpeter`** | `0` | **`115`** `(644, 722)` | Rich nitre caves `26.8 km` ESE -> domestic oxidizer backbone for the Rocketeers' & Alchemists' Guilds (`LORE.md` §6.5). |
| **`peat`** | `0` | **`84`** `(622, 708)` | Upland *Roketsjö* bog peat `25.6 km` NW -> domestic stove fuel and peat-kilned highland malt. |
| **`gold` / `silver` / `nickel` / `REE` / `copper` / `tin`** | `Cu: 10` | `Au:90, Ag:80, Ni:60, REE:60, Cu:50, Sn:40` `(640, 704)` | Polymetallic impact-rim veins `28.8 km` NNE -> Mint specie (`hl_rep_mint`), nickel-steel rocket tubes, and bronze bushings (supplemented by `Stahlborn` brass from `R5`). |
| **`limestone`** | `0` | **`48`** `(644, 714)` | Modest local flux stone `24.3 km` E -> blast-furnace slagging flux and lime stuccowash. |
| **`coal`** | **`0`** | **`0`** (`0` `<= 50 km`!) | **CRITICAL DEFICIT:** Zero coking coal anywhere in `R1`! Charcoal over-cutting would strip the watershed unless mechanical shaft-work runs 100% on waterpower. |
| **`sulfur` / `halite` / `quartz`** | `0` / `4` / `0` | `0` / `15` / `8` | **CRITICAL DEFICITS:** Zero native sulfur (imported from Voth `Drum` via `Cascade`), near-zero salt (`halite` imported via `Lipp` & *Slussport*), and zero optical quartz (`Footfall` salvage glass ground at *Urverkstad*). |

### 2.3 Subalpine & Lakeside Crop Palette (`kits/crops`)

Querying `CROPS.at({warmth:'cool', atm:'standard', arid:'humid', wet:true}, {works:['dark-beds'], nodes:['iron','copper']})` (`58` viable crops; `47` rainfed; `77` across `nhighlands`):
- **Lakeside & Bench Strips (`+2,860..+3,020 m`):** `frostoat`, `bistort`, `redstem` grains; `helix-bean` pulse; `flax` & `wallhemp` oil/spinning/cordage; `mountain-sorrel`, `fiddlehead`, `ivanchai` fireweed tea; `crabapple`, `cherry`, `serviceberry`, `rowan`, `bilberry`, `cloudberry` orchards/hedges; `woad`, `broom`, `lichen`, and iron-oxide `falu-red` dyes.
- **Spent Iron-Adit Dark-Beds:** Frost-proof `pale-fungi`, `alecap` (fermented in `hl_rep_workshop_b` breweries), `moon-cap`, and `glow-mushroom`.

---

## 3. Staged Rebuild Roadmap for `settlements/highlands`

| Stage | Scope | Deliverable |
|---|---|---|
| **Stage H1 (Done)** | Split `kits/painted-men/`, Slavicize `kits/highlands`, build `77c-rep-hydro.js` + `94-hl-anim.js`, trial on real stream in `settlements/iron-millstream/`, scope `Roketstad` 5.1 blueprints | `kits/painted-men`, updated `kits/highlands`, `settlements/iron-millstream`, `PLAN.md`, `ROKETSTAD-BLUEPRINT.md` |
| **Stage H2 (Next)** | Cut `openworld/iron-republic-east` (`Roketstad` + *Korshamn* + *Roketsjö* + *Silvr* cataract) via `cut_site.py --upsample 8` and port `roketstad` terrain onto `WORLD.Hland` + `core/water` + `core/atmos` | `openworld/` region cut + `84-rk-geo.js` replaced by `28-rk-model.js` & `WORLD.landHook` |
| **Stage H3** | Port `roketstad` street/lot placement onto `KCITY` (`core/city`) + `KSPACE`, laying the 4-tier *Snou Bruk* hydropower leat cascade (`ROKETSTAD-BLUEPRINT.md` §3) between the Civic Knoll and Scraptown/Spaceport | `dist/roketstad.html` on `KCITY`, `core/water`, and `77c-rep-hydro.js` |
| **Stage H4** | Wire `KHAMLET.CULTURES.republican` hinterland villages, *Roketsjö* `Nauen` ore/charcoal barges, and `KSIM` cantonal stocks & schedules | Full `R1` simulation + `verify.py --assert` (`SURVEY` checks) |
