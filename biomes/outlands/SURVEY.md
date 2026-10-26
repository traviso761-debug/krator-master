# outlands: the survey (P0, 2026-10-26)

What the scale model says about the ground the owner drew for the Outlands. **Source**: the Krator Scale Model, version
4.22 (the artifact's rasters: heights, rain, the five temperature maps, the rivers and the lakes), and its `regions`
collection read on 2026-10-26: `N Outlands` (biome), `S Outlands` (biome), `Tiers` (biome), `Coyote Kingdom` (political).
Cells are 4 km (16 km²), full px 2 km. Air is the model's rule, `1.6 atm * exp(-h / 8000 m)`. Temperatures are the model's:
mean, warmest and coldest month, hottest afternoon, coldest night. Heights are cell means: a cliff narrower than 4 km is
not in them. Nothing here was built; the numbers are the survey, and the verdict is in `PLAN.md` section 1.

## 1. The three polygons

| Polygon | Area | Box (px) | Elevation p5 / median / p95 | Air at median | Over 4.5 km |
|---|---|---|---|---|---|
| N Outlands | 405,000 km² | 968-1534 by 36-448 | 3,186 / 6,757 / 11,932 m | 0.67 | 82% |
| S Outlands | 219,000 km² | 1194-1510 by 286-630 | 2,122 / 6,414 / 8,966 m | 0.70 | 75% |
| Tiers (biome) | 129,000 km² | 886-1118 by 52-278 | -191 / 4,407 / 6,884 m | 0.91 | 46% |
| Coyote Kingdom (political) | 134,000 km² | 858-1108 by 40-288 | -392 / 4,395 / 6,715 m | 0.91 | 45% |

**The polygons are mostly the rim and the high plateau, not the basin**: 82% of N Outlands and 75% of S Outlands stands
over 4.5 km, where the model has ice lakes at 6.1-7.1 km (climate ET, EF), a salt lake and little else. The basins a
settlement could stand in are **three to five pockets inside them** (section 2). Overlaps: N x S 700 km²; N Outlands x Tiers
208 km²; N Outlands x Coyote Kingdom 224 km²; Tiers x Coyote Kingdom 119,500 km² (the same country); Tiers x Korona / NE
83,700 km²; Tiers x e badlands 18,900 km²; Tiers x the geographic `The Tiers` 34,800 km².

## 2. The basins (ground under 4.5 km inside each polygon)

| Basin | Area | Box (px) | Elevation min / p10 / median / p90 | Air median (floor) | Rain p10 / median / p90 | Mean temp | Warm month | Cold month |
|---|---|---|---|---|---|---|---|---|
| **N main** | 63,900 km² | x1226-1398, y122-352 | 925 / 2,144 / 3,681 / 4,158 m | 1.01 (1.43) | 31 / **235** / 1,266 mm | 8 °C (4-16) | 21 (17-27) | -5 (-9 to 6) |
| N east | 5,700 km² | x1426-1460, y256-312 | 3,757 / 3,828 / 3,950 / 4,353 m | 0.98 | 125 / 486 / 1,082 | 5 | 18 | -8 |
| N west | 2,100 km² | x1210-1226, y394-434 | 2,465 / 2,465 / 3,915 / 4,416 m | 0.98 (1.18) | 381 / 831 / 1,192 | 4 | 17 | -8 |
| **S main** | 41,400 km² | x1300-1422, y306-448 | 289 / 1,245 / 3,205 / 4,117 m | 1.07 (1.54) | 141 / **894** / 1,449 | 10 (4-20) | 22 (17-31) | -4 (-9 to 9) |
| S south | 13,000 km² | x1240-1320, y496-568 | 1,028 / 1,920 / 3,767 / 4,263 m | 1.00 (1.41) | 361 / 910 / 1,380 | 5 (2-14) | 17 | -8 |

(The N main and S main basins touch at px about 1300-1400, y 306-352: the two polygons overlap there.)

- **The floor is high.** The basins sit mostly at **3.2-3.9 km (1.0-1.07 atm)**, with the deep ground only in the valleys
  that run down into them: the lowest cell is **289 m (1.54 atm)**, and the lowest tenth of each main basin is under
  1.2-2.1 km (1.2-1.4 atm).
- **N main is the dry one** (median 235 mm; its p10 is 31 mm); **S main is not dry** (median 894 mm, a Cfa and BSk mix with
  a lake). The owner's brief says "dry": it holds for the N basin and the valley floors under the rain shadow, not for S.
- **Lakes in the area** (model lake list): a **salt lake at 2,241 m (1,348 km², BSk)** at px (1314,320); a lake at 2,345 m
  (289 km², **Cfa**) at (1316,186); a lake at **705 m** at about (1382,371), fed by the 47 m³/s stream below (the deep
  floor); a small Dfb lake at 4,364 m at (1230,368); and a string of frozen lakes at 6.1-7.1 km (ET/EF) on the rim,
  the largest 3,610 km² at 6,116 m (1466,354) and 1,749 km² at 6,185 m (1316,463).
- **Rivers**: the one perennial river in the basins is **unnamed stream 2**, 151 km, 47 m³/s, from 3,887 m to the 705 m
  lake at (1382,371); the other perennial one is a 39 km stream (16 m³/s) into the salt lake. Every other watercourse is a
  **dry wadi** (about 60 of them, 4-94 km), most with no flow: the dry wadis are the basin's drainage, as the brief wants.

## 3. The pass ("the corner of Korona")

A least-cost route from the Tiers (px 960,200) to the N basin, taking the lowest crest it can: it crosses at **px (1136, 84),
7,724 m, 0.60 atm**, inside the N Outlands polygon's narrow northern corridor (the polygon runs west along y 36-96 to px 968).
(The route is the lowest-crest one, not the shortest: the model's cheapest crossing, not a road.) **Every route in to the S basin
from the Tiers or Korona's south-east goes through that same crest**, at 7,724 m. So there is **one way in**, as the brief
says, and it is **a high pass in thin air**, not a low gap: the corner of Korona is where the rim is lowest, not low.

## 4. What this does to the plan

- The "outside the wall, dense air" assumption holds **for the deep ground only**: the basin floor in general is a **high
  basin** (3-4 km, about 1.0 atm), with dense-air valleys (to 1.5 atm) down in it. The **barrier is the 7.7 km pass at 0.6 atm**:
  a pressure-adapted lowland lineage still cannot cross it, so the isolation reasoning stands. The plan's survey test
  (floor under about 2.5 km) **fails for the basin as a whole and passes for the valleys**: see `PLAN.md` section 1.
- The Outlands **flora zones by height, not by the N/S line**: valley floors (0.3-2.5 km, warm, dense), basin floor
  (3-4 km, cool), plateau and rim (over 4.5 km: ET, ice lakes), the airless crest.
- The **ostriches and the Coyote Men** cross at 0.6 atm and live at 1.0: they are thin-air-tolerant highlanders, which fits.

## 5. Arcoindian II: candidate cliffs

A cliff on a 4 km grid shows only as relief in a 16 km window; the candidates are where the model has the steepest drop
(slope over 0.1 on a 4 km cell, relief over 700 m) inside the basins' polygons, under 3.8 km:

| Centre (px) | Relief (16 km window) | Base to top | Where |
|---|---|---|---|
| **(1239-1250, 330)** | 3,356 m | 2,102-3,789 m | the N main basin's south-west wall, beside the salt lake at (1314,320): 75-120 cells, the largest wall |
| **(1218, 410)** | 2,574 m | 2,465-3,790 m | N west basin's wall, the west rim; 42-47 cells |
| (1213, 272) | 3,016 m | 3,170 m | a small, very steep wall at the basin's west edge |
| (1289-1292, 503-526) | 2,250-2,490 m | 1,349-3,743 m | S south basin's north wall |
| (1270, 138-166) | 2,200-2,430 m | 1,491-3,736 m | N main basin's north wall, near the lake at (1316,186) |
| (1368, 230) | 1,911 m | 1,215-2,751 m | N main's eastern floor, a lower wall |

**Chosen (the owner's go-ahead, 2026-10-26): the west wall of the N main basin at about px (1240, 330).** It is the largest
and steepest wall in the survey, and Arcoindian II wants **water at its foot** (the building stands on a sill about 340 m over
the water, its hollow 280 m high, with a 340 m access shaft and a quay at the bottom; `kits/ancients/KNOWN_ISSUES.md`,
"Arcoindian II"): the model has **a lake at 2,132 m at (1240, 330)**, fed by wadi 60 (63 km, 3.8 m³/s) and wadi 143, at the
foot of a wall that rises to 3,789 m, a drop of about 1,650 m over the 16 km window, so a wall of 620 m or more over the water
has room. Air is 1.2 atm (2.1 km) at the quay and 1.0 atm (3.8 km) at the crest. It lies on the basin's western edge, **about
530 km (a route of the Gate's road down the basin's west side) from the pass at (1136, 84)**. Fallbacks, if the closer
look (the model's 4 km cells hide the wall's real profile) fails: the N west basin's wall at (1218, 410), over the 2,496 m
lake at (1220, 423), relief 2,574 m.

## 6. Climate classes, and the stations (2026-10-26)

The model's class raster over each polygon and over its **basin ground** (under 4.5 km); medians of elevation, rain and the
mean, warmest-month and coldest-month temperatures (°C):

| | Class | Area | Share | Elevation | Rain | Mean / warm / cold |
|---|---|---|---|---|---|---|
| **N Outlands** polygon | ET tundra | 137,600 km² | 34% | 6,483 m | 0 mm | -10 / 3 / -23 |
| | O airless rim | 121,700 | 30% | 10,553 | 0 | -34 |
| | BSk cold steppe | 30,400 | 7.5% | 3,749 | 220 | 7 / 20 / -6 |
| | BWk cold desert | 23,300 | 5.8% | 3,837 | 31 | 7 / 20 / -6 |
| N basin ground (71,800 km²) | **BSk cold steppe** | 24,700 | 34% | 3,684 | 235 | 8 / 21 / -5 |
| | **BWk cold desert** | 22,400 | 31% | 3,829 | 31 | 7 / 20 / -6 |
| | Dfb warm-summer continental | 9,700 | 13.5% | 3,938 | 894 | 5 / 18 / -8 |
| | Cfa humid subtropical | 8,400 | 11.7% | 2,592 | 1,020 | 14 / 25 / 3 |
| | WH highland lake | 2,600 | 3.6% | 1,389 | 596 | 22 / 29 / 14 |
| **S Outlands** polygon | ET tundra | 99,700 | 46% | 6,456 | 157 | -11 |
| | EF ice cap | 31,800 | 15% | 7,129 | 157 | -15 |
| | Dfb | 23,600 | 11% | 3,887 | 1,067 | 5 / 18 / -8 |
| S basin ground (54,700 km²) | **Dfb warm-summer continental** | 23,600 | 43% | 3,887 | 1,067 | 5 / 18 / -8 |
| | BWk cold desert | 9,000 | 16% | 2,216 | 157 | 14 / 26 / 2 |
| | Cfa humid subtropical | 7,100 | 13% | 2,691 | 1,318 | 12 / 24 / -1 |
| | Dfc subarctic | 3,900 | 7% | 4,366 | 455 | 2 / 15 / -11 |
| | **BSh hot steppe** | 3,900 | 7% | 1,070 | 502 | 21 / 31 / 10 |

**The N and S split is a dry/wet split, the reverse of the plan's first guess.** N Outlands' basin is **cold steppe and cold
desert (65% of it)**: the dry, open, ostrich country. S Outlands' basin is **cool, wet and wooded (Dfb 43%, Cfa 13%)** with a
**hot valley floor (BSh) and a cold desert shoulder (BWk)** on its lower ground. The plan's stations are moved accordingly
(`PLAN.md` section 6).

**Representative stations** (for each class, the cell of its largest patch nearest that class's own median elevation, rain and
temperature; px, then elevation and air, rain, mean (warm / cold; hottest afternoon / coldest night)):

| Station | Class | px | Elevation, air | Rain | Mean (warm / cold; hi / lo) | For |
|---|---|---|---|---|---|---|
| **N1** the cold steppe | BSk | (1344, 209) | 3,693 m, 1.01 atm | 235 mm | 8 (21 / -5; 30 / -14) | the Plains of Runners: ostrich herds, the nomads' ground |
| **N2** the cold desert | BWk | (1269, 130) | 3,802 m, 0.99 | 31 mm | 8 (21 / -5; 31 / -15) | the Nursery Plateau: the driest ground, the hexapods' nests |
| **N3** the lake shore | WH | (1356, 240) | 1,121 m, 1.39 | 596 mm | 22 (29 / 14; 35 / 8) | the deep valley's lake: the lush end |
| **S1** the montane woods | Dfb | (1337, 393) | 3,883 m, 0.98 | 1,176 mm | 5 (18 / -8; 25 / -15) | the Fog Rim: the tall fog-combers, the most endemic flora |
| **S2** the wet valley | Cfa | (1369, 346) | 2,858 m, 1.12 | 1,318 mm | 11 (24 / -2; 31 / -9) | the Farmland: the sedentary tribe's irrigated valley |
| **S3** the hot valley floor | BSh | (1384, 389) | 1,097 m, 1.39 | 502 mm | 21 (31 / 10; 40 / 2) | the warm foot of the river (47 m³/s into the 705 m lake) |
| **S4** the dry shoulder | BWk | (1352, 391) | 2,274 m, 1.20 | 141 mm | 14 (26 / 1; 35 / -8) | the Gem Hills: weathered rock and the workings |

The Cursed City (Trickster's House, px 1240, 330) stands between N1 and S2: Cfa at 2.9 km and cold steppe at 3.7 km round it; no
station of its own.

## 7. Routes from the nearest Ancient sites to Trickster's House (2026-10-26)

`tools/scale-model/ancient_roads.py`'s cost (the Ancient profile: a 4% ruling grade, tunnel where cheaper, only in tunnel over 9 km,
a bridge over water), from Trickster's House at px (1240, 330), with the settlements as the collection now holds them (54 nodes,
including the new arcologies and the Sleeping City):

| To | Cost | Route | In tunnel | Highest point |
|---|---|---|---|---|
| **Verge** (a city on Ancient ground; the nearest by cost, the one route in the draft network) | 1,351 | 845 km | 56 km | 9,805 m at px (1178, 419) |
| Yuni (the Ancient laboratory's city) | 1,596 | 1,120 km | 51 km | 9,424 m at (1182, 451) |
| **Fort Kreia** (the nearest ruin) | 1,728 | 1,111 km | 68 km | 9,902 m at (1180, 411) |
| Fort Ordo | 1,727 | 1,125 km | 68 km | 9,805 m at (1178, 419) |
| **The Sleeping City** | 1,740 | 1,115 km | 68 km | 9,805 m at (1178, 419) |
| Crescent (ruined arcology) | 1,768 | 1,186 km | 70 km | 9,728 m at (1178, 282) |

**Every route comes in by a rim tunnel on the basin's west side at about px (1178, 411-419)**, 56-70 km long under a crest of about
9.8 km (the Ancient profile does not cross above 9 km on the surface): about 60 px (120 km) west of Trickster's House.
**It does not use the Gate**, the surface pass at px (1136, 84), 7.7 km (0.60 atm), which is the Coyote Men's way in. So the Ancients'
road and the Coyote Men's are two different ways over the rim: the Ancients' underground from the south-west, the Coyote Men's over
the north pass. (The owner settled it: **the god's road runs from the Sleeping City through the Gate to Trickster's House**, section 7b: the Ancient road's tunnel is a separate way.)

## 7b. The god's road (settled, 2026-10-26)

**The god's road (the owner, 2026-10-26): from the Sleeping City, through the Gate, to Trickster's House.** `tools/scale-model/god_road.py` routes it on the Ancient profile with the surface capped at 8.2 km (so it crosses by the Gate, not by a higher crest): **1,938 km, all on the surface** (no tunnel; 4 km of causeway), the highest point **7,728 m at px (1171, 106)**, beside the Gate; leg 1, Sleeping City (px 772,446) to the Gate (px 1136,84): 1,265 km; leg 2, the Gate to Trickster's House (px 1240,330): 672 km. The route is `openworld/gods-road.json` (the polyline in map px with the ground under it) and `gods-road.jpg`. It is **not** the Ancient network's own road to Trickster's House, which comes in by a rim tunnel from the south-west (`SURVEY.md` section 7): the Ancients' road and the god's are two roads, and the god's is the one the Coyote Men run.

## 8. Not yet done

- **The polygons** themselves: the owner may want N Outlands and S Outlands trimmed to the basins (they enclose mostly
  rim), and the `Tiers` biome and `Coyote Kingdom` polygons are the same ground; decide what each is for.
