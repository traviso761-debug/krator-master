# The NE Outer Wall: the plan (build plan, 2026-11-09)

The NE Outer Wall (`rmvymakpc0pft`, "ne outer wall") is the stretch of the Outer Wall between Korona and Spider Lake, in the
north-east of map 5.1. Gemini's note calls it the **Glass-Skarn Bastion**: an impact-rim wall cooked by Korona's heat, cut by
the Arachnoids' dikes and sheared by the Outland Gate fault, with three warm tarns in walled cauldrons. On the model it is
mostly a very high, airless wall. Its life is in the north-western lowlands and in the three cauldrons.

Gemini's sketch (2026-11-02) gave the names, the cauldrons and the four-way geology. This plan keeps those, corrects the
heights and the air from the model, and adds the people, the hazards, the stations and the core adoption.

**Status (2026-11-10): every station of section 7 is built** on the branch `claude/neouterwall-s1` (a cloud session), each its own page:

| Station | Command | Page | What its folder replaces |
|---|---|---|---|
| 1 Vitreous Hollow | `python3 build.py` | `dist/neouterwall.html` | (the default record and site, `src/44r`, `src/44s`) |
| 2 Garnet-Mirror Cauldron | `--station garnet` | `dist/neouterwall-garnet.html` | the record (`44r`) |
| 3 Epidote Badlands | `--station badlands` | `dist/neouterwall-badlands.html` | the record and the site (`44r`, `44s`) |
| 4 Gate Shoulder | `--station shoulder` | `dist/neouterwall-shoulder.html` | the record and the site |
| 5 Epidote-Steam Tarn | `--station steam` | `dist/neouterwall-steam.html` | the record (a cauldron with the cave's inner mouth) |
| 5a The Portal | `--station portal` | `dist/neouterwall-portal.html` | the record and the site (the outside of the portal only) |
| 5b The Epidote Cave (the Marble Hall) | `--station cave` | `dist/neouterwall-cave.html` | everything: a cave page, its own frame (`build_cave.py`, `stations/cave/`) |

Forked from the W outer wall's station 1 frame (itself from `biomes/nwouterwall`), the flora the NW outer wall's read in place plus the
cauldrons' own tree fern and reed. Every page is checked with `verify.py --assert --all-views` in software GL only: **the real-GPU verify
is owed on the owner's machine** (`KNOWN_ISSUES.md`). Section 8 says what they take from core; section 7 what each draws. The Epidote
Cave is walked at one place, its Marble Hall (5b); its other 70 km are the scale model's record only.
The owner wants a kit here (`HANDOFF-REBUILD.md`: one of the three new-north kits allowed to go ahead). It goes in the
rebuild's queue after the frozen integration pass. All px below are on the 5.1 canvas (1821 x 1723, 2 km/px).

## 1. What the map carves (Gemini, map 5.1)

The region is written in `tools/scale-model/smodel/nw_expansion.py` (section 6, "ne outer wall"; the note at line ~2642).
The numbers were read from the model (`smodel.page`, 2026-11-09, branch `gemini/scale-model-5.1-r3`).

- **Size:** 27,375 cells of 2 km, about **109,500 km²** (the note says 101,372 km²; the difference is the cell rule and
  the polygon's overlaps, below). Between 5.1 px x 1089-1456 and y 253-399.
- **Heights:** p5/p25/p50/p75/p95 = **2,761 / 4,867 / 6,993 / 10,704 / 13,101 m**. Highest 14,015 m at px 1386,376; lowest
  1,013 m at px 1091,339 (the western tip, toward the Arachnoids).

  | Band | Cells | Share |
  |---|---|---|
  | under 2,500 m | 720 | 3% |
  | 2,500-3,500 m | 2,308 | 8% |
  | 3,500-5,500 m | 5,609 | 20% |
  | 5,500-9,000 m | 9,177 | 34% |
  | over 9,000 m (airless) | 9,561 | 35% |

  **The sketch was wrong on height.** It put the rim at 3,600-5,800 m. The model's wall is a true Outer Wall: its median is
  7 km and a third of it is airless crest.
- **The lowlands:** ground under 4.5 km makes four pockets.

  | Pocket | Cells | Centre | Lowest / median | Rain | Classes |
  |---|---|---|---|---|---|
  | **North-west lowland** | 4,940 (~19,800 km²) | 1236,299 | 1,686 / 3,422 m | 1,537 mm | Dfc, Cfa, ET |
  | **Gate shoulder** (east lobe) | 463 | 1427,351 | 2,587 / 3,842 m | 549 mm | Dfc, Dsc, ET |
  | **Western tip** | 465 | 1117,336 | 1,013 / 3,713 m | 1,301 mm | Dfc, Cfa, ET |
  | **Garnet cauldron** | 53 | 1187,345 | 2,800 / 3,964 m | 2,321 mm | WH, Dfc, ET |

  The north-west lowland slopes down toward Spider Lake and holds the Vitreous tarn. The south margin, toward Korona, is
  not low: 6.6-7.5 km of tundra (HT) at px 1160-1250, y 345-372, and airless crest (10.6 km) at px 1290-1300.
- **The three cauldron tarns** (class WH, all inside the polygon). Gemini's levels are right.

  | Tarn | 5.1 px | Level | Walls within 8 km | Lowest crest out | Rain | Mean / warm / cold |
  |---|---|---|---|---|---|---|
  | **Garnet-Mirror Tarn** | 1186,344 | 2,810 m (19 cells) | to 6,308 m | 5,435 m | 2,211 mm | 10 / 17 / 3 °C |
  | **Vitreous Boxwork Tarn** | 1258,326 | 2,950 m (27 cells) | to 4,809 m | 3,728 m | 2,494 mm | 9 / 16 / 2 °C |
  | **Epidote-Steam Tarn** | 1342,338 | 2,670 m (19 cells) | to 10,457 m | **11,535 m** | 1,929 mm | 11 / 18 / 3 °C |

  "Lowest crest out" is the lowest height a walker must climb to reach Spider Lake or Korona (a flood fill on the model).
  **The Epidote-Steam Tarn is sealed on the model:** airless walls ring it. **The owner opened it (2026-11-09)**: a cave
  through the wall and a carved approach of small valleys (section 2a). The map edit has landed (`tools/scale-model/edit_511.py`, 5.1 edit 1: the
  Portal Valley carved, `tube_epidote_16` recorded with the Portal, the Marble Hall and the Inner Mouth as its caverns).
- **Water:** no river in `rivers.json` crosses the polygon. The **Web-Cleaver River** (Hām-Tsēk, `id 9102`, 1,092 km,
  380-1,650 m³/s) runs 12 km off its north-west edge, from Spider Lake west to the Ria. The **Outland Gate River** (Hau-Gèl,
  `id 9106`) runs 32 km off its east edge, in the gap. The tarns have no outflow on the model; their streams are kit work.
- **No vents, tubes or volcanoes** inside (`vents.json`, `tubes.json`, `volc.json`). The heat is geothermal, not volcanic.
- **No settlements** inside (`60-settlements.js`). The nearest: **The Gate** (outpost, px 1408,414, just past the polygon's
  south-east corner in N Outlands, 8,002 m on the model; **moving into the gap at the Narrows, 1438,326**, the owner's
  decision of 2026-11-09, `biomes/outlandgate/PLAN.md` section 9) and **Coyote Canyon** (village, px 1265,500, in Korona,
  1,603 m).
- **Neighbours on the model** (polygons touching or overlapping): Korona / NE (`rmuqm3urh0mo6`), arachnoid canyons
  (`rmvarachnoids`), Tiers (`rmvp5il0uz1yf`), N Outlands (`rmvp5489oiy6z`), ria valley (`rmvriavalley`), spider lake
  (`rmvyj4v2ozgb1`), the Coyote Kingdom (political). The polygon overlaps N Outlands, the Arachnoids and the Tiers along its
  south and east edges, and touches the Outland Gate polygon at the Gate shoulder. **The sketch's ids for Korona
  (`rmuqm76f7cb74`), the Arachnoids (`rmuqm9fa9dfa7`) and Outland (`rmuqmb59f1f14`) are not in the region store.**

## 2. Geology and landforms

The sketch's four-way story holds, and it is good geology. In the order the rocks formed:

1. **The impact rim (the host rock).** Concentric slump terraces, shatter-coned gneiss and breccia. **Pseudotachylite**:
   black glassy friction-melt veins and sheets along the slump faults, polished to "mirrors" where a fault surface is bared.
2. **Korona's contact aureole (the skarns).** Heat from Korona's dome baked the wall's carbonate and breccia into **skarn**:
   bands of green epidote, red-brown grossular garnet, black magnetite and white marble. Real skarns form where an intrusion
   meets limestone; the plan takes Korona's dome as the heat source. Skarns are the classic host of iron, copper, tungsten
   and gold ores (a resource, section 5).
3. **The Arachnoids' dike swarm (the boxwork).** Basalt and diabase dikes radiate from the Arachnoids and cross the slump
   scarps. Harder than the host rock, they weather out as walls, and the walls box the ground into cells: the **cauldrons**.
   (Sketch: dikes 150-230 m high. A proposal; the model's 2 km grid cannot show them.)
4. **The Outland Gate fault (the plumbing).** Shear on the fault keeps deep fractures open; hot water rises through them into
   the cauldrons. (Sketch: 38-65 °C. A proposal.)

**Zones** (Gemini's five, re-banded to the model):

| Zone | Where (model) | Drawn by |
|---|---|---|
| `boxwork_cauldron`: warm tarns in dike-walled cells | the three tarns, 2.7-3.5 km | `KSTACKS.row` (`kind:'fin'`) for the dike walls on one strike; `KRELIEF.waters` and `WATER.open` for the tarn; `WATER.spring` and `WATER.terraces` for the warm springs and their sinter |
| `skarn_badlands`: banded green, red and white ribs | the north-west lowland's slopes, 3.5-5 km | `KRELIEF.gully` (badland gullies), `KSTRATA` with a skarn recipe (`KSTRATA.vary` for the bands) |
| `dike_lattice`: the dikes standing above the slopes | 3.5-6 km | `KSTACKS.row` fins; `KRELIEF.joints` for the cross-joints |
| `mirror_scarp`: slump faults with glassy faces | the Gate shoulder and the rim's inner face | `KRELIEF.slump` (blocks under a head scarp), `KRELIEF.scarp` for a single wall, `KRELIEF.talus` at the foot |
| `rim_crest`: tundra, ice and the airless crest | 5.5 km up; airless over ~9 km | `KGLACIER`, `KFROST`, `KFAR` for the crest past the map |

The fifth sketch zone (`fumarole_crest`, fumarolic ice caves at 4.5-5.8 km) has no vent on the model. It is kept as a
proposal for the owner: a few warm fractures reaching the ice (section 9).

## 2a. The way to the Epidote-Steam Tarn (the owner, 2026-11-09)

The owner asked: "can it be reached by cave somehow? we can carve a path with some small valleys to it too." Both, then.
This section is **the spec for the map edit** (a scale-model session carves it); the kit draws the 1:1 detail.

**Where the wall is thinnest.** The tarn (1342,338, 2,670 m) sits in a pit 9 km deep in a plateau of 10-13 km. A flood fill
and a least-cost search on the model (carving and tunnelling priced against each other) both choose the same line: **due
north, along x 1330-1340**. Ground under 6 km is 40 cells (81 km) north of the tarn's shore at its nearest; east (to the gap)
and west (to the north-west lowland) are 55 cells and more. The north line's crest is 11.6-12.1 km at y 329-330, 9 cells
(18 km) from the tarn. North of the crest the wall's back falls steadily: 10.0 km at y 312, 8.2 km at y 306, 7.0 km at y 300,
5.5 km at 1330,295 (EF), 4.5 km at y 290 (ET), 3.1 km at y 280 (Dfc), 2.3 km at y 270 (Cfa), Spider Lake's shore at 1328,228.
**"Under ~6 km" is read as the walk's highest point** (0.75 atm on the Copper Glacier curve): no carve on the model can make
the walk short.

**The route, proposed** (every px on the 5.1 canvas; heights from the model):

| Leg | Line (px) | Ground or floor | Length | What |
|---|---|---|---|---|
| **1. The north slope** (natural) | 1328,228 (Spider Lake's shore) south along x 1330-1336 to 1330,295 | 1,396 m rising to 5,530 m; Cfa, Dfc, ET, then EF at the top | ~134 km | no edit: the back of the wall is already a walk under 6 km |
| **2. The Portal Valley** (carved) | 1330,295 to 1331,302 | floor 5,530 m at 295, 5,750 at 298, 5,850 at 300, **5,900 m at 302**; the cut is 0, 0.5, 0.9 and 1.3 km deep at those rows | 14 km | a small trough one to two cells wide, cut into the wall's back; the kit gives it two short hanging side valleys at 1:1 (`KRELIEF.gully`), a snowfield and the portal's ice |
| **3. The Epidote Cave** (a tube record) | **portal 1331,302** (5,900 m) by 1333,312, 1335,322, 1337,330 to the **inner mouth 1340,336** (~2,700 m, on the tarn's north shore, 30 m over the water) | the upper level holds 5.6-5.9 km to under the cauldron's rim (y 333), then the lower level falls ~2.9 km to the tarn in its last 6-8 km | ~71 km | rock overhead peaks at about **6.4 km** under the crest at 1336,329 (12.1 km) |
| **4. The cauldron** | 1340,336 to the tarn | 2,670 m | | the walls stand 6.9-9.3 km within 2 cells north; a bench at 4.0-4.9 km on the south shore (1339-1346, 339-342) |

So the walk from the polygon's north edge to the tarn is about **85 km** (14 km of valley, 71 km of cave), and from Spider Lake
about 220 km. **No point of it stands over 5.9 km.**

**For the map edit:** (a) lower the cells 1330-1331 x 296-302 to the floor heights above, one to two cells wide; (b) add a
`tubes.json` record in the shape of `tube_ozarks_15`, *proposed*: `id 'tube_epidote_16'`, `name 'Epidote Cave'`, `region
'rmvymakpc0pft'`, `rock 'skarn_marble'`, `state 'geothermal'`, `km 71`, `px [[1331,302],[1333,312],[1335,322],[1337,330],
[1340,336]]`, one cavern (`kind 'bottle_hall'`, *proposed* "the Marble Hall", at 1336,326 under the crest). Its `depth_m`
does not describe a passage 6 km down: the session records the floor heights above in its notes instead.

**The geology of the cave.** The cave follows the plan's own plumbing (section 2, item 4): the **Outland Gate fault** keeps
deep fractures open, and the line runs NNW-SSE, the fault's strike. Hot, CO₂- and H₂S-charged water rising up the fault
dissolved the **marble bands of the skarn** (the white bands of section 2, item 2): that is the soluble path.
`biomes/KARST-SITES-5.1.md` already notes the skarns "could be a marble cave". It is a **hypogene** cave (water from below,
not rain from above), as Carlsbad and Lechuguilla are: a rising maze of passages and cupolas, gypsum crust, no sinks. The upper
level is the older, dry one (an old water table); the lower is still hot and wet, and feeds the tarn its warm water.
- **Drawn by:** `KKARST.network({kind: 'hypogene', ...})` for the passages, chambers, cupolas, crust and the warm-spring
  outlet; `KKARST.build` into a `KCAVERN`; `KCAVERN.floorFn` and `drawRock` for a cave page's floor and rock;
  `KSPELEO.place(..., {kinds: KSPELEO.HYPOGENE})` for the gypsum and the crystals; `KCARVE` mouths for the portal and the
  inner mouth.
- **The stretch, said plainly:** no Earth cave runs 6 km down (the deepest, Veryovkina, is 2.2 km), and rock 6 km down is
  normally 150 °C or more. The plan leans on 0.75 g, on the fault holding the fractures open, and (*proposed*) on meltwater
  from the crest's ice draining down the fault and cooling the upper level. The owner may prefer a shorter, deeper-carved
  valley (below) or the Ancients' hand in the cave.

**An alternative for the owner:** carve the valley to the crest's foot instead: floor under 6 km as far as y 318 cuts the
wall's back up to **4.5 km deep** (a gorge, not a small valley), and shortens the cave to about 40 km, from 1330,318 to the
inner mouth, under the crest band (y 318-334, all over 10.5 km). The plan prefers the small valley and the long cave, as the owner asked.

## 3. Air and climate

- **Air** (at Copper Glacier's figures, 1.19 atm at 2,380 m and 0.71 atm at 6,500 m): the tarns at **1.11-1.15 atm**; the
  north-west lowland's median (3.4 km) about **1.05 atm**; the skarn ridges (4.8 km) about **0.88 atm**; the region's median
  (7 km) about **0.67 atm**; airless over ~9 km. The sketch's figures (1.08 atm at 2.8 km, 0.92 at 4.8 km) came from a
  different curve (`WORLD.md`'s 1.35 atm sea level with a 12.6 km scale height). The kit uses the Copper Glacier curve, as
  the Outlands plan does, unless the owner picks the other (section 9).
- **Climate classes**, whole polygon: O (airless) 36%, HT 13%, HF 12%, Dfc 12%, ET 10%, EF 10%, Cfa 4%, Dfb 1%, Cfb 1%.
  Ground under 4.5 km: **Dfc 54%, Cfa 20%**, ET 9%, Dfb 7%, Cfb 6%; median rain **1,505 mm**; mean 8 °C, warmest month
  18 °C, coldest -3 °C.
- **The cauldrons are wet and cool-temperate** (WH tarns with 1,929-2,494 mm and means of 9-11 °C). Gemini's "Cfb cloud
  oasis" fits the Vitreous and Garnet cauldrons; it is a geothermal pocket in Dfc country, not a separate class on the model.
- **The Gate shoulder is dry** (549 mm, Csa and Dsc): the rain shadow of the high crest, open to the gap's warm air.
- Read each station's `tm`, `tw`, `tc` and `p` again when the kit starts.

## 4. Life

Flora is read in place from kits that have it; this kit adds only what the cauldrons and skarns need.

| Zone | Life | From |
|---|---|---|
| **Cauldron tarns** | thermophile mats banded by temperature round the springs; reeds; warm meadow | the geyser kit (`biomes/geyser`) |
| **Cauldron floors** (Vitreous, Garnet) | the sketch's tree ferns and podocarps as a moist, mild forest under the dike walls | Korona's wet-wall plants (`wallfern`, `bladderpool`, once Korona exports them); swbay's fern and conifer species |
| **North-west lowland** (Dfc, Cfa) | boreal forest grading to temperate broadleaf near Spider Lake | nwouterwall's wall flora (its "fur" theme); the Spider Lake kit's silk-forest trees when that kit exists (parked) |
| **Skarn badlands** | sparse: metal-tolerant cushions and lichens on the bands, bare marble | Copper Glacier's cushions; the Throne's ash-desert plants |
| **Rim crest** (ET, EF, HT) | snow algae, lichen, frost coral; nothing on the airless crest | Copper Glacier |

**Animals** (`kits/fauna`, as `BIO.record` records): ibex and goats on the dike walls; marmots on the badlands; raptors on
the cauldrons' thermals; Spider Lake's eusocial spiders and their silk at the north-west lowland's edge (Spider Lake's plan;
the spider lineage is the fauna kit's to define). **Proposed:** warm-water invertebrates in the tarns.

## 5. People

- **Nobody lives here** on the model: no settlement, camp or polity polygon.
- **Who comes:**
  - the **Coyote Men** and the **Tierhounds** (`biomes/outlands/PLAN.md` section 6; not yet in `LORE.md`), from the N Outlands
    and the Gate to the south-east. The Gate shoulder faces their country;
  - **Spider Lake's silk-gatherers** (Spider Lake's plan) on the north-west lowland.
- **The Epidote Cave** (section 2a) is known to few: *proposed*, a pilgrims' and prospectors' way, with cairns in the Portal
  Valley and a camp at the portal (`KCAMP`). Who keeps it is open (section 9).
- **What they would come for:** the skarns' ores (magnetite iron, copper, garnet as an abrasive, epidote and garnet as gem
  rough) and the warm cauldrons. **Proposed:** quarrymen's and prospectors' camps (`core/camp`, `KCAMP`), temporary; skarn
  ore nodes from `kits/resources` (iron, copper; the grade read at build).
- **Player outposts:** the Vitreous and Garnet cauldrons have water, warmth and shelter. As the owner's rule asks, the kit
  only offers their benches as candidate sites to the open world's player-settlement registry and draws nothing for them.

## 6. Dangers

Each maps to a `KHAZ` kind (`core/hazard/README.md`).

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Gas pooling** (CO₂ from the springs settling on still nights) | cauldron floors | `gas`, pooled with `KHAZ.poolK` (`21-core-hazard-flow.js`, opt-in); the night timing is the shared amendment |
| **Hot water and ground** | spring vents and the tarns' hot margins | `heat` |
| **Sinter crust over hot water** | spring aprons | `sink` (the shared breaking-crust amendment) |
| **Glassy faces and scree** | mirror scarps, pseudotachylite slabs, dike talus | `slip`, `fall` |
| **Rockfall** | under the dike walls and scarps | `crush` |
| **Cold and thin air** | everything over the cauldrons; airless crest | `KHAZ.provide('temperature')`, `'pressure'` |
| **Drowning** | the tarns | `drown` |
| **The Epidote Cave** (section 2a): scalding pools, pooled CO₂ and H₂S, acid drips, shafts, the dark, 71 km of it | the cave's lower level most | `KKARST.hazards(N)` for the hypogene kind gives `heat`, `gas` (`shape.pool`) and `acid`; `fall` and `pit` at the shafts |
| **Ice and avalanche** at the portal (5.5-5.9 km, EF) | the Portal Valley | `slip`, `crush`; `cold` |

Signs: dead birds and bare hollows for gas; mat colour for heat; a hollow ring for the crust; fresh talus under a wall.

## 7. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2. Each page is the usual 5.2 km square.

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **Vitreous Hollow** | 1258,326 | tarn 2,950 m; walls to 4,809 m; 1.11 atm | the cauldron: the warm tarn, dike walls on all sides, sinter springs, mats, the fern-and-podocarp floor; gas at night |
| 2 **Garnet-Mirror Cauldron** | 1186,344 | tarn 2,810 m; walls to 6,308 m; 1.13 atm | the deep cauldron: red garnet skarn cliffs and black dikes over a still tarn, the wettest station (2,211 mm) |
| 3 **Epidote Badlands** | 1200,330 | 4,780 m (ET); 0.88 atm | the skarn ribs between the two cauldrons: green, red, black and white bands in gullies, ore outcrops, a prospectors' camp |
| 4 **Gate Shoulder** | 1430,345 | 2,867 m (Csa, 643 mm), 1,972-4,538 m within 8 km | the mirror scarp: slump blocks with glassy faces, looking east down into the Outland Gate (the border with `biomes/outlandgate`) |
| 5 **The Epidote-Steam Tarn** (opened by the owner, 2026-11-09) | 1342,338, the inner mouth at 1340,336 | tarn 2,670 m; 1.15 atm; WH, 1,929 mm, 11 °C (18/3); walls to 10.5 km | the sealed cauldron reached by the cave: the inner mouth steaming over the tarn, the hypogene cave's warm outlet, sinter and mats round it, walls rising into the airless crest on every side; the most hidden page on the map |
| 5a **The Portal** (optional, a cave page) | 1331,302 | valley floor 5,900 m; 0.77 atm; EF | the Portal Valley's ice and the cave's mouth; inside, the dry upper level's gypsum and the Marble Hall (a `KCAVERN` page, as the Hearths' Cave of Crystals) |

**Station 1 as built (2026-11-10):** the page stands on the tarn's south-east shore (px 1260.75,327.8, `region/far.py`), y = 0 at the
water (2,950 m; the shore pixel's own bilinear height is half-way up the wall, so far.py takes the tarn's level and its WH climate, +9 °C,
2,494 mm, 1.11 atm). The 1 km model has no shore: the tarn's cells meet the wall's, which rises ~800 m in the first 700 m. The station adds
a **spring apron** (talus and sinter built out ~350 m from the wall's foot), three rows of **dike fins** (`KSTACKS.row`, 22 fins 30-150 m: two
across the apron into the tarn on one strike, one across them out in the water, the cell's north side), **talus** at their feet
(`KRELIEF.talus`), five **springs** at the wall's foot inside the cell (`WATER.spring`: the boiling main spring, a rust pool, a copper pool),
the main spring's **sinter stair** (`WATER.terraces`, seven treads to the tarn) and the springs' **heat** (`KTHERM`: the mats over 22 °C, bare
sinter over 40, the snow off the warm ground). The tarn is a `WATER.open` without surf; its bed sinks 60 m under the model's flat cells.

**Station 2 as built (2026-11-10):** the page stands on the Garnet-Mirror Tarn's south shore (px 1185,345.9), y = 0 at the water (2,810 m;
WH, +10 °C, 2,212 mm, 1.13 atm). The tarn fills the north of the box and a lobe of it its east; the south slope rises ~600 m in 700 m to the
sill (3.4-3.7 km); across the water, 8-12 km north-west, the great wall (4.8 km within 1 km of the shore, 6.3 km within 4). The station
takes station 1's landforms with its own record (`stations/garnet/44r-host-site-rec.js`): the apron along the south shore and round the
lobe, two black dikes across it into the tarn and a line of dike islets down the lobe (21 fins), three springs (a rust pool among them) and
a five-tread sinter stair; the cliffs' garnet red is a tint over the rock layer until the skarn's texture comes. The podocarps are still owed.

**Station 3 as built (2026-11-10):** px 1200,330, 4,784 m, 0.88 atm, ET (+4 °C, 1,867 mm), a slope rising south-west ~7%. Two gully
systems (`KRELIEF.gully`, `liang` tops, 38c) drain it north-east; three rows of dike ribs (`KSTACKS.row`, 8-30 m) cross it ENE, a fin left
out wherever a gully has cut the dike through; a field of magnetite outcrops (`KSTACKS.cluster`, black and rust); talus at their feet. The
tree line is Köppen's (the warmest month under 10 °C: no tree), so the NW outer wall's tundra and fellfield grow here, its willow and
cottongrass on the gullies' damp floors; the gully walls are bare skarn (the green-grey `rockTint` over the stand-in). The prospectors'
camp is a registered flat only: `KCAMP` needs the culture who quarries (section 9). The ore nodes of `kits/resources` are not placed.

**Station 1 comes first:** it is the reachable cauldron (lowest crest out 3,728 m), it holds the kit's signature (a warm
tarn in a dike box), and its geothermal surfaces are the shared amendment the other plans want. Gemini's "Pseudotachylite
Mirror-Scarp" over the Web-Cleaver Gorge is folded into station 4: the Web-Cleaver runs outside the polygon. ~~Station 5
waits for the map edit~~ (the edit landed: 5.1 edit 1); stations 5 and 5a are built as the outside of the cave (the inner mouth, the
portal), the cave walked as a page is not.

**Station 4 as built (2026-11-10):** px 1430,345, 2,874 m, 1.12 atm, Csa (+18 °C, 643 mm), the shoulder's east flank falling about
100 m a km into the gap. Two slumps (`KRELIEF.slump`, 38c: five blocks under their head scarps, tilted back, a broken front and a toe)
on the 1 km model's smooth slope; the head scarps over ~30 degrees are the mirror scarps (zone `scarp`, darkened: the pseudotachylite's
glaze and texture are owed); 14 landslip pinnacles (KSTACKS spires) on the blocks' fronts; talus at their feet. The NW outer wall's
steppe on the open ground (`SITE.nwMap`) and thin woods on the shaded slopes; no tree fern or reed (no spring). The gap's floor, the
long wall at the Narrows and the proposed citadel are `biomes/outlandgate`'s and the owner's: nothing of them is drawn.

**Station 5 as built (2026-11-10):** the Epidote-Steam Tarn's north shore (px 1340,336.6), y = 0 at the water (2,670 m; WH, +11 °C,
1,929 mm, 1.15 atm). The walls rise 4 km within a kilometre of the water on the 1 km grid (a 75-degree bicubic face). The cauldron's
landforms with its own record: the apron along the north shore and down the west; the **Inner Mouth** (`tube_epidote_16`'s
`cav_epidote_inner_mouth`) a `KCARVE` alcove 90 m wide and 30 m high in the wall's foot, its floor ~13 m over the water; the cave's warm,
sulphurous outlet as the main spring in front of it and its six-tread sinter stair; two lesser springs; seven dike islets out in the water.

**Station 5a as built (2026-11-10):** the head of the Portal Valley (px 1331,301.6), y = 0 at the plan's 5,900 m (0.77 atm; the model
reads -8 °C: the `ice` zone, EF). The valley is the model's own (edit 1 carved it). The station adds the headwall's cliff
(`KRELIEF.scarp`, 70 m, across the head), the **Portal** (`cav_epidote_portal`) a `KCARVE` alcove 60 m wide and 22 m high at its foot
facing down the valley, and seven pilgrims' cairns down the floor (proposed, section 5). The floor's highest point on the page reads
5,787 m: under the plan's 5.9 km. The ice of the portal is the snow cover (`KGLACIER` not taken); the cave inside is station 5b's page.

**Station 5b as built (2026-11-10): the Epidote Cave's Marble Hall,** a cave page (`--station cave`; its frame forked from
`biomes/hearths`' Cave of Crystals: `build_cave.py` and `stations/cave/`). At the tube record's `cav_epidote_marble_hall` (px 1336,326),
y = 0 the upper level's floor at 5,750 m (the plan's 5.6-5.9 km band), the crest 6.2 km overhead. A `KKARST.network` of the hypogene
kind on the Outland Gate fault's strike (NNW), its feeders up three strands of the fault: the dry upper storey at y 0 and, 80 m under it,
the lower storey still hot and wet (its water the tarn's source); cropped to 400 m round the upper storey's chamber nearest the record's
point, and there the **Marble Hall** carved as the record has it (`KCAVERN` hall, 240 x 150 m, 55 m to its crown) with five cupolas in its
roof. Dressed by `KSPELEO`: the replacement gypsum's blades and blocks on the dry storey's floor, `KSPELEO.HYPOGENE` over every crust band
(blisters and chandeliers); the rock `KGROUND`'s marble with the skarn's bands and the gypsum crust (`KCAVERN.drawRock`). `KTHERM` over the
feeders (the rock cooled to 14 °C, PLAN 2a's meltwater, proposed; the feeders 50 °C), `KKARST.hazards` (bad air pooled over the lower
storey's water, the falls down the feeder wells, the acid's drips), the lower storey's water a `WATER.open` without surf. No daylight: the
visitor's lamp and the wells' glow.

## 8. Core adoption (written first, as the working rules ask; the stations as built, 2026-11-10)

The table of `README.md` "CORE MODULES ARE NOT OPTIONAL", for this kit. "Taken" is what station 1's page lists in `build.py`; "later" the
stations that will take it.

| Need | Module | Station 1 | How |
|---|---|---|---|
| randomness | `core/rand` (`KRAND`) | taken | every placement seeded by (world, cell, index, salt): the NW outer wall's `NWOW.place` grid with this kit's own salts (900 on); the apron's roughness and the far crags on `KRAND.fbm` |
| placement mask | `core/mask` | not needed | no canvas is read; the zones are fields and a raster of the baked grid (47) |
| tags, space | `core/tags`, `core/space` (`KSPACE`) | taken | every record registered before it is drawn (the tree ferns in their builder's first line); `KSPACE` keeps the ferns clear of each other and of the NW outer wall's trees |
| ground, field | `KFIELD` (30), `KGROUND` (43), `KHORIZON` (45) | taken | the near box baked at 8 m, the sinter stair on a 2 m inset; seven library layers (16 units or fewer: `KGROUND`'s six over the dithered base); the walls' shadows at a low sun |
| strata | `KSTRATA` (35) and its shader | taken | the `megabreccia` recipe on the steep (the impact rim's host rock). The skarn recipe is amendment 1, owed |
| dikes | `KSTACKS.row` (37, `kind:'fin'`) | taken | three rows, 22 fins; each fin's foot under the lowest ground round it |
| relief | `KRELIEF` (38, 38c) | taken | `talus` at the fins' and pinnacles' feet; `gully` (station 3's badlands), `slump` (station 4's blocks and mirror scarps), `scarp` (5a's headwall). `joints` not taken |
| the springs' heat | `KTHERM` (core/terrain 47) | taken | point vents at the springs, line vents down the stair and along the fault's seep; the zones, the ground's colour and the snow mask read the one field |
| water | `core/water`: `WATER.open`, `WATER.spring` (geyser 52, 52b), `WATER.terraces` (ext 53, 53b), the audit (57), the shore's fields (60) | taken | the tarn without surf or breakers; the five springs; the stair. The reflections switch (58) is not taken (KNOWN_ISSUES.md) |
| glacier, frost | `KGLACIER` (44g), `KFROST` (42) | not taken | the rim's ice is the far land's snow; 5a's portal ice is the snow cover (KNOWN_ISSUES.md) |
| far land | `KFAR` (44) | not taken | the shared sky's ridges cast from the model (region/far.py) carry the far land, as the NW and W outer walls' |
| the cave | `KCARVE` (36); `KKARST` (`hypogene`, 39c), `KCAVERN` (39, 39d, 39e), `KSPELEO` (39b) | taken | the inner mouth (5) and the portal (5a) as `KCARVE` alcoves; the cave page (5b): the hypogene network into a `KCAVERN`, the Marble Hall a `KCAVERN` hall, `KSPELEO`'s gypsum and `HYPOGENE` dress, `KCAVERN.floorFn` under the eye |
| flora | `core/biome` | taken | the NW outer wall's species, trees, floor and build read in place (`48a`-`48d`), its zones mapped from this kit's (`NEOW.ZONES`' `nw`); the cauldron's own tree fern and reed (`50`). Geyser's, Korona's and swbay's flora are not read at station 1 (section 4: the podocarps are owed) |
| sky, weather | `core/atmos` | taken | the shared sky at the station's pixel, its weather, height fog and the tarn's mist, the rain cover, snow that lies with the springs' ground bare (`ATMOS.snowBare`) |
| hazards | `core/hazard` (`KHAZ`, 21) | the cave page; tags at the cauldrons | the cave page loads `KHAZ` and its pooling (`KKARST.hazards`: gas pooled on the lower storey, falls, acid; the scalding pools); the cauldrons register the springs with a `heat` tag (as highrift's): their gas pools, the breaking crust and the night timing are amendments 3 and 4 |
| camps | `core/camp` (`KCAMP`) | not yet | station 3 registers the prospectors' flat; the camp's pitch needs a culture's tent program (who quarries: section 9) |
| fauna | `kits/fauna` | later | none at station 1 |
| resources | `kits/resources` | not yet | station 3 draws the magnetite outcrops as rock (`KSTACKS.cluster`); the kit's ore nodes (iron, copper; their grade) are owed |
| shadows | `core/shadow` | taken | off at load, `?shadow=1` |
| host, export, materials | `core/host`, `core/export`, `core/materials` | taken | `materials.json` and `tools/textures/pack.py` (11 families); the export's `landforms` carries the site's records and the heat field |
| city, hamlet | `core/city`, `core/hamlet` | no | nobody lives here |

`tools/check_core_use.py` passes on every station (2026-11-10).

**Core amendments needed:**
1. **A skarn recipe for `KSTRATA`** (new): irregular, lensing bands (epidote green, garnet red-brown, magnetite black,
   marble white), not flat beds. `KSTRATA.vary` may already be enough; check at build before proposing code.
2. **Geothermal surfaces** (shared: mud pots, fumaroles, sinter and mat decals; `core/water` README "Not here (yet)").
3. **Night gas pools** (shared hazard amendment), on `KHAZ.poolK`.
4. **A breaking crust** (shared hazard amendment).
5. **Rock glaze** (shared: the rock iridescence glaze) for the pseudotachylite mirrors and the magnetite's sheen.
6. **The player-settlement registry** (shared, open world).

**Textures owed** (to `core/materials/PROMPTS-NEEDED.md` when the kit starts): skarn (epidote-garnet banded), pseudotachylite
fault mirror, contact marble. `stone.obsidian` exists and may serve the glass.

## 9. For the owner

- ~~**The sealed tarn.**~~ **Settled (the owner, 2026-11-09): opened by a cave and a carved approach of small valleys.**
  The route is section 2a: the Portal Valley (1330,295 to 1331,302, floor 5,530-5,900 m), the Epidote Cave (portal 1331,302
  to the inner mouth 1340,336, ~71 km, a hypogene marble cave on the Outland Gate fault), and station 5. Still open:
  - the route's length: about 85 km from the polygon's edge, 220 km from Spider Lake. Accept it, or the alternative (a
    gorge cut 4.5 km deep and a 40 km cave)?
  - the cave's depth (6.4 km of rock overhead) is past any Earth cave: keep it natural, or give it the Ancients' hand?
  - who keeps the cave: nobody, pilgrims, or the Tierhounds from the gap?
  - names: "the Epidote Cave", "the Portal Valley" and "the Marble Hall" are working names.
- **The heat.** The model has no vent here. Is the cauldrons' warmth hot springs only (the plan), or also fumaroles on the
  crest (Gemini's `fumarole_crest`)?
- **The air curve.** Copper Glacier's (used here and in the Outlands plan) or `WORLD.md`'s (used by Gemini's sketches)?
- **Overlaps.** The polygon overlaps N Outlands, the Arachnoids and the Tiers. Trim it on the model? (The Tiers: only 3
  cells, trimmed to the crest in the Tiers' map edit, `biomes/tiers/PLAN.md` section 8a; the owner, 2026-11-10.)
- **The Hounds' Road** (`biomes/tiers/PLAN.md` section 8; the owner asked for it, 2026-11-10): the Tierhounds' road to the
  Gate crosses this polygon, down into the **Vitreous Hollow** (station 1) at its halfway point and east along the wall's
  back at 5.5-6 km to the gap. The hollow becomes a road station, not empty ground; the village of Howl stands in the gap,
  not here (the owner, 2026-11-10).
- **Who quarries the skarns:** the Tierhounds, Spider Lake's people, or nobody yet?
- **Names:** the tarns keep Gemini's English names. Hum names (the Coyote tongue, as the rivers have) are open.
- **Order:** after Korona's 5.1 station sites (`STATIONS-MAP-5.1.md`). The Outland Gate ruling is made (the owner,
  2026-11-09: the gap stays and The Gate moves into it, `biomes/outlandgate/PLAN.md` section 9): station 4 looks down on the
  Tierhounds' Long Wall at the Narrows, about 20 px (40 km) to the north.

## Sources

- Gemini's sketch (this file, 2026-11-02) and the region note (`smodel/nw_expansion.py`, ~line 2642);
- the model's data at `gemini/scale-model-5.1-r3`, read with `smodel.page` (heights, `wl`, `c`, `p`, `tm`, `tw`, `tc`);
- `model/data/rivers.json`, `vents.json`, `tubes.json`, `volc.json`; `model/src/51-region-store.js`, `60-settlements.js`;
- `smodel/river_names.py` (Hām-Tsēk, Hau-Gèl);
- `biomes/outlands/PLAN.md`, `SURVEY.md`; `biomes/spiderlake/PLAN.md`; `biomes/korona/PLAN.md`; `biomes/firebliss/PLAN.md`;
- `core/README.md` (`KKARST` hypogene, `KCAVERN`, `KSPELEO`), `core/terrain/LANDFORMS.md`, `core/hazard/README.md`,
  `core/water/README.md`; `biomes/KARST-SITES-5.1.md` (the skarns as a possible marble cave); `model/data/tubes.json`
  (`tube_ozarks_15`, the record's shape); the route by a least-cost search over the heights (carving against tunnelling),
  2026-11-09;
- `HANDOFF-REBUILD.md`, `tools/scale-model/HANDOFF-GEMINI-5.1.md`.
