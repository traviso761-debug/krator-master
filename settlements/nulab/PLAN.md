# Nulab, the Realm of Dalab's city on the great lake: a site plan (proposal, 2026-11-16)

**The owner, 2026-11-16:** Nulab is **about 10,000 people, with a rural basin around it**. The West Rift scope
(`core/region/WEST-RIFT-SCOPE.md`, section 3c) counts **50,000 rural people (est.)** across the lake basin: 2.5 times the
20,000 of Nulab and Ledge together.

What is settled, from the owner, the lore and the census:
- **The pin:** `ssk1wsnjjd`, a city at **px 443,1359** on scale model 5.1 (2 km a pixel), on the great lake's south shore.
  The record has no notes (`tools/scale-model/model/src/60-settlements.js`). The name is tentative, like every Rift name but
  Ledge, Arccube and Pluton (`biomes/riftrim/PLAN.md` section 5).
- **The polity:** the Realm of Dalab. The pin also falls inside the `Fellgangs` polygon, and the two political polygons overlap
  here (`51-region-store.js`: `The Rift`, `w rift highland`, `Fellgangs`, `Realm of Dalab`).
- **Its place on the Line:** **station 5, the lake station** (the owner, 2026-11-11; `biomes/line/PLAN.md` section 2.1 on
  `claude/loj-twenny-059a5e`). The stations are 4 Ledge's lifts (Loj Fower), 5 Nulab, 6 Chimes. East of Chimes the Line is
  unworked.
- **The Great Caravan** stops here once a year in summer, around year day 211, between Blakhed (~159) and Shelf (~263). In
  `XAN_TUNE` (`core/region/data/xan-tune.js:163-176`) the stop is the off-map stand-in `gate.dalab.nulab`.
- **PLAN-POLITICS** (`core/simulation/PLAN-POLITICS.md`): the Fellgangs raid southern Dalab (a raid zone), and "Fellgangs might
  try the same for Nulab" (rising 8). "The west rim and Nulab" also take refugees "when the Tungangers are cooperative" (l.203).

Everything else here is *proposed*. Every figure marked (est.) is my estimate, with its basis given beside it.

## 0. Where this stands (2026-11-16, the build session)

**Settled by the owner:**
- **Salt** (question 4): the drovers are a major salt source, from the western fells' high salt basins (`basin:104` and
  `basin:32`, halite at 327-355 x 1335-1359, 197 km west; `core/region/WEST-RIFT-SCOPE.md` section 4.4 item 1). Salt comes
  down by drove to Blakhed's market and Ledge's head, and on to Nulab by the lake or by the stair. Options 1, 2, 3 and 4 of
  section 5.3 are dropped: the map has no salt and no gypsum within 120 km.
- **Size:** a lake town over 500 is laid out in full on `core/city`, and that rule holds for big towns generally (section 7b).
- **20,000 in the town** (the owner, 2026-11-16: "with the town pop distributed between different zones i think we can raise it
  to 20k"). The town is laid as two `core/city` instances (the town from the mound to the quays; the copper works across the
  river at the outlet) and the Line quarter on the main shore. Every per-quarter figure in section 3.2 doubles (est.). The food
  balance of section 5 is recomputed for 20,000 in `data/nulab-sim.js`: Nulab eats 3,000 t of grain, not 1,500, and with the
  farmers' wards' 1,900 hands alongside the basin's 12,000 the surplus stands at about 3,900 t (still above the exports). **Open:** the scope's rule puts the basin at 2.5 times Nulab and
  Ledge together, which would make it 75,000 at 20,000 + 10,000; this plan keeps the basin at 50,000 until the owner says.

**Settled by the owner, 2026-11-16: "agree with the answers to the questions"**: every answer in this table (it was
written as the plan's recommended answers, marked proposed, and the owner took them all):

| Q | Taken | What it moves if overturned |
|---|---|---|
| 1 | The town on the rise at the pin; the harbour on the bay shore below it; the copper works at the outlet | the whole layout (`src/41-nl-town.js`) |
| 2 | The viaduct fallen in the deep middle, its stubs standing in the shallows; the Nulab-Chimes tunnel worked by the Union to the first gap; a loj, **Loj Faiv**. Only the station's site is reserved here (a pending box); the station, the stubs and the loj are step N6 | the Line quarter's records |
| 3 | 46,000 of the basin's 50,000 are Nulab's; 4,000 on the north shore pay their tithe to Ledge | the sim records' districts (`data/nulab-sim.js`) |
| 5 | The rare earths lie unworked until the Union is licensed (no works drawn) | nothing drawn |
| 6 | Copper from the near rift fill, smelted at the outlet; the skarn hamlet's ore comes down the Kould road too | the works' records |
| 7 | Tin by the Line from the north | the sim's roads |
| 8 | No wall: an earthwork ring round the mound's precinct and the granaries; ~300 soldiers, ~60 of them Giants, in two barracks | the town's ring |
| 9 | A priest governs (the **Warden of the Lake**, *proposed* title), from the earth-walled manor on the mound's west side; the mound faces the lab, 7.7° east of north, across the bay and the lake to Ledge | the court's records |
| 10 | The gene farms breed rim crops and the lizards; one monster pen, at the ranch | the `gene` focus |
| 11 | The Great Caravan comes down the stair from Blakhed and goes on by the lake and the lifts; its ground is at Nulab, by the market | the caravan ground |
| 12 | "Nulab" kept; the lake unnamed (the page calls it *the great lake*); the outlet's port unnamed | labels only |

The batch put to the owner (the town on the rise, the Line at Nulab, the earthworks, the governor, the names) is answered
by the same message. No question of section 10 is open.

**The site at 1:1** (the scale model read through Catmull-Rom over its 2 km cells, as `core/world` and Kirstabal's page
read it; `src/39n-nl-model.js`):
- The pin's cell is on the **west bank of the lake's south bay**, not on the main shore. The bay is the lake's arm 6-8 km
  wide (px 444-447, y 1357-1358, bed 288-294 m) reaching south from the main lake; its west shore runs about 1.8 km east of
  the pin, its head about 1 km north-east of the outlet. The main south shore is 5.7 km north of the pin.
- The ground falls about 20 m a km east from the pin to the bay and to the plain of the Chimes Riba (300-320 m), and rises
  west and south to the walls.
- **The page's frame** is centred at **px 443.45, 1358.45**: x east and z south in metres, y absolute metres. The pin is at
  (-900, 1100), the harbour's quays at about (900, -1200), the outlet at (5500, 2100).
- **The wind:** the model's `wd.png` holds the wind's power and speed, not its direction. So "the works downwind" cannot be
  read from the model. The works stand at the outlet, 5.5 km east of the mound, across the river (*proposed*).

Sources:
- `core/region/WEST-RIFT-SCOPE.md`: Nulab's row, the basin district, the routes and flows, W0-W6.
- `LORE.md` section 6.1: Dalab (l.206-235), Ledge and the Tungangs (l.236), the Fellgangs, Blakhed and the western peoples
  (l.264-284).
- `settlements/dalab/` `README.md` and `DESIGN.md`: the Dalab set.
- `biomes/line/PLAN.md` (`git show claude/loj-twenny-059a5e:biomes/line/PLAN.md`), sections 2.1-2.3 and 5.
- `biomes/riftrim/PLAN.md`: the 5.1 survey, the great lake's basin (4.22), the veiled rim's flora (section 3).
- `kits/tungang/PLAN.md` 1.3.3-1.3.4: Blakhed, the drovers, the pass-keepers, the coppersmiths, the skarn.
- The census: `openworld/RESOURCES-SETTLEMENTS.md` (Nulab's row, l.255; salt l.341; iron l.374; the rich deposits l.445) and
  `openworld/TRADE-GOODS.md` (copper, bronze, rare earths, salt, timber, staples, gene-craft).
- `core/region/data/xan-tune.js`: the diets (`T.diet`) and the Great Caravan.
- `core/hamlet/README.md`, `14-hamlet-farmland.js` (`KHAMLET.FARM`), `20-hamlet-cultures.js` (`KHAMLET.FOCI`),
  `fellgang/README.md`; `core/city/README.md`; `core/water/README.md`.
- The model, read with `tools/scale-model/smodel/page.py` (`load`, `heights`, `water_levels`, `raster`):
  - `h.png` is 16 bits over **lo -2,600 m, hi 27,000 m** (R high byte, G low byte), and B > 127 marks water;
  - `wl.png` holds the water levels;
  - `tm`, `tw`, `tc`, `th` and `tl` are °C + 90 (mean, warmest month, coldest month, hottest afternoon, coldest night);
  - `p.png` is byte / 255 x 4,000 mm; `c.png` indexes `climate.json`'s classes;
  - `rivers.json` gives the courses, beds and flows;
  - slopes are central differences on the 2 km grid; air is 1.6 e^(-h/8,000) atm.
  The survey scripts were scratch and are not committed.

## 1. What Nulab is

**The Realm's breadbasket beyond the Wall.** Dalab holds the rim "tenuously" (LORE 6.1, l.236): every supply train over the
Outer Wall is an expedition. Ledge is the bridge, on the cliff 1.3 km over the lake, where the Line and Dalab's road come
out. **Nulab is what makes holding Ledge worth it.** The basin below the cliff is "the warmest, most farmable ground on the
rim, where Dalab's hold could grow its food" (`biomes/riftrim/PLAN.md`, 4.22). The census ranks it:

| What | Census (`RESOURCES-SETTLEMENTS.md`, `TRADE-GOODS.md`) | Note |
|---|---|---|
| Farmland | **1,654 farm-eq km²** in its 30 km reach (1,772 km² over .5) | third in the map's pulses (helix bean); staples ashroot, giant lotus root, helix bean; high-value coffee, lotus silk, mist tea |
| Fibre, dye, reagent | first in sea-linen flax, vale mulberry and valley woad; second in lotus silk, mist tea and camphor | with Tallwalls, the map's silk-and-tea ground |
| Fish | 1,311 (lake 928 km² in reach, the Chimes Riba) | Ledge 745 |
| Fresh water | 318, second on the map (the Chimes Riba, 973 m³/s) | |
| Timber | 1,190 | Dalab's planted cork oak and cedar (riftrim section 3) |
| Copper | **53.2** node-yield, second on the map; **175 t a year**, third producer after Erehwon and Zey'danin | rift fill, peak 120 |
| Bronze | 17 t a year, second after Ledge (27) | the Realm makes 62 % of the map's bronze |
| Rare earths | **40.6, the best on the map** (1,876 km² rich); 8.4 t a year in the census | **Dalab may not extract them**: only Tungangs, within ~5 km of a bore (TRADE-SCOPE 2.4) |
| Iron | good iron (100+) 32 km south, at 443,1375 | |
| Gene-craft | 80 units a year, second in the Realm after Dalab (600) | |
| Salt | **0**: good rock salt 179 km off, at 354,1348 | a customer: 77 t a year at 8,000 people |

**Its people.**
- **Dalabites**, green-skinned and photosynthetic, in Dalab's four castes: peasants in rammed earth and thatch, traders in
  timber frames, nobles in grey megalithic stone, priests in temples on the mounds (LORE 6.1).
- **Genepriests.** Nulab's gene-craft (80) is the Realm's second. *Proposed:* the basin is where the priests breed for the
  rim. They grow Dalab's crops for a basin at 1.5 atm and 16 °C, and they keep the gene stock that Ledge's gene bank collects
  from the rim's flora (LORE l.236). Ledge collects; Nulab breeds and grows. As at Daranch, the "true center of their
  experimental breeding program" at home, the work is done on gene farms.
- **Giant guards.** The priests keep four-armed ceremonial guards at the temples and two-armed street patrols in threes.
- **Others, few** (*proposed*):
  - the Tungangs who keep the Line's station, a small loj (section 3);
  - Travellers at the caravan ground;
  - Fellgang traders down from Blakhed with ice, eggs and rope.

**Its works:** the farms of the basin, the lake's fish, copper and bronze, gene-craft, and the granaries that feed the Rift.

**Its role in the Realm** (the scope, sections 4.2-4.4):
- It is the one food surplus in the West Rift. **It feeds Ledge (10,000), Blakhed (5,000), the skarn (400) and the
  Union's grain by the Line (~1,200 t a year, est.).**
- **Its tithe is Dalab's main revenue in the Rift**, with Blakhed's toll in kind, gene-craft and its share of the Great
  Caravan.
- **Grain is the Realm's lever over the Union, as the lifts are the Union's over the Realm.** Nulab's granaries are where
  that lever is kept.
- **It is the Fellgangs' prize** (rising 8). It is the richest town on the rim and the lowest, with the Fellgangs' fells on
  three sides above it.

## 2. The site in numbers

### 2.1 The pin

| | |
|---|---|
| Ground | **344 m** at the pin, **47 m above the lake** (297 m); slope **13 m a km** (1.3 %) |
| The water | the nearest lake cell is 444,1358, **2.8 km NNE**. The shore cells round the pin (438-448, 1357-1358) stand at 325-345 m: a low bank 30-45 m over the water at 2 km a cell, to be shaped at 1:1 |
| The lake off the pin | a shelf, then a drop. Along x 443 the bed is 295 m 2 km out, 276 m (21 m deep) at 4 km, 242 m at 6 km, 189 m (108 m deep) at 8 km, and **-165 m (462 m deep) at 22 km** |
| Within 5 / 10 / 15 km | 305-410 m / 299-513 m / 299-603 m: the gentlest ground on the lake |
| Climate | **Csa**, mean **18 °C** (warmest month 26, coldest 9; hottest afternoon 32, coldest night 3); **1,129 mm** of rain (1,553 mm over the lake); air **1.53 atm** |
| Lab bearing | Dalab's lab (477,1108) lies **507 km away, 7.7° east of north**: across the lake, over Ledge's cliff and the Wall. A mound that faces the lab looks across the water at Ledge |

Krator's settlements lie near 40° S, so the sun stands in the north. A north-facing shore takes the sun all day, and the
cliff and the Wall stand against it.

### 2.2 The lake

| | |
|---|---|
| Area | **2,336 km²** (584 cells), px x 422-453 by y 1331-1358 |
| Level | **297 m** (`wl` 297.4) |
| Depth | 462 m on x 443; 556 m at the deepest (riftrim's 5.1 survey). The pages draw riftrim's 573 m, as that plan rules |
| Shape | about 54 km north to south and 62 km west to east. Ledge's cliff is on the north shore (437,1331), Nulab on the south (443,1357). The **outlet is at the lake's south-east corner, 446.2,1359.5: 6.5 km east of the pin** |
| Inflows | the **Kould Riba** (r081, "cold river", old name Daranchriba), 95.7 m³/s off the west rim, enters at 434.2,1353.5, **18 km WNW of the pin**. The **Swift Riba** (r048), 81.6 m³/s, falls off the north rim into the lake under Ledge at 442,1335 |

### 2.3 The Chimes Riba (r005), the outlet

| | |
|---|---|
| Flow | **943 m³/s** at the outlet, 1,086 at the trough lake; 148 m wide, 5 m deep; 110 km long. The census reads 973 m³/s in Nulab's reach |
| Course | from the outlet south-east across the plain, on a **level reach at 299 m for about 70 km** (the model's bed: 448,1363; 454,1371; 460,1379; 464,1387). It reaches the brink at 467.5,1394.5 (187 m), then falls through the gorge past Chimes: -873 m, -1,534 m at 470,1398, -1,796 m at 474,1401.5. It ends in **the Rift's trough lake** (448 km² at -1,862 m, XV, 31 °C), which drains on east by the Tarn Warra |
| The gorge | riftrim station 4: **about 1.9 km down in 12 km**, under shoulders to 2.96 km |
| Tributaries in the basin | Apa Brod Bruk (12.6 m³/s, joins at 450,1365.5); Big Silba Bruk (25.4, at 454,1369.5); **Blak Riba** (42.7, at 454,1371.5: Blakhed's river); Wait Riba (31.0, at 456,1373.5) |

The level reach makes the river **a waterway from the lake to Chimes**. Boats can work about 70 km of it down to the brink.
This is *proposed*: the model's flat bed is the river audit's fill, and the 1:1 river may want a few rapids.

### 2.4 The basin

**The basin** is the land under 1,300 m connected to the pin, in the box x 417-472, y 1331-1396. It covers **6,568 km²**;
riftrim's 4.22 note gives 6,449 km² of new land.

| Band | km² | Under 25 m a km |
|---|---|---|
| 250-500 m (the lake plain) | 1,504 | 864 |
| 500-750 m | 1,648 | 748 |
| 750-1,000 m | 1,480 | 392 |
| 1,000-1,300 m (the walls' foot) | 1,936 | 752 |
| **All** | **6,568** | **2,756** (4,952 under 50 m a km) |

- **Climate:** Csa on 5,856 km² and Cfa on 712. The mean runs 15-18 °C (10th to 90th percentile; median 16). Rain runs
  941-1,176 mm (median 1,035).
- **By side:**
  - west of x 432 (the Kould Riba's valley and the west shore): 1,680 km²;
  - east of x 452 (the Chimes Riba's valley): 2,712 km²;
  - north of y 1350 (the north and west shores, under Ledge): 564 km².
- **South, along x 443:** the plain rises from 344 m at the pin to 682 m at 20 km (y 1369), 924 m at 32 km (the iron, y 1375)
  and 1,158 m at 44 km (y 1381). Then the **south wall** rises 2.4 km in 20 km: 1,356 m at y 1383, 2,167 m at y 1385, 3,327 m
  at y 1389, 3,588 m at y 1391. Above it is the 3.6 km shoulder where Blakhed stands.
- **West, along y 1359:** the wall falls from 3,603 m (x 411) to 1,172 m (x 420), 2.4 km in 18 km. The plain runs from
  x 420 to 465.
- **East, along y 1359:** the wall rises from 1,049 m (x 465) to 3,737 m (x 477).
- **So the basin is a bowl about 90 km across.** Its walls stand 2.4 km high on the west, south and east, the lake and
  Ledge's 1.3 km cliff close it on the north, and the one way out is the Chimes gorge in the south-east corner.

### 2.5 The neighbours in numbers

| Place | Px | Ground | Climate | Air | From Nulab (straight) |
|---|---|---|---|---|---|
| **Ledge** (the cliff top) | 437,1330 | 1,563 m, 440 m a km (the cliff) | Cfa, 15 °C, 878 mm | 1.32 atm | **59 km N**; the lifts' foot (437,1331) to Nulab's shore (443,1357.5) is **54 km of water** |
| Good iron (100+) | 443,1375 | 924 m, 25 m a km | Csa, 15 °C | 1.43 | **32 km S**, on the plain |
| **The Dalab skarn hamlet** | 416,1377 | **3,583 m**, 61 m a km | Dsb, 3 °C (16 / -10), 910 mm | 1.02 | **65 km WSW**, up the west wall |
| The east skarn (unworked) | 475,1373 | 2,825 m, 225 m a km | Dfb, 8 °C | 1.12 | 70 km ESE (the census's rich copper district, 240 peak, 476 km² rich, "Nulab 69") |
| **Blakhed** | 441,1400 | **3,653 m** | Dsb, 3 °C, 894 mm | 1.01 | **82 km S**, on the shoulder above the south wall |
| Chimes (station 6, a ruin) | 468,1392 | 243 m | Csa, 21 °C | 1.55 | 83 km SE |
| The western Hearth vent | 430,1388 | 3,735 m (floor) | | | 64 km SSW |
| The drovers | 393,1338 | 3,676 m | Dsb | 1.01 | 108 km W |
| Good rock salt | 354,1347 | **5,946 m** | ET, -11 °C, 282 mm | 0.76 | **180 km W** |
| Loj Twenny | 457,1269 (pin); 445,1266 (planned) | | | | 182 km; 186 km from the planned pin |
| The Hearth hold | 525,1400 | 3,736 m | Dsc | 1.00 | 183 km E |
| Wildcat | 427,1453 | 3,427 m | Dsb | 1.04 | 191 km S |
| Tallwalls | 650,1268 | | Dfb | 1.25 | 452 km ENE |
| Dalab | 477,1108 | 591 m | | | 507 km N |

## 3. The city of 10,000 (all of it *proposed*)

### 3.1 Where it stands

**On the low rise at the pin, with the harbour quarter on the shore 2.8 km north and the river port at the outlet 6.5 km
east.** The rise is 47 m above the lake, dry and flat (13 m a km). It is the highest ground within 5 km of the water: a
mound on it is seen from the whole south shore and from the lake. The shore below has the shelf for a harbour (2 to 20 m of
water for the first 4 km). The outlet is where the river boats and the gorge-stair traffic load.

**Footprint (est.):** about **3.5 km north to south by 2.5 km**, from the quays to the mound's precinct, plus the works at
the outlet. A Dalab town of round huts in yards is sparse: about 100 people a hectare in the wards (est., from the Dalab
one-storey round huts in yards), so the 10,000 need about 1 km² of house ground. Streets, yards, the precincts, the granaries
and the market take the rest.

**No wall at first** (*proposed*; the owner's call, question 8). The Realm's towns at home are open round their mounds. Nulab
answers the rising risk with a garrison and watch towers on the roads, and an earthwork ring round the mound and the
granaries only. That is the High Priest's ring bank at small scale (`dalab_high_mound`'s ring).

### 3.2 The quarters

| Quarter | Where | What is in it (the Dalab set's keys where it has them) | People with households (est.) |
|---|---|---|---|
| **1. The mound and the priests' precinct** | on the rise at the pin | the ceremonial mound facing the lab, north across the lake (`dalab_mound`, at the outlying towns' r 30 / 13 / 13 or larger); the plaza with its fire at the foot; the priests' compound (`dalab_priest_compound`), priests' houses, steles and banners | 500 |
| **2. The gene-houses** | east of the mound, upwind of the works | a daughter house of the Halls of Reformation (a smaller `dalab_halls`: section 6), the healers' hall (`dalab_healers`), the vats, the gene stock's seed store and bed gardens, the monster pen (as `dalab_ranch`'s) | 600 |
| **3. The governor's court and the tithe** | on the mound's west side | the governor's earth-walled manor (`dalab_noble_c`) and the nobles' stone halls (`dalab_noble_a`); the scribes' hall (`dalab_scribes`) where the basin's tithe is counted; the bath house | 400 |
| **4. The garrison** | between the mound and the south road | the Giants' barracks (`dalab_barracks`); watch towers (`dalab_watchtower`) on the south and west roads and at the outlet; the gate (`dalab_gate`) where the earthwork crosses the road | 700 (~300 soldiers, ~60 of them Giants; est.) |
| **5. The harbour** | the shore below the rise, 2.8 km N | quays and a mole out over the shelf, boat sheds, the lake ferries to Ledge's lifts, the fish market, drying and smoking racks, a shipwright's slip, the cork-float and net makers | 1,800 |
| **6. The granaries** | by the harbour, on the road up | granary rows (`dalab_granaries`) and warehouses (`dalab_warehouse`), the tithe barn, the carriers' yards; the grain goes out by boat to Ledge and by river to the Blak Riba landing | 500 |
| **7. The copper works** | at the outlet, on the river's east bank, downwind (the model's wind is to be read at N2) | ore yards, roasting beds, smelters and a bronze foundry, charcoal and peat yards, the smiths (`dalab_smithy`, `dalab_workshop`) | 1,100 |
| **8. The market, the trades and the caravan ground** | between the mound and the harbour | the great market (`dalab_market_large`), shop rows, the travellers' inn (`dalab_inn`), the tavern; potters, weavers (lotus silk, sea-linen, mulberry silk), woad dyers; **the caravan ground**, a fenced field where the Great Caravan camps each summer (about day 211) | 1,900 |
| **9. The Line quarter** | the shore west of the harbour, where the lake viaduct came ashore | **station 5**: the Ancient station on the shore and the stubs of the viaduct's piers walking out into the lake; Dalab's station factor and clerks; the Union's house. The Line's tunnel toward Chimes leaves from here (section 5) | 100 Dalabites, beside **Loj Faiv** (*proposed* name for the 5th station's loj: ~150 Tungangs, est., counted in the Union's 20,000) |
| **10. The farmers' wards** | round the rest, out to the fields | round earth huts, scrap huts, family compounds, terrace rows and tenements (`dalab_hut_a`, `_b`, `_c`, `dalab_compound`, `dalab_rowhouse`, `dalab_tenement`), well courts, earth yards, orchard plots; the people who farm within an hour's walk | 2,400 |
| **Nulab** | | | **10,000** |

**What the town looks like** (from the Dalab design rules, *proposed* for this site):
- The mound on its rise faces north over the water to Ledge's cliff, so the ceremony is held facing the lake, the cliff and
  the sun.
- The God's cold teal-white light burns only in the precinct, the gene-houses, the court and the barracks (`lit` on priest,
  noble and civic). The harbour and the wards burn fire, and at night the quays read as a line of hearths under the teal
  points on the rise.
- The red marks what is holy. Stone is only for the priests and nobles; the rest is earth, thatch, timber and salvage. The
  salvage here is the Line's: viaduct steel and station plate.
- The flora is the veiled rim's shore zone: Dalab's planted cork oak, tier cedar, bay laurel hedges and coppiced veil willow
  on the shore, with veil thread hung in the trees (`biomes/riftrim` section 3).

## 4. The basin round it: 50,000 rural people (est.)

### 4.1 Four districts (*proposed* split of the scope's 50,000)

| District | Ground | People (est.) | Density | Looks to |
|---|---|---|---|---|
| **The south plain** (Nulab's own: the lake shore to the south wall's foot, x 432-452) | ~1,600 km²; the best of the 250-750 m bands | **28,000** | ~17 a km² | Nulab |
| **The Kould valley and the west shore** (x < 432) | 1,680 km² | **8,000** | ~5 a km² | Nulab (by the lake and the Kould road) |
| **The Chimes Riba valley and the east plain** (x > 452) | 2,712 km², much of it over 750 m | **10,000** | ~4 a km² | Nulab (by the river) |
| **The north shore under Ledge's cliff** | 564 km² | **4,000** | ~7 a km² | **Ledge** (its tithe to Ledge, its fishers Ledge's) |
| **The basin** | 6,568 km² | **50,000** | ~8 a km² | |

The densest ground is nearest the city and the water. A third of the basin, the walls' foot over 1,000 m, is left to tea,
camphor, orchards, cork, pasture and the gene farms.

### 4.2 The villages, by `core/hamlet` (est.)

`KHAMLET.village` caps a village at 500 people. So 50,000 people is about 130 villages and the farmsteads between them.
`KHAMLET.FOCI` already has `farming`, `fishing`, `ranch`, `mine`, `lumber` and `clay`; two kinds are new (section 6).

| Kind | Focus | Where | Villages (est.) | People each (est.) | People (est.) |
|---|---|---|---|---|---|
| **Shore and plain farms**: rice, lotus root and wild rice on the lake flats; helix bean, ashroot and grain on the plain | `farming` | the 250-750 m bands, south and west | 72 | 420 | 30,200 |
| **Tea, silk and fibre villages**: mist tea, mulberry and lotus silk, sea-linen flax, woad, camphor | `farming` (crop rows from `kits/crops`) | the 750-1,300 m bands, the walls' foot | 14 | 350 | 4,900 |
| **Fishing hamlets** on the shore, at the Kould's mouth and on the Chimes Riba's level reach | `fishing` (with a `landing`) | the south and west shores, the river | 24 | 300 | 7,200 |
| **Gene farms**: the priests' breeding stations (Daranch's pattern) | **`gene`** (*proposed*, new) | the Chimes Riba's valley, apart from the plain | 6 | 250 | 1,500 |
| **Lizard ranches** (the Dalab lizard; draught and meat) | `ranch` | the upper plain, the east | 8 | 250 | 2,000 |
| **Lumber**: cork groves, cedar, willow coppice, charcoal for the works | `lumber` | the walls' foot, west and east | 6 | 220 | 1,300 |
| **Clay and earth yards** (brick, rammed earth, the potters' clay) | `clay` | the Kould's mouth, the river banks | 4 | 200 | 800 |
| **The iron hamlet** at 443,1375 (good iron, 32 km S) | `mine` | the upper plain at 924 m | 1 | 300 | 300 |
| Farmsteads, herders, watch posts, ferry and toll keepers | (no village) | everywhere | | | 1,800 |
| **The basin** | | | **135** | | **50,000** |

**The farms** use `KHAMLET.farmland` with the Realm's tunables. `KHAMLET.FARM` defaults to the isles' shifting gardens
(`fallow: 3`). The lake plain wants permanent irrigated fields (`fallow: 0`) and the dry middle plain a year in two
(`fallow: 1`). That is the open question in `14-hamlet-farmland.js`, answered for one culture (*proposed*).

**Outside the 50,000**, and fed from it (the scope's 3b): **the Dalab skarn hamlet** (416,1377, 400 people, est.), a
`mine` village under the 500 cap. It works copper (240) and iron (210), "the best in the West Rift", and eats Nulab's food
(the owner, 2026-11-11; `kits/tungang/PLAN.md` 1.3.4).

## 5. The food balance (all (est.))

**Basis.**
- **Diets:** the East Rift tune's (`xan-tune.js` `T.diet`): a city eats 150 kg of grain and 15 kg of fish a head a year; the
  countryside 165 kg of grain; a shore village 125 kg of grain and 45 kg of fish; a camp 190 kg; a fort 180 kg.
- **Grain-equivalent** (grain-eq) counts rice, beans, roots and lotus root at their food value.
- **Yield:** 1.6 t of grain-eq a hectare a year in crop (est.). `KHAMLET.FARM` takes 8 million kcal a hectare a year, about
  2.3 t grain-eq; the irrigated lake flats bear two crops, near that figure. The dry middle plain, with one winter grain, bears
  about 1 t. The mean is weighted to the flats.
- **Hands:** 12,000 of the basin's ~20,000 working adults (40 % of 50,000) work the staple fields. The others fish, herd,
  grow fibre and tea, cut timber and work the gene farms. Each works 1 ha in crop: `KHAMLET.FARM` gives 0.75 ha by hand, and
  the Dalab lizard at the plough (*proposed*) raises that on the plain.
- **Seed and losses:** 20 % of the harvest.

### 5.1 Grain

| | t grain-eq a year (est.) | Basis |
|---|---|---|
| **Harvest** | **19,200** | 12,000 ha in crop at 1.6 t |
| Less seed and losses | -3,800 | 20 % |
| **Net** | **15,400** | |
| Nulab eats | -1,500 | 10,000 x 150 kg |
| The basin eats | -8,000 | 42,800 x 165 kg + 7,200 fishers x 125 kg |
| **Home** | **-9,500** | |
| **Ledge** | -1,000 | 10,000 x 150 kg = 1,500 t; Ledge's north-shore fields, lotus beds and fish (745) cover about a third |
| **Blakhed**, by the gorge stair | -600 | 5,000 x 165 kg = 825 t; it buys about three quarters with ice, eggs and rope. Its own herds, bell seed and eggs cover the rest; `settlements/blakhed/PLAN.md` (in hand elsewhere) may set it |
| **The Tungang Union**, by the Line | **-1,200** | the scope's 3d: a third of 20,000 Tungangs' bread, ~3 t a day |
| The skarn hamlet | -80 | 400 x 190 kg |
| Dalab's posts on the road and at Blakhed's toll | -20 | 100 x 180 kg |
| **Exports** | **-2,900** | up the lifts, up the stair, up the Kould road |
| **Surplus** | **~3,000** | about four months of what the city and the basin eat, or a year of what Nulab and Ledge eat: the granaries' carry-over for a bad year, a strike or a siege |

**Land.** 12,000 ha in crop is 120 km². With the dry plain resting a year in two, it comes to about **180 km² farmed**. That
is a ninth of the census's 1,654 farm-eq km² in the city's reach, and under a tenth of the basin's 2,756 km² of flat ground.
Fibre, tea, orchards, cork and pasture take more. **The basin is limited by its people and by what the lifts and the stair
can carry, not by its land.** It could feed several times its people. So the owner's refugee rule ("the west rim and Nulab")
has room, and so does a growing Realm.

### 5.2 Fish

| | t a year (est.) | Basis |
|---|---|---|
| The lake's sustainable catch | ~3,500 | 2,336 km² at ~15 kg a hectare a year: a deep, cool-bottomed lake with a warm shallow shelf |
| Nulab's side (the 24 hamlets and the harbour) | ~1,500 | the census's fish score (Nulab 1,311, Ledge 745) splits the lake about 2 : 1 |
| Eaten in Nulab and its shore villages | ~470 | 10,000 x 15 kg + 7,200 x 45 kg |
| **Dried, smoked or salted for Ledge, the skarn, Blakhed and the Union** | ~1,000 | salting it needs salt (5.3) |

### 5.3 Salt: short

**The need (est.):**

| | t a year | Basis |
|---|---|---|
| Nulab | 60-96 | the tune's 6 kg a head; the census's 77 t at 8,000 is 9.6 kg a head, so 96 t at 10,000 |
| The basin | 250 | 50,000 x 5 kg (the tune's rural diet) |
| Curing a third of the export fish | ~80 | ~330 t of the ~1,000 t at about 1 kg of salt to 4 kg of fish |
| Hides, cheese, the lizards' licks, the gene-houses | ~30 | |
| **Nulab and its basin** | **~420-460** | |
| Ledge (the scope: ~290 t at 10,000) | 290 | |
| **The Realm in the Rift** | **~700-750** | |

**Where it could come from** (*proposed*, in the order this plan would try them):
1. **The rift fill's evaporites.** LORE (l.168) gives the rim's natural caverns "gypsum and salt mazes". riftrim's karst
   site 6, Ledge's cliff springs, is cut in the fill's gypsum. A **salt maze or brine spring in the fill**, mined by the
   Union and sold to Dalab, would follow the rare earths' pattern: Dalab's ground and the Union's work. The census sees no
   halite here, so it would be an authored lode record (`kits/resources/data/lodes.json`), as Thalaba's sulfur lode was. It
   also gives the Union a second thing to sell for grain.
2. **The rock salt at 354,1347**, 180 km west at 5,946 m (ET, 0.76 atm). Only cold-modded Dalabites or Fellgangs can work it,
   and only in summer. It would come down past the drovers (393,1338) and down the Kould Riba's valley to the lake: about
   200 km and a 5.6 km descent (est.). A Dalab summer salt camp (`core/camp`) or a Fellgang works beside the drovers, which
   is the scope's Q5.
3. **Tallwalls** (1,420 t a year in the census, ~500 t in the scope), 452 km off. It is held by the Free Giants, Dalab's
   runaways, so only through Traveller middlemen and at a price.
4. **Dalab's heartland, by the Line.** That is 439 km of Tungang track and passage fees. It contradicts the Great Caravan,
   which carries salt *from* Shelf to Xanadu (the scope's Q5).
5. **Small ones:** brine boiled at the vents' mineral springs (430,1388 and 477,1367 are 64-70 km off, up the walls), and
   plant ash.

## 6. Its roads and water

| Route | Mode | Length (est. where marked) | Carries | Note |
|---|---|---|---|---|
| **The lake crossing to Ledge's lifts** | boats: lake ferries and grain barges under sail and oar (*proposed*) | **54 km** of water from the harbour (443,1357.5) to the lifts' foot (437,1331); about a day under sail (est.) | grain, fish, silk, copper and bronze north; salt, iron, tin, Dalab's cloth and its people south | the main road. Today the Line's 59 km viaduct is down (below) |
| **Ledge's lifts** (Loj Fower) | the Union's lifts, 1.3 km up the cliff | Ledge 59 km from the pin in all | everything between the basin and the highland | **the Union's lever** (the scope's 4.1). A strike stops the grain here |
| **The Line, station 4 to 5** | the lake viaduct: **59 km, 57 km of it viaduct and 51 km over water** (the Line plan's straight survey, section 2.2) | | | *Proposed:* **fallen in the deep middle.** The piers stand in the shallows at both ends, and their stubs are the boats' seamarks across the lake. The boats replace it, as the scope's route ("then boats") says |
| **The Line, station 5 to 6 (Chimes)** | tunnel: **83 km, 58 km in tunnel** (the straight survey); the network session routed Ledge-Chimes at 163 km and Nulab-Chimes at 92 km | | | under the basin's south-east rise. *Proposed:* **worked as far as the first gap by Loj Faiv**, for the rare earths within 5 km of the bore (question 5). Beyond it, sealed toward Chimes, where the Line is unworked |
| **The Chimes Riba** | river boats | **~70 km** of level reach from the outlet (446,1359.5) to the brink above the gorge (467.5,1394.5) | to the Blak Riba landing and the east valley's villages | boats work it; the gorge below is not passable to them |
| **The gorge stair to Blakhed** | the river to the Blak Riba's mouth (454,1371.5: **33 km**), then up the **Blak Riba's ravine** on the south wall by Blakhed's ropes and ladders | **82 km** straight, **~90 km** by the way (est.) | ice down to Nulab (Blakhed's ice houses); grain and salt up | the Blak Riba's bed: 619 m at its mouth, 1,105 m at 451,1382, **2,605 m at 450,1390** (the stair: 1.5 km in about 16 km), 3,476 m at 444,1398; Blakhed at 3,653 m. **Air 1.53 atm at Nulab, 1.01 at Blakhed** |
| **The Kould road to the skarn** | pack road up the Kould Riba (the lake mouth at 434,1355) and the Long Riba (joins at 420,1369.5) | **65 km** straight, **~80 km** by the valleys (est.) | ore and bloom down; food, charcoal and tools up | the Kould's bed falls from 2,672 m (416,1369) to 995 m (424,1366), so the west wall is 1.7 km in about 16 km. The skarn stands at 3,583 m, Dsb, 1.02 atm |
| **The iron road** | cart road across the plain | **32 km** to 443,1375 (924 m) | iron ore | the easiest of the Realm's ores in the Rift |
| **The drovers' road** | droves up the Kould valley and the west wall | 108 km straight | meat, hides, felt and wool down to "Dalab's basin" (`kits/tungang/PLAN.md` 1.3.4) | |
| **To Dalab** | the lake, the lifts, then the Line (439 km, about 2 days) or Dalab's road (528 km, about 3 weeks, est.) | **507 km** straight; about 500 km by the Line, **3-4 days** (est.) | | |

## 7. Which kits and core modules draw it

| Need | Module | How | Missing |
|---|---|---|---|
| The ground at 1:1 | `core/world` (`WORLD.H`, `ROADS`) | the basin cut by `tools/scale-model/cut_site.py` into a West Rift region (*proposed* id `west-rift-lake`: the basin, the lake and Ledge's cliff) | **no West Rift region in `openworld/SITES.json` yet** |
| The walls, the cliff, the gorge, the stair | `core/terrain` (`KSTACKS`, `KSTRATA` `rift`, `KRELIEF`) | riftrim's `rift` recipe on the walls; the stair's ravine as a gully | riftrim station 1's cliff carve (`KSTACKS.contour`, `KCARVE`) is still owed there |
| The town | `core/city` (`KCITY`) | streets and lots round the mound, `frontage-courts` on the wards' blocks, the precincts as districts; `kit.dims` and `TUNE.classes` from the Dalab set | **Dalab is not on `core/city`** (`core/city/README.md`: "Dalab ... stay as they are"). Nulab would be the first Dalab town on it, as Thalaba's mission was the first Dalab piece read in place |
| The buildings | **the Dalab set** (`settlements/dalab/src` 69d, 69e, 70-73, 72b), read in place through `external`, as `settlements/thalaba` does | dwellings, trades, civic, sacred, the marks of a hold, the town types | **New pieces** (to ask of the Dalab set): **the harbour set** (quay, mole, jetty, boat shed, slip, fish racks and smokehouse, ferry stage); **the copper works** (roasting bed, smelter, bronze foundry, charcoal and peat yards: the set has only a scrap smithy); **a daughter Halls** (the Halls are r 68, the capital's); **a gene farm** (breeding beds and pens: the ranch has a monster pen only); **the tithe barn and counting house**; Dalab's texture pack (Thalaba: "not yet") |
| Boats | `kits/ringsea` (31 vessels, one fragment each) | the lake ferries, grain barges, fishing boats and river boats | **no Dalab hull** (the kit's cultures are Hykkousoi, Iziz, Xanadu, Voth, the Islanders and the Beast Riders). Three Dalab lake hulls to ask of the kit |
| The villages | `core/hamlet` (`KHAMLET.village`, `farmland`, `resourceFor`) | the 135 villages of section 4.2 | **no Dalab row**: `core/hamlet/dalab/` as an opt-in subfolder, like `fellgang/`, with Dalab's houses, stores, shrine, `landing` (a jetty) and works by focus; **a `gene` focus** (gene farms); `farmland`'s `fallow` per culture |
| The lake, the rivers, the falls | `core/water` | `open` with a `shore` for the lake (level 297, the bed to riftrim's depth); `flow` for the Chimes Riba, the Kould and the Blak Riba (`WATER.join` at the confluences); `fall` for the Swift Riba off the north cliff and the Blak Riba's stair; `still` for the gene-houses' vats and the well courts | nothing new; the mirror switch on the lake as riftrim does |
| The Line's station 5 and the viaduct | `KTRANSIT` (`line` kind, `highway` spans and their ruin states), `biomes/line` | the station on the shore, the pier stubs, the tunnel portal | the Line plan's stations stop at 4 (Ledge); station 5 is not in it |
| The ruins | `core/ruins` (`KRUINS.watch`) | every fallen span and pier stub, seated on its lowest points (CLAUDE.md) | |
| Loj Faiv | `kits/tungang` | the loj's rooms by the station | the loj is *proposed* (question 2) |
| Flora | `core/biome`, `biomes/riftrim` (the veiled rim's `shore` zone) | cork oak, tier cedar, bay laurel, veil willow, fan tree, veil thread, mist cup | |
| Crops | `kits/crops` (`CROPS.at`, `CROPS.palette`) | what grows at 300-1,300 m, 15-18 °C, ~1,035 mm, 1.4-1.55 atm, irrigated on the flats | the census's helix bean, ashroot, giant lotus root, mist tea, lotus silk, sea-linen, mulberry, woad, camphor to check against `CROPS.at`; hashish is "transplanted by polity" to the rim (TRADE-SCOPE l.166) |
| Ores and nodes | `kits/resources` (`KRES`) | copper and rare earths on the rift fill; the iron at 443,1375; the skarn | the salt lode (5.3, option 1) if the owner takes it |
| Beasts | the Dalab set's `DFAUNA` (the Dalab lizard) | plough teams, ranches | |
| Sky, weather | `core/atmos`, `core/clock` | the standard skybox; the veiled rim's fog | |
| People | `core/charactermodels` (Dalab clothes are in `peoples.json`), `core/simulation`, `core/sched` | the castes, the Giants in threes, the Tungangs at the station | |
| Interiors | `kits/interiors`, `kits/catalog` (`krator-master-furniture-dalab.js`), `core/furnish` | | **no Dalab interiors set** in `kits/interiors/sets` |
| Dangers | `core/hazard` | the lake (`drown`), the stair (`fall`), the smelters' fumes | |
| Placement, records | `core/rand`, `core/tags`, `core/space`, `core/mask` | everything seeded by (world, cell, index, salt) and registered before it is drawn | |
| Host, tools, export | `core/host`, `core/walk`, `core/lod`, `core/export` | as every build | |

## 7b. Core adoption (written 2026-11-16, before the first fragment)

Following `README.md`, "CORE MODULES ARE NOT OPTIONAL". Started from **Kirstabal** (a lake harbour town on `core/city` and
`core/hamlet`, a target on Xanadu's page) and **Thalaba** (the Dalab set read in place on that page).

| Need | Take |
|---|---|
| The page | **a target on Xanadu's page**, as Kirstabal and Thalaba are: `settlements/nulab/build.py` runs `settlements/xanadu/build.py --kit settlements/nulab`. `build.py` and `verify.py` start from `tools/new_build/`; the build is listed under every check in `tools/checks_optin.json`. Xanadu's page brings `core/rand`, `core/tags`, `core/host`, `core/door`, `core/lod` |
| The town's streets, lots and infill | **`core/city`** (`KCITY`): two instances on a 2.5 m raster (the town over ±2.2 km round the page's origin; the copper works over ±0.8 km across the Chimes Riba at the outlet). Steps 0-5 are each zone's own (the site, the landmarks, the avenues), and steps 6-12 are the defaults. `kit.dims` and `TUNE.classes` come from the Dalab set's boxes. Sealed with `core/space` and `core/hamlet` in one closure (`gen/69n-kcity-bundle.js`), as Kirstabal's |
| The buildings | **the Dalab set** (`settlements/dalab/src` 69d, 69e, 70, 71, 71c, 72, 72b, 73, 74), read in place through `kit.json` `external`, as Thalaba reads three of them. Dalab's texture pack is trimmed to the families its pieces draw (`build.py` `DALAB_FAMILIES`); the page cap is 16 MB. The pieces the set lacks are **pending boxes**, counted and named in `KNOWN_ISSUES.md` (section 7's list): the harbour set, the copper works, the gene beds, the tithe barn, the station |
| The harbour's quays and mole | rubble-stone banks drawn by the page (they are made ground, not buildings), as Kirstabal's mole |
| The ground | **the scale model 5.1** at 1:1 (`src/39n-nl-model.js`, baked by `build.py --bake-model`; Catmull-Rom over its cells), with the harbour's basin and the Chimes Riba's channel cut into it (`src/40-nl-ground.js`). **`core/drawn`** (`KDRAWN`) registers every ground mesh. `core/world` is not taken: there is no West Rift region in `openworld/SITES.json` yet (N0); the region's session cuts it |
| The lake and the river | **`core/water`**: `WATER.open` for the great lake (level 297.4 m, its bed the ground), `WATER.flow` for the Chimes Riba from the outlet down the level reach |
| Sky | **`core/atmos`** for the water's clock and skylight; the Krator sky (`KratorSky`) of Xanadu's page |
| The villages | **`core/hamlet`** with a new opt-in row, **`core/hamlet/dalab/23-hamlet-dalab.js`** (`KHAMLET.CULTURES.dalab` and the `gene` focus; the Fellgang row's pattern: no other page's bytes move). The near ring is laid and drawn; the basin's 135 villages are records for the sim (`data/nulab-sim.js`) |
| Flora | **`core/biome`** with **`biomes/riftrim`**'s veiled rim (`RRIM.biome('w')`), sealed in one closure (`gen/69n2-nl-flora-bundle.js`) as Kirstabal seals the Rift's. The borrowed SW-lowlands species (cork oak, tier cedar, bay laurel, veil willow) wait on the kin rows (`KNOWN_ISSUES.md`) |
| Placement | **`core/rand`** (`KRAND`: every village and field seeded by its id), **`core/tags`** (`KTAGS.page`), **`core/space`** (`KSPACE`: the flora's mask and the fields' index). No canvas is read back |
| The sim's records | **`core/region`**'s valley spec shapes (`{id, faction, people, x, z, scale, eats, works}`, the roads), as data in `data/nulab-sim.js`; the sim itself is a later step (W1) |
| Not taken yet | **`core/ruins`**: nothing ruined is drawn until N6 (the viaduct's stubs). **`core/simulation`**, **`core/sched`**: the life layer (N7). **`kits/interiors`**, **`core/furnish`**: no Dalab interiors set (N7). **`core/terrain`**: the walls are the model's far field here; the cliff carves are riftrim's |

## 8. Its record in a future West Rift sim (the scope's W0-W6)

The East Rift's spec (`50-region-valley.js`): `{id, name, faction, people, x, z, scale, eats, start, works}`. Its roads are
`{from, to | stops, legs, carriers, cap, goods, share, cut, halts, closed}`.

- **W0, the numbers and the map.**
  - This plan's figures: 10,000, the four districts, the hamlet counts.
  - The pins to queue with the scale-model session: the skarn hamlet (416,1377), the iron hamlet (443,1375), and the
    harbour if it is pinned apart.
  - The salt answer (5.3).
- **W1, `WR_TUNE`.** The rows (*proposed*):
  - **`ssk1wsnjjd` Nulab:** faction `dalab`, people 10,000, scale 50, the city diet. Its works (est.):
    - `nl.market`;
    - `nl.harbour` (fish, ~500 t a year from the city's own boats);
    - `nl.granary` (a store: the tithe and the carry-over, keepDays long);
    - `nl.copper` (copper 175 t and bronze 17 t a year, the census; tin in);
    - `nl.gene` (gene-craft, 80 a year);
    - `nl.yard` (boats).
  - **The basin as four bulk districts** at scale 200 (the X0 pattern, never drawn): `wr.basin.south` (28,000),
    `wr.basin.west` (8,000), `wr.basin.east` (10,000) and `wr.basin.north` (4,000, its `share` to Ledge). Each has the rural
    or shore diet, farms (grain), fish, fibre and tea, and a tithe (`share`) to its seat.
  - **The skarn** (400, a `mine` work, parent Nulab) and **the iron hamlet** (300, parent Nulab).
  - **Roads:**
    - the lake to the lifts' foot (`legs`: the crossing, then the lifts as a `halt` with the Union's `cut`);
    - the river and the stair to Blakhed;
    - the Kould road to the skarn;
    - the iron road.
  - **Test:** a year runs; Nulab and the basin are fed; the surplus (~3,000 t) stands in the granary at the year's end;
    Ledge's and the Union's grain is shipped; the salt gap shows.
- **W2, the Line as a carrier.** Station 5 joins the Line's segment S2 by the lake road (the viaduct is closed). The rare
  earths along the Nulab-Chimes bore are X2's veins within 5 km of the bore, worked by Loj Faiv if the owner agrees.
  - **Test:** the Union's grain leaves Nulab, crosses the lake and goes up the lifts, and reaches Loj Twenny.
- **W3, join the East Rift.** `gate.dalab.nulab` becomes `ssk1wsnjjd`. The Great Caravan lands Xanadu's goods here around
  day 211 and loads the basin's silk, tea, camphor and bronze.
  - **Test:** `test-east-rift.js` and `test-xan-economy.js` are unchanged.
- **W4, the books.**
  - Dalab's treasury takes **the Nulab tithe**: *proposed* a tenth of the districts' harvest, ~1,500 t, half of it sold on.
  - **The bargain** is a transfer: Nulab's grain and the gene-houses' medicine against the Union's passage at the lifts and
    on the Line.
  - **Test:** the tithe, the bargain and the governor's and garrison's keep balance a year.
- **W5, strikes and risings.**
  - **The strike:** the lifts stop, grain piles up in Nulab's granaries and Ledge starves first; the carry-over decides how
    long Dalab holds.
  - **The Fellgang rising at Nulab** (rising 8): a leader gathers the bands on the fells over months. They come down the
    gorge stair and the Kould road, and the garrison, the earthwork and the granaries are what they must take.
  - **Test:** a strike starves Ledge before Nulab; a rising against a full garrison fails, and against a garrison drawn off
    to Ledge it may not.
- **W6, later.** The refugees' "west rim and Nulab" destination: the basin's unused land takes them in, on the Union's
  goodwill.

## 9. Steps

| Step | What | Test |
|---|---|---|
| **N0** | **The answers and the records.** The owner's answers (section 10). Queue the pins with the scale-model session (the skarn and iron hamlets, the harbour if separate; the pin itself stays). A West Rift region in `openworld/SITES.json` (that region's session) with Nulab and Ledge as sites. The salt lode record if option 1 is taken | `cut_site.py --dry` lists Nulab; the pin's ground is 344 m |
| **N1** | **The tune rows** (W1) in `WR_TUNE`, data only (**data done:** `data/nulab-sim.js`; live `WR_TUNE` runner later) | a year runs; the food balance of section 5 (`test-nl-town.js`) |
| **N2** | **The ground** (**town page done:** `src/39n-nl-model.js`, `src/40-nl-ground.js`, `targets/town/90n-nl-world.js`; open-world region cut later): the lake on `core/water` (`open`), the Chimes Riba as a `flow`; the basin dredged at the harbour; the far walls and Ledge's cliff out to 70 km | `on-the-model` at the pin; `water`; the lake level 297.4 m drawn |
| **N3** | **The town on `core/city`** (**done, first pass**): two `core/city` instances (`src/41-nl-town.js`) with the Dalab set read in place and trimmed texture pack (`DALAB_FAMILIES`). Listed under the survey's checks in `tools/checks_optin.json`. The mound facing the lab, the ten quarters, ~19,400 residents (against the owner's 20,000). New pieces are pending boxes until the Dalab set has them | the GPU verify (`nulab-laid`, `on-the-model`, `people`, `pending`); `check_core_use.py` |
| **N4** | **The new pieces**, asked of the Dalab set's session: the harbour set, the copper works, the daughter Halls, the gene farm, the tithe barn; Dalab's sidecar texture pack. Three lake hulls asked of `kits/ringsea` | the Dalab sheet's verify; each piece's overlap and ground checks |
| **N5** | **The basin on `core/hamlet`** (**row and near ring done:** `core/hamlet/dalab/23-hamlet-dalab.js`, `src/42-nl-ring.js` — eight villages drawn with `KHAMLET.farmland` `fallow` 0 and 1; the 135-village census in `data/nulab-sim.js`; full region ring waits on N0's cut) | `node settlements/nulab/test-nl-town.js` with negatives; `ring-laid` |
| **N6** | **The Line's station 5:** the station on the shore, the viaduct's fallen spans and standing stubs (`KTRANSIT`, every wreck under `KRUINS.watch`), the tunnel portal; Loj Faiv with `kits/tungang` if the owner agrees | the ruins' float and seat checks; the station on the drawn ground |
| **N7** | **Interiors and people:** the Dalab interiors (a new set); the people on `core/simulation` (the castes, the Giants' patrols, the harbour's day, the Great Caravan's arrival) | the interiors' checks; the sim's schedules |

## 10. Questions for the owner

1. **The city's place.** This plan puts the town on the low rise at the pin (47 m over the lake, 2.8 km back), with the
   harbour on the shore and the works at the outlet 6.5 km east. Or should the town stand on the shore itself?
2. **The Line at Nulab.**
   - Is the lake viaduct (59 km, 51 km over water) fallen, partly standing, or standing?
   - Is the Nulab-Chimes tunnel worked, and by whom?
   - Is there a loj at station 5, and is it **Loj Faiv** (the station's number, after Loj Fower)?
3. **The basin's split.** Should 4,000 of the 50,000 live on the north shore under Ledge and pay their tithe there, with the
   other 46,000 Nulab's?
4. **Salt** (the scope's Q5; **settled, the owner 2026-11-16: the drovers are a major salt source**; *the map's answer, 2026-11-16, in the scope's 4.4 item 1: no salt within 120 km; the nearest
   and the safest from the Lizardmen are the western fells' high salt basins, 327-355 x 1335-1359, 197 km from Nulab*). Which source: a salt maze in the rift fill worked by the Union, the rock salt at 354,1347 at
   5.9 km, Tallwalls through the Travellers, or Dalab's own salt by the Line?
5. **Rare earths** (the scope's Q7). Does the Union work Nulab's (the best on the map) along the Nulab-Chimes bore under
   licence from Dalab, or do they lie unworked?
6. **Copper.** Is Nulab's 175 t from the near rift fill, from the skarn at 3.6 km, or both? Is the east wall's rich skarn
   (475,1373, 70 km) to be worked too?
7. **Tin for the bronze** (~2 t a year for 17 t). Does it come from the north door's granite by the Line, or from Tallwalls?
8. **Defence.** Is there an open town with an earthwork round the mound and the granaries, or a wall? Is a Giant garrison
   posted here (~60 of ~300 soldiers in this plan)?
9. **The governor.** Is it a priest or a noble, and what is the title? This plan has the mound face the lab, north across the
   lake.
10. **The gene farms.** What do the priests breed in the basin: crops for the rim, the lizards, the rim's own flora from
    Ledge's gene bank? Is there a monster pen?
11. **The Great Caravan.** By which way does it come from Blakhed (the stair) and go on to Shelf: the lifts and the Line, or
    Dalab's road? Is the caravan ground at Nulab?
12. **Names.** Has the great lake a name? Is the outlet's port named apart? Is "Nulab" (the low tongue's *nu lab*, "new
    lab"?) kept?

## 11. Found on the way (for the sessions that own them; not changed here)

- **The scope lists timber as a Nulab need.** The census gives Nulab a timber score of 1,190, and `TRADE-GOODS.md` routes
  timber *from* Nulab to Loj Twenny (41 t). The need is probably Ledge's (524). For `core/region/WEST-RIFT-SCOPE.md`.
- **The gorge stair is on the Blak Riba.** LORE and the tungang plan say Blakhed stands "where the south road tops out of the
  Chimes gorge". On the model the climb from the basin to Blakhed is the Blak Riba's ravine on the south wall (450,1390 to
  451,1382: 1.5 km in about 16 km). The Chimes gorge proper (464-470, 1390-1398) falls into the Rift, not up to Blakhed. A
  wording fix for LORE l.270 and `kits/tungang/PLAN.md` 1.3.3, or a reading of "the Chimes gorge" as the whole south-east
  corner.
- **The Line plan calls station 5 "the lake shore under the lifts".** Nulab is across the lake, 54 km from the lifts' foot;
  the lifts' foot is Ledge's own shore. For `biomes/line/PLAN.md` section 2.1 (on `claude/loj-twenny-059a5e`).
- **Two political polygons overlap at the pin** (`Fellgangs` and `Realm of Dalab`). That may be meant (the Fellgangs'
  claim, the rising), or it may be a polygon to trim. For the scale-model session.
- **The census lists Nulab's polity as "Dalab Council"** (the old polygon name). The scope and TRADE-GOODS say Realm of Dalab.
- **The Chimes Riba's bed is a flat 299 m for 70 km** (the river audit's fill). The 1:1 river will want a gentle fall from the
  lake (297 m) to the brink; the model's bed sits 2 m above the lake's level at the outlet.
