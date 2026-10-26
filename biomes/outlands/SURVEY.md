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

The **west wall of the N main basin at about (1240, 330)** is the strongest: the largest, steepest wall, at 2.1-3.8 km (1.2-1.0
atm), above a salt lake and beside the stream mouths. It is also the nearest wall to the pass of the candidates in the
**N** basin (the pass at (1136,84) is about 250 px, 500 km, away), so the god's road could run from the Gate to it. *A
suggestion, not a choice: the owner decides.*

## 6. Not yet done

- **The ancient roads**: `tools/scale-model/ancient_roads.py` needs the page and the settlements collection; not run.
  Whether an Ancient road already reaches the pass or the basin is open.
- **Climate classes** per basin (the model's `c` raster): the lake list gives BSk, Cfa, Dfb, ET, EF at its lakes; a
  per-polygon histogram is not in this pass.
- **The polygons** themselves: the owner may want N Outlands and S Outlands trimmed to the basins (they enclose mostly
  rim), and the `Tiers` biome and `Coyote Kingdom` polygons are the same ground; decide what each is for.
