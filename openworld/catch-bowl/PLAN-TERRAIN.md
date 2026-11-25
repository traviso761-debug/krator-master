# The Catch, the Bowl, the SE outer wall and the Stalker Range: the terrain survey and the pitfall register

**Revised 2026-11-24, second pass** (the owner: *"Include se outer wall and stalker range in the Sim as well"*). The
first pass covered `the catch` and `the bowl` only, and two of its figures were wrong. Both are corrected below and the
wrong readings are kept beside the right ones, so nobody re-derives them:

| First pass said | It is actually | Why it was wrong |
|---|---|---|
| "the lowest crossing of the Catch's north wall is **5,282 m** at px 1029,1300" | the **Godsgate's carved corridor** runs **2,284 to 3,739 m**, median grade 1.1 %, p95 3.5 % (section 5a) | it measured the lowest *column maximum* across a band. That answers "how high is the wall", not "how high must a road climb": a meandering carved corridor has a thalweg, and the thalweg is the road's answer |
| "**no dust weather**: `core/atmos` has no dust, so a `DUST_MODES` family is proposed" | `core/atmos/fx/89-atmos-fx-airload.js` was written **for the Catch's black storms by name** (the owner, 2026-10-26), with `ATMOS.dustSeason` and `ATMOS.gale` beside it, feeding `KHAZ.provide` | the first pass read `core/atmos`'s weather **modes** and stopped there; the storms live in its opt-in `fx/` layer (`PLAN-HAZARDS.md` is rewritten round this) |

Item 1 of the owner's brief: *"Assess terrain for conversion and make sure there aren't any pitfalls."* Everything below
is measured on **scale model 5.1** by `openworld/catch-bowl/tools/survey.py` (read-only on
`tools/scale-model/model/data`, numpy and PIL only). Rerun a section after any map edit and the numbers in this file can
be checked against it. Pixels are 5.1 (2 km a pixel); the model is 1,821 x 1,723 px, elevation -2,600 to 24,823 m.

Nothing here is *proposed*: it is what the map holds today. The judgements that follow each measurement are marked.

## 1. The polygons as they stand

The region's four provinces, and the two the seam touches:

| Polygon | Id | Kind | Box (px) | Box (km) | Inside | Elev min / med / max | Rain med | Temp med | Water | Over 8 km |
|---|---|---|---|---|---|---|---|---|---|---|
| `the catch` | `rmvka7icdn1dq` | biome | 959-1241 x 1288-1517 | 566 x 460 | 126,000 km² | -72 / 3,542 / 8,790 | 110 mm | +4 °C | 1.7 % | 0 % |
| `the bowl` | `rmvka5413efyi` | biome | 913-1255 x 1042-1193 | 686 x 304 | 121,000 km² | -1,284 / -754 / 4,347 | 298 mm | +27 °C | 8.0 % | 0 % |
| **`SE outer wall`** | `rmw4xy4tp9b29` | biome | 997-1356 x 1136-1352 | 720 x 434 | **153,000 km²** | 3,086 / **7,962** / 11,707 | 141 mm | **-21 °C** | 0.1 % | **49 %** |
| **`stalker range`** | `rmvkknh1am4fw` | biome | 1195-1476 x 1153-1483 | 564 x 662 | **255,000 km²** | 1,895 / **7,794** / 15,041 | **0 mm** | **-22 °C** | 0.1 % | **47 %** |
| `twins` (region 2's) | `rmw536m06wlyf` | biome | 935-1095 x 1419-1570 | 322 x 304 | 49,000 km² | 2,713 / 4,166 / 6,922 | 267 mm | +1 °C | 0 % | 0 % |
| `Stalker Gate` (a later region's) | `rmvstalkergate` | biome | 1333-1554 x 1093-1422 | 444 x 660 | 129,000 km² | 1,783 / 4,057 / 9,837 | 251 mm | +3 °C | 0.4 % | 3 % |

Also on the map: `Stalker Peaks` (`rmwstalkerpks`, geographic, 90,000 km², median 8,396 m, 15 % over 12 km — the owner's
note names Hub 01 and the 12-15 km peaks), `The Catch` and `The Bowl` as older *geographic* regions, `godthrone`,
`godstep valley`, `sedesert`, `Loom Chasms`, `The Slabfields`, `Siphon Pits`.

**`SE outer wall` is the wall between the Bowl and the Catch** — the 188 km the first pass called "the gap" and proposed
to bridge with a corridor. There is no gap: there is a province, with a **built kit of six stations**
(`biomes/seouterwall`, `dist/seouterwall.html` plus `gatetarn`, `ambertarn`, `jadecrest`, `mirrorscarp`, `coppertarn`)
and a 434-line plan whose subject is **the Godsgate**, the pass this whole crossing depends on. The owner's brief for it:
*"relatively inhospitable, the kind of place most would not want to stay for long, but might contain a handful of tiny
highland lake oases an enterprising player might find exploring. In the west, the Godsgate, the great pass to the Catch
and Xanadu runs."*

**`stalker range` is where the Stalkers come from.** 255,000 km² with **0 mm of median rain**, a median of 7,794 m and
47 % of it over 8,000 m: the least habitable province in the region by a wide margin, and the only one whose simulation
value is not economic (section 6a).

**Good news first.** Every one of these overlays already has a land style and a palette in `core/world`
(`41-world-fields.js` `BIOME_GROUND`): `the catch` draws on the **`desert`** style with a **`catch`** palette, `the bowl`
on `desert`/`desert`, `twins` on `volcanic`/`twins`, `stalker range` on `highland`/`outlands`. The `desert` style already
carries `dune: 1` (full dune seas) and `terr`/`gully` for the lake beds, and `WORLD.FIELDS` already names **`dune`,
`oasis`, `salt`, `cold`, `mist`** — the exact fields the Catch and Bowl kits read. There is no missing land style, no
missing palette and no missing field for this region. That was the largest risk and it is not a risk.

## 2. Scale: is one region still feasible with four provinces?

| The cut | Filled | Bounding box | Centre px |
|---|---|---|---|
| catch + bowl (the first pass) | 247,000 km² | px 913-1254 x 1043-1516 = 682 x 946 km = 645,000 km² | 1084,1280 |
| + SE outer wall | 400,000 km² | px 913-1355 x 1043-1516 = 884 x 946 km = 836,000 km² | 1134,1280 |
| **+ stalker range (the owner's ask)** | **649,000 km²** | px 913-1475 x 1043-1516 = **1,124 x 946 km = 1,063,000 km²** | **1194,1280** |
| + Stalker Gate (not asked for) | 708,000 km² | px 913-1553 x 1043-1516 = 1,280 x 946 km = 1,211,000 km² | 1233,1280 |
| *reference:* `xanadu-oidong-highrift` | ~295,000 km² | 1,037,000 km² at 1 km cells | a 7.6 MB page |

The four provinces fill **2.2 times what region 2 fills**, in a bounding box the **same size** as region 2's. That
reads alarming and is not, for one reason: **what the two new provinces add is empty.**

- The rasters are cut to the **box**, and the box is region 2's size. That cost is already paid.
- The **content** scales with what grows and what is built. `stalker range` has 0 mm of median rain, 78 % of it over
  5,000 m and **two settlements**; `SE outer wall` is 83 % over 6,500 m with **one**. Between them, 408,000 km² of new
  polygon carries about a dozen drawn places (the Godsgate, five tarns, Ranger HQ, Hub 01) and almost no flora.
- The one genuinely new cost is the **far horizon**: four provinces mean four sets of ridges, and the 12-15 km peaks of
  the Stalker Peaks now stand *inside* the box rather than beyond it (section 4).

So: one region, four polygons, 1 km cells, origin pinned at **px [1194, 1280]**. `Stalker Gate` is left out — the owner
did not ask for it, it overlaps `stalker range` by 70,000 km², and it belongs with Yuni, the Loom Chasms and the
Slabfields in a later region (`PLAN.md` section 3a).

**Overlaps** (`extract_region.py` gives the overlap to the *smaller* polygon, as `PLAN-BOWL.md` intends): `the catch`
takes its 6,000 km² shared with `stalker range`, its 5,000 km² shared with `twins` and its 26 px shared with
`SE outer wall`; `stalker range` and `Stalker Gate` share 70,000 km², which one region now cuts either way.

**The one overlap the no-split rule cannot resolve**: `twins` overlaps region 2's **`Xanadu Sultanate`** polygon by
992 px (4,000 km²), because a biome polygon and a political one are allowed to cross. No polygon can be moved to fix
that. The tie-break already handles it: `twins` is the smaller, so those cells read as twins in **both** cuts, and the
two regions agree about what grows there.

## 3. The Catch is closed, and the floor is small

`basins.json` answers the sealing question outright. The terminal soda lake stands at px 1035,1391.5: **level 318 m,
738 km², spill 6,159 m, surplus 0 m³/s** — a closed basin whose water would have to rise nearly six kilometres to
leave. The lore's "most sealed basin on Krator, no outlet at all" is what the map carries.

The floor has **five** closed basins, not one:

| Px | Level | Spill | Area | Kind |
|---|---|---|---|---|
| 1035,1391.5 | 318 m | 6,159 m | 738 km² | salt lake (the terminal lake) |
| 1081,1413.6 | 400 m | 488 m | 497 km² | salt lake |
| 1071,1427.6 | 368 m | 402 m | 257 km² | salt lake |
| 1107,1409.6 | 377 m | 442 m | 176 km² | salt lake |

*Judgement:* the four small pans sit behind sills 30-90 m above their floors. That **is** the wandering lake of the plan
(`biomes/catch/PLAN.md` section 4, "the way Lop Nur did"): the pans that hold brine in a wet decade and dry to playa in a
dry one are already in the data, with their levels. The region should read them from `basins.json` rather than invent
pans, and the lake's wandering becomes a season on the sim, not a texture.

**The floor itself is 32,000 km²** under 1,600 m (px 1005-1142 x 1367-1474, 274 x 214 km), of which **22,000 km²** is
under 600 m (px 1009-1126 x 1370-1451). *Judgement:* the dunes, lake beds and salt belong in that 274 x 214 km box, and
**three quarters of the catch polygon is wall, not floor** (74.5 % of it is over 1,600 m, 61 % over 3,000 m). A region
that treats the whole polygon as basin will grow dunes up a mountainside.

## 4. The walls: now inside the cut, not beyond it

Inside `the catch` the highest ground is **8,790 m**, and only 15 % of it is over 5,000 m. The lore's 10-17 km walls are
the **`SE outer wall`** north (median 7,962 m, max 11,707 m, 49 % over 8,000 m), the **`stalker range`** east (median
7,794 m, **max 15,041 m, 47 % over 8,000 m**) and the Godthrone north-west.

**The owner's ask changes this from a horizon problem into a terrain problem.** The first pass proposed drawing the walls
through `core/world/bake_horizon.py` because the 10-17 km rock lay outside a two-polygon cut. With the SE outer wall and
the Stalker Range *in* the cut, **408,000 km² of 6.5-15 km rock becomes streamed ground**, and three things follow:

1. **It is almost all unenterable, and that is the design.** Above about 8,000 m the air is `Class O` in the kit's own
   terms (0.40-0.44 atm at the Tharn ring walls) — `KHAZ`'s `thin-air` row runs from .6 atm "a person tires" to .06 atm
   "the blood boils". So the right treatment is **ground that is drawn and hazard that forbids**, not ground that is
   missing. `KHAZ.zones` already feeds `KWALK` and Godot's enter costs with `avoid`.
2. **The far horizon still matters**, for the Godthrone (25 km, west of the box) and the crater beyond. Keep the horizon
   bake; it is now carrying less.
3. **The vertical range grows.** The box now spans about -1,284 m (the Bowl floor) to 15,041 m (the Stalker Peaks):
   **16,325 m**, against region 2's 18,143 m, which it draws. Still inside proven ground.

*Judgement:* budget the horizon bake, and budget a **pass over what the 8 km ground costs to stream** — 83 % of the SE
outer wall and 47 % of the Stalker Range are ground no walker will ever stand on, and `minWave` (`WORLD.H`'s detail
cutoff) is the lever. A chunk no one can reach does not need 2 m vertices.

## 5a. The Godsgate: the corrected finding

**`biomes/seouterwall/PLAN.md` section 6.2 carved a pass, and the carve landed.** Following the corridor's own thalweg
(for each row, the lowest cell between px 1005 and 1058, which is the test a road takes):

| | |
|---|---|
| The thalweg's floor | **2,284 m to 3,739 m** |
| Its line | px **1026 to 1039**, meandering, over py 1195 to 1315 |
| Length, climb, descent | 413 km of polyline, 2,378 m of climb, 1,972 m of descent |
| Grade | **median 1.1 %, p95 3.5 %** |
| The saddle crest | **3,620 m at px 1031,1252** — the plan's figure, to the metre |
| The north sill | 3,595 m at 1026,1224 (planned 3,380) |
| The southern narrows | 3,886 m at 1035,1292 (planned 3,480) |

So the Godsgate is **a road, not a wall**: a 100 km trans-cordilleran trench floored at 3.4-3.7 km, at a gentler grade
than the Catch floor's own tracks. The first pass's 5,282 m was a column maximum across a band — the wrong test entirely
(see the header). A `ROADS` route at 8 % will follow this thalweg almost as it lies.

**Its own plan gives it everything else too** (`biomes/seouterwall/PLAN.md` section 3, **with its tunnel framing
corrected: see P17**): the Ancients' **30 m surface highway** at a 4 % ruling grade with board-formed cyclopean cuttings
and parabolic wind-baffle walls — **the** Ancient road between the Crater and the south, not a construction road for a
tunnel; the **Twin Gate-Horns** (Ilmenite Horn west, Shatter-Crown east); the
drainage divide at 1031,1252 where meltwater parts between `Guli rrija` north to the Bowl and `Wādī al-Qamar al-Kabīr`
south to the Catch; and **Bāb al-Hawa**, the 40 m Ancient shaft collar whose rubble plug still drafts +16 °C air upward,
with the pass's only safe overnight camp in the lee of its wind-baffle crescent. Names in all five tongues.

## 5. The ways in and out

| Route | km | z start..end | Max | Climb | Grade med / p95 / max |
|---|---|---|---|---|---|
| Jabal > Parabola | 516 | -1,206..1,716 | 1,716 | 5,372 | 0.9 % / 4.4 % / 21.5 % |
| Parabola > the Godsgate > Kolli (straight hops: **the wrong tool**, see 5a) | 416 | 1,716..1,446 | 6,918 | 14,145 | 3.6 % / 22.3 % / 47.3 % |
| Kolli > Arfwai > Stair | 190 | 1,446..1,379 | 1,739 | 3,757 | 1.1 % / 16.0 % / 29.7 % |
| Stair > Bitta > Lasso | 84 | 1,379..1,509 | 1,799 | 1,572 | 2.1 % / 12.9 % / 15.5 % |
| Lasso > Catch-Lookout | 59 | 1,509..3,690 | 3,690 | 2,471 | 2.3 % / 16.6 % / 35.6 % |
| Route B: Lookout > Brazier > Sinter-Gate | 152 | 3,690..3,777 | 4,723 | 1,891 | 1.7 % / 6.8 % / 19.7 % |
| Sinter-Gate > Strongbow | 184 | 3,777..1,400 | 5,148 | 2,957 | 2.7 % / 14.0 % / 47.1 % |
| Mantis > Solta > Jabal | 227 | -978..-1,206 | -656 | 1,052 | 0.6 % / 3.2 % / 7.1 % |

These are straight hops between the stops, so they are the *worst* case: a `ROADS` route at a held grade will be longer
and gentler. Three readings matter.

1. **The crossing's length is right.** Godsgate to Catch-Lookout measures 582 km of straight hops; routed, that is the
   lore's ~700 km crossing (`biomes/catch/PLAN.md` section 4). The sim's leg times (`CATCH_TUNE`) were set on these
   distances and need no revision.
2. **The north road is the easy part — corrected.** Section 5a: the Godsgate's carved thalweg tops out at 3,739 m at a
   median 1.1 % grade. The straight-hop row above reads 6,918 m only because a straight line leaves a meandering
   corridor. The plan's "6.2 km notch" was the notch's **altitude** before the carve; the carve replaced it with a
   3,620 m saddle. *Judgement:* the north road still wants the **trail** kind (pitfall P4) for its width and finish, not
   for its grade, and its laid line should be routed **along the thalweg**, not from pin to pin.
3. **The Bowl is flat.** Mantis to Solta to Jabal is 227 km at a median 0.9 % with a 7.1 % worst step: the Bowl's roads
   and the salt trains are easy ground. Jabal to Parabola climbs 2,900 m over 516 km, also easy.
4. **The south wall** between the floor and the Twins has its lowest crossing at **4,245 m (px 1079,1505)**, but the
   caravan road does not cross it there: it leaves by Lasso to Catch-Lookout (3,690 m) and over the col. That exit is
   `xanadu-oidong-highrift`'s to lay (`PLAN-TWINS-CROSSING.md` W2), not this region's.

## 6. The places, measured

| Place | Px | Elev | Rain | Temp | Note |
|---|---|---|---|---|---|
| Parabola | 970,1186 | 1,716 m | 314 mm | +15 °C | the north gateway, outside both polygons |
| Bab al-Hawa (the pin) | 1028,1246 | 3,661 m | 282 mm | +4 °C | 41 m above the thalweg beside it; the pin the owner dropped, still on the map (P6) |
| Bab al-Hawa (the plan's shaft, 1033,1258) | 1033,1258 | **4,795 m** | 251 mm | -2 °C | its plan puts the vent collar and caravanserai at **+3,590 m**: the pin is **1,205 m up the corridor's east wall** (P14) |
| Kolli | 1058,1367 | 1,446 m | 47 mm | +15 °C | first water down from the Godsgate |
| Arfwai | 1090,1387 | 1,074 m | 31 mm | +18 °C | the driest oasis; the Train's well by the pans |
| Ṣalṭ al-Bān | 1080,1428 | 458 m | 16 mm | +19 °C | the salt works; **pin not on the map** (P5) |
| the terminal soda lake | 1035,1392 | 313 m (water 318 m) | 16 mm | +21 °C | the lowest, hottest, driest ground |
| Stair | 1106,1442 | 1,379 m | 47 mm | +16 °C | the Hill arcology's springs' hollow |
| Bitta | 1088,1455 | 1,576 m | 47 mm | +14 °C | brackish |
| Lasso | 1083,1474 | 1,509 m | 47 mm | +14 °C | the last water before the Twins |
| White Gills Hermitage | 1015,1430 | 3,746 m | 110 mm | +2 °C | the pipe field; **the move landed on 5.1** |
| Mantis | 1113,1164 | -978 m | **1,553 mm** | +28 °C | the green pocket is real on the map |
| the Bowl salt lake | 1147,1141 | -1,079 m (level -1,158) | 408 mm | +29 °C | 3,129 km², spill -990 m, closed |
| Solta | 1169,1150 | -1,115 m | 659 mm | +29 °C | the Bowl's salt works; **pin not on the map** (P5) |
| Jabal | 1225,1149 | **-1,206 m** | 533 mm | +29 °C | on the **Bowl floor**, not on the Catch's rim (P8) |
| Hub 01 | 1344,1409 | **4,351 m** | 157 mm | -2 °C | its plan's figure to the metre; in `stalker range`, 255 km east of Stair |
| **Ranger HQ** | 1420,1242 | **1,982 m** | - | - | Yuni's Stalker-watch outpost, water 2 km off: the lowest, wettest ground in the Stalker Range, and the only habitable place in it (P16) |
| Arcbeam | 1016,1058 | 2,119 m | - | - | the Bowl's arcology, gentle upland |
| the Izani-Dasri village | 1042,1083 | 895 m | - | - | the Bowl's unnamed village |
| Strongbow | 1001,1596 | 1,400 m | 800 mm | +14 °C | region 2's, at the seam |

## 6a. The two new provinces, measured against their own plans

**The SE outer wall: the carve landed, the rescale did not.** `biomes/seouterwall/PLAN.md` section 6 is a two-step
terrain blueprint — step 1 rescales the cordillera (a 4,850 m median, **zero cells over 6,500 m**), step 2 carves the
Godsgate corridor, step 3 carves and fills the five tarns. Steps 2 and 3 are **on the map, to the metre**; step 1 is
**not applied at all**:

| Feature | Its plan | 5.1 | Delta |
|---|---|---|---|
| Godsgate saddle crest (1031,1252) | 3,620 m | **3,620 m** | 0 |
| Tarn 1 Gate-Bell (1016,1236) | 3,680 m | **3,680 m**, water 4 km | 0 |
| Tarn 2 Amber-Sinter (1064,1272) | 3,940 m | **3,940 m**, water 2 km | 0 |
| Tarn 3 Mirror-Slump (1134,1218) | 4,120 m | **4,120 m**, water 2 km | 0 |
| Tarn 4 Jade-Karst Polje (1208,1254) | 4,380 m | **4,380 m**, water 2 km | 0 |
| Tarn 5 Copper-Vein (1288,1184) | 3,820 m | **3,820 m**, water 2 km | 0 |
| Hub 01 (1344,1409) | 4,351 m | **4,351 m** | 0 |
| **the province's median** | **4,850 m** | **7,962 m** | **+3,112** |
| **cells over 6,500 m** | **zero** | **31,490 of 38,152 (83 %)** | - |
| Ilmenite Horn (1008,1248) | 5,480 m | 6,527 m | +1,047 |
| Shatter-Crown (1056,1244) | 5,760 m | 6,903 m | +1,143 |
| Bab al-Hawa shaft (1033,1258) | 3,590 m | 4,795 m | +1,205 |
| Tharn crater floor (1375,1525) | 6,185 m | 6,856 m, with a lake at **6,910 m** | +671 |

*Judgement:* every **named place** is where its plan puts it, because each was carved or filled individually; the
**matrix between them** is the untouched 8-11 km cordillera. That is a coherent and playable state — the pass works, the
tarns work — but it is not what the kit's six stations were designed to stand in, and the two Gate-Horns that frame the
Godsgate read 1,000 m too high. P13.

**The Stalker Range: nothing to simulate except its fringe.** 0 mm of median rain, a -22 °C median, 78 % over 5,000 m,
47 % over 8,000 m, 3 % over **12,000 m**, and two settlements in 255,000 km²: **Hub 01** (a ruined arcology with no
polity and no people, whose mad AI is the author's secret) and **Ranger HQ** at 1420,1242, which sits at **1,982 m with
water 2 km away** — a river valley on the province's eastern edge, where it overlaps the Stalker Gate. Everything
simulable in this province is at Ranger HQ or is a Stalker. P16, and `PLAN-SIM.md` section 4.

## 7. The pitfall register

Each pitfall is a thing that will bite the build if it is not handled, with what to do. **P18 to P21 were added on
2026-11-25 from the scale-model session's work**, and the first two of them are the only entries here that are *known*
to survive a new scale model: P18 is a property of the rescale's smoothing and P19 of the authored pages, not of any
model's bytes.

### P1 — `biomes/catch`'s own records are up to 209 km off the map *(blocking for item 3)*

`CATCH.OASES` (`biomes/catch/src/50-biome-catch-species.js`) still carries the 4.21 canvas. Shifted into 5.1 by the
model's own `legacy_shift` (+272, +330) and compared with the pins the owner's edit 5 set:

| Oasis | Kit px (4.21) | Shifted | 5.1 pin | Drift |
|---|---|---|---|---|
| Kolli | 738,944 | 1010,1274 | 1058,1367 | **209 km** |
| Arfwai | 792,1030 | 1064,1360 | 1090,1387 | 75 km |
| Stair | 834,1112 | 1106,1442 | 1106,1442 | 0 |
| Bitta | 806,1180 | 1078,1510 | 1088,1455 | 112 km |
| Lasso | 768,1236 | 1040,1566 | 1083,1474 | **203 km** |

Only Stair agrees. `PROPOSAL-CATCH.md` already flagged it in prose ("on 5.1 the oases stand where scale-model edit 5
put them ... not at the 100-150 km spacing below"); this is the measurement. **The region must take the oases from the
model's settlement list, never from `CATCH.OASES`**, and the kit's records want correcting (a `[G data]` edit, the names
and tongues unchanged).

### P2 — two of the kit's four station sites are now on mountainside *(an owner call)*

| Station | Kit px (4.21) | Shifted | Planned height | 5.1 height |
|---|---|---|---|---|
| 1 the sand sea | 800,1010 | 1072,1340 | ~350 m | **4,901 m** |
| 2 Stair's oasis | 834,1112 | 1106,1442 | ~1,000 m | 1,379 m |
| 3 the lake and lake beds | 763,1062 | 1035,1392 | ~318 m | 313 m |
| 4 the north fan | 738,944 | 1010,1274 | ~1,400 m | **7,037 m** |

Stations 2 and 3 still stand on the country they were drawn for. Stations 1 and 4 do not: the basin was reshaped after
4.21 and their points are now wall. `dist/catch.html` (the sand sea) and `dist/catch-fan.html` (the north fan) therefore
show ground the open world will never show at those pixels. This is not a region blocker — the station pages are their
own 6.6 km scenes — but it is a **kit-and-world disagreement the owner should rule on** before the region advertises the
Catch (`PLAN.md`, question 3).

### P3 — `core/world` has no hazard binding *(core work; blocking for item 2)*

`core/hazard` is built and **much richer than the first pass credited**: `KHAZ` with the opt-in `flow`, `env`, `bore` and
`tunnel` fragments (`KHAZ.front` for a travelling front, `KHAZ.crust` for ground that breaks underfoot, `KHAZ.night` for
air that pools, `KHAZ.bindWind`), **and an ambient bridge** — `KHAZ.provide(field, fn)` with `VOCAB.ambientKinds` already
carrying `thin-air`, `cold`, `hot`, `dust`, `ash` and **`caustic-dust` described as "for the Catch's black storms off its
dry soda lakes"**, plus `KHAZ.sight`, `KHAZ.seen` and `KHAZ.aim` on real aerosol optics. `core/atmos/fx/` supplies those
fields (`ATMOS.airLoad`, named for the Catch's black storms; `ATMOS.dustSeason`; `ATMOS.gale`, built 2026-11-10 for the
SE outer wall's God-Bore).

**What is missing is only the binding.** No fragment of `core/world` mentions `KHAZ`: hazards reach pages through
`core/biome`'s station hosts and `core/host`'s inspector, and a region page lists neither. So item 2 is mostly
**wiring two finished modules together**, which is a much better position than the first pass described.
`PLAN-HAZARDS.md` is rewritten round this.

### P4 — `ROADS` has one hard-coded grade and one width *(core work; blocking for items 4 and 6)*

`core/world/42-world-roads.js` fixes `const G=.08, HW=4` — the ruling grade and the half-carriageway — as module
constants, not options. Every way this region wants is a **trail**: the north road over a 5.3 km pass, the Catch floor's
track from oasis to oasis, the Twins' Route B. `PLAN-TWINS-CROSSING.md` W2 guessed this ("a `trail` and `path` kind, if
the roads code has none"); it is confirmed. A `kind` with its own grade, width and finish is a small, contained change
to `42` and `48s`, and it is shared with region 2's W2.

### P5 — the two salt works are not on the map *(blocking for item 3)*

Ṣalṭ al-Bān (`svhmyhf33w`, 1080,1428) and Solta (`s0zgu7u6yb`, 1169,1150) are **absent from
`model/src/60-settlements.js`**: `PROPOSAL-CATCH.md` records them as held in batch 5.1e10. The Train of Jabal works both,
and `CATCH_TUNE` already declares Ṣalṭ al-Bān as a place. `cut_site.py` would refuse the id. Two ways out, both
supported: a scale-model edit that lands the pins, or `SITES.json` rows with `"model": false` and their own `px`, `py`
(as Lāiṭwāl, Gihon and Strongbow's foot are carried today). **Recommended: `model: false` rows now, the edit queued**, so
the region does not wait on the map session.

### P6 — the dropped pins *(SETTLED 2026-11-24: Bāb al-Hawa and Ranger HQ stay, the Twins fort drops)*

**The owner, 2026-11-24: "Agree keep both."** `sbabalhawa01` (Bāb al-Hawa, the Vent-Shaft Caravanserai) and
`sz85a8i5js` (Ranger HQ, Yuni's Stalker-watch) **stay**; `sthetwins01` (the Twins Pass Wardenry) **drops**, as ruled on
2026-11-16. Bāb al-Hawa's pin wants moving onto the thalweg (P14); the three map edits are `PLAN.md` section 11.

The question as it was put:

The owner, 2026-11-16, dropped Gemini's Godsgate caravanserai and Twins fort, giving the reason **"Gemini's pin, with no
lore"** (`PROPOSAL-CATCH.md` question 6). On 5.1 they were dropped as `gem_godsgate` and `gem_twins_pass` in
`SETT_DROPPED['5.1e14']` and **re-added in the same batch under new ids**: `sbabalhawa01` "Bab al-Hawa (Godsgate)" at
1028,1246 and `sthetwins01` "Twins Pass Wardenry" at 1042,1525. Both are live.

**The reason has since stopped being true, and the owner may not know.** Six days before the drop,
`biomes/seouterwall/PLAN.md` section 3.3 (2026-11-10) gave Bāb al-Hawa a page of lore: *the Vent-Shaft Caravanserai*, a
40 m Ancient shaft collar of seamed white metal and bronze ring-bands sunk 1,400 m (its text says to the mid-point of
the Arcbeam-Stair tunnel: **P17 corrects that**), plugged by megabreccia 180 m down but still drafting +16 °C air
upward, with the
sunken concrete apron inside its cyclopean wind-baffle crescent turned into **the pass's only safe overnight camp** — a
roofless stone-and-salvage caravanserai where beasts are tethered out of the 100 km/h God-Bore, prayer wheels spin
beside Izani milestones and Yuni stencil signs, and divers winch down the choked shaft. The owner **also accepted** the
Bab al-Hawa shaft and the surviving Godsgate highway in the Ancient network on 2026-11-11 (`ANCIENT-NETWORK.md` 8.1,
answer 7). And **Ranger HQ** (`sz85a8i5js`) is a third pin of the same provenance — Gemini's trade model, 2026-11-14 —
that was never put to the owner at all.

So the question is not "is this a stale record" but **which of Gemini's three pins the owner now wants**, given that one
of them has acquired a kit's worth of lore and another has a Yuni garrison's job. `PLAN.md`, question 4.

### P7 — the gap between the polygons *(withdrawn: there is no gap)*

The first pass found 188 km of unclaimed ground between `the bowl` (ends py 1193) and `the catch` (begins py 1288), and
proposed a 20 km `cut_site.py` corridor across it. **That ground is the `SE outer wall` polygon** (997-1356 x
1136-1352), which the owner has now asked for. No corridor is needed: the north road lies inside a province for its
whole length. Parabola (970,1186) is inside `the bowl`, Kolli (1058,1367) inside `the catch`, and everything between
them inside the SE outer wall.

### P8 — Jabal is a Bowl town *(a wording fix, carried into the plans)*

`PROPOSAL-CATCH.md` calls Jabal "their town at the Catch's north-east". On 5.1 Jabal stands at **-1,206 m on the Bowl
floor**, 516 km from Parabola and 227 km from Mantis by way of Solta, with `the bowl` polygon over it. It is the Dasri's
**Bowl** capital and their gateway *toward* the Catch; the Catch's rim is 400 km of climbing away. Every plan here says
so, and `kits/dasri` was written for a Bowl town (its urban register is Sana'a and Shibam, its `ds_vil_*` register names
Arfwai, Solta and Salt al-Ban).

### P9 — the Twins polygon *(SETTLED 2026-11-24: the Twins are cut here)*

**The owner, 2026-11-24: "let's try and keep from splitting biome polygons between open world builds as much as we can
help it. We'll combine twins and catch to these other regions to tweak and perfect this one, huge, arid/mountain region
prior to joining to the XOH region."**

So `twins` is this region's, whole, and `PLAN-TWINS-CROSSING.md`'s grow-north is dropped. Measured, the fit is almost
exact: of twenty-two points of the Twins crossing — every oasis, trap, tube end, summit and waystation — **twenty lie
inside `twins` or `the catch`**, and the two that do not are **Route A's Vale portal** (938,1496) and **Strongbow**
(1001,1596), both in region 2's Xanadu Sultanate polygon. The two ways end there, marked `short`.

What it costs: region 2's **built and verified** tube spec (`src/48k-world-tubes.js`, W3, 2026-11-16) migrates here —
its own README admits *"only A1's first ~15 km are inside the cut's polygons"*, so 94 % of it was already planned on
ground region 2 does not hold. Region 2 is recut without the 1,424 px of `twins` its site squares held, and its baked
hash changes. `PLAN.md` sections 3 and 7.

**The one overlap no rule can fix**: `twins` crosses region 2's **political** `Xanadu Sultanate` polygon by 992 px
(4,000 km²). A biome polygon and a political one may cross, and no polygon can be moved to prevent it; the tie-break
settles it the same way in both cuts (the smaller polygon takes the overlap, which is `twins`).

### P10 — `biomes/gills` is a plan, not a kit *(blocking for the White Gills site)*

`biomes/gills` holds `PLAN.md`, `BIOME-API.md`, `materials.json`, `tex/` and **one source fragment**
(`src/44-gills-life.js`). There is no `build.py`, no `dist/`, no station. The showcase station #10 (the White pipe
field, the hermitage's own ground) was being built in a cloud session as of 2026-11-16 and is not on `main`. The
hermitage's **buildings** can be drawn with the Xanadu kit today; its **pipe field** cannot be read in place until the
kit builds. `PLAN-SITES.md`, the White Gills row.

### P11 — the tooling does not run in a fresh cloud container *(a session trap)*

`tools/scale-model/extract_region.py` imports `scipy` (`from scipy import ndimage`), which this container does not have,
so `cut_site.py` fails at import. `pip install scipy` fixes it; `openworld/catch-bowl/tools/survey.py` deliberately
avoids it. And every `--assert` verify of a world page wants `KRATOR_GL=gpu` on a lane
(`tools/harness.py lock`), which means the owner's machine or the cloud lanes — not this container.

### P12 — the Stalkers have no buried pose *(blocking for items 2 and 5)*

`kits/mechs` has `st_harpooner` and `st_blade` built, but its `KNOWN_ISSUES.md` lists, open: **no buried or dormant
pose** (the lore's defining behaviour — lying in wait under a hand's depth of sand), **no line on the harpoon** (the
thing that drags the quarry), and lopsided footprints. A Stalker ambush that cannot be drawn buried is a Stalker standing
in the open. `PLAN-RAIDS.md`, step R3.

### P13 — the SE outer wall's cordillera rescale never landed *(SETTLED 2026-11-24: the west is rescaled, the east stays)*

**The owner, 2026-11-24: "leave only east se outer wall high and airless."** Step 6.1 is applied to the **west**; the
**east** keeps its 8-11 km cordillera, airless, as the Stalkers' transit country. **Where the line falls is still open**
(`PLAN.md` question A): the data's natural break is at **x 1056** (the median jumps from 6,003 m to 7,281 m and the
share over 8 km from 1 % to 33 %), but that leaves four of the five tarns in the airless half behind 6.0-6.4 km rims —
hard at 0.44-0.47 atm, not lethal. The recommendation is the Godsgate's frame plus a ~25 km disc at each tarn.

The question as it was put:

Section 6a has the table. `biomes/seouterwall/PLAN.md` step 6.1 would compress the province into a **4,850 m median with
zero cells over 6,500 m**, "eliminating the unbreathable 8-15 km Class O pancake while keeping dramatic 2,000-3,000 m
local relief"; the map still reads **7,962 m median, 83 % over 6,500 m, max 11,707 m**. Steps 6.2 (the Godsgate) and 6.3
(the five tarns) did land, so the province is a working pass and five working tarns set in an un-rescaled wall.

Three ways forward, and this is the single biggest decision the two new provinces raise:
1. **Apply step 6.1** (a scale-model edit: it is written as deterministic numpy, and the kit's six station bases assume
   it). The whole province becomes enterable alpine country, the two Gate-Horns come down to 5.5-5.8 km, and the kit's
   stations stand in what they were designed for.
2. **Leave it.** The pass and the tarns work; the matrix is wall. Cheapest, and the region can be cut tomorrow — but the
   kit's stations are then 1-3 km lower than their surroundings and the "handful of tiny highland lake oases an
   enterprising player might find exploring" are reachable only along the carved corridors.
3. **Apply it to the western lobe only** (x 997-1150, the Godsgate's frame and tarns 1-3), leaving the eastern wall above
   Hub 01 airless, which is where the lore wants it anyway (the Stalkers transit the high snow-chutes).

*Proposed:* **(3)**, and ask. It gives the player the explorable half, keeps the Stalkers' half forbidding, and is a
smaller edit than (1). — **The owner chose this shape on 2026-11-24**; only the line's place remains.

### P14 — the Godsgate shaft pixel is 1,205 m up the corridor wall *(corrected 2026-11-25; fix with the cut)*

**As first written this said "Bāb al-Hawa's *pin*", and that was wrong.** The map session measured both and they are not
the same thing: **1033,1258 is the *plan's shaft pixel*** (`biomes/seouterwall/PLAN.md` 3.3's vent collar), which reads
**4,795 m** against the plan's **+3,590 m**, so the shaft is the thing standing 1,205 m up the corridor's east wall. The
**settlement** `sbabalhawa01` stood 30 m over its own row's thalweg, inside the trench, which is a different and much
smaller error. `SITES.json` and this entry both read as a claim about the pin and are corrected together.

What still wants settling is the shaft: its own plan puts the vent collar and the caravanserai at **+3,590 m** just
south of the 3,620 m saddle, and the corridor's floor at that row is at px **1027**. Either the plan's shaft pixel moves
~12 km west onto the thalweg, or the collar stands on a bench the region cuts (`WLAND`'s `bench` record). *Proposed:*
move it — the plan describes a **sunken** concrete apron on the pass floor, not a perch. The settlement's own pin was
moved to 1027,1258 by map edit 2, which is applied (5.1-dated).

### P18 — applying the SE outer wall's rescale breaks the river beds unless they are guarded *(a law of the method, not a 5.1 number)*

**Found by the map session, 2026-11-25, and the most portable finding of the whole survey.** `biomes/seouterwall/PLAN.md`
step 6.1 compresses the cordillera, and **the compression follows `E_base`, the 9 km-smoothed base** — which is *high*
in a valley ringed by 8 km walls. So the valley floors come down with the walls, and each tarn's outflow ends up
**running downhill into a bowl and uphill out of it**.

**The part that makes it a trap rather than a bug: the curve's knee is tested on `E_base`, not on the cell's own
height.**

```
E_alp = where(E_base > 3850, 3850 + 2150*tanh((E_base - 3850)/3600), E_base)
```

Read quickly, "the curve is the identity below its knee" sounds like a guarantee that low ground is safe. It is not: it
is a guarantee about the **smoothed** field. A valley floor at 3,000 m whose 9 km neighbourhood averages 7,000 m is
compressed *as if it were 7,000 m ground*.

**And that is why it is invisible to a point check.** All eight of the landed readings — the saddle, the five tarns,
Hub 01 — came through at **0.000 m**, and the rescale looked clean, because a point inside the guard is protected.
**A river is a *path* through unguarded ground between protected points.** No check that samples points rather than
courses can see this failure.

| | Before 6.1 | After 6.1, guarding only 6.2 and 6.3 |
|---|---|---|
| Worst climb in all 963 rivers | 48.3 m (r175) | — |
| The province's seven rivers | **all 0.0 m** (6.4 had landed them) | — |
| r708 Wādī al-Ṣakhr | 0.0 m | **+659.8 m** |
| r645 Wādī al-Zulāl al-Ṣaghīr | 0.0 m | **+407.3 m** |
| r440 Guli rrija | 0.0 m | +25.1 m |
| r464 Wādī al-Qamar al-Kabīr | 0.0 m | +1.4 m |

Note what the allowance does to the evidence: at `test_smodel`'s 50 m, **only two of the four broken rivers fail**, so a
laxer check would have passed the whole thing.

**The fix and its cost.** Carving the courses back down (6.4 step 1's own remedy) does fix the climbs, but it cuts
**300 cells outside the province by up to 679.8 m**, because a bed graded out of a bowl must keep falling downstream of
the boundary. **Guarding the beds instead** — every river cell in the model, `binary_dilation` by one for the banks,
unioned into the guard — puts every river back to **0.0 m**, moves **nothing** outside the province, and costs only
1,361 → 1,072 fully-weighted core cells. After it, the worst climb over every river in the model is **48.3 m**: exactly
what it was before, so the rescale adds none.

This is a property of the smoothing, not of model 5.1, so **whoever applies 6.1 to the new model hits it first**. It is
also the answer to a question `PLAN.md` question A leaves open: the rescale is not simply a matter of where the
east-west line falls, because wherever it falls, 6.4's beds have to be held while the walls move.

### P19 — the authored ridge amplitudes are up to three times what the ground subtends *(an authoring error, true on any model)*

**Found by the map session's horizon re-survey, 2026-11-25** (the horizon cast at 1,024 azimuths per band). From the
Catch floor, **the highest thing visible anywhere is 2.97°** (a 3,179 m ridge 47 km NNW), and the tallest ground within
240 km — 13,628 m of Godthrone at 239.7 km — subtends **1.72°**. The pages draw ridges up to **9.4°**, and at one
station **16.8°**.

**It is all four stations, not two, and two of them are still wrong.** The max drawn angle is `base + amp + peakAmp`
(`core/atmos/sky/89-atmos-e-skymodel.js`, `A.ridgeProfile`: `e = base + amp*(0.5 + 0.5*v) + p`, so `base` is the floor
and `base + amp + peakAmp` the ceiling):

| Station | Fragment | far crest | inner wall | max drawn |
|---|---|---|---|---|
| 1 sand sea | `biomes/catch/src/45b-host-stage.js` | `-1.81 / 8.82 / 2.4` | `-1.96 / 8.82 / 3` | 9.41° / 9.86° |
| 2 Stair's oasis | `biomes/catch/stations/oasis/45b-host-stage.js` | **identical** | **identical** | 9.41° / 9.86° |
| 3 the lake | `biomes/catch/stations/lake/45b-host-stage.js` | **identical** | **identical** | 9.41° / 9.86° |
| 4 north fan | `biomes/catch/stations/fan/45b-host-stage.js` | `-2.10 / 12.60 / 2.4` | `-3.00 / 16.80 / 3` | 15.0° / 16.8° |

Stations 1, 2 and 3 are **byte-identical** — written once and copied — which is why this is one authoring error rather
than three independent mistakes. The map session corrected **stations 1 and 4 only**, the two it was re-siting;
**stations 2 and 3 still carry it, and nothing in the repo flags them.**

**The physical argument, which needs no model at all.** A 12 km wall subtends ~9° only at about **70 km**. The Catch is
~127,000 km², so from its middle the walls are **150–250 km** off, and at 200 km a 12 km wall subtends ~**2.1°** after
curvature. So 9.4° was never geometrically available from that floor **on any model**: it implies walls at 70 km, which
the polygon does not have. The authored amplitudes are a **4.22-era hand survey** the model has moved under twice.

**How to re-derive it on the new model**, which is a tool already in the repo and already trusted —
`biomes/seouterwall/region/far.py`'s `ridges_of` cast: cast the horizon at 1,024 azimuths per distance band with the
planet's curvature (`drop = d²/2R`, R from the sky model's `kmPerDeg` 84 → 4,812,845 m), then take `base` = the band's
2nd percentile elevation angle, `base + amp` = the 98th, `peakAmp` = the rest to the max, and `dist` = the mean distance
of the horizon-defining points.

It blocks nothing, but every screenshot of the Catch floor is wrong about the scale of its own horizon, which is the one
thing a 2 km/px model is *for*.

### P22 — `STAGE.site` is in the 4.22 legacy frame, not 5.1 *(a trap for anyone re-siting a station)*

**The map session, 2026-11-25.** `core/atmos/sky/89-atmos-e-skymodel.js` carries
`frame:{mPerPx:2000, refPx:[446,690], refLat:-40, kmPerDeg:84, refSubLon:57}`, and that `refPx` is a **legacy pixel**
(Voth's). All four Catch stations' `site` values are in that frame, and they map onto their 5.1 pixels by exactly
`legacy_shift` (**+272, +330**).

So **anyone re-siting a station on the new model must write the legacy pixel, not the model pixel** — or the sun, the
giant, the ring and the moons all move. It is the kind of error that looks like an art problem and is a coordinate
problem, and nothing in the station files says which frame their numbers are in.

### P20 — step 6.2's chain and the thalweg that actually landed disagree by 5 px *(a plan question)*

At row 1258 the Godsgate's **6.2 chain centreline is near x 1032**, while the **thalweg that landed is at x 1027** —
5 px, 10 km. Since 6.2 landed *to the metre* elsewhere, one of the two is mis-fitted rather than mis-applied: either the
plan's shaft pixel moves to 1027,1258 (P14's proposal) or 6.2's chain wants re-fitting through that row. Not a 5.1
artefact; a question for `biomes/seouterwall/PLAN.md`.

### P21 — the SE outer wall's station bases were never a free acceptance test *(a claim to correct)*

`biomes/seouterwall/PLAN.md` section 5 says its six station bases were designed to pass `test_smodel`'s 150 m check
*"once the terrain pass is applied"*. But 6.2 (the Godsgate corridor) and 6.3 (the five tarns) had **already** landed all
six station cells to the metre, so **all six passed before any rescale**. The sentence reads as though the rescale were
on trial and the stations were the evidence; in fact the stations prove nothing about 6.1 either way. Worth correcting
so that nobody later takes six green cells as a licence to apply 6.1 unguarded — which is exactly what P18 says breaks.

### P15 — the Tharn crater is 671 m out and holds a lake *(leave it; a later session's)*

Station 12 (`biomes/seouterwall/PLAN.md` 7.2) wants a +6,185 m impact-melt floor with a +6,180 m cryo-fumarole tarn at
px 1375,1525. The map reads **6,856 m with a lake at 6,910 m**. It is outside both the SE outer wall and the Stalker
Range polygons (it lies across the Tharn/Stalker massif), so **this region does not cut it** and the discrepancy is the
kit's to resolve. Noted so nobody plans a site there.

### P16 — the Stalker Range has almost nothing to simulate *(a design answer, not a blocker)*

255,000 km², **0 mm of median rain**, -22 °C median, 47 % over 8,000 m, two settlements. There is no economy here, no
flora to speak of (its ground style is `highland`/`outlands`, so `biomes/outlands` reads in place), and **no biome kit of
its own**. The simulation value of the province is three things and no more: **Ranger HQ** (Yuni's Stalker-watch at
1,982 m, Gemini's population 350), **Hub 01** as a source with no economy, and **the Stalkers** as the predation that
source emits. `PLAN-SIM.md` section 4 designs exactly that and nothing else. The mistake to avoid is giving the province
a census it has no business having.

### P17 — the plans inherited a tunnel the owner had already dropped *(my error; a canon rewrite is owed)*

`biomes/seouterwall/PLAN.md` section 3.3 explains the Godsgate as a **surface construction highway** built to serve a
**180 km Arcbeam-Stair base tunnel**, with Bāb al-Hawa as that tunnel's **1,400 m ventilation shaft**. The first and
second passes of these plans took that framing as read.

**It is stale, and it was stale before this session started.** `openworld/ANCIENT-NETWORK.md` section 8.8 (the owner's
follow-up answers, **2026-11-11**) says: *"'No tunnel to Arcbeam' means: drop the Stair tunnel. There is no Ancient
tunnel from Arcbeam to Stair at all. Stair is reached by the Rift line's possible leg from Strongbow, and by the surface
trunks."* The same entry notes what it breaks and that the work was not done: *"This changes canon in `LORE.md` §4 (the
Catch: 'the Ancients' tunnel to Stair ... sealed halfway', the divers' prospect), `biomes/catch/PLAN.md` and
`biomes/seouterwall/PLAN.md` (the base tunnel and Bab al-Hawa). I have not rewritten those yet."* The owner restated it
on 2026-11-24: *"There is no tunnel ti arcbeam but there is a highway."*

So three things are true at once and the files disagree: **the Godsgate highway stands** (and the owner has now made it
*the* road rather than a construction road), **the Theodiga-Stair bore stands** (kept by the owner 2026-11-16, and it is
the divers' prospect at Stair), and **the Arcbeam-Stair tunnel does not exist**.

**The owner settled it on 2026-11-24:** *"there can be a (ruined) tunnel from stair to parabola, but not to arcbeam."*
So the bore comes back with Parabola at its north end, and the geometry is better than the old one:

- Parabola (970,1186) to Stair (1106,1442) is **580 km**, and the line **runs straight down the Godsgate corridor** (at
  45 % and 50 % of its length it stands at px 1031,1301 and 1038,1314, inside the carved trench).
- **115 km of it lies under the SE outer wall**, with **4,506 to 8,154 m of rock over it** (median 6,693 m); a bore
  between portals at 1,716 m and 1,379 m carries up to **6.6 km of cover**. That is why a base tunnel was worth boring
  *and* why a 30 m surface highway was graded over the top.
- **Bāb al-Hawa's 1,400 m now works arithmetically**: from the 3,590 m apron down to a bore standing near +2,190 m at
  its summit section under the divide. The original figure survives; only the name at the far end changes.
- **Stair becomes an Ancient junction** with two bores, Theodiga south and Parabola north, which is what its divers were
  always for.
- **And `LORE.md` §4's oldest Catch passage becomes true again, word for word** — "sealed halfway ... Yuni stripped the
  northern half bare a long time ago ... the southern half, entered from Stair, is the divers' prospect" — with Parabola
  in place of Arcbeam. Nothing has to be invented to replace what the 2026-11-11 drop killed.

The rename is owed in `LORE.md` §4, `biomes/catch/PLAN.md`, `biomes/seouterwall/PLAN.md`, `ANCIENT-NETWORK.md` and
`ANCIENT-ROADS.md` (answer N), together with §4's other narrowing: nobody has **reached** Hub 01 and returned, but some
rangers got near enough to see a facility and come home, and its function is their **surmise** (`PLAN.md` section 2b).

## 8. What the survey did *not* find

- **No dune, salt or oasis field is missing from `core/world`**: all three are in `WORLD.FIELDS` already, and all four
  provinces have a style and a palette in `BIOME_GROUND`: `the catch` -> `desert`/`catch`, `the bowl` ->
  `desert`/`desert`, **`se outer wall` -> `alpine`/`seouterwall`** (its own palette) and `stalker range` ->
  `highland`/`outlands`. Nothing to add there.
- **No vertical-range problem**, even with the Stalker Peaks inside the box: 16,325 m against region 2's 18,143 m.
- **No rain problem.** The 4.22 correction has landed: the floor reads 16-47 mm (Ṣalṭ al-Bān 16, Stair 47) against the
  4.21 survey's ten-times-generous figures. `biomes/catch/PLAN.md` sections 2 and 3 are satisfied by the map.
- **No water-tint gap.** `WORLD.waterBodies()` already carries how salt each body is, and `41` has a `SALT` colour.
- **No storm machinery missing** (corrected): `ATMOS.airLoad` carries the Catch's karaburan by name, with a storm field
  carried from upwind, `stormH` giving a wall a few hundred metres to a kilometre high, and `KHAZ.sight` turning it into
  a 57 m visibility on Chepil and Woodruff's curve. `ATMOS.gale` carries the God-Bore. `ATMOS.dustSeason` ties the lift
  to `KCLOCK.season(...).dry`.
- **No thin-air kind missing** (corrected): `VOCAB.ambientKinds` has `thin-air` from .6 atm to .06 atm, which is exactly
  what 408,000 km² of 6.5-15 km rock needs.
- **No Godsgate problem** (corrected): section 5a.
- **No gap between the Bowl and the Catch** (withdrawn): P7.

## 9. The register at a glance

| | Blocking | What |
|---|---|---|
| **P1** | yes | `biomes/catch`'s oasis records 75-209 km off their pins; its station 1 and 4 sites on mountainside (P2) |
| P2 | no | two of four Catch station sites now on 4.9 and 7.0 km of wall |
| **P3** | yes | `core/world` has no hazard binding (but `core/hazard` and `core/atmos/fx` are both ready) |
| **P4** | yes | `ROADS` fixes one grade and one width as module constants |
| **P5** | yes | the two salt-works pins are not on the map |
| P6 | **settled** | Gemini's three pins: Bāb al-Hawa **stays**, Ranger HQ **stays**, the Twins fort **drops** (the owner, 2026-11-24) |
| P7 | withdrawn | there is no gap: it is the SE outer wall |
| P8 | no | Jabal is a Bowl town, not on the Catch's rim |
| P9 | **settled** | the Twins are cut **here**, whole (the owner's no-split rule, 2026-11-24); region 2's tube spec migrates and it is recut |
| P10 | no | `biomes/gills` is a plan, not a kit: the Hermitage's pipe field waits |
| P11 | no | `extract_region.py` wants scipy; GPU verifies want a lane |
| P12 | no | the Stalkers have no buried pose and no harpoon line |
| **P13** | **settled, line open** | the rescale never landed; the owner rules the **west** rescaled and the **east** left high and airless (2026-11-24). Where the line falls is `PLAN.md` question A |
| **P14** | **corrected 2026-11-25; the settlement's pin is applied** | the **shaft pixel** (1033,1258) is what stands 1,205 m up the wall, not the settlement, which was 30 m over its row's thalweg. The settlement's pin moved to 1027,1258 (map edit 2, applied); the **plan's shaft pixel** still wants moving or benching |
| P15 | no | the Tharn crater is 671 m out; outside this cut |
| P16 | no | the Stalker Range has almost nothing to simulate, and should not be given a census |
| **P17** | **settled; the rename is DONE (2026-11-24)** | the Arcbeam-Stair tunnel is gone, but the owner has given a **ruined Parabola-Stair bore** in its place (2026-11-24), which restores the Catch's oldest lore word for word. `LORE.md` §4, `biomes/catch/PLAN.md`, `biomes/seouterwall/PLAN.md`, `ANCIENT-NETWORK.md` and `ANCIENT-ROADS.md` are rewritten (answers M and N) |
| **P18** | **a law of the method; blocks 6.1** | applying the rescale without guarding 6.4's beds breaks every tarn outflow (r708 +659.8 m, r645 +407.3 m against a 50 m allowance), because the compression follows the 9 km-smoothed base. **Survives the new model.** Guarding the beds is nearly free |
| **P19** | **an authoring error; survives the new model; TWO STATIONS STILL WRONG** | the Catch's authored ridge amplitudes reach 9.4° (station 4: **16.8°**) where the ground subtends at most **2.97°** from the floor (Godthrone, 13.6 km at 240 km, is 1.72°). A 12 km wall subtends 9° only at 70 km, and these walls are 150-250 km off, so it was never available on any model. All **four** stations carry it, 1-3 byte-identically; only 1 and 4 are corrected. Re-derive with `far.py`'s `ridges_of` cast |
| P20 | a plan question | 6.2's chain centreline (x 1032) against the thalweg that landed (x 1027) at row 1258: one of the two is mis-fitted |
| P21 | a claim to correct | `biomes/seouterwall/PLAN.md` §5 implies its six station bases pass the 150 m check only after the terrain pass; they passed **before** it, so they are no evidence for 6.1 — see P18 |
| **P22** | **a trap; survives the new model** | `STAGE.site` is in the **4.22 legacy frame** (`89-atmos-e-skymodel.js`'s `refPx:[446,690]`), offset from 5.1 by `legacy_shift` (+272, +330). Re-site a station with a model pixel and the sun, giant, ring and moons all move. Nothing in the station files says which frame they are in |
