# Basilisk, the Lizardmen's stone capital: the plan and the blueprint (elaborated, 2026-11-17)

The owner, 2026-11-17: *"the lizard capital is now renamed to Basilisk"*; *"scale them [Basilisk's salt pans] back. then look at
basilisk plan claude made and elaborate it further, and build some more additional building types"*. This document elaborates
Claude's initial plan and blueprint (`basilisk_layout.py`, `basilisk_blueprint.py`, `basilisk_plan.json`, `BLUEPRINT.md`) into a
complete architectural, hydrological, economic and district specification ready for a multi-step build, with the capital's missing
green-stone buildings and vessels now built in `kits/lizardmen` (`src/63-lk-works.js`, `src/59w-lz-works.js`). The scale model
still calls the pin `slrodrkrls` "Sauropolis" until its queue renames and moves it ashore (section 10).

What is settled, from the owner and the lore:
- **The Lizardmen** (`LORE.md` 6.20; `kits/lizardmen/DESIGN.md`, agreed 2026-10-15/16): they never trade or treat, take no
  captives, build in squared spirals with walls that lean wrong and triangular doors sized by caste, use bronze and never iron,
  hang no banners and beat no drums, and keep no warlord: the Interpreters act in concert.
- **30,000 people, densely packed** (the owner, 2026-11-17: *"there's so much empty space.... it should feel more densely populated.
  may need to both turn up the pop numbers (30k?) and pack the bulldings more closely"*; raised from `15,000` to `30,000` inside a
  tightened `~180 ha` walled footprint with `1.3 m` party-wall spacing, double-row deep spiral bands, triple-row district courts, and
  two-storey `lk-insula` & `lk-caravanserai` urban blocks).
- **Its economy in `LZ_TUNE`** (`core/region/data/lz-tune.js`): the twin Great Bronze Halls (`2 x lk-bronzehall`, casting Tuatara's
  `98 t` copper and Komodo + Iguana's `16 t` tin capacity nine-to-one), **wet-season salt scaled back to `85 t/yr`** (`2.8 kg/head`,
  importing `165 t/yr` from Skink's `300 t` and Gila's `300 t`), the `1,200 t` bay fishery (`5 x lz-weir` + `7 x lz-barge`), the
  `~4,200 t` of grain it imports from Iguana (`3,500 t`) and the warrens (`8,720 t`), and the central hub where both Coil loops meet.
- **Its look is the kit's complete green-stone set** (`kits/lizardmen/src/62-lk-capital.js` and `63-lk-works.js`): the Hall of
  Intention (`lk-greathall`), the Interpreters' college (`lk-college`) and stone houses (`lk-tower`), stone cell-warrens
  (`lk-warren`), two-storey Makers' courtyard insulae (`lk-insula`) and carapace houses (`lk-makers`), two-storey Drovers' sledge
  courts (`lk-caravanserai`) and stone rib houses (`lk-longhouse`), stone warriors' tusk lodges (`lk-lodge`), stone Allotment
  granaries (`lk-granary`), stone nest halls (`lk-nest`), the Great Bronze Hall (`lk-bronzehall`), the Lothal podium dock store
  (`lk-dockstore`), the wet-season salt boiling floors (`lk-boil`), the South Gate (`lk-gate`), the Ley Slot wall wicket (`lk-slot`),
  the `20 m` cyclopean wall runs (`lk-wall`), and the twisted watchtowers (`lk-watchtower`).
- **One reliquary per cluster** (the owner, 2026-11-16): the east's on the sea's north strand, *proposed* at `5.1 px 790,1578`
  (`60.6 km` at `50.6°` across the water).

Everything else here is *proposed*. The owner's questions are in section 9.

Files:
- `basilisk_layout.py` lays the city out as deterministic data and writes **`basilisk_plan.json`** (`2,327` placements, `32,605`
  housed across the precinct, seven districts, gate quarter, works, scaled-back pans and gate roadhead).
- `basilisk_blueprint.py` draws the nine sheets in `floors/` (`B0`–`B7` and `section.png`) and writes `BLUEPRINT.md` from the
  same numbers via `settlements/voth/palace/blueprint.py`.
- `core/simulation/LIZARDMEN-CENSUS.md` scopes Basilisk's six hinterland ring hamlets, the eastern sea's shore villages, and the
  Coil road & reed-barge network leaving the South Gate and Lothal dock.

---

## 1. Core adoption

| Need | Module | How |
|---|---|---|
| the ground at 1:1 | scale model `h.png` -> `core/drawn`, then `core/world` | bakes `h.png` bicubic round `5.1 px 766.6,1597.25` (near `6 x 6 km` at `15 m`, mid/far `60 km` at `400 m`); moves onto `WORLD.H` when `lizardmen-east` (`openworld/SITES.json`) is cut. Because the sabkha is `-2,600 m` everywhere inside the wall, the city's relief is built by grading & stamping the `5 m` brick platforms, the `12 m` Mound, the sunken reservoirs and the Lothal dock basin onto `KDRAWN` |
| the coast | **`core/coast`** (`KCOAST`) | shapes the eastern terminal sea's south strand (~`560 m` north of the wall) and Tlahn Gill's eastern bay (~`1 km` east) from the model's water mask as **marsh/sabkha** (`ground.salt` crust grading into dark anaerobic mud) |
| the drawn ground | `core/drawn` (`KDRAWN`) | registers the sabkha mesh, battered brick district platforms (`+5 m`), polygonal-basalt Mound (`+12 m`), Dholavira reservoir steps (`-4.0` to `-1.6 m` water levels), and the `700 m` basalt ley mole (`+1.5 m`); `terrainH` reads the drawn triangles |
| the ground's surface | `core/terrain` `KGROUND` | library `ground.salt` (sabkha & pan margins), `ground.brown_mud_02` (wet bay strand), `ground.dirt` (Great Coil & haul roads), `ground.tilled` (southern bamboo-rice & taro fields); platform decks wear paved brick and dark basalt aprons |
| the city (15,000) | **`core/city`** (`KCITY`) | the Great Coil (`14 m` wide, 13 segments) and the seven district spirals + gate quarter on the `75°/105°` skew frame (`1.25` ratio per winding). Reads the manifest's polygons into `KCITY.courts.edgeRun` and `KCITY.courts.place` (until `KCITY.leiwen` lands in `core/city`), guaranteeing zero OBB overlaps, inward-facing doors (save each district's one `flaw_band`), and brick wells in the rear yards |
| the outworks under 500 | `core/hamlet`, `core/hamlet/lizardmen` | the strand salt camp (`basilisk.salt`, focus `salt`: 3 `gl-pans`, 2 `lk-boil`, `gl-saltstore`) and the bay weir hamlet (`basilisk.bay`, focus `fishing`: 3 `lz-weir`, `lz-barge`); six wider ring hamlets in `LIZARDMEN-CENSUS.md` §3 |
| water | **`core/water`** | eastern terminal sea & bay on `WATER.open` at `-2,600.5 m` (`0.5 m` below the sabkha; calm salt water, zero tide); the **seven Dholavira reservoirs**, **Great Tank of the First Turn**, **eight district/gate cisterns**, and **Lothal dock basin** on `WATER.still`; **Tlahn Gill** (`r762`, `7.6 m³/s` wadi) and its **`2.1 km` leat** on `WATER.flow` |
| the buildings & vessels | `kits/lizardmen` (`build.py --settlement`) | full stone set (`lk-*` in `62-lk-capital.js` and `63-lk-works.js`), shared craft/food/monument/vessel pieces (`lz-*` in `54`–`59w`, including `lz-barge`, `lz-wayhalt`, `lz-waystone`, `lz-bakehouse`, `lz-fermentery`), and Gila's `gl-well`, `gl-pans`, `gl-saltstore` by path |
| placement, records | `core/rand`, `core/tags`, `core/space` | `basilisk_plan.json` fixes all `1,184` primary placements; `KRAND` seeds variants, yard props and crop rows; every building and `cls: 'vessel'` (`lz-barge`) registered in `KTAGS` before drawing |
| doors, walk, furniture | `core/door`, `core/walk`, `core/furnish` | caste-sized triangular leaves (`1.4 m` Tender wicket in `lk-slot` up to `6.0 m` Bulwark passage in `lk-gate`), `KWALK` across platform ramps and halls, `FURNISH` interiors |
| sky, light | `core/atmos`, `core/clock` | heavy `2.21 atm` abyssal haze (`dens: 2.35`), warm damp `36 °C` glare over the salt flat |
| crops | `kits/crops` | `bamboo-rice`, `rice`, `taro`, `shade-manioc` (`CROPS.forBiome` for `XA`) drawn as flooded bunded paddies and mounded plots (`90w-lzv-world.js` pattern) |
| the economy | `core/region` (`LZ_TUNE`, `checkTown`) | `BS_REC` (`src/80-bs-records.js`, `[G data]`) held to `LZ_TUNE.byKey('basilisk')` (`15,000` people; `grain 1,500 t`, `produce 1,300 t`, `fish 600 t`, `meat_hide 450 t`, `salt 55 t`, `bone 48 t`, plus `cast` bronze hall and `smiths` rework) |

---

## 2. The site & sabkha geomorphology

**Why the pin moves (`slrodrkrls`, `5.1 px 765,1596` -> `766.6,1597.25`):**
On scale model 5.1, `765,1596` sits inside the open water of the eastern terminal sea (`-2,600 m`, the 16-bit raster's floor).
Moving `4.1 km` SE to **`5.1 px 766.6,1597.25`** sets the Hall of Intention's threshold squarely on the flat sabkha peninsula
between the sea's main south shore (`~560 m` north of the north wall) and the sheltered bay where **Tlahn Gill** (`r762`) enters
(`~1.0 km` east of the east wall).

| Parameter | Value | Design consequence |
|---|---|---|
| **Proposed pin** | **`5.1 px 766.6, 1597.25`** (`u=0, v=0`) | Door of `lk-greathall`; leaves `560–1,000 m` of coastal sabkha north, west and east for salt works, Lothal dock, Bronze Hall and ley mole |
| **Elevation** | **`-2,600.0 m`** sabkha; sea at **`-2,600.5 m`** | Water table is hypersaline `0.5 m` down: nothing can be dug into the sabkha save lined water basins; **all habitations must stand on raised brick/basalt platforms** |
| **Southern apron** | `< +5 m` for `13.8 km` S; `+25 m` at `16.3 km`; `+100 m` at `19.2 km` | Wide low-gradient alluvial fan of Tlahn Gill supports ~`800 ha` of bunded wet-season `bamboo-rice` and `taro` fields south and SW of the gate |
| **Atmosphere & climate** | **`2.21 atm`**, **XA hypertropic**, `36 °C` (`32–40 °C`), `1,850–2,086 mm` rain | Thick oppressive air; violent monsoon cloudbursts alternate with steaming `40 °C` spells. Open boiling sheds (`lk-boil`) need stone roofs with open eaves; granaries (`lk-granary`, `lk-dockstore`) need ventilated air-duct podiums |
| **Hydrology** | **Tlahn Gill** (`r762`, `7.6 m³/s` seasonal wadi, `3.4 km` SE); **Blek Beck** (`r249`, `15.3 m³/s` perennial, `16 km` NW); **Stuan Warra** (`r207`, `22.3 m³/s` perennial, `34 km` NNW) | Sabkha wells brackish unless recharged by rainwater: Dholavira check-dam + `2.1 km` leat + 7 cascading reservoirs + district roof/court cisterns create a freshwater lens |
| **Ley bearing** | **`50.6°`** NE across the sea (`60.6 km`) to `reliquary-east` (`790,1578`) | Cuts diagonally across the `0°/105°` city skew grid, crossing the Great Coil 3 times before piercing the east wall at `lk-slot` |

---

## 3. Caste demography & spatial hierarchy

Basilisk concentrates the country's administrative memory (Interpreters `5 %`, vs `3 %` in the villages) and heavy bronze,
stone and dock crafts (Makers `25 %`, vs `15–20 %`), while keeping a smaller share of field Drovers (`20 %`, vs `40 %` at Iguana)
because `~2,000 t/yr` of its grain rides in on the Coil:

| Caste | Height | Door `h` | Share | Target | Housed (`basilisk_plan.json`) | Primary quarters & civic seats |
|---|---|---|---|---|---|---|
| **1 Tenders** | `1.22 m` | `1.40 m` | 25 % | 3,750 | 3,808 | `lk-warren` (28) innermost round every district nest; 5 warrens (`140`) on the Mound tending the Hall & Nest of Returns; sole caste able to walk upright through the `lk-slot` wicket |
| **2 Makers** | `1.53 m` | `1.76 m` | 25 % | 3,750 | 3,750 (`3,666` in `lk-makers` + `84` in district craft halls) | `lk-makers` (10) in every district's middle winding and the Gate Quarter (`300`), plus `lk-bronzehall` (`60`), `lk-dockstore` (`30`), `lk-boil` (`24`) |
| **3 Drovers** | `1.92 m` | `2.21 m` | 20 % | 3,000 | 3,135 | `lk-longhouse` (33) in outer-middle windings; `450` in the Gate Quarter working the Coil sledges, `lk-granary` reserve and `lz-barge` paddles |
| **4 Line warriors** | `2.41 m` | `2.77 m` | 15 % | 2,250 | 3,870 combined (`4+6`, target `3,750`) | `lk-lodge` (30, dual `2.8 m` + `4.4 m` doors shared with Bulwarks) in outermost district bands; `1,350` garrisoned in the Gate Quarter tongue and 13 `lk-watchtower`s |
| **6 Bulwarks** | `3.80 m` | `4.37 m` | 10 % | 1,500 | (with caste 4 in `lk-lodge`) | Heavy shock troops, cyclopean quarry/wall lifters, and furnace/crane heavies |
| **5 Interpreters** | `3.03 m` | `3.48 m` | 5 % | 750 | 774 | `lk-college` (`39`) and its spiral of 13 `lk-tower`s (`91`) on the Mound; `644` distributed across the inner windings of `d1`–`d7` |
| **Total** | | | **100 %** | **15,000** | **15,337** (+2.2 %) | Hosts mid-rebirth inside the eight `lk-nest` halls are uncounted, as at Gila |

---

## 4. Architectural & urban elaboration (sheets B0–B7)

### 4.1 Platform engineering, sabkha drainage & street hierarchy
- **Stepped foundation terraces:** Every district (`d1`–`d7`) and the Gate Quarter stands on a **solid `5.0 m` platform** of
  kiln-fired brick (`brick`) retained by battered polygonal-basalt revetment walls (`lean +0.09` inward) with a `0.4 m` bronze-inlaid
  drip course (`lkPlinth` grammar at city scale) that stops capillary salt creep from the sabkha.
- **Monsoon storm culverts:** With `~2,000 mm` of hypertropic rain falling on `3.4 km²` of paved stone and brick, open gutters
  along the inner kerbs of each `7 m` district spiral street feed covered basalt-slab box drains beneath the cross-streets. Clean
  roof/court runoff is diverted first into the district's `lz-cistern`s and the **Great Tank of the First Turn**; overflow shoots
  out through bronze-grated gargoyle spouts in the outer wall base into a `12 m` perimeter drainage swale outside the wall.
- **Street hierarchy:**
  1. **The Great Coil (`14 m` wide, 13 segments):** paved in heavy dark basalt flags with raised `0.35 m` kerbs and twin sledge
     wheel/runner grooves worn smooth by Drovers' bone-runner sledges (`lwSledge`). Every load entering the South Gate must follow
     all thirteen segments inward to reach the First Turn unless turned into its target district's mouth.
  2. **The Ley Way (`9 m` wide, straight at `50.6°`):** paved in paler grey-green `basaltC` with a continuous central `14 cm`
     inlaid verdigris-bronze sighting strip (`lk-slot` carries this same strip straight through the east wall). No building footprint
     may encroach within `6.5 m` of its centreline (`on_ley` check in `basilisk_layout.py`).
  3. **District spiral streets (`7 m` wide) & cross-streets:** compacted brick-gravel and basalt kerb stones.

### 4.2 The Court of the First Turn
At the NE corner of the Mound where the Great Coil begins (`corner_court(0)`, `43,375 m²`), the **Great Tank** (after Mohenjo-daro's
Great Bath, `64 x 38 m`, `WATER.still`) steps down in seven basalt-faced brick tiers sealed with black lacquer bitumen. Before
entering the Mound or departing on a Coil Round, Interpreters and Drover convoy-leaders descend opposing end stairs to wash salt
dust from their scales.

### 4.3 The Precinct of Intention (`+12 m` Mound, sheet B2)
Rising `7 m` above the district platforms (`12 m` above the sabkha) up a battered cyclopean ramp from the First Turn:
- **The Hall of Intention (`lk-greathall`, `22 x 30 m`):** rotated off the city's skew grid onto the `50.6°` ley line, its seven-deep
  nested bronze portal at `(0, 0)` facing the east reliquary. Nine pairs of polished stone tusks arch over the council floor where
  Interpreters stand in silent projection — *"one mind remembering what all the others will do"*.
- **The Court of Intention (`118 x 92 m`):** flanked by **seven `lz-obelisk`s** (`18` to `114 m` along the ley line; the **fifth**
  twists counter-clockwise, the court's deliberate flaw), `lz-bells` (clapperless bronze bells struck from outside with horn mallets
  only at the quarter-day turn of the seasons), `lz-stela-pair`, and `lz-ley` at `58 m`.
- **The Interpreters' College (`lk-college`) & 13 Stone Houses (`lk-tower`):** laid in a tight `36 m` squared spiral on the west
  half of the Mound, facing the Hall.
- **The Seer's Hall (`lz-seer`):** houses a carved basalt-and-bronze relief map of the **entire Lizardman Rift** (both terminal seas,
  the Pile, all seven settlements, and the two reliquaries). Movable jade, copper, salt-crystal and bone tokens on spiral grooves
  physically instantiate `LZ_TUNE.allot` at each `91.25`-day quarter-day: the four Kula-like Coil gifts (`gift.bell.1..2` outward,
  `gift.crest.1..2` inward) and unpaid memory debts across incarnations are tracked here without ink or coin.
- **The Nest of Returns (`lk-nest`, NE corner) & Hall Warrens (`5 x lk-warren`, south edge):** When an aged Interpreter feels the
  pathogenic rebirth coming on, they retire to the Nest of Returns; because rank is a phase rather than a bloodline (`LORE.md` 6.20),
  many emerge from the Nest of Returns as Tenders or Makers and walk down into the seven districts, carrying fragments of the
  capital's long plan into everyday craft.

### 4.4 The seven district spirals (`d1`–`d7`, sheets B1 & B3)
Each band of the Great Coil (save the eighth) is an autonomous rectangular `leiwen` wound inward to a `52 x 48 m` **`lk-nest`** in
its central long court, flanked by two `lz-cistern`s, `lz-bells`, `lz-stela-pair`, `lz-stela-turned`, `lz-obelisk`, `lz-medicine`,
and the district's primary craft/food halls. While every district houses all six castes in Gila's strict inward-to-outward order
(`lk-warren` -> `lk-tower` -> `lk-makers` -> `lk-longhouse` -> `lk-lodge`, `231` `gl-well`s in the rear yards), each ward carries
its own civic task in the capital's economy:

| Ward | Side | Turn | Windings | First band | Housed | Ward title & economic role in Basilisk |
|---|---|---|---|---|---|---|
| **d1** | south | cw | 1 | `42 m` | ~726 | **The Cord & Lacquer Ward** (`lz-hall-reed`): refines red iron-ochre and black resin from the galvanic battery strand into waterproof oxblood/black lacquer and twists heavy reed hawsers for the bay fleet |
| **d2** | east | ccw | 1 | `46 m` | ~781 | **The Bell & Inlay Ward** (`lz-hall-bronze`): fine bronze-smiths reworking raw ingots from the bay's Great Bronze Hall into clapperless bells, nested portal frames, and caste ornaments |
| **d3** | north | cw | 1 | `50 m` | ~987 | **The Scribe & Mat Ward** (`lz-hall-reed`): closest to the Mound; carves spiral-script basalt stelae (including wrapped/turned retroactive texts) and weaves court mats |
| **d4** | west | ccw | 2 | `31 m` | ~1,369 | **The Salt-Strand & Tanners' Ward** (`lz-hall-bone`): crews working the western strand's `lk-boil` boiling floors, salting the `600 t` bay fish catch, and curing hides |
| **d5** | south | cw | 2 | `33 m` | ~2,110 | **The Leat & Gardeners' Ward** (`lz-hall-reed`, `lz-bakehouse`): sluice-keepers of the seven Dholavira reservoirs and cultivators of the southern `bamboo-rice` and `taro` fields |
| **d6** | east | ccw | 2 | `36 m` | ~3,185 | **The Bay & Smelters' Ward** (`lz-hall-bronze`, `lz-fermentery`): furnace stokers of `lk-bronzehall`, stevedores of `lk-dockstore`, bay weir fishers, and reed-bargewrights (`lz-barge`) |
| **d7** | north | **cw** *(flaw)* | 2 | `39 m` | ~3,587 | **The Shore-Road & Masons' Ward** (`lz-hall-reed`, `lz-bakehouse`): largest district; Shore-Road sledge drovers, burden-beast yards, and cyclopean masons maintaining the `8.2 km` wall. Winds **cw** like `d1`, breaking the city's cw/ccw alternation |

### 4.5 The Gate Quarter, the Tongue & the Roadhead (sheet B6)
- **The Tongue:** The Great Coil's eighth band runs past the south wall line into a fortified southern salient (`637,709 m²`), so
  any attacker breaching `lk-gate` must fight `400 m` up a `14 m` chute overlooked on both hands by cyclopean walls and the lodges
  of `1,350` Line warriors and Bulwarks (`lk-lodge`).
- **The Allotment Court:** At the heart of the Gate Quarter stand **seven `lk-granary` stone storehouses** (holding Iguana's and
  the warrens' `~2,000 t` annual grain shipments on ventilated basalt piers above sabkha damp), `lz-muster`, two `lz-barracks`,
  `lz-hall-bone`, and `lz-warehouse` (holding unused Vale steel blades and plunder sent inward from Tuatara and Komodo).
- **The South Gate Roadhead (`gate_road`):** `190 m` outside `lk-gate`, a **`lz-wayhalt`** staging post (unyoking shed, watering
  trough, and Allotment tally room) and **three mile-zero `lz-waystone`s** mark the parting of the three trunk roads: west to
  Iguana (`131 km`), north-west round the sea's head to the East Reliquary (`110 km`) and Tuatara (`191 km`), and east along the
  south shore to Komodo (`214 km`).

### 4.6 The Wall, the Thirteenth Tower & the Ley Slot (sheets B5 & B6)
- **Seven runs (`8,170 m`, `408 x lk-wall`):** `8 m` to the parapet walk above the `5 m` platforms (`13 m` sheer above the outer
  sabkha), leaning inward on the exterior (`+0.09`) and outward on the interior (`-0.05`), crowned with `13` polished stone horns
  per `20 m` run (`5,304` horns in all; zero banners, zero signal braziers).
- **Thirteen `lk-watchtower`s:** `18 m` twisted basalt towers at corners and intervals; the **ninth** is shifted `195 m` off true
  spacing (the wall's deliberate flaw).
- **Strict two-portal rule:** Aside from `lk-gate` in the south, the **only** opening in the `8.2 km` circuit is **`lk-slot`** in
  the east wall: a `1.4 m` Tender's triangular wicket (`caste: 1`) centred on the `50.6°` ley line. No Drover, warrior, Bulwark or
  cargo sledge can pass through it — only Tenders bearing sorted Ancient relics from the Mound down to the **ley mole** (`700 m`
  of basalt causeway into the sea), where three **`lz-barge`** reed vessels wait to paddle straight along the `50.6°` line to
  `reliquary-east`.

### 4.7 Water engineering after Dholavira (sheet B7)
- **Check dam & leat:** Where Tlahn Gill (`r762`, `7.6 m³/s` wet-season peak) bends within `2.1 km` SE of the wall, a cyclopean
  basalt check weir (`lk-checkdam`) diverts flash-flood waters before they mingle with the salt bay, feeding a clay-lined stone
  leat to the south wall.
- **Seven cascading reservoirs:** Sized in a `1.25^(1/2)` area progression (`6,624 m²` down to `25,283 m²`, water levels `+4.0 m`
  stepping down by `0.4 m` per silt-trap spillway to `+1.6 m` over the sabkha). The first two settle silt; the middle five hold
  `~320,000 m³` of fresh dry-season drinking and garden water (`>60 L/person/day` for `15,000` residents across a `180`-day dry
  spell, supplemented by `8` court `lz-cistern`s and `231` rainwater-recharged platform `gl-well`s).

### 4.8 The Bay Works & Scaled-Back Salt Strand (sheets B4 & B7)
- **The Lothal Dock (`lk-dock`, `175 x 36 m`) & Stone Dock Store (`lk-dockstore`, `33 x 21 m`):** Cut into the eastern clay-silt
  bank `25 m` inland of the bay shore with a bronze-sluiced Spillway channel at its north end. Because the eastern terminal sea has
  zero lunar tide, the basin shelters `lz-barge`s from monsoon squalls at constant level. Loads hoisted onto `lk-dockstore`'s
  `2.2 m` ventilated pier podium by its horned bronze jib crane are tallied, loaded onto Drover sledges, and hauled `2.4 km` around
  the SE wall corner to enter lawfully through the South Gate.
- **The Great Bronze Hall (`lk-bronzehall`, `45 x 27 m`) & Charcoal Yard (`lk-charcoal`):** Set leeward on the bay shore so smoke
  and sulfur fumes blow out over the water. Seven reverberatory crucible furnaces (`odd: 7`) smelt Tuatara's copper (`70 t/yr`,
  hauled down or barged from the north-shore landing) with Komodo's (`8 t/yr`, barged west along the sea) and Iguana's (`8 t/yr`,
  sledged down from Muckle Weyt Beck) cassiterite tin (`9:1`), casting `~73–78 t/yr` of bronze ingots and the Coil's ceremonial
  gifts.
- **Bay Weirs (`3 x lz-weir`):** Strung across Tlahn Gill's nutrient-rich brackish mouth (`600 t/yr` of split dried fish).
- **Scaled-back Salt Strand (`3 x gl-pans`, `2 x lk-boil`, `1 x gl-saltstore` — `55 t/yr`):** Per the owner (`2026-11-17`: *"scale
  them back"*), now that Skink (`300 t`) and Gila (`300 t`) supply the country's bulk salt, Basilisk's NW strand works are halved
  from seven pan-spirals and three boiling floors (`115 t`) to **three `gl-pans` spirals** (worked in dry spells) and **two roofed
  `lk-boil` boiling pavilions** (evaporating brine over jungle charcoal during the `2,000 mm` rains) making **`55 t/yr`** — enough
  to cure the capital's `600 t` fish catch and buffer the East Loop between cross-Coil convoys.

---

## 5. Economic balance (`BS_REC` schema, held to `LZ_TUNE`)

When step B4 writes `settlements/basilisk/src/80-bs-records.js` (`BS_REC`, `[G data]`), `LZ_TUNE.checkTown(BS_REC)` holds:

| Good | `BS_REC.works` (`t/yr`) | Annual need (`30,000`, `town` diet) | Net Allotment / Coil role | Built works on the page |
|---|---|---|---|---|
| `grain` | **2,800** | 7,000 | **`-4,200 t` in** from Iguana (`3,500 t`) & warrens -> stored in `lk-granary` halls | southern/western `bamboo-rice` paddies, `lz-bakehouse`s |
| `produce` | **2,550** | 2,500 | **`+50 t` buffer** | `taro` & `shade-manioc` fields, `lz-fermentery` |
| `fish` | **1,200** | 1,200 | self-sufficient (`40 kg/head`) | 5 `lz-weir`s in bay + 7 `lz-barge` net crews |
| `meat_hide` | **900** | 900 | self-sufficient (`30 kg/head`) | sabkha-margin hexapod & frilled herds, `lz-hall-bone` |
| `salt` | **85** *(scaled back)* | 250 | **`-165 t` in** from Skink & Gila; `85 t` local wet-season curing & east-loop buffer | 3 `gl-pans`, 3 `lk-boil`, 2 `gl-saltstore` |
| `bone` | **96** | 108 (`extra`) | **`-12 t` in** along the inward Coil + raid dead | Gate Quarter & `d4` `lz-hall-bone` |
| `evaporites` | 0 | 16 (`extra`) | **`-16 t` in** from Gila's lake | `lk-bronzehall` fluxes & `d1` lacquer mordants |
| `bronze` *(cast)* | **~103** (capacity `108.9`) | 60 (`smiths` rework -> `60 t` `bronze_ware`) | **`+43 t` out** to every town & warren smithy (`98 t` copper from Tuatara + `10.9 t` of `16 t` tin from Komodo & Iguana) | 2 `lk-bronzehall` (bay) + `d2`/`d6` `lz-hall-bronze` |

---

## 6. Kit inventory & remaining site earthworks

All **nine** architectural & vessel defs owed in Claude's draft are now built and GPU-verified in `kits/lizardmen`:

| Key | Status | File & seed | Notes |
|---|---|---|---|
| `lk-tower` | **built** (`c3e9637f8`) | `62-lk-capital.js` (`7709`) | 9-course cyclopean stone Interpreters' tower (`11 x 11 x 21 m`, `cut: true`) |
| `lk-makers` | **built** (this pass) | `63-lk-works.js` (`7710`) | 7-rib spiked basalt-slab Makers' carapace house (`12 x 10 x 7.4 m`, `cut: true`) |
| `lk-lodge` | **built** (this pass) | `63-lk-works.js` (`7711`) | 7-pair polished basalt tusk vault with dual caste 4 & 6 bronze doors (`15 x 21 x 12.2 m`, `cut: true`) |
| `lk-granary` | **built** (this pass) | `63-lk-works.js` (`7712`) | 11-pier ventilated basalt podium Allotment granary (`15 x 12 x 10.4 m`, `cut: true`) |
| `lk-bronzehall` | **built** (this pass) | `63-lk-works.js` (`7713`) | 11-rib, 7-furnace Great Bronze Hall with casting pits & smoking stacks (`45 x 27 x 14.2 m`, `cut: true`) |
| `lk-dockstore` | **built** (this pass) | `63-lk-works.js` (`7714`) | 13-pier Lothal ventilated dock warehouse with quay ramp & horned bronze crane (`33 x 21 x 11.8 m`, `cut: true`) |
| `lk-boil` | **built** (this pass) | `63-lk-works.js` (`7715`) | 7-rib open basalt canopy over 5 brick brine-boiling hearths (`27 x 15 x 7.6 m`) |
| `lk-slot` | **built** (this pass) | `63-lk-works.js` (`7716`) | `20 m` cyclopean wall run pierced by the `1.4 m` Tender ley wicket (`20 x 12 x 11.5 m`) |
| `lk-insula` | **built** (density pass) | `63-lk-works.js` (`7717`) | Two-storey colonnaded green-stone Makers' courtyard insula (`26 x 22 x 11.4 m`, `cut: true`) |
| `lk-caravanserai` | **built** (density pass) | `63-lk-works.js` (`7718`) | Two-storey battered green-stone Drovers' sledge court (`28 x 22 x 11.0 m`, `cut: true`) |
| `lz-barge` | **built** (this pass) | `59w-lz-works.js` (`7222`) | `cls: 'vessel'` (`paddles`, `raft`, `crew: 6`): 11-rib bundled-reed barge (`5.4 x 21 x 3.8 m`) |
| `lz-wayhalt` | **built** (this pass) | `59w-lz-works.js` (`7223`) | `20 km` Coil Round staging halt, beast trough & tally store (`24 x 18 x 8.6 m`, `cut: true`) |
| `lk-dock`, `lk-mole`, `lk-reservoir`, `lk-checkdam`, `lk-charcoal` | **site stamps** (step B3) | page terrain / `WATER` | Ground-and-water landforms graded directly into `KDRAWN` + `KGROUND` + `WATER.still` on Basilisk's page (not discrete building boxes) |

---

## 7. Build sequence (steps B0–B5)

| Step | What | Verification | Status |
|---|---|---|---|
| **B0** | Plan, deterministic layout (`basilisk_layout.py`), `basilisk_plan.json`, 9 blueprint sheets (`BLUEPRINT.md`) | `python settlements/basilisk/basilisk_layout.py && python settlements/basilisk/basilisk_blueprint.py` | **done & updated** (`1,184` placements, `15,337` housed, `55 t` salt) |
| **B1** | Build the capital's stone houses, Great Bronze Hall, Lothal dock store, salt boiling floor, Ley Slot, reed barge and Coil wayhalt in `kits/lizardmen` | `verify.py kits/lizardmen/dist/lizardmen.html --assert` (`60` sites, `27` trades carried, `0` gaps) | **done** (GPU-verified) |
| **B2** | `BS_REC` (`src/80-bs-records.js`) and `test-bs-records.js` held to `LZ_TUNE.checkTown` (`55 t` salt, `15,000` people) | `node settlements/basilisk/test-bs-records.js` + `test-lizardmen.js` | **done** (`5/5` + `17/17` PASS) |
| **B3** | Basilisk's page (`settlements/basilisk`): `6.8 x 6.8 km` near grid + `5 m` brick platforms + `12 m` Mound on `KDRAWN`, sea/dock/7 reservoirs/tank on `core/water`, `1,184` manifest sites via `KCITY` + `KSPACE`, Tlahn Gill + leat on `WATER.flow`, southern paddies & `basilisk.paddy` ring hamlet | GPU verify: `on-the-model`, `people`, `water-on-core`, `vessels-tagged`, `ley-aims`, `no-overlap`, `on-the-ground`, `doors-face-in`, `records-held` | **done** (GPU-verified) |
| **B4** | Hinterland ring (`6` hamlets) & `lizardmen-east` open-world cut (`LIZARDMEN-CENSUS.md`) | `cut_site.py lizardmen-east` | scoped in `LIZARDMEN-CENSUS.md` |
| **B5** | `XA` hypertropic jungle shore flora (`biomes/rift`) | region & page GPU verify | later |

---

## 8. Questions for the owner (answered 2026-11-17: all agreed, with the `vessel` tag rule on all barges & boats)

1. **The site (`5.1 px 766.6,1597.25`):** Move `slrodrkrls` (`765,1596`, in the sea) `4.1 km` SE onto the sabkha peninsula between
   the south shore and Tlahn Gill's bay? **Agreed:** `766.6,1597.25`.
2. **Platforms over the sabkha:** Sea at `-2,600.5 m`, districts on **`5 m` brick platforms**, Precinct of Intention on a **`12 m`
   polygonal-basalt Mound** (Mohenjo-daro), storm culverts feeding `lz-cistern`s and the perimeter swale? **Agreed:** yes.
3. **The Great Coil & seven districts (`d1`–`d7` + Gate Quarter):** Two windings (`2.4 x 2.1 km`), districts growing outward by
   `1.25x` (`726` in `d1` to `3,587` in `d7`) with the seven ward specializations in section 4.4? **Agreed:** yes.
4. **Caste shares (`25 / 25 / 20 / 15 / 5 / 10 %`):** More Interpreters (`750`) and Makers (`3,750`), fewer Drovers (`3,000`)?
   **Agreed:** yes.
5. **The Hall of Intention on the `50.6°` ley line** and **the Nest of Returns** on the Mound for Interpreters' rebirths?
   **Agreed:** yes.
6. **Strict one-gate rule & the Ley Slot (`lk-slot`):** Every land and dock load enters by the South Gate (`lk-gate`); only
   Tenders pass through the `1.4 m` `lk-slot` wicket to carry relics to the `700 m` ley mole? **Agreed:** yes.
7. **Paddled reed barges (`lz-barge`, 11 bone ribs, zero sails)** and **Lothal dock (`lk-dock`, `lk-dockstore`):** **Agreed:** yes,
   with the owner's rule (`2026-11-17`: *"barges and boats need to take the vessels tag which will be fully implemented in next all
   build rebuild"*): `lz-barge` (`kits/lizardmen/src/59w-lz-works.js`, `basilisk_plan.json`, `82-lzv-site.js`) carries `core/tags`
   `class: 'vessel'` (`ves_*`) with Ring Sea vessel tags (`types: ['cargo', 'barge', 'ferry']`, `propulsion: 'paddles'`,
   `hull: 'raft'`, `wealth: 'middle'`, `crew: 6`, `role: 'barge'`), enforced by `verify.py` (`vessels-tagged`) and riding along
   with the repo-wide `vessel`/`vehicle` rebuild in `TODO.md`.
8. **Water after Dholavira:** Check dam on Tlahn Gill, `2.1 km` leat, and seven cascading reservoirs outside the south wall?
   **Agreed:** yes.
9. **The four deliberate flaws:** `d7` winding cw like `d1`, one outward-facing `flaw_band` per district, the 9th watchtower off
   spacing, and the 5th Court obelisk twisting counter-clockwise? **Agreed:** yes.
10. **Salt scaled back (`55 t/yr`, answered 2026-11-17):** Scaled back from `115 t` (7 pan-spirals, 3 boiling floors) to **`55 t/yr`**
    (3 `gl-pans` spirals, 2 `lk-boil` wet-season boiling floors) in `LZ_TUNE` and `basilisk_plan.json`. **Agreed & done.**

---

## 9. Scale-model queue & cross-references

- **Scale-model queue (`PLAN-LIZARDMEN.md`):** Rename `slrodrkrls` "Sauropolis" to **Basilisk** and move to `766.6,1597.25`.
- **Regional polygon census (`core/simulation/LIZARDMEN-CENSUS.md`):** Defines Basilisk's 6 ring hamlets, the 9 Eastern Sea shore
  villages/camps, and the three Coil trunk roads + barge runs radiating from Basilisk.
