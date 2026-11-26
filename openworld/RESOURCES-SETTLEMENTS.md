# Resources of every settlement: a census of the likely producers

The owner (2026-11-11): "scope all current and planned settlements' nearby resources, both agricultural, mineral, and
otherwise, and give me a census of the best likely producer of each good." The numbers are in
`openworld/resources-settlements.json` (one record per settlement); this file reads them.

## 1. Method, sources and caveats

**The settlements (120).** Every pin on the scale model 5.1 (`tools/scale-model/model/src/60-settlements.js`: `defSetts`, with
the `SETT_ADDED` and `SETT_MOVED` versions applied), **including today's pin batch** (`SETT_MOVED['5.1e6']`, commit
f377baf4d; `PLAN-SETTLEMENTS.md`, "The pin batch"), so Verge, Mungo, Shade, Mav's Refuge, Roketstad, Jimjam, Dalab,
Ys, the Hexahedron and Reed stand at their new pins and the **Tabist town** (`seur98e8mv`, 1270,666, name to come) is in. Marked
† in the tables. Two moves on other branches are applied by hand: **Longsong** 1229,1621 (on the Bīruk al-Ghaym, `5.1e7`) and
**Strongbow** 1001,1596 (`5.1e5`). Loj Twenny is read at today's pin (its great-shaft pin is on its branch). One new outpost:
the **Singing Gjár** (1572,1643). The isle demo's Nephtos has no pin and is left out. The `openworld/SITES.json` sites are all on
the model already; their culture is carried. Polity: the polygon of `kits/resources/data/geology.json` the pin falls in.

**Reach** (a disc round the pin): city 30 km, town and arcology 20 km, village, outpost, cavern and ruin 10 km. Arcologies
were not given a reach in the brief: they take a town's 20 km here. Ruins and ruined arcologies (32) are profiled but **left
out of the census** (nobody farms or mines there; Stair's campground of a couple of hundred is the exception, noted where it
matters). The census is over the 88 living and planned settlements.

**Geology** (`kits/resources/data/geology.json`, read the way `RES_GEO.prospect` does: data cell i = floor(px x 0.5 + 0.5)): for
each of the 26 families over the reach's **land** (water cells skipped: no mine under the sea), the mean byte, the max, the area
at 100 and over ("good") and at 170 and over ("rich"), in km². For the 16 node families, **node-yield**: the expected output of
the field's candidates, by the rule `45r-res-field.js` places them (kept with probability p/255 in each family's own cell, the
grade tilted by p: high yields 2, medium 1, low 0.5), summed over the reach. It reads as "medium-grade nodes' worth"; gold and
tin add their river placers (high 2, medium 1, low 0.5 each). For the rock families (no node kind) the score is the area-weighted
byte, in km²-equivalents. Also the provinces, the ruin ground (the province byte's ruin bit) and the vents of `model/data/vents.json`.

**The model's climate** (`smodel.page.load()`: `h` heights and water flag, `c` climate class, `p` rain 0-4,000 mm, `tm` mean
temperature, `rivers.json`, `basins.json`), each px 2 km:
- **Farmland**: `core/world/49r-world-resources.js` `farm(x,z)` on the model's cells: warmth (smooth 2-9 °C up, 29-38 °C down) x
  water (rain 200-800 mm up, 2,600-4,500 mm down, or a perennial river's px) x flat x soil (bare rock on steep cells, dunes in a
  desert under 250 mm, the salt steppe XS, cold). The 2 km slope is tripled to stand for the ground's own. Reported as the
  mean, the km² over 0.5 and 0.7, and **farm-eq km²** (the index summed x area), which is what the census ranks.
- **Pasture**: a grazing weight per climate class (savanna, steppe, temperate grass high; jungle, desert, ice low) x not steep x rain.
- **Timber**: a forest weight per class x rain (350-1,100 mm), blended 60/40 with the geology's `wood` byte (which disagrees in
  places: Qiblai's Af forest has a wood byte of 64).
- **Fish**: sea (the Ring Sea at -1,500 m and the Farside Ocean), fresh lake and salt lake km² in reach (salt lakes count .15),
  plus the largest perennial river and the km of river.
- **Salt**: rock-salt (halite) node-yield, salt-lake brine, the salt steppe (XS), sea pans (the Ring Sea counts as sea), potash and
  soda as minor.
- **Fresh water**: the geology's `water` byte, the biggest river in reach, fresh lakes and rain.

**Crops**: `kits/crops` `CROPS.at` (node, on the kit's own fragments and `core/rand`) for every climate band (warmth x aridity x
pressure) the reach's farmland falls in, each px on its own climate. Warmth from the mean temperature (polar < 0 °C, cool < 8, temperate < 14,
subtropic < 20, tropic < 29, hot), aridity from rain over Turc's evaporation L = 300 + 25T + 0.05T³ (< .25 arid, < .5
semiarid, < .9 subhumid, < 1.6 humid, wet), air pressure from height (1.6 atm x e^(-h/8 km), the open world's rule): thin < 0.8,
dense > 1.3. `wet` when a lake, the sea or a river of 5 m³/s is in reach, `salt` when salt ground is, `heated` when a vent is.
A crop's score is the farm-eq km² of the ground whose climate fits it, x the fit there (rain-fed 1; irrigated .5 with water in
reach, else .15); a group's is its best crop's. A crop that fits only the pin's own point is listed with a score of 0.

**Caveats.** The geology is 4 km cells: a deposit smaller than a cell is not in it, and a reach of 10 km sees only ~20 cells.
The farmland is an **index, not a yield**: it ranks ground, it does not count harvests, and the 2 km grid cannot see a terrace or
a valley floor narrower than a cell. The crop fit is **from climate only** (warmth, pressure, aridity, wet, salt): no soil, no
biome kit's native list (`home`), no culture. Placers, vents and rivers are the model's records. Scores rank within a good;
they do not compare goods. A bigger reach gathers more, so cities lead most tables by area alone: the "why" says whether it is
richness or size.

## 2. The census: the best likely producer of each good

Each row: the best, then the next two. For the ores the score is the **good-ground node-yield** (from cells of 100 and over,
where the medium and high grades come from; placers of medium and high grade added), with the all-grade yield after it: a
wide reach of thin ground (the bedded rock salt at byte 25, the sedimentary iron at 40) gathers many low-grade nodes, but
it is the good ground that makes a mining town. A family where no settlement reaches a cell of 100 ranks by the all-grade
yield (score 0). Elsewhere km²-eq, as in section 1.

### Minerals and fuels (the 16 node families)

| Good | Best | Next | Third |
|---|---|---|---|
| iron ore | **Yuni** (Yuni Emirate): 184; all grades 184.7, rich 784 km², peak 180, granite 41% | **Spirladunon** (Talovolci Chiefs): 170; all grades 172.0, rich 752 km², peak 180, impact 46% | **Verge†** (Yuni Emirate): 155; all grades 156.0, rich 444 km², peak 180, crystalline 54% |
| copper | **Zey'danin** (no polity on the map): 79.7; all grades 79.7, rich 1440 km², peak 210, volcanic 96% | **Nulab** (Dalab Council): 53.2; all grades 53.2, rich 0 km², peak 120, rift 98% | **Sauropolis** (Lizardmen): 46.5; all grades 46.5, rich 0 km², peak 120, rift 96% |
| tin | **Tallwalls** (no polity on the map): 86.7; all grades 94.0, rich 1668 km², peak 200, granite 59% | **Farport** (Eternal State): 66.2; all grades 75.2, rich 1196 km², peak 200, placers 2/0/0 (h/m/l), granite 56% | **Yuni** (Yuni Emirate): 62.3; all grades 74.8, rich 1160 km², peak 200, placers 1/0/1 (h/m/l), granite 41% |
| nickel (with copper, platinum) | **Spirladunon** (Talovolci Chiefs): 14.9; all grades 28.1, rich 268 km², peak 220, impact 46% | **Talia** (Empire of Iziz): 14.2; all grades 17.6, rich 284 km², peak 220, sedimentary 88% | **Arcbeam** (Empire of Iziz): 10.3; all grades 11.7, rich 192 km², peak 220, sedimentary 98% |
| gold | **Tallwalls** (no polity on the map): 36.4; all grades 36.4, rich 0 km², peak 110, granite 59% | **Yuni** (Yuni Emirate): 34.8; all grades 35.3, rich 0 km², peak 110, placers 0/1/1 (h/m/l), granite 41% | **Verge†** (Yuni Emirate): 34.7; all grades 34.7, rich 0 km², peak 110, placers 2/0/0 (h/m/l), crystalline 54% |
| silver | **Tallwalls** (no polity on the map): 36.4; all grades 36.4, rich 0 km², peak 110, granite 59% | **Yuni** (Yuni Emirate): 33.8; all grades 33.8, rich 0 km², peak 110, granite 41% | **Zey'danin** (no polity on the map): 33.8; all grades 33.8, rich 0 km², peak 150, volcanic 96% |
| rare earths | **Nulab** (Dalab Council): 40.6; all grades 40.6, rich 1876 km², peak 190, rift 98% | **Sauropolis** (Lizardmen): 35.5; all grades 35.5, rich 1640 km², peak 190, rift 96% | **Erehwon** (Xanadu Sultanate): 35.2; all grades 35.2, rich 1624 km², peak 190, rift 100% |
| coal | **Mav's Refuge†** (culture beast-rider): 147; all grades 167.6, rich 1116 km², peak 204, sedimentary 99% | **Pinnacle Rock** (culture beast-rider): 139; all grades 146.6, rich 76 km², peak 179, sedimentary 96% | **Iziz** (Empire of Iziz): 132; all grades 138.2, rich 836 km², peak 222, sedimentary 92% |
| oil | **Mav's Refuge†** (culture beast-rider): 42.6; all grades 47.3, rich 20 km², peak 173, sedimentary 99% | **Pinnacle Rock** (culture beast-rider): 29.4; all grades 38.8, rich 0 km², peak 128, sedimentary 96% | **Sauropolis** (Lizardmen): 27.0; all grades 27.0, rich 0 km², peak 110, rift 96% |
| sulfur | **Kautoa** (Kautoa): 82.3; all grades 110.6, rich 164 km², peak 252, 1 vents, sedimentary 43% | **Singing Gjar outpost (planned)** (no polity on the map): 61.1; all grades 61.1, rich 172 km², peak 255, 1 vents, volcanic 100% | **Almua** (Vothic Kingdom): 37.5; all grades 44.4, rich 152 km², peak 252, 2 vents, sedimentary 78% |
| saltpeter | **Tallwalls** (no polity on the map): 155; all grades 155.6, rich 2836 km², peak 240, granite 59% | **Ardent** (Free Clans): 68.5; all grades 73.0, rich 0 km², peak 146, sedimentary 97% | **Singing Gjar outpost (planned)** (no polity on the map): 12.1; all grades 12.1, rich 0 km², peak 152, volcanic 100% |
| rock salt (halite) | **Tallwalls** (no polity on the map): 10.2; all grades 14.1, rich 0 km², peak 144, granite 59% | **Serai** (Jimjam): 4.9; all grades 8.1, rich 0 km², peak 122, evaporite 96% | **Dilihan** (Dilihan Province): 3.0; all grades 8.5, rich 8 km², peak 254, sedimentary 42% |
| gypsum | **Jimjam†** (Jimjam): 22.4; all grades 49.0, rich 0 km², peak 127, sedimentary 53% | **Dilihan** (Dilihan Province): 6.2; all grades 6.2, rich 16 km², peak 196, sedimentary 42% | **Tallwalls** (no polity on the map): 5.2; all grades 8.4, rich 0 km², peak 152, granite 59% |
| potash | **Dilihan** (Dilihan Province): 8.8; all grades 8.8, rich 28 km², peak 227, sedimentary 42% | **Qiblai** (Xanadu Sultanate): 3.6; all grades 3.6, rich 16 km², peak 185, water 59% | **Tallwalls** (no polity on the map): 1.9; all grades 13.4, rich 0 km², peak 104, granite 59% |
| soda (alkali salts) | **Tallwalls** (no polity on the map): 5.4; all grades 14.2, rich 0 km², peak 123, granite 59% | **Shell** (Shell Province): 0.0; all grades 0.7, rich 0 km², peak 52, sedimentary 89% | **Serai** (Jimjam): 0.0; all grades 0.6, rich 0 km², peak 9, evaporite 96% |
| marble | **Dilihan** (Dilihan Province): 6.3; all grades 13.6, rich 0 km², peak 117, sedimentary 42% | **Tethis** (League of Amphitriton): 3.1; all grades 3.1, rich 32 km², peak 207, carbonate 91% | **Ys†** (League of Amphitriton): 1.5; all grades 1.5, rich 16 km², peak 207, carbonate 79% |

### Stone and the rock families (no node kind)

| Good | Best | Next | Third |
|---|---|---|---|
| building stone | **Spirladunon** (Talovolci Chiefs): 2794; mean 251, rich 2836 km², impact 46% | **Yuni** (Yuni Emirate): 2630; mean 236, rich 2500 km², granite 41% | **Talia** (Empire of Iziz): 2412; mean 216, rich 2620 km², sedimentary 88% |
| clay | **Iziz** (Empire of Iziz): 794; mean 93, rich 456 km², sedimentary 92% | **Mav's Refuge†** (culture beast-rider): 691; mean 68, rich 296 km², sedimentary 99% | **Shim** (Vothic Kingdom): 665; mean 95, rich 456 km², sedimentary 98% |
| limestone (karst) | **Ys†** (League of Amphitriton): 931; mean 181, rich 1032 km², carbonate 79% | **Tethis** (League of Amphitriton): 869; mean 208, rich 964 km², carbonate 91% | **Trigon** (League of Amphitriton): 552; mean 251, rich 552 km², carbonate 99% |
| impactite | **Roketstad†** (Iron Republic): 1974; mean 181, rich 1048 km², sedimentary 61% | **Spirladunon** (Talovolci Chiefs): 1784; mean 160, rich 1304 km², impact 46% | **Ardent** (Free Clans): 1596; mean 143, rich 88 km², sedimentary 97% |
| ultramafic rock | - | - | - |
| tuff (volcanic ash) | **Kautoa** (Kautoa): 311; mean 58, rich 48 km², sedimentary 43% | **Singing Gjar outpost (planned)** (no polity on the map): 152; mean 120, rich 64 km², volcanic 100% | **Almua** (Vothic Kingdom): 91.0; mean 16, rich 64 km², sedimentary 78% |
| skarn | **Tallwalls** (no polity on the map): 250; mean 22, rich 320 km², granite 59% | **Dilihan** (Dilihan Province): 106; mean 11, rich 136 km², sedimentary 42% | **Shade†** (Nomad Country): 25.0; mean 19, rich 32 km², granite 57% |
| blast glass | - | - | - |

### Timber, livestock, fish, salt, water, farmland

| Good | Best | Next | Third |
|---|---|---|---|
| timber | **Spirladunon** (Talovolci Chiefs): 2672; forest 2836 km², wood byte 247, Af | **Pinnacle Rock** (culture beast-rider): 2247; forest 2240 km², wood byte 203, Aw | **Mav's Refuge†** (culture beast-rider): 2246; forest 1776 km², wood byte 251, XA |
| livestock and pasture | **Tallwalls** (no polity on the map): 1943; pasture mean 0.69, Dfb, 1500 mm | **Ardent** (Free Clans): 1711; pasture mean 0.60, Dsb, 325 mm | **Talia** (Empire of Iziz): 1658; pasture mean 0.58, Cfa, 1269 mm |
| fish | **Ys†** (League of Amphitriton): 1528; sea 1528 km² | **Shim** (Vothic Kingdom): 1480; lake 1056 km², river 5604 m³/s | **Kautoa** (Kautoa): 1472; sea 1472 km² |
| salt | **Tallwalls** (no polity on the map): 372; rock salt 128 km2 good | **Sauropolis** (Lizardmen): 284; salt lake 1136 km2 | **Dilihan** (Dilihan Province): 255; rock salt 28 km2 good, salt lake 440 km2 |
| fresh water | **Shim** (Vothic Kingdom): 399; klir Rivrh 5604 m³/s, byte 255, 1599 mm, lakes 1056 km² | **Nulab** (Dalab Council): 318; Chimes Riba 973 m³/s, byte 255, 1055 mm, lakes 928 km² | **Farport** (Eternal State): 296; Līng-Mā 1513 m³/s, byte 255, 1777 mm |
| farmland (any crop) | **Tallwalls** (no polity on the map): 2466; mean 0.87, 2432 km² over .7, Dfb 15 °C 1521 mm | **Dalab†** (Dalab Council): 1922; mean 0.84, 1844 km² over .7, WS 24 °C 1349 mm | **Mav's Refuge†** (culture beast-rider): 1886; mean 0.74, 1720 km² over .7, XA 33 °C 1898 mm |

### Crops by group (farm-eq km² x the best fit)

| Good | Best | Next | Third |
|---|---|---|---|
| grain staples | **Tallwalls** (no polity on the map): 2466; Rice, Shore wild-rice | **Dalab†** (Dalab Council): 1923; Bamboo rice, Rice, Shore wild-rice | **Mav's Refuge†** (culture beast-rider): 1811; Ashmillet, Sandpan fonio, Bamboo rice |
| pulses | **Mav's Refuge†** (culture beast-rider): 1811; Bambara groundnut, Tepary bean | **Dalab†** (Dalab Council): 1749; Bambara groundnut | **Nulab** (Dalab Council): 1654; Helix bean |
| tubers and roots | **Tallwalls** (no polity on the map): 2466; Ashroot, Giant lotus root, Sweet potato | **Dalab†** (Dalab Council): 1923; Ashroot, Shade manioc, Sweet potato | **Jimjam†** (Jimjam): 1703; Ashroot, Sweet potato, Shade manioc |
| starch fruit (banana, breadfruit) | **Dalab†** (Dalab Council): 1923; Banana, Breadfruit, Coconut | **Mav's Refuge†** (culture beast-rider): 1886; Coconut | **Jimjam†** (Jimjam): 1695; Banana, Breadfruit, Coconut |
| oil crops | **Dalab†** (Dalab Council): 1923; Ashfall avocado, Coconut | **Mav's Refuge†** (culture beast-rider): 1886; Coconut | **Jimjam†** (Jimjam): 1703; Ashfall avocado, Coconut, Sea-linen flax |
| nuts | **Tallwalls** (no polity on the map): 2466; Giant lotus root, Acorns, Wingnut | **Dalab†** (Dalab Council): 1923; Coconut, Fern-egg, Mahogany nut | **Mav's Refuge†** (culture beast-rider): 1886; Coconut, Frill-tree fireseed, Parasol pine nuts |
| fresh fruit | **Tallwalls** (no polity on the map): 2466; Cloud tamarillo, Ironplum, Sacred fig | **Dalab†** (Dalab Council): 1923; Ashfall avocado, Ironplum, Lantern fruit | **Mav's Refuge†** (culture beast-rider): 1886; Stair guava, Ember plum, Pitaya and tuna |
| dried fruit (dates, carob) | **Dalab†** (Dalab Council): 1923; Bell date, Stack fig, Gatepod | **Mav's Refuge†** (culture beast-rider): 1811; Kiln carob, Mesquite pods, Wadi date | **Jimjam†** (Jimjam): 1695; Bell date, Stack fig, Kiln carob |
| vegetables | **Tallwalls** (no polity on the map): 2466; Fiddleheads, Jade bamboo, Glasswort (sea asparagus) | **Dalab†** (Dalab Council): 1923; Fan-palm heart, Fiddleheads, Frillpod | **Jimjam†** (Jimjam): 1703; Fiddleheads, Fan-palm heart, Frillpod |
| spice | **Dalab†** (Dalab Council): 1923; Clove, Limestone citron | **Jimjam†** (Jimjam): 1703; Limestone citron, Clove, Juniper berries | **Nulab** (Dalab Council): 1654; Limestone citron |
| herbs and tobacco | **Tallwalls** (no polity on the map): 2466; Camphor crystals, Herbs (lemongrass, ginger, basil), Tobacco | **Dalab†** (Dalab Council): 1923; Herbs (lemongrass, ginger, basil), Tobacco | **Jimjam†** (Jimjam): 1703; Herbs (lemongrass, ginger, basil), Tobacco, Camphor crystals |
| sweeteners | **Dalab†** (Dalab Council): 1923; Sugar cane, Kiln carob, Tamarisk manna | **Mav's Refuge†** (culture beast-rider): 1811; Kiln carob, Tamarisk manna | **Jimjam†** (Jimjam): 1695; Sugar cane, Kiln carob, Tamarisk manna |
| beverages (coffee, tea, cacao, kava) | **Tallwalls** (no polity on the map): 2466; Coffee, Mist tea | **Dalab†** (Dalab Council): 1923; Cacao, Coffee, Kava | **Jimjam†** (Jimjam): 1703; Coffee, Cacao, Kava |
| fibre (cloth) | **Tallwalls** (no polity on the map): 2466; Lotus silk, Sea-linen flax, Sunboll cotton | **Dalab†** (Dalab Council): 1923; Silk-nettle ramie, Sunboll cotton | **Jimjam†** (Jimjam): 1703; Sunboll cotton, Silk-nettle ramie, Lotus silk |
| cordage | **Tallwalls** (no polity on the map): 2466; Jade bamboo, Mat reed, Rope-puff fibre | **Dalab†** (Dalab Council): 1923; Mat reed, Rope banana, Rope-puff fibre | **Jimjam†** (Jimjam): 1703; Mat reed, Rope-puff fibre, Rope banana |
| dyes | **Tallwalls** (no polity on the map): 2466; Wine weed (nori), Rosette lichen, Valley woad | **Dalab†** (Dalab Council): 1923; Flametip tanbark, Ironbark bark, Jungle indigo | **Jimjam†** (Jimjam): 1703; Wine weed (nori), Flametip tanbark, Ironbark bark |
| reagents | **Tallwalls** (no polity on the map): 2466; Camphor crystals | **Nulab** (Dalab Council): 1654; Camphor crystals | **Roketstad†** (Iron Republic): 985; Camphor crystals, Bell-pod beads, Moon caps |
| medicine | **Tallwalls** (no polity on the map): 2466; Rimdew, Tobacco | **Dalab†** (Dalab Council): 1923; Rimdew, Tobacco, Ember plum | **Mav's Refuge†** (culture beast-rider): 1811; Ember plum, Myrrh |
| fuel crops | **Dalab†** (Dalab Council): 1923; Dried warm reed, Kapok floss, Mahogany capsules | **Mav's Refuge†** (culture beast-rider): 1811; Myrrh, Dried warm reed, Saxaul wood | **Jimjam†** (Jimjam): 1695; Dried warm reed, Kapok floss, Mahogany capsules |

Three farm belts top nearly every crop table: Tallwalls (temperate-subtropic, humid, 15 °C), Dalab's new delta and Jimjam's
lake shore (tropic, subhumid). The kit's climate ranges are broad, so the biggest good ground wins; the single crops below,
and the cool and dry ones (emmer, frostoat, saffron, olive), show where the climate itself decides.

### Notable single crops

| Crop (bucket) | Best | Next | Third |
|---|---|---|---|
| Rice (grain) | **Tallwalls** 2466 | **Dalab†** 1923 | **Jimjam†** 1703 |
| Plain emmer (grain) | **Strongwall** 199 | **Arcbeam** 161 | **The Gate** 128 |
| Frostoat (grain) | **Roketstad†** 643 | **Arcbeam** 414 | **Longsong (planned pin)** 227 |
| Coconut (oil) | **Dalab†** 1923 | **Mav's Refuge†** 1886 | **Jimjam†** 1695 |
| Whorl olive (oil) | **Strongwall** 199 | **The Gate** 128 | **Ostrukh-on-Water** 124 |
| Sugar cane (sweetener) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1346 |
| Paper-maple syrup (sweetener) | **Roketstad†** 980 | **Spirladunon** 612 | **Arcbeam** 558 |
| Tamarisk manna (sweetener) | **Mav's Refuge†** 1811 | **Dalab†** 1749 | **Qiblai** 1636 |
| Tobacco (herb) | **Dalab†** 1923 | **Jimjam†** 1703 | **Nulab** 1654 |
| Coffee (beverage) | **Tallwalls** 2466 | **Dalab†** 1923 | **Jimjam†** 1703 |
| Cacao (beverage) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1280 |
| Mist tea (beverage) | **Tallwalls** 2466 | **Nulab** 1654 | **Roketstad†** 985 |
| Kava (beverage) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1280 |
| Ivan-chai (beverage) | **Roketstad†** 643 | **Arcbeam** 438 | **Longsong (planned pin)** 227 |
| Rattle coffee (beverage) | **Strongwall** 199 | **Arcbeam** 161 | **The Gate** 128 |
| Clove (spice) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1280 |
| Vale saffron (spice) | **Strongwall** 199 | **Arcbeam** 161 | **The Gate** 128 |
| Juniper berries (spice) | **Ardent** 200 | **Strongwall** 199 | **Arcbeam** 161 |
| Umbel seed (spice) | **Strongwall** 199 | **Arcbeam** 161 | **The Gate** 128 |
| Sunboll cotton (spinning) | **Dalab†** 1923 | **Jimjam†** 1703 | **Nulab** 1654 |
| Sea-linen flax (spinning) | **Nulab** 1654 | **Roketstad†** 643 | **Strongbow (planned pin)** 487 |
| Silk-nettle ramie (spinning) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1280 |
| Vale mulberry (spinning) | **Nulab** 1654 | **Roketstad†** 643 | **Strongbow (planned pin)** 487 |
| Lotus silk (spinning) | **Tallwalls** 2466 | **Nulab** 1654 | **Roketstad†** 985 |
| Cairn nettle (spinning) | **Roketstad†** 643 | **Arcbeam** 410 | **Longsong (planned pin)** 227 |
| Jungle indigo (dye) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1349 |
| Valley woad (dye) | **Nulab** 1654 | **Roketstad†** 643 | **Strongbow (planned pin)** 487 |
| Sunseed annatto (dye) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1280 |
| Mangrove bark (dye) | **Dalab†** 1923 | **Jimjam†** 1695 | **Talia** 1280 |
| Purple fan leaves (dye) | **Dalab†** 1749 | **Jimjam†** 1417 | **Talia** 1196 |
| Myrrh (medicine) | **Mav's Refuge†** 1811 | **Dalab†** 1749 | **Qiblai** 1636 |
| Camphor crystals (reagent) | **Tallwalls** 2466 | **Nulab** 1654 | **Roketstad†** 985 |
| Sky poppy (reagent) | **Roketstad†** 643 | **Arcbeam** 414 | **Longsong (planned pin)** 227 |
| Valley ginseng (herb) | **Roketstad†** 980 | **Spirladunon** 612 | **Arcbeam** 558 |

Field crops with no farmland in any living settlement's reach whose climate fits them (0): none.
(Dark-grown fungi and the `homeOnly` dyes and fibres are left out: they need a works, a home biome or trade, not a climate.)

## 3. Each settlement's profile

Minerals: the three node families with the most good-ground node-yield (x the family's value, `49r`) among those whose max
is 100 or more (`*` rich: max 170+); "none" means no cell of 100 for any ore (low-grade iron and the like only).
Farm: farm-eq km² / km² over .5. Crops: three staples, then three high-value (spice, beverage, sweetener, fibre, dye);
`i` irrigated. Timber, fish, salt, water: the scores of section 2. Ruins are in italics.

| Settlement | Type, reach | Px | Polity | Climate | Minerals | Farm | Staples / high-value | Timber | Fish | Salt | Water |
|---|---|---|---|---|---|---|---|---|---|---|---|
| *Agropolis* | ruin 10 | 717,917 | Vothic Kingdom | Aw 29° 972mm 1.78atm | coal 7 | 323 / 324 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 197 | 0 | 15 | 59 |
| Almua | city 30 | 718,883 | Vothic Kingdom | XA 37° 1835mm 2.06atm | sulfur* 38, coal 13, copper* 9 | 829 / 956 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Cacao, Clove | 1026 | 1440 | 180 | 64 |
| Arcbeam | arcology 20 | 1016,1058 | Empire of Iziz | Cfa 12° 847mm 1.23atm | iron* 18, nickel* 10, saltpeter 10 | 759 / 740 | Helix bean, Frostoat, Murnong / Mist tea, Paper-maple syrup, Rosette lichen | 565 | 0 | 78 | 40 |
| Ardent | city 30 | 851,572 | Free Clans | Dsb 7° 360mm 1.00atm | saltpeter 68, iron* 34 | 201 / 0 | Frostoat, Helix bean, Snow bistort / Cairn nettle, Heath broom, Ivan-chai | 3 | 0 | 230 | 13 |
| *Babel* | ruined arcology 10 | 456,908 | - | Af 24° 3074mm 1.59atm | coal 2 | 40 / 40 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 56 | 256 | 1 | 90 |
| Bastion | outpost 10 | 536,627 | - | Csa 18° 1003mm 1.33atm | iron* 13, nickel* 3 | 159 / 148 | Ashroot, Sweet potato, Rice / Sunboll cotton, Coffee, Ghost-gum leaf | 193 | 0 | 8 | 58 |
| Bipo | village 10 | 1000,816 | Kautoa | WS 33° 2698mm 1.94atm | iron* 10, coal* 9 | 61 / 56 | Ashmillet, Bambara groundnut, Bamboo rice / Tamarisk manna | 143 | 176 | 22 | 68 |
| *Blade* | ruined arcology 10 | 451,1022 | Dalab Council | Csa 18° 1113mm 1.37atm | iron* 20, tin* 3, gold 1 | 243 / 264 | Ashroot, Helix bean, Rice / Coffee, Mist tea, Rosette lichen | 211 | 0 | 8 | 61 |
| Boatmurder | outpost 10 | 766,404 | - | BSh 24° 454mm 1.45atm | copper 8 | 138 / 116 | Ashmillet, Ashroot, Bambara groundnut / Flametip tanbark, Ghost-gum leaf, Ironbark bark | 30 | 50 | 15 | 76 |
| *Carcosa* | ruin 10 | 395,812 | Eternal State | Am 25° 2023mm 1.57atm | coal 8 | 167 / 204 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 228 | 80 | 8 | 72 |
| Cascade | arcology 20 | 568,841 | Iron Republic | Cfb 11° 1396mm 1.13atm | iron* 36 | 600 / 632 | Giant lotus root, Shore wild-rice, Helix bean / Lotus silk, Mist tea, Rosette lichen | 949 | 309 | 31 | 239 |
| *Chimes* | ruined arcology 10 | 468,1392 | Dalab Council | Csa 21° 878mm 1.55atm | copper* 12, rare-earth* 6, iron* 5 | 20 / 20 | Ashroot, Rice, Shore wild-rice / Coffee, Ghost-gum leaf, Purple fan leaves | 167 | 317 | 0 | 272 |
| *Corpus* | ruin 10 | 520,693 | Eternal State | Cfa 23° 1992mm 1.48atm | coal 1 | 178 / 164 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 307 | 235 | 11 | 233 |
| Coyote Canyon | village 10 | 1265,500 | Coyote Kingdom | BSh 20° 282mm 1.31atm | saltpeter* 5 | 2 / 0 | Ashmillet, Ashroot, Bambara groundnut / Flametip tanbark, Ghost-gum leaf, Ironbark bark | 25 | 0 | 0 | 17 |
| *Crescent* | ruined arcology 10 | 994,694 | - | XA 32° 1709mm 1.93atm | coal* 13 | 85 / 88 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 169 | 104 | 7 | 72 |
| *Cthonos* | ruined arcology 10 | 526,1503 | - | Csb 11° 1490mm 1.20atm | copper* 9, rare-earth* 7, iron* 0 | 2 / 0 | - / Mist tea, Paper-maple syrup | 236 | 0 | 0 | 64 |
| *Cube* | ruined arcology 10 | 720,1567 | Lizardmen | Cfa 22° 1756mm 1.65atm | copper 9, rare-earth* 7, oil 5 | 319 / 324 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 304 | 0 | 0 | 67 |
| Dalab† | city 30 | 477,1108 | Dalab Council | WS 24° 1349mm 1.60atm | coal 12 | 1922 / 2000 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 1340 | 704 | 86 | 179 |
| Daranch | village 10 | 527,1149 | Dalab Council | Csa 20° 1098mm 1.47atm | none | 322 / 324 | Ashroot, Rice, Sweet potato / Coffee, Sunboll cotton, Cacao | 203 | 0 | 14 | 60 |
| Dhelv | cavern 10 | 840,776 | League of Amphitriton | WS 25° 2745mm 1.61atm | copper* 13, gold 5, silver 6 | 15 / 20 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 235 | 88 | 0 | 82 |
| Dilihan | city 30 | 744,663 | Dilihan Province | Am 30° 1521mm 1.79atm | iron* 144, gold 20, tin* 25 | 585 / 552 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Ghost-gum leaf, Purple fan leaves | 1333 | 82 | 255 | 53 |
| *Dorado* | ruin 10 | 483,964 | - | WH 25° 1819mm 1.60atm | coal 2 | 10 / 8 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 122 | 168 | 3 | 74 |
| Drum | arcology 20 | 673,932 | Vothic Kingdom | Af 28° 2117mm 1.77atm | coal 44 | 823 / 848 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ironbark bark | 1028 | 190 | 44 | 167 |
| Erehwon | city 30 | 805,1516 | Xanadu Sultanate | Aw 27° 956mm 1.70atm | copper 46, rare-earth* 35, saltpeter 1 | 852 / 896 | Ashroot, Sweet potato, Rice / Sunboll cotton, Coffee, Ghost-gum leaf | 668 | 1212 | 0 | 95 |
| Farport | city 30 | 294,588 | Eternal State | Am 27° 1835mm 1.56atm | iron* 129, tin* 66, gold 34 | 485 / 508 | Ashroot, Rice, Shore wild-rice / Coffee, Sunboll cotton, Cacao | 1824 | 1104 | 77 | 296 |
| *Flooded Tower* | ruined arcology 10 | 1028,840 | - | XA 32° 3105mm 1.93atm | coal 0 | 19 / 28 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 24 | 288 | 0 | 85 |
| *Footfall* | ruin 10 | 560,767 | Iron Republic | Csb 10° 878mm 1.11atm | none | 171 / 148 | Giant lotus root, Shore wild-rice, Frostoat / Lotus silk, Mist tea, Paper-maple syrup | 187 | 111 | 12 | 133 |
| *Fort Ebon* | ruin 10 | 695,782 | Scyvoi | BSh 29° 533mm 1.75atm | iron* 1 | 189 / 324 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Ghost-gum leaf, Purple fan leaves | 35 | 0 | 18 | 32 |
| *Fort Kalor* | ruin 10 | 863,693 | Screamer Country | XA 34° 1678mm 1.96atm | iron* 7, coal 6, sulfur 4 | 57 / 76 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 179 | 56 | 47 | 68 |
| *Fort Kreia* | ruin 10 | 1049,736 | - | Csa 21° 674mm 1.40atm | iron* 9, saltpeter 2 | 183 / 192 | Ashmillet, Bambara groundnut, Sandpan fonio / Ghost-gum leaf, Purple fan leaves, Sugar cane | 100 | 0 | 19 | 35 |
| *Fort Ordo* | ruin 10 | 1060,831 | - | XV 31° 1050mm 1.85atm | coal 12, oil 5 | 216 / 252 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 251 | 120 | 12 | 137 |
| Fort Vaklu | outpost 10 | 984,912 | Empire of Iziz | XA 31° 2603mm 1.91atm | coal* 28, oil 0 | 227 / 284 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 288 | 36 | 17 | 75 |
| Fridon | city 30 | 1027,931 | Empire of Iziz | XA 30° 1537mm 1.86atm | coal* 89, oil 15 | 1390 / 1660 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna, Cacao, Clove | 1978 | 608 | 64 | 99 |
| Fulcrum | arcology 20 | 409,621 | Eternal State | Cfa 26° 941mm 1.59atm | iron* 88, tin* 8, gold 6 | 593 / 620 | Ashmillet, Ashroot, Bambara groundnut / Flametip tanbark, Ghost-gum leaf, Ironbark bark | 830 | 351 | 23 | 280 |
| Furrow | outpost 10 | 1276,639 | Nomad Country | Aw 30° 1223mm 1.72atm | iron* 23, gold 5, silver 5 | 38 / 44 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ghost-gum leaf | 190 | 0 | 2 | 57 |
| Gila | village 10 | 653,1485 | Lizardmen | XV 29° 1050mm 1.96atm | copper 4, rare-earth* 3, oil 2 | 52 / 48 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Cacao, Clove | 94 | 168 | 0 | 70 |
| Girder | village 10 | 1039,869 | beast-rider | XA 32° 1788mm 1.90atm | coal* 30, oil* 6 | 229 / 316 | Ashmillet, Bambara groundnut, Bamboo rice / Tamarisk manna | 319 | 209 | 14 | 205 |
| Glaive | village 10 | 599,734 | Iron Republic | Csb 10° 878mm 1.08atm | iron* 5 | 153 / 148 | Giant lotus root, Shore wild-rice, Frostoat / Lotus silk, Mist tea, Paper-maple syrup | 202 | 114 | 9 | 141 |
| *Henge* | ruined arcology 10 | 457,735 | Eternal State | Cfa 22° 1396mm 1.47atm | none | 321 / 324 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 263 | 0 | 13 | 64 |
| Hexahedron† | arcology 20 | 817,670 | Screamer Country | XA 32° 1427mm 1.87atm | coal* 57, oil 8, gypsum* 4 | 654 / 712 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 961 | 0 | 85 | 63 |
| Hook | city 30 | 809,923 | Empire of Iziz | XA 32° 4000mm 1.93atm | iron* 79, coal* 49, sulfur 7 | 977 / 1068 | Bamboo rice, Ashroot, Banana / Cacao, Clove, Coffee | 1460 | 1320 | 168 | 72 |
| *Hub 01* | ruined arcology 10 | 1344,1409 | - | ET -2° 156mm 0.93atm | saltpeter* 15, iron* 3 | 0 / 0 | Frostroot, Snow bistort, Snow potato / Birch tar, Cairn nettle, Fur-larch bark | 0 | 0 | 37 | 20 |
| Iziz | city 30 | 963,985 | Empire of Iziz | XA 31° 1835mm 1.91atm | coal* 132, oil* 27 | 1434 / 1704 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 2094 | 949 | 74 | 280 |
| Jimjam† | city 30 | 745,546 | Jimjam | Am 25° 1176mm 1.51atm | gypsum 22, iron* 8 | 1702 / 1940 | Ashroot, Rice, Shore wild-rice / Coffee, Sunboll cotton, Cacao | 1784 | 926 | 73 | 202 |
| Kautoa | city 30 | 964,725 | Kautoa | Af 31° 2745mm 1.86atm | sulfur* 82, iron* 48, copper* 26 | 571 / 612 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 1060 | 1472 | 165 | 66 |
| Kierson | village 10 | 884,737 | League of Amphitriton | XA 32° 1647mm 1.88atm | iron* 14, coal 10, sulfur 3 | 92 / 116 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 220 | 104 | 16 | 70 |
| Komodo | village 10 | 865,1617 | Lizardmen | XA 35° 4000mm 2.17atm | copper 6, rare-earth* 4, oil 3 | 26 / 16 | Bamboo rice / - | 179 | 17 | 29 | 86 |
| Ledge | arcology 20 | 437,1330 | Dalab Council | Cfa 15° 878mm 1.32atm | copper 24, rare-earth* 18 | 26 / 16 | Giant lotus root, Shore wild-rice, Ashroot / Lotus silk, Mist tea, Paper-maple syrup | 524 | 745 | 0 | 279 |
| *Leng* | ruined arcology 10 | 490,554 | - | Dsc 2° 313mm 0.91atm | saltpeter 9 | 0 / 0 | Frostoat, Frostroot, Helix bean / Birch tar, Cairn nettle, Fur-larch bark | 0 | 0 | 35 | 12 |
| Lipp | village 10 | 691,619 | Iron Republic | Dsb 7° 533mm 1.02atm | iron* 21 | 74 / 68 | Frostoat, Helix bean, Snow bistort / Cairn nettle, Grey alder bark, Heath broom | 57 | 0 | 4 | 34 |
| Locus | village 10 | 1267,1043 | Yuni Emirate | XA 32° 3827mm 2.16atm | tin* 8, iron 9, gold 3 | 3 / 4 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 171 | 22 | 38 | 79 |
| Loj Twenny | cavern 10 | 457,1269 | Dalab Council | ET -12° 407mm 0.74atm | copper 9, rare-earth* 7, saltpeter 1 | 0 / 0 | - / - | 1 | 0 | 0 | 20 |
| Longsong (planned pin) | village 10 | 1229,1621 | xanadu | BSk 11° 768mm 1.23atm | iron* 25, tin* 0, gold 0 | 318 / 324 | Giant lotus root, Shore wild-rice, Frostoat / Lotus silk, Mist tea, Paper-maple syrup | 138 | 283 | 12 | 246 |
| Lux | city 30 | 495,645 | Eternal State | WS 27° 1882mm 1.62atm | coal 17 | 1258 / 1316 | Ashroot, Shade manioc, Sweet potato / Jungle indigo, Flametip tanbark, Ironbark bark | 1429 | 948 | 61 | 179 |
| Mantis | village 10 | 1113,1164 | Empire of Iziz | Am 28° 1552mm 1.81atm | coal 11 | 189 / 216 | Ashmillet, Bambara groundnut, Bamboo rice / Tamarisk manna, Cacao, Clove | 153 | 16 | 35 | 62 |
| Mav's Refuge† | city 30 | 1049,841 | beast-rider | XA 33° 1898mm 1.92atm | coal* 147, oil* 43 | 1886 / 2212 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 2246 | 572 | 104 | 197 |
| Mirabilis | village 10 | 350,726 | Eternal State | Csa 12° 627mm 1.08atm | iron* 22 | 37 / 24 | Helix bean, Frostoat, Giant lotus root / Rosette lichen, Sea-linen flax, Vale mulberry | 57 | 84 | 4 | 95 |
| Mungo† | village 10 | 1322,828 | Nomad Country | XA 36° 1725mm 2.00atm | iron* 17, gold 4, coal 4 | 36 / 4 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 193 | 15 | 28 | 68 |
| *Nazar* | ruin 10 | 582,1079 | - | Csa 22° 1050mm 1.51atm | coal 0 | 264 / 272 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 215 | 0 | 12 | 61 |
| *Necropolis* | ruin 10 | 406,944 | - | Aw 24° 1411mm 1.57atm | coal 3 | 126 / 128 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 99 | 148 | 4 | 70 |
| Nereus | village 10 | 762,805 | League of Amphitriton | XA 31° 2619mm 1.86atm | coal* 20, iron* 8 | 202 / 240 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 312 | 8 | 10 | 78 |
| *Noa's Regret* | ruined arcology 10 | 896,866 | - | XV 34° 658mm 1.93atm | copper* 8, gold 3, silver 3 | 18 / 0 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 37 | 152 | 16 | 47 |
| Nulab | city 30 | 443,1359 | Dalab Council | Csa 18° 1129mm 1.53atm | copper 53, rare-earth* 41 | 1654 / 1772 | Ashroot, Giant lotus root, Helix bean / Coffee, Lotus silk, Mist tea | 1190 | 1311 | 0 | 318 |
| *Nusidi* | ruin 10 | 996,870 | - | XA 32° 2321mm 1.90atm | coal* 11, iron* 6 | 116 / 160 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 179 | 140 | 19 | 71 |
| Nūru-Šaplu | cavern 10 | 876,802 | - | Csa 28° 470mm 1.56atm | copper* 16, gold 6, silver 7 | 1 / 0 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Ghost-gum leaf, Purple fan leaves | 47 | 40 | 0 | 36 |
| Ostrukh-on-Water | village 10 | 1516,1471 | - | Cwb 18° 439mm 1.25atm | copper 9 | 123 / 0 | Basin amaranth, Murnong, Plain emmer / Ghost-gum leaf, Juniper berries, Purple fan leaves | 22 | 0 | 28 | 24 |
| Pinnacle Rock | city 30 | 1007,686 | beast-rider | Aw 32° 1490mm 1.88atm | coal* 140, oil 29, iron* 23 | 1298 / 1448 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 2247 | 465 | 96 | 206 |
| *Pluton* | ruined arcology 10 | 743,1328 | - | O 10° 0mm 0.48atm | copper* 18, saltpeter* 17, gold 7 | 1 / 0 | Basin amaranth, Helix bean i / Heath broom i, Ivan-chai i, Rosette lichen i | 0 | 0 | 0 | 0 |
| Pontus | village 10 | 702,839 | League of Amphitriton | XV 33° 1113mm 1.94atm | none | 72 / 80 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 79 | 160 | 19 | 61 |
| Port Goto | village 10 | 918,698 | - | Aw 33° 1192mm 1.92atm | iron* 8, coal 7, potash 2 | 187 / 268 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 214 | 0 | 16 | 61 |
| Port Tobin | village 10 | 932,973 | Empire of Iziz | XA 31° 2635mm 1.90atm | coal* 23, oil 0 | 208 / 248 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 248 | 76 | 18 | 75 |
| Port Visas | village 10 | 800,712 | Dilihan Province | XV 33° 1050mm 1.92atm | coal* 3 | 132 / 228 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 129 | 96 | 17 | 61 |
| Pylon | arcology 20 | 869,1002 | Empire of Iziz | Aw 29° 752mm 1.78atm | iron* 12, coal 2 | 1194 / 1268 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ghost-gum leaf | 616 | 0 | 49 | 57 |
| Qarnu-Tūbu | cavern 10 | 834,882 | - | Cfa 32° 1490mm 1.73atm | copper* 18, gold 7, silver 8 | 106 / 48 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 222 | 0 | 0 | 55 |
| Qiblai | city 30 | 922,1595 | Xanadu Sultanate | Af 34° 1631mm 2.02atm | copper 31, rare-earth* 24, oil 18 | 1635 / 1840 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ghost-gum leaf | 1710 | 440 | 24 | 275 |
| Reed† | village 10 | 1280,678 | Nomad Country | XA 39° 1584mm 2.14atm | iron* 7, tin* 2, gold 1 | 3 / 0 | Ashmillet, Bambara groundnut, Bamboo rice / Tamarisk manna | 57 | 167 | 53 | 180 |
| Roketstad† | city 30 | 632,716 | Iron Republic | Cfb 11° 1082mm 1.10atm | iron* 124, saltpeter 6 | 985 / 992 | Giant lotus root, Shore wild-rice, Frostoat / Lotus silk, Mist tea, Paper-maple syrup | 1509 | 273 | 63 | 141 |
| Sauropolis | city 30 | 765,1596 | Lizardmen | XA 36° 2086mm 2.21atm | copper 46, rare-earth* 36, oil 27 | 186 / 4 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Cacao, Clove | 1135 | 277 | 284 | 129 |
| Serai | village 10 | 826,478 | Jimjam | Aw 28° 956mm 1.61atm | halite 5, potash 1 | 91 / 72 | Ashroot, Shade manioc, Sweet potato / Flametip tanbark, Ironbark bark, Jungle indigo | 148 | 241 | 175 | 197 |
| Shade† | outpost 10 | 1085,683 | Nomad Country | BSh 28° 549mm 1.68atm | iron* 21, tin* 10, gold 4 | 52 / 56 | Ashmillet, Bambara groundnut, Basin amaranth / Ghost-gum leaf, Purple fan leaves, Rabbitbrush flowers | 119 | 0 | 2 | 42 |
| Shelf | arcology 20 | 461,1161 | Dalab Council | Dsb 3° 533mm 1.00atm | iron* 71, tin* 16, gold 5 | 96 / 104 | Ashroot, Helix bean, Murnong / Coffee, Ghost-gum leaf, Juniper berries | 262 | 0 | 9 | 37 |
| Shell | arcology 20 | 902,659 | Shell Province | XA 32° 1694mm 1.87atm | coal* 12, gypsum* 4, halite* 3 | 691 / 728 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 816 | 151 | 131 | 120 |
| Shim | city 30 | 654,1118 | Vothic Kingdom | Af 23° 1803mm 1.69atm | coal 33 | 1192 / 1220 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 1548 | 1480 | 57 | 399 |
| Singing Gjar outpost (planned) | outpost 10 | 1572,1643 | - | Dsb 2° 219mm 1.01atm | sulfur* 61, copper* 18, gold 7 | 0 / 0 | Frostoat, Frostroot, Helix bean / Birch tar, Cairn nettle, Fur-larch bark | 0 | 0 | 0 | 4 |
| *Sleeping City* | ruin 10 | 1044,776 | - | Aw 29° 1003mm 1.74atm | coal 5, oil 2 | 319 / 324 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ghost-gum leaf | 205 | 0 | 12 | 60 |
| *Span* | ruined arcology 10 | 554,1010 | - | Cfa 11° 1819mm 1.16atm | none | 198 / 228 | Giant lotus root, Shore wild-rice, Ashroot / Lotus silk, Mist tea, Paper-maple syrup | 304 | 148 | 11 | 164 |
| Spindle Fan | village 10 | 1561,1140 | Yuni Emirate | Cwb 11° 439mm 1.22atm | copper 9, saltpeter 4 | 103 / 0 | Murnong, Plain emmer, Frostoat / Ghost-gum leaf, Heath broom, Ivan-chai | 14 | 78 | 35 | 75 |
| Spirladunon | city 30 | 800,1017 | Talovolci Chiefs | Af 18° 4000mm 1.34atm | iron* 171, tin* 19, gold 14 | 1031 / 984 | Shore wild-rice, Giant lotus root, Ashroot / Lotus silk, Mist tea, Paper-maple syrup | 2672 | 355 | 18 | 171 |
| *Stair* | ruined arcology 10 | 1106,1442 | - | BWk 16° 47mm 1.35atm | iron* 19, tin* 12, saltpeter* 17 | 0 / 0 | Basin amaranth, Murnong, Plain emmer / Ghost-gum leaf, Juniper berries, Purple fan leaves | 0 | 0 | 6 | 0 |
| Strongbow (planned pin) | arcology 20 | 1001,1596 | Xanadu Sultanate | Cfb 14° 800mm 1.34atm | copper 30, rare-earth* 23, oil 5 | 486 / 516 | Giant lotus root, Helix bean, Shore wild-rice / Lotus silk, Mist tea, Rosette lichen | 880 | 334 | 0 | 260 |
| Strongwall | outpost 10 | 914,1634 | Xanadu Sultanate | Cfa 24° 972mm 1.67atm | copper 9, rare-earth* 7, oil 5 | 219 / 244 | Ashroot, Rice, Sweet potato / Coffee, Ghost-gum leaf, Purple fan leaves | 284 | 0 | 0 | 59 |
| *Stump* | ruined arcology 10 | 1044,952 | Empire of Iziz | WS 32° 1992mm 1.89atm | coal 11, oil 4 | 82 / 80 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 197 | 320 | 6 | 213 |
| Tabist town (to be named)† | town 20 | 1270,666 | Nomad Country | XA 39° 1694mm 2.14atm | iron* 44, coal 13, gold 5 | 17 / 8 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 283 | 159 | 122 | 144 |
| Talia | city 30 | 1073,939 | Empire of Iziz | Cfa 23° 878mm 1.55atm | iron* 125, nickel* 14, coal 17 | 1435 / 1444 | Bamboo rice, Ashroot, Shade manioc / Jungle indigo, Flametip tanbark, Ironbark bark | 2157 | 286 | 69 | 190 |
| Tallhouse | outpost 10 | 683,1184 | Giant Country | Csa 18° 878mm 1.41atm | none | 151 / 156 | Giant lotus root, Helix bean, Shore wild-rice / Lotus silk, Mist tea, Rosette lichen | 215 | 141 | 15 | 158 |
| Tallwalls | city 30 | 650,1268 | - | Dfb 15° 1521mm 1.25atm | saltpeter* 156, iron* 129, tin* 87 | 2466 / 2560 | Ashroot, Giant lotus root, Rice / Coffee, Lotus silk, Mist tea | 1581 | 258 | 372 | 145 |
| Talon | village 10 | 1026,760 | - | Am 31° 1584mm 1.85atm | coal 16, oil 2 | 180 / 180 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 273 | 136 | 10 | 170 |
| Temora | village 10 | 762,883 | Vothic Kingdom | Af 30° 1866mm 1.81atm | coal* 21, oil 3 | 223 / 240 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna | 302 | 20 | 13 | 71 |
| Tethis | arcology 20 | 733,775 | League of Amphitriton | XV 32° 972mm 1.88atm | marble* 3, iron* 0 | 765 / 888 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 527 | 204 | 58 | 59 |
| The Gate | outpost 10 | 1438,326 | - | Cfa 19° 988mm 1.34atm | iron* 6 | 282 / 320 | Ashroot, Sweet potato, Rice / Sunboll cotton, Coffee, Lotus silk | 279 | 265 | 12 | 242 |
| The Tubes | cavern 10 | 608,1547 | Lizardmen | Csa 21° 925mm 1.62atm | copper* 10, rare-earth* 7, oil 5 | 30 / 32 | Ashmillet, Ashroot, Bambara groundnut / Flametip tanbark, Ghost-gum leaf, Ironbark bark | 136 | 0 | 0 | 55 |
| Theodiga | arcology 20 | 908,1535 | Xanadu Sultanate | Cfa 25° 909mm 1.70atm | copper 4, rare-earth* 3, oil 2 | 330 / 312 | Ashroot, Sweet potato, Ashmillet / Sunboll cotton, Tamarisk manna, Flametip tanbark | 470 | 290 | 0 | 235 |
| *Tilted Tower* | ruined arcology 10 | 614,490 | - | Cfb 9° 1270mm 1.03atm | copper 9 | 79 / 96 | Frostoat, Helix bean, Snow bistort / Mist tea, Paper-maple syrup, Cairn nettle | 221 | 0 | 1 | 59 |
| Torus | arcology 20 | 774,1007 | Vothic Kingdom | Af 28° 2745mm 1.77atm | iron* 51, tin* 10, coal 12 | 287 / 288 | Bamboo rice, Ashroot, Banana / Cacao, Clove, Coffee | 702 | 750 | 66 | 176 |
| *Trickster's House* | ruined arcology 10 | 1512,660 | - | WH 22° 611mm 1.24atm | iron* 14, tin* 6, gold 5 | 40 / 8 | Ashroot, Helix bean, Murnong / Ghost-gum leaf, Juniper berries, Purple fan leaves | 16 | 104 | 1 | 44 |
| Trigon | arcology 20 | 722,740 | League of Amphitriton | XA 32° 1835mm 1.87atm | none | 283 / 320 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 518 | 708 | 19 | 100 |
| Tuatara | village 10 | 818,1554 | Lizardmen | XV 29° 1019mm 1.98atm | copper* 10, rare-earth* 7, oil 5 | 240 / 280 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ghost-gum leaf | 165 | 0 | 0 | 59 |
| Tzunfort | outpost 10 | 670,886 | Vothic Kingdom | Aw 29° 627mm 1.76atm | none | 283 / 324 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Flametip tanbark, Ghost-gum leaf | 99 | 0 | 16 | 47 |
| Valapo | village 10 | 942,782 | Kautoa | XA 32° 1600mm 1.89atm | iron* 22, coal 3, gold 1 | 49 / 40 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 222 | 28 | 8 | 63 |
| Veil | outpost 10 | 448,838 | Eternal State | Dsb 8° 925mm 1.05atm | iron* 20, tin* 10, gold 4 | 62 / 80 | - / Mist tea, Paper-maple syrup | 218 | 0 | 3 | 61 |
| *Veladiga* | ruined arcology 10 | 685,479 | - | BSh 25° 486mm 1.47atm | copper 4, saltpeter 1 | 104 / 44 | Ashmillet, Bambara groundnut, Sandpan fonio / Ghost-gum leaf, Purple fan leaves, Sugar cane | 56 | 49 | 2 | 81 |
| Verge† | city 30 | 1268,949 | Yuni Emirate | XA 33° 1490mm 1.98atm | iron* 155, gold 35, silver 31 | 190 / 84 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Ghost-gum leaf, Purple fan leaves | 687 | 185 | 138 | 98 |
| Voth | city 30 | 742,1018 | Vothic Kingdom | WS 32° 1600mm 1.94atm | iron* 76, tin* 24, gold 16 | 577 / 632 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Jungle indigo, Cacao | 1235 | 1260 | 142 | 63 |
| Wildcat | village 10 | 427,1453 | Fellgangs | Dsb 4° 862mm 1.04atm | copper* 18, gold 7, silver 8 | 32 / 12 | - / Mist tea, Paper-maple syrup | 169 | 0 | 0 | 58 |
| *Wing* | ruined arcology 10 | 699,1042 | Vothic Kingdom | Aw 22° 909mm 1.57atm | iron* 3, coal 1 | 183 / 220 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 191 | 386 | 9 | 341 |
| Yith | village 10 | 346,418 | - | Cfa 20° 2886mm 1.31atm | iron 23, gold 5, silver 5 | 16 / 0 | Ashroot, Rice, Shore wild-rice / Coffee, Lotus silk, Mist tea | 304 | 120 | 0 | 159 |
| Ys† | city 30 | 788,741 | League of Amphitriton | XA 33° 1694mm 1.92atm | coal 1, marble* 2 | 891 / 1204 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna | 807 | 1528 | 201 | 61 |
| Yuni | city 30 | 1263,1089 | Yuni Emirate | Cfa 21° 674mm 1.48atm | iron* 185, tin* 62, gold 35 | 1115 / 1276 | Ashroot, Sweet potato, Ashmillet / Ghost-gum leaf, Purple fan leaves, Sunboll cotton | 848 | 215 | 24 | 143 |
| Zey'danin | city 30 | 795,860 | - | XA 32° 2447mm 1.85atm | copper* 80, gold 31, silver 34 | 327 / 264 | Bamboo rice, Ashmillet, Bambara groundnut / Tamarisk manna, Cacao, Clove | 1298 | 1340 | 134 | 78 |
| Šurpu-Dhelv | cavern 10 | 806,818 | - | Cfa 31° 3639mm 1.67atm | copper* 18, gold 9, silver 8 | 19 / 0 | Bamboo rice / - | 286 | 98 | 0 | 155 |

Notes on the pins:
- Dalab: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 464,1112).
- Hexahedron: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 827,668).
- Jimjam: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 746,550).
- Loj Twenny: today's pin: to go under the great shaft, station 3 (q16; that pin is on its branch).
- Longsong: planned: onto the Bīruk al-Ghaym, 550 m³/s (q10; SETT_MOVED 5.1e7 on the Oidong-High Rift branch) (was 1226,1626).
- Mav's Refuge: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 1024,807).
- Mungo: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 1321,825).
- Reed: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 1277,676).
- Roketstad: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 609,684).
- Shade: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 1229,885).
- Strongbow: planned: on the Xanadu-Oidong scarp (q15; SETT_MOVED 5.1e5 on its branch) (was 1026,1594).
- Verge: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 1263,946).
- Ys: moved 2026-11-11 in the pin batch (SETT_MOVED 5.1e6, commit f377baf4d) (was 789,738).
- Tabist town (to be named): added 2026-11-11 (SETT_ADDED 5.1e6, commit f377baf4d): the Tabisti town, name to come, 24 km NW of Reed.
- Singing Gjar outpost: planned outpost at the Singing Gjar, a holy place of the High Rift (LORE.md).

## 4. Notable gaps (what the sim will feel)

**Short of salt** (salt score under 15: at most a few low-grade nodes of thin bedded rock salt; no good rock salt, salt lake,
salt steppe or sea in reach), 34 of 88, with the nearest good rock salt (halite 100+ on land) as the crow flies:
- Coyote Canyon (village, Coyote Kingdom): 0.0; good rock salt 175 km off at 1184,466.
- Dhelv (cavern, League of Amphitriton): 0.0; good rock salt 140 km off at 834,706.
- Erehwon (city, Xanadu Sultanate): 0.0; good rock salt 154 km off at 869,1559.
- Gila (village, Lizardmen): 0.0; good rock salt 14 km off at 646,1484.
- Ledge (arcology, Dalab Council): 0.0; good rock salt 169 km off at 354,1347.
- Loj Twenny (cavern, Dalab Council): 0.0; good rock salt 258 km off at 354,1347.
- Nulab (city, Dalab Council): 0.0; good rock salt 179 km off at 354,1348.
- Strongbow (planned pin) (arcology, Xanadu Sultanate): 0.0; good rock salt 161 km off at 922,1580.
- Strongwall (outpost, Xanadu Sultanate): 0.0; good rock salt 100 km off at 910,1584.
- The Tubes (cavern, Lizardmen): 0.0; good rock salt 144 km off at 639,1482.
- Theodiga (arcology, Xanadu Sultanate): 0.0; good rock salt 65 km off at 882,1555.
- Tuatara (village, Lizardmen): 0.0; good rock salt 102 km off at 869,1559.
- Wildcat (village, Fellgangs): 0.0; good rock salt 251 km off at 352,1352.
- Yith (village, no polity on the map): 0.0; good rock salt 638 km off at 665,423.
- Šurpu-Dhelv (cavern, no polity on the map): 0.0; good rock salt 110 km off at 758,845.
- Qarnu-Tūbu (cavern, no polity on the map): 0.0; good rock salt 134 km off at 768,894.
- Nūru-Šaplu (cavern, no polity on the map): 0.0; good rock salt 209 km off at 834,706.
- Singing Gjar outpost (planned) (outpost, no polity on the map): 0.0; good rock salt 803 km off at 1408,1276.
- Furrow (outpost, Nomad Country): 2.0; salt steppe 40 km2; good rock salt 391 km off at 1184,466.
- Shade† (outpost, Nomad Country): 2.4; good rock salt 278 km off at 1089,544.
- Veil (outpost, Eternal State): 3.2; good rock salt 517 km off at 705,810.
- Mirabilis (village, Eternal State): 4.0; good rock salt 729 km off at 705,809.
- Lipp (village, Iron Republic): 4.8; good rock salt 56 km off at 719,622.
- Bastion (outpost, no polity on the map): 8.0; good rock salt 366 km off at 719,622.
- Valapo (village, Kautoa): 8.4; sea 28 km2; good rock salt 195 km off at 916,688.
- Glaive (village, Iron Republic): 9.6; good rock salt 259 km off at 705,809.
- Shelf (arcology, Dalab Council): 9.6; good rock salt 410 km off at 639,1263.
- Nereus (village, League of Amphitriton): 10.4; good rock salt 73 km off at 748,839.
- Talon (village, no polity on the map): 10.4; good rock salt 248 km off at 928,684.
- Longsong (planned pin) (village, culture xanadu): 12.8; good rock salt 467 km off at 1106,1422.
- The Gate (outpost, no polity on the map): 12.8; good rock salt 577 km off at 1184,463.
- Temora (village, Vothic Kingdom): 13.2; sea 20 km2; good rock salt 22 km off at 767,893.
- Daranch (village, Dalab Council): 14.4; good rock salt 319 km off at 639,1263.
- Girder (village, culture beast-rider): 14.4; good rock salt 431 km off at 928,684.

**Without iron** (iron node-yield under 1 in reach), 5: Pontus (0.0, max 0), Serai (0.0, max 0), Trigon (0.0, max 0), Tethis (0.3, max 180), Port Visas (0.7, max 40).

**Only low-grade iron** (no cell of 100: the sedimentary floor's 40-70, so a field of low-grade nodes, yield .5 each), 42: Ys† (1.6, max 40), Mantis (3.4, max 40), Gila (3.7, max 70), Port Tobin (3.9, max 40), Theodiga (3.9, max 70), Fort Vaklu (4.5, max 40), Temora (4.7, max 40), Talon (4.9, max 40), Coyote Canyon (5.1, max 40), Daranch (5.1, max 40), Girder (5.1, max 40), Tallhouse (5.1, max 40), Tzunfort (5.1, max 40), Dhelv (5.6, max 60), Komodo (5.6, max 70), Boatmurder (6.8, max 60), Nūru-Šaplu (6.8, max 60), Wildcat (7.7, max 60), Ostrukh-on-Water (7.7, max 60), Spindle Fan (7.7, max 60), Šurpu-Dhelv (7.7, max 60), Qarnu-Tūbu (7.7, max 60), Singing Gjar outpost (planned) (7.7, max 60), Loj Twenny (9.1, max 70), Strongwall (9.1, max 70), Shell (16.3, max 40), Hexahedron† (19.1, max 40), Drum (19.8, max 40), Almua (20.7, max 60), Ledge (23.2, max 70), Shim (27.2, max 40), Strongbow (planned pin) (29.5, max 70), Lux (29.9, max 40), Qiblai (30.6, max 70), Iziz (31.1, max 40), Fridon (32.1, max 40), Zey'danin (34.3, max 60), Dalab† (34.8, max 40), Mav's Refuge† (39.6, max 40), Erehwon (45.6, max 70), Sauropolis (46.0, max 70), Nulab (52.6, max 70).
Iron is the one metal almost every reach has (the sedimentary floor's byte 40 keeps one 3 km cell in six), so the gap is
grade, not presence: the cities among these would buy good ore or bloom poor ore. The nearest good iron (100+) to each: Almua 32 km (728,870); Dalab 62 km (446,1113); Erehwon 54 km (805,1543); Fridon 56 km (1055,931); Iziz 77 km (936,1013); Lux 46 km (505,624); Mav's Refuge 56 km (1077,841); Nulab 32 km (443,1375); Qiblai 96 km (908,1641); Sauropolis 36 km (748,1590); Shim 31 km (661,1104); Ys 32 km (772,743); Zey'danin 54 km (768,864).

**Short of food ground** (farm-eq km² under a type's floor: city 150, town or arcology 80, village 15, cavern 10, outpost 5), 8.
`KHAMLET.farmNeed` is 0.075 ha a person, so 150 km²-eq feeds far more than a city: these are places where the index sees
almost no farmable ground at all, and that must eat from fish, pasture, beds or trade:
- Loj Twenny (cavern): farm 0, pasture 91, fish 0; ET -12 °C 407 mm, 6216 m.
- Singing Gjar outpost (planned) (outpost): farm 0, pasture 51, fish 0; Dsb 2 °C 219 mm, 3683 m.
- Nūru-Šaplu (cavern): farm 1, pasture 113, fish 40; Csa 28 °C 470 mm, 226 m.
- Coyote Canyon (village): farm 2, pasture 17, fish 0; BSh 20 °C 282 mm, 1603 m.
- Locus (village): farm 3, pasture 7, fish 22; XA 32 °C 3827 mm, -2402 m.
- Reed† (village): farm 3, pasture 21, fish 167; XA 39 °C 1584 mm, -2333 m.
- Tabist town (to be named)† (town): farm 17, pasture 186, fish 159; XA 39 °C 1694 mm, -2307 m.
- Ledge (arcology): farm 26, pasture 178, fish 745; Cfa 15 °C 878 mm, 1562 m.

**The two the brief names:**
- **Qiblai** at 922,1595: salt 24.0 (rock salt 4 km2 good; rock-salt node-yield 0.6, max halite byte 220, 4 km² over 100); potash 3.6, soda 0.0; the nearest good rock salt 30 km off at 922,1580.
- **Longsong** at 1229,1621: salt 12.8 (no source; rock-salt node-yield 1.6, max halite byte 11, 0 km² over 100); potash 0.0, soda 0.0; the nearest good rock salt 467 km off at 1106,1422.

Qiblai's move did reach salt, but only just: one 4 km cell of halite (220) at 922,1580, 30 km N, on the reach's edge, the
northern tip of a small evaporite strand (869-922, 1555-1584) that Theodiga (65 km) and Strongwall (100 km) also lie nearest
to. Longsong's new pin is no better off than its old one: thin bedded salt (byte 11) and the nearest good rock salt 467 km
off, in the Catch. Salt for Longsong comes by trade, or from a brine spring the model does not hold.

## 5. Notes for the owner

### What stands out

- **Tallwalls is the richest place on the map.** The Free Giants' haven (no polity polygon in the geology) leads farmland
  (2,466 km²-eq, 2,432 km² of it over .7), pasture, tin, gold, silver, saltpeter (2,836 km² rich), good rock salt (128 km²
  over 100; Dilihan has 28, Qiblai 4), soda and skarn, and with them rice, coffee, mist tea and lotus silk. A sanctuary for runaway
  slaves that is also the best farm, tin and saltpeter (gunpowder) field in reach of both the Vothic Kingdom and Dalab is a
  story the lore can use, or a pin to reconsider if it should be poor.
- **Iron: Yuni, Spirladunon and Verge's new pin** (184, 170 and 155 good-ground node-yield, 440-780 km² of rich ore each,
  on granite, impact and crystalline ground). Verge's new pin falls inside the Yuni Emirate's polygon, so the Emirate holds
  two of the three best iron fields (280 km apart, along the east rim).
  Spirladunon (the Talovolci's cloud forest on the impact wall) also leads timber, building stone and nickel.
- **Mav's Refuge's new pin is the coal and oil capital** (147 and 43, 1,116 km² of rich coal) and third in farmland and
  timber: the move onto the Béesh Baatar set it in the Iziz basin's richest sedimentary ground. Pinnacle Rock and Iziz follow
  in both, and the two best unclaimed oil districts (1053,879, 34 km from Girder; 1020,815, 40 km from Bipo) are in the
  same basin.
- **Copper and rare earths belong to the volcanic and rift ground**: Zey'danin leads copper (80, 1,440 km² rich on the
  Throne's flank; no polity polygon covers it), Nulab, Sauropolis and Erehwon rare earths (35-41, on the rift). Kautoa leads
  sulfur (its vent), Shim fresh water (the klir Rivrh, 5,604 m³/s), Ys fish (1,528 km² of Ring Sea) and limestone.
- **The Xanadu south has no salt.** Erehwon (20,000 people), Strongbow, Theodiga and Strongwall score 0; Qiblai 24 (one cell
  at its reach's edge); Longsong 12.8. Nulab (Dalab Council) is the other city with none. The map's richest unclaimed
  evaporites (rock salt, gypsum, potash, soda and saltpeter together, 1060-1110 x 1385-1430) lie in the Catch with only
  Stair's campground 50-100 km off: a salt road from the Catch, or a salt town there, is the obvious fix.
- **Cities that sit on little.** Ardent (the Free Clans' city) has 201 farm-eq km² but none over .5, a timber score of 3
  and water of 14 (Dsb, 360 mm), though it leads thin rock salt and is second in saltpeter. Sauropolis has 186 farm-eq km²
  with 4 km² over .5 (hot XA). Verge's new bench has 190 (84 km² over .5) for a city of the abyss. Ys has only a corner of
  coal and marble over byte 100, and low-grade iron. Zey'danin has 327 farm-eq km² for a city.
- **Reed and the Tabist town are too hot to farm**: a mean of 39 °C at -2,300 m, past the 38 °C where `49r`'s warmth
  reaches zero. They eat from the lake (fish ~160), pasture (the town 186 km²-eq) and trade; the town has good iron (44).
  If the Tabisti are to farm, the farm index (or the model's abyss temperatures) needs a look.
- **The geology's bytes are coarse in a way the census shows**: gold and silver never pass 110 outside volcanic ground, so
  no settlement has rich gold; the placers (gold, tin) decide the gold table. Ultramafic rock and blast glass are reached by
  no living settlement (the arch in the far north; the blast basins 39-45 km from Babel and Necropolis, both ruins).


### Rich deposits no living settlement reaches

The best 10 km mining districts (a disc's node-yield, the same measure as a village's reach) beyond 10 km of every living
settlement's reach, on habitable ground (not airless, ice or hyperalpine, under 6,000 m), 60 km apart, three a family:

| Family | Where (px) | Node-yield | Peak, rich km² | Polity | Nearest living (km) | Nearest pin (km) | Ground |
|---|---|---|---|---|---|---|---|
| iron ore | 558,883 | 47.0 | 255, 312 | Iron Republic | Cascade 86 | Cascade 86 | Dfb, 3095 m |
| iron ore | 571,931 | 46.8 | 255, 388 | - | Cascade 180 | Span 161 | Dsc, 4177 m |
| iron ore | 595,1026 | 46.5 | 255, 388 | - | Shim 218 | Span 88 | Cfa, 2717 m |
| copper | 923,1650 | 28.1 | 240, 484 | Xanadu Sultanate | Strongwall 36 | Strongwall 36 | Dfc, 3634 m |
| copper | 753,1509 | 28.0 | 240, 484 | - | Erehwon 104 | Erehwon 104 | Dsc, 3595 m |
| copper | 475,1373 | 28.0 | 240, 476 | Dalab Council | Nulab 69 | Chimes 40 | Dfb, 2824 m |
| tin | 882,1020 | 25.2 | 200, 484 | Empire of Iziz | Pylon 44 | Pylon 44 | XA, -886 m |
| tin | 1552,834 | 25.2 | 200, 484 | - | Mungo 460 | Trickster's House 357 | Dfb, 3564 m |
| tin | 1732,980 | 25.2 | 200, 484 | - | Spindle Fan 468 | Spindle Fan 468 | BWk, 2220 m |
| nickel (with copper, platinum) | 402,179 | 14.1 | 180, 484 | - | Yith 490 | Yith 490 | Am, 171 m |
| nickel (with copper, platinum) | 479,129 | 14.1 | 180, 484 | - | Yith 636 | Yith 636 | Am, 117 m |
| nickel (with copper, platinum) | 436,161 | 14.1 | 180, 484 | - | Yith 544 | Yith 544 | Am, 84 m |
| gold | 516,1392 | 10.5 | 140, 0 | Fellgangs | Nulab 160 | Chimes 96 | Dfc, 4381 m |
| gold | 830,1392 | 10.5 | 140, 0 | - | Erehwon 252 | Pluton 216 | Dwb, 3751 m |
| gold | 442,1447 | 10.5 | 140, 0 | Fellgangs | Wildcat 32 | Wildcat 32 | Dsc, 3715 m |
| silver | 738,1501 | 11.3 | 150, 0 | - | Erehwon 137 | Cube 136 | Dsc, 4154 m |
| silver | 1054,1499 | 11.3 | 150, 0 | - | Strongbow 221 | Stair 154 | ET, 4552 m |
| silver | 926,1062 | 11.3 | 150, 0 | Empire of Iziz | Pylon 165 | Pylon 165 | Cfa, 2643 m |
| rare earths | 939,1516 | 10.5 | 190, 484 | Xanadu Sultanate | Theodiga 72 | Theodiga 72 | Cfa, -27 m |
| rare earths | 939,1552 | 10.5 | 190, 484 | Xanadu Sultanate | Theodiga 70 | Theodiga 70 | Cfb, 265 m |
| rare earths | 779,1517 | 10.5 | 190, 484 | - | Erehwon 52 | Erehwon 52 | Csa, 632 m |
| coal | 573,172 | 52.9 | 228, 484 | - | Boatmurder 603 | Boatmurder 603 | Am, 9 m |
| coal | 588,139 | 52.4 | 227, 484 | - | Boatmurder 638 | Boatmurder 638 | Am, 7 m |
| coal | 977,937 | 52.2 | 227, 484 | Empire of Iziz | Fort Vaklu 51 | Fort Vaklu 51 | XA, -1455 m |
| oil | 1053,879 | 11.7 | 168, 0 | - | Girder 34 | Girder 34 | XA, -1324 m |
| oil | 1020,815 | 11.2 | 158, 0 | - | Bipo 40 | Bipo 40 | XA, -1256 m |
| oil | 605,190 | 10.9 | 157, 0 | - | Boatmurder 535 | Boatmurder 535 | Am, 202 m |
| sulfur | 935,797 | 98.4 | 252, 304 | Kautoa | Valapo 33 | Valapo 33 | Af, -509 m |
| sulfur | 895,971 | 95.4 | 252, 288 | Empire of Iziz | Port Tobin 74 | Port Tobin 74 | Af, -799 m |
| sulfur | 910,933 | 93.7 | 252, 288 | Empire of Iziz | Port Tobin 91 | Port Tobin 91 | XA, -1245 m |
| saltpeter | 1068,1409 | 32.0 | 240, 484 | - | Strongbow 397 | Stair 100 | ET, 406 m |
| saltpeter | 1679,826 | 31.5 | 240, 484 | - | Spindle Fan 670 | Trickster's House 470 | BWk, 660 m |
| saltpeter | 1099,1418 | 31.1 | 240, 484 | - | Strongbow 406 | Stair 50 | BWk, 422 m |
| rock salt (halite) | 1080,1428 | 61.6 | 243, 352 | - | Strongbow 371 | Stair 59 | ET, 457 m |
| rock salt (halite) | 1169,1150 | 33.4 | 234, 152 | - | Mantis 115 | Mantis 115 | BSh, -1114 m |
| rock salt (halite) | 1020,1395 | 32.8 | 250, 176 | - | Theodiga 358 | Stair 196 | BWk, 386 m |
| gypsum | 1081,1428 | 52.9 | 239, 384 | - | Strongbow 372 | Stair 57 | ET, 457 m |
| gypsum | 1163,1157 | 35.3 | 253, 176 | - | Mantis 100 | Mantis 100 | Aw, -1038 m |
| gypsum | 1051,1386 | 31.6 | 253, 120 | - | Theodiga 413 | Stair 156 | ET, 417 m |
| potash | 1069,1415 | 32.3 | 178, 16 | - | Strongbow 386 | Stair 91 | BWk, 343 m |
| potash | 1262,847 | 31.6 | 223, 80 | Nomad Country | Mungo 125 | Mungo 125 | BWh, 414 m |
| potash | 729,641 | 27.8 | 250, 120 | Dilihan Province | Dilihan 53 | Dilihan 53 | XV, -1454 m |
| soda (alkali salts) | 1069,1415 | 44.6 | 245, 152 | - | Strongbow 386 | Stair 91 | BWk, 343 m |
| soda (alkali salts) | 1109,1408 | 34.6 | 245, 168 | - | Strongbow 433 | Stair 68 | BWk, 377 m |
| soda (alkali salts) | 1044,1384 | 23.9 | 241, 136 | - | Theodiga 406 | Stair 169 | ET, 331 m |
| marble | 708,772 | 21.3 | 230, 200 | - | Tethis 50 | Fort Ebon 32 | Aw, -872 m |
| marble | 576,867 | 20.8 | 104, 0 | Iron Republic | Cascade 54 | Cascade 54 | Dfb, 2927 m |
| marble | 576,912 | 20.8 | 104, 0 | - | Cascade 142 | Cascade 142 | Dfc, 5325 m |
| ultramafic rock | 474,237 | 484 km²-eq | 255, 484 | - | Yith 443 | Yith 443 | Am, 231 m |
| ultramafic rock | 479,131 | 484 km²-eq | 255, 484 | - | Yith 632 | Yith 632 | Am, 192 m |
| blast glass | 475,914 | 363 km²-eq | 255, 392 | - | Veil 161 | Babel 39 | Cfa, -21 m |
| blast glass | 397,965 | 312 km²-eq | 255, 336 | - | Veil 273 | Necropolis 45 | Csa, -25 m |
| limestone (karst) | 1300,117 | 484 km²-eq | 255, 484 | - | The Gate 500 | The Gate 500 | Cfa, 2094 m |
| limestone (karst) | 1152,141 | 484 km²-eq | 255, 484 | - | The Gate 681 | The Gate 681 | Cfa, 1334 m |
| impactite | 762,598 | 484 km²-eq | 255, 484 | Free Clans | Jimjam 109 | Jimjam 109 | Dfb, 4097 m |
| impactite | 869,1066 | 484 km²-eq | 255, 484 | Talovolci Chiefs | Pylon 128 | Pylon 128 | ET, 5366 m |
| tuff (volcanic ash) | 179,324 | 282 km²-eq | 200, 64 | - | Yith 383 | Yith 383 | Am, 99 m |
| tuff (volcanic ash) | 1624,1169 | 278 km²-eq | 200, 64 | Yuni Emirate | Spindle Fan 138 | Spindle Fan 138 | ET, 3850 m |
| skarn | 558,882 | 207 km²-eq | 200, 264 | Iron Republic | Cascade 84 | Cascade 84 | Dfb, 2974 m |
| skarn | 563,939 | 194 km²-eq | 200, 248 | - | Cascade 196 | Span 143 | Dfb, 3782 m |

### The best farmland no living settlement reaches

A 10 km district's farm-eq km² (a village's reach holds at most ~314):
- anywhere: 1385,131, 484 km²-eq, Cfa, 15 °C, 972 mm, 2366 m; no polity; nearest living The Gate, 404 km.
- anywhere: 1460,131, 484 km²-eq, Cfa, 15 °C, 941 mm, 2376 m; no polity; nearest living The Gate, 392 km.
- anywhere: 1185,90, 484 km²-eq, Cfa, 22 °C, 878 mm, 1275 m; no polity; nearest living The Gate, 691 km.
- anywhere: 1266,90, 484 km²-eq, Cfa, 21 °C, 847 mm, 1411 m; no polity; nearest living The Gate, 584 km.
- within 150 km of a living settlement: 674,1309, 484 km²-eq, Cfa, 11 °C, 894 mm, 2624 m; no polity; nearest living Tallwalls, 95 km.
- within 150 km of a living settlement: 525,705, 484 km²-eq, Csa, 21 °C, 1066 mm, 1022 m; Eternal State; nearest living Lux, 134 km.
- within 150 km of a living settlement: 393,849, 484 km²-eq, Csa, 20 °C, 909 mm, 994 m; Eternal State; nearest living Veil, 112 km.
- within 150 km of a living settlement: 705,914, 484 km²-eq, Aw, 28 °C, 972 mm, -735 m; Vothic Kingdom; nearest living Almua, 67 km.

The living settlements' reaches (plus 10 km) cover 191348 of 11112504 km² of land (1.7%).

