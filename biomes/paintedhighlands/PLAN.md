# paintedhighlands: the plan (draft 2026-10-23; build plan 2026-11-09)

The **painted highlands** (`rmvkam8s13kwu`): the high plateau west of Korona, between the eastern Inner Wall and Korona's
rings. Bare hills banded red, ochre, cream, mauve, green-grey and teal, and every spring, after the snowmelt, flats and
slopes of wildflowers in drifts of colour. The Painted Men's country.

Owner's brief (2026-10-23): the plateau by Korona is a new biome, the painted highlands, with spectacular bands of
exposed rock and colourful wildflowers.

**Status: plan, awaiting the owner.** Nothing built. Kits come after the rebuild's frozen integration pass; this is a plan
only. The 2026-11-09 pass re-read every number from map 5.1 and wrote the stations, hazards and core table.

| | |
|---|---|
| Folder | `biomes/paintedhighlands/` (the usual kit layout: `src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`) |
| Pages | `dist/paintedhighlands.html` (station 1), `-bloom`, `-canyon`, `-cliff` (section 7) |
| Object | `PAINTED` (`build`, `dress`, `SPECIES`, `PLANTS`) on the `BIOME-API.md` contract |
| Read in place | `biomes/korona` (its western ring species at station 4), `biomes/ehighlands` (cushions on the highest ground), `biomes/nhighlands` (a few steppe and rim plants); nothing copied |
| Out of scope | the Painted Men's villages as settlements (a settlement plan; the kit leaves the cliff ledges for them), Korona's moat itself (Korona's kit) |

## 1. What the map carves (map 5.1)

The numbers were read from the model on 2026-11-09 (`smodel.page` at `gemini/scale-model-5.1-r3`). The region store already
holds this polygon in **5.1 px** (the 4.21 draft's px 634-915 by 202-349 plus 272, 330), so no shift is needed. The carving
is `smodel/tranche2_biomes.py` section 3C, written in old px; its points below are shifted to 5.1.

- **Size:** 15,265 cells of 2 km, **61,060 km²**, px x 906-1186, y 533-678 (the draft's 61,700 km² is close).
- **Heights:** p5/p25/p50/p75/p95 = 1,831 / 2,774 / **3,290** / 3,580 / 4,080 m; the top is 4,535 m. The median is
  100 m lower than the draft's 3.4 km.
- **The plateau and its two edges.** The polygon is not all plateau. It reaches down the Inner Wall to the crater at its
  north-west tip (px 953,532 is at -55 m), and **Korona's western moat cuts across its east half** (at y=600 the ground falls
  from 2,160 m at x 1046 to -1,378 m at x 1076 and climbs back to 2,086 m at x 1176). 4,556 km² lie under 2,000 m and
  268 km² under sea level. The painted plateau proper is the 46,700 km² between 2.5 and 4 km.
- **What Gemini carved** (`tranche2_biomes.py` 3C):
  - **Danxia cuesta hogbacks** striking NNW-SSE, a wave of 10 km, ±165 m, with steep east scarps and gentle west dip slopes.
  - **Four superbloom playas** in synclines. Three survive on 5.1: px 974,594 (3,252 m), **1008,626 (3,393 m)** and
    1094,636 (3,334 m), each flat to 30-50 m over 6 km. The fourth (planned at px 1060,598, 3,380 m) falls in Korona's moat
    on 5.1 (-671 m): it is gone.
  - **The Painted Canyon**, 560-580 m deep, from px 1007,608 east to Korona's moat at about 1098,622. At px 1034,615 its
    floor is 2,900 m and its rims 3,253-3,411 m. It ends in a lake of 80 km² at **517 m** in the moat (centre px 1095,622).
    `STATIONS-MAP-5.1.md` lists the canyon and the playas as "followed the plans".
- **Slope:** median 3.1°, p90 6.8°; 21% of cells over 5° at 2 km. The hogbacks and the canyon give 300-950 m of relief
  within 6 km; the playas give 30 m.
- **Water.** No river record crosses the polygon on 5.1, and no lake lies on the plateau. The lakes inside the polygon are
  at its edges: two crater lakes at the north-west tip (px 948,532, 268 km², -216 m; px 942,543, 332 km², -267 m), two
  moat lakes (px 1132,603 and 1139,600, 144 km² together, -195 m) and the canyon's mouth lake (517 m). The plateau's water is
  snowmelt in the washes and on the playas, seasonal only. River names, when the model gives any, come from the `painted`
  tongue (`smodel/river_names.py`: the Painted Men's pitch-accent speech).
- **Regions over it:**
  - the political **Painted Men** (`rmumc14txxzq9`): 48,992 km², 80% of the biome and 89% of their own polygon;
  - **Nomad Country**, 5,120 km², at the south-west;
  - the geographic **Korona / NE** covers nearly all of it (60,812 km²);
  - **Inner Crater**, 26,516 km² (the crater-facing half);
  - slivers: the Tiers (1,684), Shell Province (876), Coyote Kingdom (868).
  - The open world's **`little-demo`** polygon covers 57,184 km², so this kit's flora will be read into that region's
    streaming.
- **Settlements:** none inside or within 24 km. Pinnacle Rock (the Beast Riders' roost, px 1027,681) is about 60 km south,
  in the hyperjungle N.
- **Neighbours:** Korona (built) to the east and in the moat; the Inner Wall and the crater below it to the west; the N
  highlands to the north; the hyperjungle N to the south.

## 2. Geology and landforms

**Why the rock is bare.** At 3-4 km the plateau gets 231 mm a year (section 3). Below about 300 mm plants never close
over a slope, so the beds stay exposed, as at China's Zhangye (about 200 mm) and Oregon's Painted Hills (about 300 mm).

**The rock: two recipes already in core** (`core/terrain/35-core-strata.js`, written for this kit and ebadlands):

| Recipe | What it is | Where |
|---|---|---|
| `badland` | thin soft clays and ash beds (0.3-3 m), **no bed the same as the one under it**: pink, cream, gold, grey, maroon, mauve, green-grey, a rare teal (2%), ash and lignite partings; `wash 2.5`, `regolith .85` (the clay's own popcorn cover) | the rounded hills, the playas' rims, the washes |
| `danxia` | thick hard red, orange, yellow and white sandstones and conglomerates (2-30 m) with thin soft partings; steep walls | the hogbacks' scarps, the fins, the canyon walls |

The real model: the Painted Hills are volcanic ash weathered to clays (the John Day Formation), and Zhangye is Cretaceous
red sandstone tilted by the Qilian Shan. *Proposed*: the plateau is a **basin fill** laid on the Inner Wall's back, ash and
lake clays (the `badland` stack) under fluvial red beds (the `danxia` stack), then folded NNW-SSE as Gemini's hogbacks
show. One stack of two formations, `badland` below and `danxia` above, with the fold on `KSTRATA`'s `fold` option. The
canyon cuts through both, so its walls show the whole column. The teal bed (celadonite clay, or malachite where it is
copper) is the Painted Men's pigment (section 5).

**Landforms and what draws each:**

| Landform | Core |
|---|---|
| the hogbacks and their dip slopes | the model's ground, `KSTRATA` (`fold`) for the beds' tilt |
| rounded clay hills, rills, popcorn surface | `KRELIEF` badland relief (ebadlands' kinds: `dome`, `wadi`, `talus`), `KSTRATA` `badland` with `wash` |
| fins, buttes and hoodoos on the scarps | `KSTACKS.contour` and `KSTACKS.weather` (a profile with the strata's joints) |
| the canyon walls, its mid-wall bench | the model's carve; `KSTRATA` `danxia`; `KRELIEF.stepcut` for the stepped wall if the model's bench is too soft at 1:1 |
| the playas (flat, mud-cracked after the melt) | the model's ground; `KGROUND` `polygon` (mud cracks) |
| dry washes on the dip slopes | `KRELIEF` `wadi` |
| the moat cliff (station 4) | the model's ground, `KSTACKS` on the face, `talus` below |
| snow lying in winter and in the lee | `snowCover`, lee drifts (`BACKPORT.md` section 5) |

**The shader caveat.** `KSTRATA.vary` is not needed here: the beds are folded, not draped. The shaders draw the folded
column (`BIO.strata`), so the stripes read on the GPU; check this at P1.

## 3. Air and climate

**Air** (Copper Glacier's figures, 1.19 atm at 2,380 m and 0.71 atm at 6,500 m): 1.13 atm at 2.75 km, 1.07 at 3.25 km,
1.00 at 3.75 km, 0.94 at 4.25 km. Thin air is not a hazard here.

**Climate by band** (the model's `p`, `tm`, `tw`, `tc` and class rasters):

| Band | km² | Rain | Mean (warm/cold) | Classes |
|---|---|---|---|---|
| under 2 km (moat and crater edge) | 4,288 | 1,050-1,570 mm | +17 to +24 | Cfa, Csa: Korona's and the crater's, not this kit's |
| 2-2.5 km | 5,648 | 800 mm | +15.5 (27/4) | Cfa 40%, BSk 27%, Csa 15% |
| 2.5-3 km | 10,384 | 455 mm | +12.7 (25/1) | BSk 51%, Csa 18%, Cfa 15% |
| **3-3.5 km** | 20,956 | **231 mm** | +9.5 (22/-3) | **BSk 62%**, Dfb 9%, Dsb 8% |
| **3.5-4 km** | 15,388 | **231 mm** | +6.9 (20/-6) | BSk 49%, **Dsb 22%**, Dfb 14% |
| 4-4.5 km | 4,088 | 248 mm | +3.7 (17/-9) | Dfb 31%, Dfc 30%, BSk 27% |
| over 4.5 km | 40 | 191 mm | +1.6 | Dfc |

Over the whole polygon: BSk 28,736 km² (47%), Cfa 6,456, Dsb 6,124, Dfb 5,628, Csa 4,264, Dsc 3,040, BWk 2,740.

- **A cold steppe with winter snow.** The plateau is cold steppe (BSk), with dry-summer continental (Dsb, Dsc) on its
  higher half. The draft's "Dsb 25%" is now 15% (Dsb and Dsc), and the top band is Dfb and Dfc, not dry-summer.
- **Why the bloom.** The cold months are below freezing at 3 km and over, so the winter falls as snow and melts in
  spring. That gives a spring flush on the melt, then a dry summer: the pattern of every real superbloom.
- **The dry heart** is the canyon's reach and the playas: 125-190 mm (px 1034,615: 125 mm; 1008,626: 173 mm).
- **Wind:** the model's wind is from the north-west. *Proposed*: dust off the playas in late summer, as `core/atmos`'s dust
  load (the dust season, `fx/89-atmos-fx-dustseason.js`), light.

## 4. Life

### Flora: the steppe and the bloom

The **bloom** runs on the world clock (`core/clock`, the season):
- a green flush in early spring;
- the flowers in drifts by soil: each bed's clay favours its own flowers, so the drifts echo the stripes;
- seed and straw by late summer;
- snow in winter.

Earth models, renamed as each kit does:
- the bloom: lupins and penstemons (Great Basin), globe mallow, paintbrush, blazing star, desert dandelion, evening
  primrose, Namaqualand's daisies, the Atacama's pata de guanaco;
- between them: bunchgrass steppe, sagebrush and rabbitbrush;
- junipers on the scarp rims and in the canyon;
- cushions from `ehighlands` on the ground over 4 km.

**Zones** (*proposed*; each a mask on the kit's fields):

| Zone | Where | What |
|---|---|---|
| `bare` | slopes over ~15°, the clay hills, the scarps | almost nothing: the beds show; lichen on the `danxia` |
| `bloom` | the playas and the washes' floors, gentle dip slopes | the spring drifts over a thin grass; the drift's species by the bed under it |
| `steppe` | the gentle ground between | bunchgrass, sage, rabbitbrush, a spring flush of small flowers |
| `rim` | scarp tops and the canyon | junipers, mountain mahogany, cliff penstemons |
| `cushion` | over 4 km | `ehighlands`' cushions, read in place |
| `ecotone` | the moat's lip (station 4) | Korona's western ring species read in place, thinning upward |

**One fruit, one staple, one medicine** from the kit's flora go into `kits/crops`. It has no `paintedhighlands` entry yet.
*Proposed*: `paintedhighlands: {atm: 1, zones: {steppe, bloom, rim}}` in `10-crop-core.js`, with:
- a juniper berry as the fruit;
- a bulb (a camas or a mariposa lily) as the staple;
- the paintbrush or a sage as the medicine.

**The Painted Men's pigments come from these rocks.** Mineral dyes go into `kits/crops`, and into DYES.md, which gives the
Painted Men black, red and teal:
- manganese black;
- iron red (beside the existing `falu-red`);
- a teal from the teal bed: celadonite, or malachite where it is copper (`rock.malachite` is in the library).

### Fauna (for `kits/fauna`)

*Proposed*, a steppe herd and the bloom's small life:
- a pronghorn-like grazer in herds on the steppe;
- ground squirrels and marmots in the clay hills;
- raptors on the scarps' updraughts;
- the bloom's pollinators, as swarms: bees, a painted-lady-like butterfly;
- a few strays up from Korona's ring at station 4.

The fauna kit owns them all, as `BIO.record` records; the kit only names where they live.

## 5. People

- **The Painted Men** (`LORE.md` §6.5) hold 80% of the plateau. They are raider tribes of the high country. Their villages
  are **cliff settlements hung on rock faces**, of raw logs and bamboo, with whole painted house-fronts, totems,
  thunderbird finials and stone circles. Their sign is the raven.
  - They sit on the Inner Wall beside Korona and have long traded and married with its tepui tribes.
  - Their speech is the pitch-accent highland tongue (`lore/tongues-of-krator.html`, the Republic tab).
- **The logs.** The plateau grows junipers, not timber. *Proposed*: the logs and bamboo come up from Korona's moat forest
  (Cfa, 800-1,500 mm), and the cliffs they hang their villages on are the moat's and the canyon's. That puts their towns on
  the plateau's edges, not on it; the plateau is their grazing, raiding and pigment ground. The owner's call (section 9).
- **The paint.** Their house-fronts are painted from the beds: red, black, teal. *Proposed*: pigment pits and quarry
  benches cut into the bright beds (a `KCAMP` work camp, `core/camp`), and stone circles on the playas' rims.
- **Nomad Country** (5,120 km²) touches the south-west: nomad camps by season (`core/camp`).
- **No NPC hamlet** is placed by this kit. If the owner wants one (a pigment village), it goes in `core/hamlet`, not in the
  kit.
- **Player outposts.** No spot is picked for the player. The open world's player-settlement registry may read this kit's
  hints, and nothing is drawn for them: the playas' rims (water in spring, flat ground), the canyon's floor (shelter,
  water), the cliff ledges (defence).

## 6. Dangers

Each maps to a `KHAZ` kind (`core/hazard/README.md`) or a provider.

| Danger | Where | `KHAZ` |
|---|---|---|
| **Flash floods** in the canyon and the washes after the melt and summer storms | the Painted Canyon, the washes | `drown` and `crush`, timed: the **gorge flood** amendment other plans already list (section 8) |
| **Wet clay** (bentonite is slick when wet and sticky when soaked) | the clay hills after rain and melt | `slip` on the slopes, `sink` (slow pace) on the playas' mud |
| **Cliffs** | the canyon walls, the hogbacks' scarps, the moat cliff | `fall` |
| **Rockfall** from the `danxia` walls | under the scarps and in the canyon | `crush`, near the talus |
| **Winter cold** (coldest month -3 to -9 °C over 3 km) | everywhere in winter | `KHAZ.provide('temperature')` |
| **Lightning** on the bare plateau in summer storms | open ground | the shared sky's lightning (no `KHAZ` kind: a weather sign) |
| **The Painted Men** (raiders) | their country | not a `KHAZ` kind: the open world's faction rules |

The signs: the roar and a brown wall in a wash; a dark sheen on the clay; fresh rock at a cliff's foot.

## 7. Stations

World km = 5.1 px × 2. Each page is the usual 5.2 km square. Heights are the model's at the cell.

| Station | 5.1 px | Ground | What it shows |
|---|---|---|---|
| **1 The stripe badlands** (`paintedhighlands.html`) | **986,635** | 2,926 m; 2,470-3,358 m within 6 km; BSk, 157 mm, +11 (21/0) | rounded banded `badland` hills and rills, a hogback's `danxia` scarp with fins, the bloom in the washes, popcorn clay |
| **2 The bloom flats** (`-bloom`) | **1008,626** | the playa at 3,393 m, flat to 31 m; Dsb, 173 mm, +9 (22/-4) | the playa in full spring flower against a banded scarp; mud cracks after the melt; stone circles on the rim; a pigment pit |
| **3 The banded canyon** (`-canyon`) | **1034,615** | floor 2,900 m, rims 3,253-3,411 m; BSk, 125 mm | the canyon cut through the whole column, the colours deepest on its walls; junipers on the ledges; the flood's marks |
| **4 The moat cliff** (`-cliff`, optional, the ecotone) | **1113,624** | the rim at 3,093 m; 2,245 m within 6 km; Korona's moat lake at 517 m, 15 km west | the plateau's edge over Korona's moat: a Painted Men's cliff village's ledges (for a settlement plan), Korona's ring species climbing the face |

**Station 1 comes first:** it holds the kit's centre (the two strata recipes, the bloom and the steppe) in one view, and it
is the strata upgrade's test bed for ebadlands and sedesert as well. Station 2 follows because the bloom needs the
season's clock. Station 4 waits for Korona's species list, read in place.

Alternatives, if the owner prefers: the westernmost playa (px 974,594, 3,252 m, BSk) for station 2; the scarp at px
954,611 (3,671 m, 811 m of relief) for a higher, colder station 1.

## 8. Core adoption

The table of `README.md` "CORE MODULES ARE NOT OPTIONAL", for this kit:

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| placement mask | `core/mask` (`KMASK.canvas`) | the zones; never `getImageData` |
| tags | `core/tags` | every plant, stack and hazard registered before it is drawn |
| space | `core/space` (`KSPACE`) | the biome core's occupancy |
| the beds | `KSTRATA` (35), recipes `badland` and `danxia`, `fold` | one folded stack; the canyon cuts it |
| relief | `KRELIEF` (38): `dome`, `wadi`, `talus`; `38c` `stepcut` for the canyon's bench if needed | the clay hills, the washes, the scarps' feet |
| stacks | `KSTACKS`, `KSTACKS.contour`, `KSTACKS.weather` | fins, hoodoos, buttes, the moat cliff |
| ground | `KGROUND` (43): `polygon` (playa cracks), `clast` (scree) | the ground shader; the strata wash on the slopes |
| horizon, far | `KHORIZON` (45), `KFAR` (44) | the far hogbacks, Korona's tepuis on the eastern horizon |
| snow | `snowCover`, lee drifts | winter |
| water | `core/water` (`WATER.flow` for a wash in flood, `WATER.hollows` for melt puddles on the playas) | seasonal water only |
| flora | `core/biome` (`CORE_BIOME`), `BIO.LOD`, impostors, `check_cells.py --fix` | the universal set (`BACKPORT.md` section 1) |
| season | `core/clock`, `core/biome` season | the bloom's calendar |
| sky, weather | `core/atmos` | the shared sky, height fog, lightning, the dust load in late summer |
| hazards | `core/hazard` (`KHAZ`) | section 6 |
| camps | `core/camp` (`KCAMP`) | pigment works, nomad camps |
| fauna | `kits/fauna` | section 4 |
| crops | `kits/crops` | a new `paintedhighlands` entry |
| resources | `kits/resources` | *proposed*: copper (low grade) at the teal bed; read the geology at build |
| shadows | `core/shadow` | off at load |
| host, export, materials | as every kit | `materials.json`, `tools/textures/pack.py` |
| city, hamlet | `core/city`, `core/hamlet` | no: the kit places no settlement |

**Core amendments needed:**
1. **The gorge flood** (a timed `drown` and `crush` that runs a channel): already listed by other plans (firebliss and
   others); cite it, do not re-propose it.
2. **A season-keyed flower drift** that follows a strata bed: *proposed* as a kit-side mask (the drift's species read from
   `S.at` at the ground), not a core change. If two kits want it (ebadlands' spring?), it moves to `core/biome`.
3. **The player-settlement registry** (open world): this kit offers hints only.

## 9. For the owner

- **Where the Painted Men live.** On the plateau, or on its cliff edges with timber from Korona's moat forest (section 5)?
  The lore's logs and bamboo point to the edges.
- **The lost playa.** Gemini's fourth playa fell into Korona's moat on 5.1. Keep three, or ask for one moved?
- **The polygon.** It takes in part of Korona's moat and a strip of the crater's edge. Trim it to the plateau, or let the kit
  hand those edges to Korona and the crater kits as ecotones?
- **Names.** The canyon, the playas and the hogbacks have only English names. Do they take Painted Men names (the `painted`
  tongue)?
- **The teal bed.** Copper (a resource node, `kits/resources`) or a clay (pigment only)?
- **The fourth station:** wanted, or does Korona's kit cover the moat cliff?

## 10. Textures

In the library: `ground.clay.popcorn`, `rock.sandstone.bedded.red`, `ground.playa.red`, `rock.gossan`, `rock.malachite`,
`ground.steppe`, `card.grass.dry`. To source or generate (prompts first):
- banded badland rock: one greyscale bedded tile tinted by the strata field (cheaper and preferred), or tiles in the bed colours;
- flower cards for the bloom.

**The prompts**: `core/materials/PROMPTS-NEEDED.md` section 9 (2026-10-23).

## 11. Order of work

- **P0.** The owner approves; the station sites confirmed; texture prompts written.
- **P1.** Station 1's ground on `KSTRATA` (`badland` under `danxia`, folded), relief and stacks.
- **P2.** The steppe, the bloom and its clock.
- **P3.** The crops and dyes; the fauna records.
- **P4.** Stations 2, 3 (and 4).
- **P5.** `verify.py --assert`, `PORT.md`, `tools/check_core_use.py`, the gallery (a new biome).

## Sources

- the owner's brief, 2026-10-23;
- the model at `gemini/scale-model-5.1-r3`, read with `smodel.page` (2026-11-09): heights, water, `p`, `tm`, `tw`, `tc`, `c`;
- `tools/scale-model/model/src/51-region-store.js` (the polygon, the Painted Men, the overlaps), `60-settlements.js`;
- `smodel/tranche2_biomes.py` section 3C (hogbacks, playas, the Painted Canyon); `smodel/river_names.py` (the `painted` tongue);
- `biomes/STATIONS-MAP-5.1.md`; `BACKPORT.md` sections 1 and 5;
- `core/terrain/35-core-strata.js` (`badland`, `danxia`), `core/terrain/LANDFORMS.md`, `core/hazard/README.md`;
- `LORE.md` §6.5 (the Painted Men);
- `kits/crops/src/10-crop-core.js` (no entry yet).
