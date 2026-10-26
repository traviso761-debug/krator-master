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
| Deep limestone shafts | where lake limestone is thick enough | weak | Alpine shafts want hundreds of metres of marine limestone a dry world seldom has |
| Ice caves | the high rim's glaciers | where the ice is | meltwater caves and ice-filled shafts |

At 0.75 g a roof carries three-quarters of Earth's load, so chambers span about a third wider. **What it gives the
region**: long, level galleries make a natural transit network, and **the Ancients' tunnels join them** where they can;
the warm, wet hypogene chambers are refuges from the rim's winters and **the Tungangs' holds** (section 6); the
springs at the great lake's foot are the caves' outflow. The cave kit is `core/terrain`'s caverns (`39-core-cavern.js`, as
Pinnacle Rock's Deep Root and Zeijani's tubes), not a new module.

## 5. Ledge: the hub and the bridge (settled 2026-10-23 unless marked)

- **Ledge is the Ancient arcology**, and the settlement takes its name. It is **where the Ancients' Rift line comes out
  of the Wall** (`LORE.md` §4): the tunnels under the Outer Wall came out above it, and the line ran on to the Ancients'
  Rift settlements, less extensive than those up north but substantial. **Their hub was Cube (Arccube)**, deep in the
  Lizardmen's country (px 448,1237): the owner's most settled point, and **the reward for a player who braves the
  Lizardmen**. The rest are **very tentative** in name and place (*proposed*: Chimes at the gorge's foot, Cthonos, The
  Tubes; Pluton, on the Godthrone's airless flank, is the key to the Ancients' own tunnels up the Godthrone, settled
  2026-10-23: `openworld/ANCIENT-ROADS.md` section 3).
- **It is a bridge between two levels**: the highland where Dalab's road comes out of the tunnels (the cliff top, ~1.6-2.5
  km) and the basin and lake ~1.3 km below it (after 4.22). Holding it means working both: the road's terminus, stores
  and stables above; the fields, the harbour and the way to the gorge below; the arcology between them, built into the
  cliff, its lifts, inclines and stairs the only way up and down.
- *Proposed*: the Ancient lifts are why Dalab's hold depends on others. The genepriests can mod a porter for the cold
  and the air, but they cannot run the cliff's machinery alone, nor find their way underground (section 6).
- **The point**: Ledge's marker stood on a water cell on 4.21 (px 160,1007). **Moved with 4.22 to px 165,1000**, the
  cliff where the road comes down (1,638 m, ~1,340 m over the lake, +14 °C, Csa): the upper level; the arcology runs down the cliff
  from it to the shore.
- **Theme** (*proposed*): a transit hub first (terminus halls, the lift shafts, sidings cut into the rock), with the gene
  bank as a second story: Dalab came for the line's road and stayed for what the arcology's gardens and vaults hold.

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
3. **The Rift's ruins**: Arccube is the hub (settled); the others' names and positions are very tentative (the owner):
   whether Chimes, Cthonos and The Tubes stay, move or go (Pluton is settled: the key to the Godthrone's tunnels).
4. **Ledge's own build** (the arcology on both levels, Dalab's quarter, the Tungangs at the lifts) is a settlement plan of its
   own (`settlements/ledge/`), after this kit's station 1.
5. **Chimes may be "The Span"** (the owner, 2026-10-23: the model's Rift settlements need a rework). The name **Span** is
   already a Dalab outpost on the model (a wrecked arcology, px 282,680, `LORE.md` §6.1): keep both, rename one, or move
   Dalab's Span to the gorge. An arcology that spans the great lake's gorge would suit the name.
6. **The model's Rift settlements** want a rework of their own (names, places, types), with Arccube fixed.
7. **The three rims' flora** (section 3, proposed 2026-10-23, the owner's "great proposal"): settled that Dalab brought up
   the most useful plants it could; which ones (the W highland's list) is proposed.
8. ~~The model's polygon~~: split into `rift rim N` and `rift rim S` on the model (the owner, 2026-10-23; done).
