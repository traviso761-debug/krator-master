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

### Crops (a proposal, 2026-11-09)

`kits/crops` has no `paintedhighlands` entry. The list below is what the kit itself answers: `CROPS.at` run in node over
each zone's climate (`kits/crops/src/*`, loaded as `tests/test-crops.js` loads them), with iron and copper nodes in reach.
The model's `tm`, `tw`, `tc` and `p` rasters were read; the bands are **assumed** (the kit names bands, not numbers):
warmth by the warmest month (polar under 10 °C, cool 10-20, temperate 20-26, subtropic 26-30); aridity by rain (arid under
250 mm, semiarid 250-500, subhumid 500-900, humid 900-1,600, wet over); atm `standard` (1.0-1.13 atm).

**The entry it needs** (*proposed*, in `10-crop-core.js`):
`paintedhighlands: {atm: 1, zones: {steppe: {warmth: [2, 2], arid: [0, 0]}, high: {warmth: [1, 1], arid: [0, 0]},
lower: {warmth: [2, 2], arid: [1, 1]}, wash: {warmth: [2, 2], arid: [0, 1], wet: true}, ledge: {warmth: [3, 3], arid: [2, 2]}}}`
- `steppe`: the plateau at 3-3.5 km (231 mm, +9.5 °C (22/-3), BSk); `high`: 3.5-4.5 km (231-248 mm, 17-20/-6 to -9, Dsb, Dfb);
  `lower`: 2.5-3 km (455 mm, 25/1); `wash`: the canyon floor and the washes on the melt (125-190 mm, irrigable);
  `ledge`: the cliff towns' gardens at 2-2.5 km on the moat and canyon-mouth walls (800 mm, 27/4, Cfa).

**What grows** (the kit's answer, by bucket; crops that are clearly other cultures' own are left out):

| Bucket | Rain-fed | Irrigated (washes, seeps, the melt) |
|---|---|---|
| grain | basin amaranth (plateau); emmer (lower plateau, ledges) | emmer, frostoat, bistort (high) |
| pulse | | helix bean |
| tuber | sweetroot, snow potato (high); murnong (lower); sweet potato, ashroot (ledges) | murnong |
| nut | pinyon (lower, ledges); acorn, wingnut (ledges) | pinyon, stonepine (high) |
| fruit | apricot, canyon grape (lower); pomegranate, fig, cherry (ledges) | apricot, crabapple, cherry, canyon grape |
| berry | silverthorn; serviceberry, sunthorn, madrone (lower) | serviceberry, rowan, bilberry |
| spice, herb | juniper, umbel seed; monk's sage, circle lichen; goldroot (high) | saffron, monk's sage |
| oil | whorl olive (ledges) | |
| fibre | cotton, flax (ledges) | flax |
| cordage, weaving | rope-puff (ledges); willow (ledges) | willow, rope-puff |
| beverage | rattlepod, ivan-chai | |

The plateau itself (231 mm, `arid`) grows little rain-fed: basin amaranth, juniper, silverthorn and lichen. The Painted
Men's food comes from the **ledge gardens** at their cliff towns, the **washes and the canyon floor** on the melt, and the
herds; that fits their towns on the edges (section 5). The draft's own three (a juniper berry, a bulb, a medicine) stay as
the kit's natives to add: `juniper` is in the kit already; a camas or mariposa-lily bulb and a paintbrush medicine are new
records with `home: ['paintedhighlands']`.

**The Painted Men's paint** (black, red and teal, `LORE.md` §6.5): the kit's mineral dyes answer two of the three.
- **Red:** `falu-red` and `hill-terracotta` (iron node: the red `danxia` beds; `kits/resources` must place the iron).
- **Teal:** `verdigris` (copper node) if the teal bed is copper (section 9); if it is celadonite clay, a new record,
  *proposed* `celadonite-teal` (`node: null`, a clay dug from the bed).
- **Black:** nothing on the plateau. `birch-tar` (black) grows only irrigated on the high ground; `tar-black` needs oil.
  *Proposed*: a new mineral record, `lignite-black`, from the `badland` stack's own lignite partings (`node: 'coal'`), or
  `manganese-black` if `kits/resources` gains a manganese node. Soot from pinyon and juniper is the fallback.
- **Plant dyes beside them:** rabbitbrush and ghost gum (yellow, gold) rain-fed; woad (blue) and broom (yellow) irrigated
  on the plateau and rain-fed below 3 km. With iron red, copper teal and a black, `CROPS.canPlaid` passes.

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
- **They live on the cliff edges, and some are truly cliff-dwelling** (the owner, 2026-11-09). The plateau grows junipers,
  not timber; the logs and bamboo come up from Korona's moat forest (Cfa, 800-1,500 mm). So their towns stand on the
  plateau's edges, on the moat's and the canyon's walls, and the plateau is their grazing, raiding and pigment ground.

### 5a. The cliff towns (the owner, 2026-11-09; sites *proposed* from the model)

**Why the cliffs hold houses.** The plateau's rock is `danxia` (thick, hard sandstones) over `badland` (soft clays and ash):
section 2. That is Mesa Verde's geology: the Cliff House sandstone over the Menefee shale. Rain and melt soak down through
the sandstone, stop on the clay and seep out along the contact; frost and the seep spall the sandstone above it into deep
**alcoves**, with a spring at the back of each. The Painted Men build in the alcoves, and on the ledges and talus the
contact leaves below them, as the Dogon do under the Bandiagara escarpment.

| Site | 5.1 px | The model | What stands there |
|---|---|---|---|
| **1. The canyon-mouth town** (the chief cliff town; working name) | the north-facing wall at **1098-1104, 622-628**, steepest at 1101,624 | the wall rises from ~1.5 km at its foot to 3,406 m at the rim (1104,626): **2,224 m of relief within 6 km**; 2,061 m at 1101,624, Cfa, 862 mm, 17 °C (27/6); the rim Dsb, 533 mm, 7 °C; the canyon's mouth lake (516 m, 80 km²) at its foot (1091-1100, 622) | **Mesa Verde-style alcove houses** in tiers up the wall's sunny face (Krator is near 40°S: north faces take the sun), at each seep line; ledge gardens and terraces at 2-2.5 km; fields on the lake's fan; the moat forest's timber at hand. The largest and oldest |
| **2. The canyon ledge villages** | the Painted Canyon's north-facing (south) wall at **1011-1019, 610-612** | 2,983-3,229 m, BSk, 125-141 mm, 10-11 °C (23-24/-2 to -3); ~600 m of relief within 6 km; the canyon floor below at ~2.9 km (station 3, 1034,615, is 15-45 km downstream) | **Bandiagara-style villages**: houses on the talus and the ledges at the wall's foot, granaries and the dead in niches high in the cliff, the fields on the canyon floor watered by the melt stream |
| **3. The moat-wall villages** | the west wall of Korona's moat at **1054-1062, 598-606** (just outside both polygons, on Korona's side) | 1,199 m at 1058,600, Cfa, 1,113 mm, 20 °C (27/12), 1,756 m of relief within 6 km, over the moat's lakes (y 590-598) | the lore's **hung villages**: log houses on cantilever beams driven into the face, tiers joined by stairs and ladders, the timber-cutters' and the trading town with the tepui tribes. *For the owner*: it stands on Korona's ground |
| **4. The hogback eyries** | the east-facing hogback scarps at **977,618** and **954,611** | 3,155 m (BSk, 141 mm, 607 m of relief) and 3,671 m (BSk, 219 mm, 810 m); over the playas at 974,594 and 1008,626 | small, seasonal: lookouts, granaries and a shrine in shallow alcoves, the raiders' watch over the bloom flats and the stone circles |

**What the dwellings look like.**
- **Alcove houses:** the alcove's mouth walled off with a front of raw logs and split bamboo, two or three storeys under the
  overhang, the whole front painted in formline (black, red, teal), thunderbird finials on the posts at the lip, a totem
  at each ledge's end, the raven sign. Where the logs run short (high on the wall), the front is dry-stone and clay daub,
  still painted. Round towers at the alcove's ends; a sunken stone circle (the shamans' house) in the largest.
- **Ledge villages:** clustered houses and flat-roofed granaries on the talus and the ledges, the granaries with conical
  thatch, the cliff above pocked with niche granaries and the dead's caves.
- **Hung villages:** the Highlands Tribal kit's cliff settlement (below): decks on log cantilevers and raking struts.

**How they climb.**
- **Notched-log ladders** (the Dogon's: one trunk, steps cut in it) between ledges, and pole ladders lashed with rawhide;
  the top ones drawn up at night: the towns are raiders' and fear raiders.
- **Toeholds:** hand-and-toe holds pecked up the rock between alcoves (Mesa Verde's), the quick way and the secret one.
- **Log stair-walks** on beams driven into the face along each tier; rope and bamboo bridges across clefts.
- **Calls:** they whistle across the cliffs in the Hum (`LORE.md` §6.5).

**How the biome kit marks the sites.** The kit draws no building. It draws the landform and leaves it ready:
- the **alcoves** as `KCARVE` alcoves (`36-core-carve.js`) in the `danxia` faces at the sandstone-clay contact, with a seep
  (`WATER.spring`) at each back wall;
- the **ledges** as `KRELIEF.stepcut` treads on the wall, the **talus** as `KRELIEF` talus at its foot;
- each alcove, ledge and talus bench registered in `core/tags` as a site record (*proposed*: `site: 'cliff-alcove' |
  'cliff-ledge' | 'talus-bench'`, with its floor height, depth, width, aspect, the seep's position and a ladder line to the
  next), and masked bare of flora in `KMASK`;
- nothing placed in them: the settlement plan reads the records.

**Who builds the buildings.** A settlement plan (one per town, on `core/city` where it has streets, `core/hamlet` for the
villages) with the **Highlands Tribal kit** (`settlements/highlands`, `84-tri-dwell.js`: the dwellings, the cliff
cantilever base and the reusable cliff settlement with its ladders, shrine and lookout) and the catalog's **`painted`**
culture (`kits/catalog`, the Painted Men's furniture, Tlingit-influenced). The alcove house, the stone-and-daub front, the
niche granary and the notched-log ladder are **new pieces for that kit**, not this one. *Proposed*: the four sites go on
the model as settlement markers (`60-settlements.js`) when the owner names them.
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
| **4 The cliff town** (`-cliff`, the ecotone; re-sited 2026-11-09 from 1113,624) | **1101,624** | on the wall at 2,061 m, Cfa, 862 mm, 17 °C (27/6); the rim 3,406 m at 1104,626; the canyon's mouth lake (516 m) at its foot; 2,224 m of relief within 6 km | the canyon-mouth town's wall (section 5a, site 1): tiers of alcoves at the seep lines, ledges and talus, all empty for the settlement plan to fill; seeps and hanging gardens; Korona's ring species climbing the face; the lake below |

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
| relief | `KRELIEF` (38): `dome`, `wadi`, `talus`; `38c` `stepcut` for the canyon's bench and the cliff towns' ledges | the clay hills, the washes, the scarps' feet; the ledges (section 5a) |
| alcoves | `KCARVE` alcoves (36), with `WATER.spring` seeps | the cliff towns' alcoves at the sandstone-clay contact (section 5a), registered as site records |
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
| city, hamlet | `core/city`, `core/hamlet` | no: the kit places no settlement; the cliff towns' settlement plans take them, with the Highlands Tribal kit and the catalog's `painted` culture |

**Core amendments needed:**
1. **The gorge flood** (a timed `drown` and `crush` that runs a channel): already listed by other plans (firebliss and
   others); cite it, do not re-propose it.
2. **A season-keyed flower drift** that follows a strata bed: *proposed* as a kit-side mask (the drift's species read from
   `S.at` at the ground), not a core change. If two kits want it (ebadlands' spring?), it moves to `core/biome`.
3. **The player-settlement registry** (open world): this kit offers hints only.

## 9. For the owner

- ~~**Where the Painted Men live.**~~ **Settled (the owner, 2026-11-09): on the cliff edges, some truly cliff-dwelling.**
  Section 5a proposes four sites: the canyon-mouth town (1098-1104, 622-628), the canyon ledge villages (1011-1019,
  610-612), the moat-wall villages (1054-1062, 598-606) and the hogback eyries (977,618; 954,611). Still open:
  - the sites, and their names (the `painted` tongue);
  - the moat-wall villages stand just outside both polygons, on Korona's ground: theirs by treaty with the tepui tribes, or
    moved onto the plateau's side?
  - markers on the model (`60-settlements.js`) for the four;
  - the new pieces (alcove house, daub front, niche granary, notched-log ladder): in the Highlands Tribal kit, or a new
    Painted Men building kit on the catalog?
- **The crops** (section 4, a proposal from `CROPS.at`): accept the `paintedhighlands` entry and its five zones; add the
  bulb and the paintbrush as native records; add a black (`lignite-black` on a coal node, or manganese) and, if the teal bed
  is clay, `celadonite-teal`.
- **The lost playa.** Gemini's fourth playa fell into Korona's moat on 5.1. Keep three, or ask for one moved?
- **The polygon.** It takes in part of Korona's moat and a strip of the crater's edge. Trim it to the plateau, or let the kit
  hand those edges to Korona and the crater kits as ecotones?
- **Names.** The canyon, the playas and the hogbacks have only English names. Do they take Painted Men names (the `painted`
  tongue)?
- **The teal bed.** Copper (a resource node, `kits/resources`) or a clay (pigment only)?
- **The fourth station:** re-sited to the canyon-mouth town's wall (1101,624) as the cliff dwellers' page: wanted?

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
- `kits/crops/src/10-crop-core.js` (no entry yet), `40-crop-query.js`, `API.md`, `PLAN.md`; `CROPS.at` run in node over the
  zones (2026-11-09);
- the cliff sites by relief within 6 km and slope aspect on the model, inside the biome and the Painted Men's polygons
  (2026-11-09); `settlements/highlands/src/84-tri-dwell.js` (the Tribal cliff settlement); `kits/catalog/README.md` (the
  `painted` culture); Mesa Verde's alcoves (Cliff House sandstone over Menefee shale) and the Bandiagara escarpment.
