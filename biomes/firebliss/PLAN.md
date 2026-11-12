# The Firebliss Range: the plan (seed, 2026-11-09; the patera and its domes, 2026-11-12)

The Firebliss Range (`rmw8hj62nmugn`) is a volcanic arc on the Labyrinth's northern rim, in the far south-west of map 5.1.
Along its spine stand five volcanoes. Under it, in the old Great Firebliss Vale, lies **the Firebliss Patera**: a lava lake
48 km long under a thin black crust that founders and renews itself once a year, with an island in it that the lava never
reaches. Black-glass tables, the pancake domes, stand on the shoulders round it. Three warm valleys with tarns are left to
the east and west. Nobody lives here. Fellgang hunters and Kimr hunters from the Labyrinth come and go by season, and now
pilgrims, caravans and smugglers cross the crust in its window. Its dangers are the land itself: gas, heat, ash, ice, thin
air, and the crust. A player who reaches one of its oases has found a good place for an outpost (section 6).

The seed (2026-11-09) came from the owner's brief and the map. The patera and the domes are the owner's decision of
2026-11-12, worked out in chat and planned in sections 1a to 1g. **What the patera changed in the seed** is listed in 1g.
The model edit that carves them is `tools/scale-model/edit_512.py` (5.1 edit 2; its README section). Nothing is built.
This is a kit for the rebuild's queue, after the frozen integration pass, and a neighbour of `biomes/labyrinth/PLAN.md`.

## 1. What the map carves (Gemini, map 5.1)

The carving is `tools/scale-model/build_425_master.py` section 9E; the region is in `smodel/nw_expansion.py` (no note yet).
The numbers were read from the model (`smodel.page`, 2026-11-09, at `gemini/scale-model-5.1-r3`).

- **Size:** 28,006 height cells of 2 km, about 112,000 km², between 5.1 px x 38-320 and y 1237-1403.
- **The arc:** a glaciovolcanic cordillera runs WNW to ESE along the Labyrinth's upwind northern border. Its spine falls from
  about 5,250 m in the west to 3,950 m in the east. The map's western edge is the airless barrier (x under 62, over 8.8 km,
  class O).
- **Heights:** p5/p25/p50/p75/p95 = 2,927 / 4,373 / 4,722 / 5,126 / 6,061 m. Most of the range (22,927 cells, 82%) lies
  between 3,500 and 5,500 m: high, cold ground. Only 833 cells, 3%, are under 2,500 m, and those are the valleys.
- **The five volcanoes** (`model/data/vents.json`, all stratovolcanoes). Each crater is breached to the south-east (130-140°),
  toward the Labyrinth:

  | Volcano | 5.1 px | Peak | Crater floor |
  |---|---|---|---|
  | Mount Pyre | 104,1304 | 6,650 m | 5,820 m |
  | Cinder-Crown | 148,1292 | 5,940 m | 5,320 m |
  | **Firebliss Mons** | 206,1284 | 6,380 m | 5,480 m |
  | Brimstone Spire | 254,1288 | 5,780 m | 5,180 m |
  | Copper-Fissure Vent | 298,1286 | 5,360 m | 4,680 m |

- **The four valleys** (the oases; the seed, map 5.1 before edit 2: three remain, section 1g): each is a sheltered geothermal basin under the spine. Each holds a warm tarn (class WH)
  in a crater moat or ribbon, with sinter steps round its shore. The valley floors are temperate (Cfa, Cfb, Csb), an island
  of warmth in ice and ash.

  | Valley | 5.1 px | Tarn | Walls within 8 km | Outflow |
  |---|---|---|---|---|
  | West Bliss Cauldron | 126,1344 | 2,639 m | to 4,016 m | **Yan Warra** (`r_fb_west`), into the Labyrinth's northern branch |
  | ~~Great Firebliss Vale~~ | 184,1318 | ~~2,279 m~~ | to 3,502 m | **taken by the patera** (5.1 edit 2, section 1a): the tarn is under the lava. The **Tlahn Warra** (`r_fb_central`) now heads on the patera's east lip (199,1323) and runs on through Solfatara Glen to the Labyrinth's graben lake at 1,979 m |
  | Solfatara Glen | 238,1322 | 2,119 m | to 2,407 m | Tlahn Warra |
  | East Bliss Vale | 284,1318 | 1,960 m | to 2,558 m | **Weyt Warra** (`r_fb_east`), into the Labyrinth's lake at 1,720 m |

  The rivers are named in the Tungang tongue (`river-names-5.1.md`): Yan, "first"; Tlahn, "iron-clan"; Weyt, "white-water";
  and Warra, "river". Their gorges are the only easy ways in from the Labyrinth.
- **The plume:** the five vents breathe a persistent plume to the south-east (about 135°). It carries water vapour, sulphate
  and dark basaltic-andesite ash over the Labyrinth, and adds 180-360 mm a year to its rain. The range makes its neighbour
  green.
- **Neighbours:** the Labyrinth to the south; Copper Glacier to the north-east, past the Copper-Fissure Vent; the fells and the
  Fellgangs to the north and east.

## 1a. The Firebliss Patera (the owner, 2026-11-12)

**The model is Io's Loki Patera.** Loki is a volcanic depression about 200 km across, its floor a lava lake under a thin
black crust. On a regular cycle the crust founders and sinks. A resurfacing wave then sweeps the lake at one to two
kilometres a day: two fronts start on one side, run round both sides of an island in the middle and meet on the far side
(de Kleer et al. 2017, *Nature* 545: 199-202, from Europa's occultation of Io on 2015-03-08). From 1988 to 2000 the cycle
was 540 ± 10 days (Rathbun et al. 2002, *Geophysical Research Letters*). It broke down after 2001. From 2013 it was periodic
again at about 465-475 days (de Kleer et al. 2019, *Astronomical Journal*; Rathbun et al., EPSC-DPS 2019). Rathbun's team
proposed a porosity gradient in the crust as the clock: the crust is foam when it forms, loses its gas as it ages, grows
denser than the melt and sinks. *The brief gave the 470-day figure to de Kleer 2017; that paper is the waves; the shorter
period is the 2019 work.*

**Why Earth has none.** Earth's lava lakes are hundreds of metres across (Erta Ale, Nyiragongo, Kilauea's Halema'uma'u).
Earth loses its heat through plates, not through a few long-lived vents, so no vent is fed hard and long enough to keep a
lake tens of kilometres wide molten.

**Why Krator has one.** Canon (`LORE.md` section 2) makes Krator an Io-like moon flexed by tides, at 2-5x Earth's heat flow,
losing heat as a heat-pipe world does, through long-lived vents: "focused, not global". A patera is the purest form of such
a vent. Firebliss is the place for it: an arc of five live volcanoes with the warmest valleys on the map under it.

**Its size, honestly.** The patera has to fit Krator's heat budget.

| Step | Number |
|---|---|
| Earth's heat flow | 47 TW over 5.10 x 10^14 m^2: 0.092 W/m^2 |
| Krator's surface (radius 4,800 km, `LORE.md` section 2) | 4 pi r^2 = 2.90 x 10^14 m^2 |
| Krator at Earth's flux | 26.7 TW |
| Krator at 2-5x Earth's flux | **53-133 TW** |
| The patera's lava as carved | 282 cells of 2 km: **1,128 km^2** (an oval 48 x 32 km, less the island's 88 km^2) |
| Its crust's mean flux | 1-5 kW/m^2, central 3 (below) |
| Its output | **1.1-5.6 TW, central 3.4 TW** |
| Its share of the moon's | **2.5-6.4%** at the central flux (3.4 of 133 to 3.4 of 53) |

Where 3 kW/m^2 comes from: crust a few weeks old has a surface at about 150-250 C, which radiates 1-3 kW/m^2 (sigma T^4).
In air it also loses heat by convection, and in the rain ring by boiling off rain, so its mean flux is higher than a
vacuum crust of the same age would give. 1 kW/m^2 is the floor (a year-old crust in a drought), 5 the roof (a lake just
turned). A Loki-sized patera (about 31,000 km^2) at the same flux would give about 94 TW, 70-180% of Krator's whole budget,
which is why **Krator's patera is 20-60 km across, not 200**. The carve takes the middle, 48 x 32 km.

**Where:** it takes over the **Great Firebliss Vale** (`edit_512.py`, its numbers in the report):

| | |
|---|---|
| Centre | 5.1 px **181,1317.5** (world km 362, 2,635); the Firebliss region is in the 5.1 expansion, so it has no old-canvas px |
| Shape | an oval, semi-axes 12 x 8 px (**48 x 32 km**), its long axis 6 degrees north of east, down the old vale |
| Crust | **2,240 m**, flat (the tarn stood at 2,280 m; air 1.21 atm by the model's 1.6 e^(-h/8 km)) |
| Shore | the vale's walls stand straight out of the crust: lowest 2,740 m, median 3,607 m, up to 4.6 km on the north under Firebliss Mons. Where the vale ran out east (the Tlahn Warra's corridor) and south-west, a lip of 2,740 m is held, 500 m over the crust, eased back into the ground over 3-4 cells (71 cells raised, at most 441 m) |
| Cut | up to 2,370 m where the oval bites into the vale's walls |

Why the vale: it was the largest basin in the range (60 x 30 km, floor 2.2-2.4 km), it was already the warmest ground
under the spine (the seed's reading of it as a geothermal basin now has its heat source), and its long axis lies along the
arc, as a fissure-fed patera's would. It sits 64 km from Firebliss Mons, 92 km from Solfatara Glen and 99 km from West Bliss
Cauldron, so the other three valleys keep their tarns.

**The cycle (default taken, owner to confirm): once a year.** Three things set it:
1. *The crust's clock.* The crust thickens as the square root of its age. Hon et al. (1994, *GSA Bulletin* 106: 351-370)
   measured Kilauea's pahoehoe crust at t = 164.8 C^2 (t in hours, C in metres: C = 0.078 sqrt t). Carried out to a lake
   (the fit is for hours to days, so this is an estimate): 0.4 m at a day, 2.1 m at a month, 3.8 m at 100 days, 6.8 m at
   a year.
2. *Air makes it founder sooner.* On Io, gas comes out of the lava into vacuum, so a new crust is a foam that floats for a
   long time. Under 1.2 atm the bubbles are smaller and fewer, so the crust starts nearer the melt's density and sinks
   sooner. The rain ring cools its top and thickens it faster again. Both shorten Io's 470-540 days. The physics allows
   anything from a few months to a couple of years; it cannot say which.
3. *The year locks it.* A clock that runs near a year and is cooled hardest in the wet season will be nudged into step
   with the seasons, as a pendulum is by a small push in time with it. The turn comes **at the end of the rains**.

**The owner's dial:**
- **Once a year (default).** The turn is the region's calendar (1d).
- **At the Double Dark** (every 91 days, `LORE.md` 6.14). Four Double Darks are 364 days, so a year-long cycle keeps step
  with every fourth Double Dark: the people would reckon "the fourth dark" as the turn. A turn at every Double Dark is
  possible only if the crust founders at about 2.8 m. The Week's and the Thirteen's pull on Krator is far too weak to
  trigger it, so the link would be custom and calendar, not cause.
- **Every two years:** a thicker crust (9-10 m) and a longer, safer window, but a rarer, more dreaded turn.

**The turn itself.** The crust founders first at the west shore, beside the island. Two fronts start there and run east,
one round each side of the Holm, at about a kilometre a day (Loki's 1-2 km a day; Krator's crust is cooler and
stiffer, so the slow end), and meet on the east shore. Across 48 km that is **six to eight weeks**. Behind the fronts the
lake is a field of foundering plates, red seams and fountaining spatter for a few days, then a new black skin. Ahead of
them the old crust, a year old, cracks and tilts as the front reaches it. The lake's age therefore runs **from youngest in
the west to oldest in the east**. The crust-readers' whole art is reading that gradient.

**The crossing window (default taken, owner to confirm):**

| Days after the turn begins | The crust | Crossing |
|---|---|---|
| 0-50 | the turn: fronts, foundering plates, open seams | none |
| 50-120 | young crust, 2-3 m in the west and less in the east, steaming under rain, hot through a boot | the reckless and the hunted |
| **120-300** | **the window**: 3.5-6 m, its top 40-70 C after rain, still warm and ringing hollow over gas pockets | caravans, pilgrims, the Holm's supply |
| 300-365 | the old crust: thickest, but sagging and cracking at the west shore where the next turn will start; skylights open | smugglers only |

## 1b. The Holm, and what the turn makes of the people

**The island** (`edit_512.py`; the name is a working name): an oval **12 x 9 km** round **175.5,1315**, in the lake's
west half, **88 km^2**, its top flat at **2,700 m** (460 m over the crust), its edge breaking off in one cell to no lower
than 2,561 m. The turn never reaches it. The crossing to it is shortest from the west shore (about 7 km of crust) and
longest from the east (about 30 km). The lava runs all the way round it.

**What it is** is the owner's choice (section 9). All three fit the ground:
- **a holy place:** the one ground the turn spares, where the turn is watched and the calendar kept;
- **a fortress:** reached only in the window, and its approaches made of crust a garrison can read and an enemy cannot;
- **a prison:** "left for the turn". A prisoner put on the Holm cannot leave until the window opens. A condemned one is
  left on the crust itself, in the turn's path.

**The drama the patera brings** (each a proposal for the kit and the open world):
- **Crust-readers:** guides who judge the crust's age by its colour (glassy black and blue-sheened when young, dull and
  grey-brown when old, red-rimmed where it is about to founder), by the sound under a staff (a ring over thick crust, a
  dull knock over a gas pocket or a thin skin) and by the heat through a boot. Their art is the east-west age gradient.
- **Caravans and pilgrims:** the crust is the short way between the vale's south-west arm (Yan Warra's head, the West
  Bliss Cauldron) and the Tlahn Warra's corridor east. The long way is round the rim, over ice at 4.5 km or more. So the
  window is a crossing season, and the shores keep its camps.
- **Smugglers** cross out of season, on young or old crust, and the crust-readers who take them are the best paid and the
  shortest lived.
- **"Left for the turn"**: a punishment and a story.
- **The turn as the calendar:** the region's year starts when the first seam opens at the west shore, which can be seen
  from every rim at night.

**Crossing as gameplay** (core/hazard, section 5):
- **skylights:** holes through the crust onto the moving melt, steam-veiled, where an old plate has sunk at one edge;
- **gas pockets:** blisters under the crust, a hollow knock, that break and breathe CO2 and SO2 into the hollow;
- **young crust that looks safe and isn't:** a thin skin over a still-molten channel, glassy and inviting, the classic
  death;
- **rain on hot crust:** rain pooling on crust under 100 C, then a steam burst when it reaches a hot crack;
- **the fronts** for anyone caught in the turn: a slow wall of tilting plates and red seams, outrun on foot, but not
  across 20 km.

## 1c. The pancake domes (the owner, 2026-11-12)

**The model is Venus's pancake domes:** steep-sided, flat-topped domes of very stiff lava. They are commonly about 25 km
across (a cluster of seven at the east edge of Alpha Regio), and some are over 30 km (one by Aine Corona is about 35 km).
Venus's steep-sided domes as a class are commonly put at a few hundred metres to about a kilometre high (sources differ, and
none found gives a figure for pancakes alone). Venus's 90-bar air keeps gas in the magma, so it oozes instead of exploding.
**Krator's 1-2 atm does not do that.** The plan does not claim it.

**Krator's route to a dome:** silicic magma that **degassed slowly** on a slow rise. Stiff, gas-poor rhyolite comes out as
a dome on Earth too (Chaitén 2008, Cordón Caulle 2011-12, Mono Craters), often after a short explosive opening that leaves
a pumice apron. The silicic magma comes from **bimodal volcanism**: a long-lived basalt heat source melts the crust round
it into rhyolite, as in Iceland, Yellowstone and Afar. **In Firebliss the patera is that heat source.** Its basalt has
cooked the arc's older andesitic crust for long enough to melt it, and Firebliss already lists obsidian.

**Size:** 8-14 km across. That is bigger than Earth's biggest silicic lava body (Cerro Chao in Chile: a coulée about 14 km
long, at least 26 km^3, its flow front 350-500 m; Self et al. 1994, *JGR* 99, read through secondary sources) and smaller than
Venus's. **Height:** 400-550 m over their own ground. A stiff lava's thickness goes as its yield strength over (density x
gravity), so at Krator's 0.75 g the same lava stands a third taller than on Earth.

**The five** (`edit_512.py`; the names are working names; each 1-2 cells of wall, flat on top):

| Dome | 5.1 px | Across | Ground | Top | Height | From the shore | What it is |
|---|---|---|---|---|---|---|---|
| **North Glass** | 175,1302 | 12 km | 5,133 m | 5,633 m | 500 m | its edge 11 km | on the north shoulder over the Holm: the lookout over the whole lake, the obvious stronghold |
| **South Glass** | 175,1335 | 14 km | 4,503 m | 5,053 m | 550 m | 13 km | the largest; over the lake's south shore and the Labyrinth side |
| **West Glass** | 157,1324 | 10 km | 4,819 m | 5,269 m | 450 m | 22 km | over the vale's south-west arm, where the caravans start their crossing |
| **Ember Glass** | 201,1331 | 8 km | 4,679 m | 5,079 m | 400 m | 24 km | the smallest and youngest-looking (default taken: it still steams) over the Tlahn Warra's corridor |
| **Gate Glass** | 211,1305 | 10 km | 5,396 m | 5,846 m | 450 m | 37 km | on the high ground north-east, over the corridor's head toward Firebliss Mons |

They ring the lake at 11-37 km from its shore. Each is a natural fortress: glass cliffs 400-550 m high, one or two ways up
where a flow lobe has slumped, a flat top with snow-melt pools. They are the **obsidian** of the range's trade (blades,
mirrors, the Kimr's and the Fellgangs' points), with pumice on their aprons. Two of them make small upslope hollows where
they dam a gully (South Glass 23 to 47 pit cells, Ember Glass 23 to 30: dome-dammed ponds, real on Earth too).

## 1d. The heat low: the lake makes its own weather

A few TW on one spot in 1.2 atm air makes a **heat low**. The crust's 3 kW/m^2 is ten to twenty times what the sun puts
into the ground on a mean day. So:
- **Surface wind blows toward the patera at all times,** strongest through the gaps in its walls (the Tlahn Warra's
  corridor from the east, the vale's south-west arm). It is the range's other wind beside the north-west westerly: on the
  lake shore it can blow against the westerly.
- **A permanent storm column** stands over the lake, a pyrocumulus fed by the heat and by the steam boiled off the rain.
  It is the landmark of the south-west, seen from the Labyrinth and from Copper Glacier. Its anvil drifts south-east with
  the vents' plume (seed section 1).
- **A ring of rain and lightning** falls round it, where the column's outflow comes down. On the model (`edit_512.py`):
  **+900 mm a year at its peak, 8-24 km off the shore, nothing past 56 km**. Over the ring the mean rain goes from 647 to
  1,191 mm over 3,970 cells. Most of the ring lies on the plateau at 4-5 km, where it falls as snow and feeds the ice. Only
  on the patera's walls and in the vale's south-west arm does it fall as rain. The classes in the ring stay (ET, EF, Dfc,
  Cfb: they are set by the cold, not the rain).
- **Over the crust itself** rain hardly lands: it flashes to steam (the model holds 1,200 mm there, what falls and boils off).

The model's wind raster (`wd`) is not touched: the inflow is the kit's weather, not the map's. If the owner wants the map's
wind to show it, that is a later model edit.

**The patera floor's own climate** (`edit_512.py`, default taken, owner to confirm): a heat island over the crust, mean 28 C,
warm month 34, cold month 20, hottest afternoon 50 and coldest night +8. These are air temperatures a few metres over a crust
whose own surface is at 40-250 C. It takes a new class **`L`, patera (lava-lake crust)**, colour `#5a1a0a`, appended to the
model's classes so no other class's index moves.

## 1e. Life ringing the shore

From the crust outward:
1. **The hot margin** (the shore's first few hundred metres, ground over 60 C): bare, the ember mats only.
2. **The Hearths' heat-eaters** (`biomes/hearths/PLAN.md`, read in place): on ground at 25-60 C they are the forest, and
   the stokers mark where the heat is moving. The shore is the Hearths' warm disc drawn as a ring 150 km round. A Krator
   native lineage, not Earth's.
3. **The rain ring:** native life and Earth life (the seed's valley-floor flora, the geyser kit's mats in the steaming
   gullies, the Labyrinth's strays up the Tlahn Warra) where the rain falls as rain: on the walls and in the south-west arm.
   Snow algae and the cold lineage where it falls as snow.
4. **The domes:** glass, so almost nothing. Lichen on the pumice skin, snow-melt pools on the tops.

The fauna kit owns the animals. New for it: scavengers that work the crust's edge for animals the gas pockets kill (the
dead-bird sign of section 5, at a larger scale).

## 1f. Ideas set aside

- **A Loki-sized patera (200 km):** about 94 TW, 70-180% of Krator's whole heat budget, in one spot (1a). Too big.
- **A lake under 20 km:** honest, but then the turn takes two weeks, the island shrinks to a hill, and the heat low is a
  thunderstorm rather than a landmark. 48 x 32 km keeps every part of the brief.
- **Lava as water on the map** (the model's lake raster): the page would paint a lava lake blue, give it lake rain and route
  rivers into it. The crust is land at 2,240 m, its own class `L`, with a vent record for the page's glow and a basin record
  for the lake.
- **Venus's reason for the domes** (pressure suppresses explosion): wrong at 1-2 atm (1c). The domes are degassed magma,
  each with a pumice apron from its explosive start.
- **Domes on the patera's floor:** rhyolite rising through a basalt lake would mix or founder. The domes stand on the
  shoulders, where the crust melted.
- **The turn triggered by the Double Dark's tides:** the Week and the Thirteen pull on Krator far too weakly. The Double Dark
  can be the turn's calendar (1a), not its cause.
- **A permanent town on the shore:** the seed keeps the range a frontier, and the heat low's storms and the gas make the
  shore a camp ground, not a home. The Holm is the one question (1b, section 9).

## 1g. What the seed lost or changed

- **The Great Firebliss Vale is gone.** Its tarn (60 cells at 2,280 m), its sinter, its Cfb floor and the seed's station 1
  are under the crust. The seed's best outpost valley ("the largest valley and tarn; the best ground to grow on") is now the
  patera: the largest danger and the largest sight in the range. The outposts (section 6) are the other three valleys and
  the shore's benches.
- **The Tlahn Warra** heads on the patera's east lip (199,1323) instead of the tarn, 306 km long instead of 326, fed by the
  rain ring.
- **The range's warmth has a cause.** The seed's "geothermal basins" are now the patera's outer warmth (the valleys are 64
  to 99 km off: their own vents still heat them).
- **The range is no longer empty of traffic.** Nobody lives here still, but the crossing season brings caravans, pilgrims,
  crust-readers and smugglers, and the Holm may hold people (section 9).
- **New hazards:** the crust, the turn, the heat low's storms and lightning (section 5).
- **New resource:** obsidian and pumice from the domes, in quantity (section 3).
- **Kept:** the five volcanoes, the plume, Solfatara Glen, East Bliss Vale, West Bliss Cauldron, the Fellgangs and the Kimr,
  and every hazard of the seed.

## 2. Air and climate

- **Air:** at Copper Glacier's figures (1.19 atm at 2,380 m, 0.71 atm at 6,500 m), the valleys are at about 1.15-1.2 atm,
  the range's median ground (4.7 km) at about 0.9 atm, and the summits at 0.7-0.75 atm. Thin air is a hazard over the
  valleys' rims (`KHAZ.provide('pressure')`).
- **Climate:** the valleys are temperate, the arc is tundra and ice (ET, EF, HF, HT), and the summits are ice. Read each
  station's mean temperature and rain from the model's `tm` and `p` fields when the kit starts, as Copper Glacier's plan did.
  The plume shades the range's south-east side and drops ash on its snow.
- **The patera's air** (1d): a heat low with an inflow from every side, a storm column over the lake and a ring of rain
  and lightning (snow on the plateau) 8-56 km off its shore; a heat island of 28 C mean over the crust (class `L`).

## 3. Who comes here

- **Nobody lives here.** No settlement or polity polygon lies in the range, and the plan keeps it that way: it is a frontier.
  The one question is the Holm (1b, section 9): the plan settles nobody there, and the model carries no settlement marker.
- **The crossing season** (1a, 1b): in the window (days 120-300 of the turn's year) **caravans and pilgrims** cross the
  crust between the south-west arm and the Tlahn Warra's corridor, led by **crust-readers**; out of season, **smugglers**.
  Their camps stand on the west and east shores' benches (`core/camp`), struck when the window closes.
- **Fellgang hunters** come over the fells from the north and east. The Fellgangs descend in part from the Tungangs who fled
  the tunnel wars up onto the fells (`LORE.md`, "The tunnel wars"). That is why the range's rivers carry Tungang names.
- **Kimr hunters** come up the Warras' gorges from the Labyrinth, following the megafauna that stray up in summer (the
  Labyrinth's natives: `biomes/labyrinth/PLAN.md` section 5).
- **What they leave** (drawn by the kit, all temporary):
  - hunting camps in the valleys: hide shelters, drying racks, hearths, cached gear (`core/camp`, `KCAMP`);
  - cairns and marked trails along the gorges;
  - butchery sites;
  - each people's own marks: Kimr Aurochs-horn markers, Fellgang stone signs.

  Two peoples share the same hunting grounds and avoid each other, so a camp may be abandoned, raided or contested.
- **What they hunt and gather:**
  - megafauna that stray up from the Labyrinth (mammoth, woolly rhino, giant elk; `biomes/labyrinth/PLAN.md` section 4);
  - the range's own animals (section 4);
  - sulphur, and the domes' **obsidian and pumice** (1c): blades, mirrors and points, the range's trade good;
  - the valleys' hot-spring minerals.

## 4. Life

The valleys are lush pockets in a bleak arc. Most of their life is Krator's native kind, read in place from the kits that
already have it, with the Labyrinth's Earth stock straying in along the rivers.

| Zone | Life | From |
|---|---|---|
| **Valley floors** (to ~2,700 m) | warm meadow and fern, conifer groves in the lee of the walls, reeds round the tarns | the geyser kit's and the swbay kit's species; the Labyrinth's parkland trees along the Warras |
| **Tarn shores and sinter** | thermophile mats in bands of colour by temperature (white, yellow, orange, green, brown), sinter steps, hot-spring grasses | the geyser kit (`biomes/geyser`) |
| **Fumaroles** (Solfatara Glen) | sulphur crusts, acid-tolerant mosses, almost nothing else | the Throne's vent flora |
| **The ash slopes** (2,700-4,500 m) | sparse cushions, ash-desert plants, lichen on the lava | the Throne's ash-desert flora; Copper Glacier's cushions |
| **The ice** (over ~4,500 m) | snow algae, ice worms, frost coral at the moraines | Copper Glacier (`biomes/copperglacier`) |
| **Fumarolic ice caves** (the summit craters) | the cold lineage's mats and glow, round warm vents under the ice | the Throne's glacier station |
| **The patera's shore** (1e) | the ember mats on the hot margin, then the heat-eaters' forest on ground at 25-60 C, the stokers at its edge | `biomes/hearths` (read in place) |
| **The rain ring** (1e) | the valley floors' flora on the walls and in the south-west arm where it rains; snow algae where it snows | as the valley floors; Copper Glacier |
| **The domes** (1c) | lichen on the pumice skin, snow-melt pools on the tops; almost nothing on the glass | Copper Glacier's lichens |

**Animals:**
- the Labyrinth's strays in summer, in the valleys and the gorges;
- the range's own: mountain goats and ibex on the cliffs, marmots, raptors riding the valleys' thermals, and the native
  glowing ice worms on the high ice.

The fauna kit owns them all.

## 5. The hazards (environmental)

The range's dangers come from the ground and the air, not from enemies. Each maps to a `KHAZ` kind (`core/hazard/README.md`:
heat, cold, gas, acid, poison, fall, pit, drown, sink, slip, crush, lava...) or to a weather provider.

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Gas pooling** (CO₂ and H₂S settling into hollows on still nights) | the valley floors, the craters, the caves: the warm valleys' trap | `gas`, strongest at night and in still air (an amendment: section 8) |
| **Scalding water and hot ground** | the tarns' hot margins, the springs, the geysers, Solfatara Glen | `heat` |
| **Sinter crust over boiling water** | the sinter terraces and the springs' aprons | `sink`, a crust that breaks underfoot (an amendment: section 8) |
| **Acid** | crater lakes, fumarole fields, rain under the plume | `acid`; `KHAZ.provide('rain')` and `'ph'` |
| **Ashfall and whiteout** | the plume's track (the south-east side), any time the vents puff | weather: the plume as fog and ash fall; `slip` on ash over ice |
| **Lahars and outburst floods** (glaciovolcanic: meltwater released under the ice) | the Warras' gorges | `drown` and `crush`, timed: a flood that runs the gorge (an amendment: section 8) |
| **Phreatic blasts** | geysers and steaming ground | `heat` and `crush`, timed |
| **Crevasses and cliffs** | the ice and the gorge walls | `fall` |
| **Cold and thin air** | everywhere over the valleys | `KHAZ.provide('temperature')`, `'pressure'` |
| **Lava** | the Copper-Fissure Vent's active fissure, and the patera's skylights and foundering margin | `lava` (`KHAZ.GROUND.lavaFlow`; `KLAVA.bind`) |
| **The crust** (1b) | the patera: thin young skin over a molten channel, the old crust's sagging west margin | `sink`, its strength from the crust's age (an amendment: section 8) |
| **Skylights** | the patera, where an old plate has sunk at one edge | `lava` and `fall`, veiled in steam |
| **Gas pockets** | blisters under the crust; the shore's hollows downwind | `gas`, released when a blister breaks |
| **Heat through the boot** | everywhere on the crust, by its age | `heat`, read from the crust's age |
| **Steam bursts** | rain pooled on the crust reaching a hot crack | `heat` and `crush`, timed |
| **The turn** | the whole lake, once a year, two fronts at about 1 km a day | `lava`, `crush`, `sink`, timed by the calendar (an amendment: section 8) |
| **The heat low's storms** | the rain ring; lightning on the domes and the rims | weather (`ATMOS.weather` storm, `fx/lightning`) |

The kit should make the hazards readable before they are deadly. Every one has a sign:
- dead birds and bare ground for gas;
- colour for heat;
- a hollow sound and steam at the crust (and on the patera, the crust's colour, its ring under a staff, its heat through a boot);
- grey sky for ash;
- a rising roar for a flood.

## 6. The oases as outposts

If the player can reach one of the valleys, it is a good place for an outpost:
- it has water and warmth;
- it has ground to grow on;
- it is a resource next to sulphur, obsidian and the hunt;
- it is safe from everything but the range itself.

Each valley is a different bargain:

| Valley | For it | Against it |
|---|---|---|
| **East Bliss Vale** (1,960 m) | the lowest and warmest; nearest the Labyrinth (Weyt Warra) and the Copper Glacier pass; the hunters' usual way in, so trade | the most visited, so camps and quarrels; a lahar route |
| ~~Great Firebliss Vale~~ | **taken by the patera (1g).** The shore's benches (the south-west arm, the east lip) are the crossing camps' ground: warm, watered by the rain ring, and the Holm's trade | the heat low's storms, gas downwind of the crust, and the turn |
| **Solfatara Glen** (2,119 m) | the sulphur, the range's richest resource | acid, fumes and hot ground: a works, not a home |
| **West Bliss Cauldron** (2,639 m) | the most hidden and defensible: a crater moat under Mount Pyre | the highest, coldest and most remote; a crater, so the worst gas trap |

**No spot is picked for the player** (the owner, 2026-11-09): the player sets up where they like. What the world needs is an
**outpost registry**: "outpost" is the owner's shorthand for any **player settlement**, from a camp to a town. NPC outposts
stay conceptually and mechanically distinct: they are the world's settlements and camps (`core/hamlet`, `core/camp`), not
registry records. The registry belongs to the open world, not to this kit; it is being built as core work (the owner,
2026-11-09). This kit only
supplies its candidates: the oases' benches (water, warmth, gas and flood safety) as hints the registry may read, and nothing
drawn on the ground for them.

## 7. Stations (proposed, on the 5.1 map; rewritten 2026-11-12 for the patera)

World km = 5.1 px x 2. The range lies in the 5.1 expansion (x under 272), where the old canvas has no ground, so each
station's `station.json` gives its 5.1 px with `"canvas": "5.1 (1821x1723)"` (the model test reads it unshifted). Each page
is the usual 5.2 km square.

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **The Crossing** | 170,1315 | the west shore at 2,740 m over the crust at 2,240 m; the Holm 7 km out | the patera from its west shore, where the turn starts and the crossing to the Holm is shortest: the crust in its age bands, a crossing camp on the bench, crust-readers' marks, the column overhead, the heat-eaters on the warm shore; skylights, gas pockets and young crust on the way out. The turn on the page's calendar (`?turn=` for its day) |
| 2 **The Holm** | 175.5,1315 | a flat top at 2,700 m, 460 m over the crust | the island the turn never reaches: its cliffs, the crust all round, the fronts passing on both sides in the turn; what stands on it is the owner's answer (section 9) |
| 3 **North Glass** | 175,1302 | a dome top at 5,633 m, its walls 500 m | the stronghold over the lake: obsidian cliffs, the pumice apron, a snow-melt pool on the top, the whole patera below, lightning in the storm season |
| 4 **Solfatara Glen** | 238,1322 | the tarn at 2,119 m in a shallow glen | the fumarole field: sulphur chimneys, acid pools, mud pots, sulphur gatherers' tracks; the Tlahn Warra through it |
| 5 **East Bliss Vale** | 284,1318 | the tarn at 1,960 m | the way in: the Weyt Warra's gorge up from the Labyrinth, a Kimr camp, strays from the Labyrinth at the water, the lahar marks in the gorge |
| 6 **Firebliss Mons** | 206,1284 | the crater floor at 5,480 m, the rim at 6,380 m | fire and ice: the glaciated cone, the steaming crater breached south-east, fumarolic ice caves, the plume overhead, the patera's column 64 km south, thin air |

Station 1 comes first: it holds the patera, its crossing, its people and its hazards at once. The seed's station 1 (the
Great Firebliss Vale's tarn) is gone with the vale. A seventh station could be West Bliss Cauldron, or the Copper-Fissure
Vent's lava, if the owner wants either.

## 8. Core adoption (written first, as the working rules ask)

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| volcanoes | `KRELIEF.volcano`, `KRELIEF.range` (38) | the cones, the breached craters, the spine |
| the valleys | `KRELIEF` landforms (`38c`: `maar`, `stepcut`, `terraces`), `KRELIEF.waters` | the moats, benches and the sinter steps' ground |
| lava and tuff | `KLAVA`, `KSTRATA` recipes (tibasalt, tuff) | the flows on the slopes, the walls' bedded ash |
| glacier and frost | `KGLACIER` (44g), `KFROST` (42) | the summit ice and its caves, patterned ground on the slopes |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | the ash, the sinter, the mats as documented masks, relief on every station; the far cones, and the plume as far sprites (`KFAR.sprites`) |
| water | `core/water` (`WATER.open`, `flow`, `spring`, `geyser`, `terraces`) | the warm tarns, the Warras, the springs, the sinter terraces |
| flora | `core/biome` | the native species read in place from the geyser, swbay, Throne and Copper Glacier kits; the Labyrinth's trees along the rivers |
| sky, weather | `core/atmos` | the standard sky; the plume's fog and ash fall; the dust season's machinery (`fx/89-atmos-fx-dustseason.js`) for ash |
| hazards | `core/hazard` (`KHAZ`) | section 5 |
| camps | `core/camp` (`KCAMP`) | the hunters' temporary camps |
| fauna | `kits/fauna` | strays and the range's own animals, as `BIO.record` records |
| resources | `kits/resources` (`KRES`) | sulphur, obsidian, copper at the Copper-Fissure; read the geology when the kit starts |
| the patera's lake | `KLAVA` (46): the lake as a `pond` held at the crust's level, `vent` for the fountains behind a front, `heat(k)` for the seams' glow, `KLAVA.bind` for the hazard; `46b-core-lava-layers` for the crust's layers | stations 1 and 2 |
| the crust's ground | `KGROUND` (43) layers on the crust: the age bands (glassy blue-black to dull grey-brown), the red seams, the steaming rain pools; `KTHERM` (47) for the ground's temperature, which the heat-eaters' line and the boot's heat read | stations 1 and 2 |
| the patera's walls, the Holm, the domes | `KRELIEF` (38): the walls and the Holm's cliffs as `range`/scarps; the domes as flat-topped tables (`38c` landforms: a mesa with a slumped lobe); `KSTRATA` (35) recipes: the walls' basalt and tuff, the domes' flow-banded rhyolite (a new recipe, below) | stations 1-3 |
| the heat low | `core/atmos`: `ATMOS.weather` in storm mode most of the year, `fx/89-atmos-fx-lightning.js`, the column as a far sprite (`KFAR.sprites`), the inflow as `ATMOS.windBase` pointing at the lake | stations 1-3, 6 |
| shadows | `core/shadow` | off at load |
| tags, space, mask, host, export, materials | as every kit | |
| city, hamlet | `core/city`, `core/hamlet` | no: nobody lives here. Outposts go in the open world's registry (section 6) |

**Core amendments the range needs** (no new module; most are shared with the region plans reviewed 2026-11-09):
1. **Geothermal surfaces:** mud pots, the fumarole kind with steam and runoff, sinter and mat decals. Already owed in
   core/water's README, and wanted by godshearth, twins, greatchasm and seouterwall.
2. **Hazard kinds:**
   - a crust that breaks underfoot (twins and opalvalley want it too);
   - gas that pools at night and in still air (a timed `gas`, with the cold-air pool the region plans want);
   - a flood that runs a gorge on a cycle (lahar or outburst).
3. **A volcanic plume:** fog, ash fall and its shade along an azimuth from the vents, as a weather source in `core/atmos`. It
   would serve the Godthrone and the Throne's vents as well.
4. **The outpost registry** (open world, not this kit): every outpost as a record, with this kit's oases offered as candidate
   sites (section 6).

**New in core for the patera** (2026-11-12; each small, each a proposal; none is built):
5. **`KLAVA.turn(cfg, day)`**, plain data (`[G data]`): the crust's age at a point from the turn's calendar. Two fronts start at
   a point on the shore and run round an obstacle (the island) at a speed, so `age(x, z, day)`, `thickness(age)` (Hon's
   sqrt law, its constant a setting), `surfaceC(age, wet)` and `front(day)` (the two front lines). KLAVA has no crust over a
   moving core (`LAVA.md`, limits); this does not simulate one, it times one. The hazard, the ground's bands and the glow all
   read it.
6. **A crust hazard with an age:** the `sink` kind's strength from the crust's thickness (`KLAVA.turn`), with `lava` under
   a skylight and `gas` from a blister. It extends amendment 2's crust that breaks underfoot.
7. **A heat low in `core/atmos`:** a point source of heat (`{at, TW, radius}`) that bends the wind toward it, holds the
   weather in storm over its ring, draws a column on the far field and raises lightning's rate on the ring's high ground. The
   Godthrone's summit and the Throne's vents could take a small one.
8. **An obsidian node kind in `kits/resources`:** `kits/resources/GEOLOGY.md` has no obsidian. Obsidian (and pumice) as a
   node on the domes and their aprons, graded by the glass's quality.
9. **A `rhyolite` strata recipe** (`KSTRATA`): flow-banded glass, pink-grey to black, with spherulites, a pumice skin on top.

## 8a. Textures

From the library (`core/materials/library`): `ground.lava.crust` and `ground.lava.veins` (the crust and its seams),
`rock.basalt.vesicular`, `rock.basalt.flowbanded` and `rock.basalt.polygonal` (the walls), `ground.obsidian` and
`stone.obsidian` (the domes' glass), `stone.pumice` (their skin and aprons), `rock.tuff`, `ground.ash`, `ground.sinter`.
**One gap:** a flow-banded rhyolite cliff (`rock.rhyolite.flowbanded`), entered in `core/materials/PROMPTS-NEEDED.md` with its
prompt. Until it comes, the domes' walls take `stone.obsidian` (said here, not papered over).

## 8b. Order of work

1. The model edit (done: `tools/scale-model/edit_512.py`, 5.1 edit 2).
2. The core amendments the patera needs: `KLAVA.turn` (5), the crust hazard (6), the heat low (7). Each is small and
   tested on its own. The seed's four amendments can go with them.
3. Station 1, the Crossing: the crust, the shore, the turn on the calendar, the hazards, the camp.
4. Station 2, the Holm, once the owner says what stands on it.
5. Station 3, North Glass, with the obsidian node (8) and the rhyolite recipe (9).
6. The seed's stations 4-6, after the Labyrinth (their strays lean on its fauna).

## 9. For the owner

- **An old outpost?** Should one valley hold a ruined hunters' lodge a player could take over, registered as an abandoned
  outpost?
- **The volcanoes' activity:** which vents are live (steaming, puffing ash, lava) and which are quiet? The plan takes all
  five as degassing and only the Copper-Fissure Vent as flowing.
- **The two peoples:** do the Fellgangs and the Kimr have a truce here, a border, or a feud?
- **Names:** the valleys and volcanoes keep Gemini's English names. Do they want Tungang or Kimr names too?
- **Order:** after the Labyrinth, since station 5 and its strays lean on the Labyrinth's fauna. The core amendments can
  go first: the open world and the other region kits want them too (section 8b).

**The patera and its domes (2026-11-12):**
- **The Holm:** a holy place, a fortress or a prison? Whose? (The plan settles nobody; the model carries no marker.) If it
  is held, by whom: the Fellgangs, the Kimr, a third people, or an order that keeps the turn's calendar?
- **The cycle:** once a year at the end of the rains (default), at every fourth Double Dark (the same year, reckoned by the
  moons), or every two years?
- **The crossing window** (days 120-300, default) and **the crust-readers:** which people are they?
- **The patera floor's climate** (28 C mean, class `L`, default) and **the rain ring** (+900 mm, 8-56 km, default).
- **Ember Glass still steaming** (the youngest dome, default): or are all five cold?
- **The names:** Firebliss Patera, the Holm, the turn, and the five Glasses are working names. Tungang ones (the rivers'
  tongue)? The Hum is Korona's, not this range's.
- **The heat low on the map's wind:** leave the model's `wd` as it is (default), or a later edit to show the inflow?
- **LORE.md** (proposed sentences, not written there): *"In the Firebliss Range, under the Great Firebliss Vale's old walls,
  lies Krator's one lava lake that a caravan crosses: the Firebliss Patera, 48 km long, under a black crust that founders
  and renews itself once a year, two fronts running round the island in its middle and meeting on the far shore. Its heat
  makes its own weather, a storm column over the lake and a ring of rain and lightning round it, and the crust-readers who
  guide the crossing judge the crust's age by its colour, its ring under a staff and its heat through a boot. Round it stand
  the Glasses, flat-topped tables of obsidian-skinned rhyolite melted out of the range's crust by the lake's heat."*

## Sources

- the owner's brief, 2026-11-09;
- `tools/scale-model/build_425_master.py` section 9E (the arc, the volcanoes, the valleys, the rivers, the plume);
- `smodel/nw_expansion.py` (the region);
- `model/data/vents.json`, `rivers.json`;
- `river-names-5.1.md` (Yan, Tlahn and Weyt Warra);
- the model's data at 260b90d44, read with `smodel.page`;
- `LORE.md` (the tunnel wars, the Fellgangs);
- `core/hazard/README.md`;
- `biomes/labyrinth/PLAN.md`;
- `biomes/copperglacier/PLAN.md`;
- for the patera and the domes (2026-11-12): the owner's chat of 2026-11-12; `tools/scale-model/edit_512.py` and its report;
  de Kleer et al. 2017, *Nature* 545: 199-202 (the waves); Rathbun et al. 2002, *GRL* (540 ± 10 days); de Kleer et al.
  2019, *AJ*, and Rathbun et al., EPSC-DPS 2019 (465-475 days); Hon et al. 1994, *GSA Bulletin* 106: 351-370 (crust
  growth, t = 164.8 C^2); Self et al. 1994, *JGR* 99 (Cerro Chao); NASA/JPL Magellan releases (the Alpha Regio and Aine
  Corona domes); `biomes/hearths/PLAN.md` (the heat-eaters); `core/terrain/LAVA.md`.
