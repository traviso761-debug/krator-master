# The Tiers: the plan (biome plan, 2026-11-10)

The Tiers (`rmvp5il0uz1yf`, "Tiers") is the Tierhounds' country in the north-east of map 5.1: a staircase of benches that
falls about 8 km, north-east to south-west, from the Outer Wall's flank to the trench at the East Abyss's rim. **The owner
(2026-11-10):** it is "a transition zone between Korona, the Outlands and the mountains, relatively placid, where the
Coyote Men have built their most organized polity among the relatively placid lakes and canyons of the region."

The Outlands plan made it a biome of its own (the owner, 2026-10-26; `biomes/outlands/PLAN.md` section 10). This plan
reads the region off the model, corrects what the earlier plans said about it, and adds the flora, the people, the hazards,
the roads, the stations and the core adoption. **Nothing is built.** All px are on the 5.1 canvas (1821 x 1723, 2 km/px).
Settled points carry the owner's date; *proposed* marks this plan's own suggestions; section 13 holds the questions.

**The owner's answers (2026-11-10):** the Tierhounds are Coyote Men; Coyote Canyon is the capital, and the smaller village
of **Howl** stands closer to the Gate; the Gate is a frontier post, reached by an easier road than the way round Spider Lake
(section 8, the Hounds' Road); the upper lake's lip is fixed on the model at the next model pass (section 8a); the overlaps
are settled as section 12 proposes; the flora grows in tiers; the air follows Copper Glacier's curve; station 1 comes first.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/tiers/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `outposts.json`) |
| Pages | stations, as Korona's (`build.py --station <name>`): `dist/tiers.html` (station 1, the Lake of the Tiers) and `dist/tiers-<name>.html` (section 9) |
| Regions on the model | `Tiers` (biome, this kit), `Coyote Kingdom` (political, `rmvp5blj3m4ou`), `The Tiers` (geographic, `rmucfm4y5yd6y`, the owner's older label); marker **Coyote Canyon** (village, `soksvzt1h9`, px 1265,500; **the capital**, the owner, 2026-11-10); **Howl** (a smaller village closer to the Gate, the owner, 2026-11-10; not on the model yet, section 8a) |
| Object | `TIERS` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `plantOfItem`) on the `BIOME-API.md` contract (Korona's and the Outlands' shape) |
| Read in place | `ebadlands` (sagebrush, pinyon-juniper, cottonwood, ponderosa), `sedesert` (dry scrub), `korona` (the floor's rainforest and traps; station 3), `ehighlands` (the crown's cushions, as Korona's hoar table reads it), `outlands` (fungoid natives in gardens only), `necanyons` (canyon figs and fan palms) |
| Sibling kits | `kits/coyote` (the culture kit, planned in the Outlands plan: the Tierhounds' stepped towns, dress, a people for `peoples.json`), `biomes/outlandgate` (the Gate), `biomes/korona` |
| Out of scope | the Coyote buildings and dress (`kits/coyote`); the animals' models (`kits/fauna`); the floor's rainforest (Korona's) |

A new biome: it goes in the gallery when it first reaches `main`.

## 1. What the map carves (measured, 2026-11-10)

Read from the model's data on `main` (`tools/scale-model/model/data`, `smodel.page`; the region store
`model/src/51-region-store.js`). Pressure is the Copper Glacier curve, `1.6 atm x e^(-h / 8 km)`, as the NE outer wall's
and the Outland Gate's plans use.

- **Size:** 32,087 cells, about **128,300 km²** (land 122,500, water 5,850). Px x 1158-1391, y 382-609; centroid 1270,502.
- **Heights:** p5/p25/p50/p75/p95 = **95 / 3,435 / 4,232 / 5,194 / 6,792 m**. Highest **7,534 m** at 1361,477 (the north-east
  corner, on the Outer Wall's flank); lowest **-765 m** at 1203,530 (the floor, by the East Abyss).
- **The name is the land.** The model's Tranche 2 (`smodel/tranche2_biomes.py`, step 1A) pulled the region's heights toward
  six treads (0, 0.9, 1.9, 2.9, 4.0 and 5.2 km) with risers between them. The treads survive as peaks in the height
  histogram, at about 0.8, 1.9, 2.9, 4.0, 4.6 and 5.1 km. At 2 km a cell the risers are smeared into slopes (median slope 69
  m per cell, p90 180; only 0.7% of the land drops over 400 m in a cell): **the kit draws them as cliffs** (section 2).

  | Tread (*proposed* name) | Heights | Cells (km²) | Centre px | Classes | Rain | Mean (warm / cold) | Air |
  |---|---|---|---|---|---|---|---|
  | **The crown** | 6.0-7.5 km | 4,243 (17,000) | 1341,488 | ET 76%, HT 12%, EF 12% | 0 mm | -10 °C (3 / -23) | 0.62-0.75 |
  | **The high steps** | 4.45-6.0 km, three treads (4.6, 5.1, 5.5) | 8,671 (34,700) | 1279-1290, 462-482 | Dsc, ET, BSk | 31-63 mm | +2 to -4 °C (15 to 9 / -11 to -17) | 0.75-0.9 |
  | **The great tread** | 3.7-4.4 km | **8,332 (33,300)**, one piece | 1269,503 | Dsc 34%, BWk 34%, BSk 22% | 63 mm | +5 °C (18 / -8) | 0.92-1.0 |
  | **The middle steps** | 2.7-3.6 km | 2,123 (8,500) | 1243,524; 1227,480 | BSk, BWk, Csb, Dsb | 188-298 mm | +9 to +12 °C (21-23 / -3 to +1) | 1.05-1.14 |
  | **The lake tread** | 0.5-2.2 km | 2,887 (11,500) | 1232,505; 1233,567; 1240,500 | Csa 50-60%, Cfa, BSh | 486-769 mm | +17 to +23 °C (26-31 / 9-15) | 1.22-1.50 |
  | **The floor** | -0.8 to 0.5 km | 2,598 (10,400) | 1213,551 | Aw 37%, BSh 34%, Am 16% | 863 mm | +27 °C (34 / 19) | 1.5-1.75 |

- **Water.** Two lakes, both on the stair's lower end, and both **perched on the model** (their level stands above part
  of their rim):

  | Lake | Px | Level | Area | Depth | Class, climate | Rim |
  |---|---|---|---|---|---|---|
  | **The upper lake** (*proposed* the Lake of the Tiers; Korona's notes, "a highland lake") | 1247-1274, 514-549; centre 1262,529 | **1,150 m** | 604 cells, **2,416 km²** | bed median 1,031 m, deepest 442 m: **708 m deep** | WH, 22 °C (29 / 15); shores Csa and Cfa, 831 mm | 79 of 140 rim cells under the level; the lowest **284 m at 1246,531**, the west shore |
  | **The lower lake** (Korona's "Tiers' lake", **its built station 3**) | 1211-1244, 530-563 | 380 m | 856 cells, 3,424 km² | bed median -375 m, deepest -649 m | WS, 29 °C (36 / 24); shores Af, Aw, Am, 1,012 mm | 138 of 144 rim cells under the level (Korona's audit: left to its water it stands at -327 m over 225 km²) |

  A third, 20 cells at 70 m (1186,464), lies on the west edge with 3 cells inside.
- **Rivers** (`rivers.json`; Hum names: *Hām* a river, *Kē* a stream, *Gèl* a wadi):
  - **Yūt-Hām** (`r121`, "howling-moon river", 59 km, 16.6 rising to **39.5 m³/s**) from 1,205 m south of the upper lake
    (1255,554) north-west to the lower lake (1243,536), in a canyon 300-550 m below its banks; **Lām-Kē** (`r387`, 27 km,
    11-18 m³/s) from 1,972 m joins it; **Kū-Kē** (`r154`, 25 km, 13-30 m³/s) drops from 1,193 m into the lower lake.
  - **Tsēk-Gèl** (`r432`, "cleaver-stone wadi", **308 km**, 1.8-3.7 m³/s): from 1,193 m at 1257,504 by the upper lake's
    north-west corner, down the stair to the floor and along it to the abyss's edge (1195,608, -467 m); 377 m below its
    banks on the median, **938 m** at its deepest.
  - **Dry wadis** (0 m³/s): **Wūn-Gèl** (1227,488 to 1227,526: 1,375 m down to -256 m in 76 km, a canyon up to 857 m
    deep), Yūt-Gèl and Chūng-Gèl (off the high steps onto the great tread), Hāk-Gèl, Sēk-Gèl, Hā-Mō-Gèl, Pāk-Lām-Gèl,
    Sīu-Lōk-Gèl, Tōng-Hōng-Gèl, and the heads of Sām-Gèl and Wādī al-Sarāb (the south edge).
  - **Outlets** (`outlets.json`): three "breach to the abyss" channels from the floor (1225,506; 1237,532; 1215,556) south
    to the East Abyss's floor at 1231,650 (beds -431 to -766 m). **The Tiers drain to the East Abyss.**
- **Nothing else:** no vent, tube, volcano, basin record, palaeolake, dam or flood inside.
- **Settlements:** **Coyote Canyon** (village, 1265,500, 1,603 m) is the only marker. **Furrow** (outpost, 1276,639,
  -593 m) is 60 km south in the East Abyss.
- **The polity is the region:** the **Coyote Kingdom** polygon covers 92% of the Tiers, and 89% of the Kingdom lies in it.
- **Neighbours** (touching, by length of shared edge): Korona / NE, arachnoid canyons, e badlands, N Outlands, sedesert,
  ne outer wall, painted highlands. **Overlaps** are in section 12.

**Corrections to the earlier plans.**
- The Outlands plan (section 10) placed the Tiers at px 886-1118 by 52-278: those are 4.2x px of the older geographic
  polygon (`The Tiers`, now 1145-1281 by 448-617 on 5.1). The biome polygon is the one above.
- The Outland Gate plan (section 5) says the Tiers reach the gap's floor "over crests no higher than about 3.9 km (a
  minimax flood fill from the Tiers' centre, 1275,495)". **True, but 3,912 m is the centre's own height, and the way is
  about 1,430 km long**, round by the crater's north and Spider Lake (section 8). The direct way over the wall tops 8 km.
  The owner chose an easier road (2026-11-10): the Hounds' Road, about 900 km with its top at 6.0 km after one cut
  (sections 8, 8a).

## 2. Geology and landforms

**The story** (*proposed*; the model has no history). The Tiers are the eastern sector of Korona's ring faults (Korona's
`NOTES.md`: "the eastern sector of the rings"), where the rings meet the Outer Wall. Korona's plume lifted and tilted the
sector; ring faults dropped it in blocks toward the trench and the abyss. The blocks are capped by **hard beds** (basalt
flows from the plume's early years over pale sandstones, tuffs and red beds). Each riser is a cliff of the hard cap over
soft slopes; each tread is a stripped cap. The risers retreat by sapping, as the Colorado Plateau's Grand Staircase does
(the Chocolate, Vermilion, White, Grey and Pink Cliffs), and leave mesas and buttes standing in front of them.

So the Tiers read, from the lake, as **a flight of coloured cliffs**, each with its tread above it. *Proposed* names until
the Hum names come: the **Black Step** (the basalt riser over the lake tread, at ~2.2 km), the **Red Step** (red beds, to
the middle steps), the **White Step** (pale sandstone, to the great tread at ~3.7 km) and the **Grey Steps** (the high
steps' three treads, to the crown).

**Why the lakes are placid** (the owner's word): the lake tread lies in the stair's lee, walled on the north and east by
1-2 km of riser; the air is dense (1.35-1.4 atm); the rain comes on the wall, not the water (the east riser takes 1,286 mm,
Cfa; the north shore 455 mm, Csa). Little wind reaches the water. The kit's lake takes `core/atmos`' wave field at a low
amplitude and the mirror switch (off at load, as Korona's).

**Zones:**

| Zone | Where (model) | Drawn by |
|---|---|---|
| `crown`: frozen steps under the wall | 6.0-7.5 km, the north-east | `KGLACIER`, `KFROST`, `KFAR` (the Outer Wall's airless crest past the map) |
| `steps`: stony treads, frost-shattered risers | 4.45-6.0 km | `KRELIEF.tableland` and `KRELIEF.joints` (the treads and their cliff, as Span's); `KRELIEF.talus`; `KRELIEF.pavement`; `KSTRATA.ledgeField` for the ledges |
| `tread`: the great tread's cold steppe and desert | 3.7-4.4 km | `KRELIEF.pavement` + `paintCover`; `KSTACKS` mesas and buttes (the risers' outliers); `KRELIEF.wadi` for the dry wadis that cut it; terracettes (amendment 3) |
| `riser`: the cliffs between treads | every riser | `KRELIEF.scarp` (one wall each), `KSTRATA.create`/`drape` (the coloured cap and soft beds; a `tiers` recipe, amendment 1), `KRELIEF.talus`, `KCARVE` alcoves at the seep lines; box canyons by `KRELIEF.wadi` |
| `canyon`: box canyons cut back into the risers | Coyote Canyon, Wūn-Gèl, the Yūt-Hām and its streams, Tsēk-Gèl | `KRELIEF.wadi` (its `fan` at the mouth), `WATER.flow`, `WATER.spring` at the canyon heads, `WATER.terraces` for the tufa dams (section 4, step moss) |
| `lake`: the lake tread and the upper lake | 0.5-2.2 km | `WATER.open` (the lake), `WATER.shore`; terraced fields as records on `KFIELD`; `WATER.fall` at the lip |
| `floor`: the hot trench under the stair | under 0.5 km | **Korona's** (its station 3, `korona-basin`), read as the far field; the breach canyons to the abyss (`KRELIEF.wadi`) |

**The lip** (*proposed*). The upper lake's west rim falls to 284 m on the model, so on the model the lake would drain. The
plan holds it behind **a sill of the Black Step's basalt** at 1,150 m along the west shore, with one notch at **1246,531**:
the lake spills there over the Black Step in **a fall of about 850 m** to the floor, the lake's only outlet, beside the
Yūt-Hām's canyon. Placid above, loud below. **The sill goes on the model at the next model pass** (the owner,
2026-11-10; section 8a).

## 3. Air and climate

- **Air** (Copper Glacier's curve, the owner, 2026-11-10): the floor 1.5-1.75 atm; the lake 1.39; Coyote Canyon 1.31; the middle steps 1.05-1.14;
  the great tread **0.98**; the high steps 0.75-0.9; the crown 0.62-0.75. Nothing in the polygon is airless; the Outer
  Wall's airless crest stands past its north-east edge.
- **Classes, whole polygon:** Dsc 21.5%, ET 21.0%, BSk 13.4%, BWk 13.2%, Csa 5.7%, BSh 5.1%, EF 4.1%, Aw 3.4%, Dsb 3.1%, Cfa
  2.6%, HT 1.7%, Am 1.4%, Csb 1.2%, Dfc 1.1%. **Median rain 94 mm.** Extremes: hottest afternoons 41 °C (p95, the floor),
  coldest nights -35 °C (p5, the crown).
- **Three countries in one stair.** Above 2.7 km the Tiers are **cold and dry** (31-298 mm, a winter-dry Dsc and a cold
  desert, with frost every winter: the great tread's coldest month is -8 °C). Between 0.5 and 2.2 km lies **a warm,
  Mediterranean lake tread** (Csa, 486-769 mm; 1,286 mm on the east riser, which is the windward face). The floor below is
  **hot and wet** (Aw and Am, 863-1,490 mm, 27 °C), Korona's rainforest country.
- **The rain line** runs down the east riser of the upper lake: Cfa on its face (1272,522: 1,286 mm), Csb and BSk 10 km
  higher (1278,517: 455 mm at 3,367 m), Dsc on the great tread (1287,509: 31 mm).
- **Season** (*proposed*, the model holds annual totals only): the Dsc and Csa classes say a dry summer and a wet winter on
  the treads and the lake; the herders go up the stair in summer and down in winter (section 6).
- Read each station's `tm`, `tw`, `tc` and `p` again when the kit starts.

## 4. Life

### The rule: everything grows in tiers (the owner, 2026-11-10)

Each neighbour has a rule: the Outlands' flora is fungoid (sealed bodies, no leaves), Korona's carnivory follows
poor x wet x warm, the southern highlands grow in spirals. **The Tiers' own plants grow in tiers**: flat whorls of branches
one above another, stacked rosettes, cushions that grow in terraces, mosses that build steps of lime, lichens in bands along
the bedding. The land repeats itself at every scale. Earth's basis: the tiered "wedding-cake" habit (*Cornus
controversa*, *Terminalia*), whorled conifers, candelabra succulents, tufa-forming mosses (*Palustriella*), terracettes on
grazed slopes. No species copies one of them.

The Tiers' natives hold the lake tread and the risers; the treads take the read-in-place species of their climate
(ebadlands, sedesert, ehighlands) with the natives among them; the floor is Korona's.

### The native plants (12; working names)

| Key | Name | Zone | Form, size | Build | Harvest | Tex |
|---|---|---|---|---|---|---|
| `shelfoak` | **Shelf oak** | lake tread, canyons | the lake tread's woodland tree: a straight grey bole with 4-7 flat tiers of branches, each tier a level plate of small leathery leaves, gaps of sky between them; 12-20 m | trunk, whorled tier plates (cards on flat branch fans) | **nut** (an acorn-like mast), timber | `card.shelfoak`, `bark.tiered` (both owed, section 11) |
| `steppalm` | **Step palm** | lake shores, canyon floors, springs | a palm that keeps each year's dead crown as a skirt and grows the next above it: a trunk ringed with collars like stacked baskets; 6-14 m | trunk, collar skirts, crown | thatch, cordage (the skirts' fibre), a date-like fruit | `card.palm.fan`, `bark.palm`, `bark.skirt` |
| `ladderreed` | **Ladder reed** | the lake's shallows | giant jointed canes with a whorl of strap leaves at every node, stacked like umbrellas; 2-5 m | cane clusters, whorls | thatch, mats, roofing | `card.reed`, `card.wingreed` |
| `stepmoss` | **Step moss** | every seep, canyon floor and spring run | a moss that lays down lime as it grows, building rimstone dams and little pools down every wet line: the Tiers in miniature | `WATER.terraces` (travertine) with a moss cover on the rims | lime (a reagent, *proposed*) | `stone.travertine.tufa`, `ground.travertine.white`, `ground.moss001` |
| `ledgeheath` | **Ledge heath** | risers, on the bedding ledges | a low shrub that grows only along ledges, so each riser is striped with level lines of green; 0.5-1.5 m | shrub rows on `KSTRATA.ledgeField` | dye (*proposed*, a yellow) | `card.heath` |
| `candelabra` | **Tier candelabra** | dry risers and benches (BSh, BSk, Csa's dry side) | a succulent tree with rings of upturned arms, one ring a good year, the lowest the oldest; 3-9 m | stem, arm rings (lathe), ribbed skin | water (tapped), latex (*proposed*) | `skin.cactus` |
| `pagodabush` | **Pagoda bush** | the great tread, the middle steps | a grey shrub of stacked flat discs, each a season's flush; 0.5-1.2 m | disc stacks | fodder | `card.saltbush` |
| `stackcushion` | **Stack cushion** | the great tread, the high steps | a cushion that grows in terraced mounds, a step a decade; 0.2-1 m | stepped dome | fodder (winter), fuel (dried) | `surface.cushion` |
| `tiergrass` | **Tiergrass** | the treads (the herds' grass) | bunchgrass whose tufts sit on the lips of terracettes, the little soil steps that line every grazed slope | grass cards on the terracette lips (amendment 3) | fodder, thatch | `card.stipa`, `card.ichu` |
| `bandlichen` | **Band lichen** | every riser face | crusts in level bands along the beds, orange, grey-green and black: the coloured cliffs' last colour | rock cover on `KSTRATA` beds | dye (an orchil purple, *proposed*: the Kingdom's trade dye) | `rock.lichen.ledges` (owed, section 11), `rock.lichen.circles` |
| `stairlily` | **Stair lily** | the lake's sheltered bays | floating pads that grow in overlapping steps out from the shore, the oldest highest | floating discs, stepped | food (*proposed*, the rhizome) | `card.giantpad` (tinted) |
| `whorlpine` | **Whorl pine** | the middle steps' Dsb and Csb pockets, the risers' cool faces | a conifer with widely spaced level whorls and bare trunk between, the tiers' silhouette on the skyline; 10-25 m | trunk, whorls of needle sprays | timber, resin, a pine nut | `card.pine.b`, `bark.pine.scale` |

### Read in place

| Where | Species | From |
|---|---|---|
| the great tread and the high steps (BWk, BSk, Dsc) | sagebrush, saltbush, pinyon and juniper on the riser feet | `ebadlands` (its cold desert and pinyon-juniper zones) |
| the canyons' dry walls (BSh) | dry scrub | `sedesert` |
| the canyon floors with water | cottonwood, rose weepers; stack figs and gorge fan palms in the warmest | `ebadlands` (green valleys), `necanyons` |
| the middle steps' wet pockets (Dsb 596 mm, Dfc) | ponderosa and aspen | `ebadlands` (montane) |
| the crown (ET, EF) | cushions, snow wool, the glass towers' cold forms | `ehighlands`, as Korona's hoar table reads it |
| the floor | the rainforest, the reagent meadows, the traps | **Korona**, its station 3 (the floor is its ground) |
| the Kingdom's gardens only | pleat columns, cap-shrubs (the Outlands plan's "stragglers in gardens") | `outlands`, read in place when it is built. They come out through the Gate as trade (the seed law stops plants going *into* the Outlands, not out of them) |

### Crops (`kits/crops`)

A **`tiers`** biome entry in `CROPS.BIOMES`, *proposed* zones (`CROPS.WARMTH`, `ATM`, `ARID` bands):
`lake` (subtropic, dense, semiarid to subhumid), `steps-mid` (temperate, standard, semiarid), `tread` (cool, standard,
arid), `steps-high` (cool, thin, arid), `floor` (tropic, dense, humid; Korona's). What `CROPS.at` returns there today
(queried 2026-11-10):

| Zone | Buckets that grow (rain-fed unless marked) |
|---|---|
| **lake** | grain (emmer, basin amaranth; rice irrigated), pulse (tepary, helix bean), tuber (sweet potato, murnong), nut (pistachio, almond, pinyon, acorn), oil (whorl olive, avocado), fruit (apricot, pomegranate, fig, persimmon, citron, canyon grape, ironplum), dried fruit (carob), spice (saffron, juniper, umbel seed), beverage (tea and coffee irrigated, rattlepod), sweetener (tamarisk manna), greens, herbs |
| **steps-mid** | grain (emmer, basin amaranth; frostoat irrigated), nut (pistachio, almond, pinyon), fruit (apricot, canyon grape), berry (serviceberry, sunthorn), spice (saffron, juniper), beverage (ivanchai) |
| **tread** | tuber (snow potato, sweetroot), herb (goldroot), reagent (bearroot), spice (juniper); irrigated only: berry (crowberry, rowan, serviceberry, sunthorn), fruit (apricot, crabapple), grain (bistort), nut (stone pine), greens (mountain sorrel) |
| **steps-high** | the tread's list less the apricot: thin air |

The Kingdom eats from the lake tread: **irrigated terraces** stepping up every riser and canyon (the Outlands plan named
Yemen's and the Ifugao's), emmer and amaranth, tepary beans, pistachio and almond, olives, apricot and pomegranate, saffron
as its dear crop. The treads give fodder and the cold tubers. *Proposed* new native records: the shelf oak's mast (`nut`),
the step palm's fibre (`cordage`, also `thatch`), the stair lily's rhizome (`tuber`), the band lichen's purple (`dye`), the
step moss's lime (`reagent`). `CROPS.canPlaid('tiers')` should pass with saffron's yellow, the lichen's purple and the
pomegranate's brown: check at build.

### Animals (`kits/fauna`, as `BIO.record` records)

Mostly Earth-like, as fits a settled transition country. *Proposed:* ibex and tahr on the risers; marmots and pikas on the
treads; swifts and cliff swallows nesting on every riser; grebes, herons and a lake fish (a carp-like grazer, the lake
villages' catch) on the upper lake; kites and vultures on the risers' updrafts; the **golden bird** (sacred, the Outlands
plan) on the same thermals; the **runner bird** (the trickster's form) on the roads. Kept: the Kingdom's goats, fat-tailed
sheep and **ostriches** (the Outlands' bird, bred here for feathers and meat). Korona's animals keep to the floor; the
Outlands' hexapods do not live here.

## 5. Dangers

Each maps to a `KHAZ` kind (`core/hazard/README.md`).

| Hazard | Where | `KHAZ` |
|---|---|---|
| **Rockfall** off the risers' caps | every riser foot, the talus | `crush` |
| **Cliffs** | riser edges, canyon rims, the lip | `fall` |
| **Flash floods** (storms on the treads drain into the box canyons) | Wūn-Gèl, Tsēk-Gèl, every canyon floor | `drown`, `crush`, timed: the shared gorge-flood amendment (the Outland Gate's) |
| **The fall** | the lip's pool and the river below it | `drown` |
| **Wet tufa** | the step moss's dams and every seep | `slip` |
| **Cold and thin air** | the high steps and the crown (to -35 °C, 0.62 atm) | `KHAZ.provide('temperature')`, `'pressure'`; `cold` records in the frost hollows |
| **Summer heat** | the floor and the canyons' sunny walls (41 °C) | `'temperature'` |
| **Dust storms** on the great tread | the treads | weather (`core/atmos`), a `slip`/push on exposed ground is kit work |
| **The traps** | the floor and the east riser's wet poor ground (Korona's rule) | Korona's `trap` and `KTRAPS` records, read in place |
| **The law** (the toll, the seed law, the golden bird's feathers) | the Kingdom | not a `KHAZ` kind: the open world's faction rules |

The Tiers are the placid country the owner asked for: **no gas, no vents, no lava, no luck hazard.** The risks are the
cliffs, the cold up top and the floods in the canyons.

## 6. People: the Kingdom of the Tiers

- **The Coyote Men's most organized polity** (the owner, 2026-11-10), among the lakes and canyons. The **Coyote Kingdom**
  polygon is the region (92% of it). **The Tierhounds are Coyote Men** (the owner, 2026-11-10): the Coyote Men of the
  Tiers, one people with the four tribes of the Outlands (the Outlands plan's "hound-headed kin" proposal is dropped).
  *Proposed:* "Tierhound" is what the Izani call the Kingdom's people; `kits/coyote` and `peoples.json` draw one people.
- **What they are** (from the Outlands plan, settled 2026-10-26): therians, coyote-headed, digitigrade, upright; stone and
  bronze age (the Kingdom the bronze-age heart of it); they **bark the Hum** (the Coyote-bark dialect; every river here
  has a Hum name) and carve it in **contour carvings** on milestones and the risers. Their gods: **the trickster**, the
  runner bird, and **the phoenix**, the golden bird.
- **The Kingdom:** the capital in Coyote Canyon over the lake (the owner, 2026-11-10); *proposed*, lake towns and fishing
  villages on the upper lake's shores, terrace villages up every riser and canyon, herders who take the flocks up the stair
  in summer and down in winter; **Howl**, the smaller village closer to the Gate (the owner, 2026-11-10), on the Hounds'
  Road (section 8); and the Gate itself, **a frontier post** (the owner, 2026-11-10): the toll fort and long wall at the
  Narrows (`biomes/outlandgate`), garrisoned and supplied by the road through Howl. Its wealth is the Outlands' trade it tolls, saffron, the lichen purple, ostrich feathers and wool.
- **Settlements** (the scale model's and the culture kit's; this kit draws plain records until `kits/coyote` exists):

  | Place | Px | Ground | On | What (*proposed*) |
  |---|---|---|---|---|
  | **Coyote Canyon** (the model's village; **the capital**, the owner, 2026-11-10) | 1265,500 | 1,603 m, 1.31 atm, BSh 282 mm, 20 °C (28 / 11); 947-3,380 m within 8 km | `core/city` | **the Kingdom's seat**: a stepped town built down the walls of a box canyon cut into the great riser, the king's house at the canyon head over the spring, terraced gardens on every ledge, the trickster's shrine, contour carvings on the walls |
  | **Howl** (the owner, 2026-11-10, the site too) | **1393,283**, where the Hounds' Road comes down into the gap, 130 km by road north of the Gate | 1,745 m, 1.29 atm, Cfa 1,129 mm, 18 °C (28 / 8), extremes 24 / -5; 1,579-2,254 m within 8 km | `core/hamlet` (`KHAMLET.village`) | the Kingdom's last village before the Gate: the road station and the fort's larder, pack-ostrich pens, a runners' post, the trickster's shrine at the road's foot; outside the Tiers' polygon (in the Outland Gate's), as the fort is |
  | lake towns and fishing villages | the upper lake's north and east shores (1262,512; 1272,522) | 1,150-1,320 m, Csa and Cfa | `core/hamlet` (`KHAMLET.village`, fishing and farming) | reed boats, fish weirs, the shelf-oak woods, terraced fields up the riser |
  | terrace villages | the canyons (Yūt-Hām, Lām-Kē, Kū-Kē, Wūn-Gèl, Tsēk-Gèl's upper reach) | 0.8-2.2 km | `core/hamlet` (farming) | spring-fed terraces, step-moss channels, olive and apricot |
  | herders' camps | the great tread and the high steps (summer), the middle steps (winter) | 2.7-5 km | `core/camp` (`KCAMP`) | goat, sheep and ostrich herds; seasonal camps that move with the treads |
  | shrines, milestones, the stair roads | every riser | | `core/tags` records | cut stairs and switchbacks up each riser, contour-carved milestones, cairns |

- **NPC places and player outposts stay apart** (the owner's rule: an outpost is a player settlement). The kit writes
  `biomes/tiers/outposts.json` candidates for the open world's registry (`openworld/outposts`, on its branch) and draws
  nothing for them. *Proposed* candidates, each away from the Kingdom's keep-clears: a canyon-head spring on the east
  riser (Cfa, 1,286 mm), a bench on the lake's quiet south-east bay, a spring on the middle steps' Dsb pocket (1276,553:
  3,231 m, 596 mm).
- **`core/simulation`:** the Kingdom as one polity with its towns and villages on the sim; the Gate's toll as its income;
  trade by caravan with Korona's tribes and the crater (section 8). The names (the seat, the king's line, the lakes, the
  steps in Hum) are open.

## 7. Resources

*Proposed*, read at build from `kits/resources`: **copper** in the red beds (the Outlands' walls carry green copper bands,
and the same beds outcrop on the Red Step) and **salt** on the floor's margins (Korona's salt basins). The Kingdom's
bronze comes from its own copper and tin bought by the Gate. No emerald or turquoise: those stay the Outlands'.

## 8. Roads and links

Measured on the model (2026-11-10): shortest paths under a height cap, and the lowest crest between two points (a flood
fill on the heights with lake levels).

- **Inside the Kingdom:** the **stair road** from the lake to the great tread up the Black, Red and White Steps (cut
  stairs, switchbacks and contour-carved milestones); the lake road round the upper lake; the canyon roads. From the
  great tread's edge (3,912 m at 1275,495) Coyote Canyon is 24 km and 2.3 km down.
- **To Korona and the crater: open and low.** West of the lake tread the ground falls to 1,116 m at 1183,462; the lakes
  reach the crater's lowlands under about 1.75 km. This is the Kingdom's front door: Korona's tribes, the Painted Men, the
  crater's caravans.
- **To the Gate: the Hounds' Road** (*working name*; the owner asked for an easier road than the way round Spider Lake,
  2026-11-10). The model has a way under 6.5 km that the first draft missed (it searched too small a window): north from the
  great tread over the Tiers' crown, down into the NE outer wall's **Vitreous Hollow**, along the Outer Wall's back, and
  down into the gap north of the Narrows. With **one cut** (section 8a) its top is **6.0 km**. From Coyote Canyon:

  | Leg | Km (from Coyote Canyon) | Line (px) | Ground | What |
  |---|---|---|---|---|
  | **1. The stair** | 0-121 | 1265,500 up to 1254,444 | 1,603 m to 4.9 km; BSh, BWk, Dsc, ET | the stair road up the Black, Red and White Steps and the great tread |
  | **2. The crown's shoulder** | 121-303 | 1254,444 by 1241,416 and 1213,388 to 1204,374 | 4.9-6.0 km; ET, EF; -1 to -6 °C | the frozen steps; leaves the Tiers at km ~280 (the north-west corner, the Arachnoids' after the trim) |
  | **3. The Cut** | 303-335 | **1204,378 to 1208,363** | cut to 6.0 km from 6.05-6.42 km (16 cells, up to 418 m deep) | the one map edit: a notch through the crest, the road's highest point, 0.76 atm |
  | **4. Down to the Vitreous Hollow** | 335-448 | 1211,362 by 1239,341 to 1253,327 | 6.0 km down to 3.57 km; EF, ET, then Dfb at 2,306 mm | the halfway house: the NE outer wall's warm cauldron tarn (its station 1, 1258,326, 2,950 m, 1.11 atm) |
  | **5. The wall's back** | 448-682 | 1267,313 east along y 296-300 to 1351,281 | 5.5-6.0 km for ~200 km; EF; -7 to -9 °C, 1,900-2,200 mm (snow) | the hard stretch: the Outer Wall's back, near the Portal Valley's head (1330,295) |
  | **6. Into the gap** | 682-771 | 1351,281 by 1365,278 to 1393,281 | 5.5 km down to 1,677 m; Dfc, then Cfa | the descent to the gap's floor and **Howl** (1393,283) |
  | **7. Up the gap** | 771-898 | 1393,281 by 1421,309 to 1438,326 | 1,447-1,690 m; Cfa, 988-1,129 mm | the gap's floor south to the Gate |

  **898 km, top 6.0 km** (446 km over 5 km, 388 km over 5.5 km). Without the cut the same line is 870 km with its top at
  6.5 km (0.71 atm, three crests of 6.45-6.5 km). It is 530 km shorter than the north road and 2 km lower than the old
  pass. A hard mountain road, but a road: caravans of pack ostriches and goats in summer, runners all year, the Vitreous
  Hollow and Howl as its stations.
- **The other ways to the Gate:**
  - **The north road** (the low way): about **1,430 km** from the great tread to the Narrows, **crest 3,912 m**. West
    and north round Korona's northern edge (the crest is at 1077,400, BWk), down to 1,742 m at 1111,309, through the NE
    outer wall's north-west lowland to Spider Lake's shore (1295,183), then up the gap from its mouth (1341,229) to the
    Narrows (1438,326). From Spider Lake it is the god's road.
  - **The old pass** (the high way): **720 km**, **358 km of it over 7 km**, crest **8,037 m at 1410,414** (0.59 atm, the
    Gate's old pass): up the high steps and the crown, along the Outer Wall's back at 7.1-7.8 km, over the pass, down the
    wall's east side to the gap. A summer runners' way, not a supply road.
  - The heavy trade can still take the north road (it shares the god's road from Spider Lake); the Hounds' Road is the
    Kingdom's own way to its frontier post.
- **To the Outlands:** only by the Gate. The N Outlands touch the Tiers' crown at 7 km (1258-1272, 411-417), with the
  Outer Wall's airless crest beyond.
- **To the east:** the great tread runs on into the e badlands' plateau at 4.2-4.6 km without a step (the overlap,
  section 12).
- **To the abyss:** the breach canyons from the floor south to the East Abyss (Furrow, 1276,639).

## 8a. The map edit (for the next model pass; the owner, 2026-11-10)

A scale-model session makes these in one script (the `edit_511.py` pattern: the specs as constants, every other cell of
every raster checked unchanged at the end, refuses to run twice), then writes the live artifact's database copies.

1. **The upper lake's sill.** The rim cells under the lake's level (79 of 140, along the west and north-west shores; the
   lowest 284 m at 1246,531, the north shore's 1,015-1,132 m at 1252-1260, 515-517) are raised to 1,160-1,200 m, a basalt
   lip, **except one notch at 1246,531 held at 1,150 m**: the outfall and the fall's head (station 3). The ground west of
   the lip stays as it is, so the fall drops about 850 m. The lake's `wl` level stays 1,150 m. The lower lake (Korona's) is
   left alone.
2. **The Cut.** Cells 1204,378 to 1208,363 along the road's line (16 cells, one wide, now 6,046-6,418 m) are lowered to
   **6,000 m**, eased into the slopes either side; temperatures lapse with the surface (`smodel.climate.lapse`), and rain and
   class follow (`reclimate`).
3. **The markers.** **Coyote Canyon** (`soksvzt1h9`): type `village` becomes `city`, with a note ("The capital of the Coyote
   Kingdom, the Tierhounds' seat, in a box canyon over the Lake of the Tiers; biomes/tiers/PLAN.md"). **Howl**, new: a
   village at 1393,283 (the owner, 2026-11-10), note "The Coyote Kingdom's last village before the Gate, where the Hounds' Road comes
   down into the gap".
4. **The road.** The Hounds' Road as a route record beside the god's road (`openworld/gods-road.json`'s shape, written by a
   `god_road.py`-like script): the line of section 8, with its legs.
5. **The trims** (section 12): Korona / NE's east edge to the Tiers' west edge; e badlands' north-west corner to the Tiers'
   edge; the Tiers' north-west corner (y < ~445, x < ~1293) to the arachnoid canyons; the N Outlands' and the NE outer
   wall's slivers to the crest. Each polygon edited in `51-region-store.js`, `openworld/*/source/regions.json` where it
   appears, and the live database.

## 9. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2. Each page is the usual 5.2 km square.

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **The Lake of the Tiers** (`dist/tiers.html`) | **1262,512**, the upper lake's north shore | shore 1,318 m to the water at 1,150 m; 1.36-1.39 atm; Csa, 455 mm, 20 °C (28 / 13), extremes 35 / 5; 988-1,842 m within 8 km | the placid lake: still water to the horizon, ladder-reed beds and stair lilies in the bays, the shelf-oak woods and step palms on the shore, a fishing village and its terraced fields climbing the riser (records), the east riser green with its rain across the water and the coloured steps rising behind |
| 2 **Coyote Canyon** (`-canyon`) | **1265,500** | 1,603 m; 1.31 atm; BSh, 282 mm, 20 °C (28 / 11), extremes 37 / 3; 947-3,380 m within 8 km | the box canyon in the great riser and the Kingdom's seat on its walls (records until `kits/coyote`): the spring at the canyon head, the step moss's tufa dams down the floor, ledge heath striping the walls, tier candelabras on the sunny side, irrigated terraces, contour carvings; the great tread's rim 1.8-2.3 km overhead, 20 km up-canyon |
| 3 **The Lip** (`-lip`) | **1247,530**, the notch at 1246,531 | the lake at 1,150 m over the floor at ~280 m; the Yūt-Hām's canyon about 16 km south; the lake tread's Csa above, the floor's Am below (1243,524: 159 m, 1,490 mm, 26 °C) | the lake's one outlet: the sill of black basalt, the fall of about 850 m over the Black Step, the spray forest at its foot, the floor's rainforest beyond (Korona's, read in place): the stair's two climates on one page. **Waits on the map edit's sill** (section 8a) |
| 4 **The Great Tread** (`-tread`) | **1310,490**, by the dry Chūng-Gèl (1311,498) | 4,637 m on the high steps' first tread, the great tread below and the next step above; 0.90 atm; Dsc, 31 mm, +2 °C (15 / -11), extremes 25 / -21; 4,349-5,039 m within 8 km | the cold stair: tiergrass on terracettes, stack cushions and pagoda bush on desert pavement, buttes standing off the risers, band lichen on the cliffs, a dry wadi cut 300-480 m into the tread, a herders' summer camp (`KCAMP`) with its flocks; the crown's ice on the skyline and the lake's haze 3.5 km down and 120 km south-west |
| 5 **The fertile basin** (shared; **owned by `biomes/korona`**, its station 3, built) | 1229,558 | the lower lake, 380 m; Af | Korona's page: the floor under the stair. This kit lists it and reads it as its far field |

**Station 1 comes first** (the owner, 2026-11-10): it is the owner's picture (the placid lake), it needs no map edit, and it shows the kit's
signature (the coloured steps from below, the tiered plants) with the least new core. **Optional later:** **the Breach**
(Tsēk-Gèl at the abyss's rim, 1197,600, -449 m, BSh), the stair's last step into the East Abyss.

## 10. Core adoption (written first, as the working rules ask)

Start from **`biomes/korona`** (the station build: `build.py --station`, `station.json` with `out`, `core`, `kits`,
`packs`; the kits read in place) and **`biomes/ebadlands`** (its strata, staircase canyons and cold-desert zones).

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the treads and risers | `core/terrain`: `KRELIEF.tableland`, `joints`, `scarp`, `talus`, `pavement` + `paintCover`, `wadi` (+ `fan`) | the steps, their cliffs and joints, the riser feet, the treads' pavement, the box canyons |
| the coloured beds | `KSTRATA` (`create`, `vary`, `drape`, `ledgeField`) | the Black, Red, White and Grey Steps; the ledges for ledge heath and band lichen (amendment 1) |
| outliers | `KSTACKS` (mesas, buttes, `contour`) | the buttes standing off each riser |
| overhangs | `KCARVE` (`core/terrain/36-core-carve.js`) | seep alcoves, the canyon heads |
| water | `core/water` (`WATER.open`, `shore`, `flow`, `fall`, `spring`, `terraces`) | the upper lake, the lip's fall, the Yūt-Hām, the springs, the step moss's tufa dams |
| ice | `KGLACIER`, `KFROST` | the crown |
| ground, far | `KGROUND`, `KHORIZON`, `KFAR` | cover masks; the Outer Wall and the abyss past the map |
| flora | `core/biome` | the 12 natives; read in place: ebadlands, sedesert, necanyons, ehighlands, Korona, the Outlands (gardens) |
| sky, weather | `core/atmos` (`ATMOS.bindHost`, the wave field, `skylight`) | the standard sky with the giant over Korona; dust on the treads; the lake's calm |
| hazards | `core/hazard` (`KHAZ`) | section 5 |
| people | `core/city` (the seat), `core/hamlet` (villages), `core/camp` (herders), `core/simulation` (the polity) | section 6; plain records on `core/tags` until `kits/coyote` |
| crops, resources, fauna | `kits/crops` (a `tiers` entry), `kits/resources`, `kits/fauna` | sections 4 and 7 |
| player outposts | `openworld/outposts` (`outposts.json` candidates) | section 6; nothing drawn |
| host, tags, space, mask, export, materials, shadows | `core/host`, `core/tags`, `core/space`, `core/mask`, `core/export`, `core/materials`, `core/shadow` (off at load) | as every kit |

Write no PRNG, noise, `getImageData`, water shader or sky dome. `tools/check_core_use.py` must pass. Fragments are tagged in
`PORT.md`; data fragments stay free of the browser.

**Core amendments needed:**
1. **A `tiers` strata recipe** (`KSTRATA`): hard caps (basalt, pale sandstone) over soft coloured beds, one cap per riser,
   with ledges; check whether ebadlands' staircase canyon recipe (`S.terrace`) is enough before proposing code.
2. **Tiered plant parts** (kit work first): a whorl of flat branch plates, stacked collars, stepped domes, arm rings.
   Lift to `core/biome` if a second kit asks.
3. **Terracettes** (small, new): the level soil steps that line grazed slopes, as a `KRELIEF.shape` form beside
   `pavement`, with a lip line the tiergrass reads. Kit work first.
4. **The gorge flood** on a cycle (shared hazard amendment; the Outland Gate plan's amendment 2).
5. **The lip's fall**: the sill is on the model after the map edit (section 8a); the page draws the fall on `WATER.fall`
   (tall falls) and the sill's face with `KRELIEF.scarp`.
6. **The player-settlement registry** (shared, open world; `openworld/outposts`).
7. **`kits/crops`**: the `tiers` entry and the five native records (section 4).

## 11. Textures

**Reused from the library** (`core/materials/library/`): the steps' rocks `rock.basalt.vesicular`, `rock.basalt.oxidised`,
`rock.columnar` (the Black Step), `rock.sandstone.bedded.red`, `rock.badland.bedded`, `rock.sandstone.red` (the Red
Step), `rock.sandstone.navajo`, `rock.sandstone.varnish`, `rock.tuff` (the White Step), `rock.rock_wall_11`,
`rock.tafoni`; the treads' grounds `ground.pavement.desert`, `ground.steppe`, `ground.puna`, `ground.wadi.cobble`,
`ground.gravel019`, `ground.slickrock`, `ground.tundra`, `ground.turf.polygon`, `ground.snow011`, `ice.glacier`; the lake
and the canyons `ground.reedbed`, `ground.lakebed.algal`, `ground.lakebed.shells`, `ground.redsoil`,
`stone.travertine.tufa`, `ground.travertine.white`, `ground.moss001`, `ground.terrace.field`, `ground.tilled`; the
plants `card.palm.fan`, `bark.palm`, `bark.skirt`, `card.reed`, `card.wingreed`, `card.heath`, `skin.cactus`,
`card.saltbush`, `surface.cushion`, `card.stipa`, `card.ichu`, `rock.lichen.circles`, `card.giantpad`, `card.pine.b`,
`bark.pine.scale`, `bark.juniper`, `card.juniper`; the records until `kits/coyote`: `earth.adobe`, `earth.rammed`,
`stone.sandstone.ashlar`, `stone.cut`, `roof.thatch.reed`, `fibre.reedmat`.

**New** (3 prompts, `core/materials/PROMPTS-NEEDED.md` section 50): `card.shelfoak` (the shelf oak's tier plates, a
sheet of nine), `bark.tiered` (its grey bark with branch-collar rings), `rock.lichen.ledges` (the band lichen on a
riser's ledges). Until they come: `card.broadleaf.dry`, `bark.smooth` and `rock.lichen.circles`, tinted; said so in the
kit's `KNOWN_ISSUES.md`.

Adoption: `biomes/tiers/materials.json` and `python3 tools/textures/pack.py biomes/tiers` (commit `tex/`).

## 12. Overlaps, and how to settle them

Cells of the Tiers inside other polygons, measured on the region store (2026-11-10). **Settled as proposed** (the owner,
2026-11-10); the trims go in the map edit (section 8a, item 5).

| Polygon | Kind | Overlap | Where | Settled |
|---|---|---|---|---|
| **Korona / NE** (`rmuqm3urh0mo6`) | biome | **20,619 cells, 64% of the Tiers** (19% of Korona) | 1158-1343, 384-607: the lakes, Coyote Canyon, the great tread's west | **The Tiers win their polygon:** trim Korona's east edge to the Tiers' west edge. Korona drew its polygon before the Tiers had one (Korona's "high cold country stays Korona's", 2026-10-19, came a week before the Tiers' polygon, 2026-10-26). Korona's **station 3, the fertile basin** (the lower lake, built) stays Korona's page and is listed here as shared, as the Nursery Bench is between the Outlands and the Gate |
| **arachnoid canyons** (`rmvarachnoids`) | biome | 4,683 cells, 15% (4% of it) | 1158-1293, 382-444: the north-west corner, median 4,911 m, ET | **Give the corner to the Arachnoids:** trim the Tiers to about y 445 there. It is radial-fracture ground on the Outer Wall's flank, not a stair, and no station of this plan stands on it |
| **e badlands** (`rmuqm20f95x4v`) | biome | 4,667 cells, 15% (8% of it) | 1284-1380, 510-601: the south-east, median 4,231 m, BWk | **The Tiers win:** trim e badlands' north-west corner. No e badlands station stands there (its tundra station is at 1374,623, outside) |
| **The Tiers** (`rmucfm4y5yd6y`) | geographic | 8,632 cells (63% of it) | 1173-1281, 451-599: the lakes and the floor | **Kept as the heartland's label** (the lake tread and the floor); it carries no kit |
| N Outlands (`rmvp5489oiy6z`) | biome | 41 cells | 1258-1272, 411-417, the crown at 7 km | trim to the crest: no change to either plan |
| ne outer wall (`rmvymakpc0pft`) | biome | **3 cells** | 1209-1211, 382-383 | none needed: the NE outer wall plan's worry (its section 9, "overlaps") does not hold for the Tiers; the two only touch |
| Coyote Kingdom, Nomad Country, big demo, little demo | political, geographic | | | labels, no trim |

The trims are a scale-model session's work (section 8a, item 5).

## 13. For the owner

**Settled (the owner, 2026-11-10):**
1. ~~The Tierhounds~~ **are Coyote Men** (section 6).
2. ~~The seat~~ **Coyote Canyon is the capital**; the smaller village of **Howl** stands closer to the Gate (sections 6, 8a).
3. ~~The Gate road~~ **The Gate is a frontier post, with an easier road than the way round Spider Lake**: the Hounds' Road,
   898 km from the capital with its top at 6.0 km after one cut (section 8). The Outland Gate plan's "3.9 km" line is
   corrected.
4. ~~The upper lake's lip~~ **Fixed on the model at the next model pass** (section 8a, item 1).
5. ~~The overlaps~~ **As section 12 proposed.**
6. ~~The flora's rule~~ **Everything grows in tiers.**
7. ~~The air curve~~ **Copper Glacier's.**
8. ~~Which station first~~ **Station 1, the Lake of the Tiers.**

9. ~~Howl's site~~ **In the gap, at 1393,283**, where the Hounds' Road comes down (1,745 m, Cfa, 18 °C, 130 km by road
   north of the Gate): the fort's larder and the road's last stop. The Vitreous Hollow stays a road station, not a village.

**Still open:**
10. **The Cut.** *Recommended:* make it (16 cells, up to 418 m, the road's top from 6.5 to 6.0 km). Without it the road
    still works at 6.5 km.
11. **Names:** the Hounds' Road, the lakes, the steps, the capital (in Hum), the king's line. The English names are working
    names.

## 14. Order of work

| Phase | What | Done when |
|---|---|---|
| **T0** | this plan; the owner's answers (2026-11-10: done but questions 10-11) | the owner's yes |
| **T1** | the map edit at the next model pass (section 8a: the sill, the Cut, Coyote Canyon and Howl, the Hounds' Road, the trims); `LORE.md` (the Kingdom, with the Outlands' O1 entry); `biomes/README.md`, `WORLD.md`, `INDEX.md` rows | the edit's report checks every other cell unchanged |
| **T2** | textures: the three new sets; `materials.json`; `pack.py` | the contact sheet passes in the demo kit |
| **T3** | **station 1, the Lake of the Tiers**: the kit's fields and zones, the strata recipe, the natives of the lake tread, the lake, the village as records | `verify.py --assert`, `check_core_use.py` |
| **T4** | stations 2 and 4 (Coyote Canyon, the Great Tread); terracettes; the `tiers` crops entry; `outposts.json` | each verified |
| **T5** | station 3, the Lip (after the map edit's sill); the gorge flood when the shared amendment lands | verified |
| **T6** | `PORT.md`, the index tools, the Godot export check, the gallery (the owner allows once) | published |

## Sources

- The model's data on `main` (`tools/scale-model/model/data`: `h`, `wl`, `c`, `p`, `tm`, `tw`, `tc`, `th`, `tl`;
  `rivers.json`, `outlets.json`, `vents.json`, `tubes.json`, `volc.json`, `basins.json`), read with `smodel.page`,
  2026-11-10; `model/src/51-region-store.js` (the polygons), `60-settlements.js` (Coyote Canyon, Furrow); the routes by a
  flood fill on the heights with lake levels (the lowest crest), shortest paths under a cap, and a least-carve search;
- `smodel/tranche2_biomes.py` (step 1A, the six treads), `smodel/river_names.py` and `river-names-5.1.md` (the Hum
  names), `extract_region.py` (`'tiers'` mapped to the Outlands' flora, listed with the tablelands);
- `biomes/outlands/PLAN.md` (sections 6, 10), `biomes/outlandgate/PLAN.md` (section 5), `biomes/neouterwall/PLAN.md`
  (sections 1, 9), `biomes/korona/NOTES.md` (the Tiers' lakes, the borders, the high cold country), `biomes/ebadlands/
  PLAN-STATIONS.md`, `biomes/necanyons/PLAN.md`;
- `kits/crops` (`CROPS.at`, queried in node 2026-11-10), `core/README.md` (`KRELIEF`, `KSTACKS`, `KSTRATA`),
  `core/hazard/README.md`, `LORE.md` 6.18 (Korona, the Hum, the contour carvings).
