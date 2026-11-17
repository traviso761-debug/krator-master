# Basilisk, the Lizardmen's stone capital: the plan and the blueprint (proposal, 2026-11-17)

The owner, 2026-11-17: *"the lizard capital is now renamed to Basilisk"*, and of the towns' pages: *"don't have to build them
all yet"*. This is a plan and a blueprint only; nothing is built. The scale model still calls the pin `slrodrkrls`
"Sauropolis" until its queue renames it (section 10).

What is settled, from the owner and the lore:
- **The Lizardmen** (`LORE.md` 6.20; `kits/lizardmen/DESIGN.md`, agreed 2026-10-15/16): they never trade or treat, take no
  captives, build in squared spirals with walls that lean wrong and triangular doors sized by caste, use bronze and never iron,
  hang no banners and beat no drums, and keep no warlord: the Interpreters act in concert.
- **About 15,000 people** (the owner, 2026-11-16: *"basilisk will be about 15k"*; `core/simulation/PROPOSAL-LIZARDMEN.md` q.1).
- **Its economy is in `LZ_TUNE` already** (`core/region/data/lz-tune.js`): the bronze hall, the sea's salt pans, the grain it
  lacks from Iguana and the warrens, the hub of both Coil loops (`core/simulation/PLAN-LIZARDMEN.md`).
- **Its look is the kit's stone set** (`kits/lizardmen/src/62-lk-capital.js`): the Hall of Intention, stone rib houses,
  cell-warrens and nest, the Interpreters' college, the gate, the wall runs, the watchtowers.
- **One reliquary per cluster** (the owner, 2026-11-16): the east's on the sea's north strand, *proposed* at 5.1 px 790,1578.

Everything else here is *proposed*. The owner's questions are in section 9.

Files:
- `basilisk_layout.py` lays the city out as data and writes **`basilisk_plan.json`**, the manifest a page builds from (section 6).
- `basilisk_blueprint.py` draws the sheets in `floors/` and writes `BLUEPRINT.md` (each sheet, its caption, its key), from the
  same numbers. It draws them with the generator the other blueprints share, `settlements/voth/palace/blueprint.py` (section 10).

## 1. Core adoption

| Need | Module | How |
|---|---|---|
| the ground at 1:1 | the scale model, as Gila bakes it (`settlements/gila`), then `core/world` | the page bakes `h.png` round the pin; when the `lizardmen-east` region (`openworld/SITES.json`, planned) is cut, Basilisk moves onto `WORLD.H` and the bake retires. The site is the model's floor (-2,600 m) everywhere inside the wall: the page's own ground is the platforms (section 4.1) |
| the coast | **`core/coast`** (`KCOAST`) | the sea's south shore and Tlahn Gill's bay from the model's mask, shaped by the coast field; the class here is **marsh/sabkha** (flat, salt). The plan reads the model's shore at 2 km a pixel (bilinear at one half): the strand is ~560 m north of the wall and ~1 km east of it. The page asks `KCOAST` for its shoreline and keeps the works and the pans on it |
| the drawn ground | `core/drawn` (`KDRAWN`) | the sabkha grid and the platforms registered; `terrainH` reads the drawn triangles, as at Gila |
| the ground's surface | `core/terrain` `KGROUND` | the library's `ground.salt` (the sabkha), `ground.dirt` (the yards), `ground.tilled` (the fields); the platforms' paving is the kit's brick and basalt |
| the city (15,000) | **`core/city`** (`KCITY`) | the Great Coil and the district spirals are squared spirals on a skew frame (75/105 degrees, 1.25 a winding): the steps Gila wrote for itself (`settlements/gila/src/89g-gl-site.js`). The owner agreed (Gila's PLAN.md q.4) that the city-layout workstream may take them into `core/city` as a generator (`KCITY.leiwen`). Until it does, the page reads the manifest's polygons and places through `KCITY.courts.edgeRun` and `KCITY.courts.place` (overlap, the street raster, the foot on the ground). **No new street generator here** |
| the outworks under 500 | `core/hamlet`, the **Lizardmen row** (`core/hamlet/lizardmen/`, Gila's G2) | the salt works on the strand (focus `salt`: the pans, the boiling floors, the store) and the fishing weirs (focus `fishing`) as hamlet records |
| water | **`core/water`** | the sea: `WATER.open` at -2,600.5 m with its bed, a calm salt sea (no swell; a terminal sea has no tide); the bay the same body; **the seven reservoirs, the great tank of the First Turn, the district cisterns, the dock's basin**: `WATER.still`, one record each; **Tlahn Gill**: `WATER.flow` (a wadi: wet in the wet season only) |
| the buildings | `kits/lizardmen`, read in place (`build.py --settlement`, as Gila) | every piece is a kit def; the stone set `lk-*`, the village set `lz-*` where the stone set has no piece yet (the manifest names both: `key` now, `owed` later), Gila's `gl-well` and `gl-pans`. The pieces owed are in section 7 |
| placement, records | `core/rand`, `core/tags`, `core/space` | the manifest fixes the plan; a page adds only what it scatters (furniture, dressing) by `KRAND` from (world, cell, index, salt); everything registered in core/tags before it is drawn |
| doors, walk, furniture | `core/door`, `core/walk`, `core/furnish` | as the kit's page (the caste doors, the nested portals) |
| sky, light | `core/atmos`, `core/clock` | the haze of 2.21 atm |
| host, tools | `core/host` | the inspector, the polygon tool, the walk, the views |
| crops | `kits/crops` | the shore list of LIZARDMEN-SURVEY section 4: bamboo-rice, rice, taro, shade-manioc (`CROPS.forBiome` for XA) |
| the economy | `core/region` (`LZ_TUNE`) | Basilisk's records as plain data (`BS_REC`, `[G data]`), as `LZ_TUNE` reads `GL_REC`: the census by caste and district, the works, the season's need and make. Z1/Z2 already run with Basilisk as a row of numbers: the records replace the row when the page is built |
| people | `core/simulation`, `core/charactermodels` | not yet: the castes have no figures (the kit's `KNOWN_ISSUES.md`) |
| ruins | `core/ruins` | not taken: nothing in Basilisk is ruined (two-way weathering is the kit's parameter, not a ruin) |

## 2. The site

**The pin (`slrodrkrls`, 5.1 px 765,1596) stands in the water**: a cell of the eastern terminal sea at -2,600 m, the raster's
floor. The sea's water cells run west to x 764 in that row and the dry ground beside them is the same floor (-2,599 to -2,600 m).

| | |
|---|---|
| **Proposed pin** | **5.1 px 766.6, 1597.25**, the door of the Hall of Intention: 4.1 km south-east of the old pin, on the flat between the sea's south shore and the bay where Tlahn Gill comes in (water cells x 768-773 in rows 1597-1598) |
| Why not the nearest dry cell | (765,1597) is 2 km south of the old pin, but a city 2.4 km across there has the sea on two sides within a kilometre; the proposed pin keeps a strand (~560 m north, ~1 km east) for the pans, the works and the dock |
| Ground | **-2,600 m** everywhere inside the wall (the model's floor: the sabkha, level with the sea). Due south it stays flat (under +5 m) for **13.8 km**; then +25 m at 16.3 km, +100 m at 19.2 km, +250 m at 23.2 km. To the west the floor runs on under the sea's west end; the trough's west wall rises ~45 km off |
| Air | **2.21 atm** |
| Climate | **XA hypertropic jungle**: 36 °C mean; ~1,800-2,086 mm (`p.png`: 1,804-1,992 at the site, 2,086 at the old pin) |
| The sea | the eastern terminal sea, 9,272 km², salt ("the Lizardman Rift Sea"); no tide. Its surface *proposed* -2,600.5 m, so the sabkha stands half a metre over it |
| Rivers | **Tlahn Gill** (r762, a wadi, not perennial; the model gives 7.6 m³/s at its mouth and lists Sauropolis): it comes north over the flat and reaches the bay 3-4 km south-east of the pin. **Blek Beck** (r249, perennial, 15.3 m³/s) reaches the sea ~16 km north-west |
| The ley line | to the east reliquary (790,1578): **60.6 km at 50.6°**, across the sea |
| Neighbours | as the crow flies: Tuatara 135 km, Komodo 204 km, the Pile 107 km, Iguana ~120 km, Gila 315 km (LIZARDMEN-SURVEY) |

## 3. Who lives there (*proposed*)

The capital's shares differ from Gila's (Gila PLAN q.3): more Interpreters (the college: the Interpreters act in concert
here) and more Makers (the bronze hall, the stone, the salt), fewer Drovers (the grain comes from Iguana and the warrens).

| Caste | Height | Share | People | Where |
|---|---|---|---|---|
| 1 Tenders | 1.22 m | 25 % | 3,750 | stone cell-warrens (`lk-warren`) innermost in every district; the Hall's 140 on the Mound |
| 2 Makers | 1.53 m | 25 % | 3,750 | Makers' quarters in the districts and the gate quarter; built into the craft halls; the works' halls (the bronze hall, the dock store, the boiling floors) |
| 3 Drovers | 1.92 m | 20 % | 3,000 | stone rib houses (`lk-longhouse`); 450 in the gate quarter (the Coil's haulers) |
| 4 Line warriors | 2.41 m | 15 % | 2,250 | lodges (`lz-lodge`, castes 4 and 6 together) outermost in every district; 1,350 of the two castes in the gate quarter, the garrison |
| 6 Bulwarks | 3.80 m | 10 % | 1,500 | with the warriors |
| 5 Interpreters | 3.03 m | 5 % | 750 | 130 on the Mound (the college and its thirteen towers); the rest in towers in the districts' inner windings |

**What the plan houses** (`basilisk_plan.json` `census`): Tenders 3,808, Makers 3,666 (+96 in the district halls), Drovers
3,135, warriors and Bulwarks 3,870 (target 3,750), Interpreters 774: **15,349**, 2 % over, from whole houses. As at Gila,
the nest halls' hosts are residents mid-rebirth and are not counted.

## 4. The layout (*proposed*; sheets B1-B7)

### 4.1 The city on its platforms
The sabkha is level with the sea, so the city stands on **brick platforms 5 m high**, its drains in them, and the precinct on
**the Mound, 12 m**, battered and faced in polygonal basalt (after Mohenjo-daro's citadel mound). The wall stands 8 m to the
walk over the platform, 13 m over the sabkha outside (section sheet).

### 4.2 The Great Coil
One squared spiral street, **the Great Coil** (14 m), winds out from the precinct: corners 75 and 105 degrees (a skew frame,
e1 east, e2 at 105 degrees), the first band 260 m deep and **each winding 1.25 times the last** (each quarter turn 1.25^¼).
Two windings, **thirteen segments**, the last running along the tongue's foot to the gate. The city is **2.4 by 2.1 km**
inside its wall (u -1,326 to 1,065, v -1,149 to 935). Each band runs on through the turn after it, parted from the next by a
cross street (Gila's bands stop at the turn and leave a square there: here only the first turn's square is kept, **the
court of the First Turn**, where the Coil begins, with the great tank).

### 4.3 The precinct of Intention (B2)
On the Mound, inside the first winding (~470 by 370 m):
- **The Hall of Intention** (`lk-greathall`), the one building off the skew grid: its axis is the ley line and its door
  (the origin) faces the reliquary.
- **The Court of Intention** before it, along the line: seven twisted obelisks paired across it, the fifth twisting the other
  way; the ley stone (`lz-ley`) at 58 m; the bells (no clappers) and the stela pair either side of the door.
- **The Interpreters' college** (`lk-college`) west, facing the Hall, in a squared spiral of **thirteen** Interpreters' houses.
- **The seer's hall** (`lz-seer`): its model is of the whole country, the Coil Rounds and the Allotment remembered.
- **The Nest of Returns** (`lk-nest`), north-east: where the Interpreters are reborn (*proposed*, q.13).
- The Hall's Tenders in five stone cell-warrens along the south; the turned stelae by the college.

### 4.4 The seven districts (B1, B3)
Each band of the Coil but the last is a district, **its own rectangular leiwen** wound in to its stone nest hall in its long
court (the cistern, the bells, the stela pair, a craft hall, the medicine hut, an obelisk and the turned stelae along it).
Every row fronts its band's inner edge, so **every door faces the district's nest**; the castes go from the nest outward in
Gila's order (Tenders, Interpreters, Makers, Drovers, then the lodges). Each district's spiral ends in its **mouth on the
Great Coil, facing the Hall**. Brick wells stand in the yards behind the rows (231 in all).

| District | Side | Spiral | Windings | First band | Housed |
|---|---|---|---|---|---|
| d1 | south | cw | 1 | 42 m | 726 |
| d2 | east | ccw | 1 | 46 m | 781 |
| d3 | north | cw | 1 | 50 m | 987 |
| d4 | west | ccw | 2 | 31 m | 1,369 |
| d5 | south | cw | 2 | 33 m | 2,110 |
| d6 | east | ccw | 2 | 36 m | 3,185 |
| d7 | north | **cw** | 2 | 39 m | 3,587 |

The districts grow outward as the Coil does (each band 1.25 times the last, and longer), so they are not equal: q.4.

### 4.5 The gate quarter and the tongue (B6)
The Coil's eighth band, west, runs on through its turn **past the south wall into a tongue**: a spiral wound in to the
**mustering ground** (`lz-muster`: posts on a spiral grid, no signal gear), with the two barracks, the plunder warehouse,
the bone hall and **the seven granaries of the Allotment** in its court, and the garrison's lodges (1,350 warriors and
Bulwarks), the Coil's haulers and the warehouse Makers in its bands.

### 4.6 The wall and the gate (B6)
The wall follows the city's outline, which is the Coil's own last winding run on into the tongue: **seven runs, 8,170 m**
(408 of the kit's 20 m `lk-wall` runs end to end), cyclopean basalt leaning in on its outer face and out on its inner.
**Thirteen watchtowers**, evenly spaced but the ninth (the wall's flaw). **One gate** (`lk-gate`) in the tongue's foot,
facing south: the Great Coil ends in it, so the way in is the spiral's own end, the last 400 m under the wall on both hands.
**Every road leaves from it**: the Iguana road west, the Komodo road east, and the shore road north, which goes round the
sea's west end (to Tuatara and the east reliquary). The only other opening is the Ley Slot.

### 4.7 The ley line and the reliquary approach (B5)
The kit's one straight thing, from the Hall's door at **50.6°**: across the Court of Intention, **the Ley Way** (9 m, kept
clear straight through every band and court; the only short way across the spiral), a twisted obelisk at each of the Coil's
**three** crossings, **the Ley Slot** (a Tender's 1.2 m wicket, the nested portal's smallest) through the east wall, the
strand, and **the ley mole**, 700 m of basalt into the sea, with the barge stair and a stela pair (the Coil and fracture
glyphs) at its end. The relics go to the east reliquary from here **by water, straight along the line: the one load in the
country that does not go round** (q.8).

### 4.8 Water (B7)
After **Dholavira**, the Indus city on a salt flat that caught its seasonal streams: a **check dam on Tlahn Gill** where its
course passes nearest the city, a **leat of 2.1 km**, and **seven reservoirs** outside the south wall, each 1.25 times the
last (6,600 to 25,300 m²), spilling one to the next. Every district court has a cistern; every yard a well. The rain
(~1,800-2,086 mm) fills them; the sabkha's ground water is salt.

### 4.9 The works and the salt (B4, B7)
- **On the bay**, outside the east wall: **the dock** (175 by 36 m, five to one, after Lothal's; its sluice north to the
  sea), **the dock store** on its podium and the warehouse, **the bronze hall** (seven furnaces) and its charcoal and ore
  yard, three **fishing weirs** standing in the bay.
- **On the strand west of the city**: **seven squared spirals of salt pans** (Gila's `gl-pans`), **three boiling floors**
  (the brine boiled down in pottery over charcoal in the wet season, when the pans do not dry) and the salt store.

### 4.10 The country (B0)
Fields on the floor south and west of the city (bamboo-rice, taro, shade-manioc; ~800 ha drawn), the three roads.

### 4.11 The flaws (one in every band)
- **The city's band of districts**: their chirality alternates, cw and ccw, but there are seven, and **d7 winds the same way as
  d1**: the pairs do not close.
- **Each district** (and the gate quarter): **one band of its last winding is fronted on its outer edge**, its doors facing
  away from the nest (chosen by the plan's own hash and kept in the manifest: `flaw_band`, and `flaw: true` on its houses).
- **The wall**: the ninth of the thirteen towers off its spacing.
- **The Court of Intention**: the fifth of the seven obelisks twists the other way.

## 5. What it lives on (`LZ_TUNE`; the plan's places for each)

| Good | `LZ_TUNE` (t a year) | Where in the plan |
|---|---|---|
| grain | makes 1,500; the town's need ~3,500 (233 kg each) | the fields south and west; **~2,000 t in** from Iguana (2,600) and the warrens; the seven granaries of the Allotment in the gate quarter |
| produce | 1,300 | the fields and the jungle shore |
| fish | 600 | the weirs in the bay, the reed barges |
| meat and hide | 450 | the herds; the bone hall (gate quarter) |
| salt | **115**, the east's only source | the pans, the boiling floors, the salt store |
| bone | 48 | the bone hall |
| bronze | the hall casts Tuatara's copper (70) and Komodo's tin (8), nine to one: **~78** | the bronze hall on the bay; its ingots out along the Coil as the outward gift |
| the Coil | the hub of both loops | every load comes in by the gate (or by water to the dock, and round to the gate); the seer's hall keeps the plan |

## 6. The manifest (`basilisk_plan.json`)

Plain JSON, no three.js; the `[G data]` fragment a page makes from it is that page's to write. Frame: metres, **u east, v
north** (a page's x = u, z = -v), the origin the proposed pin; `ry` turns a kit def's +z front to its heading.
- `site`: the pins, the model's shore (`shore_model`) and contours, the rivers (r762, r249, r207), the flat south of the city.
- `coil`: the radii, the street's centre line (13 segments), the First Turn's court.
- `precinct`: its polygon, the Court of Intention, the Mound's height.
- `districts[7]` and `gate_quarter`: the outline, the court and its axis, the spiral street with its **mouth**, every band
  (polygon, inner and outer edge, depth), the chirality, the windings, `flaw_band`, the census housed.
- `wall`: the line, the runs, the gate, the slot, the towers.
- `ley`: the bearing, the crossings, the slot and the mole along the line.
- `water`: the reservoirs (polygon, level), the check dam, the leat. `works`, `country`: as drawn.
- `placed[1,180]`: every placement: `id` (`bs.<where>.<n>`), `key`, `owed` (the stone piece the kit lacks), `at`, `ry`,
  `where`, `caste`, `band`, `flaw`, `role`.
- `kit`: every key's footprint and the people it holds; `census`: the targets and what is housed.

Regenerate: `python basilisk_layout.py` (the manifest), then `python basilisk_blueprint.py` (the sheets and `BLUEPRINT.md`).
Both are deterministic: no randomness, the flaws by a fixed hash of the district's id.

## 7. Pieces the kit lacks

| Key | What | Now drawn as |
|---|---|---|
| `lk-makers`, `lk-tower`, `lk-lodge`, `lk-granary` | the stone set's Makers' quarters, Interpreters' house, warriors' lodge and granary | `lz-makers`, `lz-tower`, `lz-lodge`, `lz-granary` |
| `lk-bronzehall` | the bronze hall: 45 by 27 m, eleven bays, seven furnaces, the crucible floor, the mould pits | none |
| `lk-dock`, `lk-dockstore` | the brick basin with its sluice; the store on its podium (Lothal) | none |
| `lk-slot`, `lk-mole` | the Ley Slot's wicket in a wall run; the mole and its barge stair | none |
| `lk-boil` | the salt boiling floor | none |
| `lk-reservoir`, `lk-checkdam`, `lk-charcoal` | a stepped brick reservoir; the basalt check dam and leat head; the charcoal and ore yard | none |
| `lz-barge` | a reed barge, eleven ribs, paddled (no sail: q.8) | none |

**Textures:** none owed. The kit's pack has the basalt, the brick, the bronze, the reed and the bone; the ground takes the
library's `ground.salt`, `ground.dirt` and `ground.tilled`.

## 8. Steps (when the owner wants the page)

| Step | What | Test |
|---|---|---|
| **B0** | this plan, the sheets, the manifest | `python basilisk_layout.py`: the census within 3 % of 15,000 |
| B1 | the owed pieces in the kit (section 7), its sheet and verify | the kit's `verify.py --assert`; the engine fingerprint |
| B2 | `KCITY.leiwen` in `core/city` (the city-layout workstream), Basilisk's Coil and districts from it | the generator reproduces the manifest's streets and bands |
| B3 | the page: the ground, the platforms, the coast, the sea and the reservoirs on core/water, the city from the manifest, the works, the pans | GPU verify: `on-the-model`, `people` (budget), `water-on-core`, `ley-aims`, `no-overlap`, `on-the-ground`, `doors-face-in`, the kit's universals |
| B4 | `BS_REC` for `LZ_TUNE` (as `GL_REC`) | `test-lizardmen.js` with the records in place of the row, unchanged unless meant |
| B5 | flora (`biomes/rift`, XA), the open world when `lizardmen-east` is cut | the region's verify |

## 9. Questions for the owner (answers *proposed*)

1. **The site.** The pin stands in the sea. Move it to **5.1 px 766.6,1597.25**, the sabkha between the sea's south shore and
   Tlahn Gill's bay (4 km south-east), or to the nearest dry cell (765,1597, 2 km south, the sea on two sides within a
   kilometre)? *Proposed:* 766.6,1597.25.
2. **Level with the sea.** The site is the model's floor, -2,600 m, the sea's level. Put the sea at -2,600.5 m and the city on
   **brick platforms 5 m high, the precinct on a 12 m mound** (Mohenjo-daro)? *Proposed:* yes.
3. **The plan.** PLAN-LIZARDMEN proposed "five or seven district spirals" round the Hall. This is **seven districts and a gate
   quarter in the two windings of one squared spiral street, the Great Coil**, 2.4 by 2.1 km. *Proposed:* seven.
4. **Unequal districts.** The districts grow outward with the Coil (each band 1.25 times the last, and longer): 726 people in
   d1, 3,587 in d7. Or equal districts (~1,750 each), which breaks the 1.25 rule? *Proposed:* as drawn.
5. **The capital's castes**: Tenders 25 %, Makers 25 %, Drovers 20 %, Line warriors 15 %, Interpreters 5 %, Bulwarks 10 %
   (Gila's with more Interpreters and Makers, fewer Drovers)? *Proposed:* yes.
6. **The Hall of Intention on the ley line**: its axis the line, its door facing the reliquary, the one building off the
   skew grid? *Proposed:* yes.
7. **One gate**, at the end of the spiral (the tongue's foot), every road from it, and **no other door but the Ley Slot**:
   every load goes round the walls to the gate, even from the dock? *Proposed:* yes.
8. **Boats.** Do the Lizardmen use boats? *Proposed:* yes, **reed barges, paddled, no sails** (a sail is too near a banner);
   a dock after Lothal's; and **the relics go to the east reliquary by water, straight along the ley line: the one load that
   does not go round**.
9. **Water after Dholavira**: a check dam on Tlahn Gill, a 2.1 km leat and seven reservoirs, a cistern in every court, a
   well in every yard? *Proposed:* yes.
10. **The flaws**: d7's chirality, one band in each district fronted outward, the ninth tower, the fifth obelisk (section
    4.11)? *Proposed:* yes.
11. **The owed pieces** (section 7) in the kit, as the stone set's (`lk-*`), so Tuatara and Komodo can take the dock and the
    weirs? *Proposed:* yes.
12. **The salt.** 115 t a year (`LZ_TUNE`) from pans on the strand **and boiling floors** for the wet season, when ~1,900 mm of
    rain will not let the pans dry? *Proposed:* both.
13. **The Nest of Returns**: a nest hall on the Mound where the Interpreters are reborn, apart from the districts' nests?
    *Proposed:* yes (lore: rank is a phase you pass through, and the capital is where that phase is spent).

## 10. Owed to others (not changed here)

- **The scale-model queue:** rename `slrodrkrls` "Sauropolis" to **Basilisk** and move it to **766.6,1597.25** (q.1); the
  derived data (`geology.json` settlements, `ledger.json`, `rivers.json`'s r762 "lists Sauropolis", the census files) follow
  the model's next bake. `PLAN-LIZARDMEN.md` already queues the rename and the move ashore.
- **`LZ_TUNE`** (`core/region/data/lz-tune.js`) and **`openworld/SITES.json`** keep px 765,1596 until the pin moves.
- **`PLAN-LIZARDMEN.md`**, "Basilisk, the capital": may point here.
- **The shared sheet generator** (`settlements/voth/palace/blueprint.py`) took opt-ins for these sheets: polygon rooms
  (`pts`, `area`, `fill`, `at`), `overfills`, `texts`, a sheet's own `key` and scale `bar`, and an outline colour on
  `fills`. Every sheet of the other blueprints (the Voth palace, Erewhon's citadel, the Iziz palace, Longsong; 40 sheets) draws
  byte-identical before and after.
