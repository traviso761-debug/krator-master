# The Firebliss Range: the plan (seed, 2026-11-09)

The Firebliss Range (`rmw8hj62nmugn`) is a volcanic cordillera on the far south-west of map 5.1, between the airless west
edge and the Labyrinth. Five ice-capped stratovolcanoes stand along its spine, at 5.4 to 6.7 km. Under them, at 1.9 to 2.7 km,
four sheltered valleys hold warm lakes. The model makes them temperate: Cfb, with one Cfa pocket. Their rivers run south-east
into the Labyrinth, and the volcanoes' ash and vapour blow the same way. The range is the warm heart of a cold country. The
valleys are 5% of its ground; the other 95% is tundra and ice at 4 to 6 km.

This is a seed. No draft of it existed: the Great Chasm and Godshearth plans cite a `biomes/firebliss/PLAN.md`, but no
branch holds one, so this plan is written from the map. Names marked **TBD** are the owner's to give, and *proposed* marks this
plan's own suggestions. Nothing is built; it is a kit for the rebuild's queue. Coordinates are 5.1 px (1821 x 1723, 2 km a
px).

## 1. What the map carves (Gemini, map 5.1)

The region is in `tools/scale-model/smodel/nw_expansion.py` and the page's `51-region-store.js`, with no note. The carving is
`tools/scale-model/build_425_master.py` step 9E (l. 2609-2989). The range's climate is set in the Labyrinth's pass (l.
4328-4420). The numbers below were read from `model/data` on `main` (`smodel.page`, 2026-11-09), with the polygon masked by
`matplotlib.path.Path.contains_points`.

- **Size:** 28,007 cells of 2 km, about 112,000 km² (x 38-320, y 1238-1403): 560 km WNW to ESE, 330 km at its widest.
- **How it is cut** (the code):
  - **The spine.** A cordillera axis runs WNW to ESE along y ≈ 1308 - 16 sin(...). It falls from about 5,250 m in the
    west to about 3,950 m at the east border, with a crest of up to 620 m on the axis.
  - **The cones.** Five stratocones sit on the spine, each with a summit crater and radial barranco ribs. Each rim has a
    notch 180 m deep on its south-west side.
  - **The valleys.** Four elliptic valleys are cut south of the spine. Each has a flat floor, stepped sinter benches
    (`sinter_steps`, ±85 m) and a warm lake at its centre. The code first set the lakes at 1,680-2,180 m, then raised them so
    that every outflow runs downhill into the Labyrinth's lakes.
  - **The west edge.** The airless barrier (x < 62, over 9 km) is kept.
- **Heights** inside the polygon:
  - p5/p25/p50/p75/p95: 2,918 / 4,367 / 4,718 / 5,123 / 6,029 m;
  - the lowest ground is 1,901 m at 284,1318, the bed of the East Bliss lake;
  - the highest is 10,128 m at 38,1259, on the west barrier;
  - by band: under 2 km 0.3%, 2-3 km 5.1%, 3-4 km 5.9%, **4-5 km 57.3%**, **5-6 km 26.3%**, 6-8.8 km 3.9%, over 8.8 km
    1.3%.
- **Slopes** on the 2 km grid: median 2.4°, p90 8.9°, p99 21.3°, steepest 34.8°; 16 cells are steeper than 30°. At this
  scale it is a high plateau with cones on it. The relief a walker sees (crater walls, barrancos, sinter steps, valley walls)
  is under the grid's size, and the kit makes it.
- **The five volcanoes** (`model/data/vents.json`, kind `stratovolcano`, region Firebliss Range). The spec's base radius
  is 29-42 km and its crater radius 6-9 km. "Grid" below is the highest and lowest cell within 4 px.

  | Volcano | 5.1 px | Peak (record) | Grid: rim / crater floor | Crater floor's class, temps |
  |---|---|---|---|---|
  | **Mount Pyre** | 104,1304 | 6,650 m | 6,660 / 5,820 m | EF, tm -13 °C (-3 / -22) |
  | **Cinder-Crown** | 148,1292 | 5,940 m | 6,040 / 5,329 m | EF |
  | **Firebliss Mons** | 206,1284 | 6,380 m | 6,421 / 5,481 m | EF, tm -11 °C (-1 / -20), 596 mm |
  | **Brimstone Spire** | 254,1288 | 5,780 m | 5,804 / 5,181 m | EF |
  | **Copper-Fissure Vent** | 298,1286 | 5,360 m | 5,367 / 4,680 m | ET, tm -6 °C (4 / -16) |

- **The four valleys and their lakes** (all `WH`, highland lake). The three valley systems are the ground under 3 km:

  | Valley | Lake: centre, area, level, bed | Ground under 3 km | Warmest shore (model) |
  |---|---|---|---|
  | **West Bliss Cauldron** | 125,1343; 140 km²; 2,640 m; bed 2,583 m | 1,048 km² (x 112-157, y 1336-1372) | 125,1340, 2,695 m: Cfb, 10 °C (19 / 2), 1,082 mm, 1.14 atm |
  | **Great Firebliss Vale** | 184,1318; 240 km²; 2,280 m; bed 2,217 m | the Vale and the Glen together, 3,460 km² (x 166-254, y 1310-1351), joined by a saddle of 2,682 m at 208,1320 | 183,1314, 2,315 m: Cfb, 12 °C (21 / 4), 1,067 mm, 1.20 atm |
  | **Solfatara Glen** | 238,1322; 140 km²; 2,120 m; bed 2,056 m | (with the Vale) | 235,1319, 2,140 m: Cfb, 13 °C (22 / 5), 1,239 mm, 1.22 atm |
  | **East Bliss Vale** | 284,1318; 132 km²; 1,960 m; bed 1,901 m | 1,440 km² (x 274-296, y 1310-1347) | 282,1315, 2,004 m: **Cfa**, 14 °C (23 / 6), 1,271 mm, 1.25 atm |

  In all, 5,970 km² lie under 3 km and 3,340 km² under 2.5 km. The valley walls climb fast: the Vale's shore at
  184,1326 is already 4,663 m, 8 px from the lake.
- **The rivers** (`rivers.json`; Tungang names, `river-names-5.1.md`). Each runs from a valley's lake south-east out of the
  polygon into the Labyrinth:
  - **Yan Warra** (`r_fb_west`, "First river"): West Bliss to the Labyrinth's north-branch headwater (182,1404). 160 km,
    65 m³/s.
  - **Tlahn Warra** (`r_fb_central`, "iron-clan river"): the Great Vale, through Solfatara Glen, to the Labyrinth's Lake 3
    (234,1424, 1,980 m). 326 km, 145 m³/s.
  - **Weyt Warra** (`r_fb_east`, "white-water river"): East Bliss to the Labyrinth's Lake 6 (284,1418, 1,720 m). 214 km,
    85 m³/s.
- **The plume.** The code builds a downwind field from the five vents, bearing about 142° (SE): vapour to 370-640 km
  downwind, ash to 190-390 km (`w_firebliss_plume`, `w_firebliss_ash`). The model uses the plume only to add rain to the
  Labyrinth (+310 mm, +165 on its NW-facing slopes); the field itself is not saved in `model/data`. So **the Labyrinth lives
  under Firebliss's ash and rain**. The range's own valleys lie mostly upwind of it.
- **Neighbours:**
  - **Copper Glacier** (`rmvcopperglacier`, built: `biomes/copperglacier`) lies to the north. **Its polygon overlaps
    Firebliss by 15,868 cells (63,500 km², 57% of Firebliss).** Its south edge runs at y 1345, across the whole range: three
    of the five volcanoes (Mount Pyre, Cinder-Crown, Firebliss Mons) and two of the valleys (West Bliss, the Great Vale) lie
    inside both. Copper Glacier's three stations all stand outside Firebliss, so no page is wrong. Its plan's polygon numbers
    (217,000 km², heights p50 6,271 m) include this ground. Section 9 asks the owner.
  - **The Labyrinth** (`rmw8bqrn3dnx4`) lies to the south, along the edge from 293,1349 to 113,1402. It shares 13 cells
    with Firebliss and takes all three rivers. It has no plan in the repo; the Great Chasm's plan cites one.
  - **The W rift highland** (`rmvkbzqu8zp94`, x 308-517) lies to the east, beyond Copper Glacier's pass.
  - **The airless west edge** (O, HF) lies to the west.
- **Settlements:** none. No pin or polity polygon lies within 100 px. The nearest pins are Ledge (437,1330, Dalab's hold
  on the cliff over the great lake), Nulab (443,1359), Loj Twenny (457,1269, a Tungang cavern) and Wildcat (427,1453), all
  140-175 px (280-350 km) east of East Bliss. The polities to the east are the Tungang Union (x 399-517), the Fellgangs
  (x 339-596) and the Realm of Dalab (x 332-630).

## 2. Geology

The code carves cones, calderas and valleys. The reading below is this plan's. It is to be checked against
`kits/resources`' geology bake, which does not yet see the range (below).

- **A glaciovolcanic arc** (the code's own words). Basaltic andesite to andesite stratocones stand on an older uplifted
  plateau, and ice caps them above about 5.1 km (EF). The radial barrancos are lahar and meltwater gullies. The SW notch in
  each rim is a breach: the side the crater's own ice and meltwater leave by, and where a flank collapse would run.
- **Degassing calderas.** The craters are 12-18 km across with floors 0.6-0.9 km under their rims: collapse calderas, not
  open vents. *Proposed:* each holds a crater glacier with fumarole fields melting holes through it. The kit draws no open
  lava; whether any vent is erupting is the owner's call (section 9).
- **The valleys are hydrothermal grabens** (*proposed*). They are elliptic basins with stepped sinter benches (the code's
  `w_fb_sinter`) around warm lakes, where groundwater heated under the arc rises. The Earth analogue is New Zealand's
  Taupō Volcanic Zone: Rotorua and Waiotapu's sinter terraces, acid lakes and steaming ground, under andesite cones with
  ice on them (Ruapehu). Solfatara Glen is named for the sulphur vents its name implies.
- **The plateau** at 4-5 km is old ground under ash and lava sheets, frost-shattered (ET). *Proposed:* tuff and ignimbrite
  benches are cut by the barrancos (`KSTRATA`).
- **The resource bake does not see the range.** `kits/resources/data/geology.json` (format `krator-geology`, "Krator Scale
  Model 5.1" v1) was baked before step 9E:
  - it masks 6,842 of the polygon's 7,016 four-km cells as airless;
  - its province is crystalline (96 cells granite);
  - sulphur, tuff and the volcanic province are 0;
  - iron (160), saltpeter (200) and stone are the only strong layers.

  `tools/scale-model/geology.py` takes `DATA.vents` (`model_vents`) and the heights, so a rebake should give the range
  volcanic ground, sulphur at the vents and the valleys' minerals. Until then, any resource the kit places is a guess
  (section 8, amendments).

## 3. Air and climate

- **Air** is P = 1.6 e^(-h/8000) atm, the formula the region plans share. Temperatures are the model's `tm`, `tw`, `tc` (mean,
  warm month, cold month):

  | Site | Height | Air | tm | tw / tc | Rain | Class |
  |---|---|---|---|---|---|---|
  | East Bliss shore (282,1315) | 2,004 m | 1.25 atm | 14 °C | 23 / 6 °C | 1,271 mm | Cfa |
  | Solfatara Glen shore (235,1319) | 2,140 m | 1.22 atm | 13 °C | 22 / 5 °C | 1,239 mm | Cfb |
  | Great Vale shore (183,1314) | 2,315 m | 1.20 atm | 12 °C | 21 / 4 °C | 1,067 mm | Cfb |
  | West Bliss shore (125,1340) | 2,695 m | 1.14 atm | 10 °C | 19 / 2 °C | 1,082 mm | Cfb |
  | the plateau (median, 4,718 m) | 4,718 m | 0.89 atm | -10 °C | 0 / -21 °C | 565 mm | ET |
  | Firebliss Mons' crater (205,1282) | 5,481 m | 0.81 atm | -11 °C | -1 / -20 °C | 596 mm | EF |
  | Mount Pyre's summit | 6,650 m | 0.70 atm | | | | EF / HT |

- **Climate classes inside** (`c`): ET 18,447 cells (66%), EF 5,413 (19%), Dfc 1,301, Cfb 1,268, HF 427, HT 403, O 351, WH
  163, Csb 130, Cfa 88, Dsc 16.
  - Cfa occurs only at East Bliss, at 1,965-2,069 m (tw 22, tc 5).
  - Cfb spans 2.1-3.1 km, Csb 2.4-3.1 km (the sunlit valley sides).
  - Dfc (3.2-3.9 km) is the valley walls' shoulders.
- **Rain** (`p`): p5/p50/p95 298 / 565 / 941 mm over the polygon; 940-1,270 mm in the valleys.
- **Why the valleys are warm.** The code adds a fixed geothermal term to the whole of each valley's weight: +6.4 °C to the
  warm month, +8.2 °C to the cold month (`w_fb_valley_full`). The craters get +3.5 / +4.5 °C. It also adds +280 mm of rain
  to the valleys and +345 mm round the lakes. These are set terms, not physics. They make a valley floor about 7 °C
  warmer than the plain lapse rate would at 2-2.7 km, with a cold month above freezing. For a kit this means:
  - the warmth is ground heat (`KTHERM`), strongest at the vents, the lakes and the sinter, and weakest on the valley walls;
  - nights are mild, and frost reaches the floor only in the cold month's clear spells. *Proposed:* steam fogs lie on the
    lakes on cold mornings.
- **The day's extremes are missing.** `th` and `tl` (hottest afternoon, coldest night) are 0-coded on 90% of the polygon:
  the NW expansion never filled them west of x 272, and the remaining 10% are old values from before the carve (`tl` -55
  °C). The kit takes its day curve from `tm`/`tw`/`tc` until the model fills them (section 8, amendments).
- **The wind** is the model's prevailing north-westerly. It blows the plume south-east off the cones, over the valleys'
  south walls and into the Labyrinth. The valleys sit under the spine's lee.

## 4. Life

Krator's flora takes Earth's forms at about 1.5 times the scale, with alien notes: iridescence, coral shapes, glow at
night (`biomes/copperglacier/PLAN.md` section 3). Firebliss has four zones, each mostly read in place from a kit that
already has the right country:

| Zone | Ground | Life | From |
|---|---|---|---|
| **The valleys** (Cfb, Cfa, Csb; 1.9-3.1 km) | 1.14-1.25 atm, 10-14 °C, 940-1,270 mm, warm ground | a temperate geothermal forest: the range's own (below), with the veiled rim's natives | `biomes/riftrim` (the W rift highland's `veilthread`, `mistcup`, `moorsponge`, `lobelarch`): fog and steam do the same work |
| **The hot ground** (the sinter benches, the lakes' margins, Solfatara Glen) | sinter, acid soil, hot pools | microbial mats in the run-off colours, sinter terraces, silicified dead trees | `biomes/geyser` (its mats and its `basin` recipe), read in place |
| **The plateau** (ET, Dfc; 3.2-5.1 km, two thirds of the range) | 0.85-1.0 atm, -10 °C mean | low barrens: cushions, rosettes, lichen on ash and rock | the rift rim's S rim (the black rim: dark plants that drink the sun) and Copper Glacier's cushions and lichen |
| **The cones and craters** (EF, HT; over 5.1 km) | 0.70-0.85 atm, ice, fumaroles | snow algae on the firn, ice worms; at the fumaroles, the vent lineages | Copper Glacier (snow algae, ice worms); **`biomes/hearths`** at the crater fumaroles: a heat engine against a cold sky, at 0.8 atm and -11 °C mean, is the Hearths' own country |

**The range's own** (*proposed*, four species; Earth's geothermal flora of the Taupō zone as the models). The trick they
share is **warmth from below**: roots and runners that follow the warm ground, so their stands trace the `KTHERM` field.

| Key | Name | Model | What it is |
|---|---|---|---|
| `steamfern` | Steam fern | the tree ferns of New Zealand's thermal valleys (*Dicksonia*, *Cyathea*) | a tree fern 6-12 m whose crown stands in the steam; fronds teal above, iridescent bronze beneath; it grows only where the ground is warm through the winter |
| `heatkanuka` | Heath tea-tree | thermal kānuka (*Kunzea tenuicaulis*), prostrate on the hottest ground | the sinter's woody plant: upright 4-8 m on cool ground, flattened to a mat on hot; white flowers in drifts, a resin smell over the springs |
| `sintermoss` | Sinter moss | the thermotolerant mosses and liverworts on geyser aprons | a bright crust on the warm sinter, green to orange with the water's heat: the mats' cousin on land |
| `ashlily` | Ash lily | the lilies that come first on fresh tephra | a bulb that flowers through fresh ash downwind of the cones, a hot pink on grey; the first colour after a fall |

**Fauna** (`kits/fauna` owns them all): nothing is assigned. *Proposed:* waterfowl that winter on the warm lakes (ice-free
when the plateau's tarns are frozen), the ice worms on the crater ice, and grazers in the valleys' meadows. The owner's call.

**Crops** (`kits/crops`): the valleys are the only ground in the far south-west where a temperate crop can grow. At 1.2 atm,
14 °C mean and 1,270 mm, `CROPS.at` should give East Bliss a wide palette. Read it when the kit starts. Whether anyone farms
it is section 5's question.

## 5. People

**Nobody is assigned.** No pin, no polity polygon, no lore names the range. The river names are Tungang (the map's tongue
for the whole south-west, `river_names.py`), and two of them are telling: **Yan Warra** ("First river") and **Tlahn Warra**
("iron-clan river").

**The way in** (computed: the lowest-highest route on the height grid):

| Route | Highest point | Length | Notes |
|---|---|---|---|
| the Great Vale to Solfatara Glen | 2,682 m (208,1320) | 114 km | one valley system |
| the Glen to East Bliss | 2,526 m | 307 km | round through the Labyrinth, down the Tlahn Warra and up the Weyt Warra |
| West Bliss to the Great Vale | 3,253 m (188,1407, in the Labyrinth) | 528 km | round through the Labyrinth; straight over the spine is higher |
| East Bliss to Ledge (Dalab's hold) | 3,520 m (405,1471) | about 1,000 km | through the Labyrinth to the Rift's west head; 750 km if the road climbs to 4.5 km. 302 km in a straight line |
| the Great Vale to Copper Tarn (north) | 4,828 m (293,1242) | over 1,500 km | the ice; no way under 4.5 km |

So **the valleys open only south, into the Labyrinth**, and the nearest people are 750-1,000 km away by the low road. Ice
closes the north and air the west. The range is a hidden country: temperate, well-watered, warm in winter, and very far from
anyone.

**Who could live here** (*proposed*; the owner's call, section 9):
- **No one**: a refuge to be found, its valleys wild. This is the simplest reading of the map.
- **A Fellgang clan, the Tlahn** (the "iron-clan" of the river's name). The Tungangs east of Chimes were wiped out in the
  tunnel wars, and the survivors fled west and up onto the fells (`LORE.md` 6.1). A clan that went furthest west, through
  the Labyrinth, would have found the warm valleys. Fellgangs are highlanders; the valleys are 1.2 atm, so they would have
  come down. Small farming and fishing villages by the warm lakes (`core/hamlet`), the old loj forms kept, the Book's
  readings argued. "Yan Warra", the First river, would be where they first came in.
- **Dalab's interest**: Dalab collects peoples and genes (`LORE.md`). A temperate geothermal flora, 1,000 km past its last
  hold, is what its genepriests go looking for. *Proposed:* at most an expedition camp (`core/camp`), not a hold.

**Player outposts:** none is picked. The open world's outpost registry holds player settlements only. The obvious site is
East Bliss's Cfa shore (282,1315): the warmest ground, the lowest lake and the Weyt Warra's head.

## 6. Dangers

Each danger maps to a `KHAZ` kind (`core/hazard/README.md`) or an ambient field.

| Danger | Where | `KHAZ` |
|---|---|---|
| **Gas** (CO₂, H₂S) | crater floors, Solfatara Glen's hollows, still nights | `gas` with `shape.pool` (`21-core-hazard-flow.js`); the night timing is the shared amendment |
| **Scalding water, steam** | hot pools, fumaroles, the lakes' vent margins | `heat`, `acid` (the Glen's pools) |
| **Sinter crust** | the benches: thin crust over hot water | `sink`, a crust that breaks: the shared amendment |
| **Thin air, cold** | the plateau (0.85-1.0 atm, -10 °C mean), the cones (0.70-0.85 atm) | ambient `thin-air`, `cold` (`KHAZ.provide('pressure')`, `'temperature'`) |
| **Ash** | downwind of the cones, SE: the valleys' south walls, the Labyrinth | ambient `ash` (`ATMOS.airLoad`'s `ashAt`, `fx/89-atmos-fx-airload.js`; the weather's `ashfall` mode) |
| **Lahars, meltwater floods** | the barrancos below the crater ice, the SW notches | a flood down a gully (the gorge flood other plans ask for); *proposed:* only as a scripted event |
| **Falls, rockfall** | crater walls, the valley walls, barranco sides | `fall`, `crush` |
| **Crevasses** | the crater glaciers and the cone ice | `fall` (as Copper Glacier's) |
| **Lava** | only if a vent erupts (section 9) | `KLAVA.bind` |
| **The airless edge** | west of x ≈ 62 | ambient `thin-air` to its limit |

Every danger should read before it kills: rotten-egg smell and dead insects round a gas hollow, a hollow ring and a colour
change on thin sinter, frost and laboured breath on the plateau, grey sky and ash on the leaves downwind.

## 7. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2. A page's site is the old canvas px (5.1 px less 272, 330): negative here, as Copper Glacier's are.
Each page is the usual 5.2 km square.

| Station | 5.1 px | Ground (model) | What |
|---|---|---|---|
| 1 **The Great Vale** | the north shore, 183,1314 (lake 184,1318) | 2,315 m; lake 2,280 m, 240 km²; Cfb, 12 °C (21 / 4), 1,067 mm, 1.20 atm | the range's heart: the warm lake in steam, sinter benches stepping up from the shore, steam-fern forest, the Tlahn Warra leaving east; Firebliss Mons (6,380 m) 76 km NNE on the skyline with its plume |
| 2 **Solfatara Glen** | the shore, 235,1319 (lake 238,1322) | 2,140 m; lake 2,120 m; Cfb, 13 °C (22 / 5), 1,239 mm, 1.22 atm | the hot ground: fumaroles, mud pots, acid pools, sulphur crusts, mats in the run-off, silicified dead trees, the heath tea-tree flattened on the hot sinter; the Tlahn Warra arriving from the Vale |
| 3 **Firebliss Mons' caldera** | the floor, 205,1282 | 5,481 m (rim to 6,421 m); EF, -11 °C (-1 / -20), 596 mm, 0.81 atm | the degassing caldera: a crater glacier with fumarole holes melted through it, the Hearths at the vents, ice caves, the SW notch and the plume leaving south-east; the whole arc and the valleys below |
| 4 **East Bliss Vale** | the shore, 282,1315 (lake 284,1318) | 2,004 m; lake 1,960 m (the range's lowest); **Cfa**, 14 °C (23 / 6), 1,271 mm, 1.25 atm | the warmest valley: the lake's outlet and the Weyt Warra's white water leaving south toward the Labyrinth; Copper-Fissure Vent (5,360 m) 66 km NNE |
| 5 **West Bliss Cauldron** (optional) | the shore, 125,1340 (lake 125,1343) | 2,695 m; lake 2,640 m; Cfb, 10 °C (19 / 2), 1,082 mm, 1.14 atm | the highest and smallest valley, under Mount Pyre (6,650 m, 84 km NNW): the Yan Warra's head; the coldest of the four |

Station 1 comes first: it holds the range's whole idea (warm water under ice-capped cones) in one view. Station 2 is the
hot ground, station 3 the volcano, and station 4 the warm end and the way out.

## 8. Core adoption (written first, as the working rules ask)

The modules this kit takes (`README.md`, "CORE MODULES ARE NOT OPTIONAL"). Start from `biomes/copperglacier` (the newest
finished kit, and the neighbour: its ice, frost and station frame) and the geyser kit's `basin` recipe.

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the land | `KRELIEF` (`38`, `38c`), `38b-core-relief-lava.js` | `gully` for the barrancos and the valley walls; `slump` and `scarp` for the caldera walls and the valley grabens; `runout` for talus; the lava relief helpers for the cones' flows and the ash benches; `KRELIEF.waters` for the lakes |
| strata | `KSTRATA` (35, 35c), `KLAVA` layers (46b) | lava flows and tuff in the caldera and barranco walls; ash draped on the plateau |
| heat | `KTHERM` (`47-core-therm.js`) | the ground's temperature from vent records (the crater fumaroles, the valleys' vent lines): what the steam, the snow line, the sinter, the flora's stands, the hazards and a walker all read |
| sinter, terraces, hot water | `core/water`: `WATER.open`, `flow`, `spring`, `geyser` (`geyser/52`), `terraces` (`ext/53`); `biomes/geyser`, read in place | the lakes, the rivers, the hot pools with their mineral ramps, the sinter steps, the mats |
| ice | `KGLACIER` (44g), `KFROST` (42) | the crater glaciers and the cone ice (station 3); frost on the plateau's edge |
| caves | `KCAVERN` (39) | ice caves where the fumaroles melt under the crater glacier |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | sinter, ash, mats, moss and forest floor as masks; the cones as far masses on every valley's skyline |
| flora | `core/biome`; `biomes/hearths` (`BIO.kit('hearths')`), `biomes/riftrim`, `biomes/copperglacier`, read in place | section 4; the range's own four as `BIO` species |
| clock, sky, weather | `core/clock`, `core/atmos` | the standard sky; steam (`ATMOS.smokeGroups`: fumaroles steady, the lakes' steam fog by the hour); the plume over the cones; ash (`weather({ash:true})`, `ATMOS.airLoad`'s `ashAt` from the plume's field); snow (`fx/89-atmos-fx-snowcover.js` reading `KTHERM`) |
| hazards | `core/hazard` (`KHAZ`, with `21-core-hazard-flow.js`) | section 6, every record in `core/tags` before it is drawn |
| fauna | `kits/fauna` | section 4, as `BIO.record` records |
| resources, crops | `kits/resources` (`KRES`), `kits/crops` | after the rebake (below): sulphur at the fumaroles, the valleys' minerals; `CROPS.at` for the valleys |
| settlements | `core/hamlet`, `core/camp` | only if the owner places people (section 5) |
| shadows | `core/shadow` | off at load, as every kit |
| tags, space, mask, host, export, materials | as every kit | |
| city | `core/city` | no |

**Kit-side, not core:** the caldera dress (crater glacier, fumarole holes), the plume's look over the cones, and the range's
four species.

**Core amendments** (none is a new module; they are already listed by the other region plans of 2026-11-09):
1. **Geothermal surfaces:** mud pots, the fumarole kind (steam and run-off), sinter and mat decals. These are owed in
   `core/water/README.md` ("Not here (yet)"). **Firebliss needs them most of all the region plans:** stations 1, 2 and 4
   are made of them.
2. **Hazard kinds:** a crust that breaks underfoot (the sinter); gas that pools at night and in still air.
3. **A gully flood** (lahar, meltwater) for the barrancos, if the owner wants it beyond a scripted event.

**Model amendments** (the scale model; the owner's to authorize):
1. **The region overlap.** Trim Copper Glacier's south edge to Firebliss's north edge, as `edit_511.py` rerouted Region 99
   round the Great Chasm. Copper Glacier's plan's polygon numbers then want re-reading; its pages do not change.
2. **The resource rebake** (`tools/scale-model/geology.py`) on the carved heights and the five vent records, so that
   `kits/resources` sees the range as volcanic and not airless.
3. **Vent records for the valleys.** `DATA.vents` holds only the five summits. `KTHERM` and the Hearths read vents, so the
   valleys' vent lines (each lake's bed, the sinter rings, Solfatara Glen) want records. The alternative is kit-side records
   seeded from the valley specs in `build_425_master.py`.
4. **`th` and `tl`** for the range (and the NW expansion west of x 272), from `tm`, `tw`, `tc` as elsewhere.
5. **The plume's field** saved in `model/data` (`w_firebliss_plume`, `w_firebliss_ash`), so `ATMOS.airLoad`'s `ashAt`
   and the Labyrinth's kit read the same field the rain was made from.
6. **The river records' bookkeeping.** The three `r_fb_*` records have no `region` and no `to`, and `river-names-5.1.md`
   gives their mouth as the sea; they end in the Labyrinth's lakes. Yan Warra's `source_m` (2,754 m) stands above its lake
   (2,640 m).
7. **The region's note**, empty: *proposed*, a sentence from section 1.

## 9. For the owner

- **The overlap with Copper Glacier** (57% of Firebliss): trim Copper Glacier to Firebliss's north edge (the plan's
  proposal), or split the ground differently? Amendment 1.
- **Who lives here?** No one (a hidden refuge); a Fellgang clan, the Tlahn, come west through the Labyrinth (the plan's
  proposal, from the rivers' names); a Dalab expedition; or someone else? It decides whether `core/hamlet` and a pin come
  in.
- **Are the volcanoes active?** The map has five vent records and a plume. The plan's default is degassing calderas: steam,
  gas and ash, with no lava. An erupting vent brings `KLAVA` and lava glow to station 3.
- **The valleys' warmth:** the model's set +6.4 / +8.2 °C makes them Cfb at 2-2.7 km. Keep it, and the kit draws it as
  ground heat from the vents (the plan's reading)?
- **The range's own flora:** the four proposed (steam fern, heath tea-tree, sinter moss, ash lily), more, or fewer? The rest
  is read in place from the Hearths, the geyser kit, the rift rim and Copper Glacier.
- **Names (TBD):** the region's and the volcanoes' names are Gemini's (English). Do the Tungang river names stand for the
  valleys too? *Proposed:* the Great Vale is the Tlahn's own, and **Yan Warra** keeps its "First".
- **The Labyrinth's plan:** it is cited by the Great Chasm's plan but is not in the repo. Firebliss's rivers, ash and rain all
  end there, and its kit and this one share the plume.
- **Order:** after the core amendments (geothermal surfaces above all) and the model amendments 1-3. Station 1 can start on
  the geyser kit's surfaces as they stand.

## Sources

- `tools/scale-model/build_425_master.py` step 9E (l. 2609-2989: the polygon, the spine, the five cones, the four valleys
  and their re-levelled lakes, the three rivers, the plume, the vent records), l. 4328-4420 (the Labyrinth and Firebliss
  climate pass: the rain terms, the geothermal temperature terms, the class rules);
- `smodel/nw_expansion.py` (the region); `model/src/51-region-store.js` (Firebliss, Copper Glacier, the Labyrinth, the W rift
  highland, the Tungang Union, the Fellgangs, the Realm of Dalab); `model/src/60-settlements.js` (Ledge, Nulab, Loj Twenny,
  Wildcat);
- `model/data` on `main` (`h`, `wl`, `c`, `p`, `tm`, `tw`, `tc`, `th`, `tl`; `rivers.json`, `vents.json`), read with
  `smodel.page`, 2026-11-09; routes by a bottleneck search on the height grid;
- `smodel/river_names.py`, `river-names-5.1.md` (Yan, Tlahn, Weyt Warra);
- `kits/resources/data/geology.json` and `tools/scale-model/geology.py`;
- `LORE.md` 6.1 (the Tungangs, the Fellgangs, the tunnel wars, Dalab); `biomes/riftrim/PLAN.md` sections 3 and 6;
- `biomes/copperglacier/PLAN.md`, `biomes/greatchasm/PLAN.md`, `biomes/godshearth/PLAN.md` (the form, and the shared
  amendments); `biomes/geyser`, `biomes/hearths`;
- the core READMEs: `core/terrain` (`LAVA.md`, `47-core-therm.js`), `core/water`, `core/atmos` (`fx/`), `core/hazard`.
