# Mid Basin: the plan (2026-11-09)

**Mid Basin** (`rmvmidbasin101`) lies on map 5.1 between the Loom-Chasms (`rmvraoas90co7`, north) and the
Siphon Pits (`rmvra9zogfm9t`, south). The Stalker Gate's passes (`rmvstalkergate`) and the Stalker Range open onto it from the
west.

The owner's briefs:
- **2026-11-03:** a transitional zone with "the geological uniqueness that crashing these features together would create". It
  is not a blend of the two neighbours' looks. It is the landforms that only exist where the Pits' volcanism meets the Chasms'
  faults.
- **2026-11-09:** a realistic terrain transition from the Loom-Chasms to the Siphon Pits. A few pits and chasms are fed by a
  spring and might make good player outposts. The dangers are mostly environmental, but Yuni outlaws are known to roam the
  region.

This plan replaces the seed of 2026-11-03 and keeps its facts. Nothing is built. It is a kit for the rebuild's queue, after the
frozen integration pass. Names marked **TBD** are the owner's to give.

## 1. What the map carves (Gemini, map 5.1)

The carving is `build_mid_basin_terrain` in `tools/scale-model/smodel/se_provinces.py` (from l.107). It was sculpted in the 4.24b
SE complex, and `build_425_master.py` keeps it as one of the five protected SE regions (l.286). `se_provinces.py` writes **old
canvas px**: add (272, 330) for 5.1 px. All numbers below were read from the model with `smodel.page` (2026-11-09, at
`gemini/scale-model-5.1-r3`, dfdf64d1a), unless marked as the code's design values.

- **Size:** 41,972 height cells of 2 km, about 168,000 km² (`STATIONS-MAP-5.1.md`: 169,000). It spans 5.1 px x 1476-1767,
  y 1187-1431. The 4.24b README's 79,164 km² is an older polygon.
- **Heights:** p1/p5/p25/p50/p75/p95/p99 = 925 / 1,507 / 2,028 / 2,168 / 3,072 / 4,399 / 8,196 m.

  | Band | Cells | Share |
  |---|---|---|
  | under 1,500 m (the chasm heads) | 2,038 | 4.9% |
  | 1,500-2,000 m | 5,911 | 14.1% |
  | **2,000-2,500 m** (the corridor and the maar floors) | 19,633 | **46.8%** |
  | 2,500-3,500 m (the middle benches) | 7,662 | 18.2% |
  | 3,500-4,500 m (the upper bench and the plateau's edge) | 4,835 | 11.5% |
  | over 4,500 m (the east wall) | 1,637 | 3.9% |

- **Lowest and highest:** 587 m in a warp chasm at px 1696,1279; 10,118 m at px 1766,1312 on the east edge. That edge is the
  outer wall: over 5,000 m from x 1714 to 1767 (1,692 cells), class O on 294 cells, and no region claims the ground beyond.
- **People on the map:** no settlement lies inside. Half the polygon (21,358 cells, 51%) lies inside the Yuni Emirate's polygon
  (`rmw8ca6baau47`): the west and centre are Yuni land on paper. The nearest settlements are two Yuni villages (section 5).

### The hinge (the code's frame)

The code measures a coordinate `v_hinge` from 0 on the Loom-Chasms side to 1 on the Siphon Pits side. In 5.1 px the north line
runs from about y 1195 (west) to y 1277 (east), the south line from about y 1388 to y 1426. Both waver by up to 15 px. A line
continued from the Siphon Pits' Central Dividing Fault (`scarp_u`) splits the polygon in two:

1. **The Western Loess-and-Tuff Corridor** (5.1 x about 1476-1577). Design: 1,950-2,320 m, with a saddle near 2,010 m in the
   middle. Data: x 1500-1600 has p5/p50/p95 = 1,957 / 2,073 / 2,788 m. It is nearly flat from north to south: along x 1560,
   2,071 m at y 1240, 1,959 m at y 1310, 2,332 m at y 1390.
2. **The Basalt Hinge-Ramp** (5.1 x about 1567-1757): three arcuate steps up from the Loom-Chasms' Shuttle Mesas (about
   1,560 m) to the Siphon Pits plateau (about 4,320 m). The code's comment puts the benches at 3,450 / 2,550 / 1,850 m, but its
   formula gives steps at about 2,330, 3,270 and 4,320 m. The data agree with the formula: a height histogram of the ramp
   (x 1620-1745, y 1290-1435) has three peaks, at **2,100-2,400 m**, **3,150-3,300 m** and **4,200-4,350 m**. Along x 1680:

   | y | 1290 | 1300 | 1320 | 1340 | 1360 | 1380 | 1400 | 1420 |
   |---|---|---|---|---|---|---|---|---|
   | m | 1,542 | 917 (chasm) | 2,372 | 2,625 | 3,188 | 3,249 | 3,973 | 4,391 |

3. **The warp chasms** (the code: "Southward-Propagating Loom Warp Chasms"). The Loom Chasms' chasms cut south into the lower
   benches and fade out by `v_hinge` 0.82, with floors from 460 m (north) rising south. Data: under 1,500 m there are five
   chasm bodies of 17 to 1,267 cells, the largest centred at px 1681,1303 (x 1645-1707, floor 587 m). Their southern heads
   stop at y 1290-1340, at 1,380-1,500 m. At the head at px 1702,1340 the floor is about 1,350 m, and the headwall climbs to
   2,331 m within 8 km and 2,970 m within 24 km.
4. **Six breached maar-diatremes** (the code: "The Siphon-Chasm Intersections"). Each is a crater whose northern rim a
   southward fault gorge has cleaved open. The code's crater radii are 16-22.5 km, each breach gorge runs about 32 km north,
   and the tuff ring stands up to 145 m.

   | Maar (the code's name) | 5.1 px | Floor (data) | Design floor | Breach | Model's water |
   |---|---|---|---|---|---|
   | **Flagship Siphon-Breach Pool** | 1584,1348 | 2,029 m | 2,030 m | -18° | **a lake at 2,040 m, 40 cells**; a geyser vent |
   | Central Chain-Graben Breached Caldron | 1626,1366 | 2,174 m | 2,180 m | +14° | a geyser vent |
   | North-Central Breached Amphitheater | 1660,1344 | 1,951 m | 1,960 m | -12° | none |
   | East-Central Breached Diatreme | 1696,1372 | 2,280 m | 2,290 m | +16° | a geyser vent |
   | Eastern Rim Breached Diatreme | 1726,1348 | 2,375 m | 2,380 m | -15° | none |
   | Spindle-Mouth Lower Breached Maar | 1610,1312 | 1,782 m | 1,780 m | +12° | none |

   The model gives the maar floors the Siphon Pits' thermal-oasis climate: Cwb, 439 mm of rain, a mean of 19-26 °C. The steppe
   round them is BSk with 220-280 mm.

- **Water** (`model/data`):
  - **One lake:** the flagship maar's, 40 cells (about 160 km²), level 2,040 m, bed 2,029 m, centre px 1584,1348, class WH.
  - **Ostrukh Riba** (`r_mb_siphon_breach`, Gemini's "Siphon-Breach Cascade"): perennial, 300 km, 340 m³/s at its mouth. It
    rises at the lake's outlet (px 1583,1343, 2,022 m), leaves the polygon at about px 1591,1269 and ends at 334 m at
    px 1618,1214 in the Loom Chasms. 23 of its 39 points lie inside. **Rerouted 2026-11-10** (section 9): it now runs south,
    262 km to Lake Ostrukh, 0.9 m³/s.
  - **Gould Guli** (`r424`, Spindle Wash) and **Solt Guli** (`r553`): seasonal wadis rising in the NW corridor (px 1562,1265 at
    2,047 m; px 1556,1251 at 2,035 m) and running north to lakes at 644 and 639 m; 2.6 and 0.4 m³/s.
  - **Vents** (`vents.json`): three geyser vents inside, on the floors of the flagship, Central Chain-Graben and East-Central
    maars (radius 2.3-2.5 px). Two more lie to the north: px 1490,1166 (2,393 m) and Mount Caelum's summit (px 1622,1166).
  - **Tubes:** none of `tubes.json`'s 15 crosses the polygon.
  - Fresh **Lake Ostrukh** lies outside, in the Siphon Pits: 56 cells, level 1,850 m, centre px 1524,1462.
- **The passes from the west** (`se_provinces.py`, Stalker Gate): the Mid-Basin Loess Gorge ends at 5.1 px 1524,1302 (about
  2,090 m), the Lower Ostrukh-Mid Basin Connector at px 1530,1362 (2,080 m). Both enter the corridor.

## 2. The geology of the collision

North to south the ground crosses from an extending basin (the Loom's chasms) onto a volcanic plateau (the Pits). The two
processes overlap in a band 40-60 km wide. What the overlap makes, by the map's carving and by real analogues:

| Form | How it formed (the plan's reading) | Earth's analogue | Where | Drawn by |
|---|---|---|---|---|
| **Relay benches** | The Pits' flood basalt, broken by the Loom's extension into blocks stepping down north. Where two en-echelon fault segments overlap, the throw passes from one to the other across a tilted ramp, so a bench never has a clean break. Back-tilted benches, lipped crests, columnar joints broken across the scarps | the relay ramps of the Afar margin and of Canyonlands' grabens | the ramp, three steps | `KRELIEF.relay` (`38c`); `KSTRATA` basalt in the walls |
| **Breached maar-diatremes** | Magma rising along the hinge met groundwater: steam blasts dug craters and filled their pipes with breccia. Later the Loom's faults cut south through their north rims, so each breach is a cross-section: tuff ring above, the breccia pipe flaring upward, baked country rock at the contact | maar fields on rifts (the Eifel, Ukinrek); the Hopi Buttes' eroded diatremes for the cut pipe | the six maars | `KRELIEF.maar` (`dir` opens north; `rock` reads breccia, baked, country, tuff) |
| **Warp-chasm heads** | The Loom's grabens propagate south and die out in the benches. Their heads are amphitheatres where spring sapping and rockfall drive the cliff back | spring-sapped canyon heads (Hawaii's Kohala valleys, the Snake River's Box Canyon) | y 1290-1340, x 1645-1760 | `KRELIEF.stepcut` (a graben along a line); the head: amendment 3 |
| **The loess-and-tuff corridor** | Silt blown off the Stalker glaciers' outwash and the chasm floors settles in the lee, on the west. Each maar eruption dropped a tuff bed into it, so loess and tuff interbed, and the tuff beds thin away from the maars | the Chinese Loess Plateau's palaeosols; tephra layers in the loess of Idaho and New Zealand | x 1476-1577 | `KSTRATA.vary` + `KSTRATA.drape`; `KRELIEF.gully` (`yuan`, `liang`, `mao`) for its cut edges |
| **Silicified loess needles** (named in the code) | Hot silica-rich water rising along the chasm faults cemented the loess round its joints. Erosion left the cemented parts standing | hydrothermally cemented pipes; Kasha-Katuwe's tent rocks (tuff) for the look | the chasm heads, the corridor's east edge | `KSTACKS` bodies seated by `core/terrain/SEAT.md` |
| **Spring lines and travertine** | Faults and pits cut a confined aquifer (section 3). Warm water rich in CO₂ rises, degasses and drops carbonate: travertine aprons and steps below each resurgence | Pamukkale; Mammoth Hot Springs; the CO₂ springs of the Eifel maars | the maar floors, the breach gorges, the chasm heads | `WATER.spring`, `WATER.terraces`; the decals: amendment 1 |

**Scale.** The map's maars are 30-45 km across. Earth's largest maars are a few kilometres. At map scale these read better as
maar-diatreme complexes or small calderas. A station page (5.2 km) sits on one part of one: a shore, a breach, a wall. The kit
may nest true-scale maars (1-3 km) on a big floor as more `maar` records, so the form reads at walking scale.

## 3. The springs

**What feeds them.** `se_provinces.py` says the maars' warm artesian springs are "fed by subterranean seepage from fresh Lake
Ostrukh". The lake is at 1,850 m and the flagship pool at 2,040 m, 190 m higher. Water does not seep uphill, and artesian head
comes from the recharge ground, not from a lower lake. The plan's physical reading: **Lake Ostrukh and the springs share one
confined aquifer** (the basalt's flow tops, sealed by the tuff), recharged by the Stalker Range's snow at 3-5 km to the west.
That head drives the water up through the faults. The lake is the aquifer's low outlet in the south; the maars are its outlets
where the hinge's faults break the seal. The magma that made the maars warms the water and charges it with CO₂. This is the
owner's to confirm (section 10).

**The model's springs** (the kit's spring records come from these):

| Spring | 5.1 px | Ground | What it is like |
|---|---|---|---|
| **The Siphon-Breach** (the flagship pool) | 1584,1348 | lake 2,040 m; Cwb, 26 °C mean, 439 mm | a warm lake of about 160 km² in a maar floor, the only standing water in the region, with a geyser on its floor. It spills north through the breach as Ostrukh Riba (340 m³/s at the mouth). Travertine shelves at its outlet; CO₂ in its deep water |
| **The Caldron** (Central Chain-Graben) | 1626,1366 | floor 2,174 m; Cwb, 22 °C, 439 mm | a dry floor round a geyser vent: hot pools and a travertine cone, no lake. Its breach opens NNE |
| **The East-Central Diatreme** | 1696,1372 | floor 2,280 m; Cwb, 19 °C, 439 mm | a geyser vent under the second bench's scarp (3,442 m, 24 km south): a warm floor walled on three sides by bench basalt |

**The kit's own springs** (not on the model; the kit's inference, drawn only at station scale):
- **The dry maars** (North-Central 1,951 m, Eastern Rim 2,375 m, Spindle-Mouth 1,782 m): seeps at the foot of the cut walls,
  where the tuff seals the aquifer. Small pools and wet ground; the model's Cwb climate already makes them oases.
- **The chasm heads:** spring sapping at the head of each warp chasm, where the chasm cuts the aquifer. A spring line at the
  foot of the headwall, and a stream that dies in the chasm floor's salt within a few kilometres (the floor is BWk, 110 mm).
- **The corridor:** a spring line where loess lies on a tuff bed and the water perches on the tuff. Small, cold, seasonal.

## 4. Climate and air

- **Air:** at Krator's 1.6 exp(-h / 8,000 m) atm (the Loom-Chasms plan's formula; it gives Copper Glacier's 1.19 atm at
  2,380 m): the chasm floors 1.49 atm, the corridor and the maar floors 1.20-1.28, the middle benches about 1.07, the plateau's
  edge 0.93 (`KHAZ.provide('pressure')` from `core/atmos`).
- **Climate:** 16 Köppen classes. BSk holds 20,294 cells (48%); then Dsc 6,078, Dsb 5,495, ET 3,570, Dsa 2,050, BWk 1,815,
  Cwb 729, and small shares of HT, EF, HF, O, Cwc, Csb, WH, Dfc and Dfb. Mean temperature p5/p50/p95 = -1 / 17 / 20 °C; rain
  125 / 220 / 282 mm.
- **The gradient up the ramp** (the median of each row, x 1640-1745):

  | y | Ground | Mean | Rain | Main class |
  |---|---|---|---|---|
  | 1280 | 1,445 m | 19 °C | 125 mm | BSk, BWk |
  | 1325 | 2,244 m | 14 °C | 141 mm | BSk |
  | 1355 | 3,018 m | 9 °C | 141 mm | Dsc |
  | 1385 | 3,458 m | 6 °C | 157 mm | Dsc |
  | 1415 | 4,348 m | -1 °C | 173 mm | ET |

  The corridor is BSk all the way (2,016-2,231 m, 16-18 °C, 220-267 mm). The maar floors are the warm, wet exception.
- The model's `th` and `tl` read -90 (unset) on the maar floors. Read each station's own values when the kit starts.

## 5. People and dangers

### The Yuni

Two Yuni villages bracket the region (`model/src/60-settlements.js`):
- **Spindle Fan** (px 1561,1140, 2,150 m, Cwb): a farming and spring outpost on the Weavers' Cradle fan, supplying expeditions
  into the Loom-Chasms. About 200 km north of the polygon's NW edge.
- **Ostrukh-on-Water** (px 1516,1471, 1,988 m): a farming outpost on Lake Ostrukh (terraces and qanats), staging Siphon Pit
  expeditions. About 170 km south of its SW edge.

The corridor is the low, level way between them: it is the road, and the Stalker Gate's two passes join it from the west. Yuni
holds the ground on paper (the Emirate's polygon covers half the region) but keeps no post in it. Both villages are NPC
settlements on the scale model, not outposts in the registry's sense (section 6).

### The outlaws (proposed: the lore says nothing yet)

`LORE.md` §6.11 has Yuni ruled by an Emmo whom "the prominent families choose", families competing with tower-houses, a slum
(the Thatch), and outposts Yuni controls. Nothing on outlaws. **Proposed, for the owner:**
- **Who they are:** three streams, which is how Earth's frontier outlaws formed:
  - the losers of a family feud or an Emmo's choosing: a house cast out with its retainers;
  - deserters from the outposts' guards and the qanat gangs;
  - debtors and convicts run out of the Thatch.
- **A name (TBD):** Yuni English grew from Australian speech (§6.11), and the bushranger is the obvious echo. In Yuni's clipped
  form, **Ranjos** (from rangers) or **Bushis**. A Ned Kelly note, scrap plate armour, fits a people who live off salvage.
- **What they do:** they prey on the expedition trains between the two villages and on the caravans off the Stalker Gate. They
  need water, so they camp by the springs. That is the tension the region turns on: the best outpost sites are theirs too.
- **How many:** small bands of 10-30, two or three in the region. The owner's call.

**How the kit places them** (records first, as in every kit; a builder draws a record, it does not decide where things go):
- **Camps** are `KCAMP.pitch` records: a few tents and lean-tos, a pen, a hearth, a cache. Their sites are drawn from the spring
  candidates (section 6) by `KRAND.hash(world, cell, index, salt)`, never on the open road, and kept clear with `KSPACE`. Each
  tent and pen has its `<band>:<key>:<i>` id. Every record is registered in `core/tags` (the camp a landmark, its tents its
  children) before it is drawn.
- **Lookouts** are records too: a cairn, a hide or a perch on a tuff-ring crest or a bench lip that sees the corridor. A site is
  picked by a plain rule on the ground (it sees a stretch of road within a range and is not seen from it), so it runs in Godot.
  Each lookout carries its band's id.
- **On the simulation** they are a hostile band on `core/simulation`. Their raids follow `core/camp/PLAN.md` §6.1: the target is
  picked by stance, distance, wealth, weakness and cooldown. A player settlement joins the candidates by the same rules; nothing
  is scripted for the player.
- **The gaps:** `KCAMP.CULTURES` has no row for them (nor for the north-western bandits: `PLAN.md` §3 marks both "gap"); the
  census deals bands of 40-70; and no Yuni camp pieces exist (`kits/catalog` has no Yuni culture file). Amendment 4.
- **Not hazards.** An outlaw is a person with an AI, not a `KHAZ` record, as a moving animal is not (`core/hazard/README.md`,
  "Fauna"). Their sign on the ground is the warning: cairns, a cold hearth, tracks off the road, a stripped cart.

### The environment (`KHAZ` kinds)

| Hazard | Where | `KHAZ` |
|---|---|---|
| **CO₂ in the hollows** (degassing from the springs, settling on still nights) | the maar floors, the breach gorges, the chasm heads | `gas` with `shape.pool` (`21-core-hazard-flow.js`); strongest at night: amendment 2 |
| **A limnic gas release** (Lake Nyos, 1986, was a maar lake) | the flagship lake | a `gas` record over the lake, a rare event; the owner's choice (section 10) |
| **Scalding water and hot ground** | the three geyser vents, the hot pools, the travertine aprons | `heat`; ground temperature from `KTHERM`; geysers on `WATER.geyser`'s cycle |
| **Crust over hot water** | travertine and sinter aprons | `sink`, breaking underfoot: amendment 2 |
| **Cliffs** | the bench scarps, the chasm headwalls, the maars' cut walls, the loess gullies' sheer sides | `fall` |
| **Rockfall and wall collapse** | below the columnar scarps and the headwalls; loess walls after rain | `crush` |
| **Wet loess** (it collapses and slides when soaked) | the corridor's gullies and cut banks | `slip` |
| **A flood down the breach gorge** (the lake's outlet surging; flash floods in the gulis) | Ostrukh Riba's gorge, Gould and Solt Guli | `drown` and `crush`, timed: amendment 2 |
| **Dust storms** | the corridor and the chasm floors | weather: `core/atmos`'s dust season (`fx/89-atmos-fx-dustseason.js`) |
| **Cold and thin air** | the upper bench and the plateau's edge | `KHAZ.provide('temperature')`, `'pressure'` |
| **Predators** | the upper bench rims (the Siphon Pits' flenser-hound); the west edge (the Loom plan's Stalker robots off the Stalker Range) | `hunter` places (`KHAZ.PREDATOR.lair`), candidates only, bound to the fauna kit's keys once they exist |

Each has its sign before it hurts: dead birds and bare floors for gas, colour and steam for heat, a hollow ring at the crust, a
rising roar and mud in the stream for a flood, fresh scree for rockfall.

## 6. Outposts: candidate sites only

**No spot is picked for the player** (the owner, 2026-11-09). "Outpost" means a **player settlement** of any size, from a camp to
a town: a record in the open world's **outpost registry**, being built as core work in another session. NPC outposts and camps
(the Yuni villages, the outlaws' camps) stay conceptually and mechanically distinct: they are scale-model settlements and
`core/hamlet` and `core/camp` records, never registry records.

This kit offers **hints** the registry may read, and draws nothing for them. A hint is plain data: its place, its water (spring,
lake or seep), its warmth (from `KTHERM`), its gas and flood exposure, its view of the road, and whether an outlaw band's range
covers it.

| Candidate | For it | Against it |
|---|---|---|
| **The Siphon-Breach** (the lake shore, 2,040 m) | the most water in the region; a perennial river; warm; the road's midpoint | the lake's CO₂; floods at the outlet; the outlaws' first choice |
| **The Caldron** (2,174 m) | hot water and a geyser: heat and power; a walled floor | scalds and crust; gas in the floor; no lake |
| **The East-Central Diatreme** (2,280 m) | the most sheltered: bench walls on three sides; far from the road | far from the road; rockfall from the scarp |
| **The dry maars** (seeps; the kit's inference) | warm floors without the hot ground's dangers | little water; gas pools |
| **The chasm heads** (spring sapping; the kit's inference) | a spring at the top of a way down into the Loom-Chasms; easy to defend | rockfall, floods and a cliff on three sides; the salt floor below |

## 7. Life

Most of the life belongs to the two neighbours and is read in place from their kits. **Neither neighbour kit is built yet**:
`biomes/loom-chasms` and `biomes/siphon-pits` hold plans and station records, and their species exist only in their plans. Mid
Basin waits for them, or for their species files. It does not define their species itself.

| Zone | Life | From |
|---|---|---|
| **Chasm heads and floors** (north) | the cable spinner (*Chordephytum ferreum*) slung across the narrow heads; the halite sifter on the salt below | `biomes/loom-chasms` (plan §4); the cables on `KSPAN` with `up` |
| **The corridor** (BSk) | loess steppe: bunch grass, sage-like shrubs, forbs in the swales; scrub along the wadis | a steppe species set read in place (check `biomes/nsemiarid` and the crater drylands when the kit starts); `kits/crops` (`CROPS.at`) for what the Yuni could grow |
| **The maar floors** (Cwb, warm, wet) | the oasis: meadow and reed round the lake; woolly siphons rooted in the hot ground at the vents; siphon felt and suture-galls on the damp basalt | `biomes/siphon-pits` (plan §4: woolly siphon, siphon felt, suture-gall); the geyser kit's meadow |
| **Spring and travertine margins** | thermophile mats banded by temperature; hot-spring grasses | `biomes/geyser`, read in place, as Firebliss does |
| **The benches** (Dsb to Dsc) | sparse cushions and lichen on the basalt; frost-heaved ground on the upper bench | the Siphon Pits' scarp flora; `KFROST` patterned ground |
| **The plateau's edge** (ET) | alpine tundra | the Siphon Pits plateau, in the far field |

**Animals** (the fauna kit owns them; candidates, not placed):
- the woolly ghaunt-ox, grazing up and down the benches between the plateau and the maar floors;
- the flenser-hound on the upper rims;
- the basalt pipe-borer in the diatremes' breccia;
- the cable-stryder at the chasm heads.

**Only here:** the maar floors are where the Pits' warm-ground life meets the Loom's water. A spring-fed maar is the one place the
woolly siphon grows beside open water. The kit can show that edge without inventing a species.

## 8. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2. A page's site is the old canvas px (5.1 px less 272, 330). Each page is the usual 5.2 km square, so the far
field (`KHORIZON`, `KFAR`) carries what lies beyond it: at 2 km a cell, the neighbouring forms are tens of kilometres away.

| Station | 5.1 px | Ground (data) | What |
|---|---|---|---|
| 1 **The Siphon-Breach** | 1584,1340 | the lake at 2,040 m behind; ground 2,012-2,103 m within 6 km; BSk at the outlet, Cwb on the floor | **the collision in one view:** the warm lake in its maar, the north rim cut open, the cut walls showing tuff over breccia over baked basalt, travertine at the outlet, Ostrukh Riba leaving north. The benches on the east horizon, the plateau's edge to the south, the corridor to the west |
| 2 **The Relay Benches** | 1640,1350 | 2,608 m on the first ramp; 2,407 m 20 km north, 3,096 m 20 km south | the ramp: a back-tilted bench, a scarp with columnar joints broken across, a relay ramp climbing between two overlapping faults. North, the chasms; south, the next two steps |
| 3 **The Warp Head** | 1702,1340 | chasm floor about 1,350-1,620 m; headwall to 2,331 m within 8 km; BWk | where a Loom chasm dies into the benches: the amphitheatre head, the spring line at its foot, silicified loess needles, cable spinners across the throat, the salt floor below |
| 4 **The Loess Corridor** | 1560,1310 | the saddle at 1,959 m; 1,938-1,986 m within 6 km; BSk, 20 °C, 267 mm | the road: loess steppe with tuff beds in the cut banks, gullies, the Loess Gorge pass mouth to the west (px 1524,1302, 2,101 m), an outlaws' lookout on a rise, a stripped cart; dust |
| 5 **The Caldron** (optional) | 1626,1366 | floor 2,174 m; Cwb, 22 °C, 439 mm | the hot maar: the geyser, a travertine cone and hot pools, woolly siphons, the crust hazard |

Station 1 comes first. It shows the transition best, holds the region's water and its main spring, and is the outlaws' likeliest
camp ground.

## 9. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the hinge's land | `KRELIEF` (`38`, `38c`) | `relay` for the three benches; `maar` for the six breached maars and any nested small ones; `stepcut` for the chasms; `gully` for the corridor's cut edges; `KRELIEF.waters` for the spring pool and its outflow (`out`) |
| strata | `KSTRATA` (35), `KSTRATA.vary` + `drape` (`35c`) | flood basalt in the benches; the maar's own `rock` parts in its walls; loess draped over the corridor, interbedded with tuff that thins away from each maar |
| needles and columns | `KSTACKS` (37) | the silicified loess needles; columnar blocks fallen from the scarps; seated by `SEAT.md` |
| ground heat | `KTHERM` (`47-core-therm.js`) | the three vents and the springs as point vents: the one field the hazards, the upper bench's snow line and the plants read |
| water | `core/water` | the lake (`WATER.open`), Ostrukh Riba and the gulis (`WATER.flow`), the hot pools and geysers (`WATER.spring`, `WATER.geyser`), the travertine steps (`WATER.terraces`), the chasm floors' salt (`W.pan`) |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | loess, tuff, basalt, salt and travertine as documented masks; the benches and the plateau as far masses |
| frost | `KFROST` (42) | the upper bench's patterned ground |
| flora | `core/biome` | the neighbours' species read in place (section 7); `KSPAN` for the cables |
| sky, weather | `core/atmos` | the standard sky; the dust season over the corridor |
| hazards | `core/hazard` (`KHAZ`, with `21-core-hazard-flow.js`) | section 5 |
| camps | `core/camp` (`KCAMP`) | the outlaws' camps (section 5) |
| fauna | `kits/fauna` | as `BIO.record` records registered before they are drawn |
| resources | `kits/resources` (`KRES`) | read the region's rock (`kits/resources/ROCK-PROPOSAL.md`: basalt, tuff) when the kit starts |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no: nobody lives here. `terraces` (38c) is not needed unless the owner wants old Yuni fields in a maar |
| karst | `KKARST` | no: basalt and tuff do not dissolve. The springs are fault and aquifer springs, drawn as water |

**Core amendments Mid Basin needs** (none is a new module; most are shared with the region plans reviewed 2026-11-09):
1. **Geothermal surfaces:** mud pots, the fumarole kind (steam and run-off), and travertine, sinter and mat decals. Owed in
   `core/water/README.md` ("Not here (yet)"), and wanted by Firebliss, godshearth, twins, greatchasm and seouterwall.
2. **Hazard behaviour** (test each against `KHAZ` first; some may need only a record):
   - **gas that pools at night and in still air:** a `cycle` runs today on a hashed or authored phase, not the clock. Wanted: a
     cycle bound to `core/clock`'s night (and the wind), shared with the cold-air pool the region plans want;
   - **a crust that breaks underfoot:** first try `{kind:'sink', trigger:{by:'weight', mass}}`. An amendment only if a record
     cannot stay broken once tripped;
   - **a flood that runs a gorge:** `drown` and `crush` records can be timed now. What is missing is the water: a `WATER.flow`
     whose level rises and falls on the same cycle.
3. **A chasm head for `stepcut`:** a graben along a line whose depth tapers to nothing over its last stretch and ends in an
   amphitheatre, not a square end. Check first whether `stepcut` takes a floor that varies along the line. The Loom-Chasms' kit
   wants it too.
4. **core/camp for outlaws:**
   - a war-camp culture row for the Yuni outlaws (the north-western bandits need one too);
   - a band size per row (10-30, not the census's 40-70);
   - a lookout record and its siting rule (sees the road, is not seen from it), as a plain function.

   The camp's pieces (tents, lean-tos) are a kit's, and no Yuni camp kit exists.
5. **The outpost registry** (open world, not this kit): every player settlement as a record, with this kit's candidate sites as
   hints (section 6).

## 10. For the owner

- **The outlaws:** do they exist as proposed (outcast houses, deserters, debtors)? Their name: Ranjos, Bushis or another? How
  many bands? A leader, or a hideout with a name? Should their story go in `LORE.md` §6.11?
- ~~**The springs' water**~~ **Settled (the owner, 2026-11-10): the shared-aquifer reading** (section 3): the springs and Lake
  Ostrukh share one confined aquifer, recharged by the Stalker Range's snow; not "seepage from Lake Ostrukh".
- ~~**Ostrukh Riba's direction**~~ **Settled (the owner, 2026-11-10): the course was wrong.** Scale model 5.1 edit 2
  (`tools/scale-model/edit_512.py`) reroutes it south: a travertine sill at 2,050 m closes the north breach (the gorge stays,
  dry), and the river leaves the pool's south shore at 1584,1351 (2,036 m) in a channel cut 64 m deep on average (148 m at
  most), 262 km to Lake Ostrukh (1,850 m) at 1528,1459. Its flow is the model's runoff, 0.9 m³/s (15,400 km² of steppe),
  not Gemini's 340 m³/s; it is spring-fed and perennial. Section 1's record above is the old course. Station 1's view now
  looks south down the outlet, not north through the breach.
- **The maars' scale:** 30-45 km across on the map. Keep them as maar-diatreme complexes, with true-scale maars nested on their
  floors at station scale?
- **A limnic release:** may the flagship lake ever release its CO₂, as Lake Nyos did? It would make the best outpost site the
  most dangerous.
- **Names:** the six maars and the benches keep Gemini's English names. Do they want Yuni names, like the rivers' Riba and Guli
  (Yuni clips and runs words together: `LORE.md` §6.11)?
- **Yuni's claim:** half the region lies inside the Emirate's polygon. Does Yuni patrol it, or has it left it to the outlaws?
- **Order:** after Loom-Chasms and Siphon Pits, or at least after their species files, since Mid Basin reads their life in place.
  Amendments 1, 2 and 4 can go first: the open world and the other region kits want them too.

## Sources

- the owner's briefs, 2026-11-03 and 2026-11-09;
- `tools/scale-model/smodel/se_provinces.py` (`build_mid_basin_terrain`, from l.107; the Stalker Gate's passes, from l.233);
- `tools/scale-model/build_425_master.py` (the protected SE complex, l.286; the settlements; `r_mb_siphon_breach`, l.3674);
- `tools/scale-model/README.md`, Parts II and III (4.24b);
- the model's data at dfdf64d1a (`gemini/scale-model-5.1-r3`), read with `smodel.page`: heights, water levels, `c`, `tm`, `p`,
  `rivers`, `tubes`, `vents`; the regions from `model/src/51-region-store.js`, the settlements from `model/src/60-settlements.js`;
- `tools/scale-model/river-names-5.1.md` (Ostrukh Riba, Gould Guli, Solt Guli);
- `biomes/loom-chasms/PLAN.md`, `biomes/siphon-pits/PLAN.md`, `biomes/highrift/PLAN.md`, `biomes/firebliss/PLAN.md`,
  `biomes/STATIONS-MAP-5.1.md`, `biomes/KARST-SITES-5.1.md` (no site here), `HANDOFF-REBUILD.md`;
- `LORE.md` §6.11 (Yuni) and `lore/tongues-of-krator.html` (Yuni's sound changes: *river* to *riba*);
- `core/README.md` ("The unbuilt plans' pieces"), `core/terrain/LANDFORMS.md`, `core/hazard/README.md`, `core/camp/README.md`
  and `PLAN.md`, `core/terrain/47-core-therm.js`, `core/water/README.md`.
