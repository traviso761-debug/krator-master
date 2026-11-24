# The Catch and the Bowl: the terrain survey and the pitfall register (2026-11-24)

Item 1 of the owner's brief: *"Assess terrain for conversion and make sure there aren't any pitfalls."* Everything below
is measured on **scale model 5.1** by `openworld/catch-bowl/tools/survey.py` (read-only on
`tools/scale-model/model/data`, numpy and PIL only). Rerun a section after any map edit and the numbers in this file can
be checked against it. Pixels are 5.1 (2 km a pixel); the model is 1,821 x 1,723 px, elevation -2,600 to 24,823 m.

Nothing here is *proposed*: it is what the map holds today. The judgements that follow each measurement are marked.

## 1. The polygons as they stand

| Polygon | Id | Kind | Box (px) | Box (km) | Inside | Elev min / med / max | Rain med | Temp med | Water |
|---|---|---|---|---|---|---|---|---|---|
| `the catch` | `rmvka7icdn1dq` | biome | 959-1241 x 1288-1517 | 566 x 460 | 126,000 km² | -72 / 3,542 / 8,790 | 110 mm | +4 °C | 1.7 % |
| `the bowl` | `rmvka5413efyi` | biome | 913-1255 x 1042-1193 | 686 x 304 | 121,000 km² | -1,284 / -754 / 4,347 | 298 mm | +27 °C | 8.0 % |
| `twins` | `rmw536m06wlyf` | biome | 935-1095 x 1419-1570 | 322 x 304 | 49,000 km² | 2,713 / 4,166 / 6,922 | 267 mm | +1 °C | 0 % |
| `stalker range` | `rmvkknh1am4fw` | biome | 1195-1476 x 1153-1483 | 564 x 662 | 255,000 km² | 1,895 / 7,794 / 15,041 | 0 mm | -22 °C | 0.1 % |

Also on the map: `Stalker Peaks` (`rmwstalkerpks`, geographic, the owner's note names Hub 01 and the 12-15 km peaks),
`The Catch` and `The Bowl` as older *geographic* regions, `godthrone`, `godstep valley`, `Stalker Gate`, `sedesert`.

**Good news first.** Every one of these overlays already has a land style and a palette in `core/world`
(`41-world-fields.js` `BIOME_GROUND`): `the catch` draws on the **`desert`** style with a **`catch`** palette, `the bowl`
on `desert`/`desert`, `twins` on `volcanic`/`twins`, `stalker range` on `highland`/`outlands`. The `desert` style already
carries `dune: 1` (full dune seas) and `terr`/`gully` for the lake beds, and `WORLD.FIELDS` already names **`dune`,
`oasis`, `salt`, `cold`, `mist`** — the exact fields the Catch and Bowl kits read. There is no missing land style, no
missing palette and no missing field for this region. That was the largest risk and it is not a risk.

## 2. Scale: is one region feasible?

The union of `the catch` and `the bowl` is **61,799 px = 247,000 km² of filled cells** in a bounding box of px
913-1256 x 1042-1518 = **686 x 952 km (653,000 km²)**.

The precedent settles it. `xanadu-oidong-highrift` fills about **295,000 km²** (73,650 px of polygon) inside a
**1,037,000 km²** box at 1 km cells, and its page is about 7.6 MB against a 16 MB cap. The Catch and the Bowl together
are **smaller on both counts**. One region at 1 km cells is within proven ground; two regions would be a choice about
seams and sessions, not about size. (`openworld/catch-bowl/PLAN.md` section 2 proposes the cut.)

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

## 4. The walls: the 10-17 km crests are outside the polygon

Inside `the catch` the highest ground is **8,790 m**, and only 15 % of it is over 5,000 m. The lore's 10-17 km walls are
the **`stalker range`** east (median 7,794 m, **max 15,041 m, 47 % of it over 8,000 m**) and the Godthrone north-west.

*Judgement:* the Catch's defining view — "10-17 km walls on every horizon" — cannot be drawn from cells the cut holds if
the cut is the two biome polygons. It has to come from `core/world/bake_horizon.py` (the far horizon baked from the
model beyond the box) and the sky's ridges, exactly as the kit's station pages do it. **Budget for the horizon bake as a
first-class step, not a trim.** The alternative (growing the box east over 255,000 km² of 8-15 km rock to draw it as
ground) is how a region gets too big.

## 5. The ways in and out

| Route | km | z start..end | Max | Climb | Grade med / p95 / max |
|---|---|---|---|---|---|
| Jabal > Parabola | 516 | -1,206..1,716 | 1,716 | 5,372 | 0.9 % / 4.4 % / 21.5 % |
| Parabola > Godsgate > Kolli | 416 | 1,716..1,446 | **6,918** | 14,145 | 3.6 % / 22.3 % / 47.3 % |
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
2. **The north road is the hard part, and it is harder than the plan says.** The lowest crossing of the Catch's north
   wall between px 990 and 1180 is **5,282 m at px 1029,1300**. The Bab al-Hawa pin (1028,1246) stands at 3,661 m on the
   *outside* of that wall and the Ancient network's shaft (1033,1258) at 4,795 m. The plan's "6.2 km notch" is the
   notch's **altitude**, and 5.1's own lowest saddle is kinder than it — but a caravan still crosses a 5.3 km pass, and a
   `ROADS` route held to 8 % will switchback a long way to do it. *Judgement:* lay the north road as a **trail** (section
   7, pitfall P4) and expect its laid length to be well over the 249 km the straight hop measures.
3. **The Bowl is flat.** Mantis to Solta to Jabal is 227 km at a median 0.9 % with a 7.1 % worst step: the Bowl's roads
   and the salt trains are easy ground. Jabal to Parabola climbs 2,900 m over 516 km, also easy.
4. **The south wall** between the floor and the Twins has its lowest crossing at **4,245 m (px 1079,1505)**, but the
   caravan road does not cross it there: it leaves by Lasso to Catch-Lookout (3,690 m) and over the col. That exit is
   `xanadu-oidong-highrift`'s to lay (`PLAN-TWINS-CROSSING.md` W2), not this region's.

## 6. The places, measured

| Place | Px | Elev | Rain | Temp | Note |
|---|---|---|---|---|---|
| Parabola | 970,1186 | 1,716 m | 314 mm | +15 °C | the north gateway, outside both polygons |
| Bab al-Hawa (Godsgate pin) | 1028,1246 | 3,661 m | 282 mm | +4 °C | the pin the owner dropped; still on the map (P6) |
| Bab al-Hawa shaft | 1033,1258 | 4,795 m | 251 mm | -2 °C | the Ancient network's shaft (`ANCIENT-NETWORK.md` 8.1 q7) |
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
| Hub 01 | 1344,1409 | 4,351 m | 157 mm | -2 °C | in `stalker range`, 255 km east of Stair |
| Strongbow | 1001,1596 | 1,400 m | 800 mm | +14 °C | region 2's, at the seam |

## 7. The pitfall register

Each pitfall is a thing that will bite the build if it is not handled, with what to do.

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

`core/hazard` is built and rich (`KHAZ`, plus the opt-in `flow`, `env`, `bore` and `tunnel` fragments: `KHAZ.front` for a
travelling front, `KHAZ.crust` for ground that breaks underfoot, `KHAZ.night` for air that pools, `KHAZ.bindWind`). **No
fragment of `core/world` mentions it.** Hazards reach pages today through `core/biome`'s station hosts and `core/host`'s
inspector, neither of which a region page lists. See `PLAN-HAZARDS.md` for the two fragments proposed.

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

### P6 — two pins the owner dropped are still on the map *(decide before the cut)*

The owner, 2026-11-16, dropped Gemini's Godsgate caravanserai and Twins fort (`PROPOSAL-CATCH.md` question 6). On 5.1
they were dropped as `gem_godsgate` and `gem_twins_pass` in `SETT_DROPPED['5.1e14']` and **re-added in the same batch
under new ids**: `sbabalhawa01` "Bab al-Hawa (Godsgate)" at 1028,1246 and `sthetwins01` "Twins Pass Wardenry" at
1042,1525. Both are live. A cut that lists the region's sites by name will pick them up, and the sim does not know them.
There is a real tension to resolve, not just a stale record: the owner **accepted** the Bab al-Hawa *shaft* and the
surviving Godsgate highway in the Ancient network the same month (`ANCIENT-NETWORK.md` 8.1, answer 7), so the place
exists even though the *caravanserai settlement* was dropped. `PLAN.md`, question 4.

### P7 — the gap between the polygons *(a corridor, not a problem)*

`the bowl` ends at py 1193 and `the catch` begins at py 1288: **188 km of unclaimed ground** that the north road crosses,
holding Parabola (970,1186) and the Godsgate. `cut_site.py` corridors (`{from, to, width_km}`) exist for exactly this.
Proposed in `PLAN.md` section 2: a 20 km corridor Parabola to Kolli, wide enough to hold the 5.3 km saddle and its
switchbacks.

### P8 — Jabal is a Bowl town *(a wording fix, carried into the plans)*

`PROPOSAL-CATCH.md` calls Jabal "their town at the Catch's north-east". On 5.1 Jabal stands at **-1,206 m on the Bowl
floor**, 516 km from Parabola and 227 km from Mantis by way of Solta, with `the bowl` polygon over it. It is the Dasri's
**Bowl** capital and their gateway *toward* the Catch; the Catch's rim is 400 km of climbing away. Every plan here says
so, and `kits/dasri` was written for a Bowl town (its urban register is Sana'a and Shibam, its `ds_vil_*` register names
Arfwai, Solta and Salt al-Ban).

### P9 — the Twins polygon overlaps region 2 *(a seam to agree)*

`xanadu-oidong-highrift` already holds 1,424 px of `twins` as bare ground, and its `PLAN-TWINS-CROSSING.md` W1 would grow
it north to take the whole massif **and the Catch's south toe (Lasso, Bitta, Stair's campground)**. If this region also
takes them, two regions plan the same villages. `SITES.json` has `reach_km_by` (a site in two regions, each its own
square) for the shared stops. `PLAN.md` section 3 proposes the seam.

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

## 8. What the survey did *not* find

- **No dune, salt or oasis field is missing from `core/world`**: all three are in `WORLD.FIELDS` already.
- **No vertical-range problem.** The Catch's box spans 17,299 m of relief; `xanadu-oidong-highrift`'s spans 18,143 m and
  draws it. The logarithmic depth buffer and the chunk quadtree handle it.
- **No rain problem.** The 4.22 correction has landed: the floor reads 16-47 mm (Ṣalṭ al-Bān 16, Stair 47) against the
  4.21 survey's ten-times-generous figures. `biomes/catch/PLAN.md` sections 2 and 3 are satisfied by the map.
- **No water-tint gap.** `WORLD.waterBodies()` already carries how salt each body is, and `41` has a `SALT` colour.
