# Every built settlement into the open world: scope

A scope for the owner (2026-11-11), not a plan in force. `openworld/PLAN-VOTH.md` scoped one city; this does the same,
more briefly, for every settlement with a built page, so the work can be ordered and the shared pieces built once.

## 1. Purpose, grading and what the open world has

**The question for each page:** the page has made its own ground (its frame, terrain, water, landforms), and the scale
model has its own ground at the settlement's pin. Do they agree? If not, does the world take the page's ground, does
the map need surgery, or is the pin in the wrong place?

**The grades:**

| Grade | Meaning |
|---|---|
| **A** | The world's ground can be taken as is: the page could plan on the world (or already does, on older data) |
| **B** | The world takes the page's ground, with no map surgery: core/world towns (`WORLD_DATA.towns`: a frame, R, a blend band, a height grid, `onWater`) |
| **C** | Needs map surgery (an `edit_5xx` in the `edit_512` pattern) and/or a river re-route |
| **D** | The pin is wrong: in the water, or on the wrong kind of ground with the right kind within reach (a `SETT_MOVED` entry, no surgery) |

Two marks ride on a grade:
- **n**: the pin wants a nudge of a few km (a `SETT_MOVED` entry) to put the page's key feature under its frame.
- **t**: the frame wants a turn (the towns record's `rot`), because the page's uphill or water side differs from the world's.

**How the model was read.** `smodel.page.load()` on this branch's `tools/scale-model/model/data` (5.1, 2 km cells).

| Field | What it gives |
|---|---|
| Height and water level | at the pin |
| Relief | max − min within ±5 px (±10 km) |
| Upslope | the bearing of the gradient of the height smoothed over ~4 km |
| Water | the nearest wet cell and its bearing |
| Rivers | from `D['rivers']`, within 20 km and with q ≥ 20 m³/s within 60 km |
| Climate | class, rain and mean temperature |

The scripts are scratch, not in the repo. Bearings are compass bearings (0 = north = -z).

**Pins:** `tools/scale-model/model/src/60-settlements.js:182` (the default list). The `SETT_MOVED` entries at `:198-203`
hold the moved pins: Pinnacle Rock 1007,686; Qiblai 922,1595; Erehwon 805,1516.

**What the open world already has (`openworld/PLAN-SITES.md`, Status):**
- **The runtime:** `core/world` (`core/world/README.md`).
- **The sites list and cutter:** `openworld/SITES.json` and `cut_site.py`.
- **Three regions on 5.1:**
  - `pinnacle`;
  - `xanadu-oidong-highrift` (Erehwon, Longsong, Qiblai);
  - `iziz-cluster` (Girder, Mav's Refuge, Talia).
- **On other data or branches:**
  - the isle demo region, on 4.21/4.23 data;
  - a fourth region, `oidong-highrift` (Longsong, Strongbow), on `claude/cool-tereshkova-d594e8`;
  - `openworld/north-basin`: data only, cut on 4.21, no build.
- **What every region already does:** sites, camps, hamlets, links, resources and propose.
- **Not built yet:**
  - **No region plans a town.** PLAN-SITES step 3, lifting the generic town steps out of `ISLE`, is not done.
  - **The towns path is untested.** `buildTowns` in `core/world/41-world-fields.js:277-316` reads `WORLD_DATA.towns`
    (with `rot`, `R`, `band`, `onWater` at `:291-300`), but no region bakes a `towns.json`. Voth's V2 is to be its
    first use.

**Not in scope:**
- Kit sheets, which stay sheets (PLAN-SITES §5): `highlands.html`, `xanadu.html`, `dalab-set.html`, Iziz's vernacular,
  ixtest and w-a/b/c, `reedlake*.html`, `jimjam-kit.html`, the Pylon and Talia sheets.
- Settlements with a PLAN.md but no page: Almua, Ardent, Dilihan, Drum, Shim, Torus, Zey'danin.
- Mantis and Qiblai, which have no page. Qiblai's city is being planned on core/city (`KCITY.squares`, on
  `claude/elastic-chatterjee-5edac4`).

## 2. Summary

Pins are 5.1 px. "Fit" is the grade. Size: S (days), M (a week), L (several weeks or several sessions).

| Settlement | Page | Pin px | Fit | Region | Size | Why, in one line |
|---|---|---|---|---|---|---|
| Voth | `settlements/voth` `voth-city`, `voth-site` | 742,1018 | **C** | new `voth` | L | Pin in a 1,190 km² cliff-walled bay with no river; edit_513 and the Turm re-route (PLAN-VOTH) |
| Verge | `settlements/verge` `verge` | 1263,946 | **B n t** | new `east-rim` | M | The model's scarp to the abyss is the page's; its river (Rrivar Blaca) falls 7-10 km ESE; plateau N-NW, not W |
| Yuni | `settlements/yuni` `yuni` | 1263,1089 | **B** | new `east-rim` | M | Valley +636 m, the Waita Riba 0.8 km off, floor tips W as on the page; the butte wants a stamp |
| Locus | `settlements/locus` `locus` | 1267,1043 | **B** | new `east-rim` | M | Abyss floor at -2,403 m, the lake W and a 3 km wall E, as the page paints them |
| Mungo | `settlements/mungo` `mungo` | 1321,825 | **D n** | new `east-rim` | M | Pin in the salt lake (-1,804 m); the page is on its east shore under a wall, which the model has |
| Shade | `settlements/shade` `shade` | 1229,885 | **B** | new `east-rim` | S | A 214 m basin in a plateau: sub-cell, fits a +2,533 m upland; the climate (Dfb) is not sedesert |
| Noah's Regret | `settlements/noahs-regret` | 896,866 | **B t** | new `north-shore` | M | On the Ring Sea shore as the page is, but the sea is E of the pin, not N |
| Iziz | `settlements/iziz` `iziz` (+ palace) | 963,985 | **B** | `iziz-cluster` (extend) | M | 1.9 km of plateau, moat and mesas on gentle jungle 6 km from the sea; the ground is the page's built form |
| Girder | `settlements/girder` `girder`, `girder-hero` | 1039,869 | **A** | `iziz-cluster` | S | Gentle jungle (205 m relief); the page needs only a level terrace; the region holds it already |
| Mav's Refuge | `settlements/mavs-refuge` | 1024,807 | **C** | `iziz-cluster` | L | The page is a 72 m river with two cataracts; the model has no river within 16 km (25 m³/s there) |
| Roketstad | `settlements/highlands` `roketstad` | 609,684 | **B** | new, or `north-basin` recut | M | A flat +3,518 m plateau suits the shelf; but no mountains within 30 km, and Dsb 471 mm, not temperate forest |
| Dhelv | `settlements/dhelv` `dhelv` | 840,776 | **B t** | new `north-shore` | M | On the Throne's north flank; the page's uphill is E, the world's S (summit 846,827) |
| Erewhon | `settlements/xanadu` `erewhon` | 805,1516 | **B** | `xanadu-oidong-highrift` | M | edit_512 laid the model's shore to fit the page (lake N, cliff and plateau S); the island is 0.6 km off on the page, 5.4 km in the model |
| Longsong | `settlements/longsong` | 1226,1626 | **A n** | `xanadu-oidong-highrift` / `oidong-highrift` | S-M | Reads WORLD.H on 4.21; on 5.1 its stream (r105) is 11.7 km off, flat ground beside it |
| Pinnacle Rock | `settlements/pinnacle-rock` | 1007,686 | **B** | `pinnacle` | M | The page reads the 4.21 cut at the old pin; the new knoll is 110 m, the page's mesa 250 m: the mesa as a stamp |
| Hook | `settlements/hook` (P1-P3 on `claude/hook-p1`) | 809,923 | **A** | new `hook` (or with `voth`) | M | The branch already stands on the model's land (KLAND, 4.21) with the sea N; recut on 5.1 and re-lift |
| Isle demo (Kautoa, Valapo, Nephtos) | `settlements/isle-demo` `isle-city`, `isle-site` | 964,725; 942,782 | **A** | `isle-demo` (recut on 5.1) | M | Already planned on WORLD.H, but on 4.21/4.23: the owner's strokes are relative to the old ground |
| Jimjam | `settlements/jimjam` (kit sheet only) | 746,550 | **A n** | `north-basin` (recut on 5.1) | S | No town yet; the lake (+430 m) is 8 km N of the pin and the lore wants it on the lake |
| Dalab | `settlements/dalab` `dalab` | 464,1112 | **D** | new `southwest` | M-L | A 2 m lowland with a river on the page; the pin is +606 m hill country, 529 m of relief, the river 10.5 km off and 280 m down |
| Span | `settlements/span` | 554,1010 | **B** | new `southwest` | M | Its ground is SW-highlands station 4's site record, at this pin; the Pan Riba (42 m³/s) matches the page |
| Screamers (the Hexahedron) | `settlements/screamers` | 827,668 | **A** | new `north-shore` | S | The page is flat and so is the model (0.3°, 430 m relief); the model's ground is XV veldt, not hyperjungle |
| Ys | `settlements/ys` `ys` | 789,738 | **D n t** | new `north-shore` | M | The page is a sea-level shore; the pin is 117 m up, 6 km inland; the sea is SW, not SE |
| Loj Twenny | `claude/loj-twenny-059a5e` | 457,1269 | **A** | new `southwest` | S | A cavern under +6,217 m of ET mountain; only its mouths meet the surface; the siting fork is open |
| Strongbow | `claude/keen-swanson-68a311` (kit target, no page) | 1026,1594 | **D** | `oidong-highrift` (branch) | M | Three pins on three branches (1026,1594; 1013,1585; 1001,1596); the kit's 900 m lip fits none of them |

**Counts:** A 7, B 11, C 2, D 4.
- Nudges (n): 5, Verge, Mungo, Longsong, Jimjam and Ys, plus the D re-sitings of Dalab and Strongbow.
- Turns (t): 4, Verge, Noah's Regret, Dhelv and Ys. Hook's and Strongbow's turns are in their own plans.

**Not on the model at all:**
- **Pylon and Talia** have no city page; both are A by default. Talia's site is `sor1zqih8x`, already in `iziz-cluster`.
  Pylon's is `sxoqgjn7y0` at 869,1002: a dry Aw plateau at -862 m, no river within 20 km, matching
  `kits/pylon/PLAN.md` §5 (`:158-194`).
- **Reedlake** is a kit. Its only user is Mungo's reed district. Whether the model's "Reed" (1277,676: a village in an
  abyss lake at -2,331 m, 39 °C) is its village is a question (§6).

## 3. Per settlement

Each entry gives:
- **page:** the page's ground;
- **model:** the scale model at the pin;
- **fit:** the grade and why;
- **work:** what moving it takes.

Cites are relative to the settlement's folder unless given in full.

### Voth: C, L
- **Page:**
  - A 10.8 km square, x east, z south, origin mid-bay.
  - Analytic water at 0: bay, narrows, lake and strait N.
  - An 80-170 m river into the SE corner.
  - Everything is keyed to the shore trace.
  - All of this is in `openworld/PLAN-VOTH.md` §1 (`src/10-core.js:74-150`).
- **Model:**
  - Open water: bed -1,560 m, the Ring Sea at -1,500 m.
  - 324 wet cells within 30 km.
  - No river within 20 km.
  - WS, 1,600 mm, 32 °C.
  - Cliffs round the bay (PLAN-VOTH §2).
- **Fit:** C. The model's bay is about 12 times the page's water and walled, and has no river.
- **Work:** PLAN-VOTH §4, steps V0-V4. The owner answered V0 on 2026-11-11 (§6 there).
  - V1: edit_513 (bay, rim, Turm re-route).
  - V1 is done: `cebf8c100` on `claude/epic-moore-0a3795` (the bay is the page's water plus a strait, the rim is low
    hills, the Turm and the Vindos reach the bay).
  - V2: the towns bake, water and a river inside a town, the landform stamp. In progress on
    `claude/elastic-chatterjee-5edac4` (2026-11-11), not committed yet; its tests (`test-town-water.js`) pass.
  - V3: the `openworld/voth` region, with Torus (774,1007) as a second site.
  - V4: the checks.
  - **Everything else in this scope reuses V2.**

### Verge: B n t, M
- **Page:**
  - On core/city (one `KCITY` plan per level, `README.md:13-20`).
  - x east, z south; no height datum: floor ~4 m, plateau ~938 m (`src/41-verge-layout.js:8-10,34`).
  - Its own analytic `VG.groundH`, which runs in node (`41-verge-layout.js:238-244`; `tests/test-layout.js`):
    - plateau with six mesas;
    - a 75 m canyon holding Upper Verge;
    - the benched escarpment, an 860 m fall;
    - the 44° spur carrying the switchback.
  - Water: the upper river in the canyon; seven cataracts in a gorge to a plunge pool at (-886,-226); the lower river
    east; four salt lakes at y -27, 7-15 km east (`:67-68, 98-99, 246-252`).
  - Ground tiles span 30 km (`46-verge-ground.js:2-5,107-108`).
  - Plateau W, abyss E. The city exists for the descent (`DESIGN.md:9-11`).
- **Model:**
  - -516 m on a 7.8° slope; 1,942 m of relief within 10 km.
  - Upslope 331° (NNW). Within 30 km: max +680 m N, -446 m E.
  - The abyss's lake at -2,339 m, 24 km E.
  - The Rrivar Blaca (r255, 15 m³/s) passes 6.7 km off. It drops 626 m over three vertices at ~1265-1267,949, 7-10 km
    ESE of the pin.
  - Csa, 486 mm, 25 °C.
  - `core/world/41-world-fields.js:230` already names Verge's cataract as the model for a river leaving a scarp.
- **Fit:** B. The kind and the size of the drop agree: the page's 938 m and the model's ~1,000 m between N and E at
  6 km. But the river falls ~8 km from the pin (**n**: to about 1265,949), and the plateau is N-NW, not W (**t**:
  about -60° to -90°).
- **Work:**
  - The `SETT_MOVED` nudge.
  - A towns bake of `VG.groundH`, which is already node-safe: the frame turned; R ~5 km; a band of 1-2 km.
  - The page's river polyline joined to the r255.
  - The salt lakes as a town water mask, or dropped for the world's lake.
- **Risks:**
  - The Godot twin reads `verify.py --export` terrain.json (krator-heightfield) and golden.json.
  - The layout's node test pins the ground, but a frame turn changes nothing on the page.

### Yuni: B, M
- **Page:**
  - `WORLD=8000` (±4 km), origin the town centre, north -z (`src/10-core.js:93-99`).
  - Its own analytic `terrainH` (`10-core.js:243-291`):
    - a plane tilted down to the NW (`:101-106`);
    - valley walls ~620 m from 1.9 to 4.3 km, closing the SE, SW and NE;
    - the butte at (0,572): H 400, foot r 314, with the Grand Vault in its north face and the spaceport on its top.
  - A river half 13 m wide, ~1.2 km round the town's E and N (`:108-138`).
  - A weir, and the canal ring at R 940 (`:145-181`).
  - The source disagrees on the valley's mouth: NW at `10-core.js:101`, "north-east" at `:240` and
    `src/20-stage.js:129`.
- **Model:**
  - +636 m, gentle (1.1°); 615 m of relief within 10 km; 2,470-3,000 m within 30 km all round.
  - The floor falls W: upslope 118°. The low side W agrees with `10-core.js:101`.
  - The Waita Riba (r077, 51 m³/s) runs 0.8 km from the pin.
  - Cfa, 675 mm.
- **Fit:** B. A valley closed on three sides, with its river and its mouth W, is what the page has. The butte (400 m)
  is sub-cell, so it is a landform stamp, or the page's ground carries it.
- **Work:**
  - The towns bake; the page's river joined to the r077.
  - Settle the mouth's bearing in the source first (§6).
- **Risks:**
  - `KNOWN_ISSUES.md:1` (48 KB) says to tell the owner before changing Yuni.
  - Locus and Mungo fork its engine, so a fix here ripples.

### Locus: B, M
- **Page:**
  - `WORLD=9000` (±4.5 km), x east, z south. "THE WATER PLANE IS y = 0" (`src/10-core.js:101-117`).
  - Its own `terrainH` (`:224-256`): marsh, a 19 m hill, and an east rise of +124 m by 4.3 km (`:218`).
  - The salt lake is W, its shore at x ≈ -1,000 (`:122-125`); a river from the E to a three-armed delta (`:141-150`).
  - The abyss wall E is painted on the horizon only (`src/20-stage.js:124-129`).
- **Model:**
  - -2,403 m, on the abyss floor at the foot of a wall: E +1,001 m within 30 km, upslope 121°.
  - A lake at -2,400 m 2 km N (57 wet cells within 10 km). N and W are floor.
  - XA, 3,800 mm, 32 °C.
  - No river within 20 km. The Bigga (r019, 163 m³/s) is 40 km off.
  - `core/world/83-world-water.js:9` already has a reach "to the lake at Locus".
- **Fit:** B. The lake is W and the wall E, as on the page, and the world gives it the real wall it paints. `onWater`
  sets the page's 0 at -2,400 m.
- **Work:**
  - The towns bake.
  - The lake as the world's water; the delta as a town water mask.
  - The page's river: a short new river, or one joined to the Bigga (a model question if it must exist upstream).
- **Risks:** Mungo and Verge read Locus's engine and its YKIT kits by name.

### Mungo: D n, M
- **Page:**
  - `WORLD=7000` (±3.5 km), origin the bridgehead market on the shore, water plane at 0 (`src/10-core.js:102-121`).
  - Locus's engine re-pointed: a +2.4 m terrace, a marsh fan, an east rise of +92 m by 4.4 km (`:214-246`).
  - The salt lake W (shore x ≈ -62, `:124-128`), with the reed village anchored 110-380 m out (`DESIGN.md:20`).
  - A small river from the E (`:143-155`).
- **Model:**
  - **The pin is in the lake:** -1,804 m water, 55 wet cells within 10 km.
  - A wall E: +1,287 m within 30 km. Upslope 109°.
  - WX, 2,008 mm, 36 °C.
  - The Rīfar al-Milḥ (22 m³/s) is 15 km off.
- **Fit:** D. The kind is right (the east shore of an abyss salt lake under a wall, `DESIGN.md:9`), but the pin is in
  the water. Nudge it 2-6 km east to the shore. The first dry cell my scan found sits oddly low (-2,162 m), so check the
  shore by eye.
- **Work:** the nudge; then as for Locus (the towns bake with `onWater` at -1,804 m, and the reed village in the
  world's lake).
- **Risks:** the reedlake kit runs as a second engine in the page.

### Shade: B, S
- **Page:**
  - A 2.6 km map (`src/45-host-stage.js:19`), x east, z south, origin mid-basin.
  - `TERR` R 1,300 m, ground to 4.2 km (`src/44-host-layout.js:9,22`).
  - A 59 m plateau with five mesas; a sunken basin 214×160 m with walls of 49-56 m; a slot canyon E.
  - Falls of 46 m into a pool, then a stream out down the canyon (`44-host-layout.js:17-33,62-70,116-133`).
  - core/terrain carve: alcoves, niches, the undercut behind the falls (`:60`).
  - Every place depends on the basin's faces.
- **Model:**
  - +2,533 m on a 4.2° slope; 1,226 m of relief within 10 km; upslope 159°.
  - No water within 30 km; no river within 20 km.
  - **Dfb, 596 mm, 13 °C.**
  - `core/world/98-world-start.js:37-41` already uses Shade for its first view.
- **Fit:** B. The basin is a cut much smaller than a cell, which a towns grid (or a negative landform stamp) carries
  anywhere on a plateau. The climate does not match: the page is sedesert, the model a cool continental upland (§6).
- **Work:**
  - The towns bake of `terrainBase` plus the carve.
  - Find a spot within a few km where the slope is under ~2° if the 4° tilt shows at the rim.

### Noah's Regret: B t, M
- **Page:**
  - Sea level 0; origin the hull ring's centre (`src/12-nr-world.js:2-24`).
  - Its own `nrGround0` (`:40-62`): the shore runs E-W at z ≈ 124. Sea N, shelving to -19 m. Land S: beach, then dunes
    24 m high.
  - The ground grid runs to ±2.4 km; the sea is core/water at 0 (`src/82-nr-water.js:2-39`).
  - The hull lies across the waterline, its bow a little N of E.
- **Model:**
  - -1,492 m, 8 m over the Ring Sea.
  - **The sea is 2 km E** (bearing 90°). The land rises W: upslope 304°, +115 m within 30 km.
  - XV, 659 mm, 34 °C.
  - The nearest shore with the sea to its N is 28 km E (910,868).
- **Fit:** B with a turn of about 90°: the page's N (the sea) to the world's E.
  - The lore says "the south shore of the Ring Sea" (`README.md:6`); in the model it is a west shore.
  - Either the frame turns (the hull's bow then points S), or the pin moves 28 km (§6).
- **Work:**
  - The towns bake with `onWater`.
  - The page's sea bed as the town grid's below-water part, to blend with the world's shelf.
- **Risks:** none known; no other session works on it.

### Iziz: B, M
- **Page:**
  - `CITY.WORLD:1900` (±950 m), x east, z south (`targets/city/84-city-geo.js:3-11`).
  - `terrainBase` plus `cityFlat` (`84:56-65`): a +18 m plateau inside the wall (R 470, standing at ~515 m); a dry moat
    at -16 m; jungle at 1-6.5 m beyond.
  - Three mesas of 23-40 m: palace, temple, arena (`84:12-18,40-47`).
  - The moat's water at -9 m (`90a-city-world.js:15-19`).
  - The palace page is its mesa alone (`targets/palace/84-palace-geo.js:1-19`).
  - The spaceport pad is at bearing 315°, which the code calls "north-west" but the axes put NE (`84:19-20`;
    `87-city-layout.js:52`). Settle this before turning anything.
- **Model:**
  - -1,428 m, 72 m over the sea; gentle (0.7°).
  - The Ring Sea 6.3 km ESE; the Bruk Falz (r013, 427 m³/s) 17 km off. Upslope W.
  - XA, 1,835 mm, 31 °C.
- **Fit:** B. The page's ground is a built form (a raised city, a moat, mesas) on a near-flat jungle, which fits the
  model's ground. Its 1.9 km frame is under one cell.
- **Work:**
  - The towns bake: R ~1 km, a band of ~400 m.
  - The moat as a town water mask (a level of its own, not the sea's).
  - The mesas carried by the grid.
  - Extend `iziz-cluster` with a corridor Talia → Iziz (~240 km), and Pylon (190 km W).
- **Risks:**
  - A heavy page (3.4 M triangles; `README.md:16`).
  - "Iziz 3.0" is coming: no more fixes to this build (memory).
  - Branches `claude/iziz-openings-interiors` and `claude/pylon-interiors-export` were not diffed.

### Girder: A, S
- **Page:**
  - `WORLD=7200` (±3.6 km), x east, z south (`src/10-core.js:2,81`).
  - Its own `terrainH` (`:140-166`): a plane falling SE, hills of 24 and 9 m, a levelled terrace (`SETTLE_R` 214 m at
    ~34.6 m).
  - A 6.5 m brook N→SE with one 3.2 m cascade (`:84-107`).
  - The Ring Sea is painted NW (`src/20-stage.js:5-6,54`).
  - The towers and the palisade (R 200) need only the flat terrace.
- **Model:**
  - -1,386 m; 205 m of relief within 10 km; 1.0°.
  - The Vai Moana (r018, 143 m³/s) 3.6 km off; the Ring Sea 24 km W.
  - XA, 1,788 mm.
- **Fit:** A. Nothing in the layout needs the page's own hills. A `levelPad` terrace on the world's ground carries it,
  and `iziz-cluster` already cuts its site (its `README.md:11,18`).
- **Work:**
  - The terrace and palisade as a ground delta in the region.
  - Drop the brook, or make it a stream into the Vai Moana.
  - The painted sea's bearing follows the world (W, not NW).
  - The hypertrees round it already come from the region's flora.
- **Note:** `KNOWN_ISSUES.md:95` (the hollow below the cascade) goes away with the page's ground.

### Mav's Refuge: C, L
- **Page:**
  - `WORLD=7200` (±3.6 km), datum the river's downstream reach at y 0 (`src/10-core.js:1-4,119`).
  - **A river ~72 m wide** runs E→W through the middle "toward the Ring Sea", with cataracts of 7.5 and 6 m
    (`:84-105,127`).
  - The volcano is SW (`src/20-stage.js:54`).
  - The tree city (Mav's Crown, holds on both banks, a chain across the river, a log bridge) is laid along the river
    (`NOTES.md:10-30`).
- **Model:**
  - -1,450 m, gentle; the Ring Sea 11 km NE.
  - **No river within 16 km.** The Vai Toka (25 m³/s) is 16.5 km off.
  - The nearest river of ≥ 60 m³/s is 68 km away: the Auwai Kura, 3,115 m³/s, at 1011,839. Tł'éé' Baatar (89 m³/s) is
    73 km, Béesh Baatar (90 m³/s) 79 km.
  - XA, 1,992 mm.
- **Fit:** C. The page's river is the layout, and a 72 m river carries a few hundred m³/s, which nothing near the pin
  does. Options (§6):
  - (a) map surgery: a river through the pin to the sea 11 km NE (an edit in the edit_512 pattern, with its catchment
    found inland);
  - (b) move the town to a river 68-79 km off, and with it the region's corridor and camps;
  - (c) shrink the page's river to the Vai Toka's size and move the pin 16 km onto it.
- **Work:**
  - The towns bake (ground matters only at tree bases, gates and trails).
  - The river as a named river in the world.
  - The region recut if the pin moves.
  - The Mav's → Girder link (135 km, `openworld/iziz-cluster/KNOWN_ISSUES.md:3-8`) re-laid.

### Roketstad: B, M
- **Page:**
  - `RK.WORLD:3400` (±1.7 km), x east, z south (`targets/roketstad/84-rk-geo.js:3,17`).
  - Its own ground (`84:61-73`): a shelf at ~22 m with fbm; a town hill of +34 m; the port table (+20 m, r 480) with
    the launch pentagon.
  - **Far ranges of 900-3,900 m** at 7-14 km to the E, NE and SE, drawn as a shader curtain
    (`90a-rk-world.js:18-31`).
  - Temperate forest, nhighlands' band (`84:14`).
  - "A broad shelf of the Inner Wall's outer rim" (`84:5-7`).
- **Model:**
  - +3,518 m, flat (0.5°; 346 m of relief within 10 km). Within 30 km the most is +3,810 m to the E.
  - **No mountains within 30 km.**
  - Dsb, 471 mm, 8 °C. No water within 30 km.
- **Fit:** B for the ground: a flat shelf takes the page's grid with a short band. The backdrop and the forest do not
  match. The world has no curtain ranges near, and its plateau is cold and dry.
- **Work:**
  - The towns bake (a small frame).
  - The curtain retired for the world's own far land.
  - The forest chosen from the world's kit at that climate (§6).
  - `north-basin` (4.21 box 244..716 × 36..316, i.e. 5.1 516..988 × 366..646) stops 38 px short, so a new small region,
    or north-basin recut on 5.1 and widened.
- **Risks:** a budget of 19.5 of 32 M triangles (`KNOWN_ISSUES.md:81-83`).

### Dhelv: B t, M
- **Page:**
  - x east, z south; the hub square at y 0; **the flank rises E** toward the Throne's summit (`README.md:53`).
  - `DH.groundY` (`src/41-dhelv-layout.js:24-59`): the flank at 3.5-26.5 %, and the shelf, a kipuka spur of
    1.74 × 1.07 km with walls of 40-83 m. Plus seven lava flows (`src/48-dhelv-flows.js`).
  - The hall, the wells and the outpost are carved into the shelf. A stream falls off its west lip
    (`41:243-246`).
  - A Godot case bakes the heightfield; `tests/test-layout.js` keeps a golden digest.
- **Model:**
  - -68 m, flat at 2 km (0°) but 1,657 m of relief within 10 km. Upslope 171° (S).
  - **The Throne's summit is at 846,827, +10,894 m, 102 km S.**
  - The Ring Sea 13 km NNW. WS, 2,745 mm, 25 °C.
- **Fit:** B with a turn of about 90°: the page's E (upslope) to the world's S. The shelf, the flank and the flows are
  the page's ground, and the towns grid carries them. The world's ground beyond the band is the volcano's apron.
- **Work:**
  - The towns bake of `DH.groundY` with the flows: node-safe, given the layout's node test.
  - Check that the flows' downhill agrees with the world's after the turn.
  - Region: a new `north-shore` with Ys, Noah's Regret and the Hexahedron, or with the Throne biome's stations
    (`biomes/throne`).
- **Risks:** the plan owner is `kits/zeijani/PLAN.md` §12-14.

### Erewhon: B, M
- **Page:**
  - `ER_DATA` 2,320 × 2,026 m, origin the map centre, **lake N (-z), mountain S** (`src/84-er-geo.js:2-6`).
  - Heights from the owner's painted map via `tools/erewhon-map.py` (`83-er-data.js`; `NOTES.md:270-275`). The lake at
    -0.5 m; the palace plateau lifted 90 m behind a grey cliff (`erewhon-map.py:84-111`).
  - The Pleasure Dome island at about (+70,-613) m, 0.6 km off the quays (`84-er-geo.js:66-79`).
  - A 9 km dark apron beyond the map (`90a-er-world.js:6-16`). Not on core/water (`KNOWN_ISSUES.md:52`).
- **Model:**
  - **edit_512 laid the shore to fit the page** (PLAN-SITES Status; the pin's notes, `60-settlements.js:182`): a
    south-shore bench at -497 m, the lake at -520 m 2 km N, upslope 197° (S).
  - Aw, 957 mm.
  - The island's record `lf_pleasure_dome_isle` is at 806.6,1513.3: **5.4 km N** of the pin, "about 5 km off the quays"
    (`model/data/landforms.json`).
- **Fit:** B. The bearing and the kind agree, and the lake simply goes on beyond the page. The page's 0 sits on the
  lake through `onWater`. The island is 0.6 km off on the page and 5.4 km in the model (§6).
- **Work:**
  - The towns bake of the painted heights.
  - The landform stamp (the island and the west stack).
  - The quays to meet the world's water.
  - The Xanadu kit's shore zone reads absolute height 2.5-10 m, so it grows nothing in the world
    (`openworld/xanadu-oidong-highrift/KNOWN_ISSUES.md`); it wants a height over the local water.
- **Risks:**
  - The owner's own map, paused with open items (`KNOWN_ISSUES.md:79-117`).
  - `83-er-data.js` is generated: regenerate it, never hand-edit it.

### Longsong: A n, S-M
- **Page:**
  - Already on the model's ground. `WORLD.H` is read in place: the origin `LS.SITE` = 4.21 px 954,1296, which is
    1226,1626 on 5.1 (`src/40-ls-plan.js:25`; `42-ls-world.js:4-10`).
  - The plan adds its own shapes: the rock, the ward's three terraces, a stream bed, the canal, rice pools
    (`45-host-stage.js:2-5,67-160`).
  - **The stream (r105) runs ~90 m N of the Great Gate**, and the bridge over it is the first threshold
    (`PLAN.md:22-26`).
  - The cut is 4.21 data (`region/source/box.json`).
- **Model on 5.1:**
  - +2,076 m; 1,462 m of relief within 10 km.
  - **The same r105, now the Bīruk al-Ghaym at 550 m³/s, is 11.7 km off.** At its nearest point, 1229,1621 (bed
    +2,089 m), the relief within ±2 km is 15 m.
  - Csa, 988 mm, 11 °C.
- **Fit:** A with a nudge.
  - The page plans on the world already. On 5.1 its stream moved and grew tenfold, so either the pin moves ~6 px onto
    the river's flat, or the page's stream becomes a side stream.
  - A 550 m³/s river 90 m from the gate is a different threshold from a stream (§6).
- **Work:**
  - The nudge; recut the page's `region/` on 5.1 at the new pin.
  - Re-find the stream, then re-check the rock and the terraces.
  - The far ring re-made from 5.1.
  - Two regions plan its villages (`xanadu-oidong-highrift` and the branch's `oidong-highrift`): keep one.
- **Risks:** the page is large (162 people, 653 rooms); the Godot export box is in the page's frame.

### Pinnacle Rock: B, M
- **Page:**
  - The origin is the mesa, the 4.21 cut centre px 755,351, which is 1027,681 on 5.1 (`README.md:15-20`).
  - `floorH = WORLD.H - WORLD_H0` minus the dry gorge (`45-host-stage.js:7-11,33-39`).
  - The mesa is KSTACKS records: 1.2 × 0.8 km, 250 m over its south foot; the Garden's mesa and the Heart above it;
    16 pinnacles; a gorge 60 m deep (`40-pr-layout.js:34,126-128`).
  - The knoll is a 6 × 10 km ridge standing 500-1,000 m over the jungle (`PLAN.md:51-60`).
- **Model:**
  - The pin moved on 2026-11-10 to 1007,686 (`SETT_MOVED['5.1e2']`): a knoll at -1,287 m, 110 m over its 14 km round,
    397 m of relief within 10 km.
  - The Tsékooh Baatar 17.5 km off. Aw, 1,490 mm.
- **Fit:** B. The page still reads the old cut (`openworld/pinnacle/KNOWN_ISSUES.md`). The new knoll is far lower than
  the ridge the mesa's foot and gorge were fitted to. The mesa is the page's own ground (records), so the world takes it
  as a stamp. The region's planned fix is that stamp ("No mesa in the world", the owner's 2026-11-10 answer).
- **Work:**
  - Recut the page's `region/` at 1007,686.
  - Re-derive the mesa's foot: it is computed from the lowest floor round it, so the rock's height changes.
  - Then the landform stamp in `openworld/pinnacle`.
- **Risks:** a perf session works on its frame rate; the layout is owner-settled (2026-10-19).

### Hook: A, M (on a branch)
- **Page:**
  - On `main` only P0, the Port kit's coast (`README.md`; `src/` empty).
  - On `claude/hook-p1`: P1-P3, KLAND (`core/terrain/40-core-land.js`, lifted from little-demo) on a cut round 4.21
    px 537,593, which is 809,923 on 5.1.
  - The origin is on the 1:1 shoreline. The frame is turned -9.2° to the coast. **The Ring Sea is N** (kit S = world N).
  - The land rises +258 m at 2 km and +542 m at 4 km on 4.21.
  - 671 core/city lots of six cultures (branch `PLAN.md:37-45`).
- **Model on 5.1:**
  - On the shore: the pin is a wet cell at -1,503 m. The sea N (-1,709 m at 6 km); the land S (-1,377 m at 6 km,
    i.e. +123 m). Upslope 151°.
  - XA, 4,000 mm. No river of ≥ 20 m³/s within 50 km.
- **Fit:** A. The branch already plans on the model's land with the sea on the right side. On 5.1 the slope behind is
  gentler than on 4.21.
- **Work:**
  - Merge `claude/hook-p1`.
  - Retire its KLAND copy for core/world's `WORLD.H` (PLAN-SITES §5: KLAND is re-lifted from the world runtime).
  - Recut on 5.1, re-plan the lots, then a site in a new `hook` region (or a second site of `voth`, 232 km away).
- **Risks:** a branch three weeks old; the frame's turn is the owner's choice.

### The isle demo (Kautoa, Valapo, Nephtos): A, M
- **Page:**
  - On core/city and WORLD.H (`src/20-isle-ground.js:8-96`). Per-town frames with the origin at the town and heights
    over the Ring Sea (`10-isle-frame.js:2-32`). `half` 4,400 m (`30-isle-programme.js:78,142,199`).
  - The owner's brush deltas on a 6 m grid, plus `levelPad` terraces.
  - The region `openworld/isle-demo` hands the ground back through `landHook`.
  - **All on 4.21/4.23 data**: the region origin 4.21 px 674,424.
- **Model on 5.1:**
  - Kautoa 964,725: -1,191 m (+309 m over the sea; it was +380 m on 4.21), the sea 2 km S, Af.
  - Valapo 942,782: -1,321 m (+179 m; it was +126 m), the sea 6 km NNW, XA.
- **Fit:** A. The page is the open world's own case; it only needs 5.1.
- **Work:**
  - A 5.1 region (PLAN-SITES says this is optional).
  - The saved frames and the owner's strokes checked against the new ground: the strokes are deltas, so they carry
    over, but their intent may not.
  - Re-bake the plans and the sim.
- **Risks:** the economy is tuned here (CLAUDE.md), so a recut moves the sim's baseline. Do it only when the owner says
  so.

### Jimjam: A n, S
- **Page:**
  - A kit sheet: flat `terrainH = 0` on a 2.4 km plane (`src/10-core.js:34`; `90-scene.js:19`). "A city layout is a
    later phase".
  - The lore puts it "by a lake on flood silt" (`78-jj-trades.js:5-6`). The fishing dock is an open gap
    (`KNOWN_ISSUES.md:59,65`).
  - The solstice temple's arch is turned to the southern-solstice sunset at -40° latitude (`74-jj-sacred.js:8-11,164`).
- **Model:**
  - +692 m, 1.2°, on gypsum (`biomes/KARST-SITES-5.1.md:44,280`).
  - **The lake at +430 m is 8 km N.** Its shore cell is 745,546 at +486 m.
  - The Tāmarai-āṟu (116 m³/s) 14 km off. Cfa, 941 mm.
- **Fit:** A. There is no ground to carry. The town is planned on the world when it is made, after a nudge to the
  lake shore.
- **Work:** the nudge; the town on core/city in a region (`north-basin`, recut on 5.1); the temple's yaw from true north
  and the world's latitude.

### Dalab: D, M-L
- **Page:**
  - `CITY.WORLD:4400` (±2.2 km), x east, z south (`targets/city/84-city-geo.js:2-11`).
  - Its own `terrainH`: **2.2 m ± 1 m**, a river cut 3.5 m deep, irrigation channels (`84:61-64`).
  - The river runs N-S at x ≈ -1,980, on the W edge (`84:13,31`), with channels E to six towns.
  - A horizon ring of 14-30 m hills to 9 km (`90a-city-world.js:50-67`).
  - "The SW lowlands", a high-pressure basin between the walls (`README.md:3`; `LORE.md:72,104`).
- **Model:**
  - +606 m; **529 m of relief within 10 km**; 1.2°. Upslope 285° (the land falls E).
  - The Wind Bruk (r106, 41 m³/s) is 10.5 km off, at a bed of +326 m (**280 m below the pin**). Along it within
    40 km, no point has under 200 m of relief within ±4 km.
  - A water body at -9 m, 27-29 km ENE (shore cell 477,1108, +7 m).
  - Csa, 800 mm.
- **Fit:** D. The page is a dead-flat floodplain, and the pin is hill country above its river. Options (§6):
  - (a) move to the -9 m water's lowland, 27 km ENE (check that it is flat and has a river on its W);
  - (b) an edit that lays a floodplain along the Wind Bruk (C);
  - (c) keep the pin and let the world take the page's flat ground. A 2 m disc set into 500 m of relief would be a pit,
    so no.
- **Work:**
  - The decision; then the towns bake (a flat grid, simple).
  - Span's Basin Tunnel's lower portal comes down to Dalab's basin (`settlements/span/PLAN.md:252-262`), so the two are
    sited together.

### Span: B, M
- **Page:**
  - The canyon's own frame: x downstream, z across, y up from the rim (`src/45-host-stage.js:2,9`).
  - Station 4's record turns it to the compass: downstream ≈ S (`site/swhighlands-pillars-site.json:3973`).
  - **The ground is not Span's** (`PLAN.md:33`): the stand-in `SPAN.groundAt` (`src/31-span-rules.js:79-133`) and the
    vendored site record of SW-highlands station 4.
  - The canyon: rim, three benches, a floor at -180 m. The lake at -8 m behind the Ancients' weir; the Head Fall
    (`30-span-layout.js:24-33`).
  - The Pan Riba: 42 m³/s here (`PLAN.md:76-79`).
- **Model:**
  - +2,545 m, 4.7°; 585 m of relief within 10 km.
  - **The Pan Riba (r026, 42 m³/s) is 2.2 km off.** Cfa, 1,820 mm.
  - The PLAN's 4.22 px 282,680 is exactly 554,1010 on 5.1.
  - The model's valley is ~250 m deep; the page assumes 180 m and three benches (`PLAN.md` question 2).
- **Fit:** B. The site, the river and its flow agree. The canyon is sub-cell and belongs to the swhighlands station's
  carve (`KRELIEF.rille`, `KSTRATA`, `KCARVE`; `KNOWN_ISSUES.md:5-10`). The world takes the station's ground as the
  town's.
- **Work:**
  - Wait for station 4's carve.
  - The towns bake reads the station record, not Span's stand-in.
  - The river joined to the r026; the lake as a town water mask.
- **Risks:** the ground's owner is `biomes/swhighlands` (stations 3 and 4).

### Screamers (the Hexahedron): A, S
- **Page:**
  - Flat: `terrainH = 0` (`src/10-core.js:34`), on a ±20 km plane (`90-scene.js:226`).
  - The arcology is the landform: a 1 km double pyramid, 1,100 m tall (`src/68-hexahedron.js:120`).
  - The village and farms are on the flat at its foot. Inland: no coast, no river (`96s-screamers-trades.js:16-37`).
  - The volcano due S.
- **Model:**
  - The pin "Hexahedron", 827,668: -1,345 m, 0.3°, 430 m of relief within 10 km. Two dry washes within 13 km.
  - XV, 1,004 mm, 33 °C.
  - The Throne (846,827) is ~320 km S, matching "the volcano due south".
- **Fit:** A. Flat on flat. The page's hyperjungle is not the model's climate, XV (§6). `LORE.md:268` puts the Shell
  150 km E of the Hexahedron, which contradicts the pin.
- **Work:**
  - The arcology placed on the world's ground (its 300 m shafts stand on whatever is there).
  - The village planned on the world.
  - The region `north-shore`.
- **Risks:** the vendored biome core has drifted (`KNOWN_ISSUES.md:445`).

### Ys: D n t, M
- **Page:**
  - ±1.6 km, sea level 0 (`DESIGN.md:61-62`; `targets/city/84-city-geo.js:2-8`).
  - `YS_NAT` (`84:103-115`): a shore with a beach; a hinterland rising 1.8 % to the NW; the seabed to -30 m.
  - **The Ring Sea fills the SE half.** Karst stacks of 48-118 m carry the landmarks. The Amphitriton is on an island
    ~450 m out.
  - The drowned grid reaches ~700 m offshore.
  - "The head of the north-west bay" (`DESIGN.md:6-7`).
  - The port kit's `terrainH` (`src/71-port-terrain.js:91`) and NAV, `landDist` and `surfAt` are all built on `YS_NAT`.
- **Model:**
  - -1,383 m, **117 m over the sea, 5.7 km inland**.
  - The nearest sea is SW (225°). A shore cell with the sea on its S/E side is 789,741, 6 km S.
  - Upslope 341° (NNW). XV, 1,051 mm.
- **Fit:** D. A shore page on an inland pin. After a ~6 km nudge to the shore, the page's SE sea becomes the world's
  S-SW sea (a turn of about 45-90°), and the land rising NNW agrees.
- **Work:**
  - The nudge and the turn.
  - The towns bake, with the drowned grid and the seabed as the town's below-water ground.
  - The karst stacks and the island as stamps, or in the grid.
  - core/coast if it lands (the surf, the shore band).
- **Risks:** the largest consumer of shore logic, all in the page's frame: a turn moves nothing inside the page.

### Loj Twenny: A, S (on a branch)
- **Page:**
  - On core/city (`KCITY.cavern`).
  - A cavern hall 157 m long at y 0, under a flat stand-in surface, `SURF` 44 m of rock
    (`claude/loj-twenny-059a5e:settlements/loj-twenny/src/20-lt-plan.js:11-24`; `50-lt-cavern.js:8-9`).
  - "25 km east of the Twenny junction" by a branch tunnel (`20-lt-plan.js:17-19`).
- **Model:** +6,217 m, ET, -12 °C; 1,339 m of relief within 10 km; no water.
- **Fit:** A. Underground, the world's surface replaces the 44 m stand-in. Only the night mouth and the branch portal
  meet the ground.
- **Work:**
  - The cover from `WORLD.H` (the rock over the hall is then ~kilometres, not 44 m).
  - A portal where the mouth meets the slope.
  - The siting fork answered first (`PLAN.md` §1; `KNOWN_ISSUES.md:3`).

### Strongbow: D, M (on branches)
- **Page:**
  - No settlement page. The arcology is a kit target (`claude/keen-swanson-68a311:kits/ancients/targets/strongbow/`).
  - `STRONGBOW.frame({lip, floor})` is "for the open world to pass both" (`8aw0-strongbow-plan.js:53-54`). The default
    lip is 900 m.
  - The kit faces S; the real face is SE (`NOTES.md:19-21`).
  - The town is on the bench at the foot, on core/city (`settlements/strongbow/PLAN.md:45,145-162`).
- **Model:**

  | Pin | Where it comes from | Ground |
  |---|---|---|
  | 1026,1594 | this branch | +1,535 m; the Rīfar al-Jadwal (720 m³/s) 5.7 km off; higher N (+2,066 m at 6 km, +4,952 m within 30 km) |
  | 1013,1585 | the kit's NOTES and PLAN | +2,544 m, Dfb; 2,603 m of relief within 10 km |
  | 1001,1596 | the region branch, its latest | +1,400 m, on the lip: -634 m to the W within 6 km; the river 4.1 km |
- **Fit:** D. Three pins on three branches. The owner settled it on 2026-11-11: **1001,1596** on the Xanadu-Oidong scarp by
  Qiblai's cataract (`SETT_MOVED['5.1e5']` on `claude/cool-tereshkova-d594e8`). The Strongbow session re-planned it
  there (`9b83412bf`): a town of ~3,500 at the foot of a 900 m built face partway down the scarp, with a toll and
  customs post on the lip. The kit's 900 m lip fits neither the 430 m bench (`NOTES.md:6-13`) nor the
  3,100 m scarp (`cool-tereshkova:openworld/oidong-highrift/KNOWN_ISSUES.md`). "The town on the bench at the foot"
  conflicts with the region's road ending "on the lip".
- **Work:**
  - One pin.
  - `frame({lip, floor})` fed from `WORLD.H` at that pin.
  - The kit's sun vector turned.
  - The town on core/city on the world's ground (A once sited).

## 4. Cross-cutting needs

**Shared core/world pieces several settlements wait on.** Most come from Voth's V2.

| Piece | Who waits on it |
|---|---|
| **The towns bake** (`core/world/bake_towns.py`: a page's ground as a height grid, its frame, R, band, `rot`, `onWater`) | Voth, Verge, Yuni, Locus, Mungo, Shade, Noah's, Iziz, Roketstad, Dhelv, Erewhon, Pinnacle (rock), Span, Ys, Dalab: **15** |
| **`rot` actually exercised** (41 reads it at `:292`; no bake has used it) | Verge, Noah's, Dhelv, Ys; Hook (-9.2°) and Strongbow (S→SE) in their own frames |
| **`onWater` at a level that is not the Ring Sea's** (41's `lakeWater`, `:300`) | Locus (-2,400 m), Mungo (-1,804 m), Erewhon (-520 m) |
| **Water inside a town** (the page's water polygon as a town mask, at its own level) | Voth; the Iziz moat (-9 m on the page); Yuni's canal; the Locus and Mungo deltas; Verge's pool and salt lakes; Shade's pool; Span's lake; Dalab's channels |
| **A town's river joined to a model river** (a named river in `riverWater`) | Voth (the Turm), Verge (r255), Yuni (r077), Span (r026), Longsong (r105), Mav's (whichever is chosen), Locus (a new one or the Bigga) |
| **The landform stamp** (`model/data/landforms.json` at 1:1) | Erewhon's islands, Pinnacle's mesa, Voth's islets, Yuni's butte, Ys's stacks and island, Iziz's mesas if not in the grid, Strongbow's cliff |
| **A node harness that runs a page's ground fragments** (the `[G data]` ones in `PORT.md`) without THREE | All B pages. Verge's `VG.groundH` and Dhelv's `DH.groundY` already run in node (their layout tests), so they are the easy first two. Yuni, Locus and Mungo share one engine, so one harness serves three |
| **The town steps lifted out of `ISLE`** (PLAN-SITES step 3) | The A pages that are to be planned on the world: Girder, Jimjam, the Hexahedron, Talia, Pylon, Qiblai, and Strongbow's town |
| **A relative shore band in the kits** (the Xanadu kit reads absolute height 2.5-10 m for its shore) | Erewhon now; any culture kit with a shore zone on a lake that is not at 0 |

**Pin edits that could be batched.** One `SETT_MOVED['5.1e6']` version, with no surgery, after the owner's answers:
- Verge → ~1265,949;
- Mungo → its lake's east shore;
- Longsong → ~1229,1621;
- Jimjam → ~745,546;
- Ys → ~789,741;
- Dalab and Strongbow once decided.

Then republish the model and its database once, not per edit.

**Map surgery:**
- Voth's edit_513 (box px 725-800 × 995-1040).
- Mav's river (option a), which would be a second edit in another box (1000-1050 × 780-830).
- A Dalab floodplain only under option (b).

These touch disjoint boxes, so they can run in one session one after another: each refuses to run twice and keeps every
raster outside its box (the edit_512 pattern).

**Regions to cut together** (corridors as in `iziz-cluster`):

| Region | Sites | Note |
|---|---|---|
| `voth` (new) | Voth, Torus | PLAN-VOTH V3. Hook could be a third site 232 km NNE, or its own region |
| `east-rim` (new) | Shade, Verge, Locus, Yuni, Mungo (+ Reed) | Corridors: Shade-Verge 140 km, Verge-Locus 194 km, Locus-Yuni 92 km, Shade-Mungo ~200 km. The scarp, the abyss and its lakes in one cut. The kits: sedesert, eastabyss, ebadlands |
| `iziz-cluster` (extend) | + Iziz, + Pylon | Talia → Iziz ~240 km; Iziz → Pylon 190 km |
| `north-shore` (new) | Ys, Dhelv, the Hexahedron, Noah's Regret (+ Zey'danin, the Throne's Zeijani villages) | The Ring Sea's north and west shores under the Throne. Overlaps the isle demo's 4.21 box, so decide whether the isle demo's 5.1 recut is this region |
| `southwest` (new) | Dalab, Span, Loj Twenny (+ Tallwalls) | Span's Basin Tunnel joins Dalab; Loj Twenny is 157 px S of Dalab |
| `xanadu-oidong-highrift` / `oidong-highrift` | Erewhon, Qiblai, Longsong, Strongbow | Two regions plan Longsong's villages today: keep one owner per site |
| `north-basin` (recut on 5.1, made a build) | Jimjam (+ Roketstad if widened) | Data only today, on 4.21 |

## 5. Suggested order

**First, the cheap wins (no new core):**
1. **The owner's answers (§6) and one pin batch** (`SETT_MOVED['5.1e6']`, §4), then republish the model once. S.
2. **Longsong recut on 5.1** at the nudged pin. Its page already reads `WORLD.H`, so this is the smallest real move.
   S-M.
3. **Pinnacle Rock's page recut** at 1007,686, with the mesa's foot re-derived. Its stamp follows with the landform
   stamp. M.
4. **Girder on the world** inside `iziz-cluster`: a `levelPad` terrace as a ground delta. This is the first A town
   drawn in a region, so it is the test of PLAN-SITES step 3 on the smallest case. S-M.

**Then the towns path (blocked on V2, Voth's core/world pieces):**

5. **The first non-Voth towns bake: Verge or Dhelv.** Both grounds already run in node, and both exercise `rot`. Then
   Locus, which exercises `onWater` at -2,400 m and gives `east-rim` its first town; Yuni and Mungo share the same
   harness.
6. **Erewhon** (onWater at -520 m, plus the landform stamp), **Iziz** (the moat as town water) and **Shade** (a
   sub-cell cut).
7. **Noah's Regret and Ys** after the turn and nudge answers, and after core/coast if it is to carry their shore bands.
   core/coast is in progress on `claude/eager-babbage-31ce37` (2026-11-11), not committed yet.
8. **Span** when SW-highlands station 4's carve lands; **Roketstad** when the curtain and forest question is answered.

**Last, the C and D grades:**

9. **Voth** (V1 edit_513 in parallel with V2, then V3-V4: PLAN-VOTH §4).
10. **Mav's Refuge**: the river decision, then an edit or a move, then the region recut and the link re-laid.
11. **Dalab**: re-site or surgery, together with Span's Basin Tunnel portal.
12. **Strongbow**: one pin agreed between the kit session and the region session. **Hook**: once `claude/hook-p1`
    merges.
13. **The isle demo's 5.1 recut**: only when the owner wants the economy's baseline moved.

## 6. The owner's answers (2026-11-11)

The numbers are this section's questions below.

| # | Settlement | Answer |
|---|---|---|
| 1 | All B grades | **Both, settlement by settlement.** Some will be rebuilt entirely on the open world's ground; others hand their ground over and only need the world to influence them a little. |
| 2 | Verge | **Yes:** the pin to the Rrivar Blaca's fall off the scarp (~1265,949), and the frame turned so the plateau lies N-NW. |
| 3 | Yuni | **North-west** is correct. The page's NE uses (`:240`, `20-stage.js:129`) are to be fixed. |
| 4 | Mungo | **Yes:** the pin out of the lake to its east shore. |
| 5 | Shade | **Move it to an oasis in the north, closer to Pinnacle Rock.** |
| 6 | Noah's Regret | **Turn the frame 90°.** |
| 7 | Mav's Refuge | **(b):** move it to a river 68-79 km off, and recut the region (iziz-cluster). |
| 8 | Roketstad | **Move the pin** (to where the page's ranges and forest are). |
| 9 | Erewhon | **The Pleasure Dome's island off the quays (0.6 km)**, as on the page. The landform record moves. |
| 10 | Longsong | **Move the pin onto the 550 m³/s river.** |
| 11 | Jimjam | **Yes:** 8 km N to the lake's shore. |
| 12 | Dalab | **Yes:** move it to the -9 m lowland 27 km ENE. |
| 13 | Ys | **Yes:** move to the shore and turn the frame. Choose a spot on the nearby coast with a good number of rock stacks. |
| 14 | The Hexahedron (Screamers) | **Move it into the hyperjungle.** |
| 15 | Strongbow | Settled earlier: 1001,1596 on the Xanadu-Oidong scarp. |
| 16 | Loj Twenny | **Under the great shaft** (station 3). |
| 17 | Reed Lake | **There will be a larger reed village at the model's Reed.** A short way off is a **large town of Tabisti buildings, the centre of pure-strain Tabisti culture**: a new settlement for the map and the lore. |
| 18 | Regions | **Cut `east-rim`, `north-shore` and `southwest` as proposed** (§4), after the pin batch so the cuts see the new pins. |

### The pin batch (`SETT_MOVED['5.1e6']`, 2026-11-11)

Surveyed on the model; the owner chose among the options where a choice was needed.

| Settlement | From | To | Frame turn | Note |
|---|---|---|---|---|
| Verge | 1263,946 | **1268,949** | about -10° | at the Rrivar Blaca's steepest step; the plateau lies W-WNW there (a -45° to -60° turn would set the page's river off the model's) |
| Mungo | 1321,825 | **1322,828** | - | the east shore at the Gl Ṣḫr's mouth, 34 m over the lake |
| Shade | 1229,885 | **1085,683** | - | a spring-head oasis under a 2,400 m wet wall; 156 km from Pinnacle Rock. No surface water on the model, so the pool goes in a towns water mask |
| Mav's Refuge | 1024,807 | **1049,841** | - | the Béesh Baatar's floor (90 m³/s, 43 m wide; the page's river is 72 m). Girder is 58.7 km by road; the iziz-cluster region is recut |
| Roketstad | 609,684 | **632,716** | - | a forest shelf on the Inner Wall's outer flank, +2,980 m, Cfb |
| Jimjam | 746,550 | **745,546** | - | 56 m over its lake |
| Dalab | 464,1112 | **477,1108** | about +45° | the Wind Bruk's delta at +7 m; **its flat plain needs a small map edit** (293 m of relief within 4 km; the owner chose surgery) |
| Ys | 789,738 | **788,741** | about -55° | the cliffed shore with a lagoon shoal; the stacks are the page's own (none on the model at 2 km) |
| The Hexahedron | 827,668 | **817,670** | - | the hyperjungle climate all round within 6 km |
| Reed | 1277,676 | **1280,678** | - | the shallows by the east shore's landing |
| **Tabist town (new)** | - | **1270,666** | - | `seur98e8mv`, type town, name to come (merged into Gemini's Sfenops, `sn98ob5duu`, 1282,663: the owner, 2026-11-23, "Merge them"; scale model 5.1e16): a flat strip on the strait between the lake's west arm and the main lake, 24 km NW of Reed (`SETT_ADDED['5.1e6']`) |

**Not in this batch:**
- Longsong: the Oidong-High Rift session moves it onto the Bīruk al-Ghaym (`SETT_MOVED['5.1e7']`, its branch).
- Strongbow: `5.1e5`, on the same branch.
- Erewhon's isle record: the Erewhon-fit session.

**Still to do:**
- **Frame turns** (Verge, Noah's Regret 90°, Ys, Dalab), each in its own page.
- **Yuni's** north-east code paths turned to north-west.
- **Dalab's** delta-plain edit.
- **Dry pits beside three lakes** that a towns bake must not sample (Mungo, Dalab, Reed).
- **Republishing** the model.
- **Cutting** east-rim, north-shore and southwest.

### The second batch (`SETT_MOVED` / `SETT_ADDED['5.1e8']`, 2026-11-12)

From the resource census (`openworld/RESOURCES-SETTLEMENTS.md`, the Krator Resource Atlas artifact). The owner applied
the recommended set.

| What | Change |
|---|---|
| **Ardent** | 851,572 to **830,553**: from 3,796 m and dry ground to wet, forested Cfa farmland, with tin and copper within 13 km (the lore's bronze) |
| **Strongwall** | 914,1634 (a pit on the model) to **912,1640**: flat ground 6 km from the rich copper band |
| **Tabist town** | 1270,666 to **1285,655**: up the Rīfar al-Sarāb, still low, far more farmland |
| **Iziz iron mine** (new, `sz5upw419z`) | 936,1013, a rich iron field 78 km SW, with an 80 km road to Iziz; Talia's iron tribute as a second source |
| **Voth iron mine** (new, `sowif50v6z`) | 732,1014, rich iron 22 km W (Voth already has decent iron within reach) |
| **Reed upriver fields** (new, `s7f7ct6r5p`) | 1297,683. Reed stays on its salt lake; its fields are 35 km up the Rīfar al-Qaṣr |
| **Pylon tin outpost** (new, `s1b3vyhdck`) | 875,1015, 29 km SSE. Pylon stays round its Monolith |
| **The Eternian capital** | stands round **Fulcrum** (409,621, on rich iron), LORE.md §6.19. Lux stays a city |

`5.1e7` is Longsong's, on `claude/cool-tereshkova-d594e8`.

**Owed:**
- Strongwall's old pin sits in a pit on the model: a model fix.
- LORE §6.19's distances to re-measure from Fulcrum.
- **Scrap to iron** (`core/simulation/PROPOSAL-LONGSONG-PINNACLE.md` section 7).

The questions as asked:

1. **Handing over vs rebuilding (all B grades).** PLAN-VOTH's question 4, for every B page: hand each page's own ground
   to the world (this scope), or plan each to be rebuilt on the world's ground later?
2. **Verge.** Move the pin ~8 km to where the Rrivar Blaca (15 m³/s) falls off the scarp (~1265,949), and turn the
   frame so the plateau lies N-NW as in the model?
3. **Yuni.** Is the valley's mouth NW (`10-core.js:101`, and the model agrees) or NE (`:240`, `20-stage.js:129`)?
4. **Mungo.** Move the pin out of the lake to its east shore (2-6 km)?
5. **Shade.** The model gives Dfb, 13 °C, 596 mm, not sedesert. Keep the page's desert (a move to a drier spot), or
   take the model's climate for its flora?
6. **Noah's Regret.** The sea is E of the pin, not N. Turn the frame 90° (the hull's bow then points S), or move 28 km
   E to a shore with the sea N (910,868)?
7. **Mav's Refuge.** The page's 72 m river has no counterpart. Which?
   - (a) A new river through the pin to the sea 11 km NE (map surgery).
   - (b) A move to a river 68-79 km off (the Auwai Kura, Tł'éé' Baatar or Béesh Baatar), with the region recut.
   - (c) The river shrunk to the Vai Toka (25 m³/s) and the pin moved 16 km onto it.
8. **Roketstad.** The model has no mountains within 30 km and a cold dry Dsb plateau. Keep the page's ranges and
   temperate forest (and move the pin toward the Inner Wall, if the rim is elsewhere), or follow the model?
9. **Erewhon.** The Pleasure Dome island: 0.6 km off the quays (the page) or 5.4 km (the model's record)? One of the
   two moves.
10. **Longsong.** The 5.1 r105 is a 550 m³/s river 11.7 km off. Move the pin onto it (the gate's bridge then crosses a
    big river), or keep the pin and give the page a side stream?
11. **Jimjam.** Move the pin 8 km N to the lake's shore, as the lore wants?
12. **Dalab.** Move it to the -9 m lowland 27 km ENE, cut a floodplain on the Wind Bruk (map surgery), or something
    else? The pin is hill country 280 m above its river.
13. **Ys.** Move the pin 6 km to the shore and turn the frame (the model's sea is S-SW, the page's SE)?
14. **The Hexahedron.** Is the pin (827,668) right, given `LORE.md:268`? Its ground is XV veldt, not the page's
    hyperjungle: which wins?
15. **Strongbow.** Which pin: 1026,1594 (this branch), 1013,1585 (the kit's notes) or 1001,1596 (the region's latest)?
    And is the lip 430 m, 900 m or the scarp's height?
16. **Loj Twenny.** The siting fork that is already open: the 25 km branch, or under the great shaft at station 3?
17. **Reed Lake.** Is the model's "Reed" (1277,676: an abyss lake at -2,331 m, 39 °C) where the reedlake kit's village
    stands, or is the kit only Mungo's reed district?
18. **Regions.** Cut `east-rim`, `north-shore` and `southwest` as proposed? Is the isle demo's 5.1 recut part of
    `north-shore`?
