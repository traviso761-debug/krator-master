# Eidolon: Iziz's Bowl-rim garrison & caravan town around refurbished Arckibuz (plan, 2026-11-24)

**Eidolon** is the Empire of Iziz's fortified garrison, Forgemasters mech depot, and trans-continental caravan hub on the
south-eastern Bowl-rim plateau (`px 1016, 1058`, replacing the placeholder `Arcbeam` pin `skz25tuq0w` in-place). Its
centerpiece is Paolo Soleri's **Arckibuz** (`kits/ancients/targets/arckibuz`, `buildArckibuz` at `d = 3`), refurbished by
the Legions as the **Citadel of Eidolon** (`1,660` people in active wings, `+840` behind sealed eastern bulkheads) and
surrounded by a walled `core/city` surface town (`~6,200` people; **~7,860** permanent urban census, matching the map's
`7.5k–10k` tier) built from a three-kit vassal mix on the shared `VERN.def` contract: **Iziz Vernacular**, **Talia**, and
**Pylon**.

**Owner's calls (2026-11-24):**
1. **Spec first (`settlements/eidolon/PLAN.md`)** so layout, districts, census, and kit integration are settled before
   code runs.
2. **Three-kit `VERN.def` surface mix:** `kits/iziz-vernacular` for the Legion garrison, barracks, and Izani officer
   quarter; `kits/talia` for the vaulted caravanserais, customs house, bourse, and arcaded bazaar along the Ancient
   highway; `kits/pylon` (neo-Ancient & salvage in white render and Iziz orange) around the arcology pit rim and crawler
   works.
3. **In-place pin replacement (`skz25tuq0w`, `px 1016, 1058`):** Eidolon replaces `Arcbeam` on the scale model's
   waterless `+2,119 m` Bowl-rim plateau on the Iziz–Parabola–Yuni surface Ancient highway; `kits/ancients/targets/arcbeam`
   remains an unplaced kit showcase target.
4. **Scale & split (`~7,500–8,500` total):** `~1,660` inside Refurbished Arckibuz (Legion Commandery in the Council Bowl,
   cohort & artificer billets in the three active housing wings, bonded caravan & ordnance vaults in the sunken pit) +
   `~6,000–6,800` in the walled `core/city` garrison, mech-yard, and caravanserai town, plus `core/camp` caravan pitches
   outside the gates.

---

## Core adoption

Every module required by `README.md` ("CORE MODULES ARE NOT OPTIONAL") and `tools/check_core_use.py` is taken in place;
no bespoke PRNG, noise, occupancy grid, camera, water shader, or sky is written.

| Module / Kit | Taken | How Eidolon uses it |
|---|---|---|
| `core/city` (`KCITY`) | yes | Single `KCITY.create` instance (`rand: 'krand'`, `TUNE.cell = 2.5`, `±720 m` raster) laying out the surface town around `ARCKIBUZ.HULL`'s reserve polygon (steps 0–5 site, highway, curtain wall & gates; steps 6–12 civic by `near`, avenue/main/side lots, `alleys` in bazaar/salvage & `frontage-courts` in caravan/garrison blocks) |
| `core/rand` (`KRAND`) | yes | `KRAND.hash` / `KRAND.cell` for every seed (`eidolon` world salt, lot slots, camp pitches, crop strips, patrol schedules); zero draw-order streams |
| `core/space` (`KSPACE`) | yes | Through `KCITY.boxIndex` / `segIndex` and camp/vehicle clearance checks |
| `core/mask` (`KMASK`) | yes | District, pit-exclusion, glacis, and road-verge masks (`KMASK.canvas` only; never `getImageData`) |
| `core/tags` (`KTAGS`) | yes | Every Citadel organ, surface lot, gate, mech, vehicle, and camp piece registered before drawing (`uid: 'skz25tuq0w/...'`) |
| `core/door` & `core/walk` | yes | Real `KDOOR` leaves and `KGLASS` panes across both `AKB_INTERIORS` and the `VERN.def` hollow buildings (`69e5-iziz-openings.js`); walkable Citadel ramps, Sky Promenade, Council Bowl, and palace stairs |
| `core/furnish` & `kits/interiors` | yes | Citadel interiors via `kits/ancients-interiors` (`_api.arckibuzSocket('iziz')` / `'pylon'`); surface `VERN.def` & `tal_*` hollow buildings via `kits/interiors/sets/talia.js` and Iziz's room dresses |
| `core/water` & `core/atmos` | yes | `AKB_WATER` (rooftop reservoir at `y = 120.2 m`, Sunken Court cascade & cistern, shaded pit cooling moats, glacis irrigation rills, town standpipe troughs) under `ATMOS` clock, skylight, and sky dome |
| `core/ruins` (`KRUINS`) | yes | Watches the breached/quarantined eastern dormant sector's exterior debris & any roadside Ancient highway pylons |
| `core/lod` & `core/host` | yes | Distance LOD across `KCITY` instanced buildings (`52-city-host-buildings.js`), standard camera, inspector, and `verify.py` probe |
| `core/world` & `core/terrain` | yes (open world) | `WORLD.H` at `px 1016, 1058`; Eidolon's `250 × 250 m` Arckibuz pit (`-27.8 m`) and sunken highway trench (`-6.5 m` at `x = +154 m`) stamped as a `[G data]` `WORLD.landHook` ground delta (`plan/skz25tuq0w.ground.json`) |
| `kits/ancients/targets/arckibuz` | yes (read in place) | `8aw0`–`8aw3` & `8zz4`: `buildArckibuz(scene, 0, 0, 3, { noTerrain: true, ground })`, `ARCKIBUZ.HULL` (`span: 184`, `H: 120`, `rAt(y)`, `toeZ(x)`, `zUp(x)`, `docks`), and `AKB_INTERIORS` (`426` rooms) |
| `kits/iziz-vernacular` + `kits/talia` + `kits/pylon` | yes (shared `IZV` bundle) | All three share the `VERN.def` engine (`settlements/iziz/VASSAL-KITS.md`): bundled once from `kits/iziz-vernacular/vernacular.py` `bundle_files()` + `kits/pylon/src` (`9001–9399`) + `kits/talia/src` (`9401–9799`), zero seed or helper clashes |
| `kits/mechs` & `kits/motor-vehicles` | yes (bundled) | `mech_bundle.bundle(['iziz'])` (`iz_castra`, `iz_centurion`, `iz_forfex`, `iz_fabrica`, `iz_hoist`, `iz_scorpio`, `iz_speculator`, `iz_catulus`, `iz_turris`) and `vehicle_bundle.bundle(['iziz', 'eastabyss', 'post-apoc', 'ancient'])` (`iz_six_wheeler`, `ab_caravan_truck`, `pa_crawler_hab`) |
| `core/camp`, `core/hamlet`, `kits/crops`, `kits/resources`, `core/simulation` | yes | `KCAMP.pitch` for visiting caravan & nomad-scout camps outside the gates; `KHAMLET` (`21-hamlet-iziz.js`) + `kits/resources` + `CROPS` for the SW iron/nickel mine (`10 km` off) and upland Frostoat/Emmer farms; `SIM` workplace & carrier hooks |

---

## 1. The site (`skz25tuq0w`, `px 1016, 1058`) and why Arckibuz replaces Arcbeam

### 1.1 Scale-model 5.1 survey at `px 1016, 1058`

Measured directly from `tools/scale-model/model/data` (`h.png`, `tm.png`, `p.png`, `c.png`) and
`openworld/resources-settlements.json`:

| Field | Value at `1016, 1058` | Implication for Eidolon |
|---|---|---|
| **Settlement ID** | `skz25tuq0w` (`Empire of Iziz`) | Stable root ID kept (`skz25tuq0w/lot/...`), `name` updated `Arcbeam` → `Eidolon`, `type`: `'arcology'` / `'town'` |
| **Elevation & Slope** | **`+2,119.0 m`**, dry (`wet = false`), **`5.4 m/km` (`0.31°`)** gentle tilt upslope toward `008°` (N) | **Grade A/B open-world fit** (`openworld/PLAN-SETTLEMENTS.md`): flat upland bench (`1,967–2,239 m` across `±10 km`, `272 m` total relief) needs **zero map surgery** |
| **Surface Water** | **`0 km` rivers, `0` lakes** (`water_at_pin: false`, `river_q_max: 0`) | Explains why `Arcbeam` (a 1.9 km gorge-spanning bridge city) never fit this pin, and why **Arckibuz**—a water-conserving pit-and-reservoir citadel with subterranean cisterns and an open surface highway—fits it natively |
| **Climate & Air** | **`Cfa` cool upland**, **`12.0 °C`** mean, **`847 mm`** rain, **`1.23 atm`** | Temperate highland borderland between Iziz's warm jungle/savannah heartland (NW) and the arid Bowl / SE Desert Nomad steppe (SE); supports rain-fed upland grain plus irrigated citadel gardens |
| **Mineral Lodes (`20 km` reach)** | **Iron** (`64.6`, peak `220`, rich lode **`10 km` SW** at `1012, 1061`), **Nickel + Cu/Pt** (`56.9`, peak `220`, `192 km²` rich — #3 globally), **Saltpeter** (`43.3`, peak `165`, `332 km²`), **Sedimentary Stone** (`255`) & **Impactite** (`140`) | Drives Eidolon's **Forgemasters Mech-Repair & Smelting Quarter** (armour plate, nickel-steel actuators, ballista torsion springs, rocket/ordnance propellant from local saltpeter) |
| **Timber & Crops** | `548 km²` upland forest (`wood` `128.8`), `740` farm score | `CROPS`: **Frostoat**, **Plain emmer**, **Helix-bean**, **Murnong**, **Ivan-chai**, **Paper-maple syrup**, **Cairn-nettle**, **Sky-poppy** (field analgesic/reagent), **Vale saffron** |

### 1.2 Strategic road & trade crossroads

Eidolon stands at the **south-eastern land-gate of the Empire of Iziz**, where the heartland highways leave the settled
basin and strike out across open, bandit-raided uplands:

| Corridor | Route & Distance | Traffic & Threat (`openworld/TRADE-GEMINI.md`, `ANCIENT-NETWORK.md`) |
|---|---|---|
| **Heartland Trunk (NW)** | `Iziz` (`963, 985`, `180 km` NW) & `Marr` (`926, 1017`, `198 km` WNW) via `Gioli` (`983, 1023`, `96 km`) | Legion troop rotations, Forgemasters spare parts, grain/oil taxes, outbound luxury & mineral convoys |
| **Yuni–Iziz Trunk (E)** | `Mantis` (`1114, 1164`, `289 km` ESE) → `Yuni` (`1263, 1089`, `735 km`) | **`54.5 units` Yuni goods/cybernetics** & East-Abyssal trucks bound for Iziz; heavily raided by **Desert Nomad Bandits**—convoys form up under Legion mech escort at Eidolon |
| **Talia Spur (NNE)** | `Atton` (`1008, 972`, `173 km`) → `Fridon` (`255 km`) → `Talia` (`1072, 936`, `268 km` NNE) | Talei merchant houses, factors, caravan clerks, and University surveyors (bringing the `kits/talia` architectural presence to Eidolon's bazaar and serais) |
| **Godsgate Surface Highway (SSE)** | `Eidolon` → `Parabola` (`970, 1186`, `272 km` SSW) → `Bab al-Hawa (Godsgate)` → `Stair` → `Strongbow` / `Longsong` / `Qiblai` | Pure **open-surface Ancient highway** (`ANCIENT-NETWORK.md` §8: no subterranean tube to Stair). Longsong histories, Xanadu goods, and Jimjam trans-continental caravans all clear Izani customs here |

### 1.3 Why "Eidolon"

In Legion and caravan speech, rising across `40 km` of open Bowl-rim steppe, the white cantilevered block of Arckibuz
hovering above its invisible sunken pit—crowned by glowing amber sun-sails and the square water-tower silhouette—looks
like a mirage or apparition floating above the plain (*Eidolon*, the Pale Citadel). The Izani garrison keeps the name for
the town, calling the arcology itself **the Keep** or **the White Chest**.

---

## 2. The Citadel of Eidolon (Refurbished Arckibuz at `x = 0, z = 0`)

Eidolon places `buildArckibuz(scene, 0, 0, 3, { noTerrain: true, ground: eidolonGround })` at the town's heart, using
`ARCKIBUZ.HULL` (`8aw0-arckibuz-plan.js`) so the surrounding `core/city` streets, bridges, and water rills snap directly
to the concrete faces without magic numbers, and re-dresses the `305` audited interior room templates via
`arckibuzSocket('iziz')` (with `'pylon'` salvage accents in the pit works).

| Arckibuz Organ (`targets/arckibuz`) | Elevation | Refurbished Role in Eidolon (`d = 3`) | Dress & Details |
|---|---|---|---|
| **Sunken Pit Vaults (`pit`)** | `y = 0.2 .. 14.2 m` (`250 × 250 m` pit) | **Imperial Bonded Vaults, Quartermaster Granary & Saltpeter Arsenal.** West vaults press oil & mill Frostoat/Emmer; south vaults hold bonded Yuni & Longsong high-value freight under guard; Sunken Court cascade & shaded perimeter moats cool the workshops | Furnished (`iziz` + `post-apoc` stores); two `iz_hoist` cargo cranes lift palletized crates from pit floor (`+0.2 m`) to the rim causeways (`+28.0 m`) |
| **Highway Underpass & Shelter (`pit`)** | `y = 0.5 .. 33.6 m`, `x = +84 .. +208 m` | **The Toll Gate & Sunken Highway Postern.** The Ancient surface highway runs N–S through the `y = 21.5 m` cut at `x = +154 m`; Arckibuz's eastern tunnel passes *under* the roadbed to the **Subterranean Shelter**, repurposed as the **Highway Customs Inspection Vault & Raid Bunker** under its hyperbolic light shaft | `iz_six_wheeler` Lancer patrol parked at the highway ramp; customs barrier & weighbridge straddling `x = +154 m` |
| **Polygonal Apron Gardens (`5` bastions)** | `y = 28.0 m` (`r = 125 .. 245 m`) | **The Citadel Glacis & Irrigated Garrison Plots.** Kept clear of tall buildings as a `120 m` defensive esplanade around the pit; stone windbreak bunds double as breastworks, growing irrigated Frostoat, Helix-bean, Murnong, and **Sky-poppy** (the Legion infirmary's analgesic crop) | Watered by `AKB_WATER` gravity rills fed from the rooftop reservoir; `iz_scorpio` ballista walkers stand watch on the NW and SW bastion noses |
| **City Center & Council Bowl (`community`)** | `y = 22.0 .. 53.0 m` | **The *Praetorium* & Convoy War-Room.** Soleri's 6-tier circular stepped **Council Amphitheater** (`r = 23.5 m`, open to the Sky Court) is the *sid'kiñ*'s & Legate's muster and convoy-briefing bowl; `AI.ringPlate` galleries hold the Chancery, Escort Dispatch, Cartography Room, and Shrine of the Sun & Orb; the 4 pinwheel bastions house the **Officers' Mess**, **Caravan Tribunal**, **Forgemasters' Hall**, and **Legion Infirmary** | Iziz orange banners (`core/sockets`) hung from the 8 council ring columns; warm electric glazing (`vLit`) at night |
| **Active Housing Crown (`housing-n`, `-s`, `-w`)** | `y = 53.0 .. 105.0 m` (`184 m` span) | **Cohort Billets, Artificer Flats & Clerks' Quarters** (`~1,280` of the Citadel's `1,660` residents; the remaining `~380` lodge in the pit/neck quarters). Shaded by 5 woven Iziz-orange-and-cream tensile **Tent Structure** sails above the Sky Promenade (`+53 m`) | Cellular casemates lit in warm amber clusters; rooftop heliograph & signal braziers answering `Gioli` and `Parabola` |
| **NE Shoulder Water Reservoir** | `y = 95.1 .. 120.2 m` | **The Head-Tank & High Watch.** Impounds pumped aquifer & rainwater (`+118 m` head) feeding both the Citadel cisterns and the surface town's standpipes & bathhouse | Crowned by a Legion signal mast and `iz_catulus` / spotter post with `40 km` Bowl-rim visibility |
| **Sealed Eastern Wing (`arckibuz/3/dormant`: `housing-e` + `pit-east`)** | `y = 0.2 .. 95.1 m` (`+840` cap.) | **The Sealed Wing (Quarantined Sector).** Locked behind riveted Izani alloy bulkheads (`state: 'rehab'`, `pieces: 0`, `20%` broken partitions): collapsed lower ducts from the Cataclysm and dormant Ancient utility conduits that the Forgemasters license salvagers to probe room-by-room | Ready-made dungeon / quest / settlement-expansion socket (`arckibuzSocket('iziz', { includeDormant: true })` unseals it) |

---

## 3. The surface town (`core/city` around `ARCKIBUZ.HULL`)

### 3.1 Coordinate frame & `WORLD.landHook` ground delta

- **Origin `(0, 0)`:** Center of Refurbished Arckibuz, datum `y_local = 28.0 m` = scale-model plateau `+2,119.0 m`
  (`y_world = WORLD.Hland(wx, wz) + delta(x, z)`).
- **Orientation:** `-z` North (toward `Atton` / `Talia` and NW fork to `Iziz`), `+x` East (toward `Mantis` / `Yuni`),
  `+z` South (toward `Parabola` / `Godsgate`), `-x` West (toward the `1012, 1061` iron & nickel mine).
- **Ground delta (`eidolonGround`, `[G data]`):**
  1. Levels the town pad (`r <= 620 m`) gently onto the `+28.0 m` rim datum with a `150 m` cosine feather into `WORLD.H`.
  2. Cuts the **`228 × 228 m` Arckibuz Pit** (`y = 0.2 m`, stepped sandstone ledges matching `ARCKIBUZ.HULL`).
  3. Cuts the **Ancient Sunken Highway Trench** along `x = +154 m`: depressed to `y = 21.5 m` beside the Citadel
     (`z = -140 .. +140 m`, passing over the Shelter underpass tunnel) and ramping smoothly at `3.5%` grade (`185 m`
     ramps) back up to `y = 28.0 m` at `z = ±325 m` inside the North and South Caravan Plazas.
- **Citadel reserve (`HARD` / `GREEN` on `KCITY` raster):** `ARCKIBUZ.HULL`'s pit + 5 polygonal vegetable-garden bastions
  (`r ~ 245 m` W/N/S, `x = +215 m` E around the Shelter shaft) are stamped onto `KCITY`'s step-0 raster so no surface lot
  ever intrudes on the Citadel glacis or blocks a pit causeway.

### 3.2 Curtain wall, gates, and street hierarchy (`steps 0–5`)

Because Desert Nomad Bandits raid the Bowl-rim roads (`TRADE-GEMINI.md`), Eidolon is enclosed by a ** polygonal bastioned
curtain wall** (`tal_wall` + `tal_wall_tower`, `1,180 × 1,040 m` envelope, merlons capped in Iziz orange) pierced by
four named gates:

| Gate / Avenue | Class | Alignment & Landmarks |
|---|---|---|
| **1. The Ancient Highway (`King's Trench`)** | `highway` / `avenue` (`w = 22 m`) | Runs N–S at `x = +154 m` from **Iziz Gate** (`(154, -510)`, `tal_east_gate`) through the North Caravan Plaza, down the sunken trench past the Citadel's Shelter Customs Postern, up through the South Caravan Plaza, and out **Godsgate** (`(154, +510)`, `tal_east_gate`) toward `Parabola` |
| **2. The Yuni Way** | `avenue` (`w = 18 m`) | Runs east from the East Highway Junction (`(154, 0)`) through the Great Caravanserai Ward to **Yuni Gate** (`(+590, 0)`, `tal_east_gate`) |
| **3. The West Causeway (`Legion Way`)** | `avenue` (`w = 18 m`) | Runs west from the Citadel's West Pit Bridge (`(-125, 0)`) through Parade Square and the Izani Garrison Quarter to **Iron Gate** (`(-580, 0)`), where the mine haul road heads `10 km` SW to the iron/nickel lode |
| **4. The South Bridge Way** | `avenue` (`w = 16 m`) | Runs south from the Citadel's South Pit Bridge (`(0, +125)`) to the Bourse & Bazaar cross-axis (`z = +290 m`) joining the South Caravan Plaza |
| **5. The Glacis Ring (`The Circuit`)** | `avenue` (`ring`, `w = 14 m`) | Polygonal perimeter avenue skirting `12 m` outside the Citadel's 5 garden bastions and Shelter shaft, linking all four bridge/tunnel approaches so heavy `iz_castra` striders and `ab_caravan_truck` convoys bypass residential lanes |

`core/city` steps 8–12 fill each sector between the Glacis Ring and the curtain wall with `main` streets (`10 m`), `side`
streets (`7 m`), and service `alleys` (`4 m`, omitted in the Garrison & Palace blocks so compounds keep rear muster yards).

### 3.3 The six surface quarters, kit culture mix, and census (`~6,200` surface + `1,660` Citadel = `~7,860`)

Because `kits/iziz-vernacular` (`vern_*`), `kits/talia` (`tal_*`), and `kits/pylon` (`pyl_*`) all register on `VERN.def`
with matched plinths, door heights, wealth tiers, and `VPAL.orange` accents (`settlements/iziz/VASSAL-KITS.md`), each
`core/city` district simply declares its **culture weight table** and **`near` civic anchors**:

| # | Quarter | Location | Role & Character | Kit Culture Mix (`VERN.def`) | Named Civic / Trade Anchors (`step 6`) | Target Pop |
|---|---|---|---|---|---|---:|
| **Q1** | **The *Praetorium* & Officer Quarter** | West (`x: -440..-245`, `z: -220..+180`), facing West Pit Bridge | Seat of the *sid'kiñ* (civil governor, distinct from the Citadel's military Legate), Izani patrician officers, Imperial tax & road commissioners | **65% `iziz-vernacular`**, **25% `talia`**, **10% `pylon`** | `pyl_governor_palace` (or `tal_governor_palace` on Parade Square), `vern_hospital`, `tal_bath`, `tal_chapel`, rich `vern_house_rich_*` & `tal_palazzo` | **750** |
| **Q2** | **The Legion Castra & Mech Muster** | North-West (`x: -540..-160`, `z: -480..-220`), inside Iziz Gate | Permanent Legion infantry/cavalry cohorts, convoy escort riders, signal & ordnance stores, walled walker muster pens | **70% `iziz-vernacular`**, **20% `pylon`**, **10% `talia`** | 3 × `vern_barracks`, `pyl_watch`, `vern_watch_house`, `vern_smithy`, walled **Mech Paddock** (landmark pad for `iz_castra`, `iz_centurion`, `iz_turris`) | **1,350** |
| **Q3** | **The Forgemasters' & Rim Works** | South-West (`x: -550..-180`, `z: +180..+470`), inside Iron Gate & along S Glacis | Smelters working the `1012,1061` iron & nickel ore, crawler/walker overhaul bays, saltpeter mills, and salvagers licensed to work the Citadel's Sealed Wing | **60% `pylon`**, **35% `iziz-vernacular`**, **5% `talia`** | `pyl_crawler_depot`, `pyl_smelter`, `pyl_salvagers_guild`, `pyl_assay_office`, `pyl_workshop`, `pyl_tank_farm`, `vern_salvage_yard`; housing in `pyl_vault_house`, `pyl_folk_house`, `pyl_tank_house` | **1,450** |
| **Q4** | **The Great Caravanserai Ward** | East (`x: +200..+560`, `z: -320..+320`), flanking Yuni Way & the Highway Trench | Long-haul convoy yards for Yuni trucks, Talei mule/camel trains, and Xanadu/Longsong factors; customs weighing & bonded transshipment | **65% `talia`**, **20% `iziz-vernacular`**, **15% `pylon`** | 4 × `tal_caravanserai` (crawler bays + pack-animal courts), `tal_customs_house` (at the Highway Trench head), 3 × `tal_warehouse`, `tal_inn`, `vern_tavern` | **1,100** |
| **Q5** | **The Highway Bazaar & Bourse** | South & North-East (`x: -160..+200`, `z: +245..+480` & `-480..-250`), linking South Bridge to Godsgate & Iziz Gate | Arcaded merchant streets, money-changers, wheelwrights, harness & tyre shops, tea/ivan-chai houses, printers | **50% `talia`**, **30% `iziz-vernacular`**, **20% `pylon`** | `tal_bourse` (Caravan Exchange), `tal_agora_stoa`, `tal_shop_arcade`, `pyl_bazaar_lane`, `vern_market`, `vern_shops`, `tal_fountain` (fed by Citadel aqueduct) | **1,150** |
| **Q6** | **Drovers' Margin & Newcomer Tier** | Inner wall skirt (`SE` & `NE` corners inside the curtain) | Teamsters, iron-haulers, nomad scouts in Izani pay, repair crews; `15%` `KCONS` active construction lots | **45% `pylon` (salvage)**, **45% `iziz-vernacular` (poor)**, **10% `talia` (`tal_cube_house`)** | `pyl_pod_stack`, `pyl_ring_house`, `pyl_hex_cells`, `vern_house_poor_*`, `tal_lane_row`, standpipe troughs | **400** |
| — | **Citadel of Eidolon (`buildArckibuz`, `d = 3`)** | Center (`x: 0, z: 0`) | Active `pit`, `community`, `housing-n/-s/-w` organs (`+840` dormant in `housing-e`/`pit-east`) | **Ancients (`arckibuz`)** + **`iziz` / `pylon` interior socket** | Council Bowl War-Room, Bonded Pit Vaults, Shelter Customs Postern, NE Water Tower | **1,660** |
| | **Permanent Urban Total** | | | | *(test band: `7,200 – 8,600`)* | **7,860** |

---

## 4. Garrison walkers, caravan traffic, camps, and hinterland

### 4.1 Mechs (`kits/mechs`) & Motor Vehicles (`kits/motor-vehicles`)

- **Standing & patrolling walkers (`KratorMechs`, culture `'iziz'`):**
  - **2 × `iz_castra`** (`#0 Road Camp` with roof ballista at Godsgate Plaza; `#1 Supply Train` loaded with stores staging
    outside Yuni Gate for the Mantis–Yuni desert-bandit run).
  - **2 × `iz_scorpio`** four-legged torsion-ballista crawlers emplaced on the NW and SE glacis garden bastions overlooking
    the approaches.
  - **1 × `iz_turris`** (13 m walking siege tower, flagship of the Bowl-Rim Cohort) berthed in the Q2 Mech Paddock beside
    **2 × `iz_centurion`** and **1 × `iz_forfex`**.
  - **1 × `iz_fabrica`** (Forge-Warden) + **1 × `iz_hoist`** working the Q3 `pyl_crawler_depot` and Citadel pit hoist.
  - **2 × `iz_speculator` + `iz_catulus`** scout/drone pairs walking an animated perimeter circuit (`core/sched`) outside
    Godsgate and Yuni Gate.
- **Convoy vehicles (`KratorVehicles`):**
  - **4 × `iz_six_wheeler`** (`Lancer` rocket-armed escorts on the Highway Trench and `Courier` at the *Praetorium* gate).
  - **6 × `ab_caravan_truck`** (`Caravan` and `Headman's` variants) queued at `tal_customs_house` and inside the
    `tal_caravanserai` crawler courts, plus **2 × `pa_crawler_hab`** traders in the outer camp and **3 × `anc_hauler` /
    `anc_tram` wrecks** (`state: 'wreck'`) along the Ancient highway shoulders.

### 4.2 Transient Caravan & Auxiliary Camps (`core/camp`)

Outside **Godsgate** (`z = +580 .. +760 m`) and **Yuni Gate** (`x = +650 .. +840 m`), two `KCAMP.pitch` compounds (`ring` /
`horseshoe` formations) hold **~350–500 transient drovers, pack-trains, and auxiliary outriders** waiting for convoy
assembly or quarantine clearance, keeping dusty beast-lines outside the inner glacis.

### 4.3 Hinterland (`20–30 km` open-world cut, `core/hamlet` + `kits/resources` + `CROPS`)

When cut as an open-world site (`openworld/SITES.json`, `id: "skz25tuq0w"`, `reach_km: 25`), `KSITES` / `KHAMLET` (`iziz`
row, `21-hamlet-iziz.js`) places:
1. **Iron-Crag Mine (`10 km` SW, near `px 1012, 1061`):** Grade-3 `iron` + `nickel` mining village (`~320` people) linked
   by an `8%`-grade haul road into **Iron Gate**, feeding Q3's `pyl_smelter`.
2. **Saltpeter Bench (`8 km` ESE):** `saltpeter` + sedimentary `stone` quarry hamlet (`~180` people) supplying the Citadel
   arsenal and curtain-wall masonry.
3. **Four Upland Farmsteads & Ranches (`4–12 km` N & W):** Rain-fed **Frostoat**, **Plain emmer**, **Helix-bean**, and
   pasture holdings (`~850` rural people total; `KHAMLET.farmNeed` sized to Eidolon's `7,860` urban mouths alongside
   the Citadel's `5` irrigated garden bastions).

---

## 5. Scale-model & open-world data updates (prepared for phase `E0`)

| File | Change in `E0` |
|---|---|
| `tools/scale-model/model/src/60-settlements.js` | Update `skz25tuq0w` (`px: 1016, py: 1058`): `name: "Eidolon"`, `type: "arcology"` (or add `SETT_MOVED` / `SETT_RENAMED` note preserving ID `skz25tuq0w`), `polity: "Empire of Iziz"`, `notes`: refurbished Arckibuz garrison & caravan town (`settlements/eidolon/PLAN.md`) |
| `openworld/SITES.json` | Add `skz25tuq0w` (`name: "Eidolon"`, `px: 1016`, `py: 1058`, `reach_km: 25`, `culture: "iziz"`, `kits: ["ehighlands", "sedesert", "iziz-vernacular", "talia", "pylon"]`, `page: "settlements/eidolon"`) |
| `openworld/ANCIENT-NETWORK.md` & `TRADE-GEMINI.md` | Alias display label `Arcbeam` → `Eidolon` on node `skz25tuq0w` (all edge IDs, distances, and trade volumes stay identical because the pin coordinates `1016, 1058` do not move) |
| `kits/ancients/targets/arcbeam` | Unchanged; stays in `kits/ancients` as an unplaced Ancients architectural showcase target |

---

## 6. Phased order of work (`E0` – `E6`)

1. **`E0` — Pin & Harness (`settlements/eidolon/`):**
   - Rename `skz25tuq0w` (`1016, 1058`) to `Eidolon` in the scale-model settlement record.
   - Scaffold `settlements/eidolon/build.py` (`tools/build_sources.py` `report()`) and `verify.py` (`tools/harness.py`),
     reading `core/city`, `kits/ancients/targets/arckibuz` (`buildArckibuz`, `ARCKIBUZ.HULL`, `AKB_INTERIORS`, `AKB_WATER`),
     and the combined `IZV + pylon + talia` bundle in place.
2. **`E1` — Ground Delta & `core/city` Plan (`[G data]` + `test-eidolon-town.js`):**
   - Write `src/20-eid-ground.js` (`eidolonGround`: `+28 m` plateau datum, `ARCKIBUZ.HULL` pit cut, `x = +154 m` sunken
     highway trench & ramps) and `src/40-eid-town.js` (`EID_TOWN.make` on `KCITY.create`, `rand: 'krand'`).
   - Prove in `test-eidolon-town.js` (`tools/ktest.js`, every check with a negative): zero lot overlaps, zero lots inside
     `ARCKIBUZ.HULL` pit/glacis or highway trench, all 4 gates & 4 bridge/tunnel approaches clear, all civic landmarks
     placed (`pyl_governor_palace`, `tal_customs_house`, `tal_bourse`, 4 × `tal_caravanserai`, 3 × `vern_barracks`,
     `pyl_crawler_depot`, `pyl_smelter`), census `7,200–8,600`, deterministic across runs, and SVG sheet dump
     (`floors/eidolon-layout.svg`).
3. **`E2` — 3D Page Assembly (`dist/eidolon.html`):**
   - Place `buildArckibuz(scene, 0, 0, 3, { noTerrain: true, ground: eidolonGround })`, re-dress active Citadel interiors
     with `arckibuzSocket('iziz')` (Iziz orange banners on the Council Bowl & Sky Court), draw `KCITY` streets, walls,
     gates (`tal_wall`, `tal_east_gate`), and instanced `vern_*` / `tal_*` / `pyl_*` buildings, and draw `AKB_WATER` +
     town fountain/trough water.
4. **`E3` — Garrison Walkers, Convoys & Caravan Camps:**
   - Bundle `KratorMechs` (`iziz`) and `KratorVehicles` (`iziz`, `eastabyss`, `post-apoc`, `ancient`); place standing &
     patrolling walkers (`iz_castra`, `iz_turris`, `iz_scorpio`, `iz_speculator`), convoy trucks in the Highway Trench &
     serais, and `KCAMP.pitch` outer caravan camps at Godsgate and Yuni Gate.
5. **`E4` — Interior Cut-Aways & Walkability:**
   - Wire cut-away presets for the Citadel's **Council Bowl War-Room**, **Highway Customs Shelter**, **Cohort Housing
     Wing**, plus the surface **`pyl_governor_palace`**, **`tal_customs_house`**, and **`tal_caravanserai`** (`core/door`
     + `core/walk`).
6. **`E5` — Open-World Region & Hinterland (`openworld/`):**
   - Cut `skz25tuq0w` (`reach_km: 25`) via `cut_site.py`, stamp `skz25tuq0w.ground.json` on `WORLD.landHook`, and bake
     the SW Iron/Nickel Mine, Saltpeter Bench, and 4 Frostoat/Emmer farmsteads.
7. **`E6` — Verification, Docs & Baseline:**
   - `INDEX.md`, `PORT.md` (`audit_port.py`), `KNOWN_ISSUES.md`, `verify.py --assert` (`ERROR PANEL: clean`, budgets,
     `KRUINS`, `KTAGS`, interiors audit), `check_core_use.py`, and `port_baseline.py`.

---

## 7. Required `verify.py --assert` views (for `E2`–`E6`)

| Preset | What must read clearly |
|---|---|
| `Eidolon overview` | Refurbished Arckibuz rising from its sunken pit & green glacis bastions inside the walled three-kit garrison & caravan town |
| `Godsgate and Highway Trench` | `tal_east_gate`, outer `KCAMP` caravan pitch, `ab_caravan_truck` convoy descending the `x = +154 m` trench past the Shelter Customs Postern under `iz_castra` watch |
| `Caravanserai Ward — eye level` | Vaulted `tal_caravanserai` & `tal_customs_house` beside `vern_tavern` and `iz_six_wheeler` escorts |
| `Praetorium and West Bridge` | `pyl_governor_palace` on Parade Square, Izani officer houses, and the West Causeway crossing the pit into the Citadel |
| `Forgemasters and Mech Paddock` | `pyl_crawler_depot`, `pyl_smelter`, `iz_turris`, `iz_fabrica`, and salvage housing along the SW rim |
| `Eidolon at night` | Warm amber Citadel casemates, lit `tal_*` / `vern_*` civic avenues, dark sealed eastern Citadel wing, and campfire glow outside the gates |
| `Cutaway — Council Bowl War-Room` | Citadel `community` level (`+38.4 m`) re-dressed in `iziz` livery with operable doors and pinwheel command bastions |
| `Cutaway — Bonded Pit and Customs` | Subterranean `pit` vaults, cargo hoists, and the tunnel under the highway to the Customs Shelter |
