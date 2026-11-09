# The Loom-Chasms: the plan (2026-11-09)

The Loom-Chasms (Region 99, `rmvraoas90co7`) are a rift basin in the south-east of map 5.1. On the west a terraced
piedmont, the **Weavers' Cradle**, steps down from the Stalker Range. In the middle a tableland of basalt mesas, the **Shuttle
Mesas**, is split by a net of chasms about a kilometre deep. On the chasm floor, the lowest ground, lies the salt lake **Lake
Nim** and its playa, **the White Loom**. Over the chasms grows the region's one invention: **living cables**, tensile plants
that span the slots between the rims. The Yuni farm the Cradle and send expeditions in from **Spindle Fan**. The Stalkers come
down off their peaks.

This plan replaces the plan v2 (Gemini, 2026-10-28) and keeps its facts. Nothing is built; it is a kit for the rebuild's queue,
after the frozen integration pass. Its station records (`stations/*/station.json`) are on the 5.1 canvas. Names marked **TBD**
are the owner's. What changed from v2 is listed at the end.

## 1. What the map carves (map 5.1)

The region was carved in **4.24** (`tools/scale-model/history/edit_424.py`; `tools/scale-model/README.md`, "4.24", Part I) and
is one of the five protected south-eastern regions in `build_425_master.py` (l. 286). The numbers below were read from the
model (`smodel.page`, 2026-11-09, at `gemini/scale-model-5.1-r3`, dfdf64d1a); the polygon is the model's 13-vertex one
(`model/src/51-region-store.js`), masked with `matplotlib.path.Path.contains_points`.

- **Size:** 76,417 height cells of 2 km, about 306,000 km² (`STATIONS-MAP-5.1.md`: 307,000). It spans 5.1 px x 1445-1793,
  y 987-1295: about 700 by 620 km. v2's 386,278 km² was 4.23's ring crater (`README.md`: about 389,000 km²).
- **Whose ground** (overlaps with other polygons):
  - the Yuni Emirate (`rmw8ca6baau47`), 21,624 cells (28%): the west is Yuni land on paper;
  - the Stalker Gate (`rmvstalkergate`), 3,426 cells, and the Stalker Range (`rmvkknh1am4fw`), 1,084, on the west;
  - the Great Chasm (`rmw4vh9t20da4`), 1,509 cells on the north: its south end and the sill lie inside Region 99;
  - Mid Basin (`rmvmidbasin101`), 2 cells: the two meet edge to edge.
- **Heights:** p1/p5/p10/p25/p50/p75/p90/p95/p99 = 256 / 331 / 498 / 1,344 / 1,764 / 2,729 / 6,498 / 8,203 / 9,726 m.
  - **Lowest:** 164 m at 1697,1006, in the Great Chasm's floor where the two polygons overlap. The Loom's own floor bottoms
    at 218 m, in Lake Nim's bed.
  - **Highest:** 11,198 m at 1618,989, on the north rim.

  | Band | Cells | What |
  |---|---|---|
  | under 500 m | 7,677 | the chasm floor and the playa |
  | 500-1,000 m | 6,142 | the chasm walls' feet, the lower floor |
  | 1,000-2,000 m | 29,772 | **the Shuttle Mesas and the Weave-Step** (39%) |
  | 2,000-3,000 m | 16,413 | the Weavers' Cradle |
  | 3,000-6,250 m | 8,440 | the rims' slopes, Mount Caelum |
  | over 6,250 m | 7,973 | the airless rims: east 4,340 cells, north 3,059, west 538 |

- **Four zones, west to east** (4.24's design, checked against the data):
  1. **The Weavers' Cradle** (x about 1445-1540): a curved piedmont of loess-mantled fans along the west and north-west
     walls. Data, x under 1540: p5/p25/p50/p75 = 2,231 / 2,508 / 2,781 / 3,807 m. That is 4.24's 2,050-2,920 m, not v2's
     1,800-2,200 m.
  2. **The Weave-Step** (x about 1540-1585): three stepped basalt terraces from about 2,060 m down to 1,520 m (4.24), notched
     by box canyons. Along y 1166: 2,157 m at x 1544, 1,954 m at 1564, then the drop to 598 m at 1584.
  3. **The Shuttle Mesas and the chasms** (x about 1580-1750): a flat-topped basalt tableland at 1,380-1,760 m, cut by
     **ten NNE-SSW warp chasms** and **seven weft canyons** at 31-36° to them (4.24). In the data the chasms join into **one
     connected floor under 800 m: 10,826 cells, about 43,000 km²**, x 1598-1736, y 1040-1284, floor 218 m, median 394 m,
     drawn out north-south (its long axis three times its short). On a central box (x 1580-1750, y 1040-1285), 14,163 of
     40,446 cells lie at 1,300-1,600 m (the mesa tops) and 10,081 under 700 m (the floor). **The chasms are 1.0-1.3 km deep
     and 2-20 km wide,** not v2's 150-220 m. 4.24 weathered their walls (mean cut 49 m, p99 182 m, max 527 m).
  4. **Mount Caelum** (centred 1622,1166): a cone rising out of the chasm net. Its summit cell is pinned at 4,431 m.
     Medians by ring: 4,263 m at 2 px, 3,789 m at 4 px, 2,657 m at 8 px, 1,780 m at 12 px, 1,089 m at 20 px. So it stands
     about 3.3 km over the mesas, about 50 km across, with flanks of 7-8°: a shield, not a dome.
- **The rims:** the east edge (x 1740 and over) and the north edge (y under 1040) are airless walls, 6-11 km high (O, HF, HT).
  The west edge meets the Stalker Range. v2's "Stalker Peaks rim at 5,200 m, 0.83 atm" is too low: the west edge's p95 is
  7,757 m.
- **Water:**
  - **Lake Nim:** 124 cells, about 500 km², level 240 m, bed 218 m (22 m deep), x 1685-1696, y 1169-1184, class WX on the
    water. Its shore (1697,1176) is 243 m, class XS. v2's 45 km² at 344 m is wrong; 4.24 set it at 240 m.
  - **A tarn** of 13 cells at 7,270 m on the east wall (1775-1777,1087-1092).
  - **Rivers** (`rivers.json`): 42 records cross the polygon, all named in the Yuni tongue (`river_names.py`: Region 99 is
    `yuni`). Three are perennial:
    - **Ostrukh Riba** (`r_mb_siphon_breach`, from Mid Basin): 300 km, **340 m³/s**, ending at 334 m at 1618,1214 on the
      chasm floor;
    - **Aina Bruk** (`r174`): 59 km, 26.9 m³/s, from Spindle Fan's fan (1557.7,1139.2) to the Weave-Step's foot;
    - **Stara Bruk** (`r235`): 72 km, 17.7 m³/s, on the floor (1,361 m to 261 m).

    The rest are seasonal wadis (*guli*). The longest:
    - Gould Guli (`r424`, "Spindle Wash"), 178 km;
    - Mista Guli (`r429`, "Halite Draw"), 164 km;
    - Silba Guli (`r444`), Dipa Guli (`r433`), Sista Guli (`r452`), Braita Guli (`r426`, "Shuttle Creek"), all 147-158 km.

    Most give their end as "a lake at 593-666 m" (620 m for most), which the water raster no longer holds: those records are
    stale (section 8).
  - **Vents** (`vents.json`): two, both of kind `geyser`:
    - Mount Caelum's summit (1622,1166). Its `floor` of 4,596.7 m is 4.24's height, 166 m over the pinned ground.
    - One in the Cradle at 1490,1166 (floor 2,393 m).
  - **Tubes:** none.
- **Water budget.** v2 wants "a little water, but not much", and the classes agree: the floor is desert. But Ostrukh Riba
  alone brings 340 m³/s (10.7 km³ a year) onto the floor. At the floor's mean of about 24 °C, Turc's open-water loss
  (L = 300 + 25T + 0.05T³) is about 1,590 mm a year. Evaporating that river would take about 6,700 km² of lake. Lake Nim is
  500 km². Either the river's flow is too high, or the lake is too small (section 9; Mid Basin's plan, section 10, already
  questions the river's course).
- **Settlements** (`model/src/60-settlements.js`; old canvas px plus 272, 330):
  - **Spindle Fan** (`sloomspindle01`, Yuni village, 1561,1140, 2,150 m): "Yuni farming and spring outpost on the Weavers'
    Cradle piedmont fan: terraced crops supporting expeditions into the Loom-Chasms";
  - **Mungo** (`s4xb8r0vmy`, village, old 1321,825 = 1593,1155, 1,764 m on the Weave-Step's foot, no notes);
  - **Reed** (`sndrdffkyg`, village, old 1277,676 = 1549,1006) sits on the north edge on ground of 9,393 m. That is airless:
    a village cannot stand there (section 9);
  - **the Great Chasm's trade post** (planned, `biomes/greatchasm/PLAN.md` section 5) at the sill, 1697,1028, inside this
    polygon.

## 2. Geology and landforms

**A continental rift with a central volcano**, like the Afar's Danakil Depression or the Basin and Range with a Long Valley
in it:
- the crust stretched;
- flood basalts capped the plateau;
- the basalt broke into horsts (the mesas) and grabens (the chasms);
- a shield grew where the faults cross;
- the lowest graben holds the evaporating lake.

| Landform | What it is (Earth's like) | Where | Drawn by |
|---|---|---|---|
| **The Cradle's terraces** | Loess over coalescing alluvial fans (a bajada), terraced by people | x 1445-1540, 2.2-2.9 km | `KRELIEF.terraces` (38c; the 2026-11-03 audit gave loom-chasms this one), `KSTRATA.vary` for the loess-and-tuff (as Mid Basin's) |
| **The Weave-Step** | Structural benches on a monocline: flood basalt flexed down to the rift, each step a flow top (the Colorado Plateau's monoclines in basalt) | x 1540-1585 | `KRELIEF.scarp` and `relay` (38c) for the steps; `runout` for the talus skirts |
| **The Shuttle Mesas** | Horsts of columnar flood basalt (the Columbia Plateau; Ethiopia's traps) | 1.3-1.8 km | the model's heights; `KSTRATA` basalt flows in the edges, the columns in the faces |
| **The warp chasms and weft canyons** | Grabens and their conjugate splays, 1-1.3 km deep, floored by fans and salt (the Danakil's grabens; Canyonlands' grabens on a larger scale) | the floor | the model's heights; `KRELIEF.stepcut` for the walls' steps at page scale |
| **The slots** | Narrow tension fissures on the mesa rims and the chasm floors, 100-300 m wide and 150-200 m deep: **v2's "180 m chasms"**, at page scale, below the model's 2 km grid | where a station needs them | `KRELIEF.stepcut` along a line; the chasm head (an amendment shared with Mid Basin) |
| **Mount Caelum** | A basalt shield where the faults cross (the Afar's Erta Ale range; Marion Island), with fumaroles at its summit | 1622,1166 | `KRELIEF.volcano` with the model's flanks; `KSTRATA` |
| **The White Loom** | A playa: halite crust, salt polygons, pressure ridges, brine pools (the Danakil's salt flats, Badwater) | round Lake Nim | `W.pan` with the `brine` look (`core/water`); `KGROUND` salt layers |
| **The geodes** | Amethyst geodes in the thick flows (`biomes/CRYSTAL-CAVES-5.1.md`, site 3) | the Weave-Step's basalt terraces; one walk-in geode in a chasm wall | `KGEODE` (built in the scablands' coulee, 2026-11-09), `KSPELEO.AMETHYST` |

**Salt glaciers (namakiers) are not here.** v2 lines its chasm floors with them. A namakier flows from a salt diapir that
breaks the surface (Iran's Zagros). That needs a thick buried salt layer, and the model has none: `KARST-SITES-5.1.md` reads the
White Loom as "a halite playa crust at 240 m ... No salt body to cave". The floor's salt is the playa's: crusts, polygons,
pinnacles. A buried evaporite sequence (a Danakil-like rift fill) would allow namakiers; that is the owner's call (section 9).

## 3. Air and climate

- **Air** (P = 1.6 e^(-h/8000) atm; Copper Glacier's 1.19 atm at 2,380 m checks the formula):
  - 1.55 atm on the playa (243 m);
  - 1.46 atm at the Loom station (748 m);
  - 1.33 atm on the Weave-Step (1,479 m);
  - 1.22 atm in the Cradle (2,180 m);
  - 0.92 atm on Caelum's summit (4,431 m).

  v2's station figures (1.31, 1.44, 1.59, 0.95, 1.68) used another sum and are all high; its formula was right.
- **Climate (the model):**

  | Ground | Mean °C p10/p50/p90 | Rain mm p10/p50/p90 | Classes |
  |---|---|---|---|
  | under 700 m (the floor) | 15 / 24 / 26 | 31 / 63 / 94 | BWk, XW, BWh, XS |
  | 700-1,300 m | 15 / 20 / 23 | 31 / 78 / 204 | BWk |
  | 1,300-2,000 m (the mesas, the Step) | 13 / 18 / 20 | 47 / 125 / 204 | BWk, BSk |
  | 2,000-2,600 m (the Cradle) | 12 / 14 / 15 | 173 / 220 / 314 | BSk, Dsb, Cwb |
  | 2,600-4,000 m | 5 / 10 / 12 | 173 / 251 / 329 | Dsb, Dsc, BSk |

  The whole polygon: BWk 27,361 cells, BSk 19,618, Dsb 6,327, HF 4,437, XW 3,633, ET 3,347, Dsc 2,627, O 2,308 and smaller
  classes. The floor is hotter than v2's table: the playa's shore has a mean of 24 °C (36/13), not 16 °C.
- **The stations' climate:** see section 7.
- **Wind and dust:** the floor is a hot, dense-air trough under airless walls. Expect heat shimmer by day, dust off the wadis
  and the playa, and cold air draining off the rims at night. The dust season is in core (`fx/89-atmos-fx-dustseason.js`).

## 4. Life

Nothing of the Loom's life is built. v2's species exist only in its text. Mid Basin and the Great Chasm both plan to read them
in place, so this kit should write its species file early.

### The living cables (the region's invention)

The **cable spinner** (v2: *Chordephytum ferreum*). Under Krator's canon the native body is a fungoid host that takes a partner
(the owner, 2026-11-02, `biomes/hearths/PLAN.md` section 1). The cable spinner is one such body, growing in tension, not
compression.
- **The anchor:** a swollen basal tuber that fuses its root mat into the basalt of a rim.
- **The pioneer shoot:** a light line lifted by a gas bladder (hydrogen or methane from partner archaea). It drifts across a
  slot on the up-draft and snags on the far rim. The tuber winches it taut.
- **The grown cable:** the line thickens with iron-silica fibre into a cable 15-40 cm thick and 100-300 m long, and it
  **hangs**.
  - **Buoyancy carries the shoot, not the cable.** In 1.5 atm air at 24 °C, a cubic metre of hydrogen lifts about 1.6 kg.
    A grown cable 30 cm thick and 300 m long weighs tens of tonnes: it would need tens of thousands of cubic metres of gas.
  - So young shoots arch up (`KSPAN.solve(a, b, {up: true})`) and grown cables sag as catenaries (`KSPAN`'s default).
    `KSPAN.tension(S, w)` gives the pull at each anchor, so a page can set anchors only where the rock would hold.
- **The tiers:** spans laid over one another in a slot form a canopy 80-150 m over its floor (`KSPAN.strands` for a tier).
  Mosses, epiphytes and the cable-stryder live on it.
- **Where:** v2 says the cables bridge "200 m vertical rifts". The model's chasms are 2-20 km wide, far beyond a 300 m span.
  The cables cross the **slots** (section 2): the fissures on the mesa rims, the narrow weft canyons and the chasm heads where
  they pinch out (Mid Basin's Warp Head). The great chasms below them are open sky.
- **The parent colony** (`stations/caelum`): the oldest spinners on Mount Caelum's summit, where fumarole heat and steam rise.
  *Proposed:* the bladders' gas is made by partners that need the vents' warmth, so the colony is where the pioneer shoots
  are bred and released on the up-slope wind.

### By zone, read in place where possible

| Zone | Flora | Read from |
|---|---|---|
| **The Cradle** (BSk, Dsb, Cwb; 170-440 mm) | the Yuni fields on the terraces, chosen with `CROPS.forBiome` / `CROPS.at` (the station record's cold rye, mountain flax and lichen spelt are to be checked against them); hedges, windbreaks, orchards on the fans; steppe on the unterraced ground | `kits/crops`; the Yuni build's kit for the fields' look (`settlements/yuni`) |
| **The Weave-Step and the mesas** (BSk, BWk; 50-200 mm) | cold-desert scrub and the wadis' thickets; the mesa tops bare pavement and crust | the Outlands' cold-desert set (`biomes/outlands/PLAN.md`), as the Great Chasm plan reads it: stilt mound, sac brush, ember scrub, drum cluster, crust rosette, pebble mat |
| **The slots** | the cable spinner and its canopy; shade lovers on the slot walls | this kit |
| **The floor** (BWk, BWh, XW; 30-90 mm) | sparse hot-desert scrub along the wadis; bare fans | the SE desert's species (`biomes/sedesert`), *proposed*, to be checked at the build |
| **The White Loom** | halophytes on the playa's rim; brine-pool mats (red and orange, as the Danakil's) | this kit (*proposed*) |
| **Mount Caelum** (Dsc to ET; about 440 mm) | cushions and crusts on the upper flanks; the parent colony at the summit vents | Oidong's cushions; this kit. A vent on cold high ground under a clear sky is also the Hearths' kind of site (`biomes/hearths/PLAN.md` section 5): *proposed*, a small hearth field at the summit, the owner's to allow |

### Fauna (`kits/fauna`)

Krator's native animals are vertebrate-grade **hexapods** on the fauna kit's `faWdHex` anatomy (`kits/fauna/BIOME-FAUNA-PLAN.md`,
as the Hearths plan uses it). v2's two fit that body:

| Key (*proposed*) | Name | What |
|---|---|---|
| `cable_stryder` | **Cable-stryder** | 2.4 m, sinuous, six limbs with pincer claws and locking tendons: runs along single cables and sleeps hanging. An ambusher on the canopy: drops on what crosses below |
| `halite_sifter` | **Halite sifter** | 2.2 t, low and armoured, four legs and two shovel limbs: breaks the playa crust for the brine mats under it |

Plus, read in place: the Outlands' and the Great Chasm's desert animals on the mesas, and Mid Basin's flenser-hound off the
Siphon Pits' rims (*proposed*). The Yuni's draft animals in the Cradle (the station record's "ghaunt-ox") are the Yuni's
livestock: whatever the Yuni build uses.

## 5. People

- **The Yuni.**
  - **Spindle Fan** is their spring outpost on the Cradle and the base for expeditions into the Loom. Their land on paper (the
    Emirate's polygon) covers the west, 28% of the region.
  - Yuni names are on every river.
  - The Great Chasm plan's routes: from its sill to Spindle Fan is 423 km, never under 1,000 m, across the mesas and the wadis
    (its section 5). So the Yuni road to the Coyote Men's trade post crosses the Loom from south-west to north-east.
  - Yuni air is about 1.3 atm (`LORE.md` table); the Cradle's 1.22 is home to them.
- **The Cradle's farmers.** The station record has turf-roofed stone longhouses and draft-ox teams. Whether they are Yuni
  colonists or an older people under Yuni rule is the owner's (section 9). Either way, the farms are NPC settlements
  (`core/hamlet`), not outposts.
- **Mungo** (village, 1593,1155) stands at the Weave-Step's foot. It has no notes: its people are the owner's.
- **Caravans and expeditions:** caravans on the Yuni road and expeditions down to the floor and the playa make night camps
  (`core/camp`).
- **The outlaws:** Mid Basin's Yuni outlaws (*proposed* there) roam north into the Loom's southern chasms.
- **The Stalkers** (`LORE.md` §4, Hub 01). Quiet robotic killers out of Hub 01 in the Stalker Peaks, run by a mad AI that no one
  in the world knows of. They work in pairs or triads and lie in wait under the sand. Their models exist (`kits/mechs`,
  culture `stalker`: the Harpooner has two pneumatic harpoon guns, v2's "harpoon winches"). v2's ambush lines in the cable
  canopy are a proposal; the lore says only that they come out of the peaks and go back into them.
- **Player outposts:** candidate sites only, as **hints** for the open world's player-settlement registry; the kit draws
  nothing for them:
  - a spring on a Cradle fan;
  - a slot head on a mesa rim (water from the rim's seeps, a cable bridge for a gate);
  - Mid Basin's chasm heads on the south edge.

## 6. Dangers

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Heat** (warm month 36 °C on the playa, 30 °C at the Loom station) | the floor | `KHAZ.provide('temperature')` |
| **Falls** | the mesa rims, the chasm walls, the slots; a broken cable | `fall` |
| **Rockfall** | the chasm walls, the Weave-Step's talus | `crush` |
| **Flash floods** in the wadis and slots | after rain on the rims | `drown` and `crush`, timed: the gorge flood is a shared amendment (section 8) |
| **Salt crust over brine** | the White Loom | `sink`, a crust that breaks underfoot: a shared amendment |
| **Brine pools** | the playa | `drown`; the brine's burn as `poison` (mild), if the owner wants it |
| **The cable-stryder** | the canopy, dropping on what passes | `hunter` (`KHAZ.PREDATOR.lair`), or `grab` |
| **The Stalkers** | the west, off the Stalker Range; the roads | `hunter`, bound to the mechs' records |
| **Dust storms** | the floor and the playa | weather (`core/atmos`, the dust season) |
| **Thin air and cold** | Caelum's summit (0.92 atm, coldest month -15 °C); the airless rims | `KHAZ.provide('pressure')`, `'temperature'` |
| **Fumaroles** | Caelum's summit | `heat`, `gas` (the shared night-gas amendment) |

## 7. Stations (on the 5.1 map)

Each page is the usual 5.2 km square round its site. World km = 5.1 px x 2; a page's site is the old canvas px (5.1 px less
272, 330). The heights below are the model's, and the station records' heights match them. v2's station 4 joined Caelum's
summit and Lake Nim, 140 km apart; they are split here.

| Station | 5.1 px | Ground (the model) | What |
|---|---|---|---|
| 1 **The Weavers' Cradle** (`cradle`) | 1555,1142 | 2,180 m (2,166-2,199 m within 3 px); 1.22 atm; Cwb, 11 °C (23/0), 439 mm; Spindle Fan 13 km north-east | the terraced loess fans, Aina Bruk off the fan, the Yuni farms, the road setting out east |
| 2 **The Weave-Step** (`monocline`) | 1575,1163 | 1,479 m on a step; 978-1,900 m within 3 px; 1.33 atm; BSk, 15 °C (26/5), 125 mm; Mungo 39 km east-north-east | the basalt benches and box canyons, the talus skirts, a waystation on the road, the first view over the chasms |
| 3 **The Loom** (`loom`) | 1662,1162 | 748 m on a mesa's shoulder; the floor 264 m and the mesa top 1,592 m within 3 px; 1.46 atm; BWk, 19 °C (30/9), 78 mm | a slot on the mesa rim with its cable canopy in tiers, the cable-stryder, the great chasm opening below; Stara Bruk on the floor |
| 4 **Mount Caelum** (`caelum`) | 1622,1166 | 4,431 m (pinned; 3,721-4,441 m within 3 px); 0.92 atm; ET, -2 °C (11/-15), 439 mm | the summit fumaroles, the parent colony, the chasm net spread out below |
| 5 **The White Loom** (new, split from `caelum`) | about 1697,1176 | Lake Nim's shore at 243 m; the lake at 240 m; 1.55 atm; XS, 24 °C (36/13), 47 mm | the playa: salt polygons and crusts, the brine pools and their mats, the halite sifter, a salt-camp |

**Station 3 comes first.** The cables are what no other kit has, and `KSPAN` is ready for them. The page holds the mesa, the
slot, the canopy and the chasm in one view. Station 1 needs the Yuni's farms and the Cradle's people decided first. Station 5
needs the salt-crust hazard.

**Records to fix** when the kit starts (the brief for the records, not this plan's edit):
- every station's `atm`;
- `loom`: `floor` 568 m and `chasm_depth` 180 m (the floor is 264 m; a slot's depth is the page's);
- `caelum`: `playa_level` 344 m (it is 240 m) and Lake Nim's `area_km2` 45 (it is about 500);
- `region98_99.json` still holds Region 99's older 10-vertex outline.

## 8. Core adoption (written first, as the working rules ask)

Start from the nearest finished kit: `biomes/copperglacier`, with the scablands' coulee for `KGEODE` and spiderlake for `KSPAN`
when they are built.

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the land | `KRELIEF` (`38`, `38c`) | `terraces` for the Cradle; `scarp` and `relay` for the Weave-Step; `stepcut` for the slots and the walls' steps; `volcano` for Caelum; `gully` for the wadis; `runout` for the talus; `KRELIEF.waters` for Lake Nim |
| strata | `KSTRATA` (35), `KSTRATA.vary` and `drape` (35c) | the flood basalts in every wall, columnar in the faces; the loess and tuff of the Cradle; the evaporite crust |
| geodes | `KGEODE`, `KSPELEO.AMETHYST` | the Weave-Step's geodes and the walk-in one in a chasm wall |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | loess, pavement, fans, salt as documented masks; relief on every station; the far rims and Caelum as far masses |
| frost | `KFROST` (42) | Caelum's upper flanks |
| water | `core/water`: `WATER.open`, `flow`, `W.pan` (the `brine` look), `WATER.spring` | Lake Nim, the three perennial rivers, the playa and its brine pools, Caelum's and the Cradle's vents |
| cables | `KSPAN` (`core/biome/45-core-span.js`) | `solve` (with `up` for the pioneer shoots), `strands` for the tiers, `tension` for the anchors; anchors found by rays at the drawn rock, never at `terrainH` |
| flora | `core/biome` | the cable spinner and the playa's species in this kit; the neighbours' read in place (section 4) |
| crops | `kits/crops` (`CROPS.forBiome`, `at`) | the Cradle's fields |
| sky, weather | `core/atmos` | the standard sky; the shimmer over the floor (`fx/89-atmos-fx-shimmer.js`); the dust season |
| hazards | `core/hazard` (`KHAZ`) | section 6; every record in `core/tags` before it is drawn |
| fauna | `kits/fauna` | the cable-stryder and the halite sifter, as `BIO.record` records |
| the Stalkers | `kits/mechs` (`KratorMechs`, culture `stalker`) | placed as hazard records by this kit, drawn by the mechs kit |
| camps, settlements | `core/camp`, `core/hamlet` | caravan and salt camps; the Cradle's farms and Mungo; Spindle Fan is a Yuni settlement (`settlements/yuni`'s pieces) |
| resources | `kits/resources` (`KRES`) | sulphur at Caelum; *proposed* saltpeter on the playa's margins (the Atacama's nitrates form in such basins); read the geology bake at the build |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city | `core/city` | no |

**Core amendments** (none is a new module; all but the last are listed by other plans: cite them):
1. **A chasm head for `stepcut`**: a graben whose depth tapers to nothing and ends in an amphitheatre (Mid Basin's amendment 3).
   The slots need it at both ends.
2. **Hazards:** a crust that breaks underfoot (the playa); a flood that runs a gorge on a cycle (the wadis and slots).
3. **Geothermal surfaces** (fumaroles) at Caelum's summit (`core/water/README.md`, "Not here (yet)").
4. **The player-settlement registry** (open world).
5. **Kit-side, not core:** the living cable as a record on `KSPAN` (anchor, shoot, cable, tier; its growth stage choosing
   `up`). It is this kit's species file. If spiderlake's silk wants the same record, it can move to core then.

**Model amendments** (the scale model, the owner's to authorize):
- the rivers' stale lake destinations (593-666 m);
- the water budget (section 1);
- Caelum's vent `floor`;
- Reed's height;
- the region's empty `notes`;
- the overlaps with the Great Chasm (1,509 cells) and the Stalker Gate (3,426), if they are not meant.

## 9. For the owner

- **The water:** Ostrukh Riba's 340 m³/s onto a desert floor with a 500 km² lake. Cut the river (Mid Basin's plan questions its
  course), or grow Lake Nim to several thousand km² (a real terminal lake, as the Danakil's were)?
- **The Cradle's people:** Yuni colonists, or an older people under Yuni rule? Who lives at Mungo? Reed stands on airless
  ground: move it, or remove it?
- **Namakiers:** keep the playa's salt as crust and pinnacles (proposed), or add a buried salt layer so salt glaciers can flow?
- **The cables:** spans of 100-300 m across slots (proposed), with the great chasms open; or does the owner want longer spans?
  At 2-20 km the chasms are beyond any cable.
- **The Stalkers:** do they hunt in the canopy (v2), or keep to the sand and the roads as the lore has them?
- **Caelum:** a Hearth field at the summit vents, or the cable spinners' parent colony alone?
- **Names:** "the Loom", "the Shuttle Mesas", "the Weave-Step", "the White Loom", "Lake Nim" and "Mount Caelum" are Gemini's
  English. Do they get Yuni names, like the rivers?
- **Order:** after the integration pass. Mid Basin and the Great Chasm read this kit's species, so its species file (the cable
  spinner, the stryder, the sifter) should come before either.

## Changes from the plan v2 (2026-10-28)

- **The terrain was carved in 4.24** (`edit_424.py`), not by the `edit_loom_chasms.py` sketched in v2's section 6. That section
  and its assertions are dropped:
  - the "minimum spill elevation over 3,850 m on the perimeter" was never the model's: the Great Chasm's sill (1,550-2,000 m)
    and Mid Basin's corridor are lower;
  - the "Lake Nim 35-55 km²" check does not match the model's 500 km².
- **Numbers from the data:**
  - the area is 306,000 km², not 386,000;
  - the Cradle stands at 2.2-2.9 km;
  - the chasms are 1.0-1.3 km deep and 2-20 km wide;
  - Caelum is a 3.3 km shield;
  - Lake Nim is 500 km² at 240 m;
  - the floor is about 24 °C, not 16 °C;
  - every station's air was wrong;
  - the rims are 6-11 km and airless, not 5.2 km.
- **The 180 m chasms** become the page-scale slots that the cables span.
- **Buoyancy** carries the pioneer shoots, not the grown cables.
- **Namakiers** are dropped unless the owner adds a salt body.
- **Station 4** is split into Caelum and the White Loom.
- **Added:** people, life by zone, dangers, the core adoption, and the neighbours (Mid Basin, the Great Chasm, the Yuni, the
  Stalkers).

## Sources

- the plan v2 and the station records in this folder (Gemini, 2026-10-28);
- `tools/scale-model/README.md` "4.24" (Part I, Region 99) and `history/edit_424.py`; `HANDOFF-GEMINI-5.1.md` (the records'
  conversion, the re-survey);
- the model's data at dfdf64d1a (`gemini/scale-model-5.1-r3`), read with `smodel.page`: heights, water, `tm`/`tw`/`tc`/`p`/`c`,
  `rivers.json`, `vents.json`, `tubes.json`, `model/src/51-region-store.js`, `model/src/60-settlements.js`;
- `biomes/midbasin/PLAN.md` (2026-11-09) and `biomes/greatchasm/PLAN.md` (the expansion in progress, read 2026-11-09);
- `core/biome/45-core-span.js` (`KSPAN`), `core/README.md`, `HANDOFF-REBUILD.md` (the 2026-11-03 pieces: `terraces`, `KSPAN`);
- `biomes/CRYSTAL-CAVES-5.1.md` (site 3), `biomes/KARST-SITES-5.1.md` (the White Loom);
- `LORE.md` (§4 Hub 01 and the Stalkers; the Yuni), `kits/mechs/README.md` (the Stalkers);
- `biomes/hearths/PLAN.md` (the native body, the hexapods, the sites a hearth wants).
