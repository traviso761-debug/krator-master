# riftrim: the plan (draft, 2026-10-23)

**The rift rim**: the high country round the Rift, south of the crater across the Outer Wall. Wild and untamed: the
walls of the Rift's trough and the highland at its western head, a staircase of lakes from a great lake in a sheltered basin at
~300 m to tarns at 5.8 km, forest, tundra and ice. **Three biomes, one family** (the owner, 2026-10-23): the N rim, the S
rim and the W rift highland, thematically alike and visually distinct, their flora mostly their own and alien, with some
of the Rift's, the SW lowlands' and the S highlands' (section 3).

Owner's brief (2026-10-23): the region is wild and untamed; too high for the Lizardmen to venture comfortably, and too
far, with too many Lizardmen in the way, for Xanadu to exert an influence. In practice **the only real power is Dalab**,
whose genepriests can mod for cold and altitude, letting its people cross the Outer Wall by a road built partly through
**Ancient underground tunnels**. Dalab has occupied an abandoned arcology (the name and theme are placeholders) and
studies the flora and fauna for useful genes, but **its hold is tenuous**, given the distance and the difficulty of the
road. Natives are undecided: not Lizardmen, perhaps not standard humans. Earlier (2026-10-23): the rim splits N, S and
W, and **the highland lakes are the most interesting feature**.

It is also the kit the Rift kit's own notes ask for: "The highland is a sketch… It is meant to become its own kit (the
highlands) on the same fields" (`biomes/rift/NOTES.md`).

**Status: plan, awaiting the owner.**

## On scale model 5.1 (re-surveyed 2026-11-03; supersedes the px in sections 1, 5 and 9)

The plan below was surveyed on map 4.21/4.22. **Every station, lake and the road is re-placed here on 5.1**
(`tools/scale-model/model/data`, read with `smodel.page`; the canvas shift +272,+330 from the old px, `smodel.page.legacy_px`;
1821x1723 px at 2 km). **World km** is the 5.1 global frame (`x = px x 2`, `z = py x 2`). Pressure is 1.6 atm x e^(-h/8 km), as
`survey_biomes.py` and the Hearths' table use. Section 1's old-px numbers are kept as written for the record; where they differ, this
section wins.

**What moved: almost nothing.** Gemini's 5.1 kept the rim as 4.22 left it: all fifteen lakes are where the shift puts them, at the
same levels to the metre, and Ledge, the gorge and the road agree with the plan within the model's resolution.

### The polygons on 5.1

| Polygon (`51-region-store.js`) | 5.1 px box | km² (rasterised) | Land median | Note |
|---|---|---|---|---|
| `w rift highland` | 308-517 x 1221-1419 | 121,000 | 4,545 m | as planned |
| `rift rim N` | 496-759 x 1338-1516 | 37,000 | 4,647 m | was 43,000 on 4.21 |
| `rift rim S` | 344-929 x 1379-1682 | 134,000 | 4,740 m | was 103,000: the owner's split put more of the south-west into it |

Also over the rim on 5.1, new since the plan: **Nulab** (city, 443,1359: on the great lake's south shore, 344 m, Csa), **Shelf**
(arcology, 461,1161: in the Outer Wall's northern foothills, on Dalab's road), **Loj Twenny** (cavern, 457,1269, on `tube_rift_08`'s
line), **Wildcat** (village, 427,1453: a Fellgang name), **Cthonos** (526,1503) and **The Tubes** (608,1547), and the political
polygons `Dalab Council` (317-555 x 992-1424), `Tungang Union` (399-517 x 1140-1345) and `Fellgangs`.

### The lakes on 5.1

Levels are the model's water level (`wl`); depth is the level less the lowest floor cell under the lake (the model's filled hollow,
so the deepest point, not a mean); the shore is a 3-px ring round the water.

| Lake | 5.1 px | World km | km² | Level | Depth | Shore | Rim |
|---|---|---|---|---|---|---|---|
| **The great lake** (Ledge's) | 438,1344 | 876,2688 | 2,336 | **297 m** | 556 m | Csa, 1,052 mm, +16.6 °C | W |
| N | 568,1403 | 1136,2806 | 624 | 1,887 | 853 | Csb, 968 mm, +8.9 | N |
| S | 502,1553 | 1004,3106 | 624 | 2,074 | 1,527 | Dsb, 676 mm, +7.8 | S |
| S | 651,1607 | 1302,3214 | 768 | 2,220 | 1,411 | Csb, 609 mm, +7.0 | S |
| N | 670,1458 | 1340,2916 | 400 | 2,383 | 776 | Dsb, 730 mm, +7.4 | N |
| N | 621,1428 | 1242,2856 | 352 | 2,728 | 700 | Dsb, 737 mm, +5.8 | N |
| S | 574,1582 | 1148,3164 | 848 | 2,735 | 1,626 | Dsb, 630 mm, +4.3 | S |
| **N, the largest** (station 2) | 533,1391 | 1066,2782 | 1,120 | **3,272** | 2,448 | Dsc, 947 mm, +1.7 | N |
| N | 519,1370 | 1038,2740 | 544 | 3,427 | 1,129 | Dsc, 835 mm, +0.7 | N |
| S | 759,1651 | 1518,3302 | 768 | 3,531 | 1,440 | Dsc, 371 mm, -0.4 | S |
| S | 469,1530 | 938,3060 | 608 | 3,570 | 1,718 | Dsc, 600 mm, -0.3 | S |
| S | 703,1621 | 1406,3242 | 1,008 | 3,848 | 2,190 | Dsc, 478 mm, -1.0 | S |
| **S, the cold lake** (station 3) | 706,1645 | 1412,3290 | 688 | **4,477** | 1,108 | ET, 230 mm, **-6.1** | S |
| W tarn | 335,1274 | 670,2548 | 336 | 5,570 | 889 | ET, 973 mm, -6.4 | W |
| W tarn | 324,1240 | 648,2480 | 240 | 5,818 | (the model's floor is a deep hollow) | ET, 1,901 mm | W |

The depths are the model's hollows, filled to their spills: they are deeper than the plan's estimates and than a page needs. **The
pages draw the plan's depths** (the great lake 573 m, the N lake ~1.1 km at most, the cold lake ~500 m; the tarns shallow), since a
station sees the shore and the first hundred metres of water, not the floor.

### Dalab's road on 5.1

A least-cost line on the model's heights (grade cost (g/6 %)², heights over 6 km penalised, no water) from Dalab (464,1112, 591 m)
to Ledge (437,1330): **528 km** (the plan: ~510), **158 km over 6.5 km** (~150), **62 km over 8 km**, **24 km over 9 km** (~20),
the crest **9,645 m at 483,1236** (world 966,2472; the plan: 9.4-9.7 km at old 209,902 = 481,1232). It climbs through the
foothills past Shelf (461,1161), reaches 5 km by y 1196, 8 km by y 1220 (488,1220: the **north portal** of the tunnel, 7,969 m),
crosses the crest, and drops back under 8 km by **477,1245** (8,052 m, the **south portal**), 6.2 km by y 1270, 4 km by y 1300 and
the cliff top over the lake at 436,1329. So the tunnel under everything over 8 km is ~60 km long, as the plan said (60-70 km). The
crossing lies in `Dalab Council` and `Tungang Union`, not in a rim polygon: it is the road's, and the station keeps its rim flora
(the S rim's barrens and fellfield) by height, as the plan's "W into S" says.

### The stations on 5.1

| # | Station (page) | Rim | 5.1 px | World km | Ground | Climate | Air | Relief (30 km) |
|---|---|---|---|---|---|---|---|---|
| 1 | **Ledge and the great lake** (`dist/riftrim.html`) | W | Ledge **437,1330**; the lake's centre 438,1344 | 874,2660 | cliff top 1,563 m, the lake 297 m (1,266 m below) | Cfa, 878 mm, +15 (26/3) on the top; the shore Csa, ~1,050 mm, +16.6 | 1.32 atm | 3,538 m |
| 2 | **The lakes of the north rim** (`-lakes`) | N | the lake 533,1391; the station on its east shore 545,1400 | 1090,2800 | the lake 3,272 m, the shore 3.3-4.0 km | Dsc, 816-947 mm, +1 (13/-12) | 0.97 atm | 3,327 m |
| 3 | **The cold lake** (`-ice`) | S | 706,1645 | 1412,3290 | the lake 4,477 m | ET on the shore, 230-314 mm, -6 (shore mean) | 0.92 atm at the water | 2,509 m |
| 4 | **The gorge** (`-gorge`) | W | the notch 464,1390; **Chimes** 468,1392 | 928,2780 | the river at 299 m to the brink at px 466,1394, then **a fall of ~1.9 km in 12 km** (187 -> -731 -> -1,534 m by px 470,1398); shoulders to 2.96 km | Cfa/Csa, ~1,050 mm, +22 | 1.54 atm | 4,775 m |
| 5 | **The crossing** (`-pass`) | W into S | the south portal **477,1245**; the crest 483,1236 (21 km NE) | 954,2490 | 8,052 m at the portal, 9,645 m at the crest | HF (the ice cap) at the portal, O (airless) at the crest; no rain on the model | **0.58 atm**; the crest 0.48 | 2,210 m |
| 6 | **The black barrens** (`-barrens`) | S | **521,1567** | 1042,3134 | a plateau at 4,774 m on the trough's edge: 4.2 km down to the Rift's floor within 20 km | ET, **173 mm**, -4 (9/-17): the rim's driest high ground | 0.88 atm | 3,766 m |

How the new sites were chosen: station 6 is the flattest ET ground at 4.7-5.4 km in `rift rim S` with the trough falling away beside it
(5-px relief 308 m, 4.2 km of drop within 20 km; the other candidate, 428,1501 at 5,199 m, is flatter but wetter, 408 mm, and far
from the trough's edge). Station 5 is the road's south portal, where it falls back under 8 km. Station 4's centre is the notch where
the river leaves the plain. The **Hearths' stations** (`biomes/hearths/PLAN.md` section 11: `--station hearths` at 525,1400, 3,736 m;
`hearths-hold` under it; `hearths-walk` at 430,1388) are the Hearths kit's, hosted by this kit. **`hearths` is built** (2026-11-09: station 7,
section 9 and "Station 7, the Hearth field" below); the hold's two cave pages are still `biomes/hearths`' own, and `hearths-walk` is owed.

### Caverns on 5.1 (`biomes/KARST-SITES-5.1.md`)

- **Site 6, Ledge's cliff springs** (437-445, 1330-1345; branch, B-): the branchwork from the cliff top to springs at the great lake's
  foot is station 1's cave (`KKARST.network({kind:'branch'})` in the `rift` fill, `rock:'gypsum'`, as the survey suggests the fill's
  evaporites); the Rift line's tunnel meets it by design, its joint given an id.
- **Site 4, the Hearth hold** (525,1400; hypogene): the Hearths' station 2, not this turn.
- **Site 3, Cube's gypsum maze** (720,1570) is the Rift kit's station 4, not this kit's.
- Lava tubes round the rim's vents (old px 205,1037, 158,1058, 253,1070 = 5.1 477,1367, 430,1388, 525,1400): the Hearths' fields
  stand on two of them. No station of this turn sits on a vent.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/riftrim/` (the usual kit layout, with `stations/`) |
| Polygons | `rift rim` (the N and S rims, split by the Rift's axis) and `w rift highland` (the western head, which supersedes the rim there): 267,000 km² together |
| Pages | six stations (section 9) |
| Biomes | three on one kit: `RRIM.biome('n' \| 's' \| 'w')`, each a weighting of the zones and a species list (section 3), sharing the fields and the core |
| Core | the biome core, `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, the strata module's `canyon` recipe on the trough's walls), `core/water`, the shared sky |
| Read in place | `biomes/rift` (the beard tree, the cloud tree-fern, the monkey-puzzle, the giant groundsel, the peak pine, the silver scrub, the Rift stone pine, the fan tree), `biomes/swlowlands` (the tier cedar, the cork oak, the bay laurel, the veil willow) and `biomes/shighlands` (the crozier tree fern, the coilbark, the spiral aloe), by rim (section 3); nothing copied. The Rift kit's own highland can then read this kit back |
| Object | `RRIM` on the `BIOME-API.md` contract |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground (4.21, surveyed 2026-10-23)

| Part | km² | 3-4.5 km | 4.5-6 km | Over 6 km | Rain | Lakes |
|---|---|---|---|---|---|---|
| **W highland** (`w rift highland`) | 121k | 37k: Dsb 55%, Dsc 44%, ~850 mm, mean +3 (16/-10), ~1.0 atm | 37k: ET 83%, ~560 mm, -6 | 34k: EF 64%, ET, ~300 mm, -14 | the wettest | the great deep lake; two tarns over 5.5 km |
| **N rim** | 43k | 18k: Dsc 86%, ~740 mm, 0 (13/-13) | 18k: ET 87%, ~440 mm, -7 | 3k: EF, ET | middle | five lakes, 1.9-3.4 km |
| **S rim** | 103k | 31k: Dsc 81%, ~570 mm, 0 | 39k: ET 96%, ~300 mm, -7 | 25k: EF 83%, ~160 mm, -15 | the driest | seven lakes, 2.1-4.5 km |

Under 3 km there is little (the rims drop fast into the trough): ~3,500 km² of Csa, Csb and Dsb on each part's lower
edge, ~700-1,000 mm, +9 to +16 °C. Nothing on the rim is airless.

### The lakes (the feature)

Every lake stands under its own shore (checked: level against the lower quartile of the shore), so the levels hold.

| Lake | Where (px) | km² | Surface | Depth | Shore | What it is |
|---|---|---|---|---|---|---|
| **The great lake** (Ledge's), **4.22** | the basin px 146-201 by 1001-1058 (W); the lake in its north-west (centre px 166,1014) | **2,342** (8,768 on 4.21) | **298 m** (1,312 on 4.21) | 573 m (3.3 km on 4.21) | the basin plain round it: Csa, Cfa, +16 °C (25/6), ~1,040 mm; the north cliff over the water | the rim's heart: a lake under a cliff in a warm basin, its outlet a gorge to the Rift |
| N rim | 261,1060 | 1,120 | 3,271 m | ~1.1 km | ~860 mm, +3 | the largest of the N rim's chain |
| N rim | 295,1072 | 624 | 1,887 | ~550 m | ~1,110 mm, +11 | |
| N rim | 247,1039 | 544 | 3,427 | | ~815 mm, +2 | |
| N rim | 397,1128; 348,1098 | 400; 352 | 2,383; 2,728 | | ~700-800 mm, +7-9 | |
| S rim | 431,1290 | 1,004 | 3,847 | ~850 m | ~500 mm, 0 | |
| S rim | 302,1252 | 848 | 2,734 | | ~600 mm, +6 | |
| S rim | 486,1320; 379,1277 | 768; 768 | 3,531; 2,219 | | ~370-520 mm | |
| S rim | **433,1314** | 688 | **4,477** | ~500 m | ~300 mm, **-4 °C** | the coldest lake: frozen most of the year |
| S rim | 229,1223; 196,1199 | 624; 608 | 2,074; 3,569 | | ~610-630 mm | |
| W tarns | 62,944; 51,909 | 336; 240 | **5,568; 5,810** | shallow | ~330-890 mm, -8 to -10 | ice-bound tarns under the Outer Wall, 0.8 atm |

The rim is a **staircase of lakes** from ~300 m to 5.8 km: each step a different water, by height, rain and rock (section 3).

### The great lake's basin (4.22)

On 4.21 the great lake is a hollow 3.3 km deep (floor -2,028 m) that the river audit filled to its spill at 1,312 m:
8,768 km², the deepest lake on the map, falling 1.3 km straight into the Rift through a notch at px 194,1059. The water
books agree (its evaporation never exceeds ~150 m³/s at any level, against ~800 m³/s coming in), but the hollow does not
hold up: a pit at the Rift's shallow head, behind a thin ridge a river that size would have cut through long ago. The
owner (2026-10-23): no deeper than the Rift beside it, shallower, and a gorge that frees land between the Rift's floor and
the rim. **4.22** (`tools/scale-model/README.md`, "4.22"; on the model since 2026-10-23):

- **The basin plain**: the hollow refilled as a plain rising from a shore at ~+300 m to ~1,250 m at the walls'
  foot, **6,449 km² of new land**: higher than the Rift's floor (-1,600 to -1,850 m nearby), far lower than the rim
  (3-6 km). Sheltered on three sides by the highland, a mean of +16 °C (warmest month +25, coldest +6), ~1,040 mm, Csa and Cfa: **the warmest, most
  farmable ground on the rim**, where Dalab's hold could grow its food.
- **The lake**: 2,342 km² at 298 m, 573 m at its deepest (to -275 m), in the basin's north-west under the north cliff.
- **The gorge**: the outlet river (*Chimes Riba*) crosses the plain south-east to a new notch just west of the old one, and
  the gorge cuts through the ridge, ~1.7 km deep under shoulders of 2.1-2.7 km, past **Chimes** (ruined arcology, px
  196,1062, 7 km from the gorge) to the Rift's trough lake (-1,862 m): 92 km from the lake, ~940 m³/s.

### Dalab's road (the model's heights)

From Dalab (px 192,782, 606 m) the easiest way to the great lake runs **about 510 km** south over the Outer Wall: up to
~5 km by y ~850, ~7.8 km by y ~882, a crest of ~9.4-9.7 km at about px 209,902, down past ~7 km by y ~930, and onto the
lake's north shore at about px 166,1000. About **150 km lies over 6.5 km** (under 0.7 atm, hard going even modded), and
about **20 km over 9 km: the airless crest**, where nothing breathes. **The Ancient tunnels run under the crest**: at
least the 20 km under the airless stretch, more likely 60-70 km under everything over 8 km. That is why the road exists
at all, and why it is fragile.

## 2. Who holds it (the lore, with proposals)

- **Dalab, tenuously**: the arcology on the great lake (section 5), the road and its waystations, field stations at a
  few lakes; supply trains of modded porters and Dalab lizards (the cold-modded strain is a proposal) a few times a year.
- **Nobody else**: the Lizardmen keep to the Rift's floor and lower walls; Xanadu is beyond them.
- **Natives**: the Tungangs, the Rift line's Ancient worker caste gone feral, Morlock-like, with holds in the caverns,
  and their wilder highland branches, the Fellgangs (the owner, 2026-10-23; section 6; the names proposed).

## 3. The flora: three rims

**The owner's brief** (2026-10-23): three biomes in this much area should be **thematically similar but visually
distinct**. They may take some of the **Rift's** plants (they border it), some of the **SW lowlands'** and, less, the
**S highlands'** that have been introduced, but **a plurality of their plants should be their own, and mostly alien**.
The **W rift highland** has the most of the SW lowlands' and S highlands' plants.

**What they share** (*proposed*): the rim is high, cold, thin-aired country over the Rift's abyss, and its own plants
answer the same three problems in their own ways: **cold** (they store heat), **light** (the sun is fierce at 4-6 km, the
growing season short), and **water** (it falls as snow and fog, and lies in lakes). Every rim plant is built round one of
those, so the three read as one family. Where an Earth plant is the model, it is named. All three keep a thread of the
Rift's palette (teal, violet, a hot pink in the flowers), and each has a palette and a **shape** of its own:

| | N rim | S rim | W rift highland |
|---|---|---|---|
| **Its name** (*proposed*) | the **glass rim** | the **black rim** | the **veiled rim** |
| **The climate** (section 1) | the middle: forest and lakes, ~740 mm in the montane | the highest and driest: tundra, rock and ice, a quarter of it over 6 km | the wettest, in cloud: the great lake, Dalab's road, the lowlands below |
| **The shape** | **vertical**: tall columns over still lakes, the forest and its reflection | **low**: carpets, cushions and rosettes on bare rock and snow, and nothing taller than a man | **hung and patched**: mist, veils hanging from every branch and boulder, a mosaic of native and introduced stands |
| **The trick** | **glass**: water-filled, translucent tissues that pipe light down into the plant; the low sun lights them from inside | **black**: dark pigments that drink the sun's heat, and leaves that turn with it | **fog**: fine filaments and cups that comb the cloud for water |
| **The palette** | teal, ice-blue, violet, glass | black-violet, rust, bone-white; red and violet snow | copper, gold, moss green; the lowlands' greens where the introduced grow |
| **Borrowed** | some of the Rift's cloud forest | the Rift's alpine giants, little else | the most: the SW lowlands' and the S highlands' |

### Zones (by height, rain and the lakes; each rim weights them)

| Zone | Where | N rim | S rim | W rift highland |
|---|---|---|---|---|
| `shore` | the warm lower edges and the great lake's basin plain (Csa, Csb, Cfa, under ~2.5 km) | narrow | narrow | **wide**: the basin plain, the gorge's head |
| `montane` | 2.5-4.5 km (Dsb, Dsc) | **the main zone**: the glass forest | thin: krummholz and carpets | **the main zone**: the cloud belt |
| `alpine` | 4.5-6 km (ET) | high meadow | **the main zone**: the black barrens | fellfield over the cloud |
| `ice` | over 6 km (EF) | little | **a quarter of the rim** | the peaks |
| `lake` | every lake and tarn | the algal and peat lakes | the glacial and frozen lakes | the great deep lake and the tarns |

### The N rim: the glass rim

The lake country's forest: tall columns standing in still water, and the water standing in them.

| Key | Name | | Model | What it is | Harvest |
|---|---|---|---|---|---|
| `frostfrill` | Frost frill | own | the Rift's frill tree as a subalpine conifer | a ribbed teal column 25-40 m with short stiff fins in whorls instead of branches; the fins are **translucent**, and the low sun lights the whole column from inside; a violet bud at the tip in summer | the resin (a varnish); the fins as tinder |
| `bellfir` | Bell fir | own | the Rift's bell palm crossed with a fir | a pale trunk forking two or three times, each tip an inverted bell of pleated blue-green needles that closes in winter | the closed bells' winter seed: **the staple** (section 7) |
| `glasscane` | Glass cane | own, new | horsetail (*Equisetum*), made glass | groves of jointed, water-filled canes 3-6 m in the lake shallows, clear as glass, green at the joints; they ring against each other in the wind | none (the canes are cut for pipes and floats) |
| `lenswort` | Lenswort | own, new | the window plants (*Lithops*, *Fenestraria*) | a ground cover of fat, clear-tipped leaves, each a lens that focuses light down into the plant: a carpet that sparkles in a low sun | none |
| `prismheath` | Prism heath | own | heather (*Calluna*) with the Rift's prism bush's colour | low mats that go green to orange to magenta across a slope through the season | honey |
| `starberry` | Starberry | own | a lingonberry (*Vaccinium*) | star-shaped teal berries that ripen violet | **the fruit** |
| `beardtree` | Beard tree | Rift | | read in place, in the wettest groves by the lakes | |
| `cloudfern` | Cloud tree-fern | Rift | | read in place, on the warm lower edge | |
| `araucaria` | Monkey-puzzle | Rift | | read in place, scattered over the forest | |
| `crozier` | Crozier tree fern | S highlands, Dalab's | | a few stands by the lower lakes, strays from Dalab's plantings in the W | the fiddleheads, eaten |

Six of its own of ten. The lakes: the algal and peat lakes (below), the algal domes in their shallows.

### The S rim: the black rim

The high, dry south: wide barrens of rock, snow and ice, with everything that lives there pressed to the ground, dark,
and turned to the sun.

| Key | Name | | Model | What it is | Harvest |
|---|---|---|---|---|---|
| `sunrosette` | Sun rosette | own, new | the dark alpine rosettes, the giant groundsels' rosette | black-violet rosettes 1-2 m across, fleshy and furred, that **turn through the day to face the sun** and drink its heat; in a field they all face one way | none |
| `sailwort` | Sailwort | own, new | none on Earth | thin rust-red membranes 1-2 m tall, each on a stalk that turns it edge-on to the wind; a slope of them swings together in a gust and rattles; wind-pollinated | the membranes, dried, as a parchment |
| `cushionanemone` | Cushion anemone | own | the Rift's anemone stalk as a cushion plant | dense domes of short dark stalks each tipped with a red anemone spray, closing at night | none |
| `lanternlobelia` | Lantern lobelia | own | the Afroalpine giant lobelias (*Lobelia telekii*) | a 3-5 m spike of hairy bracts, glowing faintly blue from inside on cold nights: the barrens' only tall thing | none (the alpine's beacons) |
| `rimroot` | Rimroot | own | a rhubarb (*Rheum nobile*, the glasshouse plant of the Himalaya) | huge veined leaves lit magenta along the veins over a thick root, sheltering under a pale bract tower | **the medicine**: the root, dried, a purgative and a fever remedy |
| `irislichen` | Iris lichen | own, new | map lichens (*Rhizocarpon*) | rock crusts in black, rust and an iridescent violet that shifts with the angle of the light: whole boulder fields wear them | dyes (violet) |
| `snowblood` | Snowblood | own, new | snow algae (*Chlamydomonas nivalis*) | red and violet blooms on the summer snowfields and glacier edges (a ground layer, not a model) | none |
| `groundsel` | Giant groundsel | Rift | | read in place, in the sheltered hollows | |
| `pine` | Peak pine | Rift | | read in place as krummholz at the treeline, flagged by the wind | |
| `silverscrub` | Silver scrub | Rift | | read in place, on the lower edge | |

Seven of its own of ten. The lakes: the glacial and the frozen.

### The W rift highland: the veiled rim

The wet, clouded western head: the great lake under its cliff, Dalab's road, the gorge, and the lowlands close below.
Fog sits in it most days, and its own plants live on the fog. **Dalab brought up the most useful plants it could** [the
owner, 2026-10-23]: timber, cork, spice, remedies and fibre from the SW lowlands and the S highlands, planted along its
road and round its hold, and they have spread from there; so it is a patchwork, the native veils and copper cups among
stands of planted lowland green.

| Key | Name | | Model | What it is | Harvest |
|---|---|---|---|---|---|
| `veilthread` | Veil thread | own, new | old man's beard (*Usnea*) and Spanish moss, as a plant of its own | copper-gold filaments metres long hung from trees, rock and ruins, combing water out of the fog; in a wind the whole slope streams | the threads, as tinder and as stuffing |
| `mistcup` | Mist cup | own, new | the bromeliads' tanks, on the ground | rosettes of stiff cupped leaves that fill with fog-drip into a clear pool at the heart; animals drink from them; the cups glint after a fog | water, in need |
| `mistfrill` | Mist frill | own, new | the frost frill's cousin in the cloud | a shorter, leaning frill 8-15 m whose fins are furred with fine hairs that catch the fog and drip it to the roots; copper-teal, hung with veil thread | the fins' fur, felted |
| `lobelarch` | Lobe larch | own | the Rift's lobe tree, deciduous | a stringy plum bole with pads of lobed leaves that turn violet and gold in autumn and fall | the bark fibre (cordage) |
| `moorsponge` | Moor sponge | own, new | sphagnum, cushion bogs | deep bogs of a copper-green moss that holds the fog's water; it covers the cloud belt's flats and fills the cirques | peat (fuel) |
| `tiercedar` | Tier cedar | SW lowlands, Dalab's | | planted for **timber** up to the cloud belt's foot (`swlowlands` `cedar`) | timber |
| `corkoak` | Cork oak | SW lowlands, Dalab's | | the stripped groves of the basin plain (`corkoak`) | **cork** (floats, seals, insulation) |
| `baylaurel` | Bay laurel | SW lowlands, Dalab's | | hedges round the hold and the plain (`baylaurel`) | spice and remedy |
| `willow` | Veil willow | SW lowlands, Dalab's | | coppiced on the great lake's shore (`willow`) | withies; the bark a fever remedy |
| `coilbark` | Coilbark | S highlands, Dalab's | | shelter belts along the road | bark fibre |
| `spiralaloe` | Spiral aloe | S highlands, Dalab's | | in walled beds by the waystations, on the warm south faces | the gel, for burns and frostbite |
| `stonepine` | Rift stone pine | Rift | | read in place, on the drier slopes over the gorge | pine nuts |
| `fantree` | Fan tree | Rift | | read in place, on the basin plain | |

Five of its own of thirteen, the most borrowed of the three, as the owner asked; its own are still the most of any one
source (the SW lowlands give four, the S highlands two, the Rift two). The borrowed are Dalab's choice, the most useful
plants that would take the cold (the owner); which ones is *proposed* here. They grow thickest along the road and round
Ledge and thin out with distance from them.

### Across the three

- **Kept apart by their shapes first and their colours second**, so the stations read differently even in grey: the N
  rim's columns over mirrors, the S rim's low dark field with one lobelia standing in it, the W's hanging veils in fog.
- **One shared native**: prism heath grows in all three (its colours run to the rim's palette in each: teal-orange in the
  N, rust-magenta in the S, gold-magenta in the W), which ties them together at the ground.
- **The borrowed** fall off with distance: the W takes the lowlands', the N the Rift's cloud forest, the S almost nothing.
- **Counts**: 18 of the rim's own (the earlier draft's 8 kept, 10 new), 15 read in place or introduced.
- **Where the rims meet**: the N rim and the W highland meet at the great lake's head (the glass forest giving way to veils
  as the cloud thickens); the S rim and the W meet over the Outer Wall's crest (carpets running up into fellfield).

### The lakes' colours

| Kind | Where | Colour |
|---|---|---|
| Deep lake | the great lake | dark blue under the cliff, green-blue over the plain's shallows, the cliff's reflection |
| Glacial | the S rim's higher lakes, the W tarns | milky turquoise from rock flour |
| Algal | N rim lakes in the montane forest | the Rift's algal mats gone cold: teal and violet mats on the shallows, stromatolite-like domes |
| Peat | the montane's lower lakes | tea-dark water edged with bog |
| Frozen | the 4,477 m lake, the tarns | ice most of the year, blue under the snow, melting at the edge in summer |

## 4. Landforms

The trough's walls in the strata module's `canyon` recipe (formations stacked up the rim); cirques and their tarns;
moraines damming the lakes; hanging valleys with falls into the trough; the great lake's north cliff; felsenmeer and
patterned ground in the alpine; glaciers and nunataks; the Outer Wall standing over the west.

### Caverns (proposed, 2026-10-23)

The owner asked how feasible a whole system of natural caverns is here, and then how much sedimentary rock a half-airless,
dry planet forms at all. **Little, and not everywhere**: sediment needs air and water to weather, carry and settle it, so on
Krator it gathers only where they pool (the crater, the north-western ocean, the Rift), and the chemistry is closer to
Mars's than Earth's (sandstones, clays, sulphates and salt; little limestone). **But the Rift is one of those basins, and it
has life**: its lakes' algal mats and stromatolites lay down carbonate, and rift basins fill deep (Tanganyika's and Baikal's
each sit on 5 km or more). The rim's walls are that fill and the basement under it, lifted along the rift's shoulders (the
strata plan's `rift` recipe: `core/terrain/STRATA-PLAN.md`). So the caverns are **wide rather than deep**:

| Kind | Where | Fit | What it is |
|---|---|---|---|
| **Lava tubes** | round the vents (on the rim at px 205,1037, 158,1058 and 253,1070; nine on the floor) | excellent | long, level, smooth-walled galleries, kilometres to tens of kilometres (Earth's longest is 65 km): the readiest-made tunnels |
| **Gypsum and salt mazes** | in the evaporite beds of the rift's fill, and by the terminal seas | excellent, the most Krator-like | gypsum dissolves fast and forms vast horizontal mazes (Ukraine's Optymistychna: 260 km and more), salt faster still |
| **Hypogene chambers** | where the vents' sulphur water meets the lake limestones and gypsum | good | sulphuric acid dissolving from below: huge chambers, gypsum blocks and chandeliers, few entrances, warm and wet |
| **The Cave of Crystals** (the owner, 2026-11-03) | the hold's drained older storey (hearths station 2) | the owner's choice | a Naica: selenite beams across the chambers, grown under warm water for ages, now dry, hot and humid (`biomes/CRYSTAL-CAVES-5.1.md`) |
| Deep limestone shafts | where lake limestone is thick enough | weak | Alpine shafts want hundreds of metres of marine limestone a dry world seldom has |
| Ice caves | the high rim's glaciers | where the ice is | meltwater caves and ice-filled shafts |

At 0.75 g a roof carries three-quarters of Earth's load, so chambers span about a third wider. **What it gives the
region**: long, level galleries make a natural transit network, and **the Ancients' tunnels join them** where they can;
the warm, wet hypogene chambers are refuges from the rim's winters and **the Tungangs' holds** (section 6); the
springs at the great lake's foot are the caves' outflow. (How the Rift line's bores meet these caves, and which the Tungangs live in: `openworld/ANCIENT-TUNNELS.md`, 2026-11-03.) The cave kit is `core/terrain`'s caverns (`39-core-cavern.js`, as
Pinnacle Rock's Deep Root and Zeijani's tubes), not a new module.

## 5. Ledge: the hub and the bridge (settled 2026-10-23 unless marked)

- **Ledge is the Ancient arcology**, and the settlement takes its name. It is **where the Ancients' Rift line comes out
  of the Wall** (`LORE.md` §4): the tunnels under the Outer Wall came out above it, and the line ran on to the Ancients'
  Rift settlements, less extensive than those up north but substantial. **Their hub was Cube (Arccube)**, deep in the
  Lizardmen's country (px 448,1237): the owner's most settled point, and **the reward for a player who braves the
  Lizardmen**. Pluton, on the Godthrone's airless flank, is the key to the Ancients' own tunnels up the Godthrone (settled
  2026-10-23: `openworld/ANCIENT-ROADS.md` section 3).
- **The model's Rift places are canon in place and type** (the owner, 2026-11-11: "make the theme and the model's rift places
  canonical ... chimes will not become the span, but the other names are still tentative"), at their 5.1 px: **Nulab** (city,
  443,1359), **Shelf** (arcology, 461,1161), **Loj Twenny** (cavern, 457,1269), **Wildcat** (Fellgang village, 427,1453),
  **Chimes** (ruined arcology, 468,1392), **Cthonos** (ruined arcology, 526,1503), **The Tubes** (cavern, 608,1547), with
  **Arccube** (720,1567) and **Pluton** (743,1328) as already settled. **Names**: Ledge, Arccube and Pluton are settled; every
  other name here is **tentative** (Nulab, Shelf, Loj Twenny, Wildcat, Chimes, Cthonos, The Tubes). **Chimes does not become
  "The Span"**: both names stay, and Dalab's Span (a wrecked arcology) stays where it is.
- **It is a bridge between two levels**: the highland where Dalab's road comes out of the tunnels (the cliff top, ~1.6-2.5
  km) and the basin and lake ~1.3 km below it (after 4.22). Holding it means working both: the road's terminus, stores
  and stables above; the fields, the harbour and the way to the gorge below; the arcology between them, built into the
  cliff, its lifts, inclines and stairs the only way up and down.
- *Proposed*: the Ancient lifts are why Dalab's hold depends on others. The genepriests can mod a porter for the cold
  and the air, but they cannot run the cliff's machinery alone, nor find their way underground (section 6).
- **The point**: Ledge's marker stood on a water cell on 4.21 (px 160,1007). **Moved with 4.22 to px 165,1000**, the
  cliff where the road comes down (1,638 m, ~1,340 m over the lake, +14 °C, Csa): the upper level; the arcology runs down the cliff
  from it to the shore.
- **Theme** (**canon**, the owner, 2026-11-11: "make the theme ... canonical"): a transit hub first (terminus halls, the lift
  shafts, sidings cut into the rock), with Dalab's gene bank as the second story: Dalab came for the line's road and stayed for
  what the arcology's gardens and vaults hold.

## 6. Natives: the Tungangs (settled 2026-10-23; the name proposed)

The owner (2026-10-23): an Ancient worker caste gone feral, **the Rift line's crews**, **Morlock-like, underground-adapted
humans**: "the Zeijani merely adopted the night; these were born to it". **They have holds within the caverns and know them
better than anyone.** "The Shift" is not the name; the name is open (below).

- **What they were.** The caste the Ancients engineered to run the Rift line: the tunnels under the Outer Wall, the lifts
  on Ledge's cliff, the stations in the Rift, the galleries and shafts no surface worker would take.
- **What they are.** Bred for the dark and the deep: **pale to colourless skin**, **very large eyes** with eyeshine that see
  by a glow-cap's light and are **dazzled by daylight** (they come up at night, under cloud, or hooded and goggled),
  keen hearing and smell, **tongue-click echolocation** in the black, long strong fingers for climbing, a compact build
  for low galleries, and the Ancients' engineering for cold, damp and thin air. Not standard humans, not Lizardmen.
- **Where they live.** **Holds within the caverns**: the warm, wet hypogene chambers by the vents above all, where water
  and warmth are, and where they grow what grows in the dark (`kits/crops`' dark-grown crops: pale fungi, the mat,
  alecap, glow mushrooms, which "take a works, not a climate"). Lesser holds in the lava tubes and the gypsum mazes; the
  Ancient tunnels' stations and side galleries as outposts. **They know the caves better than anyone**: no one crosses
  the rim's underground without them.
- **The line.** A thousand years on they still keep stretches of the tunnels clear and tend the lifts they can run; the
  work survives as rite (the old timetable recited, the signal codes as a second voice in lamps and bells: perhaps why
  Chimes is called Chimes). Clans by the old crews; each under a foreman.
- **They and Dalab.** Dalab's road runs through tunnels and caves they keep, and Ledge's lifts answer to them, so Dalab's
  hold rests on an uneasy bargain: guides, trade, medicine, a truce at the lifts, and raids when it breaks. **Dalab's cold
  and altitude mods were learned from their genes** (settled), and they remember being taken.
- **The union** (the owner, 2026-10-23): the crews were **unionised**, and the streak runs deep in them still, but
  after a thousand years in the dark, the bosses gone and their civilization destroyed, **the forms are kept without
  clear memory of what they meant**. Every hold is a **loj** (lodge), and every loj runs its own affairs: **syndicalist
  communes** in the tunnels, bound by **the Book** (the old agreement with the Ancients). A **steward** is elected by show of
  hands at an open **meeting** and can be recalled at the next; a **sekketri** minutes it where one can write. **In practice** many holds slide
  into rule by whoever carries the meeting: a charismatic steward, or a **big man** (*bigun*) nobody votes against.
- **The Book's readings.** Until Dalab came there was **no one to negotiate with**, so for a thousand years the Tungangs
  read the Book instead: every clause has its **readings**, schools of interpretation built over centuries (a Midrash),
  argued at meetings by the **Bookmen**, who read the Book's own letters, and quoted as proverbs; quarrels between holds are won by
  the better reading. Dalab is the first counterparty in a thousand years: the Book woke up, the readers argue whether
  the Labbers are the Gaffers come back, and the **strike**, long a rite, is a weapon again (talks, a work-to-rule at the
  lifts, the lifts stopped and the guides home, a line no one crosses, raids when the talks break down).
- **The President** (the owner, 2026-10-23): over all the lojes stands the union President, **Tpresden**, the nominal
  ruler: mostly an honour, since the lojes run their own affairs, but **granted exceptional powers when the lojes agree
  there is a crisis** (a flood in the line, a war with Dalab), for as long as it lasts.
- **Reading** (the owner, 2026-10-23): to argue the contract this much they **still read English**, however it has slid:
  the Bookmen and secretaries read the Book's old letters and spelling aloud in their own sounds. Many lojes go by an
  **oral tradition of the laws** instead.
- **The Fixers and the numbered lojes** (the owner, 2026-10-23): out of crisis the Tpresden **judges disputes between
  lojes** and **oversees the Fixers** (*fiksaz*), the cadre who keep up the stretches of the Line far from any hold and see
  the whole network maintained. The lojes are **numbered** after the Line's original stations north to south (Ledge's
  lifts are Loj Fower); some numbers are gone with lojes wiped out by disaster, and new lojes founded as the Tungangs
  spread into new caverns took the next number free, so the numbers no longer run north to south.
- **The lost east** (the owner, 2026-10-23): Tungangs, or the crews they came from, once lived **throughout the Rift**.
  Those east of Chimes were wiped out in **tunnel wars after the Lizardmen arrived**; many Fellgangs descend from those
  who fled. A **lost loj** in the east is rumoured to have held out, with no official contact in over five hundred years.
  **The truth** (the owner, 2026-10-23; known to no one outside it): it is **Loj Nahn**, the number no one says. It retreated
  into **the upper levels of Arccube** and sealed them; about **a thousand** people farm its upper terraces, surrounded by
  Lizardmen, and lower stealthy parties at night for wood and what else the arcology cannot give. The Lizardmen attack any
  they meet but lack the means or the will to press further. Five centuries on open terraces have changed them, and the
  hold is the human heart of the Arccube reward (the owner, 2026-10-23).
- **The tales of the Cataclysm** (the owner, 2026-10-23): a great war because the Gaffers got too greedy; **the Great
  Strike**, when the crews went underground and rode out the catastrophes; and, of the Lizardmen's coming, wailing and
  screaming in Arccube, then the Lizardmen, and no Ancient bodies. What that means is the author's secret (`LORE.md`
  §6.20): never spelled out to the player.
  Tungang and Fellgang agree: the only thing worse than a Labber is a Lizard.
- **Skab** is the general curse (traitor, bastard, arsehole), its first meaning long forgotten.
- **The tongue** (the owner, 2026-10-23): **Northern English** (Yorkshire, Lancashire, the north-east's pit country),
  worn down over a thousand years in the dark until a modern speaker cannot follow it: *the* cut to *t'* and fused on,
  *thou* kept as *tha*, *owt*, *nowt*, *summat*, *nobbut*, *gan* for *go*, *while* for *until*, *were* for *was*, dropped
  *h* and glottal stops, the union's words fossilised in it (*brother* > *broo*, *steward* > *stoord*, *meeting* >
  *meetin*, *strike* > *strak*). *We're not going to work until the steward says so* > *us'll nobbut gan t'wark while
  t'stoord sez* > worn: **"Usl nobga twak wilstood sez."** For `lore/tongues-of-krator.html` when they are named.
- **The name** (the owner, 2026-10-23: something evolved out of *tunnel gangs*). *Proposed*: **Tungangs** (one
  **Tungang**): *the tunnel gangs* > *t'tunnel gangs* > *tunnlgangs* > **tungangs**, in their own worn Northern English.
  Others' names: Dalab's low tongue **Dadeep**; the lowlanders' **greys** or **lamp-eyes**.
- **Two branches, perhaps divergent** (the owner, 2026-10-23): the **underground** branch in the tunnels and caverns,
  and **wilder, highland-dwelling** branches on the rim. *Proposed*:

  | | The Tungangs (underground) | The Fellgangs (highland) |
  |---|---|---|
  | Name | *tunnel gangs* | *fell gangs*: *fell* is Northern English for the high moorland, *the fell gangs* > **Fellgangs** |
  | Where | the holds in the warm caverns, the tunnel stations | the high valleys and fells of the rim, in the lee of the caves' mouths |
  | Body | the Ancients' design kept: colourless, huge-eyed, dazzled by day | diverged over centuries in the light: darker skin, smaller pupils, still big-lunged and cold-hardy; can bear the day |
  | Living | dark-grown crops, the line's upkeep, guiding, trade at the lifts | herding and hunting the rim's fauna, a little highland farming, raiding |
  | The union | the branches, the stewards, the rulebook, the meeting | **lapsed or broken away**: *wildcat* bands that answer to no steward, or keep a rulebook of their own |
  | Tongue | the worn Northern English above | further gone: a **fell speech** the Tungangs follow with effort |
  | To Dalab | the bargain at the lifts and in the tunnels | the raids on the supply trains' surface stretches |
  | To each other | the Fellgangs are lapsed members at best, *scabs* at worst | the Tungangs are the stewards who sold the fells to Dalab |

### Two more Fellgang villages (**chosen**, 2026-11-11)

**Both chosen by the owner** (2026-11-11, on the two proposals below: "that sounds good for both"), to be built in that order: the Fowlers
as station 8 (`--station fowlers`), then the Ice-cutters as station 9 (`--station icecut`). Their names stay placeholders (section 12, question 6).

The owner (2026-11-11): "propose me 2 more scenic sites for fellgang villages with a unique theme". Surveyed on scale model 5.1
(heights, `wl`, the classes, `p` rain, the `tm`/`tw`/`tc`/`tl` temperatures, `basins.json`, `rivers.json`, `vents.json`,
`tubes.json`; the polygons and settlements from `model/src/51-region-store.js` and `60-settlements.js`). The search ran every
other pixel inside the `Fellgangs` polygon, at least 14 px from every named place and 30 px from Wildcat, and ranked the cells by
the drop within 10 km, by lake water within 6 km and by relief over 30 km. Both sites sit inside `Fellgangs` and a rim polygon,
on lakes the plan's lake table already lists ("The lakes on 5.1"). Names are placeholders.

| | **A. The wall-climbers** (*the Fowlers*) | **B. The ice-cutters** (*the Coldmen*) |
|---|---|---|
| 5.1 px | the north shore of the N rim's 1,887 m lake: village **571,1397** (the lake 568,1403) | the north shore of the S rim's 3,570 m lake: village **470,1521** (the lake 469,1530) |
| Why here | the rim's tallest wall over water: the ground rises from the lake at 1,887 m to **5,627 m within 16 km** north, a south-facing wall of 3.7 km, the lake 624 km² and 853 m deep under it | the highest lake in `Fellgangs` that freezes hard (coldest month -12 °C, nights to -20) under a dry, clear sky, with the Rift's floor **4.2 km below within 20 km** (-397 m) |
| Ground and air | a shore bench at ~2,350 m; Csa, ~820 mm, mean +11 °C (warmest month 22, coldest 0); `rift rim N` | the shore at ~3,830 m; Dsc, ~630 mm, mean +1 °C (14 / -12); `rift rim S` |
| The theme | **Fowlers**, as St Kilda's and the Himalaya's honey hunters: the village lives off the wall. Its people climb it on ropes, pegs and ladders left in place for generations, taking the eggs, the young and the nests of the rim's cliff-nesting flyers, wall honey and the wall's herbs. Each family "owns" a stretch of the face by the rope it keeps there, and a rope is inherited like land | **Ice-cutters**: the village lives off the lake's winter. It saws the ice into blocks, packs them in sawdust and snow in ice houses dug into the moraine, and carries them down the south wall by night to the hot floor (Cthonos' country, and the Rift floor's towns at 1.9 atm and +25 °C), where cold is the dearest thing there is. Their ice buys grain, cloth and metal |
| How it shapes the village | stacked stone houses on the bench at the wall's foot; rope walks and peg-stores; the young are climbers before they are herders; the dead are laid on ledges of the wall; the Fellgang build (big-lunged, cold-hardy, the Tungangs' long climbing fingers) is the trade's own | low turf-and-stone houses on the lee shore; ice houses like barrows; sledges and the ice road down; a winter calendar (the ice's thickness read like a harvest); a year's work in eight weeks, then the long carry |
| What they keep or believe | the wall is the village's oldest member: **a rope is a vote** (their lapsed union's form, kept as the right to climb), and a family that loses its rope loses its say | **the Cold is owed**: what the lake gives in winter must be carried down and sold, never hoarded, or the lake will not freeze again; they keep a reckoning of every block like a ledger (the Book's habit of accounts, without the Book) |
| Its scenic draw | a village at the foot of a 3.7 km wall over a deep warm lake: climbers on the face at dawn, the snow line and the cloud on the wall's upper half, the falls of the rim beyond (station 2's hanging valley 26 px west) | a frozen high lake under a black, clear sky: the cut lanes in the ice, blue blocks stacked by the ice houses, the trough's haze 4 km below, the night carry's lanterns going down the wall |
| How it reaches the line, Ledge or the caves | over the N rim's shelf by the Hearth field (41 px, ~80 km, to the Hearth hold at 525,1400: the Tungangs' warm caverns trade for eggs and honey); Ledge is ~290 km by the rim's lake chain | down the south wall to Cthonos (61 px, ~120 km): the line's country below; Wildcat ~160 km west along the S rim (rival Fellgangs: the ice road is what they raid) |
| Station | **near station 2** (the lakes of the north rim, 545,1400): a new station `-wall` on this kit, or a second view down the trough from station 2's lip; it needs the wall drawn as rock (`KSTACKS.contour`, the `rift` strata) and the flyers (`kits/fauna`) | **a new station** (`-icecut`): none of this kit's stations is within 70 px. Cheap: station 3's frozen lake (`WATER.ice`, the drifts fixed 2026-11-09) and station 7's winter snow on a new site, with the ice lanes, the stacks and the ice houses as records |

**Distinct from the others**: Wildcat is a raiders' band that answers to no steward; the Tungangs' holds are caverns, dark crops
and the line's upkeep; Dalab's outposts are the genepriests' farms and stations. The Fowlers live **up a wall in daylight**, the
Ice-cutters **on a frozen lake and its trade**. Both keep a form of the union as their own custom (the rope's vote, the ledger),
which fits the Fellgangs' "lapsed or broken away" row above.

**Pick first: A, the Fowlers.** It is the more striking sight (a 3.7 km wall over a deep lake). It sits next to station 2 and the
Hearth field, so it shares their kit, flora and sky, and it gives the rim its first vertical settlement. B is cheaper to build (it
reuses the frozen lake and the winter snow almost whole), so it is the better choice if a quick station is wanted.

## 7. Crops (`kits/crops`)

A `riftrim` entry (`atm: 1`): zones `shore` (warmth [2, 3], arid [2, 3]), `montane` (warmth [1, 1], arid [1, 3]),
`alpine` (warmth [0, 0], arid [1, 2], atm 0), `lake` (wet). **The three**: **starberry** (fruit), **bell fir seed**
(the staple, a nut-grain gathered from the closed bells in winter), **rimroot** (the medicine). By rim: the N gives the
fruit and the staple, the S the medicine; the W's basin plain grows Dalab's crops and the lowlands' (`kits/crops`,
`CROPS.forBiome`). Dalab's own crops grow in
the arcology's gardens (`kits/crops` records with `home: ['dalab']` that fit the `shore` zone).

## 8. Fauna

As strange as the Rift's, but temperate: to `kits/fauna` later, the rim's own big animals among them (the owner's to
name). The page's first stations carry birds, insects over the lakes and grazing herds at distance.

## 9. Stations

1. **Ledge and the great lake** (W; `dist/riftrim.html`): the arcology on both levels, the cliff top where the road comes out
   of the tunnels and the lifts and inclines down the cliff, the lake under the cliff, the basin plain beyond it with Dalab's fields, the gorge's head at the
   far side, the montane forest climbing the walls round it.
2. **The lakes of the north rim** (N; `-lakes`): the 1,120 km² lake at 3,271 m (px 261,1060) in frost-frill and bell-fir
   forest, glass-cane groves and algal shallows, a chain of smaller lakes stepping down to it, a hanging valley's fall into the trough.
3. **The cold lake** (S; `-ice`): the S rim's lake at 4,477 m (px 433,1314), frozen most of the year, the alpine with
   lantern lobelias and cushion anemones, glaciers above, the Rift's floor far below.
4. **The gorge** (W; `-gorge`, optional): the outlet through the ridge, rapids and falls, Chimes' ruin at its foot, the
   Shift's bells in the dusk.
5. **The crossing** (W into S; `-pass`): the Outer Wall's crest on Dalab's road, the Ancient tunnel's portal and the waystation
   before it, the Tungangs' signal lamps in the tunnel's mouth, the road winding over the high tundra under a near-airless
   sky.
6. **The black barrens** (S; `-barrens`): a high plateau of the S rim at ~5 km, sun rosettes all facing one way, a slope of
   sailwort swinging in the wind, iris lichen on the boulders, snowblood on the summer snow, one lantern lobelia standing
   over it all at dusk, the Rift's trough falling away at the edge.
7. **The Hearth field** (N; `-hearths`; built 2026-11-09): the Hearths' showcase on the N rim's shelf, 5.1 px 525,1400 (below).
8. **The Fowlers** (N; `-fowlers`; chosen 2026-11-11): a Fellgang village of fowlers on the bench under the N rim's 3.7 km wall, 5.1 px 571,1397 (section 6).
9. **The Ice-cutters** (S; `-icecut`; chosen 2026-11-11): a Fellgang village of ice-cutters on the S rim's 3,570 m lake, 5.1 px 470,1521 (section 6).

## 10. Textures

In the library: `ground.tundra`, `ground.turf.polygon`, `ground.snow011`, `ground.snow015`, `ice.glacier`, `ice.clear`,
`ground.lichen.crust`, `ground.sphagnum`, the Rift kit's own sets. To source or generate (prompts first), by rim:
the N rim's frost-frill bark and translucent fins, bell-fir needle bells, glass cane, lenswort, prism heath (three
seasons), starberries; the S rim's sun rosette (black-violet fur), sailwort membrane, cushion anemone, lantern lobelia,
rimroot, iris lichen on rock (black, rust, iridescent violet), snowblood on snow (red, violet); the W highland's veil
thread, mist cups, mist frill fins, lobe larch leaves (summer and autumn), moor sponge (`ground.sphagnum` may serve); the
algal lake shallows. The borrowed species bring their kits' sets. **The prompts**: `core/materials/PROMPTS-NEEDED.md`
section 13 (2026-10-23), with the library sets each rim reuses.

## 11. Order of work

- **R0.** The owner answers section 12; texture prompts; the station sites from the model.
- **R1.** The kit on the biome core: the fields (height, rain, the lakes from the model's water, aspect), the zones.
- **R2.** Station 1 (after the model's 4.22 basin and gorge): the great lake, its cliff, the basin plain and the arcology's
  site (the arcology's own build is a settlement's work).
- **R3.** The new species; the Rift's read in place.
- **R4.** The lakes' colours and kinds; stations 2 and 3.
- **R5.** Stations 4 and 5, the gorge and the crossing (the tunnel mouth as a carve patch).
- **R6.** The crops; `verify.py --assert`; `PORT.md`; the gallery; the Rift kit's highland switched to read this kit.

## 12. Questions for the owner

1. **The Fellgangs** (the name proposed, section 6; *Tungangs* is settled, from the owner's "tunnel gangs"): how far the
   branches have diverged and how many they are. Their speech is on `lore/tongues-of-krator.html`, the Tungang tab.
2. **Ledge's point**: done, moved with the model's 4.22 basin to the cliff (px 165,1000).
3. **The Rift's ruins**: Arccube is the hub (settled); **places settled 2026-11-11** (the owner: the model's Rift places are
   canon in place and type, section 5): Chimes, Cthonos and The Tubes stay where the model has them. Their **names stay
   tentative** (Pluton is settled: the key to the Godthrone's tunnels).
4. **Ledge's own build** (the arcology on both levels, Dalab's quarter, the Tungangs at the lifts) is a settlement plan of its
   own (`settlements/ledge/`), after this kit's station 1.
5. ~~**Chimes may be "The Span"**~~ **Closed 2026-11-11** (the owner: "chimes will not become the span"): both names stay;
   Chimes stays at the gorge (468,1392), Dalab's Span (the wrecked arcology, px 282,680 old, `LORE.md` §6.1) stays where it is.
6. **The model's Rift settlements**: **places and types closed 2026-11-11** (the owner: "make ... the model's rift places
   canonical"; section 5 lists them). **Names still open**: every name but Ledge, Arccube and Pluton is tentative. The owner
   asked for two more Fellgang villages (proposed, section 6, "Two more Fellgang villages").
7. **The three rims' flora** (section 3, proposed 2026-10-23, the owner's "great proposal"): settled that Dalab brought up
   the most useful plants it could; which ones (the W highland's list) is proposed.
8. ~~The model's polygon~~: split into `rift rim N` and `rift rim S` on the model (the owner, 2026-10-23; done).

### The answers this build took (2026-11-03, the cloud build session; **for the owner to review**)

The owner has not answered section 12. The build took the plan's recommended answer to each, or the most conservative one where the
plan recommends none. None of them is hard to reverse: each is a name or a site in one fragment.

| # | Question | Taken | Where it shows | To change it |
|---|---|---|---|---|
| 1 | The Fellgangs' divergence and numbers | **Neither is drawn.** The name *Fellgangs* is kept (the model already has a `Fellgangs` polygon). No people are placed on any page (no settlement or crowd is this kit's) | nothing on the pages; the plan's section 6 table stands as proposed | a Fellgang camp would be a `core/camp` record, later |
| 2 | Ledge's point | done: 437,1330 on 5.1 (= 165,1000 old) | station 1 | |
| 3 | Chimes, Cthonos, The Tubes | **Kept where 5.1 puts them** (the places made canon by the owner, 2026-11-11; the names tentative) (468,1392; 526,1503; 608,1547). Only Chimes is near a station (4, the gorge), and it is drawn as **a ruin's site** only (a terrace cut in the gorge's shoulder, tagged `Chimes (ruin, site only)`), no architecture | station 4 | the tag and the terrace's position in `stations/gorge/44w-host-land.js` |
| 4 | Ledge's own build | **A settlement's, not this kit's** (as the plan says). Station 1 draws **the site only**: the cliff with its Ancient-cut benches (cut into the ground's profile below Ledge's site; `KSTACKS.contour` bodies and `KCARVE` mouths for the portal and the lift slots are owed: "Core adoption"). No buildings, no Dalab quarter, no lifts | station 1 | `settlements/ledge/` when it is planned |
| 5 | Chimes or "The Span" | **Keep both names; rename and move nothing** (the owner confirmed it, 2026-11-11: "chimes will not become the span"): the gorge station calls it Chimes, as the model does; Dalab's Span stays at 282,680 old | station 4's labels | |
| 6 | The model's Rift settlements | **Out of this kit's scope**: no change to the model (the owner, 2026-11-11: the places and types are canon as the model has them; the names tentative) | | |
| 7 | The three rims' flora | **Taken as proposed** (section 3), all three lists, the W highland's borrowed six included (tier cedar, cork oak, bay laurel, veil willow, coilbark, spiral aloe) | every station | the station's `species` and `kin` lists |
| 8 | The polygon | done | | |

**Other choices made in the build** (the plan left them open; listed here so nothing is decided silently):

- **The Hearths' stations were not built in this turn** (station 7, `hearths`, was built 2026-11-09: "Station 7, the Hearth field"). `biomes/hearths/PLAN.md` hosts three stations here (`hearths`, `hearths-hold`,
  `hearths-walk`); oidong built its own in pair 6. They need the Hearths' species read in place, KTHERM's bake and `KKARST`'s hypogene
  mode on the hold: a turn of their own on this kit, after the owner's look pass on the rims.
- **Ledge's cliff springs' cave (karst site 6)** is not laid out this turn (`KKARST` owed: "Core adoption").
- **The crossing's air**: 0.58 atm at the portal (the sky's air pressure). Nothing grows above ~6.5 km: the S rim's fellfield runs out by
  height, as section 3 implies, and the page's south edge (~5.7 km) is the high tundra.
- **The great lake's colour**: the deep-lake gradient (dark blue under the cliff, green-blue over the plain's shallows). The other
  kinds (glacial, algal, peat, frozen) are on stations 2, 3 and 6 as section 3's table gives them.
- **Dalab's fields on the basin plain** are a `farm` field (strips of `ground.terrace.field` and grain tufts), with bay-laurel hedges round
  them; not a settlement's fields, and not yet from `kits/crops` records.
- **Fauna**: none (section 8: `kits/fauna`, later).

## Core adoption (the build, 2026-11-03; the cloud session `claude/riftrim-cloud`)

**Started from** `biomes/ebadlands` (the nearest finished multi-station kit on the current core, rebuilt in pair 5): its host fragments
(the stage, the variants, the far field, the sky, the air, the take) forked and renamed; the land rewritten as a library of lakes
(`src/44v-host-landlib.js`, `rimLand()`); the species, trees and floor written new (`50`, `55`, `60`); the kin grower made generic
(`87-host-kin.js` grows the rows each station's `LAND.kin` lists). Station 1 is the kit's own page (`build.py` with no `--station`).

**The three rims kept apart** by shape first and colour second, as section 3 asks: the N rim's columns (frost frills 25-40 m, translucent
back-lit fins; bell firs' hung bells) over a teal algal lake; the S rim's low dark field (sun rosettes all tilted to the sun, sailwort
turned edge-on to one wind, cushion anemones, black boulders crusted in iris lichen, snowblood on the snow) with one lantern lobelia
standing in it; the W rim's hung veils in fog (mist frills leaning and dripping, veil thread on frills and boulders, mist cups, moor
sponge) among Dalab's planted lowland stands and fields. Each page sets the rim (`LAND.rim`: `RRIM.biome`), its ground palette (45) and
its ground layers (five of twelve: `LAND.groundLayers`).

| Universal set (`BACKPORT.md` sections 1 and 5) | Taken | How |
|---|---|---|
| `BIO.INDEX_ITEMS`, `BIO.LOD.merge/minTris/fade/cull` | yes | inherited (45; `?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0`) |
| Octahedral impostors on the variants' far level | yes | 86 (`VARIANTS.IMP`, `?diet=0`); `BIO.impostorLook` gain 2.4 (ebadlands'): **to set at the GPU look pass** |
| Cards on their geometry (`check_cells.py --fix`) | yes, 0 faults | the lobe larch's crown sprigs held by their stems (summer row, autumn row), the fog drip's cell tightened |
| Hanging cards as one strand (`"base": "top"`) | yes | veil thread, fog drip, the bell fir's bells |
| `BIO.flareJoin` on limb joints | yes | the bell fir's forks, the lobe larch's limbs and sprays (the frills have fins, not limbs) |
| `BIO.fung`, `BIO.bamboo` | not used | no fungoid part; the glass cane is its own jointed item, not a bamboo |
| Shared sky, height fog, rain cover, lightning, `bindWeather` | yes | inherited; the sky's site is each station's (old-canvas px: the sky model's frame), its air pressure the station's |
| Snow that lies (`snowCover` with lee drifts) | yes | every station's `LAND.snowLine`; `frozen` on the S stations |
| Water: tall falls (`plungeR`, `footK`, `spray: 'drop'`), no breakers on still water, W4 per-lake colour | yes | five lake kinds (89w); the hanging valley's fall (station 2), the gorge's three falls (station 4); `surf:false, breakers:false` on every still |
| The plume and foam fix (core/water) | yes | rides with core/water: nothing kit-side |
| `WATER.mirrorSwitch`, off at page load | yes | on the largest still (99): the great lake, the north rim's lake, the cold lake |
| `KSHADOW`, toggleable and **off by default** | yes | attached in 89z and turned off at load (`window._shadow.off()`); `?shadow=1` or the panel's "shadows" select turns it on. **Core has no switch of its own yet**: this uses the handle's `off()`/`on()` |
| `KSTRATA` | yes | the `rift` recipe (core/terrain/35, written for this kit) on Ledge's cliff, the lakes' rim, the gorge and the barrens' edge; `rift-volcanic` at the cold lake; `rift-basement` on the Outer Wall at the crossing |
| `KGROUND`, `KHORIZON`, `KFAR` | yes | the twelve rim layers on documented masks (45 `GLW`); the far field per station (`LAND.far`) |
| `KHOOK.warp` where Ancient structures are | not applicable | no Ancient structure is drawn: Ledge, Chimes and the portal are sites only (section 12, answers 3 and 4) |
| Confluences | not taken | no two rivers join on any page (the tarns' stream enters a lake) |
| Kin (the owner's option A, the Rift's station 3) | yes, as lineage | each own species carries `lineage` (the Rift species it descends from) and `RRIM.make`/`RRIM.grow` are exported, so `BIO.kin('riftrim.frostfrill', ...)` works for the Rift's sky islands; the borrowed species are read in place with `BIO.kin` (87) |

**Not taken this turn, owed** (each listed in `KNOWN_ISSUES.md`):

- **KCARVE cave mouths and `KSTACKS.contour` on Ledge's cliff; `KKARST` and `KCAVERN` for its cliff springs (karst site 6).** The cliff's
  Ancient-cut benches are cut into the ground (a stepped profile within 650 m of Ledge's site), not contour bodies; no mouth is carved (the
  ground's 11.8 m cells need a ~40 m patch, and the springs' cave wants a page that goes inside it). `build.py` lists none of those
  fragments until they are drawn.
- **The crossing's portal** is a cut face with the Tungangs' lamps in a row before it (the lobelia's glow item), not a carved mouth; the
  waystation is a level apron (its build is a settlement's).
- **The Hearths' stations** (`hearths`, `hearths-hold`, `hearths-walk`: `biomes/hearths/PLAN.md` section 11): `hearths` is built (2026-11-09, below);
  the hold stays on `biomes/hearths`' own pages, `hearths-walk` is owed.
- **The tier cedar** (the SW lowlands', the W list's timber) is not grown yet: its builder's pads float off its limbs past the attach
  audit's limit (`KNOWN_ISSUES.md`); the other seven borrowed W species are.
- **`PORT.md`** is written by `tools/audit_port.py`; the Godot twin is not started.

## Station 7, the Hearth field (`python3 build.py --station hearths`, `dist/riftrim-hearths.html`; 2026-11-09)

`biomes/hearths/PLAN.md` section 11 item 1 on this kit's stage: the showcase vent (5.1 px 525,1400; 3,737 m, 1.00 atm, Dsc, +2 degC; night low -17) on
the N rim's shelf, set in winter, opening at dusk (`LAND.hour` 16.9: the fans half open as the sun goes; `#hour=12` for the shut silver field).

- **The heat** is one `KTHERM` (core/terrain 47, slotted `44t` by the station's `station.json` "core", so the land's fields read it): four point vents on
  a WSW-ENE fissure line (the Old Hearth 96 degC reaching 300 m; the west 94/230; the east 92/170; the young 90/115) and the fissure itself as a line
  vent (15 degC, 20 m), over a winter soil of -4 degC, baked once on a 4 m lattice. Every placement, the paint, the KGROUND layers, the snow and the
  checks read that bake.
- **The field** is `biomes/hearths` read in place (`src/50`, `src/55` in their own registry: `station.json` "kin"): one `HEARTH.layout` per disc in the
  **rim** dress (broad fans, few, on 4-11 m stalks), q x .5 for the budget, the dead rings at 1.1-2.1 disc radii (the heat has wandered). About 1,400
  hearth trees, 14,000 fans, 1,400 ember mats, 7,700 coal moss, 2,000 stokers, 1,200 tallow beads; the dead stalks a few hundred.
- **The engine** is `HEARTH.work` on the page's sun, the eclipse (`ATMOS.sunHidden`) and the cloud, written each frame to `BIO.breathState('hearths')`
  (core/biome 35, the fold); the stalks lean to the sun's mean bearing (core/biome 39).
- **The ground**: the land's `geo` (the heat / 100, `44v`) paints the warm disc the coal moss's black-brown, a sinter apron round each vent, sulphur on
  the lips (45's painter, at the bake's resolution through `LAND.geoAt`); the KGROUND layers fade off from 7 degC (45). The winter's snow is the lying
  snow (`snowBase` .82, `frozen`) made bare over 0 degC by `ATMOS.snowBare(THERM.snowMask(...))` (89b); the bare mask is one more texture unit on the
  ground, so this station shows four ground layers, not five.
- **The pools**: three `WATER.spring` (core/water/geyser 52, 52b) on the three larger vents' aprons (the Old Hearth's boiling, the west's sulphur, the
  east's iron mats), in `waterH` through the land's `pools` (44v) so nothing roots in them; the floor's shallows plants keep out of them (60: `geo`).
- **The steam**: `ATMOS.smokeGroups` (core/atmos fx): the fumaroles and pools steady, a thin column over each disc thickening with the night's work.
- **The rest of the page**: the frozen lake (`kind:'frozen'`) in the glass forest to the north-west; the forest kept off the warm ground and back
  450-1,000 m from the fissure (`LAND.keep`, 45's mask: an open wind-scoured shelf round the field); the shelf's shoulder falling south toward the
  trough, the far field snowy over 3.35 km (`farBands`).
- **Hazards** (core/tags records before anything is drawn): each vent's heat (radiant), each pool's scald.
- **Checks** (`LAND.checks` / `LAND.negatives`, 99): the field placed; hearth trees on 25-60 degC only; the ember mat on 60-95 only; the glass forest
  off ground over 6 degC; three pools each over its vent; the engine open at night, shut at noon, open in an eclipse; each with a broken input that fails.
- **Owed**: `hearths-walk` (the western vent's walked field, PLAN.md section 11 item 4); the hold's pages moving here as stations; the field and the hold
  on one frame of coordinates; the fin-owl and the hearth animals (`kits/fauna`); `ATMOS.shimmer` over the warm ground (a post pass: oidong's reason).

## Stations 8 and 9, the Fellgang villages (`--station fowlers`, `--station icecut`; 2026-11-11)

Section 6, "Two more Fellgang villages", chosen by the owner 2026-11-11. Both villages are **`core/hamlet` villages** (`KHAMLET.village`, with
`core/city`'s `KCITY.prim` read in place: each station's `station.json` "core") on a **Fellgang culture row** of their own
(`stations/fowlers/84f-host-fellgang.js`, which the Ice-cutters read in place). core/hamlet has no fowling or ice-cutting focus, so the Fowlers
take the `ranch` slot (rope house, egg store, pens) and the Ice-cutters the `quarry` slot (ice houses, sledge shed). **No building kit has the
Fellgangs**: 84f draws stand-ins from each record's box: drystone walls under a gabled turf roof with a door to the lane, round stone stores, open
sheds, drystone pens, and a turf barrow over a stone door for an ice house. Each is seated on its footprint (its floor at the highest corner,
its walls down to the lowest) and merged into three meshes. Every record is a core/tags volume before it is drawn, and the flora keeps off the
village (`LAND.keep`).

- **Station 8, the Fowlers** (5.1 px 571,1397): the lake at 1,887 m runs past the map's south edge (`LAND.farWater`). The village stands on a
  shore bench at about 1,960-2,020 m, and the wall rises behind it: 1.5 km in under a kilometre, then on in ledged steps (a flat every
  ~170 m of height) to about 4.9 km at the page's edge. Each household has its own rope, pegged up the face 180-440 m from the wall's foot
  with a ladder up its first 18 m. Nest ledges lie where the face flattens beside the ropes, each with a few nests and eggs; the flyers are
  `kits/fauna`'s, owed. The page opens in the morning (`LAND.hour` 9.3: on this day the giant hides the sun until about 8.5).
- **Station 9, the Ice-cutters** (5.1 px 470,1521): the lake at 3,570 m is frozen, drawn as station 3's `WATER.ice` with the 2026-11-09
  drifts. The page is set in winter (station 7's lying snow: `snowBase` .8, `frozen`) and opens at dusk (`LAND.hour` 17.6, the sun 4 degrees up). The village
  stands on a moraine shelf over the north shore, with seven cut lanes of open water off it. Blocks are stacked at each lane's head, with
  sledges beside them. The ice road climbs north-east over the moraine to the shelf's edge, with a lantern post every 60 m, lit by night.
  Hazards: each cut lane is a `drown` record.
- **Checks** (`LAND.checks` / `LAND.negatives`), each with a broken input that must fail. The Fowlers: the village placed with its meeting
  hall, rope house and egg store; every building dry and off the wall; the ropes up the face; no tree in a building. The Ice-cutters: the
  village with its meeting hall, ice houses and sledge shed; every building dry; the lanes on the lake; the stacks on the shore.
- **Owed**: a Fellgang building kit (the stand-ins are boxes with roofs); the cliff-nesting flyers and the climbers (`kits/fauna`, people);
  the Fowlers' wall as rock bodies (`KSTACKS.contour`) rather than the ground's 12 m cells.

## Core changes to take (reconciled 2026-10-27)

Since this plan was written, core gained the cards on their geometry, hanging strands, confluences, tall falls, KLAVA,
`KSTACKS.contour`, cave mouths and snow that lies (`BACKPORT.md` section 5, with each module's "Adopting it" lines). Every
turn takes the universal ones (the card fit by `check_cells.py --fix`, strands with a top base). For this kit:

- **Confluences** and **tall falls** for the highland lakes' outlets and the gorge of 4.22.
- `KSTACKS.contour` and **KCARVE cave mouths** on Ledge's cliffs and the rims' faces.
- Snow that lies on the rims' alpine bands.
- **The Rift's station 3 families are cousins of this kit's species** (the owner chose option A, `biomes/rift/PLAN-STATIONS.md` section 5): when this kit is built, its rim species are written so the Rift's sky-island lineages read as their kin.
