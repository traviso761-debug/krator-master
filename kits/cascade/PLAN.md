# kits/cascade: the Cascade hydropowered industrial arcology kit (plan, 2026-11-24)

**Cascade** (`568,841` on the Cascade River / *Kaskejt Rivr*, Iron Republic): a hydropowered industrial-agricultural
arcology inspired by Paolo Soleri's *7. Arcvillage I* (`reference/sheet1-site-and-crown.png`, `sheet2-plans.png`,
`sheet3-elevation-section.png`), with the stepped faceted pyramidal crown motif from Sheet 1 (#2), planned from the
ground up with audited **living**, **work**, **recreation**, and **civic** interiors so that its **Iron Republic
(`republican`) refurbished state** serves directly as the centerpiece of Cascade, alongside its **Ancient `intact`**
and **post-Cataclysm `ruined`** states.

## 0. Core adoption

Written before the first fragment (`README.md`, "CORE MODULES ARE NOT OPTIONAL"; `tools/check_core_use.py` `ALL_MODULES`).

### Modules taken

| Module | How `kits/cascade` uses it |
|---|---|
| `core/rand` | `KRAND.hash` / `KRAND.unit` / `KRAND.vnoise` for all seeded variations, crop/tree placement, ruin breaches, and stain fields; zero sequential `Math.random` |
| `core/tags` | `KTAGS`: registers the complex, its 8 apses, 12 column-towers, crown, canal works, gardens, every interior room, and every furniture record before drawing |
| `core/space` | `KSPACE`: spatial keep-clear and occupancy checks for site flora, rubble mounds, and room/yard layouts |
| `core/drawn` | `KDRAWN.grid` + `KDRAWN.mesh`: registers the drawn terrain heightfield (with the carved canal trench) and plaza slabs for `harness.SURVEY` `drawn-ground` |
| `core/biome` | `buildlib.CORE_BIOME_MIN` + `31j`, `33`, `41`, `42`, `43`, `44`: hosts `biomes/nhighlands` read in place for northern-highlands orchard/garden trees and understorey flora |
| `core/materials` | `core/materials/record` (`KMAT`) + `materials.json` + `tools/textures/pack.py` -> `tex/`: Ancient white panel, board concrete, relief block, bronze, and Iron Republic iron, corrugate, birch/pine siding, celadon tile, cut stone, tilled soil, turf, demolition rubble |
| `core/atmos` | `ATMOS.skyBiome` + `ATMOS.skylight`: standard Krator skybox with gas giant, sun, clouds, colour script (day/dawn/night), and live water skylight capture |
| `core/water` | `WATER.flow`, `WATER.fall`, `WATER.still`, `WATER.drawFlow`, `WATER.drawFall`, `WATER.drawStill`, `WATER.checkPrograms`: the elevated southern headrace aqueduct (`y = 32.3 -> 31.8 m`), central surge basin, 3 roaring `32.6 m` central cataracts, central turbine plunge basin, and lower S/E/W tailrace & circular-garden loop canals |
| `core/furnish` | `KFURN`: camera-independent furniture records for all programmed interior rooms (socketable by culture; `republican` for `refurbished`, `ancient` for `intact`) |
| `core/host` | `khost.FULL` + `99-host-section.js`: camera, walk/fly loop, inspector (`93-host-inspect.js`), marks/polygon tool (`94-host-marks.js`, `94-host-polytool.js`), minimap (`97-host-minimap.js`), horizontal storey cut-away (`99-host-cutaway.js`: `X`, `[`, `]`), and real-time vertical Soleri cross-section cut (`99-host-section.js`: `C`, `Shift+C`) |
| `core/minimap` | `88-core-minimap.js`, `88a-core-minimap-host.js`: record-driven minimap of the octagonal arcology, canals, and twin circular gardens |
| `core/edits` | `40-core-edits.js` + `host.edits_js`: persistent delta overlay keyed by stable record/piece id |
| `core/walk` | `KWALK`: walkable ground, canal bridges, Central Industrial Hall floor & mezzanine galleries, open interior storeys, stairs, and lift rides |
| `core/door` | `KDOOR`, `KGLASS`, `KDOORLEAF`, `KDOORHOST`: interior partition doors and ground/terrace portals |
| `core/ruins` | `KRUINS.watch` + `KRUBBLE` (`core/terrain/37c-core-rubble.js`): verifies the `ruined` state has zero floating pieces and every detached wreck lies on the ground |
| `core/terrain` | `37c-core-rubble.js` (`KRUBBLE` demolition mounds) and `38a-core-seat.js` (`KSEAT`) |
| `core/shadow` | `KSHADOW`: view-following directional shadow map, off by default (`?shadow=1` or panel toggle) |
| `core/clock` | `KCLOCK` (via `core/host`): drives sky hour and day/dawn/night lighting |
| `core/shader` | `KHOOK`, `KCOLOR` (via `core/host`): shader composition and linear/sRGB helpers |
| `core/export` | `07-core-export.js`, `09-core-export-adapters.js`: `EXPORT.world` container for Godot export |

### Modules not taken (one-line reason per module)

- `core/world`: standalone building/complex kit showcase; a settlement placed on the map supplies `WORLD.H` when reading `kits/cascade` in place.
- `core/coast`: inland canal and basin complex with no marine coastline.
- `core/city`: one pre-planned megastructure complex; surrounding town streets and lots belong to the host settlement build (`AV.portals()` exposes the street/canal/aqueduct connection sockets).
- `core/hamlet`: standalone megastructure kit, not a village scatter.
- `core/camp`: no nomad band camps in the kit showcase.
- `core/simulation`, `core/sched`, `core/region`: citizen actors and regional trade run in the host settlement; `AV.settlementSlots()` exports the exact housing, job, rec, and civic capacities as `[G data]` records for `SIM`.
- `core/engine`: uses merged material-bucket hero builder (`50-av-kit.js`, after `kits/metropolis`) suited to a 220 m curved-apse and cylindrical-tower megastructure with horizontal and vertical section cuts.
- `core/lod`: three hero complexes + baked biome instances fit comfortably under 750k triangles and 160 draw calls without automatic mesh-chunking (which would interfere with live `99-host-section` clipping planes).
- `core/mask`: analytical octagonal, circular-garden, and canal geometry (`40-av-records.js`, `44-av-site.js`) needs no raster canvas mask.
- `core/anomaly`, `core/hazard`: benign industrial-agricultural arcology with no extraplanar anomalies or environmental hazards.

### Shared kits read or bundled

- `kits/catalog` (`furniture_bundle.py`): `republican`, `hl-republican`, `generic`, `generic-goods`, `generic-fruit`, `jobs`, `arms`, `post-apoc`, `scrap`, plus harvested Ancient extras (`harvested=True, tex=True`).
- `kits/interiors` (`kit_bundle.py`) + `kits/ancients-interiors` (`kit_bundle.py`): `ROOM()`, `furnishRoom`, `AI.ringPlate`, `AI.barPlate`, `AI.hallPlate`, hall recipes (`reception`, `dining-hall`, `crew-mess`, `store-hall`, `drill-hall`, `officers-hall`, `gallery`, `greenhouse`, `engine-room`, `bridge`, `plaza`), and audits.
- `kits/crops` (`10`, `20`, `22`, `40` read in place): deterministic crop selection (`CROPS.forBiome('nhighlands')`) for the twin circular irrigated gardens and conservatory.
- `biomes/nhighlands` (`50`, `55`, `60`, `70` read in place): northern-highlands trees (`birch`, `rowan`, `brookwillow`, `gnarloak`, `mountainmaple`, `larch`) and understorey ferns/herbs for the gardens and rooftop park.

---

## 1. Unified Hydropowered Industrial Geometry from Soleri's Three Sheets

All three reference spreads depict **Arcvillage I** (height **220 m**, footprint **372 x 372 m** chamfered square / octagon covering **12.16 ha**), reworked into a **hydropowered industrial-agricultural arcology** where high-head waterpower feeds a dramatic **Great Central Industrial Hall**:

1. **Elevated Southern Headrace Aqueduct, Roaring Central Cataract & Tailrace Loop (`y = -3.2 .. +33.4 m`)**:
   - A monumental **Southern Elevated Headrace Aqueduct Viaduct** (`y_water = 32.3 -> 31.8 m`) marches north on cyclopean stone and concrete arches directly above the lower South Tailrace Spillway Canal (`y = -0.8 m`), passing through the **South Aqueduct Headgate Tower** (`z = 188 m`) and piercing cleanly through an upper arch & split amphitheater terraces in the South Apse (`k = 2`).
   - At the core of the arcology, the internal headrace viaduct feeds a **Bifurcated Surge Headbox** (`z = 15..25 m, y = 31.8 m`) that unleashes **three `32.6 m` waterfalls** (`WATER.fall` + `WATER.drawFall`: central cataract + west/east wheel chutes) plunging into the `44 x 44 m` **Central Turbine Tailrace Basin** (`y = -0.8 m`), plus **twin diagonal riveted-iron penstocks**.
   - Spent tailrace water discharges south under the viaduct arches and east/west through **Tailrace Sluice Houses & Barge Locks** (`x = ±142 m`) with **4 moored industrial cargo barges** (`ore`, `timber`, `ingots`, `grain`) to irrigate the **Twin Circular Gardens** (`x = ±265 m, r = 106 m`).
2. **Great Central Hydropower Industrial Hall (`y = -3.3 .. +46.0 m`, `P.hydroHall`)**:
   - **Mechanical Waterpower**: **4 giant `r = 6.2 m` spinning overshot hydro-wheels** (`2` upper at `y = 21.6 m`, `2` lower at `y = 8.6 m`) drive **4 vertical bevel-gear drive-shaft towers** (`y = 0 .. 31 m`) and **5 overhead belt-and-pulley line-shafts** powering machine-tool beds, **2 reciprocating cam-driven water-powered trip-hammers** with glowing steel billets on their anvils, **2 `19.5 m` blast cupola smelting furnaces** with molten tapping launders, and a `y = 40.5 m` **overhead travelling bridge gantry crane** carrying a glowing molten ladle.
   - **Hydro-Electric Power**: Twin high-pressure penstocks feed **4 `4.5 MW` scroll-case hydro-dynamos** on the `L1` powerhouse floor, sending glowing copper/arc **busbar risers** up the **4 inner cylindrical column-towers** to power the upper electro-mechanical guild works and the `220 m` summit arc-beacon.
3. **Eight Carved Stepped Apses (`y = 0 .. 72.0 m`)**, **Twelve Cylindrical Column-Towers (`y = 0 .. 198 m`)**, **Recessed Arched Waist (`y = 72.0 .. 86.4 m`)**, **Mid-Level Rings & 8 Spoke Sky-Bridges (`y = 86.4 .. 136.8 m`)**, **Inverted-Pyramid Cantilevered Collar & Roof Deck (`y = 136.8 .. 172.8 m`)**, and **5-Tier Stepped Faceted Pyramidal Crown (`y = 172.8 .. 220.0 m`, Sheet 1 #2)**.

---

## 2. Interior Programme: Work, Civic, Living & Rec (`41-av-plans.js`)

Fourteen planned deck levels (`0..13`), buffered acoustically and thermally from the lower hydro-industrial core up into civic markets, baths, and sunlit residential rings:

| Deck | Height `y` | Zone | Primary Categories | Rooms & Recipes |
|---|---|---|---|---|
| `L0` | `0.4 m` | Tailrace Turbine Vaults & Barge Quays | **Work**, **Rec** | Tailrace turbine halls (`engine-room`), ore/coal barge vaults (`store-hall`), heavy smithies (`workshop`), barge-quay tavern (`crew-mess`) |
| `L1` | `6.0 m` | Central Industrial Hall & Heavy Foundry | **Work** | Rolling mills & trip-hammer bays (`workshop`), hydro-dynamo switchgear (`engine-room`), cupola casting hall (`drill-hall`), ingot/coke stores (`store-hall`), foundrymen's mess (`crew-mess`) |
| `L2` | `16.2 m` | Line-Shaft Machine Galleries & Terraces | **Work**, **Living** | Belt-driven lathe/planer/pattern galleries (`workshop`), turbine draft offices (`study`), outer apse foremen's apartments (`living`, `bedroom`, `kitchen`, `bath`) |
| `L3` | `34.2 m` | Headrace Level Mills & Apse Flats | **Work**, **Living** | Headrace water-powered grist/saw/textile mills (`workshop`, split cleanly around South Aqueduct notch) & sunlit apse flats |
| `L4` | `52.2 m` | Civic Market Ring & Upper Belvederes | **Civic**, **Living**, **Rec** | Grand Market Arcade (`shop`), Customs & Registry (`reception`), Commons Refectory (`dining-hall`), Clinic (`sickbay`), upper apse cottages & belvederes |
| `L5` | `72.0 m` | Arched Waist Steam Baths & Drill Halls | **Rec**, **Work** | Waste-heat foundry steam bathhouses (`gallery`), athletic & militia drill halls (`drill-hall`), shift refectories (`crew-mess`) |
| `L6` | `93.6 m` | Midlevel Electro-Mechanical Guild Works | **Work**, **Civic** | Busbar-fed precision instrument, printing & weaving guildhalls (`workshop`, `study`, `shop`, `reception`) |
| `L7` | `108.0 m` | Midlevel Living-Working & Spoke Bridges | **Living**, **Work** | Inner library/scribes (`library`, `study`), 8 spoke sky-bridges, outer `LIVING-WORKING` studios & family apartments |
| `L8` | `122.4 m` | Midlevel Residential Ring | **Living**, **Rec** | Full octagonal residential ring (`living`, `bedroom`, `kitchen`, `bath`, `dormitory`) + neighborhood commons (`hall`, `tavern`) |
| `L9` | `144.0 m` | Cantilevered Collar Guildhall & Mint | **Work**, **Civic** | Grand Guildhall, mint/printing presses, engineering & metallurgy labs (`officers-hall`, `workshop`, `study`, `library`) |
| `L10` | `158.4 m` | Cantilevered Collar Court Apartments | **Living**, **Rec** | Burghers' & Consuls' court apartments (`wealth: 0.85`), banquet halls (`dining-hall`), lyceum (`study`, `hall`) |
| `L11` | `172.8 m` | Roof Deck & Cultural Center | **Rec**, **Civic** | South Peoples' Assembly Hall (`officers-hall`) & Great Archive (`gallery`), East/West Playground Clubhouses (`drill-hall`, `crew-mess`), North Sky-Pad Control (`bridge`) |
| `L12` | `187.2 m` | Pyramidal Crown Conservatory | **Work**, **Rec** | Four-wing hydroponic & highland botanical conservatory (`greenhouse` recipe) under the faceted skylight slopes |
| `L13` | `201.6 m` | Pyramidal Crown Observatory | **Civic**, **Work** | Consuls' High Observatory, Semaphore & Arc-Beacon Control (`bridge`, `reception`) beneath the 220 m lantern |

---

## 3. Three Showcase States & Settlement Hand-over

- **`refurbished` (center `(0, 0)`, culture `republican`)**: Iron Republic hydropowered industrial-agricultural centerpiece ready for a settlement such as Cascade. Elevated stone/iron headrace aqueduct, 3 roaring central cataracts, 4 spinning iron-and-birch overshot wheels, bevel-gear towers, line-shafts, 4 scroll-case hydro-dynamos with electric arc busbars, 2 reciprocating trip-hammers, 2 glowing blast cupolas, overhead ladle crane, tailrace sluice houses, 4 cargo barges, irrigated Twin Circular Gardens, and full `republican` interior furnishings.
- **`intact` (`(-900, -700)`, culture `ancient`)**: Pre-Cataclysm Ancient hydro-dynamo arcology in gleaming white seamed panels, bronze turbines & hoops, live cyan busbars & plasma furnaces, cyan summit beacon, and `ancient` interior furnishings.
- **`ruined` (`(+900, -700)`, post-Cataclysm)**: Breached internal aqueduct span, ruptured penstock, broken upper collar and pyramidal crown facets, cold cupolas, `KRUBBLE` demolition mounds and fallen column drums seated on `terrainH`, verified by `KRUINS.watch` (`0` floating pieces).

**Settlement API (`40-av-records.js`, `41-av-plans.js`, `52-av-hero.js`, `56-av-interiors.js`)**:
- `AV.plan({state, culture, seed})` -> deterministic `[G data]` plan record including `P.hydroHall`.
- `AV.settlementSlots(plan)` -> `{households, capacityPopulation, jobs, categories, rooms}` for `core/simulation`.
- `AV.portals(plan)` -> world-frame coordinates and headings of the 8 ground/tailrace gates + 1 elevated headrace aqueduct portal (`9` total).
- `AV.buildHero(plan, opts)` -> `THREE.Group` ready to place at any settlement `(x, y, z)`.
